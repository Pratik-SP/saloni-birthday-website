/* Phase 3 personal story layer. Static, local, and resettable. */
(() => {
  const content = window.BIRTHDAY_CONTENT;
  const $ = (selector) => document.querySelector(selector);
  const state = {
    diary: new Set(),
    gatheringStep: 0,
    callReviewed: false,
    futureReviewed: false,
    evidence: new Set(),
    reviewSubmitted: false
  };
  const mark = (milestone) => window.Experience?.mark?.(milestone);
  const text = (value) => String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const labels = {
    '#gathering': '10 / Family gathering simulation',
    '#calls': '11 / Fictional call log',
    '#future': '12 / Hypothetical future memories',
    '#locker': '13 / Evidence locker',
    '#review': '14 / Brother performance review'
  };
  Object.entries(labels).forEach(([selector, label]) => {
    const node = document.querySelector(selector + ' .label');
    if (node) node.textContent = label;
  });

  function renderDiary() {
    const target = $('#diaryFiles');
    if (!target) return;
    target.innerHTML = content.diaryEntries.map(([title, copy], index) => `
      <button class="story-file ${state.diary.has(index) ? 'is-open' : ''}" type="button" data-diary-index="${index}" aria-expanded="${state.diary.has(index)}">
        <span class="kicker">FILE 0${index + 1} / CLASSIFIED</span><strong>${text(title)}</strong>
        <span class="file-reveal">STATUS: HIGHLY CLASSIFIED<br />ACCESS LEVEL: SONUDI ONLY<br />CONTENTS: ${text(copy)}<br />EVIDENCE: REDACTED BY BROTHER.</span>
      </button>`).join('');
    target.querySelectorAll('[data-diary-index]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.dataset.diaryIndex);
      state.diary.add(index);
      button.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      const status = $('#diaryStatus');
      if (status) status.textContent = state.diary.size === content.diaryEntries.length
        ? 'ALL FILES REVIEWED. Saloni remains a trusted secret keeper.'
        : 'FILE OPENED. Actual secrets remain safely redacted.';
      if (state.diary.size === content.diaryEntries.length) mark('diaryFiles');
    }));
  }

  const gatheringSequence = [
    'FAMILY GATHERING DETECTED.', 'SUBJECT LOCATED.', 'GREETING PROTOCOL COMPLETE.',
    'BOTH SUBJECTS DISAPPEAR FROM FAMILY ACTIVITIES.', 'QUESTION: "WHAT HAPPENED SINCE WE LAST TALKED?"',
    'TOPIC 01 / LIFE UPDATE', 'TOPIC 02 / FAMILY GOSSIP', 'TOPIC 03 / SOMETHING RANDOM',
    'TOPIC 04 / AN OLD STORY', 'TOPIC 05 / A COMPLETELY UNRELATED SUBJECT',
    'TOPIC 06 / SOMEHOW ANOTHER STORY', 'PARENTAL ANALYSIS: "HOW DO THEY HAVE THIS MUCH TO TALK ABOUT?"',
    'FAMILY STATUS: STILL TALKING. ANSWER: WE DON’T KNOW.'
  ];
  function renderGathering() {
    const output = $('#gatheringOutput');
    const button = $('#gatheringButton');
    const status = $('#gatheringStatus');
    const topics = $('#gatheringTopics');
    if (!output || !button || !status || !topics) return;
    if (!state.gatheringStep) {
      output.textContent = 'Press advance to begin the simulation.';
      button.disabled = false;
      button.textContent = 'ADVANCE SIMULATION';
      status.textContent = 'PENDING.';
      topics.textContent = 'Topics unlocked: 0';
      return;
    }
    output.textContent = gatheringSequence[state.gatheringStep - 1];
    const topicCount = Math.max(0, Math.min(state.gatheringStep - 5, 6));
    topics.textContent = 'Topics unlocked: ' + topicCount;
    status.textContent = state.gatheringStep === gatheringSequence.length ? 'STILL TALKING.' : 'IN PROGRESS.';
    button.disabled = state.gatheringStep >= gatheringSequence.length;
    button.textContent = button.disabled ? 'SIMULATION COMPLETE' : 'ADVANCE SIMULATION';
  }
  $('#gatheringButton')?.addEventListener('click', () => {
    if (state.gatheringStep >= gatheringSequence.length) return;
    state.gatheringStep += 1;
    renderGathering();
    if (state.gatheringStep === gatheringSequence.length) mark('gathering');
  });

  function renderCalls() {
    const target = $('#callLog');
    if (!target) return;
    target.innerHTML = content.callLog.map(([caller, reason], index) => `<article class="call-entry"><span class="kicker">SIMULATED CALL 0${index + 1}</span><strong>${text(caller)}</strong><p>Reason: "${text(reason)}"</p></article>`).join('');
  }
  $('#callConclusion')?.addEventListener('click', () => {
    state.callReviewed = true;
    const output = $('#callOutput');
    if (output) output.textContent = 'CALL CONCLUSION: THERE WAS NEVER JUST ONE THING.';
    const button = $('#callConclusion');
    if (button) { button.disabled = true; button.textContent = 'CONCLUSION FILED'; }
    mark('calls');
  });

  function renderFuture() {
    const target = $('#futureMemories');
    if (!target) return;
    target.innerHTML = content.futureMemories.map(([slot, title, status], index) => `<article class="future-slot ${state.futureReviewed ? 'is-open' : ''}"><span class="kicker">${text(slot)}</span><h3>${text(title)}</h3><p>Status: ${text(status)}.</p>${index === 6 ? '<span class="redact">[ SPECIFIC EVENT NOT INVENTED ]</span>' : ''}</article>`).join('');
  }
  $('#futureButton')?.addEventListener('click', () => {
    state.futureReviewed = true;
    renderFuture();
    const output = $('#futureOutput');
    if (output) output.textContent = 'FUTURE FILES REVIEWED. Plans remain hypothetical; more memories remain possible.';
    const button = $('#futureButton');
    if (button) { button.disabled = true; button.textContent = 'FILES REVIEWED'; }
    mark('future');
  });

  function renderEvidence() {
    const target = $('#evidenceExhibits');
    if (!target) return;
    target.innerHTML = content.evidenceExhibits.map(([title, copy], index) => `<button class="evidence-exhibit ${state.evidence.has(index) ? 'is-open' : ''}" type="button" data-evidence-index="${index}" aria-expanded="${state.evidence.has(index)}"><span class="kicker">${text(title)}</span><span>${state.evidence.has(index) ? text(copy) : 'SELECT TO INSPECT'}</span></button>`).join('');
    target.querySelectorAll('[data-evidence-index]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.dataset.evidenceIndex);
      state.evidence.add(index);
      renderEvidence();
      const output = $('#evidenceOutput');
      if (output) output.textContent = state.evidence.size === content.evidenceExhibits.length ? 'ALL EXHIBITS REVIEWED. The archive remains suspiciously limited.' : 'EXHIBIT OPENED. Evidence is fictional, but the pattern is undeniable.';
      if (state.evidence.size === content.evidenceExhibits.length) mark('evidenceExhibits');
    }));
  }

  function renderReview() {
    const grid = document.querySelector('#review .review-grid');
    if (!grid) return;
    grid.innerHTML = content.reviewCategories.map(([name, score]) => `<div class="review-row"><span>${text(name)}</span><span class="review-score">${text(score)}${typeof score === 'number' ? '/100' : ''}</span></div>`).join('');
    const section = $('#review .wrap');
    if (!section || $('#reviewButton')) return;
    const button = document.createElement('button');
    button.className = 'btn primary';
    button.id = 'reviewButton';
    button.type = 'button';
    button.textContent = 'SUBMIT PERFORMANCE REVIEW';
    const output = document.createElement('div');
    output.className = 'console-output';
    output.id = 'reviewOutput';
    output.setAttribute('role', 'status');
    output.setAttribute('aria-live', 'polite');
    output.textContent = 'Review pending.';
    section.append(button, output);
    button.addEventListener('click', () => {
      state.reviewSubmitted = true;
      output.textContent = 'OVERALL PERFORMANCE: SUSPICIOUSLY ACCEPTABLE. Emotional support: 100/100. General nonsense: ongoing.';
      button.disabled = true;
      button.textContent = 'REVIEW FILED';
      mark('review');
    });
  }

  function reset() {
    state.diary.clear();
    state.gatheringStep = 0;
    state.callReviewed = false;
    state.futureReviewed = false;
    state.evidence.clear();
    state.reviewSubmitted = false;
    renderDiary();
    if ($('#diaryStatus')) $('#diaryStatus').textContent = 'Select a file. The system will reveal nothing useful.';
    renderGathering();
    renderCalls();
    renderFuture();
    renderEvidence();
    const callButton = $('#callConclusion');
    if (callButton) { callButton.disabled = false; callButton.textContent = 'ANALYZE CONCLUSION'; }
    if ($('#callOutput')) $('#callOutput').textContent = 'Conclusion pending.';
    if ($('#futureOutput')) $('#futureOutput').textContent = 'Future files are hypothetical and currently locked.';
    if ($('#evidenceOutput')) $('#evidenceOutput').textContent = 'Select an exhibit to inspect the evidence.';
    const reviewButton = $('#reviewButton');
    if (reviewButton) { reviewButton.disabled = false; reviewButton.textContent = 'SUBMIT PERFORMANCE REVIEW'; }
    if ($('#reviewOutput')) $('#reviewOutput').textContent = 'Review pending.';
  }

  renderDiary();
  renderGathering();
  renderCalls();
  renderFuture();
  renderEvidence();
  renderReview();
  window.Phase3 = { reset };
})();
