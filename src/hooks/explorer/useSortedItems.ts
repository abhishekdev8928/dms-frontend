
import { useState, useMemo } from "react";
import type { FileItem } from "../../types/documentTypes";

type SortField = "name" | "date";
type SortOrder = "asc" | "desc";

export const useSortItems = (items: FileItem[]) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedItems = useMemo(() => {
    const folders = items.filter((i) => i.type === "folder");
    const files = items.filter((i) => i.type !== "folder");

    const sortFn = (a: FileItem, b: FileItem) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortOrder === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    };

    return [...folders.sort(sortFn), ...files.sort(sortFn)];
  }, [items, sortField, sortOrder]);

  return {
    sortedItems,
    sortField,
    sortOrder,
    handleSort,
  };
};
