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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createSubcategory } from '@/config/api/subCategoryApi';
import { getCategories } from '@/config/api/categoryApi';
import { getDepartments } from '@/config/api/departmentApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CreateSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSubcategoryDialog: React.FC<CreateSubcategoryDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '',
    folderAccess: 'department' as 'private' | 'department' | 'organization',
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments({ limit: 100 }),
  });

  // Fetch categories filtered by department
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", formData.department],
    queryFn: () => getCategories({ 
      limit: 100,
      department: formData.department || undefined 
    }),
    enabled: !!formData.department,
  });

  const hasCategories = categoriesData?.data && categoriesData.data.length > 0;
  const canEnterName = formData.department && formData.category && hasCategories;

  const createMutation = useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      toast.success("Subcategory Created", {
        description: "The subcategory has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Creation Failed", {
        description: error?.response?.data?.message || "Failed to create subcategory.",
      });
    },
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      category: '',
      department: '',
      folderAccess: 'department' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department) {
      toast.error("Validation Error", {
        description: "Please select a department.",
      });
      return;
    }

    if (!formData.category) {
      toast.error("Validation Error", {
        description: "Please select a category.",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Subcategory name is required.",
      });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      category: formData.category,
      folderAccess: formData.folderAccess
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createMutation.isPending) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleDepartmentChange = (value: string) => {
    setFormData({ 
      ...formData, 
      department: value,
      category: '', // Reset category when department changes
      name: '' // Reset name when department changes
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ 
      ...formData, 
      category: value 
    });
  };

  const handleCreateCategory = () => {
    onOpenChange(false);
    navigate('/dashboard/categories');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Subcategory</DialogTitle>
          <DialogDescription>
            Add a new subcategory under an existing category. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={handleDepartmentChange}
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department first" />
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
              <Label htmlFor="category">
                Parent Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                disabled={createMutation.isPending || !formData.department || (formData.department && !hasCategories)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.department 
                      ? "Select department first" 
                      : categoriesLoading
                      ? "Loading categories..."
                      : !hasCategories
                      ? "No categories available"
                      : "Select a category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{cat.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Show warning if department selected but no categories */}
              {formData.department && !categoriesLoading && !hasCategories && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>This department has no categories.</span>
                    <Button 
                      type="button"
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 text-red-600 hover:text-red-700"
                      onClick={handleCreateCategory}
                    >
                      Create Category
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Subcategory Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder={
                  !canEnterName 
                    ? "Select department and category first" 
                    : "e.g., Quarterly Reports"
                }
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={createMutation.isPending || !canEnterName}
                required
              />
              {!canEnterName && formData.department && (
                <p className="text-xs text-muted-foreground">
                  Please select a category to enter subcategory name
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="folderAccess">Access Level</Label>
              <Select
                value={formData.folderAccess}
                onValueChange={(value: any) => setFormData({ ...formData, folderAccess: value })}
                disabled={createMutation.isPending || !canEnterName}
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
            <Button type="submit" disabled={createMutation.isPending || !canEnterName || !formData.name.trim()}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Subcategory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubcategoryDialog;