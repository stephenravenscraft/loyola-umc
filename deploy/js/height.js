const heightTargets = document.querySelectorAll('[data-height]');

const update = () => {
  for (const target of heightTargets) {
    const height = target.nextElementSibling.getBoundingClientRect().height;
    target.style.setProperty('--height', `${height}px`);
  };
};

window.addEventListener('load', update);
window.addEventListener('resize', update);
