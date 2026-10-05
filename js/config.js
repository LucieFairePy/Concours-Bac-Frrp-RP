export const CONFIG = {
  owner: 'LucieFairePy',
  repo: 'Concours-Bac-Frrp-RP',
  dataBranch: 'data',
  dataDir: 'data',
  autosaveDelay: 30000,
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
