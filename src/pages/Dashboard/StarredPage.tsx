import React, { useState } from "react";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import GridView from "@/components/explorer/explorerView/GridView";
import ListView from "@/components/explorer/explorerView/ListView";
import FilterButtons from "./FilterBox";
import { BulkActionToolbar } from "@/components/RightPanelView/Actions/BulkActionToolbar";
import FileInfoPanel from "@/components/RightPanelView/ResourcePreviewPanel";
import { useQuery } from "@tanstack/react-query";
import { getStarredItems } from "@/config/api/starredApi";
import { 
  useMutationToggleStarred,
  useMutationRemoveStarred,
  useMutationBulkToggleStarred 
} from "@/hooks/mutations/useStarredMutation";
import { toast } from "sonner";
import type { FileItem } from "@/types/documentTypes";

const StarredPage = () => {
  // Zustand store
  const viewMode = useAppConfigStore((state) => state.viewMode);
  const showInfoPanel = useAppConfigStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useAppConfigStore((state) => state.toggleInfoPanel);
  const setViewMode = useAppConfigStore((state) => state.setViewMode);
  const userList = useAppConfigStore((state) => state.userList);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<{
    fileIds: string[];
    folderIds: string[];
  }>({
    fileIds: [],
    folderIds: [],
  });
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Filter state
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");

  // Selected item for info panel
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  // Fetch starred items
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['starred-items'],
    queryFn: getStarredItems,
  });

  // Starred mutations
  const toggleStarred = useMutationToggleStarred({
    onSuccess: (data) => {
      toast.success(data.message || "Starred status updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update starred status");
    },
  });

  const removeStarred = useMutationRemoveStarred({
    onSuccess: (data) => {
      toast.success(data.message || "Removed from starred");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove starred");
    },
  });

  const bulkToggleStarred = useMutationBulkToggleStarred({
    onSuccess: (data) => {
      const summary = data?.data?.summary;
      if (summary) {
        toast.success(`Updated ${summary.success} of ${summary.total} items`);
      }
      // Clear selection after bulk operation
      setSelectedIds({ fileIds: [], folderIds: [] });
      setLastSelectedIndex(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update items");
    },
  });

  // Extract items from API response
  const items: FileItem[] = data?.data?.items || [];

  // Apply filters
  const filteredItems = items.filter((item) => {
    // Type filter
    if (selectedTypeFilter && selectedTypeFilter !== "") {
      if (selectedTypeFilter === "folder" && item.type !== "folder") {
        return false;
      }
      if (selectedTypeFilter !== "folder" && item.type === "folder") {
        return false;
      }
      if (
        selectedTypeFilter !== "folder" &&
        item.mimeType !== selectedTypeFilter
      ) {
        return false;
      }
    }

    // User filter
    if (selectedUser && selectedUser !== "") {
      if (item.createdBy !== selectedUser) {
        return false;
      }
    }

    return true;
  });

  // Selection handler with shift multiselect
  const handleItemSelection = (
    e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>,
    item: { id: string; type: string },
    itemIndex: number
  ): void => {
    const key = item.type === "folder" ? "folderIds" : "fileIds";

    // Shift + Click: Range selection
    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, itemIndex);
      const end = Math.max(lastSelectedIndex, itemIndex);
      
      const rangeItems = filteredItems.slice(start, end + 1);
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
    else if (e.ctrlKey || e.metaKey) {
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

  // Item action handlers
  const handleItemClick = (item: FileItem) => {
    // TODO: Implement folder navigation or file preview
    console.log("Item clicked:", item);
  };

  const handleRename = (item: FileItem) => {
    // TODO: Open rename modal
    console.log("Rename:", item);
  };

  const handleDelete = (item: FileItem) => {
    // TODO: Open delete modal
    console.log("Delete:", item);
  };

  const handleDownload = (item: FileItem) => {
    // TODO: Implement download
    console.log("Download:", item);
  };

  const handleShowInfo = (item: FileItem) => {
    setSelectedItem(item);
    if (!showInfoPanel) {
      toggleInfoPanel();
    }
  };

  const handleAddTags = (item: FileItem) => {
    // TODO: Open tags modal
    console.log("Add tags:", item);
  };

  const handleReupload = (documentId: string) => {
    // TODO: Implement reupload
    console.log("Reupload:", documentId);
  };

  // Handle unstar action (remove from starred)
  const handleUnstarItem = (item: FileItem) => {
    removeStarred.mutate({
      id: item._id,
      type: item.type === "folder" ? "folder" : "file",
    });
  };

  // Bulk actions
  const handleBulkUnstar = () => {
    const items = [
      ...selectedIds.fileIds.map(id => ({ id, type: "file" as const })),
      ...selectedIds.folderIds.map(id => ({ id, type: "folder" as const })),
    ];

    bulkToggleStarred.mutate({ items });
  };

  const bulkActionToolBarProps = {
    onClearSelection: () => {
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      });
      setLastSelectedIndex(null);
    },
    selectionCount: selectedIds.fileIds.length + selectedIds.folderIds.length,
    onDeleteSelected: () => {
      // TODO: Implement bulk delete
      console.log("Bulk delete:", selectedIds);
      setSelectedIds({
        fileIds: [],
        folderIds: [],
      });
      setLastSelectedIndex(null);
    },
    onUnstarSelected: handleBulkUnstar,
  };

  // Update selected item when selection changes
  React.useEffect(() => {
    const totalSelected = selectedIds.fileIds.length + selectedIds.folderIds.length;

    if (totalSelected === 1) {
      const selectedId = selectedIds.fileIds[0] || selectedIds.folderIds[0];
      const item = filteredItems.find((item) => item._id === selectedId);
      if (item) {
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(null);
    }
  }, [selectedIds, filteredItems]);

  const isEmpty = filteredItems.length === 0;
  const hasFilters = selectedTypeFilter?.trim() !== "" || selectedUser?.trim() !== "";

  const setListView = () => setViewMode("list");
  const setGridView = () => setViewMode("grid");

  return (
    <div className="h-full flex flex-col py-4 pe-4">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pt-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Starred</h2>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={setListView}
                    className={
                      viewMode === "list"
                        ? "bg-[#035C4C] hover:bg-[#035C4C] rounded-e-[0px] border border-[#035C4C] py-5 px-5 border-2"
                        : "border-2 rounded-e-[0px] border-[#434343] py-5 px-5"
                    }
                  >
                    <svg
                      width="20"
                      height="16"
                      viewBox="0 0 20 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1H1.01M1 8H1.01M1 15H1.01M6 1H19M6 8H19M6 15H19"
                        stroke={viewMode === "list" ? "white" : "black"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={setGridView}
                    className={
                      viewMode === "grid"
                        ? "bg-[#035C4C] hover:bg-[#035C4C] rounded-s-[0px] border-[#035C4C] py-5 px-5 border-2"
                        : "border-2 py-5 px-5 rounded-s-[0px] border-[#434343]"
                    }
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 1H2C1.44772 1 1 1.44772 1 2V7C1 7.55228 1.44772 8 2 8H7C7.55228 8 8 7.55228 8 7V2C8 1.44772 7.55228 1 7 1Z"
                        stroke={viewMode === "list" ? "black" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 1H13C12.4477 1 12 1.44772 12 2V7C12 7.55228 12.4477 8 13 8H18C18.5523 8 19 7.55228 19 7V2C19 1.44772 18.5523 1 18 1Z"
                        stroke={viewMode === "list" ? "black" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 12H13C12.4477 12 12 12.4477 12 13V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V13C19 12.4477 18.5523 12 18 12Z"
                        stroke={viewMode === "list" ? "black" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 12H2C1.44772 12 1 12.4477 1 13V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V13C8 12.4477 7.55228 12 7 12Z"
                        stroke={viewMode === "list" ? "black" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleInfoPanel}
                  className={showInfoPanel ? "bg-gray-100" : ""}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 15V11M11 7H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z"
                      stroke="#434343"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="right-panel-filter">
              {selectedIds.fileIds.length > 0 ||
              selectedIds.folderIds.length > 0 ? (
                <BulkActionToolbar {...bulkActionToolBarProps} />
              ) : (
                <FilterButtons
                  selectedTypeFilter={selectedTypeFilter}
                  setSelectedTypeFilter={setSelectedTypeFilter}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  userData={userList}
                />
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading...
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-600 mb-4">Failed to load starred items</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            ) : isEmpty ? (
              hasFilters ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                  <img
                    src="https://ssl.gstatic.com/docs/doclist/images/empty_state_recents_v4.svg"
                    alt="No matching results"
                    className="w-64 mb-6 opacity-80"
                  />
                  <h2 className="text-xl font-semibold">No matching results</h2>
                  <p className="text-gray-500 mt-2">
                    Adjust your filters or try searching again.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                  <img
                    src="https://ssl.gstatic.com/docs/doclist/images/empty_state_starred.svg"
                    alt="No starred items"
                    className="w-64 mb-6 opacity-80"
                  />
                  <h2 className="text-xl font-semibold">
                    No starred files or folders
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Add stars to things that you want to easily find later
                  </p>
                </div>
              )
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  {viewMode === "list" ? (
                    <ListView
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      items={filteredItems}
                      onItemClick={handleItemClick}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onShowInfo={handleShowInfo}
                      onAddTags={handleAddTags}
                      onReupload={handleReupload}
                      onUnstar={handleUnstarItem}
                    />
                  ) : (
                    <GridView
                      items={filteredItems}
                      selectedIds={selectedIds}
                      onSelectItem={handleItemSelection}
                      onItemClick={handleItemClick}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onShowInfo={handleShowInfo}
                      onAddTags={handleAddTags}
                      onReupload={handleReupload}
                      onUnstar={handleUnstarItem}
                    />
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Info Panel - Fixed Width */}
        {showInfoPanel && (
          <div className="w-[350px] flex-shrink-0 h-full overflow-hidden">
            <FileInfoPanel
              item={selectedItem}
              selectionCount={
                selectedIds.fileIds.length + selectedIds.folderIds.length
              }
              onClose={toggleInfoPanel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredPage;