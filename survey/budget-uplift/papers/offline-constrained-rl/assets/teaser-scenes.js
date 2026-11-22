// =====================================================================
// teaser-scenes.js — Cai et al. (WSDM 2023), unofficial explainer. Player: teaser-engine.js.
// Scene 1 and 3 are schematics (labelled 模式図). Scene 2 uses Table 1 of the paper, scene 4 uses
// Table 2 (full dataset) and the online A/B numbers in Sec. 6.4 (arXiv v1).
// Colours: orange = short-term view / two-step methods / original mixed policy that stores every policy;
//          blue   = long-term view / offline constrained RL / AIM policies (at most m+2 stored).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来の方法は<span class="A">翌日の反応</span>を予測し、予算内で線形計画を解いてクーポン額を決める。', en: '' },
    { ja: '額を増やした効果は非アクティブ層のほうが大きく、その差は 1 日では 32%、<span class="B">7 日では 82%</span> だった。', en: '' },
    { ja: '元の混合方策は<span class="A">学習した方策をすべて保存</span>するが、AIM は<span class="B">高々 m+2 個</span>で同じ平均を再現する。', en: '' },
    { ja: '7 日の DAU では強化学習が上回り、オンラインの A/B テストでも週平均の DAU が 0.6% 上がった。', en: '' },
    { ja: 'クーポンの長期の効果を、少ない保存数の混合方策で予算配分に取り込む。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 25, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two-step pipeline that looks only at day 1 =====
    var g1 = S.g[0];
    var boxes = [['応答モデル', '（DeepFM・DIN など）'], ['翌日の反応を予測', 'クーポン額ごと'], ['線形計画で配分', '予算の制約のもと']];
    S.box1 = boxes.map(function (b, i) {
      var x = 80 + i * 175, g = el('g', {}, g1);
      el('rect', { x: x, y: 90, width: 150, height: 96, rx: 12, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g);
      t2(g, x + 75, 132, b[0], '', { 'font-size': 17, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      t2(g, x + 75, 160, b[1], '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      if (i < 2) el('path', { d: 'M' + (x + 152) + ',138 L' + (x + 172) + ',138', stroke: C.muted, 'stroke-width': 2 }, g);
      return g;
    });
    t2(g1, 80, 270, '見ている期間', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.days1 = [];
    for (var d = 0; d < 7; d++) {
      var r = el('rect', { x: 80 + d * 70, y: 290, width: 60, height: 60, rx: 8, fill: C.panel }, g1);
      txt(g1, 110 + d * 70, 326, (d + 1) + '日', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      S.days1.push(r);
    }
    S.mark1 = t2(g1, 80, 390, '翌日の反応だけを最適化する', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '2 段階の方法', '', { 'font-size': 19, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 175, '大規模でも動くが、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 201, '何度か使って習慣が', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 227, 'つくといった長期の', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 253, '効果は捉えられない。', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Table 1, DAU gain of 1 -> 3 yuan by user group and time frame =====
    var g2 = S.g[1];
    var T1 = [['1 日', 0.15, 0.11, '32%'], ['3 日', 0.54, 0.31, '72%'], ['7 日', 1.24, 0.68, '82%']];
    var BASE = 440, K = 240;   // px per DAU
    t2(g2, 80, 56, 'クーポンを 1 元 → 3 元にしたときの DAU の増分', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 600, y1: BASE, y2: BASE, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = T1.map(function (row, i) {
      var x = 110 + i * 170, o = {};
      o.in = el('rect', { x: x, y: BASE, width: 56, height: 0, fill: C.b }, g2);
      o.ac = el('rect', { x: x + 62, y: BASE, width: 56, height: 0, fill: C.gray }, g2);
      o.hi = row[1] * K; o.ha = row[2] * K;
      o.vin = txt(g2, x + 28, BASE - o.hi - 10, '+' + row[1].toFixed(2), { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      o.vac = txt(g2, x + 90, BASE - o.ha - 10, '+' + row[2].toFixed(2), { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      txt(g2, x + 59, BASE + 28, row[0], { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      o.d = txt(g2, x + 59, BASE - o.hi - 40, '差 ' + row[3], { 'font-size': 18, 'font-weight': 650, fill: i === 2 ? C.b : C.ink, 'text-anchor': 'middle' });
      o.t0 = 9.2 + i * 1.3;
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    el('rect', { x: PX, y: 100, width: 18, height: 18, fill: C.b }, p2);
    t2(p2, PX + 28, 115, '非アクティブ層', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 134, width: 18, height: 18, fill: C.gray }, p2);
    t2(p2, PX + 28, 149, '活発な層', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 205, '差 = 非アクティブ ÷ 活発 − 1', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 250, '翌日だけを見ると、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 276, '非アクティブ層に配る', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 302, '価値を過小評価しやすい。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '論文 Table 1 の数値（ランダムに配った 420 万件）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: stored policies, original mixed policy vs AIM (m = 1) =====
    var g3 = S.g[2];
    t2(g3, 70, 60, '元の混合方策', '', { 'font-size': 17, 'font-weight': 650, fill: C.a });
    t2(g3, 70, 84, '学習した方策をすべて保存', '', { 'font-size': 15, fill: C.muted });
    S.cells3 = [];
    for (var k = 0; k < 60; k++) {
      var cx = 70 + (k % 6) * 36, cy = 108 + Math.floor(k / 6) * 34;
      S.cells3.push(el('rect', { x: cx, y: cy, width: 28, height: 26, rx: 4, fill: C.a }, g3));
    }
    S.count3 = txt(g3, 70, 470, '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    // AIM triangle (same geometry as Fig. 1 of the page, shifted)
    function P(x, y) { return [x * 0.62 + 250, y * 0.62 + 70]; }
    var p1v = P(130, 290), p2v = P(300, 90), p3v = P(430, 300), p4v = P(580, 150), xo = P(330, 240), xn = P(413.3, 210);
    t2(g3, 340, 60, 'AIM（' + m('m') + ' = 1）', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(g3, 340, 84, '保存は高々 3 個', '', { 'font-size': 15, fill: C.muted });
    S.oldTri = el('polygon', { points: [p1v, p2v, p3v].map(String).join(' '), fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3);
    S.newTri = el('polygon', { points: [p2v, p3v, p4v].map(String).join(' '), fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, g3);
    S.v1 = el('circle', { cx: p1v[0], cy: p1v[1], r: 8, fill: C.ink }, g3);
    el('circle', { cx: p2v[0], cy: p2v[1], r: 8, fill: C.ink }, g3);
    el('circle', { cx: p3v[0], cy: p3v[1], r: 8, fill: C.ink }, g3);
    S.v4 = el('circle', { cx: p4v[0], cy: p4v[1], r: 8, fill: C.b }, g3);
    S.v4l = t2(g3, p4v[0] - 6, p4v[1] - 16, '新しい方策', '', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    S.tgt = el('circle', { cx: xo[0], cy: xo[1], r: 7, fill: C.b }, g3);
    S.xo = xo; S.xn = xn;
    S.v1x = t2(g3, p1v[0] - 4, p1v[1] + 30, '外す', '', { 'font-size': 14, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    t2(g3, 340, 330, '● 目標（これまでの平均）', '', { 'font-size': 14, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '保存する方策の数', '', { 'font-size': 16, fill: C.muted });
    t2(p3, PX, 170, '元の方法：学習の', '', { 'font-size': 17, fill: C.a });
    t2(p3, PX, 196, 'ステップ数に比例', '', { 'font-size': 17, fill: C.a });
    t2(p3, PX, 240, 'AIM：高々 ' + m('m') + '+2 個', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 290, '目標が三角形の外に出たら、', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 314, '頂点を 1 つ入れ替える。', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 350, 'AIM-mean は元の方法と同じ', '', { 'font-size': 15, fill: C.ink });
    t2(p3, PX, 374, '平均を保つので収束する。', '', { 'font-size': 15, fill: C.ink });
    t2(g3, 940, 520, '模式図（点の位置は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (full dataset) + online A/B =====
    var g4 = S.g[3];
    var rows = [['DeepFM', 0.6396, 5.2114, C.a], ['DIN', 0.6468, 5.2237, C.a],
      ['BCQ / Single-best', 0.6150, 5.6901, C.gray], ['BCQ / AIM-mean', 0.6159, 5.6685, C.gray], ['BCQ / AIM-greedy', 0.6205, 5.7020, C.b]];
    var PA = { x0: 250, x1: 400, lo: 0.60, hi: 0.66 }, PB = { x0: 440, x1: 600, lo: 5.1, hi: 5.8 };
    function sx(p, v) { return p.x0 + (v - p.lo) / (p.hi - p.lo) * (p.x1 - p.x0); }
    var Y0 = 130, DY = 62;
    t2(g4, 325, 80, '1 日の DAU', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g4, 520, 80, '7 日の DAU', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    [[PA, [0.60, 0.63, 0.66], 2], [PB, [5.2, 5.5, 5.8], 1]].forEach(function (q) {
      q[1].forEach(function (v) {
        el('line', { x1: sx(q[0], v), x2: sx(q[0], v), y1: Y0 - 26, y2: Y0 + DY * 4 + 24, stroke: C.hair }, g4);
        txt(g4, sx(q[0], v), Y0 + DY * 4 + 48, v.toFixed(q[2]), { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      });
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, g = el('g', {}, g4);
      txt(g, PA.x0 - 16, y + 5, rw[0], { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      el('circle', { cx: sx(PA, rw[1]), cy: y, r: 9, fill: rw[3] }, g);
      el('circle', { cx: sx(PB, rw[2]), cy: y, r: 9, fill: rw[3] }, g);
      return { g: g, t0: 26 + i * 0.6 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'オンライン A/B（1 週間）', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 132, 'DIN と線形計画との比較', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 168, '週平均 DAU', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 206, '+0.6%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 250, 'クーポン費用', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 288, '−0.8%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 332, '翌日の利用率は DIN が高い', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 356, 'その後、全流量に展開', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '左：論文 Table 2（全データ、オフライン評価）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'WSDM · 2023';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Marketing Budget Allocation with Offline';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Constrained Deep Reinforcement Learning';
    t2(g5, 480, 302, 'オフラインの制約付き深層強化学習によるマーケティング予算配分', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Tianchi Cai, Jiyan Jiang, Wenpeng Zhang, Shiji Zhou, et al.';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2309.02669';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: boxes appear, then only day 1 lights up
    S.box1.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 0.6 + i * 0.7, 1.2 + i * 0.7)); });
    S.days1.forEach(function (r, d) {
      r.setAttribute('fill', d === 0 ? H.mix(C.panel, C.a, seg(t, 3.4, 4.2)) : C.panel);
      r.setAttribute('opacity', d === 0 ? 1 : 1 - 0.4 * seg(t, 3.8, 4.6));
    });
    S.mark1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 2, 2.8));
    // scene 2: bars grow group by group, then the gaps
    S.bars2.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 1);
      o.in.setAttribute('height', o.hi * s); o.in.setAttribute('y', 440 - o.hi * s);
      o.ac.setAttribute('height', o.ha * s); o.ac.setAttribute('y', 440 - o.ha * s);
      var v = seg(t, o.t0 + 0.9, o.t0 + 1.3);
      o.vin.setAttribute('opacity', v); o.vac.setAttribute('opacity', v);
      o.d.setAttribute('opacity', seg(t, o.t0 + 1.2, o.t0 + 1.7));
    });
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: stored policies pile up on the left; on the right one vertex is swapped
    var n = Math.round(60 * seg(t, 16.6, 22.5));
    S.cells3.forEach(function (c, k) { c.setAttribute('opacity', k < n ? 1 : 0); });
    S.count3.textContent = n > 0 ? n + ' 個（増え続ける）' : '';
    var sw = seg(t, 20.2, 21.6);           // target moves to the new mean
    S.tgt.setAttribute('cx', S.xo[0] + (S.xn[0] - S.xo[0]) * sw);
    S.tgt.setAttribute('cy', S.xo[1] + (S.xn[1] - S.xo[1]) * sw);
    var v4 = seg(t, 19, 19.6);
    S.v4.setAttribute('opacity', v4); S.v4l.setAttribute('opacity', v4);
    var rm = seg(t, 21.8, 22.6);           // swap pi_1 out, triangle changes
    S.oldTri.setAttribute('opacity', 1 - rm);
    S.newTri.setAttribute('opacity', rm);
    S.v1.setAttribute('opacity', 1 - 0.85 * rm);
    S.v1x.setAttribute('opacity', seg(t, 21.4, 21.9));
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: rows in order, then the online numbers
    S.rows4.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
