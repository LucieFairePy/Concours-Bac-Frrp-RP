// Page de choix des formations — entrée du menu « Formations » (§3).
//
// Elle n'invente rien : elle lit les contenus de formation déclarés et
// affiche, pour chacun, son sommaire, sa fiche réflexe et son état côté
// historique.

import { esc, setHTML } from './core/dom.js';
import * as portal from './core/portal.js';
import * as records from './core/records.js';
import { imageStyle } from './data/images.js';
import { NEGOCIATION } from './data/negociation.js';
import { CHEF_DE_GROUPE } from './data/chef-de-groupe.js';
import { reflexeCard } from './views/reflexe.js';
import { decisionChip } from './views/chips.js';

const COURSES = [NEGOCIATION, CHEF_DE_GROUPE];

function card(course) {
  const mod = records.MODULES[course.module];
  const summary = course.chapters
    .slice(0, 6)
    .map(chapter => `<li>${esc(chapter.num)} — ${esc(chapter.title)}</li>`)
    .join('');

  return `
    <div class="ptile">
      <div class="co-banner" style="${imageStyle(course.image)}">
        <div class="co-banner-body">
          <div class="co-kicker">Formation</div>
          <h2>${esc(course.title)}</h2>
        </div>
      </div>
      <p class="mut" style="margin:11px 0">${esc(course.intro)}</p>
      <ul class="plist">${summary}</ul>
      <p class="mut">… et ${course.chapters.length - 6} autres chapitres • évaluation /${course.evaluation.max}</p>
      ${reflexeCard(course)}
      <div class="row">
        <div class="c6"><a class="gate-link" href="${mod.page}">Ouvrir la formation</a></div>
        <div class="c6"><a class="gate-link" style="background:#173d5b"
          href="historique.html?categorie=${esc(mod.category)}">Dossiers clôturés</a></div>
      </div>
      <div id="state-${esc(course.module)}"></div>
    </div>`;
}

async function states() {
  await Promise.all(COURSES.map(async course => {
    const host = `state-${course.module}`;
    try {
      const entries = await records.listModule(course.module);
      if (!entries.length) {
        setHTML(host, '<p class="pempty">Aucun dossier de formation clôturé.</p>');
        return;
      }
      const lines = entries.slice(0, 4).map(entry => `
        <li>
          <span class="pid">${esc(entry.id)}</span>
          <span>${esc(records.fullName(entry) || '—')} ${decisionChip(entry.decision)}</span>
          <a class="pwhen" href="${records.MODULES[course.module].page}?dossier=${encodeURIComponent(entry.id)}">ouvrir →</a>
        </li>`).join('');
      setHTML(host, `<p class="mut">${entries.length} dossier(s) clôturé(s)</p><ul class="plist">${lines}</ul>`);
    } catch (error) {
      setHTML(host, portal.errorBanner(`Historique illisible : ${error.message}`));
    }
  }));
}

async function boot() {
  const { session } = await portal.boot({ active: 'formations' });
  if (!session) return;

  portal.setModuleBar(`
    <b>Formations</b>
    <span class="mut">${COURSES.length} formations disponibles</span>
    <span class="spacer"></span>
    <a class="pnav-item" href="examen-cdg.html">Examen de qualification →</a>`);

  setHTML('cards', COURSES.map(card).join(''));
  await states();
}

boot();
