// Historique centralisé — documentation technique V4 §12.
//
// Le parcours est celui de la maquette V4 : trois familles (Formations,
// Concours, Examens), puis les types de dossier de la famille choisie, puis
// le tableau. Les lignes viennent de tous les modules déclarés dans
// records.js, normalisées à la même forme : ajouter une formation au
// portail l'ajoute ici sans retoucher cette page.
//
// Les dossiers clôturés sont en lecture seule : un clic ouvre la fiche
// complète dans la page de son module, telle qu'elle a été clôturée.

import { esc, setHTML, byId } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as records from '../../core/records.js';
import { href } from '../../routes.js';
import { imageStyle } from '../../data/images.js';
import { decisionChip, scoreChip, DECISION_TEXT } from '../../ui/chips.js';

/** Image de chaque type de dossier, reprise de la maquette V4. */
const MODULE_IMAGE = {
  concours: 'concours',
  negociation: 'negociation',
  'formation-cdg': 'cours-cdg',
  radio: 'cours-radio',
  antiterrorisme: 'cours-antiterrorisme',
  cdg: 'cdg'
};

function blankFilters() {
  return { category: '', module: '', text: '', decision: '', from: '', to: '', examiner: '' };
}

let filters = blankFilters();
let loaded = { entries: [], errors: [] };

// §18.3 — « Exporter un rapport » ouvre l'historique dans un mode où
// chaque ligne propose son export : la fiche finale du dossier, telle
// qu'elle a été clôturée, depuis la page de son module.
let exportMode = false;

function hero() {
  return `
    <section class="phero hhero">
      <div class="phero-img" style="${imageStyle('historique')}"></div>
      <div class="phero-body">
        <div class="phero-kicker">Archives &amp; dossiers</div>
        <h1>Historique BAC 75 N</h1>
        <div class="flag"></div>
        <p>
          Choisissez une famille pour accéder directement aux historiques
          correspondants, ou cherchez par nom, matricule, numéro de dossier
          ou examinateur.
        </p>
        <div class="hsearch">
          <input id="fText" placeholder="Rechercher un agent, matricule, dossier, examinateur…"
                 value="${esc(filters.text)}" oninput="app.setText(this.value)">
        </div>
      </div>
    </section>`;
}

function count(test) {
  return loaded.entries.filter(test).length;
}

/** Les trois familles — boutons numérotés de la maquette V4. */
function families() {
  const buttons = Object.values(records.CATEGORIES).map((category, index) => `
    <button class="history-family${filters.category === category.id ? ' active' : ''}"
            onclick="app.setCategory('${category.id}')">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div><b>${esc(category.label)}</b><small>${esc(category.blurb)}</small></div>
      <em>${count(entry => entry.category === category.id)}</em>
      <i aria-hidden="true">→</i>
    </button>`).join('');

  setHTML('families', `<div class="history-home">${buttons}</div>`);
}

/** Les types de la famille choisie — cartes illustrées de la maquette V4. */
function types() {
  if (!filters.category) {
    setHTML('types', '');
    return;
  }

  const category = records.CATEGORIES[filters.category];
  const cards = records.MODULE_ORDER
    .filter(id => records.MODULES[id].category === filters.category)
    .map(id => {
      const mod = records.MODULES[id];
      return `
        <button class="history-sub${filters.module === id ? ' active' : ''}"
                style="${imageStyle(MODULE_IMAGE[id] || 'historique')}"
                onclick="app.setModule('${id}')">
          <div>
            <b>${esc(mod.label)}</b>
            <small>${count(entry => entry.module === id)} dossier(s) clôturé(s)</small>
            <span>${filters.module === id ? 'AFFICHÉ ✓' : 'OUVRIR L’HISTORIQUE →'}</span>
          </div>
        </button>`;
    }).join('');

  setHTML('types', `
    <div class="history-head">
      <button onclick="app.setCategory('')">← Historique</button>
      <h2>${esc(category.label)}</h2>
    </div>
    <div class="history-subgrid">${cards}</div>`);
}

function filterBar() {
  const decisions = Object.keys(DECISION_TEXT)
    .map(code => `<option value="${code}" ${filters.decision === code ? 'selected' : ''}>${esc(DECISION_TEXT[code])}</option>`)
    .join('');

  setHTML('filters', `
    <div class="card hfilters">
      <div class="row">
        <div class="c3">
          <label>Résultat</label>
          <select onchange="app.setFilter('decision',this.value)">
            <option value="">Tous les résultats</option>
            ${decisions}
          </select>
        </div>
        <div class="c3">
          <label>Du</label>
          <input type="date" value="${esc(filters.from)}" onchange="app.setFilter('from',this.value)">
        </div>
        <div class="c3">
          <label>Au</label>
          <input type="date" value="${esc(filters.to)}" onchange="app.setFilter('to',this.value)">
        </div>
        <div class="c3">
          <label>Examinateur</label>
          <input value="${esc(filters.examiner)}" placeholder="nom"
                 oninput="app.setFilter('examiner',this.value)">
        </div>
      </div>
      <button onclick="app.reset()">Réinitialiser les filtres</button>
    </div>`);
}

function matches(entry) {
  if (filters.category && entry.category !== filters.category) return false;
  if (filters.module && entry.module !== filters.module) return false;
  if (filters.decision && entry.decision !== filters.decision) return false;
  if (filters.from && String(entry.date || '') < filters.from) return false;
  if (filters.to && String(entry.date || '') > filters.to) return false;

  if (filters.examiner) {
    const needle = filters.examiner.toLowerCase();
    if (!String(entry.examiner || '').toLowerCase().includes(needle)) return false;
  }

  if (filters.text) {
    const needle = filters.text.toLowerCase();
    const hay = [entry.id, entry.last, entry.first, entry.mat, entry.grade, entry.examiner]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(needle)) return false;
  }

  return true;
}

function row(entry) {
  const mod = records.MODULES[entry.module];
  const rectif = entry.rectifies
    ? `<span class="pchip pchip-mut">rectifie ${esc(entry.rectifies)}</span>`
    : entry.rectifiedBy
      ? `<span class="pchip pchip-wait">rectifié par ${esc(entry.rectifiedBy)}</span>`
      : '';

  return `
    <tr onclick="app.open('${esc(entry.module)}','${esc(entry.id)}')">
      <td class="hid">${esc(entry.id)}<br>${rectif}</td>
      <td>
        <b>${esc(records.fullName(entry) || '—')}</b>
        ${entry.grade ? `<br><span class="mut">${esc(entry.grade)}</span>` : ''}
      </td>
      <td>${esc(entry.mat || '—')}</td>
      <td>${esc(entry.date || '—')}</td>
      <td>${esc(mod ? mod.short : entry.module)}</td>
      <td>${scoreChip(entry.total, entry.max)}</td>
      <td>${decisionChip(entry.decision)}</td>
      <td>${esc(entry.examiner || '—')}</td>
      <td class="hgo">${exportMode ? 'exporter →' : 'ouvrir →'}</td>
    </tr>`;
}

function title() {
  if (filters.module) return records.MODULES[filters.module].label;
  if (filters.category) return records.CATEGORIES[filters.category].label;
  return 'Tous les dossiers';
}

function paint(pending) {
  const shown = loaded.entries.filter(matches);

  const errors = loaded.errors.length
    ? portal.errorBanner(
        `Historiques illisibles : ${loaded.errors.map(item => `${item.id} (${item.error})`).join(' • ')}`)
    : '';

  const head = `
    <div class="psection-title">
      <h2>${esc(title())} — ${shown.length} dossier${shown.length > 1 ? 's' : ''}</h2>
      <p class="mut">Les dossiers clôturés sont en lecture seule</p>
    </div>`;

  if (!shown.length) {
    setHTML('results', `
      ${errors}
      ${head}
      <div class="card">
        <p class="pempty">${pending
          ? 'Lecture des dossiers clôturés…'
          : loaded.entries.length
            ? 'Aucun dossier ne correspond à cette recherche.'
            : 'Aucun dossier enregistré dans cet historique pour le moment.'}</p>
      </div>`);
    return;
  }

  setHTML('results', `
    ${errors}
    ${exportMode
      ? '<div class="banner"><b>Export d’un rapport.</b> Choisis le dossier à exporter : sa fiche finale s’ouvre en lecture seule, avec le bouton PDF du module.</div>'
      : ''}
    ${head}
    <div class="card htable-wrap">
      <table class="htable">
        <tr>
          <th>Dossier</th><th>Agent</th><th>Matricule</th><th>Date</th>
          <th>Type</th><th>Note</th><th>Résultat</th><th>Examinateur</th><th></th>
        </tr>
        ${shown.map(row).join('')}
      </table>
    </div>
    ${pending ? '<p class="mut">Mise à jour…</p>' : ''}`);
}

function repaint() {
  families();
  types();
  paint(false);
}

const handlers = {
  setCategory(id) {
    filters.category = filters.category === id ? '' : id;
    filters.module = '';
    repaint();
  },

  setModule(id) {
    filters.module = filters.module === id ? '' : id;
    repaint();
  },

  setFilter(key, value) {
    filters[key] = value;
    paint(false);
  },

  setText(value) {
    filters.text = value;
    paint(false);
  },

  reset() {
    filters = { ...blankFilters(), category: filters.category, module: filters.module };
    const field = byId('fText');
    if (field) field.value = '';
    filterBar();
    paint(false);
  },

  open(moduleId, id) {
    const mod = records.MODULES[moduleId];
    if (mod) window.location.hash = href(mod.route, { dossier: id });
  }
};

/** Filtres demandés par l'adresse : famille, module, recherche, export. */
function fromParams(params) {
  filters = blankFilters();

  const legacy = records.LEGACY_CATEGORIES[params.get('categorie')];
  const wantedModule = params.get('module') || legacy;
  if (wantedModule && records.MODULES[wantedModule]) {
    filters.module = wantedModule;
    filters.category = records.MODULES[wantedModule].category;
  }

  const wantedCategory = params.get('famille') || params.get('categorie');
  if (wantedCategory && records.CATEGORIES[wantedCategory]) filters.category = wantedCategory;

  // `dossier` vient d'un lien d'activité, `q` de la recherche globale de
  // l'en-tête (§6.2) : les deux remplissent la même recherche.
  filters.text = params.get('dossier') || params.get('q') || '';
  exportMode = params.get('export') === '1';
}

export default {
  handlers,

  template({ params }) {
    fromParams(params);
    return `
      ${hero()}
      <div id="families"></div>
      <div id="types"></div>
      <div id="filters"></div>
      <div id="results"></div>`;
  },

  async mount({ alive }) {
    loaded = { entries: [], errors: [] };

    portal.setModuleBar(`
      <b>Historique centralisé</b>
      <span class="mut">${exportMode ? 'export d’un rapport' : 'tous modules'}</span>
      <span class="spacer"></span>
      <a class="pnav-item" href="${href('accueil')}">← Accueil</a>`);

    families();
    types();
    filterBar();
    paint(true);

    try {
      const result = await records.listAll();
      if (!alive()) return;
      loaded = result;
    } catch (error) {
      if (alive()) setHTML('results', portal.errorBanner(`Lecture impossible : ${error.message}`));
      return;
    }

    repaint();
  }
};
