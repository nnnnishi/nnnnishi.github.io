// =====================================================================
// teaser-scenes.js — Zhou, Athey & Wager, "Offline Multi-Action Policy Learning: Generalization and
// Optimization" (Operations Research 2023; numbers from arXiv v2), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematic (explainer-chosen toy data, labelled 模式図).
// Scene 4 uses the average regrets of Table 2 (arXiv v2), rounded to 3 decimals.
// Colours: orange = IPW weighting (IPWL); blue = cross-fitted doubly robust scores + exact tree search.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'これまでの多値の方策学習は、<span class="A">観測した結果を傾向スコアの逆数で重みづけて（IPW）</span>方策の価値を見積もることが多かった。', en: '' },
    { ja: '傾向スコアを推定すると、その誤差が後悔に残る。推定の速さが n<sup>−1/4</sup> なら、後悔の上界も n<sup>−1/4</sup> でしか減らない。', en: '' },
    { ja: 'この論文は<span class="B">交差適合した二重頑健なスコアを行動ごとに作り、その和が最大の木を厳密に探す</span>。', en: '' },
    { ja: '3 つの行動のシミュレーションでは、n = 2,500 で後悔が 0.039 になり、IPW の 0.215 や貪欲法の 0.194 より小さかった。', en: '' },
    { ja: '傾向スコアが未知でも、仮定のもとで多値の方策学習の後悔は 1/√n の速さで小さくなり、木の方策なら厳密に最適化できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  var note = function (g, s) { t2(g, 940, 520, s, '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); };

  // ---- toy data for scenes 1 and 3: 16 people on a line (feature x), three actions ----
  // best action: 0 for the left 7 people, 2 for the right 9 people (explainer-chosen)
  var NP = 16, X0 = 80, XW = 500;
  function px(i) { return X0 + (i + 0.5) * XW / NP; }
  var R = H.rng ? H.rng(7) : Math.random;
  var PEOPLE = [];
  var OBS = [0, 1, 0, 2, 0, 1, 0, 2, 1, 2, 0, 2, 1, 2, 0, 1];   // observed actions (toy)
  for (var i = 0; i < NP; i++) {
    var left = i < 7;
    var g = [left ? 1.6 : 0.2, 0.8, left ? 0.1 : 1.5].map(function (v) { return v + (R() - 0.5) * 1.6; });
    PEOPLE.push({ a: OBS[i], g: g });
  }
  // value of the best depth-1 split after person k (left = 0..k-1)
  function leafBest(lo, hi) {
    var best = -1e9;
    for (var j = 0; j < 3; j++) { var s = 0; for (var q = lo; q < hi; q++) s += PEOPLE[q].g[j]; if (s > best) best = s; }
    return best;
  }
  var SPLITV = [];
  for (var k = 1; k < NP; k++) SPLITV.push(leafBest(0, k) + leafBest(k, NP));
  var KBEST = 1 + SPLITV.indexOf(Math.max.apply(null, SPLITV));
  var VMIN = Math.min.apply(null, SPLITV), VMAX = Math.max.apply(null, SPLITV);

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: IPW weighting =====
    var g1 = S.g[0];
    t2(g1, 70, 80, '方策 π が選ぶ行動と、観測した行動', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.c1 = [];
    PEOPLE.forEach(function (p, i) {
      var pol = i < 7 ? 0 : 2, match = p.a === pol;
      var y = 250;
      var c = el('circle', { cx: px(i), cy: y, r: 9, fill: C.gray }, g1);
      el('text', { x: px(i), y: y + 5, 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' }, g1).textContent = p.a;
      S.c1.push({ c: c, match: match, r: match ? 14.5 : 9 });
    });
    t2(g1, 70, 210, '観測した行動（数字）', '', { 'font-size': 15, fill: C.muted });
    el('line', { x1: X0, x2: X0 + XW, y1: 330, y2: 330, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, X0, 360, 'π = 行動 0', '', { 'font-size': 15, fill: C.ink });
    t2(g1, X0 + XW, 360, 'π = 行動 2', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    el('line', { x1: px(6.5), x2: px(6.5), y1: 160, y2: 340, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, g1);
    t2(g1, 70, 420, '一致した人だけを、1/ê の大きさで数える', '', { 'font-size': 16, fill: C.a });
    S.p1 = el('g', {}, g1);
    txt(S.p1, PX, 130, 'IPW', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX, 180, '一致した人の結果を', '', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 208, '1 / ' + m('ê') + '(' + m('x') + ') 倍して平均', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 260, 'まれな行動ほど', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 286, '重みが大きく揺れやすい', '', { 'font-size': 17, fill: C.ink });
    note(g1, '模式図（データは解説者が置いた例）');

    // ===== scene 2: slow regret with estimated propensities =====
    var g2 = S.g[1];
    var AX = 100, AY = 420, AW = 470, AH = 300;
    el('line', { x1: AX, x2: AX + AW, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX, x2: AX, y1: AY, y2: AY - AH, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX + AW, AY + 34, 'データの大きさ ' + m('n') + ' →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g2, AX - 10, AY - AH - 16, '後悔の上界', '', { 'font-size': 15, fill: C.muted });
    function curve(pw) {
      var pts = [];
      for (var q = 0; q <= 60; q++) { var n = 1 + q * 4; pts.push((AX + q / 60 * AW).toFixed(1) + ',' + (AY - AH * 0.95 * Math.pow(n, -pw)).toFixed(1)); }
      return pts.join(' ');
    }
    S.cA = el('polyline', { points: curve(0.25), fill: 'none', stroke: C.a, 'stroke-width': 4, 'stroke-dasharray': 1200, 'stroke-dashoffset': 1200 }, g2);
    S.cAl = txt(g2, AX + AW - 10, AY - AH * 0.95 * Math.pow(241, -0.25) - 14, m('n') + '<tspan dy="-8" font-size="13">−1/4</tspan>', { 'font-size': 20, fill: C.a, 'text-anchor': 'end' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 120, '局外関数の推定が', '', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 176, m('n') + '<tspan dy="-16" font-size="26">−1/4</tspan>', { 'font-size': 52, 'font-weight': 650, fill: C.a });
    t2(S.p2, PX, 230, 'なら、IPW の後悔も', '', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 258, m('n') + '<tspan dy="-7" font-size="12">−1/4</tspan><tspan dy="7"> でしか減らない</tspan>', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 320, '二値なら 1/√' + m('n') + ' の方法が', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 344, 'あったが、多値にはなかった', '', { 'font-size': 16, fill: C.muted });
    note(g2, '模式図（曲線の形は解説者による）');

    // ===== scene 3: doubly robust scores + exact split search =====
    var g3 = S.g[2];
    t2(g3, 70, 70, '各人のスコア（行動 0・1・2 の 3 本）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var BY = 190;
    PEOPLE.forEach(function (p, i) {
      p.g.forEach(function (v, j) {
        var h = v * 26, x = px(i) - 10 + j * 7;
        el('rect', { x: x, y: h >= 0 ? BY - h : BY, width: 6, height: Math.abs(h), fill: j === 1 ? C.gray : (j === 0 ? '#93A9E8' : C.b) }, g3);
      });
    });
    el('line', { x1: X0, x2: X0 + XW, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1 }, g3);
    S.sl = el('line', { x1: 0, x2: 0, y1: 90, y2: 440, stroke: C.b, 'stroke-width': 3 }, g3);
    // value of each split
    var VY0 = 440, VH = 140;
    function vy(v) { return VY0 - (v - VMIN) / (VMAX - VMIN + 1e-9) * VH; }
    t2(g3, 70, VY0 - VH - 26, '分割点ごとの「左の最大＋右の最大」', '', { 'font-size': 15, fill: C.muted });
    el('line', { x1: X0, x2: X0 + XW, y1: VY0 + 4, y2: VY0 + 4, stroke: C.hair }, g3);
    S.vd = SPLITV.map(function (v, k) { return el('circle', { cx: (px(k) + px(k + 1)) / 2, cy: vy(v), r: 6, fill: C.b, opacity: 0 }, g3); });
    S.best = el('circle', { cx: (px(KBEST - 1) + px(KBEST)) / 2, cy: vy(VMAX), r: 12, fill: 'none', stroke: C.b, 'stroke-width': 3, opacity: 0 }, g3);
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 110, m('Γ̂') + '<tspan dy="6" font-size="14">' + m('i') + '</tspan><tspan dy="-6"> = </tspan>' + m('μ̂') + ' ＋ 補正', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 146, '交差適合で推定（K フォールド）', '', { 'font-size': 15, fill: C.muted });
    t2(S.p3, PX, 200, '分割点をすべて試し、', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 226, '左右を再帰的に解いて', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 252, '和が最大の木を選ぶ', '', { 'font-size': 17, fill: C.ink });
    S.p3b = el('g', {}, g3);
    t2(S.p3b, PX, 320, '与えられたスコアのもとで', '', { 'font-size': 16, fill: C.b });
    t2(S.p3b, PX, 344, '厳密に最適な木', '', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    note(g3, '模式図（スコアは解説者が置いた例、深さ 1 の分岐のみ）');

    // ===== scene 4: Table 2 (arXiv v2) =====
    var g4 = S.g[3];
    var NS = [1000, 1500, 2000, 2500];
    var SER = [
      { lab: 'IPW と厳密な探索', v: [0.212, 0.228, 0.217, 0.215], c: C.a, w: 4, dash: '' },
      { lab: '二重頑健と貪欲法', v: [0.492, 0.327, 0.248, 0.194], c: '#8A94A3', w: 3, dash: '8 6' },
      { lab: 'CAIPWL と厳密な探索', v: [0.128, 0.077, 0.053, 0.039], c: C.b, w: 4, dash: '' }
    ];
    var CX0 = 110, CX1 = 560, CY0 = 440, CH = 320, VM = 0.5;
    function cx(i) { return CX0 + i / 3 * (CX1 - CX0); }
    function cy(v) { return CY0 - v / VM * CH; }
    t2(g4, 70, 70, '平均の後悔（400 回）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (v) {
      el('line', { x1: CX0, x2: CX1, y1: cy(v), y2: cy(v), stroke: C.hair }, g4);
      el('text', { x: CX0 - 12, y: cy(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = v.toFixed(1);
    });
    NS.forEach(function (n, i) {
      el('text', { x: cx(i), y: CY0 + 28, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = n.toLocaleString('en-US');
    });
    t2(g4, CX1, CY0 + 56, m('n'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.ser = SER.map(function (s, k) {
      var o = { pts: [], segs: [] };
      for (var i = 0; i < 3; i++) o.segs.push(el('line', { x1: cx(i), y1: cy(s.v[i]), x2: cx(i), y2: cy(s.v[i]), stroke: s.c, 'stroke-width': s.w, 'stroke-dasharray': s.dash }, g4));
      s.v.forEach(function (v, i) { o.pts.push(el('circle', { cx: cx(i), cy: cy(v), r: 6, fill: s.c, opacity: 0 }, g4)); });
      o.s = s; o.t0 = 25 + k * 1.6;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 110, 'n = 2,500 のとき', '', { 'font-size': 16, fill: C.muted });
    [['CAIPWL・厳密', '0.039', C.b], ['IPW・厳密', '0.215', C.a], ['二重頑健・貪欲', '0.194', '#5B6676']].forEach(function (r, i) {
      t2(S.p4, PX, 160 + i * 56, r[0], '', { 'font-size': 16, fill: C.ink });
      txt(S.p4, PX + 150, 162 + i * 56, r[1], { 'font-size': 26, 'font-weight': 650, fill: r[2] });
    });
    t2(S.p4, PX, 360, 'ランダムな方策は 0.868', '', { 'font-size': 15, fill: C.muted });
    t2(S.p4, PX, 384, '（n = 1,000）', '', { 'font-size': 15, fill: C.muted });
    note(g4, '論文 Table 2 の数値（arXiv v2）');

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'OPERATIONS RESEARCH · 2023';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Offline Multi-Action Policy Learning:';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Generalization and Optimization';
    t2(g5, 480, 296, 'オフラインの多値の方策学習：汎化と最適化', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zhengyuan Zhou · Susan Athey · Stefan Wager';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/opre.2022.2271';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: matching people grow by 1/e and turn orange
    var k1 = seg(t, 2.2, 4);
    S.c1.forEach(function (o) {
      o.c.setAttribute('r', H.mix ? 9 + (o.r - 9) * k1 : o.r);
      o.c.setAttribute('fill', o.match ? H.mix(C.gray, C.a, k1) : C.gray);
      o.c.setAttribute('fill-opacity', o.match ? 1 - 0.45 * k1 : 1);
    });
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    // scene 2
    S.cA.setAttribute('stroke-dashoffset', 1200 * (1 - seg(t, 9, 11.5)));
    S.cAl.setAttribute('opacity', seg(t, 11.3, 11.8));
    S.p2.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: split line sweeps from left to right, values appear, best one circled
    var sw = seg(t, 18, 21.6);
    var kk = Math.min(NP - 1, Math.floor(sw * (NP - 1)) + 1);
    var sx = (px(kk - 1) + px(kk)) / 2;
    if (t >= 21.8) sx = (px(KBEST - 1) + px(KBEST)) / 2;
    S.sl.setAttribute('x1', sx); S.sl.setAttribute('x2', sx);
    S.sl.setAttribute('opacity', seg(t, 17.6, 18));
    S.vd.forEach(function (c, k) { c.setAttribute('opacity', (sw > 0 && k + 1 <= kk) ? 1 : 0); });
    S.best.setAttribute('opacity', seg(t, 21.8, 22.3));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.p3b.setAttribute('opacity', seg(t, 22, 22.6));
    // scene 4: series drawn in order
    S.ser.forEach(function (o) {
      o.pts.forEach(function (c, i) { c.setAttribute('opacity', seg(t, o.t0 + i * 0.35, o.t0 + i * 0.35 + 0.3)); });
      o.segs.forEach(function (l, i) {
        var k = seg(t, o.t0 + i * 0.35 + 0.1, o.t0 + (i + 1) * 0.35);
        var x1 = +l.getAttribute('x1'), y1 = +l.getAttribute('y1');
        var x2t = 110 + (i + 1) / 3 * 450, y2t = 440 - o.s.v[i + 1] / 0.5 * 320;
        l.setAttribute('x2', x1 + (x2t - x1) * k); l.setAttribute('y2', y1 + (y2t - y1) * k);
      });
    });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
