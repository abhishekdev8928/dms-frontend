import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CirclePlus,
  MoreVertical,
  Pencil,
  Trash2,
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
import { useDepartments } from "@/hooks/queries/useDepartmentQueries";
import { useDepartmentMutations } from "@/hooks/mutations/useDepartmentMutations";
import type { IDepartment } from "@/config/types/departmentTypes";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@/utils/validations/departmentValidation";
import { useNavigate } from "react-router-dom";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartment | null>(null);

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

  // Fetch departments using query hook
  const {
    data: departmentsData,
    isLoading,
    isError,
  } = useDepartments({
    page: currentPage,
    limit: itemsPerPage,
  });

 
  const {
    createDepartmentMutation,
    updateDepartmentMutation,
    deleteDepartmentMutation,
  } = useDepartmentMutations({
    onSuccess: () => {
      setShowModal(false);
      setShowDeleteModal(false);
      setSelectedDepartment(null);
      createForm.reset();
      updateForm.reset();
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
    createForm.reset({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (dept: IDepartment) => {
    setModalMode("edit");
    setSelectedDepartment(dept);
    updateForm.reset({
      name: dept.name,
    });
    setShowModal(true);
  };

  const handleDelete = (dept: IDepartment) => {
    setSelectedDepartment(dept);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartmentMutation.mutate(selectedDepartment._id);
    }
  };

  const onCreateSubmit = (data: z.infer<typeof createDepartmentSchema>) => {
    createDepartmentMutation.mutate(data);
  };

  const onUpdateSubmit = (data: z.infer<typeof updateDepartmentSchema>) => {
    if (selectedDepartment) {
      updateDepartmentMutation.mutate({
        id: selectedDepartment._id,
        data,
      });
    }
  };

  const departments = departmentsData?.data || [];
  const totalCount = departmentsData?.count || 0;

  // Get global actions from first department
  const globalActions = departments[0]?.actions;
  const canCreate = globalActions?.create || false;
  const canUpdate = globalActions?.update || false;
  const canDelete = globalActions?.delete || false;

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
    <div className="h-full flex flex-col py-4 pe-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No departments found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating a new department
          </p>
          {canCreate && (
            <Button onClick={handleAdd}>
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Departments
              </h1>
              {canCreate && (
                <Button onClick={handleAdd}>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              )}
            </div>

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
                  {(canUpdate || canDelete) && (
                    <TableHead className="w-[70px] text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept: IDepartment) => (
                  <TableRow
                    key={dept._id}
                    className="border-b cursor-pointer last:border-0 hover:bg-slate-50/50"
                  >
                    <TableCell
                      onClick={() => navigate(`/dashboard/folder/${dept._id}`)}
                      className="py-4"
                    >
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
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-right py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4 text-slate-600" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {canUpdate && (
                              <DropdownMenuItem onClick={() => handleEdit(dept)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Department
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(dept)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Department
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                  <Button
                    type="submit"
                    disabled={createDepartmentMutation.isPending}
                  >
                    {createDepartmentMutation.isPending
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
                  <Button
                    type="submit"
                    disabled={updateDepartmentMutation.isPending}
                  >
                    {updateDepartmentMutation.isPending
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
              disabled={deleteDepartmentMutation.isPending}
            >
              {deleteDepartmentMutation.isPending
                ? "Deleting..."
                : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;