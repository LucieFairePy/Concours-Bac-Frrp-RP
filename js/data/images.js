// Banque d'images du portail — cahier des charges §2 et §18.
//
// Le cahier des charges demande d'utiliser la banque d'images BAC fournie
// par le commanditaire, et interdit de la remplacer par des visuels
// génériques. Ce fichier est donc une **liste de places** : chaque clé dit
// quelle photo est attendue à quel endroit, et sur quel sujet.
//
// Tant qu'une photo n'est pas livrée, `fallback` sert : ce sont les quatre
// photos BAC déjà présentes dans le dépôt, choisies pour rester cohérentes
// avec la page. Aucune image d'une autre police, d'un autre pays ou d'une
// banque d'images libre n'est introduite ici.
//
// Pour livrer une photo : la déposer dans assets/img/ sous le nom indiqué
// par `file`. Elle est prise en compte au prochain chargement, sans
// toucher au code.

const DIR = 'assets/img';

export const IMAGE_SLOTS = {
  'accueil-hero': {
    file: 'accueil-hero.jpg',
    attendu: 'Grande photo terrain : équipage BAC 75 N à Paris, de nuit de préférence.',
    fallback: 'cover-hero.jpg'
  },
  concours: {
    file: 'module-concours.jpg',
    attendu: 'Candidats ou agents en évaluation, brassard visible.',
    fallback: 'cover-hero.jpg'
  },
  negociation: {
    file: 'module-negociation.jpg',
    attendu: 'Négociateur en communication, poste de négociation, périmètre tenu.',
    fallback: 'mises-en-situation.jpg'
  },
  'formation-cdg': {
    file: 'module-chef-de-groupe.jpg',
    attendu: 'Briefing de vacation, chef de groupe donnant les consignes.',
    fallback: 'recap-general.jpg'
  },
  cdg: {
    file: 'module-examen-cdg.jpg',
    attendu: 'Commandement sur intervention, gyrophares, coordination d’équipages.',
    fallback: 'epreuve-tir.jpg'
  },
  historique: {
    file: 'module-historique.jpg',
    attendu: 'Vue d’ensemble BAC 75 N : véhicules, agents, scène de nuit.',
    fallback: 'recap-general.jpg'
  },
  administration: {
    file: 'module-administration.jpg',
    attendu: 'Poste de commandement, salle de briefing.',
    fallback: 'recap-general.jpg'
  },
  'cours-negociation': {
    file: 'cours-negociation.jpg',
    attendu: 'Bandeau de cours négociation : contact, écoute, périmètre.',
    fallback: 'mises-en-situation.jpg'
  },
  'cours-cdg': {
    file: 'cours-chef-de-groupe.jpg',
    attendu: 'Bandeau de cours commandement : briefing, radio, dispositif.',
    fallback: 'recap-general.jpg'
  }
};

/**
 * Valeur prête pour `background-image`, avec la photo attendue au-dessus et
 * le repli en dessous. CSS empile les couches : si le fichier attendu n'est
 * pas encore livré, sa couche ne peint rien et le repli reste visible. Il
 * suffit donc de déposer le fichier pour qu'il prenne la place.
 */
export function imageStack(slot) {
  const found = IMAGE_SLOTS[slot];
  if (!found) return `url('${DIR}/cover-hero.jpg')`;
  return `url('${DIR}/${found.file}'), url('${DIR}/${found.fallback}')`;
}

export function slots() {
  return Object.entries(IMAGE_SLOTS).map(([id, value]) => ({
    id,
    file: `${DIR}/${value.file}`,
    attendu: value.attendu,
    repli: `${DIR}/${value.fallback}`
  }));
}
