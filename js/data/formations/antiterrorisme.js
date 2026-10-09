// Formation Antiterrorisme BAC — reprise du module V4
// (modules/formation-antiterrorisme.html), mis au format des données de cours.
//
// Règle de rédaction imposée par le cahier des charges : complet sur le
// fond, simple dans la formulation. Le contenu du module d'origine est repris
// tel quel, chapitre par chapitre, sans rien ajouter sur le plan tactique.
//
// Tout reste au niveau organisation, observation, transmission, protection,
// coordination et jeu de rôle. Aucune technique d'assaut, de franchissement,
// de neutralisation ou d'emploi tactique des armes n'est enseignée ici :
// c'est une formation de serveur de jeu, et les contenus sont écrits pour
// être joués.
//
// Types de blocs reconnus par la vue de cours (js/pages/formations/cours.js) :
//   p        paragraphe
//   liste    liste à puces
//   rp       exemple de jeu de rôle
//   dialogue échange type, une réplique par ligne
//   retenir  encadré « À RETENIR »
//   erreurs  encadré « ERREURS À ÉVITER »
//   etapes   enchaînement de la fiche réflexe
//   table    tableau simple
//   exercice question d'entraînement, avec champ de réponse

export const REFLEXE_ANTITERRORISME = {
  title: 'FICHE RÉFLEXE ANTITERRORISME',
  steps: [
    'OBSERVER',
    'LOCALISER',
    'QUALIFIER',
    'TRANSMETTRE',
    'PROTÉGER',
    'ACTUALISER',
    'COORDONNER',
    'PASSER LE RELAIS'
  ]
};

export const ANTITERRORISME = {
  id: 'antiterrorisme',
  module: 'antiterrorisme',
  title: 'Formation Antiterrorisme BAC',
  subtitle: 'Brigade Anti-Criminalité 75 N — France Roleplay',
  intro:
    'Primo-intervenir, protéger, transmettre, coordonner. Cette formation '
    + 'apprend la place d’un équipage BAC dans les premières minutes d’une '
    + 'attaque grave : observer, transmettre une information fiable, protéger '
    + 'le public et passer le relais aux unités spécialisées. Elle ne porte sur '
    + 'aucune technique d’assaut.',
  reflexe: REFLEXE_ANTITERRORISME,
  image: 'cours-antiterrorisme',

  chapters: [
    {
      id: 'bataclan',
      num: '01',
      title: 'Bataclan — 13 novembre 2015',
      blocks: [
        { t: 'p', text: 'La BAC 75 N parmi les tout premiers intervenants.' },
        { t: 'p', text: 'Le soir du 13 novembre 2015, la BAC de nuit de Paris fait partie des tout premiers services engagés au Bataclan. Les travaux parlementaires consacrés aux attentats retiennent l’intervention d’un commissaire de la BAC 75 N, accompagné de son équipier, qui pénètre dans la salle alors que la tuerie est encore en cours et neutralise l’un des trois terroristes.' },
        {
          t: 'retenir',
          items: [
            'Fait historique : la formulation utilisée dans la formation est volontairement précise — la BAC 75 N est primo-intervenante et l’un de ses commissaires neutralise un des trois terroristes.',
            'La réduction définitive de la crise intervient ensuite avec la montée en puissance des unités spécialisées.'
          ]
        },
        {
          t: 'table',
          head: ['Notion', 'Ce qu’elle recouvre'],
          rows: [
            ['Primo-intervention', 'Arriver, comprendre et rendre compte dans une situation extrêmement évolutive.'],
            ['Protection', 'Contribuer à limiter l’exposition du public et à la prise en compte des victimes.'],
            ['Relais', 'Transmettre une situation exploitable au commandement et aux unités spécialisées.']
          ]
        },
        { t: 'p', text: 'Pourquoi cet épisode ouvre la formation ? Parce qu’il illustre la place particulière d’un équipage de terrain lorsqu’une attaque grave se déroule avant l’arrivée complète des moyens spécialisés : la première réponse doit être rapide, factuelle, coordonnée et orientée vers la sauvegarde des vies.' },
        {
          t: 'retenir',
          items: [
            'Principe : être primo-intervenant ne signifie pas se substituer au RAID, à la BRI ou au GIGN.',
            'La formation distingue clairement la première réponse, la montée en puissance et l’intervention spécialisée.'
          ]
        }
      ]
    },

    {
      id: 'primo',
      num: '02',
      title: 'Primo-intervention et rôle BAC 75 N',
      blocks: [
        { t: 'p', text: 'Comprendre sa place dans la chaîne de réponse.' },
        { t: 'p', text: 'Dans une crise potentiellement terroriste, la valeur de la BAC repose sur sa présence immédiate sur le terrain, sa capacité à observer, transmettre, protéger et faciliter l’action coordonnée des moyens qui montent en puissance.' },
        { t: 'etapes', steps: REFLEXE_ANTITERRORISME.steps },
        { t: 'p', text: 'Missions pédagogiques du primo-intervenant :' },
        {
          t: 'liste',
          items: [
            'Prendre en compte l’événement et préciser le lieu.',
            'Distinguer ce qui est vu, ce qui est rapporté par un témoin et ce qui reste non confirmé.',
            'Faire remonter les victimes connues, l’évolution et les besoins immédiats.',
            'Contribuer à protéger le public et à préserver les accès utiles aux secours.',
            'Actualiser TN 75 lorsqu’un élément important change.',
            'Préparer un passage de relais synthétique au commandement ou à l’unité spécialisée.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Limite à connaître : la formation BAC ne reproduit pas les techniques spécialisées d’assaut, de franchissement, de neutralisation ou d’emploi tactique des armes.'
          ]
        }
      ]
    },

    {
      id: 'bac-psig',
      num: '03',
      title: 'Après 2015 — plan BAC-PSIG',
      blocks: [
        { t: 'p', text: 'Renforcement de la formation, de la protection et des moyens.' },
        { t: 'p', text: 'Après les attentats de 2015, le ministère de l’Intérieur renforce les BAC et les PSIG autour de trois axes : formation, équipements supplémentaires et évolution de la réponse aux tueries de masse.' },
        {
          t: 'table',
          head: ['Axe', 'Élément retenu dans la formation'],
          rows: [
            ['Formation', 'Renforcement de la formation initiale et continue, avec davantage de mises en situation.'],
            ['Protection', 'Renforcement des protections balistiques mises à disposition des unités concernées.'],
            ['Armement', 'Le plan public de 2016 prévoit notamment la dotation de HK G36 pour des équipages BAC après formation au maniement.'],
            ['Doctrine', 'Capacité de première réponse renforcée face aux attaques graves, avant la montée en puissance spécialisée.']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Le renforcement des moyens ne transforme pas la BAC en RAID, BRI ou GIGN : il améliore sa capacité à faire face aux premières minutes d’une crise grave.'
          ]
        }
      ]
    },

    {
      id: 'unites',
      num: '04',
      title: 'RAID · BRI · GIGN',
      blocks: [
        { t: 'p', text: 'Repères institutionnels et complémentarité.' },
        {
          t: 'table',
          head: ['Unité', 'Repère'],
          rows: [
            ['RAID', 'Unité spécialisée de la Police nationale intervenant notamment dans les crises graves et contribuant à la lutte antiterroriste.'],
            ['BRI', 'Unité combinant investigation et intervention. À Paris, la BRI-PP dispose d’une capacité de haute intensité et peut constituer la BRI-UCT.'],
            ['GIGN', 'Unité de la Gendarmerie nationale dédiée notamment au contre-terrorisme et à la gestion des crises extrêmes.']
          ]
        },
        { t: 'p', text: 'Complémentarité : le Schéma national d’intervention organise la complémentarité et la coordination des forces. La formation apprend donc à préparer l’arrivée des moyens spécialisés, à transmettre une situation claire et à poursuivre la mission attribuée une fois la relève effectuée.' },
        {
          t: 'retenir',
          items: [
            'BRI-UCT : les informations publiques de la Police nationale indiquent que la montée en puissance de la BRI-PP peut intégrer l’appui d’autres unités de la Préfecture de police, notamment la BACN 75.',
            'Négociation : c’est une capacité clairement documentée au sein de dispositifs spécialisés. Elle n’est pas présentée ici comme une qualification générale de tous les personnels BAC 75 N.'
          ]
        }
      ]
    },

    {
      id: 'detection',
      num: '05',
      title: 'Détection, observation et signalement',
      blocks: [
        { t: 'p', text: 'Construire une information fiable.' },
        { t: 'p', text: 'Dans une situation confuse, le premier objectif est d’éviter que des hypothèses deviennent des certitudes. Une transmission utile doit préciser la source de l’information.' },
        {
          t: 'table',
          head: ['Source', 'Définition'],
          rows: [
            ['Fait observé', 'Élément directement vu ou entendu par l’équipage.'],
            ['Témoignage', 'Élément rapporté par une personne identifiée ou présente sur place.'],
            ['Non confirmé', 'Information relayée mais pas encore vérifiée.']
          ]
        },
        { t: 'p', text: 'Éléments utiles à relever :' },
        {
          t: 'liste',
          items: [
            'Localisation précise et zone concernée.',
            'Nature des faits réellement constatés.',
            'Nombre approximatif de personnes concernées lorsque cela peut être estimé.',
            'Victimes signalées ou visibles.',
            'Direction ou évolution générale de l’événement.',
            'Changement majeur depuis le dernier message.'
          ]
        },
        {
          t: 'erreurs',
          items: [
            'Un comportement inhabituel ou une information partielle ne permet pas, à lui seul, de qualifier une menace de terroriste.'
          ]
        }
      ]
    },

    {
      id: 'transmission',
      num: '06',
      title: 'Transmission et compte rendu initial',
      blocks: [
        { t: 'p', text: 'Un message court, factuel et exploitable.' },
        { t: 'p', text: 'Le premier message doit donner au centre radio et au commandement une image suffisamment claire pour engager les moyens adaptés sans saturer le réseau.' },
        { t: 'etapes', steps: ['1 · LIEU', '2 · FAITS', '3 · OBSERVÉ', '4 · VICTIMES', '5 · BESOINS', '6 · ÉVOLUTION'] },
        { t: 'rp', text: 'Exemple pédagogique : « TN 75 de BAC 75 N Alpha, sur secteur [lieu], plusieurs appels concordants pour violences graves en cours. Nous constatons [faits observés]. Présence de victimes signalée. Demandons moyens adaptés et maintien du réseau disponible. Nous actualisons. »' },
        { t: 'p', text: 'Discipline de transmission :' },
        {
          t: 'liste',
          items: [
            'Parler clairement et brièvement.',
            'Ne transmettre que les éléments utiles à la compréhension et à la décision.',
            'Signaler explicitement ce qui n’est pas confirmé.',
            'Actualiser lorsqu’un élément important évolue plutôt que répéter le même message.'
          ]
        }
      ]
    },

    {
      id: 'zonage',
      num: '07',
      title: 'Protection, zonage et accès',
      blocks: [
        { t: 'p', text: 'Créer les conditions d’une réponse coordonnée.' },
        { t: 'p', text: 'La protection vise à limiter l’exposition du public et à conserver des conditions permettant l’arrivée des secours, du commandement et des unités spécialisées.' },
        {
          t: 'liste',
          items: [
            'Éloigner le public de la zone dangereuse lorsque cela peut être fait sans créer une nouvelle exposition.',
            'Éviter les attroupements et préserver les axes utiles aux moyens engagés.',
            'Faire remonter les accès praticables, obstacles visibles et changements importants.',
            'Ne pas manipuler un objet suspect ; le signaler et appliquer les consignes reçues.',
            'Maintenir une discipline radio et limiter les informations inutiles.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Objectif : public protégé, information fiable, accès préservés et commandement clairement identifié.'
          ]
        }
      ]
    },

    {
      id: 'victimes',
      num: '08',
      title: 'Victimes, témoins et informations',
      blocks: [
        { t: 'p', text: 'Secourir sans perdre la qualité du renseignement.' },
        {
          t: 'liste',
          items: [
            'Faire déclencher ou confirmer la prise en compte des secours.',
            'Orienter les personnes capables de se déplacer vers la zone indiquée par le commandement, sans les exposer davantage.',
            'Identifier les témoins ayant vu directement les faits et conserver les éléments utiles selon les procédures applicables.',
            'Éviter la diffusion publique d’informations sensibles ou non vérifiées.',
            'Préserver les éléments utiles à l’enquête sans retarder les gestes de secours indispensables.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Priorité : la sauvegarde des vies reste prioritaire.',
            'La préservation des informations et éléments utiles ne doit pas retarder une prise en charge urgente.'
          ]
        }
      ]
    },

    {
      id: 'relais',
      num: '09',
      title: 'Coordination et passage de relais',
      blocks: [
        { t: 'p', text: 'Donner une situation exploitable à l’échelon suivant.' },
        { t: 'p', text: 'À l’arrivée d’un échelon de commandement ou d’une unité spécialisée, le passage de relais doit être rapide et structuré.' },
        { t: 'etapes', steps: ['SITUATION', 'CONFIRMÉ', 'INCERTAIN', 'VICTIMES', 'MOYENS', 'ACCÈS', 'ÉVOLUTION', 'MISSION RESTANTE'] },
        {
          t: 'liste',
          items: [
            'Situation générale et localisation exacte.',
            'Faits confirmés et éléments restant à vérifier.',
            'Victimes connues et témoins identifiés.',
            'Moyens déjà engagés ou demandés.',
            'Accès utiles et secteurs déjà pris en compte.',
            'Dernière évolution connue.',
            'Mission actuellement tenue par l’équipage BAC.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Après la relève : poursuivre la mission attribuée par le commandement et éviter les initiatives contradictoires.'
          ]
        }
      ]
    },

    {
      id: 'degradees',
      num: '10',
      title: 'Situations dégradées et discipline',
      blocks: [
        { t: 'p', text: 'Rester précis lorsque la situation devient confuse.' },
        {
          t: 'table',
          head: ['Situation', 'Réponse attendue'],
          rows: [
            ['Informations contradictoires', 'Signaler la contradiction, identifier la source et ne pas choisir arbitrairement une version.'],
            ['Plusieurs sites signalés', 'Faire remonter immédiatement le caractère potentiellement multisite et respecter la répartition du commandement.'],
            ['Réseau saturé', 'Messages courts, priorité aux informations nouvelles et urgentes, pas de répétition inutile.'],
            ['Objet suspect', 'Ne pas manipuler ; signaler, éloigner le public et appliquer les consignes reçues.'],
            ['Auteur non localisé', 'Ne pas transformer une description partielle en certitude ; actualiser les éléments connus.']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Discipline : dans une crise de haute intensité, une information fausse ou ambiguë peut désorganiser plusieurs équipages.',
            'La précision compte autant que la vitesse.'
          ]
        }
      ]
    },

    {
      id: 'exercices',
      num: '11',
      title: 'Exercices pratiques',
      blocks: [
        { t: 'p', text: 'Analyse, communication, protection et coordination.' },
        {
          t: 'exercice',
          id: 'ex-a',
          text: 'A — Signalement initial. Plusieurs appels évoquent un individu au comportement inquiétant près d’un lieu fréquenté. Distinguer faits, témoignages et hypothèses puis produire un premier message.'
        },
        {
          t: 'exercice',
          id: 'ex-b',
          text: 'B — Violences graves en cours. Arrivée sur un secteur confus avec victimes et témoins. Prioriser localisation, faits, secours, protection et information du centre.'
        },
        {
          t: 'exercice',
          id: 'ex-c',
          text: 'C — Objet suspect. Expliquer ce qui doit être transmis, ce qui ne doit pas être manipulé et comment préserver l’espace en attendant les consignes.'
        },
        {
          t: 'exercice',
          id: 'ex-d',
          text: 'D — Événements multiples. Deux événements sont signalés presque simultanément. Ne pas conclure trop vite à un lien et respecter la coordination du commandement.'
        },
        {
          t: 'exercice',
          id: 'ex-e',
          text: 'E — Relève spécialisée. Réaliser en soixante secondes un passage de relais structuré et complet.'
        },
        {
          t: 'retenir',
          items: [
            'Périmètre : aucune technique d’assaut spécialisée n’est enseignée ou évaluée dans ces exercices.'
          ]
        }
      ]
    },

    {
      id: 'finale',
      num: '12',
      title: 'Mise en situation finale',
      blocks: [
        { t: 'p', text: 'Évaluer le raisonnement et la coordination.' },
        {
          t: 'rp',
          text: 'Scénario : « En début de vacation, plusieurs appels signalent des violences graves dans un secteur fréquenté. Les informations sont partielles et évoluent. Des victimes sont signalées, un témoin fournit une description, puis un second événement est annoncé à proximité. Des moyens spécialisés sont engagés. »'
        },
        {
          t: 'liste',
          items: [
            '1. Prise en compte et premier message.',
            '2. Arrivée et séparation faits / témoignages / incertitudes.',
            '3. Protection du public et demande des moyens utiles.',
            '4. Gestion d’informations contradictoires et discipline radio.',
            '5. Prise en compte des victimes et témoins.',
            '6. Arrivée d’un échelon spécialisé et passage de relais.',
            '7. Compte rendu final et débriefing.'
          ]
        },
        {
          t: 'retenir',
          items: [
            'Attendu : le stagiaire est évalué sur sa capacité à comprendre, transmettre, protéger, coordonner et passer le relais — pas sur une tactique d’assaut.'
          ]
        }
      ]
    },

    {
      id: 'evaluation',
      num: '13',
      title: 'Évaluation finale /100',
      blocks: [
        { t: 'p', text: 'Valider les acquis de la formation. L’évaluation est notée sur 100 et suit le barème du module : une question par critère, chacune notée selon son poids.' },
        { t: 'p', text: 'Le portail propose une note et dit sur quoi il s’appuie : éléments attendus retrouvés dans ta réponse, éléments manquants. Cette note est une suggestion. Le formateur garde la note retenue et peut s’en écarter dans les deux sens.' },
        {
          t: 'table',
          head: ['Critère', 'Barème'],
          rows: [
            ['Cadre, histoire et rôle de la BAC 75 N', '/15'],
            ['Analyse et qualification de la situation', '/20'],
            ['Transmission / compte rendu', '/20'],
            ['Protection / organisation initiale', '/15'],
            ['Victimes / témoins', '/10'],
            ['Coordination / passage de relais', '/10'],
            ['Mise en situation finale', '/10'],
            ['TOTAL', '/100']
          ]
        },
        {
          t: 'retenir',
          items: [
            'Sept critères, 100 points.',
            'Réponds par des phrases : une réponse en trois mots ne montre rien.',
            'La note du portail est une suggestion ; la décision est celle du formateur.'
          ]
        }
      ]
    },

    {
      id: 'reflexe',
      num: '14',
      title: 'Fiche réflexe antiterrorisme',
      blocks: [
        { t: 'p', text: 'À retenir par cœur : l’enchaînement de la première réponse, du premier regard jusqu’au passage de relais.' },
        { t: 'etapes', steps: REFLEXE_ANTITERRORISME.steps },
        { t: 'p', text: 'Les 5 questions à se poser :' },
        {
          t: 'liste',
          items: [
            '1. Qu’est-ce qui est certain ?',
            '2. Où se situe précisément l’événement ?',
            '3. Qui est exposé ou blessé ?',
            '4. Quels moyens sont déjà engagés ?',
            '5. Quelle information nouvelle doit remonter maintenant ?'
          ]
        }
      ]
    }
  ],

  // Évaluation notée sur 100 : la grille de critères du module V4 est
  // convertie en questions ouvertes, une par critère, au même barème
  // (15 + 20 + 20 + 15 + 10 + 10 + 10). Les éléments attendus servent à la
  // correction assistée ; l'examinateur garde la note retenue.
  evaluation: {
    max: 100,
    duration: 'environ 30 minutes',
    questions: [
      {
        id: 'ev-1',
        max: 15,
        q: 'Cadre, histoire et rôle de la BAC 75 N : que retient-on du 13 novembre 2015, et quelle est la place de la BAC face au RAID, à la BRI et au GIGN ?',
        attendu: [
          'Bataclan, 13 novembre 2015',
          'BAC 75 N primo-intervenante',
          'un commissaire neutralise un des trois terroristes',
          'plan BAC-PSIG : formation, protection, équipements',
          'ne se substitue pas au RAID, à la BRI ou au GIGN',
          'Schéma national d’intervention, complémentarité'
        ]
      },
      {
        id: 'ev-2',
        max: 20,
        q: 'Analyse et qualification de la situation : comment construis-tu une information fiable dans une situation confuse ?',
        attendu: [
          'fait observé',
          'témoignage',
          'non confirmé',
          'préciser la source',
          'localisation précise',
          'ne pas transformer une hypothèse en certitude',
          'comportement inhabituel ne suffit pas à qualifier de terroriste'
        ]
      },
      {
        id: 'ev-3',
        max: 20,
        q: 'Transmission / compte rendu : rédige le premier message à TN 75 et cite les règles de discipline de transmission.',
        attendu: [
          'lieu, faits, observé, victimes, besoins, évolution',
          'message court et factuel',
          'signaler ce qui n’est pas confirmé',
          'demander les moyens adaptés',
          'ne pas saturer le réseau',
          'actualiser plutôt que répéter'
        ]
      },
      {
        id: 'ev-4',
        max: 15,
        q: 'Protection / organisation initiale : que fais-tu pour protéger le public et préserver les accès ?',
        attendu: [
          'éloigner le public sans nouvelle exposition',
          'éviter les attroupements',
          'préserver les axes et accès utiles aux secours',
          'faire remonter accès et obstacles',
          'ne pas manipuler un objet suspect',
          'discipline radio'
        ]
      },
      {
        id: 'ev-5',
        max: 10,
        q: 'Victimes / témoins : comment prends-tu en compte les victimes et les témoins sans perdre la qualité du renseignement ?',
        attendu: [
          'déclencher ou confirmer les secours',
          'orienter vers la zone indiquée par le commandement',
          'identifier les témoins directs',
          'pas de diffusion d’informations non vérifiées',
          'sauvegarde des vies prioritaire',
          'préserver les éléments sans retarder les secours'
        ]
      },
      {
        id: 'ev-6',
        max: 10,
        q: 'Coordination / passage de relais : réalise un passage de relais structuré à l’arrivée d’une unité spécialisée.',
        attendu: [
          'situation et localisation exacte',
          'confirmé et incertain',
          'victimes et témoins',
          'moyens engagés ou demandés',
          'accès et secteurs pris en compte',
          'évolution et mission restante',
          'poursuivre la mission attribuée après la relève'
        ]
      },
      {
        id: 'ev-7',
        max: 10,
        q: 'Mise en situation finale — appréciation d’ensemble de l’examinateur.',
        attendu: [
          'premier message clair',
          'séparation faits / témoignages / incertitudes',
          'protection du public',
          'gestion des informations contradictoires',
          'victimes et témoins pris en compte',
          'passage de relais et compte rendu final',
          'aucune tactique d’assaut'
        ]
      }
    ]
  }
};
