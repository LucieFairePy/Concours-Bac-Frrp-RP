import { isCurrentContent } from './content-set.js';

/** Exercice radio en vigueur — jeu V4, repris de l'archive du kit. */
export const RADIO_EXERCISE = {
  "title": "Exercice radio — appel simple",
  "statement": "À lire au candidat : « Tu es en patrouille BAC. Un témoin signale le vol de son téléphone. Il donne une description de la personne qui est partie. »",
  "questions": [
    "Que dis-tu au TN 75 pour signaler les faits ?",
    "Quelles informations donnes-tu aux autres équipes ?",
    "Que dis-tu si tu as besoin de renfort ?",
    "Que transmets-tu quand la situation est terminée ?"
  ]
};

/**
 * Ancien exercice, gardé tel quel : les dossiers créés avant le jeu V4
 * ont leurs réponses rangées par index sous ces questions-là.
 */
export const RADIO_EXERCISE_LEGACY = {
  "title": "Exercice radio — intervention évolutive",
  "statement": "À lire au candidat : « Vous êtes en patrouille BAC. Un témoin signale une agression avec vol de téléphone. L’auteur vient de prendre la fuite. Vous disposez d’un signalement partiel et la zone est fréquentée. Quelques instants plus tard, un équipage vous indique avoir repéré une personne correspondant au signalement. »",
  "questions": [
    "Quel premier message transmettez-vous au TN / à la fréquence ?",
    "Quelles informations donnez-vous à l’équipage qui vient de repérer la personne ?",
    "La situation évolue et vous avez besoin de moyens complémentaires : comment formulez-vous votre demande radio ?",
    "Une fois la situation stabilisée, quel compte rendu synthétique transmettez-vous ?"
  ]
};

/** Exercice radio sous lequel ce dossier a été passé. */
export function radioOf(dossier) {
  return isCurrentContent(dossier) ? RADIO_EXERCISE : RADIO_EXERCISE_LEGACY;
}
