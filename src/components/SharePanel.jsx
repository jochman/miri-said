import { useLayoutEffect, useRef, useState } from 'preact/hooks';

function ShareIcon({ platform }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    {platform === 'instagram' ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></>
      : platform === 'whatsapp' ? <><path d="M20 11.5a8 8 0 0 1-12 7L3 20l1.5-5A8 8 0 1 1 20 11.5Z" /><path d="M8 7.5c0 4 2.5 6.5 6.5 7l1-2-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2Z" /></>
        : platform === 'facebook' ? <path d="M14.5 21v-8H18l.5-4h-4V7c0-1 .5-1.5 1.5-1.5h2V2.2L15 2c-3 0-4.5 1.8-4.5 5v2H7v4h3.5v8" />
          : <path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8" />}
  </svg>;
}

export function SharePanel({ score, total, complete }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState(false);
  const [instagram, setInstagram] = useState(false);
  const pending = useRef(false);
  const textareaRef = useRef();
  const url = document.querySelector('link[rel="canonical"]').href;
  const title = 'מה מירי אמרה?';
  const text = complete ? `עניתי נכון על ${score} מתוך ${total} שאלות במשחק ״מה מירי אמרה?״. כמה תצליחו אתם?`
    : 'מה מירי אמרה? האם תצליחו להבדיל בין ציטוט אמיתי למומצא?';
  const shareText = `${text}\n${url}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  useLayoutEffect(() => {
    if (fallback) { textareaRef.current.focus(); textareaRef.current.select(); }
  }, [fallback]);

  async function shareGame(platform = 'general') {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setStatus('');
    setFallback(false);
    setInstagram(false);
    try {
      // Native sharing must run in the click handler before any awaited work.
      if (typeof navigator.share === 'function') {
        try { await navigator.share({ title, text, url }); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(shareText);
        setStatus(platform === 'instagram' ? 'הטקסט והקישור הועתקו — הדביקו אותם בהודעה או בסטורי באינסטגרם.' : 'הטקסט והקישור הועתקו!');
      } catch {
        setFallback(true);
        setStatus('אפשר להעתיק את הטקסט ולשלוח לחברים.');
      }
      setInstagram(platform === 'instagram');
    } finally { pending.current = false; setBusy(false); }
  }

  return <section class="share-panel" aria-labelledby="share-heading">
    <h2 id="share-heading">{complete ? 'שתפו את התוצאה' : 'שתפו את המשחק'}</h2>
    <div class="share-actions">
      <button class="share-action" type="button" disabled={busy} onClick={() => shareGame('instagram')} title="פתיחת תפריט השיתוף — בחרו Instagram אם הוא זמין"><ShareIcon platform="instagram" /><span>אינסטגרם</span></button>
      <a class="share-action" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" aria-label="שיתוף בוואטסאפ"><ShareIcon platform="whatsapp" /><span>וואטסאפ</span></a>
      <a class="share-action" href={`https://www.facebook.com/login.php?next=${encodeURIComponent(facebookUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="שיתוף בפייסבוק" title="פתיחת Facebook לשיתוף — ייתכן שתידרש התחברות"><ShareIcon platform="facebook" /><span>פייסבוק</span></a>
      <button class="share-action" type="button" disabled={busy} onClick={() => shareGame()}><ShareIcon /><span>{typeof navigator.share === 'function' ? 'שיתוף במכשיר' : 'העתקת קישור'}</span></button>
    </div>
    <p class="share-status" role="status">{status}</p>
    {instagram && <a class="instagram-open" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">פתיחת Instagram להדבקת הטקסט ↗</a>}
    {fallback && <label class="share-fallback">העתיקו את הטקסט לשיתוף<textarea ref={textareaRef} readOnly rows={3} dir="auto" value={shareText} /></label>}
  </section>;
}
