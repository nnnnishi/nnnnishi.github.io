// =====================================================================
// teaser-scenes.js — Jo, Aghaei, Gómez & Vayanos, "Learning Optimal Prescriptive Trees from
// Observational Data" (Management Science 2026; numbers from arXiv 2108.13628 v2), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 draw Example 1 of the paper (P(K=0|healthy) = P(K=1|sick) = 0.9) with 40 schematic people.
// Scene 4 uses the averages stated in the text of Section 4.4.2 (warfarin, conditionally randomised settings).
// Colours: orange = existing prescriptive trees (K-PT, B-PT, per-leaf averages);
//          blue = the proposed IPW / DM / DR objectives optimised by MIO.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '観察データでは病気の人ほど処置を受けている。論文の例 1 では、病気の人の 90% が処置を受け、健康な人の 90% は受けていない。', en: '' },
    { ja: '<span class="A">葉ごとに処置を受けた人の結果を平均する従来法</span>は、雑音の特徴量で分岐する木の価値を 0.9 と見積もり、最適な木（0.6）より上に置いてしまう。', en: '' },
    { ja: '提案法は<span class="B">傾向スコアの逆数で重みづけした推定値</span>を目的にして、深さ d の木全体を混合整数最適化で選ぶ。', en: '' },
    { ja: 'ワルファリンのデータで処置の割当てが無作為でない設定では、従来法の正答率は 51%・48% で、全員に同じ処置を割り当てる方策（約 63%）も下回った。', en: '' },
    { ja: '観察データから処方的な木を学ぶには、葉の中の単純な平均ではなく、偏りを補正した推定値を最適化する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // 40 schematic people: 20 healthy (2 treated), 20 sick (18 treated)
  var R = 11, GAP = 40;
  function group(x0, nTreated) {
    var out = [];
    for (var j = 0; j < 20; j++) out.push({ x: x0 + (j % 5) * GAP, y: 190 + Math.floor(j / 5) * GAP, treated: j >= 20 - nTreated });
    return out;
  }
  var HEALTHY = group(100, 2), SICK = group(380, 18);

  function people(g) {
    var dots = HEALTHY.concat(SICK).map(function (d) {
      return el('circle', { cx: d.x, cy: d.y, r: R, fill: d.treated ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
    });
    t2(g, 180, 150, '健康（' + m('X') + '¹ = 0）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g, 460, 150, '病気（' + m('X') + '¹ = 1）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    return dots;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: observational data =====
    var g1 = S.g[0];
    S.d1 = people(g1);
    el('circle', { cx: 110, cy: 400, r: 9, fill: C.ink }, g1);
    t2(g1, 128, 406, '処置あり', '', { 'font-size': 15, fill: C.ink });
    el('circle', { cx: 240, cy: 400, r: 9, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
    t2(g1, 258, 406, '処置なし', '', { 'font-size': 15, fill: C.ink });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 120, '過去の処置の割当て', '', { 'font-size': 16, fill: C.muted });
    t2(S.p1, PX, 154, '健康な人の 90%：処置なし', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 182, '病気の人の 90%：処置あり', '', { 'font-size': 17, fill: C.ink });
    S.p1b = el('g', {}, g1);
    t2(S.p1b, PX, 246, '最適な方策', '', { 'font-size': 16, fill: C.muted });
    t2(S.p1b, PX, 276, '病気の人だけ処置する', '', { 'font-size': 17, fill: C.ink });
    txt(S.p1b, PX, 334, '0.6', { 'font-size': 44, 'font-weight': 650, fill: C.ink });
    t2(S.p1b, PX + 80, 334, '（真の価値）', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '論文の例 1 を 40 人で描いた模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: K-PT picks the noise split =====
    var g2 = S.g[1];
    var RX = 330, RY = 140, LX = [170, 490], LY = 300;
    LX.forEach(function (x) { el('line', { x1: RX, y1: RY, x2: x, y2: LY - 30, stroke: C.ink, 'stroke-width': 2 }, g2); });
    el('circle', { cx: RX, cy: RY, r: 34, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g2);
    txt(g2, RX, RY + 8, m('X') + '²', { 'font-size': 24, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, RX + 48, RY - 18, '雑音の特徴量', '', { 'font-size': 15, fill: C.muted });
    txt(g2, 225, 212, m('X') + '² = 0', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    txt(g2, 435, 212, m('X') + '² = 1', { 'font-size': 16, fill: C.ink });
    S.leaf2 = LX.map(function (x) {
      var o = {};
      el('rect', { x: x - 80, y: LY - 30, width: 160, height: 60, rx: 10, fill: C.panel }, g2);
      t2(g2, x, LY + 7, '誰も処置しない', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      o.est = el('g', {}, g2);
      t2(o.est, x, LY + 78, 'K-PT の見積もり', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
      txt(o.est, x, LY + 118, '0.9', { 'font-size': 34, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
      o.tru = el('g', {}, g2);
      t2(o.tru, x, LY + 154, '真の値 0.5', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
      return o;
    });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 120, '処置を受けなかった人の', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 146, '大半は健康な人', '', { 'font-size': 17, fill: C.ink });
    S.p2b = el('g', {}, g2);
    t2(S.p2b, PX, 214, '雑音の木の見積もり', '', { 'font-size': 16, fill: C.muted });
    txt(S.p2b, PX, 266, '0.9', { 'font-size': 44, 'font-weight': 650, fill: C.a });
    t2(S.p2b, PX + 80, 266, '真の値 0.5', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2b, PX, 320, m('X') + '¹ で分岐する最適な木', '', { 'font-size': 16, fill: C.muted });
    txt(S.p2b, PX, 366, '0.6', { 'font-size': 36, 'font-weight': 650, fill: C.ink });
    t2(S.p2b, PX, 420, '→ 雑音の木を選ぶ', '', { 'font-size': 18, 'font-weight': 600, fill: C.a });

    // ===== scene 3: inverse propensity weights =====
    var g3 = S.g[2];
    t2(g3, 70, 80, '「誰も処置しない」方策を、処置を受けなかった人で評価する', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.w3h = [];
    for (var j = 0; j < 18; j++) S.w3h.push(el('circle', { cx: 100 + (j % 6) * 40, cy: 180 + Math.floor(j / 6) * 44, r: R, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3));
    S.w3s = [0, 1].map(function (j) { return el('circle', { cx: 440 + j * 100, cy: 224, r: R, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3); });
    t2(g3, 200, 135, '健康で処置なし（18 人）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, 490, 135, '病気で処置なし（2 人）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.w3lab = el('g', {}, g3);
    t2(S.w3lab, 200, 330, '結果 1、重み 1/0.9', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(S.w3lab, 490, 330, '結果 0、重み 1/0.1 = 10', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    S.w3f = el('g', {}, g3);
    txt(S.w3f, 70, 400, '(18 × 1/0.9 × 1 + 2 × 10 × 0) ÷ 40 = 0.5', { 'font-size': 18, fill: C.ink });
    t2(S.w3f, 70, 430, '40 は全員の人数', '', { 'font-size': 14, fill: C.muted });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 120, '重み 1/' + m('μ') + '(' + m('K') + ', ' + m('X') + ')', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 172, '見積もり', '', { 'font-size': 16, fill: C.muted });
    S.est3 = txt(S.p3, PX, 226, '0.9', { 'font-size': 44, 'font-weight': 650, fill: C.a });
    t2(S.p3, PX + 90, 226, '真の値 0.5', '', { 'font-size': 16, fill: C.muted });
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 300, 'この推定値を目的にして', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3b, PX, 326, '深さ ' + m('d') + ' の木全体を', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3b, PX, 352, 'MIO で最適化する', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(g3, 940, 520, '論文の例 1 の数値による模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: warfarin, conditionally randomised (text of Section 4.4.2) =====
    var g4 = S.g[3];
    var rows = [['IPW', 73, C.b], ['DM', 76, C.b], ['K-PT', 51, C.a], ['B-PT', 48, C.a]];
    var BX0 = 170, BX1 = 590, Y0 = 150, RD = 66;
    function bx(v) { return BX0 + v / 100 * (BX1 - BX0); }
    t2(g4, 70, 80, '最適な処置を当てた割合（OOSP）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 20, 40, 60, 80, 100].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 36, y2: Y0 + RD * 3 + 30, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + RD * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + RD * i, o = {};
      txt(g4, BX0 - 14, y + 6, rw[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX0, y: y - 16, width: 0, height: 32, rx: 3, fill: rw[2] }, g4);
      o.lab = el('text', { x: bx(rw[1]) + 8, y: y + 7, 'font-size': 17, fill: C.ink }, g4); o.lab.textContent = rw[1] + '%';
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.7;
      return o;
    });
    S.base4 = el('g', {}, g4);
    el('line', { x1: bx(63), x2: bx(63), y1: Y0 - 36, y2: Y0 + RD * 3 + 30, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, S.base4);
    t2(S.base4, bx(63) + 6, Y0 - 22, '全員に ' + m('K') + ' = 0：約 63%', '', { 'font-size': 15, fill: C.ink });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 130, '提案法の二重頑健法', '', { 'font-size': 16, fill: C.muted });
    t2(S.p4, PX, 184, '80% 弱', '', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 216, '（本文に「80% をやや下回る」）', '', { 'font-size': 14, fill: C.muted });
    t2(S.p4, PX, 280, '深さ 2 の木', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 306, '無作為でない 2 設定の平均', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 332, '処置は 3 段階の用量', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 4.4.2 節の本文の数値（arXiv v2）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'MANAGEMENT SCIENCE · 2026';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Prescriptive Trees';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'from Observational Data';
    t2(g5, 480, 296, '観察データから最適な処方的な木を学習する', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nathanael Jo · Sina Aghaei · Andrés Gómez · Phebe Vayanos';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/mnsc.2021.02813';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots appear group by group
    S.d1.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 0.6 + (i % 20) * 0.08 + (i >= 20 ? 1.2 : 0), 1.0 + (i % 20) * 0.08 + (i >= 20 ? 1.2 : 0))); });
    S.p1.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.p1b.setAttribute('opacity', seg(t, 5, 5.6));
    // scene 2
    S.leaf2.forEach(function (o, i) {
      o.est.setAttribute('opacity', seg(t, 9.6 + i * 0.4, 10.2 + i * 0.4));
      o.tru.setAttribute('opacity', seg(t, 12, 12.6));
    });
    S.p2.setAttribute('opacity', seg(t, 9, 9.6));
    S.p2b.setAttribute('opacity', seg(t, 11, 11.6));
    // scene 3: weights grow, estimate moves from 0.9 to 0.5
    var k = seg(t, 18, 20.5);
    S.w3h.forEach(function (c) { c.setAttribute('r', R * Math.sqrt(1 + (1 / 0.9 - 1) * k)); });
    S.w3s.forEach(function (c) { c.setAttribute('r', R * Math.sqrt(1 + 9 * k)); });
    S.w3lab.setAttribute('opacity', seg(t, 18, 18.6));
    S.w3f.setAttribute('opacity', seg(t, 20.5, 21.1));
    var est = 0.9 - 0.4 * seg(t, 19, 21);
    S.est3.textContent = est.toFixed(2).replace(/0$/, '');
    S.est3.setAttribute('fill', H.mix(C.a, C.b, seg(t, 19, 21)));
    S.p3.setAttribute('opacity', seg(t, 17, 17.6));
    S.p3b.setAttribute('opacity', seg(t, 21.5, 22.1));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.base4.setAttribute('opacity', seg(t, 28, 28.6));
    S.p4.setAttribute('opacity', seg(t, 29, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
