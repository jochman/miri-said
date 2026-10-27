import { useLayoutEffect, useRef } from 'preact/hooks';
import { QuoteFeedback } from './QuoteFeedback.jsx';
import { Results } from './Results.jsx';

export function QuestionCard({ game, score, dispatch, restart, mobileMedia }) {
  const { questions, responses, index, reviewIndex, screen } = game;
  const reviewing = screen === 'review';
  const result = screen === 'result';
  const current = reviewing ? reviewIndex : index;
  const question = questions[current];
  const choice = responses[current];
  const answered = reviewing || responses.length > index;
  const correct = choice === question.real;
  const progress = result || reviewing ? questions.length : index + Number(answered);
  const cardRef = useRef();
  const contentRef = useRef();
  const quoteRef = useRef();
  const feedbackRef = useRef();
  const nextRef = useRef();
  const titleRef = useRef();
  const mounted = useRef(false);

  useLayoutEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    contentRef.current.scrollTop = answered && !reviewing && !result ? feedbackRef.current.offsetTop : 0;
    const target = result ? titleRef.current : answered && !reviewing ? nextRef.current : quoteRef.current;
    target?.focus({ preventScroll: true });
    if (result && window.matchMedia('(max-width: 800px)').matches) cardRef.current.scrollIntoView({ block: 'center' });
  }, [game]);

  return <section class={`game${result ? ' is-result' : answered ? correct ? ' is-correct' : ' is-wrong' : ''}`} aria-label="משחק הציטוטים" ref={cardRef}>
    <div class="card-top">
      <span>{result ? 'סיימתם את המשחק' : reviewing ? 'התשובות שלכם · כל הציטוטים' : 'האם מירי אמרה את זה?'}</span>
      <span class="counter">{result ? 'התוצאה שלכם' : `${reviewing ? current + 1 : String(current + 1).padStart(2, '0')} / ${questions.length}`}</span>
    </div>
    <div class="progress" role="progressbar" aria-label="התקדמות במשחק" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={progress}>
      <span style={{ width: `${progress / questions.length * 100}%` }} />
    </div>
    <div class="game-content" ref={contentRef}>
      {result ? <Results score={score} total={questions.length} titleRef={titleRef} /> : <div id="question">
        <div class="quote-mark" aria-hidden="true">"</div>
        <blockquote class="quote" tabIndex={-1} ref={quoteRef}>{question.quote}</blockquote>
        {answered && <QuoteFeedback question={question} correct={correct} reviewing={reviewing} choice={choice} feedbackRef={feedbackRef} />}
        <div id="mobile-media-slot">{mobileMedia}</div>
      </div>}
    </div>
    <div class="game-controls">
      {result ? <>
        <button class="next" onClick={() => dispatch({ type: 'review' })}>צפו בתשובות שלכם</button>
        <button class="next" id="restart" onClick={restart}>משחקים שוב ←</button>
      </> : reviewing ? <div class="review-controls">
        <nav class="review-navigation" aria-label="דפדוף בתשובות">
          <button class="no" disabled={reviewIndex === 0} onClick={() => dispatch({ type: 'reviewStep', step: -1 })}>→ הקודם</button>
          <button class="no" disabled={reviewIndex === questions.length - 1} onClick={() => dispatch({ type: 'reviewStep', step: 1 })}>הבא ←</button>
        </nav>
        <button class="next" onClick={() => dispatch({ type: 'result' })}>חזרה לתוצאה</button>
      </div> : answered ? <button class="next" ref={nextRef} onClick={() => dispatch({ type: 'next' })}>
        {index === questions.length - 1 ? 'לתוצאה שלי ←' : 'לציטוט הבא ←'}
      </button> : <>
        <p class="prompt">אז מה אתם אומרים?</p>
        <div class="actions">
          <button class="yes" onClick={() => dispatch({ type: 'answer', choice: true })}>כן, היא אמרה</button>
          <button class="no" onClick={() => dispatch({ type: 'answer', choice: false })}>לא, המצאתם</button>
        </div>
      </>}
    </div>
  </section>;
}
