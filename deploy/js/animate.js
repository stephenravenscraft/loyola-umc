const targets = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  let delay = 0;
  for (const entry of entries) {
    const { isIntersecting, target } = entry;
    if (target.getAttribute('data-animate') !== 'true' && isIntersecting) {
      setTimeout(() => {
        target.setAttribute('data-animate', 'true');
      }, delay);
      delay += 150;
    }
  }
});

for (const target of targets) {
  observer.observe(target);
};
