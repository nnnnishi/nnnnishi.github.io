// ---- shared helpers for the appointment-slot explainer teasers (Japanese-only pages) ----
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
// teaser-scenes.js — Knopp, Biesinger, Prandtstetter, Mobility offer allocations in corporate settings
// (EURO J. Comput. Optim. 2021). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses Table 4 of the paper (arXiv version):
// instances solved to optimality by the ILP within 1 hour, set AG, by number of demands.
// Colours: orange = fixed car assignment / conflicts; blue = the allocation model and its results.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '社用車を人ごとに<span class="A">固定</span>すると、1 台は 1 日に平均 1 時間未満しか使われない。', en: '' },
    { ja: '移動の要求ごとに、社用車・公共交通・タクシーなどの<span class="B">候補から 1 つを選ぶ</span>。', en: '' },
    { ja: '同じ車で時間の重なる候補は、極大クリークごとに「1 つまで」とする。', en: '' },
    { ja: '整数計画は要求 1,000 件まですべて最適に解き、5,000 件では 36 問中 4 問だった。', en: '' },
    { ja: '時間区間のある予約を資源に重ならないように割り当てる問題。断片化は目的に入れていない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var X0 = 170, HW = 46; // timeline origin and px per hour (8:00 .. 18:00)
  function hx(h) { return X0 + (h - 8) * HW; }

  function axis(g, y) {
    for (var h = 8; h <= 18; h += 2) {
      T(g, hx(h), y, h + '時', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    }
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: fixed cars mostly idle =====
    var g1 = S.g[0];
    T(g1, 70, 80, '従業員ごとの社用車（1 日の利用）', { 'font-size': 15, fill: C.muted });
    var use = [[9, 10], [13.5, 14.2], [11, 11.6], [15, 15.8], [8.5, 9.1]];
    S.u1 = use.map(function (u, i) {
      var y = 110 + i * 56;
      T(g1, 70, y + 24, '車 ' + (i + 1), { 'font-size': 15, fill: C.ink });
      el('rect', { x: hx(8), y: y, width: hx(18) - hx(8), height: 34, rx: 4, fill: C.panel }, g1);
      return { r: el('rect', { x: hx(u[0]), y: y, width: (u[1] - u[0]) * HW, height: 34, rx: 4, fill: C.a }, g1), t0: 1.0 + i * 0.4 };
    });
    axis(g1, 410);
    S.p1 = TZ.panel(g1, PX, 140, '固定の割り当て', C.a, [['ほとんどの時間、', 16], ['車は駐車場にある', 16], null, ['論文：平均 1 日 1 時間未満', 15, C.muted]]);
    TZ.note(g1, '模式図（数値は論文の序論）');

    // ===== scene 2: a demand with offers =====
    var g2 = S.g[1];
    T(g2, 70, 80, '要求：10 時〜13 時に取引先へ', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var offers = [['共用車 A', '費用 c = 30', 10, 13], ['共用車 B', '費用 c = 32', 10, 13], ['公共交通', '費用 c = 18', 9.5, 13.5], ['タクシー', '費用 c = 60', 10, 12.8]];
    S.o2 = offers.map(function (o, i) {
      var row = el('g', {}, g2), y = 110 + i * 64;
      T(row, 70, y + 24, o[0], { 'font-size': 15, fill: C.ink });
      el('rect', { x: hx(o[2]), y: y, width: (o[3] - o[2]) * HW, height: 34, rx: 4, fill: C.b, 'fill-opacity': 0.85 }, row);
      T(row, hx(o[3]) + 10, y + 24, o[1], { 'font-size': 14, fill: C.muted });
      return { row: row, t0: 9.0 + i * 0.6 };
    });
    axis(g2, 380);
    S.p2 = TZ.panel(g2, PX, 140, '候補（オファー）o', C.b, [['費用 c_o', 15], ['不在の時間 [a_o, b_o)', 15], ['使う車 v_o（なしも可）', 15], null, ['要求ごとにちょうど 1 つ', 15, C.b, 600]]);
    TZ.note(g2, '模式図（費用は解説者が置いた例）');

    // ===== scene 3: overlapping offers on one car -> clique =====
    var g3 = S.g[2];
    T(g3, 70, 80, '共用車 A を使う候補（別々の要求）', { 'font-size': 15, fill: C.muted });
    var iv = [[9, 12], [10.5, 13], [11.5, 14.5], [15, 17]];
    S.iv3 = iv.map(function (v, i) {
      var y = 110 + i * 52;
      return { r: el('rect', { x: hx(v[0]), y: y, width: (v[1] - v[0]) * HW, height: 32, rx: 4, fill: i < 3 ? C.a : C.gray }, g3), t0: 16.8 + i * 0.4 };
    });
    axis(g3, 340);
    S.cut3 = el('line', { x1: hx(11.7), y1: 100, x2: hx(11.7), y2: 270, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g3);
    S.k3 = T(g3, 70, 400, '11 時台に重なる 3 つ = 極大クリーク：x₁ + x₂ + x₃ ≤ 1', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, '重なりの制約', C.b, [['同じ時刻に重なる区間の', 15], ['集まりがクリークになる', 15], null, ['2 つずつ禁じるより', 15, C.muted], ['強い定式化', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: Table 4 solved counts =====
    var g4 = S.g[2 + 1];
    T(g4, 70, 70, '整数計画で最適に解けた問題の数（各 36 問、1 時間、論文 Table 4）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var data = [['200 件', 36], ['1,000 件', 36], ['2,000 件', 22], ['5,000 件', 4]];
    var BX = 220, BW = 560;
    S.b4 = data.map(function (d, i) {
      var y = 110 + i * 80;
      T(g4, BX - 14, y + 30, '要求 ' + d[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      el('rect', { x: BX, y: y + 8, width: BW, height: 34, fill: C.panel }, g4);
      var r = el('rect', { x: BX, y: y + 8, width: 0, height: 34, fill: C.b }, g4);
      var lab = T(g4, BX + BW + 12, y + 31, d[1] + ' / 36', { 'font-size': 16, 'font-weight': 650, fill: C.b });
      return { r: r, lab: lab, w: BW * d[1] / 36, t0: 24.6 + i * 0.9 };
    });
    TZ.note(g4, '論文 Table 4 の数値から作図（arXiv 版）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['整数計画で最適', '要求 1,000 件まで'], ['車種でまとめた定式化', '実データ風の問題を数秒']],
      venue: 'EURO J. COMPUT. OPTIM. 2021', title: ['Mobility offer allocations', 'in corporate settings'], tsize: 32,
      sub: '企業での移動手段のオファーの割り当て', authors: ['Sebastian Knopp, Benjamin Biesinger, Matthias Prandtstetter'], url: 'doi.org/10.1016/j.ejco.2021.100010'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.u1.forEach(function (u) { u.r.setAttribute('opacity', seg(t, u.t0, u.t0 + 0.4)); });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    S.o2.forEach(function (o) { o.row.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.iv3.forEach(function (v) { v.r.setAttribute('opacity', seg(t, v.t0, v.t0 + 0.4)); });
    S.cut3.setAttribute('opacity', seg(t, 19.0, 19.5));
    S.k3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.b4.forEach(function (b) {
      b.r.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
