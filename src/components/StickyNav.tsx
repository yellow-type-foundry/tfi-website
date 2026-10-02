import { useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import "./StickyNav.css";

/**
 * Floating top bar (Figma "TopBar" 2283:18264) that slides in once the hero has scrolled out of
 * view and tucks away again when the hero comes back. The hero keeps its own in-card nav.
 */
export function StickyNav({ after = ".hero" }: { after?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(after);
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, [after]);
  return (
    <div className={`sticky-nav${shown ? " is-shown" : ""}`} inert={!shown}>
      <TopBar className="sticky-nav__bar" label="Primary (floating)" />
    </div>
  );
}
