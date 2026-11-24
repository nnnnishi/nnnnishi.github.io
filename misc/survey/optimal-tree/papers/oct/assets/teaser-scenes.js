// =====================================================================
// teaser-scenes.js — Bertsimas & Dunn, Optimal classification trees (Machine Learning 2017), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1 and 3 use a toy 2-D dataset chosen by the explainer (24 points, labelled 模式図): the greedy
// Gini depth-2 tree misclassifies 4 points, the optimal depth-2 tree 0 (found with
// .explainer-work/mio/tools/toy_tree.py; leaf labels and error counts are recomputed here).
// Scene 2 uses the speed-up factors in Section 1; scene 4 uses Table 6 of the paper.
// Colours: orange = CART (greedy, top-down); blue = OCT / OCT-H (whole tree as one MIO).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">CART</span> は分岐を上から 1 つずつ、そのあとに続く分岐を考えずに決める。', en: '' },
    { ja: '最適な木を求める問題は NP 困難だが、MIO ソルバーと計算機は 1991〜2015 年で約 8,000 億倍速くなった。', en: '' },
    { ja: '<span class="B">OCT</span> は分岐と各点の行き先を 0-1 変数で表し、深さ 2 の木全体を一度に決める。', en: '' },
    { ja: 'UCI の 53 データでは、どの深さでも <span class="B">OCT</span> が <span class="A">CART</span> を上回り、多変量の OCT-H はさらに上回った。', en: '' },
    { ja: 'CART と同じ問題を貪欲法ではなく最適に解くと精度が上がることを、論文は UCI のデータで示した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;

  // toy data: [x, y, class]
  var P = [[0.259,0.511,1],[0.405,0.784,0],[0.303,0.477,1],[0.583,0.908,0],[0.505,0.282,1],[0.756,0.618,1],[0.251,0.91,0],[0.983,0.81,1],[0.902,0.31,0],[0.73,0.899,1],[0.684,0.472,1],[0.101,0.434,1],[0.611,0.913,0],[0.967,0.477,1],[0.865,0.26,0],[0.805,0.549,1],[0.014,0.72,0],[0.399,0.825,0],[0.668,0.001,0],[0.494,0.868,0],[0.244,0.325,1],[0.87,0.191,0],[0.568,0.239,1],[0.968,0.803,1]];
  // trees: {j: feature (0 = x, 1 = y), t: threshold, L, R}; left if value < t
  var CART = { j: 1, t: 0.8175, L: { j: 1, t: 0.215 }, R: { j: 0, t: 0.6705 } };
  var OCT = { j: 0, t: 0.6395, L: { j: 1, t: 0.6155 }, R: { j: 1, t: 0.391 } };
  function leafOf(T, p) { var a = p[T.j] < T.t ? 'L' : 'R'; var c = T[a]; return a + (p[c.j] < c.t ? 'L' : 'R'); }
  function predict(T) {
    var cnt = {};
    P.forEach(function (p) { var k = leafOf(T, p); cnt[k] = cnt[k] || [0, 0]; cnt[k][p[2]]++; });
    return P.map(function (p) { var c = cnt[leafOf(T, p)]; return c[1] > c[0] ? 1 : 0; });
  }
  var predC = predict(CART), predO = predict(OCT);
  var errC = P.filter(function (p, i) { return predC[i] !== p[2]; }).length;
  var errO = P.filter(function (p, i) { return predO[i] !== p[2]; }).length;

  var X0 = 90, Y0 = 490, W = 400;
  function sx(v) { return X0 + W * v; }
  function sy(v) { return Y0 - W * v; }

  function field(g) {
    el('rect', { x: X0, y: Y0 - W, width: W, height: W, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
    t2(g, X0 + W / 2, Y0 + 30, m('x') + sub('1'), '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(g, X0 - 24, Y0 - W / 2, m('x') + sub('2'), '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    return P.map(function (p) {
      var e = p[2] ? el('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 8, fill: C.ink }, g)
                   : el('rect', { x: sx(p[0]) - 7, y: sy(p[1]) - 7, width: 14, height: 14, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
      var ring = el('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 15, fill: 'none', stroke: C.a, 'stroke-width': 3, opacity: 0 }, g);
      return { e: e, ring: ring };
    });
  }
  function lineFor(g, T, branch, colour) {
    // root line spans the square; child line spans the root's side
    var x1, x2, y1, y2;
    if (!branch) {
      if (T.j === 0) { x1 = x2 = sx(T.t); y1 = sy(0); y2 = sy(1); } else { y1 = y2 = sy(T.t); x1 = sx(0); x2 = sx(1); }
    } else {
      var c = T[branch], lo = branch === 'L' ? 0 : T.t, hi = branch === 'L' ? T.t : 1;
      if (c.j === 0) { x1 = x2 = sx(c.t); if (T.j === 1) { y1 = sy(lo); y2 = sy(hi); } else { y1 = sy(0); y2 = sy(1); } }
      else { y1 = y2 = sy(c.t); if (T.j === 0) { x1 = sx(lo); x2 = sx(hi); } else { x1 = sx(0); x2 = sx(1); } }
    }
    var len = Math.hypot(x2 - x1, y2 - y1);
    return { e: el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: colour, 'stroke-width': 4, 'stroke-dasharray': len, 'stroke-dashoffset': len }, g), len: len };
  }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }
  function legend(g, y) {
    el('circle', { cx: PX + 8, cy: y - 5, r: 7, fill: C.ink }, g);
    t2(g, PX + 24, y, 'クラス 1', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: PX + 112, y: y - 11, width: 13, height: 13, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
    t2(g, PX + 134, y, 'クラス 0', '', { 'font-size': 15, fill: C.ink });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: CART, greedy =====
    var g1 = S.g[0];
    S.pts1 = field(g1);
    S.l1 = [lineFor(g1, CART, null, C.a), lineFor(g1, CART, 'L', C.a), lineFor(g1, CART, 'R', C.a)];
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, 'CART（貪欲法）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.step1 = [
      t2(p1, PX, 168, '① 不純度が最も下がる分岐を選ぶ', '', { 'font-size': 16, fill: C.ink }),
      t2(p1, PX, 200, '② 分かれた側ごとに同じことをする', '', { 'font-size': 16, fill: C.ink }),
      t2(p1, PX, 232, '先の分岐は考えない', '', { 'font-size': 15, fill: C.muted })
    ];
    S.err1 = t2(p1, PX, 300, '深さ 2 で誤分類 ' + errC + ' 点', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    legend(p1, 380);
    t2(g1, 940, 520, '模式図（解説者が置いた 24 点）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: NP-hard, but 800 billion times faster =====
    var g2 = S.g[1];
    S.np = t2(g2, 330, 130, '最適な二分決定木を求める問題は NP 困難', '', { 'font-size': 20, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 330, 160, '（Hyafil &amp; Rivest 1976）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.big = el('g', {}, g2);
    t2(S.big, 330, 280, '約 8,000 億倍', '', { 'font-size': 64, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    t2(S.big, 330, 322, 'MIO を解く速さ（1991 → 2015 年）', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.fac = el('g', {}, g2);
    el('rect', { x: 120, y: 370, width: 190, height: 74, rx: 12, fill: C.bsoft }, S.fac);
    t2(S.fac, 215, 400, 'ソルバー', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    t2(S.fac, 215, 428, '約 140 万倍', '', { 'font-size': 19, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    t2(S.fac, 330, 416, '×', '', { 'font-size': 26, fill: C.ink, 'text-anchor': 'middle' });
    el('rect', { x: 350, y: 370, width: 190, height: 74, rx: 12, fill: C.bsoft }, S.fac);
    t2(S.fac, 445, 400, '計算機', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    t2(S.fac, 445, 428, '約 57 万倍', '', { 'font-size': 19, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX + 40, 200, 'Breiman ら（1984）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p2, PX + 40, 230, '木全体を一度に最適にする', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX + 40, 254, '方法は、当時の計算機では', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX + 40, 278, '現実的でないと書いていた。', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX + 40, 340, 'CPLEX 1.2 → Gurobi 6.5', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '論文 第 1 節の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: OCT, whole tree at once =====
    var g3 = S.g[2];
    S.pts3 = field(g3);
    S.l3 = [lineFor(g3, OCT, null, C.b), lineFor(g3, OCT, 'L', C.b), lineFor(g3, OCT, 'R', C.b)];
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, 'OCT（1 つの MIO）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 166, m('d') + sub('t') + '：ノード ' + m('t') + ' で分岐するか', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 196, m('a') + sub('t') + ', ' + m('b') + sub('t') + '：分岐の特徴量としきい値', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 226, m('z') + sub('it') + '：点 ' + m('i') + ' が葉 ' + m('t') + ' に入るか', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 256, '3 つの分岐をまとめて選ぶ', '', { 'font-size': 15, fill: C.muted });
    S.err3 = t2(p3, PX, 310, '深さ 2 で誤分類 ' + errO + ' 点', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 340, '（CART は ' + errC + ' 点）', '', { 'font-size': 15, fill: C.a });
    legend(p3, 400);
    t2(g3, 940, 520, '模式図（シーン 1 と同じ 24 点）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 6 =====
    var g4 = S.g[3];
    var AX = 110, AY = 440, AH = 300, LO = 65, HI = 85;
    function yv(v) { return AY - AH * (v - LO) / (HI - LO); }
    [65, 70, 75, 80, 85].forEach(function (v) {
      el('line', { x1: AX, x2: 600, y1: yv(v), y2: yv(v), stroke: v === LO ? C.ink : C.hair, 'stroke-width': v === LO ? 1.5 : 1 }, g4);
      el('text', { x: AX - 10, y: yv(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v + '%';
    });
    var T6 = [[71.0, 71.3, 76.1], [76.2, 78.0, 81.0], [78.8, 79.5, 82.3], [79.8, 80.4, 82.9]];
    var COL = [C.a, C.b, C.b], OP = [1, 1, 0.45];
    S.bars4 = [];
    T6.forEach(function (row, d) {
      var gx = AX + 30 + d * 120;
      t2(g4, gx + 45, AY + 28, '深さ ' + (d + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      row.forEach(function (v, k) {
        var r = el('rect', { x: gx + k * 30, y: AY, width: 26, height: 0, fill: COL[k], 'fill-opacity': OP[k] }, g4);
        S.bars4.push({ r: r, top: yv(v), t0: 25 + d * 0.9 + k * 0.2 });
      });
    });
    t2(g4, AX, 116, '53 データでのテストデータの精度の平均', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    [['CART', C.a, 1], ['OCT', C.b, 1], ['OCT-H（多変量）', C.b, 0.45]].forEach(function (L, i) {
      el('rect', { x: PX, y: 150 + i * 34, width: 18, height: 18, fill: L[1], 'fill-opacity': L[2] }, p4);
      t2(p4, PX + 28, 165 + i * 34, L[0], '', { 'font-size': 16, fill: C.ink });
    });
    t2(p4, PX, 290, '深さ 2：', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 318, 'CART 76.2% → OCT 78.0%', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 346, 'OCT-H 81.0%', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 400, '深さを制限しない CART', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 424, '（最大で深さ 10）は 80.7%', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 6 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, 'CART との差（深さ 1〜4）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'OCT +0.4〜1.9 ポイント', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '多変量の分岐', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'OCT-H +3.1〜5.1 ポイント', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'MACHINE LEARNING 2017';
    el('text', { x: 480, y: 232, 'font-size': 40, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Classification Trees';
    t2(g5, 480, 280, '最適な分類木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dimitris Bertsimas, Jack Dunn';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/s10994-017-5633-9';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function draw(L, s) { L.e.setAttribute('stroke-dashoffset', L.len * (1 - s)); }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: root first, then the two children; wrong points get a ring
    draw(S.l1[0], seg(t, 1.2, 2.2));
    draw(S.l1[1], seg(t, 3.0, 3.8));
    draw(S.l1[2], seg(t, 3.6, 4.4));
    S.step1[0].setAttribute('opacity', seg(t, 1.0, 1.6));
    S.step1[1].setAttribute('opacity', seg(t, 2.8, 3.4));
    S.step1[2].setAttribute('opacity', seg(t, 3.6, 4.2));
    S.pts1.forEach(function (q, i) { q.ring.setAttribute('opacity', predC[i] !== P[i][2] ? seg(t, 5.0, 5.6) : 0); });
    S.err1.setAttribute('opacity', seg(t, 5.2, 5.8));
    S.p1.setAttribute('opacity', seg(t, 0.6, 1.2));
    // scene 2
    S.np.setAttribute('opacity', seg(t, 8.6, 9.2));
    S.big.setAttribute('opacity', seg(t, 10.0, 10.8));
    S.fac.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: all three splits appear together
    var s3 = seg(t, 18.0, 19.6);
    S.l3.forEach(function (L) { draw(L, s3); });
    S.pts3.forEach(function (q) { q.ring.setAttribute('opacity', 0); });
    S.err3.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    // scene 4: bars grow
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.r.setAttribute('y', 440 - (440 - b.top) * s);
      b.r.setAttribute('height', (440 - b.top) * s);
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
