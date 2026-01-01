// helpers/fileValidationHelpers.ts

import { ALLOWED_FILE_TYPES, BLOCKED_FILE_TYPES  } from '@/utils/constant';

/**
 * ============================================================================
 * FILE VALIDATION HELPERS
 * ============================================================================
 */

/* =======================================================
   GET ALL EXTENSIONS & MIME TYPES
   ======================================================= */

export const getAllAllowedExtensions = (): string[] => {
  return Object.values(ALLOWED_FILE_TYPES).flatMap(type => type.extensions);
};

export const getAllAllowedMimeTypes = (): string[] => {
  return Object.values(ALLOWED_FILE_TYPES).flatMap(type => type.mimeTypes);
};

export const getAllBlockedExtensions = (): string[] => {
  return Object.values(BLOCKED_FILE_TYPES).flatMap(type => type.extensions);
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
   GET CATEGORY
   ======================================================= */

export const getFileCategory = (extension: string): keyof typeof ALLOWED_FILE_TYPES | null => {
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
export const getAcceptAttribute = (): string => {
  return getAllAllowedExtensions().join(",");
};
/* =======================================================
   VALIDATE FILE
   ======================================================= */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: keyof typeof ALLOWED_FILE_TYPES | null;
}

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


export interface ValidateFilesResult {
  validFiles: File[];
  errors: string[];
}

export const validateFiles = (files: File[]): ValidateFilesResult => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop() || "";
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


