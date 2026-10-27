import { render } from 'preact';
import { App } from './App.jsx';

function mountGame(catalog) {
  const app = document.querySelector('#app');
  // Preact does not remove the static fallback when mounting a fresh tree.
  app.replaceChildren();
  render(<App catalog={catalog} />, app);
}

if (location.protocol === 'file:') {
  mountGame(window.offlineQuotes);
} else {
  fetch('quotes.json')
    .then(response => { if (!response.ok) throw new Error('Could not load quotes'); return response.json(); })
    .then(mountGame)
    .catch(() => mountGame(window.offlineQuotes));
}
