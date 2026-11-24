// ---- shared helpers for the optimal-tree explainer teasers (Japanese-only pages) ----
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
// teaser-scenes.js — Lin, Zhong, Hu, Rudin & Seltzer, Generalized and Scalable Optimal Sparse Decision
// Trees (ICML 2020). Unofficial explainer.
// Scenes 1 and 3 are schematics with explainer-chosen toy points (labelled 模式図). Scene 2 uses the
// accuracies in Section 3 (93.5% vs 92.2%). Scene 4 uses the areas printed in the legend of Fig. 2.
// Colours: orange = accuracy-only / bucketization; blue = GOSDT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: 'それまでの方法は、値の順に並べて同じラベルが隣り合う所では分けない<span class="A">前処理</span>で、しきい値の候補を減らしていた。', en: '' },
    { ja: '論文が作った例では、この前処理をすると最適な木の訓練精度が 93.5% から 92.2% に下がった。', en: '' },
    { ja: '<span class="B">GOSDT</span> は部分問題を例の集合で識別し、違う条件から同じ例の集合に着く問題を 1 つにまとめて解く。', en: '' },
    { ja: '目的関数を正解率から AUC に変えると、同じデータで ROC の下の面積が 0.78 から 0.92 の木が得られた。', en: '' },
    { ja: 'すべてのしきい値を候補にしたまま、DL8.5 より数桁速く最適な木を求められた、と論文は報告する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: bucketization on a sorted feature =====
    var g1 = S.g[0];
    var labs = [0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1];
    var X0 = 90, DX = 44, Y = 210;
    el('line', { x1: X0 - 20, x2: X0 + DX * 11 + 20, y1: Y + 34, y2: Y + 34, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    T(g1, X0 + DX * 5.5, Y + 66, '特徴量の値の順に並べた例', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    labs.forEach(function (l, i) {
      el('circle', { cx: X0 + i * DX, cy: Y, r: 14, fill: l ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2 }, g1);
    });
    S.cuts1 = [];
    for (var i = 0; i < labs.length - 1; i++) {
      var x = X0 + (i + 0.5) * DX, ok = labs[i] !== labs[i + 1];
      var ln = el('line', { x1: x, x2: x, y1: Y - 40, y2: Y + 28, stroke: ok ? C.b : C.a, 'stroke-width': 2.4, 'stroke-dasharray': ok ? 'none' : '4 4' }, g1);
      var mk = el('text', { x: x, y: Y - 50, 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ok ? C.b : C.a }, g1);
      mk.textContent = ok ? '○' : '×';
      S.cuts1.push({ ln: ln, mk: mk, ok: ok, t0: 1.6 + i * 0.25 });
    }
    T(g1, 90, 360, '● ラベル 1　○ ラベル 0', { 'font-size': 15, fill: C.muted });
    T(g1, 90, 392, '× 同じラベルが隣り合う所：前処理では分岐の候補から外す', { 'font-size': 15, fill: C.a });
    S.p1 = TZ.panel(g1, PX, 150, '前処理（bucketization）', C.a, ['しきい値の候補が減り、', '探索は速くなる。', null, ['BinOCT と DL8.5 が', 15, C.muted], ['使っていた。', 15, C.muted]]);
    TZ.note(g1, '模式図（点は解説者が置いた例）');

    // ===== scene 2: 93.5% vs 92.2% =====
    var g2 = S.g[1];
    S.n2a = T(g2, 190, 240, '93.5%', { 'font-size': 76, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
    T(g2, 190, 292, '前処理なしの最適な木', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.n2b = T(g2, 480, 240, '92.2%', { 'font-size': 76, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    T(g2, 480, 292, '前処理ありの最適な木', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    S.n2c = T(g2, 335, 380, 'BinOCT・DL8.5・GOSDT のどれでも同じ値（最適性を証明）', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 150, '定理 3.1', C.ink, ['前処理をしたデータでの', '最大の訓練精度は、', 'しないときより', '低くなりうる。', null, ['論文が作った 2 次元の', 15, C.muted], ['データでの訓練精度', 15, C.muted]]);
    TZ.note(g2, '数値は論文第 3 節による');

    // ===== scene 3: two assertions, one support set =====
    var g3 = S.g[2];
    function box(g, x, y, w, s, col) {
      el('rect', { x: x - w / 2, y: y - 22, width: w, height: 44, rx: 10, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      T(g, x, y + 6, s, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    }
    S.a3 = el('g', {}, g3); S.b3 = el('g', {}, g3); S.m3 = el('g', {}, g3);
    box(S.a3, 170, 110, 220, '条件 A かつ B', C.gray);
    box(S.b3, 490, 110, 220, '条件 C かつ D', C.gray);
    el('line', { x1: 170, y1: 132, x2: 320, y2: 228, stroke: C.b, 'stroke-width': 2.4 }, S.m3);
    el('line', { x1: 490, y1: 132, x2: 340, y2: 228, stroke: C.b, 'stroke-width': 2.4 }, S.m3);
    var bits = '1 0 1 1 0 0 1 0';
    el('rect', { x: 200, y: 228, width: 260, height: 64, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 2.4 }, S.m3);
    T(S.m3, 330, 256, '届く例の集合（ビットベクトル）', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    T(S.m3, 330, 282, bits, { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle', 'letter-spacing': 2 });
    S.m3b = T(g3, 330, 340, '→ 部分問題は 1 つ。最適な部分木も 1 回だけ求める', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.up3 = el('g', {}, g3);
    el('path', { d: 'M 330 400 L 330 372', stroke: C.b, 'stroke-width': 2.4, 'marker-end': '' }, S.up3);
    T(S.up3, 330, 428, '子の上下界が変わったら、すぐ親に伝えて計算し直す', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 120, 'GOSDT の動的計画法', C.b, [['DL8.5 は条件の組で', 15, C.muted], ['部分問題を区別する', 15, C.muted], null, ['GOSDT は届く例の集合で', 16], ['区別する', 16], null, ['似たしきい値の分岐は', 15, C.muted], ['子孫の部分問題を共有する', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: area under ROC by objective (Fig. 2 legend) =====
    var g4 = S.g[3];
    T(g4, 70, 64, '目的関数ごとの最適な木の ROC の下の面積（FourClass）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [
      { label: '正解率', a: 0.78 }, { label: 'F 値（ω = 0.9）', b: 0.79 }, { label: 'バランス正解率', b: 0.81 },
      { label: '重みつき（ω = 3）', b: 0.82 }, { label: 'pAUCch（θ = 0.2）', b: 0.85 }, { label: 'AUCch', b: 0.92 }
    ];
    rows.forEach(function (r) { var v = r.a != null ? r.a : r.b; if (r.a != null) r.la = v.toFixed(2); else r.lb = v.toFixed(2); });
    S.bars4 = TZ.pairs(g4, { x0: 220, x1: 590, v0: 0.6, v1: 1.0, y0: 100, rowH: 56, rows: rows, t0: 24.6, dt: 0.5, ticks: [0.6, 0.7, 0.8, 0.9, 1.0], fmt: function (v) { return v.toFixed(1); } });
    S.p4 = TZ.panel(g4, PX, 120, '橙：正解率だけ', C.a, [['それまでの方法が', 15, C.muted], ['最適化できた目的関数', 15, C.muted], null, ['青：GOSDT で', 16, C.b, 650], ['新たに扱えた目的関数', 16, C.b, 650], null, ['<tspan class="mi">λ</tspan> = 0.01、訓練データ', 15, C.muted]]);
    TZ.note(g4, '論文 Fig. 2 の凡例の数値から作図（横軸は 0.6 から）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['前処理なしの最適な木', '93.5%（ありは 92.2%）'], ['AUC で最適化した木', 'ROC の下の面積 0.92']],
      venue: 'ICML 2020', title: ['Generalized and Scalable', 'Optimal Sparse Decision Trees'], tsize: 32,
      sub: '一般化し、大きな問題に広げた疎で最適な決定木', authors: ['Jimmy Lin, Chudi Zhong, Diane Hu, Cynthia Rudin, Margo Seltzer'], url: 'proceedings.mlr.press/v119/lin20g.html'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.cuts1.forEach(function (c) { var v = seg(t, c.t0, c.t0 + 0.3); c.ln.setAttribute('opacity', v); c.mk.setAttribute('opacity', v); });
    S.p1.setAttribute('opacity', seg(t, 1.4, 2.2));
    S.n2a.setAttribute('opacity', seg(t, 8.8, 9.4));
    S.n2b.setAttribute('opacity', seg(t, 10.0, 10.6));
    S.n2c.setAttribute('opacity', seg(t, 11.2, 11.8));
    S.p2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.a3.setAttribute('opacity', seg(t, 16.6, 17.0));
    S.b3.setAttribute('opacity', seg(t, 17.2, 17.6));
    S.m3.setAttribute('opacity', seg(t, 18.2, 18.8));
    S.m3b.setAttribute('opacity', seg(t, 19.2, 19.8));
    S.up3.setAttribute('opacity', seg(t, 20.6, 21.2));
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    TZ.renderBars(S.bars4, t);
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
