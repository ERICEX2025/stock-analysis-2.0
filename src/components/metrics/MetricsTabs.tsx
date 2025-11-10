import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from './MetricCard';
import { useStockMetrics, useStockSummary } from '@/lib/hooks/useStock';
import { AnalysisSettings } from '@/types/settings';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface MetricsTabsProps {
  ticker: string;
  settings: AnalysisSettings;
  onMetricCustomize?: (metricId: string) => void;
}

export function MetricsTabs({ ticker, settings, onMetricCustomize }: MetricsTabsProps) {
  const { data, isLoading, error, refetch } = useStockMetrics(ticker, settings);
  const { data: stockSummary } = useStockSummary(ticker);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load metrics. Please try again.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['stock', 'metrics', ticker, settings] });
              refetch();
            }}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Tabs defaultValue="valuation" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
        <TabsTrigger value="valuation">Valuation</TabsTrigger>
        <TabsTrigger value="risk">Risk/Return</TabsTrigger>
        <TabsTrigger value="quality">Quality</TabsTrigger>
        <TabsTrigger value="growth">Growth</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="analyst">Analyst/News</TabsTrigger>
      </TabsList>

      <TabsContent value="valuation" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.valuation.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="risk" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.risk.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="quality" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.quality.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="growth" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.growth.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="income" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.income.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="analyst" className="space-y-4">
        {/* Target Price Box */}
        {stockSummary && (() => {
          const targetGapMetric = data.analyst.find(m => m.id === 'target_gap');
          if (!targetGapMetric) return null;
          
          // Parse target gap percentage from string (e.g., "+5.2%" or "-3.1%")
          const targetGapStr = typeof targetGapMetric.value === 'string' 
            ? targetGapMetric.value 
            : String(targetGapMetric.value);
          // Remove '%' sign and parse - parseFloat handles both '+' and '-' signs
          const targetGapPercent = parseFloat(targetGapStr.replace('%', ''));
          
          // Safety check: if parsing failed, don't render the box
          if (isNaN(targetGapPercent)) return null;
          
          // Calculate target price: currentPrice * (1 + percentage/100)
          const currentPrice = stockSummary.price.last;
          const targetPrice = currentPrice * (1 + targetGapPercent / 100);
          const isUpside = targetGapPercent > 0;
          
          return (
            <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg">Calculated Target Price</CardTitle>
                  </div>
                  <Badge 
                    variant={isUpside ? "success" : targetGapPercent < -5 ? "destructive" : "secondary"}
                  >
                    {targetGapPercent > 0 ? 'Upside' : 'Downside'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">
                      {formatCurrency(targetPrice, stockSummary.price.currency)}
                    </span>
                    <span className={`text-lg font-semibold ${
                      isUpside 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {targetGapStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Current: {formatCurrency(currentPrice, stockSummary.price.currency)}</span>
                    <span>•</span>
                    <span>Difference: {formatCurrency(Math.abs(targetPrice - currentPrice), stockSummary.price.currency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on analyst consensus target price calculations
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.analyst.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              onCustomize={onMetricCustomize ? () => onMetricCustomize(metric.id) : undefined}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

