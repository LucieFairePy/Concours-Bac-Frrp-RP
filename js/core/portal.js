// Shell du portail BAC 75 N — cahier des charges §3 (navigation) et §14
// (rôles). Toutes les pages du portail démarrent par portal.boot() : même
// garde de session, même en-tête, même barre de navigation, même profil en
// haut à droite. Une seule source de vérité pour la navigation.

import { isConfigured } from '../config.js';
import { byId, esc, initials, setHTML } from './dom.js';
import * as store from './store.js';
import * as auth from './auth.js';

const GATE = 'index.html';

/**
 * La barre principale. `need` est la permission requise : un rôle qui ne
 * l'a pas ne voit pas l'entrée. `sub` ouvre un panneau déroulant.
 */
export const NAV = [
  { id: 'accueil', label: 'Accueil', href: 'accueil.html' },
  { id: 'concours', label: 'Concours BAC', href: 'app.html' },
  {
    id: 'formations',
    label: 'Formations',
    href: 'formations.html',
    sub: [
      { id: 'negociation', label: 'Formation Négociation BAC', href: 'negociation.html' },
      { id: 'formation-cdg', label: 'Formation Chef de Groupe BAC', href: 'chef-de-groupe.html' }
    ]
  },
  {
    id: 'examens',
    label: 'Examens',
    href: 'examen-cdg.html',
    sub: [
      { id: 'cdg', label: 'Examen de qualification Chef de Groupe', href: 'examen-cdg.html' }
    ]
  },
  { id: 'historique', label: 'Historique', href: 'historique.html' },
  { id: 'administration', label: 'Administration', href: 'administration.html', need: 'accounts' },
  { id: 'parametres', label: 'Paramètres', href: 'parametres.html' }
];

function visibleNav() {
  return NAV.filter(item => !item.need || auth.can(item.need));
}

function navButton(item, active) {
  const on = item.id === active || (item.sub || []).some(child => child.id === active);
  const classes = `pnav-item${on ? ' active' : ''}`;

  if (!item.sub) {
    return `<a class="${classes}" href="${item.href}">${esc(item.label)}</a>`;
  }

  const children = item.sub
    .map(child => `<a href="${child.href}" class="${child.id === active ? 'active' : ''}">${esc(child.label)}</a>`)
    .join('');

  return `
    <div class="pnav-group">
      <a class="${classes}" href="${item.href}">${esc(item.label)} <span class="pnav-caret">▾</span></a>
      <div class="pnav-drop">${children}</div>
    </div>`;
}

function profileBox() {
  const session = auth.current();
  if (!session) return '';

  const name = session.name || session.login;
  const line2 = [session.grade, auth.describeRole()].filter(Boolean).join(' — ');

  return `
    <div class="pprofile">
      <div class="pavatar" aria-hidden="true">${esc(initials(name))}</div>
      <div class="pprofile-text">
        <div class="pprofile-name">${esc(name)}</div>
        <div class="pprofile-role">${esc(line2)}</div>
      </div>
      <div class="pprofile-menu">
        <a href="parametres.html">Mon profil</a>
        <a href="historique.html">Mes dossiers</a>
        <button class="danger" onclick="portal.signOut()">Se déconnecter</button>
      </div>
    </div>`;
}

export function renderHeader(active) {
  const nav = visibleNav().map(item => navButton(item, active)).join('');

  setHTML('portalHeader', `
    <div class="phead-main">
      <a class="phead-brand" href="accueil.html">
        <img class="logo" src="assets/logo-bac.svg" width="50" height="56"
             alt="Écusson Brigade Anti-Criminalité">
        <span>
          <span class="phead-title">BAC 75 N</span>
          <span class="phead-sub">Brigade Anti-Criminalité — Paris</span>
        </span>
      </a>
      <button class="pburger no-print" onclick="portal.toggleNav()" aria-label="Menu">☰</button>
      <nav class="pnav no-print" id="portalNav">${nav}</nav>
      ${profileBox()}
    </div>
    <div class="phead-status">
      <span class="flag"></span>
      <span class="mut">Police Nationale • France Roleplay • outil fictif</span>
      <span id="who" class="mut"></span>
      <span id="sync" class="sync"></span>
    </div>`);
}

export function setModuleBar(html) {
  setHTML('moduleBar', html ? `<div class="pmodulebar no-print">${html}</div>` : '');
}

export function toGate(reason) {
  window.location.replace(reason ? `${GATE}?r=${reason}` : GATE);
}

export function setSync(text, tone) {
  const node = byId('sync');
  if (!node) return;
  node.textContent = text || '';
  node.style.color = tone === 'error' ? 'var(--red)' : tone === 'ok' ? '#55e8a0' : 'var(--mut)';
}

export function setBanner(html, hostId = 'banner') {
  setHTML(hostId, html || '');
}

export function errorBanner(message) {
  return `<div class="banner error">${esc(message)}</div>`;
}

export function okBanner(message) {
  return `<div class="banner ok">${esc(message)}</div>`;
}

export function deniedCard(permission) {
  return `
    <div class="card">
      <h2>Accès non autorisé</h2>
      <p>
        Ton rôle (<b>${esc(auth.describeRole())}</b>) ne donne pas accès à cette page.
        Demande au Directeur BAC ou à son adjoint de faire évoluer ton accès
        depuis la page Paramètres.
      </p>
      <p class="mut">Permission requise : <code>${esc(permission)}</code>.</p>
      <a class="gate-link" href="accueil.html">Retour à l’accueil</a>
    </div>`;
}

/**
 * Démarrage commun. Renvoie { session, allowed }.
 * `allowed` est faux quand la page exige une permission que le rôle n'a pas :
 * la page affiche alors deniedCard() au lieu de son contenu.
 */
export async function boot({ active, requires } = {}) {
  await store.detectDriver();

  const restored = await auth.restore();
  if (restored.status !== 'ok') {
    toGate(restored.status === 'none' ? 'required' : restored.status);
    return { session: null, allowed: false };
  }

  store.setOperator(auth.describeOperator());
  renderHeader(active);
  document.body.classList.remove('booting');

  if (!isConfigured()) {
    setBanner(`
      <div class="banner">
        <b>Stockage non configuré.</b>
        Renseigne <code>owner</code> et <code>repo</code> dans <code>js/config.js</code>
        pour que les dossiers soient partagés via GitHub. Pour l’instant, tout
        reste dans cet onglet.
      </div>`);
  }

  const allowed = !requires || auth.can(requires);
  return { session: auth.current(), allowed, requires };
}

export function signOut() {
  auth.signOut();
  store.setOperator('');
  toGate('signedout');
}

export function toggleNav() {
  byId('portalNav')?.classList.toggle('open');
}

/** Handlers partagés par toutes les pages du portail. */
export const portal = {
  signOut,
  toggleNav
};

window.portal = portal;
