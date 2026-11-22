// =====================================================================
// teaser-scenes.js — Cerulli (arXiv 2605.12235v1, 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 use the six-unit worked example of the paper's Appendix 1–2
// (v = 20,18,14,13,8,7; w = 10,9,4,4,2,2; budget 12; at least 2 units).
// Scene 2 is a schematic with explainer-chosen values (lambda* = 1, nu* = 0.6, t* = 0.58), labelled 模式図.
// Scene 4 uses the numbers printed in Table 2 (and Table 1 for the side note).
// Scene 3 shows the infeasible core at lambda = 0.2 in grey (not orange: orange is reserved for RC).
// Colours: orange = rank-and-cut (constant ratio cutoff) and its misallocation;
//          blue = LP-optimal affine threshold tau - lambda c + nu >= 0 and the GLC algorithm.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, mix = H.mix;

  var CAPTIONS = [
    { ja: '効果も費用も人ごとに違うなかで、予算の上限と最低カバー率を同時に満たすように処置する人を選ぶ。', en: '' },
    { ja: '最低カバー率が効くと、最適な費用対効果の下限は費用とともに上がり、<span class="A">一定の線で切る RC</span> とずれる。', en: '' },
    { ja: '<span class="B">GLC</span> は予算の影の価格 λ を動かし、スコア上位で人数を満たしてから予算いっぱいまで人を足す。', en: '' },
    { ja: 'シミュレーションでは、費用がばらつき最低カバー率が効く場合だけ、<span class="A">RC</span> と LP の割当てが大きく食い違った。', en: '' },
    { ja: '予算だけなら費用対効果の順で足りるが、最低カバー率が効くときはその影の価格も判定に入れる必要がある。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  var V = [20, 18, 14, 13, 8, 7], W = [10, 9, 4, 4, 2, 2];

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the six units of Appendix 1, value and cost =====
    var g1 = S.g[0];
    t2(g1, 80, 52, '6 人の例（価値 ' + m('v') + ' と費用 ' + m('w') + '）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows1 = V.map(function (v, i) {
      var y = 84 + i * 64, o = {};
      txt(g1, 80, y + 26, String(i + 1), { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      o.v = el('rect', { x: 120, y: y + 6, width: 0, height: 20, rx: 3, fill: '#5B6676' }, g1);
      o.w = el('rect', { x: 120, y: y + 30, width: 0, height: 14, rx: 3, fill: C.gray }, g1);
      o.vt = txt(g1, 120 + v * 12 + 10, y + 22, m('v') + ' = ' + v, { 'font-size': 15, fill: C.ink });
      o.wt = txt(g1, 120 + W[i] * 12 + 10, y + 43, m('w') + ' = ' + W[i], { 'font-size': 15, fill: C.muted });
      o.vw = v * 12; o.ww = W[i] * 12; o.k = i;
      return o;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '予算の上限', '', { 'font-size': 16, fill: C.muted });
    txt(p1, PX, 156, m('W') + ' = 12', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 206, '最低カバー（人数の下限）', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 242, m('K') + ' = 2 人以上', '', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 300, '選び方は 2<tspan dy="-10" font-size="13" ' + MI + '>N</tspan><tspan dy="10"> 通り</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 330, '（' + m('N') + ' = 6 なら 64 通り）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 380, '目的：処置する人の', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 406, m('v') + ' の合計を最大にする', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '論文 Appendix 1 の数値例', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: (c, r) plane, LP boundary lambda - nu/c vs RC flat cutoff t* =====
    var g2 = S.g[1];
    var AX0 = 100, AX1 = 590, AY0 = 470, AY1 = 80, CMIN = 0.4, CMAX = 3.2, RMIN = -0.8, RMAX = 1.1;
    var LAM = 1.0, NU = 0.6, TS = 0.58, CX = NU / (LAM - TS);
    function sx(c) { return AX0 + (c - CMIN) / (CMAX - CMIN) * (AX1 - AX0); }
    function sy(r) { return AY0 - (r - RMIN) / (RMAX - RMIN) * (AY0 - AY1); }
    function bLP(c) { return LAM - NU / c; }
    // misallocation regions
    var left = [], right = [], c;
    for (c = CMIN; c <= CX + 1e-9; c += 0.02) left.push(sx(c) + ',' + sy(bLP(c)));
    left.push(sx(CX) + ',' + sy(TS)); left.push(sx(CMIN) + ',' + sy(TS));
    for (c = CX; c <= CMAX + 1e-9; c += 0.02) right.push(sx(c) + ',' + sy(bLP(c)));
    right.push(sx(CMAX) + ',' + sy(bLP(CMAX)));
    right.push(sx(CMAX) + ',' + sy(TS)); right.push(sx(CX) + ',' + sy(TS));
    S.regB = el('polygon', { points: left.join(' '), fill: C.bsoft }, g2);
    S.regA = el('polygon', { points: right.join(' '), fill: '#FCEBDF' }, g2);
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX0, x2: AX1, y1: sy(0), y2: sy(0), stroke: C.hair, 'stroke-width': 1 }, g2);
    t2(g2, AX1, AY0 + 30, '費用 ' + m('c') + '(' + m('x') + ') →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, AX0 + 10, AY1 - 18, '↑ 費用対効果 ' + m('r') + ' = ' + m('τ') + '/' + m('c'), '', { 'font-size': 16, fill: C.ink });
    S.flat = el('line', { x1: AX0, x2: AX0, y1: sy(TS), y2: sy(TS), stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '10 6' }, g2);
    var pts = []; for (c = CMIN; c <= CMAX + 1e-9; c += 0.02) pts.push([sx(c), sy(bLP(c))]);
    S.curvePts = pts;
    S.curve = el('polyline', { points: '', fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g2);
    S.cxl = el('line', { x1: sx(CX), x2: sx(CX), y1: AY0, y2: AY1, stroke: C.muted, 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }, g2);
    S.cxt = txt(g2, sx(CX) + 8, AY0 - 12, m('c') + '<tspan dy="-8" font-size="12">×</tspan>', { 'font-size': 17, fill: C.muted });
    S.labB = t2(g2, sx(0.5), sy(0.36), 'LP だけが処置', '', { 'font-size': 15, 'font-weight': 600, fill: C.b });
    S.labA = t2(g2, sx(3.15), sy(0.66), 'RC だけが処置', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'end' });
    var p2 = S.p2 = el('g', {}, g2);
    el('line', { x1: PX, x2: PX + 34, y1: 118, y2: 118, stroke: C.b, 'stroke-width': 3.5 }, p2);
    t2(p2, PX + 44, 124, '最適（LP）の下限', '', { 'font-size': 16, fill: C.ink });
    txt(p2, PX + 44, 152, m('λ') + '* − ' + m('ν') + '*/' + m('c'), { 'font-size': 18, fill: C.b });
    el('line', { x1: PX, x2: PX + 34, y1: 196, y2: 196, stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '10 6' }, p2);
    t2(p2, PX + 44, 202, 'RC の下限（一定）', '', { 'font-size': 16, fill: C.ink });
    txt(p2, PX + 44, 230, m('t') + '*', { 'font-size': 18, fill: C.a });
    t2(p2, PX, 290, m('ν') + '* = 0（最低カバー率が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 316, '効かない）なら曲線は水平に', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 342, 'なり、二つは一致する。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 392, '費用が一定でも一致する。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（' + m('λ') + '*, ' + m('ν') + '*, ' + m('t') + '* は解説者が置いた値）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: GLC on the Appendix example, lambda 0.2 -> 1.2 =====
    var g3 = S.g[2];
    t2(g3, 80, 52, 'スコア ' + m('a') + '<tspan dy="5" font-size="12">' + m('i') + '</tspan><tspan dy="-5"> = ' + m('v') + '</tspan><tspan dy="5" font-size="12">' + m('i') + '</tspan><tspan dy="-5"> − ' + m('λ') + m('w') + '</tspan><tspan dy="5" font-size="12">' + m('i') + '</tspan><tspan dy="-5">（大きい順）</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows3 = V.map(function (v, i) {
      var o = { g: el('g', {}, g3), i: i };
      o.lab = txt(o.g, 80, 26, String(i + 1), { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      o.bar = el('rect', { x: 120, y: 8, width: 0, height: 26, rx: 4, fill: C.gray }, o.g);
      o.val = txt(o.g, 0, 27, '', { 'font-size': 15, fill: C.ink });
      txt(o.g, 520, 27, m('w') + ' = ' + W[i], { 'font-size': 15, fill: C.muted });
      return o;
    });
    S.cut3 = el('line', { x1: 70, x2: 600, y1: 84 + 2 * 60 - 8, y2: 84 + 2 * 60 - 8, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g3);
    S.cutLab3 = t2(g3, 598, 84 + 2 * 60 - 18, '上位 ' + m('K') + ' = 2 人（必ず処置）', '', { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    S.lamT = txt(p3, PX, 120, '', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 174, '使った費用（上限 12）', '', { 'font-size': 16, fill: C.muted });
    el('rect', { x: PX, y: 188, width: 240, height: 22, rx: 4, fill: C.panel }, p3);
    S.meter = el('rect', { x: PX, y: 188, width: 0, height: 22, rx: 4, fill: C.a }, p3);
    el('line', { x1: PX + 160, x2: PX + 160, y1: 180, y2: 218, stroke: C.ink, 'stroke-width': 2 }, p3);
    S.costT = txt(p3, PX, 246, '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    S.note3a = t2(p3, PX, 296, '上位 2 人だけで 19 &gt; 12。', '', { 'font-size': 16, fill: C.ink });
    S.note3b = t2(p3, PX, 322, m('λ') + ' が小さすぎるので上げる。', '', { 'font-size': 16, fill: C.ink });
    S.note3c = t2(p3, PX, 296, '3, 4 で人数を満たし、', '', { 'font-size': 16, fill: C.b });
    S.note3d = t2(p3, PX, 322, '5, 6 を足して費用 12、', '', { 'font-size': 16, fill: C.b });
    S.note3e = t2(p3, PX, 348, m('v') + ' の合計 42。', '', { 'font-size': 16, fill: C.b });
    t2(g3, 940, 520, '論文 Appendix 1 の数値例（' + m('λ') + ' = 0.2 と 1.2）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2, misallocation area between LP and RC =====
    var g4 = S.g[3];
    var rows = [
      ['(1) 費用のばらつき大・' + m('ρ') + ' = 0.5', 0.1520, '0.1520', true],
      ['(2) 費用のばらつき大・' + m('ρ') + ' = 0.1', 0.0010, '0.0010', false],
      ['(3) 費用一定・' + m('ρ') + ' = 0.5', 0.0020, '0.0020', false],
      ['(4) 費用一定・' + m('ρ') + ' = 0.1', 0.0020, '0.0020', false]
    ];
    var BX = 90, BW = 400 / 0.16;
    t2(g4, 80, 52, 'LP と RC で割当てが食い違う人の割合', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars4 = rows.map(function (r, i) {
      var y = 96 + i * 96, o = {};
      t2(g4, BX, y, r[0], '', { 'font-size': 16, fill: C.ink });
      o.bar = el('rect', { x: BX, y: y + 12, width: 0, height: 30, rx: 4, fill: r[3] ? C.a : C.gray }, g4);
      o.full = Math.max(r[1] * BW, 3);
      o.val = txt(g4, BX + o.full + 12, y + 35, r[2], { 'font-size': 18, 'font-weight': 650, fill: r[3] ? C.a : C.ink });
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'カバー制約の影の価格', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 134, m('ν') + ' の平均', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 174, '0.842', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(p4, PX + 96, 174, '（1）だけ', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 206, '（2）〜（4）は 0.000', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 270, '実験 1 の GLC（' + m('n') + ' = 500）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 298, '1 人あたり価値 0.2099', '', { 'font-size': 16, fill: C.b });
    t2(p4, PX, 324, '最適解（OPT）は 0.2112', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 372, 'どちらも真の効果を使う', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 394, 'シミュレーション', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（' + m('n') + ' = 500、100 回の平均）と Table 1 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2026';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Policy Learning under';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Budget and Coverage Constraints';
    t2(g5, 480, 302, '予算と最低カバー率の制約のもとでの最適方策学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Giovanni Cerulli';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2605.12235';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow row by row, then the constraints
    S.rows1.forEach(function (o) {
      var s = seg(t, 0.8 + o.k * 0.35, 1.6 + o.k * 0.35);
      o.v.setAttribute('width', o.vw * s); o.w.setAttribute('width', o.ww * s);
      o.vt.setAttribute('opacity', s); o.wt.setAttribute('opacity', s);
    });
    S.p1.setAttribute('opacity', seg(t, 3.4, 4.2));

    // scene 2: flat RC line, then LP curve draws, then the two misallocation regions
    var f = seg(t, 9, 10.2);
    S.flat.setAttribute('x2', 100 + 490 * f);
    var k = seg(t, 10.6, 12.6), n = Math.max(2, Math.round(S.curvePts.length * k));
    S.curve.setAttribute('points', S.curvePts.slice(0, n).map(function (p) { return p.join(','); }).join(' '));
    S.curve.setAttribute('opacity', k > 0 ? 1 : 0);
    var r = seg(t, 12.8, 13.6);
    S.regA.setAttribute('opacity', r); S.regB.setAttribute('opacity', r);
    S.labA.setAttribute('opacity', r); S.labB.setAttribute('opacity', r);
    S.cxl.setAttribute('opacity', r); S.cxt.setAttribute('opacity', r);
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));

    // scene 3: lambda 0.2 (core 1,2 infeasible) -> 1.2 (core 3,4, then add 5,6)
    var sw = seg(t, 18.6, 20);
    var lam = 0.2 + sw;
    var R0 = [0, 1, 2, 3, 4, 5], R1 = [2, 3, 0, 1, 4, 5];   // rank of unit i at lambda 0.2 / 1.2
    var bad = seg(t, 17.2, 17.8) * (1 - seg(t, 18.4, 18.8));
    var core = seg(t, 20.2, 20.7), add5 = seg(t, 21.0, 21.4), add6 = seg(t, 21.6, 22.0);
    S.rows3.forEach(function (o) {
      var i = o.i, a = V[i] - lam * W[i];
      var y = 84 + (R0[i] + (R1[i] - R0[i]) * sw) * 60 - 10;
      o.g.setAttribute('transform', 'translate(0,' + y + ')');
      o.bar.setAttribute('width', a * 18);
      o.val.setAttribute('x', 120 + a * 18 + 10);
      o.val.textContent = a.toFixed(1);
      var col = C.gray;
      if (i < 2) col = mix(C.gray, C.muted, bad);
      if ((i === 2 || i === 3)) col = mix(C.gray, C.b, core);
      if (i === 4) col = mix(C.gray, C.b, add5);
      if (i === 5) col = mix(C.gray, C.b, add6);
      o.bar.setAttribute('fill', col);
    });
    S.cut3.setAttribute('opacity', seg(t, 16.8, 17.2));
    S.cutLab3.setAttribute('opacity', seg(t, 16.8, 17.2));
    S.lamT.innerHTML = '<tspan ' + MI + '>λ</tspan> = ' + lam.toFixed(1);
    var cost = bad > 0.01 ? 19 * bad : 8 * core + 2 * add5 + 2 * add6;
    var shown = bad > 0.01 ? 19 : 8 * Math.round(core) + 2 * Math.round(add5) + 2 * Math.round(add6);
    S.meter.setAttribute('width', Math.min(cost / 12 * 160, 240));
    S.meter.setAttribute('fill', bad > 0.01 ? C.muted : C.b);
    S.costT.textContent = (bad > 0.01 || core > 0.01) ? shown + ' / 12' : '';
    S.costT.setAttribute('fill', bad > 0.01 ? C.ink : C.b);
    S.note3a.setAttribute('opacity', bad); S.note3b.setAttribute('opacity', bad);
    S.note3c.setAttribute('opacity', core); S.note3d.setAttribute('opacity', add6); S.note3e.setAttribute('opacity', add6);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.2));

    // scene 4: bars in order
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.7);
      o.bar.setAttribute('width', o.full * s); o.val.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
