import { createInterface } from 'node:readline';
import { stdin, stdout, env, exit } from 'node:process';

stdout.on('error', error => {
  exit(error && error.code === 'EPIPE' ? 0 : 1);
});

let prompter = null;
let masked = false;
let piped = null;

function getPrompter() {
  if (prompter) return prompter;

  prompter = createInterface({ input: stdin, output: stdout, terminal: true });

  const write = chunk => stdout.write(chunk);
  prompter._writeToOutput = function writeToOutput(chunk) {
    if (!masked) return write(chunk);
    if (masked.prompt && String(chunk).includes(masked.prompt)) return write(masked.prompt);
    return undefined;
  };

  return prompter;
}

export function closePrompter() {
  if (prompter) {
    prompter.close();
    prompter = null;
  }
}

async function readPipedLines() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
}

export async function ask(question, hidden) {
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

export function fail(message) {
  stdout.write(`\nErreur : ${message}\n`);
  closePrompter();
  exit(1);
}

export async function confirm(question) {
  const answer = await ask(`${question} [oui/non] `, false);
  return /^(o|oui|y|yes)$/i.test(answer);
}

export async function resolveToken(flags, varName = 'BAC_TOKEN', label = 'Jeton d\'écriture du dépôt : ') {
  const provided = typeof flags.token === 'string' ? flags.token : env[varName];
  const token = (provided || await ask(label, true)).trim();

  if (!token) fail('Aucun jeton fourni.');
  if (!/^(github_pat_|ghp_)/.test(token)) {
    fail('Ce jeton ne ressemble pas à un jeton GitHub (github_pat_... ou ghp_...).');
  }

  return token;
}

export function parseFlags(args) {
  const flags = {};
  const rest = [];

  for (const arg of args) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (match) flags[match[1]] = match[2] ?? true;
    else rest.push(arg);
  }

  return { flags, rest };
}
