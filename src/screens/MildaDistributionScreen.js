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

const MildaDistributionScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    chefMenage: '',
    nni: '',
    contact: '',
    nombreMilda: '',
    centreDistribution: '',
    distributeur: '',
    date: new Date().toLocaleDateString(),
    photo: null,
  });

  // Get GPS photo data from previous screen
  const gpsPhotoData = route?.params?.gpsPhotoData;

  useEffect(() => {
    if (gpsPhotoData) {
      console.log('Received GPS Photo data:', gpsPhotoData);
    }
  }, [gpsPhotoData]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const takePhoto = () => {
    ImagePicker.launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.assets && response.assets[0]) {
        handleInputChange('photo', response.assets[0].uri);
      }
    });
  };

  const handleSubmit = async () => {
    try {
      // Combine form data with GPS photo data
      const completeData = {
        ...formData,
        gpsPhotoData: gpsPhotoData,
        submittedAt: new Date().toISOString()
      };

      // Save to PouchDB
      await databaseService.saveDistributionData(completeData, 'milda');
      
      Alert.alert(
        'Succès', 
        'Distribution MILDA sauvegardée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Collect')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving MILDA distribution:', error);
      Alert.alert(
        'Erreur', 
        'Erreur lors de la sauvegarde. Les données seront sauvegardées localement.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Collect')
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Chef de ménage"
          value={formData.chefMenage}
          onChangeText={(value) => handleInputChange('chefMenage', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="NNI"
          value={formData.nni}
          onChangeText={(value) => handleInputChange('nni', value)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Contact"
          value={formData.contact}
          onChangeText={(value) => handleInputChange('contact', value)}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Nombre des MILDA requis"
          value={formData.nombreMilda}
          onChangeText={(value) => handleInputChange('nombreMilda', value)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Centre de distribution"
          value={formData.centreDistribution}
          onChangeText={(value) => handleInputChange('centreDistribution', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Nom du distributeur"
          value={formData.distributeur}
          onChangeText={(value) => handleInputChange('distributeur', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Date"
          value={formData.date}
          editable={false}
        />

        <TouchableOpacity
          style={styles.photoButton}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>PRENDRE PHOTO</Text>
        </TouchableOpacity>

        {formData.photo && (
          <Image
            source={{ uri: formData.photo }}
            style={styles.photoPreview}
          />
        )}

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>SAUVEGARDER</Text>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 20,
  },
});

export default MildaDistributionScreen; 