# Portail BAC 75 N — France Roleplay

### ▶ [Ouvrir le portail](https://luciefairepy.github.io/Concours-Bac-Frrp-RP/)

<https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>

Portail interne fictif de la Brigade Anti-Criminalité 75 N : concours
d'intégration, formations, qualification Chef de Groupe et historique
centralisé. Site statique hébergé sur GitHub Pages, dossiers stockés dans ce
dépôt sur la branche `data`.

> Document fictif — France Roleplay — sans valeur administrative réelle.

---

## Ce que contient le portail

| Module | Page | Dossiers | Barème |
|---|---|---|---|
| Concours d'intégration BAC | `app.html` | `BAC-AAAA-NNN` | /1000 |
| Formation Négociation BAC | `negociation.html` | `NEG-AAAA-NNN` | /100 |
| Formation Chef de Groupe BAC | `chef-de-groupe.html` | `FCG-AAAA-NNN` | /100 |
| Examen de qualification Chef de Groupe | `examen-cdg.html` | `CDG-AAAA-NNN` | /1000 |

Autour des modules : une page d'accueil V4 (héros, quatre cartes, quatre
panneaux), un **historique central** commun aux quatre modules, les
**actualités**, les **paramètres** (direction BAC, seuils de suggestion), la
**gestion des utilisateurs** (accès, rôles, effectifs) et une page
**administration** (actualités, journal des actions sensibles, état du dépôt,
places d'images à livrer).

```
index.html            accès examinateur, seule porte d'entrée
accueil.html          accueil V4 : héros, 4 cartes, 4 panneaux
app.html              concours d'intégration (9 étapes, fiche 8 pages)
formations.html       choix des formations
negociation.html      Formation Négociation (20 chapitres)
chef-de-groupe.html   Formation Chef de Groupe (16 modules)
examen-cdg.html       Examen de qualification (8 étapes, fiche 5 pages)
historique.html       historique central, toutes catégories
actualites.html       actualités du portail, liste et détail
parametres.html       direction BAC, seuils de suggestion, profil
utilisateurs.html     accès, rôles et effectifs
administration.html   actualités, journal, stockage, modules, images
404.html              adresse inconnue
```

La navigation est unique et vit dans `js/core/portal.js` : une seule source de
vérité pour toutes les pages. Elle est rendue dans la **barre latérale** de
236 px (logo, identité, devise, entrées et sous-entrées, cartouche citation) ;
l'**en-tête** de 68 px porte l'identité Police Nationale / France Roleplay, la
recherche globale — qui ouvre l'historique — l'état d'enregistrement et le
profil connecté.

---

## Utilisation

1. Ouvrir <https://luciefairepy.github.io/Concours-Bac-Frrp-RP/> — c'est la
   **page d'accès**, seule porte d'entrée du portail
2. Choisir son nom dans la liste et taper son **code personnel**
   (`BAC-XXXX-XXXX-XXXX`). La connexion mène à l'accueil du portail
3. Choisir un module dans la barre latérale ou sur une carte de l'accueil
4. Dérouler les étapes jusqu'à la fiche finale
5. **Télécharger en PDF** pour sortir le dossier A4, en choisissant
   « Enregistrer au format PDF » comme destination dans la fenêtre du navigateur
6. **CLÔTURER DÉFINITIVEMENT** écrit le dossier dans le dépôt et le verrouille

Le brouillon en cours est enregistré automatiquement toutes les 30 secondes, à
chaque changement d'étape, et quand l'onglet passe en arrière-plan. L'état de
l'enregistrement s'affiche dans l'en-tête. Le bouton **Enregistrer** force la
sauvegarde.

Un dossier commencé sur un ordinateur se reprend sur un autre : le brouillon
suit le code personnel, pas la machine. Chaque module a son propre brouillon,
donc un concours en cours et un examen Chef de Groupe en cours coexistent sans
se marcher dessus.

---

## Les modules

### Concours d'intégration BAC

Flux inchangé : Identité → Théorie → Radio → Situations → Physique → Tir →
Correction → Résultats → Fiche finale.

Questions préchargées puis **figées pour la session**. À la correction, chaque
réponse s'affiche avec une suggestion automatique ; l'examinateur garde la note
retenue. Décision : `RETENU` / `RETENU SOUS RÉSERVE` / `AJOURNÉ` / `RECALÉ`.

Total sur **1000 points**, plafond atteignable exactement.

| Épreuve | Points |
|---|---|
| Questionnaire théorique | 100 |
| Radio & coordination | 100 |
| Mises en situation | 300 |
| Physique & cognitif | 200 |
| Tir | 300 |

Les mises en situation comptent **27 questions notées sur 15**, soit 405 points
bruts, ramenés proportionnellement aux 300 points de la section :
`note = round(brut × 300 / 405)`. Le classement entre candidats est conservé et
le total maximum vaut exactement 1000. La page de correction affiche les deux
chiffres.

Propositions automatiques : ≥ 800 `RETENU`, ≥ 650 `RETENU SOUS RÉSERVE`, en
dessous `RECALÉ`. Éliminatoires : triche, refus injustifié d'une consigne,
abandon injustifié, 2 cibles otage touchées ou plus. Une cible otage touchée
plafonne le tir à 210 et interdit un `RETENU` sans réserve.

### Formation Négociation BAC

20 chapitres, de « rôle et principes » à la conclusion, écrits selon la règle
du cahier des charges : **explication simple → exemple en jeu → point à retenir
→ exercice**. Encadrés `À RETENIR` et `ERREURS À ÉVITER`, échanges types,
tableaux, exercices avec champ de réponse.

```
CONTACT → ÉCOUTER → COMPRENDRE → REFORMULER → IDENTIFIER
  → INFORMER / TRANSMETTRE → ADAPTER → TEMPORISER → RECHERCHER UNE ISSUE
```

Parcours : Identité → Cours → Évaluation → Correction → Fiche finale.
Évaluation sur 100, décision `ACQUIS` / `ACQUIS SOUS RÉSERVE` / `À REVOIR`.
Fiche finale de 3 pages A4, quatre signatures.

### Formation Chef de Groupe BAC

16 modules : rôle, posture, préparation de la vacation, communication,
décision, effectifs, radio, commandement sur intervention, coordination,
dégradation, situation majeure, erreurs, débriefing, exercices, fiche réflexe,
évaluation.

```
ANALYSER → PRIORISER → ORGANISER → DONNER LES CONSIGNES
  → COORDONNER → CONTRÔLER → ADAPTER → RENDRE COMPTE
```

### Examen de qualification Chef de Groupe

Format compact voulu : **environ 45 minutes, une heure au maximum**. La page
suit la durée à partir des heures de début et de fin saisies et signale un
dépassement.

| Épreuve | Contenu | Barème |
|---|---|---|
| Connaissances essentielles | 10 questions simples et aléatoires | /200 |
| Commandement / leadership | 5 questions courtes | /200 |
| Mise en situation n°1 | Organisation d'une intervention | /250 |
| Mise en situation n°2 | Situation évolutive / adaptation | /250 |
| Radio & compte rendu | Intégré aux situations | /100 |
| **TOTAL** | | **/1000** |

Les deux questions radio sont **posées pendant** les mises en situation mais
**comptées** dans la section radio : elles portent `section: 'radio'` et ne
pèsent pas sur les 250 points de leur situation. Sans ce marquage, la radio
serait comptée deux fois. `node tools/test.mjs` vérifie sur 50 tirages que le
brut vaut exactement 1000.

Décisions : `QUALIFIÉ` / `QUALIFIÉ SOUS RÉSERVE` / `AJOURNÉ` / `REFUSÉ`.
Fiche finale de 5 pages A4, quatre signatures : candidat, examinateur,
Directeur BAC, Directeur adjoint BAC.

---

## Banque de questions et de situations

Le cahier des charges demande au moins **20 000 variantes exploitables**, et
préfère un générateur combinatoire à 20 000 lignes statiques. C'est ce qui est
fait : `js/data/cdg-bank.js` contient les fragments,
`js/data/cdg-generator.js` les combine.

Les neuf dimensions demandées sont là : thème, contexte, effectif, information
disponible, priorité, contrainte, évolution, événement imprévu, formulation.

**Le total affiché est calculé, pas annoncé.** `countVariants()` multiplie les
fragments réellement présents ; si quelqu'un en retire, le chiffre baisse.
Au dernier contrôle :

```
connaissances      800
commandement       240
situation n°1  216 000
situation n°2  7 776 000
─────────────────────────
total          7 993 040
```

Deux garanties, vérifiées par la suite de tests sur 200 tirages :

- **équilibre** — les dix questions de connaissances sortent de dix thèmes
  différents, jamais toutes du même, et aucune n'est répétée ;
- **gel** — une fois la session créée, le tirage est écrit dans le dossier. Il
  ne changera plus, même si la banque évolue. La graine est conservée à côté
  pour que le tirage reste vérifiable après coup.

---

## Correction assistée

> **Règle absolue.** Le site aide à noter et aide à décider. Il ne remplace
> jamais l'examinateur.

Pour chaque réponse, la page de correction affiche : la réponse, les **éléments
attendus** avec ceux qui ont été retrouvés et ceux qui manquent, la **note
suggérée** et sa justification — puis, à côté, la **note retenue par
l'examinateur**, librement modifiable.

La suggestion repose sur deux choses mesurables : la présence des éléments
attendus (comparaison par radical, donc « reformule » vaut « reformuler ») et
la consistance de la réponse. Une réponse étoffée mais hors sujet ne peut pas
dépasser la moitié du barème. **La suggestion ne comprend pas le sens d'une
phrase**, et c'est pour cela qu'elle reste une suggestion.

Champ de note vide : la suggestion est utilisée dans le calcul. Note saisie,
zéro compris : c'est elle qui compte. **Les deux sont conservées dans le
dossier final**, pour que la correction reste vérifiable.

Même logique pour le résultat : le moteur affiche « qualification
recommandée » ou « non recommandée » avec une courte justification.
L'examinateur peut qualifier malgré un avis négatif et refuser malgré un avis
positif. Une décision qui s'écarte de la recommandation, comme tout refus,
réserve ou ajournement, **exige une motivation avant la clôture**.

---

## Historique centralisé

Un seul historique pour tout le portail, pas quatre historiques isolés. Page
d'entrée « HISTORIQUE — BRIGADE ANTI-CRIMINALITÉ 75 N », recherche libre et
trois grandes catégories cliquables :

- Concours d'intégration BAC
- Formation Négociation BAC
- Chef de Groupe / Qualification

Chaque ligne porte le numéro de dossier, le nom et le prénom, le matricule, la
date, le type, la note, le résultat et l'examinateur. Filtres : type, résultat,
période, examinateur, plus la recherche sur nom, prénom, matricule et numéro.
Un clic ouvre la fiche complète dans la page de son module, en lecture seule.

**Ajouter une formation au portail** = ajouter une entrée dans
`MODULES`, dans `js/core/records.js`. L'historique, la numérotation, les
brouillons et la lecture seule suivent sans être retouchés. Un module illisible
n'empêche pas les autres de s'afficher : son erreur apparaît à côté des lignes
lues.

---

## Rôles et permissions

| Rôle | Permissions |
|---|---|
| Administrateur / créateur | `read` `write` `close` `train` `settings` `journal` `accounts` |
| Directeur BAC | `read` `write` `close` `train` `settings` `journal` `accounts` |
| Directeur adjoint BAC | `read` `write` `close` `train` `settings` `journal` `accounts` |
| Formateur / examinateur | `read` `write` `close` `train` |
| Utilisateur / consultation | `read` |

| Permission | Ce qu'elle ouvre |
|---|---|
| `read` | consulter les dossiers clôturés et l'historique |
| `write` | créer et corriger un dossier, enregistrer un brouillon |
| `close` | clôturer définitivement un dossier |
| `train` | valider une formation suivie par un agent |
| `settings` | modifier la direction BAC et les accès |
| `journal` | lire le journal des actions sensibles |
| `accounts` | ouvrir la page Administration |

Le rôle et le drapeau `manage` viennent tous deux de la charge **chiffrée** de
`data/access.json` : ils ont la même valeur de preuve, et la partie publique du
fichier n'autorise rien — elle ne sert qu'à afficher la liste des noms.

Les accès scellés avant l'arrivée des rôles continuent de fonctionner :
`examinateur` est lu comme `formateur`, et un ancien accès portant seulement
`manage: true` vaut `directeur adjoint`.

> **Ce que ces rôles font, et ce qu'ils ne font pas.** Ils décident ce que
> l'interface propose. Sur un hébergement statique, toute personne détenant un
> code valide détient le **même jeton d'écriture** du dépôt : un rôle n'est pas
> une frontière infranchissable. Ce qui contient réellement, ce sont la
> protection des branches et le journal, qui rendent toute dégradation visible
> et réversible.

### Journal des actions sensibles

Un fichier par mois dans `data/journal/AAAA-MM.json`. Sont journalisées : les
clôtures, les versions rectificatives, les validations de formation, les
créations et retraits d'accès, les changements de rôle et les modifications de
la direction BAC. Chaque ligne porte la date, qui, le rôle, l'action, la cible
et un détail.

**Écrire au journal ne conditionne jamais l'action.** Un dossier clôturé reste
clôturé même si le journal n'a pas pu être écrit, et la page le signale alors à
l'écran plutôt que de le taire.

Le journal se lit dans **Administration**, mois par mois.

---

## Pas de modification silencieuse

Après clôture, un dossier est en lecture seule. Une correction ultérieure n'est
pas une modification : c'est une **version rectificative**.

Le bouton « Créer une version rectificative » repart du dossier clôturé, le
rend modifiable, et à la clôture publie une pièce nouvelle :

- elle porte un numéro propre, `CDG-2026-001-R2` ;
- elle cite le dossier d'origine dans son champ `rectifies` ;
- l'index note sur la ligne d'origine quelle version la corrige
  (`rectifiedBy`), et l'historique l'affiche ;
- **le dossier d'origine n'est jamais réécrit.**

Une deuxième rectification s'empile en `-R3` sans écraser la première, et la
numérotation des nouveaux dossiers ignore les suffixes.

---

## Paramètres et direction BAC

La page **Paramètres** contient la Direction BAC. Valeurs initiales :
Directeur BAC — Lieutenant BOUSSERE Kevin ; Directeur adjoint BAC — Brigadier
LAURENT Cyril. Ces valeurs sont modifiables et reprises automatiquement dans
les fiches finales et les signatures de **tous** les modules.

Modification réservée aux rôles portant `settings` : administrateur, Directeur
BAC, Directeur adjoint BAC.

Changer le rôle d'une personne **régénère son code** : l'ancien cesse de
fonctionner et le nouveau s'affiche une seule fois. C'est inévitable — le rôle
est scellé avec le code.

---

## Banque d'images

La documentation technique V4 nomme ses quinze visuels (§5) et interdit de les
remplacer par des visuels génériques. `js/data/images.js` est donc une **liste
de places** qui porte exactement cette nomenclature : chaque place dit quel
fichier est attendu, à quel endroit, et sur quel sujet.

Tant qu'une photo n'est pas livrée, un repli sert : l'une des quatre photos BAC
déjà présentes dans le dépôt, choisie pour rester cohérente avec la page.

**Pour livrer une photo**, la déposer dans `assets/bac75n/` sous son nom de kit
(`02_HOME_HERO_BAC_CONTROLE_NUIT.jpg`, `12_SIDEBAR_CITATION_BAC75N_NUIT.jpg`…).
Elle prend la place du repli au chargement suivant, sans toucher au code : les
deux images sont empilées en CSS, et la couche du haut ne peint rien tant que le
fichier n'existe pas. La liste complète est dans `assets/bac75n/README.md` et
sur la page **Administration**.

`00_REFERENCE_DESIGN_V4_VALIDEE.png` ne se dépose pas : c'est la capture de
référence, elle sert à comparer le rendu, pas à être affichée.

Le logo est `assets/logo-bac.svg` ; il s'efface dès que
`assets/bac75n/01_LOGO_BAC75N_PRINCIPAL.png` est déposé.

**Droits d'utilisation** : à vérifier avant publication publique (§5). Le kit
technique ne vaut pas licence d'exploitation.

---

## Comptes et accès

Chaque personne a un **code personnel court** du type `BAC-7K3M-Q82F-RVT9`. Il
n'y a pas de jeton GitHub à distribuer, et rien n'est lisible en clair.

### Comment ça marche

Le jeton d'écriture du dépôt est stocké **chiffré** dans `data/access.json`, une
fois par personne, avec son code comme clé :

```
AES-256-GCM, clé dérivée par PBKDF2-SHA256, 310 000 itérations, sel et IV aléatoires
```

Le fichier est public, son contenu est inexploitable sans le code. À la
connexion, la personne choisit son nom dans la liste, tape son code, et le
navigateur déchiffre le jeton localement. Le jeton ne quitte jamais la mémoire
de l'onglet.

Un code fait 12 caractères tirés d'un alphabet de 32 symboles sans ambiguïté
(ni `0`/`O`, ni `1`/`I`), soit **60 bits**. Derrière 310 000 itérations PBKDF2,
une attaque par force brute sur le fichier public est hors de portée.

### Durée de la session

Après la saisie du code, la session est **mémorisée sur l'appareil** : fermer
l'onglet ou le navigateur ne déconnecte pas.

À **chaque chargement de page**, la session est vérifiée :

| Cas | Comportement |
|---|---|
| Session valide | reconnexion silencieuse, et l'échéance repart pour `sessionHours` |
| Échéance dépassée | code redemandé, avec « Session expirée. Entre ton code pour continuer. » |
| Accès retiré ou code changé | code redemandé, avec « Session fermée : ton accès a été modifié ou retiré. » |

L'échéance est **glissante** : chaque visite la repousse. Une session ne meurt
donc qu'après `sessionHours` d'inactivité. La valeur se règle dans
`js/config.js` (12 heures par défaut) et la page **Paramètres** affiche la date
d'expiration et le temps restant.

**Se déconnecter** efface immédiatement la session mémorisée.

Ce qui est conservé, c'est le **code**, pas le jeton GitHub — et dans
`localStorage`, donc sur cet appareil et ce navigateur uniquement, jamais
transmis. Si `localStorage` est indisponible (navigation privée, données de site
bloquées), le repli est `sessionStorage`, puis la mémoire : la session dure
alors le temps de l'onglet.

> Conséquence à connaître : quiconque a accès au profil du navigateur reprend la
> session sans connaître le code. C'est le compromis habituel du « rester
> connecté ». Sur un poste partagé, utiliser **Se déconnecter**.

### Gérer les accès depuis le site

Dans **Paramètres**, une personne portant la permission `settings` voit la carte
*Accès et rôles* : la liste des accès, un sélecteur de rôle par ligne, un bouton
pour retirer un accès, et un formulaire d'ajout (grade, nom, rôle).

À la création, le code est généré aléatoirement, affiché **une seule fois** dans
un champ avec un bouton **Copier**. Il n'est stocké nulle part en clair : en cas
de perte, retirer l'accès et le recréer.

L'identifiant est dérivé du nom (`LAURENT Cyril` → `laurent-cyril`), avec un
suffixe numérique si le nom est déjà pris. On ne peut ni retirer ni modifier sa
propre session.

### Gérer les accès en ligne de commande

Même chose hors du site, utile pour créer le premier accès.

```bash
node tools/access.mjs list
node tools/access.mjs add <id> <grade> <nom> [--role=<role>]
node tools/access.mjs recode <id> [--role=<role>]
node tools/access.mjs remove <id>
node tools/access.mjs rotate
node tools/access.mjs check <id>
```

| Commande | Effet |
|---|---|
| `add` | crée un accès et affiche son code **une seule fois** |
| `--role=` | `admin`, `directeur`, `adjoint`, `formateur` ou `lecture` (défaut : `formateur`) |
| `recode` | remplace le code d'une personne, l'ancien cesse de fonctionner |
| `remove` | retire l'accès d'une personne |
| `rotate` | remplace le jeton stocké pour tout le monde, les codes restent valables |
| `check` | vérifie qu'un code ouvre bien son entrée, et affiche son rôle |

`--manage` reste accepté et vaut `--role=adjoint`.

```bash
node tools/access.mjs add kevin Lieutenant "BOUSSERE Kevin" --role=directeur
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
   l'empêche de se connecter, mais pas d'utiliser un jeton déjà extrait. La
   vraie révocation est `rotate` avec un jeton neuf, puis la révocation de
   l'ancien.
2. **Le périmètre du jeton est le plancher de sécurité.** D'où les protections
   de branche ci-dessous, qui rendent toute dégradation réversible.

Pour une révocation individuelle stricte, chaque personne peut se connecter avec
**son propre** jeton *fine-grained* : la page d'accès accepte un
`github_pat_...` à la place d'un code, et l'identité est lue dans
`data/users.json`.

> **Le cahier des charges demande une authentification réelle et des
> permissions côté serveur (§14, §15).** Un site statique ne peut pas les
> fournir : il n'y a pas de serveur pour vérifier quoi que ce soit. L'hébergement
> statique a été retenu en connaissance de cause. Ce qui est en place à la
> place : un code personnel par personne, des rôles scellés par chiffrement, un
> journal de toutes les actions sensibles, des branches protégées et une
> restauration possible. Pour de vraies permissions côté serveur, il faut un
> backend ou un service comme Supabase — c'est un autre chantier, et il
> n'impose pas de réécrire les modules : seule la couche `js/core/store.js`
> change.

---

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

### Pour aller plus loin

Déplacer `data/` dans un **dépôt séparé**, avec un jeton limité à ce dépôt, rend
le code du site totalement hors d'atteinte : au pire, les données sont abîmées,
jamais le site. Il suffit de créer le dépôt, d'y pousser la branche `data`, et de
renseigner son nom dans `js/config.js`.

---

## Export PDF

Le bouton **Télécharger en PDF** précharge les photos, nomme le document d'après
le dossier et le candidat — le navigateur propose donc
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
> de feuilles. Pour imposer un nombre exact de feuilles, remettre
> `height: 297mm` et `overflow: hidden` sur `.dossier-page` dans
> `css/print.css` — mais le texte en excès sera alors perdu.

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
  access.json                   codes personnels, jeton chiffré par code
  settings.json                 direction BAC, partagée par tous
  users.json                    comptes GitHub autorisés (connexion par jeton)
  journal/<AAAA-MM>.json        journal des actions sensibles
  dossiers/index.json           index des concours clôturés
  dossiers/<ID>.json            un fichier par concours clôturé
  negociation/index.json        index de la formation négociation
  negociation/<ID>.json         un fichier par formation clôturée
  formation-cdg/index.json      index de la formation chef de groupe
  formation-cdg/<ID>.json       un fichier par formation clôturée
  cdg/index.json                index des examens de qualification
  cdg/<ID>.json                 un fichier par examen clôturé
  drafts/<login>.json           brouillon de concours en cours
  drafts/negociation-<login>.json
  drafts/formation-cdg-<login>.json
  drafts/cdg-<login>.json
```

| Opération | Requête | Code requis |
|---|---|---|
| Lire les dossiers, les index, les paramètres | `GET /contents/...?ref=data` | non |
| Écrire un brouillon, clôturer, modifier les paramètres | `PUT /contents/...` | oui |

Un fichier par dossier et un brouillon par personne et par module : aucun
conflit d'écriture possible. Les fichiers partagés (`settings.json`, les
`index.json`, le journal du mois) utilisent un verrou optimiste par `sha` avec
jusqu'à 5 tentatives.

Les données vivent sur une branche séparée parce que `main` est la source de
GitHub Pages : écrire les brouillons sur `main` déclencherait une reconstruction
du site toutes les 30 secondes, et les builds Pages sont limités en nombre par
heure.

Le stockage du navigateur ne sert qu'à la session de connexion. Il ne contient
aucun dossier, aucune note, aucun candidat.

---

## Architecture

```
*.html                      une page par module, plus accueil, historique,
                            paramètres, administration et accès
.nojekyll                   désactive Jekyll
serve.cmd                   serveur local pour le développement
.github/workflows/pages.yml déploiement GitHub Pages

assets/favicon.svg          écusson, icône d'onglet
assets/logo-bac.svg         écusson complet — à remplacer par l'emblème fourni
assets/img/                 photos BAC (replis), en .jpg et en .webp
assets/bac75n/              banque du kit V4, nommée selon le §5

css/
  base.css                  variables, reset, typo, boutons, champs, tableaux
  gate.css                  page d'accès
  layout.css                grille 12 colonnes, onglets, progression
  portal.css                coque V4 : barre latérale, en-tête, accueil, cartes
  components.css            cards, questions, énoncés, scores, bannières
  cours.css                 pages de cours : menu latéral, encadrés, exercices
  correction.css            correction assistée : attendus, suggérée / retenue
  historique.css            historique central : catégories, filtres, tableau
  dossier.css               pages A4 des fiches finales (.dossier-page, .dp-*)
  cover.css                 couvertures de dossier (.cover-v2)
  print.css                 toutes les règles @media print

tools/
  prompt.mjs                saisie masquée, lecture des jetons, confirmations
  access.mjs                codes et rôles : add, recode, remove, rotate
  guard.mjs                 protection des branches : status, apply, test
  restore.mjs               retour arrière sur les données : log, diff, rollback
  check-pages.mjs           contrôle statique du câblage HTML ↔ JavaScript
  test.mjs                  suite de tests du portail

js/
  config.js                 dépôt GitHub, branche de données, autosave, session
  gate.js                   entrée de la page d'accès
  accueil.js                page d'accueil et zone dynamique
  formations.js             choix des formations
  formation-app.js          contrôleur commun aux deux formations
  negociation.js            entrée de la Formation Négociation
  chef-de-groupe.js         entrée de la Formation Chef de Groupe
  examen-cdg.js             contrôleur de l'examen de qualification
  historique.js             historique central, recherche et export
  actualites.js             actualités : liste et détail
  parametres.js             direction BAC et seuils de suggestion
  utilisateurs.js           accès, rôles et effectifs
  administration.js         actualités, journal, stockage, modules, images
  app.js                    contrôleur du concours d'intégration

  data/
    questions.js            225 questions du questionnaire théorique
    radio.js                exercice radio du concours
    scenarios.js            5 mises en situation du concours
    steps.js                les 9 étapes du concours
    negociation.js          contenu de la Formation Négociation
    chef-de-groupe.js       contenu de la Formation Chef de Groupe
    cdg-bank.js             fragments de l'examen de qualification
    cdg-generator.js        générateur combinatoire et barème
    images.js               places d'images du kit V4 et replis
    news.js                 actualités de départ et visibilités

  core/
    dom.js                  helpers DOM, échappement HTML, initiales
    github-api.js           client API Contents GitHub (lecture/écriture/retry)
    store.js                persistance : driver github ou mémoire
    records.js              registre des modules, modèle de dossier commun
    journal.js              journal des actions sensibles
    roles.js                rôles et permissions
    portal.js               coque : garde de session, barre latérale, en-tête
    lifecycle.js            statuts et avancement d'un dossier (annexe B)
    thresholds.js           seuils de suggestion, centralisés (§8.6, §11.3)
    news.js                 lecture et écriture des actualités
    effectifs.js            comptage des effectifs par corps
    auth.js                 session, code personnel, rôles, expiration
    session-store.js        mémorisation de la session, avec replis
    roster.js               création, rôle et retrait des accès
    crypto.js               AES-GCM + PBKDF2, génération et format des codes
    state.js                modèle du dossier de concours
    formation.js            modèle du dossier de formation
    cdg-state.js            modèle du dossier d'examen, durée de l'épreuve

  scoring/
    auto.js                 suggestions automatiques du concours
    totals.js               notes finales du concours, total /1000, décision
    assist.js               correction assistée : attendus, suggérée, retenue
    cdg.js                  notation de l'examen par section, recommandation

  views/
    gate.js                 formulaire de la page d'accès
    navigation.js           étapes du concours
    stepper.js              étapes, générique, pour les modules ajoutés
    passage.js              passage du concours
    correction.js           correction du concours
    results.js              résultats du concours
    dossier.js              fiche finale du concours, 8 pages A4
    cours.js                vue de cours : menu, chapitres, blocs
    reflexe.js              fiche réflexe, sans gestionnaire
    formation-fiche.js      fiche finale de formation, 3 pages A4
    cdg-epreuves.js         épreuves et correction de l'examen
    cdg-fiche.js            fiche finale de qualification, 5 pages A4
    settings.js             direction BAC, seuils de suggestion, profil
    users.js                accès et rôles, effectifs, table des permissions
    chips.js                pastilles de décision, tous vocabulaires
```

JavaScript natif, modules ES, aucune dépendance et aucune étape de build.

---

## Tests

```bash
npm test                     # règles métier + chargement des pages
node tools/test.mjs          # règles métier seules
node tools/smoke.mjs         # chargement de chaque page, étape par étape
node tools/check-pages.mjs   # contrôle du câblage seul
```

Tout tourne en mémoire : aucun réseau, aucun jeton, aucune écriture dans le
dépôt. Ce qui est vérifié, ce sont les règles du cahier des charges qui ne
doivent pas se perdre au fil des modifications :

| Groupe | Ce qui est tenu |
|---|---|
| §5 | le concours ne régresse pas, sa fiche fait toujours 8 pages |
| §6 §7 | chaque formation a ses chapitres, ses exercices, son évaluation |
| §8 | le barème de l'examen vaut exactement 1000, vérifié sur 50 tirages |
| §9 | au moins 20 000 variantes, dix thèmes par tirage, tirage reproductible |
| §10 | la note de l'examinateur prime toujours, dans les deux sens |
| §11 | la fiche de qualification porte ses quatre signatures et ses champs |
| §12 | chaque ligne d'historique porte les champs exigés |
| §14 | chaque rôle a les permissions annoncées, le journal s'écrit |
| §15 | une correction après clôture ne réécrit pas le dossier d'origine |
| HOME | quatre cartes, quatre panneaux, jetons et mesures V4 (§6, §21) |
| §8.5 | cible otage, triche, abandon : les règles bloquantes passent avant le total |
| §8.6 §11.3 | les seuils vivent dans la configuration et s'appliquent vraiment |
| annexe B | statuts et avancement d'un dossier, neuf étapes au concours |
| §18 | actualités et effectifs tiennent sur des données, pas sur des constantes |
| §5 | la banque d'images suit la nomenclature du kit et garde ses replis |
| §4.1 | chaque identifiant de route du kit mène à une page qui existe |
| §8.4 | le barème physique se règle, et les paliers restent ordonnés |
| §11.2 | la suggestion vaut 35 % de complétude et 65 % de critères |
| §12 §14 | suggestion archivée, version du modèle et piste d'audit du dossier |
| §22 | WebP plus léger que l'original, miniatures différées et dimensionnées |
| SEC-001 GHP-001 | aucun jeton livré, aucun chemin absolu qui casserait sous Pages |
| câblage | handlers, points de montage, imports, liens et styles de chaque page |

Le contrôle de câblage attrape ce qu'aucun test d'unité ne voit sur un site sans
build : un `onclick="app.x()"` dont `app.x` n'existe plus, un
`setHTML('zone', …)` dont l'élément a disparu du HTML, un import au mauvais
chemin, un lien mort, une feuille de style oubliée.

`tools/smoke.mjs` va plus loin : il **charge le module d'entrée de chaque page**
comme le ferait le navigateur, avec une session déjà ouverte, puis **ouvre
toutes les étapes** du module — correction et fiche finale comprises — et chaque
chapitre de chaque cours. Une page qui reste blanche, une erreur au démarrage,
une fiche qui ne se remplit pas : le contrôle le dit. Le portail tourne en mode
local, dans une copie temporaire de `js/` : aucun réseau, aucune écriture.

> **Ce que ces contrôles ne remplacent pas.** Ils ne lancent pas de vrai
> navigateur : la mise en page, l'impression PDF et les écritures réelles vers
> GitHub se vérifient à l'œil, une fois le site servi. Ce qu'ils couvrent, c'est
> la logique, le câblage et le démarrage de chaque page.

---

## Développement local

Le site utilise des modules ES, que les navigateurs refusent de charger depuis
`file://`. Ouvrir une page par double-clic donne donc une erreur CORS. Il faut
passer par HTTP.

Double-cliquer sur **`serve.cmd`** : le serveur démarre et le navigateur s'ouvre
sur <http://127.0.0.1:8777/>. Fermer la fenêtre arrête le serveur.

En ligne de commande :

```bash
python -m http.server 8777
```

Pour travailler sans dépôt GitHub, vider `owner` et `repo` dans `js/config.js` :
le portail passe en **mode local**, la page d'accès propose « Continuer en
local », et tout reste dans l'onglet. Pratique pour parcourir l'interface, mais
rien n'est conservé à la fermeture.

Sur GitHub Pages la question ne se pose pas, le site est servi en HTTPS.

---

## Déploiement

Tout push sur `main` relance le workflow `.github/workflows/pages.yml` qui
publie le site. Rien à faire à la main.

La branche `data` n'est pas déployée : y pousser ne reconstruit pas le site.

---

## Documentation technique V4

Le portail suit `DOCUMENTATION_TECHNIQUE_BAC75N_V4`. Où chaque chapitre vit dans
le dépôt :

| Chapitre | Où |
|---|---|
| §4 nomenclature, §4.2 numéros de dossier | `js/core/records.js` (`BAC-AAAA-NNN`, rectificatif `-R01`) |
| §5 banque d'images | `js/data/images.js`, `assets/bac75n/` |
| §6 design system, barre latérale, en-tête | `css/base.css` (jetons et mesures), `css/portal.css`, `js/core/portal.js` |
| §6.4 quatre cartes, §6.5 quatre panneaux | `js/accueil.js`, `accueil.html` |
| §7 comportement de l'accueil | `js/accueil.js` |
| §8 concours | `js/app.js`, `js/scoring/` |
| §8.4 barème physique | `js/config.js` → `js/core/thresholds.js`, réglable sur `parametres.html` |
| §8.6 et §11.3 seuils | `js/core/thresholds.js`, réglables sur `parametres.html` |
| §11.2 formule de suggestion | `js/scoring/assist.js` — 35 % complétude + 65 % critères |
| §9 et §10 formations | `js/data/negociation.js` (20 chapitres), `js/data/chef-de-groupe.js` (16 modules) |
| §11 examen Chef de Groupe | `js/data/cdg-generator.js`, `js/scoring/cdg.js` |
| §12 suggestion ≠ décision | `js/scoring/assist.js`, `js/views/correction.js` |
| §12 suggestion archivée | `suggestionSnapshot()` dans `js/scoring/totals.js`, écrite à la clôture |
| §13 fiches finales et signatures | `js/views/dossier.js`, `cdg-fiche.js`, `formation-fiche.js` |
| §14 modèle de données | `js/core/records.js`, `js/core/store.js` ; `version` et `auditTrail` portés par chaque dossier |
| §15 cycle de vie, annexe B | `js/core/lifecycle.js` |
| §16 historique centralisé | `js/historique.js` |
| §17 rôles, §17.1 journal | `js/core/roles.js`, `js/core/journal.js`, `utilisateurs.html` |
| §18 actualités, dossiers, accès rapides, effectifs | `js/core/news.js`, `js/core/effectifs.js`, `js/accueil.js` |
| §19 GitHub Pages | `.github/workflows/pages.yml`, `404.html`, chemins relatifs |
| §22 performance et accessibilité | WebP via `image-set()`, miniatures différées et dimensionnées, focus visible |
| §21 recette | `tools/test.mjs`, `tools/smoke.mjs`, `tools/check-pages.mjs` |

Un seul écart de forme, et une impossibilité :

- **les routes** (§4.1) sont servies par des fichiers `.html` à plat
  (`historique.html`, pas `/historique`). Les identifiants et les adresses
  logiques du kit vivent dans `ROUTES`, en haut de `js/core/portal.js`, et
  c'est le seul endroit du portail où une adresse est écrite : passer aux
  adresses propres ne demanderait que de changer cette table. L'annexe E dit
  de conserver l'architecture du dépôt en reproduisant le contrat
  fonctionnel ; sur GitHub Pages, des adresses sans extension demanderaient
  un routeur et un repli 404 pour un gain cosmétique.
- **l'authentification et les permissions côté serveur** (§17, §19.2) sont
  impossibles sur un hébergement statique. Voir ci-dessous.

---

## Ce qui reste à faire

Deux points dépendent du commanditaire, et rien n'a été inventé à leur place :

- **la banque d'images BAC** — les places sont prêtes et listées dans la page
  Administration ; déposer les fichiers aux noms indiqués suffit ;
- **le véritable emblème BAC 75 N** — il doit remplacer
  `assets/logo-bac.svg`.

Un point est un choix d'architecture assumé, pas un oubli :

- **authentification et permissions côté serveur (§17, §19.2)** — impossibles
  sur un hébergement statique. Ce qui tient leur place est décrit plus haut,
  avec ses limites : codes personnels chiffrés, rôles scellés dans la charge,
  journal des actions sensibles, branches protégées et restauration. Le passage
  à un backend ne touche que `js/core/store.js`.

---

## Licence

Voir [LICENSE](LICENSE).
