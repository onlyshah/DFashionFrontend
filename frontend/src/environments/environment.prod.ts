export const environment = {
  production: true,
  // Replace with your actual Render backend URL
  apiUrl: 'https://your-dfashion-backend.onrender.com',
  socketUrl: 'https://your-dfashion-backend.onrender.com',
  // Fallback URLs for different scenarios
  fallbackApiUrls: [
    'https://your-dfashion-backend.onrender.com',  // Primary production URL
    'http://192.168.29.5:9000',                    // Local development fallback
    'http://localhost:9000'                        // Local fallback
  ]
};
