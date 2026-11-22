// =====================================================================
// teaser-scenes.js — He et al. (KDD 2024) RERUM, unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 4 (arXiv v2): sales revenue LIFT@2 of three online campaigns.
// Colours: orange = per-customer regression with MSE / base models; blue = ranking losses / RERUM.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来のモデルは、0 が大半で裾の長い売上を<span class="A">一人ずつ MSE で回帰</span>してきた。', en: '' },
    { ja: '一人ひとりの誤差が小さくても、<span class="A">アップリフトの順位</span>は入れ替わりうる。', en: '' },
    { ja: 'RERUM は ZILN 損失に<span class="B">2 種類の順位損失</span>を足し、順位そのものを学習する。', en: '' },
    { ja: 'Tencent FiT の 3 回のオンライン実験で、上位 2% の売上の差が平均 20.61% 大きくなった。', en: '' },
    { ja: '売上のアップリフトでは値の正確さに加えて順位の正しさを直接学習する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // toy customers for scenes 2-3: true uplift, a prediction with small errors (B and C swap),
  // and a prediction after ranking-aware training (order restored)
  var CUS = [['A', 5.0, 4.8, 4.9], ['B', 4.2, 3.9, 4.1], ['C', 4.0, 4.3, 3.9], ['D', 2.5, 2.7, 2.6], ['E', 1.0, 1.1, 1.0]];
  var LX = 120, RX = 470, RY0 = 110, RDY = 68;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: revenue histogram, many zeros and a long tail =====
    var g1 = S.g[0];
    var hist = [300, 62, 44, 30, 20, 13, 8, 5, 3, 2, 1.4, 1, 0.7, 0.5];
    var HX0 = 90, HY0 = 450, BW = 34;
    t2(g1, HX0, 58, '1 人あたりの売上の分布', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: HX0 - 6, x2: 600, y1: HY0, y2: HY0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.h1 = hist.map(function (v, i) {
      return { r: el('rect', { x: HX0 + i * BW, y: HY0, width: BW - 6, height: 0, rx: 3, fill: C.gray }, g1), h: v * 1.15 };
    });
    t2(g1, HX0 + 14, HY0 + 26, '0', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g1, 600, HY0 + 26, '売上 →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.tail = el('circle', { cx: 590, cy: HY0 - 8, r: 8, fill: C.a }, g1);
    S.tailLab = t2(g1, 590, HY0 - 30, 'ごく一部の高額', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '売上が 0 の人が大半', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 160, 'ごく一部に高額の人がいる', '', { 'font-size': 17, fill: C.ink });
    txt(p1, PX, 230, '(' + m('ŷ') + ' − ' + m('y') + ')²', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 268, '一人ずつの誤差を小さくする', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 318, 'MSE は外れ値の', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 342, '影響を受けやすい。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（分布の形は論文 Fig. 1 の説明にならった例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scenes 2 and 3 share one ranking diagram =====
    function rankDiagram(g, blueFix) {
      var o = {};
      t2(g, LX, 64, '真のアップリフトの順', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      t2(g, RX, 64, '予測の順', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      var predOrder = CUS.slice().sort(function (a, b) { return b[2] - a[2]; }).map(function (c) { return c[0]; });
      o.links = []; o.right = [];
      CUS.forEach(function (c, i) {
        var y = RY0 + i * RDY, j = predOrder.indexOf(c[0]);
        var ln = el('line', { x1: LX + 70, y1: y, x2: RX - 70, y2: RY0 + j * RDY, stroke: C.gray, 'stroke-width': 3 }, g);
        o.links.push({ ln: ln, i: i, j: j, swap: i !== j });
        el('rect', { x: LX - 66, y: y - 22, width: 132, height: 44, rx: 10, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
        txt(g, LX - 50, y + 7, c[0], { 'font-size': 20, 'font-weight': 650, fill: C.ink });
        txt(g, LX + 50, y + 7, c[1].toFixed(1), { 'font-size': 18, fill: C.ink, 'text-anchor': 'end' });
      });
      CUS.forEach(function (c) {
        var j = predOrder.indexOf(c[0]), y = RY0 + j * RDY, r = {};
        r.g = el('g', {}, g);
        r.box = el('rect', { x: RX - 66, y: y - 22, width: 132, height: 44, rx: 10, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, r.g);
        txt(r.g, RX - 50, y + 7, c[0], { 'font-size': 20, 'font-weight': 650, fill: C.ink });
        r.val = txt(r.g, RX + 50, y + 7, c[2].toFixed(1), { 'font-size': 18, fill: C.ink, 'text-anchor': 'end' });
        r.v0 = c[2].toFixed(1); r.v1 = c[3].toFixed(1);
        r.name = c[0]; r.j = j; r.i = CUS.indexOf(c);
        o.right.push(r);
      });
      return o;
    }

    // ===== scene 2: small errors, swapped order =====
    var g2 = S.g[1];
    S.r2 = rankDiagram(g2);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '予測の誤差は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 158, '一人あたり 0.3 以下', '', { 'font-size': 17, fill: C.ink });
    S.p2b = el('g', {}, g2);
    t2(S.p2b, PX, 220, 'それでも B と C の', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(S.p2b, PX, 248, '順位が入れ替わる', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(S.p2b, PX, 300, '施策は上位から介入するので、', '', { 'font-size': 15, fill: C.muted });
    t2(S.p2b, PX, 324, '値より順位が重要になる。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: three losses, order restored =====
    var g3 = S.g[2];
    S.r3 = rankDiagram(g3);
    var p3 = S.p3 = el('g', {}, g3);
    var blocks = [
      ['ZILN 損失', '買うか ＋ 買った人の金額', C.a, '#FCEBDF'],
      ['応答の順位損失', '入れ替わった 2 人を罰する', C.b, C.bsoft],
      ['アップリフトの順位損失', '集団全体の並びを合わせる', C.b, C.bsoft]
    ];
    S.blk = blocks.map(function (b, i) {
      var g = el('g', {}, p3), y = 92 + i * 104;
      el('rect', { x: PX - 10, y: y, width: 270, height: 84, rx: 12, fill: b[3] }, g);
      t2(g, PX + 6, y + 34, b[0], '', { 'font-size': 18, 'font-weight': 650, fill: b[2] });
      t2(g, PX + 6, y + 64, b[1], '', { 'font-size': 15, fill: C.ink });
      if (i > 0) txt(g, PX - 30, y + 50, '+', { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      return g;
    });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 4, sales revenue LIFT@2 =====
    var g4 = S.g[3];
    var rows = [['キャンペーン 1', 24566, 26826, '+9.20%'], ['キャンペーン 2', 30137, 41360, '+37.24%'], ['キャンペーン 3', 21971, 25361, '+15.43%']];
    var BX0 = 110, BY0 = 450, MAXV = 45000, BH = 340, BW4 = 64;
    function bh(v) { return v / MAXV * BH; }
    t2(g4, 70, 58, '売上の LIFT@2（上位 2% の処置群と対照群の差）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 10000, 20000, 30000, 40000].forEach(function (v) {
      el('line', { x1: BX0 - 20, x2: 600, y1: BY0 - bh(v), y2: BY0 - bh(v), stroke: C.hair }, g4);
      el('text', { x: BX0 - 28, y: BY0 - bh(v) + 5, 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toLocaleString('en-US');
    });
    S.bars4 = rows.map(function (r, i) {
      var x = BX0 + i * 165, o = {};
      o.a = el('rect', { x: x, y: BY0, width: BW4, height: 0, fill: C.a, rx: 3 }, g4);
      o.b = el('rect', { x: x + BW4 + 6, y: BY0, width: BW4, height: 0, fill: C.b, rx: 3 }, g4);
      o.ha = bh(r[1]); o.hb = bh(r[2]);
      t2(g4, x + BW4 + 3, BY0 + 26, r[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      o.lab = txt(g4, x + BW4 * 1.5 + 6, BY0 - o.hb - 12, r[3], { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      o.t0 = 25 + i * 1.2;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 96, width: 18, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX + 28, 111, '既存のオンラインモデル', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 128, width: 18, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 28, 143, 'RERUM を組み込んだモデル', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 200, '平均の改善', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 244, '+20.61%', { 'font-size': 38, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 296, '対象は約 4 億人の利用者', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 322, '運用資産は毎月 4.3 億ドル増加', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 360, '処置は通知の赤い点の表示、', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 382, '期間は 1 か月', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2024';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Rankability-enhanced Revenue Uplift';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Modeling Framework for Online Marketing';
    t2(g5, 480, 288, '順位づけ性能を高めた売上アップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Bowei He · Yunpeng Weng · Xing Tang · Ziqiang Cui';
    el('text', { x: 480, y: 360, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zexu Sun · Liang Chen · Xiuqiang He · Chen Ma';
    el('text', { x: 480, y: 412, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/BokwaiHo/revenue_uplift';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow left to right, tail point flashes
    S.h1.forEach(function (o, i) {
      var h = o.h * seg(t, 0.8 + i * 0.12, 1.6 + i * 0.12);
      o.r.setAttribute('height', h); o.r.setAttribute('y', 450 - h);
    });
    var tl = seg(t, 3.4, 4);
    S.tail.setAttribute('opacity', tl); S.tailLab.setAttribute('opacity', tl);
    S.p1.setAttribute('opacity', seg(t, 1.8, 2.6));
    // scene 2: swapped links turn orange
    S.r2.links.forEach(function (l) {
      l.ln.setAttribute('stroke', l.swap ? H.mix(C.gray, C.a, seg(t, 11.5, 12.3)) : C.gray);
      l.ln.setAttribute('stroke-width', l.swap ? 3 + 2 * seg(t, 11.5, 12.3) : 3);
    });
    S.r2.right.forEach(function (r) {
      r.box.setAttribute('stroke', (r.i !== r.j) ? H.mix(C.hair, C.a, seg(t, 11.5, 12.3)) : C.hair);
    });
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.p2b.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: loss blocks appear, then the swapped pair moves back and links turn blue
    S.blk.forEach(function (b, i) { b.setAttribute('opacity', seg(t, 17 + i * 0.9, 17.6 + i * 0.9)); });
    var k = seg(t, 20.2, 21.8);
    S.r3.right.forEach(function (r) {
      var dy = (r.i - r.j) * 68 * k;
      r.g.setAttribute('transform', 'translate(0,' + dy + ')');
      r.val.textContent = k > 0.5 ? r.v1 : r.v0;
      r.box.setAttribute('stroke', (r.i !== r.j) ? H.mix(C.a, C.b, k) : H.mix(C.hair, C.b, seg(t, 21.8, 22.4)));
    });
    S.r3.links.forEach(function (l) {
      var y2 = 110 + (l.j + (l.i - l.j) * k) * 68;
      l.ln.setAttribute('y2', y2);
      l.ln.setAttribute('stroke', l.swap ? H.mix(C.a, C.b, k) : H.mix(C.gray, C.b, seg(t, 21.8, 22.4)));
      l.ln.setAttribute('stroke-width', l.swap ? 5 - 2 * k : 3);
    });
    // scene 4: bars grow campaign by campaign
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8), s2 = seg(t, o.t0 + 0.4, o.t0 + 1.2);
      o.a.setAttribute('height', o.ha * s); o.a.setAttribute('y', 450 - o.ha * s);
      o.b.setAttribute('height', o.hb * s2); o.b.setAttribute('y', 450 - o.hb * s2);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 1.1, o.t0 + 1.5));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
