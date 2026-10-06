import { isConfigured } from './config.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import {
  showLoading,
  showLocal,
  showBootstrap,
  showForm,
  notice,
  readForm,
  readName,
  setBusy
} from './views/gate.js';

const APP = 'accueil.html';

const REASONS = {
  expired: 'Session expirée. Entre ton code pour continuer.',
  invalid: 'Session fermée : ton accès a été modifié ou retiré. Entre ton code.',
  required: 'Connecte-toi pour accéder au portail BAC 75 N.',
  signedout: 'Session fermée.'
};

function reasonFromUrl() {
  const value = new URLSearchParams(window.location.search).get('r');
  return REASONS[value] || '';
}

function toApp() {
  window.location.replace(APP);
}

async function render(message) {
  if (!isConfigured()) {
    showLocal(notice(message));
    return;
  }

  showLoading('Chargement de la liste des examinateurs…');

  let entries = [];
  try {
    entries = (await auth.loadRoster(true)).entries;
  } catch (error) {
    showBootstrap(notice(`Liste des accès illisible : ${error.message}`));
    return;
  }

  if (!entries.length) {
    showBootstrap(notice(message));
    return;
  }

  showForm(entries, notice(message));
}

async function boot() {
  await store.detectDriver();

  const restored = await auth.restore();
  if (restored.status === 'ok') {
    toApp();
    return;
  }

  const reason = restored.status === 'expired'
    ? REASONS.expired
    : restored.status === 'invalid'
      ? REASONS.invalid
      : reasonFromUrl();

  await render(reason);
}

const gate = {
  async submit() {
    const { entryId, code } = readForm();
    if (!code) {
      await render('Entre ton code personnel.');
      return;
    }

    setBusy(true, 'Vérification…');
    try {
      await auth.signIn(entryId, code);
      toApp();
    } catch (error) {
      setBusy(false);
      await render(error.message);
    }
  },

  async submitLocal() {
    setBusy(true, 'Ouverture…');
    await auth.signInLocal(readName());
    toApp();
  }
};

window.gate = gate;

boot();
