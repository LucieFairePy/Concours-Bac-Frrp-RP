// Module « Concours d'intégration BAC » — cahier des charges §5.
//
// Le flux du concours n'a pas changé : identité → théorie → radio →
// situations → physique → tir → correction → résultats → fiche finale, note
// suggérée puis note retenue, décision humaine souveraine, clôture
// définitive en lecture seule.
//
// Ce qui a changé autour : la page vit maintenant dans le shell du portail
// (en-tête et navigation communs), l'historique et les paramètres ont leurs
// propres pages, les actions sensibles passent au journal, et une
// correction après clôture crée une version rectificative liée au dossier
// d'origine au lieu de le réécrire.

import { byId, esc, setHTML } from '../../core/dom.js';
import { state, blankDossier, migrate, setPath, isEditable } from '../../core/state.js';
import * as auth from '../../core/auth.js';
import * as portal from '../../shell/index.js';
import { href } from '../../routes.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import { totals, suggestedDecision, suggestionSnapshot } from '../../scoring/totals.js';
import { renderPassage } from './passage.js';
import { renderCorrection } from './correction.js';
import { refreshResults } from './results.js';
import { DOSSIER_IMAGES } from './dossier.js';
import { openStep, step, openView } from './navigation.js';
import { createAutosave } from '../../ui/autosave.js';

const MODULE = 'concours';

let params = new URLSearchParams();

// Le brouillon part au dépôt après chaque pause de saisie.
const autosave = createAutosave({
  module: MODULE,
  current: () => (state.readOnly ? null : state.dossier)
});

const setSync = portal.setSync;

function setBanner(html) {
  setHTML('banner', html);
}

function setBannerRetry(message) {
  setBanner(`
    <div class="banner error">
      ${esc(message)}
      <div class="modal-actions"><button onclick="app.retry()">Réessayer</button></div>
    </div>`);
}

function moduleBar() {
  const readOnly = state.readOnly || (state.dossier && state.dossier.locked);

  const rectify = readOnly && auth.can('write')
    ? '<button onclick="app.rectify()">Créer une version rectificative</button>'
    : '';

  // Barre du module (#pageActions) : la navigation de l'archive
  // (+ NOUVEAU DOSSIER, Dossier) ; Historique et Paramètres suivent dans
  // le gabarit. Le bouton de rectification n'existe que pour un dossier
  // clôturé, quand le rôle le permet.
  portal.setModuleBar(`
    ${rectify}
    <button class="primary" onclick="app.newDossier()">+ NOUVEAU DOSSIER</button>
    <button onclick="app.showDossier()">Dossier</button>`);
}

function loadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

async function preloadSheetImages() {
  const timeout = new Promise(resolve => { window.setTimeout(() => resolve([]), 8000); });
  const loads = Promise.all(DOSSIER_IMAGES.map(loadImage));
  const done = await Promise.race([loads, timeout]);
  return Array.isArray(done) ? done.filter(Boolean).length : 0;
}

function renderAll() {
  renderPassage();
  moduleBar();
  const active = byId('s-correct')?.classList.contains('active');
  if (active) renderCorrection();
}

async function startDossier() {
  const year = new Date().getFullYear();

  let id;
  try {
    id = await records.nextId(MODULE, year);
  } catch (error) {
    setBannerRetry(`Numéro de dossier indisponible : ${error.message}`);
    setSync('dépôt injoignable', 'error');
    return;
  }

  state.dossier = blankDossier(id, state.settings);
  state.readOnly = false;
  autosave.reset(true);
  renderAll();
  openStep('id');
  await autosave.flush();
}

/** Ouverture directe d'un dossier clôturé depuis l'historique central. */
async function openFromUrl() {
  const id = params.get('dossier');
  if (!id) return false;

  setSync('ouverture…');
  try {
    const dossier = await records.get(MODULE, id);
    if (!dossier) {
      setBanner(portal.errorBanner(`Dossier ${id} introuvable dans l’historique du concours.`));
      return false;
    }
    state.dossier = migrate(dossier);
    state.readOnly = true;
    autosave.reset();
    renderAll();
    openStep('final');
    setSync(`${id} — lecture seule`);
    return true;
  } catch (error) {
    setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
    return false;
  }
}

async function loadInitialDossier() {
  if (await openFromUrl()) return;

  const session = auth.current();

  let draft = null;
  try {
    draft = await records.loadDraft(MODULE, session.login);
  } catch (error) {
    setBannerRetry(`Brouillon illisible : ${error.message}`);
    setSync('dépôt injoignable', 'error');
    return;
  }

  if (draft) {
    state.dossier = migrate(draft);
    state.readOnly = false;
    renderAll();
    openStep('id');
    setSync('brouillon repris');
    return;
  }

  if (!auth.canWrite()) {
    setBanner(`
      <div class="banner">
        Ton rôle est en consultation : tu peux ouvrir les dossiers clôturés
        depuis l’<a href="${href('historique', { module: MODULE })}">historique</a>, mais pas en créer.
      </div>`);
    moduleBar();
    return;
  }

  await startDossier();
}

async function start() {
  try {
    await loadInitialDossier();
  } catch (error) {
    setBannerRetry(`Démarrage impossible : ${error.message}`);
    setSync('dépôt injoignable', 'error');
  }
}

const handlers = {
  set(path, value) {
    if (!setPath(path, value)) return;
    autosave.mark();
  },

  setAnswer(questionId, value) {
    if (!isEditable()) return;
    state.dossier.ans[questionId] = value;
    autosave.mark();
  },

  setRadioAnswer(index, value) {
    if (!isEditable()) return;
    state.dossier.radioAns[index] = value;
    autosave.mark();
  },

  setScenarioAnswer(scenarioIndex, questionIndex, value) {
    if (!isEditable()) return;
    state.dossier.scAns[scenarioIndex][questionIndex] = value;
    autosave.mark();
  },

  setExaminer(index, field, value) {
    if (!isEditable()) return;
    state.dossier.ex[index][field] = value;
    autosave.mark();
  },

  setIncident(key, checked) {
    if (!setPath(`el.${key}`, checked)) return;
    autosave.mark();
    refreshResults();
  },

  setRetake(label, checked) {
    if (!isEditable()) return;
    const list = state.dossier.retakes;
    if (checked && !list.includes(label)) list.push(label);
    if (!checked) state.dossier.retakes = list.filter(item => item !== label);
    autosave.mark();
  },

  addExaminer() {
    if (!isEditable() || state.dossier.ex.length >= 3) return;
    state.dossier.ex.push({ grade: '', name: '' });
    autosave.mark();
    renderAll();
    openStep('id');
  },

  openStep(id) {
    openStep(id);
  },

  step(delta) {
    autosave.flush();
    step(delta);
  },

  async newDossier() {
    if (!auth.canWrite()) {
      window.alert('Ton rôle ne permet pas de créer un dossier.');
      return;
    }
    // Confirmation de l'archive. Ici le brouillon est unique par code
    // personnel : on dit la vérité sur ce qu'il devient.
    const D = state.dossier;
    const started = D && !D.locked && !state.readOnly
      && (D.c.last || D.c.first || Object.values(D.ans || {}).some(Boolean));
    const message = 'Créer un nouveau dossier BAC 75 N ?'
      + (started ? ' Le brouillon en cours, non clôturé, sera remplacé.' : '');
    if (!window.confirm(message)) return;
    openView('home');
    await startDossier();
  },

  showDossier() {
    openView('home');
  },

  async retry() {
    setBanner('');
    setSync('reprise…');
    await start();
  },

  async downloadPdf() {
    const D = state.dossier;
    if (!D) return;

    openStep('final');

    const name = `${D.c.last.toUpperCase()} ${D.c.first}`.trim();
    const previous = document.title;
    document.title = name ? `${D.id} — ${name}` : D.id;

    setSync('préparation du PDF…');
    const ready = await preloadSheetImages();

    if (ready < DOSSIER_IMAGES.length) {
      setSync(`${DOSSIER_IMAGES.length - ready} image(s) indisponible(s)`, 'error');
    } else {
      setSync('');
    }

    window.print();
    document.title = previous;
  },

  /**
   * §5 et §15 : après clôture, aucune modification silencieuse. Une
   * correction ultérieure repart du dossier clôturé, reste modifiable, et
   * sera publiée comme version rectificative qui cite l'original.
   */
  async rectify() {
    const D = state.dossier;
    if (!D || !auth.can('write')) return;

    const confirmed = window.confirm(
      `Créer une version rectificative de ${D.id} ?\n\n`
      + 'Le dossier d’origine ne sera pas modifié. La version rectificative '
      + 'portera un nouveau numéro et citera le dossier corrigé.'
    );
    if (!confirmed) return;

    state.dossier = migrate({ ...D, locked: false, rectifies: D.id, closedAt: null, closedBy: null });
    state.readOnly = false;
    autosave.reset(true);
    renderAll();
    openStep('correct');
    setSync(`version rectificative de ${D.id} — à clôturer de nouveau`);
  },

  async closeDossier() {
    const D = state.dossier;
    if (!D || D.locked || state.readOnly) return;

    if (!auth.can('close')) {
      window.alert('Ton rôle ne permet pas de clôturer un dossier.');
      return;
    }

    if (!D.decision) {
      window.alert('Choisis d’abord la décision finale sur la page Résultats.');
      openStep('results');
      return;
    }

    const hostage = Number(D.shoot.hostage);
    if (hostage >= 2) D.decision = 'RECALE';
    if (hostage === 1 && D.decision === 'RETENU') {
      window.alert('Une cible otage a été touchée : le résultat ne peut pas être RETENU sans réserve.');
      openStep('results');
      return;
    }

    const rectifying = Boolean(D.rectifies);

    const confirmed = window.confirm(
      rectifying
        ? `Publier la version rectificative de ${D.rectifies} ? Elle sera définitive.`
        : `Clôturer définitivement ${D.id} ? Après validation, aucune modification directe ne sera possible.`
    );
    if (!confirmed) return;

    const session = auth.current();
    const computed = totals(D);
    D.total = computed.total;

    // §12 et §14 : ce que le système a proposé est archivé à côté de ce
    // que l'examinateur a retenu — note, justification et résultat.
    D.systemSuggestions = suggestionSnapshot(D);
    D.suggestedTotal = D.systemSuggestions.total;
    D.suggestedDecision = D.systemSuggestions.decision;
    D.suggestedReason = D.systemSuggestions.reason;
    D.decision = D.decision || D.suggestedDecision;
    D.locked = true;
    D.closedAt = new Date().toISOString();
    D.closedBy = session.login;

    setSync(rectifying ? 'publication de la rectification…' : 'clôture en cours…');
    try {
      const published = rectifying
        ? await records.publishRectified(MODULE, { id: D.rectifies }, D)
        : await records.publish(MODULE, D);

      state.dossier = published;
      state.readOnly = true;
      await records.deleteDraft(MODULE, session.login);
      autosave.reset();
      setSync(`dossier ${published.id} clôturé`, 'ok');

      const logged = await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: rectifying ? 'dossier.rectificatif' : 'dossier.cloture',
        target: published.id,
        detail: `${published.decision} — ${published.total}/1000`
          + (D.suggestedDecision && D.suggestedDecision !== published.decision
            ? ` (suggestion : ${D.suggestedDecision})`
            : '')
      });
      if (!logged) setSync(`dossier ${published.id} clôturé — journal non écrit`, 'error');
    } catch (error) {
      D.locked = false;
      D.closedAt = null;
      D.closedBy = null;
      setSync(`clôture impossible : ${error.message}`, 'error');
      window.alert(`Clôture impossible : ${error.message}`);
      return;
    }

    renderAll();
    openStep('final');
  }
};

export default {
  handlers,

  template() {
    // Mise en page du module autonome de la maquette V4 : barre d'en-tête
    // propre (retour au portail, état d'enregistrement, actions), puis la
    // carte titre, les onglets d'étape et les sections.
    return `
      <div class="m-concours">
        <header class="mc-top no-print">
          <a class="mc-back" href="${href('accueil')}">← Portail BAC 75 N</a>
          <div class="mc-logo">
            <img src="assets/bac75n/01_LOGO_BAC75N_PRINCIPAL.png" alt="Logo officiel BAC 75 N"
                 onerror="this.onerror=null;this.src='assets/logo-bac.svg'">
          </div>
          <div class="mc-title">
            <h1>CONCOURS D’INTÉGRATION — BRIGADE ANTI-CRIMINALITÉ</h1>
            <div class="mut">Police Nationale • France Roleplay • outil fictif d’évaluation</div>
          </div>
          <nav class="mc-nav">
            <span id="sync" class="sync"></span>
            <span id="pageActions" class="mc-actions"></span>
            <a class="mc-link" href="${href('historique', { module: MODULE })}">Historique</a>
            <a class="mc-link" href="${href('parametres')}">Paramètres</a>
          </nav>
        </header>
        <div class="mc-main">
          <div id="mcBanner"></div>
          <section id="home" class="view">
            <div class="hero">
              <div class="flag"></div>
              <h2 id="hero">Nouveau concours</h2>
              <div class="mut">Passage candidat → Correction → Résultats → Fiche finale • /1000</div>
              <div class="mc-hero-actions no-print">
                <button class="primary" onclick="app.newDossier()">+ CRÉER UN NOUVEAU DOSSIER</button>
              </div>
            </div>
            <div id="tabs" class="tabs no-print"></div>
            <div class="no-print">
              <div class="progress"><span id="prog"></span></div>
              <div id="stepText" class="steptext"></div>
            </div>
            <div id="sections"></div>
          </section>
        </div>
      </div>`;
  },

  async mount(ctx) {
    // Le bandeau (#banner) est posé par le routeur avant la page : il
    // passe sous la barre du module, comme une alerte de la maquette.
    const banner = byId('banner');
    const slot = byId('mcBanner');
    if (banner && slot && typeof slot.replaceWith === 'function') slot.replaceWith(banner);

    params = ctx.params;
    state.dossier = null;
    state.readOnly = false;
    autosave.reset();
    await start();
  },

  canLeave() {
    return !autosave.dirty;
  },

  onHide() {
    autosave.flush();
  },

  async unmount() {
    autosave.cancel();
    await autosave.flush();
  }
};
