import Head from 'next/head';
import { MagnifyingGlassIcon as SearchIcon, MoonIcon, SunIcon, ComputerDesktopIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';

export default function Home() {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('system');
  const [showBanner, setShowBanner] = useState(true);

  // Theme handling
  useEffect(() => {
    // Get stored theme or default to system
    const storedTheme = localStorage.getItem('theme') || 'system';
    setTheme(storedTheme);
    document.documentElement.classList.add('theme-transition');
    
    const handleTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && isDark));
    };

    handleTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleTheme);
    
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleTheme);
    };
  }, [theme]);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    
    if (!searchInputRef.current) {
      return;
    }

    const term = searchInputRef.current.value.trim();

    if (!term) {
      setError('Please enter a search term.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const encodedTerm = encodeURIComponent(term);
      await router.push(`/search?term=${encodedTerm}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Something went wrong. Please try again.');
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle teleportation (random URL navigation)
  const teleport = () => {
    const urls = [
      'https://instagram.com/exeivglobal/',
      'https://github.com/Shrestt',
    ];
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];

    try {
      setTeleporting(true);
      setError(null);
      window.open(randomUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Teleport error:', error);
      setError('Failed to open the link. Please try again.');
    } finally {
      setTeleporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--primary-bg)]">
      <Head>
        <title>SeekEngine - Smart Web Search</title>
        <meta name="description" content="SeekEngine - A modern, fast, and intelligent web search experience" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="SeekEngine - Smart Web Search" />
        <meta property="og:description" content="Experience a modern, fast, and intelligent way to search the web" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="w-full px-6 py-4 animate-fadeIn">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex space-x-6 items-center">
            <a
              href="https://shresth-dev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Developer Portfolio"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors duration-200"
            >
              Dev
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass p-1 rounded-lg flex items-center space-x-1" role="radiogroup" aria-label="Theme selection">
              <button
                onClick={() => {
                  setTheme('light');
                  localStorage.setItem('theme', 'light');
                }}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'light' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
                aria-label="Light theme"
                aria-pressed={theme === 'light'}
              >
                <SunIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  localStorage.setItem('theme', 'dark');
                }}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'dark' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
                aria-label="Dark theme"
                aria-pressed={theme === 'dark'}
              >
                <MoonIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  localStorage.setItem('theme', 'system');
                }}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'system' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
                aria-label="System theme"
                aria-pressed={theme === 'system'}
              >
                <ComputerDesktopIcon className="h-5 w-5" />
              </button>
            </div>
            <a
              href="https://exeiv.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Exeiv URL shortener"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors duration-200"
            >
              Exeiv
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col items-center space-y-12">
          {showBanner && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="glass py-3 px-6 flex items-center space-x-4">
                <span className="bg-[var(--primary)] text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW
                </span>
                <span className="text-[var(--text-primary)]">
                  Introducing Teleport - Jump to interesting places!
                </span>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  aria-label="Dismiss banner"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-extrabold text-center leading-tight animate-fadeIn">
            SeekEngine
          </h1>

          {/* Search Form */}
          <div className="search-container">
            <form
              id="search-form"
              onSubmit={handleSearch}
              className="search-input-wrapper glass"
            >
              <input
                id="search-input"
                ref={searchInputRef}
                type="text"
                placeholder="Search anything..."
                className="search-input"
                aria-label="Search the web"
                disabled={loading}
                autoComplete="off"
              />
              <SearchIcon className="search-icon h-5 w-5" aria-hidden="true" />
            </form>

            {/* Error Message */}
            {error && (
              <div 
                className="mt-4 text-[var(--error)] text-sm flex items-center justify-center space-x-2" 
                role="alert"
              >
                <span className="bg-[var(--error)] bg-opacity-10 px-2 py-1 rounded">
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md px-4">
            <Button 
              onClick={handleSearch} 
              isLoading={loading} 
              disabled={loading}
              className="btn btn-primary w-full sm:w-auto"
              aria-label="Search the web"
            >
              <span className="flex items-center justify-center gap-2">
                <SearchIcon className="h-5 w-5" />
                Search Now
              </span>
            </Button>
            <Button 
              onClick={teleport} 
              isLoading={teleporting} 
              disabled={teleporting || loading}
              className="btn w-full sm:w-auto"
              aria-label="Go to a random interesting website"
            >
              Teleport Me
            </Button>
          </div>
        </div>
      </main>

      {/* What's New Banner */}
      <section className="text-center py-4 lg:px-4">
        <div className="p-2 bg-indigo-800 text-indigo-100 rounded-lg inline-flex items-center" role="alert">
          <span className="bg-indigo-500 uppercase px-2 py-1 text-xs font-bold rounded-full mr-3">What's new</span>
          <span className="font-semibold">The “Teleport Me” button works now!</span>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
