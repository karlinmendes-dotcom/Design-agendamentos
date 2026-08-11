import { AlertTriangle, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative">
        <div className="size-12 animate-spin rounded-full border-2 border-border border-t-green-700" />
        <Gem className="absolute inset-0 m-auto size-5 animate-pulse text-gold" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
