// =====================================================================
// teaser-scenes.js — Kalashnov, Munro, Sun, Du & Wager, "Treatment Allocation under Uncertain Costs"
// (arXiv 2103.11066), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are a schematic knapsack with explainer-chosen toy values (labelled 模式図).
// Scene 2 uses the numbers of the paper's Example 2 (ICU beds). Scene 4 uses Table 2 of arXiv v6.
// Colours: orange = ranking by treatment effect alone (ignoring cost); blue = priority score rho = tau_Y / tau_C.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;
  function lerp(a, b, k) { return a + (b - a) * k; }

  var CAPTIONS = [
    { ja: '効果の大きい順に並べて予算まで処置すると、<span class="A">費用の大きい人</span>に予算の多くを使ってしまうことがある。', en: '' },
    { ja: '病院の例では、効果が半分でも在室日数が 4 分の 1 の患者を優先すれば、救える人数は 2 倍になる。', en: '' },
    { ja: '論文の規則は<span class="B">効果の期待値 ÷ 費用の期待値</span>の大きい順に並べ、予算を使い切るまで処置する。', en: '' },
    { ja: '費用が予測できるシミュレーションでは、<span class="B">提案手法</span>の上積みが<span class="A">費用を無視する方法</span>の<span style="white-space:nowrap">約 2.8 倍</span>だった。', en: '' },
    { ja: '費用が人によって違うときは、効果と費用の期待値の比で優先度を決める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // toy items: [name, effect tau, cost c]; budget 11 (explainer-chosen values)
  var ITEMS = [['a', 6, 6], ['b', 5, 5], ['c', 4, 1], ['d', 3.5, 1.5], ['e', 3, 1], ['f', 2.5, 2], ['g', 2, 0.5], ['h', 1.5, 3]];
  var BYTAU = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];        // effect order
  var BYRHO = ['c', 'g', 'e', 'd', 'f', 'b', 'a', 'h'];        // ratio order (b before a on the tie)
  var U = 24, K = 20, GAP = 8, X0 = 70, TOPY = 236, BOTY = 452, BUDGET = 11;

  function layout(order) {   // x positions in the queue row
    var x = X0, pos = {};
    order.forEach(function (n) { var it = ITEMS.filter(function (q) { return q[0] === n; })[0]; pos[n] = x; x += it[2] * U + GAP; });
    return pos;
  }
  function packed(order) {   // which items fit, and their x in the budget frame
    var x = X0, used = 0, pos = {}, list = [];
    order.forEach(function (n) {
      var it = ITEMS.filter(function (q) { return q[0] === n; })[0];
      if (used + it[2] <= BUDGET + 1e-9) { pos[n] = x; x += it[2] * U; used += it[2]; list.push(n); }
    });
    return { pos: pos, list: list };
  }

  function knapsack(g, order, colour, S, key) {
    var q = layout(order), pk = packed(order), blocks = {};
    t2(g, X0, 64, '各人の効果（高さ）と費用（幅）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0 - 6, x2: 620, y1: TOPY, y2: TOPY, stroke: C.hair, 'stroke-width': 1.5 }, g);
    el('rect', { x: X0, y: BOTY - 140, width: BUDGET * U, height: 140, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, g);
    t2(g, X0, BOTY + 26, '予算 11', '', { 'font-size': 16, fill: C.ink });
    ITEMS.forEach(function (it) {
      var n = it[0], w = it[2] * U, h = it[1] * K;
      var r = el('rect', { x: 0, y: -h, width: w - 1, height: h, rx: 2, fill: C.gray }, g);
      blocks[n] = { r: r, x0: q[n], x1: pk.pos[n], in: pk.list.indexOf(n), h: h };
    });
    S[key] = { blocks: blocks, colour: colour, n: pk.list.length };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: effect order =====
    var g1 = S.g[0];
    knapsack(g1, BYTAU, C.a, S, 'k1');
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, '並べる基準：効果 ' + m('τ'), '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 160, '予算 11 で処置できるのは', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 186, '費用の大きい 2 人だけ', '', { 'font-size': 17, fill: C.ink });
    S.tot1 = el('g', {}, g1);
    t2(S.tot1, PX, 250, '効果の合計', '', { 'font-size': 16, fill: C.muted });
    txt(S.tot1, PX, 296, '11', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    t2(g1, 940, 520, '模式図（効果と費用は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: ICU example (paper's Example 2) =====
    var g2 = S.g[1];
    S.cards = [['A 型', '10%', 20, '0.5 人', 80, C.a], ['B 型', '5%', 5, '1 人', 350, C.b]].map(function (c) {
      var x = c[4], o = {};
      el('rect', { x: x, y: 70, width: 240, height: 390, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      t2(g2, x + 20, 112, c[0] + 'の患者', '', { 'font-size': 22, 'font-weight': 650, fill: c[5] });
      t2(g2, x + 20, 158, '生存確率の上昇 ' + c[1], '', { 'font-size': 17, fill: C.ink });
      el('rect', { x: x + 20, y: 170, width: parseInt(c[1], 10) * 16, height: 18, rx: 3, fill: c[5] }, g2);
      t2(g2, x + 20, 236, '在室日数 ' + c[2] + ' 日', '', { 'font-size': 17, fill: C.ink });
      o.days = el('rect', { x: x + 20, y: 248, width: 0, height: 18, rx: 3, fill: C.gray }, g2);
      o.full = c[2] * 10;
      o.res = el('g', {}, g2);
      t2(o.res, x + 20, 340, '100 床・1 日あたり', '', { 'font-size': 16, fill: C.muted });
      txt(o.res, x + 20, 392, c[3], { 'font-size': 40, 'font-weight': 650, fill: c[5] });
      t2(o.res, x + 20, 428, 'を救える', '', { 'font-size': 16, fill: C.ink });
      return o;
    });
    var p2 = el('g', {}, g2);
    t2(p2, PX, 130, 'ベッドが足りない病院', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 182, '効果で選ぶと A 型を優先', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 218, 'ベッド 1 日あたりの効果は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 244, 'B 型が 2 倍大きい', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '論文の例 2 の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: ratio order =====
    var g3 = S.g[2];
    knapsack(g3, BYRHO, C.b, S, 'k3');
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 116, m('ρ') + ' = ' + m('τ') + '<tspan font-size="20" dy="6">Y</tspan><tspan dy="-6"> / </tspan>' + m('τ') + '<tspan font-size="20" dy="6">C</tspan>', { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 156, '効果の期待値 ÷ 費用の期待値', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 200, '比の大きい順に処置し、', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 226, '予算を使い切ったら止める', '', { 'font-size': 17, fill: C.ink });
    S.tot3 = el('g', {}, g3);
    t2(S.tot3, PX, 282, '同じ予算 11 で 6 人、効果の合計', '', { 'font-size': 16, fill: C.muted });
    txt(S.tot3, PX, 328, '20', { 'font-size': 40, 'font-weight': 650, fill: C.b });
    txt(S.tot3, PX + 60, 328, '（効果順では 11）', { 'font-size': 16, fill: C.a });
    t2(g3, 940, 520, '模式図（効果と費用は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 2 (arXiv v6), lift at budget 1, n = 500 =====
    var g4 = S.g[3];
    var rows = [['Instrumental Forest', 0.496, C.b], ['Linear Parametric', 0.494, C.b], ['Direct Ratio', 0.412, C.gray],
                ['Ignore Costs', 0.179, C.a], ['Hoch et al. (2002)', 0.497, C.gray], ['Sun (2021)', 0.332, C.gray]];
    var BX0 = 250, BX1 = 560, HI = 0.6, Y0 = 120, DY = 52;
    function bx(v) { return BX0 + v / HI * (BX1 - BX0); }
    t2(g4, 70, 62, '無作為な割り当てに対する上積み', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 0.2, 0.4, 0.6].forEach(function (v) {
      el('line', { x1: bx(v), x2: bx(v), y1: Y0 - 30, y2: Y0 + DY * 5 + 28, stroke: C.hair }, g4);
      el('text', { x: bx(v), y: Y0 + DY * 5 + 54, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: BX0 - 14, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.bar = el('rect', { x: BX0, y: y - 13, width: 0, height: 26, rx: 3, fill: rw[2] }, g4);
      o.lab = el('text', { x: bx(rw[1]) + 8, y: y + 6, 'font-size': 15, fill: C.ink }, g4); o.lab.textContent = rw[1].toFixed(3);
      o.full = bx(rw[1]) - BX0; o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '予算 1、学習データ 500 件', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 160, '0.496', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    txt(p4, PX + 104, 160, '対', { 'font-size': 18, fill: C.ink });
    txt(p4, PX + 134, 160, '0.179', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 214, '優先度順の手法は毎回', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 238, 'ちょうど予算 1 を使う', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 280, 'Hoch et al. は上積みが同程度', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 304, 'だが、支出がばらつく', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 2（arXiv v6）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2021';
    el('text', { x: 480, y: 214, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Treatment Allocation';
    el('text', { x: 480, y: 260, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'under Uncertain Costs';
    t2(g5, 480, 304, '費用が不確実な処置の割り当て', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Georgy Kalashnov · Evan Munro · Hao Sun · Shuyang Du · Stefan Wager';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2103.11066';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  // blocks start in the queue row, the selected ones turn colour and drop into the budget frame one by one
  function renderKnap(k, t, tStart) {
    Object.keys(k.blocks).forEach(function (n) {
      var b = k.blocks[n], x = b.x0, y = TOPY, fill = C.gray, op = 1;
      if (b.in >= 0) {
        var s = seg(t, tStart + b.in * 0.55, tStart + b.in * 0.55 + 0.6);
        x = lerp(b.x0, b.x1, s); y = lerp(TOPY, BOTY, s);
        fill = H.mix(C.gray, k.colour, seg(t, tStart + b.in * 0.55 - 0.3, tStart + b.in * 0.55));
      } else {
        op = 1 - 0.5 * seg(t, tStart + k.n * 0.55 + 0.4, tStart + k.n * 0.55 + 1);
      }
      b.r.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      b.r.setAttribute('fill', fill); b.r.setAttribute('opacity', op);
    });
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    renderKnap(S.k1, t, 2);
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    S.tot1.setAttribute('opacity', seg(t, 4, 4.6));
    // scene 2
    S.cards.forEach(function (o, i) {
      o.days.setAttribute('width', o.full * seg(t, 9.6 + i * 0.6, 11.4 + i * 0.6));
      o.res.setAttribute('opacity', seg(t, 12.4 + i * 0.5, 13 + i * 0.5));
    });
    // scene 3
    renderKnap(S.k3, t, 18);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    S.tot3.setAttribute('opacity', seg(t, 21.6, 22.2));
    // scene 4
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.6);
      o.bar.setAttribute('width', o.full * s); o.lab.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
