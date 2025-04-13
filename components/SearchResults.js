import PaginationButtons from "./PaginationButtons";

function SearchResults({ results }) {
    return (
        <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52 dark:bg-gray-900">
            {/* Empty div to maintain layout spacing */}
            <div className="dark:bg-gray-900">‏‏‎ ‎</div>

            <p className="text-gray-600 text-md mb-5 dark:text-gray-400">
                {results.searchInformation?.formattedTotalResults} results
            </p>

            {results.items?.map((result) => (
                <div key={result.link} className="mb-8 dark:text-gray-400">
                    <div className="group">
                        {/* URL */}
                        <a href={result.link} className="text-sm text-gray-500 hover:underline">
                            {result.formattedUrl}
                        </a>
                        <a href={result.link}>
                            {/* Title */}
                            <h2 className="truncate text-xl text-blue-800 font-medium group-hover:underline dark:text-gray-200">
                                {result.title}
                            </h2>
                        </a>
                    </div>
                    {/* Snippet */}
                    <p className="line-clamp-4">{result.snippet}</p>
                </div>
            ))}

            {/* Pagination */}
            <PaginationButtons />
        </div>
    );
}

export default SearchResults;
