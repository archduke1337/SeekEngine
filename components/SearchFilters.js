import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
    GlobeAltIcon,
    PhotographIcon,
    PlayIcon,
    NewspaperIcon
} from '@heroicons/react/24/outline';

const SEARCH_TYPES = [
    { id: 'all', label: 'All', icon: GlobeAltIcon },
    { id: 'image', label: 'Images', icon: PhotographIcon },
    { id: 'video', label: 'Videos', icon: PlayIcon },
    { id: 'news', label: 'News', icon: NewspaperIcon },
];

export default function SearchFilters({ activeType = 'all', onTypeChange }) {
    const router = useRouter();
    
    const handleTypeChange = (type) => {
        onTypeChange?.(type);
        const currentQuery = { ...router.query, searchType: type };
        if (type === 'all') delete currentQuery.searchType;
        router.push({
            pathname: router.pathname,
            query: currentQuery,
        }, undefined, { shallow: true });
    };

    return (
        <div className="flex items-center justify-center space-x-4 p-4 overflow-x-auto scrollbar-hide">
            {SEARCH_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => handleTypeChange(id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeType === id
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                    }`}
                    aria-label={`Filter by ${label}`}
                    role="tab"
                    aria-selected={activeType === id}
                >
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="whitespace-nowrap">{label}</span>
                </button>
            ))}
        </div>
    );
}
