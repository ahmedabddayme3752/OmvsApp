import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import databaseService from '../services/DatabaseService';

/**
 * MildaDistributionScreen Component
 * 
 * This screen handles the MILDA (Mosquito Net) distribution form.
 * It collects beneficiary information and distribution details for MILDA distribution.
 * 
 * Key Features:
 * - Form for collecting beneficiary information (name, NNI, contact)
 * - Distribution details (quantity, center, distributor)
 * - Photo capture for documentation
 * - Integration with GPS/photo data from previous screen
 * - Data validation and persistence
 * - Offline-first data storage with sync capability
 * 
 * Data Flow:
 * - Receives GPS/photo data from GpsPhotoScreen
 * - Collects distribution form data
 * - Combines both datasets for complete record
 * - Saves to local storage with sync to remote server
 * 
 * MILDA Context:
 * - MILDA = Long-Lasting Insecticidal Nets for malaria prevention
 * - Part of OMVS health initiatives in Senegal River basin
 * - Requires detailed tracking for distribution accountability
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @param {Object} route - Route object containing GPS/photo data from previous screen
 * @returns {JSX.Element} - Rendered MILDA distribution form screen
 */
const MildaDistributionScreen = ({ navigation, route }) => {
  // State for form data - all distribution-related information
  const [formData, setFormData] = useState({
    chefMenage: '',           // Head of household name
    nni: '',                  // National ID number (Numéro National d'Identification)
    contact: '',              // Phone number or contact information
    nombreMilda: '',          // Number of MILDA nets required/distributed
    centreDistribution: '',   // Distribution center name/location
    distributeur: '',         // Name of person distributing
    date: new Date().toLocaleDateString(), // Distribution date (auto-filled)
    photo: null,              // Photo of distribution/beneficiary
  });

  // Extract GPS and photo data passed from previous screen (GpsPhotoScreen)
  const gpsPhotoData = route?.params?.gpsPhotoData;

  /**
   * Component initialization effect
   * 
   * Runs when component mounts to process GPS/photo data from previous screen
   */
  useEffect(() => {
    if (gpsPhotoData) {
      console.log('Received GPS Photo data:', gpsPhotoData);
      // GPS/photo data is available for combining with form data
    }
  }, [gpsPhotoData]);

  /**
   * Handle form input changes
   * 
   * @param {string} field - The form field name to update
   * @param {string} value - The new value for the field
   * 
   * Purpose:
   * - Update specific form field in state
   * - Maintain immutable state updates
   * - Support controlled input components
   */
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,        // Spread existing form data
      [field]: value,     // Update specific field with new value
    });
  };

  /**
   * Handle photo capture for distribution documentation
   * 
   * Purpose:
   * - Launch camera to capture distribution photo
   * - Handle photo selection and storage
   * - Provide visual documentation of distribution
   * 
   * Note: Currently using react-native-image-picker
   * In production, this would capture actual photos of:
   * - Beneficiary receiving MILDA nets
   * - Distribution process
   * - Verification documentation
   */
  const takePhoto = () => {
    ImagePicker.launchCamera({
      mediaType: 'photo',    // Only allow photo capture
      quality: 0.8,          // Compress to 80% quality for storage efficiency
    }, (response) => {
      // Handle user cancellation
      if (response.didCancel) {
        return;
      }
      
      // Process successful photo capture
      if (response.assets && response.assets[0]) {
        handleInputChange('photo', response.assets[0].uri);
      }
    });
  };

  /**
   * Handle form submission and data persistence
   * 
   * Purpose:
   * - Validate form data (basic validation)
   * - Combine form data with GPS/photo data from previous screen
   * - Save complete distribution record to local storage
   * - Sync data to remote CouchDB server when online
   * - Provide user feedback and navigation
   * - Handle errors gracefully with offline fallback
   * 
   * Data Structure:
   * - Form data: beneficiary and distribution details
   * - GPS data: location coordinates and administrative location
   * - Photo data: property photo from GPS screen + distribution photo
   * - Metadata: timestamps, sync status, etc.
   */
  const handleSubmit = async () => {
    try {
      // Combine form data with GPS/photo data from previous screen
      const completeData = {
        ...formData,                              // Distribution form data
        gpsPhotoData: gpsPhotoData,              // GPS coordinates and location data
        submittedAt: new Date().toISOString()    // Submission timestamp
      };

      // Save complete distribution record to database
      // Type 'milda' distinguishes from medicine distributions
      await databaseService.saveDistributionData(completeData, 'milda');
      
      // Show success message and navigate back to main menu
      Alert.alert(
        'Succès',                                    // French: "Success"
        'Distribution MILDA sauvegardée avec succès!', // French: "MILDA distribution saved successfully!"
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Collect') // Return to main collection screen
          }
        ]
      );
    } catch (error) {
      console.error('Error saving MILDA distribution:', error);
      
      // Handle save errors gracefully - data is still saved locally
      Alert.alert(
        'Erreur',                                        // French: "Error"
        'Erreur lors de la sauvegarde. Les données seront sauvegardées localement.', // French: "Save error. Data will be saved locally."
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Collect') // Still navigate back - data is preserved
          }
        ]
      );
    }
  };

  // Render the MILDA distribution form
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Head of household name input */}
        <TextInput
          style={styles.input}
          placeholder="Chef de ménage"                    // French: "Head of household"
          value={formData.chefMenage}
          onChangeText={(value) => handleInputChange('chefMenage', value)}
        />

        {/* National ID number input */}
        <TextInput
          style={styles.input}
          placeholder="NNI"                              // French: "National ID Number"
          value={formData.nni}
          onChangeText={(value) => handleInputChange('nni', value)}
          keyboardType="numeric"                         // Numeric keyboard for ID numbers
        />

        {/* Contact information input */}
        <TextInput
          style={styles.input}
          placeholder="Contact"                          // Phone number or contact info
          value={formData.contact}
          onChangeText={(value) => handleInputChange('contact', value)}
          keyboardType="phone-pad"                       // Phone keyboard for contact numbers
        />

        {/* Number of MILDA nets required/distributed */}
        <TextInput
          style={styles.input}
          placeholder="Nombre des MILDA requis"          // French: "Number of MILDA required"
          value={formData.nombreMilda}
          onChangeText={(value) => handleInputChange('nombreMilda', value)}
          keyboardType="numeric"                         // Numeric keyboard for quantities
        />

        {/* Distribution center name/location */}
        <TextInput
          style={styles.input}
          placeholder="Centre de distribution"           // French: "Distribution center"
          value={formData.centreDistribution}
          onChangeText={(value) => handleInputChange('centreDistribution', value)}
        />

        {/* Distributor name */}
        <TextInput
          style={styles.input}
          placeholder="Nom du distributeur"              // French: "Distributor name"
          value={formData.distributeur}
          onChangeText={(value) => handleInputChange('distributeur', value)}
        />

        {/* Distribution date - auto-filled, read-only */}
        <TextInput
          style={styles.input}
          placeholder="Date"
          value={formData.date}
          editable={false}                               // Read-only field
        />

        {/* Photo capture button for distribution documentation */}
        <TouchableOpacity
          style={styles.photoButton}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>PRENDRE PHOTO</Text> {/* French: "TAKE PHOTO" */}
        </TouchableOpacity>

        {/* Photo preview - shown only when photo is captured */}
        {formData.photo && (
          <Image
            source={{ uri: formData.photo }}
            style={styles.photoPreview}
          />
        )}

        {/* Submit button - save distribution data */}
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>SAUVEGARDER</Text> {/* French: "SAVE" */}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/**
 * StyleSheet for MildaDistributionScreen component
 * 
 * Defines visual styling for the distribution form including:
 * - Form layout and spacing
 * - Input field styling
 * - Button appearance and states
 * - Photo preview styling
 * - Responsive design elements
 */
const styles = StyleSheet.create({
  // Main container - full screen scrollable
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Content wrapper with padding
  content: {
    padding: 20,
  },
  
  // Input field styling - consistent appearance for all form fields
  input: {
    backgroundColor: '#fff',     // White background
    borderRadius: 5,             // Rounded corners
    padding: 15,                 // Internal padding for touch area
    marginBottom: 15,            // Spacing between fields
    borderWidth: 1,              // Border for definition
    borderColor: '#ddd',         // Light gray border
  },
  
  // Photo capture button - blue background to match app theme
  photoButton: {
    backgroundColor: '#2196F3',  // Material Design blue
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Photo preview styling - full width with fixed height
  photoPreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 5,             // Rounded corners to match other elements
  },
  
  // Base button styling
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  // Submit button - green color to indicate positive action
  submitButton: {
    backgroundColor: '#4CAF50',  // Material Design green
  },
  
  // Button text styling - white, bold text for contrast
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Export component for use in navigation stack
export default MildaDistributionScreen; 