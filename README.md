# Branche `data` — base de données du concours BAC

Cette branche n'est **pas** le site. Elle contient les données écrites par
l'application, qui vit sur la branche `main`.

- Site : <https://luciefairepy.github.io/Concours-Bac-Frrp-RP/>
- Code : [branche `main`](https://github.com/LucieFairePy/Concours-Bac-Frrp-RP/tree/main)

## Contenu

| Chemin | Rôle |
|---|---|
| `data/settings.json` | direction BAC, partagée par tous les examinateurs |
| `data/users.json` | comptes GitHub autorisés à écrire, avec grade et nom |
| `data/dossiers/index.json` | index des dossiers clôturés, alimente l'historique |
| `data/dossiers/<ID>.json` | un dossier clôturé, en lecture seule |
| `data/drafts/<login>.json` | brouillon en cours d'un examinateur |

## Pourquoi une branche séparée

`main` est la source de GitHub Pages. Écrire les brouillons sur `main`
déclencherait une reconstruction du site toutes les 30 secondes, et les builds
Pages sont limités en nombre par heure. Les push sur cette branche ne
redéploient rien.

## À ne pas faire

- supprimer `data/users.json` : plus personne ne peut écrire
- supprimer `data/dossiers/index.json` : l'historique repasse en mode lent
  (lecture de chaque dossier un par un), mais rien n'est perdu
- renommer `data/` sans changer `dataDir` dans `js/config.js` sur `main`

Un dossier supprimé par erreur reste récupérable dans l'historique git de cette
branche.
