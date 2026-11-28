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
// teaser-scenes.js — A.-K. Lange, Truck Appointment Systeme bei hafeninternen Containertransporten
// (doctoral thesis, Fraunhofer, 2025). Unofficial explainer.
// Based only on the abstract and bibliographic record (the full text was not read). Every scene is a
// schematic drawn by the explainer (labelled 模式図); no number in it comes from the thesis.
// Colours: orange = congestion and rigid time slots; blue = the TAS and the strategies the thesis studies.
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
    { ja: '港湾のコンテナ輸送は取扱量が多く、時間の余裕も小さい。トラックが同じ時間に集まると<span class="A">ゲートが混雑</span>する。', en: '' },
    { ja: 'Truck Appointment System（TAS）では、運送会社が搬入・搬出の<span class="B">時間枠</span>を前もって予約する。', en: '' },
    { ja: 'ところが今の TAS は柔軟性が小さい。負担は運送会社に偏り、運送会社は回避策を使うようになる。', en: '' },
    { ja: '論文は文献調査で改善策を集め、2 段階のシミュレーションで評価した。特に影響が大きかったのは<span class="B">時間枠の長さ</span>だった。', en: '' },
    { ja: '時間枠の設計を文献調査と 2 段階のシミュレーションで比べた博士論文。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;

  function hours(g, x0, y0, w) {
    for (var h = 0; h <= 12; h += 2) {
      T(g, x0 + h / 12 * w, y0 + 22, (6 + h) + '時', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    }
    el('line', { x1: x0, x2: x0 + w, y1: y0, y2: y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    var X0 = 70, W = 500, Y0 = 380, BW = W / 12;

    // ===== scene 1: arrival peaks at the terminal gate =====
    var g1 = S.g[0];
    T(g1, X0, 96, '1 日のトラックの到着（ゲート前）', { 'font-size': 15, fill: C.muted });
    var peak = [3, 5, 9, 12, 8, 4, 3, 4, 7, 11, 9, 4];
    peak.forEach(function (v, i) {
      var r = box(g1, X0 + i * BW + 3, Y0 - v * 20, BW - 6, v * 20, v >= 9 ? C.a : C.gray, null, 2);
      fin(r, 0.8 + i * 0.18, 0.4);
    });
    fin(el('line', { x1: X0, x2: X0 + W, y1: Y0 - 7 * 20, y2: Y0 - 7 * 20, stroke: C.ink, 'stroke-dasharray': '6 5', 'stroke-width': 1.4 }, g1), 3.4);
    fin(T(g1, X0 + W * 0.5, Y0 - 7 * 20 - 8, 'ゲートの処理能力', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }), 3.4);
    hours(g1, X0, Y0, W);
    fin(TZ.panel(g1, PX, 140, '港湾内のコンテナ輸送', C.a, [['取扱量が多く、', 16], ['時間の余裕が小さい', 16], null, ['集中すると待ち時間、', 15, C.muted], ['費用、排出が増える', 15, C.muted]]), 4.2, 0.8);
    TZ.note(g1, '模式図（数値は解説者が置いた例）');

    // ===== scene 2: the TAS spreads arrivals over booked slots =====
    var g2 = S.g[1];
    T(g2, X0, 96, '予約した時間枠ごとの到着（各枠に上限）', { 'font-size': 15, fill: C.muted });
    var flat = [6, 6, 7, 7, 6, 6, 6, 6, 7, 7, 6, 5];
    for (var s = 0; s < 6; s++) {
      fin(box(g2, X0 + s * 2 * BW, Y0 - 170, 2 * BW, 170, s % 2 ? '#fff' : C.bsoft, C.hair, 0), 8.4 + s * 0.15, 0.4);
    }
    flat.forEach(function (v, i) {
      fin(box(g2, X0 + i * BW + 3, Y0 - v * 20, BW - 6, v * 20, C.b, null, 2), 9.6 + i * 0.15, 0.4);
    });
    hours(g2, X0, Y0, W);
    fin(TZ.panel(g2, PX, 140, 'Truck Appointment System', C.b, [['運送会社が', 16], ['搬入・搬出の時間枠を', 16], ['前もって予約する', 16], null, ['枠ごとの台数に上限を置き、', 15, C.muted], ['到着を平らにする', 15, C.muted]]), 11.6, 0.8);
    TZ.note(g2, '模式図（数値は解説者が置いた例）');

    // ===== scene 3: rigid slots burden hauliers =====
    var g3 = S.g[2];
    T(g3, X0, 96, '予約した枠（8〜10 時）と実際の到着', { 'font-size': 15, fill: C.muted });
    box(g3, X0 + 2 * BW, 150, 2 * BW, 150, C.bsoft, C.b, 0);
    T(g3, X0 + 3 * BW, 140, '予約した枠', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    hours(g3, X0, 300, W);
    var truck = el('g', {}, g3);
    box(truck, 0, 0, 56, 30, C.a, null, 5); box(truck, 56, 8, 20, 22, C.a, null, 4);
    el('circle', { cx: 14, cy: 34, r: 6, fill: C.ink }, truck); el('circle', { cx: 60, cy: 34, r: 6, fill: C.ink }, truck);
    S.truck = truck;
    S.cross = fin(T(g3, X0 + 5 * BW, 220, '×', { 'font-size': 44, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' }), 19.4, 0.4);
    fin(T(g3, X0, 360, '例：遅れると枠を逃し、予約を取り直すことになる', { 'font-size': 16, fill: C.ink }), 19.8);
    fin(TZ.panel(g3, PX, 140, '柔軟性が小さい', C.a, [['負担が運送会社に偏る', 16], null, ['そのため運送会社は', 15, C.muted], ['回避策（Workarounds）', 15, C.muted], ['を使うようになる', 15, C.muted]]), 20.6, 0.8);
    TZ.note(g3, '模式図（要旨の記述を解説者が図にしたもの）');

    // ===== scene 4: method and the qualitative result =====
    var g4 = S.g[3];
    var steps = [['文献調査', '港湾の混雑対策と', '他業界から移せる方法'], ['改善策の整理', '時間枠の設計と', '柔軟性のオプション'], ['2 段階の', 'シミュレーション', '（離散事象）']];
    steps.forEach(function (st, i) {
      var x = 60 + i * 200, gg = el('g', {}, g4);
      box(gg, x, 90, 170, 110, i === 2 ? C.bsoft : '#fff', C.b, 10);
      T(gg, x + 85, 124, st[0], { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      T(gg, x + 85, 154, st[1], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      T(gg, x + 85, 178, st[2], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      fin(gg, 24.4 + i * 0.8);
      if (i < 2) fin(arrow(g4, x + 174, 145, x + 196, 145, C.b), 24.8 + i * 0.8);
    });
    T(g4, 60, 260, '効果の大きさ（要旨の言葉を順序だけで図示）', { 'font-size': 15, fill: C.muted });
    var rows = [['時間枠の長さ', 420, '特に影響が大きい'], ['柔軟性のオプション', 170, '影響は小さいが、多くの場合で推奨']];
    rows.forEach(function (r, i) {
      var y = 290 + i * 70;
      T(g4, 60, y + 26, r[0], { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      grow(box(g4, 240, y + 6, 0, 30, C.b, null, 4), 'width', r[1], 27.0 + i * 0.6);
      fin(T(g4, 250 + r[1], y + 27, r[2], { 'font-size': 14, fill: C.b }), 27.6 + i * 0.6);
    });
    TZ.note(g4, '模式図（棒の長さは解説者が置いた順序のみ。数値ではない）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['特に影響が大きい設計要素', '時間枠の長さ'], ['柔軟性のオプション', '多くの場合で推奨']],
      venue: '博士論文 · FRAUNHOFER · 2025', title: ['Truck Appointment Systeme bei', 'hafeninternen Containertransporten'], tsize: 28,
      sub: '港湾内のコンテナ輸送におけるトラック予約システム', authors: ['Ann-Kathrin Lange'], url: 'doi.org/10.24406/publica-5784'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
    var X0 = 70, BW = 500 / 12, k = seg(t, 16.6, 19.2);
    S.truck.setAttribute('transform', 'translate(' + (X0 - 40 + k * (5 * BW - 10)) + ',245)');
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
