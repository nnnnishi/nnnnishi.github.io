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
// teaser-scenes.js — Oh, Nishimura, Sung, Kobayashi, Nakata, An IPW-based Unbiased Ranking Metric in
// Two-sided Markets (KDD 2023 Workshop CIML). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the test DCG
// of fold 1, eta = 0.5, in Table 3 of the paper.
// Colours: orange = no correction / one-sided IPW; blue = two-sided IPW.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '求職者が企業を選び、選ばれた企業も応募者のリストを見て選ぶ。どちらのリストも上位ほど見られやすい。', en: '' },
    { ja: '見られなかった組の関心は記録に残らない。<span class="A">片側の表示確率だけで割る</span>と、2 段目の偏りが残る。', en: '' },
    { ja: '<span class="B">提案の指標</span>は、両側まで反応した組を両側の表示確率の積で割り、期待値が真の DCG に一致する。', en: '' },
    { ja: '半合成のデータでは、両側を補正した指標で選んだモデルが 20 の比較のうち 12 で最もテストの DCG が高かった。', en: '' },
    { ja: '片側の推薦で発展した偏りの補正を、双方向市場の両側の偏りに広げた。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function list(g, x, y, title, color, n) {
    T(g, x, y - 12, title, { 'font-size': 15, fill: C.muted });
    var rows = [];
    for (var k = 0; k < n; k++) {
      var op = 1 / (k + 1);
      var r = el('rect', { x: x, y: y + k * 44, width: 200, height: 36, rx: 6, fill: color, 'fill-opacity': 0.05 + 0.3 * op, stroke: color, 'stroke-width': 1.2 }, g);
      var tx = el('text', { x: x + 12, y: y + k * 44 + 24, 'font-size': 14, fill: C.ink }, g);
      tx.textContent = (k + 1) + ' 位　見られる確率 θ = ' + (k === 0 ? '1' : '1/' + (k + 1));
      rows.push(r);
    }
    return rows;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two lists =====
    var g1 = S.g[0];
    S.l1a = el('g', {}, g1); list(S.l1a, 70, 130, '求職者 u が見る企業のリスト', C.ink, 4);
    S.l1b = el('g', {}, g1); list(S.l1b, 330, 130, 'u を選ばれた企業 v が見るリスト', C.ink, 4);
    S.arr1 = el('path', { d: 'M275,148 C300,148 305,148 325,148', stroke: C.ink, 'stroke-width': 2, fill: 'none' }, g1);
    S.p1 = TZ.panel(g1, PX, 140, '2 段階の表示', C.ink, [['1 段目：u → v', 15], ['（表示 O(u→v)）', 14, C.muted], ['2 段目：v → u', 15], ['（表示 O(u←v)）', 14, C.muted]]);
    TZ.note(g1, '模式図（見られる確率は解説者が置いた例）');

    // ===== scene 2: one-sided IPW leaves bias =====
    var g2 = S.g[1];
    S.y2a = T(g2, 80, 130, 'Y(u→v) = O(u→v) · R(u→v)', { 'font-size': 19, fill: C.ink });
    S.y2b = T(g2, 80, 180, 'Y(u←v) = Y(u→v) · O(u←v) · R(u←v)', { 'font-size': 19, fill: C.ink });
    S.w2 = T(g2, 80, 260, '片側の IPW：利得を 1/θ(u→v) だけで重みづける', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.w2b = T(g2, 80, 300, '→ 2 段目の表示 O(u←v) の偏りが残る', { 'font-size': 17, fill: C.a });
    S.p2 = TZ.panel(g2, PX, 140, '補正なし・片側の補正', C.a, [['表示が確率 1 でない限り', 15], ['期待値は真の値と', 15], ['一致しない（命題 3.1）', 15]]);
    TZ.note(g2, '論文の式 1、2 と命題 3.1 から');

    // ===== scene 3: two-sided IPW =====
    var g3 = S.g[2];
    S.h3 = T(g3, 80, 140, 'h = 2<tspan baseline-shift="super" font-size="13">Y(u→v)</tspan> (2<tspan baseline-shift="super" font-size="13">Y(u←v)</tspan> − 1) / (θ(u→v) · θ(u←v))', { 'font-size': 19, 'font-weight': 650, fill: C.b });
    S.h3b = T(g3, 80, 180, '　 + (2<tspan baseline-shift="super" font-size="13">Y(u→v)</tspan> − 1) / θ(u→v)', { 'font-size': 19, 'font-weight': 650, fill: C.b });
    S.e3 = T(g3, 80, 270, 'E[ 指標 ] = 真の DCG（両側の表示が独立なら。定理 3.2）', { 'font-size': 17, fill: C.ink });
    S.g3 = T(g3, 80, 320, '利得：片側の関心 1、両側の関心 2 → 2<tspan baseline-shift="super" font-size="13">R</tspan> − 1', { 'font-size': 16, fill: C.muted });
    S.p3 = TZ.panel(g3, PX, 140, '両側の IPW', C.b, [['両側まで反応した組は', 15], ['両側の表示確率の積で、', 15], ['1 段目だけの組は', 15], ['片側の表示確率で割る', 15]]);
    TZ.note(g3, '論文の式 11 と定理 3.2 から');

    // ===== scene 4: Table 3 fold 1 =====
    var g4 = S.g[3];
    T(g4, 70, 64, 'テストの DCG（分割 1、η = 0.5、論文 Table 3）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var data = [['DCG@3', [0.927, 0.790, 0.979], 1.2], ['DCG@10', [2.357, 1.832, 2.373], 2.6], ['DCG@30', [5.195, 4.827, 5.226], 5.6]];
    var names = ['補正なし', 'IPW1', 'IPW2'], cols = [C.a, C.a, C.b], ops = [0.55, 1, 1];
    var X0 = 220, X1 = 600;
    S.bars4 = [];
    data.forEach(function (d, i) {
      var y0 = 96 + i * 130;
      T(g4, 70, y0 + 20, d[0], { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      d[1].forEach(function (v, k) {
        var y = y0 + 30 + k * 30, w = v / d[2] * (X1 - X0);
        T(g4, X0 - 10, y + 17, names[k], { 'font-size': 14, fill: cols[k], 'text-anchor': 'end' });
        var rect = el('rect', { x: X0, y: y + 2, width: 0, height: 22, fill: cols[k], 'fill-opacity': ops[k] }, g4);
        var lab = el('text', { x: X0 + w + 6, y: y + 19, 'font-size': 14, 'font-weight': 600, fill: cols[k] }, g4);
        lab.textContent = v.toFixed(3);
        S.bars4.push({ rect: rect, lab: lab, w: w, t0: 24.6 + i * 0.9 + k * 0.25 });
      });
    });
    S.p4 = TZ.panel(g4, PX + 20, 130, '5 分割 × 4 つの K', C.ink, [['最も高かった回数', 15, C.muted], ['IPW2：12 回', 17, C.b, 650], ['補正なし・IPW1：4 回ずつ', 15, C.a], null, ['（解説者が Table 3', 14, C.muted], ['から数えた）', 14, C.muted]]);
    TZ.note(g4, '論文 Table 3 の数値から作図（棒の長さは K ごとの目盛り）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['補正する偏り', '両側の表示位置の偏り'], ['理論', '両側の IPW で不偏（定理 3.2）']],
      venue: 'KDD 2023 WORKSHOP (CIML)', title: ['An IPW-based Unbiased Ranking Metric', 'in Two-sided Markets'], tsize: 30,
      sub: '双方向市場のための、IPW にもとづく不偏なランキングの評価指標', authors: ['Keisho Oh, Naoki Nishimura, Minje Sung, Ken Kobayashi, Kazuhide Nakata'], url: 'arxiv.org/abs/2307.10204'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.l1a.setAttribute('opacity', seg(t, 1.0, 1.8));
    S.arr1.setAttribute('opacity', seg(t, 2.6, 3.0));
    S.l1b.setAttribute('opacity', seg(t, 3.0, 3.8));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    S.y2a.setAttribute('opacity', seg(t, 8.6, 9.2));
    S.y2b.setAttribute('opacity', seg(t, 9.6, 10.2));
    S.w2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.w2b.setAttribute('opacity', seg(t, 12.0, 12.6));
    S.p2.setAttribute('opacity', seg(t, 13.0, 13.8));
    S.h3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.h3b.setAttribute('opacity', seg(t, 17.0, 17.6));
    S.e3.setAttribute('opacity', seg(t, 18.8, 19.4));
    S.g3.setAttribute('opacity', seg(t, 20.0, 20.6));
    S.p3.setAttribute('opacity', seg(t, 17.6, 18.4));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.7)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
