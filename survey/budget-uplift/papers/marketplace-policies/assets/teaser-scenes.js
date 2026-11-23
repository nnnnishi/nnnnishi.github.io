// =====================================================================
// teaser-scenes.js — Wu & Yan (KDD 2026 ADS), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); scene 2 simplifies the
// pattern the paper reports for Figure 2, scene 3 follows the hybrid-ranking steps and Table 1.
// Scene 4 uses the Qini coefficients printed in Table 2 and the deployment numbers in the text / Table 4
// (arXiv v1).
// Colours: orange = ranking by the target-metric CATE alone; blue = the paper's hybrid ranking.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '無料枠のしきい値を厳しくすると企業側の収益化は進むが、求職者側のエンゲージメントが下がりうる。', en: '' },
    { ja: '<span class="A">目的指標の効果だけで並べる</span>と、効果の小さい求人の中に、エンゲージメントを大きく下げるものが紛れる。', en: '' },
    { ja: '<span class="B">ハイブリッド順位づけ</span>は下位半分をガードレールへの影響で並べ直し、影響の大きい求人の方策を緩める。', en: '' },
    { ja: '実データでは<span class="B">ハイブリッド順位づけ</span>がガードレールの Qini を 0.11 から 0.21 に上げ、目的指標の Qini はほぼ変わらなかった。', en: '' },
    { ja: '処置水準が 2 つしかない実験からでも、ガードレールを守りながら目的指標を上げる方策を本番に展開できた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  // toy segments: target CATE (up) and guardrail CATE (down), sorted by target CATE
  var TY = [9, 6, 4.5, 3.5, 2.5, 0.6, 0.5, 0.4, 0.3, 0.2];
  var TV = [-1.5, -3, -2, -4, -1, -0.5, -5, -1.5, -6, -2.5];
  var HYB = [0, 1, 2, 3, 4, 5, 8, 6, 9, 7];   // new position of each segment under hybrid ranking
  var BX = 90, STEP = 50, BW = 36, BASE = 250, UY = 17, UV = 19;
  function bx(pos) { return BX + pos * STEP; }

  function barsSet(g, label, col) {
    var o = { up: [], dn: [], box: [] };
    T(g, BX - 10, 60, label, { 'font-size': 17, 'font-weight': 600, fill: col });
    T(g, BX - 10, 86, '棒の上：目的指標の効果　棒の下：ガードレール指標への効果', { 'font-size': 14, fill: C.muted });
    el('line', { x1: BX - 14, x2: bx(9) + BW + 14, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: bx(5) - 7, x2: bx(5) - 7, y1: 96, y2: 380, stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g);
    T(g, bx(5) - 15, 112, '上位半分', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    T(g, bx(5) + 1, 112, '下位半分', { 'font-size': 14, fill: C.muted });
    for (var i = 0; i < 10; i++) {
      o.up.push(el('rect', { x: bx(i), y: BASE - TY[i] * UY, width: BW, height: TY[i] * UY, fill: C.muted }, g));
      o.dn.push(el('rect', { x: bx(i), y: BASE, width: BW, height: -TV[i] * UV, fill: C.gray }, g));
      o.box.push(el('rect', { x: bx(i) - 5, y: BASE - TY[i] * UY - 5, width: BW + 10, height: TY[i] * UY - TV[i] * UV + 10, rx: 6, fill: 'none', stroke: col, 'stroke-width': 3, opacity: 0 }, g));
    }
    return o;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the threshold moves both sides =====
    var g1 = S.g[0], MB = 430;
    T(g1, 125, 120, '企業側の収益化', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, 555, 100, '求職者側の', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, 555, 124, 'エンゲージメント', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 70, x2: 180, y1: MB, y2: MB, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: 500, x2: 610, y1: MB, y2: MB, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.m1L = el('rect', { x: 95, y: MB - 100, width: 60, height: 100, fill: C.muted }, g1);
    S.m1R = el('rect', { x: 525, y: MB - 200, width: 60, height: 200, fill: C.muted }, g1);
    el('line', { x1: 230, x2: 450, y1: 300, y2: 300, stroke: C.hair, 'stroke-width': 10, 'stroke-linecap': 'round' }, g1);
    S.knob1 = el('circle', { cx: 230, cy: 300, r: 17, fill: '#fff', stroke: C.ink, 'stroke-width': 3 }, g1);
    T(g1, 340, 250, '無料枠のしきい値', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    T(g1, 230, 348, '甘い', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    T(g1, 450, 348, '厳しい', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 130, '無料枠のしきい値', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(p1, PX, 160, '有料のプロモーションを', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 184, '求める前に、どこまで', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 208, '無料で扱うかを決める。', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 256, '多くのプラットフォームは', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 280, 'すべての求人に同じ値を使う。', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 328, 'この論文は求人のセグメント', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 352, 'ごとに値を変える。', { 'font-size': 16, fill: C.ink });
    T(g1, 940, 520, '模式図（棒の高さは解説者が置いた値）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: ranking by target CATE alone =====
    var g2 = S.g[1];
    S.b2 = barsSet(g2, '目的指標の CATE の順に並べた求人のセグメント', C.a);
    S.n2 = el('g', {}, g2);
    for (var i = 0; i < 10; i++) T(S.n2, bx(i) + BW / 2, 420, String(i + 1), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 130, '下位半分は目的指標の', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 154, '効果がどれもほぼ 0。', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 202, 'それでもエンゲージメント', { 'font-size': 16, fill: C.a });
    T(p2, PX, 226, 'への影響は大きく違う。', { 'font-size': 16, fill: C.a });
    T(p2, PX, 274, '目的指標だけで決めると、', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 298, 'この違いが方策に反映', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 322, 'されない。', { 'font-size': 16, fill: C.ink });
    T(g2, 940, 520, '模式図（論文 Figure 2 で報告された傾向を単純化）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: hybrid ranking and policy tiers =====
    var g3 = S.g[2];
    S.b3 = barsSet(g3, 'ハイブリッド順位で並べ直したセグメント', C.b);
    S.tiers3 = el('g', {}, g3);
    [['A', '最も厳しい', 0, 3], ['B', 'やや厳しい', 3, 5], ['C', '基準のまま', 5, 8], ['D', '緩める', 8, 10]].forEach(function (r, k) {
      var x0 = bx(r[2]) - 5, x1 = bx(r[3] - 1) + BW + 5;
      el('rect', { x: x0, y: 400, width: x1 - x0, height: 56, rx: 6, fill: k === 3 ? '#E7EEFC' : '#F2F4F7' }, S.tiers3);
      T(S.tiers3, (x0 + x1) / 2, 423, r[0], { 'font-size': 16, 'font-weight': 650, fill: k === 3 ? C.b : C.ink, 'text-anchor': 'middle' });
      T(S.tiers3, (x0 + x1) / 2, 446, r[1], { 'font-size': 14, fill: k === 3 ? C.b : C.ink, 'text-anchor': 'middle' });
    });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 130, '上位半分：目的指標の', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 154, 'CATE の大きい順。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 202, '下位半分：ガードレールへの', { 'font-size': 16, fill: C.b });
    T(p3, PX, 226, '影響が小さい順。', { 'font-size': 16, fill: C.b });
    T(p3, PX, 274, '順位で方策の段階を決め、', { 'font-size': 16, fill: C.ink });
    txt(p3, PX, 298, '合計が −' + m('δ') + ' 以上か確かめる。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 322, '満たさなければ下位を緩める。', { 'font-size': 16, fill: C.ink });
    T(g3, 940, 520, '模式図（段階の区切りは解説者が置いた例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Qini coefficients (Table 2) and deployment =====
    var g4 = S.g[3], QB = 430, QS = 300;
    T(g4, 70, 60, 'Qini 係数（ホールドアウト、論文 Table 2）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 70, x2: 600, y1: QB, y2: QB, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [0.5, 1.0].forEach(function (v) {
      el('line', { x1: 70, x2: 600, y1: QB - v * QS, y2: QB - v * QS, stroke: C.hair }, g4);
      el('text', { x: 62, y: QB - v * QS + 5, 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toFixed(1);
    });
    S.q4 = [];
    [['目的指標の Qini', 0.80, 0.83, 120], ['ガードレールの Qini', 0.11, 0.21, 380]].forEach(function (r) {
      [[r[1], C.a, 0], [r[2], C.b, 1]].forEach(function (q) {
        var x = r[3] + q[2] * 90, o = { v: q[0] };
        o.bar = el('rect', { x: x, y: QB, width: 74, height: 0, fill: q[1] }, g4);
        o.lab = T(g4, x + 37, QB - q[0] * QS - 10, q[0].toFixed(2), { 'font-size': 18, 'font-weight': 650, fill: q[1], 'text-anchor': 'middle' });
        o.t0 = 25 + S.q4.length * 0.6;
        S.q4.push(o);
      });
      T(g4, r[3] + 82, QB + 28, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    });
    [[C.a, '目的指標のみで順位づけ', 70], [C.b, 'ハイブリッド順位づけ', 300]].forEach(function (L) {
      el('rect', { x: L[2], y: 488, width: 16, height: 16, rx: 3, fill: L[0] }, g4);
      T(g4, L[2] + 24, 502, L[1], { 'font-size': 15, fill: C.ink });
    });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 104, '本番の A/B テスト', { 'font-size': 16, fill: C.muted });
    T(p4, PX, 136, '目的指標の上昇', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 172, '予測の約 0.9 倍', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 206, 'ガードレールはしきい値内', { 'font-size': 16, fill: C.ink });
    T(p4, PX, 262, '未実験の中間の水準', { 'font-size': 16, fill: C.muted });
    T(p4, PX, 286, '外挿と観測の相関', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 324, m('r') + ' = 0.85', { 'font-size': 28, 'font-weight': 650, fill: C.ink });
    T(p4, PX, 376, '具体的な上昇率は非公開', { 'font-size': 14, fill: C.muted });
    T(g4, 940, 520, '論文 Table 2・Table 4 と本文（arXiv v1）の数値', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2026 · APPLIED DATA SCIENCE TRACK';
    el('text', { x: 480, y: 190, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Personalizing Marketplace Policies with Competing';
    el('text', { x: 480, y: 228, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Objectives and Constrained Experiments:';
    el('text', { x: 480, y: 266, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Evidence from a Job Marketplace';
    T(g5, 480, 310, '目的が競合し実験が限られるときのマーケットプレイス方策の個別化', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 358, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yufei Wu · Zhen Yan';
    el('text', { x: 480, y: 414, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3770855.3818460 · arxiv.org/abs/2606.30932';
    T(g5, 480, 470, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: the knob moves from generous to restrictive; monetization up, engagement down
    var k1 = seg(t, 1.5, 5.5), hL = lerp(100, 200, k1), hR = lerp(200, 110, k1);
    S.knob1.setAttribute('cx', lerp(230, 450, k1));
    S.m1L.setAttribute('y', 430 - hL); S.m1L.setAttribute('height', hL);
    S.m1R.setAttribute('y', 430 - hR); S.m1R.setAttribute('height', hR);
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    // scene 2: bars grow, then the risky low-target segments are outlined
    S.b2.up.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 8.6 + i * 0.12, 9.2 + i * 0.12)); });
    S.b2.dn.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 9.8 + i * 0.12, 10.4 + i * 0.12)); });
    [6, 8].forEach(function (i) { S.b2.box[i].setAttribute('opacity', seg(t, 12, 12.6)); });
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.2));
    // scene 3: the bottom half is re-sorted by guardrail CATE, then tiers appear
    var k3 = seg(t, 17.2, 19.2);
    for (var i = 0; i < 10; i++) {
      var x = lerp(bx(i), bx(HYB[i]), k3);
      S.b3.up[i].setAttribute('x', x); S.b3.dn[i].setAttribute('x', x); S.b3.box[i].setAttribute('x', x - 5);
    }
    [6, 8].forEach(function (i) { S.b3.box[i].setAttribute('opacity', seg(t, 19.8, 20.4)); });
    S.tiers3.setAttribute('opacity', seg(t, 20.4, 21.2));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: Qini bars grow in order
    S.q4.forEach(function (o) {
      var h = o.v * 300 * seg(t, o.t0, o.t0 + 0.7);
      o.bar.setAttribute('y', 430 - h); o.bar.setAttribute('height', h);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
