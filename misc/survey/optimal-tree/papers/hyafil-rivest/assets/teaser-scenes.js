// =====================================================================
// teaser-scenes.js — Hyafil & Rivest, Constructing optimal binary decision trees is NP-complete
// (Information Processing Letters 1976), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic identification tree for 4 objects (labelled 模式図). Scene 3 follows Fig. 1 of the
// paper with a toy exact cover (labelled 模式図). Scene 4 uses Table 1 (f(1..8)).
// Colours: orange = cost (path lengths, f(n)); blue = 3-element tests and the exact cover.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'テストを順に当てて対象を 1 つに特定する木のコストは、根から各対象までの<span class="A">テストの回数の合計</span>である。', en: '' },
    { ja: 'コストが一定以下の木があるかを判定する問題は NP 完全で、P ≠ NP なら多項式時間では解けない。', en: '' },
    { ja: '証明では、最適な木が<span class="B">3 要素の集合による完全被覆</span>を、根からの鎖として必ず含むようにする。', en: '' },
    { ja: '最小のコスト <span class="A">f(n)</span> の漸化式から、7 要素以上では根で 3 要素のテストを選ぶのが最適になる。', en: '' },
    { ja: '最悪の回数をコストにしても同じで、当面はよいヒューリスティックが最善の策だろうと論文は結ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: identification tree for 4 objects =====
    var g1 = S.g[0];
    var N = { r: [330, 120], a: [210, 230], b: [450, 230] };
    var L = [[150, 340, 'x₁', 2], [270, 340, 'x₂', 2], [390, 340, 'x₃', 2], [510, 340, 'x₄', 2]];
    [['r', 'a'], ['r', 'b']].forEach(function (e) { el('line', { x1: N[e[0]][0], y1: N[e[0]][1], x2: N[e[1]][0], y2: N[e[1]][1], stroke: C.ink, 'stroke-width': 2 }, g1); });
    L.forEach(function (l, i) { var p = i < 2 ? N.a : N.b; el('line', { x1: p[0], y1: p[1], x2: l[0], y2: l[1], stroke: C.ink, 'stroke-width': 2 }, g1); });
    [['r', m('T') + sub('1')], ['a', m('T') + sub('2')], ['b', m('T') + sub('3')]].forEach(function (n) {
      el('ellipse', { cx: N[n[0]][0], cy: N[n[0]][1], rx: 44, ry: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
      t2(g1, N[n[0]][0], N[n[0]][1] + 6, n[1] + ' ？', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    });
    S.leaf1 = L.map(function (l) {
      el('rect', { x: l[0] - 30, y: l[1] - 18, width: 60, height: 36, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g1);
      t2(g1, l[0], l[1] + 6, m(l[2].charAt(0)) + sub(l[2].charAt(1) === '₁' ? '1' : l[2].charAt(1) === '₂' ? '2' : l[2].charAt(1) === '₃' ? '3' : '4'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return t2(g1, l[0], l[1] + 46, 'テスト ' + l[3] + ' 回', '', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
    });
    t2(g1, 120, 120, '偽なら左', '', { 'font-size': 14, fill: C.muted });
    t2(g1, 470, 120, '真なら右', '', { 'font-size': 14, fill: C.muted });
    S.cost1 = t2(g1, 330, 440, 'コスト ＝ 2 + 2 + 2 + 2 ＝ 8', '', { 'font-size': 20, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '同定の手続き', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 196, '対象 ' + m('X') + ' と、真か偽を返す', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 222, 'テスト ' + m('T') + sub('i') + ' が与えられる', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 276, 'コスト ＝ 道の長さの合計', '', { 'font-size': 16, fill: C.a });
    t2(p1, PX, 302, '（等確率なら平均回数の ' + m('n') + ' 倍）', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（4 つの対象）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: NP-complete =====
    var g2 = S.g[1];
    S.q2 = t2(g2, 330, 170, 'DT(' + m('T') + ', ' + m('X') + ', ' + m('w') + ')：コストが ' + m('w') + ' 以下の木はあるか', '', { 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' });
    S.big2 = t2(g2, 330, 290, 'NP 完全', '', { 'font-size': 72, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
    S.chain2 = el('g', {}, g2);
    [['3DM', 150], ['EC3', 330], ['DT', 510]].forEach(function (b, i) {
      el('rect', { x: b[1] - 60, y: 360, width: 120, height: 44, rx: 10, fill: i === 1 ? C.bsoft : '#fff', stroke: i === 1 ? C.b : C.ink, 'stroke-width': 1.8 }, S.chain2);
      t2(S.chain2, b[1], 389, b[0], '', { 'font-size': 18, 'font-weight': 600, fill: i === 1 ? C.b : C.ink, 'text-anchor': 'middle' });
    });
    t2(S.chain2, 240, 389, '→', '', { 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.chain2, 420, 389, '→', '', { 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.chain2, 330, 440, '帰着の順（Karp の 3 次元マッチングから）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 170, 'DT は NP に属する', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 196, '（木を推測してコストを確かめる）', '', { 'font-size': 14, fill: C.muted });
    t2(p2, PX, 246, 'EC3 を DT に帰着して', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 272, 'NP 困難も示す', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 326, 'EC3：3 要素の集合で', '', { 'font-size': 15, fill: C.b });
    t2(p2, PX, 350, '重なりなく全体を覆えるか', '', { 'font-size': 15, fill: C.b });

    // ===== scene 3: the chain of triples (Fig. 1) =====
    var g3 = S.g[2];
    var chain = [[470, 90, '{1, 2, 3}'], [370, 170, '{4, 5, 6}'], [270, 250, '{7, 8, 9}']];
    S.ch3 = chain.map(function (c, i) {
      var g = el('g', {}, g3);
      if (i > 0) el('line', { x1: chain[i - 1][0] - 34, y1: chain[i - 1][1] + 18, x2: c[0] + 24, y2: c[1] - 20, stroke: C.ink, 'stroke-width': 2 }, g);
      el('line', { x1: c[0] + 34, y1: c[1] + 18, x2: c[0] + 80, y2: c[1] + 70, stroke: C.ink, 'stroke-width': 2 }, g);
      el('ellipse', { cx: c[0], cy: c[1], rx: 62, ry: 22, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g);
      t2(g, c[0], c[1] + 6, m('x') + ' ∈ ' + c[2] + ' ？', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      el('path', { d: 'M' + (c[0] + 80) + ',' + (c[1] + 70) + ' l-18,26 M' + (c[0] + 80) + ',' + (c[1] + 70) + ' l18,26', stroke: C.muted, 'stroke-width': 1.5, fill: 'none' }, g);
      t2(g, c[0] + 80, c[1] + 116, '3 つを見分ける', '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
      return { g: g, t0: 17.0 + i * 1.0 };
    });
    S.abc = el('g', {}, g3);
    el('line', { x1: 236, y1: 268, x2: 190, y2: 330, stroke: C.ink, 'stroke-width': 2 }, S.abc);
    el('rect', { x: 140, y: 330, width: 100, height: 36, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, S.abc);
    t2(S.abc, 190, 354, m('a') + ', ' + m('b') + ', ' + m('c'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, 330, 440, '元の ' + m('X') + ' = {1, …, 9}、追加した ' + m('a') + ', ' + m('b') + ', ' + m('c'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '構成', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 176, m('X') + "′ ＝ " + m('X') + ' ∪ {' + m('a') + ', ' + m('b') + ', ' + m('c') + '}', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 206, m('T') + "′ ＝ 三つ組 ＋ 1 要素の集合", '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 260, '最適な木では、三つ組が', '', { 'font-size': 16, fill: C.b });
    t2(p3, PX, 286, '完全被覆をなして鎖に並ぶ', '', { 'font-size': 16, fill: C.b });
    t2(p3, PX, 340, '→ 最適な木から EC3 の', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 364, '答えが読み取れる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（論文 Fig. 1 の形、三つ組は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 =====
    var g4 = S.g[3];
    var F = [0, 2, 5, 8, 12, 16, 20, 25];
    var AX = 110, AY = 420, AH = 270;
    el('line', { x1: AX, x2: 580, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.bars4 = F.map(function (v, i) {
      var x = AX + 18 + i * 56;
      var r = el('rect', { x: x, y: AY, width: 38, height: 0, fill: i >= 6 ? C.a : '#E7A27F' }, g4);
      var lab = t2(g4, x + 19, AY - AH * v / 25 - 8, String(v), '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
      t2(g4, x + 19, AY + 24, String(i + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lab: lab, h: AH * v / 25, t0: 25.0 + i * 0.35 };
    });
    t2(g4, 345, AY + 52, m('n') + '（要素の数）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g4, AX, 110, '最小のコスト ' + m('f') + '(' + m('n') + ')（論文 Table 1）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, m('f') + '(' + m('n') + ') ＝ min', '', { 'font-size': 18, fill: C.ink });
    t2(p4, PX + 20, 182, '[' + m('f') + '(' + m('n') + '−' + m('i') + ') + ' + m('f') + '(' + m('i') + ') + ' + m('n') + ']', '', { 'font-size': 18, fill: C.ink });
    t2(p4, PX + 20, 210, '1 ≤ ' + m('i') + ' ≤ 3', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 266, m('n') + ' ≥ 7 では', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 294, m('i') + ' ＝ 3（3 要素のテスト）', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 322, 'を根で選ぶのが最適', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(g4, 940, 520, '論文 Table 1 の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '平均の回数（外部道長）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'NP 完全', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '最悪の回数', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '同じ構成で NP 完全', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'INFORMATION PROCESSING LETTERS 1976';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Constructing Optimal Binary Decision Trees';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'is NP-Complete';
    t2(g5, 480, 304, '最適な二分決定木を作る問題は NP 完全である', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Laurent Hyafil, Ronald L. Rivest';
    el('text', { x: 480, y: 406, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1016/0020-0190(76)90095-8';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.leaf1.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 2.0 + i * 0.5, 2.4 + i * 0.5)); });
    S.cost1.setAttribute('opacity', seg(t, 4.4, 5.0));
    S.p1.setAttribute('opacity', seg(t, 1.0, 1.8));
    S.q2.setAttribute('opacity', seg(t, 8.6, 9.2));
    S.big2.setAttribute('opacity', seg(t, 9.8, 10.6));
    S.chain2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.ch3.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.5)); });
    S.abc.setAttribute('opacity', seg(t, 20.0, 20.5));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.6));
      b.r.setAttribute('y', 420 - b.h * s); b.r.setAttribute('height', b.h * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
