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
// teaser-scenes.js — Zhang, Li, Huh, Multi-Capacity Online Assortment Optimization with Consecutive Stays
// under Markov Chain Choice (arXiv 2610.27661). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy timelines (labelled 模式図). Scene 4 shows the
// approximation ratios stated in the paper; (1-1/e)/2 = 0.316 is the explainer's arithmetic.
// Colours: orange = residual gaps / prior guarantee; blue = the paper's LP, policy and guarantees.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '1つの商品に複数のコピー（部屋）があり、予約は1つのコピーの連続した区間を占める。', en: '' },
    { ja: '区間が売れると、そのコピーの空きは<span class="A">最大2つの残り区間</span>に分かれる。', en: '' },
    { ja: '<span class="B">提案法</span>は極大な空き区間の確率で LP 緩和を書き、コピーごとの提案で品揃えを作る。', en: '' },
    { ja: '近似比はコピーの数によらず、MNL で 1/2、一般の Markov chain 選択で (1−1/e)/2。', en: '' },
    { ja: '空きの分かれ方を状態に入れて、選択を考慮した予約受付に性能保証をつけた理論の研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640, W = 48;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: copies and a consecutive request =====
    var g1 = S.g[0];
    T(g1, 140, 92, '枠 1〜10（部屋タイプ A の 3 室）', { 'font-size': 15, fill: C.muted });
    var rows = [[1, 1, 0, 0, 1, 0, 0, 0, 1, 1], [0, 0, 1, 1, 1, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 1, 1]];
    S.cells1 = rows.map(function (st, r) { return TZ.slots(g1, { x: 140, y: 170 + r * 70, n: 10, w: W, h: 40, label: '室 ' + (r + 1), states: st }); });
    S.req1 = el('g', {}, g1);
    el('rect', { x: 140 + 5 * W, y: 116, width: 3 * W - 3, height: 30, rx: 6, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.req1);
    T(S.req1, 140 + 6.5 * W, 137, '要求 [6, 8]', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    S.ok1 = [T(g1, 140 + 10 * W + 12, 196, '○', { 'font-size': 18, fill: C.b }), T(g1, 140 + 10 * W + 12, 266, '×', { 'font-size': 18, fill: C.a }), T(g1, 140 + 10 * W + 12, 336, '○', { 'font-size': 18, fill: C.b })];
    S.p1 = TZ.panel(g1, 140, 420, '', C.ink, [['区間がすべて空いているコピーだけで受けられる', 15, C.muted]]);
    TZ.note(g1, '模式図（灰色は予約済みの枠）');

    // ===== scene 2: a sale splits one maximal interval into two =====
    var g2 = S.g[1];
    T(g2, 140, 110, '室 1 の空き：極大な空き区間 [2, 9]', { 'font-size': 15, fill: C.muted });
    S.c2 = TZ.slots(g2, { x: 140, y: 140, n: 10, w: W, h: 44, states: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1] });
    T(g2, 140, 250, '[4, 6] を売ると', { 'font-size': 15, fill: C.muted });
    S.c2b = TZ.slots(g2, { x: 140, y: 270, n: 10, w: W, h: 44, states: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1] });
    S.lab2 = el('g', {}, g2);
    T(S.lab2, 140 + 2 * W - 2, 350, '[2, 3]', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    T(S.lab2, 140 + 7.5 * W, 350, '[7, 9]', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    T(S.lab2, 140, 400, '1つの区間が消え、最大2つの短い区間ができる', { 'font-size': 16, fill: C.ink });
    S.p2 = TZ.panel(g2, PX + 20, 150, 'どこに入れるかで後が変わる', C.a, [['残り区間が短いと、', 15], ['長い要求はもう入らない', 15], null, ['論文は区間の分かれ方を', 15, C.muted], ['そのまま状態として持つ', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: interval-flow LP and copy proposals =====
    var g3 = S.g[2];
    function box(g, x, y, w, s, col) {
      el('rect', { x: x, y: y, width: w, height: 46, rx: 8, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      T(g, x + w / 2, y + 29, s, { 'font-size': 16, 'text-anchor': 'middle', fill: col });
    }
    S.f3 = el('g', {}, g3);
    box(S.f3, 70, 150, 200, 'xₜ([a, b])', C.b);
    box(S.f3, 360, 90, 200, 'xₜ₊₁([a, ℓ−1])', C.b);
    box(S.f3, 360, 210, 200, 'xₜ₊₁([r+1, b])', C.b);
    el('line', { x1: 272, y1: 165, x2: 356, y2: 116, stroke: C.b, 'stroke-width': 2 }, S.f3);
    el('line', { x1: 272, y1: 185, x2: 356, y2: 232, stroke: C.b, 'stroke-width': 2 }, S.f3);
    T(S.f3, 300, 186, 'y', { 'font-size': 16, fill: C.b, 'font-style': 'italic' });
    T(S.f3, 70, 130, '極大な空き区間である確率', { 'font-size': 14, fill: C.muted });
    S.e3 = T(g3, 70, 330, '売れる確率 y ≤ p · a · x（区間が要求を含むときだけ）', { 'font-size': 16, fill: C.ink });
    S.q3 = T(g3, 70, 380, 'コピーは確率 π = y / (p a x) で提案し、提案のある商品から品揃えを選ぶ', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.r3 = T(g3, 70, 420, 'コピーについて足すと変数は O(TMN²)、コピーの数によらない', { 'font-size': 15, fill: C.muted });
    S.p3 = TZ.panel(g3, PX + 20, 120, 'LP 緩和（SBLP）', C.b, [['最適なオンライン方策の', 15], ['期待収益の上界', 15], null, ['ゲート：一般の Markov', 15, C.muted], ['選択では確率 1−1/e で', 15, C.muted], ['品揃えを見せる', 15, C.muted]]);
    TZ.note(g3, '模式図（式は論文の制約を簡略化）');

    // ===== scene 4: guarantees =====
    var g4 = S.g[3];
    T(g4, 70, 70, '最適なオンライン方策に対する近似比', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, { x0: 330, x1: 820, v0: 0, v1: 0.6, y0: 110, rowH: 84, t0: 24.6, dt: 0.9, ticks: [0, 0.2, 0.4, 0.6], fmt: function (v) { return v.toFixed(1); },
      rows: [{ label: 'Hu と Wu（単一コピーの MNL）', a: 0.271, la: '0.271' },
             { label: '本論文（単一コピーの MNL）', b: 0.5, lb: '1/2' },
             { label: '本論文（MNL、複数コピー）', b: 0.5, lb: '1/2' },
             { label: '本論文（一般の Markov chain）', b: 0.316, lb: '(1−1/e)/2 ≈ 0.316' }] });
    T(g4, 70, 500, 'どれもコピーの数 C_i によらない', { 'font-size': 15, fill: C.ink });
    TZ.note(g4, '論文の定理 1 と比較の記述から作図（0.316 は解説者の計算）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['MNL の近似比', '1/2'], ['一般の Markov chain 選択', '(1−1/e)/2']],
      venue: 'arXiv 2026', title: ['Multi-Capacity Online Assortment Optimization', 'with Consecutive Stays under Markov Chain Choice'], tsize: 26,
      sub: '連続した滞在と複数の容量があるオンライン品揃え最適化', authors: ['Hongbin Zhang, Yanzhi Li, Woonghee Tim Huh'], url: 'arxiv.org/abs/2610.27661'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.req1.setAttribute('opacity', seg(t, 1.5, 2.2));
    S.ok1.forEach(function (o, i) { o.setAttribute('opacity', seg(t, 3.0 + i * 0.6, 3.5 + i * 0.6)); });
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.6));
    // scene 2: cells 4..6 (index 3..5) become booked, residuals turn orange-soft
    var k2 = seg(t, 10.0, 10.8), k3 = seg(t, 11.2, 12.0);
    S.c2b.forEach(function (r, i) {
      if (i >= 3 && i <= 5) r.setAttribute('fill', H.mix('#FFFFFF', C.gray, k2));
      else if (i > 0 && i < 9) r.setAttribute('fill', H.mix('#FFFFFF', '#FCEBDF', k3));
    });
    S.lab2.setAttribute('opacity', k3);
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.f3.setAttribute('opacity', seg(t, 16.6, 17.4));
    S.e3.setAttribute('opacity', seg(t, 18.0, 18.6));
    S.q3.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.r3.setAttribute('opacity', seg(t, 20.8, 21.4));
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
