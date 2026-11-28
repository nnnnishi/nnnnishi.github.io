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
// teaser-scenes.js — Mazaheri Habibi et al., Overview and Classification of Evaluation Metrics of Appointment
// Scheduling Systems (Frontiers in Health Informatics 2024). Unofficial explainer written from the abstract
// (body not read). Counts (23,403 -> 75 papers; 24 metrics = 12 / 7 / 5) are from the abstract. The dots in
// scenes 1 and 3 are schematic (labelled 模式図) and do not stand for named metrics.
// Colours: orange = the many metrics used across studies; blue = the arrival / queue / server classification.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約システムの評価には<span class="A">多くの種類の指標</span>が使われてきた。著者らは 23,403 本の文献から 75 本を詳しく分析した。', en: '' },
    { ja: '外来を待ち行列として見ると、到着（患者）・待ち行列（外来）・サーバー（医師）の 3 つに分けられる。', en: '' },
    { ja: '集めた 24 種の指標を、<span class="B">どの要素を測る指標か</span>で 3 つに分類した。', en: '' },
    { ja: '到着 12 種（50%）、待ち行列 7 種（29%）、サーバー 5 種（21%）。患者の側の指標が最も多い。', en: '' },
    { ja: '予約の方法を評価するときに、どの指標を選ぶかを整理したレビュー。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  var GROUPS = [['到着', '患者', 12], ['待ち行列', '外来', 7], ['サーバー', '医師', 5]];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    var R = H.rng(7);

    // ===== scene 1: funnel 23,403 -> 75 =====
    var g1 = S.g[0];
    S.fun1 = [['見つかった論文', '23,403 本', 480], ['詳しく分析した論文', '75 本', 220], ['評価指標', '24 種', 170]].map(function (r, i) {
      var gg = el('g', {}, g1), y = 120 + i * 100, x = 70 + (480 - r[2]) / 2;
      el('rect', { x: x, y: y, width: r[2], height: 60, rx: 8, fill: i === 2 ? C.a : C.panel, stroke: C.a, 'stroke-width': 1.4 }, gg);
      T(gg, 70 + 240, y + 26, r[0], { 'font-size': 14, fill: i === 2 ? '#fff' : C.muted, 'text-anchor': 'middle' });
      T(gg, 70 + 240, y + 48, r[1], { 'font-size': 18, 'font-weight': 650, fill: i === 2 ? '#fff' : C.a, 'text-anchor': 'middle' });
      return { g: gg, t0: 1.0 + i * 1.3 };
    });
    S.p1 = TZ.panel(g1, PX, 140, '指標を集める', C.a, [['PubMed・Scopus・', 15], ['Web of Science・', 15], ['Google Scholar', 15], null, ['2023 年 7 月 23 日まで', 14, C.muted], ['英語の論文', 14, C.muted]]);
    TZ.note(g1, '本数は要旨の値（箱の幅は模式的）');

    // ===== scene 2: queueing view =====
    var g2 = S.g[1];
    S.q2 = GROUPS.map(function (gr, i) {
      var gg = el('g', {}, g2), x = 70 + i * 190;
      el('rect', { x: x, y: 200, width: 150, height: 90, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.6 }, gg);
      T(gg, x + 75, 238, gr[0], { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      T(gg, x + 75, 266, gr[1], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      if (i < 2) el('path', { d: 'M' + (x + 156) + ' 245 h 26', stroke: C.ink, 'stroke-width': 2, fill: 'none' }, gg);
      if (i < 2) el('path', { d: 'M' + (x + 176) + ' 239 l 8 6 l -8 6 z', fill: C.ink }, gg);
      return { g: gg, t0: 8.8 + i * 1.0 };
    });
    // people arriving
    S.dots2 = [];
    for (var k = 0; k < 5; k++) S.dots2.push(el('circle', { cx: 0, cy: 160, r: 9, fill: C.ink, 'fill-opacity': 0.55 }, g2));
    S.p2 = TZ.panel(g2, PX, 140, '外来を待ち行列として見る', C.b, [['患者が到着し、', 15], ['外来で待ち、', 15], ['医師の診察を受ける', 15]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: 24 dots move into 3 groups =====
    var g3 = S.g[2];
    S.d3 = [];
    var idx = 0;
    GROUPS.forEach(function (gr, gi) {
      var bx = 70 + gi * 190;
      el('rect', { x: bx, y: 300, width: 150, height: 140, rx: 12, fill: '#fff', stroke: C.b, 'stroke-width': 1.4 }, g3);
      T(g3, bx + 75, 466, gr[0] + '（' + gr[1] + '）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
      for (var j = 0; j < gr[2]; j++) {
        var c = el('circle', { cx: 0, cy: 0, r: 11, fill: C.b }, g3);
        S.d3.push({ el: c, x0: 90 + R() * 440, y0: 110 + R() * 140, x1: bx + 25 + (j % 4) * 33, y1: 325 + Math.floor(j / 4) * 32, t0: 16.8 + idx * 0.08 });
        idx++;
      }
    });
    S.p3 = TZ.panel(g3, PX, 140, '24 種を 3 つに分ける', C.b, [['どの要素を測る指標か', 15], ['で分類する', 15], null, ['点は個々の指標の名前を', 14, C.muted], ['表すものではない', 14, C.muted]]);
    TZ.note(g3, '模式図（各分類の点の数は要旨の値）');

    // ===== scene 4: counts =====
    var g4 = S.g[3];
    T(g4, 70, 70, '分類ごとの指標の数（要旨の値）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 260, x1: 740, v0: 0, v1: 14, y0: 120, rowH: 90, t0: 24.6, dt: 1.0, ticks: [0, 4, 8, 12],
      rows: [
        { label: '到着（患者）', b: 12, lb: '12 種（50%）' },
        { label: '待ち行列（外来）', b: 7, lb: '7 種（29%）' },
        { label: 'サーバー（医師）', b: 5, lb: '5 種（21%）' }
      ]
    });
    TZ.note(g4, '要旨の数値から作図（本文は未読）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['分析した論文', '75 本'], ['評価指標', '24 種（12・7・5）']],
      venue: 'FRONTIERS IN HEALTH INFORMATICS 2024', title: ['Overview and Classification of Evaluation', 'Metrics of Appointment Scheduling Systems'], tsize: 28,
      sub: '予約システムの評価指標の概観と分類', authors: ['M. R. Mazaheri Habibi, F. Mohammad Abadi, H. Tabesh,', 'H. Vakili Arki, A. Abu-Hanna, S. Eslami'], url: 'doi.org/10.30699/fhi.v13i0.573'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.fun1.forEach(function (f) { f.g.setAttribute('opacity', seg(t, f.t0, f.t0 + 0.6)); });
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    S.q2.forEach(function (q) { q.g.setAttribute('opacity', seg(t, q.t0, q.t0 + 0.6)); });
    S.dots2.forEach(function (d, k) {
      var u = ((t - 11.5 - k * 0.7) / 3.0);
      var on = u > 0 && u < 1;
      d.setAttribute('cx', 60 + 470 * H.clamp(u));
      d.setAttribute('opacity', on ? 1 : 0);
    });
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    S.d3.forEach(function (d) {
      var k = seg(t, d.t0 + 1.2, d.t0 + 2.4);
      d.el.setAttribute('cx', d.x0 + (d.x1 - d.x0) * k);
      d.el.setAttribute('cy', d.y0 + (d.y1 - d.y0) * k);
      d.el.setAttribute('fill', H.mix(C.a, C.b, k));
      d.el.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.4));
    });
    S.p3.setAttribute('opacity', seg(t, 20.0, 20.8));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
