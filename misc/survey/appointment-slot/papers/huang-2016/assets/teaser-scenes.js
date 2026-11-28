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
// teaser-scenes.js — Y.-L. Huang, The Development of Patient Scheduling Groups for an Effective
// Appointment System (Applied Clinical Informatics 2016). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図). Slot counts of the template (a2 b12 c3 d1 e2 f2) and the
// costs in scene 4 are taken from the paper text (PMC4817334).
// Colours: orange = one slot type per patient type / a single group; blue = grouping chosen by the paper.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">患者タイプごとに枠を分ける</span>と、長さは合うが、あるタイプの希望が多い日には枠が足りなくなる。', en: '' },
    { ja: '<span class="A">枠を 1 種類にまとめる</span>と誰でも入れるが、長さが合わず、医師の空き時間や患者の待ちが出る。', en: '' },
    { ja: '<span class="B">提案法</span>は診療時間の順に隣り合うタイプだけをまとめる 32 通りを、シミュレーションで比べる。', en: '' },
    { ja: '流れのコストは 4 グループで 8.3% 下がり、柔軟性まで含めた合計コストは 2 グループで最小（1.3% 減）。', en: '' },
    { ja: '既存の患者タイプをまとめ直すだけで、予約表の枠の種類を決める研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;
  var TYPES = ['a', 'b', 'c', 'd', 'e', 'f'];
  var COUNT = [2, 12, 3, 1, 2, 2];

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: one slot type per patient type =====
    var g1 = S.g[0];
    T(g1, 60, 80, '1 日の 22 枠をタイプ別に分けた予約表', { 'font-size': 15, fill: C.muted });
    S.rows1 = [];
    TYPES.forEach(function (ty, i) {
      var y = 100 + i * 52, row = el('g', {}, g1);
      T(row, 60, y + 28, ty, { 'font-size': 17, 'font-weight': 650, fill: C.a });
      for (var k = 0; k < COUNT[i]; k++) {
        el('rect', { x: 90 + k * 38, y: y + 8, width: 32, height: 28, rx: 4, fill: i === 3 ? C.a : C.panel, stroke: C.a, 'stroke-width': 1.2, 'fill-opacity': i === 3 ? 0.85 : 1 }, row);
      }
      S.rows1.push({ g: row, t0: 0.8 + i * 0.35 });
    });
    S.req1 = el('g', {}, g1);
    el('rect', { x: 150, y: 264, width: 32, height: 28, rx: 4, fill: '#fff', stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, S.req1);
    T(S.req1, 192, 284, '2 人目の d の希望 → 入る枠がない', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 130, 'タイプごとに枠を分ける', C.a, [['枠の長さは診療時間に合う', 15], null, ['希望が枠の数を超えた分は', 15], ['「足りない枠」として', 15], ['柔軟性のコストに数える', 15]]);
    TZ.note(g1, '模式図（枠の数は論文の予約表 a2 b12 c3 d1 e2 f2）');

    // ===== scene 2: a single group =====
    var g2 = S.g[1];
    T(g2, 60, 80, '枠は全員同じ長さ（加重平均）', { 'font-size': 15, fill: C.muted });
    var slot = 90, x0 = 60, svc = [70, 112, 60, 96, 84];
    S.slots2 = [];
    for (var k = 0; k < 5; k++) {
      el('rect', { x: x0 + k * slot, y: 110, width: slot - 4, height: 34, rx: 4, fill: C.panel, stroke: C.muted, 'stroke-width': 1 }, g2);
    }
    T(g2, 60, 170, '実際の診療', { 'font-size': 15, fill: C.muted });
    var t = 0;
    svc.forEach(function (d, k) {
      var start = Math.max(t, k * slot), bar = el('rect', { x: x0 + start, y: 190, width: 0, height: 34, rx: 4, fill: C.a, 'fill-opacity': 0.8 }, g2);
      var note = null;
      if (start > k * slot) note = T(g2, x0 + k * slot + 4, 250, '待ち', { 'font-size': 14, 'font-weight': 600, fill: C.a });
      else if (k > 0 && start > t - 0.1 && t < k * slot) note = T(g2, x0 + t + 2, 250, '空き', { 'font-size': 14, 'font-weight': 600, fill: C.muted });
      S.slots2.push({ bar: bar, w: d - 4, note: note, t0: 8.8 + k * 0.6 });
      t = start + d;
    });
    T(g2, 60, 310, '短い患者のあとは医師が空き、長い患者のあとは次の人が待つ', { 'font-size': 15, fill: C.ink });
    S.p2 = TZ.panel(g2, PX, 130, '1 種類にまとめる', C.a, [['どの枠にも誰でも入れる', 15], null, ['待ち・空き・残業を', 15], ['「診療の流れのコスト」', 15], ['として数える', 15]]);
    TZ.note(g2, '模式図（長さは解説者が置いた例）');

    // ===== scene 3: 32 contiguous groupings =====
    var g3 = S.g[2];
    T(g3, 60, 80, '予約時間の順に並べ、隣どうしだけをまとめる', { 'font-size': 15, fill: C.muted });
    S.cuts3 = [];
    TYPES.forEach(function (ty, i) {
      el('rect', { x: 70 + i * 82, y: 110, width: 66, height: 46, rx: 8, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5 }, g3);
      T(g3, 103 + i * 82, 140, ty, { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
      if (i < 5) {
        var ln = el('line', { x1: 144 + i * 82, x2: 144 + i * 82, y1: 98, y2: 168, stroke: C.b, 'stroke-width': 3, 'stroke-linecap': 'round' }, g3);
        S.cuts3.push(ln);
      }
    });
    T(g3, 70, 200, '5 か所の切れ目を「切る・切らない」で 2⁵ = 32 通り', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.f3 = el('g', {}, g3);
    T(S.f3, 70, 260, '流れのコスト ＝ 10·待ち ＋ 50·空き ＋ 75·残業', { 'font-size': 16, fill: C.ink });
    T(S.f3, 70, 292, '柔軟性のコスト ＝ 10·足りない枠の長さ', { 'font-size': 16, fill: C.ink });
    T(S.f3, 70, 330, '各候補を 100 日分シミュレーションして合計を比べる', { 'font-size': 15, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 130, '予約グループを探す', C.b, [['枠の長さは', 15], ['グループ内の加重平均', 15], null, ['重みは 1 時間あたりのドル', 14, C.muted]]);
    TZ.note(g3, '模式図（重みは論文の値）');

    // ===== scene 4: results =====
    var g4 = S.g[3];
    T(g4, 60, 70, '1 グループと最良のグループ分けのコスト（論文本文の値）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 250, x1: 760, v0: 0, v1: 110, y0: 130, rowH: 120, t0: 24.6, dt: 1.2, ticks: [0, 50, 100],
      rows: [
        { label: '流れのコスト', a: 96.8, b: 88.8, la: '1 グループ 96.8', lb: '4 グループ 88.8（−8.3%）' },
        { label: '合計コスト', a: 96.8, b: 95.5, la: '1 グループ 96.8', lb: '2 グループ 95.5（−1.3%）' }
      ]
    });
    T(g4, 60, 430, '柔軟性のコストは、いつも 1 グループが最小', { 'font-size': 15, fill: C.muted });
    TZ.note(g4, '論文本文（Figure 2〜4 の説明）の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['合計コスト（2 グループ）', '96.8 → 95.5'], ['流れのコスト（4 グループ）', '96.8 → 88.8']],
      venue: 'APPLIED CLINICAL INFORMATICS 2016', title: ['The Development of Patient Scheduling', 'Groups for an Effective Appointment System'], tsize: 28,
      sub: '効果的な予約システムのための患者の予約グループの設計', authors: ['Yu-Li Huang'], url: 'doi.org/10.4338/ACI-2015-08-RA-0097'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.rows1.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4)); });
    S.req1.setAttribute('opacity', seg(t, 3.4, 4.0));
    S.p1.setAttribute('opacity', seg(t, 4.6, 5.4));
    S.slots2.forEach(function (s) {
      s.bar.setAttribute('width', Math.max(0, s.w * seg(t, s.t0, s.t0 + 0.6)));
      if (s.note) s.note.setAttribute('opacity', seg(t, s.t0 + 0.5, s.t0 + 0.9));
    });
    S.p2.setAttribute('opacity', seg(t, 12.4, 13.2));
    var pat = [[1, 0, 1, 0, 1], [0, 1, 1, 0, 1], [1, 0, 0, 0, 0], [1, 1, 0, 1, 0]];
    var step = Math.min(3, Math.max(0, Math.floor((t - 17) / 1.2)));
    S.cuts3.forEach(function (c, i) { c.setAttribute('opacity', t < 17 ? 0 : pat[step][i]); });
    S.f3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.p3.setAttribute('opacity', seg(t, 18.0, 18.8));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
