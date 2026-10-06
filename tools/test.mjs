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
import { renderCdgFiche } from '../js/views/cdg-fiche.js';
import * as formation from '../js/core/formation.js';
import { renderFormationFiche } from '../js/views/formation-fiche.js';
import { NEGOCIATION } from '../js/data/negociation.js';
import { CHEF_DE_GROUPE } from '../js/data/chef-de-groupe.js';
import { state as concoursState, blankDossier } from '../js/core/state.js';
import { totals as concoursTotals } from '../js/scoring/totals.js';
import { renderDossier } from '../js/views/dossier.js';
import { checkPages } from './check-pages.mjs';

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

// ───────────────────────── §6 et §7 formations ──────────────────────────

for (const course of [NEGOCIATION, CHEF_DE_GROUPE]) {
  await group(`${course.title} — cours, évaluation, fiche`, async () => {
    assert.ok(course.chapters.length >= 16, `${course.chapters.length} chapitres`);
    assert.ok(course.reflexe.steps.length >= 8, 'fiche réflexe incomplète');
    assert.equal(course.evaluation.questions.length, 10);

    const exercises = course.chapters.flatMap(chapter =>
      chapter.blocks.filter(block => block.t === 'exercice'));
    assert.ok(exercises.length >= 5, `${exercises.length} exercices`);

    // chaque chapitre a du contenu, et chaque bloc un type connu
    const known = new Set(['p', 'liste', 'rp', 'dialogue', 'retenir', 'erreurs', 'etapes', 'table', 'exercice']);
    for (const chapter of course.chapters) {
      assert.ok(chapter.blocks.length >= 2, `chapitre ${chapter.num} trop court`);
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
    ['cdg', 'concours', 'negociation']
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

  assert.equal(rect.id, `${exam.id}-R2`);
  assert.equal(rect.rectifies, exam.id);
  assert.equal(rect.locked, true);

  const original = await records.get('cdg', exam.id);
  assert.equal(original.decision, 'QUALIFIE_RESERVE', 'le dossier d’origine a été réécrit');

  const index = await store.readData('cdg/index.json');
  assert.equal(index.find(line => line.id === exam.id).rectifiedBy, rect.id);

  // une deuxième rectification s'empile sans écraser la première
  const again = await records.publishRectified('cdg', exam, fixed);
  assert.equal(again.id, `${exam.id}-R3`);

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

// ───────────────────────── Résultat ─────────────────────────────────────

stdout.write(`\n${passed} groupe(s) réussi(s), ${failures.length} échec(s).\n`);
stdout.write(`Variantes d'examen Chef de Groupe : ${variants.total.toLocaleString('fr-FR')}\n\n`);

exit(failures.length ? 1 : 0);
