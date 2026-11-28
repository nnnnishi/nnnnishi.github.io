// =====================================================================
// teaser-scenes.js — Chaouki, Read, Bifet, Branches (arXiv:2406.02175),
// unofficial explainer. Written by Muse (Neon quota exhausted on
// 2026-11-28; fallback per TASK.md).
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses numbers stated
// in the Experiments section: 11 UCI data sets, 300 s time limit, ordinal
// encoding never timed out (slowest: lymph, 12.3 s).
// Colours: orange = depth-first search and its costs; blue = Branches.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '最適な決定木を求める解法の主流は<span class="A">深さ優先探索</span>で、深い木に弱く、最大深さを先に決める必要がある。',
    '決定木の部分問題は「分岐を選ぶ」と「左右の部分木を両方解く」の組み合わせで、<span class="B">AND/OR グラフ</span>として表せる。',
    '<span class="B">Branches</span> は AO* による最良優先探索に、解析的下界 Purification Bound を組み合わせて枝を刈る。',
    'UCI の11データで GOSDT の大半を上回り、<span class="B">順序符号化では全実験が制限時間内に終わった</span>（最遅でも12.3秒）。',
    '最大深さを決めず、非二値の特徴量にも直接対応する、最良優先の厳密解法。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 670;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: DFS weakness =====
    var g1 = S.g[0];
    var path = [[310, 110], [200, 200], [140, 290], [110, 380]];
    for (var i = 0; i < path.length - 1; i++) {
      el('line', { x1: path[i][0], y1: path[i][1], x2: path[i + 1][0], y2: path[i + 1][1], stroke: C.a, 'stroke-width': 3 }, g1);
    }
    [[420, 200], [480, 290], [260, 290], [540, 380]].forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 15, fill: '#fff', stroke: C.hair, 'stroke-width': 2 }, g1);
      el('line', { x1: 310, y1: 110, x2: p[0], y2: p[1], stroke: C.hair, 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, g1);
    });
    path.forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 17, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2.4 }, g1); });
    tx(g1, 310, 64, '深さ優先探索：一方向を深く掘り続ける', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 310, 470, '反対側の部分木は長い間手つかず', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 150, '深さ優先（DL8.5 系）の弱点', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p1, PX, 196, '・有望でない領域を', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 224, '　 長く探索しがち', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 270, '・最大深さを先に', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 298, '　 決める必要がある', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 344, '・メモリは経済的', { 'font-size': 16, fill: C.muted });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: AND/OR graph =====
    var g2 = S.g[1];
    el('circle', { cx: 310, cy: 120, r: 24, fill: C.bsoft, stroke: C.b, 'stroke-width': 2.4 }, g2);
    tx(g2, 310, 127, 'OR', { 'font-size': 16, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(g2, 310, 76, '分岐の候補から1つ選ぶ', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    [[170, 250], [450, 250]].forEach(function (p) {
      el('line', { x1: 310, y1: 144, x2: p[0], y2: p[1] - 22, stroke: C.ink, 'stroke-width': 1.8 }, g2);
      el('rect', { x: p[0] - 62, y: p[1] - 24, width: 124, height: 48, rx: 10, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, g2);
    });
    tx(g2, 170, 256, '左の部分木', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    tx(g2, 450, 256, '右の部分木', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    tx(g2, 310, 330, 'AND：両方の部分木を解いて初めて木が決まる', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    tx(S.p2, PX, 150, 'AND/OR グラフとして定式化', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p2, PX, 196, '分岐の選択は OR、', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 224, '部分木の組み合わせは AND。', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 280, 'この構造のうえでは古典的な', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 308, 'AO* が最良優先探索になる。', { 'font-size': 16, fill: C.ink });
    tx(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: best-first + bound =====
    var g3 = S.g[2];
    tx(g3, 310, 64, '下界の良い分岐から先に広げる', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    var nodes = [
      { x: 140, y: 170, b: '下界 0.08', best: true },
      { x: 310, y: 170, b: '下界 0.15', best: false },
      { x: 480, y: 170, b: '下界 0.21', best: false }
    ];
    S.n3 = nodes.map(function (n) {
      var g = el('g', {}, g3);
      el('rect', { x: n.x - 70, y: n.y - 30, width: 140, height: 60, rx: 10, fill: n.best ? C.bsoft : '#fff', stroke: n.best ? C.b : C.hair, 'stroke-width': n.best ? 2.6 : 1.6 }, g);
      tx(g, n.x, n.y - 2, '部分木の候補', { 'font-size': 14, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      tx(g, n.x, n.y + 20, n.b, { 'font-size': 14, fill: n.best ? C.b : C.muted, 'text-anchor': 'middle' });
      return g;
    });
    tx(g3, 140, 268, 'まず展開', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(g3, 310, 330, '下界が現在の最良値を超えた分岐は切り捨てる（枝刈り）', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 140, 'Purification Bound', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p3, PX, 186, '論文が提案する解析的下界。', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 232, '最適性と、評価する分岐の数', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 260, 'についての複雑さの保証つき。', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 316, '時間切れでも、その時点の', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 344, '最良の木を返せる。', { 'font-size': 16, fill: C.ink });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: ordinal encoding result =====
    var g4 = S.g[3];
    tx(g4, 80, 84, '順序符号化での実行時間（秒）', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    var X0 = 250, X1 = 880;
    function bx(v) { return X0 + v / 300 * (X1 - X0); }
    S.b41 = el('rect', { x: X0, y: 140, width: 8, height: 36, rx: 6, fill: C.b }, g4);
    tx(g4, X0 - 16, 165, '最遅の実験（lymph）', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
    S.l41 = tx(g4, X0 + 16, 165, '12.3 秒', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.l41.setAttribute('opacity', 0);
    S.b42 = el('rect', { x: X0, y: 210, width: 8, height: 36, rx: 6, fill: C.a }, g4);
    tx(g4, X0 - 16, 235, '制限時間', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    S.l42 = tx(g4, X0 + 16, 235, '300 秒', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.l42.setAttribute('opacity', 0);
    S.p4 = el('g', {}, g4);
    tx(S.p4, PX, 320, '二値化しないため探索空間が', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 348, '小さい。順序符号化の全実験が', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 376, '制限時間内に終了した。', { 'font-size': 16, fill: C.ink });
    tx(g4, 940, 520, '論文の実験節の記述から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('rect', { x: 180, y: 40, width: 270, height: 62, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 315, 66, '探索の転換', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 315, 90, '深さ優先 → 最良優先（AO*）', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 270, height: 62, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 645, 66, '対応範囲', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 645, 90, '非二値の特徴量に直接対応', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 168, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV PREPRINT 2024';
    el('text', { x: 480, y: 216, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Branches: A Fast Dynamic Programming';
    el('text', { x: 480, y: 254, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'and Branch & Bound Algorithm';
    el('text', { x: 480, y: 292, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Optimal Decision Trees';
    tx(g5, 480, 330, 'AND/OR グラフ探索で最適な疎な決定木を速く求める', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 378, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Ayman Chaouki, Jesse Read, Albert Bifet';
    el('text', { x: 480, y: 428, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2406.02175';
    tx(g5, 480, 478, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    S.p2.setAttribute('opacity', seg(t, 9.2, 10.0));
    S.p3.setAttribute('opacity', seg(t, 17.2, 18.0));
    var p1 = seg(t, 25, 26.2), p2 = seg(t, 26.8, 28.6);
    S.b41.setAttribute('width', Math.max(8, (bxv(12.3)) * p1));
    S.l41.setAttribute('opacity', seg(t, 26.0, 26.4));
    S.l41.setAttribute('x', 250 + Math.max(8, bxv(12.3) * p1) + 16);
    S.b42.setAttribute('width', Math.max(8, bxv(300) * p2));
    S.l42.setAttribute('opacity', seg(t, 28.4, 28.8));
    S.l42.setAttribute('x', 250 + Math.max(8, bxv(300) * p2) + 16);
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }
  function bxv(v) { return v / 300 * 630; }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
