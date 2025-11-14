export interface FileItem {
  _id: string;
  name: string;
  type: string; // Can be "folder", "image", "pdf", "video", etc.
  parent_id?: string;
  color?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: {
    _id: string;
    email: string;
    username: string;
  };
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