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
// teaser-scenes.js — Nijssen & Fromont, Mining Optimal Decision Trees from Itemset Lattices (KDD 2007).
// Unofficial explainer. Scenes 1-3 are schematics (labelled 模式図); the information gains in scene 1
// are quoted from Section 4. Scene 4 uses pruned test accuracies printed in the paper's Figure 9 (a table).
// Colours: orange = heuristic learner (C4.5 / J48); blue = DL8.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">C4.5</span> などの貪欲法は情報利得などの基準で根の分岐を 1 つずつ決めていく。', en: '' },
    { ja: '論文の例では、葉に 10 件以上という制約のもとで最適な木は B を根にもつが、貪欲法は A を選んでしまう。', en: '' },
    { ja: '<span class="B">DL8</span> は木の経路をアイテム集合とみなし、集合ごとに最適な部分木を一度だけ計算して保存する。', en: '' },
    { ja: '葉の最小データ数を同じにすると、DL8 のテスト精度は 20 個中 9 個のデータで J48 より有意に高かった。', en: '' },
    { ja: '計算の限界を決めたのは時間よりもメモリで、全探索がいつも過学習を招くわけではなかった。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: greedy picks the root by information gain =====
    var g1 = S.g[0];
    T(g1, 90, 110, '根の候補と情報利得', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var cand = [['A', 0.33], ['B', 0.26]];
    S.bars1 = cand.map(function (c, i) {
      var y = 160 + i * 70;
      var ci = el('circle', { cx: 120, cy: y, r: 22, fill: C.gray }, g1);
      el('text', { x: 120, y: y + 6, 'font-size': 18, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g1).textContent = c[0];
      var r = el('rect', { x: 160, y: y - 14, width: 0, height: 28, fill: i === 0 ? C.a : C.gray }, g1);
      var t = el('text', { x: 160 + c[1] * 900 + 10, y: y + 6, 'font-size': 17, 'font-weight': 600, fill: i === 0 ? C.a : C.muted }, g1);
      t.textContent = c[1].toFixed(2);
      return { ci: ci, r: r, t: t, w: c[1] * 900, t0: 1.2 + i * 0.6, pick: i === 0 };
    });
    S.pick1 = T(g1, 90, 330, '→ 情報利得が大きい A を根にする', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 150, '貪欲法（C4.5）', C.a, ['根から順に、', 'その場で最も良い分岐を', '1 つずつ選ぶ。', null, ['選んだ分岐は', 15, C.muted], ['あとから見直さない。', 15, C.muted]]);
    TZ.note(g1, '情報利得の値は論文第 4 節の例');

    // ===== scene 2: the optimal tree has B at the root =====
    var g2 = S.g[1];
    T(g2, 170, 90, '貪欲法：根は A', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    el('circle', { cx: 170, cy: 150, r: 22, fill: C.a }, g2);
    el('text', { x: 170, y: 156, 'font-size': 18, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g2).textContent = 'A';
    [-1, 1].forEach(function (s) {
      el('line', { x1: 170, y1: 172, x2: 170 + s * 60, y2: 230, stroke: C.a, 'stroke-width': 1.8, 'stroke-dasharray': '5 5' }, g2);
      el('text', { x: 170 + s * 60, y: 256, 'font-size': 20, 'text-anchor': 'middle', fill: C.muted }, g2).textContent = '…';
    });
    S.tree2 = el('g', {}, g2);
    T(S.tree2, 450, 90, '最適な木：根は B', { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    TZ.tree(S.tree2, { l: 'B', yes: { leaf: '1' }, no: { l: 'C', yes: { leaf: '1' }, no: { leaf: '0' } } }, 450, 150, 90, 95, C.b);
    S.n2 = T(g2, 90, 440, '葉の最小データ数 10 のもとで最適な木（論文 Fig. 1）', { 'font-size': 15, fill: C.muted });
    S.p2 = TZ.panel(g2, PX, 150, '見つからない ≠ 存在しない', C.ink, ['貪欲法が条件を満たす木を', '見つけられなくても、', 'そのような木がないとは', '言えない。', null, ['最適な木を求める問題は', 15, C.muted], ['NP 困難', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: itemset lattice + memoisation =====
    var g3 = S.g[2];
    var N = {
      e: [330, 80, '{ }'],
      A: [150, 200, '{A}'], nA: [270, 200, '{¬A}'], B: [390, 200, '{B}'], nB: [510, 200, '{¬B}'],
      AB: [210, 330, '{A, B}'], AnB: [330, 330, '{A, ¬B}'], nAB: [450, 330, '{¬A, B}']
    };
    var E = [['e', 'A'], ['e', 'nA'], ['e', 'B'], ['e', 'nB'], ['A', 'AB'], ['A', 'AnB'], ['B', 'AB'], ['nA', 'nAB'], ['B', 'nAB'], ['nB', 'AnB']];
    S.edges3 = E.map(function (p) {
      var a = N[p[0]], b = N[p[1]];
      return { k: p, l: el('line', { x1: a[0], y1: a[1] + 20, x2: b[0], y2: b[1] - 20, stroke: C.hair, 'stroke-width': 2 }, g3) };
    });
    S.nodes3 = {};
    Object.keys(N).forEach(function (k) {
      var n = N[k];
      var r = el('rect', { x: n[0] - 48, y: n[1] - 20, width: 96, height: 40, rx: 20, fill: '#fff', stroke: C.gray, 'stroke-width': 2 }, g3);
      var t = el('text', { x: n[0], y: n[1] + 6, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g3);
      t.textContent = n[2];
      S.nodes3[k] = { r: r, t: t };
    });
    S.ring = el('rect', { x: N.AB[0] - 56, y: N.AB[1] - 28, width: 112, height: 56, rx: 28, fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
    S.memo = T(g3, 210, 392, '保存済み：再計算しない', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.route1 = T(g3, 70, 450, '「A のあと B」でも「B のあと A」でも、届く例は同じ {A, B}', { 'font-size': 15, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 110, 'DL8', C.b, [['① 経路＝アイテム集合', 16, C.ink, 600], ['葉に届く例の集合が決まる', 15, C.muted], null, ['② 左右の部分木は', 16, C.ink, 600], ['独立に最適化できる', 16, C.ink, 600], null, ['③ 集合ごとに最適な', 16, C.ink, 600], ['部分木を保存して使い回す', 16, C.ink, 600]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: pruned test accuracy, J48 vs DL8 (Figure 9) =====
    var g4 = S.g[3];
    T(g4, 70, 64, 'テスト精度（剪定あり、同じ最小頻度）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(g4, 470, 64, '■ J48', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    T(g4, 540, 64, '■ DL8', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    var rows = [
      { label: 'mushroom', a: 0.92, b: 0.97 }, { label: 'chess', a: 0.90, b: 0.95 },
      { label: 'segment', a: 0.73, b: 0.83 }, { label: 'ionosphere', a: 0.79, b: 0.84 },
      { label: 'vehicle', a: 0.59, b: 0.67 }, { label: 'yeast', a: 0.53, b: 0.50 }
    ];
    rows.forEach(function (r) { r.la = r.a.toFixed(2).slice(1); r.lb = r.b.toFixed(2).slice(1); });
    S.bars4 = TZ.pairs(g4, { x0: 180, x1: 600, v0: 0.4, v1: 1.0, y0: 96, rowH: 58, rows: rows, t0: 24.6, dt: 0.55, ticks: [0.4, 0.6, 0.8, 1.0], fmt: function (v) { return v.toFixed(1); } });
    S.p4 = TZ.panel(g4, PX, 110, '20 個のデータでは', C.ink, [['DL8 が有意に高い：9 個', 16, C.b, 600], ['J48 が有意に高い：1 個', 16, C.a, 600], null, ['yeast（最小頻度 2）は', 15, C.muted], ['J48 が有意に高かった例', 15, C.muted], null, ['ほかの 5 個は DL8 が', 15, C.muted], ['有意に高かった例', 15, C.muted]]);
    TZ.note(g4, '論文 Figure 9 の表の数値から作図（横軸は 0.4 から）');

    // ===== scene 5: takeaway + title card =====
    TZ.title(S.g[4], {
      cards: [['同じ制約で J48 と比べて', '20 個中 9 個で有意に上回る'], ['最適な木の取り出し', '格子の辺の数に比例する時間']],
      venue: 'KDD 2007', title: ['Mining Optimal Decision Trees', 'from Itemset Lattices'],
      sub: 'アイテム集合の束から最適な決定木を掘り出す', authors: ['Siegfried Nijssen, Elisa Fromont'], url: 'doi.org/10.1145/1281192.1281250'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.bars1.forEach(function (b) {
      b.r.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.8)));
      b.t.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
      if (b.pick) b.ci.setAttribute('fill', H.mix(C.gray, C.a, seg(t, 3.4, 4.0)));
    });
    S.pick1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.tree2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.n2.setAttribute('opacity', seg(t, 10.2, 10.8));
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    // scene 3: path {} -> {A} -> {A,B} lights up, then {} -> {B} -> {A,B} reuses the stored node
    var lit = {
      e: seg(t, 16.8, 17.2), A: seg(t, 17.4, 17.8), AB: seg(t, 18.0, 18.4), AnB: seg(t, 18.6, 19.0),
      nA: seg(t, 19.2, 19.6), nAB: seg(t, 19.8, 20.2), B: seg(t, 20.6, 21.0), nB: seg(t, 21.0, 21.4)
    };
    Object.keys(S.nodes3).forEach(function (k) {
      var v = lit[k] || 0;
      S.nodes3[k].r.setAttribute('fill', H.mix('#FFFFFF', C.b, v));
      S.nodes3[k].r.setAttribute('stroke', v > 0.5 ? C.b : C.gray);
      S.nodes3[k].t.setAttribute('fill', v > 0.5 ? '#fff' : C.ink);
    });
    S.edges3.forEach(function (e) {
      var v = Math.min(lit[e.k[0]] || 0, lit[e.k[1]] || 0);
      e.l.setAttribute('stroke', v > 0.5 ? C.b : C.hair);
    });
    var reuse = seg(t, 21.4, 21.9);
    S.edges3.forEach(function (e) { if (e.k[0] === 'B' && e.k[1] === 'AB') { e.l.setAttribute('stroke', reuse > 0.5 ? C.b : C.hair); e.l.setAttribute('stroke-dasharray', '6 5'); } });
    S.memo.setAttribute('opacity', reuse);
    S.ring.setAttribute('opacity', reuse);
    S.route1.setAttribute('opacity', reuse);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    TZ.renderBars(S.bars4, t);
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
