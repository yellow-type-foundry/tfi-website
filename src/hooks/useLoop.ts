import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True while the element is at least partly on screen. */
export function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/**
 * Drives a forward-then-backward demo timeline. `events` are times (ms) within one loop of `duration`;
 * `phase` is how many have fired this loop (0 at loop start). `cycle` increments after each forward/backward round trip.
 * When not playing (off screen, or reduced motion) `playing` is false and callers render
 * their designed, static state.
 */
export function useLoop(active: boolean, duration: number, events: number[]) {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const playing = active && !prefersReducedMotion();
  const eventsKey = events.join(",");

  useEffect(() => {
    if (!playing) return;
    setPhase(0);
    const timers = events.map((t, i) => window.setTimeout(() => setPhase(i + 1), t));
    events.forEach((t, i) => {
      timers.push(window.setTimeout(() => setPhase(i), 2 * duration - t));
    });
    timers.push(window.setTimeout(() => setCycle((c) => c + 1), 2 * duration));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, cycle, duration, eventsKey]);

  return { playing, phase, cycle };
}
