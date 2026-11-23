// =====================================================================
// teaser-scenes.js — RATE (Yadlowsky et al.). Player: teaser-engine.js (unchanged).
// Colours: blue = AUTOC (weight 1), orange = Qini coefficient (weight u).
// Scenes 1–3 are schematics: the TOC is the population TOC of the paper's Sec. 4
// simulation mean with p = 0.5 and the perfect rule S = 1 − X (TOC = 3 − 4u for u ≤ 0.5, 1/u − 1 after).
// Scene 4 uses the numbers of the paper's Table 5 (Criteo, visit) and the text of Sec. 7.
// render() is a pure function of t.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'RATE が見るのは、優先順位ルールが決める「誰から処置するか」の順位だけである', en: '' },
    { ja: 'TOC は、上位 u に絞ったときの平均処置効果が全体平均をどれだけ上回るかを表す', en: '' },
    { ja: 'RATE は TOC の重み付き面積で、重みが 1 なら <span class="B">AUTOC</span>、u なら <span class="A">Qini 係数</span>になる', en: '' },
    { ja: 'Criteo の訪問データでは、<span class="B">AUTOC</span> だけが CATE ルールとベースラインルールの差を捉えた', en: '' },
    { ja: '効果が少数に集中しそうなら <span class="B">AUTOC</span>、迷ったときも AUTOC から始めるよう論文は勧めている', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  // shared TOC chart geometry (scenes 2–3)
  var X0 = 90, X1 = 570, Y0 = 430, YS = 95;          // TOC = 3 -> y = 145
  function toc(u) { return u <= 0.5 ? 3 - 4 * u : 1 / u - 1; }
  function sx(u) { return X0 + u * (X1 - X0); }
  function sy(v) { return Y0 - v * YS; }
  function pathTo(f, uMax) {
    var d = '', N = 120;
    for (var i = 0; i <= N; i++) { var u = Math.max(1e-3, uMax * i / N); d += (i ? 'L' : 'M') + sx(u).toFixed(1) + ',' + sy(f(u)).toFixed(1); }
    return d;
  }
  function area(f, uMax) { return pathTo(f, uMax) + 'L' + sx(uMax).toFixed(1) + ',' + Y0 + 'L' + sx(0) + ',' + Y0 + 'Z'; }

  // scene 1: 12 people, sorted by the rule's score; effects (toy, not perfectly ordered)
  var EFF = [3.2, 2.6, 2.9, 1.9, 1.4, 1.7, 0.6, 0.9, 0.2, 0.4, 0.0, 0.1];

  // scene 4: Criteo visit (paper Table 5)
  var CR = [
    { m: 'AUTOC', r: 'ベースライン', e: 0.0136, lo: 0.0111, hi: 0.0161, c: C.b, f: false },
    { m: 'AUTOC', r: 'CATE', e: 0.0171, lo: 0.0148, hi: 0.0194, c: C.b, f: true },
    { m: 'Qini', r: 'ベースライン', e: 0.0059, lo: 0.0048, hi: 0.0069, c: C.a, f: false },
    { m: 'Qini', r: 'CATE', e: 0.0058, lo: 0.0049, hi: 0.0067, c: C.a, f: true }
  ];
  function cx(v) { return 250 + v / 0.02 * 330; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    S.chart = el('g', {}, svg);   // TOC chart shared by scenes 2 and 3

    // ---------- scene 1 ----------
    var g = S.g[0];
    t2(g, 70, 70, '模式図', '', { 'font-size': 14, fill: C.muted });
    el('line', { x1: 70, x2: 600, y1: 380, y2: 380, stroke: C.hair, 'stroke-width': 1.5 }, g);
    S.people = []; S.bars = [];
    for (var i = 0; i < 12; i++) {
      var x = 95 + i * 44;
      S.bars.push(el('rect', { x: x - 11, y: 380, width: 22, height: 0, rx: 3, fill: C.gray }, g));
      S.people.push(el('circle', { cx: x, cy: 410, r: 13, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g));
      el('text', { x: x, y: 415, 'font-size': 14, 'text-anchor': 'middle', fill: C.ink }, g).textContent = String(i + 1);
    }
    t2(g, 95, 455, 'スコア S(X) の高い順 →', '', { 'font-size': 16, fill: C.ink });
    t2(g, 330, 140, '棒：実際の処置効果（個人では観測できない）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.bracket = el('rect', { x: 74, y: 160, width: 0, height: 275, rx: 10, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g);
    S.blab = t2(g, 80, 182, '上位 u', '', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    t2(g, 690, 200, '並べ方は自由', '', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    t2(g, 690, 240, 'リスクスコア', '', { 'font-size': 17, fill: C.muted });
    t2(g, 690, 268, 'CATE 推定', '', { 'font-size': 17, fill: C.muted });
    t2(g, 690, 296, '手作りの規則', '', { 'font-size': 17, fill: C.muted });
    t2(g, 690, 350, '評価に使うのは順位だけ', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });

    // ---------- shared TOC chart ----------
    var ch = S.chart;
    t2(ch, 70, 70, '模式図（論文4節のシミュレーション設定、p = 0.5）', '', { 'font-size': 14, fill: C.muted });
    [0, 1, 2, 3].forEach(function (v) {
      el('line', { x1: X0, x2: X1, y1: sy(v), y2: sy(v), stroke: C.hair, 'stroke-width': v ? 1 : 1.5 }, ch);
      el('text', { x: X0 - 10, y: sy(v) + 5, 'font-size': 14, 'text-anchor': 'end', fill: C.muted }, ch).textContent = String(v);
    });
    [0, 0.5, 1].forEach(function (u) { el('text', { x: sx(u), y: Y0 + 24, 'font-size': 14, 'text-anchor': 'middle', fill: C.muted }, ch).textContent = String(u); });
    t2(ch, (X0 + X1) / 2, Y0 + 52, '上位の割合 u', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(ch, X0 - 10, 120, 'TOC(u)', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.areaB = el('path', { fill: C.b, 'fill-opacity': 0.16 }, ch);
    S.areaA = el('path', { fill: C.a, 'fill-opacity': 0.32 }, ch);
    S.curve = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 3 }, ch);
    S.curveA = el('path', { fill: 'none', stroke: C.a, 'stroke-width': 2.5 }, ch);
    S.dot = el('circle', { r: 7, fill: C.ink }, ch);
    S.vline = el('line', { stroke: C.muted, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }, ch);

    // ---------- scene 2: right column ----------
    g = S.g[1];
    t2(g, 690, 170, 'TOC(u) =', '', { 'font-size': 18, fill: C.ink, 'font-weight': 600 });
    t2(g, 690, 205, '上位 u の平均効果', '', { 'font-size': 17, fill: C.ink });
    t2(g, 690, 235, '− 全体の平均効果', '', { 'font-size': 17, fill: C.ink });
    S.uval = el('text', { x: 690, y: 300, 'font-size': 18, fill: C.muted }, g);
    S.tval = el('text', { x: 690, y: 330, 'font-size': 22, 'font-weight': 650, fill: C.ink }, g);
    t2(g, 690, 390, 'u = 1 では必ず 0', '', { 'font-size': 16, fill: C.muted });

    // ---------- scene 3: right column ----------
    g = S.g[2];
    t2(g, 690, 160, 'RATE = ∫ α(u) TOC(u) du', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.s3b = t2(g, 690, 220, 'AUTOC：α(u) = 1', '', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    S.s3b2 = t2(g, 690, 248, 'どの u も同じ重み', '', { 'font-size': 16, fill: C.b });
    S.s3a = t2(g, 690, 300, 'Qini 係数：α(u) = u', '', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    S.s3a2 = t2(g, 690, 328, '小さな u（上位の少数）を軽く扱う', '', { 'font-size': 16, fill: C.a });

    // ---------- scene 4 ----------
    g = S.g[3];
    t2(g, 70, 70, 'Criteo（訪問）、論文 Table 5', '', { 'font-size': 15, fill: C.muted });
    [0, 0.005, 0.01, 0.015, 0.02].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: 120, y2: 420, stroke: C.hair }, g);
      el('text', { x: cx(v), y: 445, 'font-size': 14, 'text-anchor': 'middle', fill: C.muted }, g).textContent = String(v);
    });
    S.cr = CR.map(function (r, i) {
      var y = 160 + i * 70 + (i >= 2 ? 20 : 0), gg = el('g', {}, g);
      t2(gg, 235, y + 5, r.m + ' · ' + r.r, '', { 'font-size': 15, fill: r.c, 'text-anchor': 'end' });
      el('line', { x1: cx(r.lo), x2: cx(r.hi), y1: y, y2: y, stroke: r.c, 'stroke-width': 3 }, gg);
      el('circle', { cx: cx(r.e), cy: y, r: 8, fill: r.f ? r.c : '#fff', stroke: r.c, 'stroke-width': 3 }, gg);
      el('text', { x: cx(r.hi) + 12, y: y + 5, 'font-size': 15, fill: C.muted }, gg).textContent = String(r.e);
      return gg;
    });
    t2(g, 250, 485, '点：推定値（白抜き＝ベースライン、塗り＝CATE）　線：95%信頼区間', '', { 'font-size': 14, fill: C.muted });
    S.s4a = el('g', {}, g);
    t2(S.s4a, 690, 190, 'AUTOC の差', '', { 'font-size': 17, fill: C.b, 'font-weight': 600 });
    t2(S.s4a, 690, 228, '0.0034', '', { 'font-size': 30, fill: C.b, 'font-weight': 650 });
    t2(S.s4a, 690, 258, '95%CI 0.0019–0.0049', '', { 'font-size': 15, fill: C.b });
    S.s4b = el('g', {}, g);
    t2(S.s4b, 690, 320, 'Qini 係数の差', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(S.s4b, 690, 350, '有意でない', '', { 'font-size': 20, fill: C.a, 'font-weight': 650 });
    t2(S.s4b, 690, 400, 'TOC の差は処置割合 10% までに集中', '', { 'font-size': 15, fill: C.muted });

    // ---------- scene 5 ----------
    g = S.g[4];
    t2(g, 480, 120, '効果が少数に集中 → AUTOC　／　広く分散 → Qini 係数', '', { 'font-size': 21, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 200, x2: 760, y1: 165, y2: 165, stroke: C.hair }, g);
    el('text', { x: 480, y: 225, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = 'JOURNAL OF THE AMERICAN STATISTICAL ASSOCIATION · 2025';
    el('text', { x: 480, y: 280, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'Evaluating Treatment Prioritization Rules';
    el('text', { x: 480, y: 320, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'via Rank-Weighted Average Treatment Effects';
    el('text', { x: 480, y: 370, 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'Yadlowsky, Fleming, Shah, Brunskill, Wager';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'arXiv:2111.07966 · R パッケージ grf の rank_average_treatment_effect';
    t2(g, 480, 470, '非公式の解説（西村直樹）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.chart.setAttribute('opacity', seg(t, 8, 8.6) * (1 - seg(t, 23.4, 24)));

    // scene 1: bars grow, bracket widens over the top people
    for (var i = 0; i < 12; i++) {
      var k = seg(t, 0.6 + i * 0.18, 1.4 + i * 0.18), h = EFF[i] * 60 * k;
      S.bars[i].setAttribute('y', 380 - h); S.bars[i].setAttribute('height', h);
    }
    var nb = 1 + Math.floor(5 * seg(t, 3.6, 7));
    S.bracket.setAttribute('width', seg(t, 3.2, 3.6) * (nb * 44 + 6));
    S.blab.setAttribute('opacity', seg(t, 3.4, 3.8));
    for (i = 0; i < 12; i++) S.bars[i].setAttribute('fill', i < nb && t > 3.2 ? C.ink : C.gray);

    // scene 2: u sweeps 1 -> 0, curve drawn from the right
    var s2 = seg(t, 8.8, 14.5), u = 1 - s2 * 0.999;
    var d = '', N = 120;
    for (var j = 0; j <= N; j++) { var uu = 1 - (1 - u) * j / N; d += (j ? 'L' : 'M') + sx(uu).toFixed(1) + ',' + sy(toc(uu)).toFixed(1); }
    if (t >= 16) d = pathTo(toc, 1);
    S.curve.setAttribute('d', d);
    var showDot = t < 16 ? 1 : 0;
    S.dot.setAttribute('cx', sx(u)); S.dot.setAttribute('cy', sy(toc(u))); S.dot.setAttribute('opacity', showDot);
    S.vline.setAttribute('x1', sx(u)); S.vline.setAttribute('x2', sx(u)); S.vline.setAttribute('y1', Y0); S.vline.setAttribute('y2', sy(toc(u))); S.vline.setAttribute('opacity', showDot);
    S.uval.textContent = 'u = ' + u.toFixed(2);
    S.tval.textContent = 'TOC = ' + toc(u).toFixed(2);

    // scene 3: blue area (AUTOC), then orange (Qini integrand u·TOC)
    var kb = seg(t, 16.6, 19), ka = seg(t, 19.5, 22.5);
    S.areaB.setAttribute('d', area(toc, Math.max(1e-3, kb))); S.areaB.setAttribute('opacity', t >= 16 ? 1 : 0);
    var fa = function (x) { return x * toc(x); };
    S.areaA.setAttribute('d', area(fa, Math.max(1e-3, ka))); S.areaA.setAttribute('opacity', t >= 19.5 ? 1 : 0);
    S.curveA.setAttribute('d', pathTo(fa, Math.max(1e-3, ka))); S.curveA.setAttribute('opacity', t >= 19.5 ? 1 : 0);
    S.s3b.setAttribute('opacity', seg(t, 16.6, 17.2)); S.s3b2.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.s3a.setAttribute('opacity', seg(t, 19.5, 20.1)); S.s3a2.setAttribute('opacity', seg(t, 19.5, 20.1));

    // scene 4: rows appear, then the two verdicts
    S.cr.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 24.6 + i * 0.9, 25.2 + i * 0.9)); });
    S.s4a.setAttribute('opacity', seg(t, 28.6, 29.2));
    S.s4b.setAttribute('opacity', seg(t, 30.2, 30.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
