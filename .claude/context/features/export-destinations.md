# feat/export-destinations

## Objectif
Ajouter des boutons d'export ciblés dans le popup pour chaque destination :
- **Google Calendar** → push direct via API (déjà implémenté, à garder/renommer proprement)
- **Proton Calendar** → génération `.ics` + instructions d'import (pas d'API publique)
- **iCalendar / Apple Calendar** → génération `.ics` + instructions d'import (pas d'API publique)

Plus un **README explicatif** pour Proton et iCalendar (comment importer le `.ics` téléchargé).

## Scope
- `popup.html` :
  - Garder/renommer bouton Google Calendar (déjà existant : `#exportGoogleBtn`)
  - Ajouter bouton "Exporter vers Proton Calendar" (télécharge `.ics` + ouvre/affiche instructions)
  - Ajouter bouton "Exporter vers Apple Calendar / iCal" (télécharge `.ics` + ouvre/affiche instructions)
  - Remplace ou complète le bouton `#exportIcsBtn` actuel ? → à trancher : on peut garder iCal générique + ajouter Proton + Apple, ou fusionner. Proposition : supprimer le "iCal générique" et exposer Proton + Apple qui utilisent tous deux le même `.ics` en dessous.
- `scripts/popup.js` : handlers pour les nouveaux boutons, chacun déclenche le download `.ics` + affiche un bloc d'instructions spécifique (Proton vs Apple).
- `README.md` (ou nouveaux fichiers `IMPORT_PROTON.md` / `IMPORT_APPLE.md`) : tutoriel pas-à-pas avec screenshots si possible.
- Pas d'impact sur `content-script.js` (le `.ics` généré est le même).
- Pas d'impact sur `background.js` (OAuth Google inchangé).

## Décisions
- Proton et Apple Calendar n'ont pas d'API → on télécharge un `.ics` et on explique l'import manuel.
- Garder Google comme seul push "automatique" au sens strict.
- README d'import dans le repo pour que l'utilisateur ait la procédure sous la main.

## Questions ouvertes (à valider avant code)
- On garde le bouton "iCal générique" actuel, ou on le remplace par 2 boutons Proton + Apple ?
- Les instructions d'import : inline dans le popup (petit encart) ou lien vers le README GitHub ?

## TODOs
- [ ] Trancher les questions ouvertes ci-dessus
- [ ] Ajouter les boutons dans `popup.html` + styles si besoin
- [ ] Ajouter les handlers dans `popup.js`
- [ ] Rédiger les sections README Proton + Apple
- [ ] Bump manifest + popup footer
- [ ] PR + merge + tag

## Dépendance
Indépendant de `feat/export-3-weeks` — les 2 peuvent être développés en parallèle et mergés dans l'ordre voulu.
