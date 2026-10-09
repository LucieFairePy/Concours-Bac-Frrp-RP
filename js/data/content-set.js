/**
 * Version du contenu d'épreuve (exercice radio et mises en situation).
 *
 * Les réponses d'un dossier sont rangées par index sous les questions du
 * jeu en vigueur le jour du passage. Un nouveau dossier est donc estampillé
 * avec le jeu courant ; un dossier sans estampille a été passé sous l'ancien
 * jeu et doit continuer à s'afficher et à se noter sous celui-ci.
 */
export const CONTENT_SET = 'v4';

export function isCurrentContent(dossier) {
  return Boolean(dossier) && dossier.contentSet === CONTENT_SET;
}
