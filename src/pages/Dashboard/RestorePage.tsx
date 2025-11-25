import React from "react";
import {
  RotateCcw,
  Folder,
  FileText,
  ChevronDown,
  Trash,
  RefreshCw,
  Image,
  File,
} from "lucide-react";
import { queryClient } from "@/main";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getTrashItems,
  restoreTrashItem,
  permanentDeleteTrashItem,
  bulkRestoreTrashItems,
  bulkPermanentDeleteTrashItems,
} from "@/config/api/trashApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const TrashScreen = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const { data, isPending, refetch } = useQuery({
    queryFn: () => getTrashItems(currentPage),
    queryKey: ["trashItem", currentPage],
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTrashItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashItem"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Item restored successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentDeleteTrashItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashItem"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      toast.success("Item permanently deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete item");
    },
  });

  const bulkRestoreMutation = useMutation({
    mutationFn: bulkRestoreTrashItems,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["trashItem"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      
      setSelectedItems([]);
      
      const { restoredCount, failedCount } = response.data;
      
      if (failedCount > 0) {
        toast.warning(`Restored ${restoredCount} items. ${failedCount} failed.`);
      } else {
        toast.success(`Restored ${restoredCount} items successfully`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore items");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkPermanentDeleteTrashItems,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["trashItem"] });
       queryClient.invalidateQueries({ queryKey: ["children" ]});
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      
      setSelectedItems([]);
      
      const { deletedCount, failedCount } = response.data;
      
      if (failedCount > 0) {
        toast.warning(`Deleted ${deletedCount} items. ${failedCount} failed.`);
      } else {
        toast.success(`Deleted ${deletedCount} items permanently`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete items");
    },
  });

  const trashItems = data?.data || [];
  const pagination = data?.pagination;

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === trashItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(trashItems.map((item: any) => item.id));
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      if (selectedItems.length === 1) {
        // Single item restore
        await restoreMutation.mutateAsync(selectedItems[0]);
        setSelectedItems([]);
      } else {
        // Bulk restore
        await bulkRestoreMutation.mutateAsync(selectedItems);
      }
    } catch (error) {
      console.error("Error restoring items:", error);
    }
  };

  const handlePermanentDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedItems.length === 1) {
        // Single item delete
        await deleteMutation.mutateAsync(selectedItems[0]);
        setSelectedItems([]);
      } else {
        // Bulk delete
        await bulkDeleteMutation.mutateAsync(selectedItems);
      }
    } catch (error) {
      console.error("Error deleting items:", error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder className="h-5 w-5 text-blue-500" />;
      case "image":
        return <Image className="h-5 w-5 text-green-500" />;
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading =
    restoreMutation.isPending ||
    deleteMutation.isPending ||
    bulkRestoreMutation.isPending ||
    bulkDeleteMutation.isPending;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">
          Deleted files
        </h1>
        <p className="text-sm text-gray-600">
          Restore deleted files. Files are permanently deleted after 30 days.{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Learn more
          </a>
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button className="py-3 text-sm font-medium border-b-2 border-gray-900 text-gray-900">
            All files
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Filter by:</span>

          <Button variant="outline" disabled className="rounded-full">
            Deleted by
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          <Button variant="outline" disabled className="rounded-full">
            Folder
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {selectedItems.length > 0 && (
            <>
              <Button
                onClick={handleRestoreSelected}
                disabled={isLoading}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Restore Selected ({selectedItems.length})
              </Button>

              <Button
                onClick={handlePermanentDeleteSelected}
                disabled={isLoading}
                variant="destructive"
                className="rounded-full"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Permanently ({selectedItems.length})
              </Button>
            </>
          )}

          <Button variant="ghost" disabled>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[40px] h-10">
                  <Checkbox
                    checked={
                      trashItems.length > 0 &&
                      selectedItems.length === trashItems.length
                    }
                    onCheckedChange={toggleSelectAll}
                    disabled={isPending || isLoading}
                  />
                </TableHead>
                <TableHead className="min-w-[280px] h-10 font-semibold">
                  Name
                </TableHead>
                <TableHead className="w-[100px] h-10 font-semibold">
                  Type
                </TableHead>
                <TableHead className="w-[100px] h-10 font-semibold">
                  Size
                </TableHead>
                <TableHead className="w-[160px] h-10 font-semibold">
                  Deleted by
                </TableHead>
                <TableHead className="w-[140px] h-10 font-semibold">
                  Date deleted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : trashItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    No deleted files.
                  </TableCell>
                </TableRow>
              ) : (
                trashItems.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="py-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell className="min-w-[280px] py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(item.type)}
                        <div className="flex flex-col min-w-0 max-w-[350px]">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </span>
                          <span
                            className="text-xs text-gray-500 truncate"
                            title={item.path}
                          >
                            {item.path}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize whitespace-nowrap py-3 text-sm text-gray-600">
                      {item.type}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3 text-sm text-gray-600">
                      {formatFileSize(item.size)}
                    </TableCell>
                    <TableCell className="w-[160px] py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-gray-900 truncate">
                          {item.deletedBy?.username || "—"}
                        </span>
                        {item.deletedBy?.email && (
                          <span
                            className="text-xs text-gray-500 truncate"
                            title={item.deletedBy.email}
                          >
                            {item.deletedBy.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3 text-sm text-gray-600">
                      {formatDate(item.deletedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {trashItems.length} of {pagination.total} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{selectedItems.length}</span>{" "}
              {selectedItems.length === 1 ? "item" : "items"} from the trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrashScreen;