// =====================================================================
// teaser-scenes.js — F. Avellaneda, Efficient Inference of Optimal Decision Trees (AAAI 2020),
// unofficial explainer. Content from the arXiv preprint 1904.06314 v1 (different title); the AAAI
// text was not checked. Player: teaser-engine.js.
// Scene 1 is a schematic. Scene 2 uses the Car numbers in Section 5.2 / Table 2 (1,729 examples,
// DT1 used 173 = 10 %, 684 s, 55 %); the dot positions are random. Scene 3 replays the worked example
// in the paper's appendix (depth 2, 8 examples, conjectures of Figs. 6-11). Scene 4 uses Table 1.
// Colours: orange = earlier exact SAT encodings (DT2 Bessiere et al., DT1 Narodytska et al.);
//          blue = this paper (counterexamples added one at a time; DT_depth / DT_size).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '既存の SAT による方法は学習データの<span class="A">すべての例</span>を最初から論理式に入れるので、例が増えるほど式が大きくなる。', en: '' },
    { ja: '1,729 例の Car では、データ全体と矛盾しない最適な木を求めた方法がなく、Narodytska らは 10% の例だけを使って 684 秒かかった。', en: '' },
    { ja: 'この論文は、今の木が誤って分類する例だけを<span class="B">1 つずつ式に足し</span>、SAT を解き直す。付録の例では 8 例のうち 5 例で済む。', en: '' },
    { ja: 'Mouse では既存の方法で 577 秒と 12.9 秒かかった問題を、33 例だけを使って 0.015 秒で解いた。', en: '' },
    { ja: '必要な数の例がそろえば、例をさらに増やしても計算時間はほとんど増えない、と論文は報告する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function txt(g) { return g.querySelector('[data-l="ja"]'); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: every example goes into the formula at once =====
    var g1 = S.g[0], r1 = rng(5);
    el('rect', { x: 360, y: 150, width: 230, height: 260, rx: 14, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, g1);
    t2(g1, 475, 136, '論理式', '', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    t2(g1, 165, 106, '学習データ', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.fill1 = el('rect', { x: 372, y: 398, width: 206, height: 0, rx: 8, fill: C.a, opacity: 0.85 }, g1);
    S.rows1 = [];
    for (var i = 0; i < 12; i++) {
      var y = 130 + i * 26, row = el('g', {}, g1), bits = '';
      for (var b = 0; b < 6; b++) bits += r1() < 0.5 ? '0 ' : '1 ';
      el('rect', { x: 0, y: -14, width: 150, height: 22, rx: 5, fill: C.panel }, row);
      el('text', { x: 75, y: 2, 'font-size': 14, fill: C.ink, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace' }, row).textContent = bits.trim();
      S.rows1.push({ g: row, x0: 90, y0: y, t0: 1.2 + i * 0.28 });
    }
    S.cnt1 = t2(g1, 475, 450, '', '', { 'font-size': 17, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 140, '既存の SAT の方法', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 176, 'Bessiere ら 2009（DT2）', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 202, 'Narodytska ら 2018（DT1）', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 250, '全例を最初から', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 278, '式に入れる。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 334, 'Mouse の式の大きさ', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 362, 'DT2：3.5M 節', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(p1, PX, 390, 'DT1：1.2M 節', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(g1, 940, 520, '模式図（節の数は論文の表 1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Car, 1,729 examples; DT1 used 10 % =====
    var g2 = S.g[1], r2 = rng(29), N = 1729, COLS = 49;
    var idx = []; for (var k = 0; k < N; k++) idx.push(k);
    for (k = N - 1; k > 0; k--) { var j = Math.floor(r2() * (k + 1)), tmp = idx[k]; idx[k] = idx[j]; idx[j] = tmp; }
    var used = {}; for (k = 0; k < 173; k++) used[idx[k]] = 1;
    S.dotsG = el('g', {}, g2); S.dotsA = el('g', {}, g2);
    for (k = 0; k < N; k++) {
      var cx = 90 + (k % COLS) * 10, cy = 120 + Math.floor(k / COLS) * 10;
      el('circle', { cx: cx, cy: cy, r: 3.4, fill: C.gray }, S.dotsG);
      if (used[k]) el('circle', { cx: cx, cy: cy, r: 4, fill: C.a }, S.dotsA);
    }
    t2(g2, 90, 96, 'Car の例 1,729 個（1 点が 1 例）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 140, 'Narodytska ら（DT1）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 180, '例の 10%（173 個）だけで', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 232, '684 秒', '', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 276, '交差検証の精度 55%', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 330, 'データ全体と矛盾しない', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 354, '最適な木は、それまで', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 378, '求められていなかった。', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '点の位置はランダム（数値は論文の表 2）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: the appendix walk-through (depth 2, 8 examples) =====
    var g3 = S.g[2];
    var EX = [['0010', 0, 1], ['0001', 0, 0], ['1011', 0, 2], ['1110', 0, 3], ['0101', 1, 4], ['0110', 1, 0], ['1000', 1, 5], ['1101', 1, 0]];
    t2(g3, 70, 96, '例（' + m('f') + '₀…' + m('f') + '₃）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g3, 236, 96, 'クラス', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.ex3 = EX.map(function (e, r) {
      var y = 132 + r * 40;
      var box = el('rect', { x: 60, y: y - 22, width: 220, height: 32, rx: 6, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
      el('text', { x: 80, y: y, 'font-size': 17, fill: C.ink, 'font-family': 'ui-monospace, Menlo, monospace', 'letter-spacing': 3 }, g3).textContent = e[0];
      el('text', { x: 236, y: y, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g3).textContent = String(e[1]);
      var ord = el('text', { x: 296, y: y, 'font-size': 15, 'font-weight': 650, fill: C.b }, g3);
      ord.textContent = e[2] ? '+' + e[2] : '';
      return { box: box, ord: ord, step: e[2] };
    });
    var NX = [[470, 140], [400, 228], [540, 228]], LX = [365, 435, 505, 575], LY = 330;
    var edges = [[0, 1], [0, 2]];
    edges.forEach(function (e) { el('line', { x1: NX[e[0]][0], y1: NX[e[0]][1], x2: NX[e[1]][0], y2: NX[e[1]][1], stroke: C.muted, 'stroke-width': 1.6 }, g3); });
    LX.forEach(function (x, i) { var p = NX[1 + (i >> 1)]; el('line', { x1: p[0], y1: p[1], x2: x, y2: LY - 18, stroke: C.muted, 'stroke-width': 1.6 }, g3); });
    S.nodes3 = NX.map(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 24, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, g3);
      return txt(t2(g3, p[0], p[1] + 6, '', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }));
    });
    S.leaves3 = LX.map(function (x) {
      var r = el('rect', { x: x - 22, y: LY - 18, width: 44, height: 40, rx: 6, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, g3);
      return { r: r, t: txt(t2(g3, x, LY + 9, '', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' })) };
    });
    t2(g3, 470, 392, '左：偽　右：真　「–」：クラスなし', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.stat3 = txt(t2(g3, 470, 92, '', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' }));
    S.used3 = txt(t2(g3, 470, 440, '', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' }));
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 140, 'この論文の探索', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 184, '① SAT を解いて木を得る', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 226, '② 全例を分類する', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 268, '③ 誤る例を 1 つ式に足す', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 292, '①に戻る', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 340, '全例が正しくなれば終わり。', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 366, '残りの例は式に入らない。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '論文の付録の例（深さ 2）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Mouse, Table 1 (log scale) =====
    var g4 = S.g[3], X0 = 230, DEC = 72;
    function lx(v) { return X0 + (Math.log(v) / Math.LN10 + 2) * DEC; }
    [0.01, 0.1, 1, 10, 100, 1000].forEach(function (v, i) {
      el('line', { x1: lx(v), x2: lx(v), y1: 120, y2: 380, stroke: i === 0 ? C.ink : C.hair, 'stroke-width': i === 0 ? 1.5 : 1 }, g4);
      el('text', { x: lx(v), y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = String(v);
    });
    t2(g4, lx(1), 434, '計算時間（秒、対数目盛）', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g4, 70, 96, 'Mouse：データ全体と矛盾しない最適な木を求める時間', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var BARS = [['DT2（Bessiere ら）', 577, '577', C.a], ['DT1（Narodytska ら）', 12.9, '12.9', C.a], ['DT_size', 0.075, '0.075', C.b], ['DT_depth', 0.015, '0.015', C.b]];
    S.bars4 = BARS.map(function (b, i) {
      var y = 160 + i * 60;
      t2(g4, X0 - 12, y + 6, b[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: y - 18, width: 0, height: 36, fill: b[3] }, g4);
      var lab = t2(g4, lx(b[1]) + 8, y + 6, b[2], '', { 'font-size': 17, 'font-weight': 650, fill: b[3] });
      return { rect: rect, lab: lab, w: lx(b[1]) - X0, t0: 24.6 + i * 0.8 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 140, '式に入れた例の数', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 176, 'DT2、DT1：1,728', '', { 'font-size': 17, fill: C.a, 'font-weight': 600 });
    t2(p4, PX, 206, 'DT_size：37', '', { 'font-size': 17, fill: C.b, 'font-weight': 600 });
    t2(p4, PX, 236, 'DT_depth：33', '', { 'font-size': 17, fill: C.b, 'font-weight': 600 });
    t2(p4, PX, 294, 'どれもノード 15 の木', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 318, '（DT_depth は深さ 4 の', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 342, '　完全な木でノード 31）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文の表 1（arXiv 前版）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4], tk = el('g', {}, g5);
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 300, 74, 'Car（1,729 例）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 300, 98, '635 例で深さ 8 の木', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 660, 74, 'Mouse（DT_depth）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 660, 98, '33 例で 0.015 秒', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2020';
    el('text', { x: 480, y: 230, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Efficient Inference of Optimal Decision Trees';
    t2(g5, 480, 276, '反例を足しながら SAT で求める最小の決定木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 330, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Florent Avellaneda';
    el('text', { x: 480, y: 384, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v34i04.5717';
    t2(g5, 480, 420, '数値は arXiv の前版 1904.06314 による', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  // scene 3 states: [time, root, left, right, leaves, examples added]
  var ST = [
    [16.4, 'f₁', 'f₀', 'f₀', '1111', 0],
    [17.6, 'f₁', 'f₀', 'f₀', '0–––', 1],
    [18.7, 'f₁', 'f₀', 'f₀', '00––', 2],
    [19.8, 'f₁', 'f₀', 'f₀', '00–0', 3],
    [20.9, 'f₁', 'f₀', 'f₀', '0010', 4],
    [22.0, 'f₀', 'f₁', 'f₂', '0110', 5]
  ];

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: rows slide into the formula; the formula fills up
    var inF = 0;
    S.rows1.forEach(function (r) {
      var s = H.ease(seg(t, r.t0, r.t0 + 0.8));
      var x = r.x0 + (400 - r.x0) * s, y = r.y0 + (280 - r.y0) * s;
      r.g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      r.g.setAttribute('opacity', 1 - seg(t, r.t0 + 0.6, r.t0 + 0.8));
      if (t > r.t0 + 0.7) inF++;
    });
    var h = 236 * inF / S.rows1.length;
    S.fill1.setAttribute('y', 398 - h); S.fill1.setAttribute('height', h);
    txt(S.cnt1).textContent = inF ? (inF === S.rows1.length ? '全例が式に入る' : '例を式に追加中…') : '';
    S.p1.setAttribute('opacity', seg(t, 2.4, 3.2));
    // scene 2
    S.dotsG.setAttribute('opacity', seg(t, 8.6, 9.4));
    S.dotsA.setAttribute('opacity', seg(t, 10.2, 11.0));
    S.p2.setAttribute('opacity', seg(t, 10.8, 11.6));
    // scene 3
    var k = 0; for (var i = 0; i < ST.length; i++) if (t >= ST[i][0]) k = i;
    var st = ST[k];
    S.nodes3[0].textContent = st[1]; S.nodes3[1].textContent = st[2]; S.nodes3[2].textContent = st[3];
    S.leaves3.forEach(function (l, j) {
      var v = st[4].charAt(j);
      l.t.textContent = v;
      l.r.setAttribute('fill', k === 5 ? C.bsoft : '#fff');
    });
    S.ex3.forEach(function (e) {
      var on = e.step && e.step <= st[5];
      e.box.setAttribute('fill', on ? C.bsoft : '#fff');
      e.box.setAttribute('stroke', on ? C.b : C.hair);
      e.ord.setAttribute('opacity', on ? 1 : 0);
    });
    S.stat3.textContent = k === 5 ? '8 例すべてを正しく分類する木' : (k === 0 ? '最初の木（制約は「特徴量は 1 つ」だけ）' : '誤った例を足して解き直した木');
    S.used3.textContent = '式に入れた例 ' + st[5] + ' / 8';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 28.2, 29.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
