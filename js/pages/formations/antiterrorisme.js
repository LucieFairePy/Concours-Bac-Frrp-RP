// Page de la Formation Antiterrorisme — le module de l'archive V4
// (modules/formation-antiterrorisme.html) : un cours en treize chapitres,
// rien d'autre. Ni identité, ni évaluation à saisir, ni fiche : l'archive
// n'en a pas, donc la page n'écrit aucun dossier.
//
// Garde : un dossier de l'ancien parcours (`?dossier=` depuis l'historique)
// reste lisible. Il est lu par records.js et sa fiche finale A4 est rendue
// en lecture seule par fiche.js, avec le contenu sur lequel il a été passé
// (js/data/formations/antiterrorisme-dossiers.js).

import { CONFIG } from '../../config.js';
import { setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as records from '../../core/records.js';
import { state as shared } from '../../core/state.js';
import { migrateFormation } from '../../core/formation.js';
import { ANTITERRORISME } from '../../data/formations/antiterrorisme.js';
import { ANTITERRORISME_DOSSIERS } from '../../data/formations/antiterrorisme-dossiers.js';
import { renderFormationFiche } from './fiche.js';
import * as layout from './layouts/antiterrorisme.js';

const course = ANTITERRORISME;
const MODULE = course.module;

let current = 0;
let record = null;

/** Affiche le chapitre `index`, comme show() dans l'archive. */
function show(index) {
  const chapters = [...document.querySelectorAll('.m-anti .at-chapter')];
  const navs = [...document.querySelectorAll('.m-anti .at-nav')];
  if (!chapters.length) return;

  current = Math.max(0, Math.min(chapters.length - 1, index));
  navs.forEach(node => node.classList.remove('active'));
  chapters.forEach(node => node.classList.remove('active'));
  if (navs[current]) navs[current].classList.add('active');
  chapters[current].classList.add('active');
  window.scrollTo({ top: 225, behavior: 'smooth' });
}

async function openDossier(id) {
  portal.setSync('ouverture…');
  try {
    const found = await records.get(MODULE, id);
    if (!found) {
      portal.setSync('');
      portal.setBanner(portal.errorBanner(`Dossier ${id} introuvable dans cette formation.`));
      return;
    }
    const settings = { ...CONFIG.defaultCommand, ...shared.settings };
    record = migrateFormation(found, ANTITERRORISME_DOSSIERS, settings);
    renderFormationFiche(ANTITERRORISME_DOSSIERS, record);
    portal.setSync('— lecture seule');
  } catch (error) {
    portal.setSync('');
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
  }
}

const handlers = {
  show,

  step(delta) {
    show(current + Number(delta));
  },

  /** Ouvre un chapitre par son identifiant (chap-01 … chap-13). */
  openChapter(id) {
    const index = course.chapters.findIndex(chapter => chapter.id === id);
    if (index >= 0) show(index);
  },

  downloadPdf() {
    if (!record) return;
    const name = `${String(record.c.last).toUpperCase()} ${record.c.first}`.trim();
    const previous = document.title;
    document.title = name ? `${record.id} — ${name}` : record.id;
    window.print();
    document.title = previous;
  }
};

export default {
  handlers,

  template({ params } = {}) {
    const id = params && params.get('dossier');
    return id ? layout.dossierPage(course, id) : layout.page(course);
  },

  async mount({ params }) {
    current = 0;
    record = null;
    const id = params.get('dossier');
    if (id) await openDossier(id);
    else setHTML('coursWrap', layout.main(course));
  },

  // Rien n'est saisi sur cette page : on la quitte librement.
  canLeave() {
    return true;
  }
};
