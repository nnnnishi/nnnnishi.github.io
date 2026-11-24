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
// teaser-scenes.js — Tomita & Yokoyama, Fair Reciprocal Recommendation in Matching Markets (RecSys 2024).
// Unofficial explainer. All scenes are schematics with explainer-chosen toy values (labelled 模式図);
// the paper reports its results only in figures, so no numbers from the paper are drawn.
// Colours: orange = the SW-maximising policy and the envy it leaves; blue = the NSW policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '双方向の推薦では両側がそれぞれ推薦リストを受け取り、<span class="B">互いに応募したときだけ</span>マッチする。', en: '' },
    { ja: '<span class="A">期待マッチ数だけを最大化</span>すると、相手側のリストの上位を一部の利用者が占める。', en: '' },
    { ja: '自分の機会を他人の機会と入れ替えたらマッチが増えるなら、その人を羨んでいる。両側でこれがない状態を目指す。', en: '' },
    { ja: '<span class="B">提案法</span>は各利用者の期待マッチ数の積を片側ずつ交互に最大化し、嫉妬をほぼなくす。', en: '' },
    { ja: '期待マッチ数の最大化の研究に、公平分配の嫉妬のなさを持ち込んだ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function person(g, x, y, label, color) {
    el('circle', { cx: x, cy: y, r: 24, fill: '#fff', stroke: color || C.ink, 'stroke-width': 1.8 }, g);
    T(g, x, y + 6, label, { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
  }
  function arrow(g, x1, y1, x2, y2, color) {
    var a = Math.atan2(y2 - y1, x2 - x1), gg = el('g', {}, g);
    el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, 'stroke-width': 2.4 }, gg);
    el('path', { d: 'M' + x2 + ',' + y2 + ' l' + (-12 * Math.cos(a) + 6 * Math.sin(a)) + ',' + (-12 * Math.sin(a) - 6 * Math.cos(a)) + ' l' + (-12 * Math.sin(a)) + ',' + (12 * Math.cos(a)) + ' z', fill: color }, gg);
    return gg;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: mutual application =====
    var g1 = S.g[0];
    person(g1, 150, 220, 'a₁'); person(g1, 470, 220, 'b₁');
    S.ap1 = arrow(g1, 178, 205, 440, 205, C.ink);
    S.ap1t = T(g1, 310, 192, 'a₁ が b₁ に応募', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted });
    S.ap2 = arrow(g1, 442, 238, 180, 238, C.ink);
    S.ap2t = T(g1, 310, 264, 'b₁ も a₁ に応募', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted });
    S.m1 = T(g1, 310, 340, '→ マッチ', { 'font-size': 20, 'font-weight': 650, 'text-anchor': 'middle', fill: C.b });
    S.f1 = T(g1, 80, 420, '応募の確率 ＝ 関心の確率 × 順位で決まる見る確率 v(k)', { 'font-size': 15, fill: C.ink });
    S.p1 = TZ.panel(g1, PX, 140, '両側が推薦を受け取る', C.ink, [['左の利用者にも', 15], ['右の利用者にも', 15], ['推薦リストを出す', 15], null, ['リストは二重確率行列', 15, C.muted], ['A_i、B_j で表す', 15, C.muted]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: SW-optimal concentrates the opportunity =====
    var g2 = S.g[1];
    T(g2, 80, 96, 'b₁ への推薦リスト（期待マッチ数を最大化）', { 'font-size': 15, fill: C.muted });
    S.list2 = [['1 位', 'a₁', C.a], ['2 位', 'a₂', C.gray]].map(function (r, k) {
      var gg = el('g', {}, g2), y = 130 + k * 70;
      T(gg, 90, y + 30, r[0], { 'font-size': 16, fill: C.ink });
      el('rect', { x: 150, y: y, width: 260, height: 48, rx: 8, fill: '#fff', stroke: r[2], 'stroke-width': 2 }, gg);
      T(gg, 280, y + 30, r[1] + (k === 0 ? '（見る確率 1）' : '（見る確率 1/2）'), { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
      return { g: gg, t0: 9.0 + k * 0.7 };
    });
    S.env2 = T(g2, 90, 340, 'a₂：「a₁ の位置にいれば、自分ももっとマッチできたのに」', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '期待マッチ数の最大化（SW）', C.a, [['合計は最大でも、', 15], ['機会が一部に集まる', 15], null, ['人気の偏りが大きいほど', 15, C.muted], ['嫉妬が増えた', 15, C.muted]]);
    TZ.note(g2, '模式図（論文の例 2.2 にならった小さな市場）');

    // ===== scene 3: envy as swapping opportunities =====
    var g3 = S.g[2];
    var boxes = [['a₁ の機会 C₁', 120, C.gray], ['a₂ の機会 C₂', 360, C.gray]];
    boxes.forEach(function (b) {
      el('rect', { x: b[1], y: 130, width: 190, height: 90, rx: 10, fill: C.panel, stroke: C.gray, 'stroke-width': 1.5 }, g3);
      T(g3, b[1] + 95, 170, b[0], { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
      T(g3, b[1] + 95, 196, '相手側のリストでの位置', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted });
    });
    S.sw3 = el('g', {}, g3);
    el('path', { d: 'M215,230 C215,280 455,280 455,230', fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.sw3);
    T(S.sw3, 335, 300, '入れ替えて比べる', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted });
    S.ineq3 = T(g3, 80, 370, 'U₂(C₂) < U₂(C₁) なら a₂ は a₁ を羨む', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.def3 = T(g3, 80, 420, '両側の嫉妬のなさ：左の全員の組でも、右の全員の組でも羨まない', { 'font-size': 16, 'font-weight': 650, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, '機会の嫉妬のなさ', C.b, [['自分の推薦リストは', 15], ['そのままで、', 15], ['機会だけを入れ替える', 15], null, ['Saito & Joachims の', 15, C.muted], ['インパクトを両側に広げた', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: NSW vs SW per-user matches =====
    var g4 = S.g[3];
    T(g4, 70, 70, '利用者ごとの期待マッチ数（模式図）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var sw = [1.6, 1.3, 0.9, 0.3, 0.1], ns = [1.1, 1.0, 0.9, 0.7, 0.5];
    S.bars4 = [];
    [[sw, C.a, 'SW：和を最大化', 90], [ns, C.b, 'NSW：積を最大化', 360]].forEach(function (set, si) {
      T(g4, set[3], 110, set[2], { 'font-size': 15, 'font-weight': 600, fill: set[1] });
      el('line', { x1: set[3], x2: set[3] + 230, y1: 360, y2: 360, stroke: C.ink, 'stroke-width': 1.2 }, g4);
      set[0].forEach(function (v, k) {
        var h = v * 130, x = set[3] + 10 + k * 44;
        var r = el('rect', { x: x, y: 360, width: 32, height: 0, fill: set[1] }, g4);
        S.bars4.push({ r: r, h: h, t0: 24.6 + si * 1.4 + k * 0.15 });
      });
    });
    S.eq4 = T(g4, 70, 420, 'B を固定すると log NSW は A について凹 → Frank-Wolfe 法で交互に最大化', { 'font-size': 15, fill: C.ink });
    S.p4 = TZ.panel(g4, PX, 130, '実験では', C.b, [['NSW の嫉妬は', 15], ['すべての条件でほぼゼロ', 15, C.b, 650], null, ['マッチ数は Prod、TU と', 15, C.muted], ['同程度、最多は SW', 15, C.muted]]);
    TZ.note(g4, '模式図（棒の高さは解説者が置いた例）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['公平性の定義', '両側の嫉妬のなさ'], ['解き方', '両側の NSW を交互に最大化']],
      venue: 'RECSYS 2024', title: ['Fair Reciprocal Recommendation', 'in Matching Markets'], tsize: 32,
      sub: 'マッチング市場の公平な相互推薦', authors: ['Yoji Tomita, Tomohiko Yokoyama'], url: 'doi.org/10.1145/3640457.3688130'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.ap1.setAttribute('opacity', seg(t, 1.0, 1.6)); S.ap1t.setAttribute('opacity', seg(t, 1.0, 1.6));
    S.ap2.setAttribute('opacity', seg(t, 2.4, 3.0)); S.ap2t.setAttribute('opacity', seg(t, 2.4, 3.0));
    S.m1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.f1.setAttribute('opacity', seg(t, 4.8, 5.4));
    S.p1.setAttribute('opacity', seg(t, 1.6, 2.4));
    S.list2.forEach(function (l) { l.g.setAttribute('opacity', seg(t, l.t0, l.t0 + 0.4)); });
    S.env2.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    S.sw3.setAttribute('opacity', seg(t, 18.0, 18.6));
    S.ineq3.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.def3.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    S.bars4.forEach(function (b) {
      var h = b.h * H.ease(seg(t, b.t0, b.t0 + 0.6));
      b.r.setAttribute('y', 360 - h); b.r.setAttribute('height', h);
    });
    S.eq4.setAttribute('opacity', seg(t, 27.6, 28.2));
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
