// Historique centralisé — cahier des charges §12.
//
// Un seul historique pour tout le portail, pas trois historiques isolés :
// les lignes viennent de tous les modules déclarés dans records.js et sont
// normalisées à la même forme avant d'être affichées. Ajouter une formation
// au portail l'ajoute ici sans retoucher cette page.
//
// Les dossiers clôturés sont en lecture seule : un clic ouvre la fiche
// complète dans la page de son module, qui la rend telle qu'elle a été
// clôturée.

import { esc, setHTML, byId } from './core/dom.js';
import * as portal from './core/portal.js';
import * as records from './core/records.js';
import { imageStack } from './data/images.js';
import { decisionChip, scoreChip, DECISION_TEXT } from './views/chips.js';

const filters = {
  category: '',
  text: '',
  module: '',
  decision: '',
  from: '',
  to: '',
  examiner: ''
};

let loaded = { entries: [], errors: [] };

function hero() {
  setHTML('hero', `
    <section class="phero hhero">
      <div class="phero-img" style="background-image:${imageStack('historique')}"></div>
      <div class="phero-body">
        <div class="phero-kicker">Archives du portail</div>
        <h1>HISTORIQUE — BRIGADE ANTI-CRIMINALITÉ 75 N</h1>
        <div class="flag"></div>
        <p>
          Tous les dossiers clôturés du portail : concours d’intégration, formations
          et qualification Chef de Groupe. Recherche par nom, matricule, numéro de
          dossier, date, type, résultat ou examinateur.
        </p>
        <div class="hsearch">
          <input id="fText" placeholder="Nom, prénom, matricule ou numéro de dossier…"
                 value="${esc(filters.text)}" oninput="app.setText(this.value)">
        </div>
      </div>
    </section>`);
}

function categoryCards() {
  const cards = Object.values(records.CATEGORIES).map(category => {
    const count = loaded.entries.filter(entry => entry.category === category.id).length;
    const on = filters.category === category.id;

    return `
      <button class="hcat${on ? ' active' : ''}" onclick="app.setCategory('${category.id}')">
        <span class="hcat-img" style="background-image:${imageStack(category.id === 'cdg' ? 'cdg' : category.id)}"></span>
        <span class="hcat-body">
          <span class="hcat-count">${count}</span>
          <span class="hcat-title">${esc(category.label)}</span>
          <span class="hcat-blurb">${esc(category.blurb)}</span>
        </span>
      </button>`;
  }).join('');

  const all = filters.category === '';

  setHTML('categories', `
    <div class="psection-title">
      <h2>Grandes catégories</h2>
      <p class="mut">Clique une catégorie pour n’afficher que ses dossiers</p>
    </div>
    <div class="hcats">${cards}</div>
    <div class="hcat-all">
      <button class="${all ? 'primary' : ''}" onclick="app.setCategory('')">
        Toutes les catégories (${loaded.entries.length})
      </button>
    </div>`);
}

function filterBar() {
  const modules = records.MODULE_ORDER
    .filter(id => !filters.category || records.MODULES[id].category === filters.category)
    .map(id => `<option value="${id}" ${filters.module === id ? 'selected' : ''}>${esc(records.MODULES[id].label)}</option>`)
    .join('');

  const decisions = Object.keys(DECISION_TEXT)
    .map(code => `<option value="${code}" ${filters.decision === code ? 'selected' : ''}>${esc(DECISION_TEXT[code])}</option>`)
    .join('');

  setHTML('filters', `
    <div class="card hfilters">
      <div class="row">
        <div class="c3">
          <label>Type de dossier</label>
          <select onchange="app.setFilter('module',this.value)">
            <option value="">Tous les types</option>
            ${modules}
          </select>
        </div>
        <div class="c3">
          <label>Résultat</label>
          <select onchange="app.setFilter('decision',this.value)">
            <option value="">Tous les résultats</option>
            ${decisions}
          </select>
        </div>
        <div class="c2">
          <label>Du</label>
          <input type="date" value="${esc(filters.from)}" onchange="app.setFilter('from',this.value)">
        </div>
        <div class="c2">
          <label>Au</label>
          <input type="date" value="${esc(filters.to)}" onchange="app.setFilter('to',this.value)">
        </div>
        <div class="c2">
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
    const hay = [entry.id, entry.last, entry.first, entry.mat, entry.grade]
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
      <td class="hgo">ouvrir →</td>
    </tr>`;
}

function paint(pending) {
  const shown = loaded.entries.filter(matches);

  const errors = loaded.errors.length
    ? portal.errorBanner(
        `Catégories illisibles : ${loaded.errors.map(item => `${item.id} (${item.error})`).join(' • ')}`)
    : '';

  if (!shown.length) {
    setHTML('results', `
      ${errors}
      <div class="card">
        <p class="pempty">${pending
          ? 'Lecture des dossiers clôturés…'
          : loaded.entries.length
            ? 'Aucun dossier ne correspond aux filtres.'
            : 'Aucun dossier clôturé pour le moment.'}</p>
      </div>`);
    return;
  }

  setHTML('results', `
    ${errors}
    <div class="psection-title">
      <h2>${shown.length} dossier${shown.length > 1 ? 's' : ''}</h2>
      <p class="mut">Les dossiers clôturés sont en lecture seule</p>
    </div>
    <div class="card htable-wrap">
      <table class="htable">
        <tr>
          <th>N° de dossier</th><th>Candidat</th><th>Matricule</th><th>Date</th>
          <th>Type</th><th>Note</th><th>Résultat</th><th>Examinateur</th><th></th>
        </tr>
        ${shown.map(row).join('')}
      </table>
    </div>
    ${pending ? '<p class="mut">Mise à jour…</p>' : ''}`);
}

function repaint() {
  categoryCards();
  filterBar();
  paint(false);
}

const app = {
  setCategory(id) {
    filters.category = filters.category === id ? '' : id;
    filters.module = '';
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
    filters.module = '';
    filters.decision = '';
    filters.from = '';
    filters.to = '';
    filters.examiner = '';
    filters.text = '';
    const field = byId('fText');
    if (field) field.value = '';
    repaint();
  },

  open(moduleId, id) {
    const mod = records.MODULES[moduleId];
    if (!mod) return;
    window.location.href = `${mod.page}?dossier=${encodeURIComponent(id)}`;
  }
};

window.app = app;

async function boot() {
  const { session } = await portal.boot({ active: 'historique' });
  if (!session) return;

  // Un lien d'activité peut demander une catégorie précise.
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get('categorie');
  if (wanted && records.CATEGORIES[wanted]) filters.category = wanted;
  const text = params.get('dossier');
  if (text) filters.text = text;

  hero();
  portal.setModuleBar(`
    <b>Historique centralisé</b>
    <span class="mut">tous modules</span>
    <span class="spacer"></span>
    <a class="pnav-item" href="accueil.html">← Accueil</a>`);

  categoryCards();
  filterBar();
  paint(true);

  try {
    loaded = await records.listAll();
  } catch (error) {
    setHTML('results', portal.errorBanner(`Lecture impossible : ${error.message}`));
    return;
  }

  repaint();
}

boot();
