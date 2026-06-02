export const environment = {
  production: false,
  // Primary backend: MongoDB on port 5001 (WITHOUT /api suffix - endpoints include /api)
  apiUrl: 'http://localhost:5001',
  // For socket connections, use absolute URL
  socketUrl: 'http://localhost:5001',
  // Fallback URLs for different database backends
  fallbackApiUrls: [
    'http://localhost:5001',  // MongoDB (primary)
    'http://localhost:5000'   // PostgreSQL (fallback)
  ],
  fallbackSocketUrls: [
    'http://localhost:5001',  // MongoDB (primary)
    'http://localhost:5000'   // PostgreSQL (fallback)
  ]
};
