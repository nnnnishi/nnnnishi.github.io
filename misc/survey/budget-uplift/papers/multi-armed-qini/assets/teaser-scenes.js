// =====================================================================
// teaser-scenes.js — Sverdrup, Wu, Athey & Wager (JCGS 2024), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 2 uses the values the paper's text quotes for its Fig. 1 (synthetic data, budget 0.2): 0.54, 0.60, 0.75.
// Scene 4 uses the numbers in Section 6 of arXiv v4 (election turnout, B = 5).
// Colours: orange = single-arm targeting; blue = the multi-armed policy; gray = no targeting / inactive.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '処置が一つなら、効果 ÷ コストの大きい順に配っていき、予算ごとの利得をたどった線が<span class="A">Qini 曲線</span>になる。', en: '' },
    { ja: '処置ごとに曲線を描くだけでは、人によって処置を使い分けたときの<span class="B">より大きな利得</span>が見えない。', en: '' },
    { ja: '各人の凸包上で次の処置へ上げる増分の費用対効果 ρ を求め、しきい値 λ を下げながら大きい順に割り当てる。', en: '' },
    { ja: '投票率の実験では、予算 5 で<span class="B">4 種類の手紙の組合せ</span>が 2%、<span class="A">Civic だけ</span>が 1% の上昇だった。', en: '' },
    { ja: '処置が複数あっても、増分の費用対効果の順に配れば、予算ごとの最適な利得を 1 本の Qini 曲線で比べられる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // scene 1 curve (schematic): rises and flattens once everyone with a positive effect is treated
  function g1curve(u) { return u < 0.6 ? 1 - Math.pow(1 - u / 0.6, 2) : 1; }

  // scene 3 toy ladders of incremental ratios rho (decreasing along each unit's hull)
  var LAD = [
    { rho: [3.2, 1.1], arm: [1, 2] },
    { rho: [2.6, 1.6, 0.5], arm: [1, 2, 3] },
    { rho: [1.9], arm: [2] },
    { rho: [2.9, 0.8], arm: [1, 3] }
  ];
  function ry(r) { return 470 - r / 3.6 * 350; }
  function lam(t) { return 3.5 - 3.2 * seg(t, 17.2, 23); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: single-arm Qini curve =====
    var g1 = S.g[0];
    el('line', { x1: 90, x2: 600, y1: 460, y2: 460, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: 90, x2: 90, y1: 460, y2: 100, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, 600, 490, '予算 ' + m('B') + '（1 人あたりの支出）→', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g1, 100, 90, '↑ 利得 ' + m('Q') + '(' + m('B') + ')', '', { 'font-size': 16, fill: C.ink });
    S.curve1 = el('polyline', { points: '', fill: 'none', stroke: C.a, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g1);
    S.dot1 = el('circle', { r: 9, fill: C.a }, g1);
    S.flat1 = t2(g1, 560, 140, '効果が正の人に配り終えると平らになる', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '処置が一つの場合', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 170, '並べる基準', '', { 'font-size': 16, fill: C.muted });
    txt(p1, PX, 204, m('τ') + '(' + m('x') + ') / ' + m('C') + '(' + m('x') + ')', { 'font-size': 26, 'font-weight': 600, fill: C.ink });
    t2(p1, PX, 252, '予算が尽きるまで', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 278, '大きい順に配る', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 326, '＝ 分数ナップザック問題', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: values at budget 0.2 quoted in the text for Fig. 1 =====
    var g2 = S.g[1];
    var bars = [['処置 1 だけ', 0.54, C.a, 130], ['処置 2 だけ', 0.60, C.a, 290], ['使い分け', 0.75, C.b, 450]];
    el('line', { x1: 90, x2: 600, y1: 450, y2: 450, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, 90, 70, '予算 ' + m('B') + ' = 0.2 での利得', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars2 = bars.map(function (b, i) {
      var o = {};
      o.r = el('rect', { x: b[3], y: 450, width: 110, height: 0, rx: 4, fill: b[2] }, g2);
      o.v = txt(g2, b[3] + 55, 0, b[1].toFixed(2), { 'font-size': 26, 'font-weight': 650, fill: b[2], 'text-anchor': 'middle' });
      t2(g2, b[3] + 55, 480, b[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle', 'font-weight': i === 2 ? 650 : 400 });
      o.h = b[1] * 430; o.t0 = 9 + i * 0.9;
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '合成データ（2 処置＋対照）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p2, PX, 160, '処置 1 のコスト：' + m('X') + '<tspan font-size="12" dy="4">1</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 192, '処置 2 のコスト：2' + m('X') + '<tspan font-size="12" dy="4">2</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 250, '人によって処置を', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 276, '選び分けると、どちらか', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 302, '一方だけより利得が大きい。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '論文 Fig. 1 について本文が挙げる値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: threshold lambda sweeps down through each unit's ladder of rho =====
    var g3 = S.g[2];
    el('line', { x1: 90, x2: 90, y1: 470, y2: 110, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 100, 92, '↑ 増分の費用対効果 ' + m('ρ'), '', { 'font-size': 16, fill: C.ink });
    S.items = [];
    LAD.forEach(function (u, ui) {
      var x = 160 + ui * 115;
      el('line', { x1: x, x2: x, y1: 120, y2: 470, stroke: C.hair, 'stroke-width': 1 }, g3);
      t2(g3, x, 500, '人 ' + (ui + 1), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      u.rho.forEach(function (r, j) {
        var y = ry(r), o = { u: ui, j: j };
        o.wait = el('circle', { cx: x, cy: y, r: 10, fill: '#fff', stroke: C.muted, 'stroke-width': 2 }, g3);
        o.act = el('rect', { x: x - 11, y: y - 11, width: 22, height: 22, rx: 2, fill: C.b }, g3);
        o.prev = el('polygon', { points: [x, y - 12, x + 11, y + 8, x - 11, y + 8].join(' '), fill: C.gray }, g3);
        txt(g3, x + 18, y + 5, '処置 ' + u.arm[j], { 'font-size': 14, fill: C.muted });
        S.items.push(o);
      });
    });
    S.lamLine = el('line', { x1: 90, x2: 580, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' }, g3);
    S.lamLab = txt(g3, 586, 0, '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, m('λ') + ' を下げる ＝ 予算を増やす', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('rect', { x: PX, y: 140, width: 18, height: 18, rx: 2, fill: C.b }, p3);
    t2(p3, PX + 30, 155, '割り当て中', '', { 'font-size': 16, fill: C.ink });
    el('polygon', { points: [PX + 9, 174, PX + 19, 192, PX - 1, 192].join(' '), fill: C.gray }, p3);
    t2(p3, PX + 30, 189, '前の割当て（格上げ済み）', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 217, r: 8, fill: '#fff', stroke: C.muted, 'stroke-width': 2 }, p3);
    t2(p3, PX + 30, 223, '順番待ち', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 274, 'キューから 1 つ取り出すたびに、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 300, '新しい人に配るか、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 326, '配った人を次の処置へ上げる。', '', { 'font-size': 16, fill: C.ink });
    txt(p3, PX, 380, 'O(' + m('nK') + ' log ' + m('nK') + ')', { 'font-size': 22, 'font-weight': 600, fill: C.b });
    t2(g3, 940, 520, '模式図（' + m('ρ') + ' の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: election turnout at B = 5 (Section 6) =====
    var g4 = S.g[3];
    var rows = [
      ['4 種類の組合せ', C.b, 1.2, 2.8, 2], ['Civic だけ', C.a, 0.1, 1.8, 1],
      ['差：組合せ − Civic', C.ink, 0.5, 1.5, null], ['差：共変量あり − なし', C.ink, -0.9, 0.4, null]
    ];
    var X0 = 300, X1 = 600, LO = -1, HI = 3, Y0 = 130, DY = 80;
    function px(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 64, '予算 ' + m('B') + ' = 5 での投票率の上昇（%）と 95% 信頼区間', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [-1, 0, 1, 2, 3].forEach(function (v) {
      el('line', { x1: px(v), x2: px(v), y1: Y0 - 34, y2: Y0 + DY * 3 + 30, stroke: v === 0 ? C.ink : C.hair, 'stroke-dasharray': v === 0 ? '4 3' : '' }, g4);
      el('text', { x: px(v), y: Y0 + DY * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v < 0 ? '−' + (-v) : String(v);
    });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, o = el('g', {}, g4);
      t2(o, X0 - 18, y + 6, r[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      el('line', { x1: px(r[2]), x2: px(r[3]), y1: y, y2: y, stroke: r[1], 'stroke-width': 4 }, o);
      el('line', { x1: px(r[2]), x2: px(r[2]), y1: y - 10, y2: y + 10, stroke: r[1], 'stroke-width': 2.5 }, o);
      el('line', { x1: px(r[3]), x2: px(r[3]), y1: y - 10, y2: y + 10, stroke: r[1], 'stroke-width': 2.5 }, o);
      if (r[4] != null) el('circle', { cx: px(r[4]), cy: y, r: 10, fill: r[1] }, o);
      return { g: o, t0: 25 + i * 0.9 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'Gerber ら（2008）の実験', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 150, '180,002 世帯・手紙 4 種類', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 196, 'コスト（侵入度）', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 226, '1 · 15 · 30 · 45', { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 280, '共変量を使わない方策', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 306, 'Civic 91% ＋ Neighbors 9%', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 344, '利得はほぼ同じ。組合せの', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 370, '利点は主に、予算を二つの', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 396, '手紙に分けられることにある。', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 6 節（arXiv v4）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'JOURNAL OF COMPUTATIONAL AND GRAPHICAL STATISTICS · 2024';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Qini Curves for';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Multi-Armed Treatment Rules';
    t2(g5, 480, 302, '複数の処置を使い分ける割当てルールのための Qini 曲線', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Erik Sverdrup · Han Wu · Susan Athey · Stefan Wager';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/grf-labs/maq';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: draw the curve left to right
    var k1 = seg(t, 1, 5.5), pts = [], N = 60;
    for (var i = 0; i <= N; i++) {
      var u = 0.95 * k1 * i / N;
      pts.push((90 + u * 500).toFixed(1) + ',' + (460 - g1curve(u) * 300).toFixed(1));
    }
    S.curve1.setAttribute('points', pts.join(' '));
    var ue = 0.95 * k1;
    S.dot1.setAttribute('cx', 90 + ue * 500); S.dot1.setAttribute('cy', 460 - g1curve(ue) * 300);
    S.dot1.setAttribute('opacity', seg(t, 1, 1.3));
    S.flat1.setAttribute('opacity', seg(t, 4.6, 5.3));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    // scene 2: bars grow in order
    S.bars2.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 1.2), h = o.h * s;
      o.r.setAttribute('y', 450 - h); o.r.setAttribute('height', h);
      o.v.setAttribute('y', 450 - o.h - 14); o.v.setAttribute('opacity', seg(t, o.t0 + 1, o.t0 + 1.4));
    });
    S.p2.setAttribute('opacity', seg(t, 12.2, 13));
    // scene 3: lambda sweeps down; each unit's active arm is the one with rho_j > lambda > rho_{j+1}
    var L = lam(t), yl = ry(L);
    S.lamLine.setAttribute('y1', yl); S.lamLine.setAttribute('y2', yl);
    S.lamLab.setAttribute('y', yl + 6);
    S.lamLab.innerHTML = '<tspan ' + MI + '>λ</tspan> = ' + L.toFixed(1);
    S.items.forEach(function (o) {
      var r = LAD[o.u].rho, j = -1;
      for (var q = 0; q < r.length; q++) if (r[q] > L) j = q;
      o.act.setAttribute('opacity', o.j === j ? 1 : 0);
      o.prev.setAttribute('opacity', o.j < j ? 1 : 0);
      o.wait.setAttribute('opacity', o.j > j ? 1 : 0);
    });
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: rows appear in order, then the side panel
    S.rows4.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
