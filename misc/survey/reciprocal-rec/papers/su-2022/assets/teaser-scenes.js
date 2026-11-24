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
// teaser-scenes.js — Su, Bayoumi, Joachims, Optimizing Rankings for Recommendation in Matching Markets
// (WWW 2022). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy markets (labelled 模式図). Scene 4 uses the expected
// numbers of matches in Table 1 of the paper (arXiv v1).
// Colours: orange = Naive / Reciprocal relevance ranking; blue = Social-Welfare ranking.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '求職者ごとに<span class="A">自分が気に入りそうな順</span>に求人を並べると、全員の推薦が人気の求人に集まる。', en: '' },
    { ja: '雇用者は応募者を自分の関心の順に上から見る。応募が集まるほど、下の応募者には返事が届きにくい。', en: '' },
    { ja: '<span class="B">提案法</span>は全員の順位を二重確率行列で表し、期待マッチ数の下界を同時に最大化する。', en: '' },
    { ja: 'オンラインデートのデータでは、期待マッチ数が両側の関心の積で並べたときの 957 から 1,199 に増えた。', en: '' },
    { ja: '推薦の目的を、利用者ごとの関心ではなく市場全体のマッチ数に置き換えた研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  // a small market: 4 candidates (left) and 3 employers (right)
  function market(g, color, links) {
    var cs = [], js = [], ls = [];
    for (var i = 0; i < 4; i++) {
      var y = 130 + i * 80;
      el('circle', { cx: 120, cy: y, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      T(g, 120, y + 6, '求' + (i + 1), { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
      cs.push(y);
    }
    for (var j = 0; j < 3; j++) {
      var yy = 160 + j * 100;
      el('rect', { x: 440, y: yy - 24, width: 70, height: 48, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g);
      T(g, 475, yy + 6, ['人気', '中', '下'][j], { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
      js.push(yy);
    }
    links.forEach(function (l, k) {
      var p = el('line', { x1: 144, y1: cs[l[0]], x2: 438, y2: js[l[1]], stroke: color, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      ls.push({ el: p, t: k });
    });
    T(g, 120, 90, '求職者', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    T(g, 475, 90, '求人', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return ls;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: everyone is sent to the popular employer =====
    var g1 = S.g[0];
    S.l1 = market(g1, C.a, [[0, 0], [1, 0], [2, 0], [3, 0]]);
    S.p1 = TZ.panel(g1, PX, 140, '各自の関心の順に並べる', C.a, [['1 位の推薦が全員', 16], ['人気の求人になる', 16], null, ['両側の関心の積で並べても', 15, C.muted], ['人気の相手は上に来やすい', 15, C.muted]]);
    TZ.note(g1, '模式図（線は 1 位に推薦された求人）');

    // ===== scene 2: the employer examines applicants top-down =====
    var g2 = S.g[1];
    T(g2, 80, 100, '人気の求人に届いた応募（雇用者の関心の順）', { 'font-size': 15, fill: C.muted });
    var vs = [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6];
    S.rows2 = vs.map(function (v, k) {
      var y = 130 + k * 50, row = el('g', {}, g2);
      T(row, 80, y + 22, (k + 1) + ' 位の応募者', { 'font-size': 15, fill: C.ink });
      el('rect', { x: 220, y: y + 6, width: 300, height: 22, rx: 4, fill: C.panel }, row);
      var bar = el('rect', { x: 220, y: y + 6, width: 0, height: 22, rx: 4, fill: k < 2 ? C.b : C.a }, row);
      var lab = el('text', { x: 530, y: y + 23, 'font-size': 14, fill: C.muted }, row);
      lab.textContent = '見られる確率 ' + (k === 0 ? '1' : '1/' + (k + 1));
      return { row: row, bar: bar, w: 300 * v, t0: 8.6 + k * 0.45 };
    });
    S.p2 = TZ.panel(g2, PX, 140, '雇用者の側の混雑', C.a, [['応募が増えるほど、', 16], ['1 人が見てもらえる', 16], ['確率は下がる', 16], null, ['v(k) = 1/k のとき', 15, C.muted]]);
    TZ.note(g2, '模式図（見る確率の関数 v(k) = 1/k）');

    // ===== scene 3: joint optimisation over doubly stochastic matrices =====
    var g3 = S.g[2];
    T(g3, 80, 96, '求職者 c の順位の分布 M_c（行：求人、列：順位）', { 'font-size': 15, fill: C.muted });
    var M = [[0.2, 0.5, 0.3], [0.5, 0.3, 0.2], [0.3, 0.2, 0.5]];
    S.cells3 = [];
    M.forEach(function (row, i) {
      row.forEach(function (v, j) {
        var x = 100 + j * 80, y = 120 + i * 64;
        var r = el('rect', { x: x, y: y, width: 70, height: 54, rx: 6, fill: C.b, 'fill-opacity': 0.12 + 0.8 * v }, g3);
        var tx = el('text', { x: x + 35, y: y + 33, 'font-size': 16, 'text-anchor': 'middle', fill: v > 0.4 ? '#fff' : C.ink }, g3);
        tx.textContent = v.toFixed(1);
        S.cells3.push({ r: r, tx: tx, t0: 16.6 + (i * 3 + j) * 0.12 });
      });
    });
    T(g3, 100, 340, '行の和も列の和も 1（二重確率行列）', { 'font-size': 15, fill: C.ink });
    S.lb3 = T(g3, 80, 400, '下界：雇用者の側の順位を、上に並ぶ応募者の数の期待値で置き換える', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.fw3 = T(g3, 80, 432, '凸な v ならイェンセンの不等式で成り立ち、Frank-Wolfe 法で全員分を同時に解く', { 'font-size': 15, fill: C.ink });
    S.p3 = TZ.panel(g3, PX, 140, '全員の順位を同時に', C.b, [['求職者ごとに M_c を持ち、', 15], ['期待マッチ数の下界を', 15], ['すべての M_c について', 15], ['最大化する', 15], null, ['M_c から順位を抽出して', 15, C.muted], ['推薦する', 15, C.muted]]);
    TZ.note(g3, '模式図（数値は解説者が置いた例）');

    // ===== scene 4: Table 1 =====
    var g4 = S.g[3];
    T(g4, 70, 64, '期待マッチ数（論文 Table 1）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 300, X1 = 760, VMAX = 1300;
    function sx(v) { return X0 + v / VMAX * (X1 - X0); }
    var data = [['学会の参加者紹介', [604.0, 763.8, 824.1]], ['オンラインデート', [844.0, 957.2, 1199.2]]];
    var names = ['Naive', 'Reciprocal', 'Social-Welfare'];
    S.bars4 = [];
    el('line', { x1: X0, x2: X0, y1: 90, y2: 440, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    data.forEach(function (d, i) {
      var y0 = 100 + i * 180;
      T(g4, 70, y0 + 20, d[0], { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      d[1].forEach(function (v, k) {
        var y = y0 + 34 + k * 40, col = k === 2 ? C.b : C.a;
        T(g4, X0 - 10, y + 20, names[k], { 'font-size': 14, fill: col, 'text-anchor': 'end' });
        var rect = el('rect', { x: X0, y: y + 4, width: 0, height: 24, fill: col, 'fill-opacity': k === 0 ? 0.55 : 1 }, g4);
        var lab = el('text', { x: sx(v) + 6, y: y + 22, 'font-size': 14, 'font-weight': 600, fill: col }, g4);
        lab.textContent = v.toFixed(1);
        S.bars4.push({ rect: rect, lab: lab, w: sx(v) - X0, t0: 24.6 + i * 1.2 + k * 0.3 });
      });
    });
    TZ.note(g4, '論文 Table 1 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['オンラインデート（期待マッチ数）', '957 → 1,199'], ['学会の参加者紹介', '764 → 824']],
      venue: 'WWW 2022', title: ['Optimizing Rankings for', 'Recommendation in Matching Markets'], tsize: 30,
      sub: 'マッチング市場の推薦のための順位の最適化', authors: ['Yi Su, Magd Bayoumi, Thorsten Joachims'], url: 'arxiv.org/abs/2106.01941'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.l1.forEach(function (l) { l.el.setAttribute('opacity', seg(t, 1.2 + l.t * 0.7, 1.7 + l.t * 0.7)); });
    S.p1.setAttribute('opacity', seg(t, 4.0, 4.8));
    S.rows2.forEach(function (r) {
      r.row.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.3));
      r.bar.setAttribute('width', r.w * seg(t, r.t0, r.t0 + 0.8));
    });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.cells3.forEach(function (c) { var v = seg(t, c.t0, c.t0 + 0.3); c.r.setAttribute('opacity', v); c.tx.setAttribute('opacity', v); });
    S.p3.setAttribute('opacity', seg(t, 17.4, 18.2));
    S.lb3.setAttribute('opacity', seg(t, 19.0, 19.6));
    S.fw3.setAttribute('opacity', seg(t, 20.2, 20.8));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
