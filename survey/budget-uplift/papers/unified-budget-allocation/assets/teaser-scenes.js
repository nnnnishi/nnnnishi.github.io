// =====================================================================
// teaser-scenes.js — Zhao et al. (KDD 2019), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics: six toy segments with explainer-chosen logit parameters (labelled 模式図).
// Scene 3 runs the paper's Algorithm 1 (bisection on the dual variable lambda, q_i(lambda) via Lambert W)
// on those toy segments with budget B = 400. Scene 4 uses Table 1 (arXiv v3) and numbers stated in the text.
// Colours: orange = marketing cost / uniform allocation; blue = sales response / the paper's allocation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '<span class="A">均等な配分</span>では、セグメントごとに売上の反応が違うことを考えない。', en: '' },
    { ja: '売上の応答曲線はセグメントごとに違い、市場コストから離れるほど割引を増やしても売上が伸びにくい。', en: '' },
    { ja: '<span class="B">双対変数 λ</span> を 1 つ決めると全セグメントの割引額が決まるので、<span class="A">総費用</span>が予算に収まる λ を二分法で探す。', en: '' },
    { ja: '候補の間隔が細かければ離散化の誤差は小さく、映画チケットの A/B テストでは<span class="B">売上が平均 6% 以上</span>伸びた。', en: '' },
    { ja: '売上の応答をロジット曲線で予測し、予算配分を双対変数 1 つの探索に帰着させる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  // ----- toy segments (a_i, b_i, D_i) and the paper's formulas -----
  var SEGS = [[-1.0, 0.9, 80], [-0.4, 0.5, 60], [-0.8, 0.35, 90], [-0.2, 0.8, 50], [-0.9, 0.6, 70], [-0.5, 0.25, 40]];
  var BUDGET = 400;
  function lambertW(x) { var w = Math.log(1 + x); for (var k = 0; k < 60; k++) { var ew = Math.exp(w); w -= (w * ew - x) / (ew * (w + 1)); } return w; }
  function qOf(l, s) { var w = lambertW(Math.exp(s[0] + s[1] / l - 1)); return w / (w + 1); }
  function cOf(q, s) { return (Math.log(q / (1 - q)) - s[0]) / s[1]; }
  function alloc(l) {
    var cost = 0, cs = [];
    SEGS.forEach(function (s) { var q = qOf(l, s), c = cOf(q, s); cs.push(c); cost += s[2] * q * c; });
    return { cs: cs, cost: cost };
  }
  function logit(s, c) { return s[2] / (1 + Math.exp(-(s[0] + s[1] * c))); }

  function lerp(a, b, k) { return a + (b - a) * k; }
  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.72em" dy="4">' + s + '</tspan><tspan dy="-4"></tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: uniform discount for every segment =====
    var g1 = S.g[0];
    var BX = 230, U = 120;  // bar origin, px per unit of c
    t2(g1, 90, 92, '各セグメントの割引 ' + m('c'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars1 = SEGS.map(function (s, i) {
      var y = 130 + i * 50;
      t2(g1, 90, y + 19, 'セグメント ' + (i + 1), '', { 'font-size': 16, fill: C.ink });
      return el('rect', { x: BX, y: y, width: 0, height: 26, rx: 4, fill: C.a }, g1);
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, 'どのセグメントにも', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 178, '同じ割引を出す', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 232, 'A/B テストの A 群は', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 258, '予算を均等に配った', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: logit response curves differ by segment =====
    var g2 = S.g[1];
    var AX0 = 90, AX1 = 590, AY0 = 450, AY1 = 90, CMIN = -2, CMAX = 8, DMAX = 90;
    function sx(c) { return AX0 + (c - CMIN) / (CMAX - CMIN) * (AX1 - AX0); }
    function sy(d) { return AY0 - d / DMAX * (AY0 - AY1); }
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: sx(0), x2: sx(0), y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX1, AY0 + 28, '割引 ' + m('c') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, sx(0) + 10, AY1 - 16, '↑ 売上 ' + m('d') + sub('i') + '(' + m('c') + ')', '', { 'font-size': 16, fill: C.ink });
    var picks = [0, 3, 5];
    S.curves = picks.map(function (k) {
      var s = SEGS[k], pts = [];
      for (var c = CMIN; c <= CMAX + 1e-9; c += 0.1) pts.push(sx(c).toFixed(1) + ',' + sy(logit(s, c)).toFixed(1));
      var o = {};
      o.path = el('polyline', { points: pts.join(' '), fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '1400', 'stroke-dashoffset': '1400' }, g2);
      var mc = -s[0] / s[1];
      o.mk = el('circle', { cx: sx(mc), cy: sy(logit(s, mc)), r: 7, fill: '#fff', stroke: C.b, 'stroke-width': 3 }, g2);
      o.lab = t2(g2, sx(CMAX) - 4, sy(logit(s, CMAX)) - 10, 'セグメント ' + (k + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    el('circle', { cx: PX + 8, cy: 144, r: 7, fill: '#fff', stroke: C.b, 'stroke-width': 3 }, p2);
    t2(p2, PX + 24, 150, '市場コスト（傾き最大）', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 206, '同じ割引でも、売上の', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 232, '伸び方はセグメントで違う', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 286, '市場コストから離れると', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 312, '伸びが鈍る（限界効果の逓減）', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（曲線のパラメータは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: bisection on lambda (Algorithm 1 on the toy segments) =====
    var g3 = S.g[2];
    // run the algorithm once, keep every step
    var lo = 0, hi = 1, steps = [{ lo: 0, hi: 1, m: 1 }];
    while (alloc(hi).cost - BUDGET > 0) { lo = hi; hi *= 2; steps.push({ lo: lo, hi: hi, m: hi }); }
    while (hi - lo > 0.004) {
      var mid = (lo + hi) / 2;
      if (alloc(mid).cost - BUDGET > 0) lo = mid; else hi = mid;
      steps.push({ lo: lo, hi: hi, m: mid });
    }
    steps.push({ lo: lo, hi: hi, m: hi, fin: true });
    S.steps = steps.map(function (st) { var r = alloc(st.m); st.cs = r.cs; st.cost = r.cost; return st; });
    var LX0 = 90, LX1 = 590, LY = 92;
    S.lx = function (l) { return LX0 + l * (LX1 - LX0); };
    t2(g3, LX0, 60, '双対変数 ' + m('λ') + ' の探索区間', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: LX0, x2: LX1, y1: LY, y2: LY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.ival = el('rect', { x: LX0, y: LY - 9, width: LX1 - LX0, height: 18, rx: 4, fill: C.bsoft }, g3);
    S.lmk = el('line', { x1: LX1, x2: LX1, y1: LY - 16, y2: LY + 16, stroke: C.b, 'stroke-width': 3 }, g3);
    txt(g3, LX0, LY + 30, '0', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    txt(g3, LX1, LY + 30, '1', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, LX0, 160, '各セグメントの割引 ' + m('c') + sub('i') + '(' + m('λ') + ')', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var CB = 230, CU = 110;
    S.cb = function (c) { return CB + c * CU; };
    el('line', { x1: CB, x2: CB, y1: 172, y2: 172 + 6 * 34, stroke: C.ink, 'stroke-width': 1 }, g3);
    S.bars3 = SEGS.map(function (s, i) {
      var y = 178 + i * 34;
      t2(g3, LX0, y + 17, 'セグメント ' + (i + 1), '', { 'font-size': 15, fill: C.ink });
      return el('rect', { x: CB, y: y, width: 0, height: 22, rx: 3, fill: C.b }, g3);
    });
    t2(g3, LX0, 410, '総費用 ' + m('Σ d') + sub('i') + m('c') + sub('i') + ' と予算 ' + m('B'), '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var GX0 = 90, GX1 = 590, GMAX = 600;
    S.gx = function (v) { return GX0 + Math.max(0, Math.min(GMAX, v)) / GMAX * (GX1 - GX0); };
    el('rect', { x: GX0, y: 424, width: GX1 - GX0, height: 26, rx: 4, fill: C.panel }, g3);
    S.gauge = el('rect', { x: GX0, y: 424, width: 0, height: 26, rx: 4, fill: C.a }, g3);
    el('line', { x1: S.gx(BUDGET), x2: S.gx(BUDGET), y1: 414, y2: 460, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g3);
    txt(g3, S.gx(BUDGET), 480, m('B') + ' = 400', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    S.lamTxt = txt(p3, PX, 140, '', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 196, '総費用', '', { 'font-size': 16, fill: C.muted });
    S.costTxt = txt(p3, PX, 228, '', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    S.iterTxt = txt(p3, PX, 280, '', { 'font-size': 17, fill: C.ink });
    S.ruleTxt = txt(p3, PX, 312, '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 370, '予算を超えたら ' + m('λ') + ' を上げ、', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 394, '余ったら下げる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（6 セグメントは架空。論文の Algorithm 1 で計算）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (arXiv v3) + A/B numbers stated in the text =====
    var g4 = S.g[3];
    var rows = [['0.1', '0.0297'], ['0.5', '0.3040'], ['1', '0.8418'], ['2', '3.053'], ['4', '15.14'], ['8', '49.89']];
    var X0 = 140, X1 = 590, Y0 = 420, Y1 = 110;
    function py(v) { return Y0 - (Math.log10(v) + 2) / 4 * (Y0 - Y1); }
    t2(g4, 70, 58, '離散化した近似誤差の上限（平均、%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.01, 0.1, 1, 10, 100].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: py(v), y2: py(v), stroke: C.hair }, g4);
      el('text', { x: X0 - 12, y: py(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = String(v);
    });
    var gw = (X1 - X0) / rows.length;
    S.bars4 = rows.map(function (r, i) {
      var x = X0 + gw * i + gw / 2, o = {};
      o.full = Y0 - py(+r[1]); o.y0 = Y0;
      o.r = el('rect', { x: x - 20, y: Y0, width: 40, height: 0, fill: C.b }, g4);
      o.t = el('text', { x: x, y: py(+r[1]) - 10, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, g4);
      o.t.textContent = r[1];
      el('text', { x: x, y: Y0 + 26, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, g4).textContent = r[0];
      o.t0 = 25 + i * 0.6;
      return o;
    });
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    t2(g4, (X0 + X1) / 2, Y0 + 56, '候補の間隔', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 100, '映画チケットの A/B テスト', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 126, '（5 週間、400 館ずつ）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 178, '売上の伸び（平均）', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 218, '6% 以上', '', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 270, 'ROI の改善（平均）', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 310, '40% 超', '', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 360, '比較対象は均等配分', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 386, '支出は約 40% 少なかった', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '左：論文 Table 1（arXiv v3）から作図　右：論文本文の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD · 2019';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'A Unified Framework for';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Marketing Budget Allocation';
    t2(g5, 480, 302, 'マーケティング予算配分の統一的な枠組み', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Kui Zhao · Junhao Hua · Ling Yan · Qi Zhang · Huan Xu · Cheng Yang';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/1902.01128';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: equal bars grow (uniform discount)
    var cu = 1.77;
    S.bars1.forEach(function (r, i) { r.setAttribute('width', cu * 120 * seg(t, 1 + i * 0.25, 2 + i * 0.25)); });
    S.p1.setAttribute('opacity', seg(t, 3, 3.8));
    // scene 2: curves draw, then market-cost markers
    S.curves.forEach(function (o, i) {
      o.path.setAttribute('stroke-dashoffset', 1400 * (1 - seg(t, 9 + i * 0.8, 11 + i * 0.8)));
      o.lab.setAttribute('opacity', seg(t, 10.5 + i * 0.8, 11.2 + i * 0.8));
      o.mk.setAttribute('opacity', seg(t, 12.4, 13));
    });
    S.p2.setAttribute('opacity', seg(t, 12.4, 13.2));
    // scene 3: one bisection step every 0.55 s
    var T0 = 17.2, DT = 0.55, n = S.steps.length;
    var u = (t - T0) / DT, k = Math.max(0, Math.min(n - 1, Math.floor(u) + 1));
    if (t < T0) k = 0;
    var cur = S.steps[k], prev = S.steps[Math.max(0, k - 1)];
    var f = k === 0 ? 1 : seg(t, T0 + (k - 1) * DT, T0 + (k - 1) * DT + 0.3);
    S.ival.setAttribute('x', S.lx(lerp(prev.lo, cur.lo, f)));
    S.ival.setAttribute('width', Math.max(2, S.lx(lerp(prev.hi, cur.hi, f)) - S.lx(lerp(prev.lo, cur.lo, f))));
    var lm = lerp(prev.m, cur.m, f);
    S.lmk.setAttribute('x1', S.lx(lm)); S.lmk.setAttribute('x2', S.lx(lm));
    S.bars3.forEach(function (r, i) {
      var c = lerp(prev.cs[i], cur.cs[i], f) * seg(t, 16.4, 17.2);
      var x0 = S.cb(0), x1 = S.cb(c);
      r.setAttribute('x', Math.min(x0, x1)); r.setAttribute('width', Math.abs(x1 - x0));
    });
    var cost = lerp(prev.cost, cur.cost, f);
    S.gauge.setAttribute('width', S.gx(cost) - S.gx(0));
    S.lamTxt.innerHTML = (cur.fin ? 'λ* ≈ ' : 'λ = ') + cur.m.toFixed(3);
    S.costTxt.innerHTML = Math.round(cur.cost) + ' / 予算 400';
    S.iterTxt.innerHTML = cur.fin ? '二分法を終了' : (k === 0 ? '初期値 λ = 1' : '反復 ' + k + ' 回目');
    S.ruleTxt.innerHTML = cur.fin ? '予算内に収まった' : (cur.cost > 400 ? '予算超過 → λ を上げる' : '予算内 → λ を下げる');
    S.ruleTxt.setAttribute('fill', cur.fin ? C.b : (cur.cost > 400 ? C.a : C.ink));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));
    // scene 4: bars grow in order, then the A/B numbers
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.6);
      o.r.setAttribute('y', o.y0 - o.full * s); o.r.setAttribute('height', o.full * s);
      o.t.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
