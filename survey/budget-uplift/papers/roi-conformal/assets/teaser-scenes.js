// =====================================================================
// teaser-scenes.js — Ai et al. (ICDE 2024), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); the 90%/10% -> 50%/50%
// split is the paper's own covariate-shift example. Scene 4 uses the CRITEO-UPLIFT v2 numbers printed
// in Table 1 (arXiv v1).
// Colours: orange = DRP point estimate as is / what breaks it; blue = rDRP interval and calibrated score.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'DRP は 1 つのモデルで個人の ROI を予測し、その大きい順に予算が尽きるまで配る。', en: '' },
    { ja: '学習時と配布時で客層が変わったり学習データが少なかったりすると、<span class="A">予測が収束点から外れる</span>。', en: '' },
    { ja: 'rDRP は配布直前の小さな RCT で<span class="B">区間の幅を校正</span>し、その区間で点推定を補正する。', en: '' },
    { ja: 'CRITEO の 4 設定すべてで <span class="B">rDRP</span> の AUCC が <span class="A">DRP</span> を上回り、差はデータ不足かつシフトありで最も大きかった。', en: '' },
    { ja: '学習し直さずに、ROI の順位づけを運用時のずれに強くする。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // toy customers: predicted ROI (sorted) and cost increment
  var ROI = [0.82, 0.74, 0.66, 0.6, 0.52, 0.45, 0.38, 0.3];
  // scene 3: half-widths r(x)*q (toy) and the corrected score (form (c): roi + r q)
  var HW = [0.04, 0.05, 0.18, 0.03, 0.22, 0.06, 0.04, 0.05];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: sorted by predicted ROI, budget line =====
    var g1 = S.g[0];
    t2(g1, 70, 52, '顧客（予測 ROI の大きい順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars1 = [];
    ROI.forEach(function (v, i) {
      var y = 80 + i * 50;
      txt(g1, 80, y + 22, String.fromCharCode(65 + i), { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      S.bars1.push(el('rect', { x: 110, y: y, width: v * 520, height: 28, rx: 4, fill: C.gray }, g1));
      txt(g1, 120 + v * 520, y + 21, v.toFixed(2), { 'font-size': 15, fill: C.muted });
    });
    S.cut1 = el('line', { x1: 60, x2: 640, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, 'ROI = ' + m('τ') + '<tspan baseline-shift="super" font-size="12">r</tspan> / ' + m('τ') + '<tspan baseline-shift="super" font-size="12">c</tspan>', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 168, '1. ROI の大きい順に並べる', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 204, '2. コストの合計が予算 ' + m('B'), '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX + 20, 230, 'に達するまで配る', '', { 'font-size': 17, fill: C.ink });
    S.p1b = t2(p1, PX, 290, '損失が収束すれば', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 314, 'ROI を偏りなく推定できる', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: covariate shift (paper's example) + insufficient data =====
    var g2 = S.g[1];
    t2(g2, 70, 70, '共変量シフト（論文の例）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.shift = [['学習（平日）', 0.9, 120], ['配布（休日）', 0.5, 200]].map(function (r, i) {
      var o = {};
      t2(g2, 70, r[2] + 22, r[0], '', { 'font-size': 16, fill: C.ink });
      o.w = el('rect', { x: 210, y: r[2], width: 0, height: 32, fill: C.gray, rx: 3 }, g2);
      o.t = el('rect', { x: 210, y: r[2], width: 0, height: 32, fill: i ? C.a : C.gray, rx: 3, opacity: i ? 1 : 0.55 }, g2);
      o.f = r[1];
      o.lab = t2(g2, 220, r[2] + 22, '通勤客 ' + Math.round(r[1] * 100) + '%', '', { 'font-size': 15, fill: C.ink });
      o.lab2 = t2(g2, 590, r[2] + 22, '観光客 ' + Math.round((1 - r[1]) * 100) + '%', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      return o;
    });
    t2(g2, 70, 310, 'データ不足', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(g2, 70, 344, 'RCT はオンライン流量のごく一部（例：0.1%）で、', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 70, 370, '短い期間しか行えない', '', { 'font-size': 16, fill: C.ink });
    // tiny loss curve: training stops before the minimum
    var lx0 = 120, lx1 = 560, ly = 480;
    var d = '';
    for (var k = 0; k <= 40; k++) { var u = k / 40; d += (k ? 'L' : 'M') + (lx0 + u * (lx1 - lx0)) + ',' + (ly - 80 * (u - 0.7) * (u - 0.7) / 0.49); }
    el('path', { d: d, stroke: C.ink, 'stroke-width': 2, fill: 'none' }, g2);
    S.dot2 = el('circle', { cx: lx0, cy: 0, r: 8, fill: C.a }, g2);
    el('circle', { cx: lx0 + 0.7 * (lx1 - lx0), cy: ly, r: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g2);
    t2(g2, lx0 + 0.7 * (lx1 - lx0), ly + 26, '収束点 ' + m('s') + '*', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.stop2 = t2(g2, lx0 + 0.35 * (lx1 - lx0) - 6, ly + 12, '学習が止まった点', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'end' });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 150, 'どちらの場合も', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 178, 'テストデータでの予測は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 206, '収束点から離れる。', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(p2, PX, 270, '→ ROI の順位が崩れ、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 296, '予算の配り先がずれる', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（損失の曲線は解説者による）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: intervals appear, scores corrected, re-sorted =====
    var g3 = S.g[2];
    t2(g3, 70, 52, '点推定 ' + m('roî') + ' と区間 ± ' + m('r̂') + '(' + m('x') + ')' + m('q̂'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var corr = ROI.map(function (v, i) { return v + HW[i]; });
    var order = corr.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    var rank = []; order.forEach(function (o, r) { rank[o[1]] = r; });
    S.rows3 = ROI.map(function (v, i) {
      var o = { g: el('g', {}, g3), i: i, r: rank[i] };
      txt(o.g, 80, 22, String.fromCharCode(65 + i), { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      o.band = el('rect', { x: 110 + v * 520, y: 6, width: 0, height: 16, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.2, rx: 3 }, o.g);
      o.dot = el('circle', { cx: 110 + v * 520, cy: 14, r: 7, fill: C.a }, o.g);
      o.cdot = el('circle', { cx: 110 + corr[i] * 520, cy: 14, r: 7, fill: C.b }, o.g);
      o.v = v; o.hw = HW[i];
      return o;
    });
    el('line', { x1: 110, x2: 110, y1: 70, y2: 480, stroke: C.hair }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 100, '校正データ（配布直前の RCT）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p3, PX, 130, 'スコア |' + m('roi') + '* − ' + m('roî') + '| / ' + m('r̂'), '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 158, 'の分位点を ' + m('q̂') + ' とする', '', { 'font-size': 16, fill: C.ink });
    S.p3b = el('g', {}, g3);
    el('circle', { cx: PX + 8, cy: 214, r: 7, fill: C.a }, S.p3b);
    t2(S.p3b, PX + 24, 220, 'DRP の点推定', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 8, cy: 246, r: 7, fill: C.b }, S.p3b);
    t2(S.p3b, PX + 24, 252, '補正後（例：式 (c)', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX + 24, 276, m('roî') + ' + ' + m('r̂') + m('q̂') + '）', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX, 326, '補正後の値の順に並べ直す。', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX, 352, '式は 3 通りから校正データで選ぶ', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（区間の幅は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1, CRITEO-UPLIFT v2, AUCC =====
    var g4 = S.g[3];
    var rows = [['SuNo', 0.7714, 0.7717], ['SuCo', 0.7263, 0.7382], ['InNo', 0.6222, 0.6509], ['InCo', 0.5411, 0.6087]];
    var Y0 = 430, LO = 0.5, HI = 0.8, YT = 90;
    function py(v) { return Y0 - (v - LO) / (HI - LO) * (Y0 - YT); }
    t2(g4, 70, 58, 'AUCC（CRITEO-UPLIFT v2）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.5, 0.6, 0.7, 0.8].forEach(function (v) {
      el('line', { x1: 110, x2: 610, y1: py(v), y2: py(v), stroke: C.hair }, g4);
      el('text', { x: 100, y: py(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toFixed(1);
    });
    S.bars4 = rows.map(function (r, i) {
      var x = 130 + i * 122, o = { t0: 25 + i * 0.8 };
      o.d = el('rect', { x: x, y: Y0, width: 48, height: 0, fill: C.a, rx: 3 }, g4);
      o.r = el('rect', { x: x + 52, y: Y0, width: 48, height: 0, fill: C.b, rx: 3 }, g4);
      o.dv = r[1]; o.rv = r[2];
      o.lab = el('g', {}, g4);
      txt(o.lab, x + 24, py(r[1]) - 8, r[1].toFixed(4).slice(1), { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
      txt(o.lab, x + 76, py(r[2]) - 8, r[2].toFixed(4).slice(1), { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
      txt(g4, x + 50, Y0 + 28, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 96, width: 18, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 28, 111, 'rDRP', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 128, width: 18, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX + 28, 143, 'DRP', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 196, 'データ不足・シフトあり（InCo）', '', { 'font-size': 15, fill: C.muted });
    txt(p4, PX, 234, '0.5411', { 'font-size': 28, 'font-weight': 650, fill: C.a });
    txt(p4, PX + 104, 234, '→', { 'font-size': 22, fill: C.ink });
    txt(p4, PX + 136, 234, '0.6087', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 284, 'Su / In：データ量の十分・不足', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 306, 'No / Co：シフトのなし・あり', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 346, '3 データ × 4 設定の 12 条件で', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 370, 'rDRP が 10 手法中で最大', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 1（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICDE 2024';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Improve ROI with Causal Learning';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'and Conformal Prediction';
    t2(g5, 480, 302, '因果学習とコンフォーマル予測による ROI の改善', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Meng Ai · Zhuo Chen · Jibin Wang · Jing Shang · Tao Tao · Zhen Li';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2407.01065';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: budget line slides down; A-D get the treatment
    var yc = 70 + seg(t, 1.5, 4) * (80 + 4 * 50 - 11 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1.2, 1.6));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 4 ? H.mix(C.gray, C.a, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    S.p1b.setAttribute('opacity', 1);
    // scene 2: share bars fill, then the training dot stalls before the minimum
    S.shift.forEach(function (o, i) {
      var s = seg(t, 9 + i * 1.2, 10.2 + i * 1.2);
      o.w.setAttribute('width', 380 * s);
      o.t.setAttribute('width', 380 * o.f * s);
      o.lab.setAttribute('opacity', seg(t, 10 + i * 1.2, 10.5 + i * 1.2));
      o.lab2.setAttribute('opacity', seg(t, 10 + i * 1.2, 10.5 + i * 1.2));
    });
    var u = 0.35 * seg(t, 12, 14.5);
    var lx0 = 120, lx1 = 560, ly = 480;
    S.dot2.setAttribute('cx', lx0 + u * (lx1 - lx0));
    S.dot2.setAttribute('cy', ly - 80 * (u - 0.7) * (u - 0.7) / 0.49);
    S.stop2.setAttribute('opacity', seg(t, 14.3, 14.9));
    // scene 3: intervals grow, corrected dots appear, rows re-sort by corrected score
    var gi = seg(t, 17.5, 19), gc = seg(t, 19.5, 20.3), gs = seg(t, 20.8, 22.3);
    S.rows3.forEach(function (o) {
      var w = o.hw * 520 * gi;
      o.band.setAttribute('x', 110 + o.v * 520 - w); o.band.setAttribute('width', 2 * w);
      o.cdot.setAttribute('opacity', gc);
      o.dot.setAttribute('opacity', 1 - 0.5 * gc);
      var y = 80 + (o.i + (o.r - o.i) * gs) * 50;
      o.g.setAttribute('transform', 'translate(0,' + y + ')');
    });
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    S.p3b.setAttribute('opacity', seg(t, 19.5, 20.3));
    // scene 4: bars grow in order, then the InCo panel
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.7);
      var Y0 = 430, k = (430 - 90) / 0.3;
      var hd = (o.dv - 0.5) * k * s, hr = (o.rv - 0.5) * k * s;
      o.d.setAttribute('y', Y0 - hd); o.d.setAttribute('height', hd);
      o.r.setAttribute('y', Y0 - hr); o.r.setAttribute('height', hr);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
