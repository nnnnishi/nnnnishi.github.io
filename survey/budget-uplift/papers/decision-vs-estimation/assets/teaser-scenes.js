// =====================================================================
// teaser-scenes.js — Fernández-Loría & Provost (INFORMS J. Data Science 2022), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-2 redraw the paper's Fig. 1 with its own coordinates (true effect 0.5, predictions 3.5 and -0.5).
// Scene 3 redraws Fig. 2 from the pgfplots parameters in the arXiv source: UM ~ N(1, 0.7),
//   BM ~ N(m, 0.35) with m sweeping -0.2 -> 0.6 -> 1.5 (the three panels); delta = 0, tau = 1.
// Scene 4 shows the paper's Fig. 3 image (CC BY 4.0) and the training-set sizes stated in the text.
// Colours: orange = effect estimation (error, MSE, unbiased model, causal tree);
//          blue = decision making (right side of the threshold, biased model, outcome tree).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '効果の推定精度で比べると、真の効果に近い予測を出す<span class="A">モデル 2</span> のほうがよい。', en: '' },
    { ja: '判断で問われるのは予測が境界のどちら側にあるかで、その基準では<span class="B">モデル 1</span> が正しい。', en: '' },
    { ja: '交絡で<span class="B">偏ったモデル</span>は偏りの向きと大きさしだいで、<span class="A">偏りのないモデル</span>より判断を誤りやすくも、誤りにくくもなる。', en: '' },
    { ja: 'Criteo の広告データでは、広告を出さなかった人だけで学習した<span class="B">決定木</span>が、<span class="A">因果木</span>と同等以上に効果の大きい人を選んだ。', en: '' },
    { ja: '判断に使うモデルは効果の推定精度ではなく判断の正しさで選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // Fig. 1 axes shared by scenes 1 and 2: effect v in [-1, 4]
  function fy(v) { return 400 - v * 70; }          // v=4 -> 120, v=0 -> 400, v=-1 -> 470
  var M1 = 250, M2 = 470;
  function fig1(g) {
    var o = {};
    o.shade = el('rect', { x: 120, y: fy(4), width: 470, height: fy(0) - fy(4), fill: C.bsoft }, g);
    el('line', { x1: 120, x2: 120, y1: fy(-1), y2: fy(4) - 8, stroke: C.ink, 'stroke-width': 1.5 }, g);
    o.zero = el('line', { x1: 120, x2: 590, y1: fy(0), y2: fy(0), stroke: C.ink, 'stroke-width': 1.5 }, g);
    [-1, 0, 1, 2, 3, 4].forEach(function (v) {
      el('text', { x: 108, y: fy(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g).textContent = v === -1 ? '−1' : v;
    });
    t2(g, 70, 96, '因果効果', '', { 'font-size': 16, fill: C.ink });
    [M1, M2].forEach(function (x, i) {
      el('path', { d: 'M' + x + ',' + (fy(0.5) - 12) + ' l12,12 l-12,12 l-12,-12 z', fill: C.ink }, g);
      t2(g, x, 500, 'モデル ' + (i + 1), '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    });
    t2(g, M2 + 18, fy(0.5) - 14, '真の効果 0.5', '', { 'font-size': 15, fill: C.ink });
    o.e1 = el('line', { x1: M1, x2: M1, y1: fy(0.5), y2: fy(3.5), stroke: C.muted, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
    o.e2 = el('line', { x1: M2, x2: M2, y1: fy(0.5), y2: fy(-0.5), stroke: C.muted, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
    o.p1 = el('circle', { cx: M1, cy: fy(3.5), r: 10, fill: C.ink }, g);
    o.p2 = el('circle', { cx: M2, cy: fy(-0.5), r: 10, fill: C.ink }, g);
    o.l1 = t2(g, M1 + 18, fy(3.5) + 5, '予測 3.5', '', { 'font-size': 15, fill: C.ink });
    o.l2 = t2(g, M2 + 18, fy(-0.5) + 5, '予測 −0.5', '', { 'font-size': 15, fill: C.ink });
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: estimation view — compare errors =====
    var g1 = S.g[0];
    S.f1 = fig1(g1);
    S.f1.shade.setAttribute('opacity', 0);
    S.err1 = t2(g1, M1 + 14, fy(2) + 5, '誤差 3', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.err2 = t2(g1, M2 - 16, fy(0) + 6, '誤差 1', '', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '効果推定の基準', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 162, '予測と真の効果の差（MSE）', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, 'モデル 1：誤差 3', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 252, 'モデル 2：誤差 1', '', { 'font-size': 17, fill: C.ink });
    S.win1 = t2(g1, PX, 312, '→ モデル 2 を選ぶ', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(g1, 940, 528, '論文 Fig. 1 の値を描き直した図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: decision view — which side of the boundary =====
    var g2 = S.g[1];
    S.f2 = fig1(g2);
    S.zlab = t2(g2, 132, fy(0) + 26, '判断の境界（効果 0）', '', { 'font-size': 15, fill: C.ink });
    S.slab = t2(g2, 586, fy(4) + 26, '処置するのが正しい側', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '意思決定の基準', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 162, '予測が境界のどちら側か', '', { 'font-size': 16, fill: C.ink });
    S.d1 = t2(g2, PX, 222, 'モデル 1：処置する（正）', '', { 'font-size': 17, fill: C.b });
    S.d2 = t2(g2, PX, 252, 'モデル 2：処置しない（誤）', '', { 'font-size': 17, fill: C.a });
    S.win2 = t2(g2, PX, 312, '→ モデル 1 を選ぶ', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(g2, PX, 370, '誤差が小さいモデルが', '', { 'font-size': 15, fill: C.muted });
    t2(g2, PX, 394, '判断を誤ることがある。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 528, '論文 Fig. 1 の値を描き直した図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: sampling distributions, BM bias sweeps =====
    var g3 = S.g[2];
    var AX0 = 80, AX1 = 600, BASE = 420, TOP = 110, YMAX = 1.2;
    S.px3 = function (x) { return AX0 + (x + 1) / 4 * (AX1 - AX0); };
    S.py3 = function (y) { return BASE - y / YMAX * (BASE - TOP); };
    S.base3 = BASE;
    S.umFill = el('path', { fill: '#FCEBDF' }, g3);
    S.bmFill = el('path', { fill: C.b, 'fill-opacity': 0.22 }, g3);
    el('line', { x1: AX0, x2: AX1, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: S.px3(0), x2: S.px3(0), y1: BASE, y2: TOP - 20, stroke: C.ink, 'stroke-width': 2.5 }, g3);
    el('line', { x1: S.px3(1), x2: S.px3(1), y1: BASE, y2: BASE + 8, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, S.px3(0), BASE + 30, m('δ'), { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    txt(g3, S.px3(1), BASE + 30, m('τ'), { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, S.px3(0) - 10, TOP - 30, '← 介入しない', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g3, S.px3(0) + 10, TOP - 30, '介入する（正しい）→', '', { 'font-size': 15, fill: C.muted });
    S.umLine = el('path', { fill: 'none', stroke: C.a, 'stroke-width': 3 }, g3);
    S.bmLine = el('path', { fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, g3);
    var p3 = el('g', {}, g3);
    el('line', { x1: PX, x2: PX + 32, y1: 124, y2: 124, stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, p3);
    t2(p3, PX + 42, 130, '偏ったモデル', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 42, 154, '大量の観測データ', '', { 'font-size': 14, fill: C.muted });
    el('line', { x1: PX, x2: PX + 32, y1: 190, y2: 190, stroke: C.a, 'stroke-width': 3 }, p3);
    t2(p3, PX + 42, 196, '偏りのないモデル', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 42, 220, '小さい実験データ', '', { 'font-size': 14, fill: C.muted });
    t2(p3, PX, 268, '塗った面積＝判断を誤る確率', '', { 'font-size': 15, fill: C.ink });
    S.st3 = [
      ['大きく逆向きの偏り', '偏りのないほうがよい'],
      ['小さく逆向きの偏り', 'どちらとも言えない'],
      ['判断を後押しする偏り', '偏ったほうがよい']
    ].map(function (s) {
      var g = el('g', {}, g3);
      t2(g, PX, 330, s[0], '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
      t2(g, PX, 362, '→ ' + s[1], '', { 'font-size': 17, fill: C.ink });
      return g;
    });
    t2(g3, 940, 528, '論文 Fig. 2 の作図の値を描き直した図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Criteo (paper Fig. 3, CC BY 4.0) =====
    var g4 = S.g[3];
    var IW = 560, IH = Math.round(560 * 1294 / 1792);
    var defs = el('defs', {}, g4);
    var cp = el('clipPath', { id: 'reveal4' }, defs);
    S.clip4 = el('rect', { x: 50, y: 70, width: 0, height: IH }, cp);
    el('image', { href: 'assets/fig3_uplift_curves.png', x: 50, y: 70, width: IW, height: IH, 'clip-path': 'url(#reveal4)' }, g4);
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '学習データの量', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 150, '因果木（赤）：全員', '', { 'font-size': 16, fill: C.a });
    el('rect', { x: PX, y: 162, width: 240, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX, 214, '決定木（青）：広告なしの人だけ', '', { 'font-size': 16, fill: C.b });
    el('rect', { x: PX, y: 226, width: 36, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 46, 241, '処置率 85% → 約 15%', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 290, '因果木のデータは 6 倍以上', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 340, '13,979,592 件、特徴量 11 個', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 362, '学習 80%・評価 20%', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 528, '論文 Fig. 3（CC BY 4.0）。図中の色は論文のもの', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'INFORMS JOURNAL ON DATA SCIENCE · 2022';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Causal Decision Making and Causal Effect';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Estimation Are Not the Same…and Why It Matters';
    t2(g5, 480, 290, '因果的な意思決定と因果効果の推定は同じではない', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Carlos Fernández-Loría · Foster Provost';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/ijds.2021.0006';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function pdf(x, mu, s) { return Math.exp(-(x - mu) * (x - mu) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  function curve(S, mu, s, x0, x1, closed) {
    var d = '', n = 90;
    for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n; d += (i ? 'L' : 'M') + S.px3(x).toFixed(1) + ',' + S.py3(pdf(x, mu, s)).toFixed(1); }
    if (closed) d += 'L' + S.px3(x1).toFixed(1) + ',' + S.base3 + 'L' + S.px3(x0).toFixed(1) + ',' + S.base3 + 'z';
    return d;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: predictions, then errors, then verdict
    var s = seg(t, 1.0, 1.8);
    [S.f1.p1, S.f1.p2, S.f1.l1, S.f1.l2].forEach(function (e) { e.setAttribute('opacity', s); });
    var e = seg(t, 2.4, 3.4);
    [S.f1.e1, S.f1.e2].forEach(function (x) { x.setAttribute('opacity', e); });
    S.err1.setAttribute('opacity', e); S.err2.setAttribute('opacity', e);
    S.p1.setAttribute('opacity', seg(t, 3.2, 4.0));
    S.win1.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.f1.p2.setAttribute('fill', H.mix(C.ink, C.a, seg(t, 4.8, 5.4)));
    // scene 2: boundary emphasised, correct side shaded, decisions coloured
    S.f2.zero.setAttribute('stroke-width', 1.5 + 2 * seg(t, 9.0, 9.8));
    S.zlab.setAttribute('opacity', seg(t, 9.0, 9.8));
    S.f2.shade.setAttribute('opacity', seg(t, 10.0, 10.8));
    S.slab.setAttribute('opacity', seg(t, 10.0, 10.8));
    S.p2.setAttribute('opacity', seg(t, 10.4, 11.2));
    S.f2.p1.setAttribute('fill', H.mix(C.ink, C.b, seg(t, 11.4, 12.0)));
    S.f2.p2.setAttribute('fill', H.mix(C.ink, C.a, seg(t, 11.4, 12.0)));
    S.d1.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.d2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.win2.setAttribute('opacity', seg(t, 13.0, 13.6));
    // scene 3: BM mean -0.2 (hold) -> 0.6 (hold) -> 1.5 (hold)
    var k1 = seg(t, 18.6, 19.6), k2 = seg(t, 21.0, 22.0);
    var mu = -0.2 + 0.8 * k1 + 0.9 * k2;
    S.umLine.setAttribute('d', curve(S, 1, 0.7, -1, 3));
    S.umFill.setAttribute('d', curve(S, 1, 0.7, -1, 0, true));
    S.bmLine.setAttribute('d', curve(S, mu, 0.35, -1, 3));
    S.bmFill.setAttribute('d', curve(S, mu, 0.35, -1, 0, true));
    S.st3[0].setAttribute('opacity', 1 - seg(t, 18.6, 19.0));
    S.st3[1].setAttribute('opacity', seg(t, 19.2, 19.6) * (1 - seg(t, 21.0, 21.4)));
    S.st3[2].setAttribute('opacity', seg(t, 21.6, 22.0));
    // scene 4: figure revealed left to right, then the data sizes
    S.clip4.setAttribute('width', 560 * seg(t, 24.6, 27.0));
    S.p4.setAttribute('opacity', seg(t, 27.4, 28.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
