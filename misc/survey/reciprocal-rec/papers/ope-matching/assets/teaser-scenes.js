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
// teaser-scenes.js — Hayashi, Goda, Saito, Off-Policy Evaluation and Learning for Matching Markets
// (RecSys 2025). Unofficial explainer.
// All scenes are schematics with explainer-chosen toy values (labelled 模式図); the paper reports its MSE
// only in figures. The data sizes in scene 5 are from Table 1 of the paper.
// Colours: orange = IPS / DR weighting the rare final match; blue = DiPS / DPR.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '求人マッチングでは、企業がスカウトを送り、求職者が返信したときだけマッチになる。', en: '' },
    { ja: '<span class="A">IPS</span> はまれなマッチの記録だけに重みをかけるので、ログを取り直すたびに推定値が大きくぶれる。', en: '' },
    { ja: '<span class="B">DiPS</span> は観測の多いスカウトの記録に重みをかけ、返信の確率は回帰モデルで補う。', en: '' },
    { ja: '<span class="B">DPR</span> はさらに DR の補正を加える。偏りは 2 段目のモデルの誤差だけから来る。', en: '' },
    { ja: '両側の反応の積で決まる疎なマッチに合わせて、オフ方策評価を作り直した。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two-stage funnel =====
    var g1 = S.g[0];
    var stages = [['推薦された組', 100, C.gray], ['スカウト s = 1', 30, C.b], ['返信 r = 1（マッチ）', 4, C.ink]];
    S.st1 = stages.map(function (s, k) {
      var y = 130 + k * 100, gg = el('g', {}, g1);
      T(gg, 80, y + 26, s[0], { 'font-size': 15, fill: C.ink });
      for (var i = 0; i < s[1]; i++) {
        el('circle', { cx: 290 + (i % 25) * 13, cy: y + 8 + Math.floor(i / 25) * 13, r: 4.5, fill: s[2] }, gg);
      }
      return { g: gg, t0: 1.0 + k * 1.2 };
    });
    S.f1 = T(g1, 80, 460, 'マッチ m = s × r　価値 V(π) = 平均 Σ π(j|c) · q_s · q_r', { 'font-size': 16, 'font-weight': 650, fill: C.ink });
    S.p1 = TZ.panel(g1, PX, 140, '2 段階の報酬', C.ink, [['s：企業がスカウトを送る', 15], ['r：求職者が返信する', 15], null, ['実データの報酬の密度は', 15, C.muted], ['1.2%', 15, C.muted]]);
    TZ.note(g1, '模式図（点の数は解説者が置いた例）');

    // ===== scene 2: IPS estimates scatter =====
    var g2 = S.g[1];
    T(g2, 80, 96, 'ログを取り直したときの推定値の分布', { 'font-size': 15, fill: C.muted });
    el('line', { x1: 100, x2: 580, y1: 380, y2: 380, stroke: C.ink, 'stroke-width': 1.4 }, g2);
    el('line', { x1: 340, x2: 340, y1: 120, y2: 392, stroke: C.ink, 'stroke-dasharray': '4 4' }, g2);
    T(g2, 340, 410, '真の価値', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    var r = H.rng(11);
    S.dots2 = [];
    for (var i = 0; i < 40; i++) {
      var x = 340 + (r() + r() + r() - 1.5) * 300, y = 360 - (i % 8) * 26;
      S.dots2.push({ c: el('circle', { cx: x, cy: y, r: 6, fill: C.a, opacity: 0 }, g2), t0: 8.6 + i * 0.07 });
    }
    S.p2 = TZ.panel(g2, PX, 140, 'IPS', C.a, [['重み π/π₀ を', 15], ['マッチ m にかける', 15], null, ['分散は重みの 2 乗 ×', 15, C.muted], ['マッチのばらつき', 15, C.muted], ['DR も同じ項を持つ', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: DiPS =====
    var g3 = S.g[2];
    S.eq3 = T(g3, 80, 120, 'DiPS = 平均 [ (π/π₀) · s ] · q̂_r(c, j)', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    S.a3 = el('g', {}, g3);
    el('rect', { x: 80, y: 160, width: 250, height: 80, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5 }, S.a3);
    T(S.a3, 205, 195, '1 段目：重みをかける', { 'font-size': 15, 'text-anchor': 'middle', fill: C.b, 'font-weight': 600 });
    T(S.a3, 205, 222, 'スカウトは観測が多い', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    S.b3 = el('g', {}, g3);
    el('rect', { x: 360, y: 160, width: 250, height: 80, rx: 10, fill: '#fff', stroke: C.b, 'stroke-width': 1.5 }, S.b3);
    T(S.b3, 485, 195, '2 段目：回帰モデル', { 'font-size': 15, 'text-anchor': 'middle', fill: C.b, 'font-weight': 600 });
    T(S.b3, 485, 222, 'まれな返信は予測で補う', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    el('line', { x1: 100, x2: 580, y1: 420, y2: 420, stroke: C.ink, 'stroke-width': 1.4 }, g3);
    el('line', { x1: 340, x2: 340, y1: 280, y2: 432, stroke: C.ink, 'stroke-dasharray': '4 4' }, g3);
    var r3 = H.rng(5);
    S.dots3 = [];
    for (var k = 0; k < 40; k++) {
      var x3 = 352 + (r3() + r3() + r3() - 1.5) * 70, y3 = 404 - (k % 6) * 22;
      S.dots3.push({ c: el('circle', { cx: x3, cy: y3, r: 6, fill: C.b, opacity: 0 }, g3), t0: 18.6 + k * 0.05 });
    }
    S.p3 = TZ.panel(g3, PX, 140, 'DiPS', C.b, [['q̂_r ≤ q_r なら', 15], ['分散は IPS より必ず小さい', 15], ['（定理 4.4）', 15, C.muted], null, ['少しの偏りと引き換えに', 15, C.muted], ['ぶれを大きく減らす', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: DPR and bias =====
    var g4 = S.g[3];
    S.eq4 = T(g4, 80, 130, 'DPR = 平均 { (π/π₀)(s · q̂_r − q̂_m) + E_π[q̂_m] }', { 'font-size': 19, 'font-weight': 650, fill: C.b });
    S.b4 = T(g4, 80, 200, '偏り：DiPS も DPR も 平均 E_π[ q_s · (q̂_r − q_r) ]', { 'font-size': 17, fill: C.ink });
    S.v4 = T(g4, 80, 250, '分散：DPR は 2 段目のモデルが正確なほど小さい', { 'font-size': 17, fill: C.ink });
    S.r4 = T(g4, 80, 330, '実データ（Wantedly Visit）：DPR の平均二乗誤差が', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.r4b = T(g4, 80, 362, 'ほとんどの設定で DM・IPS・DR より小さかった', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.p4 = TZ.panel(g4, PX, 140, 'DPR', C.b, [['q̂_m = 0 とおくと', 15], ['DiPS に戻る', 15], null, ['方策の学習（PG）にも', 15, C.muted], ['同じ形で使える', 15, C.muted]]);
    TZ.note(g4, '論文の定理 4.1、4.5、4.6 と 6 節の記述から');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['実データ（Wantedly Visit）', '企業 21,736 × 求職者 17,460'], ['提案した推定量', 'DiPS と DPR']],
      venue: 'RECSYS 2025', title: ['Off-Policy Evaluation and Learning', 'for Matching Markets'], tsize: 32,
      sub: 'マッチング市場のオフ方策評価と学習', authors: ['Yudai Hayashi, Shuhei Goda, Yuta Saito'], url: 'doi.org/10.1145/3705328.3748047'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.st1.forEach(function (s) { s.g.setAttribute('opacity', seg(t, s.t0, s.t0 + 0.5)); });
    S.f1.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.dots2.forEach(function (d) { d.c.setAttribute('opacity', 0.8 * seg(t, d.t0, d.t0 + 0.2)); });
    S.p2.setAttribute('opacity', seg(t, 9.0, 9.8));
    S.eq3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.a3.setAttribute('opacity', seg(t, 17.2, 17.8));
    S.b3.setAttribute('opacity', seg(t, 17.8, 18.4));
    S.dots3.forEach(function (d) { d.c.setAttribute('opacity', 0.8 * seg(t, d.t0, d.t0 + 0.2)); });
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    S.eq4.setAttribute('opacity', seg(t, 24.6, 25.2));
    S.b4.setAttribute('opacity', seg(t, 25.8, 26.4));
    S.v4.setAttribute('opacity', seg(t, 26.8, 27.4));
    S.r4.setAttribute('opacity', seg(t, 28.2, 28.8));
    S.r4b.setAttribute('opacity', seg(t, 28.4, 29.0));
    S.p4.setAttribute('opacity', seg(t, 25.4, 26.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
