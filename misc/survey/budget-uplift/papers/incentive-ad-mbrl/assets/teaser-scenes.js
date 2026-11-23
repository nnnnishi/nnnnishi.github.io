// =====================================================================
// teaser-scenes.js — Zhao et al. (arXiv 2026), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics (scene 2 uses toy curves, labelled 模式図).
// Scene 4 uses the per-user net-profit changes printed in the expanded online A/B table (arXiv v1).
// Colours: orange = model-free offline RL (TD3+BC, IQL, CQL) and the incentive payout side;
//          blue   = the paper's world-model augmentation (MB IQL etc.) and the ad-revenue side.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: 'インセンティブ広告では支払う額 a を先に約束し、<span class="B">広告収入</span>はそのあとで分かる。', en: '' },
    { ja: '額が低すぎれば断られ、高すぎれば<span class="A">支払い</span>が収入を上回る。今回の額は次の数回の反応も変える。', en: '' },
    { ja: '<span class="B">世界モデル</span>で 1 ステップ先の遷移を作り、ログと混ぜ、保守的な正則化をかけて方策を学ぶ。', en: '' },
    { ja: 'オンライン A/B テストでは、<span class="B">世界モデルを加えた MB IQL</span> で純利益が 7.96% 上がり、<span class="A">IQL に戻す</span>と 6.56% 下がった。', en: '' },
    { ja: '先に約束する支払いと後から分かる収入を、ログから学んだ世界モデルでつないで配分を学ぶ。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function T(g, x, y, s, a) { return t2(g, x, y, s, '', a); }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: the order of events =====
    var g1 = S.g[0];
    var steps = [
      ['(i) 約束', '額 ' + m('a') + ' を示す', C.ink, '#FFFFFF'],
      ['受け入れ', '→ 露出 ' + m('z') + ' = 1', C.ink, '#FFFFFF'],
      ['(ii) RTB', '収入 ' + m('I') + ' が入る', C.b, C.bsoft],
      ['(iii)(iv) 視聴完了', m('a') + ' を支払う', C.a, '#FCEBDF']
    ];
    S.steps1 = steps.map(function (s, i) {
      var y = 70 + i * 104, g = el('g', {}, g1);
      el('rect', { x: 90, y: y, width: 330, height: 74, rx: 10, fill: s[3], stroke: s[2], 'stroke-width': 2 }, g);
      T(g, 112, y + 30, s[0], { 'font-size': 17, 'font-weight': 650, fill: s[2] });
      txt(g, 112, y + 58, s[1], { 'font-size': 17, fill: C.ink });
      if (i < 3) el('path', { d: 'M255,' + (y + 76) + ' L255,' + (y + 100), stroke: C.muted, 'stroke-width': 2, fill: 'none' }, g);
      return g;
    });
    S.no1 = el('g', {}, g1);
    T(S.no1, 445, 213, '断る → 終了', { 'font-size': 16, fill: C.muted });
    T(S.no1, 445, 237, '（収入も支払いもなし）', { 'font-size': 15, fill: C.muted });
    el('path', { d: 'M420,210 L438,210', stroke: C.muted, 'stroke-width': 2 }, S.no1);
    var p1 = S.p1 = el('g', {}, g1);
    T(p1, PX, 130, '額は先に決める。', { 'font-size': 18, 'font-weight': 600, fill: C.a });
    T(p1, PX, 176, '収入は露出したあとの', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    T(p1, PX, 204, 'RTB で決まる。', { 'font-size': 18, 'font-weight': 600, fill: C.b });
    T(p1, PX, 262, '支払いは最後まで', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 286, '見たときだけ。', { 'font-size': 16, fill: C.ink });
    T(p1, PX, 340, '終わると次の約束に戻る。', { 'font-size': 16, fill: C.ink });
    T(g1, 940, 520, '論文 Fig. 1 をもとにした模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: toy net-value curve against the incentive amount =====
    var g2 = S.g[1], XA = 90, XB = 590, YB = 440, SY = 300;
    function p(s) { return 1 / (1 + Math.exp(-9 * (s - 0.35))); }
    function rev(s) { return 0.9 * p(s); }
    function pay(s) { return 1.25 * p(s) * s; }
    function poly(fn) { var pts = []; for (var i = 0; i <= 80; i++) { var s = i / 80; pts.push((XA + s * (XB - XA)).toFixed(1) + ',' + (YB - SY * fn(s)).toFixed(1)); } return pts.join(' '); }
    el('line', { x1: XA, x2: XB, y1: YB, y2: YB, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    T(g2, XB, YB + 28, 'インセンティブ額 ' + m('a') + ' →', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    T(g2, XA, 62, '1 回の打診の期待値（模式図）', { 'font-size': 16, fill: C.ink });
    S.rev2 = el('polyline', { points: poly(rev), fill: 'none', stroke: C.b, 'stroke-width': 3, pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    S.pay2 = el('polyline', { points: poly(pay), fill: 'none', stroke: C.a, 'stroke-width': 3, pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    S.net2 = el('polyline', { points: poly(function (s) { return Math.max(0, rev(s) - pay(s)); }), fill: 'none', stroke: C.ink, 'stroke-width': 3.5, pathLength: 1, 'stroke-dasharray': '1 1' }, g2);
    S.lab2 = el('g', {}, g2);
    T(S.lab2, XB + 8, YB - SY * rev(1) + 5, '収入', { 'font-size': 16, fill: C.b, 'font-weight': 600 });
    T(S.lab2, XB - 40, YB - SY * pay(1) + 22, '支払い', { 'font-size': 16, fill: C.a, 'font-weight': 600 });
    T(S.lab2, 300, YB - SY * (rev(0.42) - pay(0.42)) - 14, '純利益', { 'font-size': 16, fill: C.ink, 'font-weight': 600 });
    S.mark2 = el('line', { x1: XA, x2: XA, y1: 90, y2: YB, stroke: C.muted, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    S.lo2 = el('g', {}, p2);
    T(S.lo2, PX, 130, '低すぎる額', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    T(S.lo2, PX, 156, '→ 断られて露出しない', { 'font-size': 16, fill: C.ink });
    S.hi2 = el('g', {}, p2);
    T(S.hi2, PX, 214, '高すぎる額', { 'font-size': 17, 'font-weight': 600, fill: C.a });
    T(S.hi2, PX, 240, '→ 支払いが収入を上回る', { 'font-size': 16, fill: C.a });
    S.seq2 = el('g', {}, p2);
    T(S.seq2, PX, 300, 'さらに、今回の結果が', { 'font-size': 16, fill: C.ink });
    T(S.seq2, PX, 324, '次の数回の反応を変える', { 'font-size': 16, fill: C.ink });
    T(S.seq2, PX, 348, '（高揚と疲れ、Fig. 2）。', { 'font-size': 16, fill: C.ink });
    T(S.seq2, PX, 396, '→ 短い窓の MDP として', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(S.seq2, PX, 420, '　 扱う。', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    T(g2, 940, 520, '模式図（曲線の形は解説者が置いた例）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: world-model rollouts mixed with logged transitions =====
    var g3 = S.g[2];
    T(g3, 80, 74, 'ログの遷移 ' + m('D') + '<tspan font-size="70%" baseline-shift="sub">off</tspan>', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    S.log3 = [];
    for (var i = 0; i < 12; i++) S.log3.push(el('rect', { x: 80 + (i % 6) * 40, y: 96 + Math.floor(i / 6) * 40, width: 30, height: 30, rx: 4, fill: C.gray }, g3));
    S.wm3 = el('g', {}, g3);
    el('rect', { x: 80, y: 210, width: 230, height: 110, rx: 12, fill: C.bsoft, stroke: C.b, 'stroke-width': 2 }, S.wm3);
    T(S.wm3, 98, 240, '世界モデル', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    T(S.wm3, 98, 268, '露出・視聴完了・収入', { 'font-size': 15, fill: C.ink });
    T(S.wm3, 98, 292, '＋ 変化する状態', { 'font-size': 15, fill: C.ink });
    el('path', { d: 'M312,265 L352,265', stroke: C.b, 'stroke-width': 2.5 }, S.wm3);
    T(S.wm3, 360, 240, '1 ステップ先の', { 'font-size': 15, fill: C.b });
    T(S.wm3, 360, 262, '合成遷移 ' + m('D') + '<tspan font-size="70%" baseline-shift="sub">wm</tspan>', { 'font-size': 15, fill: C.b });
    S.syn3 = [];
    for (var j = 0; j < 6; j++) S.syn3.push(el('rect', { x: 360 + (j % 3) * 40, y: 278 + Math.floor(j / 3) * 40, width: 30, height: 30, rx: 4, fill: C.b }, g3));
    // mixing bar
    T(g3, 80, 410, '学習に使う混合分布 ' + m('d') + '<tspan font-size="70%" baseline-shift="sub">f</tspan>', { 'font-size': 16, fill: C.ink });
    el('rect', { x: 80, y: 424, width: 440, height: 26, rx: 13, fill: C.gray }, g3);
    S.mix3 = el('rect', { x: 520, y: 424, width: 0, height: 26, rx: 13, fill: C.b }, g3);
    S.mixl3 = T(g3, 520, 476, '合成の割合 0 → 最大 0.5', { 'font-size': 15, fill: C.b, 'text-anchor': 'end' });
    var p3 = S.p3 = el('g', {}, g3);
    T(p3, PX, 120, '方策は状態 ' + m('s') + ' だけを見て', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 144, '額 ' + m('a') + ' を出す。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 196, '世界モデルが作る候補の', { 'font-size': 16, fill: C.b });
    T(p3, PX, 220, '行動の Q 値は押し下げ、', { 'font-size': 16, fill: C.b });
    T(p3, PX, 244, 'ログの行動を基準に保つ。', { 'font-size': 16, fill: C.b });
    T(p3, PX, 296, 'TD3+BC・IQL に加えて', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 320, 'MB TD3+BC・MB IQL。', { 'font-size': 16, fill: C.ink });
    T(p3, PX, 372, '候補は評価器 CES で', { 'font-size': 15, fill: C.muted });
    T(p3, PX, 394, '事前に選ぶ。', { 'font-size': 15, fill: C.muted });
    T(g3, 940, 520, '論文 Fig. 3 をもとにした模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: online A/B tests, per-user net profit (arXiv v1) =====
    var g4 = S.g[3], Y0 = 250, SC = 17, W = 92, X0 = 110, DX = 135;
    var rows = [['実験 A', 'TD3+BC 対 DESCN', 7.72, C.a, true], ['実験 B', 'IQL 対 TD3+BC', -0.92, C.a, false],
                ['実験 C', 'MB IQL 対 TD3+BC', 7.96, C.b, true], ['実験 D', 'IQL 対 MB IQL', -6.56, C.a, true]];
    T(g4, 40, 58, '人あたり純利益の相対変化（候補 対 稼働中）', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 80, x2: 650, y1: Y0, y2: Y0, stroke: C.ink, 'stroke-width': 1.5 }, g4);
    [-5, 5].forEach(function (v) {
      el('line', { x1: 80, x2: 650, y1: Y0 - v * SC, y2: Y0 - v * SC, stroke: C.hair }, g4);
      el('text', { x: 72, y: Y0 - v * SC + 5, 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }, g4).textContent = (v > 0 ? '+' : '') + v + '%';
    });
    S.rows4 = rows.map(function (r, i) {
      var x = X0 + DX * i, o = { h: Math.abs(r[2]) * SC, up: r[2] >= 0, t0: 25 + i * 0.9 };
      o.bar = el('rect', { x: x, y: Y0, width: W, height: 0, rx: 3, fill: r[3], opacity: r[4] ? 1 : 0.45 }, g4);
      o.v = el('text', { x: x + W / 2, y: o.up ? Y0 - o.h - 10 : Y0 + o.h + 24, 'font-size': 18, 'font-weight': 650, fill: r[3], 'text-anchor': 'middle' }, g4);
      o.v.textContent = (r[2] > 0 ? '+' : '−') + Math.abs(r[2]).toFixed(2) + '%';
      el('text', { x: x + W / 2, y: 420, 'font-size': 16, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, g4).textContent = r[0];
      T(g4, x + W / 2, 446, r[1], { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      return o;
    });
    T(g4, 40, 490, '実験 B は有意差なし。4 回とも人あたり費用に有意差なし。', { 'font-size': 14, fill: C.muted });
    var p4 = S.p4 = el('g', {}, g4);
    T(p4, PX + 20, 120, '世界モデルを加える', { 'font-size': 16, fill: C.muted });
    txt(p4, PX + 20, 162, '+7.96%', { 'font-size': 34, 'font-weight': 650, fill: C.b });
    T(p4, PX + 20, 222, '世界モデルを外す', { 'font-size': 16, fill: C.muted });
    txt(p4, PX + 20, 264, '−6.56%', { 'font-size': 34, 'font-weight': 650, fill: C.a });
    T(p4, PX + 20, 316, 'いずれも ' + m('p') + ' &lt; 0.0001', { 'font-size': 15, fill: C.ink });
    T(p4, PX + 20, 352, 'LT・LTV に有意な変化なし', { 'font-size': 15, fill: C.ink });
    T(p4, PX + 20, 388, '各群 1,000 万端末 ID 超', { 'font-size': 14, fill: C.muted });
    T(g4, 940, 520, '論文の A/B テストの表（arXiv v1）の数値から作図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 140, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'arXiv 2026';
    el('text', { x: 480, y: 186, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Learning to Allocate Incentives for Incentivized';
    el('text', { x: 480, y: 222, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Advertising via Offline Model-Based';
    el('text', { x: 480, y: 258, 'font-size': 28, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Reinforcement Learning';
    T(g5, 480, 298, 'インセンティブ広告で配る額をオフラインのモデルベース強化学習で学ぶ', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 334, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Zilin Zhao · Han Yang · Tianpei Yang · Fangsheng Huang · Yanfei Cui';
    el('text', { x: 480, y: 360, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Kan Peng · Yi Li · Yiming Zong · Hao Zhang · Yinsong Xue';
    el('text', { x: 480, y: 412, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2608.28065';
    T(g5, 480, 468, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: steps appear in order
    S.steps1.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 0.8 + i * 1.1, 1.4 + i * 1.1)); });
    S.no1.setAttribute('opacity', seg(t, 2.4, 3.0));
    S.p1.setAttribute('opacity', seg(t, 4.8, 5.6));
    // scene 2: curves drawn, then a marker sweeps the incentive amount
    S.rev2.setAttribute('stroke-dashoffset', 1 - seg(t, 8.6, 10));
    S.pay2.setAttribute('stroke-dashoffset', 1 - seg(t, 9.4, 10.8));
    S.net2.setAttribute('stroke-dashoffset', 1 - seg(t, 10.6, 12));
    S.lab2.setAttribute('opacity', seg(t, 11.4, 12));
    var sw = seg(t, 12, 14.4), x = 90 + 500 * (0.08 + 0.84 * sw);
    S.mark2.setAttribute('x1', x); S.mark2.setAttribute('x2', x);
    S.mark2.setAttribute('opacity', seg(t, 11.8, 12.2));
    S.lo2.setAttribute('opacity', seg(t, 12.2, 12.8));
    S.hi2.setAttribute('opacity', seg(t, 13.6, 14.2));
    S.seq2.setAttribute('opacity', seg(t, 14.4, 15));
    S.p2.setAttribute('opacity', 1);
    // scene 3: log, world model, synthetic transitions, then the mixing share grows
    S.log3.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 16.6 + i * 0.05, 17.1 + i * 0.05)); });
    S.wm3.setAttribute('opacity', seg(t, 17.6, 18.2));
    S.syn3.forEach(function (r, i) { r.setAttribute('opacity', seg(t, 18.4 + i * 0.15, 18.8 + i * 0.15)); });
    var k = seg(t, 19.8, 21.6);
    S.mix3.setAttribute('width', 220 * k); S.mix3.setAttribute('x', 520 - 220 * k);
    S.mixl3.setAttribute('opacity', seg(t, 19.8, 20.4));
    S.p3.setAttribute('opacity', seg(t, 20.6, 21.4));
    // scene 4: bars grow in experiment order
    S.rows4.forEach(function (o) {
      var h = o.h * seg(t, o.t0, o.t0 + 0.7);
      o.bar.setAttribute('height', h);
      o.bar.setAttribute('y', o.up ? 250 - h : 250);
      o.v.setAttribute('opacity', seg(t, o.t0 + 0.5, o.t0 + 0.9));
    });
    S.p4.setAttribute('opacity', seg(t, 29, 29.8));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
