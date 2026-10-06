// Contrôle statique des pages — node tools/check-pages.mjs
//
// Ce que ce contrôle attrape, et qu'aucun test d'unité ne voit : le câblage
// entre le HTML et le JavaScript. Sur un site sans étape de build, c'est la
// panne la plus courante et la plus silencieuse.
//
//   1. un `onclick="app.x()"` dont `app.x` n'existe pas ;
//   2. un `setHTML('zone', …)` dont l'élément `#zone` n'est nulle part ;
//   3. un `href` ou un `src` qui ne mène à aucun fichier ;
//   4. une page qui ne charge pas une feuille de style dont elle a besoin.
//
// Rien n'est exécuté : tout est lu sur le disque. Le contrôle est appelé
// par la suite de tests, et peut se lancer seul.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Pour chaque page : son script d'entrée, les modules dont elle injecte le
 * HTML, le fichier qui déclare ses handlers, et le nom de l'objet exposé
 * sur window.
 */
const PAGES = {
  'index.html': {
    render: ['js/gate.js', 'js/views/gate.js'],
    handlers: ['js/gate.js'],
    holder: 'gate',
    // La page d'acces vit avant le portail : elle n'a ni en-tete commun ni
    // barre de module, donc les gabarits partages ne s'y appliquent pas.
    shared: false,
    css: ['base', 'components', 'gate']
  },
  'accueil.html': {
    render: ['js/accueil.js'],
    handlers: ['js/accueil.js'],
    css: ['base', 'layout', 'components', 'portal']
  },
  'app.html': {
    render: [
      'js/app.js', 'js/views/passage.js', 'js/views/correction.js',
      'js/views/results.js', 'js/views/dossier.js', 'js/views/navigation.js'
    ],
    handlers: ['js/app.js'],
    css: ['base', 'layout', 'components', 'portal', 'dossier', 'cover', 'print']
  },
  'formations.html': {
    render: ['js/formations.js', 'js/views/reflexe.js'],
    handlers: ['js/formations.js'],
    css: ['base', 'layout', 'components', 'portal', 'cours']
  },
  'negociation.html': {
    render: [
      'js/negociation.js', 'js/formation-app.js', 'js/views/cours.js',
      'js/views/stepper.js', 'js/views/formation-fiche.js'
    ],
    handlers: ['js/formation-app.js'],
    css: ['base', 'layout', 'components', 'portal', 'cours', 'correction', 'dossier', 'print']
  },
  'chef-de-groupe.html': {
    render: [
      'js/chef-de-groupe.js', 'js/formation-app.js', 'js/views/cours.js',
      'js/views/stepper.js', 'js/views/formation-fiche.js'
    ],
    handlers: ['js/formation-app.js'],
    css: ['base', 'layout', 'components', 'portal', 'cours', 'correction', 'dossier', 'print']
  },
  'examen-cdg.html': {
    render: [
      'js/examen-cdg.js', 'js/views/stepper.js',
      'js/views/cdg-epreuves.js', 'js/views/cdg-fiche.js'
    ],
    handlers: ['js/examen-cdg.js'],
    css: ['base', 'layout', 'components', 'portal', 'correction', 'dossier', 'cover', 'print']
  },
  'historique.html': {
    render: ['js/historique.js'],
    handlers: ['js/historique.js'],
    css: ['base', 'layout', 'components', 'portal', 'historique']
  },
  'parametres.html': {
    render: ['js/parametres.js', 'js/views/settings.js'],
    handlers: ['js/parametres.js'],
    css: ['base', 'layout', 'components', 'portal']
  },
  'administration.html': {
    render: ['js/administration.js'],
    handlers: ['js/administration.js'],
    css: ['base', 'layout', 'components', 'portal', 'historique']
  }
};

/** Modules partagés qui injectent du HTML dans toutes les pages du portail. */
const SHARED = ['js/core/portal.js'];

function read(file) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

/** Contenu de tous les attributs on*="..." d'une source. */
function handlerAttributes(source) {
  const out = [];
  const re = /\son[a-z]+\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = re.exec(source))) out.push(match[1] ?? match[2]);
  return out;
}

function callsIn(sources, holder) {
  const found = new Set();
  const re = new RegExp(`\\b${holder}\\.([a-zA-Z0-9_$]+)\\s*\\(`, 'g');
  for (const source of sources) {
    for (const attribute of handlerAttributes(source)) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(attribute))) found.add(match[1]);
    }
  }
  return found;
}

/** Clés d'un littéral d'objet de handlers (indenté de 2 à 4 espaces). */
function declaredIn(source) {
  const found = new Set();
  const re = /^\s{2,4}(?:async\s+)?([a-zA-Z0-9_$]+)\s*[(:]/gm;
  let match;
  while ((match = re.exec(source))) found.add(match[1]);
  return found;
}

/** Ce que window.portal expose réellement. */
function portalKeys() {
  const source = read('js/core/portal.js');
  const block = source.match(/export const portal = \{([\s\S]*?)\};/);
  if (!block) return new Set();
  // Une propriete abregee en fin de litteral n'est suivie d'aucune
  // virgule : on decoupe plutot que d'exiger un separateur.
  return new Set(
    block[1]
      .split(',')
      .map(part => part.trim().split(':')[0].trim())
      .filter(name => /^[a-zA-Z0-9_$]+$/.test(name))
  );
}

/** Tous les id= présents dans une source (HTML statique ou gabarit JS). */
function idsIn(source) {
  const found = new Set();
  const re = /\bid="([a-zA-Z0-9_-]+)"/g;
  let match;
  while ((match = re.exec(source))) found.add(match[1]);
  return found;
}

/** Identifiants écrits par le JavaScript : setHTML('x'…), byId('x')… */
function writtenIds(sources) {
  const found = new Set();
  const re = /\b(?:setHTML|setText|byId|domNode)\(\s*'([a-zA-Z0-9_-]+)'/g;
  for (const source of sources) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source))) found.add(match[1]);
  }
  return found;
}

export function checkPages() {
  const problems = [];
  const PORTAL = portalKeys();
  const portalSources = SHARED.map(read).filter(Boolean);

  for (const [page, config] of Object.entries(PAGES)) {
    const html = read(page);
    if (html === null) {
      problems.push(`${page} : page absente`);
      continue;
    }

    const missing = config.render.filter(file => !exists(file));
    if (missing.length) {
      problems.push(`${page} : modules absents — ${missing.join(', ')}`);
      continue;
    }

    const renderSources = config.render.map(read);
    const sharedSources = config.shared === false ? [] : portalSources;
    const allSources = [html, ...renderSources, ...sharedSources];
    const holder = config.holder || 'app';

    // 1. handlers appelés depuis le HTML
    const declared = new Set();
    for (const file of config.handlers) {
      for (const key of declaredIn(read(file))) declared.add(key);
    }
    for (const name of callsIn(allSources, holder)) {
      if (!declared.has(name)) {
        problems.push(`${page} : ${holder}.${name}() appelé depuis le HTML mais non déclaré`);
      }
    }
    for (const name of callsIn(allSources, 'portal')) {
      if (!PORTAL.has(name)) {
        problems.push(`${page} : portal.${name}() appelé depuis le HTML mais non exposé`);
      }
    }

    // 2. points de montage
    const available = new Set();
    for (const source of allSources) {
      for (const id of idsIn(source)) available.add(id);
    }
    for (const id of writtenIds([...renderSources, ...sharedSources])) {
      if (!available.has(id)) {
        problems.push(`${page} : écrit dans #${id}, qui n’existe dans aucun gabarit`);
      }
    }

    // 3. ressources liées
    const re = /(?:href|src)="([^"#:]+\.(?:html|css|js|svg|jpg|png))"/g;
    let match;
    while ((match = re.exec(html))) {
      const target = match[1].replace(/^\//, '').replace(/^Concours-Bac-Frrp-RP\//, '');
      if (!exists(target)) problems.push(`${page} : ressource introuvable — ${match[1]}`);
    }

    // 4. feuilles de style attendues
    for (const name of config.css) {
      if (!html.includes(`css/${name}.css`)) {
        problems.push(`${page} : feuille de style css/${name}.css non chargée`);
      }
    }
  }

  // 5. liens internes écrits en JavaScript
  for (const file of fs.readdirSync(path.join(ROOT, 'js')).filter(name => name.endsWith('.js'))) {
    const source = read(`js/${file}`);
    const re = /href="([a-z0-9-]+\.html)/g;
    let match;
    while ((match = re.exec(source))) {
      if (!exists(match[1])) problems.push(`js/${file} : lien vers une page absente — ${match[1]}`);
    }
  }

  // 6. la navigation du portail ne doit pointer que vers des pages réelles
  const navSource = read('js/core/portal.js');
  const navRe = /href:\s*'([a-z0-9-]+\.html)'/g;
  let navMatch;
  while ((navMatch = navRe.exec(navSource))) {
    if (!exists(navMatch[1])) {
      problems.push(`js/core/portal.js : la navigation pointe vers ${navMatch[1]}, qui n’existe pas`);
    }
  }

  // 7. tous les imports doivent résoudre. Un chemin faux ne se voit pas
  //    à la lecture : le navigateur casse la page entière au chargement.
  const jsFiles = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const relative = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(relative);
      else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) jsFiles.push(relative);
    }
  }('js'));
  jsFiles.push('tools/access.mjs', 'tools/guard.mjs', 'tools/restore.mjs', 'tools/prompt.mjs',
    'tools/test.mjs', 'tools/check-pages.mjs');

  for (const file of jsFiles) {
    const source = read(file);
    if (source === null) continue;
    const importRe = /(?:^|\n)\s*(?:import|export)[^'"\n]*from\s*'([^']+)'/g;
    let importMatch;
    while ((importMatch = importRe.exec(source))) {
      const specifier = importMatch[1];
      if (!specifier.startsWith('.')) continue; // module de Node
      const resolved = path.posix.normalize(`${path.posix.dirname(file)}/${specifier}`);
      if (!exists(resolved)) {
        problems.push(`${file} : import introuvable — ${specifier}`);
      }
    }
  }

  // 8. les pages déclarées dans records.js doivent exister
  const recordsSource = read('js/core/records.js');
  const pageRe = /page:\s*'([a-z0-9-]+\.html)'/g;
  let pageMatch;
  while ((pageMatch = pageRe.exec(recordsSource))) {
    if (!exists(pageMatch[1])) {
      problems.push(`js/core/records.js : module déclaré sur ${pageMatch[1]}, qui n’existe pas`);
    }
  }

  return { problems, pages: Object.keys(PAGES).length };
}

// Exécution directe : node tools/check-pages.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { problems, pages } = checkPages();
  if (problems.length) {
    for (const problem of problems) process.stdout.write(`  ${problem}\n`);
    process.stdout.write(`\n${problems.length} problème(s) sur ${pages} pages.\n`);
    process.exit(1);
  }
  process.stdout.write(`\n${pages} pages contrôlées, aucun problème de câblage.\n`);
}
