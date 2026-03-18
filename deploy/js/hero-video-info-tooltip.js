;(function() {
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

  infoButton.addEventListener('mouseenter', showTooltip);
  infoButton.addEventListener('focus', showTooltip);

  infoButton.addEventListener('mouseleave', hideTooltip);
  infoButton.addEventListener('blur', hideTooltip);

  infoButton.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideTooltip();
      infoButton.focus();
    }
  });
})();
