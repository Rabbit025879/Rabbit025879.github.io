/*************************
 * Light / dark colour scheme (index, projects, life)
 * Loaded as a classic, render-blocking script in <head> so the scheme
 * is applied before first paint (no flash of the wrong colours).
 *
 * Follows the OS setting (prefers-color-scheme) until the visitor picks
 * one with a [data-scheme-toggle] button; that choice is remembered in
 * localStorage. Sets data-scheme="light|dark" on <html>.
 *
 * A page with its own palette can give its theme-color meta
 * data-light / data-dark values to use instead of the defaults.
 *************************/
(function () {
  var STORAGE_KEY = 'color-scheme';
  var THEME_COLORS = { light: '#e4e8ef', dark: '#23262e' };
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function readStored() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (e) { return null; }
  }

  function store(scheme) {
    try { localStorage.setItem(STORAGE_KEY, scheme); } catch (e) { /* storage blocked */ }
  }

  function systemScheme() {
    return media && media.matches ? 'dark' : 'light';
  }

  function apply(scheme) {
    root.setAttribute('data-scheme', scheme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', meta.getAttribute('data-' + scheme) || THEME_COLORS[scheme]);
    var buttons = document.querySelectorAll('[data-scheme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(scheme === 'dark'));
      buttons[i].setAttribute('aria-label', scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  apply(readStored() || systemScheme());

  if (media) {
    var onSystemChange = function () { if (!readStored()) apply(systemScheme()); };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-scheme'));
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-scheme-toggle]');
      if (!btn) return;
      var next = root.getAttribute('data-scheme') === 'dark' ? 'light' : 'dark';
      apply(next);
      store(next);
    });
  });
})();
