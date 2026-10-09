// Adresse d'un visuel du kit pour une variable CSS (`--bg`, `--img`).
//
// L'archive pose ses photos par `style="--bg:url('assets/…')"`. Une url()
// portée par une variable se résout depuis la feuille qui l'emploie : ici
// css/pages/portail.css, pas la page. On donne donc l'adresse complète,
// calculée depuis le document, pour que la photo se charge où que le site
// soit publié (racine ou sous-dossier GitHub Pages).

const KIT = 'assets/bac75n/';

export function kitUrl(file) {
  const path = `${KIT}${file}`;
  try {
    return new URL(path, document.baseURI).href;
  } catch (error) {
    return path;
  }
}

/** `--name:url('…')` prêt pour un attribut style. */
export function kitVar(name, file) {
  return `--${name}:url('${kitUrl(file)}')`;
}
