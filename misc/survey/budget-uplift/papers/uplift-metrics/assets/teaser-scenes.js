// =====================================================================
// teaser-scenes.js — Renaudin & Martin (arXiv 2021, v3), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic with explainer-chosen people (labelled 模式図).
// Scenes 2-3 use toy example 1 of the paper (Section 5.2: treatment rates 1/4, 5/6, 5/12, 1/2); the curves
// and areas are computed by the explainer from those settings (scene 3 = expected curve with weights 1/q).
// Scene 4 restates the V1 / V2 rules (Tables 6-7) and the optimal nu (Section 7.3, Appendix C).
// Colours: orange = AUUC as usually computed (V1, no re-weighting) / the worse model it favours;
//          blue = true uplift order (perfect model) / the paper's corrections.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'アップリフト曲線は推定値の大きい順に人を見ていき、処置群の反応で上がり、対照群の反応で下がる。', en: '' },
    { ja: '処置確率が群ごとに違うと、<span class="A">劣ったモデル</span>の AUUC が<span class="B">完璧なモデル</span>を上回る例が作れる。', en: '' },
    { ja: '各人の寄与を処置確率の逆数で重みづけすると、<span class="B">完璧なモデル</span>の AUUC が最も高くなる。', en: '' },
    { ja: 'V1 と V2 を混ぜた曲線は偏りがなく、50:50 の RCT では ν を反応率にすると分散が最小になる。', en: '' },
    { ja: 'AUUC は RCT のデータで使い、そうでなければ処置確率で重みづけしてから比べる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  var UN = m('û') + '<tspan ' + MI + ' font-size="13" dy="4">n</tspan><tspan dy="-4"></tspan>';

  // toy example 1 (x = share of population, y = cumulative gain / N)
  var XS = [0, 0.25, 0.75, 1], XN = [0, 0.5, 0.75, 1];
  var U_V1 = [0, 0.0625, 0.229167, 0.104167], N_V1 = [0, 0.166667, 0.229167, 0.104167];
  var U_W = [0, 0.25, 0.25, 0], N_W = [0, 0, 0.25, 0];
  var AX0 = 90, AX1 = 590, AY0 = 440;
  function cx(x) { return AX0 + x * (AX1 - AX0); }
  function cy(v) { return AY0 - v * 1400; }
  function pts(xs, ys) { return xs.map(function (x, i) { return cx(x) + ',' + cy(ys[i]); }).join(' '); }

  function axes(g, ylab) {
    el('line', { x1: AX0, x2: AX1 + 10, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: 60, stroke: C.ink, 'stroke-width': 1.5 }, g);
    [[0, '0'], [0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'], [1, '1']].forEach(function (d) {
      el('text', { x: cx(d[0]), y: AY0 + 24, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = d[1];
    });
    t2(g, AX1, AY0 + 50, '上位に選んだ人の割合 →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g, AX0 + 10, 56, ylab, '', { 'font-size': 16, fill: C.ink });
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: building the V1 curve =====
    var g1 = S.g[0];
    var people = [[1, 1], [1, 1], [0, 0], [1, 1], [0, 1], [1, 0], [0, 0], [1, 0], [0, 1], [1, 0]];
    S.vals = [0]; S.ppl = [];
    people.forEach(function (p, i) {
      var inc = p[1] === 1 ? (p[0] === 1 ? 1 : -1) : 0;
      S.vals.push(S.vals[i] + inc);
      var x = 110 + i * 48, o = el('g', {}, g1);
      if (p[0] === 1) el('circle', { cx: x, cy: 80, r: 16, fill: C.ink }, o);
      else el('circle', { cx: x, cy: 80, r: 15, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, o);
      el('text', { x: x, y: 86, 'font-size': 17, fill: p[0] === 1 ? '#fff' : C.ink, 'text-anchor': 'middle' }, o).textContent = p[1];
      el('text', { x: x, y: 128, 'font-size': 17, fill: inc ? C.ink : C.muted, 'text-anchor': 'middle' }, o).textContent = inc > 0 ? '+1' : (inc < 0 ? '−1' : '0');
      S.ppl.push(o);
    });
    t2(g1, 86, 44, '推定値の大きい順 →', '', { 'font-size': 16, fill: C.muted });
    var B0 = 440, UY = 70;
    S.sx = function (k) { return 86 + k * 48; };
    S.sy = function (v) { return B0 - v * UY; };
    el('line', { x1: 86, x2: 590, y1: B0, y2: B0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: 86, x2: 86, y1: B0, y2: 190, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    [0, 1, 2, 3].forEach(function (v) { el('text', { x: 76, y: S.sy(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g1).textContent = v; });
    S.base1 = el('line', { x1: 86, y1: B0, x2: S.sx(10), y2: S.sy(1), stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g1);
    S.curve1 = el('polyline', { points: '', fill: 'none', stroke: C.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g1);
    t2(g1, 590, B0 + 30, '選んだ人数 →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    el('circle', { cx: PX + 10, cy: 105, r: 11, fill: C.ink }, p1);
    t2(p1, PX + 30, 111, '処置群', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 10, cy: 140, r: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, p1);
    t2(p1, PX + 30, 146, '対照群', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 180, '丸の中の数字は反応（1 / 0）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 232, '処置群で反応 → 1 上がる', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 264, '対照群で反応 → 1 下がる', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 296, 'それ以外 → 水平に進む', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 350, '破線（ランダム）との間の', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 374, '面積でモデルを比べる', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 410, '論文はこの作り方を V1 と呼ぶ', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（10 人の並びと反応は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: toy example 1, V1 curves =====
    var g2 = S.g[1];
    axes(g2, '↑ 累積の増分 ÷ N（V1）');
    el('line', { x1: cx(0), y1: cy(0), x2: cx(1), y2: cy(0.104167), stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g2);
    S.n2 = el('polyline', { points: pts(XN, N_V1), fill: 'none', stroke: C.a, 'stroke-width': 4, 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    S.u2 = el('polyline', { points: pts(XS, U_V1), fill: 'none', stroke: C.b, 'stroke-width': 4, 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    var p2 = el('g', {}, g2);
    t2(p2, PX, 100, '群ごとの処置確率', '', { 'font-size': 16, fill: C.muted });
    txt(p2, PX, 132, 'CO 1/4　ST 5/6', { 'font-size': 18, fill: C.ink });
    txt(p2, PX, 162, 'LC 5/12　SD 1/2', { 'font-size': 18, fill: C.ink });
    S.p2 = el('g', {}, g2);
    el('rect', { x: PX, y: 206, width: 22, height: 6, fill: C.b }, S.p2);
    t2(S.p2, PX + 32, 215, '完璧なモデル', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX + 32, 239, 'CO → ST・LC → SD', '', { 'font-size': 15, fill: C.muted });
    el('rect', { x: PX, y: 266, width: 22, height: 6, fill: C.a }, S.p2);
    t2(S.p2, PX + 32, 275, '劣ったモデル ' + UN, '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX + 32, 299, 'ST・LC → CO → SD', '', { 'font-size': 15, fill: C.muted });
    S.a2 = el('g', {}, g2);
    t2(S.a2, PX, 350, '曲線の下の面積', '', { 'font-size': 16, fill: C.muted });
    txt(S.a2, PX, 390, '0.122', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    txt(S.a2, PX + 102, 390, '&lt;', { 'font-size': 26, fill: C.ink });
    txt(S.a2, PX + 136, 390, '0.133', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(g2, 940, 520, '論文 5.2 節の例 1 の設定から解説者が計算', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: same example, weighted by 1/q (expected curves) =====
    var g3 = S.g[2];
    axes(g3, '↑ 累積の増分 ÷ N');
    S.n3 = el('polyline', { points: pts(XN, N_V1), fill: 'none', stroke: C.a, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-dasharray': '10 6' }, g3);
    S.u3 = el('polyline', { points: pts(XS, U_V1), fill: 'none', stroke: C.b, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 130, '重み 1/' + m('q') + '<tspan ' + MI + ' font-size="18" dy="6">i</tspan>', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 172, '実際に受けた処置の確率の逆数', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 220, '期待値では、群の中の傾きが', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 248, '真の効果に等しくなる', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 280, 'CO +1、ST・LC 0、SD −1', '', { 'font-size': 16, fill: C.muted });
    S.a3 = el('g', {}, g3);
    t2(S.a3, PX, 340, '曲線の下の面積', '', { 'font-size': 16, fill: C.muted });
    txt(S.a3, PX, 380, '0.188', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    txt(S.a3, PX + 102, 380, '&gt;', { 'font-size': 26, fill: C.ink });
    txt(S.a3, PX + 136, 380, '0.063', { 'font-size': 32, 'font-weight': 650, fill: C.a });
    t2(g3, 940, 520, '例 1 に重みをかけた期待値の曲線（解説者の計算）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: V1 / V2 rules and the optimal nu =====
    var g4 = S.g[3];
    function grid(x0, vals, col, title) {
      var g = el('g', {}, g4), CW = 92;
      t2(g, x0, 92, title, '', { 'font-size': 18, 'font-weight': 650, fill: col });
      ['処置群', '対照群'].forEach(function (s, j) { t2(g, x0 + CW * j + CW / 2, 124, s, '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }); });
      [0, 1].forEach(function (r) {
        [0, 1].forEach(function (c) {
          var v = vals[r][c];
          el('rect', { x: x0 + CW * c, y: 136 + CW * r, width: CW, height: CW, fill: v ? (col === C.a ? '#FCEBDF' : C.bsoft) : '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
          el('text', { x: x0 + CW * c + CW / 2, y: 136 + CW * r + CW / 2 + 9, 'font-size': 26, 'font-weight': 650, fill: v ? col : C.muted, 'text-anchor': 'middle' }, g).textContent = v > 0 ? '+1' : (v < 0 ? '−1' : '0');
        });
      });
      return g;
    }
    t2(g4, 150, 188, '反応 1', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g4, 150, 280, '反応 0', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    S.gr1 = grid(160, [[1, -1], [0, 0]], C.a, 'V1（従来）');
    S.gr2 = grid(410, [[0, 0], [-1, 1]], C.b, 'V2（ラベルを裏返す）');
    S.f4 = el('g', {}, g4);
    txt(S.f4, 160, 382, m('V') + '<tspan ' + MI + ' font-size="15" dy="5">ν</tspan><tspan dy="-5"> = (1 − ' + m('ν') + ') ' + m('V') + '<tspan font-size="15" dy="5">1</tspan><tspan dy="-5"> + ' + m('ν') + ' ' + m('V') + '<tspan font-size="15" dy="5">2</tspan>', { 'font-size': 24, fill: C.ink });
    t2(S.f4, 160, 418, 'どの ' + m('ν') + ' でも偏りのない推定量', '', { 'font-size': 16, fill: C.muted });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '分散が最小になる ' + m('ν'), '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 150, m('ν') + '* = ' + m('p') + '<tspan font-size="14" dy="5">1</tspan><tspan dy="-5">(1 − ' + m('α') + ') + ' + m('p') + '</tspan><tspan font-size="14" dy="5">0</tspan><tspan dy="-5"> ' + m('α') + '</tspan>', { 'font-size': 22, 'font-weight': 600, fill: C.b });
    t2(p4, PX, 186, m('α') + '：処置率', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 210, m('p') + '₁, ' + m('p') + '₀：処置時・非処置時の反応率', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 262, m('α') + ' = 0.5 なら', '', { 'font-size': 17, fill: C.ink });
    txt(p4, PX, 302, m('ν') + '* = Pr(' + m('Y') + ' = 1)', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 350, 'V1 では ST が、V2 では LC が', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 374, '平均すると打ち消し合う', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 6・7 と 7.3 節、付録 C の内容', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2021 · TECH REPORT';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'About evaluation metrics for';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'contextual uplift modeling';
    t2(g5, 480, 302, '文脈つきアップリフトモデリングの評価指標について', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Christophe Renaudin · Matthieu Martin';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/criteo-research/uplift_modeling_metric';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: walk through the 10 people, the curve follows
    var k = seg(t, 1.2, 6.2) * 10, n = Math.floor(k), f = k - n, P = [];
    for (var i = 0; i <= Math.min(n, 10); i++) P.push(S.sx(i) + ',' + S.sy(S.vals[i]));
    if (n < 10) P.push((S.sx(n) + f * 48) + ',' + S.sy(S.vals[n] + f * (S.vals[n + 1] - S.vals[n])));
    S.curve1.setAttribute('points', P.join(' '));
    S.ppl.forEach(function (o, i) { o.setAttribute('opacity', k >= 10 ? 1 : (i < n ? 0.55 : (i === n ? 1 : 0.3))); });
    S.base1.setAttribute('opacity', seg(t, 6.2, 6.8));
    S.p1.setAttribute('opacity', seg(t, 0.8, 1.6));
    // scene 2: draw the perfect model, then the worse model, then the areas
    S.u2.setAttribute('stroke-dashoffset', 1 - seg(t, 9, 11));
    S.n2.setAttribute('stroke-dashoffset', 1 - seg(t, 11.3, 13.3));
    S.p2.setAttribute('opacity', seg(t, 9, 9.6));
    S.a2.setAttribute('opacity', seg(t, 13.6, 14.3));
    // scene 3: curves morph from V1 to the weighted (expected) curves
    var s = seg(t, 17.6, 20.4);
    S.u3.setAttribute('points', pts(XS, U_V1.map(function (v, j) { return v + (U_W[j] - v) * s; })));
    S.n3.setAttribute('points', pts(XN, N_V1.map(function (v, j) { return v + (N_W[j] - v) * s; })));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.5));
    S.a3.setAttribute('opacity', seg(t, 20.6, 21.3));
    // scene 4: V1 grid, V2 grid, formula, optimum
    S.gr1.setAttribute('opacity', seg(t, 24.6, 25.3));
    S.gr2.setAttribute('opacity', seg(t, 26.2, 26.9));
    S.f4.setAttribute('opacity', seg(t, 27.8, 28.5));
    S.p4.setAttribute('opacity', seg(t, 29.2, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30.5 });
})();
