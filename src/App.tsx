import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { languages } from './config/languages';
import { LanguageSection } from './components/LanguageSection';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { GithubMark } from './components/icons/GithubMark';
import { TokenSettings } from './components/TokenSettings';

const ONE_DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      gcTime: ONE_DAY,
    },
  },
});

const safeLocalStorage = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

const persister = createSyncStoragePersister({
  storage: safeLocalStorage,
  key: 'stardust-query-cache',
});

// Pure-CSS twinkle: no JS, no perpetual rAF loop, and the reduced-motion
// preference is handled natively in index.css (.animate-twinkle override).
const StarParticle = ({ delay, top, left }: { delay: number; top: string; left: string }) => (
  <div
    className="animate-twinkle absolute h-1 w-1 rounded-full bg-white"
    style={{ top, left, animationDelay: `${delay}s` }}
  />
);

const STAR_PARTICLES = [
  { top: '10%', left: '20%', delay: 0 },
  { top: '30%', left: '80%', delay: 1 },
  { top: '70%', left: '10%', delay: 2 },
  { top: '50%', left: '50%', delay: 0.5 },
  { top: '20%', left: '60%', delay: 1.5 },
  { top: '80%', left: '90%', delay: 2.5 },
];

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: ONE_DAY, buster: 'v1' }}
    >
      <div className="text-text selection:bg-primary/30 relative min-h-screen overflow-hidden bg-[#050505]">
        {/* Background Nebula Effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] h-[50vw] w-[50vw] animate-pulse bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] opacity-10" />
          <div
            className="absolute right-[-10%] bottom-[-20%] h-[50vw] w-[50vw] animate-pulse bg-[radial-gradient(circle,var(--color-secondary)_0%,transparent_70%)] opacity-10"
            style={{ animationDelay: '2s' }}
          />
          <div className="absolute top-[40%] left-[50%] h-[30vw] w-[30vw] -translate-x-1/2 animate-pulse bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-5" />
        </div>

        {/* Floating Stars Layer */}
        <div className="pointer-events-none fixed inset-0">
          {STAR_PARTICLES.map((p) => (
            <StarParticle key={`${p.top}-${p.left}`} {...p} />
          ))}
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="group relative">
                <div className="from-primary to-accent absolute inset-0 bg-gradient-to-r opacity-50 blur-md transition-opacity group-hover:opacity-100" />
                <div className="relative rounded-lg border border-white/10 bg-black p-2">
                  <GithubMark className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold tracking-tighter text-white">Stardust</h1>
            </div>
            <div className="flex items-center gap-3">
              <TokenSettings />
              <a
                href="https://github.com/kanywst/stardust"
                target="_blank"
                rel="noopener noreferrer"
                className="text-textMuted text-sm font-medium transition-colors hover:text-white"
              >
                About
              </a>
            </div>
          </div>
        </header>

        {/* Hero & Main Content */}
        <main className="relative z-10 container mx-auto space-y-20 px-4 py-16 md:py-24">
          {/* Cinematic Hero */}
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative inline-block"
            >
              <span className="from-primary via-secondary to-accent absolute -inset-4 bg-gradient-to-r opacity-30 blur-2xl" />
              <h2 className="relative text-5xl font-black tracking-tight text-white drop-shadow-2xl md:text-7xl">
                Explore the <br className="md:hidden" />
                <span className="animate-gradient-x bg-gradient-to-r from-indigo-200 via-white to-cyan-200 bg-clip-text pb-2 text-transparent">
                  Galaxies of Code
                </span>
              </h2>
            </motion.div>

            <motion.p
              className="text-textMuted mx-auto max-w-2xl text-lg leading-relaxed md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Navigating the brightest stars in the open-source universe.
              <br />
              <span className="text-white/80">Monitor the giants. Discover the legends.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-textMuted/60 flex justify-center gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Live Data</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div>2026 Edition</div>
            </motion.div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <LanguageSection language={lang} />
              </motion.div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-20 border-t border-white/5 bg-black/20 py-12 text-center backdrop-blur-sm">
          <p className="text-textMuted text-sm">
            © 2026 Stardust. Crafted by{' '}
            <a
              href="https://github.com/kanywst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              kanywst
            </a>
            .
          </p>
        </footer>
      </div>
    </PersistQueryClientProvider>
  );
}

export default App;
