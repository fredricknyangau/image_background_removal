import { Loader2, CheckCircle, AlertCircle, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type QueueItem } from "@/types/batch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BatchQueueProps {
    queue: QueueItem[];
    onRemove: (id: string) => void;
    onDownload: (id: string) => void;
    onDownloadAll: () => void;
    isProcessing: boolean;
}

export const BatchQueue = ({
    queue,
    onRemove,
    onDownload,
    onDownloadAll,
    isProcessing,
}: BatchQueueProps) => {
    if (queue.length === 0) return null;

    const completedCount = queue.filter((item) => item.status === "completed").length;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Batch Queue ({completedCount}/{queue.length})
                </h3>
                {completedCount > 0 && (
                    <Button onClick={onDownloadAll} variant="outline" size="sm" disabled={isProcessing}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                    </Button>
                )}
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <ScrollArea className="h-[400px] w-full p-4">
                    <div className="space-y-3">
                        {queue.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border transition-all hover:bg-muted"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-background border shrink-0">
                                    <img
                                        src={item.processedUrl || item.previewUrl}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                    {item.status === "processing" && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.status === "queued" && (
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                                                Queued
                                            </span>
                                        )}
                                        {item.status === "processing" && (
                                            <span className="text-xs text-blue-500 flex items-center">
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Processing...
                                            </span>
                                        )}
                                        {item.status === "completed" && (
                                            <span className="text-xs text-green-500 flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Done
                                            </span>
                                        )}
                                        {item.status === "error" && (
                                            <span className="text-xs text-red-500 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Failed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {item.status === "completed" && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDownload(item.id)}
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onRemove(item.id)}
                                        disabled={item.status === "processing"}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
