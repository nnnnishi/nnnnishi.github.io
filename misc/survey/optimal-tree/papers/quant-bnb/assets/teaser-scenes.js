// =====================================================================
// teaser-scenes.js — Mazumder, Meng, Wang, Quant-BnB (ICML 2022; arXiv 2206.11844), unofficial explainer.
// Player: teaser-engine.js.
// Scene 1 uses the binary-feature counts of the appendix table; scene 2 the depth-3 row of avila in Table 3;
// scene 3 is a schematic with explainer-chosen toy values (labelled 模式図); scene 4 uses depth-2 runtimes
// from Table 3.
// Colours: orange = binarization + MurTree / DL8.5 / BinOCT; blue = Quant-BnB.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '連続の特徴量を<span class="A">すべてのしきい値で二値化</span>すると、二値の特徴量が膨れ上がる。', en: '' },
    { ja: '二値化したデータでは、既存の最適な手法がメモリや時間の上限に達することが多い。', en: '' },
    { ja: '<span class="B">Quant-BnB</span> はしきい値の範囲を分位点で区切り、下界が最良値を超えた区間を捨てていく。', en: '' },
    { ja: '深さ 2 の最適な木を、どのデータでも 5 秒未満で求めた。', en: '' },
    { ja: '連続の特徴量のまま、浅い最適な分類木と回帰木を現実的な時間で求められる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }
  function sub(s) { return '<tspan dy="5" font-size="12">' + s + '</tspan><tspan dy="-5"></tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: binary feature counts after equivalent conversion =====
    var g1 = S.g[0];
    txt(g1, 80, 116, '同値変換で二値化したときの特徴量の数', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var rows = [['bean', 16, 170481], ['magic', 10, 120435], ['htru', 8, 101412], ['avila', 10, 22176]];
    var LX = 250, LW = 330, L = function (v) { return LW * Math.log10(v) / Math.log10(300000); };
    S.r1 = rows.map(function (r, i) {
      var y = 150 + i * 72, g = el('g', {}, g1);
      txt(g, LX - 16, y + 26, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: LX, y: y, width: L(r[1]), height: 18, fill: C.gray }, g);
      txt(g, LX + L(r[1]) + 8, y + 15, '元 ' + r[1] + ' 個', { 'font-size': 14, fill: C.muted });
      var rb = el('rect', { x: LX, y: y + 22, width: 0, height: 22, fill: C.a }, g);
      var tb = txt(g, LX + L(r[2]) + 8, y + 39, r[2].toLocaleString('en-US') + ' 個', { 'font-size': 15, 'font-weight': 650, fill: C.a });
      return { g: g, rb: rb, tb: tb, w: L(r[2]), t0: 1.0 + i * 0.6 };
    });
    txt(g1, LX, 448, '長さは対数', { 'font-size': 14, fill: C.muted });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '同値変換', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, '値の異なるところすべてに', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 224, 'しきい値を置くので、', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 252, '最悪で ' + '<tspan ' + MI + '>O</tspan>(<tspan ' + MI + '>np</tspan>) 個になる。', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 306, '粗く二値化すると', { 'font-size': 16, fill: C.muted });
    txt(S.p1, PX, 330, '訓練精度が下がることがある', { 'font-size': 16, fill: C.muted });
    txt(g1, 940, 520, '論文の付録の表の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: existing methods hit the limits (avila, depth 3) =====
    var g2 = S.g[1];
    txt(g2, 80, 120, 'avila（10,430 件、特徴量 10 個）、深さ 3', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    S.c2 = [['BinOCT', 'メモリ不足', C.a], ['MurTree', 'メモリ不足', C.a], ['DL8.5', 'メモリ不足', C.a], ['Quant-BnB', '4,188 秒で最適', C.b]].map(function (r, i) {
      var g = el('g', {}, g2), y = 150 + i * 70;
      el('rect', { x: 80, y: y, width: 520, height: 54, rx: 10, fill: i < 3 ? '#FCEBDF' : C.bsoft }, g);
      txt(g, 104, y + 34, r[0], { 'font-size': 17, 'font-weight': 650, fill: C.ink });
      txt(g, 580, y + 34, r[1], { 'font-size': 17, 'font-weight': 650, fill: r[2], 'text-anchor': 'end' });
      return { g: g, t0: 9.0 + i * 0.6 };
    });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 170, 'メモリの上限 25 GB、', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 196, '時間の上限 4 時間', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 252, 'OCT、FlowOCT、', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 276, 'BendersOCT、GOSDT は', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 300, '16 データのどれでも', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 324, '最適な木を求められなかった', { 'font-size': 15, fill: C.muted });
    txt(g2, 940, 520, '論文の表 3 の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: quantile splitting of the threshold range =====
    var g3 = S.g[2];
    var X0 = 90, X1 = 600, W = X1 - X0;
    txt(g3, X0, 104, '根のしきい値の候補の範囲', { 'font-size': 16, fill: C.ink });
    S.lev = [];
    // level 0: whole range; level 1: 3 parts; level 2: 3 parts inside the kept one
    var L1 = [[0, 1 / 3, true], [1 / 3, 2 / 3, false], [2 / 3, 1, false]];
    var L2 = [[0, 1 / 3, false], [1 / 3, 2 / 3, true], [2 / 3, 1, false]];   // drawn zoomed: the kept left third
    function bar(y, a, b, keep, t0, lb) {
      var g = el('g', {}, g3);
      var r = el('rect', { x: X0 + a * W + 2, y: y, width: (b - a) * W - 4, height: 40, rx: 6, fill: C.panel, stroke: C.hair, 'stroke-width': 1.5 }, g);
      var tx = el('text', { x: X0 + (a + b) / 2 * W, y: y + 26, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, g);
      tx.textContent = lb;
      return { g: g, r: r, tx: tx, keep: keep, t0: t0 };
    }
    S.top = bar(120, 0, 1, true, 16.6, '');
    S.l1 = L1.map(function (q, i) { return bar(210, q[0], q[1], q[2], 17.8 + i * 0.3, ['下界 41', '下界 57', '下界 63'][i]); });
    S.l2 = L2.map(function (q, i) { return bar(304, q[0], q[1], q[2], 20.6 + i * 0.3, ['下界 49', '下界 44', '下界 52'][i]); });
    S.zoom = txt(g3, X0, 292, '残った左の区間を拡大して、さらに 3 つに区切る', { 'font-size': 14, fill: C.muted });
    S.uLab = txt(g3, X0, 392, '現在の最良値 ' + '<tspan ' + MI + '>U</tspan> = 46', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.leg = txt(g3, X0, 430, '下界が ' + '<tspan ' + MI + '>U</tspan> を超えた区間は最適な木を含まないので捨てる', { 'font-size': 15, fill: C.muted });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, 'Quant-BnB', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 範囲を分位点で', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, '3 つに区切る', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 区切った点で木を', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '作り、上界を更新', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 288, '③ 真ん中のデータを', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 312, '捨てて下界を計算', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 366, '反復は高々 ⌈log' + sub('s') + ' <tspan ' + MI + '>n</tspan>⌉ 回', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: depth-2 runtimes (Table 3), log scale =====
    var g4 = S.g[3];
    var BX = 220, BW = 400, B = function (s) { return BX + BW * (Math.log10(s) + 1) / 4; };   // 0.1 .. 1000 s
    [0.1, 1, 10, 100, 1000].forEach(function (v) {
      el('line', { x1: B(v), x2: B(v), y1: 100, y2: 440, stroke: C.hair, 'stroke-width': 1 }, g4);
      el('text', { x: B(v), y: 464, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v >= 1 ? String(v) : '0.1';
    });
    txt(g4, B(31.6), 488, '秒（対数）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    txt(g4, 70, 76, '深さ 2 の最適な分類木を求める時間', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rr = [['bidding', 0.2, 72], ['eeg', 2.9, 34], ['occupancy', 0.3, 33], ['page', 0.4, 84], ['segment', 1.1, 213], ['wilt', 0.2, 314]];
    S.r4 = rr.map(function (r, i) {
      var y = 116 + i * 54, g = el('g', {}, g4);
      txt(g, BX - 14, y + 20, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var ra = el('rect', { x: BX, y: y, width: 0, height: 17, fill: C.a }, g);
      var rb = el('rect', { x: BX, y: y + 20, width: 0, height: 17, fill: C.b }, g);
      var ta = el('text', { x: B(r[2]) + 8, y: y + 14, 'font-size': 13, 'font-weight': 600, fill: C.a }, g); ta.textContent = String(r[2]);
      var tb = el('text', { x: B(r[1]) + 8, y: y + 34, 'font-size': 13, 'font-weight': 600, fill: C.b }, g); tb.textContent = String(r[1]);
      return { g: g, ra: ra, rb: rb, ta: ta, tb: tb, wa: B(r[2]) - BX, wb: B(r[1]) - BX, t0: 24.6 + i * 0.5 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX + 20, 130, '■ DL8.5（二値化）', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    txt(S.p4, PX + 20, 158, '■ Quant-BnB', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    txt(S.p4, PX + 20, 214, 'MurTree はこれらの', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 20, 238, 'データで DL8.5 より遅い', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 20, 286, 'BinOCT はこの 6 データで', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX + 20, 310, '4 時間以内に終わらない', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の表 3 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 40, width: 300, height: 70, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 68, '分類と回帰の両方', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 94, '深さ 2・3 の最適な木', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 40, width: 300, height: 70, rx: 12, fill: C.panel }, g5);
    txt(g5, 660, 68, '限界', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g5, 660, 94, '深さ 4 以上は勧めない', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 164, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2022';
    el('text', { x: 480, y: 210, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Quant-BnB: A Scalable Branch-and-Bound Method for';
    el('text', { x: 480, y: 248, 'font-size': 29, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Decision Trees with Continuous Features';
    txt(g5, 480, 292, '連続の特徴量に対する最適決定木のための分枝限定法', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Rahul Mazumder, Xiang Meng, Haoyue Wang';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v162/mazumder22a.html';
    txt(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function paint(b, t, decide) {
    b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.4));
    var k = seg(t, decide, decide + 0.5);
    if (b.keep) { b.r.setAttribute('fill', H.mix('#EEF0F3', '#E7EEFC', k)); b.r.setAttribute('stroke', k > 0.5 ? C.b : C.hair); b.tx.setAttribute('fill', k > 0.5 ? C.b : C.ink); }
    else { b.r.setAttribute('fill', H.mix('#EEF0F3', '#FCEBDF', k)); b.r.setAttribute('stroke', k > 0.5 ? C.a : C.hair); b.tx.setAttribute('fill', k > 0.5 ? C.a : C.ink); }
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.r1.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.rb.setAttribute('width', r.w * H.ease(seg(t, r.t0 + 0.3, r.t0 + 1.1)));
      r.tb.setAttribute('opacity', seg(t, r.t0 + 1.0, r.t0 + 1.3));
    });
    S.p1.setAttribute('opacity', seg(t, 3.4, 4.2));
    // scene 2
    S.c2.forEach(function (c) { c.g.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.4)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    // scene 3
    S.top.g.setAttribute('opacity', seg(t, 16.6, 17.0));
    S.l1.forEach(function (b) { paint(b, t, 19.4); });
    S.l2.forEach(function (b) { paint(b, t, 22.0); });
    S.uLab.setAttribute('opacity', seg(t, 18.8, 19.2));
    S.zoom.setAttribute('opacity', seg(t, 20.2, 20.6));
    S.leg.setAttribute('opacity', seg(t, 19.6, 20.0));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.r4.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.ra.setAttribute('width', r.wa * H.ease(seg(t, r.t0, r.t0 + 0.8)));
      r.rb.setAttribute('width', r.wb * H.ease(seg(t, r.t0 + 0.3, r.t0 + 1.1)));
      r.ta.setAttribute('opacity', seg(t, r.t0 + 0.7, r.t0 + 1.0));
      r.tb.setAttribute('opacity', seg(t, r.t0 + 1.0, r.t0 + 1.3));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
