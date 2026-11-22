// =====================================================================
// teaser-scenes.js — TaQFormer (arXiv 2610.26199v1), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図): grid size, dot positions and attention weights are
// explainer-chosen and do not show the real action set or data. M = 2 and 33 feasible actions are from the paper.
// Scene 4 uses the numbers printed in Table 1 (Qini) and Table 3 (online A/B) of arXiv v1.
// Colours: orange = production baseline (PEPNet, fused treatment vector); blue = TaQFormer.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'これまでの本番モデルはカテゴリごとの割引を<span class="A">1 本の処置ベクトルにまとめて</span>から完了確率を予測していた。', en: '' },
    { ja: '観察データは過去の方策が選んだ組み合わせに偏り、偏りのない RCT データは量が少ない。', en: '' },
    { ja: 'TaQFormer は<span class="B">割引の成分ごとのトークン</span>をクエリにして、リクエストの特徴に交差注意をかける。', en: '' },
    { ja: 'RCT の検証データでは Qini が <span class="A">0.1612</span> から <span class="B">0.2697</span> に上がり、A/B テストでは事業価値が 1.26% 増えた。', en: '' },
    { ja: '割引の組み合わせを成分に分けて問い合わせ、観察データと RCT データを合わせて学習する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function box(g, x, y, w, h, fill, stroke) { return el('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: fill, stroke: stroke || 'none', 'stroke-width': 1.5 }, g); }
  function arrow(g, x1, y1, x2, y2, c) {
    var a = el('g', {}, g);
    el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c || C.muted, 'stroke-width': 2 }, a);
    var ang = Math.atan2(y2 - y1, x2 - x1), s = 9;
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - s * Math.cos(ang - 0.45)) + ',' + (y2 - s * Math.sin(ang - 0.45)) + ' L' + (x2 - s * Math.cos(ang + 0.45)) + ',' + (y2 - s * Math.sin(ang + 0.45)) + ' z', fill: c || C.muted }, a);
    return a;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: PEPNet fuses the discount coordinates into one vector =====
    var g1 = S.g[0];
    t2(g1, 70, 60, '処置 ' + m('a') + ' = (' + m('a') + '₁, ' + m('a') + '₂)', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.chips1 = [0, 1].map(function (j) {
      var g = el('g', {}, g1);
      box(g, 70, 100 + j * 90, 150, 60, '#fff', C.a);
      t2(g, 145, 137 + j * 90, 'カテゴリ ' + (j + 1) + ' の割引', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return g;
    });
    S.fuse1 = el('g', {}, g1);
    arrow(S.fuse1, 222, 130, 290, 168, C.a); arrow(S.fuse1, 222, 220, 290, 182, C.a);
    box(S.fuse1, 296, 150, 170, 50, C.a);
    t2(S.fuse1, 381, 182, '1 本の処置ベクトル', '', { 'font-size': 16, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 600 });
    S.tow1 = el('g', {}, g1);
    arrow(S.tow1, 381, 202, 381, 258);
    box(S.tow1, 296, 262, 170, 56, '#fff', C.ink);
    t2(S.tow1, 381, 296, 'ゲート付き予測塔', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    arrow(S.tow1, 381, 320, 381, 368);
    txt(S.tow1, 381, 400, m('ŷ') + '(' + m('x') + ', ' + m('a') + ')', { 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' });
    box(g1, 70, 280, 150, 60, C.panel);
    t2(g1, 145, 316, 'リクエストの特徴 ' + m('x'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    S.xarr1 = arrow(g1, 222, 300, 292, 290);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '従来の本番モデル（PEPNet）', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 170, '成分の埋め込みを融合して', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 196, '1 本にしてから予測する。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 246, '成分ごとのクエリは', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 272, '持たない。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 330, '実験：' + m('M') + ' = 2 カテゴリ、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 354, '実行可能な組み合わせ 33 通り', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: action grid, biased OBS coverage vs sparse uniform RCT =====
    var g2 = S.g[1];
    var NG = 8, CS = 46, GX = 120, GY = 70;
    t2(g2, GX, GY - 20, '割引の組み合わせ（' + m('a') + '₁ &lt; ' + m('a') + '₂ のみ実行可能）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.cells = [];
    for (var r = 0; r < NG; r++) for (var c = 0; c < NG; c++) {
      var feas = c > r;   // column = a2 index, row = a1 index (deeper = larger)
      el('rect', { x: GX + c * CS, y: GY + r * CS, width: CS - 4, height: CS - 4, rx: 4, fill: feas ? '#fff' : C.panel, stroke: feas ? C.hair : 'none', 'stroke-width': 1.5 }, g2);
      if (feas) S.cells.push([r, c]);
    }
    t2(g2, GX + NG * CS / 2, GY + NG * CS + 26, m('a') + '₂（安いカテゴリの割引）→', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, GX - 14, GY + 16, m('a') + '₁', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, GX - 14, GY + 38, '↓', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var rr = rng(7);
    S.obs = []; S.rct = [];
    // OBS: many dots crowded into a few cells chosen by the historical policy
    var hot = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]];
    for (var i = 0; i < 70; i++) {
      var h = hot[Math.floor(Math.pow(rr(), 1.6) * hot.length)];
      S.obs.push({ c: el('circle', { cx: GX + h[1] * CS + 6 + rr() * (CS - 16), cy: GY + h[0] * CS + 6 + rr() * (CS - 16), r: 3.6, fill: C.a }, g2), k: rr() });
    }
    // RCT: few dots, one or so per feasible cell
    S.cells.forEach(function (cl) {
      if (rr() < 0.72) S.rct.push({ c: el('circle', { cx: GX + cl[1] * CS + 10 + rr() * (CS - 24), cy: GY + cl[0] * CS + 10 + rr() * (CS - 24), r: 5, fill: C.b }, g2), k: rr() });
    });
    var p2 = S.p2 = el('g', {}, g2);
    el('circle', { cx: PX + 8, cy: 120, r: 6, fill: C.a }, p2);
    t2(p2, PX + 24, 126, '観察データ（OBS）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p2, PX + 24, 154, '数千万件、偏りあり', '', { 'font-size': 16, fill: C.ink });
    S.p2b = el('g', {}, g2);
    el('circle', { cx: PX + 8, cy: 214, r: 6, fill: C.b }, S.p2b);
    t2(S.p2b, PX + 24, 220, 'RCT データ', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p2b, PX + 24, 248, '数百万件、ランダム割当て', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2b, PX, 310, '組み合わせの数は', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2b, PX, 336, 'カテゴリ数と割引の段階数に', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2b, PX, 362, '対して組合せ的に増える。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（マスの数と点の位置は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: treatment tokens as queries over feature tokens =====
    var g3 = S.g[2];
    var NF = 8, FX = 100, FY = 80, FD = 48;
    t2(g3, FX - 20, 54, '特徴トークン ' + m('H') + '(' + m('x') + ')', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var fy = [];
    for (var f = 0; f < NF; f++) {
      fy.push(FY + f * FD + 16);
      el('rect', { x: FX, y: FY + f * FD, width: 60, height: 32, rx: 6, fill: C.panel, stroke: C.hair }, g3);
    }
    t2(g3, 360, 54, '処置トークン（クエリ）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    var qy = [190, 290];
    var wr = rng(23);
    S.att = [];
    qy.forEach(function (y, j) {
      for (var f = 0; f < NF; f++) {
        var w = Math.pow(wr(), 2.2);
        S.att.push({ ln: el('line', { x1: 162, y1: fy[f], x2: 300, y2: y + 20, stroke: C.b, 'stroke-width': 1 + 5 * w }, g3), w: w, j: j });
      }
    });
    S.q = qy.map(function (y, j) {
      var g = el('g', {}, g3);
      box(g, 300, y, 120, 40, C.b);
      txt(g, 360, y + 27, m('e') + '<tspan baseline-shift="sub" font-size="13">' + (j + 1) + '</tspan>(' + m('a') + '<tspan baseline-shift="sub" font-size="13">' + (j + 1) + '</tspan>)', { 'font-size': 18, fill: '#fff', 'text-anchor': 'middle' });
      return g;
    });
    S.read3 = el('g', {}, g3);
    arrow(S.read3, 422, 210, 470, 236); arrow(S.read3, 422, 310, 470, 266);
    box(S.read3, 474, 222, 110, 56, '#fff', C.ink);
    t2(S.read3, 529, 256, '読み出し', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    arrow(S.read3, 529, 280, 529, 340);
    txt(S.read3, 529, 372, m('ŷ') + '(' + m('x') + ', ' + m('a') + ')', { 'font-size': 22, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '各成分が、自分に関係する', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 136, '特徴を拾う（交差注意）。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 190, '同じカテゴリに同じ割引なら', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 216, '埋め込みを共有する。', '', { 'font-size': 17, fill: C.ink });
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 280, m('H') + '(' + m('x') + ') は 1 回だけ計算し、', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3b, PX, 306, '33 通りをまとめて採点する。', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3b, PX, 350, 'P99 遅延 34 → 21 ms', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '模式図（線の太さは架空の注意の重み）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 Qini and Table 3 online A/B (arXiv v1) =====
    var g4 = S.g[3];
    var rows = [['PEPNet（本番）', 0.1612, C.a], ['EFIN', 0.2129, C.gray], ['TransTEE', 0.2612, C.gray], ['TaQFormer', 0.2697, C.b]];
    var BX = 250, BW = 300 / 0.3, BY = 110, BD = 70;
    t2(g4, 70, 62, 'Qini（RCT の検証週、Table 1）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.1, 0.2, 0.3].forEach(function (v) {
      el('line', { x1: BX + v * BW, x2: BX + v * BW, y1: BY - 24, y2: BY + BD * 3 + 34, stroke: C.hair }, g4);
      el('text', { x: BX + v * BW, y: BY + BD * 3 + 58, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.bars4 = rows.map(function (rw, i) {
      var y = BY + BD * i, o = {};
      t2(g4, BX - 14, y + 6, rw[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end', 'font-weight': rw[2] === C.gray ? 400 : 600 });
      o.r = el('rect', { x: BX, y: y - 16, width: 0, height: 32, rx: 4, fill: rw[2] }, g4);
      o.v = el('text', { x: BX + rw[1] * BW + 10, y: y + 6, 'font-size': 16, fill: rw[2] === C.gray ? C.muted : rw[2], 'font-weight': 600 }, g4);
      o.v.textContent = rw[1].toFixed(4);
      o.w = rw[1] * BW; o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 96, '14 日間の A/B テスト（Table 3）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 128, '利用者あたりの事業価値の指数', '', { 'font-size': 14, fill: C.muted });
    [['PEPNet', '100.00', '20.43%', C.a], ['RCT のみ', '101.08', '20.45%', C.ink], ['TaQFormer', '101.26', '20.42%', C.b]].forEach(function (rw, i) {
      var y = 176 + i * 50;
      t2(p4, PX, y, rw[0], '', { 'font-size': 16, fill: C.ink });
      txt(p4, PX + 182, y, rw[1], { 'font-size': 22, 'font-weight': 650, fill: rw[3], 'text-anchor': 'end' });
      txt(p4, PX + 272, y, rw[2], { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    t2(p4, PX + 272, 144, '補助金率', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    t2(p4, PX, 350, 'PEPNet = 100。3 つの対比較は', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 372, 'すべて有意（' + m('p') + ' &lt; 0.05）', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1・Table 3（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 128, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2026';
    ['TaQFormer: A Treatment-as-Query Transformer', 'with Data-Fusion for Multidimensional', 'Treatment Modeling in Coupon Allocation'].forEach(function (s, i) {
      el('text', { x: 480, y: 186 + i * 42, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 336, '処置をクエリとして扱い、観察データと RCT データを融合する Transformer', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 384, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jiahong Li, Zeqin Yang, Yu Xiang, et al. (Didi Chuxing)';
    el('text', { x: 480, y: 428, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2610.26199';
    t2(g5, 480, 476, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: chips -> fused vector -> towers -> prediction
    S.fuse1.setAttribute('opacity', seg(t, 1.5, 2.6));
    S.tow1.setAttribute('opacity', seg(t, 3.2, 4.3));
    S.xarr1.setAttribute('opacity', seg(t, 3.2, 4.3));
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // scene 2: OBS dots pile up in a few cells, then RCT dots spread thinly
    S.obs.forEach(function (o) { o.c.setAttribute('opacity', seg(t, 9.2 + o.k * 2.2, 9.6 + o.k * 2.2)); });
    S.rct.forEach(function (o) { o.c.setAttribute('opacity', seg(t, 12 + o.k * 1.8, 12.4 + o.k * 1.8)); });
    S.p2.setAttribute('opacity', seg(t, 9.2, 10));
    S.p2b.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: query tokens appear, attention lines draw (first coordinate, then second), readout
    S.q.forEach(function (q, j) { q.setAttribute('opacity', seg(t, 16.8 + j * 0.6, 17.4 + j * 0.6)); });
    S.att.forEach(function (a) {
      var s = seg(t, 18 + a.j * 1.2, 19 + a.j * 1.2);
      a.ln.setAttribute('opacity', s * (0.15 + 0.85 * a.w));
    });
    S.read3.setAttribute('opacity', seg(t, 20.6, 21.4));
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    S.p3b.setAttribute('opacity', seg(t, 21, 21.8));
    // scene 4: bars grow in order, then the A/B panel
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.9);
      o.r.setAttribute('width', o.w * s);
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.7, o.t0 + 1.1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
