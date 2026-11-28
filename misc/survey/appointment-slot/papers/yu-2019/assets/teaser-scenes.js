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
// teaser-scenes.js — Yu, Xing, Tan, Ren, Li, Doctor-Patient Combined Matching Problem and its Solving
// Algorithms (IEEE Access, 2019). Unofficial explainer. Based only on the abstract and bibliographic
// records (full text not read). Every scene is a schematic drawn by the explainer (labelled 模式図);
// no result number is known, so none is drawn.
// Colours: orange = one-patient-at-a-time treatment; blue = MTM grouping and the DPCMP matching.
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
    { ja: '中国の大病院では受診が難しく、医師と患者の対立も目立つ。医師は<span class="A">患者を 1 人ずつ</span>診ている。', en: '' },
    { ja: '<span class="B">多患者診療モード（MTM）</span>：第 1 段階で、似た症状の患者をグループにまとめる。', en: '' },
    { ja: '第 2 段階で最適な組み合わせ方を求める。数理モデルを作り、改良した蟻コロニー最適化で解く。', en: '' },
    { ja: '要旨によれば、例題で提案したアルゴリズムの有効性とよい性能を確かめた。', en: '' },
    { ja: '医師と患者の組み合わせを、症状のグループ分けと最適化で決める研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;
  var COLS = ['#1D4ED8', '#0A7F86', '#8250DF'];

  function person(g, x, y, fill) {
    var gg = el('g', {}, g);
    el('circle', { cx: x, cy: y - 12, r: 8, fill: fill }, gg);
    el('path', { d: 'M' + (x - 12) + ',' + (y + 14) + ' q12,-24 24,0 Z', fill: fill }, gg);
    return gg;
  }
  function doctor(g, x, y, label) {
    var gg = el('g', {}, g);
    box(gg, x - 40, y - 26, 80, 52, '#fff', C.ink, 8);
    T(gg, x, y + 6, label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    var R = H.rng(7), sym = [];
    for (var i = 0; i < 12; i++) sym.push(i % 3);

    // ===== scene 1: long queues, one patient at a time =====
    var g1 = S.g[0];
    ['医師 1', '医師 2', '医師 3'].forEach(function (d, k) {
      var y = 150 + k * 110;
      doctor(g1, 520, y, d);
      for (var j = 0; j < 7; j++) fin(person(g1, 430 - j * 46, y + 4, C.a), 0.6 + j * 0.2 + k * 0.1, 0.3);
    });
    fin(TZ.panel(g1, PX, 150, '1 人ずつの診察', C.a, [['大病院に患者が集まり、', 16], ['受診が難しい', 16], null, ['医師と患者の対立も', 15, C.muted], ['課題になっている', 15, C.muted]]), 3.4, 0.8);
    TZ.note(g1, '模式図（人数は解説者が置いた例）');

    // ===== scene 2: grouping by similar symptoms =====
    var g2 = S.g[1];
    T(g2, 70, 92, '患者の症状（色）', { 'font-size': 15, fill: C.muted });
    S.p2 = sym.map(function (s, i) {
      var x0 = 100 + R() * 420, y0 = 130 + R() * 260;
      var p = person(g2, 0, 0, COLS[s]);
      return { e: p, x0: x0, y0: y0, x1: 110 + s * 170 + (Math.floor(i / 3) % 4) * 32, y1: 330 };
    });
    S.grp2 = [0, 1, 2].map(function (s) {
      var r = box(g2, 90 + s * 170, 296, 148, 64, 'none', COLS[s], 12);
      r.setAttribute('stroke-width', 2); r.setAttribute('stroke-dasharray', '6 4');
      fin(r, 12.0, 0.5);
      fin(T(g2, 164 + s * 170, 390, 'グループ ' + (s + 1), { 'font-size': 15, fill: COLS[s], 'text-anchor': 'middle', 'font-weight': 600 }), 12.2, 0.5);
      return r;
    });
    fin(TZ.panel(g2, PX, 150, '第 1 段階', C.b, [['似た症状の患者を', 16], ['グループにまとめる', 16], null, ['多患者診療モード（MTM）', 15, C.muted], ['の前提になる', 15, C.muted]]), 12.6, 0.8);
    TZ.note(g2, '模式図');

    // ===== scene 3: matching groups to doctors with ACO =====
    var g3 = S.g[2];
    var gy = [140, 250, 360], dy = [140, 250, 360];
    gy.forEach(function (y, s) {
      box(g3, 70, y - 30, 150, 60, '#fff', COLS[s], 10);
      T(g3, 145, y + 6, 'グループ ' + (s + 1), { 'font-size': 15, fill: COLS[s], 'text-anchor': 'middle', 'font-weight': 600 });
    });
    dy.forEach(function (y, k) { doctor(g3, 520, y, '医師 ' + (k + 1)); });
    S.trails = [];
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
      var l = el('line', { x1: 222, y1: gy[a], x2: 478, y2: dy[b], stroke: C.b, 'stroke-linecap': 'round' }, g3);
      S.trails.push({ e: l, best: (a === 0 && b === 1) || (a === 1 && b === 0) || (a === 2 && b === 2) });
    }
    fin(T(g3, 350, 440, '線の太さ：フェロモンの量（模式）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }), 17.0);
    fin(TZ.panel(g3, PX, 150, '第 2 段階', C.b, [['グループを医師と組み合わせる', 16], ['最適な方法を求める', 16], null, ['数理モデルを作り、', 15, C.muted], ['改良した蟻コロニー', 15, C.muted], ['最適化で解く', 15, C.muted]]), 19.0, 0.8);
    TZ.note(g3, '模式図（グループと医師を結ぶ形は解説者の読み）');

    // ===== scene 4 =====
    var g4 = S.g[3];
    T(g4, 70, 92, '要旨の結論', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var c1 = el('g', {}, g4);
    box(c1, 70, 120, 520, 120, C.bsoft, null, 14);
    T(c1, 100, 166, '改良した蟻コロニー最適化のアルゴリズムを', { 'font-size': 17, fill: C.ink });
    T(c1, 100, 204, '複数設計した', { 'font-size': 20, 'font-weight': 700, fill: C.b });
    fin(c1, 24.6);
    var c2 = el('g', {}, g4);
    box(c2, 70, 270, 520, 120, C.b, null, 14);
    T(c2, 100, 316, 'いくつかの例題で', { 'font-size': 17, fill: '#fff' });
    T(c2, 100, 354, '有効性とよい性能を確かめた', { 'font-size': 20, 'font-weight': 700, fill: '#fff' });
    fin(c2, 26.0);
    fin(T(g4, 70, 430, '例題の大きさと数値は要旨に書かれていない', { 'font-size': 14, fill: C.muted }), 27.0);
    TZ.note(g4, '要旨の記述のみ（数値なし）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['第 1 段階', '似た症状でグループ化'], ['第 2 段階', '最適な組み合わせ方']],
      venue: 'IEEE ACCESS · 2019', title: ['Doctor-Patient Combined Matching', 'Problem and its Solving Algorithms'], tsize: 30,
      sub: '医師と患者の組み合わせマッチング問題とその解法', authors: ['Jing Yu, Lining Xing, Xu Tan, Teng Ren, Zhenping Li'], url: 'doi.org/10.1109/ACCESS.2019.2958388'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
    var k = H.ease(seg(t, 9.6, 11.6));
    S.p2.forEach(function (p, i) {
      var x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k;
      p.e.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      p.e.setAttribute('opacity', seg(t, 8.4 + i * 0.08, 8.8 + i * 0.08));
    });
    var m = seg(t, 17.2, 21.0);
    S.trails.forEach(function (tr) {
      var w = tr.best ? 1.5 + 6 * m : 1.5 * (1 - 0.6 * m);
      tr.e.setAttribute('stroke-width', w);
      tr.e.setAttribute('opacity', seg(t, 16.4, 17.0) * (tr.best ? 1 : 0.6 - 0.35 * m));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
