// =====================================================================
// teaser-scenes.js — Narodytska, Ignatiev, Pereira, Marques-Silva, Learning Optimal Decision Trees with SAT
// (IJCAI 2018), unofficial explainer. Player: teaser-engine.js.
// Scene 1 and the tree shapes in scene 3 are schematics (labelled 模式図); the N = 5 tree in scene 3 is the
// paper's own example (Table 1 / Fig. 1). Scene 2 uses Table 3 (Cancer), scene 4 uses Table 4.
// Colours: orange = ITI trees and the earlier SAT encoding DT2; blue = the proposed encoding DT1.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">貪欲法</span>は分岐を 1 つずつ決めるので、できた木がノード数の最小な木とは限らない。', en: '' },
    { ja: '先行研究の SAT の符号化は木の形を固定したうえで解くもので、CNF も大きく、小さな例しか解けなかった。', en: '' },
    { ja: '<span class="B">提案する符号化</span>は木の形と特徴量を変数にし、ノード数を 2 ずつ減らして解なしになるまで SAT ソルバーを呼ぶ。', en: '' },
    { ja: '小さなベンチマークでは 5 つすべてで最小の木を求めて最適性を証明し、Mux6 では ITI の 35 ノードが 15 ノードになった。', en: '' },
    { ja: 'SAT で最小の決定木を求める方法を、ほどほどの大きさの公開データで最適性を証明できるところまで広げた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5">\u200b</tspan>'; }
  function txt(g, x, y, s, a) {
    var e = el('text', Object.assign({ x: x, y: y, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, a || {}), g);
    e.textContent = s; return e;
  }
  // nodes: [x, y, leaf?, label]; edges: [from, to, branchLabel]
  function tree(g, nodes, edges, col, R) {
    var out = { nodes: [], edges: [] };
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      var ln = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.ink, 'stroke-width': 1.5 }, g);
      out.edges.push(ln);
      if (e[2] !== undefined) txt(g, (a[0] + b[0]) / 2 + (b[0] < a[0] ? -12 : 12), (a[1] + b[1]) / 2 - 2, e[2], { 'font-size': 14, fill: C.muted });
    });
    nodes.forEach(function (n) {
      var gg = el('g', {}, g);
      if (n[2]) el('rect', { x: n[0] - R * 0.85, y: n[1] - R * 0.75, width: R * 1.7, height: R * 1.5, rx: 5, fill: n[4] || '#fff', stroke: C.ink, 'stroke-width': 1.5 }, gg);
      else el('circle', { cx: n[0], cy: n[1], r: R, fill: '#fff', stroke: col, 'stroke-width': 2 }, gg);
      if (n[3]) txt(gg, n[0], n[1] + 6, n[3], { 'font-size': 16, fill: n[4] ? '#fff' : C.ink, 'font-weight': n[4] ? 650 : 400 });
      out.nodes.push(gg);
    });
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: greedy tree grows node by node =====
    var g1 = S.g[0];
    var N1 = [[320, 110, 0, '?'], [210, 200, 0, '?'], [430, 200, 0, '?'], [150, 290, 1, ''], [270, 290, 1, ''],
              [380, 290, 1, ''], [480, 290, 0, '?'], [430, 380, 1, ''], [530, 380, 1, '']];
    var E1 = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [6, 7], [6, 8]];
    var T1 = tree(g1, N1, E1, C.a, 24);
    var order1 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    S.t1 = order1.map(function (k, i) { return { n: T1.nodes[k], e: k > 0 ? T1.edges[k - 1] : null, t0: 1.2 + i * 0.45 }; });
    S.cnt1 = t2(g1, 320, 460, '', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' }).querySelector('text');
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 140, '貪欲法（ITI など）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 188, 'その場で良さそうな分岐を', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 216, '1 つずつ決めて木を育てる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 272, 'もっと小さな木があっても', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 296, '見つけられる保証はない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: prior SAT encoding fixes the tree shape; CNF size (Table 3, Cancer) =====
    var g2 = S.g[1];
    var N2 = [[200, 130, 0, ''], [140, 210, 0, ''], [260, 210, 0, ''], [110, 290, 1, ''], [170, 290, 1, ''], [230, 290, 1, ''], [290, 290, 1, '']];
    var T2 = tree(g2, N2, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], C.gray, 20);
    el('rect', { x: 80, y: 95, width: 240, height: 225, rx: 14, fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '7 6' }, g2);
    t2(g2, 200, 350, '木の形を先に固定する', '', { 'font-size': 16, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
    t2(g2, 480, 120, 'Cancer の CNF の大きさ', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    S.big2 = t2(g2, 480, 200, '92G', '', { 'font-size': 64, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    t2(S.big2, 480, 236, '先行研究（DT2）', '', { 'font-size': 16, fill: C.a, 'text-anchor': 'middle' });
    S.small2 = t2(g2, 480, 320, '5.2M', '', { 'font-size': 40, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    t2(S.small2, 480, 350, '提案（DT1、木の形も探す）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 140, 'Bessiere ら（2009）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 188, 'SAT の定式化は小さな例', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 216, 'でしか解けなかった。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 272, '大きさ ' + m('O') + '(' + m('KN') + '² ' + m('M') + '² + …)', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 296, '提案は ' + m('O') + '(' + m('KN') + '² + ' + m('MNK') + ')', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '数値は論文 Table 3（単位は論文に記載なし）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: linear search on N with the proposed encoding =====
    var g3 = S.g[2];
    var NS = [9, 7, 5, 3], CX = [150, 260, 370, 480];
    S.chips = NS.map(function (n, k) {
      var g = el('g', {}, g3);
      var r = el('rect', { x: CX[k] - 48, y: 70, width: 96, height: 40, rx: 20, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      var tx = el('text', { x: CX[k], y: 96, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g);
      tx.innerHTML = m('N') + ' = ' + n;
      var res = txt(g, CX[k], 136, n === 3 ? '解なし' : '解あり', { 'font-size': 15, fill: n === 3 ? C.a : C.b, 'font-weight': 600 });
      return { g: g, r: r, tx: tx, res: res, t0: 16.6 + k * 1.5 };
    });
    var Y0 = 190;
    S.trees3 = [];
    S.trees3.push(tree(el('g', {}, g3), [[315, Y0, 0, ''], [235, Y0 + 70, 0, ''], [395, Y0 + 70, 0, ''], [195, Y0 + 140, 1, ''], [275, Y0 + 140, 1, ''], [355, Y0 + 140, 1, ''], [435, Y0 + 140, 0, ''], [400, Y0 + 210, 1, ''], [470, Y0 + 210, 1, '']],
      [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [6, 7], [6, 8]], C.b, 20));
    S.trees3.push(tree(el('g', {}, g3), [[315, Y0, 0, ''], [235, Y0 + 80, 0, ''], [395, Y0 + 80, 1, ''], [195, Y0 + 160, 0, ''], [275, Y0 + 160, 1, ''], [160, Y0 + 230, 1, ''], [230, Y0 + 230, 1, '']],
      [[0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [3, 6]], C.b, 20));
    S.trees3.push(tree(el('g', {}, g3), [[300, Y0 + 10, 0, 'L?'], [230, Y0 + 100, 1, '0'], [370, Y0 + 100, 0, 'C?'], [310, Y0 + 190, 1, '0'], [430, Y0 + 190, 1, '1', C.b]],
      [[0, 1, '1'], [0, 2, '0'], [2, 3, '1'], [2, 4, '0']], C.b, 24));
    var g3x = el('g', {}, g3);
    tree(g3x, [[315, Y0 + 30, 0, '?'], [255, Y0 + 120, 1, ''], [375, Y0 + 120, 1, '']], [[0, 1], [0, 2]], C.a, 24);
    txt(g3x, 315, Y0 + 210, '1 つの特徴量では 8 例を分けられない', { 'font-size': 15, fill: C.a });
    S.trees3.push({ g: g3x });
    S.trees3.forEach(function (T, k) { T.g = T.g || T.nodes[0].parentNode; });
    S.note5 = txt(g3, 300, Y0 + 270, '論文の例（8 例、特徴量 4 つ）を誤りなく分ける 5 ノードの木', { 'font-size': 15, fill: C.muted });
    S.final3 = t2(g3, 315, 470, '最小のノード数は 3 + 2 = 5', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '提案する符号化（DT1）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 156, '① 木の形を変数にする', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 180, '葉か ' + m('v') + sub('i') + '、子 ' + m('l') + sub('ij') + ', ' + m('r') + sub('ij'), '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 222, '② 特徴量と判別を変数にする', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 246, m('a') + sub('rj') + '、' + m('d') + sub('rj') + '：どの葉でも', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX + 22, 272, '逆のクラスの例は判別済み', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 310, '③ ' + m('N') + ' を 2 ずつ減らす', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 334, '解なしになったら最小は ' + m('N') + ' + 2', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（N = 5 の木は論文の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 4, ITI size vs minimum size =====
    var g4 = S.g[3];
    var X0 = 190, PER = 11;   // px per node
    var rows = [['Mouse', 15, 15, '12.94'], ['Weather', 13, 9, '0.05'], ['Irish', 7, 7, '0.10'], ['Corral', 13, 13, '0.001'], ['Mux6', 35, 15, '0.11']];
    [0, 10, 20, 30].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 80, y2: 440, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      txt(g4, X0 + v * PER, 464, String(v), { 'font-size': 15, fill: C.muted });
    });
    txt(g4, X0 + 17 * PER, 492, 'ノード数', { 'font-size': 15, fill: C.muted });
    S.bars4 = [];
    rows.forEach(function (r, i) {
      var y = 100 + i * 70;
      txt(g4, X0 - 14, y + 22, r[0], { 'font-size': 16, 'text-anchor': 'end' });
      var a = el('rect', { x: X0, y: y, width: 0, height: 22, fill: C.a }, g4);
      var b = el('rect', { x: X0, y: y + 26, width: 0, height: 22, fill: C.b }, g4);
      var la = txt(g4, X0 + r[1] * PER + 8, y + 17, String(r[1]), { 'font-size': 15, fill: C.a, 'text-anchor': 'start', 'font-weight': 600 });
      var lb = txt(g4, X0 + r[2] * PER + 8, y + 43, String(r[2]), { 'font-size': 15, fill: C.b, 'text-anchor': 'start', 'font-weight': 600 });
      S.bars4.push({ a: a, b: b, la: la, lb: lb, wa: r[1] * PER, wb: r[2] * PER, t0: 24.6 + i * 0.6 });
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 104, width: 18, height: 14, fill: C.a }, p4);
    t2(p4, PX + 28, 117, 'ITI の木（上界）', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 134, width: 18, height: 14, fill: C.b }, p4);
    t2(p4, PX + 28, 147, '最小の木（証明つき）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 206, '最適性の証明までの時間', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 232, 'どれも 13 秒未満', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 290, 'Mouse は先行研究で', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 314, '577.27 秒、提案で 12.94 秒', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 338, '（計算機は別）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '特徴量を選んだ 16 データ', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'すべてで最小の木を証明', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '例を抜き出した実験', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'ITI の木より最大 30% 小さい', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 182, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IJCAI 2018';
    el('text', { x: 480, y: 238, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Decision Trees with SAT';
    t2(g5, 480, 284, 'SAT による最適な決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nina Narodytska, Alexey Ignatiev, Filipe Pereira, Joao Marques-Silva';
    el('text', { x: 480, y: 396, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.24963/ijcai.2018/189';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var n1 = 0;
    S.t1.forEach(function (u) {
      var o = seg(t, u.t0, u.t0 + 0.35);
      u.n.setAttribute('opacity', o);
      if (u.e) u.e.setAttribute('opacity', o);
      if (t >= u.t0 + 0.2) n1++;
    });
    S.cnt1.textContent = n1 ? n1 + ' ノード' : '';
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    // scene 2
    S.big2.setAttribute('opacity', seg(t, 9.6, 10.2));
    S.small2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 10.4, 11.2));
    // scene 3: one N at a time
    var cur = -1;
    S.chips.forEach(function (c, k) {
      var on = t >= c.t0;
      if (on) cur = k;
      c.res.setAttribute('opacity', seg(t, c.t0 + 0.5, c.t0 + 0.8));
    });
    S.chips.forEach(function (c, k) {
      var active = k === cur, bad = k === 3;
      c.r.setAttribute('fill', active ? (bad ? '#FCEBDF' : C.bsoft) : '#fff');
      c.r.setAttribute('stroke', active ? (bad ? C.a : C.b) : C.hair);
    });
    S.trees3.forEach(function (T, k) {
      var show = k === cur ? 1 : 0;
      if (k === 2 && cur === 3) show = 0;
      T.g.setAttribute('opacity', show);
    });
    S.note5.setAttribute('opacity', cur === 2 ? 1 : 0);
    S.final3.setAttribute('opacity', seg(t, 22.0, 22.5));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.a.setAttribute('width', b.wa * s);
      b.b.setAttribute('width', b.wb * s);
      b.la.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
      b.lb.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
