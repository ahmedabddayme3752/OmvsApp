import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CollectScreen from './src/screens/CollectScreen';
import GpsPhotoScreen from './src/screens/GpsPhotoScreen';
import MildaDistributionScreen from './src/screens/MildaDistributionScreen';
import MedicineDistributionScreen from './src/screens/MedicineDistributionScreen';
import DataManagementScreen from './src/screens/DataManagementScreen';

const Stack = createStackNavigator();

/**
 * Main App Component
 * 
 * This is the root component of the OMVS mobile application.
 * It sets up the navigation structure and defines the flow between screens.
 * 
 * Navigation Flow:
 * 1. Splash -> Login -> Collect (main menu)
 * 2. From Collect: can go to GpsPhoto or DataManagement
 * 3. From GpsPhoto: can go to MildaDistribution or MedicineDistribution
 * 4. All screens can navigate back using the header back button
 * 
 * Features:
 * - Stack-based navigation with header
 * - Consistent header styling across all screens
 * - French language interface
 * - Proper screen titles and navigation options
 * 
 * @returns {JSX.Element} - The complete navigation structure wrapped in NavigationContainer
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#00BCD4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* 
          Splash Screen - Initial loading/branding screen
          - No header shown for clean branding experience
          - Typically shows logos and initializes app
        */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Collect" 
          component={CollectScreen}
          options={{ title: 'Gestion des collectes' }}
        />
        <Stack.Screen 
          name="GpsPhoto" 
          component={GpsPhotoScreen}
          options={{ title: 'Photo et coordonnées GPS' }}
        />
        <Stack.Screen 
          name="MildaDistribution" 
          component={MildaDistributionScreen}
          options={{ title: 'Distribution MILDA' }}
        />
        <Stack.Screen 
          name="MedicineDistribution" 
          component={MedicineDistributionScreen}
          options={{ title: 'Distribution Médicament' }}
        />
        <Stack.Screen 
          name="DataManagement" 
          component={DataManagementScreen}
          options={{ title: 'Gestion des données' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 