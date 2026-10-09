// Entrée unique du portail BAC 75 N.
//
// 1. choisir le stockage (dépôt GitHub ou onglet local) ;
// 2. reprendre la session si elle existe encore, sinon afficher l'accès ;
// 3. une fois la session ouverte : lire les réglages partagés, peindre la
//    coque et démarrer le routeur sur l'adresse demandée.

import * as store from './core/store.js';
import * as auth from './core/auth.js';
import * as portal from './shell/index.js';
import * as router from './router.js';
import { showGate } from './pages/acces/index.js';

function reasonFromUrl() {
  return new URLSearchParams(window.location.search).get('r') || '';
}

/** Retire `?r=…` de l'adresse une fois le message affiché. */
function cleanUrl() {
  if (!window.location.search) return;
  history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
}

async function enterPortal() {
  cleanUrl();
  store.setOperator(auth.describeOperator());

  document.body.classList.remove('gate', 'booting');
  document.body.classList.add('portal-shell');

  const warning = await portal.loadSettings();
  await router.start();
  if (warning) portal.setBanner(portal.errorBanner(warning) + portal.localBanner());
}

async function boot() {
  await store.detectDriver();

  const restored = await auth.restore();
  if (restored.status === 'ok') {
    await enterPortal();
    return;
  }

  document.body.classList.remove('booting');
  document.body.classList.add('gate');

  const reason = restored.status === 'none' ? reasonFromUrl() : restored.status;
  await showGate(reason, enterPortal);
}

boot();
