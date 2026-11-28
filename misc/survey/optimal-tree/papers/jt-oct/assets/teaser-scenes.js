// =====================================================================
// teaser-scenes.js — Tu & Fan, An Exact Junction-Tree Extended Formulation for
// Optimal Classification Trees (arXiv:2609.24741), unofficial explainer.
// Player: teaser-engine.js (copied unchanged from template).
// Scene 1: schematic of the two scaling bottlenecks (MIP with n; unreduced LP with F^D).
// Scene 2: depth-3 tree template and its junction-tree chain (Figure 1).
// Scene 3: exact reductions on Table 3 totals (114,898,476 -> 714,854 -> 328,079 columns;
//          388,023 -> 1,226 equalities).
// Scene 4: benchmark results across 88 settings (Table 2 & Section 5.2: 85/88 vs 77/88,
//          21.79x GM speedup over STreeD, depth-5 runtimes).
// Scene 5: takeaway + title card.
// Colours: orange = earlier exact formulations & baselines; blue = JT-OCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '<span class="A">従来の混合整数最適化</span>はデータ数で規模が膨らみ、厳密探索も深さが増すと組合せが急増する。',
    '<span class="B">JT-LP</span> は葉のペアと祖先経路をクラスタにまとめ、分離集合の一致制約だけで厳密な凸包を作る。',
    '<span class="B">署名圧縮・部分木縮約・端点消去</span>の 3 つの縮約で、最適値を保ったまま列数を 160 分の 1 以下に減らす。',
    '88 設定で <span class="B">JT-CG</span> は 85 設定の最適性を証明し、<span class="A">STreeD</span> との共通 77 設定で幾何平均 21.79 倍速かった。',
    '厳密な LP 凸包と並列な部分木評価により、大規模データや深さ 5 の最適分類木まで厳密に解ける範囲を広げた。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: scaling bottlenecks (schematic) =====
    var g1 = S.g[0];
    // Top box: MIO grows with n
    el('rect', { x: 64, y: 74, width: 520, height: 164, rx: 12, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, g1);
    tx(g1, 88, 108, '従来の混合整数最適化（例：BendersOCT）', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    tx(g1, 88, 138, 'データ数 ' + m('n') + ' が増えるほど変数・制約が増大', { 'font-size': 15, fill: C.ink });
    S.s1barA = el('rect', { x: 88, y: 158, width: 0, height: 26, rx: 4, fill: C.a }, g1);
    S.s1labA = tx(g1, 88, 214, '最大 786,363 行のベンチマーク：88 設定中 2 設定のみ証明', { 'font-size': 15, 'font-weight': 600, fill: C.a });

    // Bottom box: Naive configuration LP grows as 2^(D-1) F^D
    el('rect', { x: 64, y: 274, width: 520, height: 164, rx: 12, fill: '#F2F4F7', stroke: C.gray, 'stroke-width': 2 }, g1);
    tx(g1, 88, 308, '未縮約の組合せ定式化（LP-base）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    tx(g1, 88, 338, '列数が 2<tspan baseline-shift="super" font-size="11">D−1</tspan>' + m('F') + '<tspan baseline-shift="super" font-size="11">D</tspan> で指数的に膨張', { 'font-size': 15, fill: C.ink });
    S.s1barB = el('rect', { x: 88, y: 358, width: 0, height: 26, rx: 4, fill: C.a }, g1);
    S.s1labB = tx(g1, 88, 414, '深さ 3 の 11 データ合計で 114,898,476 列に達する', { 'font-size': 15, 'font-weight': 600, fill: C.a });

    var p1 = S.p1 = el('g', {}, g1);
    tx(p1, PX, 142, '2 つの壁', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    tx(p1, PX, 190, '・MIO はデータ数 ' + m('n') + ' に弱い', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 224, '・経路列生成は LP 緩和のみで', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 248, '　整数最適性を保証しない', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 290, '・動的計画法も深さと特徴量で', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 314, '　状態空間が急拡大する', { 'font-size': 16, fill: C.ink });
    tx(g1, 936, 514, '模式図（数値は論文 5 章のベンチマークより）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: junction-tree formulation (Figure 1) =====
    var g2 = S.g[1];
    // Mini depth-3 tree on upper left
    var N = {
      e: [330, 74],
      0: [200, 134], 1: [460, 134],
      '00': [135, 194], '01': [265, 194], '10': [395, 194], '11': [525, 194]
    };
    var treeEdges = [['e', '0'], ['e', '1'], ['0', '00'], ['0', '01'], ['1', '10'], ['1', '11']];
    S.tEdges = {};
    treeEdges.forEach(function (pair) {
      var a = N[pair[0]], b = N[pair[1]];
      S.tEdges[pair[0] + '-' + pair[1]] = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.gray, 'stroke-width': 2.5 }, g2);
    });
    S.tNodes = {};
    Object.keys(N).forEach(function (k) {
      var c = el('circle', { cx: N[k][0], cy: N[k][1], r: 17, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g2);
      tx(g2, N[k][0], N[k][1] + 5, k === 'e' ? 'ε' : k, { 'font-size': 14, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      S.tNodes[k] = c;
    });
    // Leaf pairs under 00, 01, 10, 11
    [108, 162, 238, 292, 368, 422, 498, 552].forEach(function (lx, idx) {
      var parentKey = ['00', '00', '01', '01', '10', '10', '11', '11'][idx];
      var p = N[parentKey];
      el('line', { x1: p[0], y1: p[1] + 17, x2: lx, y2: 242, stroke: C.gray, 'stroke-width': 1.8 }, g2);
      el('rect', { x: lx - 18, y: 242, width: 36, height: 22, rx: 4, fill: '#fff', stroke: C.ink, 'stroke-width': 1.4 }, g2);
    });
    tx(g2, 330, 286, '各末端ペアと祖先経路をクラスタにまとめる', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    // Chain below
    S.chain = el('g', {}, g2);
    var cxs = [125, 260, 395, 530];
    var clabs = ['C₀₀', 'C₀₁', 'C₁₀', 'C₁₁'];
    var csets = ['{ε,0,00,…}', '{ε,0,01,…}', '{ε,1,10,…}', '{ε,1,11,…}'];
    var seps = ['{ε,0}', '{ε}', '{ε,1}'];
    for (var ci = 0; ci < 3; ci++) {
      el('line', { x1: cxs[ci] + 54, y1: 386, x2: cxs[ci + 1] - 54, y2: 386, stroke: C.b, 'stroke-width': 3 }, S.chain);
      tx(S.chain, (cxs[ci] + cxs[ci + 1]) / 2, 344, seps[ci], { 'font-size': 14, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    }
    cxs.forEach(function (cx, i) {
      el('rect', { x: cx - 54, y: 356, width: 108, height: 60, rx: 8, fill: i < 2 ? C.bsoft : '#F2F4F7', stroke: i < 2 ? C.b : C.ink, 'stroke-width': 2 }, S.chain);
      tx(S.chain, cx, 380, clabs[i], { 'font-size': 15, 'font-weight': 700, fill: i < 2 ? C.b : C.ink, 'text-anchor': 'middle' });
      tx(S.chain, cx, 402, csets[i], { 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' });
    });

    var p2 = S.p2 = el('g', {}, g2);
    tx(p2, PX, 128, 'JT-LP の性質', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    tx(p2, PX, 178, '・変数はデータ数 ' + m('n') + ' によらない', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 220, '・分離集合の一致制約だけで', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 246, '　実行可能木の厳密な凸包になる', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 288, '・LP 緩和の端点はすべて整数', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    tx(p2, PX, 330, '・列を絞った制限主問題（RMP）も', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 356, '　整数性を保つ', { 'font-size': 16, fill: C.ink });
    tx(g2, 936, 514, '論文 Figure 1・Theorem 1 にもとづく図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: exact reductions (Table 3 totals) =====
    var g3 = S.g[2];
    tx(g3, 74, 88, '深さ 3・11 データ合計の LP 規模（対数表示）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var stages = [
      { name: 'LP-base（未縮約）', val: '114,898,476 列', w: 340, y: 145, col: C.a },
      { name: '＋ 署名圧縮（SC）', val: '714,854 列（160.7 分の 1）', w: 247, y: 245, col: C.b },
      { name: '＋ 端点消去（EE）', val: '328,079 列', w: 233, y: 345, col: C.b }
    ];
    S.s3bars = stages.map(function (st, i) {
      tx(g3, 74, st.y - 12, st.name, { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      var r = el('rect', { x: 74, y: st.y, width: 0, height: 34, rx: 5, fill: st.col }, g3);
      var l = tx(g3, 74 + st.w + 12, st.y + 23, st.val, { 'font-size': 15, 'font-weight': 650, fill: st.col });
      return { r: r, l: l, w: st.w, t0: 16.8 + i * 1.4 };
    });
    S.s3eq = el('g', {}, g3);
    el('rect', { x: 74, y: 416, width: 490, height: 52, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5 }, S.s3eq);
    tx(S.s3eq, 319, 448, '等式制約も 388,023 本 → 1,226 本に大幅縮小', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    var p3 = S.p3 = el('g', {}, g3);
    tx(p3, PX, 130, '3 つの厳密縮約', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    tx(p3, PX, 180, '1. 署名圧縮（SC）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    tx(p3, PX, 204, '　同じ分離集合署名の最小だけ残す', { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 246, '2. 部分木縮約', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    tx(p3, PX, 270, '　深さ ' + m('h') + ' の部分木を DP で並列評価', { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 312, '3. 端点消去（EE）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    tx(p3, PX, 336, '　葉クラスタのコストを隣へ吸収', { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 386, '最適値・整数性・木の復元を保持', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    tx(g3, 936, 514, '論文 Table 3・5.3 節の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: real benchmark results (Table 2 & Sec 5.2) =====
    var g4 = S.g[3];
    tx(g4, 70, 82, '全 88 設定の最適性証明数（制限時間 600 秒）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var certBars = [
      ['BOCT', 2, 128, C.a],
      ['STreeD', 77, 174, C.a],
      ['JT-LP', 84, 220, C.b],
      ['JT-CG / MP', 85, 266, C.b]
    ];
    S.s4cert = certBars.map(function (b, i) {
      tx(g4, 184, b[2] + 6, b[0], { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      var w = 320 * b[1] / 88;
      var r = el('rect', { x: 196, y: b[2] - 14, width: 0, height: 28, rx: 4, fill: b[3] }, g4);
      var l = tx(g4, 196 + w + 10, b[2] + 6, b[1] + ' / 88', { 'font-size': 15, 'font-weight': 650, fill: b[3] });
      return { r: r, l: l, w: w, t0: 24.6 + i * 0.45 };
    });

    tx(g4, 70, 342, '深さ 5（λ = 0.01）の平均実行時間', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var timeBars = [
      ['STreeD', 283.38, 386, C.a, '283.4 秒'],
      ['JT-CG', 88.09, 434, C.b, '88.1 秒']
    ];
    S.s4time = timeBars.map(function (b, i) {
      tx(g4, 184, b[2] + 6, b[0], { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      var w = 300 * b[1] / 300;
      var r = el('rect', { x: 196, y: b[2] - 14, width: 0, height: 28, rx: 4, fill: b[3] }, g4);
      var l = tx(g4, 196 + w + 10, b[2] + 6, b[4], { 'font-size': 15, 'font-weight': 650, fill: b[3] });
      return { r: r, l: l, w: w, t0: 27.2 + i * 0.55 };
    });

    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 112, width: 280, height: 140, rx: 12, fill: C.bsoft }, p4);
    tx(p4, PX + 140, 152, 'STreeD 比（共通 77 設定）', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    tx(p4, PX + 140, 210, '21.79 倍', { 'font-size': 46, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(p4, PX + 140, 238, '幾何平均の高速化（76/77 で高速）', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });

    el('rect', { x: PX, y: 286, width: 280, height: 112, rx: 12, fill: '#F2F4F7' }, p4);
    tx(p4, PX + 140, 326, '深さ 5 の最適性証明', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    tx(p4, PX + 140, 368, '19 / 22', { 'font-size': 34, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(p4, PX + 140, 390, '（STreeD は 12 / 22）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    tx(g4, 936, 514, '論文 Table 2・5.2 節の数値から作図（11 データ）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 140, y: 44, width: 310, height: 64, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 295, 72, '最適性証明数（全 88 設定）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 295, 97, '85 設定（STreeD 77）', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    el('rect', { x: 510, y: 44, width: 310, height: 64, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 665, 72, 'STreeD 比（共通 77 設定）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 665, 97, '幾何平均 21.79 倍高速', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    tx(g5, 480, 168, 'ARXIV:2609.24741 · 2026', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.2 });
    tx(g5, 480, 220, 'An Exact Junction-Tree Extended Formulation', { 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 260, 'for Optimal Classification Trees', { 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 306, '最適な分類木に対するジャンクション木にもとづく厳密な拡張定式化', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 360, 'Jiancheng Tu, Wenqi Fan', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 404, 'github.com/Tommytutu/JT-OCT', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 468, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1
    S.s1barA.setAttribute('width', 450 * seg(t, 0.8, 2.4));
    S.s1labA.setAttribute('opacity', seg(t, 2.0, 2.7));
    S.s1barB.setAttribute('width', 450 * seg(t, 2.8, 4.4));
    S.s1labB.setAttribute('opacity', seg(t, 4.0, 4.7));
    S.p1.setAttribute('opacity', seg(t, 1.4, 2.2));

    // scene 2
    var hi = t > 9.6 && t < 15.6;
    ['e-0', '0-00', '0-01'].forEach(function (k) {
      S.tEdges[k].setAttribute('stroke', hi ? C.b : C.gray);
      S.tEdges[k].setAttribute('stroke-width', hi ? 3.5 : 2.5);
    });
    ['e', '0'].forEach(function (k) {
      S.tNodes[k].setAttribute('fill', hi ? C.bsoft : '#fff');
      S.tNodes[k].setAttribute('stroke', hi ? C.b : C.ink);
    });
    S.chain.setAttribute('opacity', seg(t, 10.6, 11.8));
    S.p2.setAttribute('opacity', seg(t, 9.2, 10.0));

    // scene 3
    S.s3bars.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 1.0);
      b.r.setAttribute('width', b.w * s);
      b.l.setAttribute('opacity', seg(t, b.t0 + 0.7, b.t0 + 1.2));
    });
    S.s3eq.setAttribute('opacity', seg(t, 20.8, 21.6));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));

    // scene 4
    S.s4cert.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 0.8);
      b.r.setAttribute('width', b.w * s);
      b.l.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.s4time.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 0.8);
      b.r.setAttribute('width', b.w * s);
      b.l.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.9));
  }

  Teaser.start({
    root: document.getElementById('teaser'),
    bounds: BOUNDS,
    captions: CAPTIONS,
    build: build,
    render: render,
    still: 30
  });
})();
