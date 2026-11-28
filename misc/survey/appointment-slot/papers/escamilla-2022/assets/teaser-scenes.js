// ---- shared helpers for the appointment-slot explainer teasers (Japanese-only pages) ----
window.TZ = (function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  function T(g, x, y, s, attrs) { return H.t2(g, x, y, s, '', attrs || {}); }
  // explanation column: title + lines [[text, size?, fill?, weight?], ...]
  function panel(g, x, y, title, color, lines) {
    var p = el('g', {}, g), yy = y;
    if (title) { T(p, x, yy, title, { 'font-size': 18, 'font-weight': 650, fill: color || C.ink }); yy += 44; }
    lines.forEach(function (l) {
      if (l === null) { yy += 22; return; }
      if (typeof l === 'string') l = [l];
      T(p, x, yy, l[0], { 'font-size': l[1] || 16, fill: l[2] || C.ink, 'font-weight': l[3] || 400 });
      yy += (l[1] || 16) + 10;
    });
    return p;
  }
  // paired horizontal bars (orange vs blue) on a common linear axis
  // o: {x0, x1, v0, v1, y0, rowH, rows:[{label, a, b, la, lb}], t0, dt, ticks:[..], fmt}
  function pairs(g, o) {
    var sc = function (v) { return o.x0 + (v - o.v0) / (o.v1 - o.v0) * (o.x1 - o.x0); };
    var yEnd = o.y0 + o.rows.length * o.rowH;
    (o.ticks || []).forEach(function (v) {
      el('line', { x1: sc(v), x2: sc(v), y1: o.y0 - 8, y2: yEnd, stroke: C.hair, 'stroke-width': 1 }, g);
      el('text', { x: sc(v), y: yEnd + 22, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.fmt ? o.fmt(v) : String(v);
    });
    el('line', { x1: o.x0, x2: o.x0, y1: o.y0 - 8, y2: yEnd, stroke: C.ink, 'stroke-width': 1.5 }, g);
    var items = [];
    o.rows.forEach(function (r, i) {
      var y = o.y0 + i * o.rowH, bh = (o.rowH - 14) / 2;
      T(g, o.x0 - 12, y + bh + 6, r.label, { 'font-size': 15, fill: C.ink, 'text-anchor': 'end' });
      [['a', C.a, 0], ['b', C.b, 1]].forEach(function (k) {
        if (r[k[0]] == null) return;
        var rect = el('rect', { x: o.x0, y: y + k[2] * (bh + 2), width: 0, height: bh, fill: k[1] }, g);
        var lab = el('text', { x: sc(r[k[0]]) + 6, y: y + k[2] * (bh + 2) + bh - 3, 'font-size': 14, 'font-weight': 600, fill: k[1] }, g);
        lab.textContent = r['l' + k[0]] || String(r[k[0]]);
        items.push({ rect: rect, lab: lab, w: sc(r[k[0]]) - o.x0, t0: o.t0 + i * (o.dt || 0.5) + k[2] * 0.25 });
      });
    });
    return items;
  }
  function renderBars(items, t) {
    items.forEach(function (b) {
      b.rect.setAttribute('width', Math.max(0, b.w * H.ease(seg(t, b.t0, b.t0 + 0.7))));
      b.lab.setAttribute('opacity', seg(t, b.t0 + 0.5, b.t0 + 0.9));
    });
  }
  // title card: o = {cards:[[label, value]...], venue, title:[l1,l2], sub, authors:[..lines], url}
  function title(g, o) {
    var n = o.cards.length, w = 300, gap = 60, x = 480 - (n * w + (n - 1) * gap) / 2;
    o.cards.forEach(function (c, i) {
      var cx = x + i * (w + gap);
      el('rect', { x: cx, y: 40, width: w, height: 70, rx: 12, fill: C.bsoft }, g);
      T(g, cx + w / 2, 68, c[0], { 'font-size': 15, fill: C.b, 'text-anchor': 'middle' });
      T(g, cx + w / 2, 96, c[1], { 'font-size': 18, 'font-weight': 650, fill: C.b, 'text-anchor': 'middle' });
    });
    el('text', { x: 480, y: 170, 'font-size': 15, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle', 'letter-spacing': 2.5 }, g).textContent = o.venue;
    o.title.forEach(function (l, i) {
      el('text', { x: 480, y: 220 + i * 40, 'font-size': o.tsize || 32, 'font-weight': 650, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = l;
    });
    var y = 220 + o.title.length * 40;
    T(g, 480, y + 2, o.sub, { 'font-size': 18, fill: C.muted, 'text-anchor': 'middle' });
    o.authors.forEach(function (a, i) {
      el('text', { x: 480, y: y + 50 + i * 26, 'font-size': 16, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = a;
    });
    el('text', { x: 480, y: y + 60 + o.authors.length * 26 + 20, 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' }, g).textContent = o.url;
    T(g, 480, 512, '非公式の解説（著者によるものではありません）', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
  }
  function note(g, s) { return T(g, 940, 520, s, { 'font-size': 14, fill: C.muted, 'text-anchor': 'end' }); }
  function fades(gs, B, t) {
    gs.forEach(function (g, i) {
      var a = B[i], b = B[i + 1];
      g.setAttribute('opacity', seg(t, a, a + 0.6) * (1 - seg(t, b - 0.6, b)));
    });
  }
  // a small binary tree drawn from a nested spec: {l:'B', y:[..], n:[..]} or {leaf:'1'}
  // returns {g, nodes:[{el, depth}], edges:[...]} ; dx halves per level
  function tree(g, spec, x, y, dx, dy, color) {
    var out = { nodes: [], edges: [] };
    (function rec(s, x, y, dx, d) {
      if (s.leaf != null) {
        var r = el('rect', { x: x - 20, y: y - 16, width: 40, height: 32, rx: 6, fill: '#fff', stroke: color, 'stroke-width': 1.8 }, g);
        var tx = el('text', { x: x, y: y + 6, 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, g); tx.textContent = s.leaf;
        out.nodes.push({ el: r, tx: tx, d: d, leaf: true });
        return;
      }
      [[s.yes, -1, '1'], [s.no, 1, '0']].forEach(function (c) {
        var e = el('line', { x1: x, y1: y + 18, x2: x + c[1] * dx, y2: y + dy - 18, stroke: color, 'stroke-width': 1.8 }, g);
        var lb = el('text', { x: x + c[1] * dx / 2 + c[1] * 10, y: y + dy / 2 + 4, 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' }, g); lb.textContent = c[2];
        out.edges.push({ el: e, lb: lb, d: d });
        rec(c[0], x + c[1] * dx, y + dy, dx / 2, d + 1);
      });
      var ci = el('circle', { cx: x, cy: y, r: 20, fill: color }, g);
      var tx = el('text', { x: x, y: y + 6, 'font-size': 17, 'font-weight': 650, 'text-anchor': 'middle', fill: '#fff' }, g); tx.textContent = s.l;
      out.nodes.push({ el: ci, tx: tx, d: d });
    })(spec, x, y, dx, 0);
    return out;
  }
  return { T: T, panel: panel, pairs: pairs, renderBars: renderBars, title: title, note: note, fades: fades, tree: tree };
})();
// =====================================================================
// teaser-scenes.js — Escamilla, A Decision Support Simulation to Analyze Scheduling Alternatives for
// Applicant Processing at Military Entrance Processing Stations (MEPS) (AFIT MS thesis, 2022).
// Unofficial explainer based on the thesis PDF. Arrival counts and window times are the large-MEPS
// HeavyDEP settings of Appendices C and F; the 8-window case has exponential gaps (mean 30 min) and is
// drawn evenly up to its stated final batch (09:30) — a schematic. Result numbers come from
// Table 4.3, §4.6 and §4.10 of the thesis.
// Colours: orange = the status-quo single batch / holdovers; blue = the alternatives.
// =====================================================================
(function () {
  var H = Teaser.helpers, C = H.C, el = H.el, seg = H.seg;
  var T = TZ.T;

  var CAPTIONS = [
    { ja: '入隊検査所では、DEP の志願者<span class="A">40 人が朝 6 時に一括で到着</span>する（大規模の検査所）。', en: '' },
    { ja: '<span class="B">分割シフト</span>で 6 時と 11 時に分けると、持ち越しが現状より 7.5〜10.5 人増えた。', en: '' },
    { ja: '<span class="B">予約制</span>は 3〜8 枠。最後の枠が 9 時を過ぎると持ち越しが増えた。', en: '' },
    { ja: '<span class="B">優先レーン</span>は一括到着のまま説明を飛ばし、DEP の待ち時間を 64〜78 分短くした。', en: '' },
    { ja: '結論：現状維持が最もリスクが小さく、優先レーンは DEP の多い日に使える。', en: '' }
  ];
  var BOUNDS = [0, 8, 16, 24, 32, 40];
  var PX = 660;
  var X0 = 120, HW = 42; // 5:00 .. 17:00
  function hx(h) { return X0 + (h - 5) * HW; }

  function timeline(g, y, withClose) {
    el('line', { x1: hx(5), y1: y, x2: hx(17), y2: y, stroke: C.ink, 'stroke-width': 1.5 }, g);
    [6, 9, 12, 15].forEach(function (h) {
      el('line', { x1: hx(h), y1: y - 5, x2: hx(h), y2: y + 5, stroke: C.ink }, g);
      T(g, hx(h), y + 24, h + '時', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
    });
    if (withClose) {
      el('line', { x1: hx(16.5), y1: y - 150, x2: hx(16.5), y2: y + 5, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
      T(g, hx(16.5), y - 158, '16:30 終了', { 'font-size': 14, fill: C.a, 'text-anchor': 'middle' });
    }
  }
  // a stack of n dots above time h (4 per row)
  function crowd(g, h, n, color, y) {
    var dots = [];
    for (var i = 0; i < n; i++) {
      var col = i % 4, row = Math.floor(i / 4);
      dots.push(el('circle', { cx: hx(h) - 18 + col * 12, cy: y - 14 - row * 12, r: 5, fill: color }, g));
    }
    return dots;
  }

  function build(svg) {
    var S = {};
    S.g = [0, 1, 2, 3, 4].map(function () { return el('g', {}, svg); });

    // ===== scene 1: single batch of 40 DEP =====
    var g1 = S.g[0];
    T(g1, 70, 80, 'DEP の志願者の到着（大規模、DEP が多い日）', { 'font-size': 15, fill: C.muted });
    timeline(g1, 360, true);
    S.c1 = crowd(g1, 6, 40, C.a, 360);
    S.p1 = TZ.panel(g1, PX, 140, '現状', C.a, [['DEP 40 人と Ship 8 人が', 16], ['6 時に一括で到着', 16], null, ['16:30 に終わらない人は', 15, C.muted], ['持ち越し（別の日に再来）', 15, C.muted]]);
    TZ.note(g1, '到着数は論文 Appendix F');

    // ===== scene 2: split shift =====
    var g2 = S.g[1];
    timeline(g2, 360, true);
    S.c2a = crowd(g2, 6, 20, C.b, 360);
    S.c2b = crowd(g2, 11, 20, C.b, 360);
    S.p2 = TZ.panel(g2, PX, 140, '分割シフト', C.b, [['6 時と 11 時に 20 人ずつ', 16], null, ['持ち越し（現状との差）', 15, C.ink], ['+7.52〜10.54 人', 22, C.a, 650], null, ['DEP の処理数 −8〜12 人', 15, C.a]]);
    TZ.note(g2, '大規模の検査所。論文 Table 4.3 と §4.6');

    // ===== scene 3: appointment windows (3, 4, 6, 8) and the 09:00 threshold =====
    var g3 = S.g[2];
    timeline(g3, 360, false);
    el('rect', { x: hx(9), y: 150, width: hx(17) - hx(9), height: 215, fill: C.a, 'fill-opacity': 0.07 }, g3);
    el('line', { x1: hx(9), y1: 150, x2: hx(9), y2: 365, stroke: C.a, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g3);
    T(g3, hx(9) + 8, 168, '9 時より後の到着 → 持ち越しが増える', { 'font-size': 14, fill: C.a });
    var sets = {
      3: { t: [6, 8, 10], n: 13 },
      4: { t: [6, 7, 8, 9], n: 10 },
      6: { t: [6, 6.75, 7.5, 8.25, 9, 9.75], n: 7 },
      8: { t: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5], n: 5 }
    };
    S.w3 = [3, 4, 6, 8].map(function (k, i) {
      var gg = el('g', {}, g3);
      sets[k].t.forEach(function (h) {
        var bh = sets[k].n * 12;
        el('rect', { x: hx(h) - 7, y: 360 - 4 - bh, width: 14, height: bh, rx: 3, fill: C.b }, gg);
        T(gg, hx(h), 360 - 10 - bh, String(sets[k].n), { 'font-size': 14, fill: C.b, 'text-anchor': 'middle' });
      });
      T(gg, 70, 110, '予約 ' + k + ' 枠（1 枠 ' + sets[k].n + ' 人）', { 'font-size': 18, 'font-weight': 650, fill: C.b });
      return { g: gg, a: 16.4 + i * 1.8, b: 16.4 + (i + 1) * 1.8 };
    });
    S.p3 = TZ.panel(g3, PX, 140, '予約制', C.b, [['最後の枠の時刻', 15], ['3 枠 10:00 / 4 枠 9:00', 15], ['6 枠 9:45 / 8 枠 9:30', 15], null, ['3 枠ではすべての規模で', 15, C.a], ['持ち越しが増えた', 15, C.a]]);
    TZ.note(g3, '論文 Appendix C・F、§4.5（8 枠の間隔は平均 30 分の指数分布）');

    // ===== scene 4: express lane =====
    var g4 = S.g[3];
    var st = ['到着', '司令官の説明', '健康診断の説明', '健康診断', '業務'];
    st.forEach(function (s, i) {
      var x = 70 + i * 116;
      el('rect', { x: x, y: 220, width: 104, height: 56, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 1.4 }, g4);
      T(g4, x + 52, 254, s, { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink });
    });
    el('path', { d: 'M 122 290 L 122 320 L 586 320 L 586 290', fill: 'none', stroke: C.gray, 'stroke-width': 3 }, g4);
    T(g4, 70, 350, 'ふつうの DEP：すべてを順に通る', { 'font-size': 14, fill: C.muted });
    S.path4a = el('path', { d: 'M 122 216 Q 238 150 354 216', fill: 'none', stroke: C.b, 'stroke-width': 3 }, g4);
    S.lab4a = T(g4, 238, 208, '優先レーン 1', { 'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.path4b = el('path', { d: 'M 122 216 Q 296 90 470 216', fill: 'none', stroke: C.b, 'stroke-width': 3, 'stroke-dasharray': '6 4' }, g4);
    S.lab4b = T(g4, 296, 118, '優先レーン 2', { 'font-size': 14, 'font-weight': 600, fill: C.b, 'text-anchor': 'middle' });
    S.p4 = TZ.panel(g4, PX, 140, '優先レーン', C.b, [['DEP の 25% が説明を飛ばす', 15], null, ['DEP の待ち時間', 15, C.ink], ['−64〜78 分', 22, C.b, 650], null, ['持ち越しは現状以下', 15, C.muted]]);
    TZ.note(g4, '大規模の検査所。論文 §3.14、§4.10、Table 4.3');

    // ===== scene 5 =====
    TZ.title(S.g[4], {
      cards: [['分割シフト・予約制', '今の運用では勧めない'], ['優先レーン', 'DEP の多い日に有効']],
      venue: 'AFIT MS THESIS 2022', title: ['A Decision Support Simulation to Analyze', 'Scheduling Alternatives for Applicant', 'Processing at MEPS'], tsize: 27,
      sub: '入隊検査所の受付方法の代案の分析', authors: ['Jonathan M. Escamilla'], url: 'scholar.afit.edu/etd/5339'
    });
    return S;
  }

  function render(S, t) {
    TZ.fades(S.g, BOUNDS, t);
    S.c1.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 0.8 + i * 0.05, 1.1 + i * 0.05)); });
    S.p1.setAttribute('opacity', seg(t, 3.6, 4.4));
    S.c2a.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 8.8 + i * 0.05, 9.1 + i * 0.05)); });
    S.c2b.forEach(function (d, i) { d.setAttribute('opacity', seg(t, 10.4 + i * 0.05, 10.7 + i * 0.05)); });
    S.p2.setAttribute('opacity', seg(t, 11.6, 12.4));
    S.w3.forEach(function (w, i) {
      var last = i === S.w3.length - 1;
      w.g.setAttribute('opacity', seg(t, w.a, w.a + 0.25) * (last ? 1 : 1 - seg(t, w.b, w.b + 0.25)));
    });
    S.p3.setAttribute('opacity', seg(t, 17.0, 17.8));
    S.path4a.setAttribute('opacity', seg(t, 25.4, 26.0));
    S.lab4a.setAttribute('opacity', seg(t, 25.6, 26.2));
    S.path4b.setAttribute('opacity', seg(t, 26.6, 27.2));
    S.lab4b.setAttribute('opacity', seg(t, 26.8, 27.4));
    S.p4.setAttribute('opacity', seg(t, 27.6, 28.4));
  }

  Teaser.start({ root: document.getElementById('teaser'), bounds: BOUNDS, captions: CAPTIONS, build: build, render: render, still: 34 });
})();
