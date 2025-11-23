import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Ban, Palette, Image as ImageIcon } from "lucide-react";

export type BackgroundType = "transparent" | "color" | "gradient" | "image";

export interface BackgroundConfig {
    type: BackgroundType;
    value: string;
}

interface BackgroundSelectorProps {
    onChange: (config: BackgroundConfig) => void;
    currentConfig: BackgroundConfig;
}

const SOLID_COLORS = [
    "#ffffff", // White
    "#000000", // Black
    "#f3f4f6", // Gray 100
    "#ef4444", // Red 500
    "#f97316", // Orange 500
    "#eab308", // Yellow 500
    "#22c55e", // Green 500
    "#3b82f6", // Blue 500
    "#a855f7", // Purple 500
    "#ec4899", // Pink 500
];

const GRADIENTS = [
    "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
    "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
    "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
    "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)",
];

export const BackgroundSelector = ({
    onChange,
    currentConfig,
}: BackgroundSelectorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<BackgroundType>("transparent");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange({ type: "image", value: url });
            setActiveTab("image");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2">
                <Button
                    variant={activeTab === "transparent" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                        setActiveTab("transparent");
                        onChange({ type: "transparent", value: "" });
                    }}
                >
                    <Ban className="w-4 h-4 mr-2" />
                    Transparent
                </Button>
                <Button
                    variant={activeTab === "color" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("color")}
                >
                    <Palette className="w-4 h-4 mr-2" />
                    Color
                </Button>
                <Button
                    variant={activeTab === "image" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("image")}
                >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image
                </Button>
            </div>

            <div className="min-h-[100px]">
                {activeTab === "transparent" && (
                    <p className="text-sm text-muted-foreground">
                        The background will be transparent (PNG).
                    </p>
                )}

                {activeTab === "color" && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Solid Colors</p>
                            <div className="flex flex-wrap gap-2">
                                {SOLID_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentConfig.type === "color" && currentConfig.value === color
                                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                                : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => onChange({ type: "color", value: color })}
                                    />
                                ))}
                                <input
                                    type="color"
                                    className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                                    onChange={(e) => onChange({ type: "color", value: e.target.value })}
                                    title="Custom Color"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Gradients</p>
                            <div className="flex flex-wrap gap-2">
                                {GRADIENTS.map((gradient) => (
                                    <button
                                        key={gradient}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentConfig.type === "gradient" && currentConfig.value === gradient
                                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                                : "border-transparent"
                                            }`}
                                        style={{ background: gradient }}
                                        onClick={() => onChange({ type: "gradient", value: gradient })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "image" && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Click to upload background image
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                        {currentConfig.type === "image" && currentConfig.value && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                                <img src={currentConfig.value} alt="Background Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
