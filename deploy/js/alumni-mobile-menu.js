  // header
  const headers = document.querySelectorAll('.Header');

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const { intersectionRatio, target } = entry;
      target.toggleAttribute('data-stuck', intersectionRatio < 1);
    }
  }, {
    rootMargin: '156px 0px 0px 0px',
    threshold: [1],
  });

  for (const header of headers) {
    observer.observe(header);
  };

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