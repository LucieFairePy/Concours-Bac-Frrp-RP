export const CONFIG = {
  owner: 'LucieFairePy',
  repo: 'Concours-Bac-Frrp-RP',
  dataBranch: 'data',
  dataDir: 'data',
  accessFile: 'access.json',
  autosaveDelay: 30000,
  sessionHours: 12,
  // Seuils de suggestion du prototype — §8.6 et §11.3. Centralisés ici,
  // ajustables depuis la page Paramètres, jamais recopiés dans un module.
  defaultThresholds: {
    bac: { retenu: 800, reserve: 650 },
    cdg: { qualifie: 800, reserve: 650, ajourne: 500 }
  },

  // Barème de l'épreuve physique / cognitive — §8.4. Les seuils sont des
  // paramètres internes RP : ils vivent ici, pas dispersés en dur dans les
  // modules de notation, et la direction peut les régler dans Paramètres.
  //
  //   `fort` / `bon` / `base` : les trois paliers de chaque mesure
  //   `points`                : ce que vaut chaque palier, puis le plancher
  //
  // Référence prototype : 1200 m (3 tours de 400 m) après un tour
  // d'échauffement, 30 pompes, 50 abdos, 1 min 50 de gainage.
  defaultPhysical: {
    // Temps en secondes : plus c'est bas, mieux c'est.
    run: { fort: 300, bon: 330, base: 390, points: [50, 45, 38, 28] },
    // Répétitions et durées : plus c'est haut, mieux c'est.
    push: { fort: 45, bon: 38, base: 30, points: [35, 32, 27], ratio: 0.8, cap: 25 },
    abs: { fort: 70, bon: 60, base: 50, points: [35, 32, 27], ratio: 0.5, cap: 25 },
    plank: { fort: 180, bon: 150, base: 110, points: [30, 27, 23], ratio: 1 / 6, cap: 20 },
    // Parties rédigées de l'épreuve, notées comme une réponse ouverte.
    pursuit: 30,
    cog: 20,
    max: 200
  },
  defaultCommand: {
    dg: 'Lieutenant',
    dn: 'BOUSSERE Kevin',
    ag: 'Brigadier',
    an: 'LAURENT Cyril'
  }
};

export function isConfigured() {
  return Boolean(CONFIG.owner && CONFIG.repo);
}
