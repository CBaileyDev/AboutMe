// ===========================
// CUSTOM CURSOR
// ===========================
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
  cursorDot.style.top  = `${e.clientY}px`;
  cursorDot.style.left = `${e.clientX}px`;
});

document.querySelectorAll('a, button, .btn-primary').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
    cursorDot.style.boxShadow = '0 0 28px rgba(22,163,74,1), 0 0 55px rgba(22,163,74,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorDot.style.boxShadow = '0 0 18px rgba(22,163,74,0.9), 0 0 35px rgba(22,163,74,0.4)';
  });
});

// ===========================
// NAVBAR — shrink on scroll
// ===========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.padding = '0.8rem 2.5rem';
    navbar.style.background = 'rgba(10, 10, 10, 0.97)';
  } else {
    navbar.style.padding = '1.2rem 2.5rem';
    navbar.style.background = 'rgba(10, 10, 10, 0.85)';
  }
});

// ===========================
// MULTI-LAYER PARALLAX
// ===========================
const layers = document.querySelectorAll('.hero-layer');

window.addEventListener('scroll', () => {
  const offset = window.scrollY;
  layers.forEach((layer, index) => {
    const speed = (index + 1) * 0.05;
    layer.style.transform = `translateY(${offset * speed}px)`;
  });
});

// ===========================
// FADE-IN ON SCROLL
// ===========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .about-text, .about-tags, .contact-item, .section-title').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===========================
// ACTIVE NAV HIGHLIGHT
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? 'var(--accent)'
      : '';
  });
});
