// =====================================================================
// teaser-scenes.js — Lin, Yang & Mo (WSDM 2027), unofficial explainer. Player: teaser-engine.js.
// Scene 1 uses the paper's introduction example (+3 vs +15 percentage points); the baseline rates are
// explainer-chosen (labelled 模式図). Scenes 2-3 are schematics with toy values.
// Scene 4 uses the numbers printed in Table 1 (arXiv v1).
// Colours: orange = the action-independent baseline f and learners that regress raw rewards;
//          blue   = the treatment contrast tau (CATE) and the paper's action-centered method.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '予算が限られるときは、反応しやすい人ではなく、<span class="B">上乗せ効果</span>の大きい人に配るべきである。', en: '' },
    { ja: '報酬をそのまま学ぶと、処置どうしの比較では消える<span class="A">基準部分 f</span> まで推定することになる。', en: '' },
    { ja: '選んだ行動の特徴から平均を引くと、<span class="A">基準部分</span>は期待値で消え、<span class="B">処置の差</span>だけが残る。', en: '' },
    { ja: '半合成データでは、予算を守る手法の中で<span class="B">提案法</span>の後悔が最も小さく、<span class="A">報酬を回帰する手法</span>の最良より約 20% 小さかった。', en: '' },
    { ja: '処置効果の差を直接学び、払える処置だけから選べば、予算を守りながら逐次に配れる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  var TA = '<tspan ' + MI + '>τ</tspan><tspan ' + MI + ' baseline-shift="sub" font-size="70%">a</tspan>';
  function SUP(c) { return '<tspan font-size="70%" baseline-shift="super">' + c + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two segments, baseline response + uplift =====
    var g1 = S.g[0], U1 = 4.5, X1 = 110;
    T(g1, 70, 60, '100 ドルのクレジットを配ったときの反応率（%）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.seg1 = [['ヘビーな投稿者', 60, 3, 150], ['中間層の投稿者', 20, 15, 290]].map(function (r) {
      var o = {}, y = r[3];
      T(g1, X1, y - 14, r[0], { 'font-size': 17, fill: C.ink });
      el('rect', { x: X1, y: y, width: r[1] * U1, height: 46, fill: C.gray }, g1);
      o.up = el('rect', { x: X1 + r[1] * U1, y: y, width: r[2] * U1, height: 46, fill: C.b }, g1);
      o.lab = T(g1, X1 + (r[1] + r[2]) * U1 + 12, y + 30, '+' + r[2] + ' pt', { 'font-size': 18, 'font-weight': 650, fill: C.b });
      o.box = el('rect', { x: X1 - 8, y: y - 8, width: (r[1] + r[2]) * U1 + 16, height: 62, rx: 8, fill: 'none', 'stroke-width': 3 }, g1);
      return o;
    });
    S.seg1[0].box.setAttribute('stroke', C.a); S.seg1[1].box.setAttribute('stroke', C.b);
    el('line', { x1: X1, x2: X1 + 100 * U1, y1: 370, y2: 370, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    [0, 50, 100].forEach(function (v) { el('text', { x: X1 + v * U1, y: 394, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g1).textContent = v; });
    S.pick1a = T(g1, 70, 440, '反応しやすさで並べる → ヘビーな投稿者', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    S.pick1b = T(g1, 70, 476, '上乗せ効果で並べる → 中間層の投稿者', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 112, width: 18, height: 18, rx: 3, fill: C.gray }, p1);
    T(p1, PX + 28, 127, '配らなくても起きる分', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 146, width: 18, height: 18, rx: 3, fill: C.b }, p1);
    T(p1, PX + 28, 161, '配ったことで増える分', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 216, '予算はトラフィックの', { 'font-size': 17, fill: C.ink });
    T(p1, PX, 242, '20% 分しかない。', { 'font-size': 17, fill: C.ink });
    T(p1, PX, 290, '+3 pt と +15 pt は', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 314, '論文の序論の例。', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 338, '灰色の長さは解説者が置いた値。', { 'font-size': 15, fill: C.muted });
    T(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Y = f(x) + tau_a(x); differences do not involve f =====
    var g2 = S.g[1], XA = 90, XB = 590;
    function fpx(s) { return 215 - 55 * Math.sin(6.5 * s + 0.4) - 25 * Math.sin(15 * s); }
    function tau1(s) { return 30 + 45 * s; }
    function tau2(s) { return 75 - 25 * s; }
    function poly(fn) { var pts = []; for (var i = 0; i <= 60; i++) { var s = i / 60; pts.push((XA + s * (XB - XA)).toFixed(1) + ',' + fn(s).toFixed(1)); } return pts.join(' '); }
    T(g2, XA, 62, '期待結果 E[' + m('Y') + ' | ' + m('x') + ', ' + m('a') + ']', { 'font-size': 16, fill: C.ink });
    S.f2 = el('polyline', { points: poly(fpx), fill: 'none', stroke: C.a, 'stroke-width': 3.5, pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    S.c21 = el('polyline', { points: poly(function (s) { return fpx(s) - tau1(s); }), fill: 'none', stroke: C.ink, 'stroke-width': 2 }, g2);
    S.c22 = el('polyline', { points: poly(function (s) { return fpx(s) - tau2(s); }), fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g2);
    S.gaps2 = [0.1, 0.3, 0.5, 0.7, 0.9].map(function (s) {
      var x = XA + s * (XB - XA);
      return el('line', { x1: x, x2: x, y1: fpx(s), y2: fpx(s) - tau1(s), stroke: C.b, 'stroke-width': 4 }, g2);
    });
    S.lab2 = el('g', {}, g2);
    T(S.lab2, XB + 8, fpx(1) + 5, m('f'), { 'font-size': 18, fill: C.a, 'font-weight': 600 });
    el('line', { x1: XA, x2: XB, y1: 470, y2: 470, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.low2 = el('g', {}, g2);
    T(S.low2, XA, 360, '対照との差 ' + TA + '(' + m('x') + ') だけを取り出すと', { 'font-size': 16, fill: C.ink });
    el('polyline', { points: poly(function (s) { return 470 - tau1(s); }), fill: 'none', stroke: C.b, 'stroke-width': 3 }, S.low2);
    el('polyline', { points: poly(function (s) { return 470 - tau2(s); }), fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '6 4' }, S.low2);
    T(g2, XB, 494, '文脈 ' + m('x') + ' →', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 120, m('Y') + ' = ' + '<tspan fill="#C2410C">' + m('f') + '(' + m('x') + ')</tspan> + <tspan fill="#1D4ED8">' + TA + '(' + m('x') + ')</tspan>', { 'font-size': 30, 'font-weight': 600, fill: C.ink });
    T(p2, PX, 176, m('f') + '：どの処置にも共通', { 'font-size': 16, fill: C.a });
    T(p2, PX, 200, '（非線形でもよい）', { 'font-size': 16, fill: C.a });
    T(p2, PX, 236, TA + '：対照に対する効果', { 'font-size': 16, fill: C.b });
    T(p2, PX, 260, '（理論では線形を仮定）', { 'font-size': 16, fill: C.b });
    T(p2, PX, 310, '処置どうしを比べると ' + m('f'), { 'font-size': 16, fill: C.ink });
    T(p2, PX, 334, 'は打ち消される。それでも', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 358, '報酬を回帰する学習器は', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 382, m('f') + ' まで当てはめる。', { 'font-size': 16, fill: C.ink });
    T(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: action-centering, toy numbers =====
    var g3 = S.g[2], ZL = 190, ZR = 470, ZM = 330, ZY = 110;
    el('line', { x1: 110, x2: 560, y1: ZY, y2: ZY, stroke: C.hair, 'stroke-width': 2 }, g3);
    el('circle', { cx: ZL, cy: ZY, r: 11, fill: C.ink }, g3);
    el('circle', { cx: ZR, cy: ZY, r: 11, fill: C.ink }, g3);
    T(g3, ZL, ZY - 24, m('z') + '(' + m('a') + SUP('−') + ')　確率 1/2', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    T(g3, ZR, ZY - 24, m('z') + '(' + m('a') + SUP('+') + ')　確率 1/2', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.mean3 = el('g', {}, g3);
    el('line', { x1: ZM, x2: ZM, y1: ZY - 14, y2: ZY + 14, stroke: C.ink, 'stroke-width': 3 }, S.mean3);
    T(S.mean3, ZM, ZY + 36, '平均 ' + m('z̄'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    T(S.mean3, (ZM + ZR) / 2, ZY + 36, m('u') + ' = +1', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    T(S.mean3, (ZM + ZL) / 2, ZY + 36, m('u') + ' = −1', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var BY = 330, UB = 26;
    function bars(x0, title, vals, col, key) {
      var o = { bars: [], vals: vals };
      T(g3, x0 + 105, 196, title, { 'font-size': 16, 'font-weight': 600, fill: col, 'text-anchor': 'middle' });
      el('line', { x1: x0 - 10, x2: x0 + 220, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
      [m('A') + ' = ' + m('a') + SUP('+'), m('A') + ' = ' + m('a') + SUP('−'), '平均'].forEach(function (lab, i) {
        var x = x0 + i * 75;
        var r = el('rect', { x: x, y: BY, width: 50, height: 0, fill: i === 2 ? col : H.mix(col, '#FFFFFF', 0.35) }, g3);
        o.bars.push(r);
        T(g3, x + 25, 482, lab, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      });
      o.avg = T(g3, x0 + 175, vals[2] === 0 ? BY - 12 : BY - vals[2] * UB - 10, vals[2] === 0 ? '0' : '+' + vals[2], { 'font-size': 18, 'font-weight': 650, fill: col, 'text-anchor': 'middle' });
      S[key] = o;
    }
    bars(80, m('u') + ' × ' + m('f') + '（基準）', [4, -4, 0], C.a, 'bf');
    bars(370, m('u') + ' × ' + TA + '（処置効果）', [1.5, -0.5, 0.5], C.b, 'bt');
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 116, m('u') + ' = ' + m('z') + '(' + m('A') + ') − ' + m('z̄'), { 'font-size': 26, 'font-weight': 600, fill: C.ink });
    T(p3, PX, 160, '自分が選んだ確率を知っている', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 184, 'ので、平均 ' + m('z̄') + ' は正確に分かる。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 230, m('f') + ' は ' + m('A') + ' によらないので、', { 'font-size': 16, fill: C.a });
    T(p3, PX, 254, '平均すると 0 になる。', { 'font-size': 16, fill: C.a });
    T(p3, PX, 300, '残るのは処置の差だけ。', { 'font-size': 16, fill: C.b });
    T(p3, PX, 324, '逆傾向スコアの重みは要らない。', { 'font-size': 16, fill: C.b });
    T(p3, PX, 380, '選ぶ候補は、残りの予算で', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 402, '払える処置に限る。', { 'font-size': 15, fill: C.muted });
    T(g3, 940, 520, '模式図（' + m('f') + ' = 4、' + m('τ') + ' = 1.5 と 0.5 は解説者が置いた例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (arXiv v1), regret against the fluid LP =====
    var g4 = S.g[3], X0 = 250, SC = 0.27, Y0 = 100, DY = 38;
    var rows = [
      ['DR-CATE-CBwK（提案）', 498, 56, C.b], ['No CATE prior', 592, 54, C.gray], ['Raw-Flex-CBwK', 620, 38, C.a],
      ['Raw-CBwK', 718, 54, C.a], ['No residualization', 836, 98, C.gray], ['SquareCBwK', 928, 103, C.a],
      ['UCB-ALP', 998, 80, C.a], ['LinUCB', 1040, 77, C.a], ['Offline-DR (fixed)', 1214, 128, C.gray]
    ];
    T(g4, 30, 58, '後悔 ' + m('R') + '(' + m('T') + ')（小さいほどよい、ひげは 95% 信頼区間）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 500, 1000].forEach(function (v) {
      el('line', { x1: X0 + v * SC, x2: X0 + v * SC, y1: Y0 - 24, y2: Y0 + DY * 8 + 20, stroke: C.hair }, g4);
      el('text', { x: X0 + v * SC, y: Y0 + DY * 8 + 42, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toLocaleString('en-US');
    });
    S.rows4 = rows.map(function (r, i) {
      var y = Y0 + DY * i, o = { full: r[1] * SC };
      el('text', { x: X0 - 64, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': i === 0 ? 650 : 400 }, g4).textContent = r[0];
      o.v = el('text', { x: X0 - 12, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4); o.v.textContent = r[1];
      o.bar = el('rect', { x: X0, y: y - 12, width: 0, height: 24, rx: 3, fill: r[3] }, g4);
      o.ci = el('line', { x1: X0 + (r[1] - r[2]) * SC, x2: X0 + (r[1] + r[2]) * SC, y1: y, y2: y, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      o.t0 = 25 + i * 0.45;
      return o;
    });
    var lg = el('g', {}, g4);
    [[C.b, '提案法'], [C.a, '報酬を回帰する手法'], [C.gray, '部品を外した版・固定方策']].forEach(function (L, i) {
      var x = [30, 140, 330][i];
      el('rect', { x: x, y: 492, width: 16, height: 16, rx: 3, fill: L[0] }, lg);
      T(lg, x + 24, 506, L[1], { 'font-size': 14, fill: C.ink });
    });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 104, '予算を守る手法の比較', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 146, '498', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 70, 146, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 98, 146, '620', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    T(p4, PX, 180, '約 20% 小さい', { 'font-size': 17, fill: C.ink });
    T(p4, PX, 232, '提案法の支出', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 266, '599.9 / 600', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 316, '予算制御を外すと', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 340, '後悔 −130、支出 2,729', { 'font-size': 15, fill: C.ink });
    T(p4, PX, 386, m('T') + ' = 6000、' + m('ρ') + ' = 0.10、32 シード', { 'font-size': 14, fill: C.muted });
    T(g4, 940, 520, '論文 Table 1（arXiv v1）の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'WSDM 2027';
    el('text', { x: 480, y: 212, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Action-Centered Causal Bandits for';
    el('text', { x: 480, y: 254, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Budget-Constrained Promotion Targeting';
    T(g5, 480, 300, '予算制約つき販促ターゲティングのための行動中心化因果バンディット', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yifan Lin · Kaixu Yang · Di Mo';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2611.08990';
    T(g5, 480, 468, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: uplift segments grow, then the two rankings pick different segments
    S.seg1.forEach(function (o, i) {
      var k = seg(t, 1 + i * 0.4, 2 + i * 0.4);
      o.up.setAttribute('opacity', k); o.lab.setAttribute('opacity', k);
    });
    S.seg1[0].box.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.pick1a.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.seg1[1].box.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.pick1b.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: f is drawn, the action curves follow, the gaps are shown, then only tau remains
    S.f2.setAttribute('stroke-dashoffset', 1 - seg(t, 8.6, 10.4));
    S.lab2.setAttribute('opacity', seg(t, 10, 10.5));
    var c = seg(t, 10.6, 11.4);
    S.c21.setAttribute('opacity', c); S.c22.setAttribute('opacity', c);
    S.gaps2.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 11.6 + i * 0.2, 12 + i * 0.2)); });
    S.low2.setAttribute('opacity', seg(t, 13.2, 14));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: centred features appear, then the products per action, then the averages
    S.mean3.setAttribute('opacity', seg(t, 17, 17.7));
    [S.bf, S.bt].forEach(function (o) {
      o.bars.forEach(function (r, i) {
        var k = i < 2 ? seg(t, 18 + i * 0.6, 18.6 + i * 0.6) : seg(t, 20.2, 20.9);
        var h = Math.abs(o.vals[i]) * 26 * k;
        r.setAttribute('height', h);
        r.setAttribute('y', o.vals[i] >= 0 ? 330 - h : 330);
      });
      o.avg.setAttribute('opacity', seg(t, 20.6, 21.2));
    });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: bars grow in table order
    S.rows4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6);
      o.bar.setAttribute('width', o.full * k);
      o.ci.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.8));
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29.4, 30.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
