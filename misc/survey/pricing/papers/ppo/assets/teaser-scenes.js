// =====================================================================
// teaser-scenes.js — Ito & Fujimaki, Optimization Beyond Prediction: Prescriptive Price Optimization
// (arXiv 1605.05422 v2; KDD 2017), unofficial explainer. Player: teaser-engine.js.
// Scenes 1–3 are schematics (labelled 模式図). Scene 3 uses the run time in Sec. 5.2, scene 4 the 15% in Sec. 5.3,
// scene 5 the numbers in Sec. 6.2.
// Colours: orange = exhaustive search / exact MIQP and the over-optimistic predicted profit; blue = the SDP relaxation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '各商品の販売数を、自分と<span class="B">ほかの商品の価格</span>の回帰で予測する。', en: '' },
    { ja: '価格を候補から 1 つずつ選ぶと、<span class="A">K<sup>M</sup> 通り</span>の二値二次計画になる。', en: '' },
    { ja: '<span class="B">SDP 緩和</span>で解き、250 商品を約 6 分で解いた。', en: '' },
    { ja: '推定した予測式で最適化すると、予測上の利益は<span class="A">実際より楽観的</span>になる。', en: '' },
    { ja: 'ビール 50 商品で、控えめな見積りでも粗利が 8.2% 上がると試算した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var items = [];
  function at(t0, g) { items.push({ g: g, t0: t0 }); return g; }
  function T(p, x, y, s, a) { return t2(p, x, y, s, '', a); }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = { g: [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); }) };

    // ===== scene 1: cross-price regression =====
    var g1 = S.g[0], names = ['A', 'B', 'C', 'D'];
    names.forEach(function (n, i) {
      var x = 110 + i * 120;
      el('rect', { x: x, y: 120, width: 80, height: 50, rx: 10, fill: C.panel }, g1);
      T(g1, x + 40, 152, '価格 ' + n, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      el('rect', { x: x, y: 330, width: 80, height: 50, rx: 10, fill: C.panel }, g1);
      T(g1, x + 40, 362, '販売数 ' + n, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      el('line', { x1: x + 40, y1: 172, x2: x + 40, y2: 328, stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    var cross = at(2.5, el('g', {}, g1));
    [[0, 1], [1, 0], [1, 2], [2, 3], [3, 2]].forEach(function (e) {
      el('line', { x1: 150 + e[0] * 120, y1: 172, x2: 150 + e[1] * 120, y2: 328, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, cross);
    });
    var p1 = at(1.0, el('g', {}, g1));
    T(p1, PX, 150, '線形回帰', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 190, m('q') + '<tspan font-size="12" dy="4">' + m('m') + '</tspan><tspan dy="-4"> = α + Σ β·' + m('f') + '(' + m('p') + ') + Σ γ·' + m('g') + '</tspan>', { 'font-size': 17, fill: C.ink });
    T(p1, PX, 240, '実線：自分の価格の効果', { 'font-size': 15, fill: C.ink });
    T(p1, PX, 266, '破線：ほかの商品の価格の効果', { 'font-size': 15, fill: C.b });
    T(p1, PX, 292, '（交差効果、多くは疎）', { 'font-size': 15, fill: C.muted });
    T(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: price candidates -> BQP =====
    var g2 = S.g[1], pick = [0, 2, 1, 4, 0, 3];
    S.cells = [];
    for (var r = 0; r < 6; r++) {
      T(g2, 90, 152 + r * 50, '商品 ' + (r + 1), { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      for (var k = 0; k < 5; k++) {
        var c = el('rect', { x: 110 + k * 76, y: 130 + r * 50, width: 66, height: 34, rx: 8, fill: C.panel }, g2);
        S.cells.push({ r: c, on: pick[r] === k, t0: 10 + r * 0.45 });
      }
    }
    ['定価', '5%', '10%', '15%', '20%'].forEach(function (s, k) { T(g2, 143 + k * 76, 118, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    var p2 = at(9.0, el('g', {}, g2));
    T(p2, PX, 150, '各行で 1 つだけ選ぶ', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 190, m('z') + '<tspan font-size="12" dy="4">' + m('mk') + '</tspan><tspan dy="-4"> ∈ {0, 1}</tspan>', { 'font-size': 18, fill: C.ink });
    T(p2, PX, 240, '粗利は ' + m('z') + ' の二次式', { 'font-size': 16, fill: C.ink });
    var p2b = at(12.6, el('g', {}, g2));
    T(p2b, PX, 300, '全部試すと', { 'font-size': 16, fill: C.ink });
    T(p2b, PX, 344, m('K') + '<tspan dy="-12" font-size="20">' + m('M') + '</tspan><tspan dy="12"> 通り</tspan>', { 'font-size': 34, 'font-weight': 700, fill: C.a });
    T(p2b, PX, 380, 'NP 困難', { 'font-size': 16, fill: C.a });
    T(g2, 940, 520, '模式図（候補の値は例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: SDP relaxation and run time =====
    var g3 = S.g[2];
    var s1 = at(16.6, el('g', {}, g3));
    T(s1, 160, 160, m('t') + '<tspan font-size="12" dy="4">' + m('i') + '</tspan><tspan dy="-4"> ∈ {−1, 1}</tspan>', { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    el('circle', { cx: 160, cy: 260, r: 70, fill: 'none', stroke: C.hair, 'stroke-width': 2 }, s1);
    el('circle', { cx: 90, cy: 260, r: 7, fill: C.a }, s1); el('circle', { cx: 230, cy: 260, r: 7, fill: C.a }, s1);
    var s2 = at(18.2, el('g', {}, g3));
    T(s2, 400, 160, '単位ベクトル ' + m('x') + '<tspan font-size="12" dy="4">' + m('i') + '</tspan>', { 'font-size': 20, fill: C.b, 'text-anchor': 'middle' });
    el('circle', { cx: 400, cy: 260, r: 70, fill: 'none', stroke: C.hair, 'stroke-width': 2 }, s2);
    [[0.5], [1.7], [2.6], [4.1], [5.3]].forEach(function (a) {
      el('line', { x1: 400, y1: 260, x2: 400 + 70 * Math.cos(a[0]), y2: 260 + 70 * Math.sin(a[0]), stroke: C.b, 'stroke-width': 2.5 }, s2);
    });
    el('path', { d: 'M245,260 L320,260', stroke: C.muted, 'stroke-width': 2 }, s2);
    var s3 = at(19.8, el('g', {}, g3));
    T(s3, 400, 380, m('Y') + ' ⪰ O,  ' + m('Y') + '<tspan font-size="12" dy="4">' + m('ii') + '</tspan><tspan dy="-4"> = 1</tspan>', { 'font-size': 20, fill: C.b, 'text-anchor': 'middle' });
    T(s3, 400, 410, '半正定値計画（上界が得られる）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = at(21.0, el('g', {}, g3));
    T(p3, PX, 160, '人工データ', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p3, PX, 220, '250 商品を約 6 分', { 'font-size': 26, 'font-weight': 700, fill: C.b });
    T(p3, PX, 266, 'MIQP・MILP 緩和は', { 'font-size': 16, fill: C.a });
    T(p3, PX, 290, '11 商品で 1 時間の上限', { 'font-size': 16, fill: C.a });
    T(g3, 940, 520, '左は模式図、右は論文 5.2 節の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: optimistic bias =====
    var g4 = S.g[3];
    el('line', { x1: 140, y1: 400, x2: 520, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.bar4a = el('rect', { x: 190, y: 400, width: 110, height: 0, fill: C.a }, g4);
    S.bar4b = el('rect', { x: 360, y: 400, width: 110, height: 0, fill: C.gray }, g4);
    T(g4, 245, 430, '予測上の利益', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    T(g4, 415, 430, '実際の利益', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var p4 = at(26.4, el('g', {}, g4));
    T(p4, PX, 160, '50 商品・相対雑音 0.2', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 216, '15% 以上', { 'font-size': 34, 'font-weight': 700, fill: C.a });
    T(p4, PX, 250, '予測が実際を上回った', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 310, '雑音が大きいほど、', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 334, 'データが少ないほど開く', { 'font-size': 15, fill: C.muted });
    T(g4, 940, 520, '論文 5.3 節（棒の高さは模式的）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: beer data + title card =====
    var g5 = S.g[4];
    [['LS 予測上', '33.2%', C.a], ['LS-OMP 予測上', '19.1%', C.b], ['控えめな見積り', '8.2%', C.b]].forEach(function (b, i) {
      var x = 120 + i * 250;
      el('rect', { x: x, y: 40, width: 220, height: 70, rx: 12, fill: i ? C.bsoft : '#FCEBDF' }, g5);
      T(g5, x + 110, 68, b[0], { 'font-size': 15, fill: b[2], 'text-anchor': 'middle' });
      T(g5, x + 110, 98, b[1], { 'font-size': 22, 'font-weight': 700, fill: b[2], 'text-anchor': 'middle' });
    });
    el('text', { x: 480, y: 176, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2017 · ARXIV 1605.05422';
    el('text', { x: 480, y: 226, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimization Beyond Prediction:';
    el('text', { x: 480, y: 266, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Prescriptive Price Optimization';
    T(g5, 480, 308, '需要の予測式から価格の最適化問題を作って解く', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 356, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Shinji Ito · Ryohei Fujimaki';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/1605.05422';
    T(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    items.forEach(function (it) { it.g.setAttribute('opacity', seg(t, it.t0, it.t0 + 0.6)); });
    S.cells.forEach(function (c) { c.r.setAttribute('fill', c.on && t > c.t0 ? C.b : C.panel); });
    var hA = 230 * seg(t, 24.8, 26.0), hB = 230 / 1.15 * seg(t, 24.8, 26.0);
    S.bar4a.setAttribute('y', 400 - hA); S.bar4a.setAttribute('height', hA);
    S.bar4b.setAttribute('y', 400 - hB); S.bar4b.setAttribute('height', hB);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21.5 });
})();
