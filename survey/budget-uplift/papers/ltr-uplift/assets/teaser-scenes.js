// =====================================================================
// teaser-scenes.js — Devriendt et al., "Learning to Rank for Uplift Modeling" (IEEE TKDE 2022),
// unofficial explainer. Player: teaser-engine.js.
// Scenes 1-2 are schematics with explainer-chosen toy values (labelled 模式図). Scene 3 draws the exact
// weight formulas for n = 10. Scene 4 uses the numbers printed in Table 11 of arXiv v1 (separate relative AUUC).
// Colours: orange = predict-then-sort uplift models and log-discount L2R metrics; blue = PCG / LambdaMART PCG.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来のアップリフトモデルは<span class="A">一人ずつ効果を予測</span>し、その値で並べて上位に施策を打つ。', en: '' },
    { ja: '処置群の反応者が上位に、対照群の反応者が下位に来るほど、アップリフト曲線の面積は大きくなる。', en: '' },
    { ja: 'この面積は順位 i の関連度に n−i+1 をかけて足した <span class="B">PCG</span> と一致するので、LambdaMART で直接最適化できる。', en: '' },
    { ja: '既存の 4 手法と比べると、Hillstrom と Criteo では <span class="B">PCG</span> の AUUC が最も高く、Information では下回った。', en: '' },
    { ja: '順位学習は既存のアップリフト手法に代わる選択肢になりうる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: predict a score per customer, sort, target the top =====
    var g1 = S.g[0];
    var scores = [0.9, 3.1, 1.6, 4.4, 0.4, 2.5, 3.8, 1.2];
    var order = scores.map(function (v, i) { return i; }).sort(function (a, b) { return scores[b] - scores[a]; });
    var rank = []; order.forEach(function (idx, r) { rank[idx] = r; });
    t2(g1, 90, 52, '顧客ごとの予測アップリフト', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows1 = scores.map(function (v, i) {
      var g = el('g', {}, g1);
      el('circle', { cx: 104, cy: 12, r: 10, fill: C.gray }, g);
      var bar = el('rect', { x: 130, y: 0, width: v * 95, height: 24, rx: 4, fill: C.gray }, g);
      el('text', { x: 140 + v * 95, y: 18, 'font-size': 15, fill: C.muted }, g).textContent = v.toFixed(1);
      return { g: g, bar: bar, from: 76 + i * 46, to: 76 + rank[i] * 46, top: rank[i] < 3 };
    });
    S.cut1 = el('line', { x1: 80, x2: 620, y1: 76 + 3 * 46 - 11, y2: 76 + 3 * 46 - 11, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 618, 76 + 3 * 46 + 12, '上位 3 人に施策を打つ', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    S.step1 = [
      t2(p1, PX, 130, '① 一人ずつ効果を予測', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 }),
      t2(p1, PX, 170, '② 予測値で並べる', '', { 'font-size': 17, fill: C.ink }),
      t2(p1, PX, 210, '③ 上位に施策を打つ', '', { 'font-size': 17, fill: C.ink })
    ];
    t2(p1, PX, 280, '学習で最適化するのは', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 304, '予測の当てはまりで、', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 328, '並び順は直接見ていない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（予測値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: four kinds of customers, ranked list, cumulative V(k) =====
    var g2 = S.g[1];
    var kinds = { TR: ['処置・反応', '+1/|' + 'T|', C.ink], TNR: ['処置・非反応', '0', C.muted], CR: ['対照・反応', '−1/|' + 'C|', C.ink], CNR: ['対照・非反応', '0', C.muted] };
    S.cards2 = ['TR', 'TNR', 'CR', 'CNR'].map(function (k, i) {
      var g = el('g', {}, g2), x = 70 + i * 152;
      el('rect', { x: x, y: 48, width: 140, height: 92, rx: 10, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      el('text', { x: x + 14, y: 76, 'font-size': 17, 'font-weight': 650, fill: C.ink }, g).textContent = k;
      t2(g, x + 14, 100, kinds[k][0], '', { 'font-size': 15, fill: C.muted });
      txt(g, x + 14, 128, kinds[k][1].replace('|T|', '|' + m('T') + '|').replace('|C|', '|' + m('C') + '|'), { 'font-size': 17, 'font-weight': 600, fill: kinds[k][2] });
      return g;
    });
    var seq = ['TR', 'CNR', 'TR', 'TR', 'CNR', 'TNR', 'CR', 'CNR', 'TNR', 'CNR', 'CR', 'TNR'];
    var QX = 90, QW = 44, BASE = 440, UNIT = 34;
    el('line', { x1: QX - 10, x2: QX + 12 * QW, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, QX - 10, 200, '↑ ' + m('V') + '(' + m('k') + ')（単位 1/6）', '', { 'font-size': 15, fill: C.ink });
    var v = 0, pts = [[QX, BASE]];
    S.seq2 = seq.map(function (k, i) {
      v += k === 'TR' ? 1 : (k === 'CR' ? -1 : 0);
      var x = QX + i * QW + QW / 2;
      pts.push([QX + (i + 1) * QW, BASE - v * UNIT]);
      var t = el('text', { x: x, y: BASE + 26, 'font-size': 14, fill: (k === 'TR' || k === 'CR') ? C.ink : C.muted, 'text-anchor': 'middle', 'font-weight': (k === 'TR' || k === 'CR') ? 650 : 400 }, g2);
      t.textContent = k;
      return t;
    });
    S.pts2 = pts;
    S.area2 = el('polygon', { points: '', fill: C.bsoft }, g2);
    S.line2 = el('polyline', { points: '', fill: 'none', stroke: C.ink, 'stroke-width': 3 }, g2);
    t2(g2, QX - 10, BASE + 52, '順位 →（上位から 12 人）', '', { 'font-size': 15, fill: C.muted });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 230, '割合で数える曲線', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    txt(p2, PX, 264, m('V') + '(' + m('k') + ') = ' + m('R') + '<tspan font-size="11" dy="-7">T</tspan><tspan dy="7">/|</tspan>' + m('T') + '| − ' + m('R') + '<tspan font-size="11" dy="-7">C</tspan><tspan dy="7">/|</tspan>' + m('C') + '|', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 314, '非反応者は値を動かさない。', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 340, '上位の並びほど', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 364, 'AUUC への影響が大きい。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（12 人の架空の順位、|T| = |C| = 6）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: DCG discount vs PCG promotion, n = 10 =====
    var g3 = S.g[2];
    var BX = 90, BW = 52, BY = 440, BH = 300;
    el('line', { x1: BX - 10, x2: BX + 10 * BW, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, BX - 10, 108, '順位ごとの重み（順位 1 を 1 にそろえた）', '', { 'font-size': 16, fill: C.ink });
    S.bars3 = [];
    for (var i = 1; i <= 10; i++) {
      var d = 1 / Math.log2(i + 1), p = (10 - i + 1) / 10, x = BX + (i - 1) * BW;
      var ra = el('rect', { x: x + 4, y: BY, width: 20, height: 0, fill: C.a }, g3);
      var rb = el('rect', { x: x + 26, y: BY, width: 20, height: 0, fill: C.b }, g3);
      el('text', { x: x + 25, y: BY + 24, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g3).textContent = i;
      S.bars3.push({ a: ra, b: rb, ha: d * BH, hb: p * BH, i: i });
    }
    t2(g3, BX + 5 * BW, BY + 52, '順位 ' + m('i') + '（' + m('n') + ' = 10）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 130, 'AUUC =', { 'font-size': 22, 'font-weight': 650, fill: C.ink });
    txt(p3, PX, 166, 'Σ ' + m('g') + '(' + m('i') + ')·(' + m('n') + '−' + m('i') + '+1)', { 'font-size': 22, 'font-weight': 650, fill: C.b });
    el('rect', { x: PX, y: 210, width: 16, height: 16, fill: C.a }, p3);
    t2(p3, PX + 24, 224, 'DCG：1/log₂(' + m('i') + '+1)', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX + 24, 248, 'で割り引く', '', { 'font-size': 15, fill: C.muted });
    el('rect', { x: PX, y: 272, width: 16, height: 16, fill: C.b }, p3);
    t2(p3, PX + 24, 286, 'PCG：' + m('n') + '−' + m('i') + '+1', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX + 24, 310, 'をかけて押し上げる', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 360, 'LambdaMART の目的に', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 386, 'そのまま組み込める。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '重みは式どおり（' + m('n') + ' = 10 は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 11 (arXiv v1), separate relative AUUC =====
    var g4 = S.g[3];
    var rows = [
      ['LambdaMART PCG', [0.01829, 0.03055, 0.01601], ['0.01829', '0.03055', '0.01601']],
      ['ダミー処置法', [0.02392, 0.02935, 0.01165], ['0.02392', '0.02935', '0.01165']],
      ['2 モデル法', [0.02610, 0.02820, 0.01213], ['0.02610', '0.02820', '0.01213']],
      ['ラベル反転法', [0.02052, 0.02858, 0.01479], ['0.02052', '0.02858', '0.01479']],
      ['アップリフト RF', [0.0221, 0.02744, 0.01287], ['0.0221', '0.02744', '0.01287']]
    ];
    var COLS = [226, 376, 526], MAXV = [0.0262, 0.031, 0.0162], CW = 80, RY = 120, RDY = 64;
    ['Information', 'Hillstrom', 'Criteo'].forEach(function (d, j) {
      el('text', { x: COLS[j], y: 80, 'font-size': 16, 'font-weight': 600, fill: C.ink }, g4).textContent = d;
      el('line', { x1: COLS[j], x2: COLS[j], y1: 94, y2: RY + RDY * 4 + 26, stroke: C.muted }, g4);
    });
    t2(g4, 70, 44, '群ごと・割合の AUUC', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows4 = rows.map(function (rw, i) {
      var y = RY + RDY * i, o = { bars: [], labs: [] };
      t2(g4, 212, y + 5, rw[0], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': i === 0 ? 650 : 400 });
      rw[1].forEach(function (v, j) {
        var w = v / MAXV[j] * CW;
        o.bars.push({ r: el('rect', { x: COLS[j], y: y - 11, width: 0, height: 22, rx: 2, fill: i === 0 ? C.b : C.a }, g4), w: w });
        var lab = el('text', { x: COLS[j] + w + 5, y: y + 5, 'font-size': 14, fill: C.ink }, g4);
        lab.textContent = rw[2][j];
        o.labs.push(lab);
      });
      o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, 'Hillstrom・Criteo', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 158, 'PCG が最も高い', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 214, 'Information', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 242, '2 モデル法とダミー処置法が', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 266, 'PCG を有意に上回る', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 320, '列ごとに横軸の縮尺が違う', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 11（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'IEEE TRANSACTIONS ON KNOWLEDGE AND DATA ENGINEERING · 2022';
    el('text', { x: 480, y: 228, 'font-size': 40, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning to Rank for Uplift Modeling';
    t2(g5, 480, 276, 'アップリフトモデリングのための順位学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Floris Devriendt · Jente Van Belle · Tias Guns · Wouter Verbeke';
    el('text', { x: 480, y: 396, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1109/TKDE.2020.3048510 · arxiv.org/abs/2002.05897';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars turn orange (predict), rows move to sorted order, cut line, top 3 stay orange
    var s1 = seg(t, 1.2, 2.4), s2 = seg(t, 3, 4.6), s3 = seg(t, 5, 5.6);
    S.rows1.forEach(function (o) {
      o.g.setAttribute('transform', 'translate(0,' + lerp(o.from, o.to, s2) + ')');
      o.bar.setAttribute('fill', H.mix(C.gray, C.a, s1 * (o.top ? 1 : 1 - s3)));
    });
    S.cut1.setAttribute('opacity', s3); S.cutLab1.setAttribute('opacity', s3);
    S.p1.setAttribute('opacity', seg(t, 1, 1.6));
    S.step1[1].setAttribute('opacity', 0.25 + 0.75 * seg(t, 3, 3.5));
    S.step1[2].setAttribute('opacity', 0.25 + 0.75 * seg(t, 5, 5.5));
    // scene 2: cards appear, then the curve is drawn left to right
    S.cards2.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 8.6 + i * 0.35, 9.1 + i * 0.35)); });
    var u = seg(t, 10.6, 14.2) * 12, n = Math.floor(u), f = u - n, P = S.pts2, line = [];
    for (var i = 0; i <= Math.min(n, 12); i++) line.push(P[i]);
    if (n < 12) line.push([lerp(P[n][0], P[n + 1][0], f), lerp(P[n][1], P[n + 1][1], f)]);
    var ls = line.map(function (q) { return q[0] + ',' + q[1]; }).join(' ');
    S.line2.setAttribute('points', ls);
    S.area2.setAttribute('points', ls + ' ' + line[line.length - 1][0] + ',440 ' + P[0][0] + ',440');
    S.seq2.forEach(function (tx, i) { tx.setAttribute('opacity', seg(t, 10.2 + i * 0.3, 10.6 + i * 0.3)); });
    S.p2.setAttribute('opacity', seg(t, 12, 12.8));
    // scene 3: orange bars, then blue bars grow
    S.bars3.forEach(function (o) {
      var ka = seg(t, 17 + o.i * 0.12, 17.6 + o.i * 0.12), kb = seg(t, 19 + o.i * 0.15, 19.6 + o.i * 0.15);
      o.a.setAttribute('height', o.ha * ka); o.a.setAttribute('y', 440 - o.ha * ka);
      o.b.setAttribute('height', o.hb * kb); o.b.setAttribute('y', 440 - o.hb * kb);
    });
    S.p3.setAttribute('opacity', seg(t, 17.5, 18.3));
    // scene 4: rows grow in order, then the summary
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bars.forEach(function (b) { b.r.setAttribute('width', b.w * s); });
      o.labs.forEach(function (l) { l.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1)); });
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
