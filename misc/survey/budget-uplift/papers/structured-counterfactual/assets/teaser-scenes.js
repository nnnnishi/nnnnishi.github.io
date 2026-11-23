// =====================================================================
// teaser-scenes.js — Lopez et al. (AAAI 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the
// expected rewards printed in Table 2 (ImageNet, budget m = 2) of arXiv v3.
// Colours: orange = the trivial most-expensive policy / logging bias; blue = structured estimation + budgeted policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '反応は額が大きいほど上がるので、予算がなければ<span class="A">全員に最高額を配る</span>のが最適になってしまう。', en: '' },
    { ja: '過去の配布は顧客の特徴で額を決めていたので、表現と行動の依存を HSIC で罰して偏りを減らす。', en: '' },
    { ja: '推定した反応から各顧客で f − λc が最大の額を選び、<span class="B">λ を探して予算に合わせる</span>。', en: '' },
    { ja: 'ImageNet の半合成データでは、予算 m = 2 で <span class="B">CCPOvSIRE</span> の期待報酬が最も高かった。', en: '' },
    { ja: '行動の順序と予算を問題に入れ、単調性を推定に使うと、二つの実験で予算内の期待報酬が比較手法を上回った。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // toy customers: expected response for actions 1..5 (cost 0..4), increasing and concave
  var CUST = (function () {
    var r = rng(5), out = [];
    for (var i = 0; i < 8; i++) {
      var base = 0.15 + r() * 0.25, gain = 0.2 + r() * 0.35, k = 0.3 + r() * 1.1;
      var f = [0, 1, 2, 3, 4].map(function (c) { return base + gain * (1 - Math.exp(-k * c)); });
      out.push(f);
    }
    return out;
  })();
  function choose(f, lam) { var b = 0, bv = -1e9; f.forEach(function (v, c) { var s = v - lam * c; if (s > bv + 1e-12) { bv = s; b = c; } }); return b; }
  function avgCost(lam) { var s = 0; CUST.forEach(function (f) { s += choose(f, lam); }); return s / CUST.length; }
  var BUDGET = 2;
  var LAMSTAR = (function () { for (var l = 0; l < 1; l += 0.002) if (avgCost(l) <= BUDGET) return l; return 1; })();

  function grid(g, S, key) {
    var X0 = 120, Y0 = 92, W = 74, HH = 44;
    t2(g, X0, 62, '顧客（行）× 行動の額（列）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 1, 2, 3, 4].forEach(function (c) {
      t2(g, X0 + c * W + W / 2 - 4, Y0 + 8 * HH + 24, 'c=' + c, '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S[key] = CUST.map(function (f, i) {
      var y = Y0 + i * HH, o = { bars: [], sel: null };
      txt(g, X0 - 16, y + 27, String(i + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      f.forEach(function (v, c) {
        var h = v * 46;
        o.bars.push(el('rect', { x: X0 + c * W + 10, y: y + 38 - h, width: W - 28, height: h, rx: 2, fill: C.gray }, g));
      });
      o.sel = el('rect', { x: X0 + 4, y: y, width: W - 16, height: HH - 5, rx: 6, fill: 'none', 'stroke-width': 3, stroke: C.a }, g);
      return o;
    });
    return { X0: X0, W: W };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: no budget -> most expensive action for everyone =====
    var g1 = S.g[0];
    S.G1 = grid(g1, S, 'rows1');
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '期待反応は額について増加', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 146, '（論文の仮定：単調性）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 200, '予算なしで期待反応を', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '最大にすると、全員が', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 252, '最高額 ' + m('c') + ' = 4 になる', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 306, '平均費用', '', { 'font-size': 16, fill: C.muted });
    txt(p1, PX, 346, '4.0', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 396, '論文 Example 1 の状況', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（反応の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: logging bias, representation z vs action y, HSIC =====
    var g2 = S.g[1];
    var AX0 = 110, AX1 = 590, AY0 = 440, RH = 72;
    t2(g2, AX0, 62, '過去のログ：表現 ' + m('z') + ' と行動 ' + m('y'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX1, AY0 + 28, '表現 ' + m('z') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    [1, 2, 3, 4, 5].forEach(function (y) {
      var yy = AY0 - 30 - (y - 1) * RH;
      el('line', { x1: AX0, x2: AX1, y1: yy, y2: yy, stroke: C.hair }, g2);
      t2(g2, AX0 - 14, yy + 5, '行動 ' + y, '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    var r2 = rng(23); S.pts2 = [];
    for (var i = 0; i < 60; i++) {
      var y = 1 + (i % 5), zb = (y - 1) / 4 * 0.7 + 0.15 + (r2() - 0.5) * 0.22, zu = 0.05 + r2() * 0.9;
      var yy = AY0 - 30 - (y - 1) * RH + (r2() - 0.5) * 30;
      S.pts2.push({ zb: zb, zu: zu, y: yy, c: el('circle', { cx: 0, cy: yy, r: 7, fill: C.a, opacity: 0.85 }, g2) });
    }
    S.ax2 = [AX0, AX1];
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '特徴で額を決めていたので', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 146, m('z') + ' と ' + m('y') + ' が強く依存する', '', { 'font-size': 17, fill: C.a });
    t2(p2, PX, 200, '依存の大きさ HSIC', '', { 'font-size': 16, fill: C.muted });
    el('rect', { x: PX, y: 214, width: 240, height: 18, rx: 4, fill: C.panel }, p2);
    S.hsic = el('rect', { x: PX, y: 214, width: 240, height: 18, rx: 4, fill: C.a }, p2);
    t2(p2, PX, 282, '損失に ' + m('κ') + ' × HSIC を足すと、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 308, m('y') + ' によらない表現に近づく', '', { 'font-size': 17, fill: C.b });
    t2(p2, PX, 360, '目標：' + m('P') + '(' + m('z') + ')' + m('P') + '(' + m('y') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 386, '＝行動をランダムに配った状態', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（点は架空の顧客）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: lambda sweep until the average cost meets the budget =====
    var g3 = S.g[2];
    S.G3 = grid(g3, S, 'rows3');
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, 'max ' + m('f') + '(' + m('x') + ', ' + m('y') + ') − ' + m('λ') + m('c') + '(' + m('y') + ')', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 172, '乗数 ' + m('λ'), '', { 'font-size': 16, fill: C.muted });
    S.lamTxt = txt(p3, PX + 90, 172, '0.000', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 226, '平均費用', '', { 'font-size': 16, fill: C.muted });
    S.costTxt = txt(p3, PX, 268, '4.0', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    el('rect', { x: PX, y: 290, width: 240, height: 16, rx: 4, fill: C.panel }, p3);
    S.costBar = el('rect', { x: PX, y: 290, width: 240, height: 16, rx: 4, fill: C.a }, p3);
    el('line', { x1: PX + 120, x2: PX + 120, y1: 282, y2: 314, stroke: C.ink, 'stroke-width': 2 }, p3);
    t2(p3, PX + 120, 334, '予算 ' + m('m') + ' = 2', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(p3, PX, 384, m('λ') + ' は二分探索で決める', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 408, '（論文 Proposition 1）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（反応の値と予算は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v3), ImageNet, budget m = 2 =====
    var g4 = S.g[3];
    var rows = [
      ['CCPOvSIRE', 0.1408, 0.0154, 2], ['CCPOvSIRE†', 0.1186, 0.0198, 1], ['CCPOvIRE', 0.1304, 0.0112, 1],
      ['CCPOvIRE†', 0.1157, 0.0127, 1], ['GANITE', 0.0968, 0.0367, 0], ['BART', 0.0927, 0.0362, 0],
      ['CFRNet', 0.1335, 0.0197, 0], ['BanditNet', 0.0997, 0.0367, 0]
    ];
    var X0 = 220, X1 = 600, HI = 0.18, Y0 = 100, DY = 46;
    function bx(v) { return X0 + v / HI * (X1 - X0); }
    t2(g4, 70, 58, '期待報酬（ImageNet、予算 ' + m('m') + ' = 2）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.05, 0.10, 0.15].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 22, y2: Y0 + DY * 7 + 22, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + DY * 7 + 46, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(2);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 14, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': i === 0 ? 650 : 400 }, g4).textContent = rw[0];
      o.bar = el('rect', { x: X0, y: y - 12, width: 0, height: 24, rx: 3, fill: rw[3] === 2 ? C.b : rw[3] === 1 ? '#9DB4EE' : C.gray }, g4);
      o.err = el('line', { x1: bx(rw[1] - rw[2]), x2: bx(rw[1] + rw[2]), y1: y, y2: y, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      o.w = bx(rw[1]) - X0; o.t0 = 25 + i * 0.5;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'CCPOvSIRE', '', { 'font-size': 17, fill: C.ink });
    txt(p4, PX, 162, '0.1408', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 210, '次点 CFRNet：0.1335', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 238, 'BanditNet：0.0997', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 290, '† は HSIC なし', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 316, '黒線は ± 標準偏差', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 342, '100 回の平均', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v3）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2020';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Cost-Effective Incentive Allocation via';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Structured Counterfactual Inference';
    t2(g5, 480, 288, '構造を使った反実仮想推論による費用対効果の高いインセンティブ配分', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 338, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Romain Lopez · Chenchen Li · Xiang Yan · Junwu Xiong';
    el('text', { x: 480, y: 364, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Michael I. Jordan · Yuan Qi · Le Song';
    el('text', { x: 480, y: 414, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/1902.02495';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function placeSel(o, G, c, col) {
    o.sel.setAttribute('x', G.X0 + c * G.W + 4);
    o.sel.setAttribute('stroke', col);
    o.bars.forEach(function (b, k) { b.setAttribute('fill', k === c ? col : C.gray); });
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: selections appear one customer at a time, all on the most expensive action
    S.rows1.forEach(function (o, i) {
      var s = seg(t, 1.5 + i * 0.3, 1.9 + i * 0.3);
      placeSel(o, S.G1, 4, s > 0 ? C.a : C.gray);
      o.sel.setAttribute('opacity', s);
    });
    S.p1.setAttribute('opacity', seg(t, 3.5, 4.3));
    // scene 2: points start correlated with the action, then move to an action-independent spread
    var k2 = seg(t, 11, 14);
    S.pts2.forEach(function (q) {
      var z = q.zb + (q.zu - q.zb) * k2;
      q.c.setAttribute('cx', S.ax2[0] + z * (S.ax2[1] - S.ax2[0]));
      q.c.setAttribute('fill', H.mix(C.a, C.b, k2));
    });
    S.hsic.setAttribute('width', 240 * (1 - 0.85 * k2));
    S.hsic.setAttribute('fill', H.mix(C.a, C.b, k2));
    S.p2.setAttribute('opacity', seg(t, 8.8, 9.6));
    // scene 3: lambda sweeps from 0 to the smallest value meeting the budget
    var lam = LAMSTAR * seg(t, 17.5, 21.5), ac = avgCost(lam), ok = ac <= BUDGET + 1e-9;
    S.rows3.forEach(function (o, i) { placeSel(o, S.G3, choose(CUST[i], lam), ok ? C.b : C.a); o.sel.setAttribute('opacity', 1); });
    S.lamTxt.textContent = lam.toFixed(3);
    S.costTxt.textContent = ac.toFixed(1);
    S.costTxt.setAttribute('fill', ok ? C.b : C.a);
    S.costBar.setAttribute('width', 240 * ac / 4);
    S.costBar.setAttribute('fill', ok ? C.b : C.a);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.3));
    // scene 4: bars grow in table order, then the panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.6);
      o.bar.setAttribute('width', o.w * s); o.err.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 29.2, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
