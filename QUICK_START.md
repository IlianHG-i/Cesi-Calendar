# Démarrage rapide

## 1. Installer l'extension

**Chrome / Edge / Brave**
```
chrome://extensions/ → Mode développeur → Charger l'extension non empaquetée → sélectionner le dossier
```

**Firefox (recommandé : install durable)**
```
1. Téléchargez le .xpi depuis la dernière release : https://github.com/IlianHG-i/Cesi-Calendar/releases/latest
2. Glissez-déposez le .xpi dans une fenêtre Firefox
3. Cliquez "Ajouter" dans la popup
```
L'extension persiste après redémarrage et se met à jour toute seule.

**Firefox (install temporaire, pour les devs)**
```
about:debugging#/runtime/this-firefox → Charger un module complémentaire temporaire → sélectionner manifest.json
```

## 2. Aller sur votre emploi du temps CESI

- Connectez-vous sur [ent.cesi.fr](https://ent.cesi.fr)
- Ouvrez **Mon emploi du temps**

Un badge `✓ CESI Exporter actif` confirme que l'extension est prête (il disparaît après quelques secondes).

## 3. Cliquer sur l'icône de l'extension

Le popup propose plusieurs boutons :

- **📅 iCal (.ics)** — la semaine affichée en fichier `.ics`
- **📆 2 semaines (.ics)** — la semaine + la suivante
- **📆 3 semaines (.ics)** — la semaine + les 2 suivantes
- **🖼️ Image (.png)** — capture du calendrier en image
- **🚧 Google Calendar (en travaux)** — en cours de développement, désactivé

## 4. Importer dans votre calendrier

- **Google Calendar** : `calendar.google.com` → ⚙️ Paramètres → Importer et exporter → sélectionner le `.ics`
- **Proton Calendar** : `calendar.proton.me` → ⚙️ Paramètres → Calendriers → Importer un calendrier
- **Apple Calendar** : app Calendrier → Fichier → Importer

## Besoin de plus d'infos ?

Voir [README.md](README.md) pour les détails, le dépannage et l'architecture.
