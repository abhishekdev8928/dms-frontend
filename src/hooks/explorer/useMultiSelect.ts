

import { useState } from "react";

interface SelectionState {
  fileIds: string[];
  folderIds: string[];
}

interface SelectModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export const useMultiSelect = (items: any[]) => {
  const [selectedIds, setSelectedIds] = useState<SelectionState>({
    fileIds: [],
    folderIds: [],
  });
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const selectItem = (
    item: { id: string; type: string },
    itemIndex: number,
    modifiers: SelectModifiers
  ) => {
    const key = item.type === "folder" ? "folderIds" : "fileIds";

    // Shift + Click: Range selection
    if (modifiers.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, itemIndex);
      const end = Math.max(lastSelectedIndex, itemIndex);
      
      const rangeItems = items.slice(start, end + 1);
      const newFileIds: string[] = [];
      const newFolderIds: string[] = [];

      rangeItems.forEach((rangeItem) => {
        if (rangeItem.type === "folder") {
          newFolderIds.push(rangeItem._id);
        } else {
          newFileIds.push(rangeItem._id);
        }
      });

      setSelectedIds({
        fileIds: [...new Set([...selectedIds.fileIds, ...newFileIds])],
        folderIds: [...new Set([...selectedIds.folderIds, ...newFolderIds])],
      });
    }
    // Ctrl/Cmd + Click: Toggle individual item
    else if (modifiers.ctrlKey || modifiers.metaKey) {
      setSelectedIds((prev) => {
        const exists = prev[key].includes(item.id);
        return {
          ...prev,
          [key]: exists
            ? prev[key].filter((id) => id !== item.id)
            : [...prev[key], item.id],
        };
      });
      setLastSelectedIndex(itemIndex);
    }
    // Regular click: Select single item
    else {
      const newSelectedIds = {
        fileIds: item.type !== "folder" ? [item.id] : [],
        folderIds: item.type === "folder" ? [item.id] : [],
      };
      setSelectedIds(newSelectedIds);
      setLastSelectedIndex(itemIndex);
    }
  };

  const clearSelection = () => {
    setSelectedIds({
      fileIds: [],
      folderIds: [],
    });
    setLastSelectedIndex(null);
  };

  return {
    selectedIds,
    lastSelectedIndex,
    selectItem,
    clearSelection,
  };
};