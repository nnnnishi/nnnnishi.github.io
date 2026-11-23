// =====================================================================
// teaser-scenes.js — Verbeke, Olaya, Guerry & Van Belle (EJOR 2023), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics: points are made-up instances (labelled 模式図). The cost-benefit values
// b11 = 120, b10 = 100, c01 = c11 = 10 are the paper's first experimental scenario (arXiv v1, Sec. 5.2),
// which give gamma = 0.1 and delta = -0.2. Scene 4 uses Table 3 (average causal profit) of arXiv v1.
// Colours: orange = ITE ranking (cost-insensitive); blue = expected causal profit / ECP ranker.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'これまでは推定した処置効果（ITE）が<span class="A">大きい順</span>に並べ、上から処置してきた。', en: '' },
    { ja: 'ITE が同じでも、処置したときに陽性になる確率と費用・便益によって<span class="B">期待因果利益</span>は変わる。', en: '' },
    { ja: '論文は決定境界 t = γ + δP<sub>11</sub> を導き、処置できる数が限られるときは<span class="B">期待因果利益</span>の大きい順に選ぶ。', en: '' },
    { ja: '処置すると陽性時の便益が増える設定では、24 組すべてで<span class="B">ECP</span> の平均因果利益が<span class="A">ITE 順</span>を上回った。', en: '' },
    { ja: '処置するかどうかは ITE と P<sub>11</sub> と費用・便益から計算した期待因果利益で決める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;   // right-hand explanation column
  var GAM = 0.1, DEL = -0.2, TC = 0.15;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function p11() { return m('P') + '<tspan font-size="0.7em" dy="4">11</tspan><tspan dy="-4"> </tspan>'; }

  // plane (P11, t) shared by scenes 1 and 3
  var AX0 = 90, AX1 = 560, TLO = -0.5, THI = 0.7, AY0 = 470, AY1 = 70;
  function sx(p) { return AX0 + p * (AX1 - AX0); }
  function sy(v) { return AY0 - (v - TLO) / (THI - TLO) * (AY0 - AY1); }
  function plane(g) {
    // feasible set: P11 - 1 <= t <= P11, clipped to the visible t range
    var pts = [[0, 0], [0.7, 0.7], [1, 0.7], [1, 0], [0.5, -0.5], [0, -0.5]];
    el('polygon', { points: pts.map(function (q) { return sx(q[0]) + ',' + sy(q[1]); }).join(' '), fill: C.panel }, g);
    el('line', { x1: AX0, x2: AX1 + 10, y1: sy(0), y2: sy(0), stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g);
    t2(g, (AX0 + AX1) / 2, AY0 + 34, '処置したときの陽性確率 ' + p11() + '→', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g, AX0 + 10, AY1 - 18, '↑ 推定した処置効果 ' + m('t'), '', { 'font-size': 16, fill: C.ink });
    [[0, '0'], [1, '1']].forEach(function (q) { txt(g, sx(q[0]), AY0 + 34, q[1], { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }); });
    [[0, '0'], [0.5, '0.5'], [-0.5, '−0.5']].forEach(function (q) { txt(g, AX0 - 10, sy(q[0]) + 5, q[1], { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }); });
  }
  function dots(g, seed) {
    var r = rng(seed), out = [];
    while (out.length < 54) {
      var p = 0.04 + r() * 0.92, v = -0.42 + r() * 1.05;
      if (v > p - 0.04 || v < p - 0.96 || v > 0.62) continue;
      out.push({ p: p, v: v, k: r(), c: el('circle', { cx: sx(p), cy: sy(v), r: 7, fill: C.gray }, g) });
    }
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: ITE ranking, horizontal threshold =====
    var g1 = S.g[0];
    plane(g1);
    S.pts1 = dots(g1, 5);
    S.cut1 = el('line', { x1: AX0, x2: AX1, y1: sy(0), y2: sy(0), stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, g1);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '並べる基準：' + m('t') + ' だけ', '', { 'font-size': 19, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 170, '費用を考えないなら', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 196, m('t') + ' &gt; 0 の全員に処置する。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 246, '処置できる数が限られると', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 272, '線を上げて ' + m('t') + ' &gt; ' + m('t') + '<tspan font-size="0.7em" dy="4">c</tspan><tspan dy="-4"> </tspan>に絞る。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 322, '境界は ' + p11() + 'によらず水平。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（点は架空の対象者）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two instances, same t, different P11 =====
    var g2 = S.g[1];
    var U = 10;   // px per monetary unit
    S.cards = [['A', 0.3, 6, 80], ['B', 0.9, 18, 340]].map(function (c) {
      var x = c[3], o = {};
      el('rect', { x: x, y: 70, width: 230, height: 390, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      txt(g2, x + 20, 112, '対象者 ' + c[0], { 'font-size': 22, 'font-weight': 650, fill: C.ink });
      t2(g2, x + 20, 160, '推定 ITE ' + m('t') + ' = 0.1', '', { 'font-size': 17, fill: C.ink });
      el('rect', { x: x + 20, y: 174, width: 40, height: 16, rx: 3, fill: C.a }, g2);
      t2(g2, x + 20, 236, p11() + '= ' + c[1], '', { 'font-size': 17, fill: C.ink });
      t2(g2, x + 20, 300, '期待因果利益', '', { 'font-size': 17, fill: C.ink });
      o.bar = el('rect', { x: x + 20, y: 314, width: 0, height: 18, rx: 3, fill: C.b }, g2);
      o.full = c[2] * U;
      o.res = t2(g2, x + 20, 380, '+' + c[2] + ' 単位', '', { 'font-size': 24, 'font-weight': 650, fill: C.b });
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 120, '論文の実験の設定 1', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 160, '陽性の便益：処置あり 120、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 184, '処置なし 100', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 214, '処置の費用：10', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 264, '処置すると陽性時の便益が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 290, '増えるので、陽性になりやすい', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 316, 'B のほうが利益が大きい。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 366, '期待因果利益 = 処置した場合の', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 390, '期待利益 − 処置しない場合の期待利益', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（' + m('t') + ' と ' + p11() + 'は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: cost-sensitive boundary t = gamma + delta * P11 =====
    var g3 = S.g[2];
    plane(g3);
    S.pts3 = dots(g3, 5);
    // same number of treated instances as the ITE quota in scene 1: shift the boundary up in parallel
    var nq = S.pts3.filter(function (q) { return q.v > TC; }).length;
    var sc = S.pts3.map(function (q) { return q.v - DEL * q.p; }).sort(function (a, b) { return b - a; });
    S.g2 = (sc[nq - 1] + sc[nq]) / 2;
    S.pts3.forEach(function (q) { q.ite = q.v > TC; q.ecp = q.v - DEL * q.p > S.g2; });
    el('line', { x1: AX0, x2: AX1, y1: sy(TC), y2: sy(TC), stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '8 5', opacity: 0.6 }, g3);
    S.bound0 = el('line', { x1: sx(0), y1: sy(GAM), x2: sx(1), y2: sy(GAM + DEL), stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '3 4' }, g3);
    S.bound = el('line', { x1: sx(0), y1: sy(GAM), x2: sx(0), y2: sy(GAM), stroke: C.b, 'stroke-width': 3.5 }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 130, m('t') + ' &gt; ' + m('γ') + ' + ' + m('δ') + p11(), { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 180, '設定 1 では ' + m('γ') + ' = 0.1、' + m('δ') + ' = −0.2', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 226, r: 7, fill: C.b }, p3);
    t2(p3, PX + 26, 232, '境界より上：処置する', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 262, r: 7, fill: C.gray }, p3);
    t2(p3, PX + 26, 268, '境界より下：処置しない', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 318, '処置できる数を場面 1 と同じに', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 344, 'するには、境界を平行に上げる。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 380, m('t') + ' が小さくても ' + p11() + 'が大きい人が', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 406, '入れ替わりで選ばれる（大きい点）。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（点は架空、点線は上限なしの境界）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 (arXiv v1), T-learner + XGBoost, scenario b11 > b10 =====
    var g4 = S.g[3];
    var rows = [['Synthetic', 3.93, 6.52], ['Bank', 9.96, 12.45], ['Criteo', 20.39, 21.71], ['Hillstrom', -2.03, -1.73]];
    var X0 = 200, X1 = 560, LO = -5, HI = 25, Y0 = 150, DY = 70;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 60, 66, '平均因果利益（1 人あたり、T-learner + XGBoost）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 10, 20].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 36, y2: Y0 + DY * 3 + 30, stroke: v === 0 ? C.muted : C.hair }, g4);
      txt(g4, cx(v), Y0 + DY * 3 + 56, String(v), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      txt(g4, X0 - 18, y + 5, rw[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.ln = el('line', { x1: cx(rw[1]), x2: cx(rw[2]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 4 }, g4);
      o.a = el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: C.a }, g4);
      o.b = el('circle', { cx: cx(rw[2]), cy: y, r: 10, fill: C.b }, g4);
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 9, fill: C.b }, p4);
    t2(p4, PX + 26, 111, 'ECP ランカー', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 9, fill: C.a }, p4);
    t2(p4, PX + 26, 146, 'ITE ランカー', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 200, 'ECP が上回った組合せ', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 244, '24 / 24', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 274, '便益 120 対 100（設定 1）', '', { 'font-size': 15, fill: C.ink });
    txt(p4, PX, 326, '7 / 24', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 356, '便益 100 対 120（設定 2）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 392, '4 データ × 3 学習器 × 2 基本モデル', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 3（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH · 2023';
    el('text', { x: 480, y: 198, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'To do or not to do? Cost-sensitive causal';
    el('text', { x: 480, y: 240, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'classification with individual treatment';
    el('text', { x: 480, y: 282, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'effect estimates';
    t2(g5, 480, 326, '個別処置効果の推定値を使う、費用を考慮した因果分類', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 376, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Wouter Verbeke · Diego Olaya · Marie-Anne Guerry · Jente Van Belle';
    el('text', { x: 480, y: 420, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1016/j.ejor.2022.03.049';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: threshold rises from t = 0 to t = TC, points above turn orange
    var th = TC * seg(t, 3.6, 5.2), yc = sy(th);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.5));
    S.pts1.forEach(function (q) {
      var on = q.v > th, s = seg(t, 1.6 + q.k * 1.2, 2.1 + q.k * 1.2);
      q.c.setAttribute('fill', on ? H.mix(C.gray, C.a, s) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: expected causal profit bars grow
    S.cards.forEach(function (o, i) {
      o.bar.setAttribute('width', o.full * seg(t, 10 + i * 0.8, 12 + i * 0.8));
      o.res.setAttribute('opacity', seg(t, 12.6 + i * 0.6, 13.2 + i * 0.6));
    });
    // scene 3: boundary draws from P11 = 0 to 1, points re-coloured by the new rule
    var k = seg(t, 17, 18.6), up = (S.g2 - GAM) * seg(t, 19, 20);
    S.bound.setAttribute('y1', sy(GAM + up));
    S.bound.setAttribute('x2', sx(k)); S.bound.setAttribute('y2', sy(GAM + up + DEL * k));
    S.bound0.setAttribute('opacity', seg(t, 19, 19.6));
    S.pts3.forEach(function (q) {
      var s = seg(t, 20.2 + q.k * 1.2, 20.7 + q.k * 1.2);
      var from = q.ite ? C.a : C.gray, to = q.ecp ? C.b : C.gray;
      q.c.setAttribute('fill', H.mix(from, to, s));
      q.c.setAttribute('r', q.ite !== q.ecp ? 7 + 2 * s : 7);
    });
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: rows appear in order, then the counts
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.a.setAttribute('opacity', s); o.b.setAttribute('opacity', s); o.ln.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
