import { FolderPlus, Upload } from "lucide-react";
import { Button } from "../ui/button";

function EmptyState({
  onUpload,
  dragActive,
  onCreateFolder,
}: {
  onUpload: () => void;
  dragActive: boolean;
  onCreateFolder: () => void;
}) {
  return (
    <div
      className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onUpload}
    >
      <div
        className={`text-center transition-all ${
          dragActive ? "scale-105" : ""
        }`}
      >
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-32 h-32 text-gray-400" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {dragActive ? "Drop files here" : "Click anywhere to upload"}
        </h2>
        <p className="text-gray-600 mb-6">or drag and drop files</p>

        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onCreateFolder();
          }}
          className="mb-4"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Create Folder
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Supported: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 4GB)
        </p>
      </div>
    </div>
  );
}





export default EmptyState;