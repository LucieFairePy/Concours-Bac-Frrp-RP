// Contrôleur commun aux formations — cahier des charges §6, §7, §10, §16.
//
// Une seule implémentation pour la Formation Négociation et la Formation
// Chef de Groupe : le contenu est une donnée, le parcours est identique.
// Identité → Cours → Évaluation → Correction → Fiche finale.
//
// Points tenus ici :
//   §10 chaque réponse affiche réponse, éléments attendus, éléments
//       retrouvés, éléments manquants et note suggérée ; la note retenue
//       est modifiable et c'est elle qui compte ;
//   §12 le dossier clôturé part dans l'historique central ;
//   §15 pas de modification silencieuse après clôture — une correction
//       ultérieure est une version rectificative.

import { CONFIG } from '../../config.js';
import { byId, esc, setHTML, setText } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import * as portal from '../../shell/index.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import { state as shared } from '../../core/state.js';
import { href } from '../../routes.js';
import { imageStyle } from '../../data/images.js';
import {
  blankFormation,
  migrateFormation,
  readCount,
  readRatio,
  formationTotals,
  suggestedDecision,
  isEditableFormation
} from '../../core/formation.js';
import { decisionText } from '../../ui/chips.js';
import { createStepper } from '../../ui/stepper.js';
import { createAutosave } from '../../ui/autosave.js';
import { sidebar, chapterPanel } from './cours.js';
import { renderFormationFiche } from './fiche.js';
import {
  identitySection,
  coursSection,
  evalSection,
  correctSection,
  finalSection,
  evaluationHtml,
  correctionHtml
} from './sections.js';

/**
 * `layout` donne à un cours la mise en page de son module dans la maquette
 * V4 (js/pages/formations/layouts/) :
 *
 *   page({ course, kicker })      le HTML de l'écran ; il doit contenir
 *                                 #sections, #tabs, #prog, #stepText,
 *                                 #hero, #pageActions et #sync
 *   cours({ course, record, chapter, index, dis })
 *                                 le HTML de #coursWrap : sommaire et
 *                                 chapitre ouvert (facultatif)
 *
 * Sans layout, le cours garde le gabarit commun.
 */
export function formationPage(course, kicker = '', layout = {}) {
  const MODULE = course.module;
  const mod = records.MODULES[MODULE];

  const state = { record: null, readOnly: false, chapter: course.chapters[0].id, settings: { ...CONFIG.defaultCommand } };
  let params = new URLSearchParams();

  // Le brouillon part au dépôt après chaque pause de saisie.
  const autosave = createAutosave({
    module: MODULE,
    current: () => (state.readOnly ? null : state.record)
  });


  const stepper = createStepper({
    steps: [
      { id: 'id', label: 'Identité' },
      { id: 'cours', label: 'Cours' },
      { id: 'eval', label: 'Évaluation' },
      { id: 'correct', label: 'Correction' },
      { id: 'final', label: 'Fiche finale' }
    ],
    nextLabel: {
      1: 'TERMINER LE COURS ET PASSER À L’ÉVALUATION →',
      2: 'VALIDER LES RÉPONSES ET CORRIGER →',
      3: 'VALIDER LES NOTES ET CRÉER LA FICHE →'
    },
    validate(id) {
      if (id !== 'id') return true;
      const { last, first, grade } = state.record.c;
      if (!last.trim() || !first.trim() || !grade.trim()) {
        window.alert('Renseigne le nom, le prénom et le grade de l’agent.');
        return false;
      }
      return true;
    },
    onOpen(id) {
      if (id === 'cours') renderCours();
      if (id === 'eval') renderEval();
      if (id === 'correct') renderCorrection();
      if (id === 'final') renderFormationFiche(course, state.record);
    }
  });

  const editable = () => isEditableFormation(state.record, state.readOnly);
  const dis = () => (editable() ? '' : 'disabled');

  // ───────────────────────────── Enregistrement ─────────────────────────

  // ───────────────────────────── Rendu ─────────────────────────────────

  function moduleBar() {
    const readOnly = !editable();
    const rectify = readOnly && state.record && state.record.locked && auth.can('write')
      ? '<button onclick="app.rectify()">Créer une version rectificative</button>'
      : '';

    portal.setModuleBar(`
      <b>${esc(course.title)}</b>
      <span class="mut">dossier ${esc(state.record ? state.record.id : '—')}</span>
      <span class="spacer"></span>
      ${rectify}
      <button onclick="app.saveNow()">Enregistrer</button>
      ${auth.canWrite() ? '<button class="primary" onclick="app.newRecord()">Nouveau dossier</button>' : ''}`);
  }

  function heroText() {
    const R = state.record;
    const name = `${String(R.c.last).toUpperCase()} ${R.c.first}`.trim();
    setText('hero', name ? `${name} — ${R.id}` : `Nouveau dossier — ${R.id}`);
  }

  function renderAll() {
    heroText();
    moduleBar();
    stepper.renderTabs();
    setHTML('sections', [
      identitySection(course, state.record, dis(), stepper.stepNav),
      coursSection(stepper.stepNav),
      evalSection(stepper.stepNav),
      correctSection(stepper.stepNav),
      finalSection(state.record, dis())
    ].join(''));
    stepper.renderProgress();
  }

  function renderCours() {
    const index = Math.max(0, course.chapters.findIndex(chapter => chapter.id === state.chapter));
    const chapter = course.chapters[index];

    setHTML('coursWrap', layout.cours
      ? layout.cours({ course, record: state.record, chapter, index, dis: dis() })
      : sidebar(course, state.record, chapter.id) + chapterPanel(course, state.record, chapter, index, dis()));

    const ratio = readRatio(state.record, course);
    const bar = byId('coursProg');
    if (bar) bar.style.width = `${Math.round(ratio * 100)}%`;
    setText('coursCount', `${readCount(state.record, course)} / ${course.chapters.length} chapitres lus`);
  }

  function renderEval() {
    setHTML('evalBox', evaluationHtml(course, state.record, dis()));
  }

  function renderCorrection() {
    setHTML('correctBox', correctionHtml(course, state.record, dis()));
  }

  // ───────────────────────────── Cycle de vie ───────────────────────────

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

    state.record = blankFormation(id, course, state.settings);
    state.readOnly = false;
    state.chapter = course.chapters[0].id;
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
        portal.setBanner(portal.errorBanner(`Dossier ${id} introuvable dans cette formation.`));
        return false;
      }
      state.record = migrateFormation(found, course, state.settings);
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
      state.record = migrateFormation(draft, course, state.settings);
      state.readOnly = false;
      renderAll();
      stepper.openStep('id');
      portal.setSync('brouillon repris');
      return;
    }

    if (!auth.canWrite()) {
      portal.setBanner(`
        <div class="banner">
          Ton rôle est en consultation. Tu peux lire les formations clôturées depuis
          l’<a href="${href('historique', { module: mod.id })}">historique</a>,
          mais pas en ouvrir une nouvelle.
        </div>`);
      return;
    }

    await startRecord();
  }

  // ───────────────────────────── Handlers ───────────────────────────────

  const handlers = {
    set(path, value) {
      if (setPath(path, value)) autosave.mark();
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

    setRead(chapterId, checked) {
      if (!editable()) return;
      if (checked) state.record.read[chapterId] = true;
      else delete state.record.read[chapterId];
      autosave.mark();
      renderCours();
    },

    setWork(exerciseId, value) {
      if (!editable()) return;
      state.record.work[exerciseId] = value;
      autosave.mark();
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
      renderCorrection();
    },

    setDecision(value) {
      if (!setPath('decision', value)) return;
      autosave.mark();
      renderCorrection();
    },

    openChapter(id) {
      state.chapter = id;
      renderCours();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    nextChapter() {
      const index = course.chapters.findIndex(chapter => chapter.id === state.chapter);
      const next = course.chapters[Math.min(course.chapters.length - 1, index + 1)];
      handlers.openChapter(next.id);
    },

    openStep(id) {
      stepper.openStep(id);
    },

    step(delta) {
      autosave.flush();
      stepper.move(delta);
    },

    async saveNow() {
      autosave.reset(true);
      await autosave.flush();
    },

    async newRecord() {
      if (autosave.dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouveau dossier ?')) return;
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
        + 'portera un nouveau numéro et citera le dossier corrigé.'
      );
      if (!confirmed) return;

      state.record = migrateFormation(
        { ...R, locked: false, rectifies: R.id, closedAt: null, closedBy: null },
        course,
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

      const suggestion = suggestedDecision(R, course);

      if (!R.decision) {
        window.alert('Choisis d’abord la décision finale sur la page Correction.');
        stepper.openStep('correct');
        return;
      }

      // §10 : une décision qui s'écarte de la recommandation doit être motivée.
      if (R.decision !== suggestion && !String(R.reason || '').trim()) {
        window.alert(
          'Ta décision s’écarte de la recommandation du système.\n\n'
          + 'Renseigne la motivation avant de clôturer : elle est conservée dans la fiche.'
        );
        stepper.openStep('correct');
        return;
      }

      const rectifying = Boolean(R.rectifies);
      const confirmed = window.confirm(
        rectifying
          ? `Publier la version rectificative de ${R.rectifies} ? Elle sera définitive.`
          : `Clôturer définitivement ${R.id} ? Aucune modification directe ne sera ensuite possible.`
      );
      if (!confirmed) return;

      const session = auth.current();
      const t = formationTotals(R, course);

      R.total = t.total;
      R.suggestedTotal = t.suggestedTotal;
      R.suggestedDecision = suggestion;
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
          action: rectifying ? 'dossier.rectificatif' : 'formation.validee',
          target: published.id,
          detail: `${course.title} — ${decisionText(published.decision)} — ${t.total}/${t.max}`
            + (suggestion !== published.decision ? ` (recommandation : ${decisionText(suggestion)})` : '')
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

  return {
    handlers,

    template() {
      if (layout.page) return layout.page({ course, kicker });
      return `
        <section id="home" class="view">
          <div class="hero" style="${imageStyle(course.image)}">
            <div class="flag"></div>
            <small class="hero-kicker no-print">${esc(kicker || course.subtitle)}</small>
            <h1 class="no-print">${esc(course.title)}</h1>
            <h2 id="hero">${esc(course.title)}</h2>
            <div class="mut" id="heroSub">${course.chapters.length} chapitres • évaluation /${course.evaluation.max} • fiche finale imprimable</div>
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
      state.chapter = course.chapters[0].id;
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
}
