// =====================================================================
// teaser-scenes.js — Bokelmann & Lessmann (EJOR 2024), unofficial explainer. Player: teaser-engine.js.
// Scenes 1-3 are schematics with explainer-chosen toy values (labelled 模式図).
// Scene 4 uses the numbers printed in Table 3 (arXiv v3): share of runs in which MSE_W judged the causal
// forest better than the true CATE, original outcome vs. doubly-robust adjustment.
// Colours: orange = original outcome and the variation it causes; blue = adjusted outcome Y - Phi_hat(X).
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, MI = H.MI;
  var el = H.el, t2 = H.t2, seg = H.seg, rng = H.rng;

  var CAPTIONS = [
    { ja: 'アップリフトモデルの評価では上位に並べた人について処置群と対照群の平均の差を取る。', en: '' },
    { ja: 'テストデータが変わると、<span class="A">同じモデルでも評価が大きく揺れる</span>。', en: '' },
    { ja: '学習データで当てた予測をアウトカムから引くと、<span class="B">偏りを入れずに揺れを小さくできる</span>。', en: '' },
    { ja: 'シミュレーションでは、因果フォレストを真の CATE より良いと取り違える割合が<span class="A">39.3%</span> から<span class="B">4.4%</span> に減った。', en: '' },
    { ja: 'RCT データでアップリフトモデルを評価するときは、調整したアウトカムを既定で使うよう論文は勧めている。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 33, 40];
  var PX = 680;   // right-hand explanation column

  function txt(g, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y }, a || {}), g); e.innerHTML = s; return e; }
  function m(s) { return '<tspan ' + MI + '>' + s + '</tspan>'; }

  // shared axes for scenes 1-2 (schematic Qini curve)
  var AX0 = 100, AX1 = 590, AY0 = 470, AY1 = 300;
  function base(s) { return s * (1.6 - 0.9 * s); }          // toy curve, max 0.7 at s = 1
  function qx(s) { return AX0 + s * (AX1 - AX0); }
  function qy(v) { return AY0 - v / 0.9 * (AY0 - AY1); }
  function pathOf(f, upto) {
    var d = '', n = Math.max(1, Math.round(60 * upto));
    for (var i = 0; i <= n; i++) { var s = upto * i / n; d += (i ? 'L' : 'M') + qx(s).toFixed(1) + ',' + qy(f(s)).toFixed(1); }
    return d;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: ranked customers, top share s, difference of means -> Qini curve =====
    var g1 = S.g[0];
    t2(g1, 90, 52, 'テストデータの顧客（モデルの予測が大きい順に左から）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    var r1 = rng(5);
    for (var c = 0; c < 10; c++) for (var rw = 0; rw < 4; rw++) {
      var tr = r1() < 0.5;
      el('circle', tr ? { cx: 125 + c * 48, cy: 92 + rw * 38, r: 11, fill: C.ink } : { cx: 125 + c * 48, cy: 92 + rw * 38, r: 10, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, g1);
    }
    S.box1 = el('rect', { x: 100, y: 70, width: 48, height: 158, rx: 8, fill: 'none', stroke: C.a, 'stroke-width': 3 }, g1);
    S.sLab = el('text', { x: 104, y: 252, 'font-size': 16, fill: C.a }, g1);
    el('line', { x1: AX0, x2: AX1, y1: AY0, y2: AY0, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    el('line', { x1: AX0, x2: AX0, y1: AY0, y2: AY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g1);
    t2(g1, AX1, AY0 + 26, '上位の割合 ' + m('s') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g1, AX0 + 10, AY1 - 2, '↑ 増分（Qini 曲線）', '', { 'font-size': 16, fill: C.ink });
    S.curve1 = el('path', { d: '', fill: 'none', stroke: C.a, 'stroke-width': 3.5 }, g1);
    var p1 = S.p1 = el('g', {}, g1);
    el('circle', { cx: PX + 10, cy: 104, r: 9, fill: C.ink }, p1);
    t2(p1, PX + 28, 110, '処置群', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 10, cy: 138, r: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, p1);
    t2(p1, PX + 28, 144, '対照群', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 200, '枠の中で', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 228, '処置群の平均 − 対照群の平均', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    t2(p1, PX, 256, '× 枠の中の処置群の人数', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 306, m('s') + ' を動かして並べると', '', { 'font-size': 17, fill: C.ink });
    t2(p1, PX, 332, 'Qini 曲線になる。', '', { 'font-size': 17, fill: C.ink });
    t2(g1, 940, 520, '模式図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 2: Qini curves on many test sets (schematic) =====
    var g2 = S.g[1];
    var BY0 = 470, BY1 = 90;
    function by(v) { return BY0 - v / 0.9 * (BY0 - BY1); }
    el('line', { x1: AX0, x2: AX1, y1: BY0, y2: BY0, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    el('line', { x1: AX0, x2: AX0, y1: BY0, y2: BY1 - 10, stroke: C.ink, 'stroke-width': 1.5 }, g2);
    t2(g2, AX1, BY0 + 26, '上位の割合 ' + m('s') + ' →', '', { 'font-size': 16, fill: C.ink, 'text-anchor': 'end' });
    t2(g2, AX0 + 10, BY1 - 18, '↑ 増分（Qini 曲線）', '', { 'font-size': 16, fill: C.ink });
    var r2 = rng(23); S.curves2 = [];
    for (var k = 0; k < 24; k++) {
      var a = [0, 1, 2, 3].map(function () { return (r2() + r2() + r2() - 1.5) * 0.17; });
      var f = (function (a) { return function (s) { return base(s) + a[0] * Math.sin(Math.PI * s) + a[1] * Math.sin(2 * Math.PI * s) / 2 + a[2] * Math.sin(3 * Math.PI * s) / 3 + a[3] * s * 0.6; }; })(a);
      var d = '';
      for (var i = 0; i <= 60; i++) { var s = i / 60; d += (i ? 'L' : 'M') + qx(s).toFixed(1) + ',' + by(f(s)).toFixed(1); }
      S.curves2.push({ p: el('path', { d: d, fill: 'none', stroke: C.a, 'stroke-width': 1.6, opacity: 0 }, g2), t0: 9 + k * 0.17 });
    }
    var db = '';
    for (var j = 0; j <= 60; j++) { var s2 = j / 60; db += (j ? 'L' : 'M') + qx(s2).toFixed(1) + ',' + by(base(s2)).toFixed(1); }
    S.true2 = el('path', { d: db, fill: 'none', stroke: C.ink, 'stroke-width': 3.5, 'stroke-dasharray': '9 6' }, g2);
    var p2 = S.p2 = el('g', {}, g2);
    el('line', { x1: PX, x2: PX + 34, y1: 104, y2: 104, stroke: C.ink, 'stroke-width': 3.5, 'stroke-dasharray': '9 6' }, p2);
    t2(p2, PX + 44, 110, 'モデルの本当の性能', '', { 'font-size': 17, fill: C.ink });
    el('line', { x1: PX, x2: PX + 34, y1: 140, y2: 140, stroke: C.a, 'stroke-width': 2 }, p2);
    t2(p2, PX + 44, 146, 'テストデータ 1 組ごと', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 206, '揺れの元：', '', { 'font-size': 17, fill: C.ink });
    txt(p2, PX, 246, m('W') + '<tspan baseline-shift="super" font-size="15">' + m('p') + '</tspan>' + m('Y') + ' = ' + m('τ') + ' + <tspan fill="' + C.a + '">' + m('W') + '<tspan baseline-shift="super" font-size="15">' + m('p') + '</tspan>Φ(' + m('X') + ')</tspan> + …', { 'font-size': 24, fill: C.ink });
    t2(p2, PX, 296, '同じモデルでも、評価の値が', '', { 'font-size': 17, fill: C.ink });
    t2(p2, PX, 322, 'テストデータごとに変わる。', '', { 'font-size': 17, fill: C.ink });
    t2(g2, 940, 520, '模式図（論文 Fig. 1 の考え方を解説者が描いたもの）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 3: transformed outcomes shrink towards tau after adjustment =====
    var g3 = S.g[2];
    var phi = [1.2, 3.4, 2.1, 0.6, 2.8, 1.7, 3.9, 0.9, 2.4, 1.4, 3.1, 0.4, 2.0, 3.6, 1.0, 2.6];
    var eps = [0.10, -0.15, 0.05, 0.20, -0.05, 0.15, -0.20, 0.00, 0.10, -0.10, 0.05, 0.15, -0.15, 0.00, 0.20, -0.05];
    var err = [0.20, -0.25, 0.10, -0.15, 0.30, -0.10, 0.15, -0.30, 0.05, 0.25, -0.20, 0.10, -0.05, 0.20, -0.15, 0.00];
    var LX0 = 70, LX1 = 610, LO = -8, HI = 10;
    function lx(v) { return LX0 + (v - LO) / (HI - LO) * (LX1 - LX0); }
    el('line', { x1: lx(1), x2: lx(1), y1: 110, y2: 450, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, g3);
    t2(g3, lx(1) + 10, 128, '真の効果 ' + m('τ'), '', { 'font-size': 17, fill: C.ink });
    el('line', { x1: LX0, x2: LX1, y1: 450, y2: 450, stroke: C.muted }, g3);
    [-8, -4, 0, 4, 8].forEach(function (v) {
      el('text', { x: lx(v), y: 474, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g3).textContent = String(v).replace('-', '−');
    });
    t2(g3, LX0, 500, '変換アウトカムの値 →', '', { 'font-size': 15, fill: C.muted });
    S.lab3a = t2(g3, LX0, 76, '元のアウトカム ' + m('Y'), '', { 'font-size': 18, 'font-weight': 650, fill: C.a });
    S.lab3b = t2(g3, LX0, 76, '調整後のアウトカム ' + m('Y') + ' − ' + m('Φ̂') + '(' + m('X') + ')', '', { 'font-size': 18, 'font-weight': 650, fill: C.b });
    S.pts3 = phi.map(function (f, i) {
      var wp = i % 2 === 0 ? 2 : -2;
      var y = 170 + (i % 8) * 34;
      var o = { v0: 1 + wp * (f + eps[i]), v1: 1 + wp * (err[i] + eps[i]), tr: wp > 0, y: y };
      o.c = el('circle', o.tr ? { cy: y, r: 9 } : { cy: y, r: 8, fill: '#fff', 'stroke-width': 2.5 }, g3);
      return o;
    });
    var p3 = S.p3 = el('g', {}, g3);
    txt(p3, PX, 130, m('Y') + ' − ' + m('Φ̂') + '(' + m('X') + ')', { 'font-size': 32, 'font-weight': 650, fill: C.b });
    t2(p3, PX, 178, m('Φ̂') + '：学習データで当てた', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 204, 'アウトカムの予測', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 254, 'テストデータでは固定の関数', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 280, '→ 指標の期待値は変わらない', '', { 'font-size': 17, fill: C.ink });
    t2(p3, PX, 330, '残る揺れは', '', { 'font-size': 17, fill: C.ink });
    txt(p3, PX, 360, m('W') + '<tspan baseline-shift="super" font-size="14">' + m('p') + '</tspan>(' + m('Φ') + ' − ' + m('Φ̂') + ') と ' + m('W') + '<tspan baseline-shift="super" font-size="14">' + m('p') + '</tspan>' + m('ε'), { 'font-size': 20, fill: C.ink });
    t2(g3, 940, 520, '模式図（' + m('p') + ' = 0.5、値は解説者が置いた例。● 処置群 ○ 対照群）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 4: Table 3 (arXiv v3), misleading evaluations vs. true CATE (%) =====
    var g4 = S.g[3];
    var rows = [['aw, σ = 0.5', 39.3, 4.4], ['aw, σ = 1', 32.9, 8.7], ['aw, σ = 2', 25.1, 9.2],
                ['nw, σ = 0.5', 33.8, 6.6], ['nw, σ = 1', 26.4, 8.2], ['nw, σ = 2', 15.9, 10.7]];
    var X0 = 210, X1 = 600, MAX = 45, Y0 = 110, DY = 52;
    function cx(v) { return X0 + v / MAX * (X1 - X0); }
    S.cx4 = cx;
    t2(g4, 70, 58, '真の CATE より因果フォレストを良いと判定した割合（%）', '', { 'font-size': 17, 'font-weight': 600, fill: C.ink });
    [0, 10, 20, 30, 40].forEach(function (v) {
      el('line', { x1: cx(v), x2: cx(v), y1: Y0 - 28, y2: Y0 + DY * 5 + 26, stroke: C.hair }, g4);
      el('text', { x: cx(v), y: Y0 + DY * 5 + 52, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g4).textContent = v;
    });
    S.rows4 = rows.map(function (rw, i) {
      var y = Y0 + DY * i, o = { r: rw };
      el('text', { x: X0 - 16, y: y + 5, 'font-size': 15, fill: C.ink, 'text-anchor': 'end' }, g4).textContent = rw[0];
      o.ln = el('line', { x1: cx(rw[1]), x2: cx(rw[1]), y1: y, y2: y, stroke: C.gray, 'stroke-width': 4 }, g4);
      o.o = el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: C.a }, g4);
      o.d = el('circle', { cx: cx(rw[1]), cy: y, r: 10, fill: C.b }, g4);
      o.t0 = 25 + i * 0.6;
      return o;
    });
    var p4 = S.p4 = el('g', {}, g4);
    el('circle', { cx: PX + 9, cy: 105, r: 9, fill: C.a }, p4);
    t2(p4, PX + 26, 111, '元のアウトカム', '', { 'font-size': 17, fill: C.ink });
    el('circle', { cx: PX + 9, cy: 140, r: 9, fill: C.b }, p4);
    t2(p4, PX + 26, 146, '二重頑健調整', '', { 'font-size': 17, fill: C.ink });
    t2(p4, PX, 200, 'aw、σ = 0.5 の場合', '', { 'font-size': 16, fill: C.muted });
    txt(p4, PX, 238, '39.3%', { 'font-size': 30, 'font-weight': 650, fill: C.a });
    txt(p4, PX + 104, 238, '→', { 'font-size': 22, fill: C.ink });
    txt(p4, PX + 138, 238, '4.4%', { 'font-size': 30, 'font-weight': 650, fill: C.b });
    t2(p4, PX, 290, '10,000 回のシミュレーション', '', { 'font-size': 15, fill: C.ink });
    t2(p4, PX, 314, 'テストデータは毎回 5,000 件', '', { 'font-size': 15, fill: C.ink });
    t2(g4, 940, 520, '論文 Table 3（arXiv v3）の数値から作図', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' });

    // ===== scene 5: title card =====
    var g5 = S.g[4];
    el('text', { x: 480, y: 150, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g5).textContent = 'EUROPEAN JOURNAL OF OPERATIONAL RESEARCH · 2024';
    el('text', { x: 480, y: 212, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Improving uplift model evaluation on';
    el('text', { x: 480, y: 254, 'font-size': 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'randomized controlled trial data';
    t2(g5, 480, 300, 'ランダム化比較試験データでのアップリフトモデル評価の改善', '', { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    el('text', { x: 480, y: 350, 'font-size': 17, fill: C.ink, 'text-anchor': 'middle' }, g5).textContent = 'Björn Bokelmann · Stefan Lessmann';
    el('text', { x: 480, y: 408, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g5).textContent = 'github.com/bokelmab/uplift_metrics';
    t2(g5, 480, 468, '非公式の解説（著者によるものではありません）', '', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    return S;
  }

  function render(S, t) {
    S.g.forEach(function (g, i) {
      var a = BOUNDS[i], b = BOUNDS[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
    // scene 1: the box widens column by column, the Qini curve follows
    var k1 = seg(t, 1.5, 6.5), cols = 1 + Math.round(k1 * 9);
    S.box1.setAttribute('width', cols * 48);
    S.sLab.innerHTML = '上位 <tspan class="mi">s</tspan> = ' + (cols * 10) + '%';
    S.curve1.setAttribute('d', pathOf(base, cols / 10));
    S.p1.setAttribute('opacity', seg(t, 0.8, 1.6));
    // scene 2: curves from different test sets appear one by one
    S.curves2.forEach(function (c) { c.p.setAttribute('opacity', 0.75 * seg(t, c.t0, c.t0 + 0.3)); });
    S.true2.setAttribute('opacity', seg(t, 8.6, 9.2));
    S.p2.setAttribute('opacity', seg(t, 10, 10.8));
    // scene 3: points move from original to adjusted values and turn blue
    var k3 = seg(t, 18.5, 21);
    S.pts3.forEach(function (o, i) {
      var LX0 = 70, LX1 = 610, LO = -8, HI = 10;
      var v = o.v0 + (o.v1 - o.v0) * k3, x = LX0 + (v - LO) / (HI - LO) * (LX1 - LX0);
      var col = H.mix(C.a, C.b, k3);
      o.c.setAttribute('cx', x);
      if (o.tr) o.c.setAttribute('fill', col); else o.c.setAttribute('stroke', col);
    });
    S.lab3a.setAttribute('opacity', 1 - seg(t, 18.5, 19.3));
    S.lab3b.setAttribute('opacity', seg(t, 20.2, 21));
    S.p3.setAttribute('opacity', seg(t, 19, 19.8));
    // scene 4: orange dot appears, blue dot slides down to the adjusted value
    S.rows4.forEach(function (o) {
      var s = seg(t, o.t0, o.t0 + 0.4), k = seg(t, o.t0 + 0.6, o.t0 + 1.6);
      var x = S.cx4(o.r[1] + (o.r[2] - o.r[1]) * k);
      o.o.setAttribute('opacity', s); o.ln.setAttribute('opacity', s);
      o.d.setAttribute('opacity', k > 0 ? 1 : 0); o.d.setAttribute('cx', x); o.ln.setAttribute('x2', x);
    });
    S.p4.setAttribute('opacity', seg(t, 29.5, 30.3));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 31 });
})();
