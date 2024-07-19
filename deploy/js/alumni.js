
$(document).ready(function () {
          
              const carousels = $('.Feed__carousel');
          
          const template = (item) => {
            const node = $('<div>').addClass('Feed__item').html(`
              <img src="${item.image}" width="640" height="640" alt="">
              <div class="Feed__overlay">
                <div class="Feed__top">
                  <span class="Feed__group">
                    <span class="Feed__icon Feed__icon--instagram"></span> ${item.poster_name}
                  </span>
                </div>
                <div class="Feed__text zero">
                  ${item.message}
                </div>
                <div class="Feed__bottom">
                  <a class="Feed__group" href="${item.full_url}" target="_blank" tabindex="-1">
                    <span class="invis">View post</span>
                    <span class="Feed__icon Feed__icon--link"></span>
                  </a>
                </div>
              </div>
            `);
            return node;
          };
          
          const load = async (feed, flkty) => {
            const elements = [];
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Set timeout to 5000 ms (5 seconds)
          
            try {
              const response = await fetch(feed, { signal: controller.signal });
              clearTimeout(timeoutId);
              const json = await response.json();
              const { items } = json.posts;
              items.forEach((item) => {
                const node = template(item);
                elements.push(node[0]);
              });
              flkty.insert(elements, 0);
            } catch (error) {
              if (error.name === 'AbortError') {
                console.error('Fetch request timed out');
              } else {
                console.error('Fetch error:', error);
              }
            }
          };
          
          carousels.each(function () {
            const element = $(this);
            const carousel = element.find('.slider').get(0);
            const feed = element.data('feed');
            const flkty = new Flickity(carousel, {
              imagesLoaded: true,
              pageDots: true,
              contain: true,
              groupCells: true,
              resize: false,
              wrapAround: true,
              accessibility: false,
            });
          
            if (feed) load(feed, flkty);
            $(window).on('load', function () {
              flkty.resize();
            });
          
            flkty.on('change', function (index) {
              const activeSlides = $(carousel).find('.is-selected');
              const links = $(carousel).find('a[tabindex]');
              links.attr('tabindex', '-1');
              activeSlides.find('a').attr('tabindex', '0');
              updateStatus();
            });
          
            const onResize = () => {
              flkty.resize();
              const activeSlides = $(carousel).find('.is-selected');
              const links = $(carousel).find('a[tabindex]');
              links.attr('tabindex', '-1');
              activeSlides.find('a').attr('tabindex', '0');
              setTimeout(function () {
                $(carousel).addClass('loaded');
              }, 500);
            };
          
            $(window).on('resize', onResize);
          
            $(window).on('load', function () {
              onResize();
              $(carousel).removeClass('loaded');
              setTimeout(function () {
                $(carousel).addClass('loaded');
              }, 500);
            });
          });
          
          
            $('.ImageSlider').each(function() {
              var $element = $(this);
              var $carousel = $element.find('.slider');
              var flkty = new Flickity($carousel[0], {
                cellAlign: 'center',
                pageDots: true,
                prevNextButtons: true,
                wrapAround: true,
                accessibility: false,
              });
          
              flkty.resize;
              flkty.on('change', function(index) {
                var $activeSlides = $carousel.find('.is-selected');
                var $links = $carousel.find('a[tabindex]');
                if ($links.length) {
                  $links.attr('tabindex', '-1');
                }
                $activeSlides.each(function() {
                  var $activeLink = $(this).find('a');
                  if ($activeLink.length) {
                    $activeLink.attr('tabindex', '0');
                  }
                });
              });
          
              $(window).on('load', function() {
                flkty.resize;
                $(window).trigger('resize');
                var $activeSlides = $carousel.find('.is-selected');
                var $links = $carousel.find('a[tabindex]');
                if ($links.length) {
                  $links.attr('tabindex', '-1');
                }
                $activeSlides.each(function() {
                  var $activeLink = $(this).find('a');
                  if ($activeLink.length) {
                    $activeLink.attr('tabindex', '0');
                  }
                });
                setTimeout(function() {
                  $carousel.addClass('loaded');
                });
              });
          
              $(window).on('resize', function() {
                $carousel.removeClass('loaded');
                setTimeout(function() {
                  $carousel.addClass('loaded');
                }, 500);
              });
            });
          
            $('.TestimonialSlider').each(function() {
              var $element = $(this);
              var $carousel = $element.find('.slider');
              var flkty = new Flickity($carousel[0], {
                cellAlign: 'center',
                pageDots: true,
                prevNextButtons: true,
                wrapAround: true,
                accessibility: false,
              });
          
              flkty.resize;
              flkty.on('change', function(index) {
                var $activeSlides = $carousel.find('.is-selected');
                var $links = $carousel.find('a[tabindex]');
                if ($links.length) {
                  $links.attr('tabindex', '-1');
                }
                $activeSlides.each(function() {
                  var $activeLink = $(this).find('a');
                  if ($activeLink.length) {
                    $activeLink.attr('tabindex', '0');
                  }
                });
              });
          
              $(window).on('load', function() {
                flkty.resize;
                $(window).trigger('resize');
                var $activeSlides = $carousel.find('.is-selected');
                var $links = $carousel.find('a[tabindex]');
                if ($links.length) {
                  $links.attr('tabindex', '-1');
                }
                $activeSlides.each(function() {
                  var $activeLink = $(this).find('a');
                  if ($activeLink.length) {
                    $activeLink.attr('tabindex', '0');
                  }
                });
                setTimeout(function() {
                  $carousel.addClass('loaded');
                });
              });
          
              $(window).on('resize', function() {
                $carousel.removeClass('loaded');
                setTimeout(function() {
                  $carousel.addClass('loaded');
                }, 500);
              });
            });
          
              $('button.content-activate-symbol').click(function(){
                $('.button.content-activate-symbol').not(this).removeClass('active');
                $(this).toggleClass('active');
                $('button.content-activate-symbol').not(this).parent('div.content-image-overlay').removeClass('active');
                $(this).parent('div.content-image-overlay').toggleClass('active');
              })
            });

            document.addEventListener('DOMContentLoaded', function() {
                const scrollArrowElement = document.querySelector('.uao-scroll-arrow');
                if (scrollArrowElement) {
                    scrollArrowElement.addEventListener('click', function() {
                        const fullOverlayElement = document.querySelector('.full-overlay');
                        if (fullOverlayElement) {
                            const overlayBottom = fullOverlayElement.getBoundingClientRect().bottom + window.scrollY;
                            window.scrollTo({
                                top: overlayBottom,
                                behavior: 'smooth'
                            });
                        }
                    });
                }
            });
            