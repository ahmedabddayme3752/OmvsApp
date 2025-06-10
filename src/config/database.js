// Database Configuration
export const DATABASE_CONFIG = {
  // Replace with your actual CouchDB server URL
  REMOTE_URL: 'http://your-couchdb-server.com:5984',
  
  // Database names
  DATABASES: {
    DISTRIBUTIONS: 'distributions',
    GPS_PHOTOS: 'gps_photos'
  },
  
  // Sync options
  SYNC_OPTIONS: {
    live: true,
    retry: true,
    continuous: true
  },
  
  // Connection timeout
  TIMEOUT: 10000,
  
  // Retry attempts
  MAX_RETRIES: 3
};

// Development/Testing configuration
export const DEV_CONFIG = {
  REMOTE_URL: 'http://localhost:5984',
  DATABASES: {
    DISTRIBUTIONS: 'omvs_distributions_dev',
    GPS_PHOTOS: 'omvs_gps_photos_dev'
  }
};

// Production configuration
export const PROD_CONFIG = {
  REMOTE_URL: 'https://your-production-couchdb.com:5984',
  DATABASES: {
    DISTRIBUTIONS: 'omvs_distributions',
    GPS_PHOTOS: 'omvs_gps_photos'
  }
};

// Get configuration based on environment
export const getConfig = () => {
  // You can set this based on your build environment
  const isDevelopment = __DEV__;
  
  return isDevelopment ? DEV_CONFIG : PROD_CONFIG;
}; 