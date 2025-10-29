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
import { updateSubcategory } from '@/config/api/subCategoryApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategory: any;
}

const EditSubcategoryDialog: React.FC<EditSubcategoryDialogProps> = ({ 
  open, 
  onOpenChange, 
  subcategory 
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    folderAccess: 'department' as 'private' | 'department' | 'organization',
  });

  // Update form data when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        folderAccess: subcategory.folderAccess || 'department',
      });
    }
  }, [subcategory]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSubcategory(id, data),
    onSuccess: () => {
      toast.success("Subcategory Updated", {
        description: "The subcategory has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("Update Failed", {
        description: error?.response?.data?.message || "Failed to update subcategory.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Subcategory name is required.",
      });
      return;
    }

    if (!subcategory?._id) return;

    updateMutation.mutate({
      id: subcategory._id,
      data: formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subcategory</DialogTitle>
          <DialogDescription>
            Update the subcategory details below. Category and department cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {subcategory?.department && (
              <div className="space-y-2">
                <Label>Department</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                  <span className="font-medium">{subcategory.department.code}</span>
                  <span>-</span>
                  <span>{subcategory.department.name}</span>
                </div>
              </div>
            )}

            {subcategory?.parentFolder && (
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <div className="flex flex-col gap-1 p-3 border rounded-md bg-muted">
                  <span className="font-medium">{subcategory.parentFolder.name}</span>
                  <span className="text-xs text-muted-foreground">{subcategory.path}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Category cannot be changed after creation
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Subcategory Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Quarterly Reports"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={updateMutation.isPending}
                required
              />
            </div>

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

export default EditSubcategoryDialog;