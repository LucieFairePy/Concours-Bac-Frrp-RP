// Barre latérale — documentation technique V4 §6.1 : logo, identité,
// devise, navigation, cartouche citation.

import { byId, esc } from '../core/dom.js';
import { href } from '../routes.js';
import { imageStyle, LOGO } from '../data/images.js';
import { visibleNav, isActive, itemHref } from './nav.js';

function navEntry(item, active) {
  const head = `
    <a class="psb-item${isActive(item, active) ? ' active' : ''}" href="${itemHref(item)}">
      <span class="psb-ico" aria-hidden="true">${esc(item.icon || '•')}</span>${esc(item.label)}
    </a>`;

  if (!item.sub) return head;

  const children = item.sub
    .map(child => (child.soon
      ? `<span class="psb-sub soon">${esc(child.label)} <em>Bientôt</em></span>`
      : `<a class="psb-sub${child.id === active ? ' active' : ''}" href="${itemHref(child)}">${esc(child.label)}</a>`))
    .join('');

  return head + children;
}

export function renderSidebar(active) {
  const aside = byId('portalSidebar');
  if (!aside) return;

  aside.innerHTML = `
    <a class="psb-head" href="${href('accueil')}">
      <span class="psb-medal">
        <img src="${LOGO.file}" width="78" height="78"
             alt="Écusson Brigade Anti-Criminalité 75 N"
             onerror="this.onerror=null;this.src='${LOGO.fallback}'">
      </span>
      <span class="psb-unit">Brigade Anti-Criminalité</span>
      <span class="psb-name">BAC 75 N</span>
      <span class="psb-devise">— Pro Patria Vigilant —</span>
      <span class="psb-flag"></span>
    </a>
    <nav class="psb-nav">${visibleNav().map(item => navEntry(item, active)).join('')}</nav>
    <div class="psb-quote">
      <div class="psb-quote-img" style="${imageStyle('sidebar-citation')}"></div>
      <div class="psb-quote-body">
        <span>« Parler<br>pour sauver<br>des vies »</span>
        <div class="psb-flag"></div>
      </div>
    </div>`;
}

export function toggleNav(open) {
  byId('portalSidebar')?.classList.toggle('open', open);
}
