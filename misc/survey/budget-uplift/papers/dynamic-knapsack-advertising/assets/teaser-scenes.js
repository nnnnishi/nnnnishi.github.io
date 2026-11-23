// =====================================================================
// teaser-scenes.js — Hao et al. (ICML 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 1 (simulation) and Table 3 (online A/B test) of the PMLR version.
// Colours: orange = myopic bidding / maximising each user's CPR; blue = MSBCB (v - CPR_thr * c, threshold selection).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '既存の入札は<span class="A">表示 1 回ごとの即時の収益</span>で決まるので、購入までに重ねた表示の貢献を数えない。', en: '' },
    { ja: '予算内で誰に何度見せるかは、価値と費用が方策で変わるナップザック問題になり、そのままでは探しきれない。', en: '' },
    { ja: 'しきい値 CPR<sub>thr</sub> を 1 つ決めれば、利用者ごとに <span class="B">v − CPR<sub>thr</sub>·c</span> を最大にする方策を学び、しきい値以上の利用者を選べばよい。', en: '' },
    { ja: 'シミュレーションでは最適解の 98.50% に達し、Taobao の A/B テストでは費用 −0.20% で収益を 10.08% 増やした。', en: '' },
    { ja: '長期の価値で入札し、予算はコスト性能比のしきい値 1 つで配分する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.7em" dy="5">' + s + '</tspan><tspan dy="-5">\u200b</tspan>'; }
  var THR = 'CPR' + sub('thr');

  // toy policies of one user: (V_C, V_G); index 0 = no ad (same values as the page's interactive figure)
  var P = [[0, 0], [1, 9], [2, 15.4], [3, 19.6], [4, 22], [6, 24], [3, 14], [5, 18.5]];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one user's journey; myopic bidding looks at each exposure alone =====
    var g1 = S.g[0];
    t2(g1, 70, 70, 'ある利用者とある広告のやり取り', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 70, x2: 610, y1: 260, y2: 260, stroke: C.ink, 'stroke-width': 2 }, g1);
    var ev = [[110, 'ニュースアプリ', '広告を表示', 1], [250, 'クリック', '商品ページへ', 0], [400, 'EC アプリ', 'バナーで表示', 1], [560, '購入', '', 2]];
    S.ev1 = ev.map(function (e, i) {
      var o = { g: el('g', {}, g1), t0: 1 + i * 1.3 };
      if (e[3] === 2) el('rect', { x: e[0] - 13, y: 247, width: 26, height: 26, fill: C.ink }, o.g);
      else el('circle', { cx: e[0], cy: 260, r: e[3] ? 13 : 8, fill: e[3] ? C.ink : C.gray }, o.g);
      t2(o.g, e[0], 310, e[1], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      if (e[2]) t2(o.g, e[0], 334, e[2], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      if (e[3] === 1) {
        o.lab = el('g', {}, g1);
        el('path', { d: 'M' + (e[0] - 40) + ',366 L' + (e[0] - 40) + ',376 L' + (e[0] + 40) + ',376 L' + (e[0] + 40) + ',366', fill: 'none', stroke: C.a, 'stroke-width': 2.5 }, o.lab);
        t2(o.lab, e[0], 404, 'この 1 回の', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
        t2(o.lab, e[0], 426, '即時の収益', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
      }
      return o;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '既存の入札', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 172, '表示 1 回ごとの即時の', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 198, '収益で入札額を決める。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '最初の表示が後の購入に', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 276, '効いた分は数えられない。', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '模式図（論文 Fig. 1 の例をもとに描いた）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: users as knapsack items whose value and weight change with the policy =====
    var g2 = S.g[1];
    t2(g2, 70, 70, '利用者 = ナップザックの品物', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 600, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 2 }, g2);
    S.items2 = [0, 1, 2, 3, 4, 5].map(function (i) {
      var x = 100 + i * 84, o = { x: x, ph: i * 1.1, base: 70 + (i * 37) % 60 };
      o.r = el('rect', { x: x, width: 60, y: 400, height: 0, rx: 5, fill: C.gray, stroke: C.muted, 'stroke-width': 1.2 }, g2);
      t2(g2, x + 30, 428, '利用者 ' + (i + 1), '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return o;
    });
    t2(g2, 340, 470, '方策を変えると、各利用者の価値 ' + m('V') + sub('G') + 'と費用 ' + m('V') + sub('C') + 'が変わる', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '探す範囲', '', { 'font-size': 17, fill: C.muted });
    txt(p2, PX, 190, '2<tspan font-size="30" dy="-22">' + m('N') + '</tspan><tspan dy="22"> × 方策</tspan>', { 'font-size': 46, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 246, '利用者は数億人、入札額は', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 270, '連続なので、直接は解けない。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 320, '価値と費用は未知で、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 344, 'オンラインで推定する必要がある。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: the threshold sweeps; the chosen policy maximises V_G - CPR_thr * V_C =====
    var g3 = S.g[2];
    function X(c) { return 110 + c * 64; } function Y(v) { return 450 - v * 13.5; }
    S.X = X; S.Y = Y;
    el('line', { x1: X(0), x2: X(7.3), y1: Y(0), y2: Y(0), stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: X(0), x2: X(0), y1: Y(0), y2: Y(26.5), stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, X(7.3), Y(0) + 30, '1 人の利用者の累積の費用 ' + m('V') + sub('C') + '→', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, X(0) + 10, Y(26.5) - 4, '↑ 累積の収益 ' + m('V') + sub('G'), '', { 'font-size': 16, fill: C.ink });
    S.l3 = el('line', { stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g3);
    S.gap3 = el('line', { stroke: C.b, 'stroke-width': 3.5 }, g3);
    P.forEach(function (p, i) {
      el('circle', i === 0 ? { cx: X(0), cy: Y(0), r: 8, fill: '#fff', stroke: C.muted, 'stroke-width': 2 } : { cx: X(p[0]), cy: Y(p[1]), r: 8, fill: C.gray }, g3);
    });
    el('circle', { cx: X(1), cy: Y(9), r: 15, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g3);
    t2(g3, X(1) - 20, Y(9) + 6, 'CPR 最大', '', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'end' });
    S.best3 = el('circle', { r: 10, fill: C.b }, g3);
    var p3 = el('g', {}, g3);
    S.thr3 = txt(p3, PX, 130, '', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    S.pick3 = txt(p3, PX, 176, '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    S.pick3b = txt(p3, PX, 202, '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(p3, PX, 256, 'しきい値が下がるほど、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 280, '費用の大きい方策が選ばれる。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 326, '方策は報酬 ' + m('v') + ' − ' + THR + '·' + m('c'), '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 350, 'の強化学習で学ぶ。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（点は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (approximation ratio) and Table 3 (online A/B test) =====
    var g4 = S.g[3];
    t2(g4, 70, 70, '最適解に対する累積収益の比（シミュレーション）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows = [['Contextual Bandit', 84.15, C.a], ['Constrained + DDPG', 83.17, C.gray], ['Greedy + maxCPR', 93.70, C.a], ['Greedy + DQN', 94.21, C.gray], ['MSBCB', 98.50, C.b]];
    var L = 270, W = 300;
    el('line', { x1: L, x2: L, y1: 100, y2: 440, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.rows4 = rows.map(function (r, i) {
      var y = 130 + i * 64, o = { t0: 25 + i * 0.7, w: r[1] / 100 * W };
      txt(g4, L - 12, y + 6, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end', 'font-family': 'Inter, sans-serif' });
      o.bar = el('rect', { x: L, y: y - 14, width: 0, height: 28, fill: r[2] }, g4);
      o.val = txt(g4, L + o.w + 8, y + 6, r[1].toFixed(2) + '%', { 'font-size': 16, 'font-weight': 600, fill: r[2] === C.gray ? C.ink : r[2] });
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'Taobao の A/B テスト', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 156, '本番の CEM との比較', '', { 'font-size': 15, fill: C.muted });
    txt(p4, PX, 214, '+10.08%', { 'font-size': 44, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 244, '収益（費用は −0.20%）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 290, 'ROI +10.31%', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 316, '文脈付きバンディットの', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 340, '収益は +0.91%', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 1・Table 3 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2020';
    el('text', { x: 480, y: 212, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dynamic Knapsack Optimization Towards';
    el('text', { x: 480, y: 254, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Efficient Multi-Channel Sequential Advertising';
    t2(g5, 480, 300, '効率的なマルチチャネル逐次広告に向けた動的ナップザック最適化', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 350, 'Xiaotian Hao · Zhaoqing Peng · Yi Ma ほか（全 15 名）', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2006.16312';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: events appear in order, the myopic labels follow each exposure
    S.ev1.forEach(function (o) {
      o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5));
      if (o.lab) o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1.1));
    });
    S.p1.setAttribute('opacity', seg(t, 5.6, 6.4));
    // scene 2: item heights wobble (value/weight depend on the policy)
    S.items2.forEach(function (o) {
      var h = o.base * (1 + 0.45 * Math.sin(1.6 * (t - 8) + o.ph)) * seg(t, 8.5, 9.5);
      o.r.setAttribute('y', 400 - h); o.r.setAttribute('height', h);
    });
    S.p2.setAttribute('opacity', seg(t, 10.5, 11.3));
    // scene 3: threshold sweeps from 9.6 down to 1.4; chosen policy = argmax V_G - thr * V_C
    var thr = 9.6 - 8.2 * seg(t, 17, 23), bi = 0, bv = 0;
    P.forEach(function (p, i) { var v = p[1] - thr * p[0]; if (v > bv + 1e-9) { bv = v; bi = i; } });
    var x1 = Math.min(7.3, 26.5 / thr);
    S.l3.setAttribute('x1', S.X(0)); S.l3.setAttribute('y1', S.Y(0)); S.l3.setAttribute('x2', S.X(x1)); S.l3.setAttribute('y2', S.Y(thr * x1));
    var q = P[bi];
    S.best3.setAttribute('cx', S.X(q[0])); S.best3.setAttribute('cy', S.Y(q[1]));
    S.gap3.setAttribute('x1', S.X(q[0])); S.gap3.setAttribute('x2', S.X(q[0])); S.gap3.setAttribute('y1', S.Y(q[1])); S.gap3.setAttribute('y2', S.Y(thr * q[0]));
    S.gap3.setAttribute('opacity', bi ? 1 : 0);
    S.thr3.innerHTML = THR + ' = ' + thr.toFixed(1);
    S.pick3.innerHTML = bi ? '選ぶ方策：費用 ' + q[0] + '、収益 ' + q[1] : '広告を出さない';
    S.pick3b.innerHTML = bi ? '（CPR ' + (q[1] / q[0]).toFixed(1) + '）' : '（どの方策も利得が 0 以下）';
    // scene 4: bars grow in order, then the online result
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.w * s); o.val.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
