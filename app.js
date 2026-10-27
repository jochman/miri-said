const app = document.querySelector('#app');
let catalog = [], questions = [], index = 0, score = 0, answered = false;
let ui;
let responses = [], reviewIndex = 0, reviewing = false;

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
  app.innerHTML = `<div class="layout"><section class="intro"><p class="eyebrow">האם אתם באמת יודעים מה</p><h1>מירי<br><span>אמרה?</span></h1><p class="intro-copy">יש דברים שרק מירי רגב יכולה להגיד. <strong>או שלא?</strong><br>${catalog.length} ציטוטים, חלקם אמיתיים וחלקם המצאה. נראה אתכם מבדילים.</p><div class="meta"><span>${catalog.length} שאלות</span><span>בלי גוגל, כן?</span></div><div id="desktop-media-slot"></div></section><section class="game" aria-label="משחק הציטוטים"><div class="card-top"><span id="card-label">האם מירי אמרה את זה?</span><span class="counter" id="counter"></span></div><div class="progress" role="progressbar" aria-label="התקדמות במשחק" aria-valuemin="0" aria-valuemax="${catalog.length}" aria-valuenow="0"><span id="progress-fill"></span></div><div class="game-content"><div id="question"><div class="quote-mark" aria-hidden="true">"</div><blockquote class="quote" id="quote" tabindex="-1"></blockquote><div id="feedback" aria-live="polite" hidden></div><div id="mobile-media-slot"></div></div><div id="result" hidden><div class="result-number" id="result-number"></div><h2 class="result-title" id="result-title" tabindex="-1"></h2><p class="result-copy" id="result-copy"></p></div></div><div class="game-controls"><p class="prompt" id="prompt">אז מה אתם אומרים?</p><div class="actions" id="answers"><button class="yes" data-answer="true">כן, היא אמרה</button><button class="no" data-answer="false">לא, המצאתם</button></div><button class="next" id="next" hidden>לציטוט הבא ←</button><button class="next" id="restart" hidden>משחקים שוב ←</button></div></section><section class="share-panel" aria-labelledby="share-heading">
    <h2 id="share-heading">שתפו את המשחק</h2>
    <div class="share-actions">
      <button class="share-action" id="instagram-share" type="button" title="פתיחת תפריט השיתוף — בחרו Instagram אם הוא זמין"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/></svg><span>אינסטגרם</span></button>
      <a class="share-action" id="whatsapp-share" target="_blank" rel="noopener noreferrer" aria-label="שיתוף בוואטסאפ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-12 7L3 20l1.5-5A8 8 0 1 1 20 11.5Z"/><path d="M8 7.5c0 4 2.5 6.5 6.5 7l1-2-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2Z"/></svg><span>וואטסאפ</span></a>
      <a class="share-action" id="facebook-share" target="_blank" rel="noopener noreferrer" aria-label="שיתוף בפייסבוק" title="פתיחת Facebook לשיתוף — ייתכן שתידרש התחברות"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 21v-8H18l.5-4h-4V7c0-1 .5-1.5 1.5-1.5h2V2.2L15 2c-3 0-4.5 1.8-4.5 5v2H7v4h3.5v8"/></svg><span>פייסבוק</span></a>
      <button class="share-action" id="share" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8"/></svg><span>שיתוף נוסף</span></button>
    </div>
    <p class="share-status" id="share-status" role="status"></p>
    <a class="instagram-open" id="instagram-open" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" hidden>פתיחת Instagram להדבקת הטקסט ↗</a>
    <label class="share-fallback" id="share-fallback" hidden>העתיקו את הטקסט לשיתוף<textarea id="share-text" readonly rows="3" dir="auto"></textarea></label>
  </section></div>`;
  ui = Object.fromEntries(['card-label', 'counter', 'progress-fill', 'question', 'quote', 'feedback', 'result', 'result-number', 'result-title', 'result-copy', 'prompt', 'answers', 'next', 'restart', 'share-heading', 'instagram-share', 'instagram-open', 'whatsapp-share', 'facebook-share', 'share', 'share-status', 'share-fallback', 'share-text'].map(id => [id, app.querySelector(`#${id}`)]));
  ui.card = app.querySelector('.game');
  ui.content = app.querySelector('.game-content');
  ui.progress = app.querySelector('.progress');
  ui.review = document.createElement('button');
  ui.review.className = 'next';
  ui.review.textContent = 'צפו בתשובות שלכם';
  ui.review.hidden = true;
  ui.restart.before(ui.review);
  ui.reviewControls = document.createElement('div');
  ui.reviewControls.className = 'review-controls';
  ui.reviewControls.hidden = true;
  ui.reviewControls.innerHTML = '<nav class="review-navigation" aria-label="דפדוף בתשובות"><button class="no" id="review-previous">→ הקודם</button><button class="no" id="review-next">הבא ←</button></nav><button class="next" id="review-result">חזרה לתוצאה</button>';
  ui.restart.after(ui.reviewControls);
  ui.reviewPrevious = ui.reviewControls.querySelector('#review-previous');
  ui.reviewNext = ui.reviewControls.querySelector('#review-next');
  ui.review.addEventListener('click', () => { reviewIndex = 0; renderReview(); });
  ui.reviewPrevious.addEventListener('click', () => { reviewIndex--; renderReview(); });
  ui.reviewNext.addEventListener('click', () => { reviewIndex++; renderReview(); });
  ui.reviewControls.querySelector('#review-result').addEventListener('click', renderResult);
  ui.media = document.createElement('section');
  ui.media.className = 'quote-media';
  ui.media.setAttribute('aria-label', 'הקלטת הציטוט');
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
  ui.share.addEventListener('click', () => shareGame());
  ui['instagram-share'].addEventListener('click', () => shareGame('instagram'));
  startGame(false);
}

function getShareData() {
  const url = document.querySelector('link[rel="canonical"]').href;
  const text = responses.length < questions.length
    ? 'מה מירי אמרה? האם תצליחו להבדיל בין ציטוט אמיתי למומצא?'
    : `עניתי נכון על ${score} מתוך ${questions.length} שאלות במשחק ״מה מירי אמרה?״. כמה תצליחו אתם?`;
  return { title: 'מה מירי אמרה?', text, url };
}

function updateSharing() {
  const { text, url } = getShareData();
  ui['share-heading'].textContent = responses.length < questions.length ? 'שתפו את המשחק' : 'שתפו את התוצאה';
  ui['whatsapp-share'].href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  ui['facebook-share'].href = `https://www.facebook.com/login.php?next=${encodeURIComponent(facebookUrl)}`;
  ui.share.querySelector('span').textContent = typeof navigator.share === 'function' ? 'שיתוף במכשיר' : 'העתקת קישור';
  ui['share-status'].textContent = '';
  ui['share-fallback'].hidden = true;
  ui['instagram-open'].hidden = true;
}

async function shareGame(platform = 'general') {
  if (ui.share.disabled) return;
  const { title, text, url } = getShareData();
  ui.share.disabled = true;
  ui['instagram-share'].disabled = true;
  ui['share-status'].textContent = '';
  ui['share-fallback'].hidden = true;
  ui['instagram-open'].hidden = true;
  try {
    // Both buttons must call share directly from the click, before any awaited work.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      ui['share-status'].textContent = platform === 'instagram'
        ? 'הטקסט והקישור הועתקו — הדביקו אותם בהודעה או בסטורי באינסטגרם.'
        : 'הטקסט והקישור הועתקו!';
    } catch {
      ui['share-fallback'].hidden = false;
      ui['share-text'].value = `${text}\n${url}`;
      ui['share-text'].focus();
      ui['share-text'].select();
      ui['share-status'].textContent = 'אפשר להעתיק את הטקסט ולשלוח לחברים.';
    }
  } finally {
    ui['instagram-open'].hidden = platform !== 'instagram' || !ui['share-status'].textContent;
    ui.share.disabled = false;
    ui['instagram-share'].disabled = false;
  }
}

function startGame(focus = true) {
  questions = shuffle(catalog);
  index = 0;
  score = 0;
  responses = [];
  reviewing = false;
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
  updateSharing();
  ui.quote.textContent = q.quote;
  ui.feedback.hidden = true;
  ui.feedback.innerHTML = '';
  clearMedia();
  ui.prompt.hidden = false;
  ui.answers.hidden = false;
  ui.next.hidden = true;
  ui.restart.hidden = true;
  ui.review.hidden = true;
  ui.reviewControls.hidden = true;
  ui.card.classList.remove('is-result');
  ui.content.scrollTop = 0;
  if (focus) ui.quote.focus({ preventScroll: true });
}
function renderVideo(video) {
  if (!video) return '';
  try {
    const url = new URL(video);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'hls-video-ynet.ynethd.com' && url.protocol === 'https:' && url.pathname.endsWith('.m3u8')) {
      return `<div class="quote-video"><video controls playsinline preload="none" data-hls-src="${url.href}" aria-label="סרטון הציטוט מתוך ynet"></video><a href="https://www.ynet.co.il/articles/0,7340,L-4914027,00.html" target="_blank" rel="noopener noreferrer">לצפייה בכתבה ב־ynet ↗</a></div>`;
    }
    if (['facebook.com', 'm.facebook.com'].includes(host)) {
      const id = url.pathname === '/watch/' || url.pathname === '/watch' ? url.searchParams.get('v') : null;
      if (!id || !/^\d+$/.test(id)) return '';
      const link = `https://www.facebook.com/watch/?v=${id}`;
      const embed = ['http:', 'https:'].includes(location.protocol)
        ? `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(link)}&show_text=false&width=500" title="סרטון הציטוט של מירי רגב בפייסבוק" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>` : '';
      return `<div class="quote-video">${embed}<a href="${link}" target="_blank" rel="noopener noreferrer">▶ לצפייה בסרטון בפייסבוק ↗</a></div>`;
    }
    if (['x.com', 'twitter.com'].includes(host)) {
      const post = url.pathname.match(/^\/([a-zA-Z0-9_]+)\/status\/(\d+)\/?$/);
      if (!post) return '';
      const link = `https://twitter.com/${post[1]}/status/${post[2]}`;
      const embed = ['http:', 'https:'].includes(location.protocol)
        ? `<blockquote class="twitter-tweet" data-dnt="true" data-conversation="none"><a href="${link}" target="_blank" rel="noopener noreferrer">הסרטון של חדשות 13</a></blockquote>` : '';
      return `<div class="quote-video quote-video-x">${embed}<a href="https://x.com/${post[1]}/status/${post[2]}" target="_blank" rel="noopener noreferrer">▶ לצפייה בסרטון ב־X ↗</a></div>`;
    }
    const shortsId = host === 'youtube.com' ? url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})\/?$/)?.[1] : null;
    const id = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' ? shortsId || url.searchParams.get('v') : null;
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return '';
    if (!['http:', 'https:'].includes(location.protocol)) {
      return `<div class="quote-video"><p>לצפייה בסרטון:</p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">▶ לצפייה ב־YouTube ↗</a></div>`;
    }
    return `<div class="quote-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="סרטון הציטוט של מירי רגב" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">לצפייה ב־YouTube ↗</a></div>`;
  } catch {
    return '';
  }
}
let hlsLibraryPromise, activeHls;
function clearMedia() {
  activeHls?.destroy();
  activeHls = undefined;
  ui.media.querySelectorAll('audio, video').forEach(player => {
    player.pause();
    player.removeAttribute('src');
    player.load();
  });
  ui.media.innerHTML = '';
  ui.media.hidden = true;
}
function loadHlsVideo(container) {
  const player = container.querySelector('video[data-hls-src]');
  if (!player) return;
  if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.src = player.dataset.hlsSrc;
    return;
  }
  if (!hlsLibraryPromise) {
    hlsLibraryPromise = new Promise((resolve, reject) => {
      if (window.Hls) { resolve(window.Hls); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.7.3/dist/hls.min.js';
      script.async = true;
      script.onload = () => window.Hls ? resolve(window.Hls) : reject(new Error('HLS unavailable'));
      script.onerror = () => { script.remove(); reject(new Error('HLS unavailable')); };
      document.head.append(script);
    });
  }
  hlsLibraryPromise.then(Hls => {
    if (!player.isConnected || !Hls.isSupported()) return;
    activeHls = new Hls();
    activeHls.loadSource(player.dataset.hlsSrc);
    activeHls.attachMedia(player);
  }).catch(() => { hlsLibraryPromise = undefined; });
}
function renderAudio(audio, source) {
  if (!audio) return '';
  try {
    const url = new URL(audio);
    if (url.protocol !== 'https:' || url.hostname !== 'vod-progressive.ynethd.com') return '';
    return `<div class="quote-audio"><audio controls preload="none" aria-label="האזנה לציטוט של מירי רגב" src="${url.href}"></audio><p>מתוך רדיו "קול חי", כפי שפורסם ב־ynet.</p><a href="${source}" target="_blank" rel="noopener noreferrer">להאזנה בכתבה ב־ynet ↗</a></div>`;
  } catch { return ''; }
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
  if (answered || reviewing) return;
  answered = true;
  const q = questions[index], correct = choice === q.real;
  responses[index] = choice;
  if (correct) score++;
  ui.card.classList.add(correct ? 'is-correct' : 'is-wrong');
  ui.prompt.hidden = true;
  ui.answers.hidden = true;
  renderFeedback(q, correct);
  ui.next.textContent = index === questions.length - 1 ? 'לתוצאה שלי ←' : 'לציטוט הבא ←';
  ui.next.hidden = false;
  ui['progress-fill'].style.width = `${(index + 1) / questions.length * 100}%`;
  ui.progress.setAttribute('aria-valuenow', index + 1);
  // Keep the viewport still; reveal feedback inside the persistent game card.
  ui.content.scrollTop = ui.feedback.offsetTop;
  ui.next.focus({ preventScroll: true });
}

function renderFeedback(q, correct) {
  ui.feedback.className = 'feedback';
  ui.feedback.innerHTML = `<h2>${correct ? '✓ בול! תשובה נכונה.' : '✕ לא הפעם.'}</h2><p><strong>${q.real ? q.sourceStatus === 'unverified' ? 'הציטוט מיוחס למירי רגב; המקור טרם אומת.' : 'מירי רגב אכן אמרה את זה.' : 'הציטוט הזה מומצא.'}</strong> ${q.real ? q.context : 'אבל מתאים למירי, לא?'}</p>${q.real && q.source ? `<a href="${q.source}" target="_blank" rel="noopener noreferrer">לכתבה עם הציטוט ↗</a>` : ''}`;
  ui.feedback.hidden = false;
  const media = renderAudio(q.audio, q.source) || renderVideo(q.video);
  ui.media.innerHTML = media ? '<h2 class="media-heading">הציטוט במקור</h2>' + media : '';
  ui.media.hidden = !media;
  ui.media.scrollTop = 0;
  loadXVideo(ui.media);
  loadHlsVideo(ui.media);
}

function renderReview() {
  reviewing = true;
  const q = questions[reviewIndex], choice = responses[reviewIndex];
  clearMedia();
  ui.card.classList.remove('is-result', 'is-correct', 'is-wrong');
  ui.card.classList.add(choice === q.real ? 'is-correct' : 'is-wrong');
  ui['card-label'].textContent = 'התשובות שלכם · כל הציטוטים';
  ui.counter.textContent = `${reviewIndex + 1} / ${questions.length}`;
  ui.result.hidden = true;
  ui.question.hidden = false;
  ui.quote.textContent = q.quote;
  renderFeedback(q, choice === q.real);
  const response = document.createElement('p');
  response.className = 'review-answer';
  response.textContent = `התשובה שלכם: ${choice ? 'כן, היא אמרה' : 'לא, המצאתם'}`;
  ui.feedback.prepend(response);
  ui.review.hidden = true;
  ui.restart.hidden = true;
  ui.reviewControls.hidden = false;
  ui.reviewPrevious.disabled = reviewIndex === 0;
  ui.reviewNext.disabled = reviewIndex === questions.length - 1;
  ui.content.scrollTop = 0;
  ui.quote.focus({ preventScroll: true });
}

function renderResult() {
  reviewing = false;
  const message = score / questions.length >= .8 ? 'אתם מכירים את מירי ממש טוב.' : score / questions.length >= .5 ? 'יש לכם אוזן טובה לציטוטים.' : 'כנראה שלא תמיד קל להבדיל בין המציאות לדמיון.';
  ui.card.classList.remove('is-correct', 'is-wrong');
  ui.card.classList.add('is-result');
  ui['card-label'].textContent = 'סיימתם את המשחק';
  ui.counter.textContent = 'התוצאה שלכם';
  ui.question.hidden = true;
  ui.feedback.innerHTML = '';
  clearMedia();
  ui.result.hidden = false;
  ui['result-number'].innerHTML = `${score}<small> / ${questions.length}</small>`;
  ui['result-title'].textContent = message;
  ui['result-copy'].textContent = `עניתם נכון על ${score} מתוך ${questions.length} שאלות. רוצים לנסות שוב?`;
  ui.prompt.hidden = true;
  ui.answers.hidden = true;
  ui.next.hidden = true;
  ui.restart.hidden = false;
  ui.review.hidden = false;
  ui.reviewControls.hidden = true;
  updateSharing();
  ui.content.scrollTop = 0;
  ui['result-title'].focus({ preventScroll: true });
  if (window.matchMedia('(max-width: 800px)').matches) ui.card.scrollIntoView({ block: 'center' });
}

if (location.protocol === 'file:') {
  mountGame(window.offlineQuotes);
} else {
  fetch('quotes.json')
    .then(response => { if (!response.ok) throw new Error('Could not load quotes'); return response.json(); })
    .then(mountGame)
    .catch(() => mountGame(window.offlineQuotes));
}
