// Routeur du portail : une adresse `#/…` → une page.
//
// Contrat d'une page (js/pages/<nom>/index.js, export par défaut) :
//
//   mainClass   classe posée sur <main> (facultatif)
//   template()  le HTML de la page, peint dans <main> avant mount()
//   mount(ctx)  remplit la page ; ctx = { params, session, alive() }
//   handlers    l'objet exposé sur window.app pour les gabarits
//   canLeave()  faux s'il reste des modifications non enregistrées
//   onHide()    l'onglet passe en arrière-plan : enregistrer ce qui traîne
//   unmount()   la page est quittée : arrêter ses minuteries
//
// Quitter une page avec des modifications non enregistrées demande
// confirmation ; refusé, l'adresse revient sur la page en cours.

import { byId } from './core/dom.js';
import * as auth from './core/auth.js';
import { ROUTES, HOME, resolve, href } from './routes.js';
import * as portal from './shell/index.js';

const SITE = 'Portail BAC 75 N';

let current = null;   // { id, page }
let shownHash = '';
let token = 0;

function confirmLeave() {
  if (!current || !current.page.canLeave || current.page.canLeave()) return true;
  return window.confirm('Des modifications ne sont pas enregistrées. Quitter quand même cette page ?');
}

async function leave() {
  if (!current) return;
  const { page } = current;
  current = null;
  window.app = undefined;
  try {
    if (page.unmount) await page.unmount();
  } catch (error) {
    console.error(error);
  }
}

function mainHost() {
  return byId('view');
}

async function show(id, params) {
  const route = ROUTES[id];
  const mine = ++token;
  const alive = () => mine === token;

  let page;
  try {
    page = (await route.load()).default;
  } catch (error) {
    if (!alive()) return;
    mainHost().innerHTML = `<div id="banner"></div>${portal.errorBanner(`Page indisponible : ${error.message}`)}`;
    return;
  }
  if (!alive()) return;

  await leave();

  document.title = `${route.title} — ${SITE}`;
  portal.paint(route.nav);
  portal.setModuleBar('');
  portal.setSync('');

  const main = mainHost();
  main.className = page.mainClass || '';
  main.innerHTML = `<div id="banner" class="no-print">${portal.localBanner()}</div>`;
  window.scrollTo(0, 0);

  if (route.requires && !auth.can(route.requires)) {
    main.insertAdjacentHTML('beforeend', portal.deniedCard(route.requires));
    return;
  }

  main.insertAdjacentHTML('beforeend', page.template ? page.template({ params }) : '');
  current = { id, page };
  window.app = page.handlers || {};

  try {
    await page.mount({ params, session: auth.current(), alive });
  } catch (error) {
    if (!alive()) return;
    console.error(error);
    portal.setBanner(portal.errorBanner(`Ouverture impossible : ${error.message}`));
  }
}

async function onHashChange() {
  const hash = window.location.hash;
  if (hash === shownHash) return;

  const { id, params } = resolve(hash);
  if (!id) {
    window.location.replace(href(HOME));
    return;
  }

  // Même page, autre requête (un dossier de l'historique, une actualité) :
  // la page est rechargée elle aussi, après la même confirmation.
  if (!confirmLeave()) {
    history.replaceState(null, '', shownHash || href(HOME));
    return;
  }

  shownHash = hash;
  await show(id, params);
}

/** Démarre le routeur sur l'adresse courante. */
export function start() {
  window.addEventListener('hashchange', onHashChange);

  window.addEventListener('beforeunload', event => {
    if (!current || !current.page.canLeave || current.page.canLeave()) return;
    event.preventDefault();
    event.returnValue = '';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && current && current.page.onHide) current.page.onHide();
  });

  if (!resolve(window.location.hash).id) {
    history.replaceState(null, '', href(HOME));
  }
  return onHashChange();
}

/** Recharge la page en cours avec la même adresse. */
export function reload() {
  const { id, params } = resolve(window.location.hash);
  if (id) return show(id, params);
  return undefined;
}

/**
 * Change la requête de l'adresse sans recharger la page (un filtre de
 * l'historique, par exemple) : le bouton retour retrouve l'état.
 */
export function replaceQuery(query) {
  const { id } = resolve(window.location.hash);
  if (!id) return;
  shownHash = href(id, query);
  history.replaceState(null, '', shownHash);
}
