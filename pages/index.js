import Head from 'next/head';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  MoonIcon, 
  SunIcon, 
  ComputerDesktopIcon as DesktopComputerIcon, 
  XMarkIcon as XIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  BoltIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useTheme } from '../components/ThemeProvider';
import { validateSearchTerm } from '../utils/validation';

export default function Home() {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [error, setError] = useState(null);

  // Theme is managed by ThemeProvider
  const { theme, setTheme } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchInputRef.current) {
      return;
    }

    const term = searchInputRef.current.value.trim();

    try {
      const validatedTerm = validateSearchTerm(term);
      setError(null);
      setLoading(true);
      const encodedTerm = encodeURIComponent(validatedTerm);
      await router.push(`/search?term=${encodedTerm}`);
    } catch (validationError) {
      setError(validationError.message);
      setLoading(false);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  const teleport = () => {
    const urls = [
      'https://archduke.is-a.dev',
      'https://github.com/archduke1337',
      'https://instagram.com/gurv.xd',
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

  const features = [
    { 
      icon: SearchIcon, 
      label: 'Precision Results', 
      desc: 'Powered by the Google Search API, SeekEngine delivers the fast, relevant, and comprehensive results you trust.' 
    },
    { 
      icon: GlobeAltIcon, 
      label: 'Discover the Web', 
      desc: 'Click "Teleport Me" to jump to a random, interesting, and curated corner of the internet. Break out of your bubble!' 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Animated background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      <Head>
        <title>SeekEngine - Smart Web Search</title>
        <meta name="description" content="SeekEngine - Your smarter, more adventurous way to search the web. Smart Search powered by Google + Teleport feature to discover new sites." />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="SeekEngine - Smart Web Search" />
        <meta property="og:description" content="Your smarter, more adventurous way to search the web" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10 backdrop-blur-sm border-b border-border-light transition-colors duration-300">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-300">
              SeekEngine
            </a>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-text-secondary hover:text-primary transition-colors duration-300">
                About
              </a>
              <a href="#teleport" className="text-text-secondary hover:text-primary transition-colors duration-300">
                What is Teleport?
              </a>
              <a href="https://archduke.is-a.dev" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors duration-300">
                Developer
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="glass p-1.5 rounded-lg flex items-center space-x-1 transition-colors duration-300">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'text-text-secondary hover:text-primary'
                }`}
                title="Light theme"
              >
                <SunIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'text-text-secondary hover:text-primary'
                }`}
                title="Dark theme"
              >
                <MoonIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  theme === 'system' 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'text-text-secondary hover:text-primary'
                }`}
                title="System theme"
              >
                <DesktopComputerIcon className="h-5 w-5" />
              </button>
            </div>
            <a
              href="https://github.com/archduke1337/SeekEngine"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-text-secondary hover:text-primary transition-all duration-300 font-medium hover:scale-105 items-center gap-2"
            >
              <BoltIcon className="h-4 w-4" />
              Github
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 flex flex-col transition-colors duration-300">
        {/* Hero Section */}
        <section className="w-full px-4 py-20 md:py-32 flex items-center justify-center">
          <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full backdrop-blur-sm animate-slideInDown">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Latest Update: Teleport Me is Live 🚀</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  SeekEngine
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-text-secondary">
                Your smarter, more adventurous way to search the web.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="group relative">
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-focus-within:opacity-20 rounded-2xl blur-xl transition-opacity duration-500"></div>

                <div className="relative glass backdrop-blur-xl border border-border-light group-focus-within:border-primary transition-all duration-300 rounded-2xl overflow-hidden">
                  <div className="flex items-center px-6 py-4 gap-4">
                    <SearchIcon className="h-6 w-6 text-text-tertiary group-focus-within:text-primary transition-colors duration-300 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for anything..."
                      className="flex-1 bg-transparent text-text-primary placeholder-text-tertiary outline-none text-lg font-medium"
                      disabled={loading}
                      autoComplete="off"
                    />
                    {loading && <SparklesIcon className="h-5 w-5 text-primary animate-spin flex-shrink-0" />}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="mt-4 p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm animate-slideInUp"
                  role="alert"
                >
                  <p className="font-semibold">{error}</p>
                </div>
              )}
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <button 
                onClick={handleSearch} 
                disabled={loading}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-300 to-purple-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <SearchIcon className="h-5 w-5" />
                <span>{loading ? 'Searching...' : 'Search Now'}</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={teleport} 
                disabled={teleporting || loading}
                className="group relative px-8 py-4 border-2 border-primary bg-primary/10 text-primary font-bold rounded-xl transition-all duration-300 hover:bg-primary/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RocketLaunchIcon className="h-5 w-5" />
                <span>{teleporting ? 'Teleporting...' : 'Teleport Me 🚀'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full px-4 py-20 bg-surface-1/50 transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-slideInUp">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Go Beyond Just Links
                </span>
              </h2>
              <p className="text-text-secondary text-lg">Discover why SeekEngine is different</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="card glass group hover:border-primary transition-all duration-300 animate-slideInUp"
                  style={{ animationDelay: `${idx * 150}ms` }}
                  id={idx === 1 ? 'teleport' : undefined}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-primary/20 rounded-2xl group-hover:bg-gradient-primary/30 transition-colors">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl text-text-primary">{feature.label}</h3>
                      <p className="text-text-secondary text-base leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's New Section */}
        <section className="w-full px-4 py-20 transition-colors duration-300">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-slideInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full">
              <CheckCircleIcon className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">LATEST UPDATE</span>
            </div>
            <div className="card glass border-border-light group hover:border-primary transition-all duration-300 p-8">
              <p className="text-lg text-text-primary font-semibold mb-2">
                The "Teleport Me" button is now live!
              </p>
              <p className="text-text-secondary">
                Give it a try and discover something new. Jump to a random corner of the internet and explore beyond your bubble.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border-light bg-surface-1/30 backdrop-blur-sm relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <p className="text-text-primary font-semibold mb-2">A project by</p>
              <p className="text-text-secondary">
                <a href="https://archduke.is-a.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Gaurav Yadav (Archduke)
                </a>
              </p>
            </div>
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <span>•</span>
                <a href="https://github.com/archduke1337/SeekEngine/issues" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Report</a>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-text-secondary text-sm">
                © 2025 SeekEngine<br />
                <span className="text-xs">Powered by Next.js + Turbopack & Google Search API</span>
              </p>
            </div>
          </div>
          <div className="border-t border-border-light pt-8 text-center text-text-tertiary text-sm">
            <p>Made with ❤️ for better web discovery</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
