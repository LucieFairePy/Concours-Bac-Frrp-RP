# Portail BAC 75 N — France Roleplay

### ▶ [Ouvrir le portail](https://luciefairepy.github.io/Concours-Bac-Frrp-RP/)

<https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>

Portail interne fictif de la Brigade Anti-Criminalité 75 N : concours
d'intégration, formations, qualification Chef de Groupe et historique
centralisé. Site statique d'une seule page hébergé sur GitHub Pages, dossiers
stockés dans ce dépôt sur la branche `data`.

> Document fictif — France Roleplay — sans valeur administrative réelle.

---

## Ce que contient le portail

| Module | Route | Dossiers | Barème |
|---|---|---|---|
| Concours d'intégration BAC | `#/concours` | `BAC-AAAA-NNN` | /1000 |
| Formation Négociation BAC | `#/formations/negociation` | anciens `NEG-AAAA-NNN`, lecture seule | — |
| Formation Chef de Groupe BAC | `#/formations/chef-de-groupe` | anciens `FCG-AAAA-NNN`, lecture seule | — |
| Formation Radio BAC | `#/formations/radio` | anciens `RAD-AAAA-NNN`, lecture seule | — |
| Formation Antiterrorisme BAC | `#/formations/antiterrorisme` | anciens `ANT-AAAA-NNN`, lecture seule | — |
| Examen de qualification Chef de Groupe | `#/examens/chef-de-groupe` | `CDG-AAAA-NNN` | /1000 |

Comme dans l'archive V4, les quatre formations sont des **cours à lire** :
elles ne créent plus de dossier. Les dossiers de formation clôturés avant
l'alignement sur l'archive restent dans l'historique et s'ouvrent en lecture
seule, sur leur fiche finale /100.

Autour des modules : une page d'accueil V4 (héros, quatre cartes, quatre
panneaux), un **historique central** commun aux six modules, les
**actualités**, les **paramètres** (direction BAC, seuils de suggestion,
barème physique, session), la **gestion des utilisateurs** (accès, rôles,
effectifs) et une page **administration** (tuiles chiffrées, journal récent,
gestion des actualités, journal des actions sensibles, modules et stockage).

Le portail est **une seule page**, `index.html` : elle porte l'écran d'accès
examinateur et, une fois la session ouverte, le portail lui-même. Chaque écran
a son adresse `#/…`, comme dans la maquette V4 :

```
index.html                       seule page : accès examinateur, puis portail
  #/accueil                      accueil V4 : héros, 4 cartes, 4 panneaux
  #/concours                     concours d'intégration (9 étapes, fiche 8 pages)
  #/formations                   catalogue des formations
  #/formations/negociation       Formation Négociation (20 chapitres)
  #/formations/chef-de-groupe    Formation Chef de Groupe (16 chapitres)
  #/formations/radio             Formation Radio (9 chapitres)
  #/formations/antiterrorisme    Formation Antiterrorisme (13 chapitres)
  #/examens/chef-de-groupe       Examen de qualification (8 onglets)
  #/historique                   historique central : formations, concours, examens
  #/actualites                   actualités du portail, liste et détail (hors menu)
  #/administration               tuiles, journal récent, actualités, stockage
  #/administration/utilisateurs  accès, rôles et effectifs
  #/administration/parametres    direction BAC, seuils, barème physique, session
404.html                         redirige les anciennes adresses, sinon page introuvable
```

Les routes sont déclarées dans `js/routes.js`, **seul endroit du portail où
une adresse est écrite** : le reste du code passe par `href('<route>')`, et le
code d'une page n'est chargé que lorsqu'on l'ouvre.

Rien ne casse pour les anciens liens :

- les anciennes pages à plat (`app.html?dossier=…`, `historique.html`,
  `negociation.html`…) n'existent plus. GitHub Pages sert `404.html` à leur
  place, qui redirige vers la route correspondante **requête comprise**
  (table `LEGACY_PAGES` de `js/routes.js`) : `app.html?dossier=BAC-2026-001`
  mène à `#/concours?dossier=BAC-2026-001` ;
- les adresses de la maquette (`#/chef-groupe`, `#/examens`, `#/negociation`,
  `#/radio`…) restent valides et mènent à la route actuelle.

Un lien vers un dossier clôturé s'écrit donc `#/concours?dossier=BAC-2026-001`.

La navigation est unique et vit dans `js/shell/nav.js` : une seule liste pour
la barre latérale et la nav de l'en-tête, dans l'ordre de l'archive. Elle est
rendue dans la **barre latérale** de 236 px (logo, identité, devise, entrées
et sous-entrées, cartouche citation) ; l'**en-tête** de 68 px porte l'identité
Police Nationale / France Roleplay, une nav courte (accueil, concours,
formations, examens, historique), la recherche globale — qui ouvre
l'historique — l'état d'enregistrement et le profil connecté. Les entrées
Administration et Gestion des utilisateurs n'apparaissent qu'aux rôles qui
portent `accounts`.

Deux écarts volontaires avec le menu de l'archive : la sous-entrée
*Intervention — Bientôt* est retirée, et les **Actualités** n'ont pas
d'entrée — l'archive n'en a pas. Elles s'ouvrent depuis le panneau
Actualités de l'accueil et depuis l'Administration.

---

## Utilisation

1. Ouvrir <https://luciefairepy.github.io/Concours-Bac-Frrp-RP/> — c'est la
   **page d'accès**, seule porte d'entrée du portail
2. Choisir son nom dans la liste et taper son **code personnel**
   (`BAC-XXXX-XXXX-XXXX`). La connexion mène à l'accueil du portail
3. Choisir un module dans la barre latérale ou sur une carte de l'accueil.
   Les modules s'ouvrent en plein écran ; « ← Portail BAC 75 N » ramène au
   portail
4. Concours et examen Chef de Groupe : dérouler les étapes jusqu'à la fiche
   finale. Formations : lire les chapitres, il n'y a rien à saisir
5. **Imprimer / Enregistrer en PDF** (concours) ou **Imprimer / PDF**
   (examen) pour sortir la fiche, en choisissant « Enregistrer au format
   PDF » comme destination dans la fenêtre du navigateur
6. **CLÔTURER DÉFINITIVEMENT** écrit le dossier dans le dépôt et le verrouille

Le brouillon en cours est enregistré automatiquement 30 secondes après la
dernière saisie, à chaque changement d'étape, quand l'onglet passe en
arrière-plan et quand on quitte l'écran du module. L'état de l'enregistrement
s'affiche dans la barre du module. Quitter l'écran ou fermer l'onglet avec des
modifications non enregistrées demande confirmation.

Un dossier commencé sur un ordinateur se reprend sur un autre : le brouillon
suit le code personnel, pas la machine. Le concours et l'examen Chef de
Groupe ont chacun leur brouillon, donc un concours en cours et un examen en
cours coexistent sans se marcher dessus.

---

## Les modules

### Concours d'intégration BAC

Module de l'archive V4 (`modules/concours-bac.html`), en plein écran : barre
du haut (+ NOUVEAU DOSSIER, Dossier, Historique, Paramètres), puis Identité →
Théorie → Radio → Situations → Physique → Tir → Correction → Résultats →
Fiche finale.

Les dix questions théoriques sont tirées à la création du dossier puis
**figées dans le dossier**. À la correction, chaque réponse s'affiche avec une
suggestion automatique ; l'examinateur garde la note retenue. Décision :
`RETENU` / `RETENU SOUS RÉSERVE` / `AJOURNE` / `RECALE`, libellés de
l'archive.

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
le total maximum vaut exactement 1000.

Propositions automatiques : ≥ 800 `RETENU`, ≥ 650 `RETENU SOUS RÉSERVE`, en
dessous `RECALE`. Éliminatoires : triche, refus injustifié d'une consigne,
abandon injustifié, 2 cibles otage touchées ou plus. Une cible otage touchée
plafonne la suggestion de tir à 210 et interdit un `RETENU` sans réserve, à
la clôture comme dans la proposition. Un `RECALE` s'affiche **en rouge** sur
la fiche finale, quel que soit le total. La fiche finale est celle de
l'archive : **8 pages A4**, couverture comprise.

**Contenu de l'archive** :

- **épreuve physique** — 400 m d'échauffement non noté puis 1200 m
  chronométrés, 30 pompes, 50 abdos et **20 jumping jacks, qui remplacent le
  gainage** : 20 répétitions et plus valent 30 points, en dessous 1,5 point
  par répétition. Le barème vit dans `js/config.js` et se règle dans
  Paramètres. Un dossier saisi avant la V4 porte un gainage et pas de jumping
  jacks : il reste noté sur le gainage (`usesPlank()`,
  `js/scoring/auto.js`), sa note ne bouge pas ;
- **questionnaire théorique** — la banque compte les **30 questions de
  l'archive** (identifiants `v4-…`), mot pour mot ; dix sont tirées pour
  chaque nouveau dossier. Un dossier plus ancien garde les questions qu'il a
  reçues ;
- **exercice radio et cinq mises en situation** — ceux de l'archive, pour
  tout nouveau dossier, estampillé `contentSet: 'v4'`
  (`js/data/content-set.js`). Un dossier sans estampille garde les textes
  d'origine : ses réponses sont rangées sous ces questions-là, il continue de
  s'afficher et de se noter avec elles.

### Formation Négociation BAC

Module de l'archive (`modules/formation-negociation.html`) : bannière, quatre
accès rapides (Fondamentaux, Écoute active, Coordination, Mise en situation),
sommaire des **20 chapitres** et barre de progression. Chaque chapitre, mot
pour mot : photo, « Comprendre », « Points essentiels », « À retenir », et
les encadrés « Méthode générale » et « Réflexe ». Cinq chapitres ajoutent un
encadré d'exemple. Navigation Précédent / Suivant / Imprimer.

```
CONTACT → ÉCOUTER → COMPRENDRE → REFORMULER → IDENTIFIER
  → TRANSMETTRE → ADAPTER → TEMPORISER → RECHERCHER UNE ISSUE
```

Le chapitre 20 affiche la grille d'évaluation /100 de l'archive :

| Axe | Points |
|---|---|
| Théorie | 20 |
| Communication | 20 |
| Analyse | 15 |
| Maîtrise | 10 |
| Collecte | 10 |
| Mise en situation | 25 |

Les champs se remplissent à l'écran, mais **rien n'est enregistré** : comme
dans l'archive, la grille n'est ni totalisée ni conservée.

### Formation Chef de Groupe BAC

Module de l'archive (`modules/formation-chef-groupe.html`) : sommaire et
**16 chapitres** mot pour mot — rôle, responsabilités et posture,
préparation de la vacation, communication et leadership, décision, effectifs,
radio, commandement sur intervention, coordination interservices, situation
qui se dégrade, situation majeure, erreurs de commandement, débriefing,
exercices pratiques, fiche réflexe, évaluation finale. Chaque chapitre porte
sa photo, ses points, un exemple et un exercice.

```
ANALYSER → PRIORISER → ORGANISER → DONNER LES CONSIGNES
  → COORDONNER → CONTRÔLER → ADAPTER → RENDRE COMPTE
```

### Formation Radio BAC

Module de l'archive (`modules/formation-radio.html`) : bandeau au logo,
sommaire interactif, un chapitre affiché à la fois. **9 chapitres** :
fondamentaux radio, discipline du réseau, prise d'écoute et vacation,
indicatifs et appel, structure d'une transmission, raccourcis interventions,
situations spécifiques, exercices pratiques, fiches réflexes.

```
ÉCOUTER → IDENTIFIER → LOCALISER → INFORMER → PRIORISER
  → DEMANDER → ACTUALISER → RENDRE COMPTE
```

### Formation Antiterrorisme BAC

Module de l'archive (`modules/formation-antiterrorisme.html`). **13
chapitres** : le Bataclan (13 novembre 2015), primo-intervention et rôle de
la BAC 75 N, le plan BAC-PSIG, RAID · BRI · GIGN, détection et signalement,
transmission et compte rendu initial, protection et zonage, victimes et
témoins, coordination et passage de relais, situations dégradées, exercices,
mise en situation finale, évaluation /100 et fiche réflexe. Le dernier
chapitre présente le barème /100 sous forme de tableau ; le module ne
comporte aucun champ de saisie.

```
OBSERVER → LOCALISER → QUALIFIER → TRANSMETTRE → PROTÉGER
  → ACTUALISER → COORDONNER → PASSER LE RELAIS
```

Les quatre formations sont des cours seuls, comme dans l'archive : pas
d'identité, pas d'évaluation saisie, pas de dossier ni de brouillon. Chaque
page est écrite à part, sans moteur commun. Un **ancien dossier** de
formation, créé quand les formations avaient un parcours évalué, s'ouvre
depuis l'historique (`?dossier=`) en lecture seule : sa fiche finale de 3
pages A4, imprimable, est peinte par `js/pages/formations/fiche.js` avec le
contenu de l'époque, conservé dans `js/data/formations/negociation.js`,
`chef-de-groupe.js`, `radio.js` et `antiterrorisme-dossiers.js`. Un ancien
dossier de négociation sans marque `evalVersion` garde son questionnaire
d'origine (`evaluationOf()`, `js/core/formation.js`).

### Examen de qualification Chef de Groupe

Module de l'archive (`modules/examen-chef-groupe.html`), en plein écran :
bannière « 45 minutes cible · maximum 1 heure », puis **huit onglets** —
Identité → 10 questions → Commandement → Situation 1 → Situation 2 →
Correction → Résultat → Fiche finale. Le contenu vit dans
`js/data/cdg-examen.js`, le barème dans `js/pages/examen-cdg/bareme.js`.

| Épreuve | Contenu | Barème |
|---|---|---|
| Connaissances essentielles | 10 questions générées, 20 points chacune | /200 |
| Commandement / leadership | 5 questions, 40 points chacune | /200 |
| Mise en situation n°1 | Organiser le groupe, fixer les priorités | /250 |
| Mise en situation n°2 | Intervention qui se dégrade, réorganiser | /250 |
| Radio & compte rendu | Suggérée à partir des deux situations | /100 |
| **TOTAL** | | **/1000** |

Chaque mise en situation reçoit une **évolution à injecter**, tirée parmi
cinq, affichée au milieu de l'énoncé (« ÉVOLUTION À INJECTER »). Questions et
évolutions sont tirées à la création du dossier puis figées dedans.

Décisions : `QUALIFIÉ` / `QUALIFIÉ SOUS RÉSERVE` / `AJOURNÉ` / `REFUSÉ`. La
suggestion suit les seuils de Paramètres (800 / 650 / 500 par défaut). La
fiche finale est celle de l'archive : identité, notes par catégorie, total
/1000, suggestion du système, décision humaine, motif, et quatre
signatures — candidat, examinateur, Directeur BAC, Directeur adjoint.

Le dossier passe par `js/core/records.js` (brouillon automatique, clôture,
version rectificative), jamais par le `localStorage` de l'archive. Un
dossier d'avant l'alignement sur l'archive (tirage par graine, sans `qs`)
s'ouvre en lecture seule sur son ancienne fiche de 5 pages A4
(`js/pages/examen-cdg/fiche.js`).

---

## Banque de questions et de situations

L'examen Chef de Groupe compose ses questions comme l'archive
(`js/data/cdg-examen.js`) :

- **10 questions de connaissances** — chacune croise un thème (8), un
  contexte (5) et un effectif (2, 4, 6 ou 8 agents), soit 160 énoncés
  possibles. Les dix tirages sont indépendants : un même thème peut revenir
  dans un examen. Chaque thème porte ses mots-clés attendus ;
- **5 questions de commandement**, fixes ;
- **2 mises en situation**, fixes, chacune avec une **évolution à injecter**
  tirée parmi cinq.

Le tirage est fait à la création du dossier et **écrit dedans** : il ne
change plus, même si le contenu évolue.

Le cahier des charges demandait au moins **20 000 variantes exploitables**.
L'ancien générateur combinatoire qui les produisait, `js/data/cdg-bank.js` et
`js/data/cdg-generator.js`, n'est plus utilisé pour les nouveaux examens ; il
reste dans le dépôt pour relire les dossiers d'avant l'alignement sur
l'archive, et la suite de tests en contrôle toujours le compte, l'équilibre
des thèmes et la reproductibilité par graine. `npm test` imprime ce compte à
chaque passage. Au dernier contrôle :

```
connaissances           800
commandement            300
situation n°1     1 080 000
situation n°2    38 880 000
──────────────────────────
total            39 961 100
```

---

## Correction assistée

> **Règle absolue.** Le site aide à noter et aide à décider. Il ne remplace
> jamais l'examinateur.

**Concours.** Chaque réponse s'affiche avec sa « Suggestion automatique »,
puis le champ de note de l'examinateur. La suggestion ne mesure que la
complétude de la réponse, d'après son nombre de mots (`autoText()`,
`js/scoring/auto.js`) ; la physique et le tir suivent le barème et les cibles
otage. La page le dit : « La note en rouge est une aide automatique fondée sur
la complétude de la réponse. »

**Examen Chef de Groupe.** La suggestion de l'archive vaut 35 % de longueur
de la réponse et 65 % de mots-clés retrouvés (`analyze()`,
`js/pages/examen-cdg/bareme.js`). Pour les dix questions de connaissances, la
correction affiche aussi les mots-clés **repérés** et ceux **à vérifier /
manquants** ; pour le commandement et les situations, la note suggérée seule.
La radio est suggérée à partir des réponses aux deux situations.

**La suggestion ne comprend pas le sens d'une phrase**, et c'est pour cela
qu'elle reste une suggestion. Champ de note vide : la suggestion est utilisée
dans le calcul. Note saisie, zéro compris : c'est elle qui compte, bornée au
barème.

Même logique pour le résultat : le concours affiche une « Proposition
automatique », l'examen une « Suggestion du système ». L'examinateur choisit
librement la décision finale et la motive dans un champ prévu ; la clôture
exige seulement qu'une décision soit choisie (et, au concours, respecte la
règle des cibles otage). À la clôture, ce que le système a proposé est écrit
dans le dossier à côté de ce que l'examinateur a retenu : au concours, toutes
les notes suggérées, les totaux et la décision proposée
(`suggestionSnapshot()`, `js/scoring/totals.js`) ; à l'examen, le total et la
décision suggérée.

---

## Historique centralisé

Un seul historique pour tout le portail, pas six historiques isolés. Page
« HISTORIQUE BAC 75 N », comme dans l'archive V4, avec **trois familles**
numérotées (`GROUPS`, dans `js/pages/historique/index.js`) :

- **Formations** — Négociation, Chef de Groupe, Radio, Antiterrorisme
- **Concours** — Concours d'intégration BAC
- **Examens** — Examen de qualification Chef de Groupe

Une famille ouvre ses **types** de dossier, un type ouvre son tableau. Les
anciens liens `?categorie=negociation` et `?categorie=cdg` mènent encore au
bon type. La recherche globale de l'en-tête et le `?dossier=` ouvrent le
tableau de tous les dossiers.

Les lignes sont les dossiers clôturés de tous les modules. Chacune porte le
numéro de dossier, l'agent, le matricule, la date, le type, la note, le
résultat et l'examinateur. Un champ de recherche filtre sur l'ensemble de ces
colonnes ; il n'y a pas d'autre filtre. Un clic ouvre la fiche résumée de
l'archive dans une fenêtre, avec la mention d'une version rectificative le
cas échéant, puis **OUVRIR LE DOSSIER** ouvre le dossier complet dans la page
de son module, en lecture seule (`#/concours?dossier=BAC-2026-001`).
L'accès rapide « Exporter un rapport » de l'accueil (`?export=1`) suit le
même chemin, pour imprimer une fiche finale.

**Ajouter un type de dossier au portail** = ajouter une entrée dans
`MODULES`, dans `js/core/records.js`, et son type dans `GROUPS`
(`js/pages/historique/index.js`). La numérotation, les brouillons et la
lecture seule suivent sans être retouchés. Un module illisible n'empêche pas
les autres de s'afficher : son erreur apparaît au-dessus des lignes lues.

**Ajouter une formation** = écrire son cours dans `js/data/formations/` et sa
page dans `js/pages/formations/` (au contrat du routeur, `layout: 'module'`,
avec sa feuille `css/pages/formation-<nom>.css`), lui donner une route dans
`js/routes.js`, son entrée dans `js/shell/nav.js` et sa carte dans le
catalogue (`js/pages/formations/index.js`). Il n'y a plus de moteur commun :
chaque formation reprend son module de l'archive.

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
| `accounts` | ouvrir les pages Administration et Gestion des utilisateurs |

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

- elle porte un numéro propre, `CDG-2026-001-R01` ;
- elle cite le dossier d'origine dans son champ `rectifies` ;
- l'index note sur la ligne d'origine quelle version la corrige
  (`rectifiedBy`), et l'historique l'affiche ;
- **le dossier d'origine n'est jamais réécrit.**

Une deuxième rectification s'empile en `-R02` sans écraser la première, et la
numérotation des nouveaux dossiers ignore les suffixes.

---

## Paramètres et direction BAC

La page **Paramètres** reprend la carte de l'archive : Directeur BAC et son
grade, Directeur adjoint BAC et son grade, **ENREGISTRER**. Valeurs
initiales : Directeur BAC — Lieutenant BOUSSERE Kevin ; Directeur adjoint
BAC — Brigadier LAURENT Cyril. Chaque nouveau dossier de concours ou d'examen
Chef de Groupe les copie à sa création, et elles figurent dans sa fiche finale
et ses signatures. Les formations, qui ne créent plus de dossier, ne les
emploient pas.

Sous la carte, trois boutons ouvrent ce que l'archive n'avait pas, dans une
fenêtre : **SEUILS DE SUGGESTION** (concours 800 / 650, Chef de Groupe
800 / 650 / 500), **BARÈME PHYSIQUE** (les trois paliers de chaque mesure) et
**MA SESSION** (rôle, permissions, échéance de la session, déconnexion).

Modification réservée aux rôles portant `settings` : administrateur, Directeur
BAC, Directeur adjoint BAC. Pour les autres, les champs sont grisés et les
boutons d'enregistrement absents.

Changer le rôle d'une personne **régénère son code** : l'ancien cesse de
fonctionner et le nouveau s'affiche une seule fois. C'est inévitable — le rôle
est scellé avec le code.

---

## Banque d'images

La documentation technique V4 nomme ses quinze visuels (§5) et interdit de les
remplacer par des visuels génériques. `js/data/images.js` est donc une **liste
de places** qui porte exactement cette nomenclature : chaque place dit quel
fichier est attendu, à quel endroit, et sur quel sujet.

Les pages reprises de l'archive — coque, accueil, catalogue des formations,
historique, modules — appellent directement les fichiers du kit, comme
l'archive. Dans le catalogue, les cartes Radio et Antiterrorisme reprennent
la scène de nuit de la citation (`12_…`) et l'unité aux boucliers (`14_…`) ;
les bandeaux des modules Radio et Antiterrorisme, eux, reprennent les
visuels de leur module d'archive (`14_…` et `13_…`).

Là où le portail passe par `js/data/images.js` (actualités, Formation
Négociation, fiches des anciens dossiers), un repli sert tant qu'une photo
n'est pas livrée : l'une des photos BAC déjà présentes dans `assets/img/`,
choisie pour rester cohérente avec la page.

**Pour livrer une photo**, la déposer dans `assets/bac75n/` sous son nom de kit
(`02_HOME_HERO_BAC_CONTROLE_NUIT.jpg`, `12_SIDEBAR_CITATION_BAC75N_NUIT.jpg`…).
Elle prend la place du repli au chargement suivant, sans toucher au code : les
deux images sont empilées en CSS, et la couche du haut ne peint rien tant que le
fichier n'existe pas. La liste complète est dans `assets/bac75n/README.md` et
dans `js/data/images.js`.

`00_REFERENCE_DESIGN_V4_VALIDEE.png` ne se dépose pas : c'est la capture de
référence, elle sert à comparer le rendu, pas à être affichée.

Le logo est `assets/bac75n/01_LOGO_BAC75N_PRINCIPAL.png` ;
`assets/logo-bac.svg` ne sert plus que de repli s'il manque.

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

Dans **Gestion des utilisateurs** (`#/administration/utilisateurs`), une
personne portant la permission `settings` voit la carte *Accès et rôles* : la
liste des accès, un sélecteur de rôle par ligne, un bouton pour retirer un
accès, et un formulaire d'ajout (grade, nom, rôle).

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

Au concours, le bouton **Imprimer / Enregistrer en PDF** précharge les photos,
nomme le document d'après le dossier et le candidat — le navigateur propose
donc `BAC-2026-001 — DURAND Léa.pdf` — puis ouvre la fenêtre d'impression. Le
bouton **Imprimer / PDF** de l'examen Chef de Groupe nomme le document de la
même façon. Il faut y choisir **Enregistrer au format PDF** comme
destination.

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
> `css/fiche/print.css` — mais le texte en excès sera alors perdu.

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
  radio/index.json              index de la formation radio
  radio/<ID>.json               un fichier par formation clôturée
  antiterrorisme/index.json     index de la formation antiterrorisme
  antiterrorisme/<ID>.json      un fichier par formation clôturée
  cdg/index.json                index des examens de qualification
  cdg/<ID>.json                 un fichier par examen clôturé
  drafts/<login>.json           brouillon de concours en cours
  drafts/negociation-<login>.json
  drafts/formation-cdg-<login>.json
  drafts/radio-<login>.json
  drafts/antiterrorisme-<login>.json
  drafts/cdg-<login>.json
```

| Opération | Requête | Code requis |
|---|---|---|
| Lire les dossiers, les index, les paramètres | `GET /contents/...?ref=data` | non |
| Écrire un brouillon, clôturer, modifier les paramètres | `PUT /contents/...` | oui |

Les formations n'écrivent plus rien : leurs index, dossiers et brouillons
sont ceux d'avant l'alignement sur l'archive, gardés pour l'historique.

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

Le code est rangé **par page** : chaque écran a son dossier sous
`js/pages/`, qui exporte une page au contrat du routeur. Ce contrat est écrit
en tête de `js/router.js` :

```
mainClass   classe posée sur <main> (facultatif)
template()  le HTML de la page, peint dans <main> avant mount()
mount(ctx)  remplit la page ; ctx = { params, session, alive() }
handlers    l'objet exposé sur window.app pour les gabarits
canLeave()  faux s'il reste des modifications non enregistrées
onHide()    l'onglet passe en arrière-plan : enregistrer ce qui traîne
unmount()   la page est quittée : arrêter ses minuteries
```

Comme dans la maquette V4, les **six modules** (concours, quatre formations,
examen Chef de Groupe) s'ouvrent **en plein écran**, chacun avec sa propre mise
en page : la route porte `layout: 'module'`, la coque du portail s'efface, et
la page affiche sa barre de retour au portail. Chaque module reprend à
l'identique le fichier `modules/*.html` de l'archive V4 : mêmes textes, mêmes
couleurs, même parcours. Les quatre formations ne sont donc plus qu'un cours
à lire, sans dossier ; un ancien dossier de formation ouvert depuis
l'historique (`?dossier=`) s'affiche en lecture seule avec sa fiche finale
(`js/pages/formations/fiche.js`). Chaque module a sa feuille
`css/pages/<module>.css`, dont toutes les règles sont rangées sous la classe
racine du module.

```
index.html                  la seule page : accès examinateur et portail
404.html                    redirige les anciennes pages à plat, sinon introuvable
.nojekyll                   désactive Jekyll
serve.cmd                   serveur local pour le développement
.github/workflows/pages.yml déploiement GitHub Pages

assets/favicon.svg          écusson, icône d'onglet
assets/logo-bac.svg         écusson complet, repli du logo du kit
assets/img/                 photos BAC (replis), en .jpg et en .webp
assets/bac75n/              banque du kit V4, nommée selon le §5

css/
  tokens.css                jetons V4 : couleurs, polices, mesures
  base.css                  éléments HTML, commandes, champs, tableaux, grille
  shell.css                 coque : barre latérale, en-tête, barre du module
  components.css            panneaux, bannières, étapes, questions, pastilles
  pages/
    acces.css               page d'accès (sert aussi au 404.html)
    portail.css             pages du portail (style.css de l'archive) : accueil,
                            formations, historique, administration, utilisateurs…
    concours.css            module Concours (plein écran)
    examen-cdg.css          module Examen Chef de Groupe (plein écran)
    formation-*.css         une feuille par formation (plein écran)
  fiche/
    dossier.css             pages A4 des fiches finales (.dossier-page, .dp-*)
    cover.css               couvertures de dossier (.cover-v2)
    print.css               toutes les règles @media print

tools/
  prompt.mjs                saisie masquée, lecture des jetons, confirmations
  access.mjs                codes et rôles : add, recode, remove, rotate
  guard.mjs                 protection des branches : status, apply, test
  restore.mjs               retour arrière sur les données : log, diff, rollback
  check-pages.mjs           contrôle statique du câblage gabarits ↔ JavaScript
  test.mjs                  suite de tests du portail
  smoke.mjs                 démarrage du portail et ouverture de chaque route

js/
  main.js                   entrée unique : stockage, session, accès ou portail
  routes.js                 table des routes #/…, alias, anciennes pages
  router.js                 une adresse → une page, contrat de page
  config.js                 dépôt GitHub, branche de données, autosave, barèmes

  shell/
    index.js                coque : réglages partagés, peinture, recherche
    nav.js                  liste unique de navigation
    sidebar.js              barre latérale
    header.js               en-tête et recherche globale
    feedback.js             bandeaux, état d'enregistrement, refus d'accès
    modal.js                fenêtre modale du portail
    asset.js                chemin des images posées en variable CSS

  pages/
    acces/                  page d'accès : entrée et formulaire
    accueil/                accueil et actualités tirées au hasard (news-pool.js)
    concours/               concours : index, navigation, passage, correction,
                            résultats, fiche finale 8 pages (dossier.js)
    formations/
      index.js              catalogue des formations
      fiche.js              fiche finale d'un ancien dossier, 3 pages A4
      negociation.js        une page par formation : le cours de l'archive,
      chef-de-groupe.js     plus la lecture d'un ancien dossier
      radio.js
      antiterrorisme.js
      layouts/              gabarits HTML de la négociation, du Chef de Groupe
                            et de l'antiterrorisme
    examen-cdg/
      index.js              contrôleur de l'examen (huit onglets de l'archive)
      dossier.js            dossier au format de l'archive, migration
      vues.js               gabarits des onglets
      bareme.js             barème /1000 et suggestion
      fiche.js              fiche des dossiers d'avant la V4, 5 pages A4
    historique/             historique central, recherche et export
    actualites/             actualités : liste et détail
    administration/         index et cartes : actualités, journal, stockage,
                            modules, images
    utilisateurs/           accès, rôles et effectifs
    parametres/             direction BAC, seuils de suggestion, profil

  ui/
    stepper.js              étapes, générique
    chips.js                pastilles de décision, tous vocabulaires
    autosave.js             enregistrement automatique commun des brouillons

  data/
    questions.js            30 questions de l'archive (questionnaire théorique)
    radio.js                exercice radio du concours (V4 et d'origine)
    scenarios.js            5 mises en situation du concours (V4 et d'origine)
    content-set.js          version du contenu d'épreuve d'un dossier
    steps.js                les 9 étapes du concours
    formations/
      index.js              registre des formations (COURSES)
      negociation-cours.js  cours de l'archive : Négociation (20 chapitres)
      chef-de-groupe-lecons.js  cours de l'archive : Chef de Groupe (16 chapitres)
      radio-cours.js        cours de l'archive : Radio (9 chapitres)
      antiterrorisme.js     cours de l'archive : Antiterrorisme (13 chapitres)
      negociation.js, chef-de-groupe.js, radio.js, antiterrorisme-dossiers.js
                            anciens contenus, gardés pour relire les anciens dossiers
    cdg-examen.js           examen Chef de Groupe de l'archive : thèmes, situations
    cdg-bank.js             anciens fragments de l'examen (anciens dossiers)
    cdg-generator.js        ancien générateur et barème (anciens dossiers)
    images.js               places d'images du kit V4 et replis
    news.js                 actualités de départ et visibilités

  core/
    dom.js                  helpers DOM, échappement HTML, initiales
    github-api.js           client API Contents GitHub (lecture/écriture/retry)
    store.js                persistance : driver github ou mémoire
    records.js              registre des modules et des familles, dossier commun
    journal.js              journal des actions sensibles
    roles.js                rôles et permissions
    lifecycle.js            statuts et avancement d'un dossier (annexe B)
    thresholds.js           seuils de suggestion, centralisés (§8.6, §11.3)
    news.js                 lecture et écriture des actualités
    effectifs.js            comptage des effectifs par corps
    auth.js                 session, code personnel, rôles, expiration
    session-store.js        mémorisation de la session, avec replis
    roster.js               création, rôle et retrait des accès
    crypto.js               AES-GCM + PBKDF2, génération et format des codes
    state.js                modèle du dossier de concours
    formation.js            modèle du dossier de formation, version d'évaluation
    cdg-state.js            modèle du dossier d'examen, durée de l'épreuve

  scoring/
    auto.js                 suggestions automatiques du concours
    totals.js               notes finales du concours, total /1000, décision
    assist.js               correction assistée : attendus, suggérée, retenue
    cdg.js                  notation de l'examen par section, recommandation
```

JavaScript natif, modules ES, aucune dépendance et aucune étape de build.

---

## Tests

```bash
npm test                     # règles métier, puis démarrage du portail
npm run check                # contrôle du câblage seul
node tools/test.mjs          # règles métier seules
node tools/smoke.mjs         # démarrage du portail et chaque route
```

Tout tourne en mémoire : aucun réseau, aucun jeton, aucune écriture dans le
dépôt. Au dernier passage : **36 groupes** de règles métier,
**16 contrôles** de démarrage, **13 routes** sans problème de câblage. Ce qui
est vérifié, ce sont les règles du cahier des charges qui ne doivent pas se
perdre au fil des modifications :

| Groupe | Ce qui est tenu |
|---|---|
| §5 | le concours ne régresse pas, sa fiche fait toujours 8 pages |
| §6 §7 | les anciens contenus Négociation et Chef de Groupe relisent leurs dossiers : évaluation, fiche de 3 pages |
| §8 | l'ancien barème de l'examen vaut exactement 1000, vérifié sur 50 tirages |
| §9 | ancien générateur : au moins 20 000 variantes, dix thèmes par tirage, tirage reproductible |
| §10 | la note de l'examinateur prime toujours, dans les deux sens |
| §11 | l'ancienne fiche de qualification porte ses quatre signatures et ses champs |
| §12 | chaque ligne d'historique porte les champs exigés |
| §14 | chaque rôle a les permissions annoncées, le journal s'écrit |
| §15 | une correction après clôture ne réécrit pas le dossier d'origine |
| HOME | quatre cartes, quatre panneaux, jetons et mesures V4 (§6, §21) |
| §8.5 | cible otage, triche, abandon : les règles bloquantes passent avant le total |
| §8.6 §11.3 | les seuils vivent dans la configuration et s'appliquent vraiment |
| annexe B | statuts et avancement d'un dossier, neuf étapes au concours |
| §18 | actualités et effectifs tiennent sur des données, pas sur des constantes |
| §5 | la banque d'images suit la nomenclature du kit et garde ses replis |
| §4.1 | une seule page, une adresse `#/…` par écran, anciennes adresses redirigées |
| §8.4 | le barème physique se règle, et les paliers restent ordonnés |
| §11.2 | la suggestion vaut 35 % de complétude et 65 % de critères |
| §12 §14 | suggestion archivée, version du modèle et piste d'audit du dossier |
| §22 | WebP plus léger que l'original, miniatures différées et dimensionnées |
| SEC-001 GHP-001 | aucun jeton livré, routes servies sous un sous-chemin |
| V4 concours | jumping jacks à la place du gainage, anciens dossiers intacts ; les 30 questions de l'archive, radio et situations de l'archive |
| V4 examen | huit onglets, barème /1000 et seuils de l'archive, aucun dossier dans le `localStorage` ; dans l'ancien générateur, évolution à injecter et questions de commandement |
| V4 négociation | vingt chapitres et grille /100 de l'archive, plus de parcours à étapes, questionnaire hérité pour les anciens dossiers |
| V4 formations | registre des quatre formations : route, module de dossier, image |
| Archive Chef de Groupe | seize chapitres de l'archive, cours seul, anciens dossiers lisibles |
| V4 antiterrorisme | treize chapitres de l'archive, aucune saisie, anciens dossiers lisibles |
| câblage | handlers, points de montage, routes, ressources, styles et imports |

`npm run check` (`tools/check-pages.mjs`) attrape ce qu'aucun test d'unité ne
voit sur un site sans build : un `onclick="app.x()"` dont la page ne déclare
plus `x`, un `setHTML('zone', …)` dont l'élément a disparu, un
`href('route')` vers une route que `js/routes.js` ne connaît pas, une
ressource absente du dépôt, une feuille du dossier `css/` que `index.html` ne
charge pas, un import au mauvais chemin. La suite de tests l'appelle aussi.

`tools/smoke.mjs` va plus loin : il **démarre le portail par son entrée**
(`js/main.js`) comme le ferait le navigateur, vérifie que l'accès examinateur
s'affiche sans session, se connecte, puis **ouvre chaque route** de
`js/routes.js`, **parcourt toutes les étapes** des modules — correction et
fiche finale comprises — et chaque chapitre de chaque cours, et finit par la
déconnexion. Une page qui reste blanche, une erreur au montage, une fiche qui
ne se remplit pas : le contrôle le dit. Le portail tourne en mode local, dans
une copie temporaire de `js/` : aucun réseau, aucune écriture.

> **Ce que ces contrôles ne remplacent pas.** Ils ne lancent pas de vrai
> navigateur : la mise en page, l'impression PDF et les écritures réelles vers
> GitHub se vérifient à l'œil, une fois le site servi. Ce qu'ils couvrent, c'est
> la logique, le câblage et le démarrage de chaque page.

---

## Développement local

Le site utilise des modules ES, que les navigateurs refusent de charger depuis
`file://`. Ouvrir `index.html` par double-clic donne donc une erreur CORS. Il
faut passer par HTTP.

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

La redirection des anciennes adresses par `404.html` suppose le sous-chemin
GitHub Pages (`/Concours-Bac-Frrp-RP/`) : en local, elle ne s'applique pas.

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
| §4.1 routes | `js/routes.js` (une adresse `#/…` par écran), `js/router.js`, `404.html` pour les anciennes pages |
| §5 banque d'images | `js/data/images.js`, `assets/bac75n/` |
| §6 design system, barre latérale, en-tête | `css/tokens.css` (jetons et mesures), `css/shell.css`, `js/shell/` |
| §6.4 quatre cartes, §6.5 quatre panneaux | `js/pages/accueil/index.js`, `css/pages/portail.css` |
| §7 comportement de l'accueil | `js/pages/accueil/index.js` |
| §8 concours | `js/pages/concours/`, `js/scoring/auto.js`, `js/scoring/totals.js` |
| §8.4 barème physique | `js/config.js` → `js/core/thresholds.js`, réglable sur `#/administration/parametres` |
| §8.6 et §11.3 seuils | `js/core/thresholds.js`, réglables sur `#/administration/parametres` |
| §11.2 formule de suggestion | examen Chef de Groupe : `analyze()` dans `js/pages/examen-cdg/bareme.js` — 35 % longueur + 65 % mots-clés ; anciens dossiers : `js/scoring/assist.js` |
| §9 et §10 formations | `js/data/formations/` (cours de l'archive : Négociation 20 chapitres, Chef de Groupe 16, Radio 9, Antiterrorisme 13), `js/pages/formations/` |
| §11 examen Chef de Groupe | `js/data/cdg-examen.js`, `js/pages/examen-cdg/` (barème : `bareme.js`) ; anciens dossiers : `js/data/cdg-generator.js`, `js/scoring/cdg.js` |
| §12 suggestion ≠ décision | `js/pages/concours/correction.js`, `js/pages/concours/results.js`, `js/pages/examen-cdg/vues.js` |
| §12 suggestion archivée | concours : `suggestionSnapshot()` dans `js/scoring/totals.js` ; examen : total et décision suggérée, dans `close()` de `js/pages/examen-cdg/index.js` ; écrits à la clôture |
| §13 fiches finales et signatures | `js/pages/concours/dossier.js`, `js/pages/examen-cdg/vues.js` ; anciens dossiers : `js/pages/examen-cdg/fiche.js`, `js/pages/formations/fiche.js` |
| §14 modèle de données | `js/core/records.js`, `js/core/store.js` ; `version` et `auditTrail` portés par chaque dossier |
| §15 cycle de vie, annexe B | `js/core/lifecycle.js` |
| §16 historique centralisé | `js/pages/historique/index.js` (familles et types), modules dans `js/core/records.js` |
| §17 rôles, §17.1 journal | `js/core/roles.js`, `js/core/journal.js`, `js/pages/utilisateurs/`, `js/pages/administration/` |
| §18 actualités, dossiers, accès rapides, effectifs | `js/core/news.js`, `js/core/effectifs.js`, `js/pages/accueil/index.js` |
| §19 GitHub Pages | `.github/workflows/pages.yml`, `404.html`, chemins relatifs |
| §22 performance et accessibilité | WebP via `image-set()`, miniatures différées et dimensionnées, focus visible, pages chargées à la demande |
| §21 recette | `tools/test.mjs`, `tools/smoke.mjs`, `tools/check-pages.mjs` |

Les routes suivent désormais la maquette : une seule page et une adresse
`#/…` par écran, sans routeur côté serveur ni repli 404 à configurer sur
GitHub Pages. Il reste une impossibilité :

- **l'authentification et les permissions côté serveur** (§17, §19.2) sont
  impossibles sur un hébergement statique. Voir ci-dessus.

---

## Ce qui reste à faire

Ce qui dépend du commanditaire, et rien n'a été inventé à sa place :

- **la banque d'images BAC** — quatorze visuels du kit sont déposés dans
  `assets/bac75n/` ; il manque `15_HOME_CARD_HISTORIQUE_BAC75N.jpg`, que le
  kit ne contient pas. Sa place existe dans `js/data/images.js`, mais aucune
  page ne l'affiche aujourd'hui : l'historique de l'archive emploie d'autres
  visuels ;
- **les droits d'utilisation des photos** — à vérifier avant toute
  publication publique (§5) ;
- **la Formation Intervention** — annoncée par l'archive avec la mention
  « Bientôt », elle a été retirée du menu ; aucun contenu n'existe.

Ce que les contrôles automatiques ne voient pas, et qui se vérifie à l'œil
une fois le site servi : la mise en page, l'impression PDF et les écritures
réelles vers GitHub.

Deux points sont des choix assumés, pas des oublis :

- **le contenu de l'archive plutôt que celui du cahier des charges** — les
  modules reprennent l'archive V4 à l'identique. Les formations sont donc des
  cours sans évaluation enregistrée, et l'examen Chef de Groupe compose ses
  questions comme l'archive, loin des 20 000 variantes demandées ;
  l'ancien générateur ne sert plus qu'aux anciens dossiers ;

- **authentification et permissions côté serveur (§17, §19.2)** — impossibles
  sur un hébergement statique. Ce qui tient leur place est décrit plus haut,
  avec ses limites : codes personnels chiffrés, rôles scellés dans la charge,
  journal des actions sensibles, branches protégées et restauration. Le passage
  à un backend ne touche que `js/core/store.js`.

---

## Licence

Voir [LICENSE](LICENSE).
