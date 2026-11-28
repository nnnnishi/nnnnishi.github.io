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
// teaser-scenes.js — Gong, Goyal, Iyengar, Simchi-Levi, Udwani, Wang, Online Assortment Optimization with
// Reusable Resources (Management Science 2022). Unofficial explainer.
// All scenes are schematics drawn by the explainer (labelled 模式図). The only number from the paper is
// the competitive ratio 1/2 stated in the abstract. The full text was not read.
// Colours: orange = myopic policy; blue = clairvoyant optimal policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '貸した商品はしばらく使われ、返ってくるとまた貸せる。これが再利用資源である。', en: '' },
    { ja: '<span class="A">近視眼的な方策</span>はいま空いている商品の中から、来た客の期待収益が最大の品揃えを出す。', en: '' },
    { ja: 'いま貸すと、利用が終わるまで後の客に貸せない。近視眼的な方策はこの損失を考えない。', en: '' },
    { ja: 'それでも期待収益は将来をすべて知る<span class="B">最適な方策</span>の 1/2 以上になる。', en: '' },
    { ja: '将来の客も利用時間の分布も使わない方策に、最悪の場合の保証を与えた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  var X0 = 150, X1 = 580;           // timeline x range
  function tx(u) { return X0 + u * (X1 - X0); } // u in [0,1]

  // rows of a gantt chart: [{label, y}] ; returns y list
  function axis(g, labels, y0, dy) {
    labels.forEach(function (l, i) {
      var y = y0 + i * dy;
      T(g, X0 - 14, y + 22, l, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: X0, y: y + 4, width: X1 - X0, height: 28, rx: 4, fill: C.panel }, g);
    });
    el('line', { x1: X0, x2: X1 + 10, y1: y0 + labels.length * dy + 4, y2: y0 + labels.length * dy + 4, stroke: C.ink, 'stroke-width': 1.4 }, g);
    T(g, X1 + 14, y0 + labels.length * dy + 9, '時間', { 'font-size': 14, fill: C.muted });
  }
  function bar(g, row, y0, dy, u0, u1, color, label) {
    var y = y0 + row * dy;
    var r = el('rect', { x: tx(u0), y: y + 4, width: 0, height: 28, rx: 4, fill: color }, g);
    var t = label ? T(g, tx(u0) + 8, y + 23, label, { 'font-size': 13, fill: '#fff', 'font-weight': 600 }) : null;
    return { r: r, t: t, w: tx(u1) - tx(u0) };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: reusable units =====
    var g1 = S.g[0];
    T(g1, 60, 70, '在庫 1 個ずつの商品と、その利用', { 'font-size': 15, fill: C.muted });
    axis(g1, ['商品 A', '商品 B', '商品 C'], 100, 60);
    S.b1 = [
      [bar(g1, 0, 100, 60, 0.05, 0.40, C.gray, '客1'), 1.0],
      [bar(g1, 0, 100, 60, 0.50, 0.85, C.gray, '客4'), 3.4],
      [bar(g1, 1, 100, 60, 0.15, 0.70, C.gray, '客2'), 1.8],
      [bar(g1, 2, 100, 60, 0.30, 0.55, C.gray, '客3'), 2.6],
      [bar(g1, 2, 100, 60, 0.65, 0.95, C.gray, '客5'), 4.2]
    ];
    S.p1 = TZ.panel(g1, PX, 120, '再利用資源', C.ink, [['貸すと利用時間のあいだ', 16], ['ふさがり、終わると戻る', 16], null, ['利用時間は商品ごとの', 15, C.muted], ['分布から決まる', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: myopic offer =====
    var g2 = S.g[1];
    T(g2, 60, 70, '時点 t に客が来た', { 'font-size': 15, fill: C.muted });
    el('circle', { cx: 110, cy: 250, r: 30, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g2);
    T(g2, 110, 256, '客 t', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    var prods = [['A', '収益 高', false], ['B', '収益 中', true], ['C', '収益 低', true]];
    S.items2 = prods.map(function (p, i) {
      var y = 130 + i * 100, gg = el('g', {}, g2);
      el('rect', { x: 260, y: y, width: 200, height: 64, rx: 10, fill: p[2] ? '#fff' : C.panel, stroke: p[2] ? C.ink : C.gray, 'stroke-width': 1.6 }, gg);
      T(gg, 282, y + 28, '商品 ' + p[0], { 'font-size': 16, 'font-weight': 600, fill: p[2] ? C.ink : C.muted });
      T(gg, 282, y + 50, p[1] + (p[2] ? '・空き' : '・貸出中'), { 'font-size': 14, fill: C.muted });
      return gg;
    });
    S.offer2 = el('rect', { x: 248, y: 220, width: 224, height: 188, rx: 14, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g2);
    S.ol2 = T(g2, 480, 320, '見せる品揃え', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '近視眼的な方策', C.a, [['空いている商品の中で', 16], ['この客の期待収益が', 16], ['最大の組を出す', 16], null, ['将来の客も利用時間の', 15, C.muted], ['分布も使わない', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: the cost of lending now =====
    var g3 = S.g[2];
    T(g3, 60, 70, '商品 A（在庫 1 個）', { 'font-size': 15, fill: C.muted });
    axis(g3, ['近視眼的', '最適'], 110, 90);
    S.b3 = [
      [bar(g3, 0, 110, 90, 0.08, 0.62, C.a, '低収益の客に貸す'), 17.0],
      [bar(g3, 1, 110, 90, 0.40, 0.92, C.b, '高収益の客に貸す'), 18.6]
    ];
    S.arr3 = el('g', {}, g3);
    el('line', { x1: tx(0.40), x2: tx(0.40), y1: 96, y2: 300, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, S.arr3);
    T(S.arr3, tx(0.40), 330, '高収益の客が来る', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    S.x3 = T(g3, tx(0.40) + 12, 172, '× 貸せない', { 'font-size': 15, 'font-weight': 650, fill: C.a });
    S.p3 = TZ.panel(g3, PX, 140, 'いま貸すことの損失', C.a, [['先に低収益の客に貸すと、', 15], ['後の高収益の客を逃す', 15], null, ['最適な方策は将来を知るので', 15, C.muted], ['在庫を取っておける', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: guarantee 1/2 =====
    var g4 = S.g[3];
    T(g4, 60, 80, '期待収益（最適な方策を 1 とする）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var BX0 = 220, BX1 = 760;
    el('line', { x1: BX0, x2: BX0, y1: 110, y2: 300, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    T(g4, BX0 - 12, 160, '最適な方策', { 'font-size': 15, fill: C.b, 'text-anchor': 'end' });
    T(g4, BX0 - 12, 250, '近視眼的', { 'font-size': 15, fill: C.a, 'text-anchor': 'end' });
    S.r4a = el('rect', { x: BX0, y: 130, width: 0, height: 44, fill: C.b }, g4);
    S.r4b = el('rect', { x: BX0, y: 220, width: 0, height: 44, fill: C.a }, g4);
    S.w4 = BX1 - BX0;
    S.l4a = T(g4, BX1 + 8, 160, '1', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.l4b = T(g4, BX0 + S.w4 / 2 + 8, 250, '1/2 以上', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.n4 = el('g', {}, g4);
    el('rect', { x: 60, y: 350, width: 840, height: 92, rx: 12, fill: C.panel }, S.n4);
    T(S.n4, 84, 386, '利用時間の分布が客の種類によって変わると、', { 'font-size': 16, fill: C.ink });
    T(S.n4, 84, 418, 'どのオンラインの方策も定数の競争比を持てない（論文の否定的な結果）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    TZ.note(g4, '論文の要旨の結果から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['近視眼的な方策の競争比', '1/2'], ['使う将来の情報', 'なし']],
      venue: 'MANAGEMENT SCIENCE 2022', title: ['Online Assortment Optimization', 'with Reusable Resources'], tsize: 30,
      sub: '再利用できる資源のオンラインの品揃え最適化',
      authors: ['X.-Y. Gong, V. Goyal, G. N. Iyengar,', 'D. Simchi-Levi, R. Udwani, S. Wang'], url: 'doi.org/10.1287/mnsc.2021.4134'
    });
    return S;
  }

  function grow(list, t) {
    list.forEach(function (b) {
      var k = seg(t, b[1], b[1] + 0.9);
      b[0].r.setAttribute('width', b[0].w * k);
      if (b[0].t) b[0].t.setAttribute('opacity', seg(t, b[1] + 0.6, b[1] + 1.0));
    });
  }
  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    grow(S.b1, t);
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.items2.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 8.6 + i * 0.4, 9.0 + i * 0.4)); });
    S.offer2.setAttribute('opacity', seg(t, 10.6, 11.2));
    S.ol2.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    grow(S.b3, t);
    S.arr3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.x3.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 21.0, 21.8));
    S.r4a.setAttribute('width', S.w4 * H.ease(seg(t, 24.6, 25.4)));
    S.r4b.setAttribute('width', S.w4 / 2 * H.ease(seg(t, 25.6, 26.4)));
    S.l4a.setAttribute('opacity', seg(t, 25.2, 25.6));
    S.l4b.setAttribute('opacity', seg(t, 26.2, 26.6));
    S.n4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
