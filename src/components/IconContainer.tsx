import type { ReactNode } from "react";
import "./IconContainer.css";

/* Figma: Icon Container (Size × Shape × Style × Tone). Holds one glyph; the caller sizes the glyph.
   depth adds the matching depth-* surface (Filled only). */
export type IconContainerSize = 16 | 20 | 24 | 32 | 40 | 48 | 64;

export function IconContainer({ size, shape = "circle", variant = "filled", tone = "neutral", depth, className, children }: {
  size: IconContainerSize; shape?: "rounded" | "circle"; variant?: "filled" | "ghost"; tone?: "neutral" | "orange";
  depth?: "subtle" | "default" | "strong"; className?: string; children: ReactNode;
}) {
  const cls = ["icon-container", `icon-container--${size}`, `icon-container--${shape}`, `icon-container--${variant}`, `icon-container--${tone}`, depth && `depth-${depth}`, className];
  return <span className={cls.filter(Boolean).join(" ")} aria-hidden>{children}</span>;
}
