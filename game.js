/* Saloni.exe: one in-memory mission engine for the complete birthday game. */
(() => {
  const content = window.BIRTHDAY_CONTENT;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const authorityState = { respectStatus: content.authority.respectStatus };
  const ElderBrotherAuthority = {
    get state() { return { ...content.authority, ...authorityState, seniority: content.seniority, brother: content.brother }; },
    respectPrompt() { return 'Respect level: insufficient. Add ' + content.seniority + ' and try again.'; },
    render() {
      const authority = this.state;
      document.querySelectorAll('[data-authority]').forEach(node => {
        node.textContent = `SENIORITY: +${authority.seniority} / AUTHORITY: QUESTIONABLE / RESPECT: ${authority.respectStatus}`;
      });
    }
  };
  window.ElderBrotherAuthority = ElderBrotherAuthority;

  const missions = [
    { id: 'boot', number: 1, title: 'SALONI.EXE', theme: 'blue', description: 'Birthday system initialization.', render: renderBoot, reward: 'SURVIVED ANOTHER YEAR' },
    { id: 'audit', number: 2, title: 'CHARACTER AUDIT', theme: 'paper', description: 'Official statistics. Unofficial confidence.', render: renderAudit, reward: 'PROFESSIONAL OBSERVER' },
    { id: 'speaker', number: 3, title: 'SPEAKERPHONE AUTHORITY', theme: 'red', description: 'Present your arguments. The authority has already made up its mind.', render: renderSpeaker, reward: 'SPEAKERPHONE DISPUTE SURVIVOR' },
    { id: 'waiting', number: 4, title: 'THE WAITING ROOM', theme: 'paper', description: 'Pratik has something to tell you. Eventually.', render: renderWaiting, reward: 'SURVIVED THE SUSPENSE' },
    { id: 'gathering', number: 5, title: 'FAMILY GATHERING SIMULATOR', theme: 'acid', description: 'Locate Saloni, disappear from the group, and talk about everything.', render: renderGathering, reward: 'FAMILY GATHERING CHAMPION' },
    { id: 'diary', number: 6, title: 'THE SECRET DIARY', theme: 'blue', description: 'Open the files. Reveal absolutely nothing useful.', render: renderDiary, reward: 'SECRET KEEPER' },
    { id: 'calls', number: 7, title: 'THE CALL LOG', theme: 'blue', description: 'Reconstruct the call that was never just one thing.', render: renderCalls, reward: 'CALL SURVIVOR' },
    { id: 'evidence', number: 8, title: 'THE EVIDENCE LOCKER', theme: 'paper', description: 'Inspect the evidence that actually exists.', render: renderEvidence, reward: 'EVIDENCE LOCKER CLEARED' },
    { id: 'review', number: 9, title: 'BROTHER PERFORMANCE REVIEW', theme: 'paper', description: 'Saloni is the reviewer. Pratik is under investigation.', render: renderReview, reward: 'BROTHER NONSENSE TOLERANCE' }
  ];

  const state = {
    currentMission: 0,
    completedMissions: new Set(),
    achievements: new Set(),
    finalUnlocked: false,
    finalOpened: false,
    transient: {}
  };
  let stage;
  let map;
  let missionNumber;
  let missionTitle;
  let progressFill;
  let progressLabel;
  let toastTimer;

  function showToast(title) {
    const toast = $('#achievementToast');
    if (!toast) return;
    toast.innerHTML = `<strong>ACHIEVEMENT UNLOCKED</strong><br />${esc(title)}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), reducedMotion ? 1600 : 2800);
  }

  function award(title) {
    if (state.achievements.has(title)) return;
    state.achievements.add(title);
    showToast(title);
  }

  function updateHud() {
    const completed = state.completedMissions.size;
    const current = missions[state.currentMission];
    const number = current ? String(current.number).padStart(2, '0') : '09';
    missionNumber.textContent = `MISSION ${number} / 09`;
    missionTitle.textContent = current ? current.title : 'ALL MISSIONS COMPLETE';
    progressLabel.textContent = `${completed} / 09 COMPLETE`;
    progressFill.style.width = `${Math.round((completed / missions.length) * 100)}%`;
    map.querySelectorAll('.mission-item').forEach((item, index) => {
      const complete = state.completedMissions.has(index);
      const currentItem = index === state.currentMission && !state.finalUnlocked;
      item.className = 'mission-item' + (complete ? ' complete' : '') + (currentItem ? ' current' : '') + (!complete && !currentItem ? ' locked' : '');
      const status = $('.status', item);
      status.textContent = complete ? 'COMPLETE' : currentItem ? 'CURRENT' : 'LOCKED';
      item.setAttribute('aria-current', currentItem ? 'step' : 'false');
    });
    const authority = ElderBrotherAuthority.state;
    document.querySelectorAll('[data-authority]').forEach(node => {
      node.textContent = `SENIORITY: +${authority.seniority} / AUTHORITY: QUESTIONABLE / RESPECT: ${authority.respectStatus}`;
    });
  }

  function shellCard(theme, label, title, description) {
    const card = document.createElement('section');
    card.className = `mission-card ${theme}`;
    card.setAttribute('aria-labelledby', 'missionHeading');
    card.innerHTML = `<div class="label">${esc(label)}</div><h1 class="mission-title" id="missionHeading" tabindex="-1">${esc(title)}</h1><p class="mission-copy">${esc(description)}</p><div class="mission-content"></div><div class="mission-status" id="missionStatus" role="status" aria-live="polite"></div>`;
    stage.replaceChildren(card);
    return card;
  }

  function completeMission(reward) {
    const mission = missions[state.currentMission];
    if (!mission || state.completedMissions.has(state.currentMission)) return;
    state.completedMissions.add(state.currentMission);
    award(reward);
    updateHud();
    const card = $('.mission-card', stage);
    const status = $('#missionStatus', card);
    if (status) status.textContent = 'MISSION COMPLETE';
    const next = state.currentMission + 1;
    const last = next >= missions.length;
    const panel = document.createElement('div');
    panel.className = 'completion';
    panel.innerHTML = `<div class="kicker">MISSION COMPLETE</div><h2>${esc(mission.title)}</h2><p>+ MEMORY UNLOCKED<br />+ ${esc(reward)}</p><button class="btn ${last ? 'primary' : 'dark'}" id="continueMission" type="button">${last ? 'OPEN FINAL FILE' : 'CONTINUE TO MISSION ' + String(missions[next].number).padStart(2, '0')}</button>`;
    card.appendChild(panel);
    $('#continueMission', panel).focus();
    $('#continueMission', panel).addEventListener('click', () => {
      if (last) { state.finalUnlocked = true; renderFinalGate(); }
      else { state.currentMission = next; renderMission(); }
    }, { once: true });
  }

  function renderMission() {
    const mission = missions[state.currentMission];
    if (!mission) return renderFinalGate();
    updateHud();
    mission.render();
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    setTimeout(() => $('#missionHeading')?.focus(), reducedMotion ? 0 : 120);
  }

  function optionButton(label, value, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    button.innerHTML = `<span class="kicker">SELECT</span><strong>${esc(label)}</strong>${value ? `<span>${esc(value)}</span>` : ''}`;
    button.addEventListener('click', handler, { once: true });
    return button;
  }

  function renderBoot() {
    const card = shellCard('blue', 'MISSION 01 / BIRTHDAY SYSTEM INITIALIZATION', 'SALONI.EXE', 'A deliberately over-engineered birthday system built by Pratik, the elder cousin brother with exactly 1.5 years of seniority.');
    const contentNode = $('.mission-content', card);
    contentNode.innerHTML = `<div class="terminal"><strong>SUBJECT:</strong> SALONI<br /><strong>AGE:</strong> 23<br /><strong>RELATIONSHIP:</strong> COUSIN SISTER<br /><strong>SYSTEM STATUS:</strong> READY<br /><br />Calibration: hunger high. Sleepiness high. Responsibility suspiciously high.</div><div class="mission-actions"><button class="btn primary" id="initialize" type="button">INITIALIZE SALONI.EXE</button></div>`;
    $('#initialize', card).addEventListener('click', () => {
      $('#initialize', card).disabled = true;
      $('#missionStatus', card).textContent = 'INITIALIZING...\nAssessment complete. Subject is ready for nonsense.';
      setTimeout(() => completeMission(missions[0].reward), reducedMotion ? 0 : 280);
    });
  }

  function renderAudit() {
    const card = shellCard('paper', 'MISSION 02 / PERSONALITY AUDIT', 'CHARACTER AUDIT', 'Choose the official value for each highly scientific statistic. The system will reveal the truth after every answer.');
    const contentNode = $('.mission-content', card);
    const items = [
      ['How good is Saloni at keeping her mouth shut?', '2/100', ['2/100', '47/100', 'Impossible to calculate']],
      ["How good is she at keeping Pratik's secrets?", '100/100', ['12/100', '100/100', 'Classified forever']],
      ['How enthusiastic is she about speakerphone?', '99%', ['18%', '72%', '99%']],
      ['How good is she at focusing on one thing?', '17%', ['17%', '63%', 'Focus unavailable']]
    ];
    let index = 0;
    function showQuestion() {
      const item = items[index];
      contentNode.innerHTML = `<div class="question"><small>AUDIT ITEM ${index + 1} / ${items.length}</small><h3>${esc(item[0])}</h3><div class="choice-grid" id="auditChoices"></div></div>`;
      item[2].forEach(value => $('#auditChoices', contentNode).appendChild(optionButton(value, 'Select the official value', () => {
        $('#auditChoices', contentNode).querySelectorAll('button').forEach(button => { button.disabled = true; });
        const selected = [...$('#auditChoices', contentNode).children].find(button => button.querySelector('strong')?.textContent === value);
        selected?.classList.add(value === item[1] ? 'selected' : 'wrong');
        $('#missionStatus', card).textContent = `OFFICIAL VALUE: ${item[1]}\n${value === item[1] ? 'Correct. Unfortunately, your brother prepared this audit.' : 'Incorrect. The official file has overruled you.'}`;
        const next = document.createElement('button');
        next.className = 'btn dark'; next.type = 'button'; next.textContent = index === items.length - 1 ? 'COMPLETE AUDIT' : 'NEXT AUDIT ITEM';
        next.addEventListener('click', () => { index += 1; index === items.length ? finishAudit() : showQuestion(); });
        $('.mission-actions', card)?.remove();
        const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(next); card.appendChild(actions); next.focus();
      })));
    }
    function finishAudit() {
      contentNode.innerHTML = '<div class="terminal">MOUTH CONTROL: 2/100\nSECRET KEEPING: 100/100\n\nCONTRADICTION: STILL UNRESOLVED.\nFACIAL INSPECTION: mole / booger / Pratik being annoying. Diagnosis: #3.\nDOJU STATUS: original inventor still filing complaints.</div>';
      $('#missionStatus', card).textContent = 'AUDIT COMPLETE';
      card.querySelectorAll('.mission-actions').forEach(actions => actions.remove());
      const done = document.createElement('button'); done.className = 'btn dark'; done.type = 'button'; done.textContent = 'FILE AUDIT';
      done.addEventListener('click', () => completeMission(missions[1].reward), { once: true });
      const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(done); card.appendChild(actions); done.focus();
    }
    showQuestion();
  }

  function renderSpeaker() {
    const card = shellCard('red', 'MISSION 03 / ELDER BROTHER AUTHORITY', 'SPEAKERPHONE AUTHORITY', 'Saloni has requested speakerphone access. Present arguments to an authority that is older by 1.5 years.');
    const contentNode = $('.mission-content', card);
    const rounds = [
      ['Argument 01 / Make the request', ['Please?', 'Speakerphone is obviously efficient.', 'I accept the terms and conditions.']],
      ['Argument 02 / Establish credibility', ['I will behave responsibly.', 'I have a history of being persuasive.', 'I know where the button is.']],
      ['Argument 03 / Appeal the ruling', ['The call deserves freedom.', 'But what if I ask again?', 'I acknowledge your questionable authority.']],
      ['Argument 04 / Final appeal', ['One last request.', 'I surrender to seniority.', 'I will simply call normally.']]
    ];
    let index = 0;
    function showRound() {
      const round = rounds[index];
      contentNode.innerHTML = `<div class="terminal"><strong>REQUEST:</strong> SPEAKERPHONE\n<strong>AUTHORITY:</strong> ELDER COUSIN BROTHER\n<strong>SENIORITY:</strong> +${content.seniority}</div><div class="question"><small>${esc(round[0])}</small><div class="choice-grid" id="speakerChoices"></div></div>`;
      round[1].forEach(argument => $('#speakerChoices', contentNode).appendChild(optionButton(argument, 'Submit argument', () => {
        $('#speakerChoices', contentNode).querySelectorAll('button').forEach(button => button.disabled = true);
        $('#missionStatus', card).textContent = index === rounds.length - 1 ? 'FINAL WARNING. AUTHORIZATION REVIEWED.' : 'ARGUMENT RECEIVED. AUTHORITY REMAINS UNCONVINCED.';
        const next = document.createElement('button'); next.className = 'btn dark'; next.type = 'button'; next.textContent = index === rounds.length - 1 ? 'ISSUE FINAL RULING' : 'CONTINUE APPEAL';
        next.addEventListener('click', () => { index += 1; index === rounds.length ? finish() : showRound(); });
        card.querySelectorAll('.mission-actions').forEach(actions => actions.remove());
        const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(next); card.appendChild(actions); next.focus();
      })));
    }
    function finish() {
      contentNode.innerHTML = '<div class="terminal"><strong>SPEAKERPHONE ACCESS:</strong> DENIED\n\nAppeal rejected because Pratik is older by 1.5 years.\nAuthority: questionable. Decision: final.</div>';
      $('#missionStatus', card).textContent = 'AUTHORIZATION PERMANENTLY DENIED';
      card.querySelectorAll('.mission-actions').forEach(actions => actions.remove());
      const done = document.createElement('button'); done.className = 'btn dark'; done.type = 'button'; done.textContent = 'ACCEPT THE RULING';
      done.addEventListener('click', () => completeMission(missions[2].reward), { once: true });
      const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(done); card.appendChild(actions); done.focus();
    }
    showRound();
  }

  function renderWaiting() {
    const card = shellCard('paper', 'MISSION 04 / SUSPENSE DEPARTMENT', 'THE WAITING ROOM', 'Pratik has something to tell you. He has decided to tell you later. You know this system already.');
    const contentNode = $('.mission-content', card);
    const sequence = ['REQUEST RECEIVED.', 'PREPARING MESSAGE...', 'CHECKING IF PRATIK IS READY...', '3', '2', '1', 'DELIVERY INTERRUPTED.', 'MESSAGE POSTPONED.'];
    let step = 0;
    const output = document.createElement('div'); output.className = 'terminal'; output.setAttribute('aria-live', 'polite'); contentNode.appendChild(output);
    const button = document.createElement('button'); button.className = 'btn primary'; button.type = 'button'; button.textContent = 'ENTER WAITING ROOM'; contentNode.appendChild(button);
    button.addEventListener('click', () => {
      if (step < sequence.length) {
        output.textContent = sequence[step]; step += 1;
        button.textContent = step === sequence.length ? 'REVEAL MESSAGE' : 'WAIT';
        if (step === sequence.length) {
          $('#missionStatus', card).textContent = 'ALL WAITING STATES PROCESSED. The suspense was the point.';
          button.focus();
        }
        return;
      }
      output.textContent = 'HAHA. NOW YOU KNOW HOW IT FEELS.\n\nYou hate suspense. I know.';
      button.disabled = true; button.textContent = 'MESSAGE DELIVERED';
      completeMission(missions[3].reward);
    });
  }

  function renderGathering() {
    const card = shellCard('acid', 'MISSION 05 / FAMILY GATHERING SIMULATOR', 'FAMILY GATHERING SIMULATOR', 'Locate Saloni, disappear from everyone else, and unlock the conversation that somehow never ends.');
    const contentNode = $('.mission-content', card);
    const sequence = ['FAMILY GATHERING DETECTED.', 'SALONI LOCATED.', 'GREETINGS COMPLETE.', 'SOMEHOW YOU TWO DISAPPEAR FROM EVERYONE ELSE.', '"WHAT HAPPENED SINCE WE LAST TALKED?"'];
    const topics = ['LIFE UPDATE', 'FAMILY UPDATES', 'SOMETHING RANDOM', 'QUESTIONABLE DECISIONS', 'ADVICE EXCHANGE', 'THINGS SINCE THE LAST MEETING', 'ONE COMPLETELY UNRELATED SUBJECT'];
    let step = 0;
    const output = document.createElement('div'); output.className = 'terminal'; output.setAttribute('aria-live', 'polite'); contentNode.appendChild(output);
    const count = document.createElement('div'); count.className = 'topic-count'; contentNode.appendChild(count);
    const button = document.createElement('button'); button.className = 'btn dark'; button.type = 'button'; button.textContent = 'RUN NEXT STEP'; contentNode.appendChild(button);
    button.addEventListener('click', () => {
      if (step < sequence.length) output.textContent = sequence[step];
      else if (step < sequence.length + topics.length) output.textContent = `TOPIC ${String(step - sequence.length + 1).padStart(2, '0')} / ${topics[step - sequence.length]}`;
      else output.textContent = 'PARENTS STATUS: SUSPICIOUS.\nCONVERSATION STATUS: STILL GOING.\n\nFINAL: STILL TALKING.';
      step += 1;
      count.textContent = `CONVERSATION TOPICS UNLOCKED: ${Math.max(0, Math.min(step - sequence.length, topics.length))} / ${topics.length}`;
      if (step > sequence.length + topics.length) { button.disabled = true; button.textContent = 'SIMULATION COMPLETE'; $('#missionStatus', card).textContent = 'FAMILY GATHERING SIMULATION COMPLETE'; completeMission(missions[4].reward); }
    });
  }

  function renderDiary() {
    const card = shellCard('blue', 'MISSION 06 / CLASSIFIED ARCHIVE', 'THE SECRET DIARY', 'Open every file. Actual secrets are not in the system. They remain safely redacted.');
    const contentNode = $('.mission-content', card);
    const grid = document.createElement('div'); grid.className = 'file-grid'; contentNode.appendChild(grid);
    const opened = new Set();
    content.diaryEntries.forEach(([title, copy], index) => {
      const file = document.createElement('button'); file.type = 'button'; file.className = 'file'; file.innerHTML = `<span class="kicker">FILE 0${index + 1} / CLASSIFIED</span><strong>${esc(title)}</strong><span class="file-reveal">STATUS: HIGHLY CLASSIFIED<br />ACCESS LEVEL: SONUDI ONLY<br />CONTENTS: ${esc(copy)}<br />EVIDENCE: REDACTED BY BROTHER.</span>`;
      file.addEventListener('click', () => { opened.add(index); file.classList.add('open'); file.setAttribute('aria-expanded', 'true'); if (opened.size === content.diaryEntries.length) { $('#missionStatus', card).textContent = 'SECRET DIARY UNLOCKED. Saloni remains trusted with classified information.'; finish.disabled = false; finish.focus(); } });
      grid.appendChild(file);
    });
    const finish = document.createElement('button'); finish.className = 'btn primary'; finish.type = 'button'; finish.disabled = true; finish.textContent = 'SECURE ARCHIVE'; contentNode.appendChild(finish);
    finish.addEventListener('click', () => completeMission(missions[5].reward), { once: true });
  }

  function renderCalls() {
    const card = shellCard('blue', 'MISSION 07 / FICTIONAL CALL LOG', 'THE CALL LOG', 'Reconstruct a fictional call. No phone access, no records, just the established Pratik-to-Saloni dynamic.');
    const contentNode = $('.mission-content', card);
    const prompts = [
      ['WHY DID PRATIK CALL?', ['Needed advice', 'Had something important to say', 'Had nonsense to report', 'Forgot why he called']],
      ['WHAT WAS THE ACTUAL LENGTH OF THE CALL?', ['One quick thing', 'Long enough to cover everything', 'Nobody checked']],
      ['HOW DID IT END?', ['Okay, goodbye', 'Okay, one last thing...', 'The system gave up']]
    ];
    let index = 0;
    function showPrompt() {
      const [question, options] = prompts[index];
      contentNode.innerHTML = `<div class="question"><small>CALL RECONSTRUCTION ${index + 1} / ${prompts.length}</small><h3>${esc(question)}</h3><div class="choice-grid" id="callChoices"></div></div>`;
      options.forEach(option => $('#callChoices', contentNode).appendChild(optionButton(option, 'Fictional response only', () => {
        $('#callChoices', contentNode).querySelectorAll('button').forEach(button => button.disabled = true);
        $('#missionStatus', card).textContent = 'RESPONSE FILED. The call is becoming longer.';
        const next = document.createElement('button'); next.className = 'btn dark'; next.type = 'button'; next.textContent = index === prompts.length - 1 ? 'CLOSE CALL LOG' : 'NEXT CALL DETAIL';
        next.addEventListener('click', () => { index += 1; index === prompts.length ? finish() : showPrompt(); });
        card.querySelectorAll('.mission-actions').forEach(actions => actions.remove());
        const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(next); card.appendChild(actions); next.focus();
      })));
    }
    function finish() { contentNode.innerHTML = '<div class="terminal">CALLS INITIATED BY PRATIK: 87%\nSALONI: CLASSIFIED\nAVERAGE TOPICS: ABSURD\n"OKAY, ONE LAST THING..." COUNT: UNREASONABLE\n\nFINAL RESULT: THERE WAS NEVER JUST ONE THING.</div>'; card.querySelectorAll('.mission-actions').forEach(actions => actions.remove()); const done = document.createElement('button'); done.className = 'btn dark'; done.type = 'button'; done.textContent = 'FILE CALL LOG'; done.addEventListener('click', () => completeMission(missions[6].reward), { once: true }); const actions = document.createElement('div'); actions.className = 'mission-actions'; actions.appendChild(done); card.appendChild(actions); done.focus(); }
    showPrompt();
  }

  function renderEvidence() {
    const card = shellCard('paper', 'MISSION 08 / CASE FILES', 'THE EVIDENCE LOCKER', 'Review the evidence that exists. The Plate Incident is real repository content; the text exhibits are fictional system records.');
    const contentNode = $('.mission-content', card);
    const photo = content.photos[0];
    let step = 0;
    const evidence = [['PLATE INCIDENT', 'Subject caught eating with the plate in hand.'], ...content.evidenceExhibits.map(item => [item[0], item[1]])];
    const output = document.createElement('div'); output.className = 'terminal'; output.textContent = 'CASE FILE #001\nSTATUS: CLASSIFIED'; contentNode.appendChild(output);
    const reveal = document.createElement('div'); contentNode.appendChild(reveal);
    const button = document.createElement('button'); button.className = 'btn primary photo-request'; button.type = 'button'; button.textContent = 'REQUEST EVIDENCE'; contentNode.appendChild(button);
    function showEvidence() {
      const item = evidence[step];
      output.textContent = `EXHIBIT ${String(step + 1).padStart(2, '0')} / ${item[0]}\n${item[1]}`;
      reveal.replaceChildren();
      if (step === 0 && photo) {
        const image = document.createElement('img'); image.className = 'fake-photo'; image.src = photo.src; image.alt = photo.title; image.onerror = () => { image.hidden = true; reveal.textContent = 'PHOTO UNAVAILABLE. Evidence remains classified.'; };
        reveal.appendChild(image);
      }
      step += 1;
      button.textContent = step >= evidence.length ? 'CLEAR EVIDENCE LOCKER' : 'INSPECT NEXT EXHIBIT';
    }
    button.addEventListener('click', () => { if (step < evidence.length) showEvidence(); else { $('#missionStatus', card).textContent = 'EVIDENCE LOCKER CLEARED'; completeMission(missions[7].reward); button.disabled = true; } });
  }

  function renderReview() {
    const card = shellCard('paper', 'MISSION 09 / FINAL COMEDY MISSION', 'BROTHER PERFORMANCE REVIEW', 'Saloni is the reviewer. Pratik is the employee. The scores are playful, the authority is questionable, and the final result is pending.');
    const contentNode = $('.mission-content', card);
    contentNode.innerHTML = '<div class="terminal"><strong>REVIEWER:</strong> SALONI\n<strong>EMPLOYEE:</strong> PRATIK\n<strong>ROLE:</strong> ELDER COUSIN BROTHER\n<strong>NOTICE:</strong> REVIEW SUBJECT TO ELDER BROTHER AUTHORITY.</div><div class="review-grid" id="reviewItems"></div>';
    const grid = $('#reviewItems', contentNode); const selected = new Set();
    content.reviewCategories.forEach(([name, score], index) => {
      const item = document.createElement('div'); item.className = 'review-item'; item.innerHTML = `<span class="kicker">CATEGORY ${String(index + 1).padStart(2, '0')}</span><strong>${esc(name)}</strong><p>Select a rating to file the review.</p><div class="choice-grid"></div>`;
      [['LOWER THAN CLAIMED', Math.max(60, Number(score) - 18) || 82], ['SUSPICIOUSLY FAIR', Number(score) || 100], ['ELDER BROTHER EDIT', 'CLAIMED']].forEach(([label, value]) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'choice'; button.innerHTML = `<strong>${label}</strong><span>${value}/100</span>`; button.addEventListener('click', () => { selected.add(index); item.classList.add('selected'); item.querySelectorAll('button').forEach(b => b.disabled = true); item.querySelector('p').textContent = `FILED: ${label}.`; if (selected.size === content.reviewCategories.length) submit.disabled = false; }); item.querySelector('.choice-grid').appendChild(button);
      });
      grid.appendChild(item);
    });
    const submit = document.createElement('button'); submit.className = 'btn primary'; submit.type = 'button'; submit.disabled = true; submit.textContent = 'SUBMIT PERFORMANCE REVIEW'; contentNode.appendChild(submit);
    submit.addEventListener('click', () => { submit.disabled = true; $('#missionStatus', card).textContent = 'OVERALL PERFORMANCE: SUSPICIOUSLY ACCEPTABLE. Emotional support remains operational. General nonsense remains ongoing.'; completeMission(missions[8].reward); }, { once: true });
  }

  function renderFinalGate() {
    updateHud();
    const card = document.createElement('section'); card.className = 'final-card'; card.setAttribute('aria-labelledby', 'finalHeading');
    card.innerHTML = '<div class="eyebrow">ALL MISSIONS COMPLETE / 09 OF 09</div><h1 class="mission-title" id="finalHeading">ONE FINAL FILE REMAINS.</h1><p class="mission-copy">SALONI.EXE STATUS: COMPLETE. The system has one last message, and this time Pratik is not allowed to interrupt it.</p><button class="btn primary" id="openFinal" type="button">OPEN FINAL FILE</button>';
    stage.replaceChildren(card); state.currentMission = missions.length; state.finalUnlocked = true; updateHud();
    $('#openFinal', card).addEventListener('click', renderFinal, { once: true });
    $('#openFinal', card).focus();
  }

  function renderFinal() {
    state.finalOpened = true;
    stage.replaceChildren();
    const card = document.createElement('section'); card.className = 'final-card'; card.setAttribute('aria-labelledby', 'heartfeltHeading');
    card.innerHTML = `<div class="eyebrow">FINAL FILE / NO MORE GAMES</div><div class="letter"><h1 id="heartfeltHeading" class="hidden">Happy 23rd, Sonu.</h1><p>Okay, Sonu. Enough bullying for one day.</p><p>You are one of those people I know I can always rely on. I can tell you things I do not tell anyone else, dump all my ridiculous thoughts on you, and somehow you still listen without judging me.</p><p>You give me advice, bring me back to reality, and tolerate a truly unreasonable amount of nonsense. And the funniest part is that you cannot keep your mouth shut for five minutes, but you have always managed to keep the things I trusted you with. I genuinely appreciate that.</p><p>I hope 23 brings you happiness, confidence in yourself, success in everything you want to accomplish, and plenty of chances to actually have fun. We should stop waiting for family gatherings to meet and actually go somewhere and make some memories.</p><p>Even if Pratik were somehow sitting on the moon, you could still call and dump your stupid talks on him. He would listen. He will always be there, and unfortunately, he will always be there to annoy you too.</p><small>With love, respect under review, and permanent elder-cousin authority.</small></div><div class="final-word">Happy 23rd,<br />Sonu.</div><button class="btn dark" id="replayGame" type="button">REPLAY THE NONSENSE</button>`;
    stage.replaceChildren(card);
    $('#replayGame', card).addEventListener('click', resetGame, { once: true });
    $('#replayGame', card).focus();
  }

  function resetGame() {
    clearTimeout(toastTimer);
    state.currentMission = 0; state.completedMissions.clear(); state.achievements.clear(); state.finalUnlocked = false; state.finalOpened = false; state.transient = {};
    authorityState.respectStatus = content.authority.respectStatus;
    const toast = $('#achievementToast'); toast?.classList.remove('show');
    renderMission();
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function startGame() {
    $('#boot')?.classList.add('is-done');
    $('#game')?.classList.remove('hidden');
    renderMission();
  }

  function init() {
    document.documentElement.classList.add('js');
    stage = $('#missionStage'); map = $('#missionList'); missionNumber = $('#missionNumber'); missionTitle = $('#missionTitle'); progressFill = $('#gameProgress'); progressLabel = $('#progressLabel');
    map.innerHTML = missions.map(mission => `<div class="mission-item" role="listitem"><b>${String(mission.number).padStart(2, '0')}</b><span>${esc(mission.title)}<span class="status">LOCKED</span></span></div>`).join('');
    $('#bootButton')?.addEventListener('click', startGame, { once: true });
    $('#resetGame')?.addEventListener('click', resetGame);
    updateHud();
  }

  window.SaloniGame = { state, missions, reset: resetGame, start: startGame };
  init();
})();
