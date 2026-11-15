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

  // Photo viewer. When closed, the card's carousel jumps to the photo you ended on.
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbCount = document.getElementById('lightbox-count');
  var lbPrev = lb.querySelector('.prev');
  var lbNext = lb.querySelector('.next');
  var lbClose = lb.querySelector('.lightbox-close');
  var lbImgs = null;
  var lbIndex = 0;
  var lbSync = null;
  var lbOpener = null;

  function lbShow(n) {
    lbIndex = (n + lbImgs.length) % lbImgs.length;
    var src = lbImgs[lbIndex];
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt;
    lbCount.textContent = lbImgs.length > 1 ? (lbIndex + 1) + ' / ' + lbImgs.length : '';
  }

  function openLightbox(imgs, n, sync) {
    lbImgs = imgs;
    lbSync = sync;
    lbOpener = document.activeElement;
    lbPrev.hidden = lbNext.hidden = imgs.length < 2;
    lbShow(n);
    lb.classList.add('open');
    document.body.classList.add('modal-open');
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lbSync) lbSync(lbIndex);
    if (lbOpener) lbOpener.focus();
  }

  lbPrev.addEventListener('click', function () { lbShow(lbIndex - 1); });
  lbNext.addEventListener('click', function () { lbShow(lbIndex + 1); });
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbImgs.length > 1) lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight' && lbImgs.length > 1) lbShow(lbIndex + 1);
    // Keep keyboard focus inside the viewer
    if (e.key === 'Tab') {
      var focusable = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden; });
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  // Mini carousels in project cards (controls only appear when a card has 2+ photos)
  document.querySelectorAll('.mini-carousel').forEach(function (el) {
    var track = el.querySelector('.mini-track');
    var slides = el.querySelectorAll('.mini-slide');
    var imgs = el.querySelectorAll('.mini-slide img');
    var i = 0;
    var sync = null;

    // Click a photo (or press Enter on the focused carousel) to enlarge it
    el.addEventListener('click', function (e) {
      var n = Array.prototype.indexOf.call(imgs, e.target);
      if (n > -1) openLightbox(imgs, n, sync);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target === el) {
        e.preventDefault(); // otherwise the same keypress would hit the viewer's close button
        openLightbox(imgs, i, sync);
      }
    });

    if (slides.length < 2) return;

    function makeBtn(cls, label, text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mini-btn ' + cls;
      b.setAttribute('aria-label', label);
      b.innerHTML = text;
      el.appendChild(b);
      return b;
    }
    var prev = makeBtn('prev', 'Previous photo', '&#8249;');
    var next = makeBtn('next', 'Next photo', '&#8250;');
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'mini-dots';
    el.appendChild(dotsWrap);

    var dots = Array.prototype.map.call(slides, function (_, n) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Go to photo ' + (n + 1));
      d.addEventListener('click', function () { go(n); });
      dotsWrap.appendChild(d);
      return d;
    });

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      dots.forEach(function (d, k) {
        if (k === i) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== i)); });
    }

    sync = go;
    prev.addEventListener('click', function () { go(i - 1); });
    next.addEventListener('click', function () { go(i + 1); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    });

    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    go(0);
  });

  // Write-up popup
  var modal = document.getElementById('writeup-modal');
  var panel = modal.querySelector('.modal-panel');
  var closeBtn = modal.querySelector('.modal-close');
  var textBox = document.getElementById('writeup-text');
  var opener = null;
  var loaded = false;

  function loadWriteup(url) {
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then(function (text) {
        textBox.textContent = '';
        text.split(/\r?\n/).forEach(function (line) {
          if (!line.trim()) return;
          var p = document.createElement('p');
          p.textContent = line.trim();
          textBox.appendChild(p);
        });
        loaded = true;
      })
      .catch(function () {
        textBox.innerHTML = '<p>The write-up could not be loaded here. <a href="' + url + '" target="_blank" rel="noopener">Open it as a text file</a>.</p>';
      });
  }

  function openModal(trigger) {
    opener = trigger;
    if (!loaded) loadWriteup(trigger.getAttribute('href'));
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    panel.scrollTop = 0;
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (opener) opener.focus();
  }

  document.querySelector('[data-writeup-open]').addEventListener('click', function (e) {
    e.preventDefault();
    openModal(this);
  });
  closeBtn.addEventListener('click', closeModal);

  // Close when clicking the dimmed area, but not when a text selection drag ends outside the panel
  var pressedBackdrop = false;
  modal.addEventListener('mousedown', function (e) { pressedBackdrop = e.target === modal; });
  modal.addEventListener('click', function (e) {
    if (e.target === modal && pressedBackdrop) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    // Keep keyboard focus inside the popup
    if (e.key === 'Tab') {
      var focusable = modal.querySelectorAll('button, a[href]');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
})();
