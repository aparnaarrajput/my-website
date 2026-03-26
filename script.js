/* ============================================================
   APARNA RAJPUT — ACADEMIC PROFILE — JS
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar: scroll shadow + mobile toggle ---- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 16) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  }, { passive: true });

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  /* ---- Active section highlight ---- */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  function highlightActiveSection() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.getBoundingClientRect().top;
      if (top <= 80) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ---- Smooth scroll with offset (accounts for sticky navbar) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- Scroll-reveal animation ---- */
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 0.6s ease, transform 0.6s ease; }
    .reveal.visible { opacity: 1; transform: translate3d(0, 0, 0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }
  `;
  document.head.appendChild(style);

  // Add reveal classes to card/block elements
  const revealSelectors = [
    '.research-card',
    '.publication-item',
    '.teaching-block',
    '.award-item',
    '.edu-item',
    '.skill-item',
    '.about-photo-col',
    '.about-text-col',
  ];
  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      const delay = (i % 5) + 1;
      el.classList.add('reveal-delay-' + delay);
    });
  });

  // Also add reveal to section headers
  document.querySelectorAll('.section-header').forEach(function (el) {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // Initial check (elements already in view on load)
  highlightActiveSection();

  /* ---- Lorenz Attractor Canvas Animation ---- */
  (function () {
    var canvas = document.getElementById('lorenz-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    // Lorenz parameters
    var sigma = 10, rho = 28, beta = 8 / 3, dt = 0.006;

    // Pre-compute full trajectory
    var px = 0.1, py = 0, pz = 0;
    var points = [];
    for (var i = 0; i < 14000; i++) {
      var dx = sigma * (py - px);
      var dy = px * (rho - pz) - py;
      var dz = px * py - beta * pz;
      px += dx * dt; py += dy * dt; pz += dz * dt;
      points.push([px, pz]); // x–z projection = butterfly
    }

    // Bounding box
    var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    points.forEach(function (p) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minZ) minZ = p[1]; if (p[1] > maxZ) maxZ = p[1];
    });

    // Precompute colors: hue cycles 200→320→60→200 (cyan→magenta→gold→cyan)
    var colors = points.map(function (_, i) {
      var t = i / points.length;
      // Two-lobe palette: left lobe cyan/teal, right lobe gold/amber, transitions through magenta
      var hue = (200 + t * 360) % 360;
      return 'hsl(' + hue.toFixed(0) + ',90%,72%)';
    });

    var drawn = 0;
    var BATCH = 22;
    var rafId;

    function toCanvas(p) {
      var m = 0.10;
      var rx = maxX - minX, rz = maxZ - minZ;
      var scale = Math.min(canvas.width * (1 - 2*m) / rx, canvas.height * (1 - 2*m) / rz);
      var cx = canvas.width  / 2 - ((minX + maxX) / 2) * scale;
      var cy = canvas.height / 2 + ((minZ + maxZ) / 2) * scale;
      return [p[0] * scale + cx, -p[1] * scale + cy];
    }

    function setGlow(color) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
    }

    function redrawAll() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (drawn < 2) return;
      // Draw in color segments to restore colors after resize
      var segLen = 80;
      for (var s = 1; s < drawn; s += segLen) {
        var end = Math.min(s + segLen, drawn);
        ctx.beginPath();
        var c0 = toCanvas(points[s - 1]);
        ctx.moveTo(c0[0], c0[1]);
        for (var j = s; j < end; j++) {
          var c = toCanvas(points[j]);
          ctx.lineTo(c[0], c[1]);
        }
        ctx.strokeStyle = colors[s];
        ctx.lineWidth = 1.3;
        setGlow(colors[s]);
        ctx.stroke();
      }
    }

    function animate() {
      if (drawn >= points.length) {
        setTimeout(function () {
          drawn = 0;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          rafId = requestAnimationFrame(animate);
        }, 3500);
        return;
      }
      var end = Math.min(drawn + BATCH, points.length);
      if (drawn >= 1) {
        ctx.beginPath();
        var prev = toCanvas(points[drawn - 1]);
        ctx.moveTo(prev[0], prev[1]);
        for (var i = drawn; i < end; i++) {
          var c = toCanvas(points[i]);
          ctx.lineTo(c[0], c[1]);
        }
        var col = colors[drawn];
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.3;
        setGlow(col);
        ctx.stroke();
      }
      drawn = end;
      rafId = requestAnimationFrame(animate);
    }

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawAll();
    }

    // Pause when hero scrolled out of view
    var heroObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        rafId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(rafId);
      }
    }, { threshold: 0 });
    heroObserver.observe(document.getElementById('home'));

    window.addEventListener('resize', resize, { passive: true });
    resize();
    rafId = requestAnimationFrame(animate);
  })();
})();
