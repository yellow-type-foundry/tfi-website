import { useEffect, useRef } from "react";
import "../vendor/tinyfish-vector-player.js";

type VectorLoopProps = {
  src: string;
  /** The loop's canvas size from its export (e.g. 3072×1875); sets the aspect ratio. */
  width: number;
  height: number;
  className?: string;
  /** Replace colours in the loop's palettes at load time (the .tfv file itself is untouched). */
  recolor?: Record<string, string>;
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
 * TinyFish vector shader loop (.tfv) drawn live on a canvas at the screen's real resolution.
 * The player pauses off screen, shows the first frame for reduced motion, and handles any
 * hover-reveal layers in the file (pointer brush; touch follows a held finger).
 */
export function VectorLoop({ src, width, height, className, recolor }: VectorLoopProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const recolorKey = JSON.stringify(recolor ?? {});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let player: TFVectorPlayer | undefined;
    let cancelled = false;
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => window.TFVector.inflate(new Uint8Array(buf)))
      .then((bytes) => (recolor ? recolorTfv(bytes, recolor) : bytes))
      .then((bytes) => (cancelled ? undefined : window.TFVector.play(canvas, bytes)))
      .then((p) => { player = p; if (cancelled) p?.pause(); })
      .catch((e) => console.error(e));
    return () => { cancelled = true; player?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, recolorKey]);

  return <canvas ref={ref} className={className} width={width} height={height} aria-hidden />;
}
