import { Wand2 } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-glow">
            <Wand2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
            Background Remover
          </h1>
        </div>
      </div>
    </header>
  );
};
