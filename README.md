# CESI Calendar Exporter

Extension Chrome / Firefox qui exporte automatiquement votre emploi du temps CESI (depuis `ent.cesi.fr`) dans le calendrier de votre choix : Google Calendar, Proton Calendar, Apple Calendar, ou sous forme d'image PNG.

---

## Fonctionnalités

- **Export automatique** d'un fichier `.ics` dès que vous ouvrez la page emploi du temps
- **Export multi-semaines** : 1, 2 ou 3 semaines consécutives en un seul fichier
- **Export direct vers Google Calendar** via OAuth2 (pas de fichier à importer manuellement)
- **Export en image PNG** du calendrier pour le partager facilement
- **Notification visuelle** en temps réel de la progression
- **Prévention des doublons** : pas de réexport automatique si un export a déjà été fait il y a moins d'1 heure

---

## Installation

### Chrome / Edge / Brave

1. Téléchargez (ou clonez) ce dépôt
2. Allez dans `chrome://extensions/`
3. Activez le **Mode développeur** (en haut à droite)
4. Cliquez sur **Charger l'extension non empaquetée**
5. Sélectionnez le dossier `cesi-calendar-exporter`

### Firefox

1. Téléchargez (ou clonez) ce dépôt
2. Allez dans `about:debugging#/runtime/this-firefox`
3. Cliquez sur **Charger un module complémentaire temporaire**
4. Sélectionnez le fichier `manifest.json` dans le dossier `cesi-calendar-exporter`

> ⚠️ Sur Firefox, l'extension sera désinstallée à la fermeture du navigateur (limitation Firefox pour les extensions non signées).

---

## Utilisation

### Export automatique (par défaut)

1. Connectez-vous sur [ent.cesi.fr](https://ent.cesi.fr)
2. Allez dans **Mon emploi du temps**
3. L'extension détecte la page, attend 2 secondes, puis télécharge automatiquement un `.ics` de la semaine affichée.

Une notification s'affiche en haut à droite pendant l'opération :

```
⏳ Extraction de la semaine en cours...
✓ Fichier iCal téléchargé ! 15 événements
```

Nom du fichier : `emploi-du-temps-cesi-semaine-Sxx.ics`

### Boutons du popup

Cliquez sur l'icône de l'extension pour accéder aux différents exports :

| Bouton | Action |
|---|---|
| 📅 **Télécharger iCal (.ics)** | Exporte la semaine affichée en fichier iCal |
| 📆 **Télécharger 2 semaines (.ics)** | Exporte la semaine affichée + la suivante |
| 📆 **Télécharger 3 semaines (.ics)** | Exporte la semaine affichée + les 2 suivantes |
| 🖼️ **Télécharger en image (.png)** | Capture le calendrier en image PNG haute résolution |
| 🔄 **Exporter vers Google Calendar** | Pousse les événements directement dans votre Google Calendar (via OAuth) |

> 💡 Pour les exports multi-semaines, l'extension navigue automatiquement vers les semaines suivantes puis revient à la semaine de départ — pas besoin de faire quoi que ce soit.

---

## Exporter vers Google Calendar

Le bouton **🔄 Exporter vers Google Calendar** pousse les événements directement dans votre agenda Google, sans passer par un fichier à télécharger.

### Premier usage

1. Cliquez sur le bouton
2. Une popup Google s'ouvre → connectez-vous avec votre compte
3. Google affiche **"Google n'a pas vérifié cette application"** — c'est normal (l'app n'est pas publiée sur le Chrome Web Store)
   - Cliquez sur **Avancé**
   - Cliquez sur **Accéder à CESI Calendar Exporter (non sécurisé)**
4. Autorisez l'accès à votre Google Calendar
5. Les événements de la semaine se créent automatiquement dans votre calendrier principal

### Au prochain usage

Plus rien à faire : l'autorisation est mémorisée. Un clic suffit.

### Besoin d'ajouter un utilisateur ?

Le projet OAuth est en mode **Testing**. Par défaut, seules les personnes listées comme "utilisateurs de test" peuvent utiliser cette voie. Le mainteneur du projet doit ajouter votre email dans la Google Cloud Console (limite 100 users). Contactez-le.

---

## Importer manuellement un `.ics`

Si vous préférez télécharger le `.ics` puis l'importer vous-même, ou si vous utilisez un autre calendrier que Google :

### Importer dans Google Calendar (sans OAuth)

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. ⚙️ (en haut à droite) → **Paramètres**
3. Menu gauche → **Importer et exporter**
4. **Sélectionner un fichier sur votre ordinateur** → choisissez votre `.ics`
5. Choisissez le calendrier de destination → **Importer**

### Import dans Proton Calendar

Proton Calendar n'a pas d'API publique pour l'insertion directe. Méthode manuelle :

1. Téléchargez le `.ics` via le bouton iCal de l'extension
2. Ouvrez [Proton Calendar](https://calendar.proton.me) et connectez-vous
3. ⚙️ **Paramètres** → **Tous les paramètres de Proton Calendar**
4. Onglet **Calendriers** → **Importer un calendrier**
5. Sélectionnez le fichier `.ics`, choisissez la destination, validez

> 💡 Proton déduplique les événements via leur UID — vous pouvez réimporter un `.ics` mis à jour sans créer de doublons.

### Import dans Apple Calendar

**Sur Mac :**
1. Téléchargez le `.ics` via le bouton iCal
2. Ouvrez l'app **Calendrier**
3. Menu **Fichier** → **Importer…**
4. Sélectionnez le fichier, choisissez la destination, validez

**Sur iPhone / iPad :**
1. Envoyez-vous le `.ics` par AirDrop, mail ou iCloud Drive
2. Ouvrez-le depuis Fichiers ou Mail
3. iOS propose **Ajouter tous les événements** → choisissez le calendrier

> 💡 Créez un calendrier dédié "CESI" dans n'importe lequel de ces services pour isoler vos cours et pouvoir les masquer d'un clic.

---

## Paramètres

### Désactiver l'export automatique

Si vous voulez uniquement déclencher l'export via le popup, éditez `scripts/content-script.js` à la toute fin du fichier :

```javascript
// Commentez ces lignes :
// setTimeout(() => {
//     autoExport();
// }, 2000);
```

### Modifier le délai anti-doublon

Par défaut, l'extension ne réexporte pas automatiquement si un export a été fait il y a moins d'1 heure. Dans `scripts/content-script.js` :

```javascript
const CONFIG = {
    EXPORT_DELAY_HOURS: 1, // Modifier cette valeur
    ...
};
```

---

## Dépannage

### L'export ne se déclenche pas

- Attendez 2-3 secondes après le chargement de la page
- Vérifiez que vous êtes bien sur `ent.cesi.fr/mon-emploi-du-temps`
- Rafraîchissez la page (F5)
- Ouvrez la console (F12) et cherchez les logs `[CESI Exporter]`

### "Export déjà effectué récemment"

Normal. L'extension évite de spammer des téléchargements. Pour forcer un nouvel export, utilisez le popup de l'extension.

### Google Calendar : "bad client id"

Vérifiez dans `chrome://extensions/` que l'ID de l'extension est bien `acnjjemnlheffchiaiplnfpcfenjnmcb`. Si ce n'est pas le cas, le champ `key` du `manifest.json` n'a pas été pris en compte — supprimez l'extension et rechargez-la depuis le dossier.

### Le PNG contient des traits parasites

L'extension filtre les lignes internes de FullCalendar. Si vous voyez quand même des traits inhabituels, ouvrez une issue avec une capture.

### Les horaires sont décalés

Vérifiez que votre calendrier utilise bien le fuseau horaire **Europe/Paris**.

---

## Architecture

Trois contextes communiquent via `chrome.runtime` :

- **`scripts/content-script.js`** — runs on `ent.cesi.fr/mon-emploi-du-temps*`. Extrait les événements du DOM FullCalendar, gère la navigation multi-semaines, génère les fichiers iCal/PNG et pilote l'export Google Calendar.
- **`scripts/background.js`** — service worker qui gère l'OAuth2 Google (obtention et rafraîchissement du token).
- **`scripts/popup.js` + `popup.html`** — UI du popup, émet les messages vers le content script.

**Bibliothèques bundlées :**
- `lib/ics-generator.js` — génération de fichiers iCal (RFC 5545)
- `lib/html2canvas.min.js` — capture DOM → canvas → PNG (1.4.1, MIT)

---

## Pour les développeurs / forks

Si vous forkez ce projet et voulez un `client_id` OAuth2 à vous :

1. Suivez les étapes de [`GOOGLE_SETUP.md`](./GOOGLE_SETUP.md)
2. Remplacez le `client_id` dans `manifest.json` par le vôtre
3. Générez votre propre paire de clés pour le champ `key` (voir `GOOGLE_SETUP.md`) — l'ID d'extension changera

---

## Limitations connues

- **Mode Testing OAuth** : le warning "application non vérifiée" persiste tant que l'app n'est pas publiée sur le Chrome Web Store et vérifiée par Google.
- **7 jours de validité du refresh token** : en mode Testing, le token Google expire après 7 jours d'inactivité → nouvelle autorisation nécessaire.
- **Lundi à samedi uniquement** : le dimanche n'est pas extrait (pas de cours CESI).
- **Pas de mise à jour automatique** : si l'emploi du temps change côté CESI, il faut réexporter.

---

## Contribution

Les issues et pull requests sont les bienvenus. Pour toute question ou bug, créez une issue avec :
- Navigateur et version
- Étapes pour reproduire
- Logs de la console (F12 → onglet Console)

---

## Licence

MIT. Voir le code pour les bibliothèques tierces (html2canvas).

---

## Auteur

Projet non affilié au CESI, développé pour simplifier la vie des étudiants.
