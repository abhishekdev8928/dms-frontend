import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateDownloadUrl } from "@/config/api/documentApi";
import type { FileItem } from "@/types/documentTypes";

const getFormattedDateTime = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
};

export const useItemActions = (
  setSelectedItem: (item: FileItem | null) => void,
  setRenameModalOpen: (open: boolean) => void,
  setDeleteModalOpen: (open: boolean) => void,
  setTagsModalOpen: (open: boolean) => void,
  setShareModalOpen: (open: boolean) => void,
  setSelectedFileId: (id: string | null) => void,
  toggleInfoPanel: () => void 
) => {
  const navigate = useNavigate();

  const handleDownload = async (item: FileItem) => {
    try {
      const response = await generateDownloadUrl(item._id);
      window.open(response?.data?.url, "_blank");
      toast.success("Download started", {
        description: getFormattedDateTime(),
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        description: getFormattedDateTime(),
      });
    }
  };

  const handleShowInfo = (item: FileItem) => {
    setSelectedFileId(item._id);
    setSelectedItem(item);
    toggleInfoPanel(); // ✅ Use toggleInfoPanel instead of setShowInfoPanel(true)
  };

  const handleItemClick = (item: FileItem, clearSelection: () => void) => {
    if (item.type === "folder") {
      navigate(`/dashboard/folder/${item._id}`);
      clearSelection();
    }
  };

  const handleRename = (item: FileItem) => {
    setSelectedItem(item);
    setRenameModalOpen(true);
  };

  const handleDelete = (item: FileItem) => { // ✅ Accept item parameter
    setSelectedItem(item); // ✅ Set the item first
    setDeleteModalOpen(true);
  };

  const handleAddTags = (item: FileItem) => {
    setSelectedItem(item);
    setTagsModalOpen(true);
  };

  const handleShare = (item: FileItem) => { // ✅ Accept FileItem instead of id
    setSelectedItem(item); // ✅ Set the entire item
    setShareModalOpen(true);
  };

  const navigateToFolder = (folderId: string) => {
    navigate(`/dashboard/folder/${folderId}`);
  };

  return {
    handleDownload,
    handleShowInfo,
    handleItemClick,
    handleRename,
    handleDelete,
    handleAddTags,
    navigateToFolder,
    handleShare,
  };
};