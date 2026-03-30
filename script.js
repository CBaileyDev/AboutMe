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
// INTERSECTION OBSERVER — fade-in on scroll
// (Ready to hook up CSS animations later)
// ===========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card, .about-text, .about-tags, .contact-item').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===========================
// SMOOTH ACTIVE NAV HIGHLIGHT
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
