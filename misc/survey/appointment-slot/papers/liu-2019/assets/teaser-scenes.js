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
// teaser-scenes.js — Liu, van de Ven, Zhang, Managing Appointment Booking Under Customer Choices
// (Management Science 2019). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy markets (labelled 模式図). Scene 4 uses the ranges of
// average gaps in Tables 3-5 of arXiv v1 and the abstract's 6-8% / 18%.
// Colours: orange = offering all slots at once; blue = sequential offering (least valuable first, Drain).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '<span class="A">空き枠をまとめて見せる</span>と、いつでもよい客が夕方の枠を取り、夕方しか来られない客が帰ってしまう。', en: '' },
    { ja: '<span class="B">朝の枠から順に見せる</span>と、いつでもよい客は朝を取り、夕方の枠は夕方しか来られない客に残る。', en: '' },
    { ja: '一般の場合は、残り枠と予想需要の比が大きい（余っている）種類から見せる。これが Drain heuristic である。', en: '' },
    { ja: '数値実験では、順に見せる最適な方策が比較対象より平均 6〜11% 多く枠を埋めた。', en: '' },
    { ja: '何を受けるかではなく、何をどの順で見せるかで枠を守る研究である。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  // a day with 2 morning and 2 evening slots; returns slot rects
  function day(g, y) {
    var r = [];
    T(g, 80, y - 14, '朝', { 'font-size': 15, fill: C.muted });
    T(g, 330, y - 14, '夕方', { 'font-size': 15, fill: C.muted });
    [80, 180, 330, 430].forEach(function (x) {
      r.push(el('rect', { x: x, y: y, width: 90, height: 50, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g));
    });
    return r;
  }
  // customers queue: kinds 'any' or 'eve'
  function queue(g, kinds, y) {
    return kinds.map(function (k, i) {
      var c = el('g', {}, g);
      el('circle', { cx: 110 + i * 120, cy: y, r: 20, fill: k === 'any' ? C.gray : '#fff', stroke: C.ink, 'stroke-width': 1.6 }, c);
      T(c, 110 + i * 120, y + 42, k === 'any' ? 'いつでも' : '夕方のみ', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return c;
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: offering all =====
    var g1 = S.g[0];
    S.s1 = day(g1, 120);
    S.q1 = queue(g1, ['any', 'any', 'eve', 'eve'], 300);
    T(g1, 80, 270, '来る順の客', { 'font-size': 14, fill: C.muted });
    S.x1 = el('g', {}, g1);
    T(S.x1, 470, 420, '空きが合わず帰る', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 140, '全部の枠を見せる', C.a, [['いつでもよい客は', 16], ['見えた枠から選ぶ', 16], null, ['夕方の枠が先に', 15, C.a], ['埋まることがある', 15, C.a]]);
    TZ.note(g1, '模式図（数値は解説者が置いた例）');

    // ===== scene 2: sequential =====
    var g2 = S.g[1];
    S.s2 = day(g2, 120);
    S.q2 = queue(g2, ['any', 'any', 'eve', 'eve'], 300);
    T(g2, 80, 270, '来る順の客', { 'font-size': 14, fill: C.muted });
    S.ok2 = T(g2, 290, 420, '4 枠とも埋まる', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 140, '1 種類ずつ順に見せる', C.b, [['まず朝の枠を見せ、', 16], ['断られたら夕方を見せる', 16], null, ['残しておく価値が', 15, C.muted], ['小さい枠から出す', 15, C.muted], ['（定理 3）', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: Drain index =====
    var g3 = S.g[2];
    T(g3, 70, 100, 'I_j = 残り枠 m_j ÷ 今後 n 期の予想需要', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    var D = [['朝', 3, 1.0], ['昼', 2, 2.0], ['夕方', 1, 2.5]];
    S.bars3 = D.map(function (d, i) {
      var y = 150 + i * 80, v = d[1] / d[2], w = 180 * v / 3;
      T(g3, 150, y + 30, d[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var r = el('rect', { x: 170, y: y + 8, width: 0, height: 32, fill: C.b, 'fill-opacity': 0.35 + 0.65 * (1 - i / 3) }, g3);
      var l = el('text', { x: 180 + w, y: y + 30, 'font-size': 15, fill: C.ink }, g3);
      l.textContent = d[1] + ' ÷ ' + d[2] + ' = ' + v.toFixed(2) + '（' + (i + 1) + ' 番目）';
      return { r: r, l: l, w: w, t0: 17.0 + i * 0.7 };
    });
    S.p3 = TZ.panel(g3, PX + 30, 140, 'Drain heuristic', C.b, [['余っている種類から', 16], ['先に見せ、全種類が', 16], ['同じころ空になる', 16], ['ようにする', 16]]);
    TZ.note(g3, '模式図（数値は解説者が置いた例）');

    // ===== scene 4: ranges of average gains (arXiv v1 Tables 3-5) =====
    var g4 = S.g[3];
    T(g4, 70, 64, '最適な順の提示が greedy より多く埋めた割合の平均（arXiv v1 Table 3〜5）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 240, X1 = 600, V1 = 12;
    function sx(v) { return X0 + v / V1 * (X1 - X0); }
    [0, 3, 6, 9, 12].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 100, y2: 400, stroke: C.hair }, g4);
      T(g4, sx(v), 424, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    var R = [['N 型', 6.2, 11.2], ['W 型', 6.1, 8.4], ['M 型', 7.2, 8.1]];
    S.bars4 = R.map(function (r, i) {
      var y = 130 + i * 90;
      T(g4, X0 - 14, y + 26, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: sx(r[1]), y: y + 6, width: 0, height: 30, rx: 4, fill: C.b }, g4);
      var lab = el('text', { x: sx(r[2]) + 8, y: y + 27, 'font-size': 15, 'font-weight': 600, fill: C.b }, g4);
      lab.textContent = r[1] + '〜' + r[2] + '%';
      return { rect: rect, lab: lab, w: sx(r[2]) - sx(r[1]), t0: 24.8 + i * 0.8 };
    });
    S.p4 = TZ.panel(g4, PX + 40, 140, '論文の要旨', C.b, [['まとめて見せる場合より', 15], ['平均 6〜8%、', 15], ['最大 18% 多く埋まる', 15], null, ['Drain と最適の差', 15, C.muted], ['M 型で平均 0.7% 以内', 15, C.muted]]);
    TZ.note(g4, '論文（arXiv v1）の表と要旨の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['埋まる枠（順に見せる）', '平均 6〜8% 増'], ['Drain heuristic', '最適とほぼ同じ']],
      venue: 'MANAGEMENT SCIENCE 2019', title: ['Managing Appointment Booking', 'Under Customer Choices'], tsize: 32,
      sub: '顧客の選択のもとでの予約受付の管理', authors: ['Nan Liu, Peter M. van de Ven, Bo Zhang'], url: 'doi.org/10.1287/mnsc.2018.3150'
    });
    return S;
  }

  function fillSlot(r, on, col) { r.setAttribute('fill', on > 0.5 ? col : '#fff'); }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    // scene 1: any->eve slot 3, any->eve slot 4, eve customers find nothing
    S.q1.forEach(function (c, i) { c.setAttribute('opacity', 1 - 0.75 * seg(t, 1.5 + i * 1.1, 2.0 + i * 1.1)); });
    fillSlot(S.s1[2], seg(t, 1.5, 2.0), C.gray);
    fillSlot(S.s1[3], seg(t, 2.6, 3.1), C.gray);
    S.x1.setAttribute('opacity', seg(t, 4.0, 4.6));
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    // scene 2: any->morning x2, eve->evening x2
    S.q2.forEach(function (c, i) { c.setAttribute('opacity', 1 - 0.75 * seg(t, 9.0 + i * 1.0, 9.5 + i * 1.0)); });
    fillSlot(S.s2[0], seg(t, 9.0, 9.5), C.gray);
    fillSlot(S.s2[1], seg(t, 10.0, 10.5), C.gray);
    fillSlot(S.s2[2], seg(t, 11.0, 11.5), C.b);
    fillSlot(S.s2[3], seg(t, 12.0, 12.5), C.b);
    S.ok2.setAttribute('opacity', seg(t, 12.6, 13.2));
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    S.bars3.forEach(function (b) { b.r.setAttribute('width', b.w * seg(t, b.t0, b.t0 + 0.6)); b.l.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8)); });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.bars4.forEach(function (b) { b.rect.setAttribute('width', Math.max(0, b.w * seg(t, b.t0, b.t0 + 0.6))); b.lab.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8)); });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
