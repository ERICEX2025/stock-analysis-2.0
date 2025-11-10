import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockSummary } from "@/lib/hooks/useStock";
import {
  formatCurrency,
  formatPercentageValue,
  formatLargeNumber,
} from "@/lib/utils/formatters";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/lib/stores/useWatchlist";

interface WatchlistItemProps {
  ticker: string;
  onTickerSelect: (ticker: string) => void;
}

export function WatchlistItem({ ticker, onTickerSelect }: WatchlistItemProps) {
  const { data, isLoading, error } = useStockSummary(ticker);
  const { removeFromWatchlist } = useWatchlist();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(ticker);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <span className="font-semibold text-lg">{ticker}</span>
                <p className="text-sm text-muted-foreground">Failed to load</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.price.change >= 0;

  return (
    <Card
      className="w-full cursor-pointer hover:bg-accent/50 transition-colors group border"
      onClick={() => onTickerSelect(ticker)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Ticker and Company */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg leading-tight">{data.ticker}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {data.company}
              </p>
            </div>
          </div>

          {/* Right: All Stats in a row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Price Information */}
            <div className="text-right sm:text-left min-w-[140px]">
              <div className="text-lg font-bold">
                {formatCurrency(data.price.last, data.price.currency)}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(data.price.change, data.price.currency)} (
                {formatPercentageValue(data.price.changePct, 2)})
              </div>
            </div>

            {/* Additional Stats */}
            <div className="text-right sm:text-left min-w-[100px]">
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="text-sm font-medium">
                {formatLargeNumber(data.keyStats.marketCap)}
              </div>
            </div>

            <div className="text-right sm:text-left min-w-[80px]">
              <div className="text-xs text-muted-foreground">Volume</div>
              <div className="text-sm font-medium">
                {formatLargeNumber(data.keyStats.volume)}
              </div>
            </div>

            <div className="text-right sm:text-left min-w-[60px]">
              <div className="text-xs text-muted-foreground">Beta</div>
              <div className="text-sm font-medium">
                {data.keyStats.beta.toFixed(2)}
              </div>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
              onClick={handleRemove}
              aria-label={`Remove ${ticker} from watchlist`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

