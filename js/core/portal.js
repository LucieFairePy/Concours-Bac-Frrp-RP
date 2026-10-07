// Coque du portail BAC 75 N — documentation technique V4 §6 (barre
// latérale, en-tête) et §17 (rôles). Toutes les pages du portail démarrent
// par portal.boot() : même garde de session, même barre latérale, même
// en-tête, même profil en haut à droite. Une seule source de vérité pour
// la navigation.

import { CONFIG, isConfigured } from '../config.js';
import { byId, esc, initials, setHTML } from './dom.js';
import { imageStyle, LOGO } from '../data/images.js';
import * as store from './store.js';
import * as auth from './auth.js';
import * as thresholds from './thresholds.js';
import { state } from './state.js';

const GATE = 'index.html';

/**
 * Les routes du §4.1. `id` est l'identifiant de route du kit, `path` le
 * fichier qui la sert dans ce dépôt, `route` l'adresse logique du kit.
 *
 * Le dépôt sert des fichiers `.html` à plat plutôt que des adresses
 * propres : sur GitHub Pages, `/concours-bac` demanderait un routeur et un
 * repli 404, et l'annexe E dit de conserver l'architecture du dépôt en
 * reproduisant le contrat fonctionnel. Les identifiants, eux, sont ceux du
 * kit, et cette table est le seul endroit où une adresse est écrite.
 */
export const ROUTES = {
  home: { route: '/', path: 'accueil.html' },
  'concours-bac': { route: '/concours-bac', path: 'app.html' },
  'formation-negociation': { route: '/formations/negociation', path: 'negociation.html' },
  'formation-chef-groupe': { route: '/formations/chef-de-groupe', path: 'chef-de-groupe.html' },
  'examen-chef-groupe': { route: '/examens/chef-de-groupe', path: 'examen-cdg.html' },
  formations: { route: '/formations', path: 'formations.html' },
  history: { route: '/historique', path: 'historique.html' },
  news: { route: '/actualites', path: 'actualites.html' },
  admin: { route: '/administration', path: 'administration.html' },
  users: { route: '/administration/utilisateurs', path: 'utilisateurs.html' },
  settings: { route: '/administration/parametres', path: 'parametres.html' }
};

export function path(routeId) {
  const found = ROUTES[routeId];
  if (!found) throw new Error(`Route inconnue : ${routeId}`);
  return found.path;
}

/**
 * La navigation de la barre latérale — §6.1. `need` est la permission
 * requise : un rôle qui ne l'a pas ne voit pas l'entrée. `sub` liste les
 * sous-entrées, affichées sous leur section. `group` ouvre un intertitre.
 */
export const NAV = [
  { id: 'accueil', route: 'home', label: 'Accueil', icon: '⌂', href: path('home') },
  { id: 'concours', route: 'concours-bac', label: 'Concours', icon: '◆', href: path('concours-bac') },
  {
    id: 'formations',
    label: 'Formations',
    icon: '▤',
    route: 'formations',
    href: path('formations'),
    sub: [
      { id: 'negociation', route: 'formation-negociation', label: 'Négociation BAC', href: path('formation-negociation') },
      { id: 'formation-cdg', route: 'formation-chef-groupe', label: 'Chef de Groupe BAC', href: path('formation-chef-groupe') }
    ]
  },
  {
    id: 'examens',
    label: 'Examens',
    icon: '✓',
    route: 'examen-chef-groupe',
    href: path('examen-chef-groupe'),
    sub: [
      { id: 'cdg', route: 'examen-chef-groupe', label: 'Qualification Chef de Groupe', href: path('examen-chef-groupe') }
    ]
  },
  { id: 'historique', route: 'history', label: 'Historique', icon: '≡', href: path('history') },
  { id: 'actualites', route: 'news', label: 'Actualités', icon: '◈', href: path('news') },
  { group: 'Direction' },
  { id: 'administration', route: 'admin', label: 'Administration', icon: '⚑', href: path('admin'), need: 'accounts' },
  { id: 'utilisateurs', route: 'users', label: 'Gestion utilisateurs', icon: '⚇', href: path('users'), need: 'accounts' },
  { id: 'parametres', route: 'settings', label: 'Paramètres', icon: '⚙', href: path('settings') }
];

function visibleNav() {
  return NAV.filter(item => !item.need || auth.can(item.need));
}

function navEntry(item, active) {
  if (item.group) return `<div class="psb-sep">${esc(item.group)}</div>`;

  const on = item.id === active || (item.sub || []).some(child => child.id === active);
  const head = `
    <a class="psb-item${on ? ' active' : ''}" href="${item.href}">
      <span aria-hidden="true">${esc(item.icon || '•')}</span>${esc(item.label)}
    </a>`;

  if (!item.sub) return head;

  const children = item.sub
    .map(child => `<a class="psb-sub${child.id === active ? ' active' : ''}" href="${child.href}">${esc(child.label)}</a>`)
    .join('');

  return head + children;
}

/** §6.1 — logo, identité, devise, navigation, cartouche citation. */
export function renderSidebar(active) {
  let aside = byId('portalSidebar');
  if (!aside) {
    aside = document.createElement('aside');
    aside.id = 'portalSidebar';
    aside.className = 'psidebar no-print';
    document.body.prepend(aside);
  }

  aside.innerHTML = `
    <a class="psb-head" href="accueil.html">
      <img src="${LOGO.file}" width="130" height="130"
           alt="Écusson Brigade Anti-Criminalité 75 N"
           onerror="this.onerror=null;this.src='${LOGO.fallback}'">
      <div class="psb-unit">Brigade Anti-Criminalité</div>
      <div class="psb-name">BAC 75 N</div>
      <div class="psb-devise">Pro Patria Vigilant</div>
      <div class="psb-flag"></div>
    </a>
    <nav class="psb-nav">${visibleNav().map(item => navEntry(item, active)).join('')}</nav>
    <div class="psb-quote">
      <div class="psb-quote-img" style="${imageStyle('sidebar-citation')}"></div>
      <span>« Parler pour sauver des vies »</span>
    </div>`;

  document.body.classList.add('portal-shell');
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

/**
 * §6.2 — identité Police Nationale / France Roleplay, recherche globale,
 * état de session puis profil connecté, sur une seule rangée de 68 px.
 */
export function renderHeader(active) {
  renderSidebar(active);

  setHTML('portalHeader', `
    <div class="phead-main">
      <button class="pburger no-print" onclick="portal.toggleNav()" aria-label="Ouvrir le menu">☰</button>
      <span class="phead-id">
        <span class="flag"></span>
        <span>
          <span class="phead-title">Police Nationale</span>
          <span class="phead-sub">France Roleplay • outil fictif</span>
        </span>
      </span>
      <form class="psearch no-print" onsubmit="return portal.search(event)">
        <label class="sr-only" for="portalSearch">Recherche globale</label>
        <input id="portalSearch" name="q" type="search"
               placeholder="Rechercher un dossier, un candidat, un matricule…">
        <button type="submit">Chercher</button>
      </form>
      <span class="phead-state">
        <span id="who" class="mut"></span>
        <span id="sync" class="sync"></span>
      </span>
      ${profileBox()}
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

  // Les réglages partagés — direction et seuils de suggestion — sont lus
  // une fois par page, ici, pour que tous les modules travaillent avec les
  // mêmes valeurs. Illisibles, ils retombent sur celles du kit sans
  // empêcher la page de s'ouvrir.
  try {
    const stored = await store.loadSettings();
    if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
    thresholds.apply(state.settings);
  } catch (error) {
    setBanner(errorBanner(`Paramètres illisibles : ${error.message} — valeurs du kit utilisées.`));
  }

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
  byId('portalSidebar')?.classList.toggle('open');
}

/**
 * Recherche globale de l'en-tête — §6.2. Elle n'invente pas de moteur :
 * elle ouvre l'historique central, qui sait déjà chercher par nom,
 * matricule, numéro de dossier et examinateur.
 */
export function search(event) {
  if (event) event.preventDefault();
  const field = byId('portalSearch');
  const value = String(field && field.value ? field.value : '').trim();
  window.location.href = value
    ? `historique.html?q=${encodeURIComponent(value)}`
    : 'historique.html';
  return false;
}

/** Handlers partagés par toutes les pages du portail. */
export const portal = {
  signOut,
  toggleNav,
  search
};

// Le navigateur appelle ces handlers depuis les gabarits ; hors
// navigateur — suite de tests, contrôle statique — le module se charge
// quand même, pour que ses routes et sa navigation restent lisibles.
if (typeof window !== 'undefined') window.portal = portal;
