import { CONFIG, isConfigured } from './config.js';
import { byId, esc, setHTML } from './core/dom.js';
import { state, blankDossier, migrate, setPath, isEditable } from './core/state.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import { totals, suggestedDecision } from './scoring/totals.js';
import { renderPassage } from './views/passage.js';
import { renderCorrection } from './views/correction.js';
import { renderResults, refreshResults } from './views/results.js';
import { renderDossier } from './views/dossier.js';
import { renderHistory } from './views/history.js';
import { renderSettings, readSettingsForm, setSettingsStatus } from './views/settings.js';
import { openStep, step, openView } from './views/navigation.js';
import { showLogin, hideLogin, readCode, readLocalName, setLoginBusy } from './views/login.js';

let autosaveTimer = null;
let dirty = false;
let saving = false;

function setSync(text, tone) {
  const node = byId('sync');
  if (!node) return;
  node.textContent = text;
  node.style.color = tone === 'error' ? 'var(--red)' : tone === 'ok' ? '#55e8a0' : 'var(--mut)';
}

function setBanner(html) {
  setHTML('banner', html);
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
    await store.saveDraft(auth.current().login, state.dossier);
    dirty = false;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setSync(`enregistré à ${time}`, 'ok');
  } catch (error) {
    setSync(`échec : ${error.message}`, 'error');
  } finally {
    saving = false;
  }
}

function renderAll() {
  renderPassage();
  const active = byId('s-correct')?.classList.contains('active');
  if (active) renderCorrection();
}

async function startDossier() {
  const year = new Date().getFullYear();
  const id = await store.nextDossierId(year);
  state.dossier = blankDossier(id, state.settings);
  state.readOnly = false;
  dirty = true;
  renderAll();
  openStep('id');
  await flush();
}

async function loadInitialDossier() {
  const session = auth.current();

  if (session.canWrite) {
    let draft = null;
    try {
      draft = await store.loadDraft(session.login);
    } catch (error) {
      setBanner(`<div class="banner error">Brouillon illisible : ${esc(error.message)}</div>`);
    }
    if (draft) {
      state.dossier = migrate(draft);
      state.readOnly = false;
      renderAll();
      openStep('id');
      setSync('brouillon repris');
      return;
    }
    await startDossier();
    return;
  }

  state.dossier = blankDossier('BAC-LECTURE', state.settings);
  state.readOnly = true;
  renderAll();
  openStep('id');
  setSync('consultation — écriture désactivée');
}

async function boot() {
  await store.detectDriver();

  if (!isConfigured()) {
    setBanner(`
      <div class="banner">
        <b>Stockage non configuré.</b>
        Renseigne <code>owner</code> et <code>repo</code> dans <code>js/config.js</code>
        pour que les dossiers soient partagés via GitHub.
      </div>`);
  }

  const restored = await auth.restore();
  if (restored) {
    await afterSignIn();
    return;
  }

  showLogin('');
}

async function afterSignIn() {
  hideLogin();

  try {
    const stored = await store.loadSettings();
    if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
  } catch (error) {
    setBanner(`<div class="banner error">Paramètres illisibles : ${esc(error.message)}</div>`);
  }

  const session = auth.current();
  const who = `${session.grade} ${session.name}`.trim() || session.login;
  setHTML('who', esc(who));

  await loadInitialDossier();
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

  async view(name) {
    openView(name);
    if (name === 'hist') await renderHistory();
    if (name === 'settings') renderSettings();
  },

  async newDossier() {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouveau dossier ?')) return;
    if (!auth.canWrite()) {
      window.alert('Connecte-toi avec ton code personnel pour créer un dossier.');
      return;
    }
    openView('home');
    await startDossier();
  },

  async saveNow() {
    dirty = true;
    await flush();
  },

  async closeDossier() {
    const D = state.dossier;
    if (!D || D.locked || state.readOnly) return;

    if (!auth.canWrite()) {
      window.alert('Connecte-toi avec ton code personnel pour clôturer un dossier.');
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

    const confirmed = window.confirm(
      `Clôturer définitivement ${D.id} ? Après validation, aucune modification directe ne sera possible.`
    );
    if (!confirmed) return;

    const session = auth.current();
    D.total = totals(D).total;
    D.decision = D.decision || suggestedDecision(D);
    D.locked = true;
    D.closedAt = new Date().toISOString();
    D.closedBy = session.login;

    setSync('clôture en cours…');
    try {
      const published = await store.publishClosed(D);
      state.dossier = published;
      await store.deleteDraft(session.login);
      dirty = false;
      setSync(`dossier ${published.id} clôturé`, 'ok');
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

  async openClosed(id) {
    setSync('ouverture…');
    try {
      const dossier = await store.getClosed(id);
      if (!dossier) {
        window.alert(`Dossier ${id} introuvable.`);
        return;
      }
      state.dossier = migrate(dossier);
      state.readOnly = true;
      dirty = false;
      renderAll();
      openView('home');
      openStep('final');
      setSync(`${id} — lecture seule`);
    } catch (error) {
      setSync(`échec : ${error.message}`, 'error');
    }
  },

  async saveSettings() {
    if (!auth.canWrite()) return;
    const next = readSettingsForm();
    setSettingsStatus('<div class="banner">Enregistrement…</div>');
    try {
      await store.saveSettings(next);
      state.settings = next;
      setSettingsStatus('<div class="banner ok">Paramètres enregistrés pour les prochains dossiers.</div>');
    } catch (error) {
      setSettingsStatus(`<div class="banner error">Échec : ${esc(error.message)}</div>`);
    }
  },

  async submitLogin() {
    const { code, keep } = readCode();
    if (!code) {
      showLogin('Entre ton code personnel.');
      return;
    }
    setLoginBusy(true);
    try {
      await auth.signIn(code, keep);
      await afterSignIn();
    } catch (error) {
      setLoginBusy(false);
      showLogin(error.message);
    }
  },

  async submitReadOnly() {
    setLoginBusy(true);
    await auth.signInReadOnly();
    await afterSignIn();
  },

  async submitLocalLogin() {
    setLoginBusy(true);
    await auth.signInLocal(readLocalName());
    await afterSignIn();
  },

  signOut() {
    auth.signOut();
    state.dossier = null;
    dirty = false;
    setHTML('who', '');
    setSync('');
    showLogin('Session terminée.');
  },

  renderCorrection,
  renderResults,
  renderDossier
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
