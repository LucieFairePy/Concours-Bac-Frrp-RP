// Catalogue des formations — la page « Formations BAC » de l'archive V4
// (app.js, `formations()`) : la bannière du pôle formation, puis une grande
// carte photo par formation, deux par ligne, dans l'ordre de l'archive.
// Chaque carte ouvre la page de la formation.
//
// La bannière de l'archive appelle `group.jpg`, que le kit ne livre pas :
// elle s'affiche sans photo, comme dans l'archive.

import { href } from '../../routes.js';
import { kitVar } from '../../shell/asset.js';

const CARDS = [
  {
    route: 'formation-negociation',
    img: '10_FORMATION_NEGOCIATION_BANNER_ALTERNATIVE.jpg',
    title: 'NÉGOCIATION BAC',
    text: 'Communication, écoute active, gestion de crise, coordination et mises en situation.'
  },
  {
    route: 'formation-radio',
    img: '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg',
    title: 'RADIO BAC',
    text: 'Discipline réseau, prise d’écoute, indicatifs, transmissions, raccourcis et exercices pratiques.'
  },
  {
    route: 'formation-antiterrorisme',
    img: '14_RESERVE_BAC_UNITE_BOUCLIERS.jpg',
    title: 'ANTITERRORISME BAC 75 N',
    text: 'Primo-intervention, Bataclan, protection, transmissions, coordination et passage de relais.'
  },
  {
    route: 'formation-chef-groupe',
    img: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg',
    title: 'CHEF DE GROUPE BAC',
    text: 'Organisation, leadership, commandement, radio et adaptation.'
  }
];

function card(item) {
  return `<a class="feature" href="${href(item.route)}" style="${kitVar('img', item.img)}"><div><span class="tag">FORMATION</span><h3>${item.title}</h3><p>${item.text}</p></div></a>`;
}

export default {
  template() {
    return `<div class="page"><div class="sectionHero" style="--bg:none"><div><small>PÔLE FORMATION</small><h1>FORMATIONS BAC</h1><p>Des modules complets, progressifs et intégrés au même portail.</p></div></div><div class="cards2" id="cards">${CARDS.map(card).join('')}</div></div>`;
  },

  mount() {}
};
