// =====================================================================
// teaser-scenes.js — Elmachtoub, Liang, McNellis, "Decision Trees for Decision-Making under the
// Predict-then-Optimize Framework" (ICML 2020, PMLR 119), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 draw the paper's two-edge example (Section 3.1): c1 = 5x + 1.9, c2 = (5x + 0.4)^2, x ~ U(0,1).
//   The leaf averages are computed here from those equations (integrals over the leaf), not read from a plot.
//   Split points 0.62 (CART) and 0.28 (SPOT) and the 28% share are stated in the paper.
// Scene 4 uses the percentages stated in Section 5.1 (n = 200).
// Colours: orange = trained on prediction error (CART, MSE); blue = trained on SPO loss (SPOT).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '予測の誤差を最小にする<span class="A">CART</span>は x < 0.62 で分け、どちらの葉でも道 1 が速いと予測する。', en: '' },
    { ja: '道 2 のほうが速い x < 0.28 でも道 1 を選ぶので、28% の x で決定を誤る。', en: '' },
    { ja: '<span class="B">SPO 損失で学ぶ SPOT</span>は 1 回の分岐で決定の境目 x = 0.28 を見つける。', en: '' },
    { ja: '訓練データが 200 件の最短経路問題では、SPOT の決定の損失は CART より 23〜27% 小さかった。', en: '' },
    { ja: '木を予測の誤差ではなく決定の損失で学ぶと、浅い木でもよい決定が得られる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- the paper's two-edge example ----
  function c1(x) { return 5 * x + 1.9; }
  function c2(x) { return (5 * x + 0.4) * (5 * x + 0.4); }
  function mean1(a, b) { return 5 * (a + b) / 2 + 1.9; }
  function mean2(a, b) { return (Math.pow(5 * b + 0.4, 3) - Math.pow(5 * a + 0.4, 3)) / (15 * (b - a)); }
  var X0 = 80, X1 = 580, Y0 = 440, Y1 = 90, YMAX = 30;
  function px(x) { return X0 + x * (X1 - X0); }
  function py(c) { return Y0 - Math.min(c, YMAX) / YMAX * (Y0 - Y1); }
  function curve(f) { var p = []; for (var i = 0; i <= 100; i++) { var x = i / 100; p.push(px(x).toFixed(1) + ',' + py(f(x)).toFixed(1)); } return p.join(' '); }

  // axes + true cost curves (grey); returns the group
  function plot(g) {
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: X0, x2: X0, y1: Y1 - 10, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    [0, 0.5, 1].forEach(function (v) {
      el('line', { x1: px(v), x2: px(v), y1: Y0, y2: Y0 + 6, stroke: C.ink }, g);
      el('text', { x: px(v), y: Y0 + 26, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = v.toFixed(1);
    });
    [0, 10, 20, 30].forEach(function (v) {
      el('text', { x: X0 - 10, y: py(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g).textContent = v;
    });
    txt(g, X1, Y0 + 50, '特徴量 ' + m('x') + ' →', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, X0, 60, '2 本の道の所要時間（灰色が真の値）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('polyline', { points: curve(c1), fill: 'none', stroke: '#8A94A3', 'stroke-width': 3 }, g);
    el('polyline', { points: curve(c2), fill: 'none', stroke: '#8A94A3', 'stroke-width': 3, 'stroke-dasharray': '9 6' }, g);
    t2(g, px(1) - 6, py(c1(1)) + 26, '道 1', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, px(0.5) - 10, py(c2(0.5)) + 4, '道 2', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, 940, 520, '論文 3.1 節の例（c₁ = 5x + 1.9、c₂ = (5x + 0.4)²）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    return g;
  }
  // leaf-average segments for a depth-1 split at s, in colour col
  function leaves(g, col) {
    var o = { col: col };
    o.split = el('line', { x1: 0, x2: 0, y1: Y1 - 10, y2: Y0, stroke: col, 'stroke-width': 3 }, g);
    o.lab = txt(g, 0, Y1 + 6, '', { 'font-size': 17, 'font-weight': 650, fill: col });
    o.seg = [0, 1, 2, 3].map(function (i) {
      return el('line', { x1: 0, x2: 0, y1: 0, y2: 0, stroke: col, 'stroke-width': 3.5, 'stroke-dasharray': i % 2 ? '9 6' : '' }, g);
    });
    return o;
  }
  function setLeaves(o, s) {
    o.split.setAttribute('x1', px(s)); o.split.setAttribute('x2', px(s));
    o.lab.setAttribute('x', px(s) + 8); o.lab.innerHTML = m('x') + ' < ' + s.toFixed(2);
    var parts = [[0, s], [s, 1]];
    parts.forEach(function (p, k) {
      var v1 = mean1(p[0], p[1]), v2 = mean2(p[0], p[1]);
      [v1, v2].forEach(function (v, j) {
        var e = o.seg[k * 2 + j];
        e.setAttribute('x1', px(p[0])); e.setAttribute('x2', px(p[1]));
        e.setAttribute('y1', py(v)); e.setAttribute('y2', py(v));
      });
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: CART depth 1 =====
    var g1 = S.g[0];
    plot(g1);
    S.L1 = leaves(g1, C.a); setLeaves(S.L1, 0.62);
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 120, 'CART（深さ 1）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX, 156, '予測の二乗誤差が', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 182, '最小になる分岐を選ぶ', '', { 'font-size': 17, fill: C.ink });
    S.p1b = el('g', {}, g1);
    t2(S.p1b, PX, 240, 'どちらの葉でも', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1b, PX, 266, '予測では道 1 が速い', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1b, PX, 306, '→ いつも道 1', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });

    // ===== scene 2: the 28% =====
    var g2 = S.g[1];
    S.wrong = el('rect', { x: px(0), y: Y1 - 10, width: px(0.28) - px(0), height: Y0 - Y1 + 10, fill: '#FCEBDF' }, g2);
    plot(g2);
    S.L2 = leaves(g2, C.a); setLeaves(S.L2, 0.62);
    S.tb = el('line', { x1: px(0.28), x2: px(0.28), y1: Y1 - 10, y2: Y0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '3 5' }, g2);
    S.tbl = el('g', {}, g2);
    t2(S.tbl, px(0.28) - 6, Y0 - 120, '真の境目', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    txt(S.tbl, px(0.28) - 6, Y0 - 98, m('x') + ' = 0.28', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 130, 'x < 0.28 では道 2 のほうが', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 156, '速いのに、道 1 を選ぶ', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 214, '決定を誤る x の割合', '', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 272, '28%', { 'font-size': 52, 'font-weight': 650, fill: C.a });

    // ===== scene 3: SPOT depth 1 =====
    var g3 = S.g[2];
    plot(g3);
    S.L3 = leaves(g3, C.b);
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 120, 'SPOT（深さ 1）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 156, 'SPO 損失（決定の損失）が', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 182, '最小になる分岐を選ぶ', '', { 'font-size': 17, fill: C.ink });
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 240, '左の葉は道 2、右の葉は道 1', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3b, PX, 280, '→ 決定の誤りなし', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(S.p3b, PX, 316, '予測の誤差は CART より大きい', '', { 'font-size': 15, fill: C.muted });

    // ===== scene 4: n = 200 improvements (Section 5.1) =====
    var g4 = S.g[3];
    var rows = [['深さ 1', 26.7], ['深さ 2', 26.8], ['深さ 3', 23.1], ['深さ無制限', 23.6]];
    var BX0 = 220, BX1 = 580, HI = 30, YR = 140, RD = 70;
    function bx(v) { return BX0 + v / HI * (BX1 - BX0); }
    t2(g4, 70, 70, 'SPOT（貪欲法）が CART より決定の損失を減らした割合', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 10, 20, 30].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: YR - 36, y2: YR + RD * 3 + 30, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: YR + RD * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = YR + RD * i, o = {};
      t2(g4, BX0 - 14, y + 6, rw[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX0, y: y - 16, width: 0, height: 32, rx: 3, fill: C.b }, g4);
      o.lab = el('text', { x: bx(rw[1]) + 8, y: y + 7, 'font-size': 17, fill: C.ink }, g4); o.lab.textContent = rw[1].toFixed(1) + '%';
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.7;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 120, '4 つのデータ設定の平均', '', { 'font-size': 16, fill: C.muted });
    t2(S.p4, PX, 170, '森どうしでも', '', { 'font-size': 17, fill: C.ink });
    txt(S.p4, PX, 222, '20.5%', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 256, 'SPO Forest が CART Forest', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 278, 'より減らした', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 5.1 節の数値（n = 200、各設定 10 データセット）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2020 · PMLR 119';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Decision Trees for Decision-Making under';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'the Predict-then-Optimize Framework';
    t2(g5, 480, 296, '予測してから最適化する枠組みでの意思決定のための決定木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Adam N. Elmachtoub · Jason Cheuk Nam Liang · Ryan McNellis';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v119/elmachtoub20a.html';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var k1 = seg(t, 1.5, 2.5);
    [S.L1.split, S.L1.lab].concat(S.L1.seg).forEach(function (e) { e.setAttribute('opacity', k1); });
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    S.p1b.setAttribute('opacity', seg(t, 4, 4.8));
    // scene 2
    S.wrong.setAttribute('opacity', seg(t, 9.5, 10.5));
    S.tb.setAttribute('opacity', seg(t, 9, 9.8));
    S.tbl.setAttribute('opacity', seg(t, 9, 9.8));
    S.p2.setAttribute('opacity', seg(t, 10.5, 11.3));
    // scene 3: the SPOT split slides from 0.62 to 0.28
    var s = lerp(0.62, 0.28, seg(t, 17.5, 20.5));
    setLeaves(S.L3, s);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.p3b.setAttribute('opacity', seg(t, 20.6, 21.4));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.5, 29.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
