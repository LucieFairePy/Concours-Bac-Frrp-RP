// Formation Négociation BAC — dossiers de l'ancien parcours.
//
// La page de la formation suit désormais le module de l'archive V4
// (js/data/formations/negociation-cours.js) : vingt chapitres et une grille
// /100 à l'écran, rien d'enregistré. Ce fichier ne sert plus qu'à deux
// choses :
//   - la carte du catalogue des formations (titre, module, image) ;
//   - la fiche finale, en lecture seule, des dossiers créés avec l'ancien
//     parcours Identité → Cours → Évaluation → Correction → Fiche finale,
//     rouverts depuis l'historique (`?dossier=`).
//
// Les chapitres n'y gardent que ce que la fiche lit : identifiant, numéro,
// titre et exercices (les réponses des agents y sont rangées sous leur
// identifiant). Les deux questionnaires restent entiers : chaque dossier
// est relu avec le sien.

export const REFLEXE_NEGOCIATION = {
  title: 'FICHE RÉFLEXE NÉGOCIATION',
  steps: [
    'CONTACT',
    'ÉCOUTER',
    'COMPRENDRE',
    'REFORMULER',
    'IDENTIFIER',
    'INFORMER / TRANSMETTRE',
    'ADAPTER',
    'TEMPORISER',
    'RECHERCHER UNE ISSUE'
  ]
};

// Ancien questionnaire de l'évaluation (avant la grille en six axes).
// Les dossiers sans tampon evalVersion y restent attachés : leurs réponses
// et leurs notes sont rangées sous ces identifiants.
export const EVALUATION_NEGOCIATION_V1 = {
  max: 100,
  duration: 'environ 30 minutes',
  questions: [
    {
      id: 'ev-1',
      max: 10,
      q: 'Quel est l’objectif du négociateur, et qu’est-ce qui n’est pas son rôle ?',
      attendu: [
        'faire baisser la tension, éviter que quelqu’un soit blessé',
        'gagner du temps',
        'il ne décide pas de l’engagement : c’est le chef de groupe',
        'il informe en permanence son commandement'
      ]
    },
    {
      id: 'ev-2',
      max: 10,
      q: 'Cite les étapes de la fiche réflexe négociation, dans l’ordre.',
      attendu: REFLEXE_NEGOCIATION.steps
    },
    {
      id: 'ev-3',
      max: 10,
      q: 'Qu’est-ce que l’écoute active ? Donne trois procédés concrets.',
      attendu: [
        'montrer qu’on a entendu',
        'reformuler avec ses mots',
        'nommer l’émotion',
        'laisser le silence',
        'questions ouvertes',
        'résumer régulièrement'
      ]
    },
    {
      id: 'ev-4',
      max: 10,
      q: 'Écris ta prise de contact complète, en quatre répliques maximum.',
      attendu: [
        'donner son prénom',
        'dire pourquoi on parle',
        'annoncer ce qu’on ne fait pas',
        'demander le prénom',
        'poser une question ouverte'
      ]
    },
    {
      id: 'ev-5',
      max: 10,
      q: 'Comment transmets-tu une information incertaine à ton chef de groupe ?',
      attendu: [
        'séparer confirmé, supposé, à vérifier',
        'phrase courte et utilisable',
        'ne jamais garder une information pour soi',
        'citer les mots de la personne quand c’est utile'
      ]
    },
    {
      id: 'ev-6',
      max: 10,
      q: 'Donne l’ordre des priorités quand plusieurs choses sont urgentes.',
      attendu: [
        'vie des personnes retenues',
        'vie des intervenants',
        'vie de l’auteur',
        'maintien du dialogue',
        'interpellation',
        'matériel'
      ]
    },
    {
      id: 'ev-7',
      max: 10,
      q: '« Dans cinq minutes j’arrête tout. » Que fais-tu, et que ne fais-tu pas ?',
      attendu: [
        'ne pas contredire frontalement l’échéance',
        'ne pas l’accepter comme un contrat',
        'ramener sur un sujet concret important pour la personne',
        'prévenir le commandement de l’échéance annoncée'
      ]
    },
    {
      id: 'ev-8',
      max: 10,
      q: 'Cite quatre erreurs qui font échouer une négociation.',
      attendu: [
        'promettre ce qu’on ne peut pas tenir',
        'mentir sur un fait vérifiable',
        'donner des informations sur le dispositif',
        'parler plus que la personne',
        'hausser le ton',
        'ne pas transmettre',
        'changer d’interlocuteur sans l’annoncer'
      ]
    },
    {
      id: 'ev-9',
      max: 10,
      q: 'Quelles règles du serveur s’appliquent pendant une négociation ?',
      attendu: [
        'rester dans son rôle',
        'aucune information hors jeu utilisée en jeu',
        'respecter la peur de son personnage',
        'laisser le temps de jouer à la personne en face',
        'régler les désaccords après la scène'
      ]
    },
    {
      id: 'ev-10',
      max: 10,
      q: 'Mise en situation finale — appréciation d’ensemble de l’examinateur.',
      attendu: [
        'posture tenue sous pression',
        'écoute réelle et reformulations',
        'transmissions faites au bon moment',
        'aucune promesse intenable',
        'issue décrite pas à pas'
      ]
    }
  ]
};

export const NEGOCIATION = {
  id: 'negociation',
  module: 'negociation',
  title: 'Formation Négociation BAC',
  subtitle: 'Brigade Anti-Criminalité 75 N — France Roleplay',
  intro:
    'Cette formation apprend à parler avec quelqu’un qui va mal, qui menace ou '
    + 'qui retient une personne, sans que la situation empire. Elle ne demande '
    + 'aucune compétence technique : elle demande de l’écoute, de la patience et '
    + 'de la rigueur dans ce que tu transmets à ton commandement.',
  reflexe: REFLEXE_NEGOCIATION,
  image: 'cours-negociation',

  chapters: [
    { id: 'role', num: '01', title: 'Rôle et principes du négociateur', blocks: [
        { t: 'exercice', id: 'role-1', text: 'En trois phrases, explique à un joueur qui débute ce que fait un négociateur et ce qu’il ne fait pas.' }
      ] },
    { id: 'rappel', num: '02', title: 'Rappel fondamental — ce que la négociation n’est pas', blocks: [] },
    { id: 'cadre', num: '03', title: 'Cadre général et priorités', blocks: [
        { t: 'exercice', id: 'cadre-1', text: 'Un collègue vient de lancer un ultimatum à la personne retranchée. Écris ce que tu dis à la personne, puis ce que tu transmets au chef de groupe.' }
      ] },
    { id: 'posture', num: '04', title: 'Posture du négociateur', blocks: [
        { t: 'exercice', id: 'posture-1', text: 'La personne hurle et t’insulte. Écris tes deux premières répliques, sans jamais hausser le ton.' }
      ] },
    { id: 'crise', num: '05', title: 'Comprendre une personne en crise — émotions et tension', blocks: [] },
    { id: 'ecoute', num: '06', title: 'Écoute active, reformulation et résumés', blocks: [
        { t: 'exercice', id: 'ecoute-1', text: '« Vous allez tous me tomber dessus de toute façon. » Écris une reformulation et une question ouverte.' }
      ] },
    { id: 'questions', num: '07', title: 'Questions ouvertes et fermées', blocks: [
        { t: 'exercice', id: 'questions-1', text: 'Transforme ces trois questions fermées en questions ouvertes : « Tu es énervé ? », « Il s’est passé quelque chose ? », « Tu veux sortir ? »' }
      ] },
    { id: 'contact', num: '08', title: 'Prise de contact', blocks: [
        { t: 'exercice', id: 'contact-1', text: 'Écris ta prise de contact complète pour un joueur retranché avec une personne, en quatre répliques maximum.' }
      ] },
    { id: 'confiance', num: '09', title: 'Créer une relation de confiance', blocks: [
        { t: 'exercice', id: 'confiance-1', text: 'La personne te demande de lui garantir qu’elle pourra voir sa famille ce soir. Écris ta réponse sans mentir et sans fermer la porte.' }
      ] },
    { id: 'collecte', num: '10', title: 'Collecte et restitution de l’information', blocks: [
        { t: 'exercice', id: 'collecte-1', text: 'La personne t’a dit : « il y a le gérant avec moi, il saigne un peu ». Rédige ton compte rendu radio en séparant confirmé, supposé et à vérifier.' }
      ] },
    { id: 'equipe', num: '11', title: 'Travailler avec son équipe et son commandement', blocks: [] },
    { id: 'compte-rendu', num: '12', title: 'Compte rendu de négociation', blocks: [
        { t: 'exercice', id: 'cr-1', text: 'Reprends le compte rendu de l’exemple et réduis-le à quatre phrases, sans perdre les vulnérabilités ni la décision attendue.' }
      ] },
    { id: 'otages', num: '13', title: 'Personnes retenues et vulnérabilités', blocks: [
        { t: 'exercice', id: 'otages-1', text: 'L’auteur refuse que tu parles à la personne retenue. Propose deux autres façons de t’assurer qu’elle va bien.' }
      ] },
    { id: 'priorites', num: '14', title: 'Ordre des priorités RP et concessions', blocks: [] },
    { id: 'motivations', num: '15', title: 'Motivations et blocages', blocks: [
        { t: 'exercice', id: 'motivations-1', text: '« Je veux un avocat ici, maintenant, sinon je ne parle plus. » Distingue la demande, une motivation possible et un blocage possible.' }
      ] },
    { id: 'accord', num: '16', title: 'Revendications et recherche d’une issue', blocks: [
        { t: 'exercice', id: 'accord-1', text: '« Je sors seulement si je ne vois aucun policier. » Trouve le besoin derrière la demande, et propose une réponse tenable.' }
      ] },
    { id: 'temps', num: '17', title: 'Temps, pression et maîtrise émotionnelle', blocks: [
        { t: 'exercice', id: 'temps-1', text: '« Dans cinq minutes, j’arrête tout. » Écris ta réponse sans la contredire et sans accepter l’échéance.' }
      ] },
    { id: 'erreurs', num: '18', title: 'Erreurs fréquentes', blocks: [] },
    { id: 'regles', num: '19', title: 'Règles FRRP / GTRP à respecter', blocks: [] },
    { id: 'particulieres', num: '20', title: 'Situations particulières', blocks: [
        { t: 'exercice', id: 'part-1', text: 'Trois auteurs, et tu ne sais pas qui décide. Décris comment tu le découvres en parlant, sans le demander directement.' }
      ] },
    { id: 'exercices', num: '21', title: 'Exercices d’entraînement', blocks: [
        { t: 'exercice', id: 'ex-a', text: 'Exercice A — Ouvrir un premier contact. La personne a décroché mais ne dit rien. Écris tes trois premières répliques.' },
        { t: 'exercice', id: 'ex-b', text: 'Exercice B — Reformuler une revendication complexe : « Je veux que ma femme vienne, que les voitures partent de la rue, et qu’on me laisse parler à un journaliste, sinon rien. »' },
        { t: 'exercice', id: 'ex-c', text: 'Exercice C — Identifier une urgence médicale. Au détour d’une phrase, l’auteur dit : « la vieille dame, elle arrête pas de se tenir la poitrine ». Que demandes-tu, et que transmets-tu ?' },
        { t: 'exercice', id: 'ex-d', text: 'Exercice D — Restituer 60 secondes d’échange au commandement. Le formateur joue une minute d’échange : rédige ta restitution au format du compte rendu.' },
        { t: 'exercice', id: 'ex-e', text: 'Exercice E — Reprendre un dialogue après une montée de tension. La personne vient de hurler et de raccrocher après une question maladroite. Écris ta reprise.' },
        { t: 'exercice', id: 'ex-1', text: 'Prise de contact : la personne vient de raccrocher deux fois. Écris ta troisième approche.' },
        { t: 'exercice', id: 'ex-2', text: 'Reformulation : « vous êtes tous les mêmes, vous allez me descendre. » Reformule sans mentir et sans contredire.' },
        { t: 'exercice', id: 'ex-3', text: 'Transmission : la personne a dit qu’il y avait « peut-être trois personnes » avec elle. Rédige ton compte rendu.' },
        { t: 'exercice', id: 'ex-4', text: 'Concession : elle demande à manger. Que fais-tu, et qu’est-ce que tu demandes en échange ?' },
        { t: 'exercice', id: 'ex-5', text: 'Sortie : décris pas à pas la sortie que tu proposes, dans l’ordre, en six étapes maximum.' }
      ] },
    { id: 'finale', num: '22', title: 'Mise en situation finale', blocks: [] },
    { id: 'evaluation', num: '23', title: 'Évaluation finale /100', blocks: [] },
    { id: 'reflexe', num: '24', title: 'Fiche réflexe négociation', blocks: [] },
    { id: 'conclusion', num: '25', title: 'Conclusion', blocks: [] }
  ],

  // `version` est recopiée dans chaque dossier créé (record.evalVersion) :
  // un dossier sans ce tampon a été passé sur l'ancien questionnaire, qui
  // reste servi par `evaluationLegacy` (voir evaluationOf, js/core/formation.js).
  evaluation: {
    version: 2,
    max: 100,
    duration: 'environ 30 minutes d’écrit, puis la mise en situation finale',
    grid: [
      { axe: 'Théorie et connaissances', max: 20 },
      { axe: 'Communication et écoute', max: 20 },
      { axe: 'Analyse', max: 15 },
      { axe: 'Maîtrise émotionnelle', max: 10 },
      { axe: 'Collecte et restitution', max: 10 },
      { axe: 'Mise en situation finale', max: 25 }
    ],
    questions: [
      {
        id: 'ev2-theorie-1',
        axe: 'Théorie et connaissances',
        max: 7,
        q: 'Théorie — Quel est le rôle du négociateur, et qu’est-ce qui n’est pas son rôle ?',
        attendu: [
          'créer et maintenir un canal de communication',
          'réduire la tension',
          'recueillir des informations fiables',
          'il ne décide pas : le commandement décide',
          'ne jamais promettre ce qui n’a pas été validé'
        ]
      },
      {
        id: 'ev2-theorie-2',
        axe: 'Théorie et connaissances',
        max: 7,
        q: 'Théorie — Quelles sont les priorités du cadre général d’une négociation ? Cite les quatre temps dans l’ordre.',
        attendu: [
          'priorité aux vies humaines',
          'stabiliser',
          'comprendre',
          'informer',
          'adapter',
          'éviter les provocations et ultimatums',
          'signaler toute urgence médicale'
        ]
      },
      {
        id: 'ev2-theorie-3',
        axe: 'Théorie et connaissances',
        max: 6,
        q: 'Théorie — Cite les étapes de la fiche réflexe négociation, dans l’ordre.',
        attendu: REFLEXE_NEGOCIATION.steps
      },
      {
        id: 'ev2-communication-1',
        axe: 'Communication et écoute',
        max: 10,
        q: 'Communication — Qu’est-ce que l’écoute active ? Donne ses procédés et un exemple de reformulation.',
        attendu: [
          'questions ouvertes',
          'encouragements courts',
          'reformuler sans déformer',
          'résumer régulièrement',
          'laisser le silence',
          'nommer l’émotion avec prudence'
        ]
      },
      {
        id: 'ev2-communication-2',
        axe: 'Communication et écoute',
        max: 10,
        q: 'Communication — Écris ta prise de contact, puis explique quand tu poses une question ouverte et quand une question fermée.',
        attendu: [
          'se présenter simplement',
          'vérifier que l’interlocuteur entend',
          'question ouverte pour comprendre',
          'question fermée pour confirmer',
          'commencer large puis préciser',
          'éviter les séries de questions fermées'
        ]
      },
      {
        id: 'ev2-analyse-1',
        axe: 'Analyse',
        max: 8,
        q: 'Analyse — « Je veux une voiture, sinon personne ne sort. » Distingue la demande, la motivation possible et le blocage, puis explique comment tu traites cette revendication.',
        attendu: [
          'la demande n’est pas la motivation',
          'chercher ce qui est réellement important',
          'repérer ce qui fait monter la tension',
          'reformuler la demande',
          'transmettre sans modifier',
          'attendre la validation',
          'ne pas créer de faux accord'
        ]
      },
      {
        id: 'ev2-analyse-2',
        axe: 'Analyse',
        max: 7,
        q: 'Analyse — Quelles vulnérabilités recherches-tu chez les personnes retenues, et que fais-tu d’une urgence médicale ?',
        attendu: [
          'blessure ou besoin médical',
          'enfant, personne âgée ou grossesse',
          'traitement médical indispensable',
          'état de panique',
          'confirmer par une question fermée',
          'transmettre l’urgence médicale sans attendre'
        ]
      },
      {
        id: 'ev2-maitrise-1',
        axe: 'Maîtrise émotionnelle',
        max: 10,
        q: 'Maîtrise émotionnelle — La personne t’insulte, te coupe la parole puis annonce : « dans cinq minutes j’arrête tout ». Comment gardes-tu la maîtrise de l’échange ?',
        attendu: [
          'voix posée, débit lent',
          'ne pas répondre à la provocation',
          'reconnaître l’émotion sans valider l’acte',
          'ne pas contredire ni accepter l’échéance',
          'ramener sur un sujet concret',
          'prévenir le commandement'
        ]
      },
      {
        id: 'ev2-collecte-1',
        axe: 'Collecte et restitution',
        max: 10,
        q: 'Collecte et restitution — Donne le format d’un compte rendu de négociation, puis rédige-en un exemple.',
        attendu: [
          'état du dialogue',
          'demandes formulées',
          'personnes et vulnérabilités',
          'éléments confirmés et à vérifier',
          'évolution émotionnelle',
          'décision attendue'
        ]
      },
      {
        id: 'ev2-situation-1',
        axe: 'Mise en situation finale',
        max: 25,
        q: 'Mise en situation finale — observations de l’examinateur sur l’échange complet (méthode, stabilité, coordination).',
        attendu: [
          'prise de contact',
          'écoute active',
          'questions adaptées',
          'reformulation',
          'identification des émotions et motivations',
          'collecte structurée',
          'restitution au commandement',
          'gestion de l’urgence médicale',
          'aucune promesse non validée',
          'conclusion et débrief'
        ]
      }
    ]
  },

  // Ancien questionnaire (dix questions à 10 points), conservé pour relire
  // et rectifier les dossiers créés avant la grille ci-dessus.
  evaluationLegacy: EVALUATION_NEGOCIATION_V1
};
