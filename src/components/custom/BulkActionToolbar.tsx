import { Button } from "@/components/ui/button";
import { Download, Trash2, X, FolderInput, Share2 } from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  onDelete,
  onDownload,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b bg-blue-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="hover:bg-gray-200"
      >
        <X className="w-5 h-5" />
      </Button>
      
      <span className="text-sm font-medium">{selectedCount} selected</span>

      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownload}
          title="Download"
        >
          <Download className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Move to folder"
        >
          <FolderInput className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}