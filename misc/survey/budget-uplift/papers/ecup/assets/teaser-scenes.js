// =====================================================================
// teaser-scenes.js - ECUP (Huang et al., WWW 2024 Companion), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (labelled in Japanese as schematics); the sign example in scene 2 restates
// the high-value coupon example of the paper's Fig. 2. Scene 4 uses the numbers printed in Table 3 (arXiv v1).
// Colours: orange = CVR uplift trained on the click set only; blue = ECUP, CTCVR uplift on all impressions.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'クリックした人だけのデータで<span class="A">CVR のアップリフト</span>を学習するモデルが多い。', en: '' },
    { ja: '同じクーポンでクリックは増え購入は減ることがあり、表示からの効果の符号は CVR だけでは決まらない。', en: '' },
    { ja: 'ECUP は表示した全員のデータで CTR と CVR を同時に学習し、<span class="B">CTCVR の差</span>をアップリフトとする。', en: '' },
    { ja: 'MT-LIFT の CTCVR 課題で、ECUP の AUUC は比べた 9 手法の中で最も高かった。', en: '' },
    { ja: 'クリックから購入までの連鎖をまとめて学習し、処置ごとに特徴の表現を変える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: funnel impression -> click -> conversion; the usual model sees only the click set =====
    var g1 = S.g[0];
    var stages = [['表示', 520, 90], ['クリック', 340, 210], ['購入', 150, 330]];
    S.fun = stages.map(function (s) {
      var x = 330 - s[1] / 2;
      var r = el('rect', { x: x, y: s[2], width: s[1], height: 80, rx: 10, fill: C.panel, stroke: C.hair, 'stroke-width': 1.5 }, g1);
      t2(g1, 330, s[2] + 48, s[0], '', { 'font-size': 20, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      return r;
    });
    el('path', { d: 'M330,172 L330,206 M322,196 L330,206 L338,196', stroke: C.muted, 'stroke-width': 2, fill: 'none' }, g1);
    el('path', { d: 'M330,292 L330,326 M322,316 L330,326 L338,316', stroke: C.muted, 'stroke-width': 2, fill: 'none' }, g1);
    S.box1 = el('rect', { x: 140, y: 196, width: 380, height: 230, rx: 14, fill: 'none', stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '9 6' }, g1);
    S.boxLab1 = t2(g1, 330, 456, '学習に使う範囲：クリックした人だけ', '', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, 'CVR のアップリフト', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(p1, PX, 172, 'pCVR(' + m('t') + '=' + m('k') + ') − pCVR(' + m('t') + '=0)', { 'font-size': 18, fill: C.ink });
    t2(p1, PX, 230, 'クリックした後に', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 256, '購入する確率の上がり幅', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '実際に配るのは、表示した', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 334, '全員に対してである。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: high-value coupon, CTR uplift +, CVR uplift -, CTCVR ? =====
    var g2 = S.g[1];
    t2(g2, 80, 70, '高額のクーポンを配ると', '', { 'font-size': 19, 'font-weight': 600, fill: C.ink });
    var lines = [
      ['CTR のアップリフト', '+', C.b, 'クリックは増える', 130],
      ['CVR のアップリフト', '−', C.a, '使用条件が厳しく購入は減る', 230]
    ];
    S.l2 = lines.map(function (L) {
      var g = el('g', {}, g2);
      el('rect', { x: 80, y: L[4], width: 500, height: 76, rx: 12, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      t2(g, 104, L[4] + 34, L[0], '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
      t2(g, 104, L[4] + 60, L[3], '', { 'font-size': 15, fill: C.muted });
      txt(g, 540, L[4] + 54, L[1], { 'font-size': 46, 'font-weight': 700, fill: L[2], 'text-anchor': 'middle' });
      return g;
    });
    var g2c = S.l2c = el('g', {}, g2);
    el('rect', { x: 80, y: 340, width: 500, height: 96, rx: 12, fill: C.panel }, g2c);
    t2(g2c, 104, 380, 'CTCVR のアップリフト', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    t2(g2c, 104, 410, '= 表示からの最終的な効果', '', { 'font-size': 15, fill: C.muted });
    txt(g2c, 540, 405, '?', { 'font-size': 50, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, 'chain-bias', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 180, 'CVR が負でも、CTCVR は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 206, '正にも負にもなりうる。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 256, 'CVR だけで判断すると、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 282, '最終的な効果と逆の結論を', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 308, '出しかねない。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（論文 Fig. 2 の例を描き直したもの）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: shared towers -> pCTR, pCVR -> pCTCVR; uplift = pCTCVR(t=k) - pCTCVR(t=0) =====
    var g3 = S.g[2];
    function box(g, x, y, w, h, fill, stroke) { return el('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: fill, stroke: stroke || 'none', 'stroke-width': 1.5 }, g); }
    function arrow(g, x1, y1, x2, y2) { el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C.muted, 'stroke-width': 1.8 }, g); }
    box(g3, 70, 400, 180, 64, C.panel);
    t2(g3, 160, 438, '特徴 ' + m('x'), '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.tbox = box(g3, 290, 400, 180, 64, C.panel);
    S.tlab0 = t2(g3, 380, 438, '処置 ' + m('t') + ' = 0（対照）', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.tlabk = t2(g3, 380, 438, '処置 ' + m('t') + ' = ' + m('k') + '（クーポン）', '', { 'font-size': 17, fill: C.b, 'font-weight': 600, 'text-anchor': 'middle' });
    box(g3, 70, 290, 400, 70, '#fff', C.ink);
    t2(g3, 270, 320, '共有する層（各塔の最後の層以外）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, 270, 345, '処置ごとに特徴の表現を変える（TENet）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    arrow(g3, 160, 400, 160, 362); arrow(g3, 380, 400, 380, 362);
    box(g3, 70, 190, 180, 60, '#fff', C.ink); t2(g3, 160, 227, 'pCTR', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    box(g3, 290, 190, 180, 60, '#fff', C.ink); t2(g3, 380, 227, 'pCVR', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    arrow(g3, 160, 290, 160, 252); arrow(g3, 380, 290, 380, 252);
    box(g3, 150, 90, 240, 60, C.bsoft); t2(g3, 270, 127, 'pCTCVR = pCTR × pCVR', '', { 'font-size': 18, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    arrow(g3, 160, 190, 230, 152); arrow(g3, 380, 190, 310, 152);
    t2(g3, 270, 60, '損失は表示した全員で計算', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    // bars on the right of the diagram: pCTCVR under t=0 and t=k (toy values)
    var BX = 520, BY = 440, U = 1300;
    el('line', { x1: BX - 10, x2: BX + 140, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.b0 = el('rect', { x: BX, y: BY, width: 50, height: 0, fill: C.gray }, g3);
    S.bk = el('rect', { x: BX + 74, y: BY, width: 50, height: 0, fill: C.b }, g3);
    t2(g3, BX + 25, BY + 24, m('t') + '=0', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, BX + 99, BY + 24, m('t') + '=' + m('k'), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.diffLab = t2(g3, BX + 62, 172, '差 = アップリフト', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.U = U; S.BY = BY;
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX + 20, 130, 'ECUP のアップリフト', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(p3, PX + 20, 172, 'pCTCVR(' + m('t') + '=' + m('k') + ')', { 'font-size': 18, fill: C.ink });
    txt(p3, PX + 20, 200, '− pCTCVR(' + m('t') + '=0)', { 'font-size': 18, fill: C.ink });
    t2(p3, PX + 20, 256, '処置を入力にとる', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 20, 282, 'S-learner として、', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 20, 308, '処置を入れ替えて差をとる。', '', { 'font-size': 17, fill: C.ink });
    t2(g3, 940, 520, '模式図（棒の高さは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 (arXiv v1), MT-LIFT, CTCVR task, AUUC =====
    var g4 = S.g[3];
    var rows = [['Causal Forest', 0.694], ['CEVAE', 0.577], ['CFRNet', 0.649], ['TarNet', 0.711], ['DragonNet', 0.533],
                ['DESCN', 0.706], ['ANU', 0.773], ['EFIN', 0.781], ['ECUP', 0.813]];
    var X0 = 220, W = 340, LO = 0.5, HI = 0.85, Y0 = 92, DY = 42;
    function bx(v) { return (v - LO) / (HI - LO) * W; }
    t2(g4, 70, 52, 'AUUC（MT-LIFT、CTCVR 課題）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0.5, 0.6, 0.7, 0.8].forEach(function (v) {
      el('line', { x1: X0 + bx(v), x2: X0 + bx(v), y1: Y0 - 20, y2: Y0 + DY * 8 + 18, stroke: C.hair }, g4);
      el('text', { x: X0 + bx(v), y: Y0 + DY * 8 + 42, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, hl = r[0] === 'ECUP', o = {};
      el('text', { x: X0 - 14, y: y + 6, 'font-size': 16, fill: hl ? C.b : C.ink, 'font-weight': hl ? 650 : 400, 'text-anchor': 'end' }, g4).textContent = r[0];
      o.bar = el('rect', { x: X0, y: y - 13, width: 0, height: 26, rx: 4, fill: hl ? C.b : C.gray }, g4);
      o.lab = el('text', { x: X0 + bx(r[1]) + 8, y: y + 6, 'font-size': 15, fill: hl ? C.b : C.ink, 'font-weight': hl ? 650 : 400 }, g4);
      o.lab.textContent = r[1].toFixed(3);
      o.full = bx(r[1]); o.t0 = 25 + i * 0.45;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'ECUP と次点の EFIN', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 162, 'AUUC', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 70, 164, '0.813', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 160, 164, '対 0.781', { 'font-size': 20, fill: C.ink });
    txt(p4, PX, 210, 'QINI', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 70, 212, '0.291', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 160, 212, '対 0.251', { 'font-size': 20, fill: C.ink });
    t2(p4, PX, 270, '比較相手は CTR と CVR の', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 294, 'モデルを別々に作り、積をとった', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 344, 'オンライン A/B テストでは', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 368, 'ROI +7.4%（Table 5）', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 3（arXiv v1）の数値から作図。横軸は 0.5 から', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'WWW 2024 COMPANION';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Entire Chain Uplift Modeling with Context-';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Enhanced Learning for Intelligent Marketing';
    t2(g5, 480, 290, '文脈を強化した学習による、連鎖全体でのアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yinqiu Huang · Shuli Wang · Min Gao · et al.';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'MT-LIFT: github.com/MTDJDSP/MT-LIFT';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: click set is outlined in orange, then the side panel
    S.box1.setAttribute('opacity', seg(t, 1.5, 2.3));
    S.boxLab1.setAttribute('opacity', seg(t, 2.2, 2.9));
    S.fun[0].setAttribute('opacity', 1 - 0.55 * seg(t, 2.5, 3.3));
    S.p1.setAttribute('opacity', seg(t, 3.2, 4));
    // scene 2: CTR +, then CVR -, then CTCVR ?
    S.l2[0].setAttribute('opacity', seg(t, 9, 9.6));
    S.l2[1].setAttribute('opacity', seg(t, 10.4, 11));
    S.l2c.setAttribute('opacity', seg(t, 11.8, 12.4));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.3));
    // scene 3: treatment switches from 0 to k; bars grow; difference appears
    var sw = seg(t, 19.4, 20);
    S.tlab0.setAttribute('opacity', 1 - sw);
    S.tlabk.setAttribute('opacity', sw);
    S.tbox.setAttribute('fill', H.mix(C.panel, C.bsoft, sw));
    var h0 = 0.12 * S.U * seg(t, 17.6, 18.8), hk = 0.19 * S.U * seg(t, 20, 21.2);
    S.b0.setAttribute('y', S.BY - h0); S.b0.setAttribute('height', h0);
    S.bk.setAttribute('y', S.BY - hk); S.bk.setAttribute('height', hk);
    S.diffLab.setAttribute('opacity', seg(t, 21.4, 22));
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: bars grow in order, then the side panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.7);
      o.bar.setAttribute('width', o.full * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 29.6, 30.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
