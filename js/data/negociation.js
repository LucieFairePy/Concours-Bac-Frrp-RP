// Formation Négociation BAC — cahier des charges §6.
//
// Règle de rédaction imposée par le cahier des charges : complet sur le
// fond, simple dans la formulation. Chaque notion suit le même chemin —
// explication simple → exemple RP → point à retenir → exercice éventuel.
//
// Tout reste au niveau organisation, communication, commandement et jeu de
// rôle. Rien ici n'est un manuel d'intervention réel : c'est une formation
// de serveur de jeu, et les contenus sont écrits pour être joués.
//
// Types de blocs reconnus par la vue de cours (js/views/cours.js) :
//   p        paragraphe
//   liste    liste à puces
//   rp       exemple de jeu de rôle
//   dialogue échange type, une réplique par ligne
//   retenir  encadré « À RETENIR »
//   erreurs  encadré « ERREURS À ÉVITER »
//   etapes   enchaînement de la fiche réflexe
//   table    tableau simple
//   exercice question d'entraînement, avec champ de réponse

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
    {
      id: 'role',
      num: '01',
      title: 'Rôle et principes du négociateur',
      blocks: [
        { t: 'p', text: 'Le négociateur a un seul objectif : faire baisser la tension pour que personne ne soit blessé. Il ne cherche pas à gagner une discussion, ni à piéger la personne en face. Il cherche à gagner du temps et de la compréhension.' },
        { t: 'p', text: 'Concrètement, la négociation vise à créer et maintenir un canal de communication exploitable. Le négociateur cherche à comprendre la situation, réduire la tension, recueillir des informations fiables et aider le commandement à rechercher une issue maîtrisée.' },
        { t: 'p', text: 'Pendant ce temps, le reste du dispositif travaille : le périmètre est tenu, le chef de groupe organise, les équipages se placent. Le négociateur est donc un rouage parmi d’autres, pas un héros isolé.' },
        {
          t: 'liste',
          items: [
            'Il écoute avant de convaincre.',
            'Il maintient le dialogue aussi longtemps qu’il reste utile.',
            'Il parle — il ne décide pas de l’engagement.',
            'Il distingue ce qui est confirmé de ce qui est supposé.',
            'Il informe son commandement en permanence, et transmet les changements importants.',
            'Il ne promet jamais ce qui n’a pas été validé.',
            'Il reste le même interlocuteur du début à la fin si c’est possible.'
          ]
        },
        { t: 'rp', text: 'Un joueur retient une personne dans une supérette après un vol qui a mal tourné. Tu es désigné négociateur. Ton travail ne commence pas par « rends-toi » : il commence par « je suis là, je t’écoute, qu’est-ce qui se passe ? ».' },
        {
          t: 'retenir',
          items: [
            'Le but n’est pas de convaincre, c’est de calmer.',
            'Le négociateur n’est pas là pour gagner un débat : il crée les conditions d’une décision plus sûre.',
            'Le négociateur parle, le chef de groupe décide.',
            'Une promesse non tenue coûte toute la confiance obtenue.'
          ]
        },
        {
          t: 'exercice',
          id: 'role-1',
          text: 'En trois phrases, explique à un joueur qui débute ce que fait un négociateur et ce qu’il ne fait pas.',
          hint: 'Pense : calmer, informer, ne pas décider.'
        }
      ]
    },

    {
      id: 'rappel',
      num: '02',
      title: 'Rappel fondamental — ce que la négociation n’est pas',
      blocks: [
        { t: 'p', text: 'Beaucoup de joueurs confondent négociation et marchandage. Ce n’est pas la même chose. Négocier, ici, c’est maintenir le dialogue assez longtemps pour que la personne redescende et que la situation se dénoue sans violence.' },
        {
          t: 'table',
          head: ['Ce n’est pas…', 'C’est…'],
          rows: [
            ['Céder à tout pour que ça s’arrête', 'Tenir le fil du dialogue sans rien lâcher d’important'],
            ['Mentir pour gagner du temps', 'Dire ce qui est vrai, et se taire sur le reste'],
            ['Donner des ordres', 'Proposer, reformuler, accompagner'],
            ['Faire la conversation', 'Recueillir des informations utiles au dispositif'],
            ['Un duel à gagner', 'Un temps à faire passer sans drame']
          ]
        },
        { t: 'p', text: 'Autre confusion fréquente : croire que le négociateur est seul maître du rythme. En réalité, si le commandement décide d’agir, la négociation s’arrête. Le négociateur l’accepte et continue à parler jusqu’au dernier moment si on lui demande.' },
        {
          t: 'erreurs',
          items: [
            'Promettre une sortie sans poursuites : tu n’en as pas le pouvoir.',
            'Annoncer l’arrivée de renforts ou la position des équipages.',
            'Couper la communication pour « faire pression ».',
            'Jouer au plus fort avec la personne en crise.'
          ]
        }
      ]
    },

    {
      id: 'cadre',
      num: '03',
      title: 'Cadre général et priorités',
      blocks: [
        { t: 'p', text: 'Une négociation commence par une priorité simple : préserver les personnes et empêcher une aggravation évitable. La communication sert à ralentir le rythme de la crise, obtenir une meilleure compréhension et garder une possibilité de sortie.' },
        { t: 'etapes', steps: ['STABILISER', 'COMPRENDRE', 'INFORMER', 'ADAPTER'] },
        {
          t: 'table',
          head: ['Temps', 'Ce que tu fais'],
          rows: [
            ['STABILISER', 'Tu ralentis le rythme et tu empêches l’aggravation, avant de chercher une solution complète'],
            ['COMPRENDRE', 'Tu écoutes ce qui se passe et ce qui compte pour la personne'],
            ['INFORMER', 'Tu remontes au commandement ce qui change, en séparant confirmé et supposé'],
            ['ADAPTER', 'Tu ajustes ton rythme et ton angle à l’évolution et aux décisions du commandement']
          ]
        },
        {
          t: 'liste',
          items: [
            'Priorité aux vies humaines.',
            'Stabiliser avant de chercher une solution complète.',
            'Éviter les provocations et ultimatums improvisés.',
            'Signaler immédiatement toute urgence médicale.',
            'Rester cohérent avec les décisions du commandement.'
          ]
        },
        { t: 'rp', text: 'Rien n’est encore décidé par le chef de groupe. Un collègue lance à la personne retranchée : « tu as deux minutes pour sortir ». C’est un ultimatum improvisé : il n’est pas validé, il fait monter la tension et il engage tout le dispositif. Le négociateur reprend calmement : « Personne ne vous demande de vous décider maintenant. Je suis là pour comprendre ce qui se passe. » Puis il signale l’incident au chef de groupe.' },
        {
          t: 'erreurs',
          items: [
            'Poser un ultimatum improvisé : « vous avez cinq minutes ».',
            'Provoquer la personne pour « la faire réagir ».',
            'Chercher à tout régler avant d’avoir stabilisé.',
            'Garder pour soi une urgence médicale, même pour la confirmer plus tard.',
            'Dire à la personne autre chose que ce que le commandement a décidé.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'STABILISER → COMPRENDRE → INFORMER → ADAPTER.',
            'Priorité aux vies humaines.',
            'Pas d’ultimatum improvisé : il n’apaise rien et il engage tout le monde.'
          ]
        },
        {
          t: 'exercice',
          id: 'cadre-1',
          text: 'Un collègue vient de lancer un ultimatum à la personne retranchée. Écris ce que tu dis à la personne, puis ce que tu transmets au chef de groupe.',
          hint: 'Stabiliser d’abord, sans désavouer le collègue devant elle ; informer ensuite.'
        }
      ]
    },

    {
      id: 'posture',
      num: '04',
      title: 'Posture du négociateur',
      blocks: [
        { t: 'p', text: 'La posture, c’est la manière d’être : ton de voix, rythme, vocabulaire, patience. Elle compte souvent plus que le contenu des phrases. Une personne très tendue retient d’abord comment tu lui parles. Une voix posée, un débit maîtrisé et des réponses cohérentes renforcent la crédibilité ; la fermeté peut exister sans agressivité.' },
        {
          t: 'liste',
          items: [
            'Voix basse et lente. Si la personne crie, tu ne cries pas plus fort.',
            'Phrases courtes. Une idée par phrase.',
            'Tu acceptes les silences : ils ne sont pas un échec.',
            'Tu ne réponds pas à une provocation par une provocation.',
            'Tu reconnais une émotion sans valider un acte.',
            'Vouvoiement ou tutoiement : prends celui qui apaise, et garde-le.',
            'Tu donnes ton prénom et tu demandes le sien. On ne négocie pas avec « l’individu ».',
            'Tu restes honnête sur ce qui peut ou non être décidé, et tu ne t’engages jamais sur ce qui dépend d’un autre.'
          ]
        },
        { t: 'dialogue', text: '— Reculez ou je fais une bêtise !\n— D’accord, je recule. Je m’appelle Cyril. Et toi ?\n— … Mehdi.\n— Mehdi, je reste là, je t’écoute. Dis-moi ce qui se passe.' },
        { t: 'p', text: 'Dans cet échange, trois choses ont été obtenues en quatre répliques : un geste accordé qui ne coûte rien, un prénom, et une question ouverte. C’est exactement le rythme attendu.' },
        {
          t: 'retenir',
          items: [
            'Ton calme est ton premier outil.',
            'Une posture stable évite que le négociateur ajoute lui-même de la tension.',
            'Céder un geste sans importance coûte peu et rapporte beaucoup.',
            'Un prénom vaut mieux que dix arguments.'
          ]
        },
        {
          t: 'exercice',
          id: 'posture-1',
          text: 'La personne hurle et t’insulte. Écris tes deux premières répliques, sans jamais hausser le ton.',
          hint: 'Accorde un geste, donne ton prénom, pose une question ouverte.'
        }
      ]
    },

    {
      id: 'crise',
      num: '05',
      title: 'Comprendre une personne en crise — émotions et tension',
      blocks: [
        { t: 'p', text: 'Une personne en crise ne raisonne pas comme d’habitude. Elle est envahie par une émotion — peur, colère, honte, désespoir — et cette émotion occupe toute la place. Lui expliquer qu’elle a tort ne sert à rien : elle ne peut pas l’entendre tant que l’émotion est au maximum.' },
        {
          t: 'table',
          head: ['Ce que tu observes', 'Ce que ça veut souvent dire', 'Ce que tu fais'],
          rows: [
            ['Elle crie, répète la même phrase', 'Elle veut être entendue', 'Tu reformules ce qu’elle dit'],
            ['Elle se tait brutalement', 'Elle réfléchit, ou elle décroche', 'Tu poses une question simple, tu ne forces pas'],
            ['Elle parle d’elle au passé', 'Elle peut être en grand désespoir', 'Tu la ramènes au présent et au concret'],
            ['Elle pose des conditions précises', 'Elle cherche une sortie', 'Tu notes, tu transmets, tu ne promets pas'],
            ['Elle s’excuse', 'La tension redescend', 'Tu avances doucement vers une issue']
          ]
        },
        { t: 'p', text: 'Colère, peur, panique, frustration ou sentiment d’injustice modifient la manière de communiquer. Ton travail est d’identifier l’émotion dominante et ce qui l’alimente — sans juger.' },
        {
          t: 'liste',
          items: [
            'Nommer avec prudence : « J’entends que vous êtes très en colère. »',
            'Ne pas dire à quelqu’un de « se calmer » comme unique réponse.',
            'Chercher ce qui déclenche la tension.',
            'Observer les changements de ton.',
            'Signaler une dégradation importante au commandement.'
          ]
        },
        { t: 'rp', text: 'Un joueur s’est enfermé après une dispute. Il répète « de toute façon tout le monde s’en fout ». Si tu réponds « mais non », tu le contredis. Si tu réponds « tu te sens lâché, c’est ça ? », tu montres que tu as entendu. La deuxième porte ouvre, la première ferme.' },
        {
          t: 'retenir',
          items: [
            'Une émotion ne se discute pas, elle se reconnaît.',
            'Reconnaître une émotion ne signifie pas approuver le comportement.',
            'Tant que l’émotion est au maximum, les arguments sont inutiles.',
            'Contredire ferme la porte ; reformuler l’ouvre.'
          ]
        }
      ]
    },

    {
      id: 'ecoute',
      num: '06',
      title: 'Écoute active, reformulation et résumés',
      blocks: [
        { t: 'p', text: 'L’écoute active est l’outil principal de la formation. Elle consiste à montrer, par ce que tu dis, que tu suis réellement l’échange, tout en obtenant progressivement des informations — sans transformer l’échange en interrogatoire. Ce n’est pas de la politesse : c’est ce qui fait baisser la tension.' },
        {
          t: 'liste',
          items: [
            'Encouragements courts : « d’accord », « je vous écoute ».',
            'Reformuler : redire avec tes mots ce que la personne vient de dire.',
            'Nommer l’émotion : « tu as l’air en colère », « tu as peur de quelque chose ».',
            'Laisser le silence : trois secondes de silence valent une question de plus.',
            'Questions ouvertes : « qu’est-ce qui s’est passé ? » plutôt que « tu as volé ? ».',
            'Résumer de temps en temps : « si je comprends bien, … c’est ça ? ».'
          ]
        },
        { t: 'dialogue', text: '— J’ai rien demandé à personne, ils sont venus me chercher !\n— Donc pour toi, c’est eux qui ont commencé.\n— Exactement.\n— D’accord. Raconte-moi comment ça a commencé.' },
        { t: 'p', text: 'Remarque qu’il n’y a eu aucun jugement, aucune promesse, et que la personne accepte de raconter. Les informations utiles au dispositif arrivent presque toujours à ce moment-là.' },
        { t: 'dialogue', text: '— Personne ne m’écoute.\n— Vous avez le sentiment que personne ne vous a entendu jusqu’ici. Expliquez-moi ce qui vous a amené à cette situation.' },
        { t: 'p', text: 'Reformuler permet de vérifier que le message a été compris et réduit les malentendus. Un résumé rassemble plusieurs informations avant de poursuivre.' },
        {
          t: 'liste',
          items: [
            '« Si je comprends bien… »',
            '« Ce que vous me dites, c’est que… »',
            'Corriger immédiatement une mauvaise compréhension.',
            'Ne pas ajouter une intention que la personne n’a pas exprimée.',
            'Faire des résumés courts.'
          ]
        },
        {
          t: 'erreurs',
          items: [
            '« Je comprends » tout seul, sans rien reformuler : ça sonne faux.',
            'Enchaîner les questions fermées comme un interrogatoire.',
            'Couper la parole pour corriger un détail.',
            'Reformuler en déformant, ou en prêtant une intention.',
            'Parler plus que la personne en face.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'ÉCOUTER → REFORMULER → VÉRIFIER.',
            'Une bonne reformulation doit pouvoir être corrigée par l’interlocuteur.',
            'Un résumé court de temps en temps évite les malentendus.'
          ]
        },
        {
          t: 'exercice',
          id: 'ecoute-1',
          text: '« Vous allez tous me tomber dessus de toute façon. » Écris une reformulation et une question ouverte.',
          hint: 'Nomme la peur, puis demande du concret.'
        }
      ]
    },

    {
      id: 'questions',
      num: '07',
      title: 'Questions ouvertes et fermées',
      blocks: [
        { t: 'p', text: 'Une question ouverte favorise le récit et permet de comprendre. Une question fermée sert ensuite à confirmer un élément précis. Les deux sont utiles, mais pas au même moment.' },
        {
          t: 'table',
          head: ['Repère', 'Question ouverte', 'Question fermée'],
          rows: [
            ['À quoi elle sert', 'Faire raconter, comprendre', 'Confirmer un élément précis'],
            ['Quand', 'D’abord, pour ouvrir', 'Ensuite, pour vérifier'],
            ['Exemples', '« Qu’est-ce qui vous inquiète le plus ? » — « Comment en êtes-vous arrivé là ? »', '« Y a-t-il une personne blessée ? » — « Êtes-vous seul ? »']
          ]
        },
        { t: 'dialogue', text: '— Qu’est-ce qui vous inquiète le plus, là, maintenant ?\n— La dame derrière moi, elle respire mal depuis tout à l’heure.\n— D’accord. Est-ce qu’elle est consciente ?\n— Oui, elle me parle.\n— Est-ce qu’elle prend un traitement ?' },
        { t: 'p', text: 'L’échange commence large, puis se resserre : la question ouverte a fait venir l’information, les questions fermées la confirment. L’urgence médicale qui vient d’apparaître est transmise aussitôt au commandement.' },
        {
          t: 'erreurs',
          items: [
            'Enchaîner des séries rapides de questions fermées : l’échange devient un interrogatoire.',
            'Poser deux questions à la fois.',
            'Ouvrir par une question fermée accusatrice : « c’est toi qui as fait ça ? ».'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Commencer large, puis préciser.',
            'Ouverte pour comprendre, fermée pour confirmer.'
          ]
        },
        {
          t: 'exercice',
          id: 'questions-1',
          text: 'Transforme ces trois questions fermées en questions ouvertes : « Tu es énervé ? », « Il s’est passé quelque chose ? », « Tu veux sortir ? »',
          hint: 'Commence par « qu’est-ce qui », « comment », « qu’est-ce que ».'
        }
      ]
    },

    {
      id: 'contact',
      num: '08',
      title: 'Prise de contact',
      blocks: [
        { t: 'p', text: 'La prise de contact donne le ton de toute la suite. Elle se prépare en quelques secondes, même dans l’urgence : qui je suis, ce que je veux, ce que je ne fais pas. Le premier échange doit rester simple : vérifier que la communication fonctionne, se présenter par sa fonction, laisser l’interlocuteur parler et commencer à identifier son besoin immédiat.' },
        {
          t: 'etapes',
          steps: ['ANNONCER QUI TU ES', 'DIRE POURQUOI TU PARLES', 'DEMANDER SON PRÉNOM', 'POSER UNE QUESTION OUVERTE', 'ÉCOUTER']
        },
        { t: 'rp', text: 'Exemple de prise de contact : « Police. Je suis là pour parler avec vous et comprendre ce qui se passe. Est-ce que vous m’entendez correctement ? »' },
        { t: 'dialogue', text: '— Bonjour, je suis Cyril, de la police. Je ne rentre pas, je suis juste là pour parler.\n— Qu’est-ce que vous voulez ?\n— Que personne ne soit blessé. Comment tu t’appelles ?' },
        { t: 'p', text: 'Trois détails comptent dans cette ouverture : tu annonces ton prénom, tu annonces ce que tu ne fais pas (rassurant et vérifiable), et tu laisses la personne parler en premier.' },
        {
          t: 'liste',
          items: [
            'Se présenter simplement.',
            'Vérifier que l’interlocuteur entend correctement.',
            'Poser une première question ouverte.',
            'Laisser une réponse complète.',
            'Éviter d’enchaîner trop de questions.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Dis ton prénom avant de demander le sien.',
            'Annonce ce que tu ne fais pas : c’est ce qui rassure.',
            'Vérifie que la communication passe avant d’aller plus loin.',
            'Ta première question est ouverte, jamais une sommation.'
          ]
        },
        {
          t: 'exercice',
          id: 'contact-1',
          text: 'Écris ta prise de contact complète pour un joueur retranché avec une personne, en quatre répliques maximum.',
          hint: 'Suis la fiche : qui, pourquoi, prénom, question ouverte.'
        }
      ]
    },

    {
      id: 'confiance',
      num: '09',
      title: 'Créer une relation de confiance',
      blocks: [
        { t: 'p', text: 'La confiance ne vient pas d’une promesse spectaculaire mais de petites preuves de cohérence : écouter, ne pas mentir, respecter ce qui a été annoncé et expliquer lorsqu’une demande ne peut pas être validée immédiatement.' },
        {
          t: 'liste',
          items: [
            'Être cohérent d’un échange à l’autre.',
            'Ne pas inventer une autorisation.',
            'Dire lorsqu’une vérification est nécessaire.',
            'Tenir les engagements réellement validés.',
            'Éviter les changements brusques de ton.'
          ]
        },
        { t: 'dialogue', text: '— Tu peux me promettre qu’il n’y aura pas de poursuites ?\n— Ça, je ne peux pas le décider, et je ne vais pas te mentir là-dessus. Ce que je peux faire, c’est transmettre ta question et te redire exactement la réponse.\n— Et tu me rappelles quand ?\n— Dans cinq minutes. Si je n’ai pas encore la réponse, je te le dis quand même.' },
        { t: 'p', text: 'Rien de spectaculaire dans cet échange, mais chaque phrase est vraie et vérifiable. La demande n’est ni refusée sèchement ni accordée : elle est expliquée, transmise, et le rappel annoncé sera tenu.' },
        {
          t: 'erreurs',
          items: [
            'Inventer une autorisation pour débloquer la situation.',
            'Changer brusquement de ton d’un échange à l’autre.',
            'Oublier un rappel annoncé.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'La crédibilité se construit phrase après phrase.',
            'Dire qu’une vérification est nécessaire vaut mieux qu’une réponse inventée.',
            'Seul un engagement validé se promet — et il se tient.'
          ]
        },
        {
          t: 'exercice',
          id: 'confiance-1',
          text: 'La personne te demande de lui garantir qu’elle pourra voir sa famille ce soir. Écris ta réponse sans mentir et sans fermer la porte.',
          hint: 'Ce qui ne dépend pas de toi se transmet : dis-le, et annonce quand tu reviens.'
        }
      ]
    },

    {
      id: 'collecte',
      num: '10',
      title: 'Collecte et restitution de l’information',
      blocks: [
        { t: 'p', text: 'Pendant que tu parles, tu récoltes. Chaque information que tu obtiens doit remonter au commandement, même petite, même incertaine — à condition de dire si elle est sûre ou non. Tu dois garder une image claire de la situation tout en restant concentré sur l’échange.' },
        {
          t: 'liste',
          items: [
            'Qui est là : combien de personnes, qui est blessé, qui est libre.',
            'La présence et l’état apparent des personnes retenues.',
            'Les urgences médicales.',
            'Dans quel état est la personne : calme, très agitée, désespérée.',
            'Ce qu’elle demande, mot pour mot si possible.',
            'Ce qui la ferait sortir : une parole, un appel, du temps.',
            'Ce qui l’énerve : une sirène, un nom, une présence visible.',
            'Les éléments de contexte, et les changements de comportement ou de situation.'
          ]
        },
        { t: 'p', text: 'Pour tenir cette image sans perdre le fil, classe au fur et à mesure : CONFIRMÉ, À VÉRIFIER, NOUVEAU. Ce qui est supposé se range dans « à vérifier » ; le « nouveau » est ce qui a changé depuis ta dernière restitution.' },
        { t: 'p', text: 'La restitution se fait en une phrase courte, utilisable par le chef de groupe sans qu’il ait à te rappeler. Et on sépare toujours trois choses : ce qui est établi, ce qui est supposé, ce qui reste à vérifier.' },
        { t: 'rp', text: '« De Négociateur à chef de groupe : contact établi, prénom Mehdi, calme en baisse. Confirmé : deux personnes à l’intérieur dont une libre de se déplacer. Supposé : il serait seul. À vérifier : état de la seconde personne. Il demande à parler à sa sœur. »' },
        {
          t: 'retenir',
          items: [
            'Tout ce que tu apprends remonte, même incertain.',
            'CONFIRMÉ / À VÉRIFIER / NOUVEAU.',
            'Dis toujours si c’est confirmé, supposé ou à vérifier.',
            'Une phrase courte vaut mieux qu’un récit.'
          ]
        },
        {
          t: 'exercice',
          id: 'collecte-1',
          text: 'La personne t’a dit : « il y a le gérant avec moi, il saigne un peu ». Rédige ton compte rendu radio en séparant confirmé, supposé et à vérifier.',
          hint: 'Ce qu’elle dit est une déclaration, pas un constat.'
        }
      ]
    },

    {
      id: 'equipe',
      num: '11',
      title: 'Travailler avec son équipe et son commandement',
      blocks: [
        { t: 'p', text: 'Le négociateur ne travaille jamais seul. À côté de lui, il y a au minimum un coéquipier qui note et qui tient la liaison, et un chef de groupe qui décide. Cette répartition évite la faute la plus coûteuse : parler et décider en même temps. Le négociateur conserve le dialogue pendant que le commandement maintient la vision globale.' },
        {
          t: 'table',
          head: ['Rôle', 'Ce qu’il fait', 'Ce qu’il ne fait pas'],
          rows: [
            ['Négociateur', 'Parle, écoute, reformule, temporise', 'Décide de l’engagement'],
            ['Secrétaire / binôme', 'Note, relance, surveille le temps, tient la radio', 'Parle à la personne'],
            ['Chef de groupe', 'Décide, organise le dispositif, arbitre', 'Parle à la personne à la place du négociateur'],
            ['Équipages', 'Tiennent le périmètre, accueillent les sortants', 'Se montrent sans consigne']
          ]
        },
        { t: 'p', text: 'Un seul interlocuteur parle à la personne. Si l’on change de négociateur, on l’annonce clairement et on explique pourquoi — un changement subi est vécu comme un abandon.' },
        { t: 'p', text: 'Des points réguliers avec le commandement évitent qu’une information importante reste isolée.' },
        {
          t: 'liste',
          items: [
            'Annoncer la prise en charge de la négociation.',
            'Faire des restitutions courtes et structurées.',
            'Demander validation pour ce qui l’exige.',
            'Signaler immédiatement une rupture ou une dégradation.',
            'Conserver une séparation claire entre dialogue et décision de commandement.'
          ]
        },
        {
          t: 'erreurs',
          items: [
            'Deux personnes qui parlent en même temps à la personne en crise.',
            'Le négociateur qui décide seul d’une concession importante.',
            'Un binôme qui garde une information « pour ne pas déranger ».',
            'Changer de négociateur sans l’annoncer.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'DIALOGUE ↔ RESTITUTION ↔ DÉCISION.',
            'Un seul interlocuteur parle à la personne.',
            'Ce qui exige une validation attend la validation.'
          ]
        }
      ]
    },

    {
      id: 'compte-rendu',
      num: '12',
      title: 'Compte rendu de négociation',
      blocks: [
        { t: 'p', text: 'Un bon compte rendu permet à une autre personne de comprendre rapidement l’état de la négociation — le chef de groupe qui doit décider, ou le négociateur qui te relève. Il doit être factuel, court et organisé. Il suit toujours le même ordre.' },
        {
          t: 'etapes',
          steps: ['ÉTAT DU DIALOGUE', 'DEMANDES', 'PERSONNES / VULNÉRABILITÉS', 'ÉLÉMENTS CONFIRMÉS', 'ÉVOLUTION', 'DÉCISION ATTENDUE']
        },
        {
          t: 'table',
          head: ['Rubrique', 'Ce que tu dis'],
          rows: [
            ['État actuel du dialogue', 'Contact établi ou rompu, qualité de l’échange, depuis combien de temps'],
            ['Demandes formulées', 'Mot pour mot si possible, dans l’ordre où elles sont venues'],
            ['Personnes et vulnérabilités connues', 'Nombre, état apparent, urgence médicale, enfant, personne âgée, grossesse, traitement'],
            ['Éléments confirmés / à vérifier', 'Ce qui est établi, et ce qui ne l’est pas encore'],
            ['Évolution émotionnelle', 'Tension en hausse, stable ou en baisse, et ce qui l’a fait bouger'],
            ['Décision ou validation attendue', 'Ce que tu attends du commandement, et pour quand']
          ]
        },
        { t: 'rp', text: '« De Négociateur à chef de groupe, point de situation. Dialogue : établi depuis vingt minutes, échange régulier. Demandes : parler à sa sœur, puis un véhicule. Personnes : deux retenues, dont une femme enceinte qui signale des douleurs — déjà transmis. Confirmé : il est seul. À vérifier : identité de la seconde personne. Évolution : plus calme depuis dix minutes, remonte dès qu’on parle de prison. Décision attendue : réponse sur l’appel à sa sœur, je lui ai annoncé un rappel dans cinq minutes. »' },
        {
          t: 'erreurs',
          items: [
            'Raconter l’échange dans l’ordre chronologique au lieu de le structurer.',
            'Mélanger ce que la personne dit et ce qui est constaté.',
            'Oublier de dire ce qu’on attend du commandement.',
            'Attendre le compte rendu pour signaler une urgence médicale.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Situation → demandes → personnes → évolution → besoin de décision.',
            'Factuel, court, organisé.',
            'Une urgence médicale n’attend pas le compte rendu : elle part tout de suite.'
          ]
        },
        {
          t: 'exercice',
          id: 'cr-1',
          text: 'Reprends le compte rendu de l’exemple et réduis-le à quatre phrases, sans perdre les vulnérabilités ni la décision attendue.',
          hint: 'Suis l’ordre : dialogue, demandes, personnes, confirmé, évolution, décision.'
        }
      ]
    },

    {
      id: 'otages',
      num: '13',
      title: 'Personnes retenues et vulnérabilités',
      blocks: [
        { t: 'p', text: 'Savoir combien de personnes sont retenues, et dans quel état, change tout pour le commandement. Cette vérification se fait par la parole, sans jamais mettre quelqu’un en danger pour « voir ». Lorsqu’une personne retenue peut être entendue, ou qu’une information fiable est obtenue, tu cherches à connaître son état et les vulnérabilités particulières qui doivent être remontées.' },
        {
          t: 'table',
          head: ['Vulnérabilité à rechercher', 'Pourquoi elle compte'],
          rows: [
            ['Blessure ou besoin médical', 'C’est une urgence : elle remonte sans attendre'],
            ['Enfant, personne âgée ou grossesse', 'Fragilité accrue, priorité dans toute issue'],
            ['Traitement médical indispensable', 'Le temps ne joue plus forcément pour toi'],
            ['État de panique important', 'Risque de geste imprévisible, besoin d’être rassuré'],
            ['Identité, lorsque c’est possible et utile', 'Recouper, rassurer les proches, sortir de « l’otage »']
          ]
        },
        {
          t: 'liste',
          items: [
            'Demander à entendre la personne retenue : « est-ce que je peux lui dire bonjour ? ».',
            'Demander son prénom, pour sortir de « l’otage » et créer un lien.',
            'Demander si quelqu’un a besoin de soins, et quoi précisément.',
            'Recouper : ce que dit la personne retenue, ce que dit l’auteur, ce que voient les équipages.',
            'Reposer la question plus tard, autrement, pour vérifier la cohérence.'
          ]
        },
        { t: 'dialogue', text: '— Je peux dire un mot à la personne qui est avec toi ?\n— Pour quoi faire ?\n— Juste savoir si elle va bien. Ça m’aide à te laisser du temps.\n— … Vas-y, deux secondes.' },
        { t: 'p', text: 'Noter la formulation : la demande est justifiée par un bénéfice pour la personne elle-même. C’est ce qui la rend acceptable.' },
        { t: 'rp', text: 'La personne retenue glisse : « je suis diabétique, je n’ai pas mon traitement ». Tu laisses de côté le sujet en cours. Tu confirmes d’une question fermée (« vous avez besoin de votre traitement maintenant, c’est bien ça ? »), puis tu transmets immédiatement : « Urgence médicale : une personne retenue diabétique, sans son traitement, déclaré par elle-même. »' },
        {
          t: 'retenir',
          items: [
            'Toute urgence médicale doit être transmise sans attendre.',
            'Une personne retenue a un prénom : demande-le.',
            'Toute demande se justifie par un bénéfice pour la personne en face.',
            'On recoupe toujours : une déclaration n’est pas un constat.'
          ]
        },
        {
          t: 'exercice',
          id: 'otages-1',
          text: 'L’auteur refuse que tu parles à la personne retenue. Propose deux autres façons de t’assurer qu’elle va bien.',
          hint: 'Question indirecte, demande de geste simple, recoupement.'
        }
      ]
    },

    {
      id: 'priorites',
      num: '14',
      title: 'Ordre des priorités RP et concessions',
      blocks: [
        { t: 'p', text: 'Quand plusieurs choses sont urgentes en même temps, l’ordre est toujours le même. Il ne se discute pas et il se récite.' },
        {
          t: 'etapes',
          steps: ['LA VIE DES PERSONNES RETENUES', 'LA VIE DES INTERVENANTS', 'LA VIE DE L’AUTEUR', 'LE MAINTIEN DU DIALOGUE', 'L’INTERPELLATION', 'LE MATÉRIEL']
        },
        { t: 'p', text: 'Cet ordre a une conséquence concrète : si une concession sans danger permet de gagner du temps et de préserver des vies, elle est bonne, même si elle « fait perdre » sur le plan de l’interpellation.' },
        { t: 'rp', text: 'La personne demande une bouteille d’eau. Cela ne met personne en danger, cela crée un échange, et cela donne un prétexte à un contact. C’est une bonne concession. Elle demande un véhicule pour partir : cela déplace le danger ailleurs. Ce n’est pas au négociateur de l’accorder.' },
        {
          t: 'retenir',
          items: [
            'Les vies d’abord, l’interpellation après.',
            'Une concession sans danger qui fait gagner du temps est une bonne concession.',
            'Tout ce qui déplace le danger n’est jamais accordé par le négociateur seul.'
          ]
        }
      ]
    },

    {
      id: 'motivations',
      num: '15',
      title: 'Motivations et blocages',
      blocks: [
        { t: 'p', text: 'Une demande exprimée n’est pas toujours le véritable besoin. Il faut distinguer revendication, motivation, peur, contrainte et blocage, afin de comprendre ce qui peut faire évoluer l’échange.' },
        {
          t: 'table',
          head: ['Ce que tu distingues', 'La question à te poser', 'Exemple'],
          rows: [
            ['Revendication', 'Qu’est-ce qu’elle demande exactement ?', '« Je veux une voiture. »'],
            ['Motivation', 'Qu’est-ce qui compte vraiment pour elle ?', 'Ne pas être arrêtée devant ses enfants'],
            ['Peur', 'Qu’est-ce qu’elle redoute ?', 'Être brutalisée en sortant'],
            ['Contrainte', 'Qu’est-ce qui l’empêche d’avancer, de son point de vue ?', 'Une dette, la pression d’un tiers'],
            ['Blocage', 'Quel sujet fait remonter la tension d’un coup ?', 'Le nom de son ancien associé']
          ]
        },
        {
          t: 'liste',
          items: [
            'Identifier la demande explicite.',
            'Chercher ce qui est réellement important pour la personne.',
            'Repérer les sujets qui augmentent brutalement la tension.',
            'Identifier les éléments qui permettent de maintenir le dialogue.',
            'Ne pas présenter une hypothèse comme un fait.'
          ]
        },
        { t: 'rp', text: 'Il répète qu’il veut une voiture. Tu notes la revendication et tu la transmets sans la discuter. Mais en l’écoutant, tu remarques qu’il revient sans cesse sur sa fille. Hypothèse : ce qui compte pour lui, c’est de ne pas être arrêté devant elle. Tu la transmets comme une hypothèse — « supposé » — jamais comme un fait.' },
        {
          t: 'retenir',
          items: [
            'DEMANDE ≠ MOTIVATION.',
            'Repère ce qui fait monter la tension, et ce qui permet de maintenir le dialogue.',
            'Une hypothèse se transmet comme une hypothèse.'
          ]
        },
        {
          t: 'exercice',
          id: 'motivations-1',
          text: '« Je veux un avocat ici, maintenant, sinon je ne parle plus. » Distingue la demande, une motivation possible et un blocage possible.',
          hint: 'La motivation est une hypothèse : formule-la comme telle.'
        }
      ]
    },

    {
      id: 'accord',
      num: '16',
      title: 'Revendications et recherche d’une issue',
      blocks: [
        { t: 'p', text: 'Une revendication n’est jamais automatiquement acceptée. Elle doit être comprise précisément, reformulée pour éviter toute ambiguïté, transmise au commandement puis faire l’objet d’une réponse claire.' },
        {
          t: 'etapes',
          steps: ['LAISSER FORMULER', 'PRÉCISER', 'REFORMULER', 'TRANSMETTRE', 'ATTENDRE LA VALIDATION', 'RÉPONDRE SANS INVENTER']
        },
        {
          t: 'liste',
          items: [
            'Écouter la demande entière.',
            'Vérifier les détails utiles.',
            'Reformuler.',
            'Transmettre sans modifier.',
            'Attendre la décision lorsqu’une validation est nécessaire.',
            'Ne pas créer de faux accord.'
          ]
        },
        { t: 'p', text: 'Derrière une demande, il y a presque toujours un besoin. La demande peut être irrecevable ; le besoin, lui, peut souvent être satisfait autrement. C’est là que se joue la sortie.' },
        {
          t: 'table',
          head: ['Demande', 'Besoin derrière', 'Réponse possible'],
          rows: [
            ['« Je veux partir »', 'Ne pas être humilié', 'Une sortie digne, annoncée à l’avance, sans public'],
            ['« Je veux parler à ma sœur »', 'Être rassuré, être cru', 'Transmettre un message, ou un appel encadré'],
            ['« Je veux qu’on me laisse »', 'Souffler, ne plus être pressé', 'Baisser la pression visible, ralentir le rythme'],
            ['« Je veux des garanties »', 'Savoir ce qui va se passer', 'Décrire honnêtement la suite, sans promettre l’impunité']
          ]
        },
        { t: 'p', text: 'Quand une issue se dessine, elle se décrit pas à pas, à l’avance, dans l’ordre, et on ne change rien en route. C’est ce qui évite les gestes mal interprétés.' },
        { t: 'dialogue', text: '— Alors voilà comment on fait. Tu poses ce que tu as sur la table. Tu ouvres la porte. Tu sors les mains visibles. Moi je suis devant, personne derrière toi. Tu es d’accord sur l’ordre ?\n— Et après ?\n— Après je reste avec toi. Je ne te lâche pas.' },
        {
          t: 'erreurs',
          items: [
            'Promettre l’absence de poursuites pour obtenir une sortie.',
            'Changer l’ordre convenu au dernier moment.',
            'Laisser la personne sortir sans avoir prévenu le dispositif.',
            'Négocier une issue sans l’accord du chef de groupe.'
          ]
        },
        {
          t: 'exercice',
          id: 'accord-1',
          text: '« Je sors seulement si je ne vois aucun policier. » Trouve le besoin derrière la demande, et propose une réponse tenable.',
          hint: 'Souvent : ne pas être humilié devant du monde.'
        }
      ]
    },

    {
      id: 'temps',
      num: '17',
      title: 'Temps, pression et maîtrise émotionnelle',
      blocks: [
        { t: 'p', text: 'Le temps travaille presque toujours pour toi. Plus la situation dure, plus la tension baisse, plus la personne fatigue, plus le dispositif est prêt. Temporiser n’est pas perdre du temps : c’est travailler.' },
        {
          t: 'liste',
          items: [
            'Ralentir le rythme de tes phrases ralentit celui de la personne.',
            'Reformuler longuement fait passer du temps utilement.',
            'Une demande peut être « transmise », ce qui prend du temps sans être un refus.',
            'Un délai doit être annoncé et respecté : « je te rappelle dans cinq minutes » engage.',
            'Si tu annonces un délai et que tu le dépasses, tu perds la confiance.',
            'Ne pas se précipiter vers un accord mal compris ; revenir sur les points importants.',
            'Temporiser ne signifie pas ignorer une urgence : une urgence réelle remonte immédiatement.'
          ]
        },
        { t: 'p', text: 'Attention au sens inverse : une échéance que la personne fixe elle-même (« dans dix minutes je fais une bêtise ») ne se discute pas frontalement. On la contourne en la rendant floue, en parlant d’autre chose d’important pour elle.' },
        {
          t: 'retenir',
          items: [
            'Temporiser est une action, pas une absence d’action.',
            'Le temps est un outil de communication, pas une excuse pour l’inaction.',
            'Un délai annoncé est une promesse : tiens-la.',
            'Une échéance posée par la personne se contourne, elle ne se défie pas.'
          ]
        },
        {
          t: 'exercice',
          id: 'temps-1',
          text: '« Dans cinq minutes, j’arrête tout. » Écris ta réponse sans la contredire et sans accepter l’échéance.',
          hint: 'Ramène-la sur un sujet concret qui lui tient à cœur.'
        }
      ]
    },

    {
      id: 'erreurs',
      num: '18',
      title: 'Erreurs fréquentes',
      blocks: [
        { t: 'p', text: 'La plupart des négociations qui échouent en jeu de rôle échouent pour les mêmes raisons : une communication trop rapide, une promesse non validée ou une mauvaise restitution au commandement. Les connaître d’avance suffit souvent à les éviter.' },
        {
          t: 'erreurs',
          items: [
            'Parler trop. Si tu parles plus que la personne, tu n’écoutes pas.',
            'Couper constamment la parole, ou multiplier les questions.',
            'Vouloir avoir raison.',
            'Menacer inutilement.',
            'Employer trop de jargon.',
            'Promettre pour obtenir. Une promesse non tenue annule tout le travail.',
            'Mentir sur un fait vérifiable. Dès qu’il est découvert, le dialogue est mort.',
            'Donner des informations sur le dispositif : effectifs, positions, moment d’une action.',
            'Hausser le ton parce que la personne hausse le ton.',
            'Discuter l’émotion : « tu n’as pas de raison d’avoir peur ».',
            'Changer d’interlocuteur sans l’annoncer.',
            'Oublier de transmettre au commandement.',
            'Décider seul d’une concession importante.',
            'Lâcher le contact quand ça se complique.'
          ]
        },
        { t: 'rp', text: 'Cas classique : un joueur négociateur annonce « il n’y a personne dehors » alors que deux équipages sont visibles depuis la fenêtre. La personne le constate, et plus rien de ce qui sera dit ensuite ne sera cru. Mieux valait dire : « oui, il y a des collègues. Ils ne bougent pas. »' },
        {
          t: 'retenir',
          items: [
            'Simple, calme, factuel, coordonné.',
            'Tu peux te taire ; tu ne peux pas mentir sur ce qui est vérifiable.',
            'Si tu parles plus qu’elle, tu as déjà perdu le fil.',
            'La confiance se perd une fois et ne revient pas.'
          ]
        }
      ]
    },

    {
      id: 'regles',
      num: '19',
      title: 'Règles FRRP / GTRP à respecter',
      blocks: [
        { t: 'p', text: 'La négociation est un moment de jeu intense, et c’est précisément là que les règles du serveur comptent le plus. Un bon négociateur est d’abord un joueur qui respecte le cadre.' },
        {
          t: 'liste',
          items: [
            'Reste dans ton rôle du début à la fin : pas de hors-jeu pendant la scène.',
            'Aucune information obtenue hors du jeu ne peut être utilisée dans le jeu.',
            'Respecte la peur de ton personnage : un policier n’est pas invulnérable.',
            'Laisse à la personne en face le temps de jouer sa réponse. On ne précipite pas une scène pour « finir ».',
            'Pas de scène de négociation forcée sur un joueur qui n’y consent pas.',
            'Les décisions de l’encadrement en jeu se respectent en jeu ; une contestation se règle hors jeu, après.',
            'Un désaccord sur une règle se signale après la scène, pas en pleine négociation.'
          ]
        },
        { t: 'p', text: 'En cas de doute pendant une scène, le réflexe est simple : jouer prudemment, continuer la scène, et poser la question à l’encadrement une fois la situation terminée.' },
        {
          t: 'retenir',
          items: [
            'Le cadre du serveur passe avant la performance du personnage.',
            'Rien de ce qui se dit hors jeu ne rentre dans le jeu.',
            'Un désaccord se règle après la scène.'
          ]
        }
      ]
    },

    {
      id: 'particulieres',
      num: '20',
      title: 'Situations particulières',
      blocks: [
        { t: 'p', text: 'Certaines configurations demandent une adaptation. Le principe ne change pas — écouter, reformuler, transmettre — mais le rythme et les priorités bougent.' },
        {
          t: 'table',
          head: ['Situation', 'Ce qui change', 'Priorité'],
          rows: [
            ['Personne très désespérée', 'Le temps ne joue plus forcément pour toi', 'Maintenir le lien, ne jamais laisser le silence s’installer'],
            ['Personne alcoolisée ou confuse', 'La mémoire et la logique sont réduites', 'Phrases très courtes, répétition, patience'],
            ['Plusieurs auteurs', 'Il y a un décideur et des suiveurs', 'Identifier qui décide, ne parler qu’à lui'],
            ['Personne mineure', 'L’émotion domine, la peur des conséquences est énorme', 'Rassurer sur la suite, chercher un adulte de confiance'],
            ['Collègue en cause', 'Le lien personnel brouille le jugement', 'Passer la main si possible, se faire doubler sinon'],
            ['Personne qui ne répond plus', 'Plus de retour, donc plus d’information', 'Continuer à parler, annoncer ce que tu fais, prévenir le commandement']
          ]
        },
        { t: 'rp', text: 'Deux auteurs, l’un qui crie, l’autre qui se tait. Le silencieux est souvent celui qui décide. Parler au plus bruyant donne l’impression d’avancer sans rien obtenir : il faut identifier et s’adresser à celui qui tranche, sans humilier l’autre.' },
        {
          t: 'exercice',
          id: 'part-1',
          text: 'Trois auteurs, et tu ne sais pas qui décide. Décris comment tu le découvres en parlant, sans le demander directement.',
          hint: 'Observe qui répond, qui fait taire l’autre, à qui on demande l’accord.'
        }
      ]
    },

    {
      id: 'exercices',
      num: '21',
      title: 'Exercices d’entraînement',
      blocks: [
        { t: 'p', text: 'Les exercices sont courts et progressifs. Le formateur évalue la méthode et la capacité d’adaptation plutôt qu’une phrase parfaite apprise par cœur. Les exercices A à E se jouent à l’oral avec le formateur ; la réponse écrite sert de préparation.' },
        {
          t: 'exercice',
          id: 'ex-a',
          text: 'Exercice A — Ouvrir un premier contact. La personne a décroché mais ne dit rien. Écris tes trois premières répliques.',
          hint: 'Se présenter simplement, vérifier qu’elle entend, poser une question ouverte, laisser répondre.'
        },
        {
          t: 'exercice',
          id: 'ex-b',
          text: 'Exercice B — Reformuler une revendication complexe : « Je veux que ma femme vienne, que les voitures partent de la rue, et qu’on me laisse parler à un journaliste, sinon rien. »',
          hint: 'Reformule chaque demande sans en accepter aucune, puis vérifie que tu as bien compris.'
        },
        {
          t: 'exercice',
          id: 'ex-c',
          text: 'Exercice C — Identifier une urgence médicale. Au détour d’une phrase, l’auteur dit : « la vieille dame, elle arrête pas de se tenir la poitrine ». Que demandes-tu, et que transmets-tu ?',
          hint: 'Une question fermée pour confirmer, une transmission immédiate.'
        },
        {
          t: 'exercice',
          id: 'ex-d',
          text: 'Exercice D — Restituer 60 secondes d’échange au commandement. Le formateur joue une minute d’échange : rédige ta restitution au format du compte rendu.',
          hint: 'État du dialogue → demandes → personnes/vulnérabilités → éléments confirmés → évolution → décision attendue.'
        },
        {
          t: 'exercice',
          id: 'ex-e',
          text: 'Exercice E — Reprendre un dialogue après une montée de tension. La personne vient de hurler et de raccrocher après une question maladroite. Écris ta reprise.',
          hint: 'Ralentir ton débit, reconnaître l’émotion, ne pas te justifier longuement, une question ouverte.'
        },
        { t: 'rp', text: 'Exercice interactif : un interlocuteur très énervé coupe la parole et répète la même demande. Ta priorité : ralentir ton propre débit, écouter la demande entière, reformuler, puis rechercher ce qui alimente la tension.' },
        { t: 'p', text: 'Exercices complémentaires, à l’écrit avant la mise en situation. Le formateur lit les réponses et corrige la formulation, pas seulement l’idée.' },
        {
          t: 'exercice',
          id: 'ex-1',
          text: 'Prise de contact : la personne vient de raccrocher deux fois. Écris ta troisième approche.',
          hint: 'Ne reproche pas les raccrochés. Recommence à zéro, plus court.'
        },
        {
          t: 'exercice',
          id: 'ex-2',
          text: 'Reformulation : « vous êtes tous les mêmes, vous allez me descendre. » Reformule sans mentir et sans contredire.',
          hint: 'Nomme la peur, puis dis ce que tu fais concrètement.'
        },
        {
          t: 'exercice',
          id: 'ex-3',
          text: 'Transmission : la personne a dit qu’il y avait « peut-être trois personnes » avec elle. Rédige ton compte rendu.',
          hint: '« Supposé » est le mot important.'
        },
        {
          t: 'exercice',
          id: 'ex-4',
          text: 'Concession : elle demande à manger. Que fais-tu, et qu’est-ce que tu demandes en échange ?',
          hint: 'Un échange raisonnable : un geste pour un geste, sans danger.'
        },
        {
          t: 'exercice',
          id: 'ex-5',
          text: 'Sortie : décris pas à pas la sortie que tu proposes, dans l’ordre, en six étapes maximum.',
          hint: 'Rien de nouveau au dernier moment.'
        },
        {
          t: 'retenir',
          items: [
            'Chaque exercice se termine par un débrief : ce qui a aidé, ce qui a bloqué, ce qui devait être transmis.',
            'On évalue la méthode, pas une phrase apprise par cœur.'
          ]
        }
      ]
    },

    {
      id: 'finale',
      num: '22',
      title: 'Mise en situation finale',
      blocks: [
        {
          t: 'p',
          text: 'La mise en situation finale est jouée avec le formateur. Elle dure une quinzaine de minutes et sert à conduire un échange complet : vérifier que les réflexes tiennent sous pression. Elle compte pour 25 points sur 100 dans l’évaluation.'
        },
        {
          t: 'rp',
          text: 'Énoncé à lire au candidat : « Un joueur s’est retranché dans un local commercial après un vol qui a mal tourné. Il accepte de communiquer alors que plusieurs personnes sont retenues avec lui. Les informations initiales sont incomplètes. Il parle fort, se dit piégé, et dit qu’il ne veut pas finir en prison. Le périmètre est tenu, un chef de groupe est sur place, tu es désigné négociateur. » Pendant l’échange, son état émotionnel varie, plusieurs demandes apparaissent, et une information médicale urgente survient.'
        },
        {
          t: 'liste',
          items: [
            'Phase 1 — prise de contact et premières informations.',
            'Phase 2 — plusieurs demandes apparaissent, dont celle de partir : gestion des demandes.',
            'Phase 3 — une information médicale urgente survient : confirmation et transmission immédiate.',
            'Phase 4 — la personne fixe une échéance : temporisation.',
            'Phase 5 — ouverture d’une issue et description pas à pas.',
            'Phase 6 — compte rendu final au chef de groupe, puis débrief.'
          ]
        },
        { t: 'p', text: 'Ce que le formateur observe pendant l’échange :' },
        {
          t: 'liste',
          items: [
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
          ]
        },
        {
          t: 'retenir',
          items: [
            'Le candidat est évalué sur sa méthode, sa stabilité et sa coordination.',
            'Le formateur observe la posture autant que le contenu.',
            'Une transmission oubliée compte comme une erreur, même si le dialogue est bon.',
            'Une promesse intenable fait échouer la mise en situation.'
          ]
        }
      ]
    },

    {
      id: 'evaluation',
      num: '23',
      title: 'Évaluation finale /100',
      blocks: [
        { t: 'p', text: 'L’évaluation reprend l’ensemble de la formation. Elle est notée sur 100 selon une grille en six axes : neuf questions écrites, pour environ trente minutes, puis l’observation de la mise en situation finale par le formateur. Elle ne porte sur rien d’autre que ce qui a été vu dans les chapitres précédents.' },
        {
          t: 'table',
          head: ['Axe de la grille', 'Points', 'Ce qui est regardé'],
          rows: [
            ['Théorie et connaissances', '/20', 'Rôle et limites du négociateur, cadre général et priorités, fiche réflexe'],
            ['Communication et écoute', '/20', 'Écoute active, reformulation, prise de contact, questions ouvertes et fermées'],
            ['Analyse', '/15', 'Demande et motivation, blocages, revendications, vulnérabilités et urgence médicale'],
            ['Maîtrise émotionnelle', '/10', 'Calme sous la provocation, émotion reconnue sans valider l’acte, échéance contournée'],
            ['Collecte et restitution', '/10', 'Compte rendu structuré : dialogue, demandes, personnes, confirmé, évolution, décision attendue'],
            ['Mise en situation finale', '/25', 'Échange complet observé par le formateur : méthode, stabilité, coordination']
          ]
        },
        { t: 'p', text: 'Pour les questions écrites, le portail propose une note et dit sur quoi il s’appuie : éléments attendus retrouvés dans ta réponse, éléments manquants. Pour la mise en situation finale, le formateur consigne ses observations dans le champ de réponse. Toute note proposée reste une suggestion : le formateur garde la note retenue et peut s’en écarter dans les deux sens.' },
        {
          t: 'retenir',
          items: [
            'Six axes, 100 points : 75 à l’écrit, 25 sur la mise en situation finale.',
            'Réponds par des phrases : une réponse en trois mots ne montre rien.',
            'La note du portail est une suggestion ; la décision est celle du formateur.'
          ]
        },
        { t: 'p', text: 'À l’issue de l’évaluation, la fiche de formation est produite : identité, chapitres parcourus, réponses, notes retenues, appréciation et signatures. Une fois la fiche clôturée, elle n’est plus modifiable.' }
      ]
    },

    {
      id: 'reflexe',
      num: '24',
      title: 'Fiche réflexe négociation',
      blocks: [
        { t: 'p', text: 'À retenir par cœur. C’est l’ordre dans lequel on avance, et celui dans lequel on revient quand on est perdu en pleine scène.' },
        { t: 'etapes', steps: REFLEXE_NEGOCIATION.steps },
        {
          t: 'table',
          head: ['Étape', 'Ce que tu fais concrètement'],
          rows: [
            ['CONTACT', 'Tu dis qui tu es, ce que tu ne fais pas, tu demandes son prénom'],
            ['ÉCOUTER', 'Tu la laisses parler plus que toi, tu acceptes les silences'],
            ['COMPRENDRE', 'Tu cherches le besoin derrière la demande'],
            ['REFORMULER', 'Tu redis avec tes mots, tu nommes l’émotion'],
            ['IDENTIFIER', 'Qui est là, dans quel état, ce qui bloque, ce qui aiderait'],
            ['INFORMER / TRANSMETTRE', 'Confirmé, supposé, à vérifier — en une phrase courte'],
            ['ADAPTER', 'Tu changes de rythme ou d’angle si ça ne prend pas'],
            ['TEMPORISER', 'Tu fais passer le temps utilement, tu tiens tes délais'],
            ['RECHERCHER UNE ISSUE', 'Tu décris la sortie pas à pas, et tu ne changes rien en route']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Perdu en pleine scène ? Reviens à ÉCOUTER puis REFORMULER.',
            'Chaque étape se termine par une transmission.',
            'L’issue se décrit avant d’être exécutée.'
          ]
        }
      ]
    },

    {
      id: 'conclusion',
      num: '25',
      title: 'Conclusion',
      blocks: [
        { t: 'p', text: 'La négociation n’est pas un talent : c’est une méthode, et une méthode s’entretient. Ce que tu as appris ici tient en peu de choses — parler calmement, écouter vraiment, reformuler, transmettre juste, tenir le temps.' },
        { t: 'p', text: 'Sur le terrain, tu n’es jamais seul : le chef de groupe organise, le périmètre est tenu, le commandement décide. Ton travail est de faire baisser la tension et de donner une information fiable à ceux qui décident.' },
        {
          t: 'retenir',
          items: [
            'On ne négocie pas pour gagner : on négocie pour que personne ne soit blessé.',
            'Une information transmise sans tri vaut une information fausse.',
            'Quand tu ne sais plus quoi faire : écouter, puis reformuler.',
            'Le temps est un allié tant qu’il est employé à quelque chose.'
          ]
        },
        { t: 'p', text: 'Tout ce qui est écrit ici relève du jeu de rôle France Roleplay. Les règles citées sont des règles de serveur, pas une doctrine policière réelle, et cette formation n’a aucune valeur administrative.' }
      ]
    }
  ],

  // §6 et §10 : évaluation notée sur 100 selon la grille de la formation
  // (Théorie 20, Communication et écoute 20, Analyse 15, Maîtrise
  // émotionnelle 10, Collecte et restitution 10, Mise en situation finale
  // 25), avec éléments attendus pour la correction assistée. L'examinateur
  // garde la note retenue.
  //
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
