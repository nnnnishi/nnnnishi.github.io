// =====================================================================
// teaser-scenes.js — Brița, van der Linden, Demirović, ConTree (AAAI 2025; arXiv 2501.07903 v1),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 2 uses counts
// from the out-of-sample table and the memory appendix; scene 4 uses depth-3 runtimes from Table 2.
// Colours: orange = coarse binarization / Quant-BnB; blue = ConTree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '連続の特徴量を<span class="A">粗く二値化</span>すると、本当に良い分割点がしきい値の候補から漏れることがある。', en: '' },
    { ja: 'すべてのしきい値を調べれば最適性は保てるが、既存の手法では時間とメモリが足りなくなる。', en: '' },
    { ja: '<span class="B">ConTree</span> は値を並べておき、解いた分割点の近くで改善の見込みがない分割点をまとめて捨てる。', en: '' },
    { ja: '深さ 3 の最適な木を、Quant-BnB より幾何平均で 63 倍速く求めた。', en: '' },
    { ja: '二値化せずに、すべてのしきい値の中で最適な分類木を、深さ 4 まで現実的な時間で求められる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: coarse binarization misses the best threshold =====
    var g1 = S.g[0];
    var X0 = 90, X1 = 590, Y = 280;
    el('line', { x1: X0, y1: Y + 30, x2: X1, y2: Y + 30, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    txt(g1, (X0 + X1) / 2, Y + 70, '特徴量の値（並べたもの）', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var r = H.rng(5), N = 40;
    S.pts1 = [];
    for (var i = 0; i < N; i++) {
      var x = X0 + 10 + i * (X1 - X0 - 20) / (N - 1);
      var pos = i >= 23 ? r() < 0.9 : r() < 0.12;
      S.pts1.push(el('circle', { cx: x, cy: Y + (pos ? -20 : 0), r: 6, fill: pos ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g1));
    }
    S.q1 = [];
    for (var q = 1; q <= 4; q++) {
      var xq = X0 + 10 + (q * 8 - 0.5) * (X1 - X0 - 20) / (N - 1);
      S.q1.push(el('line', { x1: xq, x2: xq, y1: Y - 70, y2: Y + 40, stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g1));
    }
    var xb = X0 + 10 + 22.5 * (X1 - X0 - 20) / (N - 1);
    S.best1 = el('g', {}, g1);
    el('line', { x1: xb, x2: xb, y1: Y - 100, y2: Y + 40, stroke: C.b, 'stroke-width': 3 }, S.best1);
    txt(S.best1, xb, Y - 112, '良い分割点', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.lab1 = txt(g1, X0, Y - 82, '分位点のしきい値', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(g1, X0, 140, '● 正例　○ 負例', { 'font-size': 15, fill: C.muted });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '粗い二値化', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '決めたしきい値の中で', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, '最適でも、本来の最適な', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, '木を逃すことがある。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, '動的計画法の多くは', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, '二値の特徴量が前提', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: the cost of all thresholds =====
    var g2 = S.g[1];
    txt(g2, 80, 120, 'Segment（2,310 件、特徴量 18 個）を二値化すると', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    S.b2 = [['10 分位点', 165, C.a], ['すべてのしきい値', 12057, C.ink]].map(function (b, i) {
      var g = el('g', {}, g2), y = 160 + i * 64;
      txt(g, 80, y + 24, b[0], { 'font-size': 16, fill: C.ink });
      var w = 320 * Math.log10(b[1]) / Math.log10(20000);
      el('rect', { x: 240, y: y, width: w, height: 36, fill: b[2] }, g);
      txt(g, 250 + w, y + 25, b[1].toLocaleString('en-US') + ' 個', { 'font-size': 17, 'font-weight': 650, fill: b[2] });
      return g;
    });
    txt(g2, 240, 310, '二値の特徴量の数（対数の長さ）', { 'font-size': 14, fill: C.muted });
    S.m2 = el('g', {}, g2);
    el('rect', { x: 80, y: 340, width: 540, height: 96, rx: 12, fill: '#FCEBDF' }, S.m2);
    txt(S.m2, 104, 376, 'Quant-BnB（連続の特徴量を直接扱う）、深さ 3', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    txt(S.m2, 104, 412, 'Htru：13,147 秒、メモリ 15 GB', { 'font-size': 18, fill: C.ink });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 170, 'すべてのしきい値を', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 198, '二値の特徴量にすると、', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 226, '計算時間は特徴量の数に', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 254, 'ついて指数的に増える。', { 'font-size': 17, fill: C.ink });
    txt(g2, 940, 520, '数値は論文の付録から', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: neighbourhood pruning on sorted split points =====
    var g3 = S.g[2];
    var M = 15, SX = 100, SW = 32, SY = 230;
    S.c3 = [];
    for (var k = 0; k < M; k++) {
      S.c3.push(el('rect', { x: SX + k * SW, y: SY, width: SW - 4, height: 44, rx: 6, fill: C.panel, stroke: C.hair, 'stroke-width': 1.5 }, g3));
    }
    txt(g3, SX, SY - 20, 'しきい値の候補（添字の順）', { 'font-size': 16, fill: C.ink });
    S.ev3 = [
      { k: 7, t: 17.0, prune: [5, 6, 8, 9], note: 'θ − UB = 2 → 左右 2 つずつ捨てる' },
      { k: 2, t: 19.2, prune: [1, 3], note: 'θ − UB = 1 → 左右 1 つずつ捨てる' },
      { k: 12, t: 21.2, prune: [10, 11, 13, 14], note: '部分区間ごと捨てる（SP）' }
    ];
    S.note3 = S.ev3.map(function (e) {
      return txt(g3, SX, SY + 110, e.note, { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    });
    S.uLab = el('text', { x: 0, y: SY - 52, 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' }, g3);
    S.leg3 = el('g', {}, g3);
    [[C.b, '解いた分割点'], [C.a, '捨てた分割点'], [C.panel, '残る候補']].forEach(function (l, i) {
      el('rect', { x: SX + i * 170, y: 380, width: 22, height: 22, rx: 4, fill: l[0], stroke: C.hair }, S.leg3);
      txt(S.leg3, SX + 30 + i * 170, 397, l[1], { 'font-size': 15, fill: C.ink });
    });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, 'ConTree の枝刈り', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 区間の中点を解く', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX, 202, '② 最良値をどれだけ', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 226, '上回ったかを見る', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 268, '③ その数より近い', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 292, '分割点は改善しない', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 346, '左右を移るデータの数は', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 370, '添字の差で O(1) で分かる', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: depth-3 runtimes (Table 2), log scale =====
    var g4 = S.g[3];
    var LX = 220, LW = 400, L = function (s) { return LX + LW * (Math.log10(s) + 1) / 5.5; };   // 0.1 s .. ~31,600 s
    [0.1, 1, 10, 100, 1000, 10000].forEach(function (v) {
      el('line', { x1: L(v), x2: L(v), y1: 100, y2: 430, stroke: C.hair, 'stroke-width': 1 }, g4);
      el('text', { x: L(v), y: 454, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v >= 1 ? v.toLocaleString('en-US') : '0.1';
    });
    txt(g4, L(1000), 478, '秒（対数）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    txt(g4, 70, 76, '深さ 3 の最適な木を求める時間（20 回の平均）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['Avila', 4451, 24], ['Eeg', 8535, 136], ['Htru', 13147, 74], ['Magic', 1419, 60], ['Rice', 817, 12]];
    S.r4 = rows.map(function (rw, i) {
      var y = 120 + i * 62, g = el('g', {}, g4);
      txt(g, LX - 14, y + 22, rw[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var ra = el('rect', { x: LX, y: y, width: 0, height: 20, fill: C.a }, g);
      var rb = el('rect', { x: LX, y: y + 24, width: 0, height: 20, fill: C.b }, g);
      var ta = el('text', { x: L(rw[1]) + 8, y: y + 16, 'font-size': 14, 'font-weight': 600, fill: C.a }, g); ta.textContent = rw[1].toLocaleString('en-US');
      var tb = el('text', { x: L(rw[2]) + 8, y: y + 40, 'font-size': 14, 'font-weight': 600, fill: C.b }, g); tb.textContent = String(rw[2]);
      return { g: g, ra: ra, rb: rb, ta: ta, tb: tb, wa: L(rw[1]) - LX, wb: L(rw[2]) - LX, t0: 24.6 + i * 0.6 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX + 20, 130, '■ Quant-BnB', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(S.p4, PX + 20, 158, '■ ConTree', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(S.p4, PX + 20, 214, '16 データの幾何平均で', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 20, 238, '63 倍速い', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p4, PX + 20, 286, 'Fault は Quant-BnB が', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 20, 310, '4 時間超、ConTree 55 秒', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の表 2 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 68, '深さ 4 の最適な木', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 94, '16 データ中 12 データ', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 660, 68, 'テスト精度（深さ 3）', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 660, 94, 'CART より平均 4.7% 高い', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 164, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2025';
    el('text', { x: 480, y: 210, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Classification Trees for Continuous Feature';
    el('text', { x: 480, y: 248, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Data Using Dynamic Programming with Branch-and-Bound';
    txt(g5, 480, 292, '連続の特徴量のデータに対する、動的計画法と分枝限定法による最適な分類木', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Cătălin E. Brița, Jacobus G. M. van der Linden, Emir Demirović';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v39i11.33210';
    txt(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.pts1.forEach(function (p, i) { p.setAttribute('opacity', seg(t, 0.8 + i * 0.03, 1.2 + i * 0.03)); });
    S.q1.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 2.6 + i * 0.3, 3.0 + i * 0.3)); });
    S.lab1.setAttribute('opacity', seg(t, 2.6, 3.0));
    S.best1.setAttribute('opacity', seg(t, 4.4, 5.0));
    S.p1.setAttribute('opacity', seg(t, 3.0, 3.8));
    // scene 2
    S.b2.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 9.0 + i * 0.9, 9.5 + i * 0.9)); });
    S.m2.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.p2.setAttribute('opacity', seg(t, 10.2, 11.0));
    // scene 3: evaluate, then prune
    var state = S.c3.map(function () { return 0; });   // 0 open, 1 evaluated, 2 pruned
    var cur = -1;
    S.ev3.forEach(function (e, i) {
      if (t >= e.t) { state[e.k] = 1; cur = i; }
      if (t >= e.t + 0.9) e.prune.forEach(function (p) { state[p] = 2; });
    });
    S.c3.forEach(function (c, k) {
      c.setAttribute('fill', state[k] === 1 ? C.b : state[k] === 2 ? C.a : C.panel);
      c.setAttribute('stroke', state[k] ? 'none' : C.hair);
    });
    S.note3.forEach(function (n, i) { n.setAttribute('opacity', i === cur && t >= S.ev3[i].t + 0.9 ? 1 : 0); });
    if (cur >= 0) { S.uLab.setAttribute('x', 100 + S.ev3[cur].k * 32 + 14); S.uLab.textContent = 'u'; S.uLab.setAttribute('opacity', 1); }
    else S.uLab.setAttribute('opacity', 0);
    S.leg3.setAttribute('opacity', seg(t, 17.2, 17.8));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.r4.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.ra.setAttribute('width', r.wa * H.ease(seg(t, r.t0, r.t0 + 0.8)));
      r.rb.setAttribute('width', r.wb * H.ease(seg(t, r.t0 + 0.3, r.t0 + 1.1)));
      r.ta.setAttribute('opacity', seg(t, r.t0 + 0.7, r.t0 + 1.0));
      r.tb.setAttribute('opacity', seg(t, r.t0 + 1.0, r.t0 + 1.3));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
