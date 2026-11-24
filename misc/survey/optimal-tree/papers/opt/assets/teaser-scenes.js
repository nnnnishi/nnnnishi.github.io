// =====================================================================
// teaser-scenes.js — Bertsimas, Dunn & Mundru, "Optimal Prescriptive Trees"
// (INFORMS J. Optim. 2019; numbers from the author-hosted manuscript), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen numbers (labelled 模式図).
// Scene 4 uses Table 2 (IHDP R^2) and Table 1 (Jobs average income) of the paper.
// Colours: orange = methods OPT is compared with / unobserved counterfactuals;
//          blue = OPT (joint objective, counterfactuals filled from the same leaf).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'これまでは、<span class="A">処置ごとに別のモデルで結果を予測し、予測を比べて</span>処置を選ぶことが多かった。', en: '' },
    { ja: '観察データでは、受けなかった処置の結果（反実仮想）が見えない。', en: '' },
    { ja: 'OPT は葉ごとに処置を選ぶ木を学ぶ。反実仮想は同じ葉の平均で埋め、<span class="B">処方の誤差と予測の誤差の重みつき和</span>を最小にする。', en: '' },
    { ja: 'IHDP のデータでは、OPT(0.5)-L による処置効果の推定の R² が 0.759 で最も高かった。', en: '' },
    { ja: 'OPT は処方の誤差と予測の誤差を同時に見て、人が読める形の処置の規則を観察データから学ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function arrow(g, x1, y1, x2, y2, col) {
    el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': 2.5 }, g);
    var a = Math.atan2(y2 - y1, x2 - x1), s = 10;
    el('path', { d: 'M' + x2 + ',' + y2 + ' L' + (x2 - s * Math.cos(a - 0.45)) + ',' + (y2 - s * Math.sin(a - 0.45)) + ' L' + (x2 - s * Math.cos(a + 0.45)) + ',' + (y2 - s * Math.sin(a + 0.45)) + ' Z', fill: col }, g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: regress-and-compare =====
    var g1 = S.g[0];
    S.r1 = [0, 1].map(function (k) {
      var y = 150 + k * 170, o = el('g', {}, g1);
      t2(o, 70, y - 50, '処置 ' + k + ' を受けた人', '', { 'font-size': 16, fill: C.ink });
      for (var j = 0; j < 6; j++) el('circle', { cx: 85 + j * 26, cy: y - 14, r: 9, fill: C.gray }, o);
      arrow(o, 245, y - 14, 300, y - 14, C.muted);
      el('rect', { x: 306, y: y - 44, width: 130, height: 60, rx: 10, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, o);
      txt(o, 371, y - 6, 'モデル ' + m('f') + '<tspan font-size="14" dy="5">' + k + '</tspan>', { 'font-size': 18, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
      return o;
    });
    S.cmp = el('g', {}, g1);
    arrow(S.cmp, 440, 136, 490, 205, C.muted);
    arrow(S.cmp, 440, 306, 490, 240, C.muted);
    el('rect', { x: 494, y: 192, width: 150, height: 60, rx: 10, fill: C.panel }, S.cmp);
    t2(S.cmp, 569, 220, '予測を比べ、', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.cmp, 569, 242, '良いほうを選ぶ', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 150, 'データを処置ごとに', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 176, '分けて学ぶ', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 236, '処置を選ぶ境界は', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 262, m('f') + '₀ と ' + m('f') + '₁ から', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(S.p1, PX, 288, '間接に決まる', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: counterfactuals are missing =====
    var g2 = S.g[1];
    var ROWS = [['A', 0, 3, null], ['B', 0, 5, null], ['C', 0, 4, null], ['D', 1, null, 2], ['E', 1, null, 3], ['F', 1, null, 1]];
    var CX = [100, 230, 380, 520];
    t2(g2, CX[0], 96, '人', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, CX[1], 96, '受けた処置', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, CX[2], 96, m('y') + '(0)', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    txt(g2, CX[3], 96, m('y') + '(1)', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('line', { x1: 60, x2: 580, y1: 110, y2: 110, stroke: C.hair, 'stroke-width': 1.5 }, g2);
    S.obs = []; S.miss = [];
    ROWS.forEach(function (r, i) {
      var y = 148 + i * 50;
      txt(g2, CX[0], y, r[0], { 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' });
      txt(g2, CX[1], y, String(r[1]), { 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' });
      [2, 3].forEach(function (c) {
        if (r[c] !== null) S.obs.push(txt(g2, CX[c], y, String(r[c]), { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 }));
        else S.miss.push(txt(g2, CX[c], y, '?', { 'font-size': 24, fill: C.a, 'text-anchor': 'middle', 'font-weight': 650 }));
      });
    });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 150, '受けなかった処置の結果', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 176, 'は観測されない', '', { 'font-size': 17, fill: C.ink });
    S.p2b = el('g', {}, g2);
    t2(S.p2b, PX, 236, '処置の割当ても', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2b, PX, 262, '特徴量に左右される', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（結果は小さいほどよい）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: prescriptive tree =====
    var g3 = S.g[2];
    el('rect', { x: 265, y: 80, width: 130, height: 50, rx: 8, fill: C.panel, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    txt(g3, 330, 112, m('x') + '₁ &lt; 1', { 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' });
    S.leaves = [[180, 'はい', 4, 2, 1], [480, 'いいえ', 1, 3, 0]].map(function (L) {
      var o = el('g', {}, g3), x = L[0];
      el('line', { x1: 330, y1: 130, x2: x, y2: 210, stroke: C.ink, 'stroke-width': 1.5 }, o);
      t2(o, (330 + x) / 2 + (x < 330 ? -20 : 20), 168, L[1], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      el('rect', { x: x - 115, y: 210, width: 230, height: 190, rx: 12, fill: '#fff', stroke: C.hair, 'stroke-width': 2 }, o);
      t2(o, x, 244, '葉の中の平均', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      txt(o, x, 282, m('y') + '(0)：' + L[2], { 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' });
      txt(o, x, 316, m('y') + '(1)：' + L[3], { 'font-size': 19, fill: C.ink, 'text-anchor': 'middle' });
      var pick = el('g', {}, o);
      el('rect', { x: x - 85, y: 340, width: 170, height: 42, rx: 21, fill: C.b }, pick);
      t2(pick, x, 367, '処置 ' + L[4] + ' を処方', '', { 'font-size': 17, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 600 });
      return { g: o, pick: pick };
    });
    S.p3 = el('g', {}, g3);
    txt(S.p3, PX, 120, m('μ') + ' × 処方の誤差', { 'font-size': 21, 'font-weight': 650, fill: C.b });
    txt(S.p3, PX, 156, '+ (1 − ' + m('μ') + ') × 予測の誤差', { 'font-size': 21, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 212, '反実仮想は同じ葉で', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 238, 'その処置を受けた人の平均', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 290, '木全体を座標降下で改善する', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: IHDP R^2 (Table 2) and Jobs income (Table 1) =====
    var g4 = S.g[3];
    var rows = [['CF', 0.543, C.a], ['RC–LASSO', 0.639, C.a], ['RC–RF', 0.704, C.a], ['OPT(0.5)-L', 0.759, C.b]];
    var BX0 = 230, BX1 = 590, HI = 0.8, Y0 = 140, RD = 72;
    function bx(v) { return BX0 + v / HI * (BX1 - BX0); }
    t2(g4, 70, 70, 'IHDP：処置効果の推定の R²', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.2, 0.4, 0.6, 0.8].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 36, y2: Y0 + RD * 3 + 30, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + RD * 3 + 56, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + RD * i, o = {};
      txt(g4, BX0 - 14, y + 6, rw[0], { 'font-size': 17, fill: rw[2] === C.b ? C.b : C.ink, 'text-anchor': 'end', 'font-weight': rw[2] === C.b ? 650 : 400 });
      o.bar = el('rect', { x: BX0, y: y - 16, width: 0, height: 32, rx: 3, fill: rw[2] }, g4);
      o.lab = el('text', { x: bx(rw[1]) - 8, y: y + 7, 'font-size': 17, fill: '#fff', 'text-anchor': 'end', 'font-weight': 600 }, g4); o.lab.textContent = rw[1].toFixed(3);
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.8;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 110, '職業訓練の平均所得', '', { 'font-size': 16, fill: C.muted });
    txt(S.p4, PX, 160, '$6,000', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 190, 'OPT(0.5)-L', '', { 'font-size': 16, fill: C.b });
    txt(S.p4, PX, 250, '$5,991', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    t2(S.p4, PX, 278, '次点の RC–LASSO', '', { 'font-size': 16, fill: C.a });
    t2(S.p4, PX, 330, '処置なし：$5,467', '', { 'font-size': 16, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1・2 の数値（著者稿）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'INFORMS JOURNAL ON OPTIMIZATION · 2019';
    el('text', { x: 480, y: 226, 'font-size': 44, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Prescriptive Trees';
    t2(g5, 480, 274, '最適な処方的決定木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 330, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dimitris Bertsimas · Jack Dunn · Nishanth Mundru';
    el('text', { x: 480, y: 390, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/ijoo.2018.0005';
    t2(g5, 480, 456, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.r1[0].setAttribute('opacity', seg(t, 0.8, 1.6));
    S.r1[1].setAttribute('opacity', seg(t, 2.0, 2.8));
    S.cmp.setAttribute('opacity', seg(t, 3.4, 4.2));
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    // scene 2
    S.obs.forEach(function (e, i) { e.setAttribute('opacity', seg(t, 9 + i * 0.25, 9.4 + i * 0.25)); });
    S.miss.forEach(function (e, i) { e.setAttribute('opacity', seg(t, 11.2 + i * 0.2, 11.6 + i * 0.2)); });
    S.p2.setAttribute('opacity', seg(t, 12, 12.6));
    S.p2b.setAttribute('opacity', seg(t, 13.4, 14));
    // scene 3
    S.leaves.forEach(function (L, i) {
      L.g.setAttribute('opacity', seg(t, 17 + i * 0.6, 17.6 + i * 0.6));
      L.pick.setAttribute('opacity', seg(t, 19.4 + i * 0.6, 20 + i * 0.6));
    });
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    // scene 4
    S.rows4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 28.8, 29.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
