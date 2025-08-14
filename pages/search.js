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
    const { term } = router.query;
    const [results, setResults] = useState(initialResults);
    const { error, isLoading, setIsLoading, handleError, clearError } = useApiError();

    useEffect(() => {
        if (!term) return;

        const fetchResults = async () => {
            setIsLoading(true);
            clearError();

            try {
                const response = await fetch(
                    `/api/search?term=${encodeURIComponent(term)}&start=${router.query.start || "1"}`
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch search results");
                }

                setResults(data);
            } catch (error) {
                handleError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [term, router.query.start]);

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

    if (!term) {
        return {
            props: {
                results: { error: "No search term provided." },
            },
        };
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(term)}&start=${startIndex}`
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
