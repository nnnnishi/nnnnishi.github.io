// =====================================================================
// teaser-scenes.js — Bi-DFCL (NeurIPS 2025). Player: teaser-engine.js (unchanged).
// Orange = observational (OBS) data side, blue = RCT data side (see the CSS header in index.html).
// Scenes 1–3 are schematics (dot fields, number line). Scene 4 uses the numbers printed in the
// paper's Table 4 (online A/B test, improvement over TSM-SL). render() is a pure function of t.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, mix = H.mix;

  var CAPTIONS = [
    { ja: '<span class="A">観察データ</span>は多いが偏っており、<span class="B">RCT データ</span>は偏りがないが少ない', en: '' },
    { ja: '既存の決定重視学習は決定損失を <span class="B">RCT データ</span>でしか計算できず、<span class="A">観察データ</span>を使えない', en: '' },
    { ja: 'Bi-DFCL は <span class="B">RCT の決定損失</span>で学ぶ重み w を使い、<span class="A">観察データ</span>の疑似ラベルを作る', en: '' },
    { ja: '4週間のオンライン A/B テストで、Bi-DFCL は TSM-SL に対して注文数を 3.00〜3.22% 伸ばした', en: '' },
    { ja: '観察データの量と RCT データの偏りのなさを、配分の質を基準に組み合わせる', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  var NOBS = 160, NRCT = 16;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    S.fieldG = el('g', {}, svg);         // shared dot field for scenes 1–2
    var r = H.rng(7);

    // ---------- scenes 1–2: dot fields ----------
    var F = S.fieldG;
    el('rect', { x: 70, y: 110, width: 330, height: 330, rx: 14, fill: '#fff', stroke: C.hair }, F);
    el('rect', { x: 430, y: 110, width: 160, height: 330, rx: 14, fill: '#fff', stroke: C.hair }, F);
    t2(F, 235, 96, '観察データ', '', { 'font-size': 20, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    t2(F, 510, 96, 'RCT データ', '', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    t2(F, 235, 470, '過去の施策方針で配った結果', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(F, 510, 470, '無作為に配った結果', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.obs = []; S.rct = [];
    for (var i = 0; i < NOBS; i++) {
      // skewed toward the upper right: the old policy targeted some users more
      var u = Math.pow(r(), 0.45), v = Math.pow(r(), 0.45);
      S.obs.push(el('circle', { cx: 90 + u * 290, cy: 420 - v * 290, r: 5, fill: C.a }, F));
    }
    for (var k = 0; k < NRCT; k++) {
      S.rct.push(el('circle', { cx: 450 + r() * 120, cy: 130 + r() * 290, r: 6, fill: C.b }, F));
    }
    S.cross = el('g', {}, F);
    el('line', { x1: 110, y1: 150, x2: 360, y2: 400, stroke: C.ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, S.cross);
    el('line', { x1: 360, y1: 150, x2: 110, y2: 400, stroke: C.ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, S.cross);

    // scene 1 right column
    var g0 = S.g[0];
    t2(g0, 690, 150, 'Marketing Data I の学習用', '', { 'font-size': 16, fill: C.muted });
    t2(g0, 690, 200, '観察 22,201,405 件', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(g0, 690, 250, 'RCT 2,220,781 件', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(g0, 690, 300, '観察：偏りが大きく分散が小さい', '', { 'font-size': 16, fill: C.ink });
    t2(g0, 690, 328, 'RCT：偏りがなく分散が大きい', '', { 'font-size': 16, fill: C.ink });
    t2(g0, 690, 390, '件数は論文 Table 1。点は模式図', '', { 'font-size': 14, fill: C.muted });

    // scene 2 right column: decision loss box fed only by RCT
    var g1 = S.g[1];
    el('rect', { x: 690, y: 230, width: 240, height: 70, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g1);
    t2(g1, 810, 262, '決定損失', '', { 'font-size': 20, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    t2(g1, 810, 288, '予算内の配分の質', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 595, y1: 265, x2: 684, y2: 265, stroke: C.b, 'stroke-width': 3 }, g1);
    el('path', { d: 'M684,257 L696,265 L684,273 z', fill: C.b }, g1);
    t2(g1, 690, 150, 'DHCL・DFCL', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(g1, 690, 182, '反実仮想が見えないので', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 690, 206, '不偏に測れるのは RCT だけ', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 690, 350, '少ないデータだけで学ぶため', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 690, 374, '過学習しやすい', '', { 'font-size': 16, fill: C.ink });

    // ---------- scene 3: bi-level + gate on a number line ----------
    var g2 = S.g[2];
    el('rect', { x: 70, y: 90, width: 520, height: 64, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g2);
    t2(g2, 90, 129, '上位：RCT データの決定損失でブリッジ φ を更新', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    el('rect', { x: 70, y: 230, width: 520, height: 64, rx: 12, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, g2);
    t2(g2, 90, 269, '下位：観察データの予測損失でターゲット θ を更新', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    el('path', { d: 'M230,158 V222', stroke: C.b, 'stroke-width': 3, fill: 'none' }, g2);
    el('path', { d: 'M222,214 L230,226 L238,214 z', fill: C.b }, g2);
    t2(g2, 244, 198, '重み w', '', { 'font-size': 16, fill: C.b });
    el('path', { d: 'M430,226 V162', stroke: C.muted, 'stroke-width': 3, fill: 'none' }, g2);
    el('path', { d: 'M422,170 L430,158 L438,170 z', fill: C.muted }, g2);
    t2(g2, 444, 198, '解 θ*(φ)', '', { 'font-size': 16, fill: C.muted });
    // number line
    var y0 = 400, xa = 120, xb = 540;
    S.xa = xa; S.xb = xb;
    el('line', { x1: 90, y1: y0, x2: 570, y2: y0, stroke: C.hair, 'stroke-width': 3 }, g2);
    el('circle', { cx: xa, cy: y0, r: 9, fill: C.a }, g2);
    el('circle', { cx: xb, cy: y0, r: 9, fill: C.b }, g2);
    t2(g2, xa, y0 + 36, 'ターゲットの予測', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    t2(g2, xb, y0 + 36, '教師（RCT）の予測', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    S.pl = el('g', {}, g2);
    el('path', { d: 'M-10,-34 H10 V-18 L0,-8 L-10,-18 z', fill: C.ink }, S.pl);
    el('circle', { cx: 0, cy: 0, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 3 }, S.pl);
    S.plLab = t2(S.pl, 0, -44, '疑似ラベル', '', { 'font-size': 15, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 70, 500, '模式図：観測されていない施策の売上（コストも同じ）', '', { 'font-size': 14, fill: C.muted });
    // right column
    t2(g2, 690, 150, '疑似ラベル', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(g2, 690, 188, 'w·教師 ＋ (1−w)·ターゲット', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 690, 250, 'w', '', { 'font-size': 18, fill: C.ink, class: 'mi' });
    S.wTxt = el('text', { x: 712, y: 250, 'font-size': 18, 'font-weight': 650, fill: C.b }, g2);
    el('rect', { x: 690, y: 266, width: 240, height: 10, rx: 5, fill: C.panel }, g2);
    S.wBar = el('rect', { x: 690, y: 266, width: 0, height: 10, rx: 5, fill: C.b }, g2);
    t2(g2, 690, 330, 'w は個人と施策の組ごとに', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 690, 354, 'ブリッジが出す', '', { 'font-size': 16, fill: C.ink });

    // ---------- scene 4: online A/B (Table 4) ----------
    var g3 = S.g[3];
    var rows = [['LTD-DR', 0.91, 0], ['DFCL-PIFD', 1.80, 0], ['Bi-DFCL-PPL', 3.00, 1], ['Bi-DFCL-PIFD', 3.22, 1]];
    S.bars = [];
    var bx = 250, bwMax = 300, top = 140;
    el('line', { x1: bx, y1: top - 20, x2: bx, y2: top + 4 * 72 - 10, stroke: C.muted, 'stroke-width': 1.5 }, g3);
    rows.forEach(function (rw, i) {
      var y = top + i * 72;
      el('text', { x: bx - 14, y: y + 30, 'font-size': 18, 'text-anchor': 'end', fill: rw[2] ? C.ink : C.muted, 'font-weight': rw[2] ? 650 : 400 }, g3).textContent = rw[0];
      var b = el('rect', { x: bx, y: y + 10, width: 0, height: 30, rx: 4, fill: rw[2] ? C.ink : C.gray }, g3);
      var v = el('text', { x: bx, y: y + 32, 'font-size': 18, 'font-weight': 650, fill: rw[2] ? C.ink : C.muted }, g3);
      v.textContent = '+' + rw[1].toFixed(2) + '%';
      S.bars.push({ b: b, v: v, w: bwMax * rw[1] / 3.5 });
    });
    t2(g3, bx, top + 4 * 72 + 22, 'TSM-SL に対する注文数の改善率（4週間）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 690, 150, '美団の割引施策', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(g3, 690, 186, '79万店舗を毎日5群に分割', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 690, 212, '割引率 0〜20% の5段階', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 690, 238, '予算は日ごとにわずかに変わる', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 690, 300, '数値は論文 Table 4', '', { 'font-size': 14, fill: C.muted });

    // ---------- scene 5: title card ----------
    var g4 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g4).textContent = 'NEURIPS 2025';
    ['Bi-Level Decision-Focused Causal Learning', 'for Large-Scale Marketing Optimization:', 'Bridging Observational and Experimental Data'].forEach(function (s, i) {
      el('text', { x: 480, y: 210 + i * 42, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g4).textContent = s;
    });
    el('text', { x: 480, y: 370, 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = 'Shuli Zhang, Hao Zhou, Jiaqi Zheng, Guibin Jiang, Bing Cheng, Wei Lin, Guihai Chen';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = 'arXiv:2510.19517';
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // shared field for scenes 1–2
    S.fieldG.setAttribute('opacity', seg(t, 0, 0.6) * (1 - seg(t, 15.4, 16)));
    S.obs.forEach(function (c, i) {
      var on = seg(t, 0.4 + 2.6 * i / NOBS, 0.7 + 2.6 * i / NOBS);
      var grey = seg(t, 9, 10.5);
      c.setAttribute('opacity', on * (1 - 0.65 * grey));
      c.setAttribute('fill', mix(C.a, C.gray, grey));
    });
    S.rct.forEach(function (c, i) {
      c.setAttribute('opacity', seg(t, 3.2 + 1.6 * i / NRCT, 3.5 + 1.6 * i / NRCT));
    });
    S.cross.setAttribute('opacity', seg(t, 10.5, 11.3));
    // scene 3: w sweeps 0 -> 1 -> 0.35
    var w = 0.9 * seg(t, 17.5, 20.5) - 0.55 * seg(t, 21, 23);
    w = Math.max(0, Math.min(1, w));
    var x = S.xa + (S.xb - S.xa) * w;
    S.pl.setAttribute('transform', 'translate(' + x.toFixed(1) + ',400)');
    S.wTxt.textContent = '= ' + w.toFixed(2);
    S.wBar.setAttribute('width', (240 * w).toFixed(1));
    // scene 4: bars in order
    S.bars.forEach(function (o, i) {
      var k = seg(t, 25 + i * 1.4, 26 + i * 1.4);
      o.b.setAttribute('width', (o.w * k).toFixed(1));
      o.v.setAttribute('x', (250 + o.w * k + 10).toFixed(1));
      o.v.setAttribute('opacity', seg(t, 25.8 + i * 1.4, 26.2 + i * 1.4));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
