// =====================================================================
// teaser-scenes.js — Zhou, Athey & Wager (Operations Research 2023), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 2 (arXiv v2), n = 2500, average regret over 400 runs.
// Colours: orange = inverse-propensity weighted learning (IPWL); blue = CAIPWL, the paper's
//          doubly robust score vectors.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '二値の方策学習は処置効果の符号を ±1 のラベルにして分類する。行動が 3 つ以上になると、どの行動との差を使えばよいかが決まらない。', en: '' },
    { ja: '多値の<span class="A">逆確率重みづけ</span>は方策と同じ行動を取った人だけを推定した傾向スコアで重みづける。補助関数の誤差が n<sup>−1/4</sup> なら、後悔の上界も n<sup>−1/4</sup> にとどまる。', en: '' },
    { ja: '論文の方法は一人ひとりに行動の数だけ<span class="B">二重頑健スコア</span>を付け、木の葉ごとに合計が最大の行動を選ぶ。', en: '' },
    { ja: 'シミュレーション（n = 2,500）での後悔は、<span class="B">二重頑健スコア</span>と厳密な木探索で 0.039、<span class="A">逆確率重みづけ</span>と厳密な木探索で 0.215 だった。', en: '' },
    { ja: '傾向スコアを推定する観察データでも、多値の方策の後悔を 1/√n の速さで減らせる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.7em" dy="0.3em">' + s + '</tspan><tspan dy="-0.3em"></tspan>'; }
  function sup(s) { return '<tspan font-size="0.7em" dy="-0.5em">' + s + '</tspan><tspan dy="0.5em"></tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: binary = one difference per unit; three actions = no single difference =====
    var g1 = S.g[0];
    t2(g1, 70, 60, '行動が 2 つ：' + m('Γ̂') + sub('i') + '(1) − ' + m('Γ̂') + sub('i') + '(0)', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var Y1 = 160, r1 = rng(11);
    el('line', { x1: 80, x2: 590, y1: Y1, y2: Y1, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.bars1 = [];
    for (var i = 0; i < 16; i++) {
      var v = -1.3 + 2.6 * r1(), x = 100 + i * 31;
      var col = v > 0 ? C.ink : C.gray, o = {};
      o.l = el('line', { x1: x, x2: x, y1: Y1, y2: Y1, stroke: col, 'stroke-width': 3 }, g1);
      o.d = el('circle', { cx: x, cy: Y1, r: 5, fill: col }, g1);
      o.v = v; o.t0 = 0.8 + i * 0.08;
      S.bars1.push(o);
    }
    S.lab1 = t2(g1, 70, 240, '符号 → ±1 のラベル、大きさ → 重み', '', { 'font-size': 15, fill: C.muted });
    // three actions for one unit
    var g1b = S.g1b = el('g', {}, g1);
    t2(g1b, 70, 300, '行動が 3 つ：1 人に 3 つのスコア', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var vals = [0.6, 1.1, 0.9], BX = [170, 270, 370], BASE1 = 470;
    vals.forEach(function (v, k) {
      el('rect', { x: BX[k] - 26, y: BASE1 - v * 110, width: 52, height: v * 110, rx: 4, fill: C.gray }, g1b);
      txt(g1b, BX[k], BASE1 + 24, m('a') + sup(String(k + 1)), { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    });
    el('line', { x1: 120, x2: 420, y1: BASE1, y2: BASE1, stroke: C.ink, 'stroke-width': 1.5 }, g1b);
    var g1c = S.g1c = el('g', {}, g1);
    // dashed arcs between every pair of bar tops: three possible differences
    [[0, 1, 40], [1, 2, 40], [0, 2, 78]].forEach(function (p) {
      var x1 = BX[p[0]], x2 = BX[p[1]], y1 = BASE1 - vals[p[0]] * 110 - 6, y2 = BASE1 - vals[p[1]] * 110 - 6;
      var yc = Math.min(y1, y2) - p[2];
      el('path', { d: 'M' + x1 + ',' + y1 + ' Q' + (x1 + x2) / 2 + ',' + yc + ' ' + x2 + ',' + y2, fill: 'none', stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g1c);
    });
    txt(g1c, 470, 360, '？', { 'font-size': 44, 'font-weight': 650, fill: C.muted });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '二値：処置効果は 1 つ', '', { 'font-size': 17, fill: C.ink, 'font-weight': 600 });
    t2(p1, PX, 150, '重みつきの分類に置き換わる', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 176, '（Kitagawa–Tetenov、Athey–Wager）', '', { 'font-size': 14, fill: C.muted });
    var p1b = S.p1b = el('g', {}, g1);
    t2(p1b, PX, 320, '多値：どの差を使うか', '', { 'font-size': 17, fill: C.ink, 'font-weight': 600 });
    t2(p1b, PX, 348, '決まらない', '', { 'font-size': 17, fill: C.ink, 'font-weight': 600 });
    t2(p1b, PX, 384, '±1 の対応づけも', '', { 'font-size': 15, fill: C.muted });
    t2(p1b, PX, 408, 'そのままでは使えない', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: IPWL keeps units with A = pi(X), weighted by 1/e_hat =====
    var g2 = S.g[1];
    t2(g2, 70, 60, '実際の行動 ' + m('A') + ' と方策の行動 ' + m('π') + '(' + m('X') + ')', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var A2 = [2, 1, 3, 1, 2, 1, 3, 2, 1, 1, 3, 2], P2 = [2, 3, 3, 2, 1, 1, 1, 2, 3, 2, 3, 3];
    var E2 = [0.2, 0.6, 0.4, 0.6, 0.2, 0.6, 0.2, 0.2, 0.6, 0.6, 0.15, 0.2];
    S.pts2 = A2.map(function (a, j) {
      var cx = 130 + (j % 4) * 140, cy = 140 + Math.floor(j / 4) * 125, o = {};
      o.match = a === P2[j]; o.R = 9 + 3.2 / E2[j];
      o.c = el('circle', { cx: cx, cy: cy, r: 12, fill: C.ink }, g2);
      o.t = txt(g2, cx, cy + 42, m('A') + '=' + a + '　' + m('π') + '=' + P2[j], { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 110, '使う人：' + m('A') + ' = ' + m('π') + '(' + m('X') + ')', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(p2, PX, 140, '重み：1 / ' + m('ê') + sub(m('A')) + '(' + m('X') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 166, '円の大きさ＝重み', '', { 'font-size': 14, fill: C.muted });
    var p2b = S.p2b = el('g', {}, g2);
    t2(p2b, PX, 236, '補助関数の誤差が ' + m('n') + sup('−1/4') + ' なら', '', { 'font-size': 16, fill: C.ink });
    t2(p2b, PX, 262, '後悔の上界も', '', { 'font-size': 16, fill: C.ink });
    txt(p2b, PX, 326, m('n') + sup('−1/4'), { 'font-size': 52, 'font-weight': 650, fill: C.a });
    t2(p2b, PX, 380, '論文の方法は ' + m('n') + sup('−1/2'), '', { 'font-size': 17, fill: C.b, 'font-weight': 600 });
    t2(p2b, PX, 412, '（論文 1 章の例）', '', { 'font-size': 14, fill: C.muted });
    t2(g2, 940, 520, '模式図（' + m('ê') + ' の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: score vectors; one split sweeps; each leaf takes its best action =====
    var g3 = S.g[2];
    var AX0 = 90, AX1 = 590, YD = 130, r3 = rng(41), P3 = [];
    t2(g3, 70, 60, '一人ひとりにスコアのベクトル (' + m('Γ̂') + sub('i,1') + ', ' + m('Γ̂') + sub('i,2') + ', ' + m('Γ̂') + sub('i,3') + ')', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: AX0 - 10, x2: AX1 + 10, y1: YD + 22, y2: YD + 22, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX1 + 10, YD + 46, '特徴 ' + m('x') + ' →', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    for (var j = 0; j < 30; j++) {
      var u = (j + 0.2 + r3() * 0.6) / 30, xx = AX0 + u * (AX1 - AX0);
      var gv = [1.0 - 2.0 * u + (r3() - 0.5) * 1.6, 0.25 + (r3() - 0.5) * 1.6, -1.0 + 2.0 * u + (r3() - 0.5) * 1.6];
      el('circle', { cx: xx, cy: YD - 4 + (r3() - 0.5) * 24, r: 6, fill: C.ink }, g3);
      P3.push({ x: xx, g: gv });
    }
    function leafSums(c) {
      var L = [0, 0, 0], R = [0, 0, 0];
      P3.forEach(function (q) { var T = q.x < c ? L : R; for (var k = 0; k < 3; k++) T[k] += q.g[k]; });
      return [L, R];
    }
    function best(v) { var b = 0; for (var k = 1; k < 3; k++) if (v[k] > v[b]) b = k; return b; }
    S.J = function (c) { var s = leafSums(c); return s[0][best(s[0])] + s[1][best(s[1])]; };
    S.leafSums = leafSums; S.best = best;
    S.AX0 = AX0 - 5; S.AX1 = AX1 + 5;
    S.J0 = S.J(S.AX0); var jb = -1e9, mx = 1;
    for (var c = S.AX0; c <= S.AX1; c += 2) {
      var vJ = S.J(c); if (vJ > jb) { jb = vJ; S.cBest = c; }
      leafSums(c).forEach(function (T) { T.forEach(function (v) { mx = Math.max(mx, Math.abs(v)); }); });
    }
    S.jMax = jb; S.U3 = 110 / mx;
    S.cut3 = el('line', { x1: 0, x2: 0, y1: 92, y2: YD + 30, stroke: C.b, 'stroke-width': 3 }, g3);
    // leaf bar groups
    S.BASE3 = 380;
    el('line', { x1: 110, x2: 300, y1: S.BASE3, y2: S.BASE3, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: 380, x2: 570, y1: S.BASE3, y2: S.BASE3, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 205, 232, '左の葉：行動ごとの合計', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, 475, 232, '右の葉：行動ごとの合計', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.lbars = [[], []];
    [150, 420].forEach(function (x0, side) {
      for (var k = 0; k < 3; k++) {
        var cx = x0 + k * 56;
        S.lbars[side].push(el('rect', { x: cx - 20, y: S.BASE3, width: 40, height: 0, rx: 3, fill: C.gray }, g3));
        txt(g3, cx, 508, m('a') + sup(String(k + 1)), { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      }
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 116, 'max Σ ' + m('Γ̂') + sub(m('i') + ', ' + m('π') + '(' + m('X') + sub('i') + ')'), { 'font-size': 21, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 148, m('π') + ' ∈ ' + m('Π') + '（ここでは分割 1 回の木）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 200, '分割しない場合からの増分', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: PX, y: 212, width: 240, height: 16, rx: 4, fill: C.panel }, p3);
    S.meter = el('rect', { x: PX, y: 212, width: 0, height: 16, rx: 4, fill: C.b }, p3);
    el('line', { x1: PX + 236, x2: PX + 236, y1: 206, y2: 234, stroke: C.ink, 'stroke-width': 2 }, p3);
    t2(p3, PX, 290, '葉ごとに合計が最大の', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 316, '行動を割り当てる', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 366, '分割点は全通り試す', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 390, '（厳密な木探索）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点は架空の個体）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v2), n = 2500 =====
    var g4 = S.g[3];
    var rows = [
      ['CAIPWL-opt', 0.0393409, C.b], ['CAIPWL-skip', 0.0399413, C.b], ['CAIPWL-greedy', 0.1943858, C.b],
      ['IPWL-opt', 0.2154734, C.a], ['IPWL-skip', 0.2143081, C.a], ['IPWL-greedy', 0.4827773, C.a],
      ['ランダム', 0.8679667, C.muted]
    ];
    var X0 = 230, U4 = 420, Y0 = 104, DY = 52;
    t2(g4, 70, 56, '後悔（' + m('n') + ' = 2,500、400 回の平均）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.2, 0.4, 0.6, 0.8].forEach(function (v) {
      el('line', { x1: X0 + v * U4, x2: X0 + v * U4, y1: Y0 - 26, y2: Y0 + DY * 6 + 24, stroke: C.hair }, g4);
      el('text', { x: X0 + v * U4, y: Y0 + DY * 6 + 46, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 14, y: y + 6, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.bar = el('rect', { x: X0, y: y - 13, width: 0, height: 26, rx: 4, fill: rw[2] }, g4);
      o.full = rw[1] * U4;
      o.v = el('text', { x: X0 + o.full + 10, y: y + 6, 'font-size': 15, 'font-weight': 600, fill: rw[2] }, g4);
      o.v.textContent = rw[1].toFixed(3);
      o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, m('n') + ' = 1,000 → 2,500 で', '', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    t2(p4, PX, 150, 'CAIPWL-opt', '', { 'font-size': 15, fill: C.b });
    txt(p4, PX, 182, '0.128 → 0.039', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 226, 'IPWL-opt', '', { 'font-size': 15, fill: C.a });
    txt(p4, PX, 258, '0.212 → 0.215', { 'font-size': 24, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 310, '貪欲法は木の構造を', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 334, '誤りやすい', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 384, 'テストデータ 15,000 点', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v2）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'OPERATIONS RESEARCH · 2023';
    el('text', { x: 480, y: 206, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Offline Multi-Action Policy Learning:';
    el('text', { x: 480, y: 250, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Generalization and Optimization';
    t2(g5, 480, 296, 'オフラインの多値方策学習：汎化と最適化', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zhengyuan Zhou · Susan Athey · Stefan Wager';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/1810.04778';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: difference bars grow, then the three-action unit and its question mark
    S.bars1.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8), y = 160 - o.v * 48 * s;
      o.l.setAttribute('y2', y); o.d.setAttribute('cy', y);
    });
    S.lab1.setAttribute('opacity', seg(t, 2.2, 2.8));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.g1b.setAttribute('opacity', seg(t, 3.6, 4.4));
    S.g1c.setAttribute('opacity', seg(t, 4.8, 5.6));
    S.p1b.setAttribute('opacity', seg(t, 5.2, 6.0));
    // scene 2: matching units turn orange and grow by 1/e_hat; the rest fade
    var k2 = seg(t, 9.6, 11.0);
    S.pts2.forEach(function (o) {
      if (o.match) {
        o.c.setAttribute('r', 12 + (o.R - 12) * k2);
        o.c.setAttribute('fill', H.mix(C.ink, C.a, k2));
        o.c.setAttribute('opacity', 1); o.t.setAttribute('opacity', 1);
      } else { o.c.setAttribute('opacity', 1 - 0.8 * k2); o.t.setAttribute('opacity', 1 - 0.6 * k2); }
    });
    S.p2.setAttribute('opacity', seg(t, 9.8, 10.6));
    S.p2b.setAttribute('opacity', seg(t, 12.0, 12.8));
    // scene 3: split sweeps left to right, then settles at the maximiser
    var c;
    if (t < 20.8) c = S.AX0 + (S.AX1 - S.AX0) * seg(t, 17.2, 20.8);
    else c = S.AX1 + (S.cBest - S.AX1) * seg(t, 21.0, 22.2);
    S.cut3.setAttribute('x1', c); S.cut3.setAttribute('x2', c);
    S.cut3.setAttribute('opacity', seg(t, 16.8, 17.2));
    var sums = S.leafSums(c);
    sums.forEach(function (T, side) {
      var bk = S.best(T);
      T.forEach(function (v, k) {
        var r = S.lbars[side][k], h = Math.abs(v) * S.U3;
        r.setAttribute('height', h);
        r.setAttribute('y', v >= 0 ? S.BASE3 - h : S.BASE3);
        r.setAttribute('fill', k === bk ? C.b : C.gray);
      });
    });
    var f = Math.max(0, (S.J(c) - S.J0) / (S.jMax - S.J0));
    S.meter.setAttribute('width', 236 * f);
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4: bars grow in order, then the side panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.full * s);
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 29.4, 30.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
