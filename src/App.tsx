import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/search/SearchBar';
import { SnapshotCard } from '@/components/snapshot/SnapshotCard';
import { DecisionCard } from '@/components/decision/DecisionCard';
import { MetricsTabs } from '@/components/metrics/MetricsTabs';
import { CustomizeDrawer } from '@/components/customize/CustomizeDrawer';
import { WatchlistView } from '@/components/watchlist/WatchlistView';
import { Toaster } from '@/components/ui/toaster';
import { useSettings } from '@/lib/stores/useSettings';
import { useWatchlist, WatchlistProvider } from '@/lib/stores/useWatchlist';
import { Button } from '@/components/ui/button';
import { Settings, Star } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function AppContent() {
  const [ticker, setTicker] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ticker') || null;
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { settings, syncURL } = useSettings();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    syncURL(ticker || undefined);
  }, [ticker, settings, syncURL]);

  const handleTickerSelect = (newTicker: string) => {
    setTicker(newTicker.toUpperCase());
  };

  const handleClearTicker = () => {
    setTicker(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHomeClick={handleClearTicker} />
      <main className="flex-1 container px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar onTickerSelect={handleTickerSelect} currentTicker={ticker || undefined} />
          <div className="flex gap-2">
            {ticker && (
              <Button
                variant="outline"
                onClick={() => toggleWatchlist(ticker)}
                aria-label={isInWatchlist(ticker) ? "Remove from watchlist" : "Add to watchlist"}
              >
                <Star
                  className={`h-4 w-4 mr-2 ${
                    isInWatchlist(ticker)
                      ? "fill-yellow-400 text-yellow-400"
                      : ""
                  }`}
                />
                {isInWatchlist(ticker) ? "In Watchlist" : "Add to Watchlist"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsCustomizeOpen(true)}
              aria-label="Customize analysis settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>

        {ticker ? (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <SnapshotCard ticker={ticker} />
              <DecisionCard ticker={ticker} settings={settings} />
            </div>
            <MetricsTabs ticker={ticker} settings={settings} />
          </>
        ) : (
          <WatchlistView onTickerSelect={handleTickerSelect} />
        )}
      </main>
      <Footer />
      <CustomizeDrawer
        open={isCustomizeOpen}
        onOpenChange={setIsCustomizeOpen}
        settings={settings}
      />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WatchlistProvider>
        <AppContent />
      </WatchlistProvider>
    </QueryClientProvider>
  );
}

export default App;

