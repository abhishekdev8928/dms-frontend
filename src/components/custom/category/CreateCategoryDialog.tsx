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
import { createCategory } from '@/config/api/categoryApi';
import { getDepartments } from '@/config/api/departmentApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    folderAccess: 'department' as 'private' | 'department' | 'organization',
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category Created", {
        description: "The category has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Creation Failed", {
        description: error?.response?.data?.message || "Failed to create category.",
      });
    },
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      department: '', 
      folderAccess: 'department' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required.",
      });
      return;
    }

    if (!formData.department) {
      toast.error("Validation Error", {
        description: "Please select a department.",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createMutation.isPending) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your documents. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Financial Reports"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsData?.data?.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.code}</span>
                        <span>-</span>
                        <span>{dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folderAccess">Access Level</Label>
              <Select
                value={formData.folderAccess}
                onValueChange={(value: any) => setFormData({ ...formData, folderAccess: value })}
                disabled={createMutation.isPending}
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
              onClick={() => handleOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;