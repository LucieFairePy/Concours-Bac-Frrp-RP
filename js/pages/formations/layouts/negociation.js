// Mise en page de la Formation Négociation — reprise exacte du module de
// l'archive V4 (modules/formation-negociation.html + module.css) : barre
// collante de retour au portail, bannière tricolore, quatre accès rapides,
// sommaire à gauche, ligne de progression, photo du chapitre, panneau
// « Comprendre » et colonne « À retenir », boutons Précédent / Suivant /
// Imprimer.
//
// Ces fonctions ne rendent que du HTML ; l'état (chapitre ouvert, dossier
// relu) est tenu par la page (js/pages/formations/negociation.js). Tout le
// style est rangé sous `.m-nego` (css/pages/formation-negociation.css).

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { imageStack, imageStyle } from '../../../data/images.js';
import {
  CHAPTERS,
  QUICK,
  METHODE,
  REFLEXE,
  EXAMPLES,
  GRID_CHAPTER,
  GRID
} from '../../../data/formations/negociation-cours.js';

/** Barre collante du module : retour au portail, marque, identité. */
function top() {
  return `
    <div class="mn-top">
      <a class="mn-back" href="${href('accueil')}">← Portail BAC 75 N</a>
      <div class="mn-brand">FORMATION NÉGOCIATION BAC 75 N<small>Communication · analyse · coordination · mise en situation</small></div>
      <div class="mn-id"><b>BAC 75 N</b><small>Support de formation</small><span id="sync"></span></div>
    </div>`;
}

/** Bannière photo, dégradé de l'archive par-dessus l'image nego1. */
function hero() {
  return `
    <div class="mn-hero" style="background-image:linear-gradient(90deg,#03080deb,#03080d75),${imageStack('negociation')}">
      <div>
        <div class="mn-tri"></div>
        <h1>FORMATION<br>NÉGOCIATION BAC 75 N</h1>
        <p>Écouter · comprendre · reformuler · transmettre · temporiser · rechercher une issue</p>
      </div>
    </div>`;
}

/** L'écran du cours : le sommaire (#toc) et le chapitre (#lesson) sont peints par la page. */
export function page() {
  const quick = QUICK.map(entry =>
    `<button onclick="app.go(${entry.index})">${esc(entry.label)}</button>`).join('');

  return `
    <section class="m-nego">
      ${top()}
      ${hero()}
      <div class="mn-wrap">
        <div class="mn-quick">${quick}</div>
        <div class="mn-shell">
          <aside class="mn-side" id="toc"></aside>
          <div class="mn-content">
            <div class="mn-progress"><span id="prog"></span></div>
            <div id="lesson"></div>
          </div>
        </div>
      </div>
    </section>`;
}

/** Sommaire : un bouton par chapitre, celui ouvert allumé. */
export function toc(active) {
  return CHAPTERS.map((chapter, index) =>
    `<button class="${index === active ? 'on' : ''}" onclick="app.go(${index})"><b>${esc(chapter.n)}</b> — ${esc(chapter.title)}</button>`).join('');
}

/** Encadré propre à certains chapitres : exemple, ou grille d'évaluation au dernier. */
function extra(chapter) {
  if (chapter.n === GRID_CHAPTER) {
    const fields = GRID.map(field => `
      <div class="mn-field">${esc(field.label)} /${field.max}<input type="number" min="0" max="${field.max}"></div>`).join('');
    return `<div class="mn-panel"><h3>Grille d’évaluation</h3><div class="mn-score">${fields}</div></div>`;
  }
  const example = EXAMPLES[chapter.n];
  if (!example) return '';
  return `<div class="mn-example"><b>${esc(example.title)}</b><br>${example.lines.map(esc).join('<br>')}</div>`;
}

/** Le chapitre ouvert : photo, « Comprendre », « À retenir », navigation. */
export function lesson(index) {
  const chapter = CHAPTERS[index];
  const points = chapter.points.map(point => `<li>${esc(point)}</li>`).join('');

  return `
    <div class="mn-lesson" style="${imageStyle(chapter.image)}">
      <div class="mn-inside">
        <span class="mn-no">${esc(chapter.n)}</span>
        <h2>${esc(chapter.title)}</h2>
        <p>${esc(chapter.sub)}</p>
      </div>
    </div>
    <div class="mn-grid">
      <section class="mn-panel">
        <h3>Comprendre</h3>
        <p>${esc(chapter.desc)}</p>
        <h3>Points essentiels</h3>
        <ul class="mn-points">${points}</ul>
        ${extra(chapter)}
      </section>
      <aside class="mn-panel">
        <h3>À retenir</h3>
        <div class="mn-remember">${esc(chapter.remember)}</div>
        <div class="mn-example"><b>MÉTHODE GÉNÉRALE</b><br>${esc(METHODE)}</div>
        <div class="mn-example"><b>RÉFLEXE</b><br>${esc(REFLEXE)}</div>
      </aside>
    </div>
    <div class="mn-navrow no-print">
      <button class="mn-btn ghost" onclick="app.go(${Math.max(0, index - 1)})">← Précédent</button>
      <button class="mn-btn" onclick="app.go(${Math.min(CHAPTERS.length - 1, index + 1)})">Suivant →</button>
      <button class="mn-btn ghost" onclick="app.print()">Imprimer / PDF</button>
    </div>`;
}

/**
 * Un ancien dossier rouvert depuis l'historique : la même barre, puis sa
 * fiche finale en lecture seule (#sheet, peinte par fiche.js).
 */
export function dossier() {
  return `
    <section class="m-nego mn-dossier">
      ${top()}
      <div class="mn-wrap">
        <div class="mn-navrow no-print">
          <a class="mn-btn ghost" href="${href('formation-negociation')}">← Formation</a>
          <button class="mn-btn" onclick="app.print()">Imprimer / PDF</button>
        </div>
        <section id="s-final" class="section active printme"><div id="sheet"></div></section>
      </div>
    </section>`;
}
