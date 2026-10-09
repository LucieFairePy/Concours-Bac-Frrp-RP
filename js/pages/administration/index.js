// Page Administration — cahier des charges §14 (journalisation) et §15
// (état des données, architecture modulaire).
//
// En tête, le gabarit de la maquette V4 : quatre tuiles chiffrées puis le
// journal récent. Les chiffres sont comptés sur les données réelles, jamais
// écrits en dur (overview). Dessous, rien d'inventé :
//   1. les actualités publiées sur l'accueil ;
//   2. l'état réel du stockage : où vont les dossiers, qui peut écrire ;
//   3. le journal des actions sensibles, mois par mois ;
//   4. l'inventaire des places d'images encore à livrer.

import { byId, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as auth from '../../core/auth.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import * as news from '../../core/news.js';
import * as store from '../../core/store.js';
import * as lifecycle from '../../core/lifecycle.js';
import { storageCard, journalCard, imagesCard, newsCard, metricsCard, recentCard } from './cards.js';

let selectedMonth = '';
let availableMonths = [];
let newsState = { items: [], seeded: true };

async function paintNews(pending) {
  if (pending) {
    setHTML('newsBox', '<div class="card"><h2>Actualités BAC 75 N</h2><p class="pempty">Lecture…</p></div>');
    return;
  }

  try {
    newsState = await news.load();
  } catch (error) {
    setHTML('newsBox', portal.errorBanner(`Actualités illisibles : ${error.message}`));
    return;
  }

  setHTML('newsBox', newsCard(newsState));
}

/** Le module d'un fichier de brouillon, d'après le nom que records.js lui donne. */
function draftModule(name) {
  const marker = '@@';
  const heads = records.MODULE_ORDER
    .filter(id => !records.MODULES[id].legacy)
    .map(id => ({ id, head: records.MODULES[id].draft(marker).replace(/^drafts\//, '').split(marker)[0] }))
    .filter(item => item.head)
    .sort((a, b) => b.head.length - a.head.length);
  const found = heads.find(item => name.startsWith(item.head));
  return found ? found.id : 'concours';
}

/**
 * Les brouillons ouverts, tous examinateurs confondus : un listing du
 * dossier `drafts/` et une lecture par fichier. Les brouillons de la
 * session courante sont relus par records.loadDraft, parce qu'en mode
 * local celui du concours ne vit pas dans ce dossier.
 */
async function openDrafts(login) {
  const found = new Map();
  let unreadable = 0;

  let files = [];
  try {
    files = (await store.listData('drafts')).filter(file => file.name.endsWith('.json'));
  } catch (error) {
    files = [];
  }

  await Promise.all(files.map(async file => {
    try {
      const record = await store.readData(`drafts/${file.name}`);
      if (record) found.set(file.name, { module: draftModule(file.name), record });
    } catch (error) {
      unreadable += 1;
    }
  }));

  if (login) {
    await Promise.all(records.MODULE_ORDER.map(async id => {
      const name = records.MODULES[id].draft(login).replace(/^drafts\//, '');
      if (found.has(name)) return;
      try {
        const record = await records.loadDraft(id, login);
        if (record) found.set(name, { module: id, record });
      } catch (error) {
        unreadable += 1;
      }
    }));
  }

  return { open: [...found.values()].filter(item => !item.record.locked), unreadable };
}

/** Les quatre tuiles de la maquette, comptées sur les données. */
async function overview() {
  const login = auth.current() ? auth.current().login : '';

  const perModule = {};
  const errors = [];
  let closed = 0;
  await Promise.all(records.MODULE_ORDER.map(async id => {
    try {
      perModule[id] = (await records.listModule(id)).length;
      closed += perModule[id];
    } catch (error) {
      perModule[id] = null;
      errors.push(`historique ${records.MODULES[id].short} illisible`);
    }
  }));

  const drafts = await openDrafts(login);
  const correcting = drafts.open.filter(item =>
    ['correction', 'decision'].includes(lifecycle.status(item.module, item.record)));
  if (drafts.unreadable) errors.push(`${drafts.unreadable} brouillon(s) illisible(s)`);

  return {
    open: drafts.open.length,
    correcting: correcting.length,
    closed,
    alerts: errors,
    perModule
  };
}

/** Les dernières lignes du journal, sur les deux derniers mois au plus. */
async function recentLines(months) {
  const lines = [];
  for (const month of months.slice(0, 2)) {
    lines.push(...await journal.read(month));
    if (lines.length >= 5) break;
  }
  return lines.slice(0, 5);
}

async function paintJournal(pending) {
  let lines = [];
  if (!pending && selectedMonth) {
    try {
      lines = await journal.read(selectedMonth);
    } catch (error) {
      setHTML('journalBox', portal.errorBanner(`Journal illisible : ${error.message}`));
      return;
    }
  }
  setHTML('journalBox', journalCard(lines, pending, { months: availableMonths, selected: selectedMonth }));
}

const handlers = {
  async month(value) {
    selectedMonth = value;
    await paintJournal(false);
  },

  async publishNews() {
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
      setHTML('newsStatus', portal.errorBanner('Une actualité sans titre ne part pas.'));
      return;
    }

    setHTML('newsStatus', '<div class="banner">Publication…</div>');
    try {
      await news.publish(item);
      await paintNews(false);
      setHTML('newsStatus', portal.okBanner(`Actualité publiée : ${item.title}`));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'actualite.publication',
        target: item.title,
        detail: `${item.sector || 'sans secteur'} • ${item.visibility}`
      });
    } catch (error) {
      setHTML('newsStatus', portal.errorBanner(`Échec : ${error.message}`));
    }
  },

  async removeNews(id) {
    if (!auth.can('settings')) return;

    const item = newsState.items.find(entry => entry.id === id);
    if (!item) return;
    if (!window.confirm(`Retirer l’actualité « ${item.title} » ?`)) return;

    setHTML('newsStatus', '<div class="banner">Retrait…</div>');
    try {
      await news.remove(id);
      await paintNews(false);
      setHTML('newsStatus', portal.okBanner('Actualité retirée.'));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'actualite.retrait',
        target: item.title,
        detail: ''
      });
    } catch (error) {
      setHTML('newsStatus', portal.errorBanner(`Échec : ${error.message}`));
    }
  }
};

export default {
  handlers,
  mainClass: 'pportal',

  template() {
    return `
      <div class="hero" data-img="administration">
        <div class="flag"></div>
        <small class="hero-kicker no-print">Gestion du portail</small>
        <h1>Administration</h1>
        <div class="mut">Suivi des sessions, validations et actions réservées aux responsables.</div>
      </div>
      <div id="metricsBox">${metricsCard(null)}</div>
      <div id="recentBox">${recentCard(null)}</div>
      <div id="newsBox"></div>
      <div id="storageBox"></div>
      <div id="journalBox"></div>
      <div id="imagesBox">${imagesCard()}</div>`;
  },

  async mount({ alive }) {
    selectedMonth = '';
    availableMonths = [];
    await paintNews(true);
    await paintJournal(true);
    setHTML('storageBox', storageCard(Object.fromEntries(records.MODULE_ORDER.map(id => [id, null]))));

    let figures = null;
    try {
      figures = await overview();
    } catch (error) {
      if (alive()) setHTML('metricsBox', portal.errorBanner(`Tableau de bord illisible : ${error.message}`));
    }
    if (!alive()) return;
    if (figures) {
      setHTML('metricsBox', metricsCard(figures));
      setHTML('storageBox', storageCard(figures.perModule));
    }

    availableMonths = await journal.months();
    if (!alive()) return;
    try {
      setHTML('recentBox', recentCard(await recentLines(availableMonths)));
    } catch (error) {
      setHTML('recentBox', portal.errorBanner(`Journal illisible : ${error.message}`));
    }

    await paintNews(false);
    if (!alive()) return;

    selectedMonth = availableMonths[0] || new Date().toISOString().slice(0, 7);
    if (alive()) await paintJournal(false);
  }
};
