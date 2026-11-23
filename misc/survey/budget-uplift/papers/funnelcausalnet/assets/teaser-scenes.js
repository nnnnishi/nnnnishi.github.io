// =====================================================================
// teaser-scenes.js — FunnelCausalNet (Zhang et al., CIKM 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 11 of arXiv v1 (Delta ROI, three-seed means).
// Colours: orange = direct GMV regression / Bernoulli switching variance / best of the other methods;
//          blue = funnel composition mu_conv * mu_val (FunnelCausalNet).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'クーポン施策の GMV はほとんどの人でゼロになり、<span class="A">そのまま回帰すると</span>効果の推定がばらつく。', en: '' },
    { ja: 'GMV の分散には購入者の間のばらつきに加えて、<span class="A">ゼロかどうかの切り替わり</span>による項がある。', en: '' },
    { ja: 'FunnelCausalNet は段階ごとに<span class="B">購入確率と購入者の注文額を掛けて</span> GMV の期待値を出す。', en: '' },
    { ja: 'ホテルクーポンの RCT ログでは、7 地点すべてで<span class="B">平均 ΔROI</span> が最も高かった。ただし有意差とはしていない。', en: '' },
    { ja: 'ゼロの多い GMV は 2 段階に分けて推定し、その推定値を予算つきの段階の割当てに渡す。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.72em" dy="5">' + s + '</tspan><tspan dy="-5"></tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: zero-inflated, heavy-tailed GMV (toy histogram) =====
    var g1 = S.g[0];
    var BX0 = 90, BY0 = 440, BW = 46;
    // share of users per GMV bin (toy): bin 0 = no purchase
    var bins = [0.90, 0.034, 0.025, 0.016, 0.010, 0.006, 0.004, 0.003, 0.002];
    S.bars1 = bins.map(function (v, i) {
      var h = i === 0 ? 330 : v * 3300;
      var r = el('rect', { x: BX0 + i * (BW + 8), y: BY0 - h, width: BW, height: h, rx: 3, fill: i === 0 ? C.a : C.gray }, g1);
      return { r: r, h: h };
    });
    el('line', { x1: BX0 - 10, x2: 600, y1: BY0, y2: BY0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, BX0 + BW / 2, BY0 + 26, '0', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g1, 590, BY0 + 26, 'GMV →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g1, BX0 + BW + 18, 150, '購入しなかった人：GMV = 0', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    S.tail1 = t2(g1, 260, 330, '購入した人：裾が重い', '', { 'font-size': 17, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '直接回帰', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 172, 'ゼロと金額をひとつの', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 198, '連続値として扱う。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '購入しない人にも正の', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 276, 'GMV を予測しうる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 330, '半合成データの直接回帰では、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 354, '制約に反する予測が 62〜71%', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 378, '（論文 Table 4）', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（分布の形は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: variance decomposition =====
    var g2 = S.g[1];
    txt(g2, 70, 120, 'Var(' + m('Y') + '<tspan dy="-10" font-size="0.65em">g</tspan><tspan dy="10"> ) = </tspan>' +
      '<tspan fill="' + C.b + '">' + m('p') + m('σ') + sub('v') + '²</tspan>' +
      '<tspan> + </tspan><tspan fill="' + C.a + '">' + m('p') + '(1 − ' + m('p') + ')' + m('μ') + sub('v') + '²</tspan>', { 'font-size': 34, 'font-weight': 600, fill: C.ink });
    t2(g2, 330, 160, '購入者の間の注文額のばらつき', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    t2(g2, 540, 160, 'ゼロかどうかの切り替わり', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    // toy values p = 0.1, mu_v / sigma_v = 2  ->  0.1 and 0.36 (in units of sigma_v^2)
    var U2 = 900;
    t2(g2, 70, 250, '直接回帰が負う分散', '', { 'font-size': 17, fill: C.ink });
    S.d1 = el('rect', { x: 70, y: 266, width: 0, height: 34, rx: 4, fill: C.b }, g2);
    S.d2 = el('rect', { x: 70 + 0.1 * U2, y: 266, width: 0, height: 34, rx: 4, fill: C.a }, g2);
    S.d2full = 0.36 * U2;
    t2(g2, 70, 370, '積で推定したときの分散（理想化した仮定のもと）', '', { 'font-size': 17, fill: C.ink });
    S.f1 = el('rect', { x: 70, y: 386, width: 0, height: 34, rx: 4, fill: C.b }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 260, '例：' + m('p') + ' = 0.1、' + m('μ') + sub('v') + ' = 2' + m('σ') + sub('v'), '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 300, 'MSE の比', '', { 'font-size': 16, fill: C.muted });
    txt(p2, PX, 346, '0.1 / 0.46 ≈ 0.22', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 392, '論文の命題 2。ニューラルネット', '', { 'font-size': 14, fill: C.muted });
    t2(p2, PX, 414, 'への保証ではなく目安とされる。', '', { 'font-size': 14, fill: C.muted });
    t2(g2, 940, 520, '模式図（' + m('p') + ' と ' + m('μ') + sub('v') + '/' + m('σ') + sub('v') + ' は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: funnel composition per tier (toy numbers) =====
    var g3 = S.g[2];
    var tiers = [['対照', 0.08, 100], ['段階 1', 0.10, 105], ['段階 2', 0.13, 98], ['段階 3', 0.15, 92]];
    t2(g3, 170, 66, '購入確率', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, 330, 66, '× 注文額', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, 480, 66, '= GMV の期待値', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.rows3 = tiers.map(function (r, i) {
      var y = 110 + i * 92, o = {};
      t2(g3, 70, y + 22, r[0], '', { 'font-size': 17, fill: C.ink });
      o.p = el('rect', { x: 170, y: y, width: 0, height: 16, rx: 3, fill: C.ink }, g3); o.pw = r[1] * 800;
      t2(g3, 170, y + 42, r[1].toFixed(2), '', { 'font-size': 15, fill: C.muted });
      o.v = el('rect', { x: 330, y: y, width: 0, height: 16, rx: 3, fill: C.ink }, g3); o.vw = r[2] * 1.1;
      t2(g3, 330, y + 42, String(r[2]), '', { 'font-size': 15, fill: C.muted });
      o.g = el('rect', { x: 480, y: y, width: 0, height: 26, rx: 3, fill: C.b }, g3); o.gw = r[1] * r[2] * 7;
      o.gt = t2(g3, 480, y + 50, (r[1] * r[2]).toFixed(1), '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
      o.t0 = 17 + i * 0.9;
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 120, '購入確率の頭', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 148, '全員で学習（BCE）', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 196, '注文額の頭', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 224, '購入者だけで学習', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 280, '積なので、購入確率が 0', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 306, 'なら GMV も必ず 0。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 356, '段階と対照の差が', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 382, 'GMV の CATE になる。', '', { 'font-size': 17, fill: C.ink });
    t2(g3, 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 11 (arXiv v1), Delta ROI =====
    var g4 = S.g[3];
    var A = [10, 20, 25, 30, 40, 50, 60];
    var F = [4.94, 4.57, 4.44, 4.30, 4.01, 3.80, 3.60];
    var B = [4.84, 4.40, 4.23, 4.08, 3.81, 3.62, 3.50];   // best of ECUP, RERUM, CFRNet, DragonNet, EFIN per anchor
    var X0 = 110, X1 = 600, Y0 = 440, Y1 = 80, LO = 3.0, HI = 5.2;
    function px(a) { return X0 + (a - 5) / 60 * (X1 - X0); }
    function py(v) { return Y0 - (v - LO) / (HI - LO) * (Y0 - Y1); }
    el('rect', { x: X0, y: py(5.0), width: X1 - X0, height: py(3.3) - py(5.0), fill: C.panel }, g4);
    [3.0, 3.5, 4.0, 4.5, 5.0].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: py(v), y2: py(v), stroke: C.hair }, g4);
      el('text', { x: X0 - 12, y: py(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toFixed(1);
    });
    A.forEach(function (a) { el('text', { x: px(a), y: Y0 + 26, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = a + '%'; });
    el('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    t2(g4, X0, 58, 'ΔROI（3 シードの平均）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g4, X1, Y0 + 54, 'GMV の増加率の地点', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    t2(g4, X1 - 6, py(5.0) + 20, '損益分岐の帯', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    S.pts4 = A.map(function (a, i) {
      var o = {};
      o.b = el('circle', { cx: px(a), cy: py(B[i]), r: 7, fill: C.a }, g4);
      o.f = el('circle', { cx: px(a), cy: py(F[i]), r: 8, fill: C.b }, g4);
      if (i > 0) {
        o.lb = el('line', { x1: px(A[i - 1]), y1: py(B[i - 1]), x2: px(a), y2: py(B[i]), stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g4);
        o.lf = el('line', { x1: px(A[i - 1]), y1: py(F[i - 1]), x2: px(a), y2: py(F[i]), stroke: C.b, 'stroke-width': 3 }, g4);
      }
      o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 8, fill: C.b }, p4);
    t2(p4, PX + 26, 111, 'FunnelCausalNet', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 7, fill: C.a }, p4);
    t2(p4, PX + 26, 146, 'ほかの 5 手法の最良', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 200, '10% の地点', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 236, '4.94', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 80, 236, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 110, 236, '4.84', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 290, '差の 95% 信頼区間は', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 314, 'どの地点でも 0 を含む', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 360, '7 地点は同じ曲線上の点で、', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 382, '互いに相関している', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 11（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM 2026 · ACM';
    el('text', { x: 480, y: 200, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'FunnelCausalNet';
    el('text', { x: 480, y: 240, 'font-size': 22, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Funnel-aware Joint Conversion-Revenue Uplift';
    el('text', { x: 480, y: 272, 'font-size': 22, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Multi-tier Coupon Allocation';
    t2(g5, 480, 316, '購入と取扱高のファネルを考慮したアップリフトの同時推定と、多段階クーポンの割当て', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 364, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yu Zhang · Zhihan Wang · Guanlin Chen · Min Jiang · Shuai Li';
    el('text', { x: 480, y: 416, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3799682.3840815';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow from the left, then the side panel
    S.bars1.forEach(function (o, i) {
      var s = seg(t, 0.8 + i * 0.25, 1.6 + i * 0.25), h = o.h * s;
      o.r.setAttribute('height', h); o.r.setAttribute('y', 440 - h);
    });
    S.tail1.setAttribute('opacity', seg(t, 3, 3.6));
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    // scene 2: direct-regression variance bar fills (both terms), funnel bar keeps only the first term
    S.d1.setAttribute('width', 0.1 * 900 * seg(t, 9.2, 10));
    S.d2.setAttribute('width', S.d2full * seg(t, 10, 11.6));
    S.f1.setAttribute('width', 0.1 * 900 * seg(t, 12, 12.8));
    S.p2.setAttribute('opacity', seg(t, 13, 13.8));
    // scene 3: per tier, p and value bars grow, then their product
    S.rows3.forEach(function (o) {
      o.p.setAttribute('width', o.pw * seg(t, o.t0, o.t0 + 0.6));
      o.v.setAttribute('width', o.vw * seg(t, o.t0 + 0.3, o.t0 + 0.9));
      var s = seg(t, o.t0 + 1, o.t0 + 1.6);
      o.g.setAttribute('width', o.gw * s); o.gt.setAttribute('opacity', s);
    });
    S.p3.setAttribute('opacity', seg(t, 18, 18.8));
    // scene 4: anchors appear left to right
    S.pts4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.b.setAttribute('opacity', s); o.f.setAttribute('opacity', s);
      if (o.lb) { o.lb.setAttribute('opacity', s); o.lf.setAttribute('opacity', s); }
    });
    S.p4.setAttribute('opacity', seg(t, 29.4, 30.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
