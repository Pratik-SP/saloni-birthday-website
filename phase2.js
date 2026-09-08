/* Phase 2 reactive mini-experiences. No device access, network work, or persistence. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = new Set();
  const $ = (selector) => document.querySelector(selector);
  const notify = (message) => {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.phase2ToastTimer);
    window.phase2ToastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };
  const authority = () => window.ElderBrotherAuthority?.state || { seniority: '1.5 years' };

  const phaseLabels = {
    '#diary': '08 / Classified information',
    '#waiting': '09 / Suspense department',
    '#locker': '10 / Evidence locker',
    '#review': '11 / Brother performance review',
    '#achievements': '12 / Achievements unlocked',
    '#final': '13 / Final roast sequence',
    '#heartfelt': '14 / No jokes for one minute'
  };
  Object.entries(phaseLabels).forEach(([selector, label]) => {
    const target = document.querySelector(selector + ' .label');
    if (target) target.textContent = label;
  });

  function clearTimers() {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  }

  const speakerButton = $('#speakerBtn');
  const speakerOutput = $('#speakerOut');
  const speakerAppeal = $('#speakerFinal');
  let speakerAttempt = 0;
  const speakerStates = [
    ['REQUEST RECEIVED.\nACCESS DENIED.\nReason: Elder Brother Authority rejected the request.', 'REQUEST AGAIN'],
    ['REQUEST RECEIVED.\nACCESS DENIED.\nReason: Pratik is becoming more suspicious.', 'REQUEST AGAIN'],
    ['REQUEST RECEIVED.\nSYSTEM NOTICE.\nWhy are you still trying?', 'TRY ONE MORE TIME'],
    ['FINAL WARNING.\nAUTHORIZATION REQUIRED.\nYour appeal is being reviewed by someone 1.5 years older.', 'FINAL REQUEST'],
    ['AUTHORIZATION PERMANENTLY DENIED.\nAppeal rejected because Pratik is older by ' + authority().seniority + '.', 'REQUEST LOCKED']
  ];

  function renderSpeaker() {
    const state = speakerStates[Math.min(speakerAttempt, speakerStates.length) - 1];
    if (!state || !speakerOutput || !speakerButton) return;
    speakerOutput.textContent = state[0];
    speakerButton.textContent = state[1];
    const locked = speakerAttempt >= speakerStates.length;
    speakerButton.disabled = locked;
    if (locked) speakerButton.setAttribute('aria-disabled', 'true');
    if (speakerAppeal) {
      speakerAppeal.textContent = locked ? 'APPEAL REJECTED' : 'Appeal decision';
      speakerAppeal.disabled = locked;
    }
  }

  speakerButton?.addEventListener('click', () => {
    if (speakerAttempt >= speakerStates.length) return;
    speakerAttempt += 1;
    renderSpeaker();
    if (speakerAttempt === speakerStates.length) {
      window.Experience?.mark('speakerphone');
      notify('Speakerphone authorization permanently denied.');
    }
  });
  speakerAppeal?.addEventListener('click', () => notify('Appeal rejected. Pratik is older by ' + authority().seniority + '.'));

  const laterButton = $('#laterBtn');
  const laterOutput = $('#laterOut');
  let waitingComplete = false;
  const waitingSequence = [
    'REQUEST RECEIVED.',
    'PREPARING MESSAGE...',
    'CHECKING WHETHER PRATIK IS READY...',
    '3',
    '2',
    '1',
    'DELIVERY INTERRUPTED.',
    'MESSAGE POSTPONED.'
  ];

  function finishWaiting() {
    waitingComplete = true;
    if (laterButton) {
      laterButton.textContent = 'MESSAGE POSTPONED';
      laterButton.disabled = true;
    }
    if (laterOutput) laterOutput.textContent = 'HAHA. NOW YOU KNOW HOW IT FEELS.\n\nYou hate suspense. I know.';
    window.Experience?.mark('waiting');
  }

  function runWaiting() {
    if (!laterButton || !laterOutput || waitingComplete) return;
    clearTimers();
    laterButton.disabled = true;
    laterButton.textContent = 'PROCESSING...';
    if (reducedMotion) {
      waitingSequence.forEach((message, index) => {
        const timer = setTimeout(() => {
          laterOutput.textContent = message;
          if (index === waitingSequence.length - 1) {
            const revealTimer = setTimeout(finishWaiting, 0);
            timers.add(revealTimer);
          }
          timers.delete(timer);
        }, 0);
        timers.add(timer);
      });
      return;
    }
    waitingSequence.forEach((message, index) => {
      const timer = setTimeout(() => {
        laterOutput.textContent = message;
        if (index === waitingSequence.length - 1) {
          const revealTimer = setTimeout(finishWaiting, 240);
          timers.add(revealTimer);
        }
        timers.delete(timer);
      }, index * 360);
      timers.add(timer);
    });
  }
  laterButton?.addEventListener('click', runWaiting);

  let dojuStep = 0;
  const dojuButton = $('#dojuButton');
  const dojuOutput = $('#dojuOutput');
  const dojuVerdict = $('#dojuVerdict');
  const dojuEvidence = [
    'EXHIBIT A: Pratik claims original invention.',
    'EXHIBIT B: Saloni now uses the word more.',
    'EXHIBIT C: Usage statistics are fake, but suspiciously unfavorable to Pratik.'
  ];
  function runDoju() {
    if (!dojuButton || !dojuOutput || !dojuVerdict) return;
    if (dojuStep < dojuEvidence.length) {
      dojuOutput.textContent = dojuEvidence[dojuStep];
      dojuStep += 1;
      dojuButton.textContent = dojuStep === dojuEvidence.length ? 'DELIVER VERDICT' : 'PRESENT NEXT EXHIBIT';
      return;
    }
    dojuOutput.textContent = 'VERDICT: GUILTY OF INTELLECTUAL THEFT.\nSentence: continue using "doju" while acknowledging the original inventor.';
    dojuVerdict.textContent = 'GUILTY. Obviously.';
    dojuButton.textContent = 'CASE CLOSED';
    dojuButton.disabled = true;
    window.Experience?.mark('doju');
  }
  dojuButton?.addEventListener('click', runDoju);

  let facialStep = 0;
  const facialButton = $('#facialButton');
  const facialOutput = $('#facialOutput');
  const facialVerdict = $('#facialVerdict');
  const facialScans = [
    'DIAGNOSTIC: Area directly below nose selected.',
    'Mouth control scan inconclusive. Speakerphone enthusiasm dangerously high.',
    'Possible classifications: MOLE / BOOGER / PRATIK BEING ANNOYING.',
    'FINAL DIAGNOSIS: Pratik being annoying is the statistically safest answer.'
  ];
  function runFacial() {
    if (!facialButton || !facialOutput || !facialVerdict) return;
    facialOutput.textContent = facialScans[Math.min(facialStep, facialScans.length - 1)];
    facialStep += 1;
    if (facialStep >= facialScans.length) {
      facialVerdict.textContent = 'DIAGNOSIS COMPLETE: #3';
      facialButton.textContent = 'SCAN COMPLETE';
      facialButton.disabled = true;
      window.Experience?.mark('facial');
    } else {
      facialButton.textContent = 'CONTINUE SCAN';
    }
  }
  facialButton?.addEventListener('click', runFacial);

  window.Phase2 = {
    reset() {
      clearTimers();
      clearTimeout(window.phase2ToastTimer);
      const toast = $('#toast');
      if (toast) toast.classList.remove('show');
      speakerAttempt = 0;
      waitingComplete = false;
      dojuStep = 0;
      facialStep = 0;
      if (speakerOutput) speakerOutput.innerHTML = 'Personal history detected.<br />Previous incidents detected.<br />Request status: DENIED.';
      if (speakerButton) { speakerButton.disabled = false; speakerButton.removeAttribute('aria-disabled'); speakerButton.textContent = 'REQUEST AGAIN'; }
      if (speakerAppeal) { speakerAppeal.disabled = false; speakerAppeal.textContent = 'Appeal decision'; }
      if (laterOutput) laterOutput.textContent = 'Press the button to experience a small amount of psychological damage.';
      if (laterButton) { laterButton.disabled = false; laterButton.textContent = 'Tell me something'; }
      if (dojuOutput) dojuOutput.textContent = 'Case opened. Present Exhibit A.';
      if (dojuVerdict) dojuVerdict.textContent = 'Verdict pending.';
      if (dojuButton) { dojuButton.disabled = false; dojuButton.textContent = 'PRESENT EXHIBIT A'; }
      if (facialOutput) facialOutput.textContent = 'Press scan to inspect the selected area.';
      if (facialVerdict) facialVerdict.textContent = 'Diagnostic pending.';
      if (facialButton) { facialButton.disabled = false; facialButton.textContent = 'RUN DIAGNOSTIC'; }
    }
  };
})();
