import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FileItem } from "@/types/fileSystem";

// Validation schema
const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
});

type RenameFolderFormData = z.infer<typeof renameFolderSchema>;

interface RenameFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (data: { name: string; color?: string }) => void;
  isLoading?: boolean;
}

export default function RenameFolderModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: RenameFolderModalProps) {
  const form = useForm<RenameFolderFormData>({
    resolver: zodResolver(renameFolderSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
    },
  });

  // Reset form when item changes or modal opens
  useEffect(() => {
    if (item && open) {
      form.reset({
        name: item.name,
        color: item.color || "#3B82F6",
      });
    }
  }, [item, open, form]);

  const handleSubmit = (data: RenameFolderFormData) => {
    onConfirm(data);
    // Don't close modal here - let parent handle it after mutation succeeds
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Update the name and color for this folder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter folder name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        {...field}
                        className="w-20 h-10 cursor-pointer"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-600">
                        {field.value}
                      </span>
                    </div>
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Folder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}