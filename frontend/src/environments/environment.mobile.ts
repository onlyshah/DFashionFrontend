export const environment = {
  production: false,
  // For Android Emulator: 10.0.2.2 maps to host machine
  // For physical device: use your computer's IP address
  apiUrl: 'http://192.168.29.5:5001',
  socketUrl: 'http://192.168.29.5:5001',
  // Alternative IPs for different scenarios
  fallbackApiUrls: [
    'http://192.168.29.5:5001',    // Current computer IP MongoDB (primary)
    'http://192.168.29.5:5000',    // Current computer IP PostgreSQL
    'http://10.0.2.2:5001',        // Android emulator MongoDB
    'http://10.0.2.2:5000',        // Android emulator PostgreSQL
    'http://192.168.150.111:5001', // Previous computer IP MongoDB
    'http://192.168.150.111:5000', // Previous computer IP PostgreSQL
    'http://192.168.1.100:5001',   // Common home network IP MongoDB
    'http://192.168.1.100:5000',   // Common home network IP PostgreSQL
    'http://192.168.0.100:5001',   // Alternative home network IP MongoDB
    'http://192.168.0.100:5000',   // Alternative home network IP PostgreSQL
    'http://localhost:5001',       // Browser MongoDB
    'http://localhost:5000'        // Browser PostgreSQL
  ],
  fallbackSocketUrls: [
    'http://192.168.29.5:5001',    // MongoDB (primary)
    'http://192.168.29.5:5000',    // PostgreSQL
    'http://10.0.2.2:5001',        // Android emulator MongoDB
    'http://10.0.2.2:5000'         // Android emulator PostgreSQL
  ]
};
