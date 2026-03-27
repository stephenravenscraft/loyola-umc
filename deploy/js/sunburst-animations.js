;(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
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
    var mainContent = document.getElementById('main-content-pin') || document.getElementById('main-content');
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
        pin: "#main-content-pin",
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

    var sunburstCircle = sunburstContainer.querySelector('.sunburst-circle');
    if (sunburstCircle) {
      gsap.set(sunburstCircle, { y: "90%" });
      scaleTl.to(sunburstCircle,
        { y: "-10%", duration: 1.2, ease: "power2.out" },
        0
      );
    }

    var videoHeroContainer = heroSection && heroSection.querySelector('.luc-hero__video-hero-player');
    if (videoHeroContainer) {
      gsap.set(videoHeroContainer, { filter: 'blur(0px)', opacity: 1 });
      scaleTl.to(videoHeroContainer,
        { filter: 'blur(50px)', opacity: 0.5, duration: 0.18, ease: "none" },
        0.12
      );
    }

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
      var pinEl = document.getElementById('main-content-pin');
      var inPin = pinEl && pinEl.contains(e.target);
      var afterPin = !inPin && pinEl && e.target.compareDocumentPosition(pinEl) & Node.DOCUMENT_POSITION_PRECEDING;
      if (afterPin && heroST.progress < 1) {
        window.scrollTo({ top: heroST.end + heroSection.offsetHeight, behavior: 'instant' });
      } else if (inPin && !inHero && heroST.progress < 1) {
        window.scrollTo({ top: heroST.end, behavior: 'instant' });
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
