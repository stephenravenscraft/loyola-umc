/**
 * LUC Nav/Footer Bundle - JavaScript
 * Handles mega menu, mobile menu, and search interactions.
 * Self-contained, minimal dependencies.
 */

(function() {
  'use strict';

  // ==========================================================================
  // MEGA MENU (Desktop)
  // ==========================================================================

  const megaMenuToggles = document.querySelectorAll('.luc-nav__toggle');
  const megaMenus = document.querySelectorAll('.luc-mega-menu');

  /**
   * Close all mega menus
   */
  function closeAllMegaMenus() {
    megaMenuToggles.forEach(function(toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    });
    megaMenus.forEach(function(menu) {
      menu.classList.remove('is-open');
    });
  }

  /**
   * Toggle a specific mega menu
   */
  function toggleMegaMenu(toggle) {
    const menuId = toggle.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // Close all other menus first
    closeAllMegaMenus();

    // Toggle this menu
    if (!isExpanded && menu) {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
    }
  }

  // Add click handlers to mega menu toggles
  megaMenuToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMegaMenu(toggle);
    });

    // Keyboard support
    toggle.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllMegaMenus();
        toggle.focus();
      }
    });
  });

  // Close mega menus when clicking outside
  document.addEventListener('click', function(e) {
    const isInsideNav = e.target.closest('.luc-nav__item');
    if (!isInsideNav) {
      closeAllMegaMenus();
    }
  });

  // Close mega menus on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllMegaMenus();
    }
  });

  // ==========================================================================
  // MOBILE MENU
  // ==========================================================================

  const mobileToggle = document.querySelector('.luc-mobile-header__toggle');
  const mobileMenu = document.getElementById('luc-mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';

      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('is-open', !isExpanded);
      mobileMenu.setAttribute('aria-hidden', isExpanded);

      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
  }

  // ==========================================================================
  // MOBILE SUBMENU ACCORDION
  // ==========================================================================

  const mobileNavToggles = document.querySelectorAll('.luc-mobile-nav__toggle');

  mobileNavToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      const submenuId = toggle.getAttribute('aria-controls');
      const submenu = document.getElementById(submenuId);
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      // Close other submenus (accordion behavior)
      mobileNavToggles.forEach(function(otherToggle) {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
          const otherId = otherToggle.getAttribute('aria-controls');
          const otherSubmenu = document.getElementById(otherId);
          if (otherSubmenu) {
            otherSubmenu.classList.remove('is-open');
          }
        }
      });

      // Toggle this submenu
      toggle.setAttribute('aria-expanded', !isExpanded);
      if (submenu) {
        submenu.classList.toggle('is-open', !isExpanded);
      }
    });
  });

  // ==========================================================================
  // FOCUS TRAP (Mobile Menu)
  // ==========================================================================

  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }

  if (mobileMenu) {
    trapFocus(mobileMenu);
  }

  // ==========================================================================
  // CLOSE MOBILE MENU ON RESIZE TO DESKTOP
  // ==========================================================================

  const NAV_BREAKPOINT = 1024;

  function handleResize() {
    if (window.innerWidth >= NAV_BREAKPOINT && mobileMenu && mobileMenu.classList.contains('is-open')) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  window.addEventListener('resize', handleResize);

  // ==========================================================================
  // INLINE SEARCH BEHAVIOR (Optional enhancement)
  // ==========================================================================

  // The search is already inline per requirements - no modal/overlay.
  // This section can be extended if dynamic behavior is needed.

})();
