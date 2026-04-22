# feat/export-3-weeks

## Objectif
Étendre l'export de 1 semaine à **3 semaines** : la semaine actuellement affichée + les 2 suivantes. Remplace le comportement existant (pas de nouveau bouton).

## Scope
- `scripts/content-script.js` :
  - Actuellement `extractFullWeek()` extrait 6 jours (Lundi→Samedi) via navigation jour par jour.
  - Il faut étendre pour faire 3 × 6 jours = 18 jours, soit parcourir la semaine courante puis cliquer "semaine suivante" 2 fois et refaire l'extraction.
  - Attention à la navigation FullCalendar : il y a des boutons "semaine suivante" / "jour suivant" distincts — repérer le bon sélecteur.
  - Gérer l'état `allEvents` pour accumuler sur les 3 semaines.
  - Adapter le nom de fichier : actuellement `emploi-du-temps-cesi-semaine-${weekNumber}.ics` → probablement `emploi-du-temps-cesi-semaines-${n}-${n+2}.ics`.
  - Notification de progression : indiquer "Semaine 1/3", "Semaine 2/3", etc.
- Vérif : impact sur l'export Google Calendar (même flot d'événements, devrait marcher tel quel).
- Pas d'impact sur `lib/ics-generator.js`, `popup.html`, `scripts/popup.js`, `scripts/background.js`.

## Décisions
- Semaines : courante + 2 suivantes (pas de précédente).
- Pas de nouveau bouton — remplace le flux existant (auto-export + popup).
- Timing : avec `LOAD_DELAY_MS=800`, on passe de ~5s (6 jours) à ~15-18s pour 18 jours + 2 transitions de semaine. Acceptable.

## TODOs
- [ ] Identifier le sélecteur du bouton "semaine suivante" dans FullCalendar côté ENT
- [ ] Refactor `extractFullWeek()` → `extractMultipleWeeks(count)`
- [ ] Adapter le nom de fichier + la notification de progression
- [ ] Tester sur la vraie page ENT
- [ ] Bump manifest + popup footer (probablement 1.2.0)
- [ ] PR + merge + tag
