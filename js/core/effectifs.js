// Effectifs BAC 75 N — documentation technique V4 §18.4.
//
// Le panneau « Effectifs » de l'accueil affiche Officiers, Brigadiers,
// Gardiens de la paix, Policiers adjoints et le total. Ces nombres ne sont
// pas écrits dans la page : ils sont comptés sur les accès réellement
// ouverts dans le portail, par le grade porté par chaque accès.
//
// Un grade inconnu n'est pas perdu : il tombe dans « Autres », visible, au
// lieu d'être silencieusement arrondi.

import * as roster from './roster.js';

export const CORPS = [
  {
    id: 'officiers',
    label: 'Officiers',
    match: ['commissaire', 'commandant', 'capitaine', 'lieutenant', 'officier']
  },
  {
    id: 'brigadiers',
    label: 'Brigadiers',
    match: ['brigadier', 'major']
  },
  {
    id: 'gardiens',
    label: 'Gardiens de la paix',
    match: ['gardien', 'gpx', 'sous-brigadier']
  },
  {
    id: 'adjoints',
    label: 'Policiers adjoints',
    match: ['adjoint de securite', 'policier adjoint', 'ads', 'adjoint']
  }
];

function fold(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function corpsOf(grade) {
  const text = fold(grade);
  if (!text) return 'autres';

  // « Policier adjoint » contient « adjoint » comme « directeur adjoint » :
  // les corps sont donc testés du plus précis au plus large, et le premier
  // qui reconnaît le grade l'emporte.
  for (const corps of CORPS) {
    if (corps.match.some(needle => text.includes(needle))) return corps.id;
  }
  return 'autres';
}

/**
 * Compte les accès par corps. Renvoie aussi `readable: false` quand la
 * liste des accès n'a pas pu être lue — la page affiche alors le panneau
 * avec son message, au lieu d'inventer des nombres.
 */
export async function counts() {
  let entries = [];
  try {
    entries = await roster.list();
  } catch (error) {
    return { readable: false, error: error.message, lines: [], total: 0 };
  }

  const tally = { autres: 0 };
  for (const corps of CORPS) tally[corps.id] = 0;

  for (const entry of entries) {
    const grade = entry.grade || roster.identity(entry).grade;
    tally[corpsOf(grade)] += 1;
  }

  const lines = CORPS.map(corps => ({ id: corps.id, label: corps.label, count: tally[corps.id] }));
  if (tally.autres) lines.push({ id: 'autres', label: 'Autres grades', count: tally.autres });

  return { readable: true, error: null, lines, total: entries.length };
}
