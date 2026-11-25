// =====================================================================
// teaser-scenes.js — Hartford, Lewis, Leyton-Brown & Taddy, Deep IV: A Flexible Approach for Counterfactual
// Prediction (ICML 2017, PMLR 70), unofficial explainer. Player: teaser-engine.js.
// Scene 1 follows the causal graph of Figure 1; scenes 2–3 are schematics (labelled 模式図); scene 4 uses the
// Bing numbers in Sec. 4.3 (70% vs 12%).
// Colours: orange = ordinary regression of sales on price (biased); blue = Deep IV and the instrument.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '学会があると需要も価格も上がる。見えない要因が価格と売上の両方を動かす。', en: '' },
    { ja: '価格で売上を<span class="A">普通に回帰すると</span>、「高いほど売れる」と取り違える。', en: '' },
    { ja: '<span class="B">燃料費（操作変数）</span>から価格の分布を学び、その分布で積分した予測を売上に合わせる。', en: '' },
    { ja: '検索広告の順位の効果は、普通の回帰で <span class="A">70%</span>、Deep IV で <span class="B">12%</span> と推定された。', en: '' },
    { ja: '非線形で特徴量によって違う価格の効果を、観察データから予測できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var items = [];
  function at(t0, g) { items.push({ g: g, t0: t0 }); return g; }
  function T(p, x, y, s, a) { return t2(p, x, y, s, '', a); }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function node(p, x, y, label, col, dashed) {
    el('rect', { x: x - 70, y: y - 26, width: 140, height: 52, rx: 12, fill: '#fff', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': dashed ? '7 5' : '' }, p);
    T(p, x, y + 6, label, { 'font-size': 17, fill: col, 'text-anchor': 'middle', 'font-weight': 600 });
  }
  function arrow(p, x1, y1, x2, y2, col) {
    var a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 12 * Math.cos(a), hy = y2 - 12 * Math.sin(a);
    el('line', { x1: x1, y1: y1, x2: hx, y2: hy, stroke: col, 'stroke-width': 2.5 }, p);
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (hx - 6 * Math.sin(a)) + ',' + (hy + 6 * Math.cos(a)) + ' L' + (hx + 6 * Math.sin(a)) + ',' + (hy - 6 * Math.cos(a)) + 'z', fill: col }, p);
  }

  function build(svg) {
    var S = { g: [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); }) };

    // ===== scene 1: causal graph =====
    var g1 = S.g[0];
    node(g1, 160, 360, '燃料費 ' + m('z'), C.b);
    node(g1, 330, 250, '価格 ' + m('p'), C.ink);
    node(g1, 520, 360, '売上 ' + m('y'), C.ink);
    node(g1, 330, 130, '休日 ' + m('x'), C.ink);
    arrow(g1, 210, 335, 280, 278, C.b);
    arrow(g1, 380, 275, 470, 335, C.ink);
    arrow(g1, 370, 150, 500, 330, C.ink);
    arrow(g1, 330, 156, 330, 222, C.ink);
    var hid = at(2.6, el('g', {}, g1));
    node(hid, 520, 160, '学会 ' + m('e'), C.a, true);
    arrow(hid, 470, 180, 380, 238, C.a);
    arrow(hid, 520, 188, 520, 332, C.a);
    var p1 = at(4.0, el('g', {}, g1));
    T(p1, PX, 160, '見えない要因 ' + m('e'), { 'font-size': 17, 'font-weight': 650, fill: C.a });
    T(p1, PX, 192, 'が価格と売上の両方を動かす', { 'font-size': 15, fill: C.ink });
    T(p1, PX, 260, '操作変数 ' + m('z'), { 'font-size': 17, 'font-weight': 650, fill: C.b });
    T(p1, PX, 292, 'は価格を通してしか', { 'font-size': 15, fill: C.ink });
    T(p1, PX, 316, '売上に影響しない', { 'font-size': 15, fill: C.ink });
    T(g1, 940, 520, '論文 Figure 1 の因果の図を解説者が描き直した', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: naive regression =====
    var g2 = S.g[1], ox = 100, oy = 430, r2 = H.rng(5);
    el('line', { x1: ox, y1: oy, x2: ox + 440, y2: oy, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: ox, y1: oy, x2: ox, y2: 110, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    T(g2, ox + 440, oy + 28, '価格', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    T(g2, ox - 10, 104, '売上', { 'font-size': 15, fill: C.muted });
    for (var i = 0; i < 36; i++) {
      var conf = r2() < 0.4, u = r2();
      var px = conf ? 0.55 + 0.4 * u : 0.05 + 0.5 * u;
      var py = (conf ? 0.78 : 0.42) - 0.35 * (px - (conf ? 0.75 : 0.3)) + 0.08 * (r2() - 0.5);
      el('circle', { cx: ox + px * 420, cy: oy - py * 300, r: 5, fill: conf ? '#E8A27C' : C.gray }, g2);
    }
    var nv = at(10.0, el('g', {}, g2));
    el('line', { x1: ox + 20, y1: oy - 0.30 * 300, x2: ox + 420, y2: oy - 0.85 * 300, stroke: C.a, 'stroke-width': 3 }, nv);
    var tr = at(12.0, el('g', {}, g2));
    el('line', { x1: ox + 20, y1: oy - 0.55 * 300, x2: ox + 420, y2: oy - 0.25 * 300, stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, tr);
    var p2 = at(10.4, el('g', {}, g2));
    T(p2, PX, 160, '普通の回帰', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    T(p2, PX, 190, '「高いほど売れる」', { 'font-size': 16, fill: C.a });
    T(p2, PX, 240, '橙の点：学会のある日', { 'font-size': 15, fill: C.muted });
    var p2b = at(12.4, el('g', {}, g2));
    T(p2b, PX, 300, '真の価格の効果', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    T(p2b, PX, 330, '（' + m('e') + ' を固定して ' + m('p') + ' だけ動かす）', { 'font-size': 15, fill: C.b });
    T(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: two stages =====
    var g3 = S.g[2];
    var s1 = at(16.6, el('g', {}, g3));
    el('rect', { x: 70, y: 120, width: 380, height: 150, rx: 14, fill: C.bsoft }, s1);
    T(s1, 90, 152, '1 段目　価格のネットワーク', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    T(s1, 90, 186, m('F̂') + '<tspan dy="4" font-size="12">' + m('φ') + '</tspan><tspan dy="-4">(' + m('p') + ' | ' + m('x') + ', ' + m('z') + ')：混合正規分布</tspan>', { 'font-size': 16, fill: C.ink });
    var dd = '';
    for (var q = 0; q <= 60; q++) { var xx = q / 60; dd += (q ? 'L' : 'M') + (110 + xx * 300).toFixed(1) + ',' + (258 - 50 * (Math.exp(-80 * (xx - 0.35) * (xx - 0.35)) + 0.6 * Math.exp(-60 * (xx - 0.7) * (xx - 0.7)))).toFixed(1); }
    el('path', { d: dd, fill: 'none', stroke: C.b, 'stroke-width': 2.5 }, s1);
    var s2 = at(18.6, el('g', {}, g3));
    el('rect', { x: 70, y: 300, width: 380, height: 150, rx: 14, fill: C.panel }, s2);
    T(s2, 90, 332, '2 段目　売上のネットワーク ' + m('h') + '<tspan dy="4" font-size="12">' + m('θ') + '</tspan>', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    T(s2, 90, 374, '(' + m('y') + ' − ∫ ' + m('h') + '<tspan dy="4" font-size="12">' + m('θ') + '</tspan><tspan dy="-4">(' + m('p') + ', ' + m('x') + ') ' + m('dF̂') + ')² を最小化</tspan>', { 'font-size': 17, fill: C.ink });
    T(s2, 90, 412, '積分は 1 段目からのサンプルの平均', { 'font-size': 15, fill: C.muted });
    arrow(s2, 260, 272, 260, 298, C.b);
    var p3 = at(20.4, el('g', {}, g3));
    T(p3, PX, 160, '勾配', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p3, PX, 196, '独立な 2 組のサンプル', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 220, '→ 不偏', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 270, '1 サンプルの上界', { 'font-size': 16, fill: C.b });
    T(p3, PX, 294, '→ 保証なし、実験では良い', { 'font-size': 16, fill: C.b });
    T(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Bing position effect =====
    var g4 = S.g[3];
    el('line', { x1: 120, y1: 420, x2: 520, y2: 420, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.b4a = el('rect', { x: 170, y: 420, width: 110, height: 0, fill: C.a }, g4);
    S.b4b = el('rect', { x: 360, y: 420, width: 110, height: 0, fill: C.b }, g4);
    S.l4a = T(g4, 225, 0, '70%', { 'font-size': 26, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    S.l4b = T(g4, 415, 0, '12%', { 'font-size': 26, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    T(g4, 225, 448, '普通の回帰', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    T(g4, 415, 448, 'Deep IV', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    var p4 = at(25.0, el('g', {}, g4));
    T(p4, PX, 160, 'Bing の検索広告', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 196, '1 位 → 2 位でのクリック率の低下', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 250, '操作変数：ランキングの', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 274, '実験への無作為な割当て', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 324, '2,000 万件超', { 'font-size': 15, fill: C.muted });
    T(g4, 940, 520, '論文 4.3 節の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    S.h4a = 0.70 * 330; S.h4b = 0.12 * 330;

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    T(g5, 300, 68, '人工データ（画像、2 万件）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g5, 300, 98, 'MSE 0.32（実験データなら 0.20）', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    T(g5, 660, 68, '2SLS・普通の NN と比べて', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g5, 660, 98, 'どのデータ量でも最良', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 176, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2017';
    el('text', { x: 480, y: 230, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Deep IV: A Flexible Approach';
    el('text', { x: 480, y: 272, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Counterfactual Prediction';
    T(g5, 480, 314, '操作変数と深層学習で、価格を変えたときの売上を予測する', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 362, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jason Hartford · Greg Lewis · Kevin Leyton-Brown · Matt Taddy';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v70/hartford17a.html';
    T(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    items.forEach(function (it) { it.g.setAttribute('opacity', seg(t, it.t0, it.t0 + 0.6)); });
    var k = seg(t, 24.8, 26.4), ha = S.h4a * k, hb = S.h4b * k;
    S.b4a.setAttribute('y', 420 - ha); S.b4a.setAttribute('height', ha);
    S.b4b.setAttribute('y', 420 - hb); S.b4b.setAttribute('height', hb);
    S.l4a.querySelectorAll('text').forEach(function (e) { e.setAttribute('y', 410 - ha); });
    S.l4b.querySelectorAll('text').forEach(function (e) { e.setAttribute('y', 410 - hb); });
    S.l4a.setAttribute('opacity', k); S.l4b.setAttribute('opacity', k);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 29 });
})();
