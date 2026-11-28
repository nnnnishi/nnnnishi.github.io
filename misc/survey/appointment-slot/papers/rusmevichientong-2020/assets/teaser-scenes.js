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
// Based on the publisher's PDF (Articles in Advance). Scenes 1-3 are schematics (labelled 模式図).
// Scene 4 uses the "Average" row of Table 1 (% gain of RO over each benchmark).
// Colours: orange = the exact DP / the benchmarks; blue = the paper's policies.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '顧客は提示された品揃えから 1 つを選び、ランダムな時間使ってから返す。', en: '' },
    { ja: '<span class="A">動的計画法でそのまま解く</span>には、手元の数と、何期使われているかごとの使用中の数を状態に持つ必要がある。', en: '' },
    { ja: '<span class="B">在庫 1 単位ずつの価値</span>を後ろ向きに計算し、それを機会費用として品揃えを選ぶ。', en: '' },
    { ja: '買い切りの品揃えの実験で、ロールアウトの方策は近視眼的な方策より平均 16.9% 収益が高かった。', en: '' },
    { ja: '利用時間のある資源の受付を、顧客が選ぶ品揃えの問題に広げ、最適の半分以上を保証した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function item(g, x, y, label, color, filled) {
    var gg = el('g', {}, g);
    el('rect', { x: x, y: y, width: 64, height: 44, rx: 8, fill: filled ? color : '#fff', stroke: color, 'stroke-width': 1.8 }, gg);
    T(gg, x + 32, y + 28, label, { 'font-size': 15, 'font-weight': 600, fill: filled ? '#fff' : color, 'text-anchor': 'middle' });
    return gg;
  }
  function box(g, x, y, w, h, title, sub, color, fill) {
    var gg = el('g', {}, g);
    el('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: fill || '#fff', stroke: color, 'stroke-width': 1.8 }, gg);
    T(gg, x + w / 2, y + 26, title, { 'font-size': 15, 'font-weight': 600, fill: color, 'text-anchor': 'middle' });
    if (sub) T(gg, x + w / 2, y + 48, sub, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
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
    S.p1 = TZ.panel(g1, PX, 140, '再利用される商品', C.ink, [['計算資源、服のレンタル、', 16], ['路上駐車', 16], null, ['最初に r、使用中は', 15, C.muted], ['毎期 π を払う', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: high-dimensional state =====
    var g2 = S.g[1];
    T(g2, 90, 110, '商品 i の状態（ℓ = 使われた期数）', { 'font-size': 15, fill: C.muted });
    var labs = ['q_i,0 手元', 'q_i,1', 'q_i,2', 'q_i,3', '…'], vals = ['2', '1', '0', '2', ''];
    S.s2 = labs.map(function (l, k) {
      var gg = el('g', {}, g2), x = 90 + k * 96;
      el('rect', { x: x, y: 130, width: 86, height: 70, rx: 10, fill: k === 0 ? C.bsoft : '#fff', stroke: C.a, 'stroke-width': 1.8 }, gg);
      T(gg, x + 43, 156, l, { 'font-size': 14, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
      T(gg, x + 43, 186, vals[k], { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 650 });
      return gg;
    });
    S.r2 = T(g2, 90, 250, 'ℓ 期使われた単位は確率 ρ_i,ℓ で次の期に返る', { 'font-size': 16, fill: C.ink });
    S.big2 = T(g2, 90, 330, '状態の数は商品数 n と期数 T について指数的に増える', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '厳密な動的計画法', C.a, [['毎期、在庫を見て', 15], ['提示する品揃えを選ぶ', 15], null, ['T 期の期待収益の', 15, C.muted], ['合計を最大にする', 15, C.muted]]);
    TZ.note(g2, '模式図（数は解説者が置いた例）');

    // ===== scene 3: per-unit values =====
    var g3 = S.g[2];
    S.u3 = [
      box(g3, 70, 120, 140, 64, '手元の 1 単位', '価値 ν₀', C.b, C.bsoft),
      box(g3, 270, 120, 140, 64, 'ℓ 期使用中', '価値 ν_ℓ', C.ink)
    ];
    S.ar3 = el('g', {}, g3);
    el('path', { d: 'M210 140 H266', stroke: C.b, 'stroke-width': 2, fill: 'none' }, S.ar3);
    T(S.ar3, 238, 130, 'φ/C', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    el('path', { d: 'M340 184 C 340 230, 140 230, 140 188', stroke: C.muted, 'stroke-width': 1.6, fill: 'none' }, S.ar3);
    T(S.ar3, 240, 240, '確率 ρ_ℓ で返る', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.f3 = T(g3, 70, 300, '収益を r + π − (1−ρ₀)(ν₀ − ν₁) とみなして', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.f3b = T(g3, 70, 330, '期待収益が最大の品揃えを提示する（貪欲な方策）', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.f3c = T(g3, 70, 390, 'さらに、静的な方策へのロールアウトで在庫の量も見る', { 'font-size': 16, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '在庫 1 単位の価値', C.b, [['期 T から後ろ向きに', 15], ['計算する', 15], null, ['貪欲な方策もロールアウトも', 14, C.muted], ['最適の 50% 以上を保証', 14, C.muted]]);
    TZ.note(g3, '模式図（論文の式 (5)(6) を簡略化）');

    // ===== scene 4: Table 1 averages =====
    var g4 = S.g[3];
    T(g4, 70, 64, 'ロールアウト（RO）の収益が各方法より何 % 高いか（論文 Table 1 の平均）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 300, X1 = 820, VMAX = 20;
    function sx(v) { return X0 + v / VMAX * (X1 - X0); }
    [0, 5, 10, 15, 20].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 90, y2: 446, stroke: C.hair, 'stroke-width': 1 }, g4);
      T(g4, sx(v), 468, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: X0, x2: X0, y1: 90, y2: 446, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var rows = [['貪欲な方策 GR', 2.0], ['入札価格 BP', 4.7], ['LP の品揃え OS', 1.5], ['分解 DC', 0.0], ['近視眼的 MY', 16.9], ['在庫で割引 IB', 10.4]];
    S.bars4 = rows.map(function (r, i) {
      var y = 100 + i * 58;
      T(g4, X0 - 14, y + 28, r[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y + 8, width: 0, height: 30, fill: C.a, 'fill-opacity': 0.85 }, g4);
      var lab = el('text', { x: sx(r[1]) + 8, y: y + 29, 'font-size': 15, 'font-weight': 600, fill: C.a }, g4);
      lab.textContent = '+' + r[1].toFixed(1) + '%';
      return { rect: rect, lab: lab, w: sx(r[1]) - X0, t0: 24.6 + i * 0.6 };
    });
    TZ.note(g4, '買い切り（利用時間が無限）の 12 問題の平均。論文 Table 1 から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['性能保証', '最適の 50% 以上'], ['シアトルの駐車場', '固定価格より +4.3%']],
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
    S.s2.forEach(function (s, i) { s.setAttribute('opacity', seg(t, 8.6 + i * 0.4, 9.0 + i * 0.4)); });
    S.r2.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.big2.setAttribute('opacity', seg(t, 11.8, 12.4));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.u3.forEach(function (u, i) { u.setAttribute('opacity', seg(t, 16.8 + i * 0.6, 17.3 + i * 0.6)); });
    S.ar3.setAttribute('opacity', seg(t, 18.0, 18.6));
    S.f3.setAttribute('opacity', seg(t, 19.0, 19.6));
    S.f3b.setAttribute('opacity', seg(t, 19.0, 19.6));
    S.f3c.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.p3.setAttribute('opacity', seg(t, 20.8, 21.6));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
