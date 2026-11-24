// =====================================================================
// teaser-scenes.js — Vidal & Schiffer, Born-Again Tree Ensembles (ICML 2020; arXiv 2003.11132),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the averages
// of Tables 3 and 4 of the paper.
// Colours: orange = the tree ensemble; blue = the born-again tree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'ランダムフォレストは<span class="A">複数の木の多数決</span>で予測するので、どこで何を返すかを読み取りにくい。', en: '' },
    { ja: 'フォレストのしきい値で特徴空間を区切ると、各セルの中では予測が一定になるが、セルの数は急に増える。', en: '' },
    { ja: '領域を超平面で 2 つに分ける動的計画法で、すべてのセルで同じ予測をする<span class="B">最小の木</span>を求める。', en: '' },
    { ja: '学習データのない領域の分岐を刈り込むと、木の葉はフォレストの葉の合計より少なくなり、精度はほぼ変わらなかった。', en: '' },
    { ja: 'フォレストと特徴空間のどこでも同じ予測をする 1 本の木は、NP 困難でも多くの実データで厳密に求められる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  // toy decision grid 6 x 4: class of each cell (0 = empty dot, 1 = filled dot)
  var GRID = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1]
  ];

  function miniTree(g, cx, y, col, labs) {
    el('line', { x1: cx, y1: y + 16, x2: cx - 40, y2: y + 62, stroke: C.ink, 'stroke-width': 1.4 }, g);
    el('line', { x1: cx, y1: y + 16, x2: cx + 40, y2: y + 62, stroke: C.ink, 'stroke-width': 1.4 }, g);
    el('rect', { x: cx - 34, y: y - 6, width: 68, height: 28, rx: 6, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
    txt(g, cx, y + 13, labs[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    [[cx - 40, labs[1]], [cx + 40, labs[2]]].forEach(function (p) {
      el('circle', { cx: p[0], cy: y + 76, r: 12, fill: p[1] ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g);
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: forest votes =====
    var g1 = S.g[0];
    S.t1 = [[140, ['x₁ ≤ 3', 0, 1]], [330, ['x₂ ≤ 2', 1, 0]], [520, ['x₁ ≤ 5', 0, 1]]].map(function (p, i) {
      var g = el('g', {}, g1);
      miniTree(g, p[0], 150, C.a, p[1]);
      txt(g, p[0], 128, '木 ' + (i + 1), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      return g;
    });
    S.vote1 = el('g', {}, g1);
    el('rect', { x: 150, y: 330, width: 360, height: 70, rx: 12, fill: '#FCEBDF' }, S.vote1);
    txt(S.vote1, 330, 362, 'ある入力 x：●、○、● → 多数決で ●', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    txt(S.vote1, 330, 388, '実験では深さ 3 の木を 10 本', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '木のアンサンブル', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '予測は良いが、', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, '入力ごとに全部の木を', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, 'たどって票を数える。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, '従来の born-again の手法は', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, '同じ予測を保証しない', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: cells =====
    var g2 = S.g[1];
    var GX = 120, GY = 120, CW = 70, CH = 66;
    S.cells2 = [];
    GRID.forEach(function (row, r) {
      row.forEach(function (v, c) {
        var g = el('g', {}, g2);
        el('rect', { x: GX + c * CW, y: GY + r * CH, width: CW, height: CH, fill: '#fff', stroke: C.ink, 'stroke-width': 1.2 }, g);
        el('circle', { cx: GX + c * CW + CW / 2, cy: GY + r * CH + CH / 2, r: 11, fill: v ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g);
        S.cells2.push({ g: g, t0: 9.0 + (r * 6 + c) * 0.05 });
      });
    });
    txt(g2, GX + 3 * CW, GY + 4 * CH + 34, '特徴量 1 のしきい値で区切った列', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 150, 'セルの数', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p2, PX, 196, '∏ (|<tspan ' + MI + '>H</tspan><tspan dy="5" font-size="12" ' + MI + '>j</tspan><tspan dy="-5">| + 1)</tspan>', { 'font-size': 20, fill: C.ink });
    txt(S.p2, PX, 246, '特徴量ごとのしきい値の', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 270, '数の積で、特徴量が増える', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 294, 'と指数的に増える。', { 'font-size': 16, fill: C.muted });
    txt(S.p2, PX, 346, '問題は NP 困難', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    txt(g2, 940, 520, '模式図（6 × 4 のセル）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: recursive splitting into homogeneous regions =====
    var g3 = S.g[2];
    GRID.forEach(function (row, r) {
      row.forEach(function (v, c) {
        el('rect', { x: GX + c * CW, y: GY + r * CH, width: CW, height: CH, fill: '#fff', stroke: C.hair, 'stroke-width': 1 }, g3);
        el('circle', { cx: GX + c * CW + CW / 2, cy: GY + r * CH + CH / 2, r: 11, fill: v ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      });
    });
    S.cut3 = [
      { line: el('line', { x1: GX, x2: GX + 6 * CW, y1: GY + 2 * CH, y2: GY + 2 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 17.0 },
      { line: el('line', { x1: GX + 4 * CW, x2: GX + 4 * CW, y1: GY + 2 * CH, y2: GY + 4 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 18.4 },
      { line: el('line', { x1: GX + 4 * CW, x2: GX + 6 * CW, y1: GY + 3 * CH, y2: GY + 3 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 19.6 },
      { line: el('line', { x1: GX + 3 * CW, x2: GX + 3 * CW, y1: GY + CH, y2: GY + 2 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 20.8 },
      { line: el('line', { x1: GX + 4 * CW, x2: GX + 4 * CW, y1: GY + CH, y2: GY + 2 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 21.6 },
      { line: el('line', { x1: GX, x2: GX + 6 * CW, y1: GY + CH, y2: GY + CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 20.2 },
      { line: el('line', { x1: GX + 5 * CW, x2: GX + 5 * CW, y1: GY + 3 * CH, y2: GY + 4 * CH, stroke: C.b, 'stroke-width': 4 }, g3), t: 19.9 }
    ];
    S.d3 = txt(g3, GX, GY - 24, '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.d3t = S.d3.querySelector('text');
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, '動的計画法', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 領域を超平面で', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, '左右に分ける', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 中が同じクラスなら', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '葉にする（深さ 0）', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 288, '③ 部分領域の結果を', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 312, 'メモして使い回す', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 366, '部分領域の深さは下界、', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 390, '分割の位置は二分探索', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（分割の順は説明用）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: leaves (Table 3 averages) =====
    var g4 = S.g[3];
    var X0 = 300, PER = 0.55;   // px per leaf
    [0, 100, 200, 300, 400, 500].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 110, y2: 330, stroke: v ? C.hair : C.ink, 'stroke-width': v ? 1 : 1.5 }, g4);
      el('text', { x: X0 + v * PER, y: 354, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v;
    });
    txt(g4, 70, 84, '葉の数（6 データの平均）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [['ランダムフォレスト', '10 本の葉の合計', 51.2, C.a], ['born-again tree', '深さを最小化', 567.0, C.b], ['born-again tree', '＋ 刈り込み', 32.8, C.b]];
    S.b4 = bars.map(function (b, i) {
      var y = 130 + i * 70, g = el('g', {}, g4);
      txt(g, X0 - 14, y + 14, b[0], { 'font-size': 15, 'font-weight': 600, fill: b[3], 'text-anchor': 'end' });
      txt(g, X0 - 14, y + 34, b[1], { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      var r = el('rect', { x: X0, y: y + 2, width: 0, height: 34, fill: i === 1 ? C.bsoft : b[3], stroke: b[3], 'stroke-width': i === 1 ? 2 : 0 }, g);
      var tx = el('text', { x: X0 + b[2] * PER + 10, y: y + 26, 'font-size': 16, 'font-weight': 650, fill: b[3] }, g);
      tx.textContent = b[2].toFixed(1);
      return { g: g, r: r, tx: tx, w: b[2] * PER, t0: 24.6 + i * 0.8 };
    });
    S.acc4 = el('g', {}, g4);
    el('rect', { x: 70, y: 384, width: 560, height: 70, rx: 12, fill: C.panel }, S.acc4);
    txt(S.acc4, 94, 414, 'テストでの精度：フォレスト 0.804、born-again 0.804、', { 'font-size': 16, fill: C.ink });
    txt(S.acc4, 94, 440, '刈り込み後 0.803', { 'font-size': 16, fill: C.ink });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 150, '刈り込み', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    txt(S.p4, PX, 184, '分岐の片側にしか', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 208, '学習データがなければ、', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 232, 'データのある側の子で', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 256, '置き換える', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の表 3 と表 4 の平均から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 74, '忠実性', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 98, 'すべての入力で同じ予測', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 660, 74, '刈り込み後の葉', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 660, 98, '32.8（フォレスト 51.2）', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2020';
    el('text', { x: 480, y: 236, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Born-Again Tree Ensembles';
    txt(g5, 480, 290, '木のアンサンブルと同じ予測をする 1 本の決定木', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Thibaut Vidal, Maximilian Schiffer';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v119/vidal20a.html';
    txt(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.t1.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 0.8 + i * 0.6, 1.3 + i * 0.6)); });
    S.vote1.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 2.6, 3.4));
    // scene 2
    S.cells2.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.3)); });
    S.p2.setAttribute('opacity', seg(t, 10.6, 11.4));
    // scene 3
    var n = 0;
    S.cut3.forEach(function (c) { var o = seg(t, c.t, c.t + 0.4); c.line.setAttribute('opacity', o); if (t >= c.t) n++; });
    S.d3t.textContent = n ? '分割 ' + n + ' 回' + (n === 7 ? '：すべての領域が同じクラスに' : '') : '';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.b4.forEach(function (b) {
      b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.3));
      b.r.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.9)));
      b.tx.setAttribute('opacity', seg(t, b.t0 + 0.8, b.t0 + 1.1));
    });
    S.acc4.setAttribute('opacity', seg(t, 27.4, 28.0));
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
