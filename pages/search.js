import Head from "next/head";
import Header from "../components/Header";
import { API_KEY, CONTEXT_KEY } from "../keys";
import Response from "../Response";
import { useRouter } from "next/router";
import SearchResults from "../components/SearchResults";

function Search({ results }) {
    const router = useRouter();
    const { term } = router.query;

    return (
        <div>
            <Head>
                <title>{term ? `${term} - SeekEngine` : "SeekEngine"}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />
            {/* Search Results */}
            <SearchResults results={results} />
        </div>
    );
}

export default Search;

export async function getServerSideProps(context) {
    const useDummyData = false; // Toggle for local testing
    const startIndex = context.query.start || "0";
    const { term } = context.query;

    // Early exit if no term is provided
    if (!term) {
        return {
            props: {
                results: { error: "No search term provided." },
            },
        };
    }

    try {
        const data = useDummyData
            ? Response
            : await fetch(
                  `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${term}&start=${startIndex}`
              ).then((res) => res.json());

        return {
            props: {
                results: data,
            },
        };
    } catch (error) {
        console.error("Search API error:", error);

        return {
            props: {
                results: { error: "Failed to fetch search results." },
            },
        };
    }
}
