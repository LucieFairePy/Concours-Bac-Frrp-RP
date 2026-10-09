// Formation Négociation BAC — contenu du module de l'archive V4
// (modules/formation-negociation.html), repris mot pour mot.
//
// Vingt chapitres, chacun en quatre parties : sous-titre de la photo,
// « Comprendre », « Points essentiels » et l'encadré « À retenir ». Cinq
// chapitres ajoutent un encadré d'exemple ; le dernier porte la grille
// d'évaluation /100. La photo de chaque chapitre est une place de la
// banque d'images (js/data/images.js) : nego1 → negociation,
// nego2 → cours-negociation, operator → cdg, plain → concours,
// night → sidebar-citation, bacgroup → formation-cdg.

/** Les quatre accès rapides au-dessus du sommaire : libellé → chapitre (index). */
export const QUICK = [
  { label: 'Fondamentaux', index: 0 },
  { label: 'Écoute active', index: 4 },
  { label: 'Coordination', index: 14 },
  { label: 'Mise en situation', index: 18 }
];

/** Les deux encadrés fixes de la colonne « À retenir ». */
export const METHODE = 'CONTACT → ÉCOUTER → COMPRENDRE → REFORMULER → IDENTIFIER → TRANSMETTRE → ADAPTER → TEMPORISER → RECHERCHER UNE ISSUE.';
export const REFLEXE = 'Rester calme · distinguer fait et hypothèse · ne pas promettre sans validation · informer le commandement.';

/** Encadrés d'exemple sous les points essentiels, par numéro de chapitre. */
export const EXAMPLES = {
  '04': {
    title: 'EXEMPLE DE PRISE DE CONTACT',
    lines: ['« Police. Je suis là pour parler avec vous et comprendre ce qui se passe. Est-ce que vous m’entendez correctement ? »']
  },
  '05': {
    title: 'EXEMPLE D’ÉCOUTE ACTIVE',
    lines: [
      'Interlocuteur : « Personne ne m’écoute. »',
      'Négociateur : « Vous avez le sentiment que personne ne vous a entendu jusqu’ici. Expliquez-moi ce qui vous a amené à cette situation. »'
    ]
  },
  '13': {
    title: 'TRAITEMENT D’UNE REVENDICATION',
    lines: ['1. Laisser formuler → 2. préciser → 3. reformuler → 4. transmettre → 5. attendre validation → 6. répondre sans inventer.']
  },
  '16': {
    title: 'FORMAT DE RESTITUTION',
    lines: ['État du dialogue → demandes → personnes/vulnérabilités → éléments confirmés → évolution → décision attendue.']
  },
  '18': {
    title: 'EXERCICE INTERACTIF',
    lines: ['Un interlocuteur très énervé coupe la parole et répète la même demande. Votre priorité : ralentir votre propre débit, écouter la demande entière, reformuler puis rechercher ce qui alimente la tension.']
  }
};

/** Grille d'évaluation du chapitre 20 : six champs notés, rien d'enregistré. */
export const GRID_CHAPTER = '20';
export const GRID = [
  { label: 'Théorie', max: 20 },
  { label: 'Communication', max: 20 },
  { label: 'Analyse', max: 15 },
  { label: 'Maîtrise', max: 10 },
  { label: 'Collecte', max: 10 },
  { label: 'Mise en situation', max: 25 }
];

/** Les chapitres, dans l'ordre et le texte de l'archive. */
export const CHAPTERS = [
  {
    n: '01',
    title: 'Rôle et objectifs du négociateur',
    sub: 'Comprendre la fonction',
    desc: 'La négociation vise à créer et maintenir un canal de communication exploitable. Le négociateur cherche à comprendre la situation, réduire la tension, recueillir des informations fiables et aider le commandement à rechercher une issue maîtrisée.',
    points: [
      'Écouter avant de convaincre.',
      'Maintenir le dialogue aussi longtemps qu’il reste utile.',
      'Distinguer ce qui est confirmé de ce qui est supposé.',
      'Transmettre au commandement les changements importants.',
      'Ne jamais promettre ce qui n’a pas été validé.'
    ],
    remember: 'Le négociateur n’est pas là pour gagner un débat : il crée les conditions d’une décision plus sûre.',
    image: 'negociation'
  },
  {
    n: '02',
    title: 'Cadre général et priorités',
    sub: 'Préserver les personnes et stabiliser',
    desc: 'Une négociation commence par une priorité simple : préserver les personnes et empêcher une aggravation évitable. La communication sert à ralentir le rythme de la crise, obtenir une meilleure compréhension et garder une possibilité de sortie.',
    points: [
      'Priorité aux vies humaines.',
      'Stabiliser avant de chercher une solution complète.',
      'Éviter les provocations et ultimatums improvisés.',
      'Signaler immédiatement toute urgence médicale.',
      'Rester cohérent avec les décisions du commandement.'
    ],
    remember: 'STABILISER → COMPRENDRE → INFORMER → ADAPTER.',
    image: 'cours-negociation'
  },
  {
    n: '03',
    title: 'Posture du négociateur',
    sub: 'Calme, crédibilité et constance',
    desc: 'La posture compte autant que les mots. Une voix posée, un débit maîtrisé et des réponses cohérentes renforcent la crédibilité. La fermeté peut exister sans agressivité.',
    points: [
      'Parler distinctement et sans précipitation.',
      'Accepter les silences.',
      'Ne pas répondre à une provocation par une provocation.',
      'Reconnaître une émotion sans valider un acte.',
      'Rester honnête sur ce qui peut ou non être décidé.'
    ],
    remember: 'Une posture stable évite que le négociateur ajoute lui-même de la tension.',
    image: 'cdg'
  },
  {
    n: '04',
    title: 'Prise de contact',
    sub: 'Ouvrir le dialogue correctement',
    desc: 'Le premier échange doit être simple. Il faut vérifier que la communication fonctionne, se présenter par sa fonction, laisser l’interlocuteur parler et commencer à identifier son besoin immédiat.',
    points: [
      'Se présenter simplement.',
      'Vérifier que l’interlocuteur entend correctement.',
      'Poser une première question ouverte.',
      'Laisser une réponse complète.',
      'Éviter d’enchaîner trop de questions.'
    ],
    remember: 'Exemple : « Police. Je suis là pour parler avec vous et comprendre ce qui se passe. Est-ce que vous m’entendez correctement ? »',
    image: 'negociation'
  },
  {
    n: '05',
    title: 'Écoute active',
    sub: 'Faire parler sans transformer l’échange en interrogatoire',
    desc: 'L’écoute active consiste à montrer que l’on suit réellement l’échange tout en obtenant progressivement des informations. Elle utilise les questions ouvertes, les encouragements courts, la reformulation, les résumés et le silence.',
    points: [
      'Questions ouvertes : « Qu’est-ce qui s’est passé ? »',
      'Encouragements : « D’accord », « je vous écoute ».',
      'Reformuler sans déformer.',
      'Résumer régulièrement.',
      'Laisser quelques secondes de silence lorsque c’est utile.'
    ],
    remember: 'ÉCOUTER → REFORMULER → VÉRIFIER.',
    image: 'cours-negociation'
  },
  {
    n: '06',
    title: 'Questions ouvertes et fermées',
    sub: 'Choisir la bonne question au bon moment',
    desc: 'Une question ouverte favorise le récit et permet de comprendre. Une question fermée sert ensuite à confirmer un élément précis. Les deux sont utiles, mais pas au même moment.',
    points: [
      'Ouverte : « Qu’est-ce qui vous inquiète le plus ? »',
      'Ouverte : « Comment en êtes-vous arrivé là ? »',
      'Fermée : « Y a-t-il une personne blessée ? »',
      'Fermée : « Êtes-vous seul ? »',
      'Éviter les séries rapides de questions fermées.'
    ],
    remember: 'Commencer large, puis préciser.',
    image: 'concours'
  },
  {
    n: '07',
    title: 'Reformulation et résumés',
    sub: 'Prouver que l’on comprend',
    desc: 'Reformuler permet de vérifier que le message a été compris et peut réduire les malentendus. Un résumé rassemble plusieurs informations avant de poursuivre.',
    points: [
      '« Si je comprends bien… »',
      '« Ce que vous me dites, c’est que… »',
      'Corriger immédiatement une mauvaise compréhension.',
      'Ne pas ajouter une intention que la personne n’a pas exprimée.',
      'Faire des résumés courts.'
    ],
    remember: 'Une bonne reformulation doit pouvoir être corrigée par l’interlocuteur.',
    image: 'cdg'
  },
  {
    n: '08',
    title: 'Émotions et tension',
    sub: 'Identifier sans juger',
    desc: 'Colère, peur, panique, frustration ou sentiment d’injustice peuvent modifier la manière de communiquer. Le négociateur cherche à identifier l’émotion dominante et ce qui l’alimente.',
    points: [
      'Nommer avec prudence : « J’entends que vous êtes très en colère. »',
      'Ne pas dire à quelqu’un de « se calmer » comme unique réponse.',
      'Chercher ce qui déclenche la tension.',
      'Observer les changements de ton.',
      'Signaler une dégradation importante.'
    ],
    remember: 'Reconnaître une émotion ne signifie pas approuver le comportement.',
    image: 'negociation'
  },
  {
    n: '09',
    title: 'Motivations et blocages',
    sub: 'Comprendre ce qui empêche d’avancer',
    desc: 'Une demande exprimée n’est pas toujours le véritable besoin. Il faut distinguer revendication, motivation, peur, contrainte et blocage afin de comprendre ce qui peut faire évoluer l’échange.',
    points: [
      'Identifier la demande explicite.',
      'Chercher ce qui est réellement important pour la personne.',
      'Repérer les sujets qui augmentent brutalement la tension.',
      'Identifier les éléments qui permettent de maintenir le dialogue.',
      'Ne pas présenter une hypothèse comme un fait.'
    ],
    remember: 'DEMANDE ≠ MOTIVATION.',
    image: 'cours-negociation'
  },
  {
    n: '10',
    title: 'Créer une relation de confiance',
    sub: 'Construire progressivement',
    desc: 'La confiance ne vient pas d’une promesse spectaculaire mais de petites preuves de cohérence : écouter, ne pas mentir, respecter ce qui a été annoncé et expliquer lorsqu’une demande ne peut pas être validée immédiatement.',
    points: [
      'Être cohérent d’un échange à l’autre.',
      'Ne pas inventer une autorisation.',
      'Dire lorsqu’une vérification est nécessaire.',
      'Tenir les engagements réellement validés.',
      'Éviter les changements brusques de ton.'
    ],
    remember: 'La crédibilité se construit phrase après phrase.',
    image: 'concours'
  },
  {
    n: '11',
    title: 'Collecte des informations',
    sub: 'Trier ce qui compte réellement',
    desc: 'Le négociateur doit conserver une image claire de la situation tout en restant concentré sur l’échange. Les informations sont classées en faits confirmés, éléments à vérifier et évolutions nouvelles.',
    points: [
      'Nombre de personnes impliquées.',
      'Présence et état apparent des personnes retenues.',
      'Urgences médicales.',
      'Revendications exactes.',
      'Éléments de contexte.',
      'Changements de comportement ou de situation.'
    ],
    remember: 'CONFIRMÉ / À VÉRIFIER / NOUVEAU.',
    image: 'cdg'
  },
  {
    n: '12',
    title: 'Personnes retenues et vulnérabilités',
    sub: 'Identifier les priorités humaines',
    desc: 'Lorsqu’une personne retenue peut être entendue ou lorsqu’une information fiable est obtenue, le négociateur cherche à connaître son état et les vulnérabilités particulières qui doivent être remontées.',
    points: [
      'Blessure ou besoin médical.',
      'Enfant, personne âgée ou grossesse.',
      'Traitement médical indispensable.',
      'État de panique important.',
      'Identité lorsque cela est possible et utile.'
    ],
    remember: 'Toute urgence médicale doit être transmise sans attendre.',
    image: 'negociation'
  },
  {
    n: '13',
    title: 'Revendications',
    sub: 'Comprendre, reformuler, transmettre',
    desc: 'Une revendication n’est jamais automatiquement acceptée. Elle doit être comprise précisément, reformulée pour éviter toute ambiguïté, transmise au commandement puis faire l’objet d’une réponse claire.',
    points: [
      'Écouter la demande entière.',
      'Vérifier les détails utiles.',
      'Reformuler.',
      'Transmettre sans modifier.',
      'Attendre la décision lorsqu’une validation est nécessaire.',
      'Ne pas créer de faux accord.'
    ],
    remember: 'COMPRENDRE → REFORMULER → TRANSMETTRE → ATTENDRE → RÉPONDRE.',
    image: 'cours-negociation'
  },
  {
    n: '14',
    title: 'Temps et temporalisation',
    sub: 'Utiliser le temps sans abandonner le dialogue',
    desc: 'Dans de nombreuses crises, ralentir le rythme peut permettre de réduire l’impulsivité, obtenir davantage d’informations et créer une relation plus stable. Temporaliser ne signifie pas ignorer une urgence.',
    points: [
      'Ne pas se précipiter vers un accord mal compris.',
      'Faire des pauses utiles.',
      'Revenir sur les points importants.',
      'Laisser l’interlocuteur développer.',
      'Accélérer immédiatement la remontée d’une urgence réelle.'
    ],
    remember: 'Le temps est un outil de communication, pas une excuse pour l’inaction.',
    image: 'sidebar-citation'
  },
  {
    n: '15',
    title: 'Coordination avec le commandement',
    sub: 'Le négociateur ne travaille jamais seul',
    desc: 'Le négociateur conserve le dialogue pendant que le commandement maintient la vision globale. Des points réguliers permettent d’éviter qu’une information importante reste isolée.',
    points: [
      'Annoncer la prise en charge de la négociation.',
      'Faire des restitutions courtes et structurées.',
      'Demander validation pour ce qui l’exige.',
      'Signaler immédiatement une rupture ou une dégradation.',
      'Conserver une séparation claire entre dialogue et décision de commandement.'
    ],
    remember: 'DIALOGUE ↔ RESTITUTION ↔ DÉCISION.',
    image: 'formation-cdg'
  },
  {
    n: '16',
    title: 'Compte rendu de négociation',
    sub: 'Transmettre sans perdre l’essentiel',
    desc: 'Un bon compte rendu permet à une autre personne de comprendre rapidement l’état de la négociation. Il doit être factuel, court et organisé.',
    points: [
      'État actuel du dialogue.',
      'Demandes formulées.',
      'Personnes et vulnérabilités connues.',
      'Éléments confirmés / à vérifier.',
      'Évolution émotionnelle.',
      'Décision ou validation attendue.'
    ],
    remember: 'Situation → demandes → personnes → évolution → besoin de décision.',
    image: 'cdg'
  },
  {
    n: '17',
    title: 'Erreurs fréquentes',
    sub: 'Ce qui dégrade inutilement une négociation',
    desc: 'La majorité des erreurs pédagogiques viennent d’une communication trop rapide, d’une promesse non validée ou d’une mauvaise restitution au commandement.',
    points: [
      'Couper constamment la parole.',
      'Multiplier les questions.',
      'Vouloir avoir raison.',
      'Faire une promesse impossible.',
      'Menacer inutilement.',
      'Employer trop de jargon.',
      'Oublier de transmettre une évolution importante.'
    ],
    remember: 'Simple, calme, factuel, coordonné.',
    image: 'negociation'
  },
  {
    n: '18',
    title: 'Exercices pratiques',
    sub: 'Appliquer la méthode',
    desc: 'Les exercices sont courts et progressifs. Le formateur évalue la méthode et la capacité d’adaptation plutôt qu’une phrase parfaite apprise par cœur.',
    points: [
      'Exercice A : ouvrir un premier contact.',
      'Exercice B : reformuler une revendication complexe.',
      'Exercice C : identifier une urgence médicale.',
      'Exercice D : restituer 60 secondes d’échange au commandement.',
      'Exercice E : reprendre un dialogue après une montée de tension.'
    ],
    remember: 'Chaque exercice se termine par un débrief : ce qui a aidé, ce qui a bloqué, ce qui devait être transmis.',
    image: 'cours-negociation'
  },
  {
    n: '19',
    title: 'Mise en situation finale',
    sub: 'Conduire un échange complet',
    desc: 'Un individu accepte de communiquer alors que plusieurs personnes sont retenues. Les informations initiales sont incomplètes, son état émotionnel varie et plusieurs demandes apparaissent. Une information médicale urgente survient pendant l’échange.',
    points: [
      'Prise de contact.',
      'Écoute active.',
      'Questions adaptées.',
      'Reformulation.',
      'Identification des émotions et motivations.',
      'Collecte structurée.',
      'Restitution au commandement.',
      'Gestion d’une urgence.',
      'Aucune promesse non validée.',
      'Conclusion et débrief.'
    ],
    remember: 'Le candidat est évalué sur sa méthode, sa stabilité et sa coordination.',
    image: 'negociation'
  },
  {
    n: '20',
    title: 'Évaluation /100 et fiche réflexe',
    sub: 'Valider les acquis',
    desc: 'L’évaluation reprend l’ensemble de la formation et se termine par une fiche réflexe utilisable comme rappel rapide.',
    points: [
      'Théorie et connaissances /20.',
      'Communication et écoute /20.',
      'Analyse /15.',
      'Maîtrise émotionnelle /10.',
      'Collecte et restitution /10.',
      'Mise en situation finale /25.'
    ],
    remember: 'CONTACT → ÉCOUTER → COMPRENDRE → REFORMULER → IDENTIFIER → TRANSMETTRE → ADAPTER → TEMPORISER → RECHERCHER UNE ISSUE.',
    image: 'cdg'
  }
];
