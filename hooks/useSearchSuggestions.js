import { useState, useEffect, useCallback } from 'react';

export function useSearchSuggestions(term, delay = 300) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedFetch = useCallback(
        debounce(async (searchTerm) => {
            if (!searchTerm) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/suggestions?term=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, delay),
        []
    );

    useEffect(() => {
        debouncedFetch(term);
        return () => debouncedFetch.cancel();
    }, [term, debouncedFetch]);

    return { suggestions, isLoading };
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    const debounced = function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
}
