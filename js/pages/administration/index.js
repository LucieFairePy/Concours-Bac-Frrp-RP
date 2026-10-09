// Page Administration — cahier des charges §14 (journalisation) et §15
// (état des données, architecture modulaire).
//
// Trois choses à y voir et rien d'inventé :
//   1. le journal des actions sensibles, mois par mois ;
//   2. l'état réel du stockage : où vont les dossiers, qui peut écrire ;
//   3. l'inventaire des modules et des places d'images encore à livrer.

import { byId, esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as auth from '../../core/auth.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import * as news from '../../core/news.js';
import { href } from '../../routes.js';
import { storageCard, journalCard, imagesCard, newsCard } from './cards.js';

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

async function counts() {
  const out = {};
  await Promise.all(records.MODULE_ORDER.map(async id => {
    try {
      out[id] = (await records.listModule(id)).length;
    } catch (error) {
      out[id] = null;
    }
  }));
  return out;
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

  template() {
    return `
      <div class="hero" data-img="administration">
        <div class="flag"></div>
        <small class="hero-kicker no-print">Gestion du portail</small>
        <h1>Administration</h1>
        <div class="mut">Journal des actions sensibles • état du dépôt • banque d’images • modules</div>
      </div>
      <div id="newsBox"></div>
      <div id="storageBox"></div>
      <div id="journalBox"></div>
      <div id="imagesBox">${imagesCard()}</div>`;
  },

  async mount({ alive }) {
    portal.setModuleBar(`
      <b>Administration</b>
      <span class="mut">${esc(auth.describeRole())}</span>
      <span class="spacer"></span>
      <a class="pnav-item" href="${href('parametres')}">Paramètres →</a>`);

    selectedMonth = '';
    availableMonths = [];
    await paintNews(true);
    await paintJournal(true);
    setHTML('storageBox', storageCard(Object.fromEntries(records.MODULE_ORDER.map(id => [id, null]))));

    const counted = await counts();
    if (!alive()) return;
    setHTML('storageBox', storageCard(counted));

    await paintNews(false);
    if (!alive()) return;

    availableMonths = await journal.months();
    selectedMonth = availableMonths[0] || new Date().toISOString().slice(0, 7);
    if (alive()) await paintJournal(false);
  }
};
