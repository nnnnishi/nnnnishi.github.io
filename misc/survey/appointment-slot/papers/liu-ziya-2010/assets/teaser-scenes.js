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
// teaser-scenes.js — Liu, Ziya, Kulkarni, Dynamic Scheduling of Outpatient Appointments Under Patient
// No-Shows and Cancellations (MSOM 2010). Unofficial explainer.
// Scene 1 uses the no-show + cancellation rates by delay reported in the paper (UNC data / model).
// Scenes 2-3 are schematics with explainer-chosen numbers (labelled 模式図). Scene 4 uses Table 1.
// Colours: orange = open access / threshold policy, the problem; blue = the improved (index) policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '予約が先になるほど、患者は<span class="A">キャンセルしたり来なかったり</span>しやすくなる。', en: '' },
    { ja: '今日に詰めると容量を超えて残業になり、先に回すと来ない患者が増える。', en: '' },
    { ja: '<span class="B">提案法</span>は日ごとに「1 人増やしたときの期待利得」を計算し、最大の日に入れる。', en: '' },
    { ja: '容量が需要より小さいほど差が開き、オープンアクセスより純利得が最大 27% 増えた。', en: '' },
    { ja: '無断キャンセルを待ち日数の関数として、予約を入れる日の選択に組み込んだ研究。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 640;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: no-show + cancellation probability by delay (paper's estimates) =====
    var g1 = S.g[0];
    T(g1, 70, 70, '待ち日数ごとのキャンセル＋無断キャンセルの確率', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var d1 = [['0 日', 18.0], ['1 日', 18.5], ['7 日', 21.4], ['13 日', 24.2]];
    var BASE = 440, SC = 12;
    el('line', { x1: 90, x2: 560, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.b1 = d1.map(function (d, i) {
      var x = 120 + i * 110, h = d[1] * SC;
      var r = el('rect', { x: x, y: BASE, width: 70, height: 0, fill: C.a, 'fill-opacity': 0.45 + i * 0.18 }, g1);
      var lb = el('text', { x: x + 35, y: BASE - h - 10, 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' }, g1);
      lb.textContent = '約 ' + d[1] + '%';
      T(g1, x + 35, BASE + 26, d[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lb: lb, h: h, t0: 1.0 + i * 0.7 };
    });
    T(g1, 325, BASE + 56, '予約から受診までの日数', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.p1 = TZ.panel(g1, PX, 150, '待つほど来ない', C.a, [['UNC の家庭医療の外来の', 16], ['記録から最尤法で推定', 16], null, ['先の日に入れた予約ほど', 15, C.muted], ['枠が空いてしまう', 15, C.muted]]);
    TZ.note(g1, '論文本文に記された推定値から作図');

    // ===== scene 2: today vs later dilemma =====
    var g2 = S.g[1];
    T(g2, 70, 70, '日ごとの予約数と通常容量 M', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var days = ['今日', '1 日後', '2 日後', '3 日後', '4 日後'];
    var loads = [9, 4, 3, 2, 2];
    var B2 = 420, U = 28, M = 6;
    S.cols2 = [];
    days.forEach(function (d, i) {
      var x = 100 + i * 96;
      T(g2, x + 30, B2 + 26, d, { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      for (var k = 0; k < loads[i]; k++) {
        var over = k >= M;
        var r = el('rect', { x: x, y: B2 - (k + 1) * U + 2, width: 60, height: U - 4, rx: 4, fill: over ? C.a : C.gray }, g2);
        S.cols2.push({ r: r, t0: 8.6 + i * 0.25 + k * 0.12 });
      }
    });
    el('line', { x1: 90, x2: 580, y1: B2 - M * U, y2: B2 - M * U, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g2);
    T(g2, 584, B2 - M * U + 5, 'M', { 'font-size': 16, fill: C.ink, 'font-style': 'italic' });
    S.lb2 = T(g2, 100, 120, '容量を超えた分は残業費 h₂', { 'font-size': 15, fill: C.a, 'font-weight': 600 });
    S.p2 = TZ.panel(g2, PX, 150, '板挟み', C.a, [['今日に詰める：残業が増える', 15], ['先に回す：来ない患者が増える', 15], null, ['状態の数が膨大で', 15, C.muted], ['最適方策は直接解けない', 15, C.muted]]);
    TZ.note(g2, '模式図（人数は解説者が置いた例）');

    // ===== scene 3: index rule =====
    var g3 = S.g[2];
    T(g3, 70, 70, '各日の指標 I_j ＝ 1 人増やしたときの期待利得', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var idx = [0.10, 0.42, 0.37, 0.30, 0.24];
    var B3 = 420;
    el('line', { x1: 90, x2: 580, y1: B3, y2: B3, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.b3 = idx.map(function (v, i) {
      var x = 100 + i * 96, h = v * 600, best = i === 1;
      var r = el('rect', { x: x, y: B3, width: 60, height: 0, fill: best ? C.b : C.gray }, g3);
      T(g3, x + 30, B3 + 26, days[i], { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, h: h, t0: 16.6 + i * 0.3 };
    });
    S.arrow3 = el('g', {}, g3);
    T(S.arrow3, 160, B3 - 0.42 * 600 - 18, '最大 → ここに入れる', { 'font-size': 15, fill: C.b, 'font-weight': 650, 'text-anchor': 'middle' });
    S.p3 = TZ.panel(g3, PX, 150, '方策改善を 1 回', C.b, [['状態によらない静的方策', 15], ['（今日か明日に確率で入れる）', 15], ['から 1 回だけ方策改善する', 15], null, ['今日は残業の確率が高いので', 15, C.muted], ['指標が小さくなる', 15, C.muted]]);
    TZ.note(g3, '模式図（指標の値は解説者が置いた例）');

    // ===== scene 4: Table 1 (h1 = 0.5) =====
    var g4 = S.g[3];
    T(g4, 70, 64, 'オープンアクセスに対する純利得の改善率（%、h₁ = 0.5、論文 Table 1）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars4 = TZ.pairs(g4, {
      x0: 260, x1: 820, v0: 0, v1: 30, y0: 110, rowH: 80, t0: 24.6, dt: 0.6, ticks: [0, 10, 20, 30],
      rows: [
        { label: '容量 M = 55', a: 4.39, b: 12.74 },
        { label: 'M = 50', a: 12.11, b: 18.56 },
        { label: 'M = 45', a: 10.40, b: 25.01 },
        { label: 'M = 40', a: 6.79, b: 27.41 }
      ]
    });
    T(g4, 260, 470, '■ 閾値方策 TP', { 'font-size': 14, fill: C.a });
    T(g4, 420, 470, '■ 提案 Imp-OTPSP', { 'font-size': 14, fill: C.b });
    TZ.note(g4, '論文 Table 1 の数値から作図');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['純利得（OAP 比）', '最大 +27.41%'], ['最良の方策に入った設定', '12 設定中 12']],
      venue: 'MSOM 2010', title: ['Dynamic Scheduling of Outpatient Appointments', 'Under Patient No-Shows and Cancellations'], tsize: 27,
      sub: '無断キャンセルとキャンセルのもとでの外来予約の動的スケジューリング', authors: ['Nan Liu, Serhan Ziya, Vidyadhar G. Kulkarni'], url: 'doi.org/10.1287/msom.1090.0272'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.b1.forEach(function (b) {
      var k = H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.r.setAttribute('height', b.h * k); b.r.setAttribute('y', 440 - b.h * k);
      b.lb.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
    S.p1.setAttribute('opacity', seg(t, 4.2, 5.0));
    S.cols2.forEach(function (c) { c.r.setAttribute('opacity', seg(t, c.t0, c.t0 + 0.3)); });
    S.lb2.setAttribute('opacity', seg(t, 11.2, 11.8));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    S.b3.forEach(function (b) {
      var k = H.ease(seg(t, b.t0, b.t0 + 0.7));
      b.r.setAttribute('height', b.h * k); b.r.setAttribute('y', 420 - b.h * k);
    });
    S.arrow3.setAttribute('opacity', seg(t, 18.8, 19.4));
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    TZ.renderBars(S.bars4, t);
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
