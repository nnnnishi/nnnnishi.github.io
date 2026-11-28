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
      var single = (r.a == null) !== (r.b == null);   // one bar only: centre it in the row
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + (single ? bh / 2 : k[2] * (bh + 2)), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + (single ? bh / 2 : k[2] * (bh + 2)) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
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
// teaser-scenes.js — Agatz, Campbell, Fleischmann, Savelsbergh, Time Slot Management in Attended Home
// Delivery (Transportation Science 2011). Unofficial explainer.
// Scenes 1-3 are schematics with an explainer-drawn toy map (labelled 模式図). Scene 4 uses Table 2.
// Colours: orange = offering every slot everywhere (ALL); blue = optimised slot schedules (CA / IP).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">すべての地域にすべての枠</span>を出すと、同じ時間帯に離れた地域を回ることになる。', en: '' },
    { ja: '地域ごとに出す枠を変えると、同じ枠の客が近くに固まり、ルートが短くなる。', en: '' },
    { ja: '<span class="B">提案法</span>は 2 つある。費用を地域の密度から近似する方法と、種の地域を通るルートで近似する整数計画である。', en: '' },
    { ja: 'Albert.nl のデータでは、全部の枠を出す場合を 100 として、朝の費用が 90〜91 になった。', en: '' },
    { ja: '日々の受付の前に、どの地域にどの枠を出すかを計画する研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var N = 4, CELL = 100, MX = 110, MY = 100;
  var SLOTCOL = ['#1D4ED8', '#C2410C', '#0F766E', '#7C3AED'];
  // explainer's toy assignment: one slot per zip, clustered by quadrant
  var ASG = [[0, 0, 1, 1], [0, 0, 1, 1], [2, 2, 3, 3], [2, 2, 3, 3]];

  function zips(g, colorOf, label) {
    var cells = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var x = MX + c * CELL, y = MY + r * CELL;
      var rect = el('rect', { x: x + 2, y: y + 2, width: CELL - 4, height: CELL - 4, rx: 6, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      var dots = el('g', {}, g);
      colorOf(r, c).forEach(function (col, k) {
        el('circle', { cx: x + 22 + (k % 2) * 28, cy: y + 30 + Math.floor(k / 2) * 30, r: 9, fill: col }, dots);
      });
      cells.push({ rect: rect, dots: dots, t0: 0 });
    }
    if (label) T(g, MX, MY + N * CELL + 30, label, { 'font-size': 14, fill: C.muted });
    return cells;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: every slot everywhere =====
    var g1 = S.g[0];
    T(g1, 70, 76, '郵便番号の地域と、出している枠（色）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c1 = zips(g1, function () { return SLOTCOL; }, '各地域に 4 つの枠をすべて出す');
    S.c1.forEach(function (c, i) { c.t0 = 0.8 + i * 0.12; });
    S.r1 = el('polyline', { points: '160,150 460,180 190,420 470,440 320,260', fill: 'none', stroke: C.a, 'stroke-width': 3 }, g1);
    S.p1 = TZ.panel(g1, PX, 150, 'ALL', C.a, [['ある枠の客が', 15], ['全地域に散らばる', 15], null, ['1 つの枠の時間内に', 14, C.muted], ['離れた地域を回る', 14, C.muted]]);
    TZ.note(g1, '模式図（地域と枠は解説者が置いた例）');

    // ===== scene 2: regional differentiation =====
    var g2 = S.g[1];
    T(g2, 70, 76, '地域ごとに出す枠を変える', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c2 = zips(g2, function (r, c) { return [SLOTCOL[ASG[r][c]]]; }, '各地域に 1 つの枠（サービスの条件を満たす範囲で）');
    S.c2.forEach(function (c, i) { c.t0 = 8.8 + i * 0.12; });
    S.r2 = el('polyline', { points: '140,130 290,130 290,280 140,280 140,130', fill: 'none', stroke: C.b, 'stroke-width': 3 }, g2);
    S.p2 = TZ.panel(g2, PX, 150, '地域で分ける', C.b, [['同じ枠の客が近くに固まり、', 15], ['1 つの枠のルートが短い', 15], null, ['営業の決めた', 14, C.muted], ['「最低いくつの枠を出すか」', 14, C.muted], ['は守る', 14, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: two approaches =====
    var g3 = S.g[2];
    function card(g, x, title, lines) {
      var c = el('g', {}, g);
      el('rect', { x: x, y: 110, width: 270, height: 300, rx: 12, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, c);
      T(c, x + 20, 150, title, { 'font-size': 17, 'font-weight': 650, fill: C.b });
      lines.forEach(function (l, i) { T(c, x + 20, 194 + i * 32, l, { 'font-size': 15, fill: C.ink }); });
      return c;
    }
    S.k3 = [
      card(g3, 70, '連続近似（CA）', ['地域の面積と需要の密度から', '1 件あたりの費用を近似', '1 地域ずつ枠の組を替える', '局所探索', 'Excel/VBA で約 2 分']),
      card(g3, 370, '整数計画（IP）', ['車両と枠ごとに「種」の地域', '種を順に回る費用 ＋', '種から各地域への費用', '便が短い（4 枠まで）ことを使う', '8 時間で最適性は未証明'])
    ];
    TZ.note(g3, '論文の 2 つの方法の要約');

    // ===== scene 4: Table 2 =====
    var g4 = S.g[3];
    T(g4, 70, 64, '朝の便の配送費用（ALL = 100、論文 Table 2）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 330, x1: 820, v0: 0, v1: 100, y0: 96, rowH: 64, t0: 24.6, dt: 0.4, ticks: [0, 25, 50, 75, 100],
      rows: [
        { label: 'ALL（全部の枠）', a: 100 },
        { label: 'RAND-ASGN', a: 94 },
        { label: 'ALBERT（現行）', a: 92 },
        { label: 'CA', b: 90 },
        { label: 'IP', b: 91 },
        { label: 'NO-SLOT（参考）', a: 82 }
      ]
    });
    TZ.note(g4, '論文 Table 2 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['朝の配送費用（ALL = 100）', 'CA 90 ・ IP 91'], ['夕の配送費用', 'ALL 98 → 89']],
      venue: 'TRANSPORTATION SCIENCE 2011', title: ['Time Slot Management in', 'Attended Home Delivery'], tsize: 34,
      sub: '在宅受け取りの宅配における時間枠の管理', authors: ['Niels Agatz, Ann Campbell, Moritz Fleischmann, Martin Savelsbergh'], url: 'doi.org/10.1287/trsc.1100.0346'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    [S.c1, S.c2].forEach(function (cs) { cs.forEach(function (c) { var v = seg(t, c.t0, c.t0 + 0.3); c.rect.setAttribute('opacity', v); c.dots.setAttribute('opacity', v); }); });
    S.r1.setAttribute('opacity', seg(t, 3.4, 4.2));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    S.r2.setAttribute('opacity', seg(t, 11.4, 12.2));
    S.p2.setAttribute('opacity', seg(t, 12.2, 13.0));
    S.k3.forEach(function (k, i) { k.setAttribute('opacity', seg(t, 16.8 + i * 1.6, 17.6 + i * 1.6)); });
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
