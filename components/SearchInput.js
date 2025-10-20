import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { 
    MagnifyingGlassIcon as SearchIcon, 
    XMarkIcon as XIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

export default function SearchInput({ defaultValue = '', onSearch }) {
    const router = useRouter();
    const [term, setTerm] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const { suggestions, isLoading } = useSearchSuggestions(term);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter') {
                handleSubmit(e);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSubmit(e);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!term.trim()) return;
        
        setIsOpen(false);
        setSelectedIndex(-1);
        onSearch?.(term);
        router.push(`/search?term=${encodeURIComponent(term)}`);
    };

    const handleSuggestionClick = (suggestion) => {
        setTerm(suggestion);
        setIsOpen(false);
        setSelectedIndex(-1);
        onSearch?.(suggestion);
        router.push(`/search?term=${encodeURIComponent(suggestion)}`);
    };

    const clearInput = () => {
        setTerm('');
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <form onSubmit={handleSubmit} className="relative">
                    {/* Background glow effect */}
                    {isFocused && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-50 -z-10 animate-pulse" />
                    )}

                    {/* Input wrapper with border animation */}
                    <div className={`relative transition-all duration-300 ${
                        isFocused 
                            ? 'ring-2 ring-blue-500/50' 
                            : 'ring-1 ring-gray-200 dark:ring-gray-700'
                    } rounded-full`}>
                        {/* Search Icon */}
                        <SearchIcon 
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 ${
                                isFocused 
                                    ? 'text-blue-500 scale-110' 
                                    : 'text-gray-400'
                            }`} 
                        />

                        {/* Input field */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={term}
                            onChange={(e) => {
                                setTerm(e.target.value);
                                setIsOpen(true);
                                setSelectedIndex(-1);
                            }}
                            onFocus={() => {
                                setIsFocused(true);
                                setIsOpen(true);
                            }}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            className="w-full py-3 px-12 pr-20 rounded-full bg-white dark:bg-gray-800/50 backdrop-blur-sm border-0 outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                            placeholder="Search anything..."
                            autoComplete="off"
                        />

                        {/* Right side actions */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                            {isLoading && term && (
                                <div className="animate-spin">
                                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                                </div>
                            )}
                            {term && (
                                <button
                                    type="button"
                                    onClick={clearInput}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                                    title="Clear search"
                                >
                                    <XIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!term.trim()}
                                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Search"
                            >
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Suggestions dropdown */}
                {isOpen && (suggestions.length > 0 || isLoading) && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slideDownFast backdrop-blur-sm"
                    >
                        {isLoading ? (
                            <div className="px-4 py-8 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin">
                                        <SparklesIcon className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Finding suggestions...</p>
                                </div>
                            </div>
                        ) : (
                            <ul className="py-2 max-h-96 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center gap-3 border-l-4 ${
                                            selectedIndex === index
                                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <SearchIcon className="h-4 w-4 flex-shrink-0 opacity-60" />
                                        <span className="flex-1 text-sm font-medium">{suggestion}</span>
                                        {selectedIndex === index && (
                                            <ArrowRightIcon className="h-4 w-4 opacity-60 animate-slideInRight" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {isOpen && !isLoading && suggestions.length === 0 && term.trim() && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slideDownFast"
                    >
                        <div className="px-4 py-8 text-center">
                            <SearchIcon className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions found</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Helper text */}
            {isFocused && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 animate-fadeIn">
                    <p>💡 Use ↑ ↓ to navigate • ↵ to search • ESC to close</p>
                </div>
            )}
        </div>
    );
}
