// =====================================================================
// teaser-scenes.js — van der Linden, de Weerdt, Demirović, STreeD (NeurIPS 2023; arXiv 2305.19706 v4),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the
// geometric-mean speed-ups printed in Section 5 and Appendices D and F of the paper.
// Colours: orange = earlier DP frameworks (additive objectives); blue = STreeD (Pareto fronts, merge).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来の動的計画法は部分木を独立に解き、木全体の値を<span class="A">部分木の値の和</span>として求める。', en: '' },
    { ja: 'F 値や公平性の制約では値を 1 つの数に足し合わせられず、部分木の最良の解が 1 つに決まらない。', en: '' },
    { ja: '<span class="B">STreeD</span> は部分木ごとにパレート最適な解を残し、左右の組合せから優越されないものだけを親に渡す。', en: '' },
    { ja: '一般的な枠組みのまま、F 値では専用の動的計画法より約 7 倍速く、精度でも DL8.5 より 6.4 倍速かった。', en: '' },
    { ja: '分離可能性の必要十分条件を満たす目的と制約なら、組み合わせても動的計画法で最適に解ける。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }
  function node(g, x, y, w, h, label, col) {
    el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 8, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
    txt(g, x, y + 6, label, { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
  }
  // scatter frame shared by scenes 2 and 3: x = false positives 0..10, y = false negatives 0..9
  function frame(g, X0, Y0, W, Hh) {
    el('line', { x1: X0, y1: Y0, x2: X0 + W, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: X0, y1: Y0, x2: X0, y2: Y0 - Hh, stroke: C.ink, 'stroke-width': 1.5 }, g);
    txt(g, X0 + W / 2, Y0 + 40, '偽陽性の数', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, X0 - 20, Y0 - Hh - 14, '偽陰性の数', { 'font-size': 16, fill: C.ink });
    [0, 2, 4, 6, 8, 10].forEach(function (v) { txt(g, X0 + v * W / 10, Y0 + 20, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    [2, 4, 6, 8].forEach(function (v) { txt(g, X0 - 10, Y0 - v * Hh / 9 + 5, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); });
    return function (fp, fn) { return [X0 + fp * W / 10, Y0 - fn * Hh / 9]; };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: additive DP =====
    var g1 = S.g[0];
    S.e1 = el('g', {}, g1);
    el('line', { x1: 330, y1: 150, x2: 200, y2: 260, stroke: C.ink, 'stroke-width': 1.6 }, S.e1);
    el('line', { x1: 330, y1: 150, x2: 460, y2: 260, stroke: C.ink, 'stroke-width': 1.6 }, S.e1);
    node(g1, 330, 130, 120, 44, '特徴量 f', C.ink);
    txt(g1, 230, 196, 'f を満たさない', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    txt(g1, 430, 196, 'f を満たす', { 'font-size': 14, fill: C.muted });
    S.sub1 = [[200, '3'], [460, '2']].map(function (p) {
      var g = el('g', {}, g1);
      el('path', { d: 'M' + p[0] + ',255 l-80,110 h160 z', fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      txt(g, p[0], 335, '部分木', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      txt(g, p[0], 400, '誤分類 ' + p[1], { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
      return g;
    });
    S.sum1 = txt(g1, 330, 460, '木全体の誤分類 = 3 + 2 = 5', { 'font-size': 20, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '従来の動的計画法', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '左右の部分木は', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, 'それぞれに届くデータ', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, 'だけで決まる。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, 'DL8・GOSDT・MurTree は', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, '値を足し合わせられる', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 354, '目的を前提にした。', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two values, no single best =====
    var g2 = S.g[1];
    var P2 = frame(g2, 110, 440, 460, 330);
    var L = [[2, 5], [4, 2], [6, 1]];
    S.pts2 = L.map(function (v, i) {
      var p = P2(v[0], v[1]), g = el('g', {}, g2);
      el('circle', { cx: p[0], cy: p[1], r: 10, fill: C.ink }, g);
      txt(g, p[0] + 16, p[1] - 10, '(' + v[0] + ', ' + v[1] + ')', { 'font-size': 16, fill: C.ink });
      return { g: g, t0: 9 + i * 0.5 };
    });
    S.q2 = txt(g2, 340, 140, 'どれが最良？', { 'font-size': 22, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 150, '部分木の候補 3 つ', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p2, PX, 196, '偽陽性を減らすと', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 224, '偽陰性が増える。', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 280, 'F 値は 2 つの数について', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 304, '非線形で、ある葉の最良の', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 328, 'ラベルが別の葉に左右される。', { 'font-size': 16, fill: C.muted });
    txt(g2, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: merge of Pareto fronts =====
    var g3 = S.g[2];
    var P3 = frame(g3, 110, 440, 460, 330);
    var R = [[1, 3], [3, 1]];
    S.combo = [];
    L.forEach(function (a, i) { R.forEach(function (b, j) { S.combo.push([a[0] + b[0], a[1] + b[1]]); }); });
    var dom = function (v) { return S.combo.some(function (w) { return (w[0] <= v[0] && w[1] <= v[1]) && (w[0] < v[0] || w[1] < v[1]); }); };
    S.c3 = S.combo.map(function (v, k) {
      var p = P3(v[0], v[1]), g = el('g', {}, g3);
      var c = el('circle', { cx: p[0], cy: p[1], r: 10, fill: C.ink, stroke: C.muted, 'stroke-width': 2 }, g);
      var lab = el('text', { x: p[0] + 15, y: p[1] - 9, 'font-size': 15, fill: C.ink }, g);
      lab.textContent = '(' + v[0] + ', ' + v[1] + ')';
      return { g: g, c: c, lab: lab, d: dom(v), t0: 17.4 + k * 0.35 };
    });
    var front = S.combo.filter(function (v) { return !dom(v); }).sort(function (a, b) { return a[0] - b[0]; });
    S.line3 = el('polyline', { points: front.map(function (v) { return P3(v[0], v[1]).join(','); }).join(' '), fill: 'none', stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g3);
    S.hd3 = txt(g3, 110, 52, '左 {(2,5), (4,2), (6,1)} ＋ 右 {(1,3), (3,1)}', { 'font-size': 16, fill: C.muted });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, 'STreeD', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 左右のフロントから', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, '1 つずつ選んで結合', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 優越される組合せ', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '（○）を捨てる', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 288, '③ 残り（●）を親の', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 312, 'フロントにする', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 366, '根まで来たら、フロントから', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 390, 'F 値が最大の木を選ぶ。', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: speed-ups (geometric means from the paper) =====
    var g4 = S.g[3];
    var X0 = 330, PER = 34;   // pixels per 1x
    [0, 2, 4, 6, 8].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 100, y2: 420, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      el('text', { x: X0 + v * PER, y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '倍';
    });
    txt(g4, 70, 84, 'STreeD が何倍速いか（幾何平均）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [
      ['F 値・深さ 3', '対 非線形 MurTree', 7.1, 140, '7.1 倍'],
      ['F 値・深さ 4', '対 非線形 MurTree', 6.8, 220, '6.8 倍'],
      ['精度・深さ 4〜5', '対 DL8.5', 6.4, 300, '6.4 倍'],
      ['精度・深さ 4〜5', '対 MurTree', 1 / 1.25, 380, '0.8 倍（MurTree が 1.25 倍速い）']
    ];
    S.bars4 = bars.map(function (b, i) {
      txt(g4, X0 - 14, b[3] - 2, b[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      txt(g4, X0 - 14, b[3] + 18, b[1], { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: b[3] - 18, width: 0, height: 36, fill: i < 3 ? C.b : C.gray }, g4);
      var lab = txt(g4, X0 + b[2] * PER + 10, b[3] + 6, b[4], { 'font-size': i < 3 ? 17 : 15, 'font-weight': 650, fill: i < 3 ? C.b : C.muted });
      return { rect: rect, lab: lab, w: b[2] * PER, t0: 24.6 + i * 0.7 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 140, '処方的な方策（Warfarin）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    txt(S.p4, PX, 174, 'MIP：深さ 3 以上は', { 'font-size': 16, fill: C.a });
    txt(S.p4, PX, 200, '全問 300 秒で時間切れ', { 'font-size': 16, fill: C.a });
    txt(S.p4, PX, 238, 'STreeD：深さ 5 で 3 秒', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    txt(S.p4, PX, 296, '公平性の制約では', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 320, '専用の DPF に近く、', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 344, 'MIP より数桁速い', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の本文と付録の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 130, y: 40, width: 700, height: 76, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 480, 70, '分離可能 ⇔ マルコフ的なコストと遷移', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 98, '＋ 順序を保つ結合 ＋ 反単調な制約', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NEURIPS 2023';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Necessary and Sufficient Conditions for';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Decision Trees using Dynamic Programming';
    txt(g5, 480, 304, '動的計画法で最適決定木を求めるための必要十分条件', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jacobus G. M. van der Linden, Mathijs M. de Weerdt, Emir Demirović';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2305.19706';
    txt(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.sub1.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 1.2 + i * 0.8, 1.8 + i * 0.8)); });
    S.sum1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.p1.setAttribute('opacity', seg(t, 2.4, 3.2));
    // scene 2
    S.pts2.forEach(function (p) { p.g.setAttribute('opacity', seg(t, p.t0, p.t0 + 0.4)); });
    S.q2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.p2.setAttribute('opacity', seg(t, 9.8, 10.6));
    // scene 3: combinations appear, dominated ones turn hollow, then the front line is drawn
    var k = seg(t, 20.2, 21.0);
    S.c3.forEach(function (c) {
      c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.35));
      if (c.d) {
        c.c.setAttribute('fill', H.mix(C.ink, '#FFFFFF', k));
        c.lab.setAttribute('fill', H.mix(C.ink, C.muted, k));
      } else {
        c.c.setAttribute('fill', H.mix(C.ink, C.b, k));
        c.c.setAttribute('stroke', k > 0.5 ? C.b : C.muted);
        c.lab.setAttribute('fill', H.mix(C.ink, C.b, k));
      }
    });
    S.line3.setAttribute('opacity', seg(t, 21.2, 21.9));
    S.hd3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
