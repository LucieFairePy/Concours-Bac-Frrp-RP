// En-tête — celui de l'archive V4 : Police Nationale / France Roleplay,
// nav courte, recherche, profil. La recherche est un vrai champ (elle ouvre
// l'historique) habillé comme le cartouche de l'archive ; le profil garde
// au survol le menu de session (déconnexion).

import { byId, esc } from '../core/dom.js';
import { href } from '../routes.js';
import * as auth from '../core/auth.js';
import { visibleNav, itemHref, HEADER_NAV } from './nav.js';

function headerNav() {
  return visibleNav()
    .filter(item => HEADER_NAV.includes(item.id))
    .map(item => `<a href="${itemHref(item)}">${esc(item.short || item.label)}</a>`)
    .join('');
}

function profileBox() {
  const session = auth.current();
  if (!session) return '<div class="profile"><span id="sync" class="sync"></span></div>';

  const lines = [session.grade, auth.describeRole()].filter(Boolean).map(esc).join('<br>');

  return `
    <div class="profile" tabindex="0">
      <b>${esc(session.name || session.login)}</b><small>${lines}</small>
      <span id="sync" class="sync"></span>
      <div class="pmenu">
        <a href="${href('parametres')}">Paramètres du site</a>
        <button type="button" onclick="portal.signOut()">Se déconnecter</button>
      </div>
    </div>`;
}

/**
 * L'en-tête est peint une fois par changement de page. L'état
 * d'enregistrement (#sync) y reste : une page qui enregistre y écrit.
 */
export function renderHeader() {
  const host = byId('portalHeader');
  if (!host) return;

  host.innerHTML = `
    <div class="pn"><strong>POLICE NATIONALE</strong><small>FRANCE ROLEPLAY</small></div>
    <div class="top">${headerNav()}</div>
    <form class="search" role="search" onsubmit="return portal.search(event)">
      <label class="sr-only" for="portalSearch">Recherche globale</label>
      <input id="portalSearch" name="q" type="search" autocomplete="off"
             placeholder="⌕ Rechercher un dossier, un agent, une formation…">
    </form>
    ${profileBox()}`;
}

/**
 * Recherche globale : elle ouvre l'historique central, qui cherche déjà
 * par nom, matricule, numéro de dossier et examinateur.
 */
export function search(event) {
  if (event) event.preventDefault();
  const value = String(byId('portalSearch')?.value || '').trim();
  window.location.hash = value ? href('historique', { q: value }) : href('historique');
  return false;
}
