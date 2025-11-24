/**
 * ============================================================================
 * CENTRALIZED CONSTANTS - Upload & File Validation
 * ============================================================================
 * All upload-related constants in one place for easy configuration
 */

// ============================================================================
// CHUNKED UPLOAD CONFIGURATION
// ============================================================================

/**
 * Files larger than this threshold will use chunked upload
 * @default 100MB
 */
export const CHUNKED_UPLOAD_THRESHOLD = 100 * 1024 * 1024; // 100MB

/**
 * Minimum chunk size (S3 requirement for all parts except last)
 * @default 5MB
 */
export const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Default chunk size when network detection is unavailable
 * @default 10MB
 */
export const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Maximum chunk size allowed per upload
 * @default 100MB
 */
export const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Maximum number of parts allowed per multipart upload (S3 limit)
 * @default 10000
 */
export const MAX_PARTS = 10000;

// ============================================================================
// NETWORK-AWARE CHUNK SIZES
// ============================================================================

/**
 * Chunk size recommendations based on network speed
 */
export const NETWORK_CHUNK_SIZES = {
  '4g': 20 * 1024 * 1024,        // 20MB for fast connections
  '3g': 10 * 1024 * 1024,        // 10MB for medium connections
  '2g': 5 * 1024 * 1024,         // 5MB for slow connections
  'slow-2g': 5 * 1024 * 1024,    // 5MB for very slow connections
  'default': DEFAULT_CHUNK_SIZE,  // 10MB fallback
} as const;

// ============================================================================
// FILE VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum file size allowed for upload
 * @default 5GB (S3 multipart upload limit)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

/**
 * Allowed file extensions for upload
 */
export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".xlsx",
  ".xls",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".zip",
  ".rar",
  ".txt",
  ".csv",
] as const;

/**
 * Allowed MIME types for upload
 */
export const ALLOWED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-rar",
  
  // Text
  "text/plain",
  "text/csv",
] as const;

/**
 * File type categories for organization
 */
export const FILE_TYPE_CATEGORIES = {
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  txt: 'document',
  
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  csv: 'spreadsheet',
  
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  
  zip: 'archive',
  rar: 'archive',
} as const;

// ============================================================================
// UPLOAD PROGRESS CONSTANTS
// ============================================================================

/**
 * Upload status messages
 */
export const UPLOAD_STATUS = {
  IDLE: 'Idle',
  UPLOADING: 'Uploading File',
  UPLOADING_CHUNKED: 'Uploading File (Chunked)',
  PROCESSING: 'Processing File',
  COMPLETE: 'Upload Complete',
  FAILED: 'Upload Failed',
  CANCELLED: 'Upload Cancelled',
} as const;

/**
 * Time to auto-remove completed uploads from UI (milliseconds)
 * @default 3000ms (3 seconds)
 */
export const AUTO_REMOVE_DELAY = 3000;

// ============================================================================
// API TIMEOUT CONSTANTS
// ============================================================================

/**
 * Timeout for presigned URL requests (milliseconds)
 * @default 30000ms (30 seconds)
 */
export const PRESIGNED_URL_TIMEOUT = 30000;

/**
 * Timeout for single file upload (milliseconds)
 * @default 300000ms (5 minutes)
 */
export const SINGLE_UPLOAD_TIMEOUT = 300000;

/**
 * Timeout for chunk upload (milliseconds)
 * @default 60000ms (1 minute per chunk)
 */
export const CHUNK_UPLOAD_TIMEOUT = 60000;

/**
 * Presigned URL expiration time (seconds)
 * @default 3600s (1 hour)
 */
export const PRESIGNED_URL_EXPIRY = 3600;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Maximum number of retry attempts for failed chunk uploads
 * @default 3
 */
export const MAX_CHUNK_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts (milliseconds)
 * @default 1000ms (1 second)
 */
export const RETRY_DELAY = 1000;

/**
 * Exponential backoff multiplier for retries
 * @default 2
 */
export const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// UI DISPLAY CONSTANTS
// ============================================================================

/**
 * Format bytes to human-readable format
 */
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Number of decimal places for file size display
 * @default 2
 */
export const FILE_SIZE_DECIMALS = 2;

/**
 * Progress bar update throttle (milliseconds)
 * @default 100ms
 */
export const PROGRESS_UPDATE_THROTTLE = 100;

// ============================================================================
// VALIDATION ERROR MESSAGES
// ============================================================================

export const VALIDATION_ERRORS = {
  NO_FILES: "No files provided",
  NO_PARENT_ID: "Parent ID is required",
  NO_DOCUMENT_ID: "Document ID is required",
  INVALID_EXTENSION: (ext: string, allowed: readonly string[]) => 
    `Invalid file type "${ext}". Allowed: ${allowed.join(", ")}`,
  INVALID_MIME_TYPE: "Invalid file format. File type must match allowed formats.",
  FILE_TOO_LARGE: (maxSizeGB: string) => 
    `File too large. Max size: ${maxSizeGB}GB`,
  UPLOAD_FAILED: "Upload failed. Please try again.",
  NETWORK_ERROR: "Network error during upload. Please check your connection.",
  CANCELLED: "Upload was cancelled.",
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Enable/disable chunked upload feature
 * @default true
 */
export const ENABLE_CHUNKED_UPLOAD = true;

/**
 * Enable/disable network-aware chunk sizing
 * @default true
 */
export const ENABLE_NETWORK_DETECTION = true;

/**
 * Enable/disable upload retries
 * @default true
 */
export const ENABLE_UPLOAD_RETRY = true;

/**
 * Enable/disable upload progress logging
 * @default false (set true for debugging)
 */
export const ENABLE_UPLOAD_LOGGING = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if file should use chunked upload
 */
export const shouldUseChunkedUpload = (fileSize: number): boolean => {
  return ENABLE_CHUNKED_UPLOAD && fileSize > CHUNKED_UPLOAD_THRESHOLD;
};

/**
 * Get file category from extension
 */
export const getFileCategory = (extension: string): string => {
  const ext = extension.toLowerCase().replace('.', '');
  return FILE_TYPE_CATEGORIES[ext as keyof typeof FILE_TYPE_CATEGORIES] || 'file';
};

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number, decimals: number = FILE_SIZE_DECIMALS): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${FILE_SIZE_UNITS[i]}`;
};

/**
 * Get chunk size based on network conditions
 */
export const detectOptimalChunkSize = (): number => {
  if (!ENABLE_NETWORK_DETECTION) {
    return DEFAULT_CHUNK_SIZE;
  }
  
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  if (connection?.effectiveType) {
    const effectiveType = connection.effectiveType as keyof typeof NETWORK_CHUNK_SIZES;
    return NETWORK_CHUNK_SIZES[effectiveType] || NETWORK_CHUNK_SIZES.default;
  }
  
  return DEFAULT_CHUNK_SIZE;
};

/**
 * Calculate number of chunks needed
 */
export const calculateChunkCount = (fileSize: number, chunkSize: number): number => {
  return Math.ceil(fileSize / chunkSize);
};

/**
 * Validate chunk size is within allowed range
 */
export const isValidChunkSize = (chunkSize: number): boolean => {
  return chunkSize >= MIN_CHUNK_SIZE && chunkSize <= MAX_CHUNK_SIZE;
};

/**
 * Calculate if file can be uploaded with given chunk size
 */
export const canUploadWithChunkSize = (fileSize: number, chunkSize: number): boolean => {
  const chunkCount = calculateChunkCount(fileSize, chunkSize);
  return chunkCount <= MAX_PARTS && isValidChunkSize(chunkSize);
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UploadStatus = typeof UPLOAD_STATUS[keyof typeof UPLOAD_STATUS];
export type FileExtension = typeof ALLOWED_EXTENSIONS[number];
export type MimeType = typeof ALLOWED_MIME_TYPES[number];
export type FileCategory = typeof FILE_TYPE_CATEGORIES[keyof typeof FILE_TYPE_CATEGORIES];
export type NetworkType = keyof typeof NETWORK_CHUNK_SIZES;

// ============================================================================
// CONFIGURATION SUMMARY (for logging/debugging)
// ============================================================================

export const CONFIG_SUMMARY = {
  uploadThreshold: formatFileSize(CHUNKED_UPLOAD_THRESHOLD),
  maxFileSize: formatFileSize(MAX_FILE_SIZE),
  chunkSizeRange: `${formatFileSize(MIN_CHUNK_SIZE)} - ${formatFileSize(MAX_CHUNK_SIZE)}`,
  defaultChunkSize: formatFileSize(DEFAULT_CHUNK_SIZE),
  maxParts: MAX_PARTS,
  allowedExtensions: ALLOWED_EXTENSIONS.length,
  allowedMimeTypes: ALLOWED_MIME_TYPES.length,
  features: {
    chunkedUpload: ENABLE_CHUNKED_UPLOAD,
    networkDetection: ENABLE_NETWORK_DETECTION,
    uploadRetry: ENABLE_UPLOAD_RETRY,
    uploadLogging: ENABLE_UPLOAD_LOGGING,
  },
} as const;