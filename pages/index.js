import Head from 'next/head';
import {
  MagnifyingGlassIcon as SearchIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon as DesktopComputerIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../components/ThemeProvider';
import { validateSearchTerm } from '../utils/validation';

const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: ComputerDesktopIcon },
];

const features = [
  {
    icon: GlobeAltIcon,
    title: 'Google-backed results',
    description: 'SeekEngine taps into the Google Search API for accurate, up-to-date answers without the clutter.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Respectful experience',
    description: 'Fast performance, accessible contrast, and a calm interface that works in light or dark mode.',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Teleport discovery',
    description: 'Jump to a curated, delightful corner of the web whenever you need a fresh perspective.',
  },
];

export default function Home() {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [error, setError] = useState(null);
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value) => {
    setTheme(value);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transition');
      window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const term = searchInputRef.current?.value.trim() ?? '';
    if (!term) {
      setError('Enter a search term to get started.');
      searchInputRef.current?.focus();
      return;
    }

    try {
      const validatedTerm = validateSearchTerm(term);
      setError(null);
      setLoading(true);
      await router.push(`/search?term=${encodeURIComponent(validatedTerm)}`);
    } catch (validationError) {
      setError(validationError.message);
      setLoading(false);
      searchInputRef.current?.focus();
    }
  };

  const teleport = () => {
    const urls = [
      'https://thatsthefinger.com/',
      'https://alwaysjudgeabookbyitscover.com/',
      'https://puginarug.com/',
      'https://optical.toys/',
      'https://maze.toys/mazes/mini/daily/',
      'https://paint.toys/calligram/',
      'https://heeeeeeeey.com/',
      'https://cursoreffects.com/',
      'http://endless.horse/',
      'https://trypap.com/',
      'https://smashthewalls.com/',
      'http://www.staggeringbeauty.com/',
      'https://burymewithmymoney.com/',
      'https://www.pointerpointer.com/',
      'https://jacksonpollock.org/',
      'http://www.republiquedesmangues.fr/',
      'https://checkboxrace.com/',
      'http://drawing.garden/',
      'https://www.partridgegetslucky.com/',
      'https://rotatingsandwiches.com/',
      'https://www.rrrgggbbb.com/',
      'https://www.fallingfalling.com/',
      'https://cat-bounce.com/',
      'http://maninthedark.com/',
    ];

    const randomUrl = urls[Math.floor(Math.random() * urls.length)];

    try {
      setTeleporting(true);
      setError(null);
      window.open(randomUrl, '_blank', 'noopener,noreferrer');
    } catch (teleportError) {
      console.error('Teleport error:', teleportError);
      setError('Failed to open the link. Please try again.');
    } finally {
      setTeleporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Head>
        <title>SeekEngine - Smart Web Search</title>
        <meta
          name="description"
          content="SeekEngine pairs the power of Google Search with a calm, theme-aware interface and a playful teleport feature."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="SeekEngine - Smart Web Search" />
        <meta
          property="og:description"
          content="A modern search experience that respects your eyes and keeps discovery fun."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: 'linear-gradient(to bottom, var(--surface-2) 0%, transparent 65%)' }}
      />

      <header className="relative border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--primary)] sm:text-2xl"
          >
            SeekEngine
          </a>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/archduke1337/SeekEngine"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md border border-transparent px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border)] hover:text-[var(--text-primary)] sm:inline-flex"
            >
              View on GitHub
            </a>

            <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] p-1">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col gap-20 px-4 py-16 sm:py-20 lg:py-24">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            <SparklesIcon className="h-4 w-4 text-[var(--primary)]" />
            <span>Teleport discovery is live</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Search with focus. Explore with delight.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            SeekEngine pairs trusted Google results with a carefully tuned interface that adapts to your theme. When you
            need inspiration, teleport to a hand-picked corner of the web.
          </p>

          <form onSubmit={handleSearch} className="mt-10 w-full max-w-2xl space-y-3" noValidate>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm transition-colors focus-within:border-[var(--primary)]">
              <label className="sr-only" htmlFor="seek-search">
                Search the web
              </label>
              <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <SearchIcon className="h-5 w-5 text-[var(--text-tertiary)]" />
                <input
                  id="seek-search"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Try “design systems” or “best productivity tips”"
                  className="flex-1 border-none bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                  autoComplete="off"
                  disabled={loading}
                />
                {loading && <SparklesIcon className="h-5 w-5 animate-spin text-[var(--primary)]" />}
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-[var(--error)]" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SearchIcon className="h-5 w-5" />
                {loading ? 'Searching…' : 'Search the web'}
                <ArrowRightIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={teleport}
                disabled={teleporting || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RocketLaunchIcon className="h-5 w-5 text-[var(--primary)]" />
                {teleporting ? 'Teleporting…' : 'Teleport me'}
              </button>
            </div>
          </form>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center shadow-sm">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-1 text-xs font-semibold text-[var(--success)]">
            <CheckCircleIcon className="h-4 w-4" />
            New in this release
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">
            Theme-aware design with a calmer motion system
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] sm:text-base">
            We reduced excessive animation, aligned colors with the theme tokens, and made the welcome experience easier
            to scan. SeekEngine now feels crisp on both light and dark backgrounds.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
