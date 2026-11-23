// =====================================================================
// teaser-scenes.js — Kitagawa & Tetenov (Econometrica 2018), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics: the effect curve tau(x), its linear fit and the welfare curve are toy values
// chosen by the explainer (labelled 模式図). Scene 4 uses the numbers printed in Table I (published version).
// Colours: orange = plug-in rule (regress, then treat where the estimate is positive);
//          blue = EWM (maximise sample welfare over the class of rules).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'よく使われるのは、回帰で処置効果を推定し、<span class="A">推定値が正の人に処置する</span>やり方である。', en: '' },
    { ja: '回帰式が外れていると効果が負の人まで処置してしまい、標本を増やしても直るとは限らない。', en: '' },
    { ja: '<span class="B">EWM</span> は候補のルールを順に当てはめ、標本で測った厚生が最大のルールを選ぶ。', en: '' },
    { ja: 'JTPA データで費用を差し引くと、<span class="B">EWM</span> は 69% に処置して 792 ドル、<span class="A">回帰のルール</span>は 86% で 527 ドルだった。', en: '' },
    { ja: '効果を推定してから決めるのではなく、最大にしたい厚生を候補ルールの中で直接最大にする。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- toy effect curve on x in [0,1] (explainer's example) ----
  function tau(x) {
    if (x < 0.4) return 2.6 - 0.8 * x;
    if (x < 0.5) return 2.28 + (-1.2 - 2.28) * (x - 0.4) / 0.1;
    return -1.2 + 0.6 * (x - 0.5);
  }
  var N = 200, xs = [], ts = [];
  for (var i = 0; i <= N; i++) { xs.push(i / N); ts.push(tau(i / N)); }
  // least-squares line fitted to tau over a uniform x: the "plug-in" estimate
  var mx = 0.5, mt = ts.reduce(function (s, v) { return s + v; }, 0) / ts.length;
  var sxy = 0, sxx = 0;
  xs.forEach(function (x, k) { sxy += (x - mx) * (ts[k] - mt); sxx += (x - mx) * (x - mx); });
  var B1 = sxy / sxx, B0 = mt - B1 * mx, XPLUG = -B0 / B1;          // ~0.60
  // welfare of the rule "treat if x <= t" relative to treating nobody
  var Wc = [0]; for (i = 1; i <= N; i++) Wc.push(Wc[i - 1] + ts[i] / N);
  var XZERO = 0.4 + 0.1 * 2.28 / 3.48;   // where tau crosses zero
  var kBest = Wc.indexOf(Math.max.apply(null, Wc)), XBEST = xs[kBest];   // ~0.465

  // shared axes for scenes 1-3
  var AX0 = 90, AX1 = 590;
  function sx(x) { return AX0 + x * (AX1 - AX0); }
  function axes(g, top, zero, bottom, ylab) {
    el('line', { x1: AX0, x2: AX1, y1: zero, y2: zero, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: AX0, x2: AX0, y1: bottom, y2: top, stroke: C.ink, 'stroke-width': 1.5 }, g);
    t2(g, AX0 + 10, top + 4, ylab, '', { 'font-size': 16, fill: C.ink });
  }
  function poly(f, sy, x0, x1) {
    var p = [];
    for (var k = 0; k <= N; k++) { var x = x0 + (x1 - x0) * k / N; p.push(sx(x).toFixed(1) + ',' + sy(f(x)).toFixed(1)); }
    return p.join(' ');
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: plug-in — fit a line, treat where the fit is positive =====
    var g1 = S.g[0];
    function sy1(v) { return 260 - v / 3.5 * 190; }   // tau in [-1.5, 3.5]
    axes(g1, 60, sy1(0), sy1(-1.6), '↑ 推定した効果 ' + m('τ̂') + '(' + m('x') + ')');
    t2(g1, AX1, sy1(0) + 132, '特徴量 ' + m('x') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    var r = H.rng(5); S.dots1 = [];
    for (i = 0; i < 40; i++) {
      var x = r(), v = tau(x) + (r() - 0.5) * 1.6;
      S.dots1.push(el('circle', { cx: sx(x), cy: sy1(v), r: 6, fill: C.gray }, g1));
    }
    S.fit1 = el('line', { x1: sx(0), y1: sy1(B0), x2: sx(1), y2: sy1(B0 + B1), stroke: C.a, 'stroke-width': 3.5 }, g1);
    S.zone1 = el('rect', { x: sx(0), y: sy1(0) + 10, width: sx(XPLUG) - sx(0), height: 16, rx: 4, fill: C.a }, g1);
    S.zlab1 = t2(g1, sx(XPLUG / 2), sy1(0) + 50, '処置する（' + m('τ̂') + ' ≥ 0）', '', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '1. 回帰で効果を推定', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    txt(p1, PX + 20, 162, m('τ̂') + '(' + m('x') + ') = ' + m('m̂') + '₁(' + m('x') + ') − ' + m('m̂') + '₀(' + m('x') + ')', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 220, '2. 推定値が正の人に処置', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 280, '決めたいのは「誰に処置するか」', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 304, 'だが、間に効果の推定が入る。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（点と直線は架空の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: misspecified fit vs the true effect =====
    var g2 = S.g[1];
    var sy2 = sy1;
    axes(g2, 60, sy2(0), sy2(-1.6), '↑ 処置効果');
    t2(g2, AX1, sy2(0) + 132, '特徴量 ' + m('x') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    el('line', { x1: sx(0), y1: sy2(B0), x2: sx(1), y2: sy2(B0 + B1), stroke: C.a, 'stroke-width': 3, 'stroke-dasharray': '8 6' }, g2);
    S.harm2 = el('polygon', { points: sx(XZERO) + "," + sy2(0) + " " + poly(tau, sy2, XZERO, XPLUG) + ' ' + sx(XPLUG) + ',' + sy2(0), fill: C.a, 'fill-opacity': 0.25 }, g2);
    S.true2 = el('polyline', { points: poly(tau, sy2, 0, 1), fill: 'none', stroke: C.ink, 'stroke-width': 3.5 }, g2);
    S.true2len = 1400;
    S.true2.setAttribute('stroke-dasharray', S.true2len);
    t2(g2, sx(0.2), sy2(2.44) - 16, '真の効果 ' + m('τ') + '(' + m('x') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(g2, sx(0.62), sy2(B0 + B1 * 0.62) - 40, '回帰の直線', '', { 'font-size': 16, fill: C.a });
    S.hlab2 = t2(g2, sx((XZERO + XPLUG) / 2), sy2(0) + 100, '効果が負なのに処置', '', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '実際のルールは単純な形', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 150, '（しきい値・資格スコア）', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 200, '回帰式が外れていると、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '標本が大きくなっても', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 252, '候補の中で最良のルールに', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 278, '近づくとは限らない。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（効果の曲線は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: EWM — sweep the threshold, maximise sample welfare =====
    var g3 = S.g[2];
    function sy3(v) { return 200 - v / 3.5 * 130; }
    axes(g3, 50, sy3(0), sy3(-1.5), '↑ 処置効果');
    S.true3 = el('polyline', { points: poly(tau, sy3, 0, 1), fill: 'none', stroke: C.gray, 'stroke-width': 3 }, g3);
    var WMAX = 1.15;
    function syw(w) { return 480 - w / WMAX * 140; }
    el('line', { x1: AX0, x2: AX1, y1: syw(0), y2: syw(0), stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: syw(0), y2: syw(WMAX), stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX0 + 10, syw(WMAX) - 4, '↑ 標本の厚生 ' + m('W') + '<tspan baseline-shift="sub" font-size="12">n</tspan>', '', { 'font-size': 16, fill: C.ink });
    t2(g3, AX1, syw(0) + 26, 'しきい値 ' + m('t') + '（' + m('x') + ' ≤ ' + m('t') + ' なら処置）→', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    var wn = H.rng(9), Wn = Wc.map(function (w, k) { return k ? w + (wn() - 0.5) * 0.05 : 0; });
    S.Wn = Wn;
    S.wcurve = el('polyline', { points: '', fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
    S.tline = el('line', { x1: 0, x2: 0, y1: 60, y2: syw(0), stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g3);
    S.shade3 = el('rect', { x: sx(0), y: sy3(0) + 6, width: 0, height: 14, rx: 4, fill: C.b }, g3);
    S.best3 = el('circle', { cx: sx(XBEST), cy: syw(Wn[kBest]), r: 9, fill: C.b }, g3);
    S.blab3 = t2(g3, sx(XBEST) + 16, syw(0) - 22, '最大 → このルールを選ぶ', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, 'arg max ' + m('W') + '<tspan baseline-shift="sub" font-size="16">n</tspan>(' + m('G') + ')', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 152, m('G') + ' は候補ルールの集合 𝒢 の中', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 210, '厚生は逆確率重みの', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 236, '標本平均で測る。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 286, '効果のモデルは当てはめない。', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 340, '傾向スコア既知なら損失は', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 364, m('n') + '<tspan baseline-shift="super" font-size="11">−1/2</tspan> で縮み、これが最速。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（効果と厚生の曲線は架空の例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table I (Econometrica 2018), outcome = 30-month earnings minus $774 per assigned treatment =====
    var g4 = S.g[3];
    var rows = [
      ['全員を処置', C.gray, 1, 404],
      ['EWM 象限ルール', C.b, 0.8, 643],
      ['EWM 線形ルール', C.b, 0.69, 792],
      ['EWM 線形（教育 3 次）', C.b, 0.75, 897],
      ['線形回帰プラグイン', C.a, 0.86, 527],
      ['同（教育 3 次）', C.a, 0.91, 547],
      ['ノンパラ・プラグイン', C.a, 0.78, 996]
    ];
    var X0 = 270, Y0 = 108, DY = 52, SC = 250 / 1000;
    t2(g4, 70, 58, '1 人あたりの厚生の増分（ドル）と処置率、費用 774 ドル込み', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0, x2: X0, y1: Y0 - 26, y2: Y0 + DY * 6 + 24, stroke: C.ink }, g4);
    S.rows4 = rows.map(function (rw, k) {
      var y = Y0 + DY * k, o = {};
      t2(g4, X0 - 14, y + 6, rw[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: X0, y: y - 13, width: 0, height: 26, rx: 4, fill: rw[1] }, g4);
      o.w = rw[3] * SC;
      o.lab = el('text', { x: X0 + o.w + 8, y: y + 6, 'font-size': 15, fill: C.ink }, g4);
      o.lab.textContent = '$' + rw[3] + '（' + Math.round(rw[2] * 100) + '%）';
      o.t0 = 25 + k * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, '線形のルール同士で比べると', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 168, '69%', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 82, 168, '・ $792', '', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 194, 'EWM 線形ルール', '', { 'font-size': 15, fill: C.ink });
    txt(p4, PX, 248, '86%', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(p4, PX + 82, 248, '・ $527', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 274, '線形回帰プラグイン', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 326, '最高はノンパラ・プラグインだが、', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 348, '区切りがまだらで実施しにくい。', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 380, '9,223 人、無作為化実験', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table I（Econometrica 掲載版）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ECONOMETRICA · 2018';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Who Should Be Treated? Empirical Welfare';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Maximization Methods for Treatment Choice';
    t2(g5, 480, 302, '誰を処置すべきか：経験厚生最大化による処置ルールの選択', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Toru Kitagawa · Aleksey Tetenov';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.3982/ECTA13288';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.sx = sx; S.syw = syw; S.sy3 = sy3;
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots, then fitted line, then the treated zone
    S.dots1.forEach(function (d, k) { d.setAttribute('opacity', seg(t, 0.6 + k * 0.03, 1.1 + k * 0.03)); });
    S.fit1.setAttribute('opacity', seg(t, 2.4, 3.2));
    S.zone1.setAttribute('opacity', seg(t, 4, 4.6));
    S.zlab1.setAttribute('opacity', seg(t, 4.3, 4.9));
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: the true curve draws, then the harmful region lights up
    S.true2.setAttribute('stroke-dashoffset', S.true2len * (1 - seg(t, 9, 11.5)));
    S.harm2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.hlab2.setAttribute('opacity', seg(t, 12.2, 12.8));
    S.p2.setAttribute('opacity', seg(t, 9.5, 10.3));
    // scene 3: threshold sweeps 0 -> 1 and the welfare curve follows; then the maximum
    var k = seg(t, 17, 21), kk = Math.round(k * (S.Wn.length - 1)), pts = [];
    for (var j = 0; j <= kk; j++) pts.push(S.sx(j / (S.Wn.length - 1)).toFixed(1) + ',' + S.syw(S.Wn[j]).toFixed(1));
    S.wcurve.setAttribute('points', pts.join(' '));
    var tt = t < 21.3 ? k : k + (XBEST - 1) * seg(t, 21.3, 22.3);
    S.tline.setAttribute('x1', S.sx(tt)); S.tline.setAttribute('x2', S.sx(tt));
    S.shade3.setAttribute('width', S.sx(tt) - S.sx(0));
    S.best3.setAttribute('opacity', seg(t, 21.3, 21.9));
    S.blab3.setAttribute('opacity', seg(t, 21.8, 22.4));
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: bars grow in order, then the comparison
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.w * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 29.2, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
