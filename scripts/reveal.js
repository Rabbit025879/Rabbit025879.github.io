/*************************
 * Scroll reveal + mouse-following glow
 * Shared across pages: fades in any [data-reveal]/.reveal element as it
 * enters the viewport, and moves each .glow-layer's radial gradient to
 * track the pointer (approximated in viewport percent, not per-element).
 *************************/
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const glowLayers = document.querySelectorAll('[data-glow]');
if (glowLayers.length) {
  window.addEventListener('mousemove', (e) => {
    const gx = `${(e.clientX / window.innerWidth) * 100}%`;
    const gy = `${(e.clientY / window.innerHeight) * 100}%`;
    glowLayers.forEach((el) => {
      el.style.setProperty('--gx', gx);
      el.style.setProperty('--gy', gy);
    });
  });
}
