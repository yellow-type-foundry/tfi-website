/**
 * TFZ1: a lossless, smaller container for TinyFish vector loops (.tfv), made by scripts/pack-tfv.mjs.
 *
 * In a TFV1 file, each frame lists the grid cells that change palette colour, and every cell flips
 * back and forth between two colours. TFZ1 stores each cell's flip times instead, range-coded
 * against the previous flip intervals. It's roughly half the size of the gzipped .tfv. unpackTfz()
 * rebuilds the original TFV1 bytes exactly, so the vendored player stays unmodified.
 *
 * Layout: "TFZ1" | u32 gzLength | gzip(u32 metaLength, meta JSON, TFV1 header, body with the coded
 * sections cut out, then per coded layer: active-cell gaps as varints) | range-coded flip times and
 * colour steps, one stream per coded layer.
 */

export type TfzMeta = {
  headerLength: number;
  bodyLength: number;
  frames: number;
  layers: {
    index: number;
    cells: number;
    pal: number;
    counts: [number, number];
    skips: [number, number];
    vals: [number, number];
    active: number;
    gapsLength: number;
    rcLength: number;
  }[];
};

export const TFZ_BITS = 9; // flip intervals are < 512 frames (0 = no more flips for this cell)
export const TFZ_VAL_BITS = 8; // colour steps are < 256

/** Context for the colour step that starts a flip pair, from the previous pair's step. */
export const tfzValContext = (prevStep: number) => -1 - prevStep;

/** Context for a cell's next flip interval: which flip it is, the last two intervals, and whether the loop end is near. */
export function tfzContext(flip: number, prev: number, prev2: number, time: number, frames: number) {
  const phase = flip === 0 ? 0 : 1 + (flip & 1);
  const p2 = prev2 < 0 ? 0 : prev2 <= 4 ? 1 : prev2 <= 12 ? 2 : 3;
  const left = frames - 1 - time;
  const end = left < prev ? 0 : left < 2 * prev ? 1 : 2;
  return ((phase * 512 + Math.min(prev, 511)) * 4 + p2) * 3 + end;
}

export const isTfz = (b: Uint8Array) => b[0] === 0x54 && b[1] === 0x46 && b[2] === 0x5a && b[3] === 0x31; // "TFZ1"

const u32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

function writeVarint(out: Uint8Array, o: number, x: number) {
  while (x >= 128) { out[o++] = (x & 127) | 128; x = Math.floor(x / 128); }
  out[o++] = x;
  return o;
}

class RangeDecoder {
  private range = 0xffffffff;
  private code = 0;
  private b: Uint8Array;
  private o: number;
  constructor(b: Uint8Array, o: number) {
    this.b = b;
    this.o = o;
    for (let i = 0; i < 5; i++) this.code = ((this.code << 8) | this.b[this.o++]) >>> 0;
  }
  bit(p: Uint16Array, i: number) {
    const pr = p[i];
    const bound = (this.range >>> 11) * pr;
    let b: number;
    if (this.code < bound) { this.range = bound; p[i] = pr + ((2048 - pr) >> 5); b = 0; }
    else { this.code -= bound; this.range -= bound; p[i] = pr - (pr >> 5); b = 1; }
    while (this.range < 0x1000000) {
      this.range = (this.range << 8) >>> 0;
      this.code = ((this.code << 8) | this.b[this.o++]) >>> 0;
    }
    return b;
  }
}

async function gunzip(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Rebuilds the original TFV1 bytes from a TFZ1 file. */
export async function unpackTfz(file: Uint8Array): Promise<Uint8Array> {
  const gzLength = u32(file, 4);
  const z = await gunzip(file.subarray(8, 8 + gzLength));
  let rcAt = 8 + gzLength;
  const metaLength = u32(z, 0);
  const meta: TfzMeta = JSON.parse(new TextDecoder().decode(z.subarray(4, 4 + metaLength)));
  let zo = 4 + metaLength;

  const out = new Uint8Array(8 + meta.headerLength + meta.bodyLength);
  out.set([0x54, 0x46, 0x56, 0x31]); // "TFV1"
  new DataView(out.buffer).setUint32(4, meta.headerLength, true);
  out.set(z.subarray(zo, zo + meta.headerLength), 8);
  zo += meta.headerLength;
  const body = out.subarray(8 + meta.headerLength);

  // Copy the untouched body around the coded sections.
  const cuts = meta.layers.flatMap((l) => [l.counts, l.skips, l.vals]).filter((s) => s[1] > 0).sort((a, b) => a[0] - b[0]);
  let at = 0;
  for (const [o, n] of cuts) { body.set(z.subarray(zo, zo + o - at), at); zo += o - at; at = o + n; }
  body.set(z.subarray(zo, zo + meta.bodyLength - at), at);
  zo += meta.bodyLength - at;

  const T = meta.frames;
  for (const L of meta.layers) {
    // Active cells (as gaps).
    const cellOf = new Uint32Array(L.active);
    let c = -1;
    for (let k = 0; k < L.active; k++) {
      let x = 0, m = 1, byte: number;
      do { byte = z[zo++]; x += (byte & 127) * m; m *= 128; } while (byte & 128);
      c += x + 1;
      cellOf[k] = c;
    }

    // Flip times, cell by cell. Flips come in pairs: a colour step v, then pal - v back.
    const rc = new RangeDecoder(file, rcAt);
    rcAt += L.rcLength;
    const probs = new Map<number, Uint16Array>();
    const symbol = (ctx: number, bits: number) => {
      let p = probs.get(ctx);
      if (!p) { p = new Uint16Array(1 << bits).fill(1024); probs.set(ctx, p); }
      let m = 1;
      for (let b = 0; b < bits; b++) m = (m << 1) | rc.bit(p, m);
      return m - (1 << bits);
    };
    const flipsPerFrame = new Uint32Array(T);
    const eventCell: number[] = [];
    const eventFrame: number[] = [];
    const eventVal: number[] = [];
    for (let k = 0; k < L.active; k++) {
      let t = 0, prev = 0, prev2 = -1, step = 0;
      for (let i = 0; ; i++) {
        const d = symbol(tfzContext(i, prev, prev2, t, T), TFZ_BITS);
        if (d === 0) break;
        if (!(i & 1)) step = symbol(tfzValContext(step), TFZ_VAL_BITS);
        prev2 = prev; prev = d; t += d;
        eventCell.push(cellOf[k]);
        eventFrame.push(t);
        eventVal.push(i & 1 ? L.pal - step : step);
        flipsPerFrame[t]++;
      }
    }

    // Bucket by frame (cells are already ascending), then write counts / skips / vals.
    const start = new Uint32Array(T + 1);
    for (let y = 0; y < T; y++) start[y + 1] = start[y] + flipsPerFrame[y];
    const fill = start.slice(0, T);
    const order = new Uint32Array(eventCell.length);
    for (let e = 0; e < eventCell.length; e++) order[fill[eventFrame[e]]++] = e;

    let co = L.counts[0], so = L.skips[0], vo = L.vals[0];
    for (let y = 1; y < T; y++) {
      co = writeVarint(body, co, flipsPerFrame[y]);
      let s = -1;
      for (let j = start[y]; j < start[y + 1]; j++) {
        const e = order[j];
        so = writeVarint(body, so, eventCell[e] - s - 1);
        s = eventCell[e];
        body[vo++] = eventVal[e];
      }
    }
    if (co !== L.counts[0] + L.counts[1] || so !== L.skips[0] + L.skips[1] || vo !== L.vals[0] + L.vals[1]) {
      throw new Error("TFZ: rebuilt layer sizes don't match");
    }
  }
  return out;
}
