// =====================================================================
// teaser-scenes.js — Yang et al., "Jointly Optimizing Debiased CTR and Uplift for Coupons Marketing"
// (CIKM 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics; the CTR values in scene 2 and p0, eta, t in scene 3 are explainer-chosen
// toy values (labelled 模式図). Scene 3's curves are computed from the paper's assumption
// logit p_t - logit p_0 = eta * t. Scene 4 uses the numbers printed in Table 1 and Table 3 (arXiv v3).
// Colours: orange = coupon-induced shift left mixed into clicks / conventional models;
//          blue = what UniMVT separates out (debiased base CTR p0, unit sensitivity eta) and UniMVT itself.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '従来の 2 段階型では CTR モデルとアップリフトモデルを別々に学習する。', en: '' },
    { ja: 'クーポンを知らない CTR モデルは<span class="A">クーポンによる押し上げ</span>まで本来の興味として学んでしまう。', en: '' },
    { ja: 'UniMVT は額面の効果をロジット上の <span class="B">η·t</span> のずれとして表し、利用者ごとの感度 η を学ぶ。', en: '' },
    { ja: '感度の高い利用者を上位に並べる CS-Qini では、合成データ 3 種すべてで <span class="B">UniMVT</span> が<span class="A">最良の比較手法</span>を上回った。', en: '' },
    { ja: 'クーポンの押し上げを切り分けて学ぶと、偏りを除いた CTR とクーポンの効果を 1 つのモデルで推定できる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="12" dy="5">' + s + '</tspan><tspan dy="-5"> </tspan>'; }
  function sig(z) { return 1 / (1 + Math.exp(-z)); }
  function logit(p) { return Math.log(p / (1 - p)); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: two-stage separate model =====
    var g1 = S.g[0];
    var defs = el('defs', {}, g1);
    var mk = el('marker', { id: 'tz-ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: C.muted }, mk);
    el('rect', { x: 70, y: 220, width: 110, height: 70, rx: 10, fill: C.panel }, g1);
    t2(g1, 125, 252, '特徴 ' + m('x'), '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
    t2(g1, 125, 276, '（利用者・配信）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.box1 = [];
    [[110, 'CTR モデル', '全標本で学習', '基準の CTR ' + m('p') + sub('0')], [330, 'アップリフトモデル', 'クーポンありの標本だけ', '押し上げ Δ' + m('p')]].forEach(function (b, i) {
      var gb = el('g', {}, g1);
      el('path', { d: 'M180,255 L250,' + (b[0] + 40), stroke: C.muted, 'stroke-width': 1.6, fill: 'none', 'marker-end': 'url(#tz-ar)' }, gb);
      el('rect', { x: 252, y: b[0], width: 200, height: 80, rx: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, gb);
      t2(gb, 352, b[0] + 34, b[1], '', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      t2(gb, 352, b[0] + 60, b[2], '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
      el('path', { d: 'M452,' + (b[0] + 40) + ' L494,' + (b[0] + 40), stroke: C.muted, 'stroke-width': 1.6, fill: 'none', 'marker-end': 'url(#tz-ar)' }, gb);
      t2(gb, 502, b[0] + 46, b[3], '', { 'font-size': 17, fill: C.ink });
      S.box1.push(gb);
    });
    S.warn1 = el('g', {}, g1);
    el('line', { x1: 352, y1: 200, x2: 352, y2: 320, stroke: C.a, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, S.warn1);
    t2(S.warn1, 366, 268, '互いに整合しない', '', { 'font-size': 16, 'font-weight': 600, fill: C.a });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 130, '2 段階型の問題', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p1, PX, 176, 'CTR モデルはクーポンの', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 200, '有無を知らずに学ぶ。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 244, 'アップリフトモデルは', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 268, 'クーポンを受けた標本だけで', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 292, '学ぶので、データが少ない。', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 340, '論文 Fig. 1(b) の構成', '', { 'font-size': 14, fill: C.muted });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: observed CTR mixes base interest and coupon boost =====
    var g2 = S.g[1];
    var BY = 440, U = 60;   // px per percentage point
    t2(g2, 70, 60, 'クリック率（%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 70, x2: 600, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = [];
    var cols = [
      { x: 110, base: 3, boost: 0, l1: 'クーポンなし', l2: 'の表示' },
      { x: 270, base: 3, boost: 2, l1: 'クーポンあり', l2: 'の表示' },
      { x: 430, base: 3.8, boost: 0, l1: 'クーポンを知らない', l2: 'モデルの基準 CTR', bad: true }
    ];
    cols.forEach(function (c, i) {
      var o = {};
      o.b = el('rect', { x: c.x, y: BY, width: 110, height: 0, fill: c.bad ? C.a : C.b }, g2);
      o.u = el('rect', { x: c.x, y: BY, width: 110, height: 0, fill: C.a, opacity: 0.55 }, g2);
      o.v = txt(g2, c.x + 55, 0, (c.base + c.boost).toFixed(1), { 'font-size': 18, 'font-weight': 650, fill: c.bad ? C.a : C.ink, 'text-anchor': 'middle' });
      t2(g2, c.x + 55, BY + 26, c.l1, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      t2(g2, c.x + 55, BY + 48, c.l2, '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      o.c = c; o.t0 = 9 + i * 1.6;
      S.bars2.push(o);
    });
    S.ref2 = el('line', { x1: 100, x2: 560, y1: BY - 3 * U, y2: BY - 3 * U, stroke: C.b, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g2);
    S.ref2lab = t2(g2, 100, BY - 3 * U - 10, '本来の興味（基準の CTR）= 3.0', '', { 'font-size': 15, fill: C.b });
    S.boostlab = t2(g2, 270 + 55, BY - 5 * U - 34, '＋押し上げ 2.0', '', { 'font-size': 15, fill: C.a, 'text-anchor': 'middle' });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 120, '観測したクリック', '', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 148, '＝ 本来の興味', '', { 'font-size': 17, fill: C.b });
    t2(p2, PX, 176, '＋ クーポンの押し上げ', '', { 'font-size': 17, fill: C.a });
    t2(p2, PX, 230, 'クーポンを知らないまま', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 254, '学ぶと、基準の CTR が', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 278, '高めに出る。', '', { 'font-size': 16, fill: C.ink });
    t2(p2, PX, 326, '高い額面は反応しやすい', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 350, '利用者に偏って配られる', '', { 'font-size': 15, fill: C.muted });
    t2(p2, PX, 374, '（選択バイアス）。', '', { 'font-size': 15, fill: C.muted });
    t2(g2, 940, 520, '模式図（数値は解説者が置いた例。表示の 4 割にクーポン）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: logit-linear shift, sweep the face value t =====
    var g3 = S.g[2];
    var AX0 = 100, AX1 = 590, AY0 = 450, AY1 = 80, ETA = 0.3;
    S.sx = function (t) { return AX0 + t / 10 * (AX1 - AX0); };
    S.sy = function (p) { return AY0 - p * (AY0 - AY1); };
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g3);
    [0, 0.5, 1].forEach(function (v) {
      el('text', { x: AX0 - 10, y: S.sy(v) + 5, 'font-size': 15, fill: C.muted, 'text-anchor': 'end' }, g3).textContent = String(v);
    });
    t2(g3, AX1, AY0 + 30, '額面 ' + m('t') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g3, AX0 + 10, AY1 - 22, '↑ クリック確率 ' + m('p') + sub(m('t')), '', { 'font-size': 16, fill: C.ink });
    S.users3 = [['A', 0.05], ['B', 0.40]].map(function (u) {
      var o = { p0: u[1] }, pts = [];
      for (var k = 0; k <= 100; k++) { var t = k / 10; pts.push(S.sx(t).toFixed(1) + ',' + S.sy(sig(logit(u[1]) + ETA * t)).toFixed(1)); }
      el('line', { x1: AX0, x2: AX1, y1: S.sy(u[1]), y2: S.sy(u[1]), stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g3);
      o.path = el('polyline', { points: pts.join(' '), fill: 'none', stroke: C.b, 'stroke-width': 3 }, g3);
      o.len = 0;
      o.dot = el('circle', { r: 9, fill: C.b }, g3);
      txt(g3, AX1 + 12, S.sy(sig(logit(u[1]) + ETA * 10)) + 6, u[0], { 'font-size': 18, 'font-weight': 650, fill: C.b });
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, 'logit ' + m('p') + sub(m('t')) + '− logit ' + m('p') + sub('0'), { 'font-size': 22, 'font-weight': 600, fill: C.ink });
    txt(p3, PX, 158, '= ' + m('η') + '·' + m('t'), { 'font-size': 26, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 204, '2 人とも ' + m('η') + ' = 0.3', '', { 'font-size': 16, fill: C.ink });
    S.tval = txt(p3, PX, 246, '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    S.aval = txt(p3, PX, 282, '', { 'font-size': 16, fill: C.ink });
    S.bval = txt(p3, PX, 312, '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 360, '確率で見ると効果は', '', { 'font-size': 15, fill: C.muted });
    t2(p3, PX, 384, '額面とともに頭打ちになる。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '模式図（' + m('p') + sub('0') + 'と ' + m('η') + ' は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: CS-Qini on synthetic data (Table 1, arXiv v3) =====
    var g4 = S.g[3];
    var rows = [['Syn-1', 103.09, 38.12, 'DRNet'], ['Syn-2', 83.94, 42.78, 'DRNet'], ['Syn-3', 100.34, 56.61, 'T-Learner']];
    var X0 = 170, PXU = 3.6;   // px per CS-Qini unit
    t2(g4, 70, 60, 'CS-Qini（合成データ、大きいほどよい）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0, x2: X0, y1: 90, y2: 470, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    S.rows4 = rows.map(function (r, i) {
      var y = 100 + i * 124, o = {};
      el('text', { x: X0 - 16, y: y + 50, 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = r[0];
      o.u = el('rect', { x: X0, y: y + 8, width: 0, height: 36, rx: 3, fill: C.b }, g4);
      o.b = el('rect', { x: X0, y: y + 52, width: 0, height: 36, rx: 3, fill: C.a }, g4);
      o.uw = r[1] * PXU; o.bw = r[2] * PXU;
      o.ut = t2(g4, X0 + o.uw + 10, y + 32, 'UniMVT ' + r[1].toFixed(2), '', { 'font-size': 15, fill: C.ink });
      o.bt = t2(g4, X0 + o.bw + 10, y + 76, r[3] + ' ' + r[2].toFixed(2), '', { 'font-size': 15, fill: C.ink });
      o.t0 = 25 + i * 1.1;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('rect', { x: PX, y: 96, width: 18, height: 18, rx: 3, fill: C.b }, p4);
    t2(p4, PX + 28, 111, 'UniMVT', '', { 'font-size': 16, fill: C.ink });
    el('rect', { x: PX, y: 128, width: 18, height: 18, rx: 3, fill: C.a }, p4);
    t2(p4, PX + 28, 143, '比較手法 7 つの最良', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 208, '快手の A/B テスト', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 250, '+18.14%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 278, 'クーポン経由の収益', '', { 'font-size': 15, fill: C.ink });
    txt(p4, PX, 330, '−86.51%', { 'font-size': 28, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 356, '較正誤差（クーポンあり）', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 388, '比較対象は従来の 2 段階モデル', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 1・Table 3（arXiv v3）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 128, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'CIKM · 2026';
    ['Jointly Optimizing Debiased CTR and Uplift', 'for Coupons Marketing:', 'A Unified Causal Framework'].forEach(function (s, i) {
      el('text', { x: 480, y: 186 + i * 42, 'font-size': 30, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = s;
    });
    t2(g5, 480, 336, 'クーポン施策のための、偏りを除いた CTR とアップリフトの同時最適化', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 384, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Siyun Yang, Shixiao Yang, Jian Wang, et al. (Kuaishou Technology ほか)';
    el('text', { x: 480, y: 428, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1145/3799682.3840119';
    t2(g5, 480, 476, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: boxes appear, then the warning
    S.box1.forEach(function (gb, i) { gb.setAttribute('opacity', seg(t, 0.8 + i * 1.2, 1.4 + i * 1.2)); });
    S.warn1.setAttribute('opacity', seg(t, 3.6, 4.2));
    S.p1.setAttribute('opacity', seg(t, 4.2, 5));
    // scene 2: bars grow in order
    var BY = 440, U = 60;
    S.bars2.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 1), s2 = seg(t, o.t0 + 0.8, o.t0 + 1.6);
      var hb = o.c.base * U * s, hu = o.c.boost * U * s2;
      o.b.setAttribute('y', BY - hb); o.b.setAttribute('height', hb);
      o.u.setAttribute('y', BY - hb - hu); o.u.setAttribute('height', hu);
      o.v.setAttribute('y', BY - hb - hu - 10);
      o.v.setAttribute('opacity', o.c.boost === 0 && !o.c.bad ? 0 : seg(t, o.t0 + 1.4, o.t0 + 1.9));
    });
    S.ref2.setAttribute('opacity', seg(t, 13.4, 14)); S.ref2lab.setAttribute('opacity', seg(t, 13.4, 14));
    S.boostlab.setAttribute('opacity', seg(t, 11.4, 12));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // scene 3: face value sweeps 0 -> 10, dots ride the curves
    var tv = 10 * seg(t, 17.5, 22);
    S.users3.forEach(function (o) {
      var p = sig(logit(o.p0) + 0.3 * tv);
      o.dot.setAttribute('cx', S.sx(tv)); o.dot.setAttribute('cy', S.sy(p));
      o.cur = p;
    });
    S.tval.innerHTML = '額面 <tspan ' + MI + '>t</tspan> = ' + tv.toFixed(1);
    S.aval.innerHTML = 'A：0.05 → ' + S.users3[0].cur.toFixed(3);
    S.bval.innerHTML = 'B：0.40 → ' + S.users3[1].cur.toFixed(3);
    S.p3.setAttribute('opacity', seg(t, 16.8, 17.5));
    // scene 4: bars grow, then the A/B panel
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 1);
      o.u.setAttribute('width', o.uw * s); o.b.setAttribute('width', o.bw * s);
      o.ut.setAttribute('opacity', seg(t, o.t0 + 0.8, o.t0 + 1.2)); o.bt.setAttribute('opacity', seg(t, o.t0 + 0.8, o.t0 + 1.2));
    });
    S.p4.setAttribute('opacity', seg(t, 28.6, 29.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
