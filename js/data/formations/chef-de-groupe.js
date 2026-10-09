// Formation Chef de Groupe BAC — ancien parcours (cahier des charges §7).
//
// La page affiche désormais le cours de l'archive V4
// (chef-de-groupe-lecons.js), sans évaluation ni dossier. Ce contenu
// reste pour relire les dossiers FCG clôturés avec l'ancien parcours
// (fiche finale en lecture seule) et pour le catalogue des formations.
//
// Objectif : préparer un agent BAC expérimenté à organiser et diriger un
// groupe en jeu de rôle. Même règle de rédaction que la formation
// négociation — complet sur le fond, simple dans la formulation, et chaque
// notion suivie d'un exemple jouable.
//
// Le contenu reste au niveau organisation, commandement, communication et
// compte rendu, comme le cahier des charges l'impose. On apprend à répartir
// des effectifs, à donner une consigne claire, à tenir une radio et à
// rendre compte — pas une technique d'intervention réelle.

export const REFLEXE_CDG = {
  title: 'FICHE RÉFLEXE CHEF DE GROUPE',
  steps: [
    'ANALYSER',
    'PRIORISER',
    'ORGANISER',
    'DONNER LES CONSIGNES',
    'COORDONNER',
    'CONTRÔLER',
    'ADAPTER',
    'RENDRE COMPTE'
  ]
};

export const CHEF_DE_GROUPE = {
  id: 'formation-cdg',
  module: 'formation-cdg',
  title: 'Formation Chef de Groupe BAC',
  subtitle: 'Brigade Anti-Criminalité 75 N — France Roleplay',
  intro:
    'Tu sais déjà intervenir. Cette formation apprend autre chose : faire '
    + 'intervenir les autres. Organiser une vacation, donner des consignes '
    + 'qu’on comprend du premier coup, tenir une radio, garder une vision '
    + 'd’ensemble quand ça bouge, et rendre compte.',
  reflexe: REFLEXE_CDG,
  image: 'cours-cdg',

  chapters: [
    {
      id: 'role',
      num: '01',
      title: 'Rôle du chef de groupe',
      blocks: [
        { t: 'p', text: 'Le chef de groupe ne fait pas le travail de ses agents : il fait en sorte que le travail soit fait. Son métier est de décider, de répartir, de contrôler et de rendre compte. Dès qu’il met les mains dans l’action, plus personne ne tient la vue d’ensemble.' },
        {
          t: 'table',
          head: ['Un agent', 'Un chef de groupe'],
          rows: [
            ['Exécute une mission', 'Attribue les missions'],
            ['Voit sa partie de la scène', 'Voit la scène entière'],
            ['Rend compte à son chef', 'Rend compte au TN et à la hiérarchie'],
            ['Gère son matériel', 'Gère les effectifs et les moyens'],
            ['Réagit', 'Anticipe et réévalue']
          ]
        },
        { t: 'rp', text: 'Tu es chef de groupe avec six agents. Un appel signale un vol en cours. Si tu pars le premier en courant, tu es le septième agent sur place et le groupe n’a plus de chef. Ton travail est de dire qui part, qui tient quoi, et ce qui doit remonter.' },
        {
          t: 'retenir',
          items: [
            'Un chef qui agit à la place de ses agents cesse de commander.',
            'Ta valeur, c’est la vue d’ensemble : protège-la.',
            'Tout ce que tu décides doit être dit à quelqu’un.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-role-1',
          text: 'Explique en trois phrases à un agent ce que change le passage chef de groupe dans son quotidien.',
          hint: 'Répartir, contrôler, rendre compte.'
        }
      ]
    },

    {
      id: 'posture',
      num: '02',
      title: 'Responsabilités et posture',
      blocks: [
        { t: 'p', text: 'Un chef de groupe est responsable de ce qu’il ordonne et de ce qu’il laisse faire. Son calme est contagieux, sa panique aussi. En jeu de rôle, cela se traduit très concrètement : le ton de ta radio règle le ton de toute la vacation.' },
        {
          t: 'liste',
          items: [
            'Tu assumes les décisions de ton groupe devant la hiérarchie.',
            'Tu ne corriges pas un agent devant tout le monde : tu le reprends après.',
            'Tu dis ce que tu sais et ce que tu ne sais pas — jamais l’inverse.',
            'Tu donnes une consigne, tu vérifies qu’elle est comprise, tu contrôles qu’elle est faite.',
            'Tu protèges tes agents : des ordres clairs, c’est d’abord de la sécurité.'
          ]
        },
        { t: 'p', text: 'La posture couvre aussi la gestion de ta propre fatigue. Un chef qui ne délègue rien tient une heure puis décroche. Déléguer une partie du suivi radio ou le point sur les effectifs n’est pas une faiblesse, c’est de la méthode.' },
        {
          t: 'erreurs',
          items: [
            'Crier sur la radio : tout le monde crie ensuite.',
            'Humilier un agent en public.',
            'Faire semblant de savoir pour ne pas perdre la face.',
            'Donner un ordre sans vérifier qu’il est reçu.',
            'Tout garder pour soi jusqu’à l’épuisement.'
          ]
        }
      ]
    },

    {
      id: 'vacation',
      num: '03',
      title: 'Préparation de la vacation',
      blocks: [
        { t: 'p', text: 'Une vacation se prépare avant le premier appel. Cinq minutes de briefing évitent une heure de flottement. On vérifie qui est là, ce dont on dispose, et on dit ce qu’on attend.' },
        {
          t: 'etapes',
          steps: ['COMPTER LES EFFECTIFS', 'CONSTITUER LES ÉQUIPAGES', 'VÉRIFIER LES MOYENS', 'ANNONCER LES CONSIGNES', 'ANNONCER SA DISPONIBILITÉ AU TN']
        },
        {
          t: 'table',
          head: ['Point du briefing', 'Ce que tu annonces'],
          rows: [
            ['Effectifs', 'Combien d’agents, qui est en doublure, qui débute'],
            ['Équipages', 'Qui avec qui, et quel indicatif chacun porte'],
            ['Dispositif', 'Banalisée ou tenue BAC visible, et pourquoi'],
            ['Consignes du jour', 'Deux ou trois, pas quinze'],
            ['Règles de compte rendu', 'Qui parle à la radio, à quel moment'],
            ['Point de rassemblement', 'Où on se retrouve si ça se disperse']
          ]
        },
        { t: 'rp', text: 'Briefing type : « Vacation à six. Équipage 1 : Martin et Sow. Équipage 2 : Diallo et Bernard. Équipage 3 : avec moi. Tenue visible, on reste joignable. Deux consignes : personne ne descend seul d’un véhicule, et tout contact me remonte avant action. Questions ? »' },
        {
          t: 'retenir',
          items: [
            'Deux ou trois consignes retenues valent mieux que dix oubliées.',
            'Un agent qui débute doit être repéré au briefing, pas sur intervention.',
            'Le briefing finit toujours par « des questions ? ».'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-vac-1',
          text: 'Tu prends une vacation à cinq agents dont un débutant. Rédige ton briefing complet.',
          hint: 'Suis les cinq étapes, et place le débutant avec un ancien.'
        }
      ]
    },

    {
      id: 'communication',
      num: '04',
      title: 'Communication et leadership',
      blocks: [
        { t: 'p', text: 'Une consigne utile tient en une phrase et répond à trois questions : qui, quoi, où. Si elle a besoin d’explications, elle n’est pas encore prête. Et une consigne qui n’est pas répétée par celui qui la reçoit n’est pas une consigne reçue.' },
        {
          t: 'table',
          head: ['Consigne floue', 'Consigne utilisable'],
          rows: [
            ['« Allez voir là-bas »', '« Équipage 2, vous prenez la sortie arrière du bâtiment et vous me dites ce que vous voyez »'],
            ['« Faites attention »', '« Personne ne s’avance tant que je n’ai pas dit go »'],
            ['« Quelqu’un s’en occupe »', '« Martin, tu prends le témoin et tu me fais le signalement »'],
            ['« On y va »', '« Équipage 1 devant, équipage 3 derrière moi, départ maintenant »']
          ]
        },
        { t: 'p', text: 'Le leadership, ici, n’est pas une question d’autorité : c’est la capacité à être compris et suivi sans répéter. Il se gagne en étant clair, constant, et en protégeant ses agents.' },
        { t: 'dialogue', text: '— Équipage 2, tu prends la sortie arrière et tu me décris ce que tu vois. Tu me confirmes ?\n— Équipage 2, bien reçu, sortie arrière, compte rendu à suivre.\n— Parfait.' },
        {
          t: 'retenir',
          items: [
            'Qui, quoi, où — et une seule phrase.',
            'Fais répéter : une consigne non confirmée n’existe pas.',
            'Constant vaut mieux que autoritaire.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-com-1',
          text: 'Transforme ces trois consignes en consignes utilisables : « surveillez », « soyez prêts », « gérez le monde ».',
          hint: 'Nomme l’équipage, l’action et l’endroit.'
        }
      ]
    },

    {
      id: 'decision',
      num: '05',
      title: 'Prise de décision',
      blocks: [
        { t: 'p', text: 'Un chef de groupe décide avec des informations incomplètes. C’est normal, et ce sera toujours le cas. La méthode consiste à trier ce qu’on sait avant de choisir, puis à annoncer la décision clairement.' },
        {
          t: 'etapes',
          steps: ['CE QUI EST ÉTABLI', 'CE QUI EST SUPPOSÉ', 'CE QUI RESTE À VÉRIFIER', 'CE QUI EST URGENT', 'DÉCISION ANNONCÉE']
        },
        { t: 'p', text: 'Une décision tardive coûte souvent plus cher qu’une décision moyenne prise à temps. En revanche, une décision prise sans distinguer le certain du supposé est dangereuse : elle engage le groupe sur une hypothèse.' },
        { t: 'rp', text: 'Un témoin dit qu’un homme est armé, un autre dit que non. Établi : un homme agité, deux versions contradictoires. Supposé : la présence d’une arme. À vérifier : la description précise. Décision : approche prudente, personne ne s’avance seul, demande d’un équipage supplémentaire, et le point reste à confirmer avant toute action.' },
        {
          t: 'retenir',
          items: [
            'Trie toujours : établi, supposé, à vérifier.',
            'Annonce la décision, et dis sur quoi elle repose.',
            'Une décision moyenne à temps vaut mieux qu’une décision parfaite trop tard.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-dec-1',
          text: 'Deux témoins se contredisent sur le nombre d’auteurs. Écris ton tri en trois lignes puis ta décision.',
          hint: 'Le nombre le plus élevé est une hypothèse de travail, pas un fait.'
        }
      ]
    },

    {
      id: 'effectifs',
      num: '06',
      title: 'Gestion des effectifs',
      blocks: [
        { t: 'p', text: 'Répartir des effectifs, c’est accepter de ne pas tout couvrir. On choisit donc en fonction des priorités, et on garde toujours une réserve si l’on peut.' },
        {
          t: 'table',
          head: ['Effectif', 'Répartition raisonnable', 'Réserve'],
          rows: [
            ['4 agents', '2 équipages de 2 : un au contact, un en appui', 'aucune — demander du renfort tôt'],
            ['6 agents', '2 au contact, 2 en bouclage, 2 avec le chef', 'le binôme du chef'],
            ['8 agents', '2 au contact, 2 en bouclage, 2 en recherche, 2 avec le chef', 'le binôme du chef'],
            ['Plus de 8', 'Désigner un adjoint et déléguer un secteur', 'un équipage entier']
          ]
        },
        {
          t: 'liste',
          items: [
            'Jamais un agent seul sur une mission de contact.',
            'Un débutant est toujours avec un ancien.',
            'Un équipage a un indicatif et une seule mission à la fois.',
            'Au-delà de six agents, délègue un secteur à un adjoint.',
            'Tu sais à tout moment où est chaque équipage. Sinon, tu ne commandes plus.'
          ]
        },
        { t: 'p', text: 'Le point d’effectifs se refait à voix haute dès que la situation change : « point : équipage 1 au contact, équipage 2 en bouclage nord, équipage 3 avec moi. Tout le monde est là. »' },
        {
          t: 'erreurs',
          items: [
            'Envoyer tout le monde au même endroit.',
            'Perdre la trace d’un équipage pendant plus de quelques minutes.',
            'Donner deux missions simultanées au même équipage.',
            'Garder une réserve dont personne ne sait qu’elle existe.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-eff-1',
          text: 'Tu as six agents et deux endroits à couvrir, plus un témoin à recueillir. Fais ta répartition et nomme les indicatifs.',
          hint: 'Deux au contact, deux en appui ou bouclage, toi et ton binôme en réserve.'
        }
      ]
    },

    {
      id: 'radio',
      num: '07',
      title: 'Gestion radio',
      blocks: [
        { t: 'p', text: 'La radio est l’outil du chef de groupe. Mal tenue, elle devient un bruit continu où personne n’entend l’essentiel. Bien tenue, elle suffit à commander une scène entière.' },
        {
          t: 'etapes',
          steps: ['QUI PARLE', 'À QUI', 'MESSAGE COURT', 'DEMANDE DE CONFIRMATION']
        },
        {
          t: 'table',
          head: ['Type de message', 'Forme attendue'],
          rows: [
            ['Prise de contact initiale', '« De chef de groupe au TN : vacation à six disponible, secteur pris. »'],
            ['Départ sur intervention', '« De chef de groupe au TN : nous prenons, trois équipages, en route. »'],
            ['Consigne interne', '« Chef de groupe à équipage 2 : sortie arrière, compte rendu. Confirme. »'],
            ['Point de situation', '« Point : deux personnes au contact, périmètre tenu, rien à signaler. »'],
            ['Demande de moyens', '« Demande un équipage supplémentaire et un moyen sanitaire, motif : personne blessée. »'],
            ['Compte rendu final', '« Intervention terminée, une interpellation, aucun blessé parmi les intervenants, nous restons sur place. »']
          ]
        },
        { t: 'p', text: 'Trois règles tiennent toute la gestion radio : un seul message à la fois, un message court, et une confirmation demandée quand la consigne compte. Si la fréquence sature, tu reprends la main en annonçant « silence radio sauf urgence ».' },
        {
          t: 'erreurs',
          items: [
            'Raconter au lieu d’annoncer.',
            'Donner une consigne et ne pas attendre la confirmation.',
            'Laisser trois équipages parler en même temps sans reprendre la main.',
            'Annoncer une position précise quand ce n’est pas nécessaire.',
            'Oublier le compte rendu final : pour le TN, l’intervention n’est alors jamais terminée.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-radio-1',
          text: 'Rédige les quatre messages radio d’une intervention : départ, consigne à un équipage, point de situation, compte rendu final.',
          hint: 'Qui parle, à qui, court, confirmation.'
        }
      ]
    },

    {
      id: 'intervention',
      num: '08',
      title: 'Commandement sur intervention',
      blocks: [
        { t: 'p', text: 'À l’arrivée sur les lieux, le chef de groupe fait toujours la même chose, dans le même ordre. C’est ce qui lui permet de ne rien oublier quand tout parle en même temps.' },
        { t: 'etapes', steps: REFLEXE_CDG.steps },
        {
          t: 'table',
          head: ['Étape', 'Sur place, concrètement'],
          rows: [
            ['ANALYSER', 'Ce que je vois, ce qu’on me dit, ce qui manque'],
            ['PRIORISER', 'Les personnes d’abord, le reste ensuite'],
            ['ORGANISER', 'Qui fait quoi, où, avec qui'],
            ['DONNER LES CONSIGNES', 'Une phrase par équipage, confirmation demandée'],
            ['COORDONNER', 'Faire travailler ensemble, éviter deux équipages au même endroit'],
            ['CONTRÔLER', 'Vérifier que c’est fait, et que tout le monde est là'],
            ['ADAPTER', 'Réévaluer dès qu’une information change'],
            ['RENDRE COMPTE', 'Au TN pendant, à la hiérarchie après']
          ]
        },
        { t: 'rp', text: 'Arrivée sur un cambriolage en cours. « Analyse : véhicule inconnu devant, porte ouverte, personne visible. Priorité : les occupants éventuels. Équipage 1 avec moi devant. Équipage 2, l’arrière, tu me confirmes ce que tu vois avant tout mouvement. Équipage 3, tu restes au véhicule et tu gères les arrivées. Point dans deux minutes. »' },
        {
          t: 'retenir',
          items: [
            'Le même ordre à chaque fois : c’est ce qui tient sous pression.',
            'Un point de situation régulier évite les mauvaises surprises.',
            'Contrôler, ce n’est pas se méfier : c’est faire son travail.'
          ]
        }
      ]
    },

    {
      id: 'coordination',
      num: '09',
      title: 'Coordination avec les autres services',
      blocks: [
        { t: 'p', text: 'Dès qu’un autre service arrive, la question est simple : qui fait quoi, et qui parle à qui. On le règle en une phrase à l’arrivée, pas au milieu de l’action.' },
        {
          t: 'table',
          head: ['Interlocuteur', 'Ce que tu lui donnes', 'Ce que tu lui demandes'],
          rows: [
            ['TN / central', 'Un point court et régulier', 'Les moyens, l’arbitrage'],
            ['Autre unité de police', 'Ta répartition et tes indicatifs', 'La sienne, pour ne pas se gêner'],
            ['Moyens sanitaires', 'Un accès sûr, le nombre et l’état des personnes', 'Le délai, le point de prise en charge'],
            ['Pompiers', 'La nature du risque, un accès dégagé', 'Le périmètre dont ils ont besoin'],
            ['Négociateur', 'Le cadre, les limites, ce qu’il peut annoncer', 'Les informations recueillies'],
            ['Hiérarchie BAC', 'Une synthèse, pas un récit', 'La décision quand elle dépasse ton niveau']
          ]
        },
        { t: 'p', text: 'Deux réflexes évitent la majorité des frictions : annoncer sa propre organisation avant de demander celle des autres, et désigner une seule personne de liaison par service.' },
        {
          t: 'erreurs',
          items: [
            'Laisser deux services travailler au même endroit sans se parler.',
            'Donner des ordres aux agents d’un autre service.',
            'Faire attendre un moyen sanitaire sans lui dire pourquoi.',
            'Multiplier les interlocuteurs : chacun entend une version différente.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-coord-1',
          text: 'Un moyen sanitaire arrive sur une scène encore instable. Que lui dis-tu en deux phrases ?',
          hint: 'Ce qui est sûr, ce qui ne l’est pas, où se mettre en attente.'
        }
      ]
    },

    {
      id: 'degradation',
      num: '10',
      title: 'Gestion d’une situation qui se dégrade',
      blocks: [
        { t: 'p', text: 'Une situation se dégrade rarement d’un coup : elle donne des signes. Les repérer tôt permet de réagir en commandant encore, au lieu de subir.' },
        {
          t: 'liste',
          items: [
            'La fréquence sature, tout le monde parle en même temps.',
            'Un équipage ne répond plus.',
            'Le nombre de personnes présentes augmente vite.',
            'Les informations se contredisent de plus en plus.',
            'Tes consignes ne sont plus confirmées.'
          ]
        },
        { t: 'p', text: 'La réponse est toujours la même : reprendre la main, réduire le nombre d’objectifs, refaire un point d’effectifs, et demander des moyens avant d’en avoir absolument besoin.' },
        {
          t: 'etapes',
          steps: ['SILENCE RADIO SAUF URGENCE', 'POINT D’EFFECTIFS', 'UNE SEULE PRIORITÉ', 'MOYENS DEMANDÉS', 'NOUVELLE CONSIGNE ANNONCÉE']
        },
        { t: 'rp', text: '« Silence radio sauf urgence. Point effectifs, chaque équipage se signale. … Reçu, tout le monde est là. Nouvelle priorité : on ne cherche plus l’auteur, on tient le périmètre et on protège les personnes présentes. Demande deux équipages supplémentaires. »' },
        {
          t: 'retenir',
          items: [
            'Le premier signe de dégradation, c’est une consigne qui n’est plus confirmée.',
            'Quand ça part, réduis le nombre d’objectifs à un seul.',
            'Demande les moyens avant d’en avoir besoin, pas après.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-deg-1',
          text: 'Un de tes équipages ne répond plus depuis deux minutes. Décris tes trois actions suivantes, dans l’ordre.',
          hint: 'La vie des intervenants passe avant la mission en cours.'
        }
      ]
    },

    {
      id: 'majeure',
      num: '11',
      title: 'Gestion d’une situation majeure',
      blocks: [
        { t: 'p', text: 'Une situation majeure dépasse les moyens d’une vacation : beaucoup de personnes, plusieurs services, une durée longue. Le chef de groupe n’est alors plus seul à décider, et son travail devient surtout d’organiser et de rendre compte.' },
        {
          t: 'liste',
          items: [
            'Dire tôt que la situation dépasse tes moyens. Ce n’est pas un échec, c’est une information.',
            'Découper en secteurs, et nommer un responsable par secteur.',
            'Tenir un point de situation régulier, à heure fixe si possible.',
            'Garder une trace : qui est où, ce qui a été demandé, ce qui a été reçu.',
            'Préparer la relève : une situation longue épuise les agents.'
          ]
        },
        {
          t: 'table',
          head: ['Ce qui change', 'Conséquence pour toi'],
          rows: [
            ['Plusieurs services', 'Une seule personne de liaison par service'],
            ['Durée longue', 'Prévoir relève, eau, points réguliers'],
            ['Hiérarchie sur place', 'Tu proposes, elle arbitre — et tu continues de commander ton groupe'],
            ['Beaucoup de public', 'Un équipage dédié, uniquement à ça'],
            ['Beaucoup d’informations', 'Quelqu’un chargé de noter, sinon tout se perd']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Annoncer tôt que ça dépasse tes moyens est un acte de commandement.',
            'Découpe en secteurs et délègue : un seul chef ne tient pas une grande scène.',
            'Sans trace écrite, une situation longue devient incompréhensible.'
          ]
        }
      ]
    },

    {
      id: 'erreurs',
      num: '12',
      title: 'Erreurs de commandement',
      blocks: [
        { t: 'p', text: 'Les erreurs de commandement se répètent toujours les mêmes, et elles coûtent plus cher que les erreurs techniques : elles touchent tout le groupe à la fois.' },
        {
          t: 'erreurs',
          items: [
            'Faire soi-même au lieu de faire faire : tu perds la vue d’ensemble.',
            'Donner un ordre flou puis reprocher l’exécution.',
            'Envoyer tout le monde au même endroit.',
            'Ne pas demander de confirmation.',
            'Oublier un équipage.',
            'Refuser de demander des renforts par orgueil.',
            'Changer de plan toutes les trente secondes.',
            'Ne jamais faire de point de situation.',
            'Décider sur une information supposée en la traitant comme un fait.',
            'Oublier le compte rendu final.',
            'Reprendre un agent devant les autres.',
            'Garder une information importante pour « ne pas inquiéter ».'
          ]
        },
        { t: 'rp', text: 'Erreur typique en jeu : le chef de groupe part au contact avec le premier équipage. Deux minutes après, un autre équipage demande une consigne et personne ne répond, parce que le chef est occupé à agir. La scène se disperse et plus rien n’est coordonné.' },
        {
          t: 'retenir',
          items: [
            'Une consigne floue est une faute du chef, pas de l’agent.',
            'Demander du renfort tôt est un signe de maîtrise.',
            'Changer de plan sans l’annoncer vaut ne pas avoir de plan.'
          ]
        }
      ]
    },

    {
      id: 'debriefing',
      num: '13',
      title: 'Débriefing de fin d’intervention',
      blocks: [
        { t: 'p', text: 'Le débriefing dure cinq minutes et se fait à chaud, juste après. Il ne sert pas à désigner un coupable : il sert à ce que la vacation suivante soit meilleure.' },
        {
          t: 'etapes',
          steps: ['TOUT LE MONDE EST LÀ', 'CE QUI S’EST PASSÉ', 'CE QUI A BIEN FONCTIONNÉ', 'CE QUI A MANQUÉ', 'CE QU’ON CHANGE', 'COMPTE RENDU']
        },
        {
          t: 'liste',
          items: [
            'Commence par le point d’effectifs et l’état de chacun.',
            'Fais parler les agents avant de donner ton avis.',
            'Un point positif nommé pour chaque point à corriger.',
            'Les reproches individuels se font en tête-à-tête, pas en groupe.',
            'Termine par une décision concrète pour la prochaine fois.'
          ]
        },
        { t: 'rp', text: '« Tout le monde est là, personne n’est blessé. Ce qui a marché : le bouclage a été tenu sans qu’on ait à le redire. Ce qui a manqué : j’ai donné une consigne sans la faire confirmer, et l’équipage 2 est parti sur autre chose. La prochaine fois, je fais répéter. Compte rendu transmis. »' },
        {
          t: 'retenir',
          items: [
            'Le débriefing commence par les effectifs et l’état des agents.',
            'Le chef cite ses propres erreurs : c’est ce qui rend l’exercice crédible.',
            'Il se termine par une décision, pas par un constat.'
          ]
        },
        {
          t: 'exercice',
          id: 'cdg-deb-1',
          text: 'Rédige un débriefing complet d’une intervention qui s’est bien passée malgré une consigne mal comprise.',
          hint: 'Suis les six étapes, et reconnais ta part.'
        }
      ]
    },

    {
      id: 'exercices',
      num: '14',
      title: 'Exercices pratiques',
      blocks: [
        { t: 'p', text: 'À faire à l’écrit, puis à rejouer à l’oral avec le formateur. Ce qui est noté, c’est la clarté : un correcteur doit pouvoir exécuter ta consigne sans te poser de question.' },
        {
          t: 'exercice',
          id: 'cdg-ex-1',
          text: 'Vacation à six, appel pour une agression avec fuite à pied dans une rue très fréquentée. Donne ta répartition et tes trois premières consignes radio.',
          hint: 'Contact, bouclage, réserve. Une phrase par équipage.'
        },
        {
          t: 'exercice',
          id: 'cdg-ex-2',
          text: 'Vacation à quatre, cambriolage en cours, véhicule inconnu devant le domicile. Que vérifies-tu avant d’engager, et comment engages-tu ?',
          hint: 'Établi, supposé, à vérifier — puis une consigne par équipage.'
        },
        {
          t: 'exercice',
          id: 'cdg-ex-3',
          text: 'En pleine intervention, un équipage signale un collègue en difficulté. Écris tes consignes des deux premières minutes.',
          hint: 'Priorité absolue, réorganisation, moyens, compte rendu.'
        },
        {
          t: 'exercice',
          id: 'cdg-ex-4',
          text: 'La fréquence sature et deux équipages se contredisent. Reprends la main en quatre messages radio.',
          hint: 'Silence radio, point d’effectifs, une seule priorité, nouvelle consigne.'
        },
        {
          t: 'exercice',
          id: 'cdg-ex-5',
          text: 'L’intervention est terminée. Rédige ton compte rendu au TN puis ton débriefing au groupe.',
          hint: 'Court pour le TN, structuré pour le groupe.'
        }
      ]
    },

    {
      id: 'reflexe',
      num: '15',
      title: 'Fiche réflexe Chef de Groupe',
      blocks: [
        { t: 'p', text: 'À connaître par cœur. C’est l’ordre de travail sur toute intervention, et le point de retour quand la scène échappe.' },
        { t: 'etapes', steps: REFLEXE_CDG.steps },
        {
          t: 'table',
          head: ['Étape', 'La question que tu te poses'],
          rows: [
            ['ANALYSER', 'Qu’est-ce qui est sûr, supposé, inconnu ?'],
            ['PRIORISER', 'Qu’est-ce qui ne peut pas attendre ?'],
            ['ORGANISER', 'Qui fait quoi, où, avec qui ?'],
            ['DONNER LES CONSIGNES', 'Est-ce qu’on m’a confirmé ?'],
            ['COORDONNER', 'Est-ce que deux équipages se gênent ?'],
            ['CONTRÔLER', 'Est-ce fait, et tout le monde est-il là ?'],
            ['ADAPTER', 'Qu’est-ce qui a changé depuis ma dernière décision ?'],
            ['RENDRE COMPTE', 'Le TN et ma hiérarchie savent-ils où j’en suis ?']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Perdu sur une scène ? Reviens à ANALYSER puis PRIORISER.',
            'CONTRÔLER est l’étape la plus souvent oubliée.',
            'RENDRE COMPTE n’est pas la fin : ça se fait pendant aussi.'
          ]
        }
      ]
    },

    {
      id: 'evaluation',
      num: '16',
      title: 'Évaluation finale',
      blocks: [
        { t: 'p', text: 'La formation se termine par une évaluation écrite notée sur 100, corrigée par le formateur. Elle vérifie que les réflexes sont là, pas que les mots sont appris par cœur.' },
        {
          t: 'liste',
          items: [
            'Dix questions courtes, en français simple, sans piège.',
            'Chaque réponse reçoit une note suggérée par le site et une note retenue par le formateur.',
            'La note retenue est toujours celle du formateur.',
            'Un résultat validé ouvre l’accès à l’examen de qualification Chef de Groupe.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'La formation prépare ; l’examen de qualification décide.',
            'Une formation validée reste au dossier de l’agent dans l’historique central.'
          ]
        }
      ]
    }
  ],

  evaluation: {
    max: 100,
    duration: 'environ 30 minutes',
    questions: [
      {
        id: 'ev-1',
        max: 10,
        q: 'Quelle est la différence entre un agent et un chef de groupe ?',
        attendu: [
          'le chef attribue les missions, il ne les exécute pas',
          'il garde la vue d’ensemble',
          'il rend compte au TN et à la hiérarchie',
          'il gère les effectifs et les moyens'
        ]
      },
      {
        id: 'ev-2',
        max: 10,
        q: 'Cite les étapes de la fiche réflexe Chef de Groupe, dans l’ordre.',
        attendu: REFLEXE_CDG.steps
      },
      {
        id: 'ev-3',
        max: 10,
        q: 'Que contient un briefing de vacation ?',
        attendu: [
          'effectifs comptés',
          'équipages constitués avec indicatifs',
          'moyens vérifiés',
          'deux ou trois consignes',
          'règles de compte rendu',
          'disponibilité annoncée au TN'
        ]
      },
      {
        id: 'ev-4',
        max: 10,
        q: 'Qu’est-ce qu’une consigne utilisable ? Donne un exemple.',
        attendu: [
          'qui, quoi, où',
          'une seule phrase',
          'confirmation demandée',
          'un exemple nommant un équipage, une action et un lieu'
        ]
      },
      {
        id: 'ev-5',
        max: 10,
        q: 'Comment décides-tu avec des informations incomplètes ?',
        attendu: [
          'trier établi, supposé, à vérifier',
          'identifier l’urgent',
          'annoncer la décision et ce sur quoi elle repose',
          'ne pas traiter une hypothèse comme un fait'
        ]
      },
      {
        id: 'ev-6',
        max: 10,
        q: 'Avec six agents, comment répartis-tu, et que gardes-tu en réserve ?',
        attendu: [
          'deux au contact',
          'deux en bouclage',
          'deux avec le chef',
          'jamais un agent seul',
          'un débutant avec un ancien',
          'réserve : le binôme du chef'
        ]
      },
      {
        id: 'ev-7',
        max: 10,
        q: 'Donne la forme d’un message radio de départ et d’un compte rendu final.',
        attendu: [
          'qui parle, à qui',
          'message court',
          'départ : nombre d’équipages, en route',
          'final : résultat, blessés, ce que devient le dispositif'
        ]
      },
      {
        id: 'ev-8',
        max: 10,
        q: 'Quels signes montrent qu’une situation se dégrade, et que fais-tu ?',
        attendu: [
          'fréquence saturée',
          'un équipage qui ne répond plus',
          'consignes non confirmées',
          'informations contradictoires',
          'silence radio sauf urgence',
          'point d’effectifs',
          'une seule priorité',
          'demander des moyens'
        ]
      },
      {
        id: 'ev-9',
        max: 10,
        q: 'Cite cinq erreurs de commandement et dis pourquoi elles coûtent cher.',
        attendu: [
          'faire au lieu de faire faire',
          'consigne floue',
          'tout le monde au même endroit',
          'pas de confirmation',
          'oublier un équipage',
          'refuser le renfort',
          'pas de point de situation',
          'oublier le compte rendu'
        ]
      },
      {
        id: 'ev-10',
        max: 10,
        q: 'Comment mènes-tu un débriefing de fin d’intervention ?',
        attendu: [
          'point d’effectifs et état de chacun',
          'faire parler les agents d’abord',
          'ce qui a marché, ce qui a manqué',
          'reproches individuels en tête-à-tête',
          'terminer par une décision concrète',
          'compte rendu transmis'
        ]
      }
    ]
  }
};
