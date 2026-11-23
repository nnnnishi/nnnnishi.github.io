// =====================================================================
// teaser-scenes.js — Zhao & Harinen (IEEE DSAA 2019), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図): baseline 10 conversions
// per 100 users, uplift +3/+5/+8, v = 1, costs c = 0.01/0.02/0.1 and s = 0.01/0.1/0.5 (the paper's
// synthetic costs with c_m = 1). Scene 4 uses the conversion rates and costs printed in the paper's
// real-data section (arXiv v3); the net values per 1,000 users are the explainer's arithmetic.
// Colours: orange = treatment cost / cost-blind choice; blue = net value / the paper's net-value choice.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '処置が複数あると、通常のアップリフトモデルは転換を最も増やす処置を選ぶ。', en: '' },
    { ja: 'しかし処置ごとに<span class="A">費用</span>が違い、表示した時点でかかるものと転換したときにかかるものがある。', en: '' },
    { ja: '論文は価値から費用を引いた<span class="B">純価値</span>の処置効果を推定し、それが最大の処置を選ぶ。', en: '' },
    { ja: '実データの処置 1 は対照より転換率が高いが、費用を引くと純価値は対照を下回る。', en: '' },
    { ja: '費用の違う処置から選ぶときは、転換の増分ではなく純価値で比べる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column
  var UP = [3, 5, 8];                       // conversions gained per 100 users (toy)
  var COST = [[1, 0.13], [2, 1.5], [10, 9]]; // per 100 users: impression c*100, triggered s*conversions
  var NET = [1.87, 1.5, -11];
  var ROWY = [150, 250, 350], X0 = 200, U = 20;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one user, three treatments, conversion uplift =====
    var g1 = S.g[0];
    t2(g1, X0, 92, '転換の増分（100 人あたり）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0, x2: X0, y1: 110, y2: 385, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.bars1 = UP.map(function (v, i) {
      var y = ROWY[i];
      t2(g1, 70, y + 6, '処置 ' + (i + 1), '', { 'font-size': 18, fill: C.ink });
      var r = el('rect', { x: X0, y: y - 15, width: 0, height: 30, rx: 4, fill: C.gray }, g1);
      var lab = txt(g1, X0 + v * U + 10, y + 6, '+' + v, { 'font-size': 18, fill: C.ink });
      return { r: r, lab: lab, w: v * U };
    });
    S.pick1 = t2(g1, X0 + 8 * U + 50, ROWY[2] + 6, '← 選ばれる', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '対照のほかに処置が 3 つ', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 200, '選ぶ基準：転換の増分', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '処置ごとの費用は', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 274, '比べていない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: value gained vs. cost per treatment =====
    var g2 = S.g[1];
    t2(g2, X0, 92, '100 人あたり（' + m('v') + ' = 1）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0, x2: X0, y1: 110, y2: 395, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.rows2 = UP.map(function (v, i) {
      var y = ROWY[i], o = {};
      t2(g2, 70, y + 6, '処置 ' + (i + 1), '', { 'font-size': 18, fill: C.ink });
      el('rect', { x: X0, y: y - 30, width: v * U, height: 24, rx: 3, fill: C.gray }, g2);
      txt(g2, X0 + v * U + 8, y - 12, '+' + v, { 'font-size': 16, fill: C.ink });
      o.c = el('rect', { x: X0, y: y + 2, width: 0, height: 24, rx: 3, fill: C.a }, g2);
      o.s = el('rect', { x: X0, y: y + 2, width: 0, height: 24, rx: 3, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 1.5 }, g2);
      o.cw = COST[i][0] * U; o.sw = COST[i][1] * U;
      var tot = COST[i][0] + COST[i][1];
      o.lab = txt(g2, X0 + o.cw + o.sw + 8, y + 20, (Math.round(tot * 100) / 100).toString(), { 'font-size': 16, 'font-weight': 600, fill: C.a });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    el('rect', { x: PX, y: 120, width: 18, height: 18, rx: 3, fill: C.gray }, p2);
    t2(p2, PX + 28, 135, '転換で得る価値', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 170, width: 18, height: 18, rx: 3, fill: C.a }, p2);
    t2(p2, PX + 28, 185, '表示コスト ' + m('c'), '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX + 28, 209, '処置した全員にかかる', '', { 'font-size': 15, fill: C.muted });
    el('rect', { x: PX, y: 240, width: 18, height: 18, rx: 3, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 1.5 }, p2);
    t2(p2, PX + 28, 255, 'トリガーコスト ' + m('s'), '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX + 28, 279, '転換した人にだけかかる', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 340, '処置 3 は転換を最も増やすが、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 366, '費用も最も大きい。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（費用は論文の合成実験で ' + m('c') + '<tspan dy="4" font-size="11">m</tspan><tspan dy="-4"> = 1 の値）</tspan>', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: net value, pick the max =====
    var g3 = S.g[2];
    var Z = 440, U3 = 20;
    t2(g3, 70, 92, '純価値の増分（100 人あたり）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: Z, x2: Z, y1: 110, y2: 385, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, Z, 405, '0', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.bars3 = NET.map(function (v, i) {
      var y = ROWY[i], o = {};
      t2(g3, 70, y + 6, '処置 ' + (i + 1), '', { 'font-size': 18, fill: C.ink });
      o.r = el('rect', { x: Z, y: y - 15, width: 0, height: 30, rx: 4, fill: C.gray }, g3);
      o.v = v; o.w = Math.abs(v) * U3;
      var s = (v > 0 ? '+' : '−') + Math.abs(v).toFixed(2);
      o.lab = txt(g3, v > 0 ? Z + o.w + 10 : Z - o.w - 10, y + 6, s, { 'font-size': 18, fill: C.ink, 'text-anchor': v > 0 ? 'start' : 'end' });
      return o;
    });
    S.pick3 = t2(g3, Z + NET[0] * U3 + 80, ROWY[0] + 6, '← 選ぶ', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 150, '(' + m('v') + ' − ' + m('s') + ')·' + m('Y') + ' − ' + m('c'), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 190, 'の増分を処置ごとに推定する', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 244, '純価値の X-Learner は', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 270, '疑似効果の段階で', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 296, '価値と費用を差し引く。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 350, '純価値が最大：処置 1', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: real data, per 1,000 users (explainer's arithmetic from the paper's numbers) =====
    var g4 = S.g[3];
    var Y0 = 440, K = 14, BW = 100;
    var grp = [['対照', '0.53%', 5.3, 0], ['処置 1', '1.39%', 13.9, 12.78], ['処置 2', '2.18%', 21.8, 16.54]];
    t2(g4, 70, 70, '1,000 人あたり（' + m('v') + ' = 1）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 620, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.cols4 = grp.map(function (gq, i) {
      var cx = 170 + i * 180, o = {};
      var net = Math.round((gq[2] - gq[3]) * 100) / 100;
      o.net = el('rect', { x: cx - BW / 2, y: Y0, width: BW, height: 0, fill: C.b }, g4);
      o.cost = el('rect', { x: cx - BW / 2, y: Y0, width: BW, height: 0, fill: C.a }, g4);
      o.hn = net * K; o.hc = gq[3] * K;
      o.topG = t2(g4, cx, Y0 - (gq[2] * K) - 12, '価値 ' + gq[2], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      if (gq[3] > 0) o.costLab = t2(g4, cx, Y0 - net * K - gq[3] * K / 2 + 6, '費用 ' + gq[3], '', { 'font-size': 16, fill: '#fff', 'text-anchor': 'middle' });
      t2(g4, cx, Y0 + 28, gq[0] + '（' + gq[1] + '）', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      o.netLab = t2(g4, cx, Y0 + 56, '純価値 ' + net.toFixed(2), '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      o.t0 = 25 + i * 0.9;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 120, width: 18, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 28, 135, '純価値', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 160, width: 18, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX + 28, 175, '費用（表示＋トリガー）', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 230, '処置 1：表示 0.01、トリガー 0.2', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 256, '処置 2：表示 0.01、トリガー 0.3', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 310, '転換率は対照の約 2.6 倍でも、', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 336, '処置 1 の純価値は対照より低い。', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文本文の転換率と費用（arXiv v3）から解説者が計算', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IEEE DSAA · 2019';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Uplift Modeling for Multiple Treatments';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'with Cost Optimization';
    t2(g5, 480, 302, '費用の異なる複数の処置に対するアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zhenyu Zhao · Totte Harinen';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/1908.05372';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, the largest turns orange
    S.bars1.forEach(function (o, i) {
      var s = seg(t, 1 + i * 0.4, 2.4 + i * 0.4);
      o.r.setAttribute('width', o.w * s);
      o.lab.setAttribute('opacity', seg(t, 2.2 + i * 0.4, 2.7 + i * 0.4));
      o.r.setAttribute('fill', i === 2 ? H.mix(C.gray, C.a, seg(t, 4, 4.6)) : C.gray);
    });
    S.pick1.setAttribute('opacity', seg(t, 4.4, 5));
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: impression cost grows, then triggered cost on top
    S.rows2.forEach(function (o, i) {
      var a = seg(t, 9.6 + i * 0.5, 11 + i * 0.5), b = seg(t, 11.6 + i * 0.4, 12.8 + i * 0.4);
      o.c.setAttribute('width', o.cw * a);
      o.s.setAttribute('x', X0 + o.cw * a);
      o.s.setAttribute('width', o.sw * b);
      o.lab.setAttribute('opacity', seg(t, 13.2, 13.8));
    });
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: net bars grow from zero, treatment 1 turns blue
    S.bars3.forEach(function (o, i) {
      var s = seg(t, 17 + i * 0.4, 18.6 + i * 0.4), w = o.w * s;
      o.r.setAttribute('width', w);
      o.r.setAttribute('x', o.v > 0 ? 440 : 440 - w);
      o.lab.setAttribute('opacity', seg(t, 18.6 + i * 0.4, 19.1 + i * 0.4));
      o.r.setAttribute('fill', i === 0 ? H.mix(C.gray, C.b, seg(t, 20, 20.6)) : C.gray);
    });
    S.pick3.setAttribute('opacity', seg(t, 20.4, 21));
    S.p3.setAttribute('opacity', seg(t, 17.4, 18.2));
    // scene 4: stacked bars rise in order
    S.cols4.forEach(function (o) {
      var a = seg(t, o.t0, o.t0 + 1), b = seg(t, o.t0 + 0.9, o.t0 + 1.8);
      o.net.setAttribute('y', 440 - o.hn * a); o.net.setAttribute('height', o.hn * a);
      o.cost.setAttribute('y', 440 - o.hn - o.hc * b); o.cost.setAttribute('height', o.hc * b);
      o.cost.setAttribute('opacity', a >= 1 ? 1 : 0);
      o.topG.setAttribute('opacity', seg(t, o.t0 + 1.6, o.t0 + 2.1));
      if (o.costLab) o.costLab.setAttribute('opacity', seg(t, o.t0 + 1.8, o.t0 + 2.3));
      o.netLab.setAttribute('opacity', seg(t, o.t0 + 1, o.t0 + 1.5));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
