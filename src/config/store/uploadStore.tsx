import { create } from 'zustand';

export interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status:
    | 'Pending Upload'
    | 'Uploading File'
    | 'Processing File'
    | 'Upload Complete'
    | 'Upload Failed'
    | 'Upload Cancelled';
  errorMessage?: string;
  cancelToken?: AbortController;
}

interface UploadStore {
  uploads: UploadingFile[];
  isOpen: boolean;
  isExpanded: boolean;

  // Actions
  addUpload: (file: UploadingFile) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (
    id: string,
    status: UploadingFile['status'],
    errorMessage?: string
  ) => void;
  removeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  clearCompleted: () => void;
  setOpen: (isOpen: boolean) => void;
  setExpanded: (isExpanded: boolean) => void;
  toggleExpanded: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: [],
  isOpen: false,
  isExpanded: false,

  // ➕ Add a new upload (auto-open + expand)
  addUpload: (file) => {
    set((state) => ({
      uploads: [...state.uploads, file],
      isOpen: true,
      isExpanded: true,
    }));
  },

  // 📈 Update upload progress
  updateProgress: (id, progress) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id ? { ...upload, progress } : upload
      ),
    }));
  },

  // ⚙️ Update status or error message
  setStatus: (id, status, errorMessage) => {
    
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id ? { ...upload, status, errorMessage } : upload
      ),
    }));
  },

  // ❌ Remove a specific upload completely
  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    }));
  },

  // 🚫 Cancel an ongoing upload
  cancelUpload: (id) => {
    const upload = get().uploads.find((u) => u.id === id);
    if (upload?.cancelToken) {
      upload.cancelToken.abort();
    }
    // ✅ Use consistent status label
    get().setStatus(id, 'Upload Cancelled');
  },

  // 🧹 Clear completed, failed, or cancelled uploads
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

  // 🔄 Panel open/expand controls
  setOpen: (isOpen) => set({ isOpen }),
  setExpanded: (isExpanded) => set({ isExpanded }),
  toggleExpanded: () =>
    set((state) => ({ isExpanded: !state.isExpanded })),
}));
