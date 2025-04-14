import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchResults from "../components/SearchResults";
import { useRouter } from "next/router";
import { API_KEY, CONTEXT_KEY } from "../keys";

function Search({ results }) {
    const router = useRouter();
    const { term } = router.query;

    const hasError = results?.error;
    const noResults = results?.items?.length === 0;

    return (
        <div className="min-h-screen flex flex-col justify-between dark:bg-gray-900 text-white">
            <Head>
                <title>{term ? `${term} - SeekEngine` : "SeekEngine"}</title>
                <meta name="description" content={`Search results for ${term || "your query"}`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main className="flex-grow px-4 pt-6 max-w-4xl mx-auto w-full">
                {hasError ? (
                    <p className="text-red-400 text-center text-lg">
                        {results.error}
                    </p>
                ) : noResults ? (
                    <p className="text-center text-lg">
                        No results found for "<strong>{term}</strong>"
                    </p>
                ) : (
                    <SearchResults results={results} />
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
