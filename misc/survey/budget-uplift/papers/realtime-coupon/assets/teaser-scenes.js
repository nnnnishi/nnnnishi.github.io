// =====================================================================
// teaser-scenes.js — Dai, Li, Zhu, Lin & Huang (arXiv 2024), unofficial explainer. Player: teaser-engine.js.
// Scenes 1 and 3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 2 uses Table 3 (city C) and scene 4 uses Table 5 (A/B test) of arXiv v3.
// Colours: orange = previous Offline-IP (batched, group-level, stored); blue = the paper's LDM / LDM-IR.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng, clamp = H.clamp;

  var CAPTIONS = [
    { ja: '従来の Offline-IP は前日に顧客をグループにまとめて整数計画を解き、<span class="A">グループごとの額を保存して</span>翌日に配っていた。', en: '' },
    { ja: '個人単位の整数計画はメモリ不足で解けず、グループにまとめても数十秒かかる。', en: '' },
    { ja: '提案法は予算制約を<span class="B">乗数 λ</span> に置き換え、来訪した顧客ごとに各段のスコアを比べて額を選ぶ。', en: '' },
    { ja: '2 都市の A/B テストでは、<span class="B">LDM-IR</span> の「平均価格 × 購買率」がほかのどの方式よりも高かった。', en: '' },
    { ja: '額は顧客ごとにその場で決め、予算を守る調整は λ に任せて当日の結果で動かす。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: customers grouped, one stored coupon per group =====
    var g1 = S.g[0];
    var boxes = [[80, 300], [210, 300], [340, 300], [470, 300]];
    var coupons = ['2 元引き', '4 元引き', '6 元引き', '8 元引き'];
    S.boxes1 = boxes.map(function (b, k) {
      var gg = el('g', {}, g1);
      el('rect', { x: b[0], y: b[1], width: 115, height: 120, rx: 10, fill: '#fff', stroke: C.a, 'stroke-width': 2 }, gg);
      t2(gg, b[0] + 57, b[1] + 150, coupons[k], '', { 'font-size': 16, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
      return gg;
    });
    t2(g1, 90, 60, '登録者（来訪するかは分からない）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var r = rng(5); S.dots1 = [];
    for (var i = 0; i < 32; i++) {
      var k = i % 4, n = Math.floor(i / 4);
      S.dots1.push({
        x0: 100 + r() * 470, y0: 90 + r() * 150,
        x1: boxes[k][0] + 22 + (n % 4) * 24, y1: boxes[k][1] + 30 + Math.floor(n / 4) * 30,
        c: el('circle', { r: 9, fill: C.gray }, g1), k: r()
      });
    }
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 120, '前日 ' + m('T') + '−1 にまとめて解く', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p1, PX, 170, '来訪確率と購買率を予測', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 206, '似た顧客をグループにまとめ、', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 232, '整数計画で額を決める', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 268, '額を保存し、当日に配る', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 320, '当日の来訪者や情報は', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 344, '額の決定に入らない。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図（額は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: city C, Table 3 =====
    var g2 = S.g[1];
    t2(g2, 80, 90, '都市 C の登録者', '', { 'font-size': 18, fill: C.muted });
    txt(g2, 80, 150, '6,329,069', { 'font-size': 54, 'font-weight': 650, fill: C.ink });
    t2(g2, 358, 150, '人', '', { 'font-size': 26, fill: C.ink });
    S.oom = el('g', {}, g2);
    t2(S.oom, 80, 220, '個人単位の整数計画', '', { 'font-size': 18, fill: C.ink });
    txt(S.oom, 80, 280, 'OOM', { 'font-size': 56, 'font-weight': 700, fill: C.a });
    t2(S.oom, 250, 278, '（メモリ不足）', '', { 'font-size': 22, fill: C.a });
    S.grp = el('g', {}, g2);
    t2(S.grp, 80, 350, '2,029 グループにまとめた場合', '', { 'font-size': 18, fill: C.ink });
    t2(S.grp, 80, 400, 'Offline-IP', '', { 'font-size': 17, fill: C.ink });
    S.barIP = el('rect', { x: 200, y: 384, width: 0, height: 22, rx: 3, fill: C.a }, S.grp);
    S.labIP = t2(S.grp, 210, 401, '83.42 秒', '', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    t2(S.grp, 80, 444, 'LDM-IR', '', { 'font-size': 17, fill: C.ink });
    S.barLD = el('rect', { x: 200, y: 428, width: 0, height: 22, rx: 3, fill: C.b }, S.grp);
    S.labLD = t2(S.grp, 210, 445, '0.28 秒', '', { 'font-size': 17, 'font-weight': 600, fill: C.b });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, 'Offline-IP の弱点', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(p2, PX, 180, '・個人単位では解けない', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 216, '・グループ単位の額になる', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 252, '・来訪の予測が外れると', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX + 17, 278, '予算からずれる', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 330, '目的関数値はほぼ同じ', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 354, '（583,676 と 583,674）', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 3（arXiv v3）の数値', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: one customer, five price levels, lambda sweeps =====
    var g3 = S.g[2];
    S.P = [12, 14, 16, 18, 20]; S.Q = [0.20, 0.16, 0.12, 0.09, 0.07];
    el('circle', { cx: 105, cy: 120, r: 22, fill: C.ink }, g3);
    el('path', { d: 'M70,190 Q105,140 140,190 Z', fill: C.ink }, g3);
    t2(g3, 105, 222, '来訪した顧客', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, 200, 70, '価格', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 300, 70, 'スコア ' + m('v') + ' − ' + m('λq') + '(' + m('p') + '<tspan font-size="11">b</tspan> − ' + m('p') + ')', '', { 'font-size': 15, fill: C.muted });
    S.bars3 = S.P.map(function (p, j) {
      var y = 100 + j * 64;
      t2(g3, 200, y + 22, p + ' 元', '', { 'font-size': 18, fill: C.ink });
      return el('rect', { x: 290, y: y, width: 0, height: 32, rx: 4, fill: C.gray }, g3);
    });
    el('line', { x1: 290, x2: 290, y1: 90, y2: 430, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('j') + '* = argmax', { 'font-size': 26, 'font-weight': 650, fill: C.ink });
    txt(p3, PX, 156, m('v') + ' − ' + m('λq') + '(' + m('p') + '<tspan font-size="14">b</tspan> − ' + m('p') + ')', { 'font-size': 22, fill: C.ink });
    S.lamTxt = txt(p3, PX, 214, '', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    S.pickTxt = txt(p3, PX, 252, '', { 'font-size': 18, fill: C.ink });
    t2(p3, PX, 304, 'λ が大きいほど、高い価格', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 330, '（小さい割引）を選ぶ', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 380, '比べるだけなので', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 404, '50 ミリ秒以内に決まる', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（価格、購買率、' + m('p') + '<tspan font-size="10">b</tspan> = 16 元は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 5, avg price x CVR =====
    var g4 = S.g[3];
    var cities = [
      ['都市 A', [['Random', 2.31, 'g'], ['Manual', 2.42, 'g'], ['LDM', 2.47, 'bo'], ['LDM-IR', 2.54, 'b']]],
      ['都市 B', [['Random', 2.01, 'g'], ['Manual', 2.06, 'g'], ['Offline-IP', 2.09, 'a'], ['LDM-IR', 2.15, 'b']]]
    ];
    var X0 = 200, K = 140;
    t2(g4, 70, 50, '露出ユーザーあたりの「平均価格 × 購買率」（元）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows4 = [];
    cities.forEach(function (c, ci) {
      var y0 = 92 + ci * 210;
      t2(g4, 70, y0, c[0], '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
      c[1].forEach(function (rw, i) {
        var y = y0 + 16 + i * 42, o = {};
        el('text', { x: X0 - 12, y: y + 20, 'font-size': 16, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
        var fill = { g: C.gray, b: C.b, a: C.a, bo: '#fff' }[rw[2]];
        o.r = el('rect', Object.assign({ x: X0, y: y + 2, width: 0, height: 26, rx: 3, fill: fill }, rw[2] === 'bo' ? { stroke: C.b, 'stroke-width': 2 } : {}), g4);
        o.l = el('text', { x: X0 + rw[1] * K + 8, y: y + 21, 'font-size': 16, 'font-weight': 600, fill: C.ink }, g4);
        o.l.textContent = rw[1].toFixed(2);
        o.w = rw[1] * K; o.t0 = 25 + ci * 1.6 + i * 0.35;
        S.rows4.push(o);
      });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, '都市 B：Offline-IP と比べて', '', { 'font-size': 16, fill: C.ink });
    txt(p4, PX, 186, '+2.8%', { 'font-size': 44, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 220, '（論文が示す増加率）', '', { 'font-size': 15, fill: C.muted });
    t2(p4, PX, 280, '購買率も LDM-IR が最高', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 306, '（都市 A 14.49%、都市 B 12.93%）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 360, '2024 年 2〜3 月、', '', { 'font-size': 14, fill: C.muted });
    t2(p4, PX, 382, '各都市で 1 か月の A/B テスト', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 5（arXiv v3）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2024';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Data-Driven Real-time Coupon';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Allocation in the Online Platform';
    t2(g5, 480, 302, 'オンラインプラットフォームでのデータ駆動型リアルタイム・クーポン配分', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Jinglong Dai · Hanwei Li · Weiming Zhu · Jianfeng Lin · Binqiang Huang';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2406.05987';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: dots move into group boxes and turn orange
    var bx = seg(t, 1.2, 1.8);
    S.boxes1.forEach(function (b) { b.setAttribute('opacity', bx); });
    S.dots1.forEach(function (d) {
      var s = seg(t, 1.8 + d.k * 0.8, 3.8 + d.k * 0.8);
      d.c.setAttribute('cx', d.x0 + (d.x1 - d.x0) * s);
      d.c.setAttribute('cy', d.y0 + (d.y1 - d.y0) * s);
      d.c.setAttribute('fill', H.mix(C.gray, C.a, seg(t, 4.6, 5.4)));
    });
    S.p1.setAttribute('opacity', seg(t, 2.0, 2.8));
    // scene 2
    S.oom.setAttribute('opacity', seg(t, 9.4, 10.0));
    S.grp.setAttribute('opacity', seg(t, 11.2, 11.8));
    var w = seg(t, 11.8, 13.6);
    S.barIP.setAttribute('width', 300 * w);
    S.labIP.setAttribute('transform', 'translate(' + (300 * w) + ',0)');
    S.barLD.setAttribute('width', Math.max(0, 300 * 0.28 / 83.42 * w));
    S.labLD.setAttribute('transform', 'translate(' + (300 * 0.28 / 83.42 * w) + ',0)');
    S.labIP.setAttribute('opacity', seg(t, 12.8, 13.4)); S.labLD.setAttribute('opacity', seg(t, 12.8, 13.4));
    S.p2.setAttribute('opacity', seg(t, 9.0, 9.8));
    // scene 3: lambda sweeps from 0.2 to 2.6
    var lam = 0.2 + 2.4 * seg(t, 17.6, 22.6), best = 0, bs = -1e9, sc = [];
    S.P.forEach(function (p, j) {
      var s = p * S.Q[j] - lam * S.Q[j] * (16 - p); sc.push(s);
      if (s >= bs - 1e-9) { bs = s; best = j; }
    });
    var grow = seg(t, 16.6, 17.4);
    S.bars3.forEach(function (b, j) {
      b.setAttribute('width', Math.max(0, sc[j]) * 120 * grow);
      b.setAttribute('fill', j === best ? C.b : C.gray);
    });
    S.lamTxt.innerHTML = m('λ') + ' = ' + lam.toFixed(2);
    S.pickTxt.innerHTML = '選ぶ価格：' + S.P[best] + ' 元';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.6);
      o.r.setAttribute('width', o.w * s); o.l.setAttribute('opacity', seg(t, o.t0 + 0.4, o.t0 + 0.8));
    });
    S.p4.setAttribute('opacity', seg(t, 29.2, 30.0));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
