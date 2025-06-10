# OMVS Mobile App

Application mobile pour la collecte des données des activités de distribution de médicaments et de moustiquaires MILDA avec synchronisation offline/online.

## 🎯 Fonctionnalités

- Authentification des utilisateurs
- Gestion des distributions de MILDA
- Gestion des distributions de médicaments
- Capture de photos et géolocalisation GPS
- **Stockage offline avec PouchDB**
- **Synchronisation automatique avec CouchDB**
- Collecte de données avec formulaires
- Gestion et visualisation des données stockées

## 🗄️ Qu'est-ce que CouchDB ?

**CouchDB** (Apache CouchDB) est une base de données NoSQL qui stocke les données au format JSON. Elle est parfaite pour les applications mobiles car :

### Avantages de CouchDB :
- **Réplication bidirectionnelle** : Synchronisation automatique entre appareils
- **Offline-first** : Fonctionne sans connexion internet
- **Résolution de conflits** : Gère automatiquement les conflits de données
- **API REST** : Interface simple via HTTP
- **Scalabilité** : Peut gérer de gros volumes de données
- **Multi-maître** : Plusieurs appareils peuvent modifier les mêmes données

### Architecture de notre app :
```
📱 App Mobile (PouchDB) ↔️ 🌐 Serveur CouchDB
     ↓                           ↓
  Stockage local            Base de données centrale
  (Offline)                    (Online)
```

## 🐳 Configuration Docker

### Prérequis
- Docker installé sur votre système
- Port 5984 disponible

### 1. Démarrer CouchDB avec Docker

```bash
# Créer et démarrer le conteneur CouchDB
sudo docker run -d \
  --name couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:latest
```

### 2. Créer les bases de données

```bash
# Créer la base de données pour les distributions
curl -X PUT http://admin:password@localhost:5984/omvs_distributions

# Créer la base de données pour les données GPS/Photos
curl -X PUT http://admin:password@localhost:5984/omvs_gps_photos
```

### 3. Vérifier l'installation

```bash
# Tester la connexion
curl -X GET http://admin:password@localhost:5984/

# Lister toutes les bases de données
curl -X GET http://admin:password@localhost:5984/_all_dbs
```

### 4. Commandes Docker utiles

```bash
# Démarrer le conteneur
sudo docker start couchdb

# Arrêter le conteneur
sudo docker stop couchdb

# Voir les logs
sudo docker logs couchdb

# Voir les conteneurs en cours
sudo docker ps

# Accéder à l'interface web CouchDB
# Ouvrir http://localhost:5984/_utils dans votre navigateur
```

## 💾 Architecture de données

### PouchDB (Client - App Mobile)
- **Stockage local** : AsyncStorage sur React Native
- **Synchronisation** : Automatique quand en ligne
- **Offline-first** : Fonctionne sans internet

### CouchDB (Serveur)
- **Base centrale** : Stocke toutes les données
- **Multi-utilisateurs** : Plusieurs appareils peuvent se synchroniser
- **Backup** : Données sauvegardées sur le serveur

### Structure des données

```javascript
// Distribution MILDA/Médicament
{
  "_id": "milda_1234567890_abc123",
  "type": "milda", // ou "medicine"
  "chefMenage": "Nom du chef",
  "nni": "1234567890",
  "contact": "+222 12 34 56 78",
  "nombreMilda": "5", // ou quantite pour médicaments
  "centreDistribution": "Centre Rosso",
  "distributeur": "Agent XYZ",
  "gpsPhotoData": {
    "location": {
      "latitude": "16.123456",
      "longitude": "-15.654321"
    },
    "selectedLocation": {
      "pays": "Mauritanie",
      "region": "Trarza",
      "moughataa": "Rosso",
      "commune": "Rosso"
    },
    "photo": "file://path/to/photo.jpg"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI
- Docker (pour CouchDB)
- Android Studio (pour Android)
- Xcode (pour iOS, Mac uniquement)

### 1. Cloner et installer

```bash
git clone [url-du-repo]
cd OmvsApp
npm install
```

### 2. Démarrer CouchDB

```bash
# Démarrer le conteneur Docker
sudo docker start couchdb

# Ou créer un nouveau conteneur si nécessaire
sudo docker run -d --name couchdb -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:latest
```

### 3. Lancer l'application

```bash
npm start
# ou
yarn start
```

## 🛠️ Développement

L'application est développée avec :
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **React Navigation** - Navigation entre écrans
- **PouchDB** - Base de données locale
- **CouchDB** - Base de données serveur
- **React Native Image Picker** - Capture de photos
- **React Native Geolocation** - GPS

## 📁 Structure du Projet

```
OmvsApp/
├── App.js                           # Point d'entrée
├── src/
│   ├── screens/                     # Écrans de l'application
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── CollectScreen.js
│   │   ├── GpsPhotoScreen.js        # GPS + Photo
│   │   ├── MildaDistributionScreen.js
│   │   ├── MedicineDistributionScreen.js
│   │   └── DataManagementScreen.js  # Gestion des données
│   ├── services/
│   │   └── DatabaseService.js       # Service PouchDB
│   ├── config/
│   │   └── database.js              # Configuration DB
│   └── assets/                      # Images et ressources
├── package.json
└── README.md
```

## 🔄 Flux de données

1. **Collecte** : L'utilisateur saisit les données (GPS, photo, formulaire)
2. **Stockage local** : Données sauvées dans PouchDB (offline)
3. **Synchronisation** : Quand en ligne, sync automatique avec CouchDB
4. **Visualisation** : Écran de gestion pour voir toutes les données
5. **Backup** : Données centralisées sur le serveur CouchDB

## 🔧 Configuration

### Changer l'URL du serveur CouchDB

Modifier dans `src/services/DatabaseService.js` :

```javascript
// Pour un serveur distant
this.remoteURL = 'http://your-server.com:5984';

// Pour un serveur local
this.remoteURL = 'http://localhost:5984';
```

### Authentification CouchDB

```javascript
auth: {
  username: 'admin',
  password: 'password'
}
```

## 📱 Permissions Requises

L'application nécessite les permissions suivantes :
- **Caméra** : Pour la prise de photos
- **Localisation** : Pour obtenir les coordonnées GPS
- **Stockage** : Pour sauvegarder les photos
- **Internet** : Pour la synchronisation (optionnel)

## 🚀 Déploiement

### Générer une version de production

```bash
# Android
expo build:android

# iOS
expo build:ios
```

### Déployer CouchDB en production

```bash
# Avec Docker Compose
version: '3'
services:
  couchdb:
    image: couchdb:latest
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=secure_password
    volumes:
      - couchdb_data:/opt/couchdb/data
volumes:
  couchdb_data:
```

## 🔍 Dépannage

### CouchDB ne démarre pas
```bash
# Vérifier si le port est libre
sudo netstat -tlnp | grep :5984

# Redémarrer le conteneur
sudo docker restart couchdb
```

### Problèmes de synchronisation
1. Vérifier la connexion internet
2. Vérifier l'URL du serveur CouchDB
3. Vérifier les identifiants d'authentification
4. Consulter les logs : `sudo docker logs couchdb`

### Données non synchronisées
- Utiliser l'écran "Gestion des données" pour forcer la synchronisation
- Vérifier l'état de connexion dans l'app

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de l'application
2. Vérifier les logs CouchDB : `sudo docker logs couchdb`
3. Tester la connexion : `curl http://localhost:5984/`

---

**Note** : Cette application fonctionne en mode offline-first. Les données sont toujours sauvegardées localement et synchronisées quand une connexion est disponible. 