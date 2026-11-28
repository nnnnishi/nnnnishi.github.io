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
// teaser-scenes.js — Zhang, Cheung, Online Resource Allocation for Reusable Resources (arXiv 2212.02855v1).
// Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 evaluates the first term of Theorem 1,
// 1 - 3 sqrt(xi log(|I_c|/xi)), with |I_c| = 5 and xi = 1/c_min chosen by the explainer (labelled 解説者の計算).
// Colours: orange = resource usage (volume = amount x duration); blue = iMWU and its guarantee.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '客は未知の分布から 1 人ずつ来る。受け入れると、資源が<span class="A">一定期間ふさがる</span>。', en: '' },
    { ja: '空きは過去の割当で決まる。同じ判断でも、時点によって受け入れられるかが変わる。', en: '' },
    { ja: '<span class="B">iMWU</span> は倍々に延びる区間ごとに、前の区間のデータで重みを学び直す。', en: '' },
    { ja: '保証は最適値の (1 − 3√(ξ log(|I_c|/ξ))) 倍。在庫が大きいほど 1 に近づく。', en: '' },
    { ja: '分布を知らない確率的な客に再利用資源を配る問題で、ほぼ最適な方策を示した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: arrivals and D-period blocks =====
    var g1 = S.g[0];
    T(g1, 70, 70, '客の到着と、資源を占める期間', { 'font-size': 15, fill: C.muted });
    var X0 = 120, X1 = 600, NT = 12, cw = (X1 - X0) / NT;
    S.cust1 = [];
    var types = ['A', 'B', 'A', '−', 'C', 'B', 'A', '−', 'B', 'C', 'A', 'B'];
    types.forEach(function (ty, k) {
      var x = X0 + k * cw + cw / 2;
      var c = el('circle', { cx: x, cy: 120, r: 15, fill: ty === '−' ? C.panel : '#fff', stroke: C.ink, 'stroke-width': 1.4 }, g1);
      var tx = el('text', { x: x, y: 125, 'font-size': 14, 'text-anchor': 'middle', fill: C.ink }, g1); tx.textContent = ty;
      S.cust1.push({ c: c, t: tx, t0: 0.8 + k * 0.25 });
    });
    el('line', { x1: X0, x2: X1, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.4 }, g1);
    T(g1, X1 + 8, 405, '時点', { 'font-size': 14, fill: C.muted });
    var blocks = [[0, 3, 0], [1, 5, 1], [2, 3, 2], [4, 4, 0], [5, 6, 2], [8, 3, 1]];
    S.blk1 = blocks.map(function (b, i) {
      var y = 180 + b[2] * 60;
      var r = el('rect', { x: X0 + b[0] * cw + 2, y: y, width: 0, height: 40, rx: 4, fill: C.a, 'fill-opacity': 0.85 }, g1);
      var tx = el('text', { x: X0 + b[0] * cw + 10, y: y + 26, 'font-size': 14, fill: '#fff', 'font-weight': 600 }, g1); tx.textContent = 'D = ' + b[1];
      return { r: r, t: tx, w: b[1] * cw - 4, t0: 3.6 + i * 0.4 };
    });
    S.p1 = TZ.panel(g1, PX, 140, '再利用資源', C.a, [['受け入れた客は資源を', 16], ['D 期間ふさぐ', 16], null, ['報酬・使用量・利用時間は', 15, C.muted], ['確率的で、相関してよい', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: occupancy and capacity =====
    var g2 = S.g[1];
    T(g2, 70, 70, '利用中の量（資源 i）', { 'font-size': 15, fill: C.muted });
    var PX0 = 100, PX1 = 550, PY0 = 380, sy = 240 / 10;
    el('line', { x1: PX0, x2: PX1, y1: PY0, y2: PY0, stroke: C.ink, 'stroke-width': 1.4 }, g2);
    el('line', { x1: PX0, x2: PX0, y1: PY0, y2: 120, stroke: C.ink, 'stroke-width': 1.4 }, g2);
    el('line', { x1: PX0, x2: PX1, y1: PY0 - 10 * sy, y2: PY0 - 10 * sy, stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, g2);
    T(g2, PX1 + 6, PY0 - 10 * sy + 5, '在庫 c', { 'font-size': 14, fill: C.ink });
    el('line', { x1: PX0, x2: PX1, y1: PY0 - 8 * sy, y2: PY0 - 8 * sy, stroke: C.b, 'stroke-width': 1.6, 'stroke-dasharray': '3 4' }, g2);
    T(g2, PX1 + 6, PY0 - 8 * sy + 5, 'c − a_max', { 'font-size': 14, fill: C.b });
    var occ = [2, 4, 5, 7, 8, 8, 6, 5, 7, 8, 6, 4, 3, 5, 7, 8, 7, 5, 4, 3];
    var d = occ.map(function (v, k) { return (k ? 'L' : 'M') + (PX0 + k * (PX1 - PX0) / (occ.length - 1)) + ' ' + (PY0 - v * sy); }).join(' ');
    S.path2 = el('path', { d: d, fill: 'none', stroke: C.a, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g2);
    S.len2 = 1400;
    S.path2.setAttribute('stroke-dasharray', S.len2);
    S.p2 = TZ.panel(g2, PX, 140, '構造的な非定常性', C.ink, [['空きは、誰をいつ受け入れ', 15], ['いつ戻るかで決まる', 15], null, ['c − a_max を超える割当は', 15, C.b], ['断り、制約を必ず守る', 15, C.b]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: doubling phases =====
    var g3 = S.g[2];
    T(g3, 70, 80, '期間を倍々に延ばす', { 'font-size': 15, fill: C.muted });
    var lens = [1, 1, 2, 4, 8], tot = 16, QX0 = 80, QX1 = 600, acc = 0;
    S.ph3 = lens.map(function (L, q) {
      var x = QX0 + acc / tot * (QX1 - QX0), w = L / tot * (QX1 - QX0);
      acc += L;
      var gg = el('g', {}, g3);
      el('rect', { x: x + 1, y: 130, width: w - 2, height: 50, rx: 6, fill: q === 0 ? C.panel : C.bsoft, stroke: C.b, 'stroke-width': 1.4 }, gg);
      if (w > 60) T(gg, x + w / 2, 161, q === 0 ? '準備' : '区間 ' + (q - 1), { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
      return { g: gg, x: x, w: w, t0: 16.6 + q * 0.5 };
    });
    T(g3, QX0, 112, '準備（長さ d_max）', { 'font-size': 14, fill: C.muted });
    S.ex3 = el('g', {}, g3);
    var ex = S.ph3[3], prev = S.ph3[2];
    el('rect', { x: prev.x + 1, y: 210, width: prev.w / 2 - 2, height: 30, rx: 4, fill: C.b, 'fill-opacity': 0.25 }, S.ex3);
    el('rect', { x: prev.x + prev.w / 2 + 1, y: 210, width: prev.w / 2 - 2, height: 30, rx: 4, fill: C.b, 'fill-opacity': 0.5 }, S.ex3);
    T(S.ex3, 80, 280, '前の区間の前半：乗法重み更新で重み (φ, ψ) を学ぶ', { 'font-size': 15, fill: C.ink });
    T(S.ex3, 80, 310, '前の区間の後半：客の割合から最適値を推定する', { 'font-size': 15, fill: C.ink });
    T(S.ex3, 80, 350, '今の区間：重みを 1 組引き、報酬 − ψ·体積 が最大の行動を選ぶ', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    el('path', { d: 'M' + (prev.x + prev.w / 2) + ' 244 Q ' + (ex.x + 40) + ' 260 ' + (ex.x + ex.w / 2) + ' 184', fill: 'none', stroke: C.b, 'stroke-width': 2 }, S.ex3);
    S.p3 = TZ.panel(g3, PX, 140, 'iMWU', C.b, [['分布 p も期間 T も', 15], ['知らなくてよい', 15], null, ['体積 = 使用量 × 利用時間', 15, C.a], ['長く使う割当ほど', 15, C.muted], ['重く数える', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: size of the guarantee =====
    var g4 = S.g[3];
    T(g4, 70, 70, '保証の第 1 項 1 − 3√(ξ log(5/ξ))（ξ = 1/c_min）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 300, x1: 820, v0: 0, v1: 1, y0: 110, rowH: 70, t0: 24.6, dt: 0.8, ticks: [0, 0.25, 0.5, 0.75, 1],
      rows: [
        { label: 'c_min = 100', b: 0.252, lb: '0.25' },
        { label: 'c_min = 1,000', b: 0.723, lb: '0.72' },
        { label: 'c_min = 10,000', b: 0.901, lb: '0.90' },
        { label: 'c_min = 100,000', b: 0.966, lb: '0.97' }
      ]
    });
    TZ.note(g4, '解説者の計算（|I_c| = 5、a_max = 1）。論文の数値ではない');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['保証', '(1 − ε) × 最適値'], ['必要な情報', '分布も T も不要']],
      venue: 'ARXIV 2022', title: ['Online Resource Allocation', 'for Reusable Resources'], tsize: 32,
      sub: '再利用資源のオンライン配分',
      authors: ['Xilin Zhang, Wang Chi Cheung'], url: 'arxiv.org/abs/2212.02855'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.cust1.forEach(function (c) { var v = seg(t, c.t0, c.t0 + 0.3); c.c.setAttribute('opacity', v); c.t.setAttribute('opacity', v); });
    S.blk1.forEach(function (b) {
      b.r.setAttribute('width', b.w * seg(t, b.t0, b.t0 + 0.7));
      b.t.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.8));
    });
    S.p1.setAttribute('opacity', seg(t, 5.6, 6.4));
    S.path2.setAttribute('stroke-dashoffset', S.len2 * (1 - seg(t, 8.6, 12.0)));
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    S.ph3.forEach(function (p) { p.g.setAttribute('opacity', seg(t, p.t0, p.t0 + 0.4)); });
    S.ex3.setAttribute('opacity', seg(t, 19.4, 20.2));
    S.p3.setAttribute('opacity', seg(t, 18.6, 19.4));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
