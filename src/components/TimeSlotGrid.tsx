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
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhum horário disponível para este dia. Escolha outra data.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
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
              "rounded-lg border px-2 py-2.5 text-sm font-semibold tabular-nums transition-all duration-200",
              isOccupied &&
                "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/40 line-through",
              !isOccupied &&
                !isSelected &&
                "border-border bg-card text-foreground hover:border-gold/60 hover:bg-gold/10 hover:text-gold-light",
              isSelected &&
                "border-gold bg-gold-gradient font-bold text-charcoal shadow-[0_4px_16px_-4px_rgba(201,162,39,0.6)]",
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
