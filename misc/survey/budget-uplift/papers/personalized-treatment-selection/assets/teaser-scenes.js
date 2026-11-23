// =====================================================================
// teaser-scenes.js — Tu et al. (WWW 2021), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); the email-tone example in
// scene 2 follows the paper's introduction, but its numbers are the explainer's. Scene 4 uses the numbers
// printed in Table 4 (arXiv v4).
// Colours: orange = global allocation / hand-made cohorts; blue = the paper's personalised selection.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'A/B テストでは、全体で最も成績のよい処置を<span class="A">全員に適用する</span>のが普通である。', en: '' },
    { ja: '効果が人によって違うと、一律の選択ではどこかのコホートが損をする。', en: '' },
    { ja: '論文の方法はコホートごとの効果を推定し、<span class="B">ガードレール指標の上限を守る範囲で</span>処置を選ぶ。', en: '' },
    { ja: 'LinkedIn の通知上限では、<span class="B">個別化</span>がセッションを最も伸ばし、無効化を増やさなかった。', en: '' },
    { ja: '平均効果で 1 つを選ぶのをやめ、効果の違いと制約から割当てを決める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column
  var U = 26;     // scene 2: px per unit of toy effect

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: average effects of three variants, the winner goes to everyone =====
    var g1 = S.g[0];
    t2(g1, 80, 60, '平均効果（A/B テスト）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var avg = [1.0, 2.2, 1.6];
    el('line', { x1: 80, x2: 330, y1: 400, y2: 400, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    S.bars1 = avg.map(function (v, i) {
      var x = 100 + i * 78;
      t2(g1, x + 26, 428, '処置 ' + (i + 1), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return { r: el('rect', { x: x, y: 400, width: 52, height: 0, fill: C.gray, rx: 3 }, g1), h: v * 120, win: i === 1 };
    });
    S.dots1 = [];
    for (var r1 = 0; r1 < 6; r1++) for (var c1 = 0; c1 < 6; c1++) {
      S.dots1.push(el('circle', { cx: 400 + c1 * 34, cy: 160 + r1 * 40, r: 11, fill: C.gray }, g1));
    }
    S.lab1 = t2(g1, 485, 120, '全員に処置 2', '', { 'font-size': 18, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '1. 処置ごとの平均効果を比べる', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 190, '2. 最もよい 1 つを全員に適用', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 250, '論文の呼び名：', '', { 'font-size': 15, fill: C.muted });
    txt(p1, PX, 276, 'global allocation', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: two cohorts, different best variants (paper's e-mail tone example; toy numbers) =====
    var g2 = S.g[1];
    S.cards = [['若い利用者（7 割）', [3, 1], 90], ['年配の利用者（3 割）', [-1, 2], 350]].map(function (c) {
      var x = c[2], o = { bars: [] }, z = x + 125;
      el('rect', { x: x, y: 70, width: 240, height: 390, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      t2(g2, x + 20, 110, c[0], '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
      el('line', { x1: z, x2: z, y1: 140, y2: 280, stroke: C.ink, 'stroke-width': 1.2 }, g2);
      ['くだけた文体', '改まった文体'].forEach(function (nm, k) {
        var v = c[1][k], y = 172 + k * 70;
        t2(g2, x + 20, y - 10, nm, '', { 'font-size': 15, fill: C.ink });
        var best = v === Math.max.apply(null, c[1]);
        o.bars.push({ r: el('rect', { x: z, y: y, width: 0, height: 20, rx: 3, fill: best ? C.b : C.gray }, g2), v: v, z: z });
        o.bars[k].t = txt(g2, v > 0 ? z + v * U + 8 : z + 8, y + 16, (v > 0 ? '+' : '−') + Math.abs(v), { 'font-size': 15, fill: C.ink });
      });
      var same = c[1][0] >= c[1][1];
      o.res = t2(g2, x + 20, 336, '一律：くだけた文体 → ' + (c[1][0] > 0 ? '+' : '−') + Math.abs(c[1][0]), '', { 'font-size': 16, 'font-weight': 650, fill: C.a });
      o.res2 = t2(g2, x + 20, 368, same ? '最良と同じ' : '最良なら改まった文体 → +' + c[1][1], '', { 'font-size': 16, 'font-weight': 650, fill: same ? C.muted : C.b });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '全体の平均効果', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 166, 'くだけた文体 1.8', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 196, '改まった文体 1.3', '', { 'font-size': 18, fill: C.ink });
    t2(p2, PX, 250, '平均は多数派に引っ張られ、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 276, '一律割当てでは年配の', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 302, '利用者が損をする。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（効果の値と人数比は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: causal-tree cohorts, then optimisation under a guardrail limit =====
    var g3 = S.g[2];
    var FX0 = 80, FX1 = 380, FY0 = 90, FY1 = 430, VX = 230, LY = 270, RY = 210;
    el('rect', { x: FX0, y: FY0, width: FX1 - FX0, height: FY1 - FY0, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
    t2(g3, FX0, 70, '会員（因果木でコホートに分ける）', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var r = rng(7); S.pts3 = [];
    for (var i = 0; i < 60; i++) {
      var px = FX0 + 16 + r() * (FX1 - FX0 - 32), py = FY0 + 16 + r() * (FY1 - FY0 - 32);
      S.pts3.push({ c: el('circle', { cx: px, cy: py, r: 7, fill: C.gray }, g3), k: r() });
    }
    S.split = [
      el('line', { x1: VX, x2: VX, y1: FY0, y2: FY1, stroke: C.ink, 'stroke-width': 2.5 }, g3),
      el('line', { x1: FX0, x2: VX, y1: LY, y2: LY, stroke: C.ink, 'stroke-width': 2.5 }, g3),
      el('line', { x1: VX, x2: FX1, y1: RY, y2: RY, stroke: C.ink, 'stroke-width': 2.5 }, g3)
    ];
    var cells = [[(FX0 + VX) / 2, (FY0 + LY) / 2, '処置 3'], [(FX0 + VX) / 2, (LY + FY1) / 2, '処置 1'],
                 [(VX + FX1) / 2, (FY0 + RY) / 2, '処置 2'], [(VX + FX1) / 2, (RY + FY1) / 2, '処置 2 と 3']];
    S.cellLab = cells.map(function (c) {
      var g = el('g', {}, g3);
      el('rect', { x: c[0] - 52, y: c[1] - 17, width: 104, height: 30, rx: 6, fill: C.b }, g);
      t2(g, c[0], c[1] + 4, c[2], '', { 'font-size': 15, 'font-weight': 600, fill: '#fff', 'text-anchor': 'middle' });
      return g;
    });
    // meters
    var MB = 430, MX = [440, 530];
    el('line', { x1: 420, x2: 600, y1: MB, y2: MB, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    S.mMain = el('rect', { x: MX[0], y: MB, width: 50, height: 0, rx: 3, fill: C.b }, g3);
    S.mGuard = el('rect', { x: MX[1], y: MB, width: 50, height: 0, rx: 3, fill: C.gray }, g3);
    t2(g3, MX[0] + 25, 456, '主指標', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    t2(g3, MX[1] + 25, 456, 'ガードレール', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    el('line', { x1: MX[1] - 10, x2: MX[1] + 60, y1: MB - 200, y2: MB - 200, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g3);
    txt(g3, MX[1] + 25, MB - 210, '上限 ' + m('c') + '<tspan font-size="12" dy="4">k</tspan>', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 130, '1. 因果木でコホートを作る', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 170, '2. コホートごとに効果と', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 20, 196, '分散を推定する', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 236, '3. 上限を守る範囲で、', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX + 20, 262, '割当て確率を最適化する', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 316, '割当ては確率なので、1 つの', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 340, 'コホートに複数の処置を混ぜてよい。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点は架空の会員）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 4 (arXiv v4), ATE % vs the global cap; null = Neutral =====
    var g4 = S.g[3];
    var rows = [['セッション', [1.39, 1.31, 0.54]], ['通知の送信数', [1.64, 6.62, 3.07]],
                ['クリック率', [-1.24, -1.73, -1.18]], ['通知の無効化', [null, 9.23, null]]];
    var X0 = 220, X1 = 600, LO = -2, HI = 10, Y0 = 92, GH = 94, BH = 22;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 58, '一律の上限に対する変化率', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [-2, 0, 2, 4, 6, 8, 10].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 12, y2: Y0 + GH * 4 - 12, stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      el('text', { x: cx(v), y: Y0 + GH * 4 + 10, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
    });
    var sty = [{ fill: C.b }, { fill: C.a }, { fill: '#fff', stroke: C.a, 'stroke-width': 2 }];
    S.bars4 = [];
    rows.forEach(function (rw, i) {
      var y = Y0 + GH * i;
      t2(g4, X0 - 14, y + 40, rw[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      rw[1].forEach(function (v, j) {
        var yy = y + j * (BH + 3), o = { t0: 25 + i * 0.9 + j * 0.15 };
        if (v === null) { o.lab = t2(g4, cx(0) + 6, yy + 16, '中立', '', { 'font-size': 14, fill: C.muted }); S.bars4.push(o); return; }
        o.v = v;
        o.r = el('rect', Object.assign({ x: cx(0), y: yy, width: 0, height: BH }, sty[j]), g4);
        o.lab = el('text', { x: Math.max(cx(v), cx(0)) + 6, y: yy + 16, 'font-size': 14, fill: C.ink }, g4);
        o.lab.textContent = (v > 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '%';
        S.bars4.push(o);
      });
    });
    S.cx = cx;
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 92, width: 18, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 28, 107, '個別化上限（提案）', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 122, width: 18, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX + 28, 137, 'Heuristic Cap A', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX + 1, y: 153, width: 16, height: 16, rx: 3, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, p4);
    t2(p4, PX + 28, 167, 'Heuristic Cap B', '', { 'font-size': 16, fill: C.ink });
    var p4b = S.p4b = el('g', {}, g4);
    t2(p4b, PX, 222, 'セッション', '', { 'font-size': 15, fill: C.muted });
    txt(p4b, PX, 256, '+1.39%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(p4b, PX + 128, 254, '無効化は中立', '', { 'font-size': 15, fill: C.ink });
    t2(p4b, PX, 306, 'Heuristic A は無効化が', '', { 'font-size': 15, fill: C.ink });
    txt(p4b, PX, 340, '+9.23%', { 'font-size': 26, 'font-weight': 650, fill: C.a });
    t2(p4b, PX, 384, 'ヒューリスティックは訪問頻度で', '', { 'font-size': 14, fill: C.muted });
    t2(p4b, PX, 406, '4 つに分けて上限を手で選んだもの', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4（arXiv v4）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'THE WEB CONFERENCE (WWW) · 2021';
    el('text', { x: 480, y: 202, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Personalized Treatment Selection';
    el('text', { x: 480, y: 246, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'using Causal Heterogeneity';
    t2(g5, 480, 292, '因果効果の異質性にもとづく個別の処置選択', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Ye Tu · Kinjal Basu · Cyrus DiCiccio · Romil Bansal';
    el('text', { x: 480, y: 366, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Preetam Nandy · Padmini Jaikumar · Shaunak Chatterjee';
    el('text', { x: 480, y: 418, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/tuye0305/prophet';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: bars grow, the winner turns orange, then every dot turns orange
    S.bars1.forEach(function (o, i) {
      var h = o.h * seg(t, 0.8 + i * 0.3, 2.2 + i * 0.3);
      o.r.setAttribute('y', 400 - h); o.r.setAttribute('height', h);
      o.r.setAttribute('fill', o.win ? H.mix(C.gray, C.a, seg(t, 3, 3.6)) : C.gray);
    });
    S.dots1.forEach(function (d, i) { d.setAttribute('fill', H.mix(C.gray, C.a, seg(t, 3.8 + i * 0.05, 4.3 + i * 0.05))); });
    S.lab1.setAttribute('opacity', seg(t, 4.2, 4.8));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scene 2: bars grow, then the verdicts
    S.cards.forEach(function (o, i) {
      o.bars.forEach(function (b, k) {
        var s = seg(t, 9 + i * 0.6 + k * 0.3, 10.4 + i * 0.6 + k * 0.3), w = Math.abs(b.v) * U * s;
        b.r.setAttribute('width', w); b.r.setAttribute('x', b.v > 0 ? b.z : b.z - w);
        b.t.setAttribute('opacity', seg(t, 10.6, 11));
      });
      o.res.setAttribute('opacity', seg(t, 12, 12.6));
      o.res2.setAttribute('opacity', seg(t, 12.8, 13.4));
    });
    S.p2.setAttribute('opacity', seg(t, 11, 11.8));
    // scene 3: splits draw, cohorts get labels, then meters fill
    var sp = [seg(t, 16.8, 17.6), seg(t, 17.6, 18.3), seg(t, 18.3, 19)];
    S.split[0].setAttribute('y2', 90 + 340 * sp[0]);
    S.split[1].setAttribute('x2', 80 + 150 * sp[1]);
    S.split[2].setAttribute('x2', 230 + 150 * sp[2]);
    S.split.forEach(function (l, i) { l.setAttribute('opacity', sp[i] > 0 ? 1 : 0); });
    S.cellLab.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 19.2 + i * 0.25, 19.7 + i * 0.25)); });
    S.pts3.forEach(function (q) { q.c.setAttribute('fill', H.mix(C.gray, '#9DB5EE', seg(t, 19.2 + q.k, 19.7 + q.k))); });
    var mm = seg(t, 20.6, 22.4);
    S.mMain.setAttribute('y', 430 - 270 * mm); S.mMain.setAttribute('height', 270 * mm);
    S.mGuard.setAttribute('y', 430 - 196 * mm); S.mGuard.setAttribute('height', 196 * mm);
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4: bars grow in order, then the highlights
    S.bars4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.6);
      if (o.r) {
        var x0 = S.cx(0), x1 = S.cx(o.v * s);
        o.r.setAttribute('x', Math.min(x0, x1)); o.r.setAttribute('width', Math.abs(x1 - x0));
      }
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 24.8, 25.4));
    S.p4b.setAttribute('opacity', seg(t, 29.2, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
