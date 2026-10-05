export const KDF = {
  name: 'PBKDF2',
  hash: 'SHA-256',
  iterations: 310000
};

export const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const CODE_GROUPS = 3;
export const CODE_GROUP_SIZE = 4;

export function toBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(value) {
  const binary = atob(String(value).replace(/\s/g, ''));
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}

export function normalizeCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/^BAC/, '');
}

export function formatCode(raw) {
  const groups = [];
  for (let i = 0; i < raw.length; i += CODE_GROUP_SIZE) {
    groups.push(raw.slice(i, i + CODE_GROUP_SIZE));
  }
  return `BAC-${groups.join('-')}`;
}

export function generateCode() {
  const length = CODE_GROUPS * CODE_GROUP_SIZE;
  const bytes = new Uint8Array(length);
  const alphabet = CODE_ALPHABET;
  const limit = 256 - (256 % alphabet.length);

  let raw = '';
  while (raw.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (raw.length === length) break;
      if (byte >= limit) continue;
      raw += alphabet[byte % alphabet.length];
    }
  }

  return formatCode(raw);
}

async function deriveKey(code, salt, kdf) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalizeCode(code)),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: kdf.iterations,
      hash: kdf.hash
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function sealPayload(payload, code, kdf = KDF) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(code, salt, kdf);

  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );

  return {
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(sealed))
  };
}

export async function openPayload(entry, code, kdf = KDF) {
  const key = await deriveKey(code, fromBase64(entry.salt), kdf);

  let opened;
  try {
    opened = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(entry.iv) },
      key,
      fromBase64(entry.data)
    );
  } catch (error) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(opened));
  } catch (error) {
    return null;
  }
}
