// Formation Antiterrorisme BAC — le module de l'archive V4
// (modules/formation-antiterrorisme.html), tel quel.
//
// Le module d'origine est un cours en treize chapitres, sans identité,
// sans évaluation à saisir ni fiche finale : c'est tout ce que la page
// présente. Le texte est celui de l'archive, mot pour mot, balises
// comprises ; seules les classes portent le préfixe `at-` pour rester
// rangées sous `.m-anti` (css/pages/formation-antiterrorisme.css).
//
//   num, title, subtitle   bannière du chapitre et entrée du sommaire
//   image                  photo de la bannière (assets/bac75n/)
//   html                   corps du chapitre, une ligne de l'archive par entrée
//
// Les anciens dossiers de cette formation se relisent avec le parcours
// d'alors : ./antiterrorisme-dossiers.js.

export const ANTITERRORISME = {
  id: 'antiterrorisme',
  module: 'antiterrorisme',
  title: 'Formation Antiterrorisme BAC',
  image: 'cours-antiterrorisme',

  // Bannière du module et fil d'Ariane, repris de l'archive.
  hero: {
    kicker: 'FORMATION BAC 75 N',
    lead: 'FORMATION',
    accent: 'ANTITERRORISME',
    tagline: 'PRIMO-INTERVENIR · PROTÉGER · TRANSMETTRE · COORDONNER'
  },
  crumb: 'Accueil › Formations BAC › Formation Antiterrorisme',

  chapters: [
    {
      id: 'chap-01',
      num: '01',
      title: 'BATACLAN — 13 NOVEMBRE 2015',
      subtitle: 'La BAC 75 N parmi les tout premiers intervenants',
      image: '13_ADMINISTRATION_BANNER_UNITE.jpg',
      html: [
        '<p>Le soir du <b>13 novembre 2015</b>, la BAC de nuit de Paris fait partie des tout premiers services engagés au Bataclan. Les travaux parlementaires consacrés aux attentats retiennent l’intervention d’un commissaire de la <b>BAC 75 N</b>, accompagné de son équipier, qui pénètre dans la salle alors que la tuerie est encore en cours et neutralise <b>l’un des trois terroristes</b>.</p>',
        '<div class="at-key at-redbox"><b>FAIT HISTORIQUE À RETENIR</b><span>La formulation utilisée dans la formation est volontairement précise : la BAC 75 N est primo-intervenante et l’un de ses commissaires neutralise un des trois terroristes. La réduction définitive de la crise intervient ensuite avec la montée en puissance des unités spécialisées.</span></div>',
        '<div class="at-grid3"><div class="at-mini"><b>PRIMO-INTERVENTION</b><span>Arriver, comprendre et rendre compte dans une situation extrêmement évolutive.</span></div><div class="at-mini"><b>PROTECTION</b><span>Contribuer à limiter l’exposition du public et à la prise en compte des victimes.</span></div><div class="at-mini"><b>RELAIS</b><span>Transmettre une situation exploitable au commandement et aux unités spécialisées.</span></div></div>',
        '<h3>Pourquoi cet épisode ouvre la formation ?</h3><p>Parce qu’il illustre la place particulière d’un équipage de terrain lorsqu’une attaque grave se déroule avant l’arrivée complète des moyens spécialisés : la première réponse doit être rapide, factuelle, coordonnée et orientée vers la sauvegarde des vies.</p>',
        '<div class="at-key"><b>PRINCIPE</b><span>Être primo-intervenant ne signifie pas se substituer au RAID, à la BRI ou au GIGN. La formation distingue clairement la première réponse, la montée en puissance et l’intervention spécialisée.</span></div>'
      ]
    },
    {
      id: 'chap-02',
      num: '02',
      title: 'PRIMO-INTERVENTION ET RÔLE BAC 75 N',
      subtitle: 'Comprendre sa place dans la chaîne de réponse',
      image: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg',
      html: [
        '<p>Dans une crise potentiellement terroriste, la valeur de la BAC repose sur sa <b>présence immédiate sur le terrain</b>, sa capacité à observer, transmettre, protéger et faciliter l’action coordonnée des moyens qui montent en puissance.</p>',
        '<div class="at-reflex">OBSERVER <i>→</i> LOCALISER <i>→</i> QUALIFIER <i>→</i> TRANSMETTRE <i>→</i> PROTÉGER <i>→</i> ACTUALISER <i>→</i> COORDONNER <i>→</i> PASSER LE RELAIS</div>',
        '<h3>Missions pédagogiques du primo-intervenant</h3><ul><li>Prendre en compte l’événement et préciser le lieu.</li><li>Distinguer ce qui est <b>vu</b>, ce qui est <b>rapporté par un témoin</b> et ce qui reste <b>non confirmé</b>.</li><li>Faire remonter les victimes connues, l’évolution et les besoins immédiats.</li><li>Contribuer à protéger le public et à préserver les accès utiles aux secours.</li><li>Actualiser TN 75 lorsqu’un élément important change.</li><li>Préparer un passage de relais synthétique au commandement ou à l’unité spécialisée.</li></ul>',
        '<div class="at-key at-redbox"><b>LIMITE À CONNAÎTRE</b><span>La formation BAC ne reproduit pas les techniques spécialisées d’assaut, de franchissement, de neutralisation ou d’emploi tactique des armes.</span></div>'
      ]
    },
    {
      id: 'chap-03',
      num: '03',
      title: 'APRÈS 2015 — PLAN BAC-PSIG',
      subtitle: 'Renforcement de la formation, de la protection et des moyens',
      image: '09_FORMATION_CHEF_GROUPE_BANNER.jpg',
      html: [
        '<p>Après les attentats de 2015, le ministère de l’Intérieur renforce les BAC et les PSIG autour de trois axes : <b>formation</b>, <b>équipements supplémentaires</b> et <b>évolution de la réponse aux tueries de masse</b>.</p>',
        '<table><tr><th>AXE</th><th>ÉLÉMENT RETENU DANS LA FORMATION</th></tr><tr><td>Formation</td><td>Renforcement de la formation initiale et continue, avec davantage de mises en situation.</td></tr><tr><td>Protection</td><td>Renforcement des protections balistiques mises à disposition des unités concernées.</td></tr><tr><td>Armement</td><td>Le plan public de 2016 prévoit notamment la dotation de HK G36 pour des équipages BAC après formation au maniement.</td></tr><tr><td>Doctrine</td><td>Capacité de première réponse renforcée face aux attaques graves, avant la montée en puissance spécialisée.</td></tr></table>',
        '<div class="at-key"><b>À RETENIR</b><span>Le renforcement des moyens ne transforme pas la BAC en RAID, BRI ou GIGN : il améliore sa capacité à faire face aux premières minutes d’une crise grave.</span></div>'
      ]
    },
    {
      id: 'chap-04',
      num: '04',
      title: 'RAID · BRI · GIGN',
      subtitle: 'Repères institutionnels et complémentarité',
      image: '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg',
      html: [
        '<div class="at-unitcards"><div><b>RAID</b><span>Unité spécialisée de la Police nationale intervenant notamment dans les crises graves et contribuant à la lutte antiterroriste.</span></div><div><b>BRI</b><span>Unité combinant investigation et intervention. À Paris, la BRI-PP dispose d’une capacité de haute intensité et peut constituer la BRI-UCT.</span></div><div><b>GIGN</b><span>Unité de la Gendarmerie nationale dédiée notamment au contre-terrorisme et à la gestion des crises extrêmes.</span></div></div>',
        '<h3>Complémentarité</h3><p>Le Schéma national d’intervention organise la complémentarité et la coordination des forces. La formation apprend donc à <b>préparer l’arrivée des moyens spécialisés</b>, à transmettre une situation claire et à poursuivre la mission attribuée une fois la relève effectuée.</p>',
        '<div class="at-key"><b>BRI-UCT</b><span>Les informations publiques de la Police nationale indiquent que la montée en puissance de la BRI-PP peut intégrer l’appui d’autres unités de la Préfecture de police, notamment la BACN 75.</span></div>',
        '<div class="at-key at-gold"><b>NÉGOCIATION</b><span>La négociation est une capacité clairement documentée au sein de dispositifs spécialisés. Elle n’est pas présentée ici comme une qualification générale de tous les personnels BAC 75 N.</span></div>'
      ]
    },
    {
      id: 'chap-05',
      num: '05',
      title: 'DÉTECTION, OBSERVATION ET SIGNALEMENT',
      subtitle: 'Construire une information fiable',
      image: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg',
      html: [
        '<p>Dans une situation confuse, le premier objectif est d’éviter que des hypothèses deviennent des certitudes. Une transmission utile doit préciser la <b>source</b> de l’information.</p>',
        '<div class="at-grid3"><div class="at-mini"><b>FAIT OBSERVÉ</b><span>Élément directement vu ou entendu par l’équipage.</span></div><div class="at-mini"><b>TÉMOIGNAGE</b><span>Élément rapporté par une personne identifiée ou présente sur place.</span></div><div class="at-mini"><b>NON CONFIRMÉ</b><span>Information relayée mais pas encore vérifiée.</span></div></div>',
        '<h3>Éléments utiles à relever</h3><ul><li>Localisation précise et zone concernée.</li><li>Nature des faits réellement constatés.</li><li>Nombre approximatif de personnes concernées lorsque cela peut être estimé.</li><li>Victimes signalées ou visibles.</li><li>Direction ou évolution générale de l’événement.</li><li>Changement majeur depuis le dernier message.</li></ul>',
        '<div class="at-key at-redbox"><b>ERREUR À ÉVITER</b><span>Un comportement inhabituel ou une information partielle ne permet pas, à lui seul, de qualifier une menace de terroriste.</span></div>'
      ]
    },
    {
      id: 'chap-06',
      num: '06',
      title: 'TRANSMISSION ET COMPTE RENDU INITIAL',
      subtitle: 'Un message court, factuel et exploitable',
      image: '02_HOME_HERO_BAC_CONTROLE_NUIT.jpg',
      html: [
        '<p>Le premier message doit donner au centre radio et au commandement une image suffisamment claire pour engager les moyens adaptés sans saturer le réseau.</p>',
        '<div class="at-steps"><span><b>1</b>LIEU</span><span><b>2</b>FAITS</span><span><b>3</b>OBSERVÉ</span><span><b>4</b>VICTIMES</span><span><b>5</b>BESOINS</span><span><b>6</b>ÉVOLUTION</span></div>',
        '<div class="at-example"><b>EXEMPLE PÉDAGOGIQUE</b><p>« TN 75 de BAC 75 N Alpha, sur secteur [lieu], plusieurs appels concordants pour violences graves en cours. Nous constatons [faits observés]. Présence de victimes signalée. Demandons moyens adaptés et maintien du réseau disponible. Nous actualisons. »</p></div>',
        '<h3>Discipline de transmission</h3><ul><li>Parler clairement et brièvement.</li><li>Ne transmettre que les éléments utiles à la compréhension et à la décision.</li><li>Signaler explicitement ce qui n’est pas confirmé.</li><li>Actualiser lorsqu’un élément important évolue plutôt que répéter le même message.</li></ul>'
      ]
    },
    {
      id: 'chap-07',
      num: '07',
      title: 'PROTECTION, ZONAGE ET ACCÈS',
      subtitle: 'Créer les conditions d’une réponse coordonnée',
      image: '13_ADMINISTRATION_BANNER_UNITE.jpg',
      html: [
        '<p>La protection vise à limiter l’exposition du public et à conserver des conditions permettant l’arrivée des secours, du commandement et des unités spécialisées.</p>',
        '<ul><li>Éloigner le public de la zone dangereuse lorsque cela peut être fait sans créer une nouvelle exposition.</li><li>Éviter les attroupements et préserver les axes utiles aux moyens engagés.</li><li>Faire remonter les accès praticables, obstacles visibles et changements importants.</li><li>Ne pas manipuler un objet suspect ; le signaler et appliquer les consignes reçues.</li><li>Maintenir une discipline radio et limiter les informations inutiles.</li></ul>',
        '<div class="at-key"><b>OBJECTIF</b><span>Public protégé, information fiable, accès préservés et commandement clairement identifié.</span></div>'
      ]
    },
    {
      id: 'chap-08',
      num: '08',
      title: 'VICTIMES, TÉMOINS ET INFORMATIONS',
      subtitle: 'Secourir sans perdre la qualité du renseignement',
      image: '08_HOME_ACTUALITE_INTERPELLATION.jpg',
      html: [
        '<ul><li>Faire déclencher ou confirmer la prise en compte des secours.</li><li>Orienter les personnes capables de se déplacer vers la zone indiquée par le commandement, sans les exposer davantage.</li><li>Identifier les témoins ayant vu directement les faits et conserver les éléments utiles selon les procédures applicables.</li><li>Éviter la diffusion publique d’informations sensibles ou non vérifiées.</li><li>Préserver les éléments utiles à l’enquête sans retarder les gestes de secours indispensables.</li></ul>',
        '<div class="at-key at-redbox"><b>PRIORITÉ</b><span>La sauvegarde des vies reste prioritaire. La préservation des informations et éléments utiles ne doit pas retarder une prise en charge urgente.</span></div>'
      ]
    },
    {
      id: 'chap-09',
      num: '09',
      title: 'COORDINATION ET PASSAGE DE RELAIS',
      subtitle: 'Donner une situation exploitable à l’échelon suivant',
      image: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg',
      html: [
        '<p>À l’arrivée d’un échelon de commandement ou d’une unité spécialisée, le passage de relais doit être rapide et structuré.</p>',
        '<div class="at-reflex">SITUATION <i>→</i> CONFIRMÉ <i>→</i> INCERTAIN <i>→</i> VICTIMES <i>→</i> MOYENS <i>→</i> ACCÈS <i>→</i> ÉVOLUTION <i>→</i> MISSION RESTANTE</div>',
        '<ul><li>Situation générale et localisation exacte.</li><li>Faits confirmés et éléments restant à vérifier.</li><li>Victimes connues et témoins identifiés.</li><li>Moyens déjà engagés ou demandés.</li><li>Accès utiles et secteurs déjà pris en compte.</li><li>Dernière évolution connue.</li><li>Mission actuellement tenue par l’équipage BAC.</li></ul>',
        '<div class="at-key"><b>APRÈS LA RELÈVE</b><span>Poursuivre la mission attribuée par le commandement et éviter les initiatives contradictoires.</span></div>'
      ]
    },
    {
      id: 'chap-10',
      num: '10',
      title: 'SITUATIONS DÉGRADÉES ET DISCIPLINE',
      subtitle: 'Rester précis lorsque la situation devient confuse',
      image: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg',
      html: [
        '<table><tr><th>SITUATION</th><th>RÉPONSE ATTENDUE</th></tr><tr><td>Informations contradictoires</td><td>Signaler la contradiction, identifier la source et ne pas choisir arbitrairement une version.</td></tr><tr><td>Plusieurs sites signalés</td><td>Faire remonter immédiatement le caractère potentiellement multisite et respecter la répartition du commandement.</td></tr><tr><td>Réseau saturé</td><td>Messages courts, priorité aux informations nouvelles et urgentes, pas de répétition inutile.</td></tr><tr><td>Objet suspect</td><td>Ne pas manipuler ; signaler, éloigner le public et appliquer les consignes reçues.</td></tr><tr><td>Auteur non localisé</td><td>Ne pas transformer une description partielle en certitude ; actualiser les éléments connus.</td></tr></table>',
        '<div class="at-key at-redbox"><b>DISCIPLINE</b><span>Dans une crise de haute intensité, une information fausse ou ambiguë peut désorganiser plusieurs équipages. La précision compte autant que la vitesse.</span></div>'
      ]
    },
    {
      id: 'chap-11',
      num: '11',
      title: 'EXERCICES PRATIQUES',
      subtitle: 'Analyse, communication, protection et coordination',
      image: '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg',
      html: [
        '<div class="at-exercise"><b>A — SIGNALEMENT INITIAL</b><span>Plusieurs appels évoquent un individu au comportement inquiétant près d’un lieu fréquenté. Distinguer faits, témoignages et hypothèses puis produire un premier message.</span></div>',
        '<div class="at-exercise"><b>B — VIOLENCES GRAVES EN COURS</b><span>Arrivée sur un secteur confus avec victimes et témoins. Prioriser localisation, faits, secours, protection et information du centre.</span></div>',
        '<div class="at-exercise"><b>C — OBJET SUSPECT</b><span>Expliquer ce qui doit être transmis, ce qui ne doit pas être manipulé et comment préserver l’espace en attendant les consignes.</span></div>',
        '<div class="at-exercise"><b>D — ÉVÉNEMENTS MULTIPLES</b><span>Deux événements sont signalés presque simultanément. Ne pas conclure trop vite à un lien et respecter la coordination du commandement.</span></div>',
        '<div class="at-exercise"><b>E — RELÈVE SPÉCIALISÉE</b><span>Réaliser en soixante secondes un passage de relais structuré et complet.</span></div>',
        '<div class="at-key at-redbox"><b>PÉRIMÈTRE</b><span>Aucune technique d’assaut spécialisée n’est enseignée ou évaluée dans ces exercices.</span></div>'
      ]
    },
    {
      id: 'chap-12',
      num: '12',
      title: 'MISE EN SITUATION FINALE',
      subtitle: 'Évaluer le raisonnement et la coordination',
      image: '09_FORMATION_CHEF_GROUPE_BANNER.jpg',
      html: [
        '<div class="at-scenario"><b>SCÉNARIO</b><p>En début de vacation, plusieurs appels signalent des violences graves dans un secteur fréquenté. Les informations sont partielles et évoluent. Des victimes sont signalées, un témoin fournit une description, puis un second événement est annoncé à proximité. Des moyens spécialisés sont engagés.</p></div>',
        '<ol><li>Prise en compte et premier message.</li><li>Arrivée et séparation faits / témoignages / incertitudes.</li><li>Protection du public et demande des moyens utiles.</li><li>Gestion d’informations contradictoires et discipline radio.</li><li>Prise en compte des victimes et témoins.</li><li>Arrivée d’un échelon spécialisé et passage de relais.</li><li>Compte rendu final et débriefing.</li></ol>',
        '<div class="at-key"><b>ATTENDU</b><span>Le stagiaire est évalué sur sa capacité à comprendre, transmettre, protéger, coordonner et passer le relais — pas sur une tactique d’assaut.</span></div>'
      ]
    },
    {
      id: 'chap-13',
      num: '13',
      title: 'ÉVALUATION /100 ET FICHE RÉFLEXE',
      subtitle: 'Valider les acquis de la formation',
      image: '01_LOGO_BAC75N_PRINCIPAL.png',
      html: [
        '<table class="at-score"><tr><th>CRITÈRE</th><th>BARÈME</th></tr><tr><td>Cadre, histoire et rôle de la BAC 75 N</td><td>/15</td></tr><tr><td>Analyse et qualification de la situation</td><td>/20</td></tr><tr><td>Transmission / compte rendu</td><td>/20</td></tr><tr><td>Protection / organisation initiale</td><td>/15</td></tr><tr><td>Victimes / témoins</td><td>/10</td></tr><tr><td>Coordination / passage de relais</td><td>/10</td></tr><tr><td>Mise en situation finale</td><td>/10</td></tr><tr><th>TOTAL</th><th>/100</th></tr></table>',
        '<div class="at-reflex">OBSERVER <i>→</i> LOCALISER <i>→</i> QUALIFIER <i>→</i> TRANSMETTRE <i>→</i> PROTÉGER <i>→</i> ACTUALISER <i>→</i> COORDONNER <i>→</i> PASSER LE RELAIS</div>',
        '<div class="at-questions"><b>LES 5 QUESTIONS À SE POSER</b><span>1. Qu’est-ce qui est certain ?</span><span>2. Où se situe précisément l’événement ?</span><span>3. Qui est exposé ou blessé ?</span><span>4. Quels moyens sont déjà engagés ?</span><span>5. Quelle information nouvelle doit remonter maintenant ?</span></div>'
      ]
    }
  ]
};
