// =====================================================================
// teaser-scenes.js — De Vos, Bockel-Rickermann, Lessmann & Verbeke (EJOR 2026), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 3 solves the toy
// dose-allocation problem exactly by enumeration (11 dose levels, cost = dose, as in the paper's setup).
// Scene 4 uses the numbers printed in Table 3 (arXiv v2).
// Colours: orange = prediction-centred view (top-k ranking, MISE); blue = ILP dose allocation and its value (AUUC).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '二値の処置では、推定した効果の大きい順に並べ、予算が尽きるまで上位から処置する。', en: '' },
    { ja: '投与量を選べる処置では、<span class="A">最適な量が人によって違い、多すぎると効果が下がる</span>こともある。', en: '' },
    { ja: '論文は予算のもとで各人に投与量を 1 つずつ選ぶ問題を<span class="B">整数線形計画</span>として解く。', en: '' },
    { ja: '半合成データでは、<span class="A">曲線の推定誤差</span>が最も小さい推定器が、<span class="B">割当ての質</span>では最良にならなかった。', en: '' },
    { ja: '推定と割当てを分けておけば、制約や目的を変えても予測モデルを学習し直さずに済む。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- toy dose-effect curves tau(s) with tau(0) = 0 (explainer's example) ----
  function gA(s) { return 0.30 * Math.exp(-Math.pow((s - 0.3) / 0.2, 2)); }
  function gC(s) { return 0.34 * Math.exp(-Math.pow((s - 0.7) / 0.18, 2)); }
  var CURVES = [
    { name: 'A', f: function (s) { return gA(s) - gA(0); } },
    { name: 'B', f: function (s) { return 0.22 * Math.pow(s, 1.5); } },
    { name: 'C', f: function (s) { return gC(s) - gC(0); } }
  ];
  var LEVELS = []; for (var k = 0; k <= 10; k++) LEVELS.push(k / 10);
  // exact solution of the toy problem for budgets 0, 0.1, ..., 2.4 (enumeration of 11^3 choices)
  var SOL = [];
  for (var b = 0; b <= 24; b++) {
    var best = -1, arg = [0, 0, 0];
    for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) for (var l = 0; l <= 10; l++) {
      if (i + j + l > b) continue;
      var v = CURVES[0].f(i / 10) + CURVES[1].f(j / 10) + CURVES[2].f(l / 10);
      if (v > best + 1e-12) { best = v; arg = [i, j, l]; }
    }
    SOL.push({ d: arg, v: best, c: (arg[0] + arg[1] + arg[2]) / 10 });
  }

  // mini panels shared by scenes 2 and 3
  var PW = 150, PY0 = 330, PY1 = 120, TMIN = -0.05, TMAX = 0.36;
  var PXS = [100, 280, 460];
  function px(p, s) { return PXS[p] + s * PW; }
  function py(v) { return PY0 - (v - TMIN) / (TMAX - TMIN) * (PY0 - PY1); }
  function panels(g, showOver) {
    var o = [];
    CURVES.forEach(function (cv, p) {
      var x0 = PXS[p];
      el('line', { x1: x0, x2: x0 + PW + 8, y1: py(0), y2: py(0), stroke: C.ink, 'stroke-width': 1.5 }, g);
      el('line', { x1: x0, x2: x0, y1: PY0, y2: PY1 - 14, stroke: C.ink, 'stroke-width': 1.5 }, g);
      txt(g, x0 + PW / 2, 78, '個体 ' + cv.name, { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      t2(g, x0 + PW + 8, py(0) + 24, '投与量 ' + m('s') + ' →', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      var d = '';
      for (var q = 0; q <= 60; q++) { var s = q / 60; d += (q ? 'L' : 'M') + px(p, s).toFixed(1) + ',' + py(cv.f(s)).toFixed(1); }
      var path = el('path', { d: d, fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      o.push({ path: path });
    });
    t2(g, PXS[0] + 8, PY1 - 10, '↑ 効果 ' + m('τ') + '(' + m('s') + ')', '', { 'font-size': 15, fill: C.ink });
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: binary treatment, sort by CATE, treat top k within budget =====
    var g1 = S.g[0];
    var taus = [6.0, 5.4, 4.9, 4.3, 3.7, 3.1, 2.6, 2.0, 1.3, 0.7];
    S.bars1 = [];
    t2(g1, 90, 52, '個体（推定 CATE ' + m('τ̂') + ' の大きい順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    taus.forEach(function (v, i) {
      var y = 78 + i * 40;
      el('circle', { cx: 104, cy: y + 12, r: 10, fill: C.gray }, g1);
      S.bars1.push(el('rect', { x: 130, y: y, width: v * 72, height: 24, rx: 4, fill: C.gray }, g1));
    });
    S.cut1 = el('line', { x1: 80, x2: 600, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 598, 0, '予算で配れるのは 4 人', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 110, width: 18, height: 18, rx: 3, fill: C.a }, p1);
    t2(p1, PX + 28, 125, '処置する', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 145, width: 18, height: 18, rx: 3, fill: C.gray }, p1);
    t2(p1, PX + 28, 160, '処置しない', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 215, '1 段目：CATE を推定', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '2 段目：大きい順に', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 276, '予算まで上位 ' + m('k') + ' 人', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 324, '決めるのは「するか、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 348, 'しないか」だけ。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: dose-response differs between people; too much dose lowers the effect =====
    var g2 = S.g[1];
    S.pan2 = panels(g2);
    S.pk2 = CURVES.map(function (cv, p) {
      var bs = 0, bv = -1;
      LEVELS.forEach(function (s) { var v = cv.f(s); if (v > bv + 1e-9) { bv = v; bs = s; } });
      var o = {};
      o.over = el('rect', { x: px(p, bs), y: PY1 - 4, width: px(p, 1) - px(p, bs), height: PY0 - PY1 + 4, fill: C.a, opacity: 0 }, g2);
      g2.insertBefore(o.over, g2.firstChild);
      o.dot = el('circle', { cx: px(p, bs), cy: py(bv), r: 8, fill: C.ink }, g2);
      o.lab = t2(g2, px(p, bs), py(bv) - 16, '最適 ' + m('s') + ' = ' + bs.toFixed(1), '', { 'font-size': 14, fill: C.ink, 'text-anchor': bs > 0.85 ? 'end' : 'middle' });
      return o;
    });
    S.overLab = t2(g2, 330, 400, '色の部分：最適な量より多く処置すると効果が下がる（過剰な処置）', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '最適な量は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 156, '人によって違う。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 206, '効果が量に対して', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 232, '単調とは限らない。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 290, '大きい順に並べるだけでは', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 314, '「どれだけ」を決められない。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（曲線は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: ILP chooses one of 11 dose levels per person under a budget =====
    var g3 = S.g[2];
    panels(g3);
    S.lv3 = CURVES.map(function (cv, p) {
      return LEVELS.map(function (s) { return el('circle', { cx: px(p, s), cy: py(cv.f(s)), r: 4.5, fill: C.gray }, g3); });
    });
    S.sel3 = CURVES.map(function () { return el('circle', { cx: 0, cy: 0, r: 10, fill: C.b }, g3); });
    S.selLab3 = CURVES.map(function (cv, p) { return el('text', { x: PXS[p] + PW / 2, y: 372, 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' }, g3); });
    // budget bar
    var BX0 = 100, BX1 = 610, BMAX = 2.4;
    S.bx = function (v) { return BX0 + v / BMAX * (BX1 - BX0); };
    el('rect', { x: BX0, y: 420, width: BX1 - BX0, height: 18, rx: 4, fill: C.panel }, g3);
    S.used3 = el('rect', { x: BX0, y: 420, width: 0, height: 18, rx: 4, fill: C.b }, g3);
    S.bline3 = el('line', { x1: BX0, x2: BX0, y1: 410, y2: 448, stroke: C.ink, 'stroke-width': 2.5 }, g3);
    S.bLab3 = el('text', { x: BX0, y: 470, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g3);
    t2(g3, BX0, 405, '使った費用（費用 = 投与量）と予算 ' + m('B'), '', { 'font-size': 15, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '最大化：効果の合計', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 142, '制約：総費用 ≤ ' + m('B'), '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 174, '各人に投与量を 1 つ', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 206, '（0 から 1 の 11 段階）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 244, '＋ 公平性などの制約', '', { 'font-size': 17, fill: C.b });
    t2(p3, PX, 300, '効果の合計', '', { 'font-size': 15, fill: C.muted });
    S.val3 = txt(p3, PX, 336, '0.00', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    S.sat3 = t2(p3, PX, 380, 'これ以上予算を増やしても', '', { 'font-size': 15, fill: C.ink });
    S.sat3b = t2(p3, PX, 404, '解は変わらない', '', { 'font-size': 15, fill: C.ink });
    t2(g3, 940, 520, '模式図（最適解は全通りを調べて求めた）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 (arXiv v2), MISE vs AUUC@140 (ILP) =====
    var g4 = S.g[3];
    var rows = [['S-Learner (rf)', 0.060, 0.892], ['S-Learner (mlp)', 0.044, 0.829], ['DRNet', 0.049, 0.799], ['VCNet', 0.055, 0.827]];
    var MX0 = 230, MX1 = 360, MMAX = 0.07, AX0 = 440, AX1 = 600, AMIN = 0.6, AMAX = 0.95, Y0 = 150, DY = 70;
    function mx(v) { return MX0 + v / MMAX * (MX1 - MX0); }
    function ax(v) { return AX0 + (v - AMIN) / (AMAX - AMIN) * (AX1 - AX0); }
    t2(g4, MX0, 80, 'MISE', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(g4, MX0, 104, '小さいほど良い', '', { 'font-size': 14, fill: C.muted });
    t2(g4, AX0, 80, 'AUUC@140（ILP）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(g4, AX0, 104, '大きいほど良い（0.6 から）', '', { 'font-size': 14, fill: C.muted });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: MX0 - 14, y: y + 6, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = r[0];
      o.m = el('rect', { x: MX0, y: y - 13, width: 0, height: 26, rx: 4, fill: C.a }, g4); o.mw = mx(r[1]) - MX0;
      o.a = el('rect', { x: AX0, y: y - 13, width: 0, height: 26, rx: 4, fill: C.b }, g4); o.aw = ax(r[2]) - AX0;
      o.ml = el('text', { x: mx(r[1]) + 6, y: y + 6, 'font-size': 15, fill: C.ink }, g4); o.ml.textContent = r[1].toFixed(3);
      o.al = el('text', { x: ax(r[2]) + 6, y: y + 6, 'font-size': 15, fill: C.ink }, g4); o.al.textContent = r[2].toFixed(3);
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'MISE 最小の S-Learner (mlp)', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 156, 'は AUUC で 2 番目', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 206, 'MISE 最大の S-Learner (rf)', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 232, 'が AUUC で最良', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 290, '効果の小さい区間の誤差は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 314, '割当てにほとんど響かない', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 352, 'IHDP の半合成データ', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 3（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH · 2026';
    el('text', { x: 480, y: 202, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Uplift modeling with continuous treatments:';
    el('text', { x: 480, y: 246, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'A predict-then-optimize approach';
    t2(g5, 480, 292, '連続値の処置を扱うアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Simon De Vos · Christopher Bockel-Rickermann · Stefan Lessmann · Wouter Verbeke';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/SimonDeVos/UMCT';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: budget line slides down to after the 4th person, top bars turn orange
    var yc = 70 + seg(t, 1.2, 3.5) * (78 + 4 * 40 - 8 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.4));
    S.cutLab1.setAttribute('transform', 'translate(0,' + (yc + 22) + ')');
    S.cutLab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 4 ? H.mix(C.gray, C.a, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: curves draw, then optimum markers, then over-treatment regions
    S.pan2.forEach(function (o, i) {
      var len = 600, k = seg(t, 8.8 + i * 0.5, 10.6 + i * 0.5);
      o.path.setAttribute('stroke-dasharray', len); o.path.setAttribute('stroke-dashoffset', len * (1 - k));
    });
    S.pk2.forEach(function (o, i) {
      var s = seg(t, 11.6 + i * 0.3, 12.1 + i * 0.3);
      o.dot.setAttribute('opacity', s); o.lab.setAttribute('opacity', s);
      o.over.setAttribute('opacity', 0.16 * seg(t, 13, 13.8));
    });
    S.overLab.setAttribute('opacity', seg(t, 13.2, 13.9));
    S.p2.setAttribute('opacity', seg(t, 9.2, 10));
    // scene 3: budget sweeps from 0 to 2.4, chosen doses follow the exact solution
    var B = 2.4 * seg(t, 17.2, 22.4), kb = Math.min(24, Math.floor(B * 10 + 1e-9)), sol = SOL[kb];
    S.sel3.forEach(function (c, p) {
      var s = sol.d[p] / 10;
      c.setAttribute('cx', px(p, s)); c.setAttribute('cy', py(CURVES[p].f(s)));
      S.selLab3[p].textContent = 's = ' + s.toFixed(1);
    });
    S.used3.setAttribute('width', S.bx(sol.c) - S.bx(0));
    S.bline3.setAttribute('x1', S.bx(B)); S.bline3.setAttribute('x2', S.bx(B));
    S.bLab3.setAttribute('x', S.bx(B)); S.bLab3.textContent = 'B = ' + (kb / 10).toFixed(1);
    S.val3.textContent = sol.v.toFixed(2);
    var sat = kb >= 20 ? seg(t, 22, 22.6) : 0;
    S.sat3.setAttribute('opacity', sat); S.sat3b.setAttribute('opacity', sat);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.3));
    // scene 4: bars grow row by row
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.7);
      o.m.setAttribute('width', o.mw * s); o.a.setAttribute('width', o.aw * s);
      o.ml.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 0.9)); o.al.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
