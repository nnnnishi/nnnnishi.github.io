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
// teaser-scenes.js — Levi & Radovanović, Provably Near-Optimal LP-Based Policies for Revenue Management
// in Systems with Reusable Resources (Operations Research 2010). Unofficial explainer.
// Scenes 1 and 3 are schematics (labelled 模式図). Scene 4 plots the guarantee 1 - E(C, C) for unit
// requirements; the values are the explainer's evaluation of the formula (labelled 解説者の計算).
// Colours: orange = admit while capacity is free / blocking; blue = the class selection policy (CSP).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">空きがあれば受ける</span>と、単価の低い依頼が利用時間のあいだ容量をふさぎ、高い依頼を断ることになる。', en: '' },
    { ja: '容量の制約を期待値でだけ課すと、受付の問題は 1 本のナップサック型の LP になる。', en: '' },
    { ja: '<span class="B">CSP</span> は LP の解で客層を、受ける・確率的に受ける・断るの 3 つに分ける。', en: '' },
    { ja: '容量が 1 のときでも最適な収益率の 1/2 以上を保証し、容量が大きいほど保証は 1 に近づく。', en: '' },
    { ja: '使い終わると戻る資源の受付に、LP にもとづく方策で性能保証をつけた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: low-value jobs occupy the units =====
    var g1 = S.g[0], GX = 150, GW = 24;
    T(g1, 80, 96, '容量 3 の資源（横軸は時間）', { 'font-size': 15, fill: C.muted });
    for (var u = 0; u < 3; u++) {
      T(g1, GX - 12, 140 + u * 60 + 6, '資源 ' + (u + 1), { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: GX, y: 120 + u * 60, width: 18 * GW, height: 40, fill: C.panel }, g1);
    }
    var jobs = [[0, 0, 7, '低'], [1, 1, 8, '低'], [2, 2, 9, '低']];
    S.j1 = jobs.map(function (j, k) {
      var gg = el('g', {}, g1);
      el('rect', { x: GX + j[1] * GW, y: 120 + j[0] * 60, width: j[2] * GW - 2, height: 40, rx: 5, fill: C.a }, gg);
      T(gg, GX + j[1] * GW + j[2] * GW / 2, 120 + j[0] * 60 + 26, '単価の' + j[3] + 'い依頼', { 'font-size': 14, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 600 });
      return gg;
    });
    S.x1 = el('g', {}, g1);
    el('rect', { x: GX + 4 * GW, y: 330, width: 6 * GW, height: 40, rx: 5, fill: '#fff', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, S.x1);
    T(S.x1, GX + 7 * GW, 356, '単価の高い依頼', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
    T(S.x1, GX + 10 * GW + 14, 356, '→ 空きがなく失われる', { 'font-size': 15, fill: C.a, 'font-weight': 650 });
    S.p1 = TZ.panel(g1, PX, 140, '再利用資源', C.a, [['使い終わると戻る', 16], ['人員、レンタル、計算機', 16], null, ['断った依頼は', 15, C.muted], ['その場で失われる', 15, C.muted]]);
    TZ.note(g1, '模式図（解説者が置いた例）');

    // ===== scene 2: the LP =====
    var g2 = S.g[1];
    S.lp2 = [
      T(g2, 90, 150, 'max  Σ r_i · α_i · ρ_i', { 'font-size': 24, 'font-weight': 650, fill: C.ink }),
      T(g2, 90, 200, 's.t. Σ α_i · ρ_i · A_i ≤ C', { 'font-size': 24, 'font-weight': 650, fill: C.b }),
      T(g2, 90, 250, '0 ≤ α_i ≤ 1', { 'font-size': 24, 'font-weight': 650, fill: C.ink })
    ];
    S.d2 = TZ.panel(g2, 90, 320, '', C.ink, [['α_i：客層 i の依頼を受ける割合', 16], ['ρ_i = λ_i μ_i：負荷（到着率 × 平均利用時間）', 16], ['A_i：必要な容量、r_i：単位時間あたりの単価', 16]]);
    S.p2 = TZ.panel(g2, PX, 140, '期待値で緩めた LP', C.b, [['容量の制約は', 15], ['期待値で 1 本だけ', 15], null, ['最適な方策の', 15, C.muted], ['収益率の上界になる', 15, C.muted]]);
    TZ.note(g2, '研究報告版の LP');

    // ===== scene 3: CSP =====
    var g3 = S.g[2];
    T(g3, 90, 96, '客層を r_i / A_i の大きい順に並べる', { 'font-size': 15, fill: C.muted });
    var cls = [['客層 1', 1, '受ける'], ['客層 2', 1, '受ける'], ['客層 3', 0.4, '確率 α で受ける'], ['客層 4', 0, '断る'], ['客層 5', 0, '断る']];
    S.c3 = cls.map(function (c, k) {
      var gg = el('g', {}, g3), y = 120 + k * 58;
      T(gg, 90, y + 27, c[0], { 'font-size': 15, fill: C.ink });
      el('rect', { x: 170, y: y + 8, width: 240, height: 28, rx: 4, fill: C.panel }, gg);
      if (c[1] > 0) el('rect', { x: 170, y: y + 8, width: 240 * c[1], height: 28, rx: 4, fill: C.b }, gg);
      T(gg, 426, y + 28, c[2], { 'font-size': 15, fill: c[1] > 0 ? C.b : C.muted, 'font-weight': 600 });
      return gg;
    });
    S.cap3 = T(g3, 90, 438, '容量の期待値が尽きる境目の客層だけが端数の α を持つ', { 'font-size': 16, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, 'CSP', C.b, [['LP の解 α* のとおりに', 15], ['客層を選ぶだけ', 15], null, ['受ける客層も、容量が', 15, C.muted], ['空いているときだけ受ける', 15, C.muted]]);
    TZ.note(g3, '模式図（棒の長さは α*。値は解説者が置いた例）');

    // ===== scene 4: guarantee vs capacity =====
    var g4 = S.g[3];
    T(g4, 70, 64, '必要な容量が 1 でそろう場合の保証 1 − E(C, C)', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var vals = [[1, 0.5], [2, 0.6], [5, 0.715], [10, 0.785], [20, 0.841], [50, 0.895], [100, 0.924]];
    var X0 = 150, X1 = 820, Y0 = 440, Y1 = 110;
    function sx(i) { return X0 + i * (X1 - X0) / (vals.length - 1); }
    function sy(v) { return Y0 - v * (Y0 - Y1); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: sy(v), y2: sy(v), stroke: C.hair, 'stroke-width': 1 }, g4);
      T(g4, X0 - 12, sy(v) + 5, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    S.pts4 = vals.map(function (p, i) {
      var gg = el('g', {}, g4);
      if (i > 0) el('line', { x1: sx(i - 1), y1: sy(vals[i - 1][1]), x2: sx(i), y2: sy(p[1]), stroke: C.b, 'stroke-width': 2.5 }, gg);
      el('circle', { cx: sx(i), cy: sy(p[1]), r: 6, fill: C.b }, gg);
      T(gg, sx(i), sy(p[1]) - 14, p[1].toFixed(3), { 'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      T(g4, sx(i), Y0 + 24, 'C=' + p[0], { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return { g: gg, t0: 24.6 + i * 0.6 };
    });
    TZ.note(g4, '研究報告版の式に C を代入した値（解説者の計算）。横軸は等間隔でない');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['最悪の場合の保証', '最適な収益率の 1/2'], ['容量が大きいとき', '最適に近づく']],
      venue: 'OPERATIONS RESEARCH 2010', title: ['Provably Near-Optimal LP-Based Policies for Revenue', 'Management in Systems with Reusable Resources'], tsize: 26,
      sub: '再利用資源の収益管理のための LP にもとづく方策', authors: ['Retsef Levi, Ana Radovanović'], url: 'doi.org/10.1287/opre.1090.0714'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.j1.forEach(function (j, i) { j.setAttribute('opacity', seg(t, 0.8 + i * 0.6, 1.3 + i * 0.6)); });
    S.x1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.lp2.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 8.6 + i * 0.7, 9.1 + i * 0.7)); });
    S.d2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.c3.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 16.8 + i * 0.5, 17.2 + i * 0.5)); });
    S.cap3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.p3.setAttribute('opacity', seg(t, 20.4, 21.2));
    S.pts4.forEach(function (p) { p.g.setAttribute('opacity', seg(t, p.t0, p.t0 + 0.4)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
