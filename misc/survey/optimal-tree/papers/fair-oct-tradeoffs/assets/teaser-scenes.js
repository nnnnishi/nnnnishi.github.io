// =====================================================================
// teaser-scenes.js — Jo, Aghaei, Benson, Gómez & Vayanos, "Learning Optimal Fair Decision Trees: Trade-offs
// Between Interpretability, Fairness, and Accuracy" (AIES 2023; numbers from the arXiv source 2201.09932),
// unofficial explainer. Player: teaser-engine.js.
// Scene 1 and 3: schematics (labelled 模式図). Scene 2: decision complexity on COMPAS (Table 1).
// Scene 4: price of interpretability (Section 4.5) and the disparity range (Section 4.5).
// Colours: orange = complex models / methods that do not bound disparity; blue = FairOCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '罰則や変換の強さを調整する公平化の手法では、<span class="A">結果の格差がどこまで小さくなるかは保証されない</span>。', en: '' },
    { ja: '予測に要るパラメータの数で比べると、COMPAS では深さ 2 の木が 7、ランダムフォレストが 59,126 だった。', en: '' },
    { ja: 'FairOCT は最適分類木の MIO に<span class="B">格差を δ 以下にする制約</span>を加え、δ の範囲で最も精度の高い木を求める。', en: '' },
    { ja: '格差の上限を決めたとき、最も精度の高い複雑なモデルは FairOCT より平均 4.2 ポイント精度が高かった。', en: '' },
    { ja: '浅い最適な木は小さな精度の代償で、ほぼ完全な釣り合いの判断を安定して出せる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: knob does not bound disparity =====
    var g1 = S.g[0];
    var AX0 = 120, AX1 = 590, AY = 420;
    el('line', { x1: AX0, x2: AX1, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: AX0, x2: AX0, y1: 110, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, AX1, AY + 36, '結果の格差 →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g1, AX0 - 10, 120, '精度', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    el('rect', { x: AX0, y: 110, width: 30, height: AY - 110, fill: C.bsoft }, g1);
    t2(g1, AX0 + 4, AY + 22, '0.05', '', { 'font-size': 13, fill: C.b });
    var r = H.rng(7);
    S.dots1 = [];
    for (var i = 0; i < 18; i++) {
      var x = AX0 + 45 + r() * 400, y = 150 + r() * 200;
      S.dots1.push({ c: el('circle', { cx: x, cy: y, r: 8, fill: C.a, opacity: 0 }, g1), k: i });
    }
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 140, '調整するのは', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 172, '罰則・相関を除く度合い・' + m('λ'), '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(S.p1, PX, 230, '格差 0.05 未満の結果は', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 256, 'ほとんど得られない', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: decision complexity on COMPAS (log scale) =====
    var g2 = S.g[1];
    t2(g2, 70, 64, 'COMPAS での決定の複雑さ（対数目盛）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows = [['木（深さ 2）', 7, C.b], ['ロジスティック回帰', 6, C.gray], ['多層パーセプトロン', 700, C.gray], ['決定木（CART）', 779, C.gray],
                ['SVM（RBF）', 3255, C.gray], ['k 近傍法', 4629, C.gray], ['ランダムフォレスト', 59126, C.a]];
    var BX = 230, BW = 360;
    function lx(v) { return Math.log10(v) / 5 * BW; }
    [1, 10, 100, 1000, 10000, 100000].forEach(function (v) {
      el('line', { x1: BX + lx(v), x2: BX + lx(v), y1: 90, y2: 430, stroke: C.hair }, g2);
      el('text', { x: BX + lx(v), y: 454, 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = v >= 1000 ? (v / 1000) + 'k' : v;
    });
    S.rows2 = rows.map(function (rw, i) {
      var y = 112 + i * 46, o = {};
      t2(g2, BX - 12, y + 6, rw[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX, y: y - 13, width: 0, height: 26, rx: 3, fill: rw[2] }, g2);
      o.lab = txt(g2, BX + lx(rw[1]) + 8, y + 6, rw[1].toLocaleString('en-US'), { 'font-size': 15, 'font-weight': 600, fill: C.ink });
      o.w = lx(rw[1]); o.t0 = 9 + i * 0.4;
      return o;
    });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 150, '予測に要る', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 176, 'パラメータの最小の数', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 230, 'モデルの種類を', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 256, 'またいで比べられる', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 1 の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: FairOCT constraint =====
    var g3 = S.g[2];
    function node(x, y, s) { el('circle', { cx: x, cy: y, r: 20, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3); txt(g3, x, y + 6, s, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); }
    [[200, 150, 120, 240], [200, 150, 280, 240]].forEach(function (l) { el('line', { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: C.ink, 'stroke-width': 1.8 }, g3); });
    node(200, 150, ''); node(120, 240, ''); node(280, 240, '');
    t2(g3, 200, 300, '深さ 2 までの最適な木', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    // group bars: share of positive predictions
    t2(g3, 400, 120, '正の予測の割合', '', { 'font-size': 15, fill: C.ink });
    S.ga = el('rect', { x: 400, y: 140, width: 0, height: 30, rx: 3, fill: C.gray }, g3);
    S.gb = el('rect', { x: 400, y: 190, width: 0, height: 30, rx: 3, fill: C.gray }, g3);
    t2(g3, 392, 161, 'A', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, 392, 211, 'B', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.gap = txt(g3, 400, 260, '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(g3, 80, 390, '| 割合' + '<tspan font-size="13" dy="4">A</tspan><tspan dy="-4"> − 割合</tspan><tspan font-size="13" dy="4">B</tspan><tspan dy="-4"> | ≤ </tspan><tspan fill="' + C.b + '">' + m('δ') + '</tspan>', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    t2(g3, 80, 426, '線形の制約 2 本として MIO に加える', '', { 'font-size': 15, fill: C.muted });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 110, '同じ形で入る定義', '', { 'font-size': 15, fill: C.muted });
    ['統計的パリティ', '条件付き統計的パリティ', '予測の平等', '機会均等', '均等オッズ'].forEach(function (n, i) {
      t2(S.p3, PX, 148 + i * 32, n, '', { 'font-size': 16, fill: C.ink });
    });
    t2(g3, 940, 520, '模式図（割合は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: price of interpretability =====
    var g4 = S.g[3];
    t2(g4, 70, 64, '複雑なモデルと比べた精度の差（FairOCT との差、ポイント）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var r4 = [['全体の平均（最良の複雑なモデル）', 4.2], ['German：ランダムフォレスト（CR）', 6], ['COMPAS：ニューラルネット（CR）', 3]];
    var X0 = 120, U = 60;
    S.rows4 = r4.map(function (rw, i) {
      var y = 130 + i * 90, o = {};
      t2(g4, X0, y - 18, rw[0], '', { 'font-size': 15, fill: C.ink });
      o.bar = el('rect', { x: X0, y: y - 6, width: 0, height: 30, rx: 3, fill: C.a }, g4);
      o.lab = txt(g4, X0 + rw[1] * U + 10, y + 16, '+' + rw[1], { 'font-size': 18, 'font-weight': 650, fill: C.ink });
      o.w = rw[1] * U; o.t0 = 25 + i * 0.7;
      return o;
    });
    t2(g4, X0, 420, '両方に結果がある格差の範囲だけでの比較', '', { 'font-size': 14, fill: C.muted });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 130, 'COMPAS で FairOCT の', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 156, '格差の範囲', '', { 'font-size': 16, fill: C.ink });
    txt(S.p4, PX, 210, '0〜0.3', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 260, 'ほかの手法は格差 0.05 未満を', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 284, '安定して出せなかった', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 4.5 節の数値（arXiv 版）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AIES 2023';
    el('text', { x: 480, y: 192, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Fair Decision Trees:';
    el('text', { x: 480, y: 234, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Trade-offs Between Interpretability,';
    el('text', { x: 480, y: 272, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Fairness, and Accuracy';
    t2(g5, 480, 314, '公平で最適な決定木の学習：解釈しやすさ・公平性・精度のトレードオフ', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 360, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nathanael Jo · Sina Aghaei · Jack Benson · Andrés Gómez · Phebe Vayanos';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3600211.3604664';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.dots1.forEach(function (d) { d.c.setAttribute('opacity', seg(t, 1 + d.k * 0.15, 1.4 + d.k * 0.15)); });
    S.p1.setAttribute('opacity', seg(t, 4.2, 5));
    // scene 2
    S.rows2.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p2.setAttribute('opacity', seg(t, 12.5, 13.3));
    // scene 3: delta shrinks; group B share rises toward A
    var k = seg(t, 18, 22);
    var a = 0.62, b = 0.38 + (0.6 - 0.38) * k;
    S.ga.setAttribute('width', a * 300); S.gb.setAttribute('width', b * 300);
    S.ga.setAttribute('fill', H.mix('#CBD2DC', '#1D4ED8', k)); S.gb.setAttribute('fill', H.mix('#CBD2DC', '#1D4ED8', k));
    S.gap.textContent = '差 ' + (a - b).toFixed(2) + (k > 0.98 ? '　≤ δ = 0.02' : '');
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.7));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.5, 29.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
