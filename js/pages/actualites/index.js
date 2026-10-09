// Actualités BAC 75 N — les actualités qui alimentent le panneau de
// l'accueil. L'archive n'a pas de page Actualités ni d'entrée de menu : la
// page n'est pas dans la barre latérale, elle s'ouvre depuis une actualité
// de l'accueil et depuis l'Administration (« Actualités de l'accueil »).
//
// Elle est habillée avec les gabarits de l'archive : bannière de section,
// grandes cartes photo (`.cards2` / `.feature`), panneau `.contentCard`,
// tableau `.table`, grille de formulaire `.formgrid`.
//
// Trois vues : la liste, le détail d'une actualité (`?actu=<id>`), et pour
// les rôles qui portent le droit « paramètres », la publication et le
// retrait — chaque écriture passe au journal des actions sensibles.

import { byId, esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import { href } from '../../routes.js';
import * as auth from '../../core/auth.js';
import * as news from '../../core/news.js';
import * as journal from '../../core/journal.js';
import { imageSources, IMAGE_SLOTS } from '../../data/images.js';
import { NEWS_VISIBILITY } from '../../data/news.js';

let loaded = { items: [], seeded: true };

function longDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '—');
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Adresse complète de l'image d'une actualité, pour une variable CSS. */
function imageVar(name, slot) {
  const src = imageSources(slot).src;
  let url = src;
  try {
    url = new URL(src, document.baseURI).href;
  } catch (error) {
    url = src;
  }
  return `--${name}:url('${url}')`;
}

function card(item) {
  return `<a class="feature" href="${href('actualites', { actu: item.id })}" style="${imageVar('img', item.imageAsset)}"><div><span class="tag">${esc((item.sector || 'BAC 75 N').toUpperCase())}</span><h3>${esc(item.title.toUpperCase())}</h3><p>${esc(item.excerpt)}</p></div></a>`;
}

function manageCard() {
  if (!auth.can('settings')) return '';

  const rows = loaded.seeded
    ? '<tr><td colspan="4" class="emptyhist">Aucune actualité publiée : l’accueil affiche la sélection de départ.</td></tr>'
    : loaded.items.map(item => `<tr><td><b>${esc(String(item.publishedAt).slice(0, 10))}</b></td><td>${esc(item.title)}<br><span class="hint">${esc(item.sector || '—')} · ${esc(item.author || '—')}</span></td><td>${esc(NEWS_VISIBILITY[item.visibility].label)}</td><td><button class="link" onclick="app.remove('${esc(item.id)}')">RETIRER</button></td></tr>`).join('');

  const assets = Object.keys(IMAGE_SLOTS)
    .map(id => `<option value="${esc(id)}" ${id === 'actualite-nuit' ? 'selected' : ''}>${esc(id)}</option>`)
    .join('');

  const visibilities = Object.values(NEWS_VISIBILITY)
    .map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`)
    .join('');

  return `<div class="contentCard" style="margin-top:10px"><h3>ACTUALITÉS PUBLIÉES</h3><div class="table"><table><thead><tr><th>DATE</th><th>TITRE</th><th>VISIBILITÉ</th><th></th></tr></thead><tbody class="static">${rows}</tbody></table></div><h3>PUBLIER UNE ACTUALITÉ</h3><div class="formgrid"><div class="field"><label for="naTitle">TITRE</label><input id="naTitle" placeholder="Dispositif de contrôle renforcé"></div><div class="field"><label for="naSector">SECTEUR</label><input id="naSector" placeholder="Secteur Nord — nuit"></div><div class="field"><label for="naImage">IMAGE</label><select id="naImage">${assets}</select></div><div class="field"><label for="naVisibility">VISIBILITÉ</label><select id="naVisibility">${visibilities}</select></div><div class="field"><label for="naExcerpt">RÉSUMÉ AFFICHÉ SUR L’ACCUEIL</label><input id="naExcerpt" placeholder="Une phrase, pas plus."></div><div class="field"><label for="naAuthor">SIGNÉE PAR</label><input id="naAuthor" value="Direction BAC 75 N"></div></div><div class="field" style="margin-top:9px"><label for="naBody">CONTENU</label><textarea id="naBody" placeholder="Le texte complet de l’actualité."></textarea></div><div class="actions"><button class="btn" onclick="app.publish()">PUBLIER</button></div><div id="newsStatus"></div><p class="hint">Les actualités publiées remplacent la sélection de départ dans le panneau de l’accueil. Une actualité « direction » n’est visible que des rôles portant le droit « paramètres ».</p></div>`;
}

function list() {
  // Rien de publié : l'accueil tire la sélection de l'archive, qui renvoie
  // vers les modules ; il n'y a pas d'article à lister ici.
  const items = loaded.seeded ? [] : news.visibleTo(loaded.items);
  const cards = items.length
    ? `<div class="cards2">${items.map(card).join('')}</div>`
    : '<div class="contentCard"><p>Aucune actualité publiée. L’accueil affiche la sélection d’actualités BAC 75 N, renouvelée à chaque ouverture.</p></div>';

  setHTML('content', `${cards}${manageCard()}`);
}

function detail(id) {
  const item = news.visibleTo(loaded.items).find(entry => entry.id === id);

  if (!item) {
    setHTML('content', `<div class="contentCard"><h3>ACTUALITÉ INTROUVABLE</h3><p>Elle a pu être retirée, ou n’est pas visible pour ton rôle.</p><div class="actions"><button class="btn dark" onclick="app.back()">← TOUTES LES ACTUALITÉS</button></div></div>`);
    return;
  }

  const meta = [longDate(item.publishedAt), item.sector, item.author, item.visibility === 'direction' ? 'direction' : '']
    .filter(Boolean).map(esc).join(' · ');

  setHTML('content', `<div class="feature" style="${imageVar('img', item.imageAsset)};cursor:default"><div><span class="tag">${esc((item.sector || 'BAC 75 N').toUpperCase())}</span><h3>${esc(item.title.toUpperCase())}</h3><p>${meta}</p></div></div><div class="contentCard" style="margin-top:10px"><p style="white-space:pre-line">${esc(item.body || item.excerpt)}</p><div class="actions"><button class="btn dark" onclick="app.back()">← TOUTES LES ACTUALITÉS</button></div></div>`);
}

function status(html) {
  setHTML('newsStatus', html);
}

const handlers = {
  back() {
    window.location.hash = href('actualites');
  },

  async publish() {
    if (!auth.can('settings')) return;

    const item = {
      title: byId('naTitle')?.value.trim() || '',
      sector: byId('naSector')?.value.trim() || '',
      imageAsset: byId('naImage')?.value || 'actualite-nuit',
      excerpt: byId('naExcerpt')?.value.trim() || '',
      body: byId('naBody')?.value.trim() || '',
      author: byId('naAuthor')?.value.trim() || '',
      visibility: byId('naVisibility')?.value || 'portail',
      publishedAt: new Date().toISOString()
    };

    if (!item.title) {
      status(portal.errorBanner('Une actualité sans titre ne part pas.'));
      return;
    }

    status('<div class="banner">Publication…</div>');
    try {
      await news.publish(item);
      loaded = await news.load();
      list();
      status(portal.okBanner(`Actualité publiée : ${item.title}`));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'actualite.publication',
        target: item.title,
        detail: `${item.sector || 'sans secteur'} • ${item.visibility}`
      });
    } catch (error) {
      status(portal.errorBanner(`Échec : ${error.message}`));
    }
  },

  async remove(id) {
    if (!auth.can('settings')) return;

    const item = loaded.items.find(entry => entry.id === id);
    if (!item) return;
    if (!window.confirm(`Retirer l’actualité « ${item.title} » ?`)) return;

    status('<div class="banner">Retrait…</div>');
    try {
      await news.remove(id);
      loaded = await news.load();
      list();
      status(portal.okBanner('Actualité retirée.'));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'actualite.retrait',
        target: item.title,
        detail: ''
      });
    } catch (error) {
      status(portal.errorBanner(`Échec : ${error.message}`));
    }
  }
};

export default {
  handlers,

  template() {
    return `<div class="page"><div class="sectionHero" style="${imageVar('bg', 'actualite-nuit')}"><div><small>BRIGADE ANTI-CRIMINALITÉ 75 N</small><h1>ACTUALITÉS BAC 75 N</h1><p>Notes de service, retours d’expérience et informations de session.</p></div></div><div id="content"><p class="hint">Lecture des actualités…</p></div></div>`;
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
