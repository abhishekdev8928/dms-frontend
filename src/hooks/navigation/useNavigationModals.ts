import { useState } from "react";
import { toast } from "sonner";

export const useNavigationModals = (parentId?: string) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const openUserModal = () => {
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
  };

  const openDeptModal = () => {
    setIsDeptModalOpen(true);
  };

  const closeDeptModal = () => {
    setIsDeptModalOpen(false);
  };

  const openFolderModal = () => {
    if (!parentId) {
      toast.warning("No Folder Selected", {
        description: "Please select a parent folder before creating a new folder.",
      });
      return;
    }
    setIsFolderModalOpen(true);
  };

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
  };

  const closeAllModals = () => {
    setIsUserModalOpen(false);
    setIsDeptModalOpen(false);
    setIsFolderModalOpen(false);
  };

  return {
    // User Modal
    isUserModalOpen,
    openUserModal,
    closeUserModal,
    setIsUserModalOpen,

    // Department Modal
    isDeptModalOpen,
    openDeptModal,
    closeDeptModal,
    setIsDeptModalOpen,

    // Folder Modal
    isFolderModalOpen,
    openFolderModal,
    closeFolderModal,
    setIsFolderModalOpen,

    // Utility
    closeAllModals,
  };
};