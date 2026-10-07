// Actualités d'accueil — documentation technique V4 §18.1.
//
// Le panneau « Actualités BAC 75 N » n'est pas une image : il lit des
// données. Tant que la direction n'a rien publié, ces trois entrées de
// départ tiennent la place et montrent la forme attendue. Dès qu'une
// actualité est écrite depuis l'Administration, le fichier `news.json` du
// dépôt prend le dessus et ces valeurs ne servent plus.
//
// Champs d'une actualité (§18.1) :
//   id, title, sector, publishedAt, imageAsset, excerpt, body, author,
//   visibility ('portail' pour tout le monde, 'direction' sinon).

export const NEWS_VISIBILITY = {
  portail: { id: 'portail', label: 'Tout le portail' },
  direction: { id: 'direction', label: 'Direction seulement' }
};

export const NEWS_SEED = [
  {
    id: 'seed-controle-nuit',
    title: 'Dispositif de contrôle renforcé sur le secteur nuit',
    sector: 'Secteur Nord — nuit',
    publishedAt: '2026-10-01T21:30:00.000Z',
    imageAsset: 'actualite-nuit',
    excerpt: 'Trois équipages engagés sur le dispositif de contrôle, consignes de sécurité rappelées au briefing.',
    body: 'Le dispositif de contrôle de nuit est reconduit sur le secteur Nord. '
      + 'Les consignes rappelées au briefing portent sur la tenue du périmètre, '
      + 'l’annonce radio systématique avant engagement et le compte rendu stabilisé '
      + 'au chef de groupe. Toute interpellation fait l’objet d’un compte rendu écrit.',
    author: 'Direction BAC 75 N',
    visibility: 'portail'
  },
  {
    id: 'seed-interpellation',
    title: 'Retour d’expérience — interpellation en zone fréquentée',
    sector: 'Formation',
    publishedAt: '2026-09-28T18:05:00.000Z',
    imageAsset: 'actualite-interpellation',
    excerpt: 'Le débriefing de l’intervention sert de support à la mise en situation n°3 du concours.',
    body: 'L’intervention a été rejouée en débriefing : analyse de la prise de décision, '
      + 'place de chaque équipier, gestion du public et compte rendu. '
      + 'Le déroulé sert désormais de support à la mise en situation n°3 du concours '
      + 'et à l’exercice de commandement de la formation Chef de Groupe.',
    author: 'Cellule formation',
    visibility: 'portail'
  },
  {
    id: 'seed-session-concours',
    title: 'Ouverture de la session de concours d’intégration',
    sector: 'Concours',
    publishedAt: '2026-09-20T09:00:00.000Z',
    imageAsset: 'concours',
    excerpt: 'Les dossiers de candidature sont ouverts : théorie, radio, situations, physique et tir RP.',
    body: 'La session de concours d’intégration est ouverte. Le parcours complet '
      + 'reste noté sur 1000 points : théorie, radio, mises en situation, '
      + 'physique / cognitif et tir RP. La décision finale appartient à '
      + 'l’examinateur ; le portail ne fait que proposer une suggestion motivée.',
    author: 'Direction BAC 75 N',
    visibility: 'portail'
  }
];
