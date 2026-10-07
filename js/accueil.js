// Accueil opérationnel BAC 75 N — documentation technique V4 §6.3 à §7.
//
// La page tient en trois blocs : le héros, les quatre cartes d'accès et le
// tableau de bord bas. Les quatre panneaux du bas — Actualités, Dossiers
// en cours, Accès rapides, Effectifs — font partie de la V4 finale et ne
// se suppriment pas (§1, encadré NON-NÉGOCIABLE).
//
// Chaque panneau peint d'abord un état « lecture en cours », puis se
// remplit. Une lecture qui échoue n'efface pas la page : elle affiche son
// message à sa place, à côté des panneaux qui ont abouti (§7).

import { esc, setHTML } from './core/dom.js';
import * as portal from './core/portal.js';
import * as auth from './core/auth.js';
import * as records from './core/records.js';
import * as news from './core/news.js';
import * as effectifs from './core/effectifs.js';
import * as lifecycle from './core/lifecycle.js';
import { imageStyle, imageSources } from './data/images.js';
import { decisionChip } from './views/chips.js';

/** §6.4 — quatre cartes, dans cet ordre, le concours en accent rouge. */
const CARDS = [
  {
    slot: 'concours',
    accent: 'red',
    icon: '▤',
    title: 'Concours<br>d’intégration BAC',
    label: 'Concours d’intégration BAC',
    href: portal.path('concours-bac')
  },
  {
    slot: 'negociation',
    icon: '◉',
    title: 'Formation<br>Négociation BAC',
    label: 'Formation Négociation BAC',
    href: portal.path('formation-negociation')
  },
  {
    slot: 'formation-cdg',
    icon: '▣',
    title: 'Formation<br>Chef de Groupe',
    label: 'Formation Chef de Groupe',
    href: portal.path('formation-chef-groupe')
  },
  {
    slot: 'cdg',
    icon: '☑',
    title: 'Examen<br>Chef de Groupe',
    label: 'Examen Chef de Groupe',
    href: portal.path('examen-chef-groupe')
  }
];

/** §18.3 — cinq actions, chacune conditionnée par les permissions. */
const QUICK = [
  { icon: '▣', label: 'Créer un nouveau dossier', action: 'app.newRecord()', need: 'write' },
  { icon: '◷', label: 'Consulter l’historique', href: portal.path('history') },
  { icon: '⚇', label: 'Gérer les utilisateurs', href: portal.path('users'), need: 'accounts' },
  { icon: '⚙', label: 'Paramètres de la direction', href: portal.path('settings'), need: 'settings' },
  { icon: '⤓', label: 'Exporter un rapport', href: `${portal.path('history')}?export=1` }
];

function card(item) {
  return `
    <a class="pcard${item.accent === 'red' ? ' accent-red' : ''}" href="${item.href}"
       aria-label="${esc(item.label)}">
      <span class="pcard-img" style="${imageStyle(item.slot)}"></span>
      <span class="pcard-body">
        <span class="pcard-ico" aria-hidden="true">${esc(item.icon)}</span>
        <h3>${item.title}</h3>
        <span class="pcard-go" aria-hidden="true">→</span>
      </span>
    </a>`;
}

/**
 * §6.3 — le héros montre d'abord la scène ; le texte tient la partie
 * gauche. Le cartouche de droite remplace la météo de démonstration du
 * kit par une information de service, comme le §6.3 l'autorise
 * explicitement : pas d'API extérieure pour afficher une température.
 */
function hero() {
  const now = new Date();
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const jour = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  setHTML('hero', `
    <section class="phero">
      <div class="phero-img" style="${imageStyle('accueil-hero')}"></div>
      <div class="phero-body">
        <div class="phero-kicker">Bienvenue sur le portail officiel</div>
        <h1>Brigade<br>Anti-Criminalité<br>BAC 75 N</h1>
        <div class="flag"></div>
        <div class="phero-devise">Pro Patria Vigilant</div>
        <p class="phero-motto">
          « Engagement · Réactivité · Discrétion<br>
          au service des citoyens »
        </p>
      </div>
      <div class="phero-aside">
        <span class="pa-place">${esc(jour)}</span>
        <span class="pa-value">${esc(heure)}</span>
        <span class="pa-foot">Portail FRRP</span>
      </div>
    </section>`);
}

function when(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 60 * 24) return `il y a ${Math.floor(minutes / 60)} h`;
  if (minutes < 60 * 24 * 7) return `il y a ${Math.floor(minutes / 1440)} j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function tile(id, title, link, body) {
  return `
    <section class="ptile" id="${id}">
      <div class="ptile-head">
        <h3>${esc(title)}</h3>
        ${link ? `<a href="${link.href}">${esc(link.label)}</a>` : ''}
      </div>
      ${body}
    </section>`;
}

const LOADING = '<p class="pempty">Lecture du dépôt…</p>';

function skeleton() {
  setHTML('dash', [
    tile('tileNews', 'Actualités BAC 75 N', { href: portal.path('news'), label: 'Voir tout ›' }, LOADING),
    tile('tileCases', 'Dossiers en cours', { href: portal.path('history'), label: 'Voir tous ›' }, LOADING),
    tile('tileQuick', 'Accès rapides', null, LOADING),
    tile('tileStaff', 'Effectifs BAC 75 N', { href: portal.path('users'), label: 'Voir plus ›' }, LOADING)
  ].join(''));
}

function paintTile(id, html) {
  const node = document.getElementById(id);
  if (!node) return;
  const head = node.querySelector('.ptile-head');
  node.innerHTML = (head ? head.outerHTML : '') + html;
}

// ── Actualités (§18.1) ──────────────────────────────────────────────────

/**
 * Miniature d'actualité — §22 : une vraie image, avec ses dimensions pour
 * qu'elle ne fasse pas sauter la mise en page, et un chargement différé
 * parce qu'elle est sous la ligne de flottaison.
 *
 * La photo du kit est demandée d'abord ; tant qu'elle n'est pas déposée,
 * le navigateur bascule sur le repli du dépôt.
 */
function thumb(slot) {
  const sources = imageSources(slot);
  return `
    <span class="pnews-thumb">
      <img src="${sources.src}" alt="" loading="lazy" decoding="async"
           width="72" height="46"
           onerror="this.onerror=null;this.src='${sources.fallback}'">
    </span>`;
}

function newsLine(item) {
  const date = new Date(item.publishedAt);
  const stamp = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <li>
      <a href="${portal.path('news')}?actu=${encodeURIComponent(item.id)}">
        ${thumb(item.imageAsset)}
        <span>
          <b>${esc(item.title)}</b>
          <span>${esc([item.sector, stamp].filter(Boolean).join(' · '))}</span>
        </span>
      </a>
    </li>`;
}

async function paintNews() {
  try {
    const { items, seeded } = await news.load();
    const shown = news.visibleTo(items).slice(0, 3);

    paintTile('tileNews', shown.length
      ? `<ul class="pnews">${shown.map(newsLine).join('')}</ul>
         ${seeded ? '<p class="mut" style="margin-top:9px">Actualités de départ — publie les tiennes depuis l’Administration.</p>' : ''}`
      : '<p class="pempty">Aucune actualité publiée.</p>');
  } catch (error) {
    paintTile('tileNews', portal.errorBanner(`Actualités illisibles : ${error.message}`));
  }
}

// ── Dossiers en cours (§18.2) ───────────────────────────────────────────

function caseLine(draft) {
  const mod = records.MODULES[draft.module];
  const advance = lifecycle.progress(draft.module, draft.record);
  const name = records.fullName(draft.record.c || {});

  const pct = Math.round(advance.ratio * 100);

  return `
    <a class="pcase ${esc(draft.module)}" href="${mod.page}">
      <span class="pcase-top">
        <span class="pcase-chip ${esc(draft.module)}">${esc(mod.short)}</span>
        <span class="pcase-name">
          <b>${esc(name || 'À attribuer')}</b>
          <span class="pcase-step">Étape : ${esc(advance.label)}</span>
        </span>
        <span class="pcase-pct">${pct}%</span>
      </span>
      <span class="pbar"><span style="width:${pct}%"></span></span>
    </a>`;
}

function closedLine(entry) {
  const mod = records.MODULES[entry.module];
  return `
    <li>
      <span class="pid">${esc(entry.id)}</span>
      <span>
        ${esc(records.fullName(entry) || '—')}
        ${decisionChip(entry.decision)}
      </span>
      <a class="pwhen" href="${portal.path('history')}?dossier=${encodeURIComponent(entry.id)}">${esc(when(entry.closedAt || entry.date))}</a>
    </li>`;
}

async function myDrafts(login) {
  const found = await Promise.all(records.MODULE_ORDER.map(async id => {
    try {
      const record = await records.loadDraft(id, login);
      return record ? { module: id, record } : null;
    } catch (error) {
      return null;
    }
  }));
  return found.filter(Boolean);
}

async function paintCases(session) {
  try {
    const [drafts, all] = await Promise.all([myDrafts(session.login), records.listAll()]);
    const pending = drafts.filter(draft => !draft.record.locked);
    const closed = all.entries.slice(0, 3);

    const errors = all.errors.length
      ? `<p class="mut">Modules illisibles : ${esc(all.errors.map(item => item.id).join(', '))}</p>`
      : '';

    paintTile('tileCases', `
      <div class="pstat"><b>${pending.length}</b><span class="mut">dossier(s) ouvert(s)</span></div>
      ${pending.length
        ? pending.map(caseLine).join('')
        : '<p class="pempty">Aucun brouillon. Ouvre un module pour commencer un dossier.</p>'}
      ${closed.length
        ? `<p class="mut" style="margin:11px 0 0">Dernières clôtures</p>
           <ul class="plist">${closed.map(closedLine).join('')}</ul>`
        : ''}
      ${errors}`);
  } catch (error) {
    paintTile('tileCases', portal.errorBanner(`Activité illisible : ${error.message}`));
  }
}

// ── Accès rapides (§18.3) ───────────────────────────────────────────────

function paintQuick() {
  const lines = QUICK
    .filter(item => !item.need || auth.can(item.need))
    .map(item => `
      <li>
        ${item.href
          ? `<a href="${item.href}"><span class="pq-ico" aria-hidden="true">${esc(item.icon)}</span>${esc(item.label)}</a>`
          : `<button type="button" onclick="${item.action}"><span class="pq-ico" aria-hidden="true">${esc(item.icon)}</span>${esc(item.label)}</button>`}
      </li>`)
    .join('');

  paintTile('tileQuick', `<ul class="pquick">${lines}</ul>`);
}

// ── Effectifs (§18.4) ───────────────────────────────────────────────────

async function paintStaff() {
  const image = `<div class="pstaff-img" style="${imageStyle('effectifs')}"></div>`;

  try {
    const counted = await effectifs.counts();
    if (!counted.readable) {
      paintTile('tileStaff', `${image}<p class="pempty">Effectifs illisibles : ${esc(counted.error)}</p>`);
      return;
    }

    const lines = counted.lines
      .map(line => `<li><span>${esc(line.label)}</span><b>${line.count}</b></li>`)
      .join('');

    paintTile('tileStaff', `
      ${image}
      <ul class="pstaff">
        ${lines}
        <li class="total"><span>Total</span><b>${counted.total}</b></li>
      </ul>`);
  } catch (error) {
    paintTile('tileStaff', `${image}${portal.errorBanner(`Effectifs illisibles : ${error.message}`)}`);
  }
}

// ── Création d'un dossier (§7, « Créer un nouveau dossier ») ────────────

const app = {
  newRecord() {
    const choices = records.MODULE_ORDER.map(id => {
      const mod = records.MODULES[id];
      return `
        <li>
          <a href="${mod.page}">
            <span class="pq-ico" aria-hidden="true">＋</span>${esc(mod.label)}
            <span class="pq-go">→</span>
          </a>
        </li>`;
    }).join('');

    setHTML('modal', `
      <div class="pmodal" role="dialog" aria-modal="true" aria-label="Créer un nouveau dossier">
        <div class="pmodal-box">
          <h3>Créer un nouveau dossier</h3>
          <p class="mut">
            Choisis le type de dossier. Un brouillon déjà ouvert sur ce module
            est repris plutôt qu’écrasé.
          </p>
          <ul class="pquick">${choices}</ul>
          <button onclick="app.closeModal()">Annuler</button>
        </div>
      </div>`);
  },

  closeModal() {
    setHTML('modal', '');
  }
};

window.app = app;

async function boot() {
  const { session } = await portal.boot({ active: 'accueil' });
  if (!session) return;

  hero();
  setHTML('cards', CARDS.map(card).join(''));
  skeleton();
  paintQuick();

  await Promise.all([paintNews(), paintCases(session), paintStaff()]);
}

boot();
