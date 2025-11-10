import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStockDecision } from '@/lib/hooks/useStock';
import { AnalysisSettings } from '@/types/settings';
import { formatPercentage } from '@/lib/utils/formatters';
import { AlertCircle, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';

interface DecisionCardProps {
  ticker: string;
  settings: AnalysisSettings;
}

export function DecisionCard({ ticker, settings }: DecisionCardProps) {
  const { data, isLoading, error, refetch } = useStockDecision(ticker, settings);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-24 mx-auto rounded-full" />
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load decision data. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['stock', 'decision', ticker, settings] });
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

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Buy':
        return 'success';
      case 'Hold':
        return 'secondary';
      case 'Sell':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(
                  data.score >= 70 ? 'text-green-600 dark:text-green-400' :
                  data.score >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                )}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{data.score}</span>
            </div>
          </div>
          <Badge
            variant={getDecisionColor(data.decision) as any}
            className="mt-4 text-base px-4 py-1"
          >
            {data.decision}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-semibold">
              {formatPercentage(data.confidence * 100, 1)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Key Drivers</p>
          <div className="flex flex-wrap gap-2">
            {data.drivers.map((driver, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1"
              >
                {driver.direction === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                {driver.label}
              </Badge>
            ))}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" aria-label="View decision explanation">
              <HelpCircle className="h-4 w-4 mr-2" />
              Why this decision?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Decision Explanation</DialogTitle>
              <DialogDescription>
                Analysis score: {data.score}/100 | Confidence: {formatPercentage(data.confidence * 100, 1)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Decision: {data.decision}</h4>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Drivers</h4>
                <ul className="space-y-2">
                  {data.drivers.map((driver, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {driver.direction === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <span>
                        <strong>{driver.label}</strong>: {driver.direction === 'up' ? 'Positive' : 'Negative'} impact on decision
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Analysis Settings</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Outlook: <strong className="text-foreground">{settings.preset}</strong></p>
                  <p>Beta Benchmark: <strong className="text-foreground">{settings.betaBenchmark}</strong></p>
                  <p>P/E Window: <strong className="text-foreground">{settings.peWindow}</strong></p>
                  <p>EPS Window: <strong className="text-foreground">{settings.epsWindow}</strong></p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

