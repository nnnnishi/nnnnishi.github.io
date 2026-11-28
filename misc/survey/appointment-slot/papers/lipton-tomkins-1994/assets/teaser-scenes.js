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
// teaser-scenes.js — Lipton, Tomkins, Online interval scheduling (SODA 1994). Unofficial explainer.
// The paper itself was not read; results come from two later papers that cite it.
// Scenes 1-3 are schematics; scene 3 shows the explainer's illustration of the length-class idea, not
// necessarily the paper's algorithm. Scene 4 lists the bounds as reported by the citing papers.
// Colours: orange = deterministic acceptance; blue = randomized acceptance by length class.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '区間の要求が開始時刻の順に届く。届いたときに、受けるか断るかを決める。', en: '' },
    { ja: '<span class="A">決定的な受け方</span>は読まれる。短い区間を受ければ長い区間を逃し、断れば後が来ない。', en: '' },
    { ja: '<span class="B">長さの階級を乱数で選び</span>、その階級の区間だけを受ける（解説者による説明）。', en: '' },
    { ja: '長さの比 Δ を知っていれば、競争比 Θ(log Δ) が最良である。', en: '' },
    { ja: '区間の予約をその場で受けるか断るかを決める問題の、理論の出発点の一つ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var X0 = 80, X1 = 600;

  function iv(g, s, f, y, color, label, sc) {
    var x0 = X0 + s * sc, w = (f - s) * sc;
    var r = el('rect', { x: x0, y: y, width: w, height: 30, rx: 5, fill: '#fff', stroke: color, 'stroke-width': 2 }, g);
    var t = label ? T(g, x0 + w / 2, y + 21, label, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }) : null;
    return { r: r, t: t };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: intervals arrive by start time =====
    var g1 = S.g[0], sc = (X1 - X0) / 20;
    el('line', { x1: X0, x2: X1, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.4 }, g1);
    T(g1, X1, 428, '時刻', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    var reqs = [[1, 4, 1], [3, 11, 0], [5, 7, 0], [7, 9, 1], [10, 18, 1], [12, 14, 0], [18, 20, 1]];
    S.r1 = reqs.map(function (q, i) {
      var y = 86 + i * 42;
      var o = iv(g1, q[0], q[1], y, C.ink, '', sc);
      var m = el('text', { x: X0 + q[1] * sc + 8, y: y + 21, 'font-size': 15, 'font-weight': 700, fill: q[2] ? C.b : C.muted }, g1);
      m.textContent = q[2] ? '受ける' : '断る';
      return { o: o, m: m, acc: q[2], t0: 0.8 + i * 0.7 };
    });
    S.p1 = TZ.panel(g1, PX, 140, 'オンライン区間', C.ink, [['受けた区間どうしは', 15], ['重なってはいけない', 15], null, ['価値は区間の長さに比例', 15], null, ['断った区間は取り戻せない', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: deterministic dilemma =====
    var g2 = S.g[1], sc2 = (X1 - X0) / 20;
    T(g2, X0, 100, '受けた場合', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.a2 = iv(g2, 0, 1, 120, C.a, '短', sc2);
    S.a2b = iv(g2, 0.5, 20, 170, C.gray, '長い区間（重なって受けられない）', sc2);
    T(g2, X0, 280, '断った場合', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.b2 = iv(g2, 0, 1, 300, C.gray, '短', sc2);
    S.b2t = T(g2, X0 + 3 * sc2, 321, '…その後は何も来ない', { 'font-size': 15, fill: C.muted });
    S.p2 = TZ.panel(g2, PX, 140, '決定的な受け方', C.a, [['敵は受け方を知って', 15], ['要求の列を作れる', 15], null, ['どちらを選んでも', 15, C.muted], ['大きく負ける列がある', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: random length class =====
    var g3 = S.g[2];
    T(g3, X0, 90, '長さを 2 倍ごとの階級に分ける（階級の数 ≈ log₂ Δ）', { 'font-size': 15, fill: C.ink });
    var cls = [['[1, 2)', 1], ['[2, 4)', 2], ['[4, 8)', 4], ['[8, 16)', 8]];
    S.cls3 = cls.map(function (c, i) {
      var y = 120 + i * 62;
      var box = el('rect', { x: X0, y: y, width: 520, height: 50, rx: 8, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
      T(g3, X0 + 14, y + 31, c[0], { 'font-size': 15, fill: C.ink });
      for (var k = 0; k < 3; k++) el('rect', { x: X0 + 120 + k * 130, y: y + 12, width: Math.min(120, 14 * c[1] + 10), height: 26, rx: 4, fill: C.gray }, g3);
      return box;
    });
    S.pick3 = el('text', { x: X0, y: 400, 'font-size': 16, 'font-weight': 650, fill: C.b }, g3);
    S.p3 = TZ.panel(g3, PX, 140, '乱数で階級を選ぶ', C.b, [['選んだ階級の区間だけを', 15], ['空いていれば受ける', 15], null, ['同じ階級の長さは 2 倍以内', 15, C.muted], ['なので損失は定数倍', 15, C.muted]]);
    TZ.note(g3, '解説者による説明（論文の手法そのものとは限らない）');

    // ===== scene 4: bounds =====
    var g4 = S.g[3];
    T(g4, 70, 80, '競争比（後続の論文による紹介）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var cards = [['Δ を知っている', 'O(log Δ)', '最適', C.b], ['Δ を知らない', 'O((log Δ)^(1+ε))', '', C.b], ['下界', 'Ω(log Δ)', 'これより良くできない', C.a]];
    S.c4 = cards.map(function (c, i) {
      var x = 70 + i * 280, gg = el('g', {}, g4);
      el('rect', { x: x, y: 130, width: 250, height: 200, rx: 14, fill: c[3] === C.b ? C.bsoft : '#FCEBDF' }, gg);
      T(gg, x + 125, 175, c[0], { 'font-size': 16, fill: c[3], 'text-anchor': 'middle' });
      T(gg, x + 125, 245, c[1], { 'font-size': 26, 'font-weight': 700, fill: c[3], 'text-anchor': 'middle' });
      if (c[2]) T(gg, x + 125, 295, c[2], { 'font-size': 15, fill: c[3], 'text-anchor': 'middle' });
      return gg;
    });
    T(g4, 70, 390, 'Δ = 最長の区間の長さ ÷ 最短の区間の長さ', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '論文本文は未読。Bachmann ら、Fung らの紹介から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['Δ を知るときの競争比', 'Θ(log Δ)'], ['価値', '区間の長さに比例']],
      venue: 'SODA 1994', title: ['Online interval scheduling'], tsize: 34,
      sub: 'オンライン区間スケジューリング',
      authors: ['Richard J. Lipton, Andrew Tomkins'], url: ''
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.r1.forEach(function (r) {
      r.o.r.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.m.setAttribute('opacity', seg(t, r.t0 + 0.4, r.t0 + 0.7));
      r.o.r.setAttribute('fill', t > r.t0 + 0.4 && r.acc ? C.bsoft : '#fff');
    });
    S.p1.setAttribute('opacity', seg(t, 5.8, 6.6));
    S.a2.r.setAttribute('fill', C.a); S.a2.r.setAttribute('fill-opacity', 0.25);
    S.a2b.r.setAttribute('opacity', seg(t, 9.6, 10.2)); S.a2b.t.setAttribute('opacity', seg(t, 9.6, 10.2));
    var bo = seg(t, 11.0, 11.6);
    S.b2.r.setAttribute('opacity', bo); S.b2.t.setAttribute('opacity', bo);
    S.b2t.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: a "die" cycles through classes, then stops at [4, 8)
    var idx = t < 19.5 ? Math.floor((t - 16) * 4) % 4 : 2;
    if (idx < 0) idx = 0;
    S.cls3.forEach(function (b, i) {
      b.setAttribute('stroke', i === idx ? C.b : C.hair);
      b.setAttribute('stroke-width', i === idx ? 3 : 1.5);
      b.setAttribute('fill', i === idx && t >= 19.5 ? C.bsoft : '#fff');
    });
    S.pick3.textContent = t >= 19.5 ? '選んだ階級 [4, 8) の区間だけを受ける' : '階級を等確率で 1 つ選ぶ…';
    S.p3.setAttribute('opacity', seg(t, 20.0, 20.8));
    S.c4.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 24.8 + i * 1.0, 25.4 + i * 1.0)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
