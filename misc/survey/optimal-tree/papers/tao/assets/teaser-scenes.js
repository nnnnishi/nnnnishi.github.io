// =====================================================================
// teaser-scenes.js — Carreira-Perpiñán & Tavallali, Alternating Optimization of Decision Trees, with
// Application to Learning Sparse Oblique Trees (NeurIPS 2018), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses the MNIST numbers printed in Section 4 of the
// paper (depth-12 oblique CART tree -> TAO; the C = 0.01 tree). Colours: orange = CART; blue = TAO.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">CART</span> は不純度を指標に 1 ノードずつ分岐を決め、決めた分岐をあとから変えない。', en: '' },
    { ja: '互いに子孫でないノードは別々の点を受け取るので、木全体の誤分類率はノードごとの和に分かれる。', en: '' },
    { ja: '<span class="B">TAO</span> は同じ深さのノードをまとめ、葉から根へ向かって誤分類率を下げることを繰り返す。', en: '' },
    { ja: 'MNIST では斜めの CART の木のテスト誤分類率が 11.03% から 5.66% に下がり、内部ノードも減った。', en: '' },
    { ja: 'MNIST では L1 罰則を強めると、各ノードが少数の画素だけを見る、小さく解釈しやすい斜めの木が得られた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }

  // a complete binary tree of depth 3 (15 nodes) used in scenes 1-3
  var NODES = [];
  (function () {
    var xs = [[330], [200, 460], [130, 270, 390, 530], [95, 165, 235, 305, 355, 425, 495, 565]], ys = [110, 210, 310, 410];
    xs.forEach(function (row, d) { row.forEach(function (x, k) { NODES.push({ x: x, y: ys[d], d: d, k: k, p: d ? NODES.length - row.length + 0 : -1 }); }); });
    // parent index: node (d, k) -> (d-1, floor(k/2))
    var start = [0, 1, 3, 7];
    NODES.forEach(function (n) { n.p = n.d ? start[n.d - 1] + Math.floor(n.k / 2) : -1; });
  })();
  function drawTree(g, leafSquare) {
    var out = [];
    NODES.forEach(function (n) {
      if (n.p >= 0) el('line', { x1: NODES[n.p].x, y1: NODES[n.p].y, x2: n.x, y2: n.y, stroke: C.gray, 'stroke-width': 2.2 }, g);
    });
    NODES.forEach(function (n) {
      var s = n.d === 3 && leafSquare
        ? el('rect', { x: n.x - 15, y: n.y - 15, width: 30, height: 30, rx: 5, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g)
        : el('circle', { cx: n.x, cy: n.y, r: 18, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      out.push(s);
    });
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: CART grows one node at a time =====
    var g1 = S.g[0];
    S.n1 = [];
    var lines1 = el('g', {}, g1);
    NODES.slice(0, 7).forEach(function (n, i) {
      var ln = el('g', {}, lines1), g = el('g', {}, g1);
      if (n.p >= 0) el('line', { x1: NODES[n.p].x, y1: NODES[n.p].y, x2: n.x, y2: n.y, stroke: C.gray, 'stroke-width': 2.2 }, ln);
      var c = el('circle', { cx: n.x, cy: n.y, r: 20, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      S.n1.push({ g: g, ln: ln, c: c, t0: 1.0 + i * 0.7 });
    });
    S.imp1 = t2(g1, 330, 64, '各ノードで不純度（Gini など）を最小にする分岐を選ぶ', '', { 'font-size': 16, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'CART', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '木を貪欲に育てて刈り込む。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '決めたノードは二度と', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 254, '変えない。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '斜めの分岐は重みを 1 つずつ', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 334, '動かす座標降下法で決めるが、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 358, '悪い局所解にとどまりやすい。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: separability =====
    var g2 = S.g[1];
    S.sh2 = drawTree(g2, true);
    S.br2 = [];
    [3, 4, 5, 6].forEach(function (idx, k) {
      var n = NODES[idx];
      var b = el('g', {}, g2);
      el('rect', { x: n.x - 58, y: n.y + 120, width: 116, height: 30, rx: 8, fill: C.bsoft }, b);
      t2(b, n.x, n.y + 141, m('L') + '<tspan dy="5" font-size="12">' + (idx + 1) + '</tspan><tspan dy="-5">(</tspan>' + m('θ') + '<tspan dy="5" font-size="12">' + (idx + 1) + '</tspan><tspan dy="-5">)</tspan>', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
      S.br2.push({ g: b, t0: 10.0 + k * 0.4 });
    });
    S.sum2 = t2(g2, 330, 492, m('L') + '(Θ) = ' + m('L') + '<tspan dy="5" font-size="12">4</tspan><tspan dy="-5"> + </tspan>' + m('L') + '<tspan dy="5" font-size="12">5</tspan><tspan dy="-5"> + </tspan>' + m('L') + '<tspan dy="5" font-size="12">6</tspan><tspan dy="-5"> + </tspan>' + m('L') + '<tspan dy="5" font-size="12">7</tspan><tspan dy="-5"> + 定数</tspan>', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '分離可能性（定理 3.1）', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 198, '各点は根から葉まで', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '1 本の経路だけをたどる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 282, '互いに子孫でないノードは', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 306, '重ならない点の集合を受け取り、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 330, '独立に最適化できる。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: TAO sweeps depth levels bottom -> top =====
    var g3 = S.g[2];
    S.sh3 = drawTree(g3, true);
    S.lev3 = t2(g3, 60, 64, '', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, 'TAO', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 174, '同じ深さのノードをまとめ、', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 202, '葉から根へ 1 段ずつ', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 230, '最適化して繰り返す。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 284, '葉：多数決', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 310, '内部ノード：care 点の', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 334, '二値分類（斜めなら SVM）', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 386, '点が届かない枝は', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 410, '収束後に取り除く', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: MNIST numbers (Section 4) =====
    var g4 = S.g[3];
    var labs = [['CART', '（初期値）'], ['TAO', '（最大の C）'], ['TAO', 'C = 0.01']];
    var cols = [C.a, C.b, C.b];
    function panel(x0, title, vals, vmax, unit, fmt) {
      var Y0 = 420, Hh = 270, W = 64, gap = 30;
      t2(g4, x0, 90, title, '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      el('line', { x1: x0, x2: x0 + 3 * W + 3 * gap, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      return vals.map(function (v, k) {
        var x = x0 + 10 + k * (W + gap);
        var r = el('rect', { x: x, y: Y0, width: W, height: 0, fill: cols[k], opacity: k === 2 ? 0.55 : 1 }, g4);
        var l = txt(g4, x + W / 2, Y0 - Hh * v / vmax - 10, fmt(v) + unit, { 'font-size': 16, 'font-weight': 650, fill: cols[k], 'text-anchor': 'middle' });
        t2(g4, x + W / 2, Y0 + 26, labs[k][0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
        t2(g4, x + W / 2, Y0 + 46, labs[k][1].replace('C', m('C')), '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
        return { r: r, l: l, h: Hh * v / vmax, t0: 25.0 + k * 0.8 };
      });
    }
    S.b4 = panel(70, 'テスト誤分類率', [11.03, 5.66, 10.19], 12, '%', function (v) { return v.toFixed(2); })
      .concat(panel(370, '内部ノードの数', [410, 230, 16], 440, '', function (v) { return String(v); }));
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'MNIST、深さ 12', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 158, '斜めの CART の木から開始', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 206, '学習誤分類率', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 232, '1.95% → 0.09%', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 284, m('C') + ' = 0.01 の木：', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 310, '葉 17 個、非ゼロの重み 0.22%', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 362, '最良のテスト誤分類率は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 386, 'およそ 5%', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文の本文（第 4 節）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '誤分類率そのものを', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '深さごとに交互に下げる', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, 'L1 罰則で', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'まばらな斜めの木', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'NeurIPS 2018', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g5, 480, 220, 'Alternating Optimization of Decision Trees,', { 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 258, 'with Application to Learning Sparse Oblique Trees', { 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 300, '決定木の交互最適化と、まばらな斜めの分岐の木の学習への応用', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 350, 'Miguel Á. Carreira-Perpiñán, Pooya Tavallali', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 404, 'papers.nips.cc (NeurIPS 2018)', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.n1.forEach(function (n) {
      n.g.setAttribute('opacity', seg(t, n.t0, n.t0 + 0.4));
      n.ln.setAttribute('opacity', seg(t, n.t0, n.t0 + 0.4));
      n.c.setAttribute('fill', H.mix('#FFFFFF', '#FCEBDF', seg(t, n.t0 + 0.4, n.t0 + 0.8)));
    });
    S.imp1.setAttribute('opacity', seg(t, 1.6, 2.2));
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    // scene 2: the four depth-2 nodes light up with their own loss terms
    var on2 = seg(t, 9.4, 10.0);
    NODES.forEach(function (n, i) {
      S.sh2[i].setAttribute('fill', n.d === 2 ? H.mix('#FFFFFF', C.b, on2) : '#fff');
      S.sh2[i].setAttribute('stroke', n.d === 2 && on2 > 0.5 ? C.b : C.ink);
    });
    S.br2.forEach(function (b) { b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.4)); });
    S.sum2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 10.4, 11.2));
    // scene 3: sweep depth 3 -> 0, twice
    var u = t - 16.6, lvl = -1, pass = 1;
    if (u >= 0 && u < 6.4) { pass = u < 3.2 ? 1 : 2; lvl = 3 - Math.floor((u % 3.2) / 0.8); }
    NODES.forEach(function (n, i) {
      var hit = n.d === lvl;
      S.sh3[i].setAttribute('fill', hit ? C.b : '#fff');
      S.sh3[i].setAttribute('stroke', hit ? C.b : C.ink);
    });
    var names = ['根', '深さ 1', '深さ 2', '葉（深さ 3）'];
    S.lev3.querySelectorAll('text')[0].textContent = lvl >= 0 ? '反復 ' + pass + '：' + names[lvl] + 'のノードをまとめて最適化' : '';
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.b4.forEach(function (b, k) {
      var e = seg(t, b.t0 + (k >= 3 ? 1.2 : 0), b.t0 + (k >= 3 ? 1.2 : 0) + 0.8);
      b.r.setAttribute('height', b.h * e); b.r.setAttribute('y', 420 - b.h * e);
      b.l.setAttribute('opacity', seg(t, b.t0 + 0.6 + (k >= 3 ? 1.2 : 0), b.t0 + 1.0 + (k >= 3 ? 1.2 : 0)));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
