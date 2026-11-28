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
// Based on the abstract only: every picture is a schematic (labelled 模式図) and no numbers are shown.
// Colours: orange = conventional booking and its fragmented free time; blue = defragmentation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'ふつうの予約の入れ方では、診察の間に<span class="A">短い空き時間</span>が散らばる。', en: '' },
    { ja: '空き時間の合計は足りていても、長い診察が入る連続した空きがない。', en: '' },
    { ja: '<span class="B">提案法</span>は患者と医師の双方の希望を使い、断片化を減らすように予約を入れる。', en: '' },
    { ja: 'シミュレーションでは断片化が減り、予約の受入率と稼働率が上がった（要旨）。', en: '' },
    { ja: '予約表の断片化を名指しで問題にした、医療の予約の早い研究。', en: '' }
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

    // ===== scene 3: defragmentation with preferences =====
    var g3 = S.g[2];
    T(g3, 150, 110, '患者の希望する時間帯と医師の希望を合わせて枠を選ぶ', { 'font-size': 15, fill: C.muted });
    day(g3, 140, '医師 A');
    S.a3 = SCATTER.map(function (a, i) {
      return { r: el('rect', { x: 150 + a[0] * W, y: 143, width: a[1] * W - 3, height: 38, rx: 5, fill: C.b, 'fill-opacity': 0.85 }, g3), from: a[0], to: PACKED[i][0] };
    });
    S.f3 = el('g', {}, g3);
    el('rect', { x: 150 + 6 * W + 1, y: 142, width: 6 * W - 5, height: 40, rx: 5, fill: 'none', stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.f3);
    T(S.f3, 150, 240, '同じ予約で、6 枠の連続した空きが残る', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.r3 = el('g', {}, g3);
    el('rect', { x: 150 + 6 * W, y: 270, width: 3 * W - 3, height: 44, rx: 6, fill: C.b, 'fill-opacity': 0.15, stroke: C.b, 'stroke-width': 2 }, S.r3);
    T(S.r3, 150 + 7.5 * W, 298, '3 枠の診察', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(S.r3, 150 + 9 * W + 12, 298, '→ 入る', { 'font-size': 16, fill: C.b, 'font-weight': 650 });
    S.p3 = TZ.panel(g3, PX, 140, '断片化の解消', C.b, [['患者と医師の双方の', 15], ['希望を考慮する', 15], null, ['具体的な手順は', 15, C.muted], ['本文を未読のため省略', 15, C.muted]]);
    TZ.note(g3, '模式図（論文の手順の再現ではない）');

    // ===== scene 4: findings (abstract) =====
    var g4 = S.g[3];
    T(g4, 70, 80, '要旨が述べる結果（シミュレーション）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var items = [['断片化', '減る', '↓'], ['予約の受入率', '上がる', '↑'], ['診療時間の稼働率', '上がる', '↑']];
    S.i4 = items.map(function (it, i) {
      var g = el('g', {}, g4), y = 110 + i * 84;
      el('rect', { x: 70, y: y, width: 470, height: 66, rx: 12, fill: C.bsoft }, g);
      T(g, 96, y + 41, it[0], { 'font-size': 18, fill: C.ink });
      T(g, 440, y + 43, it[2] + ' ' + it[1], { 'font-size': 22, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      return g;
    });
    S.n4 = el('g', {}, g4);
    T(S.n4, 70, 395, '診療時間を正確に推定できれば、単位枠を短くして効率をさらに上げられる可能性がある', { 'font-size': 16, fill: C.ink });
    T(S.n4, 70, 430, '臨床医へのアンケートで、導入の機会と課題も調べた', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '要旨にもとづく（数値は本文を未読のため示さない）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['評価', '受入率と稼働率'], ['方法', '患者と医師の希望を使う']],
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
    var k = seg(t, 17.6, 19.6);
    S.a3.forEach(function (a) { a.r.setAttribute('x', 150 + (a.from + (a.to - a.from) * k) * W); });
    S.f3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.r3.setAttribute('opacity', seg(t, 21.0, 21.6));
    S.p3.setAttribute('opacity', seg(t, 18.0, 18.8));
    S.i4.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 24.6 + i * 0.9, 25.2 + i * 0.9)); });
    S.n4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
