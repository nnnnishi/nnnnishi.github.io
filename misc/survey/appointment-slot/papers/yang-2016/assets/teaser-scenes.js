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
// teaser-scenes.js — Yang, Strauss, Currie, Eglese, Choice-Based Demand Management and Vehicle Routing in
// E-Fulfillment (Transportation Science 2016). Unofficial explainer.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses Table 6 of the
// authors' accepted manuscript (Southampton eprints, dated 1 July 2013).
// Colours: orange = fixed charges / Hindsight; blue = Foresight pricing (the paper's best policy).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '比べる基準は注文金額で決まる<span class="A">固定の配達料金</span>で、実務に近い方法である。', en: '' },
    { ja: '枠の料金を変えると、客がどの枠を選ぶかが多項ロジットに従って変わる。', en: '' },
    { ja: '<span class="B">提案法</span>は注文をルートに入れる費用を機会費用として、枠ごとの料金を毎回決める。', en: '' },
    { ja: '過去の配送計画も使う Foresight は、4 つの車両台数のすべてで固定料金より利益が高かった。', en: '' },
    { ja: '受けた予約で将来の受付が狭まる損失を、料金に反映させる研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;
  var SL = ['8 時', '10 時', '12 時', '14 時', '16 時', '18 時'];
  var BASEU = [0.9, 0.6, 0.2, 0.1, 0.5, 0.8];   // explainer's toy slot utilities
  var BD = -0.25;                               // toy price sensitivity
  var X0 = 100, BW = 64, GAP = 18, BASE = 420, SC = 900;

  function probs(d) {
    var e = BASEU.map(function (u, i) { return Math.exp(u + BD * d[i]); });
    var s = e.reduce(function (a, b) { return a + b; }, 0) + Math.exp(1.2);   // + no-purchase
    return e.map(function (v) { return v / s; });
  }
  function bars(g, color) {
    el('line', { x1: 90, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g);
    return SL.map(function (s, i) {
      var x = X0 + i * (BW + GAP);
      var r = el('rect', { x: x, y: BASE, width: BW, height: 0, fill: color(i) }, g);
      var lb = el('text', { x: x + BW / 2, y: BASE - 8, 'font-size': 14, 'font-weight': 600, fill: color(i) === C.gray ? C.muted : color(i), 'text-anchor': 'middle' }, g);
      var pr = el('text', { x: x + BW / 2, y: BASE + 46, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g);
      T(g, x + BW / 2, BASE + 24, s, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lb: lb, pr: pr };
    });
  }
  function setBars(bs, p, d) {
    bs.forEach(function (b, i) {
      var h = p[i] * SC;
      b.r.setAttribute('y', BASE - h); b.r.setAttribute('height', h);
      b.lb.setAttribute('y', BASE - h - 8); b.lb.textContent = Math.round(p[i] * 100) + '%';
      b.pr.textContent = (d[i] > 0 ? '+' : d[i] < 0 ? '−' : '') + '£' + Math.abs(d[i]).toFixed(1);
    });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: fixed charge =====
    var g1 = S.g[0];
    T(g1, 70, 80, '注文金額で決まる固定の配達料金（VS）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.r1 = [
      [140, '注文金額 50 ポンド以上', '£3'],
      [240, '注文金額 50 ポンド未満', '£5']
    ].map(function (r, i) {
      var gg = el('g', {}, g1);
      el('rect', { x: 90, y: r[0], width: 480, height: 70, rx: 10, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, gg);
      T(gg, 115, r[0] + 43, r[1], { 'font-size': 16, fill: C.ink });
      T(gg, 540, r[0] + 45, r[2], { 'font-size': 24, 'font-weight': 650, fill: C.a, 'text-anchor': 'end' });
      return { g: gg, t0: 1.0 + i * 0.8 };
    });
    S.l1 = T(g1, 90, 380, 'どの枠も同じ料金。配送費用の差は料金に出ない', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p1 = TZ.panel(g1, PX, 150, '実務の料金', C.a, [['論文は英国の実務に', 15], ['近い方法として挙げる', 15], null, ['ほかに一律 3・4・5 ポンド', 14, C.muted], ['とも比べる', 14, C.muted]]);
    TZ.note(g1, '料金は論文の比較対象 VS の設定');

    // ===== scene 2: MNL response =====
    var g2 = S.g[1];
    T(g2, 70, 80, '枠を選ぶ確率（多項ロジット）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.b2 = bars(g2, function (i) { return i === 0 ? C.a : i === 3 ? C.b : C.gray; });
    S.p2 = TZ.panel(g2, PX, 150, '料金への反応', C.ink, [['人気の枠に追加料金、', 15], ['空いた枠に割引を付けると', 15], ['選ぶ確率が移る', 15], null, ['効用 = β₀ + β_s + β_d × 料金', 14, C.muted]]);
    TZ.note(g2, '模式図（効用と料金は解説者が置いた例）');

    // ===== scene 3: opportunity cost by insertion =====
    var g3 = S.g[2];
    T(g3, 70, 80, '枠ごとの挿入費用 C_s と料金 d_s', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var CS = [6, 5, 2, 1.5, 4, 6.5];
    S.b3 = CS.map(function (c, i) {
      var x = X0 + i * (BW + GAP), h = c * 34;
      var r = el('rect', { x: x, y: BASE - h, width: BW, height: h, fill: C.gray }, g3);
      T(g3, x + BW / 2, BASE + 24, SL[i], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      var lb = el('text', { x: x + BW / 2, y: BASE - h - 10, 'font-size': 14, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' }, g3);
      var dd = (c - 3.5).toFixed(1);
      lb.textContent = (dd > 0 ? '+£' : '−£') + Math.abs(dd).toFixed(1);
      return { r: r, lb: lb, t0: 16.8 + i * 0.25 };
    });
    el('line', { x1: 90, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.eq3 = T(g3, 90, 486, 'd*_s = C_s − r − m / β_d　（費用の高い枠ほど料金が高い）', { 'font-size': 15, fill: C.b, 'font-weight': 600 });
    S.p3 = TZ.panel(g3, PX, 150, 'Foresight', C.b, [['受けた注文の計画と、', 15], ['同じ曜日の過去 10 回の', 15], ['最終計画の挿入費用を', 15], ['重み j/J で混ぜる', 15]]);
    TZ.note(g3, '模式図（費用と料金は解説者が置いた例）');

    // ===== scene 4: Table 6 gaps vs VS =====
    var g4 = S.g[3];
    T(g4, 70, 64, '固定料金 VS に対する利益の差（%、Table 6）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var Z = 400, U = 46;               // x of zero, px per percentage point
    var rows = [['100 台', -3.5, 3.1], ['110 台', 2.1, 3.5], ['120 台', 2.5, 2.6], ['150 台', 4.4, 6.2]];
    [-4, -2, 0, 2, 4, 6].forEach(function (v) {
      el('line', { x1: Z + v * U, x2: Z + v * U, y1: 92, y2: 452, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      T(g4, Z + v * U, 476, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    S.bars4 = [];
    rows.forEach(function (r, i) {
      var y = 104 + i * 88;
      T(g4, 90, y + 36, r[0], { 'font-size': 15, fill: C.ink });
      [[r[1], C.a, 0], [r[2], C.b, 1]].forEach(function (k) {
        var yy = y + k[2] * 36;
        var rect = el('rect', { x: Z, y: yy, width: 0, height: 30, fill: k[1] }, g4);
        var lab = el('text', { x: k[0] >= 0 ? Z + k[0] * U + 6 : Z + k[0] * U - 6, y: yy + 21, 'font-size': 14, 'font-weight': 600, fill: k[1], 'text-anchor': k[0] >= 0 ? 'start' : 'end' }, g4);
        lab.textContent = (k[0] > 0 ? '+' : '−') + Math.abs(k[0]).toFixed(1);
        S.bars4.push({ rect: rect, lab: lab, v: k[0], t0: 24.6 + i * 0.6 + k[2] * 0.25 });
      });
    });
    T(g4, 110, 510, '■ Hindsight', { 'font-size': 14, fill: C.a });
    T(g4, 240, 510, '■ Foresight', { 'font-size': 14, fill: C.b });
    TZ.note(g4, '著者の原稿の Table 6 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['Foresight の利益（VS 比）', '+2.6〜6.2%'], ['料金の決め方', '挿入費用＋多項ロジット']],
      venue: 'TRANSPORTATION SCIENCE 2016', title: ['Choice-Based Demand Management and', 'Vehicle Routing in E-Fulfillment'], tsize: 30,
      sub: 'ネット通販の配達における選択にもとづく需要管理と配送計画', authors: ['Xinan Yang, Arne K. Strauss, Christine S. M. Currie, Richard Eglese'], url: 'doi.org/10.1287/trsc.2014.0549'
    });
    S.Z = Z; S.U = U;
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.r1.forEach(function (r) { r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.5)); });
    S.l1.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    // scene 2: charges sweep from flat to (+2 on 8 h, -2 on 14 h)
    var k = seg(t, 10.5, 13.0), grow = seg(t, 8.5, 9.6);
    var d = [2 * k, 0, 0, -2 * k, 0, 0];
    setBars(S.b2, probs(d).map(function (p) { return p * grow; }), d);
    S.b3.forEach(function (b) { b.r.setAttribute('opacity', seg(t, b.t0, b.t0 + 0.4)); b.lb.setAttribute('opacity', seg(t, 19.2, 19.8)); });
    S.eq3.setAttribute('opacity', seg(t, 20.0, 20.6));
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    S.bars4.forEach(function (b) {
      var w = Math.abs(b.v) * S.U * H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.rect.setAttribute('width', w);
      b.rect.setAttribute('x', b.v >= 0 ? S.Z : S.Z - w);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
