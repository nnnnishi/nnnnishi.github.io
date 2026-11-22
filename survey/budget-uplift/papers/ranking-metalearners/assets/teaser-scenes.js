// =====================================================================
// teaser-scenes.js — Metalearners for Ranking Treatment Effects (arXiv 2405.02183), unofficial explainer.
// Player: teaser-engine.js (unchanged). render() is a pure function of t.
// Numbers: scenes 1–3 use the toy example of the paper's Table 2; scene 4 counts the best objective
// per cell of the paper's Table 4. Orange = effect estimation (pointwise), blue = effect ranking.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, mix = H.mix;
  var LB = '#93B0F0';   // light blue = pairwise

  var CAPTIONS = [
    { ja: '従来は、<span class="A">処置効果の値をできるだけ正確に推定</span>してから、大きい順に並べる', en: '' },
    { ja: '推定の誤差が小さくても、順位が入れ替われば先に処置する人を取り違える', en: '' },
    { ja: 'AUQC は順位 i の効果に n−i+1 の重みをかけた和なので、<span class="B">NDCG として直接最適化できる</span>', en: '' },
    { ja: '30通りの比較で最も高い AUQC を示した回数は、<span class="B">リストワイズが16</span>、ほかは7ずつだった', en: '' },
    { ja: '並び順を直接学ぶと、限られた人数で誰を先に処置するかの質を上げられる場合がある', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  // paper Table 2
  var TRUE = [0.20, 0.17, 0.16, 0.15, 0.11, 0.10];
  var M1 = [0.22, 0.15, 0.16, 0.17, 0.10, 0.11];
  var ORDER1 = [0, 3, 2, 1, 5, 4];          // customers sorted by model-1 estimate
  // paper Table 4: best objective per cell (rows Z S T X DR R; cols Synthetic, Criteo, Hill-W, Hill-M, Promotion)
  var WIN = ['LLLLL', 'RLRPR', 'LPRLR', 'LLLRP', 'LPRPP', 'LLLLP'];
  var ROWS = ['Z', 'S', 'T', 'X', 'DR', 'R'];

  function txt(p, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), p); e.innerHTML = s; return e; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ---------- scene 1: estimates (orange) vs true effect (outline), then sort ----------
    var g = S.g[0], base = 440, sc = 1350;
    el('line', { x1: 70, y1: base, x2: 600, y2: base, stroke: C.ink, 'stroke-width': 1.5 }, g);
    S.bars = TRUE.map(function (tv, i) {
      var b = el('g', {}, g);
      el('rect', { x: -26, y: -tv * sc, width: 52, height: tv * sc, fill: 'none', stroke: C.muted, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, b);
      el('rect', { x: -18, y: -M1[i] * sc, width: 36, height: M1[i] * sc, fill: C.a, opacity: 0.9 }, b);
      txt(b, 0, -Math.max(M1[i], tv) * sc - 10, M1[i].toFixed(2), { 'font-size': 16, 'text-anchor': 'middle', fill: C.a, 'font-weight': 600 });
      txt(b, 0, 26, '顧客' + (i + 1), { 'font-size': 16, 'text-anchor': 'middle', fill: C.ink });
      return b;
    });
    txt(g, 70, 90, '破線＝真の効果　橙＝モデル1の推定値', { 'font-size': 16, fill: C.muted });
    txt(g, 70, 515, '論文 Table 2 の例', { 'font-size': 14, fill: C.muted });
    S.s1a = txt(g, 690, 220, '① 各人の効果を推定する', { 'font-size': 20, fill: C.a, 'font-weight': 600 });
    S.s1a2 = txt(g, 690, 250, '（MSE を小さくする）', { 'font-size': 17, fill: C.muted });
    S.s1b = txt(g, 690, 320, '② 推定値の大きい順に', { 'font-size': 20, fill: C.ink, 'font-weight': 600 });
    S.s1b2 = txt(g, 690, 350, '　並べて上から処置する', { 'font-size': 20, fill: C.ink, 'font-weight': 600 });

    // ---------- scene 2: rank chips ----------
    g = S.g[1];
    var rowsY = [160, 275, 390];
    var labels = ['真の順位', 'モデル1の順位', 'モデル2の順位'];
    var cols = [C.ink, C.a, C.b];
    var seqs = [[1, 2, 3, 4, 5, 6], ORDER1.map(function (c) { return c + 1; }), [1, 2, 3, 4, 5, 6]];
    S.rows2 = rowsY.map(function (y, r) {
      var gg = el('g', {}, g);
      txt(gg, 70, y - 38, labels[r], { 'font-size': 17, fill: cols[r], 'font-weight': 600 });
      seqs[r].forEach(function (c, k) {
        var bad = r === 1 && c !== k + 1;
        var x = 70 + k * 84;
        el('rect', { x: x, y: y - 24, width: 70, height: 48, rx: 10, fill: bad ? '#FCEBDF' : (r === 0 ? C.panel : '#fff'), stroke: bad ? C.a : (r === 2 ? C.b : C.hair), 'stroke-width': bad ? 2.5 : 1.5 }, gg);
        txt(gg, x + 35, y + 7, '顧客' + c, { 'font-size': 16, 'text-anchor': 'middle', fill: bad ? C.a : C.ink, 'font-weight': bad ? 700 : 400 });
      });
      return gg;
    });
    txt(g, 70, 470, '順位は論文 Table 2 の推定値を大きい順に並べたもの', { 'font-size': 14, fill: C.muted });
    S.s2a = el('g', {}, g);
    txt(S.s2a, 690, 160, 'モデル1', { 'font-size': 20, fill: C.a, 'font-weight': 700 });
    txt(S.s2a, 690, 190, '誤差は小さいが', { 'font-size': 18, fill: C.ink });
    txt(S.s2a, 690, 217, '4人の順位が入れ替わる', { 'font-size': 18, fill: C.ink });
    S.s2b = el('g', {}, g);
    txt(S.s2b, 690, 280, 'モデル2', { 'font-size': 20, fill: C.b, 'font-weight': 700 });
    txt(S.s2b, 690, 310, '誤差は大きいが', { 'font-size': 18, fill: C.ink });
    txt(S.s2b, 690, 337, '順位は真の順位と同じ', { 'font-size': 18, fill: C.ink });
    S.s2c = el('g', {}, g);
    txt(S.s2c, 690, 400, '上位2人の効果の合計', { 'font-size': 16, fill: C.muted });
    txt(S.s2c, 690, 432, '<tspan fill="' + C.a + '">0.35</tspan>　対　<tspan fill="' + C.b + '">0.37</tspan>', { 'font-size': 22, fill: C.ink, 'font-weight': 700 });

    // ---------- scene 3: Qini staircase = sum of columns ----------
    g = S.g[2];
    var b3 = 470, s3 = 340, w3 = 62;
    el('line', { x1: 70, y1: b3, x2: 560, y2: b3, stroke: C.ink, 'stroke-width': 1.5 }, g);
    S.cols3 = [];
    S.blocks = [];   // blocks[i] = list of rects for effect at rank i
    for (var i = 0; i < 6; i++) S.blocks.push([]);
    for (var k = 0; k < 6; k++) {
      var cg = el('g', {}, g), y = b3, x = 100 + k * 76;
      for (var j = 0; j <= k; j++) {
        var h = TRUE[j] * s3;
        var r = el('rect', { x: x, y: y - h, width: w3, height: h - 1.5, fill: mix(C.b, '#FFFFFF', 0.25 + 0.11 * j) }, cg);
        S.blocks[j].push(r);
        y -= h;
      }
      txt(cg, x + w3 / 2, b3 + 24, 'k=' + (k + 1), { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
      S.cols3.push(cg);
    }
    txt(g, 70, 120, '上位 k 人を処置したときの累積効果（Qini 曲線の各点）', { 'font-size': 16, fill: C.muted });
    txt(g, 70, 525, '模式図（効果の値は論文 Table 2 の真の効果）', { 'font-size': 14, fill: C.muted });
    S.s3a = el('g', {}, g);
    txt(S.s3a, 690, 190, 'AUQC ＝ 柱の高さの合計', { 'font-size': 19, fill: C.ink, 'font-weight': 600 });
    S.s3b = el('g', {}, g);
    txt(S.s3b, 690, 250, '順位 i の効果は', { 'font-size': 18, fill: C.ink });
    txt(S.s3b, 690, 278, 'n−i+1 本の柱に現れる', { 'font-size': 18, fill: C.ink });
    S.s3c = el('g', {}, g);
    txt(S.s3c, 690, 345, '<tspan ' + MI + '>Σ τ</tspan><tspan font-size="13" dy="5">π<tspan font-size="10" dy="3">i</tspan></tspan><tspan dy="-8"> ×（n−i+1）</tspan>', { 'font-size': 22, fill: C.b, 'font-weight': 600 });
    txt(S.s3c, 690, 385, '＝ 割引 n−i+1 の NDCG', { 'font-size': 19, fill: C.b, 'font-weight': 600 });
    txt(S.s3c, 690, 425, '→ LambdaMART 型の', { 'font-size': 17, fill: C.ink });
    txt(S.s3c, 690, 451, '　目的関数で直接最適化', { 'font-size': 17, fill: C.ink });

    // ---------- scene 4: counts + winner grid ----------
    g = S.g[3];
    var cats = [['ポイントワイズ', 7, C.a], ['ペアワイズ', 7, LB], ['リストワイズ', 16, C.b]];
    S.bars4 = cats.map(function (c, i) {
      var y = 190 + i * 100;
      txt(g, 70, y - 14, c[0], { 'font-size': 18, fill: C.ink, 'font-weight': 600 });
      var r = el('rect', { x: 70, y: y, width: 0, height: 40, rx: 4, fill: c[2] }, g);
      var n = txt(g, 80, y + 28, '', { 'font-size': 22, fill: C.ink, 'font-weight': 700 });
      return { r: r, n: n, v: c[1] };
    });
    txt(g, 70, 470, '30通り＝メタ学習器6種類 × データ5つ', { 'font-size': 16, fill: C.muted });
    txt(g, 70, 500, '論文 Table 4 の値から、各セルで最も高い AUQC の目的関数を数えた', { 'font-size': 14, fill: C.muted });
    var gx = 740, gy = 150, cs = 36;
    ['Syn', 'Cri', 'H♀', 'H♂', 'Pro'].forEach(function (d, c) {
      txt(g, gx + c * cs + 15, gy - 12, d, { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted });
    });
    S.cells = [];
    WIN.forEach(function (row, r) {
      txt(g, gx - 12, gy + r * cs + 22, ROWS[r], { 'font-size': 15, 'text-anchor': 'end', fill: C.ink, 'font-weight': 600 });
      row.split('').forEach(function (w, c) {
        S.cells.push(el('rect', { x: gx + c * cs, y: gy + r * cs, width: 30, height: 30, rx: 5, fill: w === 'P' ? C.a : w === 'R' ? LB : C.b }, g));
      });
    });
    txt(g, 690, 395, '最良の目的関数は', { 'font-size': 16, fill: C.ink });
    txt(g, 690, 420, 'メタ学習器ごとに違う', { 'font-size': 16, fill: C.ink });

    // ---------- scene 5: title card ----------
    g = S.g[4];
    txt(g, 480, 175, 'ARXIV 2024', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    txt(g, 480, 240, 'Metalearners for Ranking', { 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 480, 288, 'Treatment Effects', { 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 480, 340, 'Toon Vanderschueren, Wouter Verbeke, Felipe Moraes, Hugo Manuel Proença', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 480, 395, 'arxiv.org/abs/2405.02183', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 480, 430, '（解説者による非公式の要約）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: sort by estimate between 4.0 and 6.0 s
    var u = seg(t, 4.0, 6.0);
    S.bars.forEach(function (b, i) {
      var x0 = 120 + i * 88, x1 = 120 + ORDER1.indexOf(i) * 88;
      b.setAttribute('transform', 'translate(' + (x0 + (x1 - x0) * u) + ',440)');
    });
    S.s1a.setAttribute('opacity', seg(t, 1.0, 1.8)); S.s1a2.setAttribute('opacity', seg(t, 1.0, 1.8));
    S.s1b.setAttribute('opacity', seg(t, 3.6, 4.4)); S.s1b2.setAttribute('opacity', seg(t, 3.6, 4.4));
    // scene 2
    S.rows2.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 8.4 + i * 1.6, 9.2 + i * 1.6)); });
    S.s2a.setAttribute('opacity', seg(t, 10.0, 10.8));
    S.s2b.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.s2c.setAttribute('opacity', seg(t, 13.2, 14.0));
    // scene 3: columns grow, then highlight rank-1 and rank-2 effects
    S.cols3.forEach(function (c, k) { c.setAttribute('opacity', seg(t, 16.4 + k * 0.35, 16.8 + k * 0.35)); });
    var hi1 = seg(t, 19.4, 19.9) * (1 - seg(t, 20.9, 21.3));
    var hi2 = seg(t, 21.3, 21.8) * (1 - seg(t, 22.8, 23.2));
    S.blocks.forEach(function (list, j) {
      var h = j === 0 ? hi1 : j === 1 ? hi2 : 0;
      var dim = Math.max(hi1, hi2) * (1 - h);
      list.forEach(function (r) {
        r.setAttribute('stroke', h > 0.01 ? C.ink : 'none');
        r.setAttribute('stroke-width', 2.5 * h);
        r.setAttribute('opacity', 1 - 0.6 * dim);
      });
    });
    S.s3a.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.s3b.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.s3c.setAttribute('opacity', seg(t, 21.6, 22.2));
    // scene 4
    S.bars4.forEach(function (b, i) {
      var v = seg(t, 24.6 + i * 0.8, 25.8 + i * 0.8);
      var w = 25 * b.v * v;
      b.r.setAttribute('width', w);
      b.n.setAttribute('x', 70 + w + 12);
      b.n.textContent = v > 0.02 ? String(Math.round(b.v * v)) : '';
    });
    S.cells.forEach(function (c, k) { c.setAttribute('opacity', seg(t, 27.0 + k * 0.08, 27.4 + k * 0.08)); });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
