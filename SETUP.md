# SeekEngine - Setup & Deployment Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- `next@14.0.0+` - React framework with App Router
- `react@18.2.0+` - UI library
- `typescript@5.3.0+` - Type safety
- `tailwindcss@3.4.0+` - Styling
- `next-themes@0.2.1` - Dark/light mode
- `axios@1.6.0+` - HTTP requests
- `react-markdown@9.0.0` - Markdown rendering

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your API keys:

```env
NEXT_PUBLIC_APP_NAME=SeekEngine
GOOGLE_API_KEY=your_key_here
GOOGLE_CX=your_cx_here
OPENROUTER_API_KEY=your_key_here
```

#### Getting API Keys:

**Google Custom Search API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable "Custom Search API"
4. Create credentials (API Key type)
5. Go to [Google Custom Search Engine](https://cse.google.com)
6. Create a new search engine (configure to search the entire web)
7. Copy your search engine ID (CX value)

**OpenRouter API (Free Tier):**
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for free account
3. Go to "Keys" or "API Key" section
4. Create new API key
5. Copy the key to your `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
seekengine/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with theme provider
│   │   ├── page.tsx                # Homepage (centered search)
│   │   ├── globals.css             # Global styles
│   │   ├── results/
│   │   │   └── page.tsx            # Results page (AI + web results)
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── suggest/
│   │       │   │   └── route.ts    # AI suggestions endpoint
│   │       │   └── answer/
│   │       │       └── route.ts    # AI answer endpoint
│   │       └── search/
│   │           └── route.ts        # Google search results endpoint
│   ├── components/
│   │   ├── ThemeToggle.tsx         # Dark/light mode switcher
│   │   ├── SearchBar.tsx           # Search input with suggestions
│   │   ├── ResultCard.tsx          # Individual result display
│   │   └── Skeleton.tsx            # Loading placeholders
│   ├── hooks/
│   │   └── useDebounce.ts          # Debounce hook for typing
│   └── lib/
│       ├── openrouter.ts           # OpenRouter AI integration
│       └── google-search.ts        # Google Custom Search integration
├── public/                         # Static assets (if needed)
├── .env.local                      # Environment variables (not in git)
├── .env.local.example              # Template for env vars
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                        # Documentation
```

## Features Implemented

### ✅ Design & Theme
- Ultra-minimalist aesthetic with generous whitespace
- Clean, neutral color palette (grays, white/black)
- Indigo accent color (indigo-500)
- Full dark/light mode support
- Persistent theme preference (localStorage via next-themes)
- Theme toggle button in header

### ✅ Core Search Functionality
- **Homepage:** Centered search bar with "Search anything..." placeholder
- **Real-time Suggestions:** AI-powered suggestions via OpenRouter as you type
- **Results Page:**
  - AI-generated summary/answer (2-4 paragraphs, markdown support)
  - Traditional Google Custom Search results below
  - Clear visual separation between AI and web results
  - Optional follow-up questions to refine search

### ✅ API Integration
- **Server-side only** for security (API keys never exposed to browser)
- **OpenRouter Integration:**
  - `/api/ai/suggest?q=...` returns array of 5-7 suggestions
  - `/api/ai/answer?q=...` returns AI summary text
  - Uses free-tier models (mistral-7b-instruct:free)
- **Google Custom Search Integration:**
  - `/api/search?q=...` returns traditional web results
  - Includes title, snippet, link, and domain

### ✅ Technical Standards
- Server components by default, client components only where needed
- Debounced typing for suggestions (500ms delay)
- Loading skeletons during data fetch
- Error handling and user feedback
- Mobile-first responsive design
- Accessibility (ARIA labels, keyboard navigation, proper semantics)
- Fast and lightweight

## Usage Examples

### Basic Search
1. Go to homepage
2. Type a search query
3. See AI suggestions in dropdown
4. Press Enter or click a suggestion
5. View AI answer + web results

### Follow-up Questions
1. After getting results, use "Refine your search" input
2. Type a follow-up question
3. Press Enter or click "Ask" button
4. Results update with new search

## Customization

### Change Accent Color
Edit `src/globals.css` and `src/components/SearchBar.tsx` to replace `indigo-500` with any Tailwind color:
```css
focus:ring-indigo-500 /* change 'indigo' to desired color */
```

### Change Default Theme
In `src/app/layout.tsx`, modify `ThemeProvider`:
```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
```

### Adjust Debounce Delay
In `src/components/SearchBar.tsx`:
```tsx
const debouncedQuery = useDebounce(query, 300) // change 500 to desired ms
```

## Performance Notes

- Search suggestions debounce prevents excessive API calls
- Server-side API routes hide keys and handle caching
- Images use next/image for optimization (if added)
- CSS is optimized via Tailwind purging
- Lightweight fonts (system fonts only)

## Troubleshooting

### "API Key Error" when searching
- Check `.env.local` file exists in project root
- Verify API keys are correct (no extra spaces)
- Restart dev server after updating `.env.local`

### Suggestions not appearing
- Ensure query is at least 2 characters
- Check browser console for error messages
- Verify OpenRouter API key is valid

### No web results
- Check Google API key and CX are correct
- Verify Google Custom Search is enabled
- Check that you've created a search engine at cse.google.com

### Dark mode not working
- Browser should load system preference or saved preference
- Check localStorage in browser DevTools for `theme` key
- Hard refresh (Ctrl+Shift+R) may help

## Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables in project settings
5. Deploy

### Other Platforms
Build and run:
```bash
npm run build
npm start
```

Then deploy the `.next` folder with your platform's instructions.

## Security Notes

- ✅ All API calls are server-side only
- ✅ API keys are never exposed to client
- ✅ Environment variables using OPENROUTER_API_KEY (no NEXT_PUBLIC_ prefix)
- ✅ CORS is handled by Next.js API routes
- ✅ User queries are not logged or tracked

## Support & Customization

- **Add analytics:** Integrate Vercel Analytics or your preferred provider
- **Add authentication:** Use NextAuth.js for user accounts
- **Cache results:** Add Redis or MongoDB for result caching
- **Webhooks:** Integrate with external services via API routes
- **Styling:** All classes are in `src/globals.css` and component files

---

**Built with Next.js 14, TypeScript, Tailwind CSS, and OpenRouter AI**
