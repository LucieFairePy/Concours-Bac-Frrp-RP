// Page de la Formation Radio — le module de l'archive V4
// (modules/formation-radio.html), tel quel : bandeau au logo rond,
// sommaire interactif à gauche, fil d'Ariane et retour au portail, un
// chapitre affiché à la fois. Le module n'a qu'un cours : il ne passe pas
// par le moteur commun des formations (engine.js) et n'enregistre rien.
//
// Seule exception : un ancien dossier radio ouvert depuis l'historique
// (`?dossier=…`), créé quand le module avait un parcours évalué. Sa fiche
// finale s'affiche en lecture seule à la place du chapitre, avec le
// contenu de l'époque (js/data/formations/radio.js) ; elle s'imprime comme
// les autres fiches.

import { CONFIG } from '../../config.js';
import { esc, setHTML } from '../../core/dom.js';
import * as records from '../../core/records.js';
import * as portal from '../../shell/index.js';
import { state as shared } from '../../core/state.js';
import { migrateFormation } from '../../core/formation.js';
import { href } from '../../routes.js';
import { LOGO } from '../../data/images.js';
import { RADIO } from '../../data/formations/radio.js';
import { RADIO_COURS } from '../../data/formations/radio-cours.js';
import { renderFormationFiche } from './fiche.js';

const MODULE = RADIO.module;

const state = { chapter: 0, record: null };

// ───────────────────────────── Rendu ──────────────────────────────────

function sommaire() {
  return RADIO_COURS.map((chapter, index) => `
    <button class="mr-navbtn${!state.record && index === state.chapter ? ' mr-active' : ''}"
            onclick="app.chapter(${index})"><b>${esc(chapter.num)}</b> ${esc(chapter.nav)}</button>`).join('');
}

function chapitre() {
  return `<section class="mr-chapter">${RADIO_COURS[state.chapter].html}</section>`;
}

function dossier() {
  const R = state.record;
  return `
    <section id="s-final" class="section active printme">
      <div class="mr-card no-print">
        <h3>Dossier ${esc(R.id)} — lecture seule</h3>
        <p>Ancien dossier de la Formation Radio, conservé dans l’historique.</p>
        <button class="mr-print" onclick="app.downloadPdf()">Télécharger en PDF</button>
      </div>
      <div id="sheet"></div>
    </section>`;
}

function render() {
  setHTML('mrNav', sommaire());
  setHTML('mrChapter', state.record ? dossier() : chapitre());
  if (state.record) renderFormationFiche(RADIO, state.record);
}

// ───────────────────────────── Ancien dossier ─────────────────────────

async function openFromUrl(params) {
  const id = params.get('dossier');
  if (!id) return;

  portal.setSync('ouverture…');
  try {
    const found = await records.get(MODULE, id);
    if (!found) {
      portal.setBanner(portal.errorBanner(`Dossier ${id} introuvable dans cette formation.`));
      return;
    }
    state.record = migrateFormation(found, RADIO, { ...CONFIG.defaultCommand, ...shared.settings });
    render();
    portal.setSync(`${id} — lecture seule`);
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
  }
}

// ───────────────────────────── Page ───────────────────────────────────

const handlers = {
  chapter(index) {
    state.chapter = index;
    state.record = null;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  downloadPdf() {
    const R = state.record;
    if (!R) return;
    const name = `${String(R.c.last).toUpperCase()} ${R.c.first}`.trim();
    const previous = document.title;
    document.title = name ? `${R.id} — ${name}` : R.id;
    window.print();
    document.title = previous;
  }
};

export default {
  handlers,

  template() {
    return `
      <div class="m-radio">
        <header class="mr-hero no-print">
          <div class="mr-hero-copy">
            <img src="${esc(LOGO.file)}" alt="BAC 75 N"
                 onerror="this.onerror=null;this.src='${esc(LOGO.fallback)}'">
            <h1>FORMATION RADIO — BAC 75 N</h1>
            <p>ÉCOUTER · IDENTIFIER · TRANSMETTRE · COORDONNER</p>
          </div>
        </header>
        <div class="mr-layout">
          <aside class="mr-aside no-print">
            <h3>SOMMAIRE INTERACTIF</h3>
            <div id="mrNav"></div>
          </aside>
          <div class="mr-content">
            <div class="mr-topbar no-print">
              <span class="mr-crumb">Formations BAC › Radio</span>
              <span id="sync" class="mr-sync"></span>
              <a class="mr-back" href="${href('formations')}">← Retour au portail</a>
            </div>
            <div id="mrChapter"></div>
          </div>
        </div>
      </div>`;
  },

  async mount({ params }) {
    state.chapter = 0;
    state.record = null;
    render();
    await openFromUrl(params);
  }
};
