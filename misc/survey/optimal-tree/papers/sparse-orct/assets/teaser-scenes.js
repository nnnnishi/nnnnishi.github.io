// =====================================================================
// teaser-scenes.js — Blanquero, Carrizosa, Molero-Río, Romero Morales, Sparsity in Optimal Randomized
// Classification Trees (EJOR 2020; arXiv 2002.09191 v1), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 plots the Wisconsin columns of Table 2 (local S-ORCT,
// depth 1): delta^L and out-of-sample accuracy for the 17 values of lambda^L.
// Colours: orange = variables in use (dense cuts, CART's many variables); blue = sparsity gained by S-ORCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '斜めの分岐の木は精度が高いが、各分岐に<span class="A">すべての変数</span>が入りうるので解釈しにくい。', en: '' },
    { ja: 'CART の分岐は 1 変数ずつでも、深い木は全体で多くの変数を使う。分岐ごとと木全体の、2 つのまばらさがある。', en: '' },
    { ja: '<span class="B">S-ORCT</span> は L1 罰則で分岐ごとの係数を、L∞ 罰則で変数ごとにすべての分岐の係数をまとめて 0 に縮める。', en: '' },
    { ja: 'Wisconsin では変数の 85% を使わない木でも、正解率は 96.2% から 95.7% への低下で済んだ。', en: '' },
    { ja: '18 のデータで、どちらのまばらさも分類の精度をほとんど落とさずに高められたと論文は報告する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }
  function matrix(g, x0, y0, rows, cols, cw) {
    var cells = [];
    for (var j = 0; j < rows; j++) {
      cells.push([]);
      for (var t = 0; t < cols; t++) cells[j].push(el('rect', { x: x0 + t * cw, y: y0 + j * cw, width: cw - 6, height: cw - 6, rx: 5, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g));
    }
    return cells;
  }
  function labels(g, x0, y0, rows, cols, cw) {
    for (var j = 0; j < rows; j++) txt(g, x0 - 12, y0 + j * cw + cw / 2 + 2, '変数 ' + (j + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    for (var t = 0; t < cols; t++) txt(g, x0 + t * cw + (cw - 6) / 2, y0 - 12, String(t + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: dense oblique cuts =====
    var g1 = S.g[0], X1 = 250, Y1 = 140, CW = 50;
    t2(g1, X1 + 72, 100, '分岐ノード', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    labels(g1, X1, Y1, 6, 3, CW);
    S.c1 = matrix(g1, X1, Y1, 6, 3, CW);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '斜めの分岐', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '係数 ' + m('a') + '<tspan dy="5" font-size="12" ' + MI + '>jt</tspan><tspan dy="-5"> が 0 でない変数を</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '各分岐ですべて使いうる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 282, '精度は高いが、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 306, '分岐の意味を読み取りにくい。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: local vs global sparsity (a deep axis-aligned tree) =====
    var g2 = S.g[1], X2 = 200, Y2 = 140, CW2 = 46;
    t2(g2, X2 + 158, 100, 'CART（深さ 3）の分岐ノード', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    labels(g2, X2, Y2, 6, 7, CW2);
    S.c2 = matrix(g2, X2, Y2, 6, 7, CW2);
    S.pick2 = [2, 0, 4, 1, 5, 3, 0];   // one variable per node
    S.rowmark2 = [];
    for (var j = 0; j < 6; j++) S.rowmark2.push(el('rect', { x: X2 + 7 * CW2 + 4, y: Y2 + j * CW2 + 10, width: 18, height: CW2 - 26, rx: 3, fill: C.a, opacity: 0 }, g2));
    t2(g2, X2 + 7 * CW2 + 13, Y2 + 6 * CW2 + 20, '使う', '', { 'font-size': 13, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '2 つのまばらさ', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 198, '分岐ごと ' + m('δ') + '<tspan dy="5" font-size="12" ' + MI + '>L</tspan><tspan dy="-5">：各列で</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 224, '使わない変数の割合', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 268, '木全体 ' + m('δ') + '<tspan dy="5" font-size="12" ' + MI + '>G</tspan><tspan dy="-5">：どの列でも</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 294, '使わない変数の割合', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 350, 'この木は ' + m('δ') + '<tspan dy="5" font-size="12" ' + MI + '>L</tspan><tspan dy="-5"> が高いが、</tspan>', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 374, '6 変数すべてを使う（' + m('δ') + '<tspan dy="5" font-size="12" ' + MI + '>G</tspan><tspan dy="-5"> = 0）', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: L1 then L-infinity =====
    var g3 = S.g[2], X3 = 250, Y3 = 140;
    t2(g3, X3 + 72, 100, '分岐ノード', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    labels(g3, X3, Y3, 6, 3, CW);
    S.c3 = matrix(g3, X3, Y3, 6, 3, CW);
    // which cells L1 zeroes (scattered), which rows L-infinity zeroes (whole rows 2 and 5)
    S.l1zero = [[0, 1], [1, 0], [2, 2], [3, 1], [4, 0], [5, 2]];
    S.rows3 = [1, 4];
    S.box3 = S.rows3.map(function (j) { return el('rect', { x: X3 - 4, y: Y3 + j * CW - 4, width: 3 * CW + 2, height: CW + 2, rx: 7, fill: 'none', stroke: C.b, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: 0 }, g3); });
    S.lab3 = t2(g3, X3 + 72, 470, '', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, 'S-ORCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 172, m('g') + ' + ' + m('λ') + '<tspan dy="-7" font-size="12" ' + MI + '>L</tspan><tspan dy="7"> Σ‖</tspan>' + m('a') + '<tspan dy="5" font-size="12" ' + MI + '>j·</tspan><tspan dy="-5">‖₁</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 202, '  + ' + m('λ') + '<tspan dy="-7" font-size="12" ' + MI + '>G</tspan><tspan dy="7"> Σ‖</tspan>' + m('a') + '<tspan dy="5" font-size="12" ' + MI + '>j·</tspan><tspan dy="-5">‖∞</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 256, 'L1：係数を 1 つずつ罰する', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 282, 'L∞：変数の行の最大値を罰し、', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 306, '行をまるごと 0 にする', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 358, '誤分類コストの期待値 ' + m('g') + ' は', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 382, 'ORCT と同じ', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Wisconsin, Table 2 =====
    var g4 = S.g[3];
    var DL = [0, 1, 4, 7, 10, 16, 28, 39, 50, 59, 67, 74, 85, 87, 91, 95, 99];
    var AC = [96.2, 96.4, 96.1, 96.0, 96.1, 96.3, 96.3, 96.3, 96.3, 96.5, 96.3, 95.8, 95.7, 94.7, 92.7, 91.2, 64.1];
    var GX0 = 110, GX1 = 590, GY0 = 420, GY1 = 130;
    function gx(i) { return GX0 + (GX1 - GX0) * i / 16; }
    function gy(v) { return GY0 - (GY0 - GY1) * v / 100; }
    [0, 25, 50, 75, 100].forEach(function (v) {
      el('line', { x1: GX0, x2: GX1, y1: gy(v), y2: gy(v), stroke: v ? C.panel : C.ink, 'stroke-width': v ? 1 : 1.5 }, g4);
      txt(g4, GX0 - 10, gy(v) + 5, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    ['0', '2⁻¹²', '2⁻⁸', '2⁻⁴', '2⁰', '2³'].forEach(function (s, k) {
      var idx = [0, 1, 5, 9, 13, 16][k];
      txt(g4, gx(idx), GY0 + 26, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    t2(g4, GX1, GY0 + 52, m('λ') + '<tspan dy="-7" font-size="12" ' + MI + '>L</tspan><tspan dy="7"></tspan>', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'end' });
    S.pD = el('path', { d: '', fill: 'none', stroke: C.b, 'stroke-width': 3.2 }, g4);
    S.pA = el('path', { d: '', fill: 'none', stroke: C.ink, 'stroke-width': 2.4, 'stroke-dasharray': '7 4' }, g4);
    S.data4 = { DL: DL, AC: AC, gx: gx, gy: gy };
    S.mark4 = el('g', {}, g4);
    el('circle', { cx: gx(12), cy: gy(85), r: 7, fill: C.b }, S.mark4);
    el('circle', { cx: gx(12), cy: gy(95.7), r: 7, fill: C.ink }, S.mark4);
    txt(S.mark4, gx(12) - 12, gy(85) + 24, '85%', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
    txt(S.mark4, gx(12) - 12, gy(95.7) - 12, '95.7%', { 'font-size': 15, 'font-weight': 650, fill: C.ink, 'text-anchor': 'end' });
    t2(g4, GX0, 96, 'Wisconsin（30 変数、深さ 1）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '青の実線：' + m('δ') + '<tspan dy="5" font-size="12" ' + MI + '>L</tspan><tspan dy="-5"></tspan>', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 176, '使わない変数の割合', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 216, '黒の破線：テスト正解率', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 270, m('λ') + '<tspan dy="-7" font-size="12" ' + MI + '>L</tspan><tspan dy="7"> = 2⁻¹ で</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 296, '変数の 85% を使わず、', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 322, '正解率 95.7%（罰則なしは 96.2%）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 374, '最も強い罰則では 64.1% に下がる', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv 版）の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, 'L1：分岐ごとの変数を減らす', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'L∞：木全体から変数を外す', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, 'Iris（深さ 2）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '変数の 75% を外して 96.2%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH 2020', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 1.5 });
    txt(g5, 480, 232, 'Sparsity in Optimal Randomized Classification Trees', { 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 278, '最適な確率的分類木のまばらさ', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 332, 'Rafael Blanquero, Emilio Carrizosa, Cristina Molero-Río, Dolores Romero Morales', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 388, 'doi.org/10.1016/j.ejor.2019.12.002', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 456, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function setCell(r, on, col) {
    r.setAttribute('fill', on ? col : '#fff');
    r.setAttribute('stroke', on ? col : C.hair);
    r.setAttribute('opacity', on ? 0.85 : 1);
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: all cells fill in, row by row
    S.c1.forEach(function (row, j) { row.forEach(function (r) { setCell(r, t >= 1.0 + j * 0.35, C.a); }); });
    S.p1.setAttribute('opacity', seg(t, 2.4, 3.2));
    // scene 2: one cell per node, then the used rows are marked
    S.c2.forEach(function (row, j) { row.forEach(function (r, k) { setCell(r, S.pick2[k] === j && t >= 9.0 + k * 0.4, C.a); }); });
    S.rowmark2.forEach(function (r) { r.setAttribute('opacity', 0.85 * seg(t, 12.2, 12.8)); });
    S.p2.setAttribute('opacity', seg(t, 10.0, 10.8));
    // scene 3: L1 removes scattered cells, then L-infinity removes rows 2 and 5
    S.c3.forEach(function (row, j) {
      row.forEach(function (r, k) {
        var z1 = S.l1zero.some(function (c) { return c[0] === j && c[1] === k; }) && t >= 18.0 + j * 0.2;
        var z2 = S.rows3.indexOf(j) >= 0 && t >= 21.0;
        setCell(r, !(z1 || z2), C.a);
      });
    });
    S.box3.forEach(function (b) { b.setAttribute('opacity', seg(t, 21.0, 21.4)); });
    var lab = t < 17.6 ? '' : t < 20.6 ? 'L1：係数が 1 つずつ 0 になる' : 'L∞：変数 2 と 5 が木全体から外れる';
    S.lab3.querySelectorAll('text')[0].textContent = lab;
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: lines drawn left to right
    var d4 = S.data4, n = 16 * seg(t, 24.8, 28.8), dD = '', dA = '';
    for (var i = 0; i <= Math.floor(n); i++) {
      dD += (i ? 'L' : 'M') + d4.gx(i).toFixed(1) + ',' + d4.gy(d4.DL[i]).toFixed(1);
      dA += (i ? 'L' : 'M') + d4.gx(i).toFixed(1) + ',' + d4.gy(d4.AC[i]).toFixed(1);
    }
    S.pD.setAttribute('d', dD); S.pA.setAttribute('d', dA);
    S.mark4.setAttribute('opacity', seg(t, 29.0, 29.6));
    S.p4.setAttribute('opacity', seg(t, 29.2, 30.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
