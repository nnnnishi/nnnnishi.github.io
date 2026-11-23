// =====================================================================
// teaser-scenes.js — Lazada Production Dataset (DESCN), unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.LAZADA_STATS (assets/lazada_stats.js), which the explainer computed
// from every row of full_trainset.csv (926,669) and full_testset.csv (181,669). Captions repeat a few as text.
// Scene 1: the two files and their treated / control split. Scene 2: naive comparison in the training file.
// Scene 3: the RCT test file on the same scale. Scene 4: propensity-score overlap (AUC). Scene 5: usage + title.
// Colours: orange = training file (biased assignment), blue = test file (RCT);
//          light tint = control group, full colour = treated group.
// =====================================================================
(function () {
  var ST = window.LAZADA_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var TR = ST.train, TE = ST.test;
  var AS = '#F3C9AE', BS = '#BFD0F6';

  function fmt(n) { return n.toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }

  var CAPTIONS = [
    { ja: 'Lazada のバウチャー配布データは、偏った割付の<span class="A">学習用</span>と RCT の<span class="B">テスト用</span>に分かれている。', en: '' },
    { ja: '<span class="A">学習用</span>で素朴に比べると、処置群の正例率は対照群の 6.0 倍に見える。', en: '' },
    { ja: 'RCT の<span class="B">テスト用</span>では差は +0.37 pt で、学習用の素朴な差の 12.6 分の 1 しかない。', en: '' },
    { ja: '<span class="A">学習用</span>では特徴量から処置を当てられる（AUC 0.905）が、<span class="B">テスト用</span>では当てられない（0.526）。', en: '' },
    { ja: '偏った学習用で学び、RCT のテスト用で順位づけを評価する。金額とコストの列はない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the two files, bar length proportional to rows =====
    var g1 = S.g[0], X1 = 70, W1 = 520, N = TR.rows;
    T(g1, X1, 70, '帯の長さ = 行数', { 'font-size': 16, fill: C.muted });
    function filebar(y, s, c0, c1, name) {
      var w = W1 * s.rows / N, wt = w * s.treatment_rate, o = {};
      T(g1, X1, y - 14, name, { 'font-size': 18, 'font-weight': 650, fill: c1 });
      o.t = el('rect', { x: X1, y: y, width: 0, height: 56, rx: 3, fill: c1 }, g1);
      o.c = el('rect', { x: X1 + wt, y: y, width: 0, height: 56, rx: 3, fill: c0 }, g1);
      o.wt = wt; o.wc = w - wt;
      return o;
    }
    S.f1 = filebar(130, TR, AS, C.a, '学習用（運用の施策で配布先を選んだ）');
    S.f2 = filebar(290, TE, BS, C.b, 'テスト用（RCT）');
    S.lab1 = el('g', {}, g1);
    T(S.lab1, X1 + 8, 166, '処置群 ' + p(TR.treatment_rate, 1) + '%', { 'font-size': 16, 'font-weight': 600, fill: '#fff' });
    T(S.lab1, X1 + S.f1.wt + 10, 166, '対照群 ' + p(1 - TR.treatment_rate, 1) + '%', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(S.lab1, X1, 374, '処置群 ' + p(TE.treatment_rate, 1) + '%', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    T(S.lab1, X1 + 120, 374, '対照群 ' + p(1 - TE.treatment_rate, 1) + '%', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(S.lab1, X1, 440, '処置 = バウチャーを配る。結果は 0/1 の label が 1 列。', { 'font-size': 16, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '学習用', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(TR.rows) + ' 行', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    T(p1, PX, 216, 'テスト用', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 252, fmt(TE.rows) + ' 行', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    T(p1, PX, 312, '特徴量 83 個（名前なし）', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 338, '論文の本番データの', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 364, '約 2 割の標本', { 'font-size': 16, fill: C.ink });

    // ===== scenes 2 and 3: rates by group, same scale =====
    function bars(g, title, s, c0, c1) {
      var Y0 = 420, HM = 300, top = 0.06, o = { bars: [] };
      T(g, 70, 62, title, { 'font-size': 17, 'font-weight': 600, fill: c1 });
      [0, 0.02, 0.04, 0.06].forEach(function (v) {
        var y = Y0 - HM * v / top;
        el('line', { x1: 140, x2: 560, y1: y, y2: y, stroke: C.hair }, g);
        T(g, 128, y + 5, Math.round(100 * v) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
      });
      [['対照群', s.control, c0], ['処置群', s.treated, c1]].forEach(function (r, i) {
        var v = r[1].rate, h = HM * v / top, x = 200 + i * 200;
        var b = { full: h, rect: el('rect', { x: x, y: Y0, width: 110, height: 0, fill: r[2] }, g) };
        b.lab = T(g, x + 55, Y0 - h - 14, p(v, 2) + '%', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
        T(g, x + 55, Y0 + 30, r[0] + '（' + fmt(r[1].n) + '）', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
        o.bars.push(b);
      });
      el('line', { x1: 140, x2: 560, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
      o.Y0 = Y0;
      return o;
    }
    var g2 = S.g[1];
    S.b2 = bars(g2, '学習用の正例率（label = 1 の割合）', TR, AS, C.a);
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, '処置群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 152, '+' + p(TR.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    T(p2, PX, 200, '比は ' + TR.ratio.toFixed(1) + ' 倍', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    T(p2, PX, 260, '配られやすい人は', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 286, 'もともと反応しやすい。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 312, 'この差は効果ではない。', { 'font-size': 16, fill: C.ink });

    var g3 = S.g[2];
    S.b3 = bars(g3, 'テスト用の正例率（同じ目盛り）', TE, BS, C.b);
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, '処置群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 152, '+' + p(TE.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p3, PX, 190, '標準誤差 ' + p(TE.se, 3) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 240, '学習用の素朴な差は', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 276, ST.naive_over_rct.toFixed(1) + ' 倍', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    T(p3, PX, 330, '正例はテスト用全体で', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 356, fmt(TE.positives) + ' 件', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: propensity-score histograms =====
    var g4 = S.g[3];
    S.h4 = [];
    function hist(x0, y0, s, c0, c1, title) {
      var h = s.ps_hist, nb = h.treated.length, W = 480, HM = 120, TOP = 0.8, bw = W / nb;
      var nt = h.treated.reduce(function (a, b) { return a + b; }, 0), nc = h.control.reduce(function (a, b) { return a + b; }, 0);
      T(g4, x0, y0 - HM - 18, title, { 'font-size': 17, 'font-weight': 600, fill: c1 });
      var o = { rects: [] };
      for (var i = 0; i < nb; i++) {
        var hc = HM * Math.min(h.control[i] / nc, TOP) / TOP, ht = HM * Math.min(h.treated[i] / nt, TOP) / TOP;
        o.rects.push({ r: el('rect', { x: x0 + i * bw + 1, y: y0, width: bw / 2 - 1, height: 0, fill: c0 }, g4), h: hc, y0: y0 });
        o.rects.push({ r: el('rect', { x: x0 + i * bw + bw / 2, y: y0, width: bw / 2 - 1, height: 0, fill: c1 }, g4), h: ht, y0: y0 });
      }
      el('line', { x1: x0, x2: x0 + W, y1: y0, y2: y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      [0, 0.5, 1].forEach(function (v) { T(g4, x0 + W * v, y0 + 22, String(v), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }); });
      S.h4.push(o);
    }
    hist(90, 220, TR, AS, C.a, '学習用：推定した傾向スコアの分布');
    hist(90, 430, TE, BS, C.b, 'テスト用：推定した傾向スコアの分布');
    T(g4, 90, 490, '薄い色 = 対照群、濃い色 = 処置群', { 'font-size': 15, fill: C.muted });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 112, '特徴量から処置を当てる', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 136, 'ロジスティック回帰の AUC', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 184, '学習用 ' + TR.propensity_auc.toFixed(3), { 'font-size': 28, 'font-weight': 650, fill: C.a });
    T(p4, PX, 232, 'テスト用 ' + TE.propensity_auc.toFixed(3), { 'font-size': 28, 'font-weight': 650, fill: C.b });
    T(p4, PX, 292, '標準化差が 0.1 を超える', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 318, '特徴量は学習用 ' + TR.smd_summary['n_abs_gt_0.1'] + ' 個、', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 344, 'テスト用 ' + TE.smd_summary['n_abs_gt_0.1'] + ' 個', { 'font-size': 16, fill: C.ink });

    // ===== scene 5: usage, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    function box(x, w, c, soft, a, b, cc) {
      el('rect', { x: x, y: 110, width: w, height: 160, rx: 12, fill: soft }, u);
      T(u, x + w / 2, 160, a, { 'font-size': 20, 'font-weight': 650, fill: c, 'text-anchor': 'middle' });
      T(u, x + w / 2, 206, b, { 'font-size': 24, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + w / 2, 244, cc, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    }
    box(90, 340, C.a, '#FCEBDF', '学習用で学ぶ', '偏った割付', fmt(TR.rows) + ' 行');
    box(530, 340, C.b, C.bsoft, 'テスト用で評価', 'RCT', fmt(TE.rows) + ' 行（AUUC、Qini など）');
    el('path', { d: 'M440 190 L 518 190', stroke: C.ink, 'stroke-width': 2, fill: 'none' }, u);
    el('path', { d: 'M510 183 L 520 190 L 510 197', stroke: C.ink, 'stroke-width': 2, fill: 'none' }, u);
    T(u, 480, 330, '偏ったデータから学んだ順位づけが、RCT でも正しいかを測る', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 372, '文献リストでは深層アップリフトのベンチマーク（arXiv 2024）が使う', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 420, '金額とコストの列はなく、予算制約の実験にはコストの仮定が要る', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · LAZADA / DESCN';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Lazada Production Dataset (DESCN)';
    T(tc, 480, 290, 'DESCN の著者が公開した Lazada のバウチャー配布データ', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Zhong et al., KDD 2022 · arXiv 2207.09920';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'github.com/kailiang-zhong/DESCN';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow (train, then test), then labels
    [[S.f1, 0.6], [S.f2, 1.8]].forEach(function (q) {
      var k = seg(t, q[1], q[1] + 1.2);
      q[0].t.setAttribute('width', q[0].wt * k);
      q[0].c.setAttribute('x', +q[0].t.getAttribute('x') + q[0].wt * k);
      q[0].c.setAttribute('width', q[0].wc * k);
    });
    S.lab1.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scenes 2-3: bars grow
    [[S.b2, 9], [S.b3, 17]].forEach(function (q) {
      q[0].bars.forEach(function (b, i) {
        var k = seg(t, q[1] + i * 0.7, q[1] + 0.8 + i * 0.7), h = b.full * k;
        b.rect.setAttribute('height', h); b.rect.setAttribute('y', q[0].Y0 - h);
        b.lab.setAttribute('opacity', seg(t, q[1] + 0.6 + i * 0.7, q[1] + 1 + i * 0.7));
      });
    });
    S.p2.setAttribute('opacity', seg(t, 11, 11.8));
    S.p3.setAttribute('opacity', seg(t, 19, 19.8));
    // scene 4: histograms grow (train, then test)
    S.h4.forEach(function (o, j) {
      var k = seg(t, 25 + j * 1.4, 26.2 + j * 1.4);
      o.rects.forEach(function (q) { q.r.setAttribute('height', q.h * k); q.r.setAttribute('y', q.y0 - q.h * k); });
    });
    S.p4.setAttribute('opacity', seg(t, 27.4, 28.2));
    // scene 5: usage, then the title card
    S.use5.setAttribute('opacity', 1 - seg(t, 36.2, 36.8));
    S.title5.setAttribute('opacity', seg(t, 36.6, 37.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 20 });
})();
