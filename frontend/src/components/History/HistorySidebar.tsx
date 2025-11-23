import { useEffect, useState } from "react";
import { History, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { historyService, HistoryItem } from "@/services/historyService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface HistorySidebarProps {
    onSelect: (item: HistoryItem) => void;
}

export const HistorySidebar = ({ onSelect }: HistorySidebarProps) => {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const loadHistory = async () => {
        const history = await historyService.getAll();
        // Create object URLs for display
        const historyWithUrls = history.map(item => ({
            ...item,
            processedUrl: URL.createObjectURL(item.processedBlob)
        }));
        setItems(historyWithUrls);
    };

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        } else {
            // Cleanup URLs when closed to avoid leaks
            items.forEach(item => {
                if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
            });
        }
    }, [isOpen]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await historyService.deleteItem(id);
        loadHistory();
    };

    const handleClear = async () => {
        await historyService.clear();
        loadHistory();
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title="History">
                    <History className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>History</SheetTitle>
                        {items.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive">
                                Clear All
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-8 h-full pb-12">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Clock className="w-8 h-8 mb-2 opacity-50" />
                            <p>No history yet</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => {
                                            onSelect(item);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted border shrink-0">
                                            <img
                                                src={item.processedUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => handleDelete(e, item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
