import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/config/api/departmentApi";

export const useDepartmentMutation = () => {
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department Created", {
        description: "The department has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({queryKey:["breadcrumbs"]})
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
      queryClient.invalidateQueries({queryKey:["children"]});
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

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};