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
// teaser-scenes.js — van der Linden, Vos, de Weerdt, Verwer & Demirović, Optimal or Greedy Decision Trees?
// Revisiting their Objectives, Tuning, and Performance (TMLR 2026). Unofficial explainer.
// Scenes 1-3 are schematics (labelled 模式図); scene 3 shows only the ordering of objective groups stated in
// the text (concave better for CART, worse for ODT). Scene 4 uses the differences stated in the text of
// Open Question 3 (1.3, 1.6, 1.7 points) and the "five times larger trees" statement.
// Colours: orange = greedy CART / concave proxies; blue = ODT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '最適な決定木（ODT）は <span class="A">CART</span> より正確か。先行研究には「1〜2% 高い」と「むしろ悪い」の両方の報告があった。', en: '' },
    { ja: '論文によれば、食い違いの主な原因は CART を同じ深さに制限したかどうかと、両者を正しく調整したかどうかである。', en: '' },
    { ja: '貪欲法には Gini 不純度のような凹な目的関数が要るが、<span class="B">ODT</span> では正解率を直接最適化するほうが良かった。', en: '' },
    { ja: '109 個のデータで同じ深さに制限すると、ODT のテスト精度は CART より平均 1.3〜1.7 ポイント高かった。', en: '' },
    { ja: '深さを制限しない CART は精度で追いつくが木は 5 倍大きく、ODT の利点は小さくて正確な木にある。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function card(g, x, y, w, h, title, lines, col) {
    el('rect', { x: x, y: y, width: w, height: h, rx: 12, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
    T(g, x + 18, y + 32, title, { 'font-size': 16, 'font-weight': 650, fill: col });
    lines.forEach(function (l, i) { T(g, x + 18, y + 64 + i * 26, l, { 'font-size': 15, fill: C.ink }); });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: conflicting claims =====
    var g1 = S.g[0];
    S.c1a = el('g', {}, g1); S.c1b = el('g', {}, g1);
    card(S.c1a, 70, 110, 520, 120, 'Bertsimas と Dunn（2017）など', ['ODT は CART よりテスト精度が', '平均 1〜2% 高い'], C.b);
    card(S.c1b, 70, 270, 520, 120, 'Zharmagambetov ら（2021）、Sullivan ら（2024）', ['ODT のほうが CART より悪い。', '「最適」と呼べるのか'], C.a);
    S.vs1 = T(g1, 330, 255, '？', { 'font-size': 26, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 140, '5 つの未解決の問い', C.ink, [['1 目的関数', 15], ['2 調整の方法', 15], ['3 テスト精度', 15], ['4 データの量', 15], ['5 過学習', 15]]);
    TZ.note(g1, '模式図');

    // ===== scene 2: the cause = depth limit + tuning =====
    var g2 = S.g[1];
    S.r2a = el('g', {}, g2); S.r2b = el('g', {}, g2);
    card(S.r2a, 70, 100, 520, 130, '同じ深さで比べた研究', ['ODT（深さ 4）と CART（深さ 4）', '→ ODT のほうが正確'], C.b);
    card(S.r2b, 70, 260, 520, 130, '深さをそろえずに比べた研究', ['ODT（浅い、または未調整）と', 'CART（深さ 30 まで）→ CART のほうが正確'], C.a);
    S.n2 = T(g2, 70, 430, '多くの研究で、どちらかの方法が正しく調整されていなかった', { 'font-size': 15, fill: C.muted });
    S.p2 = TZ.panel(g2, PX, 140, '比べ方の勧め', C.ink, [['大きさの制限ありとなしの', 15], ['両方で比べる', 15], null, ['大小のデータと、深さ 2', 15], ['より大きな木で比べる', 15], null, ['両方を正しく調整する', 15]]);
    TZ.note(g2, '模式図（論文第 3 節の整理による）');

    // ===== scene 3: objectives flip =====
    var g3 = S.g[2];
    var cols = [[200, 'CART（貪欲法）', C.a], [470, 'ODT', C.b]];
    S.col3 = cols.map(function (c, k) {
      var g = el('g', {}, g3);
      T(g, c[0], 100, c[1], { 'font-size': 17, 'font-weight': 650, fill: c[2], 'text-anchor': 'middle' });
      var top = k === 0 ? ['Gini 不純度', 'エントロピー'] : ['正解率', '最小誤差'];
      var bot = k === 0 ? ['正解率', '最小誤差'] : ['Gini 不純度', 'エントロピー'];
      T(g, c[0], 140, '良い ↑', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      top.forEach(function (s, i) {
        el('rect', { x: c[0] - 90, y: 160 + i * 52, width: 180, height: 40, rx: 8, fill: k === 0 ? '#FCEBDF' : C.bsoft, stroke: k === 0 ? C.a : C.b, 'stroke-width': 2 }, g);
        T(g, c[0], 186 + i * 52, s, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      });
      bot.forEach(function (s, i) {
        el('rect', { x: c[0] - 90, y: 290 + i * 52, width: 180, height: 40, rx: 8, fill: '#fff', stroke: C.gray, 'stroke-width': 2 }, g);
        T(g, c[0], 316 + i * 52, s, { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      });
      return g;
    });
    S.n3 = T(g3, 335, 430, '凹な目的関数（Gini、エントロピー）の順位が、CART と ODT で逆になる', { 'font-size': 15, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 130, '問い 1 の答え', C.b, [['ODT では、テストで測る', 15], ['正解率をそのまま', 15], ['訓練で最適化する', 15], null, ['凹性は貪欲法の制約で、', 15, C.muted], ['本来必要な性質ではない', 15, C.muted]]);
    TZ.note(g3, '模式図（順位の向きだけを示す。深さ 4、109 個のデータ）');

    // ===== scene 4: accuracy gap at the same depth =====
    var g4 = S.g[3];
    T(g4, 70, 70, '同じ深さでの平均テスト精度の差（ODT − CART、ポイント）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var rows = [{ label: '深さ 3', b: 1.3, lb: '+1.3' }, { label: '深さ 4', b: 1.6, lb: '+1.6' }, { label: '深さ 5', b: 1.7, lb: '+1.7' }];
    S.bars4 = TZ.pairs(g4, { x0: 160, x1: 600, v0: 0, v1: 2, y0: 110, rowH: 80, rows: rows, t0: 24.6, dt: 0.7, ticks: [0, 0.5, 1, 1.5, 2] });
    S.n4 = T(g4, 70, 400, 'どの深さでも差は統計的に有意（Nemenyi 検定、α = 0.05）', { 'font-size': 15, fill: C.muted });
    S.p4 = TZ.panel(g4, PX, 120, '深さを制限しない CART', C.a, [['平均テスト精度は最も高い', 15], ['が、深さ 5 の ODT を', 15], ['わずかに上回るだけ', 15], null, ['そのために 5 倍大きな', 15, C.muted], ['木を使った', 15, C.muted]]);
    TZ.note(g4, '論文の本文（問い 3）の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['同じ深さで CART と比べて', 'テスト精度 +1.3〜1.7 ポイント'], ['深さを制限しない CART', '同程度の精度に 5 倍の木']],
      venue: 'TMLR 2026', title: ['Optimal or Greedy Decision Trees?', 'Revisiting their Objectives, Tuning, and Performance'], tsize: 27,
      sub: '最適な決定木か、貪欲な決定木か', authors: ['Jacobus G. M. van der Linden, Daniël Vos, Mathijs M. de Weerdt,', 'Sicco Verwer, Emir Demirović'], url: 'openreview.net/forum?id=DvDOAtskXl'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.c1a.setAttribute('opacity', seg(t, 1.0, 1.6));
    S.c1b.setAttribute('opacity', seg(t, 2.4, 3.0));
    S.vs1.setAttribute('opacity', seg(t, 3.4, 3.9));
    S.p1.setAttribute('opacity', seg(t, 4.2, 5.0));
    S.r2a.setAttribute('opacity', seg(t, 8.8, 9.4));
    S.r2b.setAttribute('opacity', seg(t, 10.0, 10.6));
    S.n2.setAttribute('opacity', seg(t, 11.4, 12.0));
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    S.col3[0].setAttribute('opacity', seg(t, 16.8, 17.4));
    S.col3[1].setAttribute('opacity', seg(t, 18.4, 19.0));
    S.n3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.p3.setAttribute('opacity', seg(t, 18.8, 19.6));
    TZ.renderBars(S.bars4, t);
    S.n4.setAttribute('opacity', seg(t, 27.2, 27.8));
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
