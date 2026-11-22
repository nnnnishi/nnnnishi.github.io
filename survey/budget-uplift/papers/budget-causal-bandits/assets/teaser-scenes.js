// =====================================================================
// teaser-scenes.js — Pillai, Budget-Constrained Causal Bandits (arXiv 2604.26169 v2), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the numbers
// printed in Table 2 of arXiv v2 ($5,000 budget, 20 seeds).
// Colours: orange = offline two-stage pipeline (existing approach); blue = BCCB and the users it treats.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '従来は過去のランダム化実験のデータでアップリフトを学習し、そのあと予算内で配る相手を最適化する。', en: '' },
    { ja: '予算を期待値の制約に緩めると、最適な方策は「1 ドルあたりの効果 τ/c がしきい値 λ を超えたら配る」になる。', en: '' },
    { ja: '<span class="B">BCCB</span> は 1 人ずつ、効果の推定値に探索のゆらぎを足し、残り予算に応じて動かすしきい値と比べる。', en: '' },
    { ja: 'Criteo の実験では、過去データが 7,500 件以上になると<span class="A">オフライン手順</span>が <span class="B">BCCB</span> を有意に上回った。', en: '' },
    { ja: '過去データが少ないうちは BCCB、十分にたまったらオフライン手順、という使い分けを論文は提案する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function box(g, x, y, w, h, l1, l2, fill, stroke) {
    el('rect', { x: x, y: y, width: w, height: h, rx: 12, fill: fill, stroke: stroke, 'stroke-width': 1.8 }, g);
    t2(g, x + w / 2, y + h / 2 - (l2 ? 4 : -6), l1, '', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    if (l2) t2(g, x + w / 2, y + h / 2 + 22, l2, '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
  }
  function arrow(g, x1, y1, x2, y2, col) {
    el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': 2.5 }, g);
    var a = Math.atan2(y2 - y1, x2 - x1), s = 10;
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - s * Math.cos(a - 0.45)) + ',' + (y2 - s * Math.sin(a - 0.45)) + ' L' + (x2 - s * Math.cos(a + 0.45)) + ',' + (y2 - s * Math.sin(a + 0.45)) + ' z', fill: col }, g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: offline two-stage pipeline, needs historical data =====
    var g1 = S.g[0];
    S.st1 = [];
    var bx = [[70, 70, '過去の RCT データ', '数千〜数万件'], [70, 200, 'アップリフトモデル', m('τ̂') + '(' + m('x') + ') を学習'], [70, 330, '予算内の最適化', 'ナップザック問題']];
    bx.forEach(function (b, i) {
      var g = el('g', {}, g1);
      box(g, b[0], b[1], 300, 90, b[2], b[3], i === 0 ? '#FCEBDF' : '#fff', C.a);
      if (i < 2) arrow(g, 220, b[1] + 92, 220, b[1] + 126, C.a);
      S.st1.push(g);
    });
    var gEnd = el('g', {}, g1);
    arrow(gEnd, 372, 375, 440, 375, C.a);
    t2(gEnd, 452, 382, '配布', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    S.st1.push(gEnd);
    S.cross1 = el('g', {}, g1);
    el('line', { x1: 80, y1: 76, x2: 360, y2: 154, stroke: C.ink, 'stroke-width': 4 }, S.cross1);
    el('line', { x1: 80, y1: 154, x2: 360, y2: 76, stroke: C.ink, 'stroke-width': 4 }, S.cross1);
    t2(S.cross1, 392, 112, '新しいキャンペーン：', '', { 'font-size': 17, fill: C.ink });
    t2(S.cross1, 392, 140, '過去データ 0 件', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '2 段階のオフライン手順', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 180, '学習してから配るので、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 206, '代表的な過去データが', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 232, '十分にあることが前提。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 290, '新しい市場や顧客層では', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 314, 'この前提が成り立たない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: decision rule tau/c > lambda in the (c, tau) plane =====
    var g2 = S.g[1];
    var AX0 = 100, AX1 = 600, AY0 = 460, AY1 = 70;
    S.ax = { x0: AX0, x1: AX1, y0: AY0, y1: AY1 };
    S.region2 = el('polygon', { points: '', fill: C.bsoft }, g2);
    el('line', { x1: AX0, x2: AX1 + 10, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX1, AY0 + 30, '広告の費用 ' + m('c') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, AX0 + 10, AY1 - 18, '↑ 処置効果 ' + m('τ'), '', { 'font-size': 16, fill: C.ink });
    S.line2 = el('line', { x1: AX0, y1: AY0, x2: AX0, y2: AY0, stroke: C.ink, 'stroke-width': 3 }, g2);
    var r = rng(7); S.pts2 = [];
    for (var i = 0; i < 44; i++) {
      var px = AX0 + 20 + r() * 470, py = AY0 - 20 - r() * 360;
      S.pts2.push({ x: px, y: py, c: el('circle', { cx: px, cy: py, r: 8, fill: C.gray }, g2), k: r() });
    }
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 140, m('τ') + ' / ' + m('c') + ' &gt; ' + m('λ'), { 'font-size': 38, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 182, m('λ') + '：予算 1 ドルの影の価格', '', { 'font-size': 16, fill: C.muted });
    el('circle', { cx: PX + 9, cy: 230, r: 8, fill: C.b }, p2);
    t2(p2, PX + 26, 236, '直線より上：配る', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 266, r: 8, fill: C.gray }, p2);
    t2(p2, PX + 26, 272, '直線より下：配らない', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 322, '予算が厳しいほど ' + m('λ') + ' が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 348, '大きく、直線が急になる', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 396, 'ただし ' + m('τ') + ' も ' + m('λ') + ' も未知', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(g2, 940, 520, '模式図（点は架空の利用者）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: BCCB stream of users through a gate, budget draining =====
    var g3 = S.g[2];
    S.gateX = 360;
    el('line', { x1: 60, x2: 570, y1: 200, y2: 200, stroke: C.hair, 'stroke-width': 2 }, g3);
    el('rect', { x: S.gateX - 6, y: 150, width: 12, height: 100, rx: 4, fill: C.ink }, g3);
    t2(g3, S.gateX, 135, m('s') + ' / ' + m('c') + ' &gt; ' + m('λ̂'), '', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, 70, 135, '1 人ずつ到着 →', '', { 'font-size': 16, fill: C.muted });
    t2(g3, 582, 276, '配る', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g3, 582, 136, '配らない', '', { 'font-size': 16, fill: C.muted });
    var r3 = rng(23); S.users = [];
    for (var j = 0; j < 22; j++) {
      var treat = r3() < 0.38;
      S.users.push({ t0: 16.2 + j * 0.32, treat: treat, c: el('circle', { cx: -50, cy: 200, r: 10, fill: C.gray }, g3) });
    }
    // budget bar + lambda-hat gauge
    t2(g3, 70, 372, '残り予算 ' + m('B') + '<tspan dy="5" font-size="12">' + m('t') + '</tspan>', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: 70, y: 386, width: 520, height: 22, rx: 5, fill: C.panel }, g3);
    S.bud = el('rect', { x: 70, y: 386, width: 520, height: 22, rx: 5, fill: C.b }, g3);
    S.ideal = el('line', { x1: 0, x2: 0, y1: 380, y2: 414, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, g3);
    t2(g3, 70, 448, '破線：残り時間に比例する目安', '', { 'font-size': 14, fill: C.muted });
    S.lamLab = t2(g3, 590, 448, '', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.lamTxt = S.lamLab.querySelector('text');
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 100, '3 つの部品', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 146, '① 効果の推定', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 18, 172, m('τ̂') + ' = ' + m('f̂') + '<tspan dy="4" font-size="12">1</tspan><tspan dy="-4"> − </tspan>' + m('f̂') + '<tspan dy="4" font-size="12">0</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 218, '② 探索のゆらぎ', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 18, 244, m('s') + ' = ' + m('τ̂') + ' + ' + m('η') + '(' + m('θ') + ' − ' + m('θ') + '<tspan dy="4" font-size="12">c</tspan><tspan dy="-4">)</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 290, '③ ペース配分', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 18, 316, m('λ̂') + ' = ' + m('λ') + ' / pace', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 366, '使いすぎなら ' + m('λ̂') + ' が上がり、', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 390, '余り気味なら下がる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v2), $5,000 budget =====
    var g4 = S.g[3];
    var pts = [[500, 4.7], [1000, 7.0], [2000, 39.0], [3000, 45.8], [5000, 46.9], [7500, 71.1], [10000, 76.6], [15000, 85.0], [25000, 95.7], [50000, 107.0]];
    var X0 = 110, X1 = 600, Y0 = 440, Y1 = 90, LO = Math.log(400), HI = Math.log(60000), YM = 120;
    function sx(n) { return X0 + (Math.log(n) - LO) / (HI - LO) * (X1 - X0); }
    function sy(v) { return Y0 - v / YM * (Y0 - Y1); }
    t2(g4, 70, 58, '平均転換数（予算 5,000 ドル、20 シード）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 40, 80, 120].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: sy(v), y2: sy(v), stroke: C.hair }, g4);
      el('text', { x: X0 - 12, y: sy(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v;
    });
    [[500, '500'], [5000, '5,000'], [50000, '50,000']].forEach(function (k) {
      el('text', { x: sx(k[0]), y: Y0 + 28, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = k[1];
    });
    t2(g4, (X0 + X1) / 2, Y0 + 58, '過去データの件数 ' + m('n') + '（対数目盛）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.bline = el('line', { x1: X0, x2: X1, y1: sy(49.4), y2: sy(49.4), stroke: C.b, 'stroke-width': 3.5 }, g4);
    S.blab = t2(g4, X0 + 6, sy(49.4) + 26, 'BCCB 49.4', '', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.vx = el('line', { x1: sx(7500), x2: sx(7500), y1: Y1, y2: Y0, stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g4);
    S.vlab = t2(g4, sx(7500) - 8, Y1 + 16, m('n') + ' = 7,500', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.pts4 = pts.map(function (p, i) {
      var o = { c: el('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 8, fill: C.a }, g4), t0: 25 + i * 0.45 };
      if (i > 0) o.l = el('line', { x1: sx(pts[i - 1][0]), y1: sy(pts[i - 1][1]), x2: sx(p[0]), y2: sy(p[1]), stroke: C.a, 'stroke-width': 2.5 }, g4);
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, m('n') + ' ≤ 1,000', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 136, 'オフライン 4.7〜7.0 件', '', { 'font-size': 16, fill: C.a });
    t2(p4, PX, 186, m('n') + ' = 2,000〜5,000', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 212, '差は有意でない（' + m('p') + ' ≥ 0.6）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 262, m('n') + ' ≥ 7,500', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 288, 'オフラインが上回る', '', { 'font-size': 16, fill: C.a });
    t2(p4, PX, 312, '（' + m('n') + ' = 7,500 で ' + m('p') + ' = 0.043）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 366, 'BCCB の標準偏差は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 390, 'オフラインの 2.3〜3.6 分の 1', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    var tk = el('g', {}, g5);
    el('rect', { x: 150, y: 52, width: 300, height: 56, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 300, 87, '過去データが少ない → BCCB', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 52, width: 300, height: 56, rx: 12, fill: '#FCEBDF' }, tk);
    t2(tk, 660, 87, '十分にある → オフライン手順', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 178, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV 2026';
    el('text', { x: 480, y: 232, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Budget-Constrained Causal Bandits';
    el('text', { x: 480, y: 272, 'font-size': 22, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Bridging Uplift Modeling and Sequential Decision-Making';
    t2(g5, 480, 316, '予算制約つき因果バンディット', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 366, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Abhirami Pillai';
    el('text', { x: 480, y: 420, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2604.26169';
    t2(g5, 480, 476, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: pipeline builds up, then the historical data is crossed out
    S.st1.forEach(function (g, i) {
      var dim = i === 0 ? 1 : 1 - 0.65 * seg(t, 5.4, 6.2);
      g.setAttribute('opacity', seg(t, 0.6 + i * 0.8, 1.2 + i * 0.8) * dim);
    });
    S.p1.setAttribute('opacity', seg(t, 2.6, 3.4));
    S.cross1.setAttribute('opacity', seg(t, 4.8, 5.4));
    // scene 2: threshold line draws, points above turn blue, then lambda rises (line steepens)
    var A = S.ax, k = seg(t, 9, 10.8);
    var slope = 0.45 + 0.55 * seg(t, 12.6, 14.2);          // rise per unit run (pixels)
    var ex = A.x0 + (A.x1 - A.x0) * k, ey = A.y0 - slope * (ex - A.x0);
    if (ey < A.y1) { ex = A.x0 + (A.y0 - A.y1) / slope * k; ey = A.y0 - slope * (ex - A.x0); }
    S.line2.setAttribute('x2', ex); S.line2.setAttribute('y2', ey);
    var fx = A.x0 + (A.y0 - A.y1) / slope;
    var poly = fx < A.x1 ? [A.x0, A.y0, fx, A.y1, A.x0, A.y1] : [A.x0, A.y0, A.x1, A.y0 - slope * (A.x1 - A.x0), A.x1, A.y1, A.x0, A.y1];
    S.region2.setAttribute('points', poly.join(' '));
    S.region2.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.pts2.forEach(function (q) {
      var up = (A.y0 - q.y) > slope * (q.x - A.x0);
      var s = seg(t, 11 + q.k * 1.0, 11.5 + q.k * 1.0);
      q.c.setAttribute('fill', up ? H.mix(C.gray, C.b, s) : C.gray);
    });
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    // scene 3: users stream left to right; treated ones drop below and drain the budget
    var spent = 0, nT = 0;
    S.users.forEach(function (u) {
      var x = 60 + (t - u.t0) * 120, y = 200, past = x > S.gateX;
      if (past) { var d = Math.min(1, (x - S.gateX) / 60); y = 200 + (u.treat ? 70 : -70) * d; }
      u.c.setAttribute('cx', x); u.c.setAttribute('cy', y);
      u.c.setAttribute('opacity', x < 50 ? 0 : 1 - H.clamp((x - 540) / 30));
      u.c.setAttribute('fill', past ? (u.treat ? C.b : C.gray) : C.gray);
      if (past && u.treat) { spent += 1; }
      nT += u.treat ? 1 : 0;
    });
    var frac = 1 - 0.9 * spent / nT;
    S.bud.setAttribute('width', 520 * frac);
    var tf = H.clamp((t - 16.2) / 7.4), ideal = 70 + 520 * (1 - 0.9 * tf);
    S.ideal.setAttribute('x1', ideal); S.ideal.setAttribute('x2', ideal);
    var pace = (frac) / Math.max(1 - 0.9 * tf, 0.01);
    S.lamTxt.innerHTML = 'pace = ' + pace.toFixed(2) + '　→ ' + '<tspan ' + MI + '>λ̂</tspan>' + (pace >= 1 ? ' を下げる' : ' を上げる');
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: BCCB line, then offline points in order, then the crossover marker
    S.bline.setAttribute('opacity', seg(t, 24.4, 25)); S.blab.setAttribute('opacity', seg(t, 24.4, 25));
    S.pts4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.4);
      o.c.setAttribute('opacity', s); if (o.l) o.l.setAttribute('opacity', s);
    });
    S.vx.setAttribute('opacity', seg(t, 29.6, 30.2)); S.vlab.setAttribute('opacity', seg(t, 29.6, 30.2));
    S.p4.setAttribute('opacity', seg(t, 26, 26.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
