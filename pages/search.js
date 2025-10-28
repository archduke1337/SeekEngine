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

function Search({ initialResults, canonicalUrl, totalResults }) {
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
        <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            <Head>
                <title>{term ? `${term} - SeekEngine` : "SeekEngine"}</title>
                <meta name="description" content={term ? `Search results for ${term}. Find websites, images, videos and news related to ${term}.` : "SeekEngine - Fast, modern search experience"} />
                <meta name="robots" content="index, follow" />
                <link rel="icon" href="/favicon.ico" />
                {/* Open Graph */}
                <meta property="og:title" content={term ? `${term} - SeekEngine` : "SeekEngine"} />
                <meta property="og:description" content={term ? `Search results for ${term}` : "SeekEngine - Fast, modern search experience"} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl || ''} />
                {/* Twitter */}
                <meta name="twitter:card" content="summary" />

                {/* canonical */}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                {/* rel prev/next for pagination (sensible when start index present) */}
                {typeof router.query.start !== 'undefined' && (() => {
                    const start = Number(router.query.start || 1);
                    const prev = start > 1 ? start - 10 : null;
                    const next = start + 10;
                    return (
                        <>
                            {prev !== null && <link rel="prev" href={`${canonicalUrl?.split('?')[0]}?term=${encodeURIComponent(term)}&start=${prev}${type && type !== 'all' ? `&type=${type}` : ''}`} />}
                            <link rel="next" href={`${canonicalUrl?.split('?')[0]}?term=${encodeURIComponent(term)}&start=${next}${type && type !== 'all' ? `&type=${type}` : ''}`} />
                        </>
                    );
                })()}

                {/* JSON-LD WebSite SearchAction to help search engines understand site search */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "url": canonicalUrl || '',
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": `${canonicalUrl?.split('?')[0]}?term={search_term_string}`,
                        "query-input": "required name=search_term_string"
                    }
                }) }} />
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
                    <SearchResults results={results} isLoading={isLoading} term={term} />
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

    // Build canonical absolute URL
    const host = context.req.headers.host || 'localhost:3000';
    const proto = context.req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${proto}://${host}`;
    const canonicalUrl = `${baseUrl}/search?term=${encodeURIComponent(term)}${startIndex ? `&start=${startIndex}` : ''}${type && type !== 'all' ? `&type=${type}` : ''}`;

    if (!term) {
        return {
            props: {
                initialResults: { error: "No search term provided." },
                canonicalUrl,
                totalResults: 0
            },
        };
    }

    try {
        const searchType = type === 'all' ? '' : `&searchType=${type === 'image' ? 'image' : 'web'}`;
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(term)}&start=${startIndex}${searchType}`
        );
        const data = await response.json();

        const totalResults = data?.searchInformation?.totalResults || 0;

        return {
            props: {
                initialResults: data,
                canonicalUrl,
                totalResults
            },
        };
    } catch (error) {
        console.error("Search API Error:", error);

        return {
            props: {
                initialResults: { error: "Failed to fetch search results." },
                canonicalUrl,
                totalResults: 0
            },
        };
    }
}
