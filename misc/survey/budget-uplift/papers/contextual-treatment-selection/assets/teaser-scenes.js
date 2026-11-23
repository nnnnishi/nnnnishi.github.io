// =====================================================================
// teaser-scenes.js — Zhao, Fang & Simchi-Levi (SDM 2017), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers stated in the text of Sections 4.2-4.3 (arXiv v1).
// Colours: orange = Separate Model Approach (one response model per treatment);
//          blue = the paper's unbiased estimate of the expected response and CTS.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">処置ごとに応答の予測モデル</span>を別々に作ると、学習は応答の予測に向かい、処置による差を捉えにくい。', en: '' },
    { ja: 'どの対象でも結果を観測できる処置は 1 つだけで、最適な処置という正解ラベルはない。', en: '' },
    { ja: '推奨と実際の処置が一致した標本の応答を<span class="B">割付確率で割って平均</span>すれば、期待応答を不偏に推定できる。', en: '' },
    { ja: '座席予約の価格実験では、1 人あたり収益の推定値が最良の単一価格で $1.87、<span class="B">CTS</span> で $3.35 だった。', en: '' },
    { ja: '処置の数も応答の型も問わない評価法と、それにもとづく木のアンサンブル CTS を示した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: Separate Model Approach — two response curves, a small gap between them =====
    var g1 = S.g[0];
    var X0 = 80, X1 = 600;
    function f0(u) { return 0.5 + 0.28 * Math.sin(2 * Math.PI * 1.3 * u) + 0.12 * Math.sin(2 * Math.PI * 3.1 * u + 1); }
    function f1(u) { return f0(u) + 0.05 + 0.04 * Math.sin(2 * Math.PI * 0.8 * u + 2); }
    function px(u) { return X0 + u * (X1 - X0); }
    function py(v) { return 440 - 300 * v; }
    var d0 = [], d1 = [], band = [];
    for (var k = 0; k <= 80; k++) {
      var u = k / 80;
      d0.push(px(u).toFixed(1) + ',' + py(f0(u)).toFixed(1));
      d1.push(px(u).toFixed(1) + ',' + py(f1(u)).toFixed(1));
    }
    band = d1.concat(d0.slice().reverse());
    el('line', { x1: X0, x2: X1, y1: 460, y2: 460, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: X0, x2: X0, y1: 460, y2: 80, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, X1, 488, '特徴量 ' + m('x') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g1, X0 + 10, 92, '↑ 予測した応答', '', { 'font-size': 16, fill: C.ink });
    S.band1 = el('polygon', { points: band.join(' '), fill: C.a, opacity: 0 }, g1);
    S.c0 = el('polyline', { points: d0.join(' '), fill: 'none', stroke: C.a, 'stroke-width': 3.5, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, g1);
    S.c1 = el('polyline', { points: d1.join(' '), fill: 'none', stroke: C.a, 'stroke-width': 3.5, 'stroke-dasharray': '9 6', opacity: 0 }, g1);
    S.lab0 = el('g', {}, g1);
    el('line', { x1: 330, x2: 370, y1: 87, y2: 87, stroke: C.a, 'stroke-width': 3.5 }, S.lab0);
    t2(S.lab0, 378, 92, '対照のモデル', '', { 'font-size': 15, fill: C.a });
    S.lab1 = el('g', {}, g1);
    el('line', { x1: 330, x2: 370, y1: 113, y2: 113, stroke: C.a, 'stroke-width': 3.5, 'stroke-dasharray': '9 6' }, S.lab1);
    t2(S.lab1, 378, 118, '処置 1 のモデル', '', { 'font-size': 15, fill: C.a });
    S.gapLab = t2(g1, px(0.36), py(f1(0.36)) - 26, '差（アップリフト）は小さい', '', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, 'Separate Model', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 146, 'Approach（SMA）', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, '処置ごとに応答を予測し、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, '予測値が最大の処置を選ぶ。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, '学習の目的は応答の予測で、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 302, '処置による差ではない。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 356, '差が応答よりずっと小さいときや', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 380, 'ノイズが多いときは難しくなる。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（曲線は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: only one treatment observed per subject; the optimal treatment is unknown =====
    var g2 = S.g[1];
    var cols = [200, 310, 420], OPT = 550, obs = [[0, 3], [1, 5], [2, 2], [0, 4], [2, 6], [1, 1]];
    ['対照', '処置 1', '処置 2'].forEach(function (s, j) {
      t2(g2, cols[j], 96, s, '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    });
    t2(g2, OPT, 96, '最適な処置', '', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    t2(g2, 90, 96, '対象', '', { 'font-size': 16, fill: C.muted });
    el('line', { x1: 80, x2: 610, y1: 112, y2: 112, stroke: C.hair, 'stroke-width': 1.5 }, g2);
    el('line', { x1: 485, x2: 485, y1: 74, y2: 460, stroke: C.hair, 'stroke-width': 1.5 }, g2);
    S.obs2 = []; S.q2 = []; S.opt2 = [];
    obs.forEach(function (o, i) {
      var y = 146 + 52 * i;
      txt(g2, 96, y + 6, String(i + 1), { 'font-size': 17, fill: C.ink });
      var cell = el('g', { opacity: 0 }, g2);
      el('rect', { x: cols[o[0]] - 42, y: y - 19, width: 84, height: 38, rx: 6, fill: C.panel }, cell);
      txt(cell, cols[o[0]], y + 7, String(o[1]), { 'font-size': 19, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      S.obs2.push(cell);
      var qg = el('g', { opacity: 0 }, g2);
      [0, 1, 2].forEach(function (j) {
        if (j !== o[0]) txt(qg, cols[j], y + 7, '?', { 'font-size': 19, fill: '#9AA3AF', 'text-anchor': 'middle' });
      });
      S.q2.push(qg);
      S.opt2.push(txt(g2, OPT, y + 7, '?', { 'font-size': 21, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle', opacity: 0 }));
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '観測できるのは、各対象が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 146, '実際に受けた処置の応答だけ。', '', { 'font-size': 16, fill: C.ink });
    S.bigQ = txt(p2, PX, 236, '?', { 'font-size': 64, 'font-weight': 700, fill: C.a });
    t2(p2, PX + 50, 222, '最適な処置は', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX + 50, 246, '学習データでも不明', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 312, 'Qini 曲線などの指標も、', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 336, '期待応答そのものは測らない。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: the unbiased estimate z-bar, row by row =====
    var g3 = S.g[2];
    var R3 = [[0, 0, 2], [1, 1, 5], [0, 2, 1], [2, 2, 4], [0, 1, 3], [1, 0, 0], [0, 0, 2], [2, 1, 1]];
    var P = [0.5, 0.25, 0.25], CX = [190, 310, 420, 540];
    t2(g3, CX[0], 74, '処置 ' + m('t'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, CX[1], 74, '推奨 ' + m('h') + '(' + m('x') + ')', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, CX[2], 74, '応答 ' + m('y'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    txt(g3, CX[3], 74, m('z'), { 'font-size': 19, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 90, x2: 610, y1: 88, y2: 88, stroke: C.hair, 'stroke-width': 1.5 }, g3);
    var cum = 0;
    S.rows3 = R3.map(function (r, i) {
      var y = 116 + 40 * i, o = { t0: 16.9 + 0.5 * i, match: r[0] === r[1] };
      o.hl = el('rect', { x: 90, y: y - 24, width: 520, height: 34, rx: 6, fill: o.match ? C.bsoft : C.panel, opacity: 0 }, g3);
      txt(g3, 110, y, String(i + 1), { 'font-size': 16, fill: C.muted });
      [r[0], r[1], r[2]].forEach(function (v, j) {
        txt(g3, CX[j], y, String(v), { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      });
      var z = o.match ? r[2] / P[r[0]] : 0;
      cum += z; o.cum = cum;
      o.z = txt(g3, CX[3], y, String(z), { 'font-size': 18, 'font-weight': o.match ? 650 : 400, fill: o.match ? C.b : C.muted, 'text-anchor': 'middle', opacity: 0 });
      return o;
    });
    t2(g3, 90, 450, '割付確率 ' + m('p') + '₀ = 1/2、' + m('p') + '₁ = ' + m('p') + '₂ = 1/4', '', { 'font-size': 15, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, m('h') + '(' + m('x') + ') = ' + m('t') + ' なら ' + m('z') + ' = ' + m('y') + ' ÷ ' + m('p') + '<tspan class="mi" font-size="12" dy="4">t</tspan>', '', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    t2(p3, PX, 136, '一致しなければ ' + m('z') + ' = 0', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 190, m('z') + ' の合計', '', { 'font-size': 15, fill: C.muted });
    S.sum3 = txt(p3, PX, 228, '0', { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    S.zbar = el('g', { opacity: 0 }, p3);
    t2(S.zbar, PX, 282, '全 8 件で割る', '', { 'font-size': 15, fill: C.muted });
    txt(S.zbar, PX, 322, m('z̄') + ' = 44 ÷ 8 = 5.5', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(S.zbar, PX, 366, '期待応答の不偏推定量', '', { 'font-size': 16, fill: C.ink });
    t2(S.zbar, PX, 412, 'CTS は、この期待応答の', '', { 'font-size': 15, fill: C.muted });
    t2(S.zbar, PX, 436, '増分を分割基準にする。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: seat reservation data, revenue per passenger (Section 4.3 text) =====
    var g4 = S.g[3];
    var rows = [['最良の単一価格（H）', 1.87, C.gray, C.muted], ['SMA-RF', 2.37, C.a, C.a], ['CTS', 3.35, C.b, C.b]];
    var BX = 260, BW = 320;
    t2(g4, 70, 80, '座席予約：1 人あたり収益（ドル）', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 106, '4 つの価格水準・テストデータで推定', '', { 'font-size': 15, fill: C.muted });
    el('line', { x1: BX, x2: BX, y1: 140, y2: 410, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.rows4 = rows.map(function (r, i) {
      var y = 190 + 90 * i, o = { full: BW * r[1] / 3.35, t0: 25 + i * 1.1 };
      t2(g4, BX - 14, y + 6, r[0], '', { 'font-size': 18, 'font-weight': 600, fill: r[3], 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX, y: y - 20, width: 0, height: 40, rx: 4, fill: r[2] }, g4);
      o.lab = txt(g4, BX + 8, y + 8, '$' + r[1].toFixed(2), { 'font-size': 22, 'font-weight': 650, fill: C.ink });
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, '優先搭乗の価格実験', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 176, '€5 でも €7 でも', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 214, '€0.42', { 'font-size': 30, 'font-weight': 650, fill: C.muted });
    t2(p4, PX, 262, '価格を個別化すると', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 300, '€0.52', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 356, 'どれも推定量 ' + m('z̄') + ' で求めた', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 378, 'テストデータ上の値。', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 4.2・4.3 節本文（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'SDM 2017';
    ['Uplift Modeling with Multiple Treatments', 'and General Response Types'].forEach(function (s, i) {
      el('text', { x: 480, y: 200 + i * 44, 'font-size': 33, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 320, '多値処置と一般の応答型に対するアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 372, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yan Zhao · Xiao Fang · David Simchi-Levi';
    el('text', { x: 480, y: 420, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1137/1.9781611974973.66';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: control curve draws, treatment curve appears, gap is shaded
    S.c0.setAttribute('stroke-dashoffset', 1 - seg(t, 0.6, 2.6));
    S.lab0.setAttribute('opacity', seg(t, 2.2, 2.8));
    S.c1.setAttribute('opacity', seg(t, 2.8, 3.6));
    S.lab1.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.band1.setAttribute('opacity', 0.3 * seg(t, 4.4, 5.2));
    S.gapLab.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: observed cells, then question marks, then the optimal column
    S.obs2.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 8.8 + 0.25 * i, 9.3 + 0.25 * i)); });
    S.q2.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 10.8 + 0.2 * i, 11.3 + 0.2 * i)); });
    S.opt2.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 12.6 + 0.15 * i, 13.1 + 0.15 * i)); });
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.bigQ.setAttribute('opacity', seg(t, 12.6, 13.2));
    // scene 3: rows checked one by one, running sum, then z-bar
    var sum = 0;
    S.rows3.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.4);
      o.hl.setAttribute('opacity', s);
      o.z.setAttribute('opacity', s);
      if (t >= o.t0 + 0.2) sum = o.cum;
    });
    S.sum3.textContent = String(sum);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.zbar.setAttribute('opacity', seg(t, 21.3, 22));
    // scene 4: bars grow in order
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.9);
      o.bar.setAttribute('width', o.full * s);
      o.lab.setAttribute('x', 260 + o.full * s + 12);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
