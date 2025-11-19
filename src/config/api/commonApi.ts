import { z } from "zod";
import httpClient from "../httpClient";

const bulkDeletionSchema = z
  .object({
    fileIds: z.array(z.string()).optional().default([]),
    folderIds: z.array(z.string()).optional().default([]),
  })
  .refine((data) => data.fileIds.length > 0 || data.folderIds.length > 0, {
    message: "At least one fileId or folderId must be provided",
  });

export const bulkDeleteion = async (data: {
  fileIds: string[];
  folderIds: string[];
}) => {
  const validated = bulkDeletionSchema.safeParse(data);
  console.log(validated);
  const res = await httpClient.delete("/multi/items", validated)


  return res.data;
};
