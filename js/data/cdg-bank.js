// Banque de l'examen Chef de Groupe — cahier des charges §8 et §9.
//
// Le cahier des charges demande au moins 20 000 variantes exploitables, et
// préfère explicitement un générateur combinatoire à 20 000 lignes
// statiques. Ce fichier contient donc les **fragments** ; le moteur
// (js/data/cdg-generator.js) les combine et compte ce que ça produit
// réellement — le chiffre affiché dans le site est calculé, pas annoncé.
//
// Tout reste au niveau organisation, commandement, communication et compte
// rendu, comme l'exige le §8 : on évalue la capacité à se voir confier un
// groupe, pas une technique d'intervention.

// ───────────────────────── Connaissances (§8, /200) ─────────────────────

export const THEMES = [
  'role',
  'briefing',
  'consignes',
  'decision',
  'effectifs',
  'radio',
  'coordination',
  'degradation',
  'debriefing',
  'regles'
];

export const THEME_LABEL = {
  role: 'Rôle du chef de groupe',
  briefing: 'Préparation et briefing',
  consignes: 'Consignes et communication',
  decision: 'Prise de décision',
  effectifs: 'Gestion des effectifs',
  radio: 'Gestion radio',
  coordination: 'Coordination',
  degradation: 'Situation qui se dégrade',
  debriefing: 'Débriefing et compte rendu',
  regles: 'Règles du serveur'
};

/** Cadres qui situent la question sans en changer la réponse attendue. */
export const CADRES = [
  'en début de vacation',
  'en pleine intervention',
  'avec un agent qui débute dans ton groupe',
  'après une intervention qui s’est mal passée',
  'quand la fréquence radio est chargée'
];

/** Tournures de la question, pour qu'elle ne tombe pas toujours pareil. */
export const TOURNURES = [
  ({ cadre, q }) => `${cap(cadre)} : ${q}`,
  ({ cadre, q }) => `${q} Réponds en te plaçant ${cadre}.`,
  ({ cadre, q }) => `Tu es chef de groupe ${cadre}. ${q}`,
  ({ q }) => q
];

function cap(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const CONNAISSANCES = [
  { theme: 'role', q: 'Qu’est-ce qu’un chef de groupe fait, et que ne fait-il pas ?', attendu: ['attribuer les missions', 'ne pas exécuter à la place des agents', 'garder la vue d’ensemble', 'rendre compte'] },
  { theme: 'role', q: 'Pourquoi un chef de groupe qui part au contact avec le premier équipage pose-t-il un problème ?', attendu: ['il perd la vue d’ensemble', 'plus personne ne coordonne', 'les autres équipages restent sans consigne'] },
  { theme: 'role', q: 'De quoi un chef de groupe est-il responsable devant sa hiérarchie ?', attendu: ['de ce qu’il ordonne', 'de ce qu’il laisse faire', 'des comptes rendus transmis'] },
  { theme: 'role', q: 'Comment protèges-tu tes agents en tant que chef de groupe ?', attendu: ['des ordres clairs', 'jamais un agent seul au contact', 'un débutant avec un ancien', 'contrôler que la consigne est faite'] },

  { theme: 'briefing', q: 'Que contient un briefing de prise de vacation ?', attendu: ['effectifs comptés', 'équipages constitués', 'indicatifs', 'moyens vérifiés', 'deux ou trois consignes', 'disponibilité annoncée au TN'] },
  { theme: 'briefing', q: 'Pourquoi deux ou trois consignes valent-elles mieux que dix ?', attendu: ['elles sont retenues', 'dix consignes sont oubliées', 'on ne retient que l’essentiel'] },
  { theme: 'briefing', q: 'Comment prends-tu en compte un agent qui débute, dès le briefing ?', attendu: ['le repérer au briefing', 'le placer avec un ancien', 'pas sur une mission de contact seul'] },
  { theme: 'briefing', q: 'Par quoi se termine toujours un briefing ?', attendu: ['des questions ?', 's’assurer que tout le monde a compris'] },

  { theme: 'consignes', q: 'Qu’est-ce qu’une consigne utilisable ? Donne-en un exemple.', attendu: ['qui', 'quoi', 'où', 'une seule phrase', 'confirmation demandée'] },
  { theme: 'consignes', q: 'Transforme « allez voir là-bas » en consigne utilisable.', attendu: ['nommer l’équipage', 'préciser l’action', 'préciser le lieu', 'demander un compte rendu'] },
  { theme: 'consignes', q: 'Pourquoi faire répéter une consigne ?', attendu: ['une consigne non confirmée n’est pas reçue', 'vérifier la compréhension', 'éviter deux équipages au même endroit'] },
  { theme: 'consignes', q: 'À qui la faute quand une consigne floue est mal exécutée ?', attendu: ['au chef', 'une consigne floue est une faute de commandement'] },

  { theme: 'decision', q: 'Comment décides-tu quand les informations sont incomplètes ?', attendu: ['trier établi supposé à vérifier', 'repérer l’urgent', 'annoncer la décision', 'dire sur quoi elle repose'] },
  { theme: 'decision', q: 'Deux témoins se contredisent. Comment traites-tu l’information ?', attendu: ['deux versions contradictoires est le fait établi', 'l’hypothèse la plus défavorable sert d’hypothèse de travail', 'à vérifier avant action'] },
  { theme: 'decision', q: 'Pourquoi une décision moyenne prise à temps vaut-elle mieux qu’une décision parfaite trop tard ?', attendu: ['le retard coûte plus cher', 'la situation évolue', 'le groupe attend une consigne'] },
  { theme: 'decision', q: 'Quel est le danger de décider sur une information supposée ?', attendu: ['engager le groupe sur une hypothèse', 'confondre supposé et établi'] },

  { theme: 'effectifs', q: 'Avec six agents, comment répartis-tu et que gardes-tu en réserve ?', attendu: ['deux au contact', 'deux en bouclage', 'deux avec le chef', 'réserve le binôme du chef'] },
  { theme: 'effectifs', q: 'Quelles règles ne se négocient jamais dans la répartition des effectifs ?', attendu: ['jamais un agent seul au contact', 'un débutant avec un ancien', 'une seule mission par équipage'] },
  { theme: 'effectifs', q: 'À partir de quel effectif délègues-tu un secteur, et à qui ?', attendu: ['au-delà de six agents', 'désigner un adjoint', 'lui confier un secteur'] },
  { theme: 'effectifs', q: 'Que signifie « savoir à tout moment où est chaque équipage » ?', attendu: ['point d’effectifs régulier', 'sinon tu ne commandes plus', 'refaire le point dès que la situation change'] },

  { theme: 'radio', q: 'Quelle est la forme d’un message radio utilisable ?', attendu: ['qui parle', 'à qui', 'message court', 'confirmation demandée'] },
  { theme: 'radio', q: 'Rédige le message de départ sur intervention.', attendu: ['de chef de groupe au TN', 'nous prenons', 'nombre d’équipages', 'en route'] },
  { theme: 'radio', q: 'La fréquence sature et trois équipages parlent ensemble. Comment reprends-tu la main ?', attendu: ['silence radio sauf urgence', 'point d’effectifs', 'une consigne à la fois'] },
  { theme: 'radio', q: 'Que se passe-t-il si tu oublies le compte rendu final ?', attendu: ['pour le TN l’intervention n’est pas terminée', 'les moyens restent engagés', 'la hiérarchie n’est pas informée'] },

  { theme: 'coordination', q: 'Un autre service arrive sur ta scène. Que règles-tu immédiatement ?', attendu: ['qui fait quoi', 'qui parle à qui', 'annoncer ta propre organisation', 'une seule personne de liaison'] },
  { theme: 'coordination', q: 'Que donnes-tu à un moyen sanitaire qui arrive sur une scène encore instable ?', attendu: ['un accès sûr', 'le nombre et l’état des personnes', 'un point d’attente', 'ce qui est sûr et ce qui ne l’est pas'] },
  { theme: 'coordination', q: 'Pourquoi ne faut-il pas multiplier les interlocuteurs ?', attendu: ['chacun entend une version différente', 'les informations se contredisent', 'une seule liaison par service'] },
  { theme: 'coordination', q: 'Quelle est ta place quand ta hiérarchie arrive sur les lieux ?', attendu: ['tu proposes elle arbitre', 'tu continues de commander ton groupe', 'tu rends compte en synthèse'] },

  { theme: 'degradation', q: 'Quels signes montrent qu’une situation se dégrade ?', attendu: ['fréquence saturée', 'un équipage qui ne répond plus', 'consignes non confirmées', 'informations contradictoires', 'nombre de personnes qui augmente'] },
  { theme: 'degradation', q: 'Que fais-tu quand la situation part, dans l’ordre ?', attendu: ['silence radio sauf urgence', 'point d’effectifs', 'une seule priorité', 'demander des moyens', 'annoncer la nouvelle consigne'] },
  { theme: 'degradation', q: 'Pourquoi demander des renforts avant d’en avoir absolument besoin ?', attendu: ['les délais', 'éviter de subir', 'mieux vaut annuler une demande que l’attendre'] },
  { theme: 'degradation', q: 'Un de tes équipages ne répond plus. Quelles sont tes trois actions ?', attendu: ['tentative de contact', 'envoyer un équipage vers lui', 'prévenir le TN et demander des moyens', 'la vie des intervenants avant la mission'] },

  { theme: 'debriefing', q: 'Comment mènes-tu un débriefing de fin d’intervention ?', attendu: ['point d’effectifs et état de chacun', 'faire parler les agents', 'ce qui a marché', 'ce qui a manqué', 'une décision pour la prochaine fois'] },
  { theme: 'debriefing', q: 'Pourquoi un reproche individuel ne se fait-il pas en groupe ?', attendu: ['ne pas humilier', 'le groupe n’apprend rien', 'reprise en tête-à-tête'] },
  { theme: 'debriefing', q: 'Que contient un compte rendu final au TN ?', attendu: ['résultat de l’intervention', 'blessés ou non', 'ce que devient le dispositif', 'court'] },
  { theme: 'debriefing', q: 'Pourquoi un chef cite-t-il ses propres erreurs en débriefing ?', attendu: ['crédibilité', 'le groupe ose parler', 'l’exercice sert à progresser'] },

  { theme: 'regles', q: 'Quelles règles du serveur s’appliquent quand tu commandes une scène ?', attendu: ['rester dans son rôle', 'aucune information hors jeu utilisée en jeu', 'respecter la peur de son personnage', 'laisser le temps de jouer aux autres'] },
  { theme: 'regles', q: 'Un agent conteste ta décision en pleine intervention. Que fais-tu ?', attendu: ['maintenir la consigne', 'régler le désaccord après la scène', 'ne pas discuter sur la fréquence'] },
  { theme: 'regles', q: 'Tu as un doute sur une règle en pleine scène. Quel est le réflexe ?', attendu: ['jouer prudemment', 'continuer la scène', 'poser la question à l’encadrement après'] },
  { theme: 'regles', q: 'Pourquoi ne précipite-t-on pas une scène pour « finir » ?', attendu: ['les autres joueurs doivent pouvoir jouer', 'respect du jeu de rôle', 'la qualité de la scène passe avant le résultat'] }
];

// ───────────────── Commandement / leadership (§8, /200) ─────────────────

export const COMMANDEMENT = [
  { q: 'Tes agents n’appliquent pas une consigne que tu as donnée deux fois. Que remets-tu en cause d’abord ?', attendu: ['la clarté de ma consigne', 'la confirmation non demandée', 'reformuler autrement', 'vérifier ensuite l’exécution'] },
  { q: 'Un agent expérimenté te dit devant les autres que ton choix est mauvais. Comment réagis-tu ?', attendu: ['maintenir la décision', 'ne pas discuter devant le groupe', 'l’écouter après', 'reconnaître si c’était une erreur'] },
  { q: 'Tu dois confier une mission délicate et deux agents la veulent. Comment choisis-tu, et comment l’annonces-tu ?', attendu: ['selon l’expérience et la composition des équipages', 'annoncer le choix et sa raison', 'donner une mission à l’autre'] },
  { q: 'Tu réalises en pleine intervention que ta décision était mauvaise. Que fais-tu ?', attendu: ['annoncer le changement clairement', 'ne pas laisser courir par orgueil', 'nouvelle consigne', 'rendre compte'] },
  { q: 'Comment maintiens-tu le calme de ton groupe quand la scène devient tendue ?', attendu: ['voix basse et lente à la radio', 'une seule priorité', 'consignes courtes', 'le ton du chef règle le ton du groupe'] },
  { q: 'Un agent te paraît dépassé par la situation. Comment le gères-tu sans l’humilier ?', attendu: ['le changer de mission discrètement', 'le mettre en binôme', 'lui parler après', 'ne pas le dire sur la fréquence'] },
  { q: 'Que délègues-tu quand ta vacation dure longtemps, et pourquoi ?', attendu: ['le suivi radio ou un secteur', 'le point d’effectifs', 'un chef qui ne délègue rien décroche', 'prévoir la relève'] },
  { q: 'Tu es chef de groupe et le plus ancien de la vacation te donne des conseils en permanence. Comment tiens-tu ta place ?', attendu: ['écouter sans se dessaisir', 'décider soi-même', 'remercier et trancher', 'cadrer si ça gêne le commandement'] },
  { q: 'Ta hiérarchie te demande un point alors que tu es en pleine réorganisation. Comment t’en sors-tu ?', attendu: ['point court en synthèse', 'annoncer que la situation évolue', 'rappeler dès que stabilisé', 'déléguer le suivi pendant ce temps'] },
  { q: 'Qu’est-ce qui, concrètement, fait qu’un groupe suit son chef ?', attendu: ['clarté', 'constance', 'protection des agents', 'assumer les décisions', 'être compris sans répéter'] },
  { q: 'Deux de tes équipages se contredisent sur ce qu’ils voient. Comment arbitres-tu ?', attendu: ['faire décrire les faits', 'séparer ce qui est vu de ce qui est déduit', 'trancher et annoncer', 'faire vérifier'] },
  { q: 'Tu reprends une vacation en cours d’intervention. Quelles sont tes trois premières actions ?', attendu: ['point d’effectifs', 'point de situation', 'annoncer la prise de commandement', 'reprendre les consignes'] },
  // Les trois suivantes viennent de l'examen d'origine (V4), qui les posait
  // à tous les candidats ; ici elles rejoignent le tirage.
  { q: 'Deux équipages te parlent en même temps à la radio. Comment reprends-tu la situation ?', attendu: ['garder son calme', 'imposer un ordre de parole', 'traiter la priorité d’abord', 'messages courts', 'faire confirmer chaque équipage'] },
  { q: 'Un agent n’a pas compris sa mission. Que fais-tu ?', attendu: ['reformuler clairement', 'qui quoi où', 'lui faire répéter la mission', 'vérifier la compréhension avant le départ'] },
  { q: 'Après l’intervention, que doit contenir ton débriefing ?', attendu: ['le résultat de l’intervention', 'les difficultés rencontrées', 'les points positifs', 'les améliorations pour la prochaine fois'] }
];

// ──────────────────── Mises en situation (§8 et §9) ─────────────────────
//
// Les neuf dimensions demandées par le §9 : thème, contexte, effectif,
// information disponible, priorité, contrainte, évolution, événement
// imprévu, formulation.

export const SIT_THEMES = [
  { id: 'vol', label: 'Vol avec fuite', amorce: 'un vol vient d’être commis et l’auteur a pris la fuite' },
  { id: 'cambriolage', label: 'Cambriolage en cours', amorce: 'un cambriolage est signalé en cours' },
  { id: 'agite', label: 'Individu très agité', amorce: 'un individu très agité est signalé dans un lieu fréquenté' },
  { id: 'differend', label: 'Différend qui dégénère', amorce: 'un différend entre plusieurs personnes est en train de dégénérer' },
  { id: 'vehicule', label: 'Véhicule signalé', amorce: 'un véhicule signalé vient d’être repéré par un équipage' },
  { id: 'disparition', label: 'Personne recherchée', amorce: 'une personne recherchée aurait été aperçue dans le secteur' },
  { id: 'retranche', label: 'Personne retranchée', amorce: 'une personne s’est retranchée et refuse tout contact' },
  { id: 'attroupement', label: 'Attroupement hostile', amorce: 'un attroupement devient hostile autour d’une intervention' }
];

export const SIT_CONTEXTES = [
  'dans une rue commerçante très fréquentée',
  'dans un parking souterrain',
  'dans une cour d’immeuble',
  'sur un axe de circulation chargé',
  'dans une galerie marchande',
  'dans un square en pleine journée',
  'dans un hall d’immeuble',
  'sur un marché en cours d’installation',
  'aux abords d’une station de transport',
  'dans une rue étroite à sens unique'
];

export const SIT_EFFECTIFS = [
  { n: 4, label: '4 agents disponibles, deux équipages' },
  { n: 5, label: '5 agents disponibles, dont un qui débute' },
  { n: 6, label: '6 agents disponibles, trois équipages' },
  { n: 7, label: '7 agents disponibles, dont un équipage déjà engagé ailleurs' },
  { n: 8, label: '8 agents disponibles, trois équipages et ton binôme' }
];

export const SIT_INFOS = [
  'les informations initiales sont partielles et un seul témoin a parlé',
  'deux témoins donnent des versions qui se contredisent',
  'l’information vient d’un équipage sur place et paraît fiable',
  'l’appel initial est confus et personne n’a été rappelé depuis',
  'un seul élément est certain, le reste est supposé',
  'l’information est complète mais date de plusieurs minutes'
];

export const SIT_PRIORITES = [
  'la protection des personnes présentes sur place',
  'l’assistance à une personne qui pourrait être blessée',
  'le maintien d’un périmètre pour éviter que ça s’étende',
  'la recherche de l’auteur signalé',
  'la mise en sécurité d’un témoin qui veut parler'
];

export const SIT_CONTRAINTES = [
  'tu ne peux pas obtenir de renfort avant plusieurs minutes',
  'la fréquence radio est déjà très chargée',
  'un de tes équipages est à l’autre bout du secteur',
  'beaucoup de public filme la scène',
  'l’accès au lieu est difficile pour les véhicules',
  'un agent de ton groupe découvre ce type de situation'
];

export const SIT_EVOLUTIONS = [
  'la personne recherchée est aperçue en train de s’éloigner dans une autre direction',
  'une seconde personne impliquée apparaît, dont personne n’avait parlé',
  'un témoin annonce qu’une personne est blessée à l’intérieur',
  'la tension monte autour de tes agents et des gens s’approchent',
  'l’information initiale se révèle fausse sur un point important',
  'un équipage signale qu’il a perdu le contact visuel'
];

export const SIT_IMPREVUS = [
  'un de tes agents signale un malaise et doit être relevé',
  'un autre service arrive sans s’annoncer et commence à agir',
  'ta hiérarchie te demande un point détaillé au plus mauvais moment',
  'un équipage tombe en panne radio',
  'une personne âgée a besoin d’aide au milieu du dispositif',
  'un deuxième appel urgent arrive sur ton secteur'
];

// Évolution à injecter : l'examinateur la lit en cours de situation, après
// les premières réponses, pour voir si le candidat s'adapte. Reprise de
// l'examen d'origine (V4). Une par situation, tirée à la création du
// dossier et figée avec le reste.
export const SIT_INJECTIONS = [
  'une information importante change',
  'un collègue demande de l’aide',
  'les informations deviennent contradictoires',
  'un moyen prévu devient indisponible',
  'un autre service arrive sur place'
];

export const SIT_FORMULATIONS = [
  'Tu es chef de groupe BAC 75 N. ',
  'Tu commandes la vacation BAC 75 N. ',
  'Désigné chef de groupe pour cette vacation, '
];

// ─────────────── Questions posées sur chaque mise en situation ───────────
//
// Barème du §8, et il doit tomber juste :
//
//   connaissances        10 × 20 = 200
//   commandement          5 × 40 = 200
//   mise en situation 1   5 × 50 = 250
//   mise en situation 2   5 × 50 = 250
//   radio & compte rendu  2 × 50 = 100
//   ───────────────────────────────────
//   total                           1000
//
// Les deux questions radio sont **posées pendant** les mises en situation,
// comme le demande le cahier des charges (« intégré aux situations »), mais
// comptées dans la section radio. Elles portent donc `section: 'radio'` et
// ne pèsent pas sur les 250 de leur situation. Sans ce marquage, la radio
// serait comptée deux fois et le total dépasserait 1000.

export const QUESTIONS_SITUATION_1 = [
  { id: 's1q1', max: 50, q: 'Quelle est ton analyse avant d’engager, en séparant ce qui est établi, ce qui est supposé et ce qui reste à vérifier ?', attendu: ['établi', 'supposé', 'à vérifier', 'ce qui manque'] },
  { id: 's1q2', max: 50, q: 'Quelle priorité retiens-tu, et pourquoi celle-là avant les autres ?', attendu: ['les personnes avant l’interpellation', 'justifier le choix', 'une seule priorité annoncée'] },
  { id: 's1q3', max: 50, q: 'Comment répartis-tu tes effectifs ? Donne les équipages, leurs missions et ce que tu gardes en réserve.', attendu: ['équipages nommés', 'une mission par équipage', 'jamais un agent seul', 'réserve'] },
  { id: 's1q4', max: 50, q: 'Quelles consignes donnes-tu avant le départ, et comment t’assures-tu qu’elles sont comprises ?', attendu: ['qui quoi où', 'une phrase par équipage', 'confirmation demandée', 'deux ou trois consignes'] },
  { id: 's1q5', max: 50, q: 'Qu’est-ce qui te ferait modifier ce dispositif ou demander d’autres moyens ?', attendu: ['information nouvelle', 'priorité qui change', 'effectif insuffisant', 'demander les moyens tôt'] },
  { id: 's1r1', max: 50, section: 'radio', q: 'Rédige tes messages radio de départ : au TN d’abord, puis une consigne à un équipage, confirmation comprise.', attendu: ['qui parle à qui', 'nous prenons', 'nombre d’équipages', 'message court', 'confirmation demandée'] }
];

export const QUESTIONS_SITUATION_2 = [
  { id: 's2q1', max: 50, q: 'La situation évolue : que change-tu dans ton organisation, et qu’est-ce que tu ne changes pas ?', attendu: ['réévaluer', 'nouvelle consigne annoncée', 'ne pas tout changer d’un coup', 'garder la priorité si elle tient'] },
  { id: 's2q2', max: 50, q: 'Comment annonces-tu le changement de plan pour qu’il soit compris du premier coup ?', attendu: ['annoncer que le plan change', 'une phrase par équipage', 'confirmation', 'pas de changement silencieux'] },
  { id: 's2q3', max: 50, q: 'L’imprévu arrive en plus. Comment le traites-tu sans lâcher l’intervention en cours ?', attendu: ['hiérarchiser', 'déléguer', 'demander des moyens', 'ne pas abandonner la priorité'] },
  { id: 's2q4', max: 50, q: 'Comment gardes-tu la vision d’ensemble pendant que tout bouge ?', attendu: ['point d’effectifs', 'point de situation régulier', 'savoir où est chaque équipage', 'déléguer le suivi'] },
  { id: 's2q5', max: 50, q: 'Comment conclus-tu l’intervention sur le plan du commandement et du suivi de tes agents ?', attendu: ['point d’effectifs final', 'état de chacun', 'débriefing', 'décision pour la prochaine fois'] },
  { id: 's2r1', max: 50, section: 'radio', q: 'Fais ton point de situation radio au moment le plus chargé, puis ton compte rendu final au TN.', attendu: ['point court', 'effectifs', 'ce qui est fait', 'résultat', 'blessés ou non', 'devenir du dispositif'] }
];
