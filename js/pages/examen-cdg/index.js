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
import { totals, recommendation } from '../../scoring/cdg.js';
import { decisionText } from '../../ui/chips.js';
import { createStepper } from '../../ui/stepper.js';
import { createAutosave } from '../../ui/autosave.js';
import {
  renderConnaissances,
  renderCommandement,
  renderSituation,
  renderCorrection,
  renderResult,
  renderTimer
} from './epreuves.js';
import { renderCdgFiche } from './fiche.js';
import { identitySection, section, finalSection } from './sections.js';

const MODULE = 'cdg';

const state = { record: null, readOnly: false, settings: { ...CONFIG.defaultCommand } };
let params = new URLSearchParams();

// Le brouillon part au dépôt après chaque pause de saisie.
const autosave = createAutosave({
  module: MODULE,
  current: () => (state.readOnly ? null : state.record)
});

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

function renderAll() {
  const R = state.record;
  const name = `${String(R.c.last).toUpperCase()} ${R.c.first}`.trim();
  setText('hero', name ? `${name} — ${R.id}` : `Nouvel examen — ${R.id}`);
  setText('heroSub', 'Connaissances → Commandement → Situation 1 → Situation 2 → Correction → Résultat → Fiche • /1000');

  moduleBar();
  stepper.renderTabs();

  const nav = stepper.stepNav;
  setHTML('sections', [
    identitySection(R, dis(), nav),
    `<section id="s-co" class="section"><div id="timerBox" class="no-print"></div><div id="connaissancesBox"></div>${nav(1)}</section>`,
    section('cm', 'commandementBox', 2, nav),
    section('sit1', 'sit1Box', 3, nav),
    section('sit2', 'sit2Box', 4, nav),
    section('correct', 'correctBox', 5, nav),
    section('result', 'resultBox', 6, nav),
    finalSection(R, dis())
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
  autosave.reset(true);
  renderAll();
  stepper.openStep('id');
  await autosave.flush();
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
    autosave.reset();
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
    autosave.mark();
    if (path.startsWith('c.start') || path.startsWith('c.end') || path === 'c.date') {
      renderTimer(state.record);
    }
  },

  setExaminer(index, field, value) {
    if (!editable()) return;
    state.record.ex[index][field] = value;
    autosave.mark();
  },

  addExaminer() {
    if (!editable() || state.record.ex.length >= 3) return;
    state.record.ex.push({ grade: '', name: '' });
    autosave.mark();
    renderAll();
    stepper.openStep('id');
  },

  setAnswer(questionId, value) {
    if (!editable()) return;
    state.record.ans[questionId] = value;
    autosave.mark();
  },

  setMark(questionId, value) {
    if (!editable()) return;
    state.record.marks[questionId] = value;
    autosave.mark();
    renderCorrection(state.record, dis());
  },

  setDecision(value) {
    if (!setPath('decision', value)) return;
    autosave.mark();
    renderResult(state.record, dis());
  },

  openStep(id) {
    stepper.openStep(id);
  },

  step(delta) {
    autosave.flush();
    stepper.move(delta);
  },

  async saveNow() {
    await autosave.now();
  },

  async newRecord() {
    if (autosave.dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouvel examen ?')) return;
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
    autosave.reset(true);
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
      autosave.reset();
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
    autosave.reset();
    await loadInitial();
  },

  canLeave() {
    return !autosave.dirty;
  },

  onHide() {
    autosave.flush();
  },

  async unmount() {
    autosave.cancel();
    await autosave.flush();
  }
};
