# OMVS Mobile App

Application mobile pour la collecte des données des activités de distribution de médicaments et de moustiquaires MILDA.

## Fonctionnalités

- Authentification des utilisateurs
- Gestion des distributions de MILDA
- Gestion des distributions de médicaments
- Capture de photos
- Géolocalisation
- Collecte de données avec formulaires

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS, Mac uniquement)

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd OmvsApp
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Lancer l'application :
```bash
npm start
# ou
yarn start
```

## Développement

L'application est développée avec :
- React Native
- Expo
- React Navigation
- React Native Image Picker
- React Native Geolocation Service

## Structure du Projet

```
OmvsApp/
├── App.js                    # Point d'entrée de l'application
├── src/
│   ├── screens/             # Écrans de l'application
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── CollectScreen.js
│   │   ├── GpsPhotoScreen.js
│   │   ├── MildaDistributionScreen.js
│   │   └── MedicineDistributionScreen.js
│   └── assets/              # Images et ressources
├── package.json
└── README.md
```

## Permissions Requises

L'application nécessite les permissions suivantes :
- Caméra (pour la prise de photos)
- Localisation (pour le GPS)
- Stockage (pour sauvegarder les photos)

## Déploiement

Pour générer une version de production :

```bash
expo build:android  # Pour Android
# ou
expo build:ios      # Pour iOS
``` 