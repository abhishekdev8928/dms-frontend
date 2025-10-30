// src/utils/UploadFileHelper.ts

import api from "@/config/axios";
import { useUploadStore } from "@/config/useUploadStore";
import axios from "axios";
import { createDocumentMetadata, createNewVersionMetadata } from "@/config/api/documentApi";

const getFileExtension = (file: File) => {
  const extFromName = file.name.split(".").pop()?.toLowerCase();
  if (extFromName) return extFromName;

  const mime = file.type.toLowerCase()
    .replace("application/", "")
    .replace("x-", "");

  return mime || "unknown";
};

interface UploadOptions {
  files: File[];
  folderId?: string;
  departmentId?: string;
  isReupload?: boolean;
  documentId?: string;
  versionChanges?: string;
}

export const uploadFiles = async ({
  files,
  folderId,
  departmentId,
  isReupload = false,
  documentId,
  versionChanges,
}: UploadOptions) => {
  const { addFile, updateProgress, completeUpload, failUpload } =
    useUploadStore.getState();

  // Validation
  if (isReupload && !documentId) {
    throw new Error("documentId is required for re-uploads");
  }

  if (isReupload && files.length > 1) {
    throw new Error("Re-upload only supports single file");
  }

  try {
    // Step 1: Request presigned URLs
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

    // Step 2: Upload + Save Metadata
    await Promise.all(
      presignedFiles.map(async (item: any, index: number) => {
        const file = files[index];
        const uploadId = addFile(file);

        try {
          // Upload to S3
          await axios.put(item.url, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (e) => {
              const percent = Math.round((e.loaded * 100) / (e.total || 1));
              updateProgress(uploadId, percent);
            },
          });

          const fileUrl = item.url.split("?")[0];

          // CONDITIONAL API CALL BASED ON isReupload FLAG
          if (isReupload && documentId) {
            // Call reupload/version API
            await createNewVersionMetadata(documentId, {
              fileUrl,
              fileKey: item.key,
              fileSize: file.size,
              changes: versionChanges || `Re-uploaded ${file.name}`,
            });
          } else {
            // Call new document API
            await createDocumentMetadata({
              title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              originalFileName: file.name,
              fileUrl,
              fileKey: item.key,
              fileType: getFileExtension(file),
              fileSize: file.size,
              folderId: folderId || null,
              departmentId: departmentId || null,
            });
          }

          completeUpload(uploadId, fileUrl);
        } catch (error) {
          failUpload(uploadId);
          console.error(`${file.name} upload failed`, error);
          throw error;
        }
      })
    );
  } catch (error) {
    console.error("Upload process failed:", error);
    throw error;
  }
};