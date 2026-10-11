/* world switcher: Origins (cells → organisms) and Herd (quantitative genetics) */
(function () {
  'use strict';
  let w = 'column';
  try { w = localStorage.getItem('genesis.world') || 'column'; } catch (e) {}
  const h = (location.hash || '').slice(1);
  if (['herd', 'origins', 'column', 'obs'].includes(h)) w = h;
  function set(world) {
    document.body.dataset.world = world;
    document.querySelectorAll('#worlds button').forEach(b => b.classList.toggle('on', b.dataset.world === world));
    try { localStorage.setItem('genesis.world', world); } catch (e) {}
    // canvases in the newly shown world need a fresh layout pass
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  set(w);
  document.getElementById('worlds').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-world]');
    if (b) set(b.dataset.world);
  });
})();
