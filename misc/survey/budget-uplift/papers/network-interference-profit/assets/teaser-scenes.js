// =====================================================================
// teaser-scenes.js — van den Akker (CONSEQUENCES @ RecSys 2025), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 2 plots the largest cluster weight of IPW (2^M) and AddIPW (M+1) when e = 0.5, computed by the
// explainer from the estimator's formula (the paper only says "exponential" vs "linear").
// Scene 4 shows the paper's own Fig. 1 (arXiv v1, CC BY 4.0); no values are read off it.
// Colours: orange = interference-naive learning (individual outcomes, naive profit);
//          blue = interference-aware learning with the cluster average Y-bar.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">商品ごとの結果</span>だけを見ると、同じユーザーの別の商品から移った購入まで、クーポンの効果に数えてしまう。', en: '' },
    { ja: 'クラスタ全体を重みづけする IPW は重みが商品数に対して指数的に増えるが、<span class="B">AddIPW</span> の重みは線形にしか増えない。', en: '' },
    { ja: '提案法は各商品の目的値を<span class="B">クラスタ平均</span>にした応答変換で学習し、利益の手法も目的値を替えて組み込む。', en: '' },
    { ja: 'シミュレーションでは、クラスタが大きいほど <span class="B">AddIPW 系</span>と<span class="A">干渉を考慮しない手法</span>の差が広がった。', en: '' },
    { ja: '干渉があるときは、各商品の処置をクラスタ全体の結果で評価し、その目的を勾配法で直接最大化する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    var defs = el('defs', {}, svg);
    var clip = el('clipPath', { id: 'nip-reveal' }, defs);
    S.clipRect = el('rect', { x: 0, y: 0, width: 0, height: 540 }, clip);
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one user's cluster; coupon on A moves the purchase from B to A =====
    var g1 = S.g[0];
    el('rect', { x: 70, y: 110, width: 520, height: 280, rx: 16, fill: C.panel }, g1);
    t2(g1, 90, 150, 'ユーザー ' + m('i') + ' に見せた商品（1 つのクラスタ）', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.items1 = ['A', 'B', 'C', 'D', 'E'].map(function (n, k) {
      var x = 100 + k * 96, o = {};
      o.box = el('rect', { x: x, y: 190, width: 76, height: 96, rx: 10, fill: '#fff', stroke: C.gray, 'stroke-width': 2 }, g1);
      o.lab = txt(g1, x + 38, 248, n, { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      o.x = x;
      return o;
    });
    S.tag1 = el('g', {}, g1);
    el('rect', { x: 108, y: 168, width: 60, height: 30, rx: 15, fill: C.a }, S.tag1);
    t2(S.tag1, 138, 189, '割引', '', { 'font-size': 16, 'font-weight': 600, fill: '#fff', 'text-anchor': 'middle' });
    S.buy1 = el('g', {}, g1);
    el('circle', { cx: 0, cy: 0, r: 20, fill: C.ink }, S.buy1);
    t2(S.buy1, 0, 6, '購入', '', { 'font-size': 14, 'font-weight': 600, fill: '#fff', 'text-anchor': 'middle' });
    S.p1a = el('g', {}, g1);
    t2(S.p1a, PX, 150, '商品 A だけを見ると', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(S.p1a, PX, 190, '購入 0 → 1', '', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(S.p1a, PX, 224, '効果 +1 と数える', '', { 'font-size': 17, fill: C.ink });
    S.p1b = el('g', {}, g1);
    t2(S.p1b, PX, 290, 'クラスタ全体では', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(S.p1b, PX, 326, '購入は 1 件のまま', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1b, PX, 354, '（B から A に移っただけ）', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（商品と購入は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: largest cluster weight when e = 0.5: IPW 2^M vs AddIPW M+1 =====
    var g2 = S.g[1];
    var AX0 = 110, AX1 = 590, AY0 = 440, AY1 = 90, MMAX = 10, WMAX = 1024;
    function sx(M) { return AX0 + (M - 1) / (MMAX - 1) * (AX1 - AX0); }
    function sy(w) { return AY0 - w / WMAX * (AY0 - AY1); }
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    [0, 512, 1024].forEach(function (v) {
      txt(g2, AX0 - 10, sy(v) + 5, v.toLocaleString('en-US'), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    [1, 5, 10].forEach(function (M) {
      txt(g2, sx(M), AY0 + 24, String(M), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    t2(g2, AX1, AY0 + 50, '1 クラスタの商品数 ' + m('M'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, AX0 + 10, AY1 - 22, '重みの最大値', '', { 'font-size': 16, fill: C.ink });
    S.pts2 = [];
    for (var M = 1; M <= MMAX; M++) {
      S.pts2.push({
        ipw: el('circle', { cx: sx(M), cy: sy(Math.pow(2, M)), r: 7, fill: C.muted }, g2),
        add: el('circle', { cx: sx(M), cy: sy(M + 1), r: 7, fill: C.b }, g2),
        k: M
      });
    }
    S.lab2a = txt(g2, sx(10) - 14, sy(1024) + 6, '2' + '<tspan font-size="0.7em" baseline-shift="super">10</tspan> = 1,024', { 'font-size': 16, fill: C.muted, 'text-anchor': 'end' });
    S.lab2b = txt(g2, sx(10), sy(11) - 16, '11', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    el('circle', { cx: PX + 8, cy: 124, r: 7, fill: C.muted }, p2);
    t2(p2, PX + 24, 130, 'IPW（クラスタ全体）', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX + 24, 162, '2' + '<tspan font-size="0.7em" baseline-shift="super">' + m('M') + '</tspan>', { 'font-size': 22, 'font-weight': 650, fill: C.muted });
    el('circle', { cx: PX + 8, cy: 214, r: 7, fill: C.b }, p2);
    t2(p2, PX + 24, 220, 'AddIPW', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX + 24, 252, m('M') + ' + 1', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 310, '傾向スコアがすべて 0.5 で、', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 334, '全商品が方策と一致した', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 358, 'クラスタの重み', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '推定量の式から解説者が計算', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: response transformation with the cluster average =====
    var g3 = S.g[2];
    t2(g3, 80, 92, 'クラスタ ' + m('i') + '：4 商品中 1 件購入 → ' + m('Ȳ') + m('<tspan font-size="0.7em" baseline-shift="sub">i</tspan>') + ' = 1/4', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    t2(g3, 80, 122, '傾向スコア ' + m('e') + ' = 0.5', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 110, 172, '商品', '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    t2(g3, 220, 172, '処置 ' + m('A'), '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    t2(g3, 360, 172, '目的値 ' + m('Z'), '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    S.rows3 = [['A', 1], ['B', 0], ['C', 1], ['D', 0]].map(function (r, k) {
      var y = 214 + k * 52, o = {};
      el('line', { x1: 90, x2: 590, y1: y + 18, y2: y + 18, stroke: C.hair }, g3);
      txt(g3, 120, y, r[0], { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      txt(g3, 236, y, String(r[1]), { 'font-size': 20, fill: C.ink });
      o.z = t2(g3, 360, y, (r[1] ? '+' : '−') + m('Ȳ') + ' / 0.5 = ' + (r[1] ? '+' : '−') + '0.5', '', { 'font-size': 20, 'font-weight': 600, fill: C.b });
      return o;
    });
    S.obj3 = t2(g3, 90, 450, m('Σ') + ' ' + m('Z') + '·' + m('f') + m('<tspan font-size="0.7em" baseline-shift="sub">θ</tspan>') + '(' + m('X') + ') を勾配法で最大化', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, m('Ȳ') + ' を替えると', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    S.opt3 = [
      ['CRVTW 版', '平均売上', C.b], ['IPC 版', '購入ありクラスタの利益', C.b], ['Naive Profit 版', '観測利益（失敗しやすい）', C.a]
    ].map(function (r, k) {
      var g = el('g', {}, p3), y = 160 + k * 78;
      t2(g, PX, y, r[0], '', { 'font-size': 17, 'font-weight': 650, fill: r[2] });
      t2(g, PX, y + 28, r[1], '', { 'font-size': 16, fill: C.ink });
      return g;
    });
    t2(g3, 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: the paper's Fig. 1 =====
    var g4 = S.g[3];
    var img = el('image', { x: 30, y: 52, width: 620, height: 404, 'clip-path': 'url(#nip-reveal)', preserveAspectRatio: 'xMidYMid meet' }, g4);
    img.setAttribute('href', 'assets/fig1_auqc_items.png');
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 100, '横軸：1 クラスタの商品数', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 128, '縦軸：Qini 曲線下の面積', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 185, '上の 3 本：AddIPW 系', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 209, '（コンバージョン、CRVTW、IPC）', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 255, 'その下：干渉を考慮しない', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(p4, PX, 279, '手法とランダム', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(p4, PX, 330, '最下の赤線は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 354, 'AddIPW Naive Profit', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 398, '温度 5.0、割引 8%', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Fig. 1（arXiv v1、CC BY 4.0）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CONSEQUENCES WORKSHOP @ RECSYS · 2025';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Direct Profit Estimation Using Uplift Modeling';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'under Clustered Network Interference';
    t2(g5, 480, 290, 'クラスタ内に干渉があるときに、アップリフトモデリングで利益を直接推定する', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Bram van den Akker · Booking.com';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2509.01558';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: coupon tag on A, purchase moves from B to A, then the two readings
    S.tag1.setAttribute('opacity', seg(t, 1.6, 2.2));
    var k = seg(t, 2.8, 4.2);
    var xB = S.items1[1].x + 38, xA = S.items1[0].x + 38;
    S.buy1.setAttribute('transform', 'translate(' + (xB + (xA - xB) * k) + ',326)');
    S.items1.forEach(function (o, i) {
      var on = i === 1 ? 1 - k : i === 0 ? k : 0;
      o.box.setAttribute('stroke', on > 0.5 ? C.ink : C.gray);
      o.box.setAttribute('stroke-width', on > 0.5 ? 3 : 2);
    });
    S.p1a.setAttribute('opacity', seg(t, 4.4, 5.0));
    S.p1b.setAttribute('opacity', seg(t, 5.6, 6.2));
    // scene 2: points appear by M
    S.pts2.forEach(function (q) {
      var s = seg(t, 9 + q.k * 0.35, 9.3 + q.k * 0.35);
      q.ipw.setAttribute('opacity', s); q.add.setAttribute('opacity', s);
    });
    S.lab2a.setAttribute('opacity', seg(t, 12.6, 13.1));
    S.lab2b.setAttribute('opacity', seg(t, 12.6, 13.1));
    S.p2.setAttribute('opacity', seg(t, 9.2, 9.9));
    // scene 3: Z rows, objective, then the target swaps
    S.rows3.forEach(function (o, i) { o.z.setAttribute('opacity', seg(t, 17.2 + i * 0.4, 17.6 + i * 0.4)); });
    S.obj3.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.p3.setAttribute('opacity', seg(t, 20, 20.5));
    S.opt3.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 20.3 + i * 0.6, 20.8 + i * 0.6)); });
    // scene 4: the figure is revealed left to right
    S.clipRect.setAttribute('width', 30 + 620 * seg(t, 24.6, 27.6));
    S.p4.setAttribute('opacity', seg(t, 27.2, 28));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
