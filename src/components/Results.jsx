export function Results({ score, total, titleRef }) {
  const message = score / total >= .8 ? 'אתם מכירים את מירי ממש טוב.'
    : score / total >= .5 ? 'יש לכם אוזן טובה לציטוטים.'
      : 'כנראה שלא תמיד קל להבדיל בין המציאות לדמיון.';

  return <div id="result">
    <div class="result-number">{score}<small> / {total}</small></div>
    <h2 class="result-title" tabIndex={-1} ref={titleRef}>{message}</h2>
    <p class="result-copy">עניתם נכון על {score} מתוך {total} שאלות. רוצים לנסות שוב?</p>
  </div>;
}
