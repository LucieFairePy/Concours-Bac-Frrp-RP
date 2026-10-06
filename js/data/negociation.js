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
        { t: 'p', text: 'Pendant ce temps, le reste du dispositif travaille : le périmètre est tenu, le chef de groupe organise, les équipages se placent. Le négociateur est donc un rouage parmi d’autres, pas un héros isolé.' },
        {
          t: 'liste',
          items: [
            'Il parle — il ne décide pas de l’engagement.',
            'Il informe son commandement en permanence.',
            'Il ne promet jamais ce qu’il ne peut pas tenir.',
            'Il reste le même interlocuteur du début à la fin si c’est possible.'
          ]
        },
        { t: 'rp', text: 'Un joueur retient une personne dans une supérette après un vol qui a mal tourné. Tu es désigné négociateur. Ton travail ne commence pas par « rends-toi » : il commence par « je suis là, je t’écoute, qu’est-ce qui se passe ? ».' },
        {
          t: 'retenir',
          items: [
            'Le but n’est pas de convaincre, c’est de calmer.',
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
      id: 'posture',
      num: '03',
      title: 'Posture du négociateur',
      blocks: [
        { t: 'p', text: 'La posture, c’est la manière d’être : ton de voix, rythme, vocabulaire, patience. Elle compte souvent plus que le contenu des phrases. Une personne très tendue retient d’abord comment tu lui parles.' },
        {
          t: 'liste',
          items: [
            'Voix basse et lente. Si la personne crie, tu ne cries pas plus fort.',
            'Phrases courtes. Une idée par phrase.',
            'Vouvoiement ou tutoiement : prends celui qui apaise, et garde-le.',
            'Tu donnes ton prénom et tu demandes le sien. On ne négocie pas avec « l’individu ».',
            'Tu ne t’engages jamais sur ce qui dépend d’un autre.'
          ]
        },
        { t: 'dialogue', text: '— Reculez ou je fais une bêtise !\n— D’accord, je recule. Je m’appelle Cyril. Et toi ?\n— … Mehdi.\n— Mehdi, je reste là, je t’écoute. Dis-moi ce qui se passe.' },
        { t: 'p', text: 'Dans cet échange, trois choses ont été obtenues en quatre répliques : un geste accordé qui ne coûte rien, un prénom, et une question ouverte. C’est exactement le rythme attendu.' },
        {
          t: 'retenir',
          items: [
            'Ton calme est ton premier outil.',
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
      num: '04',
      title: 'Comprendre une personne en crise',
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
        { t: 'rp', text: 'Un joueur s’est enfermé après une dispute. Il répète « de toute façon tout le monde s’en fout ». Si tu réponds « mais non », tu le contredis. Si tu réponds « tu te sens lâché, c’est ça ? », tu montres que tu as entendu. La deuxième porte ouvre, la première ferme.' },
        {
          t: 'retenir',
          items: [
            'Une émotion ne se discute pas, elle se reconnaît.',
            'Tant que l’émotion est au maximum, les arguments sont inutiles.',
            'Contredire ferme la porte ; reformuler l’ouvre.'
          ]
        }
      ]
    },

    {
      id: 'ecoute',
      num: '05',
      title: 'Écoute active',
      blocks: [
        { t: 'p', text: 'L’écoute active est l’outil principal de la formation. Elle consiste à montrer, par ce que tu dis, que tu as réellement entendu. Ce n’est pas de la politesse : c’est ce qui fait baisser la tension.' },
        {
          t: 'liste',
          items: [
            'Reformuler : redire avec tes mots ce que la personne vient de dire.',
            'Nommer l’émotion : « tu as l’air en colère », « tu as peur de quelque chose ».',
            'Laisser le silence : trois secondes de silence valent une question de plus.',
            'Questions ouvertes : « qu’est-ce qui s’est passé ? » plutôt que « tu as volé ? ».',
            'Résumer de temps en temps : « si je comprends bien, … c’est ça ? ».'
          ]
        },
        { t: 'dialogue', text: '— J’ai rien demandé à personne, ils sont venus me chercher !\n— Donc pour toi, c’est eux qui ont commencé.\n— Exactement.\n— D’accord. Raconte-moi comment ça a commencé.' },
        { t: 'p', text: 'Remarque qu’il n’y a eu aucun jugement, aucune promesse, et que la personne accepte de raconter. Les informations utiles au dispositif arrivent presque toujours à ce moment-là.' },
        {
          t: 'erreurs',
          items: [
            '« Je comprends » tout seul, sans rien reformuler : ça sonne faux.',
            'Enchaîner les questions fermées comme un interrogatoire.',
            'Couper la parole pour corriger un détail.',
            'Parler plus que la personne en face.'
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
      id: 'contact',
      num: '06',
      title: 'Prise de contact',
      blocks: [
        { t: 'p', text: 'La prise de contact donne le ton de toute la suite. Elle se prépare en quelques secondes, même dans l’urgence : qui je suis, ce que je veux, ce que je ne fais pas.' },
        {
          t: 'etapes',
          steps: ['ANNONCER QUI TU ES', 'DIRE POURQUOI TU PARLES', 'DEMANDER SON PRÉNOM', 'POSER UNE QUESTION OUVERTE', 'ÉCOUTER']
        },
        { t: 'dialogue', text: '— Bonjour, je suis Cyril, de la police. Je ne rentre pas, je suis juste là pour parler.\n— Qu’est-ce que vous voulez ?\n— Que personne ne soit blessé. Comment tu t’appelles ?' },
        { t: 'p', text: 'Trois détails comptent dans cette ouverture : tu annonces ton prénom, tu annonces ce que tu ne fais pas (rassurant et vérifiable), et tu laisses la personne parler en premier.' },
        {
          t: 'retenir',
          items: [
            'Dis ton prénom avant de demander le sien.',
            'Annonce ce que tu ne fais pas : c’est ce qui rassure.',
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
      id: 'collecte',
      num: '07',
      title: 'Collecte et restitution de l’information',
      blocks: [
        { t: 'p', text: 'Pendant que tu parles, tu récoltes. Chaque information que tu obtiens doit remonter au commandement, même petite, même incertaine — à condition de dire si elle est sûre ou non.' },
        {
          t: 'liste',
          items: [
            'Qui est là : combien de personnes, qui est blessé, qui est libre.',
            'Dans quel état est la personne : calme, très agitée, désespérée.',
            'Ce qu’elle demande, mot pour mot si possible.',
            'Ce qui la ferait sortir : une parole, un appel, du temps.',
            'Ce qui l’énerve : une sirène, un nom, une présence visible.'
          ]
        },
        { t: 'p', text: 'La restitution se fait en une phrase courte, utilisable par le chef de groupe sans qu’il ait à te rappeler. Et on sépare toujours trois choses : ce qui est établi, ce qui est supposé, ce qui reste à vérifier.' },
        { t: 'rp', text: '« De Négociateur à chef de groupe : contact établi, prénom Mehdi, calme en baisse. Confirmé : deux personnes à l’intérieur dont une libre de se déplacer. Supposé : il serait seul. À vérifier : état de la seconde personne. Il demande à parler à sa sœur. »' },
        {
          t: 'retenir',
          items: [
            'Tout ce que tu apprends remonte, même incertain.',
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
      num: '08',
      title: 'Travailler avec son équipe et son commandement',
      blocks: [
        { t: 'p', text: 'Le négociateur ne travaille jamais seul. À côté de lui, il y a au minimum un coéquipier qui note et qui tient la liaison, et un chef de groupe qui décide. Cette répartition évite la faute la plus coûteuse : parler et décider en même temps.' },
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
        {
          t: 'erreurs',
          items: [
            'Deux personnes qui parlent en même temps à la personne en crise.',
            'Le négociateur qui décide seul d’une concession importante.',
            'Un binôme qui garde une information « pour ne pas déranger ».',
            'Changer de négociateur sans l’annoncer.'
          ]
        }
      ]
    },

    {
      id: 'otages',
      num: '09',
      title: 'Vérification des personnes retenues',
      blocks: [
        { t: 'p', text: 'Savoir combien de personnes sont retenues, et dans quel état, change tout pour le commandement. Cette vérification se fait par la parole, sans jamais mettre quelqu’un en danger pour « voir ».' },
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
        {
          t: 'retenir',
          items: [
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
      num: '10',
      title: 'Priorités en jeu de rôle',
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
      id: 'accord',
      num: '11',
      title: 'Revendications et recherche d’une issue',
      blocks: [
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
      num: '12',
      title: 'Le temps et la pression',
      blocks: [
        { t: 'p', text: 'Le temps travaille presque toujours pour toi. Plus la situation dure, plus la tension baisse, plus la personne fatigue, plus le dispositif est prêt. Temporiser n’est pas perdre du temps : c’est travailler.' },
        {
          t: 'liste',
          items: [
            'Ralentir le rythme de tes phrases ralentit celui de la personne.',
            'Reformuler longuement fait passer du temps utilement.',
            'Une demande peut être « transmise », ce qui prend du temps sans être un refus.',
            'Un délai doit être annoncé et respecté : « je te rappelle dans cinq minutes » engage.',
            'Si tu annonces un délai et que tu le dépasses, tu perds la confiance.'
          ]
        },
        { t: 'p', text: 'Attention au sens inverse : une échéance que la personne fixe elle-même (« dans dix minutes je fais une bêtise ») ne se discute pas frontalement. On la contourne en la rendant floue, en parlant d’autre chose d’important pour elle.' },
        {
          t: 'retenir',
          items: [
            'Temporiser est une action, pas une absence d’action.',
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
      num: '13',
      title: 'Erreurs fréquentes',
      blocks: [
        { t: 'p', text: 'La plupart des négociations qui échouent en jeu de rôle échouent pour les mêmes raisons. Les connaître d’avance suffit souvent à les éviter.' },
        {
          t: 'erreurs',
          items: [
            'Parler trop. Si tu parles plus que la personne, tu n’écoutes pas.',
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
            'Tu peux te taire ; tu ne peux pas mentir sur ce qui est vérifiable.',
            'Si tu parles plus qu’elle, tu as déjà perdu le fil.',
            'La confiance se perd une fois et ne revient pas.'
          ]
        }
      ]
    },

    {
      id: 'regles',
      num: '14',
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
      num: '15',
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
      num: '16',
      title: 'Exercices d’entraînement',
      blocks: [
        { t: 'p', text: 'Ces exercices se font à l’écrit avant la mise en situation. Le formateur lit les réponses et corrige la formulation, pas seulement l’idée.' },
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
        }
      ]
    },

    {
      id: 'finale',
      num: '17',
      title: 'Mise en situation finale',
      blocks: [
        {
          t: 'p',
          text: 'La mise en situation finale est jouée avec le formateur. Elle dure une quinzaine de minutes et sert à vérifier que les réflexes tiennent sous pression. Elle est notée dans l’évaluation.'
        },
        {
          t: 'rp',
          text: 'Énoncé à lire au candidat : « Un joueur s’est retranché dans un local commercial après un vol qui a mal tourné. Une employée est à l’intérieur avec lui. Il a appelé lui-même la police. Il parle fort, se dit piégé, et dit qu’il ne veut pas finir en prison. Le périmètre est tenu, un chef de groupe est sur place, tu es désigné négociateur. »'
        },
        {
          t: 'liste',
          items: [
            'Phase 1 — prise de contact et premières informations.',
            'Phase 2 — la personne demande à partir : gestion de la demande.',
            'Phase 3 — la personne fixe une échéance : temporisation.',
            'Phase 4 — ouverture d’une issue et description pas à pas.',
            'Phase 5 — compte rendu final au chef de groupe.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Le formateur observe la posture autant que le contenu.',
            'Une transmission oubliée compte comme une erreur, même si le dialogue est bon.',
            'Une promesse intenable fait échouer la mise en situation.'
          ]
        }
      ]
    },

    {
      id: 'reflexe',
      num: '18',
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
    }
  ],

  // §6 et §10 : évaluation notée sur 100, avec éléments attendus pour la
  // correction assistée. L'examinateur garde la note retenue.
  evaluation: {
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
  }
};
