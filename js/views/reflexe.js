// Fiche réflexe, affichée telle quelle — §6 et §7.
//
// Ce bloc vit à part de la vue de cours parce qu'il ne porte aucun
// gestionnaire : la page Formations peut donc l'afficher sans embarquer les
// gabarits interactifs du cours, dont elle ne déclare pas les handlers.

import { esc } from '../core/dom.js';

export function reflexeCard(course) {
  const steps = course.reflexe.steps
    .map(step => `<span class="co-step">${esc(step)}</span>`)
    .join('<span class="co-arrow">→</span>');

  return `
    <div class="co-reflexe">
      <div class="co-tag">${esc(course.reflexe.title)}</div>
      <div class="co-etapes">${steps}</div>
    </div>`;
}
