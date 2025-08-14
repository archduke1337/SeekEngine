import Image from 'next/image';
import { useRouter } from 'next/router';
import { useRef, useState, useEffect } from 'react';
import { SearchIcon, XIcon, MicrophoneIcon } from '@heroicons/react/outline';
import HeaderOptions from './HeaderOptions';
import { useDebounce, useVoiceSearch } from '../hooks/useSearch';
import { LoadingSpinner } from './LoadingStates';

function Header() {
    const router = useRouter();
    const searchInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(router.query.term || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { isListening, transcript, error: voiceError, startListening } = useVoiceSearch();
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchSuggestions(debouncedSearchTerm);
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (transcript) {
            setSearchTerm(transcript);
            searchInputRef.current.value = transcript;
        }
    }, [transcript]);

    const fetchSuggestions = async (term) => {
        if (!term) return;
        setIsLoading(true);
        try {
            // Implement your suggestion fetching logic here
            // This is a placeholder
            const mockSuggestions = [
                `${term} search`,
                `${term} tutorial`,
                `${term} example`
            ];
            setSuggestions(mockSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const search = (e) => {
        e.preventDefault();
        const term = searchInputRef.current.value.trim();
        if (!term) return;
        setSuggestions([]); // Clear suggestions
        router.push(`/search?term=${encodeURIComponent(term)}`);
    };

    return (
        <header className="sticky top-0 bg-[var(--surface)] z-50 shadow-md">
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
                    <form
                        onSubmit={search}
                        className="glass flex items-center px-6 py-3 transition-all duration-300 focus-within:shadow-lg"
                    >
                        <SearchIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                        <input
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input ml-3"
                            type="text"
                            placeholder="Search..."
                        />
                        {searchTerm && (
                            <XIcon
                                className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:text-[var(--text-primary)] hover:scale-110"
                                onClick={() => {
                                    setSearchTerm('');
                                    searchInputRef.current.value = '';
                                    setSuggestions([]);
                                }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={startListening}
                            className="ml-3 p-2 rounded-full hover:bg-[var(--accent)] transition-colors duration-200"
                            disabled={isListening}
                        >
                            <MicrophoneIcon 
                                className={`h-5 w-5 ${
                                    isListening 
                                        ? 'text-[var(--primary)] animate-pulse' 
                                        : 'text-[var(--text-secondary)]'
                                }`}
                            />
                        </button>
                        <button hidden type="submit">Search</button>
                    </form>

                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="absolute w-full mt-2 glass divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <div className="p-4">
                                    <LoadingSpinner size="sm" />
                                </div>
                            ) : (
                                suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-6 py-3 cursor-pointer hover:bg-[var(--accent)] transition-colors duration-200"
                                        onClick={() => {
                                            setSearchTerm(suggestion);
                                            searchInputRef.current.value = suggestion;
                                            setSuggestions([]);
                                            router.push(`/search?term=${encodeURIComponent(suggestion)}`);
                                        }}
                                    >
                                        <p className="text-[var(--text-primary)]">{suggestion}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Header Options */}
            <HeaderOptions />
        </header>
    );
}

export default Header;
