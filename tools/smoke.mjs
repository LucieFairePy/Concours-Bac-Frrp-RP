// Chargement du portail, comme le ferait un navigateur — node tools/smoke.mjs
//
// Les tests de tools/test.mjs appellent les fonctions une par une. Ce
// contrôle-ci fait autre chose : il **démarre le portail** par son entrée
// (js/main.js), puis **ouvre chaque route** de js/routes.js avec une
// session déjà ouverte, parcourt toutes les étapes des modules en étapes et
// tous les chapitres des formations, et vérifie que chaque page se remplit.
//
// Ce qu'il attrape et que rien d'autre ne voit : une erreur au montage
// d'une page, un appel à une API absente, un identifiant d'élément attendu
// par le code mais jamais écrit, une page qui reste blanche.
//
// Tout est simulé : pas de réseau, pas de dépôt, pas de navigateur. Le
// portail tourne en « mode local » (owner/repo vides), le même mode que
// propose la page d'accès quand aucun dépôt n'est configuré.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { stdout, exit } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── Bac à sable : une copie de js/ avec un config.js sans dépôt ─────────
//
// On ne touche pas au dépôt : la copie vit dans un dossier temporaire, et
// c'est elle qui est chargée. Le vrai js/config.js garde ses valeurs.

const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'bac75n-smoke-'));

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target);
    else fs.copyFileSync(source, target);
  }
}

copyTree(path.join(ROOT, 'js'), path.join(SANDBOX, 'js'));
fs.writeFileSync(
  path.join(SANDBOX, 'js', 'config.js'),
  fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8')
    .replace(/owner: '[^']*'/, "owner: ''")
    .replace(/repo: '[^']*'/, "repo: ''"),
  'utf8'
);

const sandboxUrl = rel => pathToFileURL(path.join(SANDBOX, rel)).href;

// ── Un DOM suffisant pour que les pages se rendent ─────────────────────
//
// Chaque élément est créé à la demande par getElementById. Écrire du HTML
// dans un élément (innerHTML, insertAdjacentHTML) déclare les identifiants
// qu'il contient : un contrôle « #x existe » voit donc aussi ce qu'un
// gabarit de page a posé.

const nodes = new Map();
const declared = new Set();

function makeClassList() {
  const set = new Set();
  return {
    add: (...names) => names.forEach(name => set.add(name)),
    remove: (...names) => names.forEach(name => set.delete(name)),
    toggle: (name, on) => {
      const next = on === undefined ? !set.has(name) : on;
      if (next) set.add(name);
      else set.delete(name);
    },
    contains: name => set.has(name),
    values: () => [...set]
  };
}

function declare(html) {
  for (const match of String(html).matchAll(/\bid="([a-zA-Z0-9_-]+)"/g)) declared.add(match[1]);
}

function makeNode(id) {
  let html = '';
  return {
    id,
    get innerHTML() { return html; },
    set innerHTML(value) { html = String(value); declare(html); },
    insertAdjacentHTML(where, value) { html += String(value); declare(value); },
    textContent: '',
    value: '',
    className: '',
    disabled: false,
    style: {},
    dataset: {},
    classList: makeClassList(),
    focus() {},
    select() {},
    addEventListener() {},
    querySelectorAll: () => [],
    querySelector: () => null
  };
}

function node(id) {
  if (!nodes.has(id)) nodes.set(id, makeNode(id));
  return nodes.get(id);
}

let replaced = null;

function installDom() {
  const body = makeNode('body');
  body.classList.add('booting');

  globalThis.document = {
    body,
    title: 'test',
    visibilityState: 'visible',
    getElementById: node,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}
  };

  const storage = new Map();
  globalThis.localStorage = {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  };
  globalThis.sessionStorage = globalThis.localStorage;

  // Comme sur GitHub Pages : on arrive sur la racine, sans `#`.
  const location = {
    hash: '',
    search: '',
    pathname: '/index.html',
    replace(url) { replaced = url; }
  };

  globalThis.history = {
    replaceState(state, title, url) {
      const hash = String(url).indexOf('#');
      if (hash >= 0) location.hash = String(url).slice(hash);
    }
  };

  globalThis.window = {
    location,
    localStorage: globalThis.localStorage,
    sessionStorage: globalThis.sessionStorage,
    scrollTo() {},
    print() {},
    alert() {},
    confirm: () => true,
    addEventListener() {},
    setTimeout: (fn, delay) => setTimeout(fn, delay),
    clearTimeout: id => clearTimeout(id)
  };

  // `navigator` existe déjà dans Node et n'est qu'un accesseur : on le
  // redéfinit au lieu de l'affecter.
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { writeText: async () => {} } },
    configurable: true,
    writable: true
  });

  globalThis.Image = class { set src(value) { this._src = value; } };
}

/** Clé réellement utilisée par js/core/session-store.js. */
function detectSessionKey() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'core', 'session-store.js'), 'utf8');
  const match = source.match(/['"]([a-z0-9._:-]*session[a-z0-9._:-]*)['"]/i);
  return match ? match[1] : 'bac_session';
}

function openSession() {
  globalThis.localStorage.setItem(detectSessionKey(), JSON.stringify({
    local: 'Brigadier LAURENT Cyril',
    expiresAt: Date.now() + 12 * 3600 * 1000
  }));
}

function settle(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function filled(id) {
  const found = nodes.get(id);
  return Boolean(found && String(found.innerHTML || found.textContent || '').trim());
}

// ── Ce que chaque route doit montrer ───────────────────────────────────
//
// `expect` : identifiants qui doivent exister une fois la page montée —
//            remplis par le code, ou posés par le gabarit de la page.
// `steps`  : étapes à parcourir, et la zone que chacune doit remplir.

const COURSE_STEPS = {
  steps: ['id', 'cours', 'eval', 'correct', 'final'],
  stepExpect: { cours: 'coursWrap', eval: 'evalBox', correct: 'correctBox', final: 'sheet' }
};

const ROUTE_SPECS = {
  accueil: { expect: ['cards', 'dash', 'tileNews', 'tileCases', 'tileQuick', 'tileStaff'] },
  concours: {
    expect: ['tabs', 'sections'],
    steps: ['id', 'theory', 'radio', 'sc', 'phys', 'shoot', 'correct', 'results', 'final'],
    stepExpect: { correct: 'correction', results: 'resultBox', final: 'sheet' }
  },
  formations: { expect: ['cards'] },
  // Module de l'archive : sommaire et chapitre, sans parcours à étapes.
  'formation-negociation': { expect: ['toc', 'lesson'], lessons: 20 },
  // Chef de Groupe : le cours de l'archive, sans étapes ni dossier.
  'formation-chef-groupe': { expect: ['chapters', 'lesson'] },
  // La radio n'a que le cours de l'archive : sommaire et chapitre, sans étapes.
  'formation-radio': { expect: ['mrNav', 'mrChapter'] },
  // Le module d'archive est un cours seul : ni étapes, ni dossier à remplir.
  'formation-antiterrorisme': { expect: ['coursWrap'], chapters: true },
  // Les huit onglets de modules/examen-chef-groupe.html (archive V4).
  'examen-chef-groupe': {
    expect: ['steps', 'mxApp'],
    steps: ['id', 'q', 'lead', 's1', 's2', 'corr', 'res', 'final'],
    stepExpect: { id: 'mxApp', q: 'mxApp', lead: 'mxApp', s1: 'mxApp', s2: 'mxApp', corr: 'mxApp', res: 'mxApp', final: 'mxApp' }
  },
  historique: { expect: ['families', 'filters', 'results'] },
  actualites: { expect: ['content'] },
  administration: { expect: ['newsBox', 'storageBox', 'journalBox', 'imagesBox'] },
  utilisateurs: { expect: ['usersBox'] },
  parametres: { expect: ['settingsBox'] }
};

// ── Démarrage ──────────────────────────────────────────────────────────

const failures = [];
let loaded = 0;

const errors = [];
process.on('unhandledRejection', reason => errors.push(reason));

function check(label, fn) {
  return fn().then(
    () => {
      if (errors.length) throw errors.shift();
      loaded += 1;
      stdout.write(`  ok   ${label}\n`);
    }
  ).catch(error => {
    failures.push({ page: label, error });
    stdout.write(`  ÉCHEC ${label}\n         ${error && error.message ? error.message : error}\n`);
  });
}

stdout.write('\nPortail BAC 75 N — démarrage et routes\n\n');

installDom();

// 1. Sans session : la page d'accès se peint, le portail reste masqué.
await check('index.html sans session → accès examinateur', async () => {
  await import(`${sandboxUrl('js/main.js')}?t=gate`);
  await settle();
  if (!document.body.classList.contains('gate')) throw new Error('body.gate attendu');
  if (!filled('gate')) throw new Error('#gate est resté vide');
  if (filled('view')) throw new Error('le portail a été peint sans session');
});

// 2. Le formulaire local ouvre la session et peint le portail.
await check('connexion locale → portail sur #/accueil', async () => {
  node('gateName').value = 'Brigadier LAURENT Cyril';
  await globalThis.window.gate.submitLocal();
  await settle();
  if (!document.body.classList.contains('portal-shell')) throw new Error('body.portal-shell attendu');
  for (const id of ['portalSidebar', 'portalHeader', 'view']) {
    if (!filled(id)) throw new Error(`#${id} est resté vide`);
  }
  if (!declared.has('dash')) throw new Error('l’accueil n’a pas été monté');
  if (globalThis.window.location.hash !== '#/accueil') {
    throw new Error(`adresse attendue #/accueil, obtenue « ${globalThis.window.location.hash} »`);
  }
});

// 3. Chaque route, montée comme le routeur la monte.
const { ROUTES } = await import(sandboxUrl('js/routes.js'));
const auth = await import(sandboxUrl('js/core/auth.js'));
const portal = await import(sandboxUrl('js/shell/index.js'));

for (const [id, route] of Object.entries(ROUTES)) {
  const spec = ROUTE_SPECS[id];
  await check(`#/${route.path}`, async () => {
    if (!spec) throw new Error('route sans contrôle déclaré dans tools/smoke.mjs');

    nodes.clear();
    declared.clear();
    openSession();

    const page = (await route.load()).default;
    portal.paint(route.nav);
    const view = node('view');
    view.innerHTML = '<div id="banner"></div>';
    view.insertAdjacentHTML('beforeend', page.template ? page.template({ params: new URLSearchParams() }) : '');
    globalThis.window.app = page.handlers || {};

    await page.mount({ params: new URLSearchParams(), session: auth.current(), alive: () => true });
    await settle();
    if (errors.length) throw errors.shift();

    for (const wanted of spec.expect) {
      if (!filled(wanted) && !declared.has(wanted)) throw new Error(`#${wanted} absent`);
    }
    if (!filled('portalSidebar')) throw new Error('barre latérale vide');

    // Parcours de toutes les étapes du module. Sans cela, seule la
    // première étape serait exercée, et une faute dans la correction ou
    // dans la fiche finale passerait inaperçue.
    if (spec.steps) {
      const app = globalThis.window.app;
      if (typeof app.openStep !== 'function') {
        throw new Error('aucun app.openStep() exposé : les étapes ne peuvent pas être parcourues');
      }

      for (const step of spec.steps) {
        app.openStep(step);
        await settle(10);
        if (errors.length) throw errors.shift();

        if (!declared.has(`s-${step}`)) throw new Error(`étape « ${step} » : section #s-${step} absente`);

        const host = spec.stepExpect && spec.stepExpect[step];
        if (host && !filled(host)) throw new Error(`étape « ${step} » : #${host} est resté vide`);
      }
    }

    // Pour un cours, on ouvre aussi chaque chapitre : c'est le rendu le
    // plus répétitif, donc celui où un bloc mal formé se cache le mieux.
    if (spec.chapters) {
      const { courseByRoute } = await import(sandboxUrl('js/data/formations/index.js'));
      const { course } = courseByRoute(id);
      const app = globalThis.window.app;
      if (typeof app.openStep === 'function') app.openStep('cours');
      for (const chapter of course.chapters) {
        app.openChapter(chapter.id);
        await settle(2);
        if (errors.length) throw errors.shift();
        if (!String(node('coursWrap').innerHTML).includes(chapter.title.replace(/[&<>"']/g, '').slice(0, 12))) {
          throw new Error(`chapitre « ${chapter.num} ${chapter.title} » non rendu`);
        }
      }
    }

    // Un module sans étapes (négociation) : chaque chapitre ouvert par app.go().
    if (spec.lessons) {
      const app = globalThis.window.app;
      for (let index = 0; index < spec.lessons; index += 1) {
        app.go(index);
        await settle(2);
        if (errors.length) throw errors.shift();
        const number = String(index + 1).padStart(2, '0');
        if (!String(node('lesson').innerHTML).includes(`>${number}<`)) throw new Error(`chapitre ${number} non rendu`);
      }
    }

    if (page.unmount) await page.unmount();
  });
}

// 4. Déconnexion : la session est fermée et l'onglet repart sur l'accès.
await check('déconnexion → retour à l’accès', async () => {
  replaced = null;
  portal.signOut();
  if (auth.current()) throw new Error('session encore ouverte');
  if (!String(replaced || '').includes('r=signedout')) throw new Error(`retour attendu vers l’accès, obtenu : ${replaced}`);
});

fs.rmSync(SANDBOX, { recursive: true, force: true });

stdout.write(`\n${loaded} contrôle(s) réussi(s), ${failures.length} échec(s).\n\n`);

if (failures.length) {
  for (const failure of failures) {
    if (failure.error && failure.error.stack) {
      stdout.write(`${failure.page} :\n${failure.error.stack}\n\n`);
    }
  }
  exit(1);
}
