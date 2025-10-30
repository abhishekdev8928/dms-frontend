// src/config/useUploadStore.ts

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
  uploads: UploadFile[];
  addFile: (file: File) => string;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string, url?: string) => void;
  failUpload: (id: string) => void;
  removeUpload: (id: string) => void;
}

export const useUploadStore = create<UploadStore>()(
  devtools(
    (set) => ({
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

      removeUpload: (id) =>
        set((state) => ({
          uploads: state.uploads.filter((u) => u.id !== id),
        })),
    }),
    { name: "UploadStore" }
  )
);