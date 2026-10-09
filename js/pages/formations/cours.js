// Vue de cours — cahier des charges §6 (identité graphique validée :
// sombre, dense, structurée, menu latéral + contenu pédagogique très
// lisible) et §7.
//
// Un seul moteur de rendu pour les deux formations : les contenus sont des
// données (js/data/negociation.js, js/data/chef-de-groupe.js), la mise en
// page est ici. Ajouter une formation n'ajoute pas une vue.

import { esc } from '../../core/dom.js';
import { imageStyle } from '../../data/images.js';

export { reflexeCard } from './reflexe.js';

function paragraph(block) {
  return `<p class="co-p">${esc(block.text)}</p>`;
}

function list(block) {
  return `<ul class="co-list">${block.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function rp(block) {
  return `
    <div class="co-rp">
      <div class="co-tag">EXEMPLE EN JEU</div>
      <p>${esc(block.text)}</p>
    </div>`;
}

function dialogue(block) {
  const lines = String(block.text).split('\n').map(line => `<span>${esc(line)}</span>`).join('');
  return `
    <div class="co-dialogue">
      <div class="co-tag">ÉCHANGE TYPE</div>
      ${lines}
    </div>`;
}

function retenir(block) {
  return `
    <div class="co-retenir">
      <div class="co-tag">À RETENIR</div>
      <ul>${block.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>`;
}

function erreurs(block) {
  return `
    <div class="co-erreurs">
      <div class="co-tag">ERREURS À ÉVITER</div>
      <ul>${block.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>`;
}

function etapes(block) {
  const steps = block.steps
    .map(step => `<span class="co-step">${esc(step)}</span>`)
    .join('<span class="co-arrow">→</span>');
  return `<div class="co-etapes">${steps}</div>`;
}

function table(block) {
  const head = block.head.map(cell => `<th>${esc(cell)}</th>`).join('');
  const rows = block.rows
    .map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="co-tablewrap"><table class="co-table"><tr>${head}</tr>${rows}</table></div>`;
}

function exercice(block, record, disabled) {
  const value = record.work[block.id] || '';
  return `
    <div class="co-exercice">
      <div class="co-tag">EXERCICE</div>
      <p>${esc(block.text)}</p>
      ${block.hint ? `<p class="co-hint">Piste : ${esc(block.hint)}</p>` : ''}
      <label>Ta réponse</label>
      <textarea ${disabled} oninput="app.setWork('${esc(block.id)}',this.value)">${esc(value)}</textarea>
    </div>`;
}

const RENDERERS = {
  p: paragraph,
  liste: list,
  rp,
  dialogue,
  retenir,
  erreurs,
  etapes,
  table
};

export function renderBlocks(blocks, record, disabled) {
  return blocks.map(block => {
    if (block.t === 'exercice') return exercice(block, record, disabled);
    const render = RENDERERS[block.t];
    // Un type de bloc inconnu ne doit pas faire disparaître un chapitre :
    // on le signale au lieu de le taire.
    if (!render) return `<p class="co-p mut">[bloc « ${esc(block.t)} » non pris en charge]</p>`;
    return render(block);
  }).join('');
}

export function sidebar(course, record, activeId) {
  const items = course.chapters.map(chapter => {
    const done = Boolean(record.read[chapter.id]);
    const on = chapter.id === activeId;
    return `
      <button class="co-nav-item${on ? ' active' : ''}${done ? ' done' : ''}"
              onclick="app.openChapter('${esc(chapter.id)}')">
        <span class="co-num">${esc(chapter.num)}</span>
        <span class="co-navtitle">${esc(chapter.title)}</span>
        <span class="co-tick">${done ? '✓' : ''}</span>
      </button>`;
  }).join('');

  return `
    <aside class="co-side no-print">
      <div class="co-side-head">
        <b>Sommaire</b>
        <span class="mut">${course.chapters.length} chapitres</span>
      </div>
      <div class="co-nav">${items}</div>
    </aside>`;
}

export function chapterPanel(course, record, chapter, index, disabled) {
  const done = Boolean(record.read[chapter.id]);
  const previous = index > 0
    ? `<button onclick="app.openChapter('${esc(course.chapters[index - 1].id)}')">← ${esc(course.chapters[index - 1].title)}</button>`
    : '';
  const next = index < course.chapters.length - 1
    ? `<button class="primary right" onclick="app.nextChapter()">${esc(course.chapters[index + 1].title)} →</button>`
    : '<button class="primary right" onclick="app.openStep(\'eval\')">Passer à l’évaluation →</button>';

  return `
    <article class="co-main">
      <div class="co-banner" style="${imageStyle(course.image)}">
        <div class="co-banner-body">
          <div class="co-kicker">${esc(course.title)}</div>
          <h2>${esc(chapter.num)} — ${esc(chapter.title)}</h2>
        </div>
      </div>

      <div class="co-body">
        ${renderBlocks(chapter.blocks, record, disabled)}
      </div>

      <div class="co-read no-print">
        <label>
          <input class="inline-check" type="checkbox" ${done ? 'checked' : ''} ${disabled}
                 onchange="app.setRead('${esc(chapter.id)}',this.checked)">
          J’ai lu et compris ce chapitre
        </label>
      </div>

      <div class="stepnav no-print">${previous}${next}</div>
    </article>`;
}
