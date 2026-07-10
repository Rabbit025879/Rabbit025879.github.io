// "I'm not a robot" gate in front of life.html — a robotics engineer building
// an anti-bot check is the joke, so the copy leans into it.
const NOTES = [
  "Please confirm you are a carbon-based lifeform before proceeding.",
  "Note: robots are asked to use the service entrance.",
  "This checkpoint is verified 100% human-built. The robots are downstairs.",
  "Suspiciously well-calibrated for someone who builds robots for a living.",
];

const link = document.getElementById('off-duty-link');
const overlay = document.getElementById('gate-overlay');
const checkbox = document.getElementById('recaptcha-checkbox');
const note = document.getElementById('gate-note');
const continueBtn = document.getElementById('gate-continue');
const closeBtn = document.getElementById('gate-close');

if (link && overlay && checkbox && note && continueBtn && closeBtn) {
  let verified = false;
  let redirectTimer = null;

  function resetGate() {
    verified = false;
    checkbox.classList.remove('is-checking', 'is-checked');
    checkbox.setAttribute('aria-checked', 'false');
    continueBtn.classList.remove('is-ready');
    continueBtn.setAttribute('aria-disabled', 'true');
    continueBtn.tabIndex = -1;
    note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }
  }

  function openGate() {
    resetGate();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gate-locked');
    checkbox.focus();
  }

  function closeGate() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gate-locked');
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }
    link.focus();
  }

  function verify() {
    if (verified || checkbox.classList.contains('is-checking')) return;
    checkbox.classList.add('is-checking');
    note.textContent = 'Verifying…';

    setTimeout(() => {
      verified = true;
      checkbox.classList.remove('is-checking');
      checkbox.classList.add('is-checked');
      checkbox.setAttribute('aria-checked', 'true');
      continueBtn.classList.add('is-ready');
      continueBtn.removeAttribute('aria-disabled');
      continueBtn.tabIndex = 0;
      note.textContent = 'Access granted. Redirecting…';

      redirectTimer = setTimeout(() => {
        window.location.href = continueBtn.href;
      }, 1000);
    }, 900);
  }

  link.addEventListener('click', (e) => {
    e.preventDefault();
    openGate();
  });

  checkbox.addEventListener('click', verify);
  checkbox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      verify();
    }
  });

  continueBtn.addEventListener('click', (e) => {
    if (!verified) e.preventDefault();
  });

  closeBtn.addEventListener('click', closeGate);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGate();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeGate();
  });
}
