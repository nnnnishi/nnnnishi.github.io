// =====================================================================
// teaser-scenes.js — Li, Sun, Weng, Huo & Ren (CIKM 2020), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図); the amounts 1/2/3/5 RMB are
// the ones used in the paper's A/B test. Scene 4 uses the numbers printed in Table 3 (arXiv v1).
// Colours: orange = coupon cost (amount, alpha*c, budget, increment cost); blue = predicted purchase intent / conversion.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng, clamp = H.clamp;

  var CAPTIONS = [
    { ja: '全員に無作為な額を配ると購入は増えるが、購入者を 1 人増やす<span class="A">費用</span>が最も高くなる。', en: '' },
    { ja: 'IIDN は端末上の行動の並びから、額ごとの<span class="B">購入確率</span>と離脱しやすさを予測する。', en: '' },
    { ja: 'サーバーは<span class="B">購入確率</span>から<span class="A">額 × 双対価格 α</span> を引き、残りが最大の額を配る。', en: '' },
    { ja: '1688 の A/B テストでは、IIDN-MCKP の<span class="A">増分コスト</span>が 10.8 元と最も低かった。', en: '' },
    { ja: '予測した購入確率を予算の価格と比べて、1 人ずつその場で額を決める。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // toy purchase probabilities for one user (scenes 2 and 3)
  var AMT = [1, 2, 3, 5], V = [0.20, 0.26, 0.30, 0.34], V0 = 0.12;
  function alphaAt(t) { return 0.005 + 0.06 * seg(t, 18, 22.5); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: everyone gets a random amount =====
    var g1 = S.g[0];
    var r = rng(7); S.users = [];
    t2(g1, 80, 70, '来訪した利用者', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    for (var row = 0; row < 5; row++) for (var col = 0; col < 8; col++) {
      var x = 110 + col * 64, y = 120 + row * 74, o = {};
      o.c = el('circle', { cx: x, cy: y, r: 13, fill: C.gray }, g1);
      o.tag = el('g', {}, g1);
      el('rect', { x: x + 4, y: y + 6, width: 30, height: 22, rx: 4, fill: C.a }, o.tag);
      var a = [1, 2, 3, 5][Math.floor(r() * 4)];
      el('text', { x: x + 19, y: y + 22, 'font-size': 14, 'font-weight': 600, fill: '#fff', 'text-anchor': 'middle' }, o.tag).textContent = a;
      o.t0 = 1.2 + (row * 8 + col) * 0.11; o.amt = a;
      S.users.push(o);
    }
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 110, 'All-allocation', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 150, '全員に配る', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 178, '額は 1・2・3・5 元から無作為', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 240, '予算 ' + m('B') + ' の残り', '', { 'font-size': 17, fill: C.a });
    el('rect', { x: PX, y: 256, width: 240, height: 22, rx: 4, fill: C.panel }, p1);
    S.budget1 = el('rect', { x: PX, y: 256, width: 240, height: 22, rx: 4, fill: C.a }, p1);
    t2(p1, PX, 330, '反応しにくい人にも', '', { 'font-size': 15, fill: C.muted });
    t2(p1, PX, 354, '同じように予算を使う。', '', { 'font-size': 15, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: IIDN on the device predicts pP per amount =====
    var g2 = S.g[1];
    t2(g2, 70, 70, '端末上の行動の並び ' + m('s'), '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.chips = ['商品をクリック', 'お気に入り', '閲覧 12 秒', 'タップ', '商品をクリック'].map(function (s, i) {
      var g = el('g', {}, g2), y = 100 + i * 56;
      el('rect', { x: 70, y: y, width: 140, height: 38, rx: 19, fill: C.panel }, g);
      t2(g, 140, y + 25, s, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      return g;
    });
    el('rect', { x: 230, y: 170, width: 160, height: 130, rx: 12, fill: '#fff', stroke: C.ink, 'stroke-width': 1.8 }, g2);
    txt(g2, 310, 225, 'IIDN', { 'font-size': 24, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(g2, 310, 255, 'LSTM＋アテンション', '', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, 310, 340, '＋静的な特徴 ' + m('h'), '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g2, 310, 364, '＋クーポン額 ' + m('c'), '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    el('line', { x1: 212, y1: 235, x2: 228, y2: 235, stroke: C.muted, 'stroke-width': 2 }, g2);
    el('line', { x1: 392, y1: 235, x2: 422, y2: 235, stroke: C.muted, 'stroke-width': 2 }, g2);
    t2(g2, 430, 110, '購入確率 ' + m('pP') + '（額ごと）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    S.bars2 = [V0].concat(V).map(function (v, k) {
      var x = 436 + k * 34, o = { v: v };
      o.r = el('rect', { x: x, y: 420, width: 24, height: 0, rx: 3, fill: C.b }, g2);
      o.l = el('text', { x: x + 12, y: 420, 'font-size': 13, fill: C.ink, 'text-anchor': 'middle' }, g2);
      o.l.textContent = v.toFixed(2).slice(1);
      el('text', { x: x + 12, y: 444, 'font-size': 14, fill: C.a, 'text-anchor': 'middle' }, g2).textContent = [0, 1, 2, 3, 5][k];
      return o;
    });
    t2(g2, 520, 470, '額（元）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '出力は 2 つ', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 160, '購入確率 ' + m('pP') + '(' + m('s, h, c') + ')', '', { 'font-size': 17, fill: C.b });
    t2(p2, PX, 192, '滞在確率 ' + m('pS') + '(' + m('s, h, c') + ')', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 250, '買うにはまず留まる：', '', { 'font-size': 16, fill: C.ink });
    txt(p2, PX, 280, m('pP') + ' = ' + m('pS') + ' × ' + m('pPS'), { 'font-size': 18, fill: C.ink });
    t2(p2, PX, 330, '端末上で動かし、サーバーには', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 354, '2 つの値だけを送る。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（行動と確率は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: rule argmax_j (v_ij - alpha c_j), alpha sweeps =====
    var g3 = S.g[2], SC = 1000, BX = 160;
    t2(g3, 70, 70, 'ある利用者の額ごとの値', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.rows3 = AMT.map(function (a, k) {
      var y = 120 + k * 80, o = {};
      o.box = el('rect', { x: 64, y: y - 12, width: 552, height: 58, rx: 10, fill: 'none', stroke: C.b, 'stroke-width': 2.5 }, g3);
      txt(g3, 140, y + 25, a + ' 元', { 'font-size': 18, fill: C.ink, 'text-anchor': 'end' });
      o.net = el('rect', { x: BX, y: y, width: 0, height: 34, rx: 3, fill: C.b }, g3);
      o.cost = el('rect', { x: BX, y: y, width: 0, height: 34, rx: 3, fill: C.a }, g3);
      o.val = el('text', { x: 600, y: y + 24, 'font-size': 18, fill: C.ink, 'text-anchor': 'end' }, g3);
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 130, m('v') + ' − ' + m('α') + m('c'), { 'font-size': 34, 'font-weight': 650, fill: C.ink });
    t2(p3, PX, 166, 'が最大の額を配る', '', { 'font-size': 17, fill: C.ink });
    S.alphaTxt = txt(p3, PX, 230, '', { 'font-size': 24, 'font-weight': 650, fill: C.a });
    S.pickTxt = txt(p3, PX, 272, '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 330, m('α') + ' が大きいほど、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 356, '小さい額が選ばれる。', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（購入確率と ' + m('α') + ' は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });
    S.SC = SC; S.BX = BX;

    // ===== scene 4: Table 3 (arXiv v1) =====
    var g4 = S.g[3];
    var rows = [['Non-allocation', 10.7, 0], ['All-allocation', 13.7, 19.4], ['Uplift-allocation', 13.0, 14.2], ['IIDN-MCKP', 13.4, 10.8]];
    var L0 = 240, LS = 10, R0 = 440, RS = 6, Y0 = 140, DY = 76;
    t2(g4, L0, 92, '転換率（%）', '', { 'font-size': 16, 'font-weight': 600, fill: C.b });
    t2(g4, R0, 92, '増分コスト（元）', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    el('line', { x1: L0, x2: L0, y1: 106, y2: Y0 + DY * 3 + 30, stroke: C.ink }, g4);
    el('line', { x1: R0, x2: R0, y1: 106, y2: Y0 + DY * 3 + 30, stroke: C.ink }, g4);
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = {}, hi = i === 3, w = hi ? 700 : 400;
      o.g = el('g', {}, g4);
      el('text', { x: L0 - 12, y: y + 6, 'font-size': 16, 'font-weight': w, fill: C.ink, 'text-anchor': 'end' }, o.g).textContent = rw[0];
      el('rect', { x: L0, y: y - 16, width: rw[1] * LS, height: 32, rx: 3, fill: C.b, opacity: hi ? 1 : 0.45 }, o.g);
      el('text', { x: L0 + rw[1] * LS + 6, y: y + 6, 'font-size': 16, 'font-weight': w, fill: C.ink }, o.g).textContent = rw[1].toFixed(1);
      if (rw[2] > 0) el('rect', { x: R0, y: y - 16, width: rw[2] * RS, height: 32, rx: 3, fill: C.a, opacity: hi ? 1 : 0.45 }, o.g);
      el('text', { x: R0 + rw[2] * RS + 6, y: y + 6, 'font-size': 16, 'font-weight': w, fill: C.ink }, o.g).textContent = rw[2] === 0 ? '0' : rw[2].toFixed(1);
      o.t0 = 25 + i * 0.8;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '購入者を 1 人増やす費用', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 156, '10.8', { 'font-size': 40, 'font-weight': 650, fill: C.a });
    t2(p4, PX + 88, 156, '元', '', { 'font-size': 20, fill: C.ink });
    t2(p4, PX, 196, '全員に配る方策は 19.4 元', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 250, '転換率（配らない群との比較）', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 290, '10.7% → 13.4%', { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 344, '予算はどの方策も 100 万元', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 370, '利用者 500 万人超の A/B テスト', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 3（arXiv v1）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM · 2020';
    ['Spending Money Wisely:', 'Online Electronic Coupon Allocation', 'based on Real-Time User Intent Detection'].forEach(function (s, i) {
      el('text', { x: 480, y: 190 + i * 42, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 322, 'お金を賢く使う：リアルタイムの意図検出にもとづくオンライン電子クーポン配布', '', { 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 370, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Liangwei Li · Liucheng Sun · Chenwei Weng · Chengfu Huo · Weijun Ren';
    el('text', { x: 480, y: 420, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2008.09982';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: coupon tags appear one by one, budget drains
    var spent = 0, total = 0;
    S.users.forEach(function (o) { total += o.amt; });
    S.users.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.3);
      o.tag.setAttribute('opacity', s);
      o.c.setAttribute('fill', H.mix(C.gray, C.ink, 0.25 * s));
      spent += o.amt * s;
    });
    S.budget1.setAttribute('width', 240 * (1 - 0.92 * spent / total));
    S.p1.setAttribute('opacity', seg(t, 1, 1.8));
    // scene 2: chips light up in order, then bars grow
    S.chips.forEach(function (g, i) { g.setAttribute('opacity', 0.25 + 0.75 * seg(t, 9 + i * 0.4, 9.4 + i * 0.4)); });
    S.bars2.forEach(function (o, k) {
      var h = o.v * 800 * seg(t, 11.4 + k * 0.3, 12.2 + k * 0.3);
      o.r.setAttribute('y', 420 - h); o.r.setAttribute('height', h);
      o.l.setAttribute('y', 412 - h); o.l.setAttribute('opacity', seg(t, 12 + k * 0.3, 12.4 + k * 0.3));
    });
    S.p2.setAttribute('opacity', seg(t, 9.5, 10.3));
    // scene 3: alpha sweeps; net = v - alpha c (blue), alpha c (orange); best row boxed
    var al = alphaAt(t), best = 0, bv = -1;
    AMT.forEach(function (a, k) { var n = V[k] - al * a; if (n > bv) { bv = n; best = k; } });
    var grow = seg(t, 16.6, 17.6);
    S.rows3.forEach(function (o, k) {
      var c = al * AMT[k], n = V[k] - c;
      var wn = Math.max(0, n) * S.SC * grow, wc = c * S.SC * grow;
      o.net.setAttribute('width', wn);
      o.cost.setAttribute('x', S.BX + wn); o.cost.setAttribute('width', wc);
      o.val.textContent = n.toFixed(2);
      o.val.setAttribute('opacity', grow);
      o.val.setAttribute('font-weight', k === best ? 700 : 400);
      o.box.setAttribute('opacity', k === best ? seg(t, 17.4, 17.9) : 0);
    });
    S.alphaTxt.innerHTML = m('α') + ' = ' + al.toFixed(3);
    S.pickTxt.textContent = '選ぶ額：' + AMT[best] + ' 元';
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.6));
    // scene 4: rows appear in order, then the summary
    S.rows4.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.5)); });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
