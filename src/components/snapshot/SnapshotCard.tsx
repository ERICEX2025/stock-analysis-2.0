import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockSummary } from "@/lib/hooks/useStock";
import {
  formatCurrency,
  formatLargeNumber,
  formatPercentageValue,
  formatDateTime,
} from "@/lib/utils/formatters";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface SnapshotCardProps {
  ticker: string;
}

export function SnapshotCard({ ticker }: SnapshotCardProps) {
  const { data, isLoading, error, refetch } = useStockSummary(ticker);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load stock data. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["stock", "summary", ticker],
                });
                refetch();
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const isPositive = data.price.change >= 0;
  const marketStatus =
    new Date(data.price.asOf).getHours() >= 9 &&
    new Date(data.price.asOf).getHours() < 16
      ? "Open"
      : "Closed";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{data.ticker}</CardTitle>
          <Badge variant={marketStatus === "Open" ? "success" : "secondary"}>
            {marketStatus}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{data.company}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatCurrency(data.price.last, data.price.currency)}
            </span>
            <span
              className={`text-lg font-semibold ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(data.price.change, data.price.currency)} (
              {formatPercentageValue(data.price.changePct, 2)})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            As of {formatDateTime(data.price.asOf)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
            <p className="text-sm font-semibold">
              {formatLargeNumber(data.keyStats.marketCap)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Volume</p>
            <p className="text-sm font-semibold">
              {formatLargeNumber(data.keyStats.volume)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">52W Range</p>
            <p className="text-sm font-semibold">
              {formatCurrency(data.keyStats.range52w.low, data.price.currency)}{" "}
              -{" "}
              {formatCurrency(data.keyStats.range52w.high, data.price.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Beta</p>
            <p className="text-sm font-semibold">
              {data.keyStats.beta.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
