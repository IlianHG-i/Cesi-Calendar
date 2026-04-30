# CESI Calendar Exporter

Extension Chrome / Firefox qui exporte automatiquement votre emploi du temps CESI (depuis `ent.cesi.fr`) dans le calendrier de votre choix : Google Calendar, Proton Calendar, Apple Calendar, ou sous forme d'image PNG.

---

## Fonctionnalités

- **Export iCal (.ics)** de la semaine affichée, en un clic
- **Export multi-semaines** : 2 ou 3 semaines consécutives en un seul fichier
- **Export en image PNG** du calendrier pour le partager facilement
- **Export vers Google Calendar** (🚧 en cours de développement — nécessite pour l'instant que l'utilisateur soit ajouté manuellement en "test user" dans la console Google, peu pratique à grande échelle)
- **Notification visuelle** en temps réel de la progression
- Extension 100% manuelle : aucun téléchargement automatique, vous contrôlez quand exporter

---

## Installation

### Chrome / Edge / Brave

1. Téléchargez (ou clonez) ce dépôt
2. Allez dans `chrome://extensions/`
3. Activez le **Mode développeur** (en haut à droite)
4. Cliquez sur **Charger l'extension non empaquetée**
5. Sélectionnez le dossier `cesi-calendar-exporter`

### Firefox (installation durable, recommandée)

L'extension est signée par Mozilla, ce qui permet une installation permanente sur Firefox stable :

1. Allez sur la [page des releases](https://github.com/IlianHG-i/Cesi-Calendar/releases/latest)
2. Téléchargez le fichier `.xpi` listé dans **Assets**
3. Glissez-déposez le fichier dans une fenêtre Firefox (ou ouvrez-le avec Firefox depuis votre explorateur)
4. Firefox affiche une popup → cliquez **Ajouter**
5. ✅ Extension installée durablement, persiste entre les redémarrages

**Mises à jour automatiques** : Firefox vérifie régulièrement le fichier `updates.json` du repo. Quand une nouvelle version est publiée, elle s'installe sans intervention.

### Firefox (installation temporaire, depuis la source)

Si vous préférez charger l'extension depuis le code source (pour développer ou tester) :

1. Clonez/téléchargez le dépôt
2. Ouvrez `about:debugging#/runtime/this-firefox`
3. Cliquez **Charger un module complémentaire temporaire**
4. Sélectionnez `manifest.json` dans le dossier

> ⚠️ Cette méthode est désinstallée à la fermeture de Firefox. Préférez l'install durable via le `.xpi` signé.

---

## Utilisation

1. Connectez-vous sur [ent.cesi.fr](https://ent.cesi.fr)
2. Allez dans **Mon emploi du temps**
3. Un petit badge `✓ CESI Exporter actif` apparaît en bas à droite (il disparaît après 5s)
4. Cliquez sur l'icône de l'extension en haut à droite du navigateur pour ouvrir le popup
5. Choisissez le bouton qui vous intéresse

### Boutons du popup

| Bouton | Action |
|---|---|
| 📅 **Télécharger iCal (.ics)** | Exporte la semaine affichée en fichier iCal |
| 📆 **Télécharger 2 semaines (.ics)** | Exporte la semaine affichée + la suivante |
| 📆 **Télécharger 3 semaines (.ics)** | Exporte la semaine affichée + les 2 suivantes |
| 🖼️ **Télécharger en image (.png)** | Capture le calendrier en image PNG haute résolution |
| 🚧 **Google Calendar (en travaux)** | Fonctionnalité en cours de développement, désactivée pour le moment |

> 💡 Pour les exports multi-semaines, l'extension navigue automatiquement vers les semaines suivantes puis revient à la semaine de départ — pas besoin de faire quoi que ce soit.

Nom du fichier téléchargé : `emploi-du-temps-cesi-semaine-Sxx.ics` (ou `semaines-Sxx-Syy.ics` pour le multi).

---

## Google Calendar (en cours de développement)

Le bouton **🔄 Google Calendar** est grisé pour le moment. La mécanique technique fonctionne (OAuth2, push direct via l'API) mais elle repose sur le mode **Testing** de Google Cloud Console : les utilisateurs doivent être ajoutés manuellement comme "test users" par le mainteneur du projet, ce qui n'est pas scalable. On réactivera le bouton quand l'app sera publiée sur le Chrome Web Store et vérifiée par Google (ou passée en production).

En attendant, utilisez le bouton **📅 Télécharger iCal (.ics)** et importez le fichier manuellement (voir ci-dessous). Ça prend 30 secondes.

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

## Dépannage

### Le popup ne répond pas / "Extension non chargée"

- Vérifiez que vous êtes bien sur `ent.cesi.fr/mon-emploi-du-temps`
- Rafraîchissez la page (F5) puis rouvrez le popup
- Ouvrez la console (F12) et cherchez les logs `[CESI Exporter]`

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
