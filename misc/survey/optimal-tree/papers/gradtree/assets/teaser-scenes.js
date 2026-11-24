// =====================================================================
// teaser-scenes.js — Marton, Lüdtke, Bartelt, Stuckenschmidt, GradTree: Learning Axis-Aligned Decision Trees
// with Gradient Descent (AAAI 2024), unofficial explainer. Player: teaser-engine.js.
// Scene 1 redraws the two Echocardiogram trees of Fig. 1 (structure and the F1 values printed in it).
// Scenes 2-3 are schematics (labelled 模式図; the feature scores are made up); the logistic curve is S(x).
// Scene 4 uses the MRR rows of Tables 1 and 2. Colours: orange = CART / baselines / non-differentiable
// pieces; blue = GradTree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">CART</span> は局所的に最適な分岐から順に決める。GradTree は全ノードを同時に学び、別の木にたどり着く。', en: '' },
    { ja: '軸に平行な木では、特徴量の選択と階段関数の分岐が微分できず、勾配が流れない。', en: '' },
    { ja: '<span class="B">GradTree</span> は順方向では丸めた硬い値を使い、逆方向では丸める前の値の勾配を流す。', en: '' },
    { ja: '22 の二値分類データで平均逆順位 0.758 と最も高く、多クラスでは CART に次ぐ 2 番目だった。', en: '' },
    { ja: '分岐は硬く軸に平行なまま、全パラメータを勾配法で同時に学べる。ねらうのは汎化の良い局所解である。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }
  function box(g, x, y, lines, col, w) {
    w = w || 150;
    el('rect', { x: x - w / 2, y: y - 22, width: w, height: 44, rx: 7, fill: '#fff', stroke: col, 'stroke-width': 1.8 }, g);
    lines.forEach(function (s, k) { txt(g, x, y - 4 + k * 18, s, { 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' }); });
  }
  function leaf(g, x, y, s, col) {
    el('ellipse', { cx: x, cy: y, rx: 40, ry: 16, fill: '#fff', stroke: col, 'stroke-width': 1.5 }, g);
    txt(g, x, y + 5, s, { 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' });
  }
  function edge(g, x1, y1, x2, y2) { el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C.gray, 'stroke-width': 1.8 }, g); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the Echocardiogram trees of Fig. 1 =====
    var g1 = S.g[0];
    var L = S.left1 = el('g', {}, g1), R = S.right1 = el('g', {}, g1);
    var Lw = el('g', { transform: 'translate(-40,0)' }, L), Rw = el('g', { transform: 'translate(80,0)' }, R);
    // CART (left)
    edge(Lw, 210, 150, 120, 222); edge(Lw, 210, 150, 290, 222); edge(Lw, 290, 222, 220, 294); edge(Lw, 290, 222, 350, 294); edge(Lw, 350, 294, 300, 366); edge(Lw, 350, 294, 410, 366);
    box(Lw, 210, 150, ['wall-motion-score', '≥ 23.5'], C.a);
    leaf(Lw, 120, 222, 'Class 1', C.a);
    box(Lw, 290, 222, ['pericardial-effusion', '≥ 0.5'], C.a);
    leaf(Lw, 220, 294, 'Class 1', C.a);
    box(Lw, 350, 294, ['wall-motion-score', '≥ 8.5'], C.a);
    leaf(Lw, 300, 366, 'Class 0', C.a); leaf(Lw, 410, 366, 'Class 1', C.a);
    t2(Lw, 210, 104, 'CART　macro F1 0.619', '', { 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    // GradTree (right)
    edge(Rw, 560, 150, 470, 232); edge(Rw, 560, 150, 650, 232); edge(Rw, 470, 232, 430, 314); edge(Rw, 470, 232, 510, 314); edge(Rw, 650, 232, 610, 314); edge(Rw, 650, 232, 690, 314);
    box(Rw, 560, 150, ['pericardial-effusion', '≥ 0.5'], C.b);
    box(Rw, 470, 232, ['wall-motion-score', '≥ 22.2'], C.b, 140);
    box(Rw, 650, 232, ['wall-motion-score', '≥ 21.0'], C.b, 140);
    leaf(Rw, 430, 314, 'Class 1', C.b); leaf(Rw, 510, 314, 'Class 0', C.b); leaf(Rw, 610, 314, 'Class 1', C.b); leaf(Rw, 690, 314, 'Class 0', C.b);
    t2(Rw, 560, 104, 'GradTree　macro F1 0.802', '', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, 760, 420, 'Echocardiogram（論文 Fig. 1）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(p1, 480, 460, 'CART は局所的に最適な wall-motion-score で最初に分ける', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g1, 940, 520, '論文 Fig. 1 の木を描き直したもの', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: non-differentiable pieces =====
    var g2 = S.g[1];
    var scores = [0.6, 1.4, 0.3, 0.9];
    S.bars2 = scores.map(function (v, k) {
      var x = 110 + k * 50;
      txt(g2, x + 18, 400, m0('x', k), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return { r: el('rect', { x: x, y: 370 - v * 120, width: 36, height: v * 120, fill: C.gray }, g2), v: v, x: x };
    });
    function m0(s, k) { return s + '₀₁₂₃'.charAt(k); }
    el('line', { x1: 100, x2: 310, y1: 370, y2: 370, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, 205, 140, '特徴量の選択 ' + m('ι'), '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.hm2 = t2(g2, 205, 440, 'hardmax → one-hot', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    // step function
    var sx0 = 380, sx1 = 600, sy0 = 370, sy1 = 210;
    el('line', { x1: sx0, x2: sx1, y1: sy0, y2: sy0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('path', { d: 'M' + sx0 + ',' + sy0 + ' L' + (sx0 + sx1) / 2 + ',' + sy0 + ' L' + (sx0 + sx1) / 2 + ',' + sy1 + ' L' + sx1 + ',' + sy1, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g2);
    t2(g2, (sx0 + sx1) / 2, 140, '分岐 ' + m('𝕊') + '：階段関数', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    txt(g2, (sx0 + sx1) / 2, sy0 + 26, 'τ', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle', 'font-style': 'italic' });
    t2(g2, sx1, sy0 + 26, m('x') + '<tspan dy="5" font-size="11" ' + MI + '>ι</tspan>', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.g0 = t2(g2, (sx0 + sx1) / 2, 440, '勾配は 0 か、定義されない', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 170, '3 つの障害', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 214, 'C1：特徴量の番号が離散', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 242, 'C2：分岐が階段関数', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 270, 'C3：葉のクラスが離散', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 324, '確率的・斜めの分岐に', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 348, '変えずに解決したい', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（特徴量の値は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: straight-through =====
    var g3 = S.g[2];
    var tx0 = 110, tx1 = 590, ty0 = 400, ty1 = 170;
    function tx(u) { return tx0 + (tx1 - tx0) * (u + 6) / 12; }
    function ty(v) { return ty0 - (ty0 - ty1) * v; }
    el('line', { x1: tx0, x2: tx1, y1: ty0, y2: ty0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: tx(0), x2: tx(0), y1: ty0 + 6, y2: ty1 - 14, stroke: C.hair }, g3);
    txt(g3, tx(0), ty0 + 26, 'τ', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle', 'font-style': 'italic' });
    S.fwd3 = el('path', { d: 'M' + tx(-6) + ',' + ty(0) + ' L' + tx(0) + ',' + ty(0) + ' L' + tx(0) + ',' + ty(1) + ' L' + tx(6) + ',' + ty(1), fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '8 5' }, g3);
    var d = '';
    for (var i = 0; i <= 120; i++) { var u = -6 + 12 * i / 120; d += (i ? 'L' : 'M') + tx(u).toFixed(1) + ',' + ty(1 / (1 + Math.exp(-u))).toFixed(1); }
    S.bwd3 = el('path', { d: d, fill: 'none', stroke: C.b, 'stroke-width': 3.4 }, g3);
    S.fl3 = t2(g3, tx(3.2), ty(1) - 16, '順方向：丸めた値（硬い分岐）', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.bl3 = t2(g3, tx(-3), ty(0.32), '逆方向：丸める前の', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.bl3b = t2(g3, tx(-3), ty(0.32) + 20, 'ロジスティック関数の勾配', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    t2(g3, tx(6), ty0 + 26, m('x') + '<tspan dy="5" font-size="11" ' + MI + '>ι</tspan><tspan dy="-5"> − </tspan>' + m('τ'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, 'straight-through 推定', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 174, '特徴量：entmax で', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 198, 'まばらにしてから hardmax', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 236, '分岐：ロジスティック関数を', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 260, '丸めて 0 か 1 にする', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 312, '逆方向では hardmax と', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 336, '丸めを飛ばして勾配を流す', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 380, '葉はクラスの確率分布', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（曲線はロジスティック関数）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: MRR (Tables 1 and 2) =====
    var g4 = S.g[3];
    var bin = [['GradTree', 0.758, C.b], ['CART', 0.556, C.a], ['DNDT', 0.370, C.gray], ['GeneticTree', 0.365, C.gray], ['DL8.5', 0.335, C.gray]];
    var mul = [['CART', 0.774, C.a], ['GradTree', 0.619, C.b], ['DNDT', 0.383, C.gray], ['DL8.5', 0.315, C.gray], ['GeneticTree', 0.288, C.gray]];
    var BX = 190, PER = 380;
    S.b4 = [];
    [[bin, 112, '二値分類（22 データ）の平均逆順位'], [mul, 316, '多クラス（14 データ）の平均逆順位']].forEach(function (grp, gi) {
      t2(g4, 70, grp[1] - 22, grp[2], '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      el('line', { x1: BX, x2: BX, y1: grp[1] - 8, y2: grp[1] + 5 * 32 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      grp[0].forEach(function (r, k) {
        var y = grp[1] + 8 + k * 32;
        t2(g4, BX - 10, y + 5, r[0], '', { 'font-size': 14, fill: C.ink, 'text-anchor': 'end', 'font-weight': r[0] === 'GradTree' ? 650 : 400 });
        var rect = el('rect', { x: BX, y: y - 11, width: 0, height: 22, fill: r[2] }, g4);
        var lab = txt(g4, BX + r[1] * PER + 8, y + 5, r[1].toFixed(3), { 'font-size': 14, 'font-weight': 650, fill: r[2] === C.gray ? C.muted : r[2] });
        S.b4.push({ rect: rect, lab: lab, w: r[1] * PER, t0: 24.8 + gi * 1.8 + k * 0.25 });
      });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, 'macro F1 の順位から計算', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 196, '二値分類で GradTree が', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 222, '最良のデータは 13 個', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 248, '（CART は 6 個）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 302, '特徴量とクラスの多い', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 326, '多クラスのデータでは', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 350, 'CART が最良', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1・2 の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '硬く、軸に平行な分岐を', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '勾配法で同時に学習', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '学習とテストの差（二値分類）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '0.051（CART 0.183）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'AAAI 2024', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g5, 480, 222, 'GradTree: Learning Axis-Aligned', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 262, 'Decision Trees with Gradient Descent', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 304, '軸に平行な決定木を勾配法で学習する', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 354, 'Sascha Marton, Stefan Lüdtke, Christian Bartelt, Heiner Stuckenschmidt', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 408, 'github.com/s-marton/GradTree', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.left1.setAttribute('opacity', seg(t, 0.8, 1.6));
    S.right1.setAttribute('opacity', seg(t, 3.4, 4.2));
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    // scene 2: scores collapse to one-hot
    var k2 = seg(t, 10.4, 11.4);
    S.bars2.forEach(function (b, k) {
      var v = k === 1 ? b.v + (1.4 - b.v) * k2 : b.v * (1 - k2);
      b.r.setAttribute('height', v * 120); b.r.setAttribute('y', 370 - v * 120);
      b.r.setAttribute('fill', k === 1 ? H.mix(C.gray, C.a, k2) : C.gray);
    });
    S.hm2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.g0.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3
    S.fwd3.setAttribute('opacity', seg(t, 17.0, 17.6));
    S.fl3.setAttribute('opacity', seg(t, 17.4, 18.0));
    S.bwd3.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.bl3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.bl3b.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.b4.forEach(function (b) {
      var e = seg(t, b.t0, b.t0 + 0.6);
      b.rect.setAttribute('width', b.w * e);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
