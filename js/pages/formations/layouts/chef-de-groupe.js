// Gabarits de la Formation Chef de Groupe — modules/formation-chef-groupe.html
// de l'archive V4, à l'identique.
//
// L'archive : barre « ← Retour au portail BAC 75 N » et logo, bandeau
// photo « FORMATION • COMMANDEMENT », sommaire « LES 16 CHAPITRES » à
// gauche, et à droite « Chapitre n sur 16 », la carte du chapitre (MODULE
// 01, titre, introduction, photo, « Ce qu'il faut comprendre », encadrés
// À RETENIR, EXEMPLE CONCRET, MISE EN PRATIQUE) puis Précédent, Suivant et
// le lien vers l'examen. Pas d'identité, pas d'évaluation, pas de fiche :
// l'archive n'en a pas.
//
// Seul ajout : un dossier clôturé avant ce retour à l'archive, ouvert depuis
// l'historique, s'affiche en lecture seule à la place du cours (dossier()).
//
// La feuille de style vit sous `.m-fcdg` (css/pages/formation-chef-groupe.css).

import { esc } from '../../../core/dom.js';
import { href } from '../../../routes.js';
import { LOGO } from '../../../data/images.js';
import { A_RETENIR } from '../../../data/formations/chef-de-groupe-lecons.js';

const KIT = 'assets/bac75n';

export function page(count) {
  return `
    <section class="m-fcdg">
      <header class="cdg-head no-print">
        <a href="${href('accueil')}">← Retour au portail BAC 75 N</a>
        <img src="${LOGO.file}" alt="Logo BAC 75 N"
             onerror="this.onerror=null;this.src='${LOGO.fallback}'">
      </header>
      <div class="cdg-hero no-print">
        <div>
          <div class="cdg-pill">FORMATION • COMMANDEMENT</div>
          <h1>CHEF DE GROUPE BAC 75 N</h1>
          <p>${count} chapitres complets : comprendre, organiser, communiquer et coordonner une vacation.</p>
        </div>
      </div>
      <div class="cdg-wrap" id="fcdgBody">
        <nav class="cdg-nav" id="chapters" aria-label="Sommaire interactif"><b>LES ${count} CHAPITRES</b></nav>
        <div class="cdg-lesson" id="lesson" aria-live="polite"></div>
      </div>
    </section>`;
}

export function sommaire(lecons, index) {
  return `<b>LES ${lecons.length} CHAPITRES</b>` + lecons.map((l, i) =>
    `<button class="${i === index ? 'active' : ''}" onclick="app.go(${i})">${esc(l.number)} — ${esc(l.title)}</button>`
  ).join('');
}

export function lecon(lecons, index) {
  const l = lecons[index];
  return `
    <div class="cdg-progress">Chapitre ${index + 1} sur ${lecons.length}</div>
    <article class="cdg-card">
      <span class="cdg-pill">MODULE ${esc(l.number)}</span>
      <h2>${esc(l.title)}</h2>
      <p>${esc(l.intro)}</p>
      <img class="cdg-img" src="${KIT}/${esc(l.photo)}" alt="Photographie illustrative de la BAC 75 N">
      <h3>Ce qu'il faut comprendre</h3>
      <ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <div class="cdg-note"><b>À RETENIR</b><p>${esc(A_RETENIR)}</p></div>
      <div class="cdg-example"><b>EXEMPLE CONCRET</b><p>${esc(l.example)}</p></div>
      <div class="cdg-exercise"><b>MISE EN PRATIQUE</b><p>${esc(l.exercise)}</p></div>
    </article>
    <div class="cdg-actions">
      <button ${index === 0 ? 'disabled' : ''} onclick="app.go(${index - 1})">← Précédent</button>
      <button ${index === lecons.length - 1 ? 'disabled' : ''} onclick="app.go(${index + 1})">Suivant →</button>
      <a href="${href('examen-chef-groupe')}">Examen Chef de Groupe</a>
    </div>`;
}

/** Un dossier clôturé de l'ancien parcours : sa fiche finale, en lecture seule. */
export function dossier(id) {
  return `
    <section id="s-final" class="section active printme cdg-dossier">
      <div class="cdg-card no-print">
        <span class="cdg-pill">DOSSIER ${esc(id)}</span>
        <h2>Fiche finale — lecture seule</h2>
        <p>Dossier clôturé avant le retour au cours de l’archive. Il se consulte tel qu’il a été clôturé.</p>
        <div class="cdg-actions">
          <button onclick="app.print()">Télécharger en PDF</button>
          <a href="${href('formation-chef-groupe')}">Ouvrir le cours</a>
        </div>
      </div>
      <div id="sheet"></div>
    </section>`;
}
