// =====================================================================
// teaser-scenes.js — Yan et al., "An End-to-End Framework for Marketing Effectiveness Optimization
// under Budget Constraint" (arXiv 2302.04477 v1), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図); scene 2's bars and scene 3's curve are toy shapes.
// Scene 4 uses Table 1 (AUCC on CRITEO-UPLIFT v2) and the online A/B numbers stated in Sec. 4.6.2 (Online Evaluation).
// Colours: orange = two-stage paradigm (TSM-SL); blue = marketing goal Q and the paper's method.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'これまでの二段階法では反応とコストを予測してから、その予測を係数にして予算の配分を解く。', en: '' },
    { ja: '予算が少ないと配る相手は一部に限られ、平均の予測精度が上がっても<span class="A">その一部で外せば成果は下がる</span>。', en: '' },
    { ja: 'この論文は予算内で得られる1人あたりの反応 <span class="B">Q</span> を RCT データから推定し、学習の目的に加える。', en: '' },
    { ja: 'CRITEO-UPLIFT v2 の AUCC と快手のオンライン実験で、<span class="B">提案法</span>が<span class="A">二段階法</span>を上回った。', en: '' },
    { ja: '予測の当てはまりに加えて、予算内の成果そのものを勾配の推定で学習に組み込む。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function arrow(g, x1, y1, x2, y2, col) {
    var o = el('g', {}, g);
    el('line', { x1: x1, y1: y1, x2: x2, y2: y2 - 8, stroke: col, 'stroke-width': 2.5 }, o);
    el('path', { d: 'M' + (x2 - 7) + ',' + (y2 - 10) + ' L' + x2 + ',' + y2 + ' L' + (x2 + 7) + ',' + (y2 - 10) + ' z', fill: col }, o);
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the two-stage pipeline =====
    var g1 = S.g[0];
    var boxes = [
      ['RCT データ', C.panel, 'none'],
      ['予測モデル（S-Learner）', '#fff', C.a],
      ['反応 ' + m('v') + '・コスト ' + m('c') + ' の予測', '#fff', C.ink],
      ['整数計画（MCKP）を解く', '#fff', C.ink],
      ['一人ひとりへの配分', C.panel, 'none']
    ];
    S.box1 = boxes.map(function (b, i) {
      var y = 52 + i * 92, o = el('g', {}, g1);
      el('rect', { x: 110, y: y, width: 270, height: 54, rx: 10, fill: b[1], stroke: b[2], 'stroke-width': b[2] === 'none' ? 0 : 2 }, o);
      t2(o, 245, y + 34, b[0], '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    S.arr1 = [0, 1, 2, 3].map(function (i) { return arrow(g1, 245, 106 + i * 92, 245, 144 + i * 92, C.muted); });
    S.lab1a = t2(g1, 400, 176, '目的 1：予測の誤差を小さくする', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    S.lab1b = t2(g1, 400, 360, '目的 2：予算内の反応を大きくする', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '二段階法', '', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 172, '第 1 段：処置ごとの', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 198, '反応とコストを予測', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 246, '第 2 段：予測を係数に', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 272, '予算のもとで配分', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 330, '予測モデルは第 2 段の', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 354, '成果を知らずに学習する。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: small budget, only a few users matter =====
    var g2 = S.g[1];
    var r = rng(7); S.dots2 = [];
    t2(g2, 80, 56, '利用者（予算が少ないときに配るのは● の 6 人だけ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var pick = { 3: 1, 11: 1, 17: 1, 26: 1, 32: 1, 38: 1 };
    for (var i = 0; i < 40; i++) {
      var cx = 100 + (i % 10) * 52 + (r() - 0.5) * 10, cy = 96 + Math.floor(i / 10) * 44 + (r() - 0.5) * 8;
      S.dots2.push({ c: el('circle', { cx: cx, cy: cy, r: 11, fill: C.gray }, g2), on: !!pick[i] });
    }
    var rowsY = [328, 420];
    t2(g2, 290, 300, '全員の平均誤差', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, 500, 300, '6 人での誤差', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var models = [['モデル A', 60, 150, '成果は低い', C.a], ['モデル B', 90, 50, '成果は高い', C.ink]];
    S.bars2 = models.map(function (mm, k) {
      var y = rowsY[k], o = {};
      t2(g2, 80, y + 20, mm[0], '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      o.b1 = el('rect', { x: 215, y: y, width: 0, height: 26, rx: 4, fill: C.gray }, g2); o.w1 = mm[1];
      o.b2 = el('rect', { x: 425, y: y, width: 0, height: 26, rx: 4, fill: k === 0 ? C.a : C.gray }, g2); o.w2 = mm[2];
      o.res = t2(g2, 215, y + 60, mm[3], '', { 'font-size': 16, 'font-weight': 600, fill: mm[4] });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 140, 'モデル A は平均では', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 166, 'B より正確だが、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 192, '配る 6 人で外れる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 250, '予測の目的と配分の', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 276, '目的がずれる例', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 302, '（論文の序論の議論）', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（人数と棒の長さは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: EOM curve, bisection on alpha, Q =====
    var g3 = S.g[2];
    var AX0 = 110, AX1 = 590, AY0 = 450, AY1 = 80;
    function fx(u) { return AX0 + u * (AX1 - AX0); }
    function fv(u) { return 0.15 + 0.8 * (1 - Math.exp(-3.2 * u)); }
    function fy(u) { return AY0 - fv(u) * (AY0 - AY1); }
    S.fx = fx; S.fy = fy;
    el('line', { x1: AX0, x2: AX1 + 10, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 20, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX1, AY0 + 30, '1人あたりのコスト ' + m('C') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, AX0 + 10, AY1 - 30, '↑ 1人あたりの反応 ' + m('V') + '（RCT データで推定）', '', { 'font-size': 16, fill: C.ink });
    var d = '';
    for (var k = 0; k <= 60; k++) { var u = 0.05 + k / 60 * 0.9; d += (k ? 'L' : 'M') + fx(u).toFixed(1) + ',' + fy(u).toFixed(1); }
    S.curve = el('path', { d: d, stroke: C.ink, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': 1200, 'stroke-dashoffset': 1200 }, g3);
    var UB = 0.45;
    S.budget = el('g', {}, g3);
    el('line', { x1: fx(UB), x2: fx(UB), y1: AY0, y2: AY1, stroke: C.muted, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, S.budget);
    t2(S.budget, fx(UB) + 8, AY0 - 12, '予算 ' + m('T') + '/' + m('B'), '', { 'font-size': 15, fill: C.muted });
    S.steps = [0.85, 0.25, 0.6, 0.38, 0.5, 0.45];
    S.marks = S.steps.map(function (u) { return el('circle', { cx: fx(u), cy: fy(u), r: 8, fill: C.gray }, g3); });
    S.qline = el('line', { x1: AX0, x2: fx(UB), y1: fy(UB), y2: fy(UB), stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g3);
    S.qlab = txt(g3, AX0 + 10, fy(UB) - 10, m('Q'), { 'font-size': 26, 'font-weight': 650, fill: C.b });
    S.qdot = el('circle', { cx: fx(UB), cy: fy(UB), r: 11, fill: C.b }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, m('α') + ' を動かすと予算が変わる', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 140, '→ 二分探索で予算に合わせる', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 190, 'そのときの反応が ' + m('Q'), '', { 'font-size': 17, fill: C.b, 'font-weight': 600 });
    var p3b = S.p3b = el('g', {}, g3);
    txt(p3b, PX, 262, m('L') + '<tspan font-size="14" dy="5">R</tspan><tspan dy="-5"> = </tspan>' + '<tspan fill="#C2410C">' + m('L') + '<tspan font-size="14" dy="5">SL</tspan></tspan><tspan dy="-5"> − </tspan><tspan fill="#1D4ED8">' + m('λ') + m('Q') + '</tspan>', { 'font-size': 28, 'font-weight': 600, fill: C.ink });
    t2(p3b, PX, 310, m('Q') + ' は微分できないので、', '', { 'font-size': 16, fill: C.ink });
    t2(p3b, PX, 336, '勾配を有限差分か NES で', '', { 'font-size': 16, fill: C.ink });
    t2(p3b, PX, 362, '推定して学習する', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（曲線の形は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 AUCC + online A/B =====
    var g4 = S.g[3];
    var rows = [['TSM-SL', 0.7561, C.a], ['Direct Rank', 0.7562, C.gray], ['DRP', 0.7739, C.gray], ['Ours-NES', 0.7849, C.b], ['Ours-FD', 0.7904, C.b]];
    var X0 = 210, X1 = 560, LO = 0.74, HI = 0.80, Y0 = 110, DY = 62;
    function bx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 62, 'CRITEO-UPLIFT v2 の AUCC', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    [0.74, 0.76, 0.78, 0.80].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 16, y2: Y0 + DY * 5 - 18, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + DY * 5 + 6, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(2);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 14, y: y + 20, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.r = el('rect', { x: X0, y: y, width: 0, height: 30, rx: 4, fill: rw[2] }, g4); o.w = bx(rw[1]) - X0;
      o.t = el('text', { x: bx(rw[1]) + 8, y: y + 21, 'font-size': 16, fill: C.ink }, g4); o.t.textContent = rw[1].toFixed(4);
      o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '快手のオンライン A/B テスト', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 136, '（二段階法との比較）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 186, '1人あたりの反応', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 226, '+1.24%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 274, '1人あたりのコスト', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 312, '−0.369%', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 360, '1,420 万人・1 週間', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 1 と本文の数値から作図（横軸は 0.74 から）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2023';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'An End-to-End Framework for Marketing';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Effectiveness Optimization under Budget Constraint';
    t2(g5, 480, 290, '予算制約のもとでマーケティング効果を最適化するエンドツーエンドの枠組み', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Ziang Yan · Shusen Wang · Guorui Zhou · Jingjian Lin · Peng Jiang';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2302.04477';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: boxes and arrows appear top to bottom, then the two objectives
    S.box1.forEach(function (o, i) { o.setAttribute('opacity', seg(t, 0.6 + i * 0.7, 1.1 + i * 0.7)); });
    S.arr1.forEach(function (o, i) { o.setAttribute('opacity', seg(t, 0.9 + i * 0.7, 1.3 + i * 0.7)); });
    S.lab1a.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.lab1b.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: six users light up, then error bars, then verdicts
    S.dots2.forEach(function (q, i) {
      q.c.setAttribute('fill', q.on ? H.mix(C.gray, C.ink, seg(t, 9.2 + (i % 6) * 0.1, 9.9 + (i % 6) * 0.1)) : C.gray);
      q.c.setAttribute('opacity', q.on ? 1 : 1 - 0.5 * seg(t, 9.4, 10));
    });
    S.bars2.forEach(function (o, k) {
      o.b1.setAttribute('width', o.w1 * seg(t, 10.4 + k * 0.4, 11.4 + k * 0.4));
      o.b2.setAttribute('width', o.w2 * seg(t, 11.6 + k * 0.4, 12.6 + k * 0.4));
      o.res.setAttribute('opacity', seg(t, 13.2 + k * 0.3, 13.8 + k * 0.3));
    });
    S.p2.setAttribute('opacity', seg(t, 13.6, 14.3));
    // scene 3: curve draws, bisection points hop toward the budget, Q appears, then the loss
    S.curve.setAttribute('stroke-dashoffset', 1200 * (1 - seg(t, 16.6, 18)));
    S.budget.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.marks.forEach(function (c, i) {
      var a = 18.4 + i * 0.45, on = seg(t, a, a + 0.25), last = i === S.marks.length - 1;
      var fade = last ? 1 : 1 - 0.6 * seg(t, a + 0.45, a + 0.7);
      c.setAttribute('opacity', on * fade);
      c.setAttribute('fill', last ? C.b : C.gray);
    });
    var q = seg(t, 21.2, 21.8);
    S.qline.setAttribute('opacity', q); S.qlab.setAttribute('opacity', q); S.qdot.setAttribute('opacity', q);
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    S.p3b.setAttribute('opacity', seg(t, 21.8, 22.5));
    // scene 4: bars grow in order, then the online numbers
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.r.setAttribute('width', o.w * s); o.t.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
