import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { SearchIcon, XCircleIcon } from '@heroicons/react/outline';

export default function SearchInput({ defaultValue = '', onSearch }) {
    const router = useRouter();
    const [term, setTerm] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const { suggestions, isLoading } = useSearchSuggestions(term);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!term.trim()) return;
        
        setIsOpen(false);
        onSearch?.(term);
        router.push(`/search?term=${encodeURIComponent(term)}`);
    };

    const handleSuggestionClick = (suggestion) => {
        setTerm(suggestion);
        setIsOpen(false);
        onSearch?.(suggestion);
        router.push(`/search?term=${encodeURIComponent(suggestion)}`);
    };

    return (
        <div className="relative max-w-md w-full">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={(e) => {
                        setTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full p-3 pl-10 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white dark:bg-gray-800"
                    placeholder="Search..."
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {term && (
                    <button
                        type="button"
                        onClick={() => {
                            setTerm('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </form>

            {isOpen && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                    <ul className="py-2">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            >
                                <SearchIcon className="inline h-4 w-4 mr-2 text-gray-400" />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
