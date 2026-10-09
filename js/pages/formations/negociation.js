// Page de la Formation Négociation — le module de l'archive V4, à part du
// moteur commun des formations (engine.js) : l'archive n'a pas de parcours
// Identité → Cours → Évaluation → Correction → Fiche finale, seulement vingt
// chapitres à lire et une grille /100 à l'écran, sans rien enregistrer.
//
// Un ancien dossier, créé avec ce parcours et rouvert depuis l'historique
// (`?dossier=`), s'affiche en lecture seule : sa fiche finale A4, peinte par
// le rendu commun (fiche.js) avec le cours de son époque
// (js/data/formations/negociation.js). Il est lu par records.js, comme
// tous les dossiers.

import { CONFIG } from '../../config.js';
import { byId, setHTML } from '../../core/dom.js';
import * as records from '../../core/records.js';
import { migrateFormation } from '../../core/formation.js';
import { state as shared } from '../../core/state.js';
import * as portal from '../../shell/index.js';
import { NEGOCIATION } from '../../data/formations/negociation.js';
import { CHAPTERS } from '../../data/formations/negociation-cours.js';
import { renderFormationFiche } from './fiche.js';
import * as layout from './layouts/negociation.js';

const MODULE = NEGOCIATION.module;

let idx = 0;

/** Peint le sommaire, la progression et le chapitre `idx`, comme render() de l'archive. */
function render() {
  setHTML('toc', layout.toc(idx));
  const bar = byId('prog');
  if (bar) bar.style.width = `${((idx + 1) / CHAPTERS.length) * 100}%`;
  setHTML('lesson', layout.lesson(idx));
}

/** Fiche finale d'un ancien dossier, en lecture seule. */
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
    renderFormationFiche(NEGOCIATION, migrateFormation(found, NEGOCIATION, settings));
    portal.setSync(`${id} — lecture seule`);
  } catch (error) {
    portal.setSync('');
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
  }
}

const handlers = {
  /** Ouvre un chapitre et remonte sous la bannière, comme go() de l'archive. */
  go(index) {
    idx = Math.max(0, Math.min(CHAPTERS.length - 1, Number(index) || 0));
    render();
    window.scrollTo({ top: 280, behavior: 'smooth' });
  },

  print() {
    window.print();
  }
};

export default {
  handlers,

  template({ params } = {}) {
    return params && params.get('dossier') ? layout.dossier() : layout.page();
  },

  async mount({ params }) {
    const id = params.get('dossier');
    if (id) {
      await openDossier(id);
      return;
    }
    idx = 0;
    render();
  }
};
