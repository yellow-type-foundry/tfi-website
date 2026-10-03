import { useEffect, useRef, type CSSProperties } from "react";
import "../vendor/tinyfish-vector-player.js";
import { isTfz, unpackTfz } from "../lib/tfz";

type VectorLoopProps = {
  src: string;
  /** The loop's canvas size from its export (e.g. 3072×1875); sets the aspect ratio. */
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  /** Replace colours in the loop's palettes at load time (the .tfv file itself is untouched). */
  recolor?: Record<string, string>;
  /** Skip exported fallback frames where this layer is visible. */
  excludeFramesWithLayer?: number;
  noShadows?: boolean;
  pixelRatio?: number;
  renderFps?: number;
  noEffects?: boolean;
  hoverGridScale?: number;
  /** When false the loop still loads (and stays drawn) but is paused, e.g. a showcase tab that isn't selected. */
  active?: boolean;
};

/** Rewrites palette colours in a TFV1 file's JSON header and returns new (uncompressed) bytes. */
function recolorTfv(bytes: Uint8Array, map: Record<string, string>) {
  const n = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
  let header = new TextDecoder().decode(bytes.subarray(8, 8 + n));
  for (const [from, to] of Object.entries(map)) header = header.split(`"${from}"`).join(`"${to}"`);
  const head = new TextEncoder().encode(header);
  const out = new Uint8Array(8 + head.length + bytes.length - 8 - n);
  out.set(bytes.subarray(0, 4));
  new DataView(out.buffer).setUint32(4, head.length, true);
  out.set(head, 8);
  out.set(bytes.subarray(8 + n), 8 + head.length);
  return out;
}

/**
 * TinyFish vector shader loop (.tfv, or a .tfz packed by scripts/pack-tfv.mjs) drawn live on a canvas at the screen's real resolution.
 * The player pauses off screen, shows the first frame for reduced motion, and handles any
 * hover-reveal layers in the file (pointer brush; touch follows a held finger).
 */
export function VectorLoop({ src, width, height, className, style, recolor, excludeFramesWithLayer, noShadows, pixelRatio, renderFps, noEffects, hoverGridScale, active = true }: VectorLoopProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const syncRef = useRef<() => void>(() => {});
  useEffect(() => { activeRef.current = active; syncRef.current(); }, [active]);
  const recolorKey = JSON.stringify(recolor ?? {});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let player: TFVectorPlayer | undefined;
    let cancelled = false;
    let started = false;
    let visible = false;
    const start = () => {
      if (started) return;
      started = true;
      fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => new Uint8Array(buf))
      .then((bytes) => (isTfz(bytes) ? unpackTfz(bytes) : window.TFVector.inflate(bytes)))
      .then((bytes) => (recolor ? recolorTfv(bytes, recolor) : bytes))
      .then((bytes) => (cancelled ? undefined : window.TFVector.play(canvas, bytes)))
      .then((p) => { player = p; canvas.dataset.ready = ""; if (cancelled || !visible || !activeRef.current) p?.pause(); })
      .catch((e) => console.error(e));
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      if (visible) start();
      syncRef.current();
    }, { threshold: [0, 0.1] });
    syncRef.current = () => { if (visible && activeRef.current) player?.play(); else player?.pause(); };
    observer.observe(canvas.closest(".ps-card, .hero__card, .final-cta__card, .idemo-stage") ?? canvas);
    return () => { cancelled = true; observer.disconnect(); player?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, recolorKey, excludeFramesWithLayer, noShadows, pixelRatio, renderFps, noEffects, hoverGridScale]);

  return <canvas ref={ref} className={className} style={style} width={width} height={height} data-tfv-exclude-layer={excludeFramesWithLayer} data-tfv-no-shadows={noShadows ? "" : undefined} data-tfv-dpr={pixelRatio} data-tfv-render-fps={renderFps} data-tfv-no-effects={noEffects ? "" : undefined} data-tfv-hover-grid-scale={hoverGridScale} aria-hidden />;
}
