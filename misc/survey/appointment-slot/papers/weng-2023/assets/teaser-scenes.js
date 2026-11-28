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
// teaser-scenes.js — Weng et al., Beware of Fragmentation: Scheduling GPU-Sharing Workloads with
// Fragmentation Gradient Descent (USENIX ATC 2023). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図); scene 2-3 use the paper's running example
// (GPUs with 0.5 and 1.0 free; tasks of 0.3/0.5/0.7 GPU), fragmentation values computed by the explainer.
// Scene 4 uses ranges stated in the paper's text (§6.2-6.6).
// Colours: orange = fragments / packing baselines; blue = FGD.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'GPU を分け合うと、割当率は高いのに各 GPU に<span class="A">中途半端な空き</span>が残り、次のタスクが置けない。', en: '' },
    { ja: '断片化 = 次に来るタスクの大きさの分布に対して、使えない空きの期待値。', en: '' },
    { ja: '<span class="B">FGD</span> はタスクを仮に置いて断片化の増分を比べ、最小の GPU を選ぶ。', en: '' },
    { ja: 'Alibaba の実データでは割り当てられない GPU を 33〜49% 減らした。', en: '' },
    { ja: '将来の需要で重み付けた「使えない空き」を、配置のたびに抑える方式。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;

  // one GPU drawn as a bar of width W; used: [[from, to, colour], ...] in GPU units
  function gpu(g, x, y, W, parts, label) {
    el('rect', { x: x, y: y, width: W, height: 34, rx: 4, fill: C.panel, stroke: C.hair }, g);
    var rs = parts.map(function (p) {
      return el('rect', { x: x + p[0] * W, y: y, width: (p[1] - p[0]) * W, height: 34, rx: 3, fill: p[2], 'fill-opacity': p[3] == null ? 1 : p[3] }, g);
    });
    if (label) T(g, x - 12, y + 23, label, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    return rs;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: many nodes, small leftovers =====
    var g1 = S.g[0], rnd = H.rng(7);
    T(g1, 60, 70, '8 ノード × 4 GPU（各 GPU の空きを白で示す）', { 'font-size': 15, fill: C.muted });
    S.cells1 = [];
    for (var n = 0; n < 8; n++) {
      for (var k = 0; k < 4; k++) {
        var x = 60 + k * 128, y = 96 + n * 46;
        var used = n < 2 ? 1 : 0.55 + 0.4 * rnd();
        el('rect', { x: x, y: y, width: 118, height: 34, rx: 4, fill: '#fff', stroke: C.hair }, g1);
        var r = el('rect', { x: x, y: y, width: 0, height: 34, rx: 4, fill: C.gray }, g1);
        S.cells1.push({ r: r, w: 118 * used, t0: 0.8 + (n * 4 + k) * 0.06, frag: used < 1 });
      }
    }
    S.p1 = TZ.panel(g1, PX, 140, '合計では空いているのに', C.a, [['どの GPU にも、1 枚を', 16], ['求めるタスクが入らない', 16], null, ['本番クラスタ H：割当率 92%', 15, C.muted], ['でも約 500 枚が未割当', 15, C.muted]]);
    TZ.note(g1, '模式図（クラスタ H の数値は論文 §2）');

    // ===== scene 2: definition with the running example =====
    var g2 = S.g[1];
    T(g2, 60, 80, 'ノード：空き 0.5 と 1.0 の GPU', { 'font-size': 15, fill: C.muted });
    gpu(g2, 150, 100, 260, [[0, 0.5, C.gray]], 'GPU 1');
    gpu(g2, 150, 150, 260, [], 'GPU 2');
    T(g2, 60, 240, '来るタスク（同じ割合）', { 'font-size': 15, fill: C.muted });
    S.rows2 = [['0.3 枚', '入る：断片 0'], ['0.5 枚', '入る：断片 0'], ['0.7 枚', 'GPU 1 の 0.5 は足りない：断片 0.5']].map(function (r, i) {
      var row = el('g', {}, g2), y = 270 + i * 46;
      T(row, 60, y + 20, r[0], { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      T(row, 150, y + 20, r[1], { 'font-size': 15, fill: i === 2 ? C.a : C.ink });
      return { row: row, t0: 9.4 + i * 0.9 };
    });
    S.f2 = T(g2, 60, 440, 'F = (0 + 0 + 0.5) / 3 ≈ 0.17', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '断片化の定義', C.ink, [['F_n(M) = Σ p_m F_n(m)', 16, C.ink, 600], null, ['タスク m に使えない空きを', 15], ['出現割合 p_m で平均する', 15], null, ['「どれも入らない空き」だけ', 15, C.muted], ['を数える定義は信号が弱い', 15, C.muted]]);
    TZ.note(g2, '論文の例。F の値は解説者の計算（CPU は無視）');

    // ===== scene 3: FGD chooses the smallest increment =====
    var g3 = S.g[2];
    T(g3, 60, 80, '0.3 枚のタスクをどこに置く？', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.optA = el('g', {}, g3);
    gpu(S.optA, 150, 110, 260, [[0, 0.5, C.gray]], 'GPU 1');
    gpu(S.optA, 150, 154, 260, [[0, 0.3, C.b]], 'GPU 2');
    T(S.optA, 430, 150, 'Δ = 0', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.optB = el('g', {}, g3);
    gpu(S.optB, 150, 250, 260, [[0, 0.5, C.gray], [0.5, 0.8, C.a]], 'GPU 1');
    gpu(S.optB, 150, 294, 260, [], 'GPU 2');
    T(S.optB, 430, 290, 'Δ ≈ +0.03', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    T(S.optB, 150, 352, '残る 0.2 はどのタスクにも使えない', { 'font-size': 14, fill: C.a });
    S.ok3 = T(g3, 60, 420, '→ GPU 2 を選ぶ。次の 0.5 は GPU 1 に入り、最後の 0.7 も入る', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, 'FGD', C.b, [['1. 入らないノードを除く', 15], ['2. 各 GPU に仮に置く', 15], ['3. Δ = F⁻ − F を計算', 15], ['4. Δ が最小の場所へ', 15], null, ['断片化を減らす向きに', 15, C.muted], ['一歩ずつ進む', 15, C.muted]]);
    TZ.note(g3, '論文の例。Δ の値は解説者の計算');

    // ===== scene 4: results (ranges in the text) =====
    var g4 = S.g[3];
    T(g4, 60, 70, 'FGD の改善（既存の方式との比較、論文本文の範囲）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['割り当てられない GPU', '33〜49% 減', '150〜290 枚分を余分に割当（§6.2）'],
                ['要求 90% 時の断片化率', '24〜44% 低い', '元のトレース（§6.2）'],
                ['複数枚タスクが 20〜50%', '26〜45% 減', '割り当てられない GPU（§6.4）'],
                ['GPU を使わないタスクが増えると', '+3% 未満', 'ほかの方式は +18〜45%（§6.6）']];
    S.rows4 = rows.map(function (r, i) {
      var row = el('g', {}, g4), y = 100 + i * 92;
      el('rect', { x: 60, y: y, width: 840, height: 76, rx: 10, fill: i === 0 ? C.bsoft : '#fff', stroke: C.hair }, row);
      T(row, 84, y + 32, r[0], { 'font-size': 16, fill: C.ink });
      T(row, 84, y + 58, r[2], { 'font-size': 14, fill: C.muted });
      T(row, 876, y + 48, r[1], { 'font-size': 26, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
      return { row: row, t0: 24.6 + i * 1.3 };
    });
    TZ.note(g4, '約 1.2k ノード・6.2k GPU のエミュレーション');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['割り当てられない GPU', '最大 49% 減'], ['余分に割り当てた GPU', '最大 290 枚']],
      venue: 'USENIX ATC 2023', title: ['Beware of Fragmentation:', 'Scheduling GPU-Sharing Workloads', 'with Fragmentation Gradient Descent'], tsize: 28,
      sub: '断片化に気をつけよ', authors: ['Q. Weng, L. Yang, Y. Yu, W. Wang, X. Tang, G. Yang, L. Zhang'], url: 'usenix.org/conference/atc23/presentation/weng'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.cells1.forEach(function (c) { c.r.setAttribute('width', c.w * seg(t, c.t0, c.t0 + 0.6)); });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    S.rows2.forEach(function (r) { r.row.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.5)); });
    S.f2.setAttribute('opacity', seg(t, 12.4, 13.0));
    S.p2.setAttribute('opacity', seg(t, 13.0, 13.8));
    S.optA.setAttribute('opacity', seg(t, 17.0, 17.6));
    S.optB.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.ok3.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));
    S.rows4.forEach(function (r) { r.row.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.6)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
