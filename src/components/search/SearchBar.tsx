import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];

interface SearchBarProps {
  onTickerSelect: (ticker: string) => void;
  currentTicker?: string;
}

export function SearchBar({ onTickerSelect, currentTicker }: SearchBarProps) {
  const [query, setQuery] = useState(currentTicker || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (currentTicker) {
      setQuery(currentTicker);
    }
  }, [currentTicker]);

  const updateSuggestions = useCallback((value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const upperValue = value.toUpperCase();
    const filtered = POPULAR_TICKERS.filter(ticker =>
      ticker.startsWith(upperValue)
    );

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateSuggestions(value);
    }, 300);
  };

  const handleSelect = (ticker: string) => {
    setQuery(ticker);
    setIsOpen(false);
    setSuggestions([]);
    onTickerSelect(ticker);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        handleSelect(query.toUpperCase());
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        } else if (query.trim()) {
          handleSelect(query.toUpperCase());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSuggestions([]);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search ticker (e.g., AAPL, MSFT)"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10"
          aria-label="Stock ticker search"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="ticker-suggestions"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="ticker-suggestions"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          role="listbox"
        >
          {suggestions.map((ticker, index) => (
            <button
              key={ticker}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none',
                index === selectedIndex && 'bg-accent'
              )}
              onClick={() => handleSelect(ticker)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {ticker}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

