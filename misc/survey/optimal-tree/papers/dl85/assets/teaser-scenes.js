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
// teaser-scenes.js — Aglin, Nijssen & Schaus, Learning Optimal Decision Trees Using Caching
// Branch-and-Bound Search (AAAI 2020). Unofficial explainer.
// Scenes 1-3 are schematics of the paper's running example (Fig. 2: which nodes DL8.5 visits, and
// the NO_TREE reuse at itemset ¬ac). Scene 4 uses the counts stated in the Results section (depth 4).
// Colours: orange = DL8 / BinOCT / CP and the ablation without partial solutions; blue = DL8.5.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">DL8</span> は木の経路をアイテム集合とみなして部分木を調べ、結果をキャッシュに保存する。', en: '' },
    { ja: '<span class="B">DL8.5</span> は見つけた木の誤りを上界として子に渡し、上界を超える枝はその場で打ち切る。', en: '' },
    { ja: '上界のもとで木が見つからなかったことも、その上界と一緒にキャッシュに残して使い回す。', en: '' },
    { ja: '深さ 4、制限時間 10 分では 24 個のデータのうち 19 個で最適性を証明した（BinOCT は 1 個）。', en: '' },
    { ja: '二値のデータでも連続値のデータでも、DL8.5 は MIP による BinOCT より桁違いに速かった。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  // lattice of the paper's example (attributes a, b, c)
  var ROWS = [
    ['φ'],
    ['¬a', 'a', '¬b', 'b', '¬c', 'c'],
    ['¬a¬b', '¬ab', '¬a¬c', '¬ac', 'a¬b', 'ab', 'a¬c', 'ac', '¬b¬c', '¬bc', 'b¬c', 'bc'],
    ['¬a¬b¬c', '¬a¬bc', '¬ab¬c', '¬abc', 'a¬b¬c', 'a¬bc', 'ab¬c', 'abc']
  ];
  var VISITED = ['φ', '¬a', 'a', '¬b', '¬c', 'c', '¬a¬b', '¬ab', '¬a¬c', '¬ac', 'a¬c', '¬b¬c', '¬bc', '¬a¬b¬c', '¬a¬bc', '¬ab¬c', 'a¬b¬c'];
  function items(s) { return s === 'φ' ? [] : s.match(/¬?[abc]/g); }
  function isParent(p, c) {
    var ip = items(p), ic = items(c);
    return ic.length === ip.length + 1 && ip.every(function (x) { return ic.indexOf(x) >= 0; });
  }

  function lattice(g, x0, x1, ys) {
    var pos = {}, out = { nodes: {}, edges: [] };
    ROWS.forEach(function (r, k) {
      r.forEach(function (n, i) { pos[n] = [x0 + (i + 0.5) * (x1 - x0) / r.length, ys[k]]; });
    });
    for (var k = 1; k < ROWS.length; k++) ROWS[k].forEach(function (c) {
      ROWS[k - 1].forEach(function (p) {
        if (isParent(p, c)) out.edges.push({ p: p, c: c, l: el('line', { x1: pos[p][0], y1: pos[p][1], x2: pos[c][0], y2: pos[c][1], stroke: C.hair, 'stroke-width': 1.2 }, g) });
      });
    });
    ROWS.forEach(function (r, k) {
      r.forEach(function (n) {
        out.nodes[n] = el('circle', { cx: pos[n][0], cy: pos[n][1], r: k === 0 ? 12 : 9, fill: '#fff', stroke: C.gray, 'stroke-width': 2, 'stroke-dasharray': n === 'abc' ? '3 3' : 'none' }, g);
      });
    });
    out.pos = pos;
    return out;
  }
  function rowLabels(g, ys) {
    ['根', '1 項目', '2 項目', '3 項目'].forEach(function (s, k) { T(g, 50, ys[k] + 5, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    var YS = [110, 200, 300, 400];

    // ===== scene 1: DL8 visits every frequent node =====
    var g1 = S.g[0];
    rowLabels(g1, YS);
    S.L1 = lattice(g1, 70, 620, YS);
    S.order1 = [];
    ROWS.forEach(function (r) { r.forEach(function (n) { if (n !== 'abc') S.order1.push(n); }); });
    S.cnt1 = T(g1, 345, 460, '', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 140, 'DL8', C.a, ['同じ部分木は', 'キャッシュで使い回す。', null, ['ただし枝刈りが弱く、', 15, C.muted], ['この例では頻度の足りない', 15, C.muted], ['abc 以外をすべて調べる。', 15, C.muted]]);
    TZ.note(g1, '論文 Fig. 2 の例（属性 3 つ、例 11 個）の模式図');

    // ===== scene 2: DL8.5 visits 17 nodes =====
    var g2 = S.g[1];
    rowLabels(g2, YS);
    S.L2 = lattice(g2, 70, 620, YS);
    S.cnt2 = T(g2, 345, 460, '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 120, 'DL8.5', C.b, [['① 木が見つかったら、', 16], ['その誤りを上界にする', 16], null, ['② 片方の枝で上界を超えたら', 16], ['もう片方は調べない', 16], null, ['③ もう片方には', 16], ['残りの余裕を上界として渡す', 16]]);
    TZ.note(g2, '青：DL8.5 が調べる節点（論文 Fig. 2 による）');

    // ===== scene 3: NO_TREE stored with its bound =====
    var g3 = S.g[2];
    var NA = [190, 120], NC = [470, 120], NX = [330, 300];
    function bigNode(p, s) {
      var c = el('circle', { cx: p[0], cy: p[1], r: 34, fill: '#fff', stroke: C.b, 'stroke-width': 2.2 }, g3);
      el('text', { x: p[0], y: p[1] + 7, 'font-size': 20, 'text-anchor': 'middle', fill: C.ink, 'class': 'mi' }, g3).textContent = s;
      return c;
    }
    S.e1 = el('line', { x1: NA[0], y1: NA[1] + 34, x2: NX[0], y2: NX[1] - 34, stroke: C.b, 'stroke-width': 2.4 }, g3);
    S.e2 = el('line', { x1: NC[0], y1: NC[1] + 34, x2: NX[0], y2: NX[1] - 34, stroke: C.b, 'stroke-width': 2.4, 'stroke-dasharray': '7 6' }, g3);
    bigNode(NA, '¬a'); bigNode(NC, 'c'); S.nx = bigNode(NX, '¬ac');
    S.l1 = T(g3, 240, 215, '1 回目：上界 0 で探索', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.l1b = T(g3, 330, 372, '木が見つからない → NO_TREE を保存', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.l2 = T(g3, 420, 215, '2 回目：上界 0 で到着', { 'font-size': 15, fill: C.ink });
    S.l2b = T(g3, 330, 400, 'キャッシュから NO_TREE を返し、探索しない', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.cache = el('g', {}, g3);
    el('rect', { x: PX, y: 120, width: 250, height: 110, rx: 10, fill: C.bsoft }, S.cache);
    T(S.cache, PX + 16, 150, 'キャッシュ', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    T(S.cache, PX + 16, 184, '¬ac：NO_TREE', { 'font-size': 16, fill: C.ink });
    T(S.cache, PX + 16, 212, '（そのときの上界 0）', { 'font-size': 15, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 280, '', C.ink, [['同じか厳しい上界で', 15, C.muted], ['また来たら、すぐ返す', 15, C.muted], null, ['保存しないと、深さ 4 で', 15, C.muted], ['証明できたのは 12 個', 15, C.muted]]);
    TZ.note(g3, '論文本文の例（アイテム集合 ¬ac）の模式図');

    // ===== scene 4: instances solved to optimality (depth 4, 10 min, 24 datasets) =====
    var g4 = S.g[3];
    T(g4, 70, 70, '最適性を証明できたデータの数（24 個中、深さ 4、10 分）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [
      { label: 'BinOCT（MIP）', a: 1 }, { label: 'DL8', a: 7 }, { label: 'CP による方法', a: 11 },
      { label: 'DL8.5（保存なし）', a: 12 }, { label: 'DL8.5', b: 19 }
    ];
    S.bars4 = TZ.pairs(g4, { x0: 230, x1: 590, v0: 0, v1: 24, y0: 104, rowH: 62, rows: rows, t0: 24.6, dt: 0.6, ticks: [0, 6, 12, 18, 24] });
    S.p4 = TZ.panel(g4, PX, 120, 'CP4IM の二値のデータ', C.ink, [['葉の最小データ数 1', 15, C.muted], ['訓練とテストに分けず、', 15, C.muted], ['計算の性能だけを比べる', 15, C.muted], null, ['深さ 2 の連続値のデータでも', 15, C.muted], ['DL8.5 が BinOCT を上回った', 15, C.muted]]);
    TZ.note(g4, '論文の本文（Results）の数値から作図');

    // ===== scene 5: takeaway + title card =====
    TZ.title(S.g[4], {
      cards: [['深さ 4 で最適性を証明', '24 個中 19 個（BinOCT は 1 個）'], ['論文の例で調べる節点', '27 個 → 17 個']],
      venue: 'AAAI 2020', title: ['Learning Optimal Decision Trees Using', 'Caching Branch-and-Bound Search'], tsize: 30,
      sub: 'キャッシュつきの分枝限定法による最適な決定木の学習', authors: ['Gaël Aglin, Siegfried Nijssen, Pierre Schaus'], url: 'doi.org/10.1609/aaai.v34i04.5711'
    });
    return S;
  }

  function paint(L, n, col, v) {
    L.nodes[n].setAttribute('fill', H.mix('#FFFFFF', col, v));
    L.nodes[n].setAttribute('stroke', v > 0.5 ? col : C.gray);
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    // scene 1
    var k1 = 0;
    S.order1.forEach(function (n, i) {
      var v = seg(t, 1.2 + i * 0.15, 1.4 + i * 0.15); paint(S.L1, n, C.a, v); if (v > 0.5) k1++;
    });
    S.L1.edges.forEach(function (e) {
      var on = e.c !== 'abc' && S.L1.nodes[e.c].getAttribute('stroke') === C.a;
      e.l.setAttribute('stroke', on ? H.mix('#FFFFFF', C.a, 0.55) : C.hair);
    });
    S.cnt1.querySelector('text').textContent = '調べた節点 ' + k1 + ' 個';
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2
    var k2 = 0;
    VISITED.forEach(function (n, i) {
      var v = seg(t, 9.0 + i * 0.22, 9.2 + i * 0.22); paint(S.L2, n, C.b, v); if (v > 0.5) k2++;
    });
    S.L2.edges.forEach(function (e) {
      var on = S.L2.nodes[e.c].getAttribute('stroke') === C.b && S.L2.nodes[e.p].getAttribute('stroke') === C.b;
      e.l.setAttribute('stroke', on ? H.mix('#FFFFFF', C.b, 0.55) : C.hair);
    });
    S.cnt2.querySelector('text').textContent = '調べた節点 ' + k2 + ' 個（DL8.5）';
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    // scene 3
    S.e1.setAttribute('opacity', seg(t, 16.8, 17.3));
    S.l1.setAttribute('opacity', seg(t, 16.8, 17.3));
    S.l1b.setAttribute('opacity', seg(t, 17.8, 18.3));
    S.cache.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.nx.setAttribute('fill', H.mix('#FFFFFF', C.bsoft, seg(t, 17.8, 18.3)));
    S.e2.setAttribute('opacity', seg(t, 19.8, 20.3));
    S.l2.setAttribute('opacity', seg(t, 19.8, 20.3));
    S.l2b.setAttribute('opacity', seg(t, 20.6, 21.1));
    S.p3.setAttribute('opacity', seg(t, 21.2, 21.8));
    TZ.renderBars(S.bars4, t);
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
