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
// teaser-scenes.js — Rusmevichientong, Sumida & Topaloglu, Dynamic Assortment Optimization for Reusable
// Products with Random Usage Durations (Management Science 2020). Unofficial explainer.
// Based on the abstract only (the full text was not read). Scenes 1-3 are schematics (labelled 模式図);
// scene 4 shows only the guarantees stated in the abstract.
// Colours: orange = the exact DP and its high-dimensional state; blue = the tractable policies.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '顧客は提示された品揃えから 1 つを選び、ランダムな時間使ってから返す。', en: '' },
    { ja: '<span class="A">動的計画法でそのまま解く</span>には、手元の在庫と使用中の商品をすべて状態に持つ必要がある。', en: '' },
    { ja: '<span class="B">価値関数の線形近似</span>から計算できる方策を作り、特別な利用時間ではロールアウトで改善する。', en: '' },
    { ja: 'どちらの方策も最適な期待収益の 50% 以上を保証する。', en: '' },
    { ja: '利用時間のある資源の受付を、顧客が選ぶ品揃えの問題に広げた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function item(g, x, y, label, color, filled) {
    var gg = el('g', {}, g);
    el('rect', { x: x, y: y, width: 64, height: 44, rx: 8, fill: filled ? color : '#fff', stroke: color, 'stroke-width': 1.8 }, gg);
    T(gg, x + 32, y + 28, label, { 'font-size': 15, 'font-weight': 600, fill: filled ? '#fff' : color, 'text-anchor': 'middle' });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: choose, use, return =====
    var g1 = S.g[0];
    el('circle', { cx: 110, cy: 260, r: 30, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
    T(g1, 110, 266, '顧客', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    T(g1, 190, 150, '提示する品揃え', { 'font-size': 15, fill: C.muted });
    S.a1 = ['A', 'B', 'C'].map(function (n, k) { return item(g1, 190 + k * 80, 170, n, C.ink, false); });
    S.ch1 = el('g', {}, g1);
    el('rect', { x: 266, y: 166, width: 72, height: 52, rx: 10, fill: 'none', stroke: C.b, 'stroke-width': 3 }, S.ch1);
    T(S.ch1, 302, 240, '選ぶ', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
    S.use1 = el('g', {}, g1);
    el('line', { x1: 190, x2: 560, y1: 340, y2: 340, stroke: C.hair, 'stroke-width': 1.5 }, S.use1);
    el('rect', { x: 230, y: 320, width: 220, height: 40, rx: 6, fill: C.gray }, S.use1);
    T(S.use1, 340, 346, 'B を使用中（ランダムな時間）', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    T(S.use1, 470, 346, '→ 返す', { 'font-size': 15, fill: C.ink, 'font-weight': 600 });
    S.p1 = TZ.panel(g1, PX, 140, '再利用される商品', C.ink, [['レンタル品、', 16], ['駐車場の区画', 16], null, ['返るまで、ほかの顧客に', 15, C.muted], ['貸せる在庫が減る', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: high-dimensional state =====
    var g2 = S.g[1];
    T(g2, 90, 110, '状態に持つもの', { 'font-size': 15, fill: C.muted });
    S.s2 = [['手元の在庫', 'A：2　B：0　C：1'], ['使用中の商品', 'A：1　B：3　C：2'], ['（戻るまでの経過も）', '利用時間の分布しだい']].map(function (r, k) {
      var gg = el('g', {}, g2), y = 130 + k * 80;
      el('rect', { x: 90, y: y, width: 470, height: 58, rx: 10, fill: '#fff', stroke: C.a, 'stroke-width': 1.8 }, gg);
      T(gg, 110, y + 36, r[0], { 'font-size': 16, 'font-weight': 600, fill: C.a });
      T(gg, 300, y + 36, r[1], { 'font-size': 16, fill: C.ink });
      return gg;
    });
    S.big2 = T(g2, 90, 420, '商品が増えると状態の次元が高くなり、計算できない', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '厳密な動的計画法', C.a, [['顧客ごとに見せる', 15], ['品揃えを決める', 15], null, ['有限の販売期間の', 15, C.muted], ['期待収益を最大にする', 15, C.muted]]);
    TZ.note(g2, '模式図（数値は解説者が置いた例。3 行目は解説者の補足）');

    // ===== scene 3: approximations =====
    var g3 = S.g[2];
    S.m3 = [
      ['価値関数の線形近似', '最適な価値関数を線形関数で近似して方策を作る', C.b],
      ['静的な方策へのロールアウト', '利用時間が無限か負の二項分布のとき', C.b]
    ].map(function (r, k) {
      var gg = el('g', {}, g3), y = 130 + k * 130;
      el('rect', { x: 90, y: y, width: 480, height: 96, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.8 }, gg);
      T(gg, 114, y + 40, r[0], { 'font-size': 18, 'font-weight': 650, fill: C.b });
      T(gg, 114, y + 72, r[1], { 'font-size': 15, fill: C.ink });
      return gg;
    });
    S.p3 = TZ.panel(g3, PX, 140, '計算できる方策', C.b, [['ロールアウトは、', 15], ['分離可能な非線形の', 15], ['価値関数の近似に当たる', 15], null, ['近似の具体的な形は', 14, C.muted], ['本文を未読のため省略', 14, C.muted]]);
    TZ.note(g3, '模式図（要旨にもとづく）');

    // ===== scene 4: guarantees =====
    var g4 = S.g[3];
    T(g4, 70, 64, '要旨が示す保証', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c4 = [
      ['線形近似の方策', '最適な期待収益の 50% 以上'],
      ['ロールアウト（無限・負の二項分布）', '最適な期待収益の 50% 以上'],
      ['ロールアウトの変種（無限）', '最小在庫 C_min の立方根に応じて最適に近づく']
    ].map(function (r, k) {
      var gg = el('g', {}, g4), y = 100 + k * 110;
      el('rect', { x: 70, y: y, width: 820, height: 86, rx: 12, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, gg);
      T(gg, 96, y + 36, r[0], { 'font-size': 16, fill: C.muted });
      T(gg, 96, y + 68, r[1], { 'font-size': 22, 'font-weight': 650, fill: C.b });
      return gg;
    });
    S.n4 = T(g4, 70, 452, '実験（合成データ、シアトルの駐車場の取引データ）では保証より大きく良い性能', { 'font-size': 16, fill: C.ink });
    TZ.note(g4, '要旨の記述から（本文の数値は未確認）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['線形近似の方策', '最適の 50% 以上'], ['実データ', 'シアトルの駐車場']],
      venue: 'MANAGEMENT SCIENCE 2020', title: ['Dynamic Assortment Optimization for Reusable', 'Products with Random Usage Durations'], tsize: 29,
      sub: '利用時間がランダムな再利用商品の動的な品揃え', authors: ['Paat Rusmevichientong, Mika Sumida, Huseyin Topaloglu'], url: 'doi.org/10.1287/mnsc.2019.3346'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.a1.forEach(function (a, i) { a.setAttribute('opacity', seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4)); });
    S.ch1.setAttribute('opacity', seg(t, 2.6, 3.2));
    S.use1.setAttribute('opacity', seg(t, 3.8, 4.4));
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.s2.forEach(function (s, i) { s.setAttribute('opacity', seg(t, 8.6 + i * 0.8, 9.1 + i * 0.8)); });
    S.big2.setAttribute('opacity', seg(t, 11.2, 11.8));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    S.m3.forEach(function (m, i) { m.setAttribute('opacity', seg(t, 16.8 + i * 1.4, 17.4 + i * 1.4)); });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.c4.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 24.6 + i * 1.0, 25.2 + i * 1.0)); });
    S.n4.setAttribute('opacity', seg(t, 27.8, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
