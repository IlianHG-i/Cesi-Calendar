# Guide de démarrage rapide - CESI Calendar Exporter

## Installation en 2 étapes

### 1. Installer l'extension

**Chrome/Edge/Brave :**
```
1. Ouvrir chrome://extensions/
2. Activer "Mode développeur" (coin supérieur droit)
3. Cliquer "Charger l'extension non empaquetée"
4. Sélectionner le dossier cesi-calendar-exporter
```

**Firefox :**
```
1. Ouvrir about:debugging#/runtime/this-firefox
2. Cliquer "Charger un module complémentaire temporaire"
3. Sélectionner manifest.json dans cesi-calendar-exporter
```

### 2. Utiliser l'extension (AUTOMATIQUE !)

```
1. Aller sur ent.cesi.fr
2. Se connecter
3. Aller dans "Mon emploi du temps"
4. C'EST TOUT ! 🎉
```

**L'extension fait tout automatiquement** :
- ✅ Détecte la page
- ✅ Navigue jour par jour (lundi → samedi)
- ✅ Extrait tous les événements
- ✅ Télécharge le fichier .ics automatiquement

**Vous verrez une notification** en haut à droite pendant l'export :
```
⏳ Extraction : Lundi (1/6)
⏳ Extraction : Mardi (2/6)
...
✓ Export terminé ! 15 événements exportés
```

**Fichier téléchargé** : `emploi-du-temps-cesi-semaine-48.ics`

## Importer dans Google Calendar

```
1. Ouvrir calendar.google.com
2. ⚙️ → Paramètres → Importer et exporter
3. Sélectionner le fichier .ics téléchargé
4. Choisir le calendrier de destination
5. Cliquer "Importer"
```

## Points importants

✅ **Export automatique** : Dès que vous ouvrez la page emploi du temps
✅ **Toute la semaine** : Lundi à samedi automatiquement
✅ **Pas de doublons** : N'exporte qu'une fois par heure
✅ **Notification visuelle** : Vous voyez la progression en temps réel

## Si ça ne marche pas

### L'export ne démarre pas
- Attendez 2-3 secondes après le chargement de la page
- Vérifiez que vous êtes bien sur "Mon emploi du temps"
- Rafraîchissez la page (F5)

### Vérifier dans la console
```
1. F12 pour ouvrir les outils développeur
2. Onglet "Console"
3. Cherchez les messages [CESI Exporter]
```

### Export déjà fait
Si vous voyez "Export déjà effectué récemment" :
- C'est normal ! L'extension ne réexporte pas si vous avez déjà exporté il y a moins d'1 heure
- Pour forcer un nouvel export : cliquez sur l'icône de l'extension

### Besoin d'aide ?

Consultez le [README.md](README.md) complet pour :
- Configuration avancée
- Dépannage détaillé
- FAQ complète
- Explication technique

## Astuce pro

**Créez un calendrier "CESI" dédié** dans Google Calendar :
1. Créer un nouveau calendrier nommé "CESI"
2. Importer vos cours dedans
3. Activez/désactivez facilement l'affichage
4. Personnalisez la couleur

Comme ça, vos cours CESI sont séparés de vos événements personnels !

---

**Enjoy ! Plus besoin de vérifier l'ENT chaque jour 🎉**
