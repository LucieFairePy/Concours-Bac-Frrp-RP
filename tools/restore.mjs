import { stdout, argv, exit } from 'node:process';

import { CONFIG } from '../js/config.js';
import { confirm, fail, closePrompter, resolveToken, parseFlags } from './prompt.mjs';

const API = 'https://api.github.com';
const SLUG = `${CONFIG.owner}/${CONFIG.repo}`;

const USAGE = `
Restauration des données — ${SLUG}, branche ${CONFIG.dataBranch}

  node tools/restore.mjs log [n]
  node tools/restore.mjs show <sha>
  node tools/restore.mjs diff <sha>
  node tools/restore.mjs rollback <sha>

  log        liste les derniers changements de ${CONFIG.dataDir}/
  show       liste les fichiers tels qu'ils étaient à ce commit
  diff       compare cet état à l'état actuel
  rollback   remet ${CONFIG.dataDir}/ dans l'état de ce commit

rollback n'efface aucun historique : il ajoute des commits. Tout état passé
reste atteignable. Seul « log » et « show » fonctionnent sans jeton.
`;

let token = null;

function headers() {
  const out = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) out.Authorization = `Bearer ${token}`;
  return out;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}/repos/${SLUG}${path}`, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: headers(),
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    let detail = response.statusText;
    try {
      detail = (await response.json()).message || detail;
    } catch (error) {
      detail = response.statusText;
    }
    fail(`${path} → HTTP ${response.status} : ${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function commits(limit) {
  const list = await api(
    `/commits?sha=${CONFIG.dataBranch}&path=${CONFIG.dataDir}&per_page=${limit}`
  );
  return list || [];
}

async function treeAt(sha) {
  const commit = await api(`/commits/${sha}`);
  if (!commit) fail(`Commit ${sha} introuvable.`);

  const tree = await api(`/git/trees/${commit.commit.tree.sha}?recursive=1`);
  if (!tree) fail(`Arbre du commit ${sha} illisible.`);

  const prefix = `${CONFIG.dataDir}/`;
  return tree.tree
    .filter(node => node.type === 'blob' && node.path.startsWith(prefix))
    .map(node => ({ path: node.path, sha: node.sha, size: node.size }));
}

async function currentTree() {
  return treeAt(CONFIG.dataBranch);
}

async function fileAt(path, ref) {
  const payload = await api(`/contents/${path}?ref=${ref}`);
  return payload && payload.content
    ? Buffer.from(payload.content, 'base64').toString('utf8')
    : null;
}

function countDossiers(files) {
  const prefix = `${CONFIG.dataDir}/dossiers/`;
  return files.filter(f => f.path.startsWith(prefix) && !f.path.endsWith('index.json')).length;
}

async function cmdLog(rest) {
  const limit = Math.min(50, Math.max(1, Number(rest[0]) || 15));
  const list = await commits(limit);

  if (!list.length) {
    stdout.write('Aucun changement trouvé.\n');
    return;
  }

  stdout.write(`\n${list.length} derniers changements de ${CONFIG.dataDir}/ :\n\n`);
  for (const entry of list) {
    const date = entry.commit.author.date.replace('T', ' ').slice(0, 16);
    const subject = entry.commit.message.split('\n')[0];
    stdout.write(`  ${entry.sha.slice(0, 8)}  ${date}  ${subject}\n`);
  }
  stdout.write('\n');
}

async function cmdShow(rest) {
  const [sha] = rest;
  if (!sha) fail('Usage : show <sha>');

  const files = await treeAt(sha);
  stdout.write(`\nÉtat de ${CONFIG.dataDir}/ au commit ${sha.slice(0, 8)} :\n\n`);
  for (const file of files) {
    stdout.write(`  ${String(file.size).padStart(7)} o  ${file.path}\n`);
  }
  stdout.write(`\n  ${files.length} fichiers, dont ${countDossiers(files)} dossier(s) clôturé(s)\n\n`);
}

async function compare(sha) {
  const [past, now] = await Promise.all([treeAt(sha), currentTree()]);

  const pastMap = new Map(past.map(f => [f.path, f.sha]));
  const nowMap = new Map(now.map(f => [f.path, f.sha]));

  const missing = past.filter(f => !nowMap.has(f.path));
  const added = now.filter(f => !pastMap.has(f.path));
  const changed = past.filter(f => nowMap.has(f.path) && nowMap.get(f.path) !== f.sha);

  return { past, now, missing, added, changed };
}

async function cmdDiff(rest) {
  const [sha] = rest;
  if (!sha) fail('Usage : diff <sha>');

  const { past, now, missing, added, changed } = await compare(sha);

  stdout.write(`\nComparaison ${sha.slice(0, 8)} → état actuel\n\n`);
  stdout.write(`  dossiers clôturés : ${countDossiers(past)} → ${countDossiers(now)}\n\n`);

  for (const file of missing) stdout.write(`  disparu   ${file.path}\n`);
  for (const file of changed) stdout.write(`  modifié   ${file.path}\n`);
  for (const file of added) stdout.write(`  ajouté    ${file.path}\n`);

  if (!missing.length && !changed.length && !added.length) {
    stdout.write('  identique\n');
  }
  stdout.write('\n');
}

async function cmdRollback(rest, flags) {
  const [sha] = rest;
  if (!sha) fail('Usage : rollback <sha>');

  const { missing, added, changed } = await compare(sha);
  const toWrite = [...missing, ...changed];

  if (!toWrite.length && !added.length) {
    stdout.write('\nL\'état actuel est déjà identique à ce commit. Rien à faire.\n\n');
    return;
  }

  stdout.write(`\nRestauration de ${CONFIG.dataDir}/ vers ${sha.slice(0, 8)} :\n\n`);
  for (const file of toWrite) stdout.write(`  remettre   ${file.path}\n`);
  for (const file of added) stdout.write(`  retirer    ${file.path}\n`);
  stdout.write('\nAucun historique n\'est effacé : des commits sont ajoutés.\n\n');

  if (!flags.yes && !(await confirm('Confirmer la restauration ?'))) {
    stdout.write('Annulé.\n');
    return;
  }

  token = await resolveToken(flags);

  for (const file of toWrite) {
    const content = await fileAt(file.path, sha);
    if (content === null) {
      stdout.write(`  ignoré (illisible) ${file.path}\n`);
      continue;
    }

    const existing = await api(`/contents/${file.path}?ref=${CONFIG.dataBranch}`);
    const body = {
      message: `fix(data): restauration de ${file.path} depuis ${sha.slice(0, 8)}`,
      branch: CONFIG.dataBranch,
      content: Buffer.from(content, 'utf8').toString('base64')
    };
    if (existing && existing.sha) body.sha = existing.sha;

    await api(`/contents/${file.path}`, { method: 'PUT', body });
    stdout.write(`  remis      ${file.path}\n`);
  }

  for (const file of added) {
    const existing = await api(`/contents/${file.path}?ref=${CONFIG.dataBranch}`);
    if (!existing || !existing.sha) continue;

    await api(`/contents/${file.path}`, {
      method: 'DELETE',
      body: {
        message: `fix(data): retrait de ${file.path}, absent de ${sha.slice(0, 8)}`,
        branch: CONFIG.dataBranch,
        sha: existing.sha
      }
    });
    stdout.write(`  retiré     ${file.path}\n`);
  }

  stdout.write('\n  Restauration terminée.\n\n');
}

const { flags, rest } = parseFlags(argv.slice(2));
const [command, ...args] = rest;

const COMMANDS = {
  log: () => cmdLog(args),
  show: () => cmdShow(args),
  diff: () => cmdDiff(args),
  rollback: () => cmdRollback(args, flags)
};

if (!command || !COMMANDS[command]) {
  stdout.write(USAGE);
  exit(command ? 1 : 0);
}

try {
  await COMMANDS[command]();
  closePrompter();
  exit(0);
} catch (error) {
  fail(error.message);
}
