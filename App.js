import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRegistry } from 'react-native';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CollectScreen from './src/screens/CollectScreen';
import GpsPhotoScreen from './src/screens/GpsPhotoScreen';
import MildaDistributionScreen from './src/screens/MildaDistributionScreen';
import MedicineDistributionScreen from './src/screens/MedicineDistributionScreen';

const Stack = createStackNavigator();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Register the main component
AppRegistry.registerComponent('main', () => App); 