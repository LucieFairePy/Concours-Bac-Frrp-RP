// Formation Chef de Groupe — les 16 chapitres de l'archive V4.
//
// Repris mot pour mot de modules/formation-chef-groupe.html
// (BAC75N_SITE_V4_RADIO) : numéro, titre, introduction, points « Ce qu'il
// faut comprendre », exemple concret, mise en pratique et photo de chaque
// chapitre. La photo est un fichier du kit (assets/bac75n/).
//
// La page (js/pages/formations/chef-de-groupe.js) n'affiche que ce contenu.
// L'ancien parcours (js/data/formations/chef-de-groupe.js) ne sert plus
// qu'à relire les dossiers clôturés avant ce retour à l'archive.

/** L'encadré « À RETENIR », identique pour chaque chapitre dans l'archive. */
export const A_RETENIR = 'Le chef donne des priorités claires, vérifie la compréhension et adapte les consignes lorsque la situation évolue.';

export const LECONS = [
  {
    number: '01',
    title: 'Rôle du chef de groupe',
    intro: 'Le chef de groupe garde une vue d’ensemble. Il organise, donne un cap clair et s’assure que chaque agent sait ce qu’il doit faire et pourquoi.',
    points: [
      'Être exemplaire.',
      'Décider avec les informations disponibles.',
      'Rester capable de modifier une décision.',
      'Rendre compte.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « rôle du chef de groupe » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg'
  },
  {
    number: '02',
    title: 'Responsabilités et posture',
    intro: 'Commander ne signifie pas donner le plus d’ordres possible. Le chef doit être calme, lisible et cohérent.',
    points: [
      'Donner des consignes courtes.',
      'Écouter les remontées terrain.',
      'Éviter les contradictions.',
      'Assumer et expliquer les changements.'
    ],
    example: 'Pendant la mission, une information change : le chef explique la nouvelle priorité et demande un retour clair de chaque équipage.',
    exercise: 'Explique avec tes mots comment tu appliquerais « responsabilités et posture » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '09_FORMATION_CHEF_GROUPE_BANNER.jpg'
  },
  {
    number: '03',
    title: 'Préparation de la vacation',
    intro: 'Avant le départ, vérifier l’effectif, les équipages, les véhicules, les indicatifs, les rôles et les informations utiles.',
    points: [
      'Qui est présent ?',
      'Qui travaille avec qui ?',
      'Quels rôles ?',
      'Quel canal / indicatif ?',
      'Quelles priorités de vacation ?'
    ],
    example: 'À la fin, le chef vérifie les effectifs, résume les faits et transmet un compte rendu compréhensible.',
    exercise: 'Explique avec tes mots comment tu appliquerais « préparation de la vacation » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg'
  },
  {
    number: '04',
    title: 'Communication et leadership',
    intro: 'Une consigne efficace est courte, compréhensible et vérifiable.',
    points: [
      'Dire quoi faire.',
      'Préciser la priorité.',
      'Vérifier que la consigne est comprise.',
      'Laisser remonter les informations.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « communication et leadership » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '13_ADMINISTRATION_BANNER_UNITE.jpg'
  },
  {
    number: '05',
    title: 'Prise de décision',
    intro: 'Analyser ce qui est certain, ce qui est probable et ce qui reste à vérifier avant de prioriser.',
    points: [
      'Ne pas attendre d’avoir 100 % des informations.',
      'Ne pas confondre vitesse et précipitation.',
      'Réévaluer lorsque la situation évolue.'
    ],
    example: 'Pendant la mission, une information change : le chef explique la nouvelle priorité et demande un retour clair de chaque équipage.',
    exercise: 'Explique avec tes mots comment tu appliquerais « prise de décision » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg'
  },
  {
    number: '06',
    title: 'Gestion des effectifs',
    intro: 'Adapter la répartition au nombre d’agents disponibles et à la situation.',
    points: [
      '2 agents : rester simple.',
      '4 agents : répartir clairement.',
      '6 à 8 agents : déléguer et conserver une vue d’ensemble.',
      'Éviter de microgérer chaque geste.'
    ],
    example: 'À la fin, le chef vérifie les effectifs, résume les faits et transmet un compte rendu compréhensible.',
    exercise: 'Explique avec tes mots comment tu appliquerais « gestion des effectifs » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '09_FORMATION_CHEF_GROUPE_BANNER.jpg'
  },
  {
    number: '07',
    title: 'Gestion radio',
    intro: 'La radio doit donner une image claire de la situation sans saturer le canal.',
    points: [
      'Message court.',
      'Éléments utiles.',
      'Demandes précises.',
      'Mises à jour lorsqu’un élément change.',
      'Compte rendu après stabilisation.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « gestion radio » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg'
  },
  {
    number: '08',
    title: 'Commandement sur intervention',
    intro: 'À l’arrivée, récupérer les informations, identifier les priorités, attribuer les missions et contrôler l’évolution.',
    points: [
      'Qui commande ?',
      'Qu’est-ce qui est confirmé ?',
      'Quelle priorité immédiate ?',
      'Qui fait quoi ?',
      'Quand réévaluer ?'
    ],
    example: 'Pendant la mission, une information change : le chef explique la nouvelle priorité et demande un retour clair de chaque équipage.',
    exercise: 'Explique avec tes mots comment tu appliquerais « commandement sur intervention » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '13_ADMINISTRATION_BANNER_UNITE.jpg'
  },
  {
    number: '09',
    title: 'Coordination interservices',
    intro: 'Le chef de groupe doit savoir travailler avec Police Secours, CRS, PJ, secours, commandement et négociateur selon le scénario.',
    points: [
      'Identifier le bon interlocuteur.',
      'Partager l’information utile.',
      'Éviter les ordres contradictoires.',
      'Faire remonter les besoins.'
    ],
    example: 'À la fin, le chef vérifie les effectifs, résume les faits et transmet un compte rendu compréhensible.',
    exercise: 'Explique avec tes mots comment tu appliquerais « coordination interservices » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg'
  },
  {
    number: '10',
    title: 'Situation qui se dégrade',
    intro: 'Si un collègue est en difficulté, si les informations deviennent contradictoires ou si les moyens sont insuffisants, reprendre une vue d’ensemble et réorganiser.',
    points: [
      'Prioriser.',
      'Réaffecter les agents.',
      'Demander les moyens utiles.',
      'Informer le commandement.',
      'Continuer à réévaluer.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « situation qui se dégrade » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '09_FORMATION_CHEF_GROUPE_BANNER.jpg'
  },
  {
    number: '11',
    title: 'Situation majeure',
    intro: 'Plus l’événement est important, plus le chef doit déléguer, structurer l’information et garder une vue générale.',
    points: [
      'Découper les missions.',
      'Nommer des responsables.',
      'Centraliser les remontées.',
      'Demander du renfort si nécessaire.'
    ],
    example: 'Pendant la mission, une information change : le chef explique la nouvelle priorité et demande un retour clair de chaque équipage.',
    exercise: 'Explique avec tes mots comment tu appliquerais « situation majeure » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg'
  },
  {
    number: '12',
    title: 'Erreurs de commandement',
    intro: 'Les erreurs classiques : consignes floues, microgestion, précipitation, absence de compte rendu, équipage oublié, changements constants, perte de calme.',
    points: [
      'Une décision imparfaite mais claire peut être corrigée.',
      'Une organisation incompréhensible désorganise tout le groupe.'
    ],
    example: 'À la fin, le chef vérifie les effectifs, résume les faits et transmet un compte rendu compréhensible.',
    exercise: 'Explique avec tes mots comment tu appliquerais « erreurs de commandement » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '13_ADMINISTRATION_BANNER_UNITE.jpg'
  },
  {
    number: '13',
    title: 'Débriefing',
    intro: 'Après l’intervention : résultat, difficultés, erreurs, points positifs, éléments à transmettre et enseignements.',
    points: [
      'Ce qui a fonctionné.',
      'Ce qui doit être amélioré.',
      'Ce qui doit être signalé.',
      'Ce qui change pour la suite.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « débriefing » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg'
  },
  {
    number: '14',
    title: 'Exercices pratiques',
    intro: 'Le formateur fait travailler des situations courtes avec 2, 4, 6 puis 8 agents, en ajoutant progressivement une évolution.',
    points: [
      'Répartition.',
      'Consignes.',
      'Radio.',
      'Adaptation.',
      'Compte rendu.'
    ],
    example: 'Pendant la mission, une information change : le chef explique la nouvelle priorité et demande un retour clair de chaque équipage.',
    exercise: 'Explique avec tes mots comment tu appliquerais « exercices pratiques » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '09_FORMATION_CHEF_GROUPE_BANNER.jpg'
  },
  {
    number: '15',
    title: 'Fiche réflexe',
    intro: 'ANALYSER → PRIORISER → ORGANISER → DONNER LES CONSIGNES → COORDONNER → CONTRÔLER → ADAPTER → RENDRE COMPTE.',
    points: [
      'Le bon chef n’est pas celui qui parle le plus : c’est celui dont le groupe comprend la mission.'
    ],
    example: 'À la fin, le chef vérifie les effectifs, résume les faits et transmet un compte rendu compréhensible.',
    exercise: 'Explique avec tes mots comment tu appliquerais « fiche réflexe » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg'
  },
  {
    number: '16',
    title: 'Évaluation finale',
    intro: 'La formation prépare à l’examen de qualification Chef de Groupe BAC.',
    points: [
      'Connaissances essentielles.',
      'Commandement et leadership.',
      'Deux mises en situation.',
      'Radio et compte rendu.'
    ],
    example: 'Avant la mission, le chef demande un point de situation, vérifie ce qui est confirmé, puis donne une consigne courte et précise.',
    exercise: 'Explique avec tes mots comment tu appliquerais « évaluation finale » dans une vacation BAC. Donne une priorité, un message radio et une information à vérifier.',
    photo: '13_ADMINISTRATION_BANNER_UNITE.jpg'
  }
];
