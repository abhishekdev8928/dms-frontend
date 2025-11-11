// src/types/fileSystem.ts

export interface FileItem {
  _id: string;
  name: string;
  itemType: 'file' | 'folder';
  type: 'document' | 'folder';
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

export interface Breadcrumb {
  _id: string;
  name: string;
  type: string;
  path: string;
}

export interface MutationProps {
  mutate: (data: any) => void;
}

export interface FileOperationProps {
  parentId: string;
  items: FileItem[];
  updateFolderMutation: MutationProps;
  deleteFolderMutation: MutationProps;
  updateDocumentMutation: MutationProps;
  deleteDocumentMutation: MutationProps;
  addTagsMutation: MutationProps;
  onDownload: (item: FileItem) => void;
  onShowInfo: (fileId: string, e?: React.MouseEvent) => void;
  onReupload: (documentId: string) => void;
  navigate: (path: string) => void;
}