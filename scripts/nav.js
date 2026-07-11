document.querySelectorAll('.nav-toggle').forEach((toggle) => {
  const links = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!links) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    links.classList.toggle('is-open', !isOpen);
  });

  links.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  document.addEventListener('click', (event) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !toggle.contains(event.target) && !links.contains(event.target)) {
      close();
    }
  });
});
