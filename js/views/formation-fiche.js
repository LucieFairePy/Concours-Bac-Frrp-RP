// Fiche finale d'une formation — cahier des charges §6, §7 et §12.
//
// Trois pages A4 imprimables, au même format que le dossier de concours
// (css/dossier.css) : couverture avec décision et signatures, détail de
// l'évaluation avec note suggérée **et** note retenue, puis progression du
// cours, exercices et clôture.
//
// La note suggérée figure à côté de la note retenue dans le document
// définitif : c'est ce que demande le §10, pour que la transparence survive
// à la clôture.

import { esc, initials, setHTML } from '../core/dom.js';
import { decisionText } from './chips.js';
import { imageStack } from '../data/images.js';
import {
  questionSuggestion,
  questionMark,
  formationTotals,
  suggestedDecision,
  decisionReason,
  readCount
} from '../core/formation.js';

const PAGES = 3;

function head(course, record, title) {
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

function markTone(value, max) {
  const ratio = Number(value) / (Number(max) || 1);
  if (ratio >= 0.8) return 'note-verte';
  if (ratio >= 0.65) return 'note-orange';
  return 'note-rouge';
}

function decisionTone(decision) {
  if (decision === 'ACQUIS') return 'appreciation-retenu';
  if (decision === 'ACQUIS_RESERVE') return 'appreciation-reserve';
  return 'appreciation-recale';
}

function signatures(record) {
  const trainer = record.ex[0] || { grade: '', name: '' };
  const candidate = `${record.c.first} ${record.c.last}`.trim();

  return `
    <div class="dp-signs">
      <div class="dp-sign">
        <b>Agent formé</b><br>${esc(candidate || '—')}
        <div class="sig">${initials(candidate)}</div>
      </div>
      <div class="dp-sign">
        <b>Formateur</b><br>${esc(`${trainer.grade} ${trainer.name}`.trim() || '—')}
        <div class="sig">${initials(trainer.name)}</div>
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

function coverPage(course, record, t, decision) {
  return `
  <article class="dossier-page">
    ${head(course, record, 'ATTESTATION DE FORMATION')}
    <div class="dp-photo" style="height:56mm;background-image:linear-gradient(#06152222,#06152266),${imageStack(course.image)}"></div>
    <div style="text-align:center">
      <div class="dp-kicker">France Roleplay — document fictif</div>
      <h1 class="dp-title">${esc(course.title)}</h1>
    </div>
    <div class="dp-band">Agent formé</div>
    <table class="dp-table">
      <tr><th>Nom</th><td>${esc(String(record.c.last).toUpperCase())}</td><th>Prénom</th><td>${esc(record.c.first)}</td></tr>
      <tr><th>Grade</th><td>${esc(record.c.grade || '—')}</td><th>Matricule</th><td>${esc(record.c.mat || '—')}</td></tr>
      <tr><th>Date</th><td>${esc(record.c.date || '—')}</td><th>Dossier</th><td>${esc(record.id)}</td></tr>
    </table>
    <div class="dp-band">Résultat de l’évaluation</div>
    <div class="dp-score"><span class="${markTone(t.total, t.max)}">${t.total} / ${t.max}</span></div>
    <div class="dp-decision"><span class="${decisionTone(decision)}">${esc(decisionText(decision))}</span></div>
    <table class="dp-table">
      <tr><th>Recommandation du système</th><td>${esc(decisionText(suggestedDecision(record, course)))}</td></tr>
      <tr><th>Éléments de la recommandation</th><td>${esc(decisionReason(record, course))}</td></tr>
      <tr><th>Décision retenue par le formateur</th><td><b>${esc(decisionText(decision))}</b></td></tr>
    </table>
    <div class="dp-band">Signatures</div>
    ${signatures(record)}
    ${foot(1)}
  </article>`;
}

function evaluationPage(course, record, t) {
  const rows = course.evaluation.questions.map((question, index) => {
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

  return `
  <article class="dossier-page">
    ${head(course, record, 'DÉTAIL DE L’ÉVALUATION')}
    <div class="dp-band">Évaluation — ${t.total}/${t.max}</div>
    <table class="dp-table">
      <tr>
        <th>N°</th><th>Question</th><th>Réponse de l’agent</th>
        <th>Note suggérée</th><th>Note retenue</th>
      </tr>
      ${rows}
      <tr>
        <th colspan="3">TOTAL</th>
        <th>${t.suggestedTotal}/${t.max}</th>
        <th class="${markTone(t.total, t.max)}">${t.total}/${t.max}</th>
      </tr>
    </table>
    <p class="dp-muted">
      La note suggérée est une aide fondée sur les éléments attendus retrouvés
      dans la réponse. La note retenue est celle du formateur : elle prime en
      toute circonstance, et les deux sont conservées pour que la correction
      reste vérifiable.
    </p>
    ${foot(2)}
  </article>`;
}

function closingPage(course, record, t, decision) {
  const read = readCount(record, course);

  const exercises = course.chapters
    .flatMap(chapter => chapter.blocks
      .filter(block => block.t === 'exercice')
      .map(block => ({ chapter, block })))
    .filter(item => String(record.work[item.block.id] || '').trim());

  const exerciseRows = exercises.length
    ? exercises.map(item => `<tr>
        <td>${esc(item.chapter.num)}</td>
        <td>${esc(item.block.text)}</td>
        <td>${esc(record.work[item.block.id])}</td>
      </tr>`).join('')
    : '<tr><td colspan="3">Aucun exercice renseigné.</td></tr>';

  const stamp = record.locked
    ? '<div class="dp-stamp">DOSSIER CLÔTURÉ<br><span style="font-size:10px">AUCUNE MODIFICATION POSSIBLE</span></div>'
    : '<div class="dp-box"><b>APERÇU AVANT CLÔTURE</b><br>Le dossier reste modifiable tant que la clôture définitive n’a pas été validée.</div>';

  return `
  <article class="dossier-page">
    ${head(course, record, 'PROGRESSION, EXERCICES ET CLÔTURE')}
    <div class="dp-band">Progression du cours</div>
    <table class="dp-table">
      <tr><th>Chapitres parcourus</th><td>${read} / ${course.chapters.length}</td></tr>
      <tr><th>Fiche réflexe</th><td>${esc(course.reflexe.steps.join(' → '))}</td></tr>
    </table>
    <div class="dp-band">Exercices renseignés</div>
    <table class="dp-table">
      <tr><th>Ch.</th><th>Exercice</th><th>Réponse</th></tr>
      ${exerciseRows}
    </table>
    <div class="dp-band">Appréciation du formateur</div>
    <div class="dp-grid">
      <div class="dp-box"><b class="dp-check">✓ POINTS FORTS</b><br><br>${esc(record.strength || '—')}</div>
      <div class="dp-box"><b>⚠ AXES D’AMÉLIORATION</b><br><br>${esc(record.improve || '—')}</div>
    </div>
    <div class="dp-band">Motivation de la décision</div>
    <div class="dp-box">${esc(record.reason || '—')}</div>
    <div style="text-align:center;margin-top:12mm">${stamp}</div>
    <p class="dp-muted" style="text-align:center;margin-top:8mm">
      Document fictif — France Roleplay — sans valeur administrative réelle.
    </p>
    ${foot(3)}
  </article>`;
}

export function renderFormationFiche(course, record, hostId = 'sheet') {
  const t = formationTotals(record, course);
  const decision = record.decision || suggestedDecision(record, course);

  setHTML(hostId, [
    coverPage(course, record, t, decision),
    evaluationPage(course, record, t),
    closingPage(course, record, t, decision)
  ].join(''));
}
