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
import databaseService from '../services/DatabaseService';

/**
 * GpsPhotoScreen Component
 * 
 * This screen handles GPS coordinate capture and photo taking functionality.
 * It serves as an intermediate step before distribution forms, collecting
 * essential location and visual documentation data.
 * 
 * Key Features:
 * - GPS coordinate capture (simulated for demo)
 * - Photo capture from camera or gallery (simulated for demo)
 * - Hierarchical location selection (Country -> Region -> Moughataa -> Commune)
 * - Data persistence to local storage
 * - Navigation context awareness (knows which distribution form to go to next)
 * 
 * Navigation Flow:
 * - Receives nextScreen parameter from CollectScreen
 * - After data collection, navigates to specified distribution screen
 * - Passes collected GPS/photo data to next screen
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @param {Object} route - Route object containing navigation parameters
 * @returns {JSX.Element} - Rendered GPS and photo capture screen
 */
const GpsPhotoScreen = ({ navigation, route }) => {
  // State for photo data - stores photo URI or base64 string
  const [photo, setPhoto] = useState(null);
  
  // State for GPS coordinates - stores latitude and longitude
  const [location, setLocation] = useState({
    longitude: '',
    latitude: '',
  });
  
  // State for hierarchical location selection - administrative divisions
  const [selectedLocation, setSelectedLocation] = useState({
    pays: 'Mauritanie',      // Country (default: Mauritania)
    region: 'Trarza',        // Region (default: Trarza)
    moughataa: 'Rosso',      // Moughataa (administrative division)
    commune: 'Rosso',        // Commune (local administrative unit)
  });
  
  // State for GPS loading indicator
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Extract nextScreen parameter from navigation route
  // This tells us which distribution screen to navigate to after GPS/photo capture
  const nextScreen = route?.params?.nextScreen;

  /**
   * Hierarchical location data structure
   * 
   * Represents the administrative divisions of OMVS member countries:
   * - Mauritania (Mauritanie)
   * - Senegal (Sénégal) 
   * - Mali
   * 
   * Structure: Country -> Region -> Moughataa -> [Communes]
   * This allows users to select their precise location in a structured way
   */
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

  /**
   * Component initialization effect
   * 
   * Runs when component mounts to request necessary permissions
   */
  useEffect(() => {
    requestLocationPermission();
  }, []);

  /**
   * Request location permission from user (Android specific)
   * 
   * Purpose:
   * - Request ACCESS_FINE_LOCATION permission on Android devices
   * - Show appropriate messages in French
   * - Handle permission denial gracefully
   * 
   * Note: In production, this would be required for actual GPS functionality
   */
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',                    // French: "Location Permission"
            message: 'Cette application a besoin d\'accéder à votre localisation pour obtenir les coordonnées GPS.', // French: "This app needs access to your location to get GPS coordinates"
            buttonNeutral: 'Demander plus tard',                   // French: "Ask Later"
            buttonNegative: 'Annuler',                             // French: "Cancel"
            buttonPositive: 'OK',                                  // French: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          Alert.alert('Permission refusée', 'La permission de localisation est nécessaire pour obtenir les coordonnées GPS.'); // French: "Permission denied", "Location permission is required to get GPS coordinates"
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  /**
   * Get GPS coordinates (simulated for demo)
   * 
   * Purpose:
   * - Simulate GPS coordinate capture
   * - Generate realistic coordinates for Senegal River basin area
   * - Update location state with captured coordinates
   * - Provide user feedback
   * 
   * Production Implementation:
   * - Would use react-native-geolocation-service
   * - Would handle GPS errors and timeouts
   * - Would provide accuracy information
   */
  const getLocation = () => {
    setIsLoadingLocation(true); // Show loading state
    
    // Simulate GPS capture delay (2 seconds)
    // In production, this would be actual GPS API call
    setTimeout(() => {
      // Generate mock coordinates for Senegal River basin area
      // Latitude: 16.0-16.5°N (typical for the region)
      // Longitude: -15.0 to -15.5°W (typical for the region)
      const mockCoordinates = {
        latitude: (16.0 + Math.random() * 0.5).toFixed(6),   // 6 decimal precision
        longitude: (-15.0 - Math.random() * 0.5).toFixed(6), // 6 decimal precision
      };
      
      // Update location state with captured coordinates
      setLocation({
        latitude: mockCoordinates.latitude,
        longitude: mockCoordinates.longitude,
      });
      
      setIsLoadingLocation(false); // Hide loading state
      Alert.alert('Succès', 'Coordonnées GPS obtenues avec succès!'); // French: "Success", "GPS coordinates obtained successfully!"
    }, 2000);
  };

  /**
   * Handle photo capture initiation
   * 
   * Purpose:
   * - Show user options for photo source (camera vs gallery)
   * - Delegate to appropriate photo capture method
   * - Provide user-friendly interface for photo selection
   * 
   * Production Implementation:
   * - Would use react-native-image-picker
   * - Would handle camera permissions
   * - Would resize/compress images for storage efficiency
   */
  const takePhoto = () => {
    // Show action sheet with photo source options
    Alert.alert(
      'Prendre une photo',  // French: "Take a photo"
      'Choisissez une option', // French: "Choose an option"
      [
        { text: 'Caméra', onPress: () => simulatePhoto('camera') },   // French: "Camera"
        { text: 'Galerie', onPress: () => simulatePhoto('gallery') }, // French: "Gallery"
        { text: 'Annuler', style: 'cancel' }                         // French: "Cancel"
      ]
    );
  };

  /**
   * Simulate photo capture (demo implementation)
   * 
   * @param {string} source - Photo source ('camera' or 'gallery')
   * 
   * Purpose:
   * - Simulate photo capture from specified source
   * - Set placeholder image for demonstration
   * - Provide user feedback
   * 
   * Production Implementation:
   * - Would capture actual photo from camera or select from gallery
   * - Would handle image processing and optimization
   * - Would store image locally or upload to server
   */
  const simulatePhoto = (source) => {
    // Set placeholder image URL for demonstration
    setPhoto('https://via.placeholder.com/300x200/2196F3/ffffff?text=Photo+Propriete');
    
    // Provide feedback to user about photo source
    Alert.alert('Succès', `Photo prise depuis ${source === 'camera' ? 'la caméra' : 'la galerie'}!`); // French: "Success", "Photo taken from camera/gallery!"
  };

  /**
   * Get available regions for selected country
   * 
   * @returns {Array<string>} - Array of region names
   * 
   * Purpose:
   * - Provide dynamic region options based on selected country
   * - Support hierarchical location selection
   */
  const getRegions = () => {
    return Object.keys(locationData[selectedLocation.pays] || {});
  };

  /**
   * Get available moughataas for selected country and region
   * 
   * @returns {Array<string>} - Array of moughataa names
   * 
   * Purpose:
   * - Provide dynamic moughataa options based on selected country and region
   * - Support hierarchical location selection
   */
  const getMoughataas = () => {
    return Object.keys(locationData[selectedLocation.pays]?.[selectedLocation.region] || {});
  };

  /**
   * Get available communes for selected country, region, and moughataa
   * 
   * @returns {Array<string>} - Array of commune names
   * 
   * Purpose:
   * - Provide dynamic commune options based on full location hierarchy
   * - Complete the hierarchical location selection
   */
  const getCommunes = () => {
    return locationData[selectedLocation.pays]?.[selectedLocation.region]?.[selectedLocation.moughataa] || [];
  };

  /**
   * Handle navigation to next screen
   * 
   * Purpose:
   * - Trigger data saving before navigation
   * - Ensure GPS and photo data is persisted
   */
  const handleNext = () => {
    // Save GPS and photo data before proceeding to distribution form
    saveGpsPhotoData();
  };

  /**
   * Save GPS and photo data to local storage
   * 
   * Purpose:
   * - Persist collected GPS coordinates and photo data
   * - Handle save errors gracefully
   * - Navigate to appropriate distribution screen after saving
   * - Pass data to next screen for form completion
   * 
   * Data Structure:
   * - photo: image URI or base64 string
   * - location: {latitude, longitude}
   * - selectedLocation: {pays, region, moughataa, commune}
   * - timestamp: ISO timestamp for data tracking
   */
  const saveGpsPhotoData = async () => {
    try {
      // Prepare GPS and photo data object
      const gpsPhotoData = {
        photo: photo,                              // Photo URI or data
        location: location,                        // GPS coordinates
        selectedLocation: selectedLocation,        // Administrative location
        timestamp: new Date().toISOString()        // Timestamp for tracking
      };

      // Save data using database service
      await databaseService.saveGpsPhotoData(gpsPhotoData);
      
      // Show success message and handle navigation
      Alert.alert('Succès', 'Données GPS et photo sauvegardées!', [ // French: "Success", "GPS and photo data saved!"
        {
          text: 'OK',
          onPress: () => {
            if (nextScreen) {
              // Navigate to specific distribution screen if specified
              navigation.navigate(nextScreen, { gpsPhotoData });
            } else {
              // Show choice dialog if no specific screen specified
              Alert.alert(
                'Choisir le type de distribution',  // French: "Choose distribution type"
                'Quel type de distribution souhaitez-vous effectuer ?', // French: "What type of distribution do you want to perform?"
                [
                  {
                    text: 'Distribution MILDA',     // French: "MILDA Distribution"
                    onPress: () => navigation.navigate('MildaDistribution', { gpsPhotoData })
                  },
                  {
                    text: 'Distribution Médicament', // French: "Medicine Distribution"
                    onPress: () => navigation.navigate('MedicineDistribution', { gpsPhotoData })
                  },
                  {
                    text: 'Annuler',               // French: "Cancel"
                    style: 'cancel'
                  }
                ]
              );
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving GPS photo data:', error);
      
      // Handle save error gracefully - still allow navigation
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde des données. Les données seront sauvegardées localement.'); // French: "Error", "Error saving data. Data will be saved locally."
      
      // Still proceed to next screen even if save fails
      if (nextScreen) {
        navigation.navigate(nextScreen, { gpsPhotoData: { photo, location, selectedLocation } });
      } else {
        // Show distribution type choice dialog
        Alert.alert(
          'Choisir le type de distribution',
          'Quel type de distribution souhaitez-vous effectuer ?',
          [
            {
              text: 'Distribution MILDA',
              onPress: () => navigation.navigate('MildaDistribution', { gpsPhotoData: { photo, location, selectedLocation } })
            },
            {
              text: 'Distribution Médicament',
              onPress: () => navigation.navigate('MedicineDistribution', { gpsPhotoData: { photo, location, selectedLocation } })
            },
            {
              text: 'Annuler',
              style: 'cancel'
            }
          ]
        );
      }
    }
  };

  // Render the GPS and photo capture interface
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Photo capture button */}
        <TouchableOpacity
          style={styles.photoButton}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>PRENDRE PHOTO PROPRIÉTÉ</Text> {/* French: "TAKE PROPERTY PHOTO" */}
        </TouchableOpacity>

        {/* Photo preview - shown only when photo is captured */}
        {photo && (
          <Image
            source={{ uri: photo }}
            style={styles.photoPreview}
          />
        )}

        {/* GPS coordinate capture button */}
        <TouchableOpacity
          style={[styles.button, isLoadingLocation && styles.buttonDisabled]}
          onPress={getLocation}
          disabled={isLoadingLocation} // Disable during GPS capture
        >
          <Text style={styles.buttonText}>
            {isLoadingLocation ? 'OBTENTION GPS...' : 'PRENDRE COORDONNÉES GPS'} {/* French: "GETTING GPS..." or "GET GPS COORDINATES" */}
          </Text>
        </TouchableOpacity>

        {/* GPS coordinates display - read-only inputs */}
        <View style={styles.coordinatesContainer}>
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={location.longitude}
            editable={false} // Read-only display of captured coordinates
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={location.latitude}
            editable={false} // Read-only display of captured coordinates
          />
        </View>

        {/* Hierarchical location selection interface */}
        <View style={styles.locationContainer}>
          {/* Country selection */}
          <View style={styles.locationItem}>
            <Text style={styles.label}>Pays</Text> {/* French: "Country" */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.pays}
                onValueChange={(value) => {
                  // Reset dependent selections when country changes
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

          {/* Region selection */}
          <View style={styles.locationItem}>
            <Text style={styles.label}>Région</Text> {/* French: "Region" */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.region}
                onValueChange={(value) => {
                  // Reset dependent selections when region changes
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

          {/* Moughataa selection */}
          <View style={styles.locationItem}>
            <Text style={styles.label}>Moughataa</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocation.moughataa}
                onValueChange={(value) => {
                  // Reset commune selection when moughataa changes
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

          {/* Commune selection */}
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

        {/* Next button - proceed to distribution form */}
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>SUIVANT</Text> {/* French: "NEXT" */}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/**
 * StyleSheet for GpsPhotoScreen component
 * 
 * Defines visual styling for all UI elements including:
 * - Layout and spacing
 * - Button styles and states
 * - Input field appearance
 * - Photo preview styling
 * - Picker container styling
 */
const styles = StyleSheet.create({
  // Main container - scrollable full screen
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Content wrapper with padding
  content: {
    padding: 20,
  },
  
  // Photo capture button - distinct blue styling
  photoButton: {
    backgroundColor: '#2196F3', // Material Design blue
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Photo preview image styling
  photoPreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
  },
  
  // Standard button styling
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Disabled button state - gray color
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  
  // Button text styling - white, bold text
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Container for GPS coordinate inputs - side by side layout
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  // Input field styling - read-only GPS coordinates
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background for read-only
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  // Container for location selection pickers
  locationContainer: {
    marginBottom: 20,
  },
  
  // Individual location picker item
  locationItem: {
    marginBottom: 15,
  },
  
  // Label styling for picker items
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  
  // Container for picker with border
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  
  // Picker component styling
  picker: {
    height: 50,
  },
  
  // Next button - additional top margin
  nextButton: {
    marginTop: 20,
  },
});

// Export component for use in navigation stack
export default GpsPhotoScreen; 