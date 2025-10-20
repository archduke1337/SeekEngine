import { API_KEY, CONTEXT_KEY } from "../../keys";
import { validateSearchTerm, validateSearchType, validatePaginationStart } from "../../utils/validation";
import { searchLimiter } from "../../middleware/rateLimit";

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
    // Apply rate limiting FIRST
    await new Promise((resolve, reject) => {
        searchLimiter(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    }).catch(() => {
        // Rate limit error already handled by searchLimiter
        return;
    });

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { term, start = "1", searchType = "all" } = req.query;

    try {
        // Validate all inputs
        const validTerm = validateSearchTerm(term);
        const validType = validateSearchType(searchType);
        const validStart = validatePaginationStart(start);

        // Create cache key
        const cacheKey = `${validTerm}-${validStart}`;

        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.status(200).json(cached.data);
        }

        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(validTerm)}&start=${validStart}${validType !== 'all' ? `&searchType=${validType}` : ''}`
        );
        
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        let data;

        if (!response.ok) {
            // Try to read body for diagnostics
            const text = await response.text();
            console.error('Google API returned non-OK status', response.status, text);
            return res.status(response.status).json({ error: text || 'External search API error' });
        }

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.warn('Google search returned non-JSON response, returning empty result set');
                data = { items: [], searchInformation: {} };
            }
        }

        // Update cache
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data
        });

        res.status(200).json(data);
    } catch (error) {
        console.error("Search API Error:", error);
        
        // Return appropriate error response based on error type
        if (error.message.includes('Search term') || error.message.includes('Invalid') || error.message.includes('Start')) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: error.message || "Failed to fetch search results"
        });
    }
}
