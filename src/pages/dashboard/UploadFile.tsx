import api from "@/config/axios";
import { useUploadStore } from "@/config/useUploadStore";
import axios from "axios";
import { toast } from "sonner";

export const uploadFiles = async (
  files: File[],
  folderId?: string,
  departmentId?: string
) => {
  const { addFile, updateProgress, completeUpload, failUpload } =
    useUploadStore.getState();

  try {
    // 1️⃣ Generate presigned URLs
    const requestPayload = files.map((f) => ({
      filename: f.name,
      mimeType: f.type,
    }));

    const response = await api.post("/documents/presigned-urls", {
      files: requestPayload,
    });

    const presignedFiles = response.data.data;
    if (!Array.isArray(presignedFiles)) {
      throw new Error("Invalid presigned URL response: expected 'data' array");
    }

    // 2️⃣ Upload each file to S3 and save metadata to DB
    await Promise.all(
      presignedFiles.map(
        async (
          item: { filename: string; key: string; url: string },
          index: number
        ) => {
          const file = files[index];
          const id = addFile(file);

          try {
            // Upload to S3
            await axios.put(item.url, file, {
              headers: { "Content-Type": file.type },
              onUploadProgress: (e) => {
                const percent = Math.round((e.loaded * 100) / e.total!);
                updateProgress(id, percent);
              },
            });

            // ✅ Save document metadata to DB (matches createDocumentMetadata)
            await api.post("/documents/", {
              title: file.name.split(".")[0],
              originalFileName: file.name,
              fileUrl: item.url.split("?")[0],
              fileKey: item.key,
              fileType: file.type.split("/")[1],
              fileSize: file.size,
              folderId: folderId || null,
              departmentId: departmentId || null,
              tags: [], // optional
              metadata: {}, // optional
            });

            completeUpload(id, item.url);
            toast.success(`✅ ${file.name} uploaded successfully`);
          } catch (err) {
            failUpload(id);
            console.error(`${file.name} failed to upload`, err);
            toast.error(`❌ ${file.name} failed to upload`);
          }
        }
      )
    );

    toast.success("🎉 All files uploaded successfully");
  } catch (err) {
    console.error("Failed to generate upload URLs", err);
    toast.error("Upload failed", {
      description: "Error while generating presigned URLs.",
    });
  }
};
