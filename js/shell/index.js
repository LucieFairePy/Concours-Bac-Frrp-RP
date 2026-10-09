// Coque du portail BAC 75 N — documentation technique V4 §6 (barre
// latérale, en-tête) et §17 (rôles).
//
// La coque est peinte une fois à l'ouverture de session, puis à chaque
// changement de page pour allumer la bonne entrée. Les pages importent ce
// module sous le nom `portal` : bandeaux, état d'enregistrement, barre du
// module, refus d'accès.

import { CONFIG, isConfigured } from '../config.js';
import { state } from '../core/state.js';
import * as store from '../core/store.js';
import * as auth from '../core/auth.js';
import * as thresholds from '../core/thresholds.js';
import { renderSidebar, toggleNav } from './sidebar.js';
import { renderHeader, search } from './header.js';

import { closeModal } from './modal.js';

export { setSync, setBanner, errorBanner, okBanner, setModuleBar, deniedCard } from './feedback.js';
export { openModal, closeModal } from './modal.js';

/**
 * Module plein écran : la coque se vide, pour qu'aucun identifiant (#sync,
 * #who) n'existe deux fois avec ceux de la barre du module.
 */
export function clearShell() {
  closeModal();
  for (const id of ['portalSidebar', 'portalHeader', 'moduleBar']) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = '';
  }
}

/** Allume l'entrée `active` dans la barre latérale et l'en-tête. */
export function paint(active) {
  closeModal();
  renderSidebar(active);
  renderHeader(active);
  toggleNav(false);
}

/**
 * Les réglages partagés — direction et seuils de suggestion — sont lus
 * une fois par session, ici, pour que tous les modules travaillent avec
 * les mêmes valeurs. Illisibles, ils retombent sur ceux du kit sans
 * empêcher le portail de s'ouvrir : le message est rendu à l'appelant.
 */
export async function loadSettings() {
  try {
    const stored = await store.loadSettings();
    if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
    thresholds.apply(state.settings);
    return '';
  } catch (error) {
    return `Paramètres illisibles : ${error.message} — valeurs du kit utilisées.`;
  }
}

/** Bandeau permanent du mode local, quand aucun dépôt n'est configuré. */
export function localBanner() {
  if (isConfigured()) return '';
  return `
    <div class="banner">
      <b>Stockage non configuré.</b>
      Renseigne <code>owner</code> et <code>repo</code> dans <code>js/config.js</code>
      pour que les dossiers soient partagés via GitHub. Pour l’instant, tout
      reste dans cet onglet.
    </div>`;
}

/**
 * Retour à la page d'accès. Un rechargement complet plutôt qu'un simple
 * changement de route : la mémoire de l'onglet (dossier ouvert, liste des
 * accès, jeton déchiffré) repart à zéro.
 */
export function toGate(reason) {
  const query = reason ? `?r=${encodeURIComponent(reason)}` : '';
  window.location.replace(`${window.location.pathname}${query}`);
}

export function signOut() {
  auth.signOut();
  store.setOperator('');
  toGate('signedout');
}

/** Handlers appelés depuis les gabarits de la coque. */
export const portal = { signOut, toggleNav, search, closeModal };

if (typeof window !== 'undefined') window.portal = portal;
