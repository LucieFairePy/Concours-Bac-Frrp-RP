// Contrôle statique du câblage — node tools/check-pages.mjs
//
// Ce que ce contrôle attrape, et qu'aucun test d'unité ne voit : le câblage
// entre les gabarits HTML et le JavaScript. Sur un site sans étape de
// build, c'est la panne la plus courante et la plus silencieuse.
//
//   1. un `onclick="app.x()"` dont la page ne déclare pas `x` ;
//   2. un `setHTML('zone', …)` dont l'élément `#zone` n'est nulle part ;
//   3. un `href('route')` vers une route que js/routes.js ne connaît pas ;
//   4. une ressource (feuille de style, image, script) absente du dépôt ;
//   5. une feuille de style du dossier css/ que index.html ne charge pas ;
//   6. un import relatif qui ne résout pas.
//
// Rien n'est exécuté : tout est lu sur le disque. Le contrôle est appelé
// par la suite de tests, et peut se lancer seul.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(file) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function walk(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .flatMap(entry => (entry.isDirectory()
      ? walk(`${dir}/${entry.name}`)
      : [`${dir}/${entry.name}`]));
}

/** Imports relatifs d'un fichier, résolus depuis la racine du dépôt. */
function importsOf(file) {
  const source = read(file) || '';
  const out = [];
  const re = /(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s*'([^']+)'|import\(\s*'([^']+)'\s*\)/g;
  let match;
  while ((match = re.exec(source))) {
    const specifier = match[1] || match[2];
    if (!specifier.startsWith('.')) continue; // module de Node
    out.push({ specifier, resolved: path.posix.normalize(`${path.posix.dirname(file)}/${specifier}`) });
  }
  return out;
}

/**
 * Les fichiers qui composent une page : son entrée et tout ce qu'elle
 * importe dans js/pages et js/ui. Le noyau, les données et la coque n'y
 * entrent pas : ils ne posent pas de handlers `app.*`.
 */
function pageFiles(entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !exists(file)) continue;
    seen.add(file);
    for (const { resolved } of importsOf(file)) {
      if (/^js\/(pages|ui)\//.test(resolved)) queue.push(resolved);
    }
  }
  return [...seen];
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

/**
 * Clés du littéral d'objet `const <name> = { … }` : méthodes, propriétés
 * et raccourcis. Le littéral est découpé à l'accolade fermante qui lui
 * correspond, puis seules les clés de premier niveau sont gardées.
 */
function keysOf(source, name) {
  const start = source.indexOf(`const ${name} = {`);
  if (start < 0) return new Set();

  let depth = 0;
  let body = '';
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 1 && ch !== '{') body += ch;
    if (depth === 0) break;
  }

  const found = new Set();
  const re = /(?:^|[,\n])\s*(?:async\s+)?([a-zA-Z0-9_$]+)\s*(?=[(:,]|$)/gm;
  let match;
  while ((match = re.exec(body))) found.add(match[1]);
  return found;
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
  const re = /\b(?:setHTML|setText|byId|paintTile)\(\s*'([a-zA-Z0-9_-]+)'/g;
  for (const source of sources) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source))) found.add(match[1]);
  }
  return found;
}

/** Les routes et leur fichier d'entrée, lus dans js/routes.js. */
function routes() {
  const source = read('js/routes.js');
  const out = {};
  const re = /^ {2}'?([a-z-]+)'?: \{[\s\S]*?load: \(\) => import\('\.\/([^']+)'\)/gm;
  let match;
  while ((match = re.exec(source))) out[match[1]] = `js/${match[2]}`;
  return out;
}

export function checkPages() {
  const problems = [];
  const ROUTES = routes();
  const index = read('index.html');

  const shellFiles = walk('js/shell').filter(file => file.endsWith('.js'));
  const shellSources = shellFiles.map(read);
  const shellIds = new Set([...idsIn(index), ...shellSources.flatMap(source => [...idsIn(source)])]);

  // window.portal : ce que la coque expose réellement.
  const portalKeys = keysOf(read('js/shell/index.js'), 'portal');
  for (const name of callsIn([index, ...shellSources], 'portal')) {
    if (!portalKeys.has(name)) problems.push(`coque : portal.${name}() appelé mais non exposé`);
  }

  // 1 et 2 — chaque page : ses handlers, ses points de montage.
  if (!Object.keys(ROUTES).length) problems.push('js/routes.js : aucune route lue');

  for (const [id, entry] of Object.entries(ROUTES)) {
    if (!exists(entry)) {
      problems.push(`route ${id} : ${entry} absent`);
      continue;
    }

    const files = pageFiles(entry);
    const sources = files.map(read);
    const declared = new Set(sources.flatMap(source => [...keysOf(source, 'handlers')]));

    for (const name of callsIn(sources, 'app')) {
      if (!declared.has(name)) problems.push(`route ${id} : app.${name}() appelé mais non déclaré`);
    }
    for (const name of callsIn(sources, 'portal')) {
      if (!portalKeys.has(name)) problems.push(`route ${id} : portal.${name}() appelé mais non exposé`);
    }

    const available = new Set([...shellIds, 'banner', ...sources.flatMap(source => [...idsIn(source)])]);
    const all = sources.join('\n');
    for (const wanted of writtenIds(sources)) {
      // Un identifiant posé par un gabarit paramétré (`id="${id}"`) est
      // nommé ailleurs dans la page : on accepte s'il y est cité deux fois.
      const named = all.split(`'${wanted}'`).length - 1 >= 2 && all.includes('id="${');
      if (!available.has(wanted) && !named) {
        problems.push(`route ${id} : écrit dans #${wanted}, qui n’existe dans aucun gabarit`);
      }
    }
  }

  // La page d'accès : gate.* déclaré, #gate présent.
  const gateSources = ['js/pages/acces/index.js', 'js/pages/acces/view.js'].map(read);
  const gateKeys = keysOf(gateSources[0], 'gate');
  for (const name of callsIn(gateSources, 'gate')) {
    if (!gateKeys.has(name)) problems.push(`accès : gate.${name}() appelé mais non déclaré`);
  }
  if (!idsIn(index).has('gate')) problems.push('index.html : #gate absent');
  for (const wanted of ['portalSidebar', 'portalHeader', 'moduleBar', 'view']) {
    if (!idsIn(index).has(wanted)) problems.push(`index.html : #${wanted} absent`);
  }

  // 3 — tout href('x') et toute `route: 'x'` désignent une route connue.
  const jsFiles = walk('js').filter(file => file.endsWith('.js'));
  for (const file of jsFiles) {
    const source = read(file);
    const re = /\bhref\(\s*'([a-z-]+)'|\broute: '([a-z-]+)'|courseByRoute\(\s*'([a-z-]+)'/g;
    let match;
    while ((match = re.exec(source))) {
      const name = match[1] || match[2] || match[3];
      if (!ROUTES[name]) problems.push(`${file} : route inconnue — ${name}`);
    }
    if (/href="[a-z0-9-]+\.html/.test(source)) problems.push(`${file} : lien vers une page .html à plat`);
  }

  // 4 — ressources liées depuis les pages HTML.
  for (const page of ['index.html', '404.html']) {
    const html = read(page);
    const re = /(?:href|src)="([^"#:]+\.(?:html|css|js|svg|jpg|png))"/g;
    let match;
    while ((match = re.exec(html))) {
      const target = match[1].replace(/^\//, '').replace(/^Concours-Bac-Frrp-RP\//, '');
      if (!exists(target)) problems.push(`${page} : ressource introuvable — ${match[1]}`);
    }
  }

  // 5 — une seule page : toutes les feuilles de css/ y sont chargées.
  for (const sheet of walk('css').filter(file => file.endsWith('.css'))) {
    if (!index.includes(sheet)) problems.push(`index.html : ${sheet} n’est pas chargée`);
  }

  // 6 — tous les imports doivent résoudre. Un chemin faux ne se voit pas
  //     à la lecture : le navigateur casse la page entière au chargement.
  const toolFiles = walk('tools').filter(file => file.endsWith('.mjs'));
  for (const file of [...jsFiles, ...toolFiles]) {
    for (const { specifier, resolved } of importsOf(file)) {
      if (!exists(resolved)) problems.push(`${file} : import introuvable — ${specifier}`);
    }
  }

  return { problems, pages: Object.keys(ROUTES).length };
}

// Exécution directe : node tools/check-pages.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { problems, pages } = checkPages();
  if (problems.length) {
    for (const problem of problems) process.stdout.write(`  ${problem}\n`);
    process.stdout.write(`\n${problems.length} problème(s) sur ${pages} routes.\n`);
    process.exit(1);
  }
  process.stdout.write(`\n${pages} routes contrôlées, aucun problème de câblage.\n`);
}
