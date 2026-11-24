// =====================================================================
// teaser-scenes.js — Günlük, Kalagnanam, Li, Menickelly, Scheinberg, Optimal decision trees for categorical
// data via integer programming (J. Global Optimization 2021; arXiv 1612.03225 v3), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-2 use the marital-status example from the introduction (schematic, labelled 模式図).
// Scene 3 follows Proposition 3 (which variables must stay integer) on the balanced depth-3 tree (Figure 2).
// Scene 4 uses the cross-validation comparison table (testing accuracy). Scene 5 uses the Mushroom result.
// Colours: orange = CART / simple one-value branching; blue = ODT with combinatorial branching.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'カテゴリ変数を one-hot にして <span class="A">1 つの値ずつ</span>見ると、値の組で決まる条件には分岐が何回も要る。', en: '' },
    { ja: '<span class="B">ODT</span> は各分岐でカテゴリ変数を 1 つ選び、左に送る値の部分集合を整数計画で選ぶ。', en: '' },
    { ja: '整数のまま残すのは、葉に隣接しない分岐ノードで値を選ぶ変数だけで、その数はデータ数によらない。', en: '' },
    { ja: '交差検証で木の形を選ぶと、10 データ中 8 データで <span class="B">ODT</span> の精度が <span class="A">CART</span> 以上だった。', en: '' },
    { ja: '小さくて精度の良い木が存在するデータなら、厳密な最適化でそれを見つけられる、と論文は述べる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }

  var VALS = ['独身', '既婚', '離婚', '死別', '事実婚'];
  var TARGET = [false, true, false, false, true];   // the condition "married or domestic partner"

  function chips(g, y, colour) {
    return VALS.map(function (v, i) {
      var x = 120 + i * 92;
      var r = el('rect', { x: x - 40, y: y - 20, width: 80, height: 36, rx: 18, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g);
      var t = t2(g, x, y + 4, v, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, t: t };
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one value at a time =====
    var g1 = S.g[0];
    t2(g1, 70, 110, '婚姻状況（5 つの値）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c1 = chips(g1, 160, C.a);
    t2(g1, 70, 230, '知りたい条件：「既婚か事実婚か」', '', { 'font-size': 16, fill: C.ink });
    // two-level tree of single-value tests: married? yes -> leaf; no -> partner? yes/no
    S.q1 = el('g', {}, g1);
    [[330, 296, 230, 380], [330, 296, 430, 360], [430, 376, 370, 450], [430, 376, 490, 450]].forEach(function (e) {
      el('line', { x1: e[0], y1: e[1], x2: e[2], y2: e[3], stroke: C.a, 'stroke-width': 2 }, S.q1);
    });
    el('rect', { x: 270, y: 274, width: 120, height: 32, rx: 8, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, S.q1);
    t2(S.q1, 330, 296, '既婚？', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    el('rect', { x: 370, y: 354, width: 120, height: 32, rx: 8, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, S.q1);
    t2(S.q1, 430, 376, '事実婚？', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    [[230, 380, '満たす'], [370, 450, '満たす'], [490, 450, '満たさない']].forEach(function (L) {
      el('rect', { x: L[0] - 44, y: L[1], width: 88, height: 28, rx: 6, fill: C.panel, stroke: C.ink, 'stroke-width': 1.2 }, S.q1);
      t2(S.q1, L[0], L[1] + 19, L[2], '', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    });
    [[268, 344, 'はい'], [392, 330, 'いいえ'], [384, 420, 'はい'], [478, 420, 'いいえ']].forEach(function (L) {
      t2(S.q1, L[0], L[1], L[2], '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '1 つの値で分岐', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, '「既婚？」「事実婚？」と', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, '2 回分けないと表せない', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, '深さに上限があると、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 300, 'ほかの分岐に回す余裕が減る', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（論文の導入の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: subset branching =====
    var g2 = S.g[1];
    t2(g2, 70, 110, '1 回の分岐で、値の部分集合を左に送る', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c2 = chips(g2, 170, C.b);
    S.left2 = t2(g2, 330, 260, '左：{既婚, 事実婚}　右：それ以外', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.count2 = el('g', {}, g2);
    t2(S.count2, 330, 340, '値が ' + m('ℓ') + ' 個なら、分け方は 2' + '<tspan dy="-8" font-size="12" ' + MI + '>ℓ</tspan><tspan dy="8"> − 2 通り</tspan>', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.count2, 330, 376, '（5 つの値なら 30 通り）', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(S.count2, 330, 430, '値が多いと過学習しやすいので、選ぶ値の数に上限も置ける', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, 'ODT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 196, m('v') + sub('g') + '<tspan dy="-12" font-size="12" ' + MI + '>k</tspan><tspan dy="7">：ノード ' + '</tspan>' + m('k') + ' で変数 ' + m('g') + ' を選ぶ', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 226, m('z') + sub('j') + '<tspan dy="-12" font-size="12" ' + MI + '>k</tspan><tspan dy="7">：値 </tspan>' + m('j') + ' を左に送る', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 282, '目的：正しく分類した数', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 306, '（クラスの重みつき）', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: which variables stay integer (balanced depth 3) =====
    var g3 = S.g[2];
    var N = { 1: [330, 110], 2: [210, 200], 5: [450, 200], 3: [150, 290], 4: [270, 290], 6: [390, 290], 7: [510, 290] };
    [[1, 2], [1, 5], [2, 3], [2, 4], [5, 6], [5, 7]].forEach(function (e) {
      el('line', { x1: N[e[0]][0], y1: N[e[0]][1], x2: N[e[1]][0], y2: N[e[1]][1], stroke: C.gray, 'stroke-width': 2.5 }, g3);
    });
    var leafX = [120, 180, 240, 300, 360, 420, 480, 540];
    leafX.forEach(function (x, i) {
      var par = N[[3, 3, 4, 4, 6, 6, 7, 7][i]];
      el('line', { x1: par[0], y1: par[1], x2: x, y2: 380, stroke: C.gray, 'stroke-width': 2 }, g3);
      el('rect', { x: x - 16, y: 368, width: 32, height: 26, rx: 5, fill: i % 2 ? C.gray : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
    });
    S.inner = []; S.outer = [];
    Object.keys(N).forEach(function (k) {
      var isInner = (k === '1' || k === '2' || k === '5');
      var c = el('circle', { cx: N[k][0], cy: N[k][1], r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3);
      t2(g3, N[k][0], N[k][1] + 6, k, '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      (isInner ? S.inner : S.outer).push(c);
    });
    S.lab3a = t2(g3, 330, 440, '青：' + m('z') + ' を整数のまま残すノード', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.lab3b = t2(g3, 330, 468, '白：葉に隣接するノード（' + m('v') + ', ' + m('z') + ' とも連続に緩めてよい）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '解きやすくする工夫', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 176, '① 部分木の葉をまとめた', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX + 22, 200, '強い制約', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 236, '② アンカーの値で対称性を固定', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 272, '③ ' + m('c') + ' と ' + m('v') + ' は連続に緩める', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 324, '整数変数の数は', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 350, 'データ数によらない', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '論文 Figure 2 の深さ 3 の木と命題 3', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: CV comparison =====
    var g4 = S.g[3];
    var D = [['a1a', 80.9, 79.6], ['bc', 96.0, 94.9], ['heloc', 71.4, 71.0], ['krkp', 93.6, 96.6], ['mush', 99.8, 99.3], ['ttt', 81.0, 93.1], ['monks-1', 100.0, 82.3], ['votes', 95.7, 95.5], ['heart', 89.6, 88.9], ['student', 90.5, 86.0]];
    var X0 = 180, X1 = 590, LO = 65, HI = 100, Y0 = 96, DY = 36;
    function xv(v) { return X0 + (X1 - X0) * (v - LO) / (HI - LO); }
    [70, 80, 90, 100].forEach(function (v) {
      el('line', { x1: xv(v), x2: xv(v), y1: Y0 - 16, y2: Y0 + DY * 9 + 16, stroke: C.hair }, g4);
      el('text', { x: xv(v), y: Y0 + DY * 9 + 40, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.dots4 = D.map(function (d, i) {
      var g = el('g', {}, g4), y = Y0 + DY * i;
      el('text', { x: X0 - 12, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g).textContent = d[0];
      el('line', { x1: xv(d[1]), x2: xv(d[2]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 2 }, g);
      el('circle', { cx: xv(d[2]), cy: y, r: 7, fill: C.a }, g);
      el('circle', { cx: xv(d[1]), cy: y, r: 7, fill: C.b }, g);
      return { g: g, t0: 24.8 + i * 0.3 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 8, cy: 150, r: 7, fill: C.b }, p4); t2(p4, PX + 24, 156, 'ODT（30 分）', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 8, cy: 184, r: 7, fill: C.a }, p4); t2(p4, PX + 24, 190, 'CART（rpart）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 250, 'ODT が上か同じ：8 データ', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 280, 'CART が上：2 データ', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 336, 'ttt では CART が 20 枚の葉、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 360, 'ODT は 8 枚の葉だった', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文の交差検証の比較表（テストデータの精度）から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, 'Mushroom・深さ 3', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '値の組で分岐 99.4%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '1 つの値で分岐', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '97.7%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'JOURNAL OF GLOBAL OPTIMIZATION 2021';
    el('text', { x: 480, y: 222, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Decision Trees for Categorical Data';
    el('text', { x: 480, y: 260, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'via Integer Programming';
    t2(g5, 480, 302, '整数計画による、カテゴリのデータのための最適な決定木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Oktay Günlük, Jayant Kalagnanam, Minhan Li, Matt Menickelly, Katya Scheinberg';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/s10898-021-01009-y';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: highlight one value at a time
    S.c1.forEach(function (c, i) {
      var on = (i === 1 && t > 2.0) || (i === 4 && t > 3.4);
      c.r.setAttribute('fill', on ? '#FCEBDF' : '#fff'); c.r.setAttribute('stroke', on ? C.a : C.ink);
    });
    S.q1.setAttribute('opacity', seg(t, 2.4, 3.2));
    S.p1.setAttribute('opacity', seg(t, 1.0, 1.8));
    // scene 2: both target values light up together
    var s2 = seg(t, 9.6, 10.4);
    S.c2.forEach(function (c, i) {
      var on = TARGET[i] && s2 > 0.5;
      c.r.setAttribute('fill', on ? C.bsoft : '#fff'); c.r.setAttribute('stroke', on ? C.b : C.ink);
    });
    S.left2.setAttribute('opacity', seg(t, 10.4, 11.0));
    S.count2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.p2.setAttribute('opacity', seg(t, 9.0, 9.8));
    // scene 3
    var s3 = seg(t, 18.0, 18.8);
    S.inner.forEach(function (c) { c.setAttribute('fill', H.mix('#FFFFFF', C.bsoft, s3)); c.setAttribute('stroke', s3 > 0.5 ? C.b : C.ink); c.setAttribute('stroke-width', s3 > 0.5 ? 3 : 2); });
    S.lab3a.setAttribute('opacity', seg(t, 18.4, 19.0)); S.lab3b.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    // scene 4
    S.dots4.forEach(function (d) { d.g.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.4)); });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
