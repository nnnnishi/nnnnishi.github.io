// =====================================================================
// teaser-scenes.js — Demirović & Stuckey, Optimal Decision Trees for Nonlinear Metrics (AAAI 2021;
// arXiv 2009.06921 v2), unofficial explainer. Player: teaser-engine.js.
// Scene 1 uses the class counts of seismic_bumps from Table 2 (accuracy of the all-negative tree is the
// explainer's arithmetic). Scenes 2-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses test F1-scores of depth-3 trees from Table 2.
// Colours: orange = accuracy-optimal (single objective); blue = Pareto front / F1-optimal.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'クラスの偏ったデータでは、全員を多数派に分類する木でも<span class="A">精度</span>は高くなる。', en: '' },
    { ja: 'F 値は部分木ごとの値を足し合わせて求められないので、従来の動的計画法がそのままでは使えない。', en: '' },
    { ja: '偽陽性と偽陰性の<span class="B">パレートフロント</span>を求め、その中から F 値が最大の木を選ぶ。', en: '' },
    { ja: 'F 値で直接最適にした木は、精度で最適にした木よりテストでの F 値が同じか高かった。', en: '' },
    { ja: '誤りが減るほど良くなる指標なら、パレートフロントから最適な木を選べる。代わりに計算時間は長くなる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: imbalanced data (seismic_bumps class counts) =====
    var g1 = S.g[0];
    var X0 = 120, W = 460, N = 2584;
    txt(g1, X0, 120, 'seismic_bumps（2,584 件）', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    S.neg = el('rect', { x: X0, y: 150, width: 0, height: 56, fill: C.gray }, g1);
    S.pos = el('rect', { x: X0 + W * 2414 / N, y: 150, width: 0, height: 56, fill: C.ink }, g1);
    S.l1 = txt(g1, X0, 236, '陰性 2,414 件', { 'font-size': 16, fill: C.muted });
    S.l2 = txt(g1, X0 + W, 236, '陽性 170 件', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.pred = el('g', {}, g1);
    el('rect', { x: X0, y: 290, width: W, height: 120, rx: 12, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, S.pred);
    txt(S.pred, X0 + 24, 326, '全員を「陰性」と予測する木', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    txt(S.pred, X0 + 24, 368, '精度 2,414 / 2,584 ≈ 93%', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    txt(S.pred, X0 + 24, 396, '陽性は 1 件も見つけない（F 値 0）', { 'font-size': 16, fill: C.muted });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '精度だけを見ると', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '少数派のクラスを', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, '見落としても', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, '高い値が出る。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, 'こうしたデータには', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, 'F 値などの非線形な', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 354, '指標が使われる。', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '件数は論文の表 2、精度は解説者の計算', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: F1 does not add up over subtrees =====
    var g2 = S.g[1];
    el('line', { x1: 340, y1: 120, x2: 210, y2: 210, stroke: C.ink, 'stroke-width': 1.6 }, g2);
    el('line', { x1: 340, y1: 120, x2: 470, y2: 210, stroke: C.ink, 'stroke-width': 1.6 }, g2);
    el('rect', { x: 280, y: 92, width: 120, height: 44, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g2);
    txt(g2, 340, 120, '特徴量 f', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.sub2 = [[210, 'tp 8, fp 2, fn 0', 'F1 0.89'], [470, 'tp 1, fp 0, fn 5', 'F1 0.29']].map(function (p) {
      var g = el('g', {}, g2);
      el('rect', { x: p[0] - 105, y: 212, width: 210, height: 86, rx: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      txt(g, p[0], 246, p[1], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      txt(g, p[0], 280, p[2], { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      return g;
    });
    S.whole2 = el('g', {}, g2);
    txt(S.whole2, 340, 356, '木全体：tp 9, fp 2, fn 5 → F1 = 9 / 12.5 = 0.72', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(S.whole2, 340, 394, '左右の F1 の平均（0.59）とも和とも一致しない', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 150, '分解できない', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p2, PX, 196, '左の部分木の最良の', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 224, '選び方が右の部分木', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 252, 'の誤りに左右される。', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 306, '目的が非線形なので', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 330, 'MIP でもそのままでは', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 354, '解けない。', { 'font-size': 16, fill: C.muted });
    txt(g2, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: Pareto front of (fp, fn), pick by metric =====
    var g3 = S.g[2];
    var AX = 110, AY = 440, AW = 460, AH = 330;
    var P = function (fp, fn) { return [AX + fp * AW / 11, AY - fn * AH / 9]; };
    el('line', { x1: AX, y1: AY, x2: AX + AW, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX, y1: AY, x2: AX, y2: AY - AH, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, AX + AW / 2, AY + 40, '偽陽性の数', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g3, AX - 20, AY - AH - 14, '偽陰性の数', { 'font-size': 16, fill: C.ink });
    [0, 2, 4, 6, 8, 10].forEach(function (v) { txt(g3, P(v, 0)[0], AY + 20, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    [2, 4, 6, 8].forEach(function (v) { txt(g3, AX - 10, P(0, v)[1] + 5, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); });
    var F = [[0, 8, '0.33'], [1, 5, '0.63'], [3, 3, '0.70'], [6, 1, '0.72'], [10, 0, '0.67']];
    var DOM = [[2, 7], [4, 5], [5, 4], [8, 3], [9, 2], [3, 8], [7, 6]];
    S.dom3 = DOM.map(function (v, i) {
      var p = P(v[0], v[1]);
      return { c: el('circle', { cx: p[0], cy: p[1], r: 8, fill: C.gray }, g3), t0: 16.8 + i * 0.15 };
    });
    S.line3 = el('polyline', { points: F.map(function (v) { return P(v[0], v[1]).join(','); }).join(' '), fill: 'none', stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g3);
    S.f3 = F.map(function (v, i) {
      var p = P(v[0], v[1]), g = el('g', {}, g3);
      var c = el('circle', { cx: p[0], cy: p[1], r: 10, fill: C.b }, g);
      var lab = el('text', { x: p[0] + 15, y: p[1] - 10, 'font-size': 15, fill: C.ink }, g);
      lab.textContent = 'F1 ' + v[2];
      return { g: g, c: c, lab: lab, k: i, t0: 18.2 + i * 0.3 };
    });
    var pa = P(3, 3), pb = P(6, 1);
    S.ringA = el('circle', { cx: pa[0], cy: pa[1], r: 17, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g3);
    S.ringB = el('circle', { cx: pb[0], cy: pb[1], r: 17, fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, '二目的の動的計画法', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 152, '灰色：どちらの誤りでも', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 174, '負ける木（捨てる）', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 214, '青：パレートフロント', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.pa = txt(S.p3, PX, 268, '誤分類数が最小 (3, 3)', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    S.pa2 = txt(S.p3, PX, 292, 'F1 0.70', { 'font-size': 15, fill: C.a });
    S.pb = txt(S.p3, PX, 336, 'F 値が最大 (6, 1)', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.pb2 = txt(S.p3, PX, 360, 'F1 0.72', { 'font-size': 15, fill: C.b });
    txt(g3, 940, 520, '模式図（陽性 10 件の架空の例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: test F1 at depth 3 (Table 2) =====
    var g4 = S.g[3];
    var BX = 250, BW = 400;   // F1 0..1 -> BX..BX+BW
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: BX + v * BW, x2: BX + v * BW, y1: 100, y2: 420, stroke: C.hair, 'stroke-width': 1 }, g4);
      el('text', { x: BX + v * BW, y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    txt(g4, 70, 76, '深さ 3 の木の、テストでの F 値', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['seismic_bumps', 0.04, 0.36], ['haberman-un', 0.25, 0.54], ['spect-un', 0.50, 0.66], ['yeast', 0.49, 0.63], ['monk2', 0.56, 0.68]];
    S.r4 = rows.map(function (r, i) {
      var y = 140 + i * 64, g = el('g', {}, g4);
      txt(g, BX - 16, y + 6, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var ln = el('line', { x1: BX + r[1] * BW, x2: BX + r[1] * BW, y1: y, y2: y, stroke: C.muted, 'stroke-width': 3 }, g);
      el('circle', { cx: BX + r[1] * BW, cy: y, r: 9, fill: C.a }, g);
      var cb = el('circle', { cx: BX + r[1] * BW, cy: y, r: 9, fill: C.b }, g);
      var tb = el('text', { x: BX + r[2] * BW + 16, y: y + 6, 'font-size': 15, 'font-weight': 650, fill: C.b }, g);
      tb.textContent = r[1].toFixed(2) + ' → ' + r[2].toFixed(2);
      return { g: g, ln: ln, cb: cb, tb: tb, x0: BX + r[1] * BW, x1: BX + r[2] * BW, t0: 24.6 + i * 0.6 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX + 40, 120, '● 精度で調整', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(S.p4, PX + 40, 148, '● F 値で調整', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(S.p4, PX + 40, 200, '表 2 の 49 データで、', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 40, 224, 'F 値で調整した木が', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 40, 248, '下回ったデータはない', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 40, 272, '（深さ 3、解説者の集計）', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の表 2 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 74, '単調な指標なら', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 98, '最適な木はフロント上', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.panel }, g5);
    txt(g5, 660, 74, '代償', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 660, 98, '精度より長い計算時間', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2021';
    el('text', { x: 480, y: 236, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Decision Trees for Nonlinear Metrics';
    txt(g5, 480, 290, '非線形な評価指標のための最適決定木', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Emir Demirović, Peter J. Stuckey';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v35i5.16490';
    txt(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var W = 460, N = 2584;
    S.neg.setAttribute('width', W * 2414 / N * seg(t, 0.8, 1.8));
    S.pos.setAttribute('width', W * 170 / N * seg(t, 1.8, 2.3));
    S.l1.setAttribute('opacity', seg(t, 1.4, 1.9));
    S.l2.setAttribute('opacity', seg(t, 2.2, 2.7));
    S.pred.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 2.6, 3.4));
    // scene 2
    S.sub2.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 9.0 + i * 0.7, 9.5 + i * 0.7)); });
    S.whole2.setAttribute('opacity', seg(t, 11.2, 11.8));
    S.p2.setAttribute('opacity', seg(t, 9.8, 10.6));
    // scene 3
    S.dom3.forEach(function (d) { d.c.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.3)); });
    S.f3.forEach(function (f) { f.g.setAttribute('opacity', seg(t, f.t0, f.t0 + 0.3)); });
    S.line3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.ringA.setAttribute('opacity', seg(t, 20.6, 21.0));
    S.pa.setAttribute('opacity', seg(t, 20.6, 21.0)); S.pa2.setAttribute('opacity', seg(t, 20.6, 21.0));
    S.ringB.setAttribute('opacity', seg(t, 21.6, 22.0));
    S.pb.setAttribute('opacity', seg(t, 21.6, 22.0)); S.pb2.setAttribute('opacity', seg(t, 21.6, 22.0));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: blue dot slides from the accuracy-tuned value to the F1-tuned value
    S.r4.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      var s = H.ease(seg(t, r.t0 + 0.4, r.t0 + 1.2)), x = r.x0 + (r.x1 - r.x0) * s;
      r.cb.setAttribute('cx', x); r.ln.setAttribute('x2', x);
      r.tb.setAttribute('opacity', seg(t, r.t0 + 1.0, r.t0 + 1.4));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
