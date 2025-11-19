import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CirclePlus,
  MoreVertical,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type Department,
} from "@/config/api/departmentApi";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@/utils/validations/departmentValidation";
import { useNavigate } from "react-router-dom";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // React Hook Form - Create
  const createForm = useForm<z.infer<typeof createDepartmentSchema>>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: "",
    },
  });

  // React Hook Form - Update
  const updateForm = useForm<z.infer<typeof updateDepartmentSchema>>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch departments
  const {
    data: departmentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["departments", currentPage, itemsPerPage, searchQuery],
    queryFn: () =>
      getAllDepartments({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department Created", {
        description: "The department has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setShowModal(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast.error("Creation Failed", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create department.",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      toast.success("Department Updated", {
        description: "The department has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setShowModal(false);
      setSelectedDepartment(null);
      updateForm.reset();
    },
    onError: (error: any) => {
      toast.error("Update Failed", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update department.",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Department Deleted", {
        description: "The department has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setShowDeleteModal(false);
      setSelectedDepartment(null);
    },
    onError: (error: any) => {
      toast.error("Delete Failed", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete department.",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const handleAdd = () => {
    setModalMode("add");
    createForm.reset({ name: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setModalMode("edit");
    setSelectedDepartment(dept);
    updateForm.reset({
      name: dept.name,
    });

    setShowModal(true);
  };

  const handleDelete = (dept: Department) => {
    setSelectedDepartment(dept);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteMutation.mutate(selectedDepartment._id);
    }
  };

  const onCreateSubmit = (data: z.infer<typeof createDepartmentSchema>) => {
    createMutation.mutate(data);
  };

  const onUpdateSubmit = (data: z.infer<typeof updateDepartmentSchema>) => {
    if (selectedDepartment) {
      updateMutation.mutate({
        id: selectedDepartment._id,
        data,
      });
    }
  };

  const departments = departmentsData?.data || [];
  const totalPages = departmentsData?.totalPages || 1;
  const totalCount = departmentsData?.count || 0;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Departments</h3>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* Search and Filter Bar */}
      <div className="flex w-full items-center pt-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>
          <CirclePlus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No departments found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Get started by creating a new department"}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd}>
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          )}
        </div>
      ) : (
        <div className="">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    Name
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ArrowUpDown className="h-3.5 w-3.5 text-emerald-500" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell font-medium text-slate-700">
                  Owner
                </TableHead>
                <TableHead className="hidden lg:table-cell font-medium text-slate-700">
                  Status
                </TableHead>
                <TableHead className="hidden xl:table-cell font-medium text-slate-700">
                  Date Modified
                </TableHead>
                <TableHead className="w-[70px] text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept: Department) => (
                <TableRow
                 
                  key={dept._id}
                  className="border-b cursor-pointer last:border-0 hover:bg-slate-50/50"
                >
                  <TableCell  onClick={() => navigate(`/dashboard/folder/${dept._id}`)} className="py-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-slate-500" />
                      <span className="font-normal text-slate-900">
                        {dept.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                        {typeof dept.createdBy === "object" &&
                        dept.createdBy?.username
                          ? dept.createdBy.username.charAt(0).toUpperCase()
                          : "N"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900">
                          {typeof dept.createdBy === "object" &&
                          dept.createdBy?.username
                            ? dept.createdBy.username
                            : "N/A"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {typeof dept.createdBy === "object" &&
                          dept.createdBy?.email
                            ? dept.createdBy.email
                            : ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-4">
                    <Badge
                      variant={dept.isActive ? "default" : "secondary"}
                      className={
                        dept.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-slate-700 py-4">
                    {formatDate(dept.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-slate-600" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(dept)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(dept)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Department
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {departments.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalCount)}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> departments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? "Add Department" : "Edit Department"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add"
                ? "Create a new department. Fill in the details below."
                : "Update the department information below."}
            </DialogDescription>
          </DialogHeader>

          {modalMode === "add" ? (
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Department"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <Form {...updateForm}>
              <form
                onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending
                      ? "Updating..."
                      : "Update Department"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{selectedDepartment?.name}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
