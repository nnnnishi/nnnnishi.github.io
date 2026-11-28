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
// teaser-scenes.js — Feldman, Liu, Topaloglu, Ziya, Appointment Scheduling Under Patient Preference and
// No-Show Behavior (Operations Research 2014). Unofficial explainer.
// Scene 1 and 3 are schematics (labelled 模式図). Scene 2 draws the retention probability 1 - 0.04j used in the
// paper's experiments. Scene 4 uses the average gaps in Tables 2-3 (preprint dated 9 April 2014).
// Colours: orange = benchmark policies; blue = the dynamic policy.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '診療所は予約の選択肢に出す日を決め、患者はその中から多項ロジットで選ぶか、どれも選ばずに去る。', en: '' },
    { ja: '遠い日に入った予約ほど、キャンセルや無断キャンセルで消えやすい。', en: '' },
    { ja: '見せる日の組は 2^|T| 通りあるが、日ごとの予約確率 x_j と u の |T|+1 個の変数に直せる。', en: '' },
    { ja: '<span class="B">予約表を見る動的な方策</span>と<span class="A">単純な方策</span>との利益の差は、最大で約 34% になった。', en: '' },
    { ja: '「どの日を見せるか」で予約表を導く、選択つき予約受付の基本形。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 660;

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: offered days and MNL choice =====
    var g1 = S.g[0];
    var vs = [4, 3, 2, 1.5, 1, 0.8];
    var offer = [true, true, true, false, true, false];
    T(g1, 80, 100, '今日から先の日（灰色は見せない日）', { 'font-size': 15, fill: C.muted });
    S.days1 = vs.map(function (v, j) {
      var x = 80 + j * 82, g = el('g', {}, g1);
      el('rect', { x: x, y: 120, width: 70, height: 56, rx: 8, fill: offer[j] ? '#fff' : C.panel, stroke: offer[j] ? C.ink : C.hair, 'stroke-width': 1.6 }, g);
      T(g, x + 35, 154, j === 0 ? '今日' : j + '日後', { 'font-size': 15, fill: offer[j] ? C.ink : C.muted, 'text-anchor': 'middle' });
      return g;
    });
    var tot = 1; vs.forEach(function (v, j) { if (offer[j]) tot += v; });
    S.pr1 = [];
    vs.forEach(function (v, j) {
      if (!offer[j]) return;
      var x = 80 + j * 82, h = 160 * v / tot;
      var r = el('rect', { x: x + 15, y: 380 - h, width: 40, height: h, fill: C.b }, g1);
      S.pr1.push({ r: r, h: h, t0: 2.0 + j * 0.3 });
    });
    var hn = 160 / tot;
    var rn = el('rect', { x: 80 + 6 * 82 + 15, y: 380 - hn, width: 40, height: hn, fill: C.gray }, g1);
    S.pr1.push({ r: rn, h: hn, t0: 4.0 });
    T(g1, 80 + 6 * 82 + 35, 404, '去る', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    el('line', { x1: 74, x2: 640, y1: 380, y2: 380, stroke: C.ink, 'stroke-width': 1.2 }, g1);
    T(g1, 80, 430, '選ぶ確率 = v_j ÷ (1 + 見せた日の v の合計)', { 'font-size': 15, fill: C.ink });
    S.p1 = TZ.panel(g1, 690, 140, '多項ロジット', C.ink, [['日 j の重み v_j', 16], ['選ばない重み 1', 16], null, ['見せる日を増やすと', 15, C.muted], ['去る患者は減る', 15, C.muted]]);
    TZ.note(g1, '模式図（重みは解説者が置いた例）');

    // ===== scene 2: retention decreases with delay (paper's experimental setting) =====
    var g2 = S.g[1];
    T(g2, 70, 90, '予約が残る確率 1 − 0.04j（論文の実験の設定）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.bars2 = [];
    for (var j = 0; j <= 15; j++) {
      var r = 1 - 0.04 * j, h = 280 * r;
      var rect = el('rect', { x: 90 + j * 32, y: 400 - h, width: 24, height: h, fill: H.mix(C.b, C.a, j / 15) }, g2);
      if (j % 5 === 0) T(g2, 102 + j * 32, 424, j + '日', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      S.bars2.push({ r: rect, h: h, t0: 8.8 + j * 0.12 });
    }
    el('line', { x1: 84, x2: 610, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.2 }, g2);
    S.lb2 = T(g2, 570, 210, '0.40', { 'font-size': 15, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    S.p2 = TZ.panel(g2, PX, 140, '待ち日数と欠席', C.a, [['遠い日の予約ほど', 16], ['キャンセルや', 16], ['無断キャンセルになる', 16], null, ['容量 C を超えた分は', 15, C.muted], ['残業費用 θ', 15, C.muted]]);
    TZ.note(g2, '15 日後で 1 − 0.04 × 15 = 0.40（解説者の計算）');

    // ===== scene 3: reformulation =====
    var g3 = S.g[2];
    T(g3, 80, 110, '見せる日の組 S を確率 h(S) で選ぶ', { 'font-size': 18, fill: C.a, 'font-weight': 600 });
    S.big3 = T(g3, 80, 170, '変数 2^|T| 個', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    S.arr3 = T(g3, 80, 230, '↓ 命題 1', { 'font-size': 18, fill: C.muted });
    S.small3 = T(g3, 80, 290, '変数 |T| + 1 個（x_j と u）', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    S.con3 = T(g3, 80, 340, '選好の重みは x_j / v_j ≤ u という一次の制約にだけ入る', { 'font-size': 16, fill: C.ink });
    S.dyn3 = T(g3, 80, 400, '動的な方策：静的な方策から 1 回だけ方策改善', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    S.p3 = TZ.panel(g3, PX, 140, '静的 → 動的', C.b, [['x_j：日 j に予約が', 15], ['入る確率', 15], ['u：どこにも入らない', 15], ['確率', 15], null, ['毎日その日の予約表で', 15, C.muted], ['計算し直す', 15, C.muted]]);
    TZ.note(g3, '模式図');

    // ===== scene 4: average gaps (Tables 2-3) =====
    var g4 = S.g[3];
    T(g4, 70, 64, '動的な方策の利益が各方策より何 % 高いか（平均、論文 Table 2・3）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var X0 = 250, X1 = 610, VM = 36;
    function sx(v) { return X0 + v / VM * (X1 - X0); }
    [0, 10, 20, 30].forEach(function (v) {
      el('line', { x1: sx(v), x2: sx(v), y1: 92, y2: 450, stroke: C.hair }, g4);
      T(g4, sx(v), 472, v + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    var D = [['曖昧な症状 v^A', [1.87, 3.44, 7.13]], ['急ぐ症状 v^U', [1.02, 1.09, 14.91]], ['同じ重み v^I', [0.87, 12.99, 33.84]], ['下がる重み v^D', [1.73, 13.33, 2.67]]];
    var NM = ['SP', 'CO', 'AN'];
    S.bars4 = [];
    D.forEach(function (d, i) {
      var y0 = 100 + i * 88;
      T(g4, X0 - 12, y0 + 40, d[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      d[1].forEach(function (v, k) {
        var y = y0 + k * 25;
        var rect = el('rect', { x: X0, y: y + 4, width: 0, height: 20, fill: C.a, 'fill-opacity': [0.45, 0.7, 1][k] }, g4);
        var lab = el('text', { x: sx(v) + 6, y: y + 19, 'font-size': 14, fill: C.a }, g4);
        lab.textContent = NM[k] + ' ' + v.toFixed(2);
        S.bars4.push({ rect: rect, lab: lab, w: sx(v) - X0, t0: 24.6 + i * 0.7 + k * 0.2 });
      });
    });
    el('line', { x1: X0, x2: X0, y1: 92, y2: 450, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.p4 = TZ.panel(g4, 700, 140, '比べた方策', C.a, [['SP：静的なモデル', 15], ['CO：当日のみ受ける', 15], ['AN：全部か無か', 15], null, ['差は容量が少ない', 15, C.muted], ['ときに大きい', 15, C.muted]]);
    TZ.note(g4, '論文 Table 2・3 の平均の行から作図（プレプリント版）');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['全部か無か（AN）との差の平均', '最大 33.84%'], ['静的なモデルとの差', '約 6% 以下']],
      venue: 'OPERATIONS RESEARCH 2014', title: ['Appointment Scheduling Under', 'Patient Preference and No-Show Behavior'], tsize: 30,
      sub: '患者の選好と無断キャンセルのもとでの予約スケジューリング', authors: ['Jacob Feldman, Nan Liu, Huseyin Topaloglu, Serhan Ziya'], url: 'doi.org/10.1287/opre.2014.1286'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.days1.forEach(function (g, j) { g.setAttribute('opacity', seg(t, 0.6 + j * 0.15, 1.0 + j * 0.15)); });
    S.pr1.forEach(function (b) { var v = seg(t, b.t0, b.t0 + 0.6); b.r.setAttribute('height', b.h * v); b.r.setAttribute('y', 380 - b.h * v); });
    S.p1.setAttribute('opacity', seg(t, 5.0, 5.8));
    S.bars2.forEach(function (b) { var v = seg(t, b.t0, b.t0 + 0.5); b.r.setAttribute('height', b.h * v); b.r.setAttribute('y', 400 - b.h * v); });
    S.lb2.setAttribute('opacity', seg(t, 11.2, 11.8));
    S.p2.setAttribute('opacity', seg(t, 12.0, 12.8));
    S.big3.setAttribute('opacity', seg(t, 16.6, 17.2));
    S.arr3.setAttribute('opacity', seg(t, 17.8, 18.4));
    S.small3.setAttribute('opacity', seg(t, 18.4, 19.0));
    S.con3.setAttribute('opacity', seg(t, 19.4, 20.0));
    S.dyn3.setAttribute('opacity', seg(t, 20.8, 21.4));
    S.p3.setAttribute('opacity', seg(t, 18.4, 19.2));
    S.bars4.forEach(function (b) { b.rect.setAttribute('width', b.w * H.ease(seg(t, b.t0, b.t0 + 0.6))); b.lab.setAttribute('opacity', seg(t, b.t0 + 0.4, b.t0 + 0.8)); });
    S.p4.setAttribute('opacity', seg(t, 28.0, 28.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
