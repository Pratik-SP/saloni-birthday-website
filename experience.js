/* Phase 1 interaction foundation. Later chapters can register milestones without adding a state library. */
(() => {
  const milestones = window.BIRTHDAY_CONTENT.milestones;
  const state = { completed: new Set(), statsAnimated: false };
  const authorityConfig = window.BIRTHDAY_CONTENT.authority;
  const authorityState = { respectStatus: authorityConfig.respectStatus };
  const progress = document.querySelector('.experience-progress');
  const progressFill = document.querySelector('#experienceProgressFill');
  const progressLabel = document.querySelector('#experienceProgressLabel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ElderBrotherAuthority = {
    get state() {
      return { ...authorityConfig, ...authorityState, seniority: window.BIRTHDAY_CONTENT.seniority };
    },
    setRespectStatus(status) {
      authorityState.respectStatus = status;
      this.render();
    },
    respectPrompt() {
      return 'Respect level: insufficient. Add ' + window.BIRTHDAY_CONTENT.seniority + ' and try again.';
    },
    render() {
      const authority = this.state;
      document.querySelectorAll('[data-authority-badge]').forEach((target) => {
        target.innerHTML = '<strong>+' + authority.seniority.replace(' years', '') + '</strong> years older<br />respect ' + authority.respectStatus;
      });
      document.querySelectorAll('[data-authority-title]').forEach((target) => {
        target.textContent = 'Age advantage: ' + authority.seniority + '.';
      });
      document.querySelectorAll('[data-authority-copy]').forEach((target) => {
        target.textContent = authority.authorityText + ' Respect is ' + authority.respectStatus + '.';
      });
      document.querySelectorAll('[data-authority-footer]').forEach((target) => {
        target.textContent = authority.seniority + ' older / respect: ' + authority.respectStatus;
      });
    }
  };
  window.ElderBrotherAuthority = ElderBrotherAuthority;
  ElderBrotherAuthority.render();
  document.querySelectorAll('[data-birthday-age]').forEach((target) => {
    target.textContent = String(window.BIRTHDAY_CONTENT.age);
  });

  function renderProgress() {
    const complete = state.completed.size;
    const percent = Math.round((complete / milestones.length) * 100);
    if (progressFill) {
      progressFill.style.width = percent + '%';
      progressFill.setAttribute('aria-valuenow', String(percent));
    }
    if (progressLabel) progressLabel.textContent = 'system progress ' + complete + '/' + milestones.length;
    if (progress) progress.dataset.theme = complete > 3 ? 'light' : 'dark';
  }

  function mark(name) {
    if (!milestones.includes(name) || state.completed.has(name)) return;
    state.completed.add(name);
    renderProgress();
  }

  function reset() {
    state.completed.clear();
    state.statsAnimated = false;
    authorityState.respectStatus = authorityConfig.respectStatus;
    ElderBrotherAuthority.render();
    window.Phase2?.reset?.();
    document.querySelectorAll('.achievement.is-revealed').forEach(card => {
      card.classList.remove('is-revealed');
      card.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.reveal-target.is-visible').forEach(target => target.classList.remove('is-visible'));
    document.querySelectorAll('.step').forEach((step, index) => step.classList.toggle('active', index === 0));
    renderProgress();
  }

  window.Experience = { state, mark, reset, milestones };
  renderProgress();

  const observedSections = {
    '#profile': 'profile',
    '#audit': 'audit',
    '#diary': 'diary',
    '#locker': 'evidence',
    '#achievements': 'achievements',
    '#final': 'roast',
    '#heartfelt': 'heartfelt'
  };

  Object.entries(observedSections).forEach(([selector, milestone]) => {
    const section = document.querySelector(selector);
    if (section) {
      section.dataset.milestone = milestone;
      section.querySelector(':scope > .wrap')?.setAttribute('data-milestone', milestone);
    }
  });

  document.querySelectorAll('.chapter > .wrap').forEach((target) => target.classList.add('reveal-target'));

  function animateStats() {
    if (state.statsAnimated) return;
    state.statsAnimated = true;
    document.querySelectorAll('#stats .stat').forEach((stat) => {
      const valueNode = stat.querySelector('.stat-top span:last-child');
      const meter = stat.querySelector('.meter i');
      if (!valueNode || !meter) return;
      const match = valueNode.textContent.match(/\d+/);
      if (!match) return;
      const target = Number(match[0]);
      const suffix = valueNode.textContent.slice(match[0].length);
      if (reducedMotion) {
        valueNode.textContent = target + suffix;
        meter.style.width = Math.min(target, 100) + '%';
        return;
      }
      valueNode.textContent = '0' + suffix;
      meter.style.width = '0%';
      requestAnimationFrame(() => { meter.style.width = Math.min(target, 100) + '%'; });
      const started = performance.now();
      const tick = (now) => {
        const progressValue = Math.min((now - started) / 700, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        valueNode.textContent = Math.round(target * eased) + suffix;
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      const milestone = entry.target.dataset.milestone;
      if (milestone && milestone !== 'protocol') mark(milestone);
      if (entry.target.closest('#stats')) animateStats();
      observer.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' }) : null;

  document.querySelectorAll('.reveal-target').forEach((target) => {
    if (reducedMotion) target.classList.add('is-visible');
    else if (observer) observer.observe(target);
    else target.classList.add('is-visible');
  });

  document.querySelectorAll('.achievement').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-revealed')) mark('achievements');
    });
  });

  document.querySelector('#next')?.addEventListener('click', () => {
    const steps = document.querySelectorAll('.step');
    if (steps.length && [...steps].every(step => step.classList.contains('active'))) mark('protocol');
  });
  document.querySelector('#plateReveal')?.addEventListener('click', () => mark('evidence'));

  document.querySelector('#replay')?.addEventListener('click', () => {
    reset();
    window.setTimeout(() => window.location.reload(), 80);
  });
})();
