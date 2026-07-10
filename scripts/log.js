/*************************
 * Experiments log: category filter + accordion entries
 *************************/
const filterButtons = document.querySelectorAll('#log-filters .filter-btn');
const entries = document.querySelectorAll('#log-list .log-entry');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    entries.forEach((entry) => {
      entry.hidden = filter !== 'All' && entry.dataset.category !== filter;
    });
  });
});

entries.forEach((entry) => {
  const head = entry.querySelector('.log-entry-head');
  head.addEventListener('click', () => entry.classList.toggle('open'));
});
