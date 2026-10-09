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
        <h1>ACTUALITÉS</h1>
        <div class="flag"></div>
        <p>
          Notes de service, retours d’expérience et informations de session.
          Les actualités marquées « direction » ne sont visibles que des rôles
          qui portent le droit « paramètres ».
        </p>
      </div>
    </section>`;
}

function articleCard(item) {
  return `
    <a class="pcard" href="${href('actualites', { actu: item.id })}">
      <span class="pcard-img" style="${imageStyle(item.imageAsset)}"></span>
      <span class="pcard-tag">${esc(item.sector || 'BAC 75 N')}</span>
      <span class="pcard-body">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.excerpt)}</p>
        <span class="pcard-go">Lire →</span>
      </span>
      <span class="pcard-accent"></span>
    </a>`;
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
    <div class="psection-title">
      <h2>${items.length} actualité${items.length > 1 ? 's' : ''}</h2>
      <p class="mut">La plus récente d’abord</p>
    </div>
    <div class="pcards">${items.map(articleCard).join('')}</div>`);
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
    <article class="card">
      <div class="co-banner" style="${imageStyle(item.imageAsset)};border-radius:11px;min-height:180px;background-size:cover;background-position:center"></div>
      <h2 style="margin-top:14px">${esc(item.title)}</h2>
      <p class="mut">
        ${esc(longDate(item.publishedAt))}
        ${item.sector ? ` • ${esc(item.sector)}` : ''}
        ${item.author ? ` • ${esc(item.author)}` : ''}
        ${item.visibility === 'direction' ? ' • <b>direction</b>' : ''}
      </p>
      <p class="answer">${esc(item.body || item.excerpt)}</p>
      <a class="pnav-item" href="${href('actualites')}">← Toutes les actualités</a>
    </article>`);
}

export default {
  template() {
    return `
      ${hero()}
      <div id="content"><div class="card"><p class="pempty">Lecture des actualités…</p></div></div>`;
  },

  async mount({ params, alive }) {
    portal.setModuleBar(`
      <b>Actualités BAC 75 N</b>
      <span class="mut">informations de service</span>
      <span class="spacer"></span>
      ${auth.can('accounts') ? `<a class="pnav-item" href="${href('administration')}">Publier une actualité →</a>` : ''}
      <a class="pnav-item" href="${href('accueil')}">← Accueil</a>`);

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
