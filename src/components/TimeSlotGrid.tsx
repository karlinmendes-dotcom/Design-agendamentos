import { cn } from "@/lib/utils";

interface TimeSlotGridProps {
  slots: string[];
  occupied: Set<string>;
  selected: string | null;
  onSelect: (slot: string) => void;
}

export function TimeSlotGrid({
  slots,
  occupied,
  selected,
  onSelect,
}: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhum horário disponível para este dia. Escolha outra data.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
      {slots.map((slot) => {
        const isOccupied = occupied.has(slot);
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            type="button"
            disabled={isOccupied}
            onClick={() => onSelect(slot)}
            className={cn(
              "relative rounded-xl border px-2 py-3 text-sm font-semibold tabular-nums transition-all duration-200 active:scale-[0.95]",
              isOccupied &&
                "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/40 line-through",
              !isOccupied &&
                !isSelected &&
                "border-border bg-card text-card-foreground hover:border-green-700/60 hover:bg-green-800/10 hover:text-green-800",
              isSelected &&
                "border-green-800 bg-gold-gradient font-bold text-cream shadow-[0_6px_20px_-8px_rgba(47,74,62,0.6)]",
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
