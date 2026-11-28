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
// Unofficial explainer, from the published PDF.
// Scene 1 redraws the examples of Figs. 1-2, scene 3 the interval shapes of Fig. 3 and the serving ratios of
// the late arrival policies (Sec. 2), scene 4 the bottom row of Table 1. Scene 2 is a schematic (模式図).
// Colours: orange = time-slot gaps / the uniform pattern with L1; blue = plateau-dome with L3.
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
    { ja: '時間枠制では遅れた患者の<span class="A">枠が空く</span>。番号制では医師は番号の順に診て、来ていない患者は飛ばす。', en: '' },
    { ja: '患者は前回呼ばれた時刻と目安の時刻のずれを見て、次に来る時刻を更新する（適応的期待）。', en: '' },
    { ja: '比べたのは、目安の時刻の決め方 2 つ（均等と <span class="B">plateau-dome</span>）と、番号を飛ばされた患者の扱い 3 つ。', en: '' },
    { ja: '平均の待ち時間は均等と L1 の 15.3 分に対し、<span class="B">plateau-dome と L3</span> では 11.8 分だった。', en: '' },
    { ja: '断片化の起きない番号制で、待ち時間を減らす予約の方策を比べた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: time-slot (Fig. 1) vs sequence-number (Fig. 2) =====
    var g1 = S.g[0], X0 = 80, W = 500, M0 = 0, M1 = 80;   // 9:00 to 10:20
    function sx(min) { return X0 + (min - M0) / (M1 - M0) * W; }
    T(g1, X0, 92, '時間枠制（20 分の枠）', { 'font-size': 15, 'font-weight': 600, fill: C.ink });
    [[0, 20, '1 番', C.gray], [20, 40, '2 番（来ない）', C.a], [40, 60, '3 番', C.gray], [60, 80, '4 番', C.gray]].forEach(function (b, i) {
      var gg = el('g', {}, g1);
      box(gg, sx(b[0]) + 2, 110, sx(b[1]) - sx(b[0]) - 4, 44, b[3] === C.a ? '#FCEBDF' : C.panel, b[3] === C.a ? C.a : null, 6);
      T(gg, (sx(b[0]) + sx(b[1])) / 2, 138, b[2], { 'font-size': 14, fill: b[3] === C.a ? C.a : C.ink, 'text-anchor': 'middle' });
      fin(gg, 0.6 + i * 0.2, 0.3);
    });
    fin(T(g1, sx(30), 182, '医師が空く', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 }), 2.0);
    T(g1, X0, 250, '番号制（目安の時刻 9:00, 9:10, 9:20, 9:30）', { 'font-size': 15, 'font-weight': 600, fill: C.ink });
    [[0, 15, '1 番'], [15, 15, ''], [15, 45, '3 番'], [45, 65, '4 番'], [65, 80, '2 番']].forEach(function (b, i) {
      if (!b[2]) return;
      var gg = el('g', {}, g1);
      box(gg, sx(b[0]) + 2, 268, sx(b[1]) - sx(b[0]) - 4, 44, b[2] === '2 番' ? C.bsoft : C.panel, b[2] === '2 番' ? C.b : null, 6);
      T(gg, (sx(b[0]) + sx(b[1])) / 2, 296, b[2], { 'font-size': 14, fill: b[2] === '2 番' ? C.b : C.ink, 'text-anchor': 'middle' });
      fin(gg, 3.0 + i * 0.3, 0.3);
    });
    fin(T(g1, sx(15), 340, '9:15 に 2 番がいない → 3 番を呼ぶ', { 'font-size': 14, fill: C.ink }), 4.4);
    fin(T(g1, sx(15), 364, '9:32 に来た 2 番は、決まった順番の規則で後に回る', { 'font-size': 14, fill: C.ink }), 4.9);
    el('line', { x1: X0, x2: X0 + W, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.2 }, g1);
    [[0, '9:00'], [20, '9:20'], [40, '9:40'], [60, '10:00'], [80, '10:20']].forEach(function (k) { T(g1, sx(k[0]), 422, k[1], { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' }); });
    fin(TZ.panel(g1, PX, 150, '番号制', C.b, [['予約表が断片化せず、', 16], ['医師も空かない', 16], null, ['番号を飛ばされた患者を', 15, C.muted], ['いつ診るかが問題になる', 15, C.muted]]), 5.6, 0.8);
    TZ.note(g1, '論文の Figure 1・2 の例を簡略化して作図');

    // ===== scene 2: adaptive expectations (schematic) =====
    var g2 = S.g[1];
    var steps = [['前回', '呼ばれたのは目安の', '8 分後だった'], ['期待を更新', 'p = ηp + (1 − η)θ', ''], ['今回', '来たい時刻を', 'ずらす']];
    steps.forEach(function (s, i) {
      var x = 70 + i * 180, gg = el('g', {}, g2);
      box(gg, x, 190, 150, 110, i === 1 ? C.bsoft : '#fff', i === 1 ? C.b : C.ink, 10);
      T(gg, x + 75, 226, s[0], { 'font-size': 16, 'font-weight': 650, fill: i === 1 ? C.b : C.ink, 'text-anchor': 'middle' });
      T(gg, x + 75, 256, s[1], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      if (s[2]) T(gg, x + 75, 278, s[2], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      fin(gg, 8.6 + i * 1.0);
      if (i < 2) fin(arrow(g2, x + 154, 245, x + 176, 245, C.muted), 9.1 + i * 1.0);
    });
    fin(arrow(g2, 505, 312, 145, 312, C.muted), 12.0);
    fin(T(g2, 325, 340, '来院のたびに繰り返す。実際の到着は ±20 分（標準偏差）ぶれる', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }), 12.0);
    fin(TZ.panel(g2, PX, 150, '患者の行動のモデル', C.b, [['η：前回までの行動を', 15], ['保つ重み（0.8 と 0.2）', 15], null, ['θ：呼ばれた時刻と', 15], ['目安の時刻のずれ', 15]]), 12.6, 0.8);
    TZ.note(g2, '模式図（「8 分後」は論文 Fig. 7 の例の値）');

    // ===== scene 3: what is compared =====
    var g3 = S.g[2];
    T(g3, 70, 88, '目安の時刻の間隔（15 人、3 時間。論文 Figure 3 の形）', { 'font-size': 14, fill: C.muted });
    function intervals(g, x0, ys, color, label) {
      var gg = el('g', {}, g), w = 230, h = 90, y0 = 210;
      el('line', { x1: x0, x2: x0 + w, y1: y0, y2: y0, stroke: C.ink, 'stroke-width': 1.2 }, gg);
      var pts = ys.map(function (v, i) { return (x0 + i / (ys.length - 1) * w) + ',' + (y0 - v / 16 * h); }).join(' ');
      el('polyline', { points: pts, fill: 'none', stroke: color, 'stroke-width': 3 }, gg);
      T(gg, x0, y0 - h - 12, label, { 'font-size': 15, 'font-weight': 650, fill: color });
      return gg;
    }
    fin(intervals(g3, 70, [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12], C.a, 'A1 均等（12 分おき）'), 16.6);
    fin(intervals(g3, 350, [0, 4, 8, 14.4, 14.4, 14.4, 14.4, 14.4, 14.4, 14.4, 14.4, 14.4, 14.4, 8, 4], C.b, 'A2 plateau-dome'), 17.2);
    T(g3, 70, 270, '番号を飛ばされた患者の扱い（1 巡で診る人数）', { 'font-size': 14, fill: C.muted });
    [['L1', 'C1 を 2 人 → C2/C3 を 1 人'], ['L2', 'C1/C2 を 3 人 → C3 を 1 人'], ['L3', 'C1 を 1 人 → C2 を 2 人 → C3 を 1 人']].forEach(function (r, i) {
      var y = 290 + i * 54, gg = el('g', {}, g3), c = i === 2 ? C.b : C.ink;
      box(gg, 70, y, 510, 44, i === 2 ? C.bsoft : '#fff', i === 2 ? C.b : C.hair, 8);
      T(gg, 92, y + 28, r[0], { 'font-size': 16, 'font-weight': 700, fill: c });
      T(gg, 140, y + 28, r[1], { 'font-size': 15, fill: C.ink });
      fin(gg, 18.6 + i * 0.6);
    });
    fin(TZ.panel(g3, PX, 150, '患者の 3 つの組', C.ink, [['C1：番号をまだ', 15], ['飛ばされていない', 15], ['C2：時間どおりに来たが', 15], ['番号を飛ばされた', 15], ['C3：遅れて来て', 15], ['番号を飛ばされた', 15]]), 20.4, 0.8);
    TZ.note(g3, '論文の Figure 3 と 2 節をもとに作図');

    // ===== scene 4: Table 1 bottom row =====
    var g4 = S.g[3];
    T(g4, 70, 80, '平均の待ち時間（分、16 の場面の平均。論文 Table 1）', { 'font-size': 15, fill: C.muted });
    var XB = 260, SC = 22;
    el('line', { x1: XB, x2: XB, y1: 100, y2: 470, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [0, 5, 10, 15].forEach(function (v) {
      el('line', { x1: XB + v * SC, x2: XB + v * SC, y1: 100, y2: 470, stroke: C.hair }, g4);
      T(g4, XB + v * SC, 492, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    [['A1 均等・L1', 15.3], ['A1 均等・L2', 13.9], ['A1 均等・L3', 13.3], ['A2 plateau-dome・L1', 13.0], ['A2 plateau-dome・L2', 12.3], ['A2 plateau-dome・L3', 11.8]].forEach(function (r, i) {
      var y = 110 + i * 58, col = i === 0 ? C.a : i === 5 ? C.b : C.gray;
      T(g4, XB - 12, y + 30, r[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
      grow(box(g4, XB, y + 10, 0, 32, col, null, 4), 'width', r[1] * SC, 24.6 + i * 0.4);
      fin(T(g4, XB + r[1] * SC + 10, y + 32, r[1].toFixed(1), { 'font-size': 15, 'font-weight': 650, fill: col === C.gray ? C.ink : col }), 25.1 + i * 0.4);
    });
    TZ.note(g4, '論文 Table 1 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['平均の待ち時間（分）', '15.3 → 11.8'], ['最もよい組み合わせ', 'plateau-dome と L3']],
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
