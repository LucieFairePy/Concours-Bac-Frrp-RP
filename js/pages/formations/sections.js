// Gabarits du parcours de formation : identité, cours, évaluation,
// correction assistée, fiche finale. Rendu seul — l'état et les actions
// vivent dans engine.js, qui passe le dossier en paramètre.
//
// `dis` vaut 'disabled' quand le dossier est en lecture seule ;
// `stepNav(i)` rend les boutons précédent / suivant de l'étape i.

import { esc } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import {
  readCount,
  readRatio,
  questionSuggestion,
  questionMark,
  formationTotals,
  evaluationOf,
  suggestedDecision,
  decisionReason,
  DECISIONS
} from '../../core/formation.js';
import { isOverridden } from '../../scoring/assist.js';
import { decisionText, decisionChip } from '../../ui/chips.js';
import { reflexeCard } from './reflexe.js';

export function identitySection(course, R, dis, stepNav) {
  const examiners = R.ex.map((person, index) => `
    <div class="row">
      <div class="c6">
        <label>Grade formateur ${index + 1}</label>
        <input ${dis} value="${esc(person.grade)}" oninput="app.setExaminer(${index},'grade',this.value)">
      </div>
      <div class="c6">
        <label>Nom formateur ${index + 1}</label>
        <input ${dis} value="${esc(person.name)}" oninput="app.setExaminer(${index},'name',this.value)">
      </div>
    </div>`).join('');

  return `
    <section id="s-id" class="section active">
      <div class="card">
        <h2>Agent en formation</h2>
        <div class="row">
          <div class="c4"><label>Nom</label><input ${dis} value="${esc(R.c.last)}" oninput="app.set('c.last',this.value)"></div>
          <div class="c4"><label>Prénom</label><input ${dis} value="${esc(R.c.first)}" oninput="app.set('c.first',this.value)"></div>
          <div class="c4"><label>Grade</label><input ${dis} value="${esc(R.c.grade)}" oninput="app.set('c.grade',this.value)"></div>
          <div class="c4"><label>Matricule</label><input ${dis} value="${esc(R.c.mat)}" oninput="app.set('c.mat',this.value)"></div>
          <div class="c4"><label>Date</label><input type="date" ${dis} value="${esc(R.c.date)}" oninput="app.set('c.date',this.value)"></div>
          <div class="c4"><label>Heure de début</label><input type="time" ${dis} value="${esc(R.c.start)}" oninput="app.set('c.start',this.value)"></div>
        </div>
      </div>
      <div class="card">
        <h3>Formateur(s)</h3>
        ${examiners}
        <button ${dis} onclick="app.addExaminer()">+ Ajouter un formateur</button>
      </div>
      <div class="card">
        <h3>Ce que couvre cette formation</h3>
        <p>${esc(course.intro)}</p>
        ${reflexeCard(course)}
      </div>
      ${stepNav(0)}
    </section>`;
}

export function coursSection(stepNav) {
  return `
    <section id="s-cours" class="section">
      <div class="co-progress no-print">
        <div class="progress"><span id="coursProg"></span></div>
        <b id="coursCount"></b>
      </div>
      <div class="co-wrap" id="coursWrap"></div>
      ${stepNav(1)}
    </section>`;
}

export function evalSection(stepNav) {
  return `
    <section id="s-eval" class="section">
      <div id="evalBox"></div>
      ${stepNav(2)}
    </section>`;
}

export function correctSection(stepNav) {
  return `
    <section id="s-correct" class="section">
      <div id="correctBox"></div>
      ${stepNav(3)}
    </section>`;
}

export function finalSection(R, dis) {
  const locked = R.locked
    ? '<p class="locked">DOSSIER CLÔTURÉ — lecture seule.</p>'
    : '';

  return `
    <section id="s-final" class="section printme">
      <div id="sheet"></div>
      <div class="card no-print">
        <button class="green" onclick="app.downloadPdf()">Télécharger en PDF</button>
        ${auth.can('close')
          ? `<button class="danger" ${dis} onclick="app.close()">CLÔTURER DÉFINITIVEMENT LE DOSSIER</button>`
          : '<span class="mut">Ton rôle ne permet pas de clôturer un dossier.</span>'}
        <p class="mut">
          Dans la fenêtre d’impression, choisis <b>Enregistrer au format PDF</b>
          comme destination. Les trois pages A4, les fonds et les photos sont inclus.
        </p>
        ${locked}
      </div>
    </section>`;
}

export function evaluationHtml(course, R, dis) {
  const evaluation = evaluationOf(R, course);
  const questions = evaluation.questions.map((question, index) => `
    <div class="q">
      <b>${index + 1}. ${esc(question.q)}</b>
      <span class="mut"> /${question.max}</span>
      <label>Réponse de l’agent</label>
      <textarea ${dis} oninput="app.setAnswer('${esc(question.id)}',this.value)">${esc(R.ans[question.id] || '')}</textarea>
    </div>`).join('');

  const ratio = readRatio(R, course);
  const warn = ratio < 0.8
    ? `<div class="warn">
         Le cours n’est parcouru qu’à ${Math.round(ratio * 100)} %. L’évaluation reste
         possible, mais la recommandation du système en tiendra compte.
       </div>`
    : '';

  return `
    <div class="card">
      <h2>Évaluation — ${evaluation.max} points</h2>
      <p class="mut">
        ${evaluation.duration ? `${esc(evaluation.duration)} • ` : ''}aucune note n’est
        affichée pendant la saisie des réponses.
      </p>
      ${warn}
      ${questions}
    </div>`;
}

function correctionBlock(R, question, index, dis) {
  const suggestion = questionSuggestion(R, question);
  const mark = questionMark(R, question);
  const overridden = isOverridden(R.marks[question.id]);

  const expected = (question.attendu || []).map(item => {
    const found = suggestion.found.includes(item);
    return `<li class="${found ? 'ca-found' : 'ca-missing'}">${found ? '✓' : '○'} ${esc(item)}</li>`;
  }).join('');

  return `
    <div class="correction">
      <div class="corrhead">${index + 1}. ${esc(question.q)}</div>
      <div class="answer"><b>Réponse :</b> ${esc(R.ans[question.id] || '—')}</div>

      <div class="ca-grid">
        <div class="ca-expected">
          <div class="ca-label">Éléments attendus</div>
          <ul>${expected || '<li class="mut">aucun élément déclaré</li>'}</ul>
        </div>
        <div class="ca-notes">
          <p class="auto">Note suggérée : ${suggestion.note}/${question.max}</p>
          <p class="mut">${esc(suggestion.reason)}</p>
          <label>NOTE RETENUE PAR L’EXAMINATEUR /${question.max}</label>
          <input type="number" min="0" max="${question.max}" ${dis}
                 value="${esc(R.marks[question.id] ?? '')}"
                 placeholder="${suggestion.note}"
                 oninput="app.setMark('${esc(question.id)}',this.value)">
          <p class="mut">
            ${overridden
              ? `Note de l’examinateur retenue : <b>${mark}/${question.max}</b>.`
              : 'Champ vide : la suggestion est utilisée dans le calcul.'}
          </p>
        </div>
      </div>
    </div>`;
}

export function correctionHtml(course, R, dis) {
  const t = formationTotals(R, course);
  const suggestion = suggestedDecision(R, course);

  const blocks = evaluationOf(R, course).questions.map((question, index) => correctionBlock(R, question, index, dis)).join('');

  const options = DECISIONS.map(value =>
    `<option value="${value}" ${R.decision === value ? 'selected' : ''}>${esc(decisionText(value))}</option>`
  ).join('');

  const gap = R.decision && R.decision !== suggestion;

  return `
    <div class="card">
      <h2>Correction assistée</h2>
      <div class="warn">
        <b>Le site aide à noter et aide à décider. Il ne remplace jamais
        l’examinateur.</b> La suggestion repose sur les éléments attendus
        retrouvés dans la réponse : elle ne comprend pas le sens d’une phrase.
        La note retenue et la décision finale sont les tiennes.
      </div>
      ${blocks}
    </div>

    <div class="card">
      <h2>Résultat</h2>
      <table>
        <tr><th>Total des suggestions</th><td>${t.suggestedTotal}/${t.max}</td></tr>
        <tr><th>Total retenu par l’examinateur</th><td><b>${t.total}/${t.max}</b></td></tr>
        <tr><th>Chapitres parcourus</th><td>${readCount(R, course)}/${course.chapters.length}</td></tr>
      </table>
      <div class="score">${t.total}/${t.max}</div>
      <p>Recommandation du système : ${decisionChip(suggestion)}</p>
      <p class="mut">${esc(decisionReason(R, course))}</p>
    </div>

    <div class="card">
      <h2>Décision du formateur</h2>
      <label>Décision finale</label>
      <select ${dis} onchange="app.setDecision(this.value)">
        <option value="">— choisir —</option>
        ${options}
      </select>
      ${gap ? `<div class="warn">
          Ta décision (<b>${esc(decisionText(R.decision))}</b>) s’écarte de la
          recommandation (<b>${esc(decisionText(suggestion))}</b>). Motive-la
          ci-dessous : la motivation est conservée dans la fiche finale.
        </div>` : ''}
      <label>Motivation / observations${gap ? ' (obligatoire ici)' : ''}</label>
      <textarea ${dis} oninput="app.set('reason',this.value)">${esc(R.reason)}</textarea>
      <label>Points forts</label>
      <textarea ${dis} oninput="app.set('strength',this.value)">${esc(R.strength)}</textarea>
      <label>Axes d’amélioration</label>
      <textarea ${dis} oninput="app.set('improve',this.value)">${esc(R.improve)}</textarea>
    </div>`;
}
