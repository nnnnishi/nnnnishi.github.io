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
// teaser-scenes.js — Guo & Yao, On Performance of Prioritized Appointment Scheduling for Healthcare
// (Journal of Service Science and Management, 2019). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen states (labelled 模式図). Scene 4 shows the state space and
// the parameter values of the paper's Table 2; the paper reports its results only as plots, so no result
// numbers are drawn — only the directions the paper states in its text.
// Colours: orange = interrupted / terminated routine appointments; blue = the handoff scheme.
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
    { ja: '医療者 6 人が通常の患者と緊急の患者を 1 人ずつ診る。空きがなければ申込みは断られる。', en: '' },
    { ja: '緊急の患者が来て空きがないと、通常の患者を診ている医療者が回され、<span class="A">通常の予約が中断</span>される。', en: '' },
    { ja: '<span class="B">引き継ぎ</span>：中断された予約は空いている別の医療者で再開する。空きがなければ打ち切られる。', en: '' },
    { ja: '通常と緊急の予約の数を状態にしたマルコフ連鎖を解き、緊急の到着率を 4 から 12 まで変えて指標を計算した。', en: '' },
    { ja: '緊急の患者を優先したときの代償を、拒否と打ち切りの確率として式で示した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var ROWX = 170, ROWW = 380, ROWY = 110, ROWH = 52;

  // six providers as rows; returns label positions
  function providers(g) {
    for (var k = 0; k < 6; k++) {
      var y = ROWY + k * ROWH;
      T(g, ROWX - 16, y + 30, '医療者 ' + (k + 1), { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      box(g, ROWX, y + 6, ROWW, ROWH - 12, C.panel, null, 6);
    }
  }
  function patient(g, k, kind, label) {
    var y = ROWY + k * ROWH, gg = el('g', {}, g);
    var fill = kind === 'u' ? C.ink : kind === 'x' ? C.a : kind === 'h' ? C.b : C.gray;
    box(gg, ROWX + 6, y + 10, ROWW - 12, ROWH - 20, fill, null, 5);
    T(gg, ROWX + ROWW / 2, y + 32, label, { 'font-size': 15, 'font-weight': 600, fill: kind === 'r' ? C.ink : '#fff', 'text-anchor': 'middle' });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1 =====
    var g1 = S.g[0];
    T(g1, ROWX, 90, 'ある時点の医療者（M = 6）', { 'font-size': 15, fill: C.muted });
    providers(g1);
    var s1 = ['r', 'u', 'r', 'r', 'u', 'r'];
    s1.forEach(function (k, i) { fin(patient(g1, i, k, k === 'u' ? '緊急' : '通常'), 0.8 + i * 0.35); });
    fin(TZ.panel(g1, PX, 140, '2 種類の患者', C.ink, [['緊急：到着率 λ1、率 μ1', 15], ['通常：到着率 λ2、率 μ2', 15], null, ['どちらもポアソン到着、', 15, C.muted], ['サービス時間は指数分布', 15, C.muted], null, ['空きがなければ断られる', 15, C.muted]]), 3.6, 0.8);
    TZ.note(g1, '模式図（状態は解説者が置いた例）');

    // ===== scene 2: preemption =====
    var g2 = S.g[1];
    T(g2, ROWX, 90, '全員ふさがっているときに緊急の患者が来る', { 'font-size': 15, fill: C.muted });
    providers(g2);
    s1.forEach(function (k, i) { if (i !== 2) patient(g2, i, k, k === 'u' ? '緊急' : '通常'); });
    S.r2 = patient(g2, 2, 'r', '通常');
    S.x2 = fin(patient(g2, 2, 'x', '通常（中断）'), 10.2, 0.5);
    S.u2 = patient(g2, 2, 'u', '緊急');
    S.newU = el('g', {}, g2);
    box(S.newU, 0, 0, 90, 32, C.ink, null, 5);
    T(S.newU, 45, 22, '緊急', { 'font-size': 15, 'font-weight': 600, fill: '#fff', 'text-anchor': 'middle' });
    fin(TZ.panel(g2, PX, 140, '優先権', C.a, [['緊急の患者は、通常の', 16], ['患者を診ている医療者を', 16], ['使える', 16], null, ['通常の予約は一時停止', 15, C.a]]), 11.4, 0.8);
    TZ.note(g2, '模式図');

    // ===== scene 3: handoff =====
    var g3 = S.g[2];
    T(g3, 70, 90, '空きがあるとき', { 'font-size': 15, fill: C.b, 'font-weight': 600 });
    T(g3, 70, 300, '空きがないとき', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    function lane(g, y, label, fill, tc) {
      box(g, 70, y, 220, 44, fill, null, 6);
      T(g, 180, y + 28, label, { 'font-size': 15, 'font-weight': 600, fill: tc, 'text-anchor': 'middle' });
    }
    lane(g3, 110, '中断された通常の予約', C.a, '#fff');
    box(g3, 380, 110, 180, 44, C.panel, C.hair, 6);
    T(g3, 470, 138, '空いている医療者', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.h3 = fin(el('g', {}, g3), 18.4);
    box(S.h3, 380, 110, 180, 44, C.b, null, 6);
    T(S.h3, 470, 138, '再開', { 'font-size': 15, 'font-weight': 650, fill: '#fff', 'text-anchor': 'middle' });
    fin(arrow(g3, 296, 132, 374, 132, C.b), 17.6);
    fin(T(g3, 335, 122, '引き継ぎ', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' }), 17.6);
    lane(g3, 320, '中断された通常の予約', C.a, '#fff');
    box(g3, 380, 320, 180, 44, '#fff', C.a, 6);
    fin(T(g3, 470, 349, '打ち切り ×', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' }), 20.0);
    fin(arrow(g3, 296, 342, 374, 342, C.a), 19.4);
    fin(TZ.panel(g3, PX, 140, '引き継ぎ（handoff）', C.b, [['中断された予約を', 16], ['別の医療者で再開する', 16], null, ['空きがなければ', 15, C.a], ['予約は打ち切られる', 15, C.a]]), 20.6, 0.8);
    TZ.note(g3, '模式図');

    // ===== scene 4: state space and Table 2 =====
    var g4 = S.g[3];
    T(g4, 70, 70, '状態 (i, j)：通常 i 件、緊急 j 件（M = 6）', { 'font-size': 15, fill: C.muted });
    var CX = 90, CY = 420, D = 40;
    for (var i = 0; i <= 6; i++) for (var j = 0; j <= 6 - i; j++) {
      var full = i + j === 6;
      var c = el('circle', { cx: CX + i * D, cy: CY - j * D, r: 11, fill: full ? C.a : '#fff', stroke: full ? C.a : C.b, 'stroke-width': 1.6 }, g4);
      fin(c, 24.4 + (i + j) * 0.12, 0.3);
    }
    T(g4, CX + 3 * D, CY + 36, '通常の数 i →', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    T(g4, CX - 20, CY - 6.6 * D, '緊急の数 j ↑', { 'font-size': 14, fill: C.muted });
    fin(T(g4, CX + 3.6 * D, CY - 3.6 * D, '← 全員ふさがった状態', { 'font-size': 14, fill: C.a }), 25.8);
    var tx = 400;
    fin(T(g4, tx, 120, '通常の拒否：i + j = M の状態の確率の和', { 'font-size': 16, fill: C.a, 'font-weight': 600 }), 26.4);
    fin(T(g4, tx, 150, '緊急の拒否：状態 (0, M) の確率', { 'font-size': 16, fill: C.ink, 'font-weight': 600 }), 26.7);
    var tb = el('g', {}, g4);
    T(tb, tx, 205, '論文 Table 2 の設定', { 'font-size': 15, fill: C.muted });
    [['M', '6'], ['λ1（緊急）', '4, 6, 8, 10, 12'], ['μ1', '5'], ['λ2（通常）', '6'], ['μ2', '6']].forEach(function (r, k) {
      T(tb, tx, 236 + k * 28, r[0], { 'font-size': 15, fill: C.ink });
      T(tb, tx + 120, 236 + k * 28, r[1], { 'font-size': 15, fill: C.ink, 'font-weight': 600 });
    });
    fin(tb, 27.2);
    var tr = el('g', {}, g4);
    T(tr, tx, 395, 'λ1 を上げると（論文の本文）', { 'font-size': 15, fill: C.muted });
    T(tr, tx, 424, '拒否・打ち切り ↑　通常の処理件数 ↓', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    T(tr, tx, 452, '緊急の処理件数 ↑　滞在時間は一定', { 'font-size': 16, fill: C.ink });
    fin(tr, 28.6);
    TZ.note(g4, '結果は傾向のみ（論文は数値を図で示す）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['緊急の患者', '通常の予約を中断できる'], ['中断された予約', '空きがあれば引き継ぐ']],
      venue: 'JOURNAL OF SERVICE SCIENCE AND MANAGEMENT · 2019', title: ['On Performance of Prioritized', 'Appointment Scheduling for Healthcare'], tsize: 30,
      sub: '優先度つきの医療予約スケジューリングの性能', authors: ['Yang Guo, Yong Yao'], url: 'doi.org/10.4236/jssm.2019.125040'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
    // scene 2: the new urgent patient slides in, the routine one is paused, then replaced
    var k = seg(t, 8.6, 10.0), y = ROWY + 2 * ROWH + 10;
    S.newU.setAttribute('transform', 'translate(' + (600 - k * 50) + ',' + y + ')');
    S.newU.setAttribute('opacity', 1 - seg(t, 12.6, 13.0));
    S.u2.setAttribute('opacity', seg(t, 12.6, 13.2));
    S.x2.setAttribute('opacity', seg(t, 10.2, 10.7) * (1 - seg(t, 12.6, 13.2)));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
