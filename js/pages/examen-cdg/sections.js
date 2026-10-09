// Gabarits de l'examen Chef de Groupe : identité et tirage, sections des
// épreuves, fiche finale. Rendu seul — l'état et les actions vivent dans
// index.js, qui passe le dossier en paramètre.
//
// `d` vaut 'disabled' quand le dossier est en lecture seule ;
// `stepNav(i)` rend les boutons précédent / suivant de l'étape i.

import { esc } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import { countVariants } from '../../data/cdg-generator.js';

export function identitySection(R, d, stepNav) {

  const examiners = R.ex.map((person, index) => `
    <div class="row">
      <div class="c6">
        <label>Grade examinateur ${index + 1}</label>
        <input ${d} value="${esc(person.grade)}" oninput="app.setExaminer(${index},'grade',this.value)">
      </div>
      <div class="c6">
        <label>Nom examinateur ${index + 1}</label>
        <input ${d} value="${esc(person.name)}" oninput="app.setExaminer(${index},'name',this.value)">
      </div>
    </div>`).join('');

  const variants = countVariants();

  return `
    <section id="s-id" class="section active">
      <div class="card">
        <h2>Candidat</h2>
        <p class="mut">
          Le candidat est déjà un agent BAC expérimenté. L’examen vérifie s’il peut
          désormais se voir confier un groupe.
        </p>
        <div class="row">
          <div class="c4"><label>Nom</label><input ${d} value="${esc(R.c.last)}" oninput="app.set('c.last',this.value)"></div>
          <div class="c4"><label>Prénom</label><input ${d} value="${esc(R.c.first)}" oninput="app.set('c.first',this.value)"></div>
          <div class="c4"><label>Grade</label><input ${d} value="${esc(R.c.grade)}" oninput="app.set('c.grade',this.value)"></div>
          <div class="c3"><label>Matricule</label><input ${d} value="${esc(R.c.mat)}" oninput="app.set('c.mat',this.value)"></div>
          <div class="c3"><label>Date</label><input type="date" ${d} value="${esc(R.c.date)}" oninput="app.set('c.date',this.value)"></div>
          <div class="c3"><label>Heure de début</label><input type="time" ${d} value="${esc(R.c.start)}" oninput="app.set('c.start',this.value)"></div>
          <div class="c3"><label>Heure de fin</label><input type="time" ${d} value="${esc(R.c.end)}" oninput="app.set('c.end',this.value)"></div>
        </div>
      </div>

      <div class="card">
        <h3>Examinateur(s)</h3>
        ${examiners}
        <button ${d} onclick="app.addExaminer()">+ Ajouter un examinateur</button>
      </div>

      <div class="card">
        <h3>Déroulement et barème</h3>
        <p class="mut">
          Format compact voulu : environ 45 minutes, une heure au maximum.
        </p>
        <table>
          <tr><th>Épreuve</th><th>Contenu</th><th>Barème</th></tr>
          <tr><td>Connaissances essentielles</td><td>10 questions simples et aléatoires</td><td>/200</td></tr>
          <tr><td>Commandement / leadership</td><td>5 questions courtes</td><td>/200</td></tr>
          <tr><td>Mise en situation n°1</td><td>Organisation d’une intervention</td><td>/250</td></tr>
          <tr><td>Mise en situation n°2</td><td>Situation évolutive / adaptation</td><td>/250</td></tr>
          <tr><td>Radio &amp; compte rendu</td><td>Intégré aux situations</td><td>/100</td></tr>
          <tr><th>TOTAL</th><th></th><th>/1000</th></tr>
        </table>
      </div>

      <div class="card">
        <h3>Tirage de cette session</h3>
        <table>
          <tr><th>Graine du tirage</th><td><code>${esc(R.draw.seed)}</code></td></tr>
          <tr><th>Tiré le</th><td>${esc(new Date(R.draw.drawnAt).toLocaleString('fr-FR'))}</td></tr>
          <tr><th>Thèmes de connaissances</th><td>${esc([...new Set(R.draw.connaissances.map(q => q.themeLabel))].join(' • '))}</td></tr>
          <tr><th>Variantes possibles</th><td>${variants.total.toLocaleString('fr-FR')}</td></tr>
        </table>
        <p class="mut">
          Les questions et les situations de ce dossier sont <b>figées</b> : elles ne
          changeront plus, même si la banque évolue. La graine permet de vérifier
          après coup comment le tirage a été fait.
        </p>
      </div>

      ${stepNav(0)}
    </section>`;
}

export function section(id, hostId, index, stepNav) {
  return `<section id="s-${id}" class="section"><div id="${hostId}"></div>${stepNav(index)}</section>`;
}

export function finalSection(R, d) {
  const locked = R.locked ? '<p class="locked">DOSSIER CLÔTURÉ — lecture seule.</p>' : '';

  return `
    <section id="s-final" class="section printme">
      <div id="sheet"></div>
      <div class="card no-print">
        <button class="green" onclick="app.downloadPdf()">Télécharger en PDF</button>
        ${auth.can('close')
          ? `<button class="danger" ${d} onclick="app.close()">CLÔTURER DÉFINITIVEMENT LE DOSSIER</button>`
          : '<span class="mut">Ton rôle ne permet pas de clôturer un dossier.</span>'}
        <p class="mut">
          Vérifie la fiche avant de clôturer. Dans la fenêtre d’impression, choisis
          <b>Enregistrer au format PDF</b> comme destination : les cinq pages A4,
          les fonds et les photos sont inclus.
        </p>
        ${locked}
      </div>
    </section>`;
}
