export type BatchStatus = "queued" | "processing" | "completed" | "error";

export interface QueueItem {
    id: string;
    file: File;
    previewUrl: string;
    processedUrl: string | null;
    status: BatchStatus;
    error?: string;
}
