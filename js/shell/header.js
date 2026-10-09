// En-tête — documentation technique V4 §6.2 : identité Police Nationale /
// France Roleplay, nav courte, recherche globale, état de session, profil.

import { byId, esc } from '../core/dom.js';
import { href } from '../routes.js';
import * as auth from '../core/auth.js';
import { visibleNav, isActive, itemHref, HEADER_NAV } from './nav.js';

function headerNav(active) {
  return visibleNav()
    .filter(item => HEADER_NAV.includes(item.id))
    .map(item => `<a class="${isActive(item, active) ? 'active' : ''}" href="${itemHref(item)}">${esc(item.short || item.label)}</a>`)
    .join('');
}

function profileBox() {
  const session = auth.current();
  if (!session) return '';

  return `
    <div class="pprofile" tabindex="0">
      <div class="pprofile-name">${esc(session.name || session.login)}</div>
      ${session.grade ? `<span class="pprofile-grade">${esc(session.grade)}</span>` : ''}
      <span class="pprofile-role">${esc(auth.describeRole())}</span>
      <div class="pprofile-menu">
        <a href="${href('parametres')}">Mon profil</a>
        <a href="${href('historique')}">Mes dossiers</a>
        <button class="danger" onclick="portal.signOut()">Se déconnecter</button>
      </div>
    </div>`;
}

/**
 * L'en-tête est peint une fois par changement de page. L'état de session
 * (#sync) reste en place : une page qui enregistre y écrit.
 */
export function renderHeader(active) {
  const host = byId('portalHeader');
  if (!host) return;

  host.innerHTML = `
    <div class="phead-main">
      <button class="pburger no-print" onclick="portal.toggleNav()" aria-label="Ouvrir le menu">☰</button>
      <span class="phead-id">
        <span class="phead-title">Police Nationale</span>
        <span class="phead-sub">France Roleplay</span>
        <span class="flag"></span>
      </span>
      <nav class="phead-nav no-print">${headerNav(active)}</nav>
      <form class="psearch no-print" onsubmit="return portal.search(event)">
        <label class="sr-only" for="portalSearch">Recherche globale</label>
        <input id="portalSearch" name="q" type="search"
               placeholder="Rechercher un dossier, un agent, une formation…">
        <button type="submit">Chercher</button>
      </form>
      <span class="phead-state">
        <span id="who" class="mut">${esc(auth.describeOperator())}</span>
        <span id="sync" class="sync"></span>
      </span>
      ${profileBox()}
    </div>`;
}

/**
 * Recherche globale (§6.2). Elle n'invente pas de moteur : elle ouvre
 * l'historique central, qui sait déjà chercher par nom, matricule, numéro
 * de dossier et examinateur.
 */
export function search(event) {
  if (event) event.preventDefault();
  const value = String(byId('portalSearch')?.value || '').trim();
  window.location.hash = value ? href('historique', { q: value }) : href('historique');
  return false;
}
