/*************************
 * Off Duty page theme (Claymorphism / Neobrutalism)
 * Loaded as a classic, render-blocking script in <head> so the theme
 * is applied before first paint (no flash of the wrong style).
 *
 * Pick a theme with ?theme=clay or ?theme=neo; the choice is remembered
 * in localStorage. Any [data-theme-set] buttons on the page switch it live.
 *************************/
(function () {
  var THEMES = ['clay', 'neo'];
  var DEFAULT_THEME = 'clay';
  var STORAGE_KEY = 'offduty-theme';
  var root = document.documentElement;

  function isTheme(value) {
    return THEMES.indexOf(value) !== -1;
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function store(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage blocked */ }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var buttons = document.querySelectorAll('[data-theme-set]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-theme-set') === theme));
    }
  }

  var param = new URLSearchParams(window.location.search).get('theme');
  var stored = readStored();
  var initial = isTheme(param) ? param : (isTheme(stored) ? stored : DEFAULT_THEME);
  if (isTheme(param)) store(param);
  apply(initial);

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-theme'));

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-theme-set]');
      if (!btn) return;
      var theme = btn.getAttribute('data-theme-set');
      if (!isTheme(theme)) return;
      apply(theme);
      store(theme);
      var url = new URL(window.location.href);
      url.searchParams.set('theme', theme);
      window.history.replaceState(null, '', url);
    });
  });
})();
