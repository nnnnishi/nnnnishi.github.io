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
// teaser-scenes.js — Demirović et al., MurTree: Optimal Decision Trees via Dynamic Programming and Search
// (JMLR 23(26), 2022). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses runtimes and
// time-out counts from Table 5 of the paper (depth 4, 10-minute limit, 47 datasets).
// Colours: orange = DL8.5 / generic depth-2 search; blue = MurTree.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '動的計画法で深さ 2 の木を求めるたびに、<span class="A">データを特徴量ごとに分け直す</span>と、計算はデータの大きさ × 特徴量の数の 2 乗に比例する。', en: '' },
    { ja: '<span class="B">MurTree</span> は特徴量の組ごとの頻度を一度数え、深さ 2 の最適な木をその表だけから求める。', en: '' },
    { ja: '前に解いた部分問題の誤分類の数から、取り除かれた例の数を引くと、新しい部分問題の下界になる。', en: '' },
    { ja: '47 個のデータで深さ 4 の木を求めると、DL8.5 は 19 個で時間切れになり、MurTree はすべてを解いた。', en: '' },
    { ja: '決定木に固有の性質を活かした専用の手順で、最適な木の計算を桁違いに速くした、と論文はまとめる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: generic depth-2 search re-splits the data =====
    var g1 = S.g[0];
    T(g1, 80, 100, '根の候補 × 子の候補ごとに、データを分け直す', { 'font-size': 15, fill: C.muted });
    S.rows1 = [];
    for (var r = 0; r < 4; r++) {
      var row = el('g', {}, g1), y = 140 + r * 70;
      T(row, 80, y + 26, '根 f' + (r + 1), { 'font-size': 15, fill: C.ink });
      for (var c = 0; c < 6; c++) {
        var x = 150 + c * 72;
        el('rect', { x: x, y: y, width: 60, height: 40, rx: 6, fill: '#fff', stroke: C.a, 'stroke-width': 1.6 }, row);
        for (var k = 0; k < 6; k++) el('rect', { x: x + 6 + k * 8, y: y + 10, width: 5, height: 20, fill: C.a, opacity: 0.55 }, row);
      }
      S.rows1.push({ g: row, t0: 1.2 + r * 0.6 });
    }
    S.cost1 = T(g1, 80, 440, '<tspan ' + MI + '>O</tspan>(|<tspan ' + MI + '>D</tspan>| · |<tspan ' + MI + '>F</tspan>|²)：データ全体を何度も走査する', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '一般の再帰（DL8.5 など）', C.a, ['深さ 2 の木 1 本に、', 'データを 2|F|² 回分ける。', null, ['深さ 2 の木は探索の', 15, C.muted], ['中で何度も必要になる', 15, C.muted]]);
    TZ.note(g1, '模式図（四角の中の縦棒は届く例のイメージ）');

    // ===== scene 2: pairwise frequency table =====
    var g2 = S.g[1];
    var N = 6, X0 = 130, Y0 = 110, CS = 50;
    T(g2, X0, Y0 - 16, '正例での頻度 FQ⁺(fᵢ, fⱼ)（負例も同じ表を作る）', { 'font-size': 15, fill: C.muted });
    var r2 = H.rng(5);
    S.cells2 = [];
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
      if (j < i) continue;
      var v = i === j ? 20 + Math.floor(r2() * 30) : Math.floor(r2() * 20);
      var rc = el('rect', { x: X0 + j * CS, y: Y0 + i * CS, width: CS - 4, height: CS - 4, rx: 5, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.2 }, g2);
      var tx = el('text', { x: X0 + j * CS + (CS - 4) / 2, y: Y0 + i * CS + 29, 'font-size': 15, 'text-anchor': 'middle', fill: C.ink }, g2);
      tx.textContent = String(v);
      S.cells2.push({ rc: rc, tx: tx, t0: 8.8 + (i * N + j) * 0.06 });
    }
    S.f2 = T(g2, X0, Y0 + N * CS + 34, '<tspan ' + MI + '>FQ</tspan>⁺(f̄ᵢ) = |<tspan ' + MI + '>D</tspan>⁺| − <tspan ' + MI + '>FQ</tspan>⁺(fᵢ) のように、残りは引き算で求まる', { 'font-size': 15, fill: C.ink });
    S.f2b = T(g2, X0, Y0 + N * CS + 66, '<tspan ' + MI + '>O</tspan>(|<tspan ' + MI + '>D</tspan>| · <tspan ' + MI + '>m</tspan>² + |<tspan ' + MI + '>F</tspan>|²)、<tspan ' + MI + '>m</tspan> は 1 つの例で 1 の特徴量の数', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p2 = TZ.panel(g2, PX, 130, '深さ 2 の専用の手順', C.b, [['① 組ごとの頻度を数える', 15], ['② 根ごとに最良の左右の', 15], ['　 子を表から選ぶ', 15], null, ['続く呼び出しでは、前の', 15, C.muted], ['データとの差分だけで', 15, C.muted], ['表を更新する', 15, C.muted]]);
    TZ.note(g2, '模式図（頻度は架空）');

    // ===== scene 3: similarity-based lower bound =====
    var g3 = S.g[2];
    el('circle', { cx: 250, cy: 240, r: 120, fill: C.panel, stroke: C.gray, 'stroke-width': 2 }, g3);
    S.newC = el('circle', { cx: 390, cy: 240, r: 120, fill: 'none', stroke: C.b, 'stroke-width': 2.5 }, g3);
    T(g3, 190, 240, '取り除かれた例', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    T(g3, 190, 264, '|D_out| = 3', { 'font-size': 16, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    T(g3, 320, 250, '共通', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.inL = T(g3, 450, 250, '加わった例', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    T(g3, 250, 100, '前に解いた D_old：誤分類 10', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.newL = T(g3, 420, 100, '新しい D_new', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.eq3 = T(g3, 320, 420, '下界 = 10 − 3 = 7　上界が 6 なら調べずに捨てる', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 130, '類似度による下界', C.b, [['取り除いた例が全部', 15], ['誤分類だったとしても、', 15], ['新しい木の誤分類は', 15], ['10 − 3 より少なくならない', 15], null, ['同じ経路を前に探索して', 15, C.muted], ['いなくても使える', 15, C.muted]]);
    TZ.note(g3, '模式図（数値は解説者が置いた例）');

    // ===== scene 4: Table 5 runtimes (depth 4) =====
    var g4 = S.g[3];
    T(g4, 70, 64, '深さ 4 の最適な木を求める時間（秒、対数目盛）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(g4, 440, 64, '■ DL8.5', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    T(g4, 530, 64, '■ MurTree', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    var LX0 = 200, LX1 = 600;
    function lx(v) { return LX0 + (Math.log10(v) - 0) / (Math.log10(600) - 0) * (LX1 - LX0); }
    [1, 10, 100].forEach(function (v) {
      el('line', { x1: lx(v), x2: lx(v), y1: 90, y2: 400, stroke: C.hair }, g4);
      el('text', { x: lx(v), y: 424, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    el('line', { x1: lx(600), x2: lx(600), y1: 90, y2: 400, stroke: C.a, 'stroke-dasharray': '4 4' }, g4);
    el('text', { x: lx(600), y: 424, 'font-size': 14, fill: C.a, 'text-anchor': 'middle' }, g4).textContent = '600（制限）';
    el('line', { x1: LX0, x2: LX0, y1: 90, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var data = [['australian-credit', 383, 2], ['diabetes', 421, 2], ['german-credit', 326, 2], ['yeast', 186, 2], ['ionosphere', null, 89]];
    S.bars4 = [];
    data.forEach(function (d, i) {
      var y = 100 + i * 60;
      T(g4, LX0 - 10, y + 26, d[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [[d[1], C.a, 0], [d[2], C.b, 1]].forEach(function (b) {
        var yy = y + b[2] * 24, val = b[0];
        var to = val == null;
        var w = (to ? lx(600) : lx(val)) - LX0;
        var rect = el('rect', { x: LX0, y: yy, width: 0, height: 20, fill: b[1], 'fill-opacity': to ? 0.3 : 1 }, g4);
        var lab = el('text', { x: LX0 + w + 6, y: yy + 16, 'font-size': 14, 'font-weight': 600, fill: b[1] }, g4);
        lab.textContent = to ? '時間切れ' : String(val);
        if (to) { lab.setAttribute('x', LX0 + w - 6); lab.setAttribute('text-anchor', 'end'); }
        S.bars4.push({ rect: rect, lab: lab, w: w, t0: 24.6 + i * 0.6 + b[2] * 0.25 });
      });
    });
    S.p4 = TZ.panel(g4, PX, 120, '47 個のデータで', C.ink, [['時間切れの数（深さ 4）', 15, C.muted], ['DL8.5：19 個', 17, C.a, 650], ['MurTree：0 個', 17, C.b, 650], null, ['深さ 5 では', 15, C.muted], ['DL8.5 32 個、MurTree 8 個', 15, C.muted]]);
    TZ.note(g4, '論文 Table 5 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['深さ 4 での時間切れ（47 個中）', 'DL8.5 19 個 → MurTree 0 個'], ['australian-credit（深さ 4）', '383 秒 → 2 秒']],
      venue: 'JMLR 2022', title: ['MurTree: Optimal Decision Trees via', 'Dynamic Programming and Search'], tsize: 30,
      sub: '動的計画法と探索による最適な決定木', authors: ['Emir Demirović, Anna Lukina, Emmanuel Hebrard, Jeffrey Chan,', 'James Bailey, Christopher Leckie, Kotagiri Ramamohanarao, Peter J. Stuckey'], url: 'jmlr.org/papers/v23/20-520.html'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.rows1.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.cost1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.cells2.forEach(function (c) { var v = seg(t, c.t0, c.t0 + 0.3); c.rc.setAttribute('opacity', v); c.tx.setAttribute('opacity', v); });
    S.f2.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.f2b.setAttribute('opacity', seg(t, 12.4, 13.0));
    S.p2.setAttribute('opacity', seg(t, 9.0, 9.8));
    S.newC.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.newL.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.inL.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.eq3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
