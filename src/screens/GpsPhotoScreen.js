import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const GpsPhotoScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState({
    longitude: '',
    latitude: '',
  });
  const [selectedLocation, setSelectedLocation] = useState({
    pays: 'Mauritanie',
    region: 'Trarza',
    moughataa: 'Rosso',
    commune: 'Rosso',
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Location data
  const locationData = {
    'Mauritanie': {
      'Trarza': {
        'Rosso': ['Rosso', 'Diama'],
        'Keur Massène': ['Keur Massène', 'Lexeiba']
      },
      'Brakna': {
        'Aleg': ['Aleg', 'Bababé'],
        'Magta Lahjar': ['Magta Lahjar', 'Boghé']
      }
    },
    'Sénégal': {
      'Saint-Louis': {
        'Dagana': ['Dagana', 'Richard Toll'],
        'Podor': ['Podor', 'Golléré']
      }
    },
    'Mali': {
      'Kayes': {
        'Kayes': ['Kayes', 'Yélimané'],
        'Bafoulabé': ['Bafoulabé', 'Kéniéba']
      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',
            message: 'Cette application a besoin d\'accéder à votre localisation pour obtenir les coordonnées GPS.',
            buttonNeutral: 'Demander plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          Alert.alert('Permission refusée', 'La permission de localisation est nécessaire pour obtenir les coordonnées GPS.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const getLocation = () => {
    setIsLoadingLocation(true);
    
    // For demo purposes, we'll simulate getting GPS coordinates
    // In a real app, you would use react-native-geolocation-service
    setTimeout(() => {
      // Simulate GPS coordinates for the Senegal River basin area
      const mockCoordinates = {
        latitude: (16.0 + Math.random() * 0.5).toFixed(6), // Around 16.0-16.5°N
        longitude: (-15.0 - Math.random() * 0.5).toFixed(6), // Around -15.0 to -15.5°W
      };
      
      setLocation({
        latitude: mockCoordinates.latitude,
        longitude: mockCoordinates.longitude,
      });
      setIsLoadingLocation(false);
      Alert.alert('Succès', 'Coordonnées GPS obtenues avec succès!');
    }, 2000);
  };

  const takePhoto = () => {
    // For demo purposes, we'll simulate taking a photo
    // In a real app, you would use react-native-image-picker
    Alert.alert(
      'Prendre une photo',
      'Choisissez une option',
      [
        { text: 'Caméra', onPress: () => simulatePhoto('camera') },
        { text: 'Galerie', onPress: () => simulatePhoto('gallery') },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const simulatePhoto = (source) => {
    // Simulate photo capture
    setPhoto('https://via.placeholder.com/300x200/2196F3/ffffff?text=Photo+Propriete');
    Alert.alert('Succès', `Photo prise depuis ${source === 'camera' ? 'la caméra' : 'la galerie'}!`);
  };

  const getRegions = () => {
    return Object.keys(locationData[selectedLocation.pays] || {});
  };

  const getMoughataas = () => {
    return Object.keys(locationData[selectedLocation.pays]?.[selectedLocation.region] || {});
  };

  const getCommunes = () => {
    return locationData[selectedLocation.pays]?.[selectedLocation.region]?.[selectedLocation.moughataa] || [];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>PRENDRE PHOTO PROPRIÉTÉ</Text>
        </TouchableOpacity>

        {photo && (
          <Image
            source={{ uri: photo }}
            style={styles.photoPreview}
          />
        )}

        <TouchableOpacity
          style={[styles.button, isLoadingLocation && styles.buttonDisabled]}
          onPress={getLocation}
          disabled={isLoadingLocation}
        >
          <Text style={styles.buttonText}>
            {isLoadingLocation ? 'OBTENTION GPS...' : 'PRENDRE COORDONNÉES GPS'}
          </Text>
        </TouchableOpacity>

        <View style={styles.coordinatesContainer}>
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={location.longitude}
            editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={location.latitude}
            editable={false}
          />
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <Text style={styles.label}>Pays</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.pays}
                onValueChange={(value) => {
                  setSelectedLocation({
                    pays: value,
                    region: Object.keys(locationData[value] || {})[0] || '',
                    moughataa: '',
                    commune: ''
                  });
                }}
                style={styles.picker}
              >
                {Object.keys(locationData).map((pays) => (
                  <Picker.Item key={pays} label={pays} value={pays} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.locationItem}>
            <Text style={styles.label}>Région</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.region}
                onValueChange={(value) => {
                  const moughataas = Object.keys(locationData[selectedLocation.pays]?.[value] || {});
                  setSelectedLocation({
                    ...selectedLocation,
                    region: value,
                    moughataa: moughataas[0] || '',
                    commune: ''
                  });
                }}
                style={styles.picker}
              >
                {getRegions().map((region) => (
                  <Picker.Item key={region} label={region} value={region} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.locationItem}>
            <Text style={styles.label}>Moughataa</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.moughataa}
                onValueChange={(value) => {
                  const communes = locationData[selectedLocation.pays]?.[selectedLocation.region]?.[value] || [];
                  setSelectedLocation({
                    ...selectedLocation,
                    moughataa: value,
                    commune: communes[0] || ''
                  });
                }}
                style={styles.picker}
              >
                {getMoughataas().map((moughataa) => (
                  <Picker.Item key={moughataa} label={moughataa} value={moughataa} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.locationItem}>
            <Text style={styles.label}>Commune</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.commune}
                onValueChange={(value) => {
                  setSelectedLocation({
                    ...selectedLocation,
                    commune: value
                  });
                }}
                style={styles.picker}
              >
                {getCommunes().map((commune) => (
                  <Picker.Item key={commune} label={commune} value={commune} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={() => navigation.navigate('MildaDistribution')}
        >
          <Text style={styles.buttonText}>SUIVANT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  photoButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  nextButton: {
    marginTop: 20,
  },
});

export default GpsPhotoScreen; 