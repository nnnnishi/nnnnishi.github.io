// =====================================================================
// teaser-scenes.js — Subramanian, Sun, Drissi & Ettl, "Constrained Prescriptive Trees via Column
// Generation" (AAAI 2022; numbers from arXiv 2207.10163v1 incl. supplementary), unofficial explainer.
// Player: teaser-engine.js.
// Scene 1: grocery case, unconstrained predicted demand +99.94 % (supplement), median price $2.99 -> $2.
// Scene 2: schematic of an inter-rule constraint + the binary-variable count stated in the paper.
// Scene 3: schematic feature graph (toy, labelled 模式図); paths added by column generation.
// Scene 4: grocery revenue increases stated in the main text (82.8, 65.9, 77.1, 61.72, 47.49, 65.4 %).
// Colours: orange = existing / unconstrained prescriptive trees; blue = path-based SPMT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'これまでの処方的な木は<span class="A">制約なしで</span>行動を選ぶ。イチゴの価格の例では、予測需要が過去の約 2 倍になった。', en: '' },
    { ja: '在庫などの制約は複数のルールにまたがる。木を丸ごと解く既存の MIP は、変数が標本数に比例して増える。', en: '' },
    { ja: '論文は<span class="B">ルールを特徴グラフ上の経路</span>として表し、有望な経路だけを列生成で足していく。', en: '' },
    { ja: 'イチゴの価格設定では制約なしで収益が 82.8% 増え、需要の変化を抑える制約をつけても 47〜62% 増えた。', en: '' },
    { ja: '経路を列にした定式化で、制約を満たす多分岐の処方的な木を 100 万標本の規模で求められる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ----- scene 3: toy feature graph -----
  var LX = [80, 200, 330, 460, 575];
  var LEV = [
    [{ y: 270, l: '始点' }],
    [{ y: 150, l: 'a' }, { y: 230, l: 'b' }, { y: 310, l: 'c' }, { y: 390, l: 'SKIP' }],
    [{ y: 150, l: 'p' }, { y: 230, l: 'q' }, { y: 310, l: 'r' }, { y: 390, l: 'SKIP' }],
    [{ y: 190, l: '$2' }, { y: 270, l: '$3' }, { y: 350, l: '$4' }],
    [{ y: 270, l: '終点' }]
  ];
  // generated paths (indices into levels 1..3), in the order column generation adds them
  var GEN = [[3, 3, 1], [0, 1, 0], [1, 3, 1], [2, 0, 2], [0, 3, 0], [1, 2, 1], [2, 3, 2], [0, 0, 0], [3, 1, 1]];
  var CHOSEN = [4, 2, 6];   // final rules: (a,SKIP,$2), (b,SKIP,$3), (c,SKIP,$4)
  function pathPts(p) {
    var pts = [[LX[0], LEV[0][0].y]];
    for (var k = 0; k < 3; k++) pts.push([LX[k + 1], LEV[k + 1][p[k]].y]);
    pts.push([LX[4], LEV[4][0].y]);
    return pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' ');
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: unconstrained policy doubles predicted demand =====
    var g1 = S.g[0];
    t2(g1, 70, 80, 'イチゴの価格設定：制約なしの方策', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.price1 = el('g', {}, g1);
    t2(S.price1, 70, 140, '過去の価格の中央値', '', { 'font-size': 15, fill: C.muted });
    txt(S.price1, 70, 184, '$2.99', { 'font-size': 36, 'font-weight': 650, fill: C.ink });
    txt(S.price1, 200, 184, '→', { 'font-size': 32, fill: C.muted });
    txt(S.price1, 260, 184, '$2', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    t2(S.price1, 260, 140, '方策の多くの層', '', { 'font-size': 15, fill: C.muted });
    var BX = 70, BW = 250;   // 100 % of historical demand = 250 px
    t2(g1, BX, 252, '過去の需要', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: BX, y: 262, width: BW, height: 40, rx: 5, fill: C.gray }, g1);
    txt(g1, BX + BW + 10, 290, '100', { 'font-size': 18, fill: C.ink });
    t2(g1, BX, 352, '制約なしの方策での予測需要', '', { 'font-size': 15, fill: C.a });
    S.dem = el('rect', { x: BX, y: 362, width: 0, height: 40, rx: 5, fill: C.a }, g1);
    S.demLab = txt(g1, BX + BW * 1.9994 + 10, 390, '199.94', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(g1, BX, 440, '過去の需要を 100 としたときの値', '', { 'font-size': 14, fill: C.muted });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 170, '予測需要', '', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 226, '+99.94%', { 'font-size': 42, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX, 274, '傷みやすく供給にも', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 300, '限りがある商品では', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 326, '現実的でない', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '論文の補足資料の数値（arXiv v1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: inter-rule constraint + size of arc-based MIPs =====
    var g2 = S.g[1];
    t2(g2, 70, 80, '複数のルールにまたがる制約', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.leaves = [['ルール1', '$2', 0.55], ['ルール2', '$2', 0.75], ['ルール3', '$3', 0.35]].map(function (r, i) {
      var x = 70 + i * 175, o = {};
      el('rect', { x: x, y: 120, width: 150, height: 64, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g2);
      t2(g2, x + 75, 146, r[0], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      txt(g2, x + 75, 172, r[1], { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      el('rect', { x: x + 45, y: 210, width: 60, height: 160, fill: C.panel }, g2);
      o.bar = el('rect', { x: x + 45, y: 370, width: 60, height: 0, fill: C.a }, g2);
      o.h = 160 * r[2]; o.t0 = 9 + i * 0.5;
      return o;
    });
    t2(g2, 70, 400, '各ルールの予測需要', '', { 'font-size': 15, fill: C.muted });
    S.brace = el('g', {}, g2);
    el('path', { d: 'M75,420 L75,432 L570,432 L570,420', fill: 'none', stroke: C.ink, 'stroke-width': 2 }, S.brace);
    t2(S.brace, 322, 462, '需要の合計 ≤ 在庫', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 130, '木を丸ごと解く', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 156, '既存の MIP の二値変数', '', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 216, '&gt; 32×10⁶', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    t2(S.p2, PX, 256, '32 葉・100 万標本の場合', '', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 290, m('O') + '(2' + '<tspan dy="-8" font-size="13">' + m('k') + '</tspan><tspan dy="8">' + m('M') + ')</tspan>', { 'font-size': 20, fill: C.ink });
    t2(g2, 940, 520, '模式図（左の需要は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: feature graph + column generation =====
    var g3 = S.g[2];
    t2(g3, LX[1], 100, '特徴 1', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, LX[2], 100, '特徴 2', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, LX[3], 140, '行動（価格）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    // all edges (faint)
    for (var lv = 0; lv < 4; lv++) {
      LEV[lv].forEach(function (a) {
        LEV[lv + 1].forEach(function (b) {
          el('line', { x1: LX[lv], y1: a.y, x2: LX[lv + 1], y2: b.y, stroke: C.hair, 'stroke-width': 1 }, g3);
        });
      });
    }
    S.gen = GEN.map(function (p) { return el('polyline', { points: pathPts(p), fill: 'none', stroke: C.b, 'stroke-width': 2, opacity: 0, 'stroke-linejoin': 'round' }, g3); });
    S.cho = CHOSEN.map(function (k) { return el('polyline', { points: pathPts(GEN[k]), fill: 'none', stroke: C.b, 'stroke-width': 5, opacity: 0, 'stroke-linejoin': 'round' }, g3); });
    LEV.forEach(function (nodes, lv) {
      nodes.forEach(function (n) {
        var skip = n.l === 'SKIP', end = lv === 0 || lv === 4;
        el('circle', { cx: LX[lv], cy: n.y, r: end ? 26 : 20, fill: '#fff', stroke: skip ? C.muted : C.ink, 'stroke-width': 1.5, 'stroke-dasharray': skip ? '4 3' : 'none' }, g3);
        var lab = skip ? 'S' : n.l;
        txt(g3, LX[lv], n.y + 5, lab, { 'font-size': end ? 14 : 15, fill: skip ? C.muted : C.ink, 'text-anchor': 'middle' });
      });
    });
    t2(g3, LX[1], 434, 'S = SKIP', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, LX[2], 434, '（特徴を使わない）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'start' });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 110, '経路 1 本 ＝ ルール 1 本', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p3, PX, 156, 'ありうる経路', '', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 188, '4 × 4 × 3 = 48 本', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    t2(S.p3, PX, 234, '列生成で足した経路', '', { 'font-size': 15, fill: C.muted });
    S.cnt = txt(S.p3, PX, 274, '0 本', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 322, 'Master-MIP で選ぶ', '', { 'font-size': 15, fill: C.muted });
    txt(S.p3b, PX, 358, m('n') + ' = 3 本のルール', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(S.p3b, PX, 388, '標本は重ならない', '', { 'font-size': 15, fill: C.ink });
    t2(g3, 940, 520, '模式図（グラフと経路は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: grocery revenue increase (main text) =====
    var g4 = S.g[3];
    var rows = [
      ['SPT（Biggs ら）', 65.9, C.a], ['Policy Trees（Amram ら）', 77.1, C.a], ['SPMT（制約なし）', 82.8, C.b],
      ['SPMT・需要の変化 ≤ 50%', 61.72, C.b], ['SPMT・需要の変化 ≤ 25%', 47.49, C.b], ['SPMT・ロイヤルティ価格', 65.4, C.b]
    ];
    var BX0 = 320, SC = 3, Y0 = 130, RD = 54;
    t2(g4, 70, 80, '過去の価格と比べた収益の増加率（イチゴ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 30, 60, 90].forEach(function (v) {
      el('line', { x1: BX0 + v * SC, x2: BX0 + v * SC, y1: Y0 - 26, y2: Y0 + RD * 5 + 24, stroke: C.hair }, g4);
      el('text', { x: BX0 + v * SC, y: Y0 + RD * 5 + 48, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    el('line', { x1: 70, x2: 620, y1: Y0 + RD * 2.5, y2: Y0 + RD * 2.5, stroke: C.muted, 'stroke-dasharray': '5 4' }, g4);
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + RD * i, o = {};
      t2(g4, BX0 - 12, y + 6, rw[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX0, y: y - 15, width: 0, height: 30, rx: 3, fill: rw[2] }, g4);
      o.lab = el('text', { x: BX0 + rw[1] * SC + 8, y: y + 6, 'font-size': 16, fill: C.ink }, g4); o.lab.textContent = rw[1] + '%';
      o.full = rw[1] * SC; o.t0 = 25 + i * 0.6;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 120, 'SPMT は 64 ルール', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 156, '上の 2 本は各論文の', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 180, '報告値', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 250, '破線より下は', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 276, '制約つきの方策', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(S.p4, PX, 316, '制約を厳しくすると', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 342, '収益の増加は小さくなる', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文本文の数値（arXiv v1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2022';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Constrained Prescriptive Trees';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'via Column Generation';
    t2(g5, 480, 296, '列生成による制約つきの処方的な木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Shivaram Subramanian · Wei Sun · Youssef Drissi · Markus Ettl';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v36i4.20384';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.price1.setAttribute('opacity', seg(t, 1, 1.8));
    S.dem.setAttribute('width', 250 * 1.9994 * seg(t, 2.5, 4.5));
    S.demLab.setAttribute('opacity', seg(t, 4.3, 4.8));
    S.p1.setAttribute('opacity', seg(t, 5, 5.7));
    // scene 2
    S.leaves.forEach(function (o) {
      var h = o.h * seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('height', h); o.bar.setAttribute('y', 370 - h);
    });
    S.brace.setAttribute('opacity', seg(t, 11, 11.6));
    S.p2.setAttribute('opacity', seg(t, 12.5, 13.2));
    // scene 3: generated paths appear one by one, then three are chosen
    var shown = 0;
    S.gen.forEach(function (p, i) {
      var k = seg(t, 17.2 + i * 0.4, 17.5 + i * 0.4);
      if (k > 0.5) shown++;
      p.setAttribute('opacity', 0.35 * k * (1 - 0.6 * seg(t, 21.2, 21.8)));
    });
    S.cnt.textContent = shown + ' 本';
    S.cho.forEach(function (p) { p.setAttribute('opacity', seg(t, 21.2, 21.8)); });
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.p3b.setAttribute('opacity', seg(t, 21.4, 22));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.7));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
