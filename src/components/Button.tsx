import type { ReactNode } from "react";
import "./Button.css";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  /** Figma Button "Color" + "Type": filled black / accent / neutral, or outlined black */
  variant?: "black" | "accent" | "neutral" | "outline" | "secondary";
  size?: "xs" | "s" | "l";
  className?: string;
};

export function Button({ children, href = "#", variant = "black", size = "s", className = "" }: ButtonProps) {
  return (
    <a href={href} className={`btn btn--${variant} btn--${size} ${className}`.trim()}>
      <span className="btn__label">{children}</span>
    </a>
  );
}
