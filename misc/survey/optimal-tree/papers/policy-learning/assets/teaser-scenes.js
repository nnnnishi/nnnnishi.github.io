// =====================================================================
// teaser-scenes.js — Athey & Wager (Econometrica 2021), unofficial explainer for the optimal-tree list.
// Player: teaser-engine.js (copied unchanged from the paper-project-page skill).
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 2 (arXiv v6): fitted propensities (±0.026, filled)
// and true per-county propensities (±0.028, open).
// Colours: orange = inverse-propensity weighting (IPW); blue = doubly robust (AIPW) scores, the paper's method.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '<span class="A">逆確率重みづけ</span>は木の方策と同じ処置を受けた人だけを、その処置を受ける確率の逆数で重みづけて評価する。', en: '' },
    { ja: '傾向スコアを推定する観察データでは推定誤差が重みに入り、後悔の保証は 1/√n より遅くなる。', en: '' },
    { ja: '論文の方法は全員に<span class="B">二重頑健スコア</span> Γ を付け、Σ(2π−1)Γ が最大になる木を探す。', en: '' },
    { ja: 'GAIN のデータで、深さ 2 の木の改善量は<span class="B">二重頑健スコア</span>で 0.091、<span class="A">逆確率重みづけ</span>で 0.043 だった。', en: '' },
    { ja: '後悔は √(VC(Π)/n) の速さで減り、この速さは定数倍を除いて改善できない。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.7em" dy="0.3em">' + s + '</tspan><tspan dy="-0.3em"></tspan>'; }

  // a small depth-1 tree drawn in the right column
  function miniTree(g, x, y, col) {
    el('rect', { x: x + 50, y: y, width: 140, height: 38, rx: 8, fill: C.panel }, g);
    txt(g, x + 120, y + 25, m('x') + ' ≤ ' + m('t') + ' ?', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: x + 95, y1: y + 38, x2: x + 55, y2: y + 74, stroke: C.muted, 'stroke-width': 1.5 }, g);
    el('line', { x1: x + 145, y1: y + 38, x2: x + 185, y2: y + 74, stroke: C.muted, 'stroke-width': 1.5 }, g);
    el('rect', { x: x, y: y + 74, width: 110, height: 36, rx: 8, fill: '#fff', stroke: '#CBD2DC', 'stroke-width': 1.5 }, g);
    t2(g, x + 55, y + 98, '処置しない', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    el('rect', { x: x + 130, y: y + 74, width: 110, height: 36, rx: 8, fill: col === C.b ? C.bsoft : C.panel }, g);
    t2(g, x + 185, y + 98, '処置する', '', { 'font-size': 15, fill: col, 'text-anchor': 'middle', 'font-weight': 600 });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: IPW keeps only units with W = pi(X), weighted by 1/P(W = pi(X) | X) =====
    var g1 = S.g[0];
    var CX = 340;   // depth-1 tree: treat if x > CX
    S.reg1 = el('rect', { x: CX, y: 70, width: 260, height: 400, fill: C.panel }, g1);
    el('line', { x1: 80, x2: 600, y1: 470, y2: 470, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, 600, 498, '特徴 ' + m('x') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.cut1 = el('line', { x1: CX, x2: CX, y1: 60, y2: 470, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.lab1a = t2(g1, CX - 12, 56, '木：処置しない', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.lab1b = t2(g1, CX + 12, 56, '木：処置する', '', { 'font-size': 15, fill: C.ink });
    var r1 = rng(5), P1 = [];
    var es = [0.5, 0.3, 0.7, 0.6, 0.45, 0.35, 0.65, 0.25, 0.55, 0.8, 0.4, 0.6, 0.3, 0.7];
    for (var i = 0; i < 14; i++) {
      var x = 100 + i * 36 + r1() * 14, y = 110 + r1() * 330, e = es[i];
      var W = r1() < e ? 1 : 0, pi = x >= CX ? 1 : 0;
      var w = pi === 1 ? 1 / e : 1 / (1 - e);
      var o = { match: W === pi, R: 7 + 4 * w, W: W };
      o.c = el('circle', { cx: x, cy: y, r: 9, fill: W ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2.5 }, g1);
      P1.push(o);
    }
    S.pts1 = P1;
    var p1 = S.p1 = el('g', {}, g1);
    el('circle', { cx: PX + 9, cy: 90, r: 8, fill: C.ink }, p1);
    t2(p1, PX + 26, 96, '処置を受けた人', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 122, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, p1);
    t2(p1, PX + 26, 128, '受けなかった人', '', { 'font-size': 16, fill: C.ink });
    S.p1b = el('g', {}, g1);
    t2(S.p1b, PX, 196, '使う人：' + m('W') + ' = ' + m('π') + '(' + m('X') + ')', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(S.p1b, PX, 226, '重み：1 / ' + m('P') + '[' + m('W') + ' = ' + m('π') + '(' + m('X') + ') | ' + m('X') + ']', '', { 'font-size': 15, fill: C.ink });
    t2(S.p1b, PX, 278, '木と違う処置を受けた人は', '', { 'font-size': 15, fill: C.muted });
    t2(S.p1b, PX, 302, '評価に使わない。', '', { 'font-size': 15, fill: C.muted });
    t2(S.p1b, PX, 350, '円の大きさ＝重み', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: estimated propensities enter the weights =====
    var g2 = S.g[1];
    var ehat = [0.5, 0.6, 0.4, 0.7, 0.05, 0.55, 0.3], BW = 46, BX = 110, BASE = 450, U2 = 17;
    el('line', { x1: 90, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, 90, 60, '使われた人ごとの重み 1 / ' + m('ê') + '(' + m('x') + ')', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.bars2 = ehat.map(function (e, i) {
      var x = BX + i * 68, o = {};
      o.full = U2 / e; o.big = e < 0.1;
      o.r = el('rect', { x: x, y: BASE, width: BW, height: 0, rx: 3, fill: o.big ? C.a : C.gray }, g2);
      o.v = txt(g2, x + BW / 2, 0, (1 / e).toFixed(1), { 'font-size': 15, fill: o.big ? C.a : C.ink, 'text-anchor': 'middle', 'font-weight': o.big ? 650 : 400 });
      txt(g2, x + BW / 2, BASE + 24, m('ê') + '=' + e, { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    txt(p2, PX, 150, '1 / ' + m('ê') + '(' + m('x') + ')', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 200, m('ê') + ' は推定値。誤差がそのまま', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 226, '価値の見積もりに入る。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 280, m('e') + ' が既知：√(VC(' + m('Π') + ')/' + m('n') + ')', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 312, m('e') + ' を推定：一般に 1/√' + m('n') + ' より遅い', '', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    t2(p2, PX, 362, '（Kitagawa and Tetenov の上界）', '', { 'font-size': 14, fill: C.muted });
    t2(g2, 940, 520, '模式図（' + m('ê') + ' の値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: doubly robust scores; a depth-1 split sweeps all thresholds to maximise sum (2 pi - 1) Gamma =====
    var g3 = S.g[2];
    var AX0 = 90, AX1 = 590, Y3 = 290, U3 = 38;
    S.reg3 = el('rect', { x: AX1, y: 80, width: 0, height: 400, fill: C.bsoft }, g3);
    el('line', { x1: AX0 - 10, x2: AX1 + 10, y1: Y3, y2: Y3, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, AX1 + 10, 506, '特徴 ' + m('x') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, AX0 - 10, 70, '↑ ' + m('Γ̂') + sub('i') + '（0 より上：処置したほうがよさそう）', '', { 'font-size': 15, fill: C.ink });
    var r3 = rng(23), P3 = [];
    for (var j = 0; j < 34; j++) {
      var u = (j + 0.2 + r3() * 0.6) / 34, xx = AX0 + u * (AX1 - AX0);
      var gam = -1.6 + 3.0 * u + (r3() - 0.5) * 3.4;
      gam = Math.max(-4.6, Math.min(4.6, gam));
      var col = gam > 0 ? C.b : C.gray;
      el('line', { x1: xx, x2: xx, y1: Y3, y2: Y3 - gam * U3, stroke: col, 'stroke-width': 2 }, g3);
      el('circle', { cx: xx, cy: Y3 - gam * U3, r: 6, fill: col }, g3);
      P3.push({ x: xx, g: gam });
    }
    S.J = function (c) { var s = 0; P3.forEach(function (q) { s += (q.x >= c ? 1 : -1) * q.g; }); return s / P3.length; };
    S.cBest = AX0; var jb = -1e9;
    for (var c = AX0 - 5; c <= AX1 + 5; c += 2) { var v = S.J(c); if (v > jb) { jb = v; S.cBest = c; } }
    S.jMax = jb; S.AX0 = AX0 - 5; S.AX1 = AX1 + 5;
    S.cut3 = el('line', { x1: 0, x2: 0, y1: 80, y2: 480, stroke: C.ink, 'stroke-width': 2.5 }, g3);
    S.tlab3 = t2(g3, 0, 476, m('t'), '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 84, 'max Σ (2' + m('π') + ' − 1) ' + m('Γ̂') + sub('i'), { 'font-size': 21, 'font-weight': 650, fill: C.ink });
    miniTree(p3, PX, 108, C.b);
    t2(p3, PX, 262, 'しきい値 ' + m('t') + ' ごとの目的関数の値', '', { 'font-size': 15, fill: C.ink });
    el('rect', { x: PX, y: 274, width: 240, height: 16, rx: 4, fill: C.panel }, p3);
    S.meter = el('rect', { x: PX, y: 274, width: 0, height: 16, rx: 4, fill: C.b }, p3);
    el('line', { x1: PX + 236, x2: PX + 236, y1: 268, y2: 296, stroke: C.ink, 'stroke-width': 2 }, p3);
    t2(p3, PX, 340, '符号 → 分類のラベル', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 368, '大きさ → 分類の重み', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 414, '全員のスコアを使い、', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 438, '誰も捨てない。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点は架空の個体、深さ 1 の木）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v6) =====
    var g4 = S.g[3];
    var rows = [
      ['AIPW 深さ 2', 0.091, 0.080, C.b], ['プラグイン', 0.077, 0.063, C.muted], ['AIPW 深さ 1', 0.068, 0.050, C.b],
      ['IPW 深さ 1', 0.065, 0.048, C.a], ['IPW 深さ 2', 0.043, 0.029, C.a]
    ];
    var X0 = 220, U4 = 3000, Y0 = 118, DY = 66;   // 0.1 -> 300 px
    t2(g4, 70, 58, 'ランダムな割当てに対する改善量', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.05, 0.10].forEach(function (v) {
      el('line', { x1: X0 + v * U4, x2: X0 + v * U4, y1: Y0 - 34, y2: Y0 + DY * 4 + 30, stroke: C.hair }, g4);
      el('text', { x: X0 + v * U4, y: Y0 + DY * 4 + 54, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(2);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      t2(g4, X0 - 16, y + 6, rw[0], '', { 'font-size': 16, fill: rw[3] === C.muted ? C.ink : rw[3], 'text-anchor': 'end', 'font-weight': rw[3] === C.muted ? 400 : 600 });
      o.bar = el('rect', { x: X0, y: y - 15, width: 0, height: 22, rx: 4, fill: rw[3] }, g4);
      o.full = rw[1] * U4;
      o.se = el('line', { x1: X0 + (rw[1] - 0.026) * U4, x2: X0 + (rw[1] + 0.026) * U4, y1: y - 4, y2: y - 4, stroke: C.ink, 'stroke-width': 1.5 }, g4);
      o.tr = el('circle', { cx: X0 + rw[2] * U4, cy: y + 16, r: 6, fill: '#fff', stroke: rw[3], 'stroke-width': 2.5 }, g4);
      o.v = el('text', { x: X0 + (rw[1] + 0.026) * U4 + 10, y: y + 2, 'font-size': 16, 'font-weight': 600, fill: rw[3] }, g4);
      o.v.textContent = rw[1].toFixed(3);
      o.t0 = 25 + i * 0.7;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '棒：推定した傾向スコアで評価', '', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    t2(p4, PX, 136, '（横線：±1 標準誤差）', '', { 'font-size': 14, fill: C.muted });
    el('circle', { cx: PX + 8, cy: 184, r: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, p4);
    t2(p4, PX + 22, 190, '郡ごとの真の処置割合で', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX + 22, 214, '評価し直した値', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 262, '0.091 → 0.080', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 300, 'どの値も下がったが、', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 326, '順位は変わらない', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 376, '19,170 人、10 分割交差検証', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2（arXiv v6）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    txt(g5, 480, 104, '√(VC(' + m('Π') + ') / ' + m('n') + ')', { 'font-size': 34, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 196, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ECONOMETRICA · 2021';
    el('text', { x: 480, y: 258, 'font-size': 38, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Policy Learning with Observational Data';
    t2(g5, 480, 302, '観察データからの方策学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 356, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Susan Athey · Stefan Wager';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.3982/ECTA15732 · arxiv.org/abs/1702.02896';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    var k1 = seg(t, 1.0, 1.8);
    S.reg1.setAttribute('opacity', k1); S.cut1.setAttribute('opacity', k1);
    S.lab1a.setAttribute('opacity', k1); S.lab1b.setAttribute('opacity', k1);
    S.p1.setAttribute('opacity', seg(t, 0.8, 1.6));
    var k2 = seg(t, 3.0, 4.6);
    S.pts1.forEach(function (o) {
      if (o.match) {
        o.c.setAttribute('r', 9 + (o.R - 9) * k2);
        o.c.setAttribute('stroke', H.mix(C.ink, C.a, k2));
        o.c.setAttribute('fill', o.W ? H.mix(C.ink, C.a, k2) : '#fff');
        o.c.setAttribute('opacity', 1);
      } else o.c.setAttribute('opacity', 1 - 0.8 * k2);
    });
    S.p1b.setAttribute('opacity', seg(t, 3.4, 4.2));
    // scene 2
    S.bars2.forEach(function (o, i) {
      var s = o.big ? seg(t, 11.2, 13.0) : seg(t, 9.2 + i * 0.15, 10.2 + i * 0.15);
      var h = o.full * s;
      o.r.setAttribute('height', h); o.r.setAttribute('y', 450 - h);
      o.v.setAttribute('y', 450 - h - 8); o.v.setAttribute('opacity', s > 0.98 ? 1 : 0);
    });
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: the split sweeps every threshold, then settles at the maximiser
    var c;
    if (t < 20.8) c = S.AX0 + (S.AX1 - S.AX0) * seg(t, 17.2, 20.8);
    else c = S.AX1 + (S.cBest - S.AX1) * seg(t, 21.0, 22.2);
    var on3 = seg(t, 16.8, 17.2);
    S.cut3.setAttribute('x1', c); S.cut3.setAttribute('x2', c); S.cut3.setAttribute('opacity', on3);
    S.tlab3.setAttribute('x', c + 12); S.tlab3.setAttribute('opacity', on3);
    S.reg3.setAttribute('x', c); S.reg3.setAttribute('width', Math.max(0, 600 - c)); S.reg3.setAttribute('opacity', on3);
    var J = S.J(c), f = Math.max(0, J / S.jMax);
    S.meter.setAttribute('width', 236 * f);
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    // scene 4
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.full * s);
      o.se.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
      o.tr.setAttribute('opacity', seg(t, 29.0, 29.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29.0, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
