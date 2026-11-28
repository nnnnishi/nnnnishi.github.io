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
// teaser-scenes.js — Creemers, Lambrecht, Beliën, Van den Broeke, Evaluation of appointment scheduling
// rules: A multi-performance measurement approach (Omega 2021). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses ranks stated in the 2013 working paper
// (IESEG 2013-MAN-01, Table 3 and text) — the published version's full text was not read.
// Colours: orange = block rules / the cost side; blue = individual and EL rules that rank high.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約の客は来なかったり遅れたりし、施術時間もばらつく。何時に呼ぶかで結果が変わる。', en: '' },
    { ja: '客の待ち時間、担当者の遊休時間、残業の 3 つは、1 つを減らすと別の指標が増えやすい。', en: '' },
    { ja: '<span class="B">314 のルール</span>を解析的に計算し、DEA で 1 つの指標にまとめて比べる。', en: '' },
    { ja: '作業論文では、<span class="A">ブロック型</span>は最良でも 72 位、Bailey–Welch は 23 位だった。', en: '' },
    { ja: '予約の受け方を、トレードオフの関係にある複数の指標で比べる手本。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: a session with uncertain customers =====
    var g1 = S.g[0];
    T(g1, 70, 80, '予約時刻（上）と実際の施術（下）', { 'font-size': 15, fill: C.muted });
    var X0 = 90, U = 50;
    el('line', { x1: X0, y1: 150, x2: X0 + 10 * U, y2: 150, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.ap1 = [];
    for (var i = 0; i < 8; i++) {
      var x = X0 + i * 1.2 * U;
      var c = el('circle', { cx: x, cy: 150, r: 7, fill: C.ink }, g1);
      var lb = T(g1, x, 128, String(i + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      S.ap1.push({ c: c, lb: lb, t0: 0.8 + i * 0.2 });
    }
    // actual services: [start, len, kind] kind: 0 normal, 1 no-show, 2 late
    var sv = [[0, 1.0, 0], [1.0, 1.5, 0], [2.6, 0.8, 0], [3.6, 0, 1], [4.8, 1.6, 0], [6.4, 0.9, 2], [7.3, 1.3, 0], [8.6, 1.4, 0]];
    S.sv1 = sv.map(function (s, k) {
      var y = 210, gg = el('g', {}, g1);
      if (s[2] === 1) {
        T(gg, X0 + s[0] * U + 10, y + 26, '来ない', { 'font-size': 14, fill: C.a, 'font-weight': 600 });
      } else {
        el('rect', { x: X0 + s[0] * U, y: y, width: s[1] * U - 3, height: 38, rx: 4, fill: s[2] === 2 ? C.a : C.gray }, gg);
        T(gg, X0 + s[0] * U + 6, y + 25, String(k + 1), { 'font-size': 14, fill: C.ink });
      }
      return { g: gg, t0: 2.6 + k * 0.35 };
    });
    S.l1 = T(g1, 90, 300, '橙：遅れて来た客。来ない客の分、担当者は待つ（遊休）', { 'font-size': 15, fill: C.ink });
    S.p1 = TZ.panel(g1, PX, 140, '不確かさ', C.ink, [['無断キャンセル', 15], ['遅刻・早着', 15], ['施術時間のばらつき', 15], ['中断、開始の遅れ', 15]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: three measures =====
    var g2 = S.g[1];
    var ms = [['客の待ち時間 W', '間隔を詰めると増える'], ['担当者の遊休 I', '間隔を空けると増える'], ['残業 O', '予定の終わりを越えた時間']];
    S.m2 = ms.map(function (m, i) {
      var row = el('g', {}, g2), y = 110 + i * 100;
      el('rect', { x: 70, y: y, width: 520, height: 78, rx: 10, fill: '#fff', stroke: C.hair }, row);
      T(row, 94, y + 34, m[0], { 'font-size': 18, 'font-weight': 650, fill: C.ink });
      T(row, 94, y + 60, m[1], { 'font-size': 15, fill: C.muted });
      return { row: row, t0: 8.8 + i * 0.8 };
    });
    S.p2 = TZ.panel(g2, PX, 140, '3 つの指標', C.ink, [['どれか 1 つを良くすると', 15], ['ほかが悪くなりやすい', 15], null, ['どの重みで比べるかで', 15, C.muted], ['結論が変わりうる', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: rule types =====
    var g3 = S.g[2];
    var types = [['個別型', [0, 0, 1, 2, 3, 4, 5, 6], C.b], ['ブロック型（2 人ずつ）', [0, 0, 2, 2, 4, 4, 6, 6], C.a], ['補正型（EL）', [0, 0, 1.1, 2.2, 3.2, 4.3, 5.2, 6.1], C.b]];
    S.t3 = types.map(function (tp, i) {
      var row = el('g', {}, g3), y = 120 + i * 100;
      T(row, 70, y, tp[0], { 'font-size': 16, 'font-weight': 600, fill: tp[2] });
      el('line', { x1: 90, y1: y + 40, x2: 560, y2: y + 40, stroke: C.hair, 'stroke-width': 1.5 }, row);
      var seen = {};
      tp[1].forEach(function (v) {
        var key = v.toFixed(1); seen[key] = (seen[key] || 0) + 1;
        el('circle', { cx: 100 + v * 70, cy: y + 40 - (seen[key] - 1) * 18, r: 7, fill: tp[2] }, row);
      });
      return { row: row, t0: 16.8 + i * 0.9 };
    });
    T(g3, 70, 450, '点：予約時刻（重なる点は同じ時刻に呼ぶ人）', { 'font-size': 14, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 140, '評価の方法', C.b, [['マルコフ連鎖で', 15], ['W・I・O を厳密に計算', 15], null, ['DEA：各ルールに最も', 15], ['有利な重みで合成', 15], null, ['CI = v_o O + v_i I + v_w W', 15, C.b, 600]]);
    TZ.note(g3, '模式図（間隔は解説者が置いた例）');

    // ===== scene 4: ranks in the working paper =====
    var g4 = S.g[3];
    T(g4, 70, 70, '同じ重みでの順位（2013 年の作業論文、客 30 人で 314 ルール）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var ranks = [['個別型の上位', 1, '1 位（指標 99.9980%）', C.b], ['Bailey–Welch', 23, '23 位（99.8136%）', C.ink], ['ブロック型の最良', 72, '72 位', C.a], ['ブロック型 2 番目', 84, '84 位', C.a], ['ブロック型 3 番目', 89, '89 位', C.a]];
    var AX = 270, AW = 560, RMAX = 100;
    el('line', { x1: AX, y1: 96, x2: AX + AW, y2: 96, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [1, 25, 50, 75, 100].forEach(function (r) {
      T(g4, AX + (r - 1) / (RMAX - 1) * AW, 90, r + ' 位', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.r4 = ranks.map(function (r, i) {
      var row = el('g', {}, g4), y = 130 + i * 62;
      T(row, AX - 14, y + 6, r[0], { 'font-size': 15, fill: r[3], 'text-anchor': 'end' });
      var x = AX + (r[1] - 1) / (RMAX - 1) * AW;
      el('line', { x1: AX, y1: y, x2: x, y2: y, stroke: C.hair, 'stroke-width': 2 }, row);
      el('circle', { cx: x, cy: y, r: 9, fill: r[3] }, row);
      T(row, x + (r[1] > 60 ? -14 : 14), y - 14, r[2], { 'font-size': 14, 'font-weight': 600, fill: r[3], 'text-anchor': r[1] > 60 ? 'end' : 'start' });
      return { row: row, t0: 24.6 + i * 0.9 };
    });
    TZ.note(g4, '作業論文の Table 3 と本文の値から作図（出版版は未確認）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['評価した予約ルール', '314'], ['ブロック型の最良', '72 位（作業論文）']],
      venue: 'OMEGA 2021', title: ['Evaluation of appointment scheduling rules:', 'A multi-performance measurement approach'], tsize: 28,
      sub: '予約ルールの評価：複数の評価指標による方法', authors: ['S. Creemers, M. R. Lambrecht, J. Beliën, M. Van den Broeke'], url: 'doi.org/10.1016/j.omega.2020.102231'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.ap1.forEach(function (a) { var v = seg(t, a.t0, a.t0 + 0.3); a.c.setAttribute('opacity', v); a.lb.setAttribute('opacity', v); });
    S.sv1.forEach(function (s) { s.g.setAttribute('opacity', seg(t, s.t0, s.t0 + 0.3)); });
    S.l1.setAttribute('opacity', seg(t, 5.8, 6.4));
    S.p1.setAttribute('opacity', seg(t, 4.0, 4.8));
    S.m2.forEach(function (m) { m.row.setAttribute('opacity', seg(t, m.t0, m.t0 + 0.5)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.t3.forEach(function (x) { x.row.setAttribute('opacity', seg(t, x.t0, x.t0 + 0.5)); });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.r4.forEach(function (r) { r.row.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.5)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
