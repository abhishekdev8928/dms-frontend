// helpers/documentHelpers.ts

import type {
  IDocument,
  IDocumentVersion,
  FileTypeCategory,
  IFileValidation,
} from '@/config/types/documentTypes';

/* =======================================================
   FILE TYPE DETECTION
   ======================================================= */

const FILE_TYPE_MAP: Record<string, FileTypeCategory> = {
  // Documents
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  txt: 'document',
  rtf: 'document',
  odt: 'document',
  xls: 'document',
  xlsx: 'document',
  ppt: 'document',
  pptx: 'document',
  csv: 'document',

  // Images
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  bmp: 'image',
  svg: 'image',
  webp: 'image',
  ico: 'image',

  // Videos
  mp4: 'video',
  avi: 'video',
  mov: 'video',
  wmv: 'video',
  flv: 'video',
  mkv: 'video',
  webm: 'video',

  // Audio
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  aac: 'audio',
  ogg: 'audio',
  wma: 'audio',

  // Archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  bz2: 'archive',

  // Code
  js: 'code',
  ts: 'code',
  jsx: 'code',
  tsx: 'code',
  html: 'code',
  css: 'code',
  scss: 'code',
  json: 'code',
  xml: 'code',
  py: 'code',
  java: 'code',
  cpp: 'code',
  c: 'code',
  php: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  swift: 'code',
  kt: 'code',
};

const MIME_TYPE_CATEGORIES: Record<string, FileTypeCategory> = {
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
};

/**
 * Determine file type category from extension or MIME type
 */
export function determineFileType(
  mimeType: string,
  extension: string
): FileTypeCategory {
  // Remove dot from extension if present
  const ext = extension.startsWith('.') ? extension.slice(1).toLowerCase() : extension.toLowerCase();

  // Try extension first
  if (FILE_TYPE_MAP[ext]) {
    return FILE_TYPE_MAP[ext];
  }

  // Try MIME type
  if (MIME_TYPE_CATEGORIES[mimeType]) {
    return MIME_TYPE_CATEGORIES[mimeType];
  }

  // Check MIME type prefix
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'document';

  return 'other';
}

/**
 * Validate file based on extension and MIME type
 */
export function validateFile(
  extension: string | null,
  mimeType: string
): IFileValidation {
  if (!extension && !mimeType) {
    return {
      valid: false,
      reason: 'Both extension and MIME type are missing',
      group: 'unknown',
      category: 'other',
    };
  }

  const category = determineFileType(mimeType, extension || '');

  // Add custom validation rules here
  const maxSize = 5 * 1024 * 1024 * 1024; // 5GB

  return {
    valid: true,
    group: category,
    category,
  };
}

/* =======================================================
   FILE SIZE FORMATTING
   ======================================================= */

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/* =======================================================
   DATE FORMATTING
   ======================================================= */

/**
 * Format date to "time ago" string
 */
export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;

  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* =======================================================
   DOCUMENT HELPERS
   ======================================================= */

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * Generate safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Check if document is deleted
 */
export function isDocumentDeleted(document: IDocument): boolean {
  return document.isDeleted && document.deletedAt !== null;
}

/**
 * Get document display name
 */
export function getDocumentDisplayName(document: IDocument): string {
  return document.originalName || document.name;
}

/**
 * Check if version is latest
 */
export function isLatestVersion(version: IDocumentVersion): boolean {
  return version.isLatest;
}

/**
 * Sort versions by version number (descending)
 */
export function sortVersions(versions: IDocumentVersion[]): IDocumentVersion[] {
  return [...versions].sort((a, b) => {
    if (a.isLatest && !b.isLatest) return -1;
    if (!a.isLatest && b.isLatest) return 1;
    return b.versionNumber - a.versionNumber;
  });
}

/* =======================================================
   PERMISSION HELPERS
   ======================================================= */

/**
 * Check if user can perform action
 */
export function canPerformAction(
  document: IDocument,
  action: keyof IDocument['actions']
): boolean {
  return document.actions?.[action] ?? false;
}

/**
 * Get available actions for document
 */
export function getAvailableActions(document: IDocument): string[] {
  if (!document.actions) return [];

  return Object.entries(document.actions)
    .filter(([_, canDo]) => canDo)
    .map(([action]) => action.replace('can', '').toLowerCase());
}

/* =======================================================
   FILE ICON HELPERS
   ======================================================= */

const FILE_ICONS: Record<FileTypeCategory, string> = {
  document: '📄',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  archive: '📦',
  code: '💻',
  other: '📎',
};

/**
 * Get icon for file type
 */
export function getFileIcon(fileType: FileTypeCategory): string {
  return FILE_ICONS[fileType] || FILE_ICONS.other;
}

/**
 * Get icon for document
 */
export function getDocumentIcon(document: IDocument): string {
  return getFileIcon(document.fileType);
}

/* =======================================================
   SEARCH & FILTER HELPERS
   ======================================================= */

/**
 * Filter documents by tag
 */
export function filterByTag(documents: IDocument[], tag: string): IDocument[] {
  return documents.filter((doc) => doc.tags.includes(tag));
}

/**
 * Filter documents by file type
 */
export function filterByFileType(
  documents: IDocument[],
  fileType: FileTypeCategory
): IDocument[] {
  return documents.filter((doc) => doc.fileType === fileType);
}

/**
 * Filter documents by date range
 */
export function filterByDateRange(
  documents: IDocument[],
  startDate: Date,
  endDate: Date
): IDocument[] {
  return documents.filter((doc) => {
    const createdAt = new Date(doc.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });
}

/**
 * Search documents by name
 */
export function searchByName(documents: IDocument[], query: string): IDocument[] {
  const lowerQuery = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.originalName.toLowerCase().includes(lowerQuery) ||
      doc.description?.toLowerCase().includes(lowerQuery)
  );
}

/* =======================================================
   VALIDATION HELPERS
   ======================================================= */

/**
 * Check if file size is within limit
 */
export function isFileSizeValid(size: number, maxSize: number = 5 * 1024 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Check if extension is allowed
 */
export function isExtensionAllowed(extension: string, allowedExtensions?: string[]): boolean {
  if (!allowedExtensions || allowedExtensions.length === 0) return true;

  const ext = extension.startsWith('.') ? extension.slice(1).toLowerCase() : extension.toLowerCase();
  return allowedExtensions.map((e) => e.toLowerCase()).includes(ext);
}

/**
 * Validate document name
 */
export function isDocumentNameValid(name: string): boolean {
  return name.length > 0 && name.length <= 255 && /^[a-zA-Z0-9\s\-_\.()]+$/.test(name);
}

/* =======================================================
   PATH HELPERS
   ======================================================= */

/**
 * Get parent path from document path
 */
export function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

/**
 * Get path depth
 */
export function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

/**
 * Extract breadcrumb from path
 */
export function getBreadcrumbFromPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}