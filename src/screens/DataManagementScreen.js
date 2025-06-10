import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import databaseService from '../services/DatabaseService';

const DataManagementScreen = ({ navigation }) => {
  const [distributions, setDistributions] = useState([]);
  const [gpsPhotos, setGpsPhotos] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ isOnline: false, syncActive: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
    updateSyncStatus();
    
    // Listen for sync events
    databaseService.onSync((dbName, event, data) => {
      console.log(`Sync event - DB: ${dbName}, Event: ${event}`, data);
      if (event === 'change') {
        loadData(); // Refresh data when sync changes occur
      }
    });
  }, []);

  const loadData = async () => {
    try {
      const [distributionsData, gpsPhotosData] = await Promise.all([
        databaseService.getAllDistributions(),
        databaseService.getAllGpsPhotos()
      ]);
      
      setDistributions(distributionsData);
      setGpsPhotos(gpsPhotosData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateSyncStatus = () => {
    const status = databaseService.getSyncStatus();
    setSyncStatus(status);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    updateSyncStatus();
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('Hors ligne', 'Impossible de synchroniser sans connexion internet');
      return;
    }

    setSyncing(true);
    try {
      await databaseService.manualSync();
      Alert.alert('Succès', 'Synchronisation terminée avec succès!');
      loadData();
    } catch (error) {
      console.error('Manual sync error:', error);
      Alert.alert('Erreur', 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const connectToServer = () => {
    Alert.alert(
      'Connexion au serveur',
      'Voulez-vous vous connecter au serveur CouchDB pour la synchronisation?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Connecter',
          onPress: () => {
            databaseService.initRemoteDBs();
            setTimeout(() => {
              updateSyncStatus();
              Alert.alert('Info', 'Tentative de connexion au serveur...');
            }, 1000);
          }
        }
      ]
    );
  };

  const renderDistributionItem = (item, index) => (
    <View key={item._id} style={styles.dataItem}>
      <Text style={styles.itemTitle}>
        {item.type === 'milda' ? 'MILDA' : 'Médicament'} - {item.chefMenage || 'N/A'}
      </Text>
      <Text style={styles.itemDetail}>NNI: {item.nni || 'N/A'}</Text>
      <Text style={styles.itemDetail}>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
      <Text style={styles.itemDetail}>
        Quantité: {item.nombreMilda || item.quantite || 'N/A'}
      </Text>
    </View>
  );

  const renderGpsPhotoItem = (item, index) => (
    <View key={item._id} style={styles.dataItem}>
      <Text style={styles.itemTitle}>GPS/Photo Data</Text>
      <Text style={styles.itemDetail}>
        Coordonnées: {item.location?.latitude}, {item.location?.longitude}
      </Text>
      <Text style={styles.itemDetail}>
        Lieu: {item.selectedLocation?.commune}, {item.selectedLocation?.moughataa}
      </Text>
      <Text style={styles.itemDetail}>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Sync Status */}
        <View style={styles.syncStatusContainer}>
          <Text style={styles.sectionTitle}>État de synchronisation</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Statut:</Text>
            <Text style={[
              styles.statusValue,
              { color: syncStatus.isOnline ? '#4CAF50' : '#F44336' }
            ]}>
              {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Sync active:</Text>
            <Text style={[
              styles.statusValue,
              { color: syncStatus.syncActive ? '#4CAF50' : '#FF9800' }
            ]}>
              {syncStatus.syncActive ? 'Oui' : 'Non'}
            </Text>
          </View>
        </View>

        {/* Sync Controls */}
        <View style={styles.syncControls}>
          {!syncStatus.isOnline && (
            <TouchableOpacity style={styles.connectButton} onPress={connectToServer}>
              <Text style={styles.buttonText}>SE CONNECTER AU SERVEUR</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.syncButton, syncing && styles.buttonDisabled]} 
            onPress={handleManualSync}
            disabled={syncing || !syncStatus.isOnline}
          >
            <Text style={styles.buttonText}>
              {syncing ? 'SYNCHRONISATION...' : 'SYNCHRONISER MAINTENANT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Résumé des données</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distributions:</Text>
            <Text style={styles.summaryValue}>{distributions.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GPS/Photos:</Text>
            <Text style={styles.summaryValue}>{gpsPhotos.length}</Text>
          </View>
        </View>

        {/* Distributions */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Distributions ({distributions.length})</Text>
          {distributions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune distribution enregistrée</Text>
          ) : (
            distributions.map(renderDistributionItem)
          )}
        </View>

        {/* GPS Photos */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>GPS/Photos ({gpsPhotos.length})</Text>
          {gpsPhotos.length === 0 ? (
            <Text style={styles.emptyText}>Aucune donnée GPS/Photo enregistrée</Text>
          ) : (
            gpsPhotos.map(renderGpsPhotoItem)
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncStatusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncControls: {
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dataSection: {
    marginBottom: 20,
  },
  dataItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default DataManagementScreen; 