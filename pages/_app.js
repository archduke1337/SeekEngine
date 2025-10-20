import '../styles/globals.css';
import ThemeProvider from '../components/ThemeProvider';
import { validateEnvironment } from '../utils/env';
import { Analytics } from '@vercel/analytics/react';

// Validate environment variables on server startup
if (typeof window === 'undefined') {
  validateEnvironment();
}

// You can add providers or layout wrappers here if needed
function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}

export default MyApp;
