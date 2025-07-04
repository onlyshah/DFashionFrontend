export const environment = {
  production: true,
  // Replace with your actual Render backend URL
  apiUrl: 'https://your-dfashion-backend.onrender.com/api',
  socketUrl: 'https://your-dfashion-backend.onrender.com',
  // Fallback URLs for different scenarios
  fallbackApiUrls: [
    'https://your-dfashion-backend.onrender.com/api',  // Primary production URL
    'http://192.168.29.5:3001/api',                    // Local development fallback
    'http://localhost:3001/api'                        // Local fallback
  ]
};
