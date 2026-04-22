# CESI Calendar Exporter

Extension Chrome/Firefox pour **exporter automatiquement** votre emploi du temps CESI complet vers Google Calendar au format iCal (.ics).

## Fonctionnalités

- **Export automatique** dès que vous ouvrez la page emploi du temps
- **Toute la semaine** exportée automatiquement (lundi à samedi)
- **Navigation automatique** jour par jour pour extraire tous les événements
- **Notification visuelle** en temps réel de la progression
- **Prévention des doublons** : n'exporte pas si déjà fait il y a moins d'1 heure
- **Un seul fichier** : tous les cours de la semaine dans un fichier `.ics`
- Extraction complète : titre du cours, horaires, salle

## Installation

### Chrome / Edge / Brave

1. **Télécharger l'extension**
   - Clonez ou téléchargez ce dépôt sur votre ordinateur
   - Notez l'emplacement du dossier `cesi-calendar-exporter`

2. **Activer le mode développeur**
   - Ouvrez Chrome et allez dans `chrome://extensions/`
   - Activez le "Mode développeur" (coin supérieur droit)

3. **Charger l'extension**
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier `cesi-calendar-exporter`
   - L'extension apparaît dans votre barre d'outils

### Firefox

1. **Télécharger l'extension**
   - Clonez ou téléchargez ce dépôt sur votre ordinateur

2. **Charger temporairement**
   - Ouvrez Firefox et allez dans `about:debugging#/runtime/this-firefox`
   - Cliquez sur "Charger un module complémentaire temporaire"
   - Sélectionnez le fichier `manifest.json` dans le dossier `cesi-calendar-exporter`

> **Note** : Sur Firefox, l'extension sera désinstallée à la fermeture du navigateur.

## Utilisation

### Export automatique (mode par défaut)

C'est **ultra simple** :

1. **Connectez-vous** sur [ent.cesi.fr](https://ent.cesi.fr)
2. **Ouvrez** la page "Mon emploi du temps"
3. **C'est tout !** 🎉

L'extension :
- ✅ Détecte automatiquement la page
- ✅ Navigue jour par jour (lundi → samedi)
- ✅ Extrait tous les événements
- ✅ Génère un fichier `.ics`
- ✅ Le télécharge automatiquement

**Vous verrez une notification** en haut à droite :
```
⏳ Navigation vers le début de la semaine...
⏳ Extraction : Lundi (1/6)
⏳ Extraction : Mardi (2/6)
...
✓ Export terminé ! 15 événements exportés
```

Le fichier téléchargé : `emploi-du-temps-cesi-semaine-48.ics`

### Export manuel (si besoin)

Vous pouvez aussi déclencher manuellement l'export :
1. Cliquez sur l'icône de l'extension
2. Cliquez sur "Exporter le jour affiché"

### Importer dans Google Calendar

#### Méthode 1 : Import manuel (recommandé)

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Cliquez sur l'icône ⚙️ → **Paramètres**
3. Dans le menu de gauche : **Importer et exporter**
4. Cliquez sur **Sélectionner un fichier sur votre ordinateur**
5. Sélectionnez le fichier `.ics` téléchargé
6. Choisissez le calendrier de destination
7. Cliquez sur **Importer**

#### Méthode 2 : Créer un calendrier dédié (recommandé)

Pour mieux organiser vos cours :

1. Dans Google Calendar, créez un nouveau calendrier nommé "CESI"
2. Lors de l'import, sélectionnez ce calendrier
3. Vous pouvez activer/désactiver l'affichage facilement
4. Personnalisez la couleur pour distinguer vos cours

### Import dans Proton Calendar

Proton Calendar ne propose **pas d'API publique** pour insérer des événements depuis une extension. Le bouton "Proton Calendar (.ics)" télécharge donc un fichier que tu importes ensuite manuellement — c'est simple et ça prend 30 secondes.

1. Clique sur **Proton Calendar (.ics)** dans le popup de l'extension → le fichier se télécharge
2. Ouvre [Proton Calendar](https://calendar.proton.me) dans ton navigateur et connecte-toi
3. En haut à droite, clique sur **Paramètres** (⚙️) → **Tous les paramètres de Proton Calendar**
4. Dans le menu de gauche, ouvre l'onglet **Calendriers**
5. Clique sur **Importer un calendrier**
6. Sélectionne le fichier `.ics` téléchargé
7. Choisis le calendrier de destination (crée un calendrier "CESI" si tu veux une vue isolée)
8. Valide l'import

> **Astuce** : Proton déduplique les événements à l'import via leur UID — tu peux réimporter un `.ics` à jour sans créer de doublons.

### Import dans Apple Calendar

Apple Calendar / iCloud non plus n'a pas d'API web. Même méthode que Proton : téléchargement du `.ics` + import manuel.

**Sur Mac**

1. Clique sur **Apple Calendar (.ics)** dans le popup de l'extension
2. Ouvre l'application **Calendrier**
3. Menu **Fichier** → **Importer…**
4. Sélectionne le fichier `.ics` téléchargé
5. Dans la boîte de dialogue, choisis le calendrier de destination et clique **OK**

**Sur iPhone / iPad**

1. Envoie-toi le fichier `.ics` par AirDrop, mail ou via iCloud Drive
2. Ouvre le fichier depuis l'app **Fichiers** ou **Mail**
3. iOS propose automatiquement **Ajouter tous les événements** → choisis le calendrier cible

**Via iCloud.com**

1. Ouvre [iCloud Calendar](https://www.icloud.com/calendar/) dans ton navigateur
2. Il n'y a **pas** de bouton d'import direct sur l'interface web iCloud. Utilise la méthode Mac ci-dessus.

> **Astuce** : Crée un calendrier dédié "CESI" dans l'app Calendrier pour isoler les cours et pouvoir les masquer d'un clic.

## Configuration

### Prévention des doublons

Par défaut, l'extension **ne réexporte pas** si un export a déjà été fait il y a moins d'**1 heure**.

Pour forcer un nouvel export :
- Utilisez le bouton manuel de l'extension
- Ou attendez 1 heure

Pour modifier ce délai, éditez `content-script.js` :
```javascript
const CONFIG = {
    EXPORT_DELAY_HOURS: 1, // Modifiez cette valeur
    ...
};
```

### Désactiver l'export automatique

Si vous voulez uniquement l'export manuel :

1. Éditez `content-script.js`
2. Commentez les dernières lignes :
```javascript
// setTimeout(() => {
//     autoExport();
// }, 2000);
```

## Structure du projet

```
cesi-calendar-exporter/
├── manifest.json              # Configuration de l'extension
├── popup.html                 # Interface utilisateur (export manuel)
├── icons/                     # Icônes de l'extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   ├── content-script.js      # Export automatique + extraction
│   └── popup.js               # Logique du popup
├── styles/
│   └── popup.css              # Styles de l'interface
├── lib/
│   └── ics-generator.js       # Générateur de fichiers iCal
└── README.md                  # Ce fichier
```

## Comment ça marche ?

### Architecture technique

1. **Détection** : Le content script se charge automatiquement sur `mon-emploi-du-temps`
2. **Attente** : Attend 2 secondes que le calendrier FullCalendar soit complètement chargé
3. **Vérification** : Vérifie si un export récent existe déjà (localStorage)
4. **Navigation** : Navigue automatiquement vers le lundi de la semaine
5. **Extraction** : Pour chaque jour (lundi → samedi) :
   - Extrait les événements affichés
   - Navigue au jour suivant (800ms entre chaque)
6. **Compilation** : Rassemble tous les événements
7. **Génération** : Crée un fichier iCal standard
8. **Téléchargement** : Déclenche automatiquement le téléchargement

**Durée totale** : ~6-8 secondes pour toute la semaine

## Dépannage

### L'export ne se déclenche pas

**Causes possibles** :
1. Vous avez déjà exporté il y a moins d'1 heure
2. Le calendrier ne s'est pas chargé correctement

**Solutions** :
- Rafraîchissez la page (F5)
- Attendez 1 heure ou utilisez l'export manuel
- Vérifiez la console (F12) pour les erreurs

### L'export s'arrête en cours de route

**Cause** : Connexion lente ou calendrier qui met du temps à charger

**Solutions** :
- Augmentez le délai dans `content-script.js` :
```javascript
LOAD_DELAY_MS: 1200, // Au lieu de 800
```
- Réessayez sur une meilleure connexion

### Événements manquants

**Cause** : Certains jours n'ont pas de cours

**Solution** : C'est normal ! L'extension extrait ce qui est affiché. Les jours sans cours ne génèrent pas d'événements.

### Message "Aucun événement trouvé"

**Solutions** :
1. Vérifiez que vous avez des cours cette semaine
2. Attendez que le calendrier se charge complètement
3. Changez de semaine avec les flèches ← →
4. Rechargez l'extension dans `chrome://extensions/`

### Les horaires sont décalés dans Google Calendar

**Solutions** :
1. Vérifiez que votre fuseau horaire est "Europe/Paris" dans Google Calendar
2. Réexportez le fichier .ics
3. Supprimez les anciens événements et réimportez

## Limitations

- **Export hebdomadaire uniquement** : L'extension exporte uniquement la semaine affichée
- **Lundi à samedi** : Le dimanche n'est pas extrait (généralement pas de cours)
- **Données limitées** : Seuls le titre, les horaires et la salle sont exportés
- **Pas de mise à jour automatique** : Si l'emploi du temps change, vous devez réexporter

## Améliorations futures

- [ ] Export de plusieurs semaines consécutives
- [ ] Synchronisation automatique avec Google Calendar API (sans téléchargement)
- [ ] Détection automatique des changements d'emploi du temps
- [ ] Support des événements récurrents
- [ ] Export vers d'autres calendriers (Outlook, Apple Calendar)
- [ ] Options de configuration dans le popup

## FAQ

### Mes identifiants sont-ils stockés ?

Non, l'extension n'a accès qu'à la page d'emploi du temps une fois que vous êtes déjà connecté. Aucune donnée d'authentification n'est stockée ou transmise.

### L'extension fonctionne-t-elle hors ligne ?

Non, vous devez être connecté à ent.cesi.fr pour extraire les données.

### Puis-je exporter plusieurs semaines d'un coup ?

Pas pour le moment. Vous devez changer de semaine sur le site puis attendre le nouvel export automatique (ou le déclencher manuellement).

### Les événements sont-ils mis à jour automatiquement dans Google Calendar ?

Non, vous devez réexporter et réimporter manuellement à chaque modification de l'emploi du temps.

### Combien de fois l'extension exporte-t-elle ?

Une seule fois par heure par défaut. Si vous rechargez la page 10 fois, elle n'exportera qu'une fois.

### L'extension est-elle officielle ?

Non, il s'agit d'un projet personnel non affilié au CESI. Utilisez-la à vos propres risques.

### Je veux désactiver l'export automatique, comment faire ?

Modifiez le fichier `content-script.js` et commentez les dernières lignes (instructions dans la section Configuration).

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## Changelog

### v2.0 (2024-11-24)
- ✨ Export automatique au chargement de la page
- ✨ Export de toute la semaine (lundi à samedi)
- ✨ Navigation automatique jour par jour
- ✨ Notification visuelle en temps réel
- ✨ Prévention des exports en double
- 🔧 Refonte complète du content script

### v1.0 (2024-11-24)
- 🎉 Version initiale
- Export manuel jour par jour

## Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## Auteur

Développé pour faciliter la vie des étudiants CESI.

## Support

Pour toute question ou problème :
1. Consultez la section [Dépannage](#dépannage)
2. Vérifiez la console navigateur (F12)
3. Créez une issue avec un maximum de détails

---

**Bon courage pour vos études ! 🎓**

*Export automatique = Plus de temps pour ce qui compte vraiment !*
