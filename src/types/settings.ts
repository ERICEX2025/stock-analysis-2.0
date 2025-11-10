export type OutlookPreset = 'pessimistic' | 'neutral' | 'optimistic';
export type Benchmark = 'SPY' | 'QQQ' | 'IWM';
export type TimeWindow = '1y' | '3y' | '5y' | '6m' | '10y';
export type SharpeWindow = '126' | '252' | '504';
export type VolatilityWindow = '30' | '90' | '252';
export type EvEbitdaType = 'ttm' | 'forward';
export type DividendWindow = '3y' | '5y' | '10y';

export interface AnalysisSettings {
  preset: OutlookPreset;
  betaBenchmark: Benchmark;
  sharpeWindow: SharpeWindow;
  riskFreeRate: number;
  peWindow: TimeWindow;
  epsWindow: TimeWindow;
  volatilityWindow: VolatilityWindow;
  evEbitdaType: EvEbitdaType;
  dividendWindow: DividendWindow;
}

export const DEFAULT_SETTINGS: AnalysisSettings = {
  preset: 'neutral',
  betaBenchmark: 'SPY',
  sharpeWindow: '252',
  riskFreeRate: 0.045,
  peWindow: '3y',
  epsWindow: '3y',
  volatilityWindow: '252',
  evEbitdaType: 'ttm',
  dividendWindow: '5y',
};

