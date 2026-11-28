// =====================================================================
// teaser-scenes.js — Babbar, McTavish, Rudin, Seltzer, SPLIT (ICML 2025 /
// arXiv:2502.15988), unofficial explainer. Written by Muse (Neon quota
// exhausted on 2026-11-28; fallback per TASK.md).
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses the training
// times stated in the Experiments section (Bike: GOSDT ~10^3 s with a
// 1200 s timeout, SPLIT ~10 s, LicketySPLIT ~1 s in most cases).
// Colours: orange = greedy / exact extremes and their costs; blue = SPLIT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '決定木の学習は、速いが最適でない<span class="A">貪欲法</span>と、最適だが深さとともに候補が指数的に増える<span class="A">厳密解法</span>に分かれてきた。',
    '根に近い分岐を貪欲に決めると性能を落とすが、<span class="B">葉に近い分岐では貪欲でも最適との差は小さい</span>。',
    '<span class="B">SPLIT</span> は浅い先読み深さまでは動的計画法と分枝限定で厳密に解き、それより下は貪欲に決める。',
    'Bike データでは GOSDT の約1,000秒に対して <span class="B">SPLIT は約10秒</span>、LicketySPLIT は約1秒だった。',
    '厳密解ではなく「ほぼ最適」を速く返すことで、速さと品質のつり合いを取る。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 670;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function tree(g, cx, top, nodeCol, leafFill) {
    var X1 = [cx - 110, cx + 110], X2 = [cx - 165, cx - 55, cx + 55, cx + 165];
    [[cx, X1[0]], [cx, X1[1]]].forEach(function (p) {
      el('line', { x1: p[0], y1: top + 20, x2: p[1], y2: top + 92, stroke: C.ink, 'stroke-width': 1.6 }, g);
    });
    X2.forEach(function (x, i) {
      el('line', { x1: X1[i >> 1], y1: top + 112, x2: x, y2: top + 184, stroke: C.ink, 'stroke-width': 1.6 }, g);
    });
    el('circle', { cx: cx, cy: top, r: 20, fill: '#fff', stroke: nodeCol, 'stroke-width': 2.2 }, g);
    X1.forEach(function (x) { el('circle', { cx: x, cy: top + 104, r: 15, fill: '#fff', stroke: nodeCol, 'stroke-width': 2 }, g); });
    X2.forEach(function (x) { el('rect', { x: x - 24, y: top + 182, width: 48, height: 28, rx: 6, fill: leafFill, stroke: C.hair, 'stroke-width': 1.5 }, g); });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two extremes =====
    var g1 = S.g[0];
    tx(g1, 190, 84, '貪欲法（CART）', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tree(g1, 190, 130, C.a, C.panel);
    tx(g1, 190, 386, '速いが木全体では最適でない', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 470, 84, '厳密解法（GOSDT など）', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tree(g1, 470, 130, C.a, C.panel);
    tx(g1, 470, 386, '最適だが候補が深さごとに指数的に増える', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 150, '両極端の間で', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    tx(S.p1, PX, 196, '速さと品質のどちらかを', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 224, '諦めるのが現状だった。', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 280, '→ 厳密に解く場所を', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    tx(S.p1, PX, 308, '　 絞れないか', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: where greed is safe =====
    var g2 = S.g[1];
    el('rect', { x: 90, y: 96, width: 440, height: 150, rx: 12, fill: C.bsoft }, g2);
    el('rect', { x: 90, y: 262, width: 440, height: 170, rx: 12, fill: '#FCEBDF' }, g2);
    tree(g2, 310, 128, C.b, '#FCEBDF');
    tx(g2, 310, 66, '木の位置で分岐の重要度が違う', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    tx(S.p2, PX, 150, '根に近い分岐', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    tx(S.p2, PX, 182, '下の部分木全体に影響する。', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 210, '貪欲に決めると性能を落とす。', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 280, '葉に近い分岐', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    tx(S.p2, PX, 312, '残りの段数が少なく、', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 340, '貪欲でも最適との差は小さい。', { 'font-size': 15, fill: C.ink });
    tx(S.p2, PX, 396, '候補の数は深さで増えるので、', { 'font-size': 15, fill: C.muted });
    tx(S.p2, PX, 422, '計算量の大半は葉側にある。', { 'font-size': 15, fill: C.muted });
    tx(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: SPLIT mechanism =====
    var g3 = S.g[2];
    tree(g3, 310, 118, C.b, C.panel);
    S.s3line = el('line', { x1: 90, y1: 268, x2: 530, y2: 268, stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' }, g3);
    tx(g3, 310, 56, '先読み深さまで厳密、それより下は貪欲', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g3, 545, 262, '先読み深さ', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(g3, 120, 240, 'DP＋分枝限定', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(g3, 120, 330, '貪欲に決定', { 'font-size': 15, 'font-weight': 650, fill: C.a });
    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 140, 'SPLIT の仕組み', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p3, PX, 186, '・先読み深さまでは', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 212, '　 動的計画法＋分枝限定', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 258, '・それより下は、以下すべて', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 284, '　 貪欲に選ぶ前提で評価', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 330, '・高速版 LicketySPLIT、', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 356, '　 ラショモン集合版 RESPLIT', { 'font-size': 16, fill: C.ink });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Bike training times (log scale) =====
    var g4 = S.g[3];
    tx(g4, 80, 84, 'Bike データでの訓練時間（秒、対数軸）', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    var X0 = 250, XW = 620; // 1s -> X0, 1000s -> X0+XW (log10)
    function bx(v) { return X0 + Math.log10(v) / 3 * XW; }
    [1, 10, 100, 1000].forEach(function (v) {
      el('line', { x1: bx(v), y1: 110, x2: bx(v), y2: 400, stroke: C.hair, 'stroke-width': 1 }, g4);
      tx(g4, bx(v), 428, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    var rows = [
      ['GOSDT', 1000, C.a, '約1,000'],
      ['SPLIT', 10, C.b, '約10'],
      ['LicketySPLIT', 1, C.b, '約1（多くの場合）']
    ];
    S.bars = rows.map(function (r, i) {
      var y = 140 + i * 84;
      tx(g4, X0 - 16, y + 22, r[0], { 'font-size': 16, 'font-weight': 650, fill: r[2], 'text-anchor': 'end' });
      var bar = el('rect', { x: X0, y: y, width: 8, height: 34, rx: 6, fill: r[2] }, g4);
      var lab = tx(g4, X0 + 16, y + 23, r[3] + ' 秒', { 'font-size': 16, 'font-weight': 650, fill: r[2] });
      lab.setAttribute('opacity', 0);
      return { bar: bar, lab: lab, w: Math.max(8, bx(r[1]) - X0), t0: 25 + i * 1.6 };
    });
    S.p4 = el('g', {}, g4);
    tx(S.p4, PX, 150, '深さの予算 5、', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 178, '先読み深さ 2 の設定。', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 234, 'GOSDT の制限時間は', { 'font-size': 16, fill: C.ink });
    tx(S.p4, PX, 262, '1,200 秒。', { 'font-size': 16, fill: C.ink });
    tx(g4, 940, 520, '論文の実験節の記述から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('rect', { x: 180, y: 40, width: 270, height: 62, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 315, 66, '厳密に解く場所を絞る', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 315, 90, '100倍超の高速化', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 270, height: 62, rx: 12, fill: '#FCEBDF' }, g5);
    tx(g5, 645, 66, '代わりに手放すもの', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    tx(g5, 645, 90, '最適性の証明（near-optimal）', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 168, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2025';
    el('text', { x: 480, y: 218, 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Near-Optimal Decision Trees';
    el('text', { x: 480, y: 258, 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'in a SPLIT Second';
    tx(g5, 480, 300, 'ほぼ最適な決定木を一瞬で求める', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Varun Babbar, Hayden McTavish, Cynthia Rudin, Margo Seltzer';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2502.15988';
    tx(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    S.p2.setAttribute('opacity', seg(t, 9.2, 10.0));
    S.p3.setAttribute('opacity', seg(t, 17.2, 18.0));
    S.bars.forEach(function (b) {
      var p = seg(t, b.t0, b.t0 + 1.2);
      b.bar.setAttribute('width', Math.max(8, b.w * p));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.9, b.t0 + 1.3));
      b.lab.setAttribute('x', 250 + Math.max(8, b.w * p) + 16);
    });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
