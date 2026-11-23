// =====================================================================
// teaser-scenes.js — Tanaka, Kishimoto, et al. (WWW 2026), unofficial explainer. Player: teaser-engine.js.
// Every number is from the paper's coupon example: Table 1 (q(x,a), greedy 420 vs optimal 540),
// Appendix A (greedy totals for the six arrival orders: 430, 420, 540, 430, 400, 300) and
// Table 2 (relative reward gaps; OPLS reaches 540 in every arrival order). arXiv v4.
// Colours: orange = the greedy rule on the absolute expected reward;
//          blue   = the relative reward gap and OPLS.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'クーポンが 1 枚ずつしかないのに、来た人ごとに<span class="A">期待報酬が最大のもの</span>を配ると、後から来る人の分がなくなる。', en: '' },
    { ja: '<span class="A">貪欲法</span>の合計は到着順によって 300 から 540 まで変わり、6 通りの平均は 420 で最適な 540 に届かない。', en: '' },
    { ja: 'OPLS は期待報酬からそのクーポンの全員での平均を引いた<span class="B">相対的な報酬差</span>で選ぶ。', en: '' },
    { ja: '<span class="B">相対的な報酬差</span>で選ぶと、どの到着順でも最適と同じ 540 になる。', en: '' },
    { ja: '売り切れる品目は相対的な報酬差で、余る品目は期待報酬そのもので選ぶ。在庫が十分なら貪欲法と同じ選び方になる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  var Q = [[80, 250, 200], [100, 280, 120], [60, 100, 70]];
  var MEAN = [80, 210, 130];
  var COUP = ['30% 引き', '50% 引き', '70% 引き'];
  var ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  var GREEDY = [430, 420, 540, 430, 400, 300];   // Appendix A

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function xs(i) { return m('x') + '<tspan font-size="70%" baseline-shift="sub">' + (i + 1) + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  // 3x3 table of q(x,a); returns cell rects and value texts
  var TX = 150, TY = 96, CW = 118, CH = 52;
  function table(g, withMean) {
    var o = { cell: [], val: [] };
    COUP.forEach(function (c, k) {
      T(g, TX + 60 + k * CW + CW / 2, TY - 14, c, { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    });
    for (var j = 0; j < 3; j++) {
      txt(g, TX + 22, TY + j * CH + 33, xs(j), { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
      o.cell.push([]); o.val.push([]);
      for (var k = 0; k < 3; k++) {
        o.cell[j].push(el('rect', { x: TX + 60 + k * CW + 4, y: TY + j * CH + 4, width: CW - 8, height: CH - 8, rx: 6, fill: C.panel }, g));
        var v = el('text', { x: TX + 60 + k * CW + CW / 2, y: TY + j * CH + 33, 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' }, g);
        v.textContent = Q[j][k];
        o.val[j].push(v);
      }
    }
    return o;
  }

  // bar chart of the six arrival orders
  var BX = 120, BY = 430, BW = 34, BS = 74, SC = 0.5;
  function orderAxis(g) {
    ORDERS.forEach(function (ord, i) {
      var x = BX + i * BS + BW / 2 + 10;
      txt(g, x, BY + 24, ord.map(function (j) { return '<tspan>' + (j + 1) + '</tspan>'; }).join('<tspan fill="#5B6676">·</tspan>'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    });
    T(g, BX - 6, BY + 52, '到着順（利用者の番号）', { 'font-size': 15, fill: C.muted });
    el('line', { x1: BX - 10, x2: BX + 6 * BS, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g);
    [0, 300, 540].forEach(function (v) {
      el('text', { x: BX - 18, y: BY - v * SC + 5, 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }, g).textContent = v;
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: greedy, arrival order (x3, x2, x1) =====
    var g1 = S.g[0];
    T(g1, 70, 50, '期待報酬 ' + m('q') + '(' + m('x') + ', ' + m('a') + ')　各クーポンは 1 枚だけ', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.t1 = table(g1);
    // cells that are no longer available once a coupon has been handed out (x3 takes 50%, then x2 takes 70%)
    S.used1 = [[[0, 1], [1, 1]], [[0, 2]]].map(function (cells) {
      var gg = el('g', { opacity: 0 }, g1);
      cells.forEach(function (c) { el('rect', { x: TX + 60 + c[1] * CW + 4, y: TY + c[0] * CH + 4, width: CW - 8, height: CH - 8, rx: 6, fill: '#FFFFFF', opacity: 0.7 }, gg); });
      return gg;
    });
    // greedy picks for order (x3, x2, x1): x3 -> 50%, x2 -> 70%, x1 -> 30%
    S.pick1 = [[2, 1], [1, 2], [0, 0]].map(function (p, i) {
      var r = el('rect', { x: TX + 60 + p[1] * CW + 2, y: TY + p[0] * CH + 2, width: CW - 4, height: CH - 4, rx: 7, fill: 'none', stroke: C.a, 'stroke-width': 3.5 }, g1);
      var lab = T(g1, 90 + i * 170, 330, xs(p[0]) + ' → ' + COUP[p[1]], { 'font-size': 18, 'font-weight': 600, fill: C.a });
      var v = el('text', { x: 90 + i * 170, y: 360, 'font-size': 17, fill: C.ink }, g1); v.textContent = '+' + Q[p[0]][p[1]];
      return { r: r, lab: lab, v: v, k: p[1] };
    });
    T(g1, 70, 290, '到着順 ' + xs(2) + ', ' + xs(1) + ', ' + xs(0) + ' のとき、残りの中で期待報酬が最大のものを配る', { 'font-size': 16, fill: C.muted });
    S.sum1 = T(g1, 90, 420, '合計 300', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 120, 'どの利用者でも', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 144, '50% → 70% → 30% 引き', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 168, 'の順に期待報酬が大きい。', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 220, '先に来た ' + xs(2) + ' が 50% 引きを', { 'font-size': 16, fill: C.a });
    T(p1, PX, 244, '使ってしまい、' + xs(1) + ' には', { 'font-size': 16, fill: C.a });
    T(p1, PX, 268, '280 の 50% 引きが残らない。', { 'font-size': 16, fill: C.a });
    T(p1, PX, 330, '最適な割当てなら 540。', { 'font-size': 16, fill: C.ink });
    T(g1, 940, 520, '論文 Table 1 の例', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: greedy totals for the six arrival orders (Appendix A) =====
    var g2 = S.g[1];
    T(g2, 70, 50, '貪欲法の合計（到着順ごと）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    orderAxis(g2);
    S.bars2 = GREEDY.map(function (v, i) {
      var x = BX + i * BS + 10;
      var r = el('rect', { x: x, y: BY, width: BW, height: 0, rx: 3, fill: C.a }, g2);
      var tv = el('text', { x: x + BW / 2, y: BY - v * SC - 8, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' }, g2); tv.textContent = v;
      return { r: r, tv: tv, h: v * SC, t0: 9 + i * 0.45 };
    });
    S.avg2 = el('g', {}, g2);
    el('line', { x1: BX - 10, x2: BX + 6 * BS, y1: BY - 420 * SC, y2: BY - 420 * SC, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, S.avg2);
    T(S.avg2, BX + 6 * BS + 6, BY - 420 * SC + 5, '平均 420', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.opt2 = el('g', {}, g2);
    el('line', { x1: BX - 10, x2: BX + 6 * BS, y1: BY - 540 * SC, y2: BY - 540 * SC, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, S.opt2);
    T(S.opt2, BX + 6 * BS + 6, BY - 540 * SC + 5, '最適 540', { 'font-size': 15, fill: C.ink });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 120, '6 通りの到着順が', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 144, '等しい確率で起こるとき', { 'font-size': 16, fill: C.ink });
    txt(p2, PX, 200, '420', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    txt(p2, PX + 84, 200, '対', { 'font-size': 18, fill: C.ink });
    txt(p2, PX + 114, 200, '540', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    T(p2, PX, 236, '貪欲法の平均と最適', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 290, '在庫の制約がなければ', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 314, '最適な選び方が、ここでは', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 338, '最適でなくなる。', { 'font-size': 16, fill: C.ink });
    T(g2, 940, 520, '論文 付録 A の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: relative reward gap =====
    var g3 = S.g[2];
    T(g3, 70, 50, '期待報酬からそのクーポンの全員での平均を引く', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.t3 = table(g3);
    S.gap3 = [];
    for (var j = 0; j < 3; j++) {
      S.gap3.push([]);
      for (var k = 0; k < 3; k++) {
        var d = Q[j][k] - MEAN[k];
        var v = el('text', { x: TX + 60 + k * CW + CW / 2, y: TY + j * CH + 33, 'font-size': 19, fill: C.ink, 'text-anchor': 'middle', opacity: 0 }, g3);
        v.textContent = d > 0 ? '+' + d : d === 0 ? '0' : '−' + (-d);
        S.gap3[j].push(v);
      }
    }
    S.mean3 = el('g', {}, g3);
    el('line', { x1: TX, x2: TX + 60 + 3 * CW, y1: TY + 3 * CH + 6, y2: TY + 3 * CH + 6, stroke: C.ink, 'stroke-width': 1.5 }, S.mean3);
    T(S.mean3, TX + 22, TY + 3 * CH + 38, '平均', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    MEAN.forEach(function (v, k) {
      el('text', { x: TX + 60 + k * CW + CW / 2, y: TY + 3 * CH + 38, 'font-size': 19, fill: C.muted, 'text-anchor': 'middle' }, S.mean3).textContent = v;
    });
    var BEST = [2, 1, 0];
    S.best3 = BEST.map(function (k, j) {
      return el('rect', { x: TX + 60 + k * CW + 2, y: TY + j * CH + 2, width: CW - 4, height: CH - 4, rx: 7, fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g3);
    });
    S.res3 = el('g', {}, g3);
    T(S.res3, 90, 360, xs(0) + ' → 70% 引き　' + xs(1) + ' → 50% 引き　' + xs(2) + ' → 30% 引き', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    T(S.res3, 90, 392, '各行で差が最大のクーポン＝最適な割当て', { 'font-size': 16, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 116, m('q̂') + '(' + m('x') + ', ' + m('a') + ') − ' + '<tspan font-size="80%">平均</tspan>' + m('q̂') + '(·, ' + m('a') + ')', { 'font-size': 22, 'font-weight': 600, fill: C.b });
    T(p3, PX, 166, 'ほかの利用者と比べて', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 190, '期待報酬が特に高い人に、', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 214, 'そのクーポンを回す。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 270, '平均はログの文脈で計算し、', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 294, m('q̂') + ' は貪欲法と同じモデル。', { 'font-size': 15, fill: C.muted });
    T(g3, 940, 520, '論文 Table 2 の例', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: OPLS reaches 540 in every arrival order =====
    var g4 = S.g[3];
    T(g4, 70, 50, '到着順ごとの合計', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    orderAxis(g4);
    S.bars4 = GREEDY.map(function (v, i) {
      var x = BX + i * BS;
      el('rect', { x: x, y: BY - v * SC, width: BW - 6, height: v * SC, rx: 3, fill: H.mix(C.a, '#FFFFFF', 0.55) }, g4);
      var r = el('rect', { x: x + BW - 4, y: BY, width: BW - 6, height: 0, rx: 3, fill: C.b }, g4);
      return { r: r, h: 540 * SC, t0: 25 + i * 0.35 };
    });
    S.top4 = T(g4, BX + 3 * BS, BY - 540 * SC - 14, 'OPLS はすべて 540', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    var lg4 = el('g', {}, g4);
    el('rect', { x: 520, y: 470, width: 16, height: 16, rx: 3, fill: H.mix(C.a, '#FFFFFF', 0.55) }, lg4);
    T(lg4, 544, 484, '貪欲法', { 'font-size': 15, fill: C.ink });
    el('rect', { x: 520, y: 496, width: 16, height: 16, rx: 3, fill: C.b }, lg4);
    T(lg4, 544, 510, 'OPLS', { 'font-size': 15, fill: C.ink });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 104, '方策価値', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 150, '540', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 84, 150, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 114, 150, '420', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    T(p4, PX, 186, 'OPLS と貪欲法', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 240, '在庫が 1 個ずつで、', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 264, '好みの順序が全員同じなら、', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 288, '貪欲法と同等以上の方策が', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 312, '必ずある（定理 1）。', { 'font-size': 16, fill: C.ink });
    T(g4, 940, 520, '論文 Table 1・2 の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'WWW 2026';
    el('text', { x: 480, y: 210, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Off-Policy Learning with Limited Supply';
    T(g5, 480, 256, '供給に限りがあるときのオフ方策学習', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 316, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Koichi Tanaka · Ren Kishimoto · Bushun Kawagishi · Yusuke Narita';
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yasuo Yamamoto · Nobuyuki Shimizu · Yuta Saito';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3774904.3792181 · arxiv.org/abs/2603.18702';
    T(g5, 480, 464, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: three greedy picks in order; used columns fade
    S.pick1.forEach(function (o, i) {
      var k = seg(t, 1.8 + i * 1.4, 2.3 + i * 1.4);
      o.r.setAttribute('opacity', k); o.lab.setAttribute('opacity', k); o.v.setAttribute('opacity', k);
      if (i < 2) S.used1[i].setAttribute('opacity', seg(t, 2.6 + i * 1.4, 3.0 + i * 1.4));
    });
    S.sum1.setAttribute('opacity', seg(t, 6.2, 6.7));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2.0));
    // scene 2: bars grow in order, then the average and the optimum
    S.bars2.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6);
      o.r.setAttribute('height', o.h * k); o.r.setAttribute('y', 430 - o.h * k);
      o.tv.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.avg2.setAttribute('opacity', seg(t, 12.2, 12.8));
    S.opt2.setAttribute('opacity', seg(t, 12.8, 13.4));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: mean row, then q -> gap, then the best cell per row
    S.mean3.setAttribute('opacity', seg(t, 17.2, 17.8));
    var sw = seg(t, 18.6, 19.4);
    for (var j = 0; j < 3; j++) for (var k = 0; k < 3; k++) {
      S.t3.val[j][k].setAttribute('opacity', 1 - sw);
      S.gap3[j][k].setAttribute('opacity', sw);
      S.t3.cell[j][k].setAttribute('fill', H.mix('#EEF0F3', '#E7EEFC', sw));
    }
    S.best3.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 20 + i * 0.4, 20.4 + i * 0.4)); });
    S.res3.setAttribute('opacity', seg(t, 21.4, 22));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: OPLS bars grow next to the faded greedy bars
    S.bars4.forEach(function (o) {
      var k = seg(t, o.t0, o.t0 + 0.6);
      o.r.setAttribute('height', o.h * k); o.r.setAttribute('y', 430 - o.h * k);
    });
    S.top4.setAttribute('opacity', seg(t, 27.4, 28));
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 29 });
})();
