import type { ReactNode } from "react";
import "./Badge.css";

/* Figma: Badge/Text (Shape × Fill × Size) and Badge/Number (Style × Size). Static labels, never interactive. */
export type BadgeFill = "outline" | "neutral" | "orange" | "green" | "orange-outline";

export function Badge({ fill = "outline", size = "s", shape = "rounded", className, children }: {
  fill?: BadgeFill; size?: "s" | "l"; shape?: "rounded" | "pill"; className?: string; children: ReactNode;
}) {
  const cls = ["badge", `badge--${fill}`, `badge--${size}`, shape === "pill" && "badge--pill", size === "s" ? "t-label-xs" : "t-label-s", className];
  return <span className={cls.filter(Boolean).join(" ")}>{children}</span>;
}

export function NumberBadge({ variant = "filled", size = "s", className, children }: {
  variant?: "filled" | "outline" | "neutral"; size?: "s" | "l"; className?: string; children: ReactNode;
}) {
  const cls = ["number-badge", `number-badge--${variant}`, `number-badge--${size}`, size === "s" ? "t-label-m" : "t-label-l", className];
  return <span className={cls.filter(Boolean).join(" ")}>{children}</span>;
}
