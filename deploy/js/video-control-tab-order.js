;(function() {
  'use strict';

  function setupVideoControlTabOrder() {
    const videoControl = document.querySelector('[data-early-focus="video-control"]');
    const logo = document.querySelector('.luc-header__logo');

    if (!videoControl || !logo) return;

    const isVisible = function(el) {
      if (!el) return false;
      let current = el;
      while (current) {
        const style = getComputedStyle(current);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        current = current.parentElement;
      }
      return true;
    };

    const getNextAfterLogo = function() {
      const navLink = document.querySelector('.luc-nav__link');
      const menuToggle = document.querySelector('.luc-mobile-nav__toggle');
      const desktopActionButton = document.querySelector('.luc-utility-nav .luc-button');
      const mobileActionButton = document.querySelector('.luc-mobile-nav .luc-button');
      if (isVisible(navLink)) return navLink;
      if (isVisible(menuToggle)) return menuToggle;
      if (isVisible(desktopActionButton)) return desktopActionButton;
      if (isVisible(mobileActionButton)) return mobileActionButton;
      return null;
    };

    videoControl.setAttribute('tabindex', '-1');

    logo.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        videoControl.focus();
      }
    });

    videoControl.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          logo.focus();
        } else {
          const next = getNextAfterLogo();
          if (next) next.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVideoControlTabOrder);
  } else {
    setupVideoControlTabOrder();
  }

  let resizeTimeout;
  window.addEventListener('orientationchange', function() {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(function() {
      document.body.style.display = 'none';
      void document.body.offsetHeight;
      document.body.style.display = '';
    }, 100);
  });
})();
