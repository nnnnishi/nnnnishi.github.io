// =====================================================================
// teaser-scenes.js — Bertsimas, Dunn, Gibson, Orfanoudaki, Optimal Survival Trees
// (Machine Learning 2022; arXiv 2012.04284 v1), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic (toy timelines, labelled 模式図). Scenes 2-3 redraw the Framingham trees
// printed in the paper (Fig. 14 ctree, Fig. 12 OST: split variables, thresholds, leaf sizes); the
// re-ordering animation in scene 3 is a schematic of the idea, not the actual optimisation path.
// Scene 4 uses Table 1 (class recovery, moderate censoring).
// Colours: orange = greedy survival trees (rpart, ctree); blue = OST.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '生存時間のデータには打ち切りがある。生存木は似た生存時間の人を同じ葉に集め、葉ごとに生存曲線で要約する。', en: '' },
    { ja: '<span class="A">rpart や ctree</span> は分岐を上から1つずつ選び、一度決めた分岐を見直さない。', en: '' },
    { ja: '<span class="B">OST</span> は木全体の目的関数が下がる限り、分岐の付け替えや削除、追加を繰り返す。', en: '' },
    { ja: '合成データでは、学習データが増えても <span class="B">OST</span> のクラスの回復率は落ちず、<span class="A">rpart と ctree</span> では下がった。', en: '' },
    { ja: 'OST はデータが増えるほど一貫して良くなり、既存の貪欲な生存木は大きなデータで過学習しやすい、と論文は結論する。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) {
    var o = { x: x, y: y, 'font-size': 16, fill: C.ink };
    for (var k in a) o[k] = a[k];
    var e = el('text', o, g); e.innerHTML = s; return e;
  }
  // tree node: rounded box with a label; returns {g, box, label}
  function node(g, x, y, label, w) {
    var n = el('g', {}, g);
    var box = el('rect', { x: x - w / 2, y: y - 20, width: w, height: 40, rx: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 1.6 }, n);
    var lab = txt(n, x, y + 6, label, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600 });
    return { g: n, box: box, label: lab };
  }
  function leaf(g, x, y, s) {
    var n = el('g', {}, g);
    var box = el('rect', { x: x - 38, y: y - 16, width: 76, height: 32, rx: 8, fill: C.panel, stroke: C.hair, 'stroke-width': 1.4 }, n);
    var lab = txt(n, x, y + 6, s, { 'text-anchor': 'middle', 'font-size': 15 });
    return { g: n, box: box, label: lab };
  }
  function edge(g, x1, y1, x2, y2, label, side) {
    var e = el('g', {}, g);
    var ln = el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C.muted, 'stroke-width': 1.6 }, e);
    var mx = (x1 + x2) / 2 + (side < 0 ? -10 : 10), my = (y1 + y2) / 2;
    var lab = txt(e, mx, my, label, { 'font-size': 14, fill: C.muted, 'text-anchor': side < 0 ? 'end' : 'start' });
    return { g: e, line: ln, label: lab };
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: censored timelines and a Kaplan-Meier step curve =====
    var g1 = S.g[0];
    var rows = [[310, 1], [200, 1], [360, 0], [150, 1], [260, 0], [330, 1], [120, 0]];
    var X0 = 110, Y0 = 120, DY = 44;
    el('line', { x1: X0, y1: Y0 + rows.length * DY - 10, x2: 480, y2: Y0 + rows.length * DY - 10, stroke: C.ink, 'stroke-width': 1.4 }, g1);
    txt(g1, 480, Y0 + rows.length * DY + 16, '時間', { 'text-anchor': 'end', 'font-size': 15, fill: C.muted });
    S.rows1 = rows.map(function (r, i) {
      var y = Y0 + i * DY;
      txt(g1, X0 - 14, y + 5, '患者 ' + (i + 1), { 'text-anchor': 'end', 'font-size': 15, fill: C.muted });
      var bar = el('line', { x1: X0, y1: y, x2: X0, y2: y, stroke: C.gray, 'stroke-width': 8, 'stroke-linecap': 'round' }, g1);
      var mk = r[1] ? txt(g1, X0 + r[0], y + 7, '×', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: C.ink })
                    : el('circle', { cx: X0 + r[0], cy: y, r: 8, fill: '#fff', stroke: C.muted, 'stroke-width': 2.4 }, g1);
      return { bar: bar, mk: mk, len: r[0], t0: 0.8 + i * 0.35 };
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '右側打ち切り', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 174, '× 出来事が起きた', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 202, '○ 途中で観察が終わった', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX + 22, 228, '（その時点まで無事だった', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX + 22, 252, 'ことしかわからない）', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 306, '生存木は似た生存時間の人を', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 332, '同じ葉に集め、葉の生存曲線を', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 358, 'カプラン・マイヤー法で推定する。', '', { 'font-size': 16, fill: C.ink });
    // KM curve panel for the toy data
    var KX = 520, KY = 130, KW = 140, KH = 200;
    var km = S.km = el('g', {}, g1);
    el('line', { x1: KX, y1: KY, x2: KX, y2: KY + KH, stroke: C.ink, 'stroke-width': 1.4 }, km);
    el('line', { x1: KX, y1: KY + KH, x2: KX + KW, y2: KY + KH, stroke: C.ink, 'stroke-width': 1.4 }, km);
    txt(km, KX - 8, KY + 5, '1', { 'text-anchor': 'end', 'font-size': 14, fill: C.muted });
    txt(km, KX - 8, KY + KH + 5, '0', { 'text-anchor': 'end', 'font-size': 14, fill: C.muted });
    txt(km, KX + KW / 2, KY + KH + 28, '生存曲線', { 'text-anchor': 'middle', 'font-size': 15, fill: C.muted });
    // Kaplan-Meier estimate of the toy data above (scaled time)
    var ev = rows.map(function (r) { return r; }).sort(function (a, b) { return a[0] - b[0]; });
    var atRisk = ev.length, s = 1, d = 'M' + KX + ',' + KY;
    ev.forEach(function (r) {
      var x = KX + r[0] * KW / 380;
      if (r[1]) { var y0 = KY + (1 - s) * KH; s *= (atRisk - 1) / atRisk; d += ' L' + x + ',' + y0 + ' L' + x + ',' + (KY + (1 - s) * KH); }
      atRisk--;
    });
    d += ' L' + (KX + KW) + ',' + (KY + (1 - s) * KH);
    S.kmPath = el('path', { d: d, fill: 'none', stroke: C.ink, 'stroke-width': 2.2 }, km);
    S.kmLen = 600;
    S.kmPath.setAttribute('stroke-dasharray', S.kmLen);
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: ctree on the Framingham data (paper Fig. 14), grown top-down =====
    var g2 = S.g[1];
    var steps2 = [];
    function add2(obj, t) { steps2.push({ g: obj.g, t0: t }); return obj; }
    add2(edge(g2, 330, 110, 190, 220, '≤ 24.117', -1), 9.6); add2(edge(g2, 330, 110, 480, 220, '&gt; 24.117', 1), 9.6);
    add2(edge(g2, 190, 220, 130, 340, '非喫煙', -1), 10.8); add2(edge(g2, 190, 220, 250, 340, '喫煙', 1), 10.8);
    add2(edge(g2, 480, 220, 410, 340, '非喫煙', -1), 11.6); add2(edge(g2, 480, 220, 560, 330, '喫煙', 1), 11.6);
    add2(edge(g2, 560, 330, 500, 440, 'なし', -1), 12.6); add2(edge(g2, 560, 330, 620, 440, 'あり', 1), 12.6);
    S.root2 = add2(node(g2, 330, 110, 'BMI', 90), 8.8);
    add2(node(g2, 190, 220, '喫煙', 80), 10.2); add2(node(g2, 480, 220, '喫煙', 80), 10.2);
    add2(leaf(g2, 130, 360, 'n = 186'), 11.2); add2(leaf(g2, 250, 360, 'n = 364'), 11.2);
    add2(leaf(g2, 410, 360, 'n = 888'), 12.0); add2(node(g2, 560, 330, '糖尿病', 90), 12.0);
    add2(leaf(g2, 500, 460, 'n = 827'), 13.0); add2(leaf(g2, 620, 460, 'n = 31'), 13.0);
    S.steps2 = steps2;
    S.thr2 = el('rect', { x: 150, y: 140, width: 420, height: 60, rx: 10, fill: 'none', stroke: C.a, 'stroke-width': 2.4, 'stroke-dasharray': '6 5' }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, 'ctree（貪欲法）', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 166, '上のノードから順に、', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 192, 'その時点で最良の分岐を選ぶ。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 244, 'BMI 24.117 は、根で局所的に', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 270, '最良のしきい値（rpart も同じ）。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 322, '過体重の群は喫煙 → 糖尿病の順。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 374, '一度決めた分岐は見直さない。', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    t2(g2, 940, 520, 'Framingham 心臓研究の ctree の木（論文 Fig. 14 を描き直した）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: OST on the same data (paper Fig. 12) =====
    var g3 = S.g[2];
    S.e3 = [
      edge(g3, 330, 110, 190, 220, '', -1), edge(g3, 330, 110, 480, 220, '', 1),
      edge(g3, 190, 220, 130, 340, '非喫煙', -1), edge(g3, 190, 220, 250, 340, '喫煙', 1),
      edge(g3, 480, 220, 420, 330, '', -1), edge(g3, 480, 220, 600, 340, '', 1),
      edge(g3, 420, 330, 360, 440, '非喫煙', -1), edge(g3, 420, 330, 480, 440, '喫煙', 1)
    ];
    S.thrL = S.e3[0].label; S.thrR = S.e3[1].label;
    S.lab45L = S.e3[4].label; S.lab45R = S.e3[5].label;
    S.n3 = [node(g3, 330, 110, 'BMI', 90), node(g3, 190, 220, '喫煙', 80), node(g3, 480, 220, '', 90), node(g3, 420, 330, '', 90)];
    S.l3 = [leaf(g3, 130, 360, 'n = 276'), leaf(g3, 250, 360, 'n = 522'), leaf(g3, 600, 360, 'n = 65'),
            leaf(g3, 360, 460, 'n = 762'), leaf(g3, 480, 460, 'n = 671')];
    S.ring3 = el('circle', { cx: 330, cy: 110, r: 36, fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, 'OST（座標降下）', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 152, 'ノードをランダムな順に訪れ、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 178, '目的関数が下がる変更だけを残す。', '', { 'font-size': 16, fill: C.ink });
    S.moves = ['分岐を付け替える', '分岐を消す', '葉に分岐を足す'].map(function (s, i) {
      return t2(p3, PX + 16, 214 + i * 28, '・' + s, '', { 'font-size': 16, fill: C.ink });
    });
    t2(p3, PX, 330, '同じデータで OST が選んだのは', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 356, 'BMI 25.031、過体重の群は', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(p3, PX, 382, '糖尿病 → 喫煙の順。', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g3, 940, 520, '模式図（最終的な木は論文 Fig. 12。探索の途中経過は論文にない）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: class recovery vs n, moderate censoring (Table 1) =====
    var g4 = S.g[3];
    var NS_ = [100, 200, 500, 1000, 2000, 5000, 10000];
    var SER = [
      { name: 'OST', v: [92, 90, 88, 89, 90, 92, 92], c: C.b, dash: '' },
      { name: 'rpart', v: [90, 90, 84, 82, 81, 80, 79], c: C.a, dash: '' },
      { name: 'ctree', v: [78, 77, 70, 63, 57, 53, 51], c: C.a, dash: '7 6' }
    ];
    var AX = 120, AW = 450, AY = 90, AH = 340, YMIN = 40, YMAX = 100;
    function xs(n) { return AX + (Math.log(n) - Math.log(100)) / (Math.log(10000) - Math.log(100)) * AW; }
    function ys(v) { return AY + (YMAX - v) / (YMAX - YMIN) * AH; }
    [40, 60, 80, 100].forEach(function (v) {
      el('line', { x1: AX, x2: AX + AW, y1: ys(v), y2: ys(v), stroke: C.hair, 'stroke-width': 1 }, g4);
      txt(g4, AX - 10, ys(v) + 5, v + '%', { 'text-anchor': 'end', 'font-size': 14, fill: C.muted });
    });
    [100, 1000, 10000].forEach(function (n) {
      txt(g4, xs(n), AY + AH + 24, n.toLocaleString('en-US'), { 'text-anchor': 'middle', 'font-size': 14, fill: C.muted });
    });
    el('line', { x1: AX, x2: AX + AW, y1: AY + AH, y2: AY + AH, stroke: C.ink, 'stroke-width': 1.4 }, g4);
    txt(g4, AX + AW / 2, AY + AH + 52, '学習データの件数 n（対数目盛）', { 'text-anchor': 'middle', 'font-size': 15, fill: C.muted });
    txt(g4, AX, AY - 22, 'クラスの回復率（打ち切り中程度）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    S.ser4 = SER.map(function (s, k) {
      var pts = s.v.map(function (v, i) { return [xs(NS_[i]), ys(v)]; });
      var path = el('path', { d: 'M' + pts.map(function (p) { return p.join(','); }).join(' L'), fill: 'none', stroke: s.c, 'stroke-width': 3, 'stroke-dasharray': s.dash }, g4);
      var dots = pts.map(function (p) { return el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: s.c }, g4); });
      var lab = txt(g4, pts[6][0] + 12, pts[6][1] + 5, s.name + ' ' + s.v[6] + '%', { 'font-size': 16, 'font-weight': 650, fill: s.c });
      return { dots: dots, lab: lab, path: path, t0: 25 + k * 1.3 };
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 120, 'n = 10,000 のとき', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 156, 'クラスの回復率', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 182, 'OST 92%、rpart 79%、ctree 51%', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 222, 'KM 面積比', '', { 'font-size': 16, fill: C.muted });
    t2(p4, PX, 248, 'OST 87.8%、rpart 84.8%、', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 274, 'ctree 77.4%', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 326, '貪欲な2手法は木が大きくなる', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 350, 'につれて、同じクラスの観察を', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 374, '別々の葉に分けてしまう。', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1・Table 2（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: takeaway + title card =====
    var g5 = S.g[4];
    el('rect', { x: 150, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 300, 74, '実データ 44 件', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 300, 98, '5 指標とも平均が最上位', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('rect', { x: 510, y: 46, width: 300, height: 64, rx: 12, fill: C.bsoft }, g5);
    t2(g5, 660, 74, '合成データ（n = 10,000）', '', { 'font-size': 16, fill: C.b, 'text-anchor': 'middle' });
    t2(g5, 660, 98, 'クラスの回復率 92%', '', { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 182, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'MACHINE LEARNING 2022';
    el('text', { x: 480, y: 240, 'font-size': 40, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Optimal Survival Trees';
    t2(g5, 480, 284, '打ち切りのある生存時間データのための最適な木', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 340, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dimitris Bertsimas, Jack Dunn, Emma Gibson, Agni Orfanoudaki';
    el('text', { x: 480, y: 394, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/s10994-021-06117-0';
    t2(g5, 480, 460, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.rows1.forEach(function (r) {
      var s = seg(t, r.t0, r.t0 + 1.2);
      r.bar.setAttribute('x2', 110 + r.len * s);
      r.mk.setAttribute('opacity', seg(t, r.t0 + 1.1, r.t0 + 1.4));
    });
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.km.setAttribute('opacity', seg(t, 4.0, 4.5));
    S.kmPath.setAttribute('stroke-dashoffset', S.kmLen * (1 - seg(t, 4.2, 6.2)));
    // scene 2: nodes appear top-down
    S.steps2.forEach(function (st) { st.g.setAttribute('opacity', seg(t, st.t0, st.t0 + 0.4)); });
    S.steps2.forEach(function (st) { if (st.g.querySelector('rect')) st.g.querySelector('rect').setAttribute('stroke', t > st.t0 + 0.3 ? C.a : C.ink); });
    S.thr2.setAttribute('opacity', seg(t, 13.6, 14.0) * (1 - seg(t, 15.0, 15.4)));
    S.p2.setAttribute('opacity', seg(t, 9.4, 10.2));
    // scene 3: a ring visits nodes; the root threshold is re-optimised, then the split order swaps
    var VIS = [[330, 110, 17.0], [480, 220, 18.4], [190, 220, 19.4], [420, 330, 20.2], [480, 220, 21.0]];
    var cur = VIS[0];
    for (var i = 0; i < VIS.length; i++) if (t >= VIS[i][2]) cur = VIS[i];
    S.ring3.setAttribute('cx', cur[0]); S.ring3.setAttribute('cy', cur[1]);
    S.ring3.setAttribute('opacity', seg(t, 16.8, 17.2) * (1 - seg(t, 21.8, 22.2)));
    var thrDone = t >= 17.6, swapDone = t >= 21.2;
    S.thrL.innerHTML = thrDone ? '&lt; 25.031' : '≤ 24.117';
    S.thrR.innerHTML = thrDone ? '≥ 25.031' : '&gt; 24.117';
    S.n3[2].label.textContent = swapDone ? '糖尿病' : '喫煙';
    S.n3[3].label.textContent = swapDone ? '喫煙' : '糖尿病';
    S.lab45L.textContent = swapDone ? 'なし' : '非喫煙';
    S.lab45R.textContent = swapDone ? 'あり' : '喫煙';
    S.e3[6].label.textContent = swapDone ? '非喫煙' : 'なし';
    S.e3[7].label.textContent = swapDone ? '喫煙' : 'あり';
    [S.thrL, S.thrR].forEach(function (e) { e.setAttribute('fill', thrDone ? C.b : C.muted); e.setAttribute('font-weight', thrDone ? 650 : 400); });
    var fin = seg(t, 21.4, 22.0);
    S.n3.forEach(function (n) { n.box.setAttribute('stroke', H.mix(C.ink, C.b, fin)); });
    S.l3.forEach(function (l) { l.label.setAttribute('opacity', fin); });
    S.moves.forEach(function (m, k) {
      var on = (k === 0 && ((t >= 17.0 && t < 18.2) || (t >= 21.0 && t < 22.0)));
      m.querySelector('text').setAttribute('font-weight', on ? 700 : 400);
      m.querySelector('text').setAttribute('fill', on ? C.b : C.ink);
    });
    S.p3.setAttribute('opacity', seg(t, 16.6, 17.4));
    // scene 4: series appear one by one
    S.ser4.forEach(function (s) {
      var a = seg(t, s.t0, s.t0 + 1.0);
      s.path.setAttribute('opacity', a);
      s.dots.forEach(function (d, i) { d.setAttribute('opacity', seg(t, s.t0 + i * 0.12, s.t0 + i * 0.12 + 0.3)); });
      s.lab.setAttribute('opacity', seg(t, s.t0 + 0.9, s.t0 + 1.3));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
