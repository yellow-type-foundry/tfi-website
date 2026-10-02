import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const setup = () => {
      lenis?.destroy();
      lenis = motion.matches ? undefined : new Lenis({
        autoRaf: true,
        lerp: 0.22,
        wheelMultiplier: 1,
        syncTouch: false,
        anchors: { offset: -97 },
      });
    };
    setup();
    motion.addEventListener("change", setup);
    return () => {
      motion.removeEventListener("change", setup);
      lenis?.destroy();
    };
  }, []);
  return null;
}
