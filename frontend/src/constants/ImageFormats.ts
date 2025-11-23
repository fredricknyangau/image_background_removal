// Supported image formats
export const SUPPORTED_FORMATS = {
  JPEG: "image/jpeg",
  PNG: "image/png",
  WEBP: "image/webp",
} as const;

export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
