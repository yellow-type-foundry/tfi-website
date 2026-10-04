import type { ReactNode } from "react";
import "./ListItem.css";

/* Figma: List Item (Size S / M / L, optional Background). Leading content first, trailing content pushed to the end. */
export function ListItem({ as: Tag = "div", size = "s", background, className, children }: {
  as?: "div" | "li"; size?: "s" | "m" | "l"; background?: boolean; className?: string; children: ReactNode;
}) {
  const cls = ["list-item", `list-item--${size}`, background && "list-item--bg", className];
  return <Tag className={cls.filter(Boolean).join(" ")}>{children}</Tag>;
}
