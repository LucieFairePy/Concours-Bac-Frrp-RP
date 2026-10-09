// Formation Radio BAC — le parcours évalué d'avant (Identité → Cours →
// Évaluation → Correction → Fiche finale).
//
// La page ne l'affiche plus : elle montre le cours de l'archive tel quel
// (js/data/formations/radio-cours.js). Ce contenu reste pour relire les
// anciens dossiers radio ouverts depuis l'historique — leur fiche finale
// cite ces chapitres, exercices et questions — et pour le registre des
// formations (js/data/formations/index.js).
//
// Règle de rédaction imposée par le cahier des charges : complet sur le
// fond, simple dans la formulation. Chaque notion suit le même chemin —
// explication simple → exemple RP → point à retenir → exercice éventuel.
//
// Le contenu reprend fidèlement le module source : neuf chapitres, leurs
// sous-parties, les modèles de transmission, les raccourcis, les situations
// spécifiques, les exercices et la fiche réflexe. Seules quelques phrases de
// liaison ont été ajoutées ; aucune doctrine nouvelle.
//
// Tout reste au niveau organisation, communication, commandement et jeu de
// rôle. Rien ici n'est un manuel réel : c'est une formation de serveur de
// jeu, et les contenus sont écrits pour être joués.
//
// Types de blocs de l'ancienne vue de cours (retirée avec le moteur commun) :
//   p        paragraphe
//   liste    liste à puces
//   rp       exemple de jeu de rôle
//   dialogue échange type, une réplique par ligne
//   retenir  encadré « À RETENIR »
//   erreurs  encadré « ERREURS À ÉVITER »
//   etapes   enchaînement de la fiche réflexe
//   table    tableau simple
//   exercice question d'entraînement, avec champ de réponse

export const REFLEXE_RADIO = {
  title: 'FICHE RÉFLEXE RADIO',
  steps: [
    'ÉCOUTER',
    'IDENTIFIER',
    'LOCALISER',
    'INFORMER',
    'PRIORISER',
    'DEMANDER',
    'ACTUALISER',
    'RENDRE COMPTE'
  ]
};

export const RADIO = {
  id: 'radio',
  module: 'radio',
  title: 'Formation Radio BAC',
  subtitle: 'Brigade Anti-Criminalité 75 N — France Roleplay',
  intro:
    'Cette formation apprend à utiliser la radio comme un outil de travail : '
    + 'écouter, identifier, transmettre, coordonner. Elle couvre la discipline '
    + 'du réseau, la prise d’écoute et de vacation, les indicatifs, la structure '
    + 'd’une transmission, les raccourcis d’intervention et les situations '
    + 'd’urgence.',
  reflexe: REFLEXE_RADIO,
  image: 'cours-radio',

  chapters: [
    {
      id: 'fondamentaux',
      num: '01',
      title: 'Fondamentaux radio',
      blocks: [
        { t: 'p', text: '1.1 — Rôle de la radio. La radio permet aux unités et au centre radio de partager rapidement les informations nécessaires à la coordination d’une intervention.' },
        {
          t: 'liste',
          items: [
            'Écouter avant de parler.',
            'Transmettre des informations claires et précises.',
            'Être concis et aller à l’essentiel.',
            'Respecter la discipline du réseau.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Une transmission claire, courte et structurée réduit les erreurs et améliore la coordination.'
          ]
        },
        { t: 'p', text: '1.2 — Terminologie essentielle. Ces termes reviennent dans chaque échange radio : ils doivent être connus avant la première vacation.' },
        {
          t: 'table',
          head: ['Terme', 'Signification'],
          rows: [
            ['TN / Centre radio', 'Centre de commandement et de coordination'],
            ['Indicatif', 'Nom radio d’une unité'],
            ['Écoute', 'Réception des communications'],
            ['Vacation', 'Période d’activité sur le réseau'],
            ['Transmettez', 'Autorisation de parler donnée par le centre'],
            ['Reçu', 'Confirmation de bonne réception']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Points essentiels : toujours écouter avant de parler.',
            'Parler calmement et distinctement.',
            'Utiliser un ton professionnel.',
            'Être concis.',
            'Respecter la discipline du réseau.'
          ]
        }
      ]
    },

    {
      id: 'discipline',
      num: '02',
      title: 'Discipline du réseau',
      blocks: [
        { t: 'p', text: '2.1 — Règles de communication. Le réseau est partagé par toutes les unités : chaque message doit laisser la place aux autres.' },
        {
          t: 'liste',
          items: [
            'Ne pas couper une transmission sauf nécessité urgente.',
            'Préparer mentalement le message avant d’émettre.',
            'Éviter les répétitions et les détails secondaires.',
            'Laisser le réseau disponible après son message.'
          ]
        },
        {
          t: 'erreurs',
          items: [
            'Monopoliser le réseau.',
            'Transmettre une longue explication alors que la localisation, la situation et le besoin peuvent être donnés immédiatement.'
          ]
        }
      ]
    },

    {
      id: 'vacation',
      num: '03',
      title: 'Prise d’écoute et prise de vacation',
      blocks: [
        { t: 'p', text: '3.1 — Composition des effectifs. La composition d’un équipage s’annonce en trois chiffres, dans l’ordre des corps.' },
        {
          t: 'table',
          head: ['Position', 'Corps'],
          rows: [
            ['1er chiffre', 'Corps de direction'],
            ['2e chiffre', 'Corps de commandement'],
            ['3e chiffre', 'Corps d’application']
          ]
        },
        { t: 'p', text: 'Exemple : 0 + 1 + 2 = aucun corps de direction, un corps de commandement, deux corps d’application.' },
        { t: 'p', text: '3.2 — Exemple : BAC 75 N Alpha.' },
        { t: 'dialogue', text: '— BAC 75 N Alpha : « TN 75 de BAC 75 N Alpha. »\n— TN 75 : « Transmettez. »\n— BAC 75 N Alpha : « TN 75 de BAC 75 N Alpha, annonce la prise d’écoute et la prise de vacation de la BAC 75 N Alpha, à son bord trois effectifs, effectifs masculins et/ou féminins, en 0 + 1 + 2, pour des missions de brigade anticriminalité sur Paris et ses alentours. Comment est-ce reçu, parlez. »' },
        { t: 'p', text: '3.3 — Exemple : BAC 200 Charlie.' },
        { t: 'dialogue', text: '— BAC 200 Charlie : « TN 75 de BAC 200 Charlie. »\n— TN 75 : « Transmettez. »\n— BAC 200 Charlie : « TN 75 de BAC 200 Charlie, annonce la prise d’écoute et la prise de vacation de la BAC 200 Charlie, à son bord trois effectifs, deux masculins et un féminin, en 0 + 1 + 2, dans un véhicule banalisé, pour des missions de brigade anticriminalité ou de flagrance sur Paris et ses alentours. Comment est-ce reçu, parlez. »' },
        {
          t: 'retenir',
          items: [
            'On appelle d’abord le TN, on attend « Transmettez ».',
            'L’annonce donne : prise d’écoute et de vacation, indicatif, nombre d’effectifs, composition (ex. 0 + 1 + 2), mission et secteur.',
            'On termine par « Comment est-ce reçu, parlez ».'
          ]
        }
      ]
    },

    {
      id: 'indicatifs',
      num: '04',
      title: 'Indicatifs et appel',
      blocks: [
        { t: 'p', text: 'Formule d’appel : « TN 75 de [INDICATIF] »' },
        { t: 'p', text: 'Le centre répond : « Transmettez. » L’équipage délivre ensuite son message puis termine par une demande de réception lorsque cela est utile.' },
        { t: 'dialogue', text: '— [INDICATIF] : « TN 75 de [INDICATIF]. »\n— TN 75 : « Transmettez. »\n— [INDICATIF] : message, puis demande de réception si utile.' },
        {
          t: 'retenir',
          items: [
            'On nomme d’abord celui qu’on appelle, puis qui appelle : « TN 75 de [INDICATIF] ».',
            'On ne délivre le message qu’après « Transmettez ».'
          ]
        }
      ]
    },

    {
      id: 'structure',
      num: '05',
      title: 'Structure d’une transmission',
      blocks: [
        { t: 'etapes', steps: ['QUI', 'OÙ', 'SITUATION', 'BESOIN', 'MISE À JOUR'] },
        { t: 'p', text: 'Le message doit permettre de comprendre immédiatement qui parle, où se situe l’équipage, ce qu’il se passe et ce qui est demandé.' },
        {
          t: 'retenir',
          items: [
            'Qui → Où → Situation → Besoin → Mise à jour.',
            'Celui qui écoute doit tout comprendre dès la première écoute.'
          ]
        }
      ]
    },

    {
      id: 'raccourcis',
      num: '06',
      title: 'Raccourcis interventions',
      blocks: [
        { t: 'p', text: 'Ces raccourcis permettent de raccourcir les messages sur le réseau.' },
        {
          t: 'table',
          head: ['Raccourci', 'Signification'],
          rows: [
            ['IPM', 'Ivresse publique et manifeste'],
            ['AVP', 'Accident de la voie publique'],
            ['ILS', 'Individu à terre'],
            ['GAV', 'Garde à vue'],
            ['PV', 'Procès-verbal'],
            ['VL', 'Véhicule léger']
          ]
        }
      ]
    },

    {
      id: 'situations',
      num: '07',
      title: 'Situations spécifiques',
      blocks: [
        { t: 'p', text: 'Urgence / renfort. Donner en priorité la localisation, la nature de la difficulté et le besoin. Les détails viennent ensuite lorsque le réseau est disponible.' },
        {
          t: 'retenir',
          items: [
            'En urgence : localisation, nature de la difficulté, besoin.',
            'Les détails viennent ensuite, quand le réseau est disponible.'
          ]
        }
      ]
    },

    {
      id: 'exercices',
      num: '08',
      title: 'Exercices pratiques',
      blocks: [
        {
          t: 'exercice',
          id: 'ex-1',
          text: 'Exercice 1 — Prise d’écoute. Le formateur attribue un indicatif, une composition d’effectifs et un secteur. Le stagiaire doit effectuer l’appel au TN puis annoncer correctement sa prise de vacation.',
          hint: 'Appel « TN 75 de… », attendre « Transmettez », puis annonce complète jusqu’à « Comment est-ce reçu, parlez ».'
        },
        {
          t: 'exercice',
          id: 'ex-2',
          text: 'Exercice 2 — Transmission courte. À partir d’une situation donnée, le stagiaire sélectionne les informations réellement utiles et construit un message concis.',
          hint: 'Qui → Où → Situation → Besoin → Mise à jour.'
        }
      ]
    },

    {
      id: 'evaluation',
      num: '09',
      title: 'Évaluation finale /100',
      blocks: [
        { t: 'p', text: 'La formation se termine par une évaluation notée sur 100, en dix questions de 10 points. Elle ne porte sur rien d’autre que ce qui a été vu dans les chapitres précédents.' },
        { t: 'p', text: 'Le portail propose une note et dit sur quoi il s’appuie : éléments attendus retrouvés dans ta réponse, éléments manquants. Cette note est une suggestion. Le formateur garde la note retenue et peut s’en écarter dans les deux sens.' },
        {
          t: 'table',
          head: ['Ce qui est évalué', 'Ce qui est regardé'],
          rows: [
            ['Fondamentaux', 'Rôle de la radio, terminologie, points essentiels'],
            ['Discipline', 'Les règles de communication sur le réseau'],
            ['Prise de vacation', 'Appel au TN, composition des effectifs, annonce complète'],
            ['Transmission', 'Qui → Où → Situation → Besoin → Mise à jour'],
            ['Réflexes', 'Raccourcis, urgence / renfort, fiche réflexe dans l’ordre']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Dix questions, 100 points.',
            'Réponds par des phrases : une réponse en trois mots ne montre rien.',
            'La note du portail est une suggestion ; la décision est celle du formateur.'
          ]
        }
      ]
    },

    {
      id: 'reflexe',
      num: '10',
      title: 'Fiche réflexe radio',
      blocks: [
        { t: 'p', text: 'À retenir par cœur. C’est l’ordre dans lequel on pense une transmission, de l’écoute jusqu’au compte rendu.' },
        { t: 'etapes', steps: REFLEXE_RADIO.steps }
      ]
    }
  ],

  // Évaluation notée sur 100, avec éléments attendus pour la correction
  // assistée. L'examinateur garde la note retenue.
  evaluation: {
    max: 100,
    questions: [
      {
        id: 'ev-1',
        max: 10,
        q: 'À quoi sert la radio, et quels sont ses quatre principes d’utilisation ?',
        attendu: [
          'partager rapidement les informations',
          'coordination',
          'écouter avant de parler',
          'claires et précises',
          'concis',
          'discipline du réseau'
        ]
      },
      {
        id: 'ev-2',
        max: 10,
        q: 'Donne la signification de : TN, indicatif, écoute, vacation, « Transmettez », « Reçu ».',
        attendu: [
          'centre de commandement',
          'nom radio',
          'réception des communications',
          'période d’activité',
          'autorisation de parler',
          'bonne réception'
        ]
      },
      {
        id: 'ev-3',
        max: 10,
        q: 'Cite les règles de communication de la discipline du réseau.',
        attendu: [
          'ne pas couper',
          'préparer mentalement',
          'éviter les répétitions',
          'détails secondaires',
          'laisser le réseau disponible'
        ]
      },
      {
        id: 'ev-4',
        max: 10,
        q: 'Quelle est l’erreur à éviter sur le réseau, et que faut-il donner immédiatement à la place ?',
        attendu: [
          'monopoliser le réseau',
          'longue explication',
          'localisation',
          'situation',
          'besoin'
        ]
      },
      {
        id: 'ev-5',
        max: 10,
        q: 'Que signifie une composition « 0 + 1 + 2 » ?',
        attendu: [
          'aucun corps de direction',
          'un corps de commandement',
          'deux corps d’application',
          'direction',
          'commandement',
          'application'
        ]
      },
      {
        id: 'ev-6',
        max: 10,
        q: 'Rédige l’échange complet de prise d’écoute et de vacation pour la BAC 75 N Alpha.',
        attendu: [
          'TN 75 de BAC 75 N Alpha',
          'Transmettez',
          'prise d’écoute',
          'prise de vacation',
          'trois effectifs',
          '0 + 1 + 2',
          'brigade anticriminalité',
          'Comment est-ce reçu, parlez'
        ]
      },
      {
        id: 'ev-7',
        max: 10,
        q: 'Quelle est la formule d’appel, que répond le centre, et comment se termine le message ?',
        attendu: [
          'TN 75 de',
          'indicatif',
          'Transmettez',
          'délivre son message',
          'demande de réception'
        ]
      },
      {
        id: 'ev-8',
        max: 10,
        q: 'Donne la structure d’une transmission, dans l’ordre, et ce qu’elle doit permettre de comprendre.',
        attendu: [
          'qui',
          'où',
          'situation',
          'besoin',
          'mise à jour',
          'immédiatement'
        ]
      },
      {
        id: 'ev-9',
        max: 10,
        q: 'Donne la signification des raccourcis IPM, AVP, GAV, PV et VL, puis explique quoi transmettre en priorité en cas d’urgence ou de demande de renfort.',
        attendu: [
          'ivresse publique et manifeste',
          'accident de la voie publique',
          'garde à vue',
          'procès-verbal',
          'véhicule léger',
          'localisation',
          'nature de la difficulté',
          'détails ensuite'
        ]
      },
      {
        id: 'ev-10',
        max: 10,
        q: 'Cite les étapes de la fiche réflexe radio, dans l’ordre.',
        attendu: REFLEXE_RADIO.steps
      }
    ]
  }
};
