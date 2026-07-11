// Creative "I'm not a robot" checkpoint gating the Off Duty section — a
// robotics engineer building an anti-bot check is the joke, so the copy
// leans into it. Lives inline in the section (no modal); once "verified"
// it redirects straight to the standalone life.html page.
const NOTES = [
  "Please confirm you are a carbon-based lifeform before proceeding.",
  "Note: robots are asked to use the service entrance.",
  "This checkpoint is verified 100% human-built. The robots are downstairs.",
  "Suspiciously well-calibrated for someone who builds robots for a living.",
];

const checkbox = document.getElementById('checkpoint-checkbox');
const note = document.getElementById('checkpoint-note');
const status = document.getElementById('checkpoint-status');

if (checkbox && note && status) {
  let verified = false;
  note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];

  function verify() {
    if (verified || checkbox.classList.contains('is-checking')) return;
    checkbox.classList.add('is-checking');
    status.textContent = '● Scanning';
    note.textContent = 'Verifying…';

    setTimeout(() => {
      verified = true;
      checkbox.classList.remove('is-checking');
      checkbox.classList.add('is-checked');
      checkbox.setAttribute('aria-checked', 'true');
      status.textContent = '● Access Granted';
      note.textContent = 'Confirmed: human. Redirecting…';

      setTimeout(() => {
        window.location.href = 'life.html';
      }, 900);
    }, 900);
  }

  checkbox.addEventListener('click', verify);
  checkbox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      verify();
    }
  });
}
