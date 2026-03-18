;(function() {
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
        if (close) close.addEventListener('click', remove);
      };

      var init = function() {
        build();
        listen();
      };

      init();
    });
  }

  var targets = document.querySelectorAll('[data-automodal]');
  for (var i = 0; i < targets.length; i++) {
    automodal(targets[i]);
  }
})();
