// =====================================================================
// teaser-scenes.js — MegaFon Uplift Competition Dataset, unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.MEGAFON_STATS (assets/megafon_stats.js), which the explainer computed
// from the official train.csv (600,000 rows). Captions repeat a few of those numbers as text.
// Scene 1: assignment (1 dot = 1% of subscribers). Scene 2: feature balance (50 standardized mean differences).
// Scene 3: conversion rate by group. Scene 4: decile effects of X_16. Scene 5: budget illustration + title card.
// Colours: blue = conversion / positive effect (light tint = control, full = treated);
//          orange = negative effect; assignment and balance in ink and grey.
// =====================================================================
(function () {
  var ST = window.MEGAFON_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var G = ST.groups, O = ST.overall, A = ST.ate, F = ST.features;
  var BS = '#BFD0F6', BUD = ST.heterogeneity.budget_illustration_x16;

  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }
  function sp(x, d) { return (x < 0 ? '−' : '+') + Math.abs(100 * x).toFixed(d); }

  var X16 = F.X_16.decile_effect;
  var CAPTIONS = [
    { ja: 'MegaFon が 2021 年のコンペで配った合成データで、60 万人を処置群と対照群に半分ずつ分けている。', en: '' },
    { ja: '50 個の特徴量の平均は 2 群でほぼ同じで、無作為に割り付けたときのようにそろっている。', en: '' },
    { ja: '処置群の<span class="B">購入率</span>は 22.89% で、対照群の 17.94% より 4.95 pt 高い。', en: '' },
    { ja: '効果は特徴量によって大きく変わり、X_16 の両端の 1 割ずつでは処置で<span class="A">購入率が下がる</span>。', en: '' },
    { ja: 'X_16 の両端の 2 割を外して 8 割に配ると、全員に配るより増える購入が多い（全件での集計）。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 100 dots, 1 dot = 1% of subscribers =====
    var g1 = S.g[0], nT = Math.round(100 * O.treatment_rate);
    T(g1, 70, 70, '1 点 = 加入者の 1%', { 'font-size': 16, fill: C.muted });
    S.dots1 = [];
    for (var i = 0; i < 100; i++) {
      var col = i % 20, row = Math.floor(i / 20);
      S.dots1.push(el('circle', { cx: 90 + col * 25, cy: 130 + row * 44, r: 9, fill: i < nT ? C.ink : '#fff', stroke: i < nT ? C.ink : C.muted, 'stroke-width': 2 }, g1));
    }
    S.lab1 = el('g', {}, g1);
    T(S.lab1, 90, 375, '処置群（コミュニケーションあり）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(S.lab1, 590, 375, '対照群（なし）', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'end' });
    T(S.lab1, 90, 430, '実データに似せて作った合成データ。', { 'font-size': 16, fill: C.ink });
    T(S.lab1, 90, 456, '生成の方法と処置の中身は公開されていない。', { 'font-size': 16, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '行数', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(O.rows), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 196, '処置群 ' + fmt(G.treated.n), { 'font-size': 17, fill: C.ink });
    T(p1, PX, 222, '（' + p(O.treatment_rate, 2) + '%）', { 'font-size': 17, fill: C.ink });
    T(p1, PX, 260, '対照群 ' + fmt(G.control.n), { 'font-size': 17, fill: C.muted });
    T(p1, PX, 286, '（' + p(1 - O.treatment_rate, 2) + '%）', { 'font-size': 17, fill: C.muted });
    T(p1, PX, 336, '特徴量 50 個（匿名化）', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 362, '結果は購入の 0/1', { 'font-size': 16, fill: C.ink });

    // ===== scene 2: standardized mean differences of the 50 features =====
    var g2 = S.g[1], X0 = 90, X1 = 590, LIM = 0.01, Y2 = 250;
    function xs(v) { return X0 + (X1 - X0) * (v + LIM) / (2 * LIM); }
    T(g2, X0, 70, '標準化平均差（処置群 − 対照群）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(g2, X0, 96, '1 点 = 特徴量 1 個', { 'font-size': 15, fill: C.muted });
    [-0.01, -0.005, 0, 0.005, 0.01].forEach(function (v) {
      el('line', { x1: xs(v), x2: xs(v), y1: 140, y2: 360, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g2);
      T(g2, xs(v), 388, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(3), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    var vals = Object.keys(F).map(function (k) { return F[k].smd; }).sort(function (a, b) { return a - b; });
    var placed = [];
    S.dots2 = vals.map(function (v) {
      var cx = xs(v), lvl = 0;
      while (placed.some(function (q) { return Math.abs(q[0] - cx) < 15 && q[1] === lvl; })) lvl++;
      placed.push([cx, lvl]);
      var cy = Y2 + (lvl % 2 ? -1 : 1) * Math.ceil(lvl / 2) * 15;
      return el('circle', { cx: cx, cy: cy, r: 6.5, fill: C.ink, 'fill-opacity': 0.8 }, g2);
    });
    T(g2, X0, 440, '観察データでよく使う目安の 0.1 は、', { 'font-size': 16, fill: C.ink });
    T(g2, X0, 466, 'この図の右端（+0.01）の 10 倍外にある。', { 'font-size': 16, fill: C.ink });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, '最大の絶対値', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 150, ST.balance.max_abs_smd.toFixed(4), { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 206, '処置群の割合', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 240, p(O.treatment_rate, 2) + '%', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 296, '割付の方法は非公開。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 322, '2 群の差で効果を', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 348, '偏りなく推定できる。', { 'font-size': 16, fill: C.ink });

    // ===== scene 3: conversion rate by group =====
    var g3 = S.g[2], Y0 = 420, HM = 300, TOP = 0.25;
    T(g3, 70, 62, '購入率（conversion）', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach(function (v) {
      var y = Y0 - HM * v / TOP;
      el('line', { x1: 140, x2: 560, y1: y, y2: y, stroke: C.hair }, g3);
      T(g3, 128, y + 5, (100 * v).toFixed(0) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    S.b3 = [['対照群', G.control, BS], ['処置群', G.treated, C.b]].map(function (r, i) {
      var v = r[1].conversion_rate, h = HM * v / TOP, x = 200 + i * 200;
      var b = { full: h, rect: el('rect', { x: x, y: Y0, width: 110, height: 0, fill: r[2] }, g3) };
      b.lab = T(g3, x + 55, Y0 - h - 14, p(v, 2) + '%', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(g3, x + 55, Y0 + 30, r[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      return b;
    });
    el('line', { x1: 140, x2: 560, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, '処置群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 152, '+' + p(A.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p3, PX, 190, '標準誤差 ' + p(A.se, 2) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 240, '対照群に対して', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 276, '+' + p(A.relative_lift, 1) + '%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    T(p3, PX, 330, '購入 ' + fmt(O.conversions) + ' 人', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 356, '（全体の ' + p(O.conversion_rate, 2) + '%）', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: decile effects of X_16 =====
    var g4 = S.g[3], YT = 120, YB = 400, VMIN = -0.07, VMAX = 0.11, XL = 130, W4 = 450;
    function y4(v) { return YB - (YB - YT) * (v - VMIN) / (VMAX - VMIN); }
    T(g4, 70, 62, 'X_16 の十分位ごとの効果（購入率の差）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [-0.05, 0, 0.05, 0.1].forEach(function (v) {
      el('line', { x1: XL, x2: XL + W4, y1: y4(v), y2: y4(v), stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      T(g4, XL - 10, y4(v) + 5, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(100 * v).toFixed(0) + ' pt', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    var bw = W4 / 10;
    S.b4 = X16.map(function (u, i) {
      var cx = XL + bw * i + bw / 2;
      return { u: u, cx: cx, rect: el('rect', { x: cx - bw * 0.36, y: y4(0), width: bw * 0.72, height: 0, fill: u < 0 ? C.a : C.b }, g4) };
    });
    S.y4 = y4;
    T(g4, XL + bw / 2, YB + 30, '1', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    T(g4, XL + W4 - bw / 2, YB + 30, '10', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    T(g4, XL + W4 / 2, YB + 30, '十分位（X_16 が小 → 大）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.neg4 = el('g', {}, g4);
    T(S.neg4, XL + bw / 2, y4(X16[0]) + 26, sp(X16[0], 1), { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    T(S.neg4, XL + W4 - bw / 2, y4(X16[9]) + 26, sp(X16[9], 1), { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    var imax = X16.indexOf(Math.max.apply(null, X16));
    T(S.neg4, XL + bw * imax + bw / 2, y4(X16[imax]) - 12, sp(X16[imax], 1), { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p4 = S.p4 = el('g', {}, g4);
    var rc = F.X_16.decile_rate_control, rt = F.X_16.decile_rate_treated;
    T(p4, PX, 112, '両端の 1 割の効果', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 150, sp(X16[0], 1) + ' / ' + sp(X16[9], 1) + ' pt', { 'font-size': 28, 'font-weight': 650, fill: C.a });
    T(p4, PX, 206, '対照群の購入率', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 238, p(Math.min.apply(null, rc), 1) + '〜' + p(Math.max.apply(null, rc), 1) + '%', { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    T(p4, PX, 280, '処置群の購入率', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 312, p(Math.min.apply(null, rt), 1) + '〜' + p(Math.max.apply(null, rt), 1) + '%', { 'font-size': 22, 'font-weight': 600, fill: C.b });
    T(p4, PX, 362, '変わるのは処置群だけ。', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 388, '50 個中 ' + ST.heterogeneity.n_features_significant_0_001 + ' 個で層ごとに', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 414, '効果がはっきり違う。', { 'font-size': 16, fill: C.ink });

    // ===== scene 5: budget illustration, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    var Y5 = 400, HM5 = 230, TOP5 = 40000;
    T(u, 70, 62, '増える購入（X_16 の十分位の推定値から、全件で集計）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 10000, 20000, 30000, 40000].forEach(function (v) {
      var y = Y5 - HM5 * v / TOP5;
      el('line', { x1: 140, x2: 560, y1: y, y2: y, stroke: C.hair }, u);
      T(u, 128, y + 5, (v / 10000).toFixed(0) + ' 万', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    S.b5 = [['全員に配る', '100%', BUD.gain_treat_all], ['両端の 2 割を外す', p(BUD.share_treated_middle8, 0) + '%', BUD.gain_treat_middle8]].map(function (r, i) {
      var h = HM5 * r[2] / TOP5, x = 200 + i * 200;
      var b = { full: h, rect: el('rect', { x: x, y: Y5, width: 110, height: 0, fill: i ? C.b : BS }, u) };
      b.lab = T(u, x + 55, Y5 - h - 14, fmt(r[2]) + ' 人', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + 55, Y5 + 30, r[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + 55, Y5 + 54, '配る人 ' + r[1], { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      return b;
    });
    el('line', { x1: 140, x2: 560, y1: Y5, y2: Y5, stroke: C.ink, 'stroke-width': 1.5 }, u);
    var p5 = S.p5 = el('g', {}, u);
    T(p5, PX, 112, '配った 1 人あたりの増分', { 'font-size': 15, fill: C.muted });
    T(p5, PX, 150, p(BUD.gain_per_treated_all, 2) + ' → ' + p(BUD.gain_per_treated_middle8, 2) + ' pt', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    T(p5, PX, 206, '学習と評価を分けていない', { 'font-size': 16, fill: C.ink });
    T(p5, PX, 232, '記述統計で、モデルの', { 'font-size': 16, fill: C.ink });
    T(p5, PX, 258, '性能ではない。', { 'font-size': 16, fill: C.ink });
    T(p5, PX, 310, 'コストや金額の列はない。', { 'font-size': 16, fill: C.muted });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · MEGAFON / ODS.AI';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'MegaFon Uplift Competition Dataset';
    T(tc, 480, 290, 'MegaFon のアップリフトのコンペのデータセット', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'MegaFon, Data Fest 2021 · 600,000 rows · synthetic';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'ods.ai/tracks/df21-megafon/competitions/megafon-df21-comp';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.dots1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.4 + i * 0.025, 0.7 + i * 0.025)); });
    S.lab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: dots drop in one by one
    S.dots2.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 8.8 + i * 0.05, 9.1 + i * 0.05)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    // scene 3: bars grow
    S.b3.forEach(function (b, i) {
      var k = seg(t, 17 + i * 0.7, 17.8 + i * 0.7), h = b.full * k;
      b.rect.setAttribute('height', h); b.rect.setAttribute('y', 420 - h);
      b.lab.setAttribute('opacity', seg(t, 17.6 + i * 0.7, 18 + i * 0.7));
    });
    S.p3.setAttribute('opacity', seg(t, 19, 19.8));
    // scene 4: decile bars grow from zero (up or down)
    S.b4.forEach(function (b, i) {
      var k = seg(t, 25 + i * 0.15, 25.8 + i * 0.15), y0 = S.y4(0), y1 = S.y4(b.u * k);
      b.rect.setAttribute('y', Math.min(y0, y1)); b.rect.setAttribute('height', Math.abs(y1 - y0));
    });
    S.neg4.setAttribute('opacity', seg(t, 27.2, 27.8));
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
    // scene 5: budget bars, then the title card
    S.b5.forEach(function (b, i) {
      var k = seg(t, 32.8 + i * 0.8, 33.6 + i * 0.8), h = b.full * k;
      b.rect.setAttribute('height', h); b.rect.setAttribute('y', 400 - h);
      b.lab.setAttribute('opacity', seg(t, 33.4 + i * 0.8, 33.8 + i * 0.8));
    });
    S.p5.setAttribute('opacity', seg(t, 34.4, 35));
    S.use5.setAttribute('opacity', 1 - seg(t, 36.8, 37.4));
    S.title5.setAttribute('opacity', seg(t, 37.2, 37.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 28.5 });
})();
