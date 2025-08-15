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

                // If response isn't OK, read text for diagnostics and exit gracefully
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Suggestions endpoint returned an error:', response.status, text);
                    setSuggestions([]);
                    return;
                }

                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                let data;

                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    // Fallback: try to parse as JSON, otherwise treat as empty suggestions
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (parseErr) {
                        console.warn('Suggestions response not JSON, fallback to empty suggestions:', text);
                        data = { suggestions: [] };
                    }
                }

                setSuggestions(data?.suggestions || []);
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
