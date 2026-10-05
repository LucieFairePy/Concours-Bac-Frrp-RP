import { createInterface } from 'node:readline';
import { stdin, stdout, argv, env, exit } from 'node:process';

import { CONFIG } from '../js/config.js';
import * as gh from '../js/core/github-api.js';
import { sealPayload, openPayload, generateCode, normalizeCode, formatCode, KDF } from '../js/core/crypto.js';

const ACCESS_PATH = `${CONFIG.dataDir}/${CONFIG.accessFile}`;

const USAGE = `
Gestion des accès — ${CONFIG.owner}/${CONFIG.repo}

  node tools/access.mjs list
  node tools/access.mjs add <id> <grade> <nom> [--role=examinateur] [--code=BAC-...]
  node tools/access.mjs recode <id>
  node tools/access.mjs remove <id>
  node tools/access.mjs rotate
  node tools/access.mjs check <id>

Le jeton d'écriture est lu dans --token=..., puis dans BAC_TOKEN, sinon il est demandé.
Il doit être un jeton GitHub à portée restreinte sur ce dépôt uniquement,
avec la permission « Contents: Read and write ».

  add      crée un accès et affiche son code une seule fois
  recode   remplace le code d'une personne, le jeton stocké ne change pas
  remove   retire l'accès d'une personne
  rotate   remplace le jeton stocké pour tout le monde, les codes restent valables
  check    vérifie qu'un code ouvre bien son entrée
`;

function parseFlags(args) {
  const flags = {};
  const rest = [];
  for (const arg of args) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (match) flags[match[1]] = match[2] ?? true;
    else rest.push(arg);
  }
  return { flags, rest };
}

let prompter = null;
let masked = false;

function getPrompter() {
  if (prompter) return prompter;

  const interactive = Boolean(stdin.isTTY);
  prompter = createInterface({ input: stdin, output: stdout, terminal: interactive });

  if (interactive) {
    const write = chunk => stdout.write(chunk);
    prompter._writeToOutput = function writeToOutput(chunk) {
      if (!masked) return write(chunk);
      if (masked.prompt && String(chunk).includes(masked.prompt)) return write(masked.prompt);
      return undefined;
    };
  }

  return prompter;
}

function closePrompter() {
  if (prompter) {
    prompter.close();
    prompter = null;
  }
}

let piped = null;

async function readPipedLines() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
}

async function ask(question, hidden) {
  if (!stdin.isTTY) {
    if (!piped) piped = await readPipedLines();
    const answer = (piped.shift() ?? '').trim();
    stdout.write(`${question}${hidden ? '' : answer}\n`);
    return answer;
  }

  const rl = getPrompter();
  masked = hidden ? { prompt: question } : false;

  return new Promise(resolve => {
    rl.question(question, answer => {
      if (hidden) stdout.write('\n');
      masked = false;
      resolve(answer.trim());
    });
  });
}

async function resolveToken(flags) {
  const provided = typeof flags.token === 'string' ? flags.token : env.BAC_TOKEN;
  const token = (provided || await ask('Jeton d\'écriture du dépôt : ', true)).trim();
  if (!token) fail('Aucun jeton fourni.');
  if (!/^(github_pat_|ghp_)/.test(token)) {
    fail('Ce jeton ne ressemble pas à un jeton GitHub (github_pat_... ou ghp_...).');
  }
  return token;
}

function fail(message) {
  stdout.write(`\nErreur : ${message}\n`);
  closePrompter();
  exit(1);
}

async function readAccess() {
  const file = await gh.readJson(ACCESS_PATH);
  if (file) return file.value;
  return { version: 1, kdf: KDF, entries: [] };
}

async function writeAccess(value, message) {
  await gh.updateJson(ACCESS_PATH, () => value, message);
}

const SLUG = () => `${CONFIG.owner}/${CONFIG.repo}`;

async function probeWrite(token) {
  const response = await fetch(
    `https://api.github.com/repos/${SLUG()}/contents/${CONFIG.dataDir}/settings.json`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: 'probe',
        branch: CONFIG.dataBranch,
        content: 'e30K',
        sha: '0'.repeat(40)
      })
    }
  );
  return response.status;
}

async function verifyToken(token) {
  gh.setToken(token);

  let account = null;
  try {
    account = await gh.viewer();
  } catch (error) {
    if (error.status === 401) fail('Jeton refusé par GitHub.');
  }

  const status = await probeWrite(token);

  if (status === 401) fail('Jeton refusé par GitHub.');
  if (status === 403) fail(`Le jeton n'a pas le droit d'écriture sur ${SLUG()} (Contents: Read and write).`);
  if (status === 404) {
    fail(`Le jeton ne voit pas ${SLUG()}, ou la branche ${CONFIG.dataBranch} est absente.`);
  }
  if (status !== 409 && status !== 422) {
    stdout.write(`Avertissement : sonde d'écriture inattendue (HTTP ${status}).\n`);
  }

  return (account && account.login) || 'jeton restreint';
}

function printRoster(access) {
  if (!access.entries.length) {
    stdout.write('Aucun accès déclaré.\n');
    return;
  }
  stdout.write(`${access.entries.length} accès sur la branche ${CONFIG.dataBranch} :\n\n`);
  for (const entry of access.entries) {
    stdout.write(`  ${entry.id.padEnd(14)} ${entry.label.padEnd(32)} ${entry.role || 'examinateur'}\n`);
  }
  stdout.write('\n');
}

async function cmdList() {
  printRoster(await readAccess());
}

async function cmdAdd(rest, flags) {
  const [id, grade, ...nameParts] = rest;
  const name = nameParts.join(' ');
  if (!id || !grade || !name) fail('Usage : add <id> <grade> <nom>');
  if (!/^[a-z0-9-]+$/.test(id)) fail('L\'identifiant doit être en minuscules, sans espace.');

  const token = await resolveToken(flags);
  const owner = await verifyToken(token);
  stdout.write(`Jeton valide (compte ${owner}).\n`);

  const access = await readAccess();
  if (access.entries.some(entry => entry.id === id)) {
    fail(`L'accès « ${id} » existe déjà. Utilise recode pour changer son code.`);
  }

  const code = typeof flags.code === 'string' ? formatCode(normalizeCode(flags.code)) : generateCode();
  const role = typeof flags.role === 'string' ? flags.role : 'examinateur';
  const sealed = await sealPayload({ token, name, grade, role }, code, access.kdf || KDF);

  access.entries.push({ id, label: `${grade} ${name}`, role, ...sealed });
  await writeAccess(access, `chore(access): ajout de ${grade} ${name}`);

  stdout.write(`\n  Accès créé pour ${grade} ${name}\n`);
  stdout.write(`  Identifiant : ${id}\n`);
  stdout.write(`  Code        : ${code}\n\n`);
  stdout.write('  Transmets ce code à la personne par un canal privé.\n');
  stdout.write('  Il n\'est pas stocké en clair et ne peut pas être réaffiché.\n\n');
}

async function cmdRecode(rest, flags) {
  const [id] = rest;
  if (!id) fail('Usage : recode <id>');

  const token = await resolveToken(flags);
  await verifyToken(token);

  const access = await readAccess();
  const entry = access.entries.find(item => item.id === id);
  if (!entry) fail(`Aucun accès « ${id} ».`);

  const code = typeof flags.code === 'string' ? formatCode(normalizeCode(flags.code)) : generateCode();
  const grade = entry.label.split(' ')[0];
  const name = entry.label.split(' ').slice(1).join(' ');
  const sealed = await sealPayload(
    { token, name, grade, role: entry.role || 'examinateur' },
    code,
    access.kdf || KDF
  );

  Object.assign(entry, sealed);
  await writeAccess(access, `chore(access): nouveau code pour ${entry.label}`);

  stdout.write(`\n  Nouveau code pour ${entry.label}\n`);
  stdout.write(`  Code : ${code}\n\n`);
  stdout.write('  L\'ancien code ne fonctionne plus.\n\n');
}

async function cmdRemove(rest, flags) {
  const [id] = rest;
  if (!id) fail('Usage : remove <id>');

  const token = await resolveToken(flags);
  await verifyToken(token);

  const access = await readAccess();
  const entry = access.entries.find(item => item.id === id);
  if (!entry) fail(`Aucun accès « ${id} ».`);

  access.entries = access.entries.filter(item => item.id !== id);
  await writeAccess(access, `chore(access): retrait de ${entry.label}`);

  stdout.write(`\n  Accès retiré : ${entry.label}\n\n`);
  stdout.write('  Son code ne fonctionne plus. Si cette personne avait pu extraire\n');
  stdout.write('  le jeton, lance « rotate » avec un jeton neuf pour couper l\'accès.\n\n');
}

async function cmdRotate(rest, flags) {
  const token = await resolveToken(flags);
  const owner = await verifyToken(token);
  stdout.write(`Nouveau jeton valide (compte ${owner}).\n`);

  const access = await readAccess();
  if (!access.entries.length) fail('Aucun accès à mettre à jour.');

  stdout.write('\nPour chaque personne, entre son code actuel (vide = accès supprimé).\n\n');

  const kept = [];
  for (const entry of access.entries) {
    const code = await ask(`  ${entry.label} — code actuel : `, true);
    if (!code) {
      stdout.write('    retiré\n');
      continue;
    }

    const payload = await openPayload(entry, code, access.kdf || KDF);
    if (!payload) {
      stdout.write('    code incorrect, accès retiré\n');
      continue;
    }

    const sealed = await sealPayload({ ...payload, token }, code, access.kdf || KDF);
    kept.push({ id: entry.id, label: entry.label, role: entry.role, ...sealed });
    stdout.write('    mis à jour\n');
  }

  access.entries = kept;
  await writeAccess(access, 'chore(access): rotation du jeton de dépôt');
  stdout.write(`\n  ${kept.length} accès conservés avec le nouveau jeton.\n`);
  stdout.write('  Révoque l\'ancien jeton sur https://github.com/settings/tokens\n\n');
}

async function cmdCheck(rest) {
  const [id] = rest;
  if (!id) fail('Usage : check <id>');

  const access = await readAccess();
  const entry = access.entries.find(item => item.id === id);
  if (!entry) fail(`Aucun accès « ${id} ».`);

  const code = await ask(`Code de ${entry.label} : `, true);
  const payload = await openPayload(entry, code, access.kdf || KDF);

  if (!payload) {
    stdout.write('\n  Code incorrect.\n\n');
    closePrompter();
    exit(1);
  }

  stdout.write(`\n  Code valide — ${payload.grade} ${payload.name} (${payload.role})\n`);
  stdout.write(`  Jeton scellé : ${payload.token.slice(0, 11)}…${payload.token.slice(-4)}\n\n`);
}

const { flags, rest } = parseFlags(argv.slice(2));
const [command, ...args] = rest;

const COMMANDS = {
  list: () => cmdList(),
  add: () => cmdAdd(args, flags),
  recode: () => cmdRecode(args, flags),
  remove: () => cmdRemove(args, flags),
  rotate: () => cmdRotate(args, flags),
  check: () => cmdCheck(args)
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
