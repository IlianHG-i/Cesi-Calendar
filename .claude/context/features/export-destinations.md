# feat/export-destinations

## Objectif
Ajouter des boutons d'export ciblés dans le popup pour chaque destination :
- **Google Calendar** → push direct via API (déjà implémenté)
- **Proton Calendar** → génération `.ics` + instructions d'import (pas d'API publique)
- **iCalendar / Apple Calendar** → génération `.ics` + instructions d'import (pas d'API publique)

Plus un **README explicatif** pour Proton et iCalendar (comment importer le `.ics`).

## Dépendance sur feat/export-3-weeks
⚠️ Cette feature doit être implémentée **après le merge de `feat/export-3-weeks`**, parce que :
- Le popup aura déjà un nouveau bouton "Exporter plusieurs semaines" + sélecteur → il faut intégrer les destinations avec cette logique multi-semaines
- Le README d'import doit mentionner que les `.ics` peuvent contenir 1 ou N semaines selon le bouton utilisé
- Chaque bouton destination (Google/Proton/Apple) doit probablement respecter le `weeks` choisi par l'utilisateur → décision UX à prendre : un sélecteur global "N semaines" qui s'applique à toutes les destinations ? ou 2 variantes par destination (1 semaine / multi) ?

**À rebaser sur main après le merge de feat/export-3-weeks avant de coder.**

## Scope
- `popup.html` :
  - Bouton Google Calendar (déjà existant : `#exportGoogleBtn`) — garder
  - Ajouter bouton "Exporter vers Proton Calendar"
  - Ajouter bouton "Exporter vers Apple Calendar / iCal"
  - Trancher le sort du bouton `#exportIcsBtn` actuel (iCal générique)
- `scripts/popup.js` : handlers pour les nouveaux boutons. Proton et Apple téléchargent le même `.ics` mais affichent des instructions d'import différentes.
- `README.md` (ou `docs/IMPORT_PROTON.md` + `docs/IMPORT_APPLE.md`) : tutoriel pas-à-pas.
- Pas d'impact sur `content-script.js` (le `.ics` généré est le même).
- Pas d'impact sur `background.js` (OAuth Google inchangé).

## Décisions
- Proton et Apple Calendar n'ont pas d'API → téléchargement `.ics` + import manuel documenté.
- Google reste le seul vrai "push automatique".
- README d'import dans le repo pour référence rapide.

## Questions ouvertes (à valider avant code)
- Bouton "iCal générique" actuel : on le supprime (remplacé par Proton + Apple qui produisent le même fichier), ou on le garde ?
- Instructions d'import : encart inline dans le popup au succès, ou lien "voir le tutoriel" vers le README GitHub ?
- Comportement multi-semaines : un sélecteur global qui s'applique à toutes les destinations, ou un bouton "1 semaine" + un bouton "N semaines" par destination ?

## TODOs
- [ ] Attendre le merge de `feat/export-3-weeks` et rebase
- [ ] Trancher les questions ouvertes
- [ ] Ajouter les boutons dans `popup.html`
- [ ] Handlers dans `popup.js`
- [ ] Rédiger sections README Proton + Apple (mentionner la possibilité d'export multi-semaines)
- [ ] Bump manifest + popup footer
- [ ] PR + merge + tag
