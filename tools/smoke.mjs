// Chargement de chaque page, comme le ferait un navigateur — node tools/smoke.mjs
//
// Les tests de tools/test.mjs appellent les fonctions une par une. Ce
// contrôle-ci fait autre chose : il **charge le module d'entrée de chaque
// page**, exactement comme le ferait le navigateur au chargement, avec une
// session déjà ouverte, et vérifie que la page se remplit.
//
// Ce qu'il attrape et que rien d'autre ne voyait : une erreur au démarrage
// (`boot()`), un appel à une API absente, un identifiant d'élément attendu
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

// ── Un DOM suffisant pour que les pages se rendent ─────────────────────

function makeClassList() {
  const set = new Set();
  return {
    add: (...names) => names.forEach(name => set.add(name)),
    remove: (...names) => names.forEach(name => set.delete(name)),
    toggle: (name, on) => (on ? set.add(name) : set.delete(name)),
    contains: name => set.has(name),
    values: () => [...set]
  };
}

function makeNode(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
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

let nodes;
let redirect;
let search;

function installDom(pageHtml) {
  nodes = new Map();

  // Les identifiants présents dans le HTML de la page existent dès le
  // départ ; tous les autres sont créés à la demande, comme le fait un
  // innerHTML qui vient d'insérer son contenu.
  for (const match of pageHtml.matchAll(/\bid="([a-zA-Z0-9_-]+)"/g)) {
    nodes.set(match[1], makeNode(match[1]));
  }

  const body = makeNode('body');
  body.classList.add('booting');

  globalThis.document = {
    body,
    title: 'test',
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, makeNode(id));
      return nodes.get(id);
    },
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

  // Session déjà ouverte en mode local, échéance dans 12 h.
  storage.set('bac-session', JSON.stringify({
    local: 'Brigadier LAURENT Cyril',
    expiresAt: Date.now() + 12 * 3600 * 1000
  }));

  redirect = null;
  globalThis.window = {
    location: {
      search,
      href: `http://local/test${search}`,
      replace(url) { redirect = url; },
      assign(url) { redirect = url; }
    },
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
  return match ? match[1] : 'bac-session';
}

const SESSION_KEY = detectSessionKey();

// ── Pages à charger ────────────────────────────────────────────────────
//
// `expect` : identifiants qui doivent être remplis une fois la page prête.
// `query`  : paramètres d'URL à simuler.

const PAGES = [
  {
    page: 'accueil.html',
    entry: 'js/accueil.js',
    expect: ['portalSidebar', 'portalHeader', 'hero', 'cards', 'dash',
      'tileNews', 'tileCases', 'tileQuick', 'tileStaff']
  },
  {
    page: 'app.html',
    entry: 'js/app.js',
    expect: ['portalHeader', 'moduleBar', 'tabs', 'sections'],
    // Toutes les étapes du concours, correction et fiche comprises : c'est
    // là que vivent les rendus les plus fournis.
    steps: ['id', 'theory', 'radio', 'sc', 'phys', 'shoot', 'correct', 'results', 'final'],
    // Zone que chaque étape doit avoir remplie une fois ouverte.
    stepExpect: { correct: 'correction', results: 'resultBox', final: 'sheet' }
  },
  {
    page: 'formations.html',
    entry: 'js/formations.js',
    expect: ['portalHeader', 'moduleBar', 'cards']
  },
  {
    page: 'negociation.html',
    entry: 'js/negociation.js',
    expect: ['portalHeader', 'moduleBar', 'tabs', 'sections'],
    steps: ['id', 'cours', 'eval', 'correct', 'final'],
    stepExpect: { cours: 'coursWrap', eval: 'evalBox', correct: 'correctBox', final: 'sheet' },
    chapters: 'negociation'
  },
  {
    page: 'chef-de-groupe.html',
    entry: 'js/chef-de-groupe.js',
    expect: ['portalHeader', 'moduleBar', 'tabs', 'sections'],
    steps: ['id', 'cours', 'eval', 'correct', 'final'],
    stepExpect: { cours: 'coursWrap', eval: 'evalBox', correct: 'correctBox', final: 'sheet' },
    chapters: 'chef-de-groupe'
  },
  {
    page: 'examen-cdg.html',
    entry: 'js/examen-cdg.js',
    expect: ['portalHeader', 'moduleBar', 'tabs', 'sections'],
    steps: ['id', 'co', 'cm', 'sit1', 'sit2', 'correct', 'result', 'final'],
    stepExpect: {
      co: 'connaissancesBox', cm: 'commandementBox',
      sit1: 'sit1Box', sit2: 'sit2Box',
      correct: 'correctBox', result: 'resultBox', final: 'sheet'
    }
  },
  {
    page: 'historique.html',
    entry: 'js/historique.js',
    expect: ['portalHeader', 'moduleBar', 'hero', 'categories', 'filters', 'results']
  },
  {
    page: 'parametres.html',
    entry: 'js/parametres.js',
    expect: ['portalHeader', 'moduleBar', 'settingsBox']
  },
  {
    page: 'administration.html',
    entry: 'js/administration.js',
    expect: ['portalHeader', 'moduleBar', 'content']
  },
  {
    page: 'utilisateurs.html',
    entry: 'js/utilisateurs.js',
    expect: ['portalSidebar', 'portalHeader', 'moduleBar', 'usersBox']
  },
  {
    page: 'actualites.html',
    entry: 'js/actualites.js',
    expect: ['portalSidebar', 'portalHeader', 'moduleBar', 'hero', 'content']
  },
  {
    page: 'index.html',
    entry: 'js/gate.js',
    // La page d'accès avec une session valide doit mener au portail.
    expectRedirect: 'accueil.html'
  }
];

function settle(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const failures = [];
let loaded = 0;

stdout.write('\nPortail BAC 75 N — chargement des pages\n\n');

for (const spec of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, spec.page), 'utf8');
  search = spec.query || '';
  installDom(html);

  // La session est lue sous la clé réellement utilisée par le module.
  globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify({
    local: 'Brigadier LAURENT Cyril',
    expiresAt: Date.now() + 12 * 3600 * 1000
  }));

  const url = `${pathToFileURL(path.join(SANDBOX, spec.entry)).href}?t=${Date.now()}-${Math.random()}`;

  const errors = [];
  const onRejection = reason => errors.push(reason);
  process.on('unhandledRejection', onRejection);

  try {
    await import(url);
    await settle();

    if (errors.length) throw errors[0];

    if (spec.expectRedirect) {
      if (!String(redirect || '').includes(spec.expectRedirect)) {
        throw new Error(`redirection attendue vers ${spec.expectRedirect}, obtenue : ${redirect || 'aucune'}`);
      }
    } else {
      if (redirect) {
        throw new Error(`la page a redirigé vers ${redirect} au lieu de s’afficher`);
      }
      if (document.body.classList.contains('booting')) {
        throw new Error('la page est restée masquée (body.booting non retiré)');
      }
      for (const id of spec.expect) {
        const node = nodes.get(id);
        if (!node || !String(node.innerHTML || node.textContent || '').trim()) {
          throw new Error(`#${id} est resté vide`);
        }
      }

      // Parcours de toutes les étapes du module. Sans cela, seule la
      // première étape serait exercée, et une faute dans la correction ou
      // dans la fiche finale passerait inaperçue.
      if (spec.steps) {
        const app = globalThis.window.app || globalThis.app;
        if (!app || typeof app.openStep !== 'function') {
          throw new Error('aucun app.openStep() exposé : les étapes ne peuvent pas être parcourues');
        }

        for (const step of spec.steps) {
          app.openStep(step);
          await settle(10);
          if (errors.length) throw errors[0];

          const section = nodes.get(`s-${step}`);
          if (!section) throw new Error(`étape « ${step} » : section #s-${step} absente`);

          const host = spec.stepExpect && spec.stepExpect[step];
          if (host) {
            const node = nodes.get(host);
            if (!node || !String(node.innerHTML || '').trim()) {
              throw new Error(`étape « ${step} » : #${host} est resté vide`);
            }
          }
        }

        // Pour un cours, on ouvre aussi chaque chapitre : c'est le rendu le
        // plus répétitif, donc celui où un bloc mal formé se cache le mieux.
        if (spec.chapters && typeof app.openChapter === 'function') {
          const module = await import(
            pathToFileURL(path.join(SANDBOX, 'js', 'data', `${spec.chapters}.js`)).href
          );
          const course = Object.values(module)[0].chapters ? Object.values(module)[0] : module.NEGOCIATION;
          app.openStep('cours');
          for (const chapter of course.chapters) {
            app.openChapter(chapter.id);
            await settle(2);
            if (errors.length) throw errors[0];
            const host = nodes.get('coursWrap');
            if (!host || !String(host.innerHTML).includes(chapter.title)) {
              throw new Error(`chapitre « ${chapter.num} ${chapter.title} » non rendu`);
            }
          }
        }
      }
    }

    loaded += 1;
    stdout.write(`  ok   ${spec.page}\n`);
  } catch (error) {
    failures.push({ page: spec.page, error });
    stdout.write(`  ÉCHEC ${spec.page}\n         ${error && error.message ? error.message : error}\n`);
  } finally {
    process.off('unhandledRejection', onRejection);
  }
}

fs.rmSync(SANDBOX, { recursive: true, force: true });

stdout.write(`\n${loaded} page(s) chargée(s), ${failures.length} échec(s).\n\n`);

if (failures.length) {
  for (const failure of failures) {
    if (failure.error && failure.error.stack) {
      stdout.write(`${failure.page} :\n${failure.error.stack}\n\n`);
    }
  }
  exit(1);
}
