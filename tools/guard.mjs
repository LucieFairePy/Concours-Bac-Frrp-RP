import { stdout, argv, exit } from 'node:process';

import { CONFIG } from '../js/config.js';
import { fail, closePrompter, resolveToken, parseFlags } from './prompt.mjs';

const API = 'https://api.github.com';
const SLUG = `${CONFIG.owner}/${CONFIG.repo}`;

const PROTECTED = ['main', CONFIG.dataBranch];

const USAGE = `
Protection des branches — ${SLUG}

  node tools/guard.mjs status
  node tools/guard.mjs apply
  node tools/guard.mjs test

  status   affiche les protections en place
  apply    interdit la suppression de branche et la réécriture d'historique
           sur ${PROTECTED.join(' et ')}
  test     vérifie qu'un jeton d'écriture ne peut plus réécrire l'historique

apply exige un jeton avec « Administration: Read and write » sur ce dépôt,
lu dans --admin-token=... ou BAC_ADMIN_TOKEN. C'est le seul usage de ce droit :
révoque ce jeton juste après.

test exige le jeton d'écriture habituel, lu dans --token=... ou BAC_TOKEN.
`;

function rulesetFor(branch) {
  return {
    name: `protection-${branch}`,
    target: 'branch',
    enforcement: 'active',
    conditions: { ref_name: { include: [`refs/heads/${branch}`], exclude: [] } },
    rules: [{ type: 'deletion' }, { type: 'non_fast_forward' }],
    bypass_actors: []
  };
}

function bust(path) {
  if (path.includes('?')) return `${path}&t=${Date.now()}`;
  return `${path}?t=${Date.now()}`;
}

async function api(token, path, options = {}) {
  const target = (options.method || 'GET') === 'GET' ? bust(path) : path;

  const response = await fetch(`${API}/repos/${SLUG}${target}`, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  return { status: response.status, ok: response.ok, payload };
}

async function cmdStatus(flags) {
  const token = typeof flags['admin-token'] === 'string' ? flags['admin-token'] : null;
  const { status, payload } = await api(token, '/rulesets');

  if (status === 403 && !token) {
    fail(
      'Quota de l\'API GitHub atteint pour les requêtes anonymes (60 par heure et par IP).\n'
      + '        Relance avec --admin-token=... pour lire les protections.'
    );
  }

  if (status === 404 || !Array.isArray(payload)) {
    fail(`Lecture des protections impossible (HTTP ${status}).`);
  }

  if (!payload.length) {
    stdout.write('\n  Aucune protection en place. Les branches peuvent être supprimées\n');
    stdout.write('  et leur historique réécrit par tout porteur du jeton d\'écriture.\n\n');
    return;
  }

  stdout.write(`\n  ${payload.length} protection(s) :\n\n`);
  for (const entry of payload) {
    const detail = await api(token, `/rulesets/${entry.id}`);
    const rules = detail.payload && Array.isArray(detail.payload.rules)
      ? detail.payload.rules.map(r => r.type).join(', ')
      : '?';
    const refs = detail.payload && detail.payload.conditions
      ? detail.payload.conditions.ref_name.include.join(' ')
      : '?';
    stdout.write(`    ${entry.name.padEnd(22)} ${entry.enforcement.padEnd(8)} ${refs}\n`);
    stdout.write(`    ${''.padEnd(22)} règles : ${rules}\n\n`);
  }
}

async function cmdApply(flags) {
  const token = await resolveToken(
    flags,
    'BAC_ADMIN_TOKEN',
    'Jeton avec Administration: write : '
  );

  const existing = await api(token, '/rulesets');
  if (existing.status === 403) {
    fail('Ce jeton n\'a pas « Administration: Read and write » sur ce dépôt.');
  }
  if (!Array.isArray(existing.payload)) {
    fail(`Lecture des protections impossible (HTTP ${existing.status}).`);
  }

  for (const branch of PROTECTED) {
    const wanted = rulesetFor(branch);
    const already = existing.payload.find(entry => entry.name === wanted.name);

    const result = already
      ? await api(token, `/rulesets/${already.id}`, { method: 'PUT', body: wanted })
      : await api(token, '/rulesets', { method: 'POST', body: wanted });

    if (!result.ok) {
      const message = result.payload && result.payload.message ? result.payload.message : '';
      fail(`Protection de ${branch} refusée (HTTP ${result.status}) ${message}`);
    }

    stdout.write(`  ${branch.padEnd(6)} protégée — suppression et réécriture d'historique interdites\n`);
  }

  stdout.write('\n  Révoque maintenant le jeton d\'administration :\n');
  stdout.write('  https://github.com/settings/personal-access-tokens\n\n');
}

async function cmdTest(flags) {
  const token = await resolveToken(flags);
  const branch = CONFIG.dataBranch;

  const head = await api(token, `/git/ref/heads/${branch}`);
  if (!head.ok) fail(`Branche ${branch} illisible (HTTP ${head.status}).`);

  const tip = head.payload.object.sha;
  const commit = await api(token, `/commits/${tip}`);
  const parent = commit.payload && commit.payload.parents && commit.payload.parents[0];

  if (!parent) {
    fail(`La branche ${branch} n'a qu'un commit : test de réécriture impossible.`);
  }

  stdout.write(`\n  Branche ${branch} au commit ${tip.slice(0, 8)}\n`);
  stdout.write(`  Tentative de recul forcé vers ${parent.sha.slice(0, 8)}…\n\n`);

  const attempt = await api(token, `/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: { sha: parent.sha, force: true }
  });

  if (!attempt.ok) {
    const message = attempt.payload && attempt.payload.message ? attempt.payload.message : '';
    stdout.write(`  Refusé (HTTP ${attempt.status}) ${message}\n`);
    stdout.write('  La protection fonctionne : rien n\'a bougé.\n\n');
    return;
  }

  stdout.write('  ACCEPTÉ — la protection ne bloque pas ce jeton.\n');
  stdout.write('  Remise en place immédiate…\n');

  const undo = await api(token, `/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: { sha: tip, force: true }
  });

  stdout.write(undo.ok
    ? `  Branche remise sur ${tip.slice(0, 8)}.\n\n`
    : `  ÉCHEC DE LA REMISE EN PLACE. Restaure à la main sur ${tip}.\n\n`);
}

const { flags, rest } = parseFlags(argv.slice(2));
const [command] = rest;

const COMMANDS = {
  status: () => cmdStatus(flags),
  apply: () => cmdApply(flags),
  test: () => cmdTest(flags)
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
