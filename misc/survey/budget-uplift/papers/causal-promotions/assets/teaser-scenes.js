// =====================================================================
// teaser-scenes.js - Goldenberg et al. (ACM TORS 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 1 of the published version (Campaign 1; rescaled by the authors).
// Colours: orange = promotion cost / profit loss and fixed-period A/B testing;
//          blue = incremental sales and what the paper adds (lanes, converted-only data, ratio order).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng, mix = H.mix;
  var ASOFT = '#FCEBDF';

  var CAPTIONS = [
    { ja: '固定期間の <span class="A">A/B テスト</span>では方策を一つずつ試すが、論文は<span class="B">複数の方策を並行して</span>走らせ、配分を随時変える。', en: '' },
    { ja: '割引の<span class="A">費用</span>は予約したときにだけかかるので、<span class="B">予約した取引だけ</span>で販促の効果を推定する。', en: '' },
    { ja: '<span class="B">売上の増分</span>を<span class="A">利益の減少</span>で割った比の大きい順に、予算 B に収まるまで配る。', en: '' },
    { ja: 'キャンペーン 1 ではレーン運用を始めた後に試す方策が増え、KPI が初期目標の 183% まで上がった。', en: '' },
    { ja: '予約時にだけかかる費用を推定と予算の両方に組み込み、実験を回し続けて販促を改善する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: sequential A/B tests vs concurrent lanes =====
    var g1 = S.g[0];
    var TX0 = 90, TX1 = 600;
    t2(g1, TX0, 62, 'A/B テスト：一つずつ順番に', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    [0, 1, 2].forEach(function (k) {
      var x = TX0 + k * 170;
      [['準備', 0.35], ['実施', 1], ['分析', 0.6]].forEach(function (p, j) {
        var w = [40, 80, 44][j], xo = [0, 42, 124][j];
        el('rect', { x: x + xo, y: 78, width: w, height: 34, rx: 4, fill: C.a, opacity: p[1] }, g1);
        t2(g1, x + xo + w / 2, 101, p[0], '', { 'font-size': 14, fill: j === 1 ? '#fff' : C.ink, 'text-anchor': 'middle' });
      });
    });
    t2(g1, TX0, 182, 'レーン：10 本を並行して', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    S.lanes = [];
    for (var i = 0; i < 10; i++) {
      var y = 198 + i * 27;
      var base = i === 0 ? C.hair : i < 3 ? C.panel : C.bsoft;
      var r = el('rect', { x: TX0, y: y, width: TX1 - TX0, height: 21, rx: 4, fill: base }, g1);
      var lab = i === 0 ? 'Holdout' : i < 3 ? 'Flat' : 'ML';
      t2(g1, TX0 + 8, y + 16, lab, '', { 'font-size': 14, fill: C.ink });
      // switch point for ML lanes: later part turns to the incumbent (solid blue)
      var sw = i >= 3 ? el('rect', { x: TX0 + 200 + ((i * 37) % 160), y: y, width: 0, height: 21, rx: 4, fill: C.b }, g1) : null;
      S.lanes.push({ sw: sw, x: i >= 3 ? TX0 + 200 + ((i * 37) % 160) : 0 });
    }
    S.head1 = el('line', { x1: TX0, x2: TX0, y1: 70, y2: 470, stroke: C.ink, 'stroke-width': 2 }, g1);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, '従来', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 138, '方策を一つ試すたびに', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 164, '準備・実施・分析を繰り返す', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 230, '論文', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 258, 'Holdout と Flat を残したまま', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 284, '機械学習の方策を並行させ、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, 'よい方策にレーンを寄せる', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 338, width: 18, height: 18, rx: 3, fill: C.b }, p1);
    t2(p1, PX + 28, 353, '現在いちばんよい方策', '', { 'font-size': 15, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: 100 sessions, few bookings, cost only on bookings =====
    var g2 = S.g[1];
    var booked = { 13: 1, 37: 1, 58: 1, 72: 1, 94: 1 };
    S.dots = [];
    for (var j = 0; j < 100; j++) {
      var cx = 110 + (j % 10) * 46, cy = 82 + Math.floor(j / 10) * 40;
      S.dots.push({ c: el('circle', { cx: cx, cy: cy, r: 11, fill: C.gray }, g2), b: !!booked[j], x: cx, y: cy });
    }
    S.coins = Object.keys(booked).map(function (k) {
      var d = S.dots[+k];
      return el('text', { x: d.x + 13, y: d.y - 8, 'font-size': 16, 'font-weight': 700, fill: C.a }, g2);
    });
    S.coins.forEach(function (c) { c.textContent = '$'; });
    t2(g2, 90, 50, '閲覧セッション 100 件（模式図）', '', { 'font-size': 16, fill: C.muted });
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 130, '90〜99%', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 162, 'の閲覧は予約に至らない', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 188, '（論文が先行研究から引く値）', '', { 'font-size': 14, fill: C.muted });
    S.p2b = el('g', {}, g2);
    t2(S.p2b, PX, 246, '割引の費用', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(S.p2b, PX, 272, 'は予約したときだけ発生', '', { 'font-size': 17, fill: C.ink });
    S.p2c = el('g', {}, g2);
    t2(S.p2c, PX, 330, '→ 予約した取引だけで学習', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(S.p2c, PX, 358, 'データが減り、帰属の問題も', '', { 'font-size': 15, fill: C.ink });
    t2(S.p2c, PX, 382, '避けられる（無作為割当てが前提）', '', { 'font-size': 15, fill: C.ink });
    t2(g2, 940, 520, '模式図（予約の割合は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: ratio-ordered allocation under budget B =====
    var g3 = S.g[2];
    // [CATE_Y, -CATE_pi]  (explainer's toy values)
    var cust = [[2.0, 1.0], [3.0, 3.0], [1.5, 0.5], [2.4, 2.0], [1.0, 2.0], [3.0, 1.2]];
    var order = cust.map(function (c, i) { return i; }).sort(function (a, b) { return cust[b][0] / cust[b][1] - cust[a][0] / cust[a][1]; });
    var U = 42, BASE = 262, CW = 86, CX0 = 110;
    el('line', { x1: 80, x2: 620, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 84, 70, '↑ 売上の増分 ' + m('CATE') + '<tspan font-size="12" dy="4">Y</tspan>', '', { 'font-size': 15, fill: C.b });
    t2(g3, 84, 490, '↓ 利益の減少 −' + m('CATE') + '<tspan font-size="12" dy="4" ' + MI + '>π</tspan>', '', { 'font-size': 15, fill: C.a });
    S.cols = cust.map(function (c, i) {
      var o = { g: el('g', {}, g3), from: CX0 + i * CW, to: CX0 + order.indexOf(i) * CW, rank: order.indexOf(i) };
      o.up = el('rect', { x: 0, y: BASE - c[0] * U, width: 40, height: c[0] * U, rx: 3, fill: C.b }, o.g);
      o.dn = el('rect', { x: 0, y: BASE + 4, width: 40, height: c[1] * U, rx: 3, fill: C.a }, o.g);
      o.lab = el('text', { x: 20, y: BASE + 4 + c[1] * U + 22, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, o.g);
      o.lab.textContent = '比 ' + (Math.round(c[0] / c[1] * 10) / 10);
      o.ring = el('rect', { x: -6, y: BASE - c[0] * U - 6, width: 52, height: c[0] * U + c[1] * U + 16, rx: 6, fill: 'none', stroke: C.b, 'stroke-width': 3 }, o.g);
      o.cost = c[1];
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 90, '並べる順：比', '', { 'font-size': 16, fill: C.muted });
    txt(p3, PX, 132, m('CATE') + '<tspan font-size="16" dy="6">Y</tspan><tspan dy="-6"> / (−</tspan>' + m('CATE') + '<tspan font-size="16" dy="6" ' + MI + '>π</tspan><tspan dy="-6">)</tspan>', { 'font-size': 28, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 196, '予算：利益の減少の合計 ≤ ' + m('B') + ' = 5', '', { 'font-size': 16, fill: C.ink });
    S.meterW = 250;
    el('rect', { x: PX, y: 214, width: S.meterW, height: 26, rx: 5, fill: C.panel }, p3);
    S.meter = el('rect', { x: PX, y: 214, width: 0, height: 26, rx: 5, fill: C.a }, p3);
    el('line', { x1: PX + S.meterW * 5 / 6, x2: PX + S.meterW * 5 / 6, y1: 206, y2: 248, stroke: C.ink, 'stroke-width': 2 }, p3);
    txt(p3, PX + S.meterW * 5 / 6, 268, m('B'), { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    S.used = el('text', { x: PX, y: 300, 'font-size': 16, fill: C.ink }, p3);
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 350, '上位 4 人で 4.7、次の人を', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX, 376, '加えると 7.7 で予算を超える', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（効果の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1, Campaign 1 =====
    var g4 = S.g[3];
    var sem = ['H1Y1', 'H2Y1', 'H1Y2', 'H2Y2', 'H1Y3', 'H2Y3', 'H1Y4'];
    var kpi = [75, 82, 102, 130, 148, 137, 183], npol = [8, 32, 54, 67, 35, 21, 18];
    var X0 = 130, DX = 74;
    function kx(i) { return X0 + i * DX; }
    function ky(v) { return 290 - v * 1.0; }
    t2(g4, 70, 64, '初期目標 KPI に対する比率', '', { 'font-size': 16, fill: C.muted });
    el('line', { x1: X0 - 30, x2: kx(6) + 30, y1: ky(100), y2: ky(100), stroke: C.muted, 'stroke-dasharray': '5 4' }, g4);
    txt(g4, X0 - 36, ky(100) + 5, '100%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    el('line', { x1: kx(1), x2: kx(1), y1: 80, y2: 470, stroke: C.b, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, g4);
    t2(g4, kx(1) + 8, 88, 'レーン運用の開始', '', { 'font-size': 14, fill: C.b });
    S.kseg = []; S.kpt = []; S.klab = [];
    kpi.forEach(function (v, i) {
      if (i > 0) S.kseg.push(el('line', { x1: kx(i - 1), y1: ky(kpi[i - 1]), x2: kx(i), y2: ky(v), stroke: i > 1 ? C.b : C.gray, 'stroke-width': 3 }, g4));
      S.kpt.push(el('circle', { cx: kx(i), cy: ky(v), r: i === 1 ? 8 : 5, fill: i >= 1 ? C.b : C.gray }, g4));
      var lb = el('text', { x: kx(i), y: ky(v) - 14, 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }, g4);
      lb.textContent = v + '%'; S.klab.push(lb);
    });
    t2(g4, 70, 330, '試した方策の数', '', { 'font-size': 16, fill: C.muted });
    S.bars = npol.map(function (n, i) {
      var b = el('rect', { x: kx(i) - 16, y: 450 - n * 1.5, width: 32, height: n * 1.5, rx: 3, fill: i >= 1 ? C.bsoft : C.panel, stroke: i >= 1 ? C.b : C.gray }, g4);
      var t = el('text', { x: kx(i), y: 444 - n * 1.5, 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }, g4);
      t.textContent = n;
      el('text', { x: kx(i), y: 474, 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' }, g4).textContent = sem[i];
      return { b: b, t: t };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'キャンペーン 1 の KPI', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 162, '75%', { 'font-size': 32, 'font-weight': 650, fill: C.muted });
    txt(p4, PX + 82, 160, '→', { 'font-size': 24, fill: C.ink });
    txt(p4, PX + 120, 162, '183%', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 214, '試した方策（半期）', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 244, '8 本 → 最大 67 本', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 300, '時系列の比較であり、', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 324, '因果的な検証ではない', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 348, '（論文の注記）', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 1 の数値から作図（著者が尺度を変えた値）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ACM TRANSACTIONS ON RECOMMENDER SYSTEMS · 2026';
    el('text', { x: 480, y: 202, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Challenges and Methods of Causal';
    el('text', { x: 480, y: 246, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Promotions Recommendation in E-commerce';
    t2(g5, 480, 292, 'EC における因果的な販促推薦の課題と方法', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'D. Goldenberg, A. Livne, C. Herrero-Gómez, J. Albert, I. Adiv,';
    el('text', { x: 480, y: 368, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'I. Spivak, R. Dach, F. Moraes, H. M. Proença, B. Shapira';
    el('text', { x: 480, y: 416, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3769300';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: playhead sweeps; ML lanes switch to the incumbent as it passes
    var hx = 90 + 510 * seg(t, 0.8, 6.8);
    S.head1.setAttribute('x1', hx); S.head1.setAttribute('x2', hx);
    S.lanes.forEach(function (l) {
      if (!l.sw) return;
      l.sw.setAttribute('width', Math.max(0, hx - l.x));
    });
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: bookings light up, costs appear, then non-bookings fade
    var b1 = seg(t, 9.5, 10.5), b2 = seg(t, 12.2, 13.2);
    S.dots.forEach(function (d) {
      if (d.b) d.c.setAttribute('fill', mix(mix(C.gray, C.ink, b1), C.b, b2));
      else d.c.setAttribute('opacity', 1 - 0.8 * b2);
    });
    S.coins.forEach(function (c) { c.setAttribute('opacity', seg(t, 10.8, 11.4)); });
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    S.p2b.setAttribute('opacity', seg(t, 10.8, 11.5));
    S.p2c.setAttribute('opacity', seg(t, 12.6, 13.3));
    // scene 3: columns sort by ratio, then fill the budget in order
    var k = seg(t, 17.6, 19.4);
    var used = 0;
    S.cols.forEach(function (o) {
      o.g.setAttribute('transform', 'translate(' + mix2(o.from, o.to, k) + ',0)');
    });
    var cum = 0, ord = S.cols.slice().sort(function (a, b) { return a.rank - b.rank; });
    ord.forEach(function (o, r) {
      var s = seg(t, 19.8 + r * 0.6, 20.3 + r * 0.6);
      var fits = cum + o.cost <= 5 + 1e-9;
      if (fits) { cum += o.cost; used += o.cost * s; }
      o.ring.setAttribute('opacity', fits ? s : 0);
      o.g.setAttribute('opacity', fits ? 1 : 1 - 0.55 * seg(t, 22.2, 22.8));
    });
    S.meter.setAttribute('width', S.meterW * used / 6);
    S.used.textContent = '使った予算：' + (Math.round(used * 10) / 10).toFixed(1);
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    S.p3b.setAttribute('opacity', seg(t, 22.4, 23));
    // scene 4: bars and the KPI line appear semester by semester
    S.bars.forEach(function (o, i) { var s = seg(t, 25 + i * 0.6, 25.5 + i * 0.6); o.b.setAttribute('opacity', s); o.t.setAttribute('opacity', s); });
    S.kpt.forEach(function (c, i) { var s = seg(t, 25 + i * 0.6, 25.5 + i * 0.6); c.setAttribute('opacity', s); S.klab[i].setAttribute('opacity', s); });
    S.kseg.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 25.6 + i * 0.6, 26.1 + i * 0.6)); });
    S.p4.setAttribute('opacity', seg(t, 29.6, 30.4));
  }
  function mix2(a, b, k) { var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; return a + (b - a) * e; }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
