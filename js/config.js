export const CONFIG = {
  owner: 'LucieFairePy',
  repo: 'Concours-Bac-Frrp-RP',
  dataBranch: 'data',
  dataDir: 'data',
  accessFile: 'access.json',
  autosaveDelay: 30000,
  sessionHours: 12,
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
