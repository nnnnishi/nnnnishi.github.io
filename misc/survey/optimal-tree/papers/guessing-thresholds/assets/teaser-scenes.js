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
// teaser-scenes.js — McTavish, Zhong, Achermann, Karimalis, Chen, Rudin & Seltzer, Fast Sparse Decision
// Tree Optimization via Reference Ensembles (AAAI 2022). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the training
// times printed in the caption of Fig. 7 (COMPAS, lambda = 0.001) and the 30-minute limit of Sec. 5.2,
// within which every baseline without threshold guessing failed to finish (Fig. 3 caption).
// Colours: orange = search without guesses; blue = the guesses from the reference GBDT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg, MI = H.MI;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '連続値の特徴量のすべての中点をしきい値にすると、<span class="A">候補が多すぎて</span>最適化が時間内に終わらないことがある。', en: '' },
    { ja: '<span class="B">しきい値の推測</span>では勾配ブースティングの木が使うしきい値だけを残し、精度が落ちない範囲で削る。', en: '' },
    { ja: '<span class="B">下界の推測</span>では参照モデルの誤りを部分問題の下界とみなし、それに並んだら探索を止める。', en: '' },
    { ja: 'COMPAS で 3 つの推測を使った GOSDT は、深さ 3 なら 0.513 秒、深さ 5 でも 34.804 秒で木を出した。', en: '' },
    { ja: '推測で得た木は、参照モデルが間違えて最適な木なら正しく分類できる例の分しか、最適な木より悪くならない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function axisWithPoints(g, y, seed) {
    var r = H.rng(seed), xs = [];
    for (var i = 0; i < 34; i++) xs.push(90 + r() * 500);
    xs.sort(function (a, b) { return a - b; });
    el('line', { x1: 80, x2: 600, y1: y, y2: y, stroke: C.ink, 'stroke-width': 1.5 }, g);
    xs.forEach(function (x, i) { el('circle', { cx: x, cy: y - 14, r: 5, fill: r() < 0.5 ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g); });
    return xs;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: every midpoint is a threshold =====
    var g1 = S.g[0];
    T(g1, 80, 120, '連続値の特徴量 1 つ（例を値の順に並べた）', { 'font-size': 15, fill: C.muted });
    var xs = axisWithPoints(g1, 200, 7);
    S.ticks1 = [];
    for (var i = 0; i < xs.length - 1; i++) {
      var x = (xs[i] + xs[i + 1]) / 2;
      S.ticks1.push(el('line', { x1: x, x2: x, y1: 150, y2: 230, stroke: C.a, 'stroke-width': 1.6 }, g1));
    }
    S.cnt1 = T(g1, 80, 270, '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    S.clock = el('g', {}, g1);
    el('rect', { x: 80, y: 320, width: 520, height: 26, rx: 13, fill: C.panel }, S.clock);
    S.clockBar = el('rect', { x: 80, y: 320, width: 0, height: 26, rx: 13, fill: C.a }, S.clock);
    S.clockLab = T(S.clock, 340, 380, '制限時間 30 分 → 時間切れ', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 140, '推測なし', C.a, ['二値化すると特徴量が', '大きく増える。', null, ['疎な木の計算時間は', 15, C.muted], ['特徴量の数に対して', 15, C.muted], ['階乗のように増える', 15, C.muted]]);
    TZ.note(g1, '模式図（点は解説者が置いた例）');

    // ===== scene 2: keep the thresholds used by GBDT =====
    var g2 = S.g[1];
    T(g2, 80, 120, '同じ特徴量で、参照モデル（GBDT）が使うしきい値', { 'font-size': 15, fill: C.muted });
    var xs2 = axisWithPoints(g2, 200, 7);
    S.ticks2 = [];
    var keep = [6, 14, 22, 27];
    for (var j = 0; j < xs2.length - 1; j++) {
      var x2 = (xs2[j] + xs2[j + 1]) / 2, k = keep.indexOf(j) >= 0;
      S.ticks2.push({ l: el('line', { x1: x2, x2: x2, y1: 150, y2: 230, stroke: k ? C.b : C.a, 'stroke-width': k ? 3 : 1.6 }, g2), keep: k });
    }
    S.cnt2 = T(g2, 80, 270, 'しきい値 4 個だけを残す', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    S.steps2 = TZ.panel(g2, 80, 320, '', C.ink, [['① GBDT の全部の木から、使われたしきい値を集める', 15], ['② 重要度の低いものから除き、GBDT を学習し直す', 15], ['③ 訓練の性能が下がったら止める', 15]]);
    S.p2 = TZ.panel(g2, PX, 140, 'しきい値の推測', C.b, ['GBDT の精度に届く', 'しきい値は残る。', null, ['得られる木は、GBDT を', 15, C.muted], ['再現する最小の木より', 15, C.muted], ['目的関数で悪くならない', 15, C.muted], ['（定理 4.1）', 15, C.muted]]);
    TZ.note(g2, '模式図');

    // ===== scene 3: guessed lower bound stops a subproblem early =====
    var g3 = S.g[2];
    el('rect', { x: 120, y: 100, width: 420, height: 80, rx: 12, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3);
    T(g3, 330, 132, '部分問題：ある条件に届く例 200 件', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    T(g3, 330, 160, '参照モデルはこのうち 12 件を間違える', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    S.lb3 = el('g', {}, g3);
    el('rect', { x: 120, y: 214, width: 420, height: 56, rx: 12, fill: C.bsoft }, S.lb3);
    T(S.lb3, 330, 249, '推測の下界：誤り 12 件 ＋ 葉 1 枚の罰則', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    S.try3 = [];
    [['部分木の候補 1：誤り 19 件', C.a, '探索を続ける'], ['部分木の候補 2：誤り 12 件', C.b, '下界に並んだ → 解けたことにする']].forEach(function (c, i) {
      var g = el('g', {}, g3);
      T(g, 140, 320 + i * 54, c[0], { 'font-size': 16, fill: C.ink });
      T(g, 400, 320 + i * 54, c[2], { 'font-size': 15, 'font-weight': 600, fill: c[1] });
      S.try3.push(g);
    });
    S.p3 = TZ.panel(g3, PX, 120, '下界の推測', C.b, [['最適と証明しなくても、', 15], ['参照モデルの精度に', 15], ['並んだら止める。', 15], null, ['深さの推測（2〜5）も', 15, C.muted], ['加えて探索を絞る', 15, C.muted]]);
    TZ.note(g3, '模式図（件数は解説者が置いた例）');

    // ===== scene 4: training time on COMPAS (log scale) =====
    var g4 = S.g[3];
    T(g4, 70, 70, 'COMPAS での学習時間（λ = 0.001、対数目盛）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var LX0 = 250, LX1 = 600, lo = -1, hi = Math.log10(3000);
    function lx(v) { return LX0 + (Math.log10(v) - lo) / (hi - lo) * (LX1 - LX0); }
    [0.1, 1, 10, 100, 1000].forEach(function (v) {
      el('line', { x1: lx(v), x2: lx(v), y1: 100, y2: 380, stroke: C.hair }, g4);
      el('text', { x: lx(v), y: 404, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + ' 秒';
    });
    el('line', { x1: LX0, x2: LX0, y1: 100, y2: 380, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    var rows4 = [
      ['推測なし（深さ 5）', 1800, C.a, '30 分で終わらず', 130],
      ['3 つの推測（深さ 5）', 34.804, C.b, '34.804 秒・葉 9 枚', 230],
      ['3 つの推測（深さ 3）', 0.513, C.b, '0.513 秒・葉 7 枚', 330]
    ];
    S.bars4 = rows4.map(function (r, i) {
      T(g4, LX0 - 12, r[4] + 6, r[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: LX0, y: r[4] - 20, width: 0, height: 40, fill: r[2], 'fill-opacity': i === 0 ? 0.35 : 1, stroke: r[2], 'stroke-width': i === 0 ? 2 : 0, 'stroke-dasharray': i === 0 ? '6 4' : 'none' }, g4);
      var lab = el('text', { x: lx(r[1]) + 8, y: r[4] + 6, 'font-size': 15, 'font-weight': 650, fill: r[2] }, g4);
      lab.textContent = r[3];
      if (i === 0) { lab.setAttribute('x', LX0 + 10); lab.setAttribute('y', r[4] + 46); }
      return { rect: rect, lab: lab, w: lx(r[1]) - LX0, t0: 24.6 + i * 0.9 };
    });
    S.p4 = TZ.panel(g4, PX, 120, '得られた木（fold 2）', C.ink, [['深さ 3：訓練 0.683、', 15, C.muted], ['テスト 0.689', 15, C.muted], null, ['深さ 5：訓練 0.685、', 15, C.muted], ['テスト 0.696', 15, C.muted], null, ['推測なしは 30 分で', 15, C.muted], ['終わらなかった', 15, C.muted]]);
    TZ.note(g4, '論文 Fig. 7 の説明文と第 5.2 節の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['推測による学習時間の短縮', '多くの場合 1〜2 桁'], ['COMPAS・深さ 3', '0.513 秒で葉 7 枚の木']],
      venue: 'AAAI 2022', title: ['Fast Sparse Decision Tree Optimization', 'via Reference Ensembles'], tsize: 30,
      sub: '参照アンサンブルを使った、疎な決定木の速い最適化', authors: ['Hayden McTavish, Chudi Zhong, Reto Achermann, Ilias Karimalis,', 'Jacques Chen, Cynthia Rudin, Margo Seltzer'], url: 'doi.org/10.1609/aaai.v36i9.21194'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    var n1 = 0;
    S.ticks1.forEach(function (l, i) { var v = seg(t, 1.0 + i * 0.07, 1.2 + i * 0.07); l.setAttribute('opacity', v); if (v > 0.5) n1++; });
    S.cnt1.querySelector('text').textContent = 'しきい値の候補 ' + n1 + ' 個（この特徴量だけで）';
    S.clockBar.setAttribute('width', 520 * seg(t, 3.6, 6.4));
    S.clockLab.setAttribute('opacity', seg(t, 6.2, 6.6));
    S.p1.setAttribute('opacity', seg(t, 1.4, 2.2));
    S.ticks2.forEach(function (o) { o.l.setAttribute('opacity', o.keep ? 1 : 1 - 0.85 * seg(t, 9.6, 11.0)); });
    S.cnt2.setAttribute('opacity', seg(t, 11.0, 11.6));
    S.steps2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.p2.setAttribute('opacity', seg(t, 9.0, 9.8));
    S.lb3.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.try3.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 18.8 + i * 1.4, 19.3 + i * 1.4)); });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.bars4.forEach(function (b) {
      b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.8)));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
