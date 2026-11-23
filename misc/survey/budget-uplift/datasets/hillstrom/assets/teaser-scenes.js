// =====================================================================
// teaser-scenes.js — Hillstrom MineThatData e-mail dataset, unofficial explainer. Player: teaser-engine.js.
// Every number is read from window.HILLSTROM_STATS (assets/hillstrom_stats.js), which the explainer computed
// from the full official CSV (64,000 rows). Captions repeat a few of those numbers as text.
// Scene 1: assignment (1 dot = 1% of customers). Scene 2: visit rate by group. Scene 3: purchases are rare.
// Scene 4: spend per customer and per buyer. Scene 5: budget usage + title card.
// Colours: orange = visit (read as the cost), blue = conversion / spend (read as the revenue);
//          light tint = No E-Mail, full colour = Mens e-mail, mid tint = Womens e-mail.
// =====================================================================
(function () {
  var ST = window.HILLSTROM_STATS; if (!ST) return;
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;
  var G = ST.groups, O = ST.overall, A = ST.ate;
  var AS = '#F3C9AE', AM = '#E58A5C', BS = '#BFD0F6', BM = '#6F8FE6';
  var ORDER = [['配信なし', 'none'], ['メンズ向け', 'mens'], ['ウィメンズ向け', 'womens']];

  function fmt(n) { return n.toLocaleString('en-US'); }
  function p(x, d) { return (100 * x).toFixed(d); }

  var CAPTIONS = [
    { ja: '顧客 64,000 人を、メンズ向けメール・ウィメンズ向けメール・配信なしに 1/3 ずつ無作為に分けた。', en: '' },
    { ja: 'メンズ向けメールで、<span class="A">訪問率</span>は 10.6% から 18.3% に上がる。', en: '' },
    { ja: '<span class="B">購入</span>は全体で 578 件しかなく、配信なしの群では 122 件である。', en: '' },
    { ja: '<span class="B">1 人あたりの購入額</span>の差は、ほぼ購入者の数の差から来ている。', en: '' },
    { ja: '予算制約つきの論文では<span class="B">購入額</span>を売上、<span class="A">訪問</span>をコストに見立てることがある。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 690;   // right-hand explanation column

  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: 3 columns of dots, 1 dot = 1% of customers =====
    var g1 = S.g[0];
    T(g1, 70, 66, '1 点 = 顧客の約 1%（640 人）', { 'font-size': 16, fill: C.muted });
    S.dots1 = [];
    var counts = ORDER.map(function (o) { return Math.round(100 * G[o[1]].n / ST.rows); });
    var fills = [['#fff', C.muted], [C.ink, C.ink], ['#8A94A3', '#8A94A3']];
    ORDER.forEach(function (o, j) {
      for (var i = 0; i < counts[j]; i++) {
        var col = i % 6, row = Math.floor(i / 6);
        S.dots1.push(el('circle', { cx: 82 + j * 180 + col * 26, cy: 120 + row * 30, r: 9, fill: fills[j][0], stroke: fills[j][1], 'stroke-width': 2 }, g1));
      }
    });
    S.lab1 = el('g', {}, g1);
    ORDER.forEach(function (o, j) {
      T(S.lab1, 147 + j * 180, 330, o[0], { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      T(S.lab1, 147 + j * 180, 358, fmt(G[o[1]].n) + ' 人', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    });
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 112, '行数', { 'font-size': 15, fill: C.muted });
    T(p1, PX, 148, fmt(ST.rows), { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    T(p1, PX, 196, '過去 12 か月に', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 222, '購入した顧客', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 270, '特徴量 8 個（購入履歴）', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 296, '結果は配信後 2 週間の', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 322, '訪問・購入・購入額', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 372, '2008 年 3 月公開', { 'font-size': 15, fill: C.muted });

    // ===== bar charts for scenes 2-4 =====
    function bars(g, title, key, top, ticks, lab, cols, tc) {
      var Y0 = 420, HM = 290, o = { bars: [] };
      T(g, 70, 62, title, { 'font-size': 17, 'font-weight': 600, fill: tc });
      ticks.forEach(function (v) {
        var y = Y0 - HM * v / top;
        el('line', { x1: 140, x2: 600, y1: y, y2: y, stroke: C.hair }, g);
        T(g, 128, y + 5, lab(v, true), { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
      });
      ORDER.forEach(function (r, i) {
        var v = G[r[1]][key], h = HM * v / top, x = 172 + i * 145;
        var b = { full: h, rect: el('rect', { x: x, y: Y0, width: 100, height: 0, fill: cols[i] }, g) };
        b.lab = T(g, x + 50, Y0 - h - 14, lab(v), { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
        T(g, x + 50, Y0 + 30, r[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
        o.bars.push(b);
      });
      el('line', { x1: 140, x2: 600, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g);
      o.Y0 = Y0;
      return o;
    }
    function pc(d) { return function (v, tick) { return (100 * v).toFixed(tick ? (d > 2 ? 1 : 0) : d) + '%'; }; }

    // ===== scene 2: visit =====
    var g2 = S.g[1];
    S.b2 = bars(g2, '訪問率（visit）', 'visit_mean', 0.2, [0, 0.05, 0.1, 0.15, 0.2], pc(1), [AS, C.a, AM], C.a);
    var p2 = S.p2 = el('g', {}, g2);
    T(p2, PX, 112, 'メンズ向け − 配信なし', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 152, '+' + p(A.mens_vs_none.visit.diff, 2) + ' pt', { 'font-size': 36, 'font-weight': 650, fill: C.a });
    T(p2, PX, 188, '標準誤差 ' + p(A.mens_vs_none.visit.se, 2) + ' pt', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 240, 'ウィメンズ向け − 配信なし', { 'font-size': 15, fill: C.muted });
    T(p2, PX, 276, '+' + p(A.womens_vs_none.visit.diff, 2) + ' pt', { 'font-size': 30, 'font-weight': 650, fill: AM });
    T(p2, PX, 330, '3 群の割り当ては無作為で、', { 'font-size': 16, fill: C.ink });
    T(p2, PX, 356, '人数も特徴量もそろっている', { 'font-size': 16, fill: C.ink });

    // ===== scene 3: purchases are rare (1 dot = 1 purchase within each group's block) =====
    var g3 = S.g[2];
    T(g3, 70, 62, '購入（conversion）の件数　1 点 = 1 件', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    S.dots3 = [];
    var cols3 = [BS, C.b, BM];
    ORDER.forEach(function (o, j) {
      var n = G[o[1]].conversions, arr = [];
      for (var i = 0; i < n; i++) {
        var col = i % 40, row = Math.floor(i / 40);
        arr.push(el('circle', { cx: 214 + col * 9, cy: 100 + j * 110 + row * 9, r: 3.4, fill: cols3[j] }, g3));
      }
      S.dots3.push(arr);
      T(g3, 190, 104 + j * 110, o[0], { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
      T(g3, 190, 128 + j * 110, fmt(n) + ' 件', { 'font-size': 18, 'font-weight': 650, fill: C.ink, 'text-anchor': 'end' });
    });
    T(g3, 70, 450, '各群の約 21,300 人のうち、購入したのはこれだけ', { 'font-size': 16, fill: C.muted });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 112, '購入した人', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 152, fmt(O.conversions) + ' 人', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p3, PX, 188, '全体の ' + p(O.conversion_rate, 2) + '%', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 240, '購入率の差（メンズ向け）', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 276, '+' + p(A.mens_vs_none.conversion.diff, 3) + ' pt', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    T(p3, PX, 330, '購入額が正の値をとるのは', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 356, 'この ' + fmt(O.conversions) + ' 行だけ', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: spend per customer =====
    var g4 = S.g[3];
    S.b4 = bars(g4, '1 人あたりの購入額（spend）', 'spend_mean', 2, [0, 0.5, 1, 1.5, 2],
      function (v, tick) { return '$' + v.toFixed(tick ? 1 : 2); }, [BS, C.b, BM], C.b);
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX, 112, 'メンズ向け − 配信なし', { 'font-size': 15, fill: C.muted });
    T(p4, PX, 152, '+$' + A.mens_vs_none.spend.diff.toFixed(2), { 'font-size': 36, 'font-weight': 650, fill: C.b });
    T(p4, PX, 188, '標準誤差 $' + A.mens_vs_none.spend.se.toFixed(2), { 'font-size': 16, fill: C.ink });
    T(p4, PX, 240, '購入者 1 人あたりの購入額', { 'font-size': 15, fill: C.muted });
    ORDER.forEach(function (o, i) {
      T(p4, PX, 274 + i * 28, o[0] + ' $' + G[o[1]].spend_per_buyer.toFixed(0), { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    });
    T(p4, PX, 384, '群の差は小さい', { 'font-size': 16, fill: C.ink });

    // ===== scene 5: budget usage, then title card =====
    var g5 = S.g[4];
    var u = S.use5 = el('g', {}, g5);
    function box(x, w, c, soft, a, b, cc) {
      el('rect', { x: x, y: 110, width: w, height: 160, rx: 12, fill: soft }, u);
      T(u, x + w / 2, 158, a, { 'font-size': 20, 'font-weight': 650, fill: c, 'text-anchor': 'middle' });
      T(u, x + w / 2, 202, b, { 'font-size': 26, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      T(u, x + w / 2, 240, cc, { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    }
    box(90, 340, C.b, C.bsoft, '購入額の増加', '→ 売上', 'メンズ向け +$' + A.mens_vs_none.spend.diff.toFixed(2) + ' / 人');
    box(530, 340, C.a, '#FCEBDF', '訪問の増加', '→ コスト', 'メンズ向け +' + p(A.mens_vs_none.visit.diff, 2) + ' pt');
    T(u, 480, 320, '訪問 1 回の増加あたり、購入額は約 $' + A.mens_vs_none.spend_per_extra_visit.toFixed(2) + ' 増える（メンズ向け）', { 'font-size': 18, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 362, 'E3IR は購入額を応答、訪問をコストにした', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    T(u, 480, 410, '配信費用の列はないので、コストは論文ごとに作る', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    var tc = S.title5 = el('g', {}, g5);
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, tc).textContent = 'DATASET · MINETHATDATA';
    el('text', { x: 480, y: 240, 'font-size': 36, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Hillstrom MineThatData E-Mail Dataset';
    T(tc, 480, 290, 'Kevin Hillstrom のメール施策データ（2008 年）', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, tc).textContent = 'Kevin Hillstrom, MineThatData E-Mail Analytics And Data Mining Challenge, 2008';
    el('text', { x: 480, y: 392, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, tc).textContent = 'blog.minethatdata.com/2008/03/minethatdata-e-mail-analytics-and-data.html';
    T(tc, 480, 452, '非公式の解説（提供者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots appear in order, then labels and numbers
    S.dots1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.4 + i * 0.025, 0.7 + i * 0.025)); });
    S.lab1.setAttribute('opacity', seg(t, 3.2, 3.8));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2));
    // scenes 2 and 4: bars grow
    [[S.b2, 9], [S.b4, 25]].forEach(function (q) {
      q[0].bars.forEach(function (b, i) {
        var k = seg(t, q[1] + i * 0.6, q[1] + 0.8 + i * 0.6), h = b.full * k;
        b.rect.setAttribute('height', h); b.rect.setAttribute('y', q[0].Y0 - h);
        b.lab.setAttribute('opacity', seg(t, q[1] + 0.6 + i * 0.6, q[1] + 1 + i * 0.6));
      });
    });
    S.p2.setAttribute('opacity', seg(t, 11, 11.8));
    // scene 3: purchase dots fill group by group
    S.dots3.forEach(function (arr, j) {
      arr.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 17 + j * 1.1 + i * 0.004, 17.3 + j * 1.1 + i * 0.004)); });
    });
    S.p3.setAttribute('opacity', seg(t, 19.6, 20.4));
    S.p4.setAttribute('opacity', seg(t, 27, 27.8));
    // scene 5: usage, then the title card
    S.use5.setAttribute('opacity', 1 - seg(t, 36.2, 36.8));
    S.title5.setAttribute('opacity', seg(t, 36.6, 37.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 28 });
})();
