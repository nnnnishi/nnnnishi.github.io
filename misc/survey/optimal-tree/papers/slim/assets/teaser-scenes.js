// =====================================================================
// teaser-scenes.js — Schidler & Szeider, SAT-based Decision Tree Learning for Large Data Sets
// (AAAI 2021; authors' copy TU Wien AC-TR-21-003), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 redraw the tree shapes of the paper's Fig. 3 (labelled 模式図). Scene 2 is a schematic of
// the 2^d growth of the complete-tree encoding. Scene 4 uses the averages in Tables 1 and 2 (d300, c300).
// Colours: orange = the heuristic tree and the subtree T' cut from it; blue = DT-SLIM (T'', T*).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">貪欲法</span>は大きなデータでも速く木を作れるが、深さが最小の木になるとは限らない。', en: '' },
    { ja: '深さが最小の木を SAT で厳密に求める方法は、深さとともに符号化が大きくなり、小さなデータにしか使えない。', en: '' },
    { ja: '<span class="B">DT-SLIM</span> は部分木を切り出して SAT で浅い部分木に置き換え、元の木の残りをつなぎ直す。', en: '' },
    { ja: '37 個のデータで、Weka の木の平均の深さは 22.63 から 13.45 に、ITI の木では 10.75 から 8.35 に減った。', en: '' },
    { ja: '厳密な方法を木の一部にだけ繰り返し使うことで、SAT による決定木の学習を大きなデータに広げた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- trees of the paper's Fig. 3 ----
  // node: [flags, left, right]; flags: h = in T' (or T''), s = special leaf (square)
  function N(f, l, r) { return { f: f || '', c: l ? [l, r] : null }; }
  function L(f) { return N(f); }
  function tl() { return N('', N('', L(), L()), L()); }           // T_{l3}: depth 2
  function t2l() { return N('', L(), L()); }                      // T_{l2}: depth 1
  function special(sub) { sub.f = 's'; return sub; }
  function treeT() {
    var sq2 = special(t2l()), sq3 = special(tl());
    var r = N('h', sq2, N('h', L('h'), N('h', L('h'), sq3)));
    return N('', N('', L(), r), N('', L(), N('', L(), L())));
  }
  function treeTstar() {
    var r = N('h', N('h', special(tl()), L('h')), N('h', special(tl()), special(t2l())));
    return N('', N('', L(), r), N('', L(), N('', L(), L())));
  }
  function layout(root, x0, dx, y0, dy) {
    var k = 0, nodes = [], edges = [], maxd = 0;
    (function walk(n, d, inH) {
      n.d = d; maxd = Math.max(maxd, d);
      n.inH = inH;
      if (n.c) {
        var childH = n.f.indexOf('h') >= 0;
        walk(n.c[0], d + 1, childH); walk(n.c[1], d + 1, childH);
        n.x = (n.c[0].x + n.c[1].x) / 2;
      } else { n.x = x0 + (k++) * dx; }
      n.y = y0 + d * dy;
      nodes.push(n);
      if (n.c) n.c.forEach(function (ch) { edges.push([n, ch]); });
    })(root, 0, false);
    return { nodes: nodes, edges: edges, depth: maxd };
  }
  function drawTree(g, lay, hiColor) {
    var hi = [], lo = [];
    lay.edges.forEach(function (e) {
      var h = e[0].f.indexOf('h') >= 0;
      var ln = el('line', { x1: e[0].x, y1: e[0].y, x2: e[1].x, y2: e[1].y, stroke: C.gray, 'stroke-width': 2, 'data-d': e[1].d }, g);
      (h ? hi : lo).push(ln);
    });
    var nodesHi = [], all = [];
    lay.nodes.forEach(function (n) {
      var h = n.f.indexOf('h') >= 0 || (n.inH && n.f.indexOf('s') < 0);
      var s = n.f.indexOf('s') >= 0;
      var shape = s
        ? el('rect', { x: n.x - 8, y: n.y - 8, width: 16, height: 16, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g)
        : el('circle', { cx: n.x, cy: n.y, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      all.push({ n: n, e: shape });
      if (h || s) nodesHi.push({ e: shape, s: s });
    });
    return { hi: hi, lo: lo, nodesHi: nodesHi, all: all };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: a deep heuristic tree grows level by level =====
    var g1 = S.g[0];
    var lay1 = layout(treeT(), 150, 42, 110, 50);
    S.t1 = drawTree(g1, lay1);
    S.t1.lo.concat(S.t1.hi).forEach(function (ln) { ln.setAttribute('stroke', C.a); });
    S.ruler1 = el('g', {}, g1);
    el('line', { x1: 100, y1: 110, x2: 100, y2: 110 + 7 * 50, stroke: C.a, 'stroke-width': 2 }, S.ruler1);
    el('line', { x1: 92, y1: 110, x2: 108, y2: 110, stroke: C.a, 'stroke-width': 2 }, S.ruler1);
    el('line', { x1: 92, y1: 460, x2: 108, y2: 460, stroke: C.a, 'stroke-width': 2 }, S.ruler1);
    t2(S.ruler1, 86, 290, '深さ 7', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '貪欲法（C4.5、ITI）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '分岐を上から 1 つずつ決める。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 240, '速く、大きなデータにも', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 268, '使える。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 324, '誤りなく分ける木はできるが、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 348, '深さは最小にならない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（木の形は論文 Fig. 3 の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: the complete-tree encoding grows like 2^d =====
    var g2 = S.g[1];
    var BX0 = 110, BW = 36, BASE = 440, HMAX = 300;
    el('line', { x1: BX0 - 10, y1: BASE, x2: BX0 + 12 * 42, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = [];
    for (var d = 1; d <= 12; d++) {
      var x = BX0 + (d - 1) * 42;
      var r = el('rect', { x: x, y: BASE, width: BW, height: 0, fill: C.ink }, g2);
      el('text', { x: x + BW / 2, y: BASE + 24, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = d;
      S.bars2.push({ r: r, h: Math.max(1.5, HMAX * Math.pow(2, d) / 4096), t0: 8.8 + (d - 1) * 0.42 });
    }
    t2(g2, BX0 + 6 * 42, BASE + 54, '木の深さ ' + m('d'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, BX0, 100, '深さ ' + m('d') + ' の完全二分木の葉の数 2' + '<tspan dy="-8" font-size="12" ' + MI + '>d</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.big2 = t2(g2, BX0 + 11 * 42 + BW, 128, '2<tspan dy="-12" font-size="16">12</tspan><tspan dy="12"> = 4096</tspan>', '', { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'end' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '厳密な SAT 符号化', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 198, '深さが最小の木を探す問題は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, 'NP 困難。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 278, '完全二分木を符号化すると', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 302, '節の数は ' + m('Ω') + '(2' + '<tspan dy="-7" font-size="11" ' + MI + '>d</tspan><tspan dy="7">)。</tspan>', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 354, '当時最良の Avellaneda（2020）', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 378, 'でも深さ 12 まで。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（棒の高さは 2^d に比例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: cut T', solve T'' with SAT, reattach =====
    var g3 = S.g[2];
    var layA = layout(treeT(), 150, 42, 110, 50);
    var layB = layout(treeTstar(), 120, 40, 110, 50);
    S.gA = el('g', {}, g3); S.gB = el('g', {}, g3);
    S.tA = drawTree(S.gA, layA); S.tB = drawTree(S.gB, layB);
    // highlight box around T' in T
    var hx = layA.nodes.filter(function (n) { return n.f.indexOf('h') >= 0 || n.inH; });
    var xs = hx.map(function (n) { return n.x; }), ys = hx.map(function (n) { return n.y; });
    S.box3 = el('rect', { x: Math.min.apply(null, xs) - 22, y: Math.min.apply(null, ys) - 22,
      width: Math.max.apply(null, xs) - Math.min.apply(null, xs) + 44, height: Math.max.apply(null, ys) - Math.min.apply(null, ys) + 44,
      rx: 14, fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '7 6' }, S.gA);
    S.dA = t2(S.gA, 86, 290, '深さ 7', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    S.dB = t2(S.gB, 86, 265, '深さ 6', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
    S.labA = t2(S.gA, 150, 64, '最初の木 ' + m('T') + '：部分木 ' + m('T′') + ' を切り出す', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    S.labB = t2(S.gB, 120, 64, '置き換えた木 ' + m('T') + '<tspan dy="-8" font-size="12">*</tspan><tspan dy="8">：SAT で求めた ' + m('T″') + ' をつなぐ</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, 'DT-SLIM の局所改善', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 156, '① 最も深い葉の近くで', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 180, '部分木 ' + m('T′') + ' を選ぶ', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 222, '② 下に続く部分に', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 246, '新しいクラスを付ける（□）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 288, '③ SAT で浅い ' + m('T″') + ' を求める', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 330, '④ □ の下に元の部分木を', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 354, 'つなぎ直す', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 404, '木全体は深くならない（定理 2）', '', { 'font-size': 15, fill: C.b });
    t2(g3, 940, 520, '模式図（論文 Fig. 3 の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: average depth, Tables 1 and 2 (d300, c300) =====
    var g4 = S.g[3];
    var X0 = 170, PER = 18;   // px per depth unit
    [0, 5, 10, 15, 20, 25].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 96, y2: 420, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      el('text', { x: X0 + v * PER, y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v;
    });
    t2(g4, X0 + 12.5 * PER, 478, '37 個のデータでの平均の深さ', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var rows = [['Weka', 22.63, 140, C.a, '22.63'], ['DT-SLIM', 13.45, 196, C.b, '13.45'],
                ['ITI', 10.75, 304, C.a, '10.75'], ['DT-SLIM', 8.35, 360, C.b, '8.35']];
    S.bars4 = rows.map(function (b, i) {
      el('text', { x: X0 - 14, y: b[2] + 6, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = b[0];
      var rect = el('rect', { x: X0, y: b[2] - 18, width: 0, height: 36, fill: b[3] }, g4);
      var lab = el('text', { x: X0 + b[1] * PER + 10, y: b[2] + 6, 'font-size': 17, 'font-weight': 650, fill: b[3] }, g4);
      lab.textContent = b[4];
      return { rect: rect, lab: lab, w: b[1] * PER, t0: 24.6 + i * 0.7 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 140, '37 個中 36 個で浅くなった', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 196, '平均のテスト精度', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 222, 'Weka 0.67 → 0.76', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 248, 'ITI 0.77 → 0.78', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 304, 'SAT ソルバーの制限時間', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 328, '300 秒に合わせた設定', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1、Table 2 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    var tk = el('g', {}, g5);
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 300, 74, 'australian（Weka の木）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 300, 98, '深さ 53 → 22', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 660, 74, 'objectivity（Weka の木）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 660, 98, 'テスト精度 0.55 → 0.78', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2021';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'SAT-based Decision Tree Learning';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Large Data Sets';
    t2(g5, 480, 304, '大きなデータのための、SAT にもとづく決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'André Schidler, Stefan Szeider';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v35i5.16509';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: nodes and edges appear level by level
    S.t1.all.forEach(function (o) { o.e.setAttribute('opacity', seg(t, 0.8 + o.n.d * 0.55, 1.2 + o.n.d * 0.55)); });
    S.t1.lo.concat(S.t1.hi).forEach(function (ln) {
      var d = +ln.getAttribute('data-d');
      ln.setAttribute('opacity', seg(t, 0.8 + d * 0.55, 1.2 + d * 0.55));
    });
    S.ruler1.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // scene 2: bars grow in order of depth
    S.bars2.forEach(function (b) {
      var h = b.h * H.ease(seg(t, b.t0, b.t0 + 0.5));
      b.r.setAttribute('y', 440 - h); b.r.setAttribute('height', h);
    });
    S.big2.setAttribute('opacity', seg(t, 13.6, 14.2));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: highlight T', then cross-fade to T*
    var hl = seg(t, 17.0, 17.8);
    S.tA.hi.forEach(function (ln) { ln.setAttribute('stroke', H.mix(C.gray, C.a, hl)); ln.setAttribute('stroke-width', 2 + 1.5 * hl); });
    S.tA.nodesHi.forEach(function (o) { o.e.setAttribute('fill', H.mix('#FFFFFF', o.s ? C.gray : '#FBD5BD', hl)); });
    S.box3.setAttribute('opacity', seg(t, 18.0, 18.6));
    var sw = seg(t, 20.0, 21.0);
    S.gA.setAttribute('opacity', 1 - sw);
    S.gB.setAttribute('opacity', sw);
    S.tB.hi.forEach(function (ln) { ln.setAttribute('stroke', C.b); ln.setAttribute('stroke-width', 3.5); });
    S.tB.nodesHi.forEach(function (o) { o.e.setAttribute('fill', o.s ? C.gray : '#C7D6FA'); });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
