// =====================================================================
// teaser-scenes.js — Verwer & Zhang, Learning optimal classification trees using a binary linear program
// formulation (AAAI 2019), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic (labelled 模式図). Scenes 2-3 use Example 1 / Example 2 of the paper (9 rows,
// 4 thresholds, the table of leaf assignments for t_n1, t_n2). Scene 4 uses Table 6 (test accuracy, depth 2);
// scene 5 uses Table 2 / Table 3.
// Colours: orange = earlier formulations (OCT, DTIP: variables per row); blue = BinOCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">これまでの定式化</span>は学習データの 1 行ごとに変数を作るので、データが増えると問題が大きくなる。', en: '' },
    { ja: '同じクラスが続く所では分けないので、例の 9 行ではしきい値の候補が 4 つに減る。', en: '' },
    { ja: '<span class="B">BinOCT</span> は 4 つの候補を二分探索に並べ、2 つの 0-1 変数で 1 つを選ぶ。', en: '' },
    { ja: '深さ 2 では、10 分で解いた <span class="B">BinOCT</span> が 15 データ中 11 データで <span class="A">OCT</span> の精度を上回った。', en: '' },
    { ja: '0-1 変数の数は行数によらないので、数千行のデータでも数百個で済む。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }

  var CLS = ['+', '+', '+', '−', '−', '+', '−', '+', '+'];
  var LEFTMAX = [2, 4, 5, 6];            // th(1)..th(4): largest value going left (Example 2)
  var BITS = ['1 1', '1 0', '0 1', '0 0'];
  var VX = function (v) { return 110 + v * 52; };

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: per-row variables grow with R =====
    var g1 = S.g[0];
    t2(g1, 330, 96, '各行 ' + m('r') + ' がどの葉に入るか', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    ['葉 1', '葉 2', '葉 3', '葉 4'].forEach(function (s, k) { t2(g1, 200 + k * 90, 132, s, '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }); });
    S.rows1 = [];
    for (var r = 0; r < 12; r++) {
      var g = el('g', {}, g1), y = 150 + r * 28;
      t2(g, 140, y + 18, '行 ' + (r + 1), '', { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
      for (var k = 0; k < 4; k++) el('rect', { x: 168 + k * 90, y: y, width: 64, height: 22, rx: 4, fill: C.a, 'fill-opacity': 0.22, stroke: C.a, 'stroke-width': 1 }, g);
      S.rows1.push({ g: g, t0: 1.0 + r * 0.32 });
    }
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'これまでの定式化', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, 'OCT：整数変数 ' + m('O') + '(' + m('R') + '·2' + '<tspan dy="-7" font-size="12" ' + MI + '>K</tspan><tspan dy="7">)</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 228, 'DTIP：整数変数 ' + m('O') + '(' + m('R') + '·' + m('K') + ')', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 280, m('R') + '：行数、' + m('K') + '：木の深さ', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 330, '行が増えるほど', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 356, '解く時間が急に延びる', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Example 1, thresholds reduced from 8 to 4 =====
    var g2 = S.g[1];
    S.cells2 = CLS.map(function (c, v) {
      var g = el('g', {}, g2);
      el('rect', { x: VX(v) - 22, y: 210, width: 44, height: 70, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g);
      el('text', { x: VX(v), y: 240, 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = v;
      el('text', { x: VX(v), y: 268, 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = c;
      return g;
    });
    t2(g2, 78, 240, '値', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g2, 78, 268, 'クラス', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.allTh = []; S.keepTh = [];
    for (var v = 0; v < 8; v++) {
      var keep = CLS[v] !== CLS[v + 1], x = (VX(v) + VX(v + 1)) / 2;
      var ln = el('line', { x1: x, x2: x, y1: 196, y2: 300, stroke: keep ? C.b : C.gray, 'stroke-width': keep ? 3 : 2, 'stroke-dasharray': keep ? '' : '5 4' }, g2);
      (keep ? S.keepTh : S.allTh).push(ln);
    }
    S.thLab = [];
    var ti = 0;
    for (v = 0; v < 8; v++) if (CLS[v] !== CLS[v + 1]) {
      ti++;
      S.thLab.push(t2(g2, (VX(v) + VX(v + 1)) / 2, 330, m('th') + '(' + ti + ')', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' }));
    }
    S.n8 = t2(g2, 330, 400, '隣り合う値の間：8 か所', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    S.n4 = t2(g2, 330, 430, 'クラスが変わる所だけ：4 か所', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 200, '論文の例 1', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 246, '1 候補に 1 変数なら 4 変数', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 278, '二分探索なら log₂4 = 2 変数', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });

    // ===== scene 3: two bits choose one threshold =====
    var g3 = S.g[2];
    // binary search tree
    var R0 = [330, 86], A = [[240, 160], [420, 160]], LV = [[195, 230], [285, 230], [375, 230], [465, 230]];
    S.edges = [];
    function edge(p, q, lab) {
      var e = el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: C.gray, 'stroke-width': 3 }, g3);
      t2(g3, (p[0] + q[0]) / 2 + (q[0] < p[0] ? -14 : 14), (p[1] + q[1]) / 2, lab, '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      return e;
    }
    S.e1 = [edge(R0, A[0], '1'), edge(R0, A[1], '0')];
    S.e2 = [edge(A[0], LV[0], '1'), edge(A[0], LV[1], '0'), edge(A[1], LV[2], '1'), edge(A[1], LV[3], '0')];
    [R0].concat(A).forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 14, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3); });
    t2(g3, R0[0] - 26, R0[1] + 6, m('t') + sub('n,1'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, A[0][0] - 24, A[0][1] + 6, m('t') + sub('n,2'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, A[1][0] + 24, A[1][1] + 6, m('t') + sub('n,2'), '', { 'font-size': 16, fill: C.ink });
    S.lv = LV.map(function (p, i) {
      var r = el('rect', { x: p[0] - 34, y: p[1] - 16, width: 68, height: 32, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      var tx = el('text', { x: p[0], y: p[1] + 6, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, g3); tx.textContent = 'th(' + (i + 1) + ')';
      return { r: r, tx: tx };
    });
    S.cells3 = CLS.map(function (c, v) {
      var r = el('rect', { x: VX(v) - 22, y: 330, width: 44, height: 64, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      el('text', { x: VX(v), y: 356, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g3).textContent = v;
      el('text', { x: VX(v), y: 382, 'font-size': 19, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g3).textContent = c;
      return r;
    });
    S.cut3 = el('line', { x1: 0, x2: 0, y1: 318, y2: 406, stroke: C.b, 'stroke-width': 4 }, g3);
    S.lab3L = t2(g3, 110, 432, '左の葉', '', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    t2(g3, 530, 432, '右の葉', '', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, 'BinOCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.bitT = t2(p3, PX, 172, '', '', { 'font-size': 22, 'font-weight': 650, fill: C.b }).querySelector('text');
    S.thT = t2(p3, PX, 210, '', '', { 'font-size': 17, fill: C.ink }).querySelector('text');
    t2(p3, PX, 268, '範囲ごとの行の和に', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 292, 'big-M をかけた制約で、', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 316, '行の向きが決まる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '論文の例 2', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 6, depth 2 =====
    var g4 = S.g[3];
    var D = [['Balance-scale', 69.3, 67.1], ['Banknote', 91.7, 90.1], ['Car', 77.8, 73.7], ['Ionosphere', 88.6, 87.8], ['Iris', 96.3, 92.4], ['Monks-1', 80.0, 67.7], ['Monks-2', 58.1, 60.0], ['Monks-3', 93.5, 94.2], ['PI-diabetes', 75.4, 72.9], ['Qsar', 78.6, 76.1], ['Seismic', 93.9, 93.3], ['Spambase', 85.3, 84.3], ['Statlog-sat.', 67.5, 63.2], ['Tic-tac-toe', 67.3, 69.6], ['Wine', 90.7, 91.6]];
    var X0 = 210, X1 = 600, LO = 55, HI = 100, Y0 = 92, DY = 25;
    function xv(v) { return X0 + (X1 - X0) * (v - LO) / (HI - LO); }
    [60, 70, 80, 90, 100].forEach(function (v) {
      el('line', { x1: xv(v), x2: xv(v), y1: Y0 - 14, y2: Y0 + DY * 14 + 14, stroke: C.hair }, g4);
      el('text', { x: xv(v), y: Y0 + DY * 15 + 8, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.dots4 = D.map(function (d, i) {
      var g = el('g', {}, g4), y = Y0 + DY * i;
      el('text', { x: X0 - 12, y: y + 5, 'font-size': 14, fill: C.ink, 'text-anchor': 'end' }, g).textContent = d[0];
      el('line', { x1: xv(d[1]), x2: xv(d[2]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 2 }, g);
      el('circle', { cx: xv(d[2]), cy: y, r: 7, fill: C.a }, g);
      el('circle', { cx: xv(d[1]), cy: y, r: 7, fill: C.b }, g);
      return { g: g, t0: 24.8 + i * 0.25 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 8, cy: 150, r: 7, fill: C.b }, p4); t2(p4, PX + 24, 156, 'BinOCT（10 分）', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 8, cy: 184, r: 7, fill: C.a }, p4); t2(p4, PX + 24, 190, 'OCT（30 分〜2 時間）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 250, 'BinOCT が上：11 データ', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 280, 'OCT が上：4 データ', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 336, '深さ 4 では BinOCT が', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 360, '過学習し、CART に負ける', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 384, 'データが多かった', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 6（深さ 2、テストデータ）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '0-1 変数の数', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '2' + '<tspan dy="-8" font-size="12" ' + MI + '>K</tspan><tspan dy="8">(</tspan>' + m('F') + ' + ' + m('C') + ' + log ' + m('T') + ')', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, 'Statlog-satellite（深さ 4）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '0-1 変数 741 個', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2019';
    el('text', { x: 480, y: 222, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Classification Trees Using';
    el('text', { x: 480, y: 260, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'a Binary Linear Program Formulation';
    t2(g5, 480, 302, '二値の線形計画による最適な分類木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Sicco Verwer, Yingqian Zhang';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v33i01.33011624';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.rows1.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3)); });
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2
    S.cells2.forEach(function (c, v) { c.setAttribute('opacity', seg(t, 8.6 + v * 0.12, 9.0 + v * 0.12)); });
    var all = seg(t, 10.0, 10.6), cut = seg(t, 12.0, 12.8);
    S.allTh.forEach(function (l) { l.setAttribute('opacity', all * (1 - cut)); });
    S.keepTh.forEach(function (l) { l.setAttribute('opacity', all); });
    S.thLab.forEach(function (l) { l.setAttribute('opacity', cut); });
    S.n8.setAttribute('opacity', all * (1 - 0.6 * cut));
    S.n4.setAttribute('opacity', cut);
    S.p2.setAttribute('opacity', seg(t, 12.8, 13.6));
    // scene 3: cycle through the four bit settings
    var k = Math.min(3, Math.max(0, Math.floor((t - 17.2) / 1.6)));
    var on = t >= 17.2 ? 1 : 0;
    var b1 = k < 2 ? 0 : 1, b2 = k % 2;   // edge index: 0 = bit 1, 1 = bit 0
    S.e1.forEach(function (e, i) { e.setAttribute('stroke', on && i === b1 ? C.b : C.gray); });
    S.e2.forEach(function (e, i) { e.setAttribute('stroke', on && i === b1 * 2 + b2 ? C.b : C.gray); });
    S.lv.forEach(function (L, i) { var hit = on && i === k; L.r.setAttribute('fill', hit ? C.b : '#fff'); L.tx.setAttribute('fill', hit ? '#fff' : C.ink); });
    var lm = LEFTMAX[k];
    S.cells3.forEach(function (r, v) { r.setAttribute('fill', on && v <= lm ? C.bsoft : '#fff'); r.setAttribute('stroke', on && v <= lm ? C.b : C.ink); });
    var cx = (VX(lm) + VX(lm + 1)) / 2;
    S.cut3.setAttribute('x1', cx); S.cut3.setAttribute('x2', cx); S.cut3.setAttribute('opacity', on);
    S.bitT.innerHTML = on ? ('<tspan ' + MI + '>t</tspan><tspan dy="5" font-size="12">n,1</tspan><tspan dy="-5">, </tspan><tspan ' + MI + '>t</tspan><tspan dy="5" font-size="12">n,2</tspan><tspan dy="-5"> = ' + BITS[k].replace(' ', ', ') + '</tspan>') : '';
    S.thT.textContent = on ? ('→ th(' + (k + 1) + ') を選ぶ') : '';
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    // scene 4
    S.dots4.forEach(function (d) { d.g.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.4)); });
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 22 });
})();
