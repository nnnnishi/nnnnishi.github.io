// =====================================================================
// teaser-scenes.js — Luedtke & van der Laan, "Optimal Individualized Treatments in Resource-Limited
// Settings" (Int. J. Biostat. 2016; numbers from the PMC author manuscript PMC6052884), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 use a schematic dot field of 60 people with explainer-chosen effects (labelled 模式図).
// Scene 4 uses the values of Simulation 2 (Section 6.1.2) and the CI widths stated in Section 7.
// Colours: orange = unconstrained rule (treat if effect > 0); blue = resource-constrained rule (threshold tau0).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '処置が無制限なら、<span class="A">効果が少しでも正の人を全員処置する</span>のが最適なルールになる。', en: '' },
    { ja: '処置できる人の割合に上限 κ があると、このルールは実行できない。', en: '' },
    { ja: '論文の最適なルールは<span class="B">効果の上側 κ 分位点をしきい値</span>にして、それを上回る人だけを処置する。', en: '' },
    { ja: '全員に効果があるシミュレーションでは、処置できる割合を 10% に限ると、最適な価値は 0.583 から 0.337 に下がった。', en: '' },
    { ja: '資源が限られるときの最適なルールは効果の分位点で決まり、その価値は信頼区間つきで推定できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // schematic histogram of effects: bins of width 0.05 starting at -0.20 (explainer-chosen counts, 60 people)
  var COUNTS = [1, 2, 4, 8, 10, 10, 7, 6, 5, 3, 2, 1, 1];
  var LO = -0.2, BW = 0.05, XS = 760, AX = 60, BASE = 420, DY = 19, R = 7.5;
  function xv(v) { return AX + (v - LO) * XS; }
  var DOTS = [];
  COUNTS.forEach(function (c, b) {
    for (var j = 0; j < c; j++) DOTS.push({ lo: LO + b * BW, x: xv(LO + (b + 0.5) * BW), y: BASE - 14 - j * DY });
  });
  var N = DOTS.length;   // 60
  function share(th) { return DOTS.filter(function (d) { return d.lo >= th - 1e-9; }).length / N; }

  function field(g) {
    var dots = DOTS.map(function (d) { return el('circle', { cx: d.x, cy: d.y, r: R, fill: C.gray }, g); });
    el('line', { x1: AX - 10, x2: xv(0.46), y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g);
    [-0.2, 0, 0.2, 0.4].forEach(function (v) {
      el('line', { x1: xv(v), x2: xv(v), y1: BASE, y2: BASE + 6, stroke: C.ink }, g);
      el('text', { x: xv(v), y: BASE + 26, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = v.toFixed(1).replace('-', '−');
    });
    t2(g, xv(0.46), BASE + 52, '条件付き効果 →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, AX, 60, '60 人の効果の分布', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g, 940, 520, '模式図（効果は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    return dots;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: unconstrained rule =====
    var g1 = S.g[0];
    S.d1 = field(g1);
    el('line', { x1: xv(0), x2: xv(0), y1: 90, y2: BASE, stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g1);
    t2(g1, xv(0) + 8, 104, 'しきい値 0', '', { 'font-size': 15, fill: C.a });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 120, '制約のない最適なルール', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p1, PX, 156, '効果が正なら処置する', '', { 'font-size': 17, fill: C.ink });
    S.tot1 = el('g', {}, g1);
    t2(S.tot1, PX, 230, '処置する割合', '', { 'font-size': 16, fill: C.muted });
    txt(S.tot1, PX, 280, '75%', { 'font-size': 44, 'font-weight': 650, fill: C.a });

    // ===== scene 2: capacity kappa =====
    var g2 = S.g[1];
    t2(g2, 70, 100, '処置する割合', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    var BX = 70, BWD = 520;
    el('rect', { x: BX, y: 170, width: BWD, height: 46, rx: 6, fill: C.panel }, g2);
    S.need = el('rect', { x: BX, y: 170, width: 0, height: 46, rx: 6, fill: C.a }, g2);
    t2(g2, BX, 160, '制約なしのルールが必要とする割合', '', { 'font-size': 15, fill: C.a });
    S.needLab = txt(g2, BX + BWD * 0.75 + 10, 202, '75%', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    el('rect', { x: BX, y: 300, width: BWD, height: 46, rx: 6, fill: C.panel }, g2);
    S.cap = el('rect', { x: BX, y: 300, width: 0, height: 46, rx: 6, fill: C.ink, opacity: 0.85 }, g2);
    t2(g2, BX, 290, '資源が許す割合の上限', '', { 'font-size': 15, fill: C.ink });
    S.capLab = txt(g2, BX + BWD * 0.3 + 10, 332, m('κ') + ' = 30%', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    S.capLine = el('line', { x1: BX + BWD * 0.3, x2: BX + BWD * 0.3, y1: 226, y2: 360, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g2);
    [0, 0.5, 1].forEach(function (v) {
      el('text', { x: BX + BWD * v, y: 384, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = (v * 100) + '%';
    });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 150, '処置できるのは', '', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 206, m('κ') + ' = 30%', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    t2(S.p2, PX, 256, '効果が正の人でも、', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 282, '全員は処置できない', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（割合は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: kappa-quantile threshold =====
    var g3 = S.g[2];
    S.d3 = field(g3);
    S.th = el('line', { x1: 0, x2: 0, y1: 90, y2: BASE, stroke: C.b, 'stroke-width': 3 }, g3);
    S.thLab = txt(g3, 0, 104, m('τ') + '₀', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, m('τ') + '₀ = max{' + m('η') + '₀, 0}', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    t2(S.p3, PX, 146, m('η') + '₀：効果の上側 ' + m('κ') + ' 分位点', '', { 'font-size': 15, fill: C.muted });
    t2(S.p3, PX, 190, 'しきい値を上回る人を処置', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 216, '境目の層は無作為に処置', '', { 'font-size': 17, fill: C.ink });
    S.tot3 = el('g', {}, g3);
    t2(S.tot3, PX, 272, '処置する割合', '', { 'font-size': 16, fill: C.muted });
    S.shareTxt = txt(S.tot3, PX, 322, '75%', { 'font-size': 44, 'font-weight': 650, fill: C.b });

    // ===== scene 4: Simulation 2 values (Section 6.1.2) and CI widths (Section 7) =====
    var g4 = S.g[3];
    var rows = [['処置なし', 0.300, C.gray], [m('κ') + ' = 0.1', 0.337, C.b], [m('κ') + ' = 0.9', 0.572, C.b], ['制約なし', 0.583, C.a]];
    var BX0 = 200, BX1 = 580, HI = 0.6, Y0 = 130, RD = 70;
    function bx(v) { return BX0 + v / HI * (BX1 - BX0); }
    t2(g4, 70, 70, 'シミュレーション 2 の最適な価値', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.2, 0.4, 0.6].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 34, y2: Y0 + RD * 3 + 30, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + RD * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + RD * i, o = {};
      txt(g4, BX0 - 14, y + 6, rw[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX0, y: y - 16, width: 0, height: 32, rx: 3, fill: rw[2] }, g4);
      o.lab = el('text', { x: bx(rw[1]) + 8, y: y + 7, 'font-size': 17, fill: C.ink }, g4); o.lab.textContent = rw[1].toFixed(3);
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.7;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 110, '効果はすべての人で正', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 160, '信頼区間の平均の幅', '', { 'font-size': 16, fill: C.muted });
    [['n = 100', '0.25〜0.26'], ['n = 200', '0.17〜0.18'], ['n = 1,000', '約 0.08']].forEach(function (r, i) {
      txt(S.p4, PX, 200 + i * 40, r[0], { 'font-size': 17, fill: C.ink });
      t2(S.p4, PX + 100, 200 + i * 40, r[1], '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    });
    t2(g4, 940, 520, '論文 6.1.2 節・7 節の数値（PMC 著者稿）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'THE INTERNATIONAL JOURNAL OF BIOSTATISTICS · 2016';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Individualized Treatments';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'in Resource-Limited Settings';
    t2(g5, 480, 296, '資源が限られる場合の最適な個別化処置', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Alexander R. Luedtke · Mark J. van der Laan';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1515/ijb-2015-0007';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: positive-effect dots turn orange from right to left
    S.d1.forEach(function (c, i) {
      var d = DOTS[i], on = d.lo >= -1e-9;
      var k = on ? seg(t, 2 + (0.45 - d.lo) * 6, 2.6 + (0.45 - d.lo) * 6) : 0;
      c.setAttribute('fill', H.mix(C.gray, C.a, k));
    });
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    S.tot1.setAttribute('opacity', seg(t, 5, 5.6));
    // scene 2
    S.need.setAttribute('width', 520 * 0.75 * seg(t, 9, 10.5));
    S.needLab.setAttribute('opacity', seg(t, 10.3, 10.8));
    S.cap.setAttribute('width', 520 * 0.3 * seg(t, 11, 12.2));
    S.capLab.setAttribute('opacity', seg(t, 12, 12.5));
    S.capLine.setAttribute('opacity', seg(t, 12.2, 12.8));
    S.p2.setAttribute('opacity', seg(t, 13, 13.6));
    // scene 3: threshold slides from 0 to the kappa-quantile (0.15)
    var th = lerp(0, 0.15, seg(t, 18.2, 21.2));
    var tx = xv(th);
    S.th.setAttribute('x1', tx); S.th.setAttribute('x2', tx);
    S.thLab.setAttribute('x', tx + 8);
    S.d3.forEach(function (c, i) {
      var d = DOTS[i];
      c.setAttribute('fill', d.lo >= th - 1e-9 ? (t < 18.2 ? H.mix(C.a, C.b, seg(t, 17.2, 18)) : C.b) : C.gray);
    });
    S.shareTxt.textContent = Math.round(share(th) * 100) + '%';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.tot3.setAttribute('opacity', seg(t, 17.6, 18.2));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.5, 29.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
