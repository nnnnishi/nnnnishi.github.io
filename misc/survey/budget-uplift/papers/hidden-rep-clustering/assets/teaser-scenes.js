// =====================================================================
// teaser-scenes.js — Wang et al. (arXiv 2025, HRC), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図): the dots, bars and the number of clusters are toy values
// chosen by the explainer (the paper does not report K). M = 6 discount rates is from the paper.
// Scene 4 uses the numbers printed in Table 2 (arXiv v1).
// Colours: orange = individual-level predictions / two-stage methods; blue = hidden-representation clusters / HRC.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '従来の二段階法は<span class="A">個体ごとに処置ごとの収益とコストを予測</span>してから予算配分を解く。', en: '' },
    { ja: '個体ごとの予測値はノイズで揺れやすく、論文は隠れ表現のほうが揺れにくいと論じる。', en: '' },
    { ja: 'HRC は<span class="B">隠れ表現で個体を K 群に分け</span>、群ごとの平均とばらつきで予算配分を解く。', en: '' },
    { ja: 'Meituan での A/B テストでは、本番の 2 手法より注文数と取引額が高かった。', en: '' },
    { ja: '個体ごとの予測値の代わりに、群の統計値で予算配分を解く。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one row per individual, six predicted bars (one per treatment) =====
    var g1 = S.g[0];
    t2(g1, 80, 52, '個体', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g1, 200, 52, '処置ごとの予測（割引率 5%〜10%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var r1 = rng(5); S.bars1 = [];
    for (var i = 0; i < 8; i++) {
      var y = 88 + i * 46;
      el('circle', { cx: 100, cy: y + 4, r: 11, fill: C.gray }, g1);
      txt(g1, 126, y + 10, m('i') + '=' + (i + 1), { 'font-size': 15, fill: C.muted });
      for (var j = 0; j < 6; j++) {
        var h = 6 + r1() * 16 + j * 1.5;
        var b = el('rect', { x: 200 + j * 62, y: y + 18 - h, width: 40, height: h, rx: 3, fill: C.a }, g1);
        S.bars1.push({ e: b, k: i * 6 + j });
      }
    }
    txt(g1, 100, 466, '⋮', { 'font-size': 22, fill: C.muted, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    txt(p1, PX, 130, m('N') + ' × ' + m('M'), { 'font-size': 38, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 172, '個の予測値を係数にする', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 222, m('N') + '：数千万の個体', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 252, m('M') + ' = 6：割引率の段階', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 302, '予算 ' + m('B') + ' が変わるたびに', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 326, '0-1 計画を解き直す', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（棒の高さは架空の値）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: x + noise -> z (small wobble) -> y (large wobble) =====
    var g2 = S.g[1];
    var cols = [[150, '入力 ' + m('x') + ' + ノイズ ' + m('Δ'), C.gray], [340, '隠れ表現 ' + m('z'), C.b], [530, '出力 ' + m('y'), C.a]];
    cols.forEach(function (c) {
      el('circle', { cx: c[0], cy: 250, r: 82, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      t2(g2, c[0], 370, c[1], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    });
    txt(g2, 245, 258, '→', { 'font-size': 22, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, 245, 226, m('g'), { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, 435, 258, '→', { 'font-size': 22, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, 435, 226, m('f'), { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    S.dots2 = [];
    var r2 = rng(17);
    for (var d = 0; d < 7; d++) {
      var ph = r2() * 6.28, ph2 = r2() * 6.28;
      S.dots2.push({ ph: ph, ph2: ph2,
        x: el('circle', { cx: 150, cy: 250, r: 7, fill: C.muted, opacity: 0.75 }, g2),
        z: el('circle', { cx: 340, cy: 250, r: 7, fill: C.b, opacity: 0.75 }, g2),
        y: el('circle', { cx: 530, cy: 250, r: 7, fill: C.a, opacity: 0.75 }, g2) });
    }
    S.amp = [40, 10, 62];
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '同じ個体でも、データの', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 176, 'ノイズで出力が大きく動く', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX, 240, '‖' + m('z̃') + '−' + m('z') + '‖² ≪ ‖' + m('ỹ') + '−' + m('y') + '‖²', { 'font-size': 24, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 280, '論文の定理 1 の主張', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 304, '（低感度の条件のもと）', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（点の揺れは解説者が描いたもの）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: points in Z space, K-means into 4 groups, group statistics =====
    var g3 = S.g[2];
    el('rect', { x: 70, y: 60, width: 520, height: 425, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
    t2(g3, 86, 88, '隠れ表現 ' + m('Z') + ' の空間', '', { 'font-size': 16, fill: C.muted });
    var centers = [[205, 220], [455, 210], [215, 400], [460, 395]];
    S.hulls = centers.map(function (c, k) {
      var o = {};
      o.ring = el('circle', { cx: c[0], cy: c[1], r: 64, fill: C.bsoft, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g3);
      o.lab = txt(g3, c[0] + 82, c[1] - 44, '群 ' + (k + 1), { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      return o;
    });
    var r3 = rng(29); S.pts3 = [];
    centers.forEach(function (c) {
      for (var q = 0; q < 11; q++) {
        var a = r3() * 6.28, rr = Math.sqrt(r3()) * 50;
        var ex = c[0] + Math.cos(a) * rr, ey = c[1] + Math.sin(a) * rr;
        var sx = 90 + r3() * 480, sy = 110 + r3() * 350;
        S.pts3.push({ ex: ex, ey: ey, sx: sx, sy: sy, c: el('circle', { cx: sx, cy: sy, r: 7, fill: C.gray }, g3) });
      }
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('N') + ' 個体 → ' + m('K') + ' 群', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 160, m('K') + ' ≪ ' + m('N') + '（K-means）', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 210, '群と処置ごとに', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 238, '・収益とコストの平均', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 264, '・そのばらつき', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 290, '・群の人数', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 336, '変数は ' + m('K') + ' × ' + m('M') + ' 個になり、', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 360, '予算ごとの解を表にできる', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '模式図（群の数 4 は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v1), online A/B lift =====
    var g4 = S.g[3];
    var BASE = 440, U = 480;   // px per 1 %
    t2(g4, 70, 58, 'HRC の上乗せ（期間平均）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.2, 0.4, 0.6].forEach(function (v) {
      el('line', { x1: 110, x2: 600, y1: BASE - v * U, y2: BASE - v * U, stroke: C.hair }, g4);
      txt(g4, 100, BASE - v * U + 5, v.toFixed(1) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    el('line', { x1: 110, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var bars = [[150, 0.13, 'OV'], [225, 0.23, 'GMV'], [390, 0.53, 'OV'], [465, 0.65, 'GMV']];
    S.bars4 = bars.map(function (b, i) {
      var o = { v: b[1], t0: 25 + i * 0.8 };
      var gmv = b[2] === 'GMV';
      o.r = el('rect', { x: b[0], y: BASE, width: 62, height: 0, fill: gmv ? C.bsoft : C.b, stroke: C.b, 'stroke-width': 2 }, g4);
      o.lab = txt(g4, b[0] + 31, BASE - b[1] * U - 10, '+' + b[1].toFixed(2) + '%', { 'font-size': 17, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      txt(g4, b[0] + 31, BASE + 24, b[2], { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    t2(g4, 218, BASE + 54, '対 Slearner-HEU', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g4, 458, BASE + 54, '対 DFL-PL', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, '第 1〜2 週：Slearner-HEU', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 146, '第 3〜4 週：DFL-PL', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 172, '（どちらも本番で運用中）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 226, 'コストの差', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 256, '+0.00296 pp', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    txt(p4, PX, 286, '+0.03043 pp', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 336, '信頼区間や検定の結果は', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 358, '論文に示されていない', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 128, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2025';
    ['Hidden Representation Clustering', 'with Multi-Task Representation Learning', 'towards Robust Online Budget Allocation'].forEach(function (s, i) {
      el('text', { x: 480, y: 186 + i * 42, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 330, '多タスク表現学習の隠れ表現をクラスタリングする、頑健なオンライン予算配分', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 378, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Xiaohan Wang · Yu Zhang · Guibin Jiang · Bing Cheng · Wei Lin (Meituan)';
    el('text', { x: 480, y: 428, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2506.00959';
    t2(g5, 480, 476, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars appear row by row, then the panel
    S.bars1.forEach(function (o) { o.e.setAttribute('opacity', seg(t, 0.8 + o.k * 0.06, 1.2 + o.k * 0.06)); });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    // scene 2: noise wobble; x moves, z barely, y a lot (pure function of t)
    var on = seg(t, 9.2, 10.2);
    S.dots2.forEach(function (o) {
      var w = t * 2.1;
      [['x', 150, S.amp[0]], ['z', 340, S.amp[1]], ['y', 530, S.amp[2]]].forEach(function (c) {
        o[c[0]].setAttribute('cx', c[1] + on * c[2] * Math.cos(w + o.ph));
        o[c[0]].setAttribute('cy', 250 + on * c[2] * Math.sin(1.3 * w + o.ph2));
      });
    });
    S.p2.setAttribute('opacity', seg(t, 11, 11.8));
    // scene 3: scattered grey dots move to their cluster, rings appear, dots turn blue
    var mv = seg(t, 17.2, 19.4);
    S.pts3.forEach(function (q) {
      q.c.setAttribute('cx', q.sx + (q.ex - q.sx) * mv);
      q.c.setAttribute('cy', q.sy + (q.ey - q.sy) * mv);
      q.c.setAttribute('fill', H.mix(C.gray, C.b, seg(t, 19.6, 20.4)));
    });
    S.hulls.forEach(function (o, k) {
      var s = seg(t, 19.4 + k * 0.3, 19.9 + k * 0.3);
      o.ring.setAttribute('opacity', s); o.lab.setAttribute('opacity', s);
    });
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    // scene 4: bars grow in order, then the panel
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8), h = o.v * 480 * s;
      o.r.setAttribute('y', 440 - h); o.r.setAttribute('height', h);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
