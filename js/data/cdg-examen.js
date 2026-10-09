// Contenu de l'examen de qualification Chef de Groupe — repris mot pour
// mot de modules/examen-chef-groupe.html (archive BAC75N_SITE_V4).
//
// Les 10 questions de connaissances sont composées à la création du
// dossier (thème × contexte × effectif) puis figées dans le dossier ; les
// deux mises en situation reçoivent chacune une évolution tirée au sort.

/** Les huit onglets de l'examen, dans l'ordre de l'archive. */
export const STEPS = [
  ['id', 'Identité'],
  ['q', '10 questions'],
  ['lead', 'Commandement'],
  ['s1', 'Situation 1'],
  ['s2', 'Situation 2'],
  ['corr', 'Correction'],
  ['res', 'Résultat'],
  ['final', 'Fiche finale']
];

/** Thèmes de connaissances et mots-clés attendus dans la réponse. */
export const THEMES = [
  { t: 'préparation de vacation', a: ['effectif', 'équipages', 'rôles', 'informations', 'priorités'] },
  { t: 'communication de commandement', a: ['consigne claire', 'priorité', 'compréhension', 'remontée d’information'] },
  { t: 'prise de décision', a: ['faits confirmés', 'hypothèses', 'priorités', 'réévaluation'] },
  { t: 'gestion des effectifs', a: ['répartition', 'délégation', 'vue d’ensemble', 'adaptation'] },
  { t: 'radio', a: ['message court', 'information utile', 'demande précise', 'compte rendu'] },
  { t: 'coordination interservices', a: ['interlocuteur', 'information utile', 'coordination', 'besoins'] },
  { t: 'situation dégradée', a: ['prioriser', 'réorganiser', 'moyens supplémentaires', 'rendre compte'] },
  { t: 'débriefing', a: ['résultat', 'difficultés', 'points positifs', 'améliorations'] }
];

export const CONTEXTS = [
  'début de vacation',
  'intervention déjà engagée',
  'secteur très fréquenté',
  'informations incomplètes',
  'plusieurs équipages disponibles'
];

export const STAFFS = [2, 4, 6, 8];

/** Évolutions à injecter pendant une mise en situation. */
export const EVOLUTIONS = [
  'une information importante change',
  'un collègue demande de l’aide',
  'les informations deviennent contradictoires',
  'un moyen prévu devient indisponible',
  'un autre service arrive sur place'
];

/** Questions de commandement / leadership et leurs mots-clés. */
export const LEAD_QUESTIONS = [
  ['Un agent expérimenté conteste ta consigne devant le groupe. Comment réagis-tu ?', ['calme', 'expliquer', 'écouter', 'maintenir']],
  ['Tu réalises que ta première décision n’est plus adaptée. Que fais-tu ?', ['réévaluer', 'informer', 'nouvelle consigne', 'rendre compte']],
  ['Deux équipages te parlent en même temps à la radio. Comment reprends-tu la situation ?', ['priorité', 'calme', 'messages courts', 'ordre']],
  ['Un agent n’a pas compris sa mission. Que fais-tu ?', ['reformuler', 'vérifier', 'clair']],
  ['Après l’intervention, que doit contenir ton débriefing ?', ['résultat', 'difficultés', 'positifs', 'amélioration']]
];

/** Énoncés des deux mises en situation. */
export const SITUATIONS = [
  'Tu es chef de groupe avec six agents. Un événement est signalé dans une zone fréquentée. Organise ton groupe, fixe les priorités et explique les premières consignes.',
  'Une intervention déjà engagée se dégrade. Plusieurs informations sont incomplètes et un équipage demande une décision rapide. Reprends une vue d’ensemble, réorganise et rends compte.'
];

/** Mots-clés de la correction des situations et de la radio. */
export const SITUATION_KEYS = [
  ['priorité', 'répart', 'consigne', 'information', 'radio'],
  ['priorité', 'réorgan', 'adapter', 'information', 'compte']
];
export const RADIO_KEYS = ['radio', 'information', 'demande', 'compte'];

/** Les quatre décisions, codes du dossier → libellés de l'archive. */
export const DECISIONS = [
  ['QUALIFIE', 'QUALIFIÉ'],
  ['QUALIFIE_RESERVE', 'QUALIFIÉ SOUS RÉSERVE'],
  ['AJOURNE', 'AJOURNÉ'],
  ['REFUSE', 'REFUSÉ']
];

const pick = (list, random) => list[(random() * list.length) | 0];

/** Les 10 questions de connaissances d'un candidat. */
export function generateQuestions(random = Math.random) {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const theme = pick(THEMES, random);
    const context = pick(CONTEXTS, random);
    const staff = pick(STAFFS, random);
    list.push({
      q: `Contexte : ${context}. Tu commandes ${staff} agents. Sur le thème « ${theme.t} », qu’est-ce que tu mets en place et pourquoi ?`,
      keys: theme.a
    });
  }
  return list;
}

/** Les deux mises en situation, chacune avec son évolution. */
export function generateSituations(random = Math.random) {
  return SITUATIONS.map(txt => ({ txt, evol: pick(EVOLUTIONS, random), ans: '' }));
}
