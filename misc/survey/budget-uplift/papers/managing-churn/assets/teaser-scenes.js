// =====================================================================
// teaser-scenes.js — Lemmens & Gupta (Marketing Science 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); the 12-unit incentive cost
// matches the order of magnitude in both field experiments. Scene 4 uses the numbers printed in Table 1
// (HBS Working Paper 14-020, revised Dec 2019).
// Colours: orange = approaches that do not put profit into the loss; blue = profit lift / profit-based loss.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '従来は<span class="A">離反しそうな順</span>か、特典で離反が減る順に並べて、上位に特典を送ってきた。', en: '' },
    { ja: '離反の減り方が同じでも、売上が小さい顧客では特典代を回収できず、<span class="A">利益リフトが負</span>になる。', en: '' },
    { ja: '利益ベースの損失は予測の目的を<span class="B">利益リフト</span>に替え、利益への影響が大きい顧客の誤差を重く罰する。', en: '' },
    { ja: '2 つのフィールド実験で、<span class="B">提案法</span>の検証利益が<span class="A">3 つの比較手法</span>をすべて上回った。', en: '' },
    { ja: '離反を当てるモデルと利益を生むモデルは違う。損失関数を経営の目的にそろえる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function fmt(v) { return (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US'); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: customers sorted by churn probability, top share targeted =====
    var g1 = S.g[0];
    var ps = [0.82, 0.76, 0.69, 0.61, 0.55, 0.47, 0.40, 0.33, 0.25, 0.16];
    S.bars1 = [];
    t2(g1, 90, 52, '顧客（離反確率の高い順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    ps.forEach(function (v, i) {
      var y = 78 + i * 40;
      el('circle', { cx: 104, cy: y + 12, r: 10, fill: C.gray }, g1);
      S.bars1.push(el('rect', { x: 130, y: y, width: v * 520, height: 24, rx: 4, fill: C.gray }, g1));
    });
    S.cut1 = el('line', { x1: 80, x2: 600, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 598, 0, '上位を対象にする', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    el('rect', { x: PX, y: 110, width: 18, height: 18, rx: 3, fill: C.a }, p1);
    t2(p1, PX + 28, 125, '特典を送る', '', { 'font-size': 17, fill: C.ink });
    el('rect', { x: PX, y: 145, width: 18, height: 18, rx: 3, fill: C.gray }, p1);
    t2(p1, PX + 28, 160, '送らない', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 215, '並べる基準：', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 241, '離反確率、または離反リフト', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 290, '特典代と特典後の売上は', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 314, '順位に入らない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: same churn lift, different cash flow -> opposite profit lift =====
    var g2 = S.g[1];
    var U = 7;   // px per currency unit
    S.cards = [['A', 100, 90], ['B', 30, 350]].map(function (c) {
      var x = c[2], mv = c[1], o = {};
      var gain = Math.round(0.8 * mv - 0.6 * mv), net = gain - 12;
      el('rect', { x: x, y: 60, width: 240, height: 410, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      txt(g2, x + 20, 100, '顧客 ' + c[0], { 'font-size': 22, 'font-weight': 650, fill: C.ink });
      t2(g2, x + 20, 140, '継続確率 0.6 → 0.8', '', { 'font-size': 16, fill: C.ink });
      t2(g2, x + 20, 166, '（離反リフトは同じ）', '', { 'font-size': 15, fill: C.muted });
      t2(g2, x + 20, 206, '継続時の売上 ' + m('m') + ' = ' + mv, '', { 'font-size': 16, fill: C.ink });
      t2(g2, x + 20, 250, '売上の増分 ' + (0.8 * mv) + ' − ' + (0.6 * mv) + ' = ' + gain, '', { 'font-size': 16, fill: C.ink });
      o.gain = el('rect', { x: x + 20, y: 260, width: 0, height: 18, rx: 3, fill: C.gray }, g2);
      o.gw = gain * U;
      t2(g2, x + 20, 312, '特典代 ' + m('δ') + ' = 12', '', { 'font-size': 16, fill: C.ink });
      o.cost = el('rect', { x: x + 20, y: 322, width: 0, height: 18, rx: 3, fill: C.a }, g2);
      o.cw = 12 * U;
      o.res = t2(g2, x + 20, 392, '利益リフト ' + (net > 0 ? '+' : '−') + Math.abs(net), '', { 'font-size': 20, 'font-weight': 650, fill: net > 0 ? C.b : C.a });
      o.res2 = t2(g2, x + 20, 428, net > 0 ? '→ 送ると得' : '→ 送ると損', '', { 'font-size': 18, 'font-weight': 650, fill: net > 0 ? C.b : C.a });
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 130, '利益リフト', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p2, PX, 162, '= 送ったときの売上', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 188, '− 送らないときの売上', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 214, '− 特典代', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 268, '離反リフトだけを見ると、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 294, 'A と B は同じ順位になる。', '', { 'font-size': 16, fill: C.ink });
    t2(g2, 940, 520, '模式図（数値は解説者が置いた例、割引は省略）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: weights |E(pi)| =====
    var g3 = S.g[2];
    var AX0 = 90, AX1 = 600, AY = 330, LO = -12, HI = 12;
    function sx(v) { return AX0 + (v - LO) / (HI - LO) * (AX1 - AX0); }
    el('line', { x1: AX0, x2: AX1, y1: AY, y2: AY, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: sx(0), x2: sx(0), y1: AY - 150, y2: AY + 10, stroke: C.ink, 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, g3);
    S.axLab = t2(g3, (AX0 + AX1) / 2, AY + 40, '期待利益リフト ' + m('E') + '(' + m('π') + ')', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, sx(-12), AY + 40, '損', '', { 'font-size': 16, fill: C.a });
    t2(g3, sx(12), AY + 40, '得', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'end' });
    var r = rng(7), vals = [-10, -7.5, -4, -2.5, -1, -0.5, 0.5, 1, 2, 3, 4.5, 6, 8, 10.5];
    S.pts3 = vals.map(function (v, i) {
      var c = el('circle', { cx: 0, cy: 0, r: 7, fill: C.gray }, g3);
      return { v: v, c: c, x0: 120 + (i % 7) * 70, y0: 150 + Math.floor(i / 7) * 60, x1: sx(v), y1: AY - 32 - (i % 3) * 44, k: r() };
    });
    S.eqOld = t2(g3, 90, 80, '従来：' + m('y') + ' = ±1（離反するか）、重みは全員 1', '', { 'font-size': 17, fill: C.a });
    S.eqNew = t2(g3, 90, 80, '提案：' + m('E') + '(' + m('π') + ') で並べ、重み ' + m('w') + ' = |' + m('E') + '(' + m('π') + ')|', '', { 'font-size': 17, fill: C.b });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('Ψ') + ' = ' + m('w') + ' log(1 + ' + m('e') + '<tspan dy="-12" font-size="17">−2' + m('E') + '(' + m('π') + ')' + m('F') + '</tspan><tspan dy="12">)</tspan>', { 'font-size': 24, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 180, '円の大きさ＝重み', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 220, '大きな得を逃す誤差と、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 246, '大きな損を招く誤差を', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 272, 'どちらも重く罰する（対称重み）', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 320, '推定は勾配ブースティング（SGB）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点は架空の顧客）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1, holdout profit =====
    var g4 = S.g[3];
    var X0 = 250, X1 = 600, RH = 34;
    var panels = [
      { title: 'Study 1：テレビ配信（ユーロ）', y: 58, lo: 0, hi: 6000, ticks: [0, 2000, 4000, 6000],
        rows: [['従来の損失', 1872], ['並べ直し', 1254], ['uplift モデル', 4093], ['利益ベースの損失', 5026, 1]] },
      { title: 'Study 2：会員制団体（ドル）', y: 300, lo: -2500, hi: 1500, ticks: [-2000, 0, 1000],
        rows: [['従来の損失', -1669], ['並べ直し', -1709], ['uplift モデル', -1305], ['利益ベースの損失', 1328, 1]] }
    ];
    S.bars4 = [];
    panels.forEach(function (P, pi) {
      function px(v) { return X0 + (v - P.lo) / (P.hi - P.lo) * (X1 - X0); }
      var bottom = P.y + 16 + P.rows.length * RH;
      t2(g4, 70, P.y, P.title, '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
      P.ticks.forEach(function (v) {
        el('line', { x1: px(v), x2: px(v), y1: P.y + 12, y2: bottom, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
        el('text', { x: px(v), y: bottom + 20, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = fmt(v);
      });
      P.rows.forEach(function (rw, i) {
        var y = P.y + 22 + i * RH, z = px(Math.max(P.lo, 0)), x = px(rw[1]);
        el('text', { x: X0 - 14, y: y + 16, 'font-size': 15, fill: C.ink, 'text-anchor': 'end', 'font-weight': rw[2] ? 650 : 400 }, g4).textContent = rw[0];
        var b = el('rect', { x: Math.min(x, z), y: y, width: Math.abs(x - z), height: 22, rx: 3, fill: rw[2] ? C.b : C.a }, g4);
        var tv = el('text', { x: rw[1] >= 0 ? x + 6 : x - 6, y: y + 17, 'font-size': 15, fill: C.ink, 'text-anchor': rw[1] >= 0 ? 'start' : 'end' }, g4);
        tv.textContent = fmt(rw[1]);
        S.bars4.push({ b: b, tv: tv, t0: 25 + pi * 2.2 + i * 0.45 });
      });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'Study 1', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 142, 'uplift モデルより 23% 高い', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 250, 'Study 2', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 282, '黒字は提案法だけ', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 350, '検証利益は 100 通りの', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 372, 'データ分割の平均', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1（HBS WP 14-020、2019 年 12 月版）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 160, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'MARKETING SCIENCE · 2020';
    el('text', { x: 480, y: 232, 'font-size': 40, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Managing Churn to Maximize Profits';
    t2(g5, 480, 282, '利益を最大にする離反対策', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 336, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Aurélie Lemmens · Sunil Gupta';
    el('text', { x: 480, y: 394, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1287/mksc.2020.1229';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: cut line slides down to after the 4th customer, top bars turn orange
    var yc = 70 + seg(t, 1.2, 3.5) * (78 + 4 * 40 - 8 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.4));
    S.cutLab1.setAttribute('transform', 'translate(0,' + (yc + 22) + ')');
    S.cutLab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 4 ? H.mix(C.gray, C.a, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: gain bars, then cost bars, then verdicts
    S.cards.forEach(function (o) {
      o.gain.setAttribute('width', o.gw * seg(t, 9.2, 10.6));
      o.cost.setAttribute('width', o.cw * seg(t, 10.8, 12.2));
      o.res.setAttribute('opacity', seg(t, 12.6, 13.2));
      o.res2.setAttribute('opacity', seg(t, 13.1, 13.7));
    });
    // scene 3: equal-weight grid -> placed by E(pi), radius by |E(pi)|
    var k = seg(t, 18.2, 20.2);
    S.pts3.forEach(function (q) {
      var s = seg(t, 18.2 + q.k * 0.8, 20.0 + q.k * 0.8);
      q.c.setAttribute('cx', q.x0 + (q.x1 - q.x0) * s);
      q.c.setAttribute('cy', q.y0 + (q.y1 - q.y0) * s);
      q.c.setAttribute('r', 7 + (3 + Math.abs(q.v) * 2.2 - 7) * seg(t, 20.4, 21.6));
      var col = q.v > 0 ? C.b : C.a;
      q.c.setAttribute('fill', H.mix(C.gray, col, seg(t, 20.4, 21.6)));
      q.c.setAttribute('fill-opacity', 1 - 0.35 * seg(t, 20.4, 21.6));
    });
    S.axLab.setAttribute('opacity', k);
    S.eqOld.setAttribute('opacity', 1 - seg(t, 18, 18.6));
    S.eqNew.setAttribute('opacity', seg(t, 18.6, 19.2));
    S.p3.setAttribute('opacity', seg(t, 20.8, 21.6));
    // scene 4: bars appear in order, then the summaries
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.b.setAttribute('opacity', s); o.tv.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 29.6, 30.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
