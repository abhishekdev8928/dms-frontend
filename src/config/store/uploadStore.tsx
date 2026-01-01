/**
 * ============================================================================
 * UPLOAD STORE - Manages file upload state with chunked upload support
 * ============================================================================
 * 
 * Features:
 * - Direct upload (small files via presigned URL)
 * - Chunked upload (large files >100MB)
 * - Progress tracking per file
 * - Upload cancellation support
 * - Auto-open/expand on new uploads
 * - Prevent page close during active uploads
 * 
 * Upload Flow:x
 * 1. Pending Upload → Initial state
 * 2. Uploading File → S3 upload in progress
 * 3. Processing File → Creating document record
 * 4. Upload Complete → Success
 * 5. Upload Failed / Upload Cancelled → Error states
 */

import { create } from 'zustand';
import { useEffect } from 'react';



export type UploadMethod = 'direct' | 'chunked';

export type UploadStatus =
  | 'Pending Upload'      // Waiting to start
  | 'Uploading File'      // Uploading to S3
  | 'Processing File'     // Creating document record
  | 'Upload Complete'     // Successfully completed
  | 'Upload Failed'       // Failed with error
  | 'Upload Cancelled';   // User cancelled

export interface UploadingFile {
  id: string;                       // Unique upload ID
  name: string;                     // Original filename
  size: number;                     // File size in bytes
  progress: number;                 // Upload progress (0-100)
  status: UploadStatus;             // Current status
  method: UploadMethod;             // Upload method used
  errorMessage?: string;            // Error message if failed
  cancelToken?: AbortController;    // For cancellation
  
  // Chunked upload specific (optional)
  uploadId?: string;                // S3 multipart upload ID
  totalChunks?: number;             // Total number of chunks
  uploadedChunks?: number;          // Number of uploaded chunks
}

interface UploadStore {
  uploads: UploadingFile[];
  isOpen: boolean;
  isExpanded: boolean;

  // Core Actions
  addUpload: (file: UploadingFile) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadStatus, errorMessage?: string) => void;
  removeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  clearCompleted: () => void;
  
  // Chunked upload specific
  updateChunkProgress: (id: string, uploadedChunks: number) => void;
  
  // UI Controls
  setOpen: (isOpen: boolean) => void;
  setExpanded: (isExpanded: boolean) => void;
  toggleExpanded: () => void;
  
  // Helpers
  hasActiveUploads: () => boolean;
  getActiveCount: () => number;
  getCompletedCount: () => number;
  getFailedCount: () => number;
}

/* =======================================================
   STORE IMPLEMENTATION
   ======================================================= */

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: [],
  isOpen: false,
  isExpanded: false,

  /* ===== CORE ACTIONS ===== */

  /**
   * Add a new upload to the queue
   * Auto-opens and expands the upload panel
   */
  addUpload: (file) => {
    set((state) => ({
      uploads: [...state.uploads, file],
      isOpen: true,
      isExpanded: true,
    }));
  },

  /**
   * Update upload progress percentage (0-100)
   */
  updateProgress: (id, progress) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id 
          ? { ...upload, progress: Math.min(100, Math.max(0, progress)) } 
          : upload
      ),
    }));
  },

  /**
   * Update upload status and optional error message
   */
  setStatus: (id, status, errorMessage) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id 
          ? { ...upload, status, errorMessage, progress: status === 'Upload Complete' ? 100 : upload.progress } 
          : upload
      ),
    }));
  },

  /**
   * Remove a specific upload from the queue
   */
  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    }));
  },

  /**
   * Cancel an ongoing upload
   */
  cancelUpload: (id) => {
    const upload = get().uploads.find((u) => u.id === id);
    
    // Abort the upload if controller exists
    if (upload?.cancelToken) {
      upload.cancelToken.abort();
    }
    
    // Update status
    get().setStatus(id, 'Upload Cancelled');
  },

  /**
   * Clear all completed, failed, or cancelled uploads
   */
  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter(
        (upload) =>
          upload.status !== 'Upload Complete' &&
          upload.status !== 'Upload Failed' &&
          upload.status !== 'Upload Cancelled'
      ),
    }));
  },

  /* ===== CHUNKED UPLOAD SPECIFIC ===== */

  /**
   * Update chunk progress for chunked uploads
   */
  updateChunkProgress: (id, uploadedChunks) => {
    set((state) => ({
      uploads: state.uploads.map((upload) => {
        if (upload.id === id && upload.totalChunks) {
          const progress = Math.round((uploadedChunks / upload.totalChunks) * 100);
          return { ...upload, uploadedChunks, progress };
        }
        return upload;
      }),
    }));
  },

  /* ===== UI CONTROLS ===== */

  /**
   * Show/hide upload panel
   */
  setOpen: (isOpen) => set({ isOpen }),

  /**
   * Expand/collapse upload panel
   */
  setExpanded: (isExpanded) => set({ isExpanded }),

  /**
   * Toggle expanded state
   */
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  /* ===== HELPER FUNCTIONS ===== */

  /**
   * Check if there are any active uploads
   */
  hasActiveUploads: () => {
    const { uploads } = get();
    return uploads.some(
      (upload) =>
        upload.status === 'Pending Upload' ||
        upload.status === 'Uploading File' ||
        upload.status === 'Processing File'
    );
  },

  /**
   * Get count of active uploads
   */
  getActiveCount: () => {
    const { uploads } = get();
    return uploads.filter(
      (upload) =>
        upload.status === 'Pending Upload' ||
        upload.status === 'Uploading File' ||
        upload.status === 'Processing File'
    ).length;
  },

  /**
   * Get count of completed uploads
   */
  getCompletedCount: () => {
    const { uploads } = get();
    return uploads.filter((upload) => upload.status === 'Upload Complete').length;
  },

  /**
   * Get count of failed uploads
   */
  getFailedCount: () => {
    const { uploads } = get();
    return uploads.filter(
      (upload) =>
        upload.status === 'Upload Failed' ||
        upload.status === 'Upload Cancelled'
    ).length;
  },
}));




export const useUploadWarning = () => {
  const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveUploads()) {
        // Standard way to trigger browser warning
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        // Some browsers show this message (most show their own)
        return 'You have uploads in progress. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasActiveUploads]);
};


export const useActiveUploads = () => {
  return useUploadStore((state) =>
    state.uploads.filter(
      (upload) =>
        upload.status === 'Pending Upload' ||
        upload.status === 'Uploading File' ||
        upload.status === 'Processing File'
    )
  );
};


export const useCompletedUploads = () => {
  return useUploadStore((state) =>
    state.uploads.filter((upload) => upload.status === 'Upload Complete')
  );
};


export const useFailedUploads = () => {
  return useUploadStore((state) =>
    state.uploads.filter(
      (upload) =>
        upload.status === 'Upload Failed' ||
        upload.status === 'Upload Cancelled'
    )
  );
};