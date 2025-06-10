import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

/**
 * CollectScreen Component
 * 
 * This is the main dashboard/menu screen of the OMVS application.
 * It serves as the central hub where users can choose what type of data to collect
 * or manage existing data.
 * 
 * Features:
 * - Three main action buttons for different operations
 * - Navigation to GPS/Photo screen with context for distribution type
 * - Direct navigation to data management screen
 * - Clean, centered layout with consistent styling
 * 
 * Navigation Flow:
 * - MILDA Distribution -> GpsPhoto (with MILDA context) -> MildaDistributionScreen
 * - Medicine Distribution -> GpsPhoto (with Medicine context) -> MedicineDistributionScreen  
 * - Data Management -> DataManagementScreen (direct)
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @returns {JSX.Element} - Rendered main menu screen
 */
const CollectScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 
          MILDA Distribution Button
          - Navigates to GPS/Photo screen with MILDA context
          - The nextScreen parameter tells GpsPhotoScreen where to go after GPS/photo capture
          - This creates a flow: Collect -> GpsPhoto -> MildaDistribution
        */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GpsPhoto', { nextScreen: 'MildaDistribution' })}
        >
          <Text style={styles.buttonText}>DISTRIBUTION MILDA</Text> {/* French: "MILDA DISTRIBUTION" */}
        </TouchableOpacity>

        {/* 
          Medicine Distribution Button
          - Navigates to GPS/Photo screen with Medicine context
          - Similar flow to MILDA but leads to medicine distribution form
          - Flow: Collect -> GpsPhoto -> MedicineDistribution
        */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GpsPhoto', { nextScreen: 'MedicineDistribution' })}
        >
          <Text style={styles.buttonText}>DISTRIBUTION MÉDICAMENT</Text> {/* French: "MEDICINE DISTRIBUTION" */}
        </TouchableOpacity>

        {/* 
          Data Management Button
          - Direct navigation to data management screen
          - Different styling (green color) to distinguish from collection buttons
          - Allows users to view collected data and manage synchronization
        */}
        <TouchableOpacity
          style={[styles.button, styles.dataButton]} // Combine base button style with green color
          onPress={() => navigation.navigate('DataManagement')}
        >
          <Text style={styles.buttonText}>GESTION DES DONNÉES</Text> {/* French: "DATA MANAGEMENT" */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * StyleSheet for CollectScreen component
 * 
 * Defines the visual appearance of the main menu screen:
 * - Centered layout with equal spacing between buttons
 * - Consistent button styling with different colors for different functions
 * - Responsive design that works on different screen sizes
 */
const styles = StyleSheet.create({
  // Main container - full screen with white background
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Content area - centers buttons vertically and adds padding
  content: {
    flex: 1, // Take up all available space
    padding: 20, // Padding around content
    justifyContent: 'center', // Center buttons vertically
    gap: 20, // Equal spacing between buttons (React Native 0.71+)
  },
  
  // Base button styling - blue background with rounded corners
  button: {
    backgroundColor: '#2196F3', // Material Design blue
    padding: 20, // Internal padding for touch area
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center text horizontally
  },
  
  // Data management button override - green color to distinguish function
  dataButton: {
    backgroundColor: '#4CAF50', // Material Design green
  },
  
  // Button text styling - white, bold text
  buttonText: {
    color: '#fff', // White text for contrast
    fontSize: 16, // Medium font size
    fontWeight: 'bold', // Bold text for emphasis
  },
});

// Export component for use in navigation stack
export default CollectScreen; 