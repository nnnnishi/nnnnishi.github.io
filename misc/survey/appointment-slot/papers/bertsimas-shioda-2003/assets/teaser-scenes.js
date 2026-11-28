// ---- shared helpers for the appointment-slot explainer teasers (Japanese-only pages) ----
window.TZ = (function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  function T(g, x, y, s, attrs) { return H.t2(g, x, y, s, '', attrs || {}); }
  // explanation column: title + lines [[text, size?, fill?, weight?], ...]
  function panel(g, x, y, title, color, lines) {
    var p = el('g', {}, g), yy = y;
    if (title) { T(p, x, yy, title, { 'font-size': 18, 'font-weight': 650, fill: color || C.ink }); yy += 44; }
    lines.forEach(function (l) {
      if (l === null) { yy += 22; return; }
      if (typeof l === 'string') l = [l];
      T(p, x, yy, l[0], { 'font-size': l[1] || 16, fill: l[2] || C.ink, 'font-weight': l[3] || 400 });
      yy += (l[1] || 16) + 10;
    });
    return p;
  }
  // paired horizontal bars (orange vs blue) on a common linear axis
  // o: {x0, x1, v0, v1, y0, rowH, rows:[{label, a, b, la, lb}], t0, dt, ticks:[..], fmt}
  function pairs(g, o) {
    var sc = function (v) { return o.x0 + (v - o.v0) / (o.v1 - o.v0) * (o.x1 - o.x0); };
    var yEnd = o.y0 + o.rows.length * o.rowH;
    (o.ticks || []).forEach(function (v) {
      el('line', { x1: sc(v), x2: sc(v), y1: o.y0 - 8, y2: yEnd, stroke: C.hair, 'stroke-width': 1 }, g);
      el('text', { x: sc(v), y: yEnd + 22, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.fmt ? o.fmt(v) : String(v);
    });
    el('line', { x1: o.x0, x2: o.x0, y1: o.y0 - 8, y2: yEnd, stroke: C.ink, 'stroke-width': 1.5 }, g);
    var items = [];
    o.rows.forEach(function (r, i) {
      var y = o.y0 + i * o.rowH, bh = (o.rowH - 14) / 2;
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + k[2] * (bh + 2), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + k[2] * (bh + 2) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
        lab.textContent = r['l' + k[0]] || String(r[k[0]]);
        items.push({ rect: rect, lab: lab, w: sc(r[k[0]]) - o.x0, t0: o.t0 + i * (o.dt || 0.5) + k[2] * 0.25 });
      });
    });
    return items;
  }
  function renderBars(items, t) {
    items.forEach(function (b) {
      b.rect.setAttribute('width', Math.max(0, b.w * H.ease(seg(t, b.t0, b.t0 + 0.7))));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }
  // title card: o = {cards:[[label, value]...], venue, title:[l1,l2], sub, authors:[..lines], url}
  function title(g, o) {
    var n = o.cards.length, w = 300, gap = 60, x = 480 - (n * w + (n - 1) * gap) / 2;
    o.cards.forEach(function (c, i) {
      var cx = x + i * (w + gap);
      el('rect', { x: cx, y: 40, width: w, height: 70, rx: 12, fill: C.bsoft }, g);
      T(g, cx + w / 2, 68, c[0], { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      T(g, cx + w / 2, 96, c[1], { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = o.venue;
    o.title.forEach(function (l, i) {
      el('text', { x: 480, y: 220 + i * 40, 'font-size': o.tsize || 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = l;
    });
    var y = 220 + o.title.length * 40;
    T(g, 480, y + 2, o.sub, { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    o.authors.forEach(function (a, i) {
      el('text', { x: 480, y: y + 50 + i * 26, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = a;
    });
    el('text', { x: 480, y: y + 60 + o.authors.length * 26 + 20, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.url;
    T(g, 480, 512, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }
  function note(g, s) { return T(g, 940, 520, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); }
  function fades(gs, B, t) {
    gs.forEach(function (g, i) {
      var a = B[i], b = B[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
  }
  // a small binary tree drawn from a nested spec: {l:'B', y:[..], n:[..]} or {leaf:'1'}
  // returns {g, nodes:[{el, depth}], edges:[...]} ; dx halves per level
  function tree(g, spec, x, y, dx, dy, color) {
    var out = { nodes: [], edges: [] };
    (function rec(s, x, y, dx, d) {
      if (s.leaf != null) {
        var r = el('rect', { x: x - 20, y: y - 16, width: 40, height: 32, rx: 6, fill: '#fff', stroke: color, 'stroke-width': 1.8 }, g);
        var tx = el('text', { x: x, y: y + 6, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g); tx.textContent = s.leaf;
        out.nodes.push({ el: r, tx: tx, d: d, leaf: true });
        return;
      }
      [[s.yes, -1, '1'], [s.no, 1, '0']].forEach(function (c) {
        var e = el('line', { x1: x, y1: y + 18, x2: x + c[1] * dx, y2: y + dy - 18, stroke: color, 'stroke-width': 1.8 }, g);
        var lb = el('text', { x: x + c[1] * dx / 2 + c[1] * 10, y: y + dy / 2 + 4, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g); lb.textContent = c[2];
        out.edges.push({ el: e, lb: lb, d: d });
        rec(c[0], x + c[1] * dx, y + dy, dx / 2, d + 1);
      });
      var ci = el('circle', { cx: x, cy: y, r: 20, fill: color }, g);
      var tx = el('text', { x: x, y: y + 6, 'font-size': 17, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g); tx.textContent = s.l;
      out.nodes.push({ el: ci, tx: tx, d: d });
    })(spec, x, y, dx, 0);
    return out;
  }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree };
})();
// =====================================================================
// teaser-scenes.js — Bertsimas & Shioda, Restaurant Revenue Management (Operations Research 2003).
// Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy seatings (labelled 模式図). Scene 4 uses the revenue
// changes relative to FCFS (FullNest) in the no-reservation results table of the paper.
// Colours: orange = first-come-first-served seating; blue = optimisation-based seating.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">先着順</span>で 2 人客を 8 人用のテーブルに通すと、あとから来た 8 人客が入れない。', en: '' },
    { ja: '<span class="B">整数計画</span>はテーブルを 15 分の時間帯ごとに押さえ、滞在時間ぶんの席を見込んで案内を決める。', en: '' },
    { ja: '<span class="B">近似動的計画法</span>はいま案内した場合と待たせた場合のこの先の価値を比べる。', en: '' },
    { ja: '混雑時のシミュレーションでは、収益が先着順より 13.13% 上がった。', en: '' },
    { ja: '席を「テーブル×時間」の資源として配る、サービス業の収益管理の例。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var GX = 150, GW = 26, NCOL = 16, PX = 640;

  // a seating chart: rows = tables, columns = 15-minute periods 18:00-22:00
  function chart(g, y0, rows) {
    rows.forEach(function (r, i) {
      var y = y0 + i * 62;
      T(g, GX - 14, y + 30, r, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      for (var c = 0; c < NCOL; c++) el('rect', { x: GX + c * GW, y: y + 8, width: GW - 2, height: 36, fill: C.panel }, g);
    });
    ['18時', '19時', '20時', '21時', '22時'].forEach(function (s, k) {
      T(g, GX + k * 4 * GW, y0 - 6, s, { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    });
  }
  function block(g, y0, row, c0, len, color, label, dashed) {
    var y = y0 + row * 62, gg = el('g', {}, g);
    var a = { x: GX + c0 * GW, y: y + 8, width: len * GW - 2, height: 36, rx: 5, fill: dashed ? '#fff' : color };
    if (dashed) { a.stroke = color; a['stroke-width'] = 2; a['stroke-dasharray'] = '6 4'; }
    el('rect', a, gg);
    T(gg, GX + c0 * GW + len * GW / 2, y + 31, label, { 'font-size': 14, 'font-weight': 600, fill: dashed ? color : '#fff', 'text-anchor': 'middle' });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: FCFS blocks the large table =====
    var g1 = S.g[0], Y1 = 110;
    chart(g1, Y1, ['2人用', '2人用', '4人用', '8人用']);
    S.b1 = [block(g1, Y1, 0, 0, 4, C.gray, '2人'), block(g1, Y1, 1, 1, 4, C.gray, '2人'), block(g1, Y1, 2, 0, 5, C.gray, '4人')];
    S.b1x = block(g1, Y1, 3, 2, 4, C.a, '2人を案内');
    S.b1y = el('g', {}, g1);
    T(S.b1y, GX - 14, Y1 + 4 * 62 + 30, '19時に8人客', { 'font-size': 15, fill: C.a, 'text-anchor': 'end', 'font-weight': 600 });
    block(S.b1y, Y1, 4, 4, 7, C.a, '8人用が埋まっていて入れない', true);
    S.p1 = TZ.panel(g1, PX, 140, '先着順（業界の慣行）', C.a, [['来た順に、入れる最小の', 16], ['テーブルへ案内する', 16], null, ['2 人で平均 51 分、', 15, C.muted], ['8 人で平均 102 分', 15, C.muted]]);
    TZ.note(g1, '模式図（予約表は解説者が置いた例）');

    // ===== scene 2: the IP reserves table-periods =====
    var g2 = S.g[1], Y2 = 110;
    chart(g2, Y2, ['2人用', '2人用', '4人用', '8人用']);
    S.b2 = [
      block(g2, Y2, 0, 0, 4, C.b, '2人'), block(g2, Y2, 1, 1, 4, C.b, '2人'), block(g2, Y2, 2, 0, 5, C.b, '4人'),
      block(g2, Y2, 0, 4, 4, C.b, '2人'), block(g2, Y2, 3, 3, 7, C.b, '8人（見込み）'), block(g2, Y2, 1, 5, 4, C.b, '2人')
    ];
    S.p2 = TZ.panel(g2, PX, 120, '来店・退店のたびに解く IP', C.b, [['各時間帯で、使用中の', 15], ['テーブル数 ≤ 卓数', 15], null, ['案内の値：', 15, C.muted], ['R_k − M·待ち − α·(k′−k)', 15, C.ink, 600], null, ['同じ人数の中では先着順', 15, C.muted]]);
    TZ.note(g2, '模式図（R_k：収益、M：待ちの重み、α：大きい席の重み）');

    // ===== scene 3: ADP compares seat-now vs wait =====
    var g3 = S.g[2];
    el('circle', { cx: 140, cy: 270, r: 34, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3);
    T(g3, 140, 276, '2人客', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    S.o3 = [
      { y: 170, t: '8人用に案内する', v: 'R_k − α(8−2) + IP(S_u)', c: C.a },
      { y: 330, t: '案内しない（待たせる）', v: 'IP(S_0)', c: C.b }
    ].map(function (o, i) {
      var gg = el('g', {}, g3);
      el('line', { x1: 176, y1: 270, x2: 250, y2: o.y + 30, stroke: C.muted, 'stroke-width': 1.6 }, gg);
      el('rect', { x: 250, y: o.y, width: 330, height: 64, rx: 10, fill: '#fff', stroke: o.c, 'stroke-width': 2 }, gg);
      T(gg, 266, o.y + 26, o.t, { 'font-size': 15, 'font-weight': 600, fill: o.c });
      T(gg, 266, o.y + 50, o.v, { 'font-size': 15, fill: C.ink });
      return gg;
    });
    S.c3 = T(g3, 250, 440, '大きい方を選ぶ。IP の最適値をこの先の価値の近似に使う', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, '近似動的計画法（ADP）', C.b, [['グループが来たら、', 15], ['入れる各テーブルと', 15], ['「案内しない」を比べる', 15], null, ['予約がある店では、', 15, C.muted], ['予約客と飛び込み客で', 15, C.muted], ['待ちの上限を分ける', 15, C.muted]]);
    TZ.note(g3, '模式図（論文の式 19 を簡略化）');

    // ===== scene 4: revenue change vs FCFS =====
    var g4 = S.g[3];
    T(g4, 70, 64, '先着順（FullNest）に対する収益の増加（予約なし、来店が一定）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 260, X1 = 800, VMAX = 15;
    function sx(v) { return X0 + v / VMAX * (X1 - X0); }
    [0, 5, 10, 15].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 92, y2: 452, stroke: C.hair, 'stroke-width': 1 }, g4);
      T(g4, sx(v), 474, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: X0, x2: X0, y1: 92, y2: 452, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var data = [['混雑度 低（0.68）', [0.11, 2.11]], ['混雑度 中（0.93）', [0.41, 2.35]], ['混雑度 高（1.54）', [7.83, 13.13]]];
    S.bars4 = [];
    data.forEach(function (d, i) {
      var y0 = 104 + i * 118;
      T(g4, X0 - 14, y0 + 44, d[0], { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      ['IP', 'ADP'].forEach(function (nm, k) {
        var y = y0 + k * 44;
        var rect = el('rect', { x: X0, y: y + 8, width: 0, height: 30, fill: C.b, 'fill-opacity': k === 0 ? 0.45 : 1 }, g4);
        var lab = el('text', { x: sx(d[1][k]) + 8, y: y + 29, 'font-size': 14, 'font-weight': 600, fill: C.b }, g4);
        lab.textContent = nm + ' ' + d[1][k].toFixed(2) + '%';
        S.bars4.push({ rect: rect, lab: lab, w: sx(d[1][k]) - X0, t0: 24.6 + i * 1.1 + k * 0.35 });
      });
    });
    TZ.note(g4, '論文の表（FullNest に対する収益の差）から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['混雑時の収益（ADP、予約なし）', '+13.13%'], ['予約ありの実店舗データ', '+3.42% / +7.26%']],
      venue: 'OPERATIONS RESEARCH 2003', title: ['Restaurant Revenue Management'], tsize: 34,
      sub: 'レストランの収益管理', authors: ['Dimitris Bertsimas, Romy Shioda'], url: 'Operations Research 51(3), 472–486'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.b1.forEach(function (b, i) { b.setAttribute('opacity', seg(t, 0.8 + i * 0.4, 1.3 + i * 0.4)); });
    S.b1x.setAttribute('opacity', seg(t, 2.6, 3.2));
    S.b1y.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.b2.forEach(function (b, i) { b.setAttribute('opacity', seg(t, 8.6 + i * 0.6, 9.1 + i * 0.6)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.o3.forEach(function (o, i) { o.setAttribute('opacity', seg(t, 16.8 + i * 1.2, 17.4 + i * 1.2)); });
    S.c3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
