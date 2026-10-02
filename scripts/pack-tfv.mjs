// Packs a TinyFish vector loop (.tfv) into the smaller, lossless TFZ1 container (see src/lib/tfz.ts),
// then unpacks it again and checks the result is byte-identical to the original.
//   node scripts/pack-tfv.mjs in.tfv out.tfz
import fs from "node:fs";
import zlib from "node:zlib";
import { TFZ_BITS, TFZ_VAL_BITS, tfzContext, tfzValContext, unpackTfz } from "../src/lib/tfz.ts";

const [input, output] = process.argv.slice(2);
if (!input || !output) { console.error("usage: node scripts/pack-tfv.mjs in.tfv out.tfz"); process.exit(1); }

let tfv = fs.readFileSync(input);
if (tfv[0] === 0x1f && tfv[1] === 0x8b) tfv = zlib.gunzipSync(tfv);
if (tfv.subarray(0, 4).toString() !== "TFV1") throw new Error("not a TFV1 file");
const headerLength = tfv.readUInt32LE(4);
const headerBytes = tfv.subarray(8, 8 + headerLength);
const header = JSON.parse(headerBytes.toString());
const body = tfv.subarray(8 + headerLength);
const sec = (s) => body.subarray(s[0], s[0] + s[1]);
const T = header.n;

const reader = (b) => ({ o: 0, v() { let x = 0, m = 1, c; do { c = b[this.o++]; x += (c & 127) * m; m *= 128; } while (c & 128); return x; } });
const varint = (a, x) => { while (x >= 128) { a.push((x & 127) | 128); x = Math.floor(x / 128); } a.push(x); };

/** LZMA-style binary range encoder (matches RangeDecoder in tfz.ts). */
class RangeEncoder {
  low = 0n; range = 0xffffffff; cache = 0; cacheSize = 1; out = [];
  shiftLow() {
    if (this.low < 0xff000000n || this.low > 0xffffffffn) {
      const carry = Number(this.low >> 32n);
      let t = this.cache;
      do { this.out.push((t + carry) & 255); t = 255; } while (--this.cacheSize);
      this.cache = Number((this.low >> 24n) & 255n);
    }
    this.cacheSize++;
    this.low = (this.low & 0x00ffffffn) << 8n;
  }
  bit(p, i, b) {
    const pr = p[i], bound = (this.range >>> 11) * pr;
    if (!b) { this.range = bound; p[i] = pr + ((2048 - pr) >> 5); }
    else { this.low += BigInt(bound); this.range -= bound; p[i] = pr - (pr >> 5); }
    while (this.range < 0x1000000) { this.range = (this.range << 8) >>> 0; this.shiftLow(); }
  }
  finish() { for (let i = 0; i < 5; i++) this.shiftLow(); return Buffer.from(this.out); }
}

const meta = { headerLength, bodyLength: body.length, frames: T, layers: [] };
const extra = [];
const rcStreams = [];

header.layers.forEach((L, index) => {
  if (L.k !== "c" || L.wide || !L.vals[1]) return; // only plain colour-grid layers with changes
  const cells = L.cols * L.rows, pal = L.pal.length;
  const events = Array.from({ length: cells }, () => []);
  const counts = reader(sec(L.counts)), skips = reader(sec(L.skips)), vals = sec(L.vals);
  let vi = 0;
  for (let y = 1; y < T; y++) {
    let s = -1;
    for (let k = counts.v(); k > 0; k--) { s += skips.v() + 1; events[s].push([y, vals[vi++]]); }
  }
  // Flips must come in pairs (a step v, then pal - v back) and fit TFZ_BITS; otherwise leave the layer as is.
  const ok = events.every((e) => e.every(([y, v], i) =>
    v > 0 && v < 1 << TFZ_VAL_BITS && (i & 1 ? v === pal - e[i - 1][1] : true) && y - (i ? e[i - 1][0] : 0) < 1 << TFZ_BITS));
  if (!ok) { console.warn(`layer ${index}: not a two-colour flip grid, left uncoded`); return; }

  const gaps = [];
  const rc = new RangeEncoder(), probs = new Map();
  const symbol = (ctx, bits, x) => {
    let p = probs.get(ctx);
    if (!p) { p = new Uint16Array(1 << bits).fill(1024); probs.set(ctx, p); }
    for (let b = bits - 1, m = 1; b >= 0; b--) { const bit = (x >> b) & 1; rc.bit(p, m, bit); m = (m << 1) | bit; }
  };
  let last = -1, active = 0;
  for (let c = 0; c < cells; c++) {
    const e = events[c];
    if (!e.length) continue;
    active++;
    varint(gaps, c - last - 1); last = c;
    let t = 0, prev = 0, prev2 = -1, step = 0;
    for (let i = 0; i <= e.length; i++) {
      const d = i < e.length ? e[i][0] - t : 0;
      symbol(tfzContext(i, prev, prev2, t, T), TFZ_BITS, d);
      if (i === e.length) break;
      if (!(i & 1)) { symbol(tfzValContext(step), TFZ_VAL_BITS, e[i][1]); step = e[i][1]; }
      prev2 = prev; prev = d; t = e[i][0];
    }
  }
  const stream = rc.finish();
  rcStreams.push(stream);
  extra.push(Buffer.from(gaps));
  meta.layers.push({ index, cells, pal, counts: L.counts, skips: L.skips, vals: L.vals, active, gapsLength: gaps.length, rcLength: stream.length });
});

// Body minus the coded sections, in order.
const cuts = meta.layers.flatMap((l) => [l.counts, l.skips, l.vals]).filter((s) => s[1] > 0).sort((a, b) => a[0] - b[0]);
const rest = [];
let at = 0;
for (const [o, n] of cuts) { rest.push(body.subarray(at, o)); at = o + n; }
rest.push(body.subarray(at));

const metaBytes = Buffer.from(JSON.stringify(meta));
const metaLength = Buffer.alloc(4); metaLength.writeUInt32LE(metaBytes.length);
const gz = zlib.gzipSync(Buffer.concat([metaLength, metaBytes, headerBytes, ...rest, ...extra]), { level: 9 });
const head = Buffer.alloc(8); head.write("TFZ1"); head.writeUInt32LE(gz.length, 4);
const packed = Buffer.concat([head, gz, ...rcStreams]);

const back = Buffer.from(await unpackTfz(new Uint8Array(packed)));
if (!back.equals(tfv)) throw new Error("round trip failed: unpacked bytes differ from the original");

fs.writeFileSync(output, packed);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`${output}: ${kb(packed.length)} (gzipped .tfv ${kb(zlib.gzipSync(tfv, { level: 9 }).length)}), round trip OK`);
