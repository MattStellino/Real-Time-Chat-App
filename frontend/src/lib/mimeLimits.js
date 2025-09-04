// File validation constants and helpers
export const MAX_FILE_MB = 25;
export const MAX_ATTACHMENTS = 10;

// Accepted MIME types
export const ACCEPTED_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif",
  "image/heic",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  // Archives
  "application/zip",
  "application/x-rar-compressed"
]);

// File type categories
export const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp", 
  "image/gif",
  "image/heic"
]);

export const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

export const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

export const ARCHIVE_TYPES = new Set([
  "application/zip",
  "application/x-rar-compressed"
]);

// Validation function
export function validateFile(file) {
  const maxSizeBytes = MAX_FILE_MB * 1024 * 1024;
  
  // Check file type
  if (!ACCEPTED_TYPES.has(file.type)) {
    return {
      valid: false,
      reason: "Unsupported file type. Please select images (JPEG, PNG, WebP, GIF, HEIC), videos (MP4, WebM, QuickTime), documents (PDF, DOC, DOCX, TXT), or archives (ZIP, RAR)."
    };
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      reason: `File is too large. Maximum size is ${MAX_FILE_MB}MB.`
    };
  }
  
  return {
    valid: true,
    reason: ""
  };
}

// Get file type category
export function getFileType(file) {
  if (IMAGE_TYPES.has(file.type)) {
    return "image";
  } else if (VIDEO_TYPES.has(file.type)) {
    return "video";
  } else if (DOCUMENT_TYPES.has(file.type)) {
    return "document";
  } else if (ARCHIVE_TYPES.has(file.type)) {
    return "archive";
  }
  return "unknown";
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
