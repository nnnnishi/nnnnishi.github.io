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
// teaser-scenes.js — Wang, Fung, Dynamic appointment scheduling with patient preferences and choices
// (Industrial Management & Data Systems 2015). Unofficial explainer based on the abstract only.
// Every scene is a schematic (labelled 模式図); the paper's numbers are not used.
// Colours: orange = naive policies that ignore preferences; blue = the proposed preference-aware policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">選好を考えずに枠を 1 つだけ示す</span>と、合わない患者はそのまま去ってしまう。', en: '' },
    { ja: '<span class="B">選好を考えて複数の枠を提示する</span>と、患者が自分で選び、予約が入りやすくなる。', en: '' },
    { ja: 'どの枠を提示するかを決める動的計画法は、状態が多すぎてそのままでは解けない。', en: '' },
    { ja: '等価な線形計画に直し、分解で変数を減らし、列生成で解く。', en: '' },
    { ja: '要旨によれば、選好の情報を使う方策は単純な方策より良く、より多くの収益が見込める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;
  var NAMES = ['月朝', '月夕', '火朝', '火夕', '水朝'];

  function row(g, y, offered, color) {
    return NAMES.map(function (s, k) {
      var gg = el('g', {}, g);
      el('rect', { x: 70 + k * 100, y: y, width: 86, height: 50, rx: 8, fill: offered[k] ? '#fff' : C.panel, stroke: offered[k] ? color : C.hair, 'stroke-width': offered[k] ? 2.4 : 1.2 }, gg);
      T(gg, 113 + k * 100, y + 31, s, { 'font-size': 15, 'text-anchor': 'middle', fill: offered[k] ? C.ink : C.muted });
      return gg;
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1 =====
    var g1 = S.g[0];
    T(g1, 70, 110, '患者の希望：火曜の夕方か水曜の朝', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    S.r1 = row(g1, 160, [true, false, false, false, false], C.a);
    S.x1 = T(g1, 70, 290, '月曜の朝だけを示す → 患者は断って去る', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '選好を考えない', C.a, [['合わない枠しか', 16], ['示さないと', 16], ['予約を逃す', 16]]);
    TZ.note(g1, '模式図');

    // ===== scene 2 =====
    var g2 = S.g[1];
    T(g2, 70, 110, '患者の希望：火曜の夕方か水曜の朝', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    S.r2 = row(g2, 160, [true, false, true, true, true], C.b);
    S.pick2 = el('rect', { x: 70 + 3 * 100 - 4, y: 156, width: 94, height: 58, rx: 10, fill: 'none', stroke: C.b, 'stroke-width': 4 }, g2);
    S.ok2 = T(g2, 70, 290, '火曜の夕方を選んで予約が入る', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.p2 = TZ.panel(g2, PX, 140, '複数の選択肢', C.b, [['どの枠を見せるかは', 16], ['予約表の状態と', 16], ['選好から決める', 16]]);
    TZ.note(g2, '模式図');

    // ===== scene 3 =====
    var g3 = S.g[2];
    T(g3, 70, 110, '動的計画法', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    S.st3 = [];
    var rnd = H.rng(7);
    for (var i = 0; i < 90; i++) {
      var c = el('rect', { x: 70 + (i % 15) * 34, y: 140 + Math.floor(i / 15) * 34, width: 26, height: 26, rx: 4, fill: C.gray, 'fill-opacity': 0.4 + 0.6 * rnd() }, g3);
      S.st3.push({ c: c, t0: 16.4 + i * 0.03 });
    }
    T(g3, 70, 380, '状態（予約表のあり得る形）が組合せで増える', { 'font-size': 16, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '計算の難しさ', C.a, [['そのままでは', 16], ['すべての状態を', 16], ['扱えない', 16]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: DP -> LP -> decomposition -> column generation =====
    var g4 = S.g[3];
    var steps = ['動的計画法', '等価な線形計画', '分解で変数を減らす', '列生成で解く'];
    S.st4 = steps.map(function (s, i) {
      var gg = el('g', {}, g4), y = 110 + i * 86;
      el('rect', { x: 120, y: y, width: 360, height: 58, rx: 10, fill: i === 0 ? '#fff' : C.bsoft, stroke: i === 0 ? C.ink : C.b, 'stroke-width': 1.8 }, gg);
      T(gg, 300, y + 36, s, { 'font-size': 18, 'font-weight': 600, fill: i === 0 ? C.ink : C.b, 'text-anchor': 'middle' });
      if (i > 0) T(gg, 300, y - 8, '↓', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
      return gg;
    });
    S.p4 = TZ.panel(g4, PX, 140, '解き方', C.b, [['要旨にある流れ', 16], null, ['各段の具体的な式は', 15, C.muted], ['本文未読のため', 15, C.muted], ['書いていない', 15, C.muted]]);
    TZ.note(g4, '要旨の記述を図にしたもの');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['選好の情報を使う方策', '単純な方策より良い'], ['複数の選択肢', '外来に有利']],
      venue: 'INDUSTRIAL MANAGEMENT & DATA SYSTEMS 2015', title: ['Dynamic appointment scheduling', 'with patient preferences and choices'], tsize: 30,
      sub: '患者の選好と選択を考えた動的な予約スケジューリング', authors: ['Jin Wang, R. Y. K. Fung'], url: 'doi.org/10.1108/IMDS-12-2014-0372'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.r1.forEach(function (g, k) { g.setAttribute('opacity', seg(t, 0.8 + k * 0.2, 1.2 + k * 0.2)); });
    S.x1.setAttribute('opacity', seg(t, 3.0, 3.6));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    S.r2.forEach(function (g, k) { g.setAttribute('opacity', seg(t, 8.8 + k * 0.2, 9.2 + k * 0.2)); });
    S.pick2.setAttribute('opacity', seg(t, 10.8, 11.3));
    S.ok2.setAttribute('opacity', seg(t, 11.6, 12.2));
    S.p2.setAttribute('opacity', seg(t, 12.4, 13.2));
    S.st3.forEach(function (s) { s.c.setAttribute('opacity', seg(t, s.t0, s.t0 + 0.3)); });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.st4.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 24.6 + i * 1.2, 25.2 + i * 1.2)); });
    S.p4.setAttribute('opacity', seg(t, 29.0, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
