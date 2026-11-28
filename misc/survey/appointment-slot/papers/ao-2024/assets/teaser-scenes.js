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
// teaser-scenes.js — Ao, Fu, Simchi-Levi, Two-stage Online Reusable Resource Allocation: Reservation,
// Overbooking and Confirmation Call (arXiv 2410.15245v2). Unofficial explainer.
// All scenes are schematics (labelled 模式図). Scene 4 shows the orders Omega(T) and O(1) stated in
// Proposition 1 and Corollary 1, not simulated values.
// Colours: orange = losses (idle rooms, turned-away guests, linear regret); blue = DASS policies.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約は確認連絡まで無料で取り消せる。当日には予約なしの飛び込み客も来る。', en: '' },
    { ja: '少なく受けると<span class="A">空室</span>が残り、多く受けると<span class="A">泊められない客</span>が出る。', en: '' },
    { ja: '<span class="B">DASS</span> は残る見込みに安全在庫を足した予約数が、控えめな部屋数を超えたら断る。', en: '' },
    { ja: '飛び込み客がいないと後悔は期間に比例する。繁忙期なら DASS の後悔は定数に収まる。', en: '' },
    { ja: '取り消し、確認連絡、飛び込み客、連泊をまとめて扱う予約受付の研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the two stages of day k =====
    var g1 = S.g[0];
    var X0 = 80, X1 = 600, XC = 430, XK = 470;
    el('line', { x1: X0, x2: X1, y1: 300, y2: 300, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, X0, 330, 'k − k₀', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    T(g1, XK, 330, 'k 日目', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: XK, x2: XK, y1: 120, y2: 300, stroke: C.ink, 'stroke-width': 1.2 }, g1);
    S.call1 = el('g', {}, g1);
    el('line', { x1: XC, x2: XC, y1: 120, y2: 300, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, S.call1);
    T(S.call1, XC - 6, 112, '確認連絡', { 'font-size': 14, fill: C.b, 'text-anchor': 'end' });
    T(g1, (X0 + XC) / 2, 100, '第 1 段階：予約', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, (XK + X1) / 2 + 10, 100, '第 2 段階：当日', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    var bk = [[100, 0], [140, 1], [175, 0], [210, 0], [250, 1], [285, 0], [320, 0], [350, 1], [380, 0], [405, 0]];
    S.bk1 = bk.map(function (b, i) {
      var y = 270 - (i % 4) * 34;
      var r = el('rect', { x: b[0] - 12, y: y - 14, width: 24, height: 24, rx: 4, fill: '#fff', stroke: C.ink, 'stroke-width': 1.4 }, g1);
      var x = el('text', { x: b[0], y: y + 4, 'font-size': 16, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' }, g1); x.textContent = '×';
      return { r: r, x: x, cancel: b[1], t0: 0.8 + i * 0.3 };
    });
    S.wk1 = [500, 530, 560, 590].map(function (x, i) {
      var c = el('circle', { cx: x, cy: 270 - (i % 2) * 40, r: 11, fill: C.b }, g1);
      return { c: c, t0: 5.0 + i * 0.3 };
    });
    T(g1, X0, 380, '□ 予約　× 取り消し　● 飛び込み客', { 'font-size': 14, fill: C.muted });
    S.p1 = TZ.panel(g1, PX, 140, '2 段階の流れ', C.ink, [['予約が残る確率 p(t) は', 15], ['時刻とともに増える', 15], null, ['取り消しは確認連絡で', 15, C.muted], ['確定する', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: idle rooms vs turned away =====
    var g2 = S.g[1];
    function rooms(g, x0, title, filled, extra, col) {
      T(g, x0, 120, title, { 'font-size': 15, 'font-weight': 600, fill: col });
      for (var i = 0; i < 10; i++) {
        var x = x0 + (i % 5) * 44, y = 140 + Math.floor(i / 5) * 54;
        el('rect', { x: x, y: y, width: 36, height: 42, rx: 5, fill: i < filled ? C.gray : '#fff', stroke: i < filled ? C.gray : C.a, 'stroke-width': i < filled ? 1 : 2.2 }, g);
      }
      for (var j = 0; j < extra; j++) el('circle', { cx: x0 + 18 + j * 44, cy: 290, r: 13, fill: C.a }, g);
    }
    S.l2 = el('g', {}, g2); rooms(S.l2, 70, '受けすぎない場合', 7, 0, C.ink);
    T(S.l2, 70, 340, '空室 3 部屋 → 損失 3r', { 'font-size': 15, fill: C.a });
    S.r2 = el('g', {}, g2); rooms(S.r2, 350, '受けすぎた場合', 10, 2, C.ink);
    T(S.r2, 350, 340, '泊められない客 2 人 → 損失 2ℓ', { 'font-size': 15, fill: C.a });
    T(g2, 70, 410, '部屋数 C = 10。灰色はチェックインした客', { 'font-size': 14, fill: C.muted });
    S.p2 = TZ.panel(g2, PX, 140, '2 種類の損失', C.a, [['空室 1 つで r', 16], ['泊められない客 1 人で ℓ', 16], null, ['取り消しの数は', 15, C.muted], ['予約の時点では分からない', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: DASS-I threshold =====
    var g3 = S.g[2];
    T(g3, 70, 80, 'k 日目の予約の受付（DASS-I）', { 'font-size': 15, fill: C.muted });
    var BX0 = 100, BW = 460;
    S.cap3 = el('line', { x1: BX0 + BW * 0.8, x2: BX0 + BW * 0.8, y1: 130, y2: 300, stroke: C.ink, 'stroke-width': 2 }, g3);
    T(g3, BX0 + BW * 0.8, 122, 'Ĉ = C − 連泊分 − 余裕', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    el('rect', { x: BX0, y: 160, width: BW, height: 40, rx: 4, fill: C.panel }, g3);
    S.base3 = el('rect', { x: BX0, y: 160, width: 0, height: 40, fill: C.b }, g3);
    S.safe3 = el('rect', { x: BX0, y: 160, width: 0, height: 40, fill: C.b, 'fill-opacity': 0.35 }, g3);
    T(g3, BX0, 230, '濃い色：p(t) × 受けた予約数　薄い色：安全在庫', { 'font-size': 14, fill: C.muted });
    S.st3 = el('text', { x: BX0, y: 280, 'font-size': 16, 'font-weight': 650, fill: C.b }, g3);
    T(g3, BX0, 340, '安全在庫は取り消しのばらつきの平方根に比例し、', { 'font-size': 15, fill: C.ink });
    T(g3, BX0, 368, '当日に近づき p(t) → 1 になると小さくなる', { 'font-size': 15, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, 'DASS', C.b, [['その日の情報だけで', 15], ['上限を決める', 15], null, ['当日は飛び込み客を', 15, C.muted], ['同じ考え方で受ける', 15, C.muted], ['（DASS-II）', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: regret orders =====
    var g4 = S.g[3];
    var AX0 = 120, AX1 = 580, AY0 = 400, AY1 = 120;
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    T(g4, AX1, AY0 + 28, '期間 T', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    T(g4, AX0 - 10, AY1 + 4, '後悔', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    S.lin4 = el('line', { x1: AX0, y1: AY0, x2: AX0, y2: AY0, stroke: C.a, 'stroke-width': 3.5 }, g4);
    S.linl = T(g4, AX0 + 20, AY1 + 10, '飛び込み客が少ない：Ω(T)', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.flat4 = el('line', { x1: AX0, y1: AY0 - 40, x2: AX0, y2: AY0 - 40, stroke: C.b, 'stroke-width': 3.5 }, g4);
    S.flatl = T(g4, AX1, AY0 - 52, '繁忙期の DASS：O(1)', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    S.ax4 = [AX0, AX1, AY0, AY1];
    S.p4 = TZ.panel(g4, PX, 140, '結果', C.ink, [['Proposition 1：', 15, C.a, 600], ['どの方策も Ω(T)', 15, C.a], null, ['Corollary 1：', 15, C.b, 600], ['C を固定したまま O(1)', 15, C.b], null, ['確認連絡は早いほど', 15, C.muted], ['後悔が小さい', 15, C.muted]]);
    TZ.note(g4, '模式図（増え方の次数だけを示す）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['繁忙期の後悔', 'O(1)'], ['飛び込み客が少ないと', 'Ω(T)']],
      venue: 'ARXIV 2024', title: ['Two-stage Online Reusable Resource Allocation:', 'Reservation, Overbooking and Confirmation Call'], tsize: 26,
      sub: '予約、オーバーブッキング、確認連絡を含む 2 段階の配分',
      authors: ['Ruicheng Ao, Hengyu Fu, David Simchi-Levi'], url: 'arxiv.org/abs/2410.15245'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.bk1.forEach(function (b) {
      b.r.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.3));
      b.x.setAttribute('opacity', b.cancel ? seg(t, b.t0 + 1.2, b.t0 + 1.5) : 0);
    });
    S.call1.setAttribute('opacity', seg(t, 4.0, 4.5));
    S.wk1.forEach(function (w) { w.c.setAttribute('opacity', seg(t, w.t0, w.t0 + 0.3)); });
    S.p1.setAttribute('opacity', seg(t, 5.4, 6.2));
    S.l2.setAttribute('opacity', seg(t, 8.6, 9.2));
    S.r2.setAttribute('opacity', seg(t, 10.0, 10.6));
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.2));
    // scene 3: bookings accumulate; p(t) rises; safety stock shrinks
    var u = seg(t, 16.6, 21.6);
    var booked = 0.45 + 0.35 * u, p = 0.7 + 0.3 * u, safe = 0.22 * (1 - u) + 0.05;
    var base = booked * p * 0.95, w = 460;
    S.base3.setAttribute('width', w * base);
    S.safe3.setAttribute('x', 100 + w * base);
    S.safe3.setAttribute('width', w * safe);
    var reject = base + safe >= 0.8;
    S.st3.textContent = reject ? 'B̂ ≥ Ĉ → この予約は断る' : 'B̂ < Ĉ → 予約を受ける';
    S.st3.setAttribute('fill', reject ? C.a : C.b);
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    var a = S.ax4, k1 = seg(t, 24.8, 27.0), k2 = seg(t, 26.0, 28.2);
    S.lin4.setAttribute('x2', a[0] + (a[1] - a[0]) * k1);
    S.lin4.setAttribute('y2', a[2] - (a[2] - a[3] - 20) * k1);
    S.linl.setAttribute('opacity', seg(t, 26.6, 27.2));
    S.flat4.setAttribute('x2', a[0] + (a[1] - a[0]) * k2);
    S.flatl.setAttribute('opacity', seg(t, 27.8, 28.4));
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
