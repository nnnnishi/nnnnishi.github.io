// ---- shared helpers for the appointment-slot explainer teasers (Japanese-only pages) ----
window.TZ = (function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  function T(g, x, y, s, attrs) { return H.t2(g, x, y, s, '', attrs || {}); }
  // explanation column: title + lines [[text, size?, fill?, weight?], ...]
  function panel(g, x, y, title, color, lines) {
    var p = el('g', {}, g), yy = y;
    if (title) { T(p, x, yy, title, { 'font-size': 18, 'font-weight': 650, fill: color || C.ink }); yy += 44; }
    lines.forEach(function (l) {
      if (l === null) { yy += 22; return; }
      if (typeof l === 'string') l = [l];
      T(p, x, yy, l[0], { 'font-size': l[1] || 16, fill: l[2] || C.ink, 'font-weight': l[3] || 400 });
      yy += (l[1] || 16) + 10;
    });
    return p;
  }
  // paired horizontal bars (orange vs blue) on a common linear axis
  // o: {x0, x1, v0, v1, y0, rowH, rows:[{label, a, b, la, lb}], t0, dt, ticks:[..], fmt}
  function pairs(g, o) {
    var sc = function (v) { return o.x0 + (v - o.v0) / (o.v1 - o.v0) * (o.x1 - o.x0); };
    var yEnd = o.y0 + o.rows.length * o.rowH;
    (o.ticks || []).forEach(function (v) {
      el('line', { x1: sc(v), x2: sc(v), y1: o.y0 - 8, y2: yEnd, stroke: C.hair, 'stroke-width': 1 }, g);
      el('text', { x: sc(v), y: yEnd + 22, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.fmt ? o.fmt(v) : String(v);
    });
    el('line', { x1: o.x0, x2: o.x0, y1: o.y0 - 8, y2: yEnd, stroke: C.ink, 'stroke-width': 1.5 }, g);
    var items = [];
    o.rows.forEach(function (r, i) {
      var y = o.y0 + i * o.rowH, bh = (o.rowH - 14) / 2;
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + k[2] * (bh + 2), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + k[2] * (bh + 2) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
        lab.textContent = r['l' + k[0]] || String(r[k[0]]);
        items.push({ rect: rect, lab: lab, w: sc(r[k[0]]) - o.x0, t0: o.t0 + i * (o.dt || 0.5) + k[2] * 0.25 });
      });
    });
    return items;
  }
  function renderBars(items, t) {
    items.forEach(function (b) {
      b.rect.setAttribute('width', Math.max(0, b.w * H.ease(seg(t, b.t0, b.t0 + 0.7))));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }
  // title card: o = {cards:[[label, value]...], venue, title:[l1,l2], sub, authors:[..lines], url}
  function title(g, o) {
    var n = o.cards.length, w = 300, gap = 60, x = 480 - (n * w + (n - 1) * gap) / 2;
    o.cards.forEach(function (c, i) {
      var cx = x + i * (w + gap);
      el('rect', { x: cx, y: 40, width: w, height: 70, rx: 12, fill: C.bsoft }, g);
      T(g, cx + w / 2, 68, c[0], { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      T(g, cx + w / 2, 96, c[1], { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = o.venue;
    o.title.forEach(function (l, i) {
      el('text', { x: 480, y: 220 + i * 40, 'font-size': o.tsize || 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = l;
    });
    var y = 220 + o.title.length * 40;
    T(g, 480, y + 2, o.sub, { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    o.authors.forEach(function (a, i) {
      el('text', { x: 480, y: y + 50 + i * 26, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = a;
    });
    el('text', { x: 480, y: y + 60 + o.authors.length * 26 + 20, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.url;
    T(g, 480, 512, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }
  function note(g, s) { return T(g, 940, 520, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); }
  function fades(gs, B, t) {
    gs.forEach(function (g, i) {
      var a = B[i], b = B[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
  }
  // a small binary tree drawn from a nested spec: {l:'B', y:[..], n:[..]} or {leaf:'1'}
  // returns {g, nodes:[{el, depth}], edges:[...]} ; dx halves per level
  function tree(g, spec, x, y, dx, dy, color) {
    var out = { nodes: [], edges: [] };
    (function rec(s, x, y, dx, d) {
      if (s.leaf != null) {
        var r = el('rect', { x: x - 20, y: y - 16, width: 40, height: 32, rx: 6, fill: '#fff', stroke: color, 'stroke-width': 1.8 }, g);
        var tx = el('text', { x: x, y: y + 6, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g); tx.textContent = s.leaf;
        out.nodes.push({ el: r, tx: tx, d: d, leaf: true });
        return;
      }
      [[s.yes, -1, '1'], [s.no, 1, '0']].forEach(function (c) {
        var e = el('line', { x1: x, y1: y + 18, x2: x + c[1] * dx, y2: y + dy - 18, stroke: color, 'stroke-width': 1.8 }, g);
        var lb = el('text', { x: x + c[1] * dx / 2 + c[1] * 10, y: y + dy / 2 + 4, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g); lb.textContent = c[2];
        out.edges.push({ el: e, lb: lb, d: d });
        rec(c[0], x + c[1] * dx, y + dy, dx / 2, d + 1);
      });
      var ci = el('circle', { cx: x, cy: y, r: 20, fill: color }, g);
      var tx = el('text', { x: x, y: y + 6, 'font-size': 17, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g); tx.textContent = s.l;
      out.nodes.push({ el: ci, tx: tx, d: d });
    })(spec, x, y, dx, 0);
    return out;
  }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree };
})();
// =====================================================================
// teaser-scenes.js — Lam, Ho, Mo, Tang, Enhancing data-driven elderly appointment services in domestic care
// communities under COVID-19 (Industrial Management & Data Systems, 2021). Unofficial explainer.
// Based only on the publisher's abstract (full text not read). Every scene is a schematic drawn by the
// explainer (labelled 模式図); the paper's KPI values are not known, so no number is drawn.
// Colours: orange = the existing eHealth flow; blue = AIDCS (IoT capture + AI decision support).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;
  // ---- per-page animation kit: fade-ins and growing bars, all pure functions of t ----
  var FADE = [], GROW = [];
  function fin(e, t0, d) { FADE.push({ e: e, t0: t0, d: d || 0.6 }); e.setAttribute('opacity', 0); return e; }
  function grow(rect, attr, full, t0, d) { GROW.push({ e: rect, a: attr, v: full, t0: t0, d: d || 0.8 }); rect.setAttribute(attr, 0); return rect; }
  function runKit(t) {
    FADE.forEach(function (f) { f.e.setAttribute('opacity', seg(t, f.t0, f.t0 + f.d)); });
    GROW.forEach(function (g) { g.e.setAttribute(g.a, Math.max(0, g.v * H.ease(seg(t, g.t0, g.t0 + g.d)))); });
  }
  function box(g, x, y, w, h, fill, stroke, rx) {
    return el('rect', { x: x, y: y, width: w, height: h, rx: rx == null ? 6 : rx, fill: fill || '#fff', stroke: stroke || 'none', 'stroke-width': stroke ? 1.6 : 0 }, g);
  }
  function arrow(g, x1, y1, x2, y2, color) {
    var c = color || C.muted, a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    var gg = el('g', {}, g);
    el('line', { x1: x1, y1: y1, x2: x2 - Math.cos(a) * 4, y2: y2 - Math.sin(a) * 4, stroke: c, 'stroke-width': 2 }, gg);
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - s * Math.cos(a - 0.45)) + ',' + (y2 - s * Math.sin(a - 0.45)) + ' L' + (x2 - s * Math.cos(a + 0.45)) + ',' + (y2 - s * Math.sin(a + 0.45)) + 'Z', fill: c }, gg);
    return gg;
  }

  var CAPTIONS = [
    { ja: 'COVID-19 の流行下で、在宅の高齢者は<span class="A">既存の eHealth のアプリ</span>で在宅介護を予約する。', en: '' },
    { ja: '<span class="B">AIDCS</span> は IoT で在宅の高齢者の健康データをリアルタイムに集める。', en: '' },
    { ja: '集めたデータをもとに、AI が在宅介護の予約の判断を支え、依頼とサービスを結びつける。', en: '' },
    { ja: '地域の在宅介護センターでの事例研究で、顧客満足とサービスの質が上がったと報告する。', en: '' },
    { ja: '予約アプリのサービスの割り当てに IoT と AI を組み込んだ事例研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;

  function house(g, x, y, label) {
    var gg = el('g', {}, g);
    el('path', { d: 'M' + x + ',' + (y + 30) + ' L' + (x + 45) + ',' + y + ' L' + (x + 90) + ',' + (y + 30) + 'Z', fill: C.gray }, gg);
    box(gg, x + 10, y + 30, 70, 50, '#fff', C.ink, 2);
    T(gg, x + 45, y + 62, label, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    return gg;
  }
  function phone(g, x, y, color, label) {
    var gg = el('g', {}, g);
    box(gg, x, y, 70, 120, '#fff', color, 12);
    box(gg, x + 8, y + 16, 54, 80, color === C.a ? '#FCEBDF' : C.bsoft, null, 4);
    T(gg, x + 35, y + 60, label, { 'font-size': 14, fill: color, 'text-anchor': 'middle', 'font-weight': 600 });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    var hs = [['高齢者 A', 90], ['高齢者 B', 210], ['高齢者 C', 330]];

    // ===== scene 1: existing flow =====
    var g1 = S.g[0];
    hs.forEach(function (h, i) { fin(house(g1, 70, h[1], h[0]), 0.6 + i * 0.4); });
    fin(phone(g1, 300, 190, C.a, 'アプリ'), 2.0);
    hs.forEach(function (h, i) { fin(arrow(g1, 166, h[1] + 55, 294, 250, C.a), 2.6 + i * 0.3); });
    fin(box(g1, 450, 200, 140, 100, '#fff', C.ink, 10), 3.6);
    fin(T(g1, 520, 245, '在宅介護', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }), 3.6);
    fin(T(g1, 520, 268, 'センター', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }), 3.6);
    fin(arrow(g1, 374, 250, 444, 250, C.a), 3.9);
    fin(TZ.panel(g1, PX, 150, '既存の eHealth', C.a, [['アプリから', 16], ['在宅介護を予約する', 16], null, ['COVID-19 の流行下での', 15, C.muted], ['在宅介護が対象', 15, C.muted]]), 4.6, 0.8);
    TZ.note(g1, '模式図（要旨の記述を解説者が図にしたもの）');

    // ===== scene 2: IoT capture =====
    var g2 = S.g[1];
    hs.forEach(function (h) { house(g2, 70, h[1], h[0]); });
    S.waves = [];
    hs.forEach(function (h, i) {
      var cx = 175, cy = h[1] + 50;
      for (var k = 0; k < 3; k++) {
        var p = el('path', { d: 'M' + (cx + 12 * k) + ',' + (cy - 14 - 6 * k) + ' q' + (10 + 4 * k) + ',' + (14 + 6 * k) + ' 0,' + (28 + 12 * k), fill: 'none', stroke: C.b, 'stroke-width': 2.4 }, g2);
        S.waves.push({ e: p, i: i, k: k });
      }
    });
    hs.forEach(function (h, i) { fin(arrow(g2, 220, h[1] + 50, 296, 245, C.b), 9.6 + i * 0.3); });
    box(g2, 300, 200, 200, 90, C.bsoft, C.b, 10);
    T(g2, 400, 238, '健康データ', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    T(g2, 400, 264, '（リアルタイム）', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    fin(TZ.panel(g2, PX, 150, 'IoT', C.b, [['在宅の高齢者の', 16], ['健康データを', 16], ['リアルタイムに集める', 16]]), 11.2, 0.8);
    TZ.note(g2, '模式図');

    // ===== scene 3: AI decision support =====
    var g3 = S.g[2];
    T(g3, 70, 96, '介護の依頼', { 'font-size': 15, fill: C.muted });
    T(g3, 440, 96, '介護サービス', { 'font-size': 15, fill: C.muted });
    var req = ['依頼 A', '依頼 B', '依頼 C'], srv = ['担当 1', '担当 2', '担当 3'];
    req.forEach(function (r, i) { box(g3, 70, 120 + i * 90, 120, 50, '#fff', C.ink, 8); T(g3, 130, 151 + i * 90, r, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); });
    srv.forEach(function (r, i) { box(g3, 440, 120 + i * 90, 120, 50, '#fff', C.ink, 8); T(g3, 500, 151 + i * 90, r, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); });
    var ai = el('g', {}, g3);
    el('circle', { cx: 315, cy: 235, r: 42, fill: C.b }, ai);
    T(ai, 315, 242, 'AI', { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    fin(ai, 16.6);
    [[0, 1], [1, 0], [2, 2]].forEach(function (m, k) {
      fin(el('line', { x1: 192, y1: 145 + m[0] * 90, x2: 438, y2: 145 + m[1] * 90, stroke: C.b, 'stroke-width': 2.6, 'stroke-dasharray': '0', opacity: 0 }, g3), 18.0 + k * 0.6);
    });
    fin(TZ.panel(g3, PX, 150, '予約の判断を支える', C.b, [['在宅介護の予約の', 16], ['意思決定を AI が支援', 16], null, ['アプリのサービスの', 15, C.muted], ['割り当て（service', 15, C.muted], ['matching）に組み込む', 15, C.muted]]), 20.0, 0.8);
    TZ.note(g3, '模式図（どの依頼と担当を結ぶかは解説者が置いた例）');

    // ===== scene 4: case study (qualitative) =====
    var g4 = S.g[3];
    T(g4, 70, 90, '事例研究：地域の在宅介護センター', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    T(g4, 70, 124, '取引の主要業績指標（KPI）で見た変化', { 'font-size': 15, fill: C.muted });
    [['顧客満足', '上がった'], ['サービスの質', '上がった']].forEach(function (r, i) {
      var y = 170 + i * 110, gg = el('g', {}, g4);
      box(gg, 70, y, 480, 80, C.bsoft, null, 12);
      T(gg, 100, y + 48, r[0], { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      T(gg, 520, y + 48, r[1] + ' ↑', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
      fin(gg, 25.0 + i * 0.9);
    });
    fin(T(g4, 70, 430, '変化の大きさは要旨に書かれていない', { 'font-size': 15, fill: C.muted }), 27.0);
    fin(TZ.panel(g4, PX, 150, '要旨の結論', C.b, [['応答性・有効性・効率を', 15], ['高めつつ、eHealth の', 15], ['リアルタイムの見守りを', 15], ['保つ', 15]]), 27.6, 0.8);
    TZ.note(g4, '要旨の記述のみ（数値なし）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['IoT', '在宅の健康データを集める'], ['AI', '介護の予約の判断を支える']],
      venue: 'INDUSTRIAL MANAGEMENT & DATA SYSTEMS · 2021', title: ['Enhancing data-driven elderly appointment', 'services in domestic care communities', 'under COVID-19'], tsize: 28,
      sub: '在宅介護における高齢者の予約サービスの改善', authors: ['H. Y. Lam, G. T. S. Ho, D. Y. Mo, V. Tang'], url: 'doi.org/10.1108/IMDS-07-2020-0392'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
    S.waves.forEach(function (w) {
      var ph = ((t - 8.4) * 1.2 - w.k * 0.25 - w.i * 0.15);
      var v = t < 8.4 ? 0 : 0.25 + 0.75 * Math.max(0, Math.sin(ph * Math.PI));
      w.e.setAttribute('opacity', v);
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
