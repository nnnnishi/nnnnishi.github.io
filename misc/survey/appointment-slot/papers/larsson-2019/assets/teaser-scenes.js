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
// teaser-scenes.js — J. Larsson, Smartbokning: Koncept för ett automatiserat bokningssystem (Luleå 2019).
// Unofficial explainer written from the abstract (body not read). Every scene is a schematic with
// explainer-chosen toy values (labelled 模式図). The weighted sum used in scenes 3-4 is only a way to draw
// "a score with user-set weights"; the thesis' actual formula was not checked. No result numbers exist in
// the abstract.
// Colours: orange = limited staff time and open candidate slots; blue = weighted scoring and the chosen slot.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '需要が増え資源が足りない医療で、<span class="A">限られた職員の時間</span>を予約でどう使うかが問われる。', en: '' },
    { ja: '1 件または複数の予約について、担当者たちの予定表の空きから候補を集める。', en: '' },
    { ja: '<span class="B">スコア関数</span>が患者の希望・担当者の希望・時期の早さを重み付きで評価し、最良の候補を選ぶ。', en: '' },
    { ja: '重みは利用者が決める。重みを変えると、選ばれる枠も変わる。', en: '' },
    { ja: '候補をスコアで比べて 1 枠を選ぶ予約ツールの概念実証。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  // schedule: 3 staff x 8 blocks; 1 = booked, 0 = open
  var BOOK = [[1, 0, 1, 1, 0, 1, 1, 1], [0, 1, 1, 0, 1, 1, 0, 1], [1, 1, 0, 1, 1, 0, 1, 1]];
  var STAFF = ['担当者 A', '担当者 B', '担当者 C'];
  // toy candidates: [label, patient pref, staff pref, timeliness]
  var CAND = [['A・火 10時', 0.9, 0.5, 0.3], ['B・月 14時', 0.4, 0.7, 0.9], ['C・水 9時', 0.6, 0.9, 0.2], ['B・月 16時', 0.3, 0.4, 1.0]];
  var W0 = [0.5, 0.3, 0.2], W1 = [0.2, 0.2, 0.6];
  var CRIT = ['患者の希望', '担当者の希望', '時期の早さ'];
  var CCOL = ['#1D4ED8', '#5B6676', '#C2410C'];

  function sched(g, open) {
    var cells = [];
    BOOK.forEach(function (r, i) {
      T(g, 150, 150 + i * 70 + 24, STAFF[i], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      r.forEach(function (v, j) {
        var c = el('rect', { x: 166 + j * 56, y: 150 + i * 70, width: 50, height: 36, rx: 4, fill: v ? C.a : '#fff', 'fill-opacity': v ? 0.75 : 1, stroke: v ? 'none' : C.a, 'stroke-width': 1.6, 'stroke-dasharray': v ? 'none' : '4 3' }, g);
        cells.push({ el: c, open: !v, i: i, j: j });
      });
    });
    return cells;
  }
  function score(c, w) { return w[0] * c[1] + w[1] * c[2] + w[2] * c[3]; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: busy schedules, rising demand =====
    var g1 = S.g[0];
    T(g1, 70, 110, '担当者の予定表（模式図）', { 'font-size': 15, fill: C.muted });
    S.c1 = sched(g1);
    S.q1 = [];
    for (var k = 0; k < 6; k++) S.q1.push(el('circle', { cx: 190 + k * 40, cy: 400, r: 13, fill: C.ink, 'fill-opacity': 0.5 }, g1));
    T(g1, 166, 445, '予約を待つ患者は増えている', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p1 = TZ.panel(g1, PX, 140, '限られた職員の時間', C.a, [['需要は増え、', 15], ['資源はすでに足りない', 15], null, ['時間と資源を効率よく使い、', 14, C.muted], ['患者の希望も尊重したい', 14, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: open slots as candidates =====
    var g2 = S.g[1];
    T(g2, 70, 110, '空いている枠が候補になる', { 'font-size': 15, fill: C.muted });
    S.c2 = sched(g2);
    S.p2 = TZ.panel(g2, PX, 140, '候補を集める', C.a, [['複数の担当者の', 15], ['予定表の空きから', 15], ['候補を探す', 15]]);
    TZ.note(g2, '模式図');

    // ===== scenes 3 & 4: scoring table (shared builder) =====
    function table(g, w, live) {
      var o = { rows: [] };
      T(g, 70, 100, '候補', { 'font-size': 14, fill: C.muted });
      CRIT.forEach(function (n, k) { T(g, 220 + k * 110, 100, n, { 'font-size': 14, fill: CCOL[k] }); });
      T(g, 600, 100, 'スコア', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
      CAND.forEach(function (c, i) {
        var y = 130 + i * 62, row = el('g', {}, g);
        var hl = el('rect', { x: 60, y: y - 6, width: 560, height: 50, rx: 8, fill: C.bsoft, opacity: 0 }, row);
        T(row, 70, y + 24, c[0], { 'font-size': 15, fill: C.ink });
        for (var k = 0; k < 3; k++) {
          el('rect', { x: 220 + k * 110, y: y + 10, width: 90, height: 14, rx: 3, fill: C.panel }, row);
          el('rect', { x: 220 + k * 110, y: y + 10, width: 90 * c[k + 1], height: 14, rx: 3, fill: CCOL[k], 'fill-opacity': 0.8 }, row);
        }
        var sc = el('text', { x: 600, y: y + 24, 'font-size': 17, 'font-weight': 650, fill: C.b, 'text-anchor': 'end' }, row);
        o.rows.push({ g: row, hl: hl, sc: sc, t0: 0 });
      });
      // weight bars
      var wg = el('g', {}, g);
      T(wg, PX, 150, '重み（利用者が決める）', { 'font-size': 16, 'font-weight': 650, fill: C.b });
      o.wb = CRIT.map(function (n, k) {
        T(wg, PX, 194 + k * 52, n, { 'font-size': 14, fill: CCOL[k] });
        el('rect', { x: PX, y: 202 + k * 52, width: 240, height: 12, rx: 3, fill: C.panel }, wg);
        var b = el('rect', { x: PX, y: 202 + k * 52, width: 0, height: 12, rx: 3, fill: CCOL[k] }, wg);
        var lb = el('text', { x: PX + 250, y: 213 + k * 52, 'font-size': 14, fill: C.ink }, wg);
        return { b: b, lb: lb };
      });
      o.wg = wg;
      return o;
    }
    S.t3 = table(S.g[2]);
    TZ.note(S.g[2], '模式図（重み付きの和で描いた例。論文の式は未確認）');
    S.t4 = table(S.g[3]);
    TZ.note(S.g[3], '模式図（値は解説者が置いた例。要旨に数値の評価はない）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['決め方', '候補をスコアで比べる'], ['観点', '患者・担当者・時期の早さ']],
      venue: 'LULEÅ TEKNISKA UNIVERSITET 2019', title: ['Smartbokning: Koncept för ett', 'automatiserat bokningssystem'], tsize: 32,
      sub: 'スマート予約：自動化した予約システムの概念', authors: ['Joakim Larsson'], url: 'urn.kb.se/resolve?urn=urn:nbn:se:ltu:diva-73355'
    });
    return S;
  }

  function renderTable(o, t, w, tIn) {
    var sc = CAND.map(function (c) { return score(c, w); });
    var best = sc.indexOf(Math.max.apply(null, sc));
    o.rows.forEach(function (r, i) {
      r.g.setAttribute('opacity', seg(t, tIn + i * 0.3, tIn + 0.4 + i * 0.3));
      r.sc.textContent = sc[i].toFixed(2);
      r.hl.setAttribute('opacity', t > tIn + 2.4 && i === best ? 1 : 0);
    });
    o.wg.setAttribute('opacity', seg(t, tIn + 1.0, tIn + 1.6));
    o.wb.forEach(function (b, k) { b.b.setAttribute('width', 240 * w[k]); b.lb.textContent = w[k].toFixed(2); });
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.c1.forEach(function (c) { c.el.setAttribute('opacity', seg(t, 0.6 + c.i * 0.3, 1.0 + c.i * 0.3)); });
    S.q1.forEach(function (q, k) { q.setAttribute('opacity', seg(t, 2.4 + k * 0.3, 2.7 + k * 0.3)); });
    S.p1.setAttribute('opacity', seg(t, 4.2, 5.0));
    S.c2.forEach(function (c) {
      var hi = seg(t, 9.0 + (c.i * 8 + c.j) * 0.06, 9.4 + (c.i * 8 + c.j) * 0.06);
      c.el.setAttribute('opacity', c.open ? 1 : 1 - 0.75 * hi);
      if (c.open) c.el.setAttribute('stroke-width', 1.6 + 1.2 * hi);
    });
    S.p2.setAttribute('opacity', seg(t, 11.0, 11.8));
    renderTable(S.t3, t, W0, 16.4);
    var u = seg(t, 26.5, 29.5), w = W0.map(function (v, k) { return v + (W1[k] - v) * u; });
    renderTable(S.t4, t, w, 24.2);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
