// =====================================================================
// teaser-scenes.js — Yabe, Ito & Fujimaki, Robust Quadratic Programming for Price Optimization (IJCAI 2017),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1–3 are schematics (labelled 模式図). Scene 4 uses the findings stated in Sec. 6.1 (λ = 2–4, 70–80%);
// the curve shape is schematic because the paper gives no numeric table for Figure 1.
// Colours: orange = plugging in the least-squares estimate (non-robust, λ = 0); blue = the robust solution.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">推定した係数</span>で最適化すると、誤差が収益を高く見せる価格が選ばれやすい。', en: '' },
    { ja: '推定値の分布から、真の係数が入りそうな<span class="B">信頼領域</span>を作る。', en: '' },
    { ja: '領域の中で<span class="B">最悪の係数</span>のもとで、収益が最大になる価格を選ぶ。', en: '' },
    { ja: '人工データでは λ = 2〜4 で真の収益が最大になり、<span class="A">λ = 0</span> は 70〜80% で過大評価した。', en: '' },
    { ja: '頑健でない問題を解く方法を、対数回呼ぶだけで解ける。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var items = [];
  function at(t0, g) { items.push({ g: g, t0: t0 }); return g; }
  function T(p, x, y, s, a) { return t2(p, x, y, s, '', a); }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // revenue curves over a 1-d price axis: true and estimated (schematic)
  function curve(f, x0, x1, ox, oy, sx, sy) {
    var d = '';
    for (var i = 0; i <= 60; i++) { var x = x0 + (x1 - x0) * i / 60; d += (i ? 'L' : 'M') + (ox + x * sx).toFixed(1) + ',' + (oy - f(x) * sy).toFixed(1); }
    return d;
  }
  function truth(x) { return 1 - 2.2 * (x - 0.42) * (x - 0.42); }
  function est(x) { return truth(x) + 0.35 * Math.exp(-60 * (x - 0.78) * (x - 0.78)); }

  function build(svg) {
    var S = { g: [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); }) };

    // ===== scene 1: estimated curve peaks in the wrong place =====
    var g1 = S.g[0], ox = 90, oy = 420, sx = 460, sy = 260;
    el('line', { x1: ox, y1: oy, x2: ox + 470, y2: oy, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: ox, y1: oy, x2: ox, y2: 110, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, ox + 470, oy + 28, '価格', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    T(g1, ox - 10, 104, '収益', { 'font-size': 15, fill: C.muted });
    el('path', { d: curve(truth, 0, 1, ox, oy, sx, sy), fill: 'none', stroke: C.gray, 'stroke-width': 3 }, g1);
    T(g1, ox + 200, oy - 190, '真の収益', { 'font-size': 15, fill: C.muted });
    var e1 = at(1.6, el('g', {}, g1));
    el('path', { d: curve(est, 0, 1, ox, oy, sx, sy), fill: 'none', stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, e1);
    T(e1, ox + 380, oy - 330, '推定した収益', { 'font-size': 15, fill: C.a });
    var e2 = at(3.4, el('g', {}, g1));
    el('line', { x1: ox + 0.78 * sx, y1: oy, x2: ox + 0.78 * sx, y2: oy - est(0.78) * sy, stroke: C.a, 'stroke-width': 2 }, e2);
    el('circle', { cx: ox + 0.78 * sx, cy: oy - est(0.78) * sy, r: 7, fill: C.a }, e2);
    el('circle', { cx: ox + 0.78 * sx, cy: oy - truth(0.78) * sy, r: 7, fill: C.gray }, e2);
    var p1 = at(4.2, el('g', {}, g1));
    T(p1, PX, 160, '推定値をそのまま使う', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    T(p1, PX, 200, '誤差で高く見える価格を', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 226, '選んでしまう', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 280, '見積りの収益 ＞ 実際の収益', { 'font-size': 16, fill: C.a });
    T(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: confidence region =====
    var g2 = S.g[1], cx = 300, cy = 270;
    el('line', { x1: 90, y1: 440, x2: 520, y2: 440, stroke: C.hair, 'stroke-width': 1.5 }, g2);
    el('line', { x1: 90, y1: 440, x2: 90, y2: 100, stroke: C.hair, 'stroke-width': 1.5 }, g2);
    T(g2, 520, 466, '係数 1', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    T(g2, 100, 104, '係数 2', { 'font-size': 14, fill: C.muted });
    var r2 = H.rng(7);
    S.dots2 = [];
    for (var i = 0; i < 40; i++) {
      var u = r2() * 2 - 1, w = r2() * 2 - 1, a = 0.5;
      S.dots2.push(el('circle', { cx: cx + 120 * (u * Math.cos(a) - 0.5 * w * Math.sin(a)) * 0.8, cy: cy - 120 * (u * Math.sin(a) + 0.5 * w * Math.cos(a)) * 0.8, r: 4, fill: C.gray }, g2));
    }
    S.ell = el('ellipse', { cx: cx, cy: cy, rx: 0, ry: 0, fill: 'none', stroke: C.b, 'stroke-width': 3, transform: 'rotate(-28 ' + cx + ' ' + cy + ')' }, g2);
    el('circle', { cx: cx, cy: cy, r: 7, fill: C.a }, g2);
    T(g2, cx + 12, cy + 26, m('Â'), { 'font-size': 18, fill: C.a });
    var p2 = at(10.0, el('g', {}, g2));
    T(p2, PX, 160, '信頼領域', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    T(p2, PX, 204, m('A') + ' = ' + m('Â') + ' + ' + m('Σ̂') + '<tspan dy="-8" font-size="12">1/2</tspan><tspan dy="8"> ' + m('U W') + '</tspan><tspan dy="-8" font-size="12">−1/2</tspan>', { 'font-size': 18, fill: C.ink });
    T(p2, PX, 244, '‖' + m('U') + '‖<tspan dy="4" font-size="12">F</tspan><tspan dy="-4"> ≤ ' + m('λ') + '</tspan>', { 'font-size': 18, fill: C.ink });
    T(p2, PX, 300, m('λ') + ' = 0 なら推定値だけ', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 324, m('λ') + ' が大きいほど保守的', { 'font-size': 15, fill: C.muted });
    T(g2, 940, 520, '模式図（灰色の点は推定値のばらつき）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: max-min =====
    var g3 = S.g[2], o3x = 90, o3y = 420;
    el('line', { x1: o3x, y1: o3y, x2: o3x + 470, y2: o3y, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    T(g3, o3x + 470, o3y + 28, '価格', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    [0.12, 0.2, -0.1, 0.05].forEach(function (k, j) {
      el('path', { d: curve(function (x) { return truth(x) + k * Math.sin(6 * x + j); }, 0, 1, o3x, o3y, 460, 260), fill: 'none', stroke: C.hair, 'stroke-width': 2 }, g3);
    });
    function worst(x) { return truth(x) - 0.12 - 0.25 * Math.abs(x - 0.4); }
    var w3 = at(18.0, el('g', {}, g3));
    el('path', { d: curve(worst, 0, 1, o3x, o3y, 460, 260), fill: 'none', stroke: C.b, 'stroke-width': 3 }, w3);
    var wx = 0.4;
    el('circle', { cx: o3x + wx * 460, cy: o3y - worst(wx) * 260, r: 7, fill: C.b }, w3);
    el('line', { x1: o3x + wx * 460, y1: o3y, x2: o3x + wx * 460, y2: o3y - worst(wx) * 260, stroke: C.b, 'stroke-width': 2 }, w3);
    var p3 = at(17.0, el('g', {}, g3));
    T(p3, PX, 160, 'max  min', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    T(p3, PX + 14, 186, m('x'), { 'font-size': 14, fill: C.b });
    T(p3, PX + 62, 186, m('A') + ' ∈ 𝒞<tspan dy="4" font-size="11">' + m('λ') + '</tspan>', { 'font-size': 14, fill: C.b });
    T(p3, PX, 230, '最悪の係数での収益', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 256, 'を最大にする', { 'font-size': 16, fill: C.ink });
    var p3b = at(20.0, el('g', {}, g3));
    T(p3b, PX, 310, '最悪の係数は閉じた形：', { 'font-size': 15, fill: C.muted });
    T(p3b, PX, 336, m('vᵀQ̂v') + ' + ' + m('λ') + '‖' + m('L') + '<tspan dy="4" font-size="11">1</tspan><tspan dy="-4">' + m('v') + '‖‖' + m('L') + '</tspan><tspan dy="4" font-size="11">2</tspan><tspan dy="-4">' + m('v') + '‖</tspan>', { 'font-size': 16, fill: C.ink });
    T(g3, 940, 520, '模式図（灰色の線は信頼領域の中の係数での収益）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: lambda vs revenue =====
    var g4 = S.g[3], o4x = 100, o4y = 410;
    el('line', { x1: o4x, y1: o4y, x2: o4x + 440, y2: o4y, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: o4x, y1: o4y, x2: o4x, y2: 130, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    for (var l = 0; l <= 8; l++) T(g4, o4x + l * 52, o4y + 24, String(l), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    T(g4, o4x + 440, o4y + 50, m('λ'), { 'font-size': 18, fill: C.ink, 'text-anchor': 'end' });
    T(g4, o4x - 10, 122, '真の収益', { 'font-size': 15, fill: C.muted });
    function rev(l) { return 0.55 + 0.35 * Math.exp(-0.18 * (l - 3) * (l - 3)) - 0.02 * l; }
    var dd = '';
    for (var q = 0; q <= 80; q++) { var lv = q / 10; dd += (q ? 'L' : 'M') + (o4x + lv * 52).toFixed(1) + ',' + (o4y - rev(lv) * 260).toFixed(1); }
    S.curve4 = el('path', { d: dd, fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': 1200, 'stroke-dashoffset': 1200 }, g4);
    el('rect', { x: o4x + 2 * 52, y: 130, width: 2 * 52, height: o4y - 130, fill: C.bsoft, opacity: 0.6 }, g4);
    el('circle', { cx: o4x, cy: o4y - rev(0) * 260, r: 7, fill: C.a }, g4);
    T(g4, o4x + 12, o4y - rev(0) * 260 + 30, m('λ') + ' = 0', { 'font-size': 15, fill: C.a });
    var p4 = at(26.0, el('g', {}, g4));
    T(p4, PX, 160, 'λ = 2〜4 で最大', { 'font-size': 22, 'font-weight': 700, fill: C.b });
    T(p4, PX, 196, '真の最大収益との差 5〜10%', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 260, 'λ = 0（頑健でない）は', { 'font-size': 16, fill: C.a });
    T(p4, PX, 300, '70〜80%', { 'font-size': 34, 'font-weight': 700, fill: C.a });
    T(p4, PX, 330, 'の場合に収益を過大評価', { 'font-size': 16, fill: C.a });
    T(g4, 940, 520, '論文 6.1 節の記述（曲線の形は模式的）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: algorithm + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    T(g5, 300, 68, 'γ を固定すると', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g5, 300, 96, '頑健でない問題と同じ形', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    T(g5, 660, 68, '黄金分割探索で', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g5, 660, 96, 'オラクルを ' + m('O') + '(log) 回', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 176, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IJCAI 2017';
    el('text', { x: 480, y: 230, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Robust Quadratic Programming';
    el('text', { x: 480, y: 272, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Price Optimization';
    T(g5, 480, 314, '回帰の推定誤差を見込んで価格を決める', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 362, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Akihiro Yabe · Shinji Ito · Ryohei Fujimaki';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.24963/ijcai.2017/648';
    T(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    items.forEach(function (it) { it.g.setAttribute('opacity', seg(t, it.t0, it.t0 + 0.6)); });
    var k = seg(t, 9.0, 10.6);
    S.ell.setAttribute('rx', 150 * k); S.ell.setAttribute('ry', 70 * k);
    S.curve4.setAttribute('stroke-dashoffset', 1200 * (1 - seg(t, 24.6, 27.0)));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 29 });
})();
