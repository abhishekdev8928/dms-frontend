import api from "@/config/axios";
import { useUploadStore } from "@/config/useUploadStore";
import axios from "axios";

// ✅ Extract correct extension even from complex MIME types
const getFileExtension = (file: File) => {
  // 1️⃣ Name-based extraction (most reliable)
  const extFromName = file.name.split(".").pop()?.toLowerCase();
  
  if (extFromName) return extFromName;

  // 2️⃣ Fallback: MIME normalization
  const mime = file.type.toLowerCase()
    .replace("application/", "")
    .replace("x-", "");

  return mime || "unknown";
};

export const uploadFiles = async (files: File[], folderId?: string, departmentId?: string) => {
  const { addFile, updateProgress, completeUpload, failUpload } =
    useUploadStore.getState();

  try {
    // ✅ Step 1: Request presigned URLs
    const requestPayload = files.map((file) => ({
      filename: file.name,
      mimeType: file.type,
    }));

    const { data } = await api.post("/documents/presigned-urls", {
      files: requestPayload,
    });

    const presignedFiles = data?.data;
    if (!Array.isArray(presignedFiles)) {
      throw new Error("Invalid presigned URL response: expected an array");
    }

    // ✅ Step 2: Upload + Save Metadata
    await Promise.all(
      presignedFiles.map(async (item: any, index: number) => {
        const file = files[index];
        const uploadId = addFile(file);

        try {
          // ✅ Upload to S3
          await axios.put(item.url, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (e) => {
              const percent = Math.round((e.loaded * 100) / (e.total || 1));
              updateProgress(uploadId, percent);
            },
          });

          // ✅ Prepare metadata for DB
          const metadataBody = {
            title: file.name,
            originalFileName: file.name,
            fileUrl: item.url.split("?")[0],
            fileKey: item.key,
            fileType: getFileExtension(file), // ✅ FIX HERE ✅
            fileSize: file.size,
            folderId: folderId || null,
            departmentId: departmentId || null,
          };

          await api.post("/documents", metadataBody);

          completeUpload(uploadId, item.url);
        } catch (error) {
          failUpload(uploadId);
          console.error(`${file.name} upload failed`, error);
        }
      })
    );
  } catch (error) {
    console.error("Upload process failed:", error);
  }
};
