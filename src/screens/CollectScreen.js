import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';

const CollectScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('GpsPhoto', { nextScreen: 'MildaDistribution' })}
        >
          <Text style={styles.buttonText}>DISTRIBUTION MILDA</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('GpsPhoto', { nextScreen: 'MedicineDistribution' })}
        >
          <Text style={styles.buttonText}>DISTRIBUTION MÉDICAMENT</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.dataButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('DataManagement')}
        >
          <Text style={styles.buttonText}>GESTION DES DONNÉES</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1976D2',
    transform: [{ scale: 0.98 }],
  },
  dataButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CollectScreen; 