// =====================================================================
// teaser-scenes.js - Goldenberg, Proenca, Livne et al. (CIKM 2025), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled as schematics); the toy A/B test
// (6 of 100 vs 4 of 100 purchases, e = 0.5) is the same as Figure 1 on the page.
// Scene 4 uses only numbers stated in the paper text (Sec. 1, 5.3 and 6.2); nothing is read off a plot.
// Colours: orange = non-converted sessions / full-data models; blue = converted sessions / converted-only.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, mix = H.mix;

  var CAPTIONS = [
    { ja: '標準のアップリフトモデルは購入しなかったセッションも含めて全データで学習する。', en: '' },
    { ja: '割引の費用は購入時にだけかかるのに、<span class="A">学習データの 90〜99% は購入しなかったセッション</span>である。', en: '' },
    { ja: '<span class="B">購入者に占める処置群の割合</span>と処置確率から、購入 1 件あたりの処置効果が求まる。', en: '' },
    { ja: 'ベンチマークでは報酬が標準の手法と同程度で、学習は少なくとも 4〜10 倍速かった。', en: '' },
    { ja: '購入時にだけ費用が生じるプロモーションなら、予算つきの配分は購入者のデータで解ける。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.72em" dy="5">' + s + '</tspan><tspan dy="-5"> </tspan>'; }

  var CONV = { T: [7, 23, 41, 58, 76, 92], C: [14, 37, 63, 85] };
  var GX = { T: 80, C: 340 }, GY = 120, SP = 22;

  function build(svg) {
    var S = {};
    // shared dot field used by scenes 1-3 (drawn below the per-scene groups' text)
    S.field = el('g', {}, svg);
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    S.dots = [];
    var order = 0;
    ['T', 'C'].forEach(function (grp) {
      for (var k = 0; k < 100; k++) {
        var on = CONV[grp].indexOf(k) >= 0;
        var d = {
          x: GX[grp] + (k % 10) * SP, y: GY + Math.floor(k / 10) * SP, on: on, grp: grp,
          c: el('circle', { r: on ? 8 : 6.5 }, S.field)
        };
        if (on) { d.slot = grp === 'T' ? CONV.T.indexOf(k) : 6 + CONV.C.indexOf(k); d.tx = 130 + d.slot * 42; d.ty = 290; }
        S.dots.push(d); order++;
      }
    });
    S.fieldLab = el('g', {}, svg);
    t2(S.fieldLab, GX.T, 92, '処置群（100 件）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.fieldLab, GX.C, 92, '対照群（100 件）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });

    // ===== scene 1: all sessions feed the standard model =====
    var g1 = S.g[0];
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '標準の手法', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 160, '学習データ：全セッション', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 200, '・2 つの S-learner', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 228, '・2 つの Z-learner', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 256, '・3 モデル法', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 8, cy: 316, r: 8, fill: C.b }, p1);
    t2(p1, PX + 24, 322, '購入したセッション', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 8, cy: 348, r: 6.5, fill: C.gray }, p1);
    t2(p1, PX + 24, 354, '購入しなかったセッション', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: 90-99% are non-converted =====
    var g2 = S.g[1];
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 110, '購入しなかったセッション', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX, 178, '90〜99%', { 'font-size': 52, 'font-weight': 700, fill: C.a });
    t2(p2, PX, 226, '（購入は全体の 1〜10%）', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 280, '・報酬も費用も 0', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 312, '・ボットや眺めるだけの客', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 344, '・帰属が複雑で、結果が偏る', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '割合は論文本文の値。点の数は模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: keep converted only, compute xi =====
    var g3 = S.g[2];
    S.row3 = el('g', {}, g3);
    t2(S.row3, 130 - 10, 240, '購入者 10 件だけを残す', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(S.row3, 130 - 8, 336, '処置群 6 件', '', { 'font-size': 15, fill: C.ink });
    t2(S.row3, 130 + 6 * 42 - 8, 336, '対照群 4 件', '', { 'font-size': 15, fill: C.ink });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('ξ') + sub('1') + '= 6/10 = 0.6', { 'font-size': 22, fill: C.b, 'font-weight': 600 });
    txt(p3, PX, 156, m('ξ') + sub('0') + '= 4/10 = 0.4', { 'font-size': 22, fill: C.b, 'font-weight': 600 });
    txt(p3, PX, 192, m('e') + sub('1') + '= ' + m('e') + sub('0') + '= 0.5', { 'font-size': 20, fill: C.ink });
    t2(p3, PX, 214, '（50 対 50 の A/B テスト）', '', { 'font-size': 14, fill: C.muted });
    t2(p3, PX, 262, '購入 1 件あたりの効果', '', { 'font-size': 17, fill: C.ink });
    txt(p3, PX, 296, '0.6/0.5 − 0.4/0.5', { 'font-size': 20, fill: C.ink });
    txt(p3, PX, 344, '= 0.4', { 'font-size': 38, 'font-weight': 700, fill: C.b });
    t2(p3, PX, 384, '全データの 0.02 ÷ 購入率 0.05', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 406, 'と同じ値になる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: numbers stated in the text =====
    var g4 = S.g[3];
    S.card4 = [];
    var c1 = el('g', {}, g4); S.card4.push(c1);
    el('rect', { x: 70, y: 60, width: 250, height: 170, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, c1);
    t2(c1, 92, 98, '学習時間（公開・合成データ）', '', { 'font-size': 17, fill: C.muted });
    txt(c1, 92, 162, '4〜10 倍', { 'font-size': 44, 'font-weight': 700, fill: C.b });
    t2(c1, 92, 202, '少なくともこれだけ速い', '', { 'font-size': 15, fill: C.ink });
    var c2 = el('g', {}, g4); S.card4.push(c2);
    el('rect', { x: 340, y: 60, width: 250, height: 170, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, c2);
    t2(c2, 362, 98, '予算の上限での報酬', '', { 'font-size': 17, fill: C.muted });
    t2(c2, 362, 152, '標準の手法と', '', { 'font-size': 26, 'font-weight': 700, fill: C.ink });
    t2(c2, 362, 188, '同程度', '', { 'font-size': 26, 'font-weight': 700, fill: C.ink });
    t2(c2, 362, 214, '一部のデータでは上回る', '', { 'font-size': 15, fill: C.ink });
    // budget vs incremental sales, relative to giving to everyone (flat = 100%)
    var c3 = el('g', {}, g4); S.card4.push(c3);
    var BX = 210, BW = 380;
    t2(c3, 70, 286, 'Booking.com の運用（全員に配る場合 = 100%）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(c3, 70, 334, '予算', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: BX, y: 314, width: BW, height: 28, rx: 5, fill: C.panel }, c3);
    S.bud = el('rect', { x: BX, y: 314, width: 0, height: 28, rx: 5, fill: C.ink }, c3);
    S.budLab = txt(c3, BX + BW * 0.5 + 10, 334, '50%', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(c3, 70, 390, '増分売上', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: BX, y: 370, width: BW, height: 28, rx: 5, fill: C.panel }, c3);
    S.sal = el('rect', { x: BX, y: 370, width: 0, height: 28, rx: 5, fill: C.b }, c3);
    S.salRange = el('rect', { x: BX + BW * 0.8, y: 370, width: BW * 0.1, height: 28, fill: C.b, opacity: 0.35 }, c3);
    S.salLab = t2(c3, BX, 428, '約 80〜90%（購入者のみのモデル）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'ベンチマーク', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p4, PX, 148, '合成 2・公開 2・自社 2', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 176, 'の RCT データ', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 300, '初期段階の施策で', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 328, '購入者のみのモデルが', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 356, '最も良かった', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文本文の数値（グラフからは読み取っていない）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM 2025';
    el('text', { x: 480, y: 192, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Converted Data is All You Need for';
    el('text', { x: 480, y: 234, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Causal Optimization of e-Commerce Promotions';
    t2(g5, 480, 280, 'EC のプロモーションの因果的最適化には購入データだけで足りる', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 330, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dmitri Goldenberg · Hugo Manuel Proença · Amit Livne';
    el('text', { x: 480, y: 356, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Felipe Moraes · Javier Albert · Bracha Shapira';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3746252.3761573';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // dot field: visible in scenes 1-3
    var fieldOn = seg(t, 0, 0.6) * (1 - seg(t, 23.4, 24));
    S.field.setAttribute('opacity', fieldOn);
    S.fieldLab.setAttribute('opacity', seg(t, 0, 0.6) * (1 - seg(t, 16.2, 17)));
    var orange = seg(t, 9, 11);            // scene 2: non-converted turn orange
    var gone = seg(t, 16.4, 17.6);         // scene 3: non-converted fade
    var move = seg(t, 17.4, 19.4);         // scene 3: converted move to a row
    S.dots.forEach(function (d) {
      if (d.on) {
        var x = d.x + (d.tx - d.x) * move, y = d.y + (d.ty - d.y) * move;
        d.c.setAttribute('cx', x); d.c.setAttribute('cy', y);
        d.c.setAttribute('r', 8 + 4 * move);
        d.c.setAttribute('fill', d.grp === 'T' ? C.b : '#fff');
        d.c.setAttribute('stroke', C.b); d.c.setAttribute('stroke-width', 3);
      } else {
        d.c.setAttribute('cx', d.x); d.c.setAttribute('cy', d.y);
        d.c.setAttribute('fill', mix(C.gray, '#E7A684', orange));
        d.c.setAttribute('opacity', 1 - gone);
      }
    });
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    S.p2.setAttribute('opacity', seg(t, 10, 10.8));
    S.row3.setAttribute('opacity', seg(t, 19.2, 19.9));
    S.p3.setAttribute('opacity', seg(t, 19.8, 20.6));
    // scene 4
    S.card4.forEach(function (c, i) { c.setAttribute('opacity', seg(t, 24.8 + i * 1.6, 25.4 + i * 1.6)); });
    S.bud.setAttribute('width', 380 * 0.5 * seg(t, 28.4, 29.4));
    S.budLab.setAttribute('opacity', seg(t, 29.2, 29.7));
    S.sal.setAttribute('width', 380 * 0.8 * seg(t, 29.6, 30.8));
    S.salRange.setAttribute('opacity', 0.35 * seg(t, 30.8, 31.3));
    S.salLab.setAttribute('opacity', seg(t, 31, 31.5));
    S.p4.setAttribute('opacity', seg(t, 25, 25.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 32 });
})();
