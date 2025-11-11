
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

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { name: string; color: string }) => void;
}

export default function CreateFolderModal({ 
  open, 
  onOpenChange, 
  onConfirm 
}: CreateFolderModalProps) {
  const form = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  });

  const handleSubmit = (data: z.infer<typeof createFolderSchema>) => {
    onConfirm(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name and choose a color for your new folder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Marketing Materials" {...field} />
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
                    <div className="flex items-center gap-3">
                      <Input 
                        type="color" 
                        {...field} 
                        className="w-20 h-10 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
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