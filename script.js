/* ==========================================================
   CARTER BAILEY — ABOUT ME
   Scroll-driven space engine + constellation of repos
   ========================================================== */

/* ==========================================================
   SPACE ENGINE — scroll-driven camera + canvas starfield
   ========================================================== */
(function () {
  'use strict';

  // ---- Fixed tuning (no exposed tweak panel) ----
  const SCROLL_SMOOTHNESS = 0.08;
  const STAR_DENSITY = 1.0;

  // ---- Smooth scroll (custom lerped value) ----
  let targetScroll = 0;
  let smoothScroll = 0;
  let maxScroll = 1;

  function updateMaxScroll() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  window.addEventListener('scroll', () => { targetScroll = window.scrollY; }, { passive: true });
  window.addEventListener('resize', updateMaxScroll);

  // ---- Canvas ----
  const canvas = document.getElementById('space-canvas');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    updateMaxScroll();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- Stars (multiple layers at different depths) ----
  const BASE_COUNT = 520;
  let stars = [];
  function makeStars() {
    const count = Math.round(BASE_COUNT * STAR_DENSITY);
    stars = [];
    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random() * 2 - 0.5,
        y: Math.random() * 2 - 0.5,
        z: 0.35 + depth * 0.65,
        size: 0.9 + depth * 2.0,
        flicker: 0.55 + Math.random() * 0.45,
        flickerSpeed: 0.5 + Math.random() * 2,
        hue: 210 + Math.random() * 40,
        sparkle: Math.random() < 0.08
      });
    }
  }
  makeStars();

  // ---- Distant asteroid/debris drifting past during solar system phase ----
  const debris = [];
  for (let i = 0; i < 14; i++) {
    debris.push({
      x: Math.random(),
      y: Math.random(),
      z: 0.5 + Math.random() * 0.5,
      r: 3 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      shape: Math.random() < 0.5 ? 'poly' : 'dot'
    });
  }

  // ---- Phase curve helpers ----
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  function rangeProgress(p, a, b) {
    return clamp((p - a) / (b - a), 0, 1);
  }

  // ---- Stage DOM elements ----
  const earthLimb = document.querySelector('.earth-limb');
  const earthAtmo = document.querySelector('.earth-atmosphere');
  const nebulaViolet = document.querySelector('.nebula-violet');
  const nebulaCyan = document.querySelector('.nebula-cyan');
  const sunFlare = document.querySelector('.sun-flare');

  // ---- Warp streak layer ----
  const warpStreaks = [];
  for (let i = 0; i < 140; i++) {
    warpStreaks.push({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random(),
      speed: 0.5 + Math.random() * 2
    });
  }

  // ---- Animation loop ----
  let t = 0;
  function render() {
    smoothScroll = lerp(smoothScroll, targetScroll, SCROLL_SMOOTHNESS);
    const progress = clamp(smoothScroll / maxScroll, 0, 1);

    t += 0.016;

    const pAscent = rangeProgress(progress, 0.12, 0.30);
    const pSolar = rangeProgress(progress, 0.30, 0.48);
    const pWarp = rangeProgress(progress, 0.48, 0.62);
    const pDeep = rangeProgress(progress, 0.62, 1.0);

    // Warp intensity: 0 -> 1 -> 0 arc across the warp range, fully 0 outside.
    // This prevents streaks from persisting through deep space/contact.
    let warpBump = 0;
    if (progress > 0.48 && progress < 0.62) {
      const wt = (progress - 0.48) / (0.62 - 0.48);
      warpBump = Math.sin(wt * Math.PI);
    }

    // === EARTH LIMB ===
    const earthY = lerp(0, -120, smooth(pAscent + pSolar * 0.5));
    const earthScale = lerp(1, 0.35, smooth(pAscent + pSolar * 0.3));
    const earthOpacity = clamp(1 - pSolar * 1.2, 0, 1);
    earthLimb.style.transform = `translate(-50%, ${earthY}vh) scale(${earthScale})`;
    earthLimb.style.opacity = earthOpacity;
    earthAtmo.style.transform = `translate(-50%, ${earthY}vh) scale(${earthScale})`;
    earthAtmo.style.opacity = earthOpacity;

    // === SUN FLARE (solar system phase) ===
    const sunProgress = smooth(pSolar);
    const sunOp = sunProgress * (1 - pWarp * 0.9);
    const sunScale = 0.4 + sunProgress * 1.2;
    const sunX = lerp(30, 70, sunProgress);
    const sunY = lerp(25, 45, sunProgress);
    sunFlare.style.opacity = sunOp;
    sunFlare.style.left = sunX + '%';
    sunFlare.style.top = sunY + '%';
    sunFlare.style.transform = `translate(-50%, -50%) scale(${sunScale})`;

    // === NEBULA (deep space) ===
    nebulaViolet.style.opacity = pDeep * 0.85;
    nebulaCyan.style.opacity = pDeep * 0.7;
    nebulaViolet.style.transform = `translate(${Math.sin(t * 0.1) * 3}%, ${Math.cos(t * 0.08) * 2}%)`;
    nebulaCyan.style.transform = `translate(${Math.cos(t * 0.12) * 3}%, ${Math.sin(t * 0.1) * 2}%)`;

    // === CLEAR CANVAS ===
    ctx.clearRect(0, 0, W, H);

    // === STARS ===
    const baseScroll = progress * 3;
    const warpBoost = 1 + warpBump * 11;
    // Stars accelerate through ascent/solar/warp, then calm in deep space.
    const starSpeedMultiplier = 1 + pAscent * 0.8 + pSolar * 1.2 + warpBump * 2 - pDeep * 1.4;

    for (const s of stars) {
      const yShift = (baseScroll * s.z * starSpeedMultiplier) % 2;
      const sx = s.x * W;
      const sy = ((s.y - yShift + 2) % 2 - 0.5) * H;
      if (sy < -20 || sy > H + 20) continue;

      const a = s.flicker * (0.6 + 0.4 * Math.sin(t * s.flickerSpeed + s.x * 10));
      const finalAlpha = a * (0.6 + s.z * 0.4);

      if (warpBump > 0.05) {
        const streakLen = warpBump * 60 * s.z * warpBoost;
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + streakLen);
        grad.addColorStop(0, `rgba(220,230,255,${finalAlpha})`);
        grad.addColorStop(1, `rgba(220,230,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + streakLen);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(220,230,255,${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();

        if (s.sparkle && s.z > 0.75) {
          ctx.strokeStyle = `rgba(220,230,255,${finalAlpha * 0.5})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(sx - s.size * 3, sy);
          ctx.lineTo(sx + s.size * 3, sy);
          ctx.moveTo(sx, sy - s.size * 3);
          ctx.lineTo(sx, sy + s.size * 3);
          ctx.stroke();
        }
      }
    }

    // === WARP STREAKS (center radial burst) ===
    if (warpBump > 0.02) {
      const cx = W / 2, cy = H / 2;
      const intensity = warpBump;
      for (const w of warpStreaks) {
        w.dist += 0.02 * w.speed * warpBoost * 0.15;
        if (w.dist > 1.4) w.dist = 0;
        const maxR = Math.max(W, H) * 0.8;
        const r1 = w.dist * maxR;
        const r2 = r1 + 80 * intensity * w.speed;
        const x1 = cx + Math.cos(w.angle) * r1;
        const y1 = cy + Math.sin(w.angle) * r1;
        const x2 = cx + Math.cos(w.angle) * r2;
        const y2 = cy + Math.sin(w.angle) * r2;
        const alpha = clamp(w.dist, 0, 1) * intensity * 0.55;
        ctx.strokeStyle = `rgba(200,220,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // === DEBRIS in solar system ===
    if (pSolar > 0.15 && pSolar < 0.98 && warpBump < 0.1) {
      for (const d of debris) {
        d.rot += d.rotSpeed;
        const yShift = (baseScroll * d.z * 1.5) % 1.5;
        const dx = d.x * W;
        const dy = ((d.y - yShift + 1.5) % 1.5 - 0.25) * H;
        if (dy < -40 || dy > H + 40) continue;
        const opac = (pSolar < 0.5 ? pSolar * 2 : (1 - pSolar) * 2) * 0.45;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(d.rot);
        ctx.fillStyle = `rgba(140,150,180,${opac})`;
        if (d.shape === 'dot') {
          ctx.beginPath();
          ctx.arc(0, 0, d.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const r = d.r * (0.7 + 0.3 * Math.sin(i * 1.7));
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // === MOON (during ascent/early solar) ===
    if (pAscent > 0.3 && pSolar < 0.8) {
      const moonOp = clamp(pAscent * 2 - 0.4, 0, 1) * (1 - pSolar * 0.8);
      const moonY = lerp(H * 0.4, H * 1.3, pAscent + pSolar * 0.5);
      const moonX = W * 0.78;
      const moonR = lerp(38, 22, pAscent + pSolar * 0.3);
      const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, 0, moonX, moonY, moonR);
      moonGrad.addColorStop(0, `rgba(240,240,245,${moonOp})`);
      moonGrad.addColorStop(0.7, `rgba(180,185,200,${moonOp * 0.9})`);
      moonGrad.addColorStop(1, `rgba(80,85,110,${moonOp * 0.6})`);
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(0,0,0,${moonOp * 0.35})`;
      ctx.beginPath();
      ctx.arc(moonX + moonR * 0.35, moonY + moonR * 0.15, moonR * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // ---- Subtle mouse parallax on the stage ----
  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    const stage = document.querySelector('.space-stage');
    if (stage) {
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
    }
  });
})();


/* ==========================================================
   CONSTELLATION & UI wiring
   ========================================================== */
(function () {
  'use strict';

  const REPOS = [
    {
      name: 'Aegis',
      desc: 'AI Orchestrator',
      lang: 'Python',
      langColor: '#3572A5',
      status: 'Active',
      url: 'https://github.com/CBaileyDev/Aegis',
      details: 'Multi-agent AI orchestration system — routing, scheduling, and coordinating local LLMs to work as a collaborative swarm. Built for real production use, not demos.',
      x: 0.18, y: 0.35,
      magnitude: 1.2
    },
    {
      name: 'ABUSER',
      desc: 'Discord automation framework',
      lang: 'Python',
      langColor: '#3572A5',
      status: 'Private',
      url: 'https://github.com/CBaileyDev/ABUSER',
      details: 'Full-featured Discord selfbot framework with a PyQt6 desktop GUI. 12 theme presets, token-bucket rate limiting, async-first architecture. Educational.',
      x: 0.38, y: 0.18,
      magnitude: 1.4
    },
    {
      name: 'CodeParser',
      desc: 'Codebase → AI-ready XML',
      lang: 'Python',
      langColor: '#3572A5',
      status: 'Active',
      url: 'https://github.com/CBaileyDev/CodeParser',
      details: 'Analyzes a codebase and exports a tuned XML payload — optimized structure, context windows, and signal-to-noise — to feed full context into LLMs.',
      x: 0.55, y: 0.55,
      magnitude: 1.0
    },
    {
      name: 'AiMemory',
      desc: 'Persistent memory for LLMs',
      lang: 'Python',
      langColor: '#3572A5',
      status: 'Active',
      url: 'https://github.com/CBaileyDev/AiMemory',
      details: 'Persistent memory layer for local and API-based LLMs. Long-term recall, session continuity, and retrievable context across conversations.',
      x: 0.72, y: 0.28,
      magnitude: 1.1
    },
    {
      name: 'PibbleNibble',
      desc: 'PibbleNibbleBeatDown',
      lang: 'JavaScript',
      langColor: '#f7df1e',
      status: 'Experiment',
      url: 'https://github.com/CBaileyDev/PibbleNibble',
      details: 'A playful experiment — building something because it was fun. Not every project has to be serious.',
      x: 0.86, y: 0.70,
      magnitude: 0.9
    },
    {
      name: 'AboutMe',
      desc: 'This site',
      lang: 'HTML',
      langColor: '#e34c26',
      status: 'Live',
      url: 'https://github.com/CBaileyDev/AboutMe',
      details: 'The site you\'re looking at. Built from scratch, no frameworks — pure HTML, CSS, and JavaScript.',
      x: 0.30, y: 0.78,
      magnitude: 0.8
    }
  ];

  const container = document.getElementById('constellation');
  const svg = document.getElementById('constellation-svg');
  const listEl = document.getElementById('repo-list');

  const detail = document.getElementById('repo-detail');
  const scrim = document.getElementById('repo-scrim');
  const dTitle = detail?.querySelector('.d-title');
  const dDesc = detail?.querySelector('.d-desc');
  const dMeta = detail?.querySelector('.d-meta');
  const dCta = detail?.querySelector('.d-cta');

  function openDetail(idx) {
    const r = REPOS[idx];
    if (!detail) return;
    dTitle.textContent = r.name;
    dDesc.textContent = r.details;
    dMeta.innerHTML = `
      <div class="m"><span class="k">Primary</span><span class="v">${r.lang}</span></div>
      <div class="m"><span class="k">Status</span><span class="v">${r.status}</span></div>
      <div class="m"><span class="k">Tag</span><span class="v">${r.desc}</span></div>
    `;
    dCta.href = r.url;
    detail.classList.add('open');
    scrim.classList.add('open');
  }

  function closeDetail() {
    detail?.classList.remove('open');
    scrim?.classList.remove('open');
  }

  function buildRepoList() {
    if (!listEl) return;
    listEl.innerHTML = REPOS.map((r, i) => `
      <div class="repo-row" data-idx="${i}">
        <div class="star"></div>
        <div class="info">
          <div class="rn">${r.name}</div>
          <div class="rd">${r.desc}</div>
        </div>
        <div class="rt">${r.status}</div>
      </div>
    `).join('');
    listEl.querySelectorAll('.repo-row').forEach(row => {
      row.addEventListener('click', () => openDetail(+row.dataset.idx));
    });
  }
  buildRepoList();

  function buildConstellation() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    container.querySelectorAll('.repo-star').forEach(el => el.remove());
    svg.innerHTML = '';

    REPOS.forEach((repo, i) => {
      const px = repo.x * W;
      const py = repo.y * H;
      const el = document.createElement('div');
      el.className = 'repo-star';
      if (repo.x > 0.55) el.classList.add('flip-left');
      el.style.left = px + 'px';
      el.style.top = py + 'px';
      el.dataset.idx = i;
      el.innerHTML = `
        <div class="node" style="transform: scale(${repo.magnitude})"></div>
        <div class="repo-label">
          <div class="name">${repo.name}</div>
          <div class="desc">${repo.desc}</div>
        </div>
      `;
      container.appendChild(el);
    });

    const stars = REPOS.map((r, i) => ({ i, x: r.x * W, y: r.y * H }));
    const drawn = new Set();
    stars.forEach(a => {
      const distances = stars
        .filter(b => b.i !== a.i)
        .map(b => ({ b, d: Math.hypot(b.x - a.x, b.y - a.y) }))
        .sort((x, y) => x.d - y.d);
      distances.slice(0, 2).forEach(({ b }) => {
        const key = [a.i, b.i].sort().join('-');
        if (drawn.has(key)) return;
        drawn.add(key);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.y);
        line.setAttribute('class', 'link');
        line.dataset.a = a.i;
        line.dataset.b = b.i;
        svg.appendChild(line);
      });
    });

    setTimeout(() => container.classList.add('ready'), 120);
  }

  // ---- Hover: highlight related, draw new connections ----
  container?.addEventListener('mouseover', (e) => {
    const star = e.target.closest('.repo-star');
    if (!star) return;
    const idx = +star.dataset.idx;
    container.querySelectorAll('.repo-star').forEach(s => {
      if (+s.dataset.idx !== idx) s.classList.add('dim');
    });
    const thisStar = REPOS[idx];
    const rect = container.getBoundingClientRect();
    const px = thisStar.x * rect.width;
    const py = thisStar.y * rect.height;

    REPOS.forEach((r, i) => {
      if (i === idx) return;
      const otherPx = r.x * rect.width;
      const otherPy = r.y * rect.height;
      const key = [idx, i].sort();
      let line = svg.querySelector(`line[data-a="${key[0]}"][data-b="${key[1]}"]`);
      if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', px);
        line.setAttribute('y1', py);
        line.setAttribute('x2', otherPx);
        line.setAttribute('y2', otherPy);
        line.setAttribute('class', 'link highlight temp');
        svg.appendChild(line);
      } else {
        line.classList.add('highlight');
      }
    });
  });

  container?.addEventListener('mouseout', (e) => {
    const star = e.target.closest('.repo-star');
    if (!star) return;
    container.querySelectorAll('.repo-star').forEach(s => s.classList.remove('dim'));
    svg.querySelectorAll('.link.highlight').forEach(l => {
      if (l.classList.contains('temp')) l.remove();
      else l.classList.remove('highlight');
    });
  });

  // ---- Click: open detail panel ----
  container?.addEventListener('click', (e) => {
    const star = e.target.closest('.repo-star');
    if (!star) return;
    openDetail(+star.dataset.idx);
  });

  scrim?.addEventListener('click', closeDetail);
  detail?.querySelector('.close')?.addEventListener('click', closeDetail);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

  // ---- Rebuild on resize ----
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildConstellation, 150);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        buildConstellation();
        io.disconnect();
      }
    });
  }, { rootMargin: '200px' });
  if (container) io.observe(container);
  setTimeout(() => { if (container && !container.classList.contains('ready')) buildConstellation(); }, 1000);
})();
