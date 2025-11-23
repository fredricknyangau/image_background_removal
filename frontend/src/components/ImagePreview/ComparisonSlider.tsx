import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface ComparisonSliderProps {
    originalImage: string;
    processedImage: string;
    isProcessing: boolean;
}

export const ComparisonSlider = ({
    originalImage,
    processedImage,
    isProcessing,
}: ComparisonSliderProps) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback(
        (clientX: number) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        },
        []
    );

    const onMouseDown = () => (isDragging.current = true);
    const onMouseUp = () => (isDragging.current = false);
    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) handleMove(e.clientX);
    };

    const onTouchStart = () => (isDragging.current = true);
    const onTouchEnd = () => (isDragging.current = false);
    const onTouchMove = (e: React.TouchEvent) => {
        if (isDragging.current) handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => (isDragging.current = false);
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }, []);

    if (!processedImage || isProcessing) return null;

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden select-none rounded-xl aspect-[4/3] cursor-ew-resize group"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
        >
            {/* Background (Processed - Transparent) */}
            <div className="absolute inset-0 w-full h-full">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
              `,
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    }}
                />
                <img
                    src={processedImage}
                    alt="Processed"
                    className="object-contain w-full h-full pointer-events-none"
                />
            </div>

            {/* Foreground (Original) - Clipped */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={originalImage}
                    alt="Original"
                    className="object-contain w-full h-full pointer-events-none"
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary">
                    <ChevronsLeftRight className="w-5 h-5" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">
                Original
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">
                Removed
            </div>
        </div>
    );
};
