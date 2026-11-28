// =====================================================================
// teaser-scenes.js — Yang, Dai, Hou, Zhao, Xu, Song, Zhu,
// Revisiting Reciprocal Recommender Systems: Metrics, Formulation, and Method (KDD 2024).
// Unofficial explainer. Uses template teaser-engine.js (Japanese-only, H.tx).
// Scenes 1-2 use the paper's Fig. 2 worked example (4 users, top-1).
// Scene 3 is a schematic of CRRS's bilateral-treatment & vacant-slot reranking (labelled 模式図).
// Scene 4 uses exact CRecall@50 values from Table 3 of the paper.
// Colours: orange = conventional single-sided metrics, redundant recommendations, baselines;
//          blue   = proposed holistic metrics (CRecall/SRecall/RNDCG) and CRRS.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '<span class="A">従来の片側ごとの評価</span>では、同じ組を双方に重複推薦しても二重に成功と数えてしまう。',
    '提案の <span class="B">CRecall</span> と <span class="B">SRecall</span> は重複の有無と実際のマッチ組数の違いを区別できる。',
    '<span class="B">CRRS</span> は両側への推薦を 2 つの介入とみなし、空き枠の期待値 ȳ を加えて再順位づけする。',
    '求人とデートの実データで、<span class="B">CRRS</span> は MF 系・グラフ系の双方で最も高い CRecall@50 を得た。',
    'システム全体を測る 5 つの指標と両側介入の因果モデルで、相互推薦の評価と手法をともに見直した。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 665;

  function panel(g, x, y, title, color, lines) {
    var p = el('g', {}, g), yy = y;
    if (title) {
      tx(p, x, yy, title, { 'font-size': 18, 'font-weight': 650, fill: color || C.ink });
      yy += 42;
    }
    lines.forEach(function (l) {
      if (l === null) { yy += 20; return; }
      if (typeof l === 'string') l = [l];
      tx(p, x, yy, l[0], { 'font-size': l[1] || 15, fill: l[2] || C.ink, 'font-weight': l[3] || 400 });
      yy += (l[1] || 15) + 11;
    });
    return p;
  }

  function addArrowDefs(svg) {
    var defs = el('defs', {}, svg);
    [['arrA', C.a], ['arrB', C.b], ['arrInk', C.ink]].forEach(function (pair) {
      var m = el('marker', {
        id: pair[0], viewBox: '0 0 10 10', refX: 8, refY: 5,
        markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse'
      }, defs);
      el('path', { d: 'M0,1 L9,5 L0,9 z', fill: pair[1] }, m);
    });
  }

  function drawFourUsers(parent, ox, oy) {
    // 4 nodes: a1, a2 on top; b1, b2 on bottom
    el('rect', { x: ox + 40, y: oy, width: 46, height: 38, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, parent);
    tx(parent, ox + 63, oy + 25, '<tspan ' + MI + '>a</tspan>₁', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    el('rect', { x: ox + 174, y: oy, width: 46, height: 38, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, parent);
    tx(parent, ox + 197, oy + 25, '<tspan ' + MI + '>a</tspan>₂', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    el('circle', { cx: ox + 63, cy: oy + 148, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, parent);
    tx(parent, ox + 63, oy + 154, '<tspan ' + MI + '>b</tspan>₁', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    el('circle', { cx: ox + 197, cy: oy + 148, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, parent);
    tx(parent, ox + 197, oy + 154, '<tspan ' + MI + '>b</tspan>₂', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
  }

  function build(svg) {
    addArrowDefs(svg);
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== Scene 1: Independent evaluation double-counts redundant recommendations =====
    var g1 = S.g[0];
    tx(g1, 70, 72, '4 人の利用者に上位 1 件ずつ推薦（4 組すべてがマッチ候補）', { 'font-size': 16, fill: C.muted });

    // Left diagram: Case (1) - 4 distinct pairs
    S.s1Left = el('g', {}, g1);
    tx(S.s1Left, 195, 114, '例 (1) 重複なし → 4 組マッチ', { 'font-size': 15, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: 128, y1: 174, x2: 128, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Left);
    el('line', { x1: 262, y1: 174, x2: 262, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Left);
    el('line', { x1: 128, y1: 174, x2: 262, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Left);
    el('line', { x1: 262, y1: 174, x2: 128, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Left);
    // 4 single-sided arrows
    el('line', { x1: 112, y1: 256, x2: 112, y2: 184, stroke: C.b, 'stroke-width': 2.5, 'marker-end': 'url(#arrB)' }, S.s1Left);
    el('line', { x1: 278, y1: 256, x2: 278, y2: 184, stroke: C.b, 'stroke-width': 2.5, 'marker-end': 'url(#arrB)' }, S.s1Left);
    el('line', { x1: 238, y1: 186, x2: 176, y2: 226, stroke: C.b, 'stroke-width': 2.5, 'marker-end': 'url(#arrB)' }, S.s1Left);
    el('line', { x1: 204, y1: 232, x2: 242, y2: 256, stroke: C.b, 'stroke-width': 2.5, 'marker-end': 'url(#arrB)' }, S.s1Left);
    drawFourUsers(S.s1Left, 65, 136);
    tx(S.s1Left, 195, 355, '従来 Recall = 0.5', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });

    // Right diagram: Case (2) - 2 mutual pairs
    S.s1Right = el('g', {}, g1);
    tx(S.s1Right, 480, 114, '例 (2) 双方に重複 → 2 組だけ', { 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    el('line', { x1: 413, y1: 174, x2: 413, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Right);
    el('line', { x1: 547, y1: 174, x2: 547, y2: 262, stroke: C.ink, 'stroke-width': 2 }, S.s1Right);
    el('line', { x1: 413, y1: 174, x2: 547, y2: 262, stroke: C.gray, 'stroke-width': 1.8, 'stroke-dasharray': '5 5' }, S.s1Right);
    el('line', { x1: 547, y1: 174, x2: 413, y2: 262, stroke: C.gray, 'stroke-width': 1.8, 'stroke-dasharray': '5 5' }, S.s1Right);
    // mutual arrows
    el('line', { x1: 397, y1: 256, x2: 397, y2: 184, stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#arrA)' }, S.s1Right);
    el('line', { x1: 429, y1: 184, x2: 429, y2: 256, stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#arrA)' }, S.s1Right);
    el('line', { x1: 531, y1: 184, x2: 531, y2: 256, stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#arrA)' }, S.s1Right);
    el('line', { x1: 563, y1: 256, x2: 563, y2: 184, stroke: C.a, 'stroke-width': 2.5, 'marker-end': 'url(#arrA)' }, S.s1Right);
    drawFourUsers(S.s1Right, 350, 136);
    tx(S.s1Right, 480, 355, '従来 Recall = 0.5', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });

    S.s1Warn = el('g', {}, g1);
    el('rect', { x: 120, y: 396, width: 440, height: 50, rx: 10, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 1.5 }, S.s1Warn);
    tx(S.s1Warn, 340, 427, 'マッチ組数は 2 倍違うのに、従来 Recall は同じ 0.5', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });

    S.p1 = panel(g1, PX, 140, '片側評価の盲点', C.a, [
      ['A 側と B 側を別々に測る', 15],
      null,
      ['同じ組を双方に推薦しても', 15, C.muted],
      ['2 件の成功と数えてしまう', 15, C.muted]
    ]);
    tx(g1, 940, 518, '論文 Fig. 2 の例にもとづく', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 2: Proposed metrics distinguish the 3 cases =====
    var g2 = S.g[1];
    tx(g2, 70, 72, '論文 Fig. 2 の 3 例を従来指標と提案指標で比べる', { 'font-size': 16, 'font-weight': 600, fill: C.ink });

    var X0 = 195, X1 = 525;
    function sx2(v) { return X0 + v * (X1 - X0); }
    el('line', { x1: X0, x2: X0, y1: 106, y2: 432, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    [0, 0.5, 1.0].forEach(function (v) {
      el('line', { x1: sx2(v), x2: sx2(v), y1: 106, y2: 432, stroke: C.hair }, g2);
      tx(g2, sx2(v), 454, v === 1 ? '1.0' : String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });

    var cases2 = [
      { name: '例 (1) 4 組', rec: 0.5, cr: 1.0, sr: 0.0, crLab: '1.00', srLab: '0.00' },
      { name: '例 (3) 3 組', rec: 0.5, cr: 0.75, sr: 0.25, crLab: '0.75', srLab: '0.25' },
      { name: '例 (2) 2 組', rec: 0.5, cr: 0.5, sr: 0.5, crLab: '0.50', srLab: '0.50' }
    ];
    S.bars2 = [];
    cases2.forEach(function (c, i) {
      var y = 122 + i * 102;
      tx(g2, X0 - 14, y + 36, c.name, { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' });
      // Recall (orange)
      var r1 = el('rect', { x: X0, y: y, width: 0, height: 20, rx: 3, fill: C.a, 'fill-opacity': 0.75 }, g2);
      var l1 = tx(g2, sx2(c.rec) + 8, y + 16, 'Recall 0.50', { 'font-size': 14, fill: C.a });
      // CRecall (blue)
      var r2 = el('rect', { x: X0, y: y + 25, width: 0, height: 20, rx: 3, fill: C.b }, g2);
      var l2 = tx(g2, sx2(c.cr) + 8, y + 41, 'CRecall ' + c.crLab, { 'font-size': 14, 'font-weight': 650, fill: C.b });
      // SRecall (blue soft/muted)
      var r3 = el('rect', { x: X0, y: y + 50, width: 0, height: 20, rx: 3, fill: C.b, 'fill-opacity': 0.4 }, g2);
      var l3 = tx(g2, sx2(c.sr) + 8, y + 66, 'SRecall ' + c.srLab, { 'font-size': 14, fill: C.muted });
      S.bars2.push({
        r1: r1, l1: l1, w1: sx2(c.rec) - X0,
        r2: r2, l2: l2, w2: sx2(c.cr) - X0,
        r3: r3, l3: l3, w3: sx2(c.sr) - X0,
        t0: 8.8 + i * 0.7
      });
    });

    S.p2 = panel(g2, PX, 126, '5 つの新指標', C.b, [
      ['1. 全体のカバー率', 15, C.b, 650],
      ['CRecall / CPrecision', 14, C.ink],
      ['重複を 1 回だけ数える', 14, C.muted],
      null,
      ['2. 両側の安定性', 15, C.b, 650],
      ['SRecall / SPrecision', 14, C.ink],
      ['双方同時推薦を測る', 14, C.muted],
      null,
      ['3. 人数差の補正', 15, C.b, 650],
      ['RNDCG@K（n, m で重み）', 14, C.ink]
    ]);
    tx(g2, 940, 518, '論文 Fig. 2 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 3: CRRS bilateral treatments + vacant-slot reranking =====
    var g3 = S.g[2];
    tx(g3, 70, 70, 'CRRS：3 通りの介入モデルと空き枠の期待値で最良の推薦を選ぶ', { 'font-size': 16, 'font-weight': 600, fill: C.ink });

    // Input pair box
    el('rect', { x: 65, y: 205, width: 112, height: 84, rx: 10, fill: C.panel, stroke: C.ink, 'stroke-width': 1.6 }, g3);
    tx(g3, 121, 242, '組 (<tspan ' + MI + '>a</tspan>ᵢ, <tspan ' + MI + '>b</tspan>ⱼ)', { 'font-size': 16, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g3, 121, 268, '事前学習済み', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    // Three treatment branches
    var branches = [
      { y: 120, code: 'T = (1, 0)', desc: 'A 側のみ推薦', eq: 'ŷ₁₀ + ȳ(bⱼ)', col: C.b, hi: true },
      { y: 218, code: 'T = (1, 1)', desc: '両側に推薦', eq: 'ŷ₁₁ + 0', col: C.ink, hi: false },
      { y: 316, code: 'T = (0, 1)', desc: 'B 側のみ推薦', eq: 'ŷ₀₁ + ȳ(aᵢ)', col: C.ink, hi: false }
    ];
    S.br3 = branches.map(function (br, i) {
      var bg = el('g', {}, g3);
      el('line', { x1: 177, y1: 247, x2: 228, y2: br.y + 30, stroke: C.muted, 'stroke-width': 1.6, 'marker-end': 'url(#arrInk)' }, bg);
      var box = el('rect', {
        x: 235, y: br.y, width: 225, height: 62, rx: 10,
        fill: '#fff', stroke: C.hair, 'stroke-width': 1.8
      }, bg);
      tx(bg, 252, br.y + 26, br.code + '（' + br.desc + '）', { 'font-size': 14, 'font-weight': 650, fill: C.ink });
      tx(bg, 252, br.y + 49, '期待値：' + br.eq, { 'font-size': 15, fill: C.b, 'font-weight': 600 });
      el('line', { x1: 460, y1: br.y + 30, x2: 508, y2: 247, stroke: C.muted, 'stroke-width': 1.6 }, bg);
      return { g: bg, box: box, hi: br.hi, t0: 17.0 + i * 0.55 };
    });

    // IsMax box
    S.max3 = el('g', {}, g3);
    el('rect', { x: 512, y: 205, width: 118, height: 84, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, S.max3);
    tx(S.max3, 571, 240, 'IsMax', { 'font-size': 18, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    tx(S.max3, 571, 267, '最大の介入を選ぶ', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });

    S.vac3 = el('g', {}, g3);
    el('rect', { x: 65, y: 410, width: 565, height: 52, rx: 10, fill: C.bsoft }, S.vac3);
    tx(S.vac3, 348, 442, '推薦しない側の「空き枠」によるマッチ期待値 ȳ を加える', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });

    S.p3 = panel(g3, PX, 140, 'CRRS の特徴', C.b, [
      ['モデル非依存', 16, C.b, 650],
      ['BPRMF や LightGCN など', 15],
      ['既存モデルに適用できる', 15],
      null,
      ['2 段階の学習', 16, C.b, 650],
      ['事前学習のあと、介入別の', 15, C.muted],
      ['データで微調整する', 15, C.muted]
    ]);
    tx(g3, 940, 518, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 4: Real results from Table 3 (CRecall@50) =====
    var g4 = S.g[3];
    tx(g4, 70, 58, '実データの CRecall@50（上位 50 件、論文 Table 3）', { 'font-size': 16, 'font-weight': 650, fill: C.ink });

    var X40 = 260, X41 = 790;
    function sx4(v) { return X40 + (v / 0.52) * (X41 - X40); }
    el('line', { x1: X40, x2: X40, y1: 88, y2: 462, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [0, 0.2, 0.4].forEach(function (v) {
      el('line', { x1: sx4(v), x2: sx4(v), y1: 88, y2: 462, stroke: C.hair }, g4);
      tx(g4, sx4(v), 484, String(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });

    var rows4 = [
      { label: '求人・BPRMF', val: 0.3388, col: C.a, op: 0.5, extra: '' },
      { label: '求人・LFRR', val: 0.3530, col: C.a, op: 1.0, extra: '' },
      { label: '求人・CRRS（BPRMF）', val: 0.3968, col: C.b, op: 1.0, extra: '（8,913 組）' },
      { label: '求人・LightGCN', val: 0.3609, col: C.a, op: 0.5, extra: '' },
      { label: '求人・DPGNN', val: 0.4555, col: C.a, op: 1.0, extra: '' },
      { label: '求人・CRRS（LightGCN）', val: 0.4670, col: C.b, op: 1.0, extra: '（10,490 組）' },
      { label: 'デート・LightGCN', val: 0.2549, col: C.a, op: 0.5, extra: '' },
      { label: 'デート・DPGNN', val: 0.3007, col: C.a, op: 1.0, extra: '' },
      { label: 'デート・CRRS（LightGCN）', val: 0.3387, col: C.b, op: 1.0, extra: '（1,743 組）' }
    ];
    S.bars4 = rows4.map(function (r, i) {
      var gap = Math.floor(i / 3) * 14;
      var y = 96 + i * 37 + gap;
      tx(g4, X40 - 12, y + 20, r.label, {
        'font-size': 14, fill: r.col === C.b ? C.b : C.ink,
        'font-weight': r.col === C.b ? 650 : 400, 'text-anchor': 'end'
      });
      var rect = el('rect', { x: X40, y: y + 4, width: 0, height: 22, rx: 3, fill: r.col, 'fill-opacity': r.op }, g4);
      var lab = tx(g4, sx4(r.val) + 8, y + 20, r.val.toFixed(4) + r.extra, {
        'font-size': 14, 'font-weight': r.col === C.b ? 650 : 500, fill: r.col
      });
      return { rect: rect, lab: lab, w: sx4(r.val) - X40, t0: 24.5 + i * 0.45 };
    });
    tx(g4, 940, 518, '論文 Table 3 の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 5: Title card =====
    var g5 = S.g[4];
    var cards = [
      ['求人 CRecall@50（グラフ系）', 'DPGNN 0.4555 → CRRS 0.4670'],
      ['デート CRecall@50（グラフ系）', 'DPGNN 0.3007 → CRRS 0.3387']
    ];
    cards.forEach(function (c, i) {
      var cx = 130 + i * 370;
      el('rect', { x: cx, y: 42, width: 330, height: 72, rx: 12, fill: C.bsoft }, g5);
      tx(g5, cx + 165, 70, c[0], { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
      tx(g5, cx + 165, 98, c[1], { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    tx(g5, 480, 174, 'KDD 2024', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 });
    tx(g5, 480, 222, 'Revisiting Reciprocal Recommender Systems:', { 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 260, 'Metrics, Formulation, and Method', { 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 304, '相互推薦システムの再検討：評価指標、定式化、手法', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 356, 'Chen Yang, Sunhao Dai, Yupeng Hou, Wayne Xin Zhao,', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 382, 'Jun Xu, Yang Song, Hengshu Zhu', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 430, 'doi.org/10.1145/3637528.3671734  ·  github.com/RUCAIBox/CRRS', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 512, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });

    // Scene 1
    S.s1Left.setAttribute('opacity', seg(t, 0.5, 1.2));
    S.s1Right.setAttribute('opacity', seg(t, 1.8, 2.5));
    S.s1Warn.setAttribute('opacity', seg(t, 3.6, 4.3));
    S.p1.setAttribute('opacity', seg(t, 2.6, 3.3));

    // Scene 2
    S.bars2.forEach(function (b) {
      var k1 = seg(t, b.t0, b.t0 + 0.6);
      var k2 = seg(t, b.t0 + 0.35, b.t0 + 0.95);
      var k3 = seg(t, b.t0 + 0.7, b.t0 + 1.3);
      b.r1.setAttribute('width', b.w1 * k1);
      b.l1.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8));
      b.r2.setAttribute('width', b.w2 * k2);
      b.l2.setAttribute('opacity', seg(t, b.t0 + 0.75, b.t0 + 1.15));
      b.r3.setAttribute('width', b.w3 * k3);
      b.l3.setAttribute('opacity', seg(t, b.t0 + 1.1, b.t0 + 1.5));
    });
    S.p2.setAttribute('opacity', seg(t, 9.2, 10.0));

    // Scene 3
    var hiK = seg(t, 19.6, 20.4);
    S.br3.forEach(function (b) {
      b.g.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.5));
      if (b.hi) {
        b.box.setAttribute('stroke', hiK > 0.5 ? C.b : C.hair);
        b.box.setAttribute('fill', hiK > 0.5 ? C.bsoft : '#fff');
        b.box.setAttribute('stroke-width', hiK > 0.5 ? '2.4' : '1.8');
      }
    });
    S.max3.setAttribute('opacity', seg(t, 19.0, 19.7));
    S.vac3.setAttribute('opacity', seg(t, 20.2, 20.9));
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));

    // Scene 4
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * seg(t, b.t0, b.t0 + 0.65));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.45, b.t0 + 0.85));
    });
  }

  Teaser.start({
    root: document.getElementById('teaser'),
    bounds: BOUNDS,
    captions: CAPTIONS,
    build: build,
    render: render,
    still: 30
  });
})();
