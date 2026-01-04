# SeekEngine

An AI-enhanced search engine with a minimalist design and dark/light mode support.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_APP_NAME=SeekEngine

# Google Custom Search
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_google_search_engine_id_here

# OpenRouter AI API
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Get API Keys

**Google Custom Search:**
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Custom Search API
4. Create API credentials (API Key)
5. Set up a Custom Search Engine at [cse.google.com](https://cse.google.com)
6. Copy your CX (Search Engine ID)

**OpenRouter:**
1. Visit [OpenRouter](https://openrouter.ai)
2. Sign up for a free account
3. Go to Keys section and create an API key

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Features

- 🎨 Ultra-minimalist design with dark/light mode
- 🔍 Real-time AI-powered search suggestions
- 📊 AI-generated summaries with traditional web results
- ⚡ Server-side API integration for security
- 📱 Mobile-first responsive design
- ♿ Accessible (ARIA labels, keyboard navigation)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Homepage
│   ├── results/
│   │   └── page.tsx        # Results page
│   └── api/
│       └── ai/
│           ├── suggest.ts  # AI suggestions endpoint
│           └── answer.ts   # AI answer endpoint
├── components/
│   ├── ThemeToggle.tsx     # Theme switcher
│   ├── SearchBar.tsx       # Search input with suggestions
│   ├── ResultCard.tsx      # Individual result display
│   └── Skeleton.tsx        # Loading skeleton
├── hooks/
│   ├── useDebounce.ts      # Debounce hook
│   └── useSearch.ts        # Search logic hook
├── lib/
│   ├── google-search.ts    # Google Custom Search integration
│   └── openrouter.ts       # OpenRouter AI integration
└── globals.css             # Global styles
```
