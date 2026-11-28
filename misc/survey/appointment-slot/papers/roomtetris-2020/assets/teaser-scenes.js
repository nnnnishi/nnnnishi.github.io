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
  // a row of slot cells (one resource's timeline). returns array of rects; fill set in render or here
  // o: {x, y, n, w, h, label, states:[0 free | 1 booked | 2 highlight-a | 3 highlight-b], gap}
  function slots(g, o) {
    var cells = [], gap = o.gap == null ? 3 : o.gap;
    if (o.label) T(g, o.x - 12, o.y + o.h / 2 + 6, o.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    for (var k = 0; k < o.n; k++) {
      var s = o.states ? o.states[k] : 0;
      cells.push(el('rect', { x: o.x + k * o.w, y: o.y, width: o.w - gap, height: o.h, rx: 4,
        fill: s === 1 ? C.gray : s === 2 ? C.a : s === 3 ? C.b : '#fff', stroke: s ? 'none' : C.hair, 'stroke-width': 1.4 }, g));
    }
    return cells;
  }
  function fillOf(s) { return s === 1 ? C.gray : s === 2 ? C.a : s === 3 ? C.b : s === 4 ? '#FCEBDF' : s === 5 ? C.bsoft : '#fff'; }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree, slots: slots, fillOf: fillOf };
})();
// =====================================================================
// teaser-scenes.js — Battiti, Brunato, Battiti, RoomTetris: an optimal procedure for committing rooms to
// reservations in hotels (JHTT 2020). Unofficial explainer, based on the abstract and on the description of
// RoomTetris in the authors' 2021 IJCHM paper. All scenes are schematics (labelled 模式図); no numbers from
// the 2020 paper are shown because its body was not read.
// Colours: orange = immediate assignment and its gaps / rejections; blue = RoomTetris.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約を受けた時点で部屋を決めると、<span class="A">短い滞在の間に隙間</span>が残り、長い滞在が入らない。', en: '' },
    { ja: '日ごとには空き室があるのに断るのは、割当のせいで起きる<span class="A">避けられる拒否</span>である。', en: '' },
    { ja: '<span class="B">RoomTetris</span> は部屋番号をチェックイン日まで決めず、その日に長い順に入れる。', en: '' },
    { ja: 'どの日も部屋数を超えて売っていなければ、客を移さずに全予約が入る。', en: '' },
    { ja: '割当を遅らせるだけで、避けられる拒否をなくす最適な手順。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660, W = 44;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: immediate assignment leaves gaps =====
    var g1 = S.g[0];
    T(g1, 150, 92, '日 1〜10（4 室）', { 'font-size': 15, fill: C.muted });
    var plan = [[1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [0, 1, 0, 1, 0, 0, 1, 0, 1, 0], [1, 1, 0, 1, 0, 1, 0, 0, 1, 0], [0, 1, 1, 0, 1, 0, 1, 1, 0, 1]];
    S.cells1 = plan.map(function (st, r) {
      return TZ.slots(g1, { x: 150, y: 120 + r * 58, n: 10, w: W, h: 40, label: '室 ' + (r + 1), states: st.map(function () { return 0; }) });
    });
    S.plan1 = plan;
    S.req1 = el('g', {}, g1);
    el('rect', { x: 150 + 2 * W, y: 370, width: 4 * W - 3, height: 36, rx: 6, fill: C.a, 'fill-opacity': 0.15, stroke: C.a, 'stroke-width': 2 }, S.req1);
    T(S.req1, 150 + 4 * W, 394, '4 泊の要求', { 'font-size': 15, 'text-anchor': 'middle', fill: C.a });
    T(S.req1, 150 + 6 * W + 16, 394, '→ どの部屋にも入らない', { 'font-size': 15, fill: C.a, 'font-weight': 650 });
    S.p1 = TZ.panel(g1, PX, 140, '即時割当', C.a, [['空き日数は半分あるのに', 15], ['連続した空きがない', 15], null, ['論文はこれを', 15, C.muted], ['「避けられる拒否」と呼ぶ', 15, C.muted]]);
    TZ.note(g1, '模式図（灰色は予約済みの日）');

    // ===== scene 2: avoidable vs inevitable rejection =====
    var g2 = S.g[1];
    T(g2, 150, 92, '同じ部屋割りの、日ごとの空き室数', { 'font-size': 15, fill: C.muted });
    S.cells2 = plan.map(function (st, r) { return TZ.slots(g2, { x: 150, y: 120 + r * 50, n: 10, w: W, h: 34, label: '室 ' + (r + 1), states: st }); });
    S.cnt2 = el('g', {}, g2);
    for (var k = 0; k < 10; k++) {
      var free = 4 - (plan[0][k] + plan[1][k] + plan[2][k] + plan[3][k]);
      T(S.cnt2, 150 + k * W + (W - 3) / 2, 342, String(free), { 'font-size': 18, 'font-weight': 650, 'text-anchor': 'middle', fill: free ? C.ink : C.a });
    }
    T(S.cnt2, 150 - 12, 342, '空き', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.q2 = el('g', {}, g2);
    T(S.q2, 150, 400, '日 3〜6 はどの日も空き室があるのに、4 泊の要求は入らない', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '拒否の 2 種類', C.a, [['避けられない拒否：', 15, C.ink, 600], ['その日が全室売れている', 15], null, ['避けられる拒否：', 15, C.a, 600], ['空きはあるのに、割当の', 15], ['せいで入らない', 15]]);
    TZ.note(g2, '模式図（区別は 2021 年の続編による）');

    // ===== scene 3: RoomTetris =====
    var g3 = S.g[2];
    T(g3, 150, 92, 'チェックイン日に、その日に始まる予約を長い順に入れる', { 'font-size': 15, fill: C.muted });
    S.cells3 = [0, 1, 2, 3].map(function (r) { return TZ.slots(g3, { x: 150, y: 120 + r * 58, n: 10, w: W, h: 40, label: '室 ' + (r + 1) }); });
    // stays [room, start, len, order]
    S.stays3 = [[0, 0, 7], [1, 0, 3], [2, 0, 1], [2, 1, 4], [1, 3, 2], [3, 1, 1], [3, 2, 6], [2, 5, 4], [1, 5, 4], [0, 7, 3]];
    S.r3 = S.stays3.map(function (st) {
      var g = el('g', {}, g3), x = 150 + st[1] * W, y = 120 + st[0] * 58;
      el('rect', { x: x, y: y, width: st[2] * W - 3, height: 40, rx: 6, fill: C.b, 'fill-opacity': 0.85 }, g);
      T(g, x + (st[2] * W - 3) / 2, y + 26, st[2] + ' 泊', { 'font-size': 14, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 600 });
      return { g: g, t0: 16.8 + st[1] * 0.55 + (7 - st[2]) * 0.04 };
    });
    S.req3 = el('g', {}, g3);
    T(S.req3, 150, 400, '受けた時点では部屋番号なし。どの日も部屋数以内なら全予約が入る', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, 'RoomTetris', C.b, [['割当をチェックイン日まで', 15], ['遅らせる', 15], null, ['将来の予約は', 15, C.muted], ['知らなくてよい', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: the guarantee =====
    var g4 = S.g[3];
    T(g4, 150, 92, '場面 3 の予約の日ごとの数（どの日も 4 室以内）', { 'font-size': 15, fill: C.muted });
    var cnt = [3, 4, 4, 4, 4, 4, 4, 4, 3, 1];  // day counts of the stays in scene 3
    S.b4 = cnt.map(function (c, k) {
      var h = c * 50;
      return { r: el('rect', { x: 150 + k * W, y: 330 - h, width: W - 6, height: 0, rx: 4, fill: C.b, 'fill-opacity': 0.8 }, g4), h: h, t0: 24.6 + k * 0.15 };
    });
    el('line', { x1: 140, x2: 150 + 10 * W, y1: 130, y2: 130, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, g4);
    T(g4, 132, 135, '部屋数 4', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.q4 = el('g', {}, g4);
    T(S.q4, 150, 390, 'この条件を満たせば、RoomTetris は全予約を部屋に入れられる', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    T(S.q4, 150, 425, '受けられる予約は、日ごとの部屋数の制約だけで決まる', { 'font-size': 15, fill: C.ink });
    S.p4 = TZ.panel(g4, PX, 140, '要旨の結果', C.b, [['最適性を証明した', 15], ['初めての手順', 15], null, ['シミュレータで拒否率を', 15, C.muted], ['大きく下げ、稼働率を上げる', 15, C.muted], ['効果は繁忙期に大きい', 15, C.muted]]);
    TZ.note(g4, '模式図（性質の説明は 2021 年の続編による）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['割当のタイミング', 'チェックイン日まで遅らせる'], ['性質', '避けられる拒否が 0']],
      venue: 'JHTT 2020', title: ['RoomTetris: an optimal procedure for', 'committing rooms to reservations in hotels'], tsize: 28,
      sub: 'RoomTetris：ホテルの予約に部屋を割り当てる最適な手順', authors: ['Roberto Battiti, Mauro Brunato, Filippo Battiti'], url: 'doi.org/10.1108/JHTT-08-2019-0108'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    // scene 1: booked days appear one column at a time
    S.cells1.forEach(function (row, r) {
      row.forEach(function (c, k) {
        var on = S.plan1[r][k] ? seg(t, 0.8 + k * 0.25, 1.2 + k * 0.25) : 0;
        c.setAttribute('fill', H.mix('#FFFFFF', C.gray, on));
      });
    });
    S.req1.setAttribute('opacity', seg(t, 4.0, 4.6));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.cnt2.setAttribute('opacity', seg(t, 9.2, 10.0));
    S.q2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.p2.setAttribute('opacity', seg(t, 12.2, 13.0));
    // scene 3: stays fill day by day (start-day order), longest first within a day
    S.r3.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.req3.setAttribute('opacity', seg(t, 21.6, 22.2));
    S.p3.setAttribute('opacity', seg(t, 17.4, 18.2));
    S.b4.forEach(function (b) { var k = H.ease(seg(t, b.t0, b.t0 + 0.6)); b.r.setAttribute('height', b.h * k); b.r.setAttribute('y', 330 - b.h * k); });
    S.q4.setAttribute('opacity', seg(t, 27.0, 27.6));
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
