// =====================================================================
// teaser-scenes.js — Zhang, Chen & Yan, Transfer Faster, Price Smarter:
// Minimax Dynamic Pricing under Cross-Market Preference Shift (NeurIPS 2025; arXiv 2505.17203).
// Player: teaser-engine.js (copied unchanged from template).
// Scenes 1–3 are schematics (labelled 模式図). Scene 4 plots exact regret-reduction numbers
// from Appendix Table 1 (sparse-difference setting, O2O_on). Scene 5 shows Theorem bounds (Sec. 5.1 & 6.1).
// Colours: orange = single-market learning / preference shift; blue = CM-TDP transfer & gains.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '新規市場は取引が少なく、<span class="A">単一市場だけで一から学ぶ</span>と適切な価格を見つけるまで時間がかかる。',
    '成熟市場のデータをそのまま使うと、<span class="A">市場間の選好のずれ</span>が推定の偏りになる。',
    'CM-TDP は<span class="B">集約とバイアス補正</span>を倍増エピソードで繰り返し、線形と RKHS の両方を扱う。',
    '疎な差のシミュレーションでは累積 regret が<span class="B">最大 73% 減り</span>、同じ推定誤差に<span class="B">最大 9 倍速く</span>達した。',
    '線形と非線形 RKHS の両方で情報理論的下界に対数因子を除いて一致する regret を示した。'
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 640;
  var items = [];
  function at(t0, g) { items.push({ g: g, t0: t0 }); return g; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(b, s) { return m(b) + '<tspan dy="4" font-size="12">' + s + '</tspan><tspan dy="-4"></tspan>'; }
  function sup(b, s) { return m(b) + '<tspan dy="-6" font-size="12">' + s + '</tspan><tspan dy="6"></tspan>'; }

  function build(svg) {
    var S = { g: [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); }) };

    // ===== scene 1: data-poor target vs data-rich source markets =====
    var g1 = S.g[0];
    // Target market (sparse dots)
    el('rect', { x: 70, y: 110, width: 220, height: 290, rx: 12, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, g1);
    tx(g1, 180, 146, '新規の対象市場', { 'font-size': 17, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 180, 174, '取引データが少ない', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var r1 = H.rng(7);
    S.s1TargetDots = [];
    for (var i = 0; i < 6; i++) {
      var dot = el('circle', { cx: 105 + r1() * 150, cy: 205 + r1() * 155, r: 6, fill: C.a }, g1);
      S.s1TargetDots.push({ el: dot, t0: 1.0 + i * 0.45 });
    }
    // Source markets (abundant dots)
    var srcNames = ['補助市場 1', '補助市場 2', '補助市場 K'];
    S.s1SrcDots = [];
    srcNames.forEach(function (label, k) {
      var y = 110 + k * 102;
      el('rect', { x: 350, y: y, width: 230, height: 86, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5 }, g1);
      tx(g1, 368, y + 26, label, { 'font-size': 15, 'font-weight': 650, fill: C.b });
      for (var j = 0; j < 18; j++) {
        var sd = el('circle', { cx: 372 + r1() * 190, cy: y + 40 + r1() * 34, r: 4, fill: C.b }, g1);
        S.s1SrcDots.push({ el: sd, t0: 1.2 + k * 0.6 + j * 0.08 });
      }
    });
    var p1 = at(1.0, el('g', {}, g1));
    tx(p1, PX, 150, '2 つの転移設定', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    tx(p1, PX, 194, 'O2O<tspan dy="4" font-size="12">off</tspan><tspan dy="-4">：固定の過去ログ</tspan>', { 'font-size': 16, fill: C.ink });
    tx(p1, PX, 232, 'O2O<tspan dy="4" font-size="12">on</tspan><tspan dy="-4">：同時稼働ストリーム</tspan>', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    tx(p1, PX, 290, '観測は「買う／買わない」', { 'font-size': 15, fill: C.muted });
    tx(p1, PX, 316, 'の二値フィードバックのみ', { 'font-size': 15, fill: C.muted });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: preference shift (sparse difference) =====
    var g2 = S.g[1];
    el('line', { x1: 80, y1: 290, x2: 580, y2: 290, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    tx(g2, 330, 120, '係数の差  ' + sup('β', '(0)') + ' − ' + sup('β', '(k)') + ' （' + m('d') + ' 次元）', { 'font-size': 17, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    var diffIdx = { 3: 110, 9: -85, 16: 95, 22: -70 };
    S.s2Bars = [];
    for (var j2 = 0; j2 < 26; j2++) {
      var val = diffIdx[j2] || 0;
      var rect = el('rect', { x: 92 + j2 * 18.5, y: 290, width: 12, height: 2, rx: 2, fill: val ? C.a : C.gray }, g2);
      S.s2Bars.push({ r: rect, val: val });
    }
    tx(g2, 330, 442, '多くの特徴量は共通だが、一部（最大 ' + sub('s', '0') + ' 個）で選好が異なる', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = at(9.0, el('g', {}, g2));
    tx(p2, PX, 150, '選好のずれ（モデルシフト）', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(p2, PX, 198, '線形：‖' + sup('β', '(0)') + '−' + sup('β', '(k)') + '‖<tspan dy="4" font-size="12">0</tspan><tspan dy="-4"> ≤ </tspan>' + sub('s', '0'), { 'font-size': 17, fill: C.ink });
    tx(p2, PX, 236, 'RKHS：‖' + sup('g', '(0)') + '−' + sup('g', '(k)') + '‖<tspan dy="4" font-size="12">K</tspan><tspan dy="-4"> ≤ </tspan>' + m('H'), { 'font-size': 17, fill: C.ink });
    var p2b = at(11.6, el('g', {}, g2));
    tx(p2b, PX, 304, 'ずれを無視して混ぜると', { 'font-size': 15, fill: C.a });
    tx(p2b, PX, 332, '推定に偏りが残る', { 'font-size': 18, 'font-weight': 700, fill: C.a });
    tx(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: doubling episodes + aggregate -> debias =====
    var g3 = S.g[2];
    var lens = [1, 2, 4, 8, 16];
    var x0 = 75, unit = 16, xx = x0;
    S.s3Ep = [];
    lens.forEach(function (L, idx) {
      var w = L * unit - 5;
      var gg = el('g', {}, g3);
      el('rect', { x: xx, y: 150, width: w, height: 48, rx: 6, fill: idx % 2 ? C.bsoft : C.panel, stroke: C.hair }, gg);
      if (w >= 26) tx(gg, xx + w / 2, 180, String(L), { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
      el('line', { x1: xx + 2, y1: 146, x2: xx + 2, y2: 112, stroke: C.b, 'stroke-width': 2.5 }, gg);
      el('circle', { cx: xx + 2, cy: 108, r: 5, fill: C.b }, gg);
      S.s3Ep.push({ g: gg, t0: 16.5 + idx * 0.65 });
      xx += L * unit;
    });
    tx(g3, x0, 92, 'エピソード先頭で更新（合計 O(log T) 回）', { 'font-size': 15, 'font-weight': 650, fill: C.b });
    tx(g3, x0, 224, 'エピソード長 2<tspan dy="-5" font-size="11">m−1</tspan><tspan dy="5"> →</tspan>', { 'font-size': 14, fill: C.muted });

    var pipe1 = at(18.0, el('g', {}, g3));
    el('rect', { x: 75, y: 270, width: 210, height: 86, rx: 10, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.8 }, pipe1);
    tx(pipe1, 180, 304, '1. 集約（補助市場）', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(pipe1, 180, 332, 'MLE ／ カーネル回帰', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });

    var pipe2 = at(19.6, el('g', {}, g3));
    el('path', { d: 'M288,313 L332,313', stroke: C.b, 'stroke-width': 2.5 }, pipe2);
    el('polygon', { points: '332,307 344,313 332,319', fill: C.b }, pipe2);
    el('rect', { x: 348, y: 270, width: 225, height: 86, rx: 10, fill: C.panel, stroke: C.b, 'stroke-width': 1.8 }, pipe2);
    tx(pipe2, 460, 304, '2. バイアス補正（対象）', { 'font-size': 16, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    tx(pipe2, 460, 332, 'L1 正則化 ／ RKHS 正則化', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });

    var p3 = at(20.6, el('g', {}, g3));
    tx(p3, PX, 160, '推定した効用から値づけ', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    tx(p3, PX, 206, 'ĝ<tspan dy="-6" font-size="12">(0)</tspan><tspan dy="6"> = ĝ</tspan><tspan dy="-6" font-size="12">(ag)</tspan><tspan dy="6"> + δ̂</tspan>', { 'font-size': 20, fill: C.b, 'font-weight': 650 });
    tx(p3, PX, 254, 'p̂<tspan dy="4" font-size="12">t</tspan><tspan dy="-4"> = </tspan>' + m('h') + '(ĝ<tspan dy="-6" font-size="12">(0)</tspan><tspan dy="6">(' + sub('x', 't') + '))</tspan>', { 'font-size': 18, fill: C.ink });
    tx(p3, PX, 314, 'O2O<tspan dy="4" font-size="12">off</tspan><tspan dy="-4"> は標本が貯まると</tspan>', { 'font-size': 15, fill: C.muted });
    tx(p3, PX, 340, '自動で単一市場学習へ切替', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: real results bar chart from Appendix Table 1 (O2O_on) =====
    var g4 = S.g[3];
    var ox = 100, oy = 420, maxH = 270; // 80% -> 270px (3.375px per %)
    el('line', { x1: ox, y1: oy, x2: 575, y2: oy, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    el('line', { x1: ox, y1: oy, x2: ox, y2: 135, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [0, 20, 40, 60, 80].forEach(function (pct) {
      var y = oy - pct * (maxH / 80);
      if (pct > 0) el('line', { x1: ox, y1: y, x2: 575, y2: y, stroke: C.hair, 'stroke-dasharray': '4 4' }, g4);
      tx(g4, ox - 10, y + 5, pct + '%', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    });
    tx(g4, ox, 118, '累積 regret 削減率（O2O<tspan dy="4" font-size="11">on</tspan><tspan dy="-4">、疎な差）</tspan>', { 'font-size': 16, 'font-weight': 650, fill: C.ink });

    var data4 = [
      { k: 'K=1', lin: 15, rkhs: 17 },
      { k: 'K=3', lin: 61, rkhs: 62 },
      { k: 'K=5', lin: 67, rkhs: 68 },
      { k: 'K=10', lin: 71, rkhs: 73 }
    ];
    S.s4Bars = [];
    data4.forEach(function (d, idx) {
      var bx = ox + 36 + idx * 112;
      var hL = d.lin * (maxH / 80), hR = d.rkhs * (maxH / 80);
      var rL = el('rect', { x: bx, y: oy, width: 34, height: 0, rx: 4, fill: C.b }, g4);
      var rR = el('rect', { x: bx + 40, y: oy, width: 34, height: 0, rx: 4, fill: '#7CA0F0' }, g4);
      var tL = tx(g4, bx + 17, oy - hL - 8, d.lin + '%', { 'font-size': 14, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle', opacity: 0 });
      var tR = tx(g4, bx + 57, oy - hR - 8, d.rkhs + '%', { 'font-size': 14, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle', opacity: 0 });
      tx(g4, bx + 37, oy + 26, d.k, { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      S.s4Bars.push({ rL: rL, rR: rR, tL: tL, tR: tR, hL: hL, hR: hR, t0: 24.6 + idx * 0.55 });
    });
    el('rect', { x: 110, y: 468, width: 16, height: 14, rx: 3, fill: C.b }, g4);
    tx(g4, 132, 480, '線形（Linear）', { 'font-size': 14, fill: C.ink });
    el('rect', { x: 260, y: 468, width: 16, height: 14, rx: 3, fill: '#7CA0F0' }, g4);
    tx(g4, 282, 480, '非線形（RKHS）', { 'font-size': 14, fill: C.ink });

    var p4 = at(26.6, el('g', {}, g4));
    tx(p4, PX, 155, 'K = 10（O2O<tspan dy="4" font-size="11">on</tspan><tspan dy="-4">）</tspan>', { 'font-size': 16, fill: C.muted });
    tx(p4, PX, 206, '最大 73% 減', { 'font-size': 32, 'font-weight': 700, fill: C.b });
    tx(p4, PX, 244, '学習速度：最大 9.0 倍', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    tx(p4, PX, 278, '標準誤差：最大 39% 減', { 'font-size': 16, fill: C.ink });
    tx(p4, PX, 336, 'd ∈ {10, 15, 20} 平均', { 'font-size': 14, fill: C.muted });
    tx(p4, PX, 360, 'T = 2000（10 回試行）', { 'font-size': 14, fill: C.muted });
    tx(g4, 940, 520, '出典：論文付録 Table 1（実測値）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: minimax bounds + title card =====
    var g5 = S.g[4];
    el('rect', { x: 70, y: 38, width: 390, height: 74, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 265, 66, '線形効用（ミニマックス最適）', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 265, 96, 'Õ((' + m('d') + ' / ' + m('K') + ' + ' + sub('s', '0') + ') log ' + m('T') + ')', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    el('rect', { x: 490, y: 38, width: 400, height: 74, rx: 12, fill: C.bsoft }, g5);
    tx(g5, 690, 66, 'RKHS 効用（転移型動的価格で初）', { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
    tx(g5, 690, 96, 'Õ(' + m('K') + '<tspan dy="-6" font-size="10">−2αβ/(2αβ+1)</tspan><tspan dy="6"> </tspan>' + m('T') + '<tspan dy="-6" font-size="10">1/(2αβ+1)</tspan><tspan dy="6"> + </tspan>' + m('H') + '<tspan dy="-6" font-size="10">2/(2α+1)</tspan><tspan dy="6"> </tspan>' + m('T') + '<tspan dy="-6" font-size="10">1/(2α+1)</tspan><tspan dy="6">)</tspan>', { 'font-size': 15, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });

    el('text', { x: 480, y: 174, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'NEURIPS 2025 · ARXIV 2505.17203';
    el('text', { x: 480, y: 224, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Transfer Faster, Price Smarter:';
    el('text', { x: 480, y: 262, 'font-size': 24, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Minimax Dynamic Pricing under Cross-Market Preference Shift';
    tx(g5, 480, 308, '市場間の選好のずれを越えて速く学ぶ動的価格', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 356, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Yi Zhang · Elynn Chen · Yujun Yan';
    el('text', { x: 480, y: 404, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2505.17203';
    tx(g5, 480, 466, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    items.forEach(function (it) { it.g.setAttribute('opacity', seg(t, it.t0, it.t0 + 0.6)); });
    S.s1TargetDots.forEach(function (d) { d.el.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.35)); });
    S.s1SrcDots.forEach(function (d) { d.el.setAttribute('opacity', seg(t, d.t0, d.t0 + 0.25)); });

    var k2 = seg(t, 9.2, 11.2);
    S.s2Bars.forEach(function (b) {
      var h = Math.abs(b.val) * k2;
      if (b.val === 0) {
        b.r.setAttribute('height', 3);
        b.r.setAttribute('y', 288.5);
      } else if (b.val > 0) {
        b.r.setAttribute('height', h);
        b.r.setAttribute('y', 290 - h);
      } else {
        b.r.setAttribute('height', h);
        b.r.setAttribute('y', 290);
      }
    });

    S.s3Ep.forEach(function (e) { e.g.setAttribute('opacity', seg(t, e.t0, e.t0 + 0.45)); });

    var oy = 420;
    S.s4Bars.forEach(function (b) {
      var k = seg(t, b.t0, b.t0 + 0.7);
      var hL = b.hL * k, hR = b.hR * k;
      b.rL.setAttribute('y', oy - hL); b.rL.setAttribute('height', hL);
      b.rR.setAttribute('y', oy - hR); b.rR.setAttribute('height', hR);
      var to = seg(t, b.t0 + 0.45, b.t0 + 0.8);
      b.tL.setAttribute('opacity', to);
      b.tR.setAttribute('opacity', to);
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 29.5 });
})();
