// =====================================================================
// teaser-scenes.js — Lenta Uplift Modeling Dataset, unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.LENTA_STATS (assets/lenta_stats.js), which the explainer computed
// from the full lenta_dataset.csv.gz (687,029 rows). Captions repeat a few of those numbers as text.
// Scene 1: assignment (1 dot = 1% of customers). Scene 2: visit rate by group.
// Scene 3: covariate imbalance (standardised mean differences). Scene 4: difference by response_sms bin.
// Scene 5: budget reading + title card.
// Colours: orange = SMS (the treatment, what a budget limits); blue = store visit (the outcome);
//          light blue = control group, full blue = SMS group; balance in ink and grey.
// =====================================================================
(function () {
  var ST = window.LENTA_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var G = ST.groups, O = ST.overall, A = ST.ate, BAL = ST.balance;
  var BS = '#BFD0F6', DARK = '#4B5563';

  function fmt(n) { return n.toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }
  function sg(x, d) { return (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(100 * x).toFixed(d); }

  var CAPTIONS = [
    { ja: 'Lenta の顧客 68.7 万人のうち 75% に<span class="A">SMS</span> を送り、25% には送らなかった。', en: '' },
    { ja: '<span class="B">来店率</span>は SMS 群が 11.01%、対照群が 10.26% で、差は 0.75 pt である。', en: '' },
    { ja: '割り当ての方法は書かれておらず、過去の SMS への反応率が両群でそろっていない。', en: '' },
    { ja: '過去の SMS に反応したことのない人では、<span class="B">来店率</span>の差はほぼ 0 である。', en: '' },
    { ja: '費用の列はないので、<span class="A">SMS を送る人の割合</span>を予算とみなして評価する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 100 dots, 1 dot = 1% of customers =====
    var g1 = S.g[0], nT = Math.round(100 * O.treatment_rate);
    T(g1, 70, 70, '1 点 = 顧客の 1%', { 'font-size': 16, fill: C.muted });
    S.dots1 = [];
    for (var i = 0; i < 100; i++) {
      var col = i % 20, row = Math.floor(i / 20);
      S.dots1.push(el('circle', { cx: 90 + col * 25, cy: 130 + row * 44, r: 9, fill: i < nT ? C.a : '#fff', stroke: i < nT ? C.a : C.muted, 'stroke-width': 2 }, g1));
    }
    S.lab1 = el('g', {}, g1);
    T(S.lab1, 90, 375, 'SMS 群（test）', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    T(S.lab1, 590, 375, '対照群（control）', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'end' });
    T(S.lab1, 90, 430, 'BigTarget Hackathon（Lenta と Microsoft、2020 年）', { 'font-size': 16, fill: C.ink });
    T(S.lab1, 90, 456, 'の課題：SMS を送る相手を選ぶ', { 'font-size': 16, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '行数', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(O.rows), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 196, 'SMS 群 ' + fmt(G.treated.n), { 'font-size': 17, fill: C.a });
    T(p1, PX, 222, '（' + p(O.treatment_rate, 1) + '%）', { 'font-size': 17, fill: C.a });
    T(p1, PX, 260, '対照群 ' + fmt(G.control.n), { 'font-size': 17, fill: C.muted });
    T(p1, PX, 286, '（' + p(1 - O.treatment_rate, 1) + '%）', { 'font-size': 17, fill: C.muted });
    T(p1, PX, 336, '特徴量 ' + O.features + ' 列（購買履歴）', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 362, '結果は来店の 0/1', { 'font-size': 16, fill: C.ink });

    // ===== scene 2: visit rate by group =====
    var g2 = S.g[1], Y0 = 420, HM = 300, TOP = 0.12;
    T(g2, 70, 62, '来店率（response_att）', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    [0, 0.04, 0.08, 0.12].forEach(function (v) {
      var y = Y0 - HM * v / TOP;
      el('line', { x1: 140, x2: 560, y1: y, y2: y, stroke: C.hair }, g2);
      T(g2, 128, y + 5, p(v, 0) + '%', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    S.b2 = [['対照群', G.control, BS], ['SMS 群', G.treated, C.b]].map(function (r, i) {
      var v = r[1].response_rate, h = HM * v / TOP, x = 200 + i * 200;
      var b = { full: h, rect: el('rect', { x: x, y: Y0, width: 110, height: 0, fill: r[2] }, g2) };
      b.lab = T(g2, x + 55, Y0 - h - 14, p(v, 2) + '%', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(g2, x + 55, Y0 + 30, r[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      return b;
    });
    el('line', { x1: 140, x2: 560, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, 'SMS 群 − 対照群', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 152, '+' + p(A.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p2, PX, 190, '標準誤差 ' + p(A.se, 3) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 240, '対照群に対して', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 276, '+' + p(A.relative_lift, 1) + '%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    T(p2, PX, 330, '来店 ' + fmt(O.responses) + ' 人', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 356, '（全体の ' + p(O.response_rate, 1) + '%）', { 'font-size': 16, fill: C.ink });

    // ===== scene 3: standardised mean differences =====
    var g3 = S.g[2], top = BAL.top.slice(0, 5), X3 = 330, W3 = 300, MAX = 0.2, band = 3 * BAL.smd_sd_under_randomisation;
    function x3(v) { return X3 + W3 * v / MAX; }
    T(g3, 70, 62, 'SMS 群と対照群の標準化平均差（大きい順）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('rect', { x: X3, y: 96, width: x3(band) - X3, height: 5 * 58 + 6, fill: '#E5E8EE' }, g3);
    S.bal = top.map(function (r, i) {
      var y = 120 + i * 58;
      el('text', { x: X3 - 12, y: y + 14, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-family': 'ui-monospace, Menlo, monospace' }, g3).textContent = r[0].length > 26 ? r[0].slice(0, 25) + '…' : r[0];
      var b = { w: x3(Math.abs(r[1])) - X3, rect: el('rect', { x: X3, y: y - 4, width: 0, height: 26, fill: DARK }, g3) };
      b.lab = T(g3, x3(Math.abs(r[1])) + 8, y + 15, Math.abs(r[1]).toFixed(3), { 'font-size': 15, 'font-weight': 600, fill: C.ink });
      return b;
    });
    el('line', { x1: X3, x2: X3, y1: 96, y2: 402, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    T(g3, X3 + 4, 436, '灰色の帯：無作為に分けた場合の目安（±' + band.toFixed(3) + '）', { 'font-size': 15, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, 'response_sms の平均', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 150, 'SMS 群 ' + BAL.response_sms_by_group.mean_treated.toFixed(3), { 'font-size': 22, 'font-weight': 650, fill: C.a });
    T(p3, PX, 184, '対照群 ' + BAL.response_sms_by_group.mean_control.toFixed(3), { 'font-size': 22, 'font-weight': 650, fill: C.muted });
    T(p3, PX, 236, '0.01 を超える特徴量', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 270, BAL.n_abs_smd_over_0_01 + ' / ' + BAL.features_checked + ' 列', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    T(p3, PX, 322, 'response_sms で層別すると', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 348, '来店率の差は +' + p(ST.ate_poststrat_response_sms.diff, 2) + ' pt', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: difference by response_sms bin =====
    var g4 = S.g[3], rows = ST.ate_by.response_sms.filter(function (b) { return b.n > 50000; });
    var lab = { '0': '0（反応なし）', '0.5以上1未満': '0.5〜1 未満', '1': '1（毎回反応）' };
    var X4 = 250, W4 = 340, LO = -0.006, HI = 0.014;
    function x4(v) { return X4 + W4 * (v - LO) / (HI - LO); }
    T(g4, 70, 62, '過去の SMS への反応率（response_sms）の区分ごとの差', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [-0.005, 0, 0.005, 0.01].forEach(function (v) {
      el('line', { x1: x4(v), x2: x4(v), y1: 110, y2: 400, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      T(g4, x4(v), 426, sg(v, 1) + ' pt', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.sub = rows.map(function (r, i) {
      var y = 160 + i * 100, o = { g: el('g', {}, g4) };
      T(o.g, X4 - 16, y + 2, lab[r.bin], { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      T(o.g, X4 - 16, y + 26, fmt(r.n) + ' 人', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
      el('line', { x1: x4(r.ci95[0]), x2: x4(r.ci95[1]), y1: y - 4, y2: y - 4, stroke: C.ink, 'stroke-width': 2.5 }, o.g);
      el('circle', { cx: x4(r.diff), cy: y - 4, r: 9, fill: C.b }, o.g);
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    rows.forEach(function (r, i) {
      T(p4, PX, 112 + i * 78, lab[r.bin], { 'font-size': 15, fill: C.muted });
      T(p4, PX, 144 + i * 78, sg(r.diff, 2) + ' pt', { 'font-size': 26, 'font-weight': 650, fill: r.diff > 0 ? C.b : C.ink });
    });
    T(p4, PX, 362, '線は 95% 信頼区間', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 388, '（単純な差）', { 'font-size': 15, fill: C.muted });

    // ===== scene 5: budget reading, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    function box(x, w, c, soft, a, b, cc) {
      el('rect', { x: x, y: 120, width: w, height: 150, rx: 12, fill: soft }, u);
      T(u, x + w / 2, 168, a, { 'font-size': 20, 'font-weight': 650, fill: c, 'text-anchor': 'middle' });
      T(u, x + w / 2, 212, b, { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + w / 2, 248, cc, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    }
    box(90, 340, C.a, '#FCEBDF', 'SMS を送る割合', '→ 予算', 'UpliftBench は上位 30%');
    box(530, 340, C.b, C.bsoft, '来店の増加', '→ 効果', '全体の差 +' + p(A.diff, 2) + ' pt');
    T(u, 480, 330, '差をそのまま読めば、来店 1 人の増加に平均で約 ' + Math.round(A.treated_needed_per_extra_visit) + ' 通', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 372, 'UpliftBench は 1 万行を抜き出し、12 の推定量を比べた', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 420, 'SMS の費用や購入額の列はない', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · LENTA / BIGTARGET HACKATHON 2020';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Lenta Uplift Modeling Dataset';
    T(tc, 480, 290, 'Lenta の SMS キャンペーンのアップリフトデータ', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Lenta & Microsoft, BigTarget Hackathon (2020) · scikit-uplift fetch_lenta';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'uplift-modeling.com/en/latest/api/datasets/fetch_lenta.html';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots appear in order, then labels and numbers
    S.dots1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.4 + i * 0.025, 0.7 + i * 0.025)); });
    S.lab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: bars grow
    S.b2.forEach(function (b, i) {
      var k = seg(t, 9 + i * 0.7, 9.8 + i * 0.7), h = b.full * k;
      b.rect.setAttribute('height', h); b.rect.setAttribute('y', 420 - h);
      b.lab.setAttribute('opacity', seg(t, 9.6 + i * 0.7, 10 + i * 0.7));
    });
    S.p2.setAttribute('opacity', seg(t, 11, 11.8));
    // scene 3: SMD bars grow one by one
    S.bal.forEach(function (b, i) {
      b.rect.setAttribute('width', b.w * seg(t, 17 + i * 0.4, 18 + i * 0.4));
      b.lab.setAttribute('opacity', seg(t, 17.8 + i * 0.4, 18.2 + i * 0.4));
    });
    S.p3.setAttribute('opacity', seg(t, 19.5, 20.3));
    // scene 4: subgroup rows appear
    S.sub.forEach(function (o, i) { o.g.setAttribute('opacity', seg(t, 25 + i * 0.8, 25.6 + i * 0.8)); });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
    // scene 5: usage, then the title card
    S.use5.setAttribute('opacity', 1 - seg(t, 36.2, 36.8));
    S.title5.setAttribute('opacity', seg(t, 36.6, 37.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 12 });
})();
