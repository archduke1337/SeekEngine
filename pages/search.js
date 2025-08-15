import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchResults from "../components/SearchResults";
import { useRouter } from "next/router";
import { API_KEY, CONTEXT_KEY } from "../keys";
import { useApiError } from "../hooks/useSearch";
import { LoadingSpinner } from "../components/LoadingStates";
import ErrorBoundary from "../components/ErrorBoundary";

function Search({ initialResults }) {
    const router = useRouter();
    const { term, type = 'all' } = router.query;
    const [results, setResults] = useState(initialResults);
    const { error, isLoading, setIsLoading, handleError, clearError } = useApiError();

    useEffect(() => {
        if (!term) return;

        const fetchResults = async () => {
            setIsLoading(true);
            clearError();

            try {
                const response = await fetch(
                    `/api/search?term=${encodeURIComponent(term)}&start=${router.query.start || "1"}&type=${type}`
                );

                if (!response.ok) {
                    const text = await response.text();
                    let errMsg = `Search endpoint returned ${response.status}`;
                    try {
                        const parsed = JSON.parse(text);
                        errMsg = parsed.error || parsed.message || errMsg;
                    } catch (_) {
                        errMsg = text || errMsg;
                    }
                    throw new Error(errMsg);
                }

                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                let data;
                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (parseErr) {
                        console.warn('Search response not JSON, using empty results fallback:', text);
                        data = {};
                    }
                }

                setResults(data);
            } catch (error) {
                handleError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [term, type, router.query.start]);

    const noResults = !error && results?.items?.length === 0;

    return (
        <div className="min-h-screen flex flex-col justify-between bg-[var(--primary-bg)]">
            <Head>
                <title>{term ? `${term} - SeekEngine` : "SeekEngine"}</title>
                <meta name="description" content={`Search results for ${term || "your query"}`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main className="flex-grow px-4 pt-6 max-w-4xl mx-auto w-full">
                {error ? (
                    <div className="card text-center p-8">
                        <h2 className="text-xl font-bold text-[var(--error)] mb-4">{error.title}</h2>
                        <p className="text-[var(--text-secondary)] mb-6">{error.message}</p>
                        <button
                            onClick={() => {
                                clearError();
                                router.reload();
                            }}
                            className="btn bg-[var(--primary)] text-white hover:bg-[var(--secondary)]"
                        >
                            Try Again
                        </button>
                    </div>
                ) : noResults ? (
                    <div className="card text-center p-8">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">No Results Found</h2>
                        <p className="text-[var(--text-secondary)]">
                            No results found for "<strong>{term}</strong>". Try different keywords or check your spelling.
                        </p>
                    </div>
                ) : (
                    <SearchResults results={results} isLoading={isLoading} />
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Search;

export async function getServerSideProps(context) {
    const startIndex = context.query.start || "1";
    const term = context.query.term || "";
    const type = context.query.type || "all";

    if (!term) {
        return {
            props: {
                results: { error: "No search term provided." },
            },
        };
    }

    try {
        const searchType = type === 'all' ? '' : `&searchType=${type === 'image' ? 'image' : 'web'}`;
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(term)}&start=${startIndex}${searchType}`
        );
        const data = await response.json();

        return {
            props: {
                results: data,
            },
        };
    } catch (error) {
        console.error("Search API Error:", error);

        return {
            props: {
                results: { error: "Failed to fetch search results." },
            },
        };
    }
}
