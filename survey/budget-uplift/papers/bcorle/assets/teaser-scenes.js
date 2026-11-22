// =====================================================================
// teaser-scenes.js — Zhang et al., BCORLE(λ) (NeurIPS 2021), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled 模式図); the cost curve in scene 3 has an explainer-chosen shape.
// Numbers: Table 1 (episodes / hours) and Table 3 (ROI) of the NeurIPS 2021 proceedings PDF.
// Colours: orange = the lambda-update approach / uplift+LP baselines / coupon cost;
//          blue   = BCORLE(lambda): lambda-generalization, R-BCQ.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'これまでは λ を更新するたびに、予算に合うまで<span class="A">方策を学び直していた</span>。', en: '' },
    { ja: 'BCORLE(λ) は λ を学習データとネットワークの入力に加え、<span class="B">すべての λ の方策を一度に学ぶ</span>。', en: '' },
    { ja: '学習後にコストを見積もって予算に収まる λ を選ぶので、予算が変わっても学び直さなくてよい。', en: '' },
    { ja: 'Taobao Deals の A/B テストでは費用をほぼ同じにしたまま、<span class="B">R-BCQ</span> の ROI が <span class="A">LR+LP</span> より 13〜15% 高かった。', en: '' },
    { ja: '予算を λ でまとめ、λ ごとの方策を一度に学んでおけば、予算に合わせて選ぶだけで済む。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function box(g, x, y, w, h, fill, stroke) {
    return el('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: fill, stroke: stroke || 'none', 'stroke-width': 1.5 }, g);
  }

  // scene 1 loop geometry: three boxes around a centre
  var LOOP = [[330, 120], [500, 380], [160, 380]];
  var EDGES = [[420, 152, 492, 346], [378, 380, 284, 380], [168, 348, 238, 154]];   // box edge to box edge
  // scene 3 schematic cost curve (normalised 0..1), explainer-chosen shape
  function cost(l) { return 0.12 + 0.8 * Math.exp(-3 * l); }
  var AX0 = 110, AX1 = 570, AY0 = 450, AY1 = 90;
  function sx(l) { return AX0 + l * (AX1 - AX0); }
  function sy(v) { return AY0 - v * (AY0 - AY1); }
  var BAND1 = [0.38, 0.43], BAND2 = [0.24, 0.29], L1 = 0.35, L2 = 0.6;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the lambda-update loop =====
    var g1 = S.g[0];
    var labels = ['方策を学習（' + m('λ') + ' 固定）', 'コストを評価', m('λ') + ' を更新'];
    LOOP.forEach(function (p, i) {
      box(g1, p[0] - 120, p[1] - 30, 240, 60, i === 2 ? '#FCEBDF' : '#fff', i === 2 ? null : C.ink);
      t2(g1, p[0], p[1] + 6, labels[i], '', { 'font-size': 18, fill: i === 2 ? C.a : C.ink, 'text-anchor': 'middle' });
    });
    var mk = el('marker', { id: 'tzA', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, el('defs', {}, g1));
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: C.a }, mk);
    EDGES.forEach(function (e) {
      el('line', { x1: e[0], y1: e[1], x2: e[2], y2: e[3], stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#tzA)' }, g1);
    });
    S.dot1 = el('circle', { r: 10, fill: C.a }, g1);
    S.cnt1 = txt(g1, 330, 290, '', { 'font-size': 24, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    txt(p1, PX, 120, m('r') + '<tspan baseline-shift="sub" font-size="20">' + m('λ') + '</tspan> = ' + m('r') + ' − ' + m('λ') + '·' + m('c'), { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 175, m('λ') + ' が変わると報酬が変わり、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 201, '最適な方策も変わる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 258, '論文のシミュレーションで', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 282, '予算に合う方策を得るまで', '', { 'font-size': 15, fill: C.muted });
    txt(p1, PX, 326, '14,000', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(p1, PX + 112, 326, 'エピソード', '', { 'font-size': 17, fill: C.a });
    t2(p1, PX, 360, '2.187 時間（Table 1）', '', { 'font-size': 17, fill: C.a });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: lambda-generalization enlarges the data =====
    var g2 = S.g[1];
    box(g2, 80, 60, 260, 50, C.panel);
    txt(g2, 210, 92, '(' + m('s') + ', ' + m('a') + ', ' + m('r') + ', ' + m('c') + ', ' + m('s') + '′)', { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 80, 46, 'ログの 1 件', '', { 'font-size': 15, fill: C.muted });
    el('line', { x1: 210, y1: 112, x2: 210, y2: 140, stroke: C.muted, 'stroke-width': 2 }, g2);
    var lams = ['0', '0.05', '0.10', null, '1.00'];
    S.rows2 = lams.map(function (lv, i) {
      var y = 150 + i * 58, o = el('g', {}, g2);
      if (lv === null) { txt(o, 210, y + 34, '⋮', { 'font-size': 26, fill: C.b, 'text-anchor': 'middle' }); return o; }
      box(o, 80, y, 260, 46, '#fff', C.b);
      txt(o, 210, y + 30, '(' + m('s') + ', ' + m('a') + ', ' + m('r') + ' − ' + lv + m('c') + ', ' + m('c') + ', ' + m('s') + '′, ' + lv + ')', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    S.net2 = el('g', {}, g2);
    el('line', { x1: 350, y1: 290, x2: 396, y2: 290, stroke: C.b, 'stroke-width': 3 }, S.net2);
    el('path', { d: 'M396,282 L408,290 L396,298 z', fill: C.b }, S.net2);
    box(S.net2, 412, 180, 180, 220, C.bsoft);
    txt(S.net2, 502, 216, m('Q') + '(' + m('s') + ', ' + m('a') + ', ' + m('λ') + ')', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    ['Head 1', 'Head 2', '⋯', 'Head H'].forEach(function (h, i) {
      if (h === '⋯') { txt(S.net2, 502, 240 + i * 38 + 20, '⋮', { 'font-size': 20, fill: C.b, 'text-anchor': 'middle' }); return; }
      el('rect', { x: 442, y: 236 + i * 38, width: 120, height: 28, rx: 6, fill: '#fff', stroke: C.b }, S.net2);
      txt(S.net2, 502, 256 + i * 38, h, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, m('λ') + ' を入力に加える', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 172, 'ログを ' + m('λ') + ' の候補ごとに複製し、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 198, 'データは ' + m('L') + ' 倍になる', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '（シミュレーションでは ' + m('L') + ' = 21）', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 282, '学習は 1 回だけで、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 308, 'どの ' + m('λ') + ' の方策も出せる', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: pick the lambda whose estimated cost fits the budget =====
    var g3 = S.g[2];
    S.band = el('rect', { x: AX0, width: AX1 - AX0, y: sy(BAND1[1]), height: sy(BAND1[0]) - sy(BAND1[1]), fill: C.panel }, g3);
    S.bandLab = t2(g3, AX1 - 6, 0, '予算の範囲 [' + m('b') + '−' + m('δ') + ', ' + m('b') + ']', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    el('line', { x1: AX0, x2: AX1 + 10, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 20, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, (AX0 + AX1) / 2, AY0 + 34, m('λ') + ' →', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    txt(g3, AX0, AY0 + 26, '0', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g3, sx(1), AY0 + 26, '1', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, AX0 + 10, AY1 - 30, '↑ REME で見積もった方策のコスト', '', { 'font-size': 16, fill: C.ink });
    S.pts3 = [];
    for (var j = 0; j <= 20; j++) {
      var l = j / 20;
      S.pts3.push({ l: l, c: el('circle', { cx: sx(l), cy: sy(cost(l)), r: 6, fill: C.gray }, g3) });
    }
    S.vline = el('line', { x1: 0, x2: 0, y1: AY0, y2: AY1, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g3);
    S.sel = el('circle', { r: 11, fill: C.b }, g3);
    S.selLab = t2(g3, 0, AY0 - 12, '選ぶ ' + m('λ'), '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.newLab = t2(g3, 330, AY1 + 10, '予算が下がったら、選び直すだけ', '', { 'font-size': 16, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '同じ目標に達するまでの学習', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 134, '（シミュレーション、Table 1）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 186, 'λ-汎化', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    txt(p3, PX, 226, '3,000', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p3, PX + 92, 226, 'エピソード', '', { 'font-size': 16, fill: C.b });
    t2(p3, PX, 254, '0.439 時間', '', { 'font-size': 16, fill: C.b });
    t2(p3, PX, 306, m('λ') + ' を更新する方法', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    txt(p3, PX, 346, '14,000', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(p3, PX + 112, 346, 'エピソード', '', { 'font-size': 16, fill: C.a });
    t2(p3, PX, 374, '2.187 時間', '', { 'font-size': 16, fill: C.a });
    t2(g3, 940, 520, '模式図（曲線の形は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3, online A/B test ROI =====
    var g4 = S.g[3];
    var rows = [
      ['LR+LP', 1.2409, 1.3052, C.a], ['GBDT+LP', 1.2371, 1.3201, C.a],
      ['BCQ', 1.3950, 1.4445, C.muted], ['REM', 1.4051, 1.4509, C.muted], ['R-BCQ', 1.4329, 1.4773, C.b]
    ];
    var X0 = 200, X1 = 600, LO = 1.2, HI = 1.5, Y0 = 130, DY = 62;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 62, 'ROI（日/元）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('circle', { cx: 210, cy: 56, r: 8, fill: C.ink }, g4);
    t2(g4, 224, 62, '1 週目', '', { 'font-size': 15, fill: C.ink });
    el('circle', { cx: 300, cy: 56, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 3 }, g4);
    t2(g4, 314, 62, '2 週目', '', { 'font-size': 15, fill: C.ink });
    [1.2, 1.3, 1.4, 1.5].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 30, y2: Y0 + DY * 4 + 28, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: Y0 + DY * 4 + 54, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = el('g', {}, g4);
      el('text', { x: X0 - 18, y: y + 6, 'font-size': 17, fill: rw[3], 'font-weight': rw[0] === 'R-BCQ' ? 650 : 400, 'text-anchor': 'end' }, o).textContent = rw[0];
      el('line', { x1: cx(rw[1]), x2: cx(rw[2]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 4 }, o);
      el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: rw[3] }, o);
      el('circle', { cx: cx(rw[2]), cy: y, r: 9, fill: '#fff', stroke: rw[3], 'stroke-width': 3.5 }, o);
      o.t0 = 25 + i * 0.7;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'R-BCQ の ROI の改善', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 134, '（LR+LP と比べて）', '', { 'font-size': 15, fill: C.muted });
    txt(p4, PX, 182, '+15.47%', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 150, 182, '1 週目', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 228, '+13.18%', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 150, 228, '2 週目', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 290, '7 日間の平均費用は', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 316, 'どの手法も 4.05〜4.08 元', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 342, '（予算は 4.1 元）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 3（NeurIPS 2021 proceedings 版）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 120, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NEURIPS 2021';
    ['BCORLE(λ): An Offline Reinforcement Learning', 'and Evaluation Framework for Coupons', 'Allocation in E-commerce Market'].forEach(function (s, i) {
      el('text', { x: 480, y: 178 + i * 40, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 312, 'EC 市場でのクーポン配布のためのオフライン強化学習と評価の枠組み', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 362, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yang Zhang · Bo Tang · Qingyu Yang · Dou An ·';
    el('text', { x: 480, y: 388, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Hongyin Tang · Chenyang Xi · Xueying Li · Feiyu Xiong';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: a dot runs round the loop; each lap is one re-learning
    var u = Math.max(0, t - 0.8) / 1.8, lap = Math.floor(u), f = u - lap, k = Math.floor(f * 3), ff = (f * 3) - k;
    var e = EDGES[k];
    S.dot1.setAttribute('cx', e[0] + (e[2] - e[0]) * ff);
    S.dot1.setAttribute('cy', e[1] + (e[3] - e[1]) * ff);
    S.dot1.setAttribute('opacity', seg(t, 0.8, 1.2));
    S.cnt1.innerHTML = '学び直し ' + Math.min(lap + 1, 4) + ' 回目';
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: rows appear one by one, then the network
    S.rows2.forEach(function (o, i) { o.setAttribute('opacity', seg(t, 9 + i * 0.5, 9.5 + i * 0.5)); });
    S.net2.setAttribute('opacity', seg(t, 12, 12.7));
    S.p2.setAttribute('opacity', seg(t, 9.5, 10.3));
    // scene 3: sweep lambda to the first point inside the band; then the budget drops and we re-pick
    var lowBudget = seg(t, 20.6, 21.6);
    var bt = BAND1[1] + (BAND2[1] - BAND1[1]) * lowBudget, bb = BAND1[0] + (BAND2[0] - BAND1[0]) * lowBudget;
    S.band.setAttribute('y', sy(bt)); S.band.setAttribute('height', sy(bb) - sy(bt));
    S.bandLab.setAttribute('transform', 'translate(0,' + (sy(bt) - 8) + ')');
    var lam = L1 * seg(t, 17, 19) + (L2 - L1) * seg(t, 21.8, 22.8);
    S.vline.setAttribute('x1', sx(lam)); S.vline.setAttribute('x2', sx(lam));
    S.vline.setAttribute('y2', sy(cost(lam)));
    S.sel.setAttribute('cx', sx(lam)); S.sel.setAttribute('cy', sy(cost(lam)));
    S.sel.setAttribute('opacity', seg(t, 16.8, 17.2));
    S.vline.setAttribute('opacity', seg(t, 16.8, 17.2));
    S.selLab.setAttribute('transform', 'translate(' + (sx(lam) + 10) + ',0)');
    S.selLab.setAttribute('opacity', seg(t, 19, 19.5) * (1 - seg(t, 21.3, 21.6)) + seg(t, 22.8, 23.2));
    S.newLab.setAttribute('opacity', seg(t, 21.2, 21.8));
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: rows appear in order, then the summary
    S.rows4.forEach(function (o) { o.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
