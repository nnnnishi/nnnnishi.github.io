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
  // a row of slot cells (one resource's timeline). returns array of rects; fill set in render or here
  // o: {x, y, n, w, h, label, states:[0 free | 1 booked | 2 highlight-a | 3 highlight-b], gap}
  function slots(g, o) {
    var cells = [], gap = o.gap == null ? 3 : o.gap;
    if (o.label) T(g, o.x - 12, o.y + o.h / 2 + 6, o.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    for (var k = 0; k < o.n; k++) {
      var s = o.states ? o.states[k] : 0;
      cells.push(el('rect', { x: o.x + k * o.w, y: o.y, width: o.w - gap, height: o.h, rx: 4,
        fill: s === 1 ? C.gray : s === 2 ? C.a : s === 3 ? C.b : '#fff', stroke: s ? 'none' : C.hair, 'stroke-width': 1.4 }, g));
    }
    return cells;
  }
  function fillOf(s) { return s === 1 ? C.gray : s === 2 ? C.a : s === 3 ? C.b : s === 4 ? '#FCEBDF' : s === 5 ? C.bsoft : '#fff'; }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree, slots: slots, fillOf: fillOf };
})();
// =====================================================================
// teaser-scenes.js — Lian, DiStefano, Shields, Heinichen, Giampietri, Wang, Clinical Appointment Process:
// Improvement Through Schedule Defragmentation (IEEE EMB Magazine 2010). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses the fragmentation indexes stated in the text for
// the paper's Fig. 3 example (10, 6, 5, 3, 2 open blocks for co-op ratios 1.0, 1.25, 1.5, 2.0, 100).
// Colours: orange = conventional booking and its fragmented free time; blue = defragmentation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'ふつうの予約の入れ方では、診察の間に<span class="A">短い空き時間</span>が散らばる。', en: '' },
    { ja: '空き時間の合計は足りていても、長い診察が入る連続した空きがない。', en: '' },
    { ja: '<span class="B">提案法</span>は候補ごとに仮に予約を入れて空きの塊を数え、少ない順に患者に示す。', en: '' },
    { ja: '15分枠・10件の例で、協力比を 1.0 から 2.0 に上げると空きの塊は 10 から 3 に減った。', en: '' },
    { ja: '空きの塊の数という単純な指標で、断片化を予約の受入率の問題として示した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660, W = 40, N = 12;

  // appointments [start, len] in 15-min-ish units (schematic)
  var SCATTER = [[1, 2], [4, 1], [6, 2], [9, 1]];
  var PACKED = [[0, 2], [2, 1], [3, 2], [5, 1]];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    function day(g, y, label) { return TZ.slots(g, { x: 150, y: y, n: N, w: W, h: 44, label: label }); }
    function appts(g, y, list, col) {
      return list.map(function (a) {
        return el('rect', { x: 150 + a[0] * W, y: y + 3, width: a[1] * W - 3, height: 38, rx: 5, fill: col }, g);
      });
    }

    // ===== scene 1: scattered appointments =====
    var g1 = S.g[0];
    T(g1, 150, 110, '医師 A の午前（1 マス = 単位枠）', { 'font-size': 15, fill: C.muted });
    day(g1, 140, '医師 A');
    S.a1 = appts(g1, 140, SCATTER, C.gray);
    S.f1 = el('g', {}, g1);
    [[0, 1], [3, 1], [5, 1], [8, 1], [10, 2]].forEach(function (f) {
      el('rect', { x: 150 + f[0] * W + 1, y: 142, width: f[1] * W - 5, height: 40, rx: 5, fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.f1);
    });
    T(S.f1, 150, 240, '空きは 6 枠あるが、5 か所に分かれている', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, 'ふつうの入れ方', C.a, [['空いている枠に', 15], ['順に入れていく', 15]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: a long appointment does not fit =====
    var g2 = S.g[1];
    day(g2, 140, '医師 A');
    appts(g2, 140, SCATTER, C.gray);
    S.r2 = el('g', {}, g2);
    el('rect', { x: 150, y: 250, width: 3 * W - 3, height: 44, rx: 6, fill: C.a, 'fill-opacity': 0.15, stroke: C.a, 'stroke-width': 2 }, S.r2);
    T(S.r2, 150 + 1.5 * W, 278, '3 枠の診察', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    T(S.r2, 150 + 3 * W + 16, 278, '→ 入る場所がない', { 'font-size': 16, fill: C.a, 'font-weight': 650 });
    S.p2 = TZ.panel(g2, PX, 140, '断片化', C.a, [['合計の空きは 6 枠', 15], ['連続した空きは最大 2 枠', 15], null, ['受入率も稼働率も', 15, C.muted], ['下がる', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: mock allocation and the fragmentation index =====
    var g3 = S.g[2];
    var BASE = [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0];
    T(g3, 150, 92, '1 枠の依頼。候補ごとに仮に入れて、空きの塊を数える', { 'font-size': 15, fill: C.muted });
    TZ.slots(g3, { x: 150, y: 110, n: N, w: W, h: 36, label: '今', states: BASE });
    var cands = [[2, 2], [4, 3], [9, 4]];  // [slot, open blocks after a mock allocation]
    S.c3 = cands.map(function (c, i) {
      var g = el('g', {}, g3), y = 190 + i * 70, st = BASE.slice(); st[c[0]] = 3;
      TZ.slots(g, { x: 150, y: y, n: N, w: W, h: 36, label: '候補 ' + 'ABC'[i], states: st });
      T(g, 150 + N * W + 14, y + 25, '塊 ' + c[1], { 'font-size': 17, 'font-weight': 650, fill: i === 0 ? C.b : C.ink });
      return g;
    });
    S.q3 = T(g3, 150, 430, 'A → B → C の順に並べ（同じ数なら早い時刻が上）、患者に上から勧める', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX + 40, 140, '断片化指数', C.b, [['仮の割当の後に残る', 15], ['空きの塊の数', 15], null, ['選ぶのは患者。', 15, C.muted], ['勧めに従う度合いを', 15, C.muted], ['協力比と呼ぶ', 15, C.muted]]);
    TZ.note(g3, '模式図（手順は論文 Fig. 2 にもとづく）');

    // ===== scene 4: fragmentation index vs co-op ratio (paper, Fig. 3 example) =====
    var g4 = S.g[3];
    T(g4, 70, 70, '10 件の予約後の空きの塊の数（15 分枠。論文 Fig. 3 の例）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var fi = [['1.0', 10], ['1.25', 6], ['1.5', 5], ['2.0', 3], ['100', 2]];
    S.b4 = fi.map(function (d, i) {
      var x = 130 + i * 110, h = d[1] * 28, col = i === 0 ? C.a : C.b;
      var r = el('rect', { x: x, y: 400 - h, width: 70, height: 0, rx: 4, fill: col, 'fill-opacity': i === 0 ? 1 : 0.85 }, g4);
      var lab = el('text', { x: x + 35, y: 390 - h, 'font-size': 18, 'font-weight': 650, fill: col, 'text-anchor': 'middle' }, g4);
      lab.textContent = d[1];
      T(g4, x + 35, 428, d[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lab: lab, h: h, t0: 24.6 + i * 0.6 };
    });
    el('line', { x1: 110, x2: 680, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    T(g4, 405, 465, '協力比（患者が上の候補を選ぶ確率 ÷ 次の候補を選ぶ確率）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.p4 = TZ.panel(g4, PX + 40, 140, '少しの協力で十分', C.b, [['1.0 → 2.0 で 10 → 3', 15, C.ink, 600], ['100 でも 2', 15], null, ['協力比を上げると', 15, C.muted], ['受入率も稼働率も上がる', 15, C.muted]]);
    TZ.note(g4, '論文の本文の値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['空きの塊の数（協力比 1.0 → 2.0）', '10 → 3'], ['評価', '受入率と稼働率']],
      venue: 'IEEE EMB MAGAZINE 2010', title: ['Clinical Appointment Process: Improvement', 'Through Schedule Defragmentation'], tsize: 28,
      sub: '外来の予約の手順：予約表の断片化の解消による改善', authors: ['J. Lian, K. DiStefano, S. D. Shields,', 'C. Heinichen, M. Giampietri, L. Wang'], url: 'doi.org/10.1109/MEMB.2009.935718'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.a1.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 0.8 + i * 0.6, 1.3 + i * 0.6)); });
    S.f1.setAttribute('opacity', seg(t, 3.8, 4.6));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.r2.setAttribute('opacity', seg(t, 9.4, 10.2));
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    S.c3.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 17.2 + i * 0.9, 17.8 + i * 0.9)); });
    S.q3.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    S.b4.forEach(function (b) { var k = H.ease(seg(t, b.t0, b.t0 + 0.6)); b.r.setAttribute('height', b.h * k); b.r.setAttribute('y', 400 - b.h * k); b.lab.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8)); });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
