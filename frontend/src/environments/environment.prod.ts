export const environment = {
  production: true,
  // Replace with your actual Render backend URL
  apiUrl: 'https://your-dfashion-backend.onrender.com',
  socketUrl: 'https://your-dfashion-backend.onrender.com',
  // Fallback URLs for different scenarios
  fallbackApiUrls: [
    'https://your-dfashion-backend.onrender.com',  // Primary production URL
    'http://192.168.29.5:5001',                    // Local development MongoDB fallback
    'http://192.168.29.5:5000',                    // Local development PostgreSQL fallback
    'http://localhost:5001',                       // Local MongoDB fallback
    'http://localhost:5000'                        // Local PostgreSQL fallback
  ],
  fallbackSocketUrls: [
    'https://your-dfashion-backend.onrender.com',  // Primary production URL
    'http://192.168.29.5:5001',                    // Local development MongoDB fallback
    'http://192.168.29.5:5000',                    // Local development PostgreSQL fallback
    'http://localhost:5001',                       // Local MongoDB fallback
    'http://localhost:5000'                        // Local PostgreSQL fallback
  ]
};
