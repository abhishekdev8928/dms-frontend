import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
}

interface UploadStore {
  folderId: string | null;
  departmentId: string | null;

  setFolderId: (id: string | null) => void;
  setDepartmentId: (id: string | null) => void;

  isDialogOpen: boolean;
  openDialog: (ids?: { folderId?: string; departmentId?: string }) => void;
  closeDialog: () => void;

  uploads: UploadFile[];
  addFile: (file: File) => string;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string, url?: string) => void;
  failUpload: (id: string) => void;
}

export const useUploadStore = create<UploadStore>()(
  devtools(
    (set) => ({
      folderId: null,
      departmentId: null,

      setFolderId: (id) => set({ folderId: id, departmentId: null }),
      setDepartmentId: (id) => set({ departmentId: id, folderId: null }),

      isDialogOpen: false,
      openDialog: (ids) =>
        set({
          isDialogOpen: true,
          folderId: ids?.folderId ?? null,
          departmentId: ids?.departmentId ?? null,
        }),
      closeDialog: () =>
        set({ isDialogOpen: false, folderId: null, departmentId: null }),

      uploads: [],

      addFile: (file) => {
        const id = crypto.randomUUID();
        set((state) => ({
          uploads: [
            ...state.uploads,
            { id, file, name: file.name, progress: 0, status: "uploading" },
          ],
        }));
        return id;
      },

      updateProgress: (id, progress) =>
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === id ? { ...u, progress } : u
          ),
        })),

      completeUpload: (id, url) =>
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === id ? { ...u, status: "success", progress: 100, url } : u
          ),
        })),

      failUpload: (id) =>
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === id ? { ...u, status: "error" } : u
          ),
        })),
    }),
    { name: "UploadStore" }
  )
);
