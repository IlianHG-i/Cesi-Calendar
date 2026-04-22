# feat/remove-txt-export

## Objectif
Supprimer complètement l'export TXT. L'auto-export au chargement de la page téléchargeait un `.txt` par défaut à chaque visite — on ne veut plus que de l'iCal (et le push Google Calendar qui existe déjà).

## Fichiers concernés
- `scripts/content-script.js` : retirer `generateTextFile()`, `downloadTextFile()`, la branche `format === 'text'`, changer les defaults `'text'` → `'ics'`
- `popup.html` : retirer le bouton `#exportTxtBtn`
- `scripts/popup.js` : retirer la ref DOM, le listener, l'entrée `'text': 'TXT'` du mapping

## Décisions
- Le défaut de `autoExport()` devient `'ics'` (c'est ce qui déclenche l'auto-download au chargement).
- Pas de migration de données : le localStorage de tracking est format-agnostique.
- Pas un breaking change côté user final puisque l'UX principale (auto-download) reste, juste en `.ics`.

## TODOs
- [x] Branche créée
- [x] Edits content-script
- [x] Edits popup.html + popup.js
- [x] Vérif grep : plus aucune occurrence de `.txt` / `generateTextFile` / `exportTxtBtn` / `'text'`
- [x] Commit `feat: remove TXT export format`
