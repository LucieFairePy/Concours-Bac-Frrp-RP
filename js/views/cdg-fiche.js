// Fiche finale Chef de Groupe — cahier des charges §11.
//
// Tout ce que le §11 demande figure dans ces cinq pages : numéro de
// dossier, identité, matricule, grade, date et heure, examinateurs,
// questions, réponses, notes suggérées, notes retenues, mises en situation
// avec leurs évolutions, appréciations, résultats par catégorie, total sur
// 1000, suggestion du système, décision définitive, motif, et les quatre
// signatures — candidat, examinateur, Directeur BAC, Directeur adjoint.

import { esc, initials, setHTML } from '../core/dom.js';
import { imageStyle } from '../data/images.js';
import { decisionText } from './chips.js';
import { duration } from '../core/cdg-state.js';
import {
  allQuestions,
  questionSuggestion,
  questionMark,
  totals,
  recommendation,
  markTone,
  decisionTone
} from '../scoring/cdg.js';

const PAGES = 5;

function head(record, title) {
  return `
    <div class="dp-head">
      <div class="dp-flag"></div>
      <div>
        <div class="dp-brand">POLICE NATIONALE — BRIGADE ANTI-CRIMINALITÉ 75 N</div>
        <div class="dp-sub">${esc(title)}</div>
      </div>
      <div class="dp-id">${esc(record.id)}</div>
    </div>`;
}

function foot(number) {
  return `<div class="dp-foot">BRIGADE ANTI-CRIMINALITÉ — FRANCE ROLEPLAY <span class="dp-page">${number}/${PAGES}</span></div>`;
}

function signatures(record) {
  const examiner = record.ex[0] || { grade: '', name: '' };
  const candidate = `${record.c.first} ${record.c.last}`.trim();

  return `
    <div class="dp-signs">
      <div class="dp-sign">
        <b>Candidat</b><br>${esc(candidate || '—')}
        <div class="sig">${initials(candidate)}</div>
      </div>
      <div class="dp-sign">
        <b>Examinateur</b><br>${esc(`${examiner.grade} ${examiner.name}`.trim() || '—')}
        <div class="sig">${initials(examiner.name)}</div>
      </div>
      <div class="dp-sign">
        <b>Directeur BAC</b><br>${esc(`${record.cmd.dg} ${record.cmd.dn}`.trim())}
        <div class="sig">${initials(record.cmd.dn)}</div>
      </div>
      <div class="dp-sign">
        <b>Directeur adjoint BAC</b><br>${esc(`${record.cmd.ag} ${record.cmd.an}`.trim())}
        <div class="sig">${initials(record.cmd.an)}</div>
      </div>
    </div>`;
}

function questionRows(record, questions) {
  return questions.map((question, index) => {
    const suggestion = questionSuggestion(record, question);
    const mark = questionMark(record, question);
    return `<tr>
      <td>${index + 1}</td>
      <td>${esc(question.q)}</td>
      <td>${esc(record.ans[question.id] || '—')}</td>
      <td>${suggestion.note}/${question.max}</td>
      <td class="${markTone(mark, question.max)}">${mark}/${question.max}</td>
    </tr>`;
  }).join('');
}

function coverPage(record, t, reco, decision) {
  const examiners = record.ex
    .map(person => esc(`${person.grade} ${person.name}`.trim()))
    .filter(Boolean)
    .join('<br>') || '—';

  const d = duration(record);
  const choice = (value, label) => `
    <div>
      <span class="box ${decision === value ? 'chosen' : ''}">${decision === value ? '✓' : ''}</span>${label}
    </div>`;

  return `
  <article class="dossier-page cover-v2">
    ${head(record, 'EXAMEN DE QUALIFICATION CHEF DE GROUPE')}
    <div class="coverHero" style="${imageStyle('cdg')}">
      <div class="coverTitle">
        <div class="big">BRIGADE ANTI-CRIMINALITÉ 75 N</div>
        <div class="small">EXAMEN DE QUALIFICATION CHEF DE GROUPE</div>
        <div class="coverMotto">ANALYSER &nbsp;|&nbsp; ORGANISER &nbsp;|&nbsp; COMMANDER &nbsp;|&nbsp; RENDRE COMPTE</div>
      </div>
    </div>
    <div class="coverStrip">DOSSIER DE QUALIFICATION</div>

    <div class="candidateWrap">
      <div>
        <div class="dp-band" style="margin-top:0">Candidat</div>
        <table class="dp-table">
          <tr><th>Nom</th><td>${esc(String(record.c.last).toUpperCase())}</td><th>Prénom</th><td>${esc(record.c.first)}</td></tr>
          <tr><th>Grade</th><td>${esc(record.c.grade || '—')}</td><th>Matricule</th><td>${esc(record.c.mat || '—')}</td></tr>
          <tr><th>Date</th><td>${esc(record.c.date || '—')}</td><th>Horaire</th><td>${esc(record.c.start || '—')} → ${esc(record.c.end || '—')}</td></tr>
          <tr><th>Durée</th><td>${esc(d ? d.label : '—')}</td><th>Dossier</th><td>${esc(record.id)}</td></tr>
          <tr><th>Examinateur(s)</th><td colspan="3">${examiners}</td></tr>
        </table>
      </div>
      <div class="candidatePhoto"><span>CANDIDAT</span></div>
    </div>

    <div class="coverResults">
      <div class="coverScore">
        <div class="label">RÉSULTAT FINAL</div>
        <div class="number ${markTone(t.total, t.max)}">${t.total} / ${t.max}</div>
        <div class="verdict ${decisionTone(decision)}">${esc(decisionText(decision))}</div>
      </div>
      <div class="juryBox">
        <div class="juryTitle">DÉCISION DE L’EXAMINATEUR</div>
        <div class="juryRows">
          ${choice('QUALIFIE', 'Qualifié')}
          ${choice('QUALIFIE_RESERVE', 'Qualifié sous réserve')}
          ${choice('AJOURNE', 'Ajourné')}
          ${choice('REFUSE', 'Refusé')}
        </div>
      </div>
    </div>

    <div class="dp-band">Suggestion du système</div>
    <table class="dp-table">
      <tr>
        <th>Avis</th>
        <td>${reco.recommended ? 'Qualification recommandée' : 'Qualification non recommandée'} — ${esc(decisionText(reco.decision))}</td>
      </tr>
      <tr><th>Éléments de l’avis</th><td>${esc(reco.reason)}</td></tr>
      <tr><th>Décision retenue</th><td><b>${esc(decisionText(decision))}</b></td></tr>
      <tr><th>Motif</th><td>${esc(record.reason || '—')}</td></tr>
    </table>

    ${foot(1)}
  </article>`;
}

function shortQuestionsPage(record, t) {
  const questions = allQuestions(record.draw);
  const connaissances = questions.filter(question => question.section === 'connaissances');
  const commandement = questions.filter(question => question.section === 'commandement');

  const sectionOf = id => t.sections.find(section => section.id === id);
  const co = sectionOf('connaissances');
  const cm = sectionOf('commandement');

  return `
  <article class="dossier-page">
    ${head(record, 'CONNAISSANCES ET COMMANDEMENT')}
    <div class="dp-band">1. Connaissances essentielles — ${co.total}/${co.max}</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse</th><th>Suggérée</th><th>Retenue</th></tr>
      ${questionRows(record, connaissances)}
    </table>
    <div class="dp-band">2. Commandement / leadership — ${cm.total}/${cm.max}</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse</th><th>Suggérée</th><th>Retenue</th></tr>
      ${questionRows(record, commandement)}
    </table>
    <p class="dp-muted">
      Tirage ${esc(record.draw.seed)} — questions figées à la création de la session.
      Les dix questions de connaissances proviennent de dix thèmes différents.
    </p>
    ${foot(2)}
  </article>`;
}

function situationPage(record, t, index, page) {
  const situation = record.draw.situations[index];
  const sectionId = situation.kind;
  const section = t.sections.find(item => item.id === sectionId);
  const radio = t.sections.find(item => item.id === 'radio');

  const own = situation.questions.filter(question => question.section !== 'radio');
  const radioQuestions = situation.questions.filter(question => question.section === 'radio');

  const parts = Object.entries(situation.parts)
    .map(([key, value]) => `<tr><th>${esc(key)}</th><td>${esc(value)}</td></tr>`)
    .join('');

  return `
  <article class="dossier-page">
    ${head(record, 'MISE EN SITUATION')}
    <div class="dp-band">${esc(situation.title)} — ${section.total}/${section.max}</div>
    <div class="dp-box dp-muted">${esc(situation.statement)}</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse</th><th>Suggérée</th><th>Retenue</th></tr>
      ${questionRows(record, own)}
    </table>
    <div class="dp-band">Radio &amp; compte rendu — section ${radio.total}/${radio.max}</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse</th><th>Suggérée</th><th>Retenue</th></tr>
      ${questionRows(record, radioQuestions)}
    </table>
    <div class="dp-band">Variantes tirées pour cette situation</div>
    <table class="dp-table">${parts}</table>
    ${foot(page)}
  </article>`;
}

function closingPage(record, t, reco, decision) {
  const rows = t.sections.map(section => `
    <tr>
      <td>${esc(section.label)}</td>
      <td>${section.suggested}/${section.max}</td>
      <td class="${markTone(section.total, section.max)}">${section.total}/${section.max}</td>
      <td>${Math.round((section.total / (section.max || 1)) * 100)} %</td>
    </tr>`).join('');

  const stamp = record.locked
    ? '<div class="dp-stamp">DOSSIER CLÔTURÉ<br><span style="font-size:10px">AUCUNE MODIFICATION POSSIBLE</span></div>'
    : '<div class="dp-box"><b>APERÇU AVANT CLÔTURE</b><br>Le dossier reste modifiable tant que la clôture définitive n’a pas été validée.</div>';

  return `
  <article class="dossier-page">
    ${head(record, 'RÉSULTATS, DÉCISION ET CLÔTURE')}
    <div class="dp-band">Résultats par catégorie</div>
    <table class="dp-table">
      <tr><th>Épreuve</th><th>Note suggérée</th><th>Note retenue</th><th>%</th></tr>
      ${rows}
      <tr>
        <th>TOTAL GÉNÉRAL</th>
        <th>${t.suggestedTotal}/${t.max}</th>
        <th class="${markTone(t.total, t.max)}">${t.total}/${t.max}</th>
        <th>${Math.round((t.total / t.max) * 100)} %</th>
      </tr>
    </table>

    <div class="dp-band">Appréciations</div>
    <div class="dp-grid">
      <div class="dp-box"><b class="dp-check">✓ POINTS FORTS</b><br><br>${esc(record.strength || '—')}</div>
      <div class="dp-box"><b>⚠ AXES D’AMÉLIORATION</b><br><br>${esc(record.improve || '—')}</div>
    </div>
    <div class="dp-box" style="margin-top:7px"><b>APPRÉCIATION GÉNÉRALE</b><br><br>${esc(record.general || '—')}</div>

    <div class="dp-band">Décision définitive</div>
    <div class="dp-decision"><span class="${decisionTone(decision)}">${esc(decisionText(decision))}</span></div>
    <div class="dp-score"><span class="${markTone(t.total, t.max)}">${t.total} / ${t.max}</span></div>
    <table class="dp-table">
      <tr><th>Suggestion du système</th><td>${esc(decisionText(reco.decision))} — ${esc(reco.reason)}</td></tr>
      <tr><th>Motif de la décision</th><td>${esc(record.reason || '—')}</td></tr>
    </table>

    <div class="dp-band">Signatures &amp; validation</div>
    ${signatures(record)}

    <div style="text-align:center;margin-top:9mm">${stamp}</div>
    <p class="dp-muted" style="text-align:center;margin-top:6mm">
      Document fictif — France Roleplay — sans valeur administrative réelle.
    </p>
    ${foot(5)}
  </article>`;
}

export function renderCdgFiche(record, hostId = 'sheet') {
  const t = totals(record, record.draw);
  const reco = recommendation(record, record.draw);
  const decision = record.decision || reco.decision;

  setHTML(hostId, [
    coverPage(record, t, reco, decision),
    shortQuestionsPage(record, t),
    situationPage(record, t, 0, 3),
    situationPage(record, t, 1, 4),
    closingPage(record, t, reco, decision)
  ].join(''));
}
