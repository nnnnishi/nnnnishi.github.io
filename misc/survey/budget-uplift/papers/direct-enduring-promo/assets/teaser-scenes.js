// =====================================================================
// teaser-scenes.js — Yang, Li, Jobson (KDD 2022 Workshop / arXiv:2207.14798), unofficial explainer.
// Player: assets/teaser-engine.js (copied unchanged from template).
// Scenes 1-3 are schematics (labelled 模式図).
// Scene 4 uses only exact numbers from Table 2 of arXiv v1.
// Colours: orange = direct-only focus / baselines; blue = proposed CDEE / enduring effect.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, tx = H.tx, seg = H.seg;

  var CAPTIONS = [
    '従来のクーポン配分は<span class="A">期間中の購入確率（直接効果）</span>だけを予測して最適化してきた。',
    '期間中の購入が増えても、<span class="A">施策後の反動減</span>や、ゼロが多く歪んだ購入金額の分布が予測と最適化を難しくする。',
    '<span class="B">CDEE</span> は直接購入確率・持続購入有無・持続購入金額を 1 つのモデルで階層的に学び、予算内で割り当てる。',
    'メルカリの春・冬 2 つの RCT では、<span class="B">CDEE</span> の 4 週間購入金額の正規化ジニ係数（COEFF）が比較手法を上回った。',
    '期間中の費用と期間後の購入金額を同時に見込むことで、予算内での持続的な効果を高められる。'
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 665;

  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== Scene 1: direct-only focus (schematic) =====
    var g1 = S.g[0];
    tx(g1, 60, 74, '従来のプロモーション意思決定', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    // Timeline
    el('rect', { x: 60, y: 112, width: 170, height: 110, rx: 10, fill: '#FCEBDF', stroke: C.a, 'stroke-width': 2 }, g1);
    tx(g1, 145, 148, '期間中（5 日間）', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
    tx(g1, 145, 180, '購入確率を予測', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
    tx(g1, 145, 204, '（直接効果）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    el('rect', { x: 248, y: 112, width: 350, height: 110, rx: 10, fill: '#F7F8FA', stroke: C.hair, 'stroke-dasharray': '6 5', 'stroke-width': 1.8 }, g1);
    tx(g1, 423, 158, '施策後（〜4 週間）', { 'font-size': 16, 'font-weight': 600, fill: C.muted, 'text-anchor': 'middle' });
    tx(g1, 423, 188, '最適化の対象外', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });

    // Two customers with same conversion but different spend
    S.s1c = el('g', {}, g1);
    tx(S.s1c, 60, 282, '購入確率だけでは顧客ごとの金額差が区別できない', { 'font-size': 15, 'font-weight': 600, fill: C.ink });
    [
      { x: 60, label: '顧客 A', conv: '購入 1 回', amt: '少額', w: 50 },
      { x: 340, label: '顧客 B', conv: '購入 1 回', amt: '高額', w: 220 }
    ].forEach(function (c) {
      el('rect', { x: c.x, y: 300, width: 258, height: 112, rx: 10, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, S.s1c);
      tx(S.s1c, c.x + 18, 330, c.label + '：' + c.conv, { 'font-size': 16, 'font-weight': 600, fill: C.ink });
      el('rect', { x: c.x + 18, y: 348, width: c.w, height: 22, rx: 4, fill: C.a, opacity: 0.75 }, S.s1c);
      tx(S.s1c, c.x + 18, 396, '売上への貢献：' + c.amt, { 'font-size': 14, fill: C.muted });
    });

    S.p1 = el('g', {}, g1);
    tx(S.p1, PX, 140, '既存手法の焦点', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p1, PX, 178, '・期間中の購入有無のみ', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 208, '・購入金額の差を見ない', { 'font-size': 16, fill: C.ink });
    tx(S.p1, PX, 238, '・期間後の動きを見ない', { 'font-size': 16, fill: C.ink });
    tx(g1, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 2: post-promotion dip & zero-inflated skewed spend (schematic) =====
    var g2 = S.g[1];
    // Top-left: Post-promotion dip curve
    tx(g2, 60, 74, '① 施策後の反動減（買い控え・前倒し）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    el('rect', { x: 90, y: 92, width: 115, height: 130, fill: '#FCEBDF', opacity: 0.55 }, g2);
    tx(g2, 147, 110, '期間中', { 'font-size': 13, fill: C.a, 'text-anchor': 'middle', 'font-weight': 600 });
    el('line', { x1: 60, x2: 585, y1: 170, y2: 170, stroke: C.muted, 'stroke-dasharray': '5 4' }, g2);
    tx(g2, 585, 162, '通常水準', { 'font-size': 13, fill: C.muted, 'text-anchor': 'end' });
    S.dipPath = el('path', {
      d: 'M 65 170 L 95 168 L 145 106 L 200 132 L 245 208 L 320 202 L 420 184 L 560 174',
      fill: 'none', stroke: C.a, 'stroke-width': 3.5, 'stroke-linejoin': 'round'
    }, g2);
    S.dipLen = 640;
    S.dipPath.setAttribute('stroke-dasharray', S.dipLen);
    S.dipLabel = el('g', {}, g2);
    tx(S.dipLabel, 285, 224, '施策後に落ち込む', { 'font-size': 15, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });

    // Bottom-left: Zero-inflated skewed spend distribution
    S.skew = el('g', {}, g2);
    tx(S.skew, 60, 276, '② 購入金額の分布は 0 が大半で裾が長い', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    el('line', { x1: 60, x2: 585, y1: 452, y2: 452, stroke: C.ink, 'stroke-width': 1.5 }, S.skew);
    // Zero spike
    el('rect', { x: 84, y: 304, width: 42, height: 148, rx: 3, fill: C.a }, S.skew);
    tx(S.skew, 105, 474, '0 円', { 'font-size': 14, 'font-weight': 600, fill: C.a, 'text-anchor': 'middle' });
    tx(S.skew, 105, 296, '非購入者', { 'font-size': 13, fill: C.a, 'text-anchor': 'middle' });
    // Gap + skewed positive tail
    tx(S.skew, 165, 434, '隙間', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    var bins = [22, 48, 72, 64, 46, 32, 22, 16, 11, 8, 6, 4];
    bins.forEach(function (bh, i) {
      el('rect', { x: 204 + i * 30, y: 452 - bh, width: 24, height: bh, rx: 2, fill: C.gray }, S.skew);
    });
    tx(S.skew, 380, 474, '購入金額（数桁にわたる差）→', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    S.p2 = el('g', {}, g2);
    tx(S.p2, PX, 140, '2 つの課題', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    tx(S.p2, PX, 182, '・直接効果だけでは', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX + 16, 208, '持続効果が保てない', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX, 260, '・通常の L1・L2 損失は', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX + 16, 286, '高額の外れ値に弱く', { 'font-size': 16, fill: C.ink });
    tx(S.p2, PX + 16, 312, '金額回帰が難しい', { 'font-size': 16, fill: C.ink });
    tx(g2, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 3: CDEE layered hybrid loss + MCKP (schematic) =====
    var g3 = S.g[2];
    tx(g3, 60, 70, '提案：CDEE モデルと予算制約つき割当て', { 'font-size': 18, 'font-weight': 650, fill: C.b });

    // Layers bottom-to-top
    S.l3 = [];
    var layers = [
      { y: 392, title: '入力：顧客特徴量 ＋ クーポン種別の埋め込み', sub: '', fill: '#F2F4F7', bd: C.hair, tc: C.ink },
      { y: 294, title: '下層：直接購入確率 ' + m('f') + '†（CE 損失）', sub: '→ 期待費用 cⱼ·f† として予算制約 B へ', fill: '#FCEBDF', bd: C.a, tc: C.a },
      { y: 196, title: '中層：持続購入有無 ' + m('f') + '§（CE 損失）', sub: '→ ゼロ過剰な非購入者を識別して上層へ連結', fill: '#FFFFFF', bd: C.b, tc: C.ink },
      { y: 98,  title: '上層：持続購入金額 ' + m('f') + '‡（Tweedie 損失）', sub: '→ 予算 B 内で合計を最大化する目的関数へ', fill: '#E7EEFC', bd: C.b, tc: C.b }
    ];
    layers.forEach(function (ly, idx) {
      var lg = el('g', {}, g3);
      el('rect', { x: 60, y: ly.y, width: 540, height: idx === 0 ? 52 : 70, rx: 10, fill: ly.fill, stroke: ly.bd, 'stroke-width': 2 }, lg);
      tx(lg, 82, ly.y + (idx === 0 ? 32 : 30), ly.title, { 'font-size': 16, 'font-weight': 650, fill: ly.tc });
      if (ly.sub) tx(lg, 82, ly.y + 54, ly.sub, { 'font-size': 14, fill: C.muted });
      if (idx > 0) {
        var ay = ly.y + 70;
        el('line', { x1: 330, x2: 330, y1: ay + 24, y2: ay + 4, stroke: C.b, 'stroke-width': 2.5 }, lg);
        el('path', { d: 'M324,' + (ay + 10) + ' L330,' + (ay + 1) + ' L336,' + (ay + 10) + ' z', fill: C.b }, lg);
      }
      S.l3.push(lg);
    });

    S.p3 = el('g', {}, g3);
    tx(S.p3, PX, 126, '階層型ハイブリッド損失', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p3, PX, 168, '・Tweedie 損失（' + m('ρ') + ' = 1.5）', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX + 16, 194, '0 での点質量と裾を表現', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 238, '・中層の CE 損失を追加', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX + 16, 264, '全員が非ゼロになるのを防ぐ', { 'font-size': 15, fill: C.muted });
    tx(S.p3, PX, 308, '・重み：w₁=10, w₂=1, w₃=2', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX, 356, '・RCT の一致顧客と', { 'font-size': 16, fill: C.ink });
    tx(S.p3, PX + 16, 382, '5 分割 CV で不偏評価', { 'font-size': 15, fill: C.muted });
    tx(g3, 940, 520, '模式図', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 4: exact results from Table 2 =====
    var g4 = S.g[3];
    tx(g4, 60, 68, '4 週間購入金額の正規化ジニ係数（COEFF、高いほど良い）', { 'font-size': 17, 'font-weight': 650, fill: C.ink });
    var groups4 = [
      {
        title: 'Spring Promotion（約 65 万人）', y: 108,
        bars: [
          { name: 'Two-Model', v: 0.3277, c: C.a },
          { name: 'Two-Stage', v: 0.4139, c: C.a },
          { name: 'ZILN',      v: 0.4131, c: C.a },
          { name: 'CDEE (Ours)', v: 0.4822, c: C.b }
        ]
      },
      {
        title: 'Winter Promotion（約 60 万人）', y: 304,
        bars: [
          { name: 'Two-Model', v: 0.3328, c: C.a },
          { name: 'Two-Stage', v: 0.4379, c: C.a },
          { name: 'ZILN',      v: 0.4646, c: C.a },
          { name: 'CDEE (Ours)', v: 0.4924, c: C.b }
        ]
      }
    ];
    var BX4 = 205, MAXW = 350, MAXV = 0.55;
    S.bars4 = [];
    groups4.forEach(function (gr) {
      tx(g4, 60, gr.y, gr.title, { 'font-size': 15, 'font-weight': 650, fill: C.muted });
      el('line', { x1: BX4, x2: BX4, y1: gr.y + 12, y2: gr.y + 158, stroke: C.muted, 'stroke-width': 1.2 }, g4);
      gr.bars.forEach(function (b, idx) {
        var yb = gr.y + 20 + idx * 34;
        var w = (b.v / MAXV) * MAXW;
        tx(g4, BX4 - 12, yb + 18, b.name, {
          'font-size': 15,
          'font-weight': b.c === C.b ? 700 : 500,
          fill: b.c === C.b ? C.b : C.ink,
          'text-anchor': 'end'
        });
        var rect = el('rect', { x: BX4, y: yb, width: 0, height: 24, rx: 4, fill: b.c, opacity: b.c === C.b ? 0.95 : 0.65 }, g4);
        var valT = tx(g4, BX4 + w + 10, yb + 18, b.v.toFixed(4), {
          'font-size': 16,
          'font-weight': b.c === C.b ? 700 : 500,
          fill: b.c === C.b ? C.b : C.ink
        });
        S.bars4.push({ rect: rect, valT: valT, w: w, idx: idx });
      });
    });

    S.p4 = el('g', {}, g4);
    tx(S.p4, PX, 126, '誤差・事業指標でも優位', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    tx(S.p4, PX, 168, '・NRMSE（低いほど良い）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(S.p4, PX + 16, 196, '春：3.96（ZILN 10.73）', { 'font-size': 15, fill: C.b });
    tx(S.p4, PX + 16, 222, '冬：3.50（ZILN 4.97）', { 'font-size': 15, fill: C.b });
    tx(S.p4, PX, 272, '・4 週間増分購入金額（LPA）', { 'font-size': 16, 'font-weight': 600, fill: C.ink });
    tx(S.p4, PX + 16, 300, '同費用で ZILN・Two-Stage・', { 'font-size': 15, fill: C.ink });
    tx(S.p4, PX + 16, 326, 'Direct model を上回る', { 'font-size': 15, fill: C.ink });
    tx(g4, 940, 520, '論文 Table 2・Sec. 5.3（arXiv v1）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== Scene 5: title card =====
    var g5 = S.g[4];
    tx(g5, 480, 130, 'KDD 2022 WORKSHOP · ARXIV:2207.14798', { 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.2 });
    tx(g5, 480, 192, 'Personalized Promotion Decision Making', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 236, 'Based on Direct and Enduring Effect Predictions', { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 286, '直接効果と持続効果の予測にもとづく個別化プロモーションの意思決定', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 342, 'Jie Yang · Yilin Li · Deddy Jobson（Mercari, Inc.）', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    tx(g5, 480, 396, 'arxiv.org/abs/2207.14798', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    tx(g5, 480, 464, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });

    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // Scene 1
    S.s1c.setAttribute('opacity', seg(t, 2.0, 2.8));
    S.p1.setAttribute('opacity', seg(t, 1.2, 2.0));
    // Scene 2
    S.dipPath.setAttribute('stroke-dashoffset', S.dipLen * (1 - seg(t, 8.6, 10.6)));
    S.dipLabel.setAttribute('opacity', seg(t, 10.3, 10.9));
    S.skew.setAttribute('opacity', seg(t, 11.2, 12.0));
    S.p2.setAttribute('opacity', seg(t, 9.6, 10.4));
    // Scene 3
    S.l3.forEach(function (lg, i) {
      lg.setAttribute('opacity', seg(t, 16.5 + i * 1.0, 17.2 + i * 1.0));
    });
    S.p3.setAttribute('opacity', seg(t, 18.2, 19.0));
    // Scene 4
    S.bars4.forEach(function (b) {
      var f = seg(t, 24.8 + b.idx * 0.7, 25.8 + b.idx * 0.7);
      b.rect.setAttribute('width', b.w * f);
      b.valT.setAttribute('opacity', seg(t, 25.4 + b.idx * 0.7, 26.0 + b.idx * 0.7));
    });
    S.p4.setAttribute('opacity', seg(t, 26.5, 27.3));
  }

  Teaser.start({
    root: document.getElementById('teaser'),
    bounds: BOUNDS,
    captions: CAPTIONS,
    build: build,
    render: render,
    still: 30
  });
})();
