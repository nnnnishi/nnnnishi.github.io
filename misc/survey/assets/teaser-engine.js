// =====================================================================
// teaser-engine.js — paper-independent player for a live SVG teaser.
// A paper supplies scenes with Teaser.start({...}) in its own teaser-scenes.js.
// Shared by every explainer page under /misc/survey/ (one copy only; pages load it as
// ../../../assets/teaser-engine.js). A change here affects all explainer teasers.
//
//   Teaser.start({
//     root:     document.getElementById('teaser'),   // figure with svg, .tcap, [data-act=toggle], .tdots
//     bounds:   [0, 8, 16, 24, 33, 40],                // scene start times in seconds; last = loop length
//     captions: [{ ja: '...', en: '...' }, ...],       // one per scene; may contain <span class="A|B">
//     build:    function (svg, H) { return state; },   // create SVG elements once
//     render:   function (state, t, H) { ... },        // set attributes for time t (pure function of t)
//     still:    31.5                                   // frame shown when prefers-reduced-motion is on
//   });
//
// Behaviour: plays when ≥50% visible, pauses off-screen, a reader's pause sticks,
// scene dots jump to a scene, captions follow <html data-lang>, ?teaser_t=12 freezes at 12 s.
// =====================================================================
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  var H = {
    C: { a: '#C2410C', b: '#1D4ED8', gray: '#CBD2DC', ink: '#16202E', muted: '#5B6676', hair: '#D9DEE6', panel: '#EEF0F3', bsoft: '#E7EEFC' },
    MI: 'class="mi"',   // put inside <tspan> for italic maths
    el: function (tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    },
    // bilingual SVG text; ja/en may contain <tspan> markup; pass '' to show nothing in that language
    t2: function (parent, x, y, ja, en, attrs) {
      var g = H.el('g', {}, parent);
      [['ja', ja], ['en', en]].forEach(function (p) {
        var a = { x: x, y: y, 'data-l': p[0] };
        for (var k in attrs) a[k] = attrs[k];
        H.el('text', a, g).innerHTML = p[1];
      });
      return g;
    },
    clamp: function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; },
    ease: function (v) { return v * v * (3 - 2 * v); },
    // 0 before a, 1 after b, eased in between: the basic building block of every animation
    seg: function (t, a, b) { return H.ease(H.clamp((t - a) / (b - a))); },
    mix: function (c1, c2, k) {
      function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
      var a = hex(c1), b = hex(c2);
      return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(',') + ')';
    },
    // deterministic random numbers, so every viewer sees the same picture
    rng: function (seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
  };

  function start(cfg) {
    var root = cfg.root;
    if (!root) return;
    var svg = root.querySelector('svg'), cap = root.querySelector('.tcap');
    var tog = root.querySelector('[data-act="toggle"]'), dotsBox = root.querySelector('.tdots');
    var B = cfg.bounds, LEN = B[B.length - 1];
    var S = cfg.build(svg, H);
    var t = 0, playing = false, held = false, last = null, scene = -1;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dotBtns = cfg.captions.map(function (c, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', 'Scene ' + (i + 1));
      b.addEventListener('click', function () { t = B[i] + 0.01; draw(); });
      dotsBox.appendChild(b); return b;
    });
    function sceneAt(t) { for (var i = B.length - 2; i >= 0; i--) if (t >= B[i]) return i; return 0; }
    function draw() {
      cfg.render(S, t, H);
      var i = sceneAt(t);
      if (i !== scene) {
        scene = i;
        cap.innerHTML = '<span data-l="ja">' + cfg.captions[i].ja + '</span><span data-l="en">' + cfg.captions[i].en + '</span>';
        cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in');
        dotBtns.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      }
    }
    function frame(now) {
      if (!playing) { last = null; return; }
      if (last !== null) { t += (now - last) / 1000; if (t >= LEN) t -= LEN; }
      last = now; draw(); requestAnimationFrame(frame);
    }
    function sync() {
      var l = document.documentElement.dataset.lang;
      tog.textContent = playing ? (l === 'en' ? 'Pause' : '一時停止') : (l === 'en' ? 'Play' : '再生');
    }
    function play() { if (playing) return; playing = true; sync(); requestAnimationFrame(frame); }
    function pause() { playing = false; sync(); }
    function toggle() { if (playing) { held = true; pause(); } else { held = false; play(); } }
    tog.addEventListener('click', toggle);
    svg.addEventListener('click', toggle);
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

    var fixed = new URLSearchParams(location.search).get('teaser_t');
    if (fixed !== null) { t = +fixed; draw(); sync(); return; }
    if (still) { t = cfg.still != null ? cfg.still : 0; draw(); sync(); return; }
    draw(); sync();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) { if (!held) play(); }
          else pause();
        });
      }, { threshold: [0, 0.5, 1] }).observe(svg);
    } else play();
  }

  window.Teaser = { start: start, helpers: H };
})();
