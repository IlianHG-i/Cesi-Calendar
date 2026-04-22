# feat/google-calendar-export

## Objectif
Remplacer le bouton Google Calendar actuellement "en travaux" par une solution qui marche immédiatement pour tous les utilisateurs, sans configuration OAuth ni publication Chrome Web Store.

## Contexte
Le bouton OAuth direct (`chrome.identity.getAuthToken`) échoue avec `bad client id: {0}` parce que le `client_id` dans `manifest.json` est un placeholder. Pour que l'OAuth marche pour tout le monde sans config, il faudrait publier l'extension sur le Chrome Web Store (ID d'extension stable → un seul client_id pour tous). C'est pas dispo à court terme.

## Approche retenue (Option A)
Le bouton **"Exporter vers Google Calendar"** :
1. Génère et télécharge le `.ics` de la semaine (même logique que l'export iCal existant)
2. Ouvre `https://calendar.google.com` dans un nouvel onglet
3. Affiche dans le popup un rappel des 3 étapes d'import (⚙️ → Paramètres → Importer et exporter)

Zéro configuration utilisateur, zéro OAuth, marche en ~3 clics.

## Scope
- `popup.html` : réactiver le bouton Google (plus "en travaux"), garder icône 🔄
- `scripts/popup.js` :
  - Réactiver le handler
  - Nouveau branchement `format: 'google'` → lance l'export ics + ouvre l'onglet Google Calendar + affiche instructions Google
  - Adapter `INSTRUCTIONS` (ou bloc statique) pour Google
- `scripts/content-script.js` :
  - Le format `'google'` actuel passe par `exportToGoogleCalendar()` (OAuth) → à remplacer par un téléchargement `.ics` + retour d'info au popup pour qu'il ouvre l'onglet
  - Alternative : renommer l'ancien `exportToGoogleCalendar()` en `exportToGoogleCalendarAPI()` et le garder en dead code pour référence future (quand Web Store), ou le supprimer
- Pas d'impact sur `background.js` : l'OAuth devient inutile → on peut même retirer la permission `identity` de `manifest.json` et les handlers OAuth de background.js (nettoyage)

## Décisions
- **Option A choisie** (validée par l'utilisateur le 2026-04-22) : téléchargement + ouverture d'onglet, pas d'OAuth.
- Nettoyer le code OAuth orphelin maintenant plutôt que de le laisser en dead code (tout est dans l'historique git si besoin de revenir).
- Permission `identity` retirée du manifest (plus nécessaire) pour réduire les warnings d'installation.

## TODOs
- [x] Branche créée
- [ ] popup.html : réactiver bouton Google
- [ ] popup.js : handler + instructions Google
- [ ] content-script.js : format 'google' = download ics + signaler au popup
- [ ] popup.js : ouvrir `calendar.google.com` après succès
- [ ] Nettoyage : retirer exportToGoogleCalendar() de content-script, retirer OAuth handlers de background.js, retirer permission `identity` de manifest
- [ ] Bump version 1.4.0 → 1.5.0
- [ ] README : section "Exporter vers Google Calendar" mise à jour (flow simplifié)
- [ ] PR + merge + tag + release
