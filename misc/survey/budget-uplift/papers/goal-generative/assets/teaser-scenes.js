// =====================================================================
// teaser-scenes.js — Chen et al. (KDD 2026), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic with toy coin amounts (labelled 模式図).
// Scene 2 uses the decomposition example printed in the paper's Fig. 2 (656 = 400 + 200 + 50 + 6);
//   the weights are log10(v + 1) from the paper's definition of omega_t (delta not shown).
// Scene 3 is a schematic: the expert order (0 -> 1, 2 -> 3 as lambda grows) follows the appendix text;
//   the reward values are toy numbers.
// Scene 4 uses the numbers printed in Table 1 (arXiv v1, IA dataset) and the online A/B test in Sec. 4.5.
// Colours: orange = the cost side (coin cost c and its price, the Lagrange multiplier lambda);
//          blue   = the paper's method GOAL; baselines are grey.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'インセンティブ広告では、毎回配る<span class="A">コインの額</span>が期間全体の ROI の下限を守れるかどうかを左右する。', en: '' },
    { ja: '<span class="B">GOAL</span> は額を 400 + 200 + 50 + 6 のようなトークン列に分け、上位の桁から生成する。', en: '' },
    { ja: '<span class="A">λ</span> を入力に加えて一つの方策を学び、報酬は同じ λ の応答の中だけで標準化する。', en: '' },
    { ja: 'IA データでは、<span class="B">GOAL</span> の ROI 違反率が比較手法の中で最も低く、平均収益は最も高かった。', en: '' },
    { ja: 'ROI の制約を価格 λ に置き換え、λ を入力にとる一つの生成方策で、配る額を決める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function SUP(c) { return '<tspan font-size="70%" baseline-shift="super">' + c + '</tspan>'; }
  function SUB(c) { return '<tspan font-size="70%" baseline-shift="sub">' + c + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: coins per interaction and the running ROI against tau (toy) =====
    var g1 = S.g[0];
    var coins = [300, 120, 900, 60, 1500, 200, 80, 2400, 150, 90];      // toy amounts
    var rev = [1500, 700, 2600, 400, 3300, 1000, 500, 3600, 800, 500];  // toy revenue
    var X1 = 90, DX = 48, BASE = 300, SCC = 0.085;
    T(g1, 70, 60, '1 回ごとに配るコイン（模式図）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X1 - 20, x2: X1 + DX * 10, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.c1 = coins.map(function (c, i) {
      var r = el('rect', { x: X1 + DX * i, y: BASE, width: 30, height: 0, rx: 3, fill: C.a }, g1);
      return { r: r, h: c * SCC, t0: 0.8 + i * 0.35 };
    });
    T(g1, X1 + DX * 10, BASE + 24, '時間 →', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    // running ROI
    var TAU = 3;
    function ry(v) { return 500 - (v - 2) * 40; }
    T(g1, 70, 350, 'それまでの ROI = Σ' + m('r') + ' / Σ' + m('c'), { 'font-size': 16, fill: C.ink });
    el('line', { x1: X1 - 20, x2: X1 + DX * 10, y1: ry(TAU), y2: ry(TAU), stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g1);
    T(g1, X1 + DX * 10 + 8, ry(TAU) + 5, m('τ'), { 'font-size': 18, fill: C.a });
    var sr = 0, sc = 0, pts = [];
    coins.forEach(function (c, i) { sr += rev[i]; sc += c; pts.push([X1 + DX * i + 15, ry(sr / sc)]); });
    S.roiPts = pts;
    S.roi1 = el('polyline', { points: '', fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, g1);
    S.dots1 = pts.map(function (p) { return el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: C.ink, opacity: 0 }, g1); });
    var p1 = S.p1 = el('g', {}, g1);
    txt(p1, PX, 120, 'Σ' + m('r') + SUB('i') + ' / Σ' + m('c') + SUB('i') + ' ≥ ' + m('τ'), { 'font-size': 28, 'font-weight': 600, fill: C.ink });
    T(p1, PX, 170, '比の制約なので、どの回の額も', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 194, '期間全体の ROI を左右する。', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 244, '額は 1〜3,000 コインと幅が', { 'font-size': 16, fill: C.a });
    T(p1, PX, 268, '広く、分布の裾も重い。', { 'font-size': 16, fill: C.a });
    T(p1, PX, 318, '疲労のように、過去の配り方が', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 342, '後の反応を変える効果もある。', { 'font-size': 16, fill: C.ink });
    T(g1, 940, 520, '模式図（額と ROI は解説者が置いた値）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: 656 = 400 + 200 + 50 + 6 =====
    var g2 = S.g[1], X2 = 70, W2 = 560, SC2 = W2 / 656, Y2 = 130;
    T(g2, X2, 84, '配る額 656 コイン', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    el('rect', { x: X2, y: Y2, width: W2, height: 46, rx: 4, fill: 'none', stroke: C.ink, 'stroke-width': 1.5 }, g2);
    var toks = [400, 200, 50, 6], shades = [0, 0.3, 0.55, 0.75], x = X2;
    S.tok2 = toks.map(function (v, i) {
      var o = {}, w = v * SC2;
      o.blk = el('rect', { x: x, y: Y2, width: w, height: 46, fill: H.mix(C.b, '#FFFFFF', shades[i]) }, g2);
      var cx = 100 + i * 120;
      o.box = el('g', {}, g2);
      el('rect', { x: cx - 46, y: 250, width: 92, height: 54, rx: 8, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, o.box);
      T(o.box, cx, 284, String(v), { 'font-size': 22, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      T(o.box, cx, 236, m('g') + SUP(String(i + 1)), { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      if (i < 3) T(o.box, cx + 60, 284, '+', { 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' });
      o.link = el('line', { x1: x + w / 2, y1: Y2 + 48, x2: cx, y2: 248, stroke: C.muted, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, o.box);
      // weight bar: log10(v + 1)
      var wv = Math.log10(v + 1);
      o.wbar = el('rect', { x: cx - 18, y: 470, width: 36, height: 0, fill: C.b }, g2);
      o.wh = wv * 40;
      o.wlab = T(g2, cx, 462 - o.wh, wv.toFixed(2), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      o.t0 = 9.2 + i * 0.9;
      x += w;
      return o;
    });
    S.eos2 = el('g', {}, g2);
    el('rect', { x: 534, y: 250, width: 76, height: 54, rx: 8, fill: C.panel }, S.eos2);
    T(S.eos2, 572, 284, 'EOS', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    S.w2 = el('g', {}, g2);
    T(S.w2, X2, 338, '損失の重み ' + m('ω') + ' = log' + SUB('10') + '(' + m('v') + ' + 1) + ' + m('δ') + '（' + m('δ') + ' は省略）', { 'font-size': 16, fill: C.ink });
    el('line', { x1: 60, x2: 520, y1: 470, y2: 470, stroke: C.ink, 'stroke-width': 1.5 }, S.w2);
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 120, '残りの額以下で最大の', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 144, 'トークンを順に選ぶ。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 194, '先頭が大きさのおおよそ、', { 'font-size': 16, fill: C.b });
    T(p2, PX, 218, '後ろが端数を受け持つ。', { 'font-size': 16, fill: C.b });
    T(p2, PX, 268, '先頭を誤ると額が大きく', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 292, 'ずれるので、値の大きい', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 316, 'トークンほど重く学習する。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 366, '656 = 400 + 200 + 50 + 6 は', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 390, '論文 Fig. 2 の例。', { 'font-size': 15, fill: C.muted });

    // ===== scene 3: lambda as input; experts switch; per-lambda normalisation (schematic) =====
    var g3 = S.g[2], LX0 = 110, LX1 = 560, LY = 92;
    T(g3, 70, 56, m('λ') + ' を入力に加える', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: LX0, x2: LX1, y1: LY, y2: LY, stroke: C.hair, 'stroke-width': 6, 'stroke-linecap': 'round' }, g3);
    T(g3, LX0, LY + 30, '0（緩い）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    T(g3, LX1, LY + 30, m('λ') + SUB('max') + '（厳しい）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.knob3 = el('circle', { cx: LX0, cy: LY, r: 11, fill: C.a }, g3);
    S.ex3 = [0, 1, 2, 3].map(function (i) {
      var bx = 110 + i * 118;
      var r = el('rect', { x: bx - 46, y: 140, width: 92, height: 44, rx: 8, fill: '#fff', stroke: C.hair, 'stroke-width': 2 }, g3);
      T(g3, bx, 168, '専門家 ' + i, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return r;
    });
    // groups
    T(g3, 70, 250, '同じ状態への 4 つの応答の報酬 ' + m('R') + ' − ' + m('λC'), { 'font-size': 16, fill: C.ink });
    var GY = [320, 440], gl = ['小さい ' + m('λ'), '大きい ' + m('λ')];
    var raw = [[2.6, 3.4, 2.2, 3.0], [-1.0, -0.4, -1.4, -0.6]];   // toy
    var ZX = 380, UX = 60;   // axis centre and px per unit
    S.grp3 = raw.map(function (vals, gi) {
      var y = GY[gi];
      T(g3, 70, y + 5, gl[gi], { 'font-size': 15, fill: C.a });
      el('line', { x1: 160, x2: 600, y1: y, y2: y, stroke: C.hair, 'stroke-width': 1.5 }, g3);
      var mu = vals.reduce(function (a, b) { return a + b; }, 0) / 4;
      var sd = Math.sqrt(vals.reduce(function (a, b) { return a + (b - mu) * (b - mu); }, 0) / 4);
      return vals.map(function (v) {
        var c = el('circle', { cx: 0, cy: y, r: 9, fill: C.b, opacity: 0.85 }, g3);
        return { c: c, x0: ZX + v * UX * 0.55, x1: ZX + ((v - mu) / sd) * UX };
      });
    });
    el('line', { x1: ZX, x2: ZX, y1: 290, y2: 470, stroke: C.muted, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g3);
    S.ztag3 = T(g3, ZX, 494, 'グループ内の平均', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 100, m('λ') + ' を区間から抜き出して', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 124, '一つの方策を学ぶ。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 172, m('λ') + ' に応じて、ゲートが', { 'font-size': 16, fill: C.a });
    T(p3, PX, 196, '選ぶ専門家が替わる。', { 'font-size': 16, fill: C.a });
    S.p3b = el('g', {}, g3);
    T(S.p3b, PX, 290, m('λ') + ' が大きいと報酬全体が', { 'font-size': 16, fill: C.ink });
    T(S.p3b, PX, 314, '下がる。そこで同じ ' + m('λ'), { 'font-size': 16, fill: C.ink });
    T(S.p3b, PX, 338, 'の中だけで標準化して、', { 'font-size': 16, fill: C.ink });
    T(S.p3b, PX, 362, '優位度をそろえる。', { 'font-size': 16, fill: C.ink });
    T(S.p3b, PX, 410, '運用時は ROI が目標以上に', { 'font-size': 15, fill: C.muted });
    T(S.p3b, PX, 432, 'なる ' + m('λ') + '* を二分探索で選ぶ。', { 'font-size': 15, fill: C.muted });
    T(g3, 940, 520, '模式図（専門家の順は論文付録、報酬は解説者が置いた値）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (arXiv v1), IA dataset =====
    var g4 = S.g[3], X0 = 210, SC = 12, Y0 = 130, DY = 52;
    var rows = [
      ['GOAL（提案）', 12.24, '0.32', C.b], ['CDT', 15.00, '0.22', C.gray], ['DT', 18.23, '0.27', C.gray],
      ['TREBI', 20.21, '0.19', C.gray], ['CAL', 21.82, '0.19', C.gray], ['IQL', 24.69, '0.25', C.gray]
    ];
    T(g4, 30, 64, 'ROI 違反率 RVR（%、小さいほどよい）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(g4, 660, 96, '平均収益', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    [0, 10, 20].forEach(function (v) {
      el('line', { x1: X0 + v * SC, x2: X0 + v * SC, y1: Y0 - 24, y2: Y0 + DY * 5 + 24, stroke: C.hair }, g4);
      el('text', { x: X0 + v * SC, y: Y0 + DY * 5 + 46, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, o = { full: r[1] * SC };
      T(g4, X0 - 14, y + 5, r[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': i === 0 ? 650 : 400 });
      o.bar = el('rect', { x: X0, y: y - 13, width: 0, height: 26, rx: 3, fill: r[3] }, g4);
      o.v = el('text', { x: X0 + r[1] * SC + 8, y: y + 5, 'font-size': 15, fill: C.ink }, g4); o.v.textContent = r[1].toFixed(2) + '%';
      o.rv = el('text', { x: 660, y: y + 5, 'font-size': 15, fill: i === 0 ? C.b : C.ink, 'text-anchor': 'end', 'font-weight': i === 0 ? 650 : 400 }, g4); o.rv.textContent = r[2];
      o.t0 = 25 + i * 0.45;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 104, 'IA データ（λ = 0.5）', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 146, '0.32', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 82, 146, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 110, 146, '0.27', { 'font-size': 34, 'font-weight': 650, fill: C.muted });
    T(p4, PX, 180, '平均収益（USD）、DT 比 +18.52%', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 214, 'ROI 4.93（DT 4.74）', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 270, '4 週間のオンライン A/B テスト', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 308, '収益 +2.559%', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    txt(p4, PX, 344, 'ROI +2.184%', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    T(p4, PX, 378, '本番の基準方策との比較、' + m('p') + ' = 0.03', { 'font-size': 14, fill: C.muted });
    T(g4, 940, 520, '論文 Table 1（arXiv v1）と第 4.5 節の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2026';
    el('text', { x: 480, y: 202, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Generative Optimization for Incentivized';
    el('text', { x: 480, y: 244, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Advertising with Global Level Constraints';
    T(g5, 480, 290, '大域制約つきインセンティブ広告の生成的最適化', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Gege Chen · Ning Luo · Hao Jiang · Da Li · Wenzheng Shu · Teng Sha';
    el('text', { x: 480, y: 366, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yanxiang Zeng · Wenxin Tai · Fan Zhou · Xialong Liu';
    el('text', { x: 480, y: 418, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2608.04421';
    T(g5, 480, 472, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: coins appear one by one, the running ROI follows
    var shown = [];
    S.c1.forEach(function (o, i) {
      var k = seg(t, o.t0, o.t0 + 0.35);
      o.r.setAttribute('height', o.h * k); o.r.setAttribute('y', 300 - o.h * k);
      var d = seg(t, o.t0 + 0.2, o.t0 + 0.4);
      S.dots1[i].setAttribute('opacity', d);
      if (d > 0) shown.push(S.roiPts[i].join(','));
    });
    S.roi1.setAttribute('points', shown.join(' '));
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    // scene 2: blocks split off in order, then the weights
    S.tok2.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.5);
      o.blk.setAttribute('opacity', k); o.box.setAttribute('opacity', k);
      var w = seg(t, 13 + (o.t0 - 9.2) * 0.4, 13.6 + (o.t0 - 9.2) * 0.4);
      o.wbar.setAttribute('height', o.wh * w); o.wbar.setAttribute('y', 470 - o.wh * w);
      o.wlab.setAttribute('opacity', w);
    });
    S.eos2.setAttribute('opacity', seg(t, 12.8, 13.2));
    S.w2.setAttribute('opacity', seg(t, 12.8, 13.3));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: lambda sweeps, experts light up in turn; then groups are normalised
    var lam = seg(t, 16.8, 20.2);
    S.knob3.setAttribute('cx', 110 + lam * 450);
    var act = lam < 0.25 ? 0 : lam < 0.5 ? 1 : lam < 0.75 ? 2 : 3;
    S.ex3.forEach(function (r, i) {
      var on = i === act && t > 16.4;
      r.setAttribute('stroke', on ? C.a : C.hair);
      r.setAttribute('fill', on ? '#FCEBDF' : '#fff');
    });
    var nz = seg(t, 21.2, 22.4);
    S.grp3.forEach(function (gr, gi) {
      gr.forEach(function (d, i) {
        d.c.setAttribute('cx', d.x0 + (d.x1 - d.x0) * nz);
        d.c.setAttribute('opacity', 0.85 * seg(t, 18.6 + gi * 0.5 + i * 0.1, 19.0 + gi * 0.5 + i * 0.1));
      });
    });
    S.ztag3.setAttribute('opacity', nz);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    S.p3b.setAttribute('opacity', seg(t, 20.6, 21.4));
    // scene 4: bars grow in order
    S.rows4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6);
      o.bar.setAttribute('width', o.full * k);
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
      o.rv.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
