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
// teaser-scenes.js — Bitran & Mondschein, An Application of Yield Management to the Hotel Industry
// Considering Multiple Day Stays (Operations Research 1995). Unofficial explainer.
// The published text was not read; scenes 2 and 4 follow the 1993 MIT working paper (single-night model,
// Table 3 of the real case). Scenes 1-3 are schematics (labelled 模式図).
// Colours: orange = accept every request while a room is free (HEUR4); blue = opportunity-cost thresholds.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '客層ごとに価格の違う申込みが来る。<span class="A">空きがあればすべて受ける</span>と、あとの高い客層を断ることになる。', en: '' },
    { ja: '<span class="B">最適な方策</span>は申込みの価値が部屋 1 室の機会費用を超えるときだけ受ける。', en: '' },
    { ja: '連泊の申込みは連続した夜の部屋を同時に使うので、夜ごとの空きをまとめて見て決める。', en: '' },
    { ja: '実在のホテルのデータで、機会費用を見積もる方法は上界の 98.7% 以上の利益を得た。', en: '' },
    { ja: '連泊を含むホテルの客室の受付を、動的計画法で考えた古典。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: requests arrive over the day =====
    var g1 = S.g[0];
    el('line', { x1: 80, x2: 600, y1: 300, y2: 300, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, 80, 330, '8時', { 'font-size': 14, fill: C.muted });
    T(g1, 600, 330, '宿泊日の夜', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    var reqs = [[110, '85', 0], [170, '120', 0], [230, '85', 0], [290, '85', 0], [350, '120', 0], [420, '200', 1], [490, '200', 1], [550, '120', 1]];
    S.q1 = reqs.map(function (r, k) {
      var gg = el('g', {}, g1), col = r[2] ? C.a : C.ink;
      el('rect', { x: r[0] - 26, y: 230, width: 52, height: 40, rx: 8, fill: r[2] ? C.a : '#fff', 'fill-opacity': r[2] ? 0.12 : 1, stroke: col, 'stroke-width': 1.8 }, gg);
      T(gg, r[0], 256, '$' + r[1], { 'font-size': 15, fill: col, 'text-anchor': 'middle', 'font-weight': 600 });
      return { g: gg, t0: 0.8 + k * 0.45 };
    });
    S.full1 = T(g1, 420, 210, '満室：高い客層を断る', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '来た順にすべて受ける', C.a, [['空きがあれば受ける', 16], ['（比較の基準 HEUR4）', 15, C.muted], null, ['価格の安い申込みが', 15, C.muted], ['先に部屋を埋める', 15, C.muted]]);
    TZ.note(g1, '模式図（価格は working paper の数値例の 85・120・200 ドル）');

    // ===== scene 2: threshold =====
    var g2 = S.g[1];
    var X0 = 110, X1 = 560, Y0 = 400, Y1 = 120;
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: X0, x2: X0, y1: Y0, y2: Y1, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    T(g2, X1, Y0 + 28, '残りの部屋数 c →', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    T(g2, X0 + 8, Y1 - 10, '部屋 1 室の機会費用 α_t(c)', { 'font-size': 15, fill: C.muted });
    S.curve2 = el('path', { d: 'M' + X0 + ' 140 C 220 250, 330 330, ' + X1 + ' 380', fill: 'none', stroke: C.b, 'stroke-width': 3 }, g2);
    S.lev2 = [[180, '$200 の客層'], [262, '$120 の客層'], [322, '$85 の客層']].map(function (l, k) {
      var gg = el('g', {}, g2), y = l[0];
      el('line', { x1: X0, x2: X1, y1: y, y2: y, stroke: C.muted, 'stroke-width': 1, 'stroke-dasharray': '5 4' }, gg);
      T(gg, X1 + 8, y + 5, l[1], { 'font-size': 14, fill: C.ink });
      return gg;
    });
    S.rule2 = T(g2, X0, 470, '受ける条件：π_i + c_i > α_t(c)', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.p2 = TZ.panel(g2, 720, 140, 'しきい値の方策', C.b, [['部屋が多く残るほど、', 15], ['終わりが近いほど、', 15], ['機会費用は下がる', 15], null, ['π_i：価格', 14, C.muted], ['c_i：断ったときの費用', 14, C.muted]]);
    TZ.note(g2, '模式図（曲線の形は working paper の命題 1 の向きを示すだけ）');

    // ===== scene 3: multiple-day stays =====
    var g3 = S.g[2];
    var nights = ['月', '火', '水', '木', '金'], avail = [3, 1, 2, 4, 2];
    T(g3, 80, 100, '夜ごとの残りの部屋数', { 'font-size': 15, fill: C.muted });
    nights.forEach(function (n, k) {
      var x = 100 + k * 90;
      el('rect', { x: x, y: 120, width: 76, height: 70, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      T(g3, x + 38, 146, n, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      T(g3, x + 38, 176, String(avail[k]), { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    });
    S.req3 = el('g', {}, g3);
    el('rect', { x: 190, y: 220, width: 256, height: 44, rx: 8, fill: C.b, 'fill-opacity': 0.14, stroke: C.b, 'stroke-width': 2 }, S.req3);
    T(S.req3, 318, 248, '火〜木の 3 泊の申込み', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.t3 = T(g3, 80, 320, '3 泊ぶんの夜の機会費用の合計と、申込みの価値を比べる', { 'font-size': 16, fill: C.ink });
    S.t3b = T(g3, 80, 352, '火の夜は残り 1 室なので、そこが高くつく', { 'font-size': 16, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '出版版の拡張（要旨）', C.b, [['連泊の申込み、', 15], ['客室の種類と格下げ', 15], null, ['計算が重いので', 15, C.muted], ['ヒューリスティックと', 15, C.muted], ['上界を作る', 15, C.muted]]);
    TZ.note(g3, '模式図（出版版の本文は未読。考え方の例として解説者が描いた）');

    // ===== scene 4: HEUR1 vs HEUR4 relative to UB2 =====
    var g4 = S.g[3];
    var rows = [
      { label: '(20, 130) OB 186', a: 82.0, b: 100.0, la: 'HEUR4 82.0', lb: 'HEUR1 100.0' },
      { label: '(30, 200) OB 122', a: 94.8, b: 99.2, la: 'HEUR4 94.8', lb: 'HEUR1 99.2' },
      { label: '(40, 210) OB 108', a: 96.9, b: 98.7, la: 'HEUR4 96.9', lb: 'HEUR1 98.7' },
      { label: '(80, 220) OB 84', a: 99.8, b: 99.8, la: 'HEUR4 99.8', lb: 'HEUR1 99.8' }
    ];
    T(g4, 70, 64, '上界 UB2 に対する期待利益（%）、部屋数（スイート、標準）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, { x0: 250, x1: 760, v0: 75, v1: 100, y0: 100, rowH: 82, rows: rows, t0: 24.6, dt: 0.8, ticks: [75, 80, 85, 90, 95, 100] });
    TZ.note(g4, '1993 年の working paper の表 3（単泊、チリの中規模ホテル）。横軸は 75% から');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['最適な受付', 'しきい値の方策'], ['実データ（working paper）', '上界の 98.7% 以上']],
      venue: 'OPERATIONS RESEARCH 1995', title: ['An Application of Yield Management to the', 'Hotel Industry Considering Multiple Day Stays'], tsize: 28,
      sub: '連泊を考慮したホテル業への収益管理の応用', authors: ['Gabriel R. Bitran, Susana V. Mondschein'], url: 'doi.org/10.1287/opre.43.3.427'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.q1.forEach(function (q) { q.g.setAttribute('opacity', seg(t, q.t0, q.t0 + 0.4)); });
    S.full1.setAttribute('opacity', seg(t, 4.4, 5.0));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.curve2.setAttribute('opacity', seg(t, 8.6, 9.4));
    S.lev2.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 9.8 + i * 0.5, 10.3 + i * 0.5)); });
    S.rule2.setAttribute('opacity', seg(t, 11.6, 12.2));
    S.p2.setAttribute('opacity', seg(t, 12.4, 13.2));
    S.req3.setAttribute('opacity', seg(t, 17.0, 17.6));
    S.t3.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.t3b.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.p3.setAttribute('opacity', seg(t, 20.4, 21.2));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
