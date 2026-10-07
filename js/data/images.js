// Banque d'images du portail — documentation technique V4 §5.
//
// Le kit V4 nomme ses quinze visuels et dit à quoi chacun sert. Ce fichier
// est la liste de ces places : chaque clé dit quel fichier est attendu, à
// quel endroit, et sur quel sujet. Déposer le fichier dans
// `assets/bac75n/` sous le nom indiqué suffit — aucune ligne de code à
// toucher.
//
// Tant qu'une photo du kit n'est pas livrée, `fallback` sert : ce sont les
// quatre photos BAC déjà présentes dans le dépôt. CSS empile les couches
// de `background-image` : la couche du haut ne peint rien si le fichier
// n'existe pas, et le repli reste visible.
//
// Les règles photo du §5 (brassard au bras, dorsale BAC, patch
// NÉGOCIATION, gyrophares bleus, véhicule secondaire) valent pour toute
// image déposée ici, et les droits d'utilisation restent à vérifier avant
// publication publique.

const KIT = 'assets/bac75n';
const DIR = 'assets/img';

/** Le logo principal du kit, avec l'écusson vectoriel du dépôt en repli. */
export const LOGO = {
  file: `${KIT}/01_LOGO_BAC75N_PRINCIPAL.png`,
  fallback: 'assets/logo-bac.svg'
};

export const IMAGE_SLOTS = {
  'accueil-hero': {
    file: '02_HOME_HERO_BAC_CONTROLE_NUIT.jpg',
    attendu: 'Grande bannière accueil : contrôle BAC de nuit, sujet humain prioritaire, véhicule secondaire.',
    fallback: 'cover-hero.jpg'
  },
  concours: {
    file: '03_HOME_CARD_CONCOURS_INTEGRATION_BAC.jpg',
    attendu: 'Carte Concours d’intégration BAC : candidats ou agents en évaluation, brassard au bras.',
    fallback: 'cover-hero.jpg'
  },
  negociation: {
    file: '04_HOME_CARD_FORMATION_NEGOCIATION.jpg',
    attendu: 'Carte Formation Négociation : négociateur en communication, patch NÉGOCIATION.',
    fallback: 'mises-en-situation.jpg'
  },
  'formation-cdg': {
    file: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg',
    attendu: 'Carte Formation Chef de Groupe : briefing de vacation, consignes données au groupe.',
    fallback: 'recap-general.jpg'
  },
  cdg: {
    file: '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg',
    attendu: 'Carte Examen Chef de Groupe : casque-micro, commandement sur intervention.',
    fallback: 'epreuve-tir.jpg'
  },
  'actualite-nuit': {
    file: '07_HOME_ACTUALITE_CONTROLE_NUIT.jpg',
    attendu: 'Miniature Actualités — contrôle / intervention de nuit.',
    fallback: 'cover-hero.jpg'
  },
  'actualite-interpellation': {
    file: '08_HOME_ACTUALITE_INTERPELLATION.jpg',
    attendu: 'Miniature Actualités — interpellation.',
    fallback: 'mises-en-situation.jpg'
  },
  'cours-cdg': {
    file: '09_FORMATION_CHEF_GROUPE_BANNER.jpg',
    attendu: 'Bannière page Formation Chef de Groupe.',
    fallback: 'recap-general.jpg'
  },
  'cours-negociation': {
    file: '10_FORMATION_NEGOCIATION_BANNER_ALTERNATIVE.jpg',
    attendu: 'Bannière page Formation Négociation.',
    fallback: 'mises-en-situation.jpg'
  },
  'concours-banner': {
    file: '11_CONCOURS_BAC_BANNER_ALTERNATIVE.jpg',
    attendu: 'Bannière alternative du module Concours.',
    fallback: 'cover-hero.jpg'
  },
  'sidebar-citation': {
    file: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg',
    attendu: 'Fond du cartouche citation de la barre latérale, scène de nuit.',
    fallback: 'cover-hero.jpg'
  },
  administration: {
    file: '13_ADMINISTRATION_BANNER_UNITE.jpg',
    attendu: 'Bannière administration / unité.',
    fallback: 'recap-general.jpg'
  },
  effectifs: {
    file: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg',
    attendu: 'Visuel d’unité pour le panneau Effectifs. Réserve : ne pas l’imposer s’il jure avec l’écran.',
    fallback: 'recap-general.jpg'
  },
  historique: {
    file: '15_HOME_CARD_HISTORIQUE_BAC75N.jpg',
    attendu: 'Vue d’ensemble BAC 75 N pour l’historique : véhicules, agents, scène de nuit.',
    fallback: 'recap-general.jpg'
  }
};

/**
 * Valeur prête pour `background-image`, photo du kit au-dessus et repli en
 * dessous. Déposer le fichier attendu suffit à le faire apparaître.
 */
export function imageStack(slot) {
  const found = IMAGE_SLOTS[slot];
  if (!found) return `url('${DIR}/cover-hero.jpg')`;
  return `url('${KIT}/${found.file}'), url('${DIR}/${found.fallback}')`;
}

/** Le repli en WebP quand le navigateur sait le lire — §22. */
function webp(fallback) {
  return `${DIR}/${fallback.replace(/\.jpe?g$/i, '.webp')}`;
}

/**
 * Déclaration complète pour un attribut `style` — §22 : le repli est servi
 * en WebP aux navigateurs qui l'acceptent, en JPEG aux autres.
 *
 * Deux déclarations volontairement : la première, en JPEG seul, est
 * comprise partout ; la seconde la remplace là où `image-set()` existe. Un
 * navigateur qui ne connaît pas `image-set()` ignore la seconde et garde
 * l'image, au lieu de n'afficher aucun fond.
 */
export function imageStyle(slot) {
  const found = IMAGE_SLOTS[slot];
  if (!found) return `background-image:url('${DIR}/cover-hero.jpg')`;

  const kit = `url('${KIT}/${found.file}')`;
  const jpeg = `url('${DIR}/${found.fallback}')`;
  const modern = `image-set(url('${webp(found.fallback)}') type("image/webp"), ${jpeg} type("image/jpeg"))`;

  return `background-image:${kit}, ${jpeg};background-image:${kit}, ${modern}`;
}

/** Le fichier à servir dans une balise `img`, et son repli. */
export function imageSources(slot) {
  const found = IMAGE_SLOTS[slot] || IMAGE_SLOTS['accueil-hero'];
  return {
    src: `${KIT}/${found.file}`,
    webp: webp(found.fallback),
    fallback: `${DIR}/${found.fallback}`
  };
}

export function slots() {
  return Object.entries(IMAGE_SLOTS).map(([id, value]) => ({
    id,
    file: `${KIT}/${value.file}`,
    attendu: value.attendu,
    repli: `${DIR}/${value.fallback}`
  }));
}
