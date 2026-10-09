// Actualités BAC 75 N — documentation technique V4 §7 et §18.1.
//
// Deux vues dans une page : la liste complète (« Voir tout » de l'accueil)
// et le détail d'une actualité — titre, date, secteur, contenu, image.
// L'écriture se fait depuis l'Administration ; ici, on lit.

import { esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import { href } from '../../routes.js';
import * as auth from '../../core/auth.js';
import * as news from '../../core/news.js';
import { imageStyle } from '../../data/images.js';

let loaded = { items: [], seeded: true };

function longDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '—');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function hero() {
  return `
    <section class="phero">
      <div class="phero-img" style="${imageStyle('actualite-nuit')}"></div>
      <div class="phero-body">
        <div class="phero-kicker">Brigade Anti-Criminalité 75 N</div>
        <h1>Actualités BAC 75 N</h1>
        <div class="flag"></div>
        <p>
          Notes de service, retours d’expérience et informations de session.
          Les actualités marquées « direction » ne sont visibles que des rôles
          qui portent le droit « paramètres ».
        </p>
      </div>
    </section>`;
}

/** Une actualité, au gabarit des grandes cartes photo de la maquette. */
function articleCard(item) {
  return `
    <a class="pfeature" href="${href('actualites', { actu: item.id })}" style="${imageStyle(item.imageAsset)}">
      <span class="pfeature-more">${esc(String(item.publishedAt || '').slice(0, 10))}</span>
      <div class="pfeature-body">
        <span class="ptag">${esc(item.sector || 'BAC 75 N')}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.excerpt)}</p>
      </div>
    </a>`;
}

function publishLink() {
  return auth.can('accounts')
    ? `<a href="${href('administration')}">Publier une actualité →</a>`
    : '';
}

function list() {
  const items = news.visibleTo(loaded.items);

  if (!items.length) {
    setHTML('content', '<div class="card"><p class="pempty">Aucune actualité publiée.</p></div>');
    return;
  }

  setHTML('content', `
    ${loaded.seeded
      ? `<div class="banner">Actualités de départ. Publie les tiennes depuis l’<a href="${href('administration')}">Administration</a>.</div>`
      : ''}
    <div class="pfeatures three">${items.map(articleCard).join('')}</div>
    <p class="pfoot">
      <span>${items.length} actualité${items.length > 1 ? 's' : ''} — la plus récente d’abord</span>
      ${publishLink()}
    </p>`);
}

function detail(id) {
  const item = news.visibleTo(loaded.items).find(entry => entry.id === id);

  if (!item) {
    setHTML('content', `
      <div class="card">
        <h2>Actualité introuvable</h2>
        <p class="mut">Elle a pu être retirée, ou n’est pas visible pour ton rôle.</p>
        <a class="pnav-item" href="${href('actualites')}">← Toutes les actualités</a>
      </div>`);
    return;
  }

  setHTML('content', `
    <article class="pcontent">
      <div class="pnews-banner" style="${imageStyle(item.imageAsset)}"></div>
      <span class="ptag">${esc(item.sector || 'BAC 75 N')}</span>
      <h3 class="pnews-title">${esc(item.title)}</h3>
      <p class="mut">
        ${esc(longDate(item.publishedAt))}
        ${item.sector ? ` • ${esc(item.sector)}` : ''}
        ${item.author ? ` • ${esc(item.author)}` : ''}
        ${item.visibility === 'direction' ? ' • <b>direction</b>' : ''}
      </p>
      <p class="pnews-body">${esc(item.body || item.excerpt)}</p>
      <div class="pactions">
        <a class="pnav-item" href="${href('actualites')}">← Toutes les actualités</a>
      </div>
    </article>`);
}

export default {
  mainClass: 'pportal',

  template() {
    return `
      ${hero()}
      <div id="content"><div class="card"><p class="pempty">Lecture des actualités…</p></div></div>`;
  },

  async mount({ params, alive }) {
    try {
      loaded = await news.load();
    } catch (error) {
      if (alive()) setHTML('content', portal.errorBanner(`Actualités illisibles : ${error.message}`));
      return;
    }
    if (!alive()) return;

    const wanted = params.get('actu');
    if (wanted) detail(wanted);
    else list();
  }
};
