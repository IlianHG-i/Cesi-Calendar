# feat/export-image

## Objectif
Ajouter un bouton pour télécharger l'emploi du temps affiché en **PNG** (capture d'image du calendrier), en plus des exports iCal déjà existants.

## Décisions
- **Format : PNG** (plutôt que JPEG). PNG est sans perte, gère les textes nets du calendrier, les dégradés de couleurs par matière, et supporte la transparence si besoin. JPEG aurait introduit du flou sur le texte.
- **Librairie : html2canvas** (MIT, ~50KB minifié) bundlée localement dans `lib/`. Pas de CDN à cause des restrictions CSP de MV3.
- **Cible DOM** : `.fc-view` (la grille complète du calendrier FullCalendar).
- **Semaine courante uniquement** pour la v1. Le multi-semaines viendra plus tard si besoin (ça ferait N fichiers PNG distincts, pas un seul).

## Scope
- `lib/html2canvas.min.js` : nouvelle dépendance bundlée
- `manifest.json` : ajouter la lib dans les `content_scripts` (chargée avant `content-script.js`)
- `scripts/content-script.js` : nouvelle fonction `exportAsImage()` qui capture `.fc-view`, convertit en PNG blob, déclenche le download. Nouveau format `'png'` supporté par le message handler.
- `popup.html` : nouveau bouton "Télécharger en image (.png)"
- `scripts/popup.js` : handler qui envoie `{ format: 'png', weeks: 1 }`
- Pas d'impact sur `background.js`, `lib/ics-generator.js`.

## TODOs
- [x] Branche créée
- [ ] Télécharger html2canvas min dans lib/
- [ ] Mettre à jour manifest.json
- [ ] Fonction exportAsImage() dans content-script.js
- [ ] Bouton + handler popup
- [ ] Bump version (1.4.0)
- [ ] PR + merge + tag
