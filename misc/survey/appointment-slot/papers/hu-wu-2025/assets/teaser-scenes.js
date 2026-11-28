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
// teaser-scenes.js — Hu & Wu, Constant-Factor Algorithms for Revenue Management with Consecutive Stays
// (arXiv:2506.00909). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy room calendars (labelled 模式図). Scene 4 uses the
// approximation ratios stated in the body of arXiv v3 (Theorems 1-2, Section 7).
// Colours: orange = the full availability state and the split a booking leaves; blue = maximal free runs,
// the LP over them and the resulting guarantees.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '5 泊の空きの真ん中に 1 泊を入れると、<span class="A">空きが 2 泊ずつに分かれ</span>、3 泊の予約が入らなくなる。', en: '' },
    { ja: '部屋ごとの空き方は 2<sup>N</sup> 通りあり、そのままでは最適な受付を計算できない。', en: '' },
    { ja: '<span class="B">空きを極大な連続区間に分ける</span>と、部屋の価値は区間ごとの価値の和になる。', en: '' },
    { ja: '連続区間の確率を変数にした LP から作る方策は、最適なオンライン方策の 0.632 倍以上を保証する。', en: '' },
    { ja: '空きの分かれ方を区間の集まりとして扱い、受付に定数倍の保証をつけた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660, CX = 90, CW = 58;

  // a room calendar of n nights; booked = indices filled
  function cal(g, x, y, n, booked, label, color) {
    var cells = [];
    if (label) T(g, x - 12, y + 27, label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    for (var i = 0; i < n; i++) {
      var on = booked.indexOf(i) >= 0;
      cells.push(el('rect', { x: x + i * CW, y: y, width: CW - 4, height: 40, rx: 4, fill: on ? C.muted : '#fff', stroke: on ? C.muted : (color || C.hair), 'stroke-width': 1.6 }, g));
    }
    return cells;
  }
  function run(g, x, y, i0, i1, color, label) {
    var gg = el('g', {}, g);
    el('line', { x1: x + i0 * CW + 2, x2: x + (i1 + 1) * CW - 6, y1: y, y2: y, stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round' }, gg);
    if (label) T(gg, x + (i0 + i1 + 1) * CW / 2 - 2, y + 24, label, { 'font-size': 15, 'font-weight': 600, fill: color, 'text-anchor': 'middle' });
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: a one-night booking splits a five-night run =====
    var g1 = S.g[0], X1 = 130;
    T(g1, X1, 96, '1 部屋の 7 泊', { 'font-size': 15, fill: C.muted });
    cal(g1, X1, 120, 7, [0, 6], '前');
    S.r1a = run(g1, X1, 176, 1, 5, C.b, '5 泊の空き');
    S.c1 = el('g', {}, g1);
    cal(S.c1, X1, 250, 7, [0, 3, 6], '後');
    S.r1b = el('g', {}, g1);
    run(S.r1b, X1, 306, 1, 2, C.a, '2 泊');
    run(S.r1b, X1, 306, 4, 5, C.a, '2 泊');
    S.x1 = T(g1, X1, 380, '3 泊の予約はこの部屋に入らない', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '連続した区間の予約', C.a, [['ホテルの連泊、', 16], ['鉄道の区間', 16], null, ['空きの合計は 4 泊でも、', 15, C.muted], ['長い滞在が入らない', 15, C.muted]]);
    TZ.note(g1, '模式図（予約表は解説者が置いた例）');

    // ===== scene 2: exponential state space =====
    var g2 = S.g[1], X2 = 130;
    S.rows2 = [[0, 2, 5], [1, 4], [0, 3, 6], [2, 3]].map(function (b, i) {
      var gg = el('g', {}, g2);
      cal(gg, X2, 110 + i * 62, 7, b, i === 0 ? '状態' : '', C.a);
      return gg;
    });
    S.big2 = T(g2, 130, 400, '1 部屋で 2^N 通り、M 部屋で (2^N)^M 通り', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '状態の数が多すぎる', C.a, [['受付の判断は', 16], ['空き方の全体で決まる', 16], null, ['先行研究の保証は', 15, C.muted], ['滞在の長さ L とともに', 15, C.muted], ['小さくなる', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: decomposition into maximal runs =====
    var g3 = S.g[2], X3 = 110;
    T(g3, X3, 96, '1 部屋の 8 泊', { 'font-size': 15, fill: C.muted });
    var cw0 = CW; CW = 56;
    cal(g3, X3, 120, 8, [2, 5], '', C.b);
    S.r3 = [run(g3, X3, 180, 0, 1, C.b, '[1,2]'), run(g3, X3, 180, 3, 4, C.b, '[4,5]'), run(g3, X3, 180, 6, 7, C.b, '[7,8]')];
    CW = cw0;
    S.eq3 = T(g3, X3, 270, 'G(s) = G([1,2]) + G([4,5]) + G([7,8])', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    S.n3 = T(g3, X3, 312, '極大な区間は 1 部屋あたり O(N²) 個（命題 1）', { 'font-size': 16, fill: C.ink });
    S.l3 = T(g3, X3, 372, 'LP の変数：x = [a,b] が空きの区間である確率', { 'font-size': 16, fill: C.ink });
    S.l3b = T(g3, X3, 400, '　　　　　 y = そのうえで予約がそこに入る確率', { 'font-size': 16, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '極大な連続区間', C.b, [['予約は 1 つの区間の', 15], ['中にしか入らない', 15], null, ['各部屋が LP の確率で', 15, C.muted], ['候補に加わり、候補の中で', 15, C.muted], ['収益の高い部屋に入れる', 15, C.muted]]);
    TZ.note(g3, '模式図（論文の命題 1 とアルゴリズム 1 を簡略化）');

    // ===== scene 4: ratios =====
    var g4 = S.g[3];
    T(g4, 70, 64, '最適なオンライン方策に対する近似比（arXiv v3 の本文）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 330, X1 = 830;
    function sx(v) { return X0 + v * (X1 - X0); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 92, y2: 440, stroke: C.hair, 'stroke-width': 1 }, g4);
      T(g4, sx(v), 462, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: X0, x2: X0, y1: 92, y2: 440, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var data = [['受付・拒否（区間が決まる）', 0.632, '1 − 1/e ≈ 0.632'], ['BAM（区間が決まる）', 0.271, '0.271'], ['受付・拒否（区間が確率的）', 0.399, '≈ 0.399'], ['BAM（区間が確率的）', 0.171, '≈ 0.171']];
    S.bars4 = data.map(function (d, i) {
      var y = 110 + i * 80;
      T(g4, X0 - 14, y + 30, d[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y + 8, width: 0, height: 34, fill: C.b, 'fill-opacity': i < 2 ? 1 : 0.55 }, g4);
      var lab = el('text', { x: sx(d[1]) + 8, y: y + 31, 'font-size': 15, 'font-weight': 600, fill: C.b }, g4);
      lab.textContent = d[2];
      return { rect: rect, lab: lab, w: sx(d[1]) - X0, t0: 24.6 + i * 0.8 };
    });
    TZ.note(g4, '論文の定理 1・2 と 7 節の値から作図（数値実験ではない）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['受付・拒否', '1 − 1/e ≈ 0.632'], ['品揃えの提示（BAM）', '0.271']],
      venue: 'ARXIV 2025', title: ['Constant-Factor Algorithms for Revenue', 'Management with Consecutive Stays'], tsize: 30,
      sub: '連続した区間を使う予約の収益管理', authors: ['Ming Hu, Tongwen Wu'], url: 'arxiv.org/abs/2506.00909'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.r1a.setAttribute('opacity', seg(t, 1.0, 1.6));
    S.c1.setAttribute('opacity', seg(t, 2.4, 3.0));
    S.r1b.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.x1.setAttribute('opacity', seg(t, 4.4, 5.0));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.rows2.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 8.6 + i * 0.5, 9.0 + i * 0.5)); });
    S.big2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.r3.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 16.8 + i * 0.5, 17.3 + i * 0.5)); });
    S.eq3.setAttribute('opacity', seg(t, 18.6, 19.2));
    S.n3.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.l3.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.l3b.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.p3.setAttribute('opacity', seg(t, 21.0, 21.8));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
