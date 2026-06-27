// Application configuration settings

export const CONFIG = {
  // Authentication & Session
  COOKIE_NAME: 'warishlabs_admin_session',
  VISITOR_COOKIE_NAME: 'warishlabs_visitor_id',
  SESSION_EXPIRY_DAYS: 7,
  
  // File Upload Limits
  FILE_SIZE_LIMITS: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
  },
  
  // Rate Limits (Requests per IP / Session)
  RATE_LIMITS: {
    CONTACT_LIMIT: 5,        // 5 requests per hour
    CONTACT_WINDOW: 3600,    // 1 hour in seconds
    
    NEWSLETTER_LIMIT: 5,     // 5 requests per hour
    NEWSLETTER_WINDOW: 3600, // 1 hour in seconds
    
    SEARCH_LIMIT: 30,        // 30 requests per minute
    SEARCH_WINDOW: 60,       // 1 minute in seconds
    
    ANALYTICS_LIMIT: 60,     // 60 requests per minute
    ANALYTICS_WINDOW: 60,    // 1 minute in seconds
  },
  
  // Analytics Data Retention
  ANALYTICS_RETENTION_DAYS: 90,
} as const;
