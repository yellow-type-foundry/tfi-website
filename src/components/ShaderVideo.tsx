import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type ShaderVideoProps = {
  /** Path without extension; `${src}.av1.mp4` and `${src}.vp9.webm` must both exist. */
  src: string;
  /** Still frame shown before playback and for reduced motion. */
  poster: string;
  /** Also offer `${src}.h264.mp4` as the last, most compatible fallback. */
  h264?: boolean;
  className?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
};

/**
 * Muted, ping-pong TinyFish shader background (AV1 with a VP9 fallback, per the export's embed
 * snippet). Plays only while on screen and stays on the poster frame for reduced motion.
 */
export function ShaderVideo({ src, poster, h264, className, width, height, style }: ShaderVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let previous = 0;
    let direction = 1;
    let position = 0;
    let visible = false;
    const tick = (now: number) => {
      if (previous && Number.isFinite(el.duration) && el.duration > 0) {
        position += direction * (now - previous) / 1000;
        if (position >= el.duration) { position = el.duration; direction = -1; }
        if (position <= 0) { position = 0; direction = 1; }
        if (!el.seeking) el.currentTime = position;
      }
      previous = now;
      if (visible) frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible) frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return (
    <video ref={ref} className={`shader-video ${className ?? ""}`.trim()} poster={poster} width={width} height={height} style={style} muted playsInline preload="auto" aria-hidden>
      <source src={`${src}.av1.mp4`} type='video/mp4; codecs="av01.0.04M.08"' />
      <source src={`${src}.vp9.webm`} type='video/webm; codecs="vp09.00.10.08"' />
      {h264 && <source src={`${src}.h264.mp4`} type='video/mp4; codecs="avc1.640020"' />}
    </video>
  );
}
