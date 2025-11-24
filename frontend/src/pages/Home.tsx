import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { BatchQueue } from "@/components/BatchQueue/BatchQueue";
import { HistorySidebar } from "@/components/History/HistorySidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { type QueueItem } from "@/types/batch";
import apiService from "@/services/apiService";
import { historyService, type HistoryItem } from "@/services/historyService";

const Home = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const activeItem = queue.find((item) => item.id === activeItemId);
  const isProcessingQueue = queue.some((item) => item.status === "processing");

  // Process Queue Effect
  useEffect(() => {
    const processNext = async () => {
      const nextItem = queue.find((item) => item.status === "queued");
      if (!nextItem) return;

      // Update status to processing
      setQueue((prev) =>
        prev.map((item) =>
          item.id === nextItem.id ? { ...item, status: "processing" } : item
        )
      );

      try {
        const blob = await apiService(nextItem.file);
        const processedUrl = URL.createObjectURL(blob);

        setQueue((prev) =>
          prev.map((item) =>
            item.id === nextItem.id
              ? { ...item, status: "completed", processedUrl }
              : item
          )
        );

        // If this is the active item, notify user
        if (activeItemId === nextItem.id) {
          toast({
            title: "Success!",
            description: "Background removed successfully",
          });
        }

        // Save to history
        await historyService.addItem({
          id: nextItem.id,
          timestamp: Date.now(),
          name: nextItem.file.name,
          originalBlob: nextItem.file,
          processedBlob: blob,
        });
      } catch (error) {
        console.error("Error processing image:", error);
        setQueue((prev) =>
          prev.map((item) =>
            item.id === nextItem.id
              ? { ...item, status: "error", error: "Failed to process" }
              : item
          )
        );
        toast({
          title: "Error",
          description: `Failed to process ${nextItem.file.name}`,
          variant: "destructive",
        });
      }
    };

    if (!isProcessingQueue) {
      processNext();
    }
  }, [queue, isProcessingQueue, activeItemId, toast]);

  const handleImageSelect = (files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      processedUrl: null,
      status: "queued",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    // If no active item, set the first new one as active
    if (!activeItemId && newItems.length > 0) {
      setActiveItemId(newItems[0].id);
    }
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    if (activeItemId === id) {
      setActiveItemId(null);
    }
  };

  const handleDownload = (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (item?.processedUrl) {
      const link = document.createElement("a");
      link.href = item.processedUrl;
      link.download = `processed-${item.file.name}`; // Simple name, ImagePreview handles complex download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
    queue.forEach((item) => {
      if (item.status === "completed") {
        handleDownload(item.id);
      }
    });
  };

  const handleReset = () => {
    // Clear everything
    queue.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });
    setQueue([]);
    setActiveItemId(null);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    // Create a new queue item from the history item
    const newItem: QueueItem = {
      id: item.id,
      file: item.originalBlob as File, // Cast back to File (Blob is compatible enough for display)
      previewUrl: item.previewUrl || URL.createObjectURL(item.originalBlob),
      processedUrl:
        item.processedUrl || URL.createObjectURL(item.processedBlob),
      status: "completed",
    };

    setQueue((prev) => {
      // Check if already in queue to avoid duplicates
      if (prev.some((i) => i.id === newItem.id)) {
        return prev;
      }
      return [...prev, newItem];
    });
    setActiveItemId(newItem.id);
  };

  return (
    <div className="min-h-screen gradient-soft">
      <Header />
      <div className="fixed top-4 right-4 z-50">
        <HistorySidebar onSelect={handleHistorySelect} />
      </div>

      {/* Main Content */}
      <main className="container px-4 py-12 mx-auto space-y-12">
        {!activeItem ? (
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto space-y-4 text-center">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Remove Image Backgrounds
                <span className="block mt-2 text-primary">Instantly</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Professional-grade background removal powered by AI. Perfect for
                designers, marketers, and creators.
              </p>
            </div>

            <ImageUpload
              onImageSelect={handleImageSelect}
              isProcessing={isProcessingQueue}
            />

            <div className="text-sm text-center text-muted-foreground">
              <p>Free • Fast • No signup required</p>
            </div>
          </div>
        ) : (
          <ImagePreview
            originalImage={activeItem.previewUrl}
            processedImage={activeItem.processedUrl}
            isProcessing={
              activeItem.status === "processing" ||
              activeItem.status === "queued"
            }
            onDownload={() => handleDownload(activeItem.id)}
            onReset={handleReset}
          />
        )}

        {/* Batch Queue */}
        {queue.length > 0 && (
          <div className="border-t pt-8">
            <BatchQueue
              queue={queue}
              onRemove={handleRemoveItem}
              onDownload={handleDownload}
              onDownloadAll={handleDownloadAll}
              isProcessing={isProcessingQueue}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
