/**
 * LUC Nav/Footer Bundle - JavaScript
 * Minimal JS - only toggles aria-expanded attributes.
 * CSS handles all visibility via :has() and [aria-expanded] selectors.
 * Pattern based on Header.astro approach.
 */

(function() {
  'use strict';

  const NAV_BREAKPOINT = 1024;

  // ==========================================================================
  // ELEMENT REFERENCES
  // ==========================================================================

  const menuToggle = document.querySelector('.luc-nav__menu-toggle');
  const searchToggle = document.querySelector('.luc-nav__search-toggle');
  const searchPanel = document.getElementById('luc-search-panel');
  const navToggles = document.querySelectorAll('.luc-nav__toggle, .luc-subbrand-nav__toggle');

  // ==========================================================================
  // MENU TOGGLE (Mobile hamburger)
  // ==========================================================================

  function closeMenu() {
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
    closeAllNavMenus();
  }

  function openMenu() {
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    closeSearch();
    document.body.style.overflow = 'hidden';
  }

  function isMenuOpen() {
    return menuToggle?.getAttribute('aria-expanded') === 'true';
  }

  menuToggle?.addEventListener('click', function() {
    isMenuOpen() ? closeMenu() : openMenu();
  });

  // ==========================================================================
  // SEARCH PANEL
  // ==========================================================================

  function closeSearch() {
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'false');
    }
    if (searchPanel) {
      searchPanel.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function openSearch() {
    closeMenu();
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'true');
    }
    if (searchPanel) {
      searchPanel.setAttribute('aria-hidden', 'false');
      // Focus the search input
      const searchInput = searchPanel.querySelector('.luc-search__input');
      searchInput?.focus();
    }
    document.body.style.overflow = 'hidden';
  }

  function isSearchOpen() {
    return searchToggle?.getAttribute('aria-expanded') === 'true';
  }

  searchToggle?.addEventListener('click', function() {
    isSearchOpen() ? closeSearch() : openSearch();
  });

  // ==========================================================================
  // NAV ITEM TOGGLES (Accordion on mobile, dropdown on desktop)
  // CSS handles visibility via [aria-expanded="true"] + .luc-mega-menu
  // ==========================================================================

  // Helper to manage tabindex on mega-menu links (accessibility)
  function setMegaMenuTabIndex(megaMenu, tabindex) {
    if (!megaMenu) return;
    const links = megaMenu.querySelectorAll('a, button');
    links.forEach(function(link) {
      link.setAttribute('tabindex', tabindex);
    });
  }

  // Initialize all mega-menus to have tabindex -1 (not tabbable when collapsed)
  document.querySelectorAll('.luc-mega-menu').forEach(function(megaMenu) {
    setMegaMenuTabIndex(megaMenu, '-1');
  });

  function closeAllNavMenus() {
    navToggles.forEach(function(toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      // Reset tabindex on associated mega-menu
      const controlsId = toggle.getAttribute('aria-controls');
      if (controlsId) {
        const megaMenu = document.getElementById(controlsId);
        setMegaMenuTabIndex(megaMenu, '-1');
      }
    });
  }

  navToggles.forEach(function(toggle) {
    const navItem = toggle.closest('.luc-nav__item, .luc-subbrand-nav__item');
    const controlsId = toggle.getAttribute('aria-controls');
    const megaMenu = controlsId ? document.getElementById(controlsId) : null;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const isMobile = window.innerWidth < NAV_BREAKPOINT;

      if (isMobile) {
        // Accordion: close others, toggle this one
        navToggles.forEach(function(t) {
          if (t !== toggle) {
            t.setAttribute('aria-expanded', 'false');
            const otherId = t.getAttribute('aria-controls');
            if (otherId) {
              setMegaMenuTabIndex(document.getElementById(otherId), '-1');
            }
          }
        });
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        setMegaMenuTabIndex(megaMenu, !isExpanded ? '0' : '-1');
      } else {
        // Dropdown: close all, then open this one if it was closed
        closeAllNavMenus();
        if (!isExpanded) {
          toggle.setAttribute('aria-expanded', 'true');
          setMegaMenuTabIndex(megaMenu, '0');
        }
      }
    });

    // Escape closes the submenu and returns focus to toggle
    toggle.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        setMegaMenuTabIndex(megaMenu, '-1');
        toggle.focus();
      }
    });

    // Close flyout when tabbing out of it (desktop only)
    if (navItem) {
      navItem.addEventListener('focusout', function() {
        // Only apply on desktop
        if (window.innerWidth < NAV_BREAKPOINT) return;

        // Check if the new focus target is outside this nav item
        // Use setTimeout to allow focus to settle on the new element
        setTimeout(function() {
          if (!navItem.contains(document.activeElement)) {
            toggle.setAttribute('aria-expanded', 'false');
            setMegaMenuTabIndex(megaMenu, '-1');
          }
        }, 0);
      });
    }

    // Allow escape key from within the mega-menu itself
    if (megaMenu) {
      megaMenu.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          setMegaMenuTabIndex(megaMenu, '-1');
          toggle.focus();
        }
      });
    }
  });

  // Close dropdowns when clicking outside (desktop)
  document.addEventListener('click', function(e) {
    if (window.innerWidth >= NAV_BREAKPOINT) {
      const isInsideNav = e.target.closest('.luc-nav__item, .luc-subbrand-nav__item');
      if (!isInsideNav) {
        closeAllNavMenus();
      }
    }
  });

  // ==========================================================================
  // KEYBOARD NAVIGATION
  // ==========================================================================

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (isMenuOpen()) {
        closeMenu();
        menuToggle?.focus();
        return;
      }
      if (isSearchOpen()) {
        closeSearch();
        searchToggle?.focus();
        return;
      }
      closeAllNavMenus();
    }
  });

  // ==========================================================================
  // FOCUS TRAP (for mobile overlays)
  // ==========================================================================

  function trapFocus(element, isActiveCheck) {
    if (!element) return;

    element.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab' || !isActiveCheck()) return;

      const focusable = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last?.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first?.focus();
        e.preventDefault();
      }
    });
  }

  // Apply focus trap to mobile menu (find by ID)
  const navMenu = document.getElementById('luc-nav-menu');
  trapFocus(navMenu, isMenuOpen);
  trapFocus(searchPanel, isSearchOpen);

  // ==========================================================================
  // RESIZE HANDLER
  // ==========================================================================

  window.addEventListener('resize', function() {
    if (window.innerWidth >= NAV_BREAKPOINT) {
      if (isMenuOpen()) closeMenu();
      if (isSearchOpen()) closeSearch();
    }
  });

})();
