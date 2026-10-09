// Mise en page du module antiterrorisme — reprise de la maquette V4
// (modules/formation-antiterrorisme.html). Exporte `page()` et `cours()` :
// voir l'en-tête de engine.js.
//
// La maquette écrit chaque chapitre à la main ; ici le contenu reste une
// donnée (js/data/formations/antiterrorisme.js) et ce fichier lui rend la
// forme du module d'origine :
//   • première phrase du chapitre      → sous-titre de la bannière
//   • « Libellé : texte » d'un encadré  → titre de l'encadré (rouge pour un
//     fait historique, une limite, une erreur, une priorité… ; or pour la
//     négociation ; bleu sinon)
//   • tableau court à trois lignes      → trois cartes
//   • enchaînement numéroté             → cases « 1 LIEU », sinon bandeau
//     « OBSERVER → LOCALISER → … »
//   • paragraphe « Titre : … » ou « Question ? … » → intertitre + texte
// Les blocs que la maquette ne connaît pas passent par le rendu commun
// (cours.js). Les poignées restent celles du moteur : app.setWork,
// app.setRead, app.openChapter, app.nextChapter, app.openStep.

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { LOGO, imageStyle } from '../../../data/images.js';
import { renderBlocks } from '../cours.js';

// Photo de bannière de chaque chapitre, dans l'ordre de la maquette.
const CHAPTER_IMAGES = {
  bataclan: 'administration',
  primo: 'cours-antiterrorisme',
  'bac-psig': 'cours-cdg',
  unites: 'cdg',
  detection: 'sidebar-citation',
  transmission: 'accueil-hero',
  zonage: 'administration',
  victimes: 'actualite-interpellation',
  relais: 'effectifs',
  degradees: 'sidebar-citation',
  exercices: 'cdg',
  finale: 'cours-cdg',
  evaluation: 'logo',
  reflexe: 'cours-antiterrorisme'
};

const RED = /fait historique|limite|erreur|priorit|discipline|périmètre/i;
const GOLD = /négociation/i;

const logoImg = (cls, size) => `
  <img class="${cls}" src="${LOGO.file}" width="${size}" height="${size}" alt="Logo BAC 75 N"
       onerror="this.onerror=null;this.src='${LOGO.fallback}'">`;

const upper = text => String(text).toLocaleUpperCase('fr-FR');
const capital = text => (text ? text[0].toLocaleUpperCase('fr-FR') + text.slice(1) : text);

/** « Libellé : suite » → { label, rest } quand le libellé est court. */
function labelled(text, max = 32) {
  const match = /^([^:.!?«]{2,40}?) : (.+)$/s.exec(String(text));
  if (!match || match[1].length > max) return { label: '', rest: String(text) };
  return { label: match[1].trim(), rest: capital(match[2].trim()) };
}

/** Première phrase d'un paragraphe, et le reste. */
function firstSentence(text) {
  const match = /^(.+?[.!?])\s+(.+)$/s.exec(String(text));
  if (!match) return { head: String(text).replace(/\.$/, ''), rest: '' };
  return { head: match[1].replace(/\.$/, ''), rest: match[2] };
}

// ───────────────────────────── Blocs ─────────────────────────────────

function paragraph(block) {
  const text = String(block.text);

  // « Missions pédagogiques du primo-intervenant : » → intertitre.
  if (/ :$/.test(text) && text.length < 90) return `<h3>${esc(text.replace(/ :$/, ''))}</h3>`;

  // « Pourquoi cet épisode ouvre la formation ? Parce que… »
  const question = /^([^.?!]{8,90}\?)\s+(.+)$/s.exec(text);
  if (question) return `<h3>${esc(question[1])}</h3><p>${esc(question[2])}</p>`;

  // « Complémentarité : le Schéma… »
  const { label, rest } = labelled(text, 24);
  if (label) return `<h3>${esc(label)}</h3><p>${esc(rest)}</p>`;

  return `<p>${esc(text)}</p>`;
}

function keyBox(label, lines) {
  const tone = RED.test(label) ? ' redbox' : GOLD.test(label) ? ' gold' : '';
  const title = /^fait historique$/i.test(label) ? 'FAIT HISTORIQUE À RETENIR' : upper(label || 'À retenir');
  return `
    <div class="at-key${tone}">
      <b>${esc(title)}</b>
      ${lines.map(line => `<span>${esc(line)}</span>`).join('')}
    </div>`;
}

function retenir(block) {
  const items = block.items.map(String);
  const first = labelled(items[0]);

  // Plusieurs encadrés titrés à la suite (« BRI-UCT : … », « Négociation : … »).
  const titled = items.map(item => labelled(item));
  if (items.length > 1 && titled.every(item => item.label)) {
    return titled.map(item => keyBox(item.label, [item.rest])).join('');
  }

  if (first.label) {
    // La suite d'un encadré titré se lit comme un seul texte, comme dans la maquette.
    return keyBox(first.label, [[first.rest, ...items.slice(1)].join(' ')]);
  }
  return keyBox('', items);
}

function erreurs(block) {
  return keyBox(block.items.length > 1 ? 'Erreurs à éviter' : 'Erreur à éviter', block.items.map(String));
}

function etapes(block) {
  const numbered = block.steps.map(step => /^(\d+)\s*·\s*(.+)$/.exec(step));
  if (numbered.every(Boolean)) {
    return `<div class="at-steps">${numbered
      .map(([, num, label]) => `<span><b>${esc(num)}</b>${esc(label)}</span>`)
      .join('')}</div>`;
  }
  return `<div class="at-reflex">${block.steps.map(step => esc(step)).join(' <i>→</i> ')}</div>`;
}

function table(block) {
  const short = block.rows.every(row => row.length === 2 && String(row[0]).length <= 24);
  if (block.rows.length === 3 && short) {
    return `<div class="at-grid3">${block.rows.map(([title, text]) => `
      <div class="at-mini"><b>${esc(upper(title))}</b><span>${esc(text)}</span></div>`).join('')}
    </div>`;
  }
  const score = /barème/i.test(String(block.head[block.head.length - 1]));
  const head = block.head.map(cell => `<th>${esc(upper(cell))}</th>`).join('');
  const rows = block.rows
    .map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="at-tablewrap"><table class="at-table${score ? ' score' : ''}"><tr>${head}</tr>${rows}</table></div>`;
}

function rp(block) {
  const { label, rest } = labelled(block.text);
  const scenario = /scénario/i.test(label);
  return `
    <div class="${scenario ? 'at-scenario' : 'at-example'}">
      <b>${esc(upper(label || 'Exemple en jeu'))}</b>
      <p>${esc(rest)}</p>
    </div>`;
}

function liste(block) {
  const items = block.items.map(String);
  const numbered = items.every(item => /^\d+\.\s/.test(item));
  if (numbered) return `<ol>${items.map(item => `<li>${esc(item.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
  return `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function questions(heading, block) {
  return `
    <div class="at-questions">
      <b>${esc(upper(heading.replace(/ :$/, '')))}</b>
      ${block.items.map(item => `<span>${esc(item)}</span>`).join('')}
    </div>`;
}

function exercice(block, record, dis) {
  const { head, rest } = firstSentence(block.text);
  const value = record.work[block.id] || '';
  return `
    <div class="at-exercise">
      <b>${esc(upper(head))}</b>
      <span>${esc(rest)}</span>
      ${block.hint ? `<span class="at-hint">Piste : ${esc(block.hint)}</span>` : ''}
      <label>Ta réponse</label>
      <textarea ${dis} oninput="app.setWork('${esc(block.id)}',this.value)">${esc(value)}</textarea>
    </div>`;
}

const RENDERERS = { p: paragraph, retenir, erreurs, etapes, table, rp, liste };

function renderContent(blocks, record, dis) {
  const out = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const next = blocks[i + 1];

    // « Les 5 questions à se poser : » suivi de la liste → encadré de la maquette.
    if (block.t === 'p' && /questions/i.test(block.text) && / :$/.test(block.text) && next && next.t === 'liste') {
      out.push(questions(block.text, next));
      i += 1;
    } else if (block.t === 'exercice') {
      out.push(exercice(block, record, dis));
    } else if (RENDERERS[block.t]) {
      out.push(RENDERERS[block.t](block));
    } else {
      out.push(renderBlocks([block], record, dis));
    }
  }
  return out.join('');
}

// ───────────────────────────── Cours ─────────────────────────────────

function side(course, record, activeId) {
  const items = course.chapters.map(chapter => {
    const done = Boolean(record.read[chapter.id]);
    const on = chapter.id === activeId;
    return `
      <button class="at-nav${on ? ' active' : ''}${done ? ' done' : ''}" data-chap="${esc(chapter.id)}"
              onclick="app.openChapter('${esc(chapter.id)}')">
        <b>${esc(chapter.num)}</b>
        <span>${esc(chapter.title)}</span>
        <i>${done ? '✓' : ''}</i>
      </button>`;
  }).join('');

  return `
    <aside class="at-side no-print">
      <div class="at-sideTop">
        ${logoImg('at-sideLogo', 48)}
        <div><b>BAC 75 N</b><small>Formation complète</small></div>
      </div>
      <h3>SOMMAIRE INTERACTIF</h3>
      ${items}
    </aside>`;
}

function chapterHead(chapter, subtitle) {
  const slot = CHAPTER_IMAGES[chapter.id] || 'cours-antiterrorisme';
  const image = slot === 'logo'
    ? `<div class="at-chapterImg logo">${logoImg('', 190)}</div>`
    : `<div class="at-chapterImg" style="${imageStyle(slot)}"></div>`;

  return `
    <div class="at-chapterHead">
      <div>
        <span class="num">${esc(chapter.num)}</span>
        <h2>${esc(chapter.title)}</h2>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
      </div>
      ${image}
    </div>`;
}

export function cours({ course, record, chapter, index, dis }) {
  // La première phrase du chapitre est son sous-titre dans la maquette.
  let blocks = chapter.blocks;
  let subtitle = '';
  if (blocks[0] && blocks[0].t === 'p') {
    const { head, rest } = firstSentence(blocks[0].text);
    subtitle = head;
    blocks = rest ? [{ t: 'p', text: rest }, ...blocks.slice(1)] : blocks.slice(1);
  }

  const total = course.chapters.length;
  const done = Boolean(record.read[chapter.id]);
  const previous = index > 0
    ? `<button class="prev" onclick="app.openChapter('${esc(course.chapters[index - 1].id)}')">← Chapitre précédent</button>`
    : '<span></span>';
  const next = index < total - 1
    ? '<button class="next" onclick="app.nextChapter()">Chapitre suivant →</button>'
    : '<button class="next" onclick="app.openStep(\'eval\')">Passer à l’évaluation →</button>';

  return `
    <div class="at-layout">
      ${side(course, record, chapter.id)}
      <article class="at-main">
        <div class="at-crumb no-print">
          <a href="${href('accueil')}">Accueil</a> › <a href="${href('formations')}">Formations BAC</a> › ${esc(course.title.replace(/ BAC$/, ''))}
        </div>
        ${chapterHead(chapter, subtitle)}
        <div class="at-content">${renderContent(blocks, record, dis)}</div>
        <label class="at-read no-print">
          <input type="checkbox" ${done ? 'checked' : ''} ${dis}
                 onchange="app.setRead('${esc(chapter.id)}',this.checked)">
          J’ai lu et compris ce chapitre
        </label>
        <div class="at-chapterFoot no-print">
          ${previous}
          <span>${esc(chapter.num)} / ${String(total).padStart(2, '0')}</span>
          ${next}
        </div>
      </article>
    </div>`;
}

// ───────────────────────────── Écran ─────────────────────────────────

export function page({ course, kicker }) {
  const words = upper(course.title.replace(/ BAC$/, '')).split(' ');
  const title = words.length > 1
    ? `${esc(words.slice(0, -1).join(' '))} <em>${esc(words[words.length - 1])}</em>`
    : esc(words[0]);

  return `
    <section id="home" class="view m-anti">
      <header class="at-hero no-print">
        ${logoImg('at-heroLogo', 112)}
        <div class="at-heroCopy">
          <small>FORMATION BAC 75 N</small>
          <h1>${title}</h1>
          <p>${esc(upper(kicker || course.subtitle))}</p>
        </div>
        <a class="at-back" href="${href('formations')}">← Retour au portail</a>
      </header>

      <div class="at-wrap">
        <div class="at-bar no-print">
          <div class="at-barTop">
            <div class="at-file">
              <small>DOSSIER DE FORMATION</small>
              <h2 id="hero">${esc(course.title)}</h2>
            </div>
            <span id="sync" class="at-sync"></span>
            <div id="pageActions" class="at-actions"></div>
          </div>
          <div id="tabs" class="tabs at-tabs"></div>
          <div class="at-progress"><span id="prog"></span></div>
          <div id="stepText" class="at-stepText"></div>
        </div>
        <div id="sections"></div>
      </div>
    </section>`;
}
