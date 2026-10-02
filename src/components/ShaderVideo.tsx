import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type ShaderVideoProps = {
  /** Path without extension; `${src}.av1.mp4` and `${src}.vp9.webm` must both exist. */
  src: string;
  /** Still frame shown before playback and for reduced motion. */
  poster: string;
  className?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
};

/**
 * Muted, looping TinyFish shader background (AV1 with a VP9 fallback, per the export's embed
 * snippet). Plays only while on screen and stays on the poster frame for reduced motion.
 */
export function ShaderVideo({ src, poster, className, width, height, style }: ShaderVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} className={`shader-video ${className ?? ""}`.trim()} poster={poster} width={width} height={height} style={style} muted loop playsInline preload="metadata" aria-hidden>
      <source src={`${src}.av1.mp4`} type='video/mp4; codecs="av01.0.04M.08"' />
      <source src={`${src}.vp9.webm`} type='video/webm; codecs="vp09.00.10.08"' />
    </video>
  );
}
