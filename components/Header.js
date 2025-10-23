import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { MicrophoneIcon, AdjustmentsHorizontalIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import HeaderOptions from './HeaderOptions';
import { useVoiceSearch } from '../hooks/useSearch';
import { LoadingSpinner } from './LoadingStates'; 
import { Transition } from '@headlessui/react';
import SearchInput from './SearchInput';
import { useTheme } from './ThemeProvider';

function Header() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(router.query.term || '');
    const { isListening, transcript, error: voiceError, startListening } = useVoiceSearch();
    const [searchType, setSearchType] = useState('all');
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const { theme, setTheme } = useTheme();
    
    const searchTypes = [
        { id: 'all', label: 'All' },
        { id: 'image', label: 'Images' },
        { id: 'video', label: 'Videos' },
        { id: 'news', label: 'News' }
    ];

    useEffect(() => {
        if (transcript) {
            setSearchTerm(transcript);
        }
    }, [transcript]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        router.push(`/search?term=${encodeURIComponent(term)}${searchType !== 'all' ? `&type=${searchType}` : ''}`);
    };

    const handleThemeToggle = () => {
        // Toggle between dark and light; keep 'system' for explicit choices
        setTheme();
        // briefly add transition helper
        document.documentElement.classList.add('theme-transition');
        window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
    };

    return (
        <header className="sticky top-0 bg-[var(--surface)] z-50 shadow-md border-b border-[var(--border)]" style={{ borderColor: 'var(--border)' }}>
            <div className="flex w-full p-6 items-center">
                <Image
                    src="https://i.imgur.com/9fAjOoB.png"
                    height={40}
                    width={120}
                    alt="Logo"
                    onClick={() => router.push("/")}
                    className="cursor-pointer transition-transform hover:scale-105"
                />

                <div className="relative flex-grow max-w-3xl ml-10">
                    <div className="glass flex items-center px-6 py-3 transition-all duration-300 border border-[var(--border)]" style={{ borderColor: 'var(--border)' }}>
                        <SearchInput defaultValue={searchTerm} onSearch={handleSearch} />
                        
                        <div className="flex items-center space-x-3 ml-3">
                            <button
                                type="button"
                                onClick={startListening}
                                disabled={isListening}
                                className="p-2 rounded-full hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            >
                                <MicrophoneIcon className={`h-5 w-5 ${isListening ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowTypeSelector(!showTypeSelector)}
                                className="p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            >
                                <AdjustmentsHorizontalIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>
                    </div>

                    <Transition
                        as="div"
                        show={showTypeSelector}
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        className="absolute right-0 mt-2 py-2 w-48 bg-[var(--surface-1)] rounded-lg shadow-xl z-50 border border-[var(--border)]" style={{ borderColor: 'var(--border)' }}
                    >
                        {searchTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setSearchType(type.id);
                                    setShowTypeSelector(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                    searchType === type.id
                                        ? 'text-[var(--primary)] bg-[var(--surface-2)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </Transition>
                </div>

                {/* Theme toggle button */}
                <div className="ml-4 flex items-center">
                  <button
                    onClick={handleThemeToggle}
                    aria-label="Toggle theme"
                    title={`Theme: ${theme}`}
                    className="p-2 rounded-md hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {theme === 'light' ? (
                      <MoonIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                    ) : (
                      <SunIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>
            </div>

            {/* Header Options */}
            <HeaderOptions />
        </header>
    );
}

export default Header;
