# Démarrage rapide

## 1. Installer l'extension

**Chrome / Edge / Brave**
```
chrome://extensions/ → Mode développeur → Charger l'extension non empaquetée → sélectionner le dossier
```

**Firefox**
```
about:debugging#/runtime/this-firefox → Charger un module complémentaire temporaire → sélectionner manifest.json
```

## 2. Aller sur votre emploi du temps CESI

- Connectez-vous sur [ent.cesi.fr](https://ent.cesi.fr)
- Ouvrez **Mon emploi du temps**

Un `.ics` de la semaine se télécharge automatiquement au bout de 2 secondes. Notification visuelle en haut à droite.

## 3. Choisir le mode d'export qui vous plaît

Cliquez sur l'icône de l'extension pour voir tous les boutons :

- **📅 iCal (.ics)** — la semaine affichée en fichier `.ics`
- **📆 2 semaines (.ics)** — la semaine + la suivante
- **📆 3 semaines (.ics)** — la semaine + les 2 suivantes
- **🖼️ Image (.png)** — capture du calendrier en image
- **🔄 Google Calendar** — pousse les événements directement dans votre agenda Google (première fois : autoriser l'app)

## 4. Importer dans votre calendrier

- **Google Calendar (le plus rapide)** : utilisez le bouton 🔄 Google Calendar — rien à importer
- **Google Calendar (manuel)** : `calendar.google.com` → ⚙️ Paramètres → Importer et exporter → sélectionner le `.ics`
- **Proton Calendar** : `calendar.proton.me` → ⚙️ Paramètres → Calendriers → Importer un calendrier
- **Apple Calendar** : app Calendrier → Fichier → Importer

## Besoin de plus d'infos ?

Voir [README.md](README.md) pour les détails, le dépannage et l'architecture.
