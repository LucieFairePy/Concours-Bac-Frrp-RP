// Page Administration — celle de l'archive V4 (app.js, `admin()`) : la
// bannière, quatre tuiles chiffrées, le journal récent.
//
// Les chiffres et le journal sont lus sur les données réelles, jamais
// écrits en dur. Sous le journal, une rangée de boutons ouvre ce que
// l'archive n'avait pas et que le portail garde : la gestion des
// actualités de l'accueil (page Actualités), le journal complet des actions
// sensibles et l'état du stockage, ces deux derniers dans la fenêtre modale.

import { setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as auth from '../../core/auth.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import * as store from '../../core/store.js';
import * as lifecycle from '../../core/lifecycle.js';
import { href } from '../../routes.js';
import { metricsCard, recentCard, journalView, storageView } from './cards.js';

let selectedMonth = '';
let availableMonths = [];
let figures = null;

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

/** Les quatre tuiles, comptées sur les données. */
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

  return { open: drafts.open.length, correcting: correcting.length, closed, alerts: errors, perModule };
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

async function showJournal() {
  portal.openModal(journalView([], true, { months: availableMonths, selected: selectedMonth }));
  let lines = [];
  try {
    lines = selectedMonth ? await journal.read(selectedMonth) : [];
  } catch (error) {
    portal.openModal(`<h2>JOURNAL DES ACTIONS SENSIBLES</h2>${portal.errorBanner(`Journal illisible : ${error.message}`)}`);
    return;
  }
  portal.openModal(journalView(lines, false, { months: availableMonths, selected: selectedMonth }));
}

const handlers = {
  journal() {
    return showJournal();
  },

  async month(value) {
    selectedMonth = value;
    await showJournal();
  },

  storage() {
    const counts = figures ? figures.perModule : Object.fromEntries(records.MODULE_ORDER.map(id => [id, null]));
    portal.openModal(storageView(counts));
  },

  news() {
    window.location.hash = href('actualites');
  }
};

export default {
  handlers,

  template() {
    return `<div class="page"><div class="sectionHero" style="--bg:none"><div><small>GESTION DU PORTAIL</small><h1>ADMINISTRATION</h1><p>Suivi des sessions, validations et actions réservées aux responsables.</p></div></div><div id="metricsBox">${metricsCard(null)}</div><div id="recentBox">${recentCard(null)}</div><div class="actions"><button class="btn dark" onclick="app.news()">ACTUALITÉS DE L’ACCUEIL</button><button class="btn dark" onclick="app.journal()">JOURNAL DES ACTIONS SENSIBLES</button><button class="btn dark" onclick="app.storage()">MODULES ET STOCKAGE</button></div></div>`;
  },

  async mount({ alive }) {
    selectedMonth = '';
    availableMonths = [];
    figures = null;

    try {
      figures = await overview();
    } catch (error) {
      if (alive()) setHTML('metricsBox', portal.errorBanner(`Tableau de bord illisible : ${error.message}`));
    }
    if (!alive()) return;
    if (figures) setHTML('metricsBox', metricsCard(figures));

    try {
      availableMonths = await journal.months();
      if (!alive()) return;
      selectedMonth = availableMonths[0] || new Date().toISOString().slice(0, 7);
      setHTML('recentBox', recentCard(await recentLines(availableMonths)));
    } catch (error) {
      if (alive()) setHTML('recentBox', portal.errorBanner(`Journal illisible : ${error.message}`));
    }
  }
};
