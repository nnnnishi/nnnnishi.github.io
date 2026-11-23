// =====================================================================
// teaser-scenes.js — Criteo Uplift Prediction Dataset v2.1, unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.CRITEO_STATS (assets/criteo_stats.js), which the explainer computed
// from the full v2.1 file (13,979,592 rows). Captions repeat a few of those numbers as text.
// Scene 1: assignment (1 dot = 1% of users). Scene 2: exposure within each group.
// Scene 3: visit rate by group. Scene 4: conversion rate by group. Scene 5: budget usage + title card.
// Colours: orange = visit (read as the cost), blue = conversion (read as the revenue);
//          light tint = control group, full colour = treated group; treatment / exposure in ink and grey.
// =====================================================================
(function () {
  var ST = window.CRITEO_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var G = ST.groups, O = ST.overall, A = ST.ate;
  var AS = '#F3C9AE', BS = '#BFD0F6', DARK = '#4B5563';

  function fmt(n) { return n.toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }

  var CAPTIONS = [
    { ja: '複数の広告主の RCT をまとめた 1,398 万人分のデータで、85% を広告の対象に割り当てている。', en: '' },
    { ja: '広告が実際に表示されたのは処置群の 3.6% だけで、対照群では 0 人なので、効果は割り当てで比べる。', en: '' },
    { ja: '広告の対象にすると、<span class="A">訪問率</span>は 3.82% から 4.85% に上がる。', en: '' },
    { ja: '<span class="B">購入</span>は全体の 0.29% しかなく、対照群の購入は 4,063 件である。', en: '' },
    { ja: '予算制約つきの論文では<span class="A">訪問</span>をコスト、<span class="B">購入</span>を売上とみなして使う。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 100 dots, 1 dot = 1% of users =====
    var g1 = S.g[0], nT = Math.round(100 * O.treatment_rate);
    T(g1, 70, 70, '1 点 = ユーザーの 1%', { 'font-size': 16, fill: C.muted });
    S.dots1 = [];
    for (var i = 0; i < 100; i++) {
      var col = i % 20, row = Math.floor(i / 20);
      var d = el('circle', { cx: 90 + col * 25, cy: 130 + row * 44, r: 9, fill: i < nT ? C.ink : '#fff', stroke: i < nT ? C.ink : C.muted, 'stroke-width': 2 }, g1);
      S.dots1.push(d);
    }
    S.lab1 = el('g', {}, g1);
    T(S.lab1, 90, 375, '処置群（広告の対象）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(S.lab1, 590, 375, '対照群（広告なし）', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'end' });
    T(S.lab1, 90, 430, '割り当ては広告主ごとの無作為抽選。', { 'font-size': 16, fill: C.ink });
    T(S.lab1, 90, 456, '全ての試験を同じ処置率で抜き出して合わせた。', { 'font-size': 16, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '行数', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(O.rows), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 196, '処置群 ' + fmt(G.treated.n), { 'font-size': 17, fill: C.ink });
    T(p1, PX, 222, '（' + p(O.treatment_rate, 1) + '%）', { 'font-size': 17, fill: C.ink });
    T(p1, PX, 260, '対照群 ' + fmt(G.control.n), { 'font-size': 17, fill: C.muted });
    T(p1, PX, 286, '（' + p(1 - O.treatment_rate, 1) + '%）', { 'font-size': 17, fill: C.muted });
    T(p1, PX, 336, '特徴量 12 個（匿名化）', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 362, '結果は訪問と購入の 0/1', { 'font-size': 16, fill: C.ink });

    // ===== scene 2: exposure within each group (bars = 100% of each group) =====
    var g2 = S.g[1], X2 = 90, W2 = 500;
    T(g2, X2, 70, '各群の中で、広告が実際に表示された人の割合', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(g2, X2, 140, '処置群', { 'font-size': 17, fill: C.ink });
    el('rect', { x: X2, y: 154, width: W2, height: 54, rx: 4, fill: C.gray }, g2);
    S.exp2 = el('rect', { x: X2, y: 154, width: 0, height: 54, rx: 2, fill: DARK }, g2);
    S.exp2w = W2 * G.treated.exposure_rate;
    S.lab2 = T(g2, X2 + W2 * G.treated.exposure_rate + 10, 238, '表示あり ' + p(G.treated.exposure_rate, 1) + '%', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    el('line', { x1: X2 + W2 * G.treated.exposure_rate / 2, x2: X2 + W2 * G.treated.exposure_rate / 2, y1: 210, y2: 232, stroke: DARK, 'stroke-width': 2 }, S.lab2);
    T(g2, X2, 300, '対照群', { 'font-size': 17, fill: C.muted });
    el('rect', { x: X2, y: 314, width: W2, height: 54, rx: 4, fill: '#EEF0F3', stroke: C.gray }, g2);
    S.lab2c = T(g2, X2 + 12, 348, '表示あり 0 人', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    el('line', { x1: X2, x2: X2 + W2, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    [0, 50, 100].forEach(function (v) { T(g2, X2 + W2 * v / 100, 424, v + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }); });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, '処置群で表示あり', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 148, fmt(G.treated.exposed) + ' 人', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 178, '／ ' + fmt(G.treated.n) + ' 人', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 226, '対照群で表示あり', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 262, G.control.exposed + ' 人', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 318, '無作為なのは treatment だけ。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 344, '表示の有無で比べると', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 370, '無作為化が崩れる。', { 'font-size': 16, fill: C.ink });

    // ===== scenes 3 and 4: rates by group =====
    function bars(g, title, key, top, ticks, dec, c0, c1) {
      var Y0 = 420, HM = 300, o = { bars: [] };
      T(g, 70, 62, title, { 'font-size': 17, 'font-weight': 600, fill: c1 });
      ticks.forEach(function (v) {
        var y = Y0 - HM * v / top;
        el('line', { x1: 140, x2: 560, y1: y, y2: y, stroke: C.hair }, g);
        T(g, 128, y + 5, (100 * v).toFixed(dec > 2 ? 1 : 0) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
      });
      [['対照群', G.control, c0], ['処置群', G.treated, c1]].forEach(function (r, i) {
        var v = r[1][key], h = HM * v / top, x = 200 + i * 200;
        var b = { full: h, rect: el('rect', { x: x, y: Y0, width: 110, height: 0, fill: r[2] }, g) };
        b.lab = T(g, x + 55, Y0 - h - 14, p(v, dec) + '%', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
        T(g, x + 55, Y0 + 30, r[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
        o.bars.push(b);
      });
      el('line', { x1: 140, x2: 560, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
      o.Y0 = Y0;
      return o;
    }
    var g3 = S.g[2];
    S.b3 = bars(g3, '訪問率（visit）', 'visit_rate', 0.06, [0, 0.02, 0.04, 0.06], 2, AS, C.a);
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, '処置群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 152, '+' + p(A.visit.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    T(p3, PX, 190, '標準誤差 ' + p(A.visit.se, 3) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 240, '対照群に対して', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 276, '+' + p(A.visit.relative_lift, 1) + '%', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    T(p3, PX, 330, '訪問 ' + fmt(O.visits) + ' 件', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 356, '（全体の ' + p(O.visit_rate, 2) + '%）', { 'font-size': 16, fill: C.ink });

    var g4 = S.g[3];
    S.b4 = bars(g4, '購入率（conversion）', 'conversion_rate', 0.004, [0, 0.001, 0.002, 0.003, 0.004], 3, BS, C.b);
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 112, '処置群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 152, '+' + p(A.conversion.diff, 3) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p4, PX, 190, '相対的には +' + p(A.conversion.relative_lift, 1) + '%', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 240, '購入の件数', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 276, '処置群 ' + fmt(G.treated.conversions), { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    T(p4, PX, 308, '対照群 ' + fmt(G.control.conversions), { 'font-size': 20, 'font-weight': 600, fill: C.b });
    T(p4, PX, 356, '訪問した人のうち購入は', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 382, p(O.conversion_given_visit, 1) + '%', { 'font-size': 16, fill: C.ink });

    // ===== scene 5: budget usage, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    function box(x, w, c, soft, a, b, cc) {
      el('rect', { x: x, y: 120, width: w, height: 150, rx: 12, fill: soft }, u);
      T(u, x + w / 2, 168, a, { 'font-size': 20, 'font-weight': 650, fill: c, 'text-anchor': 'middle' });
      T(u, x + w / 2, 212, b, { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + w / 2, 248, cc, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    }
    box(90, 340, C.a, '#FCEBDF', '訪問の増加', '→ コスト', '+' + p(A.visit.diff, 2) + ' pt');
    box(530, 340, C.b, C.bsoft, '購入の増加', '→ 売上', '+' + p(A.conversion.diff, 3) + ' pt');
    T(u, 480, 330, '費用対効果の高い人から配る順に並べて評価する（DRP、DFCL、rDRP など）', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 372, 'データ全体では、購入の差は訪問の差の ' + A.conversion_per_visit.toFixed(3) + ' 倍', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 420, '売上額や配信費用の列はない', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · CRITEO AI LAB';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Criteo Uplift Prediction Dataset v2.1';
    T(tc, 480, 290, 'Criteo のアップリフト予測データセット', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Diemert et al., AdKDD 2018 / arXiv 2111.10106 · CC BY-NC-SA 4.0';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'ailab.criteo.com/criteo-uplift-prediction-dataset';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots appear in order, then labels and numbers
    S.dots1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.4 + i * 0.025, 0.7 + i * 0.025)); });
    S.lab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: the exposed slice grows, then the labels
    S.exp2.setAttribute('width', S.exp2w * seg(t, 9.2, 10.4));
    S.lab2.setAttribute('opacity', seg(t, 10.4, 11));
    S.lab2c.setAttribute('opacity', seg(t, 11.4, 12));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scenes 3-4: bars grow
    [[S.b3, 17], [S.b4, 25]].forEach(function (q) {
      q[0].bars.forEach(function (b, i) {
        var k = seg(t, q[1] + i * 0.7, q[1] + 0.8 + i * 0.7), h = b.full * k;
        b.rect.setAttribute('height', h); b.rect.setAttribute('y', q[0].Y0 - h);
        b.lab.setAttribute('opacity', seg(t, q[1] + 0.6 + i * 0.7, q[1] + 1 + i * 0.7));
      });
    });
    S.p3.setAttribute('opacity', seg(t, 19, 19.8));
    S.p4.setAttribute('opacity', seg(t, 27, 27.8));
    // scene 5: usage, then the title card
    S.use5.setAttribute('opacity', 1 - seg(t, 36.2, 36.8));
    S.title5.setAttribute('opacity', seg(t, 36.6, 37.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 28 });
})();
