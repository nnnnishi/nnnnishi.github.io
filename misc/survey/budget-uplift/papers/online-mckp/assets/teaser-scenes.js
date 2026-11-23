// =====================================================================
// teaser-scenes.js — Albert & Goldenberg (CIKM 2022), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the Discounts row of Table 2 (arXiv v2).
// Colours: orange = Global / Local / Greedy; blue = the paper's MCKP method (efficiency angle threshold).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '1 つの割引を全員に出すやり方では、どの割引も純収益を減らすので、<span class="A">予算 0 では何も出せない</span>。', en: '' },
    { ja: '顧客ごとに損失の出ない候補だけを選ぶと、ある顧客で浮いた予算を別の顧客に回せない。', en: '' },
    { ja: '論文の方法は増分を<span class="B">効率角</span>で並べ、しきい値以上の増分を足した位置の候補を選ぶ。', en: '' },
    { ja: 'Booking.com の割引データでは、<span class="B">オンライン手法</span>が予算 0 の条件で最適値の 99.75% を得た。', en: '' },
    { ja: '顧客が来るたびに、予算の残りに合わせて効率のしきい値を決め直す。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one discount for everybody; every discount loses net revenue =====
    var g1 = S.g[0];
    var BASE = 300;   // y of zero
    el('line', { x1: 70, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, 70, 60, '全員に同じ割引を出したときの効果', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars1 = [['割引 小', 50, 40], ['割引 中', 90, 80], ['割引 大', 120, 130]].map(function (d, i) {
      var x = 110 + i * 165, o = {};
      o.v = el('rect', { x: x, y: BASE, width: 50, height: 0, rx: 3, fill: C.gray }, g1);
      o.w = el('rect', { x: x + 58, y: BASE, width: 50, height: 0, rx: 3, fill: C.a }, g1);
      o.hv = d[1]; o.hw = d[2];
      txt(g1, x + 54, BASE + 30, d[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      o.x = txt(g1, x + 83, BASE - d[2] - 14, '✕', { 'font-size': 22, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
      return o;
    });
    el('rect', { x: 110, y: 380, width: 16, height: 16, rx: 3, fill: C.gray }, g1);
    t2(g1, 134, 394, '購入の増分', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: 260, y: 380, width: 16, height: 16, rx: 3, fill: C.a }, g1);
    t2(g1, 284, 394, '純収益の減少', '', { 'font-size': 15, fill: C.ink });
    t2(g1, 600, BASE - 8, '予算 0', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, 'Global', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 156, '1 つの割引を全員に出す', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 206, '実験では 3 種類とも購入は', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 232, '増えたが、純収益は減った。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 282, '予算 0 を満たす割引がなく、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 308, '誰にも出さないことになる。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 360, '最適値に対する割合', '', { 'font-size': 15, fill: C.muted });
    txt(p1, PX, 400, '0.0%', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 428, '（Discounts、Table 2）', '', { 'font-size': 14, fill: C.muted });
    t2(g1, 600, 520, '模式図（棒の長さは架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: four customers on the value-weight plane, Local vs optimum (budget 0) =====
    var g2 = S.g[1];
    var O = { A: [[-2, 1], [1, 2.5]], B: [[-1, 0.5], [2, 2]], C: [[1.5, 2], [3, 3]], D: [[1, 1.5], [-0.5, -1]] };
    var loc = [[-2, 1], [-1, 0.5], [0, 0], [0, 0]], opt = [[-2, 1], [-1, 0.5], [1.5, 2], [1, 1.5]];
    var W0 = -2.6, W1 = 3.6, V0 = -1.5, V1 = 3.5, X0 = 80, X1 = 600, Y0 = 470, Y1 = 70;
    function sx2(w) { return X0 + (w - W0) / (W1 - W0) * (X1 - X0); }
    function sy2(v) { return Y0 - (v - V0) / (V1 - V0) * (Y0 - Y1); }
    el('rect', { x: X0, y: Y1, width: sx2(0) - X0, height: sy2(0) - Y1, fill: C.panel }, g2);
    el('line', { x1: X0, x2: X1, y1: sy2(0), y2: sy2(0), stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: sx2(0), x2: sx2(0), y1: Y0, y2: Y1, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, X1, sy2(0) + 26, '重み（純収益の減少）→', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, sx2(0) + 10, Y1 + 4, '↑ 価値（購入の増分）', '', { 'font-size': 16, fill: C.ink });
    t2(g2, X0 + 10, Y1 + 28, '重み ≤ 0', '', { 'font-size': 14, fill: C.muted });
    Object.keys(O).forEach(function (k) {
      O[k].forEach(function (p) {
        el('circle', { cx: sx2(p[0]), cy: sy2(p[1]), r: 9, fill: C.gray }, g2);
        txt(g2, sx2(p[0]) + 13, sy2(p[1]) - 8, k, { 'font-size': 16, fill: C.muted });
      });
    });
    el('circle', { cx: sx2(0), cy: sy2(0), r: 9, fill: '#fff', stroke: C.muted, 'stroke-width': 2 }, g2);
    function rings(list, col) {
      var g = el('g', {}, g2), seen = {};
      list.forEach(function (p) {
        var key = p.join(); if (seen[key]) return; seen[key] = 1;
        el('circle', { cx: sx2(p[0]), cy: sy2(p[1]), r: 16, fill: 'none', stroke: col, 'stroke-width': 3.5 }, g);
      });
      return g;
    }
    S.loc2 = rings(loc, C.a); S.opt2 = rings(opt, C.b);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 110, '予算 0、顧客 4 人', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.l2 = el('g', {}, p2);
    t2(S.l2, PX, 160, 'Local：顧客ごとに、重み ≤ 0', '', { 'font-size': 16, fill: C.a });
    t2(S.l2, PX, 184, 'で価値が最大の候補', '', { 'font-size': 16, fill: C.a });
    t2(S.l2, PX, 216, '価値の合計 1.5', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    S.o2 = el('g', {}, p2);
    t2(S.o2, PX, 272, '最適解：A と B で浮いた分で', '', { 'font-size': 16, fill: C.b });
    t2(S.o2, PX, 296, 'C と D に重みが正の候補', '', { 'font-size': 16, fill: C.b });
    t2(S.o2, PX, 328, '価値の合計 5.0', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(g2, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: incremental vectors, efficiency angle threshold sweeping down =====
    var g3 = S.g[2];
    var inc = [[-0.5, 0.4], [1.5, 1.1], [0.8, 0.3], [1.6, 0.25]];
    var OX = 330, OY = 400, U = 160;
    S.ox = OX; S.oy = OY;
    el('line', { x1: 80, x2: 620, y1: OY, y2: OY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: OX, x2: OX, y1: 470, y2: 70, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 620, OY + 26, '重みの増分 →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, OX + 10, 74, '↑ 価値の増分', '', { 'font-size': 16, fill: C.ink });
    var cp = el('clipPath', { id: 'clip3' }, g3);
    el('rect', { x: 80, y: 70, width: 540, height: 400 }, cp);
    S.wedge = el('path', { d: '', fill: C.bsoft, 'clip-path': 'url(#clip3)' }, g3);
    g3.insertBefore(S.wedge, g3.firstChild);
    S.vec3 = inc.map(function (p, i) {
      var a = Math.atan2(p[1], p[0]), o = { a: a };
      var x = OX + p[0] * U, y = OY - p[1] * U;
      o.ln = el('line', { x1: OX, y1: OY, x2: x, y2: y, stroke: C.gray, 'stroke-width': 5, 'stroke-linecap': 'round' }, g3);
      o.dot = el('circle', { cx: x, cy: y, r: 8, fill: C.gray }, g3);
      o.lab = txt(g3, x + (p[0] < 0 ? -14 : 12), y - 10, (i + 1) + '（' + Math.round(a * 180 / Math.PI) + '°）', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': p[0] < 0 ? 'end' : 'start' });
      return o;
    });
    S.thr = el('line', { x1: OX, y1: OY, x2: OX, y2: OY, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '1 人の顧客の、支配されない', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 134, '候補 4 つの増分', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 190, 'しきい値', '', { 'font-size': 16, fill: C.muted });
    S.thTxt = txt(p3, PX, 232, '', { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 290, '選ぶ候補', '', { 'font-size': 16, fill: C.muted });
    S.pickTxt = txt(p3, PX, 332, '', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 386, '予算に余裕があるほど', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 410, 'しきい値が下がり、重みの', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 434, '大きい候補まで進む。', '', { 'font-size': 15, fill: C.ink });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2, Discounts row (arXiv v2) =====
    var g4 = S.g[3];
    var rows = [['Global', 0.0, '0.0%', C.a], ['Local', 37.0, '37.0%', C.a], ['Greedy', 65.79, '65.79%', C.a], ['Online', 99.75, '99.75%', C.b], ['Offline', 100, '>99.99%', C.b]];
    var BX = 190, BW = 380, Y4 = 120, DY = 66;
    t2(g4, 70, 62, '最適値（ILP）に対する価値の合計の割合', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: BX + BW, x2: BX + BW, y1: Y4 - 30, y2: Y4 + DY * 4 + 30, stroke: C.hair, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g4);
    txt(g4, BX + BW, Y4 + DY * 4 + 52, '100%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.rows4 = rows.map(function (r, i) {
      var y = Y4 + DY * i, o = { full: BW * r[1] / 100, t0: 25 + i * 0.8 };
      txt(g4, BX - 16, y + 6, r[0], { 'font-size': 18, 'font-weight': 600, fill: r[3], 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX, y: y - 16, width: 0, height: 32, rx: 4, fill: r[3] }, g4);
      o.lab = el('text', { x: BX + 8, y: y + 6, 'font-size': 17, 'font-weight': 600, fill: C.ink }, g4);
      o.lab.textContent = r[2];
      o.inside = r[1] > 60;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'Discounts データ', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 136, '20 万人・選択肢 4・予算 0', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 190, 'Local より', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 90, 192, '+170%', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 238, 'Greedy より', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 90, 240, '+51%', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 300, '価値と重みはアップリフト', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 322, 'モデルの予測値。実配布での', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 344, '比較ではない。', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM 2022';
    ['E-Commerce Promotions Personalization', 'via Online Multiple-Choice Knapsack', 'with Uplift Modeling'].forEach(function (s, i) {
      el('text', { x: 480, y: 186 + i * 42, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 340, 'アップリフトモデリングとオンライン多肢選択ナップザックによる EC プロモーションの個別化', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 388, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Javier Albert · Dmitri Goldenberg';
    el('text', { x: 480, y: 436, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3511808.3557100';
    t2(g5, 480, 480, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, then crosses
    S.bars1.forEach(function (o, i) {
      var s = seg(t, 0.8 + i * 0.6, 2.2 + i * 0.6);
      o.v.setAttribute('height', o.hv * s); o.v.setAttribute('y', 300 - o.hv * s);
      o.w.setAttribute('height', o.hw * s); o.w.setAttribute('y', 300 - o.hw * s);
      o.x.setAttribute('opacity', seg(t, 4 + i * 0.3, 4.4 + i * 0.3));
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: Local rings, then optimum rings
    S.loc2.setAttribute('opacity', seg(t, 9.5, 10.2) * (1 - 0.75 * seg(t, 12.6, 13.2)));
    S.l2.setAttribute('opacity', seg(t, 9.8, 10.5));
    S.opt2.setAttribute('opacity', seg(t, 12.6, 13.3));
    S.o2.setAttribute('opacity', seg(t, 12.9, 13.6));
    S.p2.setAttribute('opacity', seg(t, 9, 9.6));
    // scene 3: threshold sweeps from 140 deg down to 15 deg
    var k = H.ease ? H.ease(seg(t, 17.5, 22)) : seg(t, 17.5, 22);
    var th = (140 - 125 * k) * Math.PI / 180, R = 300;
    S.thr.setAttribute('x2', S.ox + R * Math.cos(th)); S.thr.setAttribute('y2', S.oy - R * Math.sin(th));
    S.thr.setAttribute('opacity', seg(t, 17, 17.5));
    var pick = 0;
    S.wedge.setAttribute('d', wedgePath(S.ox, S.oy, th, 600));
    S.wedge.setAttribute('opacity', seg(t, 17, 17.5));
    S.vec3.forEach(function (o, i) {
      var on = o.a >= th - 1e-9;
      if (on) pick = i + 1;
      var c = on ? C.b : C.gray;
      o.ln.setAttribute('stroke', c); o.dot.setAttribute('fill', c); o.lab.setAttribute('fill', on ? C.b : C.muted);
    });
    S.thTxt.innerHTML = Math.round(th * 180 / Math.PI) + '°';
    S.pickTxt.innerHTML = '候補 ' + pick;
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.5));
    // scene 4: bars grow in order
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.full * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
      o.lab.setAttribute('x', o.inside ? 190 + o.full - 10 : 190 + o.full * s + 10);
      o.lab.setAttribute('text-anchor', o.inside ? 'end' : 'start');
      o.lab.setAttribute('fill', o.inside ? '#fff' : C.ink);
    });
    S.p4.setAttribute('opacity', seg(t, 29.2, 30));
  }

  // region of angles >= th, clipped to the half-plane drawing area (polygon around the origin)
  function wedgePath(ox, oy, th, R) {
    var pts = [[ox, oy], [ox + R * Math.cos(th), oy - R * Math.sin(th)]];
    // walk counter-clockwise from th to pi in steps
    for (var a = th; a < Math.PI; a += 0.05) pts.push([ox + R * Math.cos(a), oy - R * Math.sin(a)]);
    pts.push([ox - R, oy]);
    return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + ' Z';
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
