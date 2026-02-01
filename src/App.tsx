
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { languages } from './config/languages';
import { LanguageSection } from './components/LanguageSection';
import { Github, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Floating Star Component
const StarParticle = ({ delay, top, left }: { delay: number; top: string; left: string }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white rounded-full"
    style={{ top, left }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#050505] text-text selection:bg-primary/30 overflow-hidden relative">
        
        {/* Background Nebula Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/20 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30vw] h-[30vw] bg-accent/10 rounded-full blur-[100px] opacity-20" />
        </div>

        {/* Floating Stars Layer */}
        <div className="fixed inset-0 pointer-events-none">
          <StarParticle top="10%" left="20%" delay={0} />
          <StarParticle top="30%" left="80%" delay={1} />
          <StarParticle top="70%" left="10%" delay={2} />
          <StarParticle top="50%" left="50%" delay={0.5} />
          <StarParticle top="20%" left="60%" delay={1.5} />
          <StarParticle top="80%" left="90%" delay={2.5} />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black p-2 rounded-lg border border-white/10">
                  <Github className="w-5 h-5 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold tracking-tighter text-white">
                Stardust
              </h1>
            </div>
            <a 
              href="https://github.com/kanywst/stardust" 
              className="text-sm font-medium text-textMuted hover:text-white transition-colors"
            >
              About
            </a>
          </div>
        </header>

        {/* Hero & Main Content */}
        <main className="container mx-auto px-4 py-16 md:py-24 space-y-20 relative z-10">
          
          {/* Cinematic Hero */}
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative inline-block"
            >
              <span className="absolute -inset-4 blur-2xl bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />
              <h2 className="relative text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
                Explore the <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-cyan-200 animate-gradient-x pb-2">
                  Galaxies of Code
                </span>
              </h2>
            </motion.div>

            <motion.p 
              className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto leading-relaxed"
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
              className="flex justify-center gap-4 text-sm text-textMuted/60"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Live Data</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div>2026 Edition</div>
            </motion.div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
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
        <footer className="border-t border-white/5 mt-20 py-12 text-center relative z-10 bg-black/20 backdrop-blur-sm">
          <p className="text-textMuted text-sm">
            © 2026 Stardust. Crafted by <a href="https://github.com/kanywst" className="text-white hover:underline">kanywst</a>.
          </p>
        </footer>
        
      </div>
    </QueryClientProvider>
  );
}

export default App;