// Accueil BAC 75 N — l'accueil de l'archive V4 (app.js, `home()`), balise
// pour balise : le héros, les quatre cartes d'accès, puis le tableau de bord
// (Actualités, Dossiers en cours, Accès rapides, Effectifs).
//
// Seules les données changent : là où l'archive écrit des valeurs de
// démonstration, l'accueil lit les vraies — actualités publiées, brouillons
// en cours de l'examinateur, effectifs comptés sur les accès. La
// présentation, elle, reste celle de l'archive.

import { esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import { href } from '../../routes.js';
import * as auth from '../../core/auth.js';
import * as records from '../../core/records.js';
import * as news from '../../core/news.js';
import * as effectifs from '../../core/effectifs.js';
import * as lifecycle from '../../core/lifecycle.js';
import { imageSources } from '../../data/images.js';
import { kitVar } from '../../shell/asset.js';
import { NEWS_POOL, pick } from './news-pool.js';

const KIT = 'assets/bac75n';

/** Les quatre cartes de l'archive, dans son ordre, le concours en rouge. */
const CARDS = [
  { accent: 'red', icon: '▤', title: 'CONCOURS<br>D’INTÉGRATION BAC', img: '03_HOME_CARD_CONCOURS_INTEGRATION_BAC.jpg', href: href('concours') },
  { icon: '◉', title: 'FORMATION<br>NÉGOCIATION BAC', img: '04_HOME_CARD_FORMATION_NEGOCIATION.jpg', href: href('formation-negociation') },
  { icon: '▣', title: 'FORMATION<br>CHEF DE GROUPE', img: '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg', href: href('formation-chef-groupe') },
  { icon: '☑', title: 'EXAMEN<br>CHEF DE GROUPE', img: '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg', href: href('examen-chef-groupe') }
];

/** Les cinq accès rapides de l'archive ; chacun reste soumis aux permissions. */
const QUICK = [
  { icon: '▣', label: 'Créer un nouveau dossier', route: 'concours', need: 'write' },
  { icon: '◴', label: 'Consulter l’historique', route: 'historique' },
  { icon: '♙', label: 'Gérer les utilisateurs', route: 'utilisateurs', need: 'accounts' },
  { icon: '⚙', label: 'Paramètres de la direction', route: 'parametres', need: 'settings' },
  { icon: '⇩', label: 'Exporter un rapport', route: 'historique', query: { export: '1' } }
];

/** Libellé de la pastille de chaque module, au format de l'archive. */
const BADGE = {
  concours: 'CONCOURS',
  negociation: 'NÉGOCIATION',
  'formation-cdg': 'CHEF GROUPE',
  radio: 'RADIO',
  antiterrorisme: 'ANTITERRORISME',
  cdg: 'EXAMEN CDG'
};

function card(item) {
  return `<a class="module${item.accent === 'red' ? ' primary' : ''}" href="${item.href}" style="${kitVar('img', item.img)}"><div class="label"><span class="icon">${item.icon}</span><strong>${item.title}</strong><span class="arrow">→</span></div></a>`;
}

function hero() {
  return `<div class="hero" style="${kitVar('bg', '02_HOME_HERO_BAC_CONTROLE_NUIT.jpg')}"><div class="copy"><div class="eyebrow">BIENVENUE SUR LE PORTAIL OFFICIEL</div><h1>BRIGADE<br>ANTI-CRIMINALITÉ<br>BAC 75 N</h1><div class="tri"></div><h2>PRO PATRIA VIGILANT</h2><p>« ENGAGEMENT · RÉACTIVITÉ · DISCRÉTION<br>AU SERVICE DES CITOYENS »</p></div><div class="weather"><small>Paris, 17ème</small><b>12°C</b><span>Portail BAC 75 N</span></div></div>`;
}

// ── Actualités ──────────────────────────────────────────────────────────

const NEWS_HEAD = '<h3>ACTUALITÉS BAC 75 N <span class="news-refresh">NOUVELLE SÉLECTION À CHAQUE OUVERTURE</span></h3>';

function newsItem(link, img, fallback, title, line) {
  return `<a class="newsitem" href="${link}"><img src="${img}" alt="" loading="lazy" decoding="async" width="105" height="50"${fallback ? ` onerror="this.onerror=null;this.src='${fallback}'"` : ''}><p><b>${esc(title)}</b><small>${esc(line)}</small></p></a>`;
}

function shortDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
}

async function paintNews() {
  let items = [];
  let seeded = true;
  try {
    const loaded = await news.load();
    seeded = loaded.seeded;
    items = news.visibleTo(loaded.items);
  } catch (error) {
    seeded = true;
  }

  // Rien de publié : la sélection de l'archive, tirée au hasard.
  const lines = seeded || !items.length
    ? pick(NEWS_POOL, 3).map(entry => newsItem(href(entry.go), `${KIT}/${entry.img}`, '', entry.t, entry.d))
    : pick(items, 3).map(item => {
        const sources = imageSources(item.imageAsset);
        return newsItem(
          href('actualites', { actu: item.id }),
          sources.src,
          sources.fallback,
          item.title,
          [item.sector, shortDate(item.publishedAt)].filter(Boolean).join(' · ')
        );
      });

  setHTML('tileNews', NEWS_HEAD + lines.join(''));
}

// ── Dossiers en cours ───────────────────────────────────────────────────

function caseLine(moduleId, record) {
  const mod = records.MODULES[moduleId];
  const advance = record ? lifecycle.progress(moduleId, record) : null;
  const pct = advance ? Math.round(advance.ratio * 100) : 0;
  const name = record ? records.fullName(record.c || {}) : '';
  const step = advance ? `Étape : ${advance.label}` : 'Non débuté';
  const tone = moduleId === 'concours' ? ' red' : pct ? '' : ' light';

  return `<a class="caselink" href="${href(mod.route)}"><div class="case"><span class="badge${tone}">${esc(BADGE[moduleId] || mod.short.toUpperCase())}</span><span>${esc(name || 'À attribuer')}<br><small>${esc(step)}</small></span><b>${pct}%</b></div><div class="bar">${pct ? `<i style="width:${pct}%"></i>` : ''}</div></a>`;
}

async function myDrafts(login) {
  const found = await Promise.all(records.MODULE_ORDER.map(async id => {
    try {
      const record = await records.loadDraft(id, login);
      return record && !record.locked ? { module: id, record } : null;
    } catch (error) {
      return null;
    }
  }));
  return found.filter(Boolean);
}

/**
 * Trois lignes, comme l'archive : les brouillons en cours d'abord, puis les
 * modules sans dossier ouvert, « À attribuer — Non débuté ».
 */
async function paintCases(session) {
  const drafts = await myDrafts(session ? session.login : '');
  const started = new Set(drafts.map(draft => draft.module));
  const lines = drafts.map(draft => caseLine(draft.module, draft.record));

  for (const id of records.MODULE_ORDER) {
    if (lines.length >= 3) break;
    if (!started.has(id)) lines.push(caseLine(id, null));
  }

  setHTML('tileCases', `<h3>DOSSIERS EN COURS <a href="${href('historique')}">Voir tous ›</a></h3>${lines.slice(0, 3).join('')}`);
}

// ── Accès rapides ───────────────────────────────────────────────────────

function paintQuick() {
  const buttons = QUICK
    .filter(item => !item.need || auth.can(item.need))
    .map(item => `<button type="button" onclick="app.go('${item.route}'${item.query ? `,${esc(JSON.stringify(item.query))}` : ''})">${item.icon} ${esc(item.label)}</button>`)
    .join('');

  setHTML('tileQuick', `<h3>ACCÈS RAPIDES</h3>${buttons}`);
}

// ── Effectifs ───────────────────────────────────────────────────────────

const STAFF_HEAD = '<h3>EFFECTIFS BAC 75 N</h3><div class="staffimg"></div>';

async function paintStaff() {
  try {
    const counted = await effectifs.counts();
    if (!counted.readable) {
      setHTML('tileStaff', `${STAFF_HEAD}<p>Effectifs illisibles <b>—</b></p>`);
      return;
    }
    const lines = counted.lines.map(line => `<p>${esc(line.label)} <b>${line.count}</b></p>`).join('');
    setHTML('tileStaff', `${STAFF_HEAD}${lines}<p><strong>Total</strong><b>${counted.total}</b></p>`);
  } catch (error) {
    setHTML('tileStaff', `${STAFF_HEAD}${portal.errorBanner(`Effectifs illisibles : ${error.message}`)}`);
  }
}

const handlers = {
  go(route, query) {
    window.location.hash = href(route, query);
  }
};

export default {
  handlers,

  template() {
    return `<div class="page">${hero()}<div class="modules" id="cards">${CARDS.map(card).join('')}</div><div class="dashboard" id="dash"><div class="panel" id="tileNews">${NEWS_HEAD}</div><div class="panel" id="tileCases"><h3>DOSSIERS EN COURS <a href="${href('historique')}">Voir tous ›</a></h3></div><div class="panel quick" id="tileQuick"><h3>ACCÈS RAPIDES</h3></div><div class="panel staff" id="tileStaff">${STAFF_HEAD}</div></div></div>`;
  },

  async mount({ session }) {
    paintQuick();
    await Promise.all([paintNews(), paintCases(session), paintStaff()]);
  }
};
