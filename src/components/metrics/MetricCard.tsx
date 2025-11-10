import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkline } from './Sparkline';
import { Metric } from '@/types/stock';
import { formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { HelpCircle, Settings } from 'lucide-react';

interface MetricCardProps {
  metric: Metric;
  onCustomize?: () => void;
}

export function MetricCard({ metric, onCustomize }: MetricCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'good':
        return 'success';
      case 'poor':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatValue = (value: number | string): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (metric.id.includes('percent') || metric.id.includes('yield') || metric.id.includes('growth') || metric.id.includes('margin') || metric.id.includes('sentiment')) {
      return formatPercentage(value, 2);
    }
    if (metric.id.includes('ratio') || metric.id.includes('pe') || metric.id.includes('peg') || metric.id.includes('ev') || metric.id.includes('p_fcf') || metric.id.includes('beta') || metric.id.includes('sharpe') || metric.id.includes('rating')) {
      return formatNumber(value, 2);
    }
    return formatNumber(value, 2);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium leading-tight">
            {metric.label}
          </CardTitle>
          <Badge variant={getStatusVariant(metric.status) as any} className="ml-2 shrink-0">
            {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {formatValue(metric.value)}
          </span>
          {metric.history && metric.history.length > 0 && (
            <div className="ml-2">
              <Sparkline data={metric.history} />
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          {metric.threshold}
        </p>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                aria-label={`Explain ${metric.label}`}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Explain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{metric.label}</DialogTitle>
                <DialogDescription>
                  Current value: {formatValue(metric.value)} | Threshold: {metric.threshold}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Definition</h4>
                  <p className="text-sm text-muted-foreground">{metric.explain}</p>
                </div>
                {metric.id.includes('pe') && (
                  <div>
                    <h4 className="font-semibold mb-2">Formula</h4>
                    <p className="text-sm text-muted-foreground">
                      P/E Ratio = Stock Price / Earnings per Share (EPS)
                    </p>
                  </div>
                )}
                {metric.id.includes('sharpe') && (
                  <div>
                    <h4 className="font-semibold mb-2">Formula</h4>
                    <p className="text-sm text-muted-foreground">
                      Sharpe Ratio = (Return - Risk-free Rate) / Standard Deviation
                    </p>
                  </div>
                )}
                {metric.id.includes('beta') && (
                  <div>
                    <h4 className="font-semibold mb-2">Interpretation</h4>
                    <p className="text-sm text-muted-foreground">
                      Beta &lt; 1: Less volatile than market | Beta = 1: Market volatility | Beta &gt; 1: More volatile than market
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    This metric is rated as <strong>{metric.status}</strong> based on the threshold: {metric.threshold}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {onCustomize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCustomize}
              aria-label={`Customize ${metric.label}`}
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

