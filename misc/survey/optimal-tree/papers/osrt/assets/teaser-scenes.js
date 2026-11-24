// =====================================================================
// teaser-scenes.js — Zhang, Xin, Seltzer, Rudin, Optimal Sparse Regression Trees (AAAI 2023;
// arXiv 2211.14980 v3), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the timeout
// percentages of the appendix tables (insurance, seoul-bike).
// Colours: orange = other methods / equivalent-points bound; blue = OSRT / k-means bound.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '回帰木の多くは<span class="A">貪欲に育てて刈り込む</span>ので、二乗誤差と葉の数の釣り合いが最適かどうか分からない。', en: '' },
    { ja: '二乗誤差には自然な下界がなく、特徴量の同じ点のばらつきから作る下界は弱い。', en: '' },
    { ja: '<span class="B">OSRT</span> は目的変数を 1 次元で k-means クラスタリングした最適値を、葉の数ごとの損失の下界に使う。', en: '' },
    { ja: '時間の上限 5 分の実験で、OSRT は Evtree より時間切れが少なかった。', en: '' },
    { ja: '深さの制約がなくても、二乗誤差と葉の数の和を最小にする回帰木の最適性を証明できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: objective and greedy trees =====
    var g1 = S.g[0];
    S.eq1 = el('g', {}, g1);
    el('rect', { x: 80, y: 110, width: 520, height: 80, rx: 12, fill: C.panel }, S.eq1);
    txt(S.eq1, 340, 160, '目的 = 平均二乗誤差 + λ × 葉の数', { 'font-size': 22, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    // a greedy tree (wide) drawn as a triangle with many leaves
    S.tree1 = el('g', {}, g1);
    el('path', { d: 'M340,230 L150,420 L530,420 Z', fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, S.tree1);
    for (var i = 0; i < 12; i++) el('circle', { cx: 165 + i * 32, cy: 420, r: 8, fill: C.a }, S.tree1);
    txt(S.tree1, 340, 340, '貪欲に育てた木', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    txt(S.tree1, 340, 456, '葉が必要以上に多くなりがち', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 150, '最適性の保証', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    txt(S.p1, PX, 196, 'CART、GUIDE：貪欲法', { 'font-size': 16, fill: C.ink });
    txt(S.p1, PX, 224, 'IAI、Evtree：最適を', { 'font-size': 16, fill: C.ink });
    txt(S.p1, PX, 250, '目指すが証明しない', { 'font-size': 16, fill: C.ink });
    txt(S.p1, PX, 306, 'MIO の定式化は', { 'font-size': 15, fill: C.muted });
    txt(S.p1, PX, 330, '公開コードがない', { 'font-size': 15, fill: C.muted });
    txt(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: equivalent points bound is weak =====
    var g2 = S.g[1];
    var NX = 80, NW = 520, NY = 260;
    el('line', { x1: NX, y1: NY, x2: NX + NW, y2: NY, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    txt(g2, NX + NW / 2, NY + 40, '目的変数 y の値', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var Y = [0.05, 0.12, 0.18, 0.36, 0.42, 0.47, 0.55, 0.78, 0.84, 0.93];
    S.pts2 = Y.map(function (v, k) {
      var x = NX + v * NW;
      return el('circle', { cx: x, cy: NY, r: 8, fill: k === 3 || k === 6 ? C.a : C.ink }, g2);
    });
    S.eqv2 = el('g', {}, g2);
    el('path', { d: 'M' + (NX + 0.36 * NW) + ',' + (NY - 16) + ' Q ' + (NX + 0.455 * NW) + ',' + (NY - 70) + ' ' + (NX + 0.55 * NW) + ',' + (NY - 16), fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.eqv2);
    txt(S.eqv2, NX + 0.455 * NW, NY - 78, '特徴量が同じ 2 点', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    txt(S.eqv2, NX, 360, '同値点の下界：この 2 点のばらつきだけ', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    txt(S.eqv2, NX, 390, '→ ほかの点の誤差は 0 と見なすので、下界がゆるい', { 'font-size': 15, fill: C.muted });
    S.p2 = el('g', {}, g2);
    txt(S.p2, PX, 150, '分類との違い', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(S.p2, PX, 196, '0-1 損失には離散的な', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 222, '下界があるが、実数値の', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 248, '二乗誤差にはない。', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 302, 'ゆるい下界では', { 'font-size': 15, fill: C.muted });
    txt(S.p2, PX, 326, '探索を絞れない', { 'font-size': 15, fill: C.muted });
    txt(g2, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: k-means lower bound =====
    var g3 = S.g[2];
    el('line', { x1: NX, y1: NY, x2: NX + NW, y2: NY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, NX + NW / 2, NY + 58, '目的変数 y の値', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var CL = [[0, 2], [3, 6], [7, 9]];
    S.box3 = CL.map(function (c, k) {
      var x0 = NX + Y[c[0]] * NW - 18, x1 = NX + Y[c[1]] * NW + 18;
      var g = el('g', {}, g3);
      el('rect', { x: x0, y: NY - 30, width: x1 - x0, height: 60, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.8 }, g);
      var m = 0; for (var j = c[0]; j <= c[1]; j++) m += Y[j]; m /= (c[1] - c[0] + 1);
      el('line', { x1: NX + m * NW, x2: NX + m * NW, y1: NY - 44, y2: NY - 30, stroke: C.b, 'stroke-width': 2.5 }, g);
      return { g: g, t0: 18.0 + k * 0.6 };
    });
    Y.forEach(function (v) { el('circle', { cx: NX + v * NW, cy: NY, r: 8, fill: C.ink }, g3); });
    S.lab3 = el('g', {}, g3);
    txt(S.lab3, NX, 120, 'C = 3 のとき：近い値どうしを 3 つにまとめる', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    txt(S.lab3, NX, 360, '葉 3 枚のどの木の損失も k-Means(3, y) 以上', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    txt(S.lab3, NX, 390, '1 次元の k-means は動的計画法で O(kN) で解ける', { 'font-size': 15, fill: C.muted });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, 'k-means の下界', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '① 葉に入るデータを', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 180, '自由に分け直すと仮定', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 222, '② 損失の最小は', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 246, '1 次元の k-means', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 288, '③ C を増やす利得が', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    txt(S.p3, PX + 22, 312, 'λ を下回ったら止める', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 366, '同値点は同じクラスタに', { 'font-size': 15, fill: C.muted });
    txt(S.p3, PX, 390, '入れるとさらに強くなる', { 'font-size': 15, fill: C.muted });
    txt(g3, 940, 520, '模式図（値は架空）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: timeout rates (appendix tables) =====
    var g4 = S.g[3];
    var X0 = 260, PER = 3.2;   // px per percent
    [0, 25, 50, 75, 100].forEach(function (v) {
      el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: 110, y2: 380, stroke: v ? C.hair : C.ink, 'stroke-width': v ? 1 : 1.5 }, g4);
      el('text', { x: X0 + v * PER, y: 404, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    txt(g4, 70, 84, '時間切れ（5 分）になった実行の割合、深さ 4〜9', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['insurance', 'Evtree', 27.5, C.a, 130], ['', 'OSRT', 0, C.b, 172], ['seoul-bike', 'Evtree', 55, C.a, 250], ['', 'OSRT', 26.25, C.b, 292]];
    S.r4 = rows.map(function (r, i) {
      var g = el('g', {}, g4);
      if (r[0]) txt(g, X0 - 110, r[4] + 22, r[0], { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      txt(g, X0 - 14, r[4] + 22, r[1], { 'font-size': 15, fill: r[3], 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: r[4] + 4, width: 0, height: 28, fill: r[3] }, g);
      var tx = el('text', { x: X0 + r[2] * PER + 10, y: r[4] + 24, 'font-size': 16, 'font-weight': 650, fill: r[3] }, g);
      tx.textContent = r[2] + '%';
      return { g: g, rect: rect, tx: tx, w: r[2] * PER, t0: 24.6 + i * 0.6 };
    });
    S.p4 = el('g', {}, g4);
    txt(S.p4, PX, 150, '大規模データ', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    txt(S.p4, PX, 184, 'household', { 'font-size': 15, fill: C.ink });
    txt(S.p4, PX, 208, '（2,049,280 件、深さ 5）', { 'font-size': 15, fill: C.ink });
    txt(S.p4, PX, 232, 'も 30 分以内に解いた', { 'font-size': 15, fill: C.ink });
    txt(S.p4, PX, 280, 'Evtree は 5 万件を超えると', { 'font-size': 15, fill: C.muted });
    txt(S.p4, PX, 304, '30 分で終わらなかった', { 'font-size': 15, fill: C.muted });
    txt(g4, 940, 520, '論文の付録の表の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 300, 74, '新しい下界', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 300, 98, '1 次元の k-means', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    txt(g5, 660, 74, '深さの制約', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    txt(g5, 660, 98, 'なしでも最適性を証明', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2023';
    el('text', { x: 480, y: 236, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Sparse Regression Trees';
    txt(g5, 480, 290, '最適な疎な回帰木', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Rui Zhang, Rui Xin, Margo Seltzer, Cynthia Rudin';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v37i9.26334';
    txt(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.eq1.setAttribute('opacity', seg(t, 0.8, 1.4));
    S.tree1.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.p1.setAttribute('opacity', seg(t, 3.2, 4.0));
    S.pts2.forEach(function (p, k) { p.setAttribute('opacity', seg(t, 9.0 + k * 0.1, 9.4 + k * 0.1)); });
    S.eqv2.setAttribute('opacity', seg(t, 10.8, 11.4));
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.box3.forEach(function (b) { b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.4)); });
    S.lab3.setAttribute('opacity', seg(t, 17.0, 17.6));
    S.p3.setAttribute('opacity', seg(t, 17.2, 18.0));
    S.r4.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.rect.setAttribute('width', r.w * H.ease(seg(t, r.t0, r.t0 + 0.8)));
      r.tx.setAttribute('opacity', seg(t, r.t0 + 0.7, r.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
