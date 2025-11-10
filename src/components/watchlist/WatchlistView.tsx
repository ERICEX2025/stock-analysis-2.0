import { useWatchlist } from "@/lib/stores/useWatchlist";
import { WatchlistItem } from "./WatchlistItem";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WatchlistViewProps {
  onTickerSelect: (ticker: string) => void;
}

export function WatchlistView({ onTickerSelect }: WatchlistViewProps) {
  const { watchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No stocks in watchlist</p>
        <p className="text-sm mt-2">Add stocks to your watchlist to track them here</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
      {/* Header Row */}
      <Card className="hidden sm:block w-full bg-muted/30 rounded-b-none mb-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">Symbol</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-shrink-0">
              <div className="text-right sm:text-left min-w-[140px]">
                <div className="text-sm font-medium text-muted-foreground">Price</div>
              </div>
              <div className="text-right sm:text-left min-w-[100px]">
                <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
              </div>
              <div className="text-right sm:text-left min-w-[80px]">
                <div className="text-sm font-medium text-muted-foreground">Volume</div>
              </div>
              <div className="text-right sm:text-left min-w-[60px]">
                <div className="text-sm font-medium text-muted-foreground">Beta</div>
              </div>
              <div className="w-8 flex-shrink-0"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2">
        {watchlist.map((ticker) => (
          <WatchlistItem
            key={ticker}
            ticker={ticker}
            onTickerSelect={onTickerSelect}
          />
        ))}
      </div>
    </div>
  );
}

