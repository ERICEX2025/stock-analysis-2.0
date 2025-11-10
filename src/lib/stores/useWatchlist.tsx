import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const WATCHLIST_STORAGE_KEY = 'stock-analysis-watchlist';
const LEGACY_BOOKMARKS_STORAGE_KEY = 'stock-analysis-bookmarks';

function loadWatchlistFromStorage(): string[] {
  try {
    // Try to load from new watchlist key
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (stored) {
      const watchlist = JSON.parse(stored);
      if (Array.isArray(watchlist)) {
        return watchlist.filter((b): b is string => typeof b === 'string');
      }
    }
    
    // Migrate from old bookmarks key if it exists
    const legacyStored = localStorage.getItem(LEGACY_BOOKMARKS_STORAGE_KEY);
    if (legacyStored) {
      const bookmarks = JSON.parse(legacyStored);
      if (Array.isArray(bookmarks)) {
        const migrated = bookmarks.filter((b): b is string => typeof b === 'string');
        // Save to new key and remove old key
        saveWatchlistToStorage(migrated);
        localStorage.removeItem(LEGACY_BOOKMARKS_STORAGE_KEY);
        return migrated;
      }
    }
  } catch (error) {
    console.error('Failed to load watchlist from storage:', error);
  }
  return [];
}

function saveWatchlistToStorage(watchlist: string[]): void {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Failed to save watchlist to storage:', error);
  }
}

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  toggleWatchlist: (ticker: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    return loadWatchlistFromStorage();
  });

  const addToWatchlist = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    setWatchlist(prev => {
      if (prev.includes(upperTicker)) {
        return prev;
      }
      const updated = [...prev, upperTicker];
      saveWatchlistToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    setWatchlist(prev => {
      const updated = prev.filter(b => b !== upperTicker);
      saveWatchlistToStorage(updated);
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((ticker: string) => {
    return watchlist.includes(ticker.toUpperCase());
  }, [watchlist]);

  const toggleWatchlist = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    setWatchlist(prev => {
      if (prev.includes(upperTicker)) {
        const updated = prev.filter(b => b !== upperTicker);
        saveWatchlistToStorage(updated);
        return updated;
      } else {
        const updated = [...prev, upperTicker];
        saveWatchlistToStorage(updated);
        return updated;
      }
    });
  }, []);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

