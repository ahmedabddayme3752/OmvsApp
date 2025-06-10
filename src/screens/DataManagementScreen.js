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

/**
 * DataManagementScreen Component
 * 
 * This screen provides a comprehensive view of all collected data and synchronization status.
 * It serves as the main data management interface for the OMVS application.
 * 
 * Key Features:
 * - Display all distributions and GPS/photo data
 * - Show real-time synchronization status
 * - Manual synchronization controls
 * - Server connection management
 * - Data summary and statistics
 * - Pull-to-refresh functionality
 * - Loading states and error handling
 * 
 * Data Display:
 * - Lists all MILDA and medicine distributions
 * - Shows GPS/photo data with location details
 * - Provides data counts and summaries
 * - Indicates sync status for each record
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @returns {JSX.Element} - Rendered data management screen
 */
const DataManagementScreen = ({ navigation }) => {
  // State for storing distribution records
  const [distributions, setDistributions] = useState([]);
  
  // State for storing GPS/photo records
  const [gpsPhotos, setGpsPhotos] = useState([]);
  
  // State for synchronization status tracking
  const [syncStatus, setSyncStatus] = useState({ isOnline: false, syncActive: false });
  
  // State for initial loading indicator
  const [loading, setLoading] = useState(true);
  
  // State for pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);
  
  // State for manual sync operation indicator
  const [syncing, setSyncing] = useState(false);

  /**
   * Component initialization effect
   * 
   * Runs when component mounts to:
   * - Load all data from local storage
   * - Update synchronization status
   * - Set up sync event listeners
   */
  useEffect(() => {
    loadData();
    updateSyncStatus();
    
    // Listen for sync events from database service
    // This allows real-time updates when sync operations occur
    databaseService.onSync((dbName, event, data) => {
      console.log(`Sync event - DB: ${dbName}, Event: ${event}`, data);
      if (event === 'change') {
        loadData(); // Refresh data when sync changes occur
      }
    });
  }, []);

  /**
   * Load all data from local storage
   * 
   * Purpose:
   * - Fetch all distributions and GPS/photo data
   * - Update component state with loaded data
   * - Handle loading errors gracefully
   * - Manage loading and refreshing states
   * 
   * Uses Promise.all for concurrent data loading to improve performance
   */
  const loadData = async () => {
    try {
      // Load both data types concurrently for better performance
      const [distributionsData, gpsPhotosData] = await Promise.all([
        databaseService.getAllDistributions(),
        databaseService.getAllGpsPhotos()
      ]);
      
      // Update state with loaded data
      setDistributions(distributionsData);
      setGpsPhotos(gpsPhotosData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des données'); // French: "Error", "Error loading data"
    } finally {
      // Always clear loading states regardless of success/failure
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Update synchronization status from database service
   * 
   * Purpose:
   * - Get current online/offline status
   * - Check if sync is currently active
   * - Update UI to reflect current sync state
   */
  const updateSyncStatus = () => {
    const status = databaseService.getSyncStatus();
    setSyncStatus(status);
  };

  /**
   * Handle pull-to-refresh action
   * 
   * Purpose:
   * - Refresh all data when user pulls down
   * - Update sync status
   * - Provide visual feedback during refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    updateSyncStatus();
  };

  /**
   * Handle manual synchronization request
   * 
   * Purpose:
   * - Trigger manual sync of all unsynced data
   * - Provide user feedback during sync process
   * - Handle sync errors gracefully
   * - Refresh data after successful sync
   * 
   * Preconditions:
   * - Requires online connectivity
   * - Prevents multiple concurrent sync operations
   */
  const handleManualSync = async () => {
    // Check if device is online before attempting sync
    if (!syncStatus.isOnline) {
      Alert.alert('Hors ligne', 'Impossible de synchroniser sans connexion internet'); // French: "Offline", "Cannot sync without internet connection"
      return;
    }

    setSyncing(true); // Show sync in progress
    try {
      // Perform manual synchronization
      await databaseService.manualSync();
      Alert.alert('Succès', 'Synchronisation terminée avec succès!'); // French: "Success", "Synchronization completed successfully!"
      loadData(); // Refresh data to show sync results
    } catch (error) {
      console.error('Manual sync error:', error);
      Alert.alert('Erreur', 'Erreur lors de la synchronisation'); // French: "Error", "Error during synchronization"
    } finally {
      setSyncing(false); // Hide sync indicator
    }
  };

  /**
   * Handle server connection request
   * 
   * Purpose:
   * - Allow user to manually connect to CouchDB server
   * - Show confirmation dialog before connection attempt
   * - Update sync status after connection attempt
   * - Provide user feedback about connection process
   */
  const connectToServer = () => {
    Alert.alert(
      'Connexion au serveur', // French: "Server Connection"
      'Voulez-vous vous connecter au serveur CouchDB pour la synchronisation?', // French: "Do you want to connect to CouchDB server for synchronization?"
      [
        {
          text: 'Annuler', // French: "Cancel"
          style: 'cancel'
        },
        {
          text: 'Connecter', // French: "Connect"
          onPress: () => {
            // Initialize remote database connection
            databaseService.initRemoteDBs();
            
            // Update sync status after connection attempt
            setTimeout(() => {
              updateSyncStatus();
              Alert.alert('Info', 'Tentative de connexion au serveur...'); // French: "Info", "Attempting to connect to server..."
            }, 1000);
          }
        }
      ]
    );
  };

  /**
   * Render a distribution data item
   * 
   * @param {Object} item - Distribution record object
   * @param {number} index - Array index (for React key)
   * @returns {JSX.Element} - Rendered distribution item
   * 
   * Purpose:
   * - Display distribution details in a formatted card
   * - Show type (MILDA or Medicine), beneficiary, and key details
   * - Provide consistent formatting for all distribution records
   */
  const renderDistributionItem = (item, index) => (
    <View key={item._id} style={styles.dataItem}>
      {/* Distribution type and beneficiary name */}
      <Text style={styles.itemTitle}>
        {item.type === 'milda' ? 'MILDA' : 'Médicament'} - {item.chefMenage || 'N/A'}
      </Text>
      
      {/* National ID number */}
      <Text style={styles.itemDetail}>NNI: {item.nni || 'N/A'}</Text>
      
      {/* Distribution date */}
      <Text style={styles.itemDetail}>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
      
      {/* Quantity distributed */}
      <Text style={styles.itemDetail}>
        Quantité: {item.nombreMilda || item.quantite || 'N/A'}
      </Text>
    </View>
  );

  /**
   * Render a GPS/photo data item
   * 
   * @param {Object} item - GPS/photo record object
   * @param {number} index - Array index (for React key)
   * @returns {JSX.Element} - Rendered GPS/photo item
   * 
   * Purpose:
   * - Display GPS coordinates and location details
   * - Show administrative location (commune, moughataa)
   * - Provide consistent formatting for all GPS/photo records
   */
  const renderGpsPhotoItem = (item, index) => (
    <View key={item._id} style={styles.dataItem}>
      {/* Item type header */}
      <Text style={styles.itemTitle}>GPS/Photo Data</Text>
      
      {/* GPS coordinates */}
      <Text style={styles.itemDetail}>
        Coordonnées: {item.location?.latitude}, {item.location?.longitude}
      </Text>
      
      {/* Administrative location */}
      <Text style={styles.itemDetail}>
        Lieu: {item.selectedLocation?.commune}, {item.selectedLocation?.moughataa}
      </Text>
      
      {/* Capture date */}
      <Text style={styles.itemDetail}>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
    </View>
  );

  // Show loading screen while initial data is being loaded
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Chargement des données...</Text> {/* French: "Loading data..." */}
      </View>
    );
  }

  // Render the main data management interface
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Synchronization Status Section */}
        <View style={styles.syncStatusContainer}>
          <Text style={styles.sectionTitle}>État de synchronisation</Text> {/* French: "Synchronization Status" */}
          
          {/* Online/Offline Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Statut:</Text> {/* French: "Status:" */}
            <Text style={[
              styles.statusValue,
              { color: syncStatus.isOnline ? '#4CAF50' : '#F44336' } // Green for online, red for offline
            ]}>
              {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'} {/* French: "Online" or "Offline" */}
            </Text>
          </View>
          
          {/* Sync Active Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Sync active:</Text> {/* French: "Active sync:" */}
            <Text style={[
              styles.statusValue,
              { color: syncStatus.syncActive ? '#4CAF50' : '#FF9800' } // Green for active, orange for inactive
            ]}>
              {syncStatus.syncActive ? 'Oui' : 'Non'} {/* French: "Yes" or "No" */}
            </Text>
          </View>
        </View>

        {/* Synchronization Controls Section */}
        <View style={styles.syncControls}>
          {/* Show connect button only when offline */}
          {!syncStatus.isOnline && (
            <TouchableOpacity style={styles.connectButton} onPress={connectToServer}>
              <Text style={styles.buttonText}>SE CONNECTER AU SERVEUR</Text> {/* French: "CONNECT TO SERVER" */}
            </TouchableOpacity>
          )}
          
          {/* Manual sync button - disabled when offline or already syncing */}
          <TouchableOpacity 
            style={[styles.syncButton, syncing && styles.buttonDisabled]} 
            onPress={handleManualSync}
            disabled={syncing || !syncStatus.isOnline}
          >
            <Text style={styles.buttonText}>
              {syncing ? 'SYNCHRONISATION...' : 'SYNCHRONISER MAINTENANT'} {/* French: "SYNCHRONIZING..." or "SYNC NOW" */}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Summary Section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Résumé des données</Text> {/* French: "Data Summary" */}
          
          {/* Distribution count */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distributions:</Text>
            <Text style={styles.summaryValue}>{distributions.length}</Text>
          </View>
          
          {/* GPS/Photo count */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GPS/Photos:</Text>
            <Text style={styles.summaryValue}>{gpsPhotos.length}</Text>
          </View>
        </View>

        {/* Distributions Data Section */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Distributions ({distributions.length})</Text>
          {distributions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune distribution enregistrée</Text> // French: "No distributions recorded"
          ) : (
            distributions.map(renderDistributionItem)
          )}
        </View>

        {/* GPS/Photos Data Section */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>GPS/Photos ({gpsPhotos.length})</Text>
          {gpsPhotos.length === 0 ? (
            <Text style={styles.emptyText}>Aucune donnée GPS/Photo enregistrée</Text> // French: "No GPS/Photo data recorded"
          ) : (
            gpsPhotos.map(renderGpsPhotoItem)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

/**
 * StyleSheet for DataManagementScreen component
 * 
 * Defines visual styling for all UI elements including:
 * - Layout and spacing
 * - Status indicators with color coding
 * - Button styles and states
 * - Data item cards
 * - Loading and empty states
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
  
  // Loading screen container - centered content
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Sync status container - light gray background
  syncStatusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  
  // Section title styling - bold, larger text
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  
  // Status row - label and value side by side
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  
  // Status label styling - gray text
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  // Status value styling - bold text with dynamic color
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Sync controls container
  syncControls: {
    marginBottom: 20,
  },
  
  // Connect button - orange background for attention
  connectButton: {
    backgroundColor: '#FF9800', // Orange color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  // Sync button - blue background
  syncButton: {
    backgroundColor: '#2196F3', // Material Design blue
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  
  // Disabled button state - gray color
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  
  // Button text styling - white, bold text
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Summary container - light blue background
  summaryContainer: {
    backgroundColor: '#e3f2fd', // Light blue background
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  
  // Summary row - label and value side by side
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  
  // Summary label styling
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  // Summary value styling - blue color to match theme
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  
  // Data section container
  dataSection: {
    marginBottom: 20,
  },
  
  // Individual data item card styling
  dataItem: {
    backgroundColor: '#f9f9f9', // Light gray background
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4, // Blue left border for visual accent
    borderLeftColor: '#2196F3',
  },
  
  // Data item title - bold, larger text
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  
  // Data item detail text - smaller, gray text
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  // Empty state text - centered, italic, gray
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});

// Export component for use in navigation stack
export default DataManagementScreen; 