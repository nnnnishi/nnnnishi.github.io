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
// teaser-scenes.js — Hu, Rudin & Seltzer, Optimal Sparse Decision Trees (NeurIPS 2019). Unofficial explainer.
// Scene 1 redraws the shape of the BinOCT Monk1 tree (Fig. 6a: depth 3, two splits with equal-label leaves).
// Scene 2 uses the counts in Section 2 (Catalan(7) = 429 vs 1). Scene 3 is a schematic of the lookahead
// bound with explainer-chosen numbers (labelled 模式図). Scene 4 uses training accuracies printed in
// Figs. 5 and 6 of the paper.
// Colours: orange = BinOCT / CART; blue = OSDT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">BinOCT</span> は決めた深さの完全二分木しか探さないので、同じラベルの葉を作るだけの分岐が残ることがある。', en: '' },
    { ja: '木の形を決めなければ、葉が 8 枚でも形は 429 通りあり、探す範囲はずっと広い。', en: '' },
    { ja: '<span class="B">OSDT</span> は分けない葉の誤りと葉の罰則で下界を作り、それが最良値を超える木は子孫ごと捨てる。', en: '' },
    { ja: '論文に載った木では Tic-Tac-Toe（葉 8 枚どうし）でも Monk1 でも、OSDT の訓練精度が BinOCT より高かった。', en: '' },
    { ja: '先読みの下界と同値な点の下界の効果が特に大きく、外すと最適な木までの時間が 2 桁以上延びた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: complete binary tree with useless splits =====
    var g1 = S.g[0];
    var spec = { l: '', yes: { l: '', yes: { l: '', yes: { leaf: 'Y' }, no: { leaf: 'Y' } }, no: { l: '', yes: { leaf: 'N' }, no: { leaf: 'Y' } } },
                 no: { l: '', yes: { l: '', yes: { leaf: 'N' }, no: { leaf: 'Y' } }, no: { l: '', yes: { leaf: 'Y' }, no: { leaf: 'Y' } } } };
    S.tree1 = TZ.tree(g1, spec, 340, 110, 160, 110, C.a);
    S.bad1 = el('g', {}, g1);
    [[100, 'Y'], [580, 'Y']].forEach(function (p) {
      el('rect', { x: p[0] - 70, y: 440 - 26, width: 140, height: 52, rx: 10, fill: 'none', stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, S.bad1);
    });
    T(S.bad1, 340, 500, '点線：同じラベルの葉を 2 枚作るだけの分岐', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 140, 'BinOCT（MIP）', C.a, ['深さ 3 の完全二分木の', '中で最適な木を探す。', null, ['論文の Monk1 の例では', 15, C.muted], ['不要な分岐が 2 つあり、', 15, C.muted], ['訓練精度は 91.129%', 15, C.muted]]);
    TZ.note(g1, '論文 Fig. 6(a) の木の形を写した模式図（Y/N は葉のラベル）');

    // ===== scene 2: 429 shapes vs 1 =====
    var g2 = S.g[1];
    S.n2a = T(g2, 200, 230, '1', { 'font-size': 88, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    T(g2, 200, 290, '葉 8 枚の完全二分木', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.n2b = T(g2, 470, 230, '429', { 'font-size': 88, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    T(g2, 470, 290, '葉 8 枚の二分木の形', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    T(g2, 470, 316, '（Catalan(7)、ラベルなし）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.n2c = T(g2, 335, 400, 'OSDT は深さも葉の数も固定しない', { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 150, '目的関数', C.b, ['誤分類率 ＋ ' + '<tspan ' + MI + '>λ</tspan>' + ' × 葉の数', null, ['葉を 1 枚増やすたびに', 15, C.muted], ['罰則が <tspan ' + MI + '>λ</tspan> 増える。', 15, C.muted], ['葉の数の上限は', 15, C.muted], ['<tspan ' + MI + '>λ</tspan> から事前に決まる。', 15, C.muted]]);
    TZ.note(g2, '数は論文第 2 節による');

    // ===== scene 3: lookahead bound prunes a branch of the search =====
    var g3 = S.g[2];
    var NODES = [
      { id: 'r', x: 330, y: 90, b: 0.10, lab: '葉 1' },
      { id: 'a', x: 180, y: 210, b: 0.18, lab: '葉 2' }, { id: 'c', x: 480, y: 210, b: 0.27, lab: '葉 2' },
      { id: 'a1', x: 110, y: 340, b: 0.21, lab: '葉 3' }, { id: 'a2', x: 250, y: 340, b: 0.23, lab: '葉 3' },
      { id: 'c1', x: 420, y: 340, b: 0.30, lab: '葉 3' }, { id: 'c2', x: 540, y: 340, b: 0.31, lab: '葉 3' }
    ];
    var par = { a: 'r', c: 'r', a1: 'a', a2: 'a', c1: 'c', c2: 'c' };
    S.n3 = {};
    NODES.forEach(function (n) {
      if (par[n.id]) { var p = NODES.filter(function (q) { return q.id === par[n.id]; })[0];
        n.edge = el('line', { x1: p.x, y1: p.y + 26, x2: n.x, y2: n.y - 26, stroke: C.gray, 'stroke-width': 2 }, g3); }
    });
    NODES.forEach(function (n) {
      n.box = el('rect', { x: n.x - 52, y: n.y - 26, width: 104, height: 52, rx: 10, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, g3);
      n.t1 = el('text', { x: n.x, y: n.y - 4, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g3); n.t1.textContent = n.lab;
      n.t2 = el('text', { x: n.x, y: n.y + 17, 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, g3);
      n.t2.innerHTML = '<tspan ' + MI + '>b</tspan> = ' + n.b.toFixed(2);
      S.n3[n.id] = n;
    });
    S.cut = el('g', {}, g3);
    el('line', { x1: 420, y1: 260, x2: 560, y2: 300, stroke: C.a, 'stroke-width': 3 }, S.cut);
    el('line', { x1: 420, y1: 300, x2: 560, y2: 260, stroke: C.a, 'stroke-width': 3 }, S.cut);
    S.rule = T(g3, 330, 430, '<tspan ' + MI + '>b</tspan> + <tspan ' + MI + '>λ</tspan> = 0.27 + 0.05 ≥ <tspan ' + MI + '>R</tspan><tspan dy="-8" font-size="12">c</tspan><tspan dy="8"> = 0.30 → 子孫をすべて捨てる</tspan>', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 110, '1 段先読みの下界', C.b, [['<tspan ' + MI + '>b</tspan> ＝ 分けない葉の誤り', 15], ['＋ <tspan ' + MI + '>λ</tspan> × 葉の数', 15], null, ['子の木は葉が 1 枚以上多い', 15, C.muted], ['ので、<tspan ' + MI + '>b</tspan> + <tspan ' + MI + '>λ</tspan> が最良値 <tspan ' + MI + '>R</tspan><tspan dy="-6" font-size="11">c</tspan><tspan dy="6"> 以上</tspan>', 15, C.muted], ['なら調べなくてよい', 15, C.muted], null, ['<tspan ' + MI + '>λ</tspan> = 0.05、<tspan ' + MI + '>R</tspan><tspan dy="-6" font-size="11">c</tspan><tspan dy="6"> = 0.30 とした例</tspan>', 14, C.muted]]);
    TZ.note(g3, '模式図（数値は解説者が置いた例）');

    // ===== scene 4: training accuracy of the 8-leaf trees (Figs. 5, 6) =====
    var g4 = S.g[3];
    T(g4, 70, 70, '訓練精度（論文 Fig. 5・6 の木）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(g4, 400, 70, '■ BinOCT', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    T(g4, 500, 70, '■ OSDT', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    var rows = [
      { label: 'Tic-Tac-Toe', a: 76.722, b: 82.881, la: '76.722%', lb: '82.881%' },
      { label: 'Monk1', a: 91.129, b: 100, la: '91.129%', lb: '100%' }
    ];
    S.bars4 = TZ.pairs(g4, { x0: 180, x1: 560, v0: 60, v1: 100, y0: 130, rowH: 130, rows: rows, t0: 24.8, dt: 1.2, ticks: [60, 70, 80, 90, 100], fmt: function (v) { return v + '%'; } });
    S.p4 = TZ.panel(g4, PX, 120, '論文に載った木', C.ink, [['Tic-Tac-Toe はどちらも', 15, C.muted], ['葉 8 枚の木', 15, C.muted], null, ['Monk1 の BinOCT は', 15, C.muted], ['深さ 3（葉 8 枚）', 15, C.muted], null, ['制限時間はどちらも 30 分', 15, C.muted]]);
    TZ.note(g4, '論文に印刷された精度から作図（横軸は 60% から）');

    // ===== scene 5: title card =====
    TZ.title(S.g[4], {
      cards: [['先読みの下界を外すと', '全体で 2,158 倍遅い'], ['Monk1 の訓練精度', '100%（BinOCT は 91.129%）']],
      venue: 'NeurIPS 2019', title: ['Optimal Sparse Decision Trees'], tsize: 36,
      sub: '疎で最適な決定木', authors: ['Xiyang Hu, Cynthia Rudin, Margo Seltzer'], url: 'arxiv.org/abs/1904.12847'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.tree1.nodes.forEach(function (n) {
      var v = seg(t, 0.8 + n.d * 0.5, 1.2 + n.d * 0.5);
      n.el.setAttribute('opacity', v); n.tx.setAttribute('opacity', v);
    });
    S.tree1.edges.forEach(function (e) { var v = seg(t, 1.0 + e.d * 0.5, 1.4 + e.d * 0.5); e.el.setAttribute('opacity', v); e.lb.setAttribute('opacity', 0); });
    S.bad1.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.n2a.setAttribute('opacity', seg(t, 8.8, 9.3));
    S.n2b.setAttribute('opacity', seg(t, 10.0, 10.6));
    S.n2c.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    var ids = ['r', 'a', 'c', 'a1', 'a2', 'c1', 'c2'];
    ids.forEach(function (id, i) {
      var n = S.n3[id], v = seg(t, 16.6 + i * 0.35, 17.0 + i * 0.35);
      var dead = (id === 'c1' || id === 'c2') ? seg(t, 20.2, 20.8) : 0;
      var o = v * (1 - 0.7 * dead);
      [n.box, n.t1, n.t2].forEach(function (e) { e.setAttribute('opacity', o); });
      if (n.edge) n.edge.setAttribute('opacity', o);
      if (id === 'c') n.box.setAttribute('stroke', seg(t, 19.6, 20.0) > 0.5 ? C.a : C.b);
    });
    S.cut.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.rule.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    TZ.renderBars(S.bars4, t);
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
