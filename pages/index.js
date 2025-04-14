import Head from 'next/head';
import Image from 'next/image';
import { SearchIcon } from '@heroicons/react/outline';
import Footer from "../components/Footer";
import { useRef } from "react";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const searchInputRef = useRef(null);

    const search = (e) => {
        e.preventDefault();
        const term = searchInputRef.current.value.trim();

        if (!term) {
            alert("Please enter a search term.");
            return;
        }

        const encodedTerm = encodeURIComponent(term);
        router.push(`/search?term=${encodedTerm}`).catch((error) => {
            console.error("Failed to navigate:", error);
            alert("An error occurred while searching. Please try again.");
        });
    };

    const teleport = (e) => {
        e.preventDefault();
        const urlarray = [
            "instagram.com/shrest.xd/",
            "instagram.com/exeivglobal/",
            "github.com/Shrestt"
        ];

        if (urlarray.length === 0) {
            alert("No destinations available right now.");
            return;
        }

        const i = Math.floor(Math.random() * urlarray.length);
        const selectedUrl = "https://" + urlarray[i];

        router.push(selectedUrl).catch((error) => {
            console.error("Failed to navigate:", error);
            alert("An error occurred while trying to teleport. Please try again.");
        });
    };

    return (
        <div className="flex flex-col justify-center h-screen items-center dark:bg-gray-900 bg-opacity-25">
            <Head>
                <title>SeekEngine - Fast Search for the Web</title>
                <meta name="description" content="SeekEngine helps you discover the web quickly and smartly."/>
                <meta name="robots" content="index, follow" />
                <meta name="google-site-verification" content="2xKyyjae3sX5nWj0YdT0GG7E8Icsnu6ezopI_AboH6k" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header */}
            <header className="flex w-full p-5 justify-between text-sm text-gray-700 dark:text-white">
                <div className="flex space-x-4 items-center">
                    <a href="https://instagram.com" aria-label="Contact"><p className="link">Contact</p></a>
                    <a href="https://github.com/" aria-label="GitHub"><p className="link">GitHub</p></a>
                </div>
                <div className="flex space-x-4 items-center">
                    <a href="https://shortl.it" aria-label="Shorten URLs"><p className="link">shortl.it</p></a>
                </div>
            </header>

            {/* Body */}
            <form className="flex flex-col items-center mt-44 flex-grow w-4/5" onSubmit={search}>
                <Image
                    src="https://i.imgur.com/9fAjOoB.png"
                    height={300}
                    width={400}
                    alt="SeekEngine Logo"
                />
                <div className="flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl">
                    <SearchIcon className="h-5 mr-3 text-gray-500 dark:text-gray-300" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        aria-label="Search input"
                        placeholder="Search..."
                        className="flex grow w-full focus:outline-none dark:bg-gray-900 bg-opacity-25 dark:text-white"
                    />
                </div>
                <div className="flex flex-col w-1/2 space-y-2 justify-center mt-8 sm:space-y-0 sm:flex-row sm:space-x-4">
                    <button type="button" onClick={search} className="btn dark:bg-gray-800 dark:text-white">Search</button>
                    <button type="button" onClick={teleport} className="btn dark:bg-gray-800 dark:text-white">Teleport me</button>
                </div>
            </form>

            <div className="text-center py-4 lg:px-4">
                <div
                    className="p-2 bg-indigo-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex"
                    role="alert">
                    <span className="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3">What's new</span>
                    <span className="font-semibold mr-2 text-left flex-auto">Teleport me Button works now</span>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
