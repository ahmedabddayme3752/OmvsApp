import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>ACCÉDER</Text>
        </TouchableOpacity>
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
    paddingVertical: 12,
    borderRadius: 5,
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