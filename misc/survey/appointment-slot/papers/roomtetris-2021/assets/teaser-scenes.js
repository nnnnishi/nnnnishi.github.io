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
// teaser-scenes.js — Battiti, Brunato, Battiti, RoomTetris in room committing: why the role of
// minimum-length-of-stay requirements should be revisited (IJCHM 2021). Unofficial explainer.
// Scenes 1 and 3 are schematics with explainer-chosen toy room plans (labelled 模式図). Scene 2 uses the
// rejection rates stated in Section 3 of the paper; scene 4 uses Table 1 (case A).
// Colours: orange = immediate assignment and its gaps / rejections; blue = RoomTetris.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約を受けた時点で部屋を決めると、<span class="A">短い滞在の間に隙間</span>が残る。', en: '' },
    { ja: '10室・稼働率50%でも、7泊の要求の約92%は入る部屋がない。', en: '' },
    { ja: '<span class="B">RoomTetris</span> は部屋番号をチェックイン日まで決めず、その日に長い順に入れる。', en: '' },
    { ja: '50室・1年の現実的な需要で、拒否率はランダムな割当の 12.07% から 0% になった。', en: '' },
    { ja: '部屋割りで長い滞在を守れるなら、最短滞在日数の制限は見直せる。', en: '' }
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

    // ===== scene 2: rejection probability by stay length =====
    var g2 = S.g[1];
    T(g2, 70, 70, '10 室・稼働率 50%（1 泊の予約がランダムに入った部屋割り）', { 'font-size': 15, fill: C.muted });
    var data = [[2, 5], [3, 26], [4, 52], [7, 92]];
    var X0 = 160, X1 = 560;
    el('line', { x1: X0, x2: X0, y1: 100, y2: 420, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = data.map(function (d, i) {
      var y = 115 + i * 76;
      T(g2, X0 - 12, y + 32, d[0] + ' 泊', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y + 8, width: 0, height: 36, fill: C.a, 'fill-opacity': 0.4 + 0.6 * d[1] / 92 }, g2);
      var lab = el('text', { x: X0 + (X1 - X0) * d[1] / 100 + 8, y: y + 33, 'font-size': 16, 'font-weight': 650, fill: C.a }, g2);
      lab.textContent = (d[0] === 2 ? '約 ' : '') + d[1] + '%';
      return { rect: rect, lab: lab, w: (X1 - X0) * d[1] / 100, t0: 9.0 + i * 0.7 };
    });
    S.p2 = TZ.panel(g2, PX, 140, '拒否される確率', C.a, [['(1 − (1 − p)^L)^R', 16, C.ink, 600], null, ['部屋が増えるほど', 15], ['曲線は急になる', 15], null, ['100 室でも 1 週間の', 15, C.muted], ['要求の約半分が入らない', 15, C.muted]]);
    TZ.note(g2, '論文 3 節の数値');

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

    // ===== scene 4: Table 1 case A =====
    var g4 = S.g[3];
    T(g4, 70, 64, '拒否率（50 室・1 年、1 泊か 7 泊の需要。論文 Table 1 のケース A）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['Random', 12.07, 80.67], ['FirstFit', 2.74, 89.22], ['MaxSlack', 3.19, 88.81], ['RoomTetris', 0, 91.74]];
    var A0 = 220, A1 = 620;
    el('line', { x1: A0, x2: A0, y1: 95, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.bars4 = rows.map(function (r, i) {
      var y = 105 + i * 80, col = i === 3 ? C.b : C.a;
      T(g4, A0 - 12, y + 32, r[0], { 'font-size': 16, fill: col, 'text-anchor': 'end', 'font-weight': i === 3 ? 650 : 400 });
      var w = (A1 - A0) * r[1] / 13;
      var rect = el('rect', { x: A0, y: y + 10, width: 0, height: 34, fill: col }, g4);
      var lab = el('text', { x: A0 + w + 8, y: y + 33, 'font-size': 16, 'font-weight': 650, fill: col }, g4);
      lab.textContent = r[1] + '%（稼働率 ' + r[2] + '%）';
      return { rect: rect, lab: lab, w: w, t0: 24.8 + i * 0.8 };
    });
    TZ.note(g4, '論文 Table 1 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['10 室・稼働率 50% の 7 泊', '約 92% が入らない'], ['RoomTetris の拒否率', '12.07% → 0%']],
      venue: 'IJCHM 2021', title: ['RoomTetris in room committing: why the role of', 'minimum-length-of-stay requirements should be revisited'], tsize: 24,
      sub: '部屋の割当における RoomTetris：最短滞在日数の制限を見直す', authors: ['Roberto Battiti, Mauro Brunato, Filippo Battiti'], url: 'doi.org/10.1108/IJCHM-11-2020-1364'
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
    S.bars2.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p2.setAttribute('opacity', seg(t, 12.2, 13.0));
    // scene 3: stays fill day by day (start-day order), longest first within a day
    S.r3.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.req3.setAttribute('opacity', seg(t, 21.6, 22.2));
    S.p3.setAttribute('opacity', seg(t, 17.4, 18.2));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
