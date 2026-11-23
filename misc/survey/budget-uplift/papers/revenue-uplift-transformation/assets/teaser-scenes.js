// =====================================================================
// teaser-scenes.js — Gubela, Lessmann & Jaroszewicz (EJOR 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); the 3:1 split and the 10%
// discount are those of the paper's data. Scene 4 uses Table 10 and Table 11 (BAT data) of arXiv v1.
// Colours: orange = conversion uplift / costs / benchmark models; blue = revenue uplift, transformed target, RDT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '購入の増分を見るモデルは、クーポンで購入に転じた顧客を<span class="A">1 件</span>として数える。', en: '' },
    { ja: 'しかし購入額は顧客ごとに違い、<span class="B">売上の増分</span>で比べると二人の価値は大きく異なる。', en: '' },
    { ja: '購入額を処置群なら正、対照群なら負に置き換えれば、普通の学習器で<span class="B">売上の増分</span>を学べる。', en: '' },
    { ja: '学習に使っていない書籍・玩具店のデータで、<span class="B">RDT</span> の売上 Qini 係数は<span class="A">因果機械学習の手法</span>を大きく上回った。', en: '' },
    { ja: '目的変数を変換すれば、手持ちの分類器や回帰で売上の増分を狙える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scenes 1-2: two customers, both persuaded by the coupon; basket 20 vs 150 EUR =====
    function cards(g, withBasket) {
      return [['A', 20, 80], ['B', 150, 340]].map(function (c) {
        var x = c[2], o = {};
        el('rect', { x: x, y: 70, width: 230, height: 400, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
        txt(g, x + 20, 112, '顧客 ' + c[0], { 'font-size': 22, 'font-weight': 650, fill: C.ink });
        t2(g, x + 20, 158, 'クーポンなし：買わない', '', { 'font-size': 16, fill: C.muted });
        t2(g, x + 20, 190, 'クーポンあり：買う', '', { 'font-size': 16, fill: C.ink });
        o.badge = el('g', {}, g);
        el('rect', { x: x + 20, y: 214, width: 190, height: 44, rx: 8, fill: '#FCEBDF' }, o.badge);
        t2(o.badge, x + 115, 243, '購入の増分 +1 件', '', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
        if (withBasket) {
          o.bk = el('g', {}, g);
          t2(o.bk, x + 20, 300, '購入額 ' + c[1] + ' ユーロ', '', { 'font-size': 17, fill: C.ink });
          o.bar = el('rect', { x: x + 20, y: 314, width: 0, height: 22, rx: 3, fill: C.b }, o.bk);
          o.full = c[1] * 1.25;
          t2(o.bk, x + 20, 380, '売上の増分', '', { 'font-size': 16, fill: C.muted });
          txt(o.bk, x + 20, 418, '+' + c[1] + ' ユーロ', { 'font-size': 26, 'font-weight': 650, fill: C.b });
          t2(o.bk, x + 20, 450, '10% 引きの費用 ' + (c[1] / 10) + ' ユーロ', '', { 'font-size': 15, fill: C.a });
        }
        return o;
      });
    }
    var g1 = S.g[0];
    S.c1 = cards(g1, false);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '目的変数：買ったかどうか', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 156, '（0 か 1）', '', { 'font-size': 15, fill: C.muted });
    txt(p1, PX, 230, '+1 ＝ +1', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 280, 'A と B の価値は同じに', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 306, '見える', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '模式図（顧客は架空の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    var g2 = S.g[1];
    S.c2 = cards(g2, true);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '目的変数：購入額', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 156, '（連続値、0 が多い）', '', { 'font-size': 15, fill: C.muted });
    txt(p2, PX, 230, '20 ≪ 150', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 280, '割引の費用も購入額に', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 306, '比例して大きくなる', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（購入額は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: transformation table =====
    var g3 = S.g[2];
    var rowsT = [
      ['処置群・購入', '60', '+60 / 0.75 = +80', '1', true],
      ['対照群・購入', '60', '−60 / 0.25 = −240', '0', false],
      ['処置群・購入なし', '0', '0', '0', false],
      ['対照群・購入なし', '0', '0', '0', false]
    ];
    el('rect', { x: 50, y: 70, width: 600, height: 50, rx: 8, fill: C.panel }, g3);
    t2(g3, 66, 102, '顧客', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(g3, 270, 102, '購入額 ' + m('Y'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.h3a = t2(g3, 440, 102, '変換後 ' + m('z'), '', { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.h3b = t2(g3, 600, 102, 'RDT', '', { 'font-size': 17, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.r3 = rowsT.map(function (r, i) {
      var y = 170 + i * 70, o = {};
      t2(g3, 66, y, r[0], '', { 'font-size': 18, fill: C.ink });
      txt(g3, 270, y, r[1], { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
      o.z = txt(g3, 440, y, r[2], { 'font-size': 18, 'font-weight': r[4] ? 650 : 400, fill: r[4] ? C.b : C.ink, 'text-anchor': 'middle' });
      o.d = txt(g3, 600, y, r[3], { 'font-size': 20, 'font-weight': r[4] ? 650 : 400, fill: r[4] ? C.b : C.ink, 'text-anchor': 'middle' });
      el('line', { x1: 50, x2: 650, y1: y + 26, y2: y + 26, stroke: C.hair }, g3);
      o.k = i;
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX + 10, 140, 'CRVTW：' + m('z') + ' を回帰', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 10, 168, 'E[' + m('z') + ' | ' + m('X') + '] ＝ 売上の増分', '', { 'font-size': 16, fill: C.b });
    t2(p3, PX + 10, 230, 'RDT：' + m('z') + ' &gt; 0 かを分類', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 10, 258, '1 になるのは処置群の', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX + 10, 282, '購入者だけ', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX + 10, 340, '処置群：対照群 ＝ 3：1', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX + 10, 364, '（論文のデータと同じ比）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（購入額 60 ユーロは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 10, BAT data, revenue Qini coefficient; Table 11 top decile profit =====
    var g4 = S.g[3];
    var bars = [['RDT（ERT）', 1.20], ['X-learner', 0.28], ['Causal forest', 0.25], ['Causal BART', 0.24], ['Causal boosting', 0.18], ['Causal tree', 0.15]];
    var X0 = 250, X1 = 590, HI = 1.3, Y0 = 96, DY = 58;
    function bx(v) { return X0 + v / HI * (X1 - X0); }
    t2(g4, 70, 58, '売上 Qini 係数（BAT データ）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.b4 = bars.map(function (r, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 14, y: y + 22, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = r[0];
      o.r = el('rect', { x: X0, y: y + 4, width: 0, height: 28, rx: 4, fill: i === 0 ? C.b : C.a }, g4);
      o.w = bx(r[1]) - X0;
      o.t = el('text', { x: bx(r[1]) + 8, y: y + 25, 'font-size': 17, 'font-weight': 650, fill: i === 0 ? C.b : C.ink }, g4);
      o.t.textContent = r[1].toFixed(2);
      o.t0 = 25 + i * 0.5;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '上位 10% に配ったときの', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 134, '増分キャンペーン利益', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 184, '5,668', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 104, 184, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 132, 184, '3,100', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 214, 'ユーロ（RDT 対 X-learner）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 270, 'FA・FB の上位 1〜2 割では', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 294, '比較手法が上回る場面もある', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 344, '比較手法はハイパーパラメータ', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 366, 'を調整していない', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 10・Table 11（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH · 2020';
    el('text', { x: 480, y: 200, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Response transformation and profit';
    el('text', { x: 480, y: 242, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'decomposition for revenue uplift modeling';
    t2(g5, 480, 290, '売上アップリフトモデリングのための目的変数の変換とキャンペーン利益の分解', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 342, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Robin M. Gubela · Stefan Lessmann · Szymon Jaroszewicz';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1016/j.ejor.2019.11.030';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: badges pop in, then the panel
    S.c1.forEach(function (o, i) { o.badge.setAttribute('opacity', seg(t, 1.5 + i * 0.8, 2.1 + i * 0.8)); });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    // scene 2: badges dim, basket bars grow
    S.c2.forEach(function (o, i) {
      o.badge.setAttribute('opacity', 1 - 0.55 * seg(t, 9.2, 10));
      o.bar.setAttribute('width', o.full * seg(t, 9.6 + i * 0.6, 11.4 + i * 0.6));
      o.bk.setAttribute('opacity', seg(t, 9.4, 10));
    });
    S.p2.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: z column, then RDT column, then panel
    S.h3a.setAttribute('opacity', seg(t, 17.2, 17.8));
    S.h3b.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.r3.forEach(function (o) {
      o.z.setAttribute('opacity', seg(t, 17.6 + o.k * 0.5, 18.1 + o.k * 0.5));
      o.d.setAttribute('opacity', seg(t, 20.2 + o.k * 0.3, 20.7 + o.k * 0.3));
    });
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    // scene 4: bars grow in order, then the profit panel
    S.b4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.9);
      o.r.setAttribute('width', o.w * s);
      o.t.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
