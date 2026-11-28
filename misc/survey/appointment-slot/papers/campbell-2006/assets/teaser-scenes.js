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
      var single = (r.a == null) !== (r.b == null);   // one bar only: centre it in the row
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + (single ? bh / 2 : k[2] * (bh + 2)), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + (single ? bh / 2 : k[2] * (bh + 2)) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
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
// teaser-scenes.js — Campbell & Savelsbergh, Incentive Schemes for Attended Home Delivery Services
// (Transportation Science 2006). Unofficial explainer (published PDF).
// Scenes 1-3 are schematics with explainer-chosen toy values (模式図); scene 4 uses Tables 1, 6, 7.
// Colours: orange = costly slots chosen without incentives; blue = incentive-steered choice.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '客が好きな枠を選ぶままだと、<span class="A">配送費用のかかる枠</span>に注文が入る。', en: '' },
    { ja: '枠ごとに、いまのルートに注文を入れる費用（挿入費用）が違う。', en: '' },
    { ja: '<span class="B">割引</span>を付けると、その枠を選ぶ確率が上がり、ほかの枠の確率が同じだけ下がる。', en: '' },
    { ja: '線形計画で決める割引は割引なしより利益を 12〜15% 増やした。', en: '' },
    { ja: '受付の可否だけでなく、客の選ぶ枠そのものを動かす方向を開いた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var SL = ['9 時', '10 時', '11 時', '12 時', '13 時'];
  var P0 = [0.30, 0.25, 0.20, 0.15, 0.10];      // explainer's toy choice probabilities
  var COST = [9, 7, 2, 6, 8];                   // explainer's toy insertion costs
  var CHEAP = 2, X = 0.2, INC = 0.4;            // toy: $0.4 incentive on slot 3; rate 0.2 per $ as in the paper
  var X0 = 110, BW = 70, GAP = 26, BASE = 420, SC = 700;

  function bars(g, vals, colorOf) {
    return vals.map(function (v, i) {
      var x = X0 + i * (BW + GAP);
      var r = el('rect', { x: x, y: BASE - v * SC, width: BW, height: v * SC, fill: colorOf(i) }, g);
      var lb = el('text', { x: x + BW / 2, y: BASE - v * SC - 8, 'font-size': 15, 'font-weight': 600, fill: colorOf(i) === C.gray ? C.muted : colorOf(i), 'text-anchor': 'middle' }, g);
      lb.textContent = Math.round(v * 100) + '%';
      T(g, x + BW / 2, BASE + 24, SL[i], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lb: lb, v: v, x: x };
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: choice probabilities =====
    var g1 = S.g[0];
    T(g1, 70, 80, '客が各枠を選ぶ確率', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 90, x2: 590, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.b1 = bars(g1, P0, function (i) { return i === 0 || i === 1 ? C.a : C.gray; });
    S.p1 = TZ.panel(g1, PX, 150, '選ぶままにすると', C.a, [['人気の朝の枠に', 15], ['注文が集まる', 15], null, ['需要が読めず、枠は厳しく、', 14, C.muted], ['利幅は小さい', 14, C.muted]]);
    TZ.note(g1, '模式図（確率は解説者が置いた例）');

    // ===== scene 2: insertion costs =====
    var g2 = S.g[1];
    T(g2, 70, 80, '枠ごとの挿入費用 C_t', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 90, x2: 590, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.b2 = COST.map(function (c, i) {
      var x = X0 + i * (BW + GAP), h = c * 28, col = i === CHEAP ? C.b : C.a;
      var r = el('rect', { x: x, y: BASE - h, width: BW, height: h, fill: col, 'fill-opacity': i === CHEAP ? 1 : 0.6 }, g2);
      T(g2, x + BW / 2, BASE + 24, SL[i], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, t0: 8.8 + i * 0.3 };
    });
    S.lb2 = T(g2, X0 + CHEAP * (BW + GAP) + BW / 2, BASE - 2 * 28 - 14, '安い', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 150, '将来の配送費用の見積もり', C.ink, [['いまのルートに', 15], ['注文を入れたときに増える', 15], ['費用を、枠ごとに見る', 15]]);
    TZ.note(g2, '模式図（費用は解説者が置いた例）');

    // ===== scene 3: incentive shifts probability =====
    var g3 = S.g[2];
    T(g3, 70, 80, '11 時の枠に割引 I を付ける', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 90, x2: 590, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.b3 = bars(g3, P0, function (i) { return i === CHEAP ? C.b : C.gray; });
    S.inc3 = T(g3, X0 + CHEAP * (BW + GAP) + BW / 2, 130, '割引', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 150, '確率の動き', C.b, [['割引 1 ドルあたり', 15], ['確率が率 x だけ上がる', 15], ['ほかの枠は同じ量ずつ下がる', 15], null, ['1 つの枠の割引は B まで', 14, C.muted]]);
    TZ.note(g3, '模式図（率 x = 0.2 は論文の基本設定、ほかの値は解説者の例）');

    // ===== scene 4: Tables 1, 6, 7 (pattern 1, average over |U|) =====
    var g4 = S.g[3];
    T(g4, 70, 64, '割引なしに対する利益の改善率（%、論文 Table 1・6・7）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 300, x1: 820, v0: 0, v1: 40, y0: 100, rowH: 104, t0: 24.6, dt: 0.8, ticks: [0, 10, 20, 30, 40],
      rows: [
        { label: '1 時間の枠（基本）', a: 6.11, b: 13.66 },
        { label: '注文をやめうる場合', a: 21.44, b: 36.31 },
        { label: '2 時間の枠への割引', a: 9.77, b: 14.24 }
      ]
    });
    T(g4, 300, 470, '■ 一律の割引 CHPFLT', { 'font-size': 14, fill: C.a });
    T(g4, 500, 470, '■ 線形計画で決める CHPLP', { 'font-size': 14, fill: C.b });
    TZ.note(g4, '確率が均等なパターン 1。論文の表の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['1 時間の枠への割引（Table 1）', '利益 +13.66%'], ['注文をやめうる場合（Table 6）', '利益 +36.31%']],
      venue: 'TRANSPORTATION SCIENCE 2006', title: ['Incentive Schemes for', 'Attended Home Delivery Services'], tsize: 32,
      sub: '在宅受け取りの宅配サービスのためのインセンティブの仕組み', authors: ['Ann Melissa Campbell, Martin Savelsbergh'], url: 'doi.org/10.1287/trsc.1050.0136'
    });
    return S;
  }

  function setBar(b, v) {
    b.r.setAttribute('y', BASE - v * SC); b.r.setAttribute('height', v * SC);
    b.lb.setAttribute('y', BASE - v * SC - 8); b.lb.textContent = Math.round(v * 100) + '%';
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.b1.forEach(function (b, i) { var k = H.ease(seg(t, 1.0 + i * 0.4, 1.7 + i * 0.4)); setBar(b, b.v * k); b.lb.setAttribute('opacity', k); });
    S.p1.setAttribute('opacity', seg(t, 4.2, 5.0));
    S.b2.forEach(function (b) { b.r.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.4)); });
    S.lb2.setAttribute('opacity', seg(t, 10.6, 11.2));
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.2));
    var k3 = seg(t, 18.0, 20.0), up = X * INC * k3;
    S.b3.forEach(function (b, i) { setBar(b, i === CHEAP ? b.v + up : b.v - up / 4); });
    S.inc3.setAttribute('opacity', seg(t, 17.2, 17.8));
    S.p3.setAttribute('opacity', seg(t, 20.2, 21.0));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
