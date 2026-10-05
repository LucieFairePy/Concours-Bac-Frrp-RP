# Concours BAC — France Roleplay

### ▶ [Ouvrir le site](https://luciefairepy.github.io/Concours-Bac-Frrp-RP/)

<https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>

Outil fictif d'évaluation pour le concours d'intégration de la Brigade Anti-Criminalité.
Site statique hébergé sur GitHub Pages, dossiers stockés dans ce dépôt sur la branche `data`.

> Document fictif — France Roleplay — sans valeur administrative réelle.

---

## Utilisation

1. Ouvrir <https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>
2. Coller son **code personnel** dans la modale d'accès, ou cliquer
   **Consulter sans code** pour la lecture seule
3. Dérouler les 9 étapes : Identité → Théorie → Radio → Situations → Physique →
   Tir → Correction → Résultats → Fiche finale
4. **Imprimer / Enregistrer en PDF** pour sortir le dossier 8 pages A4
5. **CLÔTURER DÉFINITIVEMENT** écrit le dossier dans le dépôt et le verrouille

Le brouillon en cours est enregistré automatiquement toutes les 30 secondes, à
chaque changement d'étape, et quand l'onglet passe en arrière-plan. L'état de
l'enregistrement s'affiche dans l'en-tête. Le bouton **Enregistrer** force la
sauvegarde.

Un dossier commencé sur un ordinateur se reprend sur un autre : le brouillon
suit le code personnel, pas la machine. Rien n'est stocké dans le navigateur.

---

## Obtenir un code personnel

Chaque examinateur a son propre code, révocable sans toucher aux autres.

1. Aller sur <https://github.com/settings/personal-access-tokens/new>
2. **Token name** : `concours-bac`
3. **Resource owner** : `LucieFairePy`
4. **Expiration** : au choix
5. **Repository access** : `Only select repositories` → `Concours-Bac-Frrp-RP`
6. **Permissions → Repository permissions → Contents** : `Read and write`
7. **Generate token**, puis copier le code (il commence par `github_pat_`)

Le code se colle dans la modale d'accès du site. La case
« Garder le code jusqu'à la fermeture de cet onglet » évite de le ressaisir à
chaque rechargement.

> Un code ne donne que le droit d'écrire dans ce dépôt. Il reste lisible par la
> personne qui le détient : chacun doit avoir le sien. Un code se révoque depuis
> les réglages GitHub.

### Déclarer un nouvel examinateur

Éditer `data/users.json` **sur la branche `data`** :

```json
[
  { "login": "LucieFairePy", "name": "BOUSSERE Kevin", "grade": "Lieutenant", "role": "directeur" },
  { "login": "compte-github", "name": "LAURENT Cyril", "grade": "Brigadier", "role": "examinateur" }
]
```

`login` est le nom de compte GitHub. Un compte absent de cette liste voit son
code refusé. Si la liste est vide, tout code valide est accepté.

---

## Barème

Total sur **1000 points**.

| Épreuve | Points |
|---|---|
| Questionnaire théorique | 100 |
| Radio & coordination | 100 |
| Mises en situation | 300 |
| Physique & cognitif | 200 |
| Tir | 300 |

Propositions automatiques : ≥ 800 `RETENU`, ≥ 650 `RETENU SOUS RÉSERVE`,
en dessous `RECALÉ`. L'examinateur garde la décision finale.

Chaque réponse reçoit une **suggestion automatique** basée sur la complétude.
Si l'examinateur laisse la note vide, la suggestion est utilisée dans le calcul.

Éliminatoires : triche, refus injustifié d'une consigne, abandon injustifié,
2 cibles otage touchées ou plus. Une cible otage touchée plafonne le tir à 210
et interdit un `RETENU` sans réserve.

---

## Stockage des données

GitHub sert de base de données via l'API Contents. Aucun service externe,
aucun `localStorage`.

| Branche | Contenu | Déployée |
|---|---|---|
| `main` | le site | oui, sur GitHub Pages |
| `data` | les dossiers | non |

```
data/
  settings.json           direction BAC, partagée par tous
  users.json              examinateurs autorisés
  dossiers/index.json     index des dossiers clôturés
  dossiers/<ID>.json      un fichier par dossier clôturé
  drafts/<login>.json     brouillon en cours de chaque examinateur
```

| Opération | Requête | Code requis |
|---|---|---|
| Lire les dossiers, l'index, les paramètres | `GET /contents/...?ref=data` | non |
| Écrire un brouillon, clôturer, modifier les paramètres | `PUT /contents/...` | oui |

Un fichier par dossier et un brouillon par examinateur : aucun conflit
d'écriture possible. Les deux fichiers partagés (`settings.json`,
`dossiers/index.json`) utilisent un verrou optimiste par `sha` avec jusqu'à
5 tentatives.

Les données vivent sur une branche séparée parce que `main` est la source de
GitHub Pages : écrire les brouillons sur `main` déclencherait une
reconstruction du site toutes les 30 secondes, et les builds Pages sont
limités en nombre par heure.

Le seul usage de `sessionStorage` est optionnel et sert à garder le code
personnel le temps de l'onglet.

---

## Architecture

```
index.html                  coquille HTML (header, 3 vues, points de montage)
.nojekyll                   désactive Jekyll
serve.cmd                   serveur local pour le développement
.github/workflows/pages.yml déploiement GitHub Pages

assets/img/                 4 photos du dossier final

css/
  base.css                  variables, reset, typo, boutons, champs, tableaux
  layout.css                header, nav, grille 12 colonnes, onglets, progression
  components.css            cards, questions, énoncés, scores, bannières, modale
  dossier.css               pages A4 du dossier final (.dossier-page, .dp-*)
  cover.css                 page 1 du dossier (.cover-v2)
  print.css                 toutes les règles @media print

js/
  config.js                 dépôt GitHub, branche de données, délai d'autosave
  app.js                    contrôleur, autosave, window.app (handlers du HTML)

  data/
    questions.js            225 questions du questionnaire théorique
    radio.js                exercice radio
    scenarios.js            5 mises en situation
    steps.js                les 9 étapes du parcours

  core/
    dom.js                  helpers DOM, échappement HTML, initiales
    github-api.js           client API Contents GitHub (lecture/écriture/retry)
    store.js                couche de persistance (driver github ou mémoire)
    auth.js                 session examinateur, code personnel, rôles
    state.js                modèle du dossier, création, migration, mutations

  scoring/
    auto.js                 suggestions automatiques par épreuve
    totals.js               notes finales, total /1000, décision, couleurs

  views/
    navigation.js           onglets, étapes, barre de progression, validation
    passage.js              formulaire de passage (identité → tir)
    correction.js           page de correction et saisie des notes
    results.js              récapitulatif, incidents, décision finale
    dossier.js              fiche finale, 8 pages A4
    history.js              liste des dossiers clôturés
    settings.js             paramètres partagés + état de session
    login.js                modale d'accès examinateur
```

JavaScript natif, modules ES, aucune dépendance et aucune étape de build.

---

## Modes de fonctionnement

| Situation | Comportement |
|---|---|
| Code personnel valide | lecture et écriture, brouillon partagé, clôture possible |
| « Consulter sans code » | lecture seule : historique et dossiers clôturés visibles |
| `js/config.js` sans `owner`/`repo` | mode local : le site marche, les dossiers restent dans l'onglet |

---

## Développement local

Le site utilise des modules ES, que les navigateurs refusent de charger depuis
`file://`. Ouvrir `index.html` par double-clic donne donc une erreur CORS et
`app is not defined`. Il faut passer par HTTP.

Double-cliquer sur **`serve.cmd`** : le serveur démarre et le navigateur s'ouvre
sur <http://127.0.0.1:8777/>. Fermer la fenêtre arrête le serveur.

En ligne de commande :

```bash
python -m http.server 8777
```

Sur GitHub Pages la question ne se pose pas, le site est servi en HTTPS.

---

## Déploiement

Tout push sur `main` relance le workflow `.github/workflows/pages.yml` qui
publie le site. Rien à faire à la main.

La branche `data` n'est pas déployée : y pousser ne reconstruit pas le site.

---

## Licence

Voir [LICENSE](LICENSE).
