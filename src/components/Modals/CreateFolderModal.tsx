import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useEffect } from 'react';

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { name: string; color: string }) => void;
  isLoading?: boolean; // ✅ Added isLoading prop
}

export default function CreateFolderModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  isLoading = false, // ✅ Added isLoading with default value
}: CreateFolderModalProps) {
  const form = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  });

  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = (data: z.infer<typeof createFolderSchema>) => {
    onConfirm(data);
    // ✅ Don't close modal here - let the parent handle it after mutation succeeds
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-[30px] pb-4">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          {/* <DialogDescription>
            Enter a name and choose a color for your new folder.
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Folder Name</FormLabel> */}
                  <FormControl>
                    <Input 
                      placeholder="Folder Name" 
                      {...field}
                      disabled={isLoading} // ✅ Disable when loading
                      className="h-12 border border-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
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
                        disabled={isLoading} // ✅ Disable when loading
                      />
                      <span className="text-sm text-gray-600">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading} // ✅ Disable when loading
                 className="hover:bg-[#035C4C] hover:text-[#fff]" 
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#fff] text-[#035C4C] text-[14px] hover:bg-[#035C4C] hover:text-[#fff]" 
                disabled={isLoading} // ✅ Disable when loading
              >
                {isLoading ? "Creating..." : "Create"} {/* ✅ Show loading state */}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}