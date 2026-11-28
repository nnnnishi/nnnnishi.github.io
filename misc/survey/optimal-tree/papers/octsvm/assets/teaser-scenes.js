// =====================================================================
// teaser-scenes.js — Blanco, Japón & Puerto, "Robust Optimal Classification Trees
// under Noisy Labels" (ADAC 2022 / online first 2021; numbers from arXiv:2012.08560),
// unofficial explainer.
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scenes 1-3: schematics (labelled 模式図).
// Scene 4: Total Averages from Table 2 (8 UCI datasets x 4 noise levels).
// Colours: --a orange = label noise and baseline trees (CART, OCT, OCT-H);
//          --b blue   = proposed OCTSVM (margin-maximizing splits + relabeling).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '斜めの超平面で分ける <span class="A">OCT-H</span> は訓練誤りを 0 にできても、境界と点の距離を制御しない。',
    '訓練データに<span class="A">ラベルノイズ</span>が混ざると、通常の木は誤ったラベルに合わせて分岐を作ってしまい、未知データの精度が落ちる。',
    '<span class="B">OCTSVM</span> は各ノードで SVM のようにマージンを広げつつ、雑音とみられる訓練ラベルを同時に反転させる。',
    'UCI の 8 データ・ラベル反転率 0〜40% の全体平均で、<span class="B">OCTSVM は 77.02%</span> と既存 3 手法を上回った。',
    'マージン最大化とラベル反転を 1 つの最適化に統合すれば、ラベルノイズに強い最適分類木が得られる。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // Deterministic 2D schematic points inspired by paper Fig. 2 (illustrative only)
  var PTS_PLUS = [
    [165, 130], [215, 115], [260, 155], [190, 185], [285, 125], [320, 168],
    [225, 365], [275, 405], [185, 420]
  ];
  var PTS_MINUS = [
    [130, 255], [168, 295], [125, 335],
    [400, 310], [455, 275], [510, 315], [440, 375], [525, 395], [475, 430]
  ];
  // Two points whose labels are flipped in Scene 2 & detected in Scene 3
  var NOISY_IDX = [
    { x: 245, y: 195, trueCls: 1 },   // really +, flipped to -
    { x: 430, y: 335, trueCls: -1 }   // really -, flipped to +
  ];

  function drawPoint(parent, x, y, cls, r) {
    return el('circle', {
      cx: x, cy: y, r: r || 8,
      fill: cls === 1 ? C.ink : '#fff',
      stroke: C.ink, 'stroke-width': 2.2
    }, parent);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== Scene 1: OCT-H narrow margin (schematic) =====
    var g1 = S.g[0];
    el('rect', { x: 75, y: 78, width: 515, height: 390, rx: 10, fill: '#FAFBFD', stroke: C.hair }, g1);
    // Root split (orange) and two child splits passing very close to points
    S.s1Root = el('line', { x1: 85, y1: 358, x2: 580, y2: 200, stroke: C.a, 'stroke-width': 3 }, g1);
    S.s1Left = el('line', { x1: 115, y1: 88, x2: 225, y2: 313, stroke: C.ink, 'stroke-width': 2.2 }, g1);
    S.s1Right = el('line', { x1: 365, y1: 268, x2: 425, y2: 458, stroke: C.ink, 'stroke-width': 2.2 }, g1);
    // Highlight tight margin gap
    S.s1Gap1 = el('circle', { cx: 168, cy: 295, r: 22, fill: 'none', stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, g1);
    S.s1Gap2 = el('circle', { cx: 400, cy: 310, r: 22, fill: 'none', stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, g1);
    PTS_PLUS.forEach(function (p) { drawPoint(g1, p[0], p[1], 1); });
    PTS_MINUS.forEach(function (p) { drawPoint(g1, p[0], p[1], -1); });
    tx(g1, 95, 105, '● クラス +1　○ クラス −1', { 'font-size': 14, fill: C.muted });
    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 145, '従来の最適木（OCT-H）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    tx(S.p1, PX, 195, '誤分類の件数だけを見る', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    tx(S.p1, PX, 240, '境界すれすれに線が引かれ', { 'font-size': 15, fill: C.muted });
    tx(S.p1, PX, 266, '未知データで誤りやすい', { 'font-size': 15, fill: C.muted });
    tx(S.p1, PX, 326, 'マージンの制御なし', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(g1, 940, 520, '模式図（点の配置は解説者が置いた例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 2: Label noise misleads standard trees (schematic) =====
    var g2 = S.g[1];
    el('rect', { x: 75, y: 78, width: 515, height: 390, rx: 10, fill: '#FAFBFD', stroke: C.hair }, g2);
    PTS_PLUS.forEach(function (p) { drawPoint(g2, p[0], p[1], 1); });
    PTS_MINUS.forEach(function (p) { drawPoint(g2, p[0], p[1], -1); });
    // Distorted splits pulled toward noisy points
    S.s2Line1 = el('line', { x1: 85, y1: 358, x2: 580, y2: 200, stroke: C.a, 'stroke-width': 3 }, g2);
    S.s2Line2 = el('line', { x1: 230, y1: 88, x2: 280, y2: 295, stroke: C.a, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }, g2);
    S.s2Line3 = el('line', { x1: 395, y1: 259, x2: 490, y2: 458, stroke: C.a, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }, g2);
    // Noisy points that flip color
    S.n2 = NOISY_IDX.map(function (pt) {
      var ring = el('circle', { cx: pt.x, cy: pt.y, r: 19, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2.5 }, g2);
      var dot = drawPoint(g2, pt.x, pt.y, pt.trueCls, 8.5);
      var tag = tx(g2, pt.x + 24, pt.y + 5, '誤ラベル', { 'font-size': 14, 'font-weight': 600, fill: C.a });
      return { ring: ring, dot: dot, tag: tag, trueCls: pt.trueCls };
    });
    S.p2 = el('g', {}, g2);
    tx(S.p2, PX, 145, '訓練ラベルの反転', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    tx(S.p2, PX, 206, '最大 40%', { 'font-size': 42, 'font-weight': 700, fill: C.a });
    tx(S.p2, PX, 238, '実験で加えたラベルノイズ', { 'font-size': 15, fill: C.muted });
    tx(S.p2, PX, 300, '誤ラベルに合わせようと', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 326, '境界がゆがみ精度が落ちる', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 384, 'CART 全体平均 69.92%', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    tx(g2, 940, 520, '模式図（数値は論文 Table 2）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 3: OCTSVM widens margins + flips noisy labels =====
    var g3 = S.g[2];
    el('rect', { x: 75, y: 78, width: 515, height: 390, rx: 10, fill: '#FAFBFD', stroke: C.hair }, g3);
    // Margin band around root hyperplane (widens in render)
    S.mBand = el('polygon', { points: '85,370 580,150 580,150 85,370', fill: C.bsoft, opacity: 0.9 }, g3);
    S.s3Root = el('line', { x1: 85, y1: 375, x2: 580, y2: 145, stroke: C.b, 'stroke-width': 3.2 }, g3);
    S.s3Left = el('line', { x1: 120, y1: 88, x2: 318, y2: 267, stroke: C.b, 'stroke-width': 2.4 }, g3);
    S.s3Right = el('line', { x1: 318, y1: 267, x2: 408, y2: 458, stroke: C.b, 'stroke-width': 2.4 }, g3);
    PTS_PLUS.forEach(function (p) { drawPoint(g3, p[0], p[1], 1); });
    PTS_MINUS.forEach(function (p) { drawPoint(g3, p[0], p[1], -1); });
    S.n3 = NOISY_IDX.map(function (pt) {
      var ring = el('circle', { cx: pt.x, cy: pt.y, r: 19, fill: C.bsoft, stroke: C.b, 'stroke-width': 2.5 }, g3);
      var dot = drawPoint(g3, pt.x, pt.y, -pt.trueCls, 8.5);
      var tag = tx(g3, pt.x + 24, pt.y + 5, m('ξ') + ' = 1（反転）', { 'font-size': 14, 'font-weight': 600, fill: C.b });
      return { ring: ring, dot: dot, tag: tag, trueCls: pt.trueCls };
    });
    tx(g3, 95, 105, '各ノードで SVM 型分岐', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 130, 'OCTSVM の 4 つの項', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.t3 = [
      tx(S.p3, PX, 182, m('δ') + '　最小マージンを最大化', { 'font-size': 16, 'font-weight': 600, fill: C.b }),
      tx(S.p3, PX, 224, m('c') + '<tspan font-size="12" dy="4">1</tspan><tspan dy="-4"> Σ </tspan>' + m('e') + '　距離誤差', { 'font-size': 16, fill: C.ink }),
      tx(S.p3, PX, 266, m('c') + '<tspan font-size="12" dy="4">2</tspan><tspan dy="-4"> Σ </tspan>' + m('ξ') + '　ラベル反転', { 'font-size': 16, 'font-weight': 600, fill: C.b }),
      tx(S.p3, PX, 308, m('c') + '<tspan font-size="12" dy="4">3</tspan><tspan dy="-4"> Σ </tspan>' + m('d') + '　分岐の数', { 'font-size': 16, fill: C.ink })
    ];
    tx(S.p3, PX, 368, '1 つの混合整数二次錐', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 394, '最適化として同時に解く', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 4: Real results from Table 2 (Total Averages) =====
    var g4 = S.g[3];
    tx(g4, 75, 86, '8 データ × 4 ノイズ率の全体平均テスト精度（%）', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    var rows = [
      { name: 'CART',   val: 69.92, col: C.a },
      { name: 'OCT-H',  val: 72.44, col: C.a },
      { name: 'OCT',    val: 73.71, col: C.muted },
      { name: 'OCTSVM', val: 77.02, col: C.b }
    ];
    // Axis from 60% to 80%: x = 185 at 60%, 20 px per 1% -> x = 585 at 80%
    var BX = 185, SCALE = 20;
    [60, 65, 70, 75, 80].forEach(function (tk) {
      var x = BX + (tk - 60) * SCALE;
      el('line', { x1: x, x2: x, y1: 118, y2: 396, stroke: C.hair, 'stroke-width': 1 }, g4);
      tx(g4, x, 420, tk + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: BX, x2: BX, y1: 118, y2: 396, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.rows4 = rows.map(function (rw, i) {
      var y = 152 + i * 68, w = (rw.val - 60) * SCALE;
      tx(g4, BX - 16, y + 6, rw.name, {
        'font-size': 17, 'font-weight': rw.name === 'OCTSVM' ? 700 : 500,
        fill: rw.name === 'OCTSVM' ? C.b : C.ink, 'text-anchor': 'end'
      });
      var bar = el('rect', { x: BX, y: y - 18, width: 0, height: 36, rx: 5, fill: rw.col }, g4);
      var lab = tx(g4, BX + w + 12, y + 7, rw.val.toFixed(2) + '%', {
        'font-size': 17, 'font-weight': rw.name === 'OCTSVM' ? 700 : 600,
        fill: rw.name === 'OCTSVM' ? C.b : C.ink
      });
      return { bar: bar, lab: lab, w: w, t0: 25.0 + i * 0.65 };
    });
    tx(g4, BX, 456, '横軸は 60% から始まる（制限時間 30 秒）', { 'font-size': 14, fill: C.muted });
    S.p4 = el('g', {}, g4);
    tx(S.p4, PX, 145, 'OCTSVM の戦績', { 'font-size': 16, fill: C.muted });
    tx(S.p4, PX, 198, '25 / 32', { 'font-size': 42, 'font-weight': 700, fill: C.b });
    tx(S.p4, PX, 228, '条件で最高精度', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 294, '6 / 8', { 'font-size': 42, 'font-weight': 700, fill: C.b });
    tx(S.p4, PX, 324, 'データで平均首位', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 376, '0% ノイズ平均 82.44%', { 'font-size': 15, fill: C.muted });
    tx(g4, 940, 520, '論文 Table 2 と 4 節の数値（arXiv 版）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 5: Title card =====
    var g5 = S.g[4];
    tx(g5, 480, 138, 'ADVANCES IN DATA ANALYSIS AND CLASSIFICATION · 2022', {
      'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2
    });
    tx(g5, 480, 206, 'Robust Optimal Classification Trees', {
      'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle'
    });
    tx(g5, 480, 252, 'under Noisy Labels', {
      'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle'
    });
    tx(g5, 480, 298, 'ラベルノイズに頑健な最適分類木', {
      'font-size': 18, fill: C.muted, 'text-anchor': 'middle'
    });
    tx(g5, 480, 348, 'Víctor Blanco · Alberto Japón · Justo Puerto', {
      'font-size': 17, fill: C.ink, 'text-anchor': 'middle'
    });
    tx(g5, 480, 402, 'doi.org/10.1007/s11634-021-00467-2', {
      'font-size': 15, fill: C.muted, 'text-anchor': 'middle'
    });
    tx(g5, 480, 466, '非公式の解説（著者によるものではありません）', {
      'font-size': 14, fill: C.muted, 'text-anchor': 'middle'
    });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // Scene 1: highlight narrow margins
    var k1 = seg(t, 2.2, 3.6);
    S.s1Gap1.setAttribute('opacity', k1);
    S.s1Gap2.setAttribute('opacity', k1);
    S.p1.setAttribute('opacity', seg(t, 3.2, 4.2));

    // Scene 2: noisy labels flip and distort boundaries
    var k2 = seg(t, 9.6, 11.4);
    var bend = seg(t, 11.4, 13.0);
    S.n2.forEach(function (o) {
      var flipped = k2 > 0.5;
      var cls = flipped ? -o.trueCls : o.trueCls;
      o.dot.setAttribute('fill', cls === 1 ? C.ink : '#fff');
      o.ring.setAttribute('opacity', k2);
      o.tag.setAttribute('opacity', seg(t, 10.6, 11.4));
    });
    S.s2Line2.setAttribute('opacity', bend);
    S.s2Line3.setAttribute('opacity', bend);
    S.s2Line1.setAttribute('y2', 200 + 38 * bend);
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.6));

    // Scene 3: margin band widens + noisy labels flipped back (xi = 1)
    var mW = 34 * seg(t, 17.4, 19.6);
    S.mBand.setAttribute('points',
      '85,' + (375 - mW) + ' 580,' + (145 - mW) + ' 580,' + (145 + mW) + ' 85,' + (375 + mW));
    var f3 = seg(t, 19.6, 21.0);
    S.n3.forEach(function (o) {
      var cls = f3 > 0.5 ? o.trueCls : -o.trueCls;
      o.dot.setAttribute('fill', cls === 1 ? C.ink : '#fff');
      o.ring.setAttribute('opacity', f3);
      o.tag.setAttribute('opacity', seg(t, 20.2, 21.2));
    });
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    S.t3.forEach(function (elTx, idx) {
      elTx.setAttribute('opacity', seg(t, 17.6 + idx * 0.7, 18.2 + idx * 0.7));
    });

    // Scene 4: bar chart grows in order
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.7));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.45, o.t0 + 0.85));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({
    root: document.getElementById('teaser'),
    bounds: BOUNDS,
    captions: CAPTIONS,
    build: build,
    render: render,
    still: 31
  });
})();
