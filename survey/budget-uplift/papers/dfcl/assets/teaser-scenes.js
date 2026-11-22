// =====================================================================
// teaser-scenes.js — DFCL (Zhou et al., KDD 2024). Player: teaser-engine.js.
// Orange = two-stage method / prediction accuracy as the goal. Blue = DFCL / allocation quality.
// Scene 2 numbers: paper Table 1 (Logloss) and Table 2 (AUCC). Scene 4: paper Table 3 (EOM).
// Scene 3 is a toy example (labelled 模式図); its values are not from the paper.
// render() is a pure function of t.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">二段階法</span>では効果を予測するモデルと、予算を配る最適化を別々に作る。', en: '' },
    { ja: '予測誤差が最も小さいモデルが、配分の質でも最良とは限らない。', en: '' },
    { ja: '<span class="B">DFCL</span> は予算を λ に置き換え、一人ずつ選んだ処置の結果を損失にして学習する。', en: '' },
    { ja: 'Meituan のデータでは、どの予算でも DFCL-IFD の1人あたり注文数が最も多かった。', en: '' },
    { ja: '予測の正確さではなく、予算内の配分の質を直接学習する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  function txt(parent, x, y, s, attrs) {
    var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k];
    var e = el('text', a, parent); e.innerHTML = s; return e;
  }

  // ---- scene 3 toy data (模式図): r and c for 5 individuals x 3 treatments ----
  var TOY = [
    { r: [1.0, 1.6, 1.9], c: [0, 0.5, 1.0] },
    { r: [1.0, 1.2, 1.3], c: [0, 0.4, 0.8] },
    { r: [0.5, 1.4, 2.2], c: [0, 0.6, 1.2] },
    { r: [2.0, 2.1, 2.15], c: [0, 0.6, 1.2] },
    { r: [0.8, 1.5, 1.8], c: [0, 0.4, 0.9] }
  ];
  var LMAX = 2.0;
  function lamAt(t) { return LMAX * seg(t, 17.2, 22.6); }

  // ---- scene 4 data: paper Table 3 ----
  var EOM = [
    { n: 'TSM-SL', v: [1.0000, 1.0300, 1.0611, 1.0873, 1.1140, 1.1437], col: C.a, dash: '' },
    { n: 'DPM', v: [0.9983, 1.0366, 1.0720, 1.1050, 1.1305, 1.1594], col: C.muted, dash: '6 5' },
    { n: 'DFCL-IFD', v: [1.0197, 1.0574, 1.0902, 1.1221, 1.1516, 1.1796], col: C.b, dash: '' }
  ];
  var CX0 = 110, CX1 = 560, CY0 = 450, CY1 = 90, V0 = 0.98, V1 = 1.20;
  function cx(k) { return CX0 + (CX1 - CX0) * k / 5; }
  function cy(v) { return CY0 - (CY0 - CY1) * (v - V0) / (V1 - V0); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two-stage pipeline =====
    var g = S.g[0];
    S.boxes = [];
    var boxes = [
      { x: 70, y: 160, w: 200, l1: '予測モデル', l2: 'MSE で学習' },
      { x: 330, y: 160, w: 120, l1: '予測値', l2: '<tspan ' + MI + '>r̂</tspan>, <tspan ' + MI + '>ĉ</tspan>' },
      { x: 510, y: 160, w: 160, l1: '最適化', l2: 'MCKP を解く' }
    ];
    boxes.forEach(function (b, i) {
      var bg = el('g', {}, g);
      el('rect', { x: b.x, y: b.y, width: b.w, height: 100, rx: 14, fill: '#fff', stroke: C.a, 'stroke-width': 2.5 }, bg);
      txt(bg, b.x + b.w / 2, b.y + 44, b.l1, { 'font-size': 22, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      txt(bg, b.x + b.w / 2, b.y + 76, b.l2, { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
      S.boxes.push(bg);
    });
    S.arrows = [[270, 330], [450, 510]].map(function (p) {
      var ag = el('g', {}, g);
      el('line', { x1: p[0] + 6, y1: 210, x2: p[1] - 12, y2: 210, stroke: C.ink, 'stroke-width': 2.5 }, ag);
      el('path', { d: 'M' + (p[1] - 6) + ' 210 l-10 -7 v14 z', fill: C.ink }, ag);
      return ag;
    });
    S.split = el('g', {}, g);
    el('line', { x1: 300, y1: 120, x2: 300, y2: 320, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, S.split);
    txt(S.split, 185, 305, '学習の目標：予測誤差', { 'font-size': 17, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
    txt(S.split, 520, 305, '配分の質は学習に使われない', { 'font-size': 17, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
    S.side1 = el('g', {}, g);
    txt(S.side1, 720, 160, '機械学習（ML）', { 'font-size': 18, fill: C.ink, 'font-weight': 650 });
    txt(S.side1, 720, 188, '一人ひとりの売上・', { 'font-size': 16, fill: C.muted });
    txt(S.side1, 720, 210, 'コストを予測する', { 'font-size': 16, fill: C.muted });
    txt(S.side1, 720, 260, 'オペレーションズ・', { 'font-size': 18, fill: C.ink, 'font-weight': 650 });
    txt(S.side1, 720, 284, 'リサーチ（OR）', { 'font-size': 18, fill: C.ink, 'font-weight': 650 });
    txt(S.side1, 720, 312, '予算内で配分を決める', { 'font-size': 16, fill: C.muted });

    // ===== scene 2: prediction loss vs decision quality (Tables 1, 2) =====
    g = S.g[1];
    txt(g, 70, 112, 'CRITEO-UPLIFT v2（論文 Table 1・2）', { 'font-size': 16, fill: C.muted });
    S.bars2 = [];
    function panel(y0, title, sub, lo, hi, ticks, rows) {
      txt(g, 70, y0, title, { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      txt(g, 70, y0 + 24, sub, { 'font-size': 15, fill: C.muted });
      var X0 = 200, X1 = 600;
      ticks.forEach(function (tv) {
        var x = X0 + (X1 - X0) * (tv - lo) / (hi - lo);
        el('line', { x1: x, y1: y0 + 40, x2: x, y2: y0 + 130, stroke: C.hair }, g);
        txt(g, x, y0 + 150, tv.toFixed(tv < 0.5 ? 3 : 2), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      });
      rows.forEach(function (r, i) {
        var y = y0 + 50 + i * 42;
        txt(g, 190, y + 22, r.n, { 'font-size': 17, fill: r.col, 'font-weight': 600, 'text-anchor': 'end' });
        var w = (X1 - X0) * (r.v - lo) / (hi - lo);
        var rect = el('rect', { x: X0, y: y, width: 0, height: 30, rx: 4, fill: r.col }, g);
        var lab = txt(g, X0 + w + 8, y + 22, r.v.toFixed(4), { 'font-size': 17, fill: C.ink, 'font-weight': 600 });
        S.bars2.push({ rect: rect, w: w, lab: lab, i: S.bars2.length });
      });
    }
    panel(160, '予測損失 Logloss', '小さいほど良い（軸は 0.210 から）', 0.210, 0.220, [0.210, 0.215, 0.220],
      [{ n: 'TSM-SL', v: 0.2165, col: C.a }, { n: 'DFCL-IFD', v: 0.2170, col: C.b }]);
    panel(340, '配分の質 AUCC', '大きいほど良い（軸は 0.75 から）', 0.75, 0.79, [0.75, 0.77, 0.79],
      [{ n: 'TSM-SL', v: 0.7561, col: C.a }, { n: 'DFCL-IFD', v: 0.7859, col: C.b }]);
    S.side2 = el('g', {}, g);
    txt(S.side2, 720, 240, '予測では', { 'font-size': 18, fill: C.ink });
    txt(S.side2, 720, 268, '<tspan fill="' + C.a + '" font-weight="650">TSM-SL</tspan> が少し良い', { 'font-size': 18, fill: C.ink });
    txt(S.side2, 720, 420, '配分では', { 'font-size': 18, fill: C.ink });
    txt(S.side2, 720, 448, '<tspan fill="' + C.b + '" font-weight="650">DFCL-IFD</tspan> が高い', { 'font-size': 18, fill: C.ink });
    txt(S.side2, 720, 476, '（+3.94%）', { 'font-size': 18, fill: C.b, 'font-weight': 650 });

    // ===== scene 3: per-individual choice under lambda (toy) =====
    g = S.g[2];
    txt(g, 70, 100, '模式図（数値は架空）', { 'font-size': 15, fill: C.muted });
    var heads = ['割引なし', '小さい割引', '大きい割引'];
    var GX = [230, 360, 490], GY0 = 180, GH = 54;
    heads.forEach(function (h, j) { txt(g, GX[j] + 55, 160, h, { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' }); });
    S.cells = [];
    TOY.forEach(function (p, i) {
      var y = GY0 + i * GH;
      txt(g, 200, y + 30, '個人 ' + 'ABCDE'[i], { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      var row = [];
      for (var j = 0; j < 3; j++) {
        var rect = el('rect', { x: GX[j], y: y + 4, width: 110, height: 40, rx: 8, fill: '#fff', stroke: C.gray, 'stroke-width': 1.5 }, g);
        var lab = txt(g, GX[j] + 55, y + 30, '', { 'font-size': 17, 'text-anchor': 'middle', fill: C.muted, 'font-family': 'ui-monospace, Menlo, monospace' });
        row.push({ rect: rect, lab: lab });
      }
      S.cells.push(row);
    });
    txt(g, 230, 468, 'マスの数字＝ <tspan ' + MI + '>r</tspan> − <tspan ' + MI + '>λ</tspan><tspan ' + MI + '>c</tspan>　青＝各人で最大の処置', { 'font-size': 16, fill: C.muted });
    S.side3 = el('g', {}, g);
    txt(S.side3, 720, 170, '<tspan ' + MI + '>λ</tspan>（予算の「価格」）', { 'font-size': 18, fill: C.ink, 'font-weight': 650 });
    S.lamTxt = txt(S.side3, 720, 220, '', { 'font-size': 38, fill: C.b, 'font-weight': 650 });
    el('rect', { x: 720, y: 238, width: 200, height: 8, rx: 4, fill: C.panel }, S.side3);
    S.lamBar = el('rect', { x: 720, y: 238, width: 0, height: 8, rx: 4, fill: C.b }, S.side3);
    txt(S.side3, 720, 300, '選ばれた処置のコスト合計', { 'font-size': 16, fill: C.muted });
    S.costTxt = txt(S.side3, 720, 340, '', { 'font-size': 30, fill: C.ink, 'font-weight': 650 });
    txt(S.side3, 720, 400, '<tspan ' + MI + '>λ</tspan> が大きい ＝ 予算が小さい', { 'font-size': 16, fill: C.ink });
    txt(S.side3, 720, 440, 'この選択で得られる', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    txt(S.side3, 720, 464, '<tspan ' + MI + '>r</tspan> − <tspan ' + MI + '>λ</tspan><tspan ' + MI + '>c</tspan> の合計を損失にする', { 'font-size': 16, fill: C.b, 'font-weight': 600 });

    // ===== scene 4: Table 3 chart =====
    g = S.g[3];
    [1.00, 1.05, 1.10, 1.15, 1.20].forEach(function (v) {
      el('line', { x1: CX0, y1: cy(v), x2: CX1, y2: cy(v), stroke: C.hair }, g);
      txt(g, CX0 - 10, cy(v) + 5, v.toFixed(2), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    for (var k = 0; k < 6; k++) txt(g, cx(k), CY0 + 26, String(k + 1), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, (CX0 + CX1) / 2, CY0 + 56, '予算（論文 Table 3 の列）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, CX0 - 50, CY1 - 26, '1人あたり注文数（EOM。TSM-SL・予算1 の値が 1.0000）', { 'font-size': 15, fill: C.muted });
    S.lines = EOM.map(function (s) {
      var pl = el('polyline', { points: '', fill: 'none', stroke: s.col, 'stroke-width': 3, 'stroke-dasharray': s.dash }, g);
      var dots = s.v.map(function (v, k) { return el('circle', { cx: cx(k), cy: cy(v), r: 5, fill: s.col, opacity: 0 }, g); });
      return { s: s, pl: pl, dots: dots };
    });
    S.side4 = el('g', {}, g);
    txt(S.side4, 720, 170, '予算全体での改善率', { 'font-size': 16, fill: C.muted });
    txt(S.side4, 720, 170 + 50, 'DFCL-IFD', { 'font-size': 20, fill: C.b, 'font-weight': 650 });
    txt(S.side4, 720, 170 + 84, '+2.85%', { 'font-size': 30, fill: C.b, 'font-weight': 650 });
    txt(S.side4, 720, 170 + 140, 'DPM', { 'font-size': 20, fill: C.muted, 'font-weight': 650 });
    txt(S.side4, 720, 170 + 174, '+1.00%', { 'font-size': 30, fill: C.muted, 'font-weight': 650 });
    txt(S.side4, 720, 170 + 230, 'TSM-SL（基準）', { 'font-size': 20, fill: C.a, 'font-weight': 650 });
    txt(S.side4, 720, 170 + 270, '論文 Table 3', { 'font-size': 14, fill: C.muted });

    // ===== scene 5: title card =====
    g = S.g[4];
    txt(g, 480, 170, 'KDD 2024', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g, 480, 230, 'Decision Focused Causal Learning for', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 480, 272, 'Direct Counterfactual Marketing Optimization', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 480, 322, 'Hao Zhou, Rongxiao Huang, Shaoming Li, Guibin Jiang, Jiaqi Zheng, Bing Cheng, Wei Lin', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 480, 390, '予測と最適化を分けず、配分の質を損失にして学習する', { 'font-size': 20, fill: C.b, 'font-weight': 600, 'text-anchor': 'middle' });
    txt(g, 480, 440, 'doi.org/10.1145/3637528.3672353　·　arXiv:2407.13664', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1
    S.boxes.forEach(function (bg, i) { bg.setAttribute('opacity', seg(t, 0.4 + i * 1.2, 1.0 + i * 1.2)); });
    S.arrows.forEach(function (ag, i) { ag.setAttribute('opacity', seg(t, 1.0 + i * 1.2, 1.5 + i * 1.2)); });
    S.split.setAttribute('opacity', seg(t, 4.0, 4.8));
    S.side1.setAttribute('opacity', seg(t, 2.0, 3.0));

    // scene 2
    S.bars2.forEach(function (b) {
      var start = b.i < 2 ? 9.0 : 11.5, k = seg(t, start + (b.i % 2) * 0.4, start + 1.4 + (b.i % 2) * 0.4);
      b.rect.setAttribute('width', Math.max(0, b.w * k));
      b.lab.setAttribute('opacity', seg(t, start + 1.2, start + 1.8));
    });
    S.side2.setAttribute('opacity', seg(t, 13.2, 14.0));

    // scene 3
    var lam = lamAt(t), cost = 0;
    TOY.forEach(function (p, i) {
      var sc = p.r.map(function (r, j) { return r - lam * p.c[j]; });
      var best = 0; for (var j = 1; j < 3; j++) if (sc[j] > sc[best] + 1e-9) best = j;
      cost += p.c[best];
      S.cells[i].forEach(function (cell, j) {
        var on = j === best;
        cell.rect.setAttribute('fill', on ? C.bsoft : '#fff');
        cell.rect.setAttribute('stroke', on ? C.b : C.gray);
        cell.rect.setAttribute('stroke-width', on ? 2.5 : 1.5);
        cell.lab.textContent = sc[j].toFixed(2);
        cell.lab.setAttribute('fill', on ? C.b : C.muted);
        cell.lab.setAttribute('font-weight', on ? 700 : 400);
      });
    });
    S.lamTxt.textContent = 'λ = ' + lam.toFixed(2);
    S.lamBar.setAttribute('width', 200 * lam / LMAX);
    S.costTxt.textContent = cost.toFixed(1);

    // scene 4
    S.lines.forEach(function (L, si) {
      var t0 = 24.8 + si * 1.1, pts = [];
      L.s.v.forEach(function (v, k) {
        var on = seg(t, t0 + k * 0.18, t0 + k * 0.18 + 0.25);
        L.dots[k].setAttribute('opacity', on);
        if (t >= t0 + k * 0.18) pts.push(cx(k) + ',' + cy(v));
      });
      L.pl.setAttribute('points', pts.join(' '));
    });
    S.side4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
