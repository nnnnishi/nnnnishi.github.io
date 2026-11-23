// =====================================================================
// teaser-scenes.js — He et al. (KDD 2026), CanniUplift, unofficial explainer. Player: teaser-engine.js.
// Scene 1 uses the introduction's example (a 90-dollar item, a 5-dollar coupon at another seller,
// a 30-dollar purchase); scene 2 the bottom half of Fig. 1 and the ~35% / ~25% figures of Sec. 4.1.1.
// Scene 3 is a schematic with toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 2 (User AUUC) and Table 3 (online A/B), arXiv v1.
// Colours: orange = the seller-view local uplift and the pseudo-increment it counts;
//          blue   = the platform-wide net increment and CanniUplift.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'クーポンで安い商品に乗り換えると、<span class="A">店舗の GMV</span> は増えても<span class="B">プラットフォーム全体の GMV</span> は減る。', en: '' },
    { ja: '手持ちのよいクーポンで買う利用者は、配られたクーポンを使わない。その購入まで効果として数えると<span class="A">増分を多く見積もる</span>。', en: '' },
    { ja: '店舗ごとの予測の合計を全体の GMV に合わせ（PGA）、購入をクーポンを使った経路と使わなかった経路に分けて予測する（RDD）。', en: '' },
    { ja: '実データでは PGA と RDD を加えると利用者単位の AUUC が最も高くなり、オンラインでは<span class="B">全体の ΔGMV が 4.08% 増えた</span>。', en: '' },
    { ja: 'クーポンを配る相手は店舗の見かけの増分ではなくプラットフォーム全体の純増分で選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="70%" baseline-shift="sub">' + s + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }
  function coupon(g, x, y, w, label, col) {
    var o = el('g', {}, g);
    el('rect', { x: x, y: y, width: w, height: 38, rx: 6, fill: '#FFF7D6', stroke: col || '#B98900', 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }, o);
    T(o, x + w / 2, y + 26, label, { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: downsell example from the introduction =====
    var g1 = S.g[0], BY = 440, U = 3;   // 1 dollar = 3 px
    T(g1, 70, 58, '利用者 1 人の購入（論文の序論の例）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 600, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    // left: no coupon, buys the 90-dollar item at seller B
    el('rect', { x: 130, y: BY - 90 * U, width: 120, height: 90 * U, rx: 4, fill: C.gray }, g1);
    T(g1, 190, BY - 90 * U + 30, '90 ドル', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, 190, BY + 28, 'クーポンなし', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, 190, BY + 52, '店舗 B で購入', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    // right: 5-dollar coupon at seller A, buys the 30-dollar item
    S.c1 = el('g', {}, g1);
    el('rect', { x: 380, y: BY - 30 * U, width: 120, height: 30 * U, rx: 4, fill: C.gray }, S.c1);
    T(S.c1, 440, BY - 30 * U + 30, '30 ドル', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    T(S.c1, 440, BY + 28, '店舗 A の 5 ドルクーポン', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    T(S.c1, 440, BY + 52, '店舗 A で購入', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    // seller A's gain and the platform's loss
    S.sA = el('g', {}, g1);
    el('line', { x1: 520, x2: 520, y1: BY, y2: BY - 30 * U, stroke: C.a, 'stroke-width': 5 }, S.sA);
    T(S.sA, 532, BY - 40, '店舗 A', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    T(S.sA, 532, BY - 16, '+30 ドル', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.pl = el('g', {}, g1);
    el('line', { x1: 260, x2: 560, y1: BY - 90 * U, y2: BY - 90 * U, stroke: C.b, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, S.pl);
    el('line', { x1: 370, x2: 370, y1: BY - 90 * U, y2: BY - 30 * U, stroke: C.b, 'stroke-width': 5 }, S.pl);
    T(S.pl, 362, BY - 60 * U - 10, '全体', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'end' });
    T(S.pl, 362, BY - 60 * U + 16, '−60 ドル', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '店舗だけを見れば増分', { 'font-size': 17, fill: C.a });
    T(p1, PX, 138, '全体では減少', { 'font-size': 17, fill: C.b });
    T(p1, PX, 196, '実データで、利用者に関係', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 220, 'する店舗の ITE を足すと、', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 244, '実測の効果を', { 'font-size': 16, fill: C.ink });
    txt(p1, PX, 296, '約 35%', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    T(p1, PX, 330, '上回った。', { 'font-size': 16, fill: C.ink });

    // ===== scene 2: conversion without redemption =====
    var g2 = S.g[1];
    T(g2, 70, 58, '手持ちのクーポンがある利用者（論文 Fig. 1 下段）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('circle', { cx: 120, cy: 150, r: 26, fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, g2);
    el('path', { d: 'M78,226 C82,190 158,190 162,226', fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, g2);
    T(g2, 200, 112, '手持ち', { 'font-size': 15, fill: C.muted });
    coupon(g2, 200, 122, 130, '50 ドル引き');
    S.test2 = el('g', {}, g2);
    T(S.test2, 200, 196, '配られた試験用', { 'font-size': 15, fill: C.muted });
    S.cp2 = coupon(S.test2, 200, 206, 130, '5 ドル引き');
    S.x2 = el('path', { d: 'M196,204 L334,248 M334,204 L196,248', stroke: C.a, 'stroke-width': 3 }, S.test2);
    S.buy2 = el('g', {}, g2);
    el('path', { d: 'M350,180 L420,180', stroke: C.muted, 'stroke-width': 2, 'marker-end': '' }, S.buy2);
    el('path', { d: 'M412,173 L422,180 L412,187', fill: 'none', stroke: C.muted, 'stroke-width': 2 }, S.buy2);
    T(S.buy2, 440, 175, '購入する', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(S.buy2, 440, 199, '（50 ドル引きを使う）', { 'font-size': 15, fill: C.muted });
    // share of treated conversions without redemption (Sec. 4.1.1: about 25%)
    var BX = 80, BW = 500, BYY = 330;
    T(g2, BX, BYY - 18, 'クーポンを配って購入に至った行動（実データ）', { 'font-size': 16, fill: C.ink });
    S.used2 = el('rect', { x: BX, y: BYY, width: 0, height: 50, fill: C.gray }, g2);
    S.not2 = el('rect', { x: BX + BW * 0.75, y: BYY, width: 0, height: 50, fill: C.a }, g2);
    S.lab2 = el('g', {}, g2);
    T(S.lab2, BX + 12, BYY + 32, 'クーポンを使った', { 'font-size': 16, fill: C.ink });
    T(S.lab2, BX + BW * 0.75 + BW * 0.125, BYY + 32, '約 25%', { 'font-size': 17, 'font-weight': 650, fill: '#fff', 'text-anchor': 'middle' });
    T(S.lab2, BX + BW, BYY + 80, '使わずに買った', { 'font-size': 16, fill: C.a, 'text-anchor': 'end' });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, '使わなかった購入は', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 136, 'もともとの購買意欲や', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 160, 'ほかのクーポンで起きた', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 184, 'かもしれない。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 236, 'それも配ったクーポンの', { 'font-size': 16, fill: C.a });
    T(p2, PX, 260, '効果として数えると、', { 'font-size': 16, fill: C.a });
    T(p2, PX, 284, '増分を多く見積もる。', { 'font-size': 16, fill: C.a });

    // ===== scene 3: PGA (top) and RDD (bottom), toy values =====
    var g3 = S.g[2], LX = 120, LW = 300;
    T(g3, 70, 58, 'PGA：店舗ごとの予測を足して全体の GMV に合わせる', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.seg3 = [0, 1, 2, 3].map(function (i) {
      var r = el('rect', { x: LX, y: 90 + i * 0, height: 40, width: 0, fill: C.a, stroke: '#fff', 'stroke-width': 2 }, g3);
      return r;
    });
    S.raw3 = [110, 90, 80, 70];   // toy widths before alignment (sum 350)
    S.fit3 = [80, 70, 60, 50];    // toy widths after alignment (sum 260)
    S.line3 = el('g', {}, g3);
    el('line', { x1: LX + 260, x2: LX + 260, y1: 76, y2: 146, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, S.line3);
    T(S.line3, LX + 260, 168, '利用者の実際の全体 GMV', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    T(g3, LX - 12, 116, '合計', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.over3 = T(g3, LX + 360, 116, '多すぎる分は罰せられる', { 'font-size': 15, fill: C.a });
    T(g3, 70, 238, 'RDD：処置群の購入を 2 つの経路に分ける', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.pr3 = el('rect', { x: LX, y: 270, width: 0, height: 44, fill: C.b }, g3);
    S.np3 = el('rect', { x: LX, y: 270, width: 0, height: 44, fill: C.gray }, g3);
    S.lab3 = el('g', {}, g3);
    txt(S.lab3, LX + 6, 344, '使って買う ' + m('p') + sub(m('r')), { 'font-size': 16, fill: C.b });
    txt(S.lab3, LX + LW + 120, 344, '使わずに買う 1 − ' + m('p') + sub(m('r')), { 'font-size': 16, fill: C.muted, 'text-anchor': 'end' });
    txt(S.lab3, LX + 6, 372, '→ 増分 ' + m('pΔGMV') + sub(m('r')), { 'font-size': 16, fill: C.ink });
    txt(S.lab3, LX + LW + 120, 372, '→ 増分 ' + m('pΔGMV') + sub('1−' + m('r')), { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    T(S.lab3, 70, 430, '使わない購入に、使った購入と同じ増分を当てはめない。', { 'font-size': 16, fill: C.ink });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 110, m('ℒ') + ' = ' + m('ℒ') + sub('seller'), { 'font-size': 24, 'font-weight': 600, fill: C.ink });
    txt(p3, PX + 24, 146, '+ ' + m('λ') + sub('pla') + ' ' + m('ℒ') + sub('pla'), { 'font-size': 24, 'font-weight': 600, fill: C.ink });
    txt(p3, PX + 24, 182, '+ ' + m('λ') + sub('redem') + ' ' + m('ℒ') + sub('redem'), { 'font-size': 24, 'font-weight': 600, fill: C.ink });
    T(p3, PX, 236, '推論では Platform head の', { 'font-size': 16, fill: C.b });
    T(p3, PX, 260, '処置ありとなしの差で', { 'font-size': 16, fill: C.b });
    T(p3, PX, 284, '店舗を並べる。', { 'font-size': 16, fill: C.b });
    T(p3, PX, 336, '他店の予測は足さない。', { 'font-size': 15, fill: C.muted });
    T(g3, 940, 520, '模式図（長さは解説者が置いた値）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (User AUUC) and Table 3 (online A/B), arXiv v1 =====
    var g4 = S.g[3], X0 = 250, V0 = 0.70, SC = 2000, Y0 = 130, DY = 62;
    var rows = [['EUEN（ベース）', 0.794, C.a], ['+PGA', 0.826, C.gray], ['+Redem', 0.803, C.gray], ['+RDD', 0.818, C.gray], ['+PGA +RDD（提案）', 0.849, C.b]];
    T(g4, 30, 64, '実データの利用者単位 AUUC（重みつき、論文 Table 2）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.70, 0.75, 0.80, 0.85].forEach(function (v) {
      el('line', { x1: X0 + (v - V0) * SC, x2: X0 + (v - V0) * SC, y1: Y0 - 30, y2: Y0 + DY * 4 + 30, stroke: C.hair }, g4);
      el('text', { x: X0 + (v - V0) * SC, y: Y0 + DY * 4 + 54, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(2);
    });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, o = { full: (r[1] - V0) * SC };
      el('text', { x: X0 - 70, y: y + 6, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': i === 4 ? 650 : 400 }, g4).textContent = r[0];
      o.v = el('text', { x: X0 - 14, y: y + 6, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4); o.v.textContent = r[1].toFixed(3);
      o.bar = el('rect', { x: X0, y: y - 15, width: 0, height: 30, rx: 3, fill: r[2] }, g4);
      o.t0 = 25 + i * 0.5;
      return o;
    });
    T(g4, 30, 470, '横軸は 0.70 から始まる。', { 'font-size': 14, fill: C.muted });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 104, 'オンライン A/B テスト', { 'font-size': 16, fill: C.muted });
    T(p4, PX, 128, '（本番のモデルと比較、8 日間）', { 'font-size': 14, fill: C.muted });
    T(p4, PX, 178, '全体の ΔGMV', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 218, '+4.08%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    T(p4, PX, 268, '販促費', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 302, '−2.45%', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 352, '全体の ROI', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 386, '+6.69%', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    T(g4, 940, 520, '論文 Table 2・Table 3（arXiv v1）の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2026';
    ['CanniUplift: A Holistic Framework for Mitigating', 'Seller and Incentive Cannibalization', 'in E-commerce Uplift Modeling'].forEach(function (s, i) {
      el('text', { x: 480, y: 190 + i * 42, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    T(g5, 480, 340, 'EC のアップリフトモデリングで店舗間とインセンティブ間のカニバリゼーションを抑える', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 386, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zuwang He · Shihao Shu · Yuli Qu · et al. (Taobao & Tmall Group of Alibaba)';
    el('text', { x: 480, y: 432, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3770855.3818334 · arxiv.org/abs/2607.05242';
    T(g5, 480, 484, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: the coupon world appears, then seller A's gain, then the platform's loss
    S.c1.setAttribute('opacity', seg(t, 1.2, 2));
    S.sA.setAttribute('opacity', seg(t, 2.6, 3.3));
    S.pl.setAttribute('opacity', seg(t, 4, 4.8));
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    // scene 2: test coupon is ignored, purchase happens, then the 75/25 split
    S.test2.setAttribute('opacity', seg(t, 9, 9.6));
    S.x2.setAttribute('opacity', seg(t, 10.2, 10.7));
    S.buy2.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.used2.setAttribute('width', 375 * seg(t, 12, 12.8));
    S.not2.setAttribute('width', 125 * seg(t, 12.8, 13.4));
    S.lab2.setAttribute('opacity', seg(t, 13.2, 13.8));
    S.p2.setAttribute('opacity', seg(t, 13, 13.8));
    // scene 3: seller predictions stack up, overshoot, shrink to the platform total; then RDD split
    var x = 120, grow = seg(t, 16.6, 17.6), fit = seg(t, 18.6, 19.6);
    S.seg3.forEach(function (r, i) {
      var w = (S.raw3[i] + (S.fit3[i] - S.raw3[i]) * fit) * grow;
      r.setAttribute('x', x); r.setAttribute('width', w);
      r.setAttribute('fill', H.mix(C.a, C.b, fit));
      x += w;
    });
    S.line3.setAttribute('opacity', seg(t, 17.6, 18.1));
    S.over3.setAttribute('opacity', seg(t, 17.8, 18.3) * (1 - seg(t, 19.2, 19.7)));
    var sp = seg(t, 20.2, 21);
    S.pr3.setAttribute('width', 250 * sp);
    S.np3.setAttribute('x', 120 + 250 * sp + 4 * sp); S.np3.setAttribute('width', 166 * sp);
    S.lab3.setAttribute('opacity', seg(t, 20.8, 21.4));
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: bars grow in table order, then the online numbers
    S.rows4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6);
      o.bar.setAttribute('width', o.full * k);
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
