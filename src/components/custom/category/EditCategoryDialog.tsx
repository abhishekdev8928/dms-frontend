import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCategory } from '@/config/api/categoryApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({ 
  open, 
  onOpenChange, 
  category 
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    folderAccess: 'department' as 'private' | 'department' | 'organization',
  });

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        folderAccess: category.folderAccess || 'department',
      });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      toast.success("Category Updated", {
        description: "The category has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("Update Failed", {
        description: error?.response?.data?.message || "Failed to update category.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required.",
      });
      return;
    }

    if (!category?._id) return;

    updateMutation.mutate({
      id: category._id,
      data: formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category details below. Department cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Financial Reports"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={updateMutation.isPending}
                required
              />
            </div>

            {category?.department && (
              <div className="space-y-2">
                <Label>Department</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                  <span className="font-medium">{category.department.code}</span>
                  <span>-</span>
                  <span>{category.department.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Department cannot be changed after creation
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-folderAccess">Access Level</Label>
              <Select
                value={formData.folderAccess}
                onValueChange={(value: any) => setFormData({ ...formData, folderAccess: value })}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Private</span>
                      <span className="text-xs text-muted-foreground">Only you can access</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="department">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Department</span>
                      <span className="text-xs text-muted-foreground">All department members can access</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="organization">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Organization</span>
                      <span className="text-xs text-muted-foreground">Everyone in organization can access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {category?.subcategoryCount > 0 && (
              <div className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900 rounded-md">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ This category has {category.subcategoryCount} subcategories. Changing the name will update paths for all subcategories.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;