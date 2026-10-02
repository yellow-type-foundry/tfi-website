/*! TinyFish vector loop player v1. Plays .tfv loops on a <canvas>.
 * <canvas data-tfv="loop.tfv"></canvas> (URL) or data-tfv="#id" (base64 in
 * that element's text). TFVector.play(canvas, urlOrBytes) -> Promise<player>.
 * Redrawn at the page's real resolution: nothing is ever scaled. */
(function (g) {
  "use strict";
  var doc = g.document;

  function inflate(bytes) {
    if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return Promise.resolve(bytes);
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }

  function R(b, o) { this.b = b; this.o = o || 0; }
  R.prototype.v = function () {
    var r = 0, s = 1, c;
    do { c = this.b[this.o++]; r += (c & 127) * s; s *= 128; } while (c & 128);
    return r;
  };
  R.prototype.z = function () { var v = this.v(); return v % 2 ? -(v + 1) / 2 : v / 2; };

  function decode(bytes) {
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== "TFV1") throw new Error("Not a TFV1 file");
    var n = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
    var h = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + n)));
    var body = bytes.subarray(8 + n);
    h.sec = function (s) { return body.subarray(s[0], s[0] + s[1]); };
    var pr = new R(h.sec(h.paths)), pc = pr.v();
    h.pathBytes = [];
    for (var i = 0; i < pc; i++) { var len = pr.v(); h.pathBytes.push(body.subarray(h.paths[0] + pr.o, h.paths[0] + pr.o + len)); pr.o += len; }
    h.layers.forEach(function (L) {
      var r = new R(h.sec(L.states)), st = new Int32Array(h.n * 3);
      for (var f = 0; f < st.length; f++) st[f] = r.v();
      L.st = st;
    });
    return h;
  }

  // Path bytes -> { p: Path2D, rule }. Smooth loops become quadratic curves
  // through segment midpoints; canvas-corner points stay sharp.
  function buildPath(b, Q, W, H, sink) {
    var r = new R(b, 1), rule = b[0] ? "evenodd" : "nonzero", n = r.v(), p = sink || new Path2D(), x = 0, y = 0;
    function pt() { x += r.z(); y += r.z(); return [x / Q, y / Q]; }
    for (var i = 0; i < n; i++) {
      var op = b[r.o++], a, c, d;
      if (op === 0) { a = pt(); p.moveTo(a[0], a[1]); }
      else if (op === 1) { a = pt(); p.lineTo(a[0], a[1]); }
      else if (op === 2) { a = pt(); c = pt(); p.arcTo(a[0], a[1], c[0], c[1], r.v() / Q); }
      else if (op === 3) p.closePath();
      else if (op === 4) {
        var m = r.v(), pts = [];
        for (var k = 0; k < m; k++) pts.push(pt());
        smooth(p, pts, W, H);
      }
      else if (op === 5) { a = pt(); c = pt(); p.quadraticCurveTo(a[0], a[1], c[0], c[1]); }
      else if (op === 6) { a = pt(); c = pt(); d = pt(); p.bezierCurveTo(a[0], a[1], c[0], c[1], d[0], d[1]); }
      else if (op === 7) { a = pt(); p.rect(a[0], a[1], r.z() / Q, r.z() / Q); }
    }
    return { p: p, rule: rule };
  }

  function smooth(p, pts, W, H) {
    var m = pts.length;
    function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    function sharp(a) { return (a[0] <= 0 || a[0] >= W) && (a[1] <= 0 || a[1] >= H); }
    var s = mid(pts[m - 1], pts[0]);
    p.moveTo(s[0], s[1]);
    for (var i = 0; i < m; i++) {
      var c = pts[i], e = mid(c, pts[(i + 1) % m]);
      if (sharp(c)) { p.lineTo(c[0], c[1]); p.lineTo(e[0], e[1]); }
      else p.quadraticCurveTo(c[0], c[1], e[0], e[1]);
    }
    p.closePath();
  }

  function canvas2d(w, h) {
    var c = doc.createElement("canvas");
    c.width = w || 1; c.height = h || 1;
    return { c: c, x: c.getContext("2d") };
  }

  function rgba(hex) { // 0xAABBGGRR for little-endian ImageData
    var v = parseInt(hex.slice(1), 16);
    return (0xff000000 | ((v & 255) << 16) | (v & 0xff00) | ((v >> 16) & 255)) >>> 0;
  }

  function Cells(h, L) {
    var cnt = L.cols * L.rows, w = L.wide, P = L.pal.length;
    var full = h.sec(L.full), vals = h.sec(L.vals);
    var key = new Uint16Array(cnt);
    for (var i = 0; i < cnt; i++) key[i] = w ? full[i * 2] | (full[i * 2 + 1] << 8) : full[i];
    var cr = new R(h.sec(L.counts)), sr = new R(h.sec(L.skips));
    var counts = new Uint32Array(h.n), skipAt = new Uint32Array(h.n), valAt = new Uint32Array(h.n), vo = 0;
    for (var f = 1; f < h.n; f++) {
      counts[f] = cr.v(); skipAt[f] = sr.o; valAt[f] = vo; vo += counts[f];
      for (var k = 0; k < counts[f]; k++) sr.v();
    }
    var pal = new Uint32Array(L.pal.map(rgba));
    var ic = doc ? canvas2d(L.cols, L.rows) : null;
    var img = ic ? ic.x.createImageData(L.cols, L.rows) : { data: new Uint8ClampedArray(cnt * 4) };
    var px = new Uint32Array(img.data.buffer), cur = new Uint16Array(cnt), at = -1;
    this.ic = ic && ic.c;
    this.cur = cur;
    this.seek = function (target) {
      if (target === at) return;
      if (target < at || at < 0) {
        cur.set(key);
        for (var i = 0; i < cnt; i++) px[i] = pal[key[i]];
        at = 0;
      }
      while (at < target) {
        at++;
        var c = counts[at], pos = -1, rr = new R(sr.b, skipAt[at]), o = valAt[at];
        for (var k = 0; k < c; k++) {
          pos += rr.v() + 1;
          var d = w ? vals[(o + k) * 2] | (vals[(o + k) * 2 + 1] << 8) : vals[o + k];
          var nv = (cur[pos] + d) % P;
          cur[pos] = nv; px[pos] = pal[nv];
        }
      }
      if (ic) ic.x.putImageData(img, 0, 0);
    };
  }

  function play(canvas, src) {
    var load = typeof src === "string"
      ? fetch(src).then(function (r) { if (!r.ok) throw new Error("TFVector: " + r.status + " " + src); return r.arrayBuffer(); })
      : Promise.resolve(src);
    return load.then(function (b) { return inflate(b instanceof Uint8Array ? b : new Uint8Array(b)); })
      .then(function (bytes) {
        var h = decode(bytes);
        var base = h.base
          ? createImageBitmap(new Blob([h.sec(h.base.s)], { type: h.base.type }))
          : Promise.resolve(null);
        return base.then(function (img) { return start(canvas, h, img); });
      });
  }

  function start(canvas, h, base) {
    var ctx = canvas.getContext("2d"), paths = [], scratch = canvas2d(), styleKey = "", sb = null;
    var cells = h.layers.map(function (L) { return L.k === "c" ? new Cells(h, L) : null; });
    var tiles = [];
    // Dot / gap stencil for one cell, drawn at the on-screen cell size (a
    // big tile scaled down without mipmaps would alias).
    function tile(L, i, cpx) {
      var T = Math.max(2, Math.ceil(cpx)), t = tiles[i];
      if (t && t.T === T) return t;
      var c = canvas2d(T, T), s = 1 - L.gap;
      c.x.fillStyle = "#000";
      if (L.shape === "dots") { c.x.beginPath(); c.x.arc(T / 2, T / 2, 0.44 * s * T, 0, Math.PI * 2); c.x.fill(); }
      else c.x.fillRect(T * (1 - s) / 2, T * (1 - s) / 2, T * s, T * s);
      return (tiles[i] = { T: T, p: scratch.x.createPattern(c.c, "repeat") });
    }
    function path(id) {
      return paths[id] || (paths[id] = buildPath(h.pathBytes[id], h.q, h.w, h.h));
    }
    if (!canvas.style.aspectRatio && !canvas.getAttribute("height")) canvas.style.aspectRatio = h.w + " / " + h.h;

    function size() {
      var r = canvas.getBoundingClientRect(), d = Math.min(g.devicePixelRatio || 1, 3);
      var W = Math.max(1, Math.round((r.width || h.w) * d));
      var scale = Math.min(1, Math.sqrt(16e6 / (W * W * h.h / h.w)));
      W = Math.max(1, Math.round(W * scale));
      var H = Math.max(1, Math.round(W * h.h / h.w));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W; canvas.height = H;
        scratch.c.width = W; scratch.c.height = H;
        styleKey = ""; sb = null;
        return true;
      }
      return false;
    }

    function drawCells(L, i, C, W, H, sx, sy) {
      var dy = (h.h - L.rows * L.ch) * sy, dw = L.cols * L.cw * sx, dh = L.rows * L.ch * sy;
      if (!L.carve) { ctx.imageSmoothingEnabled = false; ctx.drawImage(C.ic, 0, dy, dw, dh); return; }
      var t = tile(L, i, L.cw * sx);
      ctx.fillStyle = L.pal[L.paper]; ctx.fillRect(0, 0, W, H);
      var s = scratch.x;
      s.globalCompositeOperation = "source-over"; s.clearRect(0, 0, W, H);
      s.imageSmoothingEnabled = false; s.drawImage(C.ic, 0, dy, dw, dh);
      s.globalCompositeOperation = "destination-in";
      t.p.setTransform(new DOMMatrix([L.cw * sx / t.T, 0, 0, L.ch * sy / t.T, 0, dy]));
      s.fillStyle = t.p; s.fillRect(0, 0, W, H);
      ctx.drawImage(scratch.c, 0, 0);
    }

    // Stroke / Drop Shadow / Inner Shadow, as mask-styles.ts draws them.
    function buildStyles(f, W, H, sx, sy) {
      var key = h.layers.map(function (L) { return L.st[f * 3 + 2]; }).join(",");
      if (key === styleKey) return sb;
      styleKey = key;
      if (!h.layers.some(function (L) { return L.st && L.st[f * 3 + 2] && L.stl; })) return (sb = null);
      var b = sb || [canvas2d(W, H), canvas2d(W, H), canvas2d(W, H)], m = canvas2d(W, H), e = canvas2d(W, H), soft = canvas2d(W, H);
      b.forEach(function (o) { o.x.setTransform(1, 0, 0, 1, 0, 0); o.x.clearRect(0, 0, W, H); });
      var A = 135 * Math.PI / 180, sc = sx;
      h.layers.forEach(function (L) {
        var id = L.st[f * 3 + 2];
        if (!id) return;
        var P = path(id - 1).p;
        b.forEach(function (o) {
          o.x.save(); o.x.setTransform(sx, 0, 0, sy, 0, 0); o.x.globalCompositeOperation = "destination-out";
          o.x.fill(P, "nonzero"); o.x.restore();
        });
        var st = L.stl;
        if (!st) return;
        m.x.setTransform(1, 0, 0, 1, 0, 0); m.x.clearRect(0, 0, W, H);
        m.x.setTransform(sx, 0, 0, sy, 0, 0); m.x.fillStyle = "#fff"; m.x.fill(P, "nonzero");
        m.x.setTransform(1, 0, 0, 1, 0, 0);
        function clear(o) { o.x.setTransform(1, 0, 0, 1, 0, 0); o.x.globalCompositeOperation = "source-over"; o.x.shadowColor = "transparent"; o.x.shadowBlur = 0; o.x.shadowOffsetX = 0; o.x.shadowOffsetY = 0; o.x.clearRect(0, 0, W, H); }
        if (st.dropShadow) {
          var ds = st.dropShadow;
          clear(e);
          for (var i = 0; i < 3; i++) {
            e.x.save(); e.x.shadowColor = ds.color; e.x.shadowBlur = ds.blur * sc;
            e.x.shadowOffsetX = Math.cos(A) * ds.distance * sc; e.x.shadowOffsetY = Math.sin(A) * ds.distance * sc;
            e.x.drawImage(m.c, 0, 0); e.x.restore();
          }
          e.x.globalCompositeOperation = "destination-out"; e.x.drawImage(m.c, 0, 0);
          b[0].x.drawImage(e.c, 0, 0);
        }
        if (st.innerShadow) {
          var is = st.innerShadow, off = W + H + 100;
          clear(soft);
          soft.x.shadowColor = "#000"; soft.x.shadowBlur = 2 * is.blur * sc;
          soft.x.shadowOffsetX = Math.cos(A) * is.distance * sc + off; soft.x.shadowOffsetY = Math.sin(A) * is.distance * sc;
          soft.x.drawImage(m.c, -off, 0);
          clear(e);
          e.x.fillStyle = is.color; e.x.fillRect(0, 0, W, H);
          e.x.globalCompositeOperation = "destination-in"; e.x.drawImage(m.c, 0, 0);
          e.x.globalCompositeOperation = "destination-out"; e.x.drawImage(soft.c, 0, 0);
          for (var j = 0; j < 3; j++) b[1].x.drawImage(e.c, 0, 0);
        }
        if (st.stroke) {
          clear(e);
          e.x.setTransform(sx, 0, 0, sy, 0, 0); e.x.strokeStyle = st.stroke.color; e.x.lineWidth = st.stroke.width * 2;
          e.x.lineJoin = "round"; e.x.stroke(P);
          e.x.setTransform(1, 0, 0, 1, 0, 0); e.x.globalCompositeOperation = "destination-out"; e.x.drawImage(m.c, 0, 0);
          b[2].x.drawImage(e.c, 0, 0);
        }
      });
      return (sb = b);
    }

    h.layers.forEach(function (L) { L.stl = L.sty || null; });

    function draw(f) {
      var W = canvas.width, H = canvas.height, sx = W / h.w, sy = H / h.h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      if (base) ctx.drawImage(base, 0, 0, W, H);
      h.layers.forEach(function (L, i) {
        var fl = L.st[f * 3], clip = L.st[f * 3 + 1];
        if (!(fl & 1)) return;
        ctx.save();
        if (fl & 2 && clip) {
          var P = path(clip - 1);
          ctx.setTransform(sx, 0, 0, sy, 0, 0); ctx.clip(P.p, P.rule); ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        if (L.k === "p") { if (base) ctx.drawImage(base, 0, 0, W, H); }
        else { cells[i].seek(f); drawCells(L, i, cells[i], W, H, sx, sy); }
        ctx.restore();
      });
      if (h.alpha && base) {
        ctx.globalCompositeOperation = "destination-in"; ctx.drawImage(base, 0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }
      var b = buildStyles(f, W, H, sx, sy);
      if (b) {
        [h.sc.dropShadow, h.sc.innerShadow, { blend: "source-over", opacity: 100 }].forEach(function (c, i) {
          ctx.globalAlpha = Math.max(0, Math.min(100, c.opacity)) / 100;
          ctx.globalCompositeOperation = c.blend;
          ctx.drawImage(b[i].c, 0, 0);
        });
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      }
    }

    var t0 = performance.now(), shown = -1, raf = 0, running = true, visible = true;
    var still = canvas.getAttribute("data-tfv-motion") !== "always" && g.matchMedia &&
      g.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function frame(now) {
      raf = 0;
      var f = still ? 0 : Math.floor(((now - t0) / 1000) * h.fps) % h.n;
      var resized = size();
      if (f !== shown || resized) { draw(f); shown = f; }
      if (running && visible && !still) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    if (g.ResizeObserver) new ResizeObserver(function () { kick(); }).observe(canvas);
    if (g.IntersectionObserver) new IntersectionObserver(function (es) {
      visible = es[es.length - 1].isIntersecting;
      if (visible) kick();
    }).observe(canvas);
    kick();
    return {
      frames: h.n, fps: h.fps, width: h.w, height: h.h,
      pause: function () { running = false; },
      play: function () { if (!running) { running = true; t0 = performance.now() - (shown / h.fps) * 1000; kick(); } },
    };
  }

  function b64(text) {
    var s = atob(text.replace(/\s+/g, "")), b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  function auto() {
    Array.prototype.forEach.call(doc.querySelectorAll("canvas[data-tfv]"), function (c) {
      if (c.__tfv) return;
      c.__tfv = 1;
      var src = c.getAttribute("data-tfv");
      var data = src.charAt(0) === "#" ? b64(doc.querySelector(src).textContent) : src;
      play(c, data).catch(function (e) { console.error(e); });
    });
  }

  g.TFVector = { play: play, decode: decode, inflate: inflate, _cells: Cells, _path: buildPath };
  if (doc) {
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", auto);
    else auto();
  }
})(typeof window !== "undefined" ? window : globalThis);
