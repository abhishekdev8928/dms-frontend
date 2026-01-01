// helpers/fileValidationHelpers.ts

import { ALLOWED_FILE_TYPES, BLOCKED_FILE_TYPES } from '@/utils/constant';

/**
 * ============================================================================
 * FILE VALIDATION HELPERS
 * ============================================================================
 */

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: keyof typeof ALLOWED_FILE_TYPES | null;
}

export interface ValidateFilesResult {
  validFiles: File[];
  errors: string[];
}

/* =======================================================
   GET ALL EXTENSIONS & MIME TYPES
   ======================================================= */

export const getAllAllowedExtensions = (): string[] => {
  return Object.values(ALLOWED_FILE_TYPES).flatMap((type) => type.extensions);
};

export const getAllAllowedMimeTypes = (): string[] => {
  return Object.values(ALLOWED_FILE_TYPES).flatMap((type) => type.mimeTypes);
};

export const getAllBlockedExtensions = (): string[] => {
  return Object.values(BLOCKED_FILE_TYPES).flatMap((type) => type.extensions);
};

/* =======================================================
   NORMALIZE EXTENSION & MIME TYPE
   ======================================================= */

export const normalizeExtension = (extension: string): string => {
  const ext = extension.toLowerCase().trim();
  return ext.startsWith('.') ? ext : `.${ext}`;
};

export const normalizeMimeType = (mimeType: string): string => {
  return mimeType.toLowerCase().trim();
};

/* =======================================================
   VALIDATION CHECKS
   ======================================================= */

export const isExtensionAllowed = (extension: string): boolean => {
  const ext = normalizeExtension(extension);
  return getAllAllowedExtensions().includes(ext);
};

export const isExtensionBlocked = (extension: string): boolean => {
  const ext = normalizeExtension(extension);
  return getAllBlockedExtensions().includes(ext);
};

export const isMimeTypeAllowed = (mimeType: string): boolean => {
  const mime = normalizeMimeType(mimeType);
  return getAllAllowedMimeTypes().includes(mime);
};

/* =======================================================
   GET CATEGORY & BLOCKED REASON
   ======================================================= */

export const getFileCategory = (
  extension: string
): keyof typeof ALLOWED_FILE_TYPES | null => {
  const ext = normalizeExtension(extension);

  for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.extensions.includes(ext as any)) {
      return category as keyof typeof ALLOWED_FILE_TYPES;
    }
  }

  return null;
};

export const getBlockedReason = (extension: string): string | null => {
  const ext = normalizeExtension(extension);

  for (const config of Object.values(BLOCKED_FILE_TYPES)) {
    if (config.extensions.includes(ext as any)) {
      return config.reason;
    }
  }

  return null;
};

/* =======================================================
   FILE INPUT ACCEPT ATTRIBUTE
   ======================================================= */

/**
 * Generate accept attribute for file input
 * Returns comma-separated list of allowed extensions
 * Example: ".pdf,.docx,.jpg"
 */
export const getAcceptAttribute = (): string => {
  return getAllAllowedExtensions().join(',');
};

/* =======================================================
   VALIDATE FILE TYPE
   ======================================================= */

/**
 * Validate file extension and MIME type
 * @param extension - File extension (with or without dot)
 * @param mimeType - File MIME type
 * @returns Validation result with error message if invalid
 */
export const validateFileType = (
  extension: string,
  mimeType: string
): FileValidationResult => {
  const ext = normalizeExtension(extension);
  const mime = normalizeMimeType(mimeType);

  // Check if blocked
  if (isExtensionBlocked(ext)) {
    const reason = getBlockedReason(ext);
    return {
      valid: false,
      error: reason || 'File type is blocked for security reasons',
    };
  }

  // Check if extension allowed
  if (!isExtensionAllowed(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed`,
    };
  }

  // Check if MIME type allowed
  if (!isMimeTypeAllowed(mime)) {
    return {
      valid: false,
      error: `File type "${mime}" is not allowed`,
    };
  }

  return {
    valid: true,
    category: getFileCategory(ext),
  };
};

/* =======================================================
   VALIDATE MULTIPLE FILES
   ======================================================= */

/**
 * Validate multiple files at once
 * @param files - Array of File objects
 * @returns Object with valid files and error messages
 */
export const validateFiles = (files: File[]): ValidateFilesResult => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const extension = file.name.split('.').pop() || '';
    const mimeType = file.type;

    const result = validateFileType(extension, mimeType);

    if (!result.valid) {
      errors.push(`${file.name}: ${result.error}`);
      continue;
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
};

/* =======================================================
   VALIDATE SINGLE FILE WITH SIZE CHECK
   ======================================================= */

/**
 * Validate single file with size check
 * @param file - File object to validate
 * @param maxSize - Maximum file size in bytes (default: 5GB)
 * @returns Validation result with error message if invalid
 */
export const validateFile = (
  file: File,
  maxSize: number = 5 * 1024 * 1024 * 1024 // 5GB
): FileValidationResult => {
  const extension = file.name.split('.').pop() || '';

  // Validate file type
  const typeValidation = validateFileType(extension, file.type);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Validate file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(maxSize)}`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true, category: typeValidation.category };
};

/* =======================================================
   UTILITY FUNCTIONS
   ======================================================= */

/**
 * Format file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns Extension without dot
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};