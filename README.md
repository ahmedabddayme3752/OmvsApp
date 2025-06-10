# 📱 OMVS Mobile App - Distribution Data Collection

Application mobile React Native pour la collecte des données des activités de distribution de médicaments et de moustiquaires MILDA avec synchronisation offline/online utilisant CouchDB.

## 🎯 Vue d'ensemble

Cette application permet aux agents de terrain de l'OMVS de collecter efficacement les données de distribution de MILDA et de médicaments, même sans connexion internet. Les données sont stockées localement et synchronisées automatiquement avec un serveur CouchDB central lorsqu'une connexion est disponible.

## ✨ Fonctionnalités Principales

### 🔐 Authentification
- Connexion sécurisée des agents
- Gestion des sessions utilisateur

### 📍 Géolocalisation et Photos
- **Capture GPS automatique** : Coordonnées précises de chaque distribution
- **Prise de photos** : Documentation visuelle des activités
- **Sélection de localisation** : Pays, région, moughataa, commune

### 📋 Collecte de Données
- **Distribution MILDA** : Enregistrement des distributions de moustiquaires
- **Distribution Médicaments** : Suivi des distributions pharmaceutiques
- **Formulaires complets** : Chef de ménage, NNI, contact, quantités

### 💾 Stockage Offline-First
- **Stockage local** : AsyncStorage pour fonctionnement hors ligne
- **Synchronisation automatique** : Sync avec CouchDB quand en ligne
- **Gestion des conflits** : Résolution automatique des données

### 📊 Gestion des Données
- **Visualisation** : Écran dédié pour voir toutes les données collectées
- **Statut de synchronisation** : Suivi en temps réel
- **Synchronisation manuelle** : Forcer la sync si nécessaire

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend** : React Native + Expo
- **Navigation** : React Navigation v6
- **Base de données locale** : AsyncStorage
- **Base de données serveur** : Apache CouchDB
- **Synchronisation** : HTTP REST API
- **Géolocalisation** : @react-native-community/geolocation
- **Photos** : react-native-image-picker

### Architecture de Données
```
📱 App Mobile (AsyncStorage) ↔️ 🌐 Serveur CouchDB
     ↓                              ↓
  Stockage local                Base de données centrale
  (Offline-first)                  (Synchronisation)
```

## 🐳 Configuration Docker

### Option 1: CouchDB Seul (Recommandé pour développement)

```bash
# Créer et démarrer CouchDB
sudo docker run -d \
  --name omvs-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  -v couchdb_data:/opt/couchdb/data \
  couchdb:latest

# Créer les bases de données
curl -X PUT http://admin:password@localhost:5984/omvs_distributions
curl -X PUT http://admin:password@localhost:5984/omvs_gps_photos
```

### Option 2: Application Complète avec Docker Compose

Créer un fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  # Base de données CouchDB
  couchdb:
    image: couchdb:latest
    container_name: omvs-couchdb
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=password
    volumes:
      - couchdb_data:/opt/couchdb/data
    networks:
      - omvs-network
    restart: unless-stopped

  # Application React Native (pour développement web)
  app:
    build: .
    container_name: omvs-app
    ports:
      - "19006:19006"  # Expo web
      - "19000:19000"  # Expo dev server
    environment:
      - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - couchdb
    networks:
      - omvs-network
    command: npm start

volumes:
  couchdb_data:

networks:
  omvs-network:
    driver: bridge
```

### Dockerfile pour l'Application

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache git

# Copier les fichiers de configuration
COPY package*.json ./
COPY yarn.lock ./

# Installer les dépendances
RUN yarn install

# Copier le code source
COPY . .

# Exposer les ports Expo
EXPOSE 19000 19006

# Commande par défaut
CMD ["yarn", "start"]
```

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** (v16 ou supérieur)
- **Yarn** ou npm
- **Expo CLI** : `npm install -g @expo/cli`
- **Docker** (pour CouchDB)
- **Android Studio** (pour Android)
- **Xcode** (pour iOS, Mac uniquement)

### 1. Cloner et Installer

```bash
# Cloner le projet
git clone [url-du-repo]
cd OmvsApp

# Installer les dépendances
yarn install
# ou
npm install
```

### 2. Configuration de la Base de Données

```bash
# Démarrer CouchDB avec Docker
sudo docker run -d \
  --name omvs-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:latest

# Attendre que CouchDB démarre (30 secondes)
sleep 30

# Créer les bases de données
curl -X PUT http://admin:password@localhost:5984/omvs_distributions
curl -X PUT http://admin:password@localhost:5984/omvs_gps_photos

# Vérifier l'installation
curl -X GET http://admin:password@localhost:5984/_all_dbs
```

### 3. Configuration de l'Application

Modifier l'adresse IP dans `src/services/DatabaseService.js` :

```javascript
// Pour Android Emulator
this.remoteURL = 'http://10.0.2.2:5984';

// Pour appareil physique (remplacer par votre IP locale)
this.remoteURL = 'http://192.168.1.100:5984';

// Pour développement web
this.remoteURL = 'http://localhost:5984';
```

### 4. Lancer l'Application

```bash
# Démarrer Expo
yarn start
# ou
npx expo start

# Pour Android
yarn android

# Pour iOS
yarn ios

# Pour Web
yarn web
```

## 🧪 Guide de Test Complet

### 1. Test de l'Authentification
1. Ouvrir l'application
2. Saisir les identifiants de connexion
3. Vérifier la redirection vers l'écran principal

### 2. Test de Collecte GPS/Photo
1. Aller à "COLLECTE DE DONNÉES"
2. Choisir "MILDA" ou "MÉDICAMENTS"
3. **Tester GPS** :
   - Autoriser la géolocalisation
   - Vérifier l'affichage des coordonnées
   - Tester la sélection manuelle de localisation
4. **Tester Photo** :
   - Prendre une photo avec l'appareil
   - Ou sélectionner depuis la galerie
   - Vérifier l'aperçu de la photo

### 3. Test de Distribution MILDA
1. Depuis l'écran GPS/Photo, choisir "MILDA"
2. Remplir le formulaire :
   - Chef de ménage
   - NNI (10 chiffres)
   - Contact téléphonique
   - Nombre de MILDA
   - Centre de distribution
   - Nom du distributeur
3. Cliquer "ENREGISTRER"
4. Vérifier le message de confirmation

### 4. Test de Distribution Médicaments
1. Depuis l'écran GPS/Photo, choisir "MÉDICAMENTS"
2. Remplir le formulaire :
   - Chef de ménage
   - NNI
   - Contact
   - Quantité de médicaments
   - Centre de distribution
   - Nom du distributeur
3. Enregistrer et vérifier

### 5. Test de Gestion des Données
1. Aller à "GESTION DES DONNÉES"
2. **Vérifier l'affichage** :
   - Statut de connexion (En ligne/Hors ligne)
   - Nombre de distributions
   - Nombre de GPS/Photos
3. **Tester la synchronisation** :
   - Cliquer "SYNCHRONISER MAINTENANT"
   - Vérifier les messages de statut
4. **Visualiser les données** :
   - Voir la liste des distributions
   - Voir les détails GPS/Photos

### 6. Test Offline/Online

#### Mode Offline :
1. Désactiver WiFi/données mobiles
2. Collecter des données (GPS, photo, distribution)
3. Vérifier que les données sont sauvées localement
4. Aller à "Gestion des données" → Statut doit être "Hors ligne"

#### Mode Online :
1. Réactiver la connexion internet
2. Aller à "Gestion des données"
3. Statut doit passer à "En ligne"
4. Cliquer "SYNCHRONISER MAINTENANT"
5. Vérifier la synchronisation dans CouchDB

### 7. Vérification dans CouchDB

#### Interface Web (Fauxton) :
1. Ouvrir http://localhost:5984/_utils/
2. Se connecter (admin/password)
3. Naviguer dans les bases :
   - `omvs_distributions`
   - `omvs_gps_photos`
4. Vérifier que les documents sont présents

#### Ligne de commande :
```bash
# Voir toutes les distributions
curl -X GET http://admin:password@localhost:5984/omvs_distributions/_all_docs?include_docs=true

# Voir toutes les données GPS/Photos
curl -X GET http://admin:password@localhost:5984/omvs_gps_photos/_all_docs?include_docs=true

# Statistiques des bases
curl -X GET http://admin:password@localhost:5984/omvs_distributions
curl -X GET http://admin:password@localhost:5984/omvs_gps_photos
```

## 📁 Structure du Projet

```
OmvsApp/
├── 📄 App.js                           # Point d'entrée principal
├── 📁 src/
│   ├── 📁 screens/                     # Écrans de l'application
│   │   ├── 🔐 SplashScreen.js          # Écran de démarrage
│   │   ├── 🔐 LoginScreen.js           # Authentification
│   │   ├── 🏠 CollectScreen.js         # Menu principal
│   │   ├── 📍 GpsPhotoScreen.js        # GPS + Photo
│   │   ├── 🏥 MildaDistributionScreen.js
│   │   ├── 💊 MedicineDistributionScreen.js
│   │   └── 📊 DataManagementScreen.js  # Gestion des données
│   ├── 📁 services/
│   │   └── 💾 DatabaseService.js       # Service de base de données
│   ├── 📁 config/
│   │   └── ⚙️ database.js              # Configuration DB
│   └── 📁 assets/                      # Images et ressources
├── 🐳 Dockerfile                       # Configuration Docker
├── 🐳 docker-compose.yml               # Orchestration Docker
├── 📦 package.json                     # Dépendances Node.js
└── 📖 README.md                        # Documentation
```

## 💾 Structure des Données

### Document Distribution
```javascript
{
  "_id": "milda_1749593931133_p3gkpequv",
  "type": "milda", // ou "medicine"
  "chefMenage": "Ahmed Mohamed",
  "nni": "2344454556",
  "contact": "+222 12 34 56 78",
  "nombreMilda": "5", // ou quantite pour médicaments
  "centreDistribution": "Centre Rosso",
  "distributeur": "Agent Ahmed",
  "gpsPhotoData": {
    "location": {
      "latitude": "16.276364",
      "longitude": "-15.076473"
    },
    "selectedLocation": {
      "pays": "Mauritanie",
      "region": "Trarza",
      "moughataa": "Rosso",
      "commune": "Rosso"
    },
    "photo": "file://path/to/photo.jpg"
  },
  "timestamp": "2025-01-11T10:30:00.000Z",
  "synced": true
}
```

### Document GPS/Photo
```javascript
{
  "_id": "gps_photo_1749593893394_k0bmka6pj",
  "type": "gps_photo",
  "location": {
    "latitude": "16.276364",
    "longitude": "-15.076473"
  },
  "selectedLocation": {
    "pays": "Mauritanie",
    "region": "Trarza",
    "moughataa": "Rosso",
    "commune": "Rosso"
  },
  "photo": "file://path/to/photo.jpg",
  "timestamp": "2025-01-11T10:25:00.000Z",
  "synced": true
}
```

## 🔧 Configuration Avancée

### Variables d'Environnement

Créer un fichier `.env` :
```env
COUCHDB_URL=http://localhost:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=password
COUCHDB_DB_DISTRIBUTIONS=omvs_distributions
COUCHDB_DB_GPS_PHOTOS=omvs_gps_photos
```

### Configuration Réseau

Pour différents environnements :

```javascript
// Développement local
const config = {
  development: {
    couchdb: 'http://localhost:5984'
  },
  // Android Emulator
  android_emulator: {
    couchdb: 'http://10.0.2.2:5984'
  },
  // Appareil physique
  device: {
    couchdb: 'http://192.168.1.100:5984'
  },
  // Production
  production: {
    couchdb: 'https://your-server.com:5984'
  }
};
```

## 🚀 Déploiement

### Développement avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Build pour Production

```bash
# Android APK
npx expo build:android

# iOS IPA
npx expo build:ios

# Web
npx expo export:web
```

### Déploiement CouchDB Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  couchdb:
    image: couchdb:latest
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=secure_production_password
    volumes:
      - /opt/couchdb/data:/opt/couchdb/data
      - /opt/couchdb/etc:/opt/couchdb/etc/local.d
    restart: always
```

## 🔍 Monitoring et Logs

### Logs de l'Application
```bash
# Logs Expo
npx expo start --clear

# Logs React Native
npx react-native log-android
npx react-native log-ios
```

### Logs CouchDB
```bash
# Logs du conteneur
sudo docker logs omvs-couchdb -f

# Statistiques
curl -X GET http://admin:password@localhost:5984/_stats
```

### Monitoring des Données
```bash
# Nombre de documents
curl -X GET http://admin:password@localhost:5984/omvs_distributions | jq '.doc_count'

# Taille de la base
curl -X GET http://admin:password@localhost:5984/omvs_distributions | jq '.sizes'
```

## 🛠️ Dépannage

### Problèmes Courants

#### 1. CouchDB ne démarre pas
```bash
# Vérifier le port
sudo netstat -tlnp | grep :5984

# Redémarrer le conteneur
sudo docker restart omvs-couchdb

# Voir les logs d'erreur
sudo docker logs omvs-couchdb
```

#### 2. Problèmes de synchronisation
- Vérifier la connexion réseau
- Vérifier l'URL dans DatabaseService.js
- Tester la connexion : `curl http://localhost:5984/`
- Vérifier les identifiants CouchDB

#### 3. Erreurs de permissions
```bash
# Android - Permissions GPS/Caméra
# Aller dans Paramètres > Apps > OMVS > Permissions

# iOS - Permissions dans Info.plist
<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette app a besoin de la localisation pour enregistrer les distributions</string>
```

#### 4. Problèmes de build
```bash
# Nettoyer le cache
npx expo start --clear
yarn cache clean

# Réinstaller les dépendances
rm -rf node_modules
yarn install
```

### Commandes de Debug

```bash
# Tester CouchDB
curl -X GET http://admin:password@localhost:5984/

# Tester les bases de données
curl -X GET http://admin:password@localhost:5984/_all_dbs

# Voir un document spécifique
curl -X GET http://admin:password@localhost:5984/omvs_distributions/[document_id]

# Statistiques de synchronisation
curl -X GET http://admin:password@localhost:5984/omvs_distributions/_changes
```

## 📞 Support et Contribution

### Signaler un Bug
1. Vérifier les logs de l'application
2. Vérifier les logs CouchDB
3. Tester la connectivité réseau
4. Créer une issue avec les détails

### Développement
```bash
# Fork le projet
git clone [your-fork]
cd OmvsApp

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
yarn test

# Commit et push
git commit -m "Ajout nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 🎯 Résumé des Fonctionnalités Testables

✅ **Authentification** - Connexion utilisateur  
✅ **GPS** - Géolocalisation automatique  
✅ **Photos** - Capture et sélection d'images  
✅ **Formulaires** - Distribution MILDA et médicaments  
✅ **Stockage Offline** - Fonctionnement sans internet  
✅ **Synchronisation** - Sync automatique et manuelle  
✅ **Gestion des données** - Visualisation et monitoring  
✅ **CouchDB** - Base de données centralisée  
✅ **Docker** - Déploiement containerisé  
✅ **Interface Web** - Fauxton pour administration  

**L'application est prête pour la production et le déploiement sur le terrain ! 🚀** 