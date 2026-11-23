// =====================================================================
// teaser-scenes.js — Zou, Du, Lee & Pedersen (arXiv 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 3 uses the paper's
// experimental settings (q = 40 %, temperature 0.5 + 0.1 per 100 steps) only as text; the curve is schematic.
// Scene 4 uses the AUCC values printed in Table 2 (arXiv v1, marketing data).
// Colours: orange = incremental cost / separate-estimation baseline; blue = incremental value / direct models.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来は<span class="B">価値</span>と<span class="A">コスト</span>の処置効果を別々のモデルで推定し、割り算した比で順位をつける。', en: '' },
    { ja: 'DRM はスコアで重みをつけた集団全体の「増分コスト÷増分価値」を損失にして、スコア関数を直接学習する。', en: '' },
    { ja: '制約つきランキングは上位 40% の境目でスコアを落とすシグモイドを入れ、その傾きを学習中に急にしていく。', en: '' },
    { ja: 'マーケティングデータでは、<span class="B">制約つきランキング</span>の AUCC が 0.678 で、基準の Duality R-learner より 24.6% 高かった。', en: '' },
    { ja: '配る集団全体の費用対効果を損失にすれば、予測と最適化を 1 段で学習できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two separate estimates per user, then their ratio =====
    var g1 = S.g[0];
    var users = [[3.0, 1.0], [2.0, 2.5], [1.5, 0.3], [2.6, 1.3], [0.8, 0.2], [2.2, 1.8]];
    var ratios = users.map(function (u) { return u[0] / u[1]; });
    var order = ratios.slice().sort(function (a, b) { return b - a; });
    var U = 40;
    txt(g1, 170, 66, m('τ') + '<tspan baseline-shift="super" font-size="12">r</tspan>（価値）', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(g1, 320, 66, m('τ') + '<tspan baseline-shift="super" font-size="12">c</tspan>（コスト）', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(g1, 470, 66, '比', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(g1, 560, 66, '順位', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.rows1 = users.map(function (u, i) {
      var y = 100 + i * 62, o = {};
      txt(g1, 70, y + 17, 'ユーザー ' + (i + 1), { 'font-size': 16, fill: C.ink });
      o.r = el('rect', { x: 170, y: y, width: 0, height: 24, rx: 4, fill: C.b }, g1); o.rw = u[0] * U;
      o.c = el('rect', { x: 320, y: y, width: 0, height: 24, rx: 4, fill: C.a }, g1); o.cw = u[1] * U;
      o.q = txt(g1, 470, y + 18, ratios[i].toFixed(1), { 'font-size': 17, fill: C.ink });
      var rk = order.indexOf(ratios[i]) + 1;
      o.k = el('g', {}, g1);
      el('circle', { cx: 574, cy: y + 12, r: 14, fill: rk <= 2 ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, o.k);
      txt(o.k, 574, y + 18, String(rk), { 'font-size': 15, 'font-weight': 600, fill: rk <= 2 ? '#fff' : C.ink, 'text-anchor': 'middle' });
      return o;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '推定モデルが 2 つ', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 158, '（例：因果フォレスト 2 本）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 210, '順位の基準は', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 238, '比 ' + m('τ') + '<tspan baseline-shift="super" font-size="11">r</tspan> / ' + m('τ') + '<tspan baseline-shift="super" font-size="11">c</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 292, '順位は一人ひとりの', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 316, '点推定の精度に左右される。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: DRM, softmax weights within each arm, ratio loss =====
    var g2 = S.g[1];
    var sc = [0.9, -0.6, 0.4, -0.9, 0.7, -0.2, -0.8, 0.1];   // target scores in (-1, 1), tanh range
    S.arms = [['処置群', 150], ['対照群', 290]].map(function (a, j) {
      txt(g2, 70, a[1] + 6, a[0], { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      return sc.map(function (s, i) {
        var s2 = j ? sc[(i + 3) % 8] : s;
        return { s: s2, c: el('circle', { cx: 190 + i * 54, cy: a[1], r: 16, fill: C.gray }, g2) };
      });
    });
    t2(g2, 70, 372, '円の大きさ：重み ' + m('p') + '<tspan baseline-shift="sub" font-size="12">i</tspan>（各群の中で合計 1）', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 70, 430, '損失 ' + m('τ̄') + '<tspan baseline-shift="super" font-size="12">c</tspan> / ' + m('τ̄') + '<tspan baseline-shift="super" font-size="12">r</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('rect', { x: 250, y: 414, width: 330, height: 22, rx: 4, fill: C.panel }, g2);
    S.loss = el('rect', { x: 250, y: 414, width: 330, height: 22, rx: 4, fill: C.a }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 120, m('p') + '<tspan baseline-shift="sub" font-size="12">i</tspan> = softmax(tanh ' + m('f') + '(' + m('x') + '<tspan baseline-shift="sub" font-size="12">i</tspan>))', { 'font-size': 18, fill: C.ink });
    t2(p2, PX, 148, '（処置群・対照群の中で正規化）', '', { 'font-size': 14, fill: C.muted });
    t2(p2, PX, 200, m('τ̄') + '：重みつきの', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '処置群 − 対照群', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 280, '損失：増分価値 1 単位', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 306, 'あたりの増分コスト', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 358, '費用対効果のよい人に', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 382, '重みが集まると小さくなる。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（点は架空のユーザー）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: quantile pooling, sigmoid cut-off at the top 40 %, temperature rising =====
    var g3 = S.g[2];
    var N = 20, X0 = 100, X1 = 580, YT = 120, YB = 330;
    S.qx = function (i) { return X0 + i * (X1 - X0) / (N - 1); };
    S.qs = function (i) { return 1 - 2 * i / (N - 1); };          // score, descending
    S.qd = (S.qs(7) + S.qs(8)) / 2;                               // cut between 8th and 9th of 20 = top 40 %
    S.qy = function (v) { return YB - v * (YB - YT); };
    el('line', { x1: X0 - 20, x2: X1 + 20, y1: YB, y2: YB, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: X0 - 20, x2: X0 - 20, y1: YB, y2: YT - 20, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, X0 - 28, S.qy(1) + 5, '1', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    txt(g3, X0 - 28, YB + 5, '0', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g3, X0 - 10, YT - 30, '↑ ' + m('σ') + '(' + m('t') + '(' + m('s') + ' − ' + m('d') + '))', '', { 'font-size': 16, fill: C.ink });
    var xd = (S.qx(7) + S.qx(8)) / 2;
    el('line', { x1: xd, x2: xd, y1: YT - 20, y2: 420, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g3);
    txt(g3, xd + 8, YT - 6, m('d'), { 'font-size': 18, fill: C.ink });
    S.curve = el('path', { d: '', fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
    S.qdots = [];
    for (var i = 0; i < N; i++) S.qdots.push(el('circle', { cx: S.qx(i), cy: 390, r: 9, fill: C.gray }, g3));
    t2(g3, X0, 440, '← スコアの高い順に並べたユーザー', '', { 'font-size': 15, fill: C.ink });
    t2(g3, (X0 + xd) / 2, 470, '上位 40%', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.tlab = txt(g3, X1, YT + 10, '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('ŝ') + ' = ' + m('s') + ' · ' + m('σ') + '(' + m('t') + '(' + m('s') + ' − ' + m('d') + '))', { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 172, m('d') + '：上位 40% の境目のスコア', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 198, '（各反復で並べ替えて求める）', '', { 'font-size': 14, fill: C.muted });
    t2(p3, PX, 246, '温度 ' + m('t') + ' を学習中に上げる', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 272, '論文の実験：0.5 から始め、', '', { 'font-size': 14, fill: C.muted });
    t2(p3, PX, 294, '100 ステップごとに +0.1', '', { 'font-size': 14, fill: C.muted });
    t2(p3, PX, 342, m('d') + ' への勾配は止める', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（曲線の傾きは誇張している）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v1), AUCC on the marketing data =====
    var g4 = S.g[3];
    var rows = [['R-learner G', 0.464, C.gray], ['Duality R-learner', 0.544, C.gray], ['Causal Forest', 0.628, C.a],
                ['Direct Ranking', 0.664, C.b], ['Constrained Ranking', 0.678, C.b]];
    var BX0 = 270, BX1 = 600, LO = 0.40, HI = 0.70, Y0 = 130, DY = 62;
    function bx(v) { return BX0 + (v - LO) / (HI - LO) * (BX1 - BX0); }
    t2(g4, 70, 62, 'AUCC（マーケティングデータ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.4, 0.5, 0.6, 0.7].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 34, y2: Y0 + DY * 4 + 30, stroke: v === 0.5 ? C.ink : C.hair, 'stroke-dasharray': v === 0.5 ? '6 5' : '' }, g4);
      el('text', { x: bx(v), y: Y0 + DY * 4 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    t2(g4, bx(0.5) + 6, Y0 - 40, 'ランダム', '', { 'font-size': 14, fill: C.muted });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: BX0 - 16, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.ln = el('line', { x1: bx(0.5), x2: bx(rw[1]), y1: y, y2: y, stroke: rw[2], 'stroke-width': 5 }, g4);
      o.d = el('circle', { cx: bx(rw[1]), cy: y, r: 10, fill: rw[2] }, g4);
      o.v = el('text', { x: bx(rw[1]) + (rw[1] < 0.5 ? -16 : 16), y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': rw[1] < 0.5 ? 'end' : 'start' }, g4);
      o.v.textContent = rw[1].toFixed(3);
      o.t0 = 25 + i * 0.7;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'Duality R-learner との比', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 160, '+24.6%', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 196, '制約つきランキング', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 250, '+22.1%', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 280, 'Direct Ranking Model', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 330, 'Causal Forest（比で順位）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 354, 'は 0.628（+15.4%）', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 2（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2020';
    el('text', { x: 480, y: 210, 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Heterogeneous Causal Learning for';
    el('text', { x: 480, y: 252, 'font-size': 31, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Effectiveness Optimization in User Marketing';
    t2(g5, 480, 300, 'ユーザーマーケティングの費用対効果を最適化する異質因果学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Will Y. Zou · Shuyang Du · James Lee · Jan Pedersen';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2004.09702';
    t2(g5, 480, 468, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, then ratios, then ranks
    S.rows1.forEach(function (o, i) {
      o.r.setAttribute('width', o.rw * seg(t, 0.8 + i * 0.15, 2.0 + i * 0.15));
      o.c.setAttribute('width', o.cw * seg(t, 1.6 + i * 0.15, 2.8 + i * 0.15));
      o.q.setAttribute('opacity', seg(t, 3.4 + i * 0.12, 3.9 + i * 0.12));
      o.k.setAttribute('opacity', seg(t, 4.8, 5.4));
    });
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // scene 2: weights move from uniform to softmax(score); loss bar shrinks
    var k2 = seg(t, 9.6, 13.6);
    S.arms.forEach(function (arm) {
      var w = arm.map(function (d) { return Math.exp(k2 * d.s); });
      var sum = w.reduce(function (a, b) { return a + b; }, 0);
      arm.forEach(function (d, i) {
        var p = w[i] / sum;
        d.c.setAttribute('r', 16 * Math.sqrt(8 * p));
        d.c.setAttribute('fill', d.s > 0 ? H.mix(C.gray, C.b, k2) : C.gray);
      });
    });
    S.loss.setAttribute('width', 330 * (1 - 0.5 * k2));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: temperature rises, curve sharpens, dots below the cut fade
    var k3 = seg(t, 17.5, 22), tv = 1.5 + k3 * 22;
    var d = '';
    for (var j = 0; j <= 120; j++) {
      var x = 100 + j * 4, sv = 1 - 2 * (x - 100) / 480;
      var v = 1 / (1 + Math.exp(-tv * (sv - S.qd)));
      d += (j ? 'L' : 'M') + x.toFixed(1) + ',' + S.qy(v).toFixed(1);
    }
    S.curve.setAttribute('d', d);
    S.curve.setAttribute('opacity', seg(t, 16.8, 17.4));
    S.qdots.forEach(function (c, i) {
      var v = 1 / (1 + Math.exp(-tv * (S.qs(i) - S.qd)));
      c.setAttribute('fill', H.mix(C.gray, C.b, v * seg(t, 16.8, 17.4)));
    });
    S.tlab.textContent = k3 < 0.5 ? '温度 t：低' : '温度 t：高';
    S.tlab.setAttribute('opacity', seg(t, 17, 17.5));
    S.p3.setAttribute('opacity', seg(t, 17.2, 18));
    // scene 4: rows appear in order, then the numbers on the right
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.ln.setAttribute('opacity', s); o.d.setAttribute('opacity', s); o.v.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
