// =====================================================================
// teaser-scenes.js — Zhang, Howson, Savva, Loh, DISCO (ECML PKDD 2024; arXiv 2406.06433 v3), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図). Scene 4 uses the
// percentages printed in Section 5 (online A/B test) of the paper.
// Colours: orange = the operational control (depth quotas N_a, random hand-out); blue = DISCO (TS-IP).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: '現行の運用では、深さごとの配布人数を決めたうえで、誰にどの割引を渡すかは<span class="A">ランダム</span>に決める。', en: '' },
    { ja: '個別化には顧客ごと・深さごとの反応が要るが、観測できるのは実際に渡した深さの結果だけである。', en: '' },
    { ja: '<span class="B">DISCO</span> はトンプソン抽出で疑似報酬の表を作り、深さごとの人数を守る整数計画で割り当てる。', en: '' },
    { ja: 'ASOS.com の A/B テストでは、<span class="A">対照群</span>より売上が 1.12%、報酬（売上 − 値引き額）が 1.23% 高かった。', en: '' },
    { ja: '割当てに運用上の制約をかけても、トンプソン抽出による学習はほとんど損なわれなかった、と論文は報告する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan dy="5" font-size="12" ' + MI + '>' + s + '</tspan><tspan dy="-5"></tspan>'; }
  function cellText(g, x, y, s, fill) {
    var e = el('text', { x: x, y: y, 'font-size': 17, 'text-anchor': 'middle', fill: fill || C.ink }, g);
    e.textContent = s; return e;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: quotas per depth, random hand-out =====
    var g1 = S.g[0];
    var BX = [300, 410, 520], BW = 90, BY = 150, BH = 270, CAP = [4, 3, 2];
    var names = ['浅い', '中くらい', '深い'];
    BX.forEach(function (x, k) {
      el('rect', { x: x, y: BY, width: BW, height: BH, rx: 12, fill: '#fff', stroke: C.a, 'stroke-width': 1.8 }, g1);
      t2(g1, x + BW / 2, BY - 16, names[k], '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      t2(g1, x + BW / 2, BY + BH + 30, m('N') + sub('a') + ' = ' + CAP[k], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    });
    t2(g1, 150, BY - 16, '顧客', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    var slots = [];
    BX.forEach(function (x, k) { for (var j = 0; j < CAP[k]; j++) slots.push({ x: x + BW / 2, y: BY + 40 + j * 58 }); });
    var r1 = rng(11), perm = slots.map(function (_, i) { return i; });
    for (var i = perm.length - 1; i > 0; i--) { var j = Math.floor(r1() * (i + 1)), tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp; }
    S.cust1 = [];
    for (var c = 0; c < 9; c++) {
      var sx = 100 + (c % 3) * 50, sy = BY + 50 + Math.floor(c / 3) * 70;
      S.cust1.push({ x0: sx, y0: sy, x1: slots[perm[c]].x, y1: slots[perm[c]].y, t0: 1.4 + c * 0.32,
        c: el('circle', { cx: sx, cy: sy, r: 15, fill: C.gray }, g1) });
    }
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 150, '現行の運用（対照群）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 198, '深さごとの人数 ' + m('N') + sub('a') + ' を決め、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 226, '誰にどれを渡すかは', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 254, 'ランダムに決める。', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 310, '全員に同じ割引を出すより', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 334, 'コストは抑えられるが、', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 358, '顧客の違いは見ていない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: partial information =====
    var g2 = S.g[1];
    var CX2 = [270, 360, 450, 540], RY2 = [140, 200, 260, 320, 380], CW = 76, CH = 44;
    CX2.forEach(function (x, k) { t2(g2, x, 106, '深さ ' + m('a') + sub(String(k + 1)), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }); });
    var obs = [1, 3, 0, 2, 1], obsVal = ['52', '81', '35', '47', '38'];
    S.rows2 = RY2.map(function (y, r) {
      var g = el('g', {}, g2);
      t2(g, 200, y + 6, '顧客 ' + (r + 1), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var q = el('g', {}, g);
      CX2.forEach(function (x, k) {
        var isObs = k === obs[r];
        el('rect', { x: x - CW / 2, y: y - CH / 2, width: CW, height: CH, rx: 6, fill: isObs ? '#fff' : C.panel, stroke: isObs ? C.ink : C.hair, 'stroke-width': isObs ? 2 : 1.5 }, isObs ? g : q);
        cellText(isObs ? g : q, x, y + 6, isObs ? obsVal[r] : '?', isObs ? C.ink : C.muted);
      });
      return { g: g, q: q, t0: 9 + r * 0.45 };
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 150, '部分情報', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 198, '結果が見えるのは、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 226, '実際に渡した深さだけ。', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 282, '深さは連続で候補が多く、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 306, '配り方には運用上の', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 330, '制約もかかる。', '', { 'font-size': 16, fill: C.muted });
    S.note2 = t2(g2, 405, 446, '「?」の深さの結果は観測できない', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: Thompson-sampled table + integer program with quotas =====
    var g3 = S.g[2];
    var CX3 = [300, 400, 500], RY3 = [130, 186, 242, 298, 354], CAP3 = [2, 2, 1];
    var BASE = [[40, 44, 47], [62, 70, 81], [35, 41, 43], [50, 52, 53], [30, 37, 39]];
    // best assignment under the quotas (brute force over 3^5 choices)
    var best = -1, bestA = null;
    for (var code = 0; code < 243; code++) {
      var a = [], cnt = [0, 0, 0], v = 0, x = code;
      for (var r = 0; r < 5; r++) { a.push(x % 3); cnt[x % 3]++; v += BASE[r][x % 3]; x = Math.floor(x / 3); }
      if (cnt[0] <= CAP3[0] && cnt[1] <= CAP3[1] && cnt[2] <= CAP3[2] && v > best) { best = v; bestA = a; }
    }
    S.assign = bestA; S.total = best; S.base = BASE;
    ['浅い', '中くらい', '深い'].forEach(function (n, k) { t2(g3, CX3[k], 96, n, '', { 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }); });
    S.cells3 = [];
    RY3.forEach(function (y, r) {
      t2(g3, 230, y + 6, '顧客 ' + (r + 1), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      CX3.forEach(function (x, k) {
        var rect = el('rect', { x: x - 42, y: y - 22, width: 84, height: 44, rx: 6, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g3);
        var tx = cellText(g3, x, y + 6, '');
        S.cells3.push({ r: r, k: k, rect: rect, tx: tx, on: bestA[r] === k, t0: 20.2 + r * 0.35 });
      });
    });
    t2(g3, 230, 412, '上限 ' + m('N') + sub('a'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    S.capT = CX3.map(function (x, k) {
      var g = t2(g3, x, 412, '', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      return { t: g.querySelector('text'), k: k };
    });
    S.tsLab = t2(g3, 400, 60, 'トンプソン抽出：事後分布から値を引く', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    S.ipLab = t2(g3, 400, 60, '整数計画：上限を守り、合計 ' + best + ' が最大', '', { 'font-size': 16, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, 'DISCO', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 156, '① 顧客の埋め込み × RBF', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 180, '（深さの特徴）', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 222, '② ベイズ回帰から ' + m('F̃') + ' を抽出', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 246, '抽出のたびに値がゆらぐ', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 288, '③ 整数計画で割り当てる', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(p3, PX + 22, 312, '列ごとの上限 ' + m('N') + sub('a') + ' を守る', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（表の値は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: online A/B test (Section 5) =====
    var g4 = S.g[3];
    var X0 = 200, PER = 90;   // pixels per 1 %
    [0, 1, 2, 3, 4].forEach(function (v) {
      [[96, 214], [292, 420]].forEach(function (yy) {
        el('line', { x1: X0 + v * PER, x2: X0 + v * PER, y1: yy[0], y2: yy[1], stroke: v === 0 ? C.ink : C.hair, 'stroke-width': v === 0 ? 1.5 : 1 }, g4);
      });
      el('text', { x: X0 + v * PER, y: 446, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v + '%';
    });
    t2(g4, 70, 84, '対照群（同じ人数配分でランダム）と比べて', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    t2(g4, 70, 276, '画一的な割引と比べて', '', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    var bars = [['売上', 1.12, 120, '+1.12%'], ['報酬', 1.23, 182, '+1.23%'], ['売上', 3.56, 312, '+3.56%'], ['報酬', 4.10, 374, '+4.10%']];
    S.bars4 = bars.map(function (b, i) {
      t2(g4, X0 - 14, b[2] + 6, b[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      var rect = el('rect', { x: X0, y: b[2] - 18, width: 0, height: 36, fill: C.b }, g4);
      var lab = t2(g4, X0 + b[1] * PER + 10, b[2] + 6, b[3], '', { 'font-size': 17, 'font-weight': 650, fill: C.b });
      return { rect: rect, lab: lab, w: b[1] * PER, t0: 24.6 + i * 0.7 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'p 値', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 148, '売上 ' + m('p') + ' &lt; 0.001', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 174, '報酬 ' + m('p') + ' &lt; 0.01', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 200, '画一的な割引とは ' + m('p') + ' &lt; 0.001', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 256, '報酬 = 売上 − 値引き額', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 310, '各群の平均は非公表で、', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 334, '改善率だけが報告されている', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 384, 'テスト中の予測精度', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 408, 'WAPE 0.133（オフラインと同程度）', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文の本文（第 5 節）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    var tk = el('g', {}, g5);
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 300, 74, '制約による学習の低下', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 300, 98, '0.234%（オフライン）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, tk);
    t2(tk, 660, 74, 'A/B テスト（対照群比）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(tk, 660, 98, '売上 +1.12%、報酬 +1.23%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 172, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ECML PKDD 2024';
    el('text', { x: 480, y: 222, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'DISCO: An End-to-End Bandit Framework';
    el('text', { x: 480, y: 262, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Personalised Discount Allocation';
    t2(g5, 480, 304, '割引コードを顧客ごとに配るためのバンディットの枠組み', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 354, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jason Shuo Zhang, Benjamin Howson, Panayiota Savva, Eleanor Loh';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/978-3-031-70381-2_3';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: customers move into the depth bins in random order
    S.cust1.forEach(function (u) {
      var s = H.ease(seg(t, u.t0, u.t0 + 0.7));
      u.c.setAttribute('cx', u.x0 + (u.x1 - u.x0) * s);
      u.c.setAttribute('cy', u.y0 + (u.y1 - u.y0) * s);
      u.c.setAttribute('fill', H.mix(C.gray, C.a, seg(t, u.t0 + 0.5, u.t0 + 0.8)));
    });
    S.p1.setAttribute('opacity', seg(t, 2.2, 3.0));
    // scene 2: rows appear with one observed cell; the unknown cells follow
    S.rows2.forEach(function (r) {
      r.g.setAttribute('opacity', seg(t, r.t0, r.t0 + 0.4));
      r.q.setAttribute('opacity', seg(t, 11.8, 12.4));
    });
    S.note2.setAttribute('opacity', seg(t, 12.6, 13.2));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: sampled values jitter and settle; then the integer program picks cells
    var amp = 12 * (1 - seg(t, 16.6, 19.6)), tick = Math.floor(t * 4);
    var used = [0, 0, 0];
    S.cells3.forEach(function (c, idx) {
      var r = rng(idx * 131 + tick * 7 + 3)();
      var v = Math.round(S.base[c.r][c.k] + amp * (2 * r - 1));
      c.tx.textContent = t < 16.4 ? '' : String(v);
      var on = c.on ? seg(t, c.t0, c.t0 + 0.35) : 0;
      if (c.on && t >= c.t0 + 0.2) used[c.k]++;
      c.rect.setAttribute('fill', H.mix('#FFFFFF', C.b, on));
      c.rect.setAttribute('stroke', on > 0.5 ? C.b : C.hair);
      c.tx.setAttribute('fill', on > 0.5 ? '#fff' : C.ink);
      c.tx.setAttribute('font-weight', on > 0.5 ? 650 : 400);
    });
    var CAP3 = [2, 2, 1];
    S.capT.forEach(function (c) {
      c.t.textContent = (t < 20.2 ? '' : used[c.k] + ' / ') + CAP3[c.k];
      c.t.setAttribute('fill', t >= 20.2 ? C.b : C.ink);
    });
    S.tsLab.setAttribute('opacity', seg(t, 16.4, 16.9) * (1 - seg(t, 19.7, 20.1)));
    S.ipLab.setAttribute('opacity', seg(t, 20.1, 20.6));
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: bars grow in order
    S.bars4.forEach(function (b) {
      var s = H.ease(seg(t, b.t0, b.t0 + 0.8));
      b.rect.setAttribute('width', b.w * s);
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.6, b.t0 + 1.0));
    });
    S.p4.setAttribute('opacity', seg(t, 27.8, 28.6));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
