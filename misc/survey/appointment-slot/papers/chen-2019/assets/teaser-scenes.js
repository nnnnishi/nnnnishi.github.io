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
// teaser-scenes.js — Chen, Hong, Hou, Shao, Healthcare scheduling policies in a sequence-number based
// appointment system for outpatients' arrivals: Early, on time, or late? (Comput. Ind. Eng., 2019).
// Unofficial explainer. Based only on the abstract and bibliographic records (full text not read).
// Every scene is a schematic drawn by the explainer (labelled 模式図). The shape of the plateau-dome pattern
// and the waiting-time values are not known, so neither is drawn.
// Colours: orange = uniform pattern / common late-arrival policies; blue = plateau-dome / three-queue.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;
  // ---- per-page animation kit: fade-ins and growing bars, all pure functions of t ----
  var FADE = [], GROW = [];
  function fin(e, t0, d) { FADE.push({ e: e, t0: t0, d: d || 0.6 }); e.setAttribute('opacity', 0); return e; }
  function grow(rect, attr, full, t0, d) { GROW.push({ e: rect, a: attr, v: full, t0: t0, d: d || 0.8 }); rect.setAttribute(attr, 0); return rect; }
  function runKit(t) {
    FADE.forEach(function (f) { f.e.setAttribute('opacity', seg(t, f.t0, f.t0 + f.d)); });
    GROW.forEach(function (g) { g.e.setAttribute(g.a, Math.max(0, g.v * H.ease(seg(t, g.t0, g.t0 + g.d)))); });
  }
  function box(g, x, y, w, h, fill, stroke, rx) {
    return el('rect', { x: x, y: y, width: w, height: h, rx: rx == null ? 6 : rx, fill: fill || '#fff', stroke: stroke || 'none', 'stroke-width': stroke ? 1.6 : 0 }, g);
  }
  function arrow(g, x1, y1, x2, y2, color) {
    var c = color || C.muted, a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    var gg = el('g', {}, g);
    el('line', { x1: x1, y1: y1, x2: x2 - Math.cos(a) * 4, y2: y2 - Math.sin(a) * 4, stroke: c, 'stroke-width': 2 }, gg);
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - s * Math.cos(a - 0.45)) + ',' + (y2 - s * Math.sin(a - 0.45)) + ' L' + (x2 - s * Math.cos(a + 0.45)) + ',' + (y2 - s * Math.sin(a + 0.45)) + 'Z', fill: c }, gg);
    return gg;
  }

  var CAPTIONS = [
    { ja: '番号制の外来予約では、患者は順番の番号を受け取り、番号の順に診察を受ける。来る時刻は患者が決める。', en: '' },
    { ja: '患者は前回の待ち時間などの経験から期待を更新し、次に来る時刻を変える（適応的期待）。', en: '' },
    { ja: '比べたのは、予約の割り振り方 2 つ（<span class="A">均等</span>と <span class="B">plateau-dome</span>）と、遅刻への対応 3 つ。', en: '' },
    { ja: '要旨によれば、<span class="B">plateau-dome と 3 つの列を使う対応</span>が、ほかより待ち時間を減らした。', en: '' },
    { ja: '患者の到着行動まで含めて、番号制の予約の割り振り方を比べた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;

  function ticket(g, x, y, n, color) {
    var gg = el('g', {}, g);
    box(gg, x, y, 52, 40, '#fff', color || C.ink, 6);
    T(gg, x + 26, y + 27, String(n), { 'font-size': 17, 'font-weight': 650, fill: color || C.ink, 'text-anchor': 'middle' });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: numbered patients arrive early / on time / late =====
    var g1 = S.g[0];
    T(g1, 70, 92, '診察の順番（番号）と、実際に来た時刻', { 'font-size': 15, fill: C.muted });
    var X0 = 120, X1 = 580;
    el('line', { x1: X0, x2: X1, y1: 420, y2: 420, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, X1, 446, '時刻 →', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    var pts = [[1, -0.6, '早い'], [2, 0.0, '時間どおり'], [3, 0.9, '遅れ'], [4, -0.3, '早い'], [5, 0.1, '時間どおり']];
    pts.forEach(function (p, i) {
      var y = 120 + i * 58, xe = X0 + 80 + i * 80;
      ticket(g1, 64, y, p[0]);
      el('line', { x1: xe, x2: xe, y1: y + 20, y2: 420, stroke: C.hair, 'stroke-dasharray': '4 4' }, g1);
      var xa = xe + p[1] * 60;
      var c = el('circle', { cx: xa, cy: y + 20, r: 9, fill: p[1] > 0.5 ? C.a : C.ink }, g1);
      fin(c, 1.0 + i * 0.45, 0.4);
      fin(T(g1, xa + 14, y + 26, p[2], { 'font-size': 14, fill: p[1] > 0.5 ? C.a : C.muted }), 1.2 + i * 0.45, 0.4);
    });
    fin(T(g1, X0 + 40, 410, '点線：番号から見た目安の時刻（解説者の例）', { 'font-size': 14, fill: C.muted }), 3.6);
    fin(TZ.panel(g1, PX, 150, '番号制の予約', C.ink, [['予約に順番の番号を', 16], ['割り当てる', 16], null, ['患者は早く来ることも、', 15, C.muted], ['遅れて来ることもある', 15, C.muted]]), 4.2, 0.8);
    TZ.note(g1, '模式図（解説者が置いた例）');

    // ===== scene 2: adaptive expectations =====
    var g2 = S.g[1];
    var steps = [['前回', '長く待った'], ['期待を更新', '次は待つだろう'], ['今回', '遅めに来る']];
    steps.forEach(function (s, i) {
      var x = 70 + i * 180, gg = el('g', {}, g2);
      box(gg, x, 200, 150, 100, i === 1 ? C.bsoft : '#fff', i === 1 ? C.b : C.ink, 10);
      T(gg, x + 75, 238, s[0], { 'font-size': 16, 'font-weight': 650, fill: i === 1 ? C.b : C.ink, 'text-anchor': 'middle' });
      T(gg, x + 75, 268, s[1], { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      fin(gg, 8.6 + i * 1.0);
      if (i < 2) fin(arrow(g2, x + 154, 250, x + 176, 250, C.muted), 9.1 + i * 1.0);
    });
    fin(arrow(g2, 505, 310, 145, 310, C.muted), 12.0);
    fin(T(g2, 325, 340, '次の来院でも繰り返す', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }), 12.0);
    fin(TZ.panel(g2, PX, 150, '患者の行動のモデル', C.b, [['限定合理性：', 15, C.ink, 600], ['限られた情報で判断する', 15], null, ['適応的期待：', 15, C.ink, 600], ['過去の経験から予想を', 15], ['更新する', 15]]), 12.6, 0.8);
    TZ.note(g2, '模式図（箱の中身は解説者の例）');

    // ===== scene 3: what is compared =====
    var g3 = S.g[2];
    T(g3, 70, 92, '予約の割り振り方（時間帯ごとの予約数）', { 'font-size': 15, fill: C.muted });
    var ga = el('g', {}, g3);
    T(ga, 70, 126, '均等（uniform）', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    for (var k = 0; k < 6; k++) box(ga, 70 + k * 36, 150, 28, 60, C.a, null, 3);
    fin(ga, 16.6);
    var gb = el('g', {}, g3);
    T(gb, 340, 126, 'plateau-dome', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    box(gb, 340, 140, 220, 70, C.bsoft, C.b, 8);
    T(gb, 450, 172, '形は本文未読のため', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    T(gb, 450, 194, '描かない', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    fin(gb, 17.4);
    T(g3, 70, 270, '遅刻への対応（late arrival policy）', { 'font-size': 15, fill: C.muted });
    var pa = el('g', {}, g3);
    box(pa, 70, 290, 230, 110, '#FCEBDF', C.a, 10);
    T(pa, 185, 335, 'よく使われる', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    T(pa, 185, 362, '2 つの方策', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    fin(pa, 18.8);
    var pb = el('g', {}, g3);
    box(pb, 340, 290, 220, 110, C.bsoft, C.b, 10);
    T(pb, 450, 322, 'three-queue', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    for (var q = 0; q < 3; q++) {
      for (var r = 0; r < 4; r++) el('circle', { cx: 380 + r * 22, cy: 344 + q * 18, r: 6, fill: C.b }, pb);
      T(pb, 480, 349 + q * 18, '列 ' + (q + 1), { 'font-size': 14, fill: C.b });
    }
    fin(pb, 19.6);
    fin(TZ.panel(g3, PX, 150, '2 × 3 の組み合わせ', C.ink, [['割り振り方 2 つと', 16], ['遅刻への対応 3 つを', 16], ['組み合わせて比べる', 16], null, ['評価は待ち時間', 15, C.muted]]), 20.4, 0.8);
    TZ.note(g3, '模式図（3 つの列の中身は本文未読）');

    // ===== scene 4: qualitative result =====
    var g4 = S.g[3];
    T(g4, 70, 92, '待ち時間を減らしたのは（要旨の結論）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    [['割り振り方', '均等', 'plateau-dome'], ['遅刻への対応', 'よく使われる 2 つ', 'three-queue']].forEach(function (r, i) {
      var y = 140 + i * 140, gg = el('g', {}, g4);
      T(gg, 70, y + 20, r[0], { 'font-size': 15, fill: C.muted });
      box(gg, 70, y + 36, 210, 60, '#FCEBDF', null, 10);
      T(gg, 175, y + 72, r[1], { 'font-size': 16, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
      T(gg, 312, y + 74, '→', { 'font-size': 26, fill: C.ink, 'text-anchor': 'middle' });
      box(gg, 345, y + 36, 210, 60, C.b, null, 10);
      T(gg, 450, y + 72, r[2], { 'font-size': 16, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 650 });
      fin(gg, 24.6 + i * 1.2);
    });
    fin(T(g4, 70, 450, '右（青）のほうが待ち時間が短い。差の大きさは要旨に書かれていない', { 'font-size': 14, fill: C.muted }), 27.2);
    TZ.note(g4, '要旨の記述のみ（数値なし）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['予約の割り振り方', 'plateau-dome'], ['遅刻への対応', 'three-queue']],
      venue: 'COMPUTERS & INDUSTRIAL ENGINEERING · 2019', title: ['Healthcare scheduling policies in a', 'sequence-number based appointment system', "for outpatients' arrivals"], tsize: 28,
      sub: '番号制の外来予約での予約方策（副題：Early, on time, or late?）', authors: ['Pei-Sheng Chen, I-Hsuan Hong, Yi Hou, Yu-Chao Shao'], url: 'doi.org/10.1016/j.cie.2019.02.033'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
