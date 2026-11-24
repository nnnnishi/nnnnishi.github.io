// =====================================================================
// teaser-scenes.js — Bertsimas, Dunn, Pawlowski & Zhuo, "Robust Classification"
// (INFORMS Journal on Optimization 2019), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3: schematic 1-D split with explainer-chosen points (labelled 模式図).
// Scene 4: robust-in-both improvement above / below the decision rule, from Table 6 of the paper.
// Colours: orange = nominal classifiers / errors they ignore; blue = robust counterparts (rho, Gamma).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">通常の木</span>は、学習データを正しく分けられるなら、しきい値を点のすぐそばに置く。', en: '' },
    { ja: '実際のデータには、特徴量の測定の誤差やラベルの誤りが入りうる。', en: '' },
    { ja: '<span class="B">ロバストな木</span>はしきい値のまわりに幅 ρ の余白を取り、葉の多数派に Γ に応じた差を求める。', en: '' },
    { ja: '次元が高く通常の手法の精度が低い問題では、両方に頑健な版の精度が SVM で 5.3%、CART に対して 1.3% 上がった。', en: '' },
    { ja: '誤りを不確実性集合で表せば、最適決定木のロバスト版も混合整数線形最適化のまま解ける。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // schematic points on one feature (x in viewBox units); cls 0 = hollow, 1 = filled
  var PTS = [[95, 0], [140, 0], [185, 0], [230, 0], [340, 0], [358, 1], [420, 1], [470, 1], [520, 1], [570, 1]];
  var AY = 290;
  function axis(g) {
    el('line', { x1: 70, x2: 600, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g);
    t2(g, 600, AY + 40, '特徴量 →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    return PTS.map(function (p) {
      return el('circle', { cx: p[0], cy: AY, r: 10, fill: p[1] ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2.2 }, g);
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: nominal threshold squeezed between points =====
    var g1 = S.g[0];
    axis(g1);
    S.th1 = el('line', { x1: 349, x2: 349, y1: AY - 70, y2: AY + 30, stroke: C.a, 'stroke-width': 3 }, g1);
    S.th1l = txt(g1, 349, AY - 80, m('b'), { 'font-size': 20, fill: C.a, 'text-anchor': 'middle' });
    t2(g1, 70, 120, '○ と ● は 2 つのクラス', '', { 'font-size': 16, fill: C.muted });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 150, '通常の最適決定木', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p1, PX, 190, '学習データの誤分類', '', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 246, '0', { 'font-size': 48, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX, 290, 'しきい値と点の距離は', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 316, 'ほとんどない', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: feature errors and label errors =====
    var g2 = S.g[1];
    S.d2 = axis(g2);
    el('line', { x1: 349, x2: 349, y1: AY - 70, y2: AY + 30, stroke: C.a, 'stroke-width': 3 }, g2);
    S.err2 = el('g', {}, g2);
    PTS.forEach(function (p) {
      el('line', { x1: p[0] - 22, x2: p[0] + 22, y1: AY - 22, y2: AY - 22, stroke: C.a, 'stroke-width': 2 }, S.err2);
      el('line', { x1: p[0] - 22, x2: p[0] - 22, y1: AY - 27, y2: AY - 17, stroke: C.a, 'stroke-width': 2 }, S.err2);
      el('line', { x1: p[0] + 22, x2: p[0] + 22, y1: AY - 27, y2: AY - 17, stroke: C.a, 'stroke-width': 2 }, S.err2);
    });
    S.q2 = txt(g2, 340, AY + 50, '?', { 'font-size': 26, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 130, '特徴量', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p2, PX, 158, '画像のノイズ、補完した値', '', { 'font-size': 15, fill: C.muted });
    t2(S.p2, PX, 220, 'ラベル', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p2, PX, 248, '調査の申告、主観的な判定', '', { 'font-size': 15, fill: C.muted });
    t2(S.p2, PX, 310, '少し動いただけで', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 336, 'しきい値をまたぐ', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: margin rho, threshold moves to a wide gap =====
    var g3 = S.g[2];
    S.d3 = axis(g3);
    S.band = el('rect', { x: 0, y: AY - 60, width: 0, height: 90, fill: C.bsoft }, g3);
    S.th3 = el('line', { x1: 0, x2: 0, y1: AY - 70, y2: AY + 30, stroke: C.b, 'stroke-width': 3 }, g3);
    S.th3l = txt(g3, 0, AY - 80, m('b'), { 'font-size': 20, fill: C.b, 'text-anchor': 'middle' });
    S.rho = txt(g3, 0, AY + 62, m('b') + ' ± ' + m('ρ'), { 'font-size': 17, fill: C.b, 'text-anchor': 'middle' });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 120, '特徴量の摂動', '', { 'font-size': 16, fill: C.muted });
    txt(S.p3, PX, 160, '‖Δ' + m('x') + '<tspan font-size="14" dy="4">' + m('i') + '</tspan><tspan dy="-4">‖ ≤ </tspan>' + m('ρ'), { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 192, '→ しきい値のまわりの余白', '', { 'font-size': 15, fill: C.ink });
    t2(S.p3, PX, 250, 'ラベルの反転', '', { 'font-size': 16, fill: C.muted });
    txt(S.p3, PX, 290, '最大 ' + m('Γ') + ' 個', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 322, '→ |' + m('g') + ' − ' + m('h') + '| ≥ 2' + m('Γ') + ' の純度', '', { 'font-size': 15, fill: C.ink });
    S.mis3 = t2(g3, 340, AY + 100, '境目の ○ は誤分類として受け入れる', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    t2(g3, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 6 =====
    var g4 = S.g[3];
    t2(g4, 70, 64, '両方に頑健な版の精度の改善（通常版との差、%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var X0 = 300, SC = 45;   // 1% = 45 px
    el('line', { x1: X0, x2: X0, y1: 90, y2: 440, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    t2(g4, X0 + 5.3 * SC / 2, 104, '判定ルールの上側', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    t2(g4, X0 + 5.3 * SC / 2, 290, '下側', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var rows = [['SVM', 5.3, 0], ['ロジスティック回帰', 4.0, 0], ['決定木（対 CART）', 1.3, 0], ['決定木（対 OCT）', 1.4, 0],
                ['SVM', -0.2, 1], ['ロジスティック回帰', 0.4, 1], ['決定木（対 CART）', -0.3, 1], ['決定木（対 OCT）', -0.7, 1]];
    S.rows4 = rows.map(function (rw, i) {
      var y = 132 + i * 38 + (rw[2] ? 34 : 0), o = {};
      t2(g4, X0 - 60, y + 6, rw[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      o.w = Math.abs(rw[1]) * SC; o.neg = rw[1] < 0;
      o.bar = el('rect', { x: X0, y: y - 12, width: 0, height: 24, rx: 3, fill: rw[2] ? C.gray : C.b }, g4);
      o.lab = txt(g4, o.neg ? X0 + 8 : X0 + o.w + 8, y + 6, (rw[1] > 0 ? '+' : '−') + Math.abs(rw[1]).toFixed(1), { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      o.t0 = 25 + (i % 4) * 0.5 + (rw[2] ? 2.4 : 0);
      return o;
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 300, 'log<tspan font-size="13" dy="4">10</tspan><tspan dy="-4"> </tspan>' + m('p') + ' ≥ 0.05' + m('a') + ' − 2.5', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    t2(S.p4, PX, 334, m('p') + '：次元、' + m('a') + '：通常版の学習精度', '', { 'font-size': 14, fill: C.muted });
    t2(S.p4, PX, 360, '係数は論文が手で選んだ値', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 6 の数値（UCI の 75 データ）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'INFORMS JOURNAL ON OPTIMIZATION · 2019';
    el('text', { x: 480, y: 226, 'font-size': 44, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Robust Classification';
    t2(g5, 480, 272, 'ロバストな分類', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 326, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dimitris Bertsimas · Jack Dunn · Colin Pawlowski · Ying Daisy Zhuo';
    el('text', { x: 480, y: 384, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/ijoo.2018.0001';
    t2(g5, 480, 450, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var k1 = seg(t, 1.5, 3);
    S.th1.setAttribute('opacity', k1); S.th1l.setAttribute('opacity', k1);
    S.p1.setAttribute('opacity', seg(t, 3.5, 4.3));
    // scene 2: points jitter, a label is questioned
    S.d2.forEach(function (c, i) {
      var j = Math.sin(t * 3.1 + i * 1.7) * 14 * seg(t, 9.5, 10.5);
      c.setAttribute('cx', PTS[i][0] + j);
    });
    S.err2.setAttribute('opacity', seg(t, 9, 9.8));
    S.q2.setAttribute('opacity', seg(t, 11.5, 12.2));
    S.p2.setAttribute('opacity', seg(t, 10, 10.8));
    // scene 3: threshold moves from 349 to 285 while the margin opens
    var k3 = seg(t, 17.5, 20);
    var x = 349 + (285 - 349) * k3, w = 60 * seg(t, 18.5, 20.5);
    S.th3.setAttribute('x1', x); S.th3.setAttribute('x2', x); S.th3l.setAttribute('x', x);
    S.band.setAttribute('x', x - w / 2); S.band.setAttribute('width', w);
    S.rho.setAttribute('x', x); S.rho.setAttribute('opacity', seg(t, 20, 20.6));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.mis3.setAttribute('opacity', seg(t, 21, 21.6));
    // scene 4
    S.rows4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6), w = o.w * k;
      o.bar.setAttribute('width', w);
      o.bar.setAttribute('x', o.neg ? 300 - w : 300);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
