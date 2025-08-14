import { API_KEY, CONTEXT_KEY } from "../../keys";

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { term, start = "1" } = req.query;

    if (!term) {
        return res.status(400).json({ error: "Search term is required" });
    }

    // Create cache key
    const cacheKey = `${term}-${start}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.status(200).json(cached.data);
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(term)}&start=${start}`
        );
        
        const data = await response.json();

        if (!response.ok) {
            let error = "Failed to fetch search results";
            if (response.status === 429) {
                error = "Rate limit exceeded. Please try again later.";
            }
            throw new Error(error);
        }

        // Update cache
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data
        });

        res.status(200).json(data);
    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({
            error: error.message || "Failed to fetch search results"
        });
    }
}
