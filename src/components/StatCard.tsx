import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: "gold" | "bronze" | "green";
}

const ACCENTS = {
  gold: "border-gold/30 bg-gold/10 text-gold",
  bronze: "border-bronze/40 bg-bronze/15 text-[#e0a06e]",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function StatCard({ icon: Icon, label, value, sub, accent = "gold" }: StatCardProps) {
  return (
    <Card className="gold-ring-hover border-border/80">
      <CardContent className="flex items-start gap-4 pt-6">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg border",
            ACCENTS[accent],
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-cream sm:text-[1.7rem]">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
