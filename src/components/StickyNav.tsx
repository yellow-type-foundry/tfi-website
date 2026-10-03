import { useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import "./StickyNav.css";

/**
 * Floating top bar that slides in after the hero's black nav scrolls out of view.
 * The hero keeps its own black in-card nav.
 */
export function StickyNav({ after = ".hero .topbar" }: { after?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const section = document.querySelector(after);
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => setShown(entry.boundingClientRect.bottom <= 0));
    io.observe(section);
    return () => io.disconnect();
  }, [after]);
  return (
    <div className={`sticky-nav${shown ? " is-shown" : ""}`} inert={!shown}>
      <TopBar className="sticky-nav__bar" label="Primary (floating)" />
    </div>
  );
}
