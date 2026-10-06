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

import { CONFIG } from './config.js';
import { byId, esc, setHTML, setText } from './core/dom.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import * as portal from './core/portal.js';
import * as records from './core/records.js';
import * as journal from './core/journal.js';
import {
  blankFormation,
  migrateFormation,
  readCount,
  readRatio,
  questionSuggestion,
  questionMark,
  formationTotals,
  suggestedDecision,
  decisionReason,
  isEditableFormation,
  DECISIONS
} from './core/formation.js';
import { isOverridden } from './scoring/assist.js';
import { decisionText, decisionChip } from './views/chips.js';
import { createStepper } from './views/stepper.js';
import { sidebar, chapterPanel } from './views/cours.js';
import { reflexeCard } from './views/reflexe.js';
import { renderFormationFiche } from './views/formation-fiche.js';

export function startFormation(course) {
  const MODULE = course.module;
  const mod = records.MODULES[MODULE];

  const state = { record: null, readOnly: false, chapter: course.chapters[0].id, settings: { ...CONFIG.defaultCommand } };

  let dirty = false;
  let saving = false;
  let autosaveTimer = null;

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

  function identitySection() {
    const R = state.record;
    const examiners = R.ex.map((person, index) => `
      <div class="row">
        <div class="c6">
          <label>Grade formateur ${index + 1}</label>
          <input ${dis()} value="${esc(person.grade)}" oninput="app.setExaminer(${index},'grade',this.value)">
        </div>
        <div class="c6">
          <label>Nom formateur ${index + 1}</label>
          <input ${dis()} value="${esc(person.name)}" oninput="app.setExaminer(${index},'name',this.value)">
        </div>
      </div>`).join('');

    return `
      <section id="s-id" class="section active">
        <div class="card">
          <h2>Agent en formation</h2>
          <div class="row">
            <div class="c4"><label>Nom</label><input ${dis()} value="${esc(R.c.last)}" oninput="app.set('c.last',this.value)"></div>
            <div class="c4"><label>Prénom</label><input ${dis()} value="${esc(R.c.first)}" oninput="app.set('c.first',this.value)"></div>
            <div class="c4"><label>Grade</label><input ${dis()} value="${esc(R.c.grade)}" oninput="app.set('c.grade',this.value)"></div>
            <div class="c4"><label>Matricule</label><input ${dis()} value="${esc(R.c.mat)}" oninput="app.set('c.mat',this.value)"></div>
            <div class="c4"><label>Date</label><input type="date" ${dis()} value="${esc(R.c.date)}" oninput="app.set('c.date',this.value)"></div>
            <div class="c4"><label>Heure de début</label><input type="time" ${dis()} value="${esc(R.c.start)}" oninput="app.set('c.start',this.value)"></div>
          </div>
        </div>
        <div class="card">
          <h3>Formateur(s)</h3>
          ${examiners}
          <button ${dis()} onclick="app.addExaminer()">+ Ajouter un formateur</button>
        </div>
        <div class="card">
          <h3>Ce que couvre cette formation</h3>
          <p>${esc(course.intro)}</p>
          ${reflexeCard(course)}
        </div>
        ${stepper.stepNav(0)}
      </section>`;
  }

  function coursSection() {
    return `
      <section id="s-cours" class="section">
        <div class="co-progress no-print">
          <div class="progress"><span id="coursProg"></span></div>
          <b id="coursCount"></b>
        </div>
        <div class="co-wrap" id="coursWrap"></div>
        ${stepper.stepNav(1)}
      </section>`;
  }

  function evalSection() {
    return `
      <section id="s-eval" class="section">
        <div id="evalBox"></div>
        ${stepper.stepNav(2)}
      </section>`;
  }

  function correctSection() {
    return `
      <section id="s-correct" class="section">
        <div id="correctBox"></div>
        ${stepper.stepNav(3)}
      </section>`;
  }

  function finalSection() {
    const locked = state.record.locked
      ? '<p class="locked">DOSSIER CLÔTURÉ — lecture seule.</p>'
      : '';

    return `
      <section id="s-final" class="section printme">
        <div id="sheet"></div>
        <div class="card no-print">
          <button class="green" onclick="app.downloadPdf()">Télécharger en PDF</button>
          ${auth.can('close')
            ? `<button class="danger" ${dis()} onclick="app.close()">CLÔTURER DÉFINITIVEMENT LE DOSSIER</button>`
            : '<span class="mut">Ton rôle ne permet pas de clôturer un dossier.</span>'}
          <p class="mut">
            Dans la fenêtre d’impression, choisis <b>Enregistrer au format PDF</b>
            comme destination. Les trois pages A4, les fonds et les photos sont inclus.
          </p>
          ${locked}
        </div>
      </section>`;
  }

  function renderAll() {
    heroText();
    moduleBar();
    stepper.renderTabs();
    setHTML('sections', [
      identitySection(),
      coursSection(),
      evalSection(),
      correctSection(),
      finalSection()
    ].join(''));
    stepper.renderProgress();
  }

  function renderCours() {
    const index = Math.max(0, course.chapters.findIndex(chapter => chapter.id === state.chapter));
    const chapter = course.chapters[index];

    setHTML('coursWrap', sidebar(course, state.record, chapter.id)
      + chapterPanel(course, state.record, chapter, index, dis()));

    const ratio = readRatio(state.record, course);
    const bar = byId('coursProg');
    if (bar) bar.style.width = `${Math.round(ratio * 100)}%`;
    setText('coursCount', `${readCount(state.record, course)} / ${course.chapters.length} chapitres lus`);
  }

  function renderEval() {
    const R = state.record;
    const questions = course.evaluation.questions.map((question, index) => `
      <div class="q">
        <b>${index + 1}. ${esc(question.q)}</b>
        <span class="mut"> /${question.max}</span>
        <label>Réponse de l’agent</label>
        <textarea ${dis()} oninput="app.setAnswer('${esc(question.id)}',this.value)">${esc(R.ans[question.id] || '')}</textarea>
      </div>`).join('');

    const ratio = readRatio(R, course);
    const warn = ratio < 0.8
      ? `<div class="warn">
           Le cours n’est parcouru qu’à ${Math.round(ratio * 100)} %. L’évaluation reste
           possible, mais la recommandation du système en tiendra compte.
         </div>`
      : '';

    setHTML('evalBox', `
      <div class="card">
        <h2>Évaluation — ${course.evaluation.max} points</h2>
        <p class="mut">
          ${esc(course.evaluation.duration)} • aucune note n’est affichée pendant
          la saisie des réponses.
        </p>
        ${warn}
        ${questions}
      </div>`);
  }

  function correctionBlock(question, index) {
    const R = state.record;
    const suggestion = questionSuggestion(R, question);
    const mark = questionMark(R, question);
    const overridden = isOverridden(R.marks[question.id]);

    const expected = (question.attendu || []).map(item => {
      const found = suggestion.found.includes(item);
      return `<li class="${found ? 'ca-found' : 'ca-missing'}">${found ? '✓' : '○'} ${esc(item)}</li>`;
    }).join('');

    return `
      <div class="correction">
        <div class="corrhead">${index + 1}. ${esc(question.q)}</div>
        <div class="answer"><b>Réponse :</b> ${esc(R.ans[question.id] || '—')}</div>

        <div class="ca-grid">
          <div class="ca-expected">
            <div class="ca-label">Éléments attendus</div>
            <ul>${expected || '<li class="mut">aucun élément déclaré</li>'}</ul>
          </div>
          <div class="ca-notes">
            <p class="auto">Note suggérée : ${suggestion.note}/${question.max}</p>
            <p class="mut">${esc(suggestion.reason)}</p>
            <label>NOTE RETENUE PAR L’EXAMINATEUR /${question.max}</label>
            <input type="number" min="0" max="${question.max}" ${dis()}
                   value="${esc(R.marks[question.id] ?? '')}"
                   placeholder="${suggestion.note}"
                   oninput="app.setMark('${esc(question.id)}',this.value)">
            <p class="mut">
              ${overridden
                ? `Note de l’examinateur retenue : <b>${mark}/${question.max}</b>.`
                : 'Champ vide : la suggestion est utilisée dans le calcul.'}
            </p>
          </div>
        </div>
      </div>`;
  }

  function renderCorrection() {
    const R = state.record;
    const t = formationTotals(R, course);
    const suggestion = suggestedDecision(R, course);

    const blocks = course.evaluation.questions.map(correctionBlock).join('');

    const options = DECISIONS.map(value =>
      `<option value="${value}" ${R.decision === value ? 'selected' : ''}>${esc(decisionText(value))}</option>`
    ).join('');

    const gap = R.decision && R.decision !== suggestion;

    setHTML('correctBox', `
      <div class="card">
        <h2>Correction assistée</h2>
        <div class="warn">
          <b>Le site aide à noter et aide à décider. Il ne remplace jamais
          l’examinateur.</b> La suggestion repose sur les éléments attendus
          retrouvés dans la réponse : elle ne comprend pas le sens d’une phrase.
          La note retenue et la décision finale sont les tiennes.
        </div>
        ${blocks}
      </div>

      <div class="card">
        <h2>Résultat</h2>
        <table>
          <tr><th>Total des suggestions</th><td>${t.suggestedTotal}/${t.max}</td></tr>
          <tr><th>Total retenu par l’examinateur</th><td><b>${t.total}/${t.max}</b></td></tr>
          <tr><th>Chapitres parcourus</th><td>${readCount(R, course)}/${course.chapters.length}</td></tr>
        </table>
        <div class="score">${t.total}/${t.max}</div>
        <p>Recommandation du système : ${decisionChip(suggestion)}</p>
        <p class="mut">${esc(decisionReason(R, course))}</p>
      </div>

      <div class="card">
        <h2>Décision du formateur</h2>
        <label>Décision finale</label>
        <select ${dis()} onchange="app.setDecision(this.value)">
          <option value="">— choisir —</option>
          ${options}
        </select>
        ${gap ? `<div class="warn">
            Ta décision (<b>${esc(decisionText(R.decision))}</b>) s’écarte de la
            recommandation (<b>${esc(decisionText(suggestion))}</b>). Motive-la
            ci-dessous : la motivation est conservée dans la fiche finale.
          </div>` : ''}
        <label>Motivation / observations${gap ? ' (obligatoire ici)' : ''}</label>
        <textarea ${dis()} oninput="app.set('reason',this.value)">${esc(R.reason)}</textarea>
        <label>Points forts</label>
        <textarea ${dis()} oninput="app.set('strength',this.value)">${esc(R.strength)}</textarea>
        <label>Axes d’amélioration</label>
        <textarea ${dis()} oninput="app.set('improve',this.value)">${esc(R.improve)}</textarea>
      </div>`);
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
    dirty = true;
    renderAll();
    stepper.openStep('id');
    await flush();
  }

  async function openFromUrl() {
    const id = new URLSearchParams(window.location.search).get('dossier');
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
          l’<a href="historique.html?categorie=${esc(mod.category)}">historique</a>,
          mais pas en ouvrir une nouvelle.
        </div>`);
      return;
    }

    await startRecord();
  }

  // ───────────────────────────── Handlers ───────────────────────────────

  const app = {
    set(path, value) {
      if (setPath(path, value)) markDirty();
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

    setRead(chapterId, checked) {
      if (!editable()) return;
      if (checked) state.record.read[chapterId] = true;
      else delete state.record.read[chapterId];
      markDirty();
      renderCours();
    },

    setWork(exerciseId, value) {
      if (!editable()) return;
      state.record.work[exerciseId] = value;
      markDirty();
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
      renderCorrection();
    },

    setDecision(value) {
      if (!setPath('decision', value)) return;
      markDirty();
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
      app.openChapter(next.id);
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
      if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Démarrer un nouveau dossier ?')) return;
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
        dirty = false;
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

  window.app = app;

  window.addEventListener('beforeunload', event => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });

  (async function boot() {
    document.title = `${course.title} — Portail BAC 75 N`;

    const { session } = await portal.boot({ active: MODULE });
    if (!session) return;

    setHTML('who', esc(auth.describeOperator()));
    setText('heroSub', `${course.chapters.length} chapitres • évaluation /${course.evaluation.max} • fiche finale imprimable`);

    try {
      const stored = await store.loadSettings();
      if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
    } catch (error) {
      portal.setBanner(portal.errorBanner(`Paramètres illisibles : ${error.message}`));
    }

    try {
      await loadInitial();
    } catch (error) {
      portal.setBanner(portal.errorBanner(`Démarrage impossible : ${error.message}`));
    }
  }());

  return app;
}
