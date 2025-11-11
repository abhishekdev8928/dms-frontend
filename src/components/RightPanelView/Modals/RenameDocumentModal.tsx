import type { FileItem } from "@/types/fileSystem";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "react-router-dom";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {z} from "zod"
const renameDocumentSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(100, "File name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export default function RenameDocumentModal({
  open,
  onOpenChange,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onConfirm: (data: { name: string; description?: string }) => void;
}) {
  const form = useForm<z.infer<typeof renameDocumentSchema>>({
    resolver: zodResolver(renameDocumentSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || "",
      });
    }
  }, [item, form]);

  const handleSubmit = (data: z.infer<typeof renameDocumentSchema>) => {
    onConfirm(data);
    onOpenChange(false);
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
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Update File
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
