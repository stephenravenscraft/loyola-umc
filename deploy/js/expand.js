// import focusLock from 'dom-focus-lock';

const targets = document.querySelectorAll('[data-expand]');

targets.forEach((target) => {
  const type = target.getAttribute('data-expand');
  const expanded = () => target.getAttribute('aria-expanded') === 'true';

  if (!target.hasAttribute('aria-expanded')) {
    target.setAttribute('aria-expanded', false);
  }

  if (!type) {
    target.addEventListener('click', () => {
      target.setAttribute('aria-expanded', !expanded());
    });
  }

  if (type === 'group') {
    const root = target.closest('[data-expand-group]');
    const items = root.querySelectorAll('[data-expand="group"]');
    const group = [...items].filter((item) => item.closest('[data-expand-group]') === root);
    target.addEventListener('click', () => {
      group.forEach((item) => {
        item.setAttribute('aria-expanded', item === target);
      });
    });
  }

  if (type === 'popup') {
    const body = target.getAttribute('data-expand-body');
    const lock = target.hasAttribute('data-expand-lock');
    const next = target.nextElementSibling;
    target.addEventListener('click', () => {
      target.setAttribute('aria-expanded', !expanded());
      if (body) {
        if (expanded()) {
          document.body.classList.add(body);
        } else {
          document.body.classList.remove(body);
        }
      }
      if (lock) {
        if (expanded()) {
          focusLock.on(next.parentNode);
        } else {
          focusLock.off(next.parentNode);
        }
      }
    });
    document.addEventListener('click', (e) => {
      if (expanded() && !target.contains(e.target) && !next.contains(e.target)) {
        target.setAttribute('aria-expanded', false);
        if (body) {
          document.body.classList.remove(body);
        }
        if (lock) {
          focusLock.off(next.parentNode);
        }
      }
    });
    document.addEventListener('keydown', (e) => {
      if (expanded() && e.key === 'Escape') {
        target.setAttribute('aria-expanded', false);
        if (body) {
          document.body.classList.remove(body);
        }
        if (lock) {
          focusLock.off(next.parentNode);
        }
      }
    });
  }
});
