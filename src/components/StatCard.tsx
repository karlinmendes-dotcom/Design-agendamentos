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
  gold: "border-gold/40 bg-gold/10 text-gold",
  bronze: "border-blood/30 bg-blood/10 text-blood",
  green: "border-green-600/30 bg-green-500/15 text-green-700",
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
          <p className="font-display mt-1 text-2xl font-bold text-card-foreground sm:text-[1.7rem]">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
