/*************************
 * Terminal easter egg entrance
 * Press ` (backtick), or just type "sudo" / "whoami" anywhere on the
 * page, to drop into the hidden terminal (terminal.html). The footer's
 * tiny ">_" link is the clickable way in.
 *************************/
const TRIGGER_WORDS = ['sudo', 'whoami'];
const TERMINAL_URL = 'terminal.html';

let buffer = '';

function isTypingField(el) {
  return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || isTypingField(e.target)) return;

  if (e.key === '`') {
    window.location.href = TERMINAL_URL;
    return;
  }

  if (e.key.length !== 1) return;
  buffer = (buffer + e.key.toLowerCase()).slice(-12);
  if (TRIGGER_WORDS.some((word) => buffer.endsWith(word))) {
    window.location.href = TERMINAL_URL;
  }
});
