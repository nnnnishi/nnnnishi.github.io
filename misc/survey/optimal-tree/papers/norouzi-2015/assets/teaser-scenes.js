// =====================================================================
// teaser-scenes.js — Norouzi, Collins, Johnson, Fleet, Kohli, Efficient Non-greedy Optimization of
// Decision Trees (NIPS 2015), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図). Scene 3 evaluates the paper's upper bound (eq. 7) for a
// one-node tree on toy points with a 0/1 leaf loss, so the curve follows the formula, not data.
// Scene 4 counts the leaves examined per gradient step: 2^d (= m+1, exhaustive) vs d+1 (fast), from the
// paper's text. Colours: orange = greedy / the empirical loss / exhaustive search; blue = the paper's method.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '貪欲法は<span class="A">ノードに届いたデータだけで分岐を 1 つずつ決め</span>、決めた分岐をあとから直さない。', en: '' },
    { ja: '木全体の経験損失は分岐の重みについて段差になり、勾配法をそのまま使えない。', en: '' },
    { ja: '<span class="B">論文の方法</span>は経験損失の連続な上界を作り、全ノードの分岐を勾配法で同時に下げる。', en: '' },
    { ja: '損失拡張推論で調べる葉を <span class="B"> d + 1 個</span>に絞り、勾配 1 回の計算量を O(d²p) にした。', en: '' },
    { ja: '4 つのデータで、非貪欲な木は貪欲法の木よりテスト精度が高く、過学習しにくかったと論文は報告する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }

  // toy data for scenes 2-3: positions on [0, 10]; side +1 = should go right (x > b), -1 = left
  var PTS = [[1.0, -1], [2.0, -1], [3.2, -1], [4.5, -1], [6.3, -1], [3.8, 1], [5.5, 1], [7.0, 1], [8.0, 1], [9.0, 1]];
  var PX0 = 90, PX1 = 590, PY0 = 410, PY1 = 130, YMAX = 6;
  function bx(b) { return PX0 + (PX1 - PX0) * b / 10; }
  function by(v) { return PY0 - (PY0 - PY1) * v / YMAX; }
  function loss(b) { var L = 0; PTS.forEach(function (p) { if ((p[0] - b) * p[1] <= 0) L++; }); return L; }
  // paper's bound for one node with 0/1 leaf loss: max(z + l(+), -z + l(-)) - |z|, z = s (x - b)
  function bound(b, s) {
    var B = 0;
    PTS.forEach(function (p) {
      var z = s * (p[0] - b), lp = p[1] > 0 ? 0 : 1, lm = p[1] > 0 ? 1 : 0;
      B += Math.max(z + lp, -z + lm) - Math.abs(z);
    });
    return B;
  }
  function stepPath() {
    var d = '', N = 1000;
    for (var i = 0; i <= N; i++) { var b = 10 * i / N; d += (i ? 'L' : 'M') + bx(b).toFixed(1) + ',' + by(loss(b)).toFixed(1); }
    return d;
  }
  function boundPath(s) {
    var d = '', N = 400;
    for (var i = 0; i <= N; i++) { var b = 10 * i / N; d += (i ? 'L' : 'M') + bx(b).toFixed(1) + ',' + by(bound(b, s)).toFixed(1); }
    return d;
  }
  function axes(g) {
    el('line', { x1: PX0, y1: PY0, x2: PX1, y2: PY0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: PX0, y1: PY0, x2: PX0, y2: PY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g);
    t2(g, PX1, PY0 + 30, '分岐のしきい値 ' + m('b'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, PX0 - 10, PY1 - 22, '誤分類の数', '', { 'font-size': 15, fill: C.muted });
    PTS.forEach(function (p) {
      var x = bx(p[0]);
      if (p[1] > 0) el('circle', { cx: x, cy: PY0 + 58, r: 7, fill: C.ink }, g);
      else el('circle', { cx: x, cy: PY0 + 58, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g);
    });
    t2(g, PX0, PY0 + 90, '● は右、○ は左に行くべき点', '', { 'font-size': 14, fill: C.muted });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: greedy growth, one node at a time =====
    var g1 = S.g[0];
    var N1 = [[330, 120], [200, 240], [460, 240], [130, 360], [270, 360], [390, 360], [530, 360]];
    var par = [-1, 0, 0, 1, 1, 2, 2];
    S.nodes1 = N1.map(function (p, i) {
      var g = el('g', {}, g1);
      if (par[i] >= 0) el('line', { x1: N1[par[i]][0], y1: N1[par[i]][1], x2: p[0], y2: p[1], stroke: C.gray, 'stroke-width': 2.5 }, g);
      var c = el('circle', { cx: p[0], cy: p[1], r: 24, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      var lab = t2(g, p[0], p[1] + 6, m('s') + '<tspan dy="5" font-size="12">' + (i + 1) + '</tspan>', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      var dl = t2(g, p[0] + (i === 0 ? 34 : 0), p[1] + (i === 0 ? 6 : 50), '𝒟<tspan dy="5" font-size="11">' + (i + 1) + '</tspan>', '', { 'font-size': 15, fill: C.muted, 'text-anchor': i === 0 ? 'start' : 'middle' });
      return { g: g, c: c, t0: 1.0 + i * 0.75 };
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '貪欲法（CART など）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, 'ノード ' + m('i') + ' に届いたデータ', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, m('𝒟') + '<tspan dy="5" font-size="12" ' + MI + '>i</tspan><tspan dy="-5"> だけで分岐を決め、</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 254, '上から順に育てる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '決めた分岐は、下の層を', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 334, '学習したあとも直さない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: piecewise-constant empirical loss =====
    var g2 = S.g[1];
    axes(g2);
    S.step2 = el('path', { d: stepPath(), fill: 'none', stroke: C.a, 'stroke-width': 3 }, g2);
    S.step2len = 2400;
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '経験損失', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 198, '分岐を動かしても、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '点をまたぐときだけ', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 254, '段差で変わる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 310, '勾配は 0 か、定義されない。', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 334, '深い木ではノード間の', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 358, '依存も加わる。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（1 ノードの木、点は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: the convex-concave upper bound =====
    var g3 = S.g[2];
    axes(g3);
    el('path', { d: stepPath(), fill: 'none', stroke: C.a, 'stroke-width': 2.2, opacity: 0.55 }, g3);
    S.bnd3 = el('path', { d: boundPath(0.3), fill: 'none', stroke: C.b, 'stroke-width': 3.2 }, g3);
    S.sLab = t2(g3, PX1 - 4, PY1 - 22, '', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 150, '代理の目的関数', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 198, '上界は区分線形で連続。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 226, '全ノードの分岐を', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 254, '勾配法で同時に下げる。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 310, m('W') + ' を大きくすると', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 334, '上界は損失に近づくが、', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 358, '段差も戻る。そこで', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 382, '‖' + m('w') + '<tspan dy="5" font-size="12" ' + MI + '>i</tspan><tspan dy="-5">‖² ≤ </tspan>' + m('ν') + ' と制約する。', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '模式図（論文の上界の式を架空の点で計算）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: leaves examined per gradient step =====
    var g4 = S.g[3];
    var D4 = [6, 10, 14, 18], GX = [150, 270, 390, 510], Y0 = 420, Y1 = 110;
    function ly(v) { return Y0 - (Y0 - Y1) * Math.log10(v) / 6; }
    [1, 10, 100, 1000, 10000, 100000, 1000000].forEach(function (v, k) {
      el('line', { x1: 90, x2: 590, y1: ly(v), y2: ly(v), stroke: k ? C.panel : C.ink, 'stroke-width': k ? 1 : 1.5 }, g4);
      txt(g4, 82, ly(v) + 5, ['1', '10', '100', '1,000', '10⁴', '10⁵', '10⁶'][k], { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    S.bars4 = [];
    D4.forEach(function (d, k) {
      var full = Math.pow(2, d), fast = d + 1;
      t2(g4, GX[k] + 22, Y0 + 28, '深さ ' + d, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      var ra = el('rect', { x: GX[k] - 6, y: Y0, width: 26, height: 0, fill: C.a }, g4);
      var rb = el('rect', { x: GX[k] + 24, y: Y0, width: 26, height: 0, fill: C.b }, g4);
      var la = txt(g4, GX[k] + 7, ly(full) - 8, full.toLocaleString('en-US'), { 'font-size': 14, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
      var lb = txt(g4, GX[k] + 37, ly(fast) - 8, String(fast), { 'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      S.bars4.push({ ra: ra, rb: rb, la: la, lb: lb, ha: Y0 - ly(full), hb: Y0 - ly(fast), t0: 25.0 + k * 0.7 });
    });
    t2(g4, 90, 84, '勾配 1 回の損失拡張推論で調べる葉の数（対数目盛）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '全探索', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 176, '全部の葉 2' + '<tspan dy="-7" font-size="12" ' + MI + '>d</tspan><tspan dy="7"> 個、</tspan>' + m('O') + '(2<tspan dy="-7" font-size="12" ' + MI + '>d</tspan><tspan dy="7"> </tspan>' + m('p') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 226, '高速版', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 252, m('d') + ' + 1 個、' + m('O') + '(' + m('d') + '²' + m('p') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 278, 'ハミング距離 1 以内に限る', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 334, 'Connect4 の学習時間も、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 358, '深い木ほど高速版との', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 382, '差が開いた（論文 Fig. 4）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '葉の数は論文の本文の式から計算', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '全ノードの分岐と葉を', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '1 つの上界で同時に学習', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '勾配 1 回の計算量', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, m('O') + '(' + m('d') + '²' + m('p') + ')', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'NIPS 2015', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g5, 480, 222, 'Efficient Non-greedy Optimization', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 262, 'of Decision Trees', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 304, '決定木の効率的な非貪欲最適化', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 354, 'Mohammad Norouzi, Maxwell D. Collins, Matthew Johnson, David J. Fleet, Pushmeet Kohli', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 408, 'arxiv.org/abs/1511.04056', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.nodes1.forEach(function (n) {
      n.g.setAttribute('opacity', seg(t, n.t0, n.t0 + 0.4));
      n.c.setAttribute('fill', H.mix('#FFFFFF', '#FCEBDF', seg(t, n.t0 + 0.4, n.t0 + 0.8)));
    });
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    // scene 2: the step curve is drawn from left to right
    var k2 = seg(t, 9.0, 12.0);
    S.step2.setAttribute('stroke-dasharray', S.step2len);
    S.step2.setAttribute('stroke-dashoffset', S.step2len * (1 - k2));
    S.p2.setAttribute('opacity', seg(t, 10.0, 10.8));
    // scene 3: the scale of w grows, the bound tightens towards the loss
    var s = 0.25 * Math.pow(6, seg(t, 18.6, 22.6));
    S.bnd3.setAttribute('d', boundPath(s));
    S.sLab.querySelectorAll('text')[0].textContent = t < 20.6 ? '‖w‖ が小さい：なめらかな上界' : '‖w‖ が大きい：損失に近づく';
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.bars4.forEach(function (b) {
      var e = seg(t, b.t0, b.t0 + 0.8);
      b.ra.setAttribute('height', b.ha * e); b.ra.setAttribute('y', 420 - b.ha * e);
      b.rb.setAttribute('height', b.hb * e); b.rb.setAttribute('y', 420 - b.hb * e);
      b.la.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
      b.lb.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
