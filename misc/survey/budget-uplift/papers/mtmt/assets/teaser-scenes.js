// =====================================================================
// teaser-scenes.js — Wei et al., MTMT (arXiv 2408.12803 v1), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 2 uses the means printed inside Fig. 4 (base 0.055, also in the text; incremental -0.00146).
// Scene 4 uses the QINI values printed in Table 2 (arXiv v1).
// Colours: orange = base effect (whether to give a bonus); blue = incremental effect (which bonus).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '既存の多処置モデルの多くは、処置ごとの反応を別々に予測し、対照群の予測との差を効果とする。', en: '' },
    { ja: 'ところが、<span class="A">ボーナスを配るかどうか</span>による差に比べて、<span class="B">どのボーナスを配るか</span>による差はずっと小さい。', en: '' },
    { ja: 'MTMT は効果を<span class="A">基本効果</span>と<span class="B">増分効果</span>に分け、それぞれを別の出力で推定する。', en: '' },
    { ja: '2 種類のボーナスを比べた自社データでは、ボーナス A の QINI が比較手法の最高値の 2 倍になった。', en: '' },
    { ja: '処置の効果は「配るかどうか」と「どれを配るか」に分けて推定する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  var YBAR = m('ȳ');

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one output per treatment, effect = difference to control =====
    var g1 = S.g[0];
    var X1 = 300, U1 = 800;
    var rows1 = [['対照の予測 ' + YBAR + '(0)', 0.30], ['ボーナス A の予測 ' + YBAR + '(A)', 0.36], ['ボーナス B の予測 ' + YBAR + '(B)', 0.37]];
    t2(g1, 70, 70, '反応の予測（例：翌日にログインする確率）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars1 = rows1.map(function (r, i) {
      var y = 140 + i * 110, o = {};
      t2(g1, X1 - 16, y + 20, r[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: X1, y: y, width: 0, height: 30, rx: 4, fill: C.gray }, g1);
      o.full = r[1] * U1;
      if (i > 0) {
        o.diff = el('rect', { x: X1 + 0.30 * U1, y: y, width: (r[1] - 0.30) * U1, height: 30, fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, g1);
        o.lab = t2(g1, X1 + r[1] * U1 + 10, y + 21, '差 = 効果', '', { 'font-size': 15, fill: C.ink });
      }
      return o;
    });
    S.ref1 = el('line', { x1: X1 + 0.30 * U1, x2: X1 + 0.30 * U1, y1: 125, y2: 400, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g1);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '処置ごとに出力を分ける', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p1, PX, 180, '効果 A = ' + YBAR + '(A) − ' + YBAR + '(0)', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 214, '効果 B = ' + YBAR + '(B) − ' + YBAR + '(0)', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 270, 'A と B のどちらがよいかは、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 294, '二つの差のわずかな違いと', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 318, 'してしか現れない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: base vs incremental effect, means printed in Fig. 4 =====
    var g2 = S.g[1];
    var Z = 200, U2 = 6000;
    [0, 0.02, 0.04].forEach(function (v) {
      el('line', { x1: Z + v * U2, x2: Z + v * U2, y1: 130, y2: 400, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g2);
      el('text', { x: Z + v * U2, y: 428, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = v === 0 ? '0' : v.toFixed(2);
    });
    t2(g2, 70, 70, '推定した効果の平均（自社データ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g2, Z + 10, 170, '基本効果 ' + m('τ̂') + '：配るかどうか', '', { 'font-size': 16, fill: C.a });
    S.base2 = el('rect', { x: Z, y: 185, width: 0, height: 34, rx: 4, fill: C.a }, g2);
    S.baseFull = 0.055 * U2;
    t2(g2, Z + 10, 300, '増分効果 ' + m('τ') + '<tspan font-size="11" dy="4">' + m('m') + '</tspan><tspan dy="-4">：どれを配るか</tspan>', '', { 'font-size': 16, fill: C.b });
    S.inc2 = el('rect', { x: Z, y: 315, width: 0, height: 34, rx: 2, fill: C.b }, g2);
    S.incFull = 0.00146 * U2;
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 140, '基本効果の平均', '', { 'font-size': 16, fill: C.muted });
    txt(p2, PX, 182, '0.055', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 240, '増分効果の平均', '', { 'font-size': 16, fill: C.muted });
    txt(p2, PX, 282, '−0.00146', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 336, '標準偏差は 0.0196 と 0.00252。', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 362, '散らばりの幅も 1 桁近く違う。', '', { 'font-size': 15, fill: C.ink });
    t2(g2, 940, 520, '論文 Fig. 4 の図中に書かれた平均値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: MTMT decomposition y(m) = y(0) + base + incremental =====
    var g3 = S.g[2];
    var X3 = 200, U3 = 800;
    t2(g3, 70, 70, 'MTMT の予測の組み立て', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows3 = [['対照', 0], ['ボーナス A', 0.02], ['ボーナス B', -0.01]];
    S.rows3 = rows3.map(function (r, i) {
      var y = 140 + i * 110, o = {};
      t2(g3, X3 - 16, y + 22, r[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: X3, y: y, width: 0.30 * U3, height: 34, rx: 4, fill: C.gray }, g3);
      if (i === 0) { txt(g3, X3 + 10, y + 23, YBAR + '(0)', { 'font-size': 16, fill: C.ink }); return o; }
      o.base = el('rect', { x: X3 + 0.30 * U3, y: y, width: 0, height: 34, fill: C.a }, g3);
      o.inc = el('rect', { x: 0, y: y, width: 0, height: 34, fill: C.b }, g3);
      o.v = r[1];
      o.lab = txt(o.g = el('g', {}, g3), X3 + 0.36 * U3 + (r[1] > 0 ? r[1] * U3 : 0) + 12, y + 23,
        '+ ' + m('τ̂') + ' + ' + m('τ') + '<tspan font-size="11" dy="4">' + (i === 1 ? 'A' : 'B') + '</tspan><tspan dy="-4">' + (i === 1 ? '' : '（負）') + '</tspan>', { 'font-size': 16, fill: C.ink });
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 135, YBAR + '(' + m('m') + ') = ' + YBAR + '(0) + <tspan fill="' + C.a + '">' + m('τ̂') + '</tspan> + <tspan fill="' + C.b + '">' + m('τ') + '<tspan font-size="14" dy="5">' + m('m') + '</tspan></tspan>', { 'font-size': 24, 'font-weight': 600, fill: C.ink });
    el('rect', { x: PX, y: 176, width: 18, height: 18, rx: 3, fill: C.a }, p3);
    t2(p3, PX + 28, 191, '基本効果：配るかどうか', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 210, width: 18, height: 18, rx: 3, fill: C.b }, p3);
    t2(p3, PX + 28, 225, '増分効果：どれを配るか', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 280, '二つの効果を別々の出力で', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 304, '推定するので、小さな増分も', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 328, '大きな基本効果に埋もれにくい。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例で、増分は誇張している）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v1), QINI per bonus =====
    var g4 = S.g[3];
    var rows4 = [
      ['S-Learner', 0.0126, 0.00771], ['T-Learner', 0.00505, 0.00374], ['HydraNet', 0.00456, 0.00616],
      ['EFIN', 0.0142, 0.0294], ['M3TN', 0.0162, 0.00107], ['MTMT', 0.0324, 0.0291]
    ];
    var LX = 175, W4 = 165, GAP4 = 55, HI4 = 0.035, Y4 = 130, DY4 = 50, BH4 = 24;
    t2(g4, 70, 58, 'QINI（正規化、多処置の自社データ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows4 = [];
    [['ボーナス A', LX], ['ボーナス B', LX + W4 + GAP4]].forEach(function (p, j) {
      var x0 = p[1];
      t2(g4, x0, 98, p[0], '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      [0, 0.01, 0.02, 0.03].forEach(function (v) {
        var x = x0 + v / HI4 * W4;
        el('line', { x1: x, x2: x, y1: Y4 - 20, y2: Y4 + DY4 * 5 + 20, stroke: C.hair }, g4);
        el('text', { x: x, y: Y4 + DY4 * 5 + 44, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v === 0 ? '0' : v.toFixed(2);
      });
      rows4.forEach(function (r, i) {
        var y = Y4 + DY4 * i, v = r[1 + j], best = r[0] === 'MTMT', o = {};
        o.bar = el('rect', { x: x0, y: y - BH4 / 2, width: 0, height: BH4, rx: 3, fill: best ? C.ink : C.gray }, g4);
        o.full = v / HI4 * W4;
        o.lab = el('text', { x: x0 + o.full + 5, y: y + 5, 'font-size': 14, fill: best ? C.ink : C.muted }, g4);
        o.lab.textContent = String(v);
        o.t0 = 25 + i * 0.5;
        S.rows4.push(o);
      });
    });
    rows4.forEach(function (r, i) {
      el('text', { x: LX - 12, y: Y4 + DY4 * i + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': r[0] === 'MTMT' ? 650 : 400 }, g4).textContent = r[0];
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'ボーナス A', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(p4, PX, 172, '0.0324', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    t2(p4, PX + 112, 172, '対 0.0162', '', { 'font-size': 18, fill: C.muted });
    t2(p4, PX, 198, 'MTMT と M3TN', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 250, 'ボーナス B', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 280, 'EFIN 0.0294、MTMT 0.0291 で', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 304, 'ほぼ同じ。AUUC では MTMT', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 328, 'が 0.0782 対 0.0513 で上回る。', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 2（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2024';
    el('text', { x: 480, y: 210, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Multi-Treatment Multi-Task Uplift Modeling';
    el('text', { x: 480, y: 252, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Enhancing User Growth';
    t2(g5, 480, 298, '利用者の成長を促すための多処置・多タスクのアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 348, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yuxiang Wei · Zhaoxin Qiu · Yingjie Li · Yuke Sun · Xiaoling Li';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2408.12803';
    t2(g5, 480, 428, '改題版が Neurocomputing（2026）に掲載', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, then the differences to control are outlined
    S.bars1.forEach(function (o, i) {
      o.bar.setAttribute('width', o.full * seg(t, 0.8 + i * 0.5, 2.2 + i * 0.5));
      if (o.diff) { var s = seg(t, 3.8, 4.6); o.diff.setAttribute('opacity', s); o.lab.setAttribute('opacity', s); }
    });
    S.ref1.setAttribute('opacity', seg(t, 3.4, 3.9));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    // scene 2: base bar grows to 0.055, incremental bar barely moves left of zero
    S.base2.setAttribute('width', S.baseFull * seg(t, 9, 11));
    var k = seg(t, 11.4, 12.4);
    S.inc2.setAttribute('width', S.incFull * k); S.inc2.setAttribute('x', 200 - S.incFull * k);
    S.p2.setAttribute('opacity', seg(t, 12.2, 13));
    // scene 3: base segments, then incremental segments
    S.rows3.forEach(function (o) {
      if (!o.base) return;
      var b = seg(t, 17.2, 18.6), c = seg(t, 19.2, 20.4), x1 = 200 + 0.30 * 800 + 0.06 * 800 * b;
      o.base.setAttribute('width', 0.06 * 800 * b);
      var w = Math.abs(o.v) * 800 * c;
      if (o.v > 0) { o.inc.setAttribute('x', x1); o.inc.setAttribute('width', w); }
      else { o.inc.setAttribute('x', x1 - w); o.inc.setAttribute('width', w); o.inc.setAttribute('fill-opacity', 0.85); }
      o.g.setAttribute('opacity', seg(t, 20.2, 20.9));
    });
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));
    // scene 4: bars grow row by row
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.full * s); o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
