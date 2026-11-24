// =====================================================================
// teaser-scenes.js — Vos & Verwer, "Robust Optimal Classification Trees against Adversarial Examples"
// (AAAI 2022; numbers from arXiv 2109.03857), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3: schematic 2-D points with box-shaped perturbation ranges (labelled 模式図).
// Scene 4: mean adversarial accuracy over 8 data sets, Table 3 of the paper.
// Colours: orange = attacker / greedy heuristics; blue = ROCT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '攻撃者は各点を<span class="A">箱の範囲で動かし</span>、決定木の予測を変えようとする。', en: '' },
    { ja: '頑健な木を作る既存の方法は貪欲法で、最適な木からどれだけ離れているか分からなかった。', en: '' },
    { ja: 'ROCT は<span class="B">たどり着ける葉のどれかが誤りなら誤分類</span>と数え、min-max 問題を 1 回の最小化として解く。', en: '' },
    { ja: '8 つのデータでは、GROOT の木から始めた MILP の平均の敵対的精度が .735 で最も高かった。', en: '' },
    { ja: 'ROCT は最適に頑健な木を求められ、既存の貪欲法が最適に近いことも確かめられる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // schematic samples: [x, y, class] in a 2-D square (x 90..570, y 110..450)
  var PTS = [[150, 190, 0], [210, 330, 0], [170, 410, 0], [315, 250, 1], [440, 170, 1], [480, 330, 1], [400, 410, 1]];
  var EPS = 45, SPLIT = 330;
  function field(g) {
    el('rect', { x: 90, y: 110, width: 480, height: 340, fill: 'none', stroke: C.hair, 'stroke-width': 1.5 }, g);
    var boxes = PTS.map(function (p) { return el('rect', { x: p[0] - EPS, y: p[1] - EPS, width: 2 * EPS, height: 2 * EPS, fill: 'none', stroke: C.a, 'stroke-width': 2, opacity: 0 }, g); });
    var dots = PTS.map(function (p) { return el('circle', { cx: p[0], cy: p[1], r: 10, fill: p[2] ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2.2 }, g); });
    return { boxes: boxes, dots: dots };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: attacker boxes =====
    var g1 = S.g[0];
    S.f1 = field(g1);
    el('line', { x1: SPLIT, x2: SPLIT, y1: 110, y2: 450, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, g1);
    t2(g1, SPLIT + 8, 132, '分岐', '', { 'font-size': 15, fill: C.ink });
    S.mv1 = el('circle', { cx: 315, cy: 250, r: 10, fill: C.a, opacity: 0 }, g1);
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 150, '箱の形の攻撃', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    txt(S.p1, PX, 200, m('L') + '<tspan font-size="14" dy="4">∞</tspan><tspan dy="-4"> 半径 </tspan>' + m('ε'), { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX, 250, '分岐の近くの ● は', '', { 'font-size': 16, fill: C.ink });
    t2(S.p1, PX, 276, '左の葉に動かされる', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: greedy methods, min-max =====
    var g2 = S.g[1];
    txt(g2, 330, 200, m('min') + '<tspan font-size="16" dy="8">' + m('θ') + '</tspan><tspan dy="-8">  </tspan><tspan fill="' + C.a + '">' + m('max') + '<tspan font-size="16" dy="8">' + m('δ') + '∈' + m('S') + '</tspan><tspan dy="-8">  </tspan></tspan>' + m('L') + '(' + m('θ') + ', ' + m('x') + ' + ' + m('δ') + ', ' + m('y') + ')', { 'font-size': 32, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 330, 240, '敵対的学習の min-max 問題', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.gr = el('g', {}, g2);
    ['Chen ら（2019）', 'TREANT', 'GROOT'].forEach(function (n, i) {
      el('rect', { x: 90 + i * 165, y: 300, width: 150, height: 56, rx: 10, fill: '#FCEBDF' }, S.gr);
      t2(S.gr, 165 + i * 165, 334, n, '', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    });
    t2(S.gr, 330, 392, 'どれも分岐を 1 つずつ選ぶ貪欲法', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 170, '最適からの距離', '', { 'font-size': 17, fill: C.ink });
    txt(S.p2, PX, 236, '?', { 'font-size': 60, 'font-weight': 700, fill: C.a });
    t2(S.p2, PX, 290, 'XOR のデータでは', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 316, 'よい分岐を見つけられない', '', { 'font-size': 16, fill: C.ink });

    // ===== scene 3: reachable leaves =====
    var g3 = S.g[2];
    S.f3 = field(g3);
    S.split3 = el('line', { x1: 0, x2: 0, y1: 110, y2: 450, stroke: C.b, 'stroke-width': 3 }, g3);
    S.mark3 = PTS.map(function (p) { return txt(g3, p[0] + 16, p[1] - 14, '×', { 'font-size': 22, 'font-weight': 700, fill: C.a, opacity: 0 }); });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 120, '点 ' + m('i') + ' の誤り ' + m('e') + '<tspan font-size="13" dy="4">' + m('i') + '</tspan>', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.p3, PX, 156, '箱から届く葉のどれかが', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 182, '違うクラスなら 1', '', { 'font-size': 16, fill: C.ink });
    txt(S.p3, PX, 240, m('min') + ' Σ ' + m('e') + '<tspan font-size="14" dy="5">' + m('i') + '</tspan>', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 280, 'MILP・MaxSAT で解く', '', { 'font-size': 16, fill: C.ink });
    S.err3 = el('g', {}, g3);
    t2(S.err3, PX, 340, '誤り', '', { 'font-size': 16, fill: C.muted });
    S.errTxt = txt(S.err3, PX, 392, '1', { 'font-size': 44, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 =====
    var g4 = S.g[3];
    t2(g4, 70, 64, '8 データでの平均の敵対的精度（30 分の学習）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var rows = [['TREANT', .692, C.a], ['Binary-MILP', .714, C.b], ['MILP', .720, C.b], ['RC2-MaxSAT', .724, C.b], ['GROOT', .726, C.a], ['Binary-MILP-warm', .726, C.b], ['LSU-MaxSAT', .729, C.b], ['MILP-warm', .735, C.b]];
    var X0 = 260, X1 = 600, L = .68, R = .74;
    function xv(v) { return X0 + (v - L) / (R - L) * (X1 - X0); }
    [.68, .70, .72, .74].forEach(function (v) {
      el('line', { x1: xv(v), x2: xv(v), y1: 90, y2: 440, stroke: C.hair }, g4);
      el('text', { x: xv(v), y: 464, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(2);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = 108 + i * 44, o = {};
      txt(g4, X0 - 16, y + 6, rw[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      o.dot = el('circle', { cx: X0, cy: y, r: 9, fill: rw[2] }, g4);
      o.x = xv(rw[1]);
      o.lab = txt(g4, o.x + 16, y + 6, String(rw[1].toFixed(3)).replace('0.', '.'), { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      o.t0 = 25 + i * 0.45;
      return o;
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 150, '横軸は 0.68 から', '', { 'font-size': 14, fill: C.muted });
    t2(S.p4, PX, 200, 'MILP-warm', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(S.p4, PX, 228, '平均順位 1.583、17 勝', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 280, 'GROOT', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(S.p4, PX, 308, '平均順位 2.375、16 勝', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 3 の数値（arXiv 版）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2022';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Robust Optimal Classification Trees';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'against Adversarial Examples';
    t2(g5, 480, 296, '敵対的な摂動に頑健な最適分類木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Daniël Vos · Sicco Verwer';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v36i8.20829';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function reaches(p, s) { return { left: p[0] - EPS < s, right: p[0] + EPS > s }; }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: boxes appear, the filled point at (300,250) is pushed across the split
    S.f1.boxes.forEach(function (b, i) { b.setAttribute('opacity', seg(t, 1.2 + i * 0.15, 1.8 + i * 0.15)); });
    var k = seg(t, 4, 5.5);
    S.mv1.setAttribute('opacity', k > 0 ? 1 : 0);
    S.mv1.setAttribute('cx', 315 - 40 * k);   // stays inside its box (eps = 45)
    S.p1.setAttribute('opacity', seg(t, 2.5, 3.3));
    // scene 2
    S.gr.setAttribute('opacity', seg(t, 10, 10.8));
    S.p2.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: split slides from 330 to 262; count points whose box reaches a wrong leaf
    S.f3.boxes.forEach(function (b) { b.setAttribute('opacity', 1); });
    var s = 330 + (262 - 330) * seg(t, 18.5, 21.5);
    S.split3.setAttribute('x1', s); S.split3.setAttribute('x2', s);
    var errs = 0;
    PTS.forEach(function (p, i) {
      var r = reaches(p, s), bad = p[2] ? r.left : r.right;   // class 0 on the left, class 1 on the right
      if (bad) errs++;
      S.mark3[i].setAttribute('opacity', bad ? seg(t, 17.6, 18.2) : 0);
    });
    S.errTxt.textContent = errs;
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.err3.setAttribute('opacity', seg(t, 17.6, 18.2));
    // scene 4
    S.rows4.forEach(function (o) {
      var kk = seg(t, o.t0, o.t0 + 0.7);
      o.dot.setAttribute('cx', 260 + (o.x - 260) * kk);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
