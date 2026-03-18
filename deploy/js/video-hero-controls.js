;(function() {
  'use strict';

  const motionQuery = matchMedia('(prefers-reduced-motion)');

  const videoHeroControls = document.querySelectorAll('.luc-hero__control--video-hero');

  for (const control of videoHeroControls) {
    const hero = control.closest('.luc-hero');
    const video = hero && hero.querySelector('.luc-hero__video-hero-player');

    if (video && hero) {
      const srText = document.createElement('span');
      srText.className = 'luc-screen-reader-text';
      srText.textContent = 'Pause Video';
      control.appendChild(srText);

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
