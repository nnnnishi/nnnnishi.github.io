// =====================================================================
// teaser-scenes.js — Javanmard & Nazerzadeh, Dynamic Pricing in High-dimensions (JMLR 20(9), 2019),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1–3 are schematics (labelled 模式図). Scene 4 shows the orders in Theorems 3 and 5 and the
// non-sparse MLE bound quoted from Chen et al. (2015) in footnote 1; the curves are schematic.
// Colours: orange = methods that ignore sparsity (regret grows with d); blue = RMLP (L1-regularised MLE).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '評価額が価格以上なら買う。売り手は買ったかどうかだけを見て、評価額の式を学ぶ。', en: '' },
    { ja: '特徴量は多いが、評価額に効く係数は<span class="B">少数（疎）</span>だとする。', en: '' },
    { ja: 'エピソードの長さを 2 倍ずつ伸ばし、初めに <span class="B">L1 正則化つきの最尤推定</span>をやり直す。', en: '' },
    { ja: 'regret は <span class="B">s<sub>0</sub> log d · log T</span> で、特徴量の次元 d には対数でしか依存しない。', en: '' },
    { ja: 'どんな方策も s<sub>0</sub>(log d + log T) の程度より良くはできない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var items = [];
  function at(t0, g) { items.push({ g: g, t0: t0 }); return g; }
  function T(p, x, y, s, a) { return t2(p, x, y, s, '', a); }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(b, s) { return m(b) + '<tspan dy="4" font-size="12">' + s + '</tspan><tspan dy="-4"></tspan>'; }

  function build(svg) {
    var S = { g: [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); }) };

    // ===== scene 1: valuation vs price =====
    var g1 = S.g[0], ox = 120, oy = 420;
    el('line', { x1: ox, y1: oy, x2: ox, y2: 110, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, ox - 14, 104, '金額', { 'font-size': 15, fill: C.muted });
    var r1 = H.rng(11);
    S.cust = [];
    for (var i = 0; i < 8; i++) {
      var v = 160 + r1() * 200, x = ox + 40 + i * 52;
      var g = el('g', {}, g1);
      el('rect', { x: x - 14, y: oy - v, width: 28, height: v, rx: 4, fill: C.gray }, g);
      S.cust.push({ g: g, v: v, x: x, mark: T(g, x, oy - v - 10, v >= 250 ? '買う' : '×', { 'font-size': 14, fill: v >= 250 ? C.b : C.a, 'text-anchor': 'middle' }), t0: 1.4 + i * 0.35 });
    }
    el('line', { x1: ox, y1: oy - 250, x2: ox + 430, y2: oy - 250, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' }, g1);
    T(g1, ox + 430, oy - 262, '価格 ' + sub('p', 't'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = at(1.0, el('g', {}, g1));
    T(p1, PX, 160, '評価額', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 200, sub('v', 't') + ' = ' + sub('θ', '0') + ' · ' + sub('x', 't') + ' + ' + sub('z', 't'), { 'font-size': 20, fill: C.ink });
    T(p1, PX, 250, '観測するのは', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 276, '買った ／ 買わない だけ', { 'font-size': 16, fill: C.ink });
    T(g1, 940, 520, '模式図（棒は顧客ごとの評価額）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: sparse theta =====
    var g2 = S.g[1], nz = { 3: 0.8, 11: -0.6, 19: 0.5, 27: 0.9 };
    el('line', { x1: 80, y1: 300, x2: 560, y2: 300, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = [];
    for (var j = 0; j < 32; j++) {
      var h = nz[j] ? nz[j] * 150 : 0;
      S.bars2.push({ r: el('rect', { x: 86 + j * 15, y: 300, width: 10, height: 0, fill: nz[j] ? C.b : C.gray }, g2), h: h, nz: !!nz[j] });
    }
    T(g2, 320, 480, sub('θ', '0') + ' の成分（' + m('d') + ' 個）', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = at(9.0, el('g', {}, g2));
    T(p2, PX, 160, '疎な係数', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    T(p2, PX, 200, sub('s', '0') + ' = ‖' + sub('θ', '0') + '‖<tspan dy="4" font-size="12">0</tspan><tspan dy="-4"> ≪ ' + m('d') + '</tspan>', { 'font-size': 20, fill: C.ink });
    T(p2, PX, 250, m('d') + ' ＞ ' + m('T') + ' でも学べる', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 300, 'Airbnb の宿、広告の', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 324, '最低落札価格などを想定', { 'font-size': 15, fill: C.muted });
    T(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: episodes =====
    var g3 = S.g[2], lens = [1, 2, 4, 8, 16], x0 = 70, unit = 15;
    S.ep = [];
    var xx = x0;
    lens.forEach(function (L, k) {
      var gg = el('g', {}, g3);
      el('rect', { x: xx, y: 200, width: L * unit * 1.9 - 4, height: 50, rx: 6, fill: k % 2 ? C.bsoft : C.panel, stroke: C.hair }, gg);
      T(gg, xx + (L * unit * 1.9 - 4) / 2, 232, sub('τ', String(k + 1)) + ' = ' + L, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      el('path', { d: 'M' + (xx + 3) + ',190 l0,-34', stroke: C.b, 'stroke-width': 2.5 }, gg);
      el('circle', { cx: xx + 3, cy: 150, r: 6, fill: C.b }, gg);
      S.ep.push({ g: gg, t0: 16.8 + k * 0.9 });
      xx += L * unit * 1.9;
    });
    T(g3, x0, 290, '時間 →', { 'font-size': 14, fill: C.muted });
    T(g3, x0 - 4, 130, '推定のやり直し', { 'font-size': 14, fill: C.b });
    var p3 = at(17.0, el('g', {}, g3));
    T(p3, x0, 360, m('θ̂') + '<tspan dy="4" font-size="12">' + m('k') + '</tspan><tspan dy="-4"> = argmin  負の対数尤度 ＋ ' + m('λ') + '</tspan><tspan dy="4" font-size="12">' + m('k') + '</tspan><tspan dy="-4">‖' + m('θ') + '‖</tspan><tspan dy="4" font-size="12">1</tspan>', { 'font-size': 18, fill: C.b });
    T(p3, x0, 400, '直前のエピソードのデータだけを使う（凸計画）', { 'font-size': 15, fill: C.muted });
    T(p3, x0, 430, '価格 ' + sub('p', 't') + ' = ' + m('g') + '(' + m('θ̂') + '<tspan dy="4" font-size="12">' + m('k') + '</tspan><tspan dy="-4"> · ' + m('x') + '</tspan><tspan dy="4" font-size="12">' + m('t') + '</tspan><tspan dy="-4">)</tspan>', { 'font-size': 16, fill: C.ink });
    T(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: regret curves =====
    var g4 = S.g[3], o4x = 100, o4y = 420;
    el('line', { x1: o4x, y1: o4y, x2: o4x + 440, y2: o4y, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: o4x, y1: o4y, x2: o4x, y2: 110, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    T(g4, o4x + 440, o4y + 28, '販売の回数 ' + m('T'), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    T(g4, o4x - 10, 104, 'regret', { 'font-size': 15, fill: C.muted });
    var da = '', db = '';
    for (var q = 1; q <= 80; q++) {
      var tt = q / 80;
      da += (q > 1 ? 'L' : 'M') + (o4x + tt * 430).toFixed(1) + ',' + (o4y - 290 * Math.sqrt(tt)).toFixed(1);
      db += (q > 1 ? 'L' : 'M') + (o4x + tt * 430).toFixed(1) + ',' + (o4y - 40 - 50 * Math.log(1 + 9 * tt) / Math.log(10)).toFixed(1);
    }
    S.ca = el('path', { d: da, fill: 'none', stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': 900, 'stroke-dashoffset': 900 }, g4);
    S.cb = el('path', { d: db, fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': 900, 'stroke-dashoffset': 900 }, g4);
    var p4 = at(25.0, el('g', {}, g4));
    T(p4, PX, 160, 'RMLP（定理 3）', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    T(p4, PX, 196, m('O') + '(' + sub('s', '0') + ' log ' + m('d') + ' · log ' + m('T') + ')', { 'font-size': 22, fill: C.b });
    T(p4, PX, 260, '疎性を使わない最尤推定', { 'font-size': 16, fill: C.a });
    T(p4, PX, 290, m('O') + '((' + m('d') + '/' + m('C') + '<tspan dy="4" font-size="12">min</tspan><tspan dy="-4">) √(' + m('T') + ' log ' + m('Td') + '))</tspan>', { 'font-size': 18, fill: C.a });
    T(p4, PX, 318, '（Chen et al., 2015。論文の脚注 1）', { 'font-size': 14, fill: C.muted });
    T(g4, 940, 520, 'オーダーは論文の記述、曲線は模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: lower bound + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    T(g5, 300, 68, '上界（RMLP）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g5, 300, 98, sub('s', '0') + ' log ' + m('d') + ' · log ' + m('T'), { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.panel }, g5);
    T(g5, 660, 68, '下界（どの方策でも）', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    T(g5, 660, 98, sub('s', '0') + '(log ' + m('d') + ' + log ' + m('T') + ')', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 176, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'JMLR 2019';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dynamic Pricing in High-dimensions';
    T(g5, 480, 290, '効く特徴量が少なければ、高次元でも早く学べる', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Adel Javanmard · Hamid Nazerzadeh';
    el('text', { x: 480, y: 396, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'jmlr.org/papers/v20/17-357.html';
    T(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    items.forEach(function (it) { it.g.setAttribute('opacity', seg(t, it.t0, it.t0 + 0.6)); });
    S.cust.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.4)); });
    var k2 = seg(t, 9.5, 11.0);
    S.bars2.forEach(function (b, j) {
      var h = b.nz ? b.h * k2 : 0, hh = Math.abs(h) || (2 * seg(t, 8.6, 9.2));
      b.r.setAttribute('height', hh); b.r.setAttribute('y', h > 0 ? 300 - h : 300 - (b.nz ? 0 : hh) + (h < 0 ? 0 : 0));
    });
    S.ep.forEach(function (e) { e.g.setAttribute('opacity', seg(t, e.t0, e.t0 + 0.5)); });
    S.ca.setAttribute('stroke-dashoffset', 900 * (1 - seg(t, 24.6, 27.0)));
    S.cb.setAttribute('stroke-dashoffset', 900 * (1 - seg(t, 24.6, 27.0)));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 29 });
})();
