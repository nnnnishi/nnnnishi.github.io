// =====================================================================
// teaser-scenes.js — E3IR (Sun et al., RecSys 2024). Player: teaser-engine.js (unchanged).
// Scenes 1–3 are schematics (labelled 模式図). Scene 4 uses the EOM values printed in the paper's Table 2.
// render() is a pure function of t, so scene jumps and ?teaser_t= work.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, clamp = H.clamp;

  var CAPTIONS = [
    { ja: 'これまでは、<span class="A">アップリフトを予測してから、別の段階で予算内の配分を解く</span>二段階法が多かった。', en: '' },
    { ja: '予測した応答曲線が単調でも滑らかでもないと、最適でない処置水準を選んでしまう。', en: '' },
    { ja: 'E3IR は<span class="B">非負の増分を積み上げて</span>曲線を単調にし、<span class="B">整数計画層の勾配</span>を予測に戻す。', en: '' },
    { ja: '多値の処置の2データで、E3IR の EOM は比較手法を上回った（論文 Table 2）。', en: '' },
    { ja: '予測と配分を一緒に学習し、二段階法のずれを小さくする。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  // Table 2 (EOM; Production is printed as scaled down by e^4)
  var EOM = [
    { name: 'Hillstrom', rows: [['Multi-TPM-SL', 21.9767], ['DRM', 26.5744], ['E3IR', 29.9221]] },
    { name: 'Production', rows: [['Multi-TPM-SL', 27.6576], ['DRM', 36.6544], ['E3IR', 44.5087]] }
  ];

  function box(g, x, y, w, h, stroke, fill) {
    return el('rect', { x: x, y: y, width: w, height: h, rx: 12, fill: fill, stroke: stroke, 'stroke-width': 2 }, g);
  }
  function txt(g, x, y, s, attrs) {
    var a = { x: x, y: y, 'font-size': 20, fill: C.ink };
    for (var k in attrs) a[k] = attrs[k];
    var e = el('text', a, g); e.innerHTML = s; return e;
  }
  function arrowHead(defs, id, col) {
    var m = el('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    el('path', { d: 'M0,0L10,5L0,10z', fill: col }, m);
  }

  function build(svg) {
    var S = {};
    var defs = el('defs', {}, svg);
    arrowHead(defs, 'tA', C.a); arrowHead(defs, 'tB', C.b);
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ---------- scene 1: two-stage pipeline ----------
    var g = S.g[0];
    box(g, 60, 150, 190, 90, C.a, '#FCEBDF');
    txt(g, 155, 190, 'アップリフト予測', { 'text-anchor': 'middle' });
    txt(g, 155, 220, '<tspan ' + MI + '>τ</tspan><tspan font-size="14" dy="-8" ' + MI + '>r</tspan><tspan dy="8">, </tspan><tspan ' + MI + '>τ</tspan><tspan font-size="14" dy="-8" ' + MI + '>c</tspan>', { 'text-anchor': 'middle', fill: C.muted });
    box(g, 320, 150, 170, 90, C.a, '#fff');
    txt(g, 405, 190, 'MCKP ソルバー', { 'text-anchor': 'middle' });
    txt(g, 405, 220, '予算 <tspan ' + MI + '>B</tspan> 以内', { 'text-anchor': 'middle', fill: C.muted, 'font-size': 17 });
    box(g, 560, 150, 100, 90, C.a, '#fff');
    txt(g, 610, 202, '配分', { 'text-anchor': 'middle' });
    el('line', { x1: 252, y1: 195, x2: 314, y2: 195, stroke: C.a, 'stroke-width': 3, 'marker-end': 'url(#tA)' }, g);
    el('line', { x1: 492, y1: 195, x2: 554, y2: 195, stroke: C.a, 'stroke-width': 3, 'marker-end': 'url(#tA)' }, g);
    S.flow = [0, 1, 2, 3, 4].map(function () { return el('circle', { r: 7, fill: C.a }, g); });
    txt(g, 155, 290, '第1段階', { 'text-anchor': 'middle', fill: C.a, 'font-weight': 700 });
    txt(g, 405, 290, '第2段階', { 'text-anchor': 'middle', fill: C.a, 'font-weight': 700 });
    S.s1note = el('g', {}, g);
    el('path', { d: 'M405,318 C405,370 155,370 155,320', fill: 'none', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, S.s1note);
    txt(S.s1note, 280, 400, '配分の結果は予測の学習に戻らない', { 'text-anchor': 'middle', fill: C.a, 'font-size': 18 });
    txt(g, 700, 170, '1. 処置ごとの', { 'font-size': 19 });
    txt(g, 700, 198, '応答とコストの増分を予測', { 'font-size': 19 });
    txt(g, 700, 250, '2. 多肢選択ナップザック', { 'font-size': 19 });
    txt(g, 700, 278, '問題を別に解いて配分', { 'font-size': 19 });
    txt(g, 700, 340, '予測は予測の損失だけで', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 364, '学習される', { 'font-size': 17, fill: C.muted });

    // ---------- scene 2: non-monotone / non-smooth predicted curve ----------
    g = S.g[1];
    txt(g, 70, 110, '模式図：あるユーザーの予測（応答 − λ·コスト）', { 'font-size': 17, fill: C.muted });
    el('line', { x1: 80, y1: 420, x2: 600, y2: 420, stroke: C.muted, 'stroke-width': 1.5 }, g);
    var vals = [60, 120, 165, 150, 245, 185];   // toy heights; the spike at t=4 is a prediction error
    S.bars2 = vals.map(function (v, i) {
      var x = 110 + i * 82;
      txt(g, x + 25, 448, String(i), { 'text-anchor': 'middle', fill: C.muted, 'font-size': 17 });
      return el('rect', { x: x, y: 420, width: 50, height: 0, fill: i === 4 ? C.a : '#FCEBDF', stroke: C.a, 'stroke-width': 1.5 }, g);
    });
    S.vals2 = vals;
    txt(g, 340, 480, '処置水準 <tspan ' + MI + '>t</tspan>', { 'text-anchor': 'middle', fill: C.muted, 'font-size': 17 });
    S.s2mark = el('g', {}, g);
    txt(S.s2mark, 135 + 2 * 82, 230, '本来の最適 <tspan ' + MI + '>t</tspan>*', { 'text-anchor': 'middle', fill: C.ink, 'font-size': 17 });
    txt(S.s2mark, 135 + 4 * 82, 150, '誤って選ぶ', { 'text-anchor': 'middle', fill: C.a, 'font-size': 17, 'font-weight': 700 });
    txt(g, 700, 170, '単調でない・滑らかでない', { 'font-size': 19, fill: C.a, 'font-weight': 700 });
    txt(g, 700, 198, '予測では、', { 'font-size': 19 });
    txt(g, 700, 226, '最良の水準を取り違える', { 'font-size': 19 });
    txt(g, 700, 300, 'もう一つの弱点：', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 326, '平均の予測精度が高くても、', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 352, '配分の成績が良いとは限らない', { 'font-size': 17, fill: C.muted });

    // ---------- scene 3: non-negative increments + gradient back ----------
    g = S.g[2];
    txt(g, 70, 110, '模式図：増分を積み上げた応答曲線', { 'font-size': 17, fill: C.muted });
    el('line', { x1: 80, y1: 420, x2: 400, y2: 420, stroke: C.muted, 'stroke-width': 1.5 }, g);
    var inc = [70, 60, 40, 25, 15];   // ŷ0, then ϑ1..ϑ4 (toy)
    S.blocks = [];
    for (var col = 0; col < 5; col++) {
      var base = 420, x3 = 95 + col * 60;
      for (var k = 0; k <= col; k++) {
        var h = inc[k];
        var r = el('rect', { x: x3, y: base - h, width: 44, height: h, fill: k === 0 ? C.gray : C.bsoft, stroke: k === 0 ? 'none' : C.b, 'stroke-width': 1.5 }, g);
        S.blocks.push({ r: r, col: col, k: k });
        base -= h;
      }
      txt(g, x3 + 22, 448, String(col), { 'text-anchor': 'middle', fill: C.muted, 'font-size': 17 });
    }
    txt(g, 117, 345, 'ŷ₀', { 'text-anchor': 'middle', fill: C.ink, 'font-size': 17 });
    txt(g, 177, 285, '+ϑ₁', { 'text-anchor': 'middle', fill: C.b, 'font-size': 17 });
    txt(g, 240, 480, '処置水準 <tspan ' + MI + '>t</tspan>', { 'text-anchor': 'middle', fill: C.muted, 'font-size': 17 });
    box(g, 450, 150, 190, 70, C.b, C.bsoft);
    txt(g, 545, 192, '予測モジュール', { 'text-anchor': 'middle' });
    box(g, 450, 330, 190, 70, C.b, '#fff');
    txt(g, 545, 372, '整数計画層', { 'text-anchor': 'middle' });
    el('line', { x1: 520, y1: 222, x2: 520, y2: 324, stroke: C.b, 'stroke-width': 3, 'marker-end': 'url(#tB)' }, g);
    S.back = el('g', {}, g);
    el('path', { d: 'M600,328 C640,290 640,262 600,226', fill: 'none', stroke: C.b, 'stroke-width': 3.5, 'marker-end': 'url(#tB)' }, S.back);
    txt(S.back, 642, 282, '勾配', { fill: C.b, 'font-size': 18, 'font-weight': 700 });
    txt(g, 510, 282, '予測値', { 'text-anchor': 'end', fill: C.muted, 'font-size': 16 });
    txt(g, 700, 170, '増分 ϑ ≥ 0 を', { 'font-size': 19, fill: C.b, 'font-weight': 700 });
    txt(g, 700, 198, '足し上げるので、', { 'font-size': 19 });
    txt(g, 700, 226, '曲線は下がらない', { 'font-size': 19 });
    S.s3b = el('g', {}, g);
    txt(S.s3b, 700, 300, '整数計画を解く層から', { 'font-size': 19, fill: C.b, 'font-weight': 700 });
    txt(S.s3b, 700, 328, '予測へ勾配を返し、', { 'font-size': 19 });
    txt(S.s3b, 700, 356, '一緒に学習する', { 'font-size': 19 });

    // ---------- scene 4: EOM bars (Table 2) ----------
    g = S.g[3];
    S.bars4 = [];
    EOM.forEach(function (d, p) {
      var y0 = 120 + p * 190;
      txt(g, 70, y0, d.name, { 'font-size': 20, 'font-weight': 700 });
      d.rows.forEach(function (row, i) {
        var y = y0 + 18 + i * 46, me = row[0] === 'E3IR';
        txt(g, 225, y + 25, row[0], { 'text-anchor': 'end', 'font-size': 18, fill: me ? C.b : C.ink, 'font-weight': me ? 700 : 400 });
        var r = el('rect', { x: 240, y: y, width: 0, height: 32, rx: 4, fill: me ? C.b : C.gray }, g);
        var v = txt(g, 248, y + 24, row[1].toFixed(2), { 'font-size': 18, fill: me ? C.b : C.ink, 'font-weight': me ? 700 : 400 });
        S.bars4.push({ r: r, v: v, w: row[1] * 7.6, order: p * 3 + i });
      });
    });
    el('line', { x1: 240, y1: 125, x2: 240, y2: 470, stroke: C.muted, 'stroke-width': 1.5 }, g);
    txt(g, 700, 170, 'EOM（論文 Table 2）', { 'font-size': 19, 'font-weight': 700 });
    txt(g, 700, 205, '5シードでの値', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 260, 'Hillstrom：3処置、予算 500', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 290, 'Production：動画の鮮明化', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 314, '4処置、予算5万', { 'font-size': 17, fill: C.muted });
    txt(g, 700, 338, '（値は論文表記で e⁴ で割った値）', { 'font-size': 15, fill: C.muted });

    // ---------- scene 5: title card ----------
    g = S.g[4];
    el('text', { x: 480, y: 170, 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = 'RECSYS 2024';
    el('text', { x: 480, y: 225, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'End-to-End Cost-Effective Incentive Recommendation';
    el('text', { x: 480, y: 265, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'under Budget Constraint with Uplift Modeling';
    el('text', { x: 480, y: 320, 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'Zexu Sun, Hao Yang, Dugang Liu, Yunpeng Weng, Xing Tang, Xiuqiang He';
    el('text', { x: 480, y: 370, 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'arXiv:2408.11623 ・ doi.org/10.1145/3640457.3688147';
    t2(g, 480, 430, '非公式の解説（著者のページではありません）', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots travel along the pipeline; the "no feedback" note appears later
    S.flow.forEach(function (c, i) {
      var u = ((t * 0.5 + i / 5) % 1), x0 = i % 2 ? 494 : 254;
      c.setAttribute('cx', x0 + u * 54);
      c.setAttribute('cy', 195);
      c.setAttribute('opacity', t < 8 ? Math.sin(u * Math.PI) * 0.9 : 0);
    });
    S.s1note.setAttribute('opacity', seg(t, 3.5, 4.5));
    // scene 2: bars grow, then the marks
    S.bars2.forEach(function (r, i) {
      var h = S.vals2[i] * seg(t, 8.5 + i * 0.35, 9.3 + i * 0.35);
      r.setAttribute('y', 420 - h); r.setAttribute('height', h);
    });
    S.s2mark.setAttribute('opacity', seg(t, 11.5, 12.3));
    // scene 3: blocks appear column by column, then the gradient arrow
    S.blocks.forEach(function (b) {
      b.r.setAttribute('opacity', seg(t, 16.4 + b.col * 0.6 + b.k * 0.12, 16.8 + b.col * 0.6 + b.k * 0.12));
    });
    var back = seg(t, 19.8, 20.6);
    S.back.setAttribute('opacity', back);
    S.s3b.setAttribute('opacity', back);
    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var k = seg(t, 24.6 + b.order * 0.45, 25.4 + b.order * 0.45);
      b.r.setAttribute('width', b.w * k);
      b.v.setAttribute('x', 248 + b.w * k);
      b.v.setAttribute('opacity', k);
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
