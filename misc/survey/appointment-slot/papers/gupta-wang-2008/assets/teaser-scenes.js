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
// teaser-scenes.js — Gupta, Wang, Revenue Management for a Primary-Care Clinic in the Presence of Patient
// Choice (Operations Research 2008). Unofficial explainer based on the abstract only.
// Every scene is a schematic with explainer-chosen toy numbers (labelled 模式図); the paper's numbers are not used.
// Colours: orange = over-booking advance requests and what it costs; blue = threshold-type acceptance.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '診療所には、先の日の予約の依頼と当日受診の依頼が来て、同じ医師の枠を取り合う。', en: '' },
    { ja: '<span class="A">先の予約を受けすぎる</span>と当日の枠が足りず、受けなさすぎると枠が空いたまま終わる。', en: '' },
    { ja: '医師が 1 人なら、空き枠がしきい値に達するまで先の予約を受ける<span class="B">しきい値型の方策</span>が最適になる。', en: '' },
    { ja: '医師が複数なら、患者が主治医や時間帯を選ぶ。構造の一部にもとづくヒューリスティックと上界を示した。', en: '' },
    { ja: '患者の選択を入れた診療所の予約受付を、収益管理として定式化した初期の代表作。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660, NS = 8;

  function slots(g, x0, y0, label) {
    T(g, x0, y0 - 14, label, { 'font-size': 14, fill: C.muted });
    var r = [];
    for (var k = 0; k < NS; k++) r.push(el('rect', { x: x0 + k * 58, y: y0, width: 50, height: 46, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g));
    return r;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1 =====
    var g1 = S.g[0];
    S.s1 = slots(g1, 70, 200, 'ある医師のある日の枠');
    S.adv1 = el('g', {}, g1);
    T(S.adv1, 70, 120, '先の予約の依頼', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    T(S.adv1, 70, 146, '数日前から入る', { 'font-size': 14, fill: C.muted });
    S.sd1 = el('g', {}, g1);
    T(S.sd1, 70, 310, '当日受診の依頼', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    T(S.sd1, 70, 336, 'その日の朝に来る', { 'font-size': 14, fill: C.muted });
    S.p1 = TZ.panel(g1, PX, 140, '患者の違い', C.ink, [['急ぐかどうか', 16], ['好きな時間帯', 16], ['主治医へのこだわり', 16]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: two failures =====
    var g2 = S.g[1];
    S.sa = slots(g2, 70, 140, '受けすぎた日（8 枠すべて先の予約）');
    S.sb = slots(g2, 70, 300, '受けなさすぎた日（先の予約 3 枠）');
    S.ta = T(g2, 70, 222, '当日の患者 3 人が受けられない', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.tb = T(g2, 70, 382, '当日の患者が 2 人だけで、3 枠が空いたまま', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, 'どちらも損', C.a, [['受けすぎ：当日の枠不足', 15], ['受けなさすぎ：', 15], ['待ちが延び、枠が余る', 15]]);
    TZ.note(g2, '模式図（数値は解説者が置いた例）');

    // ===== scene 3: threshold =====
    var g3 = S.g[2];
    S.s3 = slots(g3, 70, 200, '先の予約は空き枠がしきい値に達するまで');
    el('line', { x1: 70 + 5 * 58 - 4, x2: 70 + 5 * 58 - 4, y1: 170, y2: 270, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g3);
    T(g3, 70 + 5 * 58, 166, 'しきい値', { 'font-size': 14, fill: C.a });
    S.no3 = T(g3, 70, 320, '6 件目の先の予約の依頼 → 断る（残りは当日の患者へ）', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, 'しきい値型', C.b, [['医師が 1 人なら', 16], ['選択の確率の弱い', 16], ['条件のもとで最適', 16], null, ['要旨による', 15, C.muted]]);
    TZ.note(g3, '模式図（しきい値の位置は解説者が置いた例）');

    // ===== scene 4: multiple physicians =====
    var g4 = S.g[3];
    var docs = ['医師 A', '医師 B'];
    docs.forEach(function (d, i) {
      var y = 130 + i * 170;
      el('rect', { x: 330, y: y, width: 140, height: 70, rx: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g4);
      T(g4, 400, y + 42, d, { 'font-size': 17, 'text-anchor': 'middle', fill: C.ink });
    });
    el('circle', { cx: 130, cy: 250, r: 26, fill: C.gray }, g4);
    T(g4, 130, 300, '患者（主治医は A）', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    S.l4a = el('line', { x1: 158, y1: 240, x2: 326, y2: 168, stroke: C.b, 'stroke-width': 3 }, g4);
    S.l4b = el('line', { x1: 158, y1: 262, x2: 326, y2: 332, stroke: C.gray, 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g4);
    T(g4, 230, 190, '好む', { 'font-size': 14, fill: C.b });
    T(g4, 222, 330, '空きがなければ', { 'font-size': 14, fill: C.muted });
    S.p4 = TZ.panel(g4, PX - 40, 140, '医師が複数のとき', C.b, [['最適方策の構造を', 15], ['一部明らかにした', 15], null, ['構造にもとづく 2 つの', 15], ['ヒューリスティックが', 15], ['かなり正確（要旨）', 15], null, ['上界も提案', 15, C.muted]]);
    TZ.note(g4, '模式図（論文の数値は使っていない）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['医師が 1 人', 'しきい値型が最適'], ['医師が複数', 'ヒューリスティックと上界']],
      venue: 'OPERATIONS RESEARCH 2008', title: ['Revenue Management for a Primary-Care', 'Clinic in the Presence of Patient Choice'], tsize: 29,
      sub: '患者の選択があるときの、プライマリケア診療所の収益管理', authors: ['Diwakar Gupta, Lei Wang'], url: 'doi.org/10.1287/opre.1080.0542'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.adv1.setAttribute('opacity', seg(t, 0.8, 1.4));
    S.sd1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.s1.forEach(function (r, k) {
      var adv = k < 5 ? seg(t, 1.6 + k * 0.3, 1.9 + k * 0.3) : 0, sd = k >= 5 ? seg(t, 4.4 + (k - 5) * 0.4, 4.7 + (k - 5) * 0.4) : 0;
      r.setAttribute('fill', adv > 0.5 ? C.gray : sd > 0.5 ? C.b : '#fff');
    });
    S.p1.setAttribute('opacity', seg(t, 5.6, 6.4));
    S.sa.forEach(function (r, k) { r.setAttribute('fill', seg(t, 8.8 + k * 0.15, 9.0 + k * 0.15) > 0.5 ? C.gray : '#fff'); });
    S.ta.setAttribute('opacity', seg(t, 10.4, 11.0));
    S.sb.forEach(function (r, k) {
      var on = k < 3 ? seg(t, 11.6 + k * 0.15, 11.8 + k * 0.15) : (k < 5 ? seg(t, 12.4 + (k - 3) * 0.3, 12.6 + (k - 3) * 0.3) : 0);
      r.setAttribute('fill', on > 0.5 ? (k < 3 ? C.gray : C.b) : '#fff');
    });
    S.tb.setAttribute('opacity', seg(t, 13.2, 13.8));
    S.p2.setAttribute('opacity', seg(t, 13.6, 14.4));
    S.s3.forEach(function (r, k) { r.setAttribute('fill', k < 5 && seg(t, 16.8 + k * 0.4, 17.0 + k * 0.4) > 0.5 ? C.gray : '#fff'); });
    S.no3.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.p3.setAttribute('opacity', seg(t, 20.4, 21.2));
    S.l4a.setAttribute('opacity', seg(t, 25.0, 25.6));
    S.l4b.setAttribute('opacity', seg(t, 26.0, 26.6));
    S.p4.setAttribute('opacity', seg(t, 27.0, 27.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
