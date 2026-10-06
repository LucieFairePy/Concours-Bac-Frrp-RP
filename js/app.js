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

import { CONFIG } from './config.js';
import { byId, esc, setHTML } from './core/dom.js';
import { state, blankDossier, migrate, setPath, isEditable } from './core/state.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import * as portal from './core/portal.js';
import * as records from './core/records.js';
import * as journal from './core/journal.js';
import { totals, suggestedDecision } from './scoring/totals.js';
import { renderPassage } from './views/passage.js';
import { renderCorrection } from './views/correction.js';
import { refreshResults } from './views/results.js';
import { DOSSIER_IMAGES } from './views/dossier.js';
import { openStep, step, openView } from './views/navigation.js';

const MODULE = 'concours';

let autosaveTimer = null;
let dirty = false;
let saving = false;

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

  portal.setModuleBar(`
    <b>Concours d’intégration BAC</b>
    <span class="mut">dossier ${esc(state.dossier ? state.dossier.id : '—')}</span>
    <span class="spacer"></span>
    ${rectify}
    <button onclick="app.saveNow()">Enregistrer</button>
    <button class="primary" onclick="app.newDossier()">Nouveau dossier</button>`);
}

function markDirty() {
  dirty = true;
  setSync('modifications non enregistrées');
  if (autosaveTimer) window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => { flush() }, CONFIG.autosaveDelay);
}

async function flush() {
  if (!dirty || saving || !state.dossier || state.readOnly) return;
  if (!auth.canWrite()) {
    setSync('lecture seule — rien n’est enregistré', 'error');
    return;
  }

  saving = true;
  setSync('enregistrement…');
  try {
    await records.saveDraft(MODULE, auth.current().login, state.dossier);
    dirty = false;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setSync(`enregistré à ${time}`, 'ok');
  } catch (error) {
    setSync(`échec : ${error.message}`, 'error');
  } finally {
    saving = false;
  }
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
  dirty = true;
  renderAll();
  openStep('id');
  await flush();
}

/** Ouverture directe d'un dossier clôturé depuis l'historique central. */
async function openFromUrl() {
  const id = new URLSearchParams(window.location.search).get('dossier');
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
    dirty = false;
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
        depuis l’<a href="historique.html">historique</a>, mais pas en créer.
      </div>`);
    moduleBar();
    return;
  }

  await startDossier();
}

async function boot() {
  const { session } = await portal.boot({ active: 'concours' });
  if (!session) return;

  await afterSignIn();
}

async function afterSignIn() {
  setHTML('who', esc(auth.describeOperator()));

  try {
    const stored = await store.loadSettings();
    if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
  } catch (error) {
    setBannerRetry(`Paramètres illisibles : ${error.message}`);
  }

  try {
    await loadInitialDossier();
  } catch (error) {
    setBannerRetry(`Démarrage impossible : ${error.message}`);
    setSync('dépôt injoignable', 'error');
  }
}

const app = {
  set(path, value) {
    if (!setPath(path, value)) return;
    markDirty();
  },

  setAnswer(questionId, value) {
    if (!isEditable()) return;
    state.dossier.ans[questionId] = value;
    markDirty();
  },

  setRadioAnswer(index, value) {
    if (!isEditable()) return;
    state.dossier.radioAns[index] = value;
    markDirty();
  },

  setScenarioAnswer(scenarioIndex, questionIndex, value) {
    if (!isEditable()) return;
    state.dossier.scAns[scenarioIndex][questionIndex] = value;
    markDirty();
  },

  setExaminer(index, field, value) {
    if (!isEditable()) return;
    state.dossier.ex[index][field] = value;
    markDirty();
  },

  setIncident(key, checked) {
    if (!setPath(`el.${key}`, checked)) return;
    markDirty();
    refreshResults();
  },

  setRetake(label, checked) {
    if (!isEditable()) return;
    const list = state.dossier.retakes;
    if (checked && !list.includes(label)) list.push(label);
    if (!checked) state.dossier.retakes = list.filter(item => item !== label);
    markDirty();
  },

  addExaminer() {
    if (!isEditable() || state.dossier.ex.length >= 3) return;
    state.dossier.ex.push({ grade: '', name: '' });
    markDirty();
    renderAll();
    openStep('id');
  },

  openStep(id) {
    openStep(id);
  },

  step(delta) {
    flush();
    step(delta);
  },

  async newDossier() {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouveau dossier ?')) return;
    if (!auth.canWrite()) {
      window.alert('Ton rôle ne permet pas de créer un dossier.');
      return;
    }
    openView('home');
    await startDossier();
  },

  async saveNow() {
    dirty = true;
    await flush();
  },

  async retry() {
    setBanner('');
    setSync('reprise…');
    await afterSignIn();
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
    dirty = true;
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
    D.suggestedDecision = suggestedDecision(D);
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
      dirty = false;
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
  },

  signOut() {
    state.dossier = null;
    dirty = false;
    portal.signOut();
  }
};

window.app = app;

window.addEventListener('beforeunload', event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});

boot();
