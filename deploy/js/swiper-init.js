(function () {

  function updateFullyVisibleSlides(container) {
    var slides = container.querySelectorAll('.swiper-slide');
    var wrapperRect = container.getBoundingClientRect();
    slides.forEach(function (slide) {
      slide.classList.remove('swiper-slide-fully-visible');
      var slideRect = slide.getBoundingClientRect();
      if (slideRect.left >= wrapperRect.left && slideRect.right <= wrapperRect.right) {
        slide.classList.add('swiper-slide-fully-visible');
      }
    });
  }

  function updateAriaHidden(swiperContent) {
    if (!swiperContent) return;

    swiperContent.querySelectorAll('.swiper-slide').forEach(function (slide) {
      slide.setAttribute('aria-hidden', 'true');
      slide.querySelectorAll('button, a').forEach(function (child) {
        child.setAttribute('aria-hidden', 'true');
        child.setAttribute('tabindex', '-1');
      });
    });

    var activeSlides = swiperContent.querySelectorAll(
      '.swiper-slide.swiper-slide-fully-visible, .swiper-slide.swiper-slide-active'
    );
    activeSlides.forEach(function (slide) {
      slide.setAttribute('aria-hidden', 'false');
      slide.querySelectorAll('button, a').forEach(function (child) {
        child.setAttribute('aria-hidden', 'false');
        child.setAttribute('tabindex', '0');
      });
    });
  }

  function initSwipers() {
    var containers = document.querySelectorAll('[data-swiper]');

    containers.forEach(function (el) {
      var swiperContent = el.querySelector('.swiper-content');
      if (!swiperContent) return;
      if (swiperContent.swiper) return;

      var desktop = parseInt(el.dataset.swiperDesktop) || 4;
      var tablet  = parseInt(el.dataset.swiperTablet)  || 2;
      var mobile  = parseInt(el.dataset.swiperMobile)  || 1;
      var gap     = parseInt(el.dataset.swiperGap)      || 48;
      var loop    = el.dataset.swiperLoop === 'true';

      var navNext      = el.querySelector('.swiper-button-next');
      var navPrev      = el.querySelector('.swiper-button-prev');
      var paginationEl = el.querySelector('.swiper-pagination');

      var config = {
        slidesPerView: mobile,
        spaceBetween: gap,
        watchOverflow: true,
        loop: loop,
        speed: 600,
        a11y: false,
        keyboard: false,
        breakpoints: {},
        navigation: {
          nextEl: navNext,
          prevEl: navPrev
        },
        pagination: {
          el: paginationEl,
          type: 'fraction',
          formatFractionCurrent: function (n) { return n; },
          formatFractionTotal: function (n) { return n; }
        },
        on: {
          init: function () {
            updateFullyVisibleSlides(el);
            updateAriaHidden(swiperContent);
          },
          resize: function () {
            updateFullyVisibleSlides(el);
            updateAriaHidden(swiperContent);
          },
          slideChangeTransitionEnd: function () {
            updateFullyVisibleSlides(el);
            updateAriaHidden(swiperContent);
          }
        }
      };

      config.breakpoints[640] = {
        slidesPerView: tablet,
        spaceBetween: gap,
      };

      config.breakpoints[1024] = {
        slidesPerView: desktop,
        spaceBetween: gap,
      };

      new Swiper(swiperContent, config);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwipers);
  } else {
    initSwipers();
  }
})();
