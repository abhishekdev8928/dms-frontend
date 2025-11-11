import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";

// Validation schemas
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

interface FileItem {
  _id: string;
  name: string;
  itemType: "file" | "folder";
  type: "document" | "folder";
  parent_id?: string;
  color?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  fileUrl?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  hasChildren?: boolean;
  description?: string;
  tags?: string[];
  extension?: string;
}
export default function RenameFolderModal({
  open,
  onOpenChange,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (data: { name: string; color?: string }) => void;
}) {
  const form = useForm<z.infer<typeof renameFolderSchema>>({
    resolver: zodResolver(renameFolderSchema),
    defaultValues: {
      name: item?.name || "",
      color: item?.color || "#3B82F6",
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        color: item.color || "#3B82F6",
      });
    }
  }, [item, form]);

  const handleSubmit = (data: z.infer<typeof renameFolderSchema>) => {
    onConfirm(data);
    onOpenChange(false);
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
                    <Input placeholder="Enter folder name" {...field} />
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
                    <Input type="color" {...field} />
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
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}