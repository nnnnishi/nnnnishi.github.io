// =====================================================================
// teaser-scenes.js — Betlei, Diemert & Amini (KDD 2021), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 1 (arXiv v1, 2020-12-17).
// Colours: orange = per-individual error training / CV tuning; blue = ranking losses, AUUC bound, AUUC-max.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'ITE モデルは<span class="A">一人ずつの予測誤差</span>で学習するが、使うときは予測の大きい順に並べて上位から処置する。', en: '' },
    { ja: '予測誤差が同じでも並び順は変わりうるので、誤差を減らしても AUUC がよくなるとは限らない。', en: '' },
    { ja: 'AUUC は処置群と、ラベルを反転した対照群のそれぞれで<span class="B">ペアを逆順に並べた割合</span>の重み付き和で書ける。', en: '' },
    { ja: 'Hillstrom では、<span class="B">AUUC-max</span> の AUUC はベースラインで SDR に次ぎ、学習時間は最も短かった。', en: '' },
    { ja: '評価に使う AUUC の下界を、学習の目的関数にもハイパーパラメータ選びにも使う。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: people sorted by predicted ITE, top 30% treated =====
    var g1 = S.g[0];
    var preds = [0.42, 0.37, 0.33, 0.26, 0.21, 0.17, 0.12, 0.08, 0.05, 0.02];
    S.bars1 = [];
    t2(g1, 90, 52, '次の集団（予測した効果の大きい順）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    preds.forEach(function (v, i) {
      var y = 78 + i * 40;
      el('circle', { cx: 104, cy: y + 12, r: 10, fill: C.gray }, g1);
      S.bars1.push(el('rect', { x: 130, y: y, width: v * 1050, height: 24, rx: 4, fill: C.gray }, g1));
    });
    S.cut1 = el('line', { x1: 80, x2: 600, y1: 0, y2: 0, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g1);
    S.cutLab1 = t2(g1, 598, 0, '上位 30% に処置', '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '学習', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 148, '一人ずつの予測誤差を', '', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    t2(p1, PX, 174, '小さくする', '', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    t2(p1, PX, 226, '使い方', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 254, '予測の大きい順に並べ、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 280, '上位から処置する', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 332, '評価', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 360, 'AUUC（並び順で決まる）', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: same error, different order =====
    var g2 = S.g[1];
    var truth = [0.40, 0.30, 0.20, 0.10];
    var models = [['モデル X', [0.46, 0.36, 0.14, 0.04], 70], ['モデル Y', [0.34, 0.36, 0.26, 0.04], 350]];
    var U = 340;  // px per unit of effect
    S.models = models.map(function (md) {
      var x = md[2], o = { bars: [] };
      el('rect', { x: x, y: 60, width: 260, height: 400, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
      t2(g2, x + 20, 98, md[0], '', { 'font-size': 21, 'font-weight': 650, fill: C.ink });
      ['A', 'B', 'C', 'D'].forEach(function (nm, i) {
        var y = 130 + i * 62;
        txt(g2, x + 20, y + 20, nm, { 'font-size': 17, 'font-weight': 600, fill: C.ink });
        el('rect', { x: x + 48, y: y, width: truth[i] * U, height: 10, rx: 2, fill: C.gray }, g2);
        o.bars.push(el('rect', { x: x + 48, y: y + 14, width: 0, height: 14, rx: 3, fill: C.a }, g2));
        o.bars[i].full = md[1][i] * U;
      });
      var rank = md[1].map(function (v, i) { return i; }).sort(function (a, b) { return md[1][b] - md[1][a]; })
        .map(function (i) { return ['A', 'B', 'C', 'D'][i]; }).join(' › ');
      o.err = t2(g2, x + 20, 400, '誤差はどれも ±0.06', '', { 'font-size': 16, fill: C.ink });
      o.ord = t2(g2, x + 20, 432, '並び：' + rank, '', { 'font-size': 17, 'font-weight': 650, fill: md[0] === 'モデル X' ? C.ink : C.a });
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    el('rect', { x: PX, y: 112, width: 30, height: 10, rx: 2, fill: C.gray }, p2);
    t2(p2, PX + 40, 122, '真の効果', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 140, width: 30, height: 14, rx: 3, fill: C.a }, p2);
    t2(p2, PX + 40, 153, '予測', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 210, '予測誤差（RMSE）は', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 236, 'どちらも 0.06。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 280, 'Y では A と B の順が', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 306, '入れ替わり、AUUC が変わる。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: treated pairs and label-reverted control pairs =====
    var g3 = S.g[2];
    el('line', { x1: 80, y1: 470, x2: 80, y2: 80, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    t2(g3, 92, 84, 'スコア ' + m('f') + '(' + m('x') + ') ↑', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: 130, y: 110, width: 200, height: 370, rx: 12, fill: C.panel }, g3);
    el('rect', { x: 380, y: 110, width: 220, height: 370, rx: 12, fill: C.panel }, g3);
    t2(g3, 230, 140, '処置群', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.ctlTitle = t2(g3, 490, 140, '対照群', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    S.ctlTitle2 = t2(g3, 490, 140, '対照群（ラベル反転）', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    // treated: positives high, negatives low; control: non-responders high
    var tPts = [[200, 190, 1], [260, 240, 1], [190, 330, 0], [250, 400, 0], [215, 445, 0]];
    var cPts = [[450, 190, 0], [520, 250, 0], [460, 340, 1], [530, 410, 1], [480, 455, 0]];
    S.pairs = [];
    function pairs(pts, flip) {
      pts.forEach(function (p) {
        pts.forEach(function (q) {
          var pp = flip ? 1 - p[2] : p[2], qq = flip ? 1 - q[2] : q[2];
          if (pp === 1 && qq === 0) S.pairs.push({ e: el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: p[1] < q[1] ? C.b : C.a, 'stroke-width': 2, opacity: 0 }, g3), flip: flip });
        });
      });
    }
    pairs(tPts, false); pairs(cPts, true);
    tPts.forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 12, fill: p[2] ? C.b : '#fff', stroke: p[2] ? C.b : C.ink, 'stroke-width': 2 }, g3);
    });
    S.cDots = cPts.map(function (p) {
      return { y: p[2], c: el('circle', { cx: p[0], cy: p[1], r: 12, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g3) };
    });
    var p3 = S.p3 = el('g', {}, g3);
    el('circle', { cx: PX + 10, cy: 116, r: 10, fill: C.b }, p3);
    t2(p3, PX + 28, 122, '正例（反応した）', '', { 'font-size': 16, fill: C.ink });
    el('circle', { cx: PX + 10, cy: 148, r: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, p3);
    t2(p3, PX + 28, 154, '負例', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 200, '対照群は 0 と 1 を入れ替える', '', { 'font-size': 16, fill: C.ink });
    el('line', { x1: PX, x2: PX + 30, y1: 236, y2: 236, stroke: C.b, 'stroke-width': 3 }, p3);
    t2(p3, PX + 40, 242, '正しい順のペア', '', { 'font-size': 16, fill: C.ink });
    el('line', { x1: PX, x2: PX + 30, y1: 268, y2: 268, stroke: C.a, 'stroke-width': 3 }, p3);
    t2(p3, PX + 40, 274, '逆順のペア', '', { 'font-size': 16, fill: C.ink });
    txt(p3, PX, 336, 'AUUC = ' + m('γ') + ' − ' + m('λ') + '<tspan dy="-8" font-size="13">T</tspan><tspan dy="8">' + m('R̂') + '</tspan><tspan dy="-8" font-size="13">T</tspan><tspan dy="8"> − </tspan>' + m('λ') + '<tspan dy="-8" font-size="13">C</tspan><tspan dy="8">' + m('R̂') + '</tspan><tspan dy="-8" font-size="13">C</tspan>', { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    t2(p3, PX, 382, m('R̂') + '：逆順のペアの割合', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 406, '（C は反転後の対照群、期待値で）', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（点は架空の人）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 1 (arXiv v1), test AUUC on Hillstrom =====
    var g4 = S.g[3];
    var rows = [
      ['AUUC-max (s_poly)', .03065, 1, .00612], ['SDR', .03079, 0, .00633], ['PCG', .03063, 0, 0], ['SVM-DP', .03047, 0, .00606],
      ['TARNet', .03044, 0, .00626], ['TM', .03019, 0, .00652], ['GANITE', .02916, 0, .00818], ['MML', .02222, 0, .00869]
    ];
    var X0 = 250, X1 = 600, LO = .012, HI = .040, Y0 = 100, DY = 46;
    function cx(v) { return X0 + (v - LO) / (HI - LO) * (X1 - X0); }
    t2(g4, 70, 52, 'テスト AUUC（Hillstrom、100 回の分割の平均）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [.015, .020, .025, .030, .035, .040].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 24, y2: Y0 + DY * 7 + 22, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: Y0 + DY * 7 + 48, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v.toFixed(3).slice(1);
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {};
      el('text', { x: X0 - 16, y: y + 5, 'font-size': 15, fill: rw[2] ? C.b : C.ink, 'font-weight': rw[2] ? 650 : 400, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.ln = el('line', { x1: cx(rw[1] - rw[3]), x2: cx(rw[1] + rw[3]), y1: y, y2: y, stroke: rw[2] ? C.b : C.gray, 'stroke-width': 3 }, g4);
      o.d = el('circle', { cx: cx(rw[1]), cy: y, r: 9, fill: rw[2] ? C.b : C.muted }, g4);
      o.t0 = 25 + i * 0.5;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, 'AUUC-max（' + m('s') + '<tspan dy="5" font-size="12">poly</tspan><tspan dy="-5">）</tspan>', '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 140, 'パラメータ 23 個', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 166, '学習時間 0.17 倍（TM = 1）', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 216, 'SDR', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 246, 'パラメータ 67 個', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 272, '学習時間 1.10 倍', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 326, '横線は ±2σ（PCG は', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 350, '元論文の値で幅なし）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1（arXiv v1）の数値から作図。8 手法を抜粋', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 160, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'KDD 2021';
    el('text', { x: 480, y: 222, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Uplift Modeling with';
    el('text', { x: 480, y: 266, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Generalization Guarantees';
    t2(g5, 480, 312, '汎化の保証つきのアップリフトモデリング', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 362, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Artem Betlei · Eustache Diemert · Massih-Reza Amini';
    el('text', { x: 480, y: 416, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3447548.3467395';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: cut line slides down to after the 3rd person, top bars turn dark
    var yc = 70 + seg(t, 1.2, 3.5) * (78 + 3 * 40 - 8 - 70);
    S.cut1.setAttribute('y1', yc); S.cut1.setAttribute('y2', yc);
    S.cut1.setAttribute('opacity', seg(t, 1, 1.4));
    S.cutLab1.setAttribute('transform', 'translate(0,' + (yc + 22) + ')');
    S.cutLab1.setAttribute('opacity', seg(t, 3.3, 3.9));
    S.bars1.forEach(function (b, i) {
      b.setAttribute('fill', i < 3 ? H.mix(C.gray, C.ink, seg(t, 3.6 + i * 0.25, 4.1 + i * 0.25)) : C.gray);
    });
    S.p1.setAttribute('opacity', seg(t, 1.5, 2.3));
    // scene 2: prediction bars grow, then the orders
    S.models.forEach(function (o, k) {
      o.bars.forEach(function (b, i) { b.setAttribute('width', b.full * seg(t, 9 + k * 1.2 + i * 0.2, 10 + k * 1.2 + i * 0.2)); });
      o.err.setAttribute('opacity', seg(t, 11.8, 12.4));
      o.ord.setAttribute('opacity', seg(t, 12.6, 13.2));
    });
    S.p2.setAttribute('opacity', seg(t, 9, 9.8));
    // scene 3: control labels flip, then pairs are drawn
    var f = seg(t, 18, 19);
    S.ctlTitle.setAttribute('opacity', 1 - f); S.ctlTitle2.setAttribute('opacity', f);
    S.cDots.forEach(function (d) {
      var on = f < 0.5 ? d.y : 1 - d.y;
      d.c.setAttribute('fill', on ? C.b : '#fff');
      d.c.setAttribute('stroke', on ? C.b : C.ink);
    });
    S.pairs.forEach(function (p) { p.e.setAttribute('opacity', 0.75 * seg(t, p.flip ? 19.6 : 17, p.flip ? 20.4 : 17.8)); });
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: rows appear in order, then the side panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.5);
      o.d.setAttribute('opacity', s); o.ln.setAttribute('opacity', s);
    });
    S.p4.setAttribute('opacity', seg(t, 29.2, 30));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
