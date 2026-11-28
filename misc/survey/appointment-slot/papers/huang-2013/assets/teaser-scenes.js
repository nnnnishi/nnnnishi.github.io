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
// teaser-scenes.js — Y.-L. Huang, Ancillary service impact on outpatient scheduling (IJHCQA 2013).
// Unofficial explainer written from the publisher's structured abstract (body not read).
// Scenes 1-3 are schematics (labelled 模式図). Scene 4 uses only the numbers in the abstract (7%, 9%, 17 min).
// Colours: orange = scheduling without ancillary service time; blue = triage at scheduling + optimised time.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">診察の時間だけで予約を組む</span>と、X 線などを先に受ける患者の分だけ診察が遅れ、後ろの患者が待つ。', en: '' },
    { ja: '<span class="B">提案法</span>はまず、予約を受ける時点で付帯サービスが要る患者を見分ける。', en: '' },
    { ja: '次に、予約に入れる付帯サービスの時間をシミュレーション最適化で決める。', en: '' },
    { ja: '2 つの事例で、患者の平均の待ち時間が 7% と 9% 減った（要旨の値）。', en: '' },
    { ja: '予約 1 件が占める時間を、付帯サービスまで含めて見積もる研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;

  // a row of three appointments; xr = x-ray block before patient 1
  function lane(g, y, color, shifted) {
    var items = [], so = shifted ? 0 : 70;
    for (var k = 0; k < 3; k++) {
      el('rect', { x: 80 + so + k * 150, y: y, width: 144, height: 30, rx: 4, fill: C.panel, stroke: C.muted, 'stroke-width': 1 }, g);
      T(g, 152 + so + k * 150, y + 20, '患者 ' + (k + 1) + ' の枠', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    }
    var xr = el('g', {}, g), xy = shifted ? y + 42 : y;
    el('rect', { x: 80, y: xy, width: 66, height: 30, rx: 4, fill: shifted ? '#fff' : C.bsoft, stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': shifted ? '4 3' : 'none' }, xr);
    T(xr, 113, xy + 20, 'X 線', { 'font-size': 14, fill: color, 'text-anchor': 'middle' });
    for (var j = 0; j < 3; j++) {
      var b = el('rect', { x: 150 + j * 150, y: y + 42, width: 0, height: 30, rx: 4, fill: color, 'fill-opacity': 0.85 }, g);
      items.push({ rect: b, w: 140 });
    }
    return { xr: xr, bars: items };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1 =====
    var g1 = S.g[0];
    T(g1, 80, 110, '予約表（上）と実際の診察（下）', { 'font-size': 15, fill: C.muted });
    S.l1 = lane(g1, 140, C.a, true);
    S.w1 = T(g1, 80, 280, '診察 1 が X 線の分だけ遅れ、診察 2・3 も順に遅れる', { 'font-size': 15, 'font-weight': 600, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 140, '付帯サービスを見込まない', C.a, [['医師は検査を待ち、', 15], ['後ろの患者は', 15], ['診察を待つ', 15]]);
    TZ.note(g1, '模式図（長さは解説者が置いた例）');

    // ===== scene 2: triage at scheduling =====
    var g2 = S.g[1];
    T(g2, 80, 110, '予約の電話・受付の時点で聞き分ける', { 'font-size': 15, fill: C.muted });
    S.pts2 = [];
    var need = [false, true, false, false, true, false];
    need.forEach(function (n, i) {
      var x = 110 + i * 80, gg = el('g', {}, g2);
      el('circle', { cx: x, cy: 180, r: 24, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, gg);
      T(gg, x, 186, '患' + (i + 1), { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      var tag = el('g', {}, g2);
      el('rect', { x: x - 30, y: 222, width: 60, height: 28, rx: 6, fill: n ? C.b : C.panel }, tag);
      T(tag, x, 241, n ? 'X 線あり' : 'なし', { 'font-size': 13, fill: n ? '#fff' : C.muted, 'text-anchor': 'middle' });
      S.pts2.push({ g: gg, tag: tag, t0: 8.6 + i * 0.3 });
    });
    S.p2 = TZ.panel(g2, PX, 140, '予約時に振り分ける', C.b, [['付帯サービスが要る患者を', 15], ['予約の時点で見分ける', 15], null, ['論文の言葉では', 14, C.muted], ['予約時のトリアージ', 14, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: optimised ancillary time in the schedule =====
    var g3 = S.g[2];
    T(g3, 80, 110, 'X 線の時間を確保した予約表', { 'font-size': 15, fill: C.muted });
    S.l3 = lane(g3, 140, C.b, false);
    S.sl3 = el('g', {}, g3);
    T(S.sl3, 80, 290, '確保する時間の長さ', { 'font-size': 15, fill: C.ink });
    el('line', { x1: 80, x2: 520, y1: 316, y2: 316, stroke: C.hair, 'stroke-width': 6, 'stroke-linecap': 'round' }, S.sl3);
    S.knob3 = el('circle', { cx: 80, cy: 316, r: 10, fill: C.b }, S.sl3);
    T(S.sl3, 80, 350, '短すぎると診察が遅れ、長すぎると医師が空く', { 'font-size': 14, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 140, 'シミュレーション最適化', C.b, [['付帯サービスの頻度と長さ、', 15], ['予約枠の設計に応じて', 15], ['確保する時間を決める', 15]]);
    TZ.note(g3, '模式図（スライダーは考え方を示すだけ）');

    // ===== scene 4: results from the abstract =====
    var g4 = S.g[3];
    T(g4, 70, 70, '患者の平均の待ち時間の減少（要旨の値）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 220, x1: 700, v0: 0, v1: 10, y0: 130, rowH: 90, t0: 24.6, dt: 1.0, ticks: [0, 5, 10], fmt: function (v) { return v + '%'; },
      rows: [
        { label: '事例 1', b: 7, lb: '7% 減' },
        { label: '事例 2', b: 9, lb: '9% 減' }
      ]
    });
    S.n4 = T(g4, 70, 400, '予約時の振り分け：医師の最初の診察について平均 17 分を節約', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    TZ.note(g4, '要旨の数値から作図（本文は未読）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['平均の待ち時間（事例 1・2）', '7% 減・9% 減'], ['医師の最初の診察', '平均 17 分の節約']],
      venue: 'IJHCQA 2013', title: ['Ancillary Service Impact', 'on Outpatient Scheduling'], tsize: 32,
      sub: '付帯サービスが外来の予約に与える影響', authors: ['Yu-Li Huang'], url: 'doi.org/10.1108/IJHCQA-02-2012-0019'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.l1.xr.setAttribute('opacity', seg(t, 1.0, 1.5));
    S.l1.bars.forEach(function (b, j) { b.rect.setAttribute('width', b.w * seg(t, 1.6 + j * 0.8, 2.3 + j * 0.8)); });
    S.w1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.6));
    S.pts2.forEach(function (p) { p.g.setAttribute('opacity', seg(t, p.t0, p.t0 + 0.3)); p.tag.setAttribute('opacity', seg(t, p.t0 + 2.2, p.t0 + 2.6)); });
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.l3.xr.setAttribute('opacity', seg(t, 16.8, 17.3));
    S.l3.bars.forEach(function (b, j) { b.rect.setAttribute('width', b.w * seg(t, 17.4 + j * 0.6, 18.0 + j * 0.6)); });
    S.sl3.setAttribute('opacity', seg(t, 19.4, 19.9));
    var u = seg(t, 20, 21.5) - 0.45 * seg(t, 21.5, 22.5);
    S.knob3.setAttribute('cx', 80 + 440 * u);
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.0));
    TZ.renderBars(S.bars4, t);
    S.n4.setAttribute('opacity', seg(t, 27.5, 28.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
