import PaginationButtons from "./PaginationButtons";
import { SkeletonLoader } from "./LoadingStates";

function SearchResults({ results = {}, isLoading, term }) {
    const hasResults = results?.items && results.items.length > 0;
    const hasSearchInfo = results?.searchInformation;

    if (isLoading) {
        return (
            <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52" role="status" aria-live="polite">
                <span className="sr-only">Loading search results</span>
                <div className="animate-pulse mb-5">
                    <div className="h-4 bg-[var(--surface)] rounded w-64"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <SkeletonLoader key={i} type="search-result" />
                ))}
            </div>
        );
    }

    if (!results) {
        return (
            <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52">
                <div className="card text-center p-8">
                    <p className="text-[var(--text-secondary)]">
                        No results available. Please try your search again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52">
            {/* Result count - polite so screen readers are informed */}
            {hasSearchInfo && (
                <p className="text-sm mb-5 text-[var(--text-secondary)]" aria-live="polite">
                    About {results.searchInformation.formattedTotalResults || '0'} results
                    {results.searchInformation.formattedSearchTime &&
                        ` (${results.searchInformation.formattedSearchTime} seconds)`
                    }
                </p>
            )}

            {/* Results list - semantic markup for better accessibility */}
            {hasResults ? (
                <ul className="space-y-8" role="list">
                    {results.items.map((result, index) => {
                        const key = result.cacheId || result.link || result.title;

                        // Safe hostname extraction
                        let hostname = '';
                        try {
                            if (result.link) {
                                hostname = new URL(result.link).hostname.replace(/^www\./i, '');
                            }
                        } catch (e) {
                            hostname = '';
                        }

                        // Try common thumbnail locations returned by Google CSE
                        const thumbnail = result.pagemap?.cse_thumbnail?.[0]?.src
                            || result.pagemap?.cse_image?.[0]?.src
                            || result.image?.thumbnailLink
                            || null;

                        return (
                            <li 
                              key={key} 
                              className="card hover:shadow-xl motion-reduce:transform-none transition-all duration-300 hover:scale-[1.02] animate-slideInUp"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex gap-4">
                                    {thumbnail && (
                                        <a href={result.link} target="_blank" rel="noopener noreferrer" aria-hidden="true" className="flex-shrink-0 overflow-hidden rounded-md">
                                            <img
                                                src={thumbnail}
                                                alt={`Thumbnail for ${result.title}`}
                                                loading="lazy"
                                                className="w-28 h-20 object-cover rounded-md transition-transform duration-300 hover:scale-110"
                                            />
                                        </a>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between">
                                            <a
                                                href={result.link}
                                                className="text-sm text-[var(--secondary)] hover:text-[var(--primary)] transition-colors duration-200 break-all"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Open ${result.title}${hostname ? ` on ${hostname}` : ''}`}
                                            >
                                                {result.formattedUrl}
                                            </a>

                                            {hostname && (
                                                <span className="text-xs text-[var(--text-secondary)] ml-2">{hostname}</span>
                                            )}
                                        </div>

                                        <a href={result.link} target="_blank" rel="noopener noreferrer" className="block mt-2" aria-label={`Open ${result.title}${hostname ? ` on ${hostname}` : ''}`}>
                                            <h2 className="text-xl font-medium text-[var(--primary)] hover:text-[var(--secondary)] transition-colors duration-200">
                                                {result.title}
                                            </h2>
                                        </a>

                                        {result.snippet && (
                                            <p className="text-sm line-clamp-4 text-[var(--text-secondary)] mt-3">
                                                {result.snippet}
                                            </p>
                                        )}

                                        {/* Optional metadata row: cached/visited hints could be added here */}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="card text-center p-8">
                    <p className="text-[var(--text-secondary)]">
                        No results found. Try adjusting your search terms.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {hasResults && <PaginationButtons />}
        </div>
    );
}

export default SearchResults;
