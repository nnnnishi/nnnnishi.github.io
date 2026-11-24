// =====================================================================
// teaser-scenes.js — Blanquero, Carrizosa, Molero-Río, Romero Morales, Optimal Randomized Classification
// Trees (Computers & Operations Research 2021; arXiv 2110.11952 v1), unofficial explainer.
// Scenes 1-2 are schematics (labelled 模式図; the probabilities in scene 2 are made up). Scene 3 draws the
// logistic CDF F_gamma(s) = 1/(1+exp(-gamma s)) from the paper. Scene 4 uses the average out-of-sample
// accuracies of Table 5 (depth 4). Scene 5 quotes Table 6 (Pima, rho+ = 0 and 85).
// Colours: orange = deterministic trees (CART, OCT-H MIO); blue = ORCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '混合整数最適化による最適な木は、<span class="A">各データの行き先を 0/1 の変数</span>で表すので、データとともに変数が増える。', en: '' },
    { ja: '<span class="B">ORCT</span> は左に進むかどうかを確率で決め、どのデータもすべての葉に確率つきで届く。', en: '' },
    { ja: '確率はロジスティック関数で表し、γ を大きくするほど決定的な分岐に近づく。整数変数のない連続最適化で解ける。', en: '' },
    { ja: '深さ 4 の平均正解率は 88.4% で、CART と OCT-H MIO を上回り、OCT-H LS とランダムフォレストに近づいた。', en: '' },
    { ja: 'クラスごとの正解率の制約も入れられ、Pima のデータでは陽性のテスト正解率が 56.4% から 80.9% に上がった。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 0/1 routing variables grow with N =====
    var g1 = S.g[0];
    var LX = [250, 330, 410, 490];
    ['葉 1', '葉 2', '葉 3', '葉 4'].forEach(function (s, k) { t2(g1, LX[k], 96, s, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); });
    S.rows1 = [];
    var r1 = H.rng(5);
    for (var i = 0; i < 8; i++) {
      var g = el('g', {}, g1), y = 124 + i * 38, hit = Math.floor(r1() * 4);
      t2(g, 190, y + 6, 'データ ' + (i + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      LX.forEach(function (x, k) {
        el('rect', { x: x - 30, y: y - 15, width: 60, height: 30, rx: 5, fill: k === hit ? '#FCEBDF' : '#fff', stroke: k === hit ? C.a : C.hair, 'stroke-width': 1.5 }, g);
        txt(g, x, y + 6, k === hit ? '1' : '0', { 'font-size': 16, fill: k === hit ? C.a : C.muted, 'text-anchor': 'middle', 'font-weight': k === hit ? 650 : 400 });
      });
      S.rows1.push({ g: g, t0: 1.0 + i * 0.45 });
    }
    S.cnt1 = t2(g1, 340, 450, '', '', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '混合整数最適化（OCT など）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '各データがどの葉に進むかを', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '0/1 の変数で表す。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 282, 'データが増えるほど', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 306, '整数変数も増え、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 330, '解く時間が伸びる。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: randomized routing through a depth-2 tree =====
    var g2 = S.g[1];
    var N2 = [[330, 130], [200, 250], [460, 250], [130, 390], [270, 390], [390, 390], [530, 390]];
    var P = [0.8, 0.3, 0.6];
    var leafP = [P[0] * P[1], P[0] * (1 - P[1]), (1 - P[0]) * P[2], (1 - P[0]) * (1 - P[2])];
    var edges = [[0, 1, P[0]], [0, 2, 1 - P[0]], [1, 3, P[1]], [1, 4, 1 - P[1]], [2, 5, P[2]], [2, 6, 1 - P[2]]];
    S.e2 = edges.map(function (e, k) {
      var a = N2[e[0]], b = N2[e[1]];
      var ln = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.b, 'stroke-width': 1 + 7 * e[2], 'stroke-linecap': 'round', opacity: 0.85 }, g2);
      var lb = txt(g2, (a[0] + b[0]) / 2 + (b[0] < a[0] ? -16 : 16), (a[1] + b[1]) / 2, e[2].toFixed(1), { 'font-size': 16, fill: C.b, 'text-anchor': b[0] < a[0] ? 'end' : 'start', 'font-weight': 600 });
      return { ln: ln, lb: lb, t0: 9.2 + (k < 2 ? 0 : 1.0) };
    });
    N2.forEach(function (n, k) {
      if (k < 3) el('circle', { cx: n[0], cy: n[1], r: 20, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g2);
      else el('rect', { x: n[0] - 20, y: n[1] - 20, width: 40, height: 40, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g2);
    });
    S.lp2 = leafP.map(function (v, k) {
      return txt(g2, N2[k + 3][0], N2[k + 3][1] + 48, v.toFixed(2), { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    S.lpLab = t2(g2, 330, 470, '葉に着く確率（合計 1）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, 'ORCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 198, '左に進む確率', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 228, m('p') + '<tspan dy="5" font-size="12" ' + MI + '>it</tspan><tspan dy="-5"> = </tspan>' + m('F') + '(' + m('a') + '<tspan dy="-7" font-size="12">⊤</tspan><tspan dy="7"></tspan>' + m('x') + '/' + m('p') + ' − ' + m('μ') + ')', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 284, '葉に着く確率は経路上の', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 308, '確率の積になる。', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 360, '目的：誤分類コストの期待値', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（確率の値は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: logistic CDF with growing gamma =====
    var g3 = S.g[2];
    var X0 = 90, X1 = 590, Y0 = 420, Y1 = 140;
    S.sx = function (s) { return X0 + (X1 - X0) * (s + 0.5); };
    S.sy = function (v) { return Y0 - (Y0 - Y1) * v; };
    el('line', { x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: S.sx(0), y1: Y0 + 6, x2: S.sx(0), y2: Y1 - 10, stroke: C.hair, 'stroke-width': 1 }, g3);
    el('line', { x1: X0, y1: S.sy(1), x2: X1, y2: S.sy(1), stroke: C.hair, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, g3);
    txt(g3, X0 - 10, S.sy(1) + 5, '1', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    txt(g3, X0 - 10, Y0 + 5, '0', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    t2(g3, X1, Y0 + 30, m('a') + '<tspan dy="-7" font-size="12">⊤</tspan><tspan dy="7"></tspan>' + m('x') + '/' + m('p') + ' − ' + m('μ'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    txt(g3, S.sx(0), Y0 + 30, '0', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, X0, Y1 - 30, '左に進む確率', '', { 'font-size': 15, fill: C.muted });
    el('path', { d: 'M' + X0 + ',' + Y0 + ' L' + S.sx(0) + ',' + Y0 + ' L' + S.sx(0) + ',' + S.sy(1) + ' L' + X1 + ',' + S.sy(1), fill: 'none', stroke: C.a, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }, g3);
    t2(g3, S.sx(0.05), Y0 - 16, '決定的な分岐', '', { 'font-size': 14, fill: C.a });
    S.curve3 = el('path', { d: '', fill: 'none', stroke: C.b, 'stroke-width': 3.2 }, g3);
    S.gLab = t2(g3, X1, Y1 - 30, '', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 150, 'ロジスティック関数', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 198, m('F') + '<tspan dy="5" font-size="12" ' + MI + '>γ</tspan><tspan dy="-5">(</tspan>' + m('s') + ') = 1 / (1 + ' + m('e') + '<tspan dy="-7" font-size="12">−</tspan><tspan dy="-0" font-size="12" ' + MI + '>γs</tspan><tspan dy="7">)</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 254, m('γ') + ' → ∞ で決定的な', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 278, '最適分類木に一致（命題 1）', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 330, '実験では ' + m('γ') + ' = 512', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 382, '整数変数がないので、', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 406, '連続最適化（IPOPT）で解く', '', { 'font-size': 16, fill: C.muted });

    // ===== scene 4: Table 5 (depth 4) averages =====
    var g4 = S.g[3];
    var rows = [['CART', 86.1, C.a], ['OC1', 85.5, C.gray], ['oblique.tree', 88.1, C.gray], ['OCT-H MIO', 86.3, C.a], ['OCT-H LS', 89.2, C.gray], ['ランダムフォレスト', 90.0, C.gray], ['ORCT', 88.4, C.b]];
    var BX0 = 230, PERP = 40, VMIN = 80;   // 1 point = 40 px, axis starts at 80 %
    [80, 82, 84, 86, 88, 90].forEach(function (v) {
      var x = BX0 + (v - VMIN) * PERP;
      el('line', { x1: x, x2: x, y1: 110, y2: 432, stroke: v === 80 ? C.ink : C.panel, 'stroke-width': v === 80 ? 1.5 : 1 }, g4);
      txt(g4, x, 456, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.bars4 = rows.map(function (r, k) {
      var y = 132 + k * 44;
      t2(g4, BX0 - 12, y + 6, r[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': r[0] === 'ORCT' ? 650 : 400 });
      var rect = el('rect', { x: BX0, y: y - 14, width: 0, height: 28, fill: r[2] }, g4);
      var lab = txt(g4, BX0 + (r[1] - VMIN) * PERP + 8, y + 6, r[1].toFixed(1), { 'font-size': 15, 'font-weight': 650, fill: r[2] === C.gray ? C.muted : r[2] });
      return { rect: rect, lab: lab, w: (r[1] - VMIN) * PERP, t0: 24.8 + k * 0.35 };
    });
    t2(g4, BX0, 90, '深さ 4、UCI の 13 データでのテスト正解率の平均（横軸は 80% から）', '', { 'font-size': 15, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '比べた方法', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 180, 'OCT-H MIO：同じ深さの', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 202, '混合整数最適化', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 234, 'OCT-H LS：深さ 10 までの', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 256, '局所探索', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 288, 'CART、OC1、oblique.tree、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 310, 'RF は深さの制限なし', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 362, 'OCT-H の値は各論文から引用', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 394, 'ORCT の平均時間 1,057 秒', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 5（arXiv 版）の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '陽性のテスト正解率（Pima）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '56.4% → 80.9%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '問題の大きさは', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'データの件数 ' + m('N') + ' によらない', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'COMPUTERS & OPERATIONS RESEARCH 2021', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2 });
    txt(g5, 480, 236, 'Optimal Randomized Classification Trees', { 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 282, '最適な確率的分類木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 336, 'Rafael Blanquero, Emilio Carrizosa, Cristina Molero-Río, Dolores Romero Morales', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 392, 'doi.org/10.1016/j.cor.2021.105281', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var shown = 0;
    S.rows1.forEach(function (r) { var o = seg(t, r.t0, r.t0 + 0.3); r.g.setAttribute('opacity', o); if (t >= r.t0 + 0.15) shown++; });
    S.cnt1.querySelectorAll('text')[0].textContent = shown ? '0/1 の変数：' + shown + ' × 4 = ' + (shown * 4) + ' 個' : '';
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // scene 2
    S.e2.forEach(function (e) { var o = seg(t, e.t0, e.t0 + 0.5); e.ln.setAttribute('opacity', 0.85 * o); e.lb.setAttribute('opacity', o); });
    S.lp2.forEach(function (l) { l.setAttribute('opacity', seg(t, 11.4, 12.0)); });
    S.lpLab.setAttribute('opacity', seg(t, 11.6, 12.2));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: gamma from 2 to 512 (log scale)
    var lg = 1 + 8 * seg(t, 17.4, 22.4), gam = Math.pow(2, lg), d = '';
    for (var i = 0; i <= 300; i++) {
      var s = -0.5 + i / 300, v = 1 / (1 + Math.exp(-gam * s));
      d += (i ? 'L' : 'M') + S.sx(s).toFixed(1) + ',' + S.sy(v).toFixed(1);
    }
    S.curve3.setAttribute('d', d);
    S.gLab.querySelectorAll('text')[0].innerHTML = '<tspan class="mi">γ</tspan> = ' + Math.round(gam);
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.bars4.forEach(function (b) {
      var e = seg(t, b.t0, b.t0 + 0.7);
      b.rect.setAttribute('width', b.w * e);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
