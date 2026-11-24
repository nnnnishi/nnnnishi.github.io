// =====================================================================
// teaser-scenes.js — Demirović, Hebrard, Jean, Blossom (ICML 2023, PMLR 202), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 2 restates the
// complexities of Sections 2-3. Scene 4 uses the depth-10 row of Table 3 (average error over 58 data sets).
// Colours: orange = depth-first DP order; blue = Blossom.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '動的計画法は<span class="A">一方の部分木を最適にし終えるまで</span>もう一方に進まず、その間は完全な木が 1 本もない。', en: '' },
    { ja: '最初の木が出るまでの時間は、動的計画法では深さとともに急に増えるが、Blossom では線形で済む。', en: '' },
    { ja: '<span class="B">Blossom</span> はつぼみを先に伸ばして木を完成させ、そのあとで枝ごとに別の特徴量を試して誤分類を減らす。', en: '' },
    { ja: '深さ 10 では最初の木が CART 並みで、10 秒後、1 分後と誤分類が減って、MurTree より少なかった。', en: '' },
    { ja: '探索空間は動的計画法と同じまま、順番を変えるだけで、いつ止めても使える木が手元に残る。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // a depth-2 tree skeleton: root + two children + four leaves
  function tree(g, cx, top, col) {
    var S = {};
    var X1 = [cx - 120, cx + 120], X2 = [cx - 180, cx - 60, cx + 60, cx + 180];
    S.e1 = X1.map(function (x) { return el('line', { x1: cx, y1: top + 22, x2: x, y2: top + 108, stroke: C.ink, 'stroke-width': 1.6 }, g); });
    S.e2 = X2.map(function (x, i) { return el('line', { x1: X1[i >> 1], y1: top + 132, x2: x, y2: top + 218, stroke: C.ink, 'stroke-width': 1.6 }, g); });
    el('circle', { cx: cx, cy: top, r: 24, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
    txt(g, cx, top + 7, m('a'), { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    S.n1 = X1.map(function (x) {
      var r = el('rect', { x: x - 34, y: top + 102, width: 68, height: 40, rx: 8, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      var t = el('text', { x: x, y: top + 129, 'font-size': 19, fill: C.ink, 'text-anchor': 'middle', class: 'mi' }, g);
      return { r: r, t: t };
    });
    S.n2 = X2.map(function (x) {
      return el('rect', { x: x - 26, y: top + 216, width: 52, height: 30, rx: 6, fill: C.panel, stroke: C.hair, 'stroke-width': 1.5 }, g);
    });
    return S;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: DP order =====
    var g1 = S.g[0];
    S.t1 = tree(g1, 330, 120, C.a);
    S.c1 = txt(g1, 330, 440, '', { 'font-size': 19, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.c1t = S.c1.querySelector('text');
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '動的計画法の順番', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '左の部分木で特徴量を', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, 'すべて試し終えてから', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, '右の部分木に進む。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, 'DL8・DL8.5・MurTree', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, 'がこの順で探索する。', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: time to the first complete tree =====
    var g2 = S.g[1];
    txt(g2, 80, 130, '最初の完全な木が出るまでの時間', { 'font-size': 19, 'font-weight': 650, fill: C.ink });
    S.r2a = el('g', {}, g2);
    el('rect', { x: 80, y: 170, width: 520, height: 100, rx: 12, fill: '#FCEBDF' }, S.r2a);
    txt(S.r2a, 104, 208, '動的計画法', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    txt(S.r2a, 104, 250, 'Θ((' + m('n') + ' + 2' + '<tspan dy="-8" font-size="13">' + m('k') + '</tspan><tspan dy="8">)</tspan> ' + m('P') + '(' + m('m') + ' − 1, ' + m('k') + ' − 1))', { 'font-size': 22, fill: C.ink });
    S.r2b = el('g', {}, g2);
    el('rect', { x: 80, y: 300, width: 520, height: 100, rx: 12, fill: C.bsoft }, S.r2b);
    txt(S.r2b, 104, 338, 'Blossom', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    txt(S.r2b, 104, 380, 'Θ(' + m('n') + m('k') + ')　（線形時間）', { 'font-size': 22, fill: C.ink });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 170, m('n') + '：データ点の数', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 198, m('m') + '：特徴量の数', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 226, m('k') + '：深さの上限', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 282, m('P') + '(' + m('m') + ', ' + m('k') + ') = ' + m('m') + '! / (' + m('m') + ' − ' + m('k') + ')!', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 326, '全体の計算量は', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 350, 'どちらも同じ', { 'font-size': 15, fill: C.muted });
    txt(g2, 940, 520, '論文の第 2 節と第 3 節の計算量', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: Blossom =====
    var g3 = S.g[2];
    S.t3 = tree(g3, 330, 120, C.b);
    S.c3 = txt(g3, 330, 440, '', { 'font-size': 19, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.c3t = S.c3.querySelector('text');
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, 'Blossom の順番', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① つぼみを先に伸ばす', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, 'ジニ不純度の小さい順', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 木が完成したら', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '最後の枝に戻る', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 288, '③ 未試行の特徴量で', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 312, '別の木を作る', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 366, '兄弟の部分木の誤分類が', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 390, '最良値を超えたら打ち切る', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（誤分類の数は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3, depth 10 =====
    var g4 = S.g[3];
    var X0 = 260, X1 = 620, LO = 350, HI = 460;
    var X = function (v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); };
    [360, 380, 400, 420, 440, 460].forEach(function (v) {
      el('line', { x1: X(v), x2: X(v), y1: 110, y2: 420, stroke: C.hair, 'stroke-width': 1 }, g4);
      el('text', { x: X(v), y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v;
    });
    txt(g4, 70, 80, '深さ 10、平均の誤分類数（58 データ、小さいほど良い）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [
      ['CART', '', 412, C.muted],
      ['Blossom', '最初の木', 407, C.b], ['', '10 秒後', 382, C.b], ['', '1 分後', 374, C.b],
      ['MurTree（前処理つき）', '10 秒後', 448, C.a], ['', '1 分後', 441, C.a]
    ];
    S.r4 = rows.map(function (r, i) {
      var y = 140 + i * 52, g = el('g', {}, g4);
      if (r[0]) txt(g, X0 - 16, y - 4, r[0], { 'font-size': 15, 'font-weight': 600, fill: r[3] === C.muted ? C.ink : r[3], 'text-anchor': 'end' });
      txt(g, X0 - 16, y + (r[0] ? 16 : 6), r[1], { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      el('circle', { cx: X(r[2]), cy: y, r: 9, fill: r[3] }, g);
      el('text', { x: X(r[2]) + 16, y: y + 6, 'font-size': 16, 'font-weight': 650, fill: r[3] }, g).textContent = r[2];
      return { g: g, t0: 24.6 + i * 0.5 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 150, 'MurTree の最初の解', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p4, PX, 176, '（2,101）は完全な木', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 200, 'ではないので省いた', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 256, 'Blossom の最初の木は', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(S.p4, PX, 282, 'CART とほぼ同じで、', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 306, 'わずかに良い', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の表 3 の数値から作図（横軸は 350 から）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 74, '同じ探索空間、違う順番', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 98, '最初の木は線形時間', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 660, 74, 'キャッシュなし', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 660, 98, '空間 Θ(2' + '<tspan dy="-8" font-size="12">' + m('k') + '</tspan><tspan dy="8"> ' + m('m') + ')</tspan>', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2023';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Blossom: an Anytime Algorithm for';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Computing Optimal Decision Trees';
    txt(g5, 480, 304, '最適決定木を求める、いつ止めても木を返せるアルゴリズム', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Emir Demirović, Emmanuel Hebrard, Louis Jean';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v202/demirovic23a.html';
    txt(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function showLeaves(T, k, col) { T.n2.forEach(function (r, i) { var on = k[i]; r.setAttribute('fill', on ? (col === C.b ? C.bsoft : '#FCEBDF') : C.panel); r.setAttribute('stroke', on ? col : C.hair); }); }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: left child cycles b, c, d, e; right child stays untouched
    var feats = ['b', 'c', 'd', 'e'], i1 = Math.min(3, Math.max(0, Math.floor((t - 1.2) / 1.4)));
    S.t1.n1[0].t.textContent = t < 1.2 ? '' : feats[i1];
    S.t1.n1[1].t.textContent = '';
    S.t1.n1[1].r.setAttribute('stroke-dasharray', '5 5'); S.t1.n1[1].r.setAttribute('stroke', C.hair);
    S.t1.e1[1].setAttribute('stroke', C.hair); S.t1.e2[2].setAttribute('opacity', 0); S.t1.e2[3].setAttribute('opacity', 0);
    S.t1.n2[2].setAttribute('opacity', 0); S.t1.n2[3].setAttribute('opacity', 0);
    showLeaves(S.t1, [t >= 1.2, t >= 1.2, false, false], C.a);
    S.c1t.textContent = '完成した木：0 本（右の部分木は未着手）';
    S.c1.setAttribute('opacity', seg(t, 2.0, 2.6));
    S.p1.setAttribute('opacity', seg(t, 2.4, 3.2));
    // scene 2
    S.r2a.setAttribute('opacity', seg(t, 9.0, 9.6));
    S.r2b.setAttribute('opacity', seg(t, 10.4, 11.0));
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.0));
    // scene 3: whole tree grows at once, then branches swap features and the error drops
    var grow = seg(t, 16.6, 17.4);
    S.t3.e1.forEach(function (e) { e.setAttribute('opacity', grow); });
    S.t3.n1.forEach(function (n) { n.r.setAttribute('opacity', grow); n.t.setAttribute('opacity', grow); });
    var leaf = seg(t, 17.4, 18.0);
    S.t3.e2.forEach(function (e) { e.setAttribute('opacity', leaf); });
    S.t3.n2.forEach(function (r) { r.setAttribute('opacity', leaf); });
    showLeaves(S.t3, [true, true, true, true], C.b);
    var steps = [[18.4, 'b', 'b', 52], [19.6, 'b', 'c', 47], [20.8, 'c', 'c', 44], [22.0, 'd', 'c', 41]];
    var cur = steps[0];
    steps.forEach(function (s) { if (t >= s[0]) cur = s; });
    S.t3.n1[0].t.textContent = cur[1]; S.t3.n1[1].t.textContent = cur[2];
    S.c3t.textContent = '手元の最良の木：誤分類 ' + cur[3];
    S.c3.setAttribute('opacity', seg(t, 18.2, 18.6));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.r4.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
