import Head from 'next/head';
import Image from 'next/image';
import { SearchIcon } from '@heroicons/react/outline';
import Footer from '../components/Footer';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const searchInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const term = searchInputRef.current?.value.trim();

        if (!term) {
            alert('Please enter a search term.');
            return;
        }

        try {
            setLoading(true);
            const encodedTerm = encodeURIComponent(term);
            await router.push(`/search?term=${encodedTerm}`);
            searchInputRef.current.value = '';
        } catch (error) {
            console.error('Navigation error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const teleport = () => {
        const urls = [
            'https://instagram.com/exeivglobal/',
            'https://github.com/Shrestt',
        ];
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        window.open(randomUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col justify-center min-h-screen items-center bg-white dark:bg-gray-900 transition-colors duration-300">
            <Head>
                <title>SeekEngine - Fast Search for the Web</title>
                <meta name="description" content="SeekEngine helps you discover the web quickly and smartly." />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta property="og:title" content="SeekEngine" />
                <meta property="og:description" content="Fast and intuitive search experience." />
                <meta property="og:type" content="website" />
                <link rel="icon" href="/favicon.ico" />
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
            <main className="flex flex-col items-center mt-32 w-4/5 flex-grow">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-lg">SeekEngine</h1>

                <form
                    onSubmit={handleSearch}
                    className="flex w-full max-w-2xl rounded-full border border-gray-200 dark:border-gray-700 px-5 py-3 items-center hover:shadow-lg focus-within:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
                >
                    <SearchIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-300" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        className="flex-grow focus:outline-none bg-transparent dark:text-white"
                        aria-label="Search input"
                    />
                </form>

                <div className="flex flex-col sm:flex-row w-full justify-center mt-6 space-y-3 sm:space-y-0 sm:space-x-4 max-w-md">
                    <button
                        type="submit"
                        onClick={handleSearch}
                        disabled={loading}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                        type="button"
                        onClick={teleport}
                        className="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition"
                    >
                        Teleport Me
                    </button>
                </div>
            </main>

            {/* What's New Banner */}
            <section className="text-center py-4 lg:px-4">
                <div className="p-2 bg-indigo-800 text-indigo-100 rounded-lg inline-flex items-center" role="alert">
                    <span className="bg-indigo-500 uppercase px-2 py-1 text-xs font-bold rounded-full mr-3">What's new</span>
                    <span className="font-semibold">The “Teleport Me” button works now!</span>
                </div>
            </section>

            <Footer />
        </div>
    );
}
