// import React, { useState, useRef } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
// import { toast } from 'sonner';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { 
//   List,
//   Grid3x3,
//   Info,
//   FileText,
//   Folder,
//   MoreVertical,
//   Pencil,
//   Trash2,
//   Upload,
//   Download,
//   Eye,
//   Users,
//   RefreshCw,
//   History,
//   Activity,
//   Tag,
//   ChevronRight,
//   FolderPlus,
//   Palette
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from '@/components/ui/dropdown-menu';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { getChildren, getBreadcrumbs } from '@/config/api/treeApi';
// import { updateFolder, softDeleteFolder, createFolder } from '@/config/api/folderApi';
// import { updateDocument, deleteDocument, generateDownloadUrl, addTags, createVersion } from '@/config/api/documentApi';
// import { uploadFiles, validateFiles, ALLOWED_EXTENSIONS } from '@/utils/helper/fileUploadHelper';
// import { reuploadFile, validateFile } from '@/utils/helper/fileReuploadHelper';
// import FileInfoPanel from '@/components/custom/FileInfoPanel';
// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';

// interface FileItem {
//   _id: string;
//   name: string;
//   itemType: 'file' | 'folder';
//   type: 'document' | 'folder';
//   parent_id?: string;
//   color?: string;
//   isDeleted: boolean;
//   deletedAt: string | null;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
//   path: string;
//   fileUrl?: string;
//   originalName?: string;
//   mimeType?: string;
//   size?: number;
//   hasChildren?: boolean;
//   description?: string;
//   tags?: string[];
//   extension?: string;
// }

// interface Breadcrumb {
//   _id: string;
//   name: string;
//   type: string;
//   path: string;
// }

// // Predefined color palette
// const FOLDER_COLORS = [
//   '#3B82F6', // Blue
//   '#10B981', // Green
//   '#F59E0B', // Amber
//   '#EF4444', // Red
//   '#8B5CF6', // Purple
//   '#EC4899', // Pink
//   '#06B6D4', // Cyan
//   '#64748B', // Slate
// ];

// const getFormattedDateTime = () => {
//   const now = new Date();
//   const formattedDate = now.toLocaleDateString('en-US', { 
//     weekday: 'long', 
//     year: 'numeric', 
//     month: 'long', 
//     day: 'numeric' 
//   });
//   const formattedTime = now.toLocaleTimeString('en-US', { 
//     hour: 'numeric', 
//     minute: '2-digit',
//     hour12: true 
//   });
//   return `${formattedDate} at ${formattedTime}`;
// };

// // Validation schemas
// const renameFolderSchema = z.object({
//   name: z.string()
//     .min(1, "Folder name is required")
//     .max(100, "Folder name too long")
//     .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name"),
//   color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
// });

// const renameDocumentSchema = z.object({
//   name: z.string()
//     .min(1, "File name is required")
//     .max(100, "File name too long"),
//   description: z.string().max(500, "Description too long").optional(),
// });

// const createFolderSchema = z.object({
//   name: z.string()
//     .min(1, "Folder name is required")
//     .max(100, "Folder name too long")
//     .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Invalid characters in folder name"),
//   color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default('#3B82F6'),
// });

// const addTagsSchema = z.object({
//   tags: z.string().min(1, "Please enter at least one tag"),
// });

// export default function RightPanelView() {
//   const { parentId } = useParams<{ parentId: string }>();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
//   const [dragActive, setDragActive] = useState(false);
//   const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
//   const [showInfoPanel, setShowInfoPanel] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const reuploadInputRef = useRef<HTMLInputElement>(null);
//   const [reuploadDocumentId, setReuploadDocumentId] = useState<string | null>(null);

//   const { data: childrenData, isLoading, error } = useQuery({
//     queryKey: ['children', parentId],
//     queryFn: () => getChildren(parentId || ''),
//     enabled: !!parentId
//   });

//   const { data: breadcrumbsData } = useQuery({
//     queryKey: ['breadcrumbs', parentId],
//     queryFn: () => getBreadcrumbs(parentId || ''),
//     enabled: !!parentId
//   });

//   const items: FileItem[] = childrenData?.data?.children || [];
//   const breadcrumbs: Breadcrumb[] = Array.isArray(breadcrumbsData) ? breadcrumbsData : (breadcrumbsData?.data || []);

//   const hasChildren = items.length > 0;
//   const isEmpty = !hasChildren;

//   // Create folder mutation
//   const createFolderMutation = useMutation({
//     mutationFn: async (data: { name: string; parent_id: string; color?: string }) => {
//       return await createFolder(data);
//     },
//     onSuccess: (response) => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       queryClient.invalidateQueries({ queryKey: ['tree'] });
//       toast.success('Folder created successfully', {
//         description: getFormattedDateTime(),
//         action: {
//           label: 'Open',
//           onClick: () => navigate(`/folder/${response.data._id}`)
//         }
//       });
//       // Auto-redirect to new folder (Dropbox-style)
//      navigate(`/folder/${response.data._id}`);
//     },
//     onError: (error: any) => {
//       toast.error('Failed to create folder', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   // Reupload mutation
// const reuploadMutation = useMutation({
//   mutationFn: async ({ file, documentId }: { file: File; documentId: string }) => {
//     return await reuploadFile(file, {
//       documentId,
//       changeDescription: 'File reuploaded',
//     });
//   },
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//     queryClient.invalidateQueries({ queryKey: ['document', reuploadDocumentId] });
//     queryClient.invalidateQueries({ queryKey: ['versions', reuploadDocumentId] });
//     toast.success('File reuploaded successfully', {
//       description: getFormattedDateTime()
//     });
//     setReuploadDocumentId(null);
//   },
//   onError: (error: any) => {
//     console.error('Reupload error:', error);
//     toast.error('Failed to reupload file', {
//       description: error?.response?.data?.message || error?.message || getFormattedDateTime()
//     });
//     setReuploadDocumentId(null);
//   }
// });
//   // Folder mutations
//   const updateFolderMutation = useMutation({
//     mutationFn: async (data: { id: string; name: string; color?: string }) => {
//       return await updateFolder(data.id, { name: data.name, color: data.color });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       queryClient.invalidateQueries({ queryKey: ['document', selectedFileId] });
//       toast.success('Folder updated successfully', {
//         description: getFormattedDateTime()
//       });
//     },
//     onError: (error: any) => {
//       toast.error('Failed to update folder', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   const deleteFolderMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return await softDeleteFolder(id);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       toast.success('Folder moved to trash', {
//         description: 'You can restore it from trash',
//         action: {
//           label: 'Undo',
//           onClick: () => toast.info('Restore feature coming soon')
//         }
//       });
//     },
//     onError: (error: any) => {
//       toast.error('Failed to move folder to trash', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   // Document mutations
//   const updateDocumentMutation = useMutation({
//     mutationFn: async (data: { id: string; name?: string; description?: string; tags?: string[] }) => {
//       return await updateDocument(data.id, { name: data.name, description: data.description, tags: data.tags });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       queryClient.invalidateQueries({ queryKey: ['document', selectedFileId] });
//       toast.success('File updated successfully', {
//         description: getFormattedDateTime()
//       });
//     },
//     onError: (error: any) => {
//       toast.error('Failed to update file', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   const deleteDocumentMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return await deleteDocument(id);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       toast.success('File moved to trash', {
//         description: 'You can restore it from trash',
//         action: {
//           label: 'Undo',
//           onClick: () => toast.info('Restore feature coming soon')
//         }
//       });
//     },
//     onError: (error: any) => {
//       toast.error('Failed to move file to trash', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   const addTagsMutation = useMutation({
//     mutationFn: async (data: { id: string; tags: string[] }) => {
//       return await addTags(data.id, data.tags);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//       queryClient.invalidateQueries({ queryKey: ['document', selectedFileId] });
//       toast.success('Tags added successfully', {
//         description: getFormattedDateTime()
//       });
//     },
//     onError: (error: any) => {
//       toast.error('Failed to add tags', {
//         description: error?.response?.data?.message || getFormattedDateTime()
//       });
//     }
//   });

//   const handleFileUpload = async (files: FileList | null) => {
//     if (!files || files.length === 0 || !parentId) return;

//     const filesArray = Array.from(files);
//     const { validFiles, errors } = validateFiles(filesArray);

//     if (errors.length > 0) {
//       toast.warning('Some files were rejected', {
//         description: errors.join(', ')
//       });
//     }

//     if (validFiles.length === 0) {
//       toast.error('No valid files to upload', {
//         description: 'Please check file types and sizes'
//       });
//       return;
//     }

//     const loadingToast = toast.loading(`Uploading ${validFiles.length} file(s)...`, {
//       description: getFormattedDateTime()
//     });

//     try {
//       await uploadFiles(validFiles, {
//         parentId,
//         onSuccess: () => {
//           queryClient.invalidateQueries({ queryKey: ['children', parentId] });
//           queryClient.invalidateQueries({ queryKey: ['tree'] });
//           toast.dismiss(loadingToast);
//           toast.success(`${validFiles.length} file(s) uploaded successfully`, {
//             description: getFormattedDateTime()
//           });
//         },
//         onError: (error) => {
//           console.error('Upload error:', error);
//           toast.dismiss(loadingToast);
//           toast.error('Upload failed', {
//             description: error?.message || getFormattedDateTime()
//           });
//         }
//       });
//     } catch (error: any) {
//       console.error('Upload failed:', error);
//       toast.dismiss(loadingToast);
//       toast.error('Upload failed', {
//         description: error?.message || getFormattedDateTime()
//       });
//     }
//   };

//   const handleReupload = (documentId: string) => {
//     setReuploadDocumentId(documentId);
//     reuploadInputRef.current?.click();
//   };

//   const handleReuploadFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     const currentDocId = reuploadDocumentId;
    
//     e.target.value = '';
    
//     if (!file || !currentDocId) {
//       return;
//     }

//     const validation = validateFile(file);
//     if (!validation.valid) {
//       toast.error(validation.error || 'Invalid file', {
//         description: getFormattedDateTime()
//       });
//       setReuploadDocumentId(null);
//       return;
//     }

//     const loadingToast = toast.loading('Reuploading file...', {
//       description: getFormattedDateTime()
//     });

//     try {
//       await reuploadMutation.mutateAsync({
//         file,
//         documentId: currentDocId
//       });
      
//       toast.dismiss(loadingToast);
//     } catch (error) {
//       toast.dismiss(loadingToast);
//     }
//   };

//   const handleDownload = async (item: FileItem) => {
//     try {
//       const response = await generateDownloadUrl(item._id);
//       window.open(response?.data?.url, '_blank');
      
//       toast.success('Download started', {
//         description: getFormattedDateTime()
//       });
//     } catch (error) {
//       console.error('Download error:', error);
//       toast.error('Download failed', {
//         description: getFormattedDateTime()
//       });
//     }
//   };

//   const handleShowInfo = (fileId: string, e?: React.MouseEvent) => {
//     if (e) e.stopPropagation();
//     setSelectedFileId(fileId);
//     setShowInfoPanel(true);
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       handleFileUpload(e.dataTransfer.files);
//     }
//   };

//   const handleBreadcrumbClick = (id: string) => {
//     navigate(`/folder/${id}`);
//   };

//   return (
//     <div className="h-full flex">
//       <div className="flex-1 flex flex-col">
//         <div className="flex items-center justify-between px-6 py-4 border-b">
//           <Breadcrumb>
//   <BreadcrumbList>
//     {breadcrumbs.map((crumb, index) => (
//       <React.Fragment key={crumb._id}>
//         {index > 0 && (
//           <BreadcrumbSeparator>
//             <ChevronRight className="w-4 h-4 text-gray-400" />
//           </BreadcrumbSeparator>
//         )}
//         <BreadcrumbItem>
//           {index === breadcrumbs.length - 1 ? (
//             <BreadcrumbPage className="text-gray-900 text-[24px] font-normal">
//               {crumb.name}
//             </BreadcrumbPage>
//           ) : (
//             <BreadcrumbLink
//               asChild
//               className="text-gray-700 text-[24px] hover:text-teal-600 transition-colors font-normal cursor-pointer"
//               onClick={() =>
//                 index === 0
//                   ? (window.location.href = "/") // 🔹 Go home on first breadcrumb
//                   : handleBreadcrumbClick(crumb._id)
//               }
//             >
//               <span>{crumb.name}</span>
//             </BreadcrumbLink>
//           )}
//         </BreadcrumbItem>
//       </React.Fragment>
//     ))}
//   </BreadcrumbList>
// </Breadcrumb>


//           <div className="flex items-center gap-2">
//             <Button
//               variant={viewMode === 'list' ? 'default' : 'ghost'}
//               size="icon"
//               onClick={() => setViewMode('list')}
//               className={viewMode === 'list' ? 'bg-teal-500 hover:bg-teal-600' : ''}
//             >
//               <List className="w-5 h-5" />
//             </Button>
//             <Button
//               variant={viewMode === 'grid' ? 'default' : 'ghost'}
//               size="icon"
//               onClick={() => setViewMode('grid')}
//               className={viewMode === 'grid' ? 'bg-teal-500 hover:bg-teal-600' : ''}
//             >
//               <Grid3x3 className="w-5 h-5" />
//             </Button>
//             <Button 
//               variant="ghost" 
//               size="icon"
//               onClick={() => setShowInfoPanel(!showInfoPanel)}
//               className={showInfoPanel ? 'bg-gray-100' : ''}
//             >
//               <Info className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>

//         <div 
//           className={`flex-1 overflow-auto relative ${isEmpty ? '' : 'pointer-events-none'}`}
//           onDragEnter={isEmpty ? handleDrag : undefined}
//           onDragLeave={isEmpty ? handleDrag : undefined}
//           onDragOver={isEmpty ? handleDrag : undefined}
//           onDrop={isEmpty ? handleDrop : undefined}
//         >
//           {isLoading ? (
//             <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>
//           ) : error ? (
//             <div className="flex flex-col items-center justify-center py-20">
//               <p className="text-red-600 mb-4">Failed to load folder</p>
//               <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['children', parentId] })}>
//                 Retry
//               </Button>
//             </div>
//           ) : isEmpty ? (
//             <EmptyState 
//               onUpload={() => fileInputRef.current?.click()}
//               dragActive={dragActive}
//               onCreateFolder={(data) => createFolderMutation.mutate({ ...data, parent_id: parentId || '' })}
//             />
//           ) : (
//             <div className="pointer-events-auto">
//               {viewMode === 'list' ? (
//                 <ListView 
//                   items={items} 
//                   parentId={parentId || ''} 
//                   updateFolderMutation={updateFolderMutation}
//                   deleteFolderMutation={deleteFolderMutation}
//                   updateDocumentMutation={updateDocumentMutation}
//                   deleteDocumentMutation={deleteDocumentMutation}
//                   addTagsMutation={addTagsMutation}
//                   onDownload={handleDownload}
//                   onShowInfo={handleShowInfo}
//                   onReupload={handleReupload}
//                   navigate={navigate}
//                 />
//               ) : (
//                 <GridView 
//                   items={items} 
//                   parentId={parentId || ''} 
//                   updateFolderMutation={updateFolderMutation}
//                   deleteFolderMutation={deleteFolderMutation}
//                   updateDocumentMutation={updateDocumentMutation}
//                   deleteDocumentMutation={deleteDocumentMutation}
//                   addTagsMutation={addTagsMutation}
//                   onDownload={handleDownload}
//                   onShowInfo={handleShowInfo}
//                   onReupload={handleReupload}
//                   navigate={navigate}
//                 />
//               )}
//             </div>
//           )}
//         </div>

//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           accept={ALLOWED_EXTENSIONS.join(',')}
//           onChange={(e) => {
//             handleFileUpload(e.target.files);
//             e.target.value = '';
//           }}
//           className="hidden"
//         />

//         <input
//           ref={reuploadInputRef}
//           type="file"
//           accept={ALLOWED_EXTENSIONS.join(',')}
//           onChange={handleReuploadFileChange}
//           className="hidden"
//         />
//       </div>

//       {showInfoPanel && (
//         <FileInfoPanel 
//           fileId={selectedFileId}
//           onClose={() => {
//             setShowInfoPanel(false);
//             setSelectedFileId(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// function EmptyState({ onUpload, dragActive, onCreateFolder }: { 
//   onUpload: () => void; 
//   dragActive: boolean;
//   onCreateFolder: (data: { name: string; color: string }) => void;
// }) {
//   const [showCreateFolder, setShowCreateFolder] = useState(false);

//   return (
//     <>
//       <div 
//         className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
//         onClick={onUpload}
//       >
//         <div className={`text-center transition-all ${dragActive ? 'scale-105' : ''}`}>
//           <div className="mb-8">
//             <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
//               <Upload className="w-32 h-32 text-gray-400" />
//             </div>
//           </div>
          
//           <h2 className="text-2xl font-semibold text-gray-800 mb-2">
//             {dragActive ? 'Drop files here' : 'Click anywhere to upload'}
//           </h2>
//           <p className="text-gray-600 mb-6">or drag and drop files</p>
          
//           <Button
//             variant="outline"
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowCreateFolder(true);
//             }}
//             className="mb-4"
//           >
//             <FolderPlus className="w-4 h-4 mr-2" />
//             Create Folder
//           </Button>
          
//           <p className="text-sm text-gray-500 mt-4">
//             Supported: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 4GB)
//           </p>
//         </div>
//       </div>

//       <CreateFolderModal
//         open={showCreateFolder}
//         onOpenChange={setShowCreateFolder}
//         onConfirm={onCreateFolder}
//       />
//     </>
//   );
// }

// function GridView({ items, parentId, updateFolderMutation, deleteFolderMutation, updateDocumentMutation, deleteDocumentMutation, addTagsMutation, onDownload, onShowInfo, onReupload, navigate }: any) {
//   const [renameModalOpen, setRenameModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [tagsModalOpen, setTagsModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

//   const handleCardClick = (item: FileItem) => {
//     if (item.type === 'folder' || item.itemType === 'folder') {
//       navigate(`/folder/${item._id}`);
//     }
//   };

//   const isImageFile = (filename: string) => {
//     return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
//   };

//   const getImageUrl = (item: FileItem) => {
//     return `https://d1rf5tmmedb5ah.cloudfront.net/${item.fileUrl}`;
//   };

//   const isFolder = (item: FileItem) => item.type === 'folder' || item.itemType === 'folder';

//   return (
//     <>
//       <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {items.map((item: FileItem) => (
//           <div
//             key={item._id}
//             className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
//             onClick={() => handleCardClick(item)}
//           >
//             <div className="px-3 py-2.5 bg-gray-50 flex items-center gap-2 border-b border-gray-100">
//               {isFolder(item) ? (
//                 <Folder className="w-4 h-4 text-gray-600 flex-shrink-0" />
//               ) : (
//                 <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
//               )}
//               <div className="flex-1 min-w-0">
//                 <span className="text-sm font-medium text-gray-800 truncate block">
//                   {item.type === "document" ? `${item.name}.${item?.extension}` : item.name}
//                 </span>
//               </div>
              
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                   <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
//                     <MoreVertical className="w-4 h-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuItem onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedItem(item);
//                     setRenameModalOpen(true);
//                   }}>
//                     <Pencil className="w-4 h-4 mr-2" /> Rename
//                   </DropdownMenuItem>

//                   {!isFolder(item) && (
//                     <>
//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         onDownload(item);
//                       }}>
//                         <Download className="w-4 h-4 mr-2" /> Download
//                       </DropdownMenuItem>

//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         onShowInfo(item._id, e);
//                       }}>
//                         <Eye className="w-4 h-4 mr-2" /> View Details
//                       </DropdownMenuItem>

//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedItem(item);
//                         setTagsModalOpen(true);
//                       }}>
//                         <Tag className="w-4 h-4 mr-2" /> Add Tags
//                       </DropdownMenuItem>

//                       <DropdownMenuSeparator />

//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         toast.info('Manage Access feature coming soon');
//                       }}>
//                         <Users className="w-4 h-4 mr-2" /> Manage Access
//                       </DropdownMenuItem>

//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         onReupload(item._id);
//                       }}>
//                         <RefreshCw className="w-4 h-4 mr-2" /> Reupload
//                       </DropdownMenuItem>

//                       <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
//                         <Link className='flex items-center' to={`/document/version-histroy/${item._id}`}>
//                           <History className="w-4 h-4 mr-2" /> Version History
//                         </Link>
//                       </DropdownMenuItem>

//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         toast.info('Activity feature coming soon');
//                       }}>
//                         <Activity className="w-4 h-4 mr-2" /> Activity
//                       </DropdownMenuItem>
//                     </>
//                   )}

//                   {isFolder(item) && (
//                     <DropdownMenuItem onClick={(e) => {
//                       e.stopPropagation();
//                       toast.info('Manage Access feature coming soon');
//                     }}>
//                       <Users className="w-4 h-4 mr-2" /> Manage Access
//                     </DropdownMenuItem>
//                   )}

//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     className="text-red-600"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedItem(item);
//                       setDeleteModalOpen(true);
//                     }}
//                   >
//                     <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             <div className="aspect-square bg-white flex items-center justify-center">
//               {isFolder(item) ? (
//                 <div 
//                  // PART 2: Continue from GridView's aspect-square div

//                   className="w-16 h-16 rounded-xl flex items-center justify-center" 
//                   style={{ backgroundColor: item.color || '#64748B' }}
//                 >
//                   <Folder className="w-10 h-10 text-white" />
//                 </div>
//               ) : item.originalName && isImageFile(item.originalName) ? (
//                 <>
//                   <img 
//                     src={getImageUrl(item)} 
//                     alt={item.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.currentTarget.style.display = 'none';
//                       const fallback = e.currentTarget.nextElementSibling as HTMLElement;
//                       if (fallback) fallback.style.display = 'flex';
//                     }}
//                   />
//                   <div className="w-full h-full items-center justify-center hidden">
//                     <FileText className="w-16 h-16 text-gray-400" />
//                   </div>
//                 </>
//               ) : (
//                 <FileText className="w-16 h-16 text-gray-400" />
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <RenameFolderModal 
//         open={renameModalOpen && selectedItem && (selectedItem.type === 'folder' || selectedItem.itemType === 'folder')}
//         onOpenChange={setRenameModalOpen}
//         item={selectedItem}
//         onConfirm={(data) => {
//           if (selectedItem) {
//             updateFolderMutation.mutate({ 
//               id: selectedItem._id, 
//               name: data.name,
//               color: data.color 
//             });
//             setRenameModalOpen(false);
//           }
//         }}
//       />
// <RenameDocumentModal 
//   open={renameModalOpen && selectedItem && (selectedItem.type === 'document' || selectedItem.itemType === 'file')}
//   onOpenChange={setRenameModalOpen}
//   item={selectedItem}
//   onConfirm={(data) => {
//     if (selectedItem) {
//       updateDocumentMutation.mutate({ 
//         id: selectedItem._id, 
//         name: data.name,
//         description: data.description 
//       });
//       setRenameModalOpen(false);
//     }
//   }}
// />

//       <DeleteModal 
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         item={selectedItem}
//         onConfirm={() => {
//           if (selectedItem) {
//             if (selectedItem.type === 'folder' || selectedItem.itemType === 'folder') {
//               deleteFolderMutation.mutate(selectedItem._id);
//             } else {
//               deleteDocumentMutation.mutate(selectedItem._id);
//             }
//             setDeleteModalOpen(false);
//           }
//         }}
//       />

//       <TagsModal 
//         open={tagsModalOpen}
//         onOpenChange={setTagsModalOpen}
//         item={selectedItem}
//         onConfirm={(tags) => {
//           if (selectedItem) {
//             addTagsMutation.mutate({ id: selectedItem._id, tags });
//             setTagsModalOpen(false);
//           }
//         }}
//       />
//     </>
//   );
// }

// function ListView({ items, parentId, updateFolderMutation, deleteFolderMutation, updateDocumentMutation, deleteDocumentMutation, addTagsMutation, onDownload, onShowInfo, onReupload, navigate }: any) {
//   const [renameModalOpen, setRenameModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [tagsModalOpen, setTagsModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
//   };

//   const isFolder = (item: FileItem) => item.type === 'folder' || item.itemType === 'folder';

//   const handleRowClick = (item: FileItem) => {
//     if (isFolder(item)) {
//       navigate(`/folder/${item._id}`);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white">
//         <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
//           <div className="col-span-5">Name</div>
//           <div className="col-span-2">Owner</div>
//           <div className="col-span-3">Date Modified</div>
//           <div className="col-span-2">File Size</div>
//         </div>

//         <div className="divide-y divide-gray-100">
//           {items.map((item: FileItem) => (
//             <div 
//               key={item._id} 
//               className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 ${isFolder(item) ? 'cursor-pointer' : ''}`}
//               onClick={() => handleRowClick(item)}
//             >
//               <div className="col-span-5 flex items-center gap-3">
//                 {isFolder(item) ? (
//                   <Folder className="w-6 h-6 text-gray-600" />
//                 ) : (
//                   <FileText className="w-6 h-6 text-gray-600" />
//                 )}
//                 <span className="text-sm font-medium text-gray-800 truncate">
//                   {item.type === "document" ? `${item.name}.${item?.extension}` : item.name}
//                 </span>
//               </div>
//               <div className="col-span-2 flex items-center">
//                 <div className="w-8 h-8 rounded-full bg-gray-300" />
//               </div>
//               <div className="col-span-3 text-sm text-gray-600">{formatDate(item.updatedAt)}</div>
//               <div className="col-span-2 flex items-center justify-between text-sm text-gray-600">
//                 <span>{item.type === "document" ? item.size : "-"}</span>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <MoreVertical className="w-4 h-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-56">
//                     <DropdownMenuItem onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedItem(item);
//                       setRenameModalOpen(true);
//                     }}>
//                       <Pencil className="w-4 h-4 mr-2" /> Rename
//                     </DropdownMenuItem>

//                     {!isFolder(item) && (
//                       <>
//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           onDownload(item);
//                         }}>
//                           <Download className="w-4 h-4 mr-2" /> Download
//                         </DropdownMenuItem>

//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           onShowInfo(item._id, e);
//                         }}>
//                           <Eye className="w-4 h-4 mr-2" /> View Details
//                         </DropdownMenuItem>

//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedItem(item);
//                           setTagsModalOpen(true);
//                         }}>
//                           <Tag className="w-4 h-4 mr-2" /> Add Tags
//                         </DropdownMenuItem>

//                         <DropdownMenuSeparator />

//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           toast.info('Manage Access feature coming soon');
//                         }}>
//                           <Users className="w-4 h-4 mr-2" /> Manage Access
//                         </DropdownMenuItem>

//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           onReupload(item._id);
//                         }}>
//                           <RefreshCw className="w-4 h-4 mr-2" /> Reupload
//                         </DropdownMenuItem>

//                         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
//                           <Link className='flex items-center' to={`/document/version-histroy/${item._id}`}>
//                             <History className="w-4 h-4 mr-2" /> Version History
//                           </Link>
//                         </DropdownMenuItem>

//                         <DropdownMenuItem onClick={(e) => {
//                           e.stopPropagation();
//                           toast.info('Activity feature coming soon');
//                         }}>
//                           <Activity className="w-4 h-4 mr-2" /> Activity
//                         </DropdownMenuItem>
//                       </>
//                     )}

//                     {isFolder(item) && (
//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation();
//                         toast.info('Manage Access feature coming soon');
//                       }}>
//                         <Users className="w-4 h-4 mr-2" /> Manage Access
//                       </DropdownMenuItem>
//                     )}

//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem 
//                       className="text-red-600"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedItem(item);
//                         setDeleteModalOpen(true);
//                       }}
//                     >
//                       <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <RenameFolderModal 
//         open={renameModalOpen && selectedItem && (selectedItem.type === 'folder' || selectedItem.itemType === 'folder')}
//         onOpenChange={setRenameModalOpen}
//         item={selectedItem}
//         onConfirm={(data) => {
//           if (selectedItem) {
//             updateFolderMutation.mutate({ 
//               id: selectedItem._id, 
//               name: data.name,
//               color: data.color 
//             });
//             setRenameModalOpen(false);
//           }
//         }}
//       />

//       <RenameDocumentModal 
//         open={renameModalOpen && selectedItem && selectedItem.type === 'document'}
//         onOpenChange={setRenameModalOpen}
//         item={selectedItem}
//         onConfirm={(data) => {
//           if (selectedItem) {
//             updateDocumentMutation.mutate({ 
//               id: selectedItem._id, 
//               name: data.name,
//               description: data.description 
//             });
//             setRenameModalOpen(false);
//           }
//         }}
//       />

//       <DeleteModal 
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         item={selectedItem}
//         onConfirm={() => {
//           if (selectedItem) {
//             if (selectedItem.type === 'folder' || selectedItem.itemType === 'folder') {
//               deleteFolderMutation.mutate(selectedItem._id);
//             } else {
//               deleteDocumentMutation.mutate(selectedItem._id);
//             }
//             setDeleteModalOpen(false);
//           }
//         }}
//       />

//       <TagsModal 
//         open={tagsModalOpen}
//         onOpenChange={setTagsModalOpen}
//         item={selectedItem}
//         onConfirm={(tags) => {
//           if (selectedItem) {
//             addTagsMutation.mutate({ id: selectedItem._id, tags });
//             setTagsModalOpen(false);
//           }
//         }}
//       />
//     </>
//   );
// }

// // Modal Components with React Hook Form

// function CreateFolderModal({ open, onOpenChange, onConfirm }: { 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   onConfirm: (data: { name: string; color: string }) => void;
// }) {
//   const form = useForm<z.infer<typeof createFolderSchema>>({
//     resolver: zodResolver(createFolderSchema),
//     defaultValues: {
//       name: '',
//       color: '#3B82F6',
//     },
//   });

//   const handleSubmit = (data: z.infer<typeof createFolderSchema>) => {
//     onConfirm(data);
//     onOpenChange(false);
//     form.reset();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Create New Folder</DialogTitle>
//           <DialogDescription>
//             Enter a name and choose a color for your new folder.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Folder Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g., Marketing Materials" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="color"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Color (Optional)</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
//                 Create Folder
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function RenameFolderModal({ open, onOpenChange, item, onConfirm }: { 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   item: FileItem | null;
//   onConfirm: (data: { name: string; color?: string }) => void;
// }) {
//   const form = useForm<z.infer<typeof renameFolderSchema>>({
//     resolver: zodResolver(renameFolderSchema),
//     defaultValues: {
//       name: item?.name || '',
//       color: item?.color || '#3B82F6',
//     },
//   });

//   React.useEffect(() => {
//     if (item) {
//       form.reset({
//         name: item.name,
//         color: item.color || '#3B82F6',
//       });
//     }
//   }, [item, form]);

//   const handleSubmit = (data: z.infer<typeof renameFolderSchema>) => {
//     onConfirm(data);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Rename Folder</DialogTitle>
//           <DialogDescription>
//             Update the name and color for this folder.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Folder Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter folder name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="color"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Color (Optional)</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
//                 Update Folder
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
// function RenameDocumentModal({ open, onOpenChange, item, onConfirm }: { 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   item: FileItem | null;
//   onConfirm: (data: { name: string; description?: string }) => void;
// }) {
//   const form = useForm<z.infer<typeof renameDocumentSchema>>({
//     resolver: zodResolver(renameDocumentSchema),
//     defaultValues: {
//       name: item?.name || '',
//       description: item?.description || '',
//     },
//   });

//   React.useEffect(() => {
//     if (item) {
//       form.reset({
//         name: item.name,
//         description: item.description || '',
//       });
//     }
//   }, [item, form]);

//   const handleSubmit = (data: z.infer<typeof renameDocumentSchema>) => {
//     onConfirm(data);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Rename File</DialogTitle>
//           <DialogDescription>
//             Update the name and description for this file (without extension).
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>File Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter file name (without extension)" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description (Optional)</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Enter file description"
//                       rows={3}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
//                 Update File
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
// function DeleteModal({ open, onOpenChange, item, onConfirm }: { 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   item: FileItem | null;
//   onConfirm: () => void;
// }) {
//   const isFolder = item && (item.type === 'folder' || item.itemType === 'folder');
  
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Move to Trash</DialogTitle>
//           <DialogDescription>
//             Are you sure you want to move "{item?.name}" to trash? You can restore it later from the trash.
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button 
//             onClick={onConfirm} 
//             className="bg-red-600 hover:bg-red-700 text-white"
//           >
//             Move to Trash
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function TagsModal({ open, onOpenChange, item, onConfirm }: { 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   item: FileItem | null;
//   onConfirm: (tags: string[]) => void;
// }) {
//   const form = useForm<z.infer<typeof addTagsSchema>>({
//     resolver: zodResolver(addTagsSchema),
//     defaultValues: {
//       tags: item?.tags?.join(', ') || '',
//     },
//   });

//   React.useEffect(() => {
//     if (item) {
//       form.reset({
//         tags: item.tags?.join(', ') || '',
//       });
//     }
//   }, [item, form]);

//   const handleSubmit = (data: z.infer<typeof addTagsSchema>) => {
//     const tagsArray = data.tags.split(',').map(t => t.trim()).filter(Boolean);
//     onConfirm(tagsArray);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Add Tags</DialogTitle>
//           <DialogDescription>
//             Add or update tags for "{item?.name}". Separate multiple tags with commas.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="tags"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Tags</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g., important, project, Q1"
//                       {...field}
//                     />
//                   </FormControl>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Current tags: {item?.tags && item.tags.length > 0 ? item.tags.join(', ') : 'None'}
//                   </p>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
//                 Save Tags
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }