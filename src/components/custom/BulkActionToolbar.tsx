import { Button } from "@/components/ui/button";
import { Download, Trash2, X, FolderInput, Share2 } from "lucide-react";

interface BulkActionToolbarProps {
  selectionCount: number;
  onClearSelection: () => void;
   onDeleteSelected: () => void;
   onDownloadSelected: () => void;
}

export function BulkActionToolbar({
  selectionCount,
  onClearSelection,
  onDeleteSelected,
  onDownloadSelected,
}: BulkActionToolbarProps) {

  return (
    <div className="flex rounded-full mt-6 items-center gap-4 px-2 py-2 border-b bg-[#f0f4f9]">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="hover:bg-gray-200"
      >
        <X className="w-5 h-5" />
      </Button>
      
      <span className="text-sm font-medium">{selectionCount} selected</span>

      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="ghost"
          size="icon"
          // onClick={onDownload}
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
          onClick={onDeleteSelected}
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}