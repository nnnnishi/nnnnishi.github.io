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
// teaser-scenes.js — Goyal, Iyengar, Udwani, Asymptotically Optimal Competitive Ratio for Online Allocation
// of Reusable Resources (Operations Research 2025; arXiv 2002.02430v7). Unofficial explainer.
// Scenes 1-3 are schematics with an explainer-chosen resource of 5 units (labelled 模式図).
// Scene 4 uses the guarantees stated in the paper: greedy 0.5, Balance (1-1/e)^2 ≈ 0.4 under stochastic
// usage, and 1-1/e for the proposed algorithms as capacity grows.
// Colours: orange = earlier algorithms; blue = ranking-based allocation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '要求は敵対的な順に来る。割り当てた単位は確率的に決まる時間のあと戻ってくる。', en: '' },
    { ja: '空いている単位の数だけを見る<span class="A">貪欲法</span>の保証は、最適な方策の 0.5 倍までだった。', en: '' },
    { ja: '<span class="B">順位にもとづく割当</span>は単位に番号をつけ、空いている最大の番号で報酬を割り引く。', en: '' },
    { ja: '在庫が大きければ、任意の利用時間の分布で競争比は 1−1/e に近づく。これが上限である。', en: '' },
    { ja: '再利用資源の敵対的なオンライン配分で、到達できる保証の上限を示した研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: arrivals and returns on 5 units =====
    var g1 = S.g[0];
    T(g1, 70, 70, '資源 i の 5 単位と、その利用', { 'font-size': 15, fill: C.muted });
    var X0 = 160, X1 = 590;
    for (var k = 0; k < 5; k++) {
      var y = 100 + k * 54;
      T(g1, X0 - 14, y + 22, '単位 ' + (5 - k), { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: X0, y: y + 4, width: X1 - X0, height: 28, rx: 4, fill: C.panel }, g1);
    }
    el('line', { x1: X0, x2: X1 + 10, y1: 380, y2: 380, stroke: C.ink, 'stroke-width': 1.4 }, g1);
    T(g1, X1 + 14, 385, '時間', { 'font-size': 14, fill: C.muted });
    var uses = [[0, 0.04, 0.46], [1, 0.12, 0.80], [2, 0.20, 0.52], [3, 0.30, 0.95], [0, 0.58, 0.90], [2, 0.66, 0.88]];
    S.u1 = uses.map(function (u, i) {
      var x0 = X0 + u[1] * (X1 - X0), x1 = X0 + u[2] * (X1 - X0), y = 100 + u[0] * 54;
      var r = el('rect', { x: x0, y: y + 4, width: 0, height: 28, rx: 4, fill: C.gray }, g1);
      var a = el('line', { x1: x0, x2: x0, y1: 92, y2: 380, stroke: C.ink, 'stroke-width': 1, 'stroke-dasharray': '3 4' }, g1);
      return { r: r, a: a, w: x1 - x0, t0: 1.0 + i * 0.55 };
    });
    T(g1, X0, 410, '点線：要求が来た時刻（順番は敵が決める）', { 'font-size': 14, fill: C.muted });
    S.p1 = TZ.panel(g1, PX, 120, '再利用資源', C.ink, [['割り当てた単位は', 16], ['利用時間 d ~ F_i のあと', 16], ['戻ってくる', 16], null, ['利用時間は戻るまで', 15, C.muted], ['分からない', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: greedy = 0.5 =====
    var g2 = S.g[1];
    T(g2, 70, 100, '貪欲法：報酬が最大の空いている資源に割り当てる', { 'font-size': 16, fill: C.ink });
    S.big2 = el('text', { x: 300, y: 300, 'font-size': 120, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' }, g2);
    S.big2.textContent = '0.5';
    T(g2, 300, 350, '貪欲法の競争比（Gong ら 2022）', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 140, '空きの数しか見ない', C.a, [['使用中の単位が', 16], ['いつ戻るかを', 16], ['価格に入れない', 16], null, ['0.5 を超える保証は', 15, C.muted], ['知られていなかった', 15, C.muted]]);

    // ===== scene 3: ranked units and the discounted reward =====
    var g3 = S.g[2];
    T(g3, 70, 76, '資源 i の単位に番号をつける（c = 5）', { 'font-size': 15, fill: C.muted });
    S.units3 = [];
    for (var j = 0; j < 5; j++) {
      var yy = 100 + j * 56;
      var rr = el('rect', { x: 90, y: yy, width: 120, height: 44, rx: 8, fill: '#fff', stroke: C.b, 'stroke-width': 1.8 }, g3);
      var tt = el('text', { x: 150, y: yy + 28, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g3);
      tt.textContent = '単位 ' + (5 - j);
      S.units3.push({ r: rr, t: tt, n: 5 - j });
    }
    T(g3, 260, 120, '空いている最大の番号 z', { 'font-size': 15, fill: C.ink });
    S.z3 = el('text', { x: 260, y: 160, 'font-size': 28, 'font-weight': 700, fill: C.b }, g3);
    T(g3, 260, 220, '割り引いた報酬 r(1 − e^(−z/c))', { 'font-size': 15, fill: C.ink });
    el('rect', { x: 260, y: 240, width: 300, height: 26, rx: 4, fill: C.panel }, g3);
    S.bar3 = el('rect', { x: 260, y: 240, width: 0, height: 26, rx: 4, fill: C.b }, g3);
    S.val3 = el('text', { x: 260, y: 296, 'font-size': 15, fill: C.b, 'font-weight': 600 }, g3);
    S.ev3 = el('text', { x: 260, y: 340, 'font-size': 15, fill: C.muted }, g3);
    S.p3 = TZ.panel(g3, PX, 140, '順位にもとづく割当', C.b, [['番号の大きい単位から使う', 15], ['使うほど割り引きが増え、', 15], ['単位が戻ると減る', 15], null, ['使用中の単位の戻りが', 15, C.muted], ['価格に表れる', 15, C.muted]]);
    TZ.note(g3, '模式図（r = 1、c = 5 は解説者が置いた例）');

    // ===== scene 4: guarantees =====
    var g4 = S.g[3];
    T(g4, 70, 70, '競争比の保証（確率的な利用時間）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var BX0 = 330, BX1 = 860;
    function sx(v) { return BX0 + v * (BX1 - BX0); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 100, y2: 400, stroke: C.hair }, g4);
      el('text', { x: sx(v), y: 424, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    el('line', { x1: BX0, x2: BX0, y1: 100, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var rows = [['Balance（既知の最良）', 0.4, '≈ 0.4', C.a], ['貪欲法', 0.5, '0.5', C.a], ['提案法（在庫 → ∞）', 1 - 1 / Math.E, '1 − 1/e ≈ 0.632', C.b]];
    S.bars4 = rows.map(function (r, i) {
      var y = 130 + i * 90;
      T(g4, BX0 - 12, y + 30, r[0], { 'font-size': 15, fill: r[3], 'text-anchor': 'end' });
      var rect = el('rect', { x: BX0, y: y + 8, width: 0, height: 34, fill: r[3] }, g4);
      var lab = el('text', { x: sx(r[1]) + 8, y: y + 31, 'font-size': 15, 'font-weight': 650, fill: r[3] }, g4);
      lab.textContent = r[2];
      return { rect: rect, lab: lab, w: sx(r[1]) - BX0, t0: 24.6 + i * 1.0 };
    });
    TZ.note(g4, '論文に書かれた保証の値から作図（Balance の値は (1−1/e)²）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['競争比', '0.5 → 1 − 1/e'], ['対象', '任意の利用時間の分布']],
      venue: 'OPERATIONS RESEARCH 2025', title: ['Asymptotically Optimal Competitive Ratio for', 'Online Allocation of Reusable Resources'], tsize: 27,
      sub: '再利用資源のオンライン配分で漸近的に最適な競争比',
      authors: ['Vineet Goyal, Garud Iyengar, Rajan Udwani'], url: 'arxiv.org/abs/2002.02430'
    });
    return S;
  }

  // z over time in scene 3: 5 units free -> three allocations -> unit 4 returns
  var ZSTEPS = [[16.0, 5, '5 単位とも空いている'], [17.6, 4, '要求に単位 5 を割り当てた'], [18.8, 3, '単位 4 も割り当てた'], [20.0, 2, '単位 3 も割り当てた'], [21.6, 4, '単位 4 と 3 が戻った']];
  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.u1.forEach(function (u) {
      u.a.setAttribute('opacity', seg(t, u.t0 - 0.3, u.t0));
      u.r.setAttribute('width', u.w * seg(t, u.t0, u.t0 + 0.8));
    });
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.big2.setAttribute('opacity', seg(t, 9.0, 9.8));
    S.p2.setAttribute('opacity', seg(t, 10.6, 11.4));
    var st = ZSTEPS[0];
    ZSTEPS.forEach(function (s) { if (t >= s[0]) st = s; });
    var z = st[1], price = 1 - Math.exp(-z / 5);
    S.units3.forEach(function (u) {
      var free = u.n <= z;
      u.r.setAttribute('fill', free ? '#fff' : C.gray);
      u.r.setAttribute('stroke', free ? C.b : C.gray);
    });
    S.z3.textContent = 'z = ' + z;
    S.bar3.setAttribute('width', 300 * price / (1 - Math.exp(-1)));
    S.val3.textContent = 'r(1 − e^(−' + z + '/5)) ≈ ' + price.toFixed(2);
    S.ev3.textContent = st[2];
    S.p3.setAttribute('opacity', seg(t, 18.0, 18.8));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
