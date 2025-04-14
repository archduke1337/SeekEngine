import PaginationButtons from "./PaginationButtons";

function SearchResults({ results }) {
    return (
        <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Result count */}
            {results.searchInformation?.formattedTotalResults && (
                <p className="text-sm mb-5 text-gray-600 dark:text-gray-400">
                    About {results.searchInformation.formattedTotalResults} results (
                    {results.searchInformation.formattedSearchTime} seconds)
                </p>
            )}

            {/* Results list */}
            {results.items?.map((result) => (
                <div key={result.link} className="mb-8">
                    <div className="group">
                        <a
                            href={result.link}
                            className="text-sm text-blue-600 hover:underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {result.formattedUrl}
                        </a>

                        <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h2 className="text-xl font-medium text-blue-800 dark:text-blue-400 group-hover:underline truncate">
                                {result.title}
                            </h2>
                        </a>
                    </div>

                    <p className="text-sm line-clamp-4 text-gray-700 dark:text-gray-300 mt-1">
                        {result.snippet}
                    </p>
                </div>
            ))}

            {/* Pagination */}
            <PaginationButtons />
        </div>
    );
}

export default SearchResults;
