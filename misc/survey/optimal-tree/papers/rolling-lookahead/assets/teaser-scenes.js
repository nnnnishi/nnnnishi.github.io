// =====================================================================
// teaser-scenes.js — Organ, Kayış, Khaniyev, Rolling Lookahead Learning for
// Optimal Classification Trees (IISE Transactions 2026 / arXiv:2304.10830).
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scene 1: schematic of the two extremes (myopic CART vs global MIO).
// Scene 2: [OCT-2] O(p^2) partial enumeration (p=100 example in Sec. 2) & TU -> LP optimum.
// Scene 3: RST rolling step following Fig. 3 (Node 1 split revised x5 -> x8).
// Scene 4: Real numbers from Sec. 5.4 (808/591/585 of 1,330) & Table 4 (time at depth 2 & 8).
// Scene 5: Takeaway + title card.
// Colours: orange = existing extremes (CART / BendersOCT); blue = OCT-2 / RST / HybridRST.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '決定木の学習は 1 ステップ先しか見ない<span class="A">貪欲法</span>と、木全体を一度に解く<span class="A">大域最適法</span>の両極端に分かれてきた。',
    '<span class="B">提案の深さ 2 モデル [OCT-2]</span> は葉の損失を事前計算し、完全単模な制約行列により LP 緩和だけで厳密解を得る。',
    '<span class="B">ローリング部分木（RST）</span>は誤分類が残る葉の親から深さ 2 の最適化を繰り返し、前の分岐も見直しながら深い木を作る。',
    '1,330 問の実験で <span class="B">HybridRST</span> は 808 問で最良のテスト精度（同率首位を含む）を出し、深さ 8 の計算時間も平均 107.2 秒に抑えた。',
    '2 ステップ先読みと深さに応じた損失関数の切替えにより、貪欲法と大域最適法の間のつり合いのよい精度と速度を得る。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 670;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two extremes (myopic vs global MIO) =====
    var g1 = S.g[0];
    // Left box: CART (1-step)
    tx(g1, 200, 88, '貪欲法（CART）', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 200, 114, '1 ステップ先読み × 多数回', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var c1Nodes = [[200, 166], [136, 246], [264, 246], [104, 326], [168, 326], [232, 326], [296, 326]];
    var c1Edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    c1Edges.forEach(function (e) {
      el('line', { x1: c1Nodes[e[0]][0], y1: c1Nodes[e[0]][1], x2: c1Nodes[e[1]][0], y2: c1Nodes[e[1]][1], stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    S.s1Win = el('rect', { x: 112, y: 138, width: 176, height: 132, rx: 12, fill: '#FCEBDF', 'fill-opacity': 0.65, stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }, g1);
    c1Nodes.forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 16, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    tx(g1, 200, 392, '速いが近視眼的', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 200, 418, '先の段への影響を見ない', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    // Right box: Global MIO
    tx(g1, 480, 88, '大域最適法（MIO）', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 480, 114, m('D') + ' ステップ全体を一度に解く', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var m1Nodes = [[480, 166], [416, 246], [544, 246], [384, 326], [448, 326], [512, 326], [576, 326]];
    S.s1Big = el('rect', { x: 356, y: 138, width: 248, height: 218, rx: 14, fill: '#FCEBDF', 'fill-opacity': 0.65, stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }, g1);
    c1Edges.forEach(function (e) {
      el('line', { x1: m1Nodes[e[0]][0], y1: m1Nodes[e[0]][1], x2: m1Nodes[e[1]][0], y2: m1Nodes[e[1]][1], stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    m1Nodes.forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 16, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    tx(g1, 480, 392, '深い木で計算時間が急増', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 480, 418, '先読み過多で過学習も起きやすい', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 146, '既存の 2 つの極端', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p1, PX, 194, '貪欲法は 1 段先しか見ず、', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 222, '木全体の精度を落としやすい。', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 272, '大域最適 MIO は深さが増すと', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 300, '制限時間内に解けなくなる。', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 356, '→ その中間の「2 ステップ', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    tx(S.p1, PX, 384, '　 先読み」をねらう', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: [OCT-2] partial enumeration + TU -> LP optimum =====
    var g2 = S.g[1];
    tx(g2, 80, 86, '深さ 2 の最適木 [OCT-2]：部分列挙 ＋ LP 最適化', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    // Comparison bars for p = 100
    S.s2a = el('g', {}, g2);
    el('rect', { x: 80, y: 112, width: 520, height: 64, rx: 10, fill: '#FCEBDF' }, S.s2a);
    tx(S.s2a, 100, 140, '総当たり ' + m('O') + '(' + m('p') + '<tspan dy="-6" font-size="12">3</tspan><tspan dy="6">)（</tspan>' + m('p') + ' = 100）', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    tx(S.s2a, 580, 152, '1,000,000 回', { 'font-size': 22, 'font-weight': 700, fill: C.a, 'text-anchor': 'end' });

    S.s2b = el('g', {}, g2);
    el('rect', { x: 80, y: 190, width: 520, height: 64, rx: 10, fill: C.bsoft }, S.s2b);
    tx(S.s2b, 100, 218, '葉ルールの部分列挙 ' + m('O') + '(' + m('p') + '<tspan dy="-6" font-size="12">2</tspan><tspan dy="6">)</tspan>', { 'font-size': 15, fill: C.b, 'font-weight': 600 });
    tx(S.s2b, 580, 230, '40,000 回', { 'font-size': 22, 'font-weight': 700, fill: C.b, 'text-anchor': 'end' });

    // Depth-2 matching diagram
    S.s2c = el('g', {}, g2);
    el('rect', { x: 80, y: 274, width: 520, height: 186, rx: 12, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, S.s2c);
    var t2p = [[340, 316], [230, 376], [450, 376], [175, 430], [285, 430], [395, 430], [505, 430]];
    [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(function (e) {
      el('line', { x1: t2p[e[0]][0], y1: t2p[e[0]][1], x2: t2p[e[1]][0], y2: t2p[e[1]][1], stroke: C.ink, 'stroke-width': 1.8 }, S.s2c);
    });
    t2p.forEach(function (p, i) {
      el('circle', { cx: p[0], cy: p[1], r: i === 0 ? 18 : 14, fill: i === 0 ? C.bsoft : '#fff', stroke: i === 0 ? C.b : C.ink, 'stroke-width': i === 0 ? 2.4 : 1.6 }, S.s2c);
    });
    tx(S.s2c, 340, 322, m('j'), { 'font-size': 17, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(S.s2c, 230, 382, m('k'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    tx(S.s2c, 450, 382, m('l'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    tx(S.s2c, 150, 324, '左：' + m('z') + '<tspan dy="3" font-size="11">' + m('jk') + '</tspan><tspan dy="-7" font-size="11">(1)</tspan>', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(S.s2c, 470, 324, '右：' + m('z') + '<tspan dy="3" font-size="11">' + m('jl') + '</tspan><tspan dy="-7" font-size="11">(2)</tspan>', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(S.s2c, 340, 444, '根の特徴量 ' + m('j') + ' を一致させる', { 'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });

    S.p2 = el('g', {}, g2);
    el('rect', { x: PX, y: 112, width: 256, height: 74, rx: 12, fill: C.bsoft }, S.p2);
    tx(S.p2, PX + 128, 144, '制約行列が完全単模', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(S.p2, PX + 128, 170, 'LP 緩和 ＝ 整数最適解', { 'font-size': 17, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(S.p2, PX, 232, '・モデル規模はデータ数 ' + m('n') + ' に', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX + 16, 256, '依存しない', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 300, '・損失の非線形性を事前計算に', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX + 16, 324, '移すため、ジニ不純度など', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX + 16, 348, '任意の損失関数が使える', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 396, '・5 万行のデータでも 2 分未満', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    tx(S.p2, PX + 16, 420, '（BendersOCT は 30 分後も未収束）', { 'font-size': 14, fill: C.muted });
    tx(g2, 940, 520, '論文 第 1.3 節・第 2 節（命題 1・2）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: RST rolling step (paper Fig. 3) =====
    var g3 = S.g[2];
    tx(g3, 80, 72, 'ローリング部分木（RST）：親ノードから深さ 2 を解き直す', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    // Fixed upper & right subtree
    var r0 = [360, 128], n1 = [245, 210], n2 = [475, 210], l5 = [420, 304], l6 = [530, 304];
    [[r0, n1], [r0, n2], [n2, l5], [n2, l6]].forEach(function (e) {
      el('line', { x1: e[0][0], y1: e[0][1], x2: e[1][0], y2: e[1][1], stroke: C.ink, 'stroke-width': 2.2 }, g3);
    });
    tx(g3, 286, 162, m('x') + '<tspan dy="3" font-size="11">3</tspan><tspan dy="-3"> = 1</tspan>', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    tx(g3, 444, 258, m('x') + '<tspan dy="3" font-size="11">1</tspan><tspan dy="-3"> = 1</tspan>', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });

    // Old leaves 3 & 4 (fade out when rolled)
    S.oldSub = el('g', {}, g3);
    var l3 = [175, 304], l4 = [315, 304];
    el('line', { x1: n1[0], y1: n1[1], x2: l3[0], y2: l3[1], stroke: C.ink, 'stroke-width': 2.2 }, S.oldSub);
    el('line', { x1: n1[0], y1: n1[1], x2: l4[0], y2: l4[1], stroke: C.ink, 'stroke-width': 2.2 }, S.oldSub);
    tx(S.oldSub, 198, 258, m('x') + '<tspan dy="3" font-size="11">5</tspan><tspan dy="-3"> = 1</tspan>', { 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    el('circle', { cx: l3[0], cy: l3[1], r: 22, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2.6 }, S.oldSub);
    el('circle', { cx: l4[0], cy: l4[1], r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, S.oldSub);
    tx(S.oldSub, l3[0], l3[1] + 6, '3', { 'font-size': 16, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    tx(S.oldSub, l4[0], l4[1] + 6, '4', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.cut3 = el('line', { x1: 132, y1: 266, x2: 356, y2: 266, stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '9 6' }, S.oldSub);
    tx(S.oldSub, l3[0], 350, '誤分類あり', { 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });

    // New depth-2 subtree rolled at Node 1
    S.newSub = el('g', {}, g3);
    el('rect', { x: 72, y: 176, width: 324, height: 280, rx: 14, fill: C.bsoft, 'fill-opacity': 0.55, stroke: C.b, 'stroke-width': 2.2, 'stroke-dasharray': '7 4' }, S.newSub);
    var n3p = [175, 310], n4p = [315, 310];
    var l7 = [132, 412], l8 = [218, 412], l9 = [272, 412], l10 = [358, 412];
    [[n1, n3p], [n1, n4p], [n3p, l7], [n3p, l8], [n4p, l9], [n4p, l10]].forEach(function (e) {
      el('line', { x1: e[0][0], y1: e[0][1], x2: e[1][0], y2: e[1][1], stroke: C.b, 'stroke-width': 2.4 }, S.newSub);
    });
    tx(S.newSub, 204, 258, m('x') + '<tspan dy="3" font-size="11">8</tspan><tspan dy="-3"> = 1（更新）</tspan>', { 'font-size': 15, 'font-weight': 700, fill: C.b, 'text-anchor': 'end' });
    tx(S.newSub, 146, 366, m('x') + '<tspan dy="3" font-size="11">6</tspan><tspan dy="-3"> = 1</tspan>', { 'font-size': 14, fill: C.b, 'text-anchor': 'end' });
    tx(S.newSub, 286, 366, m('x') + '<tspan dy="3" font-size="11">5</tspan><tspan dy="-3"> = 1</tspan>', { 'font-size': 14, fill: C.b, 'text-anchor': 'end' });
    [[n3p, "3'"], [n4p, "4'"], [l7, '7'], [l8, '8'], [l9, '9'], [l10, '10']].forEach(function (item) {
      el('circle', { cx: item[0][0], cy: item[0][1], r: 20, fill: '#fff', stroke: C.b, 'stroke-width': 2.2 }, S.newSub);
      tx(S.newSub, item[0][0], item[0][1] + 6, item[1], { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });

    // Top nodes drawn on top
    [[r0, '0', false], [n1, '1', true], [n2, '2', false], [l5, '5', false], [l6, '6', false]].forEach(function (item) {
      el('circle', { cx: item[0][0], cy: item[0][1], r: 22, fill: item[2] ? C.bsoft : '#fff', stroke: item[2] ? C.b : C.ink, 'stroke-width': item[2] ? 2.6 : 2 }, g3);
      tx(g3, item[0][0], item[0][1] + 6, item[1], { 'font-size': 16, 'font-weight': 650, fill: item[2] ? C.b : C.ink, 'text-anchor': 'middle' });
    });

    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 126, 'RST の手順', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.s3a = tx(S.p3, PX, 176, '① 根から深さ 2 の木を解く', { 'font-size': 16, fill: C.ink });
    S.s3b = tx(S.p3, PX, 222, '② 誤分類のある葉 3 を発見', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    S.s3c = tx(S.p3, PX, 268, '③ 親ノード 1 の葉を捨てて', { 'font-size': 16, fill: C.b, 'font-weight': 650 });
    S.s3d = tx(S.p3, PX + 22, 294, '深さ 2 を解き直す', { 'font-size': 16, fill: C.b, 'font-weight': 650 });
    S.s3e = tx(S.p3, PX, 348, '分岐が ' + m('x') + '<tspan dy="3" font-size="11">5</tspan><tspan dy="-3"> → </tspan>' + m('x') + '<tspan dy="3" font-size="11">8</tspan><tspan dy="-3"> に更新</tspan>', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.s3f = tx(S.p3, PX, 390, '貪欲法と違い前の段も見直せる', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '論文 Fig. 3 にならった模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: real results (Sec 5.4 & Table 4) =====
    var g4 = S.g[3];
    // Top chart: best out-of-sample count out of 1,330
    tx(g4, 74, 82, 'テスト精度が最良だった問題数（1,330 問中、同率首位を含む）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    var BX = 216, BW = 340;
    var accBars = [
      ['HybridRST', 808, 124, C.b, '808 問'],
      ['BendersOCT', 591, 168, C.a, '591 問'],
      ['CART-G', 585, 212, C.muted, '585 問']
    ];
    S.bars4a = accBars.map(function (b, i) {
      tx(g4, BX - 14, b[2] + 6, b[0], { 'font-size': 16, 'font-weight': b[3] === C.b ? 650 : 500, fill: b[3] === C.muted ? C.ink : b[3], 'text-anchor': 'end' });
      var w = BW * b[1] / 1000;
      var r = el('rect', { x: BX, y: b[2] - 14, width: 0, height: 28, rx: 4, fill: b[3] }, g4);
      var lab = tx(g4, BX + w + 10, b[2] + 6, b[4], { 'font-size': 16, 'font-weight': 650, fill: b[3] });
      return { r: r, lab: lab, w: w, t0: 24.6 + i * 0.45 };
    });

    // Bottom chart: average computation time (Table 4)
    tx(g4, 74, 286, '平均計算時間（秒、論文 Table 4）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    var timeBars = [
      ['深さ 2：BendersOCT', 357.2, 326, C.a, '357.2 秒'],
      ['深さ 2：HybridRST', 9.7, 362, C.b, '9.7 秒'],
      ['深さ 8：BendersOCT', 1643.5, 412, C.a, '1,643.5 秒'],
      ['深さ 8：HybridRST', 107.2, 448, C.b, '107.2 秒']
    ];
    S.bars4b = timeBars.map(function (b, i) {
      tx(g4, BX + 24, b[2] + 5, b[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
      var w = Math.max(5, 290 * b[1] / 1800);
      var r = el('rect', { x: BX + 36, y: b[2] - 12, width: 0, height: 24, rx: 4, fill: b[3] }, g4);
      var lab = tx(g4, BX + 36 + w + 10, b[2] + 5, b[4], { 'font-size': 15, 'font-weight': 650, fill: b[3] });
      return { r: r, lab: lab, w: w, t0: 26.2 + i * 0.45 };
    });

    S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 108, width: 256, height: 118, rx: 12, fill: C.bsoft }, S.p4);
    tx(S.p4, PX + 18, 140, 'テスト精度の最大改善', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(S.p4, PX + 18, 174, 'BendersOCT 比 +23.6%', { 'font-size': 17, 'font-weight': 700, fill: C.b });
    tx(S.p4, PX + 18, 206, 'CART-G 比 +14.4%', { 'font-size': 17, 'font-weight': 700, fill: C.b });

    tx(S.p4, PX, 274, '最良値との平均差', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    tx(S.p4, PX, 304, 'HybridRST：0.8%（±1.2%）', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(S.p4, PX, 330, 'CART-G：1.5%（±2.8%）', { 'font-size': 15, fill: C.muted });
    tx(S.p4, PX, 356, 'BendersOCT：5.2%（±6.6%）', { 'font-size': 15, fill: C.a });
    tx(S.p4, PX, 408, '深さ 5 以下は誤分類（RST-M）、', { 'font-size': 14, fill: C.muted });
    tx(S.p4, PX, 430, '深さ 6 以上はジニ不純度（RST-G）', { 'font-size': 14, fill: C.muted });
    tx(g4, 940, 520, '論文 第 5.4 節・表 4 の数値から作図（19 データ）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 130, y: 46, width: 320, height: 64, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 290, 74, '深さ 2 の最適木 [OCT-2]', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 290, 98, '完全単模 → LP で整数最適', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 320, height: 64, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 670, 74, '19 データ・1,330 問', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 670, 98, 'HybridRST が 808 問で最良', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.2 }, g5).textContent = 'IISE TRANSACTIONS 2026 · ARXIV:2304.10830';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Rolling Lookahead Learning for';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Classification Trees';
    tx(g5, 480, 306, 'ローリング先読みによる最適分類木の学習', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 356, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zeynel Batuhan Organ, Enis Kayış, Taghi Khaniyev';
    el('text', { x: 480, y: 406, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1080/24725854.2026.2613786';
    tx(g5, 480, 468, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: window jumps between CART's nodes while MIO box pulses in
    var step1 = Math.floor((t - 1.0) / 1.8) % 3;
    if (step1 <= 0) {
      S.s1Win.setAttribute('x', 112); S.s1Win.setAttribute('y', 138); S.s1Win.setAttribute('width', 176); S.s1Win.setAttribute('height', 132);
    } else if (step1 === 1) {
      S.s1Win.setAttribute('x', 82); S.s1Win.setAttribute('y', 222); S.s1Win.setAttribute('width', 108); S.s1Win.setAttribute('height', 128);
    } else {
      S.s1Win.setAttribute('x', 210); S.s1Win.setAttribute('y', 222); S.s1Win.setAttribute('width', 108); S.s1Win.setAttribute('height', 128);
    }
    S.s1Big.setAttribute('opacity', seg(t, 1.4, 2.2));
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));

    // scene 2
    S.s2a.setAttribute('opacity', seg(t, 8.6, 9.3));
    S.s2b.setAttribute('opacity', seg(t, 9.6, 10.3));
    S.s2c.setAttribute('opacity', seg(t, 10.6, 11.4));
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));

    // scene 3: old leaves visible first, dashed cut appears, then fades into new rolled subtree
    var roll = seg(t, 19.6, 20.5);
    S.oldSub.setAttribute('opacity', 1 - roll);
    S.cut3.setAttribute('opacity', seg(t, 18.2, 18.8));
    S.newSub.setAttribute('opacity', roll);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.s3a.setAttribute('opacity', seg(t, 16.8, 17.3));
    S.s3b.setAttribute('opacity', seg(t, 17.8, 18.4));
    S.s3c.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.s3d.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.s3e.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.s3f.setAttribute('opacity', seg(t, 21.0, 21.6));

    // scene 4
    S.bars4a.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 0.8);
      b.r.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.bars4b.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 0.8);
      b.r.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
