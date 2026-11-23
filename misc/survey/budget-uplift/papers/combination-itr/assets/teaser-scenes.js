// =====================================================================
// teaser-scenes.js — Xu, Fu & Qu (JRSS-B 2024), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図); scene 3 uses an explainer-chosen toy knapsack.
// Scene 4 uses the numbers printed in Table 5 of arXiv v3 (setting 4, n = 2000).
// Colours: orange = one function per combination (existing multi-arm modelling) / best competitor;
//          blue = the Double Encoder Model, its shared encoders and its assignments.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '組合せをそれぞれ別の処置として扱うと、推定する関数の数が処置の数 K に対して指数的に増える。', en: '' },
    { ja: '二重エンコーダモデルは共変量と組合せを同じ空間に埋め込み、<span class="B">内積で処置効果を表す</span>。', en: '' },
    { ja: '予算があるときは、一人に一つの組合せを選ぶ多選択ナップザック問題として割当てを決める。', en: '' },
    { ja: 'シミュレーションで第 2 処置を 20% の人に限ると、<span class="B">提案法</span>の価値は<span class="A">最良の比較手法</span>より 8.08% 高かった。', en: '' },
    { ja: '組合せの効果は共有したパラメータで推定し、予算のもとでの割当てはナップザック問題として解く。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one box per combination, K = 3, 5, 7 =====
    var g1 = S.g[0];
    S.grids = [[3, 4, 2, 60], [5, 8, 4, 28], [7, 16, 8, 12]].map(function (k) {
      var gg = el('g', {}, g1), cols = k[1], rows = k[2], size = k[3];
      var gap = Math.max(3, size * 0.12), W = cols * size + (cols - 1) * gap, Hh = rows * size + (rows - 1) * gap;
      var x0 = 330 - W / 2, y0 = 270 - Hh / 2;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        el('rect', { x: x0 + c * (size + gap), y: y0 + r * (size + gap), width: size, height: size, rx: Math.min(8, size / 4),
          fill: (r * cols + c) % 7 === 3 ? C.a : '#fff', stroke: C.a, 'stroke-width': 1.5 }, gg);
      }
      if (k[0] === 3) txt(gg, 330, y0 - 18, m('δ') + '<tspan dy="5" font-size="13">1</tspan><tspan dy="-5">(' + m('X') + '), …, ' + m('δ') + '</tspan><tspan dy="5" font-size="13">8</tspan><tspan dy="-5">(' + m('X') + ')</tspan>', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      return gg;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, '組合せごとに関数 ' + m('δ') + '<tspan dy="5" font-size="12">' + m('l') + '</tspan><tspan dy="-5">(' + m('X') + ')</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 140, '塗った箱は観測された組合せ', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 162, '（その関数だけが更新される）', '', { 'font-size': 15, fill: C.muted });
    S.kLab = [3, 5, 7].map(function (k, i) {
      var gg = el('g', {}, p1);
      txt(gg, PX, 240, m('K') + ' = ' + k, { 'font-size': 22, 'font-weight': 600, fill: C.ink });
      txt(gg, PX, 290, String(Math.pow(2, k)), { 'font-size': 44, 'font-weight': 650, fill: C.a });
      t2(gg, PX + String(Math.pow(2, k)).length * 27 + 8, 290, '通り', '', { 'font-size': 18, fill: C.ink });
      t2(gg, PX, 340, '500 件を一様に分けると', '', { 'font-size': 15, fill: C.muted });
      t2(gg, PX, 364, '1 組合せあたり約 ' + ['63', '16', '4'][i] + ' 件', '', { 'font-size': 17, fill: C.ink });
      return gg;
    });
    t2(g1, 940, 520, '模式図（件数は 500 ÷ 2' + '<tspan dy="-6" font-size="10">' + m('K') + '</tspan><tspan dy="6"> の計算）</tspan>', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: double encoder =====
    var g2 = S.g[1];
    el('rect', { x: 70, y: 110, width: 130, height: 70, rx: 12, fill: C.panel }, g2);
    txt(g2, 135, 152, '共変量 ' + m('X'), { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    el('rect', { x: 70, y: 330, width: 130, height: 70, rx: 12, fill: C.panel }, g2);
    txt(g2, 135, 372, m('A') + ' = (1, 0, 1)', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    el('path', { d: 'M200,145 L262,145', stroke: C.muted, 'stroke-width': 2 }, g2);
    el('path', { d: 'M200,365 L262,365', stroke: C.muted, 'stroke-width': 2 }, g2);
    txt(g2, 231, 132, m('α'), { 'font-size': 18, fill: C.b, 'text-anchor': 'middle' });
    txt(g2, 231, 352, m('β'), { 'font-size': 18, fill: C.b, 'text-anchor': 'middle' });
    var av = [0.8, -0.5, 0.6], bv = [0.7, 0.4, 0.9];
    S.aBars = []; S.bBars = [];
    av.forEach(function (v, i) {
      var y = 108 + i * 26;
      el('line', { x1: 330, x2: 330, y1: y - 2, y2: y + 20, stroke: C.hair }, g2);
      S.aBars.push({ e: el('rect', { x: 330, y: y, width: 0, height: 18, rx: 3, fill: C.b }, g2), v: v });
    });
    bv.forEach(function (v, i) {
      var y = 328 + i * 26;
      el('line', { x1: 330, x2: 330, y1: y - 2, y2: y + 20, stroke: C.hair }, g2);
      S.bBars.push({ e: el('rect', { x: 330, y: y, width: 0, height: 18, rx: 3, fill: C.b }, g2), v: v });
    });
    t2(g2, 270, 200, m('α') + '(' + m('X') + ') ∈ ℝ' + '<tspan dy="-7" font-size="12">' + m('r') + '</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 270, 420, m('β') + '(' + m('A') + ') ∈ ℝ' + '<tspan dy="-7" font-size="12">' + m('r') + '</tspan>', '', { 'font-size': 16, fill: C.ink });
    S.dot2 = el('g', {}, g2);
    el('path', { d: 'M420,145 C480,145 480,255 520,255 M420,365 C480,365 480,255 520,255', stroke: C.b, 'stroke-width': 2, fill: 'none' }, S.dot2);
    el('rect', { x: 520, y: 220, width: 120, height: 70, rx: 12, fill: C.bsoft }, S.dot2);
    t2(S.dot2, 580, 250, '処置効果', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    txt(S.dot2, 580, 276, m('α') + '<tspan dy="-7" font-size="11">⊤</tspan><tspan dy="7">' + m('β') + '</tspan>', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 120, 'E[' + m('Y') + ' | ' + m('X') + ', ' + m('A') + '] =', { 'font-size': 19, fill: C.ink });
    txt(p2, PX + 20, 152, m('m') + '(' + m('X') + ') + ' + m('α') + '(' + m('X') + ')<tspan dy="-7" font-size="11">⊤</tspan><tspan dy="7">' + m('β') + '(' + m('A') + ')</tspan>', { 'font-size': 19, fill: C.b });
    t2(p2, PX, 214, m('β') + ' は組合せのベクトルを', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 240, '入力とするネット', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 290, '重みは全組合せで共有', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(p2, PX, 316, '入力の次元は ' + m('K') + '（2' + '<tspan dy="-6" font-size="11">' + m('K') + '</tspan><tspan dy="6">ではない）</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（ベクトルの値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: toy multiple-choice knapsack =====
    var g3 = S.g[2];
    var CX = [200, 300, 400, 510], CN = ['なし', 'A', 'B', 'A + B'], CC = [0, 1, 2, 3];
    var E = [[0, 3, 2, 5], [0, 1, 4, 4.5], [0, 2.5, 1, 3]], OPT = [1, 2, 1];
    CN.forEach(function (n, j) {
      t2(g3, CX[j], 80, n, '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      t2(g3, CX[j], 108, '費用 ' + CC[j], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: 70, x2: 580, y1: 124, y2: 124, stroke: C.hair, 'stroke-width': 1.5 }, g3);
    S.best3 = []; S.opt3 = [];
    E.forEach(function (row, i) {
      var y = 170 + i * 66;
      t2(g3, 90, y + 6, (i + 1) + ' 人目', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      S.opt3.push(el('rect', { x: CX[OPT[i]] - 45, y: y - 22, width: 90, height: 40, rx: 8, fill: C.bsoft }, g3));
      S.best3.push(el('rect', { x: CX[3] - 43, y: y - 20, width: 86, height: 36, rx: 7, fill: 'none', stroke: C.a, 'stroke-width': 2.5 }, g3));
      row.forEach(function (v, j) { txt(g3, CX[j], y + 6, String(v), { 'font-size': 19, fill: j === 0 ? C.muted : C.ink, 'text-anchor': 'middle' }); });
    });
    var p3a = S.p3a = el('g', {}, g3), p3b = S.p3b = el('g', {}, g3);
    t2(g3, PX, 110, '予算の合計 4', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p3a, PX, 170, '各人の最善（A + B）', '', { 'font-size': 17, fill: C.a });
    t2(p3a, PX, 200, '費用 9 &gt; 予算 4', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(p3b, PX, 260, '予算内の最適', '', { 'font-size': 17, fill: C.b });
    t2(p3b, PX, 290, '費用 4、効果の和 9.5', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p3b, PX, 340, '論文は動的計画法で解く', '', { 'font-size': 16, fill: C.ink });
    t2(p3b, PX, 366, '（擬多項式時間）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（効果と費用は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 5 (arXiv v3), setting 4, n = 2000 =====
    var g4 = S.g[3];
    var rows = [['20%', 5.789, [4.108, 5.356, 5.317, 5.015]], ['50%', 6.015, [4.437, 5.897, 5.778, 5.298]],
                ['80%', 6.324, [4.847, 6.215, 6.117, 5.598]], ['100%', 6.732, [5.252, 6.506, 6.494, 6.057]]];
    var X0 = 170, X1 = 600, LO = 4, HI = 7, Y0 = 130, DY = 76;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 58, '価値関数（第 2 処置を受けられる人の割合ごと）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [4, 5, 6, 7].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 30, y2: Y0 + DY * 3 + 28, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: Y0 + DY * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v;
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = { parts: [] }, best = Math.max.apply(null, rw[2]);
      el('text', { x: X0 - 20, y: y + 6, 'font-size': 17, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.parts.push(el('line', { x1: cx(best), x2: cx(rw[1]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 4 }, g4));
      rw[2].forEach(function (v) { if (v !== best) o.parts.push(el('circle', { cx: cx(v), cy: y, r: 7, fill: C.gray }, g4)); });
      o.parts.push(el('circle', { cx: cx(best), cy: y, r: 10, fill: C.a }, g4));
      o.parts.push(el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: C.b }, g4));
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 9, fill: C.b }, p4);
    t2(p4, PX + 26, 111, '提案法（DEM）', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 9, fill: C.a }, p4);
    t2(p4, PX + 26, 146, '最良の比較手法（OWL-MD）', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 175, r: 7, fill: C.gray }, p4);
    t2(p4, PX + 26, 181, 'その他の 3 手法', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 236, '制約 20%', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 272, '+8.08%', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 316, '制約なし（100%）', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 350, '+3.47%', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 396, '5 処置、交互作用あり、2000 件', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 5（arXiv v3）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'JOURNAL OF THE ROYAL STATISTICAL SOCIETY SERIES B · 2024';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal individualized treatment rule for';
    el('text', { x: 480, y: 244, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'combination treatments under budget constraints';
    t2(g5, 480, 292, '予算制約のもとでの組合せ処置に対する最適な個別化処置ルール', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Qi Xu · Haoda Fu · Annie Qu';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1093/jrsssb/qkad141';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: K = 3 -> 5 -> 7
    var w = [[0.3, 3.0], [3.0, 5.3], [5.3, 8]];
    S.grids.forEach(function (g, i) {
      var o = seg(t, w[i][0], w[i][0] + 0.5) * (i < 2 ? 1 - seg(t, w[i][1] - 0.3, w[i][1] + 0.2) : 1);
      g.setAttribute('opacity', o); S.kLab[i].setAttribute('opacity', o);
    });
    S.p1.setAttribute('opacity', seg(t, 0.8, 1.5));
    // scene 2: vectors grow, then the inner product
    S.aBars.concat(S.bBars).forEach(function (o, i) {
      var k = seg(t, 9.2 + (i % 3) * 0.3, 10.4 + (i % 3) * 0.3), wd = Math.abs(o.v) * 70 * k;
      o.e.setAttribute('width', wd); o.e.setAttribute('x', o.v < 0 ? 330 - wd : 330);
    });
    S.dot2.setAttribute('opacity', seg(t, 11.2, 12));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: per-person best (over budget), then the knapsack optimum
    S.best3.forEach(function (r) { r.setAttribute('opacity', seg(t, 17.2, 17.8) * (1 - 0.6 * seg(t, 20.2, 20.8))); });
    S.p3a.setAttribute('opacity', seg(t, 17.6, 18.3));
    S.opt3.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 19.8 + i * 0.3, 20.3 + i * 0.3)); });
    S.p3b.setAttribute('opacity', seg(t, 20.6, 21.3));
    // scene 4: rows in order, then the panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.parts.forEach(function (e) { e.setAttribute('opacity', s); });
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
