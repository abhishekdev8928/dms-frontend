import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@/utils/validations/departmentValidation";
import type { Department } from "@/config/api/departmentApi";

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  department?: Department | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const DepartmentModal = ({
  open,
  onOpenChange,
  mode,
  department,
  onSubmit,
  isLoading = false,
}: DepartmentModalProps) => {
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

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "add") {
        createForm.reset({ name: "" });
      } else if (mode === "edit" && department) {
        updateForm.reset({
          name: department.name,
        });
      }
    }
  }, [open, mode, department, createForm, updateForm]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Department" : "Edit Department"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new department. Fill in the details below."
              : "Update the department information below."}
          </DialogDescription>
        </DialogHeader>

        {mode === "add" ? (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleSubmit)}
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
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Department"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(handleSubmit)}
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
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Department"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};