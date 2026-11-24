// =====================================================================
// teaser-scenes.js — Blanquero, Carrizosa, Molero-Río, Romero Morales, On sparse optimal regression trees
// (EJOR 2022), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図). Scene 2 evaluates the S-ORRT prediction
// phi(x) = p(x) phi_L(x) + (1 - p(x)) phi_R(x), p = logistic, for made-up leaf lines.
// Scene 4 uses the average out-of-sample R^2 of Table 4. Scene 5 quotes Section 4.3 (Ailerons).
// Colours: orange = benchmarks / integer variables / variables in use; blue = S-ORRT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '混合整数最適化による最適な回帰木は<span class="A">個体ごとの整数変数</span>をもち、データの次元が増えると計算が重い。', en: '' },
    { ja: '<span class="B">S-ORRT</span> は葉ごとの線形予測を到達確率で重みづけするので、予測は入力についてなめらかに変わる。', en: '' },
    { ja: 'L1 罰則で分岐と葉の係数を 1 つずつ、L∞ 罰則で変数ごとにすべての係数をまとめて 0 に縮める。', en: '' },
    { ja: '9 データの平均 R² は深さ 3 で 0.6257 と CART・OLS・LASSO を上回り、ORT-H LS と RF には少し及ばなかった。', en: '' },
    { ja: 'Ailerons では R² をほぼ保ったまま、分岐ごとのまばらさを 84%、木全体のまばらさを 52% まで高められた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: integer variables per individual =====
    var g1 = S.g[0];
    var LX = [250, 330, 410, 490];
    ['葉 1', '葉 2', '葉 3', '葉 4'].forEach(function (s, k) { t2(g1, LX[k], 96, s, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); });
    S.rows1 = [];
    var r1 = H.rng(9);
    for (var i = 0; i < 8; i++) {
      var g = el('g', {}, g1), y = 124 + i * 38, hit = Math.floor(r1() * 4);
      t2(g, 190, y + 6, '個体 ' + (i + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      LX.forEach(function (x, k) {
        el('rect', { x: x - 30, y: y - 15, width: 60, height: 30, rx: 5, fill: k === hit ? '#FCEBDF' : '#fff', stroke: k === hit ? C.a : C.hair, 'stroke-width': 1.5 }, g);
        txt(g, x, y + 6, k === hit ? '1' : '0', { 'font-size': 16, fill: k === hit ? C.a : C.muted, 'text-anchor': 'middle', 'font-weight': k === hit ? 650 : 400 });
      });
      S.rows1.push({ g: g, t0: 1.0 + i * 0.4 });
    }
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '混合整数の回帰木', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, '個体ごとと変数ごとに', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 224, '整数変数をもつ。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 280, '次元が増えると', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 304, '小さなデータでも計算が重い。', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 328, '局所探索（ORT-H LS）では', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 352, '木全体の性質を制御できない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: smooth prediction from two linear leaves =====
    var g2 = S.g[1];
    var X0 = 110, X1 = 590, Y0 = 420, Y1 = 130;
    function sx(x) { return X0 + (X1 - X0) * x; }
    function sy(v) { return Y0 - (Y0 - Y1) * v / 6; }
    function phiL(x) { return 1 + 3 * x; }
    function phiR(x) { return 5.2 - 2.5 * x; }
    el('line', { x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, X1, Y0 + 30, '予測変数 ' + m('x'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g2, X0 - 6, Y1 - 24, '予測 ' + m('φ'), '', { 'font-size': 15, fill: C.muted });
    // the two leaf lines (thin, gray)
    el('line', { x1: sx(0), y1: sy(phiL(0)), x2: sx(1), y2: sy(phiL(1)), stroke: C.gray, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g2);
    el('line', { x1: sx(0), y1: sy(phiR(0)), x2: sx(1), y2: sy(phiR(1)), stroke: C.gray, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g2);
    t2(g2, sx(1) + 6, sy(phiL(1)) + 5, '葉 L', '', { 'font-size': 14, fill: C.muted });
    t2(g2, sx(1) + 6, sy(phiR(1)) + 5, '葉 R', '', { 'font-size': 14, fill: C.muted });
    // CART-like constant leaves (step)
    S.step2 = el('path', { d: 'M' + sx(0) + ',' + sy(2.0) + ' L' + sx(0.5) + ',' + sy(2.0) + ' L' + sx(0.5) + ',' + sy(4.0) + ' L' + sx(1) + ',' + sy(4.0), fill: 'none', stroke: C.a, 'stroke-width': 2.6 }, g2);
    S.stepLab = t2(g2, sx(0.2), sy(2.0) + 24, 'CART：葉ごとに定数', '', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
    var d = '';
    for (var i2 = 0; i2 <= 200; i2++) {
      var x = i2 / 200, p = 1 / (1 + Math.exp(-14 * (0.5 - x)));
      d += (i2 ? 'L' : 'M') + sx(x).toFixed(1) + ',' + sy(p * phiL(x) + (1 - p) * phiR(x)).toFixed(1);
    }
    S.smooth2 = el('path', { d: d, fill: 'none', stroke: C.b, 'stroke-width': 3.4 }, g2);
    S.smLab = t2(g2, sx(0.8), sy(3.2) + 32, 'S-ORRT', '', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, 'S-ORRT の予測', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 196, m('φ') + '<tspan dy="5" font-size="12" ' + MI + '>i</tspan><tspan dy="-5"> = Σ </tspan>' + m('P') + '<tspan dy="5" font-size="12" ' + MI + '>it</tspan><tspan dy="-5"> </tspan>' + m('φ') + '<tspan dy="5" font-size="12" ' + MI + '>it</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 236, '葉ごとの線形予測を', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 260, '到達確率で重みづけ', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 314, '偏微分 ∂Φ/∂' + m('x') + '<tspan dy="5" font-size="12" ' + MI + '>j</tspan><tspan dy="-5"> で</tspan>', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 338, '個体ごとの説明が求まる', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（葉の直線は架空、確率はロジスティック関数）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: sparsity over branch and leaf coefficients =====
    var g3 = S.g[2], MX = 200, MY = 150, CW = 46;
    t2(g3, MX + 1.5 * CW - 3, 104, '分岐ノード', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, MX + 3 * CW + 16 + 2 * CW - 3, 104, '葉（線形予測）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.c3 = [];
    for (var j = 0; j < 6; j++) {
      txt(g3, MX - 12, MY + j * CW + CW / 2 + 2, '変数 ' + (j + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      S.c3.push([]);
      for (var t = 0; t < 7; t++) {
        var x0 = MX + t * CW + (t >= 3 ? 16 : 0);
        S.c3[j].push(el('rect', { x: x0, y: MY + j * CW, width: CW - 6, height: CW - 6, rx: 5, fill: C.a, opacity: 0.85 }, g3));
      }
    }
    S.l1zero3 = [[0, 1], [0, 5], [1, 0], [2, 2], [2, 4], [3, 3], [4, 1], [4, 6], [5, 0], [5, 5]];
    S.rows3 = [1, 4];
    S.box3 = S.rows3.map(function (j) { return el('rect', { x: MX - 5, y: MY + j * CW - 5, width: 7 * CW + 16 + 4, height: CW + 4, rx: 7, fill: 'none', stroke: C.b, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: 0 }, g3); });
    S.lab3 = t2(g3, MX + 3.6 * CW, MY + 6 * CW + 34, '', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 150, '2 つの罰則', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 196, 'L1：係数を 1 つずつ罰する', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 222, '（分岐ごとのまばらさ）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 264, 'L∞：変数の行の最大値を罰し、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 290, '分岐と葉の係数をまとめて 0 に', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 316, '（木全体のまばらさ）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 4 averages =====
    var g4 = S.g[3];
    var rows = [['CART', 0.5105, C.a], ['OLS', 0.5017, C.a], ['LASSO', 0.5020, C.a], ['ORT-H LS', 0.6420, C.a], ['ランダムフォレスト', 0.6946, C.a], ['S-ORRT 深さ 1', 0.5628, C.b], ['S-ORRT 深さ 2', 0.6205, C.b], ['S-ORRT 深さ 3', 0.6257, C.b]];
    var BX0 = 230, PER = 520;
    [0, 0.2, 0.4, 0.6].forEach(function (v) {
      var x = BX0 + v * PER;
      el('line', { x1: x, x2: x, y1: 104, y2: 452, stroke: v ? C.panel : C.ink, 'stroke-width': v ? 1 : 1.5 }, g4);
      txt(g4, x, 474, v.toFixed(1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.b4 = rows.map(function (r, k) {
      var y = 124 + k * 42;
      t2(g4, BX0 - 12, y + 6, r[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': r[2] === C.b ? 650 : 400 });
      var rect = el('rect', { x: BX0, y: y - 13, width: 0, height: 26, fill: r[2], opacity: r[2] === C.a ? 0.8 : 1 }, g4);
      var lab = txt(g4, BX0 + r[1] * PER + 8, y + 6, r[1].toFixed(4), { 'font-size': 15, 'font-weight': 650, fill: r[2] });
      return { rect: rect, lab: lab, w: r[1] * PER, t0: 24.8 + k * 0.35 };
    });
    t2(g4, BX0, 88, '9 データでのテストの R² の平均', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 4 の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, 'Ailerons、R² をほぼ保ったまま', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'まばらさ 1% → 84%（分岐ごと）', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '同じ範囲で', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'まばらさ 0% → 52%（木全体）', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH 2022', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 1.5 });
    txt(g5, 480, 236, 'On Sparse Optimal Regression Trees', { 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 282, 'まばらな最適回帰木について', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 336, 'Rafael Blanquero, Emilio Carrizosa, Cristina Molero-Río, Dolores Romero Morales', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 390, 'doi.org/10.1016/j.ejor.2021.12.022', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 456, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.rows1.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3)); });
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    S.step2.setAttribute('opacity', seg(t, 9.0, 9.6));
    S.stepLab.setAttribute('opacity', seg(t, 9.2, 9.8));
    S.smooth2.setAttribute('opacity', seg(t, 11.0, 11.8));
    S.smLab.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.c3.forEach(function (row, j) {
      row.forEach(function (r, k) {
        var z1 = S.l1zero3.some(function (c) { return c[0] === j && c[1] === k; }) && t >= 18.0 + j * 0.2;
        var z2 = S.rows3.indexOf(j) >= 0 && t >= 21.0;
        var off = z1 || z2;
        r.setAttribute('fill', off ? '#fff' : C.a);
        r.setAttribute('stroke', off ? C.hair : 'none');
        r.setAttribute('opacity', off ? 1 : 0.85);
      });
    });
    S.box3.forEach(function (b) { b.setAttribute('opacity', seg(t, 21.0, 21.4)); });
    S.lab3.querySelectorAll('text')[0].textContent = t < 17.6 ? '' : t < 20.6 ? 'L1：係数が 1 つずつ 0 になる' : 'L∞：変数 2 と 5 が分岐からも葉からも外れる';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.b4.forEach(function (b) {
      var e = seg(t, b.t0, b.t0 + 0.7);
      b.rect.setAttribute('width', b.w * e);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
