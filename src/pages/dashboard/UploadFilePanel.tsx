import FileUploadCard from "@/components/custom/document/UploadFile";
import { useSearchParams } from "react-router-dom";

export default function UploadFilePanel() {
  const [searchParams] = useSearchParams();

  const folderId = searchParams.get("folderId");
  const departmentId = searchParams.get("departmentId");
  const isReupload = searchParams.get("reupload") === "true";
  const documentId = searchParams.get("documentId");

  return (
    <FileUploadCard
      folderId={folderId}
      departmentId={departmentId}
      isReupload={isReupload}
      documentId={documentId}
    />
  );
}
