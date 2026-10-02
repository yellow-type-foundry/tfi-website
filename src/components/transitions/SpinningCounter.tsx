import { useEffect, useId, useRef } from "react";

const SPINS = 2;
const DIGITS = Array.from({ length: (SPINS + 1) * 10 }, (_, i) => i % 10);

/**
 * transitions.dev "Spinning counter": one clipped reel per digit spins SPINS full turns and
 * lands on its digit, staggered left to right, with a vertical-only SVG blur that decays as
 * each reel settles. Changing `spinKey` replays the spin; with `spin` false it just shows the value.
 */
export function SpinningCounter({ value, spinKey, spin = true }: { value: number; spinKey: number; spin?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const strips = useRef<(HTMLSpanElement | null)[]>([]);
  const blurs = useRef<(SVGFEGaussianBlurElement | null)[]>([]);
  const digits = String(value).split("").map(Number);

  const reel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Read the tokens where the reel sits, so a local --reel-cell override applies.
    const root = getComputedStyle(reel.current ?? document.documentElement);
    const ms = (name: string, fb: number) => parseFloat(root.getPropertyValue(name)) || fb;
    const cell = ms("--reel-cell", 30);
    const dur = ms("--reel-dur", 1400);
    const stagger = ms("--reel-stagger", 90);
    const blur = ms("--reel-spin-blur", 3);
    let raf = 0;

    strips.current.forEach((strip, col) => {
      if (!strip) return;
      const target = `translateY(${-(SPINS * 10 + digits[col]) * cell}px)`;
      if (!spin) {
        strip.style.transition = "none";
        strip.style.transform = target;
        return;
      }
      strip.style.transition = "none";
      strip.style.transform = "translateY(0)";
      void strip.offsetHeight; // reflow so the spin starts from the top of the reel
      strip.style.transition = `transform var(--reel-dur) var(--reel-ease) ${col * stagger}ms`;
      strip.style.transform = target;
    });

    if (spin) {
      const start = performance.now();
      const tick = (now: number) => {
        let running = false;
        blurs.current.forEach((el, col) => {
          if (!el) return;
          const t = Math.min(Math.max((now - start - col * stagger) / dur, 0), 1);
          const amount = blur * (1 - t) ** 2;
          el.setAttribute("stdDeviation", `0 ${amount.toFixed(2)}`);
          if (t < 1) running = true;
        });
        if (running) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, value, spin]);

  return (
    <span ref={reel} className="t-reel" aria-label={String(value)} role="img">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        {digits.map((_, col) => (
          <filter key={col} id={`${uid}-blur-${col}`} x="0" y="-50%" width="100%" height="200%">
            <feGaussianBlur ref={(el) => { blurs.current[col] = el; }} stdDeviation="0 0" />
          </filter>
        ))}
      </svg>
      {digits.map((_, col) => (
        <span key={col} className="t-reel-col" aria-hidden>
          <span
            className="t-reel-strip"
            ref={(el) => { strips.current[col] = el; }}
            style={{ filter: `url(#${uid}-blur-${col})` }}
          >
            {DIGITS.map((d, i) => <span key={i} className="t-reel-digit">{d}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}
