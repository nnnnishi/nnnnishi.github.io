// =====================================================================
// teaser-scenes.js — van den Bos, van der Linden, Demirović, Piecewise Constant and Linear Regression
// Trees (ICML 2024, PMLR 235), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); scene 3 uses the paper's
// own worked example (labels 4, 5, 6). Scene 4 uses speed-up factors stated in Section 6.2.
// Colours: orange = OSRT / previous methods; blue = SRT-C / SRT-SL / SRT-L.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '回帰木はデータを分けてから回帰する。葉に定数ではなく直線を置けば、少ない分岐で当てはまる。', en: '' },
    { ja: '最適な回帰木の手法は MIP では深い木を解けず、動的計画法の <span class="A">OSRT</span> は葉が定数の木に限られていた。', en: '' },
    { ja: '二乗誤差を <span class="B">y の和、y² の和、件数</span>の 3 つで書けば、深さ 2 の木の誤差を事前計算から求められる。', en: '' },
    { ja: '葉が定数の最適な回帰木を、OSRT より幾何平均で 18 倍速く求めた。深さ 3 では 131 倍だった。', en: '' },
    { ja: '分類で効いた深さ 2 の解法を回帰に移し、葉が直線の回帰木も動的計画法で最適に求められるようにした。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: constant vs linear leaves =====
    var g1 = S.g[0];
    var AX = 90, AY = 430, AW = 500, AH = 300;
    el('line', { x1: AX, y1: AY, x2: AX + AW, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: AX, y1: AY, x2: AX, y2: AY - AH, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    txt(g1, AX + AW / 2, AY + 34, '特徴量 x', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var r = H.rng(7);
    S.pts1 = [];
    for (var i = 0; i < 30; i++) {
      var x = i < 15 ? r() * 0.48 : 0.52 + r() * 0.48;
      var y = i < 15 ? 0.15 + 1.3 * x + (r() - 0.5) * 0.15 : 0.35 + 0.1 * (x - 0.5) + (r() - 0.5) * 0.12;
      S.pts1.push(el('circle', { cx: AX + x * AW, cy: AY - y * AH, r: 6, fill: C.ink }, g1));
    }
    var X = function (v) { return AX + v * AW; }, Yp = function (v) { return AY - v * AH; };
    el('line', { x1: X(0.5), x2: X(0.5), y1: AY, y2: AY - AH, stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g1);
    S.const1 = el('g', {}, g1);
    el('line', { x1: X(0), x2: X(0.5), y1: Yp(0.46), y2: Yp(0.46), stroke: C.a, 'stroke-width': 3.5 }, S.const1);
    el('line', { x1: X(0.5), x2: X(1), y1: Yp(0.35), y2: Yp(0.35), stroke: C.a, 'stroke-width': 3.5 }, S.const1);
    S.lin1 = el('g', {}, g1);
    el('line', { x1: X(0), x2: X(0.5), y1: Yp(0.15), y2: Yp(0.8), stroke: C.b, 'stroke-width': 3.5 }, S.lin1);
    el('line', { x1: X(0.5), x2: X(1), y1: Yp(0.35), y2: Yp(0.4), stroke: C.b, 'stroke-width': 3.5 }, S.lin1);
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '1 回分けた回帰木', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p1, PX, 196, '葉が定数（区分定数）', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(S.p1, PX, 236, '葉が直線（区分線形）', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(S.p1, PX, 290, '直線の葉なら、同じ分岐の', { 'font-size': 15, fill: C.muted });
    txt(S.p1, PX, 314, '数で誤差が小さくなる', { 'font-size': 15, fill: C.muted });
    txt(g1, 940, 520, '模式図（点は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: previous optimal methods =====
    var g2 = S.g[1];
    S.c2 = [['MIP（ORT、DTIP）', '深さ 2 を超える木を解けない', C.a], ['MIP（ORT-L、葉が線形）', '最も小さなデータでのみ深い木', C.a], ['OSRT（動的計画法）', '葉が定数の木だけ', C.a], ['この論文', '葉が定数でも線形でも動的計画法', C.b]].map(function (r, i) {
      var g = el('g', {}, g2), y = 130 + i * 76;
      el('rect', { x: 80, y: y, width: 540, height: 58, rx: 10, fill: i < 3 ? '#FCEBDF' : C.bsoft }, g);
      txt(g, 104, y + 36, r[0], { 'font-size': 17, 'font-weight': 650, fill: C.ink });
      txt(g, 600, y + 36, r[1], { 'font-size': 15, fill: r[2], 'text-anchor': 'end' });
      return { g: g, t0: 9.0 + i * 0.7 };
    });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 170, '二乗誤差の難しさ', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p2, PX, 214, '点を 1 つ足すと葉の平均', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 240, 'が変わり、ほかの点の', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 266, '誤差も変わる。', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 320, '点ごとの寄与に分けにくい', { 'font-size': 15, fill: C.muted });
    txt(g2, 940, 520, '論文の第 1、2、6 節から', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: three sums =====
    var g3 = S.g[2];
    S.e3 = el('g', {}, g3);
    el('rect', { x: 80, y: 100, width: 540, height: 80, rx: 12, fill: C.bsoft }, S.e3);
    txt(S.e3, 350, 150, 'SSE = Σ y² − (Σ y)² / n', { 'font-size': 26, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.ex3 = el('g', {}, g3);
    txt(S.ex3, 80, 226, '例：値 4、5、6 の葉（論文の例）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.ex3, 80, 258, 'Σ y² = 77、Σ y = 15、n = 3 → 77 − 225 / 3 = 2', { 'font-size': 17, fill: C.ink });
    S.tup3 = el('g', {}, g3);
    txt(S.tup3, 80, 312, '点ごとの寄与 (y, y², 1) を足すだけで、どの葉の SSE も出る', { 'font-size': 16, fill: C.ink });
    // 2x2 leaf grid of a depth-two tree
    var cells = [['Q(f̄ᵢ, f̄ⱼ)', false], ['Q(f̄ᵢ, fⱼ)', false], ['Q(fᵢ, f̄ⱼ)', false], ['Q(fᵢ, fⱼ)', true]];
    S.q3 = cells.map(function (c, k) {
      var g = el('g', {}, g3), x = 80 + k * 136;
      el('rect', { x: x, y: 340, width: 126, height: 56, rx: 8, fill: c[1] ? C.b : '#fff', stroke: C.b, 'stroke-width': 1.8 }, g);
      txt(g, x + 63, 374, c[0], { 'font-size': 15, fill: c[1] ? '#fff' : C.b, 'text-anchor': 'middle' });
      return { g: g, t0: 20.4 + k * 0.4 };
    });
    S.n3 = txt(g3, 80, 430, '濃い枠と Q(fᵢ)、Q(fⱼ) を事前に数え、残る 3 枚の葉は引き算で出す', { 'font-size': 15, fill: C.muted });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, '深さ 2 専用の解法', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 特徴量と組ごとに', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, '3 つの和を数える', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 4 枚の葉の SSE を', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '引き算で求める', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 300, '時間 O(|F|²|D|) → O(m²|D|)', { 'font-size': 15, fill: C.ink });
    txt(S.p3, PX, 336, '単回帰の葉は和の組を', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 360, '3 + 3|F| 個に増やす', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: speed-ups =====
    var g4 = S.g[3];
    var X0 = 300, LW = 300, L = function (v) { return LW * Math.log10(v) / Math.log10(200); };
    [1, 10, 100].forEach(function (v) {
      el('line', { x1: X0 + L(v), x2: X0 + L(v), y1: 110, y2: 400, stroke: v === 1 ? C.ink : C.hair, 'stroke-width': v === 1 ? 1.5 : 1 }, g4);
      el('text', { x: X0 + L(v), y: 424, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + ' 倍';
    });
    txt(g4, X0 + LW / 2, 450, '対数の長さ', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    txt(g4, 70, 80, '何倍速くなったか（平均）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [['SRT-C 対 OSRT', '全深さ', 18], ['SRT-C 対 OSRT', '深さ 3', 131], ['深さ 2 の解法', 'SRT-C', 8], ['深さ 2 の解法', 'SRT-SL', 10]];
    S.b4 = bars.map(function (b, i) {
      var y = 124 + i * 68, g = el('g', {}, g4);
      txt(g, X0 - 14, y + 14, b[0], { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      txt(g, X0 - 14, y + 34, b[1], { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y + 4, width: 0, height: 30, fill: C.b }, g);
      var tx = el('text', { x: X0 + L(b[2]) + 10, y: y + 25, 'font-size': 16, 'font-weight': 650, fill: C.b }, g);
      tx.textContent = b[2] + ' 倍';
      return { g: g, rect: rect, tx: tx, w: L(b[2]), t0: 24.6 + i * 0.6 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 150, 'テストでの R²', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    txt(S.p4, PX, 184, '区分定数：SRT-C が', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 208, '12 データ中 7 で最良', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 244, '区分線形：SRT-SL が', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 268, '9 データで最良', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の第 6 節の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 68, '3 つの和', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 94, '深さ 2 の解法を回帰に', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 660, 68, '葉に直線', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 660, 94, '初の最適な動的計画法', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 164, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2024';
    el('text', { x: 480, y: 210, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Piecewise Constant and Linear Regression Trees:';
    el('text', { x: 480, y: 248, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'An Optimal Dynamic Programming Approach';
    txt(g5, 480, 292, '区分定数と区分線形の回帰木：動的計画法による最適化', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Mim van den Bos, Jacobus G. M. van der Linden, Emir Demirović';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v235/van-den-bos24a.html';
    txt(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.pts1.forEach(function (p, k) { p.setAttribute('opacity', seg(t, 0.6 + k * 0.03, 1.0 + k * 0.03)); });
    S.const1.setAttribute('opacity', seg(t, 2.2, 2.8));
    S.lin1.setAttribute('opacity', seg(t, 4.0, 4.6));
    S.p1.setAttribute('opacity', seg(t, 2.6, 3.4));
    S.c2.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.4)); });
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.e3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.ex3.setAttribute('opacity', seg(t, 17.8, 18.4));
    S.tup3.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.q3.forEach(function (q) { q.g.setAttribute('opacity', seg(t, q.t0, q.t0 + 0.3)); });
    S.n3.setAttribute('opacity', seg(t, 22.0, 22.4));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    S.b4.forEach(function (b) {
      b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.3));
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.8)));
      b.tx.setAttribute('opacity', seg(t, b.t0 + 0.7, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
