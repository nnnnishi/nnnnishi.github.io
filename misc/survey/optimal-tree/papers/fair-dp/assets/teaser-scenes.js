// =====================================================================
// teaser-scenes.js — van der Linden, de Weerdt & Demirović, "Fair and Optimal Decision Trees: A Dynamic
// Programming Approach" (NeurIPS 2022), unofficial explainer. Player: teaser-engine.js.
// Scene 1 and 4: runtimes from Table 1 of the paper. Scenes 2-3: schematics with explainer-chosen
// imbalance values (labelled 模式図).
// Colours: orange = coupling by the global fairness constraint / MIP FairOCT; blue = DPF bounds and runtimes.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '公平で最適な木を求める既存の方法は MIP で、<span class="A">深さ 2 でも 1 時間を超えるデータが多かった</span>。', en: '' },
    { ja: '部分木の偏りは別の部分木で打ち消されうるので、部分木だけを見てもどちらがよいか決まらない。', en: '' },
    { ja: 'DPF は<span class="B">残りの木の不均衡の範囲</span>から最終的な不均衡の上下界を求め、公平になりえない部分解を捨てる。', en: '' },
    { ja: 'DPF は深さ 2 を全データで 1 秒未満、深さ 3 を全データで 1 分以内に解いた。', en: '' },
    { ja: '上下界で部分解を比べれば、木全体にかかる公平性の制約も動的計画法で扱える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // Table 1, FairOCT d = 2 (seconds; 3600 = > 1 h, -1 = out of memory)
  var T1 = [['Adult', 3600], ['Bank', 3600], ['Com.&Cr.', 3600], ['COMPAS r.', 3600], ['COMPAS v.r.', 1594], ['Dutch', 3600],
            ['German', 3600], ['KDD', -1], ['OULAD', 3600], ['Ricci', 0.5], ['Stud. Math', 284], ['Stud. Port.', 866]];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: FairOCT d=2 =====
    var g1 = S.g[0];
    t2(g1, 70, 64, 'FairOCT（MIP）で深さ 2 の木を求める時間', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var BX = 200, BW = 380;
    el('line', { x1: BX + BW, x2: BX + BW, y1: 84, y2: 478, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g1);
    t2(g1, BX + BW, 500, '1 時間', '', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    S.rows1 = T1.map(function (r, i) {
      var y = 100 + i * 32, o = {};
      txt(g1, BX - 12, y + 5, r[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
      var w = r[1] < 0 ? 0 : Math.min(1, r[1] / 3600) * BW;
      o.bar = el('rect', { x: BX, y: y - 10, width: 0, height: 20, rx: 3, fill: r[1] >= 3600 ? C.a : C.gray }, g1);
      o.lab = txt(g1, BX + w + 8, y + 5, r[1] < 0 ? 'メモリ不足' : r[1] >= 3600 ? '> 1 h' : r[1] < 1 ? '< 1 s' : r[1] + ' s', { 'font-size': 13, fill: r[1] < 0 || r[1] >= 3600 ? C.a : C.muted });
      o.w = w; o.t0 = 1 + i * 0.25;
      return o;
    });
    S.p1 = el('g', {}, g1);
    t2(S.p1, PX, 150, '12 データ中', '', { 'font-size': 17, fill: C.ink });
    txt(S.p1, PX, 210, '8', { 'font-size': 52, 'font-weight': 650, fill: C.a });
    t2(S.p1, PX + 40, 210, 'データで 1 時間超', '', { 'font-size': 17, fill: C.ink });
    t2(S.p1, PX, 260, 'データ点ごとに', '', { 'font-size': 16, fill: C.muted });
    t2(S.p1, PX, 286, '二値変数が要る', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '論文 Table 1 の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: subtrees cancel out =====
    var g2 = S.g[1];
    function node(g, x, y, s) { el('circle', { cx: x, cy: y, r: 24, fill: '#fff', stroke: C.ink, 'stroke-width': 2.2 }, g); txt(g, x, y + 6, s, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }); }
    el('line', { x1: 330, y1: 150, x2: 190, y2: 270, stroke: C.ink, 'stroke-width': 2 }, g2);
    el('line', { x1: 330, y1: 150, x2: 470, y2: 270, stroke: C.ink, 'stroke-width': 2 }, g2);
    node(g2, 330, 140, '');
    el('rect', { x: 110, y: 270, width: 160, height: 110, rx: 12, fill: '#FCEBDF' }, g2);
    el('rect', { x: 390, y: 270, width: 160, height: 110, rx: 12, fill: '#FCEBDF' }, g2);
    t2(g2, 190, 304, '左の部分木', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 470, 304, '右の部分木', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.l2 = txt(g2, 190, 352, '+8%', { 'font-size': 28, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.r2 = txt(g2, 470, 352, '−6%', { 'font-size': 28, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.sum2 = el('g', {}, g2);
    t2(S.sum2, 330, 440, '木全体の不均衡', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(S.sum2, 330, 482, '+8% − 6% = +2%', { 'font-size': 24, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 150, '精度だけなら', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 176, '左右を別々に最適化できる', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 236, '公平性は |' + m('I') + '| ≤ ' + m('δ'), '', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    t2(S.p2, PX, 264, '木全体にかかる制約', '', { 'font-size': 16, fill: C.ink });
    t2(S.p2, PX, 314, '加法性と単調性が崩れる', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図（不均衡の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: bounds and pruning =====
    var g3 = S.g[2];
    var X0 = 80, X1 = 600, L = -20, R = 20, AY = 300;
    function xv(v) { return X0 + (v - L) / (R - L) * (X1 - X0); }
    S.xv = xv;
    el('rect', { x: xv(-1), y: AY - 120, width: xv(1) - xv(-1), height: 160, fill: C.bsoft }, g3);
    t2(g3, xv(0), AY - 130, '許す範囲 ±1%', '', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    el('line', { x1: X0, x2: X1, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    [-20, -10, 0, 10, 20].forEach(function (v) {
      el('line', { x1: xv(v), x2: xv(v), y1: AY, y2: AY + 6, stroke: C.ink }, g3);
      el('text', { x: xv(v), y: AY + 28, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g3).textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
    });
    t2(g3, X1, AY + 56, '最終的な不均衡 ' + m('I') + ' →', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    t2(g3, X0, 110, '残りの木の範囲 [−4%, +1%] のとき', '', { 'font-size': 16, fill: C.ink });
    S.iv = el('rect', { x: 0, y: AY - 14, width: 0, height: 28, rx: 5, fill: C.a, opacity: 0.85 }, g3);
    S.ivl = txt(g3, 0, AY - 26, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 140, '部分解の不均衡', '', { 'font-size': 16, fill: C.muted });
    S.inT = txt(S.p3, PX, 180, '', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    t2(S.p3, PX, 230, '最終的な |' + m('I') + '| の下界', '', { 'font-size': 16, fill: C.muted });
    S.lbT = txt(S.p3, PX, 270, '', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    S.verdict = txt(S.p3, PX, 330, '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(g3, 940, 520, '模式図（値は解説者が置いた例、δ = 1%）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: DPF runtimes (Table 1) =====
    var g4 = S.g[3];
    t2(g4, 70, 64, 'DPF の計算時間（秒、δ = 1%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var cols = [['FairOCT', 'd = 2', C.a], ['DPF', 'd = 2', C.b], ['DPF', 'd = 3', C.b], ['DPF', 'd = 4', C.b]];
    var CX = [300, 400, 480, 570];
    cols.forEach(function (c, j) {
      txt(g4, CX[j], 104, c[0], { 'font-size': 15, 'font-weight': 600, fill: c[2], 'text-anchor': 'end' });
      txt(g4, CX[j], 124, c[1], { 'font-size': 13, fill: c[2], 'text-anchor': 'end' });
    });
    var rows = [['Adult', '> 1h', '< 1', '< 1', '1012'], ['Com.&Cr.', '> 1h', '< 1', '4', '1261'], ['COMPAS r.', '> 1h', '< 1', '< 1', '9'],
                ['German', '> 1h', '< 1', '2', '741'], ['KDD', '—', '< 1', '32', '> 1h'], ['Stud. Math', '284', '< 1', '< 1', '24'], ['Ricci', '< 1', '< 1', '< 1', '< 1']];
    S.rows4 = rows.map(function (r, i) {
      var y = 160 + i * 42, g = el('g', {}, g4);
      if (i % 2 === 0) el('rect', { x: 64, y: y - 26, width: 520, height: 42, fill: C.panel }, g);
      txt(g, 80, y, r[0], { 'font-size': 16, fill: C.ink });
      for (var j = 1; j < 5; j++) {
        var bad = r[j].indexOf('h') >= 0 || r[j] === '—';
        txt(g, CX[j - 1], y, r[j], { 'font-size': 17, 'font-weight': j > 1 && !bad ? 650 : 400, fill: j === 1 && bad ? C.a : (bad ? C.muted : C.ink), 'text-anchor': 'end' });
      }
      return { g: g, t0: 25 + i * 0.4 };
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 160, '深さ 2：全データで', '', { 'font-size': 16, fill: C.ink });
    txt(S.p4, PX, 206, '< 1 秒', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 256, '深さ 4：12 データ中', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 282, '8 データを 1 時間以内', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 330, '（枝刈りなしでは 4）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1 と 5 節の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NEURIPS 2022';
    el('text', { x: 480, y: 206, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Fair and Optimal Decision Trees:';
    el('text', { x: 480, y: 252, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'A Dynamic Programming Approach';
    t2(g5, 480, 296, '公平で最適な決定木：動的計画法によるアプローチ', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 346, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jacobus G.M. van der Linden · Mathijs M. de Weerdt · Emir Demirović';
    el('text', { x: 480, y: 402, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.52202/068431-2819';
    t2(g5, 480, 466, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.rows1.forEach(function (o) {
      o.bar.setAttribute('width', o.w * seg(t, o.t0, o.t0 + 0.6));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    // scene 2
    S.sum2.setAttribute('opacity', seg(t, 11, 11.8));
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: the partial imbalance sweeps from +12% to +2%
    var In = Math.round(12 + (2 - 12) * seg(t, 18, 22));
    var a = -4 + In, b = 1 + In;
    var lb = (a <= 0 && 0 <= b) ? 0 : Math.min(Math.abs(a), Math.abs(b));
    S.iv.setAttribute('x', S.xv(a)); S.iv.setAttribute('width', S.xv(b) - S.xv(a));
    S.ivl.setAttribute('x', (S.xv(a) + S.xv(b)) / 2);
    S.ivl.textContent = '[' + (a >= 0 ? '+' : '−') + Math.abs(a).toFixed(0) + '%, ' + (b >= 0 ? '+' : '−') + Math.abs(b).toFixed(0) + '%]';
    S.inT.textContent = (In >= 0 ? '+' : '−') + Math.abs(In).toFixed(0) + '%';
    S.lbT.textContent = lb.toFixed(0) + '%';
    S.lbT.setAttribute('fill', lb > 1 ? C.a : C.b);
    S.verdict.textContent = lb > 1 ? '→ 枝刈りする' : '→ 残す';
    S.verdict.setAttribute('fill', lb > 1 ? C.a : C.b);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.rows4.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p4.setAttribute('opacity', seg(t, 28.5, 29.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
