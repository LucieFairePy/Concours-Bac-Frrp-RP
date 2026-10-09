// Historique — le parcours de l'archive V4 (app.js, `historique()`,
// `showHistoryGroup`, `showHistoryType`, `renderHistory`) : trois familles,
// puis les types de la famille choisie, puis le tableau du type avec sa
// recherche. Un clic sur une ligne ouvre la fiche résumée dans la fenêtre
// modale, comme l'archive.
//
// Les lignes ne sont plus celles de démonstration : ce sont les dossiers
// clôturés de tous les modules (records.listAll). La fiche résumée porte en
// plus « OUVRIR LE DOSSIER », qui ouvre le dossier complet, en lecture
// seule, dans la page de son module (href(route, { dossier })).

import { esc, setHTML, byId } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as records from '../../core/records.js';
import { href } from '../../routes.js';
import { kitVar } from '../../shell/asset.js';
import { decisionText } from '../../ui/chips.js';

/** Les familles et leurs types, avec les textes et visuels de l'archive. */
const GROUPS = {
  formations: {
    number: '01',
    title: 'FORMATIONS',
    blurb: 'Négociation · Chef de Groupe · Radio · Antiterrorisme',
    types: [
      { module: 'negociation', key: 'Négociation', title: 'FORMATION NÉGOCIATION', desc: 'Historique des formations, évaluations et validations Négociation BAC.', img: '04_HOME_CARD_FORMATION_NEGOCIATION.jpg' },
      { module: 'formation-cdg', key: 'Chef de Groupe', title: 'FORMATION CHEF DE GROUPE', desc: 'Sessions de formation et suivi de progression Chef de Groupe.', img: '09_FORMATION_CHEF_GROUPE_BANNER.jpg' },
      { module: 'radio', key: 'Radio', title: 'FORMATION RADIO', desc: 'Historique des sessions Radio, exercices et validations.', img: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg' },
      { module: 'antiterrorisme', key: 'Antiterrorisme', title: 'FORMATION ANTITERRORISME', desc: 'Sessions, exercices et évaluations de la formation Antiterrorisme.', img: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg' }
    ]
  },
  concours: {
    number: '02',
    title: 'CONCOURS',
    blurb: 'Concours d’intégration BAC',
    types: [
      { module: 'concours', key: 'Concours BAC', title: 'CONCOURS D’INTÉGRATION BAC', desc: 'Toutes les candidatures, sessions, résultats et dossiers finaux du concours.', img: '03_HOME_CARD_CONCOURS_INTEGRATION_BAC.jpg' }
    ]
  },
  examens: {
    number: '03',
    title: 'EXAMENS',
    blurb: 'Chef de Groupe et futurs examens',
    types: [
      { module: 'cdg', key: 'Examen Chef de Groupe', title: 'EXAMEN CHEF DE GROUPE', desc: 'Historique des examens de qualification Chef de Groupe.', img: '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg' }
    ]
  }
};

const TYPES = Object.values(GROUPS).flatMap(group => group.types);

/** Les décisions affichées en rouge, comme l'AJOURNÉ de l'archive. */
const WARN = new Set(['AJOURNE', 'RECALE', 'REFUSE', 'A_REVOIR']);

let loaded = { entries: [], errors: [] };
let pending = true;
let shown = null;      // module affiché dans le tableau, ou 'all'
let exportMode = false;

function typeOf(moduleId) {
  return TYPES.find(type => type.module === moduleId) || null;
}

function groupOf(moduleId) {
  return Object.keys(GROUPS).find(id => GROUPS[id].types.some(type => type.module === moduleId)) || 'formations';
}

function frDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value || '—');
}

/** Une ligne d'historique au format de l'archive. */
function line(entry) {
  const type = typeOf(entry.module);
  return {
    id: entry.id,
    module: entry.module,
    nom: records.fullName(entry) || '—',
    mat: entry.mat || '—',
    date: frDate(entry.date || entry.closedAt),
    type: type ? type.key : entry.typeLabel,
    note: entry.total === null || entry.total === undefined ? '—' : `${entry.total}/${entry.max}`,
    code: entry.decision,
    result: entry.decision ? decisionText(entry.decision) : 'EN COURS',
    exam: entry.examiner || '—',
    rectifies: entry.rectifies,
    rectifiedBy: entry.rectifiedBy
  };
}

function lines() {
  return loaded.entries.map(line);
}

// ── Les trois états de la page ─────────────────────────────────────────

function families() {
  return Object.entries(GROUPS).map(([id, group]) => `<button class="history-family" onclick="app.group('${id}')"><span>${group.number}</span><div><b>${group.title}</b><small>${esc(group.blurb)}</small></div><i>→</i></button>`).join('');
}

function showGroup(id) {
  shown = null;
  const group = GROUPS[id] || GROUPS.formations;
  setHTML('historyStage', `<div class="history-head"><button class="btn dark" onclick="app.root()">← HISTORIQUE</button><h2>${esc(id.toUpperCase())}</h2></div><div class="history-subgrid">${group.types.map(type => `<button class="history-sub" style="${kitVar('img', type.img)}" onclick="app.type('${type.module}')"><div><b>${type.title}</b><small>${esc(type.desc)}</small><span>OUVRIR L’HISTORIQUE →</span></div></button>`).join('')}</div>`);
}

function showType(moduleId, query) {
  shown = moduleId;
  const all = moduleId === 'all';
  const type = all ? null : typeOf(moduleId);
  const back = all ? 'app.root()' : `app.group('${groupOf(moduleId)}')`;
  const title = all ? (exportMode ? 'EXPORTER UN RAPPORT' : 'TOUS LES DOSSIERS') : type.key.toUpperCase();

  setHTML('historyStage', `<div class="history-head"><button class="btn dark" onclick="${back}">← RETOUR</button><div><small>HISTORIQUE</small><h2>${esc(title)}</h2></div></div>${exportMode && all ? '<p class="hint">Choisis le dossier à exporter : sa fiche finale s’ouvre en lecture seule, avec le bouton d’impression du module.</p>' : ''}<div class="field"><input id="histsearch" placeholder="Rechercher un agent, matricule, dossier, examinateur…" value="${esc(query || '')}" oninput="app.search()"></div><br><div class="table"><table><thead><tr><th>DOSSIER</th><th>AGENT</th><th>MATRICULE</th><th>DATE</th><th>TYPE</th><th>NOTE</th><th>RÉSULTAT</th><th>EXAMINATEUR</th></tr></thead><tbody id="histbody"></tbody></table></div>`);
  renderRows();
}

function renderRows() {
  if (!shown) return;
  const query = String(byId('histsearch')?.value || '').toLowerCase();

  const rows = lines()
    .filter(d => (shown === 'all' || d.module === shown)
      && [d.id, d.nom, d.mat, d.date, d.type, d.note, d.result, d.exam].join(' ').toLowerCase().includes(query))
    .map(d => `<tr onclick="app.open('${esc(d.module)}','${esc(d.id)}')"><td><b>${esc(d.id)}</b></td><td>${esc(d.nom)}</td><td>${esc(d.mat)}</td><td>${esc(d.date)}</td><td>${esc(d.type)}</td><td>${esc(d.note)}</td><td><span class="status ${WARN.has(d.code) ? 'warn' : d.code ? '' : 'info'}">${esc(d.result)}</span></td><td>${esc(d.exam)}</td></tr>`)
    .join('');

  const empty = pending
    ? 'Lecture des dossiers clôturés…'
    : 'Aucun dossier enregistré dans cette catégorie pour le moment.';

  setHTML('histbody', rows || `<tr><td colspan="8" class="emptyhist">${empty}</td></tr>`);
}

function paintErrors() {
  setHTML('historyErrors', loaded.errors.length
    ? portal.errorBanner(`Historiques illisibles : ${loaded.errors.map(item => `${item.id} (${item.error})`).join(' • ')}`)
    : '');
}

const handlers = {
  root() {
    shown = null;
    setHTML('historyStage', '');
  },

  group(id) {
    showGroup(id);
  },

  type(moduleId) {
    showType(moduleId, '');
  },

  search() {
    renderRows();
  },

  /** La fiche résumée de l'archive, puis l'ouverture du dossier complet. */
  open(moduleId, id) {
    const d = lines().find(item => item.module === moduleId && item.id === id);
    const mod = records.MODULES[moduleId];
    if (!d || !mod) return;

    const rectif = d.rectifies
      ? `<p class="hint">Version rectificative de ${esc(d.rectifies)}.</p>`
      : d.rectifiedBy ? `<p class="hint">Rectifié par ${esc(d.rectifiedBy)}.</p>` : '';

    portal.openModal(`<h2>${esc(d.id)}</h2><p><b>${esc(d.nom)}</b> · ${esc(d.mat)}</p><p>${esc(d.type)} · ${esc(d.date)}</p><div class="decision"><strong>${esc(d.result)}</strong><p>Note finale : ${esc(d.note)}</p></div><p>Examinateur : ${esc(d.exam)}</p>${rectif}<p class="hint">Le dossier clôturé s’ouvre en lecture seule dans son module : réponses, notes, observations, signatures et fiche finale.</p><div class="actions"><button class="btn" onclick="app.openRecord('${esc(moduleId)}','${esc(id)}')">${exportMode ? 'EXPORTER LA FICHE FINALE' : 'OUVRIR LE DOSSIER'}</button></div>`);
  },

  openRecord(moduleId, id) {
    const mod = records.MODULES[moduleId];
    portal.closeModal();
    if (mod) window.location.hash = href(mod.route, { dossier: id });
  }
};

/** L'état demandé par l'adresse : famille, type, recherche globale, export. */
function initial(params) {
  exportMode = params.get('export') === '1';
  const query = params.get('dossier') || params.get('q') || '';

  const legacy = records.LEGACY_CATEGORIES[params.get('categorie')];
  const wantedModule = params.get('module') || legacy;
  if (wantedModule && typeOf(wantedModule)) return () => showType(wantedModule, query);

  if (query || exportMode) return () => showType('all', query);

  const family = params.get('famille') || params.get('categorie');
  if (family && GROUPS[family]) return () => showGroup(family);

  return () => handlers.root();
}

let start = () => {};

export default {
  handlers,

  template({ params }) {
    start = initial(params);
    return `<div class="page"><div class="sectionHero" style="${kitVar('bg', '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg')}"><div><small>ARCHIVES &amp; DOSSIERS</small><h1>HISTORIQUE BAC 75 N</h1><p>Choisissez une famille pour accéder directement aux historiques correspondants.</p></div></div><div id="historyErrors"></div><div class="history-home" id="families">${families()}</div><div id="historyStage"></div></div>`;
  },

  async mount({ alive }) {
    loaded = { entries: [], errors: [] };
    pending = true;
    shown = null;
    start();

    try {
      const result = await records.listAll();
      if (!alive()) return;
      loaded = result;
    } catch (error) {
      if (alive()) setHTML('historyErrors', portal.errorBanner(`Lecture impossible : ${error.message}`));
    }
    pending = false;
    if (!alive()) return;
    paintErrors();
    renderRows();
  }
};
