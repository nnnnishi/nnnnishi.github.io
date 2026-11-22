// =====================================================================
// teaser-scenes.js — Liu et al., "Benchmarking for Deep Uplift Modeling in Online Marketing"
// (arXiv 2406.00335v1, 2024), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic (labelled 模式図). Scenes 2-4 use only numbers printed in Tables 4-7 of
// arXiv v1 (test QINI); the winners in scene 4 are the explainer's reading of those tables.
// Colours: orange = ad-hoc protocols / evaluation on biased data; blue = unified protocol / RCT test.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '深層アップリフトの論文は<span class="A">それぞれ別の分割と前処理</span>で「提案手法が最良」と報告してきた。', en: '' },
    { ja: '同じ EFIN でも、重複した行を除くかどうかだけで Criteo のテスト QINI が 0.086 から 0.122 に変わる。', en: '' },
    { ja: '論文は 13 手法を、2 つのデータと 4 通りの前処理で、<span class="B">同じ分割と調整手順</span>のもとに評価し直した。', en: '' },
    { ja: 'テスト QINI の首位は 8 条件で 7 手法に分かれ、どの条件でも勝つモデルはなかった。', en: '' },
    { ja: '手法を比べるときは、分割・前処理・テスト分布をそろえ、それを明記する必要がある。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 690;
  var MODELS = ['S-Learner', 'T-Learner', 'BNN', 'TARNet', 'CFRNet', 'CEVAE', 'GANITE', 'DragonNet', 'FlexTENet', 'SNet', 'EUEN', 'DESCN', 'EFIN'];

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.textContent = s; return e; }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: three papers, three protocols, each "best" =====
    var g1 = S.g[0];
    var papers = [
      ['論文 A', 'シード 1・分割は非公開', '重複除去：する', '正規化：しない'],
      ['論文 B', 'シード ?・分割 7:3', '重複除去：しない', '正規化：する'],
      ['論文 C', 'シード 42・分割 8:1:1', '重複除去：不明', '正規化：不明']
    ];
    S.cards1 = papers.map(function (p, i) {
      var x = 70 + i * 205, g = el('g', {}, g1);
      el('rect', { x: x, y: 70, width: 185, height: 330, rx: 14, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      t2(g, x + 18, 110, p[0], '', { 'font-size': 21, 'font-weight': 650, fill: C.ink });
      t2(g, x + 18, 160, p[1], '', { 'font-size': 14, fill: C.ink });
      t2(g, x + 18, 192, p[2], '', { 'font-size': 14, fill: C.ink });
      t2(g, x + 18, 224, p[3], '', { 'font-size': 14, fill: C.ink });
      el('rect', { x: x + 18, y: 300, width: 149, height: 64, rx: 10, fill: '#FCEBDF' }, g);
      t2(g, x + 92, 328, '提案手法が', '', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
      t2(g, x + 92, 352, '最良', '', { 'font-size': 16, 'font-weight': 650, fill: C.a, 'text-anchor': 'middle' });
      return g;
    });
    var p1 = S.p1 = el('g', {}, g1);
    t2(p1, PX, 140, '同じモデルの数値を', '', { 'font-size': 18, fill: C.ink });
    t2(p1, PX, 168, '論文の間で比べられない。', '', { 'font-size': 18, fill: C.ink });
    t2(p1, PX, 224, 'ベースラインが正しく', '', { 'font-size': 16, fill: C.muted });
    t2(p1, PX, 250, '調整されたかも分からない。', '', { 'font-size': 16, fill: C.muted });
    t2(g1, 940, 520, '模式図（論文名と設定は架空）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: EFIN on Criteo, test QINI under 4 preprocessing settings =====
    var g2 = S.g[1];
    var efin = [['なし', 0.0859], ['重複除去', 0.1220], ['正規化', 0.0857], ['両方', 0.1208]];
    var BX0 = 130, BW = 90, BG = 40, BY = 440, SC = 2600;   // px per QINI unit
    t2(g2, 80, 60, 'EFIN・Criteo のテスト QINI', '', { 'font-size': 18, 'font-weight': 600, fill: C.ink });
    el('line', { x1: 100, x2: 640, y1: BY, y2: BY, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    S.bars2 = efin.map(function (e, i) {
      var x = BX0 + i * (BW + BG), o = {};
      o.r = el('rect', { x: x, y: BY, width: BW, height: 0, rx: 4, fill: i % 2 ? C.ink : C.gray }, g2);
      o.v = txt(g2, x + BW / 2, BY, e[1].toFixed(4), { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
      t2(g2, x + BW / 2, BY + 28, e[0], '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
      o.h = e[1] * SC; o.t0 = 9 + i * 0.6;
      return o;
    });
    var p2 = S.p2 = el('g', {}, g2);
    t2(p2, PX, 130, '重複除去の有無だけで', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX, 190, '0.086 → 0.122', { 'font-size': 32, 'font-weight': 650, fill: C.ink });
    t2(p2, PX, 240, 'モデルは同じ EFIN', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 266, '（重複除去なし → あり、', '', { 'font-size': 16, fill: C.muted });
    t2(p2, PX, 292, '　正規化なし）', '', { 'font-size': 16, fill: C.muted });
    t2(g2, 940, 520, '論文 Table 4〜7 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: unified grid 13 models x 8 conditions fills in =====
    var g3 = S.g[2];
    var GX = 200, GY = 92, CW = 44, RH = 28;
    ['Criteo', 'Lazada'].forEach(function (ds, d) {
      txt(g3, GX + d * (4 * CW + 20) + 2 * CW, 58, ds, { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    });
    MODELS.forEach(function (m, i) {
      txt(g3, GX - 12, GY + i * RH + 15, m, { 'font-size': 14, fill: C.ink, 'text-anchor': 'end' });
    });
    S.cells3 = [];
    for (var i = 0; i < 13; i++) for (var j = 0; j < 8; j++) {
      var x = GX + j * CW + (j >= 4 ? 20 : 0);
      S.cells3.push({ c: el('rect', { x: x + 3, y: GY + i * RH, width: CW - 6, height: RH - 6, rx: 4, fill: C.gray }, g3), k: (i * 8 + j) / 104 });
    }
    t2(g3, GX + 2 * CW, GY + 13 * RH + 22, '前処理 4 通り', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    t2(g3, GX + 6 * CW + 20, GY + 13 * RH + 22, '前処理 4 通り', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    var p3 = S.p3 = el('g', {}, g3);
    t2(p3, PX, 110, 'そろえたもの', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 152, '分割：Criteo 8:1:1、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 176, 'Lazada 9:1＋RCT テスト', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 214, '乱数シード：0〜9', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 252, '調整：QINI を基準に', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 276, 'Optuna で探索', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 314, '指標：QINI、AUUC、', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 338, 'WAU、LIFT@30', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 386, '前処理：重複除去と', '', { 'font-size': 16, fill: C.ink });
    t2(p3, PX, 410, '正規化の有無', '', { 'font-size': 16, fill: C.ink });

    // ===== scene 4: winners (test QINI) in the 8 conditions, then EFIN on Lazada =====
    var g4 = S.g[3];
    var cond = ['なし', '重複除去', '正規化', '両方'];
    var win = {
      Criteo: [['FlexTENet', '0.0924'], ['EFIN', '0.1220'], ['EUEN', '0.0899'], ['GANITE', '0.1272']],
      Lazada: [['SNet', '0.0238'], ['DESCN', '0.0252'], ['SNet', '0.0272'], ['CFRNet', '0.0303']]
    };
    var TX = 200, TW = 190, TY = 100, TH = 78;
    txt(g4, TX + TW / 2, 70, 'Criteo', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    txt(g4, TX + TW * 1.5 + 14, 70, 'Lazada（RCT テスト）', { 'font-size': 17, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    t2(g4, 70, 54, '前処理', '', { 'font-size': 15, fill: C.muted });
    S.win4 = [];
    cond.forEach(function (c, j) {
      var y = TY + j * TH;
      t2(g4, 70, y + 44, c, '', { 'font-size': 17, fill: C.ink });
      ['Criteo', 'Lazada'].forEach(function (ds, d) {
        var x = TX + d * (TW + 14), g = el('g', {}, g4);
        el('rect', { x: x, y: y + 6, width: TW, height: TH - 14, rx: 10, fill: C.bsoft }, g);
        txt(g, x + 16, y + 38, win[ds][j][0], { 'font-size': 19, 'font-weight': 650, fill: C.b });
        txt(g, x + 16, y + 60, win[ds][j][1], { 'font-size': 14, fill: C.muted });
        S.win4.push({ g: g, t0: 25 + (d * 4 + j) * 0.35 });
      });
    });
    var p4 = S.p4 = el('g', {}, g4);
    t2(p4, PX, 110, '8 条件で 1 位が 7 手法', '', { 'font-size': 18, 'font-weight': 650, fill: C.ink });
    t2(p4, PX, 170, 'EFIN（2023）は Lazada で', '', { 'font-size': 16, fill: C.ink });
    t2(p4, PX, 206, '検証 QINI', '', { 'font-size': 16, fill: C.a });
    txt(p4, PX + 110, 208, '1 位', { 'font-size': 24, 'font-weight': 650, fill: C.a });
    t2(p4, PX, 246, 'テスト QINI', '', { 'font-size': 16, fill: C.b });
    txt(p4, PX + 110, 248, '12〜13 位', { 'font-size': 24, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 286, '（4 条件とも、13 手法中）', '', { 'font-size': 14, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 4〜7 のテスト QINI から解説者が首位を選んで作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'ARXIV · 2024';
    el('text', { x: 480, y: 212, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Benchmarking for Deep Uplift';
    el('text', { x: 480, y: 256, 'font-size': 34, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Modeling in Online Marketing';
    t2(g5, 480, 302, 'オンラインマーケティングにおける深層アップリフトモデリングのベンチマーク', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 352, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Dugang Liu · Xing Tang · Yang Qiao · Miao Liu · Zexu Sun · Xiuqiang He · Zhong Ming';
    el('text', { x: 480, y: 410, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'arxiv.org/abs/2406.00335';
    t2(g5, 480, 470, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: cards appear one by one
    S.cards1.forEach(function (g, i) { g.setAttribute('opacity', seg(t, 0.8 + i * 1.1, 1.4 + i * 1.1)); });
    S.p1.setAttribute('opacity', seg(t, 4.4, 5.2));
    // scene 2: bars grow
    S.bars2.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 1.2), h = o.h * s;
      o.r.setAttribute('y', 440 - h); o.r.setAttribute('height', h);
      o.v.setAttribute('y', 440 - h - 10); o.v.setAttribute('opacity', seg(t, o.t0 + 1, o.t0 + 1.4));
    });
    S.p2.setAttribute('opacity', seg(t, 12.2, 13));
    // scene 3: grid cells turn blue in reading order
    S.cells3.forEach(function (q) {
      q.c.setAttribute('fill', H.mix(C.gray, C.b, seg(t, 17 + q.k * 4, 17.4 + q.k * 4)));
    });
    S.p3.setAttribute('opacity', seg(t, 17.2, 18));
    // scene 4: winners appear, then the EFIN panel
    S.win4.forEach(function (o) { o.g.setAttribute('opacity', seg(t, o.t0, o.t0 + 0.4)); });
    S.p4.setAttribute('opacity', seg(t, 28.4, 29.2));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
