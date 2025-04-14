import Head from 'next/head';
import Image from 'next/image';
import { SearchIcon } from '@heroicons/react/outline';
import Footer from '../components/Footer';
import { useRef } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const searchInputRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchInputRef.current?.value.trim();

        if (!term) {
            alert('Please enter a search term.');
            return;
        }

        const encodedTerm = encodeURIComponent(term);
        router.push(`/search?term=${encodedTerm}`)
            .then(() => {
                searchInputRef.current.value = '';
            })
            .catch((error) => {
                console.error('Navigation error:', error);
                alert('Something went wrong. Please try again.');
            });
    };

    const teleport = () => {
        const urls = [
            'https://instagram.com/shrest.xd/',
            'https://instagram.com/exeivglobal/',
            'https://github.com/Shrestt',
        ];

        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        window.open(randomUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col justify-center min-h-screen items-center dark:bg-gray-900 bg-opacity-25">
            <Head>
                <title>SeekEngine - Fast Search for the Web</title>
                <meta name="description" content="SeekEngine helps you discover the web quickly and smartly." />
                <meta name="robots" content="index, follow" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header */}
            <header className="flex w-full p-5 justify-between text-sm text-gray-700 dark:text-white">
                <div className="flex space-x-4 items-center">
                    <a
                        href="https://instagram.com/shrest.xd"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram profile"
                        title="Shrest's Instagram"
                    >
                        <p className="link">Instagram (Contact)</p>
                    </a>
                </div>
                <div className="flex space-x-4 items-center">
                    <a
                        href="https://shortl.it"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="URL shortener"
                        title="Use shortl.it"
                    >
                        <p className="link">shortl.it</p>
                    </a>
                </div>
            </header>

            {/* Body */}
            <main className="flex flex-col items-center mt-32 w-4/5 flex-grow">
                <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">SeekEngine</h1>

                <form
                    onSubmit={handleSearch}
                    className="flex w-full mt-4 max-w-2xl rounded-full border border-gray-200 px-5 py-3 items-center hover:shadow-lg focus-within:shadow-lg"
                >
                    <SearchIcon className="h-5 mr-3 text-gray-500 dark:text-gray-300" />
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
                        className="btn dark:bg-gray-800 dark:text-white"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={teleport}
                        className="btn dark:bg-gray-800 dark:text-white"
                    >
                        Teleport Me
                    </button>
                </div>
            </main>

            {/* What's New Banner */}
            <section className="text-center py-4 lg:px-4">
                <div className="p-2 bg-indigo-800 text-indigo-100 rounded-lg inline-flex items-center" role="alert">
                    <span className="bg-indigo-500 uppercase px-2 py-1 text-xs font-bold rounded-full mr-3">What's new</span>
                    <span className="font-semibold">Teleport me button works now!</span>
                </div>
            </section>

            <Footer />
        </div>
    );
                            }
