// Formation Radio BAC — le cours du module de l'archive V4, mot pour mot.
//
// Source : modules/formation-radio.html de l'archive BAC75N_SITE_V4. Le
// module n'a qu'un cours : un sommaire interactif de neuf chapitres, chacun
// fait de cartes et d'encadrés. Pas d'identité, pas d'évaluation, pas de
// fiche : rien ne s'enregistre.
//
// `nav`  le libellé du sommaire (il diffère parfois du titre du chapitre) ;
// `html` le contenu du chapitre, repris de l'archive avec ses classes
//        préfixées `mr-` pour rester à l'abri des styles du portail
//        (css/pages/formation-radio.css).
//
// Les anciens dossiers radio, créés quand le module avait un parcours
// évalué, se relisent avec js/data/formations/radio.js.

export const RADIO_COURS = [
  {
    num: '01',
    nav: 'Fondamentaux radio',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 01</small><h2>FONDAMENTAUX RADIO</h2>
      </div>
      <div class="mr-grid2"><div><div class="mr-card"><h3><span>1.1</span> Rôle de la radio</h3>
      <p>La radio permet aux unités et au centre radio de partager rapidement les informations nécessaires à la coordination d’une intervention.</p>
      <ul><li>Écouter avant de parler</li><li>Transmettre des informations claires et précises</li><li>Être concis et aller à l’essentiel</li><li>Respecter la discipline du réseau</li></ul>
      <div class="mr-info"><b>À RETENIR</b><br>Une transmission claire, courte et structurée réduit les erreurs et améliore la coordination.</div>
      </div>
      <div class="mr-card"><h3><span>1.2</span> Terminologie essentielle</h3>
      <p><b>TN / Centre radio :</b> centre de commandement et de coordination<br><b>Indicatif :</b> nom radio d’une unité<br><b>Écoute :</b> réception des communications<br><b>Vacation :</b> période d’activité sur le réseau<br><b>Transmettez :</b> autorisation de parler donnée par le centre<br><b>Reçu :</b> confirmation de bonne réception</p>
      </div>
      </div>
      <div><div class="mr-important"><h3>POINTS ESSENTIELS</h3>
      <p>✓ Toujours écouter avant de parler<br>✓ Parler calmement et distinctement<br>✓ Utiliser un ton professionnel<br>✓ Être concis<br>✓ Respecter la discipline du réseau</p>
      </div>
      <div class="mr-photo"></div>
      </div>
      </div>`
  },
  {
    num: '02',
    nav: 'Discipline du réseau',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 02</small><h2>DISCIPLINE DU RÉSEAU</h2>
      </div>
      <div class="mr-card"><h3><span>2.1</span> Règles de communication</h3>
      <ul><li>Ne pas couper une transmission sauf nécessité urgente.</li><li>Préparer mentalement le message avant d’émettre.</li><li>Éviter les répétitions et les détails secondaires.</li><li>Laisser le réseau disponible après son message.</li></ul>
      </div>
      <div class="mr-important"><h3>ERREUR À ÉVITER</h3>
      <p>Monopoliser le réseau ou transmettre une longue explication alors que la localisation, la situation et le besoin peuvent être donnés immédiatement.</p>
      </div>`
  },
  {
    num: '03',
    nav: 'Prise d’écoute & vacation',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 03</small><h2>PRISE D’ÉCOUTE ET PRISE DE VACATION</h2>
      </div>
      <div class="mr-card"><h3><span>3.1</span> Composition des effectifs</h3>
      <div class="mr-corps"><div><b>1er</b><br>Corps de direction</div>
      <div><b>2e</b><br>Corps de commandement</div>
      <div><b>3e</b><br>Corps d’application</div>
      </div>
      <p><b>Exemple : 0 + 1 + 2</b> = aucun corps de direction, un corps de commandement, deux corps d’application.</p>
      </div>
      <div class="mr-card"><h3><span>3.2</span> Exemple — BAC 75 N Alpha</h3>
      <div class="mr-dialogue"><div class="mr-who">BAC 75 N Alpha</div>
      <div class="mr-msg">« TN 75 de BAC 75 N Alpha. »</div>
      </div>
      <div class="mr-dialogue"><div class="mr-who mr-tn">TN 75</div>
      <div class="mr-msg">« Transmettez. »</div>
      </div>
      <div class="mr-dialogue"><div class="mr-who">BAC 75 N Alpha</div>
      <div class="mr-msg">« TN 75 de BAC 75 N Alpha, annonce la prise d’écoute et la prise de vacation de la BAC 75 N Alpha, à son bord trois effectifs, effectifs masculins et/ou féminins, en <b>0 + 1 + 2</b>, pour des missions de brigade anticriminalité sur Paris et ses alentours. Comment est-ce reçu, parlez. »</div>
      </div>
      </div>
      <div class="mr-card"><h3><span>3.3</span> Exemple — BAC 200 Charlie</h3>
      <div class="mr-dialogue"><div class="mr-who">BAC 200 Charlie</div>
      <div class="mr-msg">« TN 75 de BAC 200 Charlie. »</div>
      </div>
      <div class="mr-dialogue"><div class="mr-who mr-tn">TN 75</div>
      <div class="mr-msg">« Transmettez. »</div>
      </div>
      <div class="mr-dialogue"><div class="mr-who">BAC 200 Charlie</div>
      <div class="mr-msg">« TN 75 de BAC 200 Charlie, annonce la prise d’écoute et la prise de vacation de la BAC 200 Charlie, à son bord trois effectifs, deux masculins et un féminin, en <b>0 + 1 + 2</b>, dans un véhicule banalisé, pour des missions de brigade anticriminalité ou de flagrance sur Paris et ses alentours. Comment est-ce reçu, parlez. »</div>
      </div>
      </div>`
  },
  {
    num: '04',
    nav: 'Indicatifs & appel',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 04</small><h2>INDICATIFS ET APPEL</h2>
      </div>
      <div class="mr-card"><p class="mr-formula"><em>TN 75</em> de <em>[INDICATIF]</em></p>
      <p>Le centre répond : <b>« Transmettez. »</b> L’équipage délivre ensuite son message puis termine par une demande de réception lorsque cela est utile.</p>
      </div>`
  },
  {
    num: '05',
    nav: 'Structure transmission',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 05</small><h2>STRUCTURE D’UNE TRANSMISSION</h2>
      </div>
      <div class="mr-card"><p class="mr-formula"><em>QUI</em> → OÙ → SITUATION → BESOIN → MISE À JOUR</p>
      <p>Le message doit permettre de comprendre immédiatement qui parle, où se situe l’équipage, ce qu’il se passe et ce qui est demandé.</p>
      </div>`
  },
  {
    num: '06',
    nav: 'Raccourcis interventions',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 06</small><h2>RACCOURCIS INTERVENTIONS</h2>
      </div>
      <div class="mr-shortcuts"><div class="mr-shortcut"><b>IPM</b><br>Ivresse publique et manifeste</div>
      <div class="mr-shortcut"><b>AVP</b><br>Accident de la voie publique</div>
      <div class="mr-shortcut"><b>ILS</b><br>Individu à terre</div>
      <div class="mr-shortcut"><b>GAV</b><br>Garde à vue</div>
      <div class="mr-shortcut"><b>PV</b><br>Procès-verbal</div>
      <div class="mr-shortcut"><b>VL</b><br>Véhicule léger</div>
      </div>`
  },
  {
    num: '07',
    nav: 'Situations spécifiques',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 07</small><h2>SITUATIONS SPÉCIFIQUES</h2>
      </div>
      <div class="mr-card"><h3>Urgence / renfort</h3>
      <p>Donner en priorité la localisation, la nature de la difficulté et le besoin. Les détails viennent ensuite lorsque le réseau est disponible.</p>
      </div>`
  },
  {
    num: '08',
    nav: 'Exercices pratiques',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 08</small><h2>EXERCICES PRATIQUES</h2>
      </div>
      <div class="mr-card"><h3>Exercice 1 — Prise d’écoute</h3>
      <p>Le formateur attribue un indicatif, une composition d’effectifs et un secteur. Le stagiaire doit effectuer l’appel au TN puis annoncer correctement sa prise de vacation.</p>
      </div>
      <div class="mr-card"><h3>Exercice 2 — Transmission courte</h3>
      <p>À partir d’une situation donnée, le stagiaire sélectionne les informations réellement utiles et construit un message concis.</p>
      </div>`
  },
  {
    num: '09',
    nav: 'Fiches réflexes',
    html: `
      <div class="mr-titlebox"><small>CHAPITRE 09</small><h2>FICHES RÉFLEXES</h2>
      </div>
      <div class="mr-card"><p class="mr-formula">ÉCOUTER → IDENTIFIER → LOCALISER → INFORMER → PRIORISER → DEMANDER → ACTUALISER → RENDRE COMPTE</p>
      </div>`
  }
];
