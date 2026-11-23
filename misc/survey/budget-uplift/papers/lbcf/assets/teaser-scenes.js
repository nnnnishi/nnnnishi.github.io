// =====================================================================
// teaser-scenes.js — LBCF (WWW 2022). Player: teaser-engine.js.
// Scenes 1-3 use the six users of the paper's Table 1 (budget B = 6).
// Scene 3 applies the paper's selection rule and bisection (Alg. 2) to that table: explainer's calculation.
// Scene 4 uses the last-day online A/B numbers printed in Section 5.3 (7.79 / 6.87 / 5.31 %).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'ROI 貪欲方策は、各ユーザーで ROI が最大の処置を選び、<span class="A">ROI の高い順</span>に予算 6 まで配る。合計は 92。', en: '' },
    { ja: 'ユーザー1に処置2を出し、ユーザー4には出さなければ、同じ予算で<span class="B">合計 98</span> になる。', en: '' },
    { ja: 'LBCF は各ユーザーで θ − λc が最大の処置を選び、<span class="B">λ を二分探索</span>で予算に合わせる。この例では合計 98 の選び方になる。', en: '' },
    { ja: 'オンライン A/B テストの最終日、参加時間の伸び率は LBCF が最も高かった。', en: '' },
    { ja: '1つのフォレストで全処置の効果を推定し、<span class="B">λ ひとつ</span>で予算内の処置を選ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  var U = [[20, 1, 30, 2], [15, 1, 36, 2], [15, 1, 32, 2], [4, 1, 2, 2], [3, 1, 6, 2], [2, 1, 2, 2]], B = 6;
  var GREEDY = [[0, 1], [1, 2], [2, 2], [3, 1]];          // ROI order 20, 18, 16, 4
  var STEPS = [[16.8, 0, 20, 10], [18.6, 10, 20, 5], [20.4, 5, 10, 7.5], [22.0, 7.5, 10, 8.75]]; // t, lo, hi, mid (before update)
  var LO_HI = [[0, 20], [0, 10], [5, 10], [7.5, 10], [8.75, 10]];

  function pick(l) {   // the paper's selection rule j* at lambda l
    return U.map(function (u) {
      var v1 = u[0] - l * u[1], v2 = u[2] - l * u[3], m = Math.max(v1, v2);
      return m > 0 ? (v1 >= v2 ? 1 : 2) : 0;
    });
  }
  function totals(sel) {
    var c = 0, v = 0;
    sel.forEach(function (j, i) { if (j) { c += U[i][2 * j - 1]; v += U[i][2 * j - 2]; } });
    return [c, v];
  }

  function build(svg) {
    var S = {};
    // ===== table (scenes 1-3) =====
    var gT = S.gT = el('g', { transform: 'translate(0,-28)' }, svg);
    var X1 = 175, X2 = 395, W = 200, Y0 = 112, DY = 60, RH = 46;
    t2(gT, X1 + W / 2, 92, '処置1', '', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'middle' });
    t2(gT, X2 + W / 2, 92, '処置2', '', { 'font-size': 17, 'font-weight': 600, fill: C.muted, 'text-anchor': 'middle' });
    S.cells = []; S.rowLab = []; S.out = [];
    U.forEach(function (u, i) {
      var y = Y0 + i * DY;
      S.rowLab.push(t2(gT, 70, y + 29, 'ユーザー' + (i + 1), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink }));
      var row = [];
      [0, 1].forEach(function (k) {
        var x = k ? X2 : X1;
        var r = el('rect', { x: x, y: y, width: W, height: RH, rx: 8, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, gT);
        var tx = el('text', { x: x + W / 2, y: y + 29, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, gT);
        tx.innerHTML = '<tspan ' + MI + '>θ</tspan> ' + u[2 * k] + '　<tspan ' + MI + '>c</tspan> ' + u[2 * k + 1] + '　ROI ' + (u[2 * k] / u[2 * k + 1]);
        row.push(r);
      });
      S.cells.push(row);
      S.out.push(t2(gT, 610, y + 29, '予算切れ', '', { 'font-size': 15, fill: C.muted }));
    });
    t2(gT, 70, 500, '論文 Table 1 の6人の例（予算 <tspan ' + MI + '>B</tspan> = 6）', '', { 'font-size': 15, fill: C.muted });
    S.calcNote = t2(gT, 70, 524, 'λ の二分探索は論文の式を当てはめた解説者の計算', '', { 'font-size': 15, fill: C.muted });

    // right panel: budget meter + total (scenes 1-3)
    var PX = 700;
    t2(gT, PX, 110, '使った予算', '', { 'font-size': 16, fill: C.muted });
    S.meter = [];
    for (var k = 0; k < 7; k++) S.meter.push(el('rect', { x: PX + k * 34, y: 124, width: 30, height: 26, rx: 4, fill: C.panel }, gT));
    S.costTx = el('text', { x: PX, y: 182, 'font-size': 20, 'font-weight': 600, fill: C.ink }, gT);
    t2(gT, PX, 228, '効果の合計', '', { 'font-size': 16, fill: C.muted });
    S.valTx = el('text', { x: PX, y: 288, 'font-size': 56, 'font-weight': 650, fill: C.ink }, gT);
    // lambda line (scene 3)
    var gL = S.gL = el('g', {}, gT);
    var LX0 = PX, LX1 = PX + 230, LY = 380;
    S.lx = function (l) { return LX0 + (LX1 - LX0) * l / 20; };
    el('line', { x1: LX0, y1: LY, x2: LX1, y2: LY, stroke: C.ink, 'stroke-width': 1.5 }, gL);
    [0, 10, 20].forEach(function (v) {
      el('line', { x1: S.lx(v), y1: LY - 5, x2: S.lx(v), y2: LY + 5, stroke: C.ink }, gL);
      el('text', { x: S.lx(v), y: LY + 24, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, gL).textContent = v;
    });
    S.band = el('rect', { x: LX0, y: LY - 9, width: 10, height: 18, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5, rx: 3 }, gL);
    S.mark = el('circle', { cx: LX0, cy: LY, r: 7, fill: C.b }, gL);
    S.lamTx = el('text', { x: PX, y: 345, 'font-size': 22, 'font-weight': 650, fill: C.b }, gL);
    S.dTx = el('text', { x: PX, y: 440, 'font-size': 16, fill: C.ink }, gL);
    S.dTx2 = el('text', { x: PX, y: 466, 'font-size': 16, fill: C.muted }, gL);

    // ===== scene 4: bars =====
    var g4 = S.g4 = el('g', {}, svg);
    var BX = 300, SC = 68;
    t2(g4, 70, 100, '対照群に対する参加時間の伸び率（オンライン A/B テストの最終日）', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    var bars = [['LBCF（UDCF.DGB）', 7.79, C.b], ['CT.ST', 6.87, C.gray], ['CF.DT（MBCF.DGB）', 5.31, C.a]];
    S.bars = bars.map(function (b, i) {
      var y = 150 + i * 95;
      t2(g4, BX - 16, y + 34, b[0], '', { 'font-size': 18, 'font-weight': 600, fill: b[2] === C.gray ? C.ink : b[2], 'text-anchor': 'end' });
      var r = el('rect', { x: BX, y: y, width: 0, height: 48, rx: 4, fill: b[2] }, g4);
      var tx = el('text', { x: BX, y: y + 34, 'font-size': 24, 'font-weight': 650, fill: C.ink }, g4);
      return { r: r, tx: tx, v: b[1] };
    });
    el('line', { x1: BX, y1: 135, x2: BX, y2: 445, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    t2(g4, 70, 500, '論文 5.3 節本文の数値。同じ予算で15日以上実施', '', { 'font-size': 15, fill: C.muted });
    S.BX = BX; S.SC = SC;

    // ===== scene 5: title card =====
    var g5 = S.g5 = el('g', {}, svg);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'WWW 2022';
    el('text', { x: 480, y: 228, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'LBCF: A Large-Scale Budget-Constrained';
    el('text', { x: 480, y: 270, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Causal Forest Algorithm';
    el('text', { x: 480, y: 318, 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'Meng Ai, Biao Li, Heyang Gong, Qingwei Yu, Shengjie Xue, Yuan Zhang, Yunzhou Zhang, Peng Jiang';
    el('text', { x: 480, y: 368, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3485447.3512103 · arXiv:2201.12585';
    return S;
  }

  function lamAt(t) {   // current bisection state for scene 3
    var k = 0; for (var i = 0; i < STEPS.length; i++) if (t >= STEPS[i][0]) k = i + 1;
    return k;
  }

  function render(S, t) {
    var vis = function (a, b) { return seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)); };
    S.gT.setAttribute('opacity', vis(0, 24));
    S.g4.setAttribute('opacity', vis(24, 33));
    S.g5.setAttribute('opacity', vis(33, 40));
    S.gL.setAttribute('opacity', seg(t, 16, 16.6));
    S.calcNote.setAttribute('opacity', seg(t, 16, 16.6));

    var sel = [0, 0, 0, 0, 0, 0], col = [null, null, null, null, null, null];
    if (t < 16) {
      var n = 0; [1.5, 2.7, 3.9, 5.1].forEach(function (s) { if (t >= s) n++; });
      if (t >= 8) n = 4;
      for (var i = 0; i < n; i++) { sel[GREEDY[i][0]] = GREEDY[i][1]; col[GREEDY[i][0]] = C.a; }
      if (t >= 9.8) { sel[3] = 0; }
      if (t >= 11.5) { sel[0] = 2; col[0] = C.b; }
      if (t >= 12.3) col = col.map(function () { return C.b; });
    } else {
      var k = lamAt(t);
      if (k > 0) { sel = pick(STEPS[k - 1][3]); col = col.map(function () { return C.b; }); }
    }
    S.cells.forEach(function (row, i) {
      row.forEach(function (r, kk) {
        var on = sel[i] === kk + 1, c = col[i] || C.a;
        r.setAttribute('fill', on ? (c === C.b ? C.bsoft : '#FCEBDF') : '#fff');
        r.setAttribute('stroke', on ? c : C.hair);
        r.setAttribute('stroke-width', on ? 2.5 : 1.5);
      });
      S.out[i].setAttribute('opacity', (i >= 4 && t >= 6 && t < 16) || (i === 3 && t >= 9.8 && t < 16) ? 1 : 0);
    });
    S.out[3].querySelector('text').textContent = 'やめる';
    var tv = totals(sel), over = tv[0] > B;
    S.meter.forEach(function (m, k) {
      m.setAttribute('fill', k < tv[0] ? (over ? C.a : (col.indexOf(C.b) >= 0 && t >= 12.3 || t >= 16 ? C.b : C.a)) : C.panel);
      m.setAttribute('opacity', k < 6 || k < tv[0] ? 1 : 0);
    });
    S.costTx.textContent = tv[0] + ' / ' + B;
    S.valTx.textContent = tv[1];
    S.valTx.setAttribute('fill', (t >= 12.3) ? C.b : (t >= 5.1 ? C.a : C.ink));

    // lambda panel
    var k2 = lamAt(t), lh = LO_HI[k2];
    S.band.setAttribute('x', S.lx(lh[0])); S.band.setAttribute('width', S.lx(lh[1]) - S.lx(lh[0]));
    if (k2 > 0) {
      var m = STEPS[k2 - 1][3];
      S.mark.setAttribute('cx', S.lx(m)); S.mark.setAttribute('opacity', 1);
      S.lamTx.textContent = 'λ = ' + m;
      var d = B - tv[0];
      S.dTx.textContent = "L′(λ) = 6 − " + tv[0] + ' = ' + d;
      S.dTx2.textContent = d > 0 ? '→ 右端を λ に移す' : '→ 左端を λ に移す';
    } else {
      S.mark.setAttribute('opacity', 0);
      S.lamTx.textContent = 'λ ∈ [0, 20]';
      S.dTx.textContent = ''; S.dTx2.textContent = '';
    }

    // bars
    S.bars.forEach(function (b, i) {
      var k = seg(t, 25 + i * 1.6, 26.4 + i * 1.6), w = b.v * S.SC * k;
      b.r.setAttribute('width', w);
      b.tx.setAttribute('x', S.BX + w + 12);
      b.tx.textContent = k > 0.02 ? (b.v * k).toFixed(2) + '%' : '';
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
