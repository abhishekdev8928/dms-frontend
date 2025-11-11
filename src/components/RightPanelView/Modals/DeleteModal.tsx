import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FileItem {
  _id: string;
  name: string;
  itemType: "file" | "folder";
  type: "document" | "folder";
  parent_id?: string;
  color?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  fileUrl?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  hasChildren?: boolean;
  description?: string;
  tags?: string[];
  extension?: string;
}



export default function DeleteModal({
  open,
  onOpenChange,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move to Trash</DialogTitle>
          <DialogDescription>
            Are you sure you want to move "{item?.name}" to trash? You can
            restore it later from the trash.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Move to Trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}