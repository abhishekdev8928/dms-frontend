// src/api/documentApi.ts

import api from "@/config/axios";

/**
 * @desc Create new document metadata
 */
export const createDocumentMetadata = async (data: {
  title: string;
  originalFileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  folderId?: string | null;
  departmentId?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
}) => {
  const res = await api.post("/documents", data);
  return res.data;
};

/**
 * @desc Create new version metadata for existing document
 */
export const createNewVersionMetadata = async (
  documentId: string,
  data: {
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    changes?: string;
  }
) => {
  const res = await api.post(`/documents/${documentId}/versions`, data);
  return res.data;
};