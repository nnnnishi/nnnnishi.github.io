// =====================================================================
// teaser-scenes.js — Diemert et al., "A Large Scale Benchmark for Individual Treatment Effect Prediction
// and Uplift Modeling" (arXiv 2111.10106v1), unofficial explainer. Player: teaser-engine.js.
// Scene 1 uses the sizes in Table 1; scene 2 is a schematic (interval width ∝ 1/sqrt(n), fictitious
// models, labelled 模式図); scene 3 is a schematic of the shares in Table 1; scene 4 uses Table 5.
// Colours: orange = small, older benchmarks / small test sets; blue = CRITEO-UPLIFTv2 and its proposals.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'ITE 予測やアップリフトモデリングの公開ベンチマークは、<span class="A">数百から数万件</span>の小さなデータが中心だった。', en: '' },
    { ja: 'テストデータが小さいと評価のぶれが大きく、モデルの差が信頼区間に埋もれてしまう。', en: '' },
    { ja: 'Criteo は複数の広告 RCT をまとめ、<span class="B">約 1,398 万件</span>の CRITEO-UPLIFTv2 を公開した。', en: '' },
    { ja: '半合成の ITE ベンチマークでは、応答曲面を変えるとモデルの順位が入れ替わった。', en: '' },
    { ja: '手法を比べるには、大きく、性質の異なる複数のベンチマークが要る。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: dataset sizes from Table 1 (log scale) =====
    var g1 = S.g[0];
    var rows = [['IHDP (Hill)', 747], ['Jobs', 3212], ['IHDP (ACIC 2017)', 4302], ['Hillstrom', 42693]];
    var X0 = 230, X1 = 600;
    function lx(v) { return X0 + (Math.log10(v) - 2) / 6 * (X1 - X0); }
    t2(g1, 70, 62, '公開ベンチマークの件数（対数軸）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [[2, '100'], [4, '1万'], [6, '100万'], [8, '1億']].forEach(function (k) {
      var x = lx(Math.pow(10, k[0]));
      el('line', { x1: x, x2: x, y1: 100, y2: 440, stroke: C.hair }, g1);
      t2(g1, x, 470, k[1], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.bars1 = rows.map(function (r, i) {
      var y = 140 + i * 80, o = {};
      el('text', { x: X0 - 14, y: y + 6, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g1).textContent = r[0];
      o.bar = el('rect', { x: X0, y: y - 16, width: 0, height: 32, rx: 5, fill: C.a }, g1);
      o.w = lx(r[1]) - X0;
      o.lab = el('text', { x: lx(r[1]) + 10, y: y + 6, 'font-size': 17, 'font-weight': 650, fill: C.a }, g1);
      o.lab.textContent = r[1].toLocaleString('en-US');
      o.t0 = 1 + i * 0.6;
      return o;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, 'IHDP：乳幼児の発達支援', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 158, 'Jobs：職業訓練', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 186, 'Hillstrom：メール施策', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 240, 'IHDP と Jobs は', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 266, '1980 年代に集めたデータ', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 320, '少数のデータで競い続けると、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 344, 'そのデータに過剰適合する', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 368, 'おそれがある（論文の指摘）', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '論文 Table 1 の件数', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: schematic, confidence intervals shrink with test size =====
    var g2 = S.g[1];
    var mods = [['A', 0.41], ['B', 0.47], ['C', 0.53], ['D', 0.59]];   // fictitious score positions (0..1)
    var AX0 = 180, AX1 = 600;
    function sx(v) { return AX0 + (v - 0.3) / 0.4 * (AX1 - AX0); }   // axis shows 0.3..0.7
    t2(g2, 70, 62, 'テストデータで測った評価値と信頼区間', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: AX0, x2: AX1, y1: 440, y2: 440, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX1, 470, '評価値（AUUC など）→', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.ci = mods.map(function (md, i) {
      var y = 130 + i * 80, o = { v: md[1], y: y };
      txt(g2, AX0 - 30, y + 6, 'モデル ' + md[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.line = el('line', { x1: sx(md[1]), x2: sx(md[1]), y1: y, y2: y, stroke: C.a, 'stroke-width': 4, 'stroke-linecap': 'round' }, g2);
      o.lc = el('line', { x1: 0, x2: 0, y1: y - 10, y2: y + 10, stroke: C.a, 'stroke-width': 2.5 }, g2);
      o.rc = el('line', { x1: 0, x2: 0, y1: y - 10, y2: y + 10, stroke: C.a, 'stroke-width': 2.5 }, g2);
      o.dot = el('circle', { cx: sx(md[1]), cy: y, r: 6, fill: C.ink }, g2);
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 120, 'テストデータの件数', '', { 'font-size': 16, fill: C.muted });
    S.n2 = txt(p2, PX, 162, '', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    S.st2a = t2(p2, PX, 214, '区間が重なり、見分けられない', '', { 'font-size': 17, fill: C.a });
    S.st2b = t2(p2, PX, 214, '区間が離れ、見分けられる', '', { 'font-size': 17, fill: C.b });
    t2(p2, PX, 290, '論文 Fig. 4 では 4 つの', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 314, 'アップリフトモデルを', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 338, '100 万件以上で区別できた。', '', { 'font-size': 15, fill: C.ink });
    t2(g2, 940, 520, '模式図（モデルは架空、区間の幅は 1/√' + m('n') + ' に比例するとした例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: schematic of the dataset composition (shares from Table 1) =====
    var g3 = S.g[2];
    t2(g3, 70, 62, 'CRITEO-UPLIFTv2 の構成', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.dots3 = [];
    var COLS = 20, ROWS = 10;
    for (var k = 0; k < COLS * ROWS; k++) {
      var cx = 90 + (k % COLS) * 25, cy = 120 + Math.floor(k / COLS) * 30;
      var ctrl = (k % COLS) >= 17;   // 3 of 20 columns = 15% control
      S.dots3.push({ ctrl: ctrl, k: k, c: el('circle', { cx: cx, cy: cy, r: 8.5, fill: ctrl ? '#fff' : C.gray, stroke: ctrl ? C.ink : 'none', 'stroke-width': 1.5 }, g3) });
    }
    S.brace3 = el('g', {}, g3);
    el('line', { x1: 80, x2: 490, y1: 430, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, S.brace3);
    t2(S.brace3, 285, 456, '処置群 85%（広告の対象）', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 503, x2: 590, y1: 430, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, S.brace3);
    t2(S.brace3, 546, 456, '対照群 15%', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 140, '13,979,592', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 170, '件（1 行が 1 ユーザー）', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 220, '特徴量 12 個（匿名化済み）', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 252, 'ラベル：訪問 4.70%', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 280, '　　　　コンバージョン 0.29%', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 330, '広告主ごとの処置群比率を', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 354, 'そろえてから 1 つにまとめた', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点の比率は論文 Table 1 の処置群比率）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: ranks by mean sqrt(PEHE), Table 5 =====
    var g4 = S.g[3];
    var models = {
      'T-Learner': [0.317, 1.890, 0.333], 'X-Learner': [0.117, 1.883, 0.413], 'R-Learner': [0.272, 11.668, 0.356],
      'DR-Learner': [0.047, 2.510, 0.379], 'TARNet': [0.104, 0.682, 0.195], 'CFRNet': [0.057, 0.239, 0.152]
    };
    var names = Object.keys(models), XS = [130, 290, 450], Y0 = 120, DY = 58;
    function rank(j, n) { var v = models[n][j]; return names.filter(function (q) { return models[q][j] < v; }).length; }
    t2(g4, 70, 52, '√PEHE の順位（小さいほど上）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [['Case A', C.muted], ['Case B', C.muted], ['多峰型（提案）', C.b]].forEach(function (h, j) {
      t2(g4, XS[j], 92, h[0], '', { 'font-size': 16, 'font-weight': 600, fill: h[1], 'text-anchor': 'middle' });
    });
    for (var r = 0; r < 6; r++) t2(g4, 60, Y0 + DY * r + 5, (r + 1) + ' 位', '', { 'font-size': 15, fill: C.muted });
    S.lines4 = names.map(function (n) {
      var hl = n === 'X-Learner' || n === 'R-Learner';
      var pts = [0, 1, 2].map(function (j) { return [XS[j], Y0 + DY * rank(j, n)]; });
      var o = { pts: pts, hl: hl };
      var a = { fill: 'none', stroke: hl ? C.ink : C.gray, 'stroke-width': hl ? 4 : 2.5, points: pts[0].join(',') + ' ' + pts[0].join(',') };
      if (n === 'R-Learner') a['stroke-dasharray'] = '8 6';
      o.pl = el('polyline', a, g4);
      return o;
    });
    S.nodes4 = [];
    names.forEach(function (n, i) {
      var hl = S.lines4[i].hl;
      [0, 1, 2].forEach(function (j) {
        S.nodes4.push({ j: j, c: el('circle', { cx: XS[j], cy: Y0 + DY * rank(j, n), r: 8, fill: hl ? C.ink : '#8792A2' }, g4) });
      });
      S.nodes4.push({ j: 2, c: el('text', { x: XS[2] + 20, y: Y0 + DY * rank(2, n) + 6, 'font-size': 16, 'font-weight': hl ? 650 : 400, fill: hl ? C.ink : C.muted }, g4) });
      S.nodes4[S.nodes4.length - 1].c.textContent = n;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'X-Learner（実線）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 148, '4 位 → 3 位 → 6 位', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 196, 'R-Learner（破線）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 224, '5 位 → 6 位 → 4 位', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 280, 'Hill の 2 曲面では X が上、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 304, '多峰型では R が上', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 328, '（0.356 対 0.413）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 5（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 120, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2021';
    ['A Large Scale Benchmark for', 'Individual Treatment Effect Prediction', 'and Uplift Modeling'].forEach(function (s, i) {
      el('text', { x: 480, y: 178 + i * 42, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 314, '個別処置効果の予測とアップリフトモデリングのための大規模ベンチマーク', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 360, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Eustache Diemert · Artem Betlei · Christophe Renaudin';
    el('text', { x: 480, y: 386, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Massih-Reza Amini · Théophane Gregoir · Thibaud Rahier';
    el('text', { x: 480, y: 436, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/criteo-research/large-scale-ITE-UM-benchmark';
    t2(g5, 480, 480, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow one by one
    S.bars1.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.9);
      o.bar.setAttribute('width', o.w * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.7, o.t0 + 1.1));
    });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    // scene 2: test size sweeps from 1,000 to 2.8M on a log scale; half-width ∝ 1/sqrt(n)
    var k = seg(t, 9.5, 14.5), ln = Math.log10(1000) + k * (Math.log10(2.8e6) - Math.log10(1000));
    var n = Math.pow(10, ln), hw = 0.9 * Math.sqrt(1000 / n);   // 0.9 of the axis at n = 1,000 (clipped)
    var sep = hw < 0.03;   // models are 0.06 apart: intervals stop overlapping near n = 900,000
    S.ci.forEach(function (o) {
      var x0 = 180 + (Math.max(0.3, o.v - hw) - 0.3) / 0.4 * 420, x1 = 180 + (Math.min(0.7, o.v + hw) - 0.3) / 0.4 * 420;
      var col = sep ? C.b : C.a;
      o.line.setAttribute('x1', x0); o.line.setAttribute('x2', x1); o.line.setAttribute('stroke', col);
      o.lc.setAttribute('x1', x0); o.lc.setAttribute('x2', x0); o.lc.setAttribute('stroke', col);
      o.rc.setAttribute('x1', x1); o.rc.setAttribute('x2', x1); o.rc.setAttribute('stroke', col);
    });
    S.n2.textContent = n < 1e4 ? (Math.round(n / 100) * 100).toLocaleString('en-US') + ' 件' : Math.round(n / 1e4) + ' 万件';
    S.n2.setAttribute('fill', sep ? C.b : C.a);
    S.st2a.setAttribute('opacity', sep ? 0 : 1); S.st2b.setAttribute('opacity', sep ? 1 : 0);
    // scene 3: control column dots appear, then treatment dots turn blue, then the panel
    S.dots3.forEach(function (d) {
      var s = seg(t, 17 + (d.k % 20) * 0.08, 17.6 + (d.k % 20) * 0.08);
      d.c.setAttribute('opacity', s);
      if (!d.ctrl) d.c.setAttribute('fill', H.mix(C.gray, C.b, seg(t, 19, 20)));
    });
    S.brace3.setAttribute('opacity', seg(t, 19.6, 20.3));
    S.p3.setAttribute('opacity', seg(t, 20.3, 21.1));
    // scene 4: lines draw from Case A to Case B to multi-peaked
    var a1 = seg(t, 25.5, 27), a2 = seg(t, 27.6, 29.1);
    S.lines4.forEach(function (o) {
      var p = o.pts, q1 = [p[0][0] + (p[1][0] - p[0][0]) * a1, p[0][1] + (p[1][1] - p[0][1]) * a1];
      var q2 = [p[1][0] + (p[2][0] - p[1][0]) * a2, p[1][1] + (p[2][1] - p[1][1]) * a2];
      o.pl.setAttribute('points', [p[0], q1].concat(a2 > 0 ? [q2] : []).map(function (z) { return z.join(','); }).join(' '));
    });
    S.nodes4.forEach(function (o) { o.c.setAttribute('opacity', [seg(t, 25, 25.5), seg(t, 26.8, 27.2), seg(t, 28.9, 29.4)][o.j]); });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
