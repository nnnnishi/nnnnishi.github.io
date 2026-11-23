// =====================================================================
// teaser-scenes.js — UpliftBench (Li, arXiv 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 2 uses the all-100-IHDP numbers (abstract, Sec. 5.3, Appendix E; arXiv v1).
// Scene 4 uses the Jobs selector-ladder gains and the threshold-calibration regrets (Sec. 5.2, Appendix A/E).
// Colours: orange = proxy ranking metrics / rank-only selection; blue = reference objective and what tracks it.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '反実仮想は観測できないので、モデルは <span class="A">Qini などの代理指標</span>で並べて選ばれる。', en: '' },
    { ja: '連続アウトカムの IHDP では、<span class="A">Qini</span> の順位は効果推定の正確さとほぼ無関係で、<span class="B">AUUC</span> は相関した。', en: '' },
    { ja: '順位だけを見る指標はスコアを一律にずらしても変わらないが、<span class="B">符号で配る相手</span>は変わる。', en: '' },
    { ja: 'Jobs では<span class="B">方策リスクで選ぶ</span>とランダムより良くなったが、<span class="A">順位の指標</span>で選んでも良くならなかった。', en: '' },
    { ja: '指標はアウトカムの型と配り方に合わせて先に決め、それからモデルを選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: a leaderboard by Qini, the top model is picked =====
    var g1 = S.g[0];
    var models = [['モデル 1', 0.92], ['モデル 2', 0.78], ['モデル 3', 0.66], ['モデル 4', 0.51], ['モデル 5', 0.40], ['モデル 6', 0.27]];
    t2(g1, 90, 62, '候補モデルの Qini（大きい順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars1 = models.map(function (md, i) {
      var y = 92 + i * 60;
      t2(g1, 196, y + 25, md[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var r = el('rect', { x: 212, y: y + 6, width: 0, height: 28, rx: 4, fill: C.gray }, g1);
      return { r: r, w: md[1] * 380, t0: 1.0 + i * 0.25 };
    });
    S.pick1 = t2(g1, 212 + 0.92 * 380 + 14, 92 + 26, '← 採用', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '同じ顧客で、処置した', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 146, 'ときとしないときの結果は', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 172, '両方は観測できない。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, 'よく使われる代理指標', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 256, 'Qini ・ AUUC ・ uplift@' + m('k'), '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 310, '代理指標で上位なら、', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 334, '実際の目的にも合う', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 358, '…という暗黙の前提。', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（値は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: IHDP, 100 realizations, rank correlation with -sqrt(PEHE) =====
    var g2 = S.g[1];
    var X0 = 250, X1 = 600, LO = -0.2, HI = 1.0;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g2, 70, 58, '効果推定の正確さとの順位相関（IHDP 100 実現値）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: 90, y2: 420, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g2);
      el('text', { x: cx(v), y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g2).textContent = (v === 0 ? '0' : '+' + v.toFixed(2));
    });
    var rows2 = [
      ['Qini', 0.07, -0.03, 0.16, C.a],
      ['AUUC', 0.56, null, null, C.b],
      ['uplift@k', 0.64, null, null, C.b],
      ['累積ゲイン AUUC', 0.73, 0.66, 0.79, C.b]
    ];
    S.rows2 = rows2.map(function (rw, i) {
      var y = 130 + i * 76, o = {};
      t2(g2, X0 - 16, y + 6, rw[0] === 'uplift@k' ? 'uplift@' + m('k') : rw[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: cx(0), y: y - 14, width: 0, height: 28, rx: 3, fill: rw[4] }, g2);
      o.w = cx(rw[1]) - cx(0);
      o.val = txt(g2, cx(rw[1]) + 10, y + 6, '+' + rw[1].toFixed(2), { 'font-size': 16, 'font-weight': 650, fill: rw[4] });
      if (rw[2] != null) {
        o.ci = el('line', { x1: cx(rw[2]), x2: cx(rw[3]), y1: y + 22, y2: y + 22, stroke: C.ink, 'stroke-width': 2 }, g2);
        if (i === 0) o.val.setAttribute('x', cx(rw[3]) + 10);
        else o.val.setAttribute('x', cx(rw[3]) + 10);
      }
      o.t0 = 9.2 + i * 0.6;
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, 'AUUC − Qini（対にした差）', '', { 'font-size': 16, fill: C.muted });
    txt(p2, PX, 162, '+0.49', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 192, '95% 区間 [+0.40, +0.59]', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 218, '100 実現値中 80 で正', '', { 'font-size': 15, fill: C.ink });
    t2(p2, PX, 270, 'Qini の区間は 0 を含む', '', { 'font-size': 16, fill: C.a });
    t2(p2, PX, 296, '[−0.03, +0.16]', '', { 'font-size': 16, fill: C.a });
    t2(p2, PX, 346, 'ACIC 2016 と Revenue-Synthetic', '', { 'font-size': 14, fill: C.muted });
    t2(p2, PX, 368, 'では、この差は 0 と区別できない', '', { 'font-size': 14, fill: C.muted });
    t2(g2, 940, 520, '論文の本文（arXiv v1）の数値から作図。横線は 95% 区間', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: shifting all scores leaves the ranking but changes the sign policy =====
    var g3 = S.g[2];
    var Z = 330, U = 180;
    S.A3 = [-0.9, -0.5, 0.15, 0.3, 0.45, 0.7, 1.0, 1.3];
    el('line', { x1: 60, x2: 600, y1: 160, y2: 160, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: 60, x2: 600, y1: 320, y2: 320, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: Z, x2: Z, y1: 92, y2: 372, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g3);
    t2(g3, Z + 8, 84, '閾値 ' + m('τ̂') + ' = 0', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 60, 124, 'モデル A', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.labB = t2(g3, 60, 284, 'モデル B = A − 0.00', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.dA = S.A3.map(function (v, i) {
      var c = el('circle', { cx: Z + v * U, cy: 160, r: 11, fill: v >= 0 ? C.b : C.gray }, g3);
      el('text', { x: Z + v * U, y: 194, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g3).textContent = 8 - i;
      return c;
    });
    S.dB = S.A3.map(function (v, i) {
      var c = el('circle', { cx: Z + v * U, cy: 320, r: 11, fill: C.b }, g3);
      var t = el('text', { x: Z + v * U, y: 354, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g3); t.textContent = 8 - i;
      return { c: c, t: t };
    });
    t2(g3, 60, 420, '数字は順位（A と B で同じ）', '', { 'font-size': 14, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, '処置する人数', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 156, 'A：6 人', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    S.nB = t2(p3, PX, 190, 'B：6 人', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 246, 'Qini・AUUC・uplift@' + m('k'), '', { 'font-size': 16, fill: C.a });
    t2(p3, PX, 272, '→ A と B で同じ値', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(p3, PX, 324, '符号で配るなら、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 350, 'スコアの水準が要る', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 376, '（論文の Prop. 5.3）', '', { 'font-size': 14, fill: C.muted });
    t2(g3, 940, 520, '模式図（スコアとずらす量は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Jobs, reduction in policy risk vs random selection, 95% CI =====
    var g4 = S.g[3];
    var Y0 = 250, Y1 = 600, L4 = -0.02, H4 = 0.04;
    function dx(v) { return Y0 + (v - L4) / (H4 - L4) * (Y1 - Y0); }
    t2(g4, 70, 58, 'ランダムに選ぶ場合と比べた方策リスクの減り方（Jobs）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [-0.02, 0, 0.02, 0.04].forEach(function (v) {
      el('line', { x1: dx(v), x2: dx(v), y1: 92, y2: 410, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      el('text', { x: dx(v), y: 436, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
    });
    var rows4 = [
      ['方策リスクで選ぶ', 0.0209, 0.0071, 0.0358, C.b],
      ['Qini で選ぶ', -0.0070, -0.0195, 0.0073, C.a],
      ['AUUC で選ぶ', -0.0070, -0.0195, 0.0073, C.a],
      ['uplift@' + m('k') + ' で選ぶ', -0.0050, -0.0183, 0.0097, C.a]
    ];
    S.rows4 = rows4.map(function (rw, i) {
      var y = 130 + i * 72, o = {};
      t2(g4, Y0 - 16, y + 6, rw[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.ci = el('line', { x1: dx(rw[2]), x2: dx(rw[3]), y1: y, y2: y, stroke: rw[4], 'stroke-width': 3 }, g4);
      o.dot = el('circle', { cx: dx(rw[1]), cy: y, r: 10, fill: rw[4] }, g4);
      o.val = txt(g4, dx(rw[1]), y - 18, (rw[1] > 0 ? '+' : '−') + Math.abs(rw[1]).toFixed(4), { 'font-size': 15, 'font-weight': 600, fill: rw[4], 'text-anchor': 'middle' });
      o.t0 = 25 + i * 0.7;
      return o;
    });
    t2(g4, dx(0.04), 466, '良くなる →', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, '閾値を較正すると', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 146, 'Qini で選んだときの後悔', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 190, '0.0253', { 'font-size': 28, 'font-weight': 650, fill: C.a });
    txt(p4, PX + 104, 190, '→', { 'font-size': 24, fill: C.ink });
    txt(p4, PX + 138, 190, '0.0049', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 228, '81% 減', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 282, '10 分割は同じ標本の再分割。', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 304, '論文はこの証拠を', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 326, '「控えめ」と評価している', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 5.2 節と付録（arXiv v1）の数値から作図。横線は 95% 区間', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 136, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2026';
    el('text', { x: 480, y: 196, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'UpliftBench: Revealing Outcome-Regime and';
    el('text', { x: 480, y: 238, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Objective Mismatch in Uplift Evaluation';
    t2(g5, 480, 286, 'アップリフト評価における、アウトカムの型と目的のずれ', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Binshuang Li';
    el('text', { x: 480, y: 394, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/binshuangli/uplift-bench';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, the top one turns orange and is picked
    S.bars1.forEach(function (o, i) {
      o.r.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.8));
      o.r.setAttribute('fill', i === 0 ? H.mix(C.gray, C.a, seg(t, 3.4, 4.0)) : C.gray);
    });
    S.pick1.setAttribute('opacity', seg(t, 3.8, 4.4));
    S.p1.setAttribute('opacity', seg(t, 1.8, 2.6));
    // scene 2: bars grow in order, then the paired gap
    S.rows2.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', Math.max(0, o.w * s));
      o.val.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1.0));
      if (o.ci) o.ci.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1.0));
    });
    S.p2.setAttribute('opacity', seg(t, 12.2, 13.0));
    // scene 3: model B's scores shift left by up to 0.6, dots below 0 turn grey
    var sh = 0.6 * seg(t, 17.5, 20.0);
    var Z = 330, U = 180, n = 0;
    S.dB.forEach(function (o, i) {
      var v = S.A3[i] - sh, x = Z + v * U;
      o.c.setAttribute('cx', x); o.t.setAttribute('x', x);
      o.c.setAttribute('fill', v >= 0 ? C.b : C.gray);
      if (v >= 0) n++;
    });
    S.labB.querySelectorAll('text').forEach(function (e) { if (e.getAttribute('data-l') === 'ja') e.textContent = 'モデル B = A − ' + sh.toFixed(2); });
    S.nB.querySelectorAll('text').forEach(function (e) { if (e.getAttribute('data-l') === 'ja') e.textContent = 'B：' + n + ' 人'; });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.5));
    // scene 4: rows appear in order, then the threshold result
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.ci.setAttribute('opacity', s); o.dot.setAttribute('opacity', s); o.val.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
