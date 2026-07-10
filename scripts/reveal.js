/*************************
 * Scroll reveal + mouse-following glow
 * Shared across pages: fades in any [data-reveal]/.reveal element as it
 * enters the viewport, and moves each .glow-layer's radial gradient to
 * track the pointer, positioned relative to each glow layer's own box
 * (not the viewport) so it stays under the cursor regardless of scroll
 * position or section size.
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
  let lastX = null;
  let lastY = null;
  let ticking = false;

  const updateGlow = () => {
    ticking = false;
    if (lastX === null) return;
    glowLayers.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      el.style.setProperty('--gx', `${((lastX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--gy', `${((lastY - rect.top) / rect.height) * 100}%`);
    });
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateGlow);
    }
  };

  window.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    requestUpdate();
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
}
