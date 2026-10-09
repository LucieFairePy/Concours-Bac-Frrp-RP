import { esc, setHTML, byId } from '../../core/dom.js';
import { state, isEditable } from '../../core/state.js';
import { totals, suggestedDecision, markClass, DECISIONS } from '../../scoring/totals.js';

/**
 * Libellé de décision de l'archive : seul RESERVE est réécrit, les autres
 * codes s'affichent tels quels (RETENU, AJOURNE, RECALE).
 */
export function decisionLabel(decision) {
  return decision === 'RESERVE' ? 'RETENU SOUS RÉSERVE' : decision;
}

const INCIDENTS = [
  ['cheat', 'Triche — éliminatoire'],
  ['refusal', 'Refus injustifié d’une consigne — éliminatoire'],
  ['abandon', 'Abandon injustifié — éliminatoire'],
  ['danger', 'Comportement volontairement dangereux — signalement / pénalité majeure']
];

const RETAKES = ['Tir', 'Physique', 'Radio', 'Mise en situation', 'Connaissances'];

export function renderResults() {
  const D = state.dossier;
  const dis = isEditable() ? '' : 'disabled';
  const t = totals(D);
  const suggestion = suggestedDecision(D);

  const incidents = INCIDENTS.map(([key, label]) => `
    <label>
      <input class="inline-check" type="checkbox" ${D.el[key] ? 'checked' : ''} ${dis}
        onchange="app.setIncident('${key}',this.checked)"> ${label}
    </label>`).join('');

  const decisions = DECISIONS.map(value =>
    `<option value="${value}" ${D.decision === value ? 'selected' : ''}>${decisionLabel(value)}</option>`
  ).join('');

  const retakes = RETAKES.map(label => `
    <label>
      <input class="inline-check" type="checkbox" ${D.retakes.includes(label) ? 'checked' : ''} ${dis}
        onchange="app.setRetake('${label}',this.checked)"> ${label}
    </label>`).join('');

  setHTML('resultBox', `
    <div class="card">
      <h2>Résultats du concours</h2>
      <table>
        <tr><th>Épreuve</th><th>Note</th></tr>
        <tr><td>Connaissances BAC</td><td>${t.th}/100</td></tr>
        <tr><td>Radio / coordination</td><td>${t.ra}/100</td></tr>
        <tr><td>Mises en situation</td><td>${t.sc}/300</td></tr>
        <tr><td>Physique / cognitif</td><td>${t.ph}/200</td></tr>
        <tr><td>Tir</td><td>${t.sh}/300</td></tr>
      </table>
      <div class="score ${markClass(t.total, 1000)}">${t.total}/1000</div>
      <p>Proposition automatique :</p>
      <span class="status ${suggestion}">${decisionLabel(suggestion)}</span>
    </div>
    <div class="card">
      <h3>Incidents / règles</h3>
      ${incidents}
    </div>
    <div class="card">
      <h2>Décision de l’examinateur</h2>
      <label>Décision finale</label>
      <select ${dis} onchange="app.set('decision',this.value)">
        <option value="">— choisir —</option>
        ${decisions}
      </select>
      <label>Motivation / observations</label>
      <textarea ${dis} oninput="app.set('reason',this.value)">${esc(D.reason)}</textarea>
      <label>Points forts</label>
      <textarea ${dis} oninput="app.set('strength',this.value)">${esc(D.strength)}</textarea>
      <label>Points à améliorer</label>
      <textarea ${dis} oninput="app.set('improve',this.value)">${esc(D.improve)}</textarea>
      <h3>Épreuves à repasser</h3>
      ${retakes}
      <label>Date de rattrapage</label>
      <input type="date" ${dis} value="${esc(D.retakeDate)}" oninput="app.set('retakeDate',this.value)">
    </div>`);
}

export function refreshResults() {
  const box = byId('resultBox');
  const section = byId('s-results');
  if (box && section && section.classList.contains('active')) renderResults();
}
