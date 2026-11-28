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
// teaser-scenes.js — Patrick, Puterman, Queyranne, Dynamic Multipriority Patient Scheduling for a
// Diagnostic Resource (Operations Research 2008). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy numbers (labelled 模式図). Scene 4 uses Table 1 of the paper.
// Colours: orange = fixed booking-limit policy; blue = approximate optimal policy (AOP).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '毎日、優先度の違う検査の依頼が来る。目標日までに、どの日の枠に入れるかを決める。', en: '' },
    { ja: '状態は「各日の予約済み枠数」と「優先度別の待ち患者数」。組合せが膨大で、そのままでは解けない。', en: '' },
    { ja: '<span class="B">価値関数を一次式で近似</span>すると、係数は日数と優先度の数ほどになり、列生成で解ける。', en: '' },
    { ja: '小さな診療所の例では、目標に遅れた患者が<span class="A">予約上限の方策</span>の 9.69% から 0.11% に減った。', en: '' },
    { ja: '予約表の良さを、状態の特徴量の一次式で評価する近似動的計画法の代表作。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  var DAYS = 10, CAP = 5;
  var booked = [5, 5, 4, 4, 3, 2, 2, 1, 0, 0];

  function grid(g, x0, y0, fills) {
    var cells = [];
    for (var n = 0; n < DAYS; n++) {
      T(g, x0 + n * 50 + 21, y0 + CAP * 34 + 24, String(n + 1), { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
      for (var k = 0; k < CAP; k++) {
        var on = k < fills[n];
        var r = el('rect', { x: x0 + n * 50, y: y0 + (CAP - 1 - k) * 34, width: 42, height: 28, rx: 4, fill: on ? C.gray : '#fff', stroke: C.hair, 'stroke-width': 1.2 }, g);
        cells.push({ r: r, n: n, k: k });
      }
    }
    T(g, x0, y0 - 14, '予約表（列：日、1 日 5 枠）', { 'font-size': 14, fill: C.muted });
    return cells;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: requests of three priorities =====
    var g1 = S.g[0];
    S.cells1 = grid(g1, 70, 110, booked);
    var cols = [C.a, C.b, C.ink], labs = ['優先度1（7日以内）', '優先度2（14日以内）', '優先度3（21日以内）'];
    S.req1 = [];
    labs.forEach(function (s, i) {
      var r = el('g', {}, g1);
      el('circle', { cx: 90 + i * 170, cy: 380, r: 10, fill: cols[i] }, r);
      T(r, 106 + i * 170, 386, s, { 'font-size': 14, fill: C.ink });
      S.req1.push(r);
    });
    // new bookings: priority 1 into day 3, priority 2 into day 6, priority 3 into day 9
    S.new1 = [[2, 4, 0], [5, 2, 1], [8, 0, 2]].map(function (p, i) {
      return el('rect', { x: 70 + p[0] * 50, y: 110 + (CAP - 1 - p[1]) * 34, width: 42, height: 28, rx: 4, fill: cols[p[2]] }, g1);
    });
    S.p1 = TZ.panel(g1, PX, 140, '毎日決めること', C.ink, [['どの日に入れるか', 16], ['残業・他院紹介に回すか', 16], ['翌日に持ち越すか', 16], null, ['目標日を過ぎると罰', 15, C.a], ['残業・紹介にも費用', 15, C.a]]);
    TZ.note(g1, '模式図（数値は解説者が置いた例）');

    // ===== scene 2: state explosion =====
    var g2 = S.g[1];
    T(g2, 70, 110, '状態 s = (x, y)', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    T(g2, 70, 160, 'x = (x₁, …, x_N)：各日の予約済み枠数', { 'font-size': 17, fill: C.ink });
    T(g2, 70, 194, 'y = (y₁, …, y_I)：優先度別の待ち患者数', { 'font-size': 17, fill: C.ink });
    S.cnt2 = el('text', { x: 70, y: 300, 'font-size': 40, 'font-weight': 650, fill: C.a }, g2);
    S.cnt2.textContent = '11³⁰ ≈ 1.7 × 10³¹ 通り';
    T(g2, 70, 340, '1 日 10 枠・30 日先なら、x だけで 11 の 30 乗（解説者の計算）', { 'font-size': 15, fill: C.muted });
    S.p2 = TZ.panel(g2, PX, 140, '次元の呪い', C.a, [['状態の数は組合せで', 16], ['爆発的に増える', 16], null, ['ベルマン方程式を', 15, C.muted], ['そのまま解けない', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: linear value function approximation =====
    var g3 = S.g[2];
    T(g3, 70, 96, 'v(x, y) ≈ W₀ + Σ Vₙ xₙ + Σ Wᵢ yᵢ', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    var vs = [];
    for (var n = 0; n < 14; n++) vs.push(n < 7 ? 1 : Math.pow(0.9, n - 6));
    S.bars3 = vs.map(function (v, n) {
      var h = 170 * v;
      var r = el('rect', { x: 80 + n * 34, y: 330 - h, width: 26, height: h, fill: C.b, 'fill-opacity': n < 7 ? 1 : 0.75 }, g3);
      return { r: r, h: h, t0: 16.8 + n * 0.12 };
    });
    el('line', { x1: 74, x2: 560, y1: 330, y2: 330, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: 317, x2: 317, y1: 140, y2: 330, stroke: C.a, 'stroke-dasharray': '4 4' }, g3);
    T(g3, 322, 150, 'T(1)', { 'font-size': 14, fill: C.a });
    T(g3, 80, 356, 'Vₙ：n 日目の枠が 1 つ埋まっている費用（定理 1 の形）', { 'font-size': 14, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 140, '近似線形計画', C.b, [['未知数は N + I + 1 個', 16], ['制約は膨大なので', 16], ['双対で列生成', 16], null, ['係数から単純な', 15, C.muted], ['予約規則が出る', 15, C.muted]]);
    TZ.note(g3, '模式図（高さは解説者が置いた例）');

    // ===== scene 4: Table 1 =====
    var g4 = S.g[3];
    T(g4, 70, 64, '小さな診療所・残業ありの場合（論文 Table 1、%）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 300, x1: 840, v0: 0, v1: 100, y0: 110, rowH: 100, t0: 24.6, dt: 0.8,
      ticks: [0, 25, 50, 75, 100],
      rows: [
        { label: '目標に遅れた患者', a: 9.69, b: 0.11, la: '予約上限 9.69', lb: '提案 0.11' },
        { label: '残業に回した患者', a: 4.20, b: 0.78, la: '予約上限 4.20', lb: '提案 0.78' },
        { label: '稼働率', a: 95.73, b: 99.05, la: '95.73', lb: '99.05' }
      ]
    });
    TZ.note(g4, '論文 Table 1 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['目標に遅れた患者（小さな診療所）', '9.69% → 0.11%'], ['稼働率', '95.73% → 99.05%']],
      venue: 'OPERATIONS RESEARCH 2008', title: ['Dynamic Multipriority Patient', 'Scheduling for a Diagnostic Resource'], tsize: 30,
      sub: '診断設備のための、複数の優先度をもつ患者の動的な予約', authors: ['Jonathan Patrick, Martin L. Puterman, Maurice Queyranne'], url: 'doi.org/10.1287/opre.1080.0590'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.req1.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 1.0 + i * 0.4, 1.5 + i * 0.4)); });
    S.new1.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 2.6 + i * 0.9, 3.2 + i * 0.9)); });
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.cnt2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.bars3.forEach(function (b) { var v = seg(t, b.t0, b.t0 + 0.5); b.r.setAttribute('height', b.h * v); b.r.setAttribute('y', 330 - b.h * v); });
    S.p3.setAttribute('opacity', seg(t, 19.0, 19.8));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
