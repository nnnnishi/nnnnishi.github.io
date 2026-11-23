// =====================================================================
// teaser-scenes.js — Xiao et al. (CIKM 2019), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 2 (real-world Alipay data) of arXiv v1 (2023-03-02).
// Colours: orange = cost / budget consumption (the λ·c penalty); blue = reward and the paper's constrained MDP.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var ASOFT = '#FCEBDF';

  var CAPTIONS = [
    { ja: '紅包を数日にわたって配り続けると、使われた分の<span class="A">費用</span>が全体の予算に積み上がっていく。', en: '' },
    { ja: '予算制約をラグランジュ緩和すると、各時点の報酬は <span class="B">r</span> − λ<span class="A">c</span> になり、λ が大きいほど安い紅包が選ばれる。', en: '' },
    { ja: '<span class="A">費用</span>は λ について単調に減るので、予算にちょうど収まる λ を二分探索で絞り込める。', en: '' },
    { ja: 'Alipay のデータでは、ランダム配布と同じ報酬を<span class="B">制約つき MDP</span> は 9.40% 少ない費用で達成した。', en: '' },
    { ja: '予算つきの逐次配布を、λ を一つ探す問題と制約なしの方策学習に分けて解く。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function envelope(g, x, y, s, label) {
    var o = el('g', { transform: 'translate(' + x + ',' + y + ')' }, g);
    el('rect', { x: -22 * s, y: -30 * s, width: 44 * s, height: 60 * s, rx: 6 * s, fill: '#fff', stroke: C.a, 'stroke-width': 3 }, o);
    el('path', { d: 'M' + (-22 * s) + ',' + (-16 * s) + ' Q0,' + (2 * s) + ' ' + (22 * s) + ',' + (-16 * s), fill: 'none', stroke: C.a, 'stroke-width': 3 }, o);
    if (label) txt(o, 0, 18 * s, label, { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one user, envelopes on several days; consumed ones add to the global budget =====
    var g1 = S.g[0];
    t2(g1, 70, 60, 'ある利用者への配布（日ごと）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 600, y1: 300, y2: 300, stroke: C.ink, 'stroke-width': 2 }, g1);
    var days = [['1 日目', '¥', true], ['2 日目', '¥', false], ['3 日目', '¥', true], ['4 日目', '¥', true]];
    S.env1 = days.map(function (d, i) {
      var x = 140 + i * 130, o = {};
      t2(g1, x, 332, d[0], '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
      o.g = envelope(g1, x, 210, 1.3, d[1]);
      o.st = t2(g1, x, 132, d[2] ? '使った' : '使わず', '', { 'font-size': 16, 'font-weight': 600, fill: d[2] ? C.a : C.muted, 'text-anchor': 'middle' });
      o.used = d[2]; o.t0 = 1 + i * 1.3;
      return o;
    });
    t2(g1, 340, 400, '前日の行動（状態）によって、次の配り方が変わる', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, '全利用者の費用の合計', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('rect', { x: PX, y: 130, width: 240, height: 34, rx: 6, fill: C.panel }, p1);
    S.fill1 = el('rect', { x: PX, y: 130, width: 0, height: 34, rx: 6, fill: C.a }, p1);
    el('line', { x1: PX + 200, x2: PX + 200, y1: 120, y2: 174, stroke: C.ink, 'stroke-width': 2.5 }, p1);
    txt(p1, PX + 200, 196, '予算 ' + m('b'), { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(p1, PX, 250, '配ってからでは', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 276, '予算を取り戻せない。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 320, '過去のログだけで方策を学び、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 344, '予算内に収まるかも事前に確かめる。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: r - lambda c for three envelope sizes =====
    var g2 = S.g[1];
    var acts = [['小', 1, 0.50], ['中', 2, 0.65], ['大', 4, 0.75]];
    var Y0 = 330, U = 260;   // baseline y, px per unit of r - lambda c
    t2(g2, 70, 60, '紅包の額ごとの ' + m('r') + ' − ' + m('λ') + m('c'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 90, x2: 600, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    txt(g2, 84, Y0 + 5, '0', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.bars2 = acts.map(function (a, i) {
      var x = 150 + i * 150, o = {};
      o.r = a[2]; o.c = a[1];
      o.bar = el('rect', { x: x, width: 90, y: Y0, height: 0, fill: C.gray, rx: 4 }, g2);
      o.val = txt(g2, x + 45, 0, '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      t2(g2, x + 45, 462, a[0] + '（' + m('r') + '=' + a[2].toFixed(2) + ', ' + m('c') + '=' + a[1] + '）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      o.mark = t2(g2, x + 45, 490, '選ばれる', '', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      return o;
    });
    var p2 = el('g', {}, g2);
    S.lam2 = txt(p2, PX, 130, '', { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    el('rect', { x: PX, y: 152, width: 240, height: 10, rx: 5, fill: C.panel }, p2);
    S.knob2 = el('circle', { cx: PX, cy: 157, r: 10, fill: C.a }, p2);
    t2(p2, PX, 220, m('λ') + ' は費用 1 単位あたりの', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 246, '罰金にあたる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 290, m('λ') + ' を固定すれば、制約のない', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 316, '強化学習（DQN など）で解ける。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（' + m('r') + ' と ' + m('c') + ' は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: bisection on lambda along a decreasing cost curve =====
    var g3 = S.g[2];
    var AX0 = 100, AX1 = 590, AY0 = 440, AY1 = 90;
    function JC(l) { return 0.2 + 0.8 * Math.exp(-6 * l); }
    function sx(l) { return AX0 + l * (AX1 - AX0); }
    function sy(v) { return AY0 - v * (AY0 - AY1); }
    var d = '';
    for (var k = 0; k <= 60; k++) { var l = k / 60; d += (k ? 'L' : 'M') + sx(l).toFixed(1) + ',' + sy(JC(l)).toFixed(1); }
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX1, AY0 + 30, m('λ') + ' →', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, AX0 + 10, AY1 - 18, '↑ 費用の見積もり ' + m('J') + '<tspan font-size="12" dy="4">C</tspan>', '', { 'font-size': 16, fill: C.ink });
    el('path', { d: d, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g3);
    el('line', { x1: AX0, x2: AX1, y1: sy(0.45), y2: sy(0.45), stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g3);
    txt(g3, AX1, sy(0.45) - 10, '予算 ' + m('b'), { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    var steps = [[0, 1, 0.5], [0, 0.5, 0.25], [0, 0.25, 0.125], [0.125, 0.25, 0.1875], [0.1875, 0.25, 0.21875]];
    S.steps3 = steps.map(function (s, i) {
      var o = {}, v = JC(s[2]);
      o.g = el('g', {}, g3);
      el('line', { x1: sx(s[2]), x2: sx(s[2]), y1: AY0, y2: sy(v), stroke: C.muted, 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }, o.g);
      el('circle', { cx: sx(s[2]), cy: sy(v), r: 8, fill: v <= 0.45 ? C.b : C.a }, o.g);
      o.iv = el('rect', { x: sx(s[0]), y: AY0 + 46 + 0, width: sx(s[1]) - sx(s[0]), height: 10, rx: 5, fill: C.ink }, g3);
      o.t0 = 17 + i * 1.1;
      return o;
    });
    t2(g3, AX1, AY0 + 56, '黒い帯：いまの探索区間', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, '1 回ごとに区間を半分にする', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 160, r: 8, fill: C.a }, p3);
    t2(p3, PX + 26, 166, '予算超過 → ' + m('λ') + ' を上げる', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 196, r: 8, fill: C.b }, p3);
    t2(p3, PX + 26, 202, '予算内 → ' + m('λ') + ' を下げる', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 256, '費用はログデータ上の', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 282, '反実仮想評価（DR）で見積もる。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 330, '根拠：λ が大きいほど費用は', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 354, '増えない（論文の定理 1）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（曲線は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (real-world data), arXiv v1 =====
    var g4 = S.g[3];
    var names = ['ランダム', '制約つきバンディット', '制約つき MDP'];
    var rew = [0.687, 0.688, 0.693], cost = [0.532, 0.503, 0.482];
    t2(g4, 70, 58, '予算 0.532 で固定：報酬', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 288, '報酬 0.687 で固定：費用', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    function rx(v) { return 260 + (v - 0.684) / 0.010 * 320; }
    function cx(v) { return 260 + (v - 0.470) / 0.070 * 320; }
    [0.685, 0.690, 0.695].forEach(function (v) {
      el('line', { x1: rx(v), x2: rx(v), y1: 76, y2: 214, stroke: C.hair }, g4);
      txt(g4, rx(v), 236, v.toFixed(3), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    [0.48, 0.50, 0.52, 0.54].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: 306, y2: 444, stroke: C.hair }, g4);
      txt(g4, cx(v), 466, v.toFixed(2), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.rows4 = names.map(function (nm, i) {
      var o = {}, col = i === 2 ? C.b : (i === 0 ? C.muted : C.ink);
      var y1 = 100 + i * 44, y2 = 330 + i * 44;
      t2(g4, 246, y1 + 5, nm, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      t2(g4, 246, y2 + 5, nm, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      o.a = el('g', {}, g4);
      el('circle', { cx: rx(rew[i]), cy: y1, r: 9, fill: i === 2 ? C.b : C.gray, stroke: i === 2 ? 'none' : C.muted, 'stroke-width': 1.5 }, o.a);
      txt(o.a, rx(rew[i]) + 16, y1 + 5, rew[i].toFixed(3), { 'font-size': 15, 'font-weight': 600, fill: col });
      o.b = el('g', {}, g4);
      el('circle', { cx: cx(cost[i]), cy: y2, r: 9, fill: i === 2 ? C.b : C.gray, stroke: i === 2 ? 'none' : C.muted, 'stroke-width': 1.5 }, o.b);
      txt(o.b, cx(cost[i]) + 16, y2 + 5, cost[i].toFixed(3), { 'font-size': 15, 'font-weight': 600, fill: col });
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '同じ報酬に必要な費用', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 156, '−9.40%', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 186, '制約つき MDP（ランダム比）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 212, 'バンディットは −5.46%', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 262, '合成データでは同じ予算で', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 286, '報酬がランダム比 +16.11%', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 336, '横軸は 0 から始まらない。', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM 2019';
    el('text', { x: 480, y: 212, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Model-based Constrained MDP for Budget';
    el('text', { x: 480, y: 254, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Allocation in Sequential Incentive Marketing';
    t2(g5, 480, 300, '逐次インセンティブ施策の予算配分のためのモデルベース制約つき MDP', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Shuai Xiao · Le Guo · Zaifan Jiang · Lei Lv · Yuanbo Chen · Jun Zhu · Shuang Yang';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2303.01049';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: envelopes appear day by day; consumed ones fill the budget bar
    var used = 0;
    S.env1.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5), s2 = seg(t, o.t0 + 0.6, o.t0 + 1.1);
      o.g.setAttribute('opacity', s); o.st.setAttribute('opacity', s2);
      if (o.used) used += s2;
    });
    S.fill1.setAttribute('width', 62 * used);
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: lambda sweeps 0 -> 0.25; bars show r - lambda c, the argmax is blue
    var lam = 0.25 * seg(t, 9.5, 14.5);
    S.lam2.innerHTML = '<tspan ' + MI + '>λ</tspan> = ' + lam.toFixed(2);
    S.knob2.setAttribute('cx', PX + 240 * lam / 0.25);
    var vals = S.bars2.map(function (o) { return o.r - lam * o.c; });
    var best = vals.indexOf(Math.max.apply(null, vals));
    S.bars2.forEach(function (o, i) {
      var v = vals[i], h = Math.abs(v) * 260;
      o.bar.setAttribute('y', v >= 0 ? 330 - h : 330); o.bar.setAttribute('height', h);
      o.bar.setAttribute('fill', i === best ? C.b : C.gray);
      o.val.setAttribute('y', v >= 0 ? 330 - h - 10 : 330 + h + 22);
      o.val.textContent = (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
      o.mark.setAttribute('opacity', i === best ? 1 : 0);
    });
    // scene 3: bisection steps appear one by one; only the current interval is shown
    S.steps3.forEach(function (o, i) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.g.setAttribute('opacity', s);
      var next = S.steps3[i + 1];
      o.iv.setAttribute('opacity', s * (next ? 1 - seg(t, next.t0, next.t0 + 0.3) : 1));
    });
    S.p3.setAttribute('opacity', seg(t, 17.2, 18));
    // scene 4: rows appear in order, then the headline number
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.a.setAttribute('opacity', s); o.b.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
