// Examen de qualification Chef de Groupe — module plein écran repris de
// modules/examen-chef-groupe.html (archive V4) : barre du haut, bannière,
// huit onglets (Identité → 10 questions → Commandement → Situation 1 →
// Situation 2 → Correction → Résultat → Fiche finale), mêmes textes.
//
// Ce qui change par rapport à l'archive, et seulement cela : le dossier
// part au dépôt par js/core/records.js (brouillon automatique, clôture,
// version rectificative) au lieu du localStorage, et les permissions du
// rôle décident de qui peut ouvrir, modifier ou clôturer un dossier.

import { CONFIG } from '../../config.js';
import { byId, esc, setHTML } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import * as portal from '../../shell/index.js';
import { state as shared } from '../../core/state.js';
import { href } from '../../routes.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import { migrateExam } from '../../core/cdg-state.js';
import { decisionText } from '../../ui/chips.js';
import { createAutosave } from '../../ui/autosave.js';
import { STEPS } from '../../data/cdg-examen.js';
import { blankDossier, isV4, migrateDossier } from './dossier.js';
import { totals, suggestion } from './bareme.js';
import { stepsBar, stepView } from './vues.js';
import { renderCdgFiche } from './fiche.js';

const MODULE = 'cdg';

// `legacy` : dossier d'avant la V4, montré sur son ancienne fiche finale.
const state = { record: null, readOnly: false, legacy: false, cur: 'id', settings: { ...CONFIG.defaultCommand } };
let params = new URLSearchParams();

// Le brouillon part au dépôt après chaque pause de saisie.
const autosave = createAutosave({
  module: MODULE,
  current: () => (state.readOnly || state.legacy ? null : state.record)
});

const editable = () => Boolean(state.record) && !state.legacy && !state.readOnly && !state.record.locked && auth.canWrite();

const operatorName = () => {
  const session = auth.current();
  return (session && session.name) || auth.describeOperator();
};

// ───────────────────────────── Rendu ────────────────────────────────────

function render() {
  const R = state.record;
  if (!R) return;

  if (state.legacy) {
    renderLegacy();
    return;
  }

  setHTML('steps', stepsBar(state.cur));
  setHTML('mxApp', stepView(state.cur, R, {
    d: editable() ? '' : 'disabled',
    canClose: editable() && auth.can('close'),
    canNew: auth.canWrite(),
    canRectify: Boolean(R.locked) && auth.can('write')
  }));
}

/** Dossier d'avant la V4 : sa fiche finale d'origine, en lecture seule. */
function renderLegacy() {
  setHTML('steps', '');
  setHTML('mxApp', `
    <section id="s-final" class="section active printme">
      <div id="sheet"></div>
      <div class="mx-card no-print">
        <div class="mx-row">
          <button class="mx-btn" onclick="app.print()">Imprimer / PDF</button>
          ${auth.canWrite() ? '<button class="mx-btn" onclick="app.newExam()">Nouvel examen</button>' : ''}
        </div>
      </div>
    </section>`);
  renderCdgFiche(state.record);
}

function show(record, { readOnly = false, cur = 'id' } = {}) {
  state.legacy = !isV4(record);
  state.record = state.legacy ? migrateExam(record, state.settings) : migrateDossier(record, state.settings);
  state.readOnly = readOnly || state.legacy;
  state.cur = cur;
  render();
}

// ───────────────────────────── Cycle de vie ─────────────────────────────

async function startRecord() {
  let id;
  try {
    id = await records.nextId(MODULE);
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Numéro de dossier indisponible : ${error.message}`));
    return;
  }

  state.record = blankDossier(id, operatorName(), state.settings);
  state.readOnly = false;
  state.legacy = false;
  state.cur = 'id';
  autosave.reset(true);
  render();
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
    autosave.reset();
    show(found, { readOnly: true, cur: 'final' });
    portal.setSync(`${id} — lecture seule`);
    return true;
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Lecture impossible : ${error.message}`));
    return false;
  }
}

async function loadInitial() {
  if (await openFromUrl()) return;

  let draft = null;
  try {
    draft = await records.loadDraft(MODULE, auth.current().login);
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Brouillon illisible : ${error.message}`));
    return;
  }

  if (draft) {
    show(draft);
    portal.setSync('brouillon repris');
    if (state.legacy) {
      portal.setBanner(`
        <div class="banner">
          Ce brouillon date d’avant la nouvelle version de l’examen : il reste lisible
          ci-dessous, mais ne peut plus être poursuivi. « Nouvel examen » le remplace.
        </div>`);
    }
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

/** Applique une saisie si le dossier est modifiable, puis l'enregistre. */
function edit(apply) {
  if (!editable()) return;
  apply(state.record);
  autosave.mark();
}

const handlers = {
  openStep(id) {
    if (state.legacy || !STEPS.some(([step]) => step === id)) return;
    state.cur = id;
    autosave.flush();
    render();
  },

  setC(key, value) { edit(R => { R.c[key] = value; }) },
  setExaminer(value) { edit(R => { R.ex = [{ grade: '', name: value }]; }) },
  setAns(i, value) { edit(R => { R.ans[i] = value; }) },
  setLead(i, value) { edit(R => { R.lead[i] = value; }) },
  setSit(i, value) { edit(R => { R.s[i].ans = value; }) },
  setDecision(value) { edit(R => { R.decision = value; }) },
  setReason(value) { edit(R => { R.reason = value; }) },

  /** Note retenue : `kind` q ou lead (avec son rang), ou s1, s2, radio. */
  setMark(kind, i, value) {
    edit(R => {
      if (kind === 'q' || kind === 'lead') R.marks[kind][i] = value;
      else R.marks[kind] = value;
    });
  },

  print() {
    const R = state.record;
    if (!R) return;
    const name = `${String(R.c.last || '').toUpperCase()} ${R.c.first || ''}`.trim();
    const previous = document.title;
    document.title = name ? `${R.id} — ${name}` : R.id;
    window.print();
    document.title = previous;
  },

  async newExam() {
    if (!auth.canWrite()) return;
    if (!window.confirm('Créer un nouvel examen ?')) return;
    await startRecord();
  },

  async rectify() {
    const R = state.record;
    if (!R || state.legacy || !R.locked || !auth.can('write')) return;

    const confirmed = window.confirm(
      `Créer une version rectificative de ${R.id} ?\n\n`
      + 'Le dossier d’origine ne sera pas modifié. La version rectificative '
      + 'portera un nouveau numéro et citera le dossier corrigé.'
    );
    if (!confirmed) return;

    state.record = migrateDossier(
      { ...R, locked: false, rectifies: R.id, closedAt: null, closedBy: null },
      state.settings
    );
    state.readOnly = false;
    state.cur = 'corr';
    autosave.reset(true);
    render();
    portal.setSync(`version rectificative de ${R.id} — à clôturer de nouveau`);
  },

  async close() {
    const R = state.record;
    if (!R || !editable()) return;

    if (!auth.can('close')) {
      window.alert('Ton rôle ne permet pas de clôturer un dossier.');
      return;
    }
    if (!R.decision) {
      window.alert('Choisir d’abord la décision finale.');
      return;
    }
    if (!window.confirm('Clôturer définitivement ce dossier ?')) return;

    const session = auth.current();
    const t = totals(R);
    const suggested = suggestion(R);
    const rectifying = Boolean(R.rectifies);

    // La suggestion est archivée avec le dossier : elle ne bougera plus
    // si les seuils changent dans Paramètres.
    R.total = t.total;
    R.suggestedDecision = suggested;
    R.suggestedReason = `${t.total}/1000 — ${decisionText(suggested)}`;
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
        detail: `Qualification CDG — ${decisionText(published.decision)} — ${t.total}/1000`
          + (suggested !== published.decision ? ` (suggestion : ${decisionText(suggested)})` : '')
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

    state.cur = 'final';
    render();
    window.alert('Dossier clôturé et archivé en lecture seule.');
  }
};

export default {
  handlers,

  template() {
    return `
      <div class="m-examen">
        <div class="mx-top no-print">
          <a class="mx-back" href="${href('accueil')}">← Portail BAC 75 N</a>
          <div class="mx-brand">EXAMEN DE QUALIFICATION CHEF DE GROUPE BAC<small>45 minutes cible · maximum 1 heure</small></div>
          <span id="sync" class="mx-sync"></span>
          <div class="mx-id"><b>${esc(operatorName())}</b><small>Examinateur</small></div>
        </div>
        <div class="mx-hero no-print">
          <div><div class="mx-tri"></div><h1>EXAMEN<br>CHEF DE GROUPE</h1><p>Le système suggère. L’examinateur note et décide.</p></div>
        </div>
        <div class="mx-wrap">
          <div id="mxBanner"></div>
          <div class="mx-steps no-print" id="steps"></div>
          <div id="mxApp"></div>
        </div>
      </div>`;
  },

  async mount(ctx) {
    // Le bandeau du portail (#banner) se range sous la bannière du module.
    const banner = byId('banner');
    const slot = byId('mxBanner');
    if (banner && slot && typeof slot.replaceWith === 'function') slot.replaceWith(banner);

    params = ctx.params;
    state.record = null;
    state.readOnly = false;
    state.legacy = false;
    state.cur = 'id';
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
