// Mise en page du module radio — reprise de la maquette V4
// (modules/formation-radio.html) : bandeau au logo rond, sommaire
// interactif sur toute la hauteur à gauche, fil d'Ariane et retour au
// portail, cartouche de chapitre, cartes numérotées (1.1, 1.2…) à gauche
// et encadrés rouges + photo à droite.
//
// Exporte `page()` et `cours()` : voir l'en-tête de engine.js. Le parcours
// du dossier (Identité → Cours → Évaluation → Correction → Fiche finale)
// reste celui du moteur ; il prend place sous le sommaire.
//
// Les blocs de js/data/formations/radio.js sont relus ici pour retrouver
// la forme de la maquette :
//   p « 1.1 — Titre. Texte »        ouvre une carte numérotée
//   retenir                          encadré bleu « À RETENIR » dans la carte,
//                                    ou « POINTS ESSENTIELS » à droite quand
//                                    il commence par « Points essentiels »
//   erreurs                          encadré rouge à droite
//   dialogue « — Qui : « … » »       échange en deux colonnes
//   table à 2 colonnes               liste « terme : définition », tuiles
//                                    de raccourcis ou tuiles de corps
//   etapes                           formule en ligne (QUI → OÙ → …)
// Le reste passe par les rendus communs de cours.js.

import { byId, esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { LOGO, imageStyle } from '../../../data/images.js';
import { renderBlocks } from '../cours.js';

// ───────────────────────────── Écran ──────────────────────────────────

function sommaireItems(course, record = null, activeId = '') {
  return course.chapters.map(chapter => {
    const on = chapter.id === activeId;
    const done = Boolean(record && record.read[chapter.id]);
    return `
      <button class="mr-nav${on ? ' active' : ''}${done ? ' done' : ''}"
              onclick="app.openStep('cours');app.openChapter('${esc(chapter.id)}')">
        <b>${esc(chapter.num)}</b><span>${esc(chapter.title)}</span><i>${done ? '✓' : ''}</i>
      </button>`;
  }).join('');
}

export function page({ course, kicker }) {
  return `
    <section id="home" class="view m-radio">
      <header class="mr-hero no-print" style="${imageStyle('effectifs')}">
        <div class="mr-hero-copy">
          <img src="${esc(LOGO.file)}" alt="BAC 75 N" width="72" height="72"
               onerror="this.onerror=null;this.src='${esc(LOGO.fallback)}'">
          <h1>FORMATION RADIO — BAC 75 N</h1>
          <p>${esc(String(kicker || course.subtitle).toUpperCase())}</p>
        </div>
        <div class="mr-hero-file">
          <small>DOSSIER EN COURS</small>
          <b id="hero">${esc(course.title)}</b>
          <span>${course.chapters.length} chapitres · évaluation /${course.evaluation.max} · fiche imprimable</span>
        </div>
      </header>

      <div class="mr-layout">
        <aside class="mr-side no-print">
          <h3>SOMMAIRE INTERACTIF</h3>
          <nav id="mrSommaire">${sommaireItems(course)}</nav>

          <h3 class="mr-side-gap">DOSSIER DE FORMATION</h3>
          <div id="tabs" class="mr-steps"></div>
          <div class="mr-steprog"><span id="prog"></span></div>
          <div id="stepText" class="mr-steptext"></div>
        </aside>

        <div class="mr-content">
          <div class="mr-topbar no-print">
            <span class="mr-crumb">Formations BAC › Radio</span>
            <div id="pageActions" class="mr-actions"></div>
            <span id="sync" class="mr-sync"></span>
            <a class="mr-back" href="${href('formations')}">← Retour au portail</a>
          </div>
          <div id="sections"></div>
        </div>
      </div>
    </section>`;
}

// ───────────────────────────── Blocs ──────────────────────────────────

const SUB = /^(\d+\.\d+)\s*—\s*(.+?)\.(?:\s+([\s\S]*))?$/;
const EXO = /^Exercice\s+(\d+)\s*—\s*(.+?)\.(?:\s+([\s\S]*))?$/;
const FORMULE = /^Formule[^:]*:\s*«\s*(.+?)\s*»\s*$/;

function capital(text) {
  const value = String(text).trim();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function retenirBox(items) {
  return `
    <div class="mr-info">
      <b>À RETENIR</b>
      ${items.length === 1
        ? `<p>${esc(items[0])}</p>`
        : `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`}
    </div>`;
}

function importantBox(title, items) {
  return `
    <div class="mr-important">
      <h3>${esc(title)}</h3>
      <ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>`;
}

function dialogueRows(text) {
  const rows = String(text).split('\n').map(line => {
    const match = line.match(/^—\s*([^:]+?)\s*:\s*([\s\S]*)$/);
    if (!match) return `<div class="mr-dialogue"><div class="mr-msg mr-msg-full">${esc(line)}</div></div>`;
    const who = match[1].trim();
    const tn = /^TN\b/.test(who) ? ' tn' : '';
    return `
      <div class="mr-dialogue">
        <div class="mr-who${tn}">${esc(who)}</div>
        <div class="mr-msg">${esc(match[2])}</div>
      </div>`;
  }).join('');
  return `<div class="mr-dialogues">${rows}</div>`;
}

function tableBlock(block) {
  if (block.head.length !== 2) return renderBlocks([block], { work: {} }, '');
  const rows = block.rows;

  // 1er / 2e / 3e chiffre : les tuiles de corps de la maquette.
  if (rows.every(row => /^\d/.test(row[0]))) {
    return `<div class="mr-corps">${rows.map(row => {
      const [lead, ...rest] = String(row[0]).split(' ');
      return `<div><b>${esc(lead)}</b>${rest.length ? ` <small>${esc(rest.join(' '))}</small>` : ''}<br>${esc(row[1])}</div>`;
    }).join('')}</div>`;
  }

  // Sigles courts : les tuiles de raccourcis.
  if (rows.every(row => /^[A-Z]{2,5}$/.test(row[0]))) {
    return `<div class="mr-shortcuts">${rows.map(row =>
      `<div class="mr-shortcut"><b>${esc(row[0])}</b><br>${esc(row[1])}</div>`).join('')}</div>`;
  }

  return `<p class="mr-defs">${rows.map(row =>
    `<b>${esc(row[0])} :</b> ${esc(row[1].charAt(0).toLowerCase() + row[1].slice(1))}`).join('<br>')}</p>`;
}

function formula(steps) {
  // Comme la maquette : la première étape en bleu quand la formule est courte.
  const lead = steps.length <= 5;
  return `<p class="mr-formula">${steps.map((step, index) =>
    (lead && !index ? `<em>${esc(step)}</em>` : esc(step))).join(' → ')}</p>`;
}

function formulePhrase(text) {
  const body = esc(text).replace(/(\[[^\]]+\]|TN\s*\d+)/g, '<em>$1</em>');
  return `<p class="mr-formula">${body}</p>`;
}

function exerciceCard(block, record, dis) {
  const match = String(block.text).match(EXO);
  const title = match
    ? `<h3><span>EX ${esc(match[1])}</span> ${esc(match[2])}</h3>`
    : '<h3><span>EX</span> Exercice</h3>';
  const text = match ? (match[3] || '') : block.text;
  const value = record.work[block.id] || '';
  return `
    <div class="mr-card mr-exo">
      ${title}
      <p>${esc(text)}</p>
      ${block.hint ? `<div class="mr-info"><b>PISTE</b><p>${esc(block.hint)}</p></div>` : ''}
      <label>Réponse du stagiaire</label>
      <textarea ${dis} oninput="app.setWork('${esc(block.id)}',this.value)">${esc(value)}</textarea>
    </div>`;
}

/** Répartit les blocs d'un chapitre : cartes à gauche, encadrés à droite. */
function layoutBlocks(chapter, record, dis) {
  const cards = [];
  const side = [];
  let card = null;

  const open = (num, title) => {
    card = { num, title, html: [] };
    cards.push(card);
    return card;
  };
  const current = () => card || open('', '');

  for (const block of chapter.blocks) {
    if (block.t === 'p') {
      const sub = String(block.text).match(SUB);
      if (sub) {
        open(sub[1], sub[2].replace(/\s*:\s*/, ' — '));
        if (sub[3]) card.html.push(`<p>${esc(sub[3])}</p>`);
        continue;
      }
      const formule = String(block.text).match(FORMULE);
      if (formule) {
        current().html.push(formulePhrase(formule[1]));
        continue;
      }
      current().html.push(`<p>${esc(block.text)}</p>`);
    } else if (block.t === 'liste') {
      current().html.push(`<ul>${block.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`);
    } else if (block.t === 'retenir') {
      const first = String(block.items[0] || '');
      const essentials = first.match(/^Points essentiels\s*:\s*(.*)$/i);
      if (essentials) {
        side.push(importantBox('POINTS ESSENTIELS', [capital(essentials[1]), ...block.items.slice(1)]));
      } else {
        current().html.push(retenirBox(block.items));
      }
    } else if (block.t === 'erreurs') {
      side.push(importantBox('ERREURS À ÉVITER', block.items));
    } else if (block.t === 'dialogue') {
      current().html.push(dialogueRows(block.text));
    } else if (block.t === 'table') {
      current().html.push(tableBlock(block));
    } else if (block.t === 'etapes') {
      current().html.push(formula(block.steps));
    } else if (block.t === 'exercice') {
      card = null;
      cards.push({ raw: exerciceCard(block, record, dis) });
    } else {
      current().html.push(renderBlocks([block], record, dis));
    }
  }

  const left = cards.map(entry => {
    if (entry.raw) return entry.raw;
    const head = entry.title
      ? `<h3>${entry.num ? `<span>${esc(entry.num)}</span> ` : ''}${esc(entry.title)}</h3>`
      : '';
    return `<div class="mr-card">${head}${entry.html.join('')}</div>`;
  }).join('');

  return { left, side: side.join('') };
}

// ───────────────────────────── Cours ──────────────────────────────────

export function cours({ course, record, chapter, index, dis }) {
  // Le sommaire vit dans la colonne de gauche de l'écran : il suit le
  // chapitre ouvert et les chapitres lus.
  const nav = byId('mrSommaire');
  if (nav) nav.innerHTML = sommaireItems(course, record, chapter.id);

  const { left, side } = layoutBlocks(chapter, record, dis);
  const done = Boolean(record.read[chapter.id]);
  const read = course.chapters.filter(item => record.read[item.id]).length;

  const previous = index > 0
    ? `<button onclick="app.openChapter('${esc(course.chapters[index - 1].id)}')">← Chapitre ${esc(course.chapters[index - 1].num)}</button>`
    : '';
  const next = index < course.chapters.length - 1
    ? `<button class="primary" onclick="app.nextChapter()">Chapitre ${esc(course.chapters[index + 1].num)} →</button>`
    : '<button class="primary" onclick="app.openStep(\'eval\')">Passer à l’évaluation →</button>';

  return `
    <article class="mr-chapter">
      <div class="mr-titlebox">
        <small>CHAPITRE ${esc(chapter.num)}</small>
        <h2>${esc(chapter.title)}</h2>
      </div>

      <div class="mr-grid2">
        <div class="mr-col">${left}</div>
        <div class="mr-col">
          ${side}
          <div class="mr-photo" style="${imageStyle('administration')}"></div>
          <div class="mr-card mr-readcard no-print">
            <h3>Lecture du chapitre</h3>
            <label class="mr-check">
              <input type="checkbox" ${done ? 'checked' : ''} ${dis}
                     onchange="app.setRead('${esc(chapter.id)}',this.checked)">
              J’ai lu et compris ce chapitre
            </label>
            <p class="mr-readcount">${read} / ${course.chapters.length} chapitres lus</p>
            <div class="mr-chapnav">${previous}${next}</div>
          </div>
        </div>
      </div>
    </article>`;
}
