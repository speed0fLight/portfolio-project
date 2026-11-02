(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Featured project carousel
  var carousel = document.getElementById('rover-carousel');
  var track = carousel.querySelector('.carousel-track');
  var slides = carousel.querySelectorAll('.slide');
  var caption = document.querySelector('.carousel-caption');
  var count = document.querySelector('.carousel-count');
  var dotsWrap = document.querySelector('.carousel-dots');
  var index = 0;

  var dots = Array.prototype.map.call(slides, function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Go to photo ' + (i + 1));
    b.addEventListener('click', function () { show(i); });
    dotsWrap.appendChild(b);
    return b;
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * index) + '%)';
    caption.textContent = slides[index].getAttribute('data-caption') || '';
    count.textContent = (index + 1) + ' / ' + slides.length;
    dots.forEach(function (d, n) {
      if (n === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    slides.forEach(function (s, n) { s.setAttribute('aria-hidden', String(n !== index)); });
  }

  carousel.querySelector('.prev').addEventListener('click', function () { show(index - 1); });
  carousel.querySelector('.next').addEventListener('click', function () { show(index + 1); });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(index - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(index + 1); e.preventDefault(); }
  });

  // Swipe on touch screens
  var startX = null;
  carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  show(0);
})();
