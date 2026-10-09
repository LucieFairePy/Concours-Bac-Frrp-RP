// Mise en page du module antiterrorisme — le HTML de l'archive V4
// (modules/formation-antiterrorisme.html), balise pour balise : bannière,
// sommaire interactif, treize chapitres dont un seul est visible, pied de
// chapitre « précédent / suivant ». Les classes portent le préfixe `at-`
// (css/pages/formation-antiterrorisme.css).
//
// Seul ajout : la vue d'un ancien dossier, ouvert depuis l'historique, que
// l'archive ne connaît pas (voir ../antiterrorisme.js).

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { LOGO } from '../../../data/images.js';

const KIT = 'assets/bac75n';

const logo = (cls, alt) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${LOGO.file}"${alt ? ` alt="${alt}"` : ''} onerror="this.onerror=null;this.src='${LOGO.fallback}'">`;

function hero(course) {
  const { kicker, lead, accent, tagline } = course.hero;
  return `<header class="at-hero no-print">${logo('at-heroLogo', 'Logo BAC 75 N')}<div class="at-heroCopy"><small>${esc(kicker)}</small><h1>${esc(lead)} <em>${esc(accent)}</em></h1><p>${esc(tagline)}</p></div><a class="at-back" href="${href('formations')}">← Retour au portail</a></header>`;
}

function side(course) {
  const items = course.chapters.map((chapter, index) =>
    `<button class="at-nav${index === 0 ? ' active' : ''}" data-c="${index}" onclick="app.show(${index})"><b>${esc(chapter.num)}</b><span>${esc(chapter.title)}</span></button>`
  ).join('');

  return `<aside class="at-side"><div class="at-sideTop">${logo('', '')}<div><b>BAC 75 N</b><small>Formation complète</small></div></div><h3>SOMMAIRE INTERACTIF</h3>${items}</aside>`;
}

// Le corps du chapitre est le HTML de l'archive, gardé tel quel dans
// js/data/formations/antiterrorisme.js : contenu statique du dépôt, jamais
// une saisie.
function chapter(course, item, index) {
  const total = String(course.chapters.length).padStart(2, '0');
  return `<section class="at-chapter${index === 0 ? ' active' : ''}" id="${esc(item.id)}">
<div class="at-chapterHead"><div><span class="at-num">${esc(item.num)}</span><h2>${esc(item.title)}</h2><p>${esc(item.subtitle)}</p></div><img src="${KIT}/${esc(item.image)}" alt="Illustration BAC 75 N"></div>
<div class="at-content">
${item.html.join('\n')}</div><div class="at-chapterFoot"><button class="at-prev" onclick="app.step(-1)">← Chapitre précédent</button><span>${esc(item.num)} / ${total}</span><button class="at-next" onclick="app.step(1)">Chapitre suivant →</button></div></section>`;
}

/** L'écran du module, comme l'archive l'ouvre ; #coursWrap reçoit main(). */
export function page(course) {
  return `<div class="m-anti">
${hero(course)}
<div class="at-layout">${side(course)}<div class="at-main" id="coursWrap"></div></div></div>`;
}

/** Fil d'Ariane et les treize chapitres, le premier ouvert. */
export function main(course) {
  return `<div class="at-crumb">${esc(course.crumb)}</div>${course.chapters.map((item, index) => chapter(course, item, index)).join('')}`;
}

/** Un ancien dossier de la formation : sa fiche A4, en lecture seule. */
export function dossierPage(course, id) {
  return `<div class="m-anti">
${hero(course)}
<div class="at-dossier">
  <div class="at-dossierBar no-print">
    <b>${esc(course.title)}</b>
    <span>dossier ${esc(id)}</span>
    <span id="sync"></span>
    <span class="at-spacer"></span>
    <button onclick="app.downloadPdf()">Télécharger en PDF</button>
  </div>
  <section id="s-final" class="section printme active"><div id="sheet"></div></section>
</div></div>`;
}
