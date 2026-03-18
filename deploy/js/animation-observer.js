;(function() {
  'use strict';

  const targets = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(function(entries) {
    let delay = 0;
    for (const entry of entries) {
      const isIntersecting = entry.isIntersecting;
      const target = entry.target;
      if (target.getAttribute('data-animate') !== 'true' && isIntersecting) {
        setTimeout(function() {
          target.setAttribute('data-animate', 'true');
        }, delay);
        delay += 300;
      }
    }
  });

  for (const target of targets) {
    observer.observe(target);
  }
})();
