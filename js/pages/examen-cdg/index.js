// Examen de qualification Chef de Groupe — cahier des charges §8 à §11.
//
// Parcours du §16 : Créer l'examen → Identité → Questions → Commandement →
// Situation 1 → Situation 2 → Correction → Résultat → Vérification finale →
// Signatures → Clôture → Historique.
//
// La personne qui passe cet examen est déjà un agent BAC expérimenté :
// l'épreuve vérifie si on peut lui confier un groupe, pas si elle sait
// intervenir. D'où un format compact et des questions sans piège.

import { CONFIG } from '../../config.js';
import { esc, setHTML, setText } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import * as portal from '../../shell/index.js';
import { state as shared } from '../../core/state.js';
import { href } from '../../routes.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import { blankExam, migrateExam, isEditableExam } from '../../core/cdg-state.js';
import { countVariants } from '../../data/cdg-generator.js';
import { totals, recommendation } from '../../scoring/cdg.js';
import { decisionText } from '../../ui/chips.js';
import { createStepper } from '../../ui/stepper.js';
import {
  renderConnaissances,
  renderCommandement,
  renderSituation,
  renderCorrection,
  renderResult,
  renderTimer
} from './epreuves.js';
import { renderCdgFiche } from './fiche.js';

const MODULE = 'cdg';

const state = { record: null, readOnly: false, settings: { ...CONFIG.defaultCommand } };
let params = new URLSearchParams();

let dirty = false;
let saving = false;
let autosaveTimer = null;

const stepper = createStepper({
  steps: [
    { id: 'id', label: 'Identité' },
    { id: 'co', label: 'Connaissances' },
    { id: 'cm', label: 'Commandement' },
    { id: 'sit1', label: 'Situation 1' },
    { id: 'sit2', label: 'Situation 2' },
    { id: 'correct', label: 'Correction' },
    { id: 'result', label: 'Résultat' },
    { id: 'final', label: 'Fiche finale' }
  ],
  nextLabel: {
    4: 'TERMINER LE PASSAGE ET PASSER À LA CORRECTION →',
    5: 'VALIDER LES NOTES →',
    6: 'VALIDER LA DÉCISION ET CRÉER LA FICHE →'
  },
  validate(id) {
    if (id !== 'id') return true;
    const { last, first, grade } = state.record.c;
    if (!last.trim() || !first.trim() || !grade.trim()) {
      window.alert('Renseigne le nom, le prénom et le grade du candidat.');
      return false;
    }
    return true;
  },
  onOpen(id) {
    const d = dis();
    if (id === 'co') { renderConnaissances(state.record, d); renderTimer(state.record); }
    if (id === 'cm') renderCommandement(state.record, d);
    if (id === 'sit1') renderSituation(state.record, 0, d, 'sit1Box');
    if (id === 'sit2') renderSituation(state.record, 1, d, 'sit2Box');
    if (id === 'correct') renderCorrection(state.record, d);
    if (id === 'result') renderResult(state.record, d);
    if (id === 'final') renderCdgFiche(state.record);
  }
});

const editable = () => isEditableExam(state.record, state.readOnly);
const dis = () => (editable() ? '' : 'disabled');

// ───────────────────────────── Enregistrement ───────────────────────────

function markDirty() {
  dirty = true;
  portal.setSync('modifications non enregistrées');
  if (autosaveTimer) window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => { flush() }, CONFIG.autosaveDelay);
}

async function flush() {
  if (!dirty || saving || !state.record || state.readOnly) return;
  if (!auth.canWrite()) {
    portal.setSync('lecture seule — rien n’est enregistré', 'error');
    return;
  }

  saving = true;
  portal.setSync('enregistrement…');
  try {
    await records.saveDraft(MODULE, auth.current().login, state.record);
    dirty = false;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    portal.setSync(`enregistré à ${time}`, 'ok');
  } catch (error) {
    portal.setSync(`échec : ${error.message}`, 'error');
  } finally {
    saving = false;
  }
}

// ───────────────────────────── Rendu ────────────────────────────────────

function moduleBar() {
  const rectify = !editable() && state.record && state.record.locked && auth.can('write')
    ? '<button onclick="app.rectify()">Créer une version rectificative</button>'
    : '';

  portal.setModuleBar(`
    <b>Examen de qualification Chef de Groupe</b>
    <span class="mut">dossier ${esc(state.record ? state.record.id : '—')}</span>
    <span class="spacer"></span>
    ${rectify}
    <button onclick="app.saveNow()">Enregistrer</button>
    ${auth.canWrite() ? '<button class="primary" onclick="app.newRecord()">Nouvel examen</button>' : ''}`);
}

function identitySection() {
  const R = state.record;
  const d = dis();

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

      ${stepper.stepNav(0)}
    </section>`;
}

function section(id, hostId, index) {
  return `<section id="s-${id}" class="section"><div id="${hostId}"></div>${stepper.stepNav(index)}</section>`;
}

function finalSection() {
  const locked = state.record.locked ? '<p class="locked">DOSSIER CLÔTURÉ — lecture seule.</p>' : '';

  return `
    <section id="s-final" class="section printme">
      <div id="sheet"></div>
      <div class="card no-print">
        <button class="green" onclick="app.downloadPdf()">Télécharger en PDF</button>
        ${auth.can('close')
          ? `<button class="danger" ${dis()} onclick="app.close()">CLÔTURER DÉFINITIVEMENT LE DOSSIER</button>`
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

function renderAll() {
  const R = state.record;
  const name = `${String(R.c.last).toUpperCase()} ${R.c.first}`.trim();
  setText('hero', name ? `${name} — ${R.id}` : `Nouvel examen — ${R.id}`);
  setText('heroSub', 'Connaissances → Commandement → Situation 1 → Situation 2 → Correction → Résultat → Fiche • /1000');

  moduleBar();
  stepper.renderTabs();

  setHTML('sections', [
    identitySection(),
    `<section id="s-co" class="section"><div id="timerBox" class="no-print"></div><div id="connaissancesBox"></div>${stepper.stepNav(1)}</section>`,
    section('cm', 'commandementBox', 2),
    section('sit1', 'sit1Box', 3),
    section('sit2', 'sit2Box', 4),
    section('correct', 'correctBox', 5),
    section('result', 'resultBox', 6),
    finalSection()
  ].join(''));

  stepper.renderProgress();
}

// ───────────────────────────── Cycle de vie ─────────────────────────────

function setPath(path, value) {
  if (!editable()) return false;
  const keys = path.split('.');
  let node = state.record;
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (node[keys[i]] === undefined || node[keys[i]] === null) node[keys[i]] = {};
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
  return true;
}

async function startRecord() {
  let id;
  try {
    id = await records.nextId(MODULE);
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Numéro de dossier indisponible : ${error.message}`));
    return;
  }

  state.record = blankExam(id, state.settings);
  state.readOnly = false;
  dirty = true;
  renderAll();
  stepper.openStep('id');
  await flush();
}

async function openFromUrl() {
  const id = params.get('dossier');
  if (!id) return false;

  portal.setSync('ouverture…');
  try {
    const found = await records.get(MODULE, id);
    if (!found) {
      portal.setBanner(portal.errorBanner(`Dossier ${id} introuvable dans les examens Chef de Groupe.`));
      return false;
    }
    state.record = migrateExam(found, state.settings);
    state.readOnly = true;
    dirty = false;
    renderAll();
    stepper.openStep('final');
    portal.setSync(`${id} — lecture seule`);
    return true;
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
    return false;
  }
}

async function loadInitial() {
  if (await openFromUrl()) return;

  const session = auth.current();

  let draft = null;
  try {
    draft = await records.loadDraft(MODULE, session.login);
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Brouillon illisible : ${error.message}`));
    return;
  }

  if (draft) {
    state.record = migrateExam(draft, state.settings);
    state.readOnly = false;
    renderAll();
    stepper.openStep('id');
    portal.setSync('brouillon repris');
    return;
  }

  if (!auth.canWrite()) {
    portal.setBanner(`
      <div class="banner">
        Ton rôle est en consultation. Tu peux lire les examens clôturés depuis
        l’<a href="${href('historique', { module: MODULE })}">historique</a>, mais pas en
        ouvrir un nouveau.
      </div>`);
    return;
  }

  await startRecord();
}

// ───────────────────────────── Handlers ─────────────────────────────────

const handlers = {
  set(path, value) {
    if (!setPath(path, value)) return;
    markDirty();
    if (path.startsWith('c.start') || path.startsWith('c.end') || path === 'c.date') {
      renderTimer(state.record);
    }
  },

  setExaminer(index, field, value) {
    if (!editable()) return;
    state.record.ex[index][field] = value;
    markDirty();
  },

  addExaminer() {
    if (!editable() || state.record.ex.length >= 3) return;
    state.record.ex.push({ grade: '', name: '' });
    markDirty();
    renderAll();
    stepper.openStep('id');
  },

  setAnswer(questionId, value) {
    if (!editable()) return;
    state.record.ans[questionId] = value;
    markDirty();
  },

  setMark(questionId, value) {
    if (!editable()) return;
    state.record.marks[questionId] = value;
    markDirty();
    renderCorrection(state.record, dis());
  },

  setDecision(value) {
    if (!setPath('decision', value)) return;
    markDirty();
    renderResult(state.record, dis());
  },

  openStep(id) {
    stepper.openStep(id);
  },

  step(delta) {
    flush();
    stepper.move(delta);
  },

  async saveNow() {
    dirty = true;
    await flush();
  },

  async newRecord() {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouvel examen ?')) return;
    if (!auth.canWrite()) return;
    await startRecord();
  },

  async downloadPdf() {
    if (!state.record) return;
    stepper.openStep('final');

    const R = state.record;
    const name = `${String(R.c.last).toUpperCase()} ${R.c.first}`.trim();
    const previous = document.title;
    document.title = name ? `${R.id} — ${name}` : R.id;
    window.print();
    document.title = previous;
  },

  async rectify() {
    const R = state.record;
    if (!R || !auth.can('write')) return;

    const confirmed = window.confirm(
      `Créer une version rectificative de ${R.id} ?\n\n`
      + 'Le dossier d’origine ne sera pas modifié. La version rectificative '
      + 'portera un nouveau numéro, conservera le même tirage et citera le '
      + 'dossier corrigé.'
    );
    if (!confirmed) return;

    state.record = migrateExam(
      { ...R, locked: false, rectifies: R.id, closedAt: null, closedBy: null },
      state.settings
    );
    state.readOnly = false;
    dirty = true;
    renderAll();
    stepper.openStep('correct');
    portal.setSync(`version rectificative de ${R.id} — à clôturer de nouveau`);
  },

  async close() {
    const R = state.record;
    if (!R || R.locked || state.readOnly) return;

    if (!auth.can('close')) {
      window.alert('Ton rôle ne permet pas de clôturer un dossier.');
      return;
    }

    if (!R.decision) {
      window.alert('Choisis d’abord la décision définitive sur la page Résultat.');
      stepper.openStep('result');
      return;
    }

    const reco = recommendation(R, R.draw);

    // §10 : une décision qui s'écarte de la suggestion se motive.
    if (R.decision !== reco.decision && !String(R.reason || '').trim()) {
      window.alert(
        'Ta décision s’écarte de la suggestion du système.\n\n'
        + 'Renseigne le motif avant de clôturer : il est conservé dans la fiche finale.'
      );
      stepper.openStep('result');
      return;
    }

    // Un refus, une réserve ou un ajournement se motivent toujours (§10).
    const needsReason = ['QUALIFIE_RESERVE', 'AJOURNE', 'REFUSE'].includes(R.decision);
    if (needsReason && !String(R.reason || '').trim()) {
      window.alert(
        `Une décision « ${decisionText(R.decision)} » doit être motivée.\n\n`
        + 'Renseigne le motif sur la page Résultat.'
      );
      stepper.openStep('result');
      return;
    }

    const rectifying = Boolean(R.rectifies);
    const confirmed = window.confirm(
      rectifying
        ? `Publier la version rectificative de ${R.rectifies} ? Elle sera définitive.`
        : `Clôturer définitivement ${R.id} ? Après validation, aucune modification directe ne sera possible.`
    );
    if (!confirmed) return;

    const session = auth.current();
    const t = totals(R, R.draw);

    R.total = t.total;
    R.suggestedTotal = t.suggestedTotal;
    R.suggestedDecision = reco.decision;
    R.suggestedReason = reco.reason;
    R.locked = true;
    R.closedAt = new Date().toISOString();
    R.closedBy = session.login;

    portal.setSync(rectifying ? 'publication de la rectification…' : 'clôture en cours…');
    try {
      const published = rectifying
        ? await records.publishRectified(MODULE, { id: R.rectifies }, R)
        : await records.publish(MODULE, R);

      state.record = published;
      state.readOnly = true;
      await records.deleteDraft(MODULE, session.login);
      dirty = false;
      portal.setSync(`dossier ${published.id} clôturé`, 'ok');

      const logged = await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: rectifying ? 'dossier.rectificatif' : 'dossier.cloture',
        target: published.id,
        detail: `Qualification CDG — ${decisionText(published.decision)} — ${t.total}/${t.max}`
          + (reco.decision !== published.decision ? ` (suggestion : ${decisionText(reco.decision)})` : '')
      });
      if (!logged) portal.setSync(`dossier ${published.id} clôturé — journal non écrit`, 'error');
    } catch (error) {
      R.locked = false;
      R.closedAt = null;
      R.closedBy = null;
      portal.setSync(`clôture impossible : ${error.message}`, 'error');
      window.alert(`Clôture impossible : ${error.message}`);
      return;
    }

    renderAll();
    stepper.openStep('final');
  }
};

export default {
  handlers,

  template() {
    return `
      <section id="home" class="view">
        <div class="hero" data-img="examen">
          <div class="flag"></div>
          <small class="hero-kicker no-print">Qualification BAC 75 N</small>
          <h1 class="no-print">Examen Chef de Groupe</h1>
          <h2 id="hero">Examen de qualification Chef de Groupe</h2>
          <div class="mut" id="heroSub"></div>
        </div>
        <div id="tabs" class="tabs no-print"></div>
        <div class="no-print">
          <div class="progress"><span id="prog"></span></div>
          <div id="stepText" class="steptext"></div>
        </div>
        <div id="sections"></div>
      </section>`;
  },

  async mount(ctx) {
    params = ctx.params;
    state.record = null;
    state.readOnly = false;
    state.settings = { ...CONFIG.defaultCommand, ...shared.settings };
    dirty = false;
    await loadInitial();
  },

  canLeave() {
    return !dirty;
  },

  onHide() {
    flush();
  },

  async unmount() {
    if (autosaveTimer) window.clearTimeout(autosaveTimer);
    autosaveTimer = null;
    await flush();
  }
};
