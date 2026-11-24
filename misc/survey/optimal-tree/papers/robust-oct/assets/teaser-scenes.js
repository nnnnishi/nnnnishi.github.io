// =====================================================================
// teaser-scenes.js — Justin, Aghaei, Gómez & Vayanos, "Learning Optimal Classification Trees Robust to
// Distribution Shifts" (Operations Research 2026; numbers from arXiv 2310.17772), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3: schematics with explainer-chosen answers and costs (labelled 模式図).
// Scene 4: median number of branching nodes by lambda (Section 6.2.3) and the headline gains (abstract).
// Colours: orange = distribution shift / non-robust or overly conservative trees; blue = proposed robust tree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '調査の回答は、質問の言い回しや聞き手が変わるだけで<span class="A">学習時と運用時でずれる</span>ことがある。', en: '' },
    { ja: 'どんな摂動でも予測を変えないことを求めると保守的になり、予算が大きいと分岐のない木しか残らない。', en: '' },
    { ja: '論文の攻撃者は<span class="B">予算 ε の範囲で、誤らせる費用が安い標本から</span>動かす。その最悪の場合に最も多く当てる木を求める。', en: '' },
    { ja: '予算を大きくするほど木は小さくなり、分岐の数の中央値は λ = 0.95〜0.99 の 4 から λ = 0.5 の 0 に減った。', en: '' },
    { ja: '費用と予算で変化を表せば、整数やカテゴリの特徴量の変化に頑健な最適な木を厳密に求められる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: survey answers shift =====
    var g1 = S.g[0];
    t2(g1, 70, 90, '「この 1 週間に何日、気分が落ち込みましたか」（0〜7 日）', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 70, 150, '学習時', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g1, 70, 290, '運用時', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    var A0 = [2, 5, 1, 3, 6, 0, 4, 2], SH = [0, -1, 0, -1, -2, 0, -1, 0];
    S.cells = A0.map(function (v, i) {
      var x = 90 + i * 62, o = {};
      el('rect', { x: x, y: 170, width: 50, height: 50, rx: 8, fill: C.panel }, g1);
      txt(g1, x + 25, 204, String(v), { 'font-size': 22, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      o.box = el('rect', { x: x, y: 310, width: 50, height: 50, rx: 8, fill: C.panel }, g1);
      o.t = txt(g1, x + 25, 344, String(v), { 'font-size': 22, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      o.v = v; o.s = SH[i];
      return o;
    });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 150, '整数・カテゴリの', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 176, '特徴量がずれる', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 230, '学習データで最適な木でも', '', { 'font-size': 16, fill: C.muted });
    t2(S.p1, PX, 256, '運用で精度が落ちうる', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（回答の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: invariant-prediction proxy is conservative =====
    var g2 = S.g[1];
    var AX = 300;
    el('line', { x1: 80, x2: 600, y1: AX, y2: AX, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.dots2 = [];
    for (var k = 0; k < 9; k++) {
      var x = 100 + k * 60;
      S.dots2.push({ c: el('circle', { cx: x, cy: AX, r: 11, fill: k >= 4 ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2.2 }, g2), x: x });
      el('text', { x: x, y: AX + 36, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = k + 1;
    }
    S.bars2 = S.dots2.map(function (d, k) { return el('rect', { x: d.x, y: AX - 30 - (k % 2) * 12, width: 0, height: 6, rx: 3, fill: C.a, opacity: 0.8 }, g2); });
    S.split2 = el('line', { x1: 370, x2: 370, y1: AX - 80, y2: AX + 20, stroke: C.a, 'stroke-width': 3 }, g2);
    S.cross2 = txt(g2, 370, AX - 92, '×', { 'font-size': 30, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 130, 'Bertsimas らの条件', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    txt(S.p2, PX, 172, m('π') + '(' + m('x') + ') = ' + m('π') + '(' + m('x') + ' + ' + m('ξ') + ')', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(S.p2, PX, 204, 'どの摂動でも予測が同じ', '', { 'font-size': 15, fill: C.muted });
    t2(S.p2, PX, 262, '摂動の幅がしきい値を', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 288, 'またぐ分岐は置けない', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 340, '→ 分岐のない木', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: attacker sorts psi and spends budget =====
    var g3 = S.g[2];
    t2(g3, 70, 80, '標本ごとの、誤らせる最小の費用 ' + m('ψ') + '<tspan font-size="13" dy="-8">' + m('i') + '</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var PSI = [0.9, 2.1, 1.3, 3.0, 0.6, 2.6, 1.7];   // explainer-chosen costs
    var order = PSI.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return a[0] - b[0]; });
    S.rank = {}; order.forEach(function (p, r) { S.rank[p[1]] = r; });
    S.psi = PSI.map(function (v, i) {
      var y = 120 + i * 44, o = {};
      t2(g3, 150, y + 6, '標本 ' + (i + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: 165, y: y - 13, width: v * 110, height: 26, rx: 4, fill: C.gray }, g3);
      txt(g3, 175 + v * 110, y + 6, v.toFixed(1), { 'font-size': 14, fill: C.muted });
      o.v = v;
      return o;
    });
    el('line', { x1: 165, x2: 165, y1: 100, y2: 420, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.budget = el('g', {}, g3);
    el('rect', { x: 165, y: 448, width: 4.5 * 110, height: 20, rx: 4, fill: C.panel }, S.budget);
    S.bfill = el('rect', { x: 165, y: 448, width: 0, height: 20, rx: 4, fill: C.a }, S.budget);
    t2(S.budget, 150, 463, '予算 ' + m('ε') + ' = 4.5', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 140, '攻撃者は安い順に動かす', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 166, '（部分問題）', '', { 'font-size': 14, fill: C.muted });
    t2(S.p3, PX, 220, '誤らされた標本', '', { 'font-size': 16, fill: C.muted });
    S.nTxt = txt(S.p3, PX, 272, '0', { 'font-size': 44, 'font-weight': 650, fill: C.a });
    t2(S.p3, PX, 330, '木はこの最悪の場合の', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 356, '正解数を最大にする', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g3, 940, 520, '模式図（費用は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: median branching nodes by lambda =====
    var g4 = S.g[3];
    t2(g4, 70, 70, '学習した頑健な木の分岐の数（中央値）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows = [['0.99', 4], ['0.97', 4], ['0.95', 4], ['0.9', 3], ['0.85', 2], ['0.75', 2], ['0.5', 0]];
    var BX = 170, U = 70;
    S.rows4 = rows.map(function (rw, i) {
      var y = 118 + i * 46, o = {};
      txt(g4, BX - 16, y + 6, m('λ') + ' = ' + rw[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX, y: y - 14, width: 0, height: 28, rx: 3, fill: C.b }, g4);
      o.lab = txt(g4, BX + rw[1] * U + 10, y + 7, String(rw[1]), { 'font-size': 17, 'font-weight': 650, fill: C.ink });
      o.w = rw[1] * U; o.t0 = 25 + i * 0.45;
      return o;
    });
    t2(g4, BX, 458, '↓ 予算が大きい（より頑健）', '', { 'font-size': 14, fill: C.muted });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 130, '頑健でない木と比べた改善', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 170, '最悪の場合の精度', '', { 'font-size': 16, fill: C.ink });
    txt(S.p4, PX, 214, '最大 +12.48%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 262, '平均の精度', '', { 'font-size': 16, fill: C.ink });
    txt(S.p4, PX, 306, '最大 +4.85%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 350, 'よい λ は 0.75〜0.9', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 6.2 節と要旨の数値（arXiv 版）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'OPERATIONS RESEARCH · 2026';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Classification Trees';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Robust to Distribution Shifts';
    t2(g5, 480, 296, '分布の変化に頑健な最適分類木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nathan Justin · Sina Aghaei · Andrés Gómez · Phebe Vayanos';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/opre.2024.0711';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: deployment answers shift
    var k1 = seg(t, 3, 4.5);
    S.cells.forEach(function (o) {
      var moved = o.s !== 0 && k1 > 0.5;
      o.t.textContent = String(moved ? o.v + o.s : o.v);
      o.box.setAttribute('fill', o.s !== 0 ? H.mix('#EEF0F3', '#FCEBDF', k1) : C.panel);
      o.t.setAttribute('fill', moved ? C.a : C.ink);
    });
    S.p1.setAttribute('opacity', seg(t, 5, 5.8));
    // scene 2: perturbation ranges grow; any split is crossed
    var r = 60 * seg(t, 9.5, 11.5);
    S.bars2.forEach(function (b, i) {
      var x = S.dots2[i].x;
      b.setAttribute('x', x - r); b.setAttribute('width', 2 * r);
    });
    var k2 = seg(t, 12, 12.6);
    S.split2.setAttribute('opacity', 1 - 0.6 * k2);
    S.cross2.setAttribute('opacity', k2);
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: attacker spends the budget on the cheapest samples
    var spent = 0, n = 0, cap = 4.5 * seg(t, 18, 22);
    var sorted = S.psi.map(function (o, i) { return [S.rank[i], i]; }).sort(function (a, b) { return a[0] - b[0]; });
    sorted.forEach(function (p) {
      var o = S.psi[p[1]];
      var on = spent + o.v <= cap + 1e-9;
      if (on) { spent += o.v; n++; }
      o.bar.setAttribute('fill', on ? C.a : C.gray);
    });
    S.bfill.setAttribute('width', spent * 110);
    S.nTxt.textContent = n;
    S.budget.setAttribute('opacity', seg(t, 17.2, 17.8));
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
