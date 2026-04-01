export const environment = {
  production: false,
  // For Android Emulator: 10.0.2.2 maps to host machine
  // For physical device: use your computer's IP address
  apiUrl: 'http://192.168.29.5:3000',
  socketUrl: 'http://192.168.29.5:3000',
  // Alternative IPs for different scenarios
  fallbackApiUrls: [
    'http://192.168.29.5:3000',    // Current computer IP (primary)
    'http://10.0.2.2:3000',        // Android emulator
    'http://192.168.150.111:3000', // Previous computer IP
    'http://192.168.1.100:3000',   // Common home network IP
    'http://192.168.0.100:3000',   // Alternative home network IP
    'http://192.168.1.1:3000',     // Router IP variant
    'http://localhost:3000'        // Fallback for browser testing
  ]
};
