import { useState } from "react";
import type { FileItem } from "@/types/documentTypes";
import type { Department } from "@/config/api/departmentApi";

export const useModalState = () => {
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState<"add" | "edit">("add");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [shareModalOpen , setShareModalOpen] = useState<boolean>(false);

 const openShareModal = (open: boolean) => {
    setShareModalOpen(open);
  } 
  

  const openRenameModal = (item: FileItem) => {
    setSelectedItem(item);
    setRenameModalOpen(true);
  };

  const openDeleteModal = (item: FileItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const openTagsModal = (item: FileItem) => {
    setSelectedItem(item);
    setTagsModalOpen(true);
  };



  const openDepartmentModal = (mode: "add" | "edit", department?: Department) => {
    setDepartmentModalMode(mode);
    if (department) {
      setSelectedDepartment(department);
    }
    setDepartmentModalOpen(true);
  };

  const closeDepartmentModal = () => {
    setDepartmentModalOpen(false);
    setSelectedDepartment(null);
  };

  return {
    renameModalOpen,
    setRenameModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    tagsModalOpen,
    setTagsModalOpen,
    createFolderModalOpen,
    setCreateFolderModalOpen,
    departmentModalOpen,
    setDepartmentModalOpen,
    departmentModalMode,
    selectedDepartment,
    selectedItem,
    shareModalOpen,
    openShareModal,
    setSelectedItem,
    openRenameModal,
    openDeleteModal,
    openTagsModal,
    openDepartmentModal,
    closeDepartmentModal,
    
    
  };
};
