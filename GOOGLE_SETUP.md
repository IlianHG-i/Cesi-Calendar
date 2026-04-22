# Configuration Google Cloud Console (pour forks / maintenance)

> ⚠️ **Ce guide n'est PAS nécessaire pour les utilisateurs finaux.**
> Le `client_id` OAuth2 du projet est déjà configuré dans `manifest.json` et fonctionne out-of-the-box pour tout utilisateur ajouté comme "test user" dans la Google Cloud Console du projet principal.
>
> Ce guide s'adresse uniquement :
> - Aux personnes qui **forkent** ce projet et veulent leur propre `client_id`
> - Au mainteneur actuel qui voudrait refaire la configuration (rotation de clé, etc.)

Ce guide vous explique comment configurer l'authentification OAuth2 pour permettre à l'extension d'exporter directement vers Google Calendar via l'API.

## Prérequis

- Un compte Google
- L'extension CESI Calendar Exporter clonée/installée localement
- 10-15 minutes pour la configuration
- Pour un fork : générer votre propre paire de clés (voir section "Générer la clé d'extension" ci-dessous)

---

## Étape 1 : Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur le menu déroulant des projets (en haut à gauche)
4. Cliquez sur **"Nouveau projet"**
5. Donnez un nom à votre projet : `CESI Calendar Exporter`
6. Cliquez sur **"Créer"**
7. Attendez que le projet soit créé (quelques secondes)

---

## Étape 2 : Activer l'API Google Calendar

1. Dans le menu de gauche, allez dans **"APIs et services"** → **"Bibliothèque"**
2. Dans la barre de recherche, tapez : `Google Calendar API`
3. Cliquez sur **"Google Calendar API"** dans les résultats
4. Cliquez sur le bouton **"Activer"**
5. Attendez l'activation (quelques secondes)

---

## Étape 3 : Configurer l'écran de consentement OAuth

1. Dans le menu de gauche, allez dans **"APIs et services"** → **"Écran de consentement OAuth"**
2. Sélectionnez **"Externe"** (User Type)
3. Cliquez sur **"Créer"**

### Informations sur l'application :
- **Nom de l'application** : `CESI Calendar Exporter`
- **E-mail d'assistance utilisateur** : Votre adresse e-mail
- **Logo de l'application** : Optionnel (vous pouvez laisser vide)
- **Domaine de l'application** : Laisser vide
- **Liens** : Laisser vides
- **E-mail du développeur** : Votre adresse e-mail

4. Cliquez sur **"Enregistrer et continuer"**

### Champs d'application (Scopes) :
5. Cliquez sur **"Ajouter ou supprimer des champs d'application"**
6. Dans la barre de recherche, tapez : `calendar`
7. Cochez la case : `https://www.googleapis.com/auth/calendar.events`
   - Description : "Afficher et modifier des événements dans tous vos agendas"
8. Cliquez sur **"Mettre à jour"**
9. Cliquez sur **"Enregistrer et continuer"**

### Utilisateurs de test :
10. Cliquez sur **"Ajouter des utilisateurs"**
11. Ajoutez votre adresse e-mail Google
12. Cliquez sur **"Ajouter"**
13. Cliquez sur **"Enregistrer et continuer"**

### Résumé :
14. Vérifiez les informations
15. Cliquez sur **"Retour au tableau de bord"**

---

## Étape 4 : Créer les identifiants OAuth 2.0

1. Dans le menu de gauche, allez dans **"APIs et services"** → **"Identifiants"**
2. Cliquez sur **"+ Créer des identifiants"** (en haut)
3. Sélectionnez **"ID client OAuth"**

### Configuration :
- **Type d'application** : Sélectionnez **"Application Chrome"**
- **Nom** : `CESI Calendar Exporter Extension`
- **ID de l'application** : Vous devez entrer l'ID de votre extension

### Comment obtenir l'ID de l'extension :

#### Pour Chrome/Edge/Brave :
1. Allez dans `chrome://extensions/` (ou `edge://extensions/`)
2. Activez le **"Mode développeur"** (coin supérieur droit)
3. Trouvez **"CESI Calendar Exporter"** dans la liste
4. Copiez l'**"ID"** qui apparaît sous le nom de l'extension
   - Format : `abcdefghijklmnopqrstuvwxyzabcdef`

#### Pour Firefox :
1. Ouvrez le fichier `manifest.json` de l'extension
2. Après le premier chargement, Firefox génère une `key`
3. L'ID est dérivé de cette clé (voir la documentation Firefox)

5. Collez l'ID de l'extension dans le champ **"ID de l'application"**
6. Cliquez sur **"Créer"**

---

## Étape 5 : Récupérer le Client ID

1. Une fenêtre s'ouvre avec vos identifiants OAuth 2.0
2. **Copiez le "ID client"** (Client ID)
   - Format : `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
3. Vous pouvez fermer cette fenêtre

---

## Étape 6 : Configurer l'extension avec le Client ID

1. Ouvrez le dossier de l'extension sur votre ordinateur
2. Ouvrez le fichier `manifest.json` avec un éditeur de texte
3. Trouvez la ligne :
   ```json
   "client_id": "VOTRE_CLIENT_ID.apps.googleusercontent.com",
   ```
4. Remplacez `VOTRE_CLIENT_ID.apps.googleusercontent.com` par votre vrai Client ID
5. Enregistrez le fichier

### Exemple :
```json
"oauth2": {
  "client_id": "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/calendar.events"
  ]
}
```

---

## Étape 7 : Recharger l'extension

### Chrome/Edge/Brave :
1. Allez dans `chrome://extensions/` (ou `edge://extensions/`)
2. Trouvez **"CESI Calendar Exporter"**
3. Cliquez sur l'icône **🔄 Recharger** (ou le bouton "Recharger")

### Firefox :
1. Allez dans `about:debugging#/runtime/this-firefox`
2. Trouvez **"CESI Calendar Exporter"**
3. Cliquez sur **"Recharger"**

---

## Étape 8 : Tester l'export vers Google Calendar

1. Allez sur [https://ent.cesi.fr/mon-emploi-du-temps](https://ent.cesi.fr/mon-emploi-du-temps)
2. Cliquez sur l'icône de l'extension
3. Cliquez sur le bouton **"🔄 Exporter vers Google Calendar"**
4. Une fenêtre de connexion Google s'ouvre :
   - **Connectez-vous** avec votre compte Google (si nécessaire)
   - Vous verrez un message : *"Google n'a pas validé cette application"*
   - Cliquez sur **"Paramètres avancés"**
   - Cliquez sur **"Accéder à CESI Calendar Exporter (non sécurisé)"**
   - Cliquez sur **"Autoriser"** pour donner accès à votre calendrier
5. L'export commence automatiquement !
6. Vérifiez votre Google Calendar : les événements devraient apparaître

---

## Dépannage

### Erreur : "Client ID manquant"
- Vérifiez que vous avez bien modifié le `manifest.json`
- Vérifiez que le Client ID est correct (pas d'espaces, guillemets corrects)
- Rechargez l'extension

### Erreur : "Invalid client"
- Le Client ID est incorrect
- Vérifiez que vous avez copié le bon ID depuis Google Cloud Console
- Vérifiez que l'ID de l'application dans Google Cloud Console correspond à l'ID de votre extension

### Erreur : "Access denied"
- Vous n'êtes pas ajouté comme utilisateur de test dans Google Cloud Console
- Retournez à l'**Étape 3** et ajoutez votre e-mail dans les "Utilisateurs de test"

### L'écran de connexion Google ne s'ouvre pas
- Vérifiez que vous avez bien activé la permission `identity` dans le manifest
- Vérifiez la console du navigateur (F12) pour les erreurs
- Rechargez l'extension

### Les événements ne sont pas créés
- Vérifiez que le scope `calendar.events` est bien configuré
- Vérifiez que l'API Google Calendar est activée
- Regardez la console (F12) pour les messages d'erreur détaillés

---

## Notes importantes

### Sécurité
- **Ne partagez JAMAIS votre Client ID publiquement** si vous publiez l'extension
- Pour une distribution publique, vous devrez faire valider l'application par Google
- En mode "Test", seuls les utilisateurs de test peuvent utiliser l'authentification

### Limites
- **Quota gratuit** : 1 000 000 requêtes/jour (largement suffisant)
- **Mode Test** : Maximum 100 utilisateurs de test
- Pour lever ces limites, vous devez faire vérifier l'application par Google

### Extension ID et Key
- L'extension ID change si vous supprimez et réinstallez l'extension
- Pour un ID permanent, ajoutez une `key` dans le manifest.json
- La clé `"key": "REMPLACER_PAR_VOTRE_CLE_APRES_PREMIER_CHARGEMENT"` doit être remplacée après le premier chargement de l'extension dans Chrome

### Production
Si vous souhaitez publier l'extension sur le Chrome Web Store :
1. Vous devrez faire vérifier l'application OAuth par Google
2. Processus de vérification : 4-6 semaines
3. Nécessite une politique de confidentialité et des conditions d'utilisation
4. Des frais uniques de 5$ pour le compte développeur Chrome Web Store

---

## Ressources utiles

- [Documentation Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Documentation OAuth 2.0 pour Chrome Extensions](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Quotas et limites Google Calendar API](https://developers.google.com/calendar/api/guides/quota)

---

## Support

Si vous rencontrez des problèmes :
1. Vérifiez bien chaque étape de ce guide
2. Consultez la console du navigateur (F12) pour les messages d'erreur
3. Vérifiez les logs dans la console du background script :
   - Allez dans `chrome://extensions/`
   - Cliquez sur "Inspecter les vues : background page" sous l'extension
4. Consultez le fichier README.md pour plus d'informations

---

## Annexe : Générer la clé d'extension (pour un fork)

Si vous forkez le projet, vous devez générer **votre propre paire de clés** pour figer un ID d'extension unique (sinon l'OAuth du projet principal ne fonctionnera pas chez vous).

### 1. Générer la paire de clés avec OpenSSL

```bash
openssl genrsa 2048 2>/dev/null | openssl pkcs8 -topk8 -nocrypt -out key.pem
```

La clé privée `key.pem` est créée dans le dossier courant. **Sauvegardez-la dans un endroit sûr** (gestionnaire de mots de passe, cloud chiffré) — si vous la perdez, vous ne pourrez plus mettre à jour l'extension sous le même ID.

> ⚠️ **Ne commitez JAMAIS `key.pem` sur un repo public.** Le `.gitignore` de ce projet l'exclut déjà.

### 2. Extraire la clé publique en base64

```bash
openssl rsa -in key.pem -pubout -outform DER 2>/dev/null | openssl base64 -A
```

Copiez la sortie dans le champ `key` du `manifest.json` (remplacez la valeur existante).

### 3. Calculer l'ID d'extension

```bash
openssl rsa -in key.pem -pubout -outform DER 2>/dev/null | shasum -a 256 | head -c 32 | tr '0-9a-f' 'a-p'
```

Utilisez cet ID dans l'étape 5 (ID d'élément) du guide ci-dessus, lors de la création de l'ID client OAuth.

### 4. Mettre `key.pem` hors du dossier de l'extension

Chrome affiche un warning si `key.pem` est dans le dossier de l'extension chargée. Déplacez-la ailleurs après génération :

```bash
mv key.pem ~/Documents/mon-extension-key.pem
```

---

**Félicitations !** Vous pouvez maintenant exporter automatiquement votre emploi du temps CESI vers Google Calendar ! 🎉
