import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';
import { createGame, gameReducer, getScore } from '../src/game.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const catalog = JSON.parse(await readFile(new URL('../quotes.json', import.meta.url), 'utf8'));
const settle = () => new Promise(resolve => setTimeout(resolve, 70));

async function openGame({ mobile = false, url = 'file:///game/index.html', quotes = catalog, failFetch = false, share, Hls } = {}) {
  const errors = [];
  const mediaStops = [];
  let fetches = 0;
  let resize;
  const query = { matches: mobile, addEventListener: (_, listener) => { resize = listener; }, removeEventListener() {} };
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole,
    beforeParse(window) {
      window.matchMedia = () => query;
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLMediaElement.prototype.pause = function () { mediaStops.push(this); };
      window.HTMLMediaElement.prototype.load = () => {};
      window.fetch = async () => {
        fetches++;
        if (failFetch) throw new Error('Offline');
        return { ok: true, json: async () => quotes };
      };
      window.Hls = Hls || { isSupported: () => false };
      window.twttr = { widgets: { load() {} } };
      if (share) window.navigator.share = share;
    },
  });
  await settle();
  const document = dom.window.document;
  assert.equal(document.querySelector('#app').children.length, 1, 'mount replaces the static fallback instead of leaving it beside the game');
  assert.ok(document.querySelector('#app > .layout'));
  assert.equal(document.querySelectorAll('h1').length, 1, 'only the game heading remains after mounting');
  return {
    dom, document, errors, mediaStops,
    fetches: () => fetches,
    async click(text) {
      const button = [...document.querySelectorAll('button')].find(button => button.textContent === text);
      assert.ok(button, `Button exists: ${text}`);
      assert.equal(button.disabled, false);
      button.click();
      await settle();
    },
    async resize(mobile) { query.matches = mobile; resize(); await settle(); },
  };
}

test('state prevents duplicate answers and premature advancement; restart resets the round', () => {
  const initial = createGame(catalog);
  assert.equal(gameReducer(initial, { type: 'next' }), initial);
  const answered = gameReducer(initial, { type: 'answer', choice: initial.questions[0].real });
  assert.equal(getScore(answered), 1);
  assert.equal(gameReducer(answered, { type: 'answer', choice: false }), answered);
  const restarted = gameReducer(answered, { type: 'restart', catalog });
  assert.equal(getScore(restarted), 0);
  assert.deepEqual(restarted.responses, []);
  assert.equal(restarted.index, 0);
  assert.equal(restarted.questions.length, catalog.length);
  assert.deepEqual(new Set(restarted.questions), new Set(catalog));
});

for (const mobile of [false, true]) {
  test(`standalone ${mobile ? 'mobile' : 'desktop'} game: full round, score, review, restart, focus and media cleanup`, async t => {
    const page = await openGame({ mobile });
    t.after(() => page.dom.window.close());
    const { document } = page;
    assert.equal(document.documentElement.dir, 'rtl');
    assert.equal(page.fetches(), 0, 'file opening uses embedded quotes');
    assert.equal(document.querySelector('.quote-media'), null, 'media is hidden until answered');
    let score = 0;
    let previousPlayer;
    for (let index = 0; index < catalog.length; index++) {
      const question = catalog.find(q => q.quote === document.querySelector('.quote').textContent);
      assert.ok(question);
      const choice = index % 2 === 0 ? question.real : !question.real;
      score += Number(choice === question.real);
      await page.click(choice ? 'כן, היא אמרה' : 'לא, המצאתם');
      assert.equal(document.querySelector('.game').classList.contains('is-correct'), choice === question.real);
      assert.equal(document.querySelector('.progress').getAttribute('aria-valuenow'), String(index + 1));
      assert.equal(document.activeElement.className, 'next');
      if (question.video || question.audio) {
        assert.ok(document.querySelector(`${mobile ? '#mobile' : '#desktop'}-media-slot .quote-media`));
        assert.equal(document.querySelectorAll('iframe').length, 0, 'file opening uses fallback links');
      }
      previousPlayer = document.querySelector('audio, video');
      await page.click(index === catalog.length - 1 ? 'לתוצאה שלי ←' : 'לציטוט הבא ←');
      if (previousPlayer) assert.ok(page.mediaStops.includes(previousPlayer), 'previous player was stopped');
      assert.equal(document.querySelector('.quote-media'), null);
      if (index < catalog.length - 1) assert.equal(document.activeElement.className, 'quote');
    }
    assert.equal(document.querySelector('.result-number').textContent, `${score} / ${catalog.length}`);
    assert.equal(document.activeElement.className, 'result-title');
    assert.match(decodeURIComponent(document.querySelector('a[aria-label="שיתוף בוואטסאפ"]').href), new RegExp(`${score} מתוך ${catalog.length}`));
    await page.click('צפו בתשובות שלכם');
    assert.ok(document.querySelector('.review-navigation button').disabled);
    assert.ok(document.querySelector('.review-answer'));
    assert.equal(document.activeElement.className, 'quote');
    for (let i = 1; i < catalog.length; i++) await page.click('הבא ←');
    assert.ok(document.querySelectorAll('.review-navigation button')[1].disabled);
    await page.click('→ הקודם');
    await page.click('חזרה לתוצאה');
    assert.equal(document.querySelector('.result-number').textContent, `${score} / ${catalog.length}`);
    await page.click('משחקים שוב ←');
    assert.equal(document.querySelector('.counter').textContent, `01 / ${catalog.length}`);
    assert.equal(document.querySelector('.progress').getAttribute('aria-valuenow'), '0');
    assert.ok(document.querySelector('.actions'));
    assert.deepEqual(page.errors, []);
  });
}

test('HTTP loads current JSON, native sharing works, and media follows layout changes', async t => {
  const shared = [];
  const quotes = [{ quote: 'בדיקה', real: true, context: 'הקשר', source: 'https://example.com', video: 'https://youtu.be/wstiIkc16ug' }];
  const page = await openGame({ url: 'https://example.com/', quotes, share: async data => shared.push(data) });
  t.after(() => page.dom.window.close());
  assert.equal(page.fetches(), 1);
  assert.equal(page.document.querySelector('.quote').textContent, 'בדיקה');
  await page.click('שיתוף במכשיר');
  assert.equal(shared.length, 1);
  await page.click('כן, היא אמרה');
  assert.match(page.document.querySelector('#desktop-media-slot iframe').src, /youtube-nocookie/);
  await page.resize(true);
  assert.ok(page.document.querySelector('#mobile-media-slot iframe'));
  assert.equal(page.document.querySelector('#desktop-media-slot iframe'), null);
  await page.click('לתוצאה שלי ←');
  assert.equal(page.document.querySelector('iframe'), null);
  assert.deepEqual(page.errors, []);
});

test('HTTP fetch failure falls back to embedded quotes; sharing without APIs offers selected text', async t => {
  const page = await openGame({ url: 'https://example.com/', failFetch: true, mobile: true });
  t.after(() => page.dom.window.close());
  assert.equal(page.fetches(), 1);
  assert.ok(catalog.some(q => q.quote === page.document.querySelector('.quote').textContent));
  await page.click('העתקת קישור');
  const textarea = page.document.querySelector('textarea');
  assert.ok(textarea);
  assert.equal(page.document.activeElement, textarea);
  assert.equal(textarea.selectionEnd, textarea.value.length);
  assert.deepEqual(page.errors, []);
});

test('online media providers retain embeds and fallback links, and destroy HLS players between questions', async t => {
  const players = [];
  class Hls {
    static isSupported() { return true; }
    constructor() { players.push(this); }
    loadSource(src) { this.src = src; }
    attachMedia(player) { this.player = player; }
    destroy() { this.destroyed = true; }
  }
  const quotes = catalog.filter(q => q.video || q.audio);
  const page = await openGame({ url: 'https://example.com/', quotes, Hls });
  t.after(() => page.dom.window.close());
  for (let index = 0; index < quotes.length; index++) {
    const question = quotes.find(q => q.quote === page.document.querySelector('.quote').textContent);
    await page.click('כן, היא אמרה');
    const media = page.document.querySelector('.quote-media');
    assert.ok(media);
    assert.ok(media.querySelector('a[href]'), 'media always has a direct fallback link');
    if (question.audio) assert.ok(media.querySelector('audio'));
    else if (question.video.includes('facebook.com')) assert.match(media.querySelector('iframe').src, /facebook.com\/plugins\/video/);
    else if (question.video.includes('x.com')) assert.ok(media.querySelector('.twitter-tweet'));
    else if (question.video.endsWith('.m3u8')) assert.equal(players.at(-1).src, question.video);
    else assert.match(media.querySelector('iframe').src, /youtube-nocookie.com/);
    await page.click(index === quotes.length - 1 ? 'לתוצאה שלי ←' : 'לציטוט הבא ←');
    assert.equal(page.document.querySelector('.quote-media'), null);
    assert.ok(players.every(player => player.destroyed));
  }
  assert.equal(players.length, 1);
  assert.deepEqual(page.errors, []);
});
