import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

/**
 * LoginScreen Component
 * 
 * This is the authentication screen where users enter their credentials
 * to access the OMVS data collection application.
 * 
 * Features:
 * - Username and password input fields
 * - OMVS and RSPOP logo display
 * - Navigation to main collection screen after login
 * - Responsive design with proper styling
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @returns {JSX.Element} - Rendered login screen component
 */
const LoginScreen = ({ navigation }) => {
  // State management for form inputs
  const [username, setUsername] = useState(''); // Store username input
  const [password, setPassword] = useState(''); // Store password input

  /**
   * Handle user login attempt
   * 
   * Purpose:
   * - Process login credentials (currently bypassed for demo)
   * - Navigate to main collection screen on successful login
   * - Could be extended to include actual authentication logic
   * 
   * TODO: Implement actual authentication with backend service
   * TODO: Add form validation for username/password
   * TODO: Add loading state during authentication
   * TODO: Add error handling for failed login attempts
   */
  const handleLogin = () => {
    // TODO: Implement actual login logic
    // This could include:
    // - Validating input fields are not empty
    // - Sending credentials to authentication server
    // - Storing authentication token
    // - Handling login errors
    
    // For now, directly navigate to collection screen
    navigation.navigate('Collect');
  };

  // Render the login screen UI
  return (
    <SafeAreaView style={styles.container}>
      {/* Main content area */}
      <View style={styles.content}>
        {/* OMVS Logo - Main organization branding */}
        <Image
          source={require('../assets/omvs-logo.png')} // OMVS organization logo
          style={styles.logo}
          resizeMode="contain" // Maintain aspect ratio
        />
        
        {/* Input form container */}
        <View style={styles.inputContainer}>
          {/* Username input field */}
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur" // French: "Username"
            value={username}
            onChangeText={setUsername} // Update state on text change
            autoCapitalize="none" // Prevent auto-capitalization for usernames
          />
          
          {/* Password input field */}
          <TextInput
            style={styles.input}
            placeholder="Mot de passe" // French: "Password"
            value={password}
            onChangeText={setPassword} // Update state on text change
            secureTextEntry // Hide password characters for security
          />
          
          {/* Login button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin} // Trigger login when pressed
          >
            <Text style={styles.buttonText}>SE CONNECTER</Text> {/* French: "LOGIN" */}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* RSPOP Logo - Partner organization branding at bottom */}
      <Image
        source={require('../assets/rspop-logo.png')} // RSPOP partner logo
        style={styles.bottomLogo}
        resizeMode="contain" // Maintain aspect ratio
      />
    </SafeAreaView>
  );
};

/**
 * StyleSheet for LoginScreen component
 * 
 * Defines all visual styling for the login screen including:
 * - Layout and positioning
 * - Colors and typography
 * - Input field styling
 * - Button appearance
 * - Logo sizing and placement
 */
const styles = StyleSheet.create({
  // Main container - full screen with white background
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Content area - centers content vertically and adds padding
  content: {
    flex: 1, // Take up available space
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 20, // Side padding
    paddingTop: 40, // Top padding for status bar
  },
  
  // Main OMVS logo styling
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40, // Space below logo
  },
  
  // Container for input fields - full width with padding
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  
  // Input field styling - consistent appearance for username/password
  input: {
    backgroundColor: '#fff', // White background
    borderRadius: 5, // Rounded corners
    padding: 15, // Internal padding
    marginBottom: 15, // Space between inputs
    borderWidth: 1, // Border thickness
    borderColor: '#ddd', // Light gray border
  },
  
  // Login button styling - blue background with rounded corners
  button: {
    backgroundColor: '#2196F3', // Material Design blue
    padding: 15, // Internal padding
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center text horizontally
    marginTop: 10, // Space above button
  },
  
  // Button text styling - white text, bold font
  buttonText: {
    color: '#fff', // White text
    fontSize: 16, // Medium font size
    fontWeight: 'bold', // Bold text
  },
  
  // Bottom logo (RSPOP) styling - smaller size at bottom
  bottomLogo: {
    width: 150,
    height: 50,
    alignSelf: 'center', // Center horizontally
    marginBottom: 20, // Space from bottom edge
  },
});

// Export component for use in navigation stack
export default LoginScreen; 