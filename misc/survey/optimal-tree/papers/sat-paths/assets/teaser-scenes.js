// =====================================================================
// teaser-scenes.js — Janota & Morgado, SAT-based Encodings for Optimal Decision Trees with Explicit Paths
// (SAT 2020, arXiv:2609.27874), unofficial explainer. Player: teaser-engine.js (template unchanged).
// Scene 1 is a schematic (模式図). Scene 2 uses Table 2 (Catalan numbers).
// Scene 3 uses the paper's Fig. 1 example (4-leaf tree and g/t/e variable matrices).
// Scene 4 uses Table 3 (#slv on 20% and 50% benchmarks).
// Colours: orange = node-based prior SAT encoding (mindt) / topology explosion;
//          blue   = explicit path-based encoding (dtfinder / d-dtfinder).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '<span class="A">ノード単位の先行 SAT 符号化</span>は親子関係を変数で表すため経路が暗黙になり、深さを直接制御しにくい。',
    '木のノード数が増えると二分木のトポロジー数（カタラン数）が急増し、SAT ソルバーで解きにくくなる。',
    '<span class="B">提案する経路符号化</span>は根から葉までの経路を辞書順の変数行列で表し、ノード数と深さを同時に制御する。',
    '深さを先に最小化してからノード数を最小化する <span class="B">d-dtfinder</span> は、20%・50% の両標本で最も多くの問題を解いた。',
    '経路を明示的に表す SAT 符号化とトポロジー分割で、深さと大きさの両方を抑えた最適決定木を求めた。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 685;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5">\u200b</tspan>'; }
  function sup(s) { return '<tspan dy="-6" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="6">\u200b</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: node-based encoding (implicit paths, cardinality constraints) =====
    var g1 = S.g[0];
    var N1 = [
      [310, 96, 0, '1'], [210, 186, 0, '2'], [410, 186, 0, '3'],
      [155, 280, 1, '4'], [265, 280, 1, '5'], [355, 280, 0, '6'], [465, 280, 1, '7'],
      [310, 374, 1, '8'], [400, 374, 1, '9']
    ];
    var E1 = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [5, 7], [5, 8]];
    S.e1 = E1.map(function (e, i) {
      var a = N1[e[0]], b = N1[e[1]];
      return {
        ln: el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g1),
        t0: 1.0 + i * 0.35
      };
    });
    S.n1 = N1.map(function (n, i) {
      var gg = el('g', {}, g1);
      if (n[2]) el('rect', { x: n[0] - 20, y: n[1] - 18, width: 40, height: 36, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, gg);
      else el('circle', { cx: n[0], cy: n[1], r: 22, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, gg);
      tx(gg, n[0], n[1] + 6, n[3], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
      return { g: gg, t0: 0.7 + i * 0.35 };
    });
    S.box1 = el('g', {}, g1);
    el('rect', { x: 110, y: 424, width: 400, height: 48, rx: 10, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 1.4 }, S.box1);
    tx(S.box1, 310, 454, '経路が暗黙 → 深さ制約には追加のカウンタが必要', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });

    var p1 = S.p1 = el('g', {}, g1);
    tx(p1, PX, 128, '先行のノード符号化', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(p1, PX, 168, 'Narodytska ら（2018）', { 'font-size': 15, fill: C.muted });
    tx(p1, PX, 218, '・ノードごとに親子関係を表す', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 250, '・木になるよう基数制約が必要', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 282, '・全ノードに分類制約を置く', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 336, '深さを直接制御しにくい', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Catalan explosion of binary tree topologies (Table 2) =====
    var g2 = S.g[1];
    var catRows = [
      ['n = 9', '14', 14],
      ['n = 15', '429', 429],
      ['n = 21', '16,796', 16796],
      ['n = 27', '742,900', 742900],
      ['n = 31', '9,694,845', 9694845]
    ];
    tx(g2, 90, 74, '二分木のトポロジー数（カタラン数、対数幅）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.cat2 = [];
    var X2 = 170, MAXW2 = 340, MAXLOG = Math.log10(9694845);
    catRows.forEach(function (r, i) {
      var y = 110 + i * 54;
      tx(g2, X2 - 14, y + 20, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end', 'font-weight': 600 });
      var w = (Math.log10(r[2]) / MAXLOG) * MAXW2;
      var bar = el('rect', { x: X2, y: y, width: 0, height: 28, rx: 4, fill: i === 4 ? C.a : '#E07A4B' }, g2);
      var lb = tx(g2, X2 + w + 10, y + 20, r[1], { 'font-size': 16, fill: i === 4 ? C.a : C.ink, 'font-weight': i === 4 ? 700 : 600 });
      S.cat2.push({ bar: bar, lb: lb, w: w, t0: 8.6 + i * 0.65 });
    });
    S.big2 = el('g', {}, g2);
    tx(S.big2, 340, 434, '9,694,845', { 'font-size': 52, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    tx(S.big2, 340, 466, 'n = 31 のトポロジー数', { 'font-size': 16, fill: C.a, 'text-anchor': 'middle' });

    var p2 = S.p2 = el('g', {}, g2);
    tx(p2, PX, 128, '探索空間の壁', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(p2, PX, 174, '9 ノード程度の木でも', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 202, 'SAT ソルバーで解きにくい。', { 'font-size': 16, fill: C.ink });
    tx(p2, PX, 256, '木が大きくなると', { 'font-size': 16, fill: C.muted });
    tx(p2, PX, 284, 'トポロジー数が急増し、', { 'font-size': 16, fill: C.muted });
    tx(p2, PX, 312, '最適性の証明が難しくなる。', { 'font-size': 16, fill: C.muted });
    tx(g2, 940, 520, '数値は論文 Table 2（カタラン数）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: explicit path encoding (Fig. 1 tree + path highlight + matrix) =====
    var g3 = S.g[2];
    tx(g3, 80, 68, '4 本の経路（' + m('P') + ' = 4, 最大深さ ' + m('S') + ' = 2）', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    // Tree on upper-left
    var T3N = [[210, 126], [135, 210], [285, 210], [95, 296], [175, 296], [245, 296], [325, 296]];
    var T3E = [[0, 1, '0'], [0, 2, '1'], [1, 3, '0'], [1, 4, '1'], [2, 5, '0'], [2, 6, '1']];
    S.t3e = T3E.map(function (e) {
      var a = T3N[e[0]], b = T3N[e[1]];
      var ln = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.gray, 'stroke-width': 2.5 }, g3);
      tx(g3, (a[0] + b[0]) / 2 + (e[2] === '0' ? -14 : 14), (a[1] + b[1]) / 2 - 2, e[2], { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return ln;
    });
    // Nodes
    [[0, 'f₁'], [1, 'f₂'], [2, 'f₃']].forEach(function (u) {
      var pt = T3N[u[0]];
      el('circle', { cx: pt[0], cy: pt[1], r: 22, fill: '#fff', stroke: C.b, 'stroke-width': 2 }, g3);
      tx(g3, pt[0], pt[1] + 6, u[1], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    });
    var leaves3 = [[3, 'T', 'p=1'], [4, 'F', 'p=2'], [5, 'T', 'p=3'], [6, 'F', 'p=4']];
    S.leaf3 = leaves3.map(function (u) {
      var pt = T3N[u[0]];
      var r = el('rect', { x: pt[0] - 18, y: pt[1] - 16, width: 36, height: 32, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g3);
      tx(g3, pt[0], pt[1] + 6, u[1], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
      tx(g3, pt[0], pt[1] + 38, u[2], { 'font-size': 14, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
      return r;
    });

    // Matrix on middle-left (x=395..635)
    el('rect', { x: 390, y: 100, width: 250, height: 226, rx: 10, fill: '#F2F4F7', stroke: C.hair }, g3);
    tx(g3, 422, 130, m('p'), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g3, 490, 130, m('g') + sup('p') + sub('1,2'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
    tx(g3, 586, 130, m('e') + sup('p') + sub('1,2,3'), { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
    el('line', { x1: 402, y1: 144, x2: 628, y2: 144, stroke: C.hair }, g3);
    var matRows = [
      ['1', '0  0', '—'],
      ['2', '0  1', '1  1  0'],
      ['3', '1  0', '1  0  0'],
      ['4', '1  1', '1  1  0']
    ];
    S.m3 = matRows.map(function (r, k) {
      var y = 178 + k * 38;
      var bg = el('rect', { x: 400, y: y - 22, width: 230, height: 32, rx: 6, fill: 'none' }, g3);
      tx(g3, 422, y, r[0], { 'font-size': 16, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
      tx(g3, 490, y, r[1], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      tx(g3, 586, y, r[2], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return bg;
    });
    S.note3 = el('g', {}, g3);
    el('rect', { x: 80, y: 374, width: 560, height: 84, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.4 }, S.note3);
    tx(S.note3, 360, 408, '経路（葉）単位で分類 → 制約が約半分、親子関係の基数制約も不要', { 'font-size': 15.5, fill: C.b, 'text-anchor': 'middle', 'font-weight': 600 });
    tx(S.note3, 360, 438, 'さらに木の上部を固定するトポロジーテンプレートで探索空間を分割', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });

    var p3 = S.p3 = el('g', {}, g3);
    tx(p3, PX, 118, '提案：経路符号化', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(p3, PX, 166, '① 辞書順の ' + m('P') + ' 本の経路', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(p3, PX + 18, 192, '向き ' + m('g') + '・終了 ' + m('t') + '・共有 ' + m('e'), { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 238, '② 深さ ' + m('S') + ' を直接指定', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(p3, PX + 18, 264, '深さ最小 → ノード数最小へ', { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 310, '③ トポロジー分割', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(p3, PX + 18, 336, '上部を固定して SAT を分割', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '論文 Fig. 1 の例', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 solved instances (20% and 50%) =====
    var g4 = S.g[3];
    var rows4 = [
      ['mindt（先行）', 394, 249, C.a],
      ['dtfinder-DT1', 457, 337, '#9AA4AF'],
      ['dtfinder', 458, 339, '#60A5FA'],
      ['dtfinder-T-O', 471, 341, '#3B82F6'],
      ['d-dtfinder', 519, 352, C.b]
    ];
    var X4 = 200, PER4 = 0.78; // 550 -> 429px (ends ~629)
    [0, 200, 400, 550].forEach(function (v) {
      el('line', { x1: X4 + v * PER4, x2: X4 + v * PER4, y1: 72, y2: 444, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      tx(g4, X4 + v * PER4, 468, String(v), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    });
    tx(g4, X4 + 275 * PER4, 496, '制限時間 1,000 秒以内の解決数（問）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.bars4 = [];
    rows4.forEach(function (r, i) {
      var y = 90 + i * 70;
      tx(g4, X4 - 14, y + 26, r[0], { 'font-size': 15.5, fill: i === 0 ? C.a : (i === 4 ? C.b : C.ink), 'text-anchor': 'end', 'font-weight': (i === 0 || i === 4) ? 650 : 400 });
      var b20 = el('rect', { x: X4, y: y, width: 0, height: 22, rx: 3, fill: r[3] }, g4);
      var b50 = el('rect', { x: X4, y: y + 26, width: 0, height: 22, rx: 3, fill: r[3], opacity: 0.45 }, g4);
      var l20 = tx(g4, X4 + r[1] * PER4 + 8, y + 17, String(r[1]), { 'font-size': 15, fill: r[3], 'font-weight': 650 });
      var l50 = tx(g4, X4 + r[2] * PER4 + 8, y + 43, String(r[2]), { 'font-size': 15, fill: C.muted, 'font-weight': 600 });
      S.bars4.push({ b20: b20, b50: b50, l20: l20, l50: l50, w20: r[1] * PER4, w50: r[2] * PER4, t0: 24.6 + i * 0.65 });
    });

    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 94, width: 18, height: 14, rx: 2, fill: C.b }, p4);
    tx(p4, PX + 28, 106, '上段：20% 標本（754 問）', { 'font-size': 15, fill: C.ink });
    el('rect', { x: PX, y: 124, width: 18, height: 14, rx: 2, fill: C.b, opacity: 0.45 }, p4);
    tx(p4, PX + 28, 136, '下段：50% 標本（709 問）', { 'font-size': 15, fill: C.ink });
    tx(p4, PX, 198, 'd-dtfinder が最多', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    tx(p4, PX, 228, '20%：394 → 519 問', { 'font-size': 16, fill: C.ink });
    tx(p4, PX, 256, '50%：249 → 352 問', { 'font-size': 16, fill: C.ink });
    tx(p4, PX, 312, '50% の dtfinder は分割で', { 'font-size': 15, fill: C.muted });
    tx(p4, PX, 336, '平均 CPU 60 秒 → 39 秒', { 'font-size': 15, fill: C.muted });
    tx(g4, 940, 520, '論文 Table 3 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 95, y: 42, width: 365, height: 68, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 277.5, 70, '20% / 50% ベンチマーク', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 277.5, 96, '519 問 / 352 問を解決（最多）', { 'font-size': 16.5, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 500, y: 42, width: 365, height: 68, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 682.5, 70, 'postoperative-patient（50%）', { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 682.5, 96, '深さ 11・37 ノード → 深さ 6・29 ノード', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 480, 174, 'SAT 2020', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    tx(g5, 480, 224, 'SAT-based Encodings for Optimal', { 'font-size': 33, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 266, 'Decision Trees with Explicit Paths', { 'font-size': 33, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 310, '経路を明示的に表す最適決定木の SAT 符号化', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 362, 'Mikoláš Janota, António Morgado', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 410, 'doi.org/10.1007/978-3-030-51825-7_35 · arXiv:2609.27874', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // scene 1
    S.n1.forEach(function (u) { u.g.setAttribute('opacity', seg(t, u.t0, u.t0 + 0.35)); });
    S.e1.forEach(function (u) { u.ln.setAttribute('opacity', seg(t, u.t0, u.t0 + 0.35)); });
    S.box1.setAttribute('opacity', seg(t, 4.4, 5.1));
    S.p1.setAttribute('opacity', seg(t, 1.8, 2.6));

    // scene 2
    S.cat2.forEach(function (c) {
      var s = H.ease(seg(t, c.t0, c.t0 + 0.7));
      c.bar.setAttribute('width', c.w * s);
      c.lb.setAttribute('opacity', seg(t, c.t0 + 0.45, c.t0 + 0.85));
    });
    S.big2.setAttribute('opacity', seg(t, 12.2, 12.9));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));

    // scene 3: cycle active path p=1..4 across 16.5..22.5
    var active = Math.floor((t - 16.8) / 1.3);
    if (active < 0) active = 0;
    if (active > 3) active = 3;
    var pathEdges = [[0, 2], [0, 3], [1, 4], [1, 5]];
    S.t3e.forEach(function (ln, idx) {
      var hit = pathEdges[active].indexOf(idx) >= 0;
      ln.setAttribute('stroke', hit ? C.b : C.gray);
      ln.setAttribute('stroke-width', hit ? 4 : 2);
    });
    S.leaf3.forEach(function (r, k) {
      r.setAttribute('fill', k === active ? C.bsoft : '#fff');
      r.setAttribute('stroke', k === active ? C.b : C.ink);
      r.setAttribute('stroke-width', k === active ? 2.4 : 1.5);
    });
    S.m3.forEach(function (bg, k) {
      bg.setAttribute('fill', k === active ? C.bsoft : 'none');
    });
    S.note3.setAttribute('opacity', seg(t, 18.0, 18.8));
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));

    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.b20.setAttribute('width', b.w20 * s);
      b.b50.setAttribute('width', b.w50 * s);
      b.l20.setAttribute('opacity', seg(t, b.t0 + 0.55, b.t0 + 0.95));
      b.l50.setAttribute('opacity', seg(t, b.t0 + 0.55, b.t0 + 0.95));
    });
    S.p4.setAttribute('opacity', seg(t, 26.8, 27.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
