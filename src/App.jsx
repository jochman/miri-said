import { useEffect, useReducer, useState } from 'preact/hooks';
import { createGame, gameReducer, getScore } from './game.js';
import { QuestionCard } from './components/QuestionCard.jsx';
import { QuoteMedia } from './components/QuoteMedia.jsx';
import { SharePanel } from './components/SharePanel.jsx';

function useMobileLayout() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 800px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function App({ catalog }) {
  const [game, dispatch] = useReducer(gameReducer, catalog, createGame);
  const mobile = useMobileLayout();
  const score = getScore(game);
  const reviewing = game.screen === 'review';
  const current = reviewing ? game.reviewIndex : game.index;
  const showMedia = game.screen !== 'result' && (reviewing || game.responses.length > game.index);
  const media = showMedia ? <QuoteMedia key={`${game.screen}-${current}`} question={game.questions[current]} /> : null;

  return <div class="layout">
    <section class="intro">
      <p class="eyebrow">האם אתם באמת יודעים מה</p>
      <h1>מירי<br /><span>אמרה?</span></h1>
      <p class="intro-copy">יש דברים שרק מירי רגב יכולה להגיד. <strong>או שלא?</strong><br />{catalog.length} ציטוטים, חלקם אמיתיים וחלקם המצאה. נראה אתכם מבדילים.</p>
      <div class="meta"><span>{catalog.length} שאלות</span><span>בלי גוגל, כן?</span></div>
      <div id="desktop-media-slot">{!mobile && media}</div>
    </section>
    <QuestionCard game={game} score={score} dispatch={dispatch} restart={() => dispatch({ type: 'restart', catalog })} mobileMedia={mobile && media} />
    <SharePanel key={`${game.screen}-${game.index}-${game.reviewIndex}`} score={score} total={game.questions.length} complete={game.responses.length === game.questions.length} />
  </div>;
}
