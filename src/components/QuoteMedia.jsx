import { useEffect, useRef } from 'preact/hooks';

// Cache script loads across questions, while each component owns its player.
const scripts = new Map();
function loadScript(src, getLibrary) {
  if (getLibrary()) return Promise.resolve(getLibrary());
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => getLibrary() ? resolve(getLibrary()) : reject(new Error('Media library unavailable'));
      script.onerror = () => { script.remove(); reject(new Error('Media library unavailable')); };
      document.head.append(script);
    }).catch(error => { scripts.delete(src); throw error; }));
  }
  return scripts.get(src);
}

function stopPlayer(player) {
  player.pause();
  player.removeAttribute('src');
  player.load();
}

function HlsVideo({ src }) {
  const playerRef = useRef();
  useEffect(() => {
    const player = playerRef.current;
    let cancelled = false;
    let hls;
    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = src;
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.7.3/dist/hls.min.js', () => window.Hls)
        .then(Hls => {
          if (cancelled || !Hls.isSupported()) return;
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(player);
        }).catch(() => { /* The article link remains available. */ });
    }
    return () => { cancelled = true; hls?.destroy(); stopPlayer(player); };
  }, [src]);
  return <video ref={playerRef} controls playsInline preload="none" aria-label="סרטון הציטוט מתוך ynet" />;
}

function AudioPlayer({ src }) {
  const playerRef = useRef();
  useEffect(() => {
    const player = playerRef.current;
    return () => stopPlayer(player);
  }, [src]);
  return <audio ref={playerRef} controls preload="none" aria-label="האזנה לציטוט של מירי רגב" src={src} />;
}

function XPost({ url }) {
  const containerRef = useRef();
  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;
    loadScript('https://platform.twitter.com/widgets.js', () => window.twttr?.widgets)
      .then(widgets => { if (!cancelled) widgets.load(container); })
      .catch(() => { /* The direct post link remains available. */ });
    return () => { cancelled = true; };
  }, [url]);
  // X owns the contents of this wrapper after it replaces the blockquote.
  return <div ref={containerRef}><blockquote class="twitter-tweet" data-dnt="true" data-conversation="none">
    <ExternalLink href={url}>הסרטון של חדשות 13</ExternalLink>
  </blockquote></div>;
}

function ExternalLink({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function Embed({ src, title, youtube = false }) {
  return <iframe src={src} title={title} loading="lazy" referrerPolicy={youtube ? 'strict-origin-when-cross-origin' : undefined}
    allow={youtube ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' : 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'} allowFullScreen />;
}

function getMedia(question) {
  try {
    const audio = new URL(question.audio);
    if (audio.protocol === 'https:' && audio.hostname === 'vod-progressive.ynethd.com') return { type: 'audio', url: audio.href };
  } catch { /* Try the optional video instead. */ }
  try {
    const url = new URL(question.video);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'hls-video-ynet.ynethd.com' && url.protocol === 'https:' && url.pathname.endsWith('.m3u8')) return { type: 'hls', url: url.href };
    if (['facebook.com', 'm.facebook.com'].includes(host)) {
      const id = ['/watch/', '/watch'].includes(url.pathname) ? url.searchParams.get('v') : null;
      if (id && /^\d+$/.test(id)) return { type: 'facebook', url: `https://www.facebook.com/watch/?v=${id}` };
    }
    if (['x.com', 'twitter.com'].includes(host)) {
      const post = url.pathname.match(/^\/([a-zA-Z0-9_]+)\/status\/(\d+)\/?$/);
      if (post) return { type: 'x', url: `https://twitter.com/${post[1]}/status/${post[2]}` };
    }
    const shortsId = host === 'youtube.com' ? url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})\/?$/)?.[1] : null;
    const id = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' ? shortsId || url.searchParams.get('v') : null;
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { type: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
  } catch { /* Invalid media leaves the quote and source readable. */ }
  return null;
}

export function QuoteMedia({ question }) {
  const media = getMedia(question);
  if (!media) return null;
  const onlinePage = ['http:', 'https:'].includes(location.protocol);
  return <section class="quote-media" aria-label="הקלטת הציטוט">
    <h2 class="media-heading">הציטוט במקור</h2>
    {media.type === 'audio' ? <div class="quote-audio">
      <AudioPlayer src={media.url} />
      <p>מתוך רדיו "קול חי", כפי שפורסם ב־ynet.</p>
      <ExternalLink href={question.source}>להאזנה בכתבה ב־ynet ↗</ExternalLink>
    </div> : <div class={`quote-video${media.type === 'x' ? ' quote-video-x' : ''}`}>
      {media.type === 'hls' && <>
        <HlsVideo src={media.url} />
        <ExternalLink href={question.source}>לצפייה בכתבה ב־ynet ↗</ExternalLink>
      </>}
      {media.type === 'facebook' && <>
        {onlinePage && <Embed src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(media.url)}&show_text=false&width=500`} title="סרטון הציטוט של מירי רגב בפייסבוק" />}
        <ExternalLink href={media.url}>▶ לצפייה בסרטון בפייסבוק ↗</ExternalLink>
      </>}
      {media.type === 'x' && <>
        {onlinePage && <XPost url={media.url} />}
        <ExternalLink href={media.url.replace('twitter.com', 'x.com')}>▶ לצפייה בסרטון ב־X ↗</ExternalLink>
      </>}
      {media.type === 'youtube' && <>
        {onlinePage ? <Embed src={`https://www.youtube-nocookie.com/embed/${media.id}`} title="סרטון הציטוט של מירי רגב" youtube /> : <p>לצפייה בסרטון:</p>}
        <ExternalLink href={media.url}>{onlinePage ? 'לצפייה ב־YouTube ↗' : '▶ לצפייה ב־YouTube ↗'}</ExternalLink>
      </>}
    </div>}
  </section>;
}
