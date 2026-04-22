# feat/export-3-weeks

## Objectif
Ajouter la possibilité d'exporter **plusieurs semaines consécutives** (semaine courante + N suivantes).
Le bouton existant (export 1 semaine) reste **inchangé**. On ajoute un **nouveau bouton** dans le popup avec un sélecteur du nombre de semaines (ex: 2, 3, 4…), par défaut 3.

## Scope
- `popup.html` :
  - Conserver les boutons existants (iCal 1 semaine, Google, etc.)
  - Ajouter un nouveau bouton "Exporter plusieurs semaines" + un `<select>` ou `<input type="number">` pour choisir le nombre
- `scripts/popup.js` :
  - Nouveau handler qui envoie `{ action: 'extractEvents', format: 'ics', weeks: N }` au content script
- `scripts/content-script.js` :
  - `extractFullWeek()` reste (1 semaine). Ajouter `extractMultipleWeeks(count)` qui boucle : extrait la semaine courante, clique "semaine suivante", répète.
  - Repérer le sélecteur FullCalendar du bouton "semaine suivante" (distinct du "jour suivant" déjà utilisé).
  - Accumuler les events sur toutes les semaines.
  - Adapter le nom de fichier : `emploi-du-temps-cesi-semaines-${n}-${n+count-1}.ics`.
  - Notification de progression : "Semaine 1/N", "Semaine 2/N", etc.
  - Auto-export au chargement : inchangé (reste à 1 semaine par défaut).
- Aucun impact sur `background.js` ni `lib/ics-generator.js`.

## Décisions
- **Bouton additionnel, pas de remplacement** : l'utilisateur préfère garder le flux 1 semaine rapide et avoir un second bouton pour multi-semaines (validé 2026-04-22).
- Nombre de semaines configurable via un input/select dans le popup, default 3.
- Direction : courante + N-1 suivantes (pas de semaine passée).
- Timing : avec `LOAD_DELAY_MS=800`, 3 semaines ≈ 15-18s. Documenter dans la notification.

## TODOs
- [x] Sélecteur identifié : `.fc-next-button` / `.fc-prev-button` (FullCalendar v3)
- [x] Ajouter `extractMultipleWeeks(count)` dans `content-script.js`
- [x] Étendre le message handler pour accepter `weeks`
- [x] Ajouter bouton + sélecteur dans `popup.html`
- [x] Handler correspondant dans `popup.js`
- [x] Bump manifest + popup footer (v1.2.0)
- [ ] Tester sur la vraie page ENT (surtout le passage de semaine)
- [ ] PR + merge + tag
