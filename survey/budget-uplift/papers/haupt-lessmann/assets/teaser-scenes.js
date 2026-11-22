// =====================================================================
// teaser-scenes.js — Haupt & Lessmann (EJOR 2022), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); delta = 10 EUR is the
// coupon value in the paper's experiment. Scene 4 uses the numbers printed in Table 4 (arXiv v2).
// Colours: orange = response-dependent cost / policies that ignore it; blue = incremental profit / analytical rule.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '従来のやり方では処置効果の大きい順に並べ、上位の何割に配るかを経験的に決める。', en: '' },
    { ja: 'クーポン代は購入したときにだけかかるので、<span class="A">購入しやすい人ほど期待コストが大きい</span>。', en: '' },
    { ja: '論文の判定ルールは、<span class="B">利益の増分</span>が期待クーポン代 p(1)·δ を上回る人にだけ配る。', en: '' },
    { ja: 'EC のクーポンデータでは、<span class="B">解析的方策</span>の利益が<span class="A">経験的方策</span>より平均で約 2% 高かった。', en: '' },
    { ja: '購入時にだけかかる費用は、購入確率で割り引いてから配布の判断に入れる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: customers sorted by treatment effect, top share targeted =====
    var g1 = S.g[0];
    var taus = [6.2, 5.6, 5.1, 4.4, 3.9, 3.3, 2.7, 2.1, 1.4, 0.8];
    S.bars1 = [];
    t2(g1, 90, 52, '顧客（処置効果 ' + m('τ') + ' の大きい順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    taus.forEach(function (v, i) {
      var y = 78 + i * 40;
      el('circle', { cx: 104, cy: y + 12, r: 10, fill: C.gray }, g1);
      var r = el('rect', { x: 130, y: y, width: v * 70, height: 24, rx: 4, fill: C.gray }, g1);
      S.bars1.push(r);
    });
    S.cut1 = el('line', { x1: 80, x2: 600, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 598, 0, '上位 40% で区切る', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 110, width: 18, height: 18, rx: 3, fill: C.a }, p1);
    t2(p1, PX + 28, 125, '配る', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 145, width: 18, height: 18, rx: 3, fill: C.gray }, p1);
    t2(p1, PX + 28, 160, '配らない', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 215, '並べる基準：処置効果 ' + m('τ'), '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '配る人数：利益が最大になる', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 276, '割合を学習データで探す', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 320, '一人ひとりのクーポン代の', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 344, '期待値は順位に入らない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two customers, same tau, different p(1) =====
    var g2 = S.g[1];
    var U = 34;   // px per euro
    S.cards = [['A', 0.1, 90], ['B', 0.5, 350]].map(function (c) {
      var x = c[2], o = {};
      el('rect', { x: x, y: 70, width: 240, height: 390, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      txt(g2, x + 20, 112, '顧客 ' + c[0], { 'font-size': 22, 'font-weight': 650, fill: C.ink });
      t2(g2, x + 20, 158, '利益の増分 ' + m('τ') + ' = 3 ユーロ', '', { 'font-size': 16, fill: C.ink });
      el('rect', { x: x + 20, y: 170, width: 3 * U, height: 18, rx: 3, fill: C.b }, g2);
      t2(g2, x + 20, 230, '購入確率 ' + m('p') + '(1) = ' + c[1], '', { 'font-size': 16, fill: C.ink });
      t2(g2, x + 20, 278, '期待クーポン代', '', { 'font-size': 16, fill: C.ink });
      t2(g2, x + 20, 302, c[1] + ' × 10 = ' + (c[1] * 10) + ' ユーロ', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
      o.cost = el('rect', { x: x + 20, y: 314, width: 0, height: 18, rx: 3, fill: C.a }, g2);
      o.full = c[1] * 10 * U;
      var net = 3 - c[1] * 10;
      o.res = t2(g2, x + 20, 392, '期待利益 ' + (net > 0 ? '+' : '−') + Math.abs(net) + ' ユーロ', '', { 'font-size': 18, 'font-weight': 650, fill: net > 0 ? C.b : C.a });
      o.res2 = t2(g2, x + 20, 424, net > 0 ? '→ 配る' : '→ 配らない', '', { 'font-size': 18, 'font-weight': 650, fill: net > 0 ? C.b : C.a });
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 130, 'クーポン代 ' + m('δ') + ' = 10 ユーロ', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 158, '（論文の実験と同じ額）', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 210, '購入したときだけ払う。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 246, '処置効果が同じなら、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 272, '購入しにくい人に配る', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 298, 'ほうが利益が大きい。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（' + m('τ') + ' と ' + m('p') + '(1) は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: scatter p(1) vs tau, boundary tau = 10 p(1) =====
    var g3 = S.g[2];
    var AX0 = 100, AX1 = 590, AY0 = 470, AY1 = 70, TMIN = -1, TMAX = 8;
    function sx(p) { return AX0 + p / 0.8 * (AX1 - AX0); }
    function sy(v) { return AY0 - (v - TMIN) / (TMAX - TMIN) * (AY0 - AY1); }
    S.region = el('polygon', { points: [sx(0), sy(0), sx(0.8), sy(8), sx(0), sy(8)].join(' '), fill: C.bsoft }, g3);
    el('line', { x1: AX0, x2: AX1, y1: sy(0), y2: sy(0), stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX1, sy(0) + 26, '処置下の購入確率 ' + m('p') + '(1) →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, AX0 + 10, AY1 - 18, '↑ 利益の増分 ' + m('τ') + '（ユーロ）', '', { 'font-size': 16, fill: C.ink });
    S.bound = el('line', { x1: sx(0), y1: sy(0), x2: sx(0), y2: sy(0), stroke: C.ink, 'stroke-width': 3 }, g3);
    var r = rng(11); S.pts3 = [];
    for (var i = 0; i < 46; i++) {
      var p = 0.02 + r() * 0.62, v = -0.6 + r() * 7.6;
      S.pts3.push({ p: p, v: v, c: el('circle', { cx: sx(p), cy: sy(v), r: 8, fill: C.gray }, g3), up: v > 10 * p, k: r() });
    }
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 140, m('τ') + ' &gt; ' + m('p') + '(1)·' + m('δ'), { 'font-size': 36, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 182, m('κ') + ' = 0（接触コストなし）の場合', '', { 'font-size': 15, fill: C.muted });
    el('circle', { cx: PX + 9, cy: 230, r: 8, fill: C.b }, p3);
    t2(p3, PX + 26, 236, '境界より上：配る', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 266, r: 8, fill: C.gray }, p3);
    t2(p3, PX + 26, 272, '境界より下：配らない', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 322, '必要な推定量は、処置効果と', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 348, '処置下の購入確率 ' + m('p') + '(1) の 2 つ', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（点は架空の顧客）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 4 (arXiv v2), campaign profit in EUR =====
    var g4 = S.g[3];
    var rows = [
      ['Hurdle / Single', 60152, 57177], ['Hurdle / Two', 58967, 58121],
      ['One-Stage / Single', 57851, 58051], ['One-Stage / Two', 58542, 57535],
      ['One-Stage / DR', 59117, 57414], ['One-Stage / XBCF', 59069, 57432]
    ];
    var X0 = 250, X1 = 600, LO = 57000, HI = 60500, Y0 = 110, DY = 52;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 58, 'キャンペーン利益（ユーロ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [57000, 58000, 59000, 60000].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 28, y2: Y0 + DY * 5 + 26, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: Y0 + DY * 5 + 52, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toLocaleString('en-US');
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 16, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.ln = el('line', { x1: cx(rw[1]), x2: cx(rw[2]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 4 }, g4);
      o.e = el('circle', { cx: cx(rw[2]), cy: y, r: 10, fill: C.a }, g4);
      o.a = el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: C.b }, g4);
      o.t0 = 25 + i * 0.7;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 9, fill: C.b }, p4);
    t2(p4, PX + 26, 111, '解析的方策', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 9, fill: C.a }, p4);
    t2(p4, PX + 26, 146, '経験的方策（閾値を探索）', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 200, '平均利益', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 236, '58,950', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 118, 236, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 148, 236, '57,621', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 286, '6 組中 5 組で解析的方策が上回る', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 312, '何も配らない場合：50,668', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 350, '購入データは実データ、', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 372, '処置効果はシミュレーション', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH · 2022';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Targeting customers under';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'response-dependent costs';
    t2(g5, 480, 302, '反応に応じて費用が決まる施策での顧客ターゲティング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Johannes Haupt · Stefan Lessmann';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/Humboldt-WI/response-dependent-costs';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: cut line slides down to after the 4th customer, top bars turn orange
    var yc = 70 + seg(t, 1.2, 3.5) * (78 + 4 * 40 - 8 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.4));
    S.cutLab1.setAttribute('transform', 'translate(0,' + (yc + 22) + ')');
    S.cutLab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 4 ? H.mix(C.gray, C.a, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: expected coupon cost bars grow, then verdicts
    S.cards.forEach(function (o, i) {
      o.cost.setAttribute('width', o.full * seg(t, 10 + i * 0.8, 12 + i * 0.8));
      o.res.setAttribute('opacity', seg(t, 12.8, 13.4));
      o.res2.setAttribute('opacity', seg(t, 13.3, 13.9));
    });
    // scene 3: boundary line draws, points above turn blue
    var k = seg(t, 17, 19.2);
    var bx = 100 + 490 * k, by = 470 - (0 + 1) / 9 * 400 - k * (8 / 9 * 400);
    S.bound.setAttribute('x2', bx); S.bound.setAttribute('y2', by);
    S.region.setAttribute('opacity', seg(t, 19.2, 20));
    S.pts3.forEach(function (q) {
      var s = seg(t, 19.6 + q.k * 1.4, 20.1 + q.k * 1.4);
      q.c.setAttribute('fill', q.up ? H.mix(C.gray, C.b, s) : C.gray);
      q.c.setAttribute('opacity', q.up ? 1 : 1 - 0.45 * s);
    });
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: rows appear in order, then the averages
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.e.setAttribute('opacity', s); o.a.setAttribute('opacity', s); o.ln.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 29.4, 30.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
