/* Phase 4 presentation layer. Visual state only; no personal data or persistence. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = $('.top');
  const sections = [...document.querySelectorAll('main > .chapter')];
  const navLinks = [...document.querySelectorAll('.top-links a')];
  const state = { activeSection: '', lightboxOpen: false, lastFocus: null };

  document.documentElement.classList.add('js');

  const chapterIndicator = document.createElement('div');
  chapterIndicator.className = 'phase4-chapter-indicator';
  chapterIndicator.setAttribute('aria-live', 'polite');
  chapterIndicator.setAttribute('aria-label', 'Current chapter');
  chapterIndicator.textContent = 'SALONI.EXE / READY';
  top?.appendChild(chapterIndicator);

  sections.forEach((section, index) => {
    section.classList.add('phase4-chapter');
    section.dataset.chapterIndex = String(index + 1).padStart(2, '0');
    section.querySelector('.label')?.classList.add('phase4-reveal');
    section.querySelector('h2')?.classList.add('phase4-reveal');
  });

  function setActiveSection(section) {
    if (!section || state.activeSection === section.id) return;
    state.activeSection = section.id;
    const label = section.querySelector('.label')?.textContent?.trim() || section.id;
    chapterIndicator.textContent = `${section.dataset.chapterIndex || '--'} / ${label}`;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === '#' + section.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  const chapterObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('phase4-entered');
      setActiveSection(entry.target);
    });
  }, { threshold: .2, rootMargin: '-12% 0px -62% 0px' }) : null;

  sections.forEach((section) => {
    if (reducedMotion) section.classList.add('phase4-entered');
    else chapterObserver?.observe(section);
  });
  if (!chapterObserver && sections[0]) sections[0].classList.add('phase4-entered');

  const plateImage = $('#plateImage img');
  const plateCard = $('#evidence .evidence');
  let dialog;

  function closeLightbox() {
    if (!dialog) return;
    state.lightboxOpen = false;
    if (dialog.open) dialog.close();
    document.body.classList.remove('phase4-lightbox-open');
    state.lastFocus?.focus?.();
  }

  function openLightbox() {
    if (!dialog || !plateImage) return;
    state.lastFocus = document.activeElement;
    state.lightboxOpen = true;
    dialog.showModal();
    document.body.classList.add('phase4-lightbox-open');
    $('#phase4LightboxClose')?.focus();
  }

  function setupLightbox() {
    if (!plateImage || !plateCard) return;
    plateImage.classList.add('archive-photo');
    plateImage.setAttribute('tabindex', '0');
    plateImage.setAttribute('role', 'button');
    plateImage.setAttribute('aria-label', 'Open The Plate Incident photo');
    dialog = document.createElement('dialog');
    dialog.className = 'phase4-lightbox';
    dialog.id = 'phase4Lightbox';
    dialog.setAttribute('aria-labelledby', 'phase4LightboxTitle');
    dialog.innerHTML = '<div class="phase4-lightbox-inner"><button class="btn dark phase4-lightbox-close" id="phase4LightboxClose" type="button" aria-label="Close photo viewer">Close</button><div class="kicker">CASE FILE #001 / PHOTO ARCHIVE</div><h2 id="phase4LightboxTitle">The Plate Incident</h2><img src="' + plateImage.currentSrc + '" alt="' + plateImage.alt + '" /><p>Evidence released. Subject has been advised to cooperate.</p></div>';
    document.body.appendChild(dialog);
    const trigger = document.createElement('button');
    trigger.className = 'btn phase4-photo-button';
    trigger.type = 'button';
    trigger.textContent = 'OPEN PHOTO ARCHIVE';
    trigger.addEventListener('click', openLightbox);
    $('#plateImage')?.appendChild(trigger);
    plateImage.addEventListener('error', () => {
      plateImage.hidden = true;
      trigger.disabled = true;
      trigger.textContent = 'PHOTO UNAVAILABLE';
      trigger.setAttribute('aria-label', 'Photo unavailable');
      plateCard.querySelector('.archive-meta').textContent = 'PHOTO ARCHIVE / ADDITIONAL EVIDENCE PENDING';
    }, { once: true });
    trigger.setAttribute('aria-controls', dialog.id);
    plateImage.addEventListener('click', openLightbox);
    plateImage.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); }
    });
    $('#phase4LightboxClose')?.addEventListener('click', closeLightbox);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeLightbox(); });
  }

  function setupArchiveMeta() {
    if (!plateCard || plateCard.querySelector('.archive-meta')) return;
    const meta = document.createElement('div');
    meta.className = 'archive-meta';
    meta.textContent = 'PHOTO ARCHIVE / 01 AVAILABLE / ADDITIONAL EVIDENCE PENDING';
    plateCard.prepend(meta);
  }

  setupArchiveMeta();
  setupLightbox();

  window.Phase4 = {
    reset() {
      closeLightbox();
      state.activeSection = '';
      sections.forEach((section) => section.classList.remove('phase4-entered'));
      navLinks.forEach((link) => { link.classList.remove('is-active'); link.removeAttribute('aria-current'); });
      if (chapterIndicator) chapterIndicator.textContent = 'SALONI.EXE / READY';
      if (reducedMotion) sections.forEach((section) => section.classList.add('phase4-entered'));
    }
  };
})();
