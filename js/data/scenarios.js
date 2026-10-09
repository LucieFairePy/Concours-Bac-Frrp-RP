import { isCurrentContent } from './content-set.js';

/** Mises en situation en vigueur — jeu V4, reprises de l'archive du kit. */
export const SCENARIOS = [
  {
    "title": "Situation 1 — Vol de sac",
    "statement": "Tu es responsable de 6 agents BAC. Un témoin signale un vol de sac. La personne qui l’a pris est partie à pied. Il y a beaucoup de passants.",
    "questions": [
      "Quelle est ta première décision ?",
      "Comment répartis-tu tes agents ?",
      "Quelles informations demandes-tu ?",
      "Que dis-tu au TN 75 ?",
      "Que fais-tu pour protéger les passants ?"
    ]
  },
  {
    "title": "Situation 2 — Cambriolage signalé",
    "statement": "Tu as 5 agents BAC disponibles. Le TN 75 signale un possible cambriolage dans une maison. On ne sait pas si quelqu’un est encore à l’intérieur.",
    "questions": [
      "Que veux-tu savoir avant d’envoyer tes agents ?",
      "Comment organises-tu tes équipes ?",
      "Que demandes-tu au TN 75 ?",
      "Que fais-tu si les informations changent ?",
      "Quand demandes-tu des renforts ?"
    ]
  },
  {
    "title": "Situation 3 — Personne agitée",
    "statement": "Tu es avec 4 agents BAC. Plusieurs personnes signalent quelqu’un qui crie dans une rue fréquentée. Les témoins ne sont pas d’accord sur ce qui se passe.",
    "questions": [
      "Que fais-tu en premier ?",
      "Quelles informations dois-tu vérifier ?",
      "Comment répartis-tu le travail de ton équipe ?",
      "Que dis-tu au TN 75 ?",
      "Comment réagis-tu si un témoin s’est trompé ?"
    ]
  },
  {
    "title": "Situation 4 — Collègue blessé",
    "statement": "Tu diriges 6 agents BAC. Pendant une intervention, un collègue semble blessé. Tu ne connais pas encore la gravité de sa blessure.",
    "questions": [
      "Quelle est ta priorité ?",
      "Comment fais-tu demander les secours ?",
      "Que dis-tu aux autres agents ?",
      "Comment protèges-tu les personnes sur place ?",
      "Quel compte rendu fais-tu ensuite ?"
    ]
  },
  {
    "title": "Situation 5 — Chef de vacation",
    "statement": "Tu diriges 8 agents BAC. Le TN 75 annonce une intervention urgente. Les informations sont encore incomplètes. Plusieurs personnes sont sur place.",
    "questions": [
      "Que fais-tu avant de prendre une décision ?",
      "Comment organises-tu les 8 agents ?",
      "Quelles consignes simples donnes-tu ?",
      "Quelles informations transmets-tu au TN 75 ?",
      "Que fais-tu si la situation change ?",
      "Quand demandes-tu du renfort ?",
      "Comment termines-tu l’intervention et le compte rendu ?"
    ]
  }
];

/**
 * Anciennes situations, gardées telles quelles : les dossiers créés avant
 * le jeu V4 ont leurs réponses rangées par index sous ces questions-là.
 */
export const SCENARIOS_LEGACY = [
  {
    "title": "Situation 1 — Vol à l’arraché / commandement",
    "statement": "À lire au candidat : « Vous êtes chef de vacation BAC au commissariat avec 6 agents disponibles. Un appel urgent signale une agression suivie d’un vol de sac à l’arraché. L’auteur fuit à pied vers des rues très fréquentées. Vous choisissez le dispositif RP que vous engagez et organisez vos effectifs. »",
    "questions": [
      "Quel dispositif choisissez-vous dans le cadre du jeu (BAC banalisée ou BAC 75N) et pourquoi ?",
      "Comment répartissez-vous les 6 agents et quelles missions attribuez-vous aux équipages ?",
      "Quel premier message radio faites-vous transmettre et quelles informations cherchez-vous immédiatement ?",
      "La fuite se poursuit dans une zone très fréquentée : comment adaptez-vous l’organisation de la vacation et vos priorités ?",
      "Quels éléments vous feraient modifier votre dispositif ou demander d’autres moyens ?"
    ]
  },
  {
    "title": "Situation 2 — Cambriolage en cours / départ commissariat",
    "statement": "À lire au candidat : « Vous êtes chef de vacation au commissariat avec 5 agents BAC disponibles. Le TN annonce un cambriolage en cours dans une maison. Un véhicule inconnu est signalé devant le domicile et plusieurs personnes pourraient se trouver à l’intérieur. Vous devez décider de l’engagement de votre vacation dans le cadre du RP. »",
    "questions": [
      "Quel dispositif choisissez-vous et comment justifiez-vous ce choix ?",
      "Avec 5 agents, comment constituez-vous vos équipages et répartissez-vous leurs missions ?",
      "Quelles informations demandez-vous ou vérifiez-vous avant et pendant le déplacement ?",
      "À l’arrivée, que faites-vous transmettre au TN et comment actualisez-vous votre organisation ?",
      "Si la situation devient plus complexe que prévu, comment exercez-vous votre commandement et adaptez-vous les moyens ?"
    ]
  },
  {
    "title": "Situation 3 — Intervention instable / informations contradictoires",
    "statement": "À lire au candidat : « Vous commandez une vacation de 4 agents BAC. Un appel signale un individu très agité dans un lieu fréquenté. Un témoin affirme qu’il pourrait représenter un danger important, un autre contredit cette information. Vous êtes responsable de la décision d’engagement de votre équipe. »",
    "questions": [
      "Quelle analyse faites-vous avant d’engager la vacation ?",
      "Quel dispositif RP choisissez-vous et pourquoi ?",
      "Comment répartissez-vous les 4 agents et quelles consignes générales donnez-vous ?",
      "Comment distinguez-vous faits établis, hypothèses et informations restant à vérifier ?",
      "Comment adaptez-vous votre commandement si de nouvelles informations contredisent votre analyse initiale ?"
    ]
  },
  {
    "title": "Situation 4 — Intervention dégradée / collègue en difficulté",
    "statement": "À lire au candidat : « Vous êtes chef de vacation avec 6 agents répartis dans plusieurs équipages. Une intervention se dégrade et un collègue est signalé en difficulté, possiblement blessé. L’environnement reste instable et plusieurs personnes sont présentes. »",
    "questions": [
      "Quelles priorités de commandement fixez-vous immédiatement ?",
      "Comment réorganisez-vous les effectifs disponibles et la coordination des équipages ?",
      "Quelles informations faites-vous transmettre au TN et quels secours demandez-vous selon les éléments constatés ?",
      "Comment maintenez-vous une vision d’ensemble tout en faisant porter assistance au collègue ?",
      "Après stabilisation, comment organisez-vous le compte rendu et la continuité de la vacation ?"
    ]
  },
  {
    "title": "Situation 5 — Finale de commandement BAC",
    "statement": "À lire au candidat : « Vous êtes le plus haut gradé d’une vacation de 8 agents BAC au commissariat. Un appel urgent décrit une intervention grave et évolutive. Les informations initiales sont incomplètes, plusieurs personnes sont signalées sur place et d’autres unités peuvent être sollicitées. Dans le cadre du jeu, vous choisissez votre dispositif, organisez votre vacation et restez responsable de son adaptation. »",
    "questions": [
      "Quel dispositif RP choisissez-vous au départ et quels éléments motivent votre choix ?",
      "Avec 8 agents, combien d’équipages constituez-vous et comment répartissez-vous les rôles ?",
      "Quelles consignes et informations prioritaires donnez-vous avant le départ ?",
      "Comment organisez-vous les transmissions et la remontée d’informations entre vos équipages ?",
      "Une information importante change en cours d’intervention : comment réévaluez-vous votre plan et communiquez-vous la nouvelle décision ?",
      "À quel moment demandez-vous des moyens supplémentaires ou décidez-vous de temporiser ?",
      "Comment concluez-vous l’intervention sur le plan du commandement, du compte rendu et du suivi de vos effectifs ?"
    ]
  }
];

/** Mises en situation sous lesquelles ce dossier a été passé. */
export function scenariosOf(dossier) {
  return isCurrentContent(dossier) ? SCENARIOS : SCENARIOS_LEGACY;
}
