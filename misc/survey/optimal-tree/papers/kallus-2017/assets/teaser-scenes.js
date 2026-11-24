// =====================================================================
// teaser-scenes.js — Kallus, "Recursive Partitioning for Personalization using Observational Data"
// (ICML 2017, PMLR 70), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 use a schematic toy data set (24 people, 1 covariate, 2 treatments; labelled 模式図).
// Scene 4 uses only numbers stated in the text of Section 4.1 (n needed to reach risk < 0.4 and <= 0.36,
// tree depths at n = 2500).
// Colours: orange = regress and compare (R&C); blue = direct personalization (impurity, PT / PF / OPT).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '標準的な方法は<span class="A">処置ごとに結果を回帰して予測を比べる</span>（R&amp;C）。', en: '' },
    { ja: 'R&amp;C はデータを処置の数だけ分け、どの処置が最良かを知るのに要らない結果の曲線まで学ぶ。', en: '' },
    { ja: '論文は<span class="B">葉ごとに最良の処置を選ぶ木</span>を、個別化の不純度が小さくなるように分割して学ぶ。', en: '' },
    { ja: 'Warfarin の実験で、直接の方法はリスク 0.4 未満に n = 200 で届き、OLS とロジスティック回帰の R&amp;C は n = 1,300 を要した。', en: '' },
    { ja: '個別化を1つの学習問題として解く方法で、論文は2つの応用で効果と解釈しやすさの利点を示した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- toy data: x in (0,1); treatment 1 is better (smaller outcome) for small x, treatment 2 for large x
  var rnd = H.rng(7), DATA = [];
  for (var i = 0; i < 24; i++) {
    var x = (i + 0.5) / 24, t = (i % 2 === 0) ? 1 : 2;
    if (rnd() < 0.25) t = 3 - t;
    var y = (t === 1 ? 0.22 + 0.55 * x : 0.78 - 0.5 * x) + (rnd() - 0.5) * 0.16;
    DATA.push({ x: x, t: t, y: y });
  }
  function impurity(pts) {
    var best = Infinity, k = pts.length;
    [1, 2].forEach(function (t) {
      var s = pts.filter(function (p) { return p.t === t; });
      if (s.length) best = Math.min(best, k * s.reduce(function (a, p) { return a + p.y; }, 0) / s.length);
    });
    return best;
  }
  function count(pts, t) { return pts.filter(function (p) { return p.t === t; }).length; }
  function splitI(s) {
    var L = DATA.filter(function (p) { return p.x <= s; }), R = DATA.filter(function (p) { return p.x > s; });
    if (Math.min(count(L, 1), count(L, 2), count(R, 1), count(R, 2)) < 2) return null;
    return { I: impurity(L) + impurity(R), L: L, R: R };
  }
  var ROOT_I = impurity(DATA), BEST_S = 0.5, BEST_I = Infinity;
  for (var j = 1; j < 24; j++) { var s0 = j / 24, r0 = splitI(s0); if (r0 && r0.I < BEST_I) { BEST_I = r0.I; BEST_S = s0; } }
  function leafBest(pts) {
    var m1 = pts.filter(function (p) { return p.t === 1; }), m2 = pts.filter(function (p) { return p.t === 2; });
    var a = m1.reduce(function (s, p) { return s + p.y; }, 0) / m1.length, b = m2.reduce(function (s, p) { return s + p.y; }, 0) / m2.length;
    return a <= b ? 1 : 2;
  }
  function ols(pts) {
    var n = pts.length, mx = 0, my = 0; pts.forEach(function (p) { mx += p.x / n; my += p.y / n; });
    var sxy = 0, sxx = 0; pts.forEach(function (p) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) * (p.x - mx); });
    var b = sxy / sxx; return { a: my - b * mx, b: b };
  }
  var FIT1 = ols(DATA.filter(function (p) { return p.t === 1; })), FIT2 = ols(DATA.filter(function (p) { return p.t === 2; }));
  var CROSS = (FIT2.a - FIT1.a) / (FIT1.b - FIT2.b);

  // plot frame: x0..x1 on screen, outcome 0..1 mapped to y 430..130
  function frame(g, x0, x1, title) {
    el('line', { x1: x0, x2: x1, y1: 430, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: x0, x2: x0, y1: 120, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g);
    if (title) t2(g, x0, 104, title, '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    return { X: function (v) { return x0 + 10 + v * (x1 - x0 - 20); }, Y: function (v) { return 430 - v * 300; } };
  }
  function marker(g, p, F) {
    if (p.t === 1) return el('circle', { cx: F.X(p.x), cy: F.Y(p.y), r: 7, fill: C.ink }, g);
    return el('rect', { x: F.X(p.x) - 6.5, y: F.Y(p.y) - 6.5, width: 13, height: 13, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
  }
  function legend(g, y) {
    el('circle', { cx: 78, cy: y - 5, r: 7, fill: C.ink }, g);
    t2(g, 92, y, '処置 1', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: 165, y: y - 11.5, width: 13, height: 13, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
    t2(g, 186, y, '処置 2', '', { 'font-size': 15, fill: C.ink });
    t2(g, 262, y, '縦軸：結果（小さいほど良い）', '', { 'font-size': 15, fill: C.muted });
  }
  function line(g, F, fit, x0, x1, attrs) {
    return el('line', Object.assign({ x1: F.X(x0), x2: F.X(x1), y1: F.Y(fit.a + fit.b * x0), y2: F.Y(fit.a + fit.b * x1) }, attrs), g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: R&C, one regression per treatment =====
    var g1 = S.g[0];
    var F1 = frame(g1, 70, 310, '処置 1 を受けた人'), F2 = frame(g1, 350, 590, '処置 2 を受けた人');
    DATA.forEach(function (p) { marker(g1, p, p.t === 1 ? F1 : F2); });
    S.l1 = line(g1, F1, FIT1, 0, 1, { stroke: C.a, 'stroke-width': 4 });
    S.l2 = line(g1, F2, FIT2, 0, 1, { stroke: C.a, 'stroke-width': 4 });
    legend(g1, 470);
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 120, '回帰して比べる（R&amp;C）', '', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    t2(S.p1, PX, 166, '1. 受けた処置でデータを分ける', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 198, '2. それぞれ結果を回帰する', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 230, '3. 予測が最小の処置を選ぶ', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（データは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: what R&C learns vs what is needed =====
    var g2 = S.g[1];
    var F = frame(g2, 70, 590, '2 本の回帰を重ねる');
    S.l2a = line(g2, F, FIT1, 0, 1, { stroke: C.a, 'stroke-width': 4 });
    S.l2b = line(g2, F, FIT2, 0, 1, { stroke: C.a, 'stroke-width': 4, 'stroke-dasharray': '10 6' });
    t2(g2, F.X(0.02), F.Y(FIT1.a) + 24, '処置 1 の回帰', '', { 'font-size': 15, fill: C.a });
    t2(g2, F.X(0.02), F.Y(FIT2.a) - 12, '処置 2 の回帰（破線）', '', { 'font-size': 15, fill: C.a });
    S.cross = el('g', {}, g2);
    el('line', { x1: F.X(CROSS), x2: F.X(CROSS), y1: 130, y2: 430, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '4 5' }, S.cross);
    t2(S.cross, F.X(CROSS) - 10, 462, '← 処置 1 が良い', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    t2(S.cross, F.X(CROSS) + 10, 462, '処置 2 が良い →', '', { 'font-size': 15, fill: C.ink });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 120, '各回帰が使えるのは', '', { 'font-size': 16, fill: C.ink });
    txt(S.p2, PX, 178, m('n') + ' / ' + m('m'), { 'font-size': 48, 'font-weight': 650, fill: C.a });
    t2(S.p2, PX, 212, '件ほど（' + m('m') + '：処置の数）', '', { 'font-size': 16, fill: C.ink });
    S.p2b = el('g', {}, g2);
    t2(S.p2b, PX, 270, '学ぶのは結果の曲線 ' + m('m') + ' 本', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2b, PX, 300, '要るのはどの処置が', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2b, PX, 326, '最小かだけ', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（データは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: split the whole data by the personalization impurity =====
    var g3 = S.g[2];
    var G = frame(g3, 70, 590, 'データを分けずに使い、木で分割する');
    S.G = G;
    S.leafL = el('rect', { x: 71, y: 120, width: 0, height: 309, fill: C.bsoft, opacity: 0 }, g3);
    S.leafR = el('rect', { x: 0, y: 120, width: 0, height: 309, fill: C.bsoft, opacity: 0 }, g3);
    DATA.forEach(function (p) { marker(g3, p, G); });
    S.sp = el('line', { x1: 0, x2: 0, y1: 120, y2: 430, stroke: C.b, 'stroke-width': 3 }, g3);
    S.spLab = txt(g3, 0, 140, m('x') + ' ≤ ' + m('θ') + ' ?', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.lab3 = el('g', {}, g3);
    var bL = leafBest(DATA.filter(function (p) { return p.x <= BEST_S; })), bR = leafBest(DATA.filter(function (p) { return p.x > BEST_S; }));
    t2(S.lab3, (G.X(0) + G.X(BEST_S)) / 2, 466, '葉：処置 ' + bL + ' を処方', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    t2(S.lab3, (G.X(BEST_S) + G.X(1)) / 2, 466, '葉：処置 ' + bR + ' を処方', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 110, '個別化の不純度', '', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    t2(S.p3, PX, 142, '葉の人数 × 最良の処置の', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 166, '平均結果', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 214, '2 つの葉の和', '', { 'font-size': 16, fill: C.muted });
    S.iTxt = txt(S.p3, PX, 266, '', { 'font-size': 44, 'font-weight': 650, fill: C.b });
    S.iRoot = el('g', {}, g3);
    t2(S.iRoot, PX, 306, '分けない場合：' + ROOT_I.toFixed(2), '', { 'font-size': 16, fill: C.muted });
    t2(S.p3, PX, 360, 'PT はこれを貪欲に、OPT は', '', { 'font-size': 15, fill: C.ink });
    t2(S.p3, PX, 384, 'MIP で木全体について最小化', '', { 'font-size': 15, fill: C.ink });
    t2(g3, 940, 520, '模式図（データは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Warfarin, Section 4.1 text =====
    var g4 = S.g[3];
    var BX0 = 270, BX1 = 580, MAXN = 1400;
    function bx(v) { return BX0 + v / MAXN * (BX1 - BX0); }
    t2(g4, 70, 90, 'Warfarin：リスク 0.4 未満に届く標本サイズ ' + m('n'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 500, 1000].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: 120, y2: 330, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: 354, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toLocaleString('en-US');
    });
    var rows = [['直接の方法', '（PT・PF・OPT）', 200, C.b], ['R&amp;C', '（OLS・ロジスティック回帰）', 1300, C.a]];
    S.rows4 = rows.map(function (rw, i) {
      var y = 170 + i * 110, o = {};
      t2(g4, BX0 - 14, y - 2, rw[0], '', { 'font-size': 17, 'font-weight': 600, fill: rw[3], 'text-anchor': 'end' });
      t2(g4, BX0 - 14, y + 22, rw[1], '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      o.bar = el('rect', { x: BX0, y: y - 22, width: 0, height: 40, rx: 3, fill: rw[3] }, g4);
      o.lab = el('text', { x: bx(rw[2]) + 10, y: y + 6, 'font-size': 20, 'font-weight': 650, fill: C.ink }, g4);
      o.lab.innerHTML = m('n') + ' = ' + rw[2].toLocaleString('en-US');
      o.full = bx(rw[2]) - BX0; o.t0 = 25 + i * 1.2;
      return o;
    });
    S.n700 = el('g', {}, g4);
    t2(S.n700, 70, 410, '直接の方法は ' + m('n') + ' = 700 で 0.36 以下（ほぼ最適）に届いた', '', { 'font-size': 16, fill: C.ink });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 130, '木の深さ（' + m('n') + ' = 2,500）', '', { 'font-size': 16, fill: C.muted });
    t2(S.p4, PX, 186, 'OPT 2〜3', '', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 232, 'PT 9〜13', '', { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    t2(S.p4, PX, 280, 'OPT は小さい ' + m('n') + ' で PT を', '', { 'font-size': 15, fill: C.ink });
    t2(S.p4, PX, 304, '上回り、大きい ' + m('n') + ' では MIP が', '', { 'font-size': 15, fill: C.ink });
    t2(S.p4, PX, 328, '大きすぎて改善しにくい', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 4.1 節の本文の数値（PMLR 版）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ICML 2017 · PMLR 70';
    el('text', { x: 480, y: 214, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Recursive Partitioning for Personalization';
    el('text', { x: 480, y: 260, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'using Observational Data';
    t2(g5, 480, 304, '観察データを使った個別化のための再帰的分割', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nathan Kallus';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'proceedings.mlr.press/v70/kallus17a.html · arXiv:1608.08925';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    S.l1.setAttribute('opacity', seg(t, 2.5, 3.3));
    S.l2.setAttribute('opacity', seg(t, 3.5, 4.3));
    // scene 2
    S.cross.setAttribute('opacity', seg(t, 10.5, 11.3));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    S.p2b.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: the split sweeps from 0.2 and settles on the best split
    var G = S.G, s;
    if (t < 20.2) s = lerp(0.2, 0.8, seg(t, 18, 19.4)); else s = BEST_S;
    if (t >= 19.4 && t < 20.2) s = lerp(0.8, BEST_S, seg(t, 19.4, 20.2));
    var r = splitI(s), sx = G.X(s);
    S.sp.setAttribute('x1', sx); S.sp.setAttribute('x2', sx);
    S.sp.setAttribute('opacity', seg(t, 17.6, 18));
    S.spLab.setAttribute('x', sx + 8); S.spLab.setAttribute('opacity', seg(t, 17.6, 18));
    S.iTxt.textContent = (t < 18 ? ROOT_I : (r ? r.I : ROOT_I)).toFixed(2);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.iRoot.setAttribute('opacity', seg(t, 18.4, 19));
    var lk = seg(t, 20.6, 21.4), bx = G.X(BEST_S);
    S.leafL.setAttribute('width', bx - 71); S.leafL.setAttribute('opacity', lk * 0.9);
    S.leafR.setAttribute('x', bx); S.leafR.setAttribute('width', 589 - bx); S.leafR.setAttribute('opacity', lk * 0.9);
    S.lab3.setAttribute('opacity', seg(t, 21, 21.8));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 1));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.8, o.t0 + 1.2));
    });
    S.n700.setAttribute('opacity', seg(t, 28, 28.6));
    S.p4.setAttribute('opacity', seg(t, 29.3, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
