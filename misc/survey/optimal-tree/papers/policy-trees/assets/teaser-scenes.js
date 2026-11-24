// =====================================================================
// teaser-scenes.js — Amram, Dunn & Zhuo, "Optimal policy trees" (Machine Learning 2022;
// numbers from arXiv v1, 2012.02279), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematic (labelled 模式図); scene 3 reuses the toy reward matrix of the page's Fig. 1.
// Scene 4 uses Table 7 (grocery pricing) and the diabetes results stated in the text (Section 4.2).
// Colours: orange = prescriptive trees / greedy policy trees; blue = Optimal Policy Trees.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'これまでの<span class="A">処方的な木</span>は葉ごとに処置ごとの結果も推定し、1 本の木で推定と処方の両方をこなしていた。', en: '' },
    { ja: '基準の結果が複雑だと、処方的な木は分岐をその形の近似に使ってしまう。方策に要るのは、どの処置の結果が小さいかだけである。', en: '' },
    { ja: '<span class="B">Optimal Policy Trees</span> は全員・全処置の報酬を先に推定で埋め、合計が最小になる分岐と葉の処置を探す。', en: '' },
    { ja: 'イチゴの価格設定では、推定した収益の増加が最適な方策木で 77.1% となり、貪欲な方策木の 65.9% と OPT の 61.5% を上回った。', en: '' },
    { ja: '報酬の推定を木の外に出すと、木は方策を決める分岐だけを学べばよく、離散の処置にも連続の用量にも使える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function note(g, s) { t2(g, 940, 520, s, '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); }

  // toy reward matrix (same as the page's Fig. 1)
  var GA = [2, 3, 1, 4, 2, 3, 6, 5, 4, 6], GB = [5, 4, 3, 6, 2, 5, 2, 3, 1, 3];
  var OBS = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1];   // which treatment was observed (0 = A, 1 = B)
  function total(s) {
    var parts = (s <= 0 || s >= 10) ? [[0, 10]] : [[0, s], [s, 10]], tot = 0;
    parts.forEach(function (p) { var a = 0, b = 0; for (var i = p[0]; i < p[1]; i++) { a += GA[i]; b += GB[i]; } tot += Math.min(a, b); });
    return tot;
  }
  function leafPick(s, i) {
    var p = (s <= 0 || s >= 10) ? [0, 10] : (i < s ? [0, s] : [s, 10]), a = 0, b = 0;
    for (var j = p[0]; j < p[1]; j++) { a += GA[j]; b += GB[j]; }
    return a <= b ? 0 : 1;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: prescriptive tree with outcome estimates in every leaf =====
    var g1 = S.g[0];
    var nodes = [[320, 110], [190, 220], [450, 220]];
    var leaves = [[120, 340], [260, 340], [380, 340], [520, 340]];
    [[0, 1], [0, 2], [1, 0], [1, 1], [2, 2], [2, 3]].forEach(function (e, k) {
      var a = nodes[e[0]], b = k < 2 ? nodes[e[1]] : leaves[e[1]];
      el('line', { x1: a[0], y1: a[1] + 20, x2: b[0], y2: b[1] - 34, stroke: C.muted, 'stroke-width': 2 }, g1);
    });
    nodes.forEach(function (n) { el('rect', { x: n[0] - 46, y: n[1] - 20, width: 92, height: 40, rx: 10, fill: C.panel, stroke: C.muted }, g1); });
    txt(g1, 320, 116, m('x') + '₁ ≤ 0.3', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g1, 190, 226, m('x') + '₃ ≤ 1', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g1, 450, 226, m('x') + '₂ = 0', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    var HA = [[0.55, 0.8], [0.7, 0.4], [0.35, 0.6], [0.8, 0.5]];
    S.leaf1 = leaves.map(function (L, k) {
      var g = el('g', {}, g1);
      el('rect', { x: L[0] - 52, y: L[1] - 34, width: 104, height: 112, rx: 10, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      var bars = HA[k].map(function (h, j) {
        var x = L[0] - 34 + j * 40;
        el('line', { x1: x - 6, x2: x + 30, y1: L[1] + 50, y2: L[1] + 50, stroke: C.hair }, g);
        el('text', { x: x + 12, y: L[1] + 70, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = j ? 'B' : 'A';
        return { r: el('rect', { x: x, y: L[1] + 50, width: 24, height: 0, fill: C.a, opacity: 0.85 }, g), h: h * 70, base: L[1] + 50 };
      });
      return { g: g, bars: bars };
    });
    t2(g1, 70, 60, '処方的な木（模式図）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 130, '葉ごとに', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 158, '処置 A・B の結果を推定', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 214, '分岐は推定にも', '', { 'font-size': 17, fill: C.a });
    t2(S.p1, PX, 242, '処方にも使われる', '', { 'font-size': 17, fill: C.a });
    t2(S.p1, PX, 310, '結果のモデルは', '', { 'font-size': 16, fill: C.muted });
    t2(S.p1, PX, 336, '区分的に定数か線形（OPT）', '', { 'font-size': 16, fill: C.muted });
    note(g1, '模式図（分岐と棒の高さは解説者が置いた例）');

    // ===== scene 2: baseline vs effect =====
    var g2 = S.g[1];
    var X0 = 70, X1 = 590, YM = 230, NP = 80;
    function base(u) { return 50 * Math.sin(u * 9) + 30 * Math.sin(u * 23 + 1); }
    function eff(u) { return u < 0.6 ? 35 : -35; }   // y1 - y0
    function px(u) { return X0 + u * (X1 - X0); }
    var p0 = [], p1 = [];
    for (var k = 0; k <= NP; k++) { var u = k / NP; p0.push(px(u).toFixed(1) + ',' + (YM - base(u) + eff(u) / 2).toFixed(1)); p1.push(px(u).toFixed(1) + ',' + (YM - base(u) - eff(u) / 2).toFixed(1)); }
    t2(g2, X0, 60, '結果の曲線（小さいほどよい、模式図）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.c0 = el('polyline', { points: p0.join(' '), fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, g2);
    S.c1 = el('polyline', { points: p1.join(' '), fill: 'none', stroke: C.muted, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, g2);
    t2(g2, X1 + 8, YM - base(1) + eff(1) / 2 + 5, '処置 A', '', { 'font-size': 15, fill: C.ink });
    t2(g2, X1 + 8, YM - base(1) - eff(1) / 2 + 5, '処置 B', '', { 'font-size': 15, fill: C.muted });
    // orange step approximation (many splits spent on the baseline)
    var steps = [];
    for (var j = 0; j < 12; j++) {
      var a = j / 12, b = (j + 1) / 12, mid = (a + b) / 2;
      steps.push(el('line', { x1: px(a), x2: px(b), y1: YM - base(mid) + eff(mid) / 2, y2: YM - base(mid) + eff(mid) / 2, stroke: C.a, 'stroke-width': 4, opacity: 0 }, g2));
    }
    S.steps = steps;
    S.strip = el('g', {}, g2);
    el('rect', { x: px(0), y: 380, width: px(0.6) - px(0), height: 40, fill: C.b, opacity: 0.85 }, S.strip);
    el('rect', { x: px(0.6), y: 380, width: px(1) - px(0.6), height: 40, fill: C.bsoft, stroke: C.b }, S.strip);
    t2(S.strip, (px(0) + px(0.6)) / 2, 406, 'A が小さい', '', { 'font-size': 16, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 600 });
    t2(S.strip, (px(0.6) + px(1)) / 2, 406, 'B が小さい', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
    t2(S.strip, X0, 448, '方策に要るのはこれだけ（分岐 1 回）', '', { 'font-size': 15, fill: C.b });
    t2(g2, X1, 470, '特徴量 ' + m('x') + ' →', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 120, '処方的な木は', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 148, '曲線の形まで近似する', '', { 'font-size': 17, fill: C.ink });
    S.nsplit = txt(S.p2, PX, 214, '分岐 11 回', { 'font-size': 38, 'font-weight': 650, fill: C.a });
    t2(S.p2, PX, 290, '処置が多いと、葉ごとの', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 316, 'データも処置ごとに薄まる', '', { 'font-size': 16, fill: C.muted });
    note(g2, '模式図（曲線は解説者が置いた例）');

    // ===== scene 3: fill reward matrix, then search the split =====
    var g3 = S.g[2];
    var MX = 110, CW = 46, YA = 170, YB = 236, CH = 52;
    t2(g3, 70, 60, '報酬の行列 Γ（小さいほどよい、模式図）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, MX - 14, YA + 33, 'A', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, MX - 14, YB + 33, 'B', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, MX + 5 * CW, 140, '10 人（特徴量 ' + m('x') + ' の順）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.cells = [];
    for (var i = 0; i < 10; i++) {
      [0, 1].forEach(function (r) {
        var x = MX + i * CW, y = r ? YB : YA, v = r ? GB[i] : GA[i];
        var rc = el('rect', { x: x + 3, y: y, width: CW - 6, height: CH, rx: 6, fill: '#fff', stroke: C.hair }, g3);
        var tx = el('text', { x: x + CW / 2, y: y + 33, 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' }, g3);
        tx.textContent = String(v);
        S.cells.push({ i: i, r: r, rc: rc, tx: tx, obs: OBS[i] === r });
      });
    }
    S.splitLine = el('line', { x1: 0, x2: 0, y1: 150, y2: 310, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g3);
    S.fillLab = t2(g3, MX, 350, '観測は 1 人 1 処置だけ → 残りを二重頑健な推定で埋める', '', { 'font-size': 15, fill: C.muted });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 120, '各葉で合計が小さい', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 148, '処置を選ぶ', '', { 'font-size': 17, fill: C.ink });
    t2(S.p3, PX, 210, '報酬の合計', '', { 'font-size': 16, fill: C.muted });
    S.totTxt = txt(S.p3, PX, 262, '34', { 'font-size': 46, 'font-weight': 650, fill: C.b });
    S.sLab = txt(S.p3, PX, 300, '', { 'font-size': 16, fill: C.muted });
    note(g3, '模式図（報酬は解説者が置いた例）');

    // ===== scene 4: grocery pricing (Table 7) + diabetes (text) =====
    var g4 = S.g[3];
    t2(g4, 70, 70, 'イチゴの価格設定：推定した収益の増加', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows = [['OPT', 61.5, C.a, 1], ['方策木（貪欲）', 65.9, C.a, 0.6], ['方策木（最適）', 77.1, C.b, 1]];
    var BX0 = 230, BX1 = 590, HI = 80, Y0 = 150, RD = 90;
    function bx(v) { return BX0 + v / HI * (BX1 - BX0); }
    [0, 20, 40, 60, 80].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 40, y2: Y0 + RD * 2 + 40, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + RD * 2 + 66, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + RD * i, o = {};
      t2(g4, BX0 - 14, y + 6, rw[0], '', { 'font-size': 17, fill: i === 2 ? C.b : C.ink, 'text-anchor': 'end', 'font-weight': i === 2 ? 600 : 400 });
      o.bar = el('rect', { x: BX0, y: y - 20, width: 0, height: 40, rx: 3, fill: rw[2], opacity: rw[3] }, g4);
      o.lab = el('text', { x: bx(rw[1]) - 8, y: y + 7, 'font-size': 18, 'font-weight': 600, fill: '#fff', 'text-anchor': 'end' }, g4); o.lab.textContent = rw[1].toFixed(1) + '%';
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.9;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 110, '糖尿病の治療', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p4, PX, 146, '連続用量の方策木は', '', { 'font-size': 16, fill: C.ink });
    txt(S.p4, PX, 196, '1,000 件', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 230, 'で OPT の 50,000 件と同等', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 290, '木の葉の数', '', { 'font-size': 16, fill: C.muted });
    txt(S.p4, PX, 330, '10', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX + 46, 330, '対', '', { 'font-size': 18, fill: C.muted });
    txt(S.p4, PX + 80, 330, '21', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(S.p4, PX + 122, 330, '（OPT）', '', { 'font-size': 16, fill: C.muted });
    note(g4, '論文 Table 7 と 4.2 節の数値（arXiv v1）');

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'MACHINE LEARNING · 2022';
    el('text', { x: 480, y: 226, 'font-size': 46, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Policy Trees';
    t2(g5, 480, 276, '推定した報酬から最適な方策の木を学ぶ', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 330, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Maxime Amram · Jack Dunn · Ying Daisy Zhuo';
    el('text', { x: 480, y: 390, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/s10994-022-06128-5 · arXiv:2012.02279';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: leaves appear, bars grow
    S.leaf1.forEach(function (L, k) {
      var t0 = 1 + k * 0.6;
      L.g.setAttribute('opacity', seg(t, t0, t0 + 0.5));
      L.bars.forEach(function (b, j) {
        var h = b.h * seg(t, t0 + 0.4 + j * 0.3, t0 + 1 + j * 0.3);
        b.r.setAttribute('y', b.base - h); b.r.setAttribute('height', h);
      });
    });
    S.p1.setAttribute('opacity', seg(t, 4, 4.8));
    // scene 2: steps appear one by one, then the strip
    S.steps.forEach(function (s, j) { s.setAttribute('opacity', seg(t, 9.5 + j * 0.22, 9.8 + j * 0.22)); });
    S.p2.setAttribute('opacity', seg(t, 11, 11.6));
    S.strip.setAttribute('opacity', seg(t, 13, 13.8));
    // scene 3: fill the matrix, then sweep the split
    var fill = seg(t, 17.5, 19.3);
    var s;
    if (t < 19.8) s = 0;
    else if (t < 22.5) s = 1 + Math.min(8, Math.floor((t - 19.8) / 0.3));
    else s = 6;
    var searching = t >= 19.8;
    S.cells.forEach(function (c, k) {
      var show = c.obs ? 1 : seg(t, 17.5 + c.i * 0.15, 17.9 + c.i * 0.15);
      c.tx.setAttribute('opacity', show);
      var pick = searching && leafPick(s, c.i) === c.r;
      c.rc.setAttribute('fill', pick ? C.b : (c.obs ? C.panel : H.mix('#FFFFFF', C.bsoft, fill)));
      c.tx.setAttribute('fill', pick ? '#fff' : C.ink);
      c.tx.setAttribute('font-weight', c.obs ? 650 : 400);
    });
    var sx = 110 + s * 46;
    S.splitLine.setAttribute('x1', sx); S.splitLine.setAttribute('x2', sx);
    S.splitLine.setAttribute('opacity', searching && s > 0 && s < 10 ? 1 : 0);
    S.fillLab.setAttribute('opacity', seg(t, 16.6, 17.2) * (1 - seg(t, 19.4, 19.8)));
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.2));
    S.totTxt.textContent = String(searching ? total(s) : 34);
    S.sLab.innerHTML = searching ? (m('x') + ' ≤ ' + s + (t >= 22.5 ? '：この例での最小' : '')) : '';
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.7));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.5, 29.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
