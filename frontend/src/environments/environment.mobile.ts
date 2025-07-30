export const environment = {
  production: false,
  // For Android Emulator: 10.0.2.2 maps to host machine
  // For physical device: use your computer's IP address
  apiUrl: 'http://192.168.29.5:9000',
  socketUrl: 'http://192.168.29.5:9000',
  // Alternative IPs for different scenarios
  fallbackApiUrls: [
    'http://192.168.29.5:9000',    // Current computer IP (primary)
    'http://10.0.2.2:9000',        // Android emulator
    'http://192.168.150.111:9000', // Previous computer IP
    'http://192.168.1.100:9000',   // Common home network IP
    'http://192.168.0.100:9000',   // Alternative home network IP
    'http://192.168.1.1:9000',     // Router IP variant
    'http://localhost:9000'        // Fallback for browser testing
  ]
};
