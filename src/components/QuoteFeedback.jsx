export function QuoteFeedback({ question, correct, reviewing, choice, feedbackRef }) {
  const truth = question.real
    ? question.sourceStatus === 'unverified'
      ? 'הציטוט מיוחס למירי רגב; המקור טרם אומת.'
      : 'מירי רגב אכן אמרה את זה.'
    : 'הציטוט הזה מומצא.';

  return <div id="feedback" class="feedback" aria-live="polite" ref={feedbackRef}>
    {reviewing && <p class="review-answer">התשובה שלכם: {choice ? 'כן, היא אמרה' : 'לא, המצאתם'}</p>}
    <h2>{correct ? '✓ בול! תשובה נכונה.' : '✕ לא הפעם.'}</h2>
    <p><strong>{truth}</strong> {question.real ? question.context : 'אבל מתאים למירי, לא?'}</p>
    {question.real && question.source && <a href={question.source} target="_blank" rel="noopener noreferrer">לכתבה עם הציטוט ↗</a>}
  </div>;
}
