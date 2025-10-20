# SeekEngine - Improvement Roadmap

## 🎯 Priority Matrix

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  HIGH IMPACT  │  DO FIRST → DO NEXT               │
│  HIGH EFFORT  │  (Critical Security Fixes)        │
│               │                                     │
├─────────────────────────────────────────────────────┤
│  HIGH IMPACT  │  QUICK WINS → BETTER              │
│  LOW EFFORT   │  (Add Tests, TypeScript Setup)    │
│               │                                     │
├─────────────────────────────────────────────────────┤
│  LOW IMPACT   │  SKIP IF BUSY                     │
│  HIGH EFFORT  │                                     │
│               │                                     │
├─────────────────────────────────────────────────────┤
│  LOW IMPACT   │  NICE TO HAVE                     │
│  LOW EFFORT   │  (Better UX, Polish)              │
│               │                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔴 CRITICAL (DO IMMEDIATELY)

### 1. **Secure API Keys** ⚠️
**Status**: 🔴 CRITICAL SECURITY ISSUE
**Effort**: ⏱️ 15 minutes
**Impact**: 🔥 Prevents credential abuse

#### Problem
API keys are hardcoded in `keys.js` - anyone can see them in git history

#### Solution

**Step 1: Create .env.local**
```bash
# .env.local (DO NOT COMMIT)
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyCYO0EOQ_3rnXQZtHN1fcy7zmx0IVGNAcA
NEXT_PUBLIC_GOOGLE_CX=9743aa5c6199442b9
```

**Step 2: Update keys.js**
```javascript
// keys.js - Use environment variables
export const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
export const CONTEXT_KEY = process.env.NEXT_PUBLIC_GOOGLE_CX || '';

if (!API_KEY || !CONTEXT_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_GOOGLE_API_KEY or NEXT_PUBLIC_GOOGLE_CX');
}
```

**Step 3: Update .gitignore**
```bash
# Add to .gitignore
.env.local
.env.*.local
keys.js
```

**Step 4: Clean git history (if already exposed)**
```bash
# WARNING: This rewrites history - communicate with team
git filter-branch --tree-filter 'rm -f keys.js' HEAD
git push origin --force-with-lease
```

**Step 5: Rotate API Keys**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Delete the exposed key
- Create a new API key
- Update .env.local

---

### 2. **Add Input Validation & Sanitization**
**Status**: 🔴 SECURITY RISK
**Effort**: ⏱️ 30 minutes
**Impact**: 🔥 Prevents injection attacks

#### Problem
Search terms are not validated - could allow malicious input

#### Solution

**Step 1: Create validation utility**
```javascript
// utils/validation.js
export const validateSearchTerm = (term) => {
  if (!term || typeof term !== 'string') {
    throw new Error('Search term must be a non-empty string');
  }

  const trimmed = term.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Search term cannot be empty');
  }

  if (trimmed.length > 2000) {
    throw new Error('Search term is too long (max 2000 characters)');
  }

  // Remove potentially dangerous characters
  // Allow: alphanumeric, spaces, common punctuation
  const sanitized = trimmed.replace(/[^\w\s\-."'&()]/g, '');
  
  return sanitized;
};

export const validateSearchType = (type) => {
  const validTypes = ['all', 'image', 'video', 'news'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid search type: ${type}`);
  }
  return type;
};
```

**Step 2: Update API route**
```javascript
// pages/api/search.js
import { validateSearchTerm, validateSearchType } from '../../utils/validation';

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { term, start = "1", searchType = "all" } = req.query;

    try {
      // Validate inputs
      const validTerm = validateSearchTerm(term);
      const validType = validateSearchType(searchType);
      
      // ... rest of code
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
}
```

**Step 3: Update client-side**
```javascript
// pages/index.js & components/Header.js
import { validateSearchTerm } from '../utils/validation';

const handleSearch = async (e) => {
  e.preventDefault();
  
  if (!searchInputRef.current) return;

  const term = searchInputRef.current.value.trim();

  try {
    // Validate before searching
    const validatedTerm = validateSearchTerm(term);
    const encodedTerm = encodeURIComponent(validatedTerm);
    await router.push(`/search?term=${encodedTerm}`);
  } catch (error) {
    setError(error.message);
    searchInputRef.current.focus();
  }
};
```

---

### 3. **Implement Rate Limiting**
**Status**: 🔴 ABUSE RISK
**Effort**: ⏱️ 45 minutes
**Impact**: 🔥 Prevents API quota exhaustion

#### Solution: Use external service or middleware

**Option A: Using `express-rate-limit` (Recommended)**

```bash
npm install express-rate-limit
# or
yarn add express-rate-limit
```

```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const createLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return rateLimit({
    windowMs,           // 15 minutes
    max: maxRequests,   // 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true,  // Return rate limit info in headers
    legacyHeaders: false,   // Disable X-RateLimit headers
    skip: (req) => {
      // Skip rate limiting for certain routes if needed
      return false;
    },
    keyGenerator: (req) => {
      // Use IP address as key
      return req.ip || req.connection.remoteAddress;
    }
  });
};

export const searchLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes
  50               // 50 searches per 15 minutes per IP
);
```

```javascript
// pages/api/search.js
import { searchLimiter } from '../../middleware/rateLimit';

export default async function handler(req, res) {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    searchLimiter(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ... rest of handler
}
```

**Option B: Using Vercel's built-in limits**
```javascript
// Set serverless function timeout and memory
// vercel.json
{
  "functions": {
    "pages/api/**": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

---

## 🟠 HIGH PRIORITY (DO NEXT 2 WEEKS)

### 4. **Add TypeScript**
**Effort**: ⏱️ 2-3 hours
**Impact**: 🚀 Prevents 40% of runtime bugs

#### Step 1: Install TypeScript
```bash
npm install --save-dev typescript @types/react @types/next
# or
yarn add --dev typescript @types/react @types/next
```

#### Step 2: Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["pages", "components", "hooks", "utils"],
  "exclude": ["node_modules"]
}
```

#### Step 3: Convert key files
```typescript
// pages/index.tsx
import { FC, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface HomeProps {}

const Home: FC<HomeProps> = () => {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!searchInputRef.current) return;

    const term = searchInputRef.current.value.trim();

    if (!term) {
      setError('Please enter a search term.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const encodedTerm = encodeURIComponent(term);
      await router.push(`/search?term=${encodedTerm}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Something went wrong. Please try again.');
      searchInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX
  );
};

export default Home;
```

#### Step 4: Add type definitions
```typescript
// types/index.ts
export interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  formattedUrl: string;
  cacheId?: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src: string }>;
    cse_image?: Array<{ src: string }>;
  };
  image?: {
    thumbnailLink: string;
  };
}

export interface SearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    formattedTotalResults: string;
    formattedSearchTime: string;
    totalResults: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export type SearchType = 'all' | 'image' | 'video' | 'news';

export interface ApiError {
  title: string;
  message: string;
  status?: number;
}
```

---

### 5. **Add Testing Suite**
**Effort**: ⏱️ 4-6 hours
**Impact**: 🚀 Catches bugs before production

#### Step 1: Install dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
# or
yarn add --dev jest @testing-library/react @testing-library/jest-dom
```

#### Step 2: Create jest.config.js
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'pages/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

#### Step 3: Create jest.setup.js
```javascript
import '@testing-library/jest-dom';
```

#### Step 4: Write tests
```javascript
// __tests__/hooks/useSearch.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../../hooks/useSearch';

describe('useDebounce', () => {
  test('should debounce value', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    await waitFor(
      () => expect(result.current).toBe('updated'),
      { timeout: 1000 }
    );
  });
});
```

```javascript
// __tests__/components/SearchResults.test.js
import { render, screen } from '@testing-library/react';
import SearchResults from '../../components/SearchResults';

describe('SearchResults', () => {
  test('should display loading skeleton', () => {
    render(<SearchResults isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should display results count', () => {
    const mockResults = {
      items: [{ title: 'Test', link: 'https://test.com', snippet: 'Test' }],
      searchInformation: {
        formattedTotalResults: '1,000',
        formattedSearchTime: '0.5'
      }
    };

    render(<SearchResults results={mockResults} isLoading={false} term="test" />);
    expect(screen.getByText(/About 1,000 results/)).toBeInTheDocument();
  });

  test('should handle empty results', () => {
    render(
      <SearchResults 
        results={{ items: [] }} 
        isLoading={false} 
        term="test" 
      />
    );
    expect(screen.getByText(/No results available/)).toBeInTheDocument();
  });
});
```

#### Step 5: Add test script to package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### 6. **Add Linting & Code Formatting**
**Effort**: ⏱️ 1 hour
**Impact**: 🎨 Consistent code quality

#### Step 1: Install ESLint
```bash
npm install --save-dev eslint eslint-config-next
# or
yarn add --dev eslint eslint-config-next
```

#### Step 2: Create .eslintrc.json
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "@next/next/no-html-link-for-pages": "off"
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      "extends": ["next/core-web-vitals"]
    }
  ]
}
```

#### Step 3: Install Prettier
```bash
npm install --save-dev prettier eslint-config-prettier
# or
yarn add --dev prettier eslint-config-prettier
```

#### Step 4: Create .prettierrc
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "arrowParens": "always"
}
```

#### Step 5: Add scripts to package.json
```json
{
  "scripts": {
    "lint": "eslint pages components hooks utils --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint pages components hooks utils --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"pages/**/*.{js,jsx,ts,tsx}\" \"components/**/*.{js,jsx,ts,tsx}\"",
    "format:check": "prettier --check \"pages/**/*.{js,jsx,ts,tsx}\""
  }
}
```

---

### 7. **Add CI/CD Pipeline**
**Effort**: ⏱️ 1-2 hours
**Impact**: 🚀 Automate testing & deployment

#### Step 1: Create .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint
      run: npm run lint

    - name: Format check
      run: npm run format:check

    - name: Run tests
      run: npm run test:coverage

    - name: Build
      run: npm run build

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

#### Step 2: Create .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel
      uses: vercel/action@master
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🟡 MEDIUM PRIORITY (NEXT 1-2 MONTHS)

### 8. **Enhance Search Features**
**Effort**: ⏱️ 2-3 hours
**Impact**: 📈 Better user experience

#### A. Search History
```javascript
// hooks/useSearchHistory.js
import { useState, useEffect } from 'react';

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (term: string) => {
    const updated = [term, ...history.filter(h => h !== term)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return { history, addToHistory, clearHistory };
};
```

#### B. Search Suggestions
```javascript
// hooks/useSearchSuggestions.js
import { useState, useEffect } from 'react';
import { useDebounce } from './useSearch';

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    fetch(`/api/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => setSuggestions(data.suggestions || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return { suggestions, loading };
};
```

---

### 9. **Improve Performance**
**Effort**: ⏱️ 2-3 hours
**Impact**: ⚡ Faster page loads

#### A. Image Optimization
```javascript
// components/SearchResults.js
import Image from 'next/image';

// Replace img tags with Next Image
<Image
  src={thumbnail}
  alt={`Thumbnail for ${result.title}`}
  width={112}
  height={80}
  loading="lazy"
  className="w-28 h-20 object-cover rounded-md"
/>
```

#### B. Prefetching
```javascript
// pages/search.js
import { useRouter } from 'next/router';

useEffect(() => {
  router.prefetch('/search');
}, []);
```

#### C. Service Worker (PWA)
```javascript
// pages/_app.js
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW registration failed:', err));
  }
}, []);
```

---

### 10. **Add Error Tracking**
**Effort**: ⏱️ 1-2 hours
**Impact**: 🔍 Monitor production issues

#### Using Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// pages/_app.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

### 11. **Security Headers**
**Effort**: ⏱️ 30 minutes
**Impact**: 🔒 Prevent attacks

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## 💡 LOW PRIORITY (NICE-TO-HAVE)

### 12. **Additional Features**
- [ ] Advanced search operators (site:, filetype:, etc.)
- [ ] Search result bookmarking
- [ ] Custom search filters
- [ ] Dark mode toggle improvements
- [ ] Keyboard shortcuts
- [ ] Result sharing via social media
- [ ] Search analytics dashboard

### 13. **UI/UX Enhancements**
- [ ] Result preview on hover
- [ ] Infinite scroll pagination
- [ ] Voice search language selection
- [ ] Compact vs expanded result view
- [ ] Related searches section
- [ ] Search result answer boxes (like Google)

### 14. **Developer Experience**
- [ ] Storybook for component documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Contributing guide
- [ ] Development setup guide
- [ ] Component library

---

## 📋 Implementation Checklist

### Week 1 (Critical)
- [ ] Move API keys to environment variables
- [ ] Implement input validation
- [ ] Add rate limiting
- [ ] Update .gitignore
- [ ] Clean git history if needed

### Week 2-3 (High Priority)
- [ ] Add TypeScript
- [ ] Set up ESLint & Prettier
- [ ] Add Jest tests
- [ ] Create GitHub Actions CI/CD

### Week 4+ (Medium Priority)
- [ ] Search history feature
- [ ] Performance optimizations
- [ ] Error tracking (Sentry)
- [ ] Security headers

---

## 🚀 Quick Start Commands

```bash
# Install all dev dependencies
npm install --save-dev typescript @types/react @types/next jest @testing-library/react @testing-library/jest-dom eslint eslint-config-next prettier eslint-config-prettier

# Run linting
npm run lint

# Run tests
npm run test

# Build
npm run build

# Start dev server
npm run dev
```

---

## 📞 Questions?

For implementation help on any of these improvements, refer to:
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Jest**: https://jestjs.io/docs/getting-started
- **ESLint**: https://eslint.org/docs/rules/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Next.js**: https://nextjs.org/docs

---

*Last Updated: October 2025*
