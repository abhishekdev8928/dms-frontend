import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSubcategories, deleteSubcategory } from '@/config/api/subCategoryApi';
import { getCategories } from '@/config/api/categoryApi';
import { getDepartments } from '@/config/api/departmentApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CirclePlus, 
  MoreHorizontal, 
  Search, 
  Pencil, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderTree,
  Filter,
  FolderPlus,
  Upload,
  MoreVertical
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CreateSubcategoryDialog from '@/components/custom/subCategory/CreateSubCategoryDialog';
import EditSubcategoryDialog from '@/components/custom/subCategory/EditSubCategoryDialog';
import DeleteConfirmDialog from '@/components/custom/department/DeleteDepartmentDialog';
import { useUploadStore } from '@/config/useUploadStore';

const Subcategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [showCategoryWarning, setShowCategoryWarning] = useState(false);

  const { openDialog } = useUploadStore();

  // Fetch departments for filter
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments({ limit: 100 }),
  });

  // Fetch all categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => getCategories({ 
      limit: 100
    }),
  });

  // Filter categories based on selected department
  const filteredCategories = useMemo(() => {
    if (!categoriesData?.data) return [];
    if (!selectedDepartment) return categoriesData.data;
    
    return categoriesData.data.filter((cat: any) => 
      cat.department?._id === selectedDepartment
    );
  }, [categoriesData, selectedDepartment]);

  // Fetch subcategories
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subcategories", currentPage, pageSize, searchTerm, selectedCategory, selectedDepartment],
    queryFn: () => getSubcategories({ 
      page: currentPage, 
      limit: pageSize,
      search: searchTerm,
      category: selectedCategory || undefined,
      department: selectedDepartment || undefined
    }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      toast.success("Subcategory Deleted", {
        description: "The subcategory has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setDeleteDialogOpen(false);
      setSelectedSubcategory(null);
    },
    onError: (error: any) => {
      toast.error("Delete Failed", {
        description: error?.response?.data?.message || "Failed to delete subcategory.",
      });
    },
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  const handleEdit = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setEditDialogOpen(true);
  };

  const handleDelete = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleCreateFolder = (subcategory?: any) => {
    if (subcategory) {
      navigate(`/dashboard/folders/create?subcategory=${subcategory._id}`);
    } else {
      navigate(`/dashboard/folders/create`);
    }
  };

  const handleUploadFile = (subcategory?: any) => {
    if (subcategory) {
      navigate(`/dashboard/files/upload?subcategory=${subcategory._id}`);
    } else {
      navigate(`/dashboard/files/upload`);
    }
  };

  const confirmDelete = () => {
    if (selectedSubcategory) {
      deleteMutation.mutate(selectedSubcategory._id);
    }
  };

  const handleCreateSubcategory = () => {
    // Check if categories exist at all
    if (!categoriesData?.data || categoriesData.data.length === 0) {
      setShowCategoryWarning(true);
      return;
    }

    // Open dialog - user selects department and category inside the dialog
    setCreateDialogOpen(true);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (value: string) => {
    setSelectedDepartment(value === 'all' ? '' : value);
    setSelectedCategory(''); // Reset category when department changes
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Subcategories</h3>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Subcategories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreateSubcategory} className='flex gap-2'>
            <CirclePlus size={20} />
            <span>Add Subcategory</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCreateFolder()}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUploadFile()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Subcategories</CardTitle>
              <CardDescription>Manage and organize your document subcategories</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {data?.count || 0} Total
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select value={selectedDepartment || 'all'} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsData?.data?.map((dept: any) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedCategory || 'all'} 
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(selectedDepartment ? filteredCategories : categoriesData?.data || []).map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{cat.department?.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No subcategories found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Get started by creating a new subcategory'}
              </p>
              {!searchTerm && !selectedCategory && (
                <Button onClick={handleCreateSubcategory}>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Add Subcategory
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell w-[150px]">Access Level</TableHead>
                    <TableHead className="hidden xl:table-cell w-[120px]">Created</TableHead>
                    <TableHead className="w-[70px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((subcategory: any) => (
                    <TableRow key={subcategory._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <FolderTree className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium">{subcategory.name}</div>
                            <div className="text-xs text-muted-foreground">{subcategory.path}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{subcategory.parentFolder?.name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{subcategory.department?.code}</Badge>
                          <span className="text-sm">{subcategory.department?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge 
                          variant={
                            subcategory.folderAccess === 'organization' ? 'default' :
                            subcategory.folderAccess === 'department' ? 'secondary' : 'outline'
                          }
                        >
                          {subcategory.folderAccess}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {new Date(subcategory.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreateFolder(subcategory)}>
                              <FolderPlus className="mr-2 h-4 w-4" />
                              Create Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(subcategory)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(subcategory)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data?.data && data.data.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data?.count || 0)} of {data?.count || 0} subcategories
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSubcategoryDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <EditSubcategoryDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        subcategory={selectedSubcategory}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={selectedSubcategory?.name}
        isLoading={deleteMutation.isPending}
      />

      {/* No Category Warning Dialog */}
      <AlertDialog open={showCategoryWarning} onOpenChange={setShowCategoryWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Categories Available</AlertDialogTitle>
            <AlertDialogDescription>
              You need to create at least one category before you can add subcategories. 
              Would you like to create a category now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/dashboard/categories')}>
              Go to Categories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subcategory;