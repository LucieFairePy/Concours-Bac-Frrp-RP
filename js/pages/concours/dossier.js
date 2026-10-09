import { RADIO_EXERCISE } from '../../data/radio.js';
import { SCENARIOS } from '../../data/scenarios.js';
import { esc, initials, setHTML } from '../../core/dom.js';
import { state } from '../../core/state.js';
import { usesPlank } from '../../scoring/auto.js';
import {
  totals,
  suggestedDecision,
  suggestionSnapshot,
  theoryMark,
  radioMark,
  scenarioMark,
  markClass,
  decisionClass,
  DECISION_LABEL
} from '../../scoring/totals.js';

const PAGES = 8;

/**
 * §13 et §16 — la fiche montre la note suggérée à côté de la note
 * retenue. Sur un dossier clôturé, elle lit l'instantané archivé au
 * moment de la clôture : jamais une suggestion recalculée par un
 * algorithme qui aurait changé depuis.
 */
function suggestions(dossier) {
  if (dossier.systemSuggestions) return dossier.systemSuggestions;
  return suggestionSnapshot(dossier);
}

/** Cellule « suggéré → retenu », lisible même quand les deux coïncident. */
function markCell(mark, suggested, max) {
  const same = Math.round(mark) === Math.round(suggested);
  return `<td class="${markClass(mark, max)}">${mark}/${max}`
    + (same ? '' : `<br><span class="dp-muted">suggéré ${suggested}</span>`)
    + '</td>';
}

const IMAGES = {
  cover: 'assets/img/cover-hero.jpg',
  recap: 'assets/img/recap-general.jpg',
  scenarios: 'assets/img/mises-en-situation.jpg',
  shooting: 'assets/img/epreuve-tir.jpg'
};

export const DOSSIER_IMAGES = Object.values(IMAGES);

function photo(image, height) {
  return `<div class="dp-photo" style="height:${height};background-image:linear-gradient(#06152211,#06152255),url('${image}')"></div>`;
}

function pageHead(title, id) {
  return `
    <div class="dp-head">
      <div class="dp-flag"></div>
      <div>
        <div class="dp-brand">POLICE NATIONALE — BRIGADE ANTI-CRIMINALITÉ</div>
        <div class="dp-sub">${title}</div>
      </div>
      <div class="dp-id">${esc(id)}</div>
    </div>`;
}

function pageFoot(number) {
  return `<div class="dp-foot">BRIGADE ANTI-CRIMINALITÉ — FRANCE ROLEPLAY <span class="dp-page">${number}/${PAGES}</span></div>`;
}

function scenarioBlock(dossier, index) {
  const scenario = SCENARIOS[index];
  const sugg = suggestions(dossier);

  const questions = scenario.questions.map((question, questionIndex) => {
    const mark = scenarioMark(dossier, index, questionIndex);
    const suggested = sugg.sc[`${index}_${questionIndex}`] ?? mark;
    return `
      <div class="dp-q">
        <b>${questionIndex + 1}. ${esc(question)}</b>
        <div class="ans">${esc(dossier.scAns[index][questionIndex] || '—')}</div>
        <span class="${markClass(mark, 15)}">Note retenue : ${mark}/15</span>
        ${Math.round(mark) === Math.round(suggested)
          ? ''
          : `<span class="dp-muted"> — suggérée : ${suggested}/15</span>`}
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
        <b>Examinateur principal</b><br>${esc(`${first.grade} ${first.name}`)}
        <div class="sig">${initials(first.name)}</div>
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
  const label = DECISION_LABEL[decision] || decision;
  const examiners = dossier.ex.map(examiner => esc(`${examiner.grade} ${examiner.name}`)).join('<br>');
  const first = dossier.ex[0] || { name: '' };
  const juryRow = (value, text) => `
    <div>
      <span class="box ${decision === value ? 'chosen' : ''}">${decision === value ? '✓' : ''}</span>${text}
    </div>`;

  return `
  <article class="dossier-page cover-v2">
    ${pageHead('CONCOURS D’INTÉGRATION — DOSSIER DE RÉSULTATS', dossier.id)}
    <div class="coverHero" style="background-image:url('${IMAGES.cover}')">
      <div class="coverTitle">
        <div class="big">BRIGADE ANTI-CRIMINALITÉ</div>
        <div class="small">CONCOURS D’INTÉGRATION</div>
        <div class="coverMotto">PROTÉGER &nbsp; | &nbsp; INTERVENIR &nbsp; | &nbsp; PRÉVENIR &nbsp; | &nbsp; NE JAMAIS RENONCER</div>
      </div>
    </div>
    <div class="coverStrip">DOSSIER DE RÉSULTATS</div>
    <div class="candidateWrap">
      <div>
        <div class="dp-band" style="margin-top:0">Informations candidat</div>
        <table class="dp-table">
          <tr><th>Nom</th><td>${esc(dossier.c.last.toUpperCase())}</td><th>Prénom</th><td>${esc(dossier.c.first)}</td></tr>
          <tr><th>Grade actuel</th><td>${esc(dossier.c.grade)}</td><th>Matricule</th><td>${esc(dossier.c.mat || '—')}</td></tr>
          <tr><th>Date du concours</th><td>${esc(dossier.c.date)}</td><th>Dossier</th><td>${esc(dossier.id)}</td></tr>
        </table>
      </div>
      <div class="candidatePhoto"><span>CANDIDAT</span></div>
    </div>
    <div class="coverResults">
      <div class="coverScore">
        <div class="label">RÉSULTAT FINAL</div>
        <div class="number ${markClass(t.total, 1000)}">${t.total} / 1000</div>
        <div class="verdict ${decisionClass(decision)}">${label}</div>
      </div>
      <div class="juryBox">
        <div class="juryTitle">DÉCISION DU JURY</div>
        <div class="juryRows">
          ${juryRow('RETENU', 'Retenu')}
          ${juryRow('RESERVE', 'Retenu sous réserve')}
          ${juryRow('AJOURNE', 'Ajourné')}
          ${juryRow('RECALE', 'Non retenu')}
        </div>
      </div>
    </div>
    <div class="coverSigns">
      <div class="coverSign">
        <b>Directeur BAC</b><br>${esc(`${dossier.cmd.dg} ${dossier.cmd.dn}`)}
        <div class="sig">${initials(dossier.cmd.dn)}</div>
      </div>
      <div class="coverSign">
        <b>Directeur adjoint BAC</b><br>${esc(`${dossier.cmd.ag} ${dossier.cmd.an}`)}
        <div class="sig">${initials(dossier.cmd.an)}</div>
      </div>
      <div class="coverSign">
        <b>Examinateur(s)</b><br>${examiners}
        <div class="sig">${initials(first.name)}</div>
      </div>
    </div>
    ${pageFoot(1)}
  </article>`;
}

function summaryPage(dossier, t) {
  const sugg = suggestions(dossier);
  const pct = (value, max) => Math.round((value / max) * 100);
  const row = (label, value, max, suggested) =>
    `<tr><td>${label}</td>`
    + `<td class="dp-muted">${suggested}/${max}</td>`
    + `<td class="${markClass(value, max)}">${value}/${max}</td>`
    + `<td>${pct(value, max)}%</td></tr>`;

  return `
  <article class="dossier-page">
    ${pageHead('RÉCAPITULATIF GÉNÉRAL', dossier.id)}
    <div class="dp-band">1. Récapitulatif des notes</div>
    <table class="dp-table">
      <tr><th>Épreuve</th><th>Suggérée</th><th>Note retenue</th><th>%</th></tr>
      ${row('Questionnaire théorique', t.th, 100, sugg.sections.th)}
      ${row('Radio &amp; coordination', t.ra, 100, sugg.sections.ra)}
      ${row('Mises en situation', t.sc, 300, sugg.sections.sc)}
      ${row('Épreuve physique', t.ph, 200, sugg.sections.ph)}
      ${row('Épreuve de tir', t.sh, 300, sugg.sections.sh)}
      <tr>
        <th>TOTAL GÉNÉRAL</th>
        <th class="dp-muted">${sugg.total}/1000</th>
        <th class="${markClass(t.total, 1000)}">${t.total}/1000</th>
        <th>${pct(t.total, 1000)}%</th>
      </tr>
    </table>
    <p class="dp-muted">
      Suggestion du système : ${esc(DECISION_LABEL[sugg.decision] || sugg.decision)}
      — ${esc(sugg.reason)}. La note retenue et la décision finale sont celles
      de l’examinateur.
    </p>
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
  const sugg = suggestions(dossier);

  const theoryRows = dossier.qs.map((question, index) => {
    const mark = theoryMark(dossier, question);
    return `<tr>
      <td>${index + 1}</td>
      <td>${esc(question.q)}</td>
      <td>${esc(dossier.ans[question.id] || '—')}</td>
      ${markCell(mark, sugg.theory[question.id] ?? mark, 10)}
    </tr>`;
  }).join('');

  const radioRows = RADIO_EXERCISE.questions.map((question, index) => {
    const mark = radioMark(dossier, index);
    return `<tr>
      <td>${index + 1}</td>
      <td>${esc(question)}</td>
      <td>${esc(dossier.radioAns[index] || '—')}</td>
      ${markCell(mark, sugg.radio[index] ?? mark, 25)}
    </tr>`;
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
    <div class="dp-box dp-muted">${esc(RADIO_EXERCISE.statement)}</div>
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
  const label = DECISION_LABEL[decision] || decision;
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
    <div class="dp-decision"><span class="${decisionClass(decision)}">${label}</span></div>
    <div class="dp-score"><span class="${markClass(t.total, 1000)}">${t.total} / 1000</span></div>
    <div class="dp-band">Motivation de la décision</div>
    <div class="dp-box">${esc(dossier.reason || '—')}</div>
    <div class="dp-band">Rattrapage / réserve</div>
    <div class="dp-box">
      <b>Épreuves :</b> ${esc(dossier.retakes.join(', ') || 'Aucune')}<br>
      <b>Date :</b> ${esc(dossier.retakeDate || '—')}
    </div>
    <div class="dp-band">Signatures &amp; validation</div>
    ${signatures(dossier)}
    <div style="text-align:center;margin-top:20mm">${stamp}</div>
    <p class="dp-muted" style="text-align:center;margin-top:12mm">
      Document fictif — France Roleplay — sans valeur administrative réelle.
    </p>
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
