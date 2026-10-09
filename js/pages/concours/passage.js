import { STEPS } from '../../data/steps.js';
import { RADIO_EXERCISE } from '../../data/radio.js';
import { SCENARIOS } from '../../data/scenarios.js';
import { esc, setHTML, setText } from '../../core/dom.js';
import { state, isEditable } from '../../core/state.js';
import { stepNav, renderProgress } from './navigation.js';
import { usesPlank } from '../../scoring/auto.js';

function identitySection(dis) {
  const D = state.dossier;
  const examiners = D.ex.map((examiner, index) => `
    <div class="row">
      <div class="c6">
        <label>Grade examinateur ${index + 1}</label>
        <input ${dis} value="${esc(examiner.grade)}" oninput="app.setExaminer(${index},'grade',this.value)">
      </div>
      <div class="c6">
        <label>Nom examinateur ${index + 1}</label>
        <input ${dis} value="${esc(examiner.name)}" oninput="app.setExaminer(${index},'name',this.value)">
      </div>
    </div>`).join('');

  return `
  <section id="s-id" class="section active">
    <div class="card">
      <h2>Identité du candidat</h2>
      <div class="row">
        <div class="c4"><label>Nom</label><input ${dis} value="${esc(D.c.last)}" oninput="app.set('c.last',this.value)"></div>
        <div class="c4"><label>Prénom</label><input ${dis} value="${esc(D.c.first)}" oninput="app.set('c.first',this.value)"></div>
        <div class="c4"><label>Grade</label><input ${dis} value="${esc(D.c.grade)}" oninput="app.set('c.grade',this.value)"></div>
        <div class="c4"><label>Matricule</label><input ${dis} value="${esc(D.c.mat)}" oninput="app.set('c.mat',this.value)"></div>
        <div class="c4"><label>Date</label><input type="date" ${dis} value="${esc(D.c.date)}" oninput="app.set('c.date',this.value)"></div>
        <div class="c4"><label>Heure début</label><input type="time" ${dis} value="${esc(D.c.start)}" oninput="app.set('c.start',this.value)"></div>
      </div>
    </div>
    <div class="card">
      <h3>Examinateur(s)</h3>
      ${examiners}
      <button ${dis} onclick="app.addExaminer()">+ Ajouter un examinateur</button>
    </div>
    ${stepNav(0)}
  </section>`;
}

function theorySection(dis) {
  const D = state.dossier;
  const questions = D.qs.map((question, index) => `
    <div class="q">
      <b>${index + 1}. [${esc(question.theme)}] ${esc(question.q)}</b>
      <label>Réponse du candidat — retranscription examinateur</label>
      <textarea ${dis} oninput="app.setAnswer('${question.id}',this.value)">${esc(D.ans[question.id] || '')}</textarea>
    </div>`).join('');

  return `
  <section id="s-theory" class="section">
    <div class="card">
      <h2>Questionnaire théorique</h2>
      <p class="mut">10 questions tirées aléatoirement. Aucune note n’est affichée pendant le passage.</p>
      ${questions}
    </div>
    ${stepNav(1)}
  </section>`;
}

function radioSection(dis) {
  const D = state.dossier;
  const questions = RADIO_EXERCISE.questions.map((question, index) => `
    <div class="q">
      <b>Question ${index + 1} — ${esc(question)}</b>
      <textarea ${dis} oninput="app.setRadioAnswer(${index},this.value)">${esc(D.radioAns[index])}</textarea>
    </div>`).join('');

  return `
  <section id="s-radio" class="section">
    <div class="card">
      <h2>Radio / coordination</h2>
      <div class="statement"><b>ÉNONCÉ À LIRE AU CANDIDAT</b><br>${esc(RADIO_EXERCISE.statement)}</div>
      ${questions}
    </div>
    ${stepNav(2)}
  </section>`;
}

function scenarioSection(dis) {
  const D = state.dossier;
  const cards = SCENARIOS.map((scenario, scenarioIndex) => {
    const questions = scenario.questions.map((question, questionIndex) => `
      <div class="q">
        <b>Question ${questionIndex + 1} — ${esc(question)}</b>
        <label>Réponse du candidat</label>
        <textarea ${dis} oninput="app.setScenarioAnswer(${scenarioIndex},${questionIndex},this.value)">${esc(D.scAns[scenarioIndex][questionIndex])}</textarea>
      </div>`).join('');

    return `
      <div class="card">
        <h2>${esc(scenario.title)}</h2>
        <div class="statement"><b>ÉNONCÉ À LIRE AU CANDIDAT</b><br>${esc(scenario.statement)}</div>
        ${questions}
      </div>`;
  }).join('');

  return `<section id="s-sc" class="section">${cards}${stepNav(3)}</section>`;
}

function physicalSection(dis) {
  const D = state.dossier;
  return `
  <section id="s-phys" class="section">
    <div class="card">
      <h2>Épreuve physique et cognitive</h2>
      <div class="statement">
        <b>PROTOCOLE RP</b><br>
        400 m d’échauffement non noté, puis 1 200 m chronométrés. Objectifs : 30 pompes, 50 abdos,
        20 jumping jacks. Compléter ensuite la course-poursuite fictive et la restitution cognitive sous fatigue.
      </div>
      <div class="row">
        <div class="c3"><label>1 200 m — secondes</label><input type="number" ${dis} value="${esc(D.phys.run)}" oninput="app.set('phys.run',this.value)"></div>
        <div class="c3"><label>Pompes</label><input type="number" ${dis} value="${esc(D.phys.push)}" oninput="app.set('phys.push',this.value)"></div>
        <div class="c3"><label>Abdos</label><input type="number" ${dis} value="${esc(D.phys.abs)}" oninput="app.set('phys.abs',this.value)"></div>
        ${usesPlank(D.phys)
          ? `<div class="c3"><label>Gainage — secondes (saisie d’avant la V4)</label><input type="number" ${dis} value="${esc(D.phys.plank)}" oninput="app.set('phys.plank',this.value)"></div>`
          : `<div class="c3"><label>Jumping jacks — répétitions</label><input type="number" ${dis} value="${esc(D.phys.jumping)}" oninput="app.set('phys.jumping',this.value)"></div>`}
      </div>
      <label>Course-poursuite fictive — constat examinateur</label>
      <textarea ${dis} oninput="app.set('phys.pursuit',this.value)">${esc(D.phys.pursuit)}</textarea>
      <label>Cognitif sous fatigue — informations données / restitution</label>
      <textarea ${dis} oninput="app.set('phys.cog',this.value)">${esc(D.phys.cog)}</textarea>
      <label>Observations</label>
      <textarea ${dis} oninput="app.set('phys.obs',this.value)">${esc(D.phys.obs)}</textarea>
    </div>
    ${stepNav(4)}
  </section>`;
}

function shootingSection(dis) {
  const D = state.dossier;
  return `
  <section id="s-shoot" class="section">
    <div class="card">
      <h2>Épreuve de tir — déroulement examinateur</h2>
      <div class="statement">
        <b>CONSIGNE EXAMINATEUR — RP</b><br>
        Cette page sert à guider le passage dans le jeu. Aucune note n’est attribuée ici.
        <br><br><b>1 — Passage général :</b> réaliser le passage prévu au stand RP et relever le respect des consignes,
        la maîtrise générale, la précision et la réactivité observées.
        <br><br><b>2 — Mémoire :</b> attribuer des numéros aux cibles dans le jeu, laisser le candidat les mémoriser
        puis annoncer des numéros dans un ordre différent. Relever réussites et erreurs.
        <br><br><b>3 — Discernement :</b> certaines cibles numérotées sont déclarées « otage / ne pas engager ».
        Relever les erreurs et le nombre de cibles otage touchées.
        <br><br><b>4 — Analyse :</b> demander au candidat d’expliquer son passage, les informations retenues
        et les erreurs qu’il identifie.
      </div>
      <div class="row">
        <div class="c4"><label>Cibles / numéros demandés</label><input ${dis} value="${esc(D.shoot.memoryAsked)}" oninput="app.set('shoot.memoryAsked',this.value)"></div>
        <div class="c4"><label>Réponses correctes</label><input type="number" min="0" ${dis} value="${esc(D.shoot.memoryGood)}" oninput="app.set('shoot.memoryGood',this.value)"></div>
        <div class="c4"><label>Erreurs mémoire</label><input type="number" min="0" ${dis} value="${esc(D.shoot.memoryErrors)}" oninput="app.set('shoot.memoryErrors',this.value)"></div>
        <div class="c4"><label>Consignes de discernement données</label><input ${dis} value="${esc(D.shoot.discernAsked)}" oninput="app.set('shoot.discernAsked',this.value)"></div>
        <div class="c4"><label>Erreurs de discernement</label><input type="number" min="0" ${dis} value="${esc(D.shoot.discernErrors)}" oninput="app.set('shoot.discernErrors',this.value)"></div>
        <div class="c4"><label>Cibles « otage » touchées</label><input type="number" min="0" ${dis} value="${esc(D.shoot.hostage)}" oninput="app.set('shoot.hostage',this.value)"></div>
      </div>
      <label>Observations générales de l’examinateur</label>
      <textarea ${dis} oninput="app.set('shoot.obs',this.value)" placeholder="Sécurité, manipulation, précision, réactivité, mémorisation, discernement, comportement général...">${esc(D.shoot.obs)}</textarea>
      <label>Analyse du candidat après son passage</label>
      <textarea ${dis} oninput="app.set('shoot.analysis',this.value)">${esc(D.shoot.analysis)}</textarea>
    </div>
    ${stepNav(5)}
  </section>`;
}

function reviewSections(dis) {
  const D = state.dossier;
  const lockedNotice = D.locked ? '<p class="locked">DOSSIER CLÔTURÉ — lecture seule.</p>' : '';
  return `
  <section id="s-correct" class="section"><div id="correction"></div>${stepNav(6)}</section>
  <section id="s-results" class="section"><div id="resultBox"></div>${stepNav(7)}</section>
  <section id="s-final" class="section printme">
    <div id="sheet"></div>
    <div class="card no-print">
      <button class="green" onclick="app.downloadPdf()">Télécharger en PDF</button>
      <button class="danger" ${dis} onclick="app.closeDossier()">CLÔTURER DÉFINITIVEMENT LE DOSSIER</button>
      <p class="mut">
        Dans la fenêtre qui s’ouvre, choisis <b>Enregistrer au format PDF</b> comme destination.
        Les 8 pages, les photos et les fonds sont inclus.
      </p>
      ${lockedNotice}
    </div>
  </section>`;
}

export function renderPassage() {
  const D = state.dossier;
  const dis = isEditable() ? '' : 'disabled';

  setText('hero', D.c.last || D.c.first
    ? `${D.c.last.toUpperCase()} ${D.c.first} — ${D.id}`
    : `Nouveau concours — ${D.id}`);

  setHTML('tabs', STEPS.map((step, index) =>
    `<button class="tab ${index ? '' : 'active'}" data-t="${step[0]}" onclick="app.openStep('${step[0]}')">${step[1]}</button>`
  ).join(''));

  setHTML('sections', [
    identitySection(dis),
    theorySection(dis),
    radioSection(dis),
    scenarioSection(dis),
    physicalSection(dis),
    shootingSection(dis),
    reviewSections(dis)
  ].join(''));

  renderProgress();
}
