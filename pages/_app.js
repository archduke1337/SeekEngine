import '../styles/globals.css';
import ThemeProvider from '../components/ThemeProvider';

// You can add providers or layout wrappers here if needed
function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
