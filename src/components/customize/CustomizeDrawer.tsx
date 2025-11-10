import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AnalysisSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { useSettings } from '@/lib/stores/useSettings';
import { useQueryClient } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';

interface CustomizeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AnalysisSettings;
}

export function CustomizeDrawer({ open, onOpenChange, settings }: CustomizeDrawerProps) {
  const { updateSettings, resetSettings, syncURL } = useSettings();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<AnalysisSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApply = () => {
    updateSettings(localSettings);
    syncURL();
    // Invalidate queries to refetch with new settings
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    resetSettings();
    syncURL();
    queryClient.invalidateQueries({ queryKey: ['stock'] });
  };

  const updateLocalSetting = <K extends keyof AnalysisSettings>(
    key: K,
    value: AnalysisSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Customize Analysis</SheetTitle>
          <SheetDescription>
            Adjust analysis parameters and thresholds to customize the evaluation.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Global Outlook Preset */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset">Global Outlook Preset</Label>
              <Select
                value={localSettings.preset}
                onValueChange={(value) => updateLocalSetting('preset', value as AnalysisSettings['preset'])}
              >
                <SelectTrigger id="preset" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Valuation Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Valuation</h3>
            
            <div>
              <Label htmlFor="peWindow">P/E Baseline Window</Label>
              <Select
                value={localSettings.peWindow}
                onValueChange={(value) => updateLocalSetting('peWindow', value as AnalysisSettings['peWindow'])}
              >
                <SelectTrigger id="peWindow" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="3y">3 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="evEbitdaType">EV/EBITDA Type</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="evEbitdaType"
                  checked={localSettings.evEbitdaType === 'forward'}
                  onCheckedChange={(checked) =>
                    updateLocalSetting('evEbitdaType', checked ? 'forward' : 'ttm')
                  }
                />
                <Label htmlFor="evEbitdaType" className="cursor-pointer">
                  {localSettings.evEbitdaType === 'forward' ? 'Forward' : 'TTM'}
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Growth Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Growth</h3>
            
            <div>
              <Label htmlFor="epsWindow">EPS Growth Window</Label>
              <Select
                value={localSettings.epsWindow}
                onValueChange={(value) => updateLocalSetting('epsWindow', value as AnalysisSettings['epsWindow'])}
              >
                <SelectTrigger id="epsWindow" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="3y">3 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Risk/Return Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Risk/Return</h3>
            
            <div>
              <Label htmlFor="sharpeWindow">Sharpe Lookback</Label>
              <Select
                value={localSettings.sharpeWindow}
                onValueChange={(value) => updateLocalSetting('sharpeWindow', value as AnalysisSettings['sharpeWindow'])}
              >
                <SelectTrigger id="sharpeWindow" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="126">6 Months (126 days)</SelectItem>
                  <SelectItem value="252">1 Year (252 days)</SelectItem>
                  <SelectItem value="504">3 Years (504 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
              <Input
                id="riskFreeRate"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={localSettings.riskFreeRate * 100}
                onChange={(e) =>
                  updateLocalSetting('riskFreeRate', parseFloat(e.target.value) / 100 || 0)
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="betaBenchmark">Beta Benchmark</Label>
              <Select
                value={localSettings.betaBenchmark}
                onValueChange={(value) => updateLocalSetting('betaBenchmark', value as AnalysisSettings['betaBenchmark'])}
              >
                <SelectTrigger id="betaBenchmark" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPY">SPY (S&P 500)</SelectItem>
                  <SelectItem value="QQQ">QQQ (Nasdaq 100)</SelectItem>
                  <SelectItem value="IWM">IWM (Russell 2000)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="volatilityWindow">Volatility Window (days)</Label>
              <Select
                value={localSettings.volatilityWindow}
                onValueChange={(value) => updateLocalSetting('volatilityWindow', value as AnalysisSettings['volatilityWindow'])}
              >
                <SelectTrigger id="volatilityWindow" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="252">252 days (1 year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Income Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Income</h3>
            
            <div>
              <Label htmlFor="dividendWindow">Dividend Growth Window</Label>
              <Select
                value={localSettings.dividendWindow}
                onValueChange={(value) => updateLocalSetting('dividendWindow', value as AnalysisSettings['dividendWindow'])}
              >
                <SelectTrigger id="dividendWindow" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3y">3 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                  <SelectItem value="10y">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

