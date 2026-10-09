// Mise en page du module chef-de-groupe — reprise de la maquette V4
// (modules/formation-chef-groupe.html de l'archive).
// Exporte `page()` et `cours()` : voir l'en-tête de engine.js.
//
// La maquette : barre « ← Retour au portail BAC 75 N » et logo, bandeau
// photo « FORMATION • COMMANDEMENT », sommaire « LES 16 CHAPITRES » à
// gauche, et à droite « Chapitre n sur 16 » puis une carte de module
// (MODULE 01, titre, introduction, grande photo, « Ce qu'il faut
// comprendre »). Le parcours du portail (identité, cours, évaluation,
// correction, fiche finale) garde ses étapes, habillées de la même façon.
// Toute la feuille de style vit sous `.m-fcdg`
// (css/pages/formation-chef-groupe.css).

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { imageStyle, imageSources, LOGO } from '../../../data/images.js';
import { renderBlocks } from '../cours.js';

/** La maquette fait tourner quatre photos d'un chapitre à l'autre. */
const CHAPTER_PHOTOS = ['formation-cdg', 'cours-cdg', 'effectifs', 'administration'];

function photo(slot, alt, className) {
  const { src, fallback } = imageSources(slot);
  return `<img class="${className}" src="${src}" alt="${esc(alt)}" loading="lazy"
               onerror="this.onerror=null;this.src='${fallback}'">`;
}

export function page({ course }) {
  const count = course.chapters.length;
  return `
    <section id="home" class="view m-fcdg">
      <header class="fcdg-head no-print">
        <a class="fcdg-back" href="${href('accueil')}">← Retour au portail BAC 75 N</a>
        <div class="fcdg-tools">
          <span id="sync" class="fcdg-sync"></span>
          <div id="pageActions" class="fcdg-actions"></div>
          <img class="fcdg-logo" src="${LOGO.file}" alt="Logo BAC 75 N" width="55" height="55"
               onerror="this.onerror=null;this.src='${LOGO.fallback}'">
        </div>
      </header>

      <div class="fcdg-hero no-print" style="${imageStyle('cours-cdg')}">
        <div class="fcdg-hero-body">
          <div class="fcdg-pill">FORMATION • COMMANDEMENT</div>
          <h1>CHEF DE GROUPE BAC 75 N</h1>
          <p>${count} chapitres complets : comprendre, organiser, communiquer et coordonner une vacation.</p>
          <div class="fcdg-dossier" id="hero">${esc(course.title)}</div>
        </div>
      </div>

      <div class="fcdg-wrap">
        <div class="fcdg-steps no-print">
          <div id="tabs" class="tabs"></div>
          <div class="fcdg-stepline">
            <div class="progress"><span id="prog"></span></div>
            <div id="stepText" class="steptext"></div>
          </div>
        </div>
        <div id="sections"></div>
      </div>
    </section>`;
}

function chapterNav(course, record, activeId) {
  const items = course.chapters.map(chapter => {
    const done = Boolean(record.read[chapter.id]);
    const on = chapter.id === activeId;
    return `
      <button class="${on ? 'active' : ''}${done ? ' done' : ''}"
              onclick="app.openChapter('${esc(chapter.id)}')">
        ${esc(chapter.num)} — ${esc(chapter.title)}${done ? ' <span class="fcdg-tick">✓</span>' : ''}
      </button>`;
  }).join('');

  return `
    <nav class="fcdg-nav no-print" aria-label="Sommaire interactif">
      <b>LES ${course.chapters.length} CHAPITRES</b>
      ${items}
    </nav>`;
}

export function cours({ course, record, chapter, index, dis }) {
  const total = course.chapters.length;
  const done = Boolean(record.read[chapter.id]);
  const [first, ...rest] = chapter.blocks;
  const intro = first && first.t === 'p' ? first : null;
  const body = intro ? rest : chapter.blocks;
  const previous = index > 0 ? course.chapters[index - 1] : null;
  const slot = CHAPTER_PHOTOS[index % CHAPTER_PHOTOS.length];

  return `
    ${chapterNav(course, record, chapter.id)}
    <div class="fcdg-lesson" aria-live="polite">
      <div class="fcdg-progress">Chapitre ${index + 1} sur ${total}</div>
      <article class="fcdg-card">
        <span class="fcdg-pill">MODULE ${esc(chapter.num)}</span>
        <h2>${esc(chapter.title)}</h2>
        ${intro ? `<p class="fcdg-intro">${esc(intro.text)}</p>` : ''}
        ${photo(slot, 'Photographie illustrative de la BAC 75 N', 'fcdg-img')}
        <h3>Ce qu'il faut comprendre</h3>
        <div class="fcdg-blocks">${renderBlocks(body, record, dis)}</div>
        <label class="fcdg-read no-print">
          <input class="inline-check" type="checkbox" ${done ? 'checked' : ''} ${dis}
                 onchange="app.setRead('${esc(chapter.id)}',this.checked)">
          J’ai lu et compris ce chapitre
        </label>
      </article>
      <div class="fcdg-actions-row no-print">
        <button ${previous ? '' : 'disabled'}
                onclick="app.openChapter('${esc(previous ? previous.id : chapter.id)}')">← Précédent</button>
        <button ${index < total - 1 ? '' : 'disabled'} onclick="app.nextChapter()">Suivant →</button>
        <button class="fcdg-link" onclick="app.openStep('eval')">Passer à l’évaluation</button>
      </div>
    </div>`;
}
