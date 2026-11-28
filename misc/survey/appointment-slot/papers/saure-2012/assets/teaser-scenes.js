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
      var single = (r.a == null) !== (r.b == null);   // one bar only: centre it in the row
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + (single ? bh / 2 : k[2] * (bh + 2)), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + (single ? bh / 2 : k[2] * (bh + 2)) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
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
// teaser-scenes.js — Sauré, Patrick, Tyldesley, Puterman, Dynamic multi-appointment patient scheduling for
// radiation therapy (EJOR 2012). Unofficial explainer written from the abstract only (body not read).
// All scenes are schematics (labelled 模式図); there are no numerical results in this teaser.
// Colours: orange = treatment delay / wasted capacity, the problem; blue = the MDP + affine ADP approach.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '放射線治療の開始が<span class="A">遅れる</span>と、患者の苦痛やがんの制御に悪い影響がありうる。', en: '' },
    { ja: '1 人の患者が何回も治療に通うので、1 件の受付が先の複数の日の容量を使う。', en: '' },
    { ja: '<span class="B">提案法</span>は届いた患者に容量を割り当てる問題を割引つき無限期間の MDP で書く。', en: '' },
    { ja: '状態が多すぎるので、価値関数をアフィン関数で近似し、等価な線形計画を列生成で解く。', en: '' },
    { ja: 'BCCA のデータにもとづくシミュレーションで、得られた方策を評価した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var DAYS = 10, X0 = 90, CW = 50, Y0 = 130, RH = 54;

  function grid(g, rows) {
    for (var d = 0; d < DAYS; d++) T(g, X0 + d * CW + CW / 2, Y0 - 14, String(d + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    for (var r = 0; r < rows; r++) for (var d2 = 0; d2 < DAYS; d2++)
      el('rect', { x: X0 + d2 * CW + 2, y: Y0 + r * RH + 2, width: CW - 4, height: RH - 4, rx: 4, fill: C.panel }, g);
  }
  function block(g, row, d0, n, color) {
    var out = [];
    for (var k = 0; k < n; k++) out.push(el('rect', { x: X0 + (d0 + k) * CW + 2, y: Y0 + row * RH + 2, width: CW - 4, height: RH - 4, rx: 4, fill: color }, g));
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: waiting patients =====
    var g1 = S.g[0];
    T(g1, 70, 80, '治療の開始を待つ患者', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.q1 = [];
    for (var i = 0; i < 6; i++) {
      var pg = el('g', {}, g1), x = 110 + i * 78;
      el('circle', { cx: x, cy: 200, r: 18, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, pg);
      el('rect', { x: x - 18, y: 224, width: 36, height: 50, rx: 10, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, pg);
      S.q1.push({ g: pg, t0: 0.8 + i * 0.4 });
    }
    S.arrow1 = el('g', {}, g1);
    el('line', { x1: 100, x2: 540, y1: 320, y2: 320, stroke: C.a, 'stroke-width': 2.5 }, S.arrow1);
    el('path', { d: 'M540 312 L556 320 L540 328 Z', fill: C.a }, S.arrow1);
    T(S.arrow1, 100, 352, '待ち時間が延びる', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p1 = TZ.panel(g1, PX, 150, '開始の遅れの害', C.a, [['苦痛、生活の質の低下', 15], ['がんの制御や生存の悪化', 15], null, ['治療に使う資源は高価で', 15, C.muted], ['使い方に無駄が出やすい', 15, C.muted]]);
    TZ.note(g1, '模式図（要旨にもとづく）');

    // ===== scene 2: multi-appointment blocks =====
    var g2 = S.g[1];
    T(g2, 70, 80, '治療装置の予約表（列：日）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    grid(g2, 4);
    S.bl2 = [
      { r: block(g2, 0, 0, 5, C.gray), t0: 9.0 },
      { r: block(g2, 1, 2, 6, C.gray), t0: 9.6 },
      { r: block(g2, 2, 1, 4, C.gray), t0: 10.2 },
      { r: block(g2, 3, 4, 5, C.a), t0: 11.0 }
    ];
    S.lb2 = T(g2, X0, Y0 + 4 * RH + 34, '新しい患者 1 人が先の 5 日分の枠を使う', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p2 = TZ.panel(g2, PX, 150, '複数回の予約', C.a, [['1 件の受付が', 15], ['先の複数の日の容量を使い、', 15], ['その後の受付に長く響く', 15]]);
    TZ.note(g2, '模式図（日数と人数は解説者が置いた例）');

    // ===== scene 3: MDP loop =====
    var g3 = S.g[2];
    function box(g, x, y, w, h, s1, s2, col) {
      var b = el('g', {}, g);
      el('rect', { x: x, y: y, width: w, height: h, rx: 12, fill: '#fff', stroke: col, 'stroke-width': 2 }, b);
      T(b, x + w / 2, y + h / 2 - 4, s1, { 'font-size': 16, 'font-weight': 650, fill: col, 'text-anchor': 'middle' });
      T(b, x + w / 2, y + h / 2 + 20, s2, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return b;
    }
    S.m3 = [
      box(g3, 80, 120, 200, 80, '状態', '予約表と待つ患者', C.b),
      box(g3, 360, 120, 200, 80, '行動', '治療の開始日を決める', C.b),
      box(g3, 220, 300, 200, 80, '費用と次の状態', '新しい患者が届く', C.b)
    ];
    S.ar3 = el('g', {}, g3);
    [['M280 160 L356 160'], ['M480 204 L400 296'], ['M240 296 L170 204']].forEach(function (d) {
      el('path', { d: d[0], stroke: C.b, 'stroke-width': 2.2, fill: 'none', 'marker-end': '' }, S.ar3);
    });
    T(S.ar3, 320, 440, '割引つきの将来の費用の合計を最小にする', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 150, 'マルコフ決定過程', C.b, [['割引つき・無限期間', 15], ['費用効果のよい容量の', 15], ['割り当てを求める', 15], null, ['状態の数が膨大で', 15, C.muted], ['そのままでは解けない', 15, C.muted]]);
    TZ.note(g3, '模式図（要旨にもとづく）');

    // ===== scene 4: affine approximation + column generation =====
    var g4 = S.g[3];
    S.eq4 = T(g4, 90, 140, 'V(状態) ≈ W₀ + Σ Wᵢ × 状態の変数ᵢ', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    S.l4a = T(g4, 90, 190, '価値関数を 1 次式（アフィン関数）で近似する', { 'font-size': 15, fill: C.ink });
    S.cols4 = [];
    for (var c = 0; c < 8; c++) {
      var r = el('rect', { x: 100 + c * 52, y: 250, width: 40, height: 150, rx: 4, fill: C.b, 'fill-opacity': 0.25 + 0.09 * c }, g4);
      S.cols4.push({ r: r, t0: 26.6 + c * 0.35 });
    }
    S.l4b = T(g4, 90, 440, '等価な線形計画に、必要な列だけを順に足して解く（列生成）', { 'font-size': 15, fill: C.ink });
    S.p4 = TZ.panel(g4, PX, 150, '近似動的計画法', C.b, [['変数が近似の係数だけに', 15], ['減る', 15], null, ['列生成で', 15, C.muted], ['大きな線形計画を解く', 15, C.muted]]);
    TZ.note(g4, '模式図（式は一般形。論文の記号とは異なる）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['題材', 'BC がん機関の放射線治療'], ['解き方', 'アフィン近似＋列生成']],
      venue: 'EJOR 2012', title: ['Dynamic multi-appointment patient', 'scheduling for radiation therapy'], tsize: 30,
      sub: '放射線治療のための複数回予約の動的な患者スケジューリング', authors: ['Antoine Sauré, Jonathan Patrick, Scott Tyldesley, Martin L. Puterman'], url: 'doi.org/10.1016/j.ejor.2012.06.046'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.q1.forEach(function (q) { q.g.setAttribute('opacity', seg(t, q.t0, q.t0 + 0.4)); });
    S.arrow1.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    S.bl2.forEach(function (b) { b.r.forEach(function (r, k) { r.setAttribute('opacity', seg(t, b.t0 + k * 0.1, b.t0 + k * 0.1 + 0.3)); }); });
    S.lb2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.m3.forEach(function (m, i) { m.setAttribute('opacity', seg(t, 16.6 + i * 0.7, 17.1 + i * 0.7)); });
    S.ar3.setAttribute('opacity', seg(t, 19.0, 19.6));
    S.p3.setAttribute('opacity', seg(t, 19.8, 20.6));
    S.eq4.setAttribute('opacity', seg(t, 24.6, 25.2));
    S.l4a.setAttribute('opacity', seg(t, 25.4, 26.0));
    S.cols4.forEach(function (c) { c.r.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.3)); });
    S.l4b.setAttribute('opacity', seg(t, 29.6, 30.2));
    S.p4.setAttribute('opacity', seg(t, 30.0, 30.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
