// =====================================================================
// teaser-scenes.js — Sakaguchi (Quantitative Economics 2025), unofficial explainer. Player: teaser-engine.js.
// Scene 1 is a schematic of a two-stage DTR. Scenes 2-3 use the example of Remark 3.1 (the averages
// 0.50 / 0.55 are computed by the explainer from that example). Scene 4 uses the numbers in Table 2.
// Colours: orange = backward DEWM (backward induction); blue = simultaneous DEWM (all stages at once).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg;

  var CAPTIONS = [
    { ja: '同じ人に 2 段階で処置するとき、2 段階目のルールは 1 段階目の処置と途中の結果を見て決められる。', en: '' },
    { ja: '<span class="A">後ろから順に解く</span>と、2 段階目を決める時点で 1 段階目はデータの割当てのままなので、この例では厚生 0.6 のルールを選んでしまう。', en: '' },
    { ja: '<span class="B">2 段階をまとめて解く</span>と 4 通りの組合せを直接比べ、厚生 1.0 のルールを選べる。そのかわり計算は重い。', en: '' },
    { ja: 'Project STAR では、<span class="A">後ろ向き</span>・<span class="B">同時</span> DEWM のルールの厚生の増分が 8.86 と 8.80 で、全員一律のどのルールよりも高かった。', en: '' },
    { ja: '候補のルールの中で、段階をまたぐ厚生を最大にする。予算が段階をまたぐ制約も入れられる。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 600;

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }
  function sub(s) { return '<tspan baseline-shift="sub" font-size="13">' + s + '</tspan>'; }

  // ---- 2x2 grid of E[Y2(d1, d2)] from Remark 3.1 ----
  var GX = 150, GY = 170, CW = 150, CH = 110;
  var VAL = { '11': 1.0, '10': 0.5, '01': 0.0, '00': 0.6 };
  function cellXY(d1, d2) { return [GX + (d2 ? 0 : CW), GY + (d1 ? 0 : CH)]; }
  function grid(g) {
    var cells = {};
    t2(g, GX + CW, GY - 52, '2 段階目 ' + m('D') + sub('2'), '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g, GX + CW / 2, GY - 18, '= 1', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g, GX + CW * 1.5, GY - 18, '= 0', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    t2(g, GX - 70, GY + CH, '1 段階目', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, GX - 70, GY + CH + 22, m('D') + sub('1'), { 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' });
    t2(g, GX - 14, GY + CH / 2 + 6, '= 1', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    t2(g, GX - 14, GY + CH * 1.5 + 6, '= 0', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'end' });
    ['11', '10', '01', '00'].forEach(function (k) {
      var p = cellXY(+k[0], +k[1]), o = {};
      o.bg = el('rect', { x: p[0], y: p[1], width: CW, height: CH, fill: '#fff', stroke: C.hair, 'stroke-width': 1.5 }, g);
      o.hl = el('rect', { x: p[0] + 3, y: p[1] + 3, width: CW - 6, height: CH - 6, fill: 'none', stroke: C.ink, 'stroke-width': 4, opacity: 0 }, g);
      txt(g, p[0] + CW / 2, p[1] + CH / 2 + 12, VAL[k].toFixed(1), { 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
      cells[k] = o;
    });
    t2(g, GX + CW, GY + CH * 2 + 34, '各マスは最後の結果の平均 ' + m('E') + '[' + m('Y') + sub('2') + '(' + m('d') + sub('1') + ', ' + m('d') + sub('2') + ')]', '', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return cells;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: a two-stage DTR =====
    var g1 = S.g[0];
    el('rect', { x: 24, y: 110, width: 470, height: 230, rx: 14, fill: C.panel }, g1);
    el('rect', { x: 510, y: 110, width: 426, height: 230, rx: 14, fill: C.panel }, g1);
    t2(g1, 40, 138, '段階 1（例：幼稚園）', '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    t2(g1, 526, 138, '段階 2（例：1 年生）', '', { 'font-size': 16, 'font-weight': 600, fill: C.muted });
    var nodes = [
      [80, m('X') + sub('1'), '特徴量', 0], [200, m('g') + sub('1'), 'ルール', 1], [320, m('D') + sub('1'), '処置', 0], [435, m('Y') + sub('1'), '途中の結果', 0],
      [580, m('g') + sub('2'), 'ルール', 1], [710, m('D') + sub('2'), '処置', 0], [850, m('Y') + sub('2'), '最後の結果', 0]
    ];
    S.nodes1 = nodes.map(function (n, k) {
      var g = el('g', {}, g1), y = 240;
      el('rect', { x: n[0] - 42, y: y - 30, width: 84, height: 60, rx: 12, fill: n[3] ? C.ink : '#fff', stroke: C.ink, 'stroke-width': 2 }, g);
      txt(g, n[0], y + 9, n[1], { 'font-size': 24, 'font-weight': 600, fill: n[3] ? '#fff' : C.ink, 'text-anchor': 'middle' });
      t2(g, n[0], y + 56, n[2], '', { 'font-size': 15, fill: C.ink, 'text-anchor': 'middle' });
      if (k < nodes.length - 1) el('line', { x1: n[0] + 44, x2: nodes[k + 1][0] - 46, y1: y, y2: y, stroke: C.ink, 'stroke-width': 2 }, g);
      return g;
    });
    S.hist1 = el('g', {}, g1);
    [80, 320, 435].forEach(function (x) {
      el('path', { d: 'M' + x + ',208 C' + x + ',150 580,150 580,206', fill: 'none', stroke: C.b, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, S.hist1);
    });
    txt(S.hist1, 580, 82, m('H') + sub('2') + ' = (' + m('D') + sub('1') + ', ' + m('Y') + sub('1') + ', ' + m('X') + sub('1') + ', ' + m('X') + sub('2') + ')', { 'font-size': 20, fill: C.b, 'text-anchor': 'middle' });
    S.p1 = el('g', {}, g1);
    t2(S.p1, 480, 410, 'DTR ＝ 段階ごとのルールの組 (' + m('g') + sub('1') + ', ' + m('g') + sub('2') + ')', '', { 'font-size': 20, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' });
    t2(S.p1, 480, 444, '2 段階目のルールは、それまでの経過（履歴）を見て処置を決める', '', { 'font-size': 16, fill: C.muted, 'text-anchor': 'middle' });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: backward induction on Remark 3.1 =====
    var g2 = S.g[1];
    S.c2 = grid(g2);
    S.colA2 = el('rect', { x: GX, y: GY, width: CW, height: CH * 2, fill: C.a, 'fill-opacity': 0.12 }, g2);
    S.colB2 = el('rect', { x: GX + CW, y: GY, width: CW, height: CH * 2, fill: C.a, 'fill-opacity': 0.12 }, g2);
    S.s1 = el('g', {}, g2);
    t2(S.s1, PX, 110, '① 2 段階目を先に決める', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(S.s1, PX, 136, m('D') + sub('1') + ' はデータのとおり半々', '', { 'font-size': 15, fill: C.muted });
    t2(S.s1, PX, 168, '全員処置 (1.0 + 0.0) / 2 = 0.50', '', { 'font-size': 16, fill: C.ink });
    t2(S.s1, PX, 194, '誰も処置しない (0.5 + 0.6) / 2 = 0.55', '', { 'font-size': 16, fill: C.ink });
    t2(S.s1, PX, 222, '→ ' + m('g') + sub('2') + ' = 誰も処置しない', '', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.s2 = el('g', {}, g2);
    t2(S.s2, PX, 270, '② 1 段階目を決める', '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    t2(S.s2, PX, 300, '全員処置 0.5 ／ 誰も処置しない 0.6', '', { 'font-size': 16, fill: C.ink });
    t2(S.s2, PX, 328, '→ ' + m('g') + sub('1') + ' = 誰も処置しない', '', { 'font-size': 16, 'font-weight': 650, fill: C.a });
    S.s3 = el('g', {}, g2);
    t2(S.s3, PX, 384, '選ばれたのは (0, 0)、厚生 0.6', '', { 'font-size': 20, 'font-weight': 650, fill: C.a });
    t2(g2, 940, 520, '論文 Remark 3.1 の例（候補は各段階とも「全員処置」か「誰も処置しない」）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: simultaneous maximisation =====
    var g3 = S.g[2];
    S.c3 = grid(g3);
    S.p3 = el('g', {}, g3);
    t2(S.p3, PX, 110, '4 通りの (' + m('g') + sub('1') + ', ' + m('g') + sub('2') + ') を直接比べる', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.rows3 = [['(1, 1)', '1.0', '11'], ['(1, 0)', '0.5', '10'], ['(0, 1)', '0.0', '01'], ['(0, 0)', '0.6', '00']].map(function (r, k) {
      var g = el('g', {}, S.p3);
      t2(g, PX + 10, 156 + k * 32, r[0] + '　厚生 ' + r[1], '', { 'font-size': 17, fill: k ? C.ink : C.b, 'font-weight': k ? 400 : 650 });
      return { g: g, key: r[2] };
    });
    S.res3 = el('g', {}, g3);
    t2(S.res3, PX, 320, '→ (1, 1) を選び、厚生 1.0', '', { 'font-size': 20, 'font-weight': 650, fill: C.b });
    t2(S.res3, PX, 360, '2 段階目の最善のルール ' + m('g') + sub('2') + ' = ' + m('D') + sub('1'), '', { 'font-size': 15, fill: C.muted });
    t2(S.res3, PX, 384, 'が候補にないと、後ろ向きの解はずれうる。', '', { 'font-size': 15, fill: C.muted });
    t2(g3, 940, 520, '論文 Remark 3.1 の例', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Project STAR, Table 2 =====
    var g4 = S.g[3];
    var rows = [
      ['一律 (1, 1)', C.gray, 0.80, '1 / 1'], ['一律 (1, 0)', C.gray, 2.59, '1 / 0'], ['一律 (0, 1)', C.gray, 3.94, '0 / 1'],
      ['後ろ向き DEWM', C.a, 8.86, '1.0 / 0.51'], ['同時 DEWM', C.b, 8.80, '0.63 / 0.76']
    ];
    var X0 = 220, Y0 = 130, DY = 62, SC = 330 / 10;
    t2(g4, 60, 66, '厚生の増分（点数、教員補助の費用を差し引き）と段階ごとの処置率', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    el('line', { x1: X0, x2: X0, y1: Y0 - 30, y2: Y0 + DY * 4 + 30, stroke: C.ink }, g4);
    S.rows4 = rows.map(function (r, k) {
      var y = Y0 + DY * k, o = {};
      t2(g4, X0 - 14, y + 6, r[0], '', { 'font-size': 17, fill: C.ink, 'text-anchor': 'end' });
      o.bar = el('rect', { x: X0, y: y - 15, width: 0, height: 30, rx: 4, fill: r[1] }, g4);
      o.w = r[2] * SC;
      o.lab = el('text', { x: X0 + o.w + 10, y: y + 6, 'font-size': 16, fill: C.ink }, g4);
      o.lab.textContent = r[2].toFixed(2) + '（' + r[3] + '）';
      o.t0 = 25 + k * 0.7;
      return o;
    });
    t2(g4, 60, 470, '段階 1 ＝ 幼稚園、段階 2 ＝ 1 年生。処置は教員補助のいるクラスに入ること。', '', { 'font-size': 15, fill: C.muted });
    t2(g4, 940, 520, '論文 Table 2 の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'QUANTITATIVE ECONOMICS · 2025';
    el('text', { x: 480, y: 212, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Estimation of optimal dynamic treatment';
    el('text', { x: 480, y: 254, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'assignment rules under policy constraints';
    t2(g5, 480, 300, '政策上の制約のもとで、段階のある処置ルールを推定する', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Shosei Sakaguchi';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'doi.org/10.3982/QE2288';
    t2(g5, 480, 468, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: nodes appear in order, then the history arrows into g2
    S.nodes1.forEach(function (g, k) { g.setAttribute('opacity', seg(t, 0.5 + k * 0.45, 0.9 + k * 0.45)); });
    S.hist1.setAttribute('opacity', seg(t, 4.2, 5));
    S.p1.setAttribute('opacity', seg(t, 5.4, 6.2));
    // scene 2: step 1 compares the two columns, step 2 the D2 = 0 column, then the choice
    S.colA2.setAttribute('opacity', seg(t, 9, 9.5) * (1 - seg(t, 11.6, 12)));
    S.colB2.setAttribute('opacity', seg(t, 9, 9.5));
    S.s1.setAttribute('opacity', seg(t, 9, 9.8));
    S.s2.setAttribute('opacity', seg(t, 11.8, 12.6));
    S.s3.setAttribute('opacity', seg(t, 13.6, 14.3));
    S.c2['00'].hl.setAttribute('opacity', seg(t, 13.6, 14.1));
    S.c2['00'].hl.setAttribute('stroke', C.a);
    // scene 3: each combination lights up in turn, then (1, 1) is chosen
    S.rows3.forEach(function (r, k) {
      var a = 17.2 + k * 0.9;
      r.g.setAttribute('opacity', seg(t, a, a + 0.4));
      S.c3[r.key].hl.setAttribute('opacity', k === 0 ? Math.max(seg(t, a, a + 0.3) * (1 - seg(t, a + 0.8, a + 1)), seg(t, 21.2, 21.6)) : seg(t, a, a + 0.3) * (1 - seg(t, a + 0.8, a + 1)));
      S.c3[r.key].hl.setAttribute('stroke', k === 0 ? C.b : C.ink);
    });
    S.res3.setAttribute('opacity', seg(t, 21.2, 22));
    // scene 4: bars grow in order
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.8);
      o.bar.setAttribute('width', o.w * s);
      o.lab.setAttribute('opacity', seg(t, o.t0 + 0.6, o.t0 + 1));
    });
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
