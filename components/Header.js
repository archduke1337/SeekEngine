import Image from 'next/image';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import HeaderOptions from './HeaderOptions';

function Header() {
    const router = useRouter();
    const searchInputRef = useRef(null);

    const search = (e) => {
        e.preventDefault();
        const term = searchInputRef.current.value.trim();
        if (!term) return;
        router.push(`/search?term=${encodeURIComponent(term)}`);
    };

    return (
        <header className="sticky top-0 bg-white dark:bg-gray-900 z-50">
            <div className="flex w-full p-6 items-center">
                <Image
                    src="https://i.imgur.com/9fAjOoB.png"
                    height={40}
                    width={120}
                    alt="Logo"
                    onClick={() => router.push("/")}
                    className="cursor-pointer"
                />

                <form
                    onSubmit={search}
                    className="flex flex-grow px-6 py-3 ml-10 mr-5 border border-gray-200 rounded-full shadow-lg max-w-3xl items-center dark:border-gray-700"
                >
                    <input
                        ref={searchInputRef}
                        defaultValue={router.query.term}
                        className="flex-grow w-full focus:outline-none dark:bg-gray-900 dark:text-white"
                        type="text"
                        placeholder="Search..."
                    />
                    <XIcon
                        className="h-7 sm:mr-3 text-gray-500 cursor-pointer transition duration-100 transform hover:scale-125 dark:text-gray-300"
                        onClick={() => (searchInputRef.current.value = '')}
                    />
                    <SearchIcon className="border-l-2 pl-4 border-gray-300 h-6 text-blue-500 hidden sm:inline-flex" />
                    <button hidden type="submit">Search</button>
                </form>
            </div>

            {/* Header Options */}
            <HeaderOptions />
        </header>
    );
}

export default Header;
