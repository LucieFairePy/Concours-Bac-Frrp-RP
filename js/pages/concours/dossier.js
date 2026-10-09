// Fiche finale du concours — les 8 pages A4 de l'archive V4
// (modules/concours-bac.html, fonction finalSheet), page pour page.
//
// Seule différence : les photos de l'archive, embarquées en base64, sont
// servies depuis assets/img/ (mêmes fichiers, octet pour octet).

import { radioOf } from '../../data/radio.js';
import { scenariosOf } from '../../data/scenarios.js';
import { esc, initials, setHTML } from '../../core/dom.js';
import { state } from '../../core/state.js';
import { usesPlank } from '../../scoring/auto.js';
import { totals, suggestedDecision, theoryMark, radioMark, scenarioMark } from '../../scoring/totals.js';
import { decisionLabel } from './results.js';

const PAGES = 8;

const IMAGES = {
  cover: 'assets/img/concours-couverture.jpg',
  recap: 'assets/img/recap-general.jpg',
  scenarios: 'assets/img/mises-en-situation.jpg',
  shooting: 'assets/img/epreuve-tir.jpg'
};

export const DOSSIER_IMAGES = Object.values(IMAGES);

/** Code couleur V6 de l'archive : vert ≥ 80 %, orange ≥ 65 %, rouge sinon. */
function gradeClass(value, max) {
  const ratio = Number(value) / (Number(max) || 1);
  return ratio >= 0.8 ? 'grade-good' : ratio >= 0.65 ? 'grade-mid' : 'grade-bad';
}

function gradeBg(value, max) {
  return `${gradeClass(value, max)}-bg`;
}

/** Un RECALÉ s'affiche en rouge quel que soit le total. */
function scoreBg(total, decision) {
  return decision === 'RECALE' ? 'grade-bad-bg' : gradeBg(total, 1000);
}

function decisionClass(decision) {
  if (decision === 'RECALE') return 'decision-recale';
  if (decision === 'AJOURNE') return 'decision-ajourne';
  if (decision === 'RESERVE') return 'decision-reserve';
  return 'decision-retenu';
}

function photo(image, height, shade = '#06152211,#06152255') {
  return `<div class="dp-photo" style="height:${height};background-image:linear-gradient(${shade}),url('${image}')"></div>`;
}

function pageHead(title, id) {
  return `<div class="dp-head"><div class="dp-flag"></div><div><div class="dp-brand">POLICE NATIONALE — BRIGADE ANTI-CRIMINALITÉ</div><div class="dp-sub">${title}</div></div><div class="dp-id">${esc(id)}</div></div>`;
}

function pageFoot(number) {
  return `<div class="dp-foot">BRIGADE ANTI-CRIMINALITÉ — FRANCE ROLEPLAY <span class="dp-page">${number}/${PAGES}</span></div>`;
}

function scenarioBlock(dossier, index) {
  const scenario = scenariosOf(dossier)[index];
  if (!scenario) return '';

  const questions = scenario.questions.map((question, questionIndex) => {
    const mark = scenarioMark(dossier, index, questionIndex);
    return `
      <div class="dp-q">
        <b>${questionIndex + 1}. ${esc(question)}</b>
        <div class="ans">${esc(dossier.scAns[index][questionIndex] || '—')}</div>
        <span class="${gradeClass(mark, 15)}">Note : ${mark}/15</span>
      </div>`;
  }).join('');

  return `
    <div class="dp-scenario">
      <h4>${esc(scenario.title)}</h4>
      <div class="dp-statement"><b>ÉNONCÉ :</b> ${esc(scenario.statement)}</div>
      ${questions}
    </div>`;
}

function signatures(dossier) {
  const first = dossier.ex[0] || { grade: '', name: '' };
  return `
    <div class="dp-signs">
      <div class="dp-sign">
        <b>Candidat</b><br>${esc(`${dossier.c.first} ${dossier.c.last}`)}
        <div class="sig">${initials(`${dossier.c.first} ${dossier.c.last}`)}</div>
      </div>
      <div class="dp-sign">
        <b>Examinateur principal</b><br>${esc(first.grade || '')} ${esc(first.name || '')}
        <div class="sig">${initials(first.name || '')}</div>
      </div>
      <div class="dp-sign">
        <b>Directeur BAC</b><br>${esc(`${dossier.cmd.dg} ${dossier.cmd.dn}`)}
        <div class="sig">${initials(dossier.cmd.dn)}</div>
      </div>
      <div class="dp-sign">
        <b>Directeur adjoint BAC</b><br>${esc(`${dossier.cmd.ag} ${dossier.cmd.an}`)}
        <div class="sig">${initials(dossier.cmd.an)}</div>
      </div>
    </div>`;
}

function coverPage(dossier, t, decision) {
  const label = decisionLabel(decision);
  const examiners = dossier.ex.map(examiner => esc(`${examiner.grade} ${examiner.name}`)).join('<br>');

  return `
  <article class="dossier-page">
    ${pageHead('CONCOURS D’INTÉGRATION — DOSSIER DE RÉSULTATS', dossier.id)}
    ${photo(IMAGES.cover, '73mm', '#06152222,#06152266')}
    <div class="dp-kicker">Protéger • Intervenir • Prévenir • France Roleplay</div>
    <h1 class="dp-title">Concours d’intégration<br>Brigade Anti-Criminalité</h1>
    <div class="dp-band">Informations candidat</div>
    <table class="dp-table">
      <tr><th>Nom</th><td>${esc(dossier.c.last.toUpperCase())}</td><th>Prénom</th><td>${esc(dossier.c.first)}</td></tr>
      <tr><th>Grade</th><td>${esc(dossier.c.grade)}</td><th>Matricule</th><td>${esc(dossier.c.mat || '—')}</td></tr>
      <tr><th>Date</th><td>${esc(dossier.c.date)}</td><th>Examinateur(s)</th><td>${examiners}</td></tr>
    </table>
    <div class="dp-grid" style="margin-top:9px">
      <div>
        <div class="dp-band">Résultat final</div>
        <div class="dp-score ${scoreBg(t.total, decision)}">${t.total} / 1000<br><span style="font-size:22px">${label}</span></div>
      </div>
      <div>
        <div class="dp-band">Décision du jury</div>
        <div class="dp-box">
          ☑ ${label}<br><br>
          <b>Directeur BAC :</b> ${esc(`${dossier.cmd.dg} ${dossier.cmd.dn}`)}<br>
          <b>Directeur adjoint :</b> ${esc(`${dossier.cmd.ag} ${dossier.cmd.an}`)}
        </div>
      </div>
    </div>
    ${pageFoot(1)}
  </article>`;
}

function summaryPage(dossier, t) {
  const pct = (value, max) => Math.round((value / max) * 100);
  const row = (label, value, max) =>
    `<tr><td>${label}</td><td class="${gradeClass(value, max)}">${value}/${max}</td><td>${max}</td><td>${pct(value, max)}%</td></tr>`;

  return `
  <article class="dossier-page">
    ${pageHead('RÉCAPITULATIF GÉNÉRAL', dossier.id)}
    <div class="dp-band">1. Récapitulatif des notes</div>
    <table class="dp-table">
      <tr><th>Épreuve</th><th>Note</th><th>Maximum</th><th>%</th></tr>
      ${row('Questionnaire théorique', t.th, 100)}
      ${row('Radio &amp; coordination', t.ra, 100)}
      ${row('Mises en situation', t.sc, 300)}
      ${row('Épreuve physique', t.ph, 200)}
      ${row('Épreuve de tir', t.sh, 300)}
      <tr>
        <th>TOTAL GÉNÉRAL</th>
        <th class="${gradeClass(t.total, 1000)}">${t.total}/1000</th>
        <th>1000</th>
        <th>${pct(t.total, 1000)}%</th>
      </tr>
    </table>
    <div class="dp-band">2. Appréciation générale</div>
    <div class="dp-box">${esc(dossier.reason || dossier.general || 'Aucune appréciation générale renseignée.')}</div>
    <div class="dp-band">3. Synthèse</div>
    <div class="dp-grid">
      <div class="dp-box"><b>Points forts</b><br>${esc(dossier.strength || '—')}</div>
      <div class="dp-box"><b>Axes d’amélioration</b><br>${esc(dossier.improve || '—')}</div>
    </div>
    ${photo(IMAGES.recap, '78mm')}
    ${pageFoot(2)}
  </article>`;
}

function theoryPage(dossier, t) {
  const theoryRows = dossier.qs.map((question, index) => {
    const mark = theoryMark(dossier, question);
    return `<tr><td>${index + 1}</td><td>${esc(question.q)}</td><td>${esc(dossier.ans[question.id] || '—')}</td><td class="${gradeClass(mark, 10)}">${mark}/10</td></tr>`;
  }).join('');

  const radio = radioOf(dossier);
  const radioRows = radio.questions.map((question, index) => {
    const mark = radioMark(dossier, index);
    return `<tr><td>${index + 1}</td><td>${esc(question)}</td><td>${esc(dossier.radioAns[index] || '—')}</td><td class="${gradeClass(mark, 25)}">${mark}/25</td></tr>`;
  }).join('');

  return `
  <article class="dossier-page">
    ${pageHead('QUESTIONNAIRE THÉORIQUE &amp; RADIO', dossier.id)}
    <div class="dp-band">1. Questionnaire théorique — ${t.th}/100</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse du candidat</th><th>Note</th></tr>
      ${theoryRows}
    </table>
    <div class="dp-band">2. Radio &amp; coordination — ${t.ra}/100</div>
    <div class="dp-box dp-muted">${esc(radio.statement)}</div>
    <table class="dp-table">
      <tr><th>N°</th><th>Question</th><th>Réponse</th><th>Note</th></tr>
      ${radioRows}
    </table>
    ${pageFoot(3)}
  </article>`;
}

function scenarioPages(dossier) {
  return `
  <article class="dossier-page">
    ${pageHead('MISES EN SITUATION — COMMANDEMENT BAC', dossier.id)}
    <div class="dp-band">Mises en situation — Partie 1</div>
    ${scenarioBlock(dossier, 0)}
    ${scenarioBlock(dossier, 1)}
    ${photo(IMAGES.scenarios, '48mm')}
    ${pageFoot(4)}
  </article>
  <article class="dossier-page">
    ${pageHead('MISES EN SITUATION — COMMANDEMENT BAC', dossier.id)}
    <div class="dp-band">Mises en situation — Partie 2</div>
    ${scenarioBlock(dossier, 2)}
    ${scenarioBlock(dossier, 3)}
    ${pageFoot(5)}
  </article>`;
}

function physicalPage(dossier, t) {
  return `
  <article class="dossier-page">
    ${pageHead('MISE EN SITUATION FINALE &amp; ÉPREUVE PHYSIQUE', dossier.id)}
    <div class="dp-band">Situation finale de commandement</div>
    ${scenarioBlock(dossier, 4)}
    <div class="dp-band">Épreuve physique &amp; cognitive — ${t.ph}/200</div>
    <table class="dp-table">
      <tr><th>Épreuve</th><th>Résultat</th></tr>
      <tr><td>1 200 m chronométrés</td><td>${esc(dossier.phys.run || '—')} secondes</td></tr>
      <tr><td>Pompes</td><td>${esc(dossier.phys.push || '—')}</td></tr>
      <tr><td>Abdominaux</td><td>${esc(dossier.phys.abs || '—')}</td></tr>
      ${usesPlank(dossier.phys)
        ? `<tr><td>Gainage</td><td>${esc(dossier.phys.plank)} secondes</td></tr>`
        : `<tr><td>Jumping jacks (objectif : 20)</td><td>${esc(dossier.phys.jumping || '—')} répétitions</td></tr>`}
      <tr><td>Course-poursuite fictive</td><td>${esc(dossier.phys.pursuit || '—')}</td></tr>
      <tr><td>Cognitif sous fatigue</td><td>${esc(dossier.phys.cog || '—')}</td></tr>
    </table>
    ${pageFoot(6)}
  </article>`;
}

function shootingPage(dossier, t) {
  return `
  <article class="dossier-page">
    ${pageHead('ÉPREUVE DE TIR &amp; APPRÉCIATION', dossier.id)}
    <div class="dp-band">Épreuve de tir RP — ${t.sh}/300</div>
    <table class="dp-table">
      <tr><th>Élément relevé</th><th>Résultat / observation</th></tr>
      <tr><td>Cibles / numéros demandés</td><td>${esc(dossier.shoot.memoryAsked || '—')}</td></tr>
      <tr><td>Réponses correctes</td><td>${esc(dossier.shoot.memoryGood || '—')}</td></tr>
      <tr><td>Erreurs mémoire</td><td>${esc(dossier.shoot.memoryErrors || '0')}</td></tr>
      <tr><td>Consignes de discernement</td><td>${esc(dossier.shoot.discernAsked || '—')}</td></tr>
      <tr><td>Erreurs de discernement</td><td>${esc(dossier.shoot.discernErrors || '0')}</td></tr>
      <tr><td>Cibles « otage » touchées</td><td><b>${esc(dossier.shoot.hostage)}</b></td></tr>
      <tr><td>Observations examinateur</td><td>${esc(dossier.shoot.obs || '—')}</td></tr>
      <tr><td>Analyse du candidat</td><td>${esc(dossier.shoot.analysis || '—')}</td></tr>
    </table>
    <div class="dp-band">Points forts &amp; axes d’amélioration</div>
    <div class="dp-grid">
      <div class="dp-box"><b class="dp-check">✓ POINTS FORTS</b><br><br>${esc(dossier.strength || '—')}</div>
      <div class="dp-box"><b>⚠ AXES D’AMÉLIORATION</b><br><br>${esc(dossier.improve || '—')}</div>
    </div>
    ${photo(IMAGES.shooting, '57mm')}
    ${pageFoot(7)}
  </article>`;
}

function closingPage(dossier, t, decision) {
  const stamp = dossier.locked
    ? '<div class="dp-stamp">DOSSIER CLÔTURÉ<br><span style="font-size:10px">AUCUNE MODIFICATION POSSIBLE</span></div>'
    : '<div class="dp-box"><b>APERÇU AVANT CLÔTURE</b><br>Le dossier reste modifiable tant que la clôture définitive n’a pas été validée.</div>';

  return `
  <article class="dossier-page">
    ${pageHead('VALIDATION FINALE &amp; CLÔTURE', dossier.id)}
    <div style="text-align:center;margin-top:22mm">
      <div class="dp-kicker">Police Nationale — France Roleplay</div>
      <h1 class="dp-title">Brigade Anti-Criminalité</h1>
      <p>Dossier de concours d’intégration</p>
    </div>
    <div class="dp-band">Décision finale</div>
    <div class="dp-decision ${decisionClass(decision)}">${decisionLabel(decision)}</div>
    <div class="dp-score ${scoreBg(t.total, decision)}">${t.total} / 1000</div>
    <div class="dp-band">Motivation de la décision</div>
    <div class="dp-box">${esc(dossier.reason || '—')}</div>
    <div class="dp-band">Rattrapage / réserve</div>
    <div class="dp-box"><b>Épreuves :</b> ${esc(dossier.retakes.join(', ') || 'Aucune')}<br><b>Date :</b> ${esc(dossier.retakeDate || '—')}</div>
    <div class="dp-band">Signatures &amp; validation</div>
    ${signatures(dossier)}
    <div style="text-align:center;margin-top:20mm">${stamp}</div>
    <p class="dp-muted" style="text-align:center;margin-top:12mm">Document fictif — France Roleplay — sans valeur administrative réelle.</p>
    ${pageFoot(8)}
  </article>`;
}

export function renderDossier() {
  const dossier = state.dossier;
  const t = totals(dossier);
  const decision = dossier.decision || suggestedDecision(dossier);

  setHTML('sheet', [
    coverPage(dossier, t, decision),
    summaryPage(dossier, t),
    theoryPage(dossier, t),
    scenarioPages(dossier),
    physicalPage(dossier, t),
    shootingPage(dossier, t),
    closingPage(dossier, t, decision)
  ].join(''));
}
