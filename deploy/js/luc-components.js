/**
 * LUC Components Bundle - JavaScript
 * Animation observer, video controls, sunburst animations, automodal.
 * Separate from the nav/footer bundle for independent inclusion.
 */

// ==========================================================================
// ANIMATION OBSERVER
// Converted from animate.ts - handles data-animate scroll animations
// ==========================================================================

(function() {
  'use strict';

  const targets = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(function(entries) {
    let delay = 0;
    for (const entry of entries) {
      const isIntersecting = entry.isIntersecting;
      const target = entry.target;
      if (target.getAttribute('data-animate') !== 'true' && isIntersecting) {
        setTimeout(function() {
          target.setAttribute('data-animate', 'true');
        }, delay);
        delay += 300;
      }
    }
  });

  for (const target of targets) {
    observer.observe(target);
  }
})();

// ==========================================================================
// VIDEO CONTROL TAB ORDER & GLOBAL UTILITIES
// Converted from global.ts - handles video control tab order and Safari fixes
// ==========================================================================

(function() {
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

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVideoControlTabOrder);
  } else {
    setupVideoControlTabOrder();
  }

  // Force layout recalculation on orientation change (Safari fix)
  let resizeTimeout;
  window.addEventListener('orientationchange', function() {
    // Clear any pending timeout
    clearTimeout(resizeTimeout);

    // Force reflow after orientation change completes
    resizeTimeout = setTimeout(function() {
      // Trigger reflow by reading offsetHeight
      document.body.style.display = 'none';
      void document.body.offsetHeight;
      document.body.style.display = '';
    }, 100);
  });
})();

// ==========================================================================
// VIDEO HERO CONTROLS
// Converted from Hero.astro script - handles video-hero play/pause controls
// ==========================================================================

(function() {
  'use strict';

  const motionQuery = matchMedia('(prefers-reduced-motion)');

  // Handle video-hero control - keep in bottom-right of video
  const videoHeroControls = document.querySelectorAll('.luc-hero__control--video-hero');

  for (const control of videoHeroControls) {
    const hero = control.closest('.luc-hero');
    const video = hero && hero.querySelector('.luc-hero__video-hero-player');

    if (video && hero) {
      // Video control functionality
      const srText = document.createElement('span');
      srText.className = 'luc-screen-reader-text';
      srText.textContent = 'Pause Video';
      control.appendChild(srText);

      // Get label element for video-hero control
      const videoHeroLabelElement = control.querySelector('.luc-hero__control-label');

      if (motionQuery.matches) {
        video.pause();
        control.classList.add('luc-hero__control--paused');
        srText.textContent = 'Play Video';
        if (videoHeroLabelElement) videoHeroLabelElement.textContent = 'Play';
      }

      video.addEventListener('pause', function() {
        control.classList.add('luc-hero__control--paused');
        srText.textContent = 'Play Video';
        if (videoHeroLabelElement) videoHeroLabelElement.textContent = 'Play';
      });

      video.addEventListener('play', function() {
        control.classList.remove('luc-hero__control--paused');
        srText.textContent = 'Pause Video';
        if (videoHeroLabelElement) videoHeroLabelElement.textContent = 'Pause';
      });

      control.addEventListener('click', function() {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    }
  }

  // Handle motion preference changes
  motionQuery.addEventListener('change', function(event) {
    for (const control of videoHeroControls) {
      const video = control.closest('.luc-hero') && control.closest('.luc-hero').querySelector('.luc-hero__video-hero-player');
      if (video) {
        if (event.matches) {
          video.pause();
          control.classList.add('luc-hero__control--paused');
        }
      }
    }
  });
})();

// ==========================================================================
// SUNBURST ANIMATIONS
// Converted from GSAP script - handles sunburst scaling and ray animations
// ==========================================================================

(function() {
  'use strict';

  // Check if GSAP is available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded - sunburst animations disabled');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Refresh pin spacer: body (viewport/zoom), #main-content (content growth, font scaling, letter-spacing)
  var heroPinTriggers = [];
  function getViewportPinThreshold() {
    var val = getComputedStyle(document.documentElement).getPropertyValue('--hero-min-height-pin').trim();
    return parseFloat(val) || 500;
  }
  function viewportTooShort() {
    var vh = window.innerHeight;
    return vh <= getViewportPinThreshold();
  }
  if (typeof ResizeObserver !== 'undefined') {
    var refreshTid;
    function debouncedRefresh() {
      clearTimeout(refreshTid);
      refreshTid = setTimeout(function() {
        var disable = viewportTooShort();
        heroPinTriggers.forEach(function(t) {
          if (disable) {
            t.onDisable && t.onDisable();
            t.heroST.disable(true);
          } else {
            t.heroST.enable();
          }
        });
        ScrollTrigger.refresh();
      }, 150);
    }
    new ResizeObserver(debouncedRefresh).observe(document.body);
    var mainContent = document.getElementById('main-content');
    if (mainContent) new ResizeObserver(debouncedRefresh).observe(mainContent);
  }
  window.refreshScrollTrigger = function() {
    var disable = viewportTooShort();
    heroPinTriggers.forEach(function(t) {
      if (disable) {
        t.onDisable && t.onDisable();
        t.heroST.disable(true);
      } else {
        t.heroST.enable();
      }
    });
    ScrollTrigger.refresh();
  };

  document.querySelectorAll('.sunburst-container').forEach(function(sunburstContainer) {
    const sunburstWrapper = sunburstContainer.querySelector('.sunburst-wrapper');
    const svgObject = sunburstContainer.querySelector('.sunburst-svg-object');
    if (!sunburstWrapper || !svgObject) return;

    const flareEl = sunburstContainer.querySelector('.sunburst-flare');
    // Updated selector to target new luc-hero class
    const heroSection = sunburstContainer.closest('.luc-hero');

    /* Hide SVG + text until scroll-driven reveals */
    gsap.set(svgObject, { opacity: 0 });
    if (flareEl) gsap.set(flareEl, { opacity: 0 });

    const sunburstTextEl = sunburstContainer.querySelector('.sunburst-text');
    const whiteSegment = sunburstTextEl ? sunburstTextEl.querySelector('.sunburst-text--white') : null;
    const goldSegment = sunburstTextEl ? sunburstTextEl.querySelector('.sunburst-text--gold') : null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function buildWordSpans(segment) {
      if (!segment) return [];
      const words = (segment.textContent || "").trim().split(/\s+/).filter(Boolean);
      segment.textContent = "";
      const spans = [];
      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'sunburst-word';
        span.style.display = 'inline-block';
        span.textContent = word;
        segment.appendChild(span);
        spans.push(span);
        if (index < words.length - 1) segment.appendChild(document.createTextNode(' '));
      });
      return spans;
    }

    const whiteWordSpans = buildWordSpans(whiteSegment);

    function resetHybridText() {
      if (!sunburstTextEl) return;
      if (sunburstContainer._textRevealTl) {
        sunburstContainer._textRevealTl.kill();
        sunburstContainer._textRevealTl = null;
      }
      gsap.set(sunburstTextEl, { opacity: 0, y: 30 });
      if (whiteWordSpans.length) gsap.set(whiteWordSpans, { opacity: 0, y: 10 });
      if (goldSegment) gsap.set(goldSegment, { opacity: 0, y: 16 });
    }

    function playHybridText() {
      if (!sunburstTextEl) return;
      if (sunburstContainer._textRevealTl) {
        sunburstContainer._textRevealTl.kill();
        sunburstContainer._textRevealTl = null;
      }

      if (prefersReducedMotion) {
        gsap.set(sunburstTextEl, { opacity: 1, y: 0 });
        if (whiteWordSpans.length) gsap.set(whiteWordSpans, { opacity: 1, y: 0 });
        if (goldSegment) gsap.set(goldSegment, { opacity: 1, y: 0 });
        return;
      }

      resetHybridText();
      sunburstContainer._textRevealTl = gsap.timeline();
      sunburstContainer._textRevealTl.to(
        sunburstTextEl,
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0
      );
      if (whiteWordSpans.length) {
        sunburstContainer._textRevealTl.to(
          whiteWordSpans,
          { opacity: 1, y: 0, duration: 2, stagger: 0.06, ease: "power2.out" },
          0.1
        );
      }
      if (goldSegment) {
        sunburstContainer._textRevealTl.to(
          goldSegment,
          { opacity: 1, y: 0, duration: 2, ease: "power2.out" },
          0.9
        );
      }
    }

    if (sunburstTextEl) {
      resetHybridText();
    }

    const burstRevealAt = 0.1;
    const textRevealAt = 0.2;

    /* ---- Idempotent show/hide helpers ---- */
    function showBurst() {
      if (sunburstContainer._burstShowing) return;
      sunburstContainer._burstShowing = true;
      sunburstContainer.style.zIndex = '9';
      gsap.to(svgObject, { opacity: 0.4, duration: 0.3, overwrite: "auto" });
      if (flareEl) {
        gsap.fromTo(flareEl,
          { opacity: 0 },
          { opacity: 0.8, duration: 0.95, ease: "power2.out", overwrite: "auto" }
        );
      }
      if (sunburstContainer._playBurst) sunburstContainer._playBurst();
    }

    function hideBurst() {
      if (!sunburstContainer._burstShowing) return;
      sunburstContainer._burstShowing = false;
      sunburstContainer.style.zIndex = '';
      if (sunburstContainer._burstTl) {
        sunburstContainer._burstTl.kill();
        sunburstContainer._burstTl = null;
      }
      gsap.to(svgObject, { opacity: 0, duration: 0.3, overwrite: "auto" });
      if (flareEl) gsap.to(flareEl, { opacity: 0, duration: 0.3, ease: "power2.in", overwrite: "auto" });
      if (sunburstContainer._resetBurst) sunburstContainer._resetBurst();
    }

    function showBurstInstant() {
      sunburstContainer._burstShowing = true;
      sunburstContainer.style.zIndex = '9';
      gsap.set(svgObject, { opacity: 0.4 });
      if (flareEl) gsap.set(flareEl, { opacity: 0.8 });
      if (sunburstContainer._setBurstEndState) sunburstContainer._setBurstEndState();
    }

    function showText() {
      if (sunburstContainer._textShowing) return;
      sunburstContainer._textShowing = true;
      playHybridText();
    }

    function hideText() {
      if (!sunburstContainer._textShowing) return;
      sunburstContainer._textShowing = false;
      resetHybridText();
    }

    function showTextInstant() {
      sunburstContainer._textShowing = true;
      if (!sunburstTextEl) return;
      if (sunburstContainer._textRevealTl) {
        sunburstContainer._textRevealTl.kill();
        sunburstContainer._textRevealTl = null;
      }
      gsap.set(sunburstTextEl, { opacity: 1, y: 0 });
      if (whiteWordSpans.length) gsap.set(whiteWordSpans, { opacity: 1, y: 0 });
      if (goldSegment) gsap.set(goldSegment, { opacity: 1, y: 0 });
    }

    function initBurstRays() {
      if (sunburstContainer._burstInit) return;
      sunburstContainer._burstInit = true;

      try {
        const isObjectEmbed = svgObject.tagName.toLowerCase() === 'object';
        const svgDoc = isObjectEmbed ? svgObject.contentDocument : svgObject;
        if (!svgDoc) return;

        const rayPaths = Array.from(svgDoc.querySelectorAll('path[fill="#eaa000"], path[fill="#EAA000"]'));
        if (!rayPaths.length) return;

        const svgRoot = isObjectEmbed ? svgDoc.querySelector('svg') : svgObject;
        const viewBox = svgRoot && svgRoot.viewBox ? svgRoot.viewBox.baseVal : null;
        const originX = viewBox ? (viewBox.x + (viewBox.width / 2)) : 1956;
        const originY = viewBox ? (viewBox.y + (viewBox.height / 2)) : 1702;

        function setBurstStartState() {
          gsap.set(rayPaths, {
            opacity: 0,
            scale: 0,
            rotation: 0,
            svgOrigin: originX + ' ' + originY
          });
        }

        function playRandomBurst() {
          if (sunburstContainer._burstTl) {
            sunburstContainer._burstTl.kill();
            sunburstContainer._burstTl = null;
          }

          if (prefersReducedMotion) {
            gsap.set(rayPaths, { opacity: 1, scale: 1, rotation: 0, svgOrigin: originX + ' ' + originY });
            return;
          }

          setBurstStartState();
          const randomOrder = gsap.utils.shuffle(rayPaths.slice());
          const maxStartDelay = 0.7;

          sunburstContainer._burstTl = gsap.timeline();
          randomOrder.forEach((path) => {
            const startAt = gsap.utils.random(0, maxStartDelay);
            const growDuration = gsap.utils.random(0.65, 1.15);
            const startRotation = gsap.utils.random(-24, 24);

            sunburstContainer._burstTl.fromTo(path,
              {
                opacity: 0,
                scale: 0.01,
                rotation: startRotation,
                svgOrigin: originX + ' ' + originY
              },
              {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: growDuration,
                ease: "power3.out"
              },
              startAt
            );
          });
        }

        function resetBurst() {
          if (sunburstContainer._burstTl) {
            sunburstContainer._burstTl.kill();
            sunburstContainer._burstTl = null;
          }
          setBurstStartState();
        }

        setBurstStartState();
        sunburstContainer._playBurst = playRandomBurst;
        sunburstContainer._resetBurst = resetBurst;
        sunburstContainer._setBurstEndState = function() {
          gsap.set(rayPaths, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            svgOrigin: originX + ' ' + originY
          });
        };

        if (sunburstContainer._burstShowing) {
          sunburstContainer._setBurstEndState();
        }
      } catch (error) {
        console.error('Burst setup error:', error);
      }
    }

    if (svgObject.tagName.toLowerCase() === 'object') {
      svgObject.addEventListener('load', initBurstRays);
      if (svgObject.contentDocument) initBurstRays();
    } else {
      initBurstRays();
    }

    const scaleTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection || "body",
        start: function() {
          var rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
          var navHeight = window.innerWidth >= 1190 ? 6 * rem : 4.5 * rem;
          return "top " + navHeight + "px";
        },
        end: "+=1000px",
        pin: "#main-content",
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          if (self.progress >= burstRevealAt) showBurst();
          else hideBurst();

          if (self.progress >= textRevealAt) showText();
          else hideText();
        },
        onRefresh: (self) => {
          if (viewportTooShort()) {
            showBurstInstant();
            showTextInstant();
            scaleTl.progress(1);
            if (videoHeroContainer) gsap.set(videoHeroContainer, { filter: 'blur(0px)', opacity: 1 });
            gsap.set(sunburstWrapper, { clearProps: 'all' });
            return;
          }
          if (self.progress >= burstRevealAt) showBurstInstant();
          else hideBurst();

          if (self.progress >= textRevealAt) showTextInstant();
          else hideText();
        }
      }
    });

    // Dome rise: translate the sunburst-circle upward from below viewport
    var sunburstCircle = sunburstContainer.querySelector('.sunburst-circle');
    gsap.set(sunburstCircle, { y: "90%" });
    scaleTl.to(sunburstCircle,
      { y: "-10%", duration: 1.2, ease: "power2.out" },
      0
    );

    // Video hero blur: blur from 0px to 20px and opacity from 1 to 0.5 between ~10%–30% scroll progress
    var videoHeroContainer = heroSection && heroSection.querySelector('.luc-hero__video-hero-player');
    if (videoHeroContainer) {
      gsap.set(videoHeroContainer, { filter: 'blur(0px)', opacity: 1 });
      scaleTl.to(videoHeroContainer,
        { filter: 'blur(50px)', opacity: 0.5, duration: 0.18, ease: "none" },
        0.12
      );
    }

    // Gradient overlay fade: fade out early in scroll (~26% progress = frame 63/240)
    var gradientOverlay = heroSection && heroSection.querySelector('.luc-hero__gradient-overlay');
    if (gradientOverlay) {
      var gradientMM = gsap.matchMedia();
      gradientMM.add("(min-width: 768px)", function() {
        gsap.set(gradientOverlay, { opacity: 1 });
        scaleTl.to(gradientOverlay,
          { opacity: 0, duration: 0.26, ease: "power1.in" },
          0
        );
        return function() {
          gsap.set(gradientOverlay, { opacity: 1 });
        };
      });
    }

    gsap.set(sunburstWrapper, { y: "0%" });
    scaleTl.to(sunburstWrapper,
      { y: "-60%", duration: 1.2, ease: "none" },
      0
    );

    if (flareEl) {
      gsap.set(flareEl, { x: 0, y: 0, scale: 1 });
      scaleTl.to(flareEl,
        { x: 220, y: 170, scale: 3, duration: 1.2, ease: "none" },
        0
      );
    }

    var heroST = scaleTl.scrollTrigger;
    heroPinTriggers.push({
      heroSection: heroSection,
      heroST: heroST,
      onDisable: function() {
        showBurstInstant();
        showTextInstant();
        scaleTl.progress(1);
        if (videoHeroContainer) gsap.set(videoHeroContainer, { filter: 'blur(0px)', opacity: 1 });
        gsap.set(sunburstWrapper, { clearProps: 'all' });
      }
    });
    document.addEventListener('focusin', function(e) {
      if (!heroSection) return;
      var inHero = heroSection.contains(e.target);
      var afterHero = !inHero && e.target.compareDocumentPosition(heroSection) & Node.DOCUMENT_POSITION_PRECEDING;
      if (afterHero && heroST.progress < 1) {
        window.scrollTo({ top: heroST.end + heroSection.offsetHeight, behavior: 'instant' });
      } else if (inHero && heroST.progress >= 1) {
        window.scrollTo({ top: heroST.start, behavior: 'instant' });
      }
    });
  });

  if (heroPinTriggers.length) {
    var disable = viewportTooShort();
    heroPinTriggers.forEach(function(t) {
      if (disable) {
        t.onDisable && t.onDisable();
        t.heroST.disable(true);
      } else {
        t.heroST.enable();
      }
    });
    ScrollTrigger.refresh();
  }

  // Panel Burst animations for reusable sunburst sections
  document.querySelectorAll('.panel-burst').forEach(function(panelBurst) {
    const svgObject = panelBurst.querySelector('.panel-burst__svg');
    if (!svgObject) return;

    const svgSrc = svgObject.dataset.src;
    if (!svgSrc) return;

    fetch(svgSrc)
      .then(function(response) { return response.text(); })
      .then(function(svgText) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = svgDoc.documentElement;
        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
        svgObject.appendChild(svgEl);

        try {

        const rectsToHide = [
          svgEl.querySelector('rect[fill="url(#pattern0_2321_21298)"]'),
          svgEl.querySelector('rect[fill="#5A0722"]'),
          svgEl.querySelector('rect[fill="white"]'),
          svgEl.querySelector('rect[fill="url(#paint131_linear_2321_21298)"]')
        ];
        rectsToHide.forEach(function(rect) {
          if (rect) {
            rect.setAttribute('fill', 'none');
            rect.setAttribute('fill-opacity', '0');
          }
        });

        const patternRect = svgEl.querySelector('rect[fill="url(#pattern0_2321_21298)"]');
        const backgroundGroup = svgEl.querySelector('g[opacity="1"]');
        const sunburstGroup = svgEl.querySelector('g[style*="mix-blend-mode"]');

        if (sunburstGroup) {
          const sunburstPaths = Array.from(sunburstGroup.querySelectorAll('path[fill^="url(#paint"][fill*="_linear"]'));
          const filteredGroups = svgEl.querySelectorAll('g[filter]');
          const backgroundPaths = [];
          filteredGroups.forEach((group) => {
            const pathsInGroup = group.querySelectorAll('path');
            backgroundPaths.push(...Array.from(pathsInGroup));
          });

          const allPaths = [...sunburstPaths, ...backgroundPaths];

          if (allPaths.length === 0) {
            console.error('No sunburst paths found!');
            return;
          }

          const originX = -23.0173;
          const originY = 211.025;

          if (patternRect) {
            const rectBBox = patternRect.getBBox();
            const rectCenterX = rectBBox.x + rectBBox.width / 2;
            const rectCenterY = rectBBox.y + rectBBox.height / 2;

            const deltaX = rectCenterX - originX;
            const deltaY = rectCenterY - originY;
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const pullBackRatio = 0.9;
            const translateX = -Math.cos(angle) * distance * pullBackRatio;
            const translateY = -Math.sin(angle) * distance * pullBackRatio;

            gsap.set(patternRect, {
              opacity: 0,
              scale: 0,
              x: translateX,
              y: translateY,
              transformOrigin: originX + 'px ' + originY + 'px'
            });
          }

          if (backgroundGroup) {
            gsap.set(backgroundGroup, { opacity: 0 });
          }

          allPaths.forEach((path) => {
            const bbox = path.getBBox();
            const midX = bbox.x + bbox.width / 2;
            const midY = bbox.y + bbox.height / 2;

            const deltaX = midX - originX;
            const deltaY = midY - originY;
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const pullBackRatio = 0.9;
            const translateX = -Math.cos(angle) * distance * pullBackRatio;
            const translateY = -Math.sin(angle) * distance * pullBackRatio;

            gsap.set(path, {
              opacity: 0,
              scale: 0,
              x: translateX,
              y: translateY,
              transformOrigin: originX + 'px ' + originY + 'px'
            });
          });

          gsap.set(sunburstGroup, {
            rotation: 0,
            transformOrigin: originX + 'px ' + originY + 'px'
          });

          if (backgroundGroup) {
            backgroundGroup.setAttribute('transform', 'rotate(0, ' + originX + ', ' + originY + ')');
          }

          ScrollTrigger.create({
            trigger: panelBurst,
            start: "top 50%",
            end: "bottom top",
            onUpdate: (self) => {
              const progress = self.progress;
              const rotation = (progress - 0.5) * 30;

              sunburstGroup.setAttribute('transform', 'rotate(' + rotation + ', ' + originX + ', ' + originY + ')');

              if (backgroundGroup) {
                const bgRotation = -rotation * 0.75;
                backgroundGroup.setAttribute('transform', 'rotate(' + bgRotation + ', ' + originX + ', ' + originY + ')');
              }
            }
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panelBurst,
              start: "top 50%",
              scrub: false,
              once: true
            }
          });

          if (patternRect) {
            tl.to(patternRect, {
              opacity: 1,
              duration: 3.0,
              ease: "power1.out"
            }, 0);

            tl.to(patternRect, {
              scale: 1,
              x: 0,
              y: 0,
              duration: 2.5,
              ease: "power2.out"
            }, 0);
          }

          if (backgroundGroup) {
            tl.to(backgroundGroup, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out"
            }, 0);
          }

          allPaths.forEach((path) => {
            tl.to(path, {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              duration: 1.5,
              ease: "power3.out"
            }, 0);
          });

        } else {
          console.error('Could not find sunburst group in panel burst');
        }
      } catch (error) {
        console.error('Panel burst error:', error);
      }
    })
    .catch(function(error) {
      console.error('Failed to load SVG:', error);
    });
  });
})();

// ==========================================================================
// HERO VIDEO INFO TOOLTIP
// Handles show/hide of "About this video" tooltip on focus/blur and hover
// ==========================================================================

(function() {
  'use strict';

  const infoButton = document.querySelector('.luc-hero__control-info');
  const tooltip = document.getElementById('luc-hero__control-info-description');

  if (!infoButton || !tooltip) return;

  function showTooltip() {
    tooltip.removeAttribute('hidden');
  }

  function hideTooltip() {
    tooltip.setAttribute('hidden', '');
  }

  // Show on mouse enter and focus
  infoButton.addEventListener('mouseenter', showTooltip);
  infoButton.addEventListener('focus', showTooltip);

  // Hide on mouse leave and blur
  infoButton.addEventListener('mouseleave', hideTooltip);
  infoButton.addEventListener('blur', hideTooltip);

  // Hide on Escape key
  infoButton.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideTooltip();
      infoButton.focus(); // Keep focus on button
    }
  });
})();

// ==========================================================================
// AUTOMODAL - Native dialog modals
// Inline version of automodal library for native <dialog> elements
// ==========================================================================

(function() {
  'use strict';

  function automodal(target, options) {
    options = options || {};

    var animations = function(element) {
      return Promise.allSettled(element.getAnimations().map(function(animation) {
        return animation.finished;
      }));
    };

    var getType = function(target) {
      var href = target.getAttribute('href');
      var type = target.getAttribute('data-automodal-type');

      if (type) {
        return type;
      }

      if (href.startsWith('#')) {
        return 'id';
      }

      if (href.includes('youtube.com/shorts/')) {
        return 'short';
      }

      if (href.includes('youtube.com') || href.includes('youtu.be')) {
        return 'youtube';
      }

      if (href.includes('tiktok.com')) {
        return 'tiktok';
      }

      if (href.includes('instagram.com/p/')) {
        return 'instagram';
      }

      if (href.includes('instagram.com/reel/')) {
        return 'reel';
      }

      if (href.includes('vimeo.com')) {
        return 'vimeo';
      }

      if (href.includes('wistia.com')) {
        return 'wistia';
      }

      if (href.includes('google.com/maps/')) {
        return 'map';
      }

      return 'image';
    };

    var iframe = function(src, title) {
      return '<iframe src="' + src + '" title="' + title + '" loading="lazy" allowfullscreen></iframe>';
    };

    var load = function(target) {
      return new Promise(function(resolve) {
        var href = target.getAttribute('href');
        var type = getType(target);
        var alt = target.getAttribute('data-automodal-alt') || '';
        var title = target.getAttribute('data-automodal-title') || '';

        if (type === 'fetch') {
          fetch(href).then(function(response) {
            return response.text();
          }).then(function(text) {
            resolve(text.trim());
          });
          return;
        }

        if (type === 'iframe') {
          resolve(iframe(href, title));
          return;
        }

        if (type === 'id') {
          var element = document.querySelector(href);
          resolve(element ? element.outerHTML.trim() : '');
          return;
        }

        if (type === 'short') {
          var id = href.split('/shorts/')[1];
          var src = 'https://www.youtube.com/embed/' + id;
          resolve(iframe(src, title));
          return;
        }

        if (type === 'youtube') {
          var src = 'https://www.youtube.com/embed/';
          if (href.includes('youtube.com')) {
            src += href.split('v=')[1].replace('&', '?');
          }
          if (href.includes('youtu.be')) {
            src += href.split('youtu.be/')[1];
          }
          resolve(iframe(src, title));
          return;
        }

        if (type === 'tiktok') {
          var id = href.split('/video/')[1];
          var src = 'https://www.tiktok.com/embed/v2/' + id;
          resolve(iframe(src, title));
          return;
        }

        if (type === 'instagram') {
          var id = href.split('/p/')[1].split('/')[0];
          var src = 'https://www.instagram.com/p/' + id + '/embed/captioned/';
          resolve(iframe(src, title));
          return;
        }

        if (type === 'reel') {
          var id = href.split('/reel/')[1].split('/')[0];
          var src = 'https://www.instagram.com/reel/' + id + '/embed/captioned/';
          resolve(iframe(src, title));
          return;
        }

        if (type === 'vimeo') {
          var id = href.split('vimeo.com/')[1];
          var src = 'https://player.vimeo.com/video/' + id;
          resolve(iframe(src, title));
          return;
        }

        if (type === 'wistia') {
          var id = href.split('wistia.com/medias/')[1];
          var src = 'https://fast.wistia.net/embed/iframe/' + id;
          resolve(iframe(src, title));
          return;
        }

        if (type === 'map') {
          var src = 'https://www.google.com/maps/embed/v1/';
          if (href.includes('/maps/place/')) {
            var place = href.match('(?:/maps/place/)([^/]+)')[1];
            src += 'place?key=' + options.googleMapsAPIKey + '&q=' + place;
          }
          if (href.includes('/maps/@')) {
            var data = href.match('(?:/maps/@)([^z]+)')[1].split(',');
            src += 'view?key=' + options.googleMapsAPIKey + '&center=' + data[0] + ',' + data[1] + '&zoom=' + data[2] + 'z';
          }
          resolve(iframe(src, title));
          return;
        }

        resolve('<img src="' + href + '" alt="' + alt + '" loading="lazy">');
      });
    };

    var item = function(target) {
      return new Promise(function(resolve) {
        var type = getType(target);
        var name = target.getAttribute('data-automodal') || '';
        var caption = target.getAttribute('data-automodal-caption') || '';

        load(target).then(function(content) {
          var itemClass = 'Automodal__item';
          if (type === 'short' || type === 'tiktok' || type === 'reel') {
            itemClass += ' Automodal__item--short';
          }
          if (type === 'youtube') {
            itemClass += ' Automodal__item--youtube';
          }

          var html = '<div class="' + itemClass + '">' +
                     '<div class="Automodal__content">' +
                     content +
                     (caption ? '<div class="Automodal__caption">' + caption + '</div>' : '') +
                     '</div>' +
                     '</div>';
          resolve(html);
        });
      });
    };

    target.addEventListener('click', function(e) {
      e.preventDefault();

      var updating = false;
      var index;
      var group = target.getAttribute('data-automodal-group') || '';

      if (group) {
        group = document.querySelectorAll('[data-automodal-group="' + group + '"]');
        index = Array.prototype.indexOf.call(group, target);
      }

      var dialog = document.createElement('dialog');
      dialog.classList.add('Automodal');
      dialog.innerHTML = '<button class="Automodal__close" type="button" aria-label="Close modal"></button>' +
                         '<div class="Automodal__viewport"></div>' +
                         (group ? '<button class="Automodal__nav Automodal__nav--prev" type="button" aria-label="Previous"></button>' +
                                  '<button class="Automodal__nav Automodal__nav--next" type="button" aria-label="Next"></button>' : '');

      var close = dialog.querySelector('.Automodal__close');
      var viewport = dialog.querySelector('.Automodal__viewport');
      var prev = dialog.querySelector('.Automodal__nav--prev');
      var next = dialog.querySelector('.Automodal__nav--next');

      var insert = function(target) {
        return new Promise(function(resolve) {
          item(target).then(function(html) {
            viewport.insertAdjacentHTML('beforeend', html);
            target.dispatchEvent(new CustomEvent('load'));
            resolve();
          });
        });
      };

      var nav = function(dir) {
        return new Promise(function(resolve) {
          if (group && !updating) {
            var remove = viewport.firstElementChild;

            if (dir === 'prev') {
              index = index - 1 >= 0 ? index - 1 : group.length - 1;
            }

            if (dir === 'next') {
              index = index + 1 < group.length ? index + 1 : 0;
            }

            updating = true;
            dialog.classList.add('Automodal--' + dir);

            insert(group[index]).then(function() {
              remove.classList.add('Automodal__item--remove');
              return animations(remove);
            }).then(function() {
              remove.remove();
              dialog.classList.remove('Automodal--' + dir);
              updating = false;
              resolve();
            });
          } else {
            resolve();
          }
        });
      };

      var remove = function() {
        return new Promise(function(resolve) {
          dialog.classList.remove('Automodal--active');
          animations(dialog).then(function() {
            dialog.close();
            dialog.remove();
            resolve();
          });
        });
      };

      var keydown = function(e) {
        if (e.key === 'ArrowLeft') {
          nav('prev');
        }
        if (e.key === 'ArrowRight') {
          nav('next');
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          remove();
        }
      };

      var build = function() {
        return new Promise(function(resolve) {
          document.body.appendChild(dialog);
          dialog.showModal();
          insert(target).then(function() {
            dialog.classList.add('Automodal--active');
            resolve();
          });
        });
      };

      var outside = function(e) {
        if (e.target === dialog) {
          remove();
        }
      };

      var listen = function() {
        dialog.addEventListener('keydown', keydown);
        dialog.addEventListener('click', outside);
        if (prev) prev.addEventListener('click', function() { nav('prev'); });
        if (next) next.addEventListener('click', function() { nav('next'); });
        close.addEventListener('click', remove);
      };

      var init = function() {
        build();
        listen();
      };

      init();
    });
  }

  // Initialize automodal on elements with data-automodal attribute
  var targets = document.querySelectorAll('[data-automodal]');
  for (var i = 0; i < targets.length; i++) {
    automodal(targets[i]);
  }
})();
