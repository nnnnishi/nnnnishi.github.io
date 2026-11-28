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
// teaser-scenes.js — Lange, Krüger, Schwientek, Jahn, Potential of non-port slot booking systems for TAS
// (HICL 2019). Unofficial explainer, from the published PDF (EconStor).
// Scene 1 is a schematic (labelled 模式図). Scene 2 uses the literature counts of Figure 2, scene 4 the
// total scores of Table 1 of the paper.
// Colours: orange = arrival peaks; blue = methods transferred from health care / the best-rated measure.
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
    { ja: 'コンテナターミナルでは<span class="A">トラックの到着が時間によって大きく変わる</span>。TAS は時間枠の予約でこれをならす。', en: '' },
    { ja: '時間枠予約の文献 9,566 件を 202 件まで絞ると、<span class="B">医療</span>が 143 件で最も多かった。', en: '' },
    { ja: '医療のオープンアクセス・重複予約・断片化の解消を、TAS 向けの 4 つの方策に作り直した。', en: '' },
    { ja: '5 つの基準で採点すると、<span class="B">固定の時間枠での重複予約</span>が 8 点で 1 位、断片化の解消は 6 点だった。', en: '' },
    { ja: '他業界の予約の知見を TAS へ移す可能性を、文献とベンチマークで評価した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: arrival peak vs booked slots =====
    var g1 = S.g[0], X0 = 70, BW = 40, Y0 = 400;
    T(g1, X0, 92, 'ターミナルへのトラックの到着（時間帯ごと）', { 'font-size': 15, fill: C.muted });
    var raw = [2, 3, 8, 10, 4, 3, 9, 11, 3, 2, 2, 2], flat = [5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5];
    S.bars1 = raw.map(function (v, i) {
      var r = box(g1, X0 + i * BW + 4, Y0 - v * 22, BW - 8, v * 22, v >= 8 ? C.a : C.gray, null, 2);
      fin(r, 0.6 + i * 0.12, 0.3);
      return { r: r, a: v, b: flat[i] };
    });
    el('line', { x1: X0, x2: X0 + 12 * BW, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, X0 + 12 * BW, Y0 + 24, '時刻 →', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    fin(TZ.panel(g1, PX, 150, 'TAS', C.ink, [['運送会社が時間枠を', 16], ['予約して到着する', 16], null, ['ピークが下がると、運営費と', 15, C.muted], ['待ち時間が減る', 15, C.muted]]), 3.4, 0.8);
    TZ.note(g1, '模式図（数値は解説者が置いた例）');

    // ===== scene 2: literature funnel (Figure 2) =====
    var g2 = S.g[1];
    T(g2, 70, 88, '文献の絞り込み（論文 Figure 2）', { 'font-size': 15, fill: C.muted });
    var stages = [['検索の結果（Scopus + Web of Science）', '9,566', 520], ['要旨まで絞り込んだあと', '2,496', 400], ['最後に残った文献', '202', 280]];
    stages.forEach(function (st, i) {
      var y = 108 + i * 84, w = st[2], x = 330 - w / 2, gg = el('g', {}, g2);
      box(gg, x, y, w, 64, i === 2 ? C.bsoft : '#fff', i === 2 ? C.b : C.ink, 10);
      T(gg, 330, y + 26, st[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      T(gg, 330, y + 52, st[1] + ' 件', { 'font-size': 18, 'font-weight': 700, fill: i === 2 ? C.b : C.ink, 'text-anchor': 'middle' });
      fin(gg, 8.6 + i * 0.9);
      if (i < 2) fin(arrow(g2, 330, y + 66, 330, y + 82, C.muted), 9.0 + i * 0.9);
    });
    [['交通・物流', 44, C.gray], ['医療', 143, C.b], ['IT', 15, C.gray]].forEach(function (c, i) {
      var x = 90 + i * 170, gg = el('g', {}, g2), h = c[1] * 0.5;
      box(gg, x, 470 - h, 130, h, c[2], null, 4);
      T(gg, x + 65, 470 - h - 8, c[1] + ' 件', { 'font-size': 15, 'font-weight': 650, fill: c[2] === C.b ? C.b : C.ink, 'text-anchor': 'middle' });
      T(gg, x + 65, 494, c[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      fin(gg, 11.4 + i * 0.4);
    });
    fin(TZ.panel(g2, PX, 150, '医療を参照先に', C.b, [['需要の変動、処理時間の', 15], ['ばらつき、無断キャンセル', 15], ['が TAS と似ている', 15], null, ['交通・物流と IT は', 14, C.muted], ['似ていないとして外した', 14, C.muted]]), 12.8, 0.8);
    TZ.note(g2, '論文 Figure 2 の件数から作図');

    // ===== scene 3: three health-care ideas -> four TAS measures =====
    var g3 = S.g[2];
    T(g3, 70, 96, '医療の考え方', { 'font-size': 15, fill: C.muted });
    T(g3, 380, 96, 'TAS の方策', { 'font-size': 15, fill: C.muted });
    var src3 = [['オープンアクセス', 150], ['重複予約', 255], ['断片化の解消（Lian ら）', 360]];
    var dst3 = [['オープンアクセス', 130], ['重複予約 (1) 固定の時間枠', 210], ['重複予約 (2) 柔軟な時間枠', 290], ['断片化の解消', 370]];
    src3.forEach(function (r, i) {
      var gg = el('g', {}, g3);
      box(gg, 70, r[1] - 26, 230, 52, C.bsoft, C.b, 10);
      T(gg, 185, r[1] + 6, r[0], { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
      fin(gg, 16.6 + i * 0.4);
    });
    dst3.forEach(function (r, i) {
      var gg = el('g', {}, g3);
      box(gg, 380, r[1] - 24, 230, 48, '#fff', C.ink, 10);
      T(gg, 495, r[1] + 6, r[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      fin(gg, 18.2 + i * 0.3);
    });
    [[0, 0], [1, 1], [1, 2], [2, 3]].forEach(function (m, k) {
      fin(arrow(g3, 302, src3[m[0]][1], 376, dst3[m[1]][1], C.b), 18.4 + k * 0.3);
    });
    fin(T(g3, 70, 440, '対象の工程：時間枠の予約と、枠ごとの台数の上限の決定', { 'font-size': 15, fill: C.ink }), 19.8);
    fin(TZ.panel(g3, PX + 20, 150, '断片化の解消', C.b, [['希望日時の近くの枠を、', 15], ['断片化を減らす効果の', 15], ['順に並べて提示する', 15], null, ['選ぶ義務はない', 14, C.muted]]), 20.4, 0.8);
    TZ.note(g3, '論文 3.2 節と 4.3.1 節をもとにした模式図');

    // ===== scene 4: Table 1 totals =====
    var g4 = S.g[3];
    T(g4, 70, 80, '5 つの基準（各 0〜3 点）の合計（論文 Table 1）', { 'font-size': 15, fill: C.muted });
    var X0 = 300, SC = 30;
    el('line', { x1: X0, x2: X0, y1: 110, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [0, 5, 10, 15].forEach(function (v) {
      el('line', { x1: X0 + v * SC, x2: X0 + v * SC, y1: 110, y2: 430, stroke: C.hair }, g4);
      T(g4, X0 + v * SC, 452, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    [['重複予約 (1) 固定の時間枠', 8, C.b], ['オープンアクセス', 7, C.gray], ['重複予約 (2) 柔軟な時間枠', 6, C.gray], ['断片化の解消', 6, C.gray]].forEach(function (r, i) {
      var y = 130 + i * 74;
      T(g4, X0 - 12, y + 30, r[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      grow(box(g4, X0, y + 8, 0, 36, r[2], null, 4), 'width', r[1] * SC, 24.6 + i * 0.5);
      fin(T(g4, X0 + r[1] * SC + 10, y + 33, r[1] + ' 点', { 'font-size': 16, 'font-weight': 650, fill: r[2] === C.gray ? C.ink : r[2] }), 25.2 + i * 0.5);
    });
    TZ.note(g4, '論文 Table 1 の数値から作図（採点は著者らによる主観評価）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['最高評価（15 点満点）', '固定の時間枠での重複予約 8 点'], ['Lian らの断片化の解消', '6 点']],
      venue: 'HICL · 2019', title: ['Potential of non-port slot', 'booking systems for TAS'], tsize: 32,
      sub: '港湾以外の時間枠予約を TAS に活かす可能性', authors: ['Ann-Kathrin Lange, Stephan Krüger,', 'Anne Kathrina Schwientek, Carlos Jahn'], url: 'doi.org/10.15480/882.2495'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    runKit(t);
    var k = seg(t, 4.6, 6.6), Y0 = 400;
    S.bars1.forEach(function (b) {
      var v = b.a + (b.b - b.a) * k;
      b.r.setAttribute('y', Y0 - v * 22); b.r.setAttribute('height', v * 22);
      b.r.setAttribute('fill', k > 0.5 ? C.b : (b.a >= 8 ? C.a : C.gray));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
