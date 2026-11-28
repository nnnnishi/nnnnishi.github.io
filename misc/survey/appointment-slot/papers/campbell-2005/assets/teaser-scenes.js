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
// teaser-scenes.js — Campbell & Savelsbergh, Decision Support for Consumer Direct Grocery Initiatives
// (Transportation Science 2005). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy maps (labelled 模式図). Scene 4 uses Tables 1-2.
// Colours: orange = SLOT (per-slot order caps), the problem; blue = insertion-based acceptance (REG etc.).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '実務では時間枠ごとに<span class="A">受ける件数の上限</span>を決めて注文を受けていた。', en: '' },
    { ja: '上限の中でも、遠い客を受けると約束した枠の中で回りきれなくなる。', en: '' },
    { ja: '<span class="B">提案法</span>は受けた注文と将来の注文をルートに入れてみて、受けるかと枠を決める。', en: '' },
    { ja: '客がまばらな地域では、利益が件数の上限の 223 から REG で 376 に増えた。', en: '' },
    { ja: '受けた後の配送ルートを見て受付を決める、時間枠管理の出発点になった研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var DEPOT = [320, 300];
  var PTS = [[200, 200], [250, 160], [180, 290], [430, 210], [400, 380], [260, 400], [520, 120]];

  function map(g) {
    el('rect', { x: 80, y: 90, width: 500, height: 380, rx: 12, fill: '#fff', stroke: C.hair }, g);
    el('rect', { x: DEPOT[0] - 14, y: DEPOT[1] - 14, width: 28, height: 28, fill: C.ink }, g);
    T(g, DEPOT[0], DEPOT[1] + 34, '拠点', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: slot caps =====
    var g1 = S.g[0];
    T(g1, 70, 80, '1 時間の時間枠ごとの受付（上限 2 件）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var slots = ['9–10 時', '10–11 時', '11–12 時', '12–13 時'];
    var fill = [2, 2, 1, 2];
    S.c1 = [];
    slots.forEach(function (s, i) {
      var y = 130 + i * 80;
      T(g1, 90, y + 32, s, { 'font-size': 15, fill: C.ink });
      for (var k = 0; k < 2; k++) {
        el('rect', { x: 220 + k * 90, y: y + 8, width: 76, height: 40, rx: 6, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g1);
        if (k < fill[i]) S.c1.push({ r: el('rect', { x: 220 + k * 90, y: y + 8, width: 76, height: 40, rx: 6, fill: C.a }, g1), t0: 1.0 + (i * 2 + k) * 0.3 });
      }
      var lab = T(g1, 420, y + 34, fill[i] === 2 ? '満' : '空きあり', { 'font-size': 15, fill: fill[i] === 2 ? C.a : C.muted });
      S.c1.push({ r: lab, t0: 3.6 + i * 0.2 });
    });
    S.p1 = TZ.panel(g1, PX, 150, '件数の上限（SLOT）', C.a, [['上限の中なら受ける', 15], null, ['配送ルートに入るか、', 15, C.muted], ['利益が出るかは見ない', 15, C.muted]]);
    TZ.note(g1, '模式図（上限 2 件は論文の実験の SLOT の設定）');

    // ===== scene 2: far customer breaks the route =====
    var g2 = S.g[1];
    map(g2);
    S.d2 = PTS.slice(0, 5).map(function (p, i) { return { c: el('circle', { cx: p[0], cy: p[1], r: 11, fill: C.gray }, g2), t0: 8.6 + i * 0.2 }; });
    S.r2 = el('polyline', { points: [DEPOT, PTS[0], PTS[1], PTS[3], PTS[4], DEPOT].map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 5' }, g2);
    S.far2 = el('circle', { cx: PTS[6][0], cy: PTS[6][1], r: 13, fill: C.a }, g2);
    S.farl2 = T(g2, PTS[6][0] - 20, PTS[6][1] + 40, '枠に空きはあるが遠い', { 'font-size': 14, fill: C.a, 'text-anchor': 'end', 'font-weight': 600 });
    S.p2 = TZ.panel(g2, PX, 150, '上限では防げない', C.a, [['受けた注文を全部、', 15], ['約束した枠で届けられるか', 15], ['（VRPTW が解けるか）は', 15], ['件数では分からない', 15]]);
    TZ.note(g2, '模式図（客の位置は解説者が置いた例）');

    // ===== scene 3: insertion of accepted + future (probability-weighted) requests =====
    var g3 = S.g[2];
    map(g3);
    PTS.slice(0, 5).forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 11, fill: C.gray }, g3); });
    S.fut3 = [[150, 360], [470, 300], [220, 120]].map(function (p, i) {
      return { c: el('circle', { cx: p[0], cy: p[1], r: 11, fill: '#fff', stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '3 3' }, g3), t0: 17.0 + i * 0.3 };
    });
    S.new3 = el('circle', { cx: PTS[5][0], cy: PTS[5][1], r: 13, fill: C.b }, g3);
    S.r3 = el('polyline', { points: [DEPOT, PTS[0], PTS[1], PTS[3], PTS[4], PTS[5], [150, 360], PTS[2], DEPOT].map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: C.b, 'stroke-width': 2.4 }, g3);
    T(g3, 100, 450, '● 受けた注文　○ 来そうな注文（確率で重み）　● 新しい注文', { 'font-size': 14, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 150, '挿入して判断', C.b, [['DYN：入るなら受ける', 15], ['PATH：経路の期待の長さ', 15], ['REG：周りの将来の需要', 15], null, ['乱択の挿入を 4 回くり返し、', 14, C.muted], ['最も利益の高いルートを使う', 14, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: Tables 1-2 =====
    var g4 = S.g[3];
    T(g4, 70, 64, '利益（基本の設定、論文 Table 1・2）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 300, x1: 820, v0: 0, v1: 700, y0: 110, rowH: 120, t0: 24.6, dt: 1.0, ticks: [0, 200, 400, 600],
      rows: [
        { label: 'まばら（60×60）', a: 223.14, b: 376.35, la: 'SLOT 223.14', lb: 'REG 376.35' },
        { label: '密（30×30）', a: 510.24, b: 668.92, la: 'SLOT 510.24', lb: 'REG 668.92' }
      ]
    });
    T(g4, 300, 410, '入るかだけを見る DYN：まばら 335.36、密 659.27', { 'font-size': 14, fill: C.muted });
    T(g4, 300, 438, '全注文を知った場合（BEST）：まばら 416.08、密 682.99', { 'font-size': 14, fill: C.muted });
    TZ.note(g4, '論文 Table 1・2 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['まばらな地域の利益', '223 → 376'], ['密な地域の利益', '510 → 669']],
      venue: 'TRANSPORTATION SCIENCE 2005', title: ['Decision Support for Consumer', 'Direct Grocery Initiatives'], tsize: 32,
      sub: '消費者直販の食料品宅配のための意思決定支援', authors: ['Ann Melissa Campbell, Martin W. P. Savelsbergh'], url: 'doi.org/10.1287/trsc.1040.0105'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.c1.forEach(function (c) { c.r.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.3)); });
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    S.d2.forEach(function (d) { d.c.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.3)); });
    S.r2.setAttribute('opacity', seg(t, 9.8, 10.4));
    S.far2.setAttribute('opacity', seg(t, 10.8, 11.2));
    S.farl2.setAttribute('opacity', seg(t, 11.2, 11.6));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    S.fut3.forEach(function (f) { f.c.setAttribute('opacity', seg(t, f.t0, f.t0 + 0.3)); });
    S.new3.setAttribute('opacity', seg(t, 18.2, 18.6));
    S.r3.setAttribute('opacity', seg(t, 19.0, 19.8));
    S.p3.setAttribute('opacity', seg(t, 20.0, 20.8));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
