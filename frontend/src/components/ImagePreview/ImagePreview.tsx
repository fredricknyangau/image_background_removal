import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComparisonSlider } from "./ComparisonSlider";
import { BackgroundSelector, type BackgroundConfig } from "./BackgroundSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImagePreviewProps {
  originalImage: string;
  processedImage: string | null;
  isProcessing: boolean;
  onDownload: () => void; // Kept for backward compatibility if needed, but we'll use local logic
  onReset: () => void;
}

export const ImagePreview = ({
  originalImage,
  processedImage,
  isProcessing,
  onReset,
}: ImagePreviewProps) => {
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: "transparent",
    value: "",
  });
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg" | "webp">("png");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!processedImage) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.crossOrigin = "anonymous";
      img.src = processedImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (!ctx) throw new Error("Could not get canvas context");

      // Draw Background
      if (backgroundConfig.type === "color") {
        ctx.fillStyle = backgroundConfig.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backgroundConfig.type === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        // Simple parsing for linear-gradient to get colors. 
        // This is a basic implementation and might not cover all CSS gradient syntax perfectly.
        // For a robust solution, a library might be needed, but we'll try a simple regex for now.
        // Fallback to first color if parsing fails.
        try {
          const colors = backgroundConfig.value.match(/#[a-fA-F0-9]{6}|rgba?\([\d\s,.]+\)/g);
          if (colors && colors.length >= 2) {
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[colors.length - 1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } catch (e) {
          console.warn("Failed to parse gradient for canvas", e);
        }
      } else if (backgroundConfig.type === "image" && backgroundConfig.value) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = backgroundConfig.value;
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.onerror = resolve; // Continue even if bg fails
        });
        // Draw background image covering the canvas (aspect fill)
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight);
        const x = (canvas.width / 2) - (bgImg.naturalWidth / 2) * scale;
        const y = (canvas.height / 2) - (bgImg.naturalHeight / 2) * scale;
        ctx.drawImage(bgImg, x, y, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale);
      }

      // Draw Processed Image
      ctx.drawImage(img, 0, 0);

      // Trigger Download
      const mimeType = `image/${downloadFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      const link = document.createElement("a");
      link.download = `processed-image.${downloadFormat}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Results</h2>
        <Button variant="outline" onClick={onReset} disabled={isProcessing}>
          Upload New Image
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Preview Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            {isProcessing ? (
              <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                <div className="space-y-4 text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">Removing background...</p>
                </div>
              </div>
            ) : processedImage ? (
              <ComparisonSlider
                originalImage={originalImage}
                processedImage={processedImage}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Waiting for image...</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="space-y-6">
          {processedImage && !isProcessing && (
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6 animate-slide-in-right">
              <div>
                <h3 className="text-lg font-medium mb-4">Background</h3>
                <BackgroundSelector
                  currentConfig={backgroundConfig}
                  onChange={setBackgroundConfig}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Download</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Format</label>
                    <Select
                      value={downloadFormat}
                      onValueChange={(v: any) => setDownloadFormat(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Transparent)</SelectItem>
                        <SelectItem value="jpg">JPG (Smallest size)</SelectItem>
                        <SelectItem value="webp">WebP (Best quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="w-full shadow-glow"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 mr-2" />
                    )}
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
