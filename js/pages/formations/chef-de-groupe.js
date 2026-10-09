// Page de la Formation Chef de Groupe — modules/formation-chef-groupe.html
// de l'archive V4.
//
// Comme l'archive, c'est un cours à lire : seize chapitres, un sommaire,
// Précédent / Suivant et le lien vers l'examen. L'archive n'enregistre rien
// (ni identité, ni évaluation, ni dossier) : cette page non plus.
//
// Les dossiers clôturés avec l'ancien parcours restent lisibles : ouverte
// depuis l'historique (`?dossier=FCG-…`), la page lit le dossier par
// records.js et affiche sa fiche finale en lecture seule, imprimable.

import { CONFIG } from '../../config.js';
import { setHTML } from '../../core/dom.js';
import * as records from '../../core/records.js';
import * as portal from '../../shell/index.js';
import { state as shared } from '../../core/state.js';
import { migrateFormation } from '../../core/formation.js';
import { CHEF_DE_GROUPE } from '../../data/formations/chef-de-groupe.js';
import { LECONS } from '../../data/formations/chef-de-groupe-lecons.js';
import { renderFormationFiche } from './fiche.js';
import * as layout from './layouts/chef-de-groupe.js';

const MODULE = CHEF_DE_GROUPE.module;

let index = 0;

function render() {
  setHTML('chapters', layout.sommaire(LECONS, index));
  setHTML('lesson', layout.lecon(LECONS, index));
}

/** `?dossier=` : la fiche finale d'un ancien dossier, en lecture seule. */
async function openDossier(id) {
  setHTML('fcdgBody', layout.dossier(id));
  try {
    const found = await records.get(MODULE, id);
    if (!found) {
      portal.setBanner(portal.errorBanner(`Dossier ${id} introuvable dans cette formation.`));
      return;
    }
    const settings = { ...CONFIG.defaultCommand, ...shared.settings };
    renderFormationFiche(CHEF_DE_GROUPE, migrateFormation(found, CHEF_DE_GROUPE, settings));
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
  }
}

const handlers = {
  go(i) {
    index = Math.max(0, Math.min(i, LECONS.length - 1));
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  print() {
    window.print();
  }
};

export default {
  handlers,

  template() {
    return layout.page(LECONS.length);
  },

  async mount({ params }) {
    index = 0;
    const id = params.get('dossier');
    if (id) {
      await openDossier(id);
      return;
    }
    render();
  }
};
