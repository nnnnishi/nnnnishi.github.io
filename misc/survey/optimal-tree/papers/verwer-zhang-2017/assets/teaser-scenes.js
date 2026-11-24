// =====================================================================
// teaser-scenes.js — Verwer & Zhang, Learning decision trees with flexible constraints and objectives using
// integer optimization (CPAIOR 2017), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic (labelled 模式図). Scene 2 uses Table 1 (Iris, first five rows, SepLen / SepWid).
// Scene 3 follows Fig. 1 (path d = (0, 1, 1) to leaf 5 in a depth-3 tree). Scene 4 uses Table 3 (Diabetes).
// Scene 5 uses the numbers in "Discrimination-aware DTIP" and "Imbalanced DTIP".
// Colours: orange = CART (greedy, starting trees); blue = DTIP / DTIPs.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">CART</span> は各ノードで、そこに届いたデータだけを見て局所的に最良の分岐を選ぶ。', en: '' },
    { ja: '<span class="B">DTIP</span> はまず各特徴量の値を順位の整数に置き換え、しきい値を整数変数で表せるようにする。', en: '' },
    { ja: '各行の経路は深さごとの 0-1 変数で表すので、深さ 3 の木なら 1 行に 3 個で済む。', en: '' },
    { ja: 'Diabetes では、初期解なしで解くと深い木で CART に負けたが、<span class="A">CART</span> の木から始めた DTIPs はどの深さでも上回った。', en: '' },
    { ja: '差別をなくす制約や偽陽性を減らす目的も、式を 1 本足すだけで加えられる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }

  // heap-numbered depth-3 tree: nodes 1..7, leaves 1..8 under nodes 4..7
  function treeXY(cx, top, w, dy) {
    var P = {};
    P.node = {}; P.leaf = {};
    for (var j = 1; j <= 7; j++) {
      var d = Math.floor(Math.log2(j)), idx = j - Math.pow(2, d), n = Math.pow(2, d);
      P.node[j] = [cx - w / 2 + w * (idx + 0.5) / n, top + d * dy];
    }
    for (var l = 1; l <= 8; l++) P.leaf[l] = [cx - w / 2 + w * (l - 0.5) / 8, top + 3 * dy];
    return P;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: CART grows node by node =====
    var g1 = S.g[0];
    var T1 = treeXY(330, 120, 420, 95);
    S.n1 = [];
    var order = [1, 2, 3, 4, 5, 6, 7];
    order.forEach(function (j, i) {
      var g = el('g', {}, g1), p = T1.node[j];
      if (j > 1) { var q = T1.node[Math.floor(j / 2)]; el('line', { x1: q[0], y1: q[1], x2: p[0], y2: p[1], stroke: C.a, 'stroke-width': 2.5 }, g); }
      el('circle', { cx: p[0], cy: p[1], r: 18, fill: '#fff', stroke: C.a, 'stroke-width': 2.5 }, g);
      S.n1.push({ g: g, t0: 1.0 + i * 0.7 });
    });
    S.focus = el('circle', { cx: 0, cy: 0, r: 28, fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g1);
    S.T1 = T1;
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'CART（貪欲法）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 196, 'ノードごとに、届いたデータ', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, 'だけで最良の分岐を選ぶ', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, '計算は速いが、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 300, '最適から遠いことがある', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Table 1 transform =====
    var g2 = S.g[1];
    var BEF = [[5.1, 3.5], [4.9, 3.0], [4.7, 3.2], [4.6, 3.1], [5.0, 3.6]];
    var AFT = [[-9, 5], [-11, 0], [-11, 2], [-11, 1], [-10, 6]];
    t2(g2, 170, 130, '変換前', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 470, 130, '変換後', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    [['SepLen', 120], ['SepWid', 220], ['SepLen', 420], ['SepWid', 520]].forEach(function (h) {
      el('text', { x: h[1], y: 164, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = h[0];
    });
    S.rows2 = BEF.map(function (b, r) {
      var y = 204 + r * 44, g = el('g', {}, g2);
      el('text', { x: 120, y: y, 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = b[0].toFixed(1);
      el('text', { x: 220, y: y, 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = b[1].toFixed(1);
      var a = el('g', {}, g2);
      el('text', { x: 420, y: y, 'font-size': 18, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' }, a).textContent = String(AFT[r][0]).replace('-', '−');
      el('text', { x: 520, y: y, 'font-size': 18, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' }, a).textContent = AFT[r][1];
      el('line', { x1: 260, x2: 375, y1: y - 6, y2: y - 6, stroke: C.gray, 'stroke-width': 1.5 }, a);
      return { g: g, a: a, t0: 9.6 + r * 0.35 };
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 170, '順位を保って整数に', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 214, '4.9, 4.7, 4.6 は setosa に', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 238, 'しか出ないので −11 にまとめる', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 278, '最も多い 3.0 は 0 にする', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 330, 'しきい値を整数変数にでき、', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 354, 'big-M も小さくなる', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 1（Iris の先頭 5 行）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: path variables (Fig. 1) =====
    var g3 = S.g[2];
    var T3 = treeXY(330, 100, 460, 100);
    var path = [[1, 3], [3, 6], [6, 'L5']];
    S.e3 = {};
    for (var j = 2; j <= 7; j++) {
      var p = T3.node[j], q = T3.node[Math.floor(j / 2)];
      S.e3[j] = el('line', { x1: q[0], y1: q[1], x2: p[0], y2: p[1], stroke: C.gray, 'stroke-width': 2.5 }, g3);
    }
    for (var l = 1; l <= 8; l++) {
      var pl = T3.leaf[l], par = T3.node[4 + Math.floor((l - 1) / 2)];
      S.e3['L' + l] = el('line', { x1: par[0], y1: par[1], x2: pl[0], y2: pl[1], stroke: C.gray, 'stroke-width': 2.5 }, g3);
    }
    for (j = 1; j <= 7; j++) {
      el('circle', { cx: T3.node[j][0], cy: T3.node[j][1], r: 17, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3);
      el('text', { x: T3.node[j][0], y: T3.node[j][1] + 5, 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }, g3).textContent = j;
    }
    S.leaf3 = [];
    for (l = 1; l <= 8; l++) {
      var r3 = el('rect', { x: T3.leaf[l][0] - 18, y: T3.leaf[l][1] - 14, width: 36, height: 28, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      el('text', { x: T3.leaf[l][0], y: T3.leaf[l][1] + 5, 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' }, g3).textContent = l;
      S.leaf3.push(r3);
    }
    S.dl = [
      t2(g3, 120, 155, m('d') + sub('1,r') + ' = 0（右）', '', { 'font-size': 16, fill: C.b }),
      t2(g3, 120, 255, m('d') + sub('2,r') + ' = 1（左）', '', { 'font-size': 16, fill: C.b }),
      t2(g3, 120, 355, m('d') + sub('3,r') + ' = 1（左）', '', { 'font-size': 16, fill: C.b })
    ];
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 140, '行 ' + m('r') + ' の経路', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 186, 'ノード 3 → 6 → 葉 5', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 240, '葉ごとの変数なら 8 個', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 270, '深さごとなら 3 個', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 324, '通らない枝の制約は', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 348, 'big-M で自動的に満たされる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '論文 Fig. 1 の経路', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    S.path = path;

    // ===== scene 4: Table 3, Diabetes =====
    var g4 = S.g[3];
    var AX = 110, AY = 440, AH = 300, LO = 0.72, HI = 0.86;
    function yv(v) { return AY - AH * (v - LO) / (HI - LO); }
    [0.72, 0.76, 0.80, 0.84].forEach(function (v) {
      el('line', { x1: AX, x2: 600, y1: yv(v), y2: yv(v), stroke: v === LO ? C.ink : C.hair, 'stroke-width': v === LO ? 1.5 : 1 }, g4);
      el('text', { x: AX - 10, y: yv(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toFixed(2);
    });
    var T = [[0.7357, 0.75, 0.75], [0.7721, 0.7773, 0.7773], [0.776, 0.7969, 0.7943], [0.7930, 0.7852, 0.8255], [0.8372, 0.7852, 0.8503]];
    var COL = [C.a, C.b, C.b], OP = [1, 0.45, 1];
    S.bars4 = [];
    T.forEach(function (row, d) {
      var gx = AX + 22 + d * 96;
      t2(g4, gx + 34, AY + 28, '深さ ' + (d + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      row.forEach(function (v, k) {
        var r = el('rect', { x: gx + k * 24, y: AY, width: 20, height: 0, fill: COL[k], 'fill-opacity': OP[k] }, g4);
        S.bars4.push({ r: r, top: yv(v), t0: 25 + d * 0.7 + k * 0.18 });
      });
    });
    t2(g4, AX, 116, 'Diabetes（768 行）の学習データでの精度', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    [['CART', C.a, 1], ['DTIP（初期解なし）', C.b, 0.45], ['DTIPs（CART から開始）', C.b, 1]].forEach(function (L, i) {
      el('rect', { x: PX, y: 150 + i * 34, width: 18, height: 18, fill: L[1], 'fill-opacity': L[2] }, p4);
      t2(p4, PX + 28, 165 + i * 34, L[0], '', { 'font-size': 16, fill: C.ink });
    });
    t2(p4, PX, 290, '深さ 5：', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 318, 'CART 0.8372', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(p4, PX, 346, 'DTIPs 0.8503', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 396, '時間制限は 1 問 30 分', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 3 の数値から作図（縦軸は 0.72 から）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: flexibility + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '差別をなくす制約（深さ 3）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '差別 0.05 → 0、精度 0.85', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '偽陽性を数える目的', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '偽陽性 0、偽陰性 101', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CPAIOR 2017';
    el('text', { x: 480, y: 222, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Decision Trees with Flexible Constraints';
    el('text', { x: 480, y: 260, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'and Objectives Using Integer Optimization';
    t2(g5, 480, 302, '整数最適化による、制約と目的を柔軟に変えられる決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Sicco Verwer, Yingqian Zhang';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/978-3-319-59776-8_8';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: nodes appear one at a time; a dashed ring marks the node being decided
    var cur = 0;
    S.n1.forEach(function (n, i) { n.g.setAttribute('opacity', seg(t, n.t0, n.t0 + 0.3)); if (t >= n.t0) cur = i; });
    var fp = S.T1.node[cur + 1];
    S.focus.setAttribute('cx', fp[0]); S.focus.setAttribute('cy', fp[1]);
    S.focus.setAttribute('opacity', seg(t, 1.0, 1.3) * (1 - seg(t, 6.4, 6.8)));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2
    S.rows2.forEach(function (r) { r.g.setAttribute('opacity', seg(t, 8.6, 9.2)); r.a.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    // scene 3: highlight the path step by step
    var steps = [[3, 17.4], [6, 18.6], ['L5', 19.8]];
    steps.forEach(function (s) { S.e3[s[0]].setAttribute('stroke', t >= s[1] ? C.b : C.gray); S.e3[s[0]].setAttribute('stroke-width', t >= s[1] ? 5 : 2.5); });
    S.dl.forEach(function (d, i) { d.setAttribute('opacity', seg(t, steps[i][1], steps[i][1] + 0.4)); });
    S.leaf3.forEach(function (r, i) { r.setAttribute('fill', i === 4 && t >= 19.8 ? C.bsoft : '#fff'); r.setAttribute('stroke', i === 4 && t >= 19.8 ? C.b : C.ink); });
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.r.setAttribute('y', 440 - (440 - b.top) * s);
      b.r.setAttribute('height', (440 - b.top) * s);
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
