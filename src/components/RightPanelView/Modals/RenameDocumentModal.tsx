import type { FileItem } from "@/types/fileSystem";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, // ✅ Fixed: Import from ui/form, not react-router-dom
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const renameDocumentSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(100, "File name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type RenameDocumentFormData = z.infer<typeof renameDocumentSchema>;

interface RenameDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (data: { name: string; description?: string }) => Promise<void>;
  isLoading?: boolean; // ✅ Added isLoading prop
}

export default function RenameDocumentModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false, // ✅ Added isLoading with default value
}: RenameDocumentModalProps) {
  const form = useForm<RenameDocumentFormData>({
    resolver: zodResolver(renameDocumentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // ✅ Reset form when item changes or modal opens
  useEffect(() => {
    if (item && open) {
      form.reset({
        name: item.name,
        description: item.description || "",
      });
    }
  }, [item, open, form]);

 const handleSubmit = async (data: RenameDocumentFormData) => {
  try {
    await onConfirm(data);
    // Close modal after successful update
    onOpenChange(false);
    // Reset form
    form.reset();
  } catch (error) {
    // Error is handled by parent, modal stays open
    console.error("Failed to rename:", error);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>
            Update the name and description for this file (without extension).
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
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter file name (without extension)"
                      {...field}
                      disabled={isLoading} // ✅ Disable when loading
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter file description"
                      rows={3}
                      {...field}
                      disabled={isLoading} // ✅ Disable when loading
                    />
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
                disabled={isLoading} // ✅ Disable when loading
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-teal-500 hover:bg-teal-600"
                disabled={isLoading} // ✅ Disable when loading
              >
                {isLoading ? "Updating..." : "Update File"} {/* ✅ Show loading state */}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}