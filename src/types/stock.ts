export interface StockPrice {
  last: number;
  change: number;
  changePct: number;
  currency: string;
  asOf: string;
}

export interface Range52W {
  low: number;
  high: number;
}

export interface KeyStats {
  marketCap: number;
  volume: number;
  range52w: Range52W;
  beta: number;
}

export interface StockSummary {
  ticker: string;
  company: string;
  price: StockPrice;
  keyStats: KeyStats;
}

export type Decision = 'Buy' | 'Hold' | 'Sell';

export interface Driver {
  label: string;
  direction: 'up' | 'down';
}

export interface StockDecision {
  score: number;
  decision: Decision;
  confidence: number;
  drivers: Driver[];
  notes: string;
}

export type MetricStatus = 'good' | 'neutral' | 'poor';

export interface Metric {
  id: string;
  label: string;
  value: number | string;
  status: MetricStatus;
  threshold: string;
  explain: string;
  history: number[];
}

export interface StockMetrics {
  valuation: Metric[];
  risk: Metric[];
  quality: Metric[];
  growth: Metric[];
  income: Metric[];
  analyst: Metric[];
}

