// Épreuves et correction de l'examen Chef de Groupe — §8 et §10.
//
// Pendant le passage, aucune note n'apparaît : l'examinateur retranscrit
// les réponses. À la correction, chaque réponse est présentée avec les
// éléments attendus, ceux qui ont été retrouvés, ceux qui manquent, la
// note suggérée — et, à côté, la note retenue, librement modifiable.

import { esc, setHTML } from '../core/dom.js';
import { isOverridden } from '../scoring/assist.js';
import {
  allQuestions,
  questionSuggestion,
  questionMark,
  totals,
  recommendation,
  DECISIONS,
  markTone
} from '../scoring/cdg.js';
import { decisionText, decisionChip } from './chips.js';
import { duration } from '../core/cdg-state.js';

// ───────────────────────────── Passage ──────────────────────────────────

function answerField(question, record, disabled, label) {
  return `
    <div class="q">
      <b>${esc(label)}</b>
      <span class="mut"> /${question.max}</span>
      <div>${esc(question.q)}</div>
      <label>Réponse du candidat — retranscription examinateur</label>
      <textarea ${disabled} oninput="app.setAnswer('${esc(question.id)}',this.value)">${esc(record.ans[question.id] || '')}</textarea>
    </div>`;
}

export function renderConnaissances(record, disabled, hostId = 'connaissancesBox') {
  const questions = record.draw.connaissances.map((question, index) =>
    answerField(question, record, disabled, `${index + 1}. [${question.themeLabel}]`)).join('');

  setHTML(hostId, `
    <div class="card">
      <h2>Connaissances essentielles — 200 points</h2>
      <p class="mut">
        Dix questions courtes, tirées dans dix thèmes différents, en français
        simple et sans piège de vocabulaire. Aucune note n’est affichée pendant
        le passage.
      </p>
      ${questions}
    </div>`);
}

export function renderCommandement(record, disabled, hostId = 'commandementBox') {
  const questions = record.draw.commandement.map((question, index) =>
    answerField(question, record, disabled, `${index + 1}. Commandement`)).join('');

  setHTML(hostId, `
    <div class="card">
      <h2>Commandement / leadership — 200 points</h2>
      <p class="mut">Cinq questions courtes sur la conduite d’un groupe.</p>
      ${questions}
    </div>`);
}

/**
 * Évolution à injecter : lue par l'examinateur au milieu de la situation.
 * Un dossier créé avant son ajout n'en a pas, et rien ne s'affiche.
 */
function injectionBlock(situation) {
  if (!situation.injection) return '';
  const text = String(situation.injection);
  return `
    <div class="banner">
      <b>ÉVOLUTION À INJECTER</b> — à lire au candidat maintenant, avant la
      question suivante<br>${esc(text.charAt(0).toUpperCase() + text.slice(1))}.
    </div>`;
}

export function renderSituation(record, index, disabled, hostId) {
  const situation = record.draw.situations[index];
  const middle = Math.floor(situation.questions.length / 2);

  const questions = situation.questions.map((question, position) => {
    const label = question.section === 'radio'
      ? `${position + 1}. Radio & compte rendu`
      : `${position + 1}.`;
    const field = answerField(question, record, disabled, label);
    return position === middle ? injectionBlock(situation) + field : field;
  }).join('');

  setHTML(hostId, `
    <div class="card">
      <h2>${esc(situation.title)}</h2>
      <div class="statement">
        <b>ÉNONCÉ À LIRE AU CANDIDAT</b><br>${esc(situation.statement)}
      </div>
      <p class="mut">
        250 points pour la situation, plus 50 points pour la question radio,
        comptés dans la section « Radio &amp; compte rendu ».
      </p>
      ${questions}
    </div>`);
}

export function renderTimer(record, hostId = 'timerBox') {
  const d = duration(record);
  if (!d) {
    setHTML(hostId, `
      <div class="banner">
        Renseigne l’heure de début à l’étape Identité pour suivre la durée.
        Format attendu : environ 45 minutes, une heure au maximum.
      </div>`);
    return;
  }

  const tone = d.overrun ? 'error' : 'ok';
  setHTML(hostId, `
    <div class="banner ${tone}">
      Durée ${d.running ? 'en cours' : 'de l’épreuve'} : <b>${esc(d.label)}</b>.
      ${d.overrun
        ? 'Le format compact prévu par le barème est dépassé — à mentionner dans l’appréciation.'
        : 'Format compact respecté (environ 45 min, 1 h au maximum).'}
    </div>`);
}

// ───────────────────────────── Correction ───────────────────────────────

function correctionBlock(record, question, index, disabled) {
  const suggestion = questionSuggestion(record, question);
  const mark = questionMark(record, question);
  const overridden = isOverridden(record.marks[question.id]);

  const expected = (question.attendu || []).map(item => {
    const found = suggestion.found.includes(item);
    return `<li class="${found ? 'ca-found' : 'ca-missing'}">${found ? '✓' : '○'} ${esc(item)}</li>`;
  }).join('');

  return `
    <div class="correction">
      <div class="corrhead">${index + 1}. ${esc(question.q)}</div>
      <div class="answer"><b>Réponse :</b> ${esc(record.ans[question.id] || '—')}</div>

      <div class="ca-grid">
        <div class="ca-expected">
          <div class="ca-label">Éléments attendus</div>
          <ul>${expected || '<li class="mut">aucun élément déclaré</li>'}</ul>
          ${suggestion.missing.length
            ? `<p class="mut" style="margin:7px 0 0">Éléments manquants : ${suggestion.missing.length}</p>`
            : '<p class="mut" style="margin:7px 0 0">Tous les éléments attendus sont retrouvés.</p>'}
        </div>
        <div class="ca-notes">
          <p class="auto">Note suggérée : ${suggestion.note}/${question.max}</p>
          <p class="mut">${esc(suggestion.reason)}</p>
          <label>NOTE RETENUE PAR L’EXAMINATEUR /${question.max}</label>
          <input type="number" min="0" max="${question.max}" ${disabled}
                 value="${esc(record.marks[question.id] ?? '')}"
                 placeholder="${suggestion.note}"
                 oninput="app.setMark('${esc(question.id)}',this.value)">
          <p class="mut">
            ${overridden
              ? `Note retenue : <b>${mark}/${question.max}</b> (la tienne).`
              : 'Champ vide : la suggestion est utilisée dans le calcul.'}
          </p>
        </div>
      </div>
    </div>`;
}

export function renderCorrection(record, disabled, hostId = 'correctBox') {
  const questions = allQuestions(record.draw);
  const t = totals(record, record.draw);

  const groups = t.sections.map(section => {
    const inSection = questions.filter(question => question.section === section.id);
    if (!inSection.length) return '';

    const blocks = inSection
      .map((question, index) => correctionBlock(record, question, index, disabled))
      .join('');

    return `
      <div class="card">
        <h3>${esc(section.label)} — ${section.total}/${section.max}</h3>
        <div class="ca-bareme">
          <span>Total des suggestions <b>${section.suggested}/${section.max}</b></span>
          <span>Total retenu <b>${section.total}/${section.max}</b></span>
          <span>${inSection.length} question(s)</span>
        </div>
        ${section.mismatch
          ? `<div class="banner error">
               Défaut de barème : les questions de cette section valent
               ${section.raw} points bruts alors que le barème en prévoit
               ${section.max}. À corriger dans <code>js/data/cdg-bank.js</code>.
             </div>`
          : ''}
        ${blocks}
      </div>`;
  }).join('');

  setHTML(hostId, `
    <div class="card">
      <h2>Correction assistée</h2>
      <div class="warn">
        <b>Le site aide à noter et aide à décider. Il ne remplace jamais
        l’examinateur.</b> La suggestion repose sur les éléments attendus
        retrouvés dans la réponse : elle ne comprend pas le sens d’une phrase.
        Si tu laisses une note vide, la suggestion est utilisée dans le calcul ;
        dès que tu saisis une note, c’est la tienne qui compte, et les deux
        restent conservées dans la fiche finale.
      </div>
    </div>
    ${groups}`);
}

// ───────────────────────────── Résultat ─────────────────────────────────

export function renderResult(record, disabled, hostId = 'resultBox') {
  const t = totals(record, record.draw);
  const reco = recommendation(record, record.draw);

  const rows = t.sections.map(section => `
    <tr>
      <td>${esc(section.label)}</td>
      <td>${section.suggested}/${section.max}</td>
      <td class="${markTone(section.total, section.max)}">${section.total}/${section.max}</td>
      <td>${Math.round((section.total / (section.max || 1)) * 100)} %</td>
    </tr>`).join('');

  const options = DECISIONS.map(value =>
    `<option value="${value}" ${record.decision === value ? 'selected' : ''}>${esc(decisionText(value))}</option>`
  ).join('');

  const gap = record.decision && record.decision !== reco.decision;
  const d = duration(record);

  setHTML(hostId, `
    <div class="card">
      <h2>Résultats par catégorie</h2>
      <table>
        <tr><th>Épreuve</th><th>Suggéré</th><th>Retenu</th><th>%</th></tr>
        ${rows}
        <tr>
          <th>TOTAL</th>
          <th>${t.suggestedTotal}/${t.max}</th>
          <th class="${markTone(t.total, t.max)}">${t.total}/${t.max}</th>
          <th>${Math.round((t.total / t.max) * 100)} %</th>
        </tr>
      </table>
      <div class="score">${t.total}/${t.max}</div>
      ${t.mismatch
        ? `<div class="banner error">
             Défaut de barème : le brut des questions tirées vaut ${t.raw} au lieu
             de ${t.max}. Le total affiché reste la somme des sections.
           </div>`
        : ''}
      ${d ? `<p class="mut">Durée de l’épreuve : ${esc(d.label)}${d.overrun ? ' — format compact dépassé' : ''}</p>` : ''}
    </div>

    <div class="card">
      <h2>Recommandation du système</h2>
      <p>
        ${reco.recommended
          ? '<b>Qualification recommandée.</b>'
          : '<b>Qualification non recommandée.</b>'}
        ${decisionChip(reco.decision)}
      </p>
      <p class="mut">${esc(reco.reason)}</p>
      <div class="warn">
        Cette recommandation n’engage rien. Tu peux qualifier malgré un avis
        négatif, ou refuser malgré un avis positif — c’est prévu, et la
        motivation sera conservée.
      </div>
    </div>

    <div class="card">
      <h2>Décision de l’examinateur</h2>
      <label>Décision définitive</label>
      <select ${disabled} onchange="app.setDecision(this.value)">
        <option value="">— choisir —</option>
        ${options}
      </select>
      ${gap ? `<div class="warn">
          Ta décision (<b>${esc(decisionText(record.decision))}</b>) s’écarte de la
          recommandation (<b>${esc(decisionText(reco.decision))}</b>).
          La motivation devient obligatoire avant la clôture.
        </div>` : ''}
      <label>Motif / motivation de la décision${gap ? ' (obligatoire ici)' : ''}</label>
      <textarea ${disabled} oninput="app.set('reason',this.value)">${esc(record.reason)}</textarea>
      <label>Points forts</label>
      <textarea ${disabled} oninput="app.set('strength',this.value)">${esc(record.strength)}</textarea>
      <label>Axes d’amélioration</label>
      <textarea ${disabled} oninput="app.set('improve',this.value)">${esc(record.improve)}</textarea>
      <label>Appréciation générale</label>
      <textarea ${disabled} oninput="app.set('general',this.value)">${esc(record.general)}</textarea>
    </div>`);
}
