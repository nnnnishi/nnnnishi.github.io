// =====================================================================
// teaser-scenes.js — Kiossou, Schaus, Nijssen, CA-ConTree (arXiv:2601.14765), unofficial explainer.
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scenes 1 and 3 are schematics (labelled 模式図). Scenes 2 and 4 plot exact values from Table 1
// (depth-4 average primal integral over 16 UCI datasets).
// Colours: orange = depth-first ConTree / pruned branches; blue = CA-ConTree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '連続の特徴量を直接扱う <span class="A">ConTree</span> は深さ優先で左側の部分木を掘り続ける。',
    '途中で打ち切ると偏った木しか残らず、深さ 4 では平均 primal integral で貪欲法の C4.5 にも及ばない。',
    '<span class="B">CA-ConTree</span> は特徴量としきい値に 2 種類の逸脱予算を設け、対角スイープで探索を広げる。',
    '深さ 4 の平均 primal integral は 5 秒から 600 秒まですべての時間で最良だった。',
    '完全性を保ったまま、連続の特徴量に対してどの時点で止めても質の高い決定木を返せる。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 685;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== Scene 1: ConTree DFS gets stuck on the leftmost branch (schematic) =====
    var g1 = S.g[0];
    var nodes1 = [
      { x: 380, y: 100, lab: '∅', left: true },
      { x: 300, y: 175, lab: m('a'), left: true },
      { x: 230, y: 255, lab: m('a') + '<tspan dy="4" font-size="12">θ1</tspan>', left: true },
      { x: 170, y: 335, lab: '≤' + m('a') + '<tspan dy="4" font-size="12">θ1</tspan>', left: true },
      { x: 120, y: 415, lab: m('b'), left: true }
    ];
    var side1 = [
      { px: 380, py: 100, x: 470, y: 175, lab: m('b') },
      { px: 300, py: 175, x: 390, y: 255, lab: m('a') + '<tspan dy="4" font-size="12">θ2</tspan>' },
      { px: 230, py: 255, x: 325, y: 335, lab: '&gt;' + m('a') + '<tspan dy="4" font-size="12">θ1</tspan>' },
      { px: 170, py: 335, x: 265, y: 415, lab: m('c') }
    ];
    S.e1s = side1.map(function (n) {
      var g = el('g', {}, g1);
      el('line', { x1: n.px, y1: n.py, x2: n.x, y2: n.y, stroke: C.gray, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g);
      el('circle', { cx: n.x, cy: n.y, r: 24, fill: '#fff', stroke: C.gray, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
      tx(g, n.x, n.y + 6, n.lab, { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
      return g;
    });
    S.e1l = [];
    for (var i = 0; i < nodes1.length - 1; i++) {
      S.e1l.push(el('line', { x1: nodes1[i].x, y1: nodes1[i].y, x2: nodes1[i + 1].x, y2: nodes1[i + 1].y, stroke: C.a, 'stroke-width': 3 }, g1));
    }
    S.n1 = nodes1.map(function (n, idx) {
      var g = el('g', {}, g1);
      el('circle', { cx: n.x, cy: n.y, r: 25, fill: idx === 0 ? '#fff' : '#FCEBDF', stroke: idx === 0 ? C.ink : C.a, 'stroke-width': 2.2 }, g);
      tx(g, n.x, n.y + 6, n.lab, { 'font-size': 17, 'font-weight': 650, fill: idx === 0 ? C.ink : C.a, 'text-anchor': 'middle' });
      return g;
    });
    S.tag1 = tx(g1, 330, 475, '右側の部分木と他のしきい値は未探索のまま', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 145, 'ConTree の深さ優先探索', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p1, PX, 192, '左の部分木を完全に', { 'font-size': 17, fill: C.ink });
    tx(S.p1, PX, 220, '最適化し終えるまで、', { 'font-size': 17, fill: C.ink });
    tx(S.p1, PX, 248, '右の部分木に進まない。', { 'font-size': 17, fill: C.ink });
    tx(S.p1, PX, 304, '連続の特徴量はしきい値', { 'font-size': 16, fill: C.muted });
    tx(S.p1, PX, 330, '候補が多く、探索が深い', { 'font-size': 16, fill: C.muted });
    tx(S.p1, PX, 356, '枝に留まりやすい。', { 'font-size': 16, fill: C.muted });
    tx(g1, 940, 520, '模式図（論文 Fig. 1 より）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 2: Real Table 1 numbers at 5 s vs 600 s =====
    var g2 = S.g[1];
    tx(g2, 80, 108, '深さ 4 の平均 primal integral（16 データ、小さいほど良い）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var bars2 = [
      { lab: 'ConTree（5 秒）', val: 93.8, col: C.a },
      { lab: 'ConTree-Gini（5 秒）', val: 89.1, col: C.a },
      { lab: 'ConTree（600 秒）', val: 54.2, col: C.a },
      { lab: 'C4.5（貪欲法）', val: 40.8, col: C.muted }
    ];
    S.b2 = bars2.map(function (b, idx) {
      var y = 148 + idx * 72, g = el('g', {}, g2);
      tx(g, 80, y + 26, b.lab, { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      var wMax = 300 * b.val / 100;
      var rect = el('rect', { x: 268, y: y, width: 0, height: 36, rx: 6, fill: b.col }, g);
      var num = tx(g, 278 + wMax, y + 25, b.val.toFixed(1), { 'font-size': 18, 'font-weight': 650, fill: b.col });
      return { g: g, rect: rect, num: num, w: wMax, t0: 8.8 + idx * 0.85 };
    });
    S.p2 = el('g', {}, g2);
    tx(S.p2, PX, 150, '途中で止めると', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p2, PX, 196, '600 秒かけても、', { 'font-size': 17, fill: C.ink });
    tx(S.p2, PX, 224, '元の ConTree は', { 'font-size': 17, fill: C.ink });
    tx(S.p2, PX, 252, '平均 primal integral で', { 'font-size': 17, fill: C.ink });
    tx(S.p2, PX, 280, 'C4.5 に届かない。', { 'font-size': 17, fill: C.ink });
    tx(S.p2, PX, 336, 'ジニ順を足しても', { 'font-size': 16, fill: C.muted });
    tx(S.p2, PX, 362, '改善は限られる。', { 'font-size': 16, fill: C.muted });
    tx(g2, 940, 520, '論文 Table 1 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 3: CA-ConTree 2D discrepancy budgets + diagonal sweep (schematic) =====
    var g3 = S.g[2];
    tx(g3, 80, 92, '2 種類の逸脱予算 (featDisc, splitDisc) と対角スイープ', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    // Grid 4x3 on left
    var GX = 160, GY = 380, DX = 120, DY = 100;
    el('line', { x1: 105, y1: 425, x2: 590, y2: 425, stroke: C.ink, 'stroke-width': 1.6 }, g3);
    el('line', { x1: 105, y1: 425, x2: 105, y2: 130, stroke: C.ink, 'stroke-width': 1.6 }, g3);
    tx(g3, 350, 466, '特徴量の逸脱予算 featDisc', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    tx(g3, 56, 275, 'しきい値 splitDisc', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle', transform: 'rotate(-90 56 275)' });
    for (var fx = 0; fx <= 3; fx++) tx(g3, GX + fx * DX, 446, String(fx), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    for (var sy = 0; sy <= 2; sy++) tx(g3, 88, GY - sy * DY + 5, String(sy), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    var sweep = [
      [0, 0, '(0,0)'], [1, 0, '(1,0)'], [0, 1, '(0,1)'],
      [2, 0, '(2,0)'], [1, 1, '(1,1)'], [0, 2, '(0,2)'],
      [3, 0, '(3,0)'], [2, 1, '(2,1)'], [1, 2, '(1,2)']
    ];
    S.l3 = [];
    for (var k = 0; k < sweep.length - 1; k++) {
      S.l3.push(el('line', {
        x1: GX + sweep[k][0] * DX, y1: GY - sweep[k][1] * DY,
        x2: GX + sweep[k + 1][0] * DX, y2: GY - sweep[k + 1][1] * DY,
        stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '6 4'
      }, g3));
    }
    S.c3 = sweep.map(function (pt, idx) {
      var cx = GX + pt[0] * DX, cy = GY - pt[1] * DY;
      var g = el('g', {}, g3);
      var circ = el('circle', { cx: cx, cy: cy, r: 28, fill: C.bsoft, stroke: C.b, 'stroke-width': 2.2 }, g);
      tx(g, cx, cy + 6, pt[2], { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      return { g: g, circ: circ, idx: idx };
    });
    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 125, 'CA-ConTree の工夫', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p3, PX, 174, '① ジニスコア順に並べる', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(S.p3, PX + 20, 198, '特徴量としきい値の両方', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 244, '② 対角スイープで拡大', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(S.p3, PX + 20, 268, '予算の合計が小さい順', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 314, '③ 枝刈りとキャッシュ', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(S.p3, PX + 20, 338, 'D2Split と SLB を活用', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 392, '予算を広げ切れば', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 416, '最適性も保証される', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 4: Depth-4 Average Primal Integral across 5..600 s (Table 1) =====
    var g4 = S.g[3];
    var X0 = 110, X1 = 560, Y0 = 420, Y1 = 100;
    var times = [5, 15, 30, 60, 120, 300, 600];
    var X = function (sec) { return X0 + (X1 - X0) * (Math.log10(sec) - Math.log10(5)) / (Math.log10(600) - Math.log10(5)); };
    var Y = function (v) { return Y0 - (Y0 - Y1) * v / 100; };
    tx(g4, 80, 74, '深さ 4 の平均 primal integral（16 データ平均、小さいほど良い）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    [0, 20, 40, 60, 80, 100].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: Y(v), y2: Y(v), stroke: C.hair, 'stroke-width': 1 }, g4);
      tx(g4, X0 - 12, Y(v) + 5, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    el('line', { x1: X0, x2: X0, y1: Y1, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    times.forEach(function (sec) {
      tx(g4, X(sec), Y0 + 24, String(sec), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    tx(g4, (X0 + X1) / 2, Y0 + 52, '制限時間（秒、対数軸）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    var series = [
      { name: 'ConTree', vals: [93.8, 89.0, 83.7, 76.8, 70.3, 62.1, 54.2], col: C.a, dash: '', w: 2.6, ly: 242 },
      { name: 'ConTree-Gini', vals: [89.1, 85.4, 77.4, 71.8, 67.6, 60.0, 50.5], col: C.a, dash: '7 5', w: 2.2, ly: 266 },
      { name: 'C4.5', vals: [40.8, 40.8, 40.8, 40.8, 40.8, 40.8, 40.8], col: C.muted, dash: '4 4', w: 2.2, ly: 294 },
      { name: 'CA-ConTree', vals: [33.5, 26.5, 23.1, 20.4, 18.3, 16.3, 14.6], col: C.b, dash: '', w: 3.6, ly: 378 }
    ];
    S.s4 = series.map(function (sr, si) {
      var g = el('g', {}, g4);
      var segs = [];
      for (var j = 0; j < times.length - 1; j++) {
        var ln = el('line', {
          x1: X(times[j]), y1: Y(sr.vals[j]),
          x2: X(times[j + 1]), y2: Y(sr.vals[j + 1]),
          stroke: sr.col, 'stroke-width': sr.w
        }, g);
        if (sr.dash) ln.setAttribute('stroke-dasharray', sr.dash);
        segs.push(ln);
      }
      var dots = times.map(function (sec, j) {
        return el('circle', {
          cx: X(sec), cy: Y(sr.vals[j]), r: si === 3 ? 5.5 : 4.2,
          fill: si === 1 ? '#fff' : sr.col, stroke: sr.col, 'stroke-width': 2
        }, g);
      });
      var endVal = tx(g, X1 + 12, sr.ly, sr.vals[6].toFixed(1), { 'font-size': 15, 'font-weight': 650, fill: sr.col });
      return { segs: segs, dots: dots, endVal: endVal, t0: 24.6 + si * 0.9 };
    });
    S.p4 = el('g', {}, g4);
    tx(S.p4, PX, 130, '■ CA-ConTree', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    tx(S.p4, PX, 158, '■ ConTree（実線）', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    tx(S.p4, PX, 184, '□ ConTree-Gini（破線）', { 'font-size': 15, fill: C.a });
    tx(S.p4, PX, 210, '⋯ C4.5（貪欲法）', { 'font-size': 15, fill: C.muted });
    tx(S.p4, PX, 266, '5 秒時点：33.5', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    tx(S.p4, PX, 294, '600 秒時点：14.6', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p4, PX, 344, '深さ 5 でも全時間で', { 'font-size': 15, fill: C.muted });
    tx(S.p4, PX, 368, '40.2 → 24.8 と最小', { 'font-size': 15, fill: C.muted });
    tx(g4, 940, 520, '論文 Table 1 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 5: Takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 140, y: 42, width: 310, height: 70, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 295, 70, '深さ 4・600 秒の平均 primal integral', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 295, 97, '54.2 → 14.6', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 42, width: 310, height: 70, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 665, 70, '深さ 6 テスト精度（bean）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 665, 97, '0.582 → 0.908', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 480, 168, 'ARXIV 2026', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    tx(g5, 480, 218, 'Anytime Optimal Decision Tree Learning', { 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 258, 'with Continuous Features', { 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 302, '連続の特徴量に対する、いつ止めても良い木を返せる最適決定木学習', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 352, 'Harold Silvère Kiossou, Pierre Schaus, Siegfried Nijssen', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 404, 'arxiv.org/abs/2601.14765', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 468, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // Scene 1
    S.n1.forEach(function (n, i) { n.setAttribute('opacity', seg(t, 0.5 + i * 0.7, 1.0 + i * 0.7)); });
    S.e1l.forEach(function (e, i) { e.setAttribute('opacity', seg(t, 0.9 + i * 0.7, 1.3 + i * 0.7)); });
    S.e1s.forEach(function (e, i) { e.setAttribute('opacity', seg(t, 1.0 + i * 0.7, 1.5 + i * 0.7)); });
    S.tag1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // Scene 2
    S.b2.forEach(function (b) {
      b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.3));
      b.rect.setAttribute('width', b.w * seg(t, b.t0, b.t0 + 0.8));
      b.num.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 0.95));
    });
    S.p2.setAttribute('opacity', seg(t, 11.2, 12.0));
    // Scene 3: diagonal sweep step by step
    S.c3.forEach(function (c, i) {
      var k = seg(t, 16.7 + i * 0.65, 17.1 + i * 0.65);
      c.g.setAttribute('opacity', k);
      var active = t >= 16.7 + i * 0.65 && t < 16.7 + (i + 1) * 0.65;
      c.circ.setAttribute('fill', active ? C.b : C.bsoft);
      c.g.querySelector('text').setAttribute('fill', active ? '#fff' : C.b);
    });
    S.l3.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 17.2 + i * 0.65, 17.6 + i * 0.65)); });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // Scene 4
    S.s4.forEach(function (sr) {
      sr.dots.forEach(function (d, j) { d.setAttribute('opacity', seg(t, sr.t0 + j * 0.14, sr.t0 + j * 0.14 + 0.25)); });
      sr.segs.forEach(function (l, j) { l.setAttribute('opacity', seg(t, sr.t0 + j * 0.14 + 0.08, sr.t0 + j * 0.14 + 0.3)); });
      sr.endVal.setAttribute('opacity', seg(t, sr.t0 + 0.95, sr.t0 + 1.3));
    });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
