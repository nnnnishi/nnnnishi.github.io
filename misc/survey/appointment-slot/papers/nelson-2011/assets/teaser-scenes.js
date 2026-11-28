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
// teaser-scenes.js — Nelson et al., Visual scheduling to improve workflow and throughput in the University of
// Virginia Health System Pediatric Specialty Clinic (IEEE SIEDS 2011). Unofficial explainer written from the
// abstract (body not read). All diagrams are schematics with explainer-chosen toy schedules (labelled 模式図);
// the abstract reports no numbers, so there is no result chart.
// Colours: orange = decentralised per-specialty scheduling; blue = combined visual schedule.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">診療科ごとの予約担当者</span>が自分の科の予約表だけを見て予約を入れていた。', en: '' },
    { ja: '外来全体で見ると負荷が時間帯によって偏り、資源の無駄と患者の遅れにつながる。', en: '' },
    { ja: '<span class="B">提案</span>は全医師の予約を一つの画面に合わせ、外来全体の負荷を担当者に見せる。', en: '' },
    { ja: '画面はヒューマンファクターの設計原則で作り、合意した予約の指針と組み合わせて使う。', en: '' },
    { ja: '予約担当者に全体を見せて判断を助ける、運用面の工夫。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  // toy bookings: rows = specialties, cols = 6 time blocks (1 = booked)
  var BOOK = [[1, 1, 0, 0, 1, 0], [1, 1, 1, 0, 0, 0], [1, 0, 1, 0, 0, 1], [1, 1, 0, 0, 0, 0]];
  var NAMES = ['科 A', '科 B', '科 C', '科 D'];
  var HOURS = ['9', '10', '11', '13', '14', '15'];

  function grid(g, x0, y0, color, rows) {
    var cells = [];
    rows.forEach(function (r, i) {
      T(g, x0 - 12, y0 + i * 52 + 26, NAMES[i], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      BOOK[i].forEach(function (v, j) {
        var c = el('rect', { x: x0 + j * 62, y: y0 + i * 52 + 6, width: 56, height: 32, rx: 4, fill: v ? color : C.panel, 'fill-opacity': v ? 0.8 : 1 }, g);
        cells.push({ el: c, i: i, j: j });
      });
    });
    HOURS.forEach(function (h, j) { T(g, x0 + j * 62 + 28, y0 - 10, h + '時', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    return cells;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: each scheduler sees one row =====
    var g1 = S.g[0];
    S.c1 = grid(g1, 150, 130, C.a, BOOK);
    S.mask1 = [];
    for (var i = 0; i < 4; i++) {
      var m = el('rect', { x: 140, y: 130 + i * 52 + 2, width: 384, height: 40, rx: 6, fill: 'none', stroke: C.a, 'stroke-width': 2.4 }, g1);
      S.mask1.push(m);
    }
    T(g1, 150, 370, '担当者ごとに見えるのは 1 行だけ', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '分散した予約', C.a, [['診療科ごとに', 15], ['別々に予約を入れ、', 15], ['科どうしの調整も足りない', 15]]);
    TZ.note(g1, '模式図（予約の配置は解説者が置いた例）');

    // ===== scene 2: clinic-wide load =====
    var g2 = S.g[1];
    T(g2, 80, 100, '外来全体の負荷（4 科の予約を時間帯ごとに数えた例）', { 'font-size': 15, fill: C.muted });
    var load = [0, 0, 0, 0, 0, 0];
    BOOK.forEach(function (r) { r.forEach(function (v, j) { load[j] += v; }); });
    S.cols2 = load.map(function (v, j) {
      var x = 120 + j * 76, h = v * 55;
      var r = el('rect', { x: x, y: 380, width: 56, height: 0, fill: v >= 3 ? C.a : C.gray }, g2);
      T(g2, x + 28, 404, HOURS[j] + '時', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      var lb = T(g2, x + 28, 372 - h, String(v), { 'font-size': 15, 'font-weight': 600, fill: v >= 3 ? C.a : C.muted, 'text-anchor': 'middle' });
      return { r: r, h: h, lb: lb, t0: 8.6 + j * 0.3 };
    });
    el('line', { x1: 110, x2: 590, y1: 380, y2: 380, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.p2 = TZ.panel(g2, PX, 140, '外来全体では偏る', C.a, [['朝に予約が重なり、', 15], ['昼前と午後は空く', 15], null, ['要旨：資源の非効率な使い方と', 14, C.muted], ['患者の不要な遅れ', 14, C.muted]]);
    TZ.note(g2, '模式図（数は上の例から数えたもの）');

    // ===== scene 3: combined visual schedule =====
    var g3 = S.g[2];
    S.c3 = grid(g3, 150, 130, C.b, BOOK);
    S.sum3 = el('g', {}, g3);
    T(S.sum3, 138, 368, '合計', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    load.forEach(function (v, j) {
      el('rect', { x: 150 + j * 62, y: 346, width: 56, height: 32, rx: 4, fill: C.b, 'fill-opacity': 0.15 + 0.2 * v }, S.sum3);
      T(S.sum3, 178 + j * 62, 368, String(v), { 'font-size': 15, 'font-weight': 600, fill: v >= 3 ? '#fff' : C.b, 'text-anchor': 'middle' });
    });
    S.p3 = TZ.panel(g3, PX, 140, '全医師の予約を一画面に', C.b, [['担当者は自分の判断が', 15], ['外来全体の負荷に', 15], ['どう効くかを見られる', 15]]);
    TZ.note(g3, '模式図（論文の画面ではない）');

    // ===== scene 4: design principles + guidelines (no numbers in the abstract) =====
    var g4 = S.g[3];
    var boxes = [['ヒューマンファクターの', '設計原則で画面を作る'], ['関係者が合意した', '予約の指針'], ['資源の使い方と', '患者の体験の改善']];
    S.b4 = boxes.map(function (b, i) {
      var gg = el('g', {}, g4), x = 70 + i * 290;
      el('rect', { x: x, y: 170, width: 240, height: 110, rx: 12, fill: i < 2 ? C.bsoft : '#fff', stroke: C.b, 'stroke-width': 1.6, 'stroke-dasharray': i === 2 ? '6 4' : 'none' }, gg);
      T(gg, x + 120, 218, b[0], { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      T(gg, x + 120, 248, b[1], { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      if (i < 2) T(gg, x + 265, 232, i === 0 ? '＋' : '→', { 'font-size': 26, fill: C.ink, 'text-anchor': 'middle' });
      return { g: gg, t0: 24.6 + i * 1.2 };
    });
    T(g4, 70, 340, '右の箱は要旨が「改善できる可能性がある」と述べる効果。要旨に数値の評価はない', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '要旨の内容を図にしたもの');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['問題', '分散した予約'], ['提案', '全医師の予約を一画面に']],
      venue: 'IEEE SIEDS 2011', title: ['Visual Scheduling to Improve Workflow and', 'Throughput in the University of Virginia Health', 'System Pediatric Specialty Clinic'], tsize: 25,
      sub: '予約を目に見える形にして外来の流れを改善する', authors: ['C. E. Nelson, T. R. Nobbee, M. F. Wellman,', 'J. C. Moore, M. J. Vilhauer, M. C. Smith'], url: 'doi.org/10.1109/SIEDS.2011.5876860'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    var row = Math.min(3, Math.max(0, Math.floor((t - 1.5) / 1.3)));
    S.c1.forEach(function (c) { c.el.setAttribute('opacity', t < 1.5 ? 0.25 : (c.i === row ? 1 : 0.18)); });
    S.mask1.forEach(function (m, i) { m.setAttribute('opacity', t >= 1.5 && i === row ? 1 : 0); });
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.cols2.forEach(function (c) {
      var k = seg(t, c.t0, c.t0 + 0.7);
      c.r.setAttribute('height', c.h * k); c.r.setAttribute('y', 380 - c.h * k);
      c.lb.setAttribute('opacity', seg(t, c.t0 + 0.6, c.t0 + 0.9));
    });
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    S.c3.forEach(function (c) { c.el.setAttribute('opacity', seg(t, 16.4 + c.i * 0.3, 16.8 + c.i * 0.3)); });
    S.sum3.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.p3.setAttribute('opacity', seg(t, 19.4, 20.2));
    S.b4.forEach(function (b) { b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.6)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
