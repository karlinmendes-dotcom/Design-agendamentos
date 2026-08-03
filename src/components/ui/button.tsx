import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 cursor-pointer select-none relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-crimson text-white shadow-[0_4px_20px_-6px_rgba(225,6,0,0.6)] hover:bg-[#ff1a12] hover:shadow-[0_8px_28px_-8px_rgba(225,6,0,0.75)] hover:-translate-y-px",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent shadow-xs hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/70 hover:text-red-300",
        ghost: "hover:bg-red-500/10 hover:text-red-300",
        link: "text-red-400 underline-offset-4 hover:underline",
        gold: "bg-red-gradient text-white font-bold shadow-[0_4px_20px_-6px_rgba(225,6,0,0.65)] hover:shadow-[0_8px_30px_-8px_rgba(225,6,0,0.85)] hover:-translate-y-px",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-7 text-base has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** Cria o efeito ripple no ponto do clique. */
function criarRipple(e: React.PointerEvent<HTMLElement>, ref: React.RefObject<HTMLElement | null>) {
  const el = ref.current;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const span = document.createElement("span");
  span.className = "ripple-ink";
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  el.appendChild(span);
  window.setTimeout(() => span.remove(), 700);
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Mostra um spinner no lugar do conteúdo e desabilita. */
    loading?: boolean;
  }) {
  const ref = React.useRef<HTMLElement | null>(null);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref as never}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onPointerDown={(e: React.PointerEvent<HTMLElement>) => {
        criarRipple(e, ref);
        props.onPointerDown?.(e as never);
      }}
      disabled={loading || props.disabled}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
            {children}
          </span>
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
