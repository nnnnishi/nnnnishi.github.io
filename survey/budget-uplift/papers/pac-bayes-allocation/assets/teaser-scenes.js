// =====================================================================
// teaser-scenes.js — Pellatt (arXiv 2022), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 3 uses the toy delta_y = 0.3 + x, delta_c = 1.2 - x, x ~ U(0,1), five rules "treat if x >= t",
// weights proportional to exp[lambda (W - u K)] with lambda = 12 (same as figure 2 on the page).
// Scene 4 uses the numbers printed in Table 1 (arXiv v2), a = 4.
// Colours: orange = cost / the cost-blind rule (Ignore Cost); blue = welfare / the paper's PAC-Bayesian rules.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '効果の大きい順に処置すると、費用の高い人で<span class="A">予算</span>が早く尽きることがある。', en: '' },
    { ja: '予算つきの最適ルールは、<span class="B">効果</span>が「η × <span class="A">費用</span>」を上回る人に処置する形になる。', en: '' },
    { ja: '候補ルールを「<span class="B">福祉</span> − u × <span class="A">費用</span>」の指数で重みづけし、u を上げると費用の小さいルールに重みが移る。', en: '' },
    { ja: 'シミュレーション（a = 4）では、低い予算で <span class="B">PB-B</span> が R-NP を上回り、<span class="A">費用を無視する方法</span>を大きく上回った。', en: '' },
    { ja: 'u をいくつか試して費用を推定し、予算に合う規則を選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.72em" dy="5">' + s + '</tspan><tspan dy="-5"></tspan>'; }

  // toy model for scene 3
  var TS = [0, 0.2, 0.4, 0.6, 0.8], LAM = 12;
  function Wt(t) { return 0.3 * (1 - t) + (1 - t * t) / 2; }
  function Kt(t) { return 1.2 * (1 - t) - (1 - t * t) / 2; }
  function weights(u) {
    var s = TS.map(function (t) { return LAM * (Wt(t) - u * Kt(t)); });
    var mx = Math.max.apply(null, s), w = s.map(function (v) { return Math.exp(v - mx); });
    var z = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (v) { return v / z; });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: rank by effect, budget 10 runs out after 3 people =====
    var g1 = S.g[0];
    var P1 = [[5.0, 5], [4.6, 4], [4.2, 1], [3.6, 4], [3.1, 1], [2.6, 1], [2.0, 1], [1.4, 1]];
    t2(g1, 70, 50, '効果の大きい順', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g1, 70 + 34, 76, '効果', '', { 'font-size': 14, fill: C.muted });
    t2(g1, 470, 76, '費用', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.rows1 = P1.map(function (p, i) {
      var y = 92 + i * 50, o = {};
      o.dot = el('circle', { cx: 82, cy: y + 14, r: 11, fill: C.gray }, g1);
      o.bar = el('rect', { x: 104, y: y + 4, width: p[0] * 56, height: 20, rx: 4, fill: C.gray }, g1);
      o.coin = el('circle', { cx: 470, cy: y + 14, r: 6 + p[1] * 3.2, fill: '#fff', stroke: C.a, 'stroke-width': 2.5 }, g1);
      txt(g1, 470, y + 19, String(p[1]), { 'font-size': 14, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
      return o;
    });
    // budget meter
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, '予算 10', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    el('rect', { x: PX, y: 126, width: 240, height: 24, rx: 5, fill: '#F2F4F7', stroke: C.hair }, p1);
    S.meter = el('rect', { x: PX, y: 126, width: 0, height: 24, rx: 5, fill: C.a }, p1);
    S.usedTexts = [0, 5, 9, 10].map(function (v, i) {
      return t2(p1, PX, 182, '使った費用 ' + v + ' ／ 処置 ' + i + ' 人', '', { 'font-size': 16, fill: C.ink });
    });
    S.end1 = el('g', {}, p1);
    t2(S.end1, PX, 240, '費用 5 と 4 の 2 人で', '', { 'font-size': 17, fill: C.ink });
    t2(S.end1, PX, 266, '予算の 9 割を使う。', '', { 'font-size': 17, fill: C.ink });
    t2(S.end1, PX, 312, '残りには費用 1 の人が 5 人いるが、', '', { 'font-size': 15, fill: C.muted });
    t2(S.end1, PX, 336, 'もう処置できない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（効果と費用は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: plane (delta_c, delta_y), line delta_y = eta * delta_c rotates =====
    var g2 = S.g[1];
    var AX0 = 90, AX1 = 600, AY0 = 470, AY1 = 70, CMIN = -1, CMAX = 2, YMIN = -1, YMAX = 3;
    function sx(c) { return AX0 + (c - CMIN) / (CMAX - CMIN) * (AX1 - AX0); }
    function sy(v) { return AY0 - (v - YMIN) / (YMAX - YMIN) * (AY0 - AY1); }
    S.sx2 = sx; S.sy2 = sy; S.lim2 = [CMIN, CMAX, YMIN, YMAX];
    S.region2 = el('polygon', { points: '', fill: C.bsoft }, g2);
    el('line', { x1: AX0, x2: AX1, y1: sy(0), y2: sy(0), stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: sx(0), x2: sx(0), y1: AY0, y2: AY1 - 8, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.line2 = el('line', { stroke: C.ink, 'stroke-width': 3 }, g2);
    t2(g2, AX1, sy(0) + 28, '費用 ' + m('δ') + sub('c') + '(' + m('x') + ') →', '', { 'font-size': 16, fill: C.a, 'text-anchor': 'end' });
    t2(g2, sx(0) + 10, AY1 - 14, '↑ 効果 ' + m('δ') + sub('y') + '(' + m('x') + ')', '', { 'font-size': 16, fill: C.b });
    var r2 = rng(7); S.pts2 = [];
    for (var i = 0; i < 44; i++) {
      var c = -0.85 + r2() * 2.75, v = -0.8 + r2() * 3.6;
      S.pts2.push({ c: c, v: v, e: el('circle', { cx: sx(c), cy: sy(v), r: 7.5 }, g2) });
    }
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 130, m('δ') + sub('y') + ' &gt; ' + m('η') + sub('B') + '·' + m('δ') + sub('c'), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    S.etaTxt = txt(p2, PX, 184, '', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    t2(p2, PX, 236, '予算に余裕あり：' + m('η') + ' = 0', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 262, '予算が厳しいほど ' + m('η') + ' が大きい', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 312, '処置で費用が減る人（左側）は', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 336, '効果が小さくても処置されうる', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（点は架空の人）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: Gibbs weights over 5 rules as u sweeps 0 -> 2 =====
    var g3 = S.g[2];
    t2(g3, 70, 52, '候補ルール：' + m('x') + ' ≥ ' + m('t') + ' なら処置', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var RX = 150, RW = 200;
    S.w3 = TS.map(function (t, i) {
      var y = 76 + i * 44, o = {};
      txt(g3, RX - 14, y + 20, m('t') + ' = ' + t, { 'font-size': 16, fill: C.muted, 'text-anchor': 'end' });
      el('rect', { x: RX, y: y + 4, width: RW, height: 22, rx: 4, fill: '#F2F4F7' }, g3);
      el('rect', { x: RX + t * RW, y: y + 4, width: (1 - t) * RW, height: 22, rx: 4, fill: C.gray }, g3);
      o.bar = el('rect', { x: RX + RW + 20, y: y + 4, width: 0, height: 22, rx: 4, fill: C.b }, g3);
      o.lab = txt(g3, 0, y + 21, '', { 'font-size': 15, fill: C.ink });
      return o;
    });
    t2(g3, RX + RW / 2, 310, '処置する範囲', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, RX + RW + 60, 310, '重み', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    // staircase
    var QX0 = 150, QW = 400, QY0 = 470, QH = 120;
    S.q3 = { x0: QX0, w: QW, y0: QY0, h: QH };
    el('line', { x1: QX0, x2: QX0 + QW, y1: QY0, y2: QY0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: QX0, x2: QX0, y1: QY0, y2: QY0 - QH - 8, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.stair = el('path', { d: '', fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g3);
    t2(g3, QX0 - 12, QY0 - QH + 6, '処置確率', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    txt(g3, QX0 - 12, QY0 + 5, '0', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    t2(g3, QX0 + QW, QY0 + 24, '共変量 ' + m('x') + ' →', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    S.uTxt = txt(p3, PX, 110, '', { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    el('rect', { x: PX, y: 128, width: 240, height: 6, rx: 3, fill: C.hair }, p3);
    S.knob = el('circle', { cx: PX, cy: 131, r: 9, fill: C.ink }, p3);
    t2(p3, PX, 190, '福祉', '', { 'font-size': 16, fill: C.muted });
    S.wTxt = txt(p3, PX + 70, 190, '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 226, '費用', '', { 'font-size': 16, fill: C.muted });
    S.kTxt = txt(p3, PX + 70, 226, '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(p3, PX, 280, '重み ∝ exp[' + m('λ') + '(' + m('W') + ' − ' + m('u') + m('K') + ')]', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 318, m('u') + ' = 0 は予算なし。' + m('u') + ' ごとに', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 342, '費用の違う規則ができる。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（効果 0.3 + ' + m('x') + '、費用 1.2 − ' + m('x') + '、' + m('λ') + ' = 12 は解説者の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (arXiv v2), a = 4, welfare gain vs cost =====
    var g4 = S.g[3];
    var COST = [0.1, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
    var SER = [
      { name: 'PB-B', col: C.b, v: [0.61, 0.82, 1.09, 1.35, 1.58, 1.74, 1.84], w: 3.5 },
      { name: 'R-NP', col: C.ink, v: [0.57, 0.78, 1.07, 1.34, 1.57, 1.74, 1.83], w: 2, dash: '6 5' },
      { name: 'IC', col: C.a, v: [0.10, 0.30, 0.61, 0.92, 1.24, 1.51, 1.70], w: 3 }
    ];
    var BX0 = 110, BX1 = 600, BY0 = 450, BY1 = 90;
    function bx(c) { return BX0 + c / 1.9 * (BX1 - BX0); }
    function by(v) { return BY0 - v / 2 * (BY0 - BY1); }
    [0, 0.5, 1, 1.5, 2].forEach(function (v) {
      el('line', { x1: BX0, x2: BX1, y1: by(v), y2: by(v), stroke: C.hair }, g4);
      txt(g4, BX0 - 10, by(v) + 5, v.toFixed(1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    [0.1, 0.6, 1.2, 1.8].forEach(function (c) { txt(g4, bx(c), BY0 + 24, c.toFixed(1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }); });
    t2(g4, BX1, BY0 + 50, '費用水準 →', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    t2(g4, BX0 - 40, 62, '福祉の増分（' + m('a') + ' = 4）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.ser4 = SER.map(function (s, k) {
      var o = { pts: [] };
      o.path = el('polyline', { points: '', fill: 'none', stroke: s.col, 'stroke-width': s.w, 'stroke-dasharray': s.dash || 'none' }, g4);
      o.xy = s.v.map(function (v, i) { return [bx(COST[i]), by(v)]; });
      o.xy.forEach(function (p) { o.pts.push(el('circle', { cx: p[0], cy: p[1], r: 5.5, fill: s.col }, g4)); });
      o.lab = txt(g4, bx(1.8) + 12, by(s.v[6]) + (k === 0 ? -10 : k === 1 ? 12 : 24), s.name, { 'font-size': 15, 'font-weight': 600, fill: s.col });
      o.t0 = 25 + k * 1.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '費用 0.1 のとき', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 152, 'PB-B', { 'font-size': 18, fill: C.b, 'font-weight': 600 });
    txt(p4, PX + 110, 152, '0.61', { 'font-size': 26, fill: C.b, 'font-weight': 650 });
    txt(p4, PX, 190, 'R-NP', { 'font-size': 18, fill: C.ink, 'font-weight': 600 });
    txt(p4, PX + 110, 190, '0.57', { 'font-size': 26, fill: C.ink, 'font-weight': 650 });
    txt(p4, PX, 228, 'IC', { 'font-size': 18, fill: C.a, 'font-weight': 600 });
    txt(p4, PX + 110, 228, '0.10', { 'font-size': 26, fill: C.a, 'font-weight': 650 });
    t2(p4, PX, 280, 'R-NP：効果と費用の比を推定', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 304, 'IC：効果だけを推定', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 346, 'PB-B と R-NP の差は、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 370, '高い費用水準ではほぼなくなる。', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2022';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'PAC-Bayesian Treatment Allocation';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Under Budget Constraints';
    t2(g5, 480, 302, '予算制約のもとでの PAC-Bayes による処置割当て', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Daniel F. Pellatt';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2212.09007';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1: treat in order of effect; budget 10 is used up after 3 people
    var steps = [seg(t, 1.6, 2.2), seg(t, 3.0, 3.6), seg(t, 4.4, 5.0)];
    var spent = 5 * steps[0] + 4 * steps[1] + 1 * steps[2];
    S.meter.setAttribute('width', 240 * spent / 10);
    S.rows1.forEach(function (o, i) {
      var k = i < 3 ? steps[i] : 0;
      o.dot.setAttribute('fill', H.mix(C.gray, C.b, k));
      o.bar.setAttribute('fill', H.mix(C.gray, C.b, k));
      o.bar.setAttribute('opacity', i < 3 ? 1 : 1 - 0.45 * seg(t, 5.2, 5.8));
    });
    var n = t < 2.2 ? 0 : t < 3.6 ? 1 : t < 5.0 ? 2 : 3;
    S.usedTexts.forEach(function (g, i) { g.setAttribute('opacity', i === n ? 1 : 0); });
    S.p1.setAttribute('opacity', seg(t, 0.8, 1.4));
    S.end1.setAttribute('opacity', seg(t, 5.4, 6.0));

    // scene 2: eta grows from 0 to 1.2
    var eta = 1.2 * seg(t, 10, 13.5);
    var L = S.lim2, sx = S.sx2, sy = S.sy2;
    var xa = L[0], ya = eta * L[0];
    var xb = eta > 0 ? Math.min(L[1], L[3] / eta) : L[1], yb = eta * xb;
    S.line2.setAttribute('x1', sx(xa)); S.line2.setAttribute('y1', sy(ya));
    S.line2.setAttribute('x2', sx(xb)); S.line2.setAttribute('y2', sy(yb));
    var poly = [[xa, ya], [xb, yb]];
    if (xb >= L[1] && yb < L[3]) poly.push([L[1], L[3]]);
    poly.push([L[0], L[3]]);
    S.region2.setAttribute('points', poly.map(function (p) { return sx(p[0]) + ',' + sy(p[1]); }).join(' '));
    S.region2.setAttribute('opacity', seg(t, 9, 9.8));
    S.line2.setAttribute('opacity', seg(t, 9, 9.8));
    var on = seg(t, 9.4, 10);
    S.pts2.forEach(function (q) {
      var up = q.v > eta * q.c;
      q.e.setAttribute('fill', up ? H.mix('#ffffff', C.b, on) : '#ffffff');
      q.e.setAttribute('stroke', up ? H.mix(C.muted, C.b, on) : C.muted);
      q.e.setAttribute('stroke-width', 2);
    });
    S.etaTxt.innerHTML = '<tspan ' + MI + '>η</tspan><tspan font-size="0.72em" dy="5">B</tspan><tspan dy="-5"> = ' + eta.toFixed(2) + '</tspan>';
    S.p2.setAttribute('opacity', seg(t, 9.2, 10));

    // scene 3: u sweeps 0 -> 2
    var u = 2 * seg(t, 18, 22.5);
    var w = weights(u), gw = 0, gk = 0, cum = 0, d = '', q = S.q3;
    w.forEach(function (v, i) {
      gw += v * Wt(TS[i]); gk += v * Kt(TS[i]);
      var o = S.w3[i];
      o.bar.setAttribute('width', v * 160);
      o.lab.setAttribute('x', 150 + 200 + 28 + v * 160);
      o.lab.textContent = v.toFixed(2);
      cum += v;
      var xa3 = q.x0 + TS[i] * q.w, xb3 = q.x0 + (i < 4 ? TS[i + 1] : 1) * q.w, y = q.y0 - cum * q.h;
      d += (i === 0 ? 'M' : 'L') + xa3.toFixed(1) + ',' + y.toFixed(1) + ' L' + xb3.toFixed(1) + ',' + y.toFixed(1) + ' ';
    });
    S.stair.setAttribute('d', d);
    S.uTxt.innerHTML = '<tspan ' + MI + '>u</tspan> = ' + u.toFixed(2);
    S.knob.setAttribute('cx', PX + 240 * u / 2);
    S.wTxt.textContent = gw.toFixed(2);
    S.kTxt.textContent = gk.toFixed(2);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.5));

    // scene 4: series drawn in order
    S.ser4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 1.4), nn = o.xy.length, upto = k * (nn - 1);
      var pts = [];
      for (var i = 0; i < nn; i++) {
        if (i <= upto) pts.push(o.xy[i]);
        o.pts[i].setAttribute('opacity', i <= upto + 1e-6 && k > 0 ? 1 : 0);
      }
      var fi = Math.floor(upto);
      if (fi < nn - 1 && k > 0) {
        var f = upto - fi, A = o.xy[fi], B = o.xy[fi + 1];
        pts.push([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]);
      }
      o.path.setAttribute('points', pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 1.3, o.t0 + 1.7));
    });
    S.p4.setAttribute('opacity', seg(t, 29.6, 30.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
