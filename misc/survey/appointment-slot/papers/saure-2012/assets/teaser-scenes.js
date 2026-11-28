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
      var single = (r.a == null) !== (r.b == null);   // one bar only: centre it in the row
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + (single ? bh / 2 : k[2] * (bh + 2)), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + (single ? bh / 2 : k[2] * (bh + 2)) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
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
// teaser-scenes.js — Sauré, Patrick, Tyldesley, Puterman, Dynamic multi-appointment patient scheduling for
// radiation therapy (EJOR 2012). Unofficial explainer (published PDF).
// Scene 1 uses Table 1 of the paper, scene 4 the Total row of Table 4. Scenes 2-3 are schematics (模式図).
// Colours: orange = treatment delay / wasted capacity, the problem; blue = the MDP + affine ADP approach.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'ブリティッシュコロンビア州では、14 日以内に治療を始められた患者は<span class="A">7 割台</span>にとどまる。', en: '' },
    { ja: '治療は何日も続き 1 回の長さも違うので、1 件の受付が先の複数の日の枠を使う。', en: '' },
    { ja: '<span class="B">提案法</span>は予約受付を MDP で書き、価値関数を日ごとの枠数の 1 次式で近似して解く。', en: '' },
    { ja: 'BCCA のデータでは、10 営業日以内に治療を始めた割合が 73% から 96% に上がった。', en: '' },
    { ja: '長さのそろわない複数回の予約を、将来の枠の費用まで見て入れる研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var DAYS = 10, X0 = 90, CW = 50, Y0 = 130, RH = 54;

  function grid(g, rows) {
    for (var d = 0; d < DAYS; d++) T(g, X0 + d * CW + CW / 2, Y0 - 14, String(d + 1), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    for (var r = 0; r < rows; r++) for (var d2 = 0; d2 < DAYS; d2++)
      el('rect', { x: X0 + d2 * CW + 2, y: Y0 + r * RH + 2, width: CW - 4, height: RH - 4, rx: 4, fill: C.panel }, g);
  }
  function block(g, row, d0, n, color) {
    var out = [];
    for (var k = 0; k < n; k++) out.push(el('rect', { x: X0 + (d0 + k) * CW + 2, y: Y0 + row * RH + 2, width: CW - 4, height: RH - 4, rx: 4, fill: color }, g));
    return out;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: Table 1 (share initiated within 14 days) =====
    var g1 = S.g[0];
    T(g1, 70, 76, '14 日以内に治療を始めた患者の割合（論文 Table 1）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var t1 = [['2004', 76.4], ['2005', 71.3], ['2006', 73.8], ['2007', 77.0], ['2008', 70.0]];
    var B1 = 430, K1 = 3.2;
    el('line', { x1: 90, x2: 580, y1: B1, y2: B1, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: 90, x2: 580, y1: B1 - 100 * K1, y2: B1 - 100 * K1, stroke: C.hair, 'stroke-width': 1, 'stroke-dasharray': '5 5' }, g1);
    T(g1, 584, B1 - 100 * K1 + 5, '100%', { 'font-size': 14, fill: C.muted });
    S.b1 = t1.map(function (d, i) {
      var x = 110 + i * 92, h = d[1] * K1;
      var r = el('rect', { x: x, y: B1, width: 62, height: 0, fill: C.a }, g1);
      var lb = el('text', { x: x + 31, y: B1 - h - 10, 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' }, g1);
      lb.textContent = d[1].toFixed(1) + '%';
      T(g1, x + 31, B1 + 24, d[0], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lb: lb, h: h, t0: 0.8 + i * 0.5 };
    });
    S.p1 = TZ.panel(g1, PX, 150, '待ちの目安は 14 日', C.a, [['開始の遅れは、腫瘍の進行や', 15], ['生存率の低下と関係する', 15], null, ['遅れは容量の不足だけでなく', 14, C.muted], ['予約の入れ方からも生じる', 14, C.muted]]);
    TZ.note(g1, '論文 Table 1 の数値から作図');

    // ===== scene 2: multi-appointment blocks =====
    var g2 = S.g[1];
    T(g2, 70, 80, '治療装置の予約表（列：日）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    grid(g2, 4);
    S.bl2 = [
      { r: block(g2, 0, 0, 5, C.gray), t0: 9.0 },
      { r: block(g2, 1, 2, 6, C.gray), t0: 9.6 },
      { r: block(g2, 2, 1, 4, C.gray), t0: 10.2 },
      { r: block(g2, 3, 4, 5, C.a), t0: 11.0 }
    ];
    S.lb2 = T(g2, X0, Y0 + 4 * RH + 34, '新しい治療 1 件が先の 5 日分の枠を使う', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p2 = TZ.panel(g2, PX, 150, '複数回の予約', C.a, [['1 件の受付が', 15], ['先の複数の日の容量を使う', 15], null, ['長さのそろわない治療は', 14, C.muted], ['使えない隙間を残す', 14, C.muted], ['（論文は「テトリスのよう」）', 14, C.muted]]);
    TZ.note(g2, '模式図（日数と人数は解説者が置いた例）');

    // ===== scene 3: MDP loop =====
    var g3 = S.g[2];
    function box(g, x, y, w, h, s1, s2, col) {
      var b = el('g', {}, g);
      el('rect', { x: x, y: y, width: w, height: h, rx: 12, fill: '#fff', stroke: col, 'stroke-width': 2 }, b);
      T(b, x + w / 2, y + h / 2 - 4, s1, { 'font-size': 16, 'font-weight': 650, fill: col, 'text-anchor': 'middle' });
      T(b, x + w / 2, y + h / 2 + 20, s2, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return b;
    }
    S.m3 = [
      box(g3, 80, 120, 200, 80, '状態', '予約済みの枠と待つ治療', C.b),
      box(g3, 360, 120, 200, 80, '行動', '開始日と残業の枠', C.b),
      box(g3, 220, 300, 200, 80, '費用と次の状態', '待ち・残業の費用、新規依頼', C.b)
    ];
    S.ar3 = el('g', {}, g3);
    [['M280 160 L356 160'], ['M480 204 L400 296'], ['M240 296 L170 204']].forEach(function (d) {
      el('path', { d: d[0], stroke: C.b, 'stroke-width': 2.2, fill: 'none', 'marker-end': '' }, S.ar3);
    });
    T(S.ar3, 320, 440, '割引つきの将来の費用の合計を最小にする', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 130, 'アフィン近似', C.b, [['状態は 10^300 通り超', 15], ['価値関数を', 15], ['W₀ + Σ U_m u_m + Σ V_m v_m', 14], ['   + Σ W_i w_i で近似', 14], null, ['U_m：m 日目の枠が 1 つ', 14, C.muted], ['埋まる将来の費用', 14, C.muted], ['双対を列生成で解く', 14, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: Table 4, Total row =====
    var g4 = S.g[3];
    T(g4, 70, 64, '期限内に治療を始めた割合（%、全種類の合計、論文 Table 4）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 260, x1: 800, v0: 0, v1: 100, y0: 100, rowH: 104, t0: 24.6, dt: 0.8, ticks: [0, 25, 50, 75, 100],
      rows: [
        { label: '1 営業日以内', a: 5, b: 26, la: '5', lb: '26' },
        { label: '5 営業日以内', a: 29, b: 53, la: '29', lb: '53' },
        { label: '10 営業日以内', a: 73, b: 96, la: '73', lb: '96' }
      ]
    });
    T(g4, 260, 470, '■ 目先の費用だけを見る方策', { 'font-size': 14, fill: C.a });
    T(g4, 500, 470, '■ 近似最適な方策', { 'font-size': 14, fill: C.b });
    T(g4, 260, 496, '残業の増加は 1 日平均 3 分', { 'font-size': 14, fill: C.muted });
    TZ.note(g4, '論文 Table 4 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['10 営業日以内の開始', '73% → 96%'], ['割引した費用の平均', '$185,843 → $121,974']],
      venue: 'EJOR 2012', title: ['Dynamic multi-appointment patient', 'scheduling for radiation therapy'], tsize: 30,
      sub: '放射線治療のための複数回予約の動的な患者スケジューリング', authors: ['Antoine Sauré, Jonathan Patrick, Scott Tyldesley, Martin L. Puterman'], url: 'doi.org/10.1016/j.ejor.2012.06.046'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.b1.forEach(function (b) {
      var k = H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.r.setAttribute('height', b.h * k); b.r.setAttribute('y', 430 - b.h * k);
      b.lb.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p1.setAttribute('opacity', seg(t, 4.2, 5.0));
    S.bl2.forEach(function (b) { b.r.forEach(function (r, k) { r.setAttribute('opacity', seg(t, b.t0 + k * 0.1, b.t0 + k * 0.1 + 0.3)); }); });
    S.lb2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    S.m3.forEach(function (m, i) { m.setAttribute('opacity', seg(t, 16.6 + i * 0.7, 17.1 + i * 0.7)); });
    S.ar3.setAttribute('opacity', seg(t, 19.0, 19.6));
    S.p3.setAttribute('opacity', seg(t, 19.8, 20.6));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
