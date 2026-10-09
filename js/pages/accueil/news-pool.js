// Sélection d'actualités de l'archive V4 (app.js, `newsPool`), mot pour
// mot. Tant que la direction n'a publié aucune actualité, l'accueil tire
// trois de ces fiches au hasard à chaque ouverture, comme l'archive ; dès
// qu'une actualité est publiée, ce sont les actualités publiées qui
// alimentent le panneau.
//
// `go` est la route ouverte au clic ; `img` le fichier du kit
// (assets/bac75n/).

export const NEWS_POOL = [
  { t: 'Formation Radio : prise de vacation', d: 'Rappel pratique · TN 75', img: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg', go: 'formation-radio' },
  { t: 'Négociation : l’écoute active', d: 'Fiche méthode · Formation BAC', img: '04_HOME_CARD_FORMATION_NEGOCIATION.jpg', go: 'formation-negociation' },
  { t: '13 novembre 2015 : BAC 75 N', d: 'Repère historique · Bataclan', img: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg', go: 'formation-antiterrorisme' },
  { t: 'Chef de Groupe : garder la vue d’ensemble', d: 'Commandement · Fiche réflexe', img: '09_FORMATION_CHEF_GROUPE_BANNER.jpg', go: 'formation-chef-groupe' },
  { t: 'Concours BAC : préparation des épreuves', d: 'Intégration · Méthode', img: '03_HOME_CARD_CONCOURS_INTEGRATION_BAC.jpg', go: 'concours' },
  { t: 'Antiterrorisme : passage de relais', d: 'Coordination · Formation', img: '13_ADMINISTRATION_BANNER_UNITE.jpg', go: 'formation-antiterrorisme' },
  { t: 'Radio : construire une transmission', d: 'Clarté · Concision · Priorisation', img: '02_HOME_HERO_BAC_CONTROLE_NUIT.jpg', go: 'formation-radio' },
  { t: 'Négociation : reformuler avant de proposer', d: 'Communication de crise · Méthode', img: '10_FORMATION_NEGOCIATION_BANNER_ALTERNATIVE.jpg', go: 'formation-negociation' },
  { t: 'Chef de Groupe : débriefing', d: 'Retour d’expérience · Formation', img: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg', go: 'formation-chef-groupe' },
  { t: 'Fiche réflexe : observer et qualifier', d: 'Antiterrorisme · Primo-intervention', img: '08_HOME_ACTUALITE_INTERPELLATION.jpg', go: 'formation-antiterrorisme' },
  { t: 'Concours : théorie et radio', d: 'Révision · Intégration BAC', img: '11_CONCOURS_BAC_BANNER_ALTERNATIVE.jpg', go: 'concours' },
  { t: 'Négociation : gérer les émotions', d: 'Formation · Chapitre essentiel', img: '04_HOME_CARD_FORMATION_NEGOCIATION.jpg', go: 'formation-negociation' }
];

/** Tirage de l'archive (`pickNews`) : mélange de Fisher-Yates, puis les n premières. */
export function pick(list, n = 3) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
