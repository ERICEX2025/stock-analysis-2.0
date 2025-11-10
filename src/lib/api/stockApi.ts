import {
  StockSummary,
  StockDecision,
  StockMetrics,
  Metric,
} from "@/types/stock";
import { AnalysisSettings } from "@/types/settings";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock company names
const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  TSLA: "Tesla, Inc.",
  META: "Meta Platforms, Inc.",
  NVDA: "NVIDIA Corporation",
  JPM: "JPMorgan Chase & Co.",
  V: "Visa Inc.",
  JNJ: "Johnson & Johnson",
};

// Generate random price history for sparklines
function generateHistory(baseValue: number, length: number = 20): number[] {
  const history: number[] = [];
  let current = baseValue;
  for (let i = 0; i < length; i++) {
    current += (Math.random() - 0.5) * baseValue * 0.02;
    history.push(Math.max(0, current));
  }
  return history;
}

export async function getStockSummary(ticker: string): Promise<StockSummary> {
  await delay(300 + Math.random() * 200);

  const basePrice = 150 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;
  const changePct = (change / basePrice) * 100; // Percentage value (e.g., -0.49 for -0.49%)

  return {
    ticker: ticker.toUpperCase(),
    company:
      COMPANY_NAMES[ticker.toUpperCase()] ||
      `${ticker.toUpperCase()} Corporation`,
    price: {
      last: basePrice,
      change,
      changePct,
      currency: "USD",
      asOf: new Date().toISOString(),
    },
    keyStats: {
      marketCap: 2000000000000 + Math.random() * 3000000000000,
      volume: 30000000 + Math.random() * 50000000,
      range52w: {
        low: basePrice * 0.7,
        high: basePrice * 1.3,
      },
      beta: 0.8 + Math.random() * 0.8,
    },
  };
}

export async function getStockDecision(
  _ticker: string,
  settings: AnalysisSettings
): Promise<StockDecision> {
  await delay(300 + Math.random() * 200);

  // Simulate decision based on settings
  const baseScore = 50;
  let score = baseScore;

  if (settings.preset === "optimistic") {
    score += 15;
  } else if (settings.preset === "pessimistic") {
    score -= 15;
  }

  score += (Math.random() - 0.5) * 30;
  score = Math.max(0, Math.min(100, score));

  let decision: "Buy" | "Hold" | "Sell";
  if (score >= 70) {
    decision = "Buy";
  } else if (score >= 40) {
    decision = "Hold";
  } else {
    decision = "Sell";
  }

  const confidence = 0.5 + Math.random() * 0.4;

  const drivers = [
    {
      label: "Valuation",
      direction: score > 60 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Risk",
      direction: score > 50 ? ("down" as const) : ("up" as const),
    },
    {
      label: "Growth",
      direction: score > 55 ? ("up" as const) : ("down" as const),
    },
  ];

  const notes = `Valuation ${score > 60 ? "below" : "above"} ${
    settings.peWindow
  } avg; EPS growth ${score > 55 ? ">" : "<"} 10%; volatility ${
    score > 50 ? "moderate" : "high"
  }.`;

  return {
    score: Math.round(score),
    decision,
    confidence,
    drivers,
    notes,
  };
}

export async function getStockMetrics(
  _ticker: string,
  settings: AnalysisSettings
): Promise<StockMetrics> {
  await delay(400 + Math.random() * 200);

  // Valuation metrics
  const peTtm = 15 + Math.random() * 30;
  const peFwd = peTtm * (0.9 + Math.random() * 0.2);
  const peg = 0.5 + Math.random() * 2;
  const evEbitda = 10 + Math.random() * 20;
  const pFcf = 15 + Math.random() * 25;

  const valuation: Metric[] = [
    {
      id: "pe_ttm",
      label: "P/E (TTM)",
      value: peTtm,
      status: peTtm < 22 ? "good" : peTtm < 30 ? "neutral" : "poor",
      threshold: `< 22 vs ${settings.peWindow} avg ${(peTtm * 1.1).toFixed(1)}`,
      explain: "Price/Earnings TTM; lower is cheaper relative to earnings",
      history: generateHistory(peTtm),
    },
    {
      id: "pe_fwd",
      label: "P/E (Forward)",
      value: peFwd,
      status: peFwd < 20 ? "good" : peFwd < 28 ? "neutral" : "poor",
      threshold: `< 20 vs ${settings.peWindow} avg ${(peFwd * 1.1).toFixed(1)}`,
      explain: "Price/Earnings Forward; based on estimated future earnings",
      history: generateHistory(peFwd),
    },
    {
      id: "peg",
      label: "PEG Ratio",
      value: peg,
      status: peg < 1 ? "good" : peg < 2 ? "neutral" : "poor",
      threshold: "< 1.0 preferred",
      explain:
        "P/E to Growth ratio; lower indicates better value relative to growth",
      history: generateHistory(peg),
    },
    {
      id: "ev_ebitda",
      label: `EV/EBITDA (${settings.evEbitdaType.toUpperCase()})`,
      value: evEbitda,
      status: evEbitda < 12 ? "good" : evEbitda < 18 ? "neutral" : "poor",
      threshold: "< 12 preferred",
      explain: "Enterprise Value to EBITDA; measures company valuation",
      history: generateHistory(evEbitda),
    },
    {
      id: "p_fcf",
      label: "P/FCF",
      value: pFcf,
      status: pFcf < 18 ? "good" : pFcf < 25 ? "neutral" : "poor",
      threshold: "< 18 preferred",
      explain:
        "Price to Free Cash Flow; lower indicates better cash generation",
      history: generateHistory(pFcf),
    },
  ];

  // Risk/Return metrics
  const sharpe = 0.5 + Math.random() * 1.5;
  const volatility = 15 + Math.random() * 25;
  const beta = 0.8 + Math.random() * 0.8;
  const maxDrawdown = -(5 + Math.random() * 20);

  const risk: Metric[] = [
    {
      id: "sharpe",
      label: `Sharpe (${settings.sharpeWindow} days, ${
        settings.betaBenchmark
      }, ${(settings.riskFreeRate * 100).toFixed(1)}% RF)`,
      value: sharpe,
      status: sharpe > 1.0 ? "good" : sharpe > 0.5 ? "neutral" : "poor",
      threshold: "> 1.0 preferred",
      explain:
        "(Return - Risk-free rate) / Standard Deviation; higher is better risk-adjusted return",
      history: generateHistory(sharpe),
    },
    {
      id: "volatility",
      label: `Volatility (${settings.volatilityWindow} days)`,
      value: volatility,
      status: volatility < 20 ? "good" : volatility < 35 ? "neutral" : "poor",
      threshold: "< 20% preferred",
      explain: "Standard deviation of returns; measures price volatility",
      history: generateHistory(volatility),
    },
    {
      id: "beta",
      label: `Beta vs ${settings.betaBenchmark}`,
      value: beta,
      status:
        beta > 0.8 && beta < 1.2
          ? "good"
          : beta > 0.6 && beta < 1.4
          ? "neutral"
          : "poor",
      threshold: "0.8 - 1.2 preferred",
      explain:
        "Measure of stock volatility relative to market; 1.0 = market average",
      history: generateHistory(beta),
    },
    {
      id: "max_drawdown",
      label: "Max Drawdown",
      value: maxDrawdown,
      status:
        maxDrawdown > -15 ? "good" : maxDrawdown > -30 ? "neutral" : "poor",
      threshold: "> -15% preferred",
      explain: "Maximum peak-to-trough decline; measures downside risk",
      history: generateHistory(maxDrawdown),
    },
  ];

  // Quality metrics
  const roic = 8 + Math.random() * 20;
  const grossMargin = 30 + Math.random() * 50;
  const operatingMargin = 15 + Math.random() * 30;
  const fcfMargin = 10 + Math.random() * 25;

  const quality: Metric[] = [
    {
      id: "roic",
      label: "ROIC",
      value: roic,
      status: roic > 15 ? "good" : roic > 8 ? "neutral" : "poor",
      threshold: "> 15% preferred",
      explain: "Return on Invested Capital; measures efficiency of capital use",
      history: generateHistory(roic),
    },
    {
      id: "gross_margin",
      label: "Gross Margin",
      value: grossMargin,
      status: grossMargin > 40 ? "good" : grossMargin > 25 ? "neutral" : "poor",
      threshold: "> 40% preferred",
      explain:
        "Gross profit / Revenue; measures profitability after cost of goods",
      history: generateHistory(grossMargin),
    },
    {
      id: "operating_margin",
      label: "Operating Margin",
      value: operatingMargin,
      status:
        operatingMargin > 20
          ? "good"
          : operatingMargin > 10
          ? "neutral"
          : "poor",
      threshold: "> 20% preferred",
      explain: "Operating income / Revenue; measures operational profitability",
      history: generateHistory(operatingMargin),
    },
    {
      id: "fcf_margin",
      label: "FCF Margin",
      value: fcfMargin,
      status: fcfMargin > 15 ? "good" : fcfMargin > 8 ? "neutral" : "poor",
      threshold: "> 15% preferred",
      explain: "Free Cash Flow / Revenue; measures cash generation efficiency",
      history: generateHistory(fcfMargin),
    },
  ];

  // Growth metrics
  const revenueCagr = 5 + Math.random() * 25;
  const epsGrowth1y = -10 + Math.random() * 30;
  const epsGrowth3y = 5 + Math.random() * 20;
  const epsGrowth5y = 8 + Math.random() * 15;

  const growth: Metric[] = [
    {
      id: "revenue_cagr",
      label: "Revenue CAGR (5y)",
      value: revenueCagr,
      status: revenueCagr > 15 ? "good" : revenueCagr > 8 ? "neutral" : "poor",
      threshold: "> 15% preferred",
      explain:
        "Compound Annual Growth Rate of revenue; measures growth trajectory",
      history: generateHistory(revenueCagr),
    },
    {
      id: "eps_growth_1y",
      label: "EPS Growth (1y)",
      value: epsGrowth1y,
      status: epsGrowth1y > 10 ? "good" : epsGrowth1y > 0 ? "neutral" : "poor",
      threshold: "> 10% preferred",
      explain: "Earnings per share growth over 1 year",
      history: generateHistory(epsGrowth1y),
    },
    {
      id: "eps_growth_3y",
      label: `EPS Growth (${settings.epsWindow})`,
      value: epsGrowth3y,
      status: epsGrowth3y > 12 ? "good" : epsGrowth3y > 5 ? "neutral" : "poor",
      threshold: "> 12% preferred",
      explain: `Earnings per share growth over ${settings.epsWindow}`,
      history: generateHistory(epsGrowth3y),
    },
    {
      id: "eps_growth_5y",
      label: "EPS Growth (5y)",
      value: epsGrowth5y,
      status: epsGrowth5y > 10 ? "good" : epsGrowth5y > 5 ? "neutral" : "poor",
      threshold: "> 10% preferred",
      explain: "Earnings per share growth over 5 years",
      history: generateHistory(epsGrowth5y),
    },
  ];

  // Income metrics
  const dividendYield = Math.random() * 5;
  const payoutRatio = Math.random() * 80;
  const dividendGrowth = 2 + Math.random() * 15;

  const income: Metric[] = [
    {
      id: "dividend_yield",
      label: "Dividend Yield",
      value: dividendYield,
      status:
        dividendYield > 3 ? "good" : dividendYield > 1.5 ? "neutral" : "poor",
      threshold: "> 3% preferred",
      explain: "Annual dividend / Stock price; measures income return",
      history: generateHistory(dividendYield),
    },
    {
      id: "payout_ratio",
      label: "Payout Ratio",
      value: payoutRatio,
      status: payoutRatio < 60 ? "good" : payoutRatio < 80 ? "neutral" : "poor",
      threshold: "< 60% preferred",
      explain: "Dividends / Earnings; lower indicates more room for growth",
      history: generateHistory(payoutRatio),
    },
    {
      id: "dividend_growth",
      label: `Dividend Growth (${settings.dividendWindow})`,
      value: dividendGrowth,
      status:
        dividendGrowth > 8 ? "good" : dividendGrowth > 4 ? "neutral" : "poor",
      threshold: "> 8% preferred",
      explain: `Average annual dividend growth over ${settings.dividendWindow}`,
      history: generateHistory(dividendGrowth),
    },
  ];

  // Analyst/News metrics
  const targetGap = -10 + Math.random() * 25;
  const ratingConsensus = 3 + Math.random() * 2;
  const newsSentiment = 40 + Math.random() * 40;

  const analyst: Metric[] = [
    {
      id: "target_gap",
      label: "Price vs Target",
      value: `${targetGap > 0 ? "+" : ""}${targetGap.toFixed(1)}%`,
      status: targetGap > 10 ? "good" : targetGap > 0 ? "neutral" : "poor",
      threshold: "> 10% upside preferred",
      explain: "(Average target price - Current price) / Current price",
      history: generateHistory(Math.abs(targetGap)),
    },
    {
      id: "rating_consensus",
      label: "Rating Consensus",
      value: ratingConsensus.toFixed(1),
      status:
        ratingConsensus > 4 ? "good" : ratingConsensus > 3 ? "neutral" : "poor",
      threshold: "> 4.0 preferred (5 = Strong Buy)",
      explain: "Average analyst rating; 5 = Strong Buy, 1 = Strong Sell",
      history: generateHistory(ratingConsensus),
    },
    {
      id: "news_sentiment",
      label: "News Sentiment",
      value: newsSentiment,
      status:
        newsSentiment > 60 ? "good" : newsSentiment > 40 ? "neutral" : "poor",
      threshold: "> 60% positive preferred",
      explain: "Percentage of positive news sentiment over recent period",
      history: generateHistory(newsSentiment),
    },
  ];

  return {
    valuation,
    risk,
    quality,
    growth,
    income,
    analyst,
  };
}
