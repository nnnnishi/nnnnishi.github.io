// =====================================================================
// teaser-scenes.js — Aghaei, Azizi & Vayanos, "Learning Optimal and Fair Decision Trees for
// Non-Discriminative Decision-Making" (AAAI 2019; numbers from arXiv 1903.10598), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen people and values (labelled 模式図).
// Scene 4 uses DTDI 0.32% / 0.7% and the average solve times stated in Section 4 of the paper.
// Colours: orange = discrimination / the lambda = 0 tree; blue = the fairness regulariser / MIP-DT.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '保護属性を除いて学習した木でも、<span class="A">グループによって承認される割合が変わる</span>ことがある。', en: '' },
    { ja: '差別には似た人の扱いが違う「処遇の不平等」と、グループごとの結果の割合が違う「結果の不平等」がある。', en: '' },
    { ja: '論文は<span class="B">誤差に差別の指標を λ 倍して加えた目的</span>を、木の構造ごと MILP で最小にする。', en: '' },
    { ja: 'Adult の分割では処遇の不平等の指標が 0.7% から 0.32% に下がったが、学習には平均で約 5 時間かかった。', en: '' },
    { ja: '差別の指標を罰則にすれば、既存の手法より精度の損失を抑えて、公平で解釈しやすい木を最適化で作れる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function person(g, x, y, sq) {
    return sq ? el('rect', { x: x - 11, y: y - 11, width: 22, height: 22, rx: 3, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g)
              : el('circle', { cx: x, cy: y, r: 11, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two groups through a tree without the protected attribute =====
    var g1 = S.g[0];
    el('rect', { x: 70, y: 80, width: 200, height: 60, rx: 10, fill: C.panel }, g1);
    t2(g1, 170, 107, '決定木', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g1, 170, 129, '（人種は入力しない）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g1, 78, 210, 'グループ 1', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 78, 310, 'グループ 2', '', { 'font-size': 15, fill: C.muted });
    S.p1 = [];
    for (var r = 0; r < 2; r++) for (var i = 0; i < 10; i++) {
      var sh = person(g1, 90 + i * 48, 240 + r * 100, r === 1);
      S.p1.push({ e: sh, on: r === 0 ? i < 6 : i < 3, k: i });
    }
    t2(g1, 70, 430, '塗りつぶし：承認', '', { 'font-size': 15, fill: C.muted });
    S.r1 = el('g', {}, g1);
    t2(S.r1, PX, 140, '承認される割合', '', { 'font-size': 17, fill: C.ink });
    txt(S.r1, PX, 200, '60%', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    t2(S.r1, PX + 110, 200, 'グループ 1', '', { 'font-size': 15, fill: C.muted });
    txt(S.r1, PX, 260, '30%', { 'font-size': 40, 'font-weight': 650, fill: C.ink });
    t2(S.r1, PX + 110, 260, 'グループ 2', '', { 'font-size': 15, fill: C.muted });
    S.gap1 = t2(S.r1, PX, 320, '30 ポイントの差', '', { 'font-size': 22, 'font-weight': 650, fill: C.a });
    t2(g1, 940, 520, '模式図（人数と割合は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: disparate treatment vs disparate impact =====
    var g2 = S.g[1];
    el('rect', { x: 70, y: 70, width: 250, height: 340, rx: 12, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
    el('rect', { x: 345, y: 70, width: 250, height: 340, rx: 12, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g2);
    t2(g2, 195, 105, '処遇の不平等', '', { 'font-size': 19, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 195, 130, '（直接差別）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, 470, 105, '結果の不平等', '', { 'font-size': 19, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 470, 130, '（間接差別）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.dt = el('g', {}, g2);
    person(S.dt, 145, 200, false); person(S.dt, 245, 200, true);
    t2(S.dt, 195, 250, '保護属性以外は同じ', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(S.dt, 145, 310, '承認', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    txt(S.dt, 245, 310, '却下', { 'font-size': 18, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    txt(S.dt, 195, 370, 'DTDI', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    S.di = el('g', {}, g2);
    el('line', { x1: 385, x2: 555, y1: 330, y2: 330, stroke: C.ink, 'stroke-width': 1.5 }, S.di);
    S.diBar1 = el('rect', { x: 400, y: 330, width: 60, height: 0, fill: C.gray }, S.di);
    S.diBar2 = el('rect', { x: 480, y: 330, width: 60, height: 0, fill: C.a }, S.di);
    t2(S.di, 430, 352, 'グループ 1', '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    t2(S.di, 510, 352, 'グループ 2', '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    t2(S.di, 470, 165, '承認される割合', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(S.di, 470, 390, 'DIDI', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    S.p2 = el('g', {}, g2);
    t2(S.p2, PX, 140, '論文は 2 つの指標を', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 166, '分類と回帰で同じ形に定める', '', { 'font-size': 17, fill: C.ink });
    t2(S.p2, PX, 220, 'DTDI：近い人どうしの', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 244, '　　　割合の差', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 284, 'DIDI：全体とグループの', '', { 'font-size': 16, fill: C.muted });
    t2(S.p2, PX, 308, '　　　割合の差', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: error + lambda * discrimination =====
    var g3 = S.g[2];
    txt(g3, 70, 110, '誤差 <tspan fill="' + C.b + '">＋ ' + m('λ') + ' × 差別の指標</tspan>', { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    t2(g3, 70, 145, 'を木の分岐・葉の予測ごと MILP で最小にする', '', { 'font-size': 16, fill: C.muted });
    var BX = 200, BW = 380;
    t2(g3, BX - 14, 236, '差別の指標', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, BX - 14, 316, '誤差', '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
    el('rect', { x: BX, y: 214, width: BW, height: 32, rx: 4, fill: C.panel }, g3);
    el('rect', { x: BX, y: 294, width: BW, height: 32, rx: 4, fill: C.panel }, g3);
    S.disc = el('rect', { x: BX, y: 214, width: 0, height: 32, rx: 4, fill: C.a }, g3);
    S.err = el('rect', { x: BX, y: 294, width: 0, height: 32, rx: 4, fill: C.gray }, g3);
    el('line', { x1: BX, x2: BX + BW, y1: 410, y2: 410, stroke: C.hair, 'stroke-width': 6, 'stroke-linecap': 'round' }, g3);
    S.knob = el('circle', { cx: BX, cy: 410, r: 11, fill: C.b }, g3);
    txt(g3, BX - 14, 416, m('λ'), { 'font-size': 20, fill: C.ink, 'text-anchor': 'end' });
    S.p3 = el('g', {}, g3);
    S.lamTxt = txt(S.p3, PX, 230, m('λ') + ' = 0.0', { 'font-size': 36, 'font-weight': 650, fill: C.b });
    t2(S.p3, PX, 280, 'λ を上げると差別は減り、', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 306, '誤差は少し増える', '', { 'font-size': 16, fill: C.ink });
    t2(S.p3, PX, 350, '実験では差別の指標が', '', { 'font-size': 15, fill: C.muted });
    t2(S.p3, PX, 374, '0.01% を下回るまで上げた', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（棒の長さは解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: DTDI on Adult and solve times (Section 4) =====
    var g4 = S.g[3];
    t2(g4, 70, 70, 'Adult の 1 つの分割での DTDI', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var DX = 230, DS = 380;   // 0.8% -> 380 px
    S.bars4 = [['λ = 0 の木', 0.7, C.a, '0.7%'], ['提案法', 0.32, C.b, '0.32%']].map(function (rw, i) {
      var y = 120 + i * 60, o = {};
      t2(g4, DX - 14, y + 7, rw[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: DX, y: y - 17, width: 0, height: 34, rx: 3, fill: rw[2] }, g4);
      o.lab = txt(g4, DX + rw[1] / 0.8 * DS + 10, y + 8, rw[3], { 'font-size': 19, 'font-weight': 650, fill: C.ink });
      o.full = rw[1] / 0.8 * DS; o.t0 = 25 + i * 0.8;
      return o;
    });
    S.time4 = el('g', {}, g4);
    t2(S.time4, 70, 280, '平均の求解時間（秒）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(S.time4, 300, 316, '提案法', '', { 'font-size': 15, fill: C.b, 'text-anchor': 'end' });
    t2(S.time4, 580, 316, '公平なロジスティック回帰', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    [['Default', '18,421', '18.4'], ['Adult', '15,945', '16.0'], ['COMPAS', '18,162', '7.6']].forEach(function (rw, i) {
      var y = 356 + i * 40;
      txt(S.time4, 70, y, rw[0], { 'font-size': 17, fill: C.ink });
      txt(S.time4, 300, y, rw[1], { 'font-size': 19, 'font-weight': 650, fill: C.ink, 'text-anchor': 'end' });
      txt(S.time4, 580, y, rw[2], { 'font-size': 19, fill: C.ink, 'text-anchor': 'end' });
    });
    S.p4 = el('g', {}, g4);
    t2(S.p4, PX, 120, '似た人が同じ扱いを', '', { 'font-size': 17, fill: C.ink });
    t2(S.p4, PX, 146, '受ける見込み', '', { 'font-size': 17, fill: C.ink });
    t2(S.p4, PX, 172, '（λ = 0 の木と比べて）', '', { 'font-size': 15, fill: C.muted }); txt(S.p4, PX, 226, '2 倍', { 'font-size': 44, 'font-weight': 650, fill: C.b });
    t2(S.p4, PX, 300, '予測はミリ秒単位、', '', { 'font-size': 16, fill: C.ink });
    t2(S.p4, PX, 326, '学習は制限時間 5 時間', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文 4 節の数値（arXiv 版）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'AAAI 2019';
    el('text', { x: 480, y: 206, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning Optimal and Fair Decision Trees';
    el('text', { x: 480, y: 250, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Non-Discriminative Decision-Making';
    t2(g5, 480, 294, '差別のない意思決定のための、最適で公平な決定木の学習', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 344, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Sina Aghaei · Mohammad Javad Azizi · Phebe Vayanos';
    el('text', { x: 480, y: 400, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1609/aaai.v33i01.33011418';
    t2(g5, 480, 464, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: approved people fill in, left to right
    S.p1.forEach(function (p) {
      var k = p.on ? seg(t, 1.5 + p.k * 0.35, 1.9 + p.k * 0.35) : 0;
      p.e.setAttribute('fill', H.mix('#FFFFFF', C.ink, k));
    });
    S.r1.setAttribute('opacity', seg(t, 4.2, 5));
    S.gap1.setAttribute('opacity', seg(t, 5.4, 6));
    // scene 2
    S.dt.setAttribute('opacity', seg(t, 8.8, 9.6));
    S.di.setAttribute('opacity', seg(t, 10.4, 11));
    S.diBar1.setAttribute('height', 0); S.diBar2.setAttribute('height', 0);
    var h1 = 140 * seg(t, 11, 12), h2 = 70 * seg(t, 11.4, 12.4);
    S.diBar1.setAttribute('y', 330 - h1); S.diBar1.setAttribute('height', h1);
    S.diBar2.setAttribute('y', 330 - h2); S.diBar2.setAttribute('height', h2);
    S.p2.setAttribute('opacity', seg(t, 12.6, 13.4));
    // scene 3: lambda sweeps 0 -> 1
    var k = seg(t, 18, 22.5);
    S.knob.setAttribute('cx', 200 + 380 * k);
    S.disc.setAttribute('width', 380 * 0.8 * (1 - k) * (1 - k) * seg(t, 16.6, 17.4) + 4);
    S.err.setAttribute('width', 380 * (0.32 + 0.1 * k) * seg(t, 16.6, 17.4));
    S.lamTxt.innerHTML = '<tspan ' + MI + '>λ</tspan> = ' + k.toFixed(1);
    S.p3.setAttribute('opacity', seg(t, 17, 17.8));
    // scene 4
    S.bars4.forEach(function (o) {
      o.bar.setAttribute('width', o.full * seg(t, o.t0, o.t0 + 0.7));
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.time4.setAttribute('opacity', seg(t, 27.5, 28.3));
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
