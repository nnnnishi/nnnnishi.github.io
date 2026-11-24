// =====================================================================
// teaser-scenes.js — Shati, Cohen, McIlraith, SAT-Based Approach for Learning Optimal Decision Trees
// with Non-Binary Features (CP 2021; journal version Constraints 2023), unofficial explainer.
// Player: teaser-engine.js.
// Scene 1 is the paper's Example 2. Scene 2 uses Table 1. Scene 3 is a schematic with explainer-chosen
// toy values (labelled 模式図). Scene 4 uses Table 2 (min-depth problem, seconds).
// Colours: orange = binarisation / baselines on binarised data; blue = the paper's direct encoding.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'SAT や CP で最適な木を求める方法の多くは、数値の特徴量を値の種類ごとの<span class="A">二値の特徴量に置き換えて</span>から解く。', en: '' },
    { ja: '値の種類が多いデータでは、二値化すると特徴量が数千に増える。', en: '' },
    { ja: '<span class="B">提案の符号化</span>はしきい値を変数にせず、値で並べた隣どうしの点が逆向きに分かれないことだけを節で書く。', en: '' },
    { ja: '最小の深さの問題では、数値の特徴量のデータで<span class="A">二値化して解く方法</span>より速いか同等で、相手が時間切れになったデータでも解いた。', en: '' },
    { ja: 'カテゴリの特徴量は値の部分集合で枝分かれさせ、より浅い木や誤りの少ない木を表せるようにした。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) {
    var a = { x: x, y: y, 'font-size': 17, fill: C.ink };
    for (var k in attrs) a[k] = attrs[k];
    var e = el('text', a, g); e.textContent = s; return e;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: Example 2 — one integer feature becomes three binary features =====
    var g1 = S.g[0];
    var RY = [190, 245, 300, 355], VALS = [1, 3, 4, 5];
    var BIN = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]];
    var BX = [330, 425, 520], HEAD = ['&gt; 1', '&gt; 3', '&gt; 4'];
    t2(g1, 150, 140, m('f'), '', { 'font-size': 20, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    RY.forEach(function (y, r) {
      el('rect', { x: 115, y: y - 22, width: 70, height: 44, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g1);
      txt(g1, 150, y + 6, String(VALS[r]), { 'text-anchor': 'middle' });
    });
    S.arrow1 = el('path', { d: 'M205,272 h70', stroke: C.a, 'stroke-width': 2.5, fill: 'none', 'marker-end': '' }, g1);
    S.arrowHead1 = el('path', { d: 'M275,264 l12,8 l-12,8 z', fill: C.a }, g1);
    S.cols1 = BX.map(function (x, k) {
      var g = el('g', {}, g1);
      t2(g, x, 128, m('f̃') + '<tspan dy="5" font-size="13">' + k + '</tspan>', '', { 'font-size': 20, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
      t2(g, x, 156, HEAD[k], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      RY.forEach(function (y, r) {
        el('rect', { x: x - 35, y: y - 22, width: 70, height: 44, rx: 6, fill: BIN[r][k] ? '#FCEBDF' : '#fff', stroke: C.a, 'stroke-width': 1.5 }, g);
        txt(g, x, y + 6, String(BIN[r][k]), { 'text-anchor': 'middle', fill: C.a, 'font-weight': 600 });
      });
      return { g: g, t0: 2.2 + k * 0.8 };
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '二値化（先行研究の前処理）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '値の種類ごとに、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '「しきい値より大きいか」', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 254, 'を表す二値の特徴量を作る。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '値の種類が増えるほど、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 334, '特徴量の数も増える。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '論文の例 2（Avellaneda の方法による二値化）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Table 1 — number of features before / after binarisation =====
    var g2 = S.g[1];
    var D2 = [['Banknote', 4, 5016], ['Breast Cancer', 9, 891], ['Wine', 13, 1263], ['Ionosphere', 34, 8114]];
    var X0 = 230, WMAX = 330;
    t2(g2, X0, 96, '元の特徴量の数 → 二値化した後の数', '', { 'font-size': 16, fill: C.muted });
    S.bars2 = D2.map(function (d, i) {
      var y = 160 + i * 82;
      txt(g2, X0 - 16, y - 2, d[0], { 'text-anchor': 'end', 'font-weight': 600 });
      txt(g2, X0 - 16, y + 22, '元は ' + d[1] + ' 個', { 'text-anchor': 'end', 'font-size': 15, fill: C.muted });
      var rect = el('rect', { x: X0, y: y - 18, width: 0, height: 36, fill: C.a }, g2);
      var w = WMAX * d[2] / 8114;
      var lab = txt(g2, X0 + w + 10, y + 6, d[2].toLocaleString('en-US') + ' 個', { 'font-weight': 650, fill: C.a, 'font-size': 18 });
      return { rect: rect, lab: lab, w: w, t0: 9.0 + i * 0.6 };
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '特徴量が数千に増える', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 198, 'Banknote の 4 つの数値の', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '特徴量は、二値化すると', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 254, '5,016 個になる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 310, '論文はこれが性能を', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 334, '下げる原因になりうると指摘する。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 1 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: direct encoding — order clauses between neighbours (schematic) =====
    var g3 = S.g[2];
    var PXS = [90, 150, 215, 265, 330, 410, 480, 560], PV = ['1.2', '2.0', '2.7', '3.1', '3.8', '4.6', '5.3', '6.0'];
    el('line', { x1: 60, y1: 250, x2: 600, y2: 250, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 330, 330, '特徴量 ' + m('j') + ' の値で並べた点', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.pts3 = PXS.map(function (x, i) {
      var c = el('circle', { cx: x, cy: 250, r: 15, fill: '#fff', stroke: C.muted, 'stroke-width': 2 }, g3);
      txt(g3, x, 292, PV[i], { 'text-anchor': 'middle', 'font-size': 16 });
      return { c: c, x: x };
    });
    S.cut3 = el('line', { x1: 60, y1: 196, x2: 60, y2: 304, stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g3);
    S.arc3 = el('g', {}, g3);
    el('path', { d: 'M330,226 C350,186 390,186 410,226', fill: 'none', stroke: C.ink, 'stroke-width': 1.8 }, S.arc3);
    t2(S.arc3, 370, 166, '隣の対ごとに 1 本の節', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.arc3, 370, 384, 'しきい値 = 3.8（左へ行った点の最大）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    t2(g3, 70, 110, '青：左の子へ（' + m('s') + ' = 真）　白：右の子へ', '', { 'font-size': 16, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '提案の符号化', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 176, 'しきい値は変数にしない。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 220, '値で並べた隣どうしに', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 248, '「大きい点が左なら', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 276, '　小さい点も左」の節。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 330, 'しきい値は解が求まって', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 354, 'から読み出す。', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 — min-depth problem, time in seconds (log scale) =====
    var g4 = S.g[3];
    var LX0 = 230, LW = 340, LMIN = -1, LMAX = Math.log(1800) / Math.LN10;
    function lx(v) { return LX0 + LW * (Math.log(v) / Math.LN10 - LMIN) / (LMAX - LMIN); }
    var TO = 1800;
    var D4 = [['Banknote', 5.82, TO], ['Breast Cancer', 6.59, TO], ['Vertebral Column', 87.35, TO],
              ['User Knowledge', 1.31, 59.44], ['Wine', 0.11, 14.75], ['Car', TO, 89.1]];
    [0.1, 1, 10, 100, 1000].forEach(function (v) {
      el('line', { x1: lx(v), x2: lx(v), y1: 76, y2: 446, stroke: C.hair, 'stroke-width': 1 }, g4);
      txt(g4, lx(v), 470, String(v), { 'text-anchor': 'middle', 'font-size': 15, fill: C.muted });
    });
    el('line', { x1: lx(TO), x2: lx(TO), y1: 76, y2: 446, stroke: C.ink, 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, g4);
    t2(g4, lx(TO), 68, '30 分', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g4, LX0 + LW / 2, 496, '時間（秒、対数目盛）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.bars4 = [];
    D4.forEach(function (d, i) {
      var y = 108 + i * 60;
      txt(g4, LX0 - 14, y + 12, d[0], { 'text-anchor': 'end', 'font-size': 16, 'font-weight': i === 5 ? 400 : 600, fill: i === 5 ? C.muted : C.ink });
      [[d[1], C.b, y - 4], [d[2], C.a, y + 16]].forEach(function (b, k) {
        var w = lx(b[0]) - LX0;
        var rect = el('rect', { x: LX0, y: b[2] - 8, width: 0, height: 16, fill: b[1] }, g4);
        var lab = txt(g4, LX0 + w + 8, b[2] + 6, b[0] === TO ? 'T/O' : String(b[0]), { 'font-size': 15, 'font-weight': 600, fill: b[1] });
        S.bars4.push({ rect: rect, lab: lab, w: w, t0: 25.0 + i * 0.45 + k * 0.15 });
      });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, '最小の深さの問題', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    el('rect', { x: PX, y: 150, width: 22, height: 14, fill: C.b }, p4);
    t2(p4, PX + 32, 163, '提案法', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 180, width: 22, height: 14, fill: C.a }, p4);
    t2(p4, PX + 32, 193, 'Avellaneda（二値化）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 246, 'T/O は 30 分で時間切れ。', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 300, 'Car は二値に近いデータで、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 324, 'ここでは提案法が時間切れ', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 348, 'になった。', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    var tk = el('g', {}, g5);
    el('rect', { x: 140, y: 40, width: 320, height: 70, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 300, 68, 'Banknote の最小の深さの木', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 300, 94, '時間切れ → 5.82 秒', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 500, y: 40, width: 320, height: 70, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 660, 68, 'カテゴリの部分集合で分ける', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 660, 94, '深さ 6 でも解なし → 深さ 4', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 480, 168, 'CP 2021（雑誌版 Constraints 2023）', '', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 1.5 });
    txt(g5, 480, 216, 'SAT-Based Approach for Learning Optimal', { 'font-size': 30, 'font-weight': 650, 'text-anchor': 'middle' });
    txt(g5, 480, 254, 'Decision Trees with Non-Binary Features', { 'font-size': 30, 'font-weight': 650, 'text-anchor': 'middle' });
    t2(g5, 480, 296, '二値でない特徴量をもつデータで最適な決定木を学習する SAT の方法', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 344, 'Pouya Shati, Eldan Cohen, Sheila McIlraith', { 'text-anchor': 'middle' });
    txt(g5, 480, 394, 'doi.org/10.1007/s10601-023-09348-1（雑誌版）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 456, '会議版（CP 2021）から作った非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: arrow, then the binary columns one by one
    var ar = seg(t, 1.2, 2.0);
    S.arrow1.setAttribute('opacity', ar); S.arrowHead1.setAttribute('opacity', ar);
    S.cols1.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.6)); });
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    // scene 2: bars grow
    S.bars2.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 1.0);
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.8, b.t0 + 1.2));
    });
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    // scene 3: the cut sweeps right; points left of it turn blue; then the clause arc
    var cx = 60 + (370 - 60) * seg(t, 16.8, 19.6);
    S.cut3.setAttribute('x1', cx); S.cut3.setAttribute('x2', cx);
    S.pts3.forEach(function (p) {
      var on = p.x < cx;
      p.c.setAttribute('fill', on ? C.b : '#fff');
      p.c.setAttribute('stroke', on ? C.b : C.muted);
    });
    S.arc3.setAttribute('opacity', seg(t, 20.0, 20.7));
    S.p3.setAttribute('opacity', seg(t, 17.2, 18.0));
    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var s = seg(t, b.t0, b.t0 + 0.8);
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
