
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "react-router-dom";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";

const addTagsSchema = z.object({
  tags: z.string().min(1, "Please enter at least one tag"),
});

export default function TagsModal({
  open,
  onOpenChange,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (tags: string[]) => void;
}) {
  const form = useForm<z.infer<typeof addTagsSchema>>({
    resolver: zodResolver(addTagsSchema),
    defaultValues: {
      tags: item?.tags?.join(", ") || "",
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        tags: item.tags?.join(", ") || "",
      });
    }
  }, [item, form]);

  const handleSubmit = (data: z.infer<typeof addTagsSchema>) => {
    const tagsArray = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onConfirm(tagsArray);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Add or update tags for "{item?.name}". Separate multiple tags with
            commas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., important, project, Q1"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Current tags:{" "}
                    {item?.tags && item.tags.length > 0
                      ? item.tags.join(", ")
                      : "None"}
                  </p>
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
                Save Tags
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}