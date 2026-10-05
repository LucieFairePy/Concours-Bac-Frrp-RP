# Concours BAC — France Roleplay

### ▶ [Ouvrir le site](https://luciefairepy.github.io/Concours-Bac-Frrp-RP/)

<https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>

Outil fictif d'évaluation pour le concours d'intégration de la Brigade Anti-Criminalité.
Site statique hébergé sur GitHub Pages, dossiers stockés dans ce dépôt sur la branche `data`.

> Document fictif — France Roleplay — sans valeur administrative réelle.

---

## Utilisation

1. Ouvrir <https://luciefairepy.github.io/Concours-Bac-Frrp-RP/> — c'est la
   **page d'accès examinateur**, seule porte d'entrée du site
2. Choisir son nom dans la liste et taper son **code personnel**
   (`BAC-XXXX-XXXX-XXXX`). La connexion mène à l'application (`app.html`)
3. Dérouler les 9 étapes : Identité → Théorie → Radio → Situations → Physique →
   Tir → Correction → Résultats → Fiche finale
4. **Télécharger en PDF** pour sortir le dossier A4, en choisissant
   « Enregistrer au format PDF » comme destination dans la fenêtre du navigateur
5. **CLÔTURER DÉFINITIVEMENT** écrit le dossier dans le dépôt et le verrouille

Le brouillon en cours est enregistré automatiquement toutes les 30 secondes, à
chaque changement d'étape, et quand l'onglet passe en arrière-plan. L'état de
l'enregistrement s'affiche dans l'en-tête. Le bouton **Enregistrer** force la
sauvegarde.

Un dossier commencé sur un ordinateur se reprend sur un autre : le brouillon
suit le code personnel, pas la machine. Rien n'est stocké dans le navigateur.

---

## Deux pages

| Page | Rôle |
|---|---|
| `index.html` | accès examinateur, seule porte d'entrée |
| `app.html` | l'application : dossier, historique, paramètres |
| `404.html` | adresse inconnue, renvoie vers l'accès |

L'application **n'est pas** un écran masqué par une fenêtre modale : c'est une
page distincte. Ouvrir `app.html` directement sans session valide déclenche une
redirection vers l'accès, et le corps de la page reste masqué
(`body.booting`) jusqu'à ce que la session soit vérifiée — rien n'apparaît,
même brièvement.

Se déconnecter renvoie à l'accès avec `?r=signedout`. Une session expirée
renvoie avec `?r=expired`, un accès retiré avec `?r=invalid`.

> **Ce que cette séparation fait, et ce qu'elle ne fait pas.** Elle empêche
> d'atteindre l'application sans code, y compris en tapant l'URL. Elle ne rend
> pas les données confidentielles : la branche `data` est publique, donc
> lisible par quiconque connaît son adresse, sans passer par le site. Aucun
> écran de connexion ne peut changer cela sur un hébergement statique. Pour une
> vraie confidentialité, il faut un dépôt privé — et GitHub Pages exige alors
> un plan payant.

## Accès des examinateurs

Chaque examinateur a un **code personnel court** du type `BAC-7K3M-Q82F-RVT9`.
Il n'y a pas de jeton GitHub à distribuer, et rien n'est lisible en clair.

### Comment ça marche

Le jeton d'écriture du dépôt est stocké **chiffré** dans `data/access.json`,
une fois par personne, avec son code comme clé :

```
AES-256-GCM, clé dérivée par PBKDF2-SHA256, 310 000 itérations, sel et IV aléatoires
```

Le fichier est public, son contenu est inexploitable sans le code. À la connexion,
la personne choisit son nom dans la liste, tape son code, et le navigateur déchiffre
le jeton localement. Le jeton ne quitte jamais la mémoire de l'onglet.

Un code fait 12 caractères tirés d'un alphabet de 32 symboles sans ambiguïté
(ni `0`/`O`, ni `1`/`I`), soit **60 bits**. Derrière 310 000 itérations PBKDF2,
une attaque par force brute sur le fichier public est hors de portée.

### Durée de la session

Après la saisie du code, la session est **mémorisée sur l'appareil** : fermer
l'onglet ou le navigateur ne déconnecte pas.

À **chaque chargement de la page**, la session est vérifiée :

| Cas | Comportement |
|---|---|
| Session valide | reconnexion silencieuse, et l'échéance repart pour `sessionHours` |
| Échéance dépassée | code redemandé, avec « Session expirée. Entre ton code pour continuer. » |
| Accès retiré ou code changé entre-temps | code redemandé, avec « Session fermée : ton accès a été modifié ou retiré. » |

L'échéance est **glissante** : chaque visite la repousse. Une session ne meurt
donc qu'après `sessionHours` d'inactivité. La valeur se règle dans
`js/config.js` (12 heures par défaut) et l'onglet **Paramètres** affiche la date
d'expiration et le temps restant.

**Se déconnecter** efface immédiatement la session mémorisée.

Ce qui est conservé, c'est le **code**, pas le jeton GitHub — et dans
`localStorage`, donc sur cet appareil et ce navigateur uniquement, jamais
transmis ni partagé. Si `localStorage` est indisponible (navigation privée,
données de site bloquées), le repli est `sessionStorage`, puis la mémoire : la
session dure alors le temps de l'onglet, ou de la page.

> Conséquence à connaître : quiconque a accès au profil du navigateur reprend la
> session sans connaître le code. C'est le compromis habituel du « rester
> connecté ». Sur un poste partagé, utiliser **Se déconnecter**.

### Gérer les accès depuis le site

Une personne dont l'accès porte le droit **« accès aux paramètres »** voit, dans
l'onglet **Paramètres**, une carte *Accès des examinateurs* :

- la liste des accès existants, avec qui a ce droit et un bouton **Retirer**
- un formulaire **Ajouter une personne** : grade, nom, et une case
  *Autoriser l'accès à cette page Paramètres*

À la création, le code est généré aléatoirement, affiché **une seule fois** dans
un champ avec un bouton **Copier**, prêt à être transmis. Il n'est stocké nulle
part en clair : en cas de perte, retirer l'accès et le recréer.

L'identifiant est dérivé du nom (`LAURENT Cyril` → `laurent-cyril`), avec un
suffixe numérique si le nom est déjà pris. On ne peut pas retirer sa propre
session.

> Ce droit est une **barrière d'interface**, pas une frontière de sécurité :
> toute personne ayant un code valide détient le même jeton GitHub et pourrait,
> via l'API, faire ce que le jeton permet. Il sert à éviter les fausses
> manœuvres, pas à contenir quelqu'un de malveillant. Ce qui contient
> réellement, ce sont les protections de branche décrites plus bas.

### Gérer les accès en ligne de commande

Même chose hors du site, utile pour créer le premier accès.

```bash
node tools/access.mjs list
node tools/access.mjs add <id> <grade> <nom> [--manage]
node tools/access.mjs recode <id>
node tools/access.mjs remove <id>
node tools/access.mjs rotate
node tools/access.mjs check <id>
```

| Commande | Effet |
|---|---|
| `add` | crée un accès et affiche son code **une seule fois** |
| `--manage` | donne le droit d'accès à la page Paramètres |
| `recode` | remplace le code d'une personne, l'ancien cesse de fonctionner |
| `remove` | retire l'accès d'une personne |
| `rotate` | remplace le jeton stocké pour tout le monde, les codes restent valables |
| `check` | vérifie qu'un code ouvre bien son entrée, et affiche ses droits |

Exemple :

```bash
node tools/access.mjs add kevin Lieutenant "BOUSSERE Kevin" --manage
```

Le jeton est lu dans `--token=...`, sinon dans `BAC_TOKEN`, sinon demandé à la
saisie (masquée).

### Le jeton du dépôt

Un seul jeton sert à tout le monde, à créer une fois sur
<https://github.com/settings/personal-access-tokens/new> :

- **Token name** : `concours-bac`
- **Resource owner** : `LucieFairePy`
- **Repository access** : `Only select repositories` → `Concours-Bac-Frrp-RP`
- **Permissions → Repository permissions → Contents** : `Read and write`

> Il doit être *fine-grained* et limité à ce dépôt. Un jeton classique à scope
> `repo` donnerait accès à **tous** tes dépôts : ne scelle jamais un jeton
> classique dans `access.json`.

### Ce que ce modèle ne protège pas

Le jeton scellé porte « Contents: Read and write » sur le dépôt. Les permissions
*fine-grained* de GitHub s'arrêtent au dépôt : elles ne se restreignent ni à une
branche, ni à un chemin. Conséquences, mesurées et non supposées :

| Action avec le jeton | Résultat |
|---|---|
| Écrire dans `data/` sur la branche `data` | autorisé, c'est le but |
| Écrire `index.html` ou `js/` sur `main` | **autorisé** |
| Supprimer une branche, réécrire l'historique | autorisé si aucune protection n'est posée |
| Créer une protection de branche | refusé |
| Modifier les réglages du dépôt | refusé |
| Créer ou supprimer un dépôt | refusé |

Deux limites s'ajoutent, inhérentes à un site sans serveur :

1. **Le jeton est le même pour tous.** Une personne ayant un code valide peut
   techniquement l'extraire de la mémoire de son navigateur. Retirer son code
   l'empêche de se connecter, mais pas d'utiliser un jeton déjà extrait. La vraie
   révocation est `rotate` avec un jeton neuf, puis la révocation de l'ancien.
2. **Le périmètre du jeton est le plancher de sécurité.** D'où les protections de
   branche ci-dessous, qui rendent toute dégradation réversible.

Pour une révocation individuelle stricte, chaque personne peut se connecter avec
**son propre** jeton *fine-grained* : la modale accepte un `github_pat_...` à la
place d'un code, et l'identité est lue dans `data/users.json`.

## Protection et restauration

### Protéger les branches

```bash
node tools/guard.mjs status
node tools/guard.mjs apply
node tools/guard.mjs test
```

`apply` interdit sur `main` et `data` la **suppression de branche** et la
**réécriture d'historique**. Toute dégradation devient alors un commit de plus,
visible et réversible : rien ne peut être détruit définitivement.

Le jeton d'écriture ne peut pas retirer cette protection (`403` sur la création
de rulesets), donc il ne peut pas se libérer lui-même.

`apply` est la seule commande qui exige un jeton avec
« Administration: Read and write », à révoquer juste après. `test` vérifie
ensuite, avec le jeton d'écriture ordinaire, qu'une réécriture est bien refusée.

### Restaurer après une dégradation

```bash
node tools/restore.mjs log            # derniers changements de data/
node tools/restore.mjs show <sha>     # état des fichiers à ce commit
node tools/restore.mjs diff <sha>     # écart avec l'état actuel
node tools/restore.mjs rollback <sha> # remet data/ dans cet état
```

`rollback` n'efface aucun historique : il ajoute des commits. Tout état passé
reste atteignable, y compris celui d'avant la restauration. `log`, `show` et
`diff` fonctionnent sans jeton.

Exemple : quelqu'un vide les dossiers.

```bash
node tools/restore.mjs log
node tools/restore.mjs diff a1b2c3d4
node tools/restore.mjs rollback a1b2c3d4
```

### Pour aller plus loin

Déplacer `data/` dans un **dépôt séparé**, avec un jeton limité à ce dépôt, rend
le code du site totalement hors d'atteinte : au pire, les données sont abîmées,
jamais le site. Il suffit de créer le dépôt, d'y pousser la branche `data`, et de
renseigner son nom dans `js/config.js`.

## Export PDF

Le bouton **Télécharger en PDF** de la fiche finale précharge les photos, nomme
le document d'après le dossier et le candidat — le navigateur propose donc
`BAC-2026-001 — DURAND Léa.pdf` — puis ouvre la fenêtre d'impression. Il faut y
choisir **Enregistrer au format PDF** comme destination.

C'est le moteur d'impression du navigateur qui produit le fichier, et non une
bibliothèque JavaScript : les pages sont de vraies A4, le texte reste
sélectionnable et vectoriel, les cotes en millimètres et les sauts de page sont
respectés. Une bibliothèque de rastérisation donnerait un texte flou et des
fichiers plus lourds.

Le CSS d'impression garantit que rien ne manque :

- `print-color-adjust: exact` sur **tout** le sous-arbre de la fiche, sinon le
  navigateur supprime les fonds : en-têtes, pieds, bandeaux et en-têtes de
  tableau sortiraient en blanc sur blanc, et les photos disparaîtraient
- `@page { margin: 0 }`, parce que chaque page fait déjà exactement 210 × 297 mm
  et porte ses propres marges internes
- hauteur **automatique** avec un minimum de 297 mm, au lieu d'une hauteur fixe
  qui coupait les réponses longues

> Conséquence de ce dernier point : si les réponses sont très longues, une page
> logique peut s'étaler sur deux feuilles, et les pieds de page continuent
> d'indiquer la section (`3/8`). Le contenu complet est privilégié sur le nombre
> de feuilles. Pour imposer huit feuilles exactement, remettre
> `height: 297mm` et `overflow: hidden` sur `.dossier-page` dans
> `css/print.css` — mais le texte en excès sera alors perdu.

## Barème

Total sur **1000 points**, plafond atteignable exactement.

| Épreuve | Points |
|---|---|
| Questionnaire théorique | 100 |
| Radio & coordination | 100 |
| Mises en situation | 300 |
| Physique & cognitif | 200 |
| Tir | 300 |

Les mises en situation comptent **27 questions notées sur 15**, soit 405 points
bruts. La section pesant 300 points au barème, le total brut est ramené
proportionnellement : `note = round(brut × 300 / 405)`. L'examinateur continue
donc de noter chaque question sur 15, le classement entre candidats est
conservé, et le total maximum du dossier vaut exactement 1000. La page de
correction affiche les deux chiffres.

Propositions automatiques : ≥ 800 `RETENU`, ≥ 650 `RETENU SOUS RÉSERVE`,
en dessous `RECALÉ`. L'examinateur garde la décision finale.

Chaque réponse reçoit une **suggestion automatique** basée sur la complétude.
Si l'examinateur laisse la note vide, la suggestion est utilisée dans le calcul.

Éliminatoires : triche, refus injustifié d'une consigne, abandon injustifié,
2 cibles otage touchées ou plus. Une cible otage touchée plafonne le tir à 210
et interdit un `RETENU` sans réserve.

---

## Stockage des données

GitHub sert de base de données via l'API Contents. Aucun service externe.
**Aucune donnée de dossier n'est stockée dans le navigateur** : tout vit dans le
dépôt, pour être partagé entre examinateurs où qu'ils soient.

| Branche | Contenu | Déployée |
|---|---|---|
| `main` | le site | oui, sur GitHub Pages |
| `data` | les dossiers | non |

```
data/
  access.json             codes des examinateurs, jeton chiffré par code
  settings.json           direction BAC, partagée par tous
  users.json              comptes GitHub autorisés (connexion par jeton)
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

Le stockage du navigateur ne sert qu'à la session de connexion, décrite
ci-dessus. Il ne contient aucun dossier, aucune note, aucun candidat.

---

## Architecture

```
index.html                  page d'accès examinateur
app.html                    application (header, 3 vues, points de montage)
404.html                    adresse inconnue
.nojekyll                   désactive Jekyll
serve.cmd                   serveur local pour le développement
.github/workflows/pages.yml déploiement GitHub Pages

assets/favicon.svg          écusson, icône d'onglet
assets/logo-bac.svg         écusson complet, en-tête et page d'accès
assets/img/                 4 photos du dossier final

css/
  base.css                  variables, reset, typo, boutons, champs, tableaux
  gate.css                  page d'accès examinateur
  layout.css                header, nav, grille 12 colonnes, onglets, progression
  components.css            cards, questions, énoncés, scores, bannières, modale
  dossier.css               pages A4 du dossier final (.dossier-page, .dp-*)
  cover.css                 page 1 du dossier (.cover-v2)
  print.css                 toutes les règles @media print

package.json                type module, pour les outils d'administration

tools/
  prompt.mjs                saisie masquée, lecture des jetons, confirmations
  access.mjs                codes examinateurs : add, recode, remove, rotate
  guard.mjs                 protection des branches : status, apply, test
  restore.mjs               retour arrière sur les données : log, diff, rollback

js/
  config.js                 dépôt GitHub, branche de données, autosave, durée de session
  gate.js                   entrée de la page d'accès
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
    auth.js                 session examinateur, code personnel, rôles, expiration
    session-store.js        mémorisation de la session, avec replis
    roster.js               création et retrait des accès depuis le site
    crypto.js               AES-GCM + PBKDF2, génération et format des codes
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
    settings.js             direction BAC, gestion des accès, état de session
    gate.js                 formulaire de la page d'accès
```

JavaScript natif, modules ES, aucune dépendance et aucune étape de build.

---

## Modes de fonctionnement

| Situation | Comportement |
|---|---|
| Code personnel | lecture et écriture, brouillon partagé, clôture possible, session mémorisée |
| Code avec droit « paramètres » | idem, plus la gestion des accès et de la direction |
| Jeton GitHub personnel | idem, droit « paramètres » inclus, révocation individuelle côté GitHub |
| `js/config.js` sans `owner`/`repo` | mode local : le site marche, les dossiers restent dans l'onglet |

Il n'y a pas d'accès en lecture seule : un code est nécessaire pour entrer.

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
