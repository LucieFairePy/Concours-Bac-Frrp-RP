// Service des actualités — documentation technique V4 §18.1.
//
// Les actualités vivent dans `news.json`, à côté des dossiers, sur la
// branche de données. Tant que ce fichier n'existe pas, les entrées de
// départ de `data/news.js` tiennent la place : l'accueil n'affiche donc
// jamais un panneau vide, et la direction n'a rien à initialiser à la main.
//
// Écrire une actualité est une action de direction : elle passe par la
// permission `settings`, et le journal des actions sensibles la note.

import * as store from './store.js';
import * as auth from './auth.js';
import { NEWS_SEED } from '../data/news.js';

const FILE = 'news.json';

function cleanText(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

/** Forme commune, quelle que soit l'origine de la donnée. */
export function normalize(item, index = 0) {
  return {
    id: cleanText(item.id, 80) || `actu-${index + 1}`,
    title: cleanText(item.title, 160),
    sector: cleanText(item.sector, 80),
    publishedAt: cleanText(item.publishedAt, 40) || new Date().toISOString(),
    imageAsset: cleanText(item.imageAsset, 60) || 'actualite-nuit',
    excerpt: cleanText(item.excerpt, 400),
    body: cleanText(item.body),
    author: cleanText(item.author, 120),
    visibility: item.visibility === 'direction' ? 'direction' : 'portail'
  };
}

function sort(list) {
  return [...list].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

/** Les actualités publiées, les plus récentes d'abord. `seeded` dit si le
 *  dépôt n'en contient encore aucune. */
export async function load() {
  let stored = null;
  try {
    stored = await store.readData(FILE);
  } catch (error) {
    stored = null;
  }

  const list = Array.isArray(stored) ? stored : null;
  if (!list || !list.length) {
    return { items: sort(NEWS_SEED.map(normalize)), seeded: true };
  }

  return { items: sort(list.map(normalize)), seeded: false };
}

/** Ce que le rôle courant a le droit de lire (§18.1, champ visibility). */
export function visibleTo(items) {
  if (auth.can('settings')) return items;
  return items.filter(item => item.visibility !== 'direction');
}

export async function get(id) {
  const { items } = await load();
  return items.find(item => item.id === id) || null;
}

/** Remplace la liste complète. Réservé aux rôles qui portent `settings`. */
export async function save(items, message) {
  if (!auth.can('settings')) throw new Error('Publier une actualité demande le droit « paramètres ».');

  const clean = sort(items.map(normalize));
  await store.writeData(FILE, clean, message || 'chore(data): actualités BAC 75 N');
  return clean;
}

export async function publish(item) {
  const { items, seeded } = await load();
  const base = seeded ? [] : items;
  const entry = normalize({ ...item, id: item.id || `actu-${Date.now().toString(36)}` });
  const next = [...base.filter(known => known.id !== entry.id), entry];
  return save(next, `feat(data): actualité « ${entry.title} »`);
}

export async function remove(id) {
  // Retirer une actualité de départ revient à publier la liste restante :
  // le dépôt prend alors le pas sur les entrées du kit.
  const { items } = await load();
  return save(items.filter(item => item.id !== id), `chore(data): actualité ${id} retirée`);
}
