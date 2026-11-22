// =====================================================================
// teaser-scenes.js — Arno et al., ICML 2026 (Rank-learner). Player: teaser-engine.js (unchanged).
// Orange = estimate effect magnitudes first and rank by them (CATE / plug-in); blue = Rank-learner.
// Scenes 1-2 are schematics with made-up values; scene 3 plots the paper's formulas
// t = sigma(d/kappa), omega = t(1-t)/kappa; scene 4 uses the means of Table 3 (synthetic AUTOC).
// render() is a pure function of t, so scene jumps and ?teaser_t= work.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, clamp = H.clamp;
  var GREY = '#8A94A3';

  var CAPTIONS = [
    { ja: '<span class="A">従来のやり方</span>では、人ごとに効果の大きさを推定してから、その値で並べる', en: '' },
    { ja: '順位に要るのは大小関係だけだが、推定の誤差は効果の近いペアの順序を入れ替えてしまう', en: '' },
    { ja: '<span class="B">Rank-learner</span> はペアごとに擬似ラベルを作り、順序が曖昧なペアほど強く補正する', en: '' },
    { ja: '合成データでは、学習データが少ない範囲で <span class="B">Rank-learner</span> と他の方法の差が大きかった', en: '' },
    { ja: '効果の大きさではなく順位を、局外関数の推定誤差に強い形で直接学習する', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  function txt(g, x, y, s, a) {
    var o = { x: x, y: y, 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' };
    for (var k in a) o[k] = a[k];
    var e = el('text', o, g); e.innerHTML = s; return e;
  }
  function col(g, lines) {   // right-hand explanation column
    lines.forEach(function (l) { t2(g, 690, l[0], l[1], '', l[2]); });
  }
  function person(g, cx, cy, fill) {
    var p = el('g', {}, g);
    el('circle', { cx: cx, cy: cy - 14, r: 9, fill: fill }, p);
    el('path', { d: 'M' + (cx - 14) + ',' + (cy + 12) + ' Q' + cx + ',' + (cy - 12) + ' ' + (cx + 14) + ',' + (cy + 12) + ' Z', fill: fill }, p);
    return p;
  }
  function sig(z) { return 1 / (1 + Math.exp(-z)); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ---- scene 1: estimate magnitudes, then sort (toy values) ----
    var g = S.g[0];
    S.v1 = [0.45, 0.85, 0.30, 0.70, 0.55, 0.20];               // made-up estimates
    var order = S.v1.map(function (v, i) { return i; }).sort(function (a, b) { return S.v1[b] - S.v1[a]; });
    S.rank1 = []; order.forEach(function (i, r) { S.rank1[i] = r; });
    S.p1 = []; S.b1 = []; S.l1 = [];
    'ABCDEF'.split('').forEach(function (ch, i) {
      var gi = el('g', {}, g);
      person(gi, 0, 400, C.gray);
      txt(gi, 0, 440, ch, { 'font-size': 18, fill: C.muted });
      S.b1.push(el('rect', { x: -20, y: 370, width: 40, height: 0, rx: 4, fill: C.a }, gi));
      S.l1.push(txt(gi, 0, 360, '', { 'font-size': 15, fill: C.a }));
      S.p1.push(gi);
    });
    S.s1lab = txt(g, 330, 110, '推定した効果 <tspan ' + MI + '>τ̂</tspan>(<tspan ' + MI + '>x</tspan>)', { 'font-size': 20, fill: C.a });
    S.s1sort = txt(g, 330, 480, '大きい順に並べ替え →', { 'font-size': 18, fill: C.a });
    col(g, [[150, '従来のやり方', { 'font-size': 26, 'font-weight': 700, fill: C.a }],
            [200, '人ごとに効果の大きさを', { 'font-size': 19, fill: C.ink }],
            [230, '推定し、その値で並べる。', { 'font-size': 19, fill: C.ink }],
            [290, '学習の目標は', { 'font-size': 19, fill: C.muted }],
            [320, '<tspan ' + MI + '>g</tspan>(<tspan ' + MI + '>x</tspan>) = <tspan ' + MI + '>τ</tspan>(<tspan ' + MI + '>x</tspan>) そのもの。', { 'font-size': 19, fill: C.muted }]]);
    t2(g, 70, 520, '模式図（値は仮のもの）', '', { 'font-size': 15, fill: C.muted });

    // ---- scene 2: estimation error flips a close pair (toy values) ----
    g = S.g[1];
    var base = 400, sc = 300;
    S.s2 = { base: base, sc: sc, tA: 0.62, tB: 0.55, eA: 0.47, eB: 0.68 };
    [['A', 210], ['B', 410]].forEach(function (p, k) {
      person(g, p[1], 460, C.gray);
      txt(g, p[1], 505, p[0], { 'font-size': 20, fill: C.muted });
    });
    S.trueA = el('rect', { x: 150, y: base - 0.62 * sc, width: 50, height: 0.62 * sc, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    S.trueB = el('rect', { x: 350, y: base - 0.55 * sc, width: 50, height: 0.55 * sc, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    S.estA = el('rect', { x: 215, width: 50, rx: 3, fill: C.a }, g);
    S.estB = el('rect', { x: 415, width: 50, rx: 3, fill: C.a }, g);
    el('line', { x1: 110, y1: base, x2: 520, y2: base, stroke: C.muted, 'stroke-width': 1.5 }, g);
    txt(g, 140, 80, '破線：真の効果 <tspan ' + MI + '>τ</tspan>　　', { 'font-size': 17, fill: C.ink, 'text-anchor': 'start' });
    txt(g, 330, 80, '塗り：推定値 <tspan ' + MI + '>τ̂</tspan>', { 'font-size': 17, fill: C.a, 'text-anchor': 'start' });
    S.flip = el('g', {}, g);
    txt(S.flip, 330, 130, '順序が逆になる', { 'font-size': 24, 'font-weight': 700, fill: C.a });
    col(g, [[150, '順位に要るのは', { 'font-size': 22, 'font-weight': 700, fill: C.ink }],
            [182, '大小関係だけ', { 'font-size': 22, 'font-weight': 700, fill: C.ink }],
            [240, '真の効果：A > B', { 'font-size': 19, fill: C.ink }],
            [272, '推定値　：A < B', { 'font-size': 19, fill: C.a }],
            [330, '局外関数の推定誤差が', { 'font-size': 18, fill: C.muted }],
            [358, '学習の教師に入り込む。', { 'font-size': 18, fill: C.muted }]]);
    t2(g, 70, 530, '模式図（値は仮のもの）', '', { 'font-size': 15, fill: C.muted });

    // ---- scene 3: soft target and correction weight vs kappa (paper's formulas) ----
    g = S.g[2];
    var P = S.p3 = { X0: 90, X1: 590, Y0: 420, Y1: 110, D: 3 };
    [0, 0.5, 1].forEach(function (v) {
      var y = P.Y0 - v * (P.Y0 - P.Y1);
      el('line', { x1: P.X0, y1: y, x2: P.X1, y2: y, stroke: '#E6E9EE' }, g);
      txt(g, P.X0 - 10, y + 5, String(v), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
      txt(g, P.X1 + 10, y + 5, v.toFixed(1), { 'font-size': 15, fill: C.b, 'text-anchor': 'start' });
    });
    [-3, 0, 3].forEach(function (d) {
      txt(g, P.X0 + (d + 3) / 6 * (P.X1 - P.X0), P.Y0 + 24, String(d), { 'font-size': 15, fill: C.muted });
    });
    txt(g, (P.X0 + P.X1) / 2, P.Y0 + 52, '効果の差 <tspan ' + MI + '>τ</tspan>(<tspan ' + MI + '>x</tspan>) − <tspan ' + MI + '>τ</tspan>(<tspan ' + MI + '>x′</tspan>)', { 'font-size': 17, fill: C.muted });
    txt(g, P.X0 - 10, P.Y1 - 20, 'ソフトな教師 <tspan ' + MI + '>t</tspan>', { 'font-size': 16, fill: GREY, 'text-anchor': 'start' });
    txt(g, P.X1 + 10, P.Y1 - 20, '補正の重み <tspan ' + MI + '>ω</tspan>', { 'font-size': 16, fill: C.b, 'text-anchor': 'end' });
    S.w3 = el('path', { fill: C.b, 'fill-opacity': 0.13, stroke: C.b, 'stroke-width': 3 }, g);
    S.t3 = el('path', { fill: 'none', stroke: GREY, 'stroke-width': 2.5 }, g);
    col(g, [[150, 'Rank-learner', { 'font-size': 26, 'font-weight': 700, fill: C.b }],
            [200, '<tspan ' + MI + '>t̃</tspan> = <tspan ' + MI + '>t</tspan> + <tspan ' + MI + '>ω</tspan>·<tspan ' + MI + '>Δ</tspan>', { 'font-size': 24, fill: C.b }],
            [240, '<tspan ' + MI + '>Δ</tspan>：二重頑健スコアの差', { 'font-size': 17, fill: C.muted }],
            [380, '差が0に近いペアほど', { 'font-size': 18, fill: C.ink }],
            [408, '補正が強くかかる。', { 'font-size': 18, fill: C.ink }]]);
    S.k3 = t2(g, 690, 300, '', '', { 'font-size': 21, fill: C.ink });
    S.m3 = t2(g, 690, 334, '', '', { 'font-size': 18, fill: C.b });
    t2(g, 70, 530, '論文の式から作図（データではない）', '', { 'font-size': 15, fill: C.muted });

    // ---- scene 4: Table 3 means (synthetic AUTOC) ----
    g = S.g[3];
    var Q = S.p4 = { X0: 110, X1: 560, Y0: 440, Y1: 90, lo: 0.6, hi: 1.45 };
    function qy(v) { return Q.Y0 - (v - Q.lo) / (Q.hi - Q.lo) * (Q.Y0 - Q.Y1); }
    function qx(i) { return Q.X0 + i * (Q.X1 - Q.X0) / 4; }
    S.qx = qx; S.qy = qy;
    [0.6, 0.8, 1.0, 1.2, 1.4].forEach(function (v) {
      el('line', { x1: Q.X0, y1: qy(v), x2: Q.X1, y2: qy(v), stroke: '#E6E9EE' }, g);
      txt(g, Q.X0 - 10, qy(v) + 5, v.toFixed(1), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    });
    ['100', '250', '500', '1,000', '2,000'].forEach(function (s, i) { txt(g, qx(i), Q.Y0 + 26, s, { 'font-size': 15, fill: C.muted }); });
    txt(g, (Q.X0 + Q.X1) / 2, Q.Y0 + 54, '学習データの大きさ <tspan ' + MI + '>n</tspan>', { 'font-size': 17, fill: C.muted });
    txt(g, Q.X0 - 10, Q.Y1 - 22, 'AUTOC', { 'font-size': 16, fill: C.muted, 'text-anchor': 'start' });
    el('line', { x1: Q.X0, y1: qy(1.40), x2: Q.X1, y2: qy(1.40), stroke: C.ink, 'stroke-dasharray': '4 4' }, g);
    txt(g, Q.X1 + 8, qy(1.40) + 5, 'oracle', { 'font-size': 15, fill: C.ink, 'text-anchor': 'start' });
    S.series = [
      { v: [0.88, 0.96, 1.24, 1.32, 1.36], c: GREY, w: 2, dash: '6 4' },
      { v: [0.80, 1.16, 1.28, 1.33, 1.36], c: GREY, w: 2, dash: '2 4' },
      { v: [0.69, 0.95, 1.24, 1.31, 1.36], c: C.a, w: 3, dash: '' },
      { v: [1.00, 1.28, 1.31, 1.34, 1.37], c: C.b, w: 3.5, dash: '' }
    ];
    S.series.forEach(function (s) {
      s.line = el('polyline', { fill: 'none', stroke: s.c, 'stroke-width': s.w, 'stroke-dasharray': s.dash }, g);
      s.dots = s.v.map(function (v, i) { return el('circle', { cx: qx(i), cy: qy(v), r: 5, fill: s.c }, g); });
    });
    col(g, [[140, '<tspan ' + MI + '>n</tspan> = 100 での AUTOC', { 'font-size': 21, 'font-weight': 700, fill: C.ink }],
            [325, 'oracle', { 'font-size': 19, fill: C.ink }],
            [390, '平均（5つのシード）。', { 'font-size': 16, fill: C.muted }],
            [416, '論文 Table 3 の数値', { 'font-size': 16, fill: C.muted }]]);

    [['Rank-learner', '1.00', C.b, 700], ['T-learner', '0.88', C.muted, 400], ['DR-learner', '0.80', C.muted, 400],
     ['プラグイン順位学習器', '0.69', C.a, 400]].forEach(function (r, k) {
      t2(g, 690, 185 + k * 35, r[0], '', { 'font-size': 18, fill: r[2], 'font-weight': r[3] });
      t2(g, 945, 185 + k * 35, r[1], '', { 'font-size': 19, fill: r[2], 'font-weight': r[3], 'text-anchor': 'end' });
    });
    t2(g, 945, 325, '1.40', '', { 'font-size': 19, fill: C.ink, 'text-anchor': 'end' });

    // ---- scene 5: title card ----
    g = S.g[4];
    el('text', { x: 480, y: 170, 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = 'ICML 2026';
    el('text', { x: 480, y: 235, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'Rank-Learner: Orthogonal Ranking';
    el('text', { x: 480, y: 285, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'of Treatment Effects';
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'Henri Arno, Dennis Frauen, Emil Javurek, Thomas Demeester, Stefan Feuerriegel';
    el('text', { x: 480, y: 395, 'font-size': 16, fill: C.b, 'text-anchor': 'middle' }, g).textContent = 'github.com/henriarnoUG/rank-learner';
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1: bars grow, then people move into rank order
    var grow = seg(t, 0.6, 2.8), sort = seg(t, 3.8, 6.0);
    S.p1.forEach(function (gi, i) {
      var x = 110 + (i + (S.rank1[i] - i) * sort) * 86;
      gi.setAttribute('transform', 'translate(' + x + ',0)');
      var h = S.v1[i] * 220 * grow;
      S.b1[i].setAttribute('y', 370 - h); S.b1[i].setAttribute('height', h);
      S.l1[i].setAttribute('y', 362 - h);
      S.l1[i].textContent = grow > 0.98 ? S.v1[i].toFixed(2) : '';
    });
    S.s1sort.setAttribute('opacity', seg(t, 3.2, 3.8));

    // scene 2: estimates drift away from the truth and flip the order
    var e = seg(t, 9.4, 12.0), P = S.s2;
    var hA = P.sc * (P.tA + (P.eA - P.tA) * e), hB = P.sc * (P.tB + (P.eB - P.tB) * e);
    S.estA.setAttribute('y', P.base - hA); S.estA.setAttribute('height', hA);
    S.estB.setAttribute('y', P.base - hB); S.estB.setAttribute('height', hB);
    S.flip.setAttribute('opacity', seg(t, 12.4, 13.0));

    // scene 3: kappa sweeps 3 -> 0.25 on a log scale
    var Q = S.p3, s = seg(t, 17.0, 22.0);
    var k = Math.exp(Math.log(3) + (Math.log(0.25) - Math.log(3)) * s);
    var pt = [], pw = [];
    for (var i = 0; i <= 200; i++) {
      var d = -Q.D + 2 * Q.D * i / 200, tt = sig(d / k), w = tt * (1 - tt) / k;
      var x = Q.X0 + i / 200 * (Q.X1 - Q.X0);
      pt.push((i ? 'L' : 'M') + x.toFixed(1) + ',' + (Q.Y0 - tt * (Q.Y0 - Q.Y1)).toFixed(1));
      pw.push('L' + x.toFixed(1) + ',' + (Q.Y0 - Math.min(w, 1) * (Q.Y0 - Q.Y1)).toFixed(1));
    }
    S.t3.setAttribute('d', pt.join(''));
    S.w3.setAttribute('d', 'M' + Q.X0 + ',' + Q.Y0 + pw.join('') + 'L' + Q.X1 + ',' + Q.Y0 + 'Z');
    S.k3.querySelector('[data-l="ja"]').innerHTML = '<tspan ' + MI + '>κ</tspan> = ' + k.toFixed(2);
    S.m3.querySelector('[data-l="ja"]').innerHTML = '<tspan ' + MI + '>ω</tspan> の最大 = 1/(4<tspan ' + MI + '>κ</tspan>) = ' + (1 / (4 * k)).toFixed(2);

    // scene 4: points appear n by n
    var reveal = 4 * seg(t, 25.0, 30.0);
    S.series.forEach(function (sr) {
      var pts = [];
      for (var j = 0; j < 5; j++) {
        var on = clamp(reveal - j + 1);
        sr.dots[j].setAttribute('opacity', on);
        if (j <= Math.floor(reveal)) pts.push(S.qx(j).toFixed(1) + ',' + S.qy(sr.v[j]).toFixed(1));
      }
      var f = reveal - Math.floor(reveal), j0 = Math.floor(reveal);
      if (j0 < 4 && f > 0) {
        var xa = S.qx(j0) + (S.qx(j0 + 1) - S.qx(j0)) * f, ya = S.qy(sr.v[j0]) + (S.qy(sr.v[j0 + 1]) - S.qy(sr.v[j0])) * f;
        pts.push(xa.toFixed(1) + ',' + ya.toFixed(1));
      }
      sr.line.setAttribute('points', pts.join(' '));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
