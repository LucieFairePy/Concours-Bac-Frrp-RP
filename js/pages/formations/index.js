// Catalogue des formations — entrée du menu « Formations » (§3).
//
// Elle n'invente rien : elle lit les contenus de formation déclarés et
// affiche, pour chacun, son sommaire, sa fiche réflexe et son état côté
// historique.

import { esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as records from '../../core/records.js';
import { imageStyle } from '../../data/images.js';
import { href } from '../../routes.js';
import { COURSES } from '../../data/formations/index.js';
import { reflexeCard } from './reflexe.js';
import { decisionChip } from '../../ui/chips.js';

function card({ course, route }) {
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
      ${course.chapters.length > 6 ? `<p class="mut">… et ${course.chapters.length - 6} autres chapitres • évaluation /${course.evaluation.max}</p>` : ''}
      ${reflexeCard(course)}
      <div class="row">
        <div class="c6"><a class="gate-link" href="${href(route)}">Ouvrir la formation</a></div>
        <div class="c6"><a class="gate-link" style="background:#173d5b"
          href="${href('historique', { module: mod.id })}">Dossiers clôturés</a></div>
      </div>
      <div id="state-${esc(course.module)}"></div>
    </div>`;
}

async function states() {
  await Promise.all(COURSES.map(async ({ course, route }) => {
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
          <a class="pwhen" href="${href(route, { dossier: entry.id })}">ouvrir →</a>
        </li>`).join('');
      setHTML(host, `<p class="mut">${entries.length} dossier(s) clôturé(s)</p><ul class="plist">${lines}</ul>`);
    } catch (error) {
      setHTML(host, portal.errorBanner(`Historique illisible : ${error.message}`));
    }
  }));
}

export default {
  template() {
    return `
      <div class="hero" data-img="formations">
        <div class="flag"></div>
        <small class="hero-kicker no-print">Pôle formation</small>
        <h1>Formations BAC</h1>
        <div class="mut">Des modules complets, progressifs et intégrés au même portail</div>
      </div>
      <div id="cards" class="ptiles">${COURSES.map(card).join('')}</div>`;
  },

  async mount() {
    portal.setModuleBar(`
      <b>Formations</b>
      <span class="mut">${COURSES.length} formations disponibles</span>
      <span class="spacer"></span>
      <a class="pnav-item" href="${href('examen-chef-groupe')}">Examen de qualification →</a>`);

    await states();
  }
};
