export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { term } = req.query;

    if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    try {
        const response = await fetch(
            `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(term)}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        const suggestions = data[1].slice(0, 5); // Get top 5 suggestions

        res.status(200).json({ suggestions });
    } catch (error) {
        console.error('Suggestions API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch suggestions'
        });
    }
}
