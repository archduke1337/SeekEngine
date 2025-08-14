import Head from 'next/head';
import { SearchIcon } from '@heroicons/react/outline';
import Footer from '../components/Footer';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';

export default function Home() {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const term = searchInputRef.current?.value.trim();

    if (!term) {
      setError('Please enter a search term.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const encodedTerm = encodeURIComponent(term);
      await router.push(`/search?term=${encodedTerm}`); // Navigate to search page
      searchInputRef.current.value = ''; // Clear input after search
      searchInputRef.current.focus(); // Focus input again
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Something went wrong. Please try again.');
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
    <div className="flex flex-col justify-between min-h-screen items-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>SeekEngine - Fast Search for the Web</title>
        <meta name="description" content="SeekEngine helps you discover the web quickly and smartly." />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="SeekEngine" />
        <meta property="og:description" content="Fast and intuitive search experience." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      {/* Header */}
      <header className="flex w-full p-5 justify-between text-sm text-gray-700 dark:text-white">
        <div className="flex space-x-4 items-center">
          <a
            href="https://shresth-dev.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Developer Portfolio"
            className="hover:underline"
          >
            Dev (Contact)
          </a>
        </div>
        <div className="flex space-x-4 items-center">
          <a
            href="https://exeiv.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Exeiv URL shortener"
            className="hover:underline"
          >
            Exeiv
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center mt-16 sm:mt-24 w-11/12 sm:w-4/5 flex-grow">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-lg">SeekEngine</h1>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-2xl rounded-full border border-gray-200 dark:border-gray-700 px-5 py-3 items-center hover:shadow-lg focus-within:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
        >
          <label htmlFor="search-input" className="sr-only">
            Search
          </label>
          <SearchIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-300" aria-hidden="true" />
          <input
            id="search-input"
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            className="flex-grow focus:outline-none bg-transparent dark:text-white"
            aria-label="Search the web"
          />
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-600 dark:text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full justify-center mt-6 space-y-3 sm:space-y-0 sm:space-x-4 max-w-md">
          <Button type="submit" form="search-form" isLoading={loading} disabled={loading}>
            Search
          </Button>
          <Button onClick={teleport} isLoading={teleporting} disabled={teleporting}>
            Teleport Me
          </Button>
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
