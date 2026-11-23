// =====================================================================
// teaser-scenes.js — Zhou et al., AAAI 2023 (DRP / DPM). Player: teaser-engine.js (unchanged).
// Orange = two-phase methods (separate predictions, then divide); blue = direct learning of the decision factor.
// Scenes 1-3 are schematics with made-up values; scene 4 uses arXiv appendix Table 1 of the paper.
// render() is a pure function of t, so scene jumps and ?teaser_t= work.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, clamp = H.clamp;
  var SUP = function (s) { return '<tspan font-size="0.65em" dx="2" baseline-shift="super">' + s + '</tspan>'; };
  var TR = '<tspan ' + MI + '>τ</tspan>' + SUP('r'), TC = '<tspan ' + MI + '>τ</tspan>' + SUP('c');

  var CAPTIONS = [
    { ja: '<span class="A">二段階の方法</span>は、売上とコストの増分を別々に予測し、割り算してから ROI の順に並べる', en: '' },
    { ja: 'コストの増分が小さい人ほど、割り算で予測の誤差が大きく膨らむ', en: '' },
    { ja: '<span class="B">DRP</span> は ROI を1つのモデルで学習し、損失の最小点が <i>τ</i><sup style="margin-left:2px">r</sup>/<i>τ</i><sup style="margin-left:2px">c</sup> に一致する', en: '' },
    { ja: '論文の実験では、DRP と DPM が AUCC と MT-AUCC で比較手法を上回った', en: '' },
    { ja: '最適化が並べ替えに使う量を、そのまま学習の目標にする', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  function box(g, x, y, w, h, fill, stroke) {
    return el('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: fill, stroke: stroke, 'stroke-width': 2 }, g);
  }
  function txt(g, x, y, s, a) {
    var o = { x: x, y: y, 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' };
    for (var k in a) o[k] = a[k];
    var e = el('text', o, g); e.innerHTML = s; return e;
  }

  function build(svg) {
    var S = {};
    var defs = el('defs', {}, svg);
    [['tA', C.a], ['tB', C.b]].forEach(function (m) {
      var mk = el('marker', { id: m[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', fill: m[1] }, mk);
    });
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ---- scene 1: two-phase pipeline ----
    var g = S.g[0];
    S.s1 = [];
    var a1 = el('g', {}, g); box(a1, 60, 120, 230, 64, '#FCEBDF', C.a); txt(a1, 175, 160, '売上の増分を予測');
    var a2 = el('g', {}, g); box(a2, 60, 250, 230, 64, '#FCEBDF', C.a); txt(a2, 175, 290, 'コストの増分を予測');
    txt(a1, 175, 210, '（モデル1）', { 'font-size': 17, fill: C.muted });
    txt(a2, 175, 340, '（モデル2）', { 'font-size': 17, fill: C.muted });
    var a3 = el('g', {}, g);
    el('path', { d: 'M292,152 L368,206 M292,282 L368,228', stroke: C.a, 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#tA)' }, a3);
    el('circle', { cx: 410, cy: 217, r: 36, fill: '#fff', stroke: C.a, 'stroke-width': 2.5 }, a3);
    txt(a3, 410, 230, '÷', { 'font-size': 40, fill: C.a });
    var a4 = el('g', {}, g);
    el('path', { d: 'M448,217 L500,217', stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#tA)' }, a4);
    S.bars1 = [];
    var hs = [0.9, 0.72, 0.6, 0.45, 0.3];
    hs.forEach(function (v, k) {
      S.bars1.push(el('rect', { x: 512, y: 140 + k * 32, width: v * 130, height: 22, rx: 3, fill: C.a }, a4));
    });
    txt(a4, 577, 330, 'ROI の順に並べる', { 'font-size': 18, fill: C.a });
    S.s1 = [a1, a2, a3, a4];
    t2(g, 700, 170, '二段階の方法', '', { 'font-size': 26, 'font-weight': 700, fill: C.a });
    t2(g, 700, 215, 'モデルを2つ学習し、', '', { 'font-size': 19, fill: C.ink });
    t2(g, 700, 245, '予測を後から割り算する。', '', { 'font-size': 19, fill: C.ink });
    t2(g, 700, 300, '学習の目標と、割当てに', '', { 'font-size': 19, fill: C.muted });
    t2(g, 700, 330, '使う量が一致しない。', '', { 'font-size': 19, fill: C.muted });
    t2(g, 60, 420, '模式図', '', { 'font-size': 16, fill: C.muted });

    // ---- scene 2: division amplifies error when tau^c is small ----
    g = S.g[1];
    S.p2 = { X0: 90, X1: 600, Y0: 420, Y1: 90 };
    var P = S.p2;
    el('line', { x1: P.X0, y1: P.Y0, x2: P.X1, y2: P.Y0, stroke: C.muted, 'stroke-width': 1.5 }, g);
    el('line', { x1: P.X0, y1: P.Y0, x2: P.X0, y2: P.Y1 - 20, stroke: C.muted, 'stroke-width': 1.5 }, g);
    txt(g, P.X1, P.Y0 + 36, 'コストの増分 ' + TC, { 'font-size': 19, fill: C.muted, 'text-anchor': 'end' });
    txt(g, P.X0 + 10, P.Y1 - 30, 'ROI = ' + TR + ' / ' + TC, { 'font-size': 19, fill: C.muted, 'text-anchor': 'start' });
    S.band2 = el('path', { fill: C.a, 'fill-opacity': 0.18, stroke: 'none' }, g);
    S.curve2 = el('path', { fill: 'none', stroke: C.a, 'stroke-width': 3 }, g);
    // static curve and error band (toy values; see render for the moving marker)
    (function () {
      var tr = 0.010, del = 0.004, cmin = 0.008, cmax = 0.08;
      function x2(c) { return P.X0 + c / cmax * (P.X1 - P.X0); }
      function y2(v) { return P.Y0 - Math.min(v, 1.6) / 1.6 * (P.Y0 - P.Y1); }
      var d = '', up = '', dn = '';
      for (var k = 0; k <= 80; k++) {
        var c = cmin + (cmax - cmin) * k / 80;
        d += (k ? 'L' : 'M') + x2(c).toFixed(1) + ',' + y2(tr / c).toFixed(1);
      }
      S.curve2.setAttribute('d', d);
      var pts = [], pts2 = [];
      for (k = 0; k <= 80; k++) {
        c = cmin + del + (cmax - cmin - del) * k / 80;
        pts.push(x2(c).toFixed(1) + ',' + y2(tr / (c - del)).toFixed(1));
        pts2.unshift(x2(c).toFixed(1) + ',' + y2(tr / (c + del)).toFixed(1));
      }
      S.band2.setAttribute('d', 'M' + pts.join('L') + 'L' + pts2.join('L') + 'Z');
    })();
    S.vb2 = el('rect', { fill: C.a, 'fill-opacity': 0.12 }, g);
    S.err2 = el('line', { stroke: C.a, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    S.dot2 = el('circle', { r: 7, fill: C.a }, g);
    t2(g, 700, 150, '仮の値', '', { 'font-size': 17, fill: C.muted });
    t2(g, 700, 190, '売上の増分 = 0.010', '', { 'font-size': 19, fill: C.ink });
    S.t2c = el('text', { x: 700, y: 225, 'font-size': 19, fill: C.ink }, g);
    t2(g, 700, 253, '（予測の誤差 ±0.004）', '', { 'font-size': 17, fill: C.muted });
    S.t2w = el('text', { x: 700, y: 300, 'font-size': 19, fill: C.a, 'font-weight': 600 }, g);
    S.t2w2 = el('text', { x: 700, y: 334, 'font-size': 26, fill: C.a, 'font-weight': 700 }, g);
    t2(g, 700, 380, '同じ予測誤差でも、', '', { 'font-size': 18, fill: C.muted });
    t2(g, 700, 408, 'ROI の幅は大きく変わる', '', { 'font-size': 18, fill: C.muted });
    t2(g, 90, 480, '模式図（コストの増分の予測に ±0.004 の誤差があるとした場合）', '', { 'font-size': 16, fill: C.muted });

    // ---- scene 3: DRP loss minimum tracks tau^r / tau^c ----
    g = S.g[2];
    S.p3 = { X0: 90, X1: 600, Y0: 420, Y1: 100 };
    P = S.p3;
    el('line', { x1: P.X0, y1: P.Y0, x2: P.X1, y2: P.Y0, stroke: C.muted, 'stroke-width': 1.5 }, g);
    el('line', { x1: P.X0, y1: P.Y0, x2: P.X0, y2: P.Y1 - 20, stroke: C.muted, 'stroke-width': 1.5 }, g);
    [0, 0.5, 1].forEach(function (v) {
      txt(g, P.X0 + v * (P.X1 - P.X0), P.Y0 + 28, String(v), { 'font-size': 17, fill: C.muted });
    });
    txt(g, P.X1, P.Y0 + 58, '<tspan ' + MI + '>q</tspan> = σ(<tspan ' + MI + '>s</tspan>)', { 'font-size': 19, fill: C.muted, 'text-anchor': 'end' });
    txt(g, P.X0 + 10, P.Y1 - 30, 'DRP の損失（1人分）', { 'font-size': 19, fill: C.muted, 'text-anchor': 'start' });
    S.v3 = el('line', { stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 5', y1: P.Y1, y2: P.Y0 }, g);
    S.curve3 = el('path', { fill: 'none', stroke: C.b, 'stroke-width': 3.5 }, g);
    S.dot3 = el('circle', { r: 9, fill: C.b }, g);
    t2(g, 700, 150, '仮の値', '', { 'font-size': 17, fill: C.muted });
    S.t3r = el('text', { x: 700, y: 190, 'font-size': 20, fill: C.ink }, g);
    t2(g, 700, 222, 'コストの増分 = 0.050', '', { 'font-size': 20, fill: C.ink });
    S.t3q = el('text', { x: 700, y: 290, 'font-size': 26, fill: C.b, 'font-weight': 700 }, g);
    S.t3e = el('text', { x: 700, y: 326, 'font-size': 20, fill: C.b }, g);
    t2(g, 700, 390, '損失は凸で、最小点が', '', { 'font-size': 18, fill: C.muted });
    t2(g, 700, 418, 'ROI の推定値になる', '', { 'font-size': 18, fill: C.muted });

    // ---- scene 4: arXiv appendix Table 1 ----
    g = S.g[3];
    var groups = [
      { t: 'AUCC：CRITEO-UPLIFT v2', rows: [['TPM-SL', 0.7561, C.a], ['Direct Rank', 0.7562, '#8A94A3'], ['DRP', 0.7739, C.b]] },
      { t: 'AUCC：Marketing data', rows: [['TPM-SL', 0.7153, C.a], ['Direct Rank', 0.7414, '#8A94A3'], ['DRP', 0.7666, C.b]] },
      { t: 'MT-AUCC：Marketing data', rows: [['TPM-SL', 0.7250, C.a], ['TPM-CF', 0.7395, C.a], ['DPM', 0.7860, C.b]] }
    ];
    var X0 = 210, X1 = 600; S.X4 = function (v) { return X0 + (v - 0.70) / 0.10 * (X1 - X0); };
    S.bars4 = [];
    var axisY = 60 + 3 * 128 - 4;
    [0.70, 0.75, 0.80].forEach(function (v) {
      el('line', { x1: S.X4(v), y1: 70, x2: S.X4(v), y2: axisY, stroke: C.hair }, g);
      txt(g, S.X4(v), axisY + 24, v.toFixed(2), { 'font-size': 16, fill: C.muted });
    });
    groups.forEach(function (gr, gi) {
      var y0 = 60 + gi * 128;
      txt(g, 70, y0 + 20, gr.t, { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'start' });
      gr.rows.forEach(function (r, k) {
        var y = y0 + 34 + k * 30;
        var bold = r[2] === C.b;
        txt(g, X0 - 12, y + 19, r[0], { 'font-size': 17, 'text-anchor': 'end', fill: bold ? C.b : C.ink, 'font-weight': bold ? 700 : 400 });
        var rect = el('rect', { x: X0, y: y, height: 24, rx: 3, fill: r[2], width: 0 }, g);
        var lab = txt(g, 0, y + 19, r[1].toFixed(4), { 'font-size': 17, 'text-anchor': 'start', fill: bold ? C.b : C.ink, 'font-weight': bold ? 700 : 400 });
        S.bars4.push({ rect: rect, lab: lab, v: r[1], i: gi * 3 + k });
      });
    });
    t2(g, 700, 150, '論文の arXiv 版', '', { 'font-size': 18, fill: C.muted });
    t2(g, 700, 178, '付録 Table 1 の平均値', '', { 'font-size': 18, fill: C.muted });
    t2(g, 700, 230, '横軸は 0.70 から', '', { 'font-size': 18, fill: C.muted });
    t2(g, 700, 300, '青が論文の提案法', '', { 'font-size': 20, fill: C.b, 'font-weight': 700 });
    t2(g, 700, 332, '橙が二段階の方法', '', { 'font-size': 20, fill: C.a, 'font-weight': 700 });

    // ---- scene 5: title card ----
    g = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = 'AAAI 2023';
    el('text', { x: 480, y: 205, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'Direct Heterogeneous Causal Learning';
    el('text', { x: 480, y: 247, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'for Resource Allocation Problems in Marketing';
    el('text', { x: 480, y: 300, 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'Hao Zhou, Shaoming Li, Guibin Jiang, Jiaqi Zheng, Dong Wang';
    t2(g, 480, 370, 'ROI と限界 ROI を損失関数で直接学習する', '', { 'font-size': 22, fill: C.b, 'font-weight': 600, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 430, 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'arxiv.org/abs/2211.15728';
    t2(g, 480, 460, '（このアニメーションは解説者による非公式のもの）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1: build up the pipeline
    S.s1.forEach(function (g, k) { g.setAttribute('opacity', seg(t, 0.4 + k * 1.2, 1.2 + k * 1.2)); });
    S.bars1.forEach(function (r, k) { r.setAttribute('opacity', seg(t, 4.4 + k * 0.25, 4.8 + k * 0.25)); });

    // scene 2: marker slides toward small tau^c; the ROI interval widens
    var P = S.p2, tr = 0.010, del = 0.004, cmin = 0.008, cmax = 0.08;
    function x2(c) { return P.X0 + (c - 0) / cmax * (P.X1 - P.X0); }
    function y2(v) { return P.Y0 - Math.min(v, 1.6) / 1.6 * (P.Y0 - P.Y1); }
    var u = seg(t, 9.5, 14.5), cc = 0.07 + (0.016 - 0.07) * u;
    var lo = tr / (cc + del), hi = tr / (cc - del);
    S.dot2.setAttribute('cx', x2(cc)); S.dot2.setAttribute('cy', y2(tr / cc));
    S.err2.setAttribute('x1', x2(cc)); S.err2.setAttribute('x2', x2(cc));
    S.err2.setAttribute('y1', y2(lo)); S.err2.setAttribute('y2', y2(hi));
    S.vb2.setAttribute('x', x2(cc - del)); S.vb2.setAttribute('width', x2(cc + del) - x2(cc - del));
    S.vb2.setAttribute('y', P.Y1); S.vb2.setAttribute('height', P.Y0 - P.Y1);
    S.t2c.textContent = 'コストの増分 = ' + cc.toFixed(3);
    S.t2w.textContent = 'ROI の幅';
    S.t2w2.textContent = lo.toFixed(2) + ' 〜 ' + hi.toFixed(2);

    // scene 3: tau^r sweeps; the minimum follows tau^r / tau^c
    P = S.p3;
    var tc = 0.05, w = seg(t, 17, 20.5) - seg(t, 20.5, 23.3) * 0.6;
    var trr = 0.008 + (0.042 - 0.008) * w;
    var n = 90, ls = [], qs = [];
    for (var j = 0; j <= n; j++) {
      var q = 0.01 + 0.98 * j / n; qs.push(q);
      ls.push(-(trr * Math.log(q / (1 - q)) + tc * Math.log(1 - q)));
    }
    var mn = Math.min.apply(null, ls), span = 0.11, d3 = '';
    function y3(v) { v = (v - mn) / span; if (v > 1.05) v = 1.05; return P.Y0 - v * (P.Y0 - P.Y1); }
    qs.forEach(function (q, j) { d3 += (j ? 'L' : 'M') + (P.X0 + q * (P.X1 - P.X0)).toFixed(1) + ',' + y3(ls[j]).toFixed(1); });
    S.curve3.setAttribute('d', d3);
    var qs_ = trr / tc, xq = P.X0 + qs_ * (P.X1 - P.X0);
    S.v3.setAttribute('x1', xq); S.v3.setAttribute('x2', xq);
    S.dot3.setAttribute('cx', xq);
    S.dot3.setAttribute('cy', y3(-(trr * Math.log(qs_ / (1 - qs_)) + tc * Math.log(1 - qs_))));
    S.t3r.textContent = '売上の増分 = ' + trr.toFixed(3);
    S.t3q.textContent = '最小点 q = ' + qs_.toFixed(2);
    S.t3e.innerHTML = '= ' + TR + ' / ' + TC;

    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var k = seg(t, 25 + b.i * 0.45, 25.8 + b.i * 0.45);
      var wd = (S.X4(b.v) - S.X4(0.70)) * k;
      b.rect.setAttribute('width', wd);
      b.lab.setAttribute('x', S.X4(0.70) + wd + 8);
      b.lab.setAttribute('opacity', k);
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
