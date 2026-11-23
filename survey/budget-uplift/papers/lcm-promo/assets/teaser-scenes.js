// =====================================================================
// teaser-scenes.js - Midavaine, Fok, Mendes et al. (ECML PKDD 2026 Industrial Track), unofficial explainer.
// Player: teaser-engine.js.
// Scenes 1-3 are schematics. The toy distribution (0.10, 0.15, 0.20, 0.10, no purchase 0.45) is the same as
// Figure 1 on the page and is labelled as a schematic.
// Scene 4 uses only numbers stated in the paper (Table 1 and Sec. 3.1 of arXiv v1).
// Colours: orange = Segment-EMA (prior production policy); blue = LCM-Promo.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'LCM-Promo は文脈と割引の選択肢を並べたプロンプトを LLM に渡す。', en: '' },
    { ja: '次の 1 トークンの確率を識別子だけに絞って正規化し直し、<span class="B">購入のしきい値の分布</span>として読む。', en: '' },
    { ja: '浅い割引から足し上げると、割引を深くしても下がらない<span class="B">反応曲線</span>になる。', en: '' },
    { ja: '離脱者の呼び戻しの A/B テストで、<span class="A">Segment-EMA</span> に比べて購入が 1% 増え、費用が 6% 減った。', en: '' },
    { ja: 'LLM の 1 トークンの出力から、予算つきの配分に使える単調な反応曲線が得られる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan font-size="0.72em" dy="5">' + s + '</tspan><tspan dy="-5"></tspan>'; }

  var Q = [0.10, 0.15, 0.20, 0.10, 0.45];
  var IDS = ['A', 'B', 'C', 'D', '∅'];
  var BX = 90, BW = 64, BG = 26, BY = 420, BH = 300;   // bar chart geometry (scenes 2-3)
  function bx(i) { return BX + i * (BW + BG); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the prompt =====
    var g1 = S.g[0];
    el('rect', { x: 70, y: 70, width: 470, height: 330, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g1);
    t2(g1, 92, 104, 'プロンプト', '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    S.lines1 = [];
    [
      ['システムプロンプト', C.ink],
      ['文脈：日、配達の時間帯', C.ink],
      ['利用者の表現（LCM がログから要約）', C.ink]
    ].forEach(function (r, i) {
      var l = el('g', {}, g1); S.lines1.push(l);
      t2(l, 92, 148 + i * 40, r[0], '', { 'font-size': 18, fill: r[1] });
    });
    var opt = el('g', {}, g1); S.lines1.push(opt);
    t2(opt, 92, 278, '割引の選択肢', '', { 'font-size': 18, fill: C.ink });
    for (var k = 0; k < 4; k++) {
      txt(opt, 112 + k * 104, 318, IDS[k] + ': ' + m('d') + sub(k), { 'font-size': 20, fill: C.b, 'font-weight': 600 });
    }
    t2(opt, 92, 372, '浅い割引 → 深い割引', '', { 'font-size': 15, fill: C.muted });
    S.arrow1 = el('g', {}, g1);
    el('path', { d: 'M548,235 L600,235', stroke: C.muted, 'stroke-width': 2.5, fill: 'none' }, S.arrow1);
    el('path', { d: 'M600,228 L612,235 L600,242 z', fill: C.muted }, S.arrow1);
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 200, 'LLM（4B パラメータ）', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(p1, PX, 236, '取引データで微調整', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 300, '文脈はプロンプトに', '', { 'font-size': 16, fill: C.ink });
    t2(p1, PX, 326, '書くだけで済む', '', { 'font-size': 16, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scenes 2-3: bars of the restricted next-token distribution =====
    S.bars = el('g', {}, svg);
    el('line', { x1: BX - 10, x2: bx(4) + BW + 10, y1: BY, y2: BY, stroke: C.muted, 'stroke-width': 1.5 }, S.bars);
    S.bar = Q.map(function (v, i) {
      var r = el('rect', { x: bx(i), y: BY, width: BW, height: 0, rx: 4, fill: i < 4 ? C.b : C.gray }, S.bars);
      var lab = txt(S.bars, bx(i) + BW / 2, BY - 10, v.toFixed(2), { 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' });
      var id = txt(S.bars, bx(i) + BW / 2, BY + 30, i < 4 ? m('d') + sub(i) : '購入なし', { 'font-size': i < 4 ? 20 : 16, fill: C.ink, 'text-anchor': 'middle' });
      return { r: r, lab: lab, id: id, v: v };
    });
    var p2 = S.p2 = el('g', {}, S.g[1]);
    t2(p2, PX, 110, '次のトークンの確率を', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 136, 'A〜D と ∅ だけに絞り、', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 162, '合計 1 に正規化し直す', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX, 230, m('T') + ' = ' + m('d') + sub('k'), { 'font-size': 26, fill: C.b, 'font-weight': 600 });
    t2(p2, PX, 264, '＝ 買う最も浅い割引', '', { 'font-size': 16, fill: C.ink });
    txt(p2, PX, 318, m('T') + ' = ∞', { 'font-size': 26, fill: C.ink, 'font-weight': 600 });
    t2(p2, PX, 352, '＝ どの割引でも買わない', '', { 'font-size': 16, fill: C.ink });
    t2(S.g[1], 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: cumulative curve over the first four bars =====
    var g3 = S.g[2];
    S.cum = [];
    var acc = 0, pts = [];
    for (var j = 0; j < 4; j++) {
      acc += Q[j];
      var cx = bx(j) + BW / 2, cy = BY - acc * BH;
      pts.push([cx, cy]);
      var g = el('g', {}, g3);
      el('rect', { x: bx(j) + 8, y: cy, width: BW - 16, height: acc * BH, rx: 3, fill: C.bsoft, stroke: C.b, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
      txt(g, cx, cy - 14, acc.toFixed(2), { 'font-size': 18, fill: C.b, 'text-anchor': 'middle', 'font-weight': 650 });
      S.cum.push(g);
    }
    S.curve = el('polyline', { points: pts.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: C.b, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g3);
    S.curveLen = 0;
    for (var n = 1; n < pts.length; n++) S.curveLen += Math.hypot(pts[n][0] - pts[n - 1][0], pts[n][1] - pts[n - 1][1]);
    S.curve.setAttribute('stroke-dasharray', S.curveLen);
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 120, m('r') + sub('k') + ' = ' + m('P') + '(' + m('T') + ' ≤ ' + m('d') + sub('k') + ')', { 'font-size': 22, fill: C.b, 'font-weight': 600 });
    txt(p3, PX, 156, m('d') + sub('k') + ' を出したときの購入確率', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 220, '・割引を深くしても下がらない', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 252, '・購入なしの分が残るので', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX + 14, 278, '1 には届かない', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 340, 'この曲線を予算つきの', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 366, '配分器に渡す', '', { 'font-size': 16, fill: C.ink });
    t2(g3, 940, 520, '模式図（数値は解説者が置いた例）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: results stated in the paper =====
    var g4 = S.g[3];
    var ZX = 420, SC = 28;
    t2(g4, 70, 84, 'Segment-EMA に比べた相対値（1 か月、90% 対 10%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: ZX, x2: ZX, y1: 104, y2: 268, stroke: C.muted, 'stroke-width': 1.5 }, g4);
    t2(g4, ZX, 288, '0', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    S.res = [['購入', 1, 146], ['プロモーション費用', -6, 230]].map(function (r) {
      t2(g4, 70, r[2] + 6, r[0], '', { 'font-size': 18, fill: C.ink });
      var w = Math.abs(r[1]) * SC;
      var rect = el('rect', { x: r[1] >= 0 ? ZX : ZX - w, y: r[2] - 18, width: w, height: 36, rx: 5, fill: C.b }, g4);
      var lab = txt(g4, r[1] >= 0 ? ZX + w + 10 : ZX + 10, r[2] + 9, (r[1] > 0 ? '+' : '−') + Math.abs(r[1]) + '%', { 'font-size': 26, 'font-weight': 700, fill: C.b });
      return { rect: rect, lab: lab, w: w, pos: r[1] >= 0 };
    });
    S.scale = el('g', {}, g4);
    t2(S.scale, 70, 352, '配分の単位', '', { 'font-size': 17, fill: C.ink });
    t2(S.scale, 210, 352, '約 50 セグメント', '', { 'font-size': 17, fill: C.a });
    t2(S.scale, 370, 352, '→', '', { 'font-size': 17, fill: C.muted });
    t2(S.scale, 400, 352, '1,000 超', '', { 'font-size': 20, 'font-weight': 700, fill: C.b });
    t2(S.scale, 70, 396, 'ウォレット構成', '', { 'font-size': 17, fill: C.ink });
    t2(S.scale, 210, 396, '10 通り', '', { 'font-size': 17, fill: C.a });
    t2(S.scale, 370, 396, '→', '', { 'font-size': 17, fill: C.muted });
    t2(S.scale, 400, 396, '100 万超', '', { 'font-size': 20, 'font-weight': 700, fill: C.b });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 130, '予算制約と配分器は', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 156, '両群で同じ。', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 182, '違うのは反応モデルだけ', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 262, 'この結果を受けて', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 288, '離脱者全員に展開', '', { 'font-size': 16, fill: C.ink });
    t2(g4, 940, 520, '論文の表 1 と本文の数値（arXiv v1）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 130, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ECML PKDD 2026 · INDUSTRIAL TRACK';
    el('text', { x: 480, y: 192, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'LCM-Promo: An LLM-Based Uplift Model';
    el('text', { x: 480, y: 236, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'for Promotion Allocation';
    t2(g5, 480, 282, 'LLM をアップリフトモデルとして使うプロモーション配分', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 332, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Nesta Midavaine · Floris Fok · Paulo Mendes · Joao Silva';
    el('text', { x: 480, y: 358, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Önder Akaçık · Dimas Lima · Zülküf Genç';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.1007/978-3-032-37685-5_53';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1
    S.lines1.forEach(function (l, i) { l.setAttribute('opacity', seg(t, 0.8 + i * 0.9, 1.4 + i * 0.9)); });
    S.arrow1.setAttribute('opacity', seg(t, 4.4, 5));
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    // bars: visible in scenes 2-3
    S.bars.setAttribute('opacity', seg(t, 8, 8.6) * (1 - seg(t, 23.4, 24)));
    var grow = seg(t, 9, 11);
    var dim = 1 - 0.55 * seg(t, 16.4, 17.2);
    S.bar.forEach(function (b, i) {
      var h = b.v * BH * grow;
      b.r.setAttribute('y', BY - h); b.r.setAttribute('height', h);
      b.r.setAttribute('opacity', i < 4 ? dim : dim);
      b.lab.setAttribute('y', BY - h - 10);
      b.lab.setAttribute('opacity', seg(t, 10.6, 11.2) * (1 - seg(t, 16.2, 16.8)));
    });
    S.p2.setAttribute('opacity', seg(t, 11.4, 12.2));
    // scene 3
    S.cum.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 17 + i * 0.9, 17.6 + i * 0.9)); });
    S.curve.setAttribute('stroke-dashoffset', S.curveLen * (1 - seg(t, 20.4, 21.6)));
    S.p3.setAttribute('opacity', seg(t, 17.4, 18.2));
    // scene 4
    S.res.forEach(function (r, i) {
      var f = seg(t, 25 + i * 1.4, 26 + i * 1.4);
      r.rect.setAttribute('width', r.w * f);
      if (!r.pos) r.rect.setAttribute('x', 420 - r.w * f);
      r.lab.setAttribute('opacity', seg(t, 25.8 + i * 1.4, 26.3 + i * 1.4));
    });
    S.scale.setAttribute('opacity', seg(t, 28.6, 29.4));
    S.p4.setAttribute('opacity', seg(t, 25.4, 26.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 32 });
})();
