// Catalogue des formations — entrée du menu « Formations » (§3).
//
// Même gabarit que la maquette V4 : la bannière du pôle formation puis une
// grande carte photo par formation, deux par ligne. Chaque carte ouvre la
// page de la formation ; le nombre de dossiers clôturés de chaque module,
// lu dans l'historique, s'affiche en coin de carte quand il y en a.

import { esc, setHTML } from '../../core/dom.js';
import * as records from '../../core/records.js';
import { imageStyle } from '../../data/images.js';
import { href } from '../../routes.js';
import { COURSES } from '../../data/formations/index.js';

/**
 * L'ordre, les titres, les images et les accroches de la maquette V4. Une
 * formation déclarée dans COURSES sans entrée ici garde son titre et son
 * introduction : la page suit sans retouche.
 */
const CARDS = {
  'formation-negociation': {
    order: 1,
    title: 'Négociation BAC',
    image: 'cours-negociation',
    text: 'Communication, écoute active, gestion de crise, coordination et mises en situation.'
  },
  'formation-radio': {
    order: 2,
    title: 'Radio BAC',
    image: 'cours-radio',
    text: 'Discipline réseau, prise d’écoute, indicatifs, transmissions, raccourcis et exercices pratiques.'
  },
  'formation-antiterrorisme': {
    order: 3,
    title: 'Antiterrorisme BAC 75 N',
    image: 'cours-antiterrorisme',
    text: 'Primo-intervention, Bataclan, protection, transmissions, coordination et passage de relais.'
  },
  'formation-chef-groupe': {
    order: 4,
    title: 'Chef de Groupe BAC',
    image: 'formation-cdg',
    text: 'Organisation, leadership, commandement, radio et adaptation.'
  }
};

function entries() {
  return COURSES
    .map((entry, index) => ({ ...entry, card: CARDS[entry.route] || { order: 10 + index } }))
    .sort((a, b) => a.card.order - b.card.order);
}

function card({ course, route, card: look }) {
  return `
    <a class="pfeature" href="${href(route)}" style="${imageStyle(look.image || course.image)}">
      <span class="pfeature-more" id="state-${esc(course.module)}"></span>
      <div class="pfeature-body">
        <span class="ptag">Formation</span>
        <h3>${esc(look.title || course.title)}</h3>
        <p>${esc(look.text || course.intro)}</p>
      </div>
    </a>`;
}

/** Le nombre de dossiers clôturés, en coin de carte ; rien s'il n'y en a pas. */
async function states() {
  await Promise.all(COURSES.map(async ({ course }) => {
    try {
      const count = (await records.listModule(course.module)).length;
      if (count) setHTML(`state-${course.module}`, `${count} dossier${count > 1 ? 's' : ''} clôturé${count > 1 ? 's' : ''}`);
    } catch (error) {
      setHTML(`state-${course.module}`, 'historique illisible');
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
        <div class="mut">Des modules complets, progressifs et intégrés au même portail.</div>
      </div>
      <div id="cards" class="pfeatures">${entries().map(card).join('')}</div>
      <p class="pfoot">
        <a href="${href('historique', { famille: 'formations' })}">Dossiers de formation clôturés →</a>
        <a href="${href('examen-chef-groupe')}">Examen de qualification Chef de Groupe →</a>
      </p>`;
  },

  async mount() {
    await states();
  }
};
