// =====================================================================
// teaser-scenes.js — Verhaeghe, Nijssen, Pesant, Quimper, Schaus, Learning optimal decision trees
// using constraint programming (Constraints 2020; authors' manuscript), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図). Scenes 2 and 4 use
// the counts in Table 4 of the paper (80 instances, time-out 10 min, N_min = 1).
// Colours: orange = BinOCT / DL8 (the earlier exact methods); blue = the CP approach.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '深さを決めて誤分類の数を最小にする木を厳密に求める方法は、これまで<span class="A">MIP（BinOCT）や DL8</span> の上に作られてきた。', en: '' },
    { ja: '制限時間 10 分では、80 問のうち <span class="A">BinOCT</span> は 67 問、<span class="A">DL8</span> は 31 問で時間切れになった。', en: '' },
    { ja: '<span class="B">CP の方法</span>は左右の部分木を別々に解き、解いた部分木はキャッシュで使い回し、上界で枝を刈る。', en: '' },
    { ja: '最適性を証明できたのは <span class="B">68 問</span>で、DL8 の 49 問、BinOCT の 13 問より多かった。', en: '' },
    { ja: '論文の 80 問では、探索の分解とキャッシュを組み込んだ制約プログラミングが、既存の厳密解法より多くの問題で最適な木を求めた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan baseline-shift="sub" font-size="12">' + s + '</tspan>'; }
  function box(g, x, y, w, h, stroke) {
    return el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 7, fill: '#fff', stroke: stroke || C.ink, 'stroke-width': 1.8 }, g);
  }
  function txt(g, x, y, s, a) {
    var e = el('text', { x: x, y: y, 'font-size': (a && a.size) || 17, 'text-anchor': 'middle', fill: (a && a.fill) || C.ink, 'font-weight': (a && a.w) || 400 }, g);
    e.innerHTML = s; return e;
  }
  function line(g, x1, y1, x2, y2, dash) {
    return el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C.ink, 'stroke-width': 1.8, 'stroke-dasharray': dash ? '4 4' : 'none' }, g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: depth-2 tree, features unknown, minimise misclassifications =====
    var g1 = S.g[0];
    var N1 = [[330, 130], [210, 250], [450, 250]];
    var L1 = [[150, 380], [270, 380], [390, 380], [510, 380]];
    line(g1, 330, 148, 210, 232); line(g1, 330, 148, 450, 232, true);
    line(g1, 210, 268, 150, 358); line(g1, 210, 268, 270, 358, true);
    line(g1, 450, 268, 390, 358); line(g1, 450, 268, 510, 358, true);
    S.q1 = N1.map(function (p) { box(g1, p[0], p[1], 92, 36); return txt(g1, p[0], p[1] + 6, '?', { size: 18, w: 600 }); });
    var leafV = [['4', '1'], ['0', '6'], ['5', '2'], ['1', '3']];
    S.leaf1 = L1.map(function (p, k) {
      var g = el('g', {}, g1);
      el('circle', { cx: p[0], cy: p[1] + 4, r: 26, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      txt(g, p[0], p[1] + 10, leafV[k][0] + ' / ' + leafV[k][1], { size: 15 });
      return g;
    });
    S.err1 = t2(g1, 330, 456, '葉ごとに少ないほうのクラスが誤分類：1 + 0 + 2 + 1 = 4', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(g1, 230, 80, '実線：特徴が 1　点線：0', '', { 'font-size': 14, fill: C.muted });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '深さを決めた最適な木', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 176, '各分岐の特徴を選び、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 204, '訓練データの誤分類の', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 232, '数を最小にする。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 300, 'これまでの厳密解法', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 330, 'BinOCT（MIP、CPLEX）', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 356, 'DL8（アイテム集合と', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX + 14, 380, '動的計画法）', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（葉の数はクラス 1 / クラス 0 のデータ数）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: time-outs out of 80 instances (Table 4, N_min = 1) =====
    var g2 = S.g[1];
    function grid(g, x0, y0, nOn, col) {
      var cells = [];
      for (var i = 0; i < 80; i++) {
        var cx = x0 + (i % 10) * 22, cy = y0 + Math.floor(i / 10) * 22;
        cells.push({ r: el('rect', { x: cx, y: cy, width: 18, height: 18, rx: 3, fill: C.panel }, g), on: i < nOn, i: i });
      }
      return cells;
    }
    t2(g2, 175, 110, 'BinOCT', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    t2(g2, 455, 110, 'DL8', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.grid2 = grid(g2, 66, 136, 67).concat(grid(g2, 346, 136, 31));
    S.num2 = [t2(g2, 175, 380, '67 / 80', '', { 'font-size': 34, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' }),
              t2(g2, 455, 380, '31 / 80', '', { 'font-size': 34, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' })];
    t2(g2, 310, 424, '塗った数が時間切れの問題（並びは問題の順ではない）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '10 分で時間切れ', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 176, '24 のデータ × 深さ 2〜5', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 204, 'の 80 問、' + m('N') + sub('min') + ' = 1。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 262, 'BinOCT は深さ 3 の 23 問', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 286, 'すべてで時間切れになり、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 310, '最適性を証明できたのは', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 334, '13 問だけだった。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 4 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: AND/OR search, bound, cache =====
    var g3 = S.g[2];
    line(g3, 300, 118, 190, 196); line(g3, 300, 118, 410, 196, true);
    box(g3, 300, 100, 120, 36, C.b); txt(g3, 300, 106, m('d') + '[0] = ' + m('f') + sub('2'), { size: 17, fill: C.b, w: 600 });
    S.tri3 = [[190, 196], [410, 196]].map(function (p) {
      return el('path', { d: 'M' + p[0] + ',' + p[1] + ' l-80,140 h160 z', fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g3);
    });
    S.lab3L = t2(g3, 190, 300, '左を解く', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.res3L = t2(g3, 190, 370, '最小の誤分類 3', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.lab3R = t2(g3, 410, 300, '右を解く', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.res3R = t2(g3, 410, 370, '上界 7 − 3 = 4 未満を探す', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.ub3 = t2(g3, 300, 50, 'それまでの最良の木：誤分類 7', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var cache = S.cache3 = el('g', {}, g3);
    el('rect', { x: 70, y: 410, width: 480, height: 78, rx: 12, fill: C.bsoft }, cache);
    t2(cache, 90, 440, m('f') + sub('2') + ' = 1 → ' + m('f') + sub('3') + ' = 1 と ' + m('f') + sub('3') + ' = 1 → ' + m('f') + sub('2') + ' = 1 は', '', { 'font-size': 16, fill: C.ink });
    t2(cache, 90, 474, '同じデータが届くので、保存した部分木を再利用', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, 'CP の方法', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 156, '① CoverSizeSR で', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 180, '葉に届くデータを数える', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 222, '② AND/OR 探索', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 246, '左右の部分木を別々に解く', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 288, '③ キャッシュ', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 312, '同じ経路の部分木を使い回す', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 354, '④ 上界による刈り込み', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 378, '良くならない枝は解かない', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（誤分類の数は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: proven optimal, Table 4 (N_min = 1) =====
    var g4 = S.g[3];
    var X0 = 200, PER = 5;   // pixels per instance (80 -> 400)
    [0, 20, 40, 60, 80].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 110, y2: 360, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      el('text', { x: X0 + v * PER, y: 386, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    t2(g4, 70, 90, '10 分以内に最適性を証明できた問題（80 問中）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [['DL8', 49, 160, C.a], ['BinOCT', 13, 236, C.a], ['CP の方法', 68, 312, C.b]];
    S.bars4 = bars.map(function (b, i) {
      t2(g4, X0 - 14, b[2] + 6, b[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: b[2] - 20, width: 0, height: 40, fill: b[3] }, g4);
      var lab = t2(g4, X0 + b[1] * PER + 10, b[2] + 7, String(b[1]), '', { 'font-size': 19, 'font-weight': 700, fill: b[3] });
      return { rect: rect, lab: lab, w: b[1] * PER, t0: 24.8 + i * 0.8 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, m('N') + sub('min') + ' = 1 の結果', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 170, '最良の解を見つけた問題', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 196, 'CP 80、DL8 49、BinOCT 21', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 246, m('N') + sub('min') + ' = 5 の証明数', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 272, 'CP 65、DL8 54', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 326, '小さなデータでは', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 350, 'DL8 のほうが速い', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '最適性の証明（80 問中）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '68 問（DL8 49、BinOCT 13）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '探索の工夫', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'AND/OR・キャッシュ・上界', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CONSTRAINTS · 2020';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal Decision Trees';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'using Constraint Programming';
    t2(g5, 480, 304, '制約プログラミングによる最適な決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Hélène Verhaeghe, Siegfried Nijssen, Gilles Pesant, Claude-Guy Quimper, Pierre Schaus';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/s10601-020-09312-3';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: the solver tries features in the unknown boxes; leaves then show counts
    var feats = ['?', m('f') + sub('1'), m('f') + sub('2'), m('f') + sub('3'), m('f') + sub('4')];
    var tick = Math.floor(t * 3);
    S.q1.forEach(function (q, k) {
      var on = t > 1.5 && t < 5.5;
      q.innerHTML = on ? feats[1 + (tick + k * 2) % 4] : (t >= 5.5 ? feats[[2, 3, 1][k]] : '?');
      q.setAttribute('fill', t >= 5.5 ? C.a : C.ink);
    });
    S.leaf1.forEach(function (g, k) { g.setAttribute('opacity', seg(t, 5.6 + k * 0.2, 6.0 + k * 0.2)); });
    S.err1.setAttribute('opacity', seg(t, 6.4, 6.9));
    S.p1.setAttribute('opacity', seg(t, 1.0, 1.8));
    // scene 2: cells fill in order
    S.grid2.forEach(function (c) {
      var t0 = 9.0 + c.i * 0.03;
      c.r.setAttribute('fill', c.on ? H.mix('#EEF0F3', C.a, seg(t, t0, t0 + 0.3)) : C.panel);
    });
    S.num2.forEach(function (n) { n.setAttribute('opacity', seg(t, 11.8, 12.4)); });
    S.p2.setAttribute('opacity', seg(t, 12.4, 13.2));
    // scene 3: left subtree, then right subtree with the bound, then the cache note
    S.ub3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.lab3L.setAttribute('opacity', seg(t, 17.0, 17.4));
    S.tri3[0].setAttribute('fill', H.mix('#FFFFFF', '#E7EEFC', seg(t, 17.2, 18.4)));
    S.tri3[0].setAttribute('stroke', t > 17.8 ? C.b : C.ink);
    S.res3L.setAttribute('opacity', seg(t, 18.4, 18.9));
    S.lab3R.setAttribute('opacity', seg(t, 19.2, 19.6));
    S.tri3[1].setAttribute('fill', H.mix('#FFFFFF', '#E7EEFC', seg(t, 19.4, 20.6)));
    S.tri3[1].setAttribute('stroke', t > 20.0 ? C.b : C.ink);
    S.res3R.setAttribute('opacity', seg(t, 20.2, 20.7));
    S.cache3.setAttribute('opacity', seg(t, 21.3, 22.0));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
