// =====================================================================
// teaser-scenes.js — Zantedeschi, Kusner, Niculae, Learning Binary Decision Trees by Argmin Differentiation
// (ICML 2021), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic. Scenes 2-3 draw, for one child node reached when s > 0 (q = s, a_t = 1), the
// integer solution z = 1[q > 0] and the relaxed solution z = Proj_[0,1](q + 1/2) of Proposition 2.
// Scene 4 uses Table 2 (Higgs): error rates and training times. Colours: orange = integer program and
// baselines; blue = the relaxed quadratic program and the paper's results.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '二分木の学習には、<span class="A">貪欲法・確率的な緩和・混合整数計画</span>の 3 つの道があり、それぞれに弱点がある。', en: '' },
    { ja: 'データがどのノードを通るかを整数計画で決めると、解は段差になり、分岐のパラメータへの勾配は 0 になる。', en: '' },
    { ja: '<span class="B">二次の正則化を足して緩和</span>すると、解は分岐の値に沿って連続に変わり、argmin を微分できる。', en: '' },
    { ja: 'Higgs では単一の木の中で最も低い誤分類率 0.2201 を出し、確率的な分岐の木より短い時間で学習した。', en: '' },
    { ja: '分岐・刈り込み・予測関数を 1 つの損失から同時に学び、決定木を深層ネットワークの層として使える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g, x, y, s, attrs) { var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k]; var e = el('text', a, g); e.textContent = s; return e; }

  // axes shared by scenes 2 and 3: z as a function of the split value s in [-1.5, 1.5]
  var AX0 = 110, AX1 = 590, AY0 = 400, AY1 = 150;
  function ax(s) { return AX0 + (AX1 - AX0) * (s + 1.5) / 3; }
  function ay(z) { return AY0 - (AY0 - AY1) * z; }
  function axes(g) {
    el('line', { x1: AX0, y1: AY0, x2: AX1, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: ax(0), y1: AY0 + 6, x2: ax(0), y2: AY1 - 20, stroke: C.hair, 'stroke-width': 1 }, g);
    el('line', { x1: AX0, y1: ay(1), x2: AX1, y2: ay(1), stroke: C.hair, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, g);
    txt(g, AX0 - 10, ay(1) + 5, '1', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    txt(g, AX0 - 10, AY0 + 5, '0', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    [-1, 0, 1].forEach(function (v) { txt(g, ax(v), AY0 + 26, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    t2(g, AX1, AY0 + 52, '分岐の値 ' + m('s') + '<tspan dy="5" font-size="12" ' + MI + '>θ</tspan><tspan dy="-5">(</tspan>' + m('x') + ')', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, AX0, AY1 - 34, '右の子に着く量 ' + m('z'), '', { 'font-size': 15, fill: C.muted });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: three families =====
    var g1 = S.g[0];
    var cards = [
      ['貪欲法', 'CART、ID3', 'ノードごとの基準で', '分岐を決めるので、', '木全体では最適でない'],
      ['確率的な緩和', 'ソフトな決定木', '解がまばらにならず、', '刈り込みの原理的な', '方法がない'],
      ['混合整数計画', 'OCT など', '大域的に最適だが、', '扱えるのは数千件程度。', '汎化はよくわからない']
    ];
    S.cards1 = cards.map(function (c, k) {
      var g = el('g', {}, g1), x = 70 + k * 200;
      el('rect', { x: x, y: 120, width: 180, height: 270, rx: 14, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      t2(g, x + 90, 162, c[0], '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
      t2(g, x + 90, 190, c[1], '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      [c[2], c[3], c[4]].forEach(function (s, j) { t2(g, x + 90, 250 + j * 28, s, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }); });
      return { g: g, t0: 1.0 + k * 0.8 };
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 170, 'この論文の方針', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p1, PX, 218, '離散の部分は整数計画で書き、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 244, 'それを緩和して、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 270, '連続の部分を勾配法で学ぶ。', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: integer solution = step =====
    var g2 = S.g[1];
    axes(g2);
    S.step2 = el('path', { d: 'M' + ax(-1.5) + ',' + ay(0) + ' L' + ax(0) + ',' + ay(0) + ' L' + ax(0) + ',' + ay(1) + ' L' + ax(1.5) + ',' + ay(1), fill: 'none', stroke: C.a, 'stroke-width': 3.2 }, g2);
    S.zero2 = t2(g2, ax(-0.8), ay(0) - 18, '傾き 0', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    S.zero2b = t2(g2, ax(0.8), ay(1) - 18, '傾き 0', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '経路の整数計画', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 196, m('z') + ' ∈ {0, 1}：ノードに着くか', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 224, m('a') + ' ∈ {0, 1}：ノードを残すか', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 280, '解は分岐の値について', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 304, '区分的に一定で、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 328, '勾配が流れない。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '1 ノードの例（' + m('q') + ' = ' + m('s') + '、' + m('a') + ' = 1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: relaxed QP solution = clipped ramp =====
    var g3 = S.g[2];
    axes(g3);
    el('path', { d: 'M' + ax(-1.5) + ',' + ay(0) + ' L' + ax(0) + ',' + ay(0) + ' L' + ax(0) + ',' + ay(1) + ' L' + ax(1.5) + ',' + ay(1), fill: 'none', stroke: C.a, 'stroke-width': 2, opacity: 0.45, 'stroke-dasharray': '6 4' }, g3);
    S.ramp3 = el('path', { d: '', fill: 'none', stroke: C.b, 'stroke-width': 3.4 }, g3);
    S.band3 = el('rect', { x: ax(-0.5), y: AY1 - 10, width: ax(0.5) - ax(-0.5), height: AY0 - AY1 + 10, fill: C.bsoft, opacity: 0 }, g3);
    g3.insertBefore(S.band3, g3.firstChild);
    S.bandLab = t2(g3, ax(0), AY1 - 14, '勾配が流れる範囲', '', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '強凸な二次計画 T', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 174, m('z') + ' = Proj', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 70, 182, '[0, ' + m('a') + ']', '', { 'font-size': 12, fill: C.ink });
    t2(p3, PX + 112, 174, '(' + m('q') + ' + ½)', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 228, m('a') + ' は木の上の単調回帰', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 252, '（一般化した PAV）で解く', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 304, 'ほとんどいたるところで', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 328, '微分でき、逆方向も', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 352, '閉じた形で計算できる', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 940, 520, '論文の命題 2 の式（' + m('q') + ' = ' + m('s') + '、' + m('a') + ' = 1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Higgs (Table 2) =====
    var g4 = S.g[3];
    var rows = [['CART', 0.3430, 113, C.a], ['NDF-1', 0.2644, 43593, C.a], ['ANT', 0.2430, 62335, C.a], ['この論文', 0.2201, 18642, C.b]];
    var EX0 = 170, EPX = 600;   // error panel: 0.40 = 240 px
    var TX0 = 170;
    t2(g4, 70, 92, 'Higgs：テスト誤分類率', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 312, 'Higgs：学習時間（時間）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: EX0, x2: EX0, y1: 108, y2: 270, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: TX0, x2: TX0, y1: 328, y2: 490, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.b4 = [];
    rows.forEach(function (r, k) {
      var y = 128 + k * 38, y2 = 348 + k * 38;
      t2(g4, EX0 - 12, y + 6, r[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      t2(g4, TX0 - 12, y2 + 6, r[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var we = r[1] * EPX, wt = r[2] / 3600 * 22;
      var re = el('rect', { x: EX0, y: y - 12, width: 0, height: 24, fill: r[3] }, g4);
      var rt = el('rect', { x: TX0, y: y2 - 12, width: 0, height: 24, fill: r[3] }, g4);
      var le = txt(g4, EX0 + we + 8, y + 6, r[1].toFixed(4), { 'font-size': 15, 'font-weight': 650, fill: r[3] });
      var lt = txt(g4, TX0 + Math.max(wt, 2) + 8, y2 + 6, (r[2] / 3600).toFixed(r[2] < 3600 ? 2 : 1) + ' 時間', { 'font-size': 15, 'font-weight': 650, fill: r[3] });
      S.b4.push({ re: re, rt: rt, le: le, lt: lt, we: we, wt: wt, t0: 24.8 + k * 0.6 });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 140, '森の手法（参考）', '', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 166, 'NODE 0.210、XGBoost 0.2334', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 216, '最適な木の手法', '', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 242, 'GOSDT：メモリ不足', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 266, 'Optree-LS：3 日で終わらず', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 316, '単一の木では CART が', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 340, '最も速い（113 秒）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2 の値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '整数計画を二次計画に緩和し', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, 'argmin を微分する', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '分岐・刈り込み・予測関数を', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, '同時に学習', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 480, 172, 'ICML 2021', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g5, 480, 222, 'Learning Binary Decision Trees', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 262, 'by Argmin Differentiation', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g5, 480, 304, 'argmin 微分による二分決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g5, 480, 354, 'Valentina Zantedeschi, Matt J. Kusner, Vlad Niculae', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 480, 408, 'github.com/vzantedeschi/LatentTrees', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.cards1.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.5)); });
    S.p1.setAttribute('opacity', seg(t, 4.0, 4.8));
    S.zero2.setAttribute('opacity', seg(t, 10.6, 11.2));
    S.zero2b.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: the ramp is drawn from left to right
    var k3 = seg(t, 17.2, 20.2), smax = -1.5 + 3 * k3, d = '';
    for (var i = 0; i <= 120; i++) {
      var s = -1.5 + 3 * i / 120; if (s > smax) break;
      var z = Math.max(0, Math.min(1, s + 0.5));
      d += (i ? 'L' : 'M') + ax(s).toFixed(1) + ',' + ay(z).toFixed(1);
    }
    S.ramp3.setAttribute('d', d || 'M0,0');
    S.band3.setAttribute('opacity', seg(t, 20.4, 21.0));
    S.bandLab.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    S.b4.forEach(function (b) {
      var e = seg(t, b.t0, b.t0 + 0.7), e2 = seg(t, b.t0 + 2.4, b.t0 + 3.1);
      b.re.setAttribute('width', b.we * e); b.le.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
      b.rt.setAttribute('width', b.wt * e2); b.lt.setAttribute('opacity', seg(t, b.t0 + 2.9, b.t0 + 3.3));
    });
    S.p4.setAttribute('opacity', seg(t, 29.0, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
