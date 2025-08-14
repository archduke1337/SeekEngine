import PaginationButtons from "./PaginationButtons";
import { SkeletonLoader } from "./LoadingStates";

function SearchResults({ results = {}, isLoading }) {
    const hasResults = results?.items && results.items.length > 0;
    const hasSearchInfo = results?.searchInformation;

    if (isLoading) {
        return (
            <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52">
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
            {/* Result count */}
            {hasSearchInfo && (
                <p className="text-sm mb-5 text-[var(--text-secondary)]">
                    About {results.searchInformation.formattedTotalResults || '0'} results
                    {results.searchInformation.formattedSearchTime && 
                        ` (${results.searchInformation.formattedSearchTime} seconds)`
                    }
                </p>
            )}

            {/* Results list */}
            {hasResults ? (
                <div className="space-y-8">
                    {results.items.map((result) => (
                        <div key={result.link} className="card hover:scale-[1.02] transition-all duration-300">
                            <div className="group">
                                <a
                                    href={result.link}
                                    className="text-sm text-[var(--secondary)] hover:text-[var(--primary)] transition-colors duration-200 break-all"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {result.formattedUrl}
                                </a>

                                <a
                                    href={result.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-2"
                                >
                                    <h2 className="text-xl font-medium text-[var(--primary)] group-hover:text-[var(--secondary)] transition-colors duration-200">
                                        {result.title}
                                    </h2>
                                </a>
                            </div>

                            {result.snippet && (
                                <p className="text-sm line-clamp-4 text-[var(--text-secondary)] mt-3">
                                    {result.snippet}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
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
