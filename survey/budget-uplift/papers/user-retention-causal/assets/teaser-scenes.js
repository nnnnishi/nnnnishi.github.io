// =====================================================================
// teaser-scenes.js — Du, Lee & Ghaffarizadeh (KDD 2019 WS, PMLR 104), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 2 and Table 3 of the PMLR version.
// Colours: orange = incremental cost / existing estimators; blue = incremental value (retention) / DRM.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来は離反しそうな人や不満の残る乗車をした人にクーポンを配っていた。', en: '' },
    { ja: 'クーポンは継続を増やすが純コストも変えるので、<span class="B">継続の増分</span>と<span class="A">コストの増分</span>の比で選ぶ。', en: '' },
    { ja: 'DRM は重みをつけた集団の<span class="A">増分コスト</span>÷<span class="B">増分価値</span>を損失にして、スコアを直接学習する。', en: '' },
    { ja: 'テストデータの AUCC でも本番 3 都市の効率でも、<span class="B">DRM</span> が<span class="A">既存の推定器</span>を上回った。', en: '' },
    { ja: '配る相手は継続とコストの両方の処置効果のつり合いで選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  // tau with a superscript; the text after it goes inside the tspan that resets the baseline
  function T(s, rest) { return '<tspan ' + MI + '>τ</tspan><tspan ' + MI + ' font-size="13" dy="-8">' + s + '</tspan><tspan dy="8">' + (rest || '\u00a0') + '</tspan>'; }

  // scene 3 toy users: retention effect, cost effect (explainer-chosen)
  var TR = [0.10, 0.08, 0.12, 0.05, 0.09, 0.03, 0.11, 0.06];
  var TC = [1.0, 2.0, 0.8, 2.5, 1.2, 2.0, 0.9, 1.5];
  var EFF = TR.map(function (r, i) { return Math.log(r / TC[i]); });
  var EM = EFF.reduce(function (a, b) { return a + b; }, 0) / EFF.length;
  function weights(k) {
    var w = EFF.map(function (e) { return Math.exp(k * (e - EM)); });
    var s = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (v) { return v / s; });
  }
  function loss(w) {
    var c = 0, r = 0;
    w.forEach(function (v, i) { c += v * TC[i]; r += v * TR[i]; });
    return c / r;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: users sorted by predicted churn risk, top share gets a coupon =====
    var g1 = S.g[0];
    var risk = [0.92, 0.85, 0.80, 0.74, 0.66, 0.58, 0.47, 0.38, 0.27, 0.15];
    S.bars1 = [];
    t2(g1, 90, 52, 'ユーザー（予測した離反リスクの高い順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    risk.forEach(function (v, i) {
      var y = 78 + i * 40;
      el('circle', { cx: 104, cy: y + 12, r: 10, fill: C.gray }, g1);
      S.bars1.push(el('rect', { x: 130, y: y, width: v * 440, height: 24, rx: 4, fill: C.gray }, g1));
    });
    S.cut1 = el('line', { x1: 80, x2: 600, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 598, 0, '上位 4 人に配る', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 110, width: 18, height: 18, rx: 3, fill: C.a }, p1);
    t2(p1, PX + 28, 125, '配る', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 145, width: 18, height: 18, rx: 3, fill: C.gray }, p1);
    t2(p1, PX + 28, 160, '配らない', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 215, '並べる基準：離反の予測、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 241, 'または不満の残る体験', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 290, '配ったら継続がどれだけ増え、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 314, 'コストがどれだけ変わるかは', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 338, '順位に入らない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two users, same retention effect, different cost effect =====
    var g2 = S.g[1];
    var U = 70;   // px per dollar
    S.cards = [['A', 2.0, 90], ['B', 1.0, 350]].map(function (c) {
      var x = c[2], o = {};
      el('rect', { x: x, y: 70, width: 240, height: 390, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      txt(g2, x + 20, 112, 'ユーザー ' + c[0], { 'font-size': 22, 'font-weight': 650, fill: C.ink });
      t2(g2, x + 20, 158, '継続の増分 ' + T('r', ' = +10 pt'), '', { 'font-size': 16, fill: C.ink });
      el('rect', { x: x + 20, y: 170, width: 140, height: 18, rx: 3, fill: C.b }, g2);
      t2(g2, x + 20, 236, '純コストの増分 ' + T('c'), '', { 'font-size': 16, fill: C.ink });
      t2(g2, x + 20, 260, '= ' + c[1].toFixed(1) + ' ドル', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
      o.cost = el('rect', { x: x + 20, y: 272, width: 0, height: 18, rx: 3, fill: C.a }, g2);
      o.full = c[1] * U;
      var eff = 10 / c[1];
      o.res = t2(g2, x + 20, 352, '効率 ' + T('r', ' / ') + T('c'), '', { 'font-size': 17, fill: C.ink });
      o.res2 = t2(g2, x + 20, 384, '= 1 ドルあたり ' + eff + ' pt', '', { 'font-size': 18, 'font-weight': 650, fill: eff > 6 ? C.b : C.a });
      o.res3 = t2(g2, x + 20, 424, eff > 6 ? '→ 先に配る' : '→ 後回し', '', { 'font-size': 18, 'font-weight': 650, fill: eff > 6 ? C.b : C.a });
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 130, '純コストも処置効果', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 180, '利用が増えれば、会社の', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 206, '純コストも変わる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 250, '継続の効果が同じなら、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 276, 'コストの増分が小さい', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 302, '人を先に選ぶ。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: DRM weights concentrate on efficient users, loss falls =====
    var g3 = S.g[2];
    var XS = 190, DX = 52;
    t2(g3, 70, 128, '重み ' + m('p'), '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, 70, 290, T('r', '（継続）'), '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g3, 70, 410, T('c', '（コスト）'), '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    el('line', { x1: XS - 30, x2: XS + DX * 7 + 30, y1: 210, y2: 210, stroke: C.hair }, g3);
    S.w3 = TR.map(function (r, i) {
      var x = XS + DX * i;
      el('rect', { x: x - 14, y: 330 - r * 600, width: 28, height: r * 600, rx: 3, fill: C.b }, g3);
      el('rect', { x: x - 14, y: 360, width: 28, height: TC[i] * 40, rx: 3, fill: C.a }, g3);
      el('circle', { cx: x, cy: 478, r: 10, fill: C.gray }, g3);
      return el('rect', { x: x - 16, y: 210, width: 32, height: 0, rx: 3, fill: C.gray }, g3);
    });
    el('line', { x1: XS - 30, x2: XS + DX * 7 + 30, y1: 330, y2: 330, stroke: C.ink }, g3);
    el('line', { x1: XS - 30, x2: XS + DX * 7 + 30, y1: 360, y2: 360, stroke: C.ink }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '損失', '', { 'font-size': 17, fill: C.muted });
    t2(p3, PX, 148, '<tspan fill="#C2410C">増分コスト</tspan> ÷ <tspan fill="#1D4ED8">増分価値</tspan>', '', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    S.lossVal = txt(p3, PX, 214, '', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 266, '重みは処置群・対照群の', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 292, 'それぞれで softmax をとる。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 336, '費用対効果のよい人に重みが', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 362, '集まるほど損失が下がる。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（8 人の効果は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (test AUCC) and Table 3 (online gains), PMLR 104 =====
    var g4 = S.g[3];
    t2(g4, 70, 74, 'テストデータの AUCC（Table 2）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var X0 = 250, X1 = 600;
    function cx(v) { return X0 + v * (X1 - X0); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: 110, y2: 400, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: 426, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    S.bars4 = [['DRM', 0.65, C.b], ['因果フォレスト', 0.61, C.a], ['R-learner', 0.59, C.a]].map(function (r, i) {
      var y = 140 + i * 90, o = {};
      t2(g4, X0 - 16, y + 30, r[0], '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: X0, y: y, width: 0, height: 44, rx: 4, fill: r[2] }, g4);
      o.full = cx(r[1]) - X0;
      o.lab = txt(g4, cx(r[1]) - 10, y + 30, r[1].toFixed(2), { 'font-size': 19, 'font-weight': 650, fill: '#fff', 'text-anchor': 'end' });
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 100, '本番 3 都市（Table 3）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 128, '探索群と比べた効率の改善率', '', { 'font-size': 15, fill: C.muted });
    txt(p4, 820, 172, 'DRM', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    t2(p4, 950, 172, '因果フォレスト', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'end' });
    [['A', '75.3%', '60.2%'], ['B', '61.5%', '54.3%'], ['C', '101.2%', '80.4%']].forEach(function (r, i) {
      var y = 214 + i * 40;
      t2(p4, PX, y, '都市 ' + r[0], '', { 'font-size': 17, fill: C.ink });
      txt(p4, 820, y, r[1], { 'font-size': 19, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
      txt(p4, 950, y, r[2], { 'font-size': 19, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
    });
    t2(p4, PX, 370, '学習データの AUCC は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 394, 'DRM 0.68、因果フォレスト 0.87', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2・Table 3（PMLR 104）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2019 WORKSHOP ON CAUSAL DISCOVERY · PMLR 104';
    el('text', { x: 480, y: 222, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Improve User Retention';
    el('text', { x: 480, y: 268, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'with Causal Learning';
    t2(g5, 480, 314, '因果学習でユーザーの継続を高める', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 364, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Shuyang Du · James Lee · Farzin Ghaffarizadeh';
    el('text', { x: 480, y: 420, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v104/du19a.html';
    t2(g5, 480, 476, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: cut line slides down to after the 4th user, top bars turn orange
    var yc = 70 + seg(t, 1.2, 3.5) * (78 + 4 * 40 - 8 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.4));
    S.cutLab1.setAttribute('transform', 'translate(0,' + (yc + 22) + ')');
    S.cutLab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 4 ? H.mix(C.gray, C.a, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: cost bars grow, then efficiency and verdicts
    S.cards.forEach(function (o, i) {
      o.cost.setAttribute('width', o.full * seg(t, 9.6 + i * 0.8, 11.4 + i * 0.8));
      o.res.setAttribute('opacity', seg(t, 12.4, 13));
      o.res2.setAttribute('opacity', seg(t, 12.6, 13.2));
      o.res3.setAttribute('opacity', seg(t, 13.4, 14));
    });
    // scene 3: weights move from uniform to concentrated on efficient users
    var k = 3 * seg(t, 18, 22);
    var w = weights(k);
    S.w3.forEach(function (r, i) {
      var h = w[i] * 300;
      r.setAttribute('y', 210 - h); r.setAttribute('height', h);
      r.setAttribute('fill', H.mix(C.gray, C.b, seg(t, 18, 22) * Math.min(1, w[i] * 4)));
    });
    S.lossVal.textContent = loss(w).toFixed(1);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: bars grow in order, then the online table
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.9);
      o.bar.setAttribute('width', o.full * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.7, o.t0 + 1.1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
