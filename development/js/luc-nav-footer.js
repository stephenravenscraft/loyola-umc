/**
 * LUC Nav/Footer Bundle - JavaScript
 * Handles mega menu, mobile menu, mobile search, and accordion interactions.
 * Self-contained, minimal dependencies.
 */

(function() {
  'use strict';

  // ==========================================================================
  // MEGA MENU (Desktop)
  // ==========================================================================

  const megaMenuToggles = document.querySelectorAll('.luc-nav__toggle, .luc-subbrand-nav__toggle');
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
    const isInsideNav = e.target.closest('.luc-nav__item') || e.target.closest('.luc-subbrand-nav__item');
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

  const mobileToggles = document.querySelectorAll('.luc-mobile-header__toggle');
  const mobileMenu = document.getElementById('luc-mobile-menu');
  const mobileSearchPanel = document.getElementById('luc-mobile-search');

  function closeMobileMenu() {
    mobileToggles.forEach(function(toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    });
    if (mobileMenu) {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    mobileToggles.forEach(function(toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    });
    if (mobileMenu) {
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
    // Close search if open
    closeMobileSearch();
    document.body.style.overflow = 'hidden';
  }

  mobileToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  });

  // ==========================================================================
  // MOBILE SEARCH PANEL
  // ==========================================================================

  const mobileSearchBtn = document.querySelector('.luc-mobile-header__search-btn');
  const mobileSearchClose = document.querySelector('.luc-mobile-search__close');

  function closeMobileSearch() {
    if (mobileSearchPanel) {
      mobileSearchPanel.classList.remove('is-open');
      mobileSearchPanel.setAttribute('aria-hidden', 'true');
    }
    if (mobileSearchBtn) {
      mobileSearchBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  function openMobileSearch() {
    // Close menu if open
    closeMobileMenu();

    if (mobileSearchPanel) {
      mobileSearchPanel.classList.add('is-open');
      mobileSearchPanel.setAttribute('aria-hidden', 'false');
      // Focus the search input
      const searchInput = mobileSearchPanel.querySelector('.luc-mobile-search__input');
      if (searchInput) {
        setTimeout(function() {
          searchInput.focus();
        }, 100);
      }
    }
    if (mobileSearchBtn) {
      mobileSearchBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', function() {
      const isExpanded = mobileSearchBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileSearch();
      } else {
        openMobileSearch();
      }
    });
  }

  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', function() {
      closeMobileSearch();
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

  if (mobileSearchPanel) {
    trapFocus(mobileSearchPanel);
  }

  // ==========================================================================
  // CLOSE MOBILE PANELS ON ESCAPE
  // ==========================================================================

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
        if (mobileToggles[0]) mobileToggles[0].focus();
      }
      if (mobileSearchPanel && mobileSearchPanel.classList.contains('is-open')) {
        closeMobileSearch();
        if (mobileSearchBtn) mobileSearchBtn.focus();
      }
    }
  });

  // ==========================================================================
  // CLOSE MOBILE PANELS ON RESIZE TO DESKTOP
  // ==========================================================================

  const NAV_BREAKPOINT = 1024;

  function handleResize() {
    if (window.innerWidth >= NAV_BREAKPOINT) {
      if (mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
      if (mobileSearchPanel && mobileSearchPanel.classList.contains('is-open')) {
        closeMobileSearch();
      }
    }
  }

  window.addEventListener('resize', handleResize);

})();
