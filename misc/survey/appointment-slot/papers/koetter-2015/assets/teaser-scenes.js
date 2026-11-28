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
// teaser-scenes.js — Koetter, Ostermann, Jecan, Schedule Rating Method based on a Fragmentation Criterion
// (VEHICULAR 2015). Unofficial explainer.
// Scene 1 draws the paper's three-vehicle example (trip times from the text). Scenes 2-3 are schematics
// (labelled 模式図); the weight curves are qualitative only. Scene 4 uses the numbers stated in the paper
// (6 fragments / ~794 vs 4 fragments / ~1051; +21.6% average utilisation).
// Colours: orange = schedules that scatter trips and leave short fragments; blue = the rating's preferred schedules.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約を車に散らすと、空き時間の合計は足りていても<span class="A">長い空きがどの車にも残らない</span>。', en: '' },
    { ja: '予約の間の空き時間を「断片」とし、長さと時間帯で重みを付けて足す。', en: '' },
    { ja: '最適化した予約表を<span class="B">断片化の点</span>で今の予約表と比べ、点の高いほうを残す。', en: '' },
    { ja: '3台の例では予約を1台にまとめると点が上がり、実証試験では平均の稼働率が 21.6% 上がった。', en: '' },
    { ja: '予約表の状態だけから断片化を採点する、予約枠の評価指標の早い例。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  // timeline 7:00 .. 19:00 shown (720 min) over x 150..600
  var X0 = 150, X1 = 600;
  function tx(h) { return X0 + (h - 7) / 12 * (X1 - X0); }

  function lane(g, y, label, trips, col) {
    T(g, X0 - 12, y + 26, label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    el('rect', { x: X0, y: y, width: X1 - X0, height: 40, rx: 6, fill: '#fff', stroke: C.hair, 'stroke-width': 1.4 }, g);
    return trips.map(function (tr) {
      return el('rect', { x: tx(tr[0]), y: y + 4, width: tx(tr[0] + tr[1]) - tx(tr[0]), height: 32, rx: 4, fill: col }, g);
    });
  }
  function axis(g, y) {
    [7, 10, 13, 16, 19].forEach(function (h) {
      T(g, tx(h), y, h + ':00', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one trip per vehicle =====
    var g1 = S.g[0];
    T(g1, X0, 100, '元の予約表（論文の 3 台の例。7〜19 時を表示）', { 'font-size': 15, fill: C.muted });
    S.t1 = [lane(g1, 130, 'ev1', [[11, 0.5]], C.gray), lane(g1, 200, 'ev2', [[14, 1.5]], C.gray), lane(g1, 270, 'ev3', [[12, 1]], C.gray)];
    axis(g1, 340);
    S.fr1 = el('g', {}, g1);
    [[130, 7, 11], [130, 11.5, 19], [200, 7, 14], [200, 15.5, 19], [270, 7, 12], [270, 13, 19]].forEach(function (f) {
      el('rect', { x: tx(f[1]) + 2, y: f[0] + 2, width: tx(f[2]) - tx(f[1]) - 4, height: 36, rx: 5, fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, S.fr1);
    });
    T(S.fr1, X0, 400, '断片は 6 個（各車に 2 個ずつ）', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '排出量だけの最適化', C.a, [['将来の予約を考えない', 15], null, ['丸 1 日使いたい予約は', 15], ['どの車にも入らない', 15]]);
    TZ.note(g1, '予約の時刻は論文の例から');

    // ===== scene 2: weights =====
    var g2 = S.g[1];
    T(g2, 70, 96, '断片化の点 FR = (1/n) Σ 長さ × w₁ × w₂', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    // w1 schematic: increasing in duration
    function chart(g, x, y, title, path, xl) {
      el('line', { x1: x, y1: y + 160, x2: x + 220, y2: y + 160, stroke: C.ink, 'stroke-width': 1.5 }, g);
      el('line', { x1: x, y1: y, x2: x, y2: y + 160, stroke: C.ink, 'stroke-width': 1.5 }, g);
      T(g, x, y - 14, title, { 'font-size': 15, fill: C.ink, 'font-weight': 600 });
      T(g, x + 110, y + 184, xl, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return el('path', { d: path, fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    }
    var p = 'M70,330';
    S.w1 = chart(g2, 70, 170, 'w₁：長い断片ほど大きい', 'M70,328 C95,326 105,250 140,215 C175,190 230,180 290,176', '断片の長さ');
    S.w2 = chart(g2, 360, 170, 'w₂：業務時間ほど大きい', 'M360,190 L420,192 L460,200 L500,226 L540,270 L580,312', '時刻（7 時 → 翌朝）');
    S.p2 = TZ.panel(g2, PX, 140, '採点', C.b, [['点が高いほど', 15], ['断片化が小さい', 15], null, ['20 分ほど未満の断片は', 15, C.muted], ['使いにくいので軽く数える', 15, C.muted]]);
    TZ.note(g2, '模式図（重みの形は定性的）');

    // ===== scene 3: closed loop =====
    var g3 = S.g[2];
    function node(g, x, y, w, s, col) {
      el('rect', { x: x, y: y, width: w, height: 54, rx: 10, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      T(g, x + w / 2, y + 33, s, { 'font-size': 16, 'text-anchor': 'middle', fill: col, 'font-weight': 600 });
    }
    S.n3 = [0, 1, 2, 3].map(function () { return el('g', {}, g3); });
    node(S.n3[0], 70, 120, 220, '最適化（排出量）', C.ink);
    node(S.n3[1], 360, 120, 220, '新しい予約表', C.ink);
    node(S.n3[2], 360, 270, 220, '断片化の点で採点', C.b);
    node(S.n3[3], 70, 270, 220, '点の高いほうを残す', C.b);
    var arrows = [[290, 147, 356, 147], [470, 174, 470, 266], [360, 297, 294, 297], [180, 270, 180, 178]];
    S.a3 = arrows.map(function (a) {
      return el('line', { x1: a[0], y1: a[1], x2: a[2], y2: a[3], stroke: C.muted, 'stroke-width': 2, 'marker-end': 'url(#kt-arr)' }, g3);
    });
    var defs = el('defs', {}, svg), mk = el('marker', { id: 'kt-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: C.muted }, mk);
    S.q3 = T(g3, 70, 400, '最適化そのものは断片化を考えず、採点は採用の判断にだけ使う', { 'font-size': 15, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '閉ループ', C.b, [['予約表を定期的に', 15], ['作り直すたびに比べる', 15], null, ['断片化は柔らかい目的', 15, C.muted], ['（ソフトゴール）', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: numbers =====
    var g4 = S.g[3];
    T(g4, 70, 70, '3 台・1 日の例（論文の本文）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var cards = [['元の予約表', '断片 6 個', '約 794 点', C.a], ['3 件を 1 台にまとめた予約表', '断片 4 個（2 つは 1440 分）', '約 1051 点', C.b]];
    S.c4 = cards.map(function (c, i) {
      var g = el('g', {}, g4), x = 70 + i * 300;
      el('rect', { x: x, y: 100, width: 270, height: 150, rx: 12, fill: i ? C.bsoft : '#FCEBDF' }, g);
      T(g, x + 20, 136, c[0], { 'font-size': 15, fill: c[3] });
      T(g, x + 20, 176, c[1], { 'font-size': 16, fill: C.ink });
      T(g, x + 20, 226, c[2], { 'font-size': 30, 'font-weight': 650, fill: c[3] });
      return g;
    });
    S.c4b = el('g', {}, g4);
    T(S.c4b, 70, 320, '実証試験（ドイツの産業団地、約 1 年）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(S.c4b, 70, 380, '採点を入れたあと、平均の稼働率が', { 'font-size': 18, fill: C.ink });
    T(S.c4b, 400, 384, '+21.6%', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(S.c4b, 70, 430, 'ほかの変更の効果とは切り分けていない', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '論文の本文の数値');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['3 台の例の点', '約 794 → 約 1051'], ['実証試験の平均の稼働率', '+21.6%']],
      venue: 'VEHICULAR 2015', title: ['Schedule Rating Method based on', 'a Fragmentation Criterion'], tsize: 30,
      sub: '断片化の基準にもとづく予約表の採点法', authors: ['Falko Koetter, Julien Ostermann, Daniel Valerian Jecan'], url: 'thinkmind.org（VEHICULAR 2015）'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.t1.forEach(function (l, i) { l.forEach(function (r) { r.setAttribute('opacity', seg(t, 0.8 + i * 0.5, 1.3 + i * 0.5)); }); });
    S.fr1.setAttribute('opacity', seg(t, 3.0, 3.8));
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    [S.w1, S.w2].forEach(function (w, i) {
      w.setAttribute('stroke-dasharray', '400'); w.setAttribute('stroke-dashoffset', 400 * (1 - seg(t, 9.6 + i * 1.4, 11.0 + i * 1.4)));
    });
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.n3.forEach(function (n, i) { n.setAttribute('opacity', seg(t, 16.6 + i * 0.8, 17.1 + i * 0.8)); });
    S.a3.forEach(function (a, i) { a.setAttribute('opacity', seg(t, 17.0 + i * 0.8, 17.5 + i * 0.8)); });
    S.q3.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 19.8, 20.6));
    S.c4.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 24.6 + i * 1.2, 25.2 + i * 1.2)); });
    S.c4b.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
