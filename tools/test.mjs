// Suite de tests du portail — node tools/test.mjs
//
// Tout tourne en mémoire : aucun réseau, aucun jeton, aucune écriture dans
// le dépôt. Ce qui est vérifié ici, ce sont les règles du cahier des
// charges qui ne doivent pas se perdre au fil des modifications :
//
//   §5  le concours ne régresse pas, et sa fiche fait toujours 8 pages
//   §8  le barème de l'examen Chef de Groupe vaut exactement 1000
//   §9  au moins 20 000 variantes, et dix thèmes différents par tirage
//   §10 la note de l'examinateur prime toujours sur la suggestion
//   §11 la fiche de qualification porte ses quatre signatures
//   §12 chaque ligne d'historique porte les champs exigés
//   §14 chaque rôle a les permissions annoncées
//   §15 une correction après clôture ne réécrit pas le dossier d'origine
//
// Sortie : une ligne par groupe, puis le compte. Code de retour non nul
// au premier échec, pour servir en intégration continue.

import assert from 'node:assert/strict';
import { stdout, exit } from 'node:process';

// ── DOM minimal, pour pouvoir rendre les fiches hors navigateur ─────────
const nodes = new Map();
function domNode(id) {
  if (!nodes.has(id)) {
    nodes.set(id, {
      id,
      innerHTML: '',
      textContent: '',
      style: {},
      classList: { add() {}, remove() {}, contains: () => false }
    });
  }
  return nodes.get(id);
}
globalThis.document = {
  getElementById: domNode,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {}
};
globalThis.window = { scrollTo() {}, addEventListener() {}, location: { search: '' } };

// ── Micro-harnais ───────────────────────────────────────────────────────
let passed = 0;
const failures = [];

async function group(title, body) {
  try {
    await body();
    passed += 1;
    stdout.write(`  ok   ${title}\n`);
  } catch (error) {
    failures.push({ title, error });
    stdout.write(`  ÉCHEC ${title}\n         ${error.message}\n`);
  }
}

// ── Modules testés ──────────────────────────────────────────────────────
import * as store from '../js/core/store.js';
import * as records from '../js/core/records.js';
import * as journal from '../js/core/journal.js';
import * as assist from '../js/scoring/assist.js';
import * as roles from '../js/core/roles.js';
import * as gen from '../js/data/cdg-generator.js';
import * as cdg from '../js/scoring/cdg.js';
import * as cdgState from '../js/core/cdg-state.js';
import { renderCdgFiche } from '../js/pages/examen-cdg/fiche.js';
import * as formation from '../js/core/formation.js';
import { renderFormationFiche } from '../js/pages/formations/fiche.js';
import { NEGOCIATION } from '../js/data/formations/negociation.js';
import { CHEF_DE_GROUPE } from '../js/data/formations/chef-de-groupe.js';
import { state as concoursState, blankDossier } from '../js/core/state.js';
import { totals as concoursTotals } from '../js/scoring/totals.js';
import { renderDossier } from '../js/pages/concours/dossier.js';
import { checkPages } from './check-pages.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as lifecycle from '../js/core/lifecycle.js';
import * as thresholds from '../js/core/thresholds.js';
import * as effectifs from '../js/core/effectifs.js';
import * as newsService from '../js/core/news.js';
import { IMAGE_SLOTS, LOGO, imageStyle } from '../js/data/images.js';
import { suggestedDecision, suggestionSnapshot } from '../js/scoring/totals.js';
import { physicalAuto } from '../js/scoring/auto.js';
import { ROUTES as portalRoutes, LEGACY_PAGES, resolve as resolveRoute, href as routeHref } from '../js/routes.js';
import * as bank from '../js/data/cdg-bank.js';
import * as cdgV4 from '../js/data/cdg-examen.js';
import * as baremeV4 from '../js/pages/examen-cdg/bareme.js';
import { blankDossier as blankCdgV4, isV4 } from '../js/pages/examen-cdg/dossier.js';
import { QUESTION_BANK } from '../js/data/questions.js';
import { RADIO_EXERCISE, RADIO_EXERCISE_LEGACY, radioOf } from '../js/data/radio.js';
import { SCENARIOS, SCENARIOS_LEGACY, scenariosOf } from '../js/data/scenarios.js';
import { migrate as migrateDossier, pickQuestions } from '../js/core/state.js';
import { finalScoreClass } from '../js/scoring/totals.js';
import { EVALUATION_NEGOCIATION_V1 } from '../js/data/formations/negociation.js';
import * as NEGO_COURS from '../js/data/formations/negociation-cours.js';
import { COURSES } from '../js/data/formations/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readRoot = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const walk = dir => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
  .flatMap(entry => (entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]));

const SETTINGS = { dg: 'Lieutenant', dn: 'BOUSSERE Kevin', ag: 'Brigadier', an: 'LAURENT Cyril' };

function sheet() {
  return domNode('sheet').innerHTML;
}

function noHoles(html, label) {
  assert.ok(html.length > 2000, `${label} : rendu trop court (${html.length} caractères)`);
  for (const bad of ['undefined', 'NaN', '[object Object]']) {
    assert.ok(!html.includes(bad), `${label} : le rendu contient « ${bad} »`);
  }
}

stdout.write('\nPortail BAC 75 N — suite de tests\n\n');

await store.detectDriver('memory');
assert.equal(store.driverName(), 'memory', 'la suite doit tourner en mémoire');

// ───────────────────────────── §14 rôles ────────────────────────────────

await group('§14 — rôles et permissions', () => {
  assert.deepEqual(roles.ROLE_ORDER, ['admin', 'directeur', 'adjoint', 'formateur', 'lecture']);

  // les trois rôles de direction du §13 peuvent modifier les paramètres
  for (const role of ['admin', 'directeur', 'adjoint']) {
    assert.ok(roles.roleCan(role, 'settings'), `${role} doit pouvoir modifier les paramètres`);
    assert.ok(roles.roleCan(role, 'journal'), `${role} doit pouvoir lire le journal`);
  }
  // et les autres ne peuvent pas
  for (const role of ['formateur', 'lecture']) {
    assert.ok(!roles.roleCan(role, 'settings'), `${role} ne doit pas modifier les paramètres`);
    assert.ok(!roles.roleCan(role, 'accounts'), `${role} ne doit pas ouvrir l’administration`);
  }

  assert.ok(roles.roleCan('formateur', 'close'), 'un formateur doit pouvoir clôturer');
  assert.ok(!roles.roleCan('lecture', 'write'), 'un compte de consultation n’écrit pas');
  assert.ok(roles.roleCan('lecture', 'read'));

  // compatibilité avec les accès scellés avant l'arrivée des rôles
  assert.equal(roles.normalizeRole('examinateur'), 'formateur');
  assert.equal(roles.roleFromLegacy('examinateur', true), 'adjoint');
  assert.equal(roles.roleFromLegacy('directeur', false), 'directeur');
  assert.equal(roles.normalizeRole('n’importe quoi'), 'formateur');
});

// ───────────────────────── §10 correction assistée ──────────────────────

await group('§10 — la note de l’examinateur prime sur la suggestion', () => {
  assert.equal(assist.retained('', 7, 10), 7, 'champ vide : la suggestion est utilisée');
  assert.equal(assist.retained('3', 7, 10), 3, 'note saisie : c’est elle qui compte');
  assert.equal(assist.retained('0', 9, 10), 0, 'un zéro saisi est un choix');
  assert.equal(assist.retained('99', 7, 10), 10, 'bornée au barème');
  assert.equal(assist.retained('-5', 7, 10), 0, 'bornée à zéro');
  assert.equal(assist.isOverridden(''), false);
  assert.equal(assist.isOverridden('0'), true);

  const vide = assist.suggest('', ['reformuler', 'écouter'], 10);
  assert.equal(vide.note, 0);
  assert.equal(vide.missing.length, 2);

  const bonne = assist.suggest(
    'je reformule avec mes mots et je laisse parler la personne en écoutant',
    ['reformuler avec ses mots', 'écouter'],
    10
  );
  assert.equal(bonne.missing.length, 0);
  assert.ok(bonne.note >= 8, `note ${bonne.note}`);

  // une réponse longue hors sujet ne peut pas dépasser la moitié
  const horsSujet = assist.suggest(
    'je lui ordonne de sortir immédiatement sans quoi nous intervenons sur le champ '.repeat(4),
    ['reformuler avec ses mots', 'écouter', 'nommer l’émotion', 'laisser le silence'],
    10
  );
  assert.ok(horsSujet.note <= 5, `hors sujet : note ${horsSujet.note}`);

  // « reformule » et « reformuler » sont le même mot
  assert.ok(assist.hits('je reformule ses propos', 'reformuler avec ses mots'));
});

// ───────────────────────── §9 générateur ────────────────────────────────

let variants;

await group('§9 — au moins 20 000 variantes, calculées', () => {
  variants = gen.countVariants();
  assert.ok(variants.total >= 20000, `${variants.total} variantes seulement`);
  assert.ok(variants.connaissances > 0 && variants.situation2 > 0);
});

await group('§9 — tirage équilibré et figé (200 graines)', () => {
  for (let i = 0; i < 200; i += 1) {
    const draw = gen.drawExam(`graine-${i}`);
    const themes = new Set(draw.connaissances.map(question => question.theme));
    assert.equal(themes.size, 10, `graine ${i} : ${themes.size} thème(s) au lieu de 10`);
    const bases = draw.connaissances.map(question => question.base);
    assert.equal(new Set(bases).size, 10, `graine ${i} : question répétée`);
  }

  // même graine, même examen ; graine différente, examen différent
  const a = gen.drawExam('MEME-GRAINE');
  const b = gen.drawExam('MEME-GRAINE');
  const c = gen.drawExam('AUTRE-GRAINE');
  assert.deepEqual(a.connaissances.map(q => q.q), b.connaissances.map(q => q.q));
  assert.deepEqual(a.situations[0].statement, b.situations[0].statement);
  assert.notDeepEqual(a.connaissances.map(q => q.q), c.connaissances.map(q => q.q));
});

await group('§9 — aucun énoncé incomplet', () => {
  const draw = gen.drawExam('CONTROLE');
  for (const situation of draw.situations) {
    assert.ok(situation.statement.length > 120, 'énoncé trop court');
    assert.ok(!/undefined|NaN/.test(situation.statement), situation.statement);
  }
  for (const question of cdg.allQuestions(draw)) {
    assert.ok(question.q && question.q.length > 10, `question vide : ${question.id}`);
    assert.ok(Array.isArray(question.attendu) && question.attendu.length,
      `aucun élément attendu : ${question.id}`);
  }
});

// ───────────────────────── §8 barème ────────────────────────────────────

await group('§8 — le barème tombe exactement sur 1000', () => {
  assert.equal(gen.TOTAL_MAX, 1000);

  for (let i = 0; i < 50; i += 1) {
    const draw = gen.drawExam(`bareme-${i}`);
    const t = cdg.totals({ ans: {}, marks: {} }, draw);
    assert.equal(t.max, 1000);
    assert.equal(t.raw, 1000, `graine ${i} : brut ${t.raw}`);
    assert.equal(t.mismatch, false);
    for (const section of t.sections) {
      assert.equal(section.mismatch, false,
        `section ${section.id} : brut ${section.raw} ≠ barème ${section.max}`);
    }
  }

  // l'examinateur peut aller de 0 à 1000
  const draw = gen.drawExam('BORNES');
  const zero = {}; const plein = {};
  for (const question of cdg.allQuestions(draw)) {
    zero[question.id] = '0';
    plein[question.id] = String(question.max);
  }
  assert.equal(cdg.totals({ ans: {}, marks: zero }, draw).total, 0);
  assert.equal(cdg.totals({ ans: {}, marks: plein }, draw).total, 1000);
});

// ───────────────── §8, §10, §11 : examen complet ────────────────────────

let exam;

await group('§8 et §11 — examen Chef de Groupe de bout en bout', async () => {
  const id = await records.nextId('cdg');
  assert.match(id, /^CDG-\d{4}-001$/);

  exam = cdgState.blankExam(id, SETTINGS);
  exam.c = {
    last: 'durand', first: 'Léa', grade: 'Gardien de la paix',
    mat: '75N-1042', date: '2026-10-06', start: '14:00', end: '14:52'
  };
  exam.ex = [{ grade: 'Brigadier', name: 'LAURENT Cyril' }];

  // §8 : format compact, environ 45 min, 1 h au maximum
  assert.equal(cdgState.duration(exam).minutes, 52);
  assert.equal(cdgState.duration(exam).overrun, false);
  assert.equal(cdgState.duration({ ...exam, c: { ...exam.c, end: '15:30' } }).overrun, true);

  for (const question of cdg.allQuestions(exam.draw)) {
    exam.ans[question.id] = question.attendu.join('. ');
  }

  const t = cdg.totals(exam, exam.draw);
  assert.ok(t.total >= 800, `copie reprenant les attendus : ${t.total}/1000`);
  assert.equal(cdg.recommendation(exam, exam.draw).decision, 'QUALIFIE');

  // §10 : l'examinateur s'écarte de la suggestion, et c'est conservé
  exam.decision = 'QUALIFIE_RESERVE';
  exam.reason = 'Commandement solide, radio trop bavarde sous pression.';
  exam.strength = 'Analyse et répartition des effectifs.';
  exam.improve = 'Concision radio.';
  exam.general = 'Peut se voir confier un groupe avec un suivi sur la radio.';
  exam.total = t.total;
  exam.suggestedTotal = t.suggestedTotal;
  exam.suggestedDecision = 'QUALIFIE';
  exam.locked = true;
  exam.closedAt = new Date().toISOString();
  exam.closedBy = 'cyril';

  await records.publish('cdg', exam);
  await journal.record({
    who: 'Brigadier LAURENT Cyril', role: 'adjoint',
    action: 'dossier.cloture', target: exam.id, detail: 'CDG'
  });
});

await group('§11 — la fiche de qualification contient tout ce qui est exigé', () => {
  renderCdgFiche(exam);
  const html = sheet();
  noHoles(html, 'fiche CDG');
  assert.ok(html.includes('5/5'), '5 pages attendues');

  for (const needed of [
    exam.id, 'DURAND', '75N-1042', '14:00', 'Brigadier LAURENT Cyril',
    'Note suggérée', 'Note retenue', 'Suggestion du système', 'Motif',
    'QUALIFIÉ SOUS RÉSERVE', 'Qualification recommandée',
    'Candidat', 'Examinateur', 'Directeur BAC', 'Directeur adjoint BAC'
  ]) {
    assert.ok(html.includes(needed), `« ${needed} » absent de la fiche`);
  }
});

await group('échappement — une saisie HTML ne casse pas le document', () => {
  const piege = cdgState.migrateExam(
    { ...exam, c: { ...exam.c, first: '<script>alert(1)</script>' } },
    SETTINGS
  );
  renderCdgFiche(piege);
  assert.ok(!sheet().includes('<script>alert(1)'), 'le HTML saisi doit être échappé');
});

// ─────────── Examen Chef de Groupe — module de l'archive V4 ──────────────
//
// Les groupes §8/§9/§11 ci-dessus portent sur l'ancien format (tirage
// `draw`), encore lu pour afficher les dossiers clôturés avant la V4.

await group('V4 — examen Chef de Groupe : contenu et barème de l’archive', () => {
  assert.deepEqual(cdgV4.STEPS.map(([, text]) => text),
    ['Identité', '10 questions', 'Commandement', 'Situation 1', 'Situation 2', 'Correction', 'Résultat', 'Fiche finale']);
  assert.equal(cdgV4.THEMES.length, 8);
  assert.equal(cdgV4.LEAD_QUESTIONS.length, 5);
  assert.equal(cdgV4.EVOLUTIONS.length, 5);
  assert.ok(cdgV4.SITUATIONS[0].startsWith('Tu es chef de groupe avec six agents.'));

  const R = blankCdgV4('CDG-2026-950', 'LAURENT Cyril', SETTINGS);
  assert.ok(isV4(R) && !isV4({ draw: {} }), 'ancien format reconnu');
  assert.equal(R.qs.length, 10);
  for (const q of R.qs) {
    assert.match(q.q, /^Contexte : .+\. Tu commandes \d agents\. Sur le thème « .+ », qu’est-ce que tu mets en place et pourquoi \?$/);
  }
  R.s.forEach(s => assert.ok(cdgV4.EVOLUTIONS.includes(s.evol)));

  // Copie vide : 0/1000, REFUSÉ. Notes pleines saisies : 1000/1000.
  assert.equal(baremeV4.totals(R).total, 0);
  assert.equal(baremeV4.suggestion(R), 'REFUSE');
  R.marks = { q: Array(10).fill('20'), lead: Array(5).fill('40'), s1: '250', s2: '250', radio: '100' };
  assert.equal(baremeV4.totals(R).total, 1000);
  assert.equal(baremeV4.suggestion(R), 'QUALIFIE');
  R.marks.s1 = '0'; R.marks.s2 = '0';
  assert.equal(baremeV4.suggestion(R), 'AJOURNE', '500/1000');
  R.marks.q[0] = '99';
  assert.equal(baremeV4.totals(R).q, 200, 'note bornée au barème');

  // Suggestion de l'archive : mots-clés et longueur de la réponse.
  const a = baremeV4.analyze('Je garde mon calme, je prends le temps d’expliquer et d’écouter, et je vais maintenir la consigne.', cdgV4.LEAD_QUESTIONS[0][1], 40);
  assert.equal(a.miss.length, 0);
  assert.ok(a.score >= 26 && a.score <= 40, `${a.score}/40`);

  // Le dossier a la forme attendue par l'historique (records.summarize).
  R.c = { ...R.c, last: 'durand', first: 'Léa', grade: 'GPX', mat: '75N-1' };
  R.decision = 'QUALIFIE_RESERVE';
  const line = records.summarize(R, 'cdg');
  assert.equal(line.examiner, 'LAURENT Cyril');
  assert.equal(line.mat, '75N-1');
  assert.equal(line.max, 1000);

  // Les dossiers passent par records.js, jamais par le localStorage.
  for (const file of ['index.js', 'vues.js', 'dossier.js', 'bareme.js']) {
    assert.ok(!readRoot(`js/pages/examen-cdg/${file}`).includes('localStorage.'), file);
  }
});

// ───────────────────────── §6 et §7 formations ──────────────────────────

for (const course of [NEGOCIATION, CHEF_DE_GROUPE]) {
  await group(`${course.title} — cours, évaluation, fiche`, async () => {
    assert.ok(course.chapters.length >= 16, `${course.chapters.length} chapitres`);
    assert.ok(course.reflexe.steps.length >= 8, 'fiche réflexe incomplète');
    assert.equal(course.evaluation.questions.length, 10);

    const exercises = course.chapters.flatMap(chapter =>
      chapter.blocks.filter(block => block.t === 'exercice'));
    assert.ok(exercises.length >= 5, `${exercises.length} exercices`);

    // chaque chapitre a du contenu, et chaque bloc un type connu — sauf la
    // négociation, dont le cours suit l'archive (negociation-cours.js) : ses
    // anciens chapitres ne gardent que ce que la fiche d'un ancien dossier lit.
    const known = new Set(['p', 'liste', 'rp', 'dialogue', 'retenir', 'erreurs', 'etapes', 'table', 'exercice']);
    for (const chapter of course.chapters) {
      if (course !== NEGOCIATION) assert.ok(chapter.blocks.length >= 2, `chapitre ${chapter.num} trop court`);
      for (const block of chapter.blocks) {
        assert.ok(known.has(block.t), `bloc inconnu « ${block.t} » au chapitre ${chapter.num}`);
      }
    }

    const id = await records.nextId(course.module);
    const record = formation.blankFormation(id, course, SETTINGS);
    record.c = {
      last: 'martin', first: 'Hugo', grade: 'Gardien',
      mat: '75N-2087', date: '2026-10-06', start: '10:00'
    };
    for (const question of course.evaluation.questions) {
      record.ans[question.id] = question.attendu.join('. ');
    }

    // un cours non parcouru ne vaut pas un acquis franc, même sans faute
    assert.equal(formation.suggestedDecision(record, course), 'ACQUIS_RESERVE');
    for (const chapter of course.chapters) record.read[chapter.id] = true;
    assert.equal(formation.suggestedDecision(record, course), 'ACQUIS');

    const t = formation.formationTotals(record, course);
    assert.equal(t.max, course.evaluation.max);
    assert.ok(t.total >= 80, `total ${t.total}/${t.max}`);

    record.work[exercises[0].id] = 'Réponse d’entraînement.';
    record.decision = 'ACQUIS';
    record.reason = 'Formation suivie, évaluation réussie.';
    record.total = t.total;
    record.locked = true;
    record.closedAt = new Date().toISOString();
    record.closedBy = 'cyril';

    await records.publish(course.module, record);
    await journal.record({
      who: 'Brigadier LAURENT Cyril', role: 'adjoint',
      action: 'formation.validee', target: record.id
    });

    renderFormationFiche(course, record);
    const html = sheet();
    noHoles(html, `fiche ${course.module}`);
    assert.ok(html.includes('3/3'), '3 pages attendues');
    assert.ok(html.includes('Directeur adjoint BAC'), 'signatures incomplètes');
    assert.ok(html.includes('Note suggérée'), 'notes suggérées absentes');
  });
}

// ───────────────────────── §5 concours ──────────────────────────────────

await group('§5 — le concours ne régresse pas', async () => {
  const id = await records.nextId('concours');
  assert.match(id, /^BAC-\d{4}-001$/);

  const dossier = blankDossier(id, SETTINGS);
  dossier.c = {
    last: 'sow', first: 'Amadou', grade: 'Gardien',
    mat: '75N-3311', date: '2026-10-06', start: '09:00'
  };
  dossier.ex = [{ grade: 'Brigadier', name: 'LAURENT Cyril' }];
  for (const question of dossier.qs) {
    dossier.ans[question.id] = 'Réponse développée du candidat sur plusieurs points.';
  }
  dossier.decision = 'RETENU';
  dossier.total = concoursTotals(dossier).total;
  dossier.locked = true;
  dossier.closedAt = new Date().toISOString();
  dossier.closedBy = 'cyril';

  // le brouillon suit le code personnel, pas la machine
  await records.saveDraft('concours', 'cyril', dossier);
  assert.equal((await records.loadDraft('concours', 'cyril')).id, id);
  await records.publish('concours', dossier);
  await records.deleteDraft('concours', 'cyril');
  assert.equal(await records.loadDraft('concours', 'cyril'), null);

  concoursState.dossier = dossier;
  renderDossier();
  const html = sheet();
  noHoles(html, 'fiche concours');
  assert.ok(html.includes('8/8'), 'la fiche du concours fait 8 pages');

  // La fiche est celle de l'archive V4 : couverture, récapitulatif des
  // notes retenues, décision du jury — sans colonne « suggérée ».
  for (const needed of [
    'Concours d’intégration<br>Brigade Anti-Criminalité', 'Décision du jury',
    '1. Récapitulatif des notes', 'TOTAL GÉNÉRAL', 'Signatures &amp; validation'
  ]) {
    assert.ok(html.includes(needed), `fiche concours : « ${needed} » manquant`);
  }
  assert.ok(!html.includes('Suggérée'), 'la fiche de l’archive n’a pas de colonne suggérée');
  assert.ok(html.includes('concours-couverture.jpg'), 'photo de couverture de l’archive');

  const archive = await records.get('concours', id);
  assert.equal(archive.version, lifecycle.RECORD_VERSION, 'version du modèle (§14)');
  assert.ok(archive.auditTrail.some(line => line.action === 'dossier.cloture'),
    'la clôture entre dans la piste d’audit du dossier (§14)');
  assert.ok(html.includes('75N-3311'));

  assert.match(await records.nextId('concours'), /-002$/);
});

// ───────────────────────── §12 historique central ───────────────────────

await group('§12 — un seul historique, et chaque ligne est complète', async () => {
  const all = await records.listAll();
  assert.equal(all.errors.length, 0, JSON.stringify(all.errors));
  assert.equal(all.entries.length, 4, `${all.entries.length} dossiers`);

  assert.deepEqual(
    [...new Set(all.entries.map(entry => entry.category))].sort(),
    ['concours', 'examens', 'formations']
  );

  for (const entry of all.entries) {
    assert.ok(entry.id, 'numéro de dossier');
    assert.ok(records.fullName(entry), `${entry.id} : nom`);
    assert.ok(entry.mat, `${entry.id} : matricule`);
    assert.ok(entry.date, `${entry.id} : date`);
    assert.ok(entry.typeLabel, `${entry.id} : type`);
    assert.ok(entry.total !== null, `${entry.id} : note`);
    assert.ok(entry.max > 0, `${entry.id} : barème`);
    assert.ok(entry.decision, `${entry.id} : résultat`);
    assert.ok(entry.examiner, `${entry.id} : examinateur`);
    assert.ok(entry.closedAt, `${entry.id} : date de clôture`);
  }

  // un module illisible ne fait pas tomber les autres
  const partial = await records.listAll(['cdg', 'module-qui-n-existe-pas']);
  assert.equal(partial.errors.length, 1);
  assert.ok(partial.entries.length >= 1, 'les autres catégories restent lisibles');
});

// ───────────────────────── §15 rectification ────────────────────────────

await group('§15 — aucune modification silencieuse après clôture', async () => {
  const fixed = { ...exam, decision: 'QUALIFIE', reason: 'Après réécoute, la radio était conforme.' };
  const rect = await records.publishRectified('cdg', exam, fixed);

  assert.equal(rect.id, `${exam.id}-R01`, 'numérotation du rectificatif — §4.2');
  assert.equal(rect.rectifies, exam.id);
  assert.equal(rect.locked, true);

  const original = await records.get('cdg', exam.id);
  assert.equal(original.decision, 'QUALIFIE_RESERVE', 'le dossier d’origine a été réécrit');

  const index = await store.readData('cdg/index.json');
  assert.equal(index.find(line => line.id === exam.id).rectifiedBy, rect.id);

  // une deuxième rectification s'empile sans écraser la première
  const again = await records.publishRectified('cdg', exam, fixed);
  assert.equal(again.id, `${exam.id}-R02`);

  // et la numérotation ignore les suffixes
  assert.match(await records.nextId('cdg'), /-002$/);
});

// ───────────────────────── §14 journal ──────────────────────────────────

await group('§14 — journal des actions sensibles', async () => {
  const months = await journal.months();
  assert.equal(months.length, 1);

  const lines = await journal.read(months[0]);
  assert.equal(lines.length, 3, `${lines.length} lignes`);
  for (const line of lines) {
    assert.ok(line.at && line.who && line.action, 'ligne de journal incomplète');
  }
  assert.equal(journal.actionLabel('dossier.cloture'), 'Clôture de dossier');
  assert.equal(journal.actionLabel('inconnu'), 'inconnu', 'une action inconnue reste lisible');
});

// ───────────────── Câblage des pages (contrôle statique) ────────────────

await group('câblage — handlers, points de montage, liens et styles', () => {
  const { problems, pages } = checkPages();
  const detail = problems.map(problem => `\n         ${problem}`).join('');
  assert.equal(problems.length, 0, `${pages} pages contrôlées :${detail}`);
});

// ───────────── Recette V4 — documentation technique §21 ─────────────────

await group('HOME — accueil V4 : quatre cartes, quatre panneaux, proportions', () => {
  const home = readRoot('js/pages/accueil/index.js');
  const html = readRoot('index.html');
  const css = readRoot('css/pages/accueil.css');
  const base = readRoot('css/tokens.css');

  // HOME-001 : les quatre cartes, dans l'ordre du §6.4, vers les bons modules.
  for (const route of [
    'concours', 'formation-negociation', 'formation-chef-groupe', 'examen-chef-groupe'
  ]) {
    assert.ok(home.includes(`href: href('${route}')`), `carte manquante vers ${route}`);
  }
  assert.ok(/accent: 'red'/.test(home), 'le concours doit garder son accent rouge (§6.4)');

  // HOME-002 : les quatre panneaux du bas, que le §1 interdit de supprimer.
  for (const tile of ['tileNews', 'tileCases', 'tileQuick', 'tileStaff']) {
    assert.ok(home.includes(tile), `panneau ${tile} absent de l’accueil`);
  }
  assert.ok(home.includes('id="dash"'), 'le tableau de bord bas n’a plus de point de montage');
  assert.ok(html.includes('id="portalSidebar"'), 'la barre latérale n’a plus de point de montage');

  // HOME-003 : les mesures et les jetons de l'annexe C.
  for (const token of ['#0b9ff5', '#ee1834', '#06121d', '#081723', '#18354a', '#8197a8']) {
    assert.ok(base.includes(token), `jeton V4 ${token} absent de tokens.css`);
  }
  assert.ok(base.includes('--sidebar: 236px'), 'barre latérale : 236 px (§6)');
  assert.ok(base.includes('--header: 68px'), 'en-tête : 68 px (§6)');
  assert.ok(base.includes('--hero: 335px'), 'héros : 335 px (§6)');
  assert.ok(base.includes('--card: 176px'), 'cartes modules : 176 px (§6)');
  assert.ok(base.includes('Barlow Condensed') && base.includes('Inter'), 'polices V4');
  assert.ok(css.includes('grid-template-columns: 1.25fr 1.15fr .85fr 1fr'),
    'le tableau de bord garde ses quatre colonnes 1.25 / 1.15 / .85 / 1 (§6)');
  assert.ok(css.includes('background-size: cover'), 'les images du portail restent en cover (§21.1)');
});

await group('§8.5 — règles bloquantes du tir RP', () => {
  const dossier = blankDossier('BAC-2026-900', SETTINGS);
  dossier.marks.phys = 200;
  dossier.marks.shoot = 300;
  for (const question of dossier.qs) dossier.marks.theory[question.id] = 10;

  // BAC-004 : une cible otage interdit le RETENU simple, même avec un bon total.
  dossier.shoot.hostage = 1;
  assert.equal(suggestedDecision(dossier), 'RESERVE');

  // BAC-005 : deux cibles otage, c'est RECALÉ, quel que soit le total.
  dossier.shoot.hostage = 2;
  assert.equal(suggestedDecision(dossier), 'RECALE');

  // et la triche, le refus ou l'abandon injustifiés aussi.
  dossier.shoot.hostage = 0;
  for (const faute of ['cheat', 'refusal', 'abandon']) {
    const copie = { ...dossier, el: { ...dossier.el, [faute]: true } };
    assert.equal(suggestedDecision(copie), 'RECALE', `${faute} doit recaler`);
  }
});

await group('§8.6 et §11.3 — les seuils vivent dans la configuration', () => {
  const base = thresholds.defaults();
  assert.deepEqual(base.bac, { retenu: 800, reserve: 650 });
  assert.deepEqual(base.cdg, { qualifie: 800, reserve: 650, ajourne: 500 });

  const dossier = blankDossier('BAC-2026-901', SETTINGS);
  dossier.marks.phys = 140;
  dossier.marks.shoot = 210;
  for (const question of dossier.qs) dossier.marks.theory[question.id] = 7;
  const atteint = concoursTotals(dossier).total;

  // Un seuil abaissé change la suggestion sans qu'aucun module soit retouché.
  thresholds.apply({ bacRetenu: atteint, bacReserve: atteint - 100 });
  assert.equal(suggestedDecision(dossier), 'RETENU');

  thresholds.apply({ bacRetenu: 1000, bacReserve: 999 });
  assert.equal(suggestedDecision(dossier), 'RECALE');

  // Une réserve plus haute que la réussite est remise dans l'ordre.
  const remis = thresholds.apply({ bacRetenu: 700, bacReserve: 900 });
  assert.ok(remis.bac.reserve <= remis.bac.retenu, 'réserve au-dessus de la réussite');

  // Une valeur illisible retombe sur celle du kit.
  const repli = thresholds.apply({ cdgQualifie: 'huit cents' });
  assert.equal(repli.cdg.qualifie, 800);

  thresholds.apply(thresholds.toSettings(thresholds.defaults()));
});

await group('annexe B — cycle de vie et avancement d’un dossier', () => {
  const dossier = blankDossier('BAC-2026-902', SETTINGS);
  assert.equal(lifecycle.status('concours', dossier), 'draft');

  const avance = lifecycle.progress('concours', dossier);
  assert.equal(avance.count, 9, 'le concours compte neuf étapes (§18.2)');
  assert.equal(avance.done, 0);

  dossier.c.last = 'MARTIN';
  dossier.c.first = 'Léa';
  assert.equal(lifecycle.status('concours', dossier), 'in_progress');

  dossier.marks.phys = 150;
  assert.equal(lifecycle.status('concours', dossier), 'correction');

  dossier.decision = 'RETENU';
  assert.equal(lifecycle.status('concours', dossier), 'decision');

  dossier.locked = true;
  assert.equal(lifecycle.status('concours', dossier), 'closed');
  assert.equal(lifecycle.progress('concours', dossier).ratio, 1);

  assert.equal(lifecycle.status('concours', { ...dossier, rectifies: 'BAC-2026-902' }), 'rectified');

  // L'examen Chef de Groupe compte huit étapes (§18.2).
  const exam = cdgState.blankExam('CDG-2026-900', SETTINGS);
  assert.equal(lifecycle.progress('cdg', exam).count, 8);

  // Le statut est écrit dans le dossier au moment de l'enregistrer.
  lifecycle.stamp('cdg', exam);
  assert.equal(exam.status, 'draft');
});

await group('§18.1 et §18.4 — actualités et effectifs tiennent sur des données', () => {
  const propre = newsService.normalize({ title: 'Essai', visibility: 'secret' }, 0);
  assert.equal(propre.visibility, 'portail', 'une visibilité inconnue retombe sur le portail');
  assert.ok(propre.id && propre.publishedAt, 'identifiant et date toujours présents');
  assert.ok(propre.imageAsset in IMAGE_SLOTS, 'l’image par défaut doit exister dans la banque');

  assert.equal(effectifs.corpsOf('Lieutenant'), 'officiers');
  assert.equal(effectifs.corpsOf('Brigadier-chef'), 'brigadiers');
  assert.equal(effectifs.corpsOf('Gardien de la paix'), 'gardiens');
  assert.equal(effectifs.corpsOf('Policier adjoint'), 'adjoints');
  assert.equal(effectifs.corpsOf('Stagiaire'), 'autres', 'un grade inconnu reste visible');
});

await group('§5 — la banque d’images suit la nomenclature du kit', () => {
  const noms = Object.values(IMAGE_SLOTS).map(slot => slot.file);
  for (const attendu of [
    '02_HOME_HERO_BAC_CONTROLE_NUIT.jpg',
    '03_HOME_CARD_CONCOURS_INTEGRATION_BAC.jpg',
    '04_HOME_CARD_FORMATION_NEGOCIATION.jpg',
    '05_HOME_CARD_FORMATION_CHEF_GROUPE.jpg',
    '06_HOME_CARD_EXAMEN_CHEF_GROUPE_CASQUE_MICRO.jpg',
    '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg'
  ]) {
    assert.ok(noms.includes(attendu), `place ${attendu} absente de la banque`);
  }

  for (const [id, slot] of Object.entries(IMAGE_SLOTS)) {
    assert.ok(/^\d{2}_[A-Z0-9_]+\.(jpg|png)$/.test(slot.file), `${id} : nom hors nomenclature §4`);
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'img', slot.fallback)),
      `${id} : repli ${slot.fallback} absent du dépôt`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, LOGO.fallback)), 'le repli du logo doit exister');
});

await group('SEC-001 et GHP-001 — aucun secret livré, routes servies sous un sous-chemin', () => {
  const livres = fs.readdirSync(ROOT)
    .filter(name => name.endsWith('.html'))
    .concat(walk('js').filter(name => name.endsWith('.js')));

  for (const file of livres) {
    const source = readRoot(file);
    // §19.1 : aucun jeton GitHub écrit dans ce qui part sur Pages.
    assert.ok(!/gh[pousr]_[A-Za-z0-9]{16,}/.test(source), `${file} : jeton GitHub en clair`);
    assert.ok(!/github_pat_[A-Za-z0-9_]{20,}/.test(source), `${file} : jeton GitHub en clair`);
    // §19.3 : pas de chemin absolu, qui casserait sous /repository/.
    assert.ok(!/(?:href|src)="\/[a-z]/.test(source), `${file} : chemin absolu incompatible avec Pages`);
  }

  assert.ok(fs.existsSync(path.join(ROOT, '404.html')), '404.html attendu pour GitHub Pages (§19.4)');
  assert.ok(fs.existsSync(path.join(ROOT, '.nojekyll')), '.nojekyll attendu (§19.4)');
});

await group('§4.1 — une seule page, une adresse #/… par écran', () => {
  // Chaque route a sa page sur le disque, et son adresse se relit.
  for (const [id, route] of Object.entries(portalRoutes)) {
    const file = route.load.toString().match(/import\('\.\/([^']+)'\)/)[1];
    assert.ok(fs.existsSync(path.join(ROOT, 'js', file)), `${id} : js/${file} absent`);
    assert.equal(resolveRoute(routeHref(id)).id, id, `${id} : adresse illisible`);
  }

  assert.equal(routeHref('utilisateurs'), '#/administration/utilisateurs');
  assert.equal(routeHref('historique', { dossier: 'BAC-2026-001' }), '#/historique?dossier=BAC-2026-001');
  assert.equal(resolveRoute('#/historique?q=DUPONT').params.get('q'), 'DUPONT');

  // Les adresses de la maquette V4 mènent toujours à la bonne page.
  assert.equal(resolveRoute('#/chef-groupe').id, 'formation-chef-groupe');
  assert.equal(resolveRoute('#/examens').id, 'examen-chef-groupe');
  assert.equal(resolveRoute('').id, 'accueil');
  assert.equal(resolveRoute('#/nulle-part').id, null);

  // Les anciennes pages à plat ont chacune leur route, et plus de fichier.
  for (const [page, id] of Object.entries(LEGACY_PAGES)) {
    assert.ok(portalRoutes[id], `${page} → route ${id} inconnue`);
    assert.ok(!fs.existsSync(path.join(ROOT, page)), `${page} devrait avoir disparu`);
  }
  assert.ok(readRoot('404.html').includes('LEGACY_PAGES'), 'le 404 redirige les anciennes adresses');
});

await group('V4 — jumping jacks à la place du gainage, anciens dossiers intacts', () => {
  thresholds.apply(thresholds.toSettings(thresholds.defaults()));
  const only = phys => physicalAuto({ phys: { run: '', push: '', abs: '', pursuit: '', cog: '', ...phys } });

  // Barème de la maquette V4 : jj >= 20 → 30 points, sinon 1,5 par répétition.
  assert.equal(only({ jumping: '20' }), 30);
  assert.equal(only({ jumping: '35' }), 30);
  assert.equal(only({ jumping: '10' }), 15);
  assert.equal(only({ jumping: '1' }), 2);
  assert.equal(only({ jumping: '' }), 0);

  // Un dossier d'avant la V4 garde sa note de gainage, rouvert ou migré.
  assert.equal(only({ plank: '180' }), 30);
  assert.equal(only({ plank: '120' }), 23);
  const ancien = blankDossier('BAC-2026-904', SETTINGS);
  delete ancien.phys.jumping;
  ancien.phys.plank = '150';
  assert.equal(physicalAuto({ phys: { ...blankDossier('X', SETTINGS).phys, ...ancien.phys } }), 27);

  // Le réglage de la direction porte sur les jumping jacks, plus sur le gainage.
  const keys = Object.keys(thresholds.toSettings());
  assert.ok(keys.includes('physJumpingBase') && !keys.includes('physPlankBase'));
  assert.ok(!readRoot('js/pages/concours/passage.js').includes('1 min 50 de gainage'));
});

await group('§8.4 — le barème physique se règle, il n’est plus en dur', () => {
  const dossier = blankDossier('BAC-2026-903', SETTINGS);
  dossier.phys = { run: '320', push: '40', abs: '62', jumping: '18', pursuit: '', cog: '', obs: '' };

  // Avec le barème du kit : 320 s → palier « bon », 40 pompes → « bon »…
  thresholds.apply(thresholds.toSettings(thresholds.defaults()));
  const parDefaut = physicalAuto(dossier);

  // La direction durcit le 1200 m et les pompes : la suggestion baisse,
  // sans qu'une ligne de js/scoring/auto.js ait changé.
  const durci = thresholds.apply({
    ...thresholds.toSettings(),
    physRunFort: 280, physRunBon: 300, physRunBase: 330,
    physPushFort: 60, physPushBon: 50, physPushBase: 45
  });
  assert.ok(physicalAuto(dossier) < parDefaut, 'un barème plus dur doit faire baisser la suggestion');
  assert.equal(durci.physical.run.bon, 300);

  // Les paliers restent ordonnés, même saisis à l'envers : un temps se lit
  // à l'endroit inverse d'un nombre de répétitions.
  const remis = thresholds.apply({
    ...thresholds.toSettings(),
    physRunFort: 400, physRunBon: 310, physRunBase: 290,
    physAbsFort: 10, physAbsBon: 80, physAbsBase: 40
  });
  assert.ok(remis.physical.run.fort <= remis.physical.run.bon);
  assert.ok(remis.physical.run.bon <= remis.physical.run.base);
  assert.ok(remis.physical.abs.fort >= remis.physical.abs.bon);
  assert.ok(remis.physical.abs.bon >= remis.physical.abs.base);

  thresholds.apply(thresholds.toSettings(thresholds.defaults()));
});

await group('§11.2 — suggestion : 35 % complétude + 65 % critères', () => {
  assert.deepEqual(assist.WEIGHTS, { completeness: 0.35, criteria: 0.65 });

  const attendus = ['périmètre tenu', 'compte rendu radio', 'effectifs répartis'];
  const long = 'Je fais tenir le périmètre par deux équipages, je donne un compte rendu '
    + 'radio stabilisé au chef de groupe, puis je répartis les effectifs sur les deux axes.';

  const complet = assist.suggest(long, attendus, 100);
  assert.equal(complet.criteriaRatio, 1);
  assert.ok(complet.completeness >= 0.9, 'réponse développée : complétude pleine');
  assert.ok(complet.note >= 95, `copie complète : ${complet.note}/100`);

  // Hors sujet mais bavard : la part complétude seule, jamais plus de 35 %.
  const horsSujet = assist.suggest(
    'Je pense que la situation est compliquée et qu’il faut vraiment faire très attention '
    + 'à tout ce qui se passe autour de nous pendant toute la durée de l’intervention.',
    attendus,
    100
  );
  assert.equal(horsSujet.criteriaRatio, 0);
  assert.ok(horsSujet.note <= 35, `réponse hors sujet : ${horsSujet.note}/100`);

  // Juste mais télégraphique : les critères portent, la complétude manque.
  const telegraphique = assist.suggest('périmètre, compte rendu, effectifs', attendus, 100);
  assert.ok(telegraphique.note >= 60 && telegraphique.note < 95,
    `réponse juste mais courte : ${telegraphique.note}/100`);
});

await group('§12 et §14 — la suggestion est archivée, le dossier porte son histoire', () => {
  const dossier = blankDossier('BAC-2026-904', SETTINGS);

  // §14 : version du modèle et piste d'audit dès la création.
  assert.equal(dossier.version, lifecycle.RECORD_VERSION);
  assert.ok(Array.isArray(dossier.auditTrail));
  assert.equal(dossier.status, 'draft');

  dossier.c = { ...dossier.c, last: 'noel', first: 'Marc' };
  for (const question of dossier.qs) dossier.ans[question.id] = 'Réponse construite en plusieurs mots.';
  dossier.phys = { run: '305', push: '42', abs: '64', jumping: '22', pursuit: 'oui', cog: 'oui', obs: '' };

  const snapshot = suggestionSnapshot(dossier);
  assert.ok(snapshot.total > 0);
  assert.equal(Object.keys(snapshot.theory).length, dossier.qs.length,
    'chaque question garde sa note suggérée');
  assert.ok(snapshot.reason.includes('/1000'), 'la justification accompagne la suggestion');
  assert.ok(snapshot.decision, 'le résultat suggéré est archivé');
  assert.equal(snapshot.thresholds.retenu, thresholds.bac().retenu);

  // Et les modules écrivent bien cet instantané au moment de clôturer :
  // c'est là que la pièce est scellée.
  assert.ok(readRoot('js/pages/concours/index.js').includes('suggestionSnapshot(D)'),
    'le concours doit archiver sa suggestion à la clôture');
  assert.ok(readRoot('js/pages/examen-cdg/index.js').includes('R.suggestedReason'),
    'l’examen Chef de Groupe doit archiver sa suggestion à la clôture');

  // §16 : une suggestion archivée ne bouge pas quand les seuils changent.
  const gelee = JSON.parse(JSON.stringify(snapshot));
  thresholds.apply({ bacRetenu: 100, bacReserve: 50 });
  assert.deepEqual(JSON.parse(JSON.stringify(gelee)), gelee);
  thresholds.apply(thresholds.toSettings(thresholds.defaults()));

  // §14 : la piste d'audit se remplit à la clôture.
  lifecycle.trace(dossier, 'dossier.cloture', 'Brigadier LAURENT Cyril', 'RETENU');
  assert.equal(dossier.auditTrail.length, 1);
  assert.ok(dossier.auditTrail[0].at && dossier.auditTrail[0].action);
});

await group('§22 — poids des images, dimensions et chargement différé', () => {
  // Les photos du dépôt existent aussi en WebP, sans que les originaux
  // aient disparu.
  for (const slot of Object.values(IMAGE_SLOTS)) {
    const jpeg = path.join(ROOT, 'assets', 'img', slot.fallback);
    const webp = jpeg.replace(/\.jpe?g$/i, '.webp');
    assert.ok(fs.existsSync(jpeg), `original manquant : ${slot.fallback}`);
    assert.ok(fs.existsSync(webp), `WebP manquant : ${slot.fallback}`);
    assert.ok(fs.statSync(webp).size < fs.statSync(jpeg).size,
      `${slot.fallback} : le WebP doit être plus léger`);
  }

  // La déclaration de fond garde une version comprise partout.
  const style = imageStyle('accueil-hero');
  assert.ok(style.includes('image-set('), 'WebP servi via image-set()');
  assert.ok(style.split('background-image:').length === 3,
    'une déclaration de repli précède image-set()');

  // Les images sous la ligne de flottaison sont différées et dimensionnées.
  const home = readRoot('js/pages/accueil/index.js');
  assert.ok(home.includes('loading="lazy"'), 'miniatures d’actualité différées');
  assert.ok(home.includes('width="72" height="46"'), 'miniatures dimensionnées');
  assert.ok(readRoot('js/shell/sidebar.js').includes('width="78" height="78"'),
    'le logo de la barre latérale porte ses dimensions');
});

// ───────────── Contenu repris de la maquette V4 ─────────────────────────

await group('V4 — concours : banque, radio et situations de l’archive', () => {
  // Banque : les 30 questions de l'archive, et elles seules.
  assert.equal(QUESTION_BANK.length, 30);
  assert.equal(new Set(QUESTION_BANK.map(q => String(q.id))).size, QUESTION_BANK.length);
  assert.ok(QUESTION_BANK.every(q => String(q.id).startsWith('v4-')));
  assert.equal(QUESTION_BANK[0].q, 'Quel est le rôle principal de la BAC ?');
  const drawn = pickQuestions();
  assert.equal(drawn.length, 10);
  assert.ok(drawn.every(q => String(q.id).startsWith('v4-')), 'seules les questions de l’archive sont tirées');

  // Un nouveau dossier passe la radio et les situations de la maquette.
  const fresh = blankDossier('BAC-2026-950', SETTINGS);
  assert.equal(fresh.contentSet, 'v4');
  assert.equal(radioOf(fresh), RADIO_EXERCISE);
  assert.equal(radioOf(migrateDossier(JSON.parse(JSON.stringify(fresh)))), RADIO_EXERCISE);
  assert.deepEqual(SCENARIOS.map(s => s.questions.length), [5, 5, 5, 5, 7]);

  // Un dossier d'avant garde ses propres questions : migrate ne le tamponne pas.
  const old = JSON.parse(JSON.stringify(fresh));
  delete old.contentSet;
  old.radioAns = ['a', 'b', 'c', 'd'];
  const migrated = migrateDossier(old);
  assert.equal(migrated.contentSet, undefined);
  assert.equal(radioOf(migrated), RADIO_EXERCISE_LEGACY);
  assert.equal(scenariosOf(migrated), SCENARIOS_LEGACY);
  assert.deepEqual(migrated.radioAns, ['a', 'b', 'c', 'd']);
  assert.ok(Number.isFinite(concoursTotals(migrated).total));
  assert.equal(Object.keys(suggestionSnapshot(migrated).sc).length, 27);

  // Un RECALÉ s'affiche en rouge sur la fiche finale, quel que soit le total.
  assert.equal(finalScoreClass(950, 'RECALE'), 'note-rouge');
  assert.equal(finalScoreClass(950, 'RETENU'), 'note-verte');
});

await group('V4 — examen Chef de Groupe : évolution à injecter, questions de commandement', () => {
  for (let i = 0; i < 200; i += 1) {
    const draw = gen.drawExam(`graine-${i}`);
    const injections = draw.situations.map(situation => situation.injection);
    assert.equal(injections.length, 2);
    injections.forEach(item => assert.ok(bank.SIT_INJECTIONS.includes(item), `graine ${i} : ${item}`));
    assert.notEqual(injections[0], injections[1], `graine ${i} : même évolution deux fois`);
  }
  const a = gen.drawExam('MEME-GRAINE');
  const b = gen.drawExam('MEME-GRAINE');
  assert.deepEqual(a.situations.map(s => s.injection), b.situations.map(s => s.injection));
  assert.equal(gen.countVariants().detail['évolutions à injecter'], bank.SIT_INJECTIONS.length);

  for (const start of ['Deux équipages te parlent en même temps', 'Un agent n’a pas compris sa mission', 'Après l’intervention, que doit contenir ton débriefing']) {
    const item = bank.COMMANDEMENT.find(question => question.q.startsWith(start));
    assert.ok(item && item.attendu.length >= 3, start);
  }
});

await group('V4 — négociation : cours de l’archive, questionnaires des anciens dossiers', () => {
  const evaluation = NEGOCIATION.evaluation;
  assert.equal(evaluation.questions.reduce((sum, q) => sum + q.max, 0), 100);
  for (const axis of evaluation.grid) {
    const points = evaluation.questions.filter(q => q.axe === axis.axe).reduce((sum, q) => sum + q.max, 0);
    assert.equal(points, axis.max, axis.axe);
  }
  for (const id of ['cadre', 'questions', 'confiance', 'compte-rendu', 'motivations', 'otages', 'evaluation']) {
    assert.ok(NEGOCIATION.chapters.some(chapter => chapter.id === id), id);
  }

  const fresh = formation.blankFormation('N-T', NEGOCIATION, SETTINGS);
  assert.equal(fresh.evalVersion, evaluation.version);
  assert.equal(formation.evaluationOf(fresh, NEGOCIATION), evaluation);

  const old = { ...fresh, ans: { 'ev-1': 'faire baisser la tension' } };
  delete old.evalVersion;
  const migrated = formation.migrateFormation(old, NEGOCIATION, SETTINGS);
  assert.ok(!('evalVersion' in migrated));
  assert.equal(formation.evaluationOf(migrated, NEGOCIATION), EVALUATION_NEGOCIATION_V1);
  assert.ok(formation.formationTotals(migrated, NEGOCIATION).total > 0);

  // Le cours à l'écran est celui de l'archive : vingt chapitres, mot pour mot.
  assert.equal(NEGO_COURS.CHAPTERS.length, 20);
  NEGO_COURS.CHAPTERS.forEach((chapter, index) => {
    assert.equal(chapter.n, String(index + 1).padStart(2, '0'));
    for (const key of ['title', 'sub', 'desc', 'remember']) assert.ok(chapter[key], `${chapter.n} ${key}`);
    assert.ok(chapter.points.length >= 5, `${chapter.n} points`);
    assert.ok(IMAGE_SLOTS[chapter.image], `${chapter.n} image ${chapter.image}`);
  });
  assert.equal(NEGO_COURS.CHAPTERS[0].title, 'Rôle et objectifs du négociateur');
  assert.equal(NEGO_COURS.CHAPTERS[19].title, 'Évaluation /100 et fiche réflexe');
  assert.deepEqual(NEGO_COURS.QUICK.map(entry => entry.index), [0, 4, 14, 18]);
  assert.equal(NEGO_COURS.GRID.reduce((sum, field) => sum + field.max, 0), 100);
  assert.deepEqual(Object.keys(NEGO_COURS.EXAMPLES).sort(), ['04', '05', '13', '16', '18']);

  // Pas de parcours à étapes : l'archive n'en a pas. Un ancien dossier
  // (`?dossier=`) s'ouvre sur sa fiche en lecture seule.
  const negoPage = readRoot('js/pages/formations/negociation.js');
  assert.ok(!negoPage.includes('formationPage'), 'la négociation ne passe plus par le moteur commun');
  assert.ok(negoPage.includes('renderFormationFiche') && negoPage.includes('records.get'), 'ancien dossier non relu');

  const cdgRecord = formation.blankFormation('C-T', CHEF_DE_GROUPE, SETTINGS);
  assert.ok(!('evalVersion' in cdgRecord));
  assert.equal(formation.evaluationOf(cdgRecord, CHEF_DE_GROUPE), CHEF_DE_GROUPE.evaluation);
});

await group('V4 — formations Radio et Antiterrorisme : cours complets, évaluation /100', () => {
  for (const { course, route } of COURSES) {
    assert.ok(portalRoutes[route], `${course.id} : route ${route}`);
    assert.ok(records.MODULES[course.module], `${course.id} : module de dossier`);
    assert.ok(IMAGE_SLOTS[course.image], `${course.id} : image ${course.image}`);
    assert.equal(course.evaluation.questions.reduce((sum, q) => sum + q.max, 0), 100, course.id);
    assert.equal(new Set(course.chapters.map(c => c.id)).size, course.chapters.length, `${course.id} : chapitres uniques`);
    for (const question of course.evaluation.questions) {
      assert.ok(question.q && question.attendu && question.attendu.length, `${course.id} ${question.id}`);
    }
  }
  assert.deepEqual(COURSES.map(entry => entry.course.module), ['negociation', 'formation-cdg', 'radio', 'antiterrorisme']);
});

await group('Archive — Formation Chef de Groupe : 16 chapitres, cours seul', async () => {
  const { LECONS, A_RETENIR } = await import('../js/data/formations/chef-de-groupe-lecons.js');
  assert.equal(LECONS.length, 16);
  assert.deepEqual(LECONS.map(l => l.number), LECONS.map((l, i) => String(i + 1).padStart(2, '0')));
  assert.ok(A_RETENIR.startsWith('Le chef donne des priorités claires'));
  for (const l of LECONS) {
    assert.ok(l.title && l.intro && l.example && l.exercise && l.points.length, `chapitre ${l.number}`);
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/bac75n', l.photo)), `photo ${l.photo}`);
  }
  assert.equal(LECONS[0].title, 'Rôle du chef de groupe');
  assert.equal(LECONS[15].title, 'Évaluation finale');

  // L'archive n'enregistre rien : la page ne passe pas par le moteur commun.
  const source = fs.readFileSync(path.join(ROOT, 'js/pages/formations/chef-de-groupe.js'), 'utf8');
  assert.ok(!/from '\.\/engine\.js'/.test(source), 'la page Chef de Groupe ne doit plus monter le parcours commun');
  assert.ok(source.includes("params.get('dossier')"), 'un ancien dossier doit rester lisible');
});

// ───────────────────────── Résultat ─────────────────────────────────────

stdout.write(`\n${passed} groupe(s) réussi(s), ${failures.length} échec(s).\n`);
stdout.write(`Variantes d'examen Chef de Groupe : ${variants.total.toLocaleString('fr-FR')}\n\n`);

exit(failures.length ? 1 : 0);
