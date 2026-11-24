// =====================================================================
// teaser-scenes.js — Aghaei, Gómez, Vayanos, Strong optimal classification trees (Operations Research 2025;
// arXiv 2103.15965), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic of LP bounds (labelled 模式図). Scenes 2-3 follow Figures 1-2 of the paper (flow graph,
// Algorithm 1 on a misclassified datapoint, cut set S = {s,1,3,6}). Scene 4 uses the numbers in Section 5.3
// (122 instances in 3,600 s vs 125 s; 1,087 instances vs 71 s). Scene 5 uses the out-of-sample summary table.
// Colours: orange = earlier MIO formulations (OCT, BinOCT); blue = FlowOCT / BendersOCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">これまでの MIO の定式化</span>は LP 緩和が弱く、分枝限定法の上界がなかなか下がらない。', en: '' },
    { ja: '<span class="B">FlowOCT</span> では、正しく分類されるデータだけが始点から葉を通って終点へ流れる。', en: '' },
    { ja: '<span class="B">BendersOCT</span> はデータごとに経路をたどり、流れが途切れたら最小カットを切除平面として足す。', en: '' },
    { ja: '深さを固定した木では、<span class="A">OCT と BinOCT</span> が 1 時間で解けた 122 問を、<span class="B">BendersOCT</span> は 125 秒で解いた。', en: '' },
    { ja: '強い定式化と分解の組み合わせで、計算時間とテストデータの精度の両方が改善した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // flow graph coordinates (depth 2)
  function graph(cx, top, dy, w) {
    var P = { s: [cx, top] };
    P[1] = [cx, top + dy];
    P[2] = [cx - w / 4, top + 2 * dy]; P[3] = [cx + w / 4, top + 2 * dy];
    [4, 5, 6, 7].forEach(function (n, i) { P[n] = [cx - w / 2 + w * (i + 0.5) / 4, top + 3 * dy]; });
    P.t = [cx, top + 4 * dy];
    return P;
  }
  var ARCS = [['s', 1], [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [4, 't'], [5, 't'], [6, 't'], [7, 't']];
  function drawGraph(g, P) {
    var E = {};
    ARCS.forEach(function (a) {
      var p = P[a[0]], q = P[a[1]];
      E[a[0] + '-' + a[1]] = el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: C.gray, 'stroke-width': 3 }, g);
    });
    Object.keys(P).forEach(function (k) {
      el('circle', { cx: P[k][0], cy: P[k][1], r: 18, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
      t2(g, P[k][0], P[k][1] + 6, (k === 's' || k === 't') ? m(k) : k, '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    });
    return E;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: weak vs strong LP relaxation (schematic) =====
    var g1 = S.g[0];
    var X0 = 90, X1 = 560, Y0 = 430, YT = 120;
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: X0, x2: X0, y1: Y0, y2: YT - 10, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, X1, Y0 + 30, '分枝限定法の進み', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g1, X0 - 10, YT, '正解数', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    var yOpt = 300;
    el('line', { x1: X0, x2: X1, y1: yOpt, y2: yOpt, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g1);
    t2(g1, X1 - 4, yOpt + 24, '最適な木の正解数', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    function path(y0, k) {
      var d = '';
      for (var i = 0; i <= 40; i++) { var x = X0 + (X1 - X0) * i / 40, y = yOpt - (yOpt - y0) * Math.exp(-k * i / 40); d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }
      return d;
    }
    S.weak = el('path', { d: path(130, 0.9), fill: 'none', stroke: C.a, 'stroke-width': 3.5 }, g1);
    S.strong = el('path', { d: path(220, 4.5), fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g1);
    S.weakLen = S.weak.getTotalLength ? S.weak.getTotalLength() : 600;
    S.strongLen = S.strong.getTotalLength ? S.strong.getTotalLength() : 600;
    [[S.weak, S.weakLen], [S.strong, S.strongLen]].forEach(function (a) { a[0].setAttribute('stroke-dasharray', a[1]); });
    S.lw = t2(g1, X0 + 12, 116, '弱い LP 緩和の上界', '', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.ls = t2(g1, X0 + 24, 212, '強い LP 緩和の上界', '', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'OCT・BinOCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, 'big-M の制約に頼るので', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, 'LP 緩和が弱い', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, '上界と最適値の差（ギャップ）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 300, 'が縮まらず、枝を刈れない', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（曲線の形は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two datapoints flowing =====
    var g2 = S.g[1];
    var PA = graph(200, 100, 90, 260), PB = graph(470, 100, 90, 260);
    S.EA = drawGraph(g2, PA); S.EB = drawGraph(g2, PB);
    t2(g2, 200, 64, 'データ 1（正しく分類）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 470, 64, 'データ 2（誤分類）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.dotA = el('circle', { r: 9, fill: C.b }, g2);
    S.PA = PA;
    S.zero = t2(g2, 470, 500, '流量 0（どの葉に入るかの変数もいらない）', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, 'FlowOCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 196, '選んだ特徴量が 0 なら左、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 222, '1 なら右にだけ流れられる', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 268, '葉の予測がラベルと同じ', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 294, 'ときだけ終点に流れ込む', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 348, '目的：終点に届いた流量', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 372, '＝正しく分類した数', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '論文 Figure 1・2 にならった図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: Algorithm 1 on datapoint 2 =====
    var g3 = S.g[2];
    var PC = graph(320, 80, 92, 320);
    S.EC = drawGraph(g3, PC);
    S.PC = PC;
    S.visit = [];
    ['s', 1, 3, 6].forEach(function (k) { S.visit.push(el('circle', { cx: PC[k][0], cy: PC[k][1], r: 24, fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3)); });
    S.cut = el('path', { d: 'M 255,190 C 290,260 305,330 320,390 C 340,425 392,425 400,372 C 405,335 430,305 470,285', fill: 'none', stroke: C.b, 'stroke-width': 4, 'stroke-dasharray': '10 7' }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, 'BendersOCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 166, '主問題：分岐 ' + m('b') + ' と予測 ' + m('w'), '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 192, '部分問題：データごとの最大流', '', { 'font-size': 16, fill: C.ink });
    S.s3a = t2(p3, PX, 246, '根から経路をたどる（' + m('O') + '(' + m('d') + ') 回）', '', { 'font-size': 15, fill: C.ink });
    S.s3b = t2(p3, PX, 274, '葉 6 の予測がラベルと違う', '', { 'font-size': 15, fill: C.ink });
    S.s3c = t2(p3, PX, 312, m('S') + ' = {' + m('s') + ', 1, 3, 6} のカットを足す', '', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.s3d = t2(p3, PX, 352, 'このカットはファセットを定め、', '', { 'font-size': 15, fill: C.muted });
    S.s3e = t2(p3, PX, 376, 'それ以上強められない', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '論文 Figure 2（右）の例', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: time to solve the same number of instances =====
    var g4 = S.g[3];
    var BX = 250, BW = 250, MAXT = 3600;
    function bw(v) { return BW * v / MAXT; }
    t2(g4, 70, 110, '深さを固定した木（240 問）で 122 問を解くまで', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 290, '深さが葉ごとに違ってよい木（2,400 問）で 1,087 問', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [['OCT・BinOCT', 3600, 160, C.a, '3,600 秒（制限時間）'], ['BendersOCT', 125, 210, C.b, '125 秒'], ['OCT', 3600, 340, C.a, '3,600 秒（制限時間）'], ['BendersOCT', 71, 390, C.b, '71 秒']];
    S.bars4 = bars.map(function (b, i) {
      t2(g4, BX - 14, b[2] + 6, b[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var r = el('rect', { x: BX, y: b[2] - 17, width: 0, height: 34, fill: b[3] }, g4);
      var lab = t2(g4, BX + bw(b[1]) + 10, b[2] + 6, b[4], '', { 'font-size': 16, 'font-weight': 650, fill: b[3] });
      return { r: r, lab: lab, w: bw(b[1]), t0: 24.8 + i * 0.6 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX + 100, 190, '29 倍', '', { 'font-size': 44, 'font-weight': 700, fill: C.b });
    t2(p4, PX + 100, 370, '51 倍', '', { 'font-size': 44, 'font-weight': 700, fill: C.b });
    t2(g4, 940, 520, '論文の実験の節の数値から作図（カテゴリの 12 データ）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, 'テストデータの平均精度', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '0.80（OCT 0.76）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, 'LP 緩和', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'OCT・BinOCT より強い', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'OPERATIONS RESEARCH 2025';
    el('text', { x: 480, y: 232, 'font-size': 40, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Strong Optimal Classification Trees';
    t2(g5, 480, 280, '強い定式化による最適な分類木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Sina Aghaei, Andrés Gómez, Phebe Vayanos';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/opre.2021.0034';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function lit(E, keys, on) { keys.forEach(function (k) { E[k].setAttribute('stroke', on ? C.b : C.gray); E[k].setAttribute('stroke-width', on ? 5 : 3); }); }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var sw = seg(t, 1.0, 5.0), ss = seg(t, 2.0, 6.0);
    S.weak.setAttribute('stroke-dashoffset', S.weakLen * (1 - sw));
    S.strong.setAttribute('stroke-dashoffset', S.strongLen * (1 - ss));
    S.lw.setAttribute('opacity', seg(t, 1.2, 1.8)); S.ls.setAttribute('opacity', seg(t, 2.2, 2.8));
    S.p1.setAttribute('opacity', seg(t, 3.0, 3.8));
    // scene 2: datapoint 1 flows s-1-3-6-t; datapoint 2 stops at 6
    var routeA = ['s', 1, 3, 6, 't'], u = seg(t, 9.0, 13.0) * (routeA.length - 1);
    var k = Math.min(routeA.length - 2, Math.floor(u)), f = u - k;
    var p = S.PA[routeA[k]], q = S.PA[routeA[k + 1]];
    S.dotA.setAttribute('cx', p[0] + (q[0] - p[0]) * f); S.dotA.setAttribute('cy', p[1] + (q[1] - p[1]) * f);
    S.dotA.setAttribute('opacity', t > 8.8 && t < 15.5 ? 1 : 0);
    lit(S.EA, ['s-1', '1-3', '3-6', '6-t'], t > 13.0);
    lit(S.EB, ['s-1', '1-3', '3-6'], t > 13.6);
    S.zero.setAttribute('opacity', seg(t, 13.8, 14.4));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3
    var steps = [17.0, 17.8, 18.6, 19.4];
    S.visit.forEach(function (c, i) { c.setAttribute('opacity', seg(t, steps[i], steps[i] + 0.3)); });
    lit(S.EC, ['s-1'], t > 17.4); lit(S.EC, ['1-3'], t > 18.2); lit(S.EC, ['3-6'], t > 19.0);
    S.s3a.setAttribute('opacity', seg(t, 17.0, 17.5));
    S.s3b.setAttribute('opacity', seg(t, 19.6, 20.1));
    S.cut.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.s3c.setAttribute('opacity', seg(t, 20.6, 21.1));
    S.s3d.setAttribute('opacity', seg(t, 21.4, 21.9)); S.s3e.setAttribute('opacity', seg(t, 21.4, 21.9));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.9));
      b.r.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.7, b.t0 + 1.1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 22 });
})();
