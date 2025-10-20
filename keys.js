// API credentials from environment variables
// Get your own keys from:
// - API Key: https://console.cloud.google.com/apis/credentials
// - CX: https://programmablesearchengine.google.com/

export const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
export const CONTEXT_KEY = process.env.NEXT_PUBLIC_GOOGLE_CX || '';

// Validate that credentials are configured
if (!API_KEY || !CONTEXT_KEY) {
  if (typeof window === 'undefined') {
    // Server-side only warning
    console.warn(
      '⚠️  Missing environment variables: NEXT_PUBLIC_GOOGLE_API_KEY or NEXT_PUBLIC_GOOGLE_CX\n' +
      'Please check your .env.local file'
    );
  }
}
