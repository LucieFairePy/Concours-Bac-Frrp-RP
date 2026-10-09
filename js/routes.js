// Table des routes du portail — documentation technique V4 §4.1.
//
// Le portail est une seule page (index.html) : chaque écran a une adresse
// `#/…`, comme dans la maquette V4. GitHub Pages sert le fichier tel quel,
// sans routeur côté serveur ni repli 404 à configurer.
//
// C'est le seul endroit où une adresse est écrite. Le reste du code passe
// par href(<route>) ; une page est chargée seulement quand on l'ouvre.
//
//   path     adresse après `#/`
//   nav      entrée de la barre latérale allumée sur cette page
//   layout   'module' : module plein écran, sans la coque du portail
//   requires permission exigée (js/core/roles.js) ; sans elle, la page
//            affiche un refus au lieu de son contenu
//   load     le module de la page, chargé à la demande

export const ROUTES = {
  accueil: {
    path: 'accueil',
    nav: 'accueil',
    title: 'Accueil',
    load: () => import('./pages/accueil/index.js')
  },
  concours: {
    layout: 'module',
    path: 'concours',
    nav: 'concours',
    title: 'Concours d’intégration BAC',
    load: () => import('./pages/concours/index.js')
  },
  formations: {
    path: 'formations',
    nav: 'formations',
    title: 'Formations BAC',
    load: () => import('./pages/formations/index.js')
  },
  'formation-negociation': {
    layout: 'module',
    path: 'formations/negociation',
    nav: 'negociation',
    title: 'Formation Négociation BAC',
    load: () => import('./pages/formations/negociation.js')
  },
  'formation-chef-groupe': {
    layout: 'module',
    path: 'formations/chef-de-groupe',
    nav: 'formation-cdg',
    title: 'Formation Chef de Groupe BAC',
    load: () => import('./pages/formations/chef-de-groupe.js')
  },
  'formation-radio': {
    layout: 'module',
    path: 'formations/radio',
    nav: 'radio',
    title: 'Formation Radio BAC',
    load: () => import('./pages/formations/radio.js')
  },
  'formation-antiterrorisme': {
    layout: 'module',
    path: 'formations/antiterrorisme',
    nav: 'antiterrorisme',
    title: 'Formation Antiterrorisme BAC',
    load: () => import('./pages/formations/antiterrorisme.js')
  },
  'examen-chef-groupe': {
    layout: 'module',
    path: 'examens/chef-de-groupe',
    nav: 'cdg',
    title: 'Examen Chef de Groupe',
    load: () => import('./pages/examen-cdg/index.js')
  },
  historique: {
    path: 'historique',
    nav: 'historique',
    title: 'Historique',
    load: () => import('./pages/historique/index.js')
  },
  actualites: {
    path: 'actualites',
    nav: 'administration',
    title: 'Actualités',
    load: () => import('./pages/actualites/index.js')
  },
  administration: {
    path: 'administration',
    nav: 'administration',
    title: 'Administration',
    requires: 'accounts',
    load: () => import('./pages/administration/index.js')
  },
  utilisateurs: {
    path: 'administration/utilisateurs',
    nav: 'utilisateurs',
    title: 'Gestion des utilisateurs',
    requires: 'accounts',
    load: () => import('./pages/utilisateurs/index.js')
  },
  parametres: {
    path: 'administration/parametres',
    nav: 'parametres',
    title: 'Paramètres du site',
    load: () => import('./pages/parametres/index.js')
  }
};

export const HOME = 'accueil';

/**
 * Anciennes adresses encore valides : les liens `#/…` de la maquette V4
 * (`#/concours`, `#/chef-groupe`…) et la racine. Elles mènent à la route
 * actuelle sans casser un favori.
 */
const ALIASES = {
  '': 'accueil',
  negociation: 'formation-negociation',
  'chef-groupe': 'formation-chef-groupe',
  'chef-de-groupe': 'formation-chef-groupe',
  radio: 'formation-radio',
  antiterrorisme: 'formation-antiterrorisme',
  examens: 'examen-chef-groupe',
  'concours-bac': 'concours',
  utilisateurs: 'utilisateurs',
  parametres: 'parametres'
};

/**
 * Les pages de l'ancien site à plat (`app.html?dossier=…`). Le 404 de
 * GitHub Pages et les tests s'en servent pour rediriger vers la bonne
 * route avec la même requête.
 */
export const LEGACY_PAGES = {
  'accueil.html': 'accueil',
  'app.html': 'concours',
  'formations.html': 'formations',
  'negociation.html': 'formation-negociation',
  'chef-de-groupe.html': 'formation-chef-groupe',
  'examen-cdg.html': 'examen-chef-groupe',
  'historique.html': 'historique',
  'actualites.html': 'actualites',
  'administration.html': 'administration',
  'utilisateurs.html': 'utilisateurs',
  'parametres.html': 'parametres'
};

/** Adresse d'une route, avec une requête facultative : href('historique', { q: 'x' }). */
export function href(id, query) {
  const route = ROUTES[id];
  if (!route) throw new Error(`Route inconnue : ${id}`);
  const search = query ? new URLSearchParams(query).toString() : '';
  return `#/${route.path}${search ? `?${search}` : ''}`;
}

/** `#/formations/radio?x=1` → { id: 'formation-radio', params }. */
export function resolve(hash) {
  const raw = String(hash || '').replace(/^#\/?/, '');
  const [pathPart, search = ''] = raw.split('?');
  const clean = pathPart.replace(/\/+$/, '');

  const id = Object.keys(ROUTES).find(key => ROUTES[key].path === clean)
    || ALIASES[clean]
    || null;

  return { id, params: new URLSearchParams(search) };
}
