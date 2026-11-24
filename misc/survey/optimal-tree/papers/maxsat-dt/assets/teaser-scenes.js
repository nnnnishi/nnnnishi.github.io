// =====================================================================
// teaser-scenes.js — Hu, Siala, Hebrard, Huguet, Learning Optimal Decision Trees with MaxSAT and its
// Integration in AdaBoost (IJCAI 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy examples (labelled 模式図). Scene 4 marks which of
// the 45 (dataset, depth) settings of Table 1 have DT(max) test accuracy bold or starred (within 3
// points of the best); scene 5 quotes Section 4.2 and Table 2.
// Colours: orange = the SAT formulation (every example classified, hard clauses); blue = MaxSAT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'SAT の方法は訓練データの<span class="A">全例を正しく分類できる</span>まで木を大きくし、その最小の木を返す。', en: '' },
    { ja: '雑音の例が 1 つでもあれば、それを正しく分けるためだけの分岐が増え、テストでの精度が落ちうる。', en: '' },
    { ja: '<span class="B">MaxSAT</span> は例ごとの分類を柔らかい節にし、大きさを決めた木で正しく分類する例の数を最大にする。', en: '' },
    { ja: '深さ 2〜4 では、<span class="B">MaxSAT の木</span>のテスト精度は 45 の設定のうち 42 で最良から 3 ポイント以内だった。', en: '' },
    { ja: '節の重みを AdaBoost の例の重みにすれば、同じ定式化でブースティングもできる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;   // right-hand explanation column

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }
  function txt(g, x, y, s, a) {
    var o = { x: x, y: y, 'font-size': 16, fill: C.ink };
    for (var k in a) o[k] = a[k];
    var e = el('text', o, g); e.innerHTML = s; return e;
  }

  // toy tree: node positions; internal nodes grow as the size goes 3 -> 5 -> 7
  var NODES = [[300, 110], [200, 190], [400, 190], [330, 270], [470, 270], [410, 350], [530, 350]];
  var EDGES = [[0, 1], [0, 2], [2, 3], [2, 4], [4, 5], [4, 6]];
  var LEAFLAB = ['', '−', '+', '−', '+', '+', '−'];
  // toy examples: class labels; example 5 (index 4) is the noisy one
  var EX = ['+', '−', '+', '−', '−', '+', '−', '+'];
  var EXX = function (k) { return 130 + k * 58; };
  var EXY = 450;

  // draws a tree of size 3, 5 or 7; returns handles of nodes and edges
  function tree(g, size, stroke, fill) {
    var S = { e: [], n: [] };
    var internal = size === 3 ? [0] : size === 5 ? [0, 2] : [0, 2, 4];
    var used = size === 3 ? [0, 1, 2] : size === 5 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
    EDGES.forEach(function (ed) {
      if (used.indexOf(ed[1]) < 0) return;
      S.e.push(el('line', { x1: NODES[ed[0]][0], y1: NODES[ed[0]][1], x2: NODES[ed[1]][0], y2: NODES[ed[1]][1], stroke: C.muted, 'stroke-width': 2 }, g));
    });
    used.forEach(function (i) {
      var x = NODES[i][0], y = NODES[i][1], n = el('g', {}, g);
      if (internal.indexOf(i) >= 0) {
        el('circle', { cx: x, cy: y, r: 22, fill: '#fff', stroke: stroke, 'stroke-width': 2.2 }, n);
        txt(n, x, y + 6, m('f') + sub(String(internal.indexOf(i) + 1)), { 'text-anchor': 'middle', 'font-size': 17 });
      } else {
        el('rect', { x: x - 20, y: y - 18, width: 40, height: 36, rx: 6, fill: fill, stroke: stroke, 'stroke-width': 1.8 }, n);
        var lab = size === 3 ? (i === 1 ? '−' : '+') : size === 5 ? (i === 1 ? '−' : i === 3 ? '−' : '+') : LEAFLAB[i];
        txt(n, x, y + 7, lab, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 650 });
      }
      S.n[i] = n;
    });
    return S;
  }

  function chips(g, k5style) {
    var out = [];
    EX.forEach(function (c, k) {
      var x = EXX(k), cg = el('g', {}, g);
      var r = el('rect', { x: x - 20, y: EXY - 20, width: 40, height: 40, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, cg);
      if (k === 4 && k5style) { r.setAttribute('stroke-dasharray', '4 3'); }
      txt(cg, x, EXY + 7, c, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 650 });
      txt(cg, x, EXY + 42, String(k + 1), { 'text-anchor': 'middle', 'font-size': 14, fill: C.muted });
      out.push({ g: cg, r: r, x: x });
    });
    t2(g, 70, EXY + 7, '例', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: SAT grows N until every example is classified =====
    var g1 = S.g[0];
    S.t1 = [3, 5, 7].map(function (n) { var g = el('g', {}, g1); tree(g, n, C.a, '#fff'); return g; });
    chips(g1, false);
    S.st1 = [
      t2(g1, 70, 70, m('N') + ' = 3：解なし（全例は分けられない）', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 }),
      t2(g1, 70, 70, m('N') + ' = 5：解なし', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 }),
      t2(g1, 70, 70, m('N') + ' = 7：充足（8 例すべてを正しく分類）', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 })
    ];
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'SAT（Narodytska ら）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '「大きさ ' + m('N') + ' の木で', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '全例を正しく分類できるか」', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 254, 'を ' + m('N') + ' を増やしながら解く。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '全例の分類が硬い節なので、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 334, '1 例でも外れれば解なし。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 525, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: the extra branch exists only for the noisy example =====
    var g2 = S.g[1];
    S.hl2 = el('rect', { x: 365, y: 238, width: 200, height: 140, rx: 14, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g2);
    tree(g2, 7, C.a, '#fff');
    var ch2 = chips(g2, true);
    S.ch2 = ch2[4];
    S.link2 = el('path', { d: 'M' + ch2[4].x + ',' + (EXY - 22) + ' C' + ch2[4].x + ',405 530,405 530,370', fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g2);
    S.lab2 = t2(g2, 70, 70, '例 5 は雑音（ラベルの誤り）とする', '', { 'font-size': 17, fill: C.ink, 'font-weight': 600 });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '過学習', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 198, '網かけの分岐は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '例 5 を正しく分けるため', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 254, 'だけにある。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 310, '訓練精度は 100% でも、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 334, '新しいデータでは外れやすい。', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 382, '矛盾する例があれば', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 406, 'どの大きさでも解がない。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 525, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: MaxSAT with soft clauses b_q =====
    var g3 = S.g[2];
    tree(g3, 3, C.b, C.bsoft);
    var ch3 = chips(g3, true);
    S.marks3 = ch3.map(function (c, k) {
      var g = el('g', {}, g3);
      var ok = k !== 4;
      el('circle', { cx: c.x, cy: EXY - 38, r: 12, fill: ok ? C.b : '#fff', stroke: ok ? C.b : C.muted, 'stroke-width': 1.6 }, g);
      txt(g, c.x, EXY - 33, ok ? '✓' : '×', { 'text-anchor': 'middle', 'font-size': 15, fill: ok ? '#fff' : C.muted, 'font-weight': 700 });
      return { g: g, t0: 18.4 + k * 0.4 };
    });
    S.count3 = t2(g3, 70, 70, '', '', { 'font-size': 17, fill: C.b, 'font-weight': 650 });
    S.count3t = S.count3.querySelector('text');
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, 'MaxSAT（この論文）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 166, '硬い節', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 16, 190, '木の構造と割り当て', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX + 16, 214, m('b') + sub('q') + ' → 例 ' + m('q') + ' を正しく分類', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 256, '柔らかい節', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p3, PX + 16, 280, m('b') + sub('1') + ', …, ' + m('b') + sub('M') + '（例ごとに 1 つ）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 322, '満たす柔らかい節の数', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 346, '＝ 正しく分類した例の数', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 370, 'を最大にする', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, 940, 525, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1, DT(max) test accuracy within 3 points of the best =====
    var g4 = S.g[3];
    var X0 = 160, DX = 28, Y0 = 150, DY = 52, CW = 23;
    var MISS = { '5,3': 1, '12,3': 1, '12,4': 1 };   // heart-cleveland d=3, splice-1 d=3 and d=4
    S.cells4 = [];
    [2, 3, 4].forEach(function (d, r) {
      t2(g4, X0 - 18, Y0 + r * DY + 6, '深さ ' + d, '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      for (var k = 0; k < 15; k++) {
        var miss = !!MISS[k + ',' + d];
        var rect = el('rect', { x: X0 + k * DX, y: Y0 + r * DY - CW / 2, width: CW, height: CW, rx: 4, fill: C.panel, stroke: 'none', 'stroke-width': 2 }, g4);
        S.cells4.push({ rect: rect, miss: miss, t0: 25.0 + (k * 3 + r) * 0.07 });
      }
    });
    t2(g4, X0, Y0 - 40, '15 個のデータ（論文の表1の順）', '', { 'font-size': 15, fill: C.muted });
    S.ann4 = el('g', {}, g4);
    t2(S.ann4, X0, 330, '■ 最良から 3 ポイント以内', '', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    t2(S.ann4, X0, 362, '□ それより離れた設定', '', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    t2(S.ann4, X0 + 24, 390, 'heart-cleveland（深さ 3）、splice-1（深さ 3、4）', '', { 'font-size': 15, fill: C.muted });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'DT(max) のテスト精度', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 196, '42 / 45', '', { 'font-size': 46, 'font-weight': 700, fill: C.b });
    t2(p4, PX, 236, '比較：DT(exact)、CART、DL8.5', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 296, '最適性を示せたのは', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 320, '主に深さ 2（制限 15 分）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 370, '深さ 5 では DL8.5 が', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 394, '6 データでメモリ不足（50GB）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 525, '論文の表1と第 4.2 節から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    var tk = el('g', {}, g5);
    el('rect', { x: 130, y: 46, width: 330, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 295, 74, '深さ 2〜4、15 データ × 3', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 295, 98, '42 / 45 で最良から 3 pt 以内', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 500, y: 46, width: 330, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 665, 74, 'AdaBoost（tic-tac-toe、深さ 3）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 665, 98, 'テスト精度 74.61% → 94.69%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IJCAI 2020';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Decision Trees with MaxSAT';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'and its Integration in AdaBoost';
    t2(g5, 480, 304, 'MaxSAT による最適決定木の学習と、その AdaBoost への組み込み', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Hao Hu, Mohamed Siala, Emmanuel Hebrard, Marie-José Huguet';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.24963/ijcai.2020/163';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: N = 3, 5, 7 in turn
    var w = [seg(t, 1.0, 1.4) * (1 - seg(t, 3.0, 3.3)), seg(t, 3.1, 3.4) * (1 - seg(t, 5.0, 5.3)), seg(t, 5.1, 5.4)];
    S.t1.forEach(function (g, i) { g.setAttribute('opacity', w[i]); });
    S.st1.forEach(function (g, i) { g.setAttribute('opacity', w[i]); });
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2: highlight the branch and the noisy example
    S.hl2.setAttribute('opacity', seg(t, 9.6, 10.2));
    S.link2.setAttribute('opacity', seg(t, 10.2, 10.8));
    S.ch2.r.setAttribute('stroke', H.mix(C.ink, C.a, seg(t, 9.0, 9.6)));
    S.ch2.r.setAttribute('fill', H.mix('#FFFFFF', '#FCEBDF', seg(t, 9.0, 9.6)));
    S.lab2.setAttribute('opacity', seg(t, 8.8, 9.4));
    S.p2.setAttribute('opacity', seg(t, 10.6, 11.4));
    // scene 3: soft clauses are checked one by one; example 5 is given up
    var n = 0;
    S.marks3.forEach(function (mk, k) {
      mk.g.setAttribute('opacity', seg(t, mk.t0, mk.t0 + 0.3));
      if (k !== 4 && t >= mk.t0 + 0.15) n++;
    });
    S.count3t.textContent = t < 18.4 ? '' : '大きさ 3 の木：満たした柔らかい節 ' + n + ' / 8';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: cells fill in table order
    S.cells4.forEach(function (c) {
      var s = seg(t, c.t0, c.t0 + 0.3);
      if (c.miss) {
        c.rect.setAttribute('fill', H.mix(C.panel, '#FFFFFF', s));
        c.rect.setAttribute('stroke', s > 0.5 ? C.a : 'none');
      } else {
        c.rect.setAttribute('fill', H.mix(C.panel, C.b, s));
      }
    });
    S.ann4.setAttribute('opacity', seg(t, 28.4, 29.0));
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
