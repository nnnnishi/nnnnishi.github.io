// ---- shared helpers for the reciprocal-rec explainer teasers (Japanese-only pages) ----
window.TZ = (function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  function T(g, x, y, s, attrs) { return H.t2(g, x, y, s, '', attrs || {}); }
  // explanation column: title + lines [[text, size?, fill?, weight?], ...]
  function panel(g, x, y, title, color, lines) {
    var p = el('g', {}, g), yy = y;
    if (title) { T(p, x, yy, title, { 'font-size': 18, 'font-weight': 650, fill: color || C.ink }); yy += 44; }
    lines.forEach(function (l) {
      if (l === null) { yy += 22; return; }
      if (typeof l === 'string') l = [l];
      T(p, x, yy, l[0], { 'font-size': l[1] || 16, fill: l[2] || C.ink, 'font-weight': l[3] || 400 });
      yy += (l[1] || 16) + 10;
    });
    return p;
  }
  // paired horizontal bars (orange vs blue) on a common linear axis
  // o: {x0, x1, v0, v1, y0, rowH, rows:[{label, a, b, la, lb}], t0, dt, ticks:[..], fmt}
  function pairs(g, o) {
    var sc = function (v) { return o.x0 + (v - o.v0) / (o.v1 - o.v0) * (o.x1 - o.x0); };
    var yEnd = o.y0 + o.rows.length * o.rowH;
    (o.ticks || []).forEach(function (v) {
      el('line', { x1: sc(v), x2: sc(v), y1: o.y0 - 8, y2: yEnd, stroke: C.hair, 'stroke-width': 1 }, g);
      el('text', { x: sc(v), y: yEnd + 22, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.fmt ? o.fmt(v) : String(v);
    });
    el('line', { x1: o.x0, x2: o.x0, y1: o.y0 - 8, y2: yEnd, stroke: C.ink, 'stroke-width': 1.5 }, g);
    var items = [];
    o.rows.forEach(function (r, i) {
      var y = o.y0 + i * o.rowH, bh = (o.rowH - 14) / 2;
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + k[2] * (bh + 2), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + k[2] * (bh + 2) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
        lab.textContent = r['l' + k[0]] || String(r[k[0]]);
        items.push({ rect: rect, lab: lab, w: sc(r[k[0]]) - o.x0, t0: o.t0 + i * (o.dt || 0.5) + k[2] * 0.25 });
      });
    });
    return items;
  }
  function renderBars(items, t) {
    items.forEach(function (b) {
      b.rect.setAttribute('width', Math.max(0, b.w * H.ease(seg(t, b.t0, b.t0 + 0.7))));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }
  // title card: o = {cards:[[label, value]...], venue, title:[l1,l2], sub, authors:[..lines], url}
  function title(g, o) {
    var n = o.cards.length, w = 300, gap = 60, x = 480 - (n * w + (n - 1) * gap) / 2;
    o.cards.forEach(function (c, i) {
      var cx = x + i * (w + gap);
      el('rect', { x: cx, y: 40, width: w, height: 70, rx: 12, fill: C.bsoft }, g);
      T(g, cx + w / 2, 68, c[0], { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      T(g, cx + w / 2, 96, c[1], { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = o.venue;
    o.title.forEach(function (l, i) {
      el('text', { x: 480, y: 220 + i * 40, 'font-size': o.tsize || 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = l;
    });
    var y = 220 + o.title.length * 40;
    T(g, 480, y + 2, o.sub, { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    o.authors.forEach(function (a, i) {
      el('text', { x: 480, y: y + 50 + i * 26, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = a;
    });
    el('text', { x: 480, y: y + 60 + o.authors.length * 26 + 20, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.url;
    T(g, 480, 512, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }
  function note(g, s) { return T(g, 940, 520, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); }
  function fades(gs, B, t) {
    gs.forEach(function (g, i) {
      var a = B[i], b = B[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
  }
  // a small binary tree drawn from a nested spec: {l:'B', y:[..], n:[..]} or {leaf:'1'}
  // returns {g, nodes:[{el, depth}], edges:[...]} ; dx halves per level
  function tree(g, spec, x, y, dx, dy, color) {
    var out = { nodes: [], edges: [] };
    (function rec(s, x, y, dx, d) {
      if (s.leaf != null) {
        var r = el('rect', { x: x - 20, y: y - 16, width: 40, height: 32, rx: 6, fill: '#fff', stroke: color, 'stroke-width': 1.8 }, g);
        var tx = el('text', { x: x, y: y + 6, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g); tx.textContent = s.leaf;
        out.nodes.push({ el: r, tx: tx, d: d, leaf: true });
        return;
      }
      [[s.yes, -1, '1'], [s.no, 1, '0']].forEach(function (c) {
        var e = el('line', { x1: x, y1: y + 18, x2: x + c[1] * dx, y2: y + dy - 18, stroke: color, 'stroke-width': 1.8 }, g);
        var lb = el('text', { x: x + c[1] * dx / 2 + c[1] * 10, y: y + dy / 2 + 4, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g); lb.textContent = c[2];
        out.edges.push({ el: e, lb: lb, d: d });
        rec(c[0], x + c[1] * dx, y + dy, dx / 2, d + 1);
      });
      var ci = el('circle', { cx: x, cy: y, r: 20, fill: color }, g);
      var tx = el('text', { x: x, y: y + 6, 'font-size': 17, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g); tx.textContent = s.l;
      out.nodes.push({ el: ci, tx: tx, d: d });
    })(spec, x, y, dx, 0);
    return out;
  }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree };
})();
// =====================================================================
// teaser-scenes.js — Tomita, Togashi, Hashizume, Ohsaka, Fast and Examination-agnostic Reciprocal
// Recommendation in Matching Markets (RecSys 2023). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the expected
// numbers of matches in Table 2 of the paper (synthetic, n = 100, lambda = 0.5, v(k) = 1/k).
// Colours: orange = Su et al.'s SW ranking and the simple baselines; blue = TU-matching ranking.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">Su らの方法</span>は求職者ごとに大きな行列を持ち、利用者が順位ごとに推薦を見る確率の関数を使う。', en: '' },
    { ja: 'TU マッチングでは、組が生む余剰を両者で分け合い、市場全体で需要と供給が釣り合う均衡を考える。', en: '' },
    { ja: '<span class="B">均衡のマッチング確率</span>を IPFP で求め、その大きい順に並べる。見る確率の関数は使わない。', en: '' },
    { ja: '合成データの期待マッチ数は、TU が 152.4、Su らの方法が 152.3 でほぼ同じだった。', en: '' },
    { ja: 'マッチング理論の均衡で、期待マッチ数の大きい推薦を軽い計算で作れることを示した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: SW keeps a |J| x |J| matrix per candidate =====
    var g1 = S.g[0];
    T(g1, 80, 96, '求職者ごとに |J| × |J| の二重確率行列', { 'font-size': 15, fill: C.muted });
    S.mats1 = [];
    for (var k = 0; k < 5; k++) {
      var mg = el('g', {}, g1), x0 = 90 + k * 22, y0 = 120 + k * 22;
      el('rect', { x: x0, y: y0, width: 200, height: 200, rx: 6, fill: '#fff', stroke: C.a, 'stroke-width': 1.6 }, mg);
      for (var i = 0; i < 6; i++) for (var j = 0; j < 6; j++)
        el('rect', { x: x0 + 8 + j * 31, y: y0 + 8 + i * 31, width: 27, height: 27, rx: 3, fill: C.a, opacity: 0.12 + ((i * 7 + j * 3 + k) % 5) * 0.12 }, mg);
      S.mats1.push({ g: mg, t0: 1.0 + k * 0.5 });
    }
    S.v1 = T(g1, 80, 440, '最適化に v(k)（順位 k の推薦を見る確率）を使う', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, 'Su らの方法（SW）', C.a, [['記憶と計算は', 15], ['O(|C| · |J|²) で増える', 15], null, ['v の仮定が実際と違うと', 15, C.muted], ['マッチ数が下がる', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: TU matching splits the surplus =====
    var g2 = S.g[1];
    el('circle', { cx: 160, cy: 250, r: 34, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g2);
    T(g2, 160, 256, '求職者 c', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    el('rect', { x: 400, y: 216, width: 90, height: 68, rx: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g2);
    T(g2, 445, 256, '雇用者 j', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    S.sur2 = el('g', {}, g2);
    el('rect', { x: 220, y: 150, width: 150, height: 44, rx: 22, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5 }, S.sur2);
    T(S.sur2, 295, 178, '余剰 p_cj + p_jc', { 'font-size': 15, 'text-anchor': 'middle', fill: C.b, 'font-weight': 600 });
    S.tr2 = el('g', {}, g2);
    el('line', { x1: 398, y1: 270, x2: 200, y2: 270, stroke: C.b, 'stroke-width': 2.2, 'marker-end': '' }, S.tr2);
    el('path', { d: 'M200,270 l10,-6 v12 z', fill: C.b }, S.tr2);
    T(S.tr2, 300, 300, '移転 τ（給与のようなもの）', { 'font-size': 14, 'text-anchor': 'middle', fill: C.b });
    S.opt2 = T(g2, 80, 400, '相手を選ばない選択肢 0 もある。誤差がガンベル分布なら均衡は閉じた形で書ける', { 'font-size': 15, fill: C.ink });
    S.p2 = TZ.panel(g2, PX, 140, 'TU マッチング', C.b, [['Choo と Siow のモデル', 15], null, ['各利用者のマッチングの', 15], ['確率の和が 1 になる', 15], ['ように釣り合わせる', 15]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: IPFP and sorting by mu* =====
    var g3 = S.g[2];
    S.eq3 = T(g3, 80, 110, 'μ*(c, j) = exp((p_cj + p_jc) / 2β) · A_c · B_j', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    T(g3, 80, 150, 'A_c と B_j を交互に更新する（IPFP）', { 'font-size': 15, fill: C.muted });
    var mus = [0.31, 0.22, 0.17, 0.12, 0.08];
    S.bars3 = mus.map(function (m, k) {
      var y = 190 + k * 46;
      T(g3, 80, y + 20, '雇用者 ' + 'ABCDE'[k], { 'font-size': 15, fill: C.ink });
      var r = el('rect', { x: 190, y: y + 4, width: 0, height: 24, rx: 4, fill: C.b }, g3);
      var lab = el('text', { x: 196 + m * 900, y: y + 22, 'font-size': 14, fill: C.b, 'font-weight': 600 }, g3);
      lab.textContent = (k + 1) + ' 位';
      return { r: r, lab: lab, w: m * 900, t0: 18.4 + k * 0.4 };
    });
    S.p3 = TZ.panel(g3, PX, 140, '均衡の確率の順に並べる', C.b, [['1 反復は O(|J| · |C|)', 15], ['多くは 50 回未満で収束', 15], null, ['v(k) を一度も使わない', 15, C.muted], ['（examination-agnostic）', 15, C.muted]]);
    TZ.note(g3, '模式図（μ* の値は解説者が置いた例）');

    // ===== scene 4: Table 2 =====
    var g4 = S.g[3];
    T(g4, 70, 64, '合成データの期待マッチ数（n = 100、偏り 0.5、v(k) = 1/k）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [['Naive', 106.5, C.a, 0.55], ['Reciprocal', 129.8, C.a, 1], ['SW（Su ら）', 152.3, C.a, 1], ['TU（β = 1）', 152.4, C.b, 1]];
    var X0 = 240, X1 = 760;
    function sx(v) { return X0 + v / 170 * (X1 - X0); }
    el('line', { x1: X0, x2: X0, y1: 100, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.bars4 = rows.map(function (r, i) {
      var y = 120 + i * 68;
      T(g4, X0 - 12, y + 26, r[0], { 'font-size': 15, fill: r[2], 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y + 6, width: 0, height: 30, fill: r[2], 'fill-opacity': r[3] }, g4);
      var lab = el('text', { x: sx(r[1]) + 8, y: y + 27, 'font-size': 15, 'font-weight': 600, fill: r[2] }, g4);
      lab.textContent = r[1].toFixed(1);
      return { rect: rect, lab: lab, w: sx(r[1]) - X0, t0: 24.6 + i * 0.6 };
    });
    S.n4 = T(g4, 70, 450, 'n = 500 では SW は計算できなかった', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '論文 Table 2 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['期待マッチ数（合成データ）', 'SW 152.3 ／ TU 152.4'], ['見る確率の関数', '使わない']],
      venue: 'RECSYS 2023', title: ['Fast and Examination-agnostic Reciprocal', 'Recommendation in Matching Markets'], tsize: 28,
      sub: 'マッチング市場の、速く、見る確率の関数によらない相互推薦', authors: ['Yoji Tomita, Riku Togashi, Yuriko Hashizume, Naoto Ohsaka'], url: 'doi.org/10.1145/3604915.3608774'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.mats1.forEach(function (m) { m.g.setAttribute('opacity', seg(t, m.t0, m.t0 + 0.4)); });
    S.v1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 3.0, 3.8));
    S.sur2.setAttribute('opacity', seg(t, 9.0, 9.6));
    S.tr2.setAttribute('opacity', seg(t, 10.4, 11.0));
    S.opt2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.bars3.forEach(function (b) {
      b.r.setAttribute('width', b.w * seg(t, b.t0, b.t0 + 0.7));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p3.setAttribute('opacity', seg(t, 17.2, 18.0));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.n4.setAttribute('opacity', seg(t, 28.0, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
