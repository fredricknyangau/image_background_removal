// Image-related TypeScript types
export interface ImageFile {
  file: File;
  preview: string;
  processed?: string;
}

export interface ImageProcessingOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
}
