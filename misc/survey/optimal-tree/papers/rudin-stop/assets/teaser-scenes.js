// =====================================================================
// teaser-scenes.js — Rudin, Stop explaining black box machine learning models for high stakes decisions and
// use interpretable models instead (Nature Machine Intelligence 2019; arXiv 1811.10154 v3), unofficial explainer.
// Player: teaser-engine.js.
// Scene 1 is a schematic (labelled 模式図). Scene 2 uses the COMPAS numbers in key issue (v); scene 3 the CORELS
// rule list (Figure 3); scene 4 the objective of Challenge 1 and the CORELS run time stated in the text.
// Colours: orange = black boxes and post-hoc explanation models; blue = inherently interpretable models.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '<span class="A">ブラックボックス</span>を別のモデルで事後に説明しても、その説明は元のモデルに忠実とは限らない。', en: '' },
    { ja: 'COMPAS は 130 以上の因子を使うので、入力ミスが 1% でも調査票の 2 枚に 1 枚以上にミスが入る。', en: '' },
    { ja: '年齢と前科の数だけを使う<span class="B">3 つのルール</span>のモデルが、COMPAS と同程度の精度で再犯を予測した。', en: '' },
    { ja: '<span class="B">解釈できるモデル</span>は誤分類とモデルの大きさの和を最小にする最適化問題として作れる。', en: '' },
    { ja: '重要な意思決定では、説明より解釈できるモデルを、と論文は呼びかける。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: black box + explanation model =====
    var g1 = S.g[0];
    t2(g1, 120, 130, '入力', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    for (var k = 0; k < 4; k++) el('circle', { cx: 120, cy: 170 + k * 40, r: 10, fill: C.gray }, g1);
    el('rect', { x: 220, y: 150, width: 170, height: 140, rx: 14, fill: C.ink }, g1);
    t2(g1, 305, 232, '?', '', { 'font-size': 56, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    t2(g1, 305, 320, 'ブラックボックス', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    [170, 210, 250, 290].forEach(function (y) { el('line', { x1: 130, y1: y, x2: 220, y2: 220, stroke: C.gray, 'stroke-width': 1.5 }, g1); });
    el('line', { x1: 390, y1: 220, x2: 470, y2: 220, stroke: C.ink, 'stroke-width': 2 }, g1);
    t2(g1, 500, 228, '予測', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    S.expl = el('g', {}, g1);
    el('rect', { x: 230, y: 370, width: 150, height: 70, rx: 12, fill: '#fff', stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, S.expl);
    t2(S.expl, 305, 400, '説明モデル', '', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    t2(S.expl, 305, 424, '（事後に作る）', '', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
    el('path', { d: 'M305,330 L305,368', stroke: C.a, 'stroke-width': 2, 'marker-end': '' }, S.expl);
    S.agree = el('g', {}, g1);
    el('rect', { x: 430, y: 380, width: 200, height: 22, fill: C.gray }, S.agree);
    S.agreeBar = el('rect', { x: 430, y: 380, width: 0, height: 22, fill: C.a }, S.agree);
    t2(S.agree, 430, 428, '元のモデルとの一致 90%', '', { 'font-size': 15, fill: C.a });
    t2(S.agree, 430, 452, '→ 10% の場合は説明が誤り', '', { 'font-size': 15, fill: C.ink });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX + 20, 150, '説明可能な ML', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX + 20, 196, '説明が完全に忠実なら、', '', { 'font-size': 15, fill: C.ink });
    t2(p1, PX + 20, 220, '説明そのものが元のモデル', '', { 'font-size': 15, fill: C.ink });
    t2(p1, PX + 20, 244, 'になってしまう', '', { 'font-size': 15, fill: C.ink });
    t2(p1, PX + 20, 296, '違う特徴量で真似るだけ', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX + 20, 320, 'のこともある', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: COMPAS 130+ factors, 1% typos =====
    var g2 = S.g[1];
    var r2 = rng(3);
    S.grid2 = [];
    for (var i = 0; i < 130; i++) {
      var x = 90 + (i % 13) * 36, y = 110 + Math.floor(i / 13) * 30;
      S.grid2.push({ r: el('rect', { x: x, y: y, width: 28, height: 20, rx: 4, fill: C.gray }, g2), t0: 8.8 + i * 0.012, bad: i === 57 });
    }
    t2(g2, 324, 430, 'COMPAS の入力：130 以上の因子', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '入力ミスが 1% なら', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 220, '2 枚に 1 枚以上', '', { 'font-size': 34, 'font-weight': 700, fill: C.a });
    t2(p2, PX, 256, 'の調査票にミスが入る', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 316, '保釈の判断を左右した', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 340, '例もあると論文は述べる', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '論文の数値（130 以上の因子、1% の入力ミス）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: CORELS rule list =====
    var g3 = S.g[2];
    el('rect', { x: 80, y: 120, width: 520, height: 260, rx: 14, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3);
    var R = [['IF', '年齢 18〜20 歳 かつ 男性', '→ 逮捕を予測'], ['ELSE IF', '年齢 21〜23 歳 かつ 前科 2〜3 回', '→ 逮捕を予測'], ['ELSE IF', '前科が 3 回より多い', '→ 逮捕を予測'], ['ELSE', '', '逮捕なしを予測']];
    S.rules3 = R.map(function (r, i) {
      var g = el('g', {}, g3), y = 175 + i * 56;
      t2(g, 105, y, r[0], '', { 'font-size': 17, 'font-weight': 700, fill: C.b });
      t2(g, 205, y, r[1], '', { 'font-size': 17, fill: C.ink });
      t2(g, r[1] ? 470 : 205, y, r[2], '', { 'font-size': 17, fill: C.ink });
      return { g: g, t0: 17.0 + i * 0.7 };
    });
    t2(g3, 340, 420, 'CORELS のルールリスト（2 年以内の逮捕の予測）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 150, '解釈できるモデル', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 196, '年齢・前科（・性別）だけ', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 240, 'COMPAS と同程度の', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 266, '真陽性率・偽陽性率', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 320, '人が経験則で書いたように', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 344, '見えるが、機械学習のモデル', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '論文 Figure 3 のモデル（ブロワード郡のデータ）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: the optimisation problem =====
    var g4 = S.g[3];
    S.eq4 = el('g', {}, g4);
    t2(S.eq4, 330, 170, 'min', '', { 'font-size': 26, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.eq4, 330, 230, '誤分類の割合 ＋ ' + m('λ') + ' × モデルの大きさ', '', { 'font-size': 26, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.l4 = el('g', {}, g4);
    t2(S.l4, 330, 300, m('λ') + ' = 0.01：精度 1% と引き換えに', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.l4, 330, 330, 'モデルの項を 1 つ減らしてよい', '', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    S.c4 = el('g', {}, g4);
    el('rect', { x: 150, y: 370, width: 360, height: 64, rx: 12, fill: C.bsoft }, S.c4);
    t2(S.c4, 330, 398, 'CORELS：ブロワード郡のデータで', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(S.c4, 330, 422, '1 分未満で最適に解いた', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '課題 1', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 190, '最適な論理モデル', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 216, '（決定木・ルールリスト）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 262, '課題 2', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 302, '疎なスコアリングシステム', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 348, '課題 3', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 388, '分野ごとの解釈しやすさ', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文の課題 1 の式と本文の記述', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '提案する義務', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '同じ性能なら解釈できる方を', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '存在しうる理由（論文の議論）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'ラショウモン集合', '', { 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 166, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NATURE MACHINE INTELLIGENCE 2019';
    el('text', { x: 480, y: 210, 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Stop Explaining Black Box Machine Learning Models';
    el('text', { x: 480, y: 244, 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for High Stakes Decisions and Use Interpretable';
    el('text', { x: 480, y: 278, 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Models Instead';
    t2(g5, 480, 318, '重要な意思決定では、説明より解釈できるモデルを', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 364, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Cynthia Rudin';
    el('text', { x: 480, y: 412, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1038/s42256-019-0048-x';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.expl.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.agree.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.agreeBar.setAttribute('width', 200 * 0.9 * H.ease(seg(t, 3.8, 5.0)));
    S.p1.setAttribute('opacity', seg(t, 1.0, 1.8));
    S.grid2.forEach(function (c) {
      var on = seg(t, c.t0, c.t0 + 0.2);
      c.r.setAttribute('opacity', on);
      c.r.setAttribute('fill', c.bad && t > 11.5 ? C.a : C.gray);
    });
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.rules3.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.5)); });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.eq4.setAttribute('opacity', seg(t, 24.8, 25.6));
    S.l4.setAttribute('opacity', seg(t, 26.6, 27.4));
    S.c4.setAttribute('opacity', seg(t, 28.6, 29.4));
    S.p4.setAttribute('opacity', seg(t, 25.6, 26.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 21 });
})();
