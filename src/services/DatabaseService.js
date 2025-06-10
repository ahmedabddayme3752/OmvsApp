import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as base64Encode } from 'base-64';

class DatabaseService {
  constructor() {
    console.log('DatabaseService initialized with AsyncStorage');
    
    // Storage keys
    this.DISTRIBUTIONS_KEY = 'omvs_distributions';
    this.GPS_PHOTOS_KEY = 'omvs_gps_photos';
    this.SYNC_STATUS_KEY = 'omvs_sync_status';
    
    // Remote database URL - Use local IP instead of localhost for Android emulator
    this.remoteURL = 'http://192.168.100.9:5984';
    this.isOnline = false;
    this.syncCallbacks = [];
  }

  // Base64 encode function for React Native
  createAuthHeader(username, password) {
    return 'Basic ' + base64Encode(`${username}:${password}`);
  }

  // Initialize and check connectivity
  async initialize() {
    try {
      console.log('Attempting to connect to:', this.remoteURL);
      
      // Test remote connection
      const response = await fetch(`${this.remoteURL}/_all_dbs`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader('admin', 'password'),
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const databases = await response.json();
        console.log('Available databases:', databases);
        this.isOnline = true;
        console.log('Database connectivity: Online');
      } else {
        this.isOnline = false;
        console.log('Database connectivity: Failed - Status', response.status);
      }
    } catch (error) {
      this.isOnline = false;
      console.log('Database connectivity error:', error.message);
      console.log('Full error:', error);
    }
  }

  // Save GPS Photo data
  async saveGpsPhotoData(data) {
    try {
      const doc = {
        _id: `gps_photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'gps_photo',
        timestamp: new Date().toISOString(),
        synced: false,
        ...data
      };
      
      // Get existing data
      const existingData = await this.getAllGpsPhotos();
      const updatedData = [...existingData, doc];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(this.GPS_PHOTOS_KEY, JSON.stringify(updatedData));
      
      console.log('GPS Photo data saved locally:', doc._id);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncToRemote(doc, 'omvs_gps_photos');
      }
      
      return { ok: true, id: doc._id, rev: '1-local' };
    } catch (error) {
      console.error('Error saving GPS Photo data:', error);
      throw error;
    }
  }

  // Save distribution data
  async saveDistributionData(data, distributionType) {
    try {
      const doc = {
        _id: `${distributionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: distributionType,
        timestamp: new Date().toISOString(),
        synced: false,
        ...data
      };
      
      // Get existing data
      const existingData = await this.getAllDistributions();
      const updatedData = [...existingData, doc];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(this.DISTRIBUTIONS_KEY, JSON.stringify(updatedData));
      
      console.log('Distribution data saved locally:', doc._id);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncToRemote(doc, 'omvs_distributions');
      }
      
      return { ok: true, id: doc._id, rev: '1-local' };
    } catch (error) {
      console.error('Error saving distribution data:', error);
      throw error;
    }
  }

  // Get all distributions
  async getAllDistributions() {
    try {
      const data = await AsyncStorage.getItem(this.DISTRIBUTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting distributions:', error);
      return [];
    }
  }

  // Get all GPS photos
  async getAllGpsPhotos() {
    try {
      const data = await AsyncStorage.getItem(this.GPS_PHOTOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting GPS photos:', error);
      return [];
    }
  }

  // Get distributions by type
  async getDistributionsByType(type) {
    try {
      const allDistributions = await this.getAllDistributions();
      return allDistributions.filter(doc => doc.type === type);
    } catch (error) {
      console.error('Error getting distributions by type:', error);
      return [];
    }
  }

  // Delete a document
  async deleteDocument(dbName, docId) {
    try {
      const key = dbName === 'distributions' ? this.DISTRIBUTIONS_KEY : this.GPS_PHOTOS_KEY;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const parsedData = JSON.parse(data);
        const filteredData = parsedData.filter(doc => doc._id !== docId);
        await AsyncStorage.setItem(key, JSON.stringify(filteredData));
        console.log('Document deleted locally:', docId);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Sync single document to remote
  async syncToRemote(doc, dbName) {
    try {
      const response = await fetch(`${this.remoteURL}/${dbName}`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader('admin', 'password'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc),
      });

      if (response.ok) {
        // Mark as synced
        doc.synced = true;
        console.log('Document synced to remote:', doc._id);
      }
    } catch (error) {
      console.log('Sync failed for document:', doc._id, error.message);
    }
  }

  // Manual sync all unsynced documents
  async manualSync() {
    if (!this.isOnline) {
      await this.initialize(); // Check connectivity
      if (!this.isOnline) {
        throw new Error('Cannot sync while offline');
      }
    }

    try {
      let syncedCount = 0;
      
      // Sync distributions
      const distributions = await this.getAllDistributions();
      const unsyncedDistributions = distributions.filter(doc => !doc.synced);
      
      for (const doc of unsyncedDistributions) {
        await this.syncToRemote(doc, 'omvs_distributions');
        if (doc.synced) syncedCount++;
      }
      
      // Sync GPS photos
      const gpsPhotos = await this.getAllGpsPhotos();
      const unsyncedGpsPhotos = gpsPhotos.filter(doc => !doc.synced);
      
      for (const doc of unsyncedGpsPhotos) {
        await this.syncToRemote(doc, 'omvs_gps_photos');
        if (doc.synced) syncedCount++;
      }
      
      // Update local storage with sync status
      await AsyncStorage.setItem(this.DISTRIBUTIONS_KEY, JSON.stringify(distributions));
      await AsyncStorage.setItem(this.GPS_PHOTOS_KEY, JSON.stringify(gpsPhotos));
      
      return {
        success: true,
        syncedCount,
        totalUnsynced: unsyncedDistributions.length + unsyncedGpsPhotos.length
      };
    } catch (error) {
      console.error('Manual sync error:', error);
      throw error;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncActive: false // We don't have continuous sync, only manual
    };
  }

  // Get unsynced count
  async getUnsyncedCount() {
    try {
      const distributions = await this.getAllDistributions();
      const gpsPhotos = await this.getAllGpsPhotos();
      
      const unsyncedDistributions = distributions.filter(doc => !doc.synced).length;
      const unsyncedGpsPhotos = gpsPhotos.filter(doc => !doc.synced).length;
      
      return {
        distributions: unsyncedDistributions,
        gpsPhotos: unsyncedGpsPhotos,
        total: unsyncedDistributions + unsyncedGpsPhotos
      };
    } catch (error) {
      console.error('Error getting unsynced count:', error);
      return { distributions: 0, gpsPhotos: 0, total: 0 };
    }
  }

  // Clear all local data (for testing)
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(this.DISTRIBUTIONS_KEY);
      await AsyncStorage.removeItem(this.GPS_PHOTOS_KEY);
      await AsyncStorage.removeItem(this.SYNC_STATUS_KEY);
      console.log('All local data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Add sync event listener (for compatibility)
  onSync(callback) {
    this.syncCallbacks.push(callback);
  }

  // Initialize remote databases (for compatibility)
  initRemoteDBs() {
    return this.initialize();
  }

  // Start sync (for compatibility - we use manual sync)
  startSync() {
    console.log('Continuous sync not available - use manual sync');
  }

  // Stop sync (for compatibility)
  stopSync() {
    console.log('No continuous sync to stop');
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService; 