import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as base64Encode } from 'base-64';

/**
 * DatabaseService Class
 * 
 * This service handles all database operations for the OMVS app including:
 * - Local data storage using AsyncStorage (offline-first approach)
 * - Remote synchronization with CouchDB server
 * - Data management for distributions and GPS photos
 * - Network connectivity monitoring
 */
class DatabaseService {
  /**
   * Constructor - Initialize the database service
   * Sets up storage keys, remote URL, and initial state
   */
  constructor() {
    console.log('DatabaseService initialized with AsyncStorage');
    
    // Define storage keys for different data types in AsyncStorage
    this.DISTRIBUTIONS_KEY = 'omvs_distributions';  // Key for distribution data
    this.GPS_PHOTOS_KEY = 'omvs_gps_photos';        // Key for GPS/photo data
    this.SYNC_STATUS_KEY = 'omvs_sync_status';      // Key for sync status
    
    // Remote CouchDB server configuration
    // Using local IP address instead of localhost for Android emulator compatibility
    this.remoteURL = 'http://192.168.100.9:5984';
    
    // Track online/offline status
    this.isOnline = false;
    
    // Array to store sync event callbacks (for future extensibility)
    this.syncCallbacks = [];
  }

  /**
   * Create HTTP Basic Authentication header
   * 
   * @param {string} username - CouchDB username
   * @param {string} password - CouchDB password
   * @returns {string} - Base64 encoded authorization header
   * 
   * Purpose: Generate proper authentication header for CouchDB API calls
   */
  createAuthHeader(username, password) {
    // Encode credentials in base64 format for HTTP Basic Auth
    return 'Basic ' + base64Encode(`${username}:${password}`);
  }

  /**
   * Initialize database connection and check connectivity
   * 
   * @returns {Promise<void>}
   * 
   * Purpose: 
   * - Test connection to remote CouchDB server
   * - Set online/offline status
   * - Log connection details for debugging
   */
  async initialize() {
    try {
      console.log('Attempting to connect to:', this.remoteURL);
      
      // Test remote connection by fetching list of all databases
      const response = await fetch(`${this.remoteURL}/_all_dbs`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader('admin', 'password'),
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout to avoid hanging
      });
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        // Connection successful - parse and log available databases
        const databases = await response.json();
        console.log('Available databases:', databases);
        this.isOnline = true;
        console.log('Database connectivity: Online');
      } else {
        // Connection failed - set offline status
        this.isOnline = false;
        console.log('Database connectivity: Failed - Status', response.status);
      }
    } catch (error) {
      // Network error or timeout - set offline status
      this.isOnline = false;
      console.log('Database connectivity error:', error.message);
      console.log('Full error:', error);
    }
  }

  /**
   * Save GPS and Photo data to local storage
   * 
   * @param {Object} data - GPS and photo data object containing:
   *   - location: {latitude, longitude}
   *   - selectedLocation: {pays, region, moughataa, commune}
   *   - photo: photo URI or base64 string
   * @returns {Promise<Object>} - Success response with document ID
   * 
   * Purpose:
   * - Store GPS/photo data locally for offline access
   * - Generate unique document ID with timestamp
   * - Attempt remote sync if online
   */
  async saveGpsPhotoData(data) {
    try {
      // Create document with unique ID and metadata
      const doc = {
        _id: `gps_photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'gps_photo',                    // Document type identifier
        timestamp: new Date().toISOString(),  // ISO timestamp for sorting
        synced: false,                        // Track sync status
        ...data                               // Spread GPS/photo data
      };
      
      // Retrieve existing GPS photos from local storage
      const existingData = await this.getAllGpsPhotos();
      
      // Add new document to existing array
      const updatedData = [...existingData, doc];
      
      // Save updated array back to AsyncStorage
      await AsyncStorage.setItem(this.GPS_PHOTOS_KEY, JSON.stringify(updatedData));
      
      console.log('GPS Photo data saved locally:', doc._id);
      
      // Attempt to sync to remote server if online
      if (this.isOnline) {
        this.syncToRemote(doc, 'omvs_gps_photos');
      }
      
      // Return success response mimicking CouchDB format
      return { ok: true, id: doc._id, rev: '1-local' };
    } catch (error) {
      console.error('Error saving GPS Photo data:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Save distribution data (MILDA or Medicine) to local storage
   * 
   * @param {Object} data - Distribution form data containing:
   *   - chefMenage: household head name
   *   - nni: national ID number
   *   - contact: phone number
   *   - nombreMilda/quantite: quantity distributed
   *   - centreDistribution: distribution center
   *   - distributeur: distributor name
   *   - gpsPhotoData: associated GPS/photo data
   * @param {string} distributionType - Type of distribution ('milda' or 'medicine')
   * @returns {Promise<Object>} - Success response with document ID
   * 
   * Purpose:
   * - Store distribution data locally for offline access
   * - Link with GPS/photo data
   * - Attempt remote sync if online
   */
  async saveDistributionData(data, distributionType) {
    try {
      // Create document with unique ID based on distribution type
      const doc = {
        _id: `${distributionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: distributionType,               // 'milda' or 'medicine'
        timestamp: new Date().toISOString(),  // ISO timestamp
        synced: false,                        // Track sync status
        ...data                               // Spread form data
      };
      
      // Retrieve existing distributions from local storage
      const existingData = await this.getAllDistributions();
      
      // Add new document to existing array
      const updatedData = [...existingData, doc];
      
      // Save updated array back to AsyncStorage
      await AsyncStorage.setItem(this.DISTRIBUTIONS_KEY, JSON.stringify(updatedData));
      
      console.log('Distribution data saved locally:', doc._id);
      
      // Attempt to sync to remote server if online
      if (this.isOnline) {
        this.syncToRemote(doc, 'omvs_distributions');
      }
      
      // Return success response
      return { ok: true, id: doc._id, rev: '1-local' };
    } catch (error) {
      console.error('Error saving distribution data:', error);
      throw error;
    }
  }

  /**
   * Retrieve all distribution records from local storage
   * 
   * @returns {Promise<Array>} - Array of distribution documents
   * 
   * Purpose:
   * - Get all stored distributions for display in UI
   * - Handle cases where no data exists (return empty array)
   */
  async getAllDistributions() {
    try {
      // Retrieve data from AsyncStorage
      const data = await AsyncStorage.getItem(this.DISTRIBUTIONS_KEY);
      
      // Parse JSON or return empty array if no data
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting distributions:', error);
      return []; // Return empty array on error to prevent crashes
    }
  }

  /**
   * Retrieve all GPS photo records from local storage
   * 
   * @returns {Promise<Array>} - Array of GPS photo documents
   * 
   * Purpose:
   * - Get all stored GPS/photo data for display in UI
   * - Handle cases where no data exists
   */
  async getAllGpsPhotos() {
    try {
      // Retrieve data from AsyncStorage
      const data = await AsyncStorage.getItem(this.GPS_PHOTOS_KEY);
      
      // Parse JSON or return empty array if no data
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting GPS photos:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get distributions filtered by type
   * 
   * @param {string} type - Distribution type ('milda' or 'medicine')
   * @returns {Promise<Array>} - Filtered array of distributions
   * 
   * Purpose:
   * - Filter distributions by type for specific views
   * - Useful for generating reports or type-specific displays
   */
  async getDistributionsByType(type) {
    try {
      // Get all distributions first
      const allDistributions = await this.getAllDistributions();
      
      // Filter by the specified type
      return allDistributions.filter(doc => doc.type === type);
    } catch (error) {
      console.error('Error getting distributions by type:', error);
      return [];
    }
  }

  /**
   * Delete a document from local storage
   * 
   * @param {string} dbName - Database name ('distributions' or 'gps_photos')
   * @param {string} docId - Document ID to delete
   * @returns {Promise<Object>} - Success response
   * 
   * Purpose:
   * - Remove specific documents from local storage
   * - Support data management and cleanup operations
   */
  async deleteDocument(dbName, docId) {
    try {
      // Determine which storage key to use based on database name
      const key = dbName === 'distributions' ? this.DISTRIBUTIONS_KEY : this.GPS_PHOTOS_KEY;
      
      // Retrieve current data
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        // Parse data and filter out the document to delete
        const parsedData = JSON.parse(data);
        const filteredData = parsedData.filter(doc => doc._id !== docId);
        
        // Save filtered data back to storage
        await AsyncStorage.setItem(key, JSON.stringify(filteredData));
        console.log('Document deleted locally:', docId);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Synchronize a single document to remote CouchDB server
   * 
   * @param {Object} doc - Document to sync
   * @param {string} dbName - Remote database name
   * @returns {Promise<void>}
   * 
   * Purpose:
   * - Upload local documents to remote CouchDB
   * - Mark documents as synced on success
   * - Handle sync failures gracefully
   */
  async syncToRemote(doc, dbName) {
    try {
      // Send POST request to create document in remote database
      const response = await fetch(`${this.remoteURL}/${dbName}`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader('admin', 'password'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc), // Send document as JSON
      });

      if (response.ok) {
        // Mark document as synced on successful upload
        doc.synced = true;
        console.log('Document synced to remote:', doc._id);
      }
    } catch (error) {
      // Log sync failures but don't throw (allows offline operation)
      console.log('Sync failed for document:', doc._id, error.message);
    }
  }

  /**
   * Manually synchronize all unsynced documents to remote server
   * 
   * @returns {Promise<Object>} - Sync results with counts
   * 
   * Purpose:
   * - Batch sync all pending documents when user requests
   * - Provide feedback on sync progress and results
   * - Handle offline scenarios gracefully
   */
  async manualSync() {
    // Check connectivity first
    if (!this.isOnline) {
      await this.initialize(); // Re-check connectivity
      if (!this.isOnline) {
        throw new Error('Cannot sync while offline');
      }
    }

    try {
      let syncedCount = 0; // Track successful syncs
      
      // Sync all unsynced distributions
      const distributions = await this.getAllDistributions();
      const unsyncedDistributions = distributions.filter(doc => !doc.synced);
      
      // Sync each unsynced distribution
      for (const doc of unsyncedDistributions) {
        await this.syncToRemote(doc, 'omvs_distributions');
        if (doc.synced) syncedCount++;
      }
      
      // Sync all unsynced GPS photos
      const gpsPhotos = await this.getAllGpsPhotos();
      const unsyncedGpsPhotos = gpsPhotos.filter(doc => !doc.synced);
      
      // Sync each unsynced GPS photo
      for (const doc of unsyncedGpsPhotos) {
        await this.syncToRemote(doc, 'omvs_gps_photos');
        if (doc.synced) syncedCount++;
      }
      
      // Update local storage with new sync status
      await AsyncStorage.setItem(this.DISTRIBUTIONS_KEY, JSON.stringify(distributions));
      await AsyncStorage.setItem(this.GPS_PHOTOS_KEY, JSON.stringify(gpsPhotos));
      
      // Return sync results
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

  /**
   * Get current synchronization status
   * 
   * @returns {Object} - Sync status object
   * 
   * Purpose:
   * - Provide UI with current connectivity and sync state
   * - Help users understand when data will be synced
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,    // Network connectivity status
      syncActive: false           // We use manual sync, not continuous
    };
  }

  /**
   * Count unsynced documents for UI display
   * 
   * @returns {Promise<Object>} - Counts of unsynced documents by type
   * 
   * Purpose:
   * - Show users how many documents are pending sync
   * - Help prioritize sync operations
   */
  async getUnsyncedCount() {
    try {
      // Get all local data
      const distributions = await this.getAllDistributions();
      const gpsPhotos = await this.getAllGpsPhotos();
      
      // Count unsynced documents
      const unsyncedDistributions = distributions.filter(doc => !doc.synced).length;
      const unsyncedGpsPhotos = gpsPhotos.filter(doc => !doc.synced).length;
      
      return {
        distributions: unsyncedDistributions,
        gpsPhotos: unsyncedGpsPhotos,
        total: unsyncedDistributions + unsyncedGpsPhotos
      };
    } catch (error) {
      console.error('Error getting unsynced count:', error);
      // Return zeros on error to prevent UI crashes
      return { distributions: 0, gpsPhotos: 0, total: 0 };
    }
  }

  /**
   * Clear all local data (for testing and reset purposes)
   * 
   * @returns {Promise<void>}
   * 
   * Purpose:
   * - Reset app data during development/testing
   * - Provide clean slate for troubleshooting
   */
  async clearAllData() {
    try {
      // Remove all data from AsyncStorage
      await AsyncStorage.removeItem(this.DISTRIBUTIONS_KEY);
      await AsyncStorage.removeItem(this.GPS_PHOTOS_KEY);
      await AsyncStorage.removeItem(this.SYNC_STATUS_KEY);
      console.log('All local data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  /**
   * Add sync event listener (for future extensibility)
   * 
   * @param {Function} callback - Callback function to execute on sync events
   * 
   * Purpose:
   * - Allow UI components to listen for sync events
   * - Provide hooks for future real-time sync features
   */
  onSync(callback) {
    this.syncCallbacks.push(callback);
  }

  /**
   * Initialize remote databases (compatibility method)
   * 
   * @returns {Promise<void>}
   * 
   * Purpose:
   * - Provide consistent API with other database implementations
   * - Delegate to main initialize method
   */
  initRemoteDBs() {
    return this.initialize();
  }

  /**
   * Start continuous sync (compatibility method)
   * 
   * Purpose:
   * - Maintain API compatibility
   * - Log that continuous sync is not available (we use manual sync)
   */
  startSync() {
    console.log('Continuous sync not available - use manual sync');
  }

  /**
   * Stop continuous sync (compatibility method)
   * 
   * Purpose:
   * - Maintain API compatibility
   * - No-op since we don't have continuous sync
   */
  stopSync() {
    console.log('No continuous sync to stop');
  }
}

// Export singleton instance for use throughout the app
export default new DatabaseService(); 