// utils/env.js
/**
 * Validate required environment variables at startup
 * Should be called at application initialization
 */
export const validateEnvironment = () => {
  const required = [
    'NEXT_PUBLIC_GOOGLE_API_KEY',
    'NEXT_PUBLIC_GOOGLE_CX'
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file.`;
    
    console.error('❌ ' + errorMsg);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
  } else {
    console.log('✅ Environment variables validated successfully');
  }
};
