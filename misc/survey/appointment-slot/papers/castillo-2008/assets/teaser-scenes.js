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
// teaser-scenes.js — Castillo, Rouskas, Harfoush, Efficient Resource Management using Advance
// Reservations for Heterogeneous Grids (IPDPS 2008). Unofficial explainer.
// All scenes are schematics (labelled 模式図). The paper reports its results only in figures, so the
// teaser shows the algorithms and complexities stated in the text, not result values.
// Colours: orange = idle periods / linear search; blue = the geometric (dual) search FF-HA+.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '事前予約を受けると、各サーバーの予定表に<span class="A">大きさのばらばらな空き期間</span>が残る。', en: '' },
    { ja: '空き期間は、時刻とともにこなせる仕事量が減る傾いた線分として描ける。', en: '' },
    { ja: '<span class="B">点と直線に変換</span>すると、入る空き期間は「直線より下の点」になる。', en: '' },
    { ja: '速度ごとの木で探すと、空き期間の数に比例する探索より速い。', en: '' },
    { ja: '予約の間の空きを区間のまま管理し、要求の時間窓に入るものを速く探す。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: schedules with reservations and idle gaps =====
    var g1 = S.g[0];
    T(g1, 70, 76, 'サーバーの予定表（横は時刻）', { 'font-size': 15, fill: C.muted });
    var res = [[[0, 1.5], [2.3, 4.0], [5.2, 6.0], [7.4, 9]], [[0.6, 2.0], [3.2, 5.6], [6.3, 7.0]], [[0, 0.8], [1.6, 3.0], [4.4, 5.0], [6.8, 9]], [[1.0, 2.6], [3.6, 4.2], [5.8, 8.0]]];
    var X0 = 140, W = 470 / 9;
    S.res1 = [];
    res.forEach(function (row, i) {
      var y = 100 + i * 64;
      T(g1, 70, y + 26, '速さ ' + ['1', '1', '2', '2'][i], { 'font-size': 14, fill: C.ink });
      el('rect', { x: X0, y: y, width: 470, height: 38, fill: '#fff', stroke: C.a, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, g1);
      row.forEach(function (r, k) {
        var b = el('rect', { x: X0 + r[0] * W, y: y, width: (r[1] - r[0]) * W, height: 38, fill: C.gray }, g1);
        S.res1.push({ el: b, t0: 0.8 + (i * 4 + k) * 0.15 });
      });
    });
    S.req1 = el('g', {}, g1);
    el('rect', { x: X0 + 2.0 * W, y: 380, width: 6.0 * W, height: 28, rx: 4, fill: 'none', stroke: C.ink, 'stroke-dasharray': '5 4' }, S.req1);
    el('rect', { x: X0 + 2.0 * W, y: 384, width: 1.6 * W, height: 20, rx: 3, fill: C.b }, S.req1);
    T(S.req1, X0 + 2.0 * W, 430, '新しい要求：r 以降に始め、d までに仕事量 l を終える', { 'font-size': 14, fill: C.ink });
    S.p1 = TZ.panel(g1, PX, 140, 'どこに入れるか', C.a, [['灰：予約済み', 15], ['点線の白：空き期間', 15], null, ['要求のたびに、全サーバーの', 15, C.muted], ['空き期間から探す', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: primal geometry =====
    var g2 = S.g[1];
    el('line', { x1: 80, y1: 430, x2: 600, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: 80, y1: 90, x2: 80, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    T(g2, 600, 456, '時刻', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    T(g2, 90, 92, '仕事量', { 'font-size': 14, fill: C.muted });
    S.idle2 = el('line', { x1: 140, y1: 120, x2: 140, y2: 120, stroke: C.a, 'stroke-width': 4, 'stroke-linecap': 'round' }, g2);
    S.idleL = T(g2, 150, 112, '空き期間：傾き −μ', { 'font-size': 15, fill: C.a });
    S.job2 = el('g', {}, g2);
    el('line', { x1: 170, y1: 340, x2: 300, y2: 340, stroke: C.b, 'stroke-width': 4, 'stroke-linecap': 'round' }, S.job2);
    T(S.job2, 170, 368, '要求：高さ l、r から d − l まで', { 'font-size': 15, fill: C.b });
    S.p2 = TZ.panel(g2, PX, 140, '入る条件', C.ink, [['1. 締切に間に合う時刻', 15], ['   までに空きが始まる', 15], ['2. 空きの線分が', 15], ['   要求の線分より上', 15], null, ['速いサーバーほど', 15, C.muted], ['線分の傾きが急', 15, C.muted]]);
    TZ.note(g2, '模式図（論文の幾何的な見方）');

    // ===== scene 3: dual — points on vertical lines below the job line =====
    var g3 = S.g[2];
    var ox = 520, oy = 110;
    el('line', { x1: 90, y1: oy, x2: ox, y2: oy, stroke: C.hair }, g3);
    var xs = [{ mu: '3', x: 160 }, { mu: '2', x: 300 }, { mu: '1', x: 440 }];
    xs.forEach(function (v) {
      el('line', { x1: v.x, y1: oy, x2: v.x, y2: 450, stroke: C.hair, 'stroke-dasharray': '3 4' }, g3);
      T(g3, v.x, 470, 'x = −' + v.mu, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    // job line y = r x - l drawn as a straight line across
    S.line3 = el('line', { x1: 100, y1: 420, x2: 520, y2: 180, stroke: C.ink, 'stroke-width': 2.5 }, g3);
    S.lineL = T(g3, 520, 165, '要求の直線 y = r x − l', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var lineY = function (x) { return 420 + (x - 100) * (180 - 420) / 420; };
    var pts = [[160, 0.15], [160, 0.55], [160, 0.85], [300, 0.25], [300, 0.62], [300, 0.9], [440, 0.3], [440, 0.7], [440, 0.95]];
    S.pts3 = pts.map(function (p, i) {
      var y = 130 + p[1] * 310, below = y > lineY(p[0]);
      var c = el('circle', { cx: p[0], cy: y, r: 9, fill: C.a }, g3);
      return { c: c, below: below, t0: 17.0 + i * 0.12 };
    });
    S.p3 = TZ.panel(g3, PX, 140, '双対変換', C.b, [['空き期間 → 点', 15], ['(−μ, −μ·et)', 15, C.ink, 600], ['要求 → 直線', 15], ['y = r x − l', 15, C.ink, 600], null, ['直線より下の点が', 15, C.b], ['仕事量の点で入る', 15, C.b]]);
    TZ.note(g3, '模式図（同じ速度の空き期間は同じ縦の線に並ぶ）');

    // ===== scene 4: three methods =====
    var g4 = S.g[3];
    T(g4, 70, 70, '論文が比べる 3 つの方式', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['FF-HU', '全空き期間を 1 本のリストで先着順', '速度の違いを考えない', C.a],
                ['FF-HA', '速度ごとのリスト、遅い速度から', 'O(HV)', C.a],
                ['FF-HA+（提案）', '速度ごとの 2 段の木、遅い速度から', 'O(H log² V)', C.b]];
    S.rows4 = rows.map(function (r, i) {
      var row = el('g', {}, g4), y = 100 + i * 100;
      el('rect', { x: 70, y: y, width: 820, height: 80, rx: 10, fill: i === 2 ? C.bsoft : '#fff', stroke: C.hair }, row);
      T(row, 94, y + 34, r[0], { 'font-size': 18, 'font-weight': 650, fill: r[3] });
      T(row, 94, y + 62, r[1], { 'font-size': 15, fill: C.ink });
      T(row, 866, y + 48, r[2], { 'font-size': 20, 'font-weight': 650, fill: r[3], 'text-anchor': 'end' });
      return { row: row, t0: 24.6 + i * 1.4 };
    });
    S.n4 = T(g4, 70, 430, 'V：空き期間の数、H：速度の種類の数。結果の数値は論文の図にだけある。', { 'font-size': 15, fill: C.muted });

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['空き期間の検索', 'O(H log² V)'], ['速度のばらつき', '考慮すれば利点']],
      venue: 'IEEE IPDPS 2008', title: ['Efficient Resource Management using', 'Advance Reservations for Heterogeneous Grids'], tsize: 28,
      sub: '事前予約を使った資源管理', authors: ['Claris Castillo, George N. Rouskas, Khaled Harfoush'], url: 'doi.org/10.1109/IPDPS.2008.4536228'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.res1.forEach(function (r) { r.el.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.req1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 3.4, 4.0));
    var k = seg(t, 8.8, 10.2);
    S.idle2.setAttribute('x2', 140 + 380 * k); S.idle2.setAttribute('y2', 120 + 310 * k);
    S.idleL.setAttribute('opacity', seg(t, 9.6, 10.2));
    S.job2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    S.line3.setAttribute('opacity', seg(t, 18.6, 19.2));
    S.lineL.setAttribute('opacity', seg(t, 18.8, 19.4));
    var sw = seg(t, 20.0, 20.8);
    S.pts3.forEach(function (p) {
      p.c.setAttribute('opacity', seg(t, p.t0, p.t0 + 0.3));
      p.c.setAttribute('fill', p.below ? H.mix(C.a, C.b, sw) : H.mix(C.a, C.gray, sw));
    });
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));
    S.rows4.forEach(function (r) { r.row.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.6)); });
    S.n4.setAttribute('opacity', seg(t, 29.0, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
