// =====================================================================
// teaser-scenes.js — X5 RetailHero Uplift Modeling, unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.X5_STATS (assets/x5_stats.js), which the explainer computed
// from all rows of the official files. Captions repeat a few of those numbers as text.
// Scene 1: clients split into train / test (1 dot = 1% of clients). Scene 2: SMS vs no SMS in train + balance.
// Scene 3: purchase rate by group. Scene 4: weekly transactions in the purchase history.
// Scene 5: how the data is used + title card.
// Colours: orange = the SMS (treatment); blue = purchase afterwards (target);
//          light blue = group without SMS, full blue = group with SMS.
// =====================================================================
(function () {
  var ST = window.X5_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var G = ST.groups, O = ST.overall, A = ST.ate, F = ST.files, Bl = ST.balance, P = ST.purchases;
  var BS = '#BFD0F6';

  function fmt(n) { return n.toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }

  var CAPTIONS = [
    { ja: '顧客 400,162 人のうち、結果が付いているのは学習用の 200,039 人だけである。', en: '' },
    { ja: '学習用の顧客は SMS を<span class="A">送った群</span>と送らなかった群が半々で、送る前の属性はほぼ同じである。', en: '' },
    { ja: 'SMS を送った群の<span class="B">購買率</span>は 63.65% で、送らなかった群より 3.32 pt 高い。', en: '' },
    { ja: '特徴量は、SMS を送る前の約 4 か月分の購買履歴 4,579 万行から利用者が作る。', en: '' },
    { ja: 'コンペは予測の上位 30% の効果で競った。SMS の費用と購買額はデータにない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }


  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 100 dots, 1 dot = 1% of clients; left block = train, right block = test =====
    var g1 = S.g[0], nTr = Math.round(100 * F.uplift_train.rows / F.clients.rows);
    T(g1, 70, 64, '1 点 = 顧客の 1%', { 'font-size': 16, fill: C.muted });
    S.dots1 = [];
    for (var i = 0; i < 100; i++) {
      var tr = i < nTr, k = tr ? i : i - nTr;
      var cx = (tr ? 90 : 360) + (k % 10) * 23, cy = 112 + Math.floor(k / 10) * 40;
      S.dots1.push(el('circle', { cx: cx, cy: cy, r: 8.5, fill: tr ? C.ink : '#fff', stroke: tr ? C.ink : C.muted, 'stroke-width': 2 }, g1));
    }
    S.lab1 = el('g', {}, g1);
    T(S.lab1, 90, 334, '学習用（結果あり）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(S.lab1, 360, 334, '評価用（結果なし）', { 'font-size': 17, 'font-weight': 600, fill: C.muted });
    T(S.lab1, 90, 400, 'どちらにも、SMS を送る前の購買履歴がある。', { 'font-size': 16, fill: C.ink });
    T(S.lab1, 90, 426, '学習用と評価用で重なる顧客はいない。', { 'font-size': 16, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '顧客', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(F.clients.rows) + ' 人', { 'font-size': 30, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 200, '学習用 ' + fmt(F.uplift_train.rows), { 'font-size': 17, fill: C.ink });
    T(p1, PX, 226, 'SMS の有無と購買が付く', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 270, '評価用 ' + fmt(F.uplift_test.rows), { 'font-size': 17, fill: C.ink });
    T(p1, PX, 296, '顧客の ID だけ', { 'font-size': 15, fill: C.muted });

    // ===== scene 2: train split by SMS, 1 dot = 1% of train =====
    var g2 = S.g[1], nT = Math.round(100 * O.treatment_rate);
    T(g2, 70, 64, '学習用の顧客。1 点 = 1%', { 'font-size': 16, fill: C.muted });
    S.dots2 = [];
    for (var j = 0; j < 100; j++) {
      var tt = j < nT, m = tt ? j : j - nT;
      var x2 = (tt ? 90 : 360) + (m % 10) * 23, y2 = 112 + Math.floor(m / 10) * 40;
      S.dots2.push(el('circle', { cx: x2, cy: y2, r: 8.5, fill: tt ? C.a : '#fff', stroke: tt ? C.a : C.muted, 'stroke-width': 2 }, g2));
    }
    S.lab2 = el('g', {}, g2);
    T(S.lab2, 90, 334, 'SMS を送った ' + fmt(G.treated.n), { 'font-size': 17, 'font-weight': 600, fill: C.a });
    T(S.lab2, 360, 334, '送らなかった ' + fmt(G.control.n), { 'font-size': 17, 'font-weight': 600, fill: C.muted });
    T(S.lab2, 90, 400, '割付の方法は配布ページに書かれていない。', { 'font-size': 16, fill: C.ink });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 100, '送った群 ／ 送らなかった群', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 146, '女性の割合', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 174, p(Bl.gender_F.treated, 1) + '% ／ ' + p(Bl.gender_F.control, 1) + '%', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    T(p2, PX, 220, '年齢の平均', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 248, Bl.age_14_100_mean.treated.toFixed(1) + ' ／ ' + Bl.age_14_100_mean.control.toFixed(1) + ' 歳', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    T(p2, PX, 294, '買い物の件数の平均', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 322, Bl.transactions_per_client_mean.treated.toFixed(1) + ' ／ ' + Bl.transactions_per_client_mean.control.toFixed(1) + ' 件', { 'font-size': 20, 'font-weight': 600, fill: C.ink });

    // ===== scene 3: purchase rate by group (axis from 50%) =====
    var g3 = S.g[2], Y0 = 420, HM = 300, LO = 0.5, HI = 0.7;
    function yy(v) { return Y0 - HM * (v - LO) / (HI - LO); }
    T(g3, 70, 62, '購買率（target）', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    [0.5, 0.55, 0.6, 0.65, 0.7].forEach(function (v) {
      el('line', { x1: 140, x2: 560, y1: yy(v), y2: yy(v), stroke: C.hair }, g3);
      T(g3, 128, yy(v) + 5, Math.round(100 * v) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    S.b3 = [['送らなかった群', G.control, BS], ['送った群', G.treated, C.b]].map(function (r, i) {
      var v = r[1].target_rate, x = 200 + i * 200;
      var b = { full: Y0 - yy(v), rect: el('rect', { x: x, y: Y0, width: 110, height: 0, fill: r[2] }, g3) };
      b.lab = T(g3, x + 55, yy(v) - 14, p(v, 2) + '%', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(g3, x + 55, Y0 + 30, r[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      return b;
    });
    el('line', { x1: 140, x2: 560, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    T(g3, 140, Y0 + 62, '縦軸は 50% から', { 'font-size': 14, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, '送った群 − 送らなかった群', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 152, '+' + p(A.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p3, PX, 190, '標準誤差 ' + p(A.se, 2) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 240, '送らなかった群に対して', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 276, '+' + p(A.relative_lift, 1) + '%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    T(p3, PX, 330, 'SMS がなくても', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 356, p(G.control.target_rate, 1) + '% が購買した', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: weekly transactions =====
    var g4 = S.g[3], W = P.weekly_transactions, X0 = 110, X1 = 600, Y4 = 400, H4 = 270, TOP = 700000, bw = (X1 - X0) / W.length;
    T(g4, 70, 62, '購買履歴の 7 日ごとの買い物の件数', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 200000, 400000, 600000].forEach(function (v) {
      var y = Y4 - H4 * v / TOP;
      el('line', { x1: X0, x2: X1, y1: y, y2: y, stroke: C.hair }, g4);
      T(g4, X0 - 10, y + 5, v === 0 ? '0' : (v / 10000) + '万', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    S.w4 = W.map(function (w, i) {
      return { h: H4 * w.transactions / TOP, rect: el('rect', { x: X0 + i * bw + 3, y: Y4, width: bw - 6, height: 0, fill: '#9AA4B2' }, g4) };
    });
    el('line', { x1: X0, x2: X1, y1: Y4, y2: Y4, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    T(g4, X0, Y4 + 28, '2018/11/21', { 'font-size': 15, fill: C.ink });
    T(g4, X1, Y4 + 28, '2019/3/18', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    S.after4 = el('g', {}, g4);
    el('line', { x1: X1 + 14, x2: X1 + 14, y1: 110, y2: Y4, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 5' }, S.after4);
    T(S.after4, X1 + 4, 98, 'この後に SMS', { 'font-size': 15, fill: C.a, 'font-weight': 600, 'text-anchor': 'end' });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 112, '購買履歴', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 148, fmt(P.rows) + ' 行', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 186, '買い物 ' + fmt(P.unique_transaction_id) + ' 件', { 'font-size': 17, fill: C.ink });
    T(p4, PX, 214, '商品 ' + fmt(P.unique_products) + ' 種類', { 'font-size': 17, fill: C.ink });
    T(p4, PX, 262, '1 人あたりの買い物', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 292, '中央値 ' + P.transactions_per_train_client.treated_median + ' 件', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    T(p4, PX, 340, 'target を数えた期間は', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 366, '資料に書かれていない', { 'font-size': 16, fill: C.ink });

    // ===== scene 5: usage, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    function box(x, w, c, soft, a, b1, b2) {
      el('rect', { x: x, y: 110, width: w, height: 170, rx: 12, fill: soft }, u);
      T(u, x + w / 2, 156, a, { 'font-size': 20, 'font-weight': 650, fill: c, 'text-anchor': 'middle' });
      T(u, x + w / 2, 204, b1, { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + w / 2, 234, b2, { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    }
    box(90, 360, C.ink, C.panel, 'コンペの評価', '予測の上位 30% で、送った人と', '送らなかった人の購買率の差');
    box(510, 360, C.ink, C.panel, 'UpliftBench', '10,000 人を抜き出し、処置する', '割合 k ごとに方策の価値を比べる');
    T(u, 480, 340, 'どちらも予算を「処置する人の割合」で表している', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 384, 'SMS の費用と購買額の列はない', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · X5 RETAIL GROUP / ODS.AI';
    el('text', { x: 480, y: 240, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'X5 RetailHero Uplift Modeling';
    T(tc, 480, 290, 'X5 RetailHero のアップリフトモデリング・コンペのデータ', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'ODS.ai competition, Dec 2019 – Feb 2020';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'ods.ai/competitions/x5-retailhero-uplift-modeling';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.dots1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.4 + i * 0.025, 0.7 + i * 0.025)); });
    S.lab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    S.dots2.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 8.4 + i * 0.02, 8.7 + i * 0.02)); });
    S.lab2.setAttribute('opacity', seg(t, 10.6, 11.2));
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.2));
    S.b3.forEach(function (b, i) {
      var k = seg(t, 17 + i * 0.7, 17.8 + i * 0.7), h = b.full * k;
      b.rect.setAttribute('height', h); b.rect.setAttribute('y', 420 - h);
      b.lab.setAttribute('opacity', seg(t, 17.6 + i * 0.7, 18 + i * 0.7));
    });
    S.p3.setAttribute('opacity', seg(t, 19, 19.8));
    S.w4.forEach(function (w, i) {
      var k = seg(t, 24.6 + i * 0.12, 25.2 + i * 0.12), h = w.h * k;
      w.rect.setAttribute('height', h); w.rect.setAttribute('y', 400 - h);
    });
    S.after4.setAttribute('opacity', seg(t, 27.4, 28));
    S.p4.setAttribute('opacity', seg(t, 25.4, 26.2));
    S.use5.setAttribute('opacity', 1 - seg(t, 36.2, 36.8));
    S.title5.setAttribute('opacity', seg(t, 36.6, 37.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
