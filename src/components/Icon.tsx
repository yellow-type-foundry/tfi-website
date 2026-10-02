import type { ReactElement } from "react";

/** Inline stand-ins for the SF Symbols used in the Figma file (fish.fill, globe, magnifyingglass, ...). */
type IconName = "fish" | "globe" | "search" | "chevron-down" | "plus" | "arrow-right" | "check";

const paths: Record<IconName, ReactElement> = {
  fish: (
    <path
      fillRule="evenodd"
      d="M1 6.5 4.6 12 1 17.5c1.9.2 3.6-.6 4.8-2 2.1 2.4 5 3.9 8.2 3.9 4.4 0 7.6-3.4 9-7.4-1.4-4-4.6-7.4-9-7.4-3.2 0-6.1 1.5-8.2 3.9-1.2-1.4-2.9-2.2-4.8-2Zm17.2 4.3a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
    />
  ),
  globe: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </g>
  ),
  search: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </g>
  ),
  "chevron-down": <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />,
  plus: <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M12 5v14M5 12h14" />,
  "arrow-right": <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />,
};

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {paths[name]}
    </svg>
  );
}
