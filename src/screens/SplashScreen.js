import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
  const handlePress = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/omvs-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.description}>
          Cette application permet d'effectuer la collecte de données dans le cadre du projet d'enquête annuelle de suivi d'impact pour les années 2020 et 2021 du PGIRE dans le bassin du fleuve Sénégal
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>ACCÉDER</Text>
        </Pressable>
      </View>
      <Image
        source={require('../assets/rspop-logo.png')}
        style={styles.bottomLogo}
        resizeMode="contain"
      />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 5,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1976D2',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomLogo: {
    width: 150,
    height: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default SplashScreen; 