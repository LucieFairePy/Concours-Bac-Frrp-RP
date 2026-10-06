// Page d'accueil du portail — cahier des charges §4.
//
// Deux accès très visibles (Concours, Formation Négociation), des accès
// secondaires, puis une zone dynamique : dossiers en cours, dernières
// clôtures, formations suivies, corrections en attente.
//
// La zone dynamique peint d'abord une version « chargement », puis se
// remplit. Une lecture qui échoue n'efface pas la page : elle affiche son
// message à sa place.

import { esc, setHTML } from './core/dom.js';
import * as portal from './core/portal.js';
import * as auth from './core/auth.js';
import * as records from './core/records.js';
import { imageStack } from './data/images.js';
import { decisionChip } from './views/chips.js';

const PRIMARY = [
  {
    slot: 'concours',
    tag: 'Évaluation',
    title: 'Concours d’intégration BAC',
    text: 'Parcours complet du candidat : identité, théorie, radio, situations, physique, tir, correction, fiche finale sur 1000 points.',
    href: 'app.html',
    go: 'Ouvrir un dossier de concours →'
  },
  {
    slot: 'negociation',
    tag: 'Formation',
    title: 'Formation Négociation BAC',
    text: 'Cours complet, exercices et mise en situation finale. Contact, écoute active, reformulation, temporisation, compte rendu.',
    href: 'negociation.html',
    go: 'Entrer en formation →'
  }
];

const SECONDARY = [
  {
    slot: 'formation-cdg',
    tag: 'Formation',
    title: 'Formation Chef de Groupe',
    text: '16 chapitres : organisation, commandement, radio, coordination, débriefing.',
    href: 'chef-de-groupe.html'
  },
  {
    slot: 'cdg',
    tag: 'Qualification',
    title: 'Examen Chef de Groupe',
    text: 'Examen compact de 45 min à 1 h, noté sur 1000, banque de situations aléatoires.',
    href: 'examen-cdg.html'
  },
  {
    slot: 'historique',
    tag: 'Archives',
    title: 'Historique BAC',
    text: 'Tous les dossiers clôturés du portail, par catégorie, avec recherche et filtres.',
    href: 'historique.html'
  },
  {
    slot: 'administration',
    tag: 'Direction',
    title: 'Administration',
    text: 'Accès, rôles, journal des actions sensibles et état du dépôt.',
    href: 'administration.html',
    need: 'accounts'
  }
];

function card(item, compact) {
  return `
    <a class="pcard" href="${item.href}">
      <span class="pcard-img" style="background-image:${imageStack(item.slot)}"></span>
      <span class="pcard-tag">${esc(item.tag)}</span>
      <span class="pcard-body">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
        ${compact ? '' : `<span class="pcard-go">${esc(item.go)}</span>`}
      </span>
    </a>`;
}

function hero() {
  const session = auth.current();
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonjour' : 'Bonsoir';

  setHTML('hero', `
    <section class="phero">
      <div class="phero-img" style="background-image:${imageStack('accueil-hero')}"></div>
      <div class="phero-body">
        <div class="phero-kicker">Police Nationale • Brigade Anti-Criminalité • Paris</div>
        <h1>BAC 75 N</h1>
        <div class="flag"></div>
        <p>
          ${esc(greeting)} ${esc(session ? session.name : '')}. Portail interne de la brigade :
          concours d’intégration, formations, qualification Chef de Groupe et
          historique centralisé des dossiers.
        </p>
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

function tile(title, note, body) {
  return `
    <div class="ptile">
      <h3>${esc(title)}</h3>
      <p class="mut">${esc(note)}</p>
      ${body}
    </div>`;
}

function paintLive(content) {
  setHTML('live', content);
}

function loadingTiles() {
  const skeleton = '<p class="pempty">Lecture du dépôt…</p>';
  paintLive([
    tile('Mes dossiers en cours', 'Brouillons repris sur n’importe quel poste', skeleton),
    tile('Dernières clôtures', 'Tous modules confondus', skeleton),
    tile('Corrections en attente', 'Dossiers ouverts non clôturés', skeleton)
  ].join(''));
}

function draftLine(draft) {
  const mod = records.MODULES[draft.module];
  const name = records.fullName(draft.record.c || {});
  return `
    <li>
      <span class="pid">${esc(draft.record.id || mod.prefix)}</span>
      <span>${esc(name || 'sans candidat')} <span class="mut">${esc(mod.short)}</span></span>
      <a class="pwhen" href="${mod.page}">reprendre →</a>
    </li>`;
}

function closedLine(entry) {
  const mod = records.MODULES[entry.module];
  return `
    <li>
      <span class="pid">${esc(entry.id)}</span>
      <span>
        ${esc(records.fullName(entry) || '—')}
        <span class="mut">${esc(mod ? mod.short : entry.module)}</span>
        ${decisionChip(entry.decision)}
      </span>
      <a class="pwhen" href="historique.html?dossier=${encodeURIComponent(entry.id)}&module=${esc(entry.module)}">${esc(when(entry.closedAt || entry.date))}</a>
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

async function live() {
  loadingTiles();

  const session = auth.current();
  const [drafts, all] = await Promise.all([
    myDrafts(session.login),
    records.listAll()
  ]);

  const closed = all.entries.slice(0, 6);
  const pending = drafts.filter(draft => !draft.record.locked);

  const draftsBody = pending.length
    ? `<div class="pstat"><b>${pending.length}</b><span class="mut">dossier(s) ouvert(s)</span></div>
       <ul class="plist">${pending.map(draftLine).join('')}</ul>`
    : `<div class="pstat"><b>0</b><span class="mut">dossier ouvert</span></div>
       <p class="pempty">Aucun brouillon. Ouvre un module pour commencer un dossier.</p>`;

  const closedBody = closed.length
    ? `<div class="pstat"><b>${all.entries.length}</b><span class="mut">dossier(s) clôturé(s)</span></div>
       <ul class="plist">${closed.map(closedLine).join('')}</ul>`
    : '<p class="pempty">Aucun dossier clôturé pour le moment.</p>';

  const byCategory = Object.values(records.CATEGORIES).map(category => {
    const count = all.entries.filter(entry => entry.category === category.id).length;
    return `<li><span>${esc(category.label)}</span><span class="pwhen">${count}</span></li>`;
  }).join('');

  const errors = all.errors.length
    ? `<p class="mut">Modules illisibles : ${esc(all.errors.map(item => item.id).join(', '))}</p>`
    : '';

  paintLive([
    tile('Mes dossiers en cours', 'Brouillons repris sur n’importe quel poste', draftsBody),
    tile('Dernières clôtures', 'Tous modules confondus', closedBody + errors),
    tile('Répartition par catégorie', 'Historique centralisé', `<ul class="plist">${byCategory}</ul>
      <p class="mut" style="margin-top:9px"><a href="historique.html">Ouvrir l’historique complet →</a></p>`)
  ].join(''));
}

async function boot() {
  const { session } = await portal.boot({ active: 'accueil' });
  if (!session) return;

  hero();
  setHTML('primary', PRIMARY.map(item => card(item, false)).join(''));
  setHTML('secondary', SECONDARY
    .filter(item => !item.need || auth.can(item.need))
    .map(item => card(item, true))
    .join(''));

  try {
    await live();
  } catch (error) {
    paintLive(`<div class="ptile">${portal.errorBanner(`Activité illisible : ${error.message}`)}</div>`);
  }
}

boot();
