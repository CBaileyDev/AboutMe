/* ============================================
   Carter Bailey Portfolio — script.js
   Space/AI theme: starfield, shooting stars,
   Lenis smooth scroll, GSAP parallax,
   typewriter, custom cursor, neural net
   ============================================ */

// ---- LENIS SMOOTH SCROLL ----
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
});

function rafLoop(time) {
  lenis.raf(time);
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

// Anchor links integrate with Lenis
document.querySelectorAll('a[href^="#"]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(el.getAttribute('href'));
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
  });
});

// ---- GSAP SCROLL TRIGGER (registers Lenis) ----
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ---- NAVBAR SCROLL STATE ----
const navbar = document.getElementById('navbar');
lenis.on('scroll', ({ scroll }) => {
  navbar.classList.toggle('scrolled', scroll > 60);
});

// ---- CUSTOM CURSOR ----
const cursorOuter = document.querySelector('.cursor-outer');
const cursorDot   = document.querySelector('.cursor-dot');

if (cursorOuter && cursorDot) {
  let mx = 0, my = 0, ox = 0, oy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  // Outer cursor lags behind
  (function animateCursor() {
    ox += (mx - ox) * 0.18;
    oy += (my - oy) * 0.18;
    cursorOuter.style.left = ox + 'px';
    cursorOuter.style.top  = oy + 'px';
    requestAnimationFrame(animateCursor);
  })();

  // Hover expansion
  document.querySelectorAll('a, button, .card, .contact-item, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ---- SPACE CANVAS (starfield + shooting stars) ----
(function initSpace() {
  const canvas = document.getElementById('space-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 1200);
    for (let i = 0; i < count; i++) {
      const radius = Math.random() < 0.06 ? Math.random() * 1.8 + 0.8 : Math.random() * 0.9 + 0.1;
      const brightness = 0.2 + Math.random() * 0.8;
      // Color tint: most white, some blue-ish, a few purple
      const hue = Math.random() < 0.15 ? 260 + Math.random() * 40 : Math.random() < 0.25 ? 200 + Math.random() * 30 : 0;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: radius,
        base: brightness,
        alpha: brightness,
        twinkleSpeed: 0.003 + Math.random() * 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        hue,
      });
    }
  }

  function spawnShooter() {
    const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
    const speed = 8 + Math.random() * 14;
    shooters.push({
      x: Math.random() * W * 0.8,
      y: Math.random() * H * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 80 + Math.random() * 120,
      alpha: 1,
      life: 1,
    });
  }

  // Spawn shooters randomly
  setInterval(spawnShooter, 2200 + Math.random() * 3000);
  setInterval(spawnShooter, 3500 + Math.random() * 4000);

  let frame = 0;

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    frame++;

    // Draw stars
    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      s.alpha = s.base * (0.55 + 0.45 * Math.sin(s.twinklePhase));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      if (s.hue) {
        ctx.fillStyle = `hsla(${s.hue}, 60%, 85%, ${s.alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      }
      ctx.fill();

      // Larger stars get a glow
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        const col = s.hue ? `hsla(${s.hue}, 80%, 80%,` : 'rgba(200, 180, 255,';
        grad.addColorStop(0, `${col} ${s.alpha * 0.4})`);
        grad.addColorStop(1, `${col} 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // Draw shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.018;
      if (s.life <= 0 || s.x > W + 200 || s.y > H + 100) {
        shooters.splice(i, 1); continue;
      }

      const tailX = s.x - s.vx * (s.len / (Math.abs(s.vx) + 0.001));
      const tailY = s.y - s.vy * (s.len / (Math.abs(s.vy) + 0.001));

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, `rgba(200, 160, 255, 0)`);
      grad.addColorStop(0.6, `rgba(220, 200, 255, ${s.life * 0.5})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.life})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * s.life;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright tip
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 255, ${s.life})`;
      ctx.fill();
    }
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ---- TYPEWRITER ----
(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'AI systems',
    'automation tools',
    'agent swarms',
    'custom GUIs',
    'things that think',
    'the impossible',
  ];

  let wordIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const word = words[wordIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++charIdx);
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 75 + Math.random() * 60);
    } else {
      el.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 35 + Math.random() * 25);
    }
  }
  setTimeout(tick, 800);
})();

// ---- NEURAL NET CANVAS ----
(function initNeural() {
  const container = document.getElementById('neural-net');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], pulses = [];

  function resize() {
    const rect = container.getBoundingClientRect();
    W = canvas.width  = rect.width  || 400;
    H = canvas.height = rect.height || 380;
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    const count = 28;
    // Arrange in loose layers
    const layers = [4, 6, 7, 6, 5];
    let layerX = 0;
    layers.forEach((n, li) => {
      const xBase = 0.08 + (li / (layers.length - 1)) * 0.84;
      for (let i = 0; i < n; i++) {
        const yBase = (i + 1) / (n + 1);
        nodes.push({
          x: xBase * W + (Math.random() - 0.5) * 20,
          y: yBase * H + (Math.random() - 0.5) * 20,
          r: 3 + Math.random() * 3,
          layer: li,
          alpha: 0.4 + Math.random() * 0.6,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    // Spawn a pulse occasionally
    setInterval(() => {
      if (nodes.length < 2) return;
      const from = nodes[Math.floor(Math.random() * nodes.length)];
      // Connect to node in next layer
      const candidates = nodes.filter(n => n.layer === from.layer + 1);
      if (!candidates.length) return;
      const to = candidates[Math.floor(Math.random() * candidates.length)];
      pulses.push({ x: from.x, y: from.y, tx: to.x, ty: to.y, t: 0, speed: 0.02 + Math.random() * 0.03 });
    }, 180);
  }

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const na = nodes[a], nb = nodes[b];
        if (Math.abs(na.layer - nb.layer) !== 1) continue;
        const d = Math.hypot(na.x - nb.x, na.y - nb.y);
        if (d > 180) continue;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.04 + 0.04 * (1 - d / 180)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    // Draw pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      const cx = p.x + (p.tx - p.x) * p.t;
      const cy = p.y + (p.ty - p.y) * p.t;
      const alpha = Math.sin(p.t * Math.PI);
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.9})`;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 7);
      g.addColorStop(0, `rgba(168,85,247,${alpha * 0.4})`);
      g.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Draw nodes
    for (const n of nodes) {
      n.pulsePhase += 0.025;
      const a = n.alpha * (0.6 + 0.4 * Math.sin(n.pulsePhase));
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.layer === 0 || n.layer === 4
        ? `rgba(34, 211, 238, ${a})`
        : `rgba(168, 85, 247, ${a})`;
      ctx.fill();
      // halo
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
      const gl = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.5);
      const col = n.layer === 0 || n.layer === 4 ? '34, 211, 238' : '168, 85, 247';
      gl.addColorStop(0, `rgba(${col}, ${a * 0.35})`);
      gl.addColorStop(1, `rgba(${col}, 0)`);
      ctx.fillStyle = gl;
      ctx.fill();
    }
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ---- GSAP HERO PARALLAX ----
gsap.to('.nebula-1', {
  yPercent: 25,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
});
gsap.to('.nebula-2', {
  yPercent: 15,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 }
});
gsap.to('.nebula-3', {
  yPercent: 10,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2.5 }
});
gsap.to('.hero-content', {
  yPercent: 20,
  opacity: 0.3,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: '80% top', scrub: 1 }
});

// Hide scroll hint on scroll
gsap.to('.scroll-hint', {
  opacity: 0,
  scrollTrigger: { trigger: '.hero', start: '20% top', end: '40% top', scrub: true }
});
