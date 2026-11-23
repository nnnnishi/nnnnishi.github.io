// =====================================================================
// teaser-scenes.js — Incremental Profit per Conversion (Proença & Moraes, KDD 2023 WS). Japanese only.
// Player: teaser-engine.js (unchanged). render() is a pure function of t.
// Numbers: Table 1 of the paper and the X=2 example in Sec. 3.2 (IPC 4 €, CATE of profit 2 € / 0.06 €),
//          conversion rate ~3 % and "two orders of magnitude" runtime from the text. Scene 1 dots are schematic.
// Orange = per-search view (all rows, CATE of profit); blue = per-conversion view (converted rows, IPC, Z).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, mix = H.mix;

  var CAPTIONS = [
    { ja: '割引やクーポンの利益アップリフトは、ふつう<span class="A">購買しなかった行も含む検索データ全体</span>で学習する', en: '' },
    { ja: '購買しない人が増えるだけで、<span class="A">検索1件あたりの利益の CATE</span> は小さくなる', en: '' },
    { ja: '<span class="B">購買しなかった行を捨て</span>、利益を処置確率で割って符号をつけると、平均が IPC になる', en: '' },
    { ja: '<span class="B">IPC</span> は購買しない人数に左右されず、学習時間も他手法より2桁短い', en: '' },
    { ja: '購買したデータと処置確率だけで、購買1件あたりの増分利益を1つのモデルで推定する', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];

  function txt(parent, x, y, s, attrs) {
    var a = { x: x, y: y }; for (var k in attrs) a[k] = attrs[k];
    var e = el('text', a, parent); e.innerHTML = s; return e;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ---------- scene 1: 10 x 10 dots, 3 conversions (schematic) ----------
    var g = S.g[0];
    S.dots = [];
    var conv = { 23: 1, 57: 1, 81: 1 };
    for (var r = 0; r < 10; r++) for (var c = 0; c < 10; c++) {
      var i = r * 10 + c;
      S.dots.push({ e: el('circle', { cx: 110 + c * 46, cy: 70 + r * 42, r: 13, fill: C.gray }, g), conv: !!conv[i], i: i });
    }
    txt(g, 330, 505, '模式図：検索100件（色つきが購買）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 700, 120, '購買率', { 'font-size': 18, fill: C.muted });
    txt(g, 700, 175, '約 3%', { 'font-size': 46, 'font-weight': 700, fill: C.a });
    txt(g, 700, 205, '（論文本文）', { 'font-size': 15, fill: C.muted });
    S.s1b = el('g', {}, g);
    txt(S.s1b, 700, 270, '残りは利益 0', { 'font-size': 20, fill: C.ink, 'font-weight': 600 });
    txt(S.s1b, 700, 300, '目的変数の大半がゼロ', { 'font-size': 16, fill: C.muted });
    txt(S.s1b, 700, 360, 'メタ学習器などは', { 'font-size': 20, fill: C.ink, 'font-weight': 600 });
    txt(S.s1b, 700, 390, 'モデルを複数学習する', { 'font-size': 20, fill: C.ink, 'font-weight': 600 });

    // ---------- scene 2: X=1 vs X=2, CATE of profit shrinks ----------
    g = S.g[1];
    function rowDots(parent, x0, y0, n, convs, per, sp, rad) {
      sp = sp || 22; rad = rad || 8;
      var arr = [];
      for (var k = 0; k < n; k++) {
        var cx = x0 + (k % per) * sp, cy = y0 + Math.floor(k / per) * sp;
        arr.push(el('circle', { cx: cx, cy: cy, r: rad, fill: convs[k] ? C.a : C.gray }, parent));
      }
      return arr;
    }
    txt(g, 90, 90, '文脈 <tspan ' + MI + '>x</tspan> = 1', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    txt(g, 90, 118, '6人（購買3件）', { 'font-size': 15, fill: C.muted });
    rowDots(g, 100, 150, 6, { 2: 1, 4: 1, 5: 1 }, 6);
    txt(g, 350, 90, '文脈 <tspan ' + MI + '>x</tspan> = 2', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    txt(g, 350, 118, '購買は同じ3件 ＋ 購買しない人100人', { 'font-size': 15, fill: C.muted });
    rowDots(g, 360, 150, 6, { 2: 1, 4: 1, 5: 1 }, 6);
    S.extra = rowDots(el('g', {}, g), 360, 176, 100, {}, 14, 17, 6);
    // bars
    S.barY0 = 470;
    el('line', { x1: 80, y1: 470, x2: 600, y2: 470, stroke: C.muted, 'stroke-width': 1.5 }, g);
    S.cb1 = el('rect', { x: 140, y: 470, width: 70, height: 0, fill: C.a }, g);
    S.cb2 = el('rect', { x: 400, y: 470, width: 70, height: 0, fill: C.a }, g);
    S.cl1 = txt(g, 175, 300, '2 €', { 'font-size': 22, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    S.cl2 = txt(g, 435, 300, '2 €', { 'font-size': 22, 'font-weight': 700, fill: C.a, 'text-anchor': 'middle' });
    txt(g, 175, 500, '利益の CATE', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 435, 500, '利益の CATE', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 700, 140, '検索1件あたり', { 'font-size': 18, fill: C.muted });
    txt(g, 700, 175, '<tspan ' + MI + '>τ</tspan><tspan font-size="14" dy="5">Π</tspan><tspan dy="-5"> = 2 € → 0.06 €</tspan>', { 'font-size': 24, 'font-weight': 700, fill: C.a });
    txt(g, 700, 240, '購買1件あたりの利益は', { 'font-size': 18, fill: C.ink });
    txt(g, 700, 266, 'どちらも同じなのに、', { 'font-size': 18, fill: C.ink });
    txt(g, 700, 292, '<tspan ' + MI + '>x</tspan> = 1 のほうが高く評価される', { 'font-size': 18, fill: C.ink });
    txt(g, 700, 350, '論文 3.2 節の例', { 'font-size': 15, fill: C.muted });

    // ---------- scene 3: Table 1 -> z ----------
    g = S.g[2];
    var rows = [[1, 0, 0, 0, '–'], [2, 0, 0, 0, '–'], [3, 0, 1, 10, '−20'], [4, 1, 0, 0, '–'], [5, 1, 1, 8, '+16'], [6, 1, 1, 8, '+16']];
    var hx = [110, 190, 270, 360, 500];
    ['i', 't', 'c', 'π', 'z'].forEach(function (h, k) {
      txt(g, hx[k], 85, '<tspan ' + MI + '>' + h + '</tspan>', { 'font-size': 22, fill: k === 4 ? C.b : C.muted, 'text-anchor': 'middle' });
    });
    el('line', { x1: 80, y1: 98, x2: 560, y2: 98, stroke: C.ink, 'stroke-width': 1.5 }, g);
    S.rows = rows.map(function (rw, k) {
      var y = 140 + k * 52;
      var gr = el('g', {}, g);
      var cells = rw.slice(0, 4).map(function (v, j) {
        return txt(gr, hx[j], y, (j === 3 ? v + ' €' : '' + v), { 'font-size': 22, fill: C.ink, 'text-anchor': 'middle' });
      });
      var z = txt(gr, hx[4], y, rw[4], { 'font-size': 24, 'font-weight': 700, fill: C.b, 'text-anchor': 'middle' });
      var strike = el('line', { x1: 80, y1: y - 7, x2: 560, y2: y - 7, stroke: C.a, 'stroke-width': 2 }, gr);
      return { g: gr, z: z, strike: strike, conv: rw[2] === 1 };
    });
    txt(g, 320, 470, '論文 Table 1 の例（処置確率 0.5）', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    txt(g, 700, 110, '購買した行だけ', { 'font-size': 18, fill: C.muted });
    txt(g, 700, 150, '<tspan ' + MI + '>z</tspan> = ±<tspan ' + MI + '>π</tspan> / Pr(<tspan ' + MI + '>T</tspan>=<tspan ' + MI + '>t</tspan> | <tspan ' + MI + '>x</tspan>)', { 'font-size': 22, 'font-weight': 600, fill: C.b });
    txt(g, 700, 180, '処置群は＋、対照群は−', { 'font-size': 15, fill: C.muted });
    S.s3b = el('g', {}, g);
    txt(S.s3b, 700, 250, '(16 + 16 − 20) / 3', { 'font-size': 22, fill: C.ink });
    txt(S.s3b, 700, 305, 'IPC = 4 €', { 'font-size': 40, 'font-weight': 700, fill: C.b });
    txt(S.s3b, 700, 335, '購買1件あたり', { 'font-size': 16, fill: C.muted });

    // ---------- scene 4: X=1 vs X=2, CATE vs IPC (numbers from the paper's text) ----------
    g = S.g[3];
    var base = 420, unit = 60;   // 1 € = 60 px
    el('line', { x1: 80, y1: base, x2: 600, y2: base, stroke: C.muted, 'stroke-width': 1.5 }, g);
    S.b4 = [
      { x: 110, v: 2, c: C.a, lab: '2 €' }, { x: 190, v: 4, c: C.b, lab: '4 €' },
      { x: 370, v: 0.06, c: C.a, lab: '0.06 €' }, { x: 450, v: 4, c: C.b, lab: '4 €' }
    ].map(function (b) {
      return {
        b: b, r: el('rect', { x: b.x, y: base, width: 60, height: 0, fill: b.c }, g),
        l: txt(g, b.x + 30, base - 10, b.lab, { 'font-size': 20, 'font-weight': 700, fill: b.c, 'text-anchor': 'middle' })
      };
    });
    txt(g, 180, 455, '<tspan ' + MI + '>x</tspan> = 1', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    txt(g, 440, 455, '<tspan ' + MI + '>x</tspan> = 2（＋購買しない100人）', { 'font-size': 18, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' });
    el('rect', { x: 110, y: 488, width: 16, height: 16, fill: C.a }, g);
    txt(g, 134, 502, '利益の CATE', { 'font-size': 15, fill: C.muted });
    el('rect', { x: 270, y: 488, width: 16, height: 16, fill: C.b }, g);
    txt(g, 294, 502, 'IPC', { 'font-size': 15, fill: C.muted });
    txt(g, 390, 502, '数値は論文本文の例', { 'font-size': 15, fill: C.muted });
    S.s4b = el('g', {}, g);
    txt(S.s4b, 700, 130, '合成クーポン実験', { 'font-size': 18, fill: C.muted });
    txt(S.s4b, 700, 160, '（20万件・割引 10%）', { 'font-size': 15, fill: C.muted });
    txt(S.s4b, 700, 215, '学習時間', { 'font-size': 20, 'font-weight': 600, fill: C.ink });
    txt(S.s4b, 700, 265, '2桁短い', { 'font-size': 40, 'font-weight': 700, fill: C.b });
    txt(S.s4b, 700, 300, '購買データだけで学習するため', { 'font-size': 15, fill: C.muted });
    txt(S.s4b, 700, 360, '並べ替え性能は', { 'font-size': 18, fill: C.ink });
    txt(S.s4b, 700, 386, '他手法と同等以上', { 'font-size': 18, fill: C.ink, 'font-weight': 600 });
    txt(S.s4b, 700, 412, '（明確な勝者はいない）', { 'font-size': 15, fill: C.muted });

    // ---------- scene 5: title card ----------
    g = S.g[4];
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = 'KDD 2023 WORKSHOP';
    el('text', { x: 480, y: 230, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'Incremental Profit per Conversion';
    el('text', { x: 480, y: 270, 'font-size': 20, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = 'a Response Transformation for Uplift Modeling in E-Commerce Promotions';
    el('text', { x: 480, y: 320, 'font-size': 17, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'Hugo Manuel Proença, Felipe Moraes · Booking.com';
    txt(g, 480, 395, '<tspan ' + MI + '>IPC</tspan>(<tspan ' + MI + '>x</tspan>) = <tspan ' + MI + '>τ</tspan><tspan font-size="15" dy="6">Π</tspan><tspan dy="-6">(</tspan><tspan ' + MI + '>x</tspan>) / Pr(<tspan ' + MI + '>C</tspan>=1 | <tspan ' + MI + '>x</tspan>)', { 'font-size': 26, fill: C.b, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 460, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = 'arxiv.org/abs/2306.13759';
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: conversions light up, then the rest is flagged as zero profit
    var k1 = seg(t, 1.5, 3), k2 = seg(t, 4, 5.5);
    S.dots.forEach(function (d) {
      d.e.setAttribute('fill', d.conv ? mix(C.gray, C.a, k1) : C.gray);
      d.e.setAttribute('opacity', d.conv ? 1 : 1 - 0.45 * k2);
    });
    S.s1b.setAttribute('opacity', k2);
    // scene 2: 100 non-buyers arrive in x=2, its CATE bar shrinks 2 -> 0.06
    var a2 = seg(t, 9.5, 12.5);
    S.extra.forEach(function (e, k) { e.setAttribute('opacity', seg(a2 * 100, k, k + 1)); });
    var u = 40, h1 = 2 * u, v2 = 2 + (0.06 - 2) * seg(t, 11, 13.5), h2 = v2 * u;
    S.cb1.setAttribute('y', 470 - h1); S.cb1.setAttribute('height', h1);
    S.cb2.setAttribute('y', 470 - h2); S.cb2.setAttribute('height', h2);
    S.cl1.setAttribute('y', 470 - h1 - 10);
    S.cl2.setAttribute('y', 470 - h2 - 10);
    var sh = seg(t, 11, 13.5);   // label only at the paper's two values (2 € and 0.06 €), hidden while shrinking
    S.cl2.textContent = sh < 0.5 ? '2 €' : '0.06 €';
    S.cl2.setAttribute('opacity', sh <= 0 || sh >= 1 ? 1 : 0);
    // scene 3: strike non-converted rows, reveal z, then the mean
    var st = seg(t, 17.5, 19), zr = seg(t, 19.5, 21);
    S.rows.forEach(function (r) {
      if (r.conv) { r.g.setAttribute('opacity', 1); r.strike.setAttribute('opacity', 0); r.z.setAttribute('opacity', zr); }
      else { r.strike.setAttribute('opacity', st); r.g.setAttribute('opacity', 1 - 0.65 * st); r.z.setAttribute('opacity', 0); }
    });
    S.s3b.setAttribute('opacity', seg(t, 21.5, 22.5));
    // scene 4: bars grow in order
    S.b4.forEach(function (o, k) {
      var g = seg(t, 25 + k * 0.8, 26 + k * 0.8), h = o.b.v * 60 * g;
      o.r.setAttribute('y', 420 - h); o.r.setAttribute('height', h);
      o.l.setAttribute('y', 420 - h - 10); o.l.setAttribute('opacity', g);
    });
    S.s4b.setAttribute('opacity', seg(t, 28.5, 29.5));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 30 });
})();
