// ---- shared helpers for the optimal-tree explainer teasers (Japanese-only pages) ----
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
// teaser-scenes.js — Xin, Zhong, Chen, Takagi, Seltzer & Rudin, Exploring the Whole Rashomon Set of Sparse
// Decision Trees (NeurIPS 2022). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the trees-per-
// second table printed in Fig. 2(c) of the paper (COMPAS column).
// Colours: orange = returning one model / sampling baselines; blue = the whole Rashomon set (TreeFARMS).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'ほとんど同じくらい良い木は数多くあるのに、学習アルゴリズムはその中から<span class="A">1 本だけ</span>を返す。', en: '' },
    { ja: '<span class="B">ラショモン集合</span>は、目的関数の値が最適な木の 1 + ε 倍以内に入るすべての木である。', en: '' },
    { ja: 'TreeFARMS は、部分問題と目的関数の値が同じ部分木をまとめ、左右の組合せとして木を保存する。', en: '' },
    { ja: 'COMPAS ではラショモン集合の木を 1 秒あたり 87,459 本見つけ、サンプリングにもとづく方法を桁違いに上回った。', en: '' },
    { ja: '集合全体が手に入るので、変数の重要度の範囲や、別の指標で良い木を直接調べられる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function cloud(g, seed) {
    var r = H.rng(seed), pts = [];
    for (var i = 0; i < 70; i++) {
      var x = 90 + r() * 500, obj = 0.30 + Math.pow(r(), 0.7) * 0.22;
      var y = 120 + (obj - 0.30) / 0.22 * 300;
      pts.push({ c: el('circle', { cx: x, cy: y, r: 6, fill: C.gray }, g), obj: obj, y: y });
    }
    return pts;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one model returned =====
    var g1 = S.g[0];
    T(g1, 70, 100, '良い ↑', { 'font-size': 14, fill: C.muted });
    T(g1, 70, 440, '目的関数の値（小さいほど良い）', { 'font-size': 14, fill: C.muted });
    S.pts1 = cloud(g1, 21);
    var best = S.pts1.reduce(function (a, b) { return a.obj < b.obj ? a : b; });
    S.best1 = best;
    S.ring1 = el('circle', { cx: best.c.getAttribute('cx'), cy: best.c.getAttribute('cy'), r: 14, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g1);
    S.lab1 = T(g1, +best.c.getAttribute('cx') + 22, +best.c.getAttribute('cy') + 6, '返されるのはこの 1 本', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, 'ふつうの学習', C.a, ['最適な 1 本だけを返す。', null, ['解釈しやすさ、公平性、', 15, C.muted], ['使う変数などで選びたい', 15, C.muted], ['ときに、ほかの候補が', 15, C.muted], ['見えない', 15, C.muted]]);
    TZ.note(g1, '模式図（点は木 1 本ずつ）');

    // ===== scene 2: Rashomon set below threshold =====
    var g2 = S.g[1];
    T(g2, 70, 100, '良い ↑', { 'font-size': 14, fill: C.muted });
    S.pts2 = cloud(g2, 21);
    var minObj = Math.min.apply(null, S.pts2.map(function (p) { return p.obj; }));
    var thr = minObj * 1.15, ty = 120 + (thr - 0.30) / 0.22 * 300;
    S.thr2 = el('g', {}, g2);
    el('line', { x1: 80, x2: 610, y1: ty, y2: ty, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, S.thr2);
    T(S.thr2, 610, ty + 24, 'しきい値 θ = (1 + ε) × 最適値', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    S.thrObj = thr;
    S.p2 = TZ.panel(g2, PX, 140, 'ε-ラショモン集合', C.b, ['しきい値より良い木を', 'すべて集める。', null, ['深さ 4 以下、二値の特徴量', 15, C.muted], ['10 個でも、木の数は', 15, C.muted], ['9.338 × 10²⁰ を超える', 15, C.muted]]);
    S.cnt2 = T(g2, 90, 470, '', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    TZ.note(g2, '模式図（ε = 0.15 とした例）');

    // ===== scene 3: model set: left x right =====
    var g3 = S.g[2];
    function chip(g, x, y, s, col) {
      el('rect', { x: x - 64, y: y - 18, width: 128, height: 36, rx: 8, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      T(g, x, y + 6, s, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    }
    el('rect', { x: 250, y: 70, width: 160, height: 46, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3);
    T(g3, 330, 99, '根：特徴量 j で分ける', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    T(g3, 170, 160, '左の部分問題', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    T(g3, 490, 160, '右の部分問題', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.left3 = el('g', {}, g3); S.right3 = el('g', {}, g3);
    [['値 0.10', 3], ['値 0.12', 2]].forEach(function (d, i) { chip(S.left3, 170, 205 + i * 50, d[0] + ' × ' + d[1] + ' 本', C.b); });
    [['値 0.20', 4], ['値 0.21', 1]].forEach(function (d, i) { chip(S.right3, 490, 205 + i * 50, d[0] + ' × ' + d[1] + ' 本', C.b); });
    S.cross3 = T(g3, 330, 340, '左右の組のうち、和がしきい値以内のものだけを残す', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.count3 = T(g3, 330, 376, '例：0.10 + 0.20、0.10 + 0.21、0.12 + 0.20 → 3 × 4 + 3 × 1 + 2 × 4 = 23 本', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.note3 = T(g3, 330, 412, '（しきい値 0.32 のとき。0.12 + 0.21 は超えるので除く）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 120, 'Model Set', C.b, [['（部分問題, 目的関数の値）', 15], ['ごとに部分木をまとめる', 15], null, ['損失がとる値は例の数', 15, C.muted], ['くらいしかないので、', 15, C.muted], ['同じ値の木がとても多い', 15, C.muted]]);
    TZ.note(g3, '模式図（数値は解説者が置いた例）');

    // ===== scene 4: trees in Rset per second on COMPAS (Fig. 2c) =====
    var g4 = S.g[3];
    T(g4, 70, 64, 'COMPAS で 1 秒あたりに見つけたラショモン集合の木（対数目盛）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var LX0 = 230, LX1 = 600, lo = -1, hi = 5;
    function lx(v) { return LX0 + (Math.log10(v) - lo) / (hi - lo) * (LX1 - LX0); }
    [0.1, 1, 10, 100, 1000, 10000, 100000].forEach(function (v) {
      el('line', { x1: lx(v), x2: lx(v), y1: 92, y2: 410, stroke: C.hair }, g4);
      el('text', { x: lx(v), y: 432, 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v >= 1000 ? (v / 1000) + 'k' : String(v);
    });
    el('line', { x1: LX0, x2: LX0, y1: 92, y2: 410, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var rows = [['BART', 0.14, C.a], ['GOSDT（部分データ）', 2.20, C.a], ['CART（部分データ）', 44.83, C.a], ['ランダムフォレスト', 68.67, C.a], ['TreeFARMS', 87459.10, C.b]];
    S.bars4 = rows.map(function (r, i) {
      var y = 110 + i * 60;
      T(g4, LX0 - 10, y + 24, r[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: LX0, y: y + 6, width: 0, height: 28, fill: r[2] }, g4);
      var lab = el('text', { x: lx(r[1]) + 6, y: y + 26, 'font-size': 14, 'font-weight': 650, fill: r[2] }, g4);
      lab.textContent = r[1].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (r[1] > 10000) { lab.setAttribute('x', lx(r[1]) - 6); lab.setAttribute('text-anchor', 'end'); lab.setAttribute('fill', '#fff'); }
      return { rect: rect, lab: lab, w: lx(r[1]) - LX0, t0: 24.6 + i * 0.6 };
    });
    S.p4 = TZ.panel(g4, PX, 120, 'TreeFARMS だけが', C.b, [['ラショモン集合の木を', 15], ['すべて見つけることを', 15], ['保証する', 15], null, ['Monk2 では 46 秒で 10⁸ 本', 15, C.muted], ['（BART は異なる木 488 本）', 15, C.muted]]);
    TZ.note(g4, '論文 Fig. 2(c) の表の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['Monk2・46 秒', 'ラショモン集合の木 10⁸ 本'], ['COMPAS・1 秒あたり', '87,459 本（RF は 68.67 本）']],
      venue: 'NeurIPS 2022', title: ['Exploring the Whole Rashomon Set', 'of Sparse Decision Trees'], tsize: 32,
      sub: '疎な決定木のラショモン集合をすべて調べる', authors: ['Rui Xin, Chudi Zhong, Zhi Chen, Takuya Takagi, Margo Seltzer, Cynthia Rudin'], url: 'arxiv.org/abs/2209.08040'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.pts1.forEach(function (p) { p.c.setAttribute('opacity', p === S.best1 ? 1 : 1 - 0.6 * seg(t, 3.0, 3.8)); p.c.setAttribute('fill', p === S.best1 ? H.mix(C.gray, C.a, seg(t, 2.4, 3.0)) : C.gray); });
    S.ring1.setAttribute('opacity', seg(t, 2.4, 3.0));
    S.lab1.setAttribute('opacity', seg(t, 3.0, 3.6));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.thr2.setAttribute('opacity', seg(t, 9.0, 9.6));
    var k = 0;
    S.pts2.forEach(function (p, i) {
      var inside = p.obj <= S.thrObj, v = inside ? seg(t, 10.0 + i * 0.03, 10.4 + i * 0.03) : 0;
      p.c.setAttribute('fill', H.mix(C.gray, C.b, v));
      p.c.setAttribute('opacity', inside ? 1 : 1 - 0.6 * seg(t, 10.0, 10.8));
      if (inside && v > 0.5) k++;
    });
    S.cnt2.querySelector('text').textContent = k ? 'ラショモン集合に入る木 ' + k + ' 本（この模式図では）' : '';
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    S.left3.setAttribute('opacity', seg(t, 17.0, 17.5));
    S.right3.setAttribute('opacity', seg(t, 17.6, 18.1));
    S.cross3.setAttribute('opacity', seg(t, 18.6, 19.2));
    S.count3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.note3.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    TZ.renderBars(S.bars4, t);
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
