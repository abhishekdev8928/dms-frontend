/**
 * ============================================================================
 * UPLOAD STORE - Fixed chunked upload progress tracking
 * ============================================================================
 */

import { create } from 'zustand';
import { useEffect } from 'react';

export type UploadMethod = 'direct' | 'chunked';

export type UploadStatus =
  | 'Pending Upload'
  | 'Uploading File'
  | 'Processing File'
  | 'Upload Complete'
  | 'Upload Failed'
  | 'Upload Cancelled';

export interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  method: UploadMethod;
  errorMessage?: string;
  cancelToken?: AbortController;
  uploadId?: string;
  totalChunks?: number;
  uploadedChunks?: number;
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
  
  // ✅ NEW: Update total chunks (call this after backend responds)
  updateTotalChunks: (id: string, totalChunks: number) => void;
  
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

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: [],
  isOpen: false,
  isExpanded: false,

  /* ===== CORE ACTIONS ===== */

  addUpload: (file) => {
    set((state) => ({
      uploads: [...state.uploads, file],
      isOpen: true,
      isExpanded: true,
    }));
    
    // ✅ Debug log
    console.log(`📝 Added upload to store:`, {
      id: file.id,
      name: file.name,
      method: file.method,
      totalChunks: file.totalChunks,
    });
  },

  updateProgress: (id, progress) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id 
          ? { ...upload, progress: Math.min(100, Math.max(0, progress)) } 
          : upload
      ),
    }));
  },

  setStatus: (id, status, errorMessage) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id 
          ? { 
              ...upload, 
              status, 
              errorMessage, 
              progress: status === 'Upload Complete' ? 100 : upload.progress 
            } 
          : upload
      ),
    }));
    
    // ✅ Debug log
    console.log(`📊 Status updated: ${id} → ${status}`);
  },

  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    }));
  },

  cancelUpload: (id) => {
    const upload = get().uploads.find((u) => u.id === id);
    
    if (upload?.cancelToken) {
      upload.cancelToken.abort();
    }
    
    get().setStatus(id, 'Upload Cancelled');
  },

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
   * ✅ NEW: Update total chunks after backend responds
   * Call this immediately after initiateChunkedUpload() returns
   */
  updateTotalChunks: (id, totalChunks) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id
          ? { ...upload, totalChunks }
          : upload
      ),
    }));
    
    // ✅ Debug log
    console.log(`🔢 Updated totalChunks for ${id}: ${totalChunks}`);
  },

  /**
   * ✅ FIXED: Update chunk progress with better error handling
   */
  updateChunkProgress: (id, uploadedChunks) => {
    set((state) => ({
      uploads: state.uploads.map((upload) => {
        if (upload.id === id) {
          // ✅ Better validation
          if (!upload.totalChunks || upload.totalChunks === 0) {
            console.warn(`⚠️ totalChunks not set for upload ${id}`);
            return upload;
          }
          
          const progress = Math.round((uploadedChunks / upload.totalChunks) * 100);
          
          // ✅ Debug log
          console.log(`📈 Chunk progress for ${upload.name}:`, {
            uploadedChunks,
            totalChunks: upload.totalChunks,
            progress: `${progress}%`,
          });
          
          return { ...upload, uploadedChunks, progress };
        }
        return upload;
      }),
    }));
  },

  /* ===== UI CONTROLS ===== */

  setOpen: (isOpen) => set({ isOpen }),
  setExpanded: (isExpanded) => set({ isExpanded }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  /* ===== HELPER FUNCTIONS ===== */

  hasActiveUploads: () => {
    const { uploads } = get();
    return uploads.some(
      (upload) =>
        upload.status === 'Pending Upload' ||
        upload.status === 'Uploading File' ||
        upload.status === 'Processing File'
    );
  },

  getActiveCount: () => {
    const { uploads } = get();
    return uploads.filter(
      (upload) =>
        upload.status === 'Pending Upload' ||
        upload.status === 'Uploading File' ||
        upload.status === 'Processing File'
    ).length;
  },

  getCompletedCount: () => {
    const { uploads } = get();
    return uploads.filter((upload) => upload.status === 'Upload Complete').length;
  },

  getFailedCount: () => {
    const { uploads } = get();
    return uploads.filter(
      (upload) =>
        upload.status === 'Upload Failed' ||
        upload.status === 'Upload Cancelled'
    ).length;
  },
}));

/* ===== HOOKS ===== */

export const useUploadWarning = () => {
  const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveUploads()) {
        e.preventDefault();
        e.returnValue = '';
        return 'You have uploads in progress. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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