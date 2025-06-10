<div align="center">

# 🌍 OMVS Mobile App
### *Distribution Data Collection System*

<img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
<img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
<img src="https://img.shields.io/badge/CouchDB-E42528?style=for-the-badge&logo=apache-couchdb&logoColor=white" alt="CouchDB" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />

*Collecte intelligente des données de distribution MILDA & médicaments avec synchronisation offline/online*

[🚀 Démarrage Rapide](#-démarrage-rapide) • [📱 Fonctionnalités](#-fonctionnalités) • [🐳 Docker](#-docker) • [📖 Documentation](#-guide-complet)

---

</div>

## 🎯 **À Propos**

> **OMVS Mobile App** est une solution moderne de collecte de données pour les agents de terrain, permettant l'enregistrement des distributions de moustiquaires MILDA et de médicaments, même sans connexion internet.

### ✨ **Pourquoi cette app ?**
- 🌐 **Offline-First** : Fonctionne partout, même sans internet
- 📍 **Géolocalisation précise** : GPS automatique pour chaque distribution
- 📸 **Documentation visuelle** : Photos intégrées
- 🔄 **Synchronisation intelligente** : Données centralisées automatiquement
- 🛡️ **Fiable & Sécurisé** : Aucune perte de données

---

## 🚀 **Démarrage Rapide**

<details>
<summary>🐳 <strong>Option 1: Docker (Recommandé)</strong></summary>

```bash
# 1️⃣ Cloner le projet
git clone [url-du-repo] && cd OmvsApp

# 2️⃣ Déployer avec Docker
./scripts/deploy.sh dev

# 3️⃣ Accéder à l'app
# 🌐 App Web: http://localhost:19006
# 🗄️ CouchDB: http://localhost:5984/_utils
```

</details>

<details>
<summary>⚡ <strong>Option 2: Installation Manuelle</strong></summary>

```bash
# 1️⃣ Prérequis
npm install -g @expo/cli

# 2️⃣ Installation
yarn install

# 3️⃣ Base de données
docker run -d --name couchdb -p 5984:5984 \
  -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb

# 4️⃣ Lancer l'app
yarn start
```

</details>

---

## 📱 **Fonctionnalités**

<table>
<tr>
<td width="50%">

### 🔐 **Authentification**
- Connexion sécurisée
- Gestion des sessions
- Multi-utilisateurs

### 📍 **Géolocalisation**
- GPS automatique
- Sélection manuelle
- Coordonnées précises

### 📸 **Documentation**
- Capture photo
- Galerie intégrée
- Aperçu instantané

</td>
<td width="50%">

### 📋 **Collecte de Données**
- Formulaires MILDA
- Distribution médicaments
- Validation automatique

### 💾 **Stockage Intelligent**
- AsyncStorage local
- Synchronisation CouchDB
- Gestion des conflits

### 📊 **Monitoring**
- Tableau de bord
- Statut de sync
- Statistiques temps réel

</td>
</tr>
</table>

---

## 🏗️ **Architecture**

<div align="center">

```mermaid
graph TB
    A[📱 Mobile App] --> B[💾 AsyncStorage]
    A --> C[📡 Sync Service]
    C --> D[🌐 CouchDB Server]
    D --> E[🗄️ Fauxton UI]
    D --> F[📊 Monitoring]
    
    style A fill:#61DAFB,stroke:#333,stroke-width:2px
    style D fill:#E42528,stroke:#333,stroke-width:2px
    style B fill:#FFA500,stroke:#333,stroke-width:2px
```

</div>

### 🔧 **Stack Technique**

| Composant | Technologie | Version |
|-----------|-------------|---------|
| 📱 **Frontend** | React Native + Expo | `~50.0.0` |
| 🗄️ **Base de données** | Apache CouchDB | `latest` |
| 💾 **Stockage local** | AsyncStorage | `^1.19.0` |
| 🌐 **Synchronisation** | HTTP REST API | - |
| 📍 **Géolocalisation** | @react-native-community/geolocation | `^3.0.0` |
| 📸 **Photos** | react-native-image-picker | `^7.0.0` |
| 🐳 **Conteneurisation** | Docker + Docker Compose | `latest` |

---

## 🐳 **Docker**

### 🚀 **Déploiement Automatisé**

<div align="center">

| Commande | Description | Environnement |
|----------|-------------|---------------|
| `./scripts/deploy.sh dev` | 🔧 Développement | Local |
| `./scripts/deploy.sh prod` | 🚀 Production | Serveur |
| `./scripts/deploy.sh logs` | 📋 Voir les logs | - |
| `./scripts/deploy.sh backup` | 💾 Sauvegarde | - |

</div>

### 📊 **Services Disponibles**

<table>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/CouchDB-E42528?style=flat-square&logo=apache-couchdb&logoColor=white" /><br>
<strong>Base de Données</strong><br>
<code>:5984</code>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" /><br>
<strong>App Mobile</strong><br>
<code>:19000</code>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Web-61DAFB?style=flat-square&logo=react&logoColor=black" /><br>
<strong>Interface Web</strong><br>
<code>:19006</code>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Fauxton-FF6B35?style=flat-square&logo=apache&logoColor=white" /><br>
<strong>Admin DB</strong><br>
<code>:8080</code>
</td>
</tr>
</table>

---

## 🧪 **Guide de Test**

### 🎮 **Scénarios de Test**

<details>
<summary>🔐 <strong>1. Test d'Authentification</strong></summary>

```bash
✅ Ouvrir l'application
✅ Saisir identifiants (admin/password)
✅ Vérifier redirection écran principal
✅ Tester déconnexion
```

</details>

<details>
<summary>📍 <strong>2. Test GPS & Photos</strong></summary>

```bash
✅ Aller à "COLLECTE DE DONNÉES"
✅ Autoriser géolocalisation
✅ Vérifier coordonnées GPS
✅ Prendre une photo
✅ Sélectionner localisation manuelle
```

</details>

<details>
<summary>📋 <strong>3. Test Formulaires</strong></summary>

```bash
# MILDA Distribution
✅ Remplir chef de ménage
✅ Saisir NNI (10 chiffres)
✅ Ajouter contact téléphone
✅ Indiquer nombre MILDA
✅ Enregistrer et vérifier

# Médicaments
✅ Même processus avec quantités
✅ Vérifier validation formulaire
```

</details>

<details>
<summary>🔄 <strong>4. Test Offline/Online</strong></summary>

```bash
# Mode Offline
✅ Désactiver connexion
✅ Collecter données
✅ Vérifier stockage local
✅ Statut "Hors ligne"

# Mode Online
✅ Réactiver connexion
✅ Synchronisation automatique
✅ Vérifier dans CouchDB
✅ Statut "En ligne"
```

</details>

### 🔍 **Vérification des Données**

<div align="center">

| Interface | URL | Utilisation |
|-----------|-----|-------------|
| 🌐 **Fauxton** | `http://localhost:5984/_utils` | Interface graphique |
| 📊 **API REST** | `http://localhost:5984` | Accès programmatique |
| 🔧 **Proxy** | `http://localhost:8080` | Interface simplifiée |

</div>

---

## 📁 **Structure du Projet**

```
🏠 OmvsApp/
├── 📱 src/
│   ├── 🖥️  screens/           # Écrans de l'application
│   │   ├── 🔐 LoginScreen.js
│   │   ├── 🏠 CollectScreen.js
│   │   ├── 📍 GpsPhotoScreen.js
│   │   ├── 🏥 MildaDistributionScreen.js
│   │   ├── 💊 MedicineDistributionScreen.js
│   │   └── 📊 DataManagementScreen.js
│   ├── 🔧 services/
│   │   └── 💾 DatabaseService.js
│   └── ⚙️  config/
│       └── 🗄️ database.js
├── 🐳 docker/                 # Configuration Docker
│   ├── 📄 nginx.conf
│   └── 🔧 couchdb.ini
├── 📜 scripts/
│   └── 🚀 deploy.sh          # Script de déploiement
├── 🐳 Dockerfile
├── 🐳 docker-compose.yml
└── 📖 README.md
```

---

## 💾 **Structure des Données**

### 📊 **Document Distribution**

```json
{
  "_id": "milda_1749593931133_p3gkpequv",
  "type": "milda",
  "chefMenage": "Ahmed Mohamed",
  "nni": "2344454556",
  "contact": "+222 12 34 56 78",
  "nombreMilda": "5",
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

---

## 🔧 **Configuration**

### 🌐 **Variables d'Environnement**

```env
# 🗄️ CouchDB
COUCHDB_URL=http://localhost:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=password

# 📊 Monitoring
GRAFANA_PASSWORD=admin123

# 🚀 Application
NODE_ENV=production
```

### 📱 **Configuration Réseau**

<div align="center">

| Environnement | URL CouchDB | Usage |
|---------------|-------------|-------|
| 🖥️ **Développement** | `http://localhost:5984` | Web/Desktop |
| 📱 **Émulateur Android** | `http://10.0.2.2:5984` | Android Studio |
| 📲 **Appareil Physique** | `http://192.168.x.x:5984` | WiFi local |
| 🌐 **Production** | `https://your-server.com:5984` | Serveur distant |

</div>

---

## 🚀 **Déploiement**

### 🔧 **Développement**

```bash
# 🐳 Avec Docker
./scripts/deploy.sh dev

# ⚡ Manuel
yarn install && yarn start
```

### 🌐 **Production**

```bash
# 🐳 Docker Production
./scripts/deploy.sh prod

# 📱 Build Mobile
npx expo build:android  # Android APK
npx expo build:ios      # iOS IPA
```

### 📊 **Monitoring (Optionnel)**

```bash
# 🚀 Démarrer avec monitoring
docker-compose --profile monitoring up -d

# 📈 Accès
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000
```

---

## 🛠️ **Dépannage**

<details>
<summary>🐳 <strong>Problèmes Docker</strong></summary>

```bash
# 🔍 Vérifier les conteneurs
docker ps -a

# 📋 Voir les logs
docker logs omvs-couchdb

# 🔄 Redémarrer
docker restart omvs-couchdb

# 🧹 Nettoyer
./scripts/deploy.sh cleanup
```

</details>

<details>
<summary>🔄 <strong>Problèmes de Synchronisation</strong></summary>

```bash
# 🌐 Tester la connexion
curl http://localhost:5984/

# 🗄️ Vérifier les bases
curl http://admin:password@localhost:5984/_all_dbs

# 📊 Forcer la synchronisation
# Via l'app: Gestion des données > Synchroniser
```

</details>

<details>
<summary>📱 <strong>Problèmes Mobile</strong></summary>

```bash
# 🧹 Nettoyer le cache
npx expo start --clear
yarn cache clean

# 🔄 Réinstaller
rm -rf node_modules && yarn install

# 📱 Permissions Android
# Paramètres > Apps > OMVS > Permissions
```

</details>

---

## 📈 **Monitoring & Analytics**

### 📊 **Métriques Disponibles**

<div align="center">

| Métrique | Description | Commande |
|----------|-------------|----------|
| 📄 **Documents** | Nombre total | `curl http://admin:password@localhost:5984/omvs_distributions \| jq '.doc_count'` |
| 💾 **Taille DB** | Espace utilisé | `curl http://admin:password@localhost:5984/omvs_distributions \| jq '.sizes'` |
| 🔄 **Synchronisation** | Changements | `curl http://admin:password@localhost:5984/omvs_distributions/_changes` |
| 📊 **Statistiques** | Métriques globales | `curl http://admin:password@localhost:5984/_stats` |

</div>

### 💾 **Sauvegarde**

```bash
# 🔄 Sauvegarde automatique
./scripts/deploy.sh backup

# 📁 Sauvegarde manuelle
mkdir backups/$(date +%Y%m%d)
curl -X GET http://admin:password@localhost:5984/omvs_distributions/_all_docs?include_docs=true > backups/$(date +%Y%m%d)/distributions.json
```

---

## 🤝 **Contribution**

### 🔧 **Développement**

```bash
# 🍴 Fork le projet
git clone [your-fork]
cd OmvsApp

# 🌿 Créer une branche
git checkout -b feature/awesome-feature

# 💻 Développer
# ... vos modifications ...

# ✅ Tester
yarn test

# 📤 Proposer
git commit -m "✨ Add awesome feature"
git push origin feature/awesome-feature
```

### 🐛 **Signaler un Bug**

1. 🔍 Vérifier les logs
2. 🧪 Reproduire le problème
3. 📝 Créer une issue détaillée
4. 🏷️ Ajouter les labels appropriés

---

## 📄 **Licence**

<div align="center">

**MIT License** © 2025 OMVS

*Libre d'utilisation, modification et distribution*

</div>

---

<div align="center">

## 🎯 **Résumé des Fonctionnalités**

<table>
<tr>
<td align="center">✅</td><td><strong>Authentification</strong></td><td>Connexion sécurisée</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>GPS</strong></td><td>Géolocalisation automatique</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Photos</strong></td><td>Capture et galerie</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Formulaires</strong></td><td>MILDA & Médicaments</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Offline</strong></td><td>Fonctionnement hors ligne</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Synchronisation</strong></td><td>Auto & manuelle</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Monitoring</strong></td><td>Tableau de bord</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Docker</strong></td><td>Déploiement facile</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>CouchDB</strong></td><td>Base centralisée</td>
</tr>
<tr>
<td align="center">✅</td><td><strong>Production Ready</strong></td><td>Prêt pour le terrain</td>
</tr>
</table>

---

### 🚀 **L'application est prête pour la production !**

*Déployez facilement avec Docker et commencez à collecter vos données dès maintenant*

[⬆️ Retour en haut](#-omvs-mobile-app)

</div> 