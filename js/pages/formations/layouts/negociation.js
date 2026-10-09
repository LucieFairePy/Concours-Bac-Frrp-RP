// Mise en page du module negociation — reprise de la maquette V4
// (modules/formation-negociation.html) : barre collante de retour au
// portail, grande bannière tricolore, quatre accès thématiques, sommaire à
// gauche, ligne de progression, carte de leçon (numéro, titre, photo),
// panneau « Comprendre » et colonne « À retenir ».
//
// Le parcours du dossier (Identité → Cours → Évaluation → Correction →
// Fiche finale) reste celui du moteur commun (engine.js) : seuls l'écran et
// le cours changent d'habit. Les blocs pédagogiques passent par le rendu
// commun (cours.js), qui garde les gestionnaires des exercices.
// Tout le style est rangé sous `.m-nego` (css/pages/formation-negociation.css).

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { imageStyle } from '../../../data/images.js';
import { renderBlocks } from '../cours.js';

/** Accès rapides de la maquette : thème → chapitre d'entrée. */
const QUICK = [
  { label: 'Fondamentaux', chapter: 'role' },
  { label: 'Écoute active', chapter: 'ecoute' },
  { label: 'Coordination', chapter: 'equipe' },
  { label: 'Mise en situation', chapter: 'finale' }
];

/**
 * Photos des cartes de leçon, dans l'ordre de la maquette (nego1, nego2,
 * operator, nego1, nego2, plain…), traduites en places de la banque
 * d'images ; au-delà, la suite reprend depuis le début.
 */
const LESSON_IMAGES = [
  'negociation', 'cours-negociation', 'cdg', 'negociation', 'cours-negociation',
  'concours', 'cdg', 'negociation', 'cours-negociation', 'concours',
  'cdg', 'negociation', 'cours-negociation', 'sidebar-citation', 'formation-cdg',
  'cdg', 'negociation', 'cours-negociation', 'negociation', 'cdg'
];

const REFLEXE = 'Rester calme · distinguer fait et hypothèse · ne pas promettre sans validation · informer le commandement.';

export function page({ course }) {
  return `
    <section id="home" class="view m-nego">
      <div class="mn-top no-print">
        <a class="mn-back" href="${href('accueil')}">← Portail BAC 75 N</a>
        <div class="mn-brand">FORMATION NÉGOCIATION BAC 75 N<small>Communication · analyse · coordination · mise en situation</small></div>
        <div class="mn-actions" id="pageActions"></div>
        <div class="mn-id"><b>BAC 75 N</b><small>Support de formation</small><span id="sync"></span></div>
      </div>

      <div class="hero mn-hero" style="${imageStyle('negociation')}">
        <div class="flag"></div>
        <div class="mn-tri no-print"></div>
        <h1 class="no-print">FORMATION<br>NÉGOCIATION BAC 75 N</h1>
        <p class="mn-lead no-print">Écouter · comprendre · reformuler · transmettre · temporiser · rechercher une issue</p>
        <h2 id="hero">${esc(course.title)}</h2>
        <div class="mut" id="heroSub">${course.chapters.length} chapitres • évaluation /${course.evaluation.max} • fiche finale imprimable</div>
      </div>

      <div class="mn-wrap">
        <div class="mn-steps no-print">
          <div id="tabs" class="tabs"></div>
          <div class="progress"><span id="prog"></span></div>
          <div id="stepText" class="steptext"></div>
        </div>
        <div id="sections"></div>
      </div>
    </section>`;
}

function chapterList(course, record, activeId) {
  const items = course.chapters.map(chapter => {
    const on = chapter.id === activeId;
    const done = Boolean(record.read[chapter.id]);
    return `
      <button class="${on ? 'on' : ''}${done ? ' done' : ''}" onclick="app.openChapter('${esc(chapter.id)}')">
        <b>${esc(chapter.num)}</b> — ${esc(chapter.title)}${done ? '<i class="mn-tick" title="Chapitre lu">✓</i>' : ''}
      </button>`;
  }).join('');
  return `<aside class="mn-side no-print">${items}</aside>`;
}

/** Les blocs « À retenir » vont dans la colonne de droite, comme la maquette. */
function splitBlocks(blocks) {
  const main = [];
  const remember = [];
  for (const block of blocks) (block.t === 'retenir' ? remember : main).push(block);
  return { main, remember };
}

function comprendre(blocks, record, dis) {
  let pointsShown = false;
  return blocks.map(block => {
    let title = '';
    if (block.t === 'liste' && !pointsShown) {
      pointsShown = true;
      title = '<h3>Points essentiels</h3>';
    }
    return title + renderBlocks([block], record, dis);
  }).join('');
}

function rememberColumn(course, remember) {
  const items = remember.flatMap(block => block.items);
  const box = items.length
    ? `<div class="mn-remember"><ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>`
    : '';
  return `
    <aside class="mn-panel mn-aside">
      <h3>À retenir</h3>
      ${box}
      <div class="mn-example"><b>MÉTHODE GÉNÉRALE</b><br>${course.reflexe.steps.map(esc).join(' → ')}.</div>
      <div class="mn-example"><b>RÉFLEXE</b><br>${esc(REFLEXE)}</div>
    </aside>`;
}

export function cours({ course, record, chapter, index, dis }) {
  const total = course.chapters.length;
  const done = Boolean(record.read[chapter.id]);
  const { main, remember } = splitBlocks(chapter.blocks);
  const slot = LESSON_IMAGES[index % LESSON_IMAGES.length];

  const quick = QUICK.map(entry =>
    `<button onclick="app.openChapter('${esc(entry.chapter)}')">${esc(entry.label)}</button>`).join('');

  const previous = index > 0
    ? `<button class="mn-btn ghost" onclick="app.openChapter('${esc(course.chapters[index - 1].id)}')">← Précédent</button>`
    : '<button class="mn-btn ghost" disabled>← Précédent</button>';
  const next = index < total - 1
    ? '<button class="mn-btn" onclick="app.nextChapter()">Suivant →</button>'
    : '<button class="mn-btn" onclick="app.openStep(\'eval\')">Passer à l’évaluation →</button>';

  return `
    <div class="mn-quick no-print">${quick}</div>
    ${chapterList(course, record, chapter.id)}
    <div class="mn-content">
      <div class="mn-lesson" style="${imageStyle(slot)}">
        <div class="mn-inside">
          <span class="mn-no">${esc(chapter.num)}</span>
          <h2>${esc(chapter.title)}</h2>
          <p>Chapitre ${esc(chapter.num)} sur ${total}${done ? ' · lu' : ''}</p>
        </div>
      </div>

      <div class="mn-grid">
        <section class="mn-panel mn-main">
          <h3>Comprendre</h3>
          ${comprendre(main, record, dis)}
        </section>
        ${rememberColumn(course, remember)}
      </div>

      <div class="mn-read no-print">
        <label>
          <input class="inline-check" type="checkbox" ${done ? 'checked' : ''} ${dis}
                 onchange="app.setRead('${esc(chapter.id)}',this.checked)">
          J’ai lu et compris ce chapitre
        </label>
      </div>

      <div class="mn-navrow no-print">${previous}${next}</div>
    </div>`;
}
