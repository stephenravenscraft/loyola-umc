const stickyTargets = document.querySelectorAll('[data-sticky]');
const stickyTargetScroll = document.querySelectorAll('[data-stuck]');

stickyTargets.forEach((target) => {
  // Add a scroll event listener to the window
  window.addEventListener('scroll', function() {
    // Get the current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    // Check if the scroll position is greater than or equal to 100 pixels
    if (scrollPosition >= 400) {
      // Add the data-sticky attribute to the target div
      target.setAttribute('data-sticky', 'true');
    } else {
      // If the scroll position is less than 100 pixels, remove the data-sticky attribute
      target.removeAttribute('data-sticky');
    }
  });
});

stickyTargetScroll.forEach((target) => {
  // Add a scroll event listener to the window
  window.addEventListener('scroll', function() {
    // Get the current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    // Check if the scroll position is greater than or equal to 100 pixels
    if (scrollPosition >= 650) {
      // Add the data-sticky attribute to the target div
      target.setAttribute('data-stuck', 'true');
    } else {
      // If the scroll position is less than 100 pixels, remove the data-sticky attribute
      target.removeAttribute('data-stuck');
    }
  });
});

const root = document.documentElement;
let last = 0;

const updatee = () => {
  const position = root.getBoundingClientRect().top;
  if (Math.abs(last - position) > 48) {
    if (position > last) {
      root.setAttribute('data-scroll', 'up');
    } else {
      root.setAttribute('data-scroll', 'down');
    }
    last = position;
  }
}

window.addEventListener('load', updatee);
window.addEventListener('scroll', updatee);

  // search toggle
  const searchToggles = document.querySelectorAll('.Header__search-toggle');

  for (const searchToggle of searchToggles) {
    const input = searchToggle.nextElementSibling?.querySelector('.Header__input');

    searchToggle.addEventListener('click', () => {
      if (searchToggle.getAttribute('aria-expanded') === 'true') {
        setTimeout(() => {
          input?.focus();
        }, 400);
      }
    });
  }