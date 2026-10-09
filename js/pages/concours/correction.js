import { radioOf } from '../../data/radio.js';
import { scenariosOf } from '../../data/scenarios.js';
import { esc, setHTML } from '../../core/dom.js';
import { state, isEditable } from '../../core/state.js';
import { theoryAuto, radioAuto, scenarioAuto, physicalAuto, shootingAuto, usesPlank } from '../../scoring/auto.js';
import {
  scenarioRawTotal,
  scaleScenarios,
  scenarioRawMax,
  SCENARIO_SECTION_MAX
} from '../../scoring/totals.js';

function markInput(path, value, max) {
  const dis = isEditable() ? '' : 'disabled';
  return `<input type="number" min="0" max="${max}" ${dis} value="${esc(value ?? '')}" oninput="app.set('${path}',this.value)">`;
}

function block(title, answer, auto, max, path, value) {
  return `
    <div class="correction">
      <div class="corrhead">${title}</div>
      <div class="answer"><b>Réponse :</b> ${esc(answer || '—')}</div>
      <p class="auto">Suggestion automatique : ${auto}/${max}</p>
      <label>Note de l’examinateur /${max}</label>
      ${markInput(path, value, max)}
    </div>`;
}

function scenarioSummary(D) {
  const raw = scenarioRawTotal(D);
  const max = scenarioRawMax(D);
  return `
    <div class="card">
      <h3>Mises en situation — total de la section</h3>
      <p>
        Somme des notes attribuées : <b>${raw}/${max}</b><br>
        Ramenée au poids de l’épreuve : <b>${scaleScenarios(raw, max)}/${SCENARIO_SECTION_MAX}</b>
      </p>
      <p class="mut">
        Les ${max / 15} questions sont notées sur 15, soit ${max} points.
        La section pesant ${SCENARIO_SECTION_MAX} points au barème, le total est converti
        proportionnellement. Le classement entre candidats est conservé.
      </p>
    </div>`;
}

export function renderCorrection() {
  const D = state.dossier;

  const theory = D.qs.map((question, index) => block(
    `${index + 1}. ${esc(question.q)}`,
    D.ans[question.id],
    theoryAuto(D, question),
    10,
    `marks.theory.${question.id}`,
    D.marks.theory[question.id]
  )).join('');

  const radio = radioOf(D).questions.map((question, index) => block(
    esc(question),
    D.radioAns[index],
    radioAuto(D, index),
    25,
    `marks.radio.${index}`,
    D.marks.radio[index]
  )).join('');

  const scenarios = scenariosOf(D).map((scenario, scenarioIndex) => {
    const questions = scenario.questions.map((question, questionIndex) => {
      const key = `${scenarioIndex}_${questionIndex}`;
      return block(
        esc(question),
        D.scAns[scenarioIndex][questionIndex],
        scenarioAuto(D, scenarioIndex, questionIndex),
        15,
        `marks.sc.${key}`,
        D.marks.sc[key]
      );
    }).join('');
    return `<div class="card"><h3>${esc(scenario.title)}</h3>${questions}</div>`;
  }).join('') + scenarioSummary(D);

  setHTML('correction', `
    <div class="card">
      <h2>Correction complète</h2>
      <div class="warn">
        La note en rouge est une aide automatique fondée sur la complétude de la réponse.
        <b>L’examinateur garde la décision de notation.</b>
        S’il laisse le champ vide, la suggestion est utilisée dans le calcul.
      </div>
      <h3>Questionnaire théorique — /100</h3>
      ${theory}
      <h3>Radio — /100</h3>
      ${radio}
    </div>
    ${scenarios}
    <div class="card">
      <h3>Physique / cognitif — /200</h3>
      <p>
        1 200 m : ${esc(D.phys.run || '—')} s •
        Pompes : ${esc(D.phys.push || '—')} •
        Abdos : ${esc(D.phys.abs || '—')} •
        ${usesPlank(D.phys)
          ? `Gainage : ${esc(D.phys.plank)} s`
          : `Jumping jacks : ${esc(D.phys.jumping || '—')} / 20`}
      </p>
      <p class="auto">Suggestion automatique : ${physicalAuto(D)}/200</p>
      <label>Note examinateur /200</label>
      ${markInput('marks.phys', D.marks.phys, 200)}
    </div>
    <div class="card">
      <h3>Tir — /300</h3>
      <p class="auto">Suggestion automatique : ${shootingAuto(D)}/300</p>
      <p>Cibles otage touchées : <b>${esc(D.shoot.hostage)}</b></p>
      <label>Note examinateur /300</label>
      ${markInput('marks.shoot', D.marks.shoot, 300)}
    </div>`);
}
