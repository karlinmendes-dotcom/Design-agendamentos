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
                "border-border bg-card text-foreground hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300",
              isSelected &&
                "border-red-500 bg-red-gradient font-bold text-white shadow-[0_6px_20px_-6px_rgba(225,6,0,0.7)]",
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
