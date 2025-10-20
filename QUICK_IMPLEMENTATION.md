# SeekEngine - Quick Implementation Guides

## 🚀 Fast-Track Improvements (Copy-Paste Ready)

These are production-ready code snippets you can use immediately to improve SeekEngine.

---

## 1️⃣ FIX API KEY SECURITY (15 mins)

### Create `.env.local`

```bash
# .env.local
# DO NOT COMMIT THIS FILE
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyCYO0EOQ_3rnXQZtHN1fcy7zmx0IVGNAcA
NEXT_PUBLIC_GOOGLE_CX=9743aa5c6199442b9
```

### Update `keys.js`

```javascript
// keys.js
export const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
export const CONTEXT_KEY = process.env.NEXT_PUBLIC_GOOGLE_CX || '';

if (!API_KEY || !CONTEXT_KEY) {
  console.warn('⚠️  Missing environment variables: NEXT_PUBLIC_GOOGLE_API_KEY, NEXT_PUBLIC_GOOGLE_CX');
}
```

### Update `.gitignore`

```bash
# .gitignore
.env.local
.env*.local
keys.js
node_modules/
.next/
out/
build/
*.pem
.DS_Store
```

---

## 2️⃣ ADD INPUT VALIDATION (30 mins)

### Create `utils/validation.js`

```javascript
// utils/validation.js
/**
 * Validates search term input
 * @param {string} term - The search term
 * @returns {string} Validated and sanitized term
 * @throws {Error} If validation fails
 */
export const validateSearchTerm = (term) => {
  // Type check
  if (!term || typeof term !== 'string') {
    throw new Error('Search term must be a non-empty string');
  }

  const trimmed = term.trim();

  // Length check
  if (trimmed.length === 0) {
    throw new Error('Search term cannot be empty');
  }

  if (trimmed.length > 2000) {
    throw new Error('Search term cannot exceed 2000 characters');
  }

  // SQL Injection protection - remove dangerous characters
  // Allow: alphanumeric, spaces, hyphens, periods, quotes, ampersand, parentheses
  const sanitized = trimmed.replace(/[^\w\s\-."'&()]/g, '');

  return sanitized;
};

/**
 * Validates search type
 * @param {string} type - The search type
 * @returns {string} Validated search type
 * @throws {Error} If validation fails
 */
export const validateSearchType = (type) => {
  const validTypes = ['all', 'image', 'video', 'news'];

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid search type. Must be one of: ${validTypes.join(', ')}`);
  }

  return type;
};

/**
 * Validates pagination start parameter
 * @param {string|number} start - The start parameter
 * @returns {number} Validated start parameter
 * @throws {Error} If validation fails
 */
export const validatePaginationStart = (start) => {
  const parsed = parseInt(start, 10);

  if (isNaN(parsed) || parsed < 1) {
    throw new Error('Start parameter must be a positive integer');
  }

  if (parsed > 1000) {
    throw new Error('Start parameter cannot exceed 1000');
  }

  return parsed;
};
```

### Update `pages/api/search.js`

```javascript
// pages/api/search.js
import { API_KEY, CONTEXT_KEY } from '../../keys';
import { validateSearchTerm, validateSearchType, validatePaginationStart } from '../../utils/validation';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export default async function handler(req, res) {
  // Method check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term, start = '1', searchType = 'all' } = req.query;

  try {
    // Validate inputs
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

    // Call Google API
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CONTEXT_KEY}&q=${encodeURIComponent(validTerm)}&start=${validStart}${validType !== 'all' ? `&searchType=${validType}` : ''}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Google API error:', response.status, text);
      return res.status(response.status).json({
        error: 'Search service temporarily unavailable'
      });
    }

    const data = await response.json();

    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Search API Error:', error);

    // Return appropriate error response
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.'
    });
  }
}
```

### Update `pages/index.js`

```javascript
// Add import at top
import { validateSearchTerm } from '../utils/validation';

// Update handleSearch function
const handleSearch = async (e) => {
  e.preventDefault();

  if (!searchInputRef.current) {
    return;
  }

  const term = searchInputRef.current.value.trim();

  try {
    // Validate input
    const validatedTerm = validateSearchTerm(term);
    setError(null);
    setLoading(true);
    const encodedTerm = encodeURIComponent(validatedTerm);
    await router.push(`/search?term=${encodedTerm}`);
  } catch (validationError) {
    setError(validationError.message);
    searchInputRef.current.focus();
    setLoading(false);
  }
};
```

---

## 3️⃣ ADD RATE LIMITING (45 mins)

### Install dependency

```bash
npm install express-rate-limit
# or
yarn add express-rate-limit
```

### Create `middleware/rateLimit.js`

```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

/**
 * Create a rate limiter with custom configuration
 */
export const createLimiter = (
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = 'Too many requests from this IP, please try again later.'
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
    keyGenerator: (req) => {
      // Use X-Forwarded-For header for behind proxy (like Vercel)
      const forwarded = req.headers['x-forwarded-for'];
      return forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: req.rateLimit.resetTime
      });
    }
  });
};

// Pre-configured limiters
export const searchLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes window
  50,              // 50 requests per 15 minutes per IP
  'Too many search requests. Please wait a moment.'
);

export const generalLimiter = createLimiter(
  60 * 1000,       // 1 minute window
  100,             // 100 requests per minute per IP
  'Too many requests. Please try again later.'
);
```

### Update `pages/api/search.js`

```javascript
// pages/api/search.js
import { API_KEY, CONTEXT_KEY } from '../../keys';
import { validateSearchTerm, validateSearchType, validatePaginationStart } from '../../utils/validation';
import { searchLimiter } from '../../middleware/rateLimit';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export default async function handler(req, res) {
  // Apply rate limiting FIRST
  await new Promise((resolve, reject) => {
    searchLimiter(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  }).catch((err) => {
    // Rate limit error already handled by searchLimiter
    return;
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term, start = '1', searchType = 'all' } = req.query;

  try {
    // Validate inputs
    const validTerm = validateSearchTerm(term);
    const validType = validateSearchType(searchType);
    const validStart = validatePaginationStart(start);

    // ... rest of code
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Search failed' });
  }
}
```

---

## 4️⃣ ADD LOADING SKELETON (20 mins)

### Update `components/SearchResults.js`

```javascript
import PaginationButtons from './PaginationButtons';
import { SkeletonLoader } from './LoadingStates';

function SearchResults({ results = {}, isLoading, term }) {
  const hasResults = results?.items && results.items.length > 0;
  const hasSearchInfo = results?.searchInformation;

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading search results</span>

        {/* Result count skeleton */}
        <div className="animate-pulse mb-5">
          <div className="h-4 bg-[var(--surface)] rounded w-64"></div>
        </div>

        {/* Results skeleton */}
        {[...Array(5)].map((_, i) => (
          <SkeletonLoader key={i} type="search-result" />
        ))}
      </div>
    );
  }

  if (!results || !hasResults) {
    return (
      <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52">
        <div className="card text-center p-8">
          <p className="text-[var(--text-secondary)]">
            {term
              ? 'No results found. Try a different search term.'
              : 'No results available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-3 sm:pl-[5%] md:pl-[14%] lg:pl-52">
      {hasSearchInfo && (
        <p className="text-sm mb-5 text-[var(--text-secondary)]" aria-live="polite">
          About {results.searchInformation.formattedTotalResults || '0'} results
          {results.searchInformation.formattedSearchTime &&
            ` (${results.searchInformation.formattedSearchTime} seconds)`}
        </p>
      )}

      {hasResults && (
        <ul className="space-y-8" role="list">
          {/* Results items... */}
        </ul>
      )}

      {/* Pagination */}
      <PaginationButtons />
    </div>
  );
}

export default SearchResults;
```

---

## 5️⃣ ADD ERROR BOUNDARY (25 mins)

### Create Enhanced `components/ErrorBoundary.js`

```javascript
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Optional: Send to error tracking service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--primary-bg)] px-4">
          <div className="card p-8 max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-[var(--text-secondary)] mb-4">
              We encountered an unexpected error. Please try refreshing the page or contact support
              if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                <summary className="font-semibold cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 btn bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
              >
                Go Home
              </button>
              <button
                onClick={this.resetError}
                className="flex-1 btn border border-[var(--border)] text-[var(--text-primary)]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 6️⃣ ADD ENVIRONMENT VALIDATION (10 mins)

### Create `utils/env.js`

```javascript
// utils/env.js
/**
 * Validate required environment variables at startup
 */
export const validateEnvironment = () => {
  const required = [
    'NEXT_PUBLIC_GOOGLE_API_KEY',
    'NEXT_PUBLIC_GOOGLE_CX'
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.error(
      '❌ Missing environment variables:',
      missing.join(', '),
      '\nPlease check your .env.local file'
    );

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  } else {
    console.log('✅ Environment variables validated successfully');
  }
};
```

### Update `pages/_app.js`

```javascript
import { useEffect } from 'react';
import '../styles/globals.css';
import ThemeProvider from '../components/ThemeProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import { validateEnvironment } from '../utils/env';

// Validate environment at app startup
if (typeof window === 'undefined') {
  validateEnvironment();
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
```

---

## 7️⃣ ADD SEARCH HISTORY (30 mins)

### Create `hooks/useSearchHistory.js`

```javascript
// hooks/useSearchHistory.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'seekengine_search_history';
const MAX_HISTORY = 10;

export const useSearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage when history changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  }, [history, isLoaded]);

  const addToHistory = (term) => {
    if (!term || term.trim().length === 0) return;

    const trimmed = term.trim();
    setHistory((prev) => {
      // Remove duplicate if it exists
      const filtered = prev.filter((item) => item !== trimmed);
      // Add to front and limit to MAX_HISTORY
      return [trimmed, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const removeFromHistory = (term) => {
    setHistory((prev) => prev.filter((item) => item !== term));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isLoaded
  };
};
```

### Update `components/SearchInput.js`

```javascript
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function SearchInput({ defaultValue = '', onSearch }) {
  const [value, setValue] = useState(defaultValue);
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory } = useSearchHistory();
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      addToHistory(value.trim());
      onSearch(value.trim());
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (term) => {
    setValue(term);
    onSearch(term);
    setShowHistory(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="Search..."
          className="w-full bg-transparent outline-none text-[var(--text-primary)]"
        />

        {/* Search history dropdown */}
        {showHistory && history.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs text-[var(--text-secondary)] px-2 py-1">Recent Searches</p>
              {history.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleHistoryClick(term)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[var(--surface-lighter)] transition-colors text-sm text-[var(--text-primary)]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchInput;
```

---

## 📋 Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `.env.local` | **CREATE** - Add API keys | 🔒 Security |
| `keys.js` | Update to use env vars | 🔒 Security |
| `.gitignore` | Add env files | 🔒 Security |
| `utils/validation.js` | **CREATE** - Input validation | ✅ Stability |
| `pages/api/search.js` | Add validation & rate limiting | ✅ Stability |
| `middleware/rateLimit.js` | **CREATE** - Rate limiter | ✅ Performance |
| `utils/env.js` | **CREATE** - Environment validation | ✅ Debugging |
| `hooks/useSearchHistory.js` | **CREATE** - Search history | 🎁 Feature |
| `components/SearchInput.js` | Update with history UI | 🎁 Feature |
| `components/ErrorBoundary.js` | Enhanced error display | ✅ UX |

---

## ✅ Testing Your Changes

```bash
# 1. Create .env.local and verify app starts
npm run dev

# 2. Test validation
# - Try empty search
# - Try very long search (>2000 chars)
# - Try special characters

# 3. Test rate limiting
# - Make rapid requests
# - Should see 429 errors after limit

# 4. Test search history
# - Search for multiple terms
# - Refresh page
# - History should persist

# 5. Build for production
npm run build
npm start
```

---

## 🔗 Resources

- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
- [express-rate-limit docs](https://github.com/nfriedly/express-rate-limit)
- [Error Boundaries in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Input Validation Best Practices](https://owasp.org/www-community/attacks/xss/)

---

*Ready to implement? Start with Step 1 (API Keys) - it takes just 15 minutes!*
