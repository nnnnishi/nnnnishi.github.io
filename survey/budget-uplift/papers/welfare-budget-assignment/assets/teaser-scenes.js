// =====================================================================
// teaser-scenes.js — Bhattacharya & Dupas (J. Econometrics 2012), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics: the households' CATE values are toy values drawn by the explainer from the same
// toy distribution as figure 1 on the page (labelled 模式図). Scene 4 uses numbers printed in the text of
// NBER WP w14447 (revised July 2011): Table 3 (6.5 / 13.7 points) and the abstract (9 / 17 points).
// Colours: orange = random allocation and wealth-only means-testing;
//          blue = the CATE threshold rule on all covariates (threshold gamma = shadow cost rho'(c)).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '予算で補助を配れるのは世帯の一部だけで、<span class="A">無作為に選ぶ</span>と効果の小さい世帯にも配られる。', en: '' },
    { ja: '処置できる割合の上限が c のとき、最適な割当ては CATE が上位 c に入る世帯に処置する<span class="B">しきい値規則</span>になる。', en: '' },
    { ja: '規則の厚生と、目標に必要な最小の処置割合は √n の速さで推定でき、信頼区間をつけられる。', en: '' },
    { ja: 'ケニアの蚊帳補助で同じ利用率に届くには、<span class="A">資産だけ</span>で配ると 6.5 ポイント、<span class="A">無作為</span>なら 13.7 ポイント多くの世帯に配る必要があった。', en: '' },
    { ja: '予算の上限は CATE のしきい値に置き換わり、そのしきい値が予算の潜在価格を表す。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // ---- toy CATE distribution (same as figure 1 on the page) ----
  var LO = -0.2, HI = 0.9, NG = 440, vs = [], cdf = [], Z = 0, acc = 0, i;
  for (i = 0; i <= NG; i++) { var v = LO + (HI - LO) * i / NG; vs.push(v); Z += 0.5 + Math.exp(-Math.pow((v - 0.3) / 0.2, 2)); }
  for (i = 0; i <= NG; i++) { acc += (0.5 + Math.exp(-Math.pow((vs[i] - 0.3) / 0.2, 2))) / Z; cdf.push(acc); }
  function q(u) { for (var k = 0; k <= NG; k++) if (cdf[k] >= u) return vs[k]; return HI; }
  var NH = 100, beta = [];
  for (i = 0; i < NH; i++) beta.push(q((i + 0.5) / NH));          // sorted ascending
  var r = H.rng(11), order = beta.map(function (_, k) { return k; });
  for (i = NH - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
  // random allocation of half the budget (scene 1)
  var rr = H.rng(23), pick = beta.map(function () { return rr(); });
  var cut = pick.slice().sort(function (a, b) { return a - b; })[NH / 2];
  var GAMMA = beta[NH / 2];                                          // (1-c) quantile with c = 0.5

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });
    S.shared = el('g', {}, svg);

    // ===== shared dots (scenes 1-2): grid -> sorted by CATE =====
    function gy(b) { return 410 - (b - LO) / (HI - LO) * 300; }
    S.zero2 = el('line', { x1: 80, x2: 600, y1: gy(0), y2: gy(0), stroke: C.muted, 'stroke-width': 1, 'stroke-dasharray': '3 4' }, S.shared);
    S.gline = el('line', { x1: 80, x2: 600, y1: gy(GAMMA), y2: gy(GAMMA), stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, S.shared);
    S.glab = t2(S.shared, 84, gy(GAMMA) - 12, m('γ') + '：上位 50% の境', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.ax2 = el('g', {}, S.shared);
    el('line', { x1: 80, x2: 80, y1: 90, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, S.ax2);
    t2(S.ax2, 90, 96, '↑ CATE ' + m('β') + '(' + m('x') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(S.ax2, 600, 460, 'CATE の小さい順に並べた世帯 →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.dots = beta.map(function (b, k) {
      var cell = order[k], gx = 110 + (cell % 10) * 50, gyy = 100 + Math.floor(cell / 10) * 38;
      var o = { b: b, x0: gx, y0: gyy, x1: 92 + k * 5, y1: gy(b), rnd: pick[k] < cut };
      o.c = el('circle', { cx: gx, cy: gyy, r: 9, fill: C.gray }, S.shared);
      o.ring = el('circle', { cx: gx, cy: gyy, r: 13, fill: 'none', stroke: C.a, 'stroke-width': 3 }, S.shared);
      return o;
    });

    // ===== scene 1: only a share c can be treated; random allocation =====
    var g1 = S.g[0], p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '予算：処置できる世帯の割合', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    txt(p1, PX, 180, m('c') + ' = 50%', { 'font-size': 36, 'font-weight': 650, fill: C.ink });
    txt(p1, PX, 222, '∫ ' + m('p') + '(' + m('x') + ') ' + m('dF') + '(' + m('x') + ') = ' + m('c'), { 'font-size': 18, fill: C.muted });
    S.p1b = el('g', {}, g1);
    t2(S.p1b, PX, 290, '無作為に選ぶ', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(S.p1b, PX, 320, '効果の大小に関係なく', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1b, PX, 344, '半分の世帯に配る。', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（100 世帯、効果は架空の値）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: threshold rule =====
    var g2 = S.g[1], p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 120, m('p') + '(' + m('x') + ') = 1{' + m('β') + '(' + m('x') + ') ≥ ' + m('γ') + '}', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 170, m('γ') + '：' + m('β') + '(' + m('X') + ') の (1 − ' + m('c') + ') 分位点', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 230, m('γ') + ' = ' + m('ρ') + '′(' + m('c') + ')', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 258, '予算制約の潜在価格。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 282, '最後に加わる世帯の効果。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（効果は架空の値）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: welfare curve, tangent = gamma, dual =====
    var g3 = S.g[2];
    var CM = 0.9, GM = 0.36;
    function cx(c) { return 100 + c / CM * 470; }
    function cy(w) { return 430 - w / GM * 320; }
    var gain = [0], s = 0;
    for (i = NH - 1; i >= 0; i--) { s += beta[i] / NH; gain.push(s); }   // gain[k] = treat top k households
    S.gain = gain; S.cx = cx; S.cy = cy;
    el('line', { x1: 100, x2: 590, y1: 430, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: 100, x2: 100, y1: 430, y2: 90, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 110, 96, '↑ 厚生の増分 ' + m('ρ') + '(' + m('c') + ') − ' + m('ρ') + '(0)', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 590, 460, '処置できる割合 ' + m('c') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.curve3 = el('polyline', { points: '', fill: 'none', stroke: C.ink, 'stroke-width': 3 }, g3);
    S.tan3 = el('line', { stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, g3);
    S.pt3 = el('circle', { r: 8, fill: C.b }, g3);
    S.tl3 = txt(g3, 0, 0, '傾き = ' + m('γ'), { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.dual3 = el('g', {}, g3);
    var KD = 30, DX = cx(KD / NH), DY = cy(gain[KD]);
    el('line', { x1: 100, x2: DX, y1: DY, y2: DY, stroke: C.muted, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, S.dual3);
    el('line', { x1: DX, x2: DX, y1: DY, y2: 430, stroke: C.muted, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, S.dual3);
    t2(S.dual3, 92, DY + 6, m('b'), '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
    t2(S.dual3, DX, 452, m('ρ') + '<tspan baseline-shift="super" font-size="11">−1</tspan>(' + m('b') + ')', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, '推定量の速さ', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    txt(p3, PX, 158, m('ρ̂') + '　√' + m('n'), { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 182, '規則の厚生', '', { 'font-size': 15, fill: C.muted });
    txt(p3, PX, 232, m('δ̂') + '(' + m('b') + ') = ' + m('ρ̂') + '<tspan baseline-shift="super" font-size="12">−1</tspan>(' + m('b') + ')　√' + m('n'), { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 256, '目標 ' + m('b') + ' に必要な最小の割合', '', { 'font-size': 15, fill: C.muted });
    txt(p3, PX, 306, m('γ̂') + '　√(' + m('nh') + ')', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 330, 'しきい値は √' + m('n') + ' より遅い', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（曲線は架空の効果から計算）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 (nonparametric, omega = 0.4) and abstract, NBER WP text =====
    var g4 = S.g[3];
    t2(g4, 70, 92, '同じ利用率に届くまでに追加で処置が必要な割合', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 118, '（3 つの共変量で配る規則との差、ポイント）', '', { 'font-size': 15, fill: C.muted });
    var X0 = 230, SC = 24;
    el('line', { x1: X0, x2: X0, y1: 150, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var rows = [['3 つの共変量', C.b, 0], ['資産だけ', C.a, 6.5], ['無作為', C.a, 13.7]];
    S.rows4 = rows.map(function (rw, k) {
      var y = 200 + k * 90, o = {};
      t2(g4, X0 - 16, y + 7, rw[0], '', { 'font-size': 18, 'font-weight': 600, fill: rw[1], 'text-anchor': 'end' });
      o.bar = el('rect', { x: X0, y: y - 18, width: 0, height: 36, rx: 5, fill: rw[1] }, g4);
      o.w = rw[2] * SC;
      o.lab = el('text', { x: X0 + o.w + 10, y: y + 7, 'font-size': 18, 'font-weight': 600, fill: C.ink }, g4);
      o.lab.textContent = k ? '+' + rw[2] : '基準';
      o.t0 = 25 + k * 1.2;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 150, '要旨：3 つの共変量で配ると', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 176, '利用率は', '', { 'font-size': 15, fill: C.muted });
    txt(p4, PX, 230, '+9', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 50, 230, 'ポイント', '', { 'font-size': 17, fill: C.b });
    t2(p4, PX, 256, '資産だけの規則と比べて', '', { 'font-size': 15, fill: C.ink });
    txt(p4, PX, 318, '+17', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p4, PX + 70, 318, 'ポイント', '', { 'font-size': 17, fill: C.b });
    t2(p4, PX, 344, '無作為な配布と比べて', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 392, 'ケニア西部の価格実験', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, 'NBER WP 本文の数値（Table 3、要旨）から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'JOURNAL OF ECONOMETRICS · 2012';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Inferring Welfare Maximizing Treatment';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Assignment under Budget Constraints';
    t2(g5, 480, 302, '予算制約のもとで厚生を最大にする処置割当ての推測', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Debopam Bhattacharya · Pascaline Dupas';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1016/j.jeconom.2011.11.007';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    S.shared.setAttribute('opacity', seg(t, 0, 0.6) * (1 - seg(t, 15.4, 16)));
    // scenes 1-2: dots appear, random half ringed; then they move to the sorted layout and the top half turns blue
    var mv = seg(t, 9, 11), blue = seg(t, 12, 12.8);
    S.dots.forEach(function (o, k) {
      o.c.setAttribute('opacity', seg(t, 0.4 + k * 0.012, 0.9 + k * 0.012));
      var x = lerp(o.x0, o.x1, mv), y = lerp(o.y0, o.y1, mv);
      o.c.setAttribute('cx', x); o.c.setAttribute('cy', y);
      o.c.setAttribute('r', lerp(9, 4.5, mv));
      o.c.setAttribute('fill', blue > 0.5 && o.b >= GAMMA ? C.b : C.gray);
      o.ring.setAttribute('cx', x); o.ring.setAttribute('cy', y);
      o.ring.setAttribute('opacity', o.rnd ? seg(t, 3.2, 3.8) * (1 - seg(t, 8.4, 9)) : 0);
    });
    S.ax2.setAttribute('opacity', seg(t, 10.5, 11.2));
    S.zero2.setAttribute('opacity', seg(t, 10.5, 11.2));
    S.gline.setAttribute('opacity', seg(t, 11.6, 12.2));
    S.glab.setAttribute('opacity', seg(t, 11.8, 12.4));
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    S.p1b.setAttribute('opacity', seg(t, 3.4, 4.2));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: curve draws as c sweeps; tangent follows; then the dual
    var cmax = 0.85, cc = cmax * seg(t, 17, 21), kk = Math.round(cc * 100), pts = [];
    for (var j = 0; j <= kk; j++) pts.push(S.cx(j / 100).toFixed(1) + ',' + S.cy(S.gain[j]).toFixed(1));
    S.curve3.setAttribute('points', pts.join(' '));
    var kt = Math.max(1, kk), X = S.cx(kt / 100), Y = S.cy(S.gain[kt]);
    var g = (S.gain[Math.min(100, kt + 1)] - S.gain[kt - 1]) / 2 * 100;   // slope = beta of the marginal household
    var ss = g * (320 / 0.36) / (470 / 0.9), dx = 70;
    S.tan3.setAttribute('x1', X - dx); S.tan3.setAttribute('y1', Y + ss * dx);
    S.tan3.setAttribute('x2', X + dx); S.tan3.setAttribute('y2', Y - ss * dx);
    S.pt3.setAttribute('cx', X); S.pt3.setAttribute('cy', Y);
    S.tl3.setAttribute('x', Math.min(X + 14, 520)); S.tl3.setAttribute('y', Y + 34);
    var on3 = seg(t, 17, 17.5) * (1 - seg(t, 21.4, 21.9));
    [S.tan3, S.pt3, S.tl3].forEach(function (e) { e.setAttribute('opacity', on3); });
    S.dual3.setAttribute('opacity', seg(t, 21.8, 22.6));
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: bars grow in order, then the abstract numbers
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.9));
      o.lab.setAttribute('x', 230 + o.w * seg(t, o.t0, o.t0 + 0.9) + 10);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
