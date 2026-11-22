// =====================================================================
// teaser-scenes.js — Cong, Xu & Zhou (IJCAI 2025), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図): the trade-off curve of
// two agents with candidates (6,2),(9,5) and (4,1),(7,3), one coupon each (same example as Fig. 1 of the
// page), and one agent with four candidate lines and p = 2. Scene 4 uses the numbers printed in Table 2.
// Colours: orange = solving per budget / scan line algorithm; blue = signature functions, trade-off curve,
// p-level algorithm.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '予算を一つ決めて解くやり方では、予算額を選ぶために<span class="A">何度も解き直す</span>ことになる。', en: '' },
    { ja: '利用者ごとに、候補クーポンの直線 v − λc の上位 p 本の和を<span class="B">署名関数</span>として求める。', en: '' },
    { ja: '署名関数を全員分足すと<span class="B">トレードオフ曲線</span>が得られ、1 人の変更は変わった折れ点だけ直せばよい。', en: '' },
    { ja: '一様乱数の実験では、p が小さいと<span class="A">走査法</span>が、p が大きいと<span class="B">p-level の方法</span>が速かった。', en: '' },
    { ja: '予算と利益の曲線全体を持っておき、利用者ごとの変化は差分で反映する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sup(b, e, rest) { return b + '<tspan dy="-9" font-size="12">' + e + '</tspan>' + (rest ? '<tspan dy="9">' + rest + '</tspan>' : ''); }

  // toy trade-off curves (budget, value): before and after agent B's upgrade cost changes 3 -> 2.5
  var CURVE0 = [[0, 0], [1, 4], [3, 10], [5, 13], [8, 16], [10, 16]];
  var CURVE1 = [[0, 0], [1, 4], [3, 10], [4.5, 13], [7.5, 16], [10, 16]];
  function bx(B) { return 100 + 48 * B; }
  function by(v) { return 450 - 20 * v; }
  function tau(cv, B) {
    for (var i = 1; i < cv.length; i++) if (B <= cv[i][0]) {
      var a = cv[i - 1], b = cv[i]; return a[1] + (b[1] - a[1]) * (B - a[0]) / (b[0] - a[0]);
    }
    return cv[cv.length - 1][1];
  }
  function partial(cv, Bmax) {
    var pts = [];
    cv.forEach(function (q) { if (q[0] <= Bmax) pts.push(bx(q[0]) + ',' + by(q[1])); });
    pts.push(bx(Bmax) + ',' + by(tau(cv, Bmax)));
    return pts.join(' ');
  }
  function axes(g, ylab) {
    el('line', { x1: 100, x2: 590, y1: 450, y2: 450, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: 100, x2: 100, y1: 450, y2: 90, stroke: C.ink, 'stroke-width': 1.5 }, g);
    t2(g, 590, 482, '予算 ' + m('B') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g, 110, 80, ylab, '', { 'font-size': 16, fill: C.ink });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one optimisation per budget value =====
    var g1 = S.g[0];
    axes(g1, '↑ 価値の合計');
    S.ghost = el('polyline', { points: partial(CURVE0, 10), fill: 'none', stroke: C.gray, 'stroke-width': 3, 'stroke-dasharray': '8 7' }, g1);
    S.q1 = t2(g1, bx(8.6), by(17.2), '曲線全体は？', '', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'middle' });
    S.solves = [2, 4, 6.5].map(function (B, i) {
      var o = {}, v = tau(CURVE0, B);
      o.g = el('g', {}, g1);
      el('line', { x1: bx(B), x2: bx(B), y1: 450, y2: by(v), stroke: C.a, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, o.g);
      el('rect', { x: bx(B) - 46, y: by(v) - 52, width: 92, height: 30, rx: 8, fill: '#FCEBDF' }, o.g);
      t2(o.g, bx(B), by(v) - 31, m('B') + ' = ' + B + ' で解く', '', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
      el('circle', { cx: bx(B), cy: by(v), r: 9, fill: C.a }, o.g);
      o.t0 = 1.2 + i * 1.3;
      return o;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '予算を決めてから解く', '', { 'font-size': 19, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 180, '・総予算をいくらにするか', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 214, '・目標の利益に要る予算は', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 248, '・他の施策と予算を分けるとき', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 300, 'どれも、予算と利益の', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 326, '曲線全体が要る。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 376, '価値と費用は予測値なので、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 400, '予測が変わるたびに解き直し。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: one agent, four candidate lines, p = 2; f = sum of the top two =====
    var g2 = S.g[1];
    S.L = [[8, 4], [6, 1.5], [5, 1], [4, 2]];
    function lx(l) { return 100 + 160 * l; }
    function ly(v) { return 290 - 22 * (v + 1); }
    function fy(v) { return 490 - 10 * v; }
    S.lx = lx; S.ly = ly; S.fy = fy;
    el('line', { x1: 100, x2: 590, y1: ly(0), y2: ly(0), stroke: C.hair, 'stroke-width': 1.5 }, g2);
    el('line', { x1: 100, x2: 100, y1: 300, y2: 66, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, 110, 60, m('v') + ' − ' + m('λ') + m('c') + '（候補 4 枚の直線）', '', { 'font-size': 16, fill: C.ink });
    S.lines = S.L.map(function (l) {
      var lend = Math.min(3, (l[0] + 1) / l[1]);
      return el('line', { x1: lx(0), y1: ly(l[0]), x2: lx(lend), y2: ly(l[0] - l[1] * lend), stroke: C.gray, 'stroke-width': 2.5 }, g2);
    });
    S.sweep = el('line', { x1: 0, x2: 0, y1: 66, y2: 490, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, g2);
    S.dots2 = [0, 1].map(function () { return el('circle', { r: 7, fill: C.b }, g2); });
    el('line', { x1: 100, x2: 590, y1: fy(0), y2: fy(0), stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: 100, x2: 100, y1: fy(0), y2: fy(15), stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, 110, fy(15) + 2, m('f') + '(' + m('λ') + ') = 上位 2 本の和', '', { 'font-size': 16, fill: C.b });
    t2(g2, 590, fy(0) + 26, m('λ') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.fpath = el('polyline', { points: '', fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g2);
    S.fkink = el('circle', { cx: lx(1), cy: fy(8.5), r: 7, fill: '#fff', stroke: C.b, 'stroke-width': 3 }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '利用者 1 人、' + m('p') + ' = 2', '', { 'font-size': 19, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 166, m('λ') + '：予算 1 単位の値段', '', { 'font-size': 16, fill: C.ink });
    S.live = txt(p2, PX, 214, '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 270, '上位 2 本の中で順位が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 296, '入れ替わっても、和は折れない。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 340, '折れうるのは ' + m('p') + '-level の頂点だけ', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 366, '→ 折れ点は ' + m('O') + '(' + m('m') + m('p') + '<tspan dy="-9" font-size="12">1/3</tspan><tspan dy="9">)</tspan> 個', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g2, 940, 520, '模式図（直線は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: sum of signatures -> trade-off curve; one agent changes =====
    var g3 = S.g[2];
    axes(g3, '↑ ' + m('τ') + '(' + m('B') + ')（価値の合計）');
    S.old = el('polyline', { points: partial(CURVE0, 10), fill: 'none', stroke: C.gray, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g3);
    S.curve = el('polyline', { points: '', fill: 'none', stroke: C.b, 'stroke-width': 4 }, g3);
    S.kinks = [1, 2, 3, 4].map(function () { return el('circle', { r: 6, fill: C.b }, g3); });
    S.rings = [3, 4].map(function () { return el('circle', { r: 14, fill: 'none', stroke: C.ink, 'stroke-width': 2 }, g3); });
    S.upd = t2(g3, bx(7.2), by(9.6), '1 人の候補が変わる', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 124, m('f') + ' = ' + m('f') + '<tspan dy="5" font-size="13">1</tspan><tspan dy="-5"> + ' + '</tspan>' + m('f') + '<tspan dy="5" font-size="13">2</tspan><tspan dy="-5"> + …</tspan>', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    txt(p3, PX, 168, m('τ') + '(' + m('B') + ') = min' + '<tspan dy="6" font-size="13">' + m('λ') + '</tspan><tspan dy="-6"> {' + m('λ') + m('B') + ' + ' + m('f') + '(' + m('λ') + ')}</tspan>', { 'font-size': 19, fill: C.ink });
    t2(p3, PX, 218, '評価・逆引き：二分探索', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 244, m('O') + '(log ' + m('k') + ')', '', { 'font-size': 16, fill: C.ink });
    S.p3b = el('g', {}, p3);
    t2(S.p3b, PX, 300, '1 人の更新：', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX, 326, '変わった ' + m('t') + ' 箇所だけ直す', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3b, PX, 362, m('O') + '(' + m('t') + ' log ' + m('k') + ')', '', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '模式図（解説者が置いた 2 人の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (seconds, log-log), p = 20 and p = m/5 =====
    var g4 = S.g[3];
    var M = [1e3, 5e3, 1e4, 5e4, 1e5, 5e5, 1e6, 1e7];
    var data = [
      ['p = 20', [0, 0.003, 0.008, 0.043, 0.094, 0.528, 1.147, 12.994], [0, 0.005, 0.010, 0.089, 0.216, 2.911, 7.291, 100.512]],
      ['p = m/5', [0.003, 0.091, 0.384, 9.531, 38.275, 'T', 'T', 'T'], [0.002, 0.02, 0.048, 0.326, 1.222, 10.500, 23.203, 133.974]]
    ];
    S.pts4 = []; S.lines4 = [];
    data.forEach(function (d, j) {
      var X0 = 120 + j * 270, W = 210, Y0 = 110, Hh = 300;
      function px(v) { return X0 + (Math.log10(v) - 3) / 4 * W; }
      function py(s) { return Y0 + Hh - (Math.log10(s) + 3) / 6 * Hh; }
      t2(g4, X0, Y0 - 24, m('p') + ' = ' + (j ? m('m') + '/5' : '20'), '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
      [-3, -1, 1, 3].forEach(function (e) {
        el('line', { x1: X0, x2: X0 + W, y1: py(Math.pow(10, e)), y2: py(Math.pow(10, e)), stroke: C.hair }, g4);
        if (j === 0) el('text', { x: X0 - 10, y: py(Math.pow(10, e)) + 5, 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = ['0.001', '0.1', '10', '1000'][(e + 3) / 2];
      });
      [3, 5, 7].forEach(function (e) {
        txt(g4, px(Math.pow(10, e)), Y0 + Hh + 30, sup('10', e), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      });
      el('line', { x1: X0, x2: X0 + W, y1: Y0 + Hh, y2: Y0 + Hh, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      el('line', { x1: X0, x2: X0, y1: Y0, y2: Y0 + Hh, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      [[d[1], C.a], [d[2], C.b]].forEach(function (sr) {
        var pts = [];
        sr[0].forEach(function (v, i) { if (typeof v === 'number' && v > 0) pts.push(px(M[i]) + ',' + py(v)); });
        S.lines4.push(el('polyline', { points: pts.join(' '), fill: 'none', stroke: sr[1], 'stroke-width': 2, opacity: 0 }, g4));
        sr[0].forEach(function (v, i) {
          var o = { t0: 25 + i * 0.55 };
          if (typeof v === 'number' && v > 0) o.e = el('circle', { cx: px(M[i]), cy: py(v), r: 7, fill: sr[1] }, g4);
          else if (v === 'T') { o.e = el('text', { x: px(M[i]), y: Y0 - 2, 'font-size': 20, 'font-weight': 700, fill: sr[1], 'text-anchor': 'middle' }, g4); o.e.textContent = '×'; }
          if (o.e) S.pts4.push(o);
        });
      });
    });
    t2(g4, 355, 470, '横軸：直線の本数 ' + m('m') + '　縦軸：秒（対数）', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 9, fill: C.a }, p4);
    t2(p4, PX + 26, 111, '走査法（scan）', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 9, fill: C.b }, p4);
    t2(p4, PX + 26, 146, m('p') + '-level の方法（opt）', '', { 'font-size': 17, fill: C.ink });
    txt(p4, PX, 200, m('m') + ' = ' + sup('10', 7, ' のとき'), { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 236, m('p') + ' = 20', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 268, '13.0', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(p4, PX + 64, 268, '秒 対', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 120, 268, '100.5', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 196, 268, '秒', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 312, m('p') + ' = ' + m('m') + '/5', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 344, 'TLE', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(p4, PX + 64, 344, '対', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX + 96, 344, '134.0', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 172, 344, '秒', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 392, '一様乱数、各 10 回の平均', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 414, '× は TLE（時間切れ）', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 120, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IJCAI · 2025';
    ['Large-Scale Trade-Off Curve Computation', 'for Incentive Allocation with', 'Cardinality and Matroid Constraints'].forEach(function (s, i) {
      el('text', { x: 480, y: 180 + i * 42, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 320, '個数制約・マトロイド制約のあるインセンティブ配分で、', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 346, '予算と利益のトレードオフ曲線を大規模に計算する', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 394, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yu Cong · Chao Xu · Yi Zhou';
    el('text', { x: 480, y: 440, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/congyu711/incentive-allocation-supplementaries';
    t2(g5, 480, 485, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: three separate solves, then the missing curve
    S.solves.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.6)); });
    S.ghost.setAttribute('opacity', seg(t, 5.2, 6.2));
    S.q1.setAttribute('opacity', seg(t, 5.8, 6.4));
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));

    // scene 2: sweep lambda from 0 to 3, highlight the top two lines, draw f
    var lam = 3 * seg(t, 9.2, 14.2);
    var vals = S.L.map(function (l, i) { return { i: i, v: l[0] - l[1] * lam }; }).sort(function (a, b) { return b.v - a.v; });
    var top = [vals[0].i, vals[1].i];
    S.lines.forEach(function (ln, i) {
      var on = top.indexOf(i) >= 0;
      ln.setAttribute('stroke', on ? C.b : C.gray); ln.setAttribute('stroke-width', on ? 4 : 2.5);
    });
    var sx = S.lx(lam);
    S.sweep.setAttribute('x1', sx); S.sweep.setAttribute('x2', sx);
    S.dots2.forEach(function (d, k) { d.setAttribute('cx', sx); d.setAttribute('cy', S.ly(vals[k].v)); });
    function f(l) { return l <= 1 ? 14 - 5.5 * l : 11 - 2.5 * l; }
    var pts = [S.lx(0) + ',' + S.fy(f(0))];
    if (lam > 1) pts.push(S.lx(1) + ',' + S.fy(f(1)));
    pts.push(sx + ',' + S.fy(f(lam)));
    S.fpath.setAttribute('points', pts.join(' '));
    S.fkink.setAttribute('opacity', lam > 1 ? 1 : 0);
    S.live.innerHTML = '<tspan class="mi">λ</tspan> = ' + lam.toFixed(2) + '　<tspan class="mi">f</tspan> = ' + f(lam).toFixed(2);
    S.p2.setAttribute('opacity', seg(t, 8.8, 9.6));

    // scene 3: draw the curve, then morph to the updated curve (two breakpoints move)
    var reach = 10 * seg(t, 16.8, 19.3), k = seg(t, 20.6, 21.8);
    var cv = CURVE0.map(function (q, i) { return [q[0] + (CURVE1[i][0] - q[0]) * k, q[1]]; });
    S.curve.setAttribute('points', partial(cv, Math.max(reach, 0.001)));
    S.kinks.forEach(function (c, i) {
      var q = cv[i + 1];
      c.setAttribute('cx', bx(q[0])); c.setAttribute('cy', by(q[1]));
      c.setAttribute('opacity', reach >= q[0] ? 1 : 0);
    });
    var ring = seg(t, 20.0, 20.5) * (1 - 0.6 * seg(t, 22.6, 23.2));
    S.rings.forEach(function (c, i) {
      var q = cv[i + 3]; c.setAttribute('cx', bx(q[0])); c.setAttribute('cy', by(q[1])); c.setAttribute('opacity', ring);
    });
    S.upd.setAttribute('opacity', seg(t, 20.0, 20.5));
    S.old.setAttribute('opacity', seg(t, 20.6, 21.0));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.p3b.setAttribute('opacity', seg(t, 20.4, 21.2));

    // scene 4: points appear in order of m
    S.pts4.forEach(function (o) { o.e.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.4)); });
    S.lines4.forEach(function (l) { l.setAttribute('opacity', seg(t, 29.0, 29.8)); });
    S.p4.setAttribute('opacity', seg(t, 29.4, 30.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
