// =====================================================================
// teaser-scenes.js — Goldenberg et al. (RecSys 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図); the paper reports only
// the signs ATE > 0 and ROI < 0 for the full roll-out. Scenes 2 and 4 use the numbers printed in Table 1
// (arXiv v2). Colours: orange = incremental loss / cost side, ROI < 0, uplift models that ignore cost;
// blue = incremental bookings and the paper's Retrospective Estimation.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '全員に無料特典を出すと、予約は増えたが <span class="A">ROI は負</span>になった。', en: '' },
    { ja: '予約の増分だけで並べるモデルは、AUUC が高くても <span class="A">ROI ≥ 0 で配れる人がほとんどいない</span>。', en: '' },
    { ja: '振り返り推定は予約した人だけを見て、そのうち特典を受けていた割合 <span class="B">S(x)</span> を推定する。', en: '' },
    { ja: 'オフライン評価では、<span class="B">振り返り推定</span>が ROI ≥ 0 の範囲で全員配布時の 79.7% の効果を得た。', en: '' },
    { ja: '予約の増分と損失の増分の比で並べ、ROI が 0 になるところで配るのを止める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: everyone gets the free benefit -> ATE > 0 but ROI < 0 =====
    var g1 = S.g[0];
    t2(g1, 90, 70, '全員に無料特典を出す（A/B テストの処置群）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.dots1 = [];
    for (var r = 0; r < 5; r++) for (var c = 0; c < 8; c++) {
      S.dots1.push({ e: el('circle', { cx: 120 + c * 62, cy: 130 + r * 70, r: 16, fill: C.gray }, g1), k: (r + c) / 11 });
    }
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 110, width: 18, height: 18, rx: 3, fill: C.a }, p1);
    t2(p1, PX + 28, 125, '特典あり（費用がかかる）', '', { 'font-size': 17, fill: C.ink });
    S.ate1 = t2(g1, PX, 200, '予約の増分 ATE &gt; 0', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    S.roi1 = txt(g1, PX, 280, 'ROI &lt; 0', { 'font-size': 44, 'font-weight': 650, fill: C.a });
    S.roi1b = t2(g1, PX, 318, '費用が売上の増分を上回る', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（論文は ATE と ROI の符号だけを報告）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Table 1, population at ROI >= 0 for the cost-blind uplift models =====
    var g2 = S.g[1];
    t2(g2, 70, 70, 'ROI ≥ 0 を満たす範囲で配れる顧客の割合', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var BX = 90, BW = 480;
    S.rows2 = [['Two-Models', '0.638', 0, 150], ['Transformed Outcome', '0.912', 2.4, 310]].map(function (rw) {
      var y = rw[3], o = {};
      txt(g2, BX, y, rw[0], { 'font-size': 20, 'font-weight': 650, fill: C.ink });
      txt(g2, BX + BW, y, 'AUUC ' + rw[1], { 'font-size': 17, fill: C.muted, 'text-anchor': 'end' });
      el('rect', { x: BX, y: y + 18, width: BW, height: 30, rx: 4, fill: C.panel }, g2);
      o.bar = el('rect', { x: BX, y: y + 18, width: 0, height: 30, rx: 2, fill: C.a }, g2);
      o.full = BW * rw[2] / 100;
      o.lab = txt(g2, BX, y + 80, rw[2] === 0 ? '0%（ROI ≥ 0 の点がない）' : rw[2] + '%', { 'font-size': 22, 'font-weight': 650, fill: C.a });
      return o;
    });
    txt(g2, BX, 470, '0%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, BX + BW, 470, '100%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 140, 'どちらも予約の増分', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 166, m('CATE') + '<tspan font-size="12" dy="5">Y</tspan><tspan dy="-5"> だけで並べる。</tspan>', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 216, '特典の費用は順位に', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 242, '入らない。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 300, 'AUUC 最高の手法でも', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 326, '配れるのは 2.4%', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 1（arXiv v2）の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: retrospective view — among bookers, share that was treated =====
    var g3 = S.g[2];
    t2(g3, 80, 70, '予約した顧客だけを見る', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.seg3 = [['顧客層 1', 7, 80], ['顧客層 2', 5, 350]].map(function (sg) {
      var x = sg[2], o = { dots: [] };
      el('rect', { x: x, y: 95, width: 250, height: 370, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
      t2(g3, x + 20, 132, sg[0] + '（予約 10 件）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      for (var i = 0; i < 10; i++) {
        o.dots.push(el('circle', { cx: x + 42 + (i % 5) * 42, cy: 180 + Math.floor(i / 5) * 50, r: 15, fill: i < sg[1] ? C.b : C.gray }, g3));
      }
      o.s = txt(g3, x + 20, 330, m('S') + ' = ' + sg[1] + '/10 = ' + (sg[1] / 10).toFixed(1), { 'font-size': 22, 'font-weight': 650, fill: sg[1] > 5 ? C.b : C.ink });
      o.v = t2(g3, x + 20, 378, sg[1] > 5 ? '0.5 より大きいので、' : '0.5 ちょうどなので、', '', { 'font-size': 17, fill: C.ink });
      o.v2 = t2(g3, x + 20, 406, sg[1] > 5 ? '特典で予約が増えた' : '特典の効果はない', '', { 'font-size': 17, 'font-weight': 650, fill: sg[1] > 5 ? C.b : C.muted });
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    el('circle', { cx: PX + 9, cy: 110, r: 9, fill: C.b }, p3);
    t2(p3, PX + 26, 116, '特典を受けていた', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 144, r: 9, fill: C.gray }, p3);
    t2(p3, PX + 26, 150, '受けていなかった', '', { 'font-size': 17, fill: C.ink });
    txt(p3, PX, 214, m('S') + '(' + m('x') + ') = Pr(' + m('T') + '=1 | ' + m('x') + ', ' + m('Y') + '=1)', { 'font-size': 19, fill: C.ink });
    t2(p3, PX, 262, '特典を出す確率が 0.5 なら、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 288, m('S') + ' &gt; 0.5 と予約の増分 &gt; 0 は同値', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 338, '予約しない大量の訪問は', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 362, '学習に使わない。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（件数は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1, max ATE at ROI >= 0 =====
    var g4 = S.g[3];
    t2(g4, 70, 58, 'ROI ≥ 0 で得られる最大の効果（全員配布 = 100%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var X0 = 300, XW = 300, Y0 = 110, DY = 88;
    [0, 50, 100].forEach(function (v) {
      el('line', { x1: X0 + XW * v / 100, x2: X0 + XW * v / 100, y1: Y0 - 30, y2: Y0 + DY * 3 + 40, stroke: C.hair }, g4);
      txt(g4, X0 + XW * v / 100, Y0 + DY * 3 + 64, v + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.rows4 = [['Two-Models', 0, '配布 0%'], ['Transformed Outcome', 38.6, '配布 2.4%'], ['Fractional Approx.', 65.8, '配布 38%'], ['Retrospective Est.', 79.7, '配布 31.4%']].map(function (rw, i) {
      var y = Y0 + DY * i, o = {}, best = i === 3;
      txt(g4, X0 - 16, y + 6, rw[0], { 'font-size': 16, 'font-weight': best ? 700 : 400, fill: best ? C.b : C.ink, 'text-anchor': 'end' });
      t2(g4, X0 - 16, y + 30, rw[2], '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      o.bar = el('rect', { x: X0, y: y - 14, width: 0, height: 30, rx: 3, fill: best ? C.b : C.gray }, g4);
      o.full = XW * rw[1] / 100;
      o.lab = txt(g4, X0 + o.full + 8, y + 7, rw[1] + '%', { 'font-size': 17, 'font-weight': 650, fill: best ? C.b : C.ink });
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '振り返り推定', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    txt(p4, PX, 210, '79.7%', { 'font-size': 48, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 256, '配る相手は 31.4% に絞る', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 306, 'AUUC は 2 位（0.806）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 356, '予約した顧客のデータ', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 380, 'だけで学習', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ACM RECSYS · 2020';
    el('text', { x: 480, y: 196, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Free Lunch! Retrospective Uplift Modeling';
    el('text', { x: 480, y: 238, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Dynamic Promotions Recommendation';
    el('text', { x: 480, y: 280, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'within ROI Constraints';
    t2(g5, 480, 322, 'ROI 制約のもとで特典の配布先を動的に選ぶ、振り返り型のアップリフトモデリング', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 370, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dmitri Goldenberg · Javier Albert · Lucas Bernardi · Pablo Estevez';
    el('text', { x: 480, y: 398, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'Booking.com';
    el('text', { x: 480, y: 440, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2008.06293';
    t2(g5, 480, 488, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: every customer receives the benefit (wave), then ATE > 0, then ROI < 0
    S.dots1.forEach(function (d) { d.e.setAttribute('fill', H.mix(C.gray, C.a, seg(t, 1 + d.k * 2, 1.5 + d.k * 2))); });
    S.p1.setAttribute('opacity', seg(t, 1, 1.6));
    S.ate1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.roi1.setAttribute('opacity', seg(t, 5, 5.6));
    S.roi1b.setAttribute('opacity', seg(t, 5.5, 6.1));
    // scene 2: bars fill to their (tiny) share, labels follow
    S.rows2.forEach(function (o, i) {
      o.bar.setAttribute('width', o.full * seg(t, 9.5 + i * 1.2, 10.5 + i * 1.2));
      o.lab.setAttribute('opacity', seg(t, 10.3 + i * 1.2, 10.9 + i * 1.2));
    });
    S.p2.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: bookers appear, then S and the verdicts
    S.seg3.forEach(function (o, j) {
      o.dots.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 16.8 + j * 1.2 + i * 0.08, 17.2 + j * 1.2 + i * 0.08)); });
      o.s.setAttribute('opacity', seg(t, 19.5 + j * 0.6, 20.1 + j * 0.6));
      o.v.setAttribute('opacity', seg(t, 20.6 + j * 0.6, 21.2 + j * 0.6));
      o.v2.setAttribute('opacity', seg(t, 20.6 + j * 0.6, 21.2 + j * 0.6));
    });
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: bars grow in order, then the headline number
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.full * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
