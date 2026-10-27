const app = document.querySelector('#app');
let catalog = [], questions = [], index = 0, score = 0, answered = false;
let ui;

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function mountGame(data) {
  catalog = data;
  app.innerHTML = `<div class="layout"><section class="intro"><p class="eyebrow">המשחק שיבדוק כמה אתם באמת מכירים</p><h1>מירי<br><span>אמרה?</span></h1><p class="intro-copy">יש דברים שרק מירי רגב יכולה להגיד. <strong>או שלא?</strong><br>${catalog.length} ציטוטים, חלקם אמיתיים וחלקם המצאה. נראה אתכם מבדילים.</p><div class="meta"><span>${catalog.length} שאלות</span><span>בלי גוגל, כן?</span></div><div id="desktop-media-slot"></div></section><section class="game" aria-label="משחק הציטוטים"><div class="card-top"><span id="card-label">האם מירי אמרה את זה?</span><span class="counter" id="counter"></span></div><div class="progress" role="progressbar" aria-label="התקדמות במשחק" aria-valuemin="0" aria-valuemax="${catalog.length}" aria-valuenow="0"><span id="progress-fill"></span></div><div class="game-content"><div id="question"><div class="quote-mark" aria-hidden="true">"</div><blockquote class="quote" id="quote" tabindex="-1"></blockquote><div id="feedback" aria-live="polite" hidden></div><div id="mobile-media-slot"></div></div><div id="result" hidden><div class="result-number" id="result-number"></div><h2 class="result-title" id="result-title" tabindex="-1"></h2><p class="result-copy" id="result-copy"></p></div></div><div class="game-controls"><p class="prompt" id="prompt">אז מה אתם אומרים?</p><div class="actions" id="answers"><button class="yes" data-answer="true">כן, היא אמרה</button><button class="no" data-answer="false">לא, המצאתם</button></div><button class="next" id="next" hidden>לציטוט הבא ←</button><button class="next" id="restart" hidden>משחקים שוב ←</button></div></section></div>`;
  ui = Object.fromEntries(['card-label', 'counter', 'progress-fill', 'question', 'quote', 'feedback', 'result', 'result-number', 'result-title', 'result-copy', 'prompt', 'answers', 'next', 'restart'].map(id => [id, app.querySelector(`#${id}`)]));
  ui.card = app.querySelector('.game');
  ui.content = app.querySelector('.game-content');
  ui.progress = app.querySelector('.progress');
  ui.media = document.createElement('section');
  ui.media.className = 'quote-media';
  ui.media.setAttribute('aria-label', 'סרטון הציטוט');
  ui.media.hidden = true;
  const mobile = window.matchMedia('(max-width: 800px)');
  const placeMedia = () => {
    const slot = app.querySelector(mobile.matches ? '#mobile-media-slot' : '#desktop-media-slot');
    if (ui.media.parentElement !== slot) slot.append(ui.media);
  };
  mobile.addEventListener('change', placeMedia);
  placeMedia();
  app.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => answer(button.dataset.answer === 'true')));
  ui.next.addEventListener('click', () => {
    index++;
    if (index < questions.length) renderQuestion();
    else renderResult();
  });
  ui.restart.addEventListener('click', () => startGame());
  startGame(false);
}

function startGame(focus = true) {
  questions = shuffle(catalog);
  index = 0;
  score = 0;
  renderQuestion(focus);
}

function renderQuestion(focus = true) {
  const q = questions[index];
  answered = false;
  ui.card.classList.remove('is-correct', 'is-wrong');
  ui['card-label'].textContent = 'האם מירי אמרה את זה?';
  ui.counter.textContent = `${String(index + 1).padStart(2, '0')} / ${questions.length}`;
  ui['progress-fill'].style.width = `${index / questions.length * 100}%`;
  ui.progress.setAttribute('aria-valuenow', index);
  ui.question.hidden = false;
  ui.result.hidden = true;
  ui.quote.textContent = q.quote;
  ui.feedback.hidden = true;
  ui.feedback.innerHTML = '';
  ui.media.innerHTML = '';
  ui.media.hidden = true;
  ui.prompt.hidden = false;
  ui.answers.hidden = false;
  ui.next.hidden = true;
  ui.restart.hidden = true;
  ui.content.scrollTop = 0;
  if (focus) ui.quote.focus({ preventScroll: true });
}
function renderVideo(video) {
  if (!video) return '';
  try {
    const url = new URL(video);
    const host = url.hostname.replace(/^www\./, '');
    if (['x.com', 'twitter.com'].includes(host)) {
      const post = url.pathname.match(/^\/([a-zA-Z0-9_]+)\/status\/(\d+)\/?$/);
      if (!post) return '';
      const link = `https://twitter.com/${post[1]}/status/${post[2]}`;
      const embed = ['http:', 'https:'].includes(location.protocol)
        ? `<blockquote class="twitter-tweet" data-dnt="true" data-conversation="none"><a href="${link}" target="_blank" rel="noopener noreferrer">הסרטון של חדשות 13</a></blockquote>` : '';
      return `<div class="quote-video quote-video-x">${embed}<a href="https://x.com/${post[1]}/status/${post[2]}" target="_blank" rel="noopener noreferrer">▶ לצפייה בסרטון ב־X ↗</a></div>`;
    }
    const id = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' ? url.searchParams.get('v') : null;
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return '';
    if (!['http:', 'https:'].includes(location.protocol)) {
      return `<div class="quote-video"><p>לצפייה בסרטון:</p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">▶ לצפייה ב־YouTube ↗</a></div>`;
    }
    return `<div class="quote-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="סרטון הציטוט של מירי רגב" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">לצפייה ב־YouTube ↗</a></div>`;
  } catch {
    return '';
  }
}
let xWidgetsPromise;
function loadXVideo(container) {
  const post = container.querySelector('.twitter-tweet');
  if (!post) return;
  if (!xWidgetsPromise) {
    xWidgetsPromise = new Promise((resolve, reject) => {
      if (window.twttr?.widgets) { resolve(window.twttr.widgets); return; }
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => window.twttr?.widgets ? resolve(window.twttr.widgets) : reject(new Error('X embed unavailable'));
      script.onerror = () => { script.remove(); reject(new Error('X embed unavailable')); };
      document.head.append(script);
    });
  }
  xWidgetsPromise.then(widgets => {
    if (post.isConnected) widgets.load(post.parentElement);
  }).catch(() => {
    // The direct watch link remains usable if X or a blocker prevents embedding.
    xWidgetsPromise = undefined;
  });
}
function answer(choice) {
  if (answered) return;
  answered = true;
  const q = questions[index], correct = choice === q.real;
  if (correct) score++;
  ui.card.classList.add(correct ? 'is-correct' : 'is-wrong');
  ui.prompt.hidden = true;
  ui.answers.hidden = true;
  ui.feedback.className = 'feedback';
  ui.feedback.innerHTML = `<h2>${correct ? '✓ בול! תשובה נכונה.' : '✕ לא הפעם.'}</h2><p><strong>${q.real ? q.sourceStatus === 'unverified' ? 'הציטוט מיוחס למירי רגב; המקור טרם אומת.' : 'מירי רגב אכן אמרה את זה.' : 'הציטוט הזה מומצא.'}</strong> ${q.real ? q.context : 'אבל מתאים למירי, לא?'}</p>${q.real && q.source ? `<a href="${q.source}" target="_blank" rel="noopener noreferrer">לכתבה עם הציטוט ↗</a>` : ''}`;
  ui.feedback.hidden = false;
  const video = renderVideo(q.video);
  ui.media.innerHTML = video ? '<h2 class="media-heading">הציטוט במקור</h2>' + video : '';
  ui.media.hidden = !video;
  loadXVideo(ui.media);
  ui.next.textContent = index === questions.length - 1 ? 'לתוצאה שלי ←' : 'לציטוט הבא ←';
  ui.next.hidden = false;
  ui['progress-fill'].style.width = `${(index + 1) / questions.length * 100}%`;
  ui.progress.setAttribute('aria-valuenow', index + 1);
  // Keep the viewport still; reveal feedback inside the persistent game card.
  ui.content.scrollTop = ui.feedback.offsetTop;
  ui.next.focus({ preventScroll: true });
}

function renderResult() {
  const message = score / questions.length >= .8 ? 'אתם מכירים את מירי ממש טוב.' : score / questions.length >= .5 ? 'יש לכם אוזן טובה לציטוטים.' : 'כנראה שלא תמיד קל להבדיל בין המציאות לדמיון.';
  ui.card.classList.remove('is-correct', 'is-wrong');
  ui['card-label'].textContent = 'סיימתם את המשחק';
  ui.counter.textContent = 'התוצאה שלכם';
  ui.question.hidden = true;
  ui.feedback.innerHTML = '';
  ui.media.innerHTML = '';
  ui.media.hidden = true;
  ui.result.hidden = false;
  ui['result-number'].innerHTML = `${score}<small> / ${questions.length}</small>`;
  ui['result-title'].textContent = message;
  ui['result-copy'].textContent = `עניתם נכון על ${score} מתוך ${questions.length} שאלות. רוצים לנסות שוב?`;
  ui.prompt.hidden = true;
  ui.answers.hidden = true;
  ui.next.hidden = true;
  ui.restart.hidden = false;
  ui.content.scrollTop = 0;
  ui['result-title'].focus({ preventScroll: true });
}

if (location.protocol === 'file:') {
  mountGame(window.offlineQuotes);
} else {
  fetch('quotes.json')
    .then(response => { if (!response.ok) throw new Error('Could not load quotes'); return response.json(); })
    .then(mountGame)
    .catch(() => mountGame(window.offlineQuotes));
}
