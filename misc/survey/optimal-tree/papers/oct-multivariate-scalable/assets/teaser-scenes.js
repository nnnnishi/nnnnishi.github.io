// =====================================================================
// teaser-scenes.js — Zhu, Murali, Phan, Nguyen, Kalagnanam, A scalable MIP-based method for learning optimal
// multivariate decision trees (NeurIPS 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-placed points (labelled 模式図). Scene 4 uses the large-data table
// (depth 2, testing accuracy and share of selected points) from the arXiv supplementary material.
// Colours: orange = CART and earlier MIO formulations; blue = SVM1-ODT / S1O-DS.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '<span class="A">これまでの MIP</span> は行ごとに変数と制約を作るので、5,000 行を超えると解けなくなる。', en: '' },
    { ja: '<span class="B">SVM1-ODT</span> は斜めの分岐を、誤分類と 1-ノルム SVM のマージンをあわせた目的で選ぶ。', en: '' },
    { ja: '同じ葉・同じラベルの点のうち、凸包の内側の点は外しても分類が変わらないので、学習データから外す。', en: '' },
    { ja: '7,000〜245,000 行の 6 データで、絞り込んでから解いた <span class="B">S1O-DS</span> は <span class="A">CART</span> を上回った。', en: '' },
    { ja: '多変量の木の MIP と LP による絞り込みを組み合わせて、MIP で扱えるデータの大きさを広げた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: problem size grows with rows =====
    var g1 = S.g[0];
    var AX = 110, AY = 430, AW = 440, AH = 280;
    el('line', { x1: AX, x2: AX + AW, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: AX, x2: AX, y1: AY, y2: AY - AH - 10, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, AX + AW, AY + 30, '学習データの行数', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g1, AX + 8, AY - AH - 16, 'MIP の変数と制約の数', '', { 'font-size': 15, fill: C.muted });
    S.line1 = el('line', { x1: AX, y1: AY, x2: AX, y2: AY, stroke: C.a, 'stroke-width': 4 }, g1);
    var x5k = AX + AW * 0.45;
    S.wall = el('g', {}, g1);
    el('line', { x1: x5k, x2: x5k, y1: AY, y2: AY - AH, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, S.wall);
    t2(S.wall, x5k + 8, AY - AH + 20, '約 5,000 行', '', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    t2(S.wall, x5k + 8, AY - AH + 42, 'ここから先は解けない', '', { 'font-size': 15, fill: C.a });
    S.AX = AX; S.AY = AY; S.AW = AW; S.AH = AH;
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'これまでの MIP', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, 'OCT・BinOCT などは', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, '行数に比例して大きくなる', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, '大きなデータでは CART の', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 300, '初期解から改善できない', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: oblique split with margin =====
    var g2 = S.g[1];
    var r2 = rng(5), pts2 = [];
    // two classes separated by the line y = 0.9x + 40 in a 380x340 box (explainer's toy points)
    while (pts2.length < 36) {
      var x = 110 + r2() * 400, y = 110 + r2() * 320;
      var d = (y - (0.75 * (x - 110) + 150)) / 1.25;
      if (Math.abs(d) < 22) continue;
      pts2.push([x, y, d > 0 ? 1 : 0]);
    }
    el('rect', { x: 100, y: 100, width: 420, height: 370, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
    S.band = el('polygon', { points: '', fill: C.bsoft }, g2);
    S.pts2 = pts2.map(function (p) {
      return p[2] ? el('circle', { cx: p[0], cy: p[1], r: 7, fill: C.ink }, g2)
                  : el('rect', { x: p[0] - 6, y: p[1] - 6, width: 12, height: 12, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g2);
    });
    S.hyp = el('line', { x1: 100, y1: 0, x2: 520, y2: 0, stroke: C.b, 'stroke-width': 3.5 }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, 'SVM1-ODT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 170, '分岐：' + m('h') + '<tspan dy="5" font-size="12" ' + MI + '>b</tspan><tspan dy="-5">·</tspan>' + m('x') + ' ≤ ' + m('g') + '<tspan dy="5" font-size="12" ' + MI + '>b</tspan><tspan dy="-5"> なら左</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 220, '目的 ＝ 誤分類の数', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX + 54, 246, '＋ はみ出しの量', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX + 54, 272, '＋ 係数の 1-ノルム', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 326, '1-ノルムなので線形にでき、', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 350, '係数も疎になりやすい', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（点は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: convex hull data selection =====
    var g3 = S.g[2];
    var r3 = rng(21), pts3 = [];
    for (var i = 0; i < 60; i++) {
      var a = r3() * Math.PI * 2, rr = Math.sqrt(r3());
      pts3.push([310 + Math.cos(a) * rr * 170, 270 + Math.sin(a) * rr * 130]);
    }
    // convex hull (monotone chain)
    var P = pts3.slice().sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [];
    P.forEach(function (p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); });
    P.slice().reverse().forEach(function (p) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); });
    var hull = lower.slice(0, -1).concat(upper.slice(0, -1));
    S.hull = el('polygon', { points: hull.map(function (p) { return p.join(','); }).join(' '), fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3);
    S.pts3 = pts3.map(function (p) {
      var onHull = hull.indexOf(p) >= 0;
      return { c: el('circle', { cx: p[0], cy: p[1], r: 6.5, fill: C.ink }, g3), keep: onHull };
    });
    S.nKeep = hull.length;
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, 'LP によるデータの絞り込み', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 176, '① CART の木で、葉 × ラベル', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX + 22, 200, 'ごとに点をまとめる', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 236, '② 凸包の内側の点を LP で', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX + 22, 260, '見つけて外す', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 296, '③ 残した点だけで SVM1-ODT', '', { 'font-size': 15, fill: C.ink });
    S.cnt3 = t2(p3, PX, 350, '60 点 → ' + hull.length + ' 点', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 380, '（実際は超平面に近い点も残す）', '', { 'font-size': 14, fill: C.muted });
    t2(g3, 940, 520, '模式図（1 つの葉・1 つのラベルの点、位置は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: large data sets, depth 2 =====
    var g4 = S.g[3];
    var D = [['Avila', 52.6, 50.3, '4.5%'], ['EEG', 66.5, 58.6, '2.0%'], ['HTRU', 97.8, 97.3, '3%'], ['pendigits', 38.9, 36.2, '7.1%'], ['skin-seg.', 86.3, 80.6, '0.42%'], ['shuttle', 94.0, 93.8, '2.0%']];
    var BX = 210, BW = 340, LO = 30, HI = 100;
    function bw(v) { return BW * (v - LO) / (HI - LO); }
    [30, 50, 70, 90].forEach(function (v) {
      el('line', { x1: BX + bw(v), x2: BX + bw(v), y1: 92, y2: 440, stroke: v === 30 ? C.ink : C.hair, 'stroke-width': v === 30 ? 1.5 : 1 }, g4);
      el('text', { x: BX + bw(v), y: 462, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.bars4 = [];
    D.forEach(function (d, k) {
      var y = 110 + k * 56;
      t2(g4, BX - 12, y + 16, d[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var rb = el('rect', { x: BX, y: y, width: 0, height: 18, fill: C.b }, g4);
      var ra = el('rect', { x: BX, y: y + 20, width: 0, height: 18, fill: C.a }, g4);
      var lb = t2(g4, BX + bw(d[1]) + 8, y + 15, d[1].toFixed(1), '', { 'font-size': 14, 'font-weight': 650, fill: C.b });
      var la = t2(g4, BX + bw(d[2]) + 8, y + 35, d[2].toFixed(1), '', { 'font-size': 14, fill: C.a });
      S.bars4.push({ rb: rb, ra: ra, lb: lb, la: la, wb: bw(d[1]), wa: bw(d[2]), t0: 24.8 + k * 0.5 });
    });
    t2(g4, 70, 76, '深さ 2 のテストデータの精度（%）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 136, width: 18, height: 18, fill: C.b }, p4); t2(p4, PX + 28, 151, 'S1O-DS（絞り込み後）', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 170, width: 18, height: 18, fill: C.a }, p4); t2(p4, PX + 28, 185, 'CART', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 240, 'skin-segmentation', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 264, '245,057 行のうち 0.42% だけ', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 318, 'OCT-H は 4 時間で CART の', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 342, '解を改善できないか、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 366, 'MIP を組み立てられなかった', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, 'arXiv 版の補足資料の表（深さ 2）から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '中くらいのデータ（深さ 2）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '平均精度 6〜10% 向上', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '扱えたデータの大きさ', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '最大 245,057 行', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NEURIPS 2020';
    el('text', { x: 480, y: 222, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'A Scalable MIP-based Method for Learning';
    el('text', { x: 480, y: 260, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Multivariate Decision Trees';
    t2(g5, 480, 302, '大きなデータに広げられる、MIP による多変量の最適な決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Haoran Zhu, Pavankumar Murali, Dzung T. Phan, Lam M. Nguyen, Jayant R. Kalagnanam';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2011.03375';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: line grows to the right
    var s1 = seg(t, 1.0, 5.0);
    S.line1.setAttribute('x2', S.AX + S.AW * s1); S.line1.setAttribute('y2', S.AY - S.AH * 0.95 * s1);
    S.wall.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2: the hyperplane rotates into place, then the margin band appears
    var s2 = H.ease(seg(t, 9.0, 12.0));
    var ang = Math.atan(0.75) * s2 + (-0.6) * (1 - s2), cx = 310, cy = 0.75 * 200 + 150;
    var dx = 210, dy = Math.tan(ang) * dx;
    S.hyp.setAttribute('x1', cx - dx); S.hyp.setAttribute('y1', cy - dy);
    S.hyp.setAttribute('x2', cx + dx); S.hyp.setAttribute('y2', cy + dy);
    var w = 22 * 1.25 * seg(t, 12.2, 13.0);
    S.band.setAttribute('points', [[100, 0.75 * -10 + 150 - w], [500, 0.75 * 390 + 150 - w], [500, 0.75 * 390 + 150 + w], [100, 0.75 * -10 + 150 + w]].map(function (p) { return p.join(','); }).join(' '));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: interior points fade out
    var s3 = seg(t, 19.0, 20.5);
    S.pts3.forEach(function (p) { p.c.setAttribute('fill', p.keep ? C.b : C.ink); p.c.setAttribute('opacity', p.keep ? 1 : 1 - 0.8 * s3); });
    S.hull.setAttribute('opacity', seg(t, 17.6, 18.4));
    S.cnt3.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rb.setAttribute('width', b.wb * s); b.ra.setAttribute('width', b.wa * s);
      b.lb.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0)); b.la.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
